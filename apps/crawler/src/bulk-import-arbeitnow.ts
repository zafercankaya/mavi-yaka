/**
 * bulk-import-arbeitnow.ts — Import jobs from ArbeitNow free API
 *
 * ArbeitNow aggregates jobs from ATS systems (Greenhouse, SmartRecruiters,
 * Join.com, TeamTailor, Recruitee, Comeet). Primarily Europe/Germany focused.
 *
 * API: https://www.arbeitnow.com/api/job-board-api
 * - Free, no API key needed
 * - 100 jobs per page, paginated
 * - Updated hourly
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-arbeitnow.ts
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const API_BASE = 'https://www.arbeitnow.com/api/job-board-api';
const MAX_PAGES = 30;
const REQUEST_DELAY_MS = 2000;

// ─── Location → Market mapping ──────────────────────────────────────

const LOCATION_ENTRIES: [string, string][] = [
  ['germany', 'DE'], ['deutschland', 'DE'], ['berlin', 'DE'], ['munich', 'DE'],
  ['hamburg', 'DE'], ['frankfurt', 'DE'], ['cologne', 'DE'],
  ['stuttgart', 'DE'], ['dortmund', 'DE'], ['essen', 'DE'], ['leipzig', 'DE'],
  ['dresden', 'DE'], ['hannover', 'DE'], ['duisburg', 'DE'], ['bochum', 'DE'],
  ['austria', 'DE'], ['wien', 'DE'], ['vienna', 'DE'],
  ['switzerland', 'DE'], ['zurich', 'DE'],
  ['netherlands', 'NL'], ['amsterdam', 'NL'], ['rotterdam', 'NL'], ['utrecht', 'NL'],
  ['eindhoven', 'NL'],
  ['france', 'FR'], ['paris', 'FR'], ['lyon', 'FR'], ['marseille', 'FR'],
  ['spain', 'ES'], ['madrid', 'ES'], ['barcelona', 'ES'],
  ['italy', 'IT'], ['milan', 'IT'], ['rome', 'IT'], ['milano', 'IT'],
  ['portugal', 'PT'], ['lisbon', 'PT'], ['porto', 'PT'],
  ['poland', 'PL'], ['warsaw', 'PL'], ['krakow', 'PL'],
  ['sweden', 'SE'], ['stockholm', 'SE'], ['gothenburg', 'SE'],
  ['united kingdom', 'UK'], ['london', 'UK'], ['manchester', 'UK'], ['england', 'UK'],
  ['united states', 'US'], ['california', 'US'],
  ['canada', 'CA'], ['toronto', 'CA'],
  ['australia', 'AU'], ['sydney', 'AU'], ['melbourne', 'AU'],
  ['india', 'IN'], ['bangalore', 'IN'], ['mumbai', 'IN'],
  ['brazil', 'BR'], ['japan', 'JP'], ['tokyo', 'JP'],
  ['turkey', 'TR'], ['istanbul', 'TR'],
  ['russia', 'RU'], ['moscow', 'RU'],
  ['korea', 'KR'], ['seoul', 'KR'],
  ['indonesia', 'ID'], ['jakarta', 'ID'],
  ['philippines', 'PH'], ['manila', 'PH'],
  ['thailand', 'TH'], ['bangkok', 'TH'],
  ['vietnam', 'VN'], ['hanoi', 'VN'],
  ['malaysia', 'MY'],
  ['pakistan', 'PK'], ['karachi', 'PK'],
  ['egypt', 'EG'], ['cairo', 'EG'],
  ['saudi', 'SA'], ['riyadh', 'SA'],
  ['dubai', 'AE'], ['uae', 'AE'],
  ['south africa', 'ZA'], ['johannesburg', 'ZA'],
  ['colombia', 'CO'], ['bogota', 'CO'],
  ['argentina', 'AR'],
  ['mexico', 'MX'],
];

function detectMarket(location: string): Market | null {
  const loc = (location || '').toLowerCase().trim();
  if (!loc) return null;

  for (const [key, market] of LOCATION_ENTRIES) {
    if (loc.includes(key)) return market as Market;
  }

  const parts = loc.split(',').map(p => p.trim());
  for (const part of parts.reverse()) {
    for (const [key, market] of LOCATION_ENTRIES) {
      if (part.toLowerCase().includes(key)) return market as Market;
    }
  }

  return null;
}

// ─── Sector detection ──────────────────────────────────────────────

function detectSector(title: string, tags: string[]): Sector {
  const text = `${title} ${tags.join(' ')}`.toLowerCase();

  if (/logist|warehouse|lager|driver|fahrer|transport|delivery|versand|shipping|postal/.test(text))
    return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|produktion|factory|fabrik|assembly|fertigung|machine operator/.test(text))
    return 'MANUFACTURING';
  if (/retail|verkauf|store|shop|kassier|cashier|filiall/.test(text))
    return 'RETAIL';
  if (/construct|bau|carpenter|plumber|electrician|elektrik|maler|painter/.test(text))
    return 'CONSTRUCTION';
  if (/food|beverage|cook|koch|kitchen|restaurant|gastro|baker/.test(text))
    return 'FOOD_BEVERAGE';
  if (/hotel|hospitality|housekeep|rezeption|front desk|concierge/.test(text))
    return 'HOSPITALITY';
  if (/clean|reinigung|facility|hausmeis|janitor|maintenance|instandhalt/.test(text))
    return 'FACILITY_MANAGEMENT';
  if (/secur|sicherheit|wach|guard|schutz/.test(text))
    return 'SECURITY';
  if (/health|pflege|nurse|kranken|hospital|clinic|klinik|altenpflege|care/.test(text))
    return 'HEALTHCARE';
  if (/auto|kfz|mechanic|werkstatt|vehicle|fahrzeug/.test(text))
    return 'AUTOMOTIVE';
  if (/agri|farm|landwirt|garden/.test(text))
    return 'AGRICULTURE';
  if (/metal|steel|stahl|weld|schlosser/.test(text))
    return 'METAL_STEEL';
  if (/chemi|pharma|labor/.test(text))
    return 'CHEMICALS';
  if (/textile|sewing|fashion|schneider/.test(text))
    return 'TEXTILE';
  if (/mining|bergbau|energy|energie|solar|wind/.test(text))
    return 'MINING_ENERGY';
  if (/ecommerce|e-commerce|versand|fulfilment|packing|verpack/.test(text))
    return 'ECOMMERCE_CARGO';
  if (/telecom|netzwerk|network|cable|kabel/.test(text))
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

// ─── Source cache (one per market) ─────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `arbeitnow-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'ArbeitNow' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'ArbeitNow', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'ArbeitNow',
          slug: `arbeitnow-${market.toLowerCase()}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.arbeitnow.com',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `ArbeitNow ${market} Job Listings`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: ['https://www.arbeitnow.com/api/job-board-api'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Main ──────────────────────────────────────────────────────────

interface ArbeitNowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalNotBlueCollar = 0;
  let totalErrors = 0;
  const marketCounts: Record<string, number> = {};

  console.log('🟠 Mavi Yaka — ArbeitNow Bulk Import');
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const url = `${API_BASE}?page=${page}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });

      if (!res.ok) {
        console.log(`  Page ${page}: HTTP ${res.status}`);
        if (res.status === 429) {
          console.log('  Rate limited, waiting 60s...');
          await delay(60000);
          continue;
        }
        break;
      }

      const json = await res.json() as {
        data: ArbeitNowJob[];
        links: { next: string | null };
      };

      const jobs = json.data;
      if (!jobs || jobs.length === 0) {
        console.log(`  Page ${page}: No more jobs. Done.`);
        break;
      }

      totalFetched += jobs.length;

      for (const job of jobs) {
        try {
          const market = detectMarket(job.location);
          if (!market) {
            totalSkipped++;
            continue;
          }

          const source = await getOrCreateSource(market);
          const sector = detectSector(job.title, job.tags || []);
          const fingerprint = md5(`${job.title}|${job.company_name}|${market}`);
          const titleSlug = slugify(`${job.title}-${job.company_name}-${job.slug}`);

          // Check fingerprint dupe
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

          const workMode = job.remote ? 'REMOTE' : 'ON_SITE';
          const jobType = (job.job_types || []).includes('Full Time')
            ? 'FULL_TIME'
            : (job.job_types || []).includes('Part Time')
              ? 'PART_TIME'
              : (job.job_types || []).includes('Contract')
                ? 'CONTRACT'
                : 'FULL_TIME';

          await prisma.jobListing.create({
            data: {
              title: job.title.substring(0, 500),
              slug: titleSlug,
              companyId: source.companyId,
              sourceId: source.id,
              sourceUrl: job.url,
              country: market,
              city: job.location?.split(',')[0]?.trim()?.substring(0, 100) || null,
              description,
              summary: description?.substring(0, 300) || null,
              sector,
              jobType,
              workMode,
              fingerprint,
              status: 'ACTIVE',
              lastSeenAt: new Date(),
              postedDate: job.created_at ? new Date(job.created_at * 1000) : new Date(),
            },
          });

          totalInserted++;
          marketCounts[market] = (marketCounts[market] || 0) + 1;
        } catch (err: any) {
          if (err.code === 'P2002') {
            totalSkipped++;
          } else {
            totalErrors++;
          }
        }
      }

      console.log(`  Page ${page}: ${jobs.length} fetched, running total: +${totalInserted} inserted`);

      if (!json.links?.next) {
        console.log('  No more pages.');
        break;
      }

      await delay(REQUEST_DELAY_MS);
    } catch (err: any) {
      console.log(`  Page ${page} error: ${err.message}`);
      totalErrors++;
      if (totalErrors > 5) break;
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
