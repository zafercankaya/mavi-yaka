/**
 * bulk-import-craigslist.ts — Bulk Import from Craigslist RSS feeds (US + CA)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-craigslist.ts
 *
 * RSS: https://{city}.craigslist.org/search/{category}?format=rss
 * - Blue-collar categories: lab, mnu, trp, fbh, sec, sks
 * - Max 100 items per feed (Craigslist limit)
 * - 30 US cities + 8 CA cities
 * - Rate limit: 2s between requests (Craigslist is strict)
 */

import 'dotenv/config';
import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const REQUEST_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_TOTAL_LISTINGS = 30_000;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/[çć]/g, 'c').replace(/[şś]/g, 's').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Strip HTML tags from description ──────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Sector detection (English) ────────────────────────────────────

function detectSector(title: string, description?: string): Sector {
  const t = `${title} ${description || ''}`.toLowerCase();
  if (/warehouse|forklift|shipping|logistics|driver|trucker|cdl|delivery|dispatch|freight|courier|postal|mail carrier/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|factory|assembly|machine operator|cnc|production|welder|welding|fabricat/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|sales associate|merchandis/i.test(t)) return 'RETAIL';
  if (/construct|carpenter|plumber|electrician|roofer|mason|concrete|framer|drywall|painter|tile|flooring|hvac|pipefitter/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|food|baker|butcher|barista|bartend|dishwash|catering|prep cook/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|auto|automotive|body shop|tire|oil change|collision/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|seamstress|upholster/i.test(t)) return 'TEXTILE';
  if (/mining|energy|solar|wind|oil.*gas|drilling|power plant|lineman/i.test(t)) return 'MINING_ENERGY';
  if (/nurse|nursing|cna|caregiver|healthcare|home health|medical assist|patient care/i.test(t)) return 'HEALTHCARE';
  if (/hotel|housekeeper|housekeeping|front desk|resort|hospitality|laundry|room attendant/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/landscap|garden|farm|agriculture|ranch|irrigation|nursery|tree|lawn/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|bouncer|patrol|surveillance/i.test(t)) return 'SECURITY_SERVICES';
  if (/janitor|custodian|clean|maintenance|facility|building engineer|handyman|porter|waste|trash|sanitation/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metal|steel|iron.*worker|welder|blacksmith|sheet metal|foundry|tool.*die/i.test(t)) return 'METAL_STEEL';
  if (/chemic|pharma|plastic|rubber|lab tech|paint/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/telecom|cable|fiber optic|tower.*tech|cell tower/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Craigslist cities & categories ────────────────────────────────

interface CityConfig {
  subdomain: string;
  displayName: string;
  market: Market;
  state?: string;
}

const US_CITIES: CityConfig[] = [
  { subdomain: 'newyork', displayName: 'New York', market: 'US', state: 'NY' },
  { subdomain: 'losangeles', displayName: 'Los Angeles', market: 'US', state: 'CA' },
  { subdomain: 'chicago', displayName: 'Chicago', market: 'US', state: 'IL' },
  { subdomain: 'houston', displayName: 'Houston', market: 'US', state: 'TX' },
  { subdomain: 'phoenix', displayName: 'Phoenix', market: 'US', state: 'AZ' },
  { subdomain: 'philadelphia', displayName: 'Philadelphia', market: 'US', state: 'PA' },
  { subdomain: 'sanantonio', displayName: 'San Antonio', market: 'US', state: 'TX' },
  { subdomain: 'sandiego', displayName: 'San Diego', market: 'US', state: 'CA' },
  { subdomain: 'dallas', displayName: 'Dallas', market: 'US', state: 'TX' },
  { subdomain: 'austin', displayName: 'Austin', market: 'US', state: 'TX' },
  { subdomain: 'jacksonville', displayName: 'Jacksonville', market: 'US', state: 'FL' },
  { subdomain: 'sfbay', displayName: 'San Francisco Bay Area', market: 'US', state: 'CA' },
  { subdomain: 'seattle', displayName: 'Seattle', market: 'US', state: 'WA' },
  { subdomain: 'denver', displayName: 'Denver', market: 'US', state: 'CO' },
  { subdomain: 'nashville', displayName: 'Nashville', market: 'US', state: 'TN' },
  { subdomain: 'boston', displayName: 'Boston', market: 'US', state: 'MA' },
  { subdomain: 'detroit', displayName: 'Detroit', market: 'US', state: 'MI' },
  { subdomain: 'portland', displayName: 'Portland', market: 'US', state: 'OR' },
  { subdomain: 'memphis', displayName: 'Memphis', market: 'US', state: 'TN' },
  { subdomain: 'atlanta', displayName: 'Atlanta', market: 'US', state: 'GA' },
  { subdomain: 'lasvegas', displayName: 'Las Vegas', market: 'US', state: 'NV' },
  { subdomain: 'miami', displayName: 'Miami', market: 'US', state: 'FL' },
  { subdomain: 'minneapolis', displayName: 'Minneapolis', market: 'US', state: 'MN' },
  { subdomain: 'tampa', displayName: 'Tampa', market: 'US', state: 'FL' },
  { subdomain: 'stlouis', displayName: 'St. Louis', market: 'US', state: 'MO' },
  { subdomain: 'pittsburgh', displayName: 'Pittsburgh', market: 'US', state: 'PA' },
  { subdomain: 'raleigh', displayName: 'Raleigh', market: 'US', state: 'NC' },
  { subdomain: 'cleveland', displayName: 'Cleveland', market: 'US', state: 'OH' },
  { subdomain: 'orlando', displayName: 'Orlando', market: 'US', state: 'FL' },
  { subdomain: 'sacramento', displayName: 'Sacramento', market: 'US', state: 'CA' },
];

const CA_CITIES: CityConfig[] = [
  { subdomain: 'toronto', displayName: 'Toronto', market: 'CA', state: 'ON' },
  { subdomain: 'vancouver', displayName: 'Vancouver', market: 'CA', state: 'BC' },
  { subdomain: 'montreal', displayName: 'Montreal', market: 'CA', state: 'QC' },
  { subdomain: 'calgary', displayName: 'Calgary', market: 'CA', state: 'AB' },
  { subdomain: 'ottawa', displayName: 'Ottawa', market: 'CA', state: 'ON' },
  { subdomain: 'edmonton', displayName: 'Edmonton', market: 'CA', state: 'AB' },
  { subdomain: 'winnipeg', displayName: 'Winnipeg', market: 'CA', state: 'MB' },
  { subdomain: 'halifax', displayName: 'Halifax', market: 'CA', state: 'NS' },
];

const ALL_CITIES = [...US_CITIES, ...CA_CITIES];

// Blue-collar job categories on Craigslist
const CATEGORIES = [
  { code: 'lab', name: 'General Labor' },
  { code: 'mnu', name: 'Manufacturing' },
  { code: 'trp', name: 'Transportation' },
  { code: 'fbh', name: 'Food/Bev/Hospitality' },
  { code: 'sec', name: 'Security' },
  { code: 'sks', name: 'Skilled Trade/Craft' },
];

// ─── Source lookup/creation (one per market) ────────────────────────

const sourceCache = new Map<Market, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const cached = sourceCache.get(market);
  if (cached) return cached;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'Craigslist' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: `Craigslist Jobs`, market },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `craigslist-jobs-${market.toLowerCase()}-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'Craigslist Jobs',
          slug: uniqueSlug,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.craigslist.org',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `Craigslist Jobs (${market})`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'RSS',
        market,
        companyId: company.id,
        seedUrls: [`https://newyork.craigslist.org/search/lab?format=rss`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(market, source);
  return source;
}

