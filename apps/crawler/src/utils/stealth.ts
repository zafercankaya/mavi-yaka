/**
 * Stealth utilities for anti-bot evasion.
 * - Random User-Agent rotation (15 real browser UAs)
 * - Realistic HTTP headers (Sec-Fetch-*, Accept-Encoding, Referer)
 * - Random viewport sizes for Playwright
 * - Delay jitter for human-like timing
 */
import { CrawlMarket, getAcceptLanguage } from '../config';

// ─── User-Agent Pool ──────────────────────────────────────────
// Real, current browser UAs — desktop Chrome/Firefox/Edge/Safari
const USER_AGENTS = [
  // Chrome (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  // Chrome (Mac)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  // Firefox (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
  // Firefox (Mac)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:125.0) Gecko/20100101 Firefox/125.0',
  // Edge (Windows)
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
  // Safari (Mac)
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
  // Chrome (Linux)
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  // Firefox (Linux)
  'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
];

/** Pick a random User-Agent from the pool */
export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── Sec-CH-UA generation ─────────────────────────────────────
// Generate matching Sec-CH-UA header based on User-Agent
function getSecChUa(ua: string): string | undefined {
  if (ua.includes('Edg/')) {
    const ver = ua.match(/Edg\/([\d]+)/)?.[1] || '124';
    return `"Microsoft Edge";v="${ver}", "Chromium";v="${ver}", "Not-A.Brand";v="99"`;
  }
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    const ver = ua.match(/Chrome\/([\d]+)/)?.[1] || '124';
    return `"Google Chrome";v="${ver}", "Chromium";v="${ver}", "Not-A.Brand";v="99"`;
  }
  // Firefox and Safari don't send Sec-CH-UA
  return undefined;
}

// ─── Google TLD per market (for Referer header) ───────────────
const GOOGLE_TLDS: Partial<Record<CrawlMarket, string>> = {
  TR: 'com.tr', US: 'com', DE: 'de', UK: 'co.uk', IN: 'co.in',
  BR: 'com.br', ID: 'co.id', RU: 'ru', MX: 'com.mx', JP: 'co.jp',
  PH: 'com.ph', TH: 'co.th', CA: 'ca', AU: 'com.au', FR: 'fr',
  IT: 'it', ES: 'es', EG: 'com.eg', SA: 'com.sa', KR: 'co.kr',
  AR: 'com.ar', AE: 'ae', VN: 'com.vn', PL: 'pl', MY: 'com.my',
  CO: 'com.co', ZA: 'co.za', PT: 'pt', NL: 'nl', PK: 'com.pk', SE: 'se',
};

/**
 * Generate a full set of realistic HTTP headers for a request.
 * Includes User-Agent rotation, Sec-Fetch-*, Accept-Encoding, Referer.
 */
export function getStealthHeaders(market?: CrawlMarket): Record<string, string> {
  const ua = getRandomUserAgent();
  const headers: Record<string, string> = {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': getAcceptLanguage(market),
    'Accept-Encoding': 'gzip, deflate, br',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Cache-Control': 'max-age=0',
  };

  // Add Sec-CH-UA for Chrome/Edge UAs
  const secChUa = getSecChUa(ua);
  if (secChUa) {
    headers['Sec-CH-UA'] = secChUa;
    headers['Sec-CH-UA-Mobile'] = '?0';
    headers['Sec-CH-UA-Platform'] = ua.includes('Windows') ? '"Windows"'
      : ua.includes('Macintosh') ? '"macOS"' : '"Linux"';
  }

  // Add Google referer (looks like user came from search)
  const tld = GOOGLE_TLDS[market || 'US'] || 'com';
  headers['Referer'] = `https://www.google.${tld}/`;

  return headers;
}

// ─── Playwright Stealth ───────────────────────────────────────

/** Extra Chromium args to reduce bot detection */
export const STEALTH_CHROMIUM_ARGS = [
  '--disable-blink-features=AutomationControlled',
];

/** Stealth init script — injected into every new page */
export const STEALTH_INIT_SCRIPT = `
  // Remove navigator.webdriver flag
  Object.defineProperty(navigator, 'webdriver', { get: () => false });

  // Mock chrome.runtime (Chromium detection)
  if (!window.chrome) {
    window.chrome = {};
  }
  if (!window.chrome.runtime) {
    window.chrome.runtime = {};
  }

  // Override permissions query to hide "notifications denied" signal
  const originalQuery = window.navigator.permissions?.query;
  if (originalQuery) {
    window.navigator.permissions.query = (parameters) =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: 'prompt', onchange: null })
        : originalQuery(parameters);
  }
`;

// ─── Viewport Randomization ──────────────────────────────────

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1280, height: 720 },
  { width: 1600, height: 900 },
  { width: 1680, height: 1050 },
];

/** Pick a random realistic viewport size */
export function getRandomViewport(): { width: number; height: number } {
  return VIEWPORTS[Math.floor(Math.random() * VIEWPORTS.length)];
}

// ─── Delay Jitter ─────────────────────────────────────────────

/**
 * Add ±30% random jitter to a base delay.
 * e.g., 1000ms → 700-1300ms
 */
export function randomDelay(baseMs: number): number {
  const jitter = 0.3;
  const min = Math.round(baseMs * (1 - jitter));
  const max = Math.round(baseMs * (1 + jitter));
  return min + Math.floor(Math.random() * (max - min + 1));
}
