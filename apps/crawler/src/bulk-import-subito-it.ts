/**
 * bulk-import-subito-it.ts — Bulk Import from Subito.it (Italy)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-subito-it.ts
 *
 * Subito.it is Italy's largest classifieds site with 45K+ job listings.
 * Uses Next.js server-side rendering — job data embedded in __NEXT_DATA__ JSON.
 * Category 26 = "Offerte di lavoro"
 * Subcategories: 117 (Produzione/Operai), 100 (Logistica/Trasporti),
 *   123 (Turismo/Ristorazione), 99 (Pulizie/Colf/Badanti)
 *
 * Pagination: ?o=1, ?o=2, etc.
 * No auth required. Respectful crawling with delays.
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const REQUEST_DELAY_MS = 1500; // Respectful delay
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_PAGES = 50; // 50 pages × ~30 results = ~1,500 per category
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãå]/g, 'a').replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõø]/g, 'o').replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

function detectSector(title: string, category?: string): Sector {
  const t = `${title} ${category || ''}`.toLowerCase();
  if (/magazzin|logistic|autista|corriere|facchino|camionista|mulettista|carrellista|trasport|spedizion/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/operaio|produzion|fabbrica|montaggio|assemblat|confezion|saldator|tornitore/i.test(t)) return 'MANUFACTURING';
  if (/commess|cassier|venditor|negozio|scaffalista|store/i.test(t)) return 'RETAIL';
  if (/muratore|piastrellista|imbianchino|carpentier|idraulico|elettricista|manovale|edil|cantiere/i.test(t)) return 'CONSTRUCTION';
  if (/cuoco|aiuto cuoco|camerier|barista|pizzaiolo|panettier|pasticcer|ristorante|macellaio|chef/i.test(t)) return 'FOOD_BEVERAGE';
  if (/meccanico.*auto|carrozzier|gommista|officina/i.test(t)) return 'AUTOMOTIVE';
  if (/sart|cucit|tessil/i.test(t)) return 'TEXTILE';
  if (/infermier|ospedal|sanitari|assistente.*anzian|badante|oss/i.test(t)) return 'HEALTHCARE';
  if (/hotel|pulizie|lavapiatti|housekeep|albergo/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/giardinier|agricol|bracciante|vivaio/i.test(t)) return 'AGRICULTURE';
  if (/guardia|vigilanza|portier|sicurezza/i.test(t)) return 'SECURITY_SERVICES';
  if (/bidello|custode|manutenzione|portinai/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/saldator|fabbro|lattonier|metall|acciaio/i.test(t)) return 'METAL_STEEL';
  return 'OTHER';
}

// ─── Subito.it search URLs ─────────────────────────────────────────
// Blue-collar subcategories + keyword searches

interface SearchConfig {
  name: string;
  url: string; // Base URL without pagination
}

const SEARCH_CONFIGS: SearchConfig[] = [
  // Category-based
  { name: 'Produzione/Operai', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?categories=117' },
  { name: 'Logistica/Trasporti', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?categories=100' },
  { name: 'Turismo/Ristorazione', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?categories=123' },
  { name: 'Pulizie/Badanti', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?categories=99' },
  // Keyword-based searches for blue-collar
  { name: 'operaio', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=operaio' },
  { name: 'magazziniere', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=magazziniere' },
  { name: 'autista', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=autista' },
  { name: 'muratore', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=muratore' },
  { name: 'cuoco', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=cuoco' },
  { name: 'cameriere', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=cameriere' },
  { name: 'pulizie', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=pulizie' },
  { name: 'saldatore', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=saldatore' },
  { name: 'elettricista', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=elettricista' },
  { name: 'meccanico', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=meccanico' },
  { name: 'idraulico', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=idraulico' },
  { name: 'carpentiere', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=carpentiere' },
  { name: 'badante', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=badante' },
  { name: 'giardiniere', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=giardiniere' },
  { name: 'guardia giurata', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=guardia+giurata' },
  { name: 'pizzaiolo', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=pizzaiolo' },
  { name: 'barista', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=barista' },
  { name: 'corriere', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=corriere' },
  { name: 'mulettista', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=mulettista' },
  { name: 'imbianchino', url: 'https://www.subito.it/annunci-italia/vendita/offerte-lavoro/?q=imbianchino' },
];

// ─── Source management ───────────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'IT', name: { contains: 'Subito' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Subito.it', market: 'IT' },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Subito.it',
          slug: `subito-it-${Date.now().toString(36)}`,
          market: 'IT',
          sector: 'OTHER',
          websiteUrl: 'https://www.subito.it',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'Subito.it Job Listings',
        type: 'JOB_PLATFORM',
        crawlMethod: 'HTML',
        market: 'IT',
        companyId: company.id,
        seedUrls: ['https://www.subito.it/annunci-italia/vendita/offerte-lavoro/'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── HTML fetch & parse ──────────────────────────────────────────────

async function fetchPage(url: string): Promise<any[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();

    // Extract __NEXT_DATA__ JSON
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!nextDataMatch) {
      // Fallback: try to extract from embedded JSON-LD or item data
      const items = extractItemsFromHtml(html);
      return items;
    }

    try {
      const nextData = JSON.parse(nextDataMatch[1]);
      // Navigate to items list in the Next.js data structure
      const props = nextData?.props?.pageProps;
      if (!props) return [];

      // Try different paths where items might be
      const items = props?.initialState?.items?.list
        || props?.items?.list
        || props?.searchResult?.items
        || props?.ads
        || [];

      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  } finally {
    clearTimeout(timeout);
  }
}

function extractItemsFromHtml(html: string): any[] {
  // Fallback: extract job listings from HTML structure
  const items: any[] = [];
  const itemRegex = /<a[^>]*href="(https:\/\/www\.subito\.it\/[^"]+)"[^>]*class="[^"]*SmallCard[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const url = match[1];
    const content = match[2];
    const titleMatch = content.match(/<h2[^>]*>(.*?)<\/h2>/);
    if (titleMatch) {
      items.push({
        subject: titleMatch[1].replace(/<[^>]+>/g, '').trim(),
        urls: { default: url },
        urn: md5(url),
      });
    }
  }
  return items;
}

// ─── Import logic ────────────────────────────────────────────────────

async function main() {
  console.log(`\n🇮🇹 Mavi Yaka — Subito.it Bulk Import (Italy)`);
  console.log(`Searches: ${SEARCH_CONFIGS.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  let batch: any[] = [];

  for (const config of SEARCH_CONFIGS) {
    console.log(`\n[${config.name}] Starting...`);
    let pageNum = 1;
    let pageItems = 0;
    let consecutiveEmpty = 0;

    while (pageNum <= MAX_PAGES) {
      try {
        const separator = config.url.includes('?') ? '&' : '?';
        const pageUrl = pageNum === 1 ? config.url : `${config.url}${separator}o=${pageNum}`;

        const items = await fetchPage(pageUrl);

        if (items.length === 0) {
          consecutiveEmpty++;
          if (consecutiveEmpty >= 2) break; // 2 empty pages = done
          pageNum++;
          await delay(REQUEST_DELAY_MS);
          continue;
        }
        consecutiveEmpty = 0;

        for (const item of items) {
          const title = item.subject || item.title || '';
          const itemUrl = item.urls?.default || item.url || '';
          const itemId = item.urn || item.id || md5(itemUrl);

          if (!title || !itemUrl) { totalSkipped++; continue; }
          if (seen.has(String(itemId))) { totalSkipped++; continue; }
          seen.add(String(itemId));

          totalFetched++;

          // Blue-collar filter
          if (!isBlueCollar(title, item.body || '')) {
            totalSkipped++;
            continue;
          }

          const canonicalUrl = itemUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`subito:IT:${itemId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const desc = (item.body || item.snippet || '').substring(0, 5000) || null;
          const company = item.advertiser?.name || item.company || null;
          const city = item.geo?.town || item.geo?.city || item.location || null;
          const category = item.features?.['/job_category']?.values?.[0]?.value || '';

          batch.push({
            title,
            slug,
            sourceUrl: itemUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: 'IT' as Market,
            city,
            sector: detectSector(title, category),
            description: desc,
            postedDate: item.date ? new Date(item.date) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            totalInserted += result;
            batch = [];
          }
        }

        pageItems += items.length;
        pageNum++;
        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429') || msg.includes('403')) {
          console.warn(`  [${config.name}] Rate limited, waiting 120s...`);
          await delay(120_000);
        } else {
          console.warn(`  [${config.name}] p${pageNum}: ${msg.substring(0, 100)}`);
          totalErrors++;
          break;
        }
      }
    }

    console.log(`[${config.name}] Done: ${pageItems} items from ${pageNum - 1} pages`);
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
