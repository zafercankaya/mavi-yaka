/**
 * Playwright fallback — used ONLY when Cheerio-based scraping returns empty
 * (e.g., SPA sites that need JavaScript rendering).
 */
import * as cheerio from 'cheerio';
import { chromium, Browser } from 'playwright';
import { RawJobData } from '../pipeline/normalize';
import { CRAWL_DELAY_MS, REQUEST_TIMEOUT_MS, CrawlMarket, getAcceptLanguage, getBrowserLocale } from '../config';
import { pickBestFromSrcset, isLikelyBrandLogo } from '../pipeline/optimize-images';
import { extractDates } from '../utils/date-extractor';
import { getRandomUserAgent, getStealthHeaders, getRandomViewport, STEALTH_CHROMIUM_ARGS, STEALTH_INIT_SCRIPT, randomDelay } from '../utils/stealth';

let browserInstance: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        ...STEALTH_CHROMIUM_ARGS,
      ],
    });
  }
  return browserInstance;
}

export async function closeBrowser(timeoutMs = 10_000): Promise<void> {
  if (browserInstance) {
    const b = browserInstance;
    browserInstance = null; // Clear reference immediately to prevent reuse
    try {
      await Promise.race([
        b.close(),
        new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('closeBrowser timeout')), timeoutMs),
        ),
      ]);
    } catch {
      // If close hangs, force-close all contexts
      try {
        for (const ctx of b.contexts()) { await ctx.close().catch(() => {}); }
      } catch {}
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Material/fabric composition patterns — NOT discounts
const MATERIAL_PATTERN = /(?:pamuk|cotton|polyester|elastan|viskon|viscose|keten|linen|yün|wool|ipek|silk|naylon|nylon|akrilik|acrylic|sentetik|lycra|rayon)/i;

function parseDiscountSafe(text: string): number | undefined {
  const match = text.match(/%\s*(\d+)/) || text.match(/(\d+)\s*%/);
  if (!match) return undefined;
  const val = parseInt(match[1], 10);
  if (val < 1 || val > 95) return undefined;
  // Check if the % is about material composition, not discount
  const afterMatch = text.substring(match.index! + match[0].length, match.index! + match[0].length + 30);
  if (MATERIAL_PATTERN.test(afterMatch)) return undefined;
  return val;
}

/**
 * Fetch HTML from a URL using Playwright (for SPA sites).
 */
export async function fetchHtmlWithPlaywright(url: string, market?: CrawlMarket, abortSignal?: AbortSignal): Promise<string> {
  if (abortSignal?.aborted) throw new Error('Aborted before Playwright fetch');

  const browser = await getBrowser();
  const viewport = getRandomViewport();
  const context = await browser.newContext({
    userAgent: getRandomUserAgent(),
    viewport,
    deviceScaleFactor: Math.random() > 0.5 ? 2 : 1,
    locale: getBrowserLocale(market),
    extraHTTPHeaders: getStealthHeaders(market),
  });

  // Force-close context on abort
  let aborted = false;
  const onAbort = () => {
    aborted = true;
    context.close().catch(() => {});
  };
  if (abortSignal) {
    abortSignal.addEventListener('abort', onAbort, { once: true });
  }

  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['font', 'media', 'websocket'].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  try {
    const page = await context.newPage();
    await page.addInitScript(STEALTH_INIT_SCRIPT);
    page.setDefaultTimeout(REQUEST_TIMEOUT_MS);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: REQUEST_TIMEOUT_MS });
    } catch {
      if (aborted) throw new Error('Aborted');
      await page.goto(url, { waitUntil: 'commit', timeout: REQUEST_TIMEOUT_MS });
    }
    await delay(1000);

    const html = await page.content();
    await page.close();
    return html;
  } finally {
    if (abortSignal) {
      abortSignal.removeEventListener('abort', onAbort);
    }
    if (!aborted) {
      await context.close().catch(() => {});
    }
  }
}

