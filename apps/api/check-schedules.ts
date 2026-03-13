import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Schedule dağılımı
  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
    select: { id: true, name: true, schedule: true },
  });

  const scheduleMap: Record<string, number> = {};
  for (const s of sources) {
    scheduleMap[s.schedule] = (scheduleMap[s.schedule] || 0) + 1;
  }

  console.log('=== SCHEDULE DAĞILIMI ===');
  for (const [schedule, count] of Object.entries(scheduleMap).sort((a, b) => b[1] - a[1])) {
    console.log(`  "${schedule}" → ${count} source`);
  }
  console.log(`  TOTAL: ${sources.length} active sources`);

  // Stuck RUNNING logs
  const running = await prisma.crawlLog.findMany({
    where: { status: 'RUNNING' },
    include: { source: { select: { name: true, brand: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n=== STUCK RUNNING LOGS (${running.length}) ===`);
  for (const r of running) {
    console.log(`  ${r.createdAt.toISOString().slice(0,16)} | ${r.source?.brand?.name || '?'}`);
  }

  // Son başarılı crawl'lar
  const successLogs = await prisma.crawlLog.findMany({
    where: { status: 'SUCCESS' },
    orderBy: { createdAt: 'desc' },
    take: 15,
    include: { source: { select: { name: true, brand: { select: { name: true } } } } },
  });
  console.log(`\n=== SON 15 BAŞARILI CRAWL ===`);
  for (const log of successLogs) {
    console.log(
      `  ${log.createdAt.toISOString().slice(0,16)} | ${(log.source?.brand?.name || '?').padEnd(22)} | found=${log.campaignsFound} new=${log.campaignsNew} upd=${log.campaignsUpdated} | ${log.durationMs}ms`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());