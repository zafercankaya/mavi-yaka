/**
 * bulk-import-vietnamworks.ts — Import blue-collar jobs from VietnamWorks API
 *
 * VietnamWorks is the largest job board in Vietnam.
 * API: POST https://ms.vietnamworks.com/job-search/v1.0/search
 * - No authentication required
 * - Rich data: location (city, lat/lon), salary, job type, skills, benefits
 * - Pagination: pageNumber + pageSize (max 200)
 *
 * Usage:
 *   npx ts-node --transpile-only src/bulk-import-vietnamworks.ts
 *   npx ts-node --transpile-only src/bulk-import-vietnamworks.ts --dry-run
 */

import { PrismaClient, Market, Sector, JobType, WorkMode } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';
import { flushBatchUpsert, resetTitleCounts } from './utils/flush-batch-upsert';

const prisma = new PrismaClient();

const API_URL = 'https://ms.vietnamworks.com/job-search/v1.0/search';
const PAGE_SIZE = 100; // VietnamWorks caps at 100
const MAX_PAGES_PER_KEYWORD = 30; // 30 × 100 = 3,000 per keyword
const REQUEST_DELAY_MS = 1200;
const BATCH_SIZE = 100;

const DRY_RUN = process.argv.includes('--dry-run');

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// ─── Vietnamese blue-collar search keywords ─────────────────────────
// Mix of Vietnamese terms and English terms commonly used in VN job market

const KEYWORDS: string[] = [
  // Vietnamese blue-collar terms
  'công nhân',           // worker
  'lao động phổ thông',  // general labor
  'thợ',                 // craftsman/tradesperson
  'bảo vệ',             // security guard
  'tài xế',             // driver
  'phụ bếp',            // kitchen helper
  'đầu bếp',            // chef/cook
  'thợ hàn',            // welder
  'thợ điện',           // electrician
  'thợ máy',            // mechanic
  'thợ sơn',            // painter
  'thợ mộc',            // carpenter
  'thợ xây',            // construction worker
  'thợ ống nước',       // plumber
  'kho vận',            // warehouse logistics
  'giao hàng',          // delivery
  'vận chuyển',         // shipping/transport
  'nhà hàng',           // restaurant
  'khách sạn',          // hotel
  'dọn vệ sinh',       // cleaning
  'bốc xếp',           // loading/unloading
  'may mặc',           // garment/sewing
  'lắp ráp',           // assembly
  'sản xuất',           // production/manufacturing
  'nông nghiệp',       // agriculture
  'chăn nuôi',         // livestock/farming
  'bảo trì',           // maintenance
  'giám sát công trình', // construction supervisor
  'cơ khí',            // mechanical engineering
  'phục vụ',           // service staff (waiter/waitress)
  // English terms used in Vietnam
  'warehouse',
  'forklift',
  'driver',
  'factory',
  'manufacturing',
  'technician',
  'mechanic',
  'welder',
  'electrician',
  'housekeeping',
  'security guard',
  'delivery',
];

// ─── Job type mapping ───────────────────────────────────────────────
// VietnamWorks typeWorkingId values
function mapJobType(typeWorkingId?: number): JobType {
  switch (typeWorkingId) {
    case 1: return 'FULL_TIME';
    case 2: return 'PART_TIME';
    case 3: return 'FULL_TIME'; // contract → full time
    case 4: return 'PART_TIME'; // temporary
    case 5: return 'INTERNSHIP';
    default: return 'FULL_TIME';
  }
}