// Job/career-related URL patterns
const JOB_PATH_PATTERNS = [
  /kariyer/i, /is-?ilanlari/i, /is-?ilani/i, /pozisyon/i, /basvuru/i,
  /careers?/i, /jobs?/i, /openings?/i, /hiring/i, /vacancies/i, /vacancy/i,
  /positions?/i, /opportunities/i, /recruitment/i, /work-with-us/i, /join-us/i,
];

const EXCLUDE_PATTERNS = [
  /login|signin|sign-in|giris/i,
  /register|kayit|signup|sign-up/i,
  /privacy|gizlilik/i,
  /terms|sartlar|kosullar/i,
  /contact|iletisim|kontakt|contatti|contactez/i,
  /about|hakkimizda|hakkinda|a-propos|chi-siamo|uber-uns/i,
  /cart|sepet|warenkorb|panier|carrello/i,
  /checkout|odeme|kasse|caisse|cassa/i,
  /account|hesap|hesabim|konto|compte|conto/i,
  /faq|sss|yardim|help|hilfe|aide|aiuto/i,
  /blog\/\d{4}/i,
  /\.pdf$/i, /\.zip$/i, /\.exe$/i,
  /javascript:|mailto:|tel:/i,
  // Customer service / support / shipping / returns pages
  /musteri[_-]?hizmet|customer[_-]?service|kundenservice|service[_-]?client|servizio[_-]?clienti/i,
  /destek|support|soutien|assistenza|unterst[uü]tzung/i,
  /kargo|shipping|delivery|versand|livraison|spedizione/i,
  /iade|returns?|retoure|retour|reso/i,
  /magaza[_-]?bul|store[_-]?locator|store[_-]?finder|filial/i,
  // kariyer/career/jobs paths are NOT excluded in Mavi Yaka — they are our targets!
  /uyelik|membership|abonnement/i,
  /sikca[_-]?sorulan|frequently[_-]?asked/i,
  /kvkk|gdpr|ccpa|dsgvo/i,
  /cerez|cookie/i,
  // Store locator / branch / hours pages
  /magazalar|subeler|store-?list|our-?stores|nos-?magasins|unsere-?filialen|nostri-?negozi/i,
  /calisma[_-]?saat|opening[_-]?hours?|store[_-]?hours?|[oö]ffnungszeiten|horaires|orari/i,
];

/**
 * Generic scraper using Playwright — last resort for SPA sites.
 */
