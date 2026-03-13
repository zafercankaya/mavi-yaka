import './config';
import { PrismaClient, Market } from '@prisma/client';
import { crawlSource } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const p = new PrismaClient();

async function main() {
  const categorySlug = process.argv[2] || 'otomobil';
  const marketArg = (process.argv[3] || '').toUpperCase();
  const marketMap: Record<string, any> = { US: Market.US, TR: Market.TR, DE: Market.DE, UK: Market.UK };
  const market = marketMap[marketArg] || undefined;

  const where: any = { isActive: true, brand: { category: { slug: categorySlug } } };
  if (market) where.market = market;

  const sources = await p.crawlSource.findMany({
    where,
    include: { brand: { select: { name: true } } },
    orderBy: { brand: { name: 'asc' } },
  });

  const marketLabel = market ? ` [${market}]` : '';
  console.log(`\n=== Crawling ${sources.length} sources in category: ${categorySlug}${marketLabel} ===\n`);

  const results: { brand: string; found: number; new_: number; updated: number; status: string; ms: number }[] = [];

  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    console.log(`\n[${i + 1}/${sources.length}] Crawling: ${s.brand.name}...`);

    try {
      const r = await crawlSource(p, s.id);
      results.push({
        brand: s.brand.name,
        found: r.campaignsFound,
        new_: r.campaignsNew,
        updated: r.campaignsUpdated,
        status: r.status,
        ms: r.durationMs,
      });
      console.log(`  → ${r.status}: found=${r.campaignsFound}, new=${r.campaignsNew}, updated=${r.campaignsUpdated} (${(r.durationMs / 1000).toFixed(1)}s)`);
    } catch (err) {
      console.error(`  → ERROR: ${(err as Error).message}`);
      results.push({ brand: s.brand.name, found: 0, new_: 0, updated: 0, status: 'ERROR', ms: 0 });
    }
  }

  await closeBrowser();

  console.log('\n\n=== RESULTS SUMMARY ===\n');
  console.log('Brand'.padEnd(20) + 'Status'.padEnd(10) + 'Found'.padEnd(8) + 'New'.padEnd(6) + 'Updated'.padEnd(10) + 'Time');
  console.log('-'.repeat(70));
  for (const r of results) {
    console.log(
      r.brand.padEnd(20) +
      r.status.padEnd(10) +
      String(r.found).padEnd(8) +
      String(r.new_).padEnd(6) +
      String(r.updated).padEnd(10) +
      `${(r.ms / 1000).toFixed(1)}s`
    );
  }

  const totalFound = results.reduce((s, r) => s + r.found, 0);
  const totalNew = results.reduce((s, r) => s + r.new_, 0);
  const totalUpdated = results.reduce((s, r) => s + r.updated, 0);
  console.log('-'.repeat(70));
  console.log(`TOTAL: ${totalFound} found, ${totalNew} new, ${totalUpdated} updated`);

  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await closeBrowser();
  await p.$disconnect();
});
