/**
 * bulk-import-worknet-kr.ts — Bulk Import from Korean WorkNet/Work24 API
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-worknet-kr.ts
 *
 * WorkNet API: http://openapi.work.go.kr/opi/opi/opia/wantedApi.do
 * - Auth: authKey parameter (free, register at data.go.kr)
 * - Response: XML only
 * - Pagination: startPage (1-1000), display (1-100)
 * - 124K+ active postings
 * - Filters: keyword, region, occupation, salary, career, education
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const WORKNET_API_KEY = process.env.WORKNET_API_KEY || '';
const API_BASE = 'http://openapi.work.go.kr/opi/opi/opia/wantedApi.do';
const RESULTS_PER_PAGE = 100;
const MAX_PAGES = 30; // 30 pages × 100 = 3,000 per keyword
const REQUEST_DELAY_MS = 400;
const REQUEST_TIMEOUT_MS = 20_000;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[가-힣]+/g, m => m.substring(0, 10)) // keep Korean chars (truncated)
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// ─── Simple XML tag extractor (no dependency needed) ─────────────────

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function extractAllBlocks(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
  const blocks: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    blocks.push(match[1]);
  }
  return blocks;
}

// ─── Sector detection (Korean) ──────────────────────────────────────

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`;
  if (/물류|운송|배송|택배|화물|운전|기사|지게차|포크리프트|창고|배달|퀵서비스/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/생산|제조|공장|조립|기계|CNC|프레스|사출|금형/i.test(t)) return 'MANUFACTURING';
  if (/판매|매장|점원|캐셔|마트|편의점|백화점|매장관리/i.test(t)) return 'RETAIL';
  if (/건설|건축|목수|미장|배관|지붕|철근|콘크리트|도장|방수|용접|비계|토목/i.test(t)) return 'CONSTRUCTION';
  if (/요리|조리|주방|셰프|제과|제빵|식당|바리스타|서빙|홀서빙|카페/i.test(t)) return 'FOOD_BEVERAGE';
  if (/자동차|정비|카센터|도색|판금|타이어/i.test(t)) return 'AUTOMOTIVE';
  if (/섬유|봉제|재봉|의류|패턴/i.test(t)) return 'TEXTILE';
  if (/광업|에너지|발전|전력|태양광/i.test(t)) return 'MINING_ENERGY';
  if (/간호|간병|요양|병원|돌봄|의료|복지/i.test(t)) return 'HEALTHCARE';
  if (/호텔|청소|객실|하우스키핑|세탁|숙박/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/농업|농장|원예|조경|축산|양식|임업|산림/i.test(t)) return 'AGRICULTURE';
  if (/경비|보안|시설경비|안전관리/i.test(t)) return 'SECURITY_SERVICES';
  if (/시설관리|미화|청소|관리|건물관리|빌딩|설비/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/용접|금속|철강|주물|판금|도금/i.test(t)) return 'METAL_STEEL';
  if (/화학|플라스틱|도료|제약|고무/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/통신|케이블|광섬유|네트워크|전기통신/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Korean blue-collar search keywords ─────────────────────────────

const SEARCH_KEYWORDS = [
  // 물류 & 운송 (Logistics & Transportation)
  '물류', '창고', '지게차', '택배', '배송기사', '화물운전', '운전기사',
  '포크리프트', '배달', '퀵서비스', '물류센터', '입출고',
  // 청소 & 시설관리 (Cleaning & Facility Management)
  '청소', '미화', '시설관리', '건물관리', '경비', '보안', '주차관리',
  // 요식업 (Food & Beverage)
  '조리', '주방', '조리사', '제빵', '제과', '바리스타', '서빙',
  '식당', '급식', '주방보조', '홀서빙',
  // 건설 & 토목 (Construction)
  '건설', '건축', '토목', '배관', '용접', '비계', '철근', '콘크리트',
  '도장', '방수', '미장', '목수', '인테리어', '전기공사',
  // 생산 & 제조 (Manufacturing)
  '생산직', '제조', '공장', '조립', '기계', 'CNC', '프레스',
  '사출', '포장', '검사원', '품질검사', '금형',
  // 자동차 & 정비 (Automotive)
  '자동차정비', '카센터', '정비사', '판금도색', '타이어',
  // 의료 & 돌봄 (Healthcare & Care)
  '간병', '요양보호사', '간호조무사', '병원', '돌봄', '복지',
  // 농업 & 원예 (Agriculture)
  '농업', '농장', '축산', '원예', '조경', '산림',
  // 섬유 & 봉제 (Textile)
  '봉제', '재봉', '섬유', '의류생산',
  // 기타 (Other)
  '세탁', '호텔', '객실', '단순노무', '현장직', '기능직',
  '설비', '보일러', '냉동', '에어컨', '배선',
];

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'KR', name: { contains: 'WorkNet' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: { contains: 'WorkNet' }, market: 'KR' },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'WorkNet (고용노동부)',
          slug: `worknet-kr-gov-${Date.now().toString(36)}`,
          market: 'KR',
          sector: 'OTHER',
          websiteUrl: 'https://www.work24.go.kr',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'WorkNet Korea Job Listings',
        type: 'GOVERNMENT',
        crawlMethod: 'API',
        market: 'KR',
        companyId: company.id,
        seedUrls: ['http://openapi.work.go.kr/opi/opi/opia/wantedApi.do'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── WorkNet API fetch ──────────────────────────────────────────────

async function fetchWorkNet(keyword: string, page: number): Promise<string> {
  const params = new URLSearchParams({
    authKey: WORKNET_API_KEY,
    callTp: 'L',
    returnType: 'XML',
    startPage: String(page),
    display: String(RESULTS_PER_PAGE),
    keyword,
  });

  const url = `${API_BASE}?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/xml' },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Parse XML response ─────────────────────────────────────────────

interface WorkNetJob {
  wantedAuthNo: string;
  company: string;
  title: string;
  salTpNm: string;
  sal: string;
  minSal: string;
  maxSal: string;
  region: string;
  career: string;
  regDt: string;
  closeDt: string;
  wantedInfoUrl: string;
  mobileInfoUrl: string;
  basicAddr: string;
  detailAddr: string;
  jobsCd: string;
}

function parseJobsXml(xml: string): { total: number; jobs: WorkNetJob[] } {
  // Check for error
  const errCode = extractTag(xml, 'messageCd');
  if (errCode && errCode !== '000') {
    const errMsg = extractTag(xml, 'messageNm');
    throw new Error(`WorkNet API error ${errCode}: ${errMsg}`);
  }

  const total = parseInt(extractTag(xml, 'total') || '0', 10);
  const wantedBlocks = extractAllBlocks(xml, 'wanted');

  const jobs: WorkNetJob[] = wantedBlocks.map(block => ({
    wantedAuthNo: extractTag(block, 'wantedAuthNo'),
    company: extractTag(block, 'company'),
    title: extractTag(block, 'title') || extractTag(block, 'wantedTitle'),
    salTpNm: extractTag(block, 'salTpNm'),
    sal: extractTag(block, 'sal'),
    minSal: extractTag(block, 'minSal'),
    maxSal: extractTag(block, 'maxSal'),
    region: extractTag(block, 'region'),
    career: extractTag(block, 'career'),
    regDt: extractTag(block, 'regDt'),
    closeDt: extractTag(block, 'closeDt'),
    wantedInfoUrl: extractTag(block, 'wantedInfoUrl'),
    mobileInfoUrl: extractTag(block, 'mobileInfoUrl'),
    basicAddr: extractTag(block, 'basicAddr'),
    detailAddr: extractTag(block, 'detailAddr'),
    jobsCd: extractTag(block, 'jobsCd'),
  }));

  return { total, jobs };
}

// ─── Salary parsing ─────────────────────────────────────────────────

function parseSalary(job: WorkNetJob): {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: string | null;
} {
  let salaryMin: number | null = null;
  let salaryMax: number | null = null;
  let salaryPeriod: string | null = null;

  const minVal = parseInt(job.minSal?.replace(/[^0-9]/g, '') || '', 10);
  const maxVal = parseInt(job.maxSal?.replace(/[^0-9]/g, '') || '', 10);
  const salVal = parseInt(job.sal?.replace(/[^0-9]/g, '') || '', 10);

  if (!isNaN(minVal) && minVal > 0) salaryMin = minVal;
  if (!isNaN(maxVal) && maxVal > 0) salaryMax = maxVal;
  if (!salaryMin && !isNaN(salVal) && salVal > 0) salaryMin = salVal;

  // Determine period from salTpNm (시급=hourly, 일급=daily, 월급=monthly, 연봉=yearly)
  const tp = job.salTpNm || '';
  if (/시급|시간/i.test(tp)) salaryPeriod = 'HOURLY';
  else if (/일급|일당/i.test(tp)) salaryPeriod = 'DAILY';
  else if (/주급/i.test(tp)) salaryPeriod = 'WEEKLY';
  else if (/월급|월/i.test(tp)) salaryPeriod = 'MONTHLY';
  else if (/연봉|연/i.test(tp)) salaryPeriod = 'YEARLY';
  else if (salaryMin) {
    // Guess from amount (KRW)
    if (salaryMin < 50000) salaryPeriod = 'HOURLY';
    else if (salaryMin < 500000) salaryPeriod = 'DAILY';
    else if (salaryMin < 10000000) salaryPeriod = 'MONTHLY';
    else salaryPeriod = 'YEARLY';
  }

  return { salaryMin, salaryMax, salaryPeriod };
}

// ─── Main ────────────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function main() {
  if (!WORKNET_API_KEY) {
    console.error('❌ WORKNET_API_KEY not set');
    console.error('   Register at https://www.data.go.kr/data/3038225/openapi.do');
    console.error('   Set it: export WORKNET_API_KEY=your_api_key_here');
    process.exit(1);
  }

  console.log(`\n🇰🇷 Mavi Yaka — WorkNet Korea Bulk Import`);
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
        const xml = await fetchWorkNet(keyword, page);
        const { total, jobs } = parseJobsXml(xml);

        stats.fetched += jobs.length;

        if (page === 1 && total > 0) {
          console.log(`  "${keyword}": ${total.toLocaleString()} total`);
        }

        for (const job of jobs) {
          const authNo = job.wantedAuthNo;
          if (!authNo) { stats.skipped++; continue; }
          if (seen.has(authNo)) { stats.skipped++; continue; }
          seen.add(authNo);

          const title = job.title || keyword;
          const jobUrl = job.wantedInfoUrl || job.mobileInfoUrl ||
            `https://www.work24.go.kr/wk/a/b/1200/dtlReqstView.do?wantedAuthNo=${authNo}`;
          const canonicalUrl = jobUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`worknet:${authNo}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const company = job.company || '';
          const location = job.region || job.basicAddr || '';

          // Blue-collar filter
          if (!isBlueCollar(title, `${company} ${location} ${job.jobsCd}`)) {
            stats.skipped++;
            continue;
          }

          const { salaryMin, salaryMax, salaryPeriod } = parseSalary(job);

          // Parse dates
          const postedDate = job.regDt ? parseKoreanDate(job.regDt) : null;
          const expirationDate = job.closeDt ? parseKoreanDate(job.closeDt) : null;

          const desc = [
            company ? `회사: ${company}` : '',
            location ? `지역: ${location}` : '',
            job.career ? `경력: ${job.career}` : '',
            job.salTpNm && job.sal ? `급여: ${job.salTpNm} ${job.sal}` : '',
          ].filter(Boolean).join('\n').substring(0, 5000) || null;

          batch.push({
            title: `${title}${company ? ` — ${company}` : ''}`.substring(0, 500),
            slug,
            sourceUrl: jobUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: 'KR' as Market,
            city: location.split(' ')[0] || null,
            sector: detectSector(title, desc || undefined),
            description: desc,
            salaryMin,
            salaryMax,
            salaryCurrency: 'KRW',
            salaryPeriod: salaryPeriod as any,
            postedDate,
            expirationDate,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        hasMore = jobs.length === RESULTS_PER_PAGE && page < MAX_PAGES;
        page++;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429') || msg.includes('Too Many')) {
          console.warn(`  Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  "${keyword}" p${page}: ${msg.substring(0, 100)}`);
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

// ─── Date parser (YYYYMMDD or YYYY-MM-DD) ───────────────────────────

function parseKoreanDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.replace(/[^0-9]/g, '');
  if (clean.length === 8) {
    const y = parseInt(clean.substring(0, 4));
    const m = parseInt(clean.substring(4, 6)) - 1;
    const d = parseInt(clean.substring(6, 8));
    const date = new Date(y, m, d);
    if (!isNaN(date.getTime())) return date;
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// ─── Batch insert ───────────────────────────────────────────────────

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

main().catch(console.error);
