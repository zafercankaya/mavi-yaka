/**
 * bulk-import-workable.ts — Import jobs from Workable public ATS API
 *
 * Workable public postings API — no auth required.
 * Targets large blue-collar employers (DHL, FedEx, Marriott, McDonald's, etc.)
 *
 * API: https://apply.workable.com/api/v3/accounts/{slug}/jobs
 * - Free, no API key
 * - Max 100 per page, offset-based pagination
 * - Job detail: https://apply.workable.com/api/v3/accounts/{slug}/jobs/{shortcode}
 * - Apply URL: https://apply.workable.com/{slug}/j/{shortcode}/
 *
 * Usage:
 *   npx ts-node --transpile-only src/bulk-import-workable.ts
 *   npx ts-node --transpile-only src/bulk-import-workable.ts --slug=dhl
 *   npx ts-node --transpile-only src/bulk-import-workable.ts --dry-run
 *   npx ts-node --transpile-only src/bulk-import-workable.ts --slug=marriott --dry-run
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();
const REQUEST_DELAY_MS = 500;
const PAGE_SIZE = 100;

// ─── CLI args ────────────────────────────────────────────────────

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const SINGLE_SLUG = args.find(a => a.startsWith('--slug='))?.replace('--slug=', '') || null;

// ─── Company configs ─────────────────────────────────────────────

interface CompanyConfig {
  slug: string;
  company: string;
  sector: Sector;
}

const COMPANIES: CompanyConfig[] = [
  // Logistics & Delivery
  { slug: 'dhl', company: 'DHL', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'fedex', company: 'FedEx', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'ups-2', company: 'UPS', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'xpo-logistics', company: 'XPO Logistics', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'ceva-logistics', company: 'CEVA Logistics', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'kuehne-nagel', company: 'Kuehne+Nagel', sector: 'LOGISTICS_TRANSPORTATION' },

  // Retail & E-commerce
  { slug: 'amazon', company: 'Amazon', sector: 'ECOMMERCE_CARGO' },
  { slug: 'walmart', company: 'Walmart', sector: 'RETAIL' },
  { slug: 'target', company: 'Target', sector: 'RETAIL' },
  { slug: 'costco', company: 'Costco', sector: 'RETAIL' },
  { slug: 'kroger', company: 'Kroger', sector: 'RETAIL' },
  { slug: 'ikea', company: 'IKEA', sector: 'RETAIL' },
  { slug: 'aldi', company: 'ALDI', sector: 'RETAIL' },
  { slug: 'lidl', company: 'Lidl', sector: 'RETAIL' },
  { slug: 'carrefour', company: 'Carrefour', sector: 'RETAIL' },

  // Hospitality
  { slug: 'marriott', company: 'Marriott International', sector: 'HOSPITALITY' },
  { slug: 'hilton', company: 'Hilton', sector: 'HOSPITALITY' },
  { slug: 'ihg', company: 'IHG Hotels & Resorts', sector: 'HOSPITALITY' },
  { slug: 'accor', company: 'Accor', sector: 'HOSPITALITY' },
  { slug: 'hyatt', company: 'Hyatt', sector: 'HOSPITALITY' },

  // Food & Quick Service
  { slug: 'mcdonalds', company: "McDonald's", sector: 'FOOD_BEVERAGE' },
  { slug: 'starbucks', company: 'Starbucks', sector: 'FOOD_BEVERAGE' },
  { slug: 'subway-1', company: 'Subway', sector: 'FOOD_BEVERAGE' },
  { slug: 'dominos', company: "Domino's Pizza", sector: 'FOOD_BEVERAGE' },

  // Construction & Engineering
  { slug: 'skanska', company: 'Skanska', sector: 'CONSTRUCTION' },
  { slug: 'aecom', company: 'AECOM', sector: 'CONSTRUCTION' },
  { slug: 'fluor', company: 'Fluor Corporation', sector: 'CONSTRUCTION' },
  { slug: 'bechtel', company: 'Bechtel', sector: 'CONSTRUCTION' },

  // Facility Management & Cleaning
  { slug: 'iss-facility', company: 'ISS Facility Services', sector: 'FACILITY_MANAGEMENT' },
  { slug: 'sodexo', company: 'Sodexo', sector: 'FACILITY_MANAGEMENT' },
  { slug: 'aramark', company: 'Aramark', sector: 'FACILITY_MANAGEMENT' },

  // Automotive & Manufacturing
  { slug: 'toyota', company: 'Toyota', sector: 'AUTOMOTIVE' },
  { slug: 'ford', company: 'Ford Motor Company', sector: 'AUTOMOTIVE' },
  { slug: 'bmw-group', company: 'BMW Group', sector: 'AUTOMOTIVE' },
  { slug: 'volkswagen-group', company: 'Volkswagen Group', sector: 'AUTOMOTIVE' },

  // Security
  { slug: 'securitas', company: 'Securitas', sector: 'SECURITY' },
  { slug: 'g4s', company: 'G4S', sector: 'SECURITY' },

  // Healthcare Support
  { slug: 'fresenius', company: 'Fresenius', sector: 'HEALTHCARE' },
];

// ─── Market mapping (ISO 2-letter country code → Market enum) ───

const COUNTRY_TO_MARKET: Record<string, Market> = {
  us: 'US', gb: 'UK', de: 'DE', fr: 'FR', es: 'ES', it: 'IT',
  nl: 'NL', pl: 'PL', se: 'SE', pt: 'PT', ca: 'CA', au: 'AU',
  in: 'IN', jp: 'JP', br: 'BR', mx: 'MX', tr: 'TR', ru: 'RU',
  id: 'ID', ph: 'PH', th: 'TH', kr: 'KR', eg: 'EG', sa: 'SA',
  ae: 'AE', ar: 'AR', co: 'CO', vn: 'VN', my: 'MY', pk: 'PK',
  za: 'ZA',
};

// ─── Sector detection ────────────────────────────────────────────

function detectSector(title: string, department: string | null, defaultSector: Sector): Sector {
  const t = (title + ' ' + (department || '')).toLowerCase();

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

// ─── Helpers ─────────────────────────────────────────────────────

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

// ─── Workable API types ──────────────────────────────────────────

interface WorkableJob {
  id: string;
  title: string;
  shortcode: string;
  department?: string;
  location: {
    city?: string;
    country_code?: string;
    telecommuting?: boolean;
  };
  url?: string;
  created_at?: string;
  employment_type?: string; // 'full-time' | 'part-time' | 'contract' | 'temporary' | 'internship'
}

interface WorkableResponse {
  results: WorkableJob[];
  paging?: {
    next?: string;
  };
}

// ─── Job type / work mode helpers ───────────────────────────────

function detectJobType(employmentType?: string): string {
  if (!employmentType) return 'FULL_TIME';
  const t = employmentType.toLowerCase();
  if (t.includes('part')) return 'PART_TIME';
  if (t.includes('contract')) return 'CONTRACT';
  if (t.includes('temp')) return 'CONTRACT';
  if (t.includes('intern')) return 'INTERNSHIP';
  return 'FULL_TIME';
}

function detectWorkMode(job: WorkableJob): string {
  if (job.location?.telecommuting) return 'REMOTE';
  return 'ON_SITE';
}

// ─── Source cache ────────────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(
  companyName: string,
  market: Market,
  slug: string,
): Promise<{ id: string; companyId: string }> {
  const key = `workable-${slug}-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  const sourceName = `${companyName} (Workable)`;

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
          websiteUrl: `https://apply.workable.com/${slug}/`,
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
        seedUrls: [`https://apply.workable.com/api/v3/accounts/${slug}/jobs`],
        isActive: true,
        agingDays: 30,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Fetch all jobs for a company slug ──────────────────────────

async function fetchCompanyJobs(slug: string): Promise<WorkableJob[] | null> {
  const allJobs: WorkableJob[] = [];
  let offset = 0;

  while (true) {
    const url = `https://apply.workable.com/api/v3/accounts/${slug}/jobs?limit=${PAGE_SIZE}&offset=${offset}`;

    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    } catch (err: any) {
      console.log(`    fetch error: ${err.message?.substring(0, 80)}`);
      return null;
    }

    // 404 = company not on Workable
    if (res.status === 404) {
      return null;
    }

    // 429 = rate limited
    if (res.status === 429) {
      console.log(`    rate limited, waiting 5s...`);
      await delay(5000);
      continue;
    }

    if (!res.ok) {
      console.log(`    HTTP ${res.status} from ${slug}`);
      return null;
    }

    let data: WorkableResponse;
    try {
      data = (await res.json()) as WorkableResponse;
    } catch {
      console.log(`    invalid JSON from ${slug}`);
      return null;
    }

    if (!Array.isArray(data.results) || data.results.length === 0) break;

    allJobs.push(...data.results);

    // No more pages if we got fewer results than PAGE_SIZE
    if (data.results.length < PAGE_SIZE) break;

    offset += PAGE_SIZE;
    await delay(REQUEST_DELAY_MS);
  }

  return allJobs;
}

// ─── Process a single job listing ───────────────────────────────

async function processJob(
  job: WorkableJob,
  config: CompanyConfig,
  stats: {
    inserted: number;
    skipped: number;
    notBlueCollar: number;
    errors: number;
    marketCounts: Record<string, number>;
  },
  dryRun: boolean,
): Promise<void> {
  try {
    const countryCode = job.location?.country_code?.toLowerCase() || '';
    const market = COUNTRY_TO_MARKET[countryCode];
    if (!market) return;

    const dept = job.department || null;

    // Blue-collar filter — reject white-collar jobs
    if (!isBlueCollar(job.title, dept)) {
      stats.notBlueCollar++;
      return;
    }

    const externalId = `workable-${config.slug}-${job.shortcode}`;
    const fingerprint = md5(externalId);
    const applyUrl = `https://apply.workable.com/${config.slug}/j/${job.shortcode}/`;
    const sector = detectSector(job.title, dept, config.sector);
    const jobType = detectJobType(job.employment_type);
    const workMode = detectWorkMode(job);
    const city = job.location?.city?.substring(0, 100) || null;
    const titleSlug = slugify(`${job.title}-${config.company}-${job.shortcode}`);

    if (dryRun) {
      console.log(
        `    [DRY-RUN] ${market} | ${job.title.substring(0, 60)} | ${city || 'N/A'} | ${sector}`,
      );
      stats.inserted++;
      stats.marketCounts[market] = (stats.marketCounts[market] || 0) + 1;
      return;
    }

    const source = await getOrCreateSource(config.company, market, config.slug);

    await prisma.jobListing.upsert({
      where: { externalId },
      update: {
        lastSeenAt: new Date(),
        status: 'ACTIVE',
      },
      create: {
        externalId,
        title: job.title.substring(0, 500),
        slug: titleSlug,
        companyId: source.companyId,
        sourceId: source.id,
        sourceUrl: applyUrl,
        country: market,
        city,
        description: dept ? `Department: ${dept}` : null,
        sector,
        jobType: jobType as any,
        workMode: workMode as any,
        fingerprint,
        status: 'ACTIVE',
        lastSeenAt: new Date(),
        postedDate: job.created_at ? new Date(job.created_at) : new Date(),
      },
    });

    stats.inserted++;
    stats.marketCounts[market] = (stats.marketCounts[market] || 0) + 1;
  } catch (err: any) {
    if (err.code === 'P2002') {
      stats.skipped++;
    } else {
      stats.errors++;
      if (process.env.DEBUG) {
        console.log(`    job error (${job.shortcode}): ${err.message?.substring(0, 100)}`);
      }
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  const stats = {
    totalFetched: 0,
    inserted: 0,
    skipped: 0,
    notBlueCollar: 0,
    errors: 0,
    companiesNotFound: 0,
    marketCounts: {} as Record<string, number>,
  };

  const companies = SINGLE_SLUG
    ? COMPANIES.filter(c => c.slug === SINGLE_SLUG)
    : COMPANIES;

  if (SINGLE_SLUG && companies.length === 0) {
    // Allow importing any slug not in COMPANIES list
    companies.push({ slug: SINGLE_SLUG, company: SINGLE_SLUG, sector: 'OTHER' });
  }

  console.log('=== Mavi Yaka — Workable Bulk Import ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN' : 'LIVE'}`);
  console.log(`Companies: ${companies.length}${SINGLE_SLUG ? ` (slug: ${SINGLE_SLUG})` : ''}`);
  console.log(`Rate limit: ${REQUEST_DELAY_MS}ms between pages`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (const config of companies) {
    try {
      process.stdout.write(`  ${config.company} (${config.slug})... `);
      const jobs = await fetchCompanyJobs(config.slug);

      if (jobs === null) {
        console.log('NOT FOUND (404 or error, skipping)');
        stats.companiesNotFound++;
        await delay(REQUEST_DELAY_MS);
        continue;
      }

      if (jobs.length === 0) {
        console.log('0 jobs');
        await delay(REQUEST_DELAY_MS);
        continue;
      }

      console.log(`${jobs.length} jobs found`);
      stats.totalFetched += jobs.length;

      const beforeInserted = stats.inserted;
      const beforeNotBC = stats.notBlueCollar;

      for (const job of jobs) {
        await processJob(job, config, stats, DRY_RUN);
      }

      const newInserted = stats.inserted - beforeInserted;
      const newNotBC = stats.notBlueCollar - beforeNotBC;
      console.log(
        `    +${newInserted} inserted, ${newNotBC} non-blue-collar filtered, ${jobs.length - newInserted - newNotBC} skipped/errors`,
      );

      await delay(REQUEST_DELAY_MS);
    } catch (err: any) {
      console.log(`  ${config.company}: FATAL ERROR ${err.message?.substring(0, 100)}`);
      stats.errors++;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  console.log('\n=== FINAL STATS ===');
  console.log(`  Companies processed : ${companies.length}`);
  console.log(`  Companies not found : ${stats.companiesNotFound}`);
  console.log(`  Total fetched       : ${stats.totalFetched}`);
  console.log(`  Inserted / upserted : ${stats.inserted}${DRY_RUN ? ' (dry-run, not committed)' : ''}`);
  console.log(`  Skipped (duplicate) : ${stats.skipped}`);
  console.log(`  Non-blue-collar     : ${stats.notBlueCollar}`);
  console.log(`  Errors              : ${stats.errors}`);
  console.log(`  Duration            : ${elapsed}s`);

  if (Object.keys(stats.marketCounts).length > 0) {
    console.log('\n  Per market:');
    for (const [m, c] of Object.entries(stats.marketCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${m}: +${c}`);
    }
  }

  console.log(`\n  Finished: ${new Date().toISOString()}`);

  if (!DRY_RUN) {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