export async function scrapeGenericPlaywright(
  seedUrl: string,
  maxDepth: number,
  market?: CrawlMarket,
  abortSignal?: AbortSignal,
): Promise<RawJobData[]> {
  if (abortSignal?.aborted) return [];
  console.log(`  [Playwright] Fallback scraping: ${seedUrl}`);

  const browser = await getBrowser();
  const viewport = getRandomViewport();
  const context = await browser.newContext({
    userAgent: getRandomUserAgent(),
    viewport,
    deviceScaleFactor: Math.random() > 0.5 ? 2 : 1,
    locale: getBrowserLocale(market),
    extraHTTPHeaders: getStealthHeaders(market),
  });

  // Force-close context when abort signal fires (kills hanging Playwright navigations)
  let aborted = false;
  const onAbort = () => {
    aborted = true;
    console.log(`  [Playwright] Abort signal received, force-closing context for ${seedUrl}`);
    context.close().catch(() => {});
  };
  if (abortSignal) {
    if (abortSignal.aborted) {
      await context.close();
      return [];
    }
    abortSignal.addEventListener('abort', onAbort, { once: true });
  }

  await context.route('**/*', (route) => {
    const type = route.request().resourceType();
    if (['font', 'media', 'websocket'].includes(type)) {
      route.abort();
    } else {
      route.continue();
    }
  });

  const jobs: RawJobData[] = [];
  const seenUrls = new Set<string>();

  try {
    const page = await context.newPage();
    await page.addInitScript(STEALTH_INIT_SCRIPT);
    page.setDefaultTimeout(REQUEST_TIMEOUT_MS);

    try {
      await page.goto(seedUrl, { waitUntil: 'domcontentloaded', timeout: REQUEST_TIMEOUT_MS });
    } catch {
      if (aborted) throw new Error('Aborted');
      await page.goto(seedUrl, { waitUntil: 'commit', timeout: REQUEST_TIMEOUT_MS });
    }
    if (aborted) throw new Error('Aborted');
    await delay(1000);

    const html = await page.content();
    const $ = cheerio.load(html);
    const pageDates = extractDates($);

    // Phase 1: Extract cards directly
    const directJobs = extractCardsFromPage($, seedUrl);
    for (const c of directJobs) {
      if (!c.postedDate) c.postedDate = pageDates.startDate ?? undefined;
      if (!c.deadline) c.deadline = pageDates.endDate ?? undefined;
    }
    jobs.push(...directJobs);

    // Phase 2: Follow job links
    if (maxDepth > 0 && !aborted) {
      const jobLinks = findJobLinks($, seedUrl);
      const linksToVisit = jobLinks.slice(0, 10);

      for (const link of linksToVisit) {
        if (aborted || abortSignal?.aborted) break;
        if (seenUrls.has(link)) continue;
        seenUrls.add(link);

        try {
          await delay(randomDelay(CRAWL_DELAY_MS));
          if (aborted) break;
          await page.goto(link, { waitUntil: 'domcontentloaded', timeout: REQUEST_TIMEOUT_MS });
          await delay(1000);

          const detailHtml = await page.content();
          const detail$ = cheerio.load(detailHtml);

          // First try extracting job cards from this page (listing pages
          // like /kariyer have cards with images, while detail pages don't)
          const subCards = extractCardsFromPage(detail$, link);
          if (subCards.length > 0) {
            const subDates = extractDates(detail$);
            for (const sc of subCards) {
              if (!sc.postedDate) sc.postedDate = subDates.startDate ?? undefined;
              if (!sc.deadline) sc.deadline = subDates.endDate ?? undefined;
              const isDupe = jobs.some(
                (c) => c.title === sc.title || c.sourceUrl === sc.sourceUrl,
              );
              if (!isDupe) jobs.push(sc);
            }
          } else {
            // No cards found — try meta tags (individual job listing page)
            const listing = extractFromMetaTags(detail$, link);
            if (listing) {
              const isDupe = jobs.some(
                (j) => j.title === listing.title || j.sourceUrl === listing.sourceUrl,
              );
              if (!isDupe) jobs.push(listing);
            }
          }
        } catch (err) {
          if (aborted) break;
          console.warn(`  [Playwright] Failed: ${link} — ${(err as Error).message}`);
        }
      }
    }

    // Phase 3: Seed page fallback
    if (jobs.length === 0 && !aborted) {
      const seedListing = extractFromMetaTags($, seedUrl);
      if (seedListing) jobs.push(seedListing);
    }

    // Phase 4: og:image fallback for listings with no images
    if (!aborted) {
      const seedOgImage = $('meta[property="og:image"]').attr('content')
        || $('meta[name="twitter:image"]').attr('content');
      if (seedOgImage) {
        let resolvedOg: string | null = null;
        try { resolvedOg = new URL(seedOgImage, seedUrl).toString(); } catch {}
        if (resolvedOg) {
          for (const c of jobs) {
            if (!c.imageUrls || c.imageUrls.length === 0) {
              c.imageUrls = [resolvedOg];
            }
          }
        }
      }
    }

    await page.close();
  } catch (err) {
    if (!aborted) throw err;
    // If aborted, just fall through — context is already being closed
  } finally {
    if (abortSignal) {
      abortSignal.removeEventListener('abort', onAbort);
    }
    // Only close context if not already closed by abort handler
    if (!aborted) {
      await context.close().catch(() => {});
    }
  }

  // Phase 4: Keep logo images as fallback — better than empty
  // (Previously cleared them, but empty images are worse UX than a brand logo)

  console.log(`  [Playwright] Total: ${jobs.length} job listings`);
  return jobs;
}

