import * as cron from 'node-cron';
import { PrismaClient, CrawlStatus, Market } from '@prisma/client';
import { crawlByMarkets } from './engine';
import { closeBrowser } from './processors/scrape.processor';
import { runAging } from './pipeline/aging';
import { runDailyMaintenance, saveDailyReport } from './maintenance';

interface ScheduledJob {
  name: string;
  task: cron.ScheduledTask;
}

const scheduledJobs: ScheduledJob[] = [];

const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 dakika

/**
 * 10 dakikadan eski RUNNING log'ları FAILED olarak işaretle.
 */
async function cleanupStaleRunningLogs(prisma: PrismaClient): Promise<number> {
  const threshold = new Date(Date.now() - STALE_THRESHOLD_MS);

  const result = await prisma.crawlLog.updateMany({
    where: {
      status: CrawlStatus.RUNNING,
      createdAt: { lt: threshold },
    },
    data: {
      status: CrawlStatus.FAILED,
      errorMessage: 'Stale: process crashed without cleanup',
    },
  });

  if (result.count > 0) {
    console.log(`[Scheduler] Cleaned up ${result.count} stale RUNNING logs`);
  }

  return result.count;
}

/**
 * Crawl schedule: 31 markets spread across 24 hours
 * Max 2 markets per slot (~800 sources), 6 concurrent workers
 * (Contabo VPS: 4 vCPU, 8GB RAM)
 *
 * 00:00 → TR, DE        01:00 → UK, FR        02:00 → IN
 * 03:00 → US, CA        04:00 → BR, PT        05:00 → JP
 * 06:00 → MX, CO        07:00 → RU, EG        08:00 → ES, IT
 * 09:00 → KR, PH        10:00 → AU, TH        11:00 → ID, VN
 * 12:00 → MY, PK        13:00 → SA, AE        14:00 → NL, PL
 * 15:00 → SE, ZA        16:00 → AR
 * 17:00 → Daily Maintenance (15 tasks)
 * 18:00-22:00 → boş (headroom)
 * 23:00 → Aging + Cleanup
 */
const MARKET_SCHEDULE: Array<{ cron: string; markets: Market[] }> = [
  { cron: '0 0 * * *',  markets: ['TR', 'DE'] },
  { cron: '0 1 * * *',  markets: ['UK', 'FR'] },
  { cron: '0 2 * * *',  markets: ['IN'] },
  { cron: '0 3 * * *',  markets: ['US', 'CA'] },
  { cron: '0 4 * * *',  markets: ['BR', 'PT'] },
  { cron: '0 5 * * *',  markets: ['JP'] },
  { cron: '0 6 * * *',  markets: ['MX', 'CO'] },
  { cron: '0 7 * * *',  markets: ['RU', 'EG'] },
  { cron: '0 8 * * *',  markets: ['ES', 'IT'] },
  { cron: '0 9 * * *',  markets: ['KR', 'PH'] },
  { cron: '0 10 * * *', markets: ['AU', 'TH'] },
  { cron: '0 11 * * *', markets: ['ID', 'VN'] },
  { cron: '0 12 * * *', markets: ['MY', 'PK'] },
  { cron: '0 13 * * *', markets: ['SA', 'AE'] },
  { cron: '0 14 * * *', markets: ['NL', 'PL'] },
  { cron: '0 15 * * *', markets: ['SE', 'ZA'] },
  { cron: '0 16 * * *', markets: ['AR'] },
];

