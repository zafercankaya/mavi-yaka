/**
 * bulk-import-workable.ts — Import jobs from Workable public ATS API
 *
 * Workable public postings API — no auth required.
 * Targets large blue-collar employers (DHL, FedEx, Marriott, McDonald's, etc.)
 *
 * API: https://apply.workable.com/api/v1/widget/accounts/{slug}
 * - Free, no API key
 * - Returns all jobs at once (no pagination needed)
 * - Response: { name, description, jobs: [{ id, title, shortcode, department, city, country_code, telecommuting, ... }] }
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
  // Logistics & Warehousing (verified slugs)
  { slug: 'voyago', company: 'Voyago (Transdev)', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'charger-logistics-inc', company: 'Charger Logistics', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'vero-hr-ltd', company: 'Vero HR', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'doman-building-materials', company: 'Doman Building Materials', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'logistics-uk', company: 'Logistics UK', sector: 'LOGISTICS_TRANSPORTATION' },

  // Construction & Trades
  { slug: 'enterprise-electrical', company: 'Enterprise Electrical', sector: 'CONSTRUCTION' },
  { slug: 'midlands-contracting', company: 'Midlands Contracting', sector: 'CONSTRUCTION' },
  { slug: 'hayward-lumber-1', company: 'Hayward Lumber', sector: 'CONSTRUCTION' },
  { slug: 'peach-2', company: 'P.E.A.C.H. Teams (Plumbing/HVAC)', sector: 'CONSTRUCTION' },

  // Manufacturing & Production
  { slug: 'almag-aluminum', company: 'Almag Aluminum', sector: 'MANUFACTURING' },
  { slug: 'ag-barr', company: 'AG Barr', sector: 'MANUFACTURING' },
  { slug: 'motor-coach-industries', company: 'Motor Coach Industries', sector: 'MANUFACTURING' },
  { slug: 'ourhomesnacks', company: 'Our Home Snacks', sector: 'MANUFACTURING' },

  // Cleaning & Facility Services
  { slug: 'citywide', company: 'City Wide Facility Solutions', sector: 'FACILITY_MANAGEMENT' },
  { slug: 'abm-careers', company: 'ABM UK', sector: 'FACILITY_MANAGEMENT' },
  { slug: 'slatecleaning', company: 'Slate Cleaning', sector: 'FACILITY_MANAGEMENT' },
  { slug: 'optimegroup', company: 'Optime Group', sector: 'FACILITY_MANAGEMENT' },

  // Hospitality & Food Service
  { slug: 'ayana', company: 'AYANA Hospitality', sector: 'HOSPITALITY' },
  { slug: 'banffcollective', company: 'Banff Hospitality Collective', sector: 'HOSPITALITY' },
  { slug: 'swot-hospitality-management-company', company: 'SWOT Hospitality', sector: 'HOSPITALITY' },
  { slug: 'riot-hospitality-group', company: 'Riot Hospitality Group', sector: 'HOSPITALITY' },
  { slug: 'lafrance-hospitality', company: 'Lafrance Hospitality', sector: 'HOSPITALITY' },
  { slug: 'five-star-correctional-services-inc', company: 'Five Star Food Services', sector: 'FOOD_BEVERAGE' },
  { slug: 'company-shop-group', company: 'Company Shop Group', sector: 'RETAIL' },

  // Staffing (blue-collar placements)
  { slug: 'quickhirestaffing', company: 'Quick Hire Staffing', sector: 'OTHER' },
  { slug: 'thisway', company: 'ThisWay Global', sector: 'OTHER' },
  { slug: 'royalty-hospitality-staffing-1', company: 'Royalty Hospitality Staffing', sector: 'HOSPITALITY' },
];

// ─── Market mapping (ISO 2-letter country code → Market enum) ───

const CODE_TO_MARKET: Record<string, Market> = {
  us: 'US', gb: 'UK', de: 'DE', fr: 'FR', es: 'ES', it: 'IT',
  nl: 'NL', pl: 'PL', se: 'SE', pt: 'PT', ca: 'CA', au: 'AU',
  in: 'IN', jp: 'JP', br: 'BR', mx: 'MX', tr: 'TR', ru: 'RU',
  id: 'ID', ph: 'PH', th: 'TH', kr: 'KR', eg: 'EG', sa: 'SA',
  ae: 'AE', ar: 'AR', co: 'CO', vn: 'VN', my: 'MY', pk: 'PK',
  za: 'ZA',
};

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'us', 'united kingdom': 'gb', 'germany': 'de', 'france': 'fr',
  'spain': 'es', 'italy': 'it', 'netherlands': 'nl', 'poland': 'pl',
  'sweden': 'se', 'portugal': 'pt', 'canada': 'ca', 'australia': 'au',
  'india': 'in', 'japan': 'jp', 'brazil': 'br', 'mexico': 'mx',
  'turkey': 'tr', 'turkiye': 'tr', 'russia': 'ru', 'indonesia': 'id',
  'philippines': 'ph', 'thailand': 'th', 'south korea': 'kr', 'korea': 'kr',
  'egypt': 'eg', 'saudi arabia': 'sa', 'united arab emirates': 'ae',
  'argentina': 'ar', 'colombia': 'co', 'vietnam': 'vn', 'malaysia': 'my',
  'pakistan': 'pk', 'south africa': 'za',
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
  id?: string;
  title: string;
  shortcode: string;
  department?: string;
  city?: string;
  state?: string;
  country?: string; // full name: "United States"
  telecommuting?: boolean;
  url?: string;
  created_at?: string;
  published_on?: string;
  employment_type?: string;
  locations?: Array<{ countryCode?: string; city?: string; region?: string }>;
}

interface WorkableWidgetResponse {
  name?: string;
  description?: string;
  jobs: WorkableJob[];
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
  if (job.telecommuting) return 'REMOTE';
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
        seedUrls: [`https://apply.workable.com/api/v1/widget/accounts/${slug}`],
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
  const url = `https://apply.workable.com/api/v1/widget/accounts/${slug}`;

  let res: Response;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  } catch (err: any) {
    console.log(`    fetch error: ${err.message?.substring(0, 80)}`);
    return null;
  }

  if (res.status === 404) return null;

  if (res.status === 429) {
    console.log(`    rate limited, waiting 5s...`);
    await delay(5000);
    // retry once
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    } catch { return null; }
  }

  if (!res.ok) {
    console.log(`    HTTP ${res.status} from ${slug}`);
    return null;
  }

  let data: WorkableWidgetResponse;
  try {
    data = (await res.json()) as WorkableWidgetResponse;
  } catch {
    console.log(`    invalid JSON from ${slug}`);
    return null;
  }

  if (!Array.isArray(data.jobs) || data.jobs.length === 0) return [];

  return data.jobs;
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
    // Resolve country: prefer locations[0].countryCode, fall back to country name
    let countryCode = job.locations?.[0]?.countryCode?.toLowerCase() || '';
    if (!countryCode && job.country) {
      countryCode = COUNTRY_NAME_TO_CODE[job.country.toLowerCase()] || '';
    }
    const market = CODE_TO_MARKET[countryCode];
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
    const city = job.city?.substring(0, 100) || null;
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
