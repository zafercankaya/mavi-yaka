/**
 * Auto-discovery module — determines the best crawl method for a seed URL.
 *
 * Priority: RSS/Atom Feed > JSON API > HTML Crawl
 */
import * as cheerio from 'cheerio';
import { REQUEST_TIMEOUT_MS } from '../config';

export interface DiscoveryResult {
  method: 'RSS' | 'API' | 'HTML';
  feedUrl?: string;
  apiUrl?: string;
}

const USER_AGENT = 'IndirimAvcisi/1.0';

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    redirect: 'follow',
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

/**
 * Discover the best crawl method for a seed URL.
 */
export async function discoverBestMethod(seedUrl: string): Promise<DiscoveryResult> {
  let html: string;
  try {
    html = await fetchHtml(seedUrl);
  } catch {
    return { method: 'HTML' };
  }

  const $ = cheerio.load(html);

  // 1. RSS/Atom discovery
  const feedUrl = await discoverFeed($, seedUrl);
  if (feedUrl) {
    return { method: 'RSS', feedUrl };
  }

  // 2. API discovery
  const apiUrl = discoverApi($, html, seedUrl);
  if (apiUrl) {
    return { method: 'API', apiUrl };
  }

  // 3. Fallback to HTML
  return { method: 'HTML' };
}

// ─── RSS/Atom Discovery ──────────────────────────────────

async function discoverFeed($: cheerio.CheerioAPI, baseUrl: string): Promise<string | null> {
  // 1. Check <link rel="alternate"> in <head>
  const rssLink =
    $('link[rel="alternate"][type="application/rss+xml"]').attr('href') ||
    $('link[rel="alternate"][type="application/atom+xml"]').attr('href') ||
    $('link[rel="alternate"][type="application/feed+json"]').attr('href');

  if (rssLink) {
    try {
      const feedUrl = new URL(rssLink, baseUrl).toString();
      const valid = await validateFeed(feedUrl);
      if (valid) return feedUrl;
    } catch {}
  }

  // 2. Try well-known feed paths
  const origin = new URL(baseUrl).origin;
  // Only campaign-related feed paths (skip blog feeds — they're not campaigns)
  const KNOWN_PATHS = [
    '/kampanya/feed', '/kampanyalar/feed',
    '/indirim/feed', '/firsatlar/feed',
    '/feed', '/feed/', '/rss', '/rss.xml', '/rss/',
    '/atom.xml', '/feed.xml',
    '/index.xml',
  ];

  for (const path of KNOWN_PATHS) {
    const url = origin + path;
    try {
      const valid = await validateFeed(url);
      if (valid) return url;
    } catch { /* continue */ }
  }

  return null;
}

// Campaign-related keywords to validate feed content
const CAMPAIGN_FEED_KEYWORDS = [
  'kampanya', 'indirim', 'firsat', 'fırsat', 'promosyon', 'teklif',
  'outlet', 'sale', 'deal', 'offer', 'promo', 'discount', 'campaign',
  'kupon', 'taksit', 'hediye', 'avantaj',
];

async function validateFeed(url: string): Promise<boolean> {
  try {
    // Skip known blog feed paths
    if (/\/blog\/(?:feed|rss)/i.test(url)) return false;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });

    if (!response.ok) return false;

    const contentType = response.headers.get('content-type') || '';
    const body = await response.text();

    // Check if it's actually XML
    const isXml =
      contentType.includes('xml') ||
      contentType.includes('rss') ||
      contentType.includes('atom') ||
      body.trimStart().startsWith('<?xml') ||
      body.includes('<rss') ||
      body.includes('<feed');

    if (!isXml) return false;

    // Check if the feed has campaign-related content
    const bodyLower = body.toLowerCase();
    const hasCampaignContent = CAMPAIGN_FEED_KEYWORDS.some((kw) => bodyLower.includes(kw));

    // If the feed URL itself contains campaign keywords, accept it
    const urlLower = url.toLowerCase();
    const isCampaignUrl = CAMPAIGN_FEED_KEYWORDS.some((kw) => urlLower.includes(kw));

    return hasCampaignContent || isCampaignUrl;
  } catch {
    return false;
  }
}

// ─── API Discovery ───────────────────────────────────────

function discoverApi($: cheerio.CheerioAPI, html: string, baseUrl: string): string | null {
  // Check for __NEXT_DATA__ (Next.js)
  const nextData = $('script#__NEXT_DATA__').html();
  if (nextData) {
    try {
      const parsed = JSON.parse(nextData);
      // Look for API routes in the Next.js page props
      const props = parsed?.props?.pageProps;
      if (props) {
        // Check if page data contains campaign-like arrays
        for (const [key, val] of Object.entries(props)) {
          if (Array.isArray(val) && (val as any[]).length > 0) {
            const first = (val as any[])[0];
            if (first && typeof first === 'object' && ('title' in first || 'name' in first)) {
              // Found a data source — construct API URL
              const origin = new URL(baseUrl).origin;
              const path = parsed?.page || '';
              if (path) {
                return `${origin}/api${path}`;
              }
            }
          }
        }
      }
    } catch {}
  }

  // Check for __NUXT__ (Nuxt.js)
  const nuxtMatch = html.match(/window\.__NUXT__\s*=\s*\(/);
  if (nuxtMatch) {
    // Nuxt app detected — could have API routes
    const origin = new URL(baseUrl).origin;
    const pathname = new URL(baseUrl).pathname;
    return `${origin}/api${pathname}`;
  }

  return null;
}
