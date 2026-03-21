import { PrismaClient } from '@prisma/client';
import { prismaRetry } from '../utils/prisma-retry';

export async function runAging(prisma: PrismaClient): Promise<number> {
  const now = new Date();

  // 1. Mark job listings with past deadline as EXPIRED
  const expiredByDate = await prismaRetry(
    () =>
      prisma.jobListing.updateMany({
        where: {
          status: 'ACTIVE',
          deadline: { lt: now },
        },
        data: { status: 'EXPIRED' },
      }),
    { label: 'aging-deadline', maxAttempts: 3 },
  );

  // 2. Mark job listings without deadline that haven't been seen within aging window
  const sources = await prismaRetry(
    () =>
      prisma.crawlSource.findMany({
        where: { isActive: true },
        select: { id: true, agingDays: true },
      }),
    { label: 'aging-sources', maxAttempts: 3 },
  );

  let expiredByAging = 0;

  // Process in batches of 50 to reduce per-query connection pressure
  const BATCH_SIZE = 50;
  for (let i = 0; i < sources.length; i += BATCH_SIZE) {
    const batch = sources.slice(i, i + BATCH_SIZE);

    // Build batch of updateMany operations and execute in a transaction
    // This reduces the number of round-trips (1 transaction per batch instead of N individual queries)
    const operations = batch.map((source) => {
      const cutoff = new Date(now.getTime() - source.agingDays * 24 * 60 * 60 * 1000);
      return prisma.jobListing.updateMany({
        where: {
          sourceId: source.id,
          status: 'ACTIVE',
          deadline: null,
          lastSeenAt: { lt: cutoff },
        },
        data: { status: 'EXPIRED' },
      });
    });

    const results = await prismaRetry(
      () => prisma.$transaction(operations),
      { label: `aging-batch-${i / BATCH_SIZE + 1}`, maxAttempts: 3, baseDelayMs: 2000 },
    );

    for (const result of results) {
      expiredByAging += result.count;
    }
  }

  const total = expiredByDate.count + expiredByAging;
  if (total > 0) {
    console.log(`Aging: ${expiredByDate.count} expired by date, ${expiredByAging} expired by aging`);
  }
  return total;
}