// ─── RSS parsing (no external deps — regex-based) ──────────────────

interface RssItem {
  title: string;
  link: string;
  description: string;
  date: string | null;
}

function parseRssItems(xml: string): RssItem[] {
  const items: RssItem[] = [];
  // Match each <item>...</item> block
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i);
    const descMatch = block.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const dateMatch = block.match(/<dc:date>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/dc:date>/i)
      || block.match(/<pubDate>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/pubDate>/i);

    const title = (titleMatch?.[1] || '').trim();
    const link = (linkMatch?.[1] || '').trim();

    if (!title || !link) continue;

    items.push({
      title,
      link,
      description: (descMatch?.[1] || '').trim(),
      date: dateMatch?.[1]?.trim() || null,
    });
  }

  return items;
}

// ─── Fetch RSS feed ─────────────────────────────────────────────────

async function fetchRssFeed(city: string, category: string): Promise<string | null> {
  const url = `https://${city}.craigslist.org/search/${category}?format=rss`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MaviYakaBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });
    if (!resp.ok) {
      if (resp.status === 404) return null; // city/category combo doesn't exist
      throw new Error(`HTTP ${resp.status}`);
    }
    return await resp.text();
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw new Error('Timeout');
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Extract city from Craigslist URL ───────────────────────────────

function extractCityFromUrl(url: string): string | null {
  const m = url.match(/https?:\/\/([a-z]+)\.craigslist\.org/i);
  return m?.[1] || null;
}

// ─── Main import ────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
  feedsFetched: number;
  feedsEmpty: number;
  feedsFailed: number;
}

