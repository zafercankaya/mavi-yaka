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
        brand: { name: brandName },
        isActive: true,
      },
      include: { brand: { select: { name: true, categoryId: true } } },
    });

    if (!source) {
      console.log(`\n[SKIP] ${brandName}: source not found`);
      continue;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`TESTING: ${source.brand.name} | ${source.seedUrls[0]}`);
    console.log(`Category: ${source.brand.categoryId || 'NONE'}`);
    console.log('='.repeat(60));

    try {
      const result = await crawlSource(prisma, source.id);
      console.log(`\nResult: ${result.status}`);
      console.log(`  Found: ${result.campaignsFound}`);
      console.log(`  New: ${result.campaignsNew}`);
      console.log(`  Updated: ${result.campaignsUpdated}`);
      console.log(`  Duration: ${result.durationMs}ms`);
      if (result.errorMessage) console.log(`  Error: ${result.errorMessage}`);
    } catch (err) {
      console.error(`\nFATAL ERROR: ${(err as Error).message}`);
    }
  }

  // Show saved campaigns with dates
  console.log('\n\n========== SAVED CAMPAIGNS ==========');
  const campaigns = await prisma.campaign.findMany({
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  for (const c of campaigns) {
    console.log(`\n  [${c.brand.name}] ${c.title.substring(0, 60)}`);
    console.log(`    Category: ${c.category?.name || 'YOK'}`);
    console.log(`    StartDate: ${c.startDate?.toISOString() || 'YOK'}`);
    console.log(`    EndDate: ${c.endDate?.toISOString() || 'YOK'}`);
    console.log(`    Discount: ${c.discountRate ? '%' + c.discountRate : 'YOK'}`);
    console.log(`    Images: ${c.imageUrls.length}`);
    console.log(`    Status: ${c.status}`);
  }

  console.log(`\nTotal campaigns in DB: ${await prisma.campaign.count()}`);

  await closeBrowser();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
