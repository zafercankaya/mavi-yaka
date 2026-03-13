import { PrismaClient } from '@prisma/client';
import { crawlSource, CrawlResult } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const prisma = new PrismaClient();

async function main() {
  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
    include: { company: true },
    orderBy: { name: 'asc' },
  });

  console.log(`\n========== Full Crawl: ${sources.length} active sources ==========\n`);

  const results: (CrawlResult & { companyName?: string })[] = [];
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
      });
    }
  }

  await closeBrowser();

  // Summary
  console.log(`\n\n========== CRAWL SUMMARY ==========`);
  console.log(`Total sources: ${sources.length}`);
  console.log(`Success: ${successCount} | Partial: ${partialCount} | Failed: ${failCount}`);
  console.log(`Jobs: found=${totalFound} new=${totalNew} updated=${totalUpdated}`);

  // Failed sources detail
  const failed = results.filter(r => r.status === 'FAILED');
  if (failed.length > 0) {
    console.log(`\n--- FAILED SOURCES (${failed.length}) ---`);
    for (const f of failed) {
      console.log(`  ${f.sourceName}: ${f.errorMessage?.substring(0, 150) || 'unknown'}`);
    }
  }

  // Sources with 0 jobs
  const empty = results.filter(r => r.status !== 'FAILED' && r.jobsFound === 0);
  if (empty.length > 0) {
    console.log(`\n--- EMPTY SOURCES (${empty.length}) ---`);
    for (const e of empty) {
      console.log(`  ${e.sourceName}`);
    }
  }

  // Sources with jobs
  const withJobs = results.filter(r => r.jobsNew > 0 || r.jobsUpdated > 0);
  if (withJobs.length > 0) {
    console.log(`\n--- SOURCES WITH JOBS (${withJobs.length}) ---`);
    for (const s of withJobs) {
      console.log(`  ${s.sourceName}: new=${s.jobsNew} updated=${s.jobsUpdated}`);
    }
  }

  // DB stats after crawl
  const jobCount = await prisma.jobListing.count();
  const withDeadlines = await prisma.jobListing.count({ where: { deadline: { not: null } } });
  const withImages = await prisma.jobListing.count({ where: { imageUrl: { not: null } } });

  console.log(`\n--- DB STATS ---`);
  console.log(`Total jobs in DB: ${jobCount}`);
  console.log(`With deadline: ${withDeadlines}`);
  console.log(`With image: ${withImages}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
