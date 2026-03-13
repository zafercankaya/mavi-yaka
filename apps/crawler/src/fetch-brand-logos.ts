/**
 * Fetch brand logos from their websites and update the database.
 * Priority: Clearbit > apple-touch-icon > large favicon > Google S2 favicon
 *
 * Usage:
 *   npx ts-node --transpile-only src/fetch-brand-logos.ts           # all brands without logos
 *   npx ts-node --transpile-only src/fetch-brand-logos.ts --upgrade  # upgrade ALL brands to best available
 *   npx ts-node --transpile-only src/fetch-brand-logos.ts US         # only US market (no logo)
 *   npx ts-node --transpile-only src/fetch-brand-logos.ts US --upgrade # upgrade all US brands
 */
import './config';
import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';

const prisma = new PrismaClient();

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'text/html' },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Check if a URL returns a valid image (2xx, content-type image/*, >1KB) */
async function isValidImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('image')) return false;
    const cl = parseInt(res.headers.get('content-length') || '0', 10);
    // Skip tiny images (<1KB = likely a 1x1 pixel or empty)
    if (cl > 0 && cl < 1000) return false;
    return true;
  } catch {
    return false;
  }
}

function resolve(href: string, base: string): string | null {
  try { return new URL(href, base).toString(); } catch { return null; }
}

function getDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return ''; }
}

async function findLogoUrl(websiteUrl: string): Promise<string | null> {
  const domain = getDomain(websiteUrl);

  // 1. Clearbit Logo API — DISABLED (service no longer reliably accessible, March 2026)
  // Was: https://logo.clearbit.com/{domain}

  // 2. Try fetching the website for HTML-based logos
  const html = await fetchHtml(websiteUrl);
  if (!html) {
    // Can't reach site — use Google S2 favicon as last resort
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  const $ = cheerio.load(html);

  // 3. Apple touch icon (high quality, usually 180x180)
  const appleIcon = $('link[rel="apple-touch-icon"]').attr('href')
    || $('link[rel="apple-touch-icon-precomposed"]').attr('href');
  if (appleIcon) {
    const resolved = resolve(appleIcon, websiteUrl);
    if (resolved) return resolved;
  }

  // 4. Large favicon (icon with sizes)
  const icons = $('link[rel="icon"]').toArray();
  let bestIcon: { url: string; size: number } | null = null;
  for (const icon of icons) {
    const href = $(icon).attr('href');
    if (!href) continue;
    const sizes = $(icon).attr('sizes') || '';
    const sizeMatch = sizes.match(/(\d+)x(\d+)/);
    const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 16;
    const type = $(icon).attr('type') || '';
    // Skip SVG favicons
    if (type.includes('svg') || href.endsWith('.svg')) continue;
    if (!bestIcon || size > bestIcon.size) {
      const resolved = resolve(href, websiteUrl);
      if (resolved) bestIcon = { url: resolved, size };
    }
  }

  // 5. Shortcut icon
  const shortcut = $('link[rel="shortcut icon"]').attr('href');
  if (shortcut && !shortcut.endsWith('.svg')) {
    const resolved = resolve(shortcut, websiteUrl);
    if (resolved && (!bestIcon || bestIcon.size < 32)) {
      bestIcon = { url: resolved, size: 32 };
    }
  }

  if (bestIcon && bestIcon.size >= 32) return bestIcon.url;

  // 6. Fallback: Google's favicon service (always works)
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

async function main() {
  const args = process.argv.slice(2);
  const upgradeMode = args.includes('--upgrade');
  const marketArg = args.find(a => a !== '--upgrade' && a.length <= 3)?.toUpperCase();

  const where: any = {};
  if (!upgradeMode) {
    where.logoUrl = null;
  }
  if (marketArg) {
    where.market = marketArg;
  }

  const brands = await prisma.brand.findMany({
    where,
    select: { id: true, name: true, websiteUrl: true, logoUrl: true },
    orderBy: { name: 'asc' },
  });

  console.log(`Mode: ${upgradeMode ? 'UPGRADE (all brands)' : 'NEW ONLY (no logo)'}`);
  if (marketArg) console.log(`Market: ${marketArg}`);
  console.log(`Found ${brands.length} brands to process\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < brands.length; i++) {
    const brand = brands[i];
    if (!brand.websiteUrl) {
      console.log(`  [${i + 1}/${brands.length}] SKIP ${brand.name}: no websiteUrl`);
      failed++;
      continue;
    }

    try {
      const logoUrl = await findLogoUrl(brand.websiteUrl);
      if (logoUrl) {
        // In upgrade mode, skip if current logo is already better or same
        if (upgradeMode && brand.logoUrl === logoUrl) {
          console.log(`  [${i + 1}/${brands.length}] = ${brand.name}: unchanged`);
          continue;
        }
        // In upgrade mode, only upgrade if new logo is Clearbit (better quality)
        if (upgradeMode && brand.logoUrl && !logoUrl.includes('clearbit.com')) {
          // Don't downgrade existing logo to non-clearbit
          continue;
        }
        await prisma.brand.update({
          where: { id: brand.id },
          data: { logoUrl },
        });
        const tag = logoUrl.includes('clearbit') ? 'CLR' : logoUrl.includes('google.com') ? 'G2' : 'WEB';
        console.log(`  [${i + 1}/${brands.length}] ✓ ${brand.name} [${tag}]: ${logoUrl.substring(0, 70)}`);
        updated++;
      } else {
        console.log(`  [${i + 1}/${brands.length}] ✗ ${brand.name}: no logo found`);
        failed++;
      }
    } catch (err) {
      console.log(`  [${i + 1}/${brands.length}] ✗ ${brand.name}: ${(err as Error).message}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone: ${updated} updated, ${failed} failed`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
