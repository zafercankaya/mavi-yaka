/**
 * bulk-import-iskur.ts — Bulk Import from Turkish İŞKUR (Government Employment Agency)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-iskur.ts
 *
 * Source: https://esube.iskur.gov.tr/Istihdam/AcikIsIlanAra.aspx
 * - ASP.NET WebForms — requires Playwright (headless) for JS rendering
 * - ~26K active listings, 15 per page
 * - No authentication required for listing pages
 * - Employer names hidden (requires login), but job titles + locations available
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { chromium, Page } from 'playwright';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const BASE_URL = 'https://esube.iskur.gov.tr/Istihdam/AcikIsIlanAra.aspx';
const DETAIL_BASE = 'https://esube.iskur.gov.tr/Istihdam/AcikIsIlanDetay.aspx';
const MAX_PAGES = 600; // 600 × 15 = 9,000 listings
const PAGE_DELAY_MS = 2000; // 2 sec between pages

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ç/g, 'c')
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Sector detection (Turkish) ──────────────────────────────────────

function detectSector(title: string): Sector {
  const t = title.toLowerCase();
  if (/depo|forklift|şoför|kurye|nakliye|lojistik|dağıtım|tır|kamyon|ambalaj|paketleme|sevk/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/üretim|fabrika|makine|montaj|operatör|imalat|cnc|torna|freze|kalıp/i.test(t)) return 'MANUFACTURING';
  if (/satış.*eleman|kasiyer|mağaza|market|reyon|tezgahtar/i.test(t)) return 'RETAIL';
  if (/inşaat|kalfa|usta|beton|duvar|sıva|boyacı|tesisatçı|döşemeci|çatı|demir/i.test(t)) return 'CONSTRUCTION';
  if (/aşçı|garson|mutfak|fırıncı|pasta|kasap|lokanta|restoran|cafe|bulaşık/i.test(t)) return 'FOOD_BEVERAGE';
  if (/oto.*tamirci|kaportacı|boyacı.*oto|mekaniker|lastikçi|oto.*elektrik/i.test(t)) return 'AUTOMOTIVE';
  if (/tekstil|dikiş|terzi|konfeksiyon|kumaş|örme/i.test(t)) return 'TEXTILE';
  if (/maden|enerji|elektrik.*santral|petrol|doğalgaz/i.test(t)) return 'MINING_ENERGY';
  if (/hasta.*bakıcı|hemşire|sağlık|hastane|bakım/i.test(t)) return 'HEALTHCARE';
  if (/otel|temizlik|kat.*hizmet|resepsiyon|çamaşır/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/tarım|çiftçi|traktör|hayvancılık|sera|bahçe|ziraat/i.test(t)) return 'AGRICULTURE';
  if (/güvenlik|bekçi|koruma/i.test(t)) return 'SECURITY_SERVICES';
  if (/apartman|kapıcı|temizlik.*eleman|hizmetli|beden.*işçi/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/kaynak|metal|döküm|demirci|çelik|tornacı|tesviye/i.test(t)) return 'METAL_STEEL';
  if (/kimya|plastik|boya.*eleman|ilaç|laboratuvar/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/telekom|kablo|fiber|hatçı/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'TR', name: { contains: 'İŞKUR' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: { contains: 'İŞKUR' }, market: 'TR' },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `iskur-gov-tr-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'İŞKUR (Türkiye İş Kurumu)',
          slug: uniqueSlug,
          market: 'TR',
          sector: 'OTHER',
          websiteUrl: 'https://www.iskur.gov.tr',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'İŞKUR Government Job Listings',
        type: 'GOVERNMENT',
        crawlMethod: 'HTML',
        market: 'TR',
        companyId: company.id,
        seedUrls: ['https://esube.iskur.gov.tr/Istihdam/AcikIsIlanAra.aspx'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── Extract jobs from page ──────────────────────────────────────────

interface RawJob {
  id: string;
  title: string;
  location: string;
}

async function extractJobsFromPage(page: Page): Promise<RawJob[]> {
  // Use $$eval with string-typed return to avoid DOM type issues
  const rows = await page.$$eval('tr', (trs: any[]) => {
    return trs.map((tr: any) => {
      const cells = tr.querySelectorAll('td');
      if (cells.length < 2) return null;
      const rowHtml = tr.innerHTML;
      const idMatch = rowHtml.match(/uiID=(\d+)/);
      if (!idMatch) return null;
      return {
        id: idMatch[1],
        title: cells[0]?.textContent?.trim() || '',
        locText: cells[1]?.textContent?.trim() || '',
      };
    }).filter(Boolean);
  });

  const jobs: RawJob[] = [];
  for (const row of rows as any[]) {
    if (!row) continue;
    const locMatch = (row.locText || '').match(/Çalışma\s*Yeri\s*:\s*([^)]+)/i);
    const location = locMatch ? locMatch[1].trim() : '';
    jobs.push({ id: row.id, title: row.title, location });
  }

  return jobs;
}

// ─── Main import ─────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function main() {
  console.log(`\n🇹🇷 Mavi Yaka — İŞKUR Bulk Import (Playwright)`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let batch: any[] = [];

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Load search page
    console.log('Loading İŞKUR search page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForTimeout(3000);

    // Click search button (Ara)
    console.log('Clicking Ara (Search)...');
    await page.click('#ctl04_ctlAcikIsPageCommand_CommandItem_Search');
    await page.waitForTimeout(5000);

    // Process pages
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      const jobs = await extractJobsFromPage(page);

      if (jobs.length === 0) {
        console.log(`Page ${pageNum}: No jobs found, stopping.`);
        break;
      }

      stats.fetched += jobs.length;

      for (const job of jobs) {
        if (seen.has(job.id)) { stats.skipped++; continue; }
        seen.add(job.id);

        const sourceUrl = `${DETAIL_BASE}?uiID=${job.id}`;
        const canonicalUrl = sourceUrl.toLowerCase();
        const fingerprint = md5(`iskur:${job.id}`);
        const slug = `${slugify(job.title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

        // Blue-collar filter
        if (!isBlueCollar(job.title, null)) {
          stats.skipped++;
          continue;
        }

        // Parse location: "İSTANBUL / MALTEPE" → city=MALTEPE, state=İSTANBUL
        let city: string | null = null;
        let state: string | null = null;
        if (job.location) {
          const parts = job.location.split('/').map(s => s.trim());
          state = parts[0] || null;
          city = parts[1] || null;
        }

        batch.push({
          title: job.title.substring(0, 500),
          slug,
          sourceUrl,
          canonicalUrl,
          fingerprint,
          companyId: source.companyId,
          sourceId: source.id,
          country: 'TR' as Market,
          city,
          state,
          sector: detectSector(job.title),
          description: `İŞKUR İlan No: ${job.id}\nMeslek: ${job.title}\nÇalışma Yeri: ${job.location}`,
          lastSeenAt: new Date(),
          status: 'ACTIVE' as JobStatus,
        });

        if (batch.length >= 200) {
          const result = await flushBatch(batch);
          stats.inserted += result;
          batch = [];
        }
      }

      if (pageNum % 20 === 0) {
        console.log(`Page ${pageNum}: ${stats.fetched} fetched, ${stats.inserted} inserted, ${seen.size} unique`);
      }

      // Navigate to next page via PostBack
      try {
        await page.evaluate(`__doPostBack('ctl04$ctlDataPagerDetay$btnNext', '')`);
        await page.waitForTimeout(PAGE_DELAY_MS);

        // Wait for content to update
        await page.waitForSelector('tr td', { timeout: 15_000 }).catch(() => {});

      } catch (e) {
        console.warn(`Navigation error on page ${pageNum}: ${(e as Error).message?.substring(0, 100)}`);
        stats.errors++;
        break;
      }
    }
  } finally {
    await browser.close();
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
