/**
 * bulk-import-jobbank-ca.ts — Bulk Import from Canada Job Bank (Open Data CSV)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-jobbank-ca.ts
 *
 * Data Source: https://open.canada.ca/data/en/dataset/ea639e28-c0fc-48bf-b5dd-b8899bd43072
 * - Monthly CSV bulk downloads (UTF-16 LE, tab-separated)
 * - Fields: Job ID, Title, NOC Code, Province, City, Salary, etc.
 * - Open Government Licence - Canada
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { writeFileSync, existsSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// Latest CSV URL (update monthly)
const CSV_URL = 'https://open.canada.ca/data/dataset/ea639e28-c0fc-48bf-b5dd-b8899bd43072/resource/e8c27948-6a40-452b-8d7d-2e1b799ca8aa/download/job-bank-open-data-all-job-postings-en-feb2026.csv';
const LOCAL_CSV = '/tmp/jobbank-ca.csv';
const LOCAL_UTF8 = '/tmp/jobbank-ca-utf8.tsv';

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Sector detection ───────────────────────────────────────────────

function detectSector(title: string, noc?: string): Sector {
  const t = `${title} ${noc || ''}`.toLowerCase();
  if (/warehouse|logistics|transport|driver|courier|delivery|shipping|freight|forklift|truck|postal/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|machine operator|cnc|welder/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop|sales clerk|grocery/i.test(t)) return 'RETAIL';
  if (/construct|carpenter|plumber|electrician|roofer|bricklayer|mason|painter|concrete/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|tire|body shop/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor/i.test(t)) return 'TEXTILE';
  if (/mining|energy|solar|oil|gas|drilling|rig/i.test(t)) return 'MINING_ENERGY';
  if (/nurse|healthcare|hospital|care|aide|nursing|personal support/i.test(t)) return 'HEALTHCARE';
  if (/hotel|hospitality|housekeeper|tourism|laundry|room attendant/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agriculture|garden|harvest|landscap|nursery|animal/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|protective/i.test(t)) return 'SECURITY_SERVICES';
  if (/cleaning|janitor|custodian|maintenance|caretaker|facility/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metal|steel|weld|smith|cnc|machin|foundry|boilermaker/i.test(t)) return 'METAL_STEEL';
  if (/chemi|pharma|plastic|rubber/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/telecom|cable|fiber|network/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'CA', name: { contains: 'Job Bank' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: { contains: 'Job Bank' }, market: 'CA' },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `job-bank-canada-gov-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'Job Bank Canada',
          slug: uniqueSlug,
          market: 'CA',
          sector: 'OTHER',
          websiteUrl: 'https://www.jobbank.gc.ca',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'Job Bank Canada (Open Data)',
        type: 'GOVERNMENT',
        crawlMethod: 'API',
        market: 'CA',
        companyId: company.id,
        seedUrls: ['https://open.canada.ca/data/en/dataset/ea639e28-c0fc-48bf-b5dd-b8899bd43072'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── Download & convert CSV ──────────────────────────────────────────

async function downloadCSV(): Promise<void> {
  console.log(`  Downloading CSV from Job Bank...`);

  // Download
  execSync(`curl -sL -o "${LOCAL_CSV}" "${CSV_URL}"`, { timeout: 120_000 });

  // Convert from UTF-16 LE to UTF-8 (the file is UTF-16 tab-separated)
  console.log(`  Converting UTF-16 to UTF-8...`);
  execSync(`iconv -f UTF-16LE -t UTF-8 "${LOCAL_CSV}" > "${LOCAL_UTF8}"`, { timeout: 60_000 });

  console.log(`  CSV downloaded and converted`);
}

// ─── Parse TSV line ──────────────────────────────────────────────────

interface JobRow {
  id: string;
  title: string;
  originalTitle: string;
  nocCode: string;
  nocName: string;
  noc21Code: string;
  noc21Name: string;
  external: string;
  postingDate: string;
  vacancyCount: string;
  language: string;
  province: string;
  city: string;
  postalCode: string;
  employmentType: string;
  employmentTerm: string;
  salaryMin: string;
  salaryMax: string;
  salaryPer: string;
}

function parseTSVLine(line: string, headers: string[]): Record<string, string> {
  const values = line.split('\t');
  const obj: Record<string, string> = {};
  for (let i = 0; i < headers.length && i < values.length; i++) {
    obj[headers[i].trim()] = values[i]?.trim() || '';
  }
  return obj;
}

// ─── Main import ─────────────────────────────────────────────────────

interface ImportStats {
  total: number;
  blueCollar: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function main() {
  console.log(`\n🇨🇦 Mavi Yaka — Canada Job Bank Bulk Import`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  // Download CSV
  await downloadCSV();

  const stats: ImportStats = { total: 0, blueCollar: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  let batch: any[] = [];
  const seen = new Set<string>();

  // Read and parse TSV
  const rl = createInterface({
    input: createReadStream(LOCAL_UTF8, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let headers: string[] = [];
  let lineNum = 0;

  for await (const line of rl) {
    lineNum++;

    // First line is headers
    if (lineNum === 1) {
      headers = line.split('\t').map(h => h.trim().replace(/^\uFEFF/, '')); // Remove BOM
      continue;
    }

    if (!line.trim()) continue;
    stats.total++;

    try {
      const row = parseTSVLine(line, headers);

      const jobId = row['WIC Job Location Snapshot ID'] || row[headers[0]] || '';
      if (!jobId || seen.has(jobId)) { stats.skipped++; continue; }
      seen.add(jobId);

      const title = row['Job Title'] || row['Original Job Title'] || '';
      if (!title) { stats.skipped++; continue; }

      const nocName = row['NOC21 Code Name'] || row['NOC 2016 Code Name'] || '';

      // Blue-collar filter
      if (!isBlueCollar(title, nocName)) {
        stats.skipped++;
        continue;
      }

      stats.blueCollar++;

      const province = row['Province/Territory'] || '';
      const city = row['City'] || '';
      const postingDate = row['First Posting Date'] || '';
      const salaryMinStr = row['Salary Minimum'] || '';
      const salaryMaxStr = row['Salary Maximum'] || '';

      const sourceUrl = `https://www.jobbank.gc.ca/jobsearch/jobposting/${jobId}`;
      const canonicalUrl = sourceUrl.toLowerCase();
      const fingerprint = md5(`jobbank-ca:${jobId}`);
      const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

      const salaryMin = salaryMinStr ? parseFloat(salaryMinStr) : null;
      const salaryMax = salaryMaxStr ? parseFloat(salaryMaxStr) : null;
      const postedDate = postingDate ? new Date(postingDate.replace(/\//g, '-')) : null;

      batch.push({
        title: title.substring(0, 500),
        slug,
        sourceUrl,
        canonicalUrl,
        fingerprint,
        companyId: source.companyId,
        sourceId: source.id,
        country: 'CA' as Market,
        city: city || null,
        state: province || null,
        sector: detectSector(title, nocName),
        description: nocName ? `${nocName}\n\nLocation: ${city}, ${province}` : null,
        salaryMin: salaryMin && !isNaN(salaryMin) ? salaryMin : null,
        salaryMax: salaryMax && !isNaN(salaryMax) ? salaryMax : null,
        postedDate: postedDate && !isNaN(postedDate.getTime()) ? postedDate : null,
        lastSeenAt: new Date(),
        status: 'ACTIVE' as JobStatus,
      });

      if (batch.length >= 500) {
        const result = await flushBatch(batch);
        stats.inserted += result;
        batch = [];

        if (stats.blueCollar % 5000 === 0) {
          console.log(`  Progress: ${stats.total.toLocaleString()} scanned, ${stats.blueCollar.toLocaleString()} blue-collar, ${stats.inserted.toLocaleString()} inserted`);
        }
      }
    } catch (e: any) {
      stats.errors++;
      if (stats.errors <= 5) {
        console.warn(`  Line ${lineNum} error: ${e.message?.substring(0, 100)}`);
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  // Cleanup temp files
  try { unlinkSync(LOCAL_CSV); } catch {}
  try { unlinkSync(LOCAL_UTF8); } catch {}

  await prisma.$disconnect();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Total scanned: ${stats.total.toLocaleString()}`);
  console.log(`  Blue-collar: ${stats.blueCollar.toLocaleString()} (${((stats.blueCollar / stats.total) * 100).toFixed(1)}%)`);
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
