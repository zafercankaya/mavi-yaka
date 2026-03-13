import * as cheerio from 'cheerio';
// import { SelectorsConfig } from '@maviyaka/shared';
type SelectorsConfig = any; // TODO: restore @maviyaka/shared import when package is ready
import { RawCampaignData } from '../pipeline/normalize';
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
 * Scrape campaigns using CSS selectors.
 * Tries Cheerio (HTTP fetch) first, falls back to Playwright if empty.
 */
export async function scrapeCampaigns(
  seedUrl: string,
  selectors: SelectorsConfig,
  maxDepth: number,
): Promise<RawCampaignData[]> {
  // Try Cheerio first (fast, no browser)
  try {
    const campaigns = await scrapeCampaignsWithCheerio(seedUrl, selectors, maxDepth);
    if (campaigns.length > 0) {
      console.log(`  [Scrape] Cheerio succeeded: ${campaigns.length} campaigns`);
      return campaigns;
    }
    console.log('  [Scrape] Cheerio found nothing, falling back to Playwright');
  } catch (err) {
    console.log(`  [Scrape] Cheerio failed: ${(err as Error).message}, falling back to Playwright`);
  }

  // Playwright fallback
  return scrapeCampaignsWithPlaywright(seedUrl, selectors, maxDepth);
}

// ─── Cheerio-based scraping ───────────────────────────────

async function scrapeCampaignsWithCheerio(
  seedUrl: string,
  selectors: SelectorsConfig,
  maxDepth: number,
): Promise<RawCampaignData[]> {
  console.log(`  [Scrape/Cheerio] Fetching: ${seedUrl}`);
  const html = await fetchHtml(seedUrl);
  const $ = cheerio.load(html);

  const cards = $(selectors.list);
  console.log(`  [Scrape/Cheerio] Found ${cards.length} campaign cards`);

  if (cards.length === 0) return [];

  const campaigns: RawCampaignData[] = [];
  const pageDates = extractDates($);

  // maxDepth <= 1: extract from list page directly
  if (maxDepth <= 1) {
    cards.each((_i, el) => {
      const campaign = extractFromCard($, el, selectors, seedUrl, pageDates);
      if (campaign) campaigns.push(campaign);
    });
    return campaigns;
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

  console.log(`  [Scrape/Cheerio] Extracted ${links.length} unique campaign links`);

  // Visit each detail page
  for (const link of links) {
    try {
      await delay(randomDelay(CRAWL_DELAY_MS));
      const detailHtml = await fetchHtml(link);
      const detail$ = cheerio.load(detailHtml);
      const campaign = extractFromDetail(detail$, selectors, link);
      if (campaign) campaigns.push(campaign);
    } catch (err) {
      console.warn(`  [Scrape/Cheerio] Failed: ${link}: ${(err as Error).message}`);
    }
  }

  return campaigns;
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

async function scrapeCampaignsWithPlaywright(
  seedUrl: string,
  selectors: SelectorsConfig,
  maxDepth: number,
): Promise<RawCampaignData[]> {
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

  const campaigns: RawCampaignData[] = [];

  try {
    const page = await context.newPage();
    page.setDefaultTimeout(REQUEST_TIMEOUT_MS);

    await navigateWithFallback(page, seedUrl, selectors.list);

    const html = await page.content();
    const $ = cheerio.load(html);

    const cards = $(selectors.list);
    console.log(`  [Scrape/Playwright] Found ${cards.length} campaign cards`);

    if (cards.length === 0) {
      await page.close();
      return [];
    }

    const pageDates = extractDates($);

    if (maxDepth <= 1) {
      cards.each((_i, el) => {
        const campaign = extractFromCard($, el, selectors, seedUrl, pageDates);
        if (campaign) campaigns.push(campaign);
      });
      await page.close();
      return campaigns;
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
        const campaign = extractFromDetail(detail$, selectors, link);
        if (campaign) campaigns.push(campaign);
      } catch (err) {
        console.warn(`  [Scrape/Playwright] Failed: ${link}: ${(err as Error).message}`);
      }
    }

    await page.close();
  } finally {
    await context.close();
  }

  return campaigns;
}

// ─── Extraction helpers ───────────────────────────────────

function extractFromCard(
  $: cheerio.CheerioAPI,
  el: any,
  selectors: SelectorsConfig,
  baseUrl: string,
  pageDates: { startDate: string | null; endDate: string | null },
): RawCampaignData | null {
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

  const discountText = selectors.discountRate
    ? $(el).find(selectors.discountRate).first().text().trim()
    : '';
  const discountRate = parseDiscount(discountText || title);

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

  return {
    title,
    description,
    sourceUrl,
    imageUrls,
    postedDate: startDate ?? undefined,
    deadline: endDate ?? undefined,
  };
}

function extractFromDetail(
  $: cheerio.CheerioAPI,
  selectors: SelectorsConfig,
  sourceUrl: string,
): RawCampaignData | null {
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

  const discountText = selectors.discountRate
    ? $(selectors.discountRate).first().text().trim()
    : '';
  const discountRate = parseDiscount(discountText || title);

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

  return {
    title,
    description,
    sourceUrl,
    imageUrls,
    postedDate: startDate ?? undefined,
    deadline: endDate ?? undefined,
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

const MATERIAL_PATTERN_SCRAPE = /(?:pamuk|cotton|polyester|elastan|viskon|viscose|keten|linen|yün|wool|ipek|silk|naylon|nylon|akrilik|acrylic|sentetik|lycra|rayon)/i;

function parseDiscount(text: string): number | null {
  if (!text) return null;
  const match = text.match(/%\s*(\d+)/) || text.match(/(\d+)\s*%/);
  if (!match) return null;
  const val = parseInt(match[1], 10);
  if (val < 1 || val > 95) return null;
  // Check if % refers to material composition, not discount
  const afterMatch = text.substring(match.index! + match[0].length, match.index! + match[0].length + 30);
  if (MATERIAL_PATTERN_SCRAPE.test(afterMatch)) return null;
  return val;
}
