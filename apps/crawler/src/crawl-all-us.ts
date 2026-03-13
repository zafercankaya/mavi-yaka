/**
 * Crawl all uncrawled US sectors sequentially.
 * Run: npx ts-node --transpile-only src/crawl-all-us.ts
 */
import './config';
import { PrismaClient, Sector } from '@prisma/client';
import { crawlSource, cleanupStaleLogs } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const p = new PrismaClient();

const US_SECTORS: Sector[] = [
  'RETAIL',
  'MANUFACTURING',
  'LOGISTICS_TRANSPORTATION',
  'CONSTRUCTION',
  'FOOD_BEVERAGE',
  'AUTOMOTIVE',
  'TEXTILE',
  'HEALTHCARE',
  'HOSPITALITY_TOURISM',
  'SECURITY_SERVICES',
  'FACILITY_MANAGEMENT',
  'OTHER',
];

async function main() {
  // Clean up stale RUNNING logs
  await cleanupStaleLogs(p);

  // Skip sectors provided as args (already crawled)
  const skipSectors = process.argv.slice(2);

  for (const sector of US_SECTORS) {
    if (skipSectors.includes(sector)) {
      console.log(`\nSkipping ${sector} (already done)\n`);
      continue;
    }

    const sources = await p.crawlSource.findMany({
      where: {
        isActive: true,
        market: 'US' as any,
        company: { sector },
      },
      include: { company: { select: { name: true } } },
      orderBy: { company: { name: 'asc' } },
    });

    console.log(`\n${'='.repeat(60)}`);
    console.log(`  SECTOR: ${sector} (${sources.length} sources)`);
    console.log(`${'='.repeat(60)}\n`);

    const results: { company: string; found: number; new_: number; status: string; ms: number }[] = [];

    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      console.log(`\n[${i + 1}/${sources.length}] Crawling: ${s.company.name}...`);

      try {
        const r = await crawlSource(p, s.id);
        results.push({
          company: s.company.name,
          found: r.jobsFound,
          new_: r.jobsNew,
          status: r.status,
          ms: r.durationMs,
        });
        console.log(`  → ${r.status}: found=${r.jobsFound}, new=${r.jobsNew} (${(r.durationMs / 1000).toFixed(1)}s)`);
      } catch (err) {
        console.error(`  → ERROR: ${(err as Error).message}`);
        results.push({ company: s.company.name, found: 0, new_: 0, status: 'ERROR', ms: 0 });
      }
    }

    // Sector summary
    const totalFound = results.reduce((s, r) => s + r.found, 0);
    const totalNew = results.reduce((s, r) => s + r.new_, 0);
    const failed = results.filter(r => r.status === 'FAILED' || r.status === 'ERROR').length;
    console.log(`\n--- ${sector} SUMMARY: ${totalFound} found, ${totalNew} new, ${failed} failed ---\n`);
  }

  await closeBrowser();
  await p.$disconnect();
  console.log('\nAll US sectors crawled!\n');
}

main().catch(async (e) => {
  console.error(e);
  await closeBrowser();
  await p.$disconnect();
});
