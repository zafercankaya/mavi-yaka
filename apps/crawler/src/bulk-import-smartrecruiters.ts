/**
 * bulk-import-smartrecruiters.ts — Import jobs from SmartRecruiters public API
 *
 * SmartRecruiters public postings API — no auth required.
 * Targets large blue-collar employers (Bosch, Securitas, H&M, Continental, etc.)
 *
 * API: https://api.smartrecruiters.com/v1/companies/{id}/postings
 * - Free, no API key
 * - Max 100 per page, offset-based pagination
 * - Country filter: ?country=us (ISO 2-letter lowercase)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-smartrecruiters.ts
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();
const REQUEST_DELAY_MS = 1500;
const PAGE_SIZE = 100;

// ─── Company configs ────────────────────────────────────────────

interface CompanyConfig {
  identifier: string;
  company: string;
  sector: Sector;
}

const COMPANIES: CompanyConfig[] = [
  // Manufacturing / Automotive
  { identifier: 'BoschGroup', company: 'Bosch', sector: 'MANUFACTURING' },
  { identifier: 'Continental', company: 'Continental', sector: 'AUTOMOTIVE' },

  // Security
  { identifier: 'Securitas', company: 'Securitas', sector: 'SECURITY' },

  // Retail / Fashion
  { identifier: 'HMGroup', company: 'H&M', sector: 'RETAIL' },
  { identifier: 'Primark', company: 'Primark', sector: 'RETAIL' },
  { identifier: 'ASOS', company: 'ASOS', sector: 'RETAIL' },

  // Hospitality / Food
  { identifier: 'Accor', company: 'Accor Hotels', sector: 'HOSPITALITY' },
  { identifier: 'Sodexo', company: 'Sodexo', sector: 'FOOD_BEVERAGE' },
  { identifier: 'DeliveryHero', company: 'Delivery Hero', sector: 'ECOMMERCE_CARGO' },

  // Finance / Tech
  { identifier: 'Visa', company: 'Visa', sector: 'OTHER' },
  { identifier: 'Wise', company: 'Wise', sector: 'OTHER' },
  { identifier: 'Grab', company: 'Grab', sector: 'LOGISTICS_TRANSPORTATION' },

  // Construction / Materials
  { identifier: 'SaintGobain', company: 'Saint-Gobain', sector: 'CONSTRUCTION' },
];

// ─── Market mapping (ISO 2-letter country code → Market enum) ──

const COUNTRY_TO_MARKET: Record<string, Market> = {
  us: 'US', gb: 'UK', de: 'DE', fr: 'FR', es: 'ES', it: 'IT',
  nl: 'NL', pl: 'PL', se: 'SE', pt: 'PT', ca: 'CA', au: 'AU',
  in: 'IN', jp: 'JP', br: 'BR', mx: 'MX', tr: 'TR', ru: 'RU',
  id: 'ID', ph: 'PH', th: 'TH', kr: 'KR', eg: 'EG', sa: 'SA',
  ae: 'AE', ar: 'AR', co: 'CO', vn: 'VN', my: 'MY', pk: 'PK',
  za: 'ZA',
};

// Our 31 target market ISO codes (lowercase)
const TARGET_COUNTRIES = Object.keys(COUNTRY_TO_MARKET);

// ─── Sector detection ───────────────────────────────────────────

function detectSector(title: string, defaultSector: Sector): Sector {
  const t = title.toLowerCase();

  if (/logist|warehouse|driver|transport|delivery|shipping|freight|fulfil/.test(t))
    return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|machine.?operator/.test(t))
    return 'MANUFACTURING';
  if (/retail|store|shop|cashier|merchandis/.test(t))
    return 'RETAIL';
  if (/construct|carpenter|plumber|electrician|painter|hvac/.test(t))
    return 'CONSTRUCTION';
  if (/food|beverage|cook|kitchen|restaurant|baker|barista|chef/.test(t))
    return 'FOOD_BEVERAGE';
  if (/hotel|hospitality|housekeep|front.?desk|concierge/.test(t))
    return 'HOSPITALITY';
  if (/clean|facility|janitor|maintenance|custodian/.test(t))
    return 'FACILITY_MANAGEMENT';
  if (/secur|guard|safety.?officer/.test(t))
    return 'SECURITY';
  if (/health|nurse|hospital|clinic|care.?giver|medical/.test(t))
    return 'HEALTHCARE';
  if (/auto|mechanic|vehicle|technician/.test(t))
    return 'AUTOMOTIVE';
  if (/agri|farm|garden/.test(t))
    return 'AGRICULTURE';
  if (/metal|steel|weld/.test(t))
    return 'METAL_STEEL';
  if (/chemi|pharma|lab/.test(t))
    return 'CHEMICALS';
  if (/textile|sewing|fashion/.test(t))
    return 'TEXTILE';
  if (/mining|energy|solar|wind|oil|gas/.test(t))
    return 'MINING_ENERGY';
  if (/ecommerce|e-commerce|packing/.test(t))
    return 'ECOMMERCE_CARGO';
  if (/telecom|network|cable/.test(t))
    return 'TELECOM';

  return defaultSector;
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

// ─── Source cache ────────────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(
  companyName: string,
  market: Market,
  identifier: string,
): Promise<{ id: string; companyId: string }> {
  const key = `sr-${identifier}-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  const sourceName = `${companyName} (SmartRecruiters)`;

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
          websiteUrl: `https://careers.smartrecruiters.com/${identifier}`,
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
        seedUrls: [`https://api.smartrecruiters.com/v1/companies/${identifier}/postings`],
        isActive: true,
        agingDays: 30,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── SmartRecruiters API types ──────────────────────────────────

interface SRPosting {
  id: string;
  name: string;
  uuid: string;
  refNumber?: string;
  releasedDate: string;
  company: { identifier: string; name: string };
  location: {
    city?: string;
    region?: string;
    country?: string;
    remote?: boolean;
  };
  department?: { label: string };
  typeOfEmployment?: { id: string };
  experienceLevel?: { id: string };
}

interface SRResponse {
  totalFound: number;
  offset: number;
  limit: number;
  content: SRPosting[];
}

// ─── Fetch all postings for a company in our target markets ─────

async function fetchCompanyPostings(identifier: string): Promise<SRPosting[]> {
  const allPostings: SRPosting[] = [];

  for (const country of TARGET_COUNTRIES) {
    let offset = 0;
    let totalFound = 0;

    do {
      const url = `https://api.smartrecruiters.com/v1/companies/${identifier}/postings?country=${country}&limit=${PAGE_SIZE}&offset=${offset}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(60000) });

      if (!res.ok) {
        break;
      }

      const data = (await res.json()) as SRResponse;
      totalFound = data.totalFound;

      if (data.content.length === 0) break;
      allPostings.push(...data.content);

      offset += PAGE_SIZE;
      await delay(REQUEST_DELAY_MS);
    } while (offset < totalFound);
  }

  return allPostings;
}

// ─── Work mode detection ────────────────────────────────────────

function detectWorkMode(posting: SRPosting): string {
  if (posting.location?.remote) return 'REMOTE';
  return 'ON_SITE';
}

function detectJobType(employment?: { id: string }): string {
  if (!employment) return 'FULL_TIME';
  const id = employment.id.toLowerCase();
  if (id.includes('part')) return 'PART_TIME';
  if (id.includes('contract') || id.includes('temporary')) return 'CONTRACT';
  if (id.includes('intern')) return 'INTERNSHIP';
  return 'FULL_TIME';
}

// ─── Main ───────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalNotBlueCollar = 0;
  let totalErrors = 0;
  const marketCounts: Record<string, number> = {};

  console.log('🏢 Mavi Yaka — SmartRecruiters Bulk Import');
  console.log(`Companies: ${COMPANIES.length}`);
  console.log(`Target countries: ${TARGET_COUNTRIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (const config of COMPANIES) {
    try {
      const postings = await fetchCompanyPostings(config.identifier);
      totalFetched += postings.length;

      if (postings.length === 0) {
        console.log(`  ${config.company}: 0 jobs in target markets`);
        continue;
      }

      let companyInserted = 0;

      for (const posting of postings) {
        try {
          const countryCode = posting.location?.country?.toLowerCase() || '';
          const market = COUNTRY_TO_MARKET[countryCode];
          if (!market) continue;

          const source = await getOrCreateSource(config.company, market, config.identifier);
          const sector = detectSector(posting.name, config.sector);
          const fingerprint = md5(`smartrecruiters|${config.identifier}|${posting.id}`);

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

          const titleSlug = slugify(`${posting.name}-${config.company}-${posting.id}`);
          const city = posting.location?.city || null;
          const dept = posting.department?.label || '';

          // Blue-collar filter — reject white-collar jobs
          if (!isBlueCollar(posting.name, dept || null)) {
            totalNotBlueCollar++;
            continue;
          }

          await prisma.jobListing.create({
            data: {
              title: posting.name.substring(0, 500),
              slug: titleSlug,
              companyId: source.companyId,
              sourceId: source.id,
              sourceUrl: `https://jobs.smartrecruiters.com/${config.identifier}/${posting.id}`,
              country: market,
              city: city?.substring(0, 100) || null,
              description: dept ? `Department: ${dept}` : null,
              sector,
              jobType: detectJobType(posting.typeOfEmployment) as any,
              workMode: detectWorkMode(posting) as any,
              fingerprint,
              status: 'ACTIVE',
              lastSeenAt: new Date(),
              postedDate: posting.releasedDate ? new Date(posting.releasedDate) : new Date(),
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

      console.log(`  ${config.company}: ${postings.length} fetched, +${companyInserted} new`);
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
