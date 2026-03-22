/**
 * bulk-import-iskur.ts — Bulk Import from Turkish İŞKUR (Government Employment Agency)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-iskur.ts
 *
 * Source: https://esube.iskur.gov.tr/Istihdam/AcikIsIlanAra.aspx
 * - ASP.NET WebForms (ViewState/PostBack pagination)
 * - ~26K active listings, 15 per page
 * - No authentication required for listing pages
 * - Employer names hidden (requires login), but job titles + locations available
 * - Uses HTTP requests with ViewState chain (no Playwright needed)
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const BASE_URL = 'https://esube.iskur.gov.tr/Istihdam/AcikIsIlanAra.aspx';
const DETAIL_URL = 'https://esube.iskur.gov.tr/Istihdam/AcikIsIlanDetay.aspx';
const MAX_PAGES = 500; // 500 × 15 = 7,500 listings max
const REQUEST_DELAY_MS = 1000; // 1 req/sec to be respectful
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
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/[çć]/g, 'c').replace(/[şś]/g, 's').replace(/ğ/g, 'g')
    .replace(/ı/g, 'i').replace(/İ/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Sector detection (Turkish) ──────────────────────────────────────

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/depo|forklift|şoför|kurye|nakliye|lojistik|dağıtım|tır|kamyon|ambalaj|paketleme|sevk/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/üretim|fabrika|makine|montaj|operatör|imalat|cnc|torna|freze|kalıp/i.test(t)) return 'MANUFACTURING';
  if (/satış.*eleman|kasiyer|mağaza|market|reyon|tezgahtar/i.test(t)) return 'RETAIL';
  if (/inşaat|kalfa|usta|beton|duvar|sıva|boyacı|tesisatçı|döşemeci|çatı|demir/i.test(t)) return 'CONSTRUCTION';
  if (/aşçı|garson|mutfak|fırıncı|pasta|kasap|lokanta|restoran|cafe|bulaşık/i.test(t)) return 'FOOD_BEVERAGE';
  if (/oto.*tamirci|kaportacı|boyacı.*oto|mekaniker|lastikçi|oto.*elektrik/i.test(t)) return 'AUTOMOTIVE';
  if (/tekstil|dikiş|terzi|konfeksiyon|kumaş|örme/i.test(t)) return 'TEXTILE';
  if (/maden|enerji|elektrik.*santral|petrol|doğalgaz/i.test(t)) return 'MINING_ENERGY';
  if (/hasta.*bakıcı|hemşire|sağlık|hastane/i.test(t)) return 'HEALTHCARE';
  if (/otel|temizlik|kat.*hizmet|resepsiyon|çamaşır/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/tarım|çiftçi|traktör|hayvancılık|sera|bahçe|ziraat/i.test(t)) return 'AGRICULTURE';
  if (/güvenlik|bekçi|koruma/i.test(t)) return 'SECURITY_SERVICES';
  if (/apartman|kapıcı|temizlik.*eleman|hizmetli/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/kaynak|metal|döküm|demirci|çelik|tornacı|tesviye/i.test(t)) return 'METAL_STEEL';
  if (/kimya|plastik|boya|ilaç|laboratuvar/i.test(t)) return 'CHEMICALS_PLASTICS';
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
        crawlMethod: 'SCRAPING',
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

// ─── HTML parsing helpers ────────────────────────────────────────────

function extractHiddenField(html: string, fieldName: string): string {
  const regex = new RegExp(`name="${fieldName}"[^>]*value="([^"]*)"`, 'i');
  const match = html.match(regex);
  return match ? match[1] : '';
}

function extractJobsFromHtml(html: string): Array<{
  id: string;
  title: string;
  location: string;
  employerType: string;
  workType: string;
  schedule: string;
  positions: number;
  deadline: string;
}> {
  const jobs: any[] = [];

  // Each job is in a div/row with the uiID parameter
  // Pattern: AcikIsIlanDetay.aspx?uiID=XXXXXXX
  const idRegex = /AcikIsIlanDetay\.aspx\?uiID=(\d+)/g;
  let match;
  const ids: string[] = [];
  while ((match = idRegex.exec(html)) !== null) {
    if (!ids.includes(match[1])) ids.push(match[1]);
  }

  // Extract job info from the grid rows
  // İŞKUR uses a table/grid with specific structure
  // We'll extract based on the pattern of the listing page

  // Try to extract title/occupation from the grid
  // The page has rows with occupation names, locations, etc.
  // Pattern: <span...>Job Title</span> followed by location info

  // Simple extraction: get all text between job ID links
  for (const id of ids) {
    // Find the section around this ID
    const idIndex = html.indexOf(`uiID=${id}`);
    if (idIndex === -1) continue;

    // Get surrounding HTML (±2000 chars around the ID)
    const start = Math.max(0, idIndex - 1500);
    const end = Math.min(html.length, idIndex + 1500);
    const section = html.substring(start, end);

    // Extract text content from spans/cells
    const textParts: string[] = [];
    const spanRegex = /<(?:span|td|div)[^>]*>([^<]+)<\/(?:span|td|div)>/gi;
    let spanMatch;
    while ((spanMatch = spanRegex.exec(section)) !== null) {
      const text = spanMatch[1].trim();
      if (text && text.length > 1 && !text.startsWith('<!--') && !/^[\s\n\r]+$/.test(text)) {
        textParts.push(text);
      }
    }

    // First meaningful text is usually the occupation/title
    const titleCandidate = textParts.find(t => t.length > 3 && !/^\d+$/.test(t) && !t.includes('İlan') && !t.includes('Detay'));
    const title = titleCandidate || `İŞKUR İlan #${id}`;

    // Try to find location (province name)
    const locationCandidate = textParts.find(t =>
      /istanbul|ankara|izmir|bursa|antalya|adana|konya|gaziantep|kocaeli|mersin|diyarbakır|samsun|denizli|şanlıurfa|kayseri|eskişehir|trabzon|sakarya|manisa|malatya|erzurum|van|batman|elazığ|kahramanmaraş|mardin|muğla|tekirdağ|aydın|balıkesir|hatay|ordu|düzce|bolu|çorum|tokat|kastamonu|rize|giresun|afyon|uşak|ağrı|aksaray|bingöl|bitlis|çankırı|ısparta|kırklareli|niğde|siirt|sinop|yozgat|karaman|kilis|muş|nevşehir|osmaniye|şırnak|artvin|bayburt|bilecik|edirne|gümüşhane|hakkari|iğdır|ardahan|bartın|karabük|kırıkkale|kırşehir|tunceli/i.test(t)
    );

    // Work type detection
    const isPartTime = section.includes('Kısmi') || section.includes('Part');
    const isTemporary = section.includes('Geçici') || section.includes('Mevsimlik');

    // Position count
    const posMatch = section.match(/(\d+)\s*(?:Açık\s*Pozisyon|kişi|pozisyon)/i);
    const positions = posMatch ? parseInt(posMatch[1]) : 1;

    // Deadline
    const deadlineMatch = section.match(/(\d{2}\.\d{2}\.\d{4})/);
    const deadline = deadlineMatch ? deadlineMatch[1] : '';

    jobs.push({
      id,
      title,
      location: locationCandidate || '',
      employerType: section.includes('Kamu') ? 'Kamu' : 'Özel',
      workType: isTemporary ? 'Geçici' : 'Daimi',
      schedule: isPartTime ? 'Kısmi Zamanlı' : 'Tam Zamanlı',
      positions,
      deadline,
    });
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
  console.log(`\n🇹🇷 Mavi Yaka — İŞKUR Bulk Import`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let batch: any[] = [];

  // Step 1: Initial GET to get ViewState
  console.log('Fetching initial page...');
  let response = await fetchPage(BASE_URL);
  let html = response;

  let viewState = extractHiddenField(html, '__VIEWSTATE');
  let viewStateGenerator = extractHiddenField(html, '__VIEWSTATEGENERATOR');
  let eventValidation = extractHiddenField(html, '__EVENTVALIDATION');

  if (!viewState) {
    console.error('Failed to get initial ViewState');
    await prisma.$disconnect();
    return;
  }

  // Step 2: Submit search (empty = all results)
  console.log('Submitting search...');
  const searchBody = new URLSearchParams({
    '__VIEWSTATE': viewState,
    '__VIEWSTATEGENERATOR': viewStateGenerator,
    '__EVENTVALIDATION': eventValidation,
    '__EVENTTARGET': '',
    '__EVENTARGUMENT': '',
    'ctl04$ctlArananMetin2': '',
    'ctl04$btnAra': 'İlan Ara',
  });

  html = await postPage(BASE_URL, searchBody.toString());
  viewState = extractHiddenField(html, '__VIEWSTATE');
  viewStateGenerator = extractHiddenField(html, '__VIEWSTATEGENERATOR');
  eventValidation = extractHiddenField(html, '__EVENTVALIDATION');

  // Step 3: Parse pages
  for (let page = 1; page <= MAX_PAGES; page++) {
    const jobs = extractJobsFromHtml(html);

    if (jobs.length === 0) {
      console.log(`Page ${page}: No jobs found, stopping.`);
      break;
    }

    stats.fetched += jobs.length;
    console.log(`Page ${page}: ${jobs.length} jobs`);

    for (const job of jobs) {
      if (seen.has(job.id)) { stats.skipped++; continue; }
      seen.add(job.id);

      const sourceUrl = `${DETAIL_URL}?uiID=${job.id}`;
      const canonicalUrl = sourceUrl.toLowerCase();
      const fingerprint = md5(`iskur:${job.id}`);
      const slug = `${slugify(job.title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

      // Blue-collar filter
      if (!isBlueCollar(job.title, null)) {
        stats.skipped++;
        continue;
      }

      // Parse deadline to date
      let deadline: Date | null = null;
      if (job.deadline) {
        const parts = job.deadline.split('.');
        if (parts.length === 3) {
          deadline = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }

      const description = [
        `İş: ${job.title}`,
        `İl: ${job.location}`,
        `İşveren Tipi: ${job.employerType}`,
        `Çalışma: ${job.workType}, ${job.schedule}`,
        `Pozisyon: ${job.positions}`,
        job.deadline ? `Son Başvuru: ${job.deadline}` : '',
      ].filter(Boolean).join('\n');

      batch.push({
        title: job.title.substring(0, 500),
        slug,
        sourceUrl,
        canonicalUrl,
        fingerprint,
        companyId: source.companyId,
        sourceId: source.id,
        country: 'TR' as Market,
        city: job.location || null,
        sector: detectSector(job.title),
        jobType: job.schedule === 'Kısmi Zamanlı' ? 'PART_TIME' : 'FULL_TIME',
        description: description.substring(0, 5000),
        deadline: deadline && !isNaN(deadline.getTime()) ? deadline : null,
        lastSeenAt: new Date(),
        status: 'ACTIVE' as JobStatus,
      });

      if (batch.length >= 200) {
        const result = await flushBatch(batch);
        stats.inserted += result;
        batch = [];
      }
    }

    // Navigate to next page
    if (page < MAX_PAGES) {
      await delay(REQUEST_DELAY_MS);

      const nextBody = new URLSearchParams({
        '__VIEWSTATE': viewState,
        '__VIEWSTATEGENERATOR': viewStateGenerator,
        '__EVENTVALIDATION': eventValidation,
        '__EVENTTARGET': 'ctl04$ctlDataPagerDetay$btnNext',
        '__EVENTARGUMENT': '',
      });

      try {
        html = await postPage(BASE_URL, nextBody.toString());
        viewState = extractHiddenField(html, '__VIEWSTATE');
        viewStateGenerator = extractHiddenField(html, '__VIEWSTATEGENERATOR');
        eventValidation = extractHiddenField(html, '__EVENTVALIDATION');

        if (!viewState) {
          console.log('Lost ViewState, stopping pagination.');
          break;
        }
      } catch (e) {
        console.warn(`Page ${page + 1} navigation error: ${(e as Error).message?.substring(0, 100)}`);
        stats.errors++;
        break;
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

async function fetchPage(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8',
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function postPage(url: string, body: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8',
      },
      body,
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.text();
  } finally {
    clearTimeout(timeout);
  }
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
