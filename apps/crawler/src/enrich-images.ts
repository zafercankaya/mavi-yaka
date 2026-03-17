/**
 * Post-crawl image enrichment script.
 * Visits job listing URLs that have no images and extracts og:image / twitter:image.
 *
 * Usage:
 *   npx ts-node --transpile-only src/enrich-images.ts [market] [limit]
 *   npx ts-node --transpile-only src/enrich-images.ts US 100
 *   npx ts-node --transpile-only src/enrich-images.ts        # all markets, default 200
 */
import './config';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import { isLikelyBrandLogo } from './pipeline/optimize-images';
import { getAcceptLanguage, CrawlMarket } from './config';
import { closeBrowser, getBrowser } from './processors/playwright-fallback';

const p = new PrismaClient();

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const FETCH_TIMEOUT = 10_000;
const PLAYWRIGHT_TIMEOUT = 15_000;
const DELAY_BETWEEN_REQUESTS = 500;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function tryResolve(src: string, base: string): string | null {
  try {
    if (src.startsWith('data:')) return null;
    return new URL(src, base).href;
  } catch {
    return null;
  }
}

/**
 * Extract the best image from a page URL.
 * Strategy: og:image → twitter:image → first large <img> → null
 */
async function extractImageFromUrl(url: string, market: string): Promise<string | null> {
  // 1. Try HTTP fetch + Cheerio first (fast)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const resp = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': getAcceptLanguage(market as CrawlMarket),
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const html = await resp.text();
    const $ = cheerio.load(html);

    // Check if page is a SPA with minimal content
    const bodyText = $('body').text().trim();
    const isSPA = bodyText.length < 200 && $('script').length > 3;

    if (!isSPA) {
      const img = extractImageFromCheerio($, url);
      if (img) return img;
    }
  } catch {
    // HTTP fetch failed — will try Playwright
  }

  // 2. Try Playwright for JS-heavy pages
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    page.setDefaultTimeout(PLAYWRIGHT_TIMEOUT);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PLAYWRIGHT_TIMEOUT });
    await page.waitForTimeout(2000); // Wait for dynamic content

    const html = await page.content();
    await page.close();

    const $ = cheerio.load(html);
    const img = extractImageFromCheerio($, url);
    if (img) return img;
  } catch {
    // Playwright also failed
  }

  return null;
}

function extractImageFromCheerio($: cheerio.CheerioAPI, baseUrl: string): string | null {
  // 1. og:image
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage) {
    const resolved = tryResolve(ogImage, baseUrl);
    if (resolved && !resolved.includes('data:image')) return resolved;
  }

  // 2. twitter:image
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  if (twitterImage) {
    const resolved = tryResolve(twitterImage, baseUrl);
    if (resolved && !resolved.includes('data:image')) return resolved;
  }

  // 3. First large content image (not logo, not icon)
  const candidates: string[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('data-src') || $(el).attr('data-original') || $(el).attr('src');
    if (!src) return;
    const resolved = tryResolve(src, baseUrl);
    if (!resolved) return;
    if (isLikelyBrandLogo(resolved)) return;
    if (resolved.includes('data:image')) return;
    if (resolved.includes('pixel') || resolved.includes('tracking') || resolved.includes('beacon')) return;
    if (resolved.includes('favicon') || resolved.includes('icon-')) return;

    // Check dimensions if available
    const width = parseInt($(el).attr('width') || '0', 10);
    const height = parseInt($(el).attr('height') || '0', 10);
    if (width > 0 && width < 50) return;
    if (height > 0 && height < 50) return;

    candidates.push(resolved);
  });

  // Prefer larger images (usually content banners)
  if (candidates.length > 0) return candidates[0];

  // 4. CSS background images from main content area
  const bgSelectors = ['.hero', '.banner', '.job', '.career', '.position', '[class*="hero"]', '[class*="banner"]'];
  for (const sel of bgSelectors) {
    const style = $(sel).attr('style') || '';
    const match = style.match(/url\(['"]?(https?:\/\/[^'")\s]+)['"]?\)/);
    if (match?.[1]) return match[1];
  }

  return null;
}

async function main() {
  const marketArg = process.argv[2]?.toUpperCase();
  const limitArg = parseInt(process.argv[3] || '200', 10);

  const hasMarket = marketArg && marketArg.length === 2;

  // Find job listings without images
  const listings = hasMarket
    ? await p.$queryRawUnsafe<
        { id: string; title: string; source_url: string; market: string; brand_name: string }[]
      >(`
        SELECT jl.id, jl.title, jl.source_url, jl.market, co.name as brand_name
        FROM job_listings jl
        JOIN companies co ON jl.company_id = co.id
        WHERE jl.status = 'ACTIVE'
          AND jl.image_url IS NULL
          AND jl.market = $1
        ORDER BY jl.created_at DESC
        LIMIT $2
      `, marketArg, limitArg)
    : await p.$queryRawUnsafe<
        { id: string; title: string; source_url: string; market: string; brand_name: string }[]
      >(`
        SELECT jl.id, jl.title, jl.source_url, jl.market, co.name as brand_name
        FROM job_listings jl
        JOIN companies co ON jl.company_id = co.id
        WHERE jl.status = 'ACTIVE'
          AND jl.image_url IS NULL
        ORDER BY jl.created_at DESC
        LIMIT $1
      `, limitArg);

  console.log(`\n🖼️  Image Enrichment — ${listings.length} job listings without images\n`);
  if (marketArg) console.log(`Market: ${marketArg}`);

  let enriched = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < listings.length; i++) {
    const c = listings[i];
    process.stdout.write(`[${i + 1}/${listings.length}] ${c.brand_name}: "${c.title.substring(0, 50)}"... `);

    try {
      const imageUrl = await extractImageFromUrl(c.source_url, c.market);

      if (imageUrl) {
        await p.jobListing.update({
          where: { id: c.id },
          data: { imageUrl: imageUrl },
        });
        console.log(`✓ ${imageUrl.substring(0, 60)}...`);
        enriched++;
      } else {
        console.log('✗ no image found');
        failed++;
      }
    } catch (err) {
      console.log(`✗ error: ${(err as Error).message.substring(0, 40)}`);
      failed++;
    }

    await delay(DELAY_BETWEEN_REQUESTS);
  }

  console.log(`\n=== SONUÇ ===`);
  console.log(`Toplam: ${listings.length}`);
  console.log(`Zenginleştirildi: ${enriched}`);
  console.log(`Bulunamadı: ${failed}`);
  console.log(`Atlandı: ${skipped}`);

  await closeBrowser();
  await p.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await closeBrowser();
  await p.$disconnect();
});
