/**
 * bulk-import-cbop-pl.ts — Bulk Import from Polish CBOP (Centralna Baza Ofert Pracy)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-cbop-pl.ts
 *
 * CBOP API: POST https://oferty.praca.gov.pl/portal-api/v3/oferta/wyszukiwanie
 * - No auth required
 * - ~18,100 active offers, ~39,198 positions
 * - Pagination: page (0-based), size (up to 1000), sort
 * - Response: JSON with payload.ofertyPracyPage.content[]
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const API_BASE = 'https://oferty.praca.gov.pl/portal-api/v3/oferta/wyszukiwanie';
const DETAIL_BASE = 'https://oferty.praca.gov.pl/portal-api/v3/oferta/szczegoly';
const PAGE_SIZE = 100;
const MAX_PAGES = 200; // 200 × 100 = 20,000 (covers all ~18K offers)
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
    .replace(/[ąà]/g, 'a').replace(/[ćç]/g, 'c').replace(/[ę]/g, 'e')
    .replace(/[łl]/g, 'l').replace(/[ńñ]/g, 'n').replace(/[óòôõ]/g, 'o')
    .replace(/[śş]/g, 's').replace(/[źżž]/g, 'z').replace(/[üùúû]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/magazyn|logist|kierowca|transport|kurier|dostaw|pakowacz|komisjon|wózek|spedyc/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/produkcj|fabryka|maszyn|monter|operator.*produkcji|montaż|obróbk/i.test(t)) return 'MANUFACTURING';
  if (/sprzedaw|kasjer|sklep|handl|ekspedient/i.test(t)) return 'RETAIL';
  if (/budow|murar|tynkar|cieśl|dekar|malar.*budow|brukarz|zbrojarz|betoniar/i.test(t)) return 'CONSTRUCTION';
  if (/kuchar|pomoc kuchenn|kelner|barman|piekarz|cukiernik|rzeźnik|pizz|gastronom/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanik.*samochod|lakiernik.*samochod|wulkaniz|blacharz.*samochod/i.test(t)) return 'AUTOMOTIVE';
  if (/krawiec|szwal|tekstyl/i.test(t)) return 'TEXTILE';
  if (/pielęgniar|opiekun|sanitari|szpital|zdrowot/i.test(t)) return 'HEALTHCARE';
  if (/hotel|sprzątacz|pokojow|pralnia|recepcj/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/ogrodnik|rolni|leśni|sadown/i.test(t)) return 'AGRICULTURE';
  if (/ochroniar|portier|dozorca|straż/i.test(t)) return 'SECURITY_SERVICES';
  if (/konserwator|gospodarczy|woźn|utrzyman/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/spawacz|ślusarz|tokarz|frezer|cnc|lakiernik|blacharz|kowal/i.test(t)) return 'METAL_STEEL';
  if (/elektryk|hydraulik|instalat|serwisant/i.test(t)) return 'CONSTRUCTION'; // electricians/plumbers
  return 'OTHER';
}

// ─── Source management ───────────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'PL', name: { contains: 'CBOP' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'CBOP', market: 'PL' },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'CBOP',
          slug: `cbop-centralna-baza-ofert-pracy-${Date.now().toString(36)}`,
          market: 'PL',
          sector: 'OTHER',
          websiteUrl: 'https://oferty.praca.gov.pl',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'CBOP Centralna Baza Ofert Pracy',
        type: 'GOVERNMENT',
        crawlMethod: 'API',
        market: 'PL',
        companyId: company.id,
        seedUrls: ['https://oferty.praca.gov.pl'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── API fetch ───────────────────────────────────────────────────────

async function fetchPage(page: number, criteria: any[] = []): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const url = `${API_BASE}?page=${page}&size=${PAGE_SIZE}&sort=dataDodania,DESC`;
    const resp = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({ kryteria: criteria }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Salary parsing ─────────────────────────────────────────────────

function parseSalary(wynagrodzenie: any): { min: number | null; max: number | null } {
  if (!wynagrodzenie) return { min: null, max: null };

  const text = typeof wynagrodzenie === 'string' ? wynagrodzenie : JSON.stringify(wynagrodzenie);
  const match = text.match(/([0-9]+[.,]?[0-9]*)\s*[-–]\s*([0-9]+[.,]?[0-9]*)/);
  if (match) {
    return {
      min: Math.round(parseFloat(match[1].replace(',', '.'))),
      max: Math.round(parseFloat(match[2].replace(',', '.'))),
    };
  }

  const single = text.match(/([0-9]+[.,]?[0-9]*)/);
  if (single) {
    const val = Math.round(parseFloat(single[1].replace(',', '.')));
    return { min: val, max: val };
  }

  return { min: null, max: null };
}

// ─── Import ──────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🇵🇱 Mavi Yaka — CBOP Bulk Import (Poland)`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  // First, get total count
  const countResp = await fetchPage(0, []);
  const totalElements = countResp?.payload?.ofertyPracyPage?.totalElements || 0;
  const totalPages = Math.min(Math.ceil(totalElements / PAGE_SIZE), MAX_PAGES);
  console.log(`Total offers: ${totalElements.toLocaleString()}`);
  console.log(`Pages to fetch: ${totalPages}\n`);

  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let batch: any[] = [];

  for (let page = 0; page < totalPages; page++) {
    try {
      const data = await fetchPage(page, []);
      const items = data?.payload?.ofertyPracyPage?.content || [];

      if (items.length === 0) {
        console.log(`Page ${page}: empty, stopping`);
        break;
      }

      for (const item of items) {
        const jobId = String(item.id || '');
        const title = item.stanowisko || '';

        if (!jobId || !title) { totalSkipped++; continue; }
        if (seen.has(jobId)) { totalSkipped++; continue; }
        seen.add(jobId);
        totalFetched++;

        // Blue-collar filter
        const desc = item.zakresObowiazkow || item.wymagania || '';
        if (!isBlueCollar(title, desc)) {
          totalSkipped++;
          continue;
        }

        const jobUrl = `https://oferty.praca.gov.pl/portal/index.cbop#/szczegolyOferty/${jobId}`;
        const canonicalUrl = jobUrl.toLowerCase();
        const fingerprint = md5(`cbop:PL:${jobId}`);
        const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

        const employer = item.pracodawca || null;
        const location = item.miejscePracy || null;
        const salary = parseSalary(item.wynagrodzenie);

        const description = [
          desc,
          item.wymagania ? `Wymagania: ${item.wymagania}` : '',
          item.rodzajUmowy ? `Umowa: ${item.rodzajUmowy}` : '',
        ].filter(Boolean).join('\n').substring(0, 5000) || null;

        batch.push({
          title,
          slug,
          sourceUrl: jobUrl,
          canonicalUrl,
          fingerprint,
          companyId: source.companyId,
          sourceId: source.id,
          country: 'PL' as Market,
          city: location,
          sector: detectSector(title, desc),
          description,
          salaryMin: salary.min,
          salaryMax: salary.max,
          postedDate: item.dataDodaniaCbop ? new Date(item.dataDodaniaCbop) : null,
          lastSeenAt: new Date(),
          status: 'ACTIVE' as JobStatus,
        });

        if (batch.length >= 500) {
          const result = await flushBatch(batch);
          totalInserted += result;
          batch = [];
        }
      }

      if ((page + 1) % 20 === 0) {
        console.log(`Page ${page + 1}/${totalPages}: ${totalFetched.toLocaleString()} fetched, ${totalInserted.toLocaleString()} inserted`);
      }

      await delay(REQUEST_DELAY_MS);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes('429')) {
        console.warn(`Page ${page}: Rate limited, waiting 60s...`);
        await delay(60_000);
        page--; // retry
      } else {
        console.warn(`Page ${page}: ${msg.substring(0, 100)}`);
        totalErrors++;
        if (totalErrors > 10) {
          console.error('Too many errors, stopping');
          break;
        }
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    totalInserted += result;
  }

  await prisma.$disconnect();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Unique: ${seen.size.toLocaleString()}`);
  console.log(`  Fetched: ${totalFetched.toLocaleString()}`);
  console.log(`  Inserted: ${totalInserted.toLocaleString()}`);
  console.log(`  Skipped: ${totalSkipped.toLocaleString()}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

main().catch(console.error);
