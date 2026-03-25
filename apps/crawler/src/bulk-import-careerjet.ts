/**
 * bulk-import-careerjet.ts — Bulk Import from CareerJet API (30+ countries)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-careerjet.ts [market|ALL]
 * Example: npx ts-node --transpile-only src/bulk-import-careerjet.ts US
 *          npx ts-node --transpile-only src/bulk-import-careerjet.ts ALL
 *
 * CareerJet API: https://www.careerjet.com/partners/api
 * - Basic Auth: API key as username, empty password
 * - locale_code per country (e.g. en_US, tr_TR)
 * - page (1-based), pagesize (max 99), max ~1000 results per query
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

// CareerJet API key — obtained from publisher registration
const CAREERJET_API_KEY = process.env.CAREERJET_API_KEY || '';
const API_BASE = 'https://search.api.careerjet.net/v4/query';
const PAGE_SIZE = 100; // CareerJet V4 max
const MAX_PAGES = 20; // 20 × 100 = 2000 per keyword (increased from 10)
const REQUEST_DELAY_MS = 500; // Be respectful
const REQUEST_TIMEOUT_MS = 20_000;
const REFERER = 'https://mavi-yaka-api.onrender.com/find-jobs/';

// User agent + IP for API requirement (required params)
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const USER_IP = '109.123.248.85'; // Contabo VPS IP

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

// ─── Sector detection (reused from Adzuna script) ─────────────────────

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/warehouse|lager|logist|driver|chauffeur|courier|delivery|shipping|freight|forklift|truck|postal|packer|kargo|şoför|nakliye/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|fabrik|usine|fábrica|produktion|operario|operador|üretim|fabrika/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop assistant|vendeur|verkäuf|cajero|loja|einzelhandel|supermarket|kasiyer|mağaza/i.test(t)) return 'RETAIL';
  if (/construct|builder|mason|carpenter|plumber|roofer|bricklayer|bauarbeiter|maçon|albañil|pedreiro|inşaat|kalfa/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista|cuisinier|cocinero|cozinheiro|aşçı|garson/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|workshop|kfz|mécanicien|mecánico|mecânico|tamirci|oto/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|garment|confection|costur|tekstil|terzi/i.test(t)) return 'TEXTILE';
  if (/mining|energy|solar|wind|oil|gas|electricity|bergbau|énergie|energía|mineração|maden|enerji/i.test(t)) return 'MINING_ENERGY';
  if (/nurse|healthcare|hospital|care|carer|pflege|infirmier|enfermero|enfermeiro|clinic|hemşire|hasta/i.test(t)) return 'HEALTHCARE';
  if (/hotel|hospitality|housekeeper|tourism|reception|concierge|chambre|camarero|hotelaria|otel|turizm/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agriculture|garden|harvest|landscap|agri|jardinier|agricultor|agrícola|çiftçi|tarım/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|bouncer|wachschutz|sécurité|seguridad|segurança|vigilante|güvenlik|bekçi/i.test(t)) return 'SECURITY_SERVICES';
  if (/cleaning|janitor|facility|maintenance|caretaker|hausmeis|nettoyage|limpieza|limpeza|temizlik|bakım/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metal|steel|weld|smith|cnc|machin|foundry|schweiß|soudeur|soldador|torneiro|kaynak|torna/i.test(t)) return 'METAL_STEEL';
  if (/chemi|pharma|plastic|rubber|paint|labor|chimie|químic|kimya|ilaç/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/e-commerce|parcel|package|last.mile|kargo|kurye/i.test(t)) return 'ECOMMERCE_CARGO';
  if (/telecom|cable|fiber|network|antenna|telekom/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Market configs ──────────────────────────────────────────────────

interface MarketConfig {
  locale: string; // CareerJet locale_code
  market: Market;
  keywords: string[];
}

const MARKET_CONFIGS: MarketConfig[] = [
  {
    locale: 'en_US', market: 'US',
    keywords: ['warehouse worker', 'forklift operator', 'truck driver', 'janitor', 'housekeeper',
      'cook', 'dishwasher', 'cashier', 'laborer', 'construction worker',
      'electrician', 'plumber', 'welder', 'machine operator', 'assembly line',
      'delivery driver', 'security guard', 'landscaper', 'farmworker', 'mechanic',
      'nursing aide', 'home health aide', 'baker', 'roofer', 'painter', 'carpenter',
      'custodian', 'mover', 'meatpacker', 'stock clerk'],
  },
  {
    locale: 'en_GB', market: 'UK',
    keywords: ['warehouse operative', 'forklift driver', 'hgv driver', 'cleaner', 'kitchen porter',
      'labourer', 'bricklayer', 'plumber', 'electrician', 'welder', 'care assistant',
      'security officer', 'factory worker', 'packer', 'picker', 'scaffolder',
      'roofer', 'painter decorator', 'farm worker', 'mechanic', 'chef',
      'refuse collector', 'postman', 'caretaker', 'groundskeeper'],
  },
  {
    locale: 'de_DE', market: 'DE',
    keywords: ['Lagerarbeiter', 'Staplerfahrer', 'Berufskraftfahrer', 'Reinigungskraft',
      'Koch', 'Produktionsmitarbeiter', 'Elektriker', 'Schweißer', 'Monteur',
      'Bauarbeiter', 'Dachdecker', 'Maler', 'Schlosser', 'Gärtner', 'Altenpfleger',
      'Sicherheitsmitarbeiter', 'Kommissionierer', 'Kellner', 'Bäcker', 'Fleischer'],
  },
  {
    locale: 'fr_FR', market: 'FR',
    keywords: ['manutentionnaire', 'cariste', 'chauffeur poids lourd', 'agent entretien',
      'cuisinier', 'ouvrier production', 'électricien', 'soudeur', 'monteur',
      'maçon', 'couvreur', 'peintre bâtiment', 'jardinier', 'aide soignant',
      'agent sécurité', 'préparateur commandes', 'serveur', 'boulanger', 'boucher',
      'plombier', 'mécanicien', 'conducteur bus', 'magasinier'],
  },
  {
    locale: 'pt_BR', market: 'BR',
    keywords: ['auxiliar logística', 'operador empilhadeira', 'motorista', 'auxiliar limpeza',
      'cozinheiro', 'operador produção', 'eletricista', 'soldador', 'montador',
      'pedreiro', 'pintor', 'jardineiro', 'cuidador', 'vigilante',
      'separador', 'garçom', 'padeiro', 'açougueiro', 'mecânico', 'servente obras'],
  },
  {
    locale: 'es_MX', market: 'MX',
    keywords: ['almacenista', 'montacarguista', 'chofer', 'auxiliar limpieza',
      'cocinero', 'operador producción', 'electricista', 'soldador', 'mecánico',
      'albañil', 'pintor', 'jardinero', 'guardia seguridad', 'empacador',
      'mesero', 'panadero', 'carnicero', 'velador', 'obrero', 'ayudante general'],
  },
  {
    locale: 'en_CA', market: 'CA',
    keywords: ['warehouse worker', 'forklift operator', 'truck driver', 'janitor', 'cook',
      'construction labourer', 'electrician', 'plumber', 'welder', 'machine operator',
      'security guard', 'landscaper', 'farm worker', 'mechanic', 'housekeeper',
      'delivery driver', 'roofer', 'painter', 'carpenter', 'caretaker'],
  },
  {
    locale: 'en_AU', market: 'AU',
    keywords: ['warehouse worker', 'forklift driver', 'truck driver', 'cleaner', 'cook',
      'labourer', 'electrician', 'plumber', 'welder', 'machine operator',
      'security officer', 'factory worker', 'packer', 'picker', 'mechanic',
      'landscaper', 'farmhand', 'housekeeper', 'roofer', 'painter'],
  },
  {
    locale: 'en_IN', market: 'IN',
    keywords: ['warehouse helper', 'driver', 'peon', 'cook', 'factory worker',
      'electrician', 'welder', 'fitter', 'mason', 'painter', 'security guard',
      'packer', 'cleaner', 'delivery boy', 'mechanic', 'plumber',
      'construction worker', 'gardener', 'helper', 'loader'],
  },
  {
    locale: 'it_IT', market: 'IT',
    keywords: ['magazziniere', 'carrellista', 'autista', 'addetto pulizie',
      'cuoco', 'operaio produzione', 'elettricista', 'saldatore', 'meccanico',
      'muratore', 'imbianchino', 'giardiniere', 'guardia giurata', 'cameriere',
      'panettiere', 'macellaio', 'idraulico', 'carpentiere', 'facchino', 'manovale'],
  },
  {
    locale: 'es_ES', market: 'ES',
    keywords: ['mozo almacén', 'carretillero', 'conductor', 'limpiador', 'cocinero',
      'operario producción', 'electricista', 'soldador', 'mecánico', 'albañil',
      'pintor', 'jardinero', 'vigilante seguridad', 'empaquetador', 'camarero',
      'panadero', 'carnicero', 'peón', 'fontanero', 'carpintero'],
  },
  {
    locale: 'nl_NL', market: 'NL',
    keywords: ['magazijnmedewerker', 'heftruckchauffeur', 'vrachtwagenchauffeur', 'schoonmaker',
      'kok', 'productiemedewerker', 'elektricien', 'lasser', 'monteur',
      'bouwvakker', 'schilder', 'tuinman', 'beveiliger', 'orderpicker',
      'kelner', 'bakker', 'slager', 'loodgieter', 'timmerman', 'inpakker'],
  },
  {
    locale: 'pl_PL', market: 'PL',
    keywords: ['magazynier', 'operator wózka', 'kierowca', 'sprzątaczka',
      'kucharz', 'pracownik produkcji', 'elektryk', 'spawacz', 'mechanik',
      'murarz', 'malarz', 'ogrodnik', 'ochroniarz', 'pakowacz',
      'kelner', 'piekarz', 'rzeźnik', 'hydraulik', 'cieśla', 'pomocnik'],
  },
  {
    locale: 'en_ZA', market: 'ZA',
    keywords: ['warehouse worker', 'forklift operator', 'driver', 'cleaner', 'cook',
      'general worker', 'electrician', 'welder', 'machine operator', 'builder',
      'painter', 'gardener', 'security guard', 'packer', 'mechanic',
      'plumber', 'farmworker', 'housekeeper', 'labourer', 'delivery driver'],
  },
  {
    locale: 'tr_TR', market: 'TR',
    keywords: ['depo elemanı', 'forklift operatörü', 'şoför', 'temizlik görevlisi',
      'aşçı', 'üretim elemanı', 'elektrikçi', 'kaynakçı', 'montajcı',
      'inşaat işçisi', 'boyacı', 'bahçıvan', 'güvenlik görevlisi', 'paketçi',
      'garson', 'fırıncı', 'kasap', 'tesisatçı', 'marangoz', 'kurye',
      'operatör', 'bakım teknisyeni', 'kat görevlisi', 'bulaşıkçı', 'sekreter'],
  },
  {
    locale: 'ja_JP', market: 'JP',
    keywords: ['倉庫作業', 'フォークリフト', 'ドライバー', '清掃', '調理',
      '製造', '電気工事', '溶接', '組立', '建設作業',
      '警備', 'ピッキング', '配送', '整備士', '介護'],
  },
  {
    locale: 'ko_KR', market: 'KR',
    keywords: ['물류창고', '지게차', '운전기사', '청소', '조리',
      '생산직', '전기기사', '용접', '조립', '건설노동자',
      '경비', '택배', '배달', '정비사', '요양보호사'],
  },
  {
    locale: 'ru_RU', market: 'RU',
    keywords: ['кладовщик', 'водитель погрузчика', 'водитель', 'уборщик',
      'повар', 'оператор производства', 'электрик', 'сварщик', 'слесарь',
      'строитель', 'маляр', 'садовник', 'охранник', 'упаковщик',
      'официант', 'пекарь', 'мясник', 'сантехник', 'грузчик', 'разнорабочий'],
  },
  {
    locale: 'pt_PT', market: 'PT',
    keywords: ['operador armazém', 'empilhadorista', 'motorista', 'auxiliar limpeza',
      'cozinheiro', 'operário fabril', 'eletricista', 'soldador', 'mecânico',
      'pedreiro', 'pintor', 'jardineiro', 'vigilante', 'empregado mesa',
      'padeiro', 'talhante', 'canalizador', 'carpinteiro', 'servente'],
  },
  {
    locale: 'sv_SE', market: 'SE',
    keywords: ['lagerarbetare', 'truckförare', 'lastbilschaufför', 'städare',
      'kock', 'produktionsarbetare', 'elektriker', 'svetsare', 'montör',
      'byggnadsarbetare', 'målare', 'trädgårdsarbetare', 'väktare', 'packare',
      'servitör', 'bagare', 'slaktare', 'rörmokare', 'snickare', 'vaktmästare'],
  },
  {
    locale: 'id_ID', market: 'ID',
    keywords: ['operator gudang', 'supir', 'cleaning service', 'koki', 'buruh pabrik',
      'teknisi listrik', 'tukang las', 'operator mesin', 'kuli bangunan',
      'satpam', 'kurir', 'montir', 'tukang kebun', 'pelayan'],
  },
  {
    locale: 'th_TH', market: 'TH',
    keywords: ['พนักงานคลังสินค้า', 'พนักงานขับรถ', 'แม่บ้าน', 'พ่อครัว',
      'พนักงานผลิต', 'ช่างไฟฟ้า', 'ช่างเชื่อม', 'คนงานก่อสร้าง',
      'รปภ', 'พนักงานส่งของ', 'ช่างซ่อม', 'พนักงานเสิร์ฟ'],
  },
  {
    locale: 'vi_VN', market: 'VN',
    keywords: ['công nhân kho', 'tài xế', 'lao công', 'đầu bếp',
      'công nhân sản xuất', 'thợ điện', 'thợ hàn', 'thợ xây',
      'bảo vệ', 'shipper', 'thợ sửa', 'phục vụ'],
  },
  {
    locale: 'ms_MY', market: 'MY',
    keywords: ['warehouse worker', 'driver', 'cleaner', 'cook', 'factory worker',
      'electrician', 'welder', 'construction worker', 'security guard',
      'packer', 'mechanic', 'delivery rider', 'gardener', 'waiter'],
  },
  {
    locale: 'en_PH', market: 'PH',
    keywords: ['warehouse worker', 'driver', 'janitor', 'cook', 'factory worker',
      'electrician', 'welder', 'construction worker', 'security guard',
      'packer', 'mechanic', 'delivery rider', 'gardener', 'waiter'],
  },
  {
    locale: 'en_PK', market: 'PK',
    keywords: ['warehouse helper', 'driver', 'cleaner', 'cook', 'factory worker',
      'electrician', 'welder', 'mason', 'security guard', 'packer',
      'mechanic', 'plumber', 'labourer', 'gardener', 'helper'],
  },
  {
    locale: 'ar_SA', market: 'SA',
    keywords: ['عامل مستودع', 'سائق', 'عامل نظافة', 'طباخ', 'عامل مصنع',
      'كهربائي', 'لحام', 'عامل بناء', 'حارس أمن', 'ميكانيكي',
      'سباك', 'نجار', 'عامل توصيل', 'بستاني'],
  },
  {
    locale: 'ar_EG', market: 'EG',
    keywords: ['عامل مخزن', 'سائق', 'عامل نظافة', 'طباخ', 'عامل مصنع',
      'كهربائي', 'لحام', 'عامل بناء', 'أمن', 'ميكانيكي',
      'سباك', 'نجار', 'عامل توصيل', 'حداد'],
  },
  {
    locale: 'ar_AE', market: 'AE',
    keywords: ['warehouse worker', 'driver', 'cleaner', 'cook', 'labourer',
      'electrician', 'welder', 'mason', 'security guard', 'mechanic',
      'plumber', 'carpenter', 'delivery driver', 'gardener'],
  },
  {
    locale: 'es_CO', market: 'CO',
    keywords: ['bodeguero', 'conductor', 'auxiliar aseo', 'cocinero',
      'operario producción', 'electricista', 'soldador', 'mecánico', 'albañil',
      'vigilante', 'empacador', 'mesero', 'panadero', 'todero', 'obrero'],
  },
  {
    locale: 'es_AR', market: 'AR',
    keywords: ['operario depósito', 'chofer', 'auxiliar limpieza', 'cocinero',
      'operario producción', 'electricista', 'soldador', 'mecánico', 'albañil',
      'vigilador', 'empacador', 'mozo', 'panadero', 'carnicero', 'peón'],
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
  const key = `careerjet-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'CareerJet' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'CareerJet', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'CareerJet',
          slug: `careerjet-${market.toLowerCase()}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.careerjet.com',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `CareerJet ${market} Job Listings`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: [`https://www.careerjet.com`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── CareerJet API fetch ─────────────────────────────────────────────

async function fetchCareerJet(locale: string, keyword: string, page: number): Promise<any> {
  const params = new URLSearchParams({
    locale_code: locale,
    keywords: keyword,
    page: String(page),
    page_size: String(PAGE_SIZE),
    fragment_size: '500',
    sort: 'date',
    user_ip: USER_IP,
    user_agent: USER_AGENT,
  });

  const url = `${API_BASE}?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const authHeader = 'Basic ' + Buffer.from(`${CAREERJET_API_KEY}:`).toString('base64');
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Referer': REFERER,
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
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
        const data = await fetchCareerJet(config.locale, keyword, page);

        if (data.type === 'ERROR') {
          console.warn(`  [${config.market}] API error for "${keyword}": ${data.error}`);
          stats.errors++;
          hasMore = false;
          continue;
        }

        const jobs = data.jobs || [];
        stats.fetched += jobs.length;

        for (const job of jobs) {
          const jobUrl = job.url || '';
          if (!jobUrl) { stats.skipped++; continue; }

          // Use URL as dedup key since CareerJet doesn't expose stable IDs
          const urlHash = md5(jobUrl);
          if (seen.has(urlHash)) { stats.skipped++; continue; }
          seen.add(urlHash);

          const title = job.title || keyword;
          const canonicalUrl = jobUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`careerjet:${config.locale}:${urlHash}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const city = job.locations || null;
          const companyName = job.company || null;
          const desc = job.description?.substring(0, 5000) || null;

          // Blue-collar filter — reject white-collar jobs
          if (!isBlueCollar(title, desc)) {
            stats.skipped++;
            continue;
          }

          batch.push({
            title,
            slug,
            sourceUrl: jobUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: config.market,
            city,
            sector: detectSector(title, desc),
            description: desc,
            postedDate: job.date ? new Date(job.date) : null,
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

        const totalHits = data.hits || 0;
        hasMore = jobs.length === PAGE_SIZE && page < MAX_PAGES && (page * PAGE_SIZE) < totalHits;
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
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  return flushBatchUpsert(prisma, batch);
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!CAREERJET_API_KEY) {
    console.error('❌ CAREERJET_API_KEY environment variable not set!');
    console.error('   Set it: export CAREERJET_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const target = (process.argv[2] || 'ALL').toUpperCase();

  console.log(`\n🟢 Mavi Yaka — CareerJet Bulk Import`);
  console.log(`Target: ${target}`);
  console.log(`Markets: ${MARKET_CONFIGS.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };

  const configs = target === 'ALL'
    ? MARKET_CONFIGS
    : MARKET_CONFIGS.filter(c => c.locale.split('_')[1]?.toUpperCase() === target || c.market === target);

  if (configs.length === 0) {
    console.error(`No config found for "${target}"`);
    return;
  }

  try {
    for (const config of configs) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`[${config.locale} → ${config.market}] Starting... (${config.keywords.length} keywords)`);

      const unique = await importMarket(config, stats);
      console.log(`[${config.locale} → ${config.market}] Done: ${unique.toLocaleString()} unique`);
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