// ─── Sector detection (Vietnamese + English) ────────────────────────
function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/warehouse|kho|logistics|logist|driver|tài xế|giao hàng|vận chuyển|delivery|shipping|forklift|courier|bốc xếp/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|sản xuất|factory|nhà máy|assembly|lắp ráp|production|công nhân|operator/i.test(t)) return 'MANUFACTURING';
  if (/retail|bán hàng|cashier|thu ngân|store|cửa hàng|shop|siêu thị|supermarket/i.test(t)) return 'RETAIL';
  if (/construct|xây dựng|builder|thợ xây|mason|thợ nề|carpenter|thợ mộc|plumber|thợ ống nước|bricklayer|giám sát công trình/i.test(t)) return 'CONSTRUCTION';
  if (/cook|đầu bếp|kitchen|bếp|restaurant|nhà hàng|baker|food|thực phẩm|catering|waiter|phục vụ|barista|phụ bếp/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|thợ máy|automotive|ô tô|car|xe|vehicle|garage|workshop|sửa chữa/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|dệt|sewing|may|tailor|thợ may|garment|may mặc|confection/i.test(t)) return 'TEXTILE';
  if (/mining|khai thác|energy|năng lượng|solar|wind|oil|gas|electricity|điện/i.test(t)) return 'MINING_ENERGY';
  if (/nurse|y tá|healthcare|bệnh viện|hospital|care|chăm sóc|clinic|phòng khám/i.test(t)) return 'HEALTHCARE';
  if (/hotel|khách sạn|hospitality|housekeeper|tourism|du lịch|resort|concierge/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|nông|agriculture|nông nghiệp|garden|harvest|landscap|chăn nuôi|trồng trọt/i.test(t)) return 'AGRICULTURE';
  if (/security|bảo vệ|guard|an ninh/i.test(t)) return 'SECURITY_SERVICES';
  if (/cleaning|vệ sinh|janitor|facility|maintenance|bảo trì|caretaker|dọn dẹp/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metal|kim loại|steel|thép|weld|hàn|smith|cnc|machin|cơ khí|foundry|tiện/i.test(t)) return 'METAL_STEEL';
  if (/chemi|hóa chất|pharma|plastic|nhựa|rubber|cao su|paint|sơn/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/e-commerce|thương mại điện tử|parcel|package|last.mile/i.test(t)) return 'ECOMMERCE_CARGO';
  if (/telecom|viễn thông|cable|fiber|network|mạng|antenna/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Extract city/state from workingLocations ───────────────────────
interface LocationInfo {
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
}

function extractLocation(workingLocations?: any[]): LocationInfo {
  if (!workingLocations || workingLocations.length === 0) {
    return { city: null, state: null, latitude: null, longitude: null };
  }
  const loc = workingLocations[0];
  const cityName = loc.cityName || loc.city || null;
  const geoLoc = loc.geoLoc || loc.geoLocation || null;
  return {
    city: cityName ? String(cityName).trim() : null,
    state: loc.stateName || loc.state || null,
    latitude: geoLoc?.lat || null,
    longitude: geoLoc?.lon || geoLoc?.lng || null,
  };
}

// ─── Salary extraction ──────────────────────────────────────────────
interface SalaryInfo {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryPeriod: string;
}

function extractSalary(job: any): SalaryInfo {
  const min = job.salaryMin > 0 ? job.salaryMin : null;
  const max = job.salaryMax > 0 ? job.salaryMax : null;
  // VietnamWorks uses VND, monthly
  return {
    salaryMin: min,
    salaryMax: max,
    salaryCurrency: (min || max) ? 'VND' : 'VND',
    salaryPeriod: 'MONTHLY',
  };
}

// ─── Strip HTML tags for clean text ─────────────────────────────────
function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|ul|ol|h[1-6])[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── API fetch ──────────────────────────────────────────────────────
async function searchJobs(keyword: string, page: number): Promise<any> {
  const body = {
    query: keyword,
    filter: [],
    ranges: [],
    order: [],
    hitsPerPage: PAGE_SIZE,
    page: page,
    retrieveFields: [
      'jobId', 'jobTitle', 'jobUrl', 'alias',
      'companyName', 'companyId', 'companyLogo',
      'jobDescription', 'jobRequirement',
      'workingLocations', 'salary', 'salaryMin', 'salaryMax', 'isSalaryVisible',
      'typeWorkingId', 'skills', 'benefits', 'industries',
      'expiredOn', 'createdOn', 'approvedOn',
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Source lookup/creation ──────────────────────────────────────────

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  // Find existing VietnamWorks source
  let source = await prisma.crawlSource.findFirst({
    where: { market: 'VN', name: { contains: 'VietnamWorks' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    // Find or create VietnamWorks company
    let company = await prisma.company.findFirst({
      where: { name: 'VietnamWorks', market: 'VN' },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'VietnamWorks',
          slug: 'vietnamworks-vn',
          market: 'VN',
          sector: 'OTHER',
          websiteUrl: 'https://www.vietnamworks.com',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'VietnamWorks VN Job Listings',
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market: 'VN',
        companyId: company.id,
        seedUrls: ['https://ms.vietnamworks.com/job-search/v1.0/search'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  return source;
}

// ─── Main import ────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`\n=== VietnamWorks Bulk Import (VN) ===`);
  console.log(`  Keywords: ${KEYWORDS.length}`);
  console.log(`  Max pages/keyword: ${MAX_PAGES_PER_KEYWORD}`);
  console.log(`  Dry run: ${DRY_RUN}\n`);

  const source = await getOrCreateSource();
  console.log(`  Source ID: ${source.id}`);
  console.log(`  Company ID: ${source.companyId}\n`);

  const startTime = Date.now();
  const seenFingerprints = new Set<string>(); // Cross-keyword dedup
  let totalFetched = 0;
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalFiltered = 0;
  let totalDupSkipped = 0;

  resetTitleCounts();

  for (const keyword of KEYWORDS) {
    console.log(`  Keyword: "${keyword}"...`);
    let keywordFetched = 0;
    let keywordInserted = 0;
    let batch: any[] = [];

    for (let page = 0; page < MAX_PAGES_PER_KEYWORD; page++) {
      try {
        const data = await searchJobs(keyword, page);
        const jobs = data?.data || [];
        const total = data?.meta?.total || 0;

        if (jobs.length === 0) break;
        keywordFetched += jobs.length;

        for (const job of jobs) {
          const title = (job.jobTitle || '').trim();
          if (!title || title.length < 5) continue;

          const jobId = String(job.jobId || '');
          const companyName = (job.companyName || '').trim();
          const alias = job.alias || job.jobUrl || '';
          const sourceUrl = alias
            ? `https://www.vietnamworks.com/${alias}`
            : `https://www.vietnamworks.com/job/${jobId}`;

          // Fingerprint: unique per job posting
          const fingerprint = md5(`vietnamworks:${jobId}:${title}`);

          // Cross-keyword dedup — same job can appear for multiple keywords
          if (seenFingerprints.has(fingerprint)) {
            totalDupSkipped++;
            continue;
          }
          seenFingerprints.add(fingerprint);

          // Location
          const loc = extractLocation(job.workingLocations);

          // Salary
          const salary = extractSalary(job);

          // Description & requirements
          const description = stripHtml(job.jobDescription);
          const requirements = stripHtml(job.jobRequirement);

          // Benefits
          const benefits = Array.isArray(job.benefits)
            ? job.benefits.map((b: any) => typeof b === 'string' ? b : b.benefitName || '').filter(Boolean).join(', ')
            : '';

          // Skills
          const skills = Array.isArray(job.skills)
            ? job.skills.map((s: any) => typeof s === 'string' ? s : s.skillName || '').filter(Boolean).join(', ')
            : '';

          // Deadline
          const deadline = job.expiredOn ? new Date(job.expiredOn) : null;
          const postedDate = job.approvedOn ? new Date(job.approvedOn)
            : job.createdOn ? new Date(job.createdOn) : new Date();

          // Sector detection
          const sector = detectSector(title, description);

          // Job type
          const jobType = mapJobType(job.typeWorkingId);

          const slug = slugify(`${title}-${companyName}-${jobId}`);

          const record = {
            title,
            slug,
            description: description || null,
            requirements: requirements || null,
            benefits: benefits || null,
            sourceUrl,
            fingerprint,
            sourceId: source.id,
            companyId: source.companyId,
            country: 'VN' as Market,
            city: loc.city,
            state: loc.state,
            latitude: loc.latitude,
            longitude: loc.longitude,
            sector,
            jobType,
            workMode: 'ON_SITE' as WorkMode,
            salaryMin: salary.salaryMin,
            salaryMax: salary.salaryMax,
            salaryCurrency: salary.salaryCurrency,
            salaryPeriod: salary.salaryPeriod,
            postedDate: postedDate,
            deadline: (deadline && !isNaN(deadline.getTime())) ? deadline : null,
            status: 'ACTIVE' as const,
            lastSeenAt: new Date(),
          };

          batch.push(record);

          // Flush batch
          if (batch.length >= BATCH_SIZE) {
            if (!DRY_RUN) {
              try {
                const result = await flushBatchUpsert(prisma, batch);
                keywordInserted += result.inserted;
                totalUpdated += result.updated;
                totalFiltered += result.filtered;
              } catch (flushErr: any) {
                console.error(`    [FLUSH ERROR] ${flushErr.message?.substring(0, 200)}`);
                // Try individual inserts to find the bad record
                let individualInserted = 0;
                for (const item of batch) {
                  try {
                    const r = await prisma.jobListing.createMany({ data: [item], skipDuplicates: true });
                    individualInserted += r.count;
                  } catch (itemErr: any) {
                    console.error(`    [BAD RECORD] ${item.title?.substring(0,50)}: ${itemErr.message?.substring(0, 150)}`);
                    break; // Only log first bad record
                  }
                }
                keywordInserted += individualInserted;
              }
            }
            batch = [];
          }
        }

        // Check if we've fetched all results
        if (keywordFetched >= total || jobs.length < PAGE_SIZE) break;

        await delay(REQUEST_DELAY_MS);
      } catch (err: any) {
        console.warn(`    Page ${page} error: ${err.message?.substring(0, 80)}`);
        break;
      }
    }

    // Flush remaining
    if (batch.length > 0 && !DRY_RUN) {
      const result = await flushBatchUpsert(prisma, batch);
      keywordInserted += result.inserted;
      totalUpdated += result.updated;
      totalFiltered += result.filtered;
      batch = [];
    }

    totalFetched += keywordFetched;
    totalInserted += keywordInserted;
    console.log(`    ${keywordFetched} fetched, +${keywordInserted} inserted`);

    await delay(REQUEST_DELAY_MS);
  }

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n=== FINAL STATS ===`);
  console.log(`  Total fetched       : ${totalFetched}`);
  console.log(`  Cross-kw dup skip   : ${totalDupSkipped}`);
  console.log(`  Inserted / upserted : ${totalInserted}`);
  console.log(`  Updated (lastSeen)  : ${totalUpdated}`);
  console.log(`  Non-blue-collar     : ${totalFiltered}`);
  console.log(`  Duration            : ${duration}s`);
  console.log(`\n  Finished: ${new Date().toISOString()}\n`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