export async function startScheduler(prisma: PrismaClient): Promise<void> {
  // Clear existing jobs
  stopScheduler();

  // Başlangıçta zombie log'ları temizle
  await cleanupStaleRunningLogs(prisma);

  const totalSources = await prisma.crawlSource.count({ where: { isActive: true } });
  console.log(`\n[Scheduler] ${totalSources} total active sources across all markets`);

  // Register market-based crawl jobs
  for (const slot of MARKET_SCHEDULE) {
    const sourceCount = await prisma.crawlSource.count({
      where: { isActive: true, market: { in: slot.markets } },
    });

    const task = cron.schedule(slot.cron, async () => {
      const label = slot.markets.join(', ');
      console.log(`\n[Scheduler] Starting crawl: ${label} (${sourceCount} sources)...`);

      await cleanupStaleRunningLogs(prisma);

      try {
        const results = await crawlByMarkets(prisma, slot.markets);

        const succeeded = results.filter((r) => r.status === CrawlStatus.SUCCESS).length;
        const partial = results.filter((r) => r.status === CrawlStatus.PARTIAL).length;
        const failed = results.filter((r) => r.status === CrawlStatus.FAILED).length;
        const totalNew = results.reduce((sum, r) => sum + r.jobsNew, 0);

        console.log(
          `[Scheduler] ${label} complete: ${succeeded} success, ${partial} partial, ${failed} failed, ${totalNew} new`,
        );
      } catch (err) {
        console.error(`[Scheduler] ${label} error: ${(err as Error).message}`);
      } finally {
        await closeBrowser();
      }
    });

    scheduledJobs.push({ name: `${slot.markets.join(', ')} (${sourceCount})`, task });
    console.log(`  - ${slot.cron} → ${slot.markets.join(', ')} (${sourceCount} sources)`);
  }

  // Daily maintenance at 17:00 UTC (after all crawls complete, before aging)
  const maintenanceTask = cron.schedule('0 17 * * *', async () => {
    console.log('[Scheduler] Running daily maintenance...');
    try {
      const report = await runDailyMaintenance(prisma);
      await saveDailyReport(prisma, report);
      const s = report.summary;
      console.log(
        `[Scheduler] Maintenance done: ${s.whiteCollarExpired} white-collar expired, ${s.deadlineExpired} deadline expired, ` +
        `${s.invalidSalariesFixed} salaries fixed, ${s.staleCompaniesDeactivated} companies deactivated, ` +
        `${s.brandsCleaned} cleaned, ${s.brandsMerged} merged, ${s.sourcesDeactivated} sources off, ` +
        `${s.orphanListingsExpired + s.notFoundListingsExpired} job listings expired, ${s.oldLogsDeleted} logs deleted`,
      );
    } catch (err) {
      console.error(`[Scheduler] Maintenance error: ${(err as Error).message}`);
    }
  });
  scheduledJobs.push({ name: 'Daily Maintenance', task: maintenanceTask });
  console.log('  - 0 17 * * * → Daily maintenance (15 tasks)');

  // Daily aging job at 23:00 UTC (after all crawls complete)
  const agingTask = cron.schedule('0 23 * * *', async () => {
    console.log('[Scheduler] Running aging...');
    try {
      // Ping DB first to wake Neon from auto-suspend before heavy aging queries
      await prisma.$queryRaw`SELECT 1`;
      const count = await runAging(prisma);
      console.log(`[Scheduler] Aging complete: ${count} expired`);
    } catch (err) {
      console.error(`[Scheduler] Aging error: ${(err as Error).message}`);
    }
  });

  scheduledJobs.push({ name: 'Aging', task: agingTask });
  console.log('  - 0 23 * * * → Aging (daily)');

  // ─── Scheduled Notifications (Market TZ-Aware) ────────

  const API_BASE = process.env.API_URL || 'http://localhost:3000';
  const INTERNAL_KEY = process.env.INTERNAL_API_KEY || '';

  // Each market gets notifications at their local 09:00
  // Map: UTC hour → markets that should receive notifications at that hour
  const MARKET_NOTIF_SCHEDULE: Record<number, Market[]> = {
    0:  ['JP', 'KR'],           // 09:00 JST/KST
    1:  ['PH', 'MY'],           // 09:00 PHT/MYT
    2:  ['TH', 'ID', 'VN'],     // 09:00 ICT/WIB
    3:  ['IN'],                 // 09:00 IST (~03:30 but use 03:00)
    4:  ['PK'],                 // 09:00 PKT
    5:  ['AE'],                 // 09:00 GST
    6:  ['SA', 'RU', 'TR'],     // 09:00 AST/MSK/TRT
    7:  ['EG', 'DE', 'FR', 'IT', 'ES', 'PL', 'NL', 'SE', 'ZA'], // 09:00 EET/CEST/SAST
    8:  ['UK', 'PT'],           // 09:00 BST/WEST
    12: ['BR', 'AR'],           // 09:00 BRT/ART
    13: ['US', 'CA'],           // 09:00 EST (avg)
    14: ['CO'],                 // 09:00 COT
    15: ['MX'],                 // 09:00 CST
    23: ['AU'],                 // 09:00 AEST (prev day UTC)
  };

  // Hourly cron: check which markets should receive notifications now
  const dailyNotifTask = cron.schedule('0 * * * *', async () => {
    const currentHour = new Date().getUTCHours();
    const markets = MARKET_NOTIF_SCHEDULE[currentHour];
    if (!markets || markets.length === 0) return;

    const marketParam = markets.join(',');
    console.log(`[Scheduler] Sending notifications for ${marketParam} (UTC ${currentHour}:00 = local 09:00)...`);
    try {
      const [winBack, expiring]: any[] = await Promise.all([
        fetch(`${API_BASE}/internal/scheduled/win-back?markets=${marketParam}`, {
          method: 'POST',
          headers: { 'x-internal-key': INTERNAL_KEY },
        }).then(r => r.json()),
        fetch(`${API_BASE}/internal/scheduled/expiring-favorites?markets=${marketParam}`, {
          method: 'POST',
          headers: { 'x-internal-key': INTERNAL_KEY },
        }).then(r => r.json()),
      ]);
      console.log(`[Scheduler] ${marketParam} — Win-back: ${winBack?.data?.sent ?? 0}, Expiring: ${expiring?.data?.sent ?? 0}`);
    } catch (err) {
      console.error(`[Scheduler] Notifications error (${marketParam}): ${(err as Error).message}`);
    }
  });
  scheduledJobs.push({ name: 'Hourly Market Notifications', task: dailyNotifTask });
  console.log('  - 0 * * * * → Market TZ-aware notifications (hourly check)');

  // Weekly summary: also TZ-aware, Sundays only
  const weeklyNotifTask = cron.schedule('0 * * * 0', async () => {
    const currentHour = new Date().getUTCHours();
    const markets = MARKET_NOTIF_SCHEDULE[currentHour];
    if (!markets || markets.length === 0) return;

    const marketParam = markets.join(',');
    console.log(`[Scheduler] Sending weekly summary for ${marketParam}...`);
    try {
      const result: any = await fetch(`${API_BASE}/internal/scheduled/weekly-summary?markets=${marketParam}`, {
        method: 'POST',
        headers: { 'x-internal-key': INTERNAL_KEY },
      }).then(r => r.json());
      console.log(`[Scheduler] Weekly summary ${marketParam}: ${result?.data?.sent ?? 0} sent`);
    } catch (err) {
      console.error(`[Scheduler] Weekly summary error (${marketParam}): ${(err as Error).message}`);
    }
  });
  scheduledJobs.push({ name: 'Weekly Summary (TZ-aware)', task: weeklyNotifTask });
  console.log('  - 0 * * * 0 → Weekly summary (Sundays, TZ-aware)');

  // ─── Neon Keep-Alive ──────────────────────────────────
  // Neon free tier auto-suspends compute after 5min inactivity.
  // Ping every 4 min to keep it awake during crawl windows.
  const keepAliveTask = cron.schedule('*/4 * * * *', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      console.error(`[KeepAlive] DB ping failed: ${(err as Error).message}`);
    }
  });
  scheduledJobs.push({ name: 'Neon Keep-Alive', task: keepAliveTask });
  console.log('  - */4 * * * * → Neon DB keep-alive ping');

  // ─── Supabase Keep-Alive ──────────────────────────────
  // Supabase free tier pauses projects after 7 days of inactivity.
  // Ping every 6 hours to prevent auto-pause.
  const supabaseKeepAlive = cron.schedule('0 */6 * * *', async () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) return;
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: { apikey: process.env.SUPABASE_SERVICE_KEY || '' },
        signal: AbortSignal.timeout(10_000),
      });
      console.log(`[KeepAlive] Supabase ping: ${res.status}`);
    } catch (err) {
      console.error(`[KeepAlive] Supabase ping failed: ${(err as Error).message}`);
    }
  });
  scheduledJobs.push({ name: 'Supabase Keep-Alive', task: supabaseKeepAlive });
  console.log('  - 0 */6 * * * → Supabase keep-alive ping');

  // ─── Bulk Import Jobs (API aggregators & Gov APIs) ─────
  // These run independently from the crawl schedule

  // Daily Adzuna import at 06:00 UTC
  const adzunaTask = cron.schedule('0 6 * * *', async () => {
    console.log('[Scheduler] Running Adzuna bulk import...');
    try {
      const { execSync } = require('child_process');
      execSync(
        'npx ts-node --transpile-only src/bulk-import-adzuna.ts ALL',
        {
          cwd: __dirname.replace(/\/dist$/, '').replace(/\\dist$/, ''),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
          timeout: 3600_000, // 1 hour max
          stdio: 'inherit',
        },
      );
      console.log('[Scheduler] Adzuna import complete');
    } catch (err) {
      console.error(`[Scheduler] Adzuna error: ${(err as Error).message?.substring(0, 200)}`);
    }
  });
  scheduledJobs.push({ name: 'Adzuna Daily Import', task: adzunaTask });
  console.log('  - 0 6 * * * → Adzuna bulk import (daily, 18 countries)');

  // Weekly Sweden Arbetsförmedlingen at Tuesday 03:30 UTC
  const swedenTask = cron.schedule('30 3 * * 2', async () => {
    console.log('[Scheduler] Running Sweden Arbetsförmedlingen import...');
    try {
      const { execSync } = require('child_process');
      execSync(
        'npx ts-node --transpile-only src/bulk-import-arbetsformedlingen.ts',
        {
          cwd: __dirname.replace(/\/dist$/, '').replace(/\\dist$/, ''),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
          timeout: 1800_000,
          stdio: 'inherit',
        },
      );
      console.log('[Scheduler] Sweden import complete');
    } catch (err) {
      console.error(`[Scheduler] Sweden error: ${(err as Error).message?.substring(0, 200)}`);
    }
  });
  scheduledJobs.push({ name: 'Sweden Weekly Import', task: swedenTask });
  console.log('  - 30 3 * * 2 → Sweden Arbetsförmedlingen (weekly Tue)');

  // Weekly Germany Bundesagentur at Thursday 02:30 UTC
  const germanyTask = cron.schedule('30 2 * * 4', async () => {
    console.log('[Scheduler] Running Germany Bundesagentur import...');
    try {
      const { execSync } = require('child_process');
      execSync(
        'npx ts-node --transpile-only src/bulk-import-bundesagentur.ts',
        {
          cwd: __dirname.replace(/\/dist$/, '').replace(/\\dist$/, ''),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
          timeout: 3600_000,
          stdio: 'inherit',
        },
      );
      console.log('[Scheduler] Germany import complete');
    } catch (err) {
      console.error(`[Scheduler] Germany error: ${(err as Error).message?.substring(0, 200)}`);
    }
  });
  scheduledJobs.push({ name: 'Germany Weekly Import', task: germanyTask });
  console.log('  - 30 2 * * 4 → Germany Bundesagentur (weekly Thu)');

  // Monthly Canada Job Bank CSV at 1st of month 01:30 UTC
  const canadaTask = cron.schedule('30 1 1 * *', async () => {
    console.log('[Scheduler] Running Canada Job Bank CSV import...');
    try {
      const { execSync } = require('child_process');
      execSync(
        'npx ts-node --transpile-only src/bulk-import-jobbank-ca.ts',
        {
          cwd: __dirname.replace(/\/dist$/, '').replace(/\\dist$/, ''),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
          timeout: 1800_000,
          stdio: 'inherit',
        },
      );
      console.log('[Scheduler] Canada import complete');
    } catch (err) {
      console.error(`[Scheduler] Canada error: ${(err as Error).message?.substring(0, 200)}`);
    }
  });
  scheduledJobs.push({ name: 'Canada Monthly Import', task: canadaTask });
  console.log('  - 30 1 1 * * → Canada Job Bank CSV (monthly 1st)');

  // Weekly CareerJet at Sunday 05:30 UTC
  const careerjetTask = cron.schedule('30 5 * * 0', async () => {
    console.log('[Scheduler] Running CareerJet bulk import...');
    try {
      const { execSync } = require('child_process');
      execSync(
        'npx ts-node --transpile-only src/bulk-import-careerjet.ts ALL',
        {
          cwd: __dirname.replace(/\/dist$/, '').replace(/\\dist$/, ''),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
          timeout: 3600_000,
          stdio: 'inherit',
        },
      );
      console.log('[Scheduler] CareerJet import complete');
    } catch (err) {
      console.error(`[Scheduler] CareerJet error: ${(err as Error).message?.substring(0, 200)}`);
    }
  });
  scheduledJobs.push({ name: 'CareerJet Weekly Import', task: careerjetTask });
  console.log('  - 30 5 * * 0 → CareerJet bulk import (weekly Sun)');

  // Weekly USAJobs at Wednesday 07:30 UTC
  const usajobsTask = cron.schedule('30 7 * * 3', async () => {
    console.log('[Scheduler] Running USAJobs bulk import...');
    try {
      const { execSync } = require('child_process');
      execSync(
        'npx ts-node --transpile-only src/bulk-import-usajobs.ts',
        {
          cwd: __dirname.replace(/\/dist$/, '').replace(/\\dist$/, ''),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
          timeout: 1800_000,
          stdio: 'inherit',
        },
      );
      console.log('[Scheduler] USAJobs import complete');
    } catch (err) {
      console.error(`[Scheduler] USAJobs error: ${(err as Error).message?.substring(0, 200)}`);
    }
  });
  scheduledJobs.push({ name: 'USAJobs Weekly Import', task: usajobsTask });
  console.log('  - 30 7 * * 3 → USAJobs bulk import (weekly Wed)');

  // Weekly Russia Trudvsem at Friday 04:30 UTC
  const trudvsemTask = cron.schedule('30 4 * * 5', async () => {
    console.log('[Scheduler] Running Trudvsem.ru bulk import...');
    try {
      const { execSync } = require('child_process');
      execSync(
        'npx ts-node --transpile-only src/bulk-import-trudvsem.ts',
        {
          cwd: __dirname.replace(/\/dist$/, '').replace(/\\dist$/, ''),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
          timeout: 3600_000,
          stdio: 'inherit',
        },
      );
      console.log('[Scheduler] Trudvsem import complete');
    } catch (err) {
      console.error(`[Scheduler] Trudvsem error: ${(err as Error).message?.substring(0, 200)}`);
    }
  });
  scheduledJobs.push({ name: 'Russia Trudvsem Weekly Import', task: trudvsemTask });
  console.log('  - 30 4 * * 5 → Russia Trudvsem.ru (weekly Fri)');

  // Weekly Turkey İŞKUR at Saturday 08:30 UTC
  const iskurTask = cron.schedule('30 8 * * 6', async () => {
    console.log('[Scheduler] Running İŞKUR bulk import...');
    try {
      const { execSync } = require('child_process');
      execSync(
        'npx ts-node --transpile-only src/bulk-import-iskur.ts',
        {
          cwd: __dirname.replace(/\/dist$/, '').replace(/\\dist$/, ''),
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
          timeout: 3600_000,
          stdio: 'inherit',
        },
      );
      console.log('[Scheduler] İŞKUR import complete');
    } catch (err) {
      console.error(`[Scheduler] İŞKUR error: ${(err as Error).message?.substring(0, 200)}`);
    }
  });
  scheduledJobs.push({ name: 'Turkey İŞKUR Weekly Import', task: iskurTask });
  console.log('  - 30 8 * * 6 → Turkey İŞKUR (weekly Sat)');

  console.log('[Scheduler] All jobs registered\n');
}

export function stopScheduler(): void {
  for (const job of scheduledJobs) {
    job.task.stop();
  }
  scheduledJobs.length = 0;
}
