/**
 * bulk-import-jora.ts — Bulk Import from Jora (SEEK) RSS Feeds
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-jora.ts
 *
 * Jora is a free job search engine by SEEK covering APAC markets.
 * RSS feed URL pattern: https://{domain}/j?q={keyword}&l=&mode=rss
 *
 * Markets covered:
 *   AU - au.jora.com
 *   IN - in.jora.com
 *   MY - my.jora.com
 *   PH - ph.jora.com
 *   ID - id.jora.com
 *
 * Each RSS feed returns ~20 items with: title, link, description, pubDate
 */

import 'dotenv/config';
import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const REQUEST_DELAY_MS = 2_000;
const REQUEST_TIMEOUT_MS = 20_000;
const MAX_TOTAL_PER_MARKET = 8_000;

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
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Market config ───────────────────────────────────────────────────

interface MarketConfig {
  market: Market;
  domain: string;
  sourceName: string;
  keywords: string[];
}

const MARKETS: MarketConfig[] = [
  {
    market: 'AU',
    domain: 'au.jora.com',
    sourceName: 'Jora Job Search (AU)',
    keywords: [
      // Warehouse & logistics
      'warehouse worker', 'forklift driver', 'forklift operator', 'picker packer',
      'truck driver', 'delivery driver', 'courier', 'removalist', 'storeperson',
      // Construction & trades
      'labourer', 'construction worker', 'carpenter', 'electrician', 'plumber',
      'welder', 'painter', 'bricklayer', 'concretor', 'scaffolder', 'roofer',
      'tiler', 'plasterer', 'boilermaker', 'fitter', 'steel fixer',
      // Cleaning & facility
      'cleaner', 'cleaning', 'housekeeper', 'janitor', 'groundskeeper',
      // Hospitality & food
      'kitchen hand', 'cook', 'chef', 'dishwasher', 'barista', 'food processing',
      'baker', 'butcher', 'waiter', 'bar staff',
      // Manufacturing
      'factory worker', 'machine operator', 'production worker', 'assembly',
      'process worker', 'manufacturing',
      // Security & other
      'security guard', 'security officer', 'traffic controller',
      'mechanic', 'gardener', 'landscaper', 'farmhand', 'fruit picker',
      'carer', 'aged care worker', 'disability support',
    ],
  },
  {
    market: 'IN',
    domain: 'in.jora.com',
    sourceName: 'Jora Job Search (IN)',
    keywords: [
      // Warehouse & logistics
      'warehouse helper', 'warehouse worker', 'delivery boy', 'delivery driver',
      'driver', 'loader', 'packer', 'courier boy', 'truck driver',
      // Construction & trades
      'mason', 'carpenter', 'electrician', 'plumber', 'welder', 'painter',
      'fitter', 'labourer', 'construction worker', 'steel fixer', 'tiler',
      'helper', 'site supervisor',
      // Cleaning & facility
      'housekeeping', 'cleaner', 'sweeper', 'peon', 'office boy',
      // Food & hospitality
      'cook', 'kitchen helper', 'chef', 'waiter', 'steward', 'baker',
      'food delivery', 'hotel staff',
      // Manufacturing
      'factory worker', 'machine operator', 'production operator',
      'assembly worker', 'quality checker', 'operator',
      // Security & other
      'security guard', 'watchman', 'guard', 'mechanic', 'auto mechanic',
      'tailor', 'gardener', 'technician', 'ac technician',
      // Hindi transliteration keywords
      'driver job', 'helper job', 'packing job', 'loading job',
      'store keeper', 'data entry operator', 'back office',
    ],
  },
  {
    market: 'MY',
    domain: 'my.jora.com',
    sourceName: 'Jora Job Search (MY)',
    keywords: [
      // Warehouse & logistics
      'warehouse worker', 'warehouse assistant', 'forklift operator',
      'driver', 'delivery rider', 'lorry driver', 'despatch',
      'store keeper', 'picker packer',
      // Construction & trades
      'construction worker', 'welder', 'electrician', 'plumber',
      'carpenter', 'painter', 'mason', 'labourer', 'fitter',
      // Cleaning & facility
      'cleaner', 'housekeeping', 'janitor', 'office cleaner',
      // Food & hospitality
      'cook', 'kitchen helper', 'chef', 'barista', 'waiter',
      'food handler', 'baker', 'crew member',
      // Manufacturing
      'factory operator', 'machine operator', 'production operator',
      'assembly operator', 'quality control', 'packing operator',
      'general worker', 'kilang operator',
      // Security & other
      'security guard', 'security officer', 'mechanic', 'technician',
      'air cond technician', 'gardener', 'landscaper',
      // Malay keywords
      'pemandu', 'pengawal keselamatan', 'operator pengeluaran',
      'pekerja am', 'tukang masak',
    ],
  },
  {
    market: 'PH',
    domain: 'ph.jora.com',
    sourceName: 'Jora Job Search (PH)',
    keywords: [
      // Warehouse & logistics
      'warehouse staff', 'warehouse helper', 'delivery rider',
      'rider', 'driver', 'truck driver', 'messenger', 'dispatcher',
      'forklift operator', 'inventory staff',
      // Construction & trades
      'construction worker', 'mason', 'carpenter', 'electrician',
      'plumber', 'welder', 'painter', 'laborer', 'steel man',
      // Cleaning & facility
      'janitor', 'janitress', 'housekeeping', 'cleaner', 'utility worker',
      // Food & hospitality
      'cook', 'kitchen crew', 'chef', 'barista', 'service crew',
      'food attendant', 'baker', 'commissary staff',
      // Manufacturing
      'factory worker', 'machine operator', 'production operator',
      'sewing operator', 'quality inspector', 'packing staff',
      // Security & other
      'security guard', 'guard', 'mechanic', 'auto mechanic',
      'technician', 'aircon technician', 'gardener', 'caretaker',
      // Filipino keywords
      'helper', 'kasambahay', 'crew', 'promodizer', 'merchandiser',
    ],
  },
  {
    market: 'ID',
    domain: 'id.jora.com',
    sourceName: 'Jora Job Search (ID)',
    keywords: [
      // Warehouse & logistics
      'warehouse', 'gudang', 'driver', 'supir', 'kurir', 'pengantar',
      'forklift', 'helper gudang', 'picker',
      // Construction & trades
      'tukang', 'tukang las', 'tukang listrik', 'tukang pipa',
      'tukang kayu', 'tukang cat', 'welder', 'electrician',
      'mandor', 'buruh bangunan',
      // Cleaning & facility
      'cleaning service', 'office boy', 'housekeeping', 'janitor',
      'pramubakti', 'kebersihan',
      // Food & hospitality
      'koki', 'cook', 'kitchen', 'barista', 'waiter', 'waitress',
      'baker', 'pramusaji', 'juru masak',
      // Manufacturing
      'operator produksi', 'operator mesin', 'factory', 'pabrik',
      'quality control', 'packing', 'assembling', 'sewing',
      'helper pabrik',
      // Security & other
      'satpam', 'security', 'teknisi', 'teknisi ac', 'mekanik',
      'montir', 'tukang kebun', 'sopir pribadi',
      // Common Indonesian
      'SPG', 'SPB', 'staff operasional', 'pekerja umum',
    ],
  },
];