// ─── Shared extraction helpers ────────────────────────────

function findJobLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const links = new Set<string>();
  const baseHost = new URL(baseUrl).hostname;

  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    try {
      const url = new URL(href, baseUrl);
      if (url.hostname !== baseHost) return;
      const fullUrl = url.toString();
      const path = url.pathname + url.search;
      if (EXCLUDE_PATTERNS.some((p) => p.test(path))) return;
      const text = $(el).text().trim().toLowerCase();
      const isJobUrl = JOB_PATH_PATTERNS.some((p) => p.test(path));
      const isJobText = JOB_PATH_PATTERNS.some((p) => p.test(text));
      if (isJobUrl || isJobText) {
        if (fullUrl.replace(/\/$/, '') !== baseUrl.replace(/\/$/, '')) {
          links.add(fullUrl);
        }
      }
    } catch { /* invalid URL */ }
  });

  return Array.from(links);
}

function extractCardsFromPage($: cheerio.CheerioAPI, baseUrl: string): RawJobData[] {
  const jobs: RawJobData[] = [];
  const cardSelectors = [
    // Job-specific selectors
    '.job-card', '.job-item', '.job-listing', '.job-post',
    '.vacancy-card', '.vacancy-item', '.position-card', '.position-item',
    '.career-card', '.career-item', '.opening-card', '.opening-item',
    '[data-job]', '[data-job-id]', '[data-vacancy]', '[data-position]',
    '[class*="job"]', '[class*="vacancy"]', '[class*="position"]', '[class*="career"]',
    '[class*="opening"]', '[class*="listing"]',
    // Turkish
    '[class*="ilan"]', '[class*="pozisyon"]', '[class*="kariyer"]',
    'a[href*="kariyer"]', 'a[href*="is-ilani"]', 'a[href*="pozisyon"]',
    // English
    'a[href*="careers"]', 'a[href*="jobs"]', 'a[href*="openings"]', 'a[href*="vacancies"]',
    // Generic
    '.slider-item', '.banner-item',
    'article', '.card',
  ];

  for (const selector of cardSelectors) {
    const cards = $(selector);
    if (cards.length === 0 || cards.length > 50) continue;
    cards.each((_i, el) => {
      // Skip wrapper elements that contain a tab list (not individual cards)
      if ($(el).find('[role="tablist"]').length > 0) return;
      const job = extractJobFromElement($, el, baseUrl);
      if (job) jobs.push(job);
    });
    if (jobs.length > 0) break;
  }

  // Fallback: tab-based job listing layouts
  if (jobs.length === 0) {
    const tabJobs = extractTabJobs($, baseUrl);
    jobs.push(...tabJobs);
  }

  return jobs;
}

/**
 * Extract job listings from tab-based layouts.
 * Some sites organize job listings as tabs with role="tab" and role="tabpanel".
 */
function extractTabJobs($: cheerio.CheerioAPI, baseUrl: string): RawJobData[] {
  const tabs = $('[role="tablist"] [role="tab"]');
  if (tabs.length === 0 || tabs.length > 30) return [];

  const jobs: RawJobData[] = [];

  tabs.each((_i, tabEl) => {
    const title = $(tabEl).text().trim();
    if (!title || title.length < 2 || title.length > 200) return;
    if (/^di[gğ]er$/i.test(title)) return;

    const panelId = $(tabEl).attr('aria-controls');
    let description: string | undefined;
    if (panelId) {
      const panel = $(`#${panelId}`);
      if (panel.length) {
        description = panel.text().trim().substring(0, 500) || undefined;
      }
    }

    const imageUrls: string[] = [];
    const panel = panelId ? $(`#${panelId}`) : null;
    const container = panel ?? $(tabEl);
    // Prefer <picture><source srcset> over plain <img src>
    const pictureSource = container.find('picture source[srcset]').first();
    if (pictureSource.length) {
      const best = pickBestFromSrcset(pictureSource.attr('srcset')!, baseUrl);
      if (best) imageUrls.push(best);
    }
    if (imageUrls.length === 0) {
      const imgEl = container.find('img').first();
      if (imgEl?.length) {
        const src = imgEl.attr('data-original') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || imgEl.attr('data-image') || imgEl.attr('src');
        if (src && !src.startsWith('data:')) { try { imageUrls.push(new URL(src, baseUrl).toString()); } catch {} }
      }
    }

    jobs.push({
      title,
      description: description && description.length > 10 ? description : undefined,
      sourceUrl: baseUrl,
      imageUrls,
    });
  });

  if (jobs.length > 0) {
    console.log(`  [Playwright] Extracted ${jobs.length} job listings from tab layout`);
  }

  return jobs;
}

