/**
 * bulk-import-jooble.ts — Bulk Import from Jooble API (31 countries)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-jooble.ts [market|ALL]
 *
 * Jooble API: POST https://jooble.org/api/{api_key}
 * - Body: { keywords, location, page, ResultOnPage }
 * - Response: { totalCount, jobs: [{ title, location, snippet, salary, source, type, link, company, updated, id }] }
 * - Registration: https://jooble.org/api/about (manual, Cloudflare protected)
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY || '';
const API_URL = `https://jooble.org/api/${JOOBLE_API_KEY}`;
const MAX_PAGES = 10; // 10 pages × 20 = 200 per keyword, 35 keywords = 7,000 max per market
const RESULTS_PER_PAGE = 20; // Jooble default
const REQUEST_DELAY_MS = 800; // Be respectful — 500 requests/day limit
const REQUEST_TIMEOUT_MS = 20_000;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/[çć]/g, 'c').replace(/[şś]/g, 's').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/warehouse|lager|logist|driver|chauffeur|courier|delivery|shipping|freight|forklift|truck|postal|packer|kargo|şoför|운전|배달|tài xế|motorista|conductor/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|fabrik|usine|fábrica|operario|생산|sản xuất|pabrik/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop|vendeur|verkäuf|cajero|supermarket|매장|cửa hàng|kasir/i.test(t)) return 'RETAIL';
  if (/construct|builder|mason|carpenter|plumber|roofer|bricklayer|albañil|pedreiro|건설|thợ xây|tukang/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista|조리|đầu bếp|koki|cocinero/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|workshop|정비|thợ sửa|montir|mecánico/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|garment|fabric|봉제|may mặc|tekstil/i.test(t)) return 'TEXTILE';
  if (/nurse|hospital|care.*assist|patient|health|carer|간호|y tá|enfermero/i.test(t)) return 'HEALTHCARE';
  if (/hotel|cleaning|housekeeper|cleaner|청소|khách sạn|limpieza/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agricult|garden|landscape|농업|nông nghiệp|pertanian/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|watchman|경비|bảo vệ|satpam|vigilante/i.test(t)) return 'SECURITY_SERVICES';
  if (/janitor|facility|maintenance|building|관리|vệ sinh|portero/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/weld|metal|steel|iron|forge|용접|hàn|las|soldador/i.test(t)) return 'METAL_STEEL';
  return 'OTHER';
}

interface MarketConfig {
  market: Market;
  location: string; // Country name for Jooble location field
  keywords: string[];
}

// ─── Market configs with localized blue-collar keywords ─────────────

// English keywords work best with Jooble API across all markets.
// Use English location names — Jooble API doesn't support local language locations well.
const ENGLISH_KEYWORDS = [
  'warehouse worker', 'truck driver', 'forklift operator', 'delivery driver',
  'electrician', 'welder', 'plumber', 'carpenter', 'mason', 'painter',
  'cook', 'chef', 'kitchen helper', 'waiter', 'baker',
  'cleaner', 'janitor', 'housekeeper', 'laundry worker',
  'security guard', 'security officer',
  'factory worker', 'machine operator', 'production worker', 'assembly worker', 'packer',
  'mechanic', 'auto mechanic', 'technician',
  'construction worker', 'labourer', 'general worker',
  'caregiver', 'care assistant', 'nursing aide',
  'gardener', 'landscaper', 'farm worker',
  'cashier', 'store worker', 'retail worker',
];

const MARKET_CONFIGS: MarketConfig[] = [
  // ─── Markets where English keywords work well ───
  { market: 'VN', location: 'Vietnam', keywords: ENGLISH_KEYWORDS },
  { market: 'KR', location: 'South Korea', keywords: ENGLISH_KEYWORDS },
  { market: 'PK', location: 'Pakistan', keywords: ENGLISH_KEYWORDS },
  { market: 'PT', location: 'Portugal', keywords: ENGLISH_KEYWORDS },
  { market: 'EG', location: 'Egypt', keywords: ENGLISH_KEYWORDS },
  { market: 'ID', location: 'Indonesia', keywords: ENGLISH_KEYWORDS },
  { market: 'JP', location: 'Japan', keywords: ENGLISH_KEYWORDS },
  { market: 'ES', location: 'Spain', keywords: ENGLISH_KEYWORDS },
  { market: 'TH', location: 'Thailand', keywords: ENGLISH_KEYWORDS },
  { market: 'NL', location: 'Netherlands', keywords: ENGLISH_KEYWORDS },
  { market: 'PL', location: 'Poland', keywords: ENGLISH_KEYWORDS },
  { market: 'AU', location: 'Australia', keywords: ENGLISH_KEYWORDS },
  { market: 'IT', location: 'Italy', keywords: ENGLISH_KEYWORDS },
  { market: 'TR', location: 'Turkey', keywords: ENGLISH_KEYWORDS },
  { market: 'UK', location: 'United Kingdom', keywords: ENGLISH_KEYWORDS },
  { market: 'US', location: 'United States', keywords: ENGLISH_KEYWORDS },
  { market: 'DE', location: 'Germany', keywords: ENGLISH_KEYWORDS },
  { market: 'FR', location: 'France', keywords: ENGLISH_KEYWORDS },
  { market: 'BR', location: 'Brazil', keywords: ENGLISH_KEYWORDS },
  { market: 'IN', location: 'India', keywords: ENGLISH_KEYWORDS },
  { market: 'MX', location: 'Mexico', keywords: ENGLISH_KEYWORDS },
  { market: 'RU', location: 'Russia', keywords: ENGLISH_KEYWORDS },
  { market: 'SA', location: 'Saudi Arabia', keywords: ENGLISH_KEYWORDS },
  { market: 'AE', location: 'United Arab Emirates', keywords: ENGLISH_KEYWORDS },
  { market: 'CO', location: 'Colombia', keywords: ENGLISH_KEYWORDS },
  { market: 'AR', location: 'Argentina', keywords: ENGLISH_KEYWORDS },
  { market: 'CA', location: 'Canada', keywords: ENGLISH_KEYWORDS },
  { market: 'SE', location: 'Sweden', keywords: ENGLISH_KEYWORDS },
  { market: 'ZA', location: 'South Africa', keywords: ENGLISH_KEYWORDS },
  { market: 'PH', location: 'Philippines', keywords: ENGLISH_KEYWORDS },
  { market: 'MY', location: 'Malaysia', keywords: ENGLISH_KEYWORDS },
];

// ─── Source management ───────────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `jooble-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'Jooble' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Jooble', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Jooble',
          slug: `jooble-${market.toLowerCase()}-${Date.now().toString(36)}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://jooble.org',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `Jooble ${market} Job Listings`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: ['https://jooble.org'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Jooble API fetch ────────────────────────────────────────────────

async function fetchJooble(keyword: string, location: string, page: number): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: keyword,
        location,
        page: String(page),
      }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Import ──────────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function importMarket(config: MarketConfig, stats: ImportStats): Promise<number> {
  const source = await getOrCreateSource(config.market);
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const keyword of config.keywords) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchJooble(keyword, config.location, page);
        const jobs = data.jobs || [];
        const totalCount = data.totalCount || 0;
        stats.fetched += jobs.length;

        for (const job of jobs) {
          const jobId = String(job.id || '');
          const jobUrl = job.link || '';
          if (!jobId || !jobUrl) { stats.skipped++; continue; }
          if (seen.has(jobId)) { stats.skipped++; continue; }
          seen.add(jobId);

          const title = job.title || keyword;
          const canonicalUrl = jobUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`jooble:${config.market}:${jobId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const desc = job.snippet?.substring(0, 5000) || null;
          const company = job.company || null;
          const location = job.location || null;

          if (!isBlueCollar(title, desc)) {
            stats.skipped++;
            continue;
          }

          // Parse salary if available (format: "val1 - val2 currency")
          let salaryMin: number | null = null;
          let salaryMax: number | null = null;
          if (job.salary) {
            const salaryMatch = job.salary.match(/([0-9,.]+)\s*[-–]\s*([0-9,.]+)/);
            if (salaryMatch) {
              salaryMin = Math.round(parseFloat(salaryMatch[1].replace(/[,]/g, '')));
              salaryMax = Math.round(parseFloat(salaryMatch[2].replace(/[,]/g, '')));
            }
          }

          batch.push({
            title,
            slug,
            sourceUrl: jobUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: config.market,
            city: location,
            sector: detectSector(title, desc),
            description: desc,
            salaryMin,
            salaryMax,
            postedDate: job.updated ? new Date(job.updated) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        hasMore = jobs.length >= RESULTS_PER_PAGE && page < MAX_PAGES && (page * RESULTS_PER_PAGE) < totalCount;
        page++;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429') || msg.includes('403')) {
          console.warn(`  [${config.market}] Rate limited/blocked, waiting 120s...`);
          await delay(120_000);
        } else {
          console.warn(`  [${config.market}] "${keyword}" p${page}: ${msg.substring(0, 80)}`);
          stats.errors++;
          hasMore = false;
        }
      }
    }
  }

  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  return seen.size;
}

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!JOOBLE_API_KEY) {
    console.error('❌ JOOBLE_API_KEY not set');
    console.error('   Register at: https://jooble.org/api/about');
    console.error('   Then: export JOOBLE_API_KEY=your_key_here');
    process.exit(1);
  }

  const target = (process.argv[2] || 'ALL').toUpperCase();

  console.log(`\n🟣 Mavi Yaka — Jooble Bulk Import`);
  console.log(`Target: ${target}`);
  console.log(`Markets: ${MARKET_CONFIGS.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };

  const configs = target === 'ALL'
    ? MARKET_CONFIGS
    : MARKET_CONFIGS.filter(c => c.market === target);

  if (configs.length === 0) {
    console.error(`No config found for "${target}"`);
    return;
  }

  try {
    for (const config of configs) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`[${config.market}] Starting... (${config.keywords.length} keywords, location: ${config.location})`);

      const unique = await importMarket(config, stats);
      console.log(`[${config.market}] Done: ${unique.toLocaleString()} unique`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
  console.log(`  Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

main().catch(console.error);
