/**
 * Crawl all uncrawled categories for a given market.
 * Usage:
 *   npx ts-node --transpile-only src/crawl-all-market.ts DE
 *   npx ts-node --transpile-only src/crawl-all-market.ts UK
 *   npx ts-node --transpile-only src/crawl-all-market.ts US [skip-category1] [skip-category2]
 */
import './config';
import { PrismaClient } from '@prisma/client';
import { crawlSource, cleanupStaleLogs } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const p = new PrismaClient();

/** Wait for DB to be reachable, retrying up to maxRetries times */
async function waitForDb(maxRetries = 5, delayMs = 10000): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await p.$queryRaw`SELECT 1`;
      return;
    } catch (err) {
      console.warn(`[DB] Connection attempt ${attempt}/${maxRetries} failed: ${(err as Error).message}`);
      if (attempt === maxRetries) throw new Error(`Cannot reach database after ${maxRetries} attempts`);
      console.log(`[DB] Retrying in ${delayMs / 1000}s...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

async function main() {
  const market = process.argv[2]?.toUpperCase();
  if (!market || !['US', 'DE', 'UK', 'TR', 'IN', 'BR', 'ID', 'RU', 'MX', 'JP', 'PH', 'TH', 'CA', 'AU', 'FR', 'IT', 'ES', 'EG', 'SA', 'KR', 'AR', 'AE', 'VN', 'PL', 'MY', 'CO', 'ZA', 'PT', 'NL', 'PK', 'SE'].includes(market)) {
    console.error('Usage: npx ts-node --transpile-only src/crawl-all-market.ts <MARKET> [skip-categories...]');
    console.error('Markets: US, DE, UK, TR, IN, BR, ID, RU, MX, JP, PH, TH, CA, AU, FR, IT, ES, EG, SA, KR, AR, AE, VN, PL, MY, CO, ZA, PT, NL, PK, SE');
    process.exit(1);
  }

  const skipCategories = process.argv.slice(3);

  // Wait for DB to be reachable (handles pool exhaustion during parallel crawls)
  await waitForDb();

  // Clean up any stale RUNNING logs (stuck for >10 minutes)
  await cleanupStaleLogs(p);

  // Get all categories that have active sources for this market
  const categories = await p.$queryRawUnsafe<{ slug: string; count: number }[]>(
    `SELECT c.slug, COUNT(cs.id)::int as count
    FROM crawl_sources cs
    JOIN brands b ON cs.brand_id = b.id
    JOIN categories c ON b.category_id = c.id
    WHERE b.market = $1 AND cs.is_active = true
    GROUP BY c.slug
    ORDER BY c.slug`,
    market,
  );

  console.log(`\n🌍 Market: ${market}`);
  console.log(`📦 Categories: ${categories.length}`);
  console.log(`📊 Total sources: ${categories.reduce((s, c) => s + c.count, 0)}`);
  if (skipCategories.length > 0) {
    console.log(`⏩ Skipping: ${skipCategories.join(', ')}`);
  }
  console.log('');

  const grandResults: { category: string; found: number; new_: number; failed: number }[] = [];

  for (const cat of categories) {
    if (skipCategories.includes(cat.slug)) {
      console.log(`\n⏩ Skipping ${cat.slug} (${cat.count} sources)\n`);
      continue;
    }

    const allSources = await p.crawlSource.findMany({
      where: {
        isActive: true,
        market: market as any,
        brand: { category: { slug: cat.slug } },
      },
      include: { brand: { select: { name: true } } },
      orderBy: { brand: { name: 'asc' } },
    });

    // Skip sources already crawled in the last 24h (resume support)
    const recentLogs = await p.crawlLog.findMany({
      where: {
        sourceId: { in: allSources.map(s => s.id) },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        status: { not: 'RUNNING' },
      },
      select: { sourceId: true },
    });
    const crawledIds = new Set(recentLogs.map(l => l.sourceId));
    const sources = allSources.filter(s => !crawledIds.has(s.id));

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  CATEGORY: ${cat.slug} (${sources.length}/${allSources.length} sources, ${crawledIds.size} already crawled)`);
    console.log(`${'='.repeat(60)}\n`);

    const results: { brand: string; found: number; new_: number; status: string; ms: number }[] = [];

    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      console.log(`\n[${i + 1}/${sources.length}] Crawling: ${s.brand.name}...`);

      // Periodically clean up stale RUNNING logs (every 20 sources)
      if (i > 0 && i % 20 === 0) {
        await cleanupStaleLogs(p);
      }

      try {
        const r = await crawlSource(p, s.id);
        results.push({
          brand: s.brand.name,
          found: r.campaignsFound,
          new_: r.campaignsNew,
          status: r.status,
          ms: r.durationMs,
        });
        console.log(`  → ${r.status}: found=${r.campaignsFound}, new=${r.campaignsNew} (${(r.durationMs / 1000).toFixed(1)}s)`);
      } catch (err) {
        console.error(`  → ERROR: ${(err as Error).message}`);
        results.push({ brand: s.brand.name, found: 0, new_: 0, status: 'ERROR', ms: 0 });
      }
    }

    // Category summary
    const totalFound = results.reduce((s, r) => s + r.found, 0);
    const totalNew = results.reduce((s, r) => s + r.new_, 0);
    const failed = results.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length;
    console.log(`\n--- ${cat.slug} SUMMARY: ${totalFound} found, ${totalNew} new, ${failed} failed ---\n`);

    grandResults.push({ category: cat.slug, found: totalFound, new_: totalNew, failed });
  }

  // Grand summary
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${market} GRAND SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  for (const r of grandResults) {
    console.log(`  ${r.category}: ${r.found} found, ${r.new_} new, ${r.failed} failed`);
  }
  const gFound = grandResults.reduce((s, r) => s + r.found, 0);
  const gNew = grandResults.reduce((s, r) => s + r.new_, 0);
  const gFailed = grandResults.reduce((s, r) => s + r.failed, 0);
  console.log(`  TOTAL: ${gFound} found, ${gNew} new, ${gFailed} failed`);

  await closeBrowser();
  await p.$disconnect();
  console.log(`\n✅ All ${market} categories crawled!\n`);
}

main().catch(async (e) => {
  console.error(e);
  await closeBrowser();
  await p.$disconnect();
});
