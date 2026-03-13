import { PrismaClient } from '@prisma/client';

export async function runAging(prisma: PrismaClient): Promise<number> {
  const now = new Date();

  // 1. Mark job listings with past deadline as EXPIRED
  const expiredByDate = await prisma.jobListing.updateMany({
    where: {
      status: 'ACTIVE',
      deadline: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });

  // 2. Mark job listings without deadline that haven't been seen within aging window
  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
    select: { id: true, agingDays: true },
  });

  let expiredByAging = 0;
  for (const source of sources) {
    const cutoff = new Date(now.getTime() - source.agingDays * 24 * 60 * 60 * 1000);
    const result = await prisma.jobListing.updateMany({
      where: {
        sourceId: source.id,
        status: 'ACTIVE',
        deadline: null,
        lastSeenAt: { lt: cutoff },
      },
      data: { status: 'EXPIRED' },
    });
    expiredByAging += result.count;
  }

  const total = expiredByDate.count + expiredByAging;
  if (total > 0) {
    console.log(`Aging: ${expiredByDate.count} expired by date, ${expiredByAging} expired by aging`);
  }
  return total;
}
