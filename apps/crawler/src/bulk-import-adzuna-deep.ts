/**
 * bulk-import-adzuna-deep.ts — Deep Adzuna Import for mid-tier markets
 *
 * Runs expanded keywords for markets where Adzuna covers but current results are low.
 * Usage: npx ts-node --transpile-only src/bulk-import-adzuna-deep.ts [market|ALL]
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID || '0c703aa9';
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY || '101c85d3d6493adf7544e427be6c9118';
const RESULTS_PER_PAGE = 50;
const MAX_PAGES = 50;
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

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/warehouse|lager|logist|driver|chauffeur|courier|delivery|shipping|freight|forklift|truck|postal|packer/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|fabrik|usine|fábrica|produktion|operario/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop|vendeur|verkäuf|cajero|supermarket/i.test(t)) return 'RETAIL';
  if (/construct|builder|mason|carpenter|plumber|roofer|bricklayer|albañil|pedreiro|muratore/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|workshop/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|garment/i.test(t)) return 'TEXTILE';
  if (/nurse|hospital|care.*assist|patient|health|carer|pflege/i.test(t)) return 'HEALTHCARE';
  if (/hotel|cleaning|housekeeper|cleaner/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agricult|garden|landscape/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|watchman/i.test(t)) return 'SECURITY_SERVICES';
  if (/janitor|facility|maintenance|building/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/weld|metal|steel|iron|forge/i.test(t)) return 'METAL_STEEL';
  return 'OTHER';
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

interface MarketConfig {
  adzunaCode: string;
  market: Market;
  keywords: string[];
}

const MARKET_CONFIGS: MarketConfig[] = [
  {
    adzunaCode: 'es', market: 'ES',
    keywords: [
      // Almacén y Logística
      'mozo almacén', 'carretillero', 'conductor camión', 'repartidor', 'transportista',
      'preparador pedidos', 'empaquetador', 'operador logístico', 'cargador', 'mensajero',
      'conductor autobús', 'taxista', 'estibador',
      // Producción y Fábrica
      'operario producción', 'operador máquina', 'envasador', 'montador industrial',
      'soldador', 'tornero', 'fresador', 'operario línea', 'peón industrial',
      'mecánico industrial', 'operario CNC',
      // Construcción
      'albañil', 'peón construcción', 'encofrador', 'ferrallista', 'pintor',
      'fontanero', 'carpintero', 'cristalero', 'gruista', 'yesero',
      'electricista', 'techador', 'impermeabilizador',
      // Hostelería
      'cocinero', 'ayudante cocina', 'pastelero', 'panadero', 'carnicero',
      'camarero', 'barman', 'friegaplatos', 'camarera pisos', 'recepcionista hotel',
      // Comercio
      'reponedor', 'cajero supermercado', 'dependiente', 'promotor ventas',
      // Limpieza y Seguridad
      'limpiador', 'vigilante seguridad', 'conserje', 'jardinero',
      // Sanidad
      'auxiliar enfermería', 'cuidador', 'gerocultora',
      // Agricultura
      'peón agrícola', 'jornalero', 'recolector', 'tractorista', 'pastor',
      // Otros
      'mecánico', 'chapista', 'tapicero', 'costurera', 'cerrajero',
    ],
  },
  {
    adzunaCode: 'it', market: 'IT',
    keywords: [
      // Magazzino & Logistica
      'magazziniere', 'carrellista', 'autista camion', 'autista consegne',
      'corriere', 'preparatore ordini', 'imballatore', 'mulettista', 'facchino',
      'autista autobus', 'conducente',
      // Produzione & Fabbrica
      'operaio produzione', 'operatore macchina', 'saldatore', 'torniere',
      'fresatore', 'montatore', 'addetto confezionamento', 'operaio generico',
      'operaio metalmeccanico', 'operatore CNC',
      // Edilizia
      'muratore', 'manovale', 'carpentiere', 'imbianchino', 'idraulico',
      'elettricista', 'piastrellista', 'gruista', 'geometra cantiere',
      'ferraiolo', 'lattoniere', 'cartongessista',
      // Ristorazione
      'cuoco', 'aiuto cuoco', 'pasticcere', 'panettiere', 'macellaio',
      'cameriere', 'barista', 'lavapiatti', 'pizzaiolo',
      // Commercio
      'scaffalista', 'cassiere', 'commesso', 'addetto vendite',
      // Pulizia & Sicurezza
      'addetto pulizie', 'guardia giurata', 'portiere', 'giardiniere',
      // Sanità
      'operatore socio sanitario', 'badante', 'assistente anziani',
      // Agricoltura
      'bracciante agricolo', 'raccoglitore', 'trattorista',
      // Altro
      'meccanico auto', 'carrozziere', 'sarto', 'fabbro', 'falegname',
    ],
  },
  {
    adzunaCode: 'nl', market: 'NL',
    keywords: [
      // Magazijn & Logistiek
      'magazijnmedewerker', 'heftruckchauffeur', 'vrachtwagenchauffeur', 'bezorger',
      'orderpicker', 'inpakker', 'logistiek medewerker', 'chauffeur', 'koerier',
      'expeditiemedewerker', 'buschauffeur',
      // Productie & Fabriek
      'productiemedewerker', 'machine operator', 'lasser', 'draaier',
      'frezer', 'monteur', 'inpakmedewerker', 'operator',
      'constructiebankwerker', 'CNC operator',
      // Bouw
      'bouwvakker', 'metselaar', 'schilder', 'loodgieter', 'elektricien',
      'timmerman', 'stukadoor', 'tegelzetter', 'dakdekker', 'betonwerker',
      'steigerbouwer', 'straatmaker', 'grondwerker',
      // Horeca
      'kok', 'keukenhulp', 'bakker', 'slager', 'barista',
      'serveerster', 'barmedewerker', 'afwasser', 'kamermeisje',
      // Winkel
      'vakkenvuller', 'caissière', 'winkelmedewerker', 'verkoopmedewerker',
      // Schoonmaak & Beveiliging
      'schoonmaker', 'beveiliger', 'conciërge', 'tuinman',
      // Zorg
      'verzorgende', 'thuishulp', 'verpleegkundige',
      // Landbouw
      'agrarisch medewerker', 'tuinbouwmedewerker', 'oogster',
      // Overig
      'automonteur', 'fietsenmaker', 'naaister', 'slotenmaker',
    ],
  },
  {
    adzunaCode: 'pl', market: 'PL',
    keywords: [
      // Magazyn & Logistyka
      'magazynier', 'operator wózka', 'kierowca ciężarówki', 'kurier',
      'komisjoner', 'pakowacz', 'operator logistyczny', 'kierowca dostawczy',
      'spedytor', 'kierowca autobusu',
      // Produkcja & Fabryka
      'pracownik produkcji', 'operator maszyn', 'spawacz', 'tokarz',
      'frezer', 'monter', 'pakowacz', 'pracownik linii produkcyjnej',
      'operator CNC', 'ślusarz',
      // Budowa
      'murarz', 'pomocnik budowlany', 'malarz', 'hydraulik', 'elektryk',
      'cieśla', 'dekarz', 'tynkarz', 'glazurnik', 'zbrojarz',
      'brukarz', 'robotnik budowlany',
      // Gastronomia
      'kucharz', 'pomoc kuchenna', 'piekarz', 'cukiernik', 'rzeźnik',
      'kelner', 'barista', 'pomywacz', 'pizzerman',
      // Handel
      'kasjer', 'sprzedawca', 'merchandiser', 'pracownik sklepu',
      // Sprzątanie & Ochrona
      'sprzątaczka', 'ochroniarz', 'dozorca', 'ogrodnik',
      // Opieka
      'opiekun osób starszych', 'opiekunka', 'pielęgniarka',
      // Rolnictwo
      'pracownik rolny', 'zbieracz', 'traktorzysta',
      // Inne
      'mechanik samochodowy', 'lakiernik', 'krawiec', 'szewc',
    ],
  },
  {
    adzunaCode: 'au', market: 'AU',
    keywords: [
      // Warehouse & Logistics
      'warehouse worker', 'forklift operator', 'truck driver', 'delivery driver',
      'courier', 'picker packer', 'stores person', 'removalist', 'freight handler',
      'MR driver', 'HR driver', 'MC driver',
      // Cleaning & Facility
      'cleaner', 'commercial cleaner', 'caretaker', 'groundskeeper',
      'maintenance worker', 'handyman', 'facilities officer',
      // Food & Hospitality
      'kitchen hand', 'chef', 'commis chef', 'baker', 'barista',
      'food and beverage attendant', 'kitchen porter', 'room attendant',
      'housekeeping', 'dishwasher',
      // Construction & Trades
      'labourer', 'bricklayer', 'plumber', 'electrician', 'welder',
      'scaffolder', 'roofer', 'painter', 'plasterer', 'tiler',
      'carpenter', 'concreter', 'formworker', 'steel fixer',
      'traffic controller', 'rigger',
      // Manufacturing
      'factory worker', 'machine operator', 'production worker',
      'process worker', 'packer', 'quality inspector',
      // Auto & Mechanic
      'mechanic', 'diesel mechanic', 'tyre fitter', 'auto electrician',
      'panel beater', 'spray painter',
      // Healthcare & Care
      'aged care worker', 'disability support', 'care worker', 'personal carer',
      // Security & Other
      'security officer', 'farm hand', 'fruit picker', 'landscape gardener',
      'garbage collector', 'train driver',
    ],
  },
  {
    adzunaCode: 'za', market: 'ZA',
    keywords: [
      // Warehouse & Logistics
      'warehouse worker', 'forklift operator', 'truck driver', 'delivery driver',
      'courier', 'picker packer', 'dispatch clerk', 'goods handler',
      'code 14 driver', 'code 10 driver',
      // Cleaning & Facility
      'cleaner', 'general worker', 'building maintenance', 'handyman',
      'grounds keeper', 'domestic worker',
      // Food & Hospitality
      'cook', 'chef', 'baker', 'barista', 'waiter',
      'kitchen staff', 'restaurant staff', 'room attendant',
      // Construction & Trades
      'builder', 'bricklayer', 'plumber', 'electrician', 'welder',
      'scaffolder', 'painter', 'tiler', 'carpenter',
      'steel fixer', 'shutter hand', 'construction worker',
      // Manufacturing
      'factory worker', 'machine operator', 'production worker',
      'packer', 'quality controller', 'assembly worker',
      // Auto & Mechanic
      'mechanic', 'diesel mechanic', 'auto electrician', 'panel beater',
      // Healthcare & Care
      'caregiver', 'care worker', 'nursing assistant',
      // Security & Other
      'security guard', 'security officer', 'farm worker',
      'gardener', 'mining worker', 'artisan',
    ],
  },
  {
    adzunaCode: 'br', market: 'BR',
    keywords: [
      // Logística & Armazém
      'auxiliar logística', 'operador empilhadeira', 'motorista', 'entregador',
      'ajudante carga', 'separador', 'conferente', 'estoquista',
      'motorista caminhão', 'motoboy',
      // Produção & Fábrica
      'operador produção', 'operador máquina', 'auxiliar produção', 'embalador',
      'soldador', 'torneiro', 'fresador', 'montador', 'operador CNC',
      // Construção
      'pedreiro', 'servente', 'carpinteiro', 'pintor', 'encanador',
      'eletricista', 'azulejista', 'armador', 'gesseiro',
      // Alimentação
      'cozinheiro', 'auxiliar cozinha', 'padeiro', 'confeiteiro', 'açougueiro',
      'garçom', 'barista', 'copeiro', 'pizzaiolo',
      // Comércio
      'repositor', 'operador caixa', 'vendedor', 'promotor vendas',
      // Limpeza & Segurança
      'auxiliar limpeza', 'vigilante', 'porteiro', 'zelador', 'jardineiro',
      // Saúde
      'cuidador idosos', 'auxiliar enfermagem', 'técnico enfermagem',
      // Agricultura
      'trabalhador rural', 'tratorista', 'colhedor',
      // Outros
      'mecânico', 'funileiro', 'costureiro', 'serralheiro',
    ],
  },
  {
    adzunaCode: 'in', market: 'IN',
    keywords: [
      // Warehouse & Logistics
      'warehouse helper', 'store keeper', 'delivery boy', 'driver', 'loader',
      'packer', 'dispatch', 'logistics boy', 'courier', 'auto driver',
      // Manufacturing & Factory
      'factory worker', 'machine operator', 'production helper', 'fitter',
      'welder', 'turner', 'CNC operator', 'press operator', 'assembly',
      'quality checker', 'packaging worker',
      // Construction
      'mason', 'painter', 'plumber', 'carpenter', 'bar bender',
      'construction labourer', 'tile setter', 'shuttering worker',
      // Electrical & Technical
      'electrician', 'AC technician', 'maintenance boy', 'wireman',
      'ITI fitter', 'diesel mechanic',
      // Food & Kitchen
      'cook', 'chef', 'kitchen helper', 'baker', 'tandoor chef',
      'waiter', 'dishwasher', 'steward',
      // Retail
      'salesman', 'shop assistant', 'cashier', 'billing operator',
      // Security & Cleaning
      'security guard', 'watchman', 'peon', 'sweeper', 'office boy',
      'gardener', 'housekeeping boy', 'cleaning staff',
      // Auto & Other
      'mechanic', 'auto electrician', 'panel beater',
      'tailor', 'barber', 'laundry worker',
      'farm worker', 'tractor driver',
    ],
  },
];

// ─── Source management ───────────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `adzuna-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'Adzuna' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Adzuna', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Adzuna',
          slug: `adzuna-${market.toLowerCase()}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.adzuna.com',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `Adzuna API (${market})`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: ['https://www.adzuna.com'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Adzuna API fetch ────────────────────────────────────────────────

async function fetchAdzuna(country: string, keyword: string, page: number): Promise<any> {
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=${RESULTS_PER_PAGE}&what=${encodeURIComponent(keyword)}&sort_by=date`;
  return fetchJson(url);
}

// ─── Import ──────────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function importMarket(config: MarketConfig, stats: ImportStats): Promise<number> {
  const source = await getOrCreateSource(config.market);
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const keyword of config.keywords) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchAdzuna(config.adzunaCode, keyword, page);
        const results = data.results || [];
        stats.fetched += results.length;

        for (const job of results) {
          const jobId = String(job.id || '');
          if (!jobId || seen.has(jobId)) { stats.skipped++; continue; }
          seen.add(jobId);

          const title = job.title || keyword;
          const jobUrl = job.redirect_url || '';
          if (!jobUrl) { stats.skipped++; continue; }

          const canonicalUrl = jobUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`adzuna:${config.adzunaCode}:${jobId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const desc = job.description?.substring(0, 5000) || null;

          if (!isBlueCollar(title, desc)) {
            stats.skipped++;
            continue;
          }

          let salaryMin: number | null = null;
          let salaryMax: number | null = null;
          if (job.salary_min) salaryMin = Math.round(job.salary_min);
          if (job.salary_max) salaryMax = Math.round(job.salary_max);

          batch.push({
            title,
            slug,
            sourceUrl: jobUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: config.market,
            city: job.location?.display_name || null,
            state: job.location?.area?.[1] || null,
            sector: detectSector(title, desc),
            description: desc,
            salaryMin,
            salaryMax,
            salaryCurrency: job.salary_is_predicted === 0 ? null : undefined,
            postedDate: job.created ? new Date(job.created) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        const totalCount = data.count || 0;
        hasMore = results.length === RESULTS_PER_PAGE && page < MAX_PAGES && (page * RESULTS_PER_PAGE) < totalCount;
        page++;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          console.warn(`  [${config.market}] Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  [${config.market}] "${keyword}" p${page}: ${msg.substring(0, 80)}`);
          stats.errors++;
          hasMore = false;
        }
      }
    }
  }

  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  return seen.size;
}

async function flushBatch(batch: any[]): Promise<number> {
  // Remove undefined fields
  const cleanBatch = batch.map(item => {
    const clean: any = {};
    for (const [k, v] of Object.entries(item)) {
      if (v !== undefined) clean[k] = v;
    }
    return clean;
  });

  try {
    const result = await prisma.jobListing.createMany({
      data: cleanBatch,
      skipDuplicates: true,
    });
    return result.count;
  } catch (e: any) {
    if (cleanBatch.length > 50) {
      let inserted = 0;
      for (let i = 0; i < cleanBatch.length; i += 50) {
        const chunk = cleanBatch.slice(i, i + 50);
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

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const target = (process.argv[2] || 'ALL').toUpperCase();

  console.log(`\n🔵 Mavi Yaka — Adzuna DEEP Import`);
  console.log(`Target: ${target}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };

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
      console.log(`[${config.adzunaCode} → ${config.market}] Starting... (${config.keywords.length} keywords)`);

      const unique = await importMarket(config, stats);
      console.log(`[${config.adzunaCode} → ${config.market}] Done: ${unique.toLocaleString()} unique`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
  console.log(`  Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

main().catch(console.error);
