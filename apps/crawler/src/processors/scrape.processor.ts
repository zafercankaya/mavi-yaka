import * as cheerio from 'cheerio';
// import { SelectorsConfig } from '@maviyaka/shared';
type SelectorsConfig = any; // TODO: restore @maviyaka/shared import when package is ready
import { RawJobData } from '../pipeline/normalize';
import { CRAWL_DELAY_MS, REQUEST_TIMEOUT_MS } from '../config';
import { pickBestFromSrcset } from '../pipeline/optimize-images';
import { extractDates, parseDateRange } from '../utils/date-extractor';
import { getBrowser, closeBrowser } from './playwright-fallback';
import { getStealthHeaders, getRandomUserAgent, randomDelay } from '../utils/stealth';

export { closeBrowser };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: getStealthHeaders(),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    redirect: 'follow',
  });

  // 429 Too Many Requests — single retry after 3s
  if (response.status === 429) {
    await delay(3000);
    const retry = await fetch(url, {
      headers: getStealthHeaders(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      redirect: 'follow',
    });
    if (!retry.ok) throw new Error(`HTTP ${retry.status} ${retry.statusText}`);
    return retry.text();
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Scrape job listings using CSS selectors.
 * Tries Cheerio (HTTP fetch) first, falls back to Playwright if empty.
 */
export async function scrapeJobListings(
  seedUrl: string,
  selectors: SelectorsConfig,
  maxDepth: number,
): Promise<RawJobData[]> {
  // Try Cheerio first (fast, no browser)
  try {
    const jobs = await scrapeJobListingsWithCheerio(seedUrl, selectors, maxDepth);
    if (jobs.length > 0) {
      console.log(`  [Scrape] Cheerio succeeded: ${jobs.length} job listings`);
      return jobs;
    }
    console.log('  [Scrape] Cheerio found nothing, falling back to Playwright');
  } catch (err) {
    console.log(`  [Scrape] Cheerio failed: ${(err as Error).message}, falling back to Playwright`);
  }

  // Playwright fallback
  return scrapeJobListingsWithPlaywright(seedUrl, selectors, maxDepth);
}

// ─── Cheerio-based scraping ───────────────────────────────

async function scrapeJobListingsWithCheerio(
  seedUrl: string,
  selectors: SelectorsConfig,
  maxDepth: number,
): Promise<RawJobData[]> {
  console.log(`  [Scrape/Cheerio] Fetching: ${seedUrl}`);
  const html = await fetchHtml(seedUrl);
  const $ = cheerio.load(html);

  const cards = $(selectors.list);
  console.log(`  [Scrape/Cheerio] Found ${cards.length} job listing cards`);

  if (cards.length === 0) return [];

  const jobs: RawJobData[] = [];
  const pageDates = extractDates($);

  // maxDepth <= 1: extract from list page directly
  if (maxDepth <= 1) {
    cards.each((_i, el) => {
      const job = extractFromCard($, el, selectors, seedUrl, pageDates);
      if (job) jobs.push(job);
    });
    return jobs;
  }

  // Extract links from cards for depth=2
  const links: string[] = [];
  cards.each((_i, el) => {
    const linkEl = selectors.link ? $(el).find(selectors.link) : $(el).find('a');
    const href = linkEl.first().attr('href') || $(el).attr('href');
    if (href) {
      try {
        const absoluteUrl = new URL(href, seedUrl).toString();
        if (!links.includes(absoluteUrl)) links.push(absoluteUrl);
      } catch { /* invalid URL */ }
    }
  });

  console.log(`  [Scrape/Cheerio] Extracted ${links.length} unique job listing links`);

  // Visit each detail page
  for (const link of links) {
    try {
      await delay(randomDelay(CRAWL_DELAY_MS));
      const detailHtml = await fetchHtml(link);
      const detail$ = cheerio.load(detailHtml);
      const job = extractFromDetail(detail$, selectors, link);
      if (job) jobs.push(job);
    } catch (err) {
      console.warn(`  [Scrape/Cheerio] Failed: ${link}: ${(err as Error).message}`);
    }
  }

  return jobs;
}

// ─── Playwright-based scraping (fallback) ─────────────────

async function navigateWithFallback(
  page: any,
  url: string,
  listSelector?: string,
): Promise<void> {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: REQUEST_TIMEOUT_MS });
  } catch {
    console.log(`  Fallback: retrying with 'commit' wait strategy`);
    await page.goto(url, { waitUntil: 'commit', timeout: REQUEST_TIMEOUT_MS });
  }

  if (listSelector) {
    try {
      await page.waitForSelector(listSelector, { timeout: 10000 });
    } catch {
      console.log(`  Selector "${listSelector}" not found within 10s, proceeding`);
    }
  }

  await delay(1500);
}

