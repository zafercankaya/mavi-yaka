/**
 * Bulk discovery script — discovers RSS/API endpoints for all active crawl sources.
 * Run: npx ts-node src/discover-all.ts
 */
import { PrismaClient } from '@prisma/client';
import { discoverBestMethod } from './processors/auto-discover';

const prisma = new PrismaClient();

async function main() {
  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true, discoveredFeedUrl: null, discoveredApiUrl: null },
    include: { brand: { select: { name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\nDiscovering best methods for ${sources.length} sources...\n`);

  let rssCount = 0;
  let apiCount = 0;
  let htmlCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const seedUrl = source.seedUrls[0];
    if (!seedUrl) continue;

    const progress = `[${i + 1}/${sources.length}]`;

    try {
      const result = await discoverBestMethod(seedUrl);

      const updateData: any = {};

      if (result.method === 'RSS' && result.feedUrl) {
        updateData.discoveredFeedUrl = result.feedUrl;
        rssCount++;
        console.log(`${progress} ${source.brand.name}: RSS -> ${result.feedUrl}`);
      } else if (result.method === 'API' && result.apiUrl) {
        updateData.discoveredApiUrl = result.apiUrl;
        apiCount++;
        console.log(`${progress} ${source.brand.name}: API -> ${result.apiUrl}`);
      } else {
        htmlCount++;
        console.log(`${progress} ${source.brand.name}: HTML (no RSS/API found)`);
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.crawlSource.update({
          where: { id: source.id },
          data: updateData,
        });
      }
    } catch (err) {
      errorCount++;
      console.error(`${progress} ${source.brand.name}: ERROR — ${(err as Error).message}`);
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n========== Discovery Complete ==========`);
  console.log(`  RSS found:  ${rssCount}`);
  console.log(`  API found:  ${apiCount}`);
  console.log(`  HTML only:  ${htmlCount}`);
  console.log(`  Errors:     ${errorCount}`);
  console.log(`  Total:      ${sources.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
