/**
 * bulk-import-himalayas.ts — Import jobs from Himalayas.app free API
 *
 * Himalayas aggregates remote job listings globally (100K+).
 * Many have location restrictions → we map to our 31 markets.
 *
 * API: https://himalayas.app/jobs/api
 * - Free, no API key needed
 * - 20 jobs per page, offset pagination
 * - Rate limited, cached daily
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-himalayas.ts
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const API_URL = 'https://himalayas.app/jobs/api';
const LIMIT = 20; // max per request
const MAX_OFFSET = 2000; // 2000 * 20 = 40K max (mostly tech/remote, cap to save time)
const REQUEST_DELAY_MS = 1500;

// ─── Country name → Market mapping ──────────────────────────────────

const COUNTRY_MAP: Record<string, Market> = {
  'United States': 'US', 'USA': 'US', 'US': 'US',
  'United Kingdom': 'UK', 'UK': 'UK', 'England': 'UK', 'Scotland': 'UK',
  'Germany': 'DE', 'Deutschland': 'DE',
  'France': 'FR',
  'Spain': 'ES',
  'Italy': 'IT',
  'Netherlands': 'NL', 'Holland': 'NL',
  'Poland': 'PL',
  'Sweden': 'SE',
  'Portugal': 'PT',
  'Canada': 'CA',
  'Australia': 'AU',
  'India': 'IN',
  'Japan': 'JP',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Turkey': 'TR', 'Türkiye': 'TR',
  'Russia': 'RU', 'Russian Federation': 'RU',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Thailand': 'TH',
  'South Korea': 'KR', 'Korea': 'KR', 'Korea, Republic of': 'KR',
  'Egypt': 'EG',
  'Saudi Arabia': 'SA',
  'United Arab Emirates': 'AE', 'UAE': 'AE',
  'Argentina': 'AR',
  'Colombia': 'CO',
  'Vietnam': 'VN', 'Viet Nam': 'VN',
  'Malaysia': 'MY',
  'Pakistan': 'PK',
  'South Africa': 'ZA',
};

// Also map timezone-based locations
const TIMEZONE_MAP: Record<string, Market> = {
  'Americas': 'US', 'Americas, Europe': 'US', 'Europe': 'DE',
  'Asia': 'IN', 'APAC': 'AU', 'EMEA': 'UK', 'LATAM': 'BR',
};

function detectMarkets(locationRestrictions: string[]): Market[] {
  if (!locationRestrictions || locationRestrictions.length === 0) return [];

  const markets = new Set<Market>();
  for (const loc of locationRestrictions) {
    const mapped = COUNTRY_MAP[loc];
    if (mapped) markets.add(mapped);
  }
  return Array.from(markets);
}

// ─── Sector detection ──────────────────────────────────────────────

function detectSector(title: string, categories: string[]): Sector {
  const text = `${title} ${categories.join(' ')}`.toLowerCase();

  if (/logist|warehouse|lager|driver|transport|delivery|shipping|freight/.test(text))
    return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|machine.?operator/.test(text))
    return 'MANUFACTURING';
  if (/retail|store|shop|cashier|merchandis/.test(text))
    return 'RETAIL';
  if (/construct|carpenter|plumber|electrician|painter|hvac/.test(text))
    return 'CONSTRUCTION';
  if (/food|beverage|cook|kitchen|restaurant|baker|barista|chef/.test(text))
    return 'FOOD_BEVERAGE';
  if (/hotel|hospitality|housekeep|front.?desk|concierge/.test(text))
    return 'HOSPITALITY';
  if (/clean|facility|janitor|maintenance/.test(text))
    return 'FACILITY_MANAGEMENT';
  if (/secur|guard|safety.?officer/.test(text))
    return 'SECURITY';
  if (/health|nurse|hospital|clinic|care.?giver|medical/.test(text))
    return 'HEALTHCARE';
  if (/auto|mechanic|vehicle|technician/.test(text))
    return 'AUTOMOTIVE';
  if (/agri|farm|garden/.test(text))
    return 'AGRICULTURE';
  if (/metal|steel|weld/.test(text))
    return 'METAL_STEEL';
  if (/chemi|pharma|lab/.test(text))
    return 'CHEMICALS';
  if (/textile|sewing|fashion/.test(text))
    return 'TEXTILE';
  if (/mining|energy|solar|wind|oil|gas/.test(text))
    return 'MINING_ENERGY';
  if (/ecommerce|e-commerce|fulfil|packing/.test(text))
    return 'ECOMMERCE_CARGO';
  if (/telecom|network|cable/.test(text))
    return 'TELECOM';

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
  const key = `himalayas-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'Himalayas' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Himalayas', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Himalayas',
          slug: `himalayas-${market.toLowerCase()}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://himalayas.app',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `Himalayas ${market} Remote Jobs`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: ['https://himalayas.app/jobs/api'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Main ──────────────────────────────────────────────────────────

interface HimalayasJob {
  title: string;
  excerpt: string;
  companyName: string;
  companySlug: string;
  companyLogo: string;
  employmentType: string;
  minSalary: number | null;
  maxSalary: number | null;
  seniority: string[];
  currency: string;
  locationRestrictions: string[];
  timezoneRestrictions: string[];
  categories: string[];
  parentCategories: string[];
  description: string;
  pubDate: string;
  expiryDate: string | null;
  applicationLink: string;
  guid: string;
}

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalNotBlueCollar = 0;
  let totalErrors = 0;
  const marketCounts: Record<string, number> = {};

  console.log('🏔️ Mavi Yaka — Himalayas Remote Jobs Import');
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (let offset = 0; offset < MAX_OFFSET; offset += LIMIT) {
    try {
      const url = `${API_URL}?limit=${LIMIT}&offset=${offset}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });

      if (!res.ok) {
        console.log(`  offset=${offset}: HTTP ${res.status}`);
        if (res.status === 429) {
          console.log('  Rate limited, waiting 60s...');
          await delay(60000);
          continue;
        }
        break;
      }

      const json = await res.json() as {
        totalCount: number;
        jobs: HimalayasJob[];
        offset: number;
        limit: number;
      };

      const jobs = json.jobs;
      if (!jobs || jobs.length === 0) {
        console.log(`  offset=${offset}: No more jobs. Done.`);
        break;
      }

      totalFetched += jobs.length;

      for (const job of jobs) {
        try {
          // Detect markets from location restrictions
          let markets = detectMarkets(job.locationRestrictions);

          // If no specific market found, assign to US (largest market)
          if (markets.length === 0) {
            markets = ['US' as Market];
          }

          // Insert for each mapped market (max 5 to avoid bloat)
          const targetMarkets = markets.slice(0, 5);

          for (const market of targetMarkets) {
            const source = await getOrCreateSource(market);
            const sector = detectSector(job.title, job.categories || []);
            const fingerprint = md5(`himalayas|${job.guid}|${market}`);

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

            const description = job.description?.replace(/<[^>]*>/g, '')?.substring(0, 5000) || null;

            // Blue-collar filter — reject white-collar jobs
            if (!isBlueCollar(job.title, description)) {
              totalNotBlueCollar++;
              continue;
            }

            const titleSlug = slugify(`${job.title}-${job.companyName}-${market}`);

            const workMode = 'REMOTE';
            const jobType = job.employmentType === 'Part Time'
              ? 'PART_TIME'
              : job.employmentType === 'Contract'
                ? 'CONTRACT'
                : 'FULL_TIME';

            await prisma.jobListing.create({
              data: {
                title: job.title.substring(0, 500),
                slug: titleSlug,
                companyId: source.companyId,
                sourceId: source.id,
                sourceUrl: job.applicationLink || `https://himalayas.app/jobs/${job.guid}`,
                country: market,
                description,
                summary: job.excerpt?.substring(0, 300) || description?.substring(0, 300) || null,
                sector,
                jobType,
                workMode,
                salaryMin: job.minSalary || null,
                salaryMax: job.maxSalary || null,
                salaryCurrency: (job.minSalary || job.maxSalary) ? (job.currency || 'USD') : null,
                fingerprint,
                status: 'ACTIVE',
                lastSeenAt: new Date(),
                postedDate: job.pubDate ? new Date(job.pubDate) : new Date(),
              },
            });

            totalInserted++;
            marketCounts[market] = (marketCounts[market] || 0) + 1;
          }
        } catch (err: any) {
          if (err.code === 'P2002') {
            totalSkipped++;
          } else {
            totalErrors++;
          }
        }
      }

      const page = Math.floor(offset / LIMIT) + 1;
      console.log(`  Page ${page} (offset=${offset}): ${jobs.length} fetched, +${totalInserted} inserted total`);

      if (jobs.length < LIMIT) {
        console.log('  Last page reached.');
        break;
      }

      await delay(REQUEST_DELAY_MS);
    } catch (err: any) {
      console.log(`  offset=${offset} error: ${err.message}`);
      totalErrors++;
      if (totalErrors > 10) break;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  console.log('\n📊 FINAL STATS');
  console.log(`  Fetched: ${totalFetched}`);
  console.log(`  Inserted: ${totalInserted}`);
  console.log(`  Skipped: ${totalSkipped}`);
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