// ─── HTML-based promo code extraction ────────────────────────
const PW_PROMO_CSS = [
  '[class*="coupon-code"]', '[class*="promo-code"]', '[class*="discount-code"]',
  '[class*="voucher-code"]', '[class*="couponcode"]', '[class*="promocode"]',
  '[class*="kuponcod"]', '[class*="promokod"]',
  '[class*="copy-code"]', '[class*="code-copy"]',
  '.coupon-value', '.promo-value', '.code-value',
  '[class*="coupon"] code', '[class*="promo"] code',
];
const PW_PROMO_ATTRS = [
  'data-clipboard-text', 'data-copy', 'data-code',
  'data-coupon-code', 'data-coupon', 'data-promo-code', 'data-promo', 'data-voucher',
];

function extractPromoFromHtml($: cheerio.CheerioAPI, scope?: any): string | null {
  const root = scope ? $(scope) : $('body');
  for (const sel of PW_PROMO_CSS) {
    const els = root.find(sel).toArray();
    for (const el of els) {
      const code = $(el).text().trim();
      if (code) return code;
    }
  }
  for (const attr of PW_PROMO_ATTRS) {
    const els = root.find(`[${attr}]`).toArray();
    for (const el of els) {
      const code = $(el).attr(attr)?.trim();
      if (code) return code;
    }
  }
  const jsonLdScripts = $('script[type="application/ld+json"]').toArray();
  for (const el of jsonLdScripts) {
    try {
      const json = JSON.parse($(el).text());
      const code = findCouponInJsonLd(json);
      if (code) return code;
    } catch { /* ignore */ }
  }
  return null;
}

function findCouponInJsonLd(obj: any, depth = 0): string | null {
  if (depth > 5 || !obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    for (const item of obj) { const c = findCouponInJsonLd(item, depth + 1); if (c) return c; }
    return null;
  }
  for (const key of ['couponCode', 'discountCode', 'voucherCode', 'promoCode']) {
    if (typeof obj[key] === 'string' && obj[key].trim()) { return obj[key].trim(); }
  }
  for (const val of Object.values(obj)) {
    if (typeof val === 'object') { const c = findCouponInJsonLd(val, depth + 1); if (c) return c; }
  }
  return null;
}

