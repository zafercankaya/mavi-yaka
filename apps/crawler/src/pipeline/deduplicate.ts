import { PrismaClient, Market } from '@prisma/client';
import { generateFingerprint } from '@kampanya/shared';
import { NormalizedCampaign } from './normalize';

export interface DedupeResult {
  isNew: boolean;
  fingerprint: string;
  campaignId: string;
}

/**
 * Normalize a title for fuzzy comparison:
 * - lowercase
 * - remove special chars except spaces
 * - collapse whitespace
 * - remove common filler words
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[|–—\-:!?.,"'()[\]{}#@&+*%₺€$\/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get URL path without query params for broader matching.
 * e.g., "https://example.com/kampanya/abc?ref=123" → "example.com/kampanya/abc"
 */
function getUrlPathKey(url: string): string | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase();
    return `${parsed.hostname.toLowerCase()}${path}`;
  } catch {
    return null;
  }
}

/**
 * Check similarity between two normalized titles.
 * Returns true if they're "similar enough" to be considered the same campaign.
 */
function isSimilarTitle(a: string, b: string): boolean {
  if (a === b) return true;

  // One contains the other (one is a longer version)
  if (a.includes(b) || b.includes(a)) {
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    // Only consider similar if the shorter is at least 60% of the longer
    if (shorter.length / longer.length >= 0.6) return true;
  }

  // First 40 chars match and both are reasonably long
  if (a.length >= 30 && b.length >= 30 && a.substring(0, 40) === b.substring(0, 40)) {
    return true;
  }

  return false;
}

export async function checkAndUpsert(
  prisma: PrismaClient,
  sourceId: string,
  brandId: string,
  categoryId: string | null,
  campaign: NormalizedCampaign,
  market?: Market,
): Promise<DedupeResult> {
  // ===== TIER 1: Exact fingerprint match (source + canonical URL) =====
  const fingerprint = generateFingerprint(sourceId, campaign.canonicalUrl);

  const existing = await prisma.campaign.findUnique({
    where: { fingerprint },
    select: { id: true },
  });

  if (existing) {
    await prisma.campaign.update({
      where: { fingerprint },
      data: {
        title: campaign.title,
        description: campaign.description,
        discountRate: campaign.discountRate,
        promoCode: campaign.promoCode,
        imageUrls: campaign.imageUrls,
        endDate: campaign.endDate,
        lastSeenAt: new Date(),
      },
    });
    return { isNew: false, fingerprint, campaignId: existing.id };
  }

  // ===== TIER 2: Same brand + market + (exact title OR same canonical URL) =====
  const existingByTitleOrUrl = await prisma.campaign.findFirst({
    where: {
      brandId,
      ...(market && { market }),
      OR: [
        { title: campaign.title },
        { canonicalUrl: campaign.canonicalUrl },
      ],
    },
    select: { id: true, fingerprint: true },
  });

  if (existingByTitleOrUrl) {
    await prisma.campaign.update({
      where: { id: existingByTitleOrUrl.id },
      data: {
        description: campaign.description || undefined,
        discountRate: campaign.discountRate,
        promoCode: campaign.promoCode,
        imageUrls: campaign.imageUrls,
        endDate: campaign.endDate,
        lastSeenAt: new Date(),
      },
    });
    return { isNew: false, fingerprint: existingByTitleOrUrl.fingerprint, campaignId: existingByTitleOrUrl.id };
  }

  // ===== TIER 3: Fuzzy matching — same brand + (similar title OR same URL path) =====
  const urlPathKey = getUrlPathKey(campaign.sourceUrl);
  const normalizedNewTitle = normalizeTitle(campaign.title);

  // Get all campaigns for this brand + market to do fuzzy comparison
  const brandCampaigns = await prisma.campaign.findMany({
    where: { brandId, ...(market && { market }) },
    select: { id: true, fingerprint: true, title: true, sourceUrl: true, canonicalUrl: true },
  });

  for (const bc of brandCampaigns) {
    // Check URL path match (ignore query params)
    if (urlPathKey) {
      const existingPathKey = getUrlPathKey(bc.sourceUrl);
      if (existingPathKey && existingPathKey === urlPathKey) {
        console.log(`  [Dedup] URL path match: "${campaign.title.substring(0, 40)}" ≈ "${bc.title.substring(0, 40)}"`);
        await prisma.campaign.update({
          where: { id: bc.id },
          data: {
            title: campaign.title.length > bc.title.length ? campaign.title : undefined,
            description: campaign.description || undefined,
            discountRate: campaign.discountRate,
            promoCode: campaign.promoCode,
            imageUrls: campaign.imageUrls,
            endDate: campaign.endDate,
            lastSeenAt: new Date(),
          },
        });
        return { isNew: false, fingerprint: bc.fingerprint, campaignId: bc.id };
      }
    }

    // Check fuzzy title match
    const existingNormTitle = normalizeTitle(bc.title);
    if (isSimilarTitle(normalizedNewTitle, existingNormTitle)) {
      console.log(`  [Dedup] Fuzzy title match: "${campaign.title.substring(0, 40)}" ≈ "${bc.title.substring(0, 40)}"`);
      await prisma.campaign.update({
        where: { id: bc.id },
        data: {
          // Keep the longer/better title
          title: campaign.title.length > bc.title.length ? campaign.title : undefined,
          description: campaign.description || undefined,
          discountRate: campaign.discountRate,
          promoCode: campaign.promoCode,
          imageUrls: campaign.imageUrls,
          endDate: campaign.endDate,
          lastSeenAt: new Date(),
        },
      });
      return { isNew: false, fingerprint: bc.fingerprint, campaignId: bc.id };
    }
  }

  // ===== No match found — create new campaign =====
  // Use try/catch to handle race conditions: if a parallel crawl inserts the same
  // campaign between our check and create, the DB unique partial indexes
  // (brand_id+market+canonical_url, brand_id+market+md5(title)) will reject the duplicate.
  try {
    const created = await prisma.campaign.create({
      data: {
        title: campaign.title,
        description: campaign.description,
        brandId,
        categoryId,
        sourceId,
        sourceUrl: campaign.sourceUrl,
        canonicalUrl: campaign.canonicalUrl,
        fingerprint,
        discountRate: campaign.discountRate,
        promoCode: campaign.promoCode,
        imageUrls: campaign.imageUrls,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        market: market ?? Market.TR,
        status: 'ACTIVE',
        lastSeenAt: new Date(),
      },
    });

    return { isNew: true, fingerprint, campaignId: created.id };
  } catch (error: any) {
    // P2002 = Unique constraint violation — a parallel crawl already inserted this campaign
    if (error?.code === 'P2002') {
      console.log(`  [Dedup] Race condition caught — duplicate prevented for: "${campaign.title.substring(0, 50)}"`);
      // Find the existing campaign that was just inserted by the parallel crawl
      const raceWinner = await prisma.campaign.findFirst({
        where: {
          brandId,
          ...(market && { market }),
          OR: [
            { canonicalUrl: campaign.canonicalUrl },
            { title: campaign.title },
          ],
          status: 'ACTIVE',
        },
        select: { id: true, fingerprint: true },
      });
      if (raceWinner) {
        await prisma.campaign.update({
          where: { id: raceWinner.id },
          data: { lastSeenAt: new Date() },
        });
        return { isNew: false, fingerprint: raceWinner.fingerprint, campaignId: raceWinner.id };
      }
      // Fallback: couldn't find the winner, return as not-new with our fingerprint
      return { isNew: false, fingerprint, campaignId: 'race-condition-unknown' };
    }
    throw error; // Re-throw non-duplicate errors
  }
}

