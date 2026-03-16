/**
 * crawl-platforms.ts — Crawl job platform sources (Adzuna + Jooble) for all or specific markets
 * Usage:
 *   npx ts-node --transpile-only src/crawl-platforms.ts          # All markets
 *   npx ts-node --transpile-only src/crawl-platforms.ts TR US DE  # Specific markets
 */
import './config';
import { PrismaClient } from '@prisma/client';
import { crawlSource } from './engine';

const p = new PrismaClient();

const ALL_MARKETS = [
  'TR', 'US', 'DE', 'UK', 'IN', 'BR', 'ID', 'RU', 'MX', 'JP',
  'PH', 'TH', 'CA', 'AU', 'FR', 'IT', 'ES', 'EG', 'SA', 'KR',
  'AR', 'AE', 'VN', 'PL', 'MY', 'CO', 'ZA', 'PT', 'NL', 'PK', 'SE',
];

async function main() {
  const args = process.argv.slice(2).map(a => a.toUpperCase());
  const markets = args.length > 0 ? args : ALL_MARKETS;

  console.log(`\nCrawling JOB_PLATFORM sources for: ${markets.join(', ')}\n`);

  const results: { market: string; found: number; new_: number; status: string }[] = [];

  for (const market of markets) {
    // Find all JOB_PLATFORM sources for this market
    const sources = await p.crawlSource.findMany({
      where: {
        market: market as any,
        type: 'JOB_PLATFORM',
        isActive: true,
      },
      include: { company: { select: { name: true } } },
    });

    if (sources.length === 0) {
      console.log(`${market}: No platform sources found`);
      continue;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`  ${market}: ${sources.length} platform sources`);
    console.log(`${'='.repeat(50)}`);

    for (const source of sources) {
      console.log(`\n  [${market}] Crawling: ${source.company.name}...`);
      try {
        const r = await crawlSource(p, source.id);
        console.log(`    → ${r.status}: found=${r.jobsFound}, new=${r.jobsNew} (${(r.durationMs / 1000).toFixed(1)}s)`);
        results.push({ market, found: r.jobsFound, new_: r.jobsNew, status: r.status });
      } catch (err) {
        console.error(`    → ERROR: ${(err as Error).message}`);
        results.push({ market, found: 0, new_: 0, status: 'ERROR' });
      }
    }
  }

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('  PLATFORM CRAWL SUMMARY');
  console.log('='.repeat(50));

  const byMarket = new Map<string, { found: number; new_: number }>();
  for (const r of results) {
    const prev = byMarket.get(r.market) || { found: 0, new_: 0 };
    byMarket.set(r.market, { found: prev.found + r.found, new_: prev.new_ + r.new_ });
  }

  let totalFound = 0, totalNew = 0;
  for (const [market, stats] of byMarket) {
    console.log(`  ${market}: ${stats.found} found, ${stats.new_} new`);
    totalFound += stats.found;
    totalNew += stats.new_;
  }
  console.log(`  TOTAL: ${totalFound} found, ${totalNew} new`);

  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await p.$disconnect();
});
