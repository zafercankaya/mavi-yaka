import { PrismaClient } from '@prisma/client';
import { crawlSource, CrawlResult } from './engine';
import { closeBrowser } from './processors/scrape.processor';

const prisma = new PrismaClient();

async function main() {
  // 1. Tüm kampanyaları sil
  console.log('=== VERITABANI TEMIZLENIYOR ===');
  const deleted = await prisma.campaign.deleteMany({});
  console.log(`${deleted.count} kampanya silindi.`);

  // Crawl loglarını da temizle
  const logsDeleted = await prisma.crawlLog.deleteMany({});
  console.log(`${logsDeleted.count} crawl log silindi.`);

  console.log('\n=== FULL CRAWL BASLIYOR ===\n');

  // 2. Tüm aktif kaynakları çek
  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
    include: { brand: { include: { category: true } } },
    orderBy: { name: 'asc' },
  });

  console.log(`Toplam ${sources.length} aktif kaynak.\n`);

  const results: (CrawlResult & { brandName?: string; categoryName?: string })[] = [];
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
    console.log(`  Brand: ${source.brand?.name || 'none'}, Category: ${source.brand?.category?.name || 'none'}`);

    try {
      const result = await Promise.race([
        crawlSource(prisma, source.id),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Hard timeout 75s')), 75_000)),
      ]);
      results.push({
        ...result,
        brandName: source.brand?.name,
        categoryName: source.brand?.category?.name,
      });

      totalFound += result.campaignsFound;
      totalNew += result.campaignsNew;
      totalUpdated += result.campaignsUpdated;

      if (result.status === 'SUCCESS') successCount++;
      else if (result.status === 'FAILED') failCount++;
      else if (result.status === 'PARTIAL') partialCount++;

      console.log(`  Result: ${result.status} | found=${result.campaignsFound} new=${result.campaignsNew} updated=${result.campaignsUpdated} (${result.durationMs}ms)`);
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
        campaignsFound: 0,
        campaignsNew: 0,
        campaignsUpdated: 0,
        errorMessage: (err as Error).message,
        durationMs: 0,
        brandName: source.brand?.name,
        categoryName: source.brand?.category?.name,
      });
    }
  }

  await closeBrowser();

  // Summary
  console.log(`\n\n========== CRAWL SUMMARY ==========`);
  console.log(`Total sources: ${sources.length}`);
  console.log(`Success: ${successCount} | Partial: ${partialCount} | Failed: ${failCount}`);
  console.log(`Campaigns: found=${totalFound} new=${totalNew} updated=${totalUpdated}`);

  const failed = results.filter(r => r.status === 'FAILED');
  if (failed.length > 0) {
    console.log(`\n--- FAILED SOURCES (${failed.length}) ---`);
    for (const f of failed) {
      console.log(`  ${f.sourceName}: ${f.errorMessage?.substring(0, 150) || 'unknown'}`);
    }
  }

  const empty = results.filter(r => r.status !== 'FAILED' && r.campaignsFound === 0);
  if (empty.length > 0) {
    console.log(`\n--- EMPTY SOURCES (${empty.length}) ---`);
    for (const e of empty) {
      console.log(`  ${e.sourceName}`);
    }
  }

  const withCampaigns = results.filter(r => r.campaignsNew > 0 || r.campaignsUpdated > 0);
  if (withCampaigns.length > 0) {
    console.log(`\n--- SOURCES WITH CAMPAIGNS (${withCampaigns.length}) ---`);
    for (const s of withCampaigns) {
      console.log(`  ${s.sourceName} [${s.categoryName}]: new=${s.campaignsNew} updated=${s.campaignsUpdated}`);
    }
  }

  // DB stats
  const campaignCount = await prisma.campaign.count();
  const withDates = await prisma.campaign.count({ where: { endDate: { not: null } } });
  const withImages = await prisma.campaign.count({ where: { imageUrls: { isEmpty: false } } });
  const withDiscount = await prisma.campaign.count({ where: { discountRate: { not: null } } });

  console.log(`\n--- DB STATS ---`);
  console.log(`Total campaigns in DB: ${campaignCount}`);
  console.log(`With endDate: ${withDates}`);
  console.log(`With image: ${withImages}`);
  console.log(`With discount: ${withDiscount}`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
