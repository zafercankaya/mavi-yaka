import './config';
import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const trendyol = await prisma.company.findFirst({ where: { slug: 'trendyol' } });
  if (!trendyol) {
    console.error('Trendyol company not found. Run seed first.');
    process.exit(1);
  }

  // Create HTML test source (scrape)
  const scrapeSource = await prisma.crawlSource.upsert({
    where: { id: '00000000-0000-0000-0000-test00000001' },
    update: {
      seedUrls: ['http://localhost:4444/kampanyalar'],
      selectors: {
        list: '.campaign-card',
        link: '.campaign-link',
        title: '.detail-title',
        description: '.detail-description',
        image: '.detail-image',
        endDate: '.detail-end-date',
        discountRate: '.detail-discount',
      },
    },
    create: {
      id: '00000000-0000-0000-0000-test00000001',
      companyId: trendyol.id,
      name: 'Test HTML Source',
      crawlMethod: CrawlMethod.HTML,
      seedUrls: ['http://localhost:4444/kampanyalar'],
      maxDepth: 2,
      selectors: {
        list: '.campaign-card',
        link: '.campaign-link',
        title: '.detail-title',
        description: '.detail-description',
        image: '.detail-image',
        endDate: '.detail-end-date',
        discountRate: '.detail-discount',
      },
      schedule: '0 3 * * *',
      agingDays: 7,
    },
  });
  console.log(`HTML source: ${scrapeSource.id}`);

  console.log('\nTest sources created. Now run:');
  console.log('  1. Start test server: npx ts-node src/test-server.ts');
  console.log(`  2. Test HTML: npx ts-node src/test-crawl.ts ${scrapeSource.id}`);

  await prisma.$disconnect();
}

main().catch(console.error);
