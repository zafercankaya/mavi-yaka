/**
 * One-time script: Fix job listings that have company logo URLs instead of listing images.
 *
 * For each listing with a logo-like image URL:
 * 1. Try to fetch og:image from the listing's source URL
 * 2. If og:image is a real listing image, update the DB
 * 3. If og:image is also a logo, clear the images (UI will show gradient fallback)
 *
 * Usage: npx ts-node src/fix-logo-images.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LOGO_PATTERNS = [
  /logo/i, /favicon/i, /icon[-_.]?\d*/i, /brand[-_.]?mark/i,
  /placeholder/i, /default[-_.]?image/i, /no[-_.]?image/i,
  /og[-_]image/i, /social[-_]/i, /share[-_]?image/i,
];

function isLikelyLogo(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    if (LOGO_PATTERNS.some(p => p.test(path))) return true;
    if (path.endsWith('.svg')) return true;
    const dimMatch = path.match(/[-_](\d+)x(\d+)\./);
    if (dimMatch && parseInt(dimMatch[1]) <= 100 && parseInt(dimMatch[2]) <= 100) return true;
    return false;
  } catch {
    return false;
  }
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'tr-TR,tr;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!response.ok) return null;
    const html = await response.text();

    // Extract og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (!ogMatch) return null;

    const ogUrl = new URL(ogMatch[1], url).toString();
    if (isLikelyLogo(ogUrl)) return null;
    return ogUrl;
  } catch {
    return null;
  }
}

async function main() {
  const listings = await prisma.jobListing.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, title: true, imageUrl: true, sourceUrl: true },
  });

  console.log(`Found ${listings.length} active job listings`);

  let fixed = 0;
  let cleared = 0;
  let skipped = 0;

  for (const c of listings) {
    if (!c.imageUrl) {
      skipped++;
      continue;
    }

    if (!isLikelyLogo(c.imageUrl)) {
      skipped++;
      continue;
    }

    console.log(`\n[Logo] ${c.title}`);
    console.log(`  Current: ${c.imageUrl}`);

    if (c.sourceUrl) {
      // Small delay to be polite
      await new Promise(r => setTimeout(r, 1000));
      const ogImage = await fetchOgImage(c.sourceUrl);
      if (ogImage) {
        console.log(`  Fixed → ${ogImage}`);
        await prisma.jobListing.update({
          where: { id: c.id },
          data: { imageUrl: ogImage },
        });
        fixed++;
        continue;
      }
    }

    // No better image found — clear the logo
    console.log(`  Cleared (no better image found)`);
    await prisma.jobListing.update({
      where: { id: c.id },
      data: { imageUrl: null },
    });
    cleared++;
  }

  console.log(`\nDone! Fixed: ${fixed}, Cleared: ${cleared}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