async function main() {
  console.log(`\n🇺🇸🇨🇦 Mavi Yaka — Craigslist RSS Bulk Import`);
  console.log(`Cities: ${ALL_CITIES.length} (US: ${US_CITIES.length}, CA: ${CA_CITIES.length})`);
  console.log(`Categories: ${CATEGORIES.length} (${CATEGORIES.map(c => c.code).join(', ')})`);
  console.log(`Total feeds: ${ALL_CITIES.length * CATEGORIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = {
    fetched: 0, inserted: 0, skipped: 0, errors: 0,
    feedsFetched: 0, feedsEmpty: 0, feedsFailed: 0,
  };

  const seen = new Set<string>(); // URL dedup
  const seenTitles = new Map<string, number>(); // base title dedup per market
  const MAX_PER_TITLE = 2;
  let batch: any[] = [];
  let totalAccepted = 0;

  for (const city of ALL_CITIES) {
    if (totalAccepted >= MAX_TOTAL_LISTINGS) {
      console.log(`  Hard cap reached (${MAX_TOTAL_LISTINGS.toLocaleString()}), stopping.`);
      break;
    }

    const source = await getOrCreateSource(city.market);
    let cityTotal = 0;

    for (const category of CATEGORIES) {
      if (totalAccepted >= MAX_TOTAL_LISTINGS) break;

      try {
        const xml = await fetchRssFeed(city.subdomain, category.code);

        if (!xml) {
          stats.feedsEmpty++;
          continue;
        }

        const items = parseRssItems(xml);
        stats.feedsFetched++;

        if (items.length === 0) {
          stats.feedsEmpty++;
          continue;
        }

        stats.fetched += items.length;

        for (const item of items) {
          // URL dedup
          const canonicalUrl = item.link.split('?')[0].split('#')[0].toLowerCase();
          if (seen.has(canonicalUrl)) { stats.skipped++; continue; }
          seen.add(canonicalUrl);

          const fingerprint = md5(`cl:${canonicalUrl}`);
          const slug = `${slugify(item.title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          // Clean description
          const rawDesc = stripHtml(item.description);

          // Blue-collar filter
          const searchText = `${item.title} ${rawDesc.substring(0, 200)}`;
          if (!isBlueCollar(searchText, null)) {
            stats.skipped++;
            continue;
          }

          // Title dedup: max N per base title per market
          const titleKey = `${city.market}:${item.title.toLowerCase().trim()}`;
          const titleCount = seenTitles.get(titleKey) || 0;
          if (titleCount >= MAX_PER_TITLE) {
            stats.skipped++;
            continue;
          }
          seenTitles.set(titleKey, titleCount + 1);
          totalAccepted++;
          cityTotal++;

          // Parse posted date
          let postedDate: Date | null = null;
          if (item.date) {
            const d = new Date(item.date);
            if (!isNaN(d.getTime())) postedDate = d;
          }

          // Build description with location context
          const locationStr = city.state
            ? `${city.displayName}, ${city.state}`
            : city.displayName;
          const description = rawDesc
            ? `${rawDesc}\n\nLocation: ${locationStr}`.substring(0, 5000)
            : `Location: ${locationStr}`;

          batch.push({
            title: item.title.substring(0, 500),
            slug,
            sourceUrl: item.link,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: city.market,
            city: city.displayName,
            state: city.state || null,
            latitude: null,
            longitude: null,
            sector: detectSector(item.title, rawDesc),
            description,
            postedDate,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }

          // Hard cap check
          if (totalAccepted >= MAX_TOTAL_LISTINGS) break;
        }

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        stats.feedsFailed++;
        if (msg.includes('403') || msg.includes('429')) {
          console.warn(`  ${city.subdomain}/${category.code}: Rate limited (${msg}), waiting 30s...`);
          await delay(30_000);
        } else {
          console.warn(`  ${city.subdomain}/${category.code}: ${msg.substring(0, 100)}`);
          stats.errors++;
        }
      }
    }

    if (cityTotal > 0) {
      console.log(`  ${city.displayName} (${city.market}): ${cityTotal} jobs accepted`);
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  await prisma.$disconnect();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`FINAL STATS`);
  console.log(`  Feeds fetched: ${stats.feedsFetched}`);
  console.log(`  Feeds empty/404: ${stats.feedsEmpty}`);
  console.log(`  Feeds failed: ${stats.feedsFailed}`);
  console.log(`  Items fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Unique URLs: ${seen.size.toLocaleString()}`);
  console.log(`  Inserted/Updated: ${stats.inserted.toLocaleString()}`);
  console.log(`  Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

main().catch(console.error);
