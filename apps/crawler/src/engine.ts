import { PrismaClient, CrawlMethod, CrawlStatus, Market } from '@prisma/client';
import { CrawlMarket } from './config';
// import { SelectorsConfig } from '@maviyaka/shared';
type SelectorsConfig = any; // TODO: restore @maviyaka/shared import when package is ready
import { scrapeCampaigns, closeBrowser } from './processors/scrape.processor';
import { scrapeGeneric } from './processors/generic-scraper';
import { scrapeGenericPlaywright } from './processors/playwright-fallback';
import { fetchRssCampaigns } from './processors/rss.processor';
import { fetchApiCampaigns } from './processors/api.processor';
import { normalizeCampaign, RawCampaignData } from './pipeline/normalize';
import { filterCampaigns, filterCampaignsWithAI } from './pipeline/quality-filter';
import { checkAndUpsert, deduplicateBatch } from './pipeline/deduplicate';
import { runAging } from './pipeline/aging';
import { notifyNewJobListings } from './notify';

export interface CrawlResult {
  sourceId: string;
  sourceName: string;
  status: CrawlStatus;
  jobsFound: number;
  jobsNew: number;
  jobsUpdated: number;
  errorMessage: string | null;
  durationMs: number;
}

/** Max total time for a single source (scraping + AI filter + dedup + upsert) */
const GLOBAL_SOURCE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

/** How many sources to crawl in parallel (Contabo: 4 vCPU, 8GB RAM — mostly I/O-bound) */
const CRAWL_CONCURRENCY = 6;

/** Max active job listings per company — prevents any single company from dominating */
const MAX_JOBS_PER_COMPANY = 50;

/** Throttle delay after inserting a new job listing — reduces DB connection pressure */
const DB_WRITE_THROTTLE_MS = 150;

/**
 * Clean up stale RUNNING crawl logs that are older than the given threshold.
 * This handles cases where the process crashed mid-crawl, leaving logs stuck as RUNNING.
 */
export async function cleanupStaleLogs(
  prisma: PrismaClient,
  staleThresholdMs: number = 6 * 60 * 1000, // 6 minutes default (global timeout is 5min + 1min margin)
): Promise<number> {
  const cutoff = new Date(Date.now() - staleThresholdMs);
  const result = await prisma.crawlLog.updateMany({
    where: {
      status: CrawlStatus.RUNNING,
      createdAt: { lt: cutoff },
    },
    data: {
      status: CrawlStatus.FAILED,
      errorMessage: `Stale log cleanup: stuck RUNNING for >${Math.round(staleThresholdMs / 60000)} minutes`,
    },
  });

  if (result.count > 0) {
    console.log(`[Cleanup] Marked ${result.count} stale RUNNING logs as FAILED`);
  }

  return result.count;
}

