/**
 * Generic image URL optimizer.
 * Detects common CDN resize parameters and increases them to get higher quality images.
 * Handles: Shopify, Cloudinary, imgix, WordPress, Contentful, Akamai, and generic patterns.
 */

const TARGET_WIDTH = 800;

/**
 * Optimize a single image URL for better quality by removing or increasing
 * CDN resize parameters.
 */
export function optimizeImageUrl(url: string): string {
  try {
    // Replace {width} / {height} placeholders (Travelzoo etc.) before parsing
    url = url.replace(/\{width\}/g, String(TARGET_WIDTH)).replace(/\{height\}/g, '0');

    const parsed = new URL(url);

    // --- Shopify CDN: ?width=60 or &width=60 ---
    if (parsed.hostname.includes('shopify.com') || parsed.hostname.includes('myshopify.com') || parsed.searchParams.has('width')) {
      if (parsed.searchParams.has('width')) {
        const w = parseInt(parsed.searchParams.get('width')!, 10);
        if (w < TARGET_WIDTH) {
          parsed.searchParams.set('width', String(TARGET_WIDTH));
        }
        return parsed.toString();
      }
    }

    // --- Cloudinary: /w_60/ or /c_scale,w_60/ or /c_fill,w_60,h_60/ ---
    if (parsed.hostname.includes('cloudinary.com') || parsed.hostname.includes('res.cloudinary.com')) {
      const optimized = parsed.pathname.replace(
        /\/(?:c_\w+,)?w_(\d+)(?:,h_\d+)?\//g,
        (match, w) => {
          const width = parseInt(w, 10);
          if (width < TARGET_WIDTH) {
            return match.replace(`w_${w}`, `w_${TARGET_WIDTH}`);
          }
          return match;
        },
      );
      parsed.pathname = optimized;
      return parsed.toString();
    }

    // --- imgix / Contentful: ?w=60 ---
    if (parsed.searchParams.has('w')) {
      const w = parseInt(parsed.searchParams.get('w')!, 10);
      if (w < TARGET_WIDTH) {
        parsed.searchParams.set('w', String(TARGET_WIDTH));
        // Remove height constraint to maintain aspect ratio
        parsed.searchParams.delete('h');
      }
      return parsed.toString();
    }

    // --- Akamai/Fastly: ?imwidth=60 ---
    if (parsed.searchParams.has('imwidth')) {
      const w = parseInt(parsed.searchParams.get('imwidth')!, 10);
      if (w < TARGET_WIDTH) {
        parsed.searchParams.set('imwidth', String(TARGET_WIDTH));
      }
      return parsed.toString();
    }

    // --- Scene7 CDN (Target, Adobe): ?wid=167&hei=167 ---
    if (parsed.searchParams.has('wid')) {
      const w = parseInt(parsed.searchParams.get('wid')!, 10);
      if (w < TARGET_WIDTH) {
        parsed.searchParams.set('wid', String(TARGET_WIDTH));
        if (parsed.searchParams.has('hei')) {
          parsed.searchParams.set('hei', String(TARGET_WIDTH));
        }
      }
      return parsed.toString();
    }

    // --- WordPress: -150x150.jpg, -300x200.png ---
    const wpMatch = parsed.pathname.match(/^(.+)-(\d+)x(\d+)(\.\w+)$/);
    if (wpMatch) {
      const [, base, w, , ext] = wpMatch;
      const width = parseInt(w, 10);
      if (width < TARGET_WIDTH) {
        // Remove size suffix to get original
        parsed.pathname = `${base}${ext}`;
        return parsed.toString();
      }
    }

    // --- Generic resize params: ?size=, ?resize=, ?fit= with dimensions ---
    for (const param of ['size', 'resize']) {
      if (parsed.searchParams.has(param)) {
        const val = parsed.searchParams.get(param)!;
        const dimMatch = val.match(/^(\d+)(?:x(\d+))?$/);
        if (dimMatch) {
          const width = parseInt(dimMatch[1], 10);
          if (width < TARGET_WIDTH) {
            parsed.searchParams.delete(param);
          }
        }
      }
    }

    // --- VTEX CDN (Angeloni, Reebok BR, etc.): /arquivos/ids/123456-248-248 ---
    const vtexMatch = parsed.pathname.match(/(\/arquivos\/ids\/\d+)-(\d+)-(\d+)/);
    if (vtexMatch) {
      const width = parseInt(vtexMatch[2], 10);
      if (width < TARGET_WIDTH) {
        parsed.pathname = parsed.pathname.replace(
          `${vtexMatch[1]}-${vtexMatch[2]}-${vtexMatch[3]}`,
          `${vtexMatch[1]}-${TARGET_WIDTH}-${TARGET_WIDTH}`,
        );
        return parsed.toString();
      }
    }

    // --- Trendyol/HepsiBurada style: /mnresize/60/60/ or /crop/60/60/ ---
    const resizeMatch = parsed.pathname.match(/\/(mnresize|crop)\/(\d+)\/(\d+)\//);
    if (resizeMatch) {
      const width = parseInt(resizeMatch[2], 10);
      if (width < TARGET_WIDTH) {
        parsed.pathname = parsed.pathname.replace(
          `/${resizeMatch[1]}/${resizeMatch[2]}/${resizeMatch[3]}/`,
          `/${resizeMatch[1]}/${TARGET_WIDTH}/0/`,
        );
        return parsed.toString();
      }
    }

    return parsed.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * From a srcset string, pick the URL with the highest resolution.
 * srcset format: "url1 200w, url2 400w, url3 800w"
 * or: "url1 1x, url2 2x"
 */
export function pickBestFromSrcset(srcset: string, baseUrl: string): string | null {
  if (!srcset || !srcset.trim()) return null;

  const candidates: { url: string; size: number }[] = [];

  for (const entry of srcset.split(',')) {
    const parts = entry.trim().split(/\s+/);
    if (parts.length < 2) continue;

    const url = parts[0];
    const descriptor = parts[1];

    let size = 0;
    if (descriptor.endsWith('w')) {
      size = parseInt(descriptor, 10);
    } else if (descriptor.endsWith('x')) {
      size = parseFloat(descriptor) * 100; // Convert multiplier to comparable number
    }

    if (url && size > 0) {
      try {
        candidates.push({ url: new URL(url, baseUrl).toString(), size });
      } catch { /* skip invalid URL */ }
    }
  }

  if (candidates.length === 0) return null;

  // Sort by size descending and pick the best
  candidates.sort((a, b) => b.size - a.size);
  return candidates[0].url;
}

// URL path/filename patterns that indicate brand logos, favicons, or icons — not campaign images
const LOGO_PATTERNS = [
  /logo/i,
  /favicon/i,
  /icon[-_.]?\d*/i,
  /brand[-_.]?mark/i,
  /site[-_.]?header/i,
  /placeholder/i,
  /default[-_.]?image/i,
  /no[-_.]?image/i,
  /spacer/i,
  /pixel\.gif/i,
  /1x1\./i,
  /blank\./i,
  /transparent/i,            // transparent images (e.g., TRANSPARENT_IMAGE, transparent.png)
  /detail-video\./i,         // video placeholder images
  /og[-_]image/i,            // generic og:image placeholder
  /social[-_]/i,             // social sharing images (e.g., social-lancia.jpg)
  /sns[-_]/i,                // SNS sharing images
  /share[-_]?image/i,
  /common[-_]asset/i,        // generic common assets
  /fb[-_]logo/i,             // Facebook sharing logo (e.g., fb-logo.png)
  /\/null\//i,               // null path segments (e.g., zappos.com/null/1024.jpg)
  /apple-touch-icon/i,       // iOS bookmark icons used as logos
  /flags[@_]/i,              // flag icons (e.g., flags@2x.png)
  /portal[-_]/i,             // portal/global brand images (e.g., portal-Volvo.png)
  /\/static\/help$/i,        // static help page images
  /\/imagery\/merchants\//i, // RetailMeNot merchant logos (not campaign images)
  /bigR\.png/i,              // RetailMeNot brand logo
];

// Minimum acceptable dimensions in filename (e.g., 50x50.png is too small)
const TINY_DIMENSION = /[-_](\d+)x(\d+)\./;

/**
 * Check if a URL is likely a brand logo or non-campaign image.
 */
export function isLikelyBrandLogo(url: string): boolean {
  return isBrandLogo(url);
}

function isBrandLogo(url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathAndFile = parsed.pathname.toLowerCase();

    // Reject URLs that don't point to an image (e.g., "https://www.bmw.com.tr/")
    const path = pathAndFile.replace(/\/+$/, '');
    if (path === '' || path === '/') return true;
    // URL without an image extension and without CDN-like patterns
    const hasImageExt = /\.(jpe?g|png|gif|webp|avif|bmp|svg|tiff?|vsf)(\?|$)/i.test(pathAndFile);
    const hasCdnPattern = /\/images?\//i.test(pathAndFile)
      || /cdn|media|asset|upload|static/i.test(parsed.hostname + pathAndFile)
      || /\/medium\//i.test(pathAndFile)      // CDN resize path (e.g., Kuveyt Türk /medium/...)
      || /\/large\//i.test(pathAndFile)        // CDN resize path
      || /\/thumbnail\//i.test(pathAndFile);   // CDN resize path
    if (!hasImageExt && !hasCdnPattern) return true;

    // Check logo patterns in path/filename
    if (LOGO_PATTERNS.some((p) => p.test(pathAndFile))) {
      return true;
    }

    // Check for tiny images by dimension in filename (e.g., icon-32x32.png)
    const dimMatch = pathAndFile.match(TINY_DIMENSION);
    if (dimMatch) {
      const w = parseInt(dimMatch[1], 10);
      const h = parseInt(dimMatch[2], 10);
      if (w <= 100 && h <= 100) return true;
    }

    // SVG files are usually logos/icons, not campaign images
    if (pathAndFile.endsWith('.svg')) return true;

    return false;
  } catch {
    return false;
  }
}

/** Check if URL is invalid (localhost, data:image, etc.) */
/** Error page image patterns — these indicate the source returned a 404/error page */
const ERROR_IMAGE_PATTERNS = [
  /\/errors?\/(not[_-]?found|404)/i,
  /\/error[_-]?404/i,
  /\/404[_-](error|page|not[_-]?found)/i,
  /\/page[_-]?not[_-]?found/i,
  /\/not[_-]?found\.(png|jpg|jpeg|svg|webp|gif)/i,
  /\/404\.(png|jpg|jpeg|svg|webp|gif)/i,
];

function isInvalidUrl(url: string): boolean {
  return (
    url.startsWith('http://localhost') ||
    url.startsWith('https://localhost') ||
    url.startsWith('http://127.') ||
    url.startsWith('https://127.') ||
    url.includes('data:image') ||
    ERROR_IMAGE_PATTERNS.some(p => p.test(url))
  );
}

/**
 * Optimize a list of image URLs: remove invalid/logos/icons, optimize remaining for quality.
 */
export function optimizeImageUrls(urls: string[]): string[] {
  return urls
    .filter((url) => !isInvalidUrl(url) && !isBrandLogo(url))
    .map(optimizeImageUrl);
}
