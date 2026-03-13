/** Detect if a URL is likely a company logo, not a job image */
export function isLikelyLogo(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    // Logo, icon, and brand-mark patterns
    if (/logo|favicon|icon[-_.]?\d*|brand[-_.]?mark/i.test(path)) return true;
    // Placeholder/transparent/blank images (lazy-load artifacts)
    if (/placeholder|default[-_.]?image|no[-_.]?image|transparent\.|blank\.|spacer|pixel\.gif|1x1\./i.test(path)) return true;
    // Social sharing / og:image placeholders
    if (/og[-_]image|social[-_]|sns[-_]|share[-_]?image|common[-_]asset|fb[-_]logo/i.test(path)) return true;
    // SVG files are usually logos/icons
    if (path.endsWith('.svg')) return true;
    // Tiny images by dimension in filename
    const dimMatch = path.match(/[-_](\d+)x(\d+)\./);
    if (dimMatch && parseInt(dimMatch[1]) <= 100 && parseInt(dimMatch[2]) <= 100) return true;
    return false;
  } catch {
    return false;
  }
}

/** Find the first real job image (not a logo) from the array */
export function findJobImage(imageUrls: string[]): string | null {
  return imageUrls.find((url) => !isLikelyLogo(url)) ?? null;
}
