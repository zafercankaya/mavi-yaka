/**
 * flush-batch-upsert.ts — Shared upsert helper for all bulk imports
 *
 * Uses fingerprint-based deduplication:
 * - New record (fingerprint not in DB) → INSERT
 * - Existing record (fingerprint exists) → UPDATE lastSeenAt + status=ACTIVE (reactivate)
 *
 * Pre-insert filters:
 * - Title dedup: max N records per base title (without employer) per country
 * - White-collar rejection: isBlueCollar check on all items
 *
 * Requires: unique index on job_listings.fingerprint
 */

import { PrismaClient } from '@prisma/client';
import { isBlueCollar } from '../utils/blue-collar-filter';

export interface FlushResult {
  inserted: number;
  updated: number;
  filtered: number;
}

// ─── Title dedup tracking (persists across batches within same process) ──
const _titleCountsByCountry = new Map<string, Map<string, number>>();
const MAX_PER_BASE_TITLE = 3; // max records per base title per country

function getBaseTitle(title: string): string {
  // Strip employer suffix: "Koch (m/w/d) — Firma GmbH" → "Koch (m/w/d)"
  return title.split(' — ')[0].split(' - ')[0].trim().toLowerCase();
}

function shouldAllowTitle(country: string, title: string): boolean {
  const baseTitle = getBaseTitle(title);
  if (!_titleCountsByCountry.has(country)) {
    _titleCountsByCountry.set(country, new Map());
  }
  const countryMap = _titleCountsByCountry.get(country)!;
  const current = countryMap.get(baseTitle) || 0;
  if (current >= MAX_PER_BASE_TITLE) return false;
  countryMap.set(baseTitle, current + 1);
  return true;
}

/** Reset title counts (call between import runs if needed) */
export function resetTitleCounts(): void {
  _titleCountsByCountry.clear();
}

/**
 * Upsert a batch of job listings using fingerprint-based dedup.
 * - Pre-filter: blue-collar check + title dedup
 * - First tries createMany with skipDuplicates (fast path for new records)
 * - Then updates existing records' lastSeenAt (keeps them alive for aging)
 */
export async function flushBatchUpsert(
  prisma: PrismaClient,
  batch: any[],
): Promise<FlushResult> {
  if (batch.length === 0) return { inserted: 0, updated: 0, filtered: 0 };

  let inserted = 0;
  let updated = 0;
  let filtered = 0;

  // Pre-filter: blue-collar check + title dedup
  const filteredBatch: any[] = [];
  for (const item of batch) {
    // Blue-collar filter
    if (!isBlueCollar(item.title, item.description)) {
      filtered++;
      continue;
    }
    // Title dedup: max N per base title per country
    if (!shouldAllowTitle(item.country || '', item.title)) {
      filtered++;
      continue;
    }
    filteredBatch.push(item);
  }

  if (filteredBatch.length === 0) return { inserted: 0, updated: 0, filtered };

  // Step 1: Try createMany — new records get inserted, existing ones skipped
  try {
    const result = await prisma.jobListing.createMany({
      data: filteredBatch,
      skipDuplicates: true,
    });
    inserted = result.count;
  } catch (e: any) {
    // If batch fails, try smaller chunks
    for (let i = 0; i < filteredBatch.length; i += 50) {
      const chunk = filteredBatch.slice(i, i + 50);
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
  const skippedCount = filteredBatch.length - inserted;
  if (skippedCount > 0) {
    const fingerprints = filteredBatch
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

  return { inserted, updated, filtered };
}