export async function crawlSource(
  prisma: PrismaClient,
  sourceId: string,
  existingLogId?: string,
): Promise<CrawlResult> {
  const startTime = Date.now();

  const source = await prisma.crawlSource.findUnique({
    where: { id: sourceId },
    include: { company: true },
  });

  if (!source) {
    throw new Error(`Source not found: ${sourceId}`);
  }

  console.log(`\n[Crawl] Starting: ${source.name} (${source.crawlMethod}, ${source.seedUrls.length} URLs)`);

  // Use existing log (from API trigger) or create new one (from scheduler)
  let log: { id: string };
  if (existingLogId) {
    log = { id: existingLogId };
  } else {
    log = await prisma.crawlLog.create({
      data: {
        sourceId: source.id,
        status: CrawlStatus.RUNNING,
      },
    });
  }

  // Wrap the entire crawl in a global timeout
  let globalTimeoutId: ReturnType<typeof setTimeout>;
  const globalTimeoutPromise = new Promise<never>((_, reject) => {
    globalTimeoutId = setTimeout(() => {
      reject(new Error(`Global source timeout after ${GLOBAL_SOURCE_TIMEOUT_MS / 1000}s (includes AI filter + dedup)`));
    }, GLOBAL_SOURCE_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([
      crawlSourceInternal(prisma, source, log),
      globalTimeoutPromise,
    ]);
    return result;
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage = (err as Error).message;
    console.error(`[Crawl] Global timeout/error for ${source.name}: ${errorMessage}`);

    // Note: Don't close shared browser here — other concurrent workers may be using it.
    // The abort signal in crawlSourceInternal handles context-level cleanup.

    // Update log as FAILED due to global timeout
    await prisma.crawlLog.update({
      where: { id: log.id },
      data: {
        status: CrawlStatus.FAILED,
        errorMessage,
        durationMs,
      },
    });

    return {
      sourceId: source.id,
      sourceName: source.name,
      status: CrawlStatus.FAILED,
      jobsFound: 0,
      jobsNew: 0,
      jobsUpdated: 0,
      errorMessage,
      durationMs,
    };
  } finally {
    clearTimeout(globalTimeoutId!);
  }
}

async function crawlSourceInternal(
  prisma: PrismaClient,
  source: any,
  log: { id: string },
): Promise<CrawlResult> {
  const startTime = Date.now();

  let rawCampaigns: RawCampaignData[] = [];
  let errorMessage: string | null = null;
  let status: CrawlStatus = CrawlStatus.SUCCESS;

  const SOURCE_TIMEOUT_MS = 60_000; // 1 min max per source scraping phase

  try {
    // Determine effective crawl method and URLs
    let effectiveMethod = source.crawlMethod;
    let effectiveUrls = source.seedUrls;

    if (source.crawlMethod === CrawlMethod.RSS) {
      // RSS method — just use seedUrls directly
      effectiveUrls = source.seedUrls;
    } else if (source.crawlMethod === CrawlMethod.API) {
      effectiveUrls = source.discoveredApiUrl ? [source.discoveredApiUrl] : source.seedUrls;
    }

    // Deduplicate URLs (strip hash fragments — they resolve to same page)
    const seenUrls = new Set<string>();
    const dedupedUrls = effectiveUrls.filter((u: string) => {
      try {
        const parsed = new URL(u);
        parsed.hash = '';
        const clean = parsed.toString();
        if (seenUrls.has(clean)) return false;
        seenUrls.add(clean);
        return true;
      } catch {
        return true;
      }
    });

    // Crawl each URL with per-source timeout using AbortController
    const abortController = new AbortController();
    const abortSignal = abortController.signal;

    const crawlPromise = (async () => {
      for (const url of dedupedUrls) {
        if (abortSignal.aborted) break;
        try {
          console.log(`[Crawl] Processing URL: ${url}`);
          let urlCampaigns: RawCampaignData[] = [];

          switch (effectiveMethod) {
            case CrawlMethod.RSS: {
              urlCampaigns = await fetchRssCampaigns(url);
              break;
            }
            case CrawlMethod.API: {
              const baseUrl = source.seedUrls[0] || url;
              urlCampaigns = await fetchApiCampaigns(url, baseUrl);
              break;
            }
            case CrawlMethod.HTML:
            default: {
              const selectors = source.selectors as SelectorsConfig | null;
              if (selectors) {
                urlCampaigns = await scrapeCampaigns(url, selectors, source.maxDepth);
              } else {
                // Pass rawCampaigns as accumulator so results are available even on timeout
                const beforeCount = rawCampaigns.length;
                try {
                  await scrapeGeneric(url, source.maxDepth, source.market as CrawlMarket, abortSignal, rawCampaigns);
                } catch (cheerioErr) {
                  console.log(`  [Engine] Cheerio failed: ${(cheerioErr as Error).message}`);
                }
                const genericFound = rawCampaigns.length - beforeCount;

                if (genericFound === 0 && !abortSignal.aborted) {
                  console.log(`  [Engine] Trying Playwright fallback for ${url}`);
                  urlCampaigns = await scrapeGenericPlaywright(url, source.maxDepth, source.market as CrawlMarket, abortSignal);
                } else {
                  // scrapeGeneric already pushed to rawCampaigns, skip push below
                  urlCampaigns = [];
                }
              }
              break;
            }
          }

          rawCampaigns.push(...urlCampaigns);
        } catch (err) {
          if (abortSignal.aborted) break;
          console.warn(`[Crawl] Error on URL ${url}: ${(err as Error).message}`);
          if (status === CrawlStatus.SUCCESS) {
            status = CrawlStatus.PARTIAL;
            errorMessage = `URL failed: ${url} — ${(err as Error).message}`;
          }
        }
      }
    })();

    let timeoutId: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(() => {
        abortController.abort();
        reject(new Error(`Source timeout after ${SOURCE_TIMEOUT_MS / 1000}s`));
      }, SOURCE_TIMEOUT_MS);
    });

    try {
      await Promise.race([crawlPromise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutId!);
    }

    // If all URLs failed, mark as FAILED
    if (rawCampaigns.length === 0 && (status as CrawlStatus) === CrawlStatus.PARTIAL) {
      status = CrawlStatus.FAILED;
    }
  } catch (err) {
    errorMessage = (err as Error).message;
    // If we already found some campaigns before the timeout, mark as PARTIAL not FAILED
    status = rawCampaigns.length > 0 ? CrawlStatus.PARTIAL : CrawlStatus.FAILED;
    console.error(`[Crawl] Error fetching: ${errorMessage}${rawCampaigns.length > 0 ? ` (${rawCampaigns.length} jobs found before timeout)` : ''}`);
  }

  // Process job listings through pipeline
  let jobsNew = 0;
  let jobsUpdated = 0;
  const newJobIds: string[] = [];

  if (rawCampaigns.length > 0) {
    console.log(`[Crawl] Processing ${rawCampaigns.length} job listings...`);

    // Step 1: Normalize all raw campaigns
    const normalized = rawCampaigns.map((raw) => normalizeCampaign(raw));

    // Step 2: Quality filter — reject low-quality entries
    // Use AI-enhanced filter if GROQ_API_KEY is configured, otherwise static filter
    const companyName = source.company?.name;
    const { passed } = process.env.GROQ_API_KEY
      ? await filterCampaignsWithAI(normalized, companyName, source.market)
      : filterCampaigns(normalized, companyName, source.market);

    // Step 3: In-batch deduplication (remove duplicates within this crawl)
    const unique = deduplicateBatch(passed);
    if (unique.length < passed.length) {
      console.log(`  [Dedup] Batch dedup: ${passed.length} → ${unique.length} (${passed.length - unique.length} batch duplicates removed)`);
    }

    // Step 4: Check company job listing limit before upserting
    const existingCount = await prisma.jobListing.count({
      where: { companyId: source.companyId, status: 'ACTIVE' },
    });
    const remainingSlots = Math.max(0, MAX_JOBS_PER_COMPANY - existingCount);
    if (remainingSlots === 0) {
      console.log(`  [Limit] Company "${source.company?.name}" already has ${existingCount} active job listings (max ${MAX_JOBS_PER_COMPANY}), skipping upsert`);
    } else if (remainingSlots < unique.length) {
      console.log(`  [Limit] Company "${source.company?.name}" has ${existingCount}/${MAX_JOBS_PER_COMPANY} job listings, ${remainingSlots} slots remaining`);
    }

    // Step 5: Deduplicate against DB and upsert
    let insertedCount = 0;
    for (const campaign of unique) {
      try {
        // Skip new inserts if company is at limit (but still allow updates to existing)
        if (insertedCount >= remainingSlots && remainingSlots < unique.length) {
          // Only allow updates, not new inserts — check if job listing already exists
          const existing = await prisma.jobListing.findFirst({
            where: { companyId: source.companyId, title: campaign.title, status: 'ACTIVE' },
            select: { id: true },
          });
          if (!existing) continue; // Skip — company at limit
        }

        const result = await checkAndUpsert(
          prisma,
          source.id,
          source.companyId,
          source.company?.sector ?? null,
          campaign,
          source.market,
        );

        if (result.isNew) {
          jobsNew++;
          insertedCount++;
          newJobIds.push(result.jobListingId);
          // Throttle new inserts to reduce DB connection pressure during crawl
          await new Promise((r) => setTimeout(r, DB_WRITE_THROTTLE_MS));
        } else {
          jobsUpdated++;
        }
      } catch (err) {
        console.warn(`[Crawl] Failed to process job listing "${campaign.title}": ${(err as Error).message}`);
        if (status === CrawlStatus.SUCCESS) {
          status = CrawlStatus.PARTIAL;
          errorMessage = (err as Error).message;
        }
      }
    }
  }

  // Notify followers about new job listings
  if (newJobIds.length > 0) {
    try {
      await notifyNewJobListings(prisma, source.companyId, newJobIds);
    } catch (err) {
      console.warn(`[Crawl] Notification failed: ${(err as Error).message}`);
    }
  }

  const durationMs = Date.now() - startTime;

  // Update log entry
  await prisma.crawlLog.update({
    where: { id: log.id },
    data: {
      status,
      jobsFound: rawCampaigns.length,
      jobsNew,
      jobsUpdated,
      errorMessage,
      durationMs,
    },
  });

  // Update source lastCrawledAt
  await prisma.crawlSource.update({
    where: { id: source.id },
    data: { lastCrawledAt: new Date() },
  });

  const result: CrawlResult = {
    sourceId: source.id,
    sourceName: source.name,
    status,
    jobsFound: rawCampaigns.length,
    jobsNew,
    jobsUpdated,
    errorMessage,
    durationMs,
  };

  console.log(
    `[Crawl] Done: ${source.name} — found=${rawCampaigns.length}, new=${jobsNew}, updated=${jobsUpdated}, ${durationMs}ms`,
  );

  return result;
}

export async function crawlAllActive(prisma: PrismaClient): Promise<CrawlResult[]> {
  // Clean up stale RUNNING logs before starting
  await cleanupStaleLogs(prisma);

  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
  });

  console.log(`\n========== Crawl Run: ${sources.length} active sources ==========`);

  const results = await crawlSourcesConcurrently(prisma, sources);

  // Run aging after all crawls
  const aged = await runAging(prisma);
  if (aged > 0) {
    console.log(`[Aging] Expired ${aged} job listings`);
  }

  // Close browser if it was used
  await closeBrowser();

  console.log(`========== Crawl Run Complete ==========\n`);
  return results;
}