async function scrapeJobListingsWithPlaywright(
  seedUrl: string,
  selectors: SelectorsConfig,
  maxDepth: number,
): Promise<RawJobData[]> {
  console.log(`  [Scrape/Playwright] Fallback for: ${seedUrl}`);

  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: getRandomUserAgent(),
    locale: 'tr-TR',
    extraHTTPHeaders: getStealthHeaders(),
  });

  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['font', 'media', 'websocket'].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  const jobs: RawJobData[] = [];

  try {
    const page = await context.newPage();
    page.setDefaultTimeout(REQUEST_TIMEOUT_MS);

    await navigateWithFallback(page, seedUrl, selectors.list);

    const html = await page.content();
    const $ = cheerio.load(html);

    const cards = $(selectors.list);
    console.log(`  [Scrape/Playwright] Found ${cards.length} job listing cards`);

    if (cards.length === 0) {
      await page.close();
      return [];
    }

    const pageDates = extractDates($);

    if (maxDepth <= 1) {
      cards.each((_i, el) => {
        const job = extractFromCard($, el, selectors, seedUrl, pageDates);
        if (job) jobs.push(job);
      });
      await page.close();
      return jobs;
    }

    const links: string[] = [];
    cards.each((_i, el) => {
      const linkEl = selectors.link ? $(el).find(selectors.link) : $(el).find('a');
      const href = linkEl.first().attr('href') || $(el).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, seedUrl).toString();
          if (!links.includes(absoluteUrl)) links.push(absoluteUrl);
        } catch { /* invalid URL */ }
      }
    });

    for (const link of links) {
      try {
        await delay(randomDelay(CRAWL_DELAY_MS));
        await navigateWithFallback(page, link);
        const detailHtml = await page.content();
        const detail$ = cheerio.load(detailHtml);
        const job = extractFromDetail(detail$, selectors, link);
        if (job) jobs.push(job);
      } catch (err) {
        console.warn(`  [Scrape/Playwright] Failed: ${link}: ${(err as Error).message}`);
      }
    }

    await page.close();
  } finally {
    await context.close();
  }

  return jobs;
}

// ─── Extraction helpers ───────────────────────────────────

function extractFromCard(
  $: cheerio.CheerioAPI,
  el: any,
  selectors: SelectorsConfig,
  baseUrl: string,
  pageDates: { startDate: string | null; endDate: string | null },
): RawJobData | null {
  const title = $(el).find(selectors.title).first().text().trim();
  if (!title) return null;

  const linkEl = selectors.link ? $(el).find(selectors.link) : $(el).find('a');
  const href = linkEl.first().attr('href') || $(el).attr('href') || '';
  let sourceUrl = baseUrl;
  try {
    if (href) sourceUrl = new URL(href, baseUrl).toString();
  } catch { /* use base */ }

  const description = selectors.description
    ? $(el).find(selectors.description).first().text().trim() || undefined
    : undefined;

  const imageUrls: string[] = [];
  if (selectors.image) {
    $(el).find(selectors.image).each((_i, img) => {
      const bestUrl = extractBestImageSrc($, img, baseUrl);
      if (bestUrl) imageUrls.push(bestUrl);
    });
  }

  // Date extraction: selectors first, then page-level fallback
  const dateText = selectors.startDate
    ? $(el).find(selectors.startDate).first().text().trim() || undefined
    : undefined;
  const parsed = parseDateRange(dateText ?? '');

  const endDateText = selectors.endDate
    ? $(el).find(selectors.endDate).first().text().trim() || undefined
    : undefined;

  const startDate = parsed?.startDate || pageDates.startDate || undefined;
  const endDate = parsed?.endDate || endDateText || pageDates.endDate || undefined;

  // Extract salary text if selector provided
  const salaryText = selectors.salary
    ? $(el).find(selectors.salary).first().text().trim() || undefined
    : undefined;

  // Extract location text if selector provided
  const locationText = selectors.location
    ? $(el).find(selectors.location).first().text().trim() || undefined
    : undefined;

  return {
    title,
    description,
    sourceUrl,
    imageUrls,
    postedDate: startDate ?? undefined,
    deadline: endDate ?? undefined,
    salaryText,
    locationText,
  };
}

