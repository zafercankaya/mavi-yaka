import './config';
import { PrismaClient } from '@prisma/client';
import { crawlSource } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const prisma = new PrismaClient();

async function main() {
  const sourceId = process.argv[2];

  if (!sourceId) {
    const sources = await prisma.crawlSource.findMany({
      include: { brand: { select: { name: true } } },
    });

    console.log('Available crawl sources:');
    for (const s of sources) {
      console.log(`  ${s.id}  ${s.brand.name} - ${s.name} (${s.crawlMethod}) [${s.isActive ? 'active' : 'inactive'}]`);
      console.log(`    URLs: ${s.seedUrls.join(', ')}`);
    }
    console.log('\nUsage: npx ts-node src/test-crawl.ts <source_id>');
    await prisma.$disconnect();
    return;
  }

  console.log(`Test crawling source: ${sourceId}`);
  const result = await crawlSource(prisma, sourceId);

  console.log('\n--- Result ---');
  console.log(JSON.stringify(result, null, 2));

  await closeBrowser();
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await closeBrowser();
  await prisma.$disconnect();
  process.exit(1);
});