/**
 * Crawl only sources belonging to specific markets.
 * Used by the scheduler to run 2 markets per hour slot.
 */
export async function crawlByMarkets(prisma: PrismaClient, markets: Market[]): Promise<CrawlResult[]> {
  await cleanupStaleLogs(prisma);

  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true, market: { in: markets } },
    include: { company: { select: { name: true, market: true } } },
  });

  console.log(`\n========== Crawl: ${markets.join(', ')} — ${sources.length} sources (concurrency: ${CRAWL_CONCURRENCY}) ==========`);

  const results = await crawlSourcesConcurrently(prisma, sources);

  // Run aging (global — checks all ACTIVE job listings)
  const aged = await runAging(prisma);
  if (aged > 0) {
    console.log(`[Aging] Expired ${aged} job listings`);
  }

  await closeBrowser();

  // Post-crawl dedup: remove any duplicates that slipped through race conditions
  const deduped = await postCrawlDedup(prisma, markets);
  if (deduped > 0) {
    console.log(`[Dedup] Post-crawl cleanup: removed ${deduped} duplicate job listings`);
  }

  const totalNew = results.reduce((s, r) => s + r.jobsNew, 0);
  console.log(`========== ${markets.join(', ')} Complete: ${results.length} sources, ${totalNew} new ==========\n`);
  return results;
}