function extractFromDetail(
  $: cheerio.CheerioAPI,
  selectors: SelectorsConfig,
  sourceUrl: string,
): RawJobData | null {
  const title = $(selectors.title).first().text().trim();
  if (!title) return null;

  const description = selectors.description
    ? $(selectors.description).first().text().trim() || undefined
    : undefined;

  const imageUrls: string[] = [];
  if (selectors.image) {
    $(selectors.image).each((_i, img) => {
      const bestUrl = extractBestImageSrc($, img, sourceUrl);
      if (bestUrl) imageUrls.push(bestUrl);
    });
  }

  // Date extraction: selectors first, then auto-extract fallback
  const dateText = selectors.startDate
    ? $(selectors.startDate).first().text().trim() || undefined
    : undefined;
  const parsed = parseDateRange(dateText ?? '');

  const endDateText = selectors.endDate
    ? $(selectors.endDate).first().text().trim() || undefined
    : undefined;

  // If selectors didn't find dates, try auto-extraction
  let startDate = parsed?.startDate || undefined;
  let endDate = parsed?.endDate || endDateText || undefined;

  if (!startDate && !endDate) {
    const autoDetected = extractDates($);
    startDate = autoDetected.startDate ?? undefined;
    endDate = autoDetected.endDate ?? undefined;
  }

  // Try to extract salary from detail page
  const salaryText = selectors.salary
    ? $(selectors.salary).first().text().trim() || undefined
    : undefined;

  // Try to extract location from detail page
  const locationText = selectors.location
    ? $(selectors.location).first().text().trim() || undefined
    : undefined;

  // Try to extract job-specific fields from JSON-LD (schema.org/JobPosting)
  let jsonLdData: any = null;
  $('script[type="application/ld+json"]').each((_i, el) => {
    try {
      const json = JSON.parse($(el).html() || '');
      if (json['@type'] === 'JobPosting' || json?.['@graph']?.find?.((g: any) => g['@type'] === 'JobPosting')) {
        jsonLdData = json['@type'] === 'JobPosting' ? json : json['@graph'].find((g: any) => g['@type'] === 'JobPosting');
      }
    } catch {}
  });

  return {
    title: jsonLdData?.title || title,
    description: jsonLdData?.description || description,
    sourceUrl,
    imageUrls,
    postedDate: jsonLdData?.datePosted || startDate || undefined,
    deadline: jsonLdData?.validThrough || endDate || undefined,
    salaryText: jsonLdData?.baseSalary?.value
      ? `${jsonLdData.baseSalary.value.minValue || ''}-${jsonLdData.baseSalary.value.maxValue || ''} ${jsonLdData.baseSalary.currency || ''}`
      : salaryText,
    locationText: jsonLdData?.jobLocation?.address?.addressLocality || locationText,
    jobTypeText: jsonLdData?.employmentType || undefined,
  };
}

function extractBestImageSrc(
  $: cheerio.CheerioAPI,
  img: any,
  baseUrl: string,
): string | null {
  // If img is inside <picture>, prefer <source srcset>
  const parent = $(img).parent();
  if (parent.is('picture')) {
    const source = parent.find('source[srcset]').first();
    if (source.length) {
      const best = pickBestFromSrcset(source.attr('srcset')!, baseUrl);
      if (best) return best;
    }
  }

  const srcset = $(img).attr('srcset') || $(img).attr('data-srcset');
  if (srcset) {
    const best = pickBestFromSrcset(srcset, baseUrl);
    if (best) return best;
  }

  const src = $(img).attr('data-original') || $(img).attr('data-src') || $(img).attr('data-lazy-src') || $(img).attr('data-image') || $(img).attr('src');
  if (src && !src.startsWith('data:')) {
    try { return new URL(src, baseUrl).toString(); } catch { /* skip */ }
  }

  return null;
}
