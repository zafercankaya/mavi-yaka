/**
 * flush-batch-upsert.ts — Shared upsert helper for all bulk imports
 *
 * Uses fingerprint-based deduplication:
 * - New record (fingerprint not in DB) → INSERT
 * - Existing record (fingerprint exists) → UPDATE lastSeenAt + status=ACTIVE (reactivate)
 *
 * Requires: unique index on job_listings.fingerprint
 */

import { PrismaClient } from '@prisma/client';

export interface FlushResult {
  inserted: number;
  updated: number;
}

/**
 * Upsert a batch of job listings using fingerprint-based dedup.
 * - First tries createMany with skipDuplicates (fast path for new records)
 * - Then updates existing records' lastSeenAt (keeps them alive for aging)
 */
export async function flushBatchUpsert(
  prisma: PrismaClient,
  batch: any[],
): Promise<FlushResult> {
  if (batch.length === 0) return { inserted: 0, updated: 0 };

  let inserted = 0;
  let updated = 0;

  // Step 1: Try createMany — new records get inserted, existing ones skipped
  try {
    const result = await prisma.jobListing.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted = result.count;
  } catch (e: any) {
    // If batch fails, try smaller chunks
    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      try {
        const r = await prisma.jobListing.createMany({ data: chunk, skipDuplicates: true });
        inserted += r.count;
      } catch (e2: any) {
        // Individual upsert fallback for really problematic records
        for (const item of chunk) {
          try {
            if (!item.fingerprint) { continue; }
            const existing = await prisma.jobListing.findFirst({
              where: { fingerprint: item.fingerprint },
              select: { id: true },
            });
            if (existing) {
              await prisma.jobListing.update({
                where: { id: existing.id },
                data: { lastSeenAt: new Date(), status: 'ACTIVE' },
              });
              updated++;
            } else {
              await prisma.jobListing.create({ data: item });
              inserted++;
            }
          } catch { /* skip problematic record */ }
        }
      }
    }
  }

  // Step 2: Update lastSeenAt for existing records (the ones that were skipped)
  const skippedCount = batch.length - inserted;
  if (skippedCount > 0) {
    const fingerprints = batch
      .map(b => b.fingerprint)
      .filter((fp: string | null) => fp != null);

    if (fingerprints.length > 0) {
      try {
        const updateResult = await prisma.jobListing.updateMany({
          where: {
            fingerprint: { in: fingerprints },
          },
          data: {
            lastSeenAt: new Date(),
            status: 'ACTIVE',
          },
        });
        updated = updateResult.count;
      } catch (e: any) {
        // Non-critical: records exist but lastSeenAt not updated
        console.warn(`  [DB] Update lastSeenAt warning: ${e.message?.substring(0, 100)}`);
      }
    }
  }

  return { inserted, updated };
}
