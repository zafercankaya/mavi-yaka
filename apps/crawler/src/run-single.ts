/**
 * Tek bir kaynak için crawl çalıştır.
 * API'dan child process olarak tetiklenir.
 *
 * Kullanım: ts-node src/run-single.ts <sourceId> [logId]
 *   - sourceId: Crawl edilecek kaynak ID'si
 *   - logId: (Opsiyonel) API tarafından oluşturulmuş mevcut log ID'si
 */
import './config'; // Load env first
import { PrismaClient, CrawlStatus } from '@prisma/client';
import { crawlSource } from './engine';
import { closeBrowser } from './processors/scrape.processor';

async function main() {
  const sourceId = process.argv[2];
  const existingLogId = process.argv[3];

  if (!sourceId) {
    console.error('Usage: ts-node run-single.ts <sourceId> [logId]');
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    // If an existing log was created by the API, update it to show we started
    if (existingLogId) {
      await prisma.crawlLog.update({
        where: { id: existingLogId },
        data: { status: CrawlStatus.RUNNING },
      }).catch(() => {}); // Ignore if log doesn't exist
    }

    const result = await crawlSource(prisma, sourceId, existingLogId);
    console.log(JSON.stringify(result));
    process.exit(0);
  } catch (err) {
    console.error(`Crawl failed: ${(err as Error).message}`);

    // Update existing log to FAILED if provided
    if (existingLogId) {
      await prisma.crawlLog.update({
        where: { id: existingLogId },
        data: {
          status: CrawlStatus.FAILED,
          errorMessage: (err as Error).message,
          durationMs: 0,
        },
      }).catch(() => {});
    }

    process.exit(1);
  } finally {
    await closeBrowser();
    await prisma.$disconnect();
  }
}

main();
