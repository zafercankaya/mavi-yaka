import { PrismaClient, Market } from '@prisma/client';
// import { generateFingerprint } from '@maviyaka/shared';
import { NormalizedJobListing } from './normalize';
import crypto from 'crypto';

function generateFingerprint(sourceId: string, url: string): string {
  return crypto.createHash('md5').update(`${sourceId}:${url}`).digest('hex');
}

export interface DedupeResult {
  isNew: boolean;
  fingerprint: string;
  jobListingId: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 120)
    .replace(/^-|-$/g, '') || 'job';
}

/**
 * Normalize a title for fuzzy comparison:
 * - lowercase
 * - remove special chars except spaces
 * - collapse whitespace
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
 * e.g., "https://example.com/kariyer/abc?ref=123" → "example.com/kariyer/abc"
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
 * Returns true if they're "similar enough" to be considered the same listing.
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
  companyId: string,
  _sectorIgnored: string | null,
  listing: NormalizedJobListing,
  market?: Market,
): Promise<DedupeResult> {
  // ===== TIER 1: Exact fingerprint match (source + canonical URL) =====
  const fingerprint = generateFingerprint(sourceId, listing.canonicalUrl);

  const existing = await prisma.jobListing.findFirst({
    where: { fingerprint },
    select: { id: true },
  });

  if (existing) {
    await prisma.jobListing.update({
      where: { id: existing.id },
      data: {
        title: listing.title,
        description: listing.description,
        requirements: listing.requirements,
        benefits: listing.benefits,
        summary: listing.summary,
        imageUrl: listing.imageUrls[0] || null,
        deadline: listing.deadline,
        postedDate: listing.postedDate,
        salaryMin: listing.salaryMin,
        salaryMax: listing.salaryMax,
        salaryCurrency: listing.salaryCurrency,
        salaryPeriod: listing.salaryPeriod,
        jobType: listing.jobType ?? 'FULL_TIME',
        workMode: listing.workMode ?? 'ON_SITE',
        experienceLevel: listing.experienceLevel,
        sector: listing.sector ?? 'OTHER',
        city: listing.city,
        state: listing.state,
        status: 'ACTIVE', // Reactivation: expire olmuş ilan tekrar bulunursa ACTIVE'e dön
        lastSeenAt: new Date(),
      },
    });
    return { isNew: false, fingerprint, jobListingId: existing.id };
  }

  // ===== TIER 1.5: Check EXPIRED listings with same fingerprint (reactivation) =====
  const expiredMatch = await prisma.jobListing.findFirst({
    where: { fingerprint, status: { not: 'ACTIVE' } },
    select: { id: true },
  });

  if (expiredMatch) {
    console.log(`  [Reactivate] Expired job found again: "${listing.title.substring(0, 50)}"`);
    await prisma.jobListing.update({
      where: { id: expiredMatch.id },
      data: {
        title: listing.title,
        description: listing.description,
        requirements: listing.requirements,
        benefits: listing.benefits,
        summary: listing.summary,
        imageUrl: listing.imageUrls[0] || null,
        deadline: listing.deadline,
        postedDate: listing.postedDate,
        salaryMin: listing.salaryMin,
        salaryMax: listing.salaryMax,
        salaryCurrency: listing.salaryCurrency,
        salaryPeriod: listing.salaryPeriod,
        jobType: listing.jobType ?? 'FULL_TIME',
        workMode: listing.workMode ?? 'ON_SITE',
        experienceLevel: listing.experienceLevel,
        sector: listing.sector ?? 'OTHER',
        city: listing.city,
        state: listing.state,
        status: 'ACTIVE',
        lastSeenAt: new Date(),
      },
    });
    return { isNew: false, fingerprint, jobListingId: expiredMatch.id };
  }

  // ===== TIER 2: Same company + country + (exact title OR same canonical URL) =====
  // Also matches EXPIRED listings for reactivation
  const existingByTitleOrUrl = await prisma.jobListing.findFirst({
    where: {
      companyId,
      ...(market && { country: market }),
      OR: [
        { title: listing.title },
        { canonicalUrl: listing.canonicalUrl },
      ],
    },
    select: { id: true, fingerprint: true },
  });

  if (existingByTitleOrUrl) {
    await prisma.jobListing.update({
      where: { id: existingByTitleOrUrl.id },
      data: {
        description: listing.description || undefined,
        requirements: listing.requirements || undefined,
        benefits: listing.benefits || undefined,
        summary: listing.summary || undefined,
        imageUrl: listing.imageUrls[0] || null,
        deadline: listing.deadline,
        postedDate: listing.postedDate,
        salaryMin: listing.salaryMin,
        salaryMax: listing.salaryMax,
        salaryCurrency: listing.salaryCurrency,
        salaryPeriod: listing.salaryPeriod,
        jobType: listing.jobType ?? 'FULL_TIME',
        workMode: listing.workMode ?? 'ON_SITE',
        experienceLevel: listing.experienceLevel,
        sector: listing.sector ?? 'OTHER',
        city: listing.city,
        state: listing.state,
        status: 'ACTIVE', // Reactivation
        lastSeenAt: new Date(),
      },
    });
    return { isNew: false, fingerprint: existingByTitleOrUrl.fingerprint ?? fingerprint, jobListingId: existingByTitleOrUrl.id };
  }

  // ===== TIER 3: Fuzzy matching — same company + (similar title OR same URL path) =====
  const urlPathKey = getUrlPathKey(listing.sourceUrl);
  const normalizedNewTitle = normalizeTitle(listing.title);

  // Get all job listings for this company + country to do fuzzy comparison
  const companyJobs = await prisma.jobListing.findMany({
    where: { companyId, ...(market && { country: market }) },
    select: { id: true, fingerprint: true, title: true, sourceUrl: true, canonicalUrl: true },
  });

  for (const bc of companyJobs) {
    // Check URL path match (ignore query params)
    if (urlPathKey) {
      const existingPathKey = getUrlPathKey(bc.sourceUrl);
      if (existingPathKey && existingPathKey === urlPathKey) {
        console.log(`  [Dedup] URL path match: "${listing.title.substring(0, 40)}" ≈ "${bc.title.substring(0, 40)}"`);
        await prisma.jobListing.update({
          where: { id: bc.id },
          data: {
            title: listing.title.length > bc.title.length ? listing.title : undefined,
            description: listing.description || undefined,
            requirements: listing.requirements || undefined,
            benefits: listing.benefits || undefined,
            summary: listing.summary || undefined,
            imageUrl: listing.imageUrls[0] || null,
            deadline: listing.deadline,
            postedDate: listing.postedDate,
            salaryMin: listing.salaryMin,
            salaryMax: listing.salaryMax,
            salaryCurrency: listing.salaryCurrency,
            salaryPeriod: listing.salaryPeriod,
            jobType: listing.jobType ?? 'FULL_TIME',
            workMode: listing.workMode ?? 'ON_SITE',
            experienceLevel: listing.experienceLevel,
            sector: listing.sector ?? 'OTHER',
            city: listing.city,
            state: listing.state,
            lastSeenAt: new Date(),
          },
        });
        return { isNew: false, fingerprint: bc.fingerprint ?? fingerprint, jobListingId: bc.id };
      }
    }

    // Check fuzzy title match
    const existingNormTitle = normalizeTitle(bc.title);
    if (isSimilarTitle(normalizedNewTitle, existingNormTitle)) {
      console.log(`  [Dedup] Fuzzy title match: "${listing.title.substring(0, 40)}" ≈ "${bc.title.substring(0, 40)}"`);
      await prisma.jobListing.update({
        where: { id: bc.id },
        data: {
          title: listing.title.length > bc.title.length ? listing.title : undefined,
          description: listing.description || undefined,
          requirements: listing.requirements || undefined,
          benefits: listing.benefits || undefined,
          summary: listing.summary || undefined,
          imageUrl: listing.imageUrls[0] || null,
          deadline: listing.deadline,
          postedDate: listing.postedDate,
          salaryMin: listing.salaryMin,
          salaryMax: listing.salaryMax,
          salaryCurrency: listing.salaryCurrency,
          salaryPeriod: listing.salaryPeriod,
          jobType: listing.jobType ?? 'FULL_TIME',
          workMode: listing.workMode ?? 'ON_SITE',
          experienceLevel: listing.experienceLevel,
          sector: listing.sector ?? 'OTHER',
          city: listing.city,
          state: listing.state,
          lastSeenAt: new Date(),
        },
      });
      return { isNew: false, fingerprint: bc.fingerprint ?? fingerprint, jobListingId: bc.id };
    }
  }

  // ===== No match found — create new job listing =====
  try {
    const created = await prisma.jobListing.create({
      data: {
        title: listing.title,
        slug: slugify(listing.title) + '-' + Date.now().toString(36),
        description: listing.description,
        requirements: listing.requirements,
        benefits: listing.benefits,
        summary: listing.summary,
        companyId,
        sourceId,
        sourceUrl: listing.sourceUrl,
        canonicalUrl: listing.canonicalUrl,
        fingerprint,
        imageUrl: listing.imageUrls[0] || null,
        deadline: listing.deadline,
        postedDate: listing.postedDate,
        salaryMin: listing.salaryMin,
        salaryMax: listing.salaryMax,
        salaryCurrency: listing.salaryCurrency,
        salaryPeriod: listing.salaryPeriod,
        jobType: listing.jobType ?? 'FULL_TIME',
        workMode: listing.workMode ?? 'ON_SITE',
        experienceLevel: listing.experienceLevel,
        sector: listing.sector ?? 'OTHER',
        city: listing.city,
        state: listing.state,
        country: market ?? Market.TR,
        status: 'ACTIVE',
        lastSeenAt: new Date(),
      },
    });

    return { isNew: true, fingerprint, jobListingId: created.id };
  } catch (error: any) {
    // P2002 = Unique constraint violation — a parallel crawl already inserted this job listing
    if (error?.code === 'P2002') {
      console.log(`  [Dedup] Race condition caught — duplicate prevented for: "${listing.title.substring(0, 50)}"`);
      const raceWinner = await prisma.jobListing.findFirst({
        where: {
          companyId,
          ...(market && { country: market }),
          OR: [
            { canonicalUrl: listing.canonicalUrl },
            { title: listing.title },
          ],
          status: 'ACTIVE',
        },
        select: { id: true, fingerprint: true },
      });
      if (raceWinner) {
        await prisma.jobListing.update({
          where: { id: raceWinner.id },
          data: { lastSeenAt: new Date() },
        });
        return { isNew: false, fingerprint: raceWinner.fingerprint ?? fingerprint, jobListingId: raceWinner.id };
      }
      return { isNew: false, fingerprint, jobListingId: 'race-condition-unknown' };
    }
    throw error;
  }
}

/**
 * In-batch deduplication: removes duplicates within a single crawl batch
 * BEFORE hitting the database. This prevents the same listing being inserted
 * twice when it appears at multiple URLs in the same crawl.
 */
