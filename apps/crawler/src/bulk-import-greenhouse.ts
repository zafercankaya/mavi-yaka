/**
 * bulk-import-greenhouse.ts — Import jobs from Greenhouse ATS public API
 *
 * Greenhouse Job Board API is 100% public, no auth required.
 * We target major blue-collar employers who use Greenhouse.
 *
 * API: https://boards-api.greenhouse.io/v1/boards/{board}/jobs
 * - Free, no API key
 * - No rate limit (cached)
 * - Returns all open jobs per board
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-greenhouse.ts
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();
const REQUEST_DELAY_MS = 2000;

// ─── Greenhouse boards: { token, company name, primary market, extra markets } ──

interface BoardConfig {
  token: string;
  company: string;
  market: Market;
  extraMarkets?: Market[];
}

const BOARDS: BoardConfig[] = [
  // Logistics & Delivery
  { token: 'instacart', company: 'Instacart', market: 'US', extraMarkets: ['CA'] },
  { token: 'flexport', company: 'Flexport', market: 'US', extraMarkets: ['DE', 'NL'] },
  { token: 'samsara', company: 'Samsara', market: 'US', extraMarkets: ['UK', 'MX'] },
  { token: 'project44', company: 'project44', market: 'US', extraMarkets: ['DE'] },
  { token: 'flyzipline', company: 'Zipline', market: 'US' },
  { token: 'convoy', company: 'Convoy', market: 'US' },
  { token: 'gopuff', company: 'Gopuff', market: 'US', extraMarkets: ['UK'] },

  // Food & Retail
  { token: 'hellofresh', company: 'HelloFresh', market: 'DE', extraMarkets: ['US', 'UK', 'AU', 'NL', 'SE', 'FR'] },
  { token: 'slice', company: 'Slice', market: 'US' },
  { token: 'naturesbakery', company: "Nature's Bakery", market: 'US' },
  { token: 'EquipmentSharecom', company: 'EquipmentShare', market: 'US' },

  // Delivery platforms
  { token: 'wolt', company: 'Wolt', market: 'DE', extraMarkets: ['SE', 'PL', 'JP'] },
  { token: 'doordashquebec', company: 'DoorDash Quebec', market: 'CA' },

  // Tech with warehouse/ops
  { token: 'cloudflare', company: 'Cloudflare', market: 'US', extraMarkets: ['UK', 'DE', 'AU', 'IN', 'JP', 'FR'] },
  { token: 'stripe', company: 'Stripe', market: 'US', extraMarkets: ['UK', 'DE', 'AU', 'IN', 'JP'] },
  { token: 'airbnb', company: 'Airbnb', market: 'US', extraMarkets: ['UK', 'DE', 'AU', 'IN', 'FR', 'ES', 'IT', 'BR', 'JP', 'KR', 'MX'] },
  { token: 'databricks', company: 'Databricks', market: 'US', extraMarkets: ['UK', 'DE', 'FR', 'NL', 'AU', 'IN', 'JP'] },
  { token: 'pinterest', company: 'Pinterest', market: 'US' },
  { token: 'reddit', company: 'Reddit', market: 'US' },
  { token: 'robinhood', company: 'Robinhood', market: 'US' },

  // Manufacturing / Equipment
  { token: 'eositsolutions', company: 'EOS IT Solutions', market: 'US', extraMarkets: ['UK', 'DE', 'IN'] },
  { token: 'cargurus', company: 'CarGurus', market: 'US', extraMarkets: ['UK'] },
  { token: 'togetherwork', company: 'Togetherwork', market: 'US' },

  // Misc with blue-collar
  { token: 'flex', company: 'Flex Ltd', market: 'US', extraMarkets: ['MX', 'BR', 'IN', 'MY', 'PL'] },
  { token: 'lyft', company: 'Lyft', market: 'US', extraMarkets: ['CA'] },
];

// ─── Location detection from job location string ──────────────────

const LOCATION_ENTRIES: [string, Market][] = [
  ['united states', 'US'], ['usa', 'US'], ['new york', 'US'], ['san francisco', 'US'],
  ['los angeles', 'US'], ['chicago', 'US'], ['seattle', 'US'], ['austin', 'US'],
  ['boston', 'US'], ['denver', 'US'], ['atlanta', 'US'], ['dallas', 'US'],
  ['miami', 'US'], ['phoenix', 'US'], ['remote - us', 'US'],
  ['united kingdom', 'UK'], ['london', 'UK'], ['manchester', 'UK'], ['birmingham', 'UK'],
  ['germany', 'DE'], ['berlin', 'DE'], ['munich', 'DE'], ['hamburg', 'DE'], ['frankfurt', 'DE'],
  ['france', 'FR'], ['paris', 'FR'],
  ['spain', 'ES'], ['madrid', 'ES'], ['barcelona', 'ES'],
  ['italy', 'IT'], ['milan', 'IT'], ['rome', 'IT'],
  ['netherlands', 'NL'], ['amsterdam', 'NL'],
  ['poland', 'PL'], ['warsaw', 'PL'], ['krakow', 'PL'],
  ['sweden', 'SE'], ['stockholm', 'SE'],
  ['portugal', 'PT'], ['lisbon', 'PT'],
  ['canada', 'CA'], ['toronto', 'CA'], ['vancouver', 'CA'], ['montreal', 'CA'],
  ['australia', 'AU'], ['sydney', 'AU'], ['melbourne', 'AU'],
  ['india', 'IN'], ['bangalore', 'IN'], ['mumbai', 'IN'], ['hyderabad', 'IN'], ['delhi', 'IN'],
  ['japan', 'JP'], ['tokyo', 'JP'],
  ['brazil', 'BR'], ['são paulo', 'BR'], ['sao paulo', 'BR'],
  ['mexico', 'MX'], ['mexico city', 'MX'], ['guadalajara', 'MX'],
  ['turkey', 'TR'], ['istanbul', 'TR'],
  ['russia', 'RU'], ['moscow', 'RU'],
  ['indonesia', 'ID'], ['jakarta', 'ID'],
  ['philippines', 'PH'], ['manila', 'PH'],
  ['thailand', 'TH'], ['bangkok', 'TH'],
  ['south korea', 'KR'], ['korea', 'KR'], ['seoul', 'KR'],
  ['egypt', 'EG'], ['cairo', 'EG'],
  ['saudi arabia', 'SA'], ['riyadh', 'SA'],
  ['uae', 'AE'], ['dubai', 'AE'],
  ['argentina', 'AR'], ['buenos aires', 'AR'],
  ['colombia', 'CO'], ['bogota', 'CO'],
  ['vietnam', 'VN'], ['malaysia', 'MY'], ['pakistan', 'PK'],
  ['south africa', 'ZA'], ['cape town', 'ZA'], ['johannesburg', 'ZA'],
];

function detectMarketFromLocation(location: string, boardMarket: Market): Market {
  const loc = (location || '').toLowerCase().trim();
  if (!loc) return boardMarket;

  for (const [key, market] of LOCATION_ENTRIES) {
    if (loc.includes(key)) return market;
  }

  return boardMarket;
}

// ─── Sector detection ──────────────────────────────────────────────

function detectSector(title: string, location: string): Sector {
  const text = `${title} ${location}`.toLowerCase();

  if (/logist|warehouse|driver|transport|delivery|shipping|freight|fulfil/.test(text))
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
  if (/metal|steel|weld/.test(text))
    return 'METAL_STEEL';
  if (/chemi|pharma|lab/.test(text))
    return 'CHEMICALS';
  if (/textile|sewing|fashion/.test(text))
    return 'TEXTILE';
  if (/mining|energy|solar|wind|oil|gas/.test(text))
    return 'MINING_ENERGY';
  if (/ecommerce|e-commerce|packing/.test(text))
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

async function getOrCreateSource(companyName: string, market: Market, boardToken: string): Promise<{ id: string; companyId: string }> {
  const key = `gh-${boardToken}-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  const sourceName = `${companyName} Greenhouse Jobs`;

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
          websiteUrl: `https://boards.greenhouse.io/${boardToken}`,
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
        seedUrls: [`https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Main ──────────────────────────────────────────────────────────

interface GreenhouseJob {
  id: number;
  title: string;
  updated_at: string;
  absolute_url: string;
  location: { name: string };
  metadata: any[];
  departments: { name: string }[];
}

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const marketCounts: Record<string, number> = {};

  console.log('🏢 Mavi Yaka — Greenhouse ATS Bulk Import');
  console.log(`Boards: ${BOARDS.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (const board of BOARDS) {
    try {
      const url = `https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs?content=true`;
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });

      if (!res.ok) {
        console.log(`  ${board.company}: HTTP ${res.status}`);
        continue;
      }

      const json = await res.json() as { jobs: GreenhouseJob[] };
      const jobs = json.jobs || [];

      if (jobs.length === 0) {
        console.log(`  ${board.company}: 0 jobs`);
        continue;
      }

      totalFetched += jobs.length;
      let boardInserted = 0;

      for (const job of jobs) {
        try {
          const locationStr = job.location?.name || '';
          const market = detectMarketFromLocation(locationStr, board.market);

          const source = await getOrCreateSource(board.company, market, board.token);
          const sector = detectSector(job.title, locationStr);
          const fingerprint = md5(`greenhouse|${board.token}|${job.id}`);

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

          const titleSlug = slugify(`${job.title}-${board.company}-${job.id}`);
          const dept = job.departments?.map(d => d.name).join(', ') || '';

          await prisma.jobListing.create({
            data: {
              title: job.title.substring(0, 500),
              slug: titleSlug,
              companyId: source.companyId,
              sourceId: source.id,
              sourceUrl: job.absolute_url,
              country: market,
              city: locationStr.split(',')[0]?.trim()?.substring(0, 100) || null,
              description: dept ? `Department: ${dept}` : null,
              sector,
              jobType: 'FULL_TIME',
              workMode: locationStr.toLowerCase().includes('remote') ? 'REMOTE' : 'ON_SITE',
              fingerprint,
              status: 'ACTIVE',
              lastSeenAt: new Date(),
              postedDate: job.updated_at ? new Date(job.updated_at) : new Date(),
            },
          });

          totalInserted++;
          boardInserted++;
          marketCounts[market] = (marketCounts[market] || 0) + 1;
        } catch (err: any) {
          if (err.code === 'P2002') {
            totalSkipped++;
          } else {
            totalErrors++;
          }
        }
      }

      console.log(`  ${board.company}: ${jobs.length} fetched, +${boardInserted} new`);
      await delay(REQUEST_DELAY_MS);
    } catch (err: any) {
      console.log(`  ${board.company}: ERROR ${err.message?.substring(0, 100)}`);
      totalErrors++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  console.log('\n📊 FINAL STATS');
  console.log(`  Boards: ${BOARDS.length}`);
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
