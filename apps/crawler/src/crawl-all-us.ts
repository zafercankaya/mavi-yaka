/**
 * Crawl all uncrawled US categories sequentially.
 * Run: npx ts-node --transpile-only src/crawl-all-us.ts
 */
import './config';
import { PrismaClient } from '@prisma/client';
import { crawlSource, cleanupStaleLogs } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const p = new PrismaClient();

const US_CATEGORIES = [
  'alisveris',
  'giyim-moda',
  'kozmetik-kisisel-bakim',
  'ev-yasam',
  'yeme-icme',
  'spor-outdoor',
  'seyahat-ulasim',
  'finans',
  'sigorta',
  'otomobil',
  // 'elektronik' — already crawled
  // 'kitap-hobi' — already crawled
  // 'gida-market' — being crawled separately
];

async function main() {
  // Clean up stale RUNNING logs
  await cleanupStaleLogs(p);

  // Skip categories provided as args (already crawled)
  const skipCategories = process.argv.slice(2);

  for (const categorySlug of US_CATEGORIES) {
    if (skipCategories.includes(categorySlug)) {
      console.log(`\n⏩ Skipping ${categorySlug} (already done)\n`);
      continue;
    }

    const sources = await p.crawlSource.findMany({
      where: {
        isActive: true,
        market: 'US' as any,
        brand: { category: { slug: categorySlug } },
      },
      include: { brand: { select: { name: true } } },
      orderBy: { brand: { name: 'asc' } },
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  CATEGORY: ${categorySlug} (${sources.length} sources)`);
    console.log(`${'='.repeat(60)}\n`);

    const results: { brand: string; found: number; new_: number; status: string; ms: number }[] = [];

    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      console.log(`\n[${i + 1}/${sources.length}] Crawling: ${s.brand.name}...`);

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
    console.log(`\n--- ${categorySlug} SUMMARY: ${totalFound} found, ${totalNew} new, ${failed} failed ---\n`);
  }

  await closeBrowser();
  await p.$disconnect();
  console.log('\n✅ All US categories crawled!\n');
}

main().catch(async (e) => {
  console.error(e);
  await closeBrowser();
  await p.$disconnect();
});