export function deduplicateBatch(listings: NormalizedJobListing[]): NormalizedJobListing[] {
  const seen = new Map<string, NormalizedJobListing>();

  for (const c of listings) {
    const titleKey = normalizeTitle(c.title);
    const urlPathKey = getUrlPathKey(c.sourceUrl);

    // Check if we already have a listing with the same normalized title
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
function hasMoreData(candidate: NormalizedJobListing, existing: NormalizedJobListing): boolean {
  let candidateScore = 0;
  let existingScore = 0;

  if (candidate.description && candidate.description.length > 20) candidateScore++;
  if (existing.description && existing.description.length > 20) existingScore++;

  if (candidate.requirements && candidate.requirements.length > 10) candidateScore++;
  if (existing.requirements && existing.requirements.length > 10) existingScore++;

  if (candidate.imageUrls.length > 0) candidateScore++;
  if (existing.imageUrls.length > 0) existingScore++;

  if (candidate.deadline) candidateScore++;
  if (existing.deadline) existingScore++;

  if (candidate.salaryMin != null || candidate.salaryMax != null) candidateScore++;
  if (existing.salaryMin != null || existing.salaryMax != null) existingScore++;

  if (candidate.title.length > existing.title.length) candidateScore++;
  else if (existing.title.length > candidate.title.length) existingScore++;

  return candidateScore > existingScore;
}
