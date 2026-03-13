import './config';
import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const trendyol = await prisma.brand.findFirst({ where: { slug: 'trendyol' } });
  if (!trendyol) {
    console.error('Trendyol brand not found. Run seed first.');
    process.exit(1);
  }

  // Create CAMPAIGN test source (scrape)
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
      brandId: trendyol.id,
      name: 'Test CAMPAIGN Source',
      crawlMethod: CrawlMethod.CAMPAIGN,
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
  console.log(`CAMPAIGN source: ${scrapeSource.id}`);

  // Create RSS test source
  const rssSource = await prisma.crawlSource.upsert({
    where: { id: '00000000-0000-0000-0000-test00000002' },
    update: {
      seedUrls: ['http://localhost:4444/rss'],
    },
    create: {
      id: '00000000-0000-0000-0000-test00000002',
      brandId: trendyol.id,
      name: 'Test RSS Source',
      crawlMethod: CrawlMethod.RSS,
      seedUrls: ['http://localhost:4444/rss'],
      schedule: '0 3 * * *',
      agingDays: 7,
    },
  });
  console.log(`RSS source: ${rssSource.id}`);

  console.log('\nTest sources created. Now run:');
  console.log('  1. Start test server: npx ts-node src/test-server.ts');
  console.log(`  2. Test CAMPAIGN: npx ts-node src/test-crawl.ts ${scrapeSource.id}`);
  console.log(`  3. Test RSS:      npx ts-node src/test-crawl.ts ${rssSource.id}`);

  await prisma.$disconnect();
}

main().catch(console.error);