/**
 * Process sources with controlled concurrency (pool pattern).
 * Runs CRAWL_CONCURRENCY sources in parallel at any given time.
 */
async function crawlSourcesConcurrently(
  prisma: PrismaClient,
  sources: Array<{ id: string }>,
): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  let index = 0;
  let completed = 0;

  async function worker(): Promise<void> {
    while (index < sources.length) {
      const i = index++;
      const source = sources[i];
      try {
        const result = await crawlSource(prisma, source.id);
        results.push(result);
      } catch (err) {
        console.error(`[Crawl] Fatal error for source ${source.id}: ${(err as Error).message}`);
      }
      completed++;

      // Periodic stale log cleanup every 50 completed sources
      if (completed % 50 === 0) {
        await cleanupStaleLogs(prisma);
        console.log(`[Progress] ${completed}/${sources.length} sources completed`);
      }
    }
  }

  // Launch worker pool
  const workers: Promise<void>[] = [];
  for (let w = 0; w < Math.min(CRAWL_CONCURRENCY, sources.length); w++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  return results;
}

/**
 * Post-crawl duplicate cleanup: finds and removes duplicate ACTIVE job listings
 * within the same company+market that have the same title or canonical URL.
 * This catches any duplicates that slipped through due to race conditions.
 */
async function postCrawlDedup(prisma: PrismaClient, markets: Market[]): Promise<number> {
  let totalRemoved = 0;

  // Find title-based duplicates: same company + market + title, keep oldest (first inserted)
  const titleDupes: Array<{ company_id: string; country: string; title: string; cnt: string }> =
    await prisma.$queryRawUnsafe(`
      SELECT company_id, country, title, COUNT(*) as cnt
      FROM job_listings
      WHERE status = 'ACTIVE' AND country = ANY($1::text[])
      GROUP BY company_id, country, title
      HAVING COUNT(*) > 1
    `, markets);

  for (const dupe of titleDupes) {
    const jobListings = await prisma.jobListing.findMany({
      where: {
        companyId: dupe.company_id,
        country: dupe.country as Market,
        title: dupe.title,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    // Keep first, delete rest
    const toDelete = jobListings.slice(1).map((j) => j.id);
    if (toDelete.length > 0) {
      await prisma.jobListing.updateMany({
        where: { id: { in: toDelete } },
        data: { status: 'EXPIRED' },
      });
      totalRemoved += toDelete.length;
    }
  }

  // Find canonical URL duplicates: same company + market + canonical_url
  const urlDupes: Array<{ company_id: string; country: string; canonical_url: string; cnt: string }> =
    await prisma.$queryRawUnsafe(`
      SELECT company_id, country, canonical_url, COUNT(*) as cnt
      FROM job_listings
      WHERE status = 'ACTIVE' AND canonical_url IS NOT NULL AND country = ANY($1::text[])
      GROUP BY company_id, country, canonical_url
      HAVING COUNT(*) > 1
    `, markets);

  for (const dupe of urlDupes) {
    const jobListings = await prisma.jobListing.findMany({
      where: {
        companyId: dupe.company_id,
        country: dupe.country as Market,
        canonicalUrl: dupe.canonical_url,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    const toDelete = jobListings.slice(1).map((j) => j.id);
    if (toDelete.length > 0) {
      await prisma.jobListing.updateMany({
        where: { id: { in: toDelete } },
        data: { status: 'EXPIRED' },
      });
      totalRemoved += toDelete.length;
    }
  }

  return totalRemoved;
}
