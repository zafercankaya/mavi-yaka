/**
 * Test full crawl pipeline with a few brands.
 * Tests: RSS, HTML Cheerio, Playwright fallback
 */
import { PrismaClient } from '@prisma/client';
import { crawlSource } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const prisma = new PrismaClient();

async function main() {
  // Find specific brands to test different scenarios
  const testBrands = ['Migros', 'Teknosa', 'Pegasus', 'THY', 'LC Waikiki'];

  for (const brandName of testBrands) {
    const source = await prisma.crawlSource.findFirst({
      where: {
        company: { name: brandName },
        isActive: true,
      },
      include: { company: { select: { name: true, sector: true } } },
    });

    if (!source) {
      console.log(`\n[SKIP] ${brandName}: source not found`);
      continue;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`TESTING: ${source.company.name} | ${source.seedUrls[0]}`);
    console.log(`Sector: ${source.company.sector || 'NONE'}`);
    console.log('='.repeat(60));

    try {
      const result = await crawlSource(prisma, source.id);
      console.log(`\nResult: ${result.status}`);
      console.log(`  Found: ${result.jobsFound}`);
      console.log(`  New: ${result.jobsNew}`);
      console.log(`  Updated: ${result.jobsUpdated}`);
      console.log(`  Duration: ${result.durationMs}ms`);
      if (result.errorMessage) console.log(`  Error: ${result.errorMessage}`);
    } catch (err) {
      console.error(`\nFATAL ERROR: ${(err as Error).message}`);
    }
  }

  // Show saved job listings
  console.log('\n\n========== SAVED JOB LISTINGS ==========');
  const listings = await prisma.jobListing.findMany({
    include: {
      company: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  for (const c of listings) {
    console.log(`\n  [${c.company.name}] ${c.title.substring(0, 60)}`);
    console.log(`    Sector: ${c.sector || 'NONE'}`);
    console.log(`    Deadline: ${c.deadline?.toISOString() || 'NONE'}`);
    console.log(`    Image: ${c.imageUrl || 'NONE'}`);
    console.log(`    Status: ${c.status}`);
  }

  console.log(`\nTotal job listings in DB: ${await prisma.jobListing.count()}`);

  await closeBrowser();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
