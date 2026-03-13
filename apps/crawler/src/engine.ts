import { PrismaClient, CrawlMethod, CrawlStatus, Market } from '@prisma/client';
import { CrawlMarket } from './config';
import { SelectorsConfig } from '@maviyaka/shared';
import { scrapeCampaigns, closeBrowser } from './processors/scrape.processor';
import { scrapeGeneric } from './processors/generic-scraper';
import { scrapeGenericPlaywright } from './processors/playwright-fallback';
import { fetchRssCampaigns } from './processors/rss.processor';
import { fetchApiCampaigns } from './processors/api.processor';
import { normalizeCampaign, RawCampaignData } from './pipeline/normalize';
import { filterCampaigns, filterCampaignsWithAI } from './pipeline/quality-filter';
import { checkAndUpsert, deduplicateBatch } from './pipeline/deduplicate';
import { runAging } from './pipeline/aging';
import { notifyNewCampaigns } from './notify';

export interface CrawlResult {
  sourceId: string;
  sourceName: string;
  status: CrawlStatus;
  campaignsFound: number;
  campaignsNew: number;
  campaignsUpdated: number;
  errorMessage: string | null;
  durationMs: number;
}

/** Max total time for a single source (scraping + AI filter + dedup + upsert) */
const GLOBAL_SOURCE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

/** How many sources to crawl in parallel (Contabo: 4 vCPU, 8GB RAM — mostly I/O-bound) */
const CRAWL_CONCURRENCY = 6;

/** Max active campaigns per brand — prevents any single brand from dominating */
const MAX_CAMPAIGNS_PER_BRAND = 50;

/** Throttle delay after inserting a new campaign — reduces DB connection pressure */
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
    include: { brand: true },
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
      campaignsFound: 0,
      campaignsNew: 0,
      campaignsUpdated: 0,
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

    if (source.crawlMethod === CrawlMethod.RSS || source.crawlMethod === CrawlMethod.FEED) {
      effectiveUrls = source.discoveredFeedUrl ? [source.discoveredFeedUrl] : source.seedUrls;
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
            case CrawlMethod.RSS:
            case CrawlMethod.FEED: {
              urlCampaigns = await fetchRssCampaigns(url);
              break;
            }
            case CrawlMethod.API: {
              const baseUrl = source.seedUrls[0] || url;
              urlCampaigns = await fetchApiCampaigns(url, baseUrl);
              break;
            }
            case CrawlMethod.CAMPAIGN:
            case CrawlMethod.PRODUCT:
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
    console.error(`[Crawl] Error fetching: ${errorMessage}${rawCampaigns.length > 0 ? ` (${rawCampaigns.length} campaigns found before timeout)` : ''}`);
  }

  // Process campaigns through pipeline
  let campaignsNew = 0;
  let campaignsUpdated = 0;
  const newCampaignIds: string[] = [];

  if (rawCampaigns.length > 0) {
    console.log(`[Crawl] Processing ${rawCampaigns.length} campaigns...`);

    // Step 1: Normalize all raw campaigns
    const normalized = rawCampaigns.map((raw) => normalizeCampaign(raw));

    // Step 2: Quality filter — reject low-quality campaigns
    // Use AI-enhanced filter if GROQ_API_KEY is configured, otherwise static filter
    const brandName = source.brand?.name;
    const { passed } = process.env.GROQ_API_KEY
      ? await filterCampaignsWithAI(normalized, brandName, source.market)
      : filterCampaigns(normalized, brandName, source.market);

    // Step 3: In-batch deduplication (remove duplicates within this crawl)
    const unique = deduplicateBatch(passed);
    if (unique.length < passed.length) {
      console.log(`  [Dedup] Batch dedup: ${passed.length} → ${unique.length} (${passed.length - unique.length} batch duplicates removed)`);
    }

    // Step 4: Check brand campaign limit before upserting
    const existingCount = await prisma.campaign.count({
      where: { brandId: source.brandId, status: 'ACTIVE' },
    });
    const remainingSlots = Math.max(0, MAX_CAMPAIGNS_PER_BRAND - existingCount);
    if (remainingSlots === 0) {
      console.log(`  [Limit] Brand "${source.brand?.name}" already has ${existingCount} active campaigns (max ${MAX_CAMPAIGNS_PER_BRAND}), skipping upsert`);
    } else if (remainingSlots < unique.length) {
      console.log(`  [Limit] Brand "${source.brand?.name}" has ${existingCount}/${MAX_CAMPAIGNS_PER_BRAND} campaigns, ${remainingSlots} slots remaining`);
    }

    // Step 5: Deduplicate against DB and upsert
    let insertedCount = 0;
    for (const campaign of unique) {
      try {
        // Skip new inserts if brand is at limit (but still allow updates to existing)
        if (insertedCount >= remainingSlots && remainingSlots < unique.length) {
          // Only allow updates, not new inserts — check if campaign already exists
          const existing = await prisma.campaign.findFirst({
            where: { brandId: source.brandId, title: campaign.title, status: 'ACTIVE' },
            select: { id: true },
          });
          if (!existing) continue; // Skip — brand at limit
        }

        const result = await checkAndUpsert(
          prisma,
          source.id,
          source.brandId,
          source.brand?.categoryId ?? null,
          campaign,
          source.market,
        );

        if (result.isNew) {
          campaignsNew++;
          insertedCount++;
          newCampaignIds.push(result.campaignId);
          // Throttle new inserts to reduce DB connection pressure during crawl
          await new Promise((r) => setTimeout(r, DB_WRITE_THROTTLE_MS));
        } else {
          campaignsUpdated++;
        }
      } catch (err) {
        console.warn(`[Crawl] Failed to process campaign "${campaign.title}": ${(err as Error).message}`);
        if (status === CrawlStatus.SUCCESS) {
          status = CrawlStatus.PARTIAL;
          errorMessage = (err as Error).message;
        }
      }
    }
  }

  // Notify followers about new campaigns
  if (newCampaignIds.length > 0) {
    try {
      await notifyNewCampaigns(prisma, source.brandId, newCampaignIds);
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
      campaignsFound: rawCampaigns.length,
      campaignsNew,
      campaignsUpdated,
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
    campaignsFound: rawCampaigns.length,
    campaignsNew,
    campaignsUpdated,
    errorMessage,
    durationMs,
  };

  console.log(
    `[Crawl] Done: ${source.name} — found=${rawCampaigns.length}, new=${campaignsNew}, updated=${campaignsUpdated}, ${durationMs}ms`,
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
    console.log(`[Aging] Expired ${aged} campaigns`);
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
    include: { brand: { select: { name: true, market: true } } },
  });

  console.log(`\n========== Crawl: ${markets.join(', ')} — ${sources.length} sources (concurrency: ${CRAWL_CONCURRENCY}) ==========`);

  const results = await crawlSourcesConcurrently(prisma, sources);

  // Run aging (global — checks all ACTIVE campaigns)
  const aged = await runAging(prisma);
  if (aged > 0) {
    console.log(`[Aging] Expired ${aged} campaigns`);
  }

  await closeBrowser();

  // Post-crawl dedup: remove any duplicates that slipped through race conditions
  const deduped = await postCrawlDedup(prisma, markets);
  if (deduped > 0) {
    console.log(`[Dedup] Post-crawl cleanup: removed ${deduped} duplicate campaigns`);
  }

  const totalNew = results.reduce((s, r) => s + r.campaignsNew, 0);
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
 * Post-crawl duplicate cleanup: finds and removes duplicate ACTIVE campaigns
 * within the same brand+market that have the same title or canonical URL.
 * This catches any duplicates that slipped through due to race conditions.
 */
