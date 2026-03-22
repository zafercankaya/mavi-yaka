/**
 * bulk-import-adzuna.ts — Bulk Import from Adzuna API (18 countries)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-adzuna.ts [market|ALL]
 * Example: npx ts-node --transpile-only src/bulk-import-adzuna.ts US
 *          npx ts-node --transpile-only src/bulk-import-adzuna.ts ALL
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

const ADZUNA_APP_ID = '0c703aa9';
const ADZUNA_APP_KEY = '101c85d3d6493adf7544e427be6c9118';
const RESULTS_PER_PAGE = 50; // Adzuna max
const MAX_PAGES = 50; // 50 pages × 50 = 2,500 per keyword
const REQUEST_DELAY_MS = 250;
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

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Sector detection (multilingual) ─────────────────────────────────

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/warehouse|lager|logist|driver|chauffeur|courier|delivery|shipping|freight|forklift|truck|postal|packer/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|fabrik|usine|fábrica|produktion|operario|operador/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop assistant|vendeur|verkäuf|cajero|loja|einzelhandel|supermarket/i.test(t)) return 'RETAIL';
  if (/construct|builder|mason|carpenter|plumber|roofer|bricklayer|bauarbeiter|maçon|albañil|pedreiro/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista|cuisinier|cocinero|cozinheiro/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|workshop|kfz|mécanicien|mecánico|mecânico/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|garment|confection|costur/i.test(t)) return 'TEXTILE';
  if (/mining|energy|solar|wind|oil|gas|electricity|bergbau|énergie|energía|mineração/i.test(t)) return 'MINING_ENERGY';
  if (/nurse|healthcare|hospital|care|carer|pflege|infirmier|enfermero|enfermeiro|clinic/i.test(t)) return 'HEALTHCARE';
  if (/hotel|hospitality|housekeeper|tourism|reception|concierge|chambre|camarero|hotelaria/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agriculture|garden|harvest|landscap|agri|jardinier|agricultor|agrícola/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|bouncer|wachschutz|sécurité|seguridad|segurança|vigilante/i.test(t)) return 'SECURITY_SERVICES';
  if (/cleaning|janitor|facility|maintenance|caretaker|hausmeis|nettoyage|limpieza|limpeza/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metal|steel|weld|smith|cnc|machin|foundry|schweiß|soudeur|soldador|torneiro/i.test(t)) return 'METAL_STEEL';
  if (/chemi|pharma|plastic|rubber|paint|labor|chimie|químic/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/e-commerce|parcel|package|last.mile/i.test(t)) return 'ECOMMERCE_CARGO';
  if (/telecom|cable|fiber|network|antenna/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Market configs ──────────────────────────────────────────────────

interface MarketConfig {
  adzunaCode: string;
  market: Market;
  keywords: string[];
}

const MARKET_CONFIGS: MarketConfig[] = [
  {
    adzunaCode: 'us', market: 'US',
    keywords: ['warehouse worker', 'forklift operator', 'truck driver', 'janitor', 'housekeeper',
      'cook', 'dishwasher', 'cashier', 'stock clerk', 'laborer', 'construction worker',
      'electrician', 'plumber', 'welder', 'machine operator', 'assembly line',
      'delivery driver', 'security guard', 'custodian', 'landscaper', 'mover',
      'farmworker', 'meatpacker', 'baker', 'roofer', 'painter', 'carpenter',
      'mechanic', 'nursing aide', 'home health aide'],
  },
  {
    adzunaCode: 'gb', market: 'UK',
    keywords: ['warehouse operative', 'forklift driver', 'hgv driver', 'cleaner', 'kitchen porter',
      'labourer', 'bricklayer', 'plumber', 'electrician', 'welder', 'care assistant',
      'security officer', 'factory worker', 'packer', 'picker', 'scaffolder',
      'roofer', 'painter decorator', 'farm worker', 'mechanic', 'chef',
      'refuse collector', 'postman', 'caretaker', 'groundskeeper'],
  },
  {
    adzunaCode: 'de', market: 'DE',
    keywords: ['Lagerarbeiter', 'Staplerfahrer', 'Berufskraftfahrer', 'Reinigungskraft',
      'Koch', 'Produktionsmitarbeiter', 'Elektriker', 'Schweißer', 'Monteur',
      'Bauarbeiter', 'Dachdecker', 'Maler', 'Schlosser', 'Gärtner', 'Altenpfleger',
      'Sicherheitsmitarbeiter', 'Kommissionierer', 'Kellner', 'Bäcker', 'Fleischer'],
  },
  {
    adzunaCode: 'fr', market: 'FR',
    keywords: ['manutentionnaire', 'cariste', 'chauffeur poids lourd', 'agent entretien',
      'cuisinier', 'ouvrier production', 'électricien', 'soudeur', 'monteur',
      'maçon', 'couvreur', 'peintre bâtiment', 'jardinier', 'aide soignant',
      'agent sécurité', 'préparateur commandes', 'serveur', 'boulanger', 'boucher',
      'plombier', 'mécanicien', 'conducteur bus', 'magasinier'],
  },
  {
    adzunaCode: 'br', market: 'BR',
    keywords: ['auxiliar logística', 'operador empilhadeira', 'motorista', 'auxiliar limpeza',
      'cozinheiro', 'operador produção', 'eletricista', 'soldador', 'montador',
      'pedreiro', 'pintor', 'jardineiro', 'cuidador', 'vigilante',
      'separador', 'garçom', 'padeiro', 'açougueiro', 'mecânico', 'servente obras'],
  },
  {
    adzunaCode: 'mx', market: 'MX',
    keywords: ['almacenista', 'montacarguista', 'chofer', 'auxiliar limpieza',
      'cocinero', 'operador producción', 'electricista', 'soldador', 'mecánico',
      'albañil', 'pintor', 'jardinero', 'guardia seguridad', 'empacador',
      'mesero', 'panadero', 'carnicero', 'velador', 'obrero', 'ayudante general'],
  },
  {
    adzunaCode: 'ca', market: 'CA',
    keywords: ['warehouse worker', 'forklift operator', 'truck driver', 'janitor', 'cook',
      'construction labourer', 'electrician', 'plumber', 'welder', 'machine operator',
      'security guard', 'landscaper', 'farm worker', 'mechanic', 'housekeeper',
      'delivery driver', 'roofer', 'painter', 'carpenter', 'caretaker'],
  },
  {
    adzunaCode: 'es', market: 'ES',
    keywords: ['mozo almacén', 'carretillero', 'conductor', 'limpiador', 'cocinero',
      'operario producción', 'electricista', 'soldador', 'mecánico', 'albañil',
      'pintor', 'jardinero', 'vigilante seguridad', 'empaquetador', 'camarero',
      'panadero', 'carnicero', 'peón', 'fontanero', 'carpintero'],
  },
  {
    adzunaCode: 'au', market: 'AU',
    keywords: ['warehouse worker', 'forklift driver', 'truck driver', 'cleaner', 'cook',
      'labourer', 'electrician', 'plumber', 'welder', 'machine operator',
      'security officer', 'factory worker', 'packer', 'picker', 'mechanic',
      'landscaper', 'farmhand', 'housekeeper', 'roofer', 'painter'],
  },
  {
    adzunaCode: 'in', market: 'IN',
    keywords: ['warehouse helper', 'driver', 'peon', 'cook', 'factory worker',
      'electrician', 'welder', 'fitter', 'mason', 'painter', 'security guard',
      'packer', 'cleaner', 'delivery boy', 'mechanic', 'plumber',
      'construction worker', 'gardener', 'helper', 'loader'],
  },
  {
    adzunaCode: 'it', market: 'IT',
    keywords: ['magazziniere', 'carrellista', 'autista', 'addetto pulizie',
      'cuoco', 'operaio produzione', 'elettricista', 'saldatore', 'meccanico',
      'muratore', 'imbianchino', 'giardiniere', 'guardia giurata', 'cameriere',
      'panettiere', 'macellaio', 'idraulico', 'carpentiere', 'facchino', 'manovale'],
  },
  {
    adzunaCode: 'nl', market: 'NL',
    keywords: ['magazijnmedewerker', 'heftruckchauffeur', 'vrachtwagenchauffeur', 'schoonmaker',
      'kok', 'productiemedewerker', 'elektricien', 'lasser', 'monteur',
      'bouwvakker', 'schilder', 'tuinman', 'beveiliger', 'orderpicker',
      'kelner', 'bakker', 'slager', 'loodgieter', 'timmerman', 'inpakker'],
  },
  {
    adzunaCode: 'pl', market: 'PL',
    keywords: ['magazynier', 'operator wózka', 'kierowca', 'sprzątaczka',
      'kucharz', 'pracownik produkcji', 'elektryk', 'spawacz', 'mechanik',
      'murarz', 'malarz', 'ogrodnik', 'ochroniarz', 'pakowacz',
      'kelner', 'piekarz', 'rzeźnik', 'hydraulik', 'cieśla', 'pomocnik'],
  },
  {
    adzunaCode: 'za', market: 'ZA',
    keywords: ['warehouse worker', 'forklift operator', 'driver', 'cleaner', 'cook',
      'general worker', 'electrician', 'welder', 'machine operator', 'builder',
      'painter', 'gardener', 'security guard', 'packer', 'mechanic',
      'plumber', 'farmworker', 'housekeeper', 'labourer', 'delivery driver'],
  },
  {
    adzunaCode: 'at', market: 'DE', // Austria → DE market (German-speaking, same sector)
    keywords: ['Lagerarbeiter', 'Staplerfahrer', 'Berufskraftfahrer', 'Reinigungskraft',
      'Koch', 'Produktionsmitarbeiter', 'Elektriker', 'Schweißer', 'Monteur'],
  },
  {
    adzunaCode: 'ch', market: 'DE', // Switzerland → DE market
    keywords: ['Lagerarbeiter', 'Staplerfahrer', 'Chauffeur', 'Reinigungskraft',
      'Koch', 'Produktionsmitarbeiter', 'Elektriker', 'Schweisser', 'Monteur'],
  },
  {
    adzunaCode: 'sg', market: 'MY', // Singapore → MY market (similar region)
    keywords: ['warehouse worker', 'driver', 'cleaner', 'cook', 'factory worker',
      'security guard', 'packer', 'mechanic', 'electrician', 'labourer'],
  },
  {
    adzunaCode: 'nz', market: 'AU', // NZ → AU market
    keywords: ['warehouse worker', 'truck driver', 'cleaner', 'cook', 'labourer',
      'electrician', 'plumber', 'mechanic', 'farmhand', 'factory worker'],
  },
];

// ─── Stats ───────────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

// ─── Source lookup/creation ──────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `adzuna-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  // Find existing Adzuna source
  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'Adzuna' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    // Find or create Adzuna company for this market
    let company = await prisma.company.findFirst({
      where: { name: 'Adzuna', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Adzuna',
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.adzuna.com',
        },
      });
    }

    // Create CrawlSource
    const created = await prisma.crawlSource.create({
      data: {
        name: `Adzuna ${market} Job Listings`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: [`https://api.adzuna.com/v1/api/jobs/${market.toLowerCase()}/search`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Import for a single market ─────────────────────────────────────

async function importMarket(config: MarketConfig, stats: ImportStats): Promise<number> {
  const source = await getOrCreateSource(config.market);
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const keyword of config.keywords) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${config.adzunaCode}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&what=${encodeURIComponent(keyword)}&results_per_page=${RESULTS_PER_PAGE}&content-type=application/json`;
        const data = await fetchJson(url);

        const results = data.results || [];
        stats.fetched += results.length;

        for (const job of results) {
          const id = String(job.id || '');
          if (!id || seen.has(id)) { stats.skipped++; continue; }
          seen.add(id);

          const title = job.title || keyword;
          const sourceUrl = job.redirect_url || `https://www.adzuna.com/details/${id}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`adzuna:${config.adzunaCode}:${id}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const city = job.location?.area?.slice(-1)?.[0] || null;
          const state = job.location?.area?.slice(-2)?.[0] || null;
          const lat = job.latitude || null;
          const lon = job.longitude || null;

          batch.push({
            title,
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: config.market,
            city,
            state,
            latitude: lat,
            longitude: lon,
            sector: detectSector(title, job.description),
            description: job.description?.substring(0, 5000) || null,
            postedDate: job.created ? new Date(job.created) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 1000) {
            const result = await flushBatch(batch);
            stats.inserted += result.inserted;
            stats.updated += result.updated;
            batch = [];
          }
        }

        const totalAvailable = data.count || 0;
        hasMore = results.length === RESULTS_PER_PAGE && page < MAX_PAGES && (page * RESULTS_PER_PAGE) < totalAvailable;
        page++;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          // Rate limited — wait and retry
          console.warn(`  [${config.adzunaCode.toUpperCase()}] Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  [${config.adzunaCode.toUpperCase()}] "${keyword}" p${page}: ${msg.substring(0, 80)}`);
          stats.errors++;
          hasMore = false;
        }
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result.inserted;
    stats.updated += result.updated;
  }

  return seen.size;
}

// ─── Batch upsert ────────────────────────────────────────────────────

async function flushBatch(batch: any[]): Promise<{ inserted: number; updated: number }> {
  try {
    const result = await prisma.jobListing.createMany({
      data: batch,
      skipDuplicates: true,
    });
    return { inserted: result.count, updated: batch.length - result.count };
  } catch (e: any) {
    if (batch.length > 50) {
      let inserted = 0, updated = 0;
      for (let i = 0; i < batch.length; i += 50) {
        const chunk = batch.slice(i, i + 50);
        try {
          const r = await prisma.jobListing.createMany({ data: chunk, skipDuplicates: true });
          inserted += r.count;
          updated += chunk.length - r.count;
        } catch (e2: any) {
          console.warn(`  [DB] Chunk error: ${e2.message?.substring(0, 150)}`);
        }
      }
      return { inserted, updated };
    }
    console.warn(`  [DB] Batch error: ${e.message?.substring(0, 150)}`);
    return { inserted: 0, updated: 0 };
  }
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const target = (process.argv[2] || 'ALL').toUpperCase();

  console.log(`\n🔵 Mavi Yaka — Adzuna Bulk Import`);
  console.log(`Target: ${target}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };

  const configs = target === 'ALL'
    ? MARKET_CONFIGS
    : MARKET_CONFIGS.filter(c => c.adzunaCode.toUpperCase() === target || c.market === target);

  if (configs.length === 0) {
    console.error(`No config found for "${target}"`);
    return;
  }

  try {
    for (const config of configs) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`[${config.adzunaCode.toUpperCase()} → ${config.market}] Starting... (${config.keywords.length} keywords)`);

      const unique = await importMarket(config, stats);
      console.log(`[${config.adzunaCode.toUpperCase()} → ${config.market}] Done: ${unique.toLocaleString()} unique`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
  console.log(`  Updated: ${stats.updated.toLocaleString()}`);
  console.log(`  Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

main().catch(console.error);
