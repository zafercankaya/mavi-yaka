/**
 * bulk-import-usajobs.ts — Bulk Import from USAJobs API (US Federal Government)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-usajobs.ts
 *
 * USAJobs API: https://developer.usajobs.gov/API-Reference
 * - Auth: Authorization-Key header + User-Agent (email)
 * - Endpoint: https://data.usajobs.gov/api/search
 * - Max 500 results per page
 * - Blue-collar focus: Wage Grade (WG) positions, trade/craft occupations
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

const USAJOBS_API_KEY = process.env.USAJOBS_API_KEY || '';
const USAJOBS_EMAIL = 'zafer.cankaya@gmail.com';
const API_BASE = 'https://data.usajobs.gov/api/search';
const RESULTS_PER_PAGE = 500; // USAJobs max
const REQUEST_DELAY_MS = 500;
const REQUEST_TIMEOUT_MS = 30_000;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Sector detection for US federal jobs ────────────────────────────

function detectSector(title: string, category?: string): Sector {
  const t = `${title} ${category || ''}`.toLowerCase();
  if (/warehouse|supply|logistics|transport|motor vehicle|shipping|freight|postal|mail/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/production|manufactur|machinist|tool.*die|industrial/i.test(t)) return 'MANUFACTURING';
  if (/sales|store|retail|commissary/i.test(t)) return 'RETAIL';
  if (/construct|mason|carpenter|plumber|roofer|cement|paving|painter|plasterer/i.test(t)) return 'CONSTRUCTION';
  if (/cook|food|kitchen|baker|meat|butcher|dining/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|vehicle|engine|transmission|tire/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|fabric|tailor|upholster/i.test(t)) return 'TEXTILE';
  if (/mining|energy|power|boiler|electrical.*plant|utility/i.test(t)) return 'MINING_ENERGY';
  if (/nurse|hospital|health|medical|care|aid|nursing/i.test(t)) return 'HEALTHCARE';
  if (/hotel|hospitality|housekeep|laundry|recreation|park.*ranger/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agriculture|garden|forest|grounds|landscape|animal|ranch/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|police|correctional|detention|protective/i.test(t)) return 'SECURITY_SERVICES';
  if (/custod|janitor|clean|maintenance|facility|building|hvac|air.condition|elevator/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metal|steel|weld|sheet.*metal|blacksmith|foundry|machinist|cnc|boilermaker/i.test(t)) return 'METAL_STEEL';
  if (/chemi|pharma|lab.*tech|hazmat/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/telecom|cable|wire|communication.*tech/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Blue-collar keywords for USAJobs ────────────────────────────────
// Focus on Wage Grade (WG/WL/WS) and trade/craft occupational series

const SEARCH_KEYWORDS = [
  // Trades & Labor
  'warehouse worker', 'forklift operator', 'laborer', 'custodian', 'janitor',
  'maintenance worker', 'maintenance mechanic', 'electrician', 'plumber', 'carpenter',
  'painter', 'mason', 'welder', 'sheet metal', 'pipefitter',
  // Transportation
  'truck driver', 'motor vehicle operator', 'heavy equipment operator', 'tractor operator',
  // Food Service
  'cook', 'food service worker', 'kitchen worker', 'baker',
  // Facility & Grounds
  'groundskeeper', 'landscaper', 'housekeeper', 'laundry worker',
  // Security & Protection
  'security guard', 'correctional officer', 'detention officer',
  // Healthcare Support
  'nursing assistant', 'hospital housekeeping',
  // Skilled Trades
  'boilermaker', 'machinist', 'tool and die', 'HVAC', 'air conditioning mechanic',
  'elevator mechanic', 'locksmith', 'roofer', 'glazier',
  // General
  'wage grade', 'WG-', 'trade', 'craft worker',
];

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'US', name: { contains: 'USAJobs' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'USAJobs (Federal Government)', market: 'US' },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'USAJobs (Federal Government)',
          slug: 'usajobs-federal-government',
          market: 'US',
          sector: 'OTHER',
          websiteUrl: 'https://www.usajobs.gov',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'USAJobs Federal Job Listings',
        type: 'GOVERNMENT',
        crawlMethod: 'API',
        market: 'US',
        companyId: company.id,
        seedUrls: ['https://data.usajobs.gov/api/search'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── API fetch ───────────────────────────────────────────────────────

async function fetchUSAJobs(keyword: string, page: number): Promise<any> {
  const params = new URLSearchParams({
    Keyword: keyword,
    ResultsPerPage: String(RESULTS_PER_PAGE),
    Page: String(page),
    Fields: 'Full',
    WhoMayApply: 'All',
  });

  const url = `${API_BASE}?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Host': 'data.usajobs.gov',
        'User-Agent': USAJOBS_EMAIL,
        'Authorization-Key': USAJOBS_API_KEY,
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Main import ─────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function main() {
  if (!USAJOBS_API_KEY) {
    console.error('❌ USAJOBS_API_KEY environment variable not set!');
    console.error('   Request one at: https://developer.usajobs.gov/APIRequest/Index');
    process.exit(1);
  }

  console.log(`\n🇺🇸 Mavi Yaka — USAJobs Bulk Import`);
  console.log(`Keywords: ${SEARCH_KEYWORDS.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const keyword of SEARCH_KEYWORDS) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchUSAJobs(keyword, page);
        const searchResult = data?.SearchResult;
        const totalCount = searchResult?.SearchResultCountAll || 0;
        const items = searchResult?.SearchResultItems || [];

        stats.fetched += items.length;

        for (const item of items) {
          const obj = item.MatchedObjectDescriptor;
          if (!obj) continue;

          const posId = obj.PositionID || item.MatchedObjectId || '';
          if (!posId || seen.has(posId)) { stats.skipped++; continue; }
          seen.add(posId);

          const title = obj.PositionTitle || keyword;
          const sourceUrl = obj.PositionURI || `https://www.usajobs.gov/job/${posId}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`usajobs:${posId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          // Location
          const locations = obj.PositionLocation || [];
          const firstLoc = locations[0] || {};
          const city = firstLoc.CityName || obj.PositionLocationDisplay || null;
          const state = firstLoc.CountrySubDivisionCode || null;
          const lat = firstLoc.Latitude ? parseFloat(firstLoc.Latitude) : null;
          const lon = firstLoc.Longitude ? parseFloat(firstLoc.Longitude) : null;

          // Category
          const categories = obj.JobCategory || [];
          const categoryName = categories[0]?.Name || '';

          // Salary
          const remuneration = obj.PositionRemuneration || [];
          const salaryInfo = remuneration[0] || {};
          const salaryMin = salaryInfo.MinimumRange ? parseFloat(salaryInfo.MinimumRange) : null;
          const salaryMax = salaryInfo.MaximumRange ? parseFloat(salaryInfo.MaximumRange) : null;

          // Description
          const qualSummary = obj.QualificationSummary || '';
          const userArea = obj.UserArea?.Details || {};
          const majorDuties = userArea.MajorDuties || [];
          const description = [qualSummary, ...majorDuties].filter(Boolean).join('\n\n').substring(0, 5000) || null;

          // Posted date
          const postedDate = obj.PublicationStartDate ? new Date(obj.PublicationStartDate) : null;

          batch.push({
            title: `${title}${obj.OrganizationName ? ` - ${obj.OrganizationName}` : ''}`,
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: 'US' as Market,
            city,
            state,
            latitude: lat,
            longitude: lon,
            sector: detectSector(title, categoryName),
            description,
            salaryMin,
            salaryMax,
            postedDate,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        const numPages = Math.ceil(totalCount / RESULTS_PER_PAGE);
        hasMore = items.length === RESULTS_PER_PAGE && page < numPages && page < 20; // cap at 20 pages = 10K
        page++;

        await delay(REQUEST_DELAY_MS);

        if (items.length > 0) {
          console.log(`  "${keyword}" p${page - 1}: ${items.length} jobs (${totalCount} total)`);
        }
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          console.warn(`  Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  "${keyword}" p${page}: ${msg.substring(0, 100)}`);
          stats.errors++;
          hasMore = false;
        }
      }
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
  try {
    const result = await prisma.jobListing.createMany({
      data: batch,
      skipDuplicates: true,
    });
    return result.count;
  } catch (e: any) {
    if (batch.length > 50) {
      let inserted = 0;
      for (let i = 0; i < batch.length; i += 50) {
        const chunk = batch.slice(i, i + 50);
        try {
          const r = await prisma.jobListing.createMany({ data: chunk, skipDuplicates: true });
          inserted += r.count;
        } catch (e2: any) {
          console.warn(`  [DB] Chunk error: ${e2.message?.substring(0, 150)}`);
        }
      }
      return inserted;
    }
    console.warn(`  [DB] Batch error: ${e.message?.substring(0, 150)}`);
    return 0;
  }
}

main().catch(console.error);
