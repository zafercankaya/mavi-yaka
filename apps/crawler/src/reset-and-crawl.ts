import { PrismaClient } from '@prisma/client';
import { crawlSource, CrawlResult } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const prisma = new PrismaClient();

async function main() {
  // 1. Delete all job listings
  console.log('=== VERITABANI TEMIZLENIYOR ===');
  const deleted = await prisma.jobListing.deleteMany({});
  console.log(`${deleted.count} ilan silindi.`);

  // Crawl loglarini da temizle
  const logsDeleted = await prisma.crawlLog.deleteMany({});
  console.log(`${logsDeleted.count} crawl log silindi.`);

  console.log('\n=== FULL CRAWL BASLIYOR ===\n');

  // 2. Get all active sources
  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
    include: { company: true },
    orderBy: { name: 'asc' },
  });

  console.log(`Toplam ${sources.length} aktif kaynak.\n`);

  const results: (CrawlResult & { companyName?: string; sectorName?: string })[] = [];
  let totalNew = 0;
  let totalUpdated = 0;
  let totalFound = 0;
  let successCount = 0;
  let failCount = 0;
  let partialCount = 0;

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const progress = `[${i + 1}/${sources.length}]`;
    console.log(`\n${progress} Crawling: ${source.name} (${source.crawlMethod})`);
    console.log(`  URL: ${source.seedUrls[0] || 'none'}`);
    console.log(`  Company: ${source.company?.name || 'none'}, Sector: ${source.company?.sector || 'none'}`);

    try {
      const result = await Promise.race([
        crawlSource(prisma, source.id),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Hard timeout 75s')), 75_000)),
      ]);
      results.push({
        ...result,
        companyName: source.company?.name,
        sectorName: source.company?.sector,
      });

      totalFound += result.jobsFound;
      totalNew += result.jobsNew;
      totalUpdated += result.jobsUpdated;

      if (result.status === 'SUCCESS') successCount++;
      else if (result.status === 'FAILED') failCount++;
      else if (result.status === 'PARTIAL') partialCount++;

      console.log(`  Result: ${result.status} | found=${result.jobsFound} new=${result.jobsNew} updated=${result.jobsUpdated} (${result.durationMs}ms)`);
      if (result.errorMessage) {
        console.log(`  Error: ${result.errorMessage.substring(0, 200)}`);
      }
    } catch (err) {
      failCount++;
      console.error(`  FATAL: ${(err as Error).message}`);
      results.push({
        sourceId: source.id,
        sourceName: source.name,
        status: 'FAILED' as any,
        jobsFound: 0,
        jobsNew: 0,
        jobsUpdated: 0,
        errorMessage: (err as Error).message,
        durationMs: 0,
        companyName: source.company?.name,
        sectorName: source.company?.sector,
      });
    }
  }

  await closeBrowser();

  // Summary
  console.log(`\n\n========== CRAWL SUMMARY ==========`);
  console.log(`Total sources: ${sources.length}`);
  console.log(`Success: ${successCount} | Partial: ${partialCount} | Failed: ${failCount}`);
  console.log(`Job listings: found=${totalFound} new=${totalNew} updated=${totalUpdated}`);

  const failed = results.filter(r => r.status === 'FAILED');
  if (failed.length > 0) {
    console.log(`\n--- FAILED SOURCES (${failed.length}) ---`);
    for (const f of failed) {
      console.log(`  ${f.sourceName}: ${f.errorMessage?.substring(0, 150) || 'unknown'}`);
    }
  }

  const empty = results.filter(r => r.status !== 'FAILED' && r.jobsFound === 0);
  if (empty.length > 0) {
    console.log(`\n--- EMPTY SOURCES (${empty.length}) ---`);
    for (const e of empty) {
      console.log(`  ${e.sourceName}`);
    }
  }

  const withListings = results.filter(r => r.jobsNew > 0 || r.jobsUpdated > 0);
  if (withListings.length > 0) {
    console.log(`\n--- SOURCES WITH LISTINGS (${withListings.length}) ---`);
    for (const s of withListings) {
      console.log(`  ${s.sourceName} [${s.sectorName}]: new=${s.jobsNew} updated=${s.jobsUpdated}`);
    }
  }

  // DB stats
  const listingCount = await prisma.jobListing.count();
  const withDeadline = await prisma.jobListing.count({ where: { deadline: { not: null } } });
  const withImages = await prisma.jobListing.count({ where: { imageUrl: { not: null } } });

  console.log(`\n--- DB STATS ---`);
  console.log(`Total job listings in DB: ${listingCount}`);
  console.log(`With deadline: ${withDeadline}`);
  console.log(`With image: ${withImages}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
