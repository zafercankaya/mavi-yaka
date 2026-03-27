/**
 * bulk-import-themuse.ts — Import blue-collar jobs from The Muse public API
 *
 * The Muse is a US-focused job board with 50K+ listings in relevant categories.
 * API is 100% public, no auth required. JSON response.
 *
 * API: https://www.themuse.com/api/public/jobs
 * - Free, no API key
 * - 20 per page, pagination via ?page=N
 * - Categories: Retail (25K), Healthcare (22K), Construction (344)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-themuse.ts
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();
const PER_PAGE = 20;
const MAX_PAGES = 100; // 100 * 20 = 2000 per category
const REQUEST_DELAY_MS = 800;

// Blue-collar relevant categories on TheMuse
const CATEGORIES = [
  'Retail',
  'Healthcare',
  'Construction',
];

// ─── Location → Market mapping ──────────────────────────────────

const STATE_TO_MARKET: Record<string, Market> = {}; // All US states → US
const COUNTRY_MAP: Record<string, Market> = {
  'United States': 'US', 'US': 'US', 'USA': 'US',
  'United Kingdom': 'UK', 'UK': 'UK', 'England': 'UK', 'Scotland': 'UK', 'Wales': 'UK',
  'Canada': 'CA',
  'Germany': 'DE',
  'France': 'FR',
  'Australia': 'AU',
  'India': 'IN',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Japan': 'JP',
  'Netherlands': 'NL',
  'Spain': 'ES',
  'Italy': 'IT',
  'Sweden': 'SE',
  'Poland': 'PL',
  'Portugal': 'PT',
  'South Korea': 'KR',
  'Philippines': 'PH',
  'Thailand': 'TH',
  'Indonesia': 'ID',
  'Vietnam': 'VN',
  'Malaysia': 'MY',
  'Turkey': 'TR',
  'Russia': 'RU',
  'Saudi Arabia': 'SA',
  'United Arab Emirates': 'AE',
  'Egypt': 'EG',
  'South Africa': 'ZA',
  'Argentina': 'AR',
  'Colombia': 'CO',
  'Pakistan': 'PK',
};

// US state abbreviations
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'];

function detectMarket(locationName: string): { market: Market; city: string | null } {
  if (!locationName) return { market: 'US', city: null };

  // Check for explicit country names
  for (const [country, market] of Object.entries(COUNTRY_MAP)) {
    if (locationName.includes(country)) {
      const city = locationName.replace(country, '').replace(/,\s*$/, '').trim() || null;
      return { market, city };
    }
  }

  // Check for "City, STATE" pattern (US)
  const usPattern = locationName.match(/^(.+),\s*([A-Z]{2})$/);
  if (usPattern && US_STATES.includes(usPattern[2])) {
    return { market: 'US', city: usPattern[1].trim() };
  }

  // Check for country in parentheses or after comma
  const parts = locationName.split(',').map(s => s.trim());
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1];
    for (const [country, market] of Object.entries(COUNTRY_MAP)) {
      if (lastPart === country || lastPart === market) {
        return { market, city: parts[0] };
      }
    }
  }

  // Default to US (most TheMuse jobs are US-based)
  return { market: 'US', city: locationName.split(',')[0]?.trim() || null };
}

// ─── Sector detection ──────────────────────────────────────────────

function detectSector(title: string, category: string): Sector {
  const t = `${title} ${category}`.toLowerCase();

  if (/retail|store|shop|cashier|merchandis|sales.?associate/i.test(t))
    return 'RETAIL';
  if (/nurse|nursing|rn|lpn|cna|medical|clinical|patient|hospital|pharmacy|therapist/i.test(t))
    return 'HEALTHCARE';
  if (/construct|carpenter|plumber|electrician|hvac|painter|roofer/i.test(t))
    return 'CONSTRUCTION';
  if (/warehouse|logistics|driver|delivery|shipping|freight|forklift/i.test(t))
    return 'LOGISTICS_TRANSPORTATION';
  if (/food|cook|kitchen|chef|restaurant|barista|baker|server|bartend/i.test(t))
    return 'FOOD_BEVERAGE';
  if (/hotel|housekeep|front.?desk|concierge|hospitality/i.test(t))
    return 'HOSPITALITY';
  if (/clean|janitor|custodian|maintenance|facility/i.test(t))
    return 'FACILITY_MANAGEMENT';
  if (/security|guard|officer/i.test(t))
    return 'SECURITY';
  if (/mechanic|auto|vehicle|technician/i.test(t))
    return 'AUTOMOTIVE';
  if (/manufactur|production|assembly|operator/i.test(t))
    return 'MANUFACTURING';

  return 'OTHER';
}

function md5(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

// ─── Source cache ─────────────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `themuse-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'TheMuse' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'The Muse', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'The Muse',
          slug: `the-muse-${market.toLowerCase()}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.themuse.com',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `TheMuse ${market} Jobs`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: ['https://www.themuse.com/api/public/jobs'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Main ──────────────────────────────────────────────────────────

interface MuseJob {
  id: number;
  name: string;
  locations: { name: string }[];
  company: { id: number; short_name: string; name: string };
  publication_date: string;
  refs: { landing_page: string };
  categories: { name: string }[];
  levels: { name: string; short_name: string }[];
  type: string;
  contents: string;
}

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalNotBlueCollar = 0;
  let totalErrors = 0;
  const seenIds = new Set<number>();
  const marketCounts: Record<string, number> = {};

  console.log('🎯 Mavi Yaka — TheMuse Blue-Collar Import');
  console.log(`Categories: ${CATEGORIES.join(', ')}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (const category of CATEGORIES) {
    let categoryInserted = 0;

    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        const url = `https://www.themuse.com/api/public/jobs?page=${page}&category=${encodeURIComponent(category)}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'MaviYakaBot/1.0' },
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          if (res.status === 429) {
            console.log(`  ${category} page ${page}: Rate limited, waiting 30s...`);
            await delay(30000);
            continue;
          }
          console.log(`  ${category} page ${page}: HTTP ${res.status}`);
          break;
        }

        const json = await res.json() as {
          page: number;
          page_count: number;
          total: number;
          results: MuseJob[];
        };

        const jobs = json.results;
        if (!jobs || jobs.length === 0) break;

        totalFetched += jobs.length;

        for (const job of jobs) {
          if (seenIds.has(job.id)) { totalSkipped++; continue; }
          seenIds.add(job.id);

          try {
            // Get the first location (or default to US)
            const locationStr = job.locations?.[0]?.name || '';
            const { market, city } = detectMarket(locationStr);
            const categoryName = job.categories?.[0]?.name || category;

            const source = await getOrCreateSource(market);
            const fingerprint = md5(`themuse|${job.id}`);

            const existing = await prisma.jobListing.findFirst({
              where: { fingerprint },
            });

            if (existing) {
              await prisma.jobListing.update({
                where: { id: existing.id },
                data: { lastSeenAt: new Date(), status: 'ACTIVE' },
              });
              totalSkipped++;
              continue;
            }

            const sector = detectSector(job.name, categoryName);
            const titleSlug = slugify(`${job.name}-${job.company.name}-${job.id}`);
            const description = job.contents?.replace(/<[^>]*>/g, '')?.substring(0, 5000) || null;

            // Blue-collar filter — reject white-collar jobs
            if (!isBlueCollar(job.name, description)) {
              totalNotBlueCollar++;
              continue;
            }

            await prisma.jobListing.create({
              data: {
                title: job.name.substring(0, 500),
                slug: titleSlug,
                companyId: source.companyId,
                sourceId: source.id,
                sourceUrl: job.refs?.landing_page || `https://www.themuse.com/jobs/${job.id}`,
                country: market,
                city: city?.substring(0, 100) || null,
                description,
                sector,
                jobType: 'FULL_TIME',
                workMode: 'ON_SITE',
                fingerprint,
                status: 'ACTIVE',
                lastSeenAt: new Date(),
                postedDate: job.publication_date ? new Date(job.publication_date) : new Date(),
              },
            });

            totalInserted++;
            categoryInserted++;
            marketCounts[market] = (marketCounts[market] || 0) + 1;
          } catch (err: any) {
            if (err.code === 'P2002') {
              totalSkipped++;
            } else {
              totalErrors++;
            }
          }
        }

        if (page >= json.page_count) break;
        await delay(REQUEST_DELAY_MS);
      } catch (err: any) {
        console.log(`  ${category} page ${page} error: ${err.message?.substring(0, 80)}`);
        totalErrors++;
        if (totalErrors > 30) break;
      }
    }

    console.log(`  ${category}: +${categoryInserted} new`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  console.log('\n📊 FINAL STATS');
  console.log(`  Categories: ${CATEGORIES.join(', ')}`);
  console.log(`  Fetched: ${totalFetched}`);
  console.log(`  Inserted: ${totalInserted}`);
  console.log(`  Skipped/Dupes: ${totalSkipped}`);
  console.log(`  Not blue-collar: ${totalNotBlueCollar}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Duration: ${elapsed}s`);

  if (Object.keys(marketCounts).length > 0) {
    console.log('\n  Per market:');
    for (const [m, c] of Object.entries(marketCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${m}: +${c}`);
    }
  }

  console.log(`  Finished: ${new Date().toISOString()}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