/**
 * In-batch deduplication: removes duplicates within a single crawl batch
 * BEFORE hitting the database. This prevents the same campaign being inserted
 * twice when it appears at multiple URLs in the same crawl.
 */
export function deduplicateBatch(campaigns: NormalizedCampaign[]): NormalizedCampaign[] {
  const seen = new Map<string, NormalizedCampaign>();

  for (const c of campaigns) {
    const titleKey = normalizeTitle(c.title);
    const urlPathKey = getUrlPathKey(c.sourceUrl);

    // Check if we already have a campaign with the same normalized title
    let isDupe = false;
    for (const [key, existing] of seen) {
      // Same URL path
      if (urlPathKey && key.startsWith('url:') && key === `url:${urlPathKey}`) {
        isDupe = true;
        // Keep the one with more data
        if (hasMoreData(c, existing)) {
          seen.delete(key);
          seen.set(`url:${urlPathKey}`, c);
        }
        break;
      }
      // Similar title
      if (key.startsWith('title:') && isSimilarTitle(titleKey, key.substring(6))) {
        isDupe = true;
        if (hasMoreData(c, existing)) {
          seen.delete(key);
          seen.set(`title:${titleKey}`, c);
        }
        break;
      }
    }

    if (!isDupe) {
      // Store by both URL and title for matching
      if (urlPathKey) {
        seen.set(`url:${urlPathKey}`, c);
      } else {
        seen.set(`title:${titleKey}`, c);
      }
    }
  }

  return [...seen.values()];
}

/** Returns true if candidate has more/better data than existing */
function hasMoreData(candidate: NormalizedCampaign, existing: NormalizedCampaign): boolean {
  let candidateScore = 0;
  let existingScore = 0;

  if (candidate.description && candidate.description.length > 20) candidateScore++;
  if (existing.description && existing.description.length > 20) existingScore++;

  if (candidate.imageUrls.length > 0) candidateScore++;
  if (existing.imageUrls.length > 0) existingScore++;

  if (candidate.endDate) candidateScore++;
  if (existing.endDate) existingScore++;

  if (candidate.discountRate) candidateScore++;
  if (existing.discountRate) existingScore++;

  if (candidate.title.length > existing.title.length) candidateScore++;
  else if (existing.title.length > candidate.title.length) existingScore++;

  return candidateScore > existingScore;
}
