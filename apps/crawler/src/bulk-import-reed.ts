/**
 * bulk-import-reed.ts — Bulk Import from Reed.co.uk API (UK jobs)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-reed.ts
 *
 * Reed API: https://www.reed.co.uk/developers/jobseeker
 * - Basic Auth: API key as username, empty password
 * - Search: GET /api/1.0/search?keywords=X&resultsToTake=100&resultsToSkip=0
 * - Details: GET /api/1.0/jobs/{jobId}
 * - Max 100 results per request
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const REED_API_KEY = process.env.REED_API_KEY || '';
const API_BASE = 'https://www.reed.co.uk/api/1.0';
const RESULTS_PER_PAGE = 100;
const MAX_RESULTS_PER_KEYWORD = 1000; // 10 pages × 100
const REQUEST_DELAY_MS = 300;
const REQUEST_TIMEOUT_MS = 20_000;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function parseReedDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Reed dates are dd/mm/yyyy
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(`${year}-${month}-${day}`);
  }
  return new Date(dateStr);
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

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/warehouse|logist|driver|courier|delivery|freight|forklift|truck|postal|packer|hgv|van driver|picker/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|operative|machine operator/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop assistant|supermarket/i.test(t)) return 'RETAIL';
  if (/construct|builder|mason|carpenter|plumber|roofer|bricklayer|labourer|scaffolder|groundworker/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|workshop|mot tester|tyre/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|garment/i.test(t)) return 'TEXTILE';
  if (/nurse|hospital|care.*assist|patient|health.*aide|carer|support worker/i.test(t)) return 'HEALTHCARE';
  if (/hotel|cleaning|housekeeper|cleaner|housekeep/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agricult|garden|landscape|tree surgeon/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|door supervisor/i.test(t)) return 'SECURITY_SERVICES';
  if (/janitor|facility|maintenance|building|caretaker/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/weld|metal|steel|iron|forge/i.test(t)) return 'METAL_STEEL';
  if (/chemical|plastic|paint|pharma/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/telecom|cable|fiber/i.test(t)) return 'TELECOMMUNICATIONS';
  if (/electrician|plumber|joiner|glazier|painter.*decorator|plasterer|tiler/i.test(t)) return 'CONSTRUCTION';
  return 'OTHER';
}

// ─── UK Blue-collar keywords (comprehensive) ────────────────────────

const KEYWORDS = [
  // Warehouse & Logistics
  'warehouse operative', 'warehouse worker', 'forklift driver', 'forklift operator',
  'hgv driver', 'hgv class 1', 'hgv class 2', 'van driver', 'delivery driver',
  'courier', 'picker packer', 'goods in', 'despatch', 'parcel sorter',
  'order picker', 'stock handler', 'reach truck', 'counterbalance',
  // Cleaning & Facility
  'cleaner', 'industrial cleaner', 'caretaker', 'groundskeeper',
  'maintenance engineer', 'handyman', 'window cleaner', 'pest control',
  'building maintenance', 'facilities assistant',
  // Food & Hospitality
  'kitchen porter', 'commis chef', 'chef de partie', 'sous chef', 'baker',
  'butcher', 'barista', 'waiting staff', 'bar staff', 'hotel housekeeper',
  'kitchen assistant', 'breakfast chef', 'room attendant', 'pot wash',
  // Construction & Trades
  'labourer', 'bricklayer', 'plumber', 'electrician', 'welder',
  'scaffolder', 'roofer', 'painter decorator', 'plasterer', 'tiler',
  'joiner', 'glazier', 'groundworker', 'steel fixer', 'demolition',
  'CSCS card', 'banksman', 'slinger', 'shuttering carpenter',
  'dry liner', 'ceiling fixer', 'asbestos removal', 'street works',
  // Manufacturing
  'factory worker', 'machine operator', 'production operative',
  'CNC operator', 'CNC machinist', 'packer', 'quality inspector',
  'assembly worker', 'press operator', 'laser operator',
  'paint sprayer', 'injection moulding', 'tool maker',
  // Auto & Mechanic
  'mechanic', 'MOT tester', 'tyre fitter', 'vehicle technician',
  'body shop', 'panel beater', 'car valet', 'HGV technician',
  // Healthcare & Care
  'care assistant', 'support worker', 'healthcare assistant', 'carer',
  'domiciliary care', 'night carer', 'live in carer',
  // Security & Other
  'security officer', 'door supervisor', 'CCTV operator',
  'farm worker', 'refuse collector', 'postman', 'landscape gardener',
  'tree surgeon', 'recycling operative', 'binman',
  'road sweeper', 'drain engineer', 'skip driver',
];

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'UK', name: { contains: 'Reed' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: { contains: 'Reed' }, market: 'UK' },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Reed.co.uk',
          slug: `reed-co-uk-${Date.now().toString(36)}`,
          market: 'UK',
          sector: 'OTHER',
          websiteUrl: 'https://www.reed.co.uk',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'Reed.co.uk Job Listings',
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market: 'UK',
        companyId: company.id,
        seedUrls: ['https://www.reed.co.uk'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── Reed API fetch ──────────────────────────────────────────────────

async function fetchReed(keyword: string, skip: number): Promise<any> {
  const params = new URLSearchParams({
    keywords: keyword,
    resultsToTake: String(RESULTS_PER_PAGE),
    resultsToSkip: String(skip),
  });

  const url = `${API_BASE}/search?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const authHeader = 'Basic ' + Buffer.from(`${REED_API_KEY}:`).toString('base64');
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Authorization': authHeader,
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Main ────────────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function main() {
  if (!REED_API_KEY) {
    console.error('❌ REED_API_KEY not set');
    console.error('   Set it: export REED_API_KEY=your_api_key_here');
    process.exit(1);
  }

  console.log(`\n🇬🇧 Mavi Yaka — Reed.co.uk Bulk Import`);
  console.log(`Keywords: ${KEYWORDS.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const keyword of KEYWORDS) {
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchReed(keyword, skip);

        // Reed returns { results: [...], totalResults: N }
        const jobs = data.results || [];
        const totalResults = data.totalResults || 0;
        stats.fetched += jobs.length;

        for (const job of jobs) {
          const jobId = String(job.jobId || '');
          if (!jobId) { stats.skipped++; continue; }
          if (seen.has(jobId)) { stats.skipped++; continue; }
          seen.add(jobId);

          const title = job.jobTitle || keyword;
          const jobUrl = job.jobUrl || `https://www.reed.co.uk/jobs/${jobId}`;
          const canonicalUrl = jobUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`reed:${jobId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const desc = job.jobDescription?.substring(0, 5000) || null;
          const employer = job.employerName || null;
          const location = job.locationName || null;

          // Blue-collar filter
          if (!isBlueCollar(title, desc)) {
            stats.skipped++;
            continue;
          }

          // Parse salary
          let salaryMin: number | null = null;
          let salaryMax: number | null = null;
          if (job.minimumSalary) salaryMin = Math.round(job.minimumSalary);
          if (job.maximumSalary) salaryMax = Math.round(job.maximumSalary);

          batch.push({
            title,
            slug,
            sourceUrl: jobUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: 'UK' as Market,
            city: location,
            sector: detectSector(title, desc),
            description: desc,
            salaryMin,
            salaryMax,
            salaryCurrency: job.currency || 'GBP',
            postedDate: job.date ? parseReedDate(job.date) : null,
            deadline: job.expirationDate ? parseReedDate(job.expirationDate) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        skip += RESULTS_PER_PAGE;
        hasMore = jobs.length === RESULTS_PER_PAGE && skip < MAX_RESULTS_PER_KEYWORD && skip < totalResults;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          console.warn(`  Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  "${keyword}" skip=${skip}: ${msg.substring(0, 80)}`);
          stats.errors++;
          hasMore = false;
        }
      }
    }

    if (seen.size % 500 === 0 && seen.size > 0) {
      console.log(`  Progress: ${seen.size.toLocaleString()} unique, ${stats.inserted.toLocaleString()} inserted`);
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  await prisma.$disconnect();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Unique: ${seen.size.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
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
