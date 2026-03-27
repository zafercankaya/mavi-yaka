/**
 * bulk-import-bamboohr.ts — Import jobs from BambooHR public ATS API
 *
 * BambooHR public job board API — no auth required.
 * Targets blue-collar heavy employers (manufacturing, construction, logistics, food, etc.)
 *
 * API: https://{slug}.bamboohr.com/careers/list.json
 * - Free, no API key
 * - Single request (no pagination), returns all open roles
 * - Apply URL: https://{slug}.bamboohr.com/careers/{id}/detail
 *
 * Usage:
 *   npx ts-node --transpile-only src/bulk-import-bamboohr.ts
 *   npx ts-node --transpile-only src/bulk-import-bamboohr.ts --slug=caterpillar
 *   npx ts-node --transpile-only src/bulk-import-bamboohr.ts --dry-run
 *   npx ts-node --transpile-only src/bulk-import-bamboohr.ts --slug=ryder --dry-run
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
  // Construction (verified BambooHR slugs)
  { slug: 'theweitzcompany', company: 'The Weitz Company', sector: 'CONSTRUCTION' },
  { slug: 'rycon', company: 'Rycon Construction', sector: 'CONSTRUCTION' },
  { slug: 'storyconstruction', company: 'Story Construction', sector: 'CONSTRUCTION' },
  { slug: 'schellinger', company: 'Schellinger Construction', sector: 'CONSTRUCTION' },
  { slug: 'thewitmergroup', company: 'The Witmer Group', sector: 'CONSTRUCTION' },
  { slug: 'watertownenterprises', company: 'Watertown Enterprises', sector: 'CONSTRUCTION' },
  { slug: 'm3inc', company: 'M3 Inc. (Masonry)', sector: 'CONSTRUCTION' },
  { slug: 'division15mechanical', company: 'Division 15 Mechanical', sector: 'CONSTRUCTION' },

  // Steel & Fabrication
  { slug: 'unitedsteel', company: 'United Steel Inc.', sector: 'METAL_STEEL' },
  { slug: 'jgmusa', company: 'JGM Steel Fabrication', sector: 'METAL_STEEL' },

  // HVAC & Plumbing
  { slug: 'applewoodfixit', company: 'Applewood Plumbing Heating & Electric', sector: 'CONSTRUCTION' },
  { slug: 'storerservices', company: 'Storer Services (HVAC)', sector: 'CONSTRUCTION' },
  { slug: 'energy1', company: 'Energy 1 HVAC', sector: 'CONSTRUCTION' },
  { slug: 'homesmartservices', company: 'HomeSmart Services', sector: 'FACILITY_MANAGEMENT' },

  // Trucking & Transportation
  { slug: 'wilbankstrucking', company: 'Wilbanks Trucking Services', sector: 'LOGISTICS_TRANSPORTATION' },
  { slug: 'logmet', company: 'LOGMET Transport', sector: 'LOGISTICS_TRANSPORTATION' },

  // Warehouse & Distribution
  { slug: 'generalpacific', company: 'General Pacific Inc.', sector: 'LOGISTICS_TRANSPORTATION' },

  // Restoration & Roofing
  { slug: 'crbr', company: 'CRBR Restoration', sector: 'CONSTRUCTION' },
  { slug: 'roofcommander', company: 'Roof Commander', sector: 'CONSTRUCTION' },
  { slug: 'broit', company: 'Broit Lifting', sector: 'CONSTRUCTION' },

  // Automotive
  { slug: 'thedetroitgarage', company: 'The Detroit Garage', sector: 'AUTOMOTIVE' },
  { slug: 'velocityrestorations', company: 'Velocity Restorations', sector: 'AUTOMOTIVE' },
  { slug: 'winrockautomotivegroup', company: 'WinRock Automotive Group', sector: 'AUTOMOTIVE' },
  { slug: 'orag', company: 'OpenRoad Auto Group', sector: 'AUTOMOTIVE' },

  // Landscaping & Agriculture
  { slug: 'crosscreeknursery', company: 'Cross Creek Nursery', sector: 'AGRICULTURE' },
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

// ─── BambooHR API types ──────────────────────────────────────────

interface BambooHRJob {
  id: string | number;
  jobOpeningName: string;
  departmentLabel?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  employmentStatusLabel?: string; // e.g. "Full-Time", "Part-Time", "Contract"
}

interface BambooHRResponse {
  result: BambooHRJob[];
}

// ─── Job type / work mode helpers ───────────────────────────────

function detectJobType(employmentStatusLabel?: string): string {
  if (!employmentStatusLabel) return 'FULL_TIME';
  const t = employmentStatusLabel.toLowerCase();
  if (t.includes('part')) return 'PART_TIME';
  if (t.includes('contract') || t.includes('temp')) return 'CONTRACT';
  if (t.includes('intern')) return 'INTERNSHIP';
  return 'FULL_TIME';
}

function detectWorkMode(job: BambooHRJob): string {
  const combined = [
    job.jobOpeningName,
    job.location?.city,
    job.departmentLabel,
  ].join(' ').toLowerCase();
  if (/remote|work.?from.?home|wfh/.test(combined)) return 'REMOTE';
  return 'ON_SITE';
}

// ─── Country name → ISO 2-letter code mapping ───────────────────
// BambooHR returns country as a full name (e.g. "United States", "Canada")

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'united states': 'us',
  'usa': 'us',
  'us': 'us',
  'united kingdom': 'gb',
  'uk': 'gb',
  'england': 'gb',
  'germany': 'de',
  'france': 'fr',
  'spain': 'es',
  'italy': 'it',
  'netherlands': 'nl',
  'poland': 'pl',
  'sweden': 'se',
  'portugal': 'pt',
  'canada': 'ca',
  'australia': 'au',
  'india': 'in',
  'japan': 'jp',
  'brazil': 'br',
  'mexico': 'mx',
  'turkey': 'tr',
  'russia': 'ru',
  'indonesia': 'id',
  'philippines': 'ph',
  'thailand': 'th',
  'south korea': 'kr',
  'korea': 'kr',
  'egypt': 'eg',
  'saudi arabia': 'sa',
  'united arab emirates': 'ae',
  'uae': 'ae',
  'argentina': 'ar',
  'colombia': 'co',
  'vietnam': 'vn',
  'malaysia': 'my',
  'pakistan': 'pk',
  'south africa': 'za',
};

function resolveCountryCode(country?: string): string | null {
  if (!country) return null;
  const normalized = country.trim().toLowerCase();
  // Direct ISO 2-letter match
  if (COUNTRY_TO_MARKET[normalized]) return normalized;
  // Full name lookup
  return COUNTRY_NAME_TO_CODE[normalized] || null;
}

// ─── Source cache ────────────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(
  companyName: string,
  market: Market,
  slug: string,
): Promise<{ id: string; companyId: string }> {
  const key = `bamboohr-${slug}-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  const sourceName = `${companyName} (BambooHR)`;

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
          websiteUrl: `https://${slug}.bamboohr.com/careers/`,
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
        seedUrls: [`https://${slug}.bamboohr.com/careers/list.json`],
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

async function fetchCompanyJobs(slug: string): Promise<BambooHRJob[] | null> {
  const url = `https://${slug}.bamboohr.com/careers/list.json`;

  const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Referer': `https://${slug}.bamboohr.com/careers`,
  };

  let res: Response;
  try {
    res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
  } catch (err: any) {
    console.log(`    fetch error: ${err.message?.substring(0, 80)}`);
    return null;
  }

  // 404 = slug not on BambooHR or company page disabled
  if (res.status === 404) {
    return null;
  }

  // 403 = blocked, try alternate endpoint
  if (res.status === 403) {
    // Try the newer /careers/list endpoint
    try {
      const altUrl = `https://${slug}.bamboohr.com/careers/list`;
      res = await fetch(altUrl, { headers: { ...headers, 'Accept': 'application/json' }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) return null;
    } catch {
      return null;
    }
  }

  // 429 = rate limited
  if (res.status === 429) {
    console.log(`    rate limited, waiting 5s...`);
    await delay(5000);
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
    } catch {
      return null;
    }
    if (!res.ok) return null;
  }

  if (!res.ok) {
    console.log(`    HTTP ${res.status} from ${slug}`);
    return null;
  }

  let data: BambooHRResponse;
  try {
    data = (await res.json()) as BambooHRResponse;
  } catch {
    console.log(`    invalid JSON from ${slug}`);
    return null;
  }

  if (!Array.isArray(data.result)) {
    console.log(`    unexpected response shape from ${slug}`);
    return null;
  }

  return data.result;
}

// ─── Process a single job listing ───────────────────────────────

async function processJob(
  job: BambooHRJob,
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
    const countryCode = resolveCountryCode(job.location?.country);
    // Default to US when country is missing — BambooHR is primarily US-based
    const market = countryCode ? COUNTRY_TO_MARKET[countryCode] : 'US';
    if (!market) return;

    const dept = job.departmentLabel || null;

    // Blue-collar filter — reject white-collar jobs
    if (!isBlueCollar(job.jobOpeningName, dept)) {
      stats.notBlueCollar++;
      return;
    }

    const jobId = String(job.id);
    const externalId = `bamboohr-${config.slug}-${jobId}`;
    const fingerprint = md5(externalId);
    const applyUrl = `https://${config.slug}.bamboohr.com/careers/${jobId}/detail`;
    const sector = detectSector(job.jobOpeningName, dept, config.sector);
    const jobType = detectJobType(job.employmentStatusLabel);
    const workMode = detectWorkMode(job);
    const city = job.location?.city?.substring(0, 100) || null;
    const titleSlug = slugify(`${job.jobOpeningName}-${config.company}-${jobId}`);

    if (dryRun) {
      console.log(
        `    [DRY-RUN] ${market} | ${job.jobOpeningName.substring(0, 60)} | ${city || 'N/A'} | ${sector}`,
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
        title: job.jobOpeningName.substring(0, 500),
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
        postedDate: new Date(),
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
        console.log(`    job error (${job.id}): ${err.message?.substring(0, 100)}`);
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

  console.log('=== Mavi Yaka — BambooHR Bulk Import ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN' : 'LIVE'}`);
  console.log(`Companies: ${companies.length}${SINGLE_SLUG ? ` (slug: ${SINGLE_SLUG})` : ''}`);
  console.log(`Rate limit: ${REQUEST_DELAY_MS}ms between companies`);
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
