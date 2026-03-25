/**
 * bulk-import-arbetsformedlingen.ts — Bulk Import from Swedish Arbetsförmedlingen (JobTech)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-arbetsformedlingen.ts
 *
 * API: https://jobsearch.api.jobtechdev.se/
 * - No authentication required (open API)
 * - Max 100 results per page, offset 0-2000
 * - ~148K total jobs available
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const API_BASE = 'https://jobsearch.api.jobtechdev.se/search';
const RESULTS_PER_PAGE = 100; // API max
const MAX_OFFSET = 2000; // API limit
const REQUEST_DELAY_MS = 300;
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
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/[çć]/g, 'c').replace(/[şś]/g, 's').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Sector detection (Swedish) ─────────────────────────────────────

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/lager|terminal|logistik|transport|chaufför|lastbil|bud|leverans|gods|spedition|truck/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/produktion|tillverkning|fabrik|maskin|montering|industri|cnc|svets/i.test(t)) return 'MANUFACTURING';
  if (/butik|kassa|sälj|handel|detaljhandel|varuhus|livsmedel|mataffär/i.test(t)) return 'RETAIL';
  if (/bygg|mur|snick|taklägg|plåt|betong|anlägg|schakt|golvlägg|målare|rörmokare|vvs/i.test(t)) return 'CONSTRUCTION';
  if (/kock|restaurang|kök|bagare|slaktare|servitör|bartender|café|catering|disk/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mekaniker|bilverkstad|fordon|motor|däck|lack|kaross/i.test(t)) return 'AUTOMOTIVE';
  if (/textil|söm|sömmerska|skräddare|tyg/i.test(t)) return 'TEXTILE';
  if (/gruva|energi|kraft|el.*verk|solcell|vindkraft/i.test(t)) return 'MINING_ENERGY';
  if (/vård|sjukvård|omsorg|sjuksköterska|undersköterska|hemtjänst|äldreboende|vårdbiträde/i.test(t)) return 'HEALTHCARE';
  if (/hotell|städ|turism|reception|husföreståndarinna|tvätt/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/jordbruk|lantbruk|trädgård|skog|djur|grönytor|parkarbetare|växtodling/i.test(t)) return 'AGRICULTURE';
  if (/vakt|bevakning|säkerhet|ordningsvakt|väktare/i.test(t)) return 'SECURITY_SERVICES';
  if (/fastighet|städare|vaktmästare|underhåll|fastighetsskötare|renhållning/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metall|stål|svets|smed|gjut|plåtslagare|cnc|dreh/i.test(t)) return 'METAL_STEEL';
  if (/kemi|plast|gummi|läkemedel|laborant/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/tele|kabel|fiber|nät|antenn/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Swedish blue-collar search queries ──────────────────────────────

const SEARCH_QUERIES = [
  // Warehouse & Logistics
  'lagerarbetare', 'truckförare', 'lastbilschaufför', 'budbilsförare', 'terminalarbetare',
  'godshantering', 'orderplock', 'lagermedarbetare', 'leveransförare', 'distributionsförare',
  // Cleaning & Facility
  'städare', 'lokalvårdare', 'fastighetsskötare', 'vaktmästare', 'renhållningsarbetare',
  // Food & Hospitality
  'kock', 'köksbiträde', 'diskare', 'bagare', 'slaktare', 'servitör', 'barista',
  'restaurangbiträde', 'kafépersonal', 'cateringmedarbetare', 'hotellstädare',
  // Construction & Trades
  'byggnadsarbetare', 'snickare', 'målare', 'murare', 'takläggare', 'rörmokare',
  'VVS-montör', 'plåtslagare', 'betongarbetare', 'anläggningsarbetare', 'golvläggare',
  'ställningsbyggare', 'isoleringsmontör', 'glasmästare',
  // Manufacturing & Production
  'maskinoperatör', 'produktionsmedarbetare', 'montör', 'svetsare', 'CNC-operatör',
  'processoperatör', 'industriarbetare', 'kvalitetskontrollant', 'förpackningsarbetare',
  // Electrical & Technical
  'elektriker', 'installationselektriker', 'kyltekniker', 'servicetekniker',
  'underhållstekniker', 'mekatroniker',
  // Auto & Mechanic
  'mekaniker', 'bilmekaniker', 'fordonstekniker', 'lastbilsmekaniker', 'däcktekniker',
  // Healthcare Support
  'undersköterska', 'vårdbiträde', 'hemtjänst', 'personlig assistent',
  // Agriculture & Outdoors
  'trädgårdsarbetare', 'lantbruksarbetare', 'skogsarbetare', 'parkarbetare', 'djurskötare',
  // Security & Other
  'väktare', 'ordningsvakt', 'brevbärare', 'sophämtare', 'bussförare', 'taxiförare',
];

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'SE', name: { contains: 'Arbetsförmedlingen' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Arbetsförmedlingen', market: 'SE' },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `arbetsformedlingen-gov-se-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'Arbetsförmedlingen',
          slug: uniqueSlug,
          market: 'SE',
          sector: 'OTHER',
          websiteUrl: 'https://arbetsformedlingen.se',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'Arbetsförmedlingen Job Listings',
        type: 'GOVERNMENT',
        crawlMethod: 'API',
        market: 'SE',
        companyId: company.id,
        seedUrls: ['https://jobsearch.api.jobtechdev.se/search'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── API fetch ───────────────────────────────────────────────────────

async function fetchJobs(query: string, offset: number): Promise<any> {
  const params = new URLSearchParams({
    q: query,
    limit: String(RESULTS_PER_PAGE),
    offset: String(offset),
    resdet: 'full',
  });

  const url = `${API_BASE}?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
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
  console.log(`\n🇸🇪 Mavi Yaka — Arbetsförmedlingen Bulk Import`);
  console.log(`Queries: ${SEARCH_QUERIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const query of SEARCH_QUERIES) {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchJobs(query, offset);
        const total = data.total?.value || 0;
        const hits = data.hits || [];

        stats.fetched += hits.length;

        for (const job of hits) {
          const jobId = job.id || '';
          if (!jobId || seen.has(jobId)) { stats.skipped++; continue; }
          seen.add(jobId);

          const title = job.headline || query;
          const sourceUrl = job.webpage_url || `https://arbetsformedlingen.se/platsbanken/annonser/${jobId}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`af:${jobId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          // Location
          const addr = job.workplace_address || {};
          const city = addr.municipality || addr.city || null;
          const state = addr.region || null;
          const lat = addr.coordinates?.[1] || null; // [lon, lat]
          const lon = addr.coordinates?.[0] || null;

          // Description
          const descText = job.description?.text || '';
          const description = descText.substring(0, 5000) || null;

          // Dates
          const postedDate = job.publication_date ? new Date(job.publication_date) : null;

          // Blue-collar filter
          if (!isBlueCollar(title, description)) {
            stats.skipped++;
            continue;
          }

          // Employer name
          const employerName = job.employer?.name || '';
          const fullTitle = employerName ? `${title} — ${employerName}` : title;

          batch.push({
            title: fullTitle.substring(0, 500),
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: 'SE' as Market,
            city,
            state,
            latitude: lat,
            longitude: lon,
            sector: detectSector(title, description),
            description,
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

        hasMore = hits.length === RESULTS_PER_PAGE && offset + RESULTS_PER_PAGE <= MAX_OFFSET;
        offset += RESULTS_PER_PAGE;

        await delay(REQUEST_DELAY_MS);

        if (hits.length > 0 && offset <= RESULTS_PER_PAGE) {
          console.log(`  "${query}": ${total.toLocaleString()} total, fetching...`);
        }
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          console.warn(`  Rate limited, waiting 30s...`);
          await delay(30_000);
        } else {
          console.warn(`  "${query}" offset=${offset}: ${msg.substring(0, 100)}`);
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
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

main().catch(console.error);
