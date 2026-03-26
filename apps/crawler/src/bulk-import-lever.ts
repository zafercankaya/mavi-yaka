/**
 * bulk-import-lever.ts — Import jobs from Lever ATS public API
 *
 * Lever Postings API is 100% public, no auth required.
 * We target companies that use Lever for hiring.
 *
 * API: https://api.lever.co/v0/postings/{company}?mode=json
 * - Free, no API key
 * - Returns all open postings per company
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-lever.ts
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();
const REQUEST_DELAY_MS = 2000;

// ─── Lever company configs ──────────────────────────────────────────

interface LeverConfig {
  slug: string;
  company: string;
  market: Market;
  extraMarkets?: Market[];
}

const COMPANIES: LeverConfig[] = [
  // ── Verified working from Contabo (tested 2026-03-26) ──
  { slug: 'trendyol', company: 'Trendyol', market: 'TR', extraMarkets: ['DE'] },
  { slug: 'spotify', company: 'Spotify', market: 'SE', extraMarkets: ['US', 'UK', 'DE', 'FR', 'ES', 'IT', 'NL', 'JP', 'BR', 'IN', 'AU'] },
  { slug: 'octoenergy', company: 'Octopus Energy', market: 'UK', extraMarkets: ['US', 'DE', 'FR', 'ES', 'IT', 'JP', 'AU', 'NL'] },
  { slug: 'lalamove', company: 'Lalamove', market: 'MY', extraMarkets: ['TH', 'PH', 'ID', 'VN', 'IN', 'BR', 'MX'] },
  { slug: 'premiertruck', company: 'Premier Truck Group', market: 'US' },
  { slug: 'arrivelogistics', company: 'Arrive Logistics', market: 'US' },
  { slug: 'scoperecruiting', company: 'SCOPE Recruiting', market: 'US' },
  { slug: 'liveoakfiber', company: 'LiveOak Fiber', market: 'US' },
];

// ─── Location detection ──────────────────────────────────────────

const LOCATION_ENTRIES: [string, Market][] = [
  ['united states', 'US'], ['usa', 'US'], ['new york', 'US'], ['san francisco', 'US'],
  ['los angeles', 'US'], ['chicago', 'US'], ['seattle', 'US'], ['austin', 'US'],
  ['united kingdom', 'UK'], ['london', 'UK'], ['manchester', 'UK'],
  ['germany', 'DE'], ['berlin', 'DE'], ['munich', 'DE'], ['hamburg', 'DE'],
  ['france', 'FR'], ['paris', 'FR'],
  ['spain', 'ES'], ['madrid', 'ES'], ['barcelona', 'ES'],
  ['italy', 'IT'], ['milan', 'IT'], ['rome', 'IT'],
  ['netherlands', 'NL'], ['amsterdam', 'NL'],
  ['poland', 'PL'], ['warsaw', 'PL'],
  ['sweden', 'SE'], ['stockholm', 'SE'],
  ['portugal', 'PT'], ['lisbon', 'PT'],
  ['canada', 'CA'], ['toronto', 'CA'], ['vancouver', 'CA'],
  ['australia', 'AU'], ['sydney', 'AU'], ['melbourne', 'AU'],
  ['india', 'IN'], ['bangalore', 'IN'], ['mumbai', 'IN'],
  ['japan', 'JP'], ['tokyo', 'JP'],
  ['brazil', 'BR'], ['são paulo', 'BR'], ['sao paulo', 'BR'],
  ['mexico', 'MX'], ['mexico city', 'MX'],
  ['turkey', 'TR'], ['istanbul', 'TR'], ['ankara', 'TR'],
  ['russia', 'RU'], ['moscow', 'RU'],
  ['indonesia', 'ID'], ['jakarta', 'ID'],
  ['philippines', 'PH'], ['manila', 'PH'],
  ['thailand', 'TH'], ['bangkok', 'TH'],
  ['south korea', 'KR'], ['korea', 'KR'], ['seoul', 'KR'],
  ['egypt', 'EG'], ['cairo', 'EG'],
  ['saudi arabia', 'SA'], ['riyadh', 'SA'], ['jeddah', 'SA'],
  ['uae', 'AE'], ['dubai', 'AE'], ['abu dhabi', 'AE'],
  ['argentina', 'AR'], ['buenos aires', 'AR'],
  ['colombia', 'CO'], ['bogota', 'CO'],
  ['vietnam', 'VN'], ['ho chi minh', 'VN'], ['hanoi', 'VN'],
  ['malaysia', 'MY'], ['kuala lumpur', 'MY'],
  ['pakistan', 'PK'], ['karachi', 'PK'], ['lahore', 'PK'],
  ['south africa', 'ZA'], ['cape town', 'ZA'], ['johannesburg', 'ZA'],
];

function detectMarketFromLocation(location: string, defaultMarket: Market): Market {
  const loc = (location || '').toLowerCase().trim();
  if (!loc) return defaultMarket;

  for (const [key, market] of LOCATION_ENTRIES) {
    if (loc.includes(key)) return market;
  }
  return defaultMarket;
}

function detectSector(title: string): Sector {
  const text = title.toLowerCase();

  if (/logist|warehouse|driver|transport|delivery|shipping|freight|fulfil|courier/.test(text))
    return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|machine.?operator/.test(text))
    return 'MANUFACTURING';
  if (/retail|store|shop|cashier|merchandis/.test(text))
    return 'RETAIL';
  if (/construct|carpenter|plumber|electrician|painter|hvac/.test(text))
    return 'CONSTRUCTION';
  if (/food|beverage|cook|kitchen|restaurant|baker|barista|chef/.test(text))
    return 'FOOD_BEVERAGE';
  if (/hotel|hospitality|housekeep|front.?desk/.test(text))
    return 'HOSPITALITY';
  if (/clean|facility|janitor|maintenance|custodian/.test(text))
    return 'FACILITY_MANAGEMENT';
  if (/secur|guard|safety.?officer/.test(text))
    return 'SECURITY';
  if (/health|nurse|hospital|clinic|care.?giver|medical/.test(text))
    return 'HEALTHCARE';
  if (/auto|mechanic|vehicle|technician/.test(text))
    return 'AUTOMOTIVE';
  if (/agri|farm|garden/.test(text))
    return 'AGRICULTURE';
  if (/ecommerce|e-commerce|packing|picker/.test(text))
    return 'ECOMMERCE_CARGO';

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

async function getOrCreateSource(companyName: string, market: Market, leverSlug: string): Promise<{ id: string; companyId: string }> {
  const key = `lever-${leverSlug}-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  const sourceName = `${companyName} Lever Jobs`;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: sourceName, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: companyName, market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName,
          slug: slugify(`${companyName}-${market}`),
          market,
          sector: 'OTHER',
          websiteUrl: `https://jobs.lever.co/${leverSlug}`,
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: sourceName,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: [`https://api.lever.co/v0/postings/${leverSlug}?mode=json`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Main ──────────────────────────────────────────────────────────

interface LeverJob {
  id: string;
  text: string; // title
  categories: {
    team: string;
    department: string;
    location: string;
    commitment: string;
  };
  hostedUrl: string;
  applyUrl: string;
  createdAt: number;
  updatedAt: number;
}

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const marketCounts: Record<string, number> = {};

  console.log('🔗 Mavi Yaka — Lever ATS Bulk Import');
  console.log(`Companies: ${COMPANIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (const config of COMPANIES) {
    try {
      const url = `https://api.lever.co/v0/postings/${config.slug}?mode=json`;
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });

      if (!res.ok) {
        console.log(`  ${config.company}: HTTP ${res.status}`);
        continue;
      }

      const jobs = await res.json() as LeverJob[];

      if (!Array.isArray(jobs) || jobs.length === 0) {
        console.log(`  ${config.company}: 0 jobs`);
        continue;
      }

      totalFetched += jobs.length;
      let companyInserted = 0;

      for (const job of jobs) {
        try {
          const locationStr = job.categories?.location || '';
          const market = detectMarketFromLocation(locationStr, config.market);

          const source = await getOrCreateSource(config.company, market, config.slug);
          const sector = detectSector(job.text);
          const fingerprint = md5(`lever|${config.slug}|${job.id}`);

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

          const titleSlug = slugify(`${job.text}-${config.company}-${job.id.substring(0, 8)}`);
          const commitment = job.categories?.commitment || 'Full Time';
          const jobType = commitment.toLowerCase().includes('part')
            ? 'PART_TIME'
            : commitment.toLowerCase().includes('contract') || commitment.toLowerCase().includes('intern')
              ? 'CONTRACT'
              : 'FULL_TIME';

          const isRemote = locationStr.toLowerCase().includes('remote');
          const dept = [job.categories?.team, job.categories?.department]
            .filter(Boolean).join(' / ');

          await prisma.jobListing.create({
            data: {
              title: job.text.substring(0, 500),
              slug: titleSlug,
              companyId: source.companyId,
              sourceId: source.id,
              sourceUrl: job.hostedUrl || `https://jobs.lever.co/${config.slug}/${job.id}`,
              country: market,
              city: locationStr.split(',')[0]?.trim()?.substring(0, 100) || null,
              description: dept ? `Department: ${dept}` : null,
              sector,
              jobType,
              workMode: isRemote ? 'REMOTE' : 'ON_SITE',
              fingerprint,
              status: 'ACTIVE',
              lastSeenAt: new Date(),
              postedDate: job.createdAt ? new Date(job.createdAt) : new Date(),
            },
          });

          totalInserted++;
          companyInserted++;
          marketCounts[market] = (marketCounts[market] || 0) + 1;
        } catch (err: any) {
          if (err.code === 'P2002') {
            totalSkipped++;
          } else {
            totalErrors++;
          }
        }
      }

      console.log(`  ${config.company}: ${jobs.length} fetched, +${companyInserted} new`);
      await delay(REQUEST_DELAY_MS);
    } catch (err: any) {
      console.log(`  ${config.company}: ERROR ${err.message?.substring(0, 100)}`);
      totalErrors++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  console.log('\n📊 FINAL STATS');
  console.log(`  Companies: ${COMPANIES.length}`);
  console.log(`  Fetched: ${totalFetched}`);
  console.log(`  Inserted: ${totalInserted}`);
  console.log(`  Skipped: ${totalSkipped}`);
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
