/**
 * bulk-import-eures.ts — Bulk Import from EURES (European Employment Services)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-eures.ts
 *
 * API: https://jva.services.ec.europa.eu/jv-consumer/api/v1/jv/search
 * - No authentication needed (public)
 * - POST with JSON body
 * - Covers 8 EU markets: DE, FR, ES, IT, NL, PL, PT, SE
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const API_URL = 'https://jva.services.ec.europa.eu/jv-consumer/api/v1/jv/search';
const RESULTS_PER_PAGE = 100;
const MAX_PAGES = 10;
const MAX_TOTAL_LISTINGS = 15_000;
const REQUEST_DELAY_MS = 500;
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
    .replace(/ł/g, 'l').replace(/ź/g, 'z').replace(/ż/g, 'z').replace(/ą/g, 'a').replace(/ę/g, 'e')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Market config ──────────────────────────────────────────────────

interface MarketConfig {
  country: string;       // EURES country code
  market: Market;        // Our Market enum
  lang: string;          // Keyword language code for EURES API
  keywords: string[];    // Blue-collar search keywords
}

const MARKET_CONFIGS: MarketConfig[] = [
  {
    country: 'DE', market: 'DE', lang: 'de',
    keywords: [
      'Lagerarbeiter', 'Fahrer', 'Reinigungskraft', 'Koch', 'Schweißer',
      'Elektriker', 'Klempner', 'Mechaniker', 'Produktionshelfer',
    ],
  },
  {
    country: 'FR', market: 'FR', lang: 'fr',
    keywords: [
      'chauffeur', 'magasinier', 'cuisinier', 'soudeur', 'électricien',
      'plombier', 'mécanicien', 'ouvrier',
    ],
  },
  {
    country: 'ES', market: 'ES', lang: 'es',
    keywords: [
      'conductor', 'almacenista', 'cocinero', 'soldador', 'electricista',
      'mecánico', 'operario',
    ],
  },
  {
    country: 'IT', market: 'IT', lang: 'it',
    keywords: [
      'autista', 'magazziniere', 'cuoco', 'saldatore', 'elettricista',
      'meccanico', 'operaio',
    ],
  },
  {
    country: 'NL', market: 'NL', lang: 'nl',
    keywords: [
      'chauffeur', 'magazijnmedewerker', 'kok', 'lasser', 'elektricien',
      'monteur',
    ],
  },
  {
    country: 'PL', market: 'PL', lang: 'pl',
    keywords: [
      'kierowca', 'magazynier', 'kucharz', 'spawacz', 'elektryk',
      'mechanik', 'operator',
    ],
  },
  {
    country: 'PT', market: 'PT', lang: 'pt',
    keywords: [
      'motorista', 'cozinheiro', 'soldador', 'eletricista', 'mecânico',
      'operador',
    ],
  },
  {
    country: 'SE', market: 'SE', lang: 'sv',
    keywords: [
      'chaufför', 'lagerarbetare', 'kock', 'svetsare', 'elektriker',
      'mekaniker',
    ],
  },
];

// English fallback keywords (used for all markets as secondary search)
const EN_KEYWORDS = [
  'warehouse', 'driver', 'cleaner', 'cook', 'welder', 'electrician',
  'plumber', 'carpenter', 'mechanic', 'factory worker', 'forklift',
  'security guard', 'painter', 'baker', 'butcher',
];

// ─── Sector detection (multilingual) ────────────────────────────────

function detectSector(title: string, employer?: string): Sector {
  const t = `${title} ${employer || ''}`.toLowerCase();

  // Logistics & Transportation
  if (/lager|transport|logisti|fahrer|chauffeur|kurier|spedition|versand|kommission|magazijn|magazzin|magasinier|almacen|motorista|kierowca|chaufför|entrepôt|warehouse|driver|forklift/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  // Manufacturing
  if (/produktion|fertigung|fabrik|maschine|montage|industrie|cnc|fräs|usine|fabbrica|fábrica|fabriek|fabryka|fabrik|factory|manufactur|producci|produzion|operario|operaio|ouvrier|operator|produktionshelfer/i.test(t)) return 'MANUFACTURING';
  // Retail
  if (/verkäuf|kasse|handel|einzelhandel|supermarkt|discounter|vendeur|venditore|vendedor|verkoper|sprzedawca|retail|cashier/i.test(t)) return 'RETAIL';
  // Construction
  if (/bau|maurer|zimmer|dachdecker|beton|tiefbau|fliesen|maler|trockenbau|gerüst|construction|chantier|cantiere|obra|bouw|budow|byggnads|carpenter|mason|roofer/i.test(t)) return 'CONSTRUCTION';
  // Food & Beverage
  if (/koch|küche|restaurant|bäcker|fleischer|metzger|kellner|gastronomie|konditor|cuisinier|cuoco|cocinero|kok|kucharz|kock|cook|baker|butcher|chef|kitchen/i.test(t)) return 'FOOD_BEVERAGE';
  // Automotive
  if (/kfz|mechaniker|werkstatt|karosserie|lackier|autoh|mécanicien|meccanico|mecánico|mekaniker|mechanik|mechanic|automotive/i.test(t)) return 'AUTOMOTIVE';
  // Metal & Steel
  if (/metall|stahl|schweiß|schmiede|schlosser|gieß|blech|werkzeug|soudeur|saldatore|soldador|lasser|spawacz|svetsare|welder|metal|steel/i.test(t)) return 'METAL_STEEL';
  // Electrical
  if (/elektri|electronic|électricien|elettricista|electricista|elektricien|elektriker/i.test(t)) return 'TELECOMMUNICATIONS';
  // Healthcare
  if (/pflege|kranken|alten|klinik|hospital|gesundheit|betreuung|infirmier|infermier|enfermero|zorgmedewerker|pielęgniark|sjukvård|healthcare|nurse|care\s*worker/i.test(t)) return 'HEALTHCARE';
  // Hospitality
  if (/hotel|reinigung|hauswirtschaft|wäscherei|housekeeping|nettoyage|pulizia|limpieza|schoonmaak|sprzątanie|städning|cleaner|cleaning|housekeeper/i.test(t)) return 'HOSPITALITY_TOURISM';
  // Agriculture
  if (/garten|landwirtschaft|forst|landschaft|agrar|tierpflege|agricult|jardin|giardini|jardiner|tuinman|ogrodnik|trädgård|farmer|gardener/i.test(t)) return 'AGRICULTURE';
  // Security
  if (/sicherheit|wach|schutz|bewach|pförtner|sécurité|sicurezza|seguridad|beveiliging|ochrona|säkerhet|security|guard/i.test(t)) return 'SECURITY_SERVICES';
  // Facility Management
  if (/gebäude|reinig|hausmeist|facility|müll|entsorg|concierge|portier|janitor|vaktmäst/i.test(t)) return 'FACILITY_MANAGEMENT';
  // Plumbing / HVAC
  if (/klempner|sanitär|heizung|plombier|idraulico|fontaner|loodgieter|hydraulik|rörmokare|plumber/i.test(t)) return 'CONSTRUCTION';
  // Textile
  if (/textil|näh|schneid|polster|couture|tessile|textiel|krawiec|sömmerska/i.test(t)) return 'TEXTILE';

  return 'OTHER';
}

// ─── Source lookup/creation per market ───────────────────────────────

const sourceCache = new Map<Market, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  if (sourceCache.has(market)) return sourceCache.get(market)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'EURES' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'EURES European Job Portal', market },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `eures-european-job-portal-${market.toLowerCase()}-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'EURES European Job Portal',
          slug: uniqueSlug,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://ec.europa.eu/eures',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `EURES European Job Portal (${market})`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: [API_URL],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(market, source);
  return source;
}

// ─── API fetch ──────────────────────────────────────────────────────

async function fetchJobs(keyword: string, country: string, lang: string, page: number): Promise<any> {
  const body = {
    dataSetRequest: {
      excludedDataSources: [],
      pageNumber: page,
      resultsPerPage: RESULTS_PER_PAGE,
      sortBy: 'BEST_MATCH',
    },
    searchCriteria: {
      facetCriteria: [],
      keywordCriteria: {
        keywordLanguageCode: lang,
        keywords: [{ keyword }],
      },
      locationCriteria: {
        locationFilters: [{ country }],
      },
    },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Main import ────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function main() {
  console.log(`\n🇪🇺 Mavi Yaka — EURES European Job Portal Bulk Import`);
  console.log(`Markets: ${MARKET_CONFIGS.map(m => m.market).join(', ')}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const globalStats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const seen = new Set<string>(); // handle dedup across all markets
  const seenTitles = new Map<string, number>(); // base title dedup
  const MAX_PER_TITLE = 2;
  let batch: any[] = [];
  let totalAccepted = 0;

  for (const mc of MARKET_CONFIGS) {
    if (totalAccepted >= MAX_TOTAL_LISTINGS) {
      console.log(`  Hard cap reached (${MAX_TOTAL_LISTINGS.toLocaleString()}), stopping.`);
      break;
    }

    console.log(`\n── ${mc.market} (${mc.country}) ──────────────────────────`);
    const source = await getOrCreateSource(mc.market);
    const marketStats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };

    // Combine local-language keywords + English keywords
    const allKeywords = [...mc.keywords, ...EN_KEYWORDS];
    // Deduplicate keywords (case-insensitive)
    const keywordSet = new Set<string>();
    const keywords: string[] = [];
    for (const kw of allKeywords) {
      const lower = kw.toLowerCase();
      if (!keywordSet.has(lower)) {
        keywordSet.add(lower);
        keywords.push(kw);
      }
    }

    for (const keyword of keywords) {
      if (totalAccepted >= MAX_TOTAL_LISTINGS) break;

      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const data = await fetchJobs(keyword, mc.country, mc.lang, page);
          const result = data?.data?.dataSetResult || data?.dataSetResult || {};
          const totalAvailable = result.totalNumberOfResults || 0;
          const items = result.items || [];

          globalStats.fetched += items.length;
          marketStats.fetched += items.length;

          for (const item of items) {
            const header = item.header || {};
            const jvContent = item.jvContent || {};
            const relatedUrls = item.relatedUrls || {};

            const handle = header.handle || '';
            if (!handle || seen.has(handle)) { globalStats.skipped++; marketStats.skipped++; continue; }
            seen.add(handle);

            const title = jvContent.title || keyword;
            const employer = jvContent.employer?.name || '';
            const workLocation = (jvContent.workLocation || [])[0] || {};
            const address = workLocation.address || {};
            const city = address.city || null;
            const country = address.country || mc.country;

            const sourceUrl = relatedUrls.jvUrl
              || `https://ec.europa.eu/eures/portal/jv-se/jv-details/${handle}`;
            const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
            const fingerprint = md5(`eures:${handle}`);
            const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

            // Full title with employer
            const fullTitle = employer ? `${title} — ${employer}` : title;

            // Blue-collar filter
            const searchText = `${title} ${employer}`;
            if (!isBlueCollar(searchText, null)) {
              globalStats.skipped++;
              marketStats.skipped++;
              continue;
            }

            // Title dedup: max N per base title
            const baseTitle = title.toLowerCase()
              .replace(/\s*\(m\/w\/d\)\s*/g, '')
              .replace(/\s*\(h\/f\)\s*/g, '')       // FR gender
              .replace(/\s*\(m\/f\)\s*/g, '')        // generic gender
              .replace(/\s*\(m\/v\)\s*/g, '')        // NL gender
              .replace(/\s*\(k\/m\)\s*/g, '')        // PL gender
              .trim();
            const titleKey = `${mc.market}:${baseTitle}`;
            const titleCount = seenTitles.get(titleKey) || 0;
            if (titleCount >= MAX_PER_TITLE) {
              globalStats.skipped++;
              marketStats.skipped++;
              continue;
            }
            seenTitles.set(titleKey, titleCount + 1);
            totalAccepted++;

            if (totalAccepted >= MAX_TOTAL_LISTINGS) {
              hasMore = false;
            }

            // Extract dates
            const postedDate = jvContent.publicationDate
              ? new Date(jvContent.publicationDate) : null;

            // Build description
            const descParts: string[] = [];
            if (jvContent.description) descParts.push(jvContent.description);
            if (employer) descParts.push(`Employer: ${employer}`);
            if (city) descParts.push(`Location: ${city}, ${country}`);
            const description = descParts.join('\n\n').substring(0, 5000) || null;

            batch.push({
              title: fullTitle.substring(0, 500),
              slug,
              sourceUrl,
              canonicalUrl,
              fingerprint,
              companyId: source.companyId,
              sourceId: source.id,
              country: mc.market as Market,
              city,
              state: null,
              latitude: null,
              longitude: null,
              sector: detectSector(title, employer),
              description,
              postedDate,
              lastSeenAt: new Date(),
              status: 'ACTIVE' as JobStatus,
            });

            if (batch.length >= 500) {
              const result = await flushBatch(batch);
              globalStats.inserted += result;
              marketStats.inserted += result;
              batch = [];
            }
          }

          hasMore = items.length === RESULTS_PER_PAGE && page < MAX_PAGES;
          page++;

          await delay(REQUEST_DELAY_MS);

          if (items.length > 0 && page === 2) {
            console.log(`  "${keyword}": ${totalAvailable.toLocaleString()} total, fetching...`);
          }
        } catch (e) {
          const msg = (e as Error).message;
          if (msg.includes('429')) {
            console.warn(`  Rate limited, waiting 60s...`);
            await delay(60_000);
          } else {
            console.warn(`  "${keyword}" p${page}: ${msg.substring(0, 100)}`);
            globalStats.errors++;
            marketStats.errors++;
            hasMore = false;
          }
        }
      }
    }

    console.log(`  ${mc.market} done: fetched=${marketStats.fetched}, inserted=${marketStats.inserted}, skipped=${marketStats.skipped}, errors=${marketStats.errors}`);
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    globalStats.inserted += result;
  }

  await prisma.$disconnect();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Markets: ${MARKET_CONFIGS.length}`);
  console.log(`  Fetched: ${globalStats.fetched.toLocaleString()}`);
  console.log(`  Unique handles: ${seen.size.toLocaleString()}`);
  console.log(`  Inserted: ${globalStats.inserted.toLocaleString()}`);
  console.log(`  Skipped: ${globalStats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${globalStats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

main().catch(console.error);