function extractJobFromElement(
  $: cheerio.CheerioAPI, el: any, baseUrl: string,
): RawJobData | null {
  const title =
    $(el).find('h1, h2, h3, h4').first().text().trim() ||
    $(el).find('a').first().text().trim() ||
    $(el).find('[class*="title"]').first().text().trim();
  if (!title || title.length < 5 || title.length > 300) return null;
  // Reject URL-like text (e.g., "www.example.com/path")
  if (/^(https?:\/\/|www\.)\S+$/.test(title)) return null;

  const href = $(el).find('a').first().attr('href') || $(el).attr('href');
  let sourceUrl = baseUrl;
  if (href) { try { sourceUrl = new URL(href, baseUrl).toString(); } catch {} }

  const imageUrls: string[] = [];
  // 1. <img> tag — if inside <picture>, prefer <source srcset> (e.g. Opel, Toyota)
  const img = $(el).find('img').first();
  if (img.length) {
    const parent = img.parent();
    if (parent.is('picture')) {
      const source = parent.find('source[srcset]').first();
      if (source.length) {
        const best = pickBestFromSrcset(source.attr('srcset')!, baseUrl);
        if (best) imageUrls.push(best);
      }
    }
    if (imageUrls.length === 0) {
      const srcset = img.attr('srcset') || img.attr('data-srcset');
      if (srcset) {
        const best = pickBestFromSrcset(srcset, baseUrl);
        if (best) imageUrls.push(best);
      }
    }
    if (imageUrls.length === 0) {
      const src = img.attr('data-original') || img.attr('data-src') || img.attr('data-lazy-src') || img.attr('data-image') || img.attr('src');
      if (src && !src.startsWith('data:')) { try { imageUrls.push(new URL(src, baseUrl).toString()); } catch {} }
    }
  }
  // 2. <picture><source> tag (fallback for standalone <picture> without <img>)
  if (imageUrls.length === 0) {
    const source = $(el).find('picture source[srcset]').first();
    if (source.length) {
      const best = pickBestFromSrcset(source.attr('srcset')!, baseUrl);
      if (best) imageUrls.push(best);
    }
  }
  // 3. CSS background-image on element or children
  if (imageUrls.length === 0) {
    const bgEls = [el, ...$(el).find('[style*="background"]').toArray()];
    for (const bgEl of bgEls) {
      const style = $(bgEl).attr('style') || '';
      const bgMatch = style.match(/background(?:-image)?\s*:\s*url\(\s*['"]?([^'")\s]+)['"]?\s*\)/i);
      if (bgMatch?.[1]) {
        try { imageUrls.push(new URL(bgMatch[1], baseUrl).toString()); break; } catch {}
      }
    }
  }
  // 4. data-bg / data-background (lazy-load patterns)
  if (imageUrls.length === 0) {
    const lazyEl = $(el).find('[data-bg], [data-background]').first();
    if (lazyEl.length) {
      const bg = lazyEl.attr('data-bg') || lazyEl.attr('data-background');
      if (bg) { try { imageUrls.push(new URL(bg, baseUrl).toString()); } catch {} }
    }
  }

  const description = $(el).find('p, [class*="desc"]').first().text().trim() || undefined;
  const discountRate = parseDiscountSafe(title);

  return {
    title,
    description: description && description.length > 5 ? description : undefined,
    sourceUrl,
    imageUrls,
  };
}

function extractFromMetaTags($: cheerio.CheerioAPI, pageUrl: string): RawJobData | null {
  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    $('title').text().trim() ||
    $('h1').first().text().trim();
  if (!title || title.length < 5) return null;

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    undefined;

  const imageUrls: string[] = [];
  const ogImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content');
  const isGenericOg = ogImage && /logo|icon|og-image|og_image|favicon|default|placeholder|social[-_]|sns[-_]|share[-_]|brand[-_]|common[-_]asset/i.test(ogImage);

  // Try content images first if og:image looks like a generic logo
  if (isGenericOg || !ogImage) {
    const mainImg = $('article img, .job img, .career img, .content img, main img, [role="main"] img, [class*="detail"] img, [class*="banner"] img').first();
    if (mainImg.length) {
      const src = mainImg.attr('data-original') || mainImg.attr('data-src') || mainImg.attr('data-lazy-src') || mainImg.attr('data-image') || mainImg.attr('src');
      if (src) { try { imageUrls.push(new URL(src, pageUrl).toString()); } catch {} }
    }
  }

  // Fall back to og:image if no content image found
  if (imageUrls.length === 0 && ogImage) {
    try { imageUrls.push(new URL(ogImage, pageUrl).toString()); } catch {}
  }

  const fullText = `${title} ${description || ''}`;
  const discountRate = parseDiscountSafe(fullText);

  // Extract dates
  const dates = extractDates($);

  return {
    title,
    description: description && description.length > 10 ? description : undefined,
    sourceUrl: pageUrl,
    imageUrls,
    postedDate: dates.startDate ?? undefined,
    deadline: dates.endDate ?? undefined,
  };
}
