import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Son 30 crawl log
  const logs = await prisma.crawlLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      source: {
        select: {
          name: true,
          crawlMethod: true,
          seedUrls: true,
          isActive: true,
          brand: { select: { name: true } },
        },
      },
    },
  });

  console.log('\n=== SON 30 CRAWL LOG ===\n');
  for (const log of logs) {
    const brand = log.source?.brand?.name || '?';
    const err = log.errorMessage ? `ERR: ${log.errorMessage.slice(0, 120)}` : '';
    console.log(
      `${log.createdAt.toISOString().slice(0, 16)} | ${log.status.padEnd(8)} | ${brand.padEnd(22)} | found=${log.campaignsFound} new=${log.campaignsNew} upd=${log.campaignsUpdated} | ${log.durationMs || 0}ms ${err}`,
    );
  }

  // Özet: status dağılımı
  const summary = await prisma.crawlLog.groupBy({
    by: ['status'],
    _count: true,
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });
  console.log('\n=== SON 7 GÜN ÖZET ===');
  for (const s of summary) {
    console.log(`  ${s.status}: ${s._count} crawl`);
  }

  // Aktif source'lar
  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
    include: { brand: { select: { name: true } } },
    orderBy: { lastCrawledAt: 'desc' },
  });
  console.log(`\n=== AKTİF SOURCES (${sources.length}) ===\n`);
  for (const s of sources) {
    console.log(
      `${s.brand.name.padEnd(22)} | ${s.crawlMethod.padEnd(10)} | lastCrawl: ${s.lastCrawledAt?.toISOString().slice(0, 16) || 'NEVER'} | urls: ${s.seedUrls.join(', ').slice(0, 80)}`,
    );
  }

  // Son başarısız crawl'ların detaylı hata mesajları
  const failedLogs = await prisma.crawlLog.findMany({
    where: { status: { in: ['FAILED', 'PARTIAL'] } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      source: {
        select: {
          name: true,
          crawlMethod: true,
          seedUrls: true,
          brand: { select: { name: true } },
        },
      },
    },
  });

  console.log('\n=== SON 10 BAŞARISIZ CRAWL DETAY ===\n');
  for (const log of failedLogs) {
    console.log(`--- ${log.source?.brand?.name} (${log.source?.crawlMethod}) ---`);
    console.log(`  Tarih: ${log.createdAt.toISOString()}`);
    console.log(`  Status: ${log.status}`);
    console.log(`  Found: ${log.campaignsFound}, New: ${log.campaignsNew}, Updated: ${log.campaignsUpdated}`);
    console.log(`  Duration: ${log.durationMs}ms`);
    console.log(`  Error: ${log.errorMessage || '(no error message)'}`);
    console.log(`  URLs: ${log.source?.seedUrls.join(', ')}`);
    console.log();
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());