// ─── Sector detection (English + local terms) ───────────────────────

function detectSector(title: string, description?: string): Sector {
  const t = `${title} ${description || ''}`.toLowerCase();

  if (/warehouse|forklift|driver|deliver|courier|truck|lorry|transport|logist|despatch|gudang|supir|kurir|removalist|storeperson/i.test(t))
    return 'LOGISTICS_TRANSPORTATION';
  if (/factory|manufactur|production|operator|machine|assembly|pabrik|kilang|process worker/i.test(t))
    return 'MANUFACTURING';
  if (/retail|cashier|store|shop|merchand|promodizer|SPG|SPB/i.test(t))
    return 'RETAIL';
  if (/construct|mason|carpenter|electrician|plumber|welder|painter|labourer|laborer|bricklayer|concretor|scaffolder|roofer|tiler|plasterer|tukang|mandor|buruh|steel.?fix/i.test(t))
    return 'CONSTRUCTION';
  if (/cook|kitchen|chef|baker|butcher|food|barista|waiter|waitress|restaurant|dishwash|pramusaji|koki|juru masak|bar staff/i.test(t))
    return 'FOOD_BEVERAGE';
  if (/mechanic|auto|kfz|workshop|garage|montir|mekanik/i.test(t))
    return 'AUTOMOTIVE';
  if (/sewing|textile|garment|tailor/i.test(t))
    return 'TEXTILE';
  if (/care|aged care|disability|pflege|carer/i.test(t))
    return 'HEALTHCARE';
  if (/hotel|housekeep|clean|janitor|laundry|receptionist|kebersihan|pramubakti|office boy/i.test(t))
    return 'HOSPITALITY_TOURISM';
  if (/garden|farm|landscap|agri|fruit pick|tukang kebun/i.test(t))
    return 'AGRICULTURE';
  if (/security|guard|watchman|satpam|pengawal/i.test(t))
    return 'SECURITY_SERVICES';
  if (/facility|maintenance|groundskeep|janitor|utility/i.test(t))
    return 'FACILITY_MANAGEMENT';
  if (/metal|steel|weld|boilermaker|fitter|blacksmith/i.test(t))
    return 'METAL_STEEL';
  if (/technician|teknisi|aircon|ac tech/i.test(t))
    return 'TELECOMMUNICATIONS';

  return 'OTHER';
}

// ─── RSS XML parsing (regex, no external deps) ──────────────────────

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string | null;
}

function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const titleMatch = block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) ||
                       block.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = block.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/) ||
                      block.match(/<link>([\s\S]*?)<\/link>/);
    const descMatch = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ||
                      block.match(/<description>([\s\S]*?)<\/description>/);
    const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    const title = (titleMatch?.[1] || '').trim();
    const link = (linkMatch?.[1] || '').trim();

    if (!title || !link) continue;

    // Strip HTML tags from description
    const rawDesc = (descMatch?.[1] || '').trim();
    const description = rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    items.push({
      title,
      link,
      description,
      pubDate: dateMatch?.[1]?.trim() || null,
    });
  }

  return items;
}