async function postCrawlDedup(prisma: PrismaClient, markets: Market[]): Promise<number> {
  let totalRemoved = 0;

  // Find title-based duplicates: same brand + market + title, keep oldest (first inserted)
  const titleDupes: Array<{ brand_id: string; market: string; title: string; cnt: string }> =
    await prisma.$queryRawUnsafe(`
      SELECT brand_id, market, title, COUNT(*) as cnt
      FROM campaigns
      WHERE status = 'ACTIVE' AND market = ANY($1::text[])
      GROUP BY brand_id, market, title
      HAVING COUNT(*) > 1
    `, markets);

  for (const dupe of titleDupes) {
    const campaigns = await prisma.campaign.findMany({
      where: {
        brandId: dupe.brand_id,
        market: dupe.market as Market,
        title: dupe.title,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    // Keep first, delete rest
    const toDelete = campaigns.slice(1).map((c) => c.id);
    if (toDelete.length > 0) {
      await prisma.campaign.updateMany({
        where: { id: { in: toDelete } },
        data: { status: 'EXPIRED' },
      });
      totalRemoved += toDelete.length;
    }
  }

  // Find canonical URL duplicates: same brand + market + canonical_url
  const urlDupes: Array<{ brand_id: string; market: string; canonical_url: string; cnt: string }> =
    await prisma.$queryRawUnsafe(`
      SELECT brand_id, market, canonical_url, COUNT(*) as cnt
      FROM campaigns
      WHERE status = 'ACTIVE' AND canonical_url IS NOT NULL AND market = ANY($1::text[])
      GROUP BY brand_id, market, canonical_url
      HAVING COUNT(*) > 1
    `, markets);

  for (const dupe of urlDupes) {
    const campaigns = await prisma.campaign.findMany({
      where: {
        brandId: dupe.brand_id,
        market: dupe.market as Market,
        canonicalUrl: dupe.canonical_url,
        status: 'ACTIVE',
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    const toDelete = campaigns.slice(1).map((c) => c.id);
    if (toDelete.length > 0) {
      await prisma.campaign.updateMany({
        where: { id: { in: toDelete } },
        data: { status: 'EXPIRED' },
      });
      totalRemoved += toDelete.length;
    }
  }

  return totalRemoved;
}