// ─── Source lookup/creation ──────────────────────────────────────────

const sourceCache = new Map<Market, { id: string; companyId: string }>();

async function getOrCreateSource(config: MarketConfig): Promise<{ id: string; companyId: string }> {
  const cached = sourceCache.get(config.market);
  if (cached) return cached;

  let source = await prisma.crawlSource.findFirst({
    where: { market: config.market, name: config.sourceName, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Jora by SEEK', market: config.market },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `jora-by-seek-${config.market.toLowerCase()}-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'Jora by SEEK',
          slug: uniqueSlug,
          market: config.market,
          sector: 'OTHER',
          websiteUrl: `https://${config.domain}`,
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: config.sourceName,
        type: 'JOB_PLATFORM',
        crawlMethod: 'RSS',
        market: config.market,
        companyId: company.id,
        seedUrls: [`https://${config.domain}/j?q=warehouse&l=&mode=rss`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(config.market, source);
  return source;
}

// ─── Fetch RSS feed ─────────────────────────────────────────────────

async function fetchRSS(domain: string, keyword: string): Promise<RSSItem[]> {
  const url = `https://${domain}/j?q=${encodeURIComponent(keyword)}&l=&mode=rss`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MaviYakaBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const xml = await resp.text();
    return parseRSSItems(xml);
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

async function importMarket(config: MarketConfig): Promise<ImportStats> {
  console.log(`\n--- ${config.market} (${config.domain}) ---`);
  console.log(`  Keywords: ${config.keywords.length}`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource(config);
  const seen = new Set<string>(); // URL dedup within run
  let batch: any[] = [];
  let totalAccepted = 0;

  for (const keyword of config.keywords) {
    if (totalAccepted >= MAX_TOTAL_PER_MARKET) {
      console.log(`  Hard cap reached (${MAX_TOTAL_PER_MARKET.toLocaleString()}), stopping ${config.market}.`);
      break;
    }

    try {
      const items = await fetchRSS(config.domain, keyword);
      stats.fetched += items.length;

      for (const item of items) {
        // Dedup by link
        const canonicalUrl = item.link.split('?')[0].split('#')[0].toLowerCase();
        if (seen.has(canonicalUrl)) { stats.skipped++; continue; }
        seen.add(canonicalUrl);

        const fingerprint = md5(`jora:${canonicalUrl}`);
        const slug = `${slugify(item.title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

        // Blue-collar check
        const searchText = `${item.title} ${item.description}`;
        if (!isBlueCollar(searchText, null)) {
          stats.skipped++;
          continue;
        }

        totalAccepted++;

        // Parse pubDate
        let postedDate: Date | null = null;
        if (item.pubDate) {
          try {
            const d = new Date(item.pubDate);
            if (!isNaN(d.getTime())) postedDate = d;
          } catch { /* ignore */ }
        }

        batch.push({
          title: item.title.substring(0, 500),
          slug,
          sourceUrl: item.link,
          canonicalUrl,
          fingerprint,
          companyId: source.companyId,
          sourceId: source.id,
          country: config.market as Market,
          city: null,
          state: null,
          latitude: null,
          longitude: null,
          sector: detectSector(item.title, item.description),
          description: item.description.substring(0, 5000) || null,
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

      if (items.length > 0) {
        console.log(`  "${keyword}": ${items.length} items`);
      }

      await delay(REQUEST_DELAY_MS);

    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes('429')) {
        console.warn(`  Rate limited on "${keyword}", waiting 30s...`);
        await delay(30_000);
      } else {
        console.warn(`  "${keyword}": ${msg.substring(0, 100)}`);
        stats.errors++;
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  console.log(`  ${config.market} done: fetched=${stats.fetched}, inserted=${stats.inserted}, skipped=${stats.skipped}, errors=${stats.errors}`);
  return stats;
}

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

async function main() {
  console.log(`\nMavi Yaka — Jora (SEEK) RSS Bulk Import`);
  console.log(`Markets: ${MARKETS.map(m => m.market).join(', ')}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const totals: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };

  for (const config of MARKETS) {
    try {
      const stats = await importMarket(config);
      totals.fetched += stats.fetched;
      totals.inserted += stats.inserted;
      totals.skipped += stats.skipped;
      totals.errors += stats.errors;
    } catch (e) {
      console.error(`  ${config.market} FAILED: ${(e as Error).message}`);
      totals.errors++;
    }
  }

  await prisma.$disconnect();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`FINAL STATS (all markets)`);
  console.log(`  Fetched: ${totals.fetched.toLocaleString()}`);
  console.log(`  Inserted: ${totals.inserted.toLocaleString()}`);
  console.log(`  Skipped: ${totals.skipped.toLocaleString()}`);
  console.log(`  Errors: ${totals.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

main().catch(console.error);
