/**
 * bulk-import-jooble.ts — Bulk Import from Jooble API (31 countries)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-jooble.ts [market|ALL]
 *
 * Jooble API: POST https://jooble.org/api/{api_key}
 * - Body: { keywords, location, page, ResultOnPage }
 * - Response: { totalCount, jobs: [{ title, location, snippet, salary, source, type, link, company, updated, id }] }
 * - Registration: https://jooble.org/api/about (manual, Cloudflare protected)
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY || '';
const API_URL = `https://jooble.org/api/${JOOBLE_API_KEY}`;
const MAX_PAGES = 10; // 10 pages × 20 = 200 per keyword, 35 keywords = 7,000 max per market
const RESULTS_PER_PAGE = 20; // Jooble default
const REQUEST_DELAY_MS = 800; // Be respectful — 500 requests/day limit
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
  if (/warehouse|lager|logist|driver|chauffeur|courier|delivery|shipping|freight|forklift|truck|postal|packer|kargo|şoför|운전|배달|tài xế|motorista|conductor/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|fabrik|usine|fábrica|operario|생산|sản xuất|pabrik/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop|vendeur|verkäuf|cajero|supermarket|매장|cửa hàng|kasir/i.test(t)) return 'RETAIL';
  if (/construct|builder|mason|carpenter|plumber|roofer|bricklayer|albañil|pedreiro|건설|thợ xây|tukang/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista|조리|đầu bếp|koki|cocinero/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|workshop|정비|thợ sửa|montir|mecánico/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|garment|fabric|봉제|may mặc|tekstil/i.test(t)) return 'TEXTILE';
  if (/nurse|hospital|care.*assist|patient|health|carer|간호|y tá|enfermero/i.test(t)) return 'HEALTHCARE';
  if (/hotel|cleaning|housekeeper|cleaner|청소|khách sạn|limpieza/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agricult|garden|landscape|농업|nông nghiệp|pertanian/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|watchman|경비|bảo vệ|satpam|vigilante/i.test(t)) return 'SECURITY_SERVICES';
  if (/janitor|facility|maintenance|building|관리|vệ sinh|portero/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/weld|metal|steel|iron|forge|용접|hàn|las|soldador/i.test(t)) return 'METAL_STEEL';
  return 'OTHER';
}

interface MarketConfig {
  market: Market;
  location: string; // Country name for Jooble location field
  keywords: string[];
}

// ─── Market configs with localized blue-collar keywords ─────────────

// English keywords work best with Jooble API across all markets.
// Use English location names — Jooble API doesn't support local language locations well.
const ENGLISH_KEYWORDS = [
  'warehouse worker', 'truck driver', 'forklift operator', 'delivery driver',
  'electrician', 'welder', 'plumber', 'carpenter', 'mason', 'painter',
  'cook', 'chef', 'kitchen helper', 'waiter', 'baker',
  'cleaner', 'janitor', 'housekeeper', 'laundry worker',
  'security guard', 'security officer',
  'factory worker', 'machine operator', 'production worker', 'assembly worker', 'packer',
  'mechanic', 'auto mechanic', 'technician', 'maintenance technician',
  'construction worker', 'labourer', 'general worker', 'site worker',
  'caregiver', 'care assistant', 'nursing aide', 'home aide',
  'gardener', 'landscaper', 'farm worker', 'agricultural worker',
  'cashier', 'store worker', 'retail worker', 'stock clerk',
  'bus driver', 'courier', 'mover', 'handler', 'sorter',
  'roofer', 'tiler', 'glazier', 'bricklayer', 'scaffolder',
  'barista', 'dishwasher', 'butcher', 'food handler',
];

// ─── Localized keywords for major non-English markets ────────────

const DE_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'Lagerarbeiter', 'Staplerfahrer', 'Kommissionierer', 'Lagerist', 'Versandmitarbeiter',
  'LKW-Fahrer', 'Berufskraftfahrer', 'Paketzusteller', 'Kurier',
  'Elektriker', 'Schweißer', 'Schlosser', 'Klempner', 'Installateur',
  'Koch', 'Küchenhilfe', 'Servicekraft', 'Kellner', 'Bäcker', 'Fleischer',
  'Reinigungskraft', 'Gebäudereiniger', 'Hausmeister',
  'Produktionsmitarbeiter', 'Maschinenführer', 'Monteur', 'Mechaniker',
  'Bauarbeiter', 'Maurer', 'Dachdecker', 'Maler', 'Zimmermann',
  'Gabelstaplerfahrer', 'Helfer', 'Produktionshelfer',
  'Pflegehelfer', 'Altenpfleger', 'Krankenpfleger',
  'Gärtner', 'Landschaftspfleger',
  'Verkäufer', 'Kassierer',
  'Sicherheitsmitarbeiter', 'Wachmann',
];

const FR_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'manutentionnaire', 'cariste', 'magasinier', 'préparateur de commandes',
  'chauffeur', 'chauffeur poids lourd', 'livreur', 'coursier',
  'électricien', 'soudeur', 'plombier', 'menuisier', 'maçon', 'peintre',
  'cuisinier', 'commis de cuisine', 'serveur', 'plongeur', 'boulanger', 'boucher',
  'agent de nettoyage', 'agent d\'entretien', 'femme de ménage',
  'opérateur de production', 'conducteur de ligne', 'monteur', 'mécanicien',
  'ouvrier', 'manoeuvre', 'charpentier', 'couvreur', 'coffreur',
  'agent de sécurité', 'gardien', 'vigile',
  'aide-soignant', 'auxiliaire de vie',
  'jardinier', 'paysagiste', 'ouvrier agricole',
  'caissier', 'employé libre service',
];

const TR_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'şoför', 'kurye', 'dağıtıcı', 'tır şoförü',
  'elektrikçi', 'kaynakçı', 'tesisatçı', 'boyacı', 'marangoz',
  'aşçı', 'garson', 'bulaşıkçı', 'fırıncı', 'kasap',
  'temizlik görevlisi', 'temizlikçi',
  'üretim elemanı', 'makine operatörü', 'montajcı', 'tornacı', 'kaynakçı',
  'inşaat işçisi', 'kalıpçı', 'duvarcı', 'sıvacı', 'çelikçi',
  'güvenlik görevlisi', 'bekçi',
  'bakıcı', 'hasta bakıcı', 'yaşlı bakıcı',
  'bahçıvan', 'tarım işçisi',
  'kasiyer', 'reyon elemanı', 'depocu', 'forkliftçi',
];

const ES_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'almacenero', 'montacarguista', 'operador de montacargas',
  'chofer', 'conductor', 'camionero', 'repartidor', 'mensajero',
  'electricista', 'soldador', 'plomero', 'carpintero', 'albañil', 'pintor',
  'cocinero', 'mesero', 'lavaplatos', 'panadero', 'carnicero',
  'limpieza', 'intendencia', 'mantenimiento',
  'operador de producción', 'maquinista', 'mecánico', 'técnico',
  'obrero', 'peón', 'ayudante general', 'construcción',
  'guardia de seguridad', 'vigilante',
  'cuidador', 'enfermero auxiliar',
  'jardinero', 'agricultor', 'jornalero',
  'cajero', 'vendedor',
];

const PT_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'operador de empilhadeira', 'motorista', 'caminhoneiro', 'entregador', 'motoboy',
  'eletricista', 'soldador', 'encanador', 'carpinteiro', 'pedreiro', 'pintor',
  'cozinheiro', 'garçom', 'padeiro', 'açougueiro', 'auxiliar de cozinha',
  'auxiliar de limpeza', 'faxineiro', 'zelador',
  'operador de produção', 'operador de máquinas', 'mecânico', 'montador',
  'servente', 'ajudante geral', 'peão de obra',
  'vigilante', 'porteiro', 'segurança',
  'cuidador', 'auxiliar de enfermagem',
  'jardineiro', 'trabalhador rural',
  'caixa', 'repositor', 'estoquista',
];

const RU_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'грузчик', 'водитель', 'курьер', 'экспедитор', 'кладовщик',
  'электрик', 'сварщик', 'сантехник', 'плотник', 'маляр', 'каменщик',
  'повар', 'официант', 'посудомойщик', 'пекарь', 'мясник',
  'уборщик', 'уборщица', 'дворник',
  'оператор', 'станочник', 'слесарь', 'токарь', 'фрезеровщик', 'монтажник',
  'разнорабочий', 'подсобный рабочий', 'бетонщик', 'арматурщик',
  'охранник', 'сторож',
  'санитар', 'сиделка',
  'садовник', 'тракторист', 'комбайнер',
  'кассир', 'продавец', 'кладовщик',
];

const IT_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'magazziniere', 'carrellista', 'mulettista',
  'autista', 'camionista', 'corriere', 'fattorino',
  'elettricista', 'saldatore', 'idraulico', 'falegname', 'muratore', 'imbianchino',
  'cuoco', 'cameriere', 'lavapiatti', 'panettiere', 'macellaio',
  'addetto pulizie', 'collaboratore domestico',
  'operaio', 'operatore macchina', 'meccanico', 'montatore',
  'manovale', 'carpentiere', 'ferraiolo',
  'guardia giurata', 'vigilante', 'portiere',
  'badante', 'assistente domiciliare',
  'giardiniere', 'bracciante agricolo',
  'cassiere', 'commesso', 'scaffalista',
];

const NL_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'magazijnmedewerker', 'heftruckchauffeur', 'orderpicker',
  'vrachtwagenchauffeur', 'bezorger', 'koerier',
  'elektricien', 'lasser', 'loodgieter', 'timmerman', 'metselaar', 'schilder',
  'kok', 'kelner', 'afwasser', 'bakker', 'slager',
  'schoonmaker', 'schoonmaakster',
  'productiemedewerker', 'machineoperator', 'monteur', 'montage medewerker',
  'bouwvakker', 'stratenmaker', 'dakdekker',
  'beveiliger', 'bewaker',
  'verzorger', 'verpleegkundige',
  'tuinman', 'hovenier',
  'caissière', 'winkelbediende', 'vakkenvuller',
];

const PL_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'magazynier', 'operator wózka', 'pakowacz',
  'kierowca', 'kurier', 'dostawca',
  'elektryk', 'spawacz', 'hydraulik', 'stolarz', 'murarz', 'malarz',
  'kucharz', 'kelner', 'pomoc kuchenna', 'piekarz', 'rzeźnik',
  'sprzątaczka', 'sprzątacz',
  'operator produkcji', 'operator maszyn', 'mechanik', 'monter', 'ślusarz', 'tokarz',
  'robotnik budowlany', 'murarz', 'cieśla', 'dekarz',
  'ochroniarz', 'portier',
  'opiekunka', 'opiekun osób starszych',
  'ogrodnik', 'pracownik rolny',
  'kasjer', 'sprzedawca',
];

const JP_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  '倉庫作業', 'フォークリフト', 'ピッキング',
  'ドライバー', 'トラック運転手', '配達', '配送',
  '電気工事', '溶接工', '配管工', '大工', '左官', '塗装',
  '調理師', '調理補助', 'ホールスタッフ', 'パン職人', '食肉加工',
  '清掃', 'ビル清掃',
  '製造', '機械オペレーター', '組立', '検品', '検査',
  '建設作業', '土木作業', '鳶', '鉄筋工',
  '警備員', '守衛',
  '介護', '介護福祉士', 'ヘルパー',
  '農業', '造園',
];

const KR_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  '창고', '지게차', '물류', '포장',
  '운전기사', '택배', '배달', '퀵서비스',
  '전기기사', '용접공', '배관공', '목수', '미장공', '도장공',
  '조리사', '주방보조', '서빙', '제빵사',
  '청소', '환경미화',
  '생산직', '기계조작', '조립', '검수', '포장',
  '건설', '토목', '철근공', '비계공',
  '경비원', '보안',
  '요양보호사', '간병인',
  '농업', '조경',
];

const VN_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'công nhân kho', 'nhân viên kho', 'lái xe tải', 'tài xế', 'shipper', 'giao hàng', 'bốc xếp',
  'công nhân sản xuất', 'công nhân nhà máy', 'thợ máy', 'vận hành máy', 'đóng gói',
  'thợ điện', 'thợ hàn', 'thợ ống nước', 'thợ mộc', 'thợ xây', 'thợ sơn',
  'đầu bếp', 'phụ bếp', 'phục vụ', 'thợ làm bánh', 'nhân viên bếp',
  'tạp vụ', 'vệ sinh', 'lao công', 'dọn phòng',
  'bảo vệ', 'nhân viên an ninh',
  'thợ cơ khí', 'kỹ thuật viên', 'thợ sửa chữa',
  'thu ngân', 'nhân viên bán hàng', 'nhân viên siêu thị',
  'nông nghiệp', 'làm vườn', 'chăn nuôi',
  'may mặc', 'thợ may', 'công nhân may',
  'xe ôm', 'grab', 'xe máy',
];

const TH_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'พนักงานคลังสินค้า', 'พนักงานขับรถ', 'พนักงานขับรถบรรทุก', 'คนส่งของ', 'ไรเดอร์',
  'พนักงานโรงงาน', 'ช่างเครื่อง', 'พนักงานผลิต', 'พนักงานบรรจุ', 'พนักงานประกอบ',
  'ช่างไฟฟ้า', 'ช่างเชื่อม', 'ช่างประปา', 'ช่างไม้', 'ช่างก่อสร้าง', 'ช่างทาสี',
  'พ่อครัว', 'แม่ครัว', 'ผู้ช่วยครัว', 'พนักงานเสิร์ฟ', 'คนทำขนมปัง',
  'แม่บ้าน', 'พนักงานทำความสะอาด',
  'รปภ', 'พนักงานรักษาความปลอดภัย',
  'ช่างยนต์', 'ช่างซ่อม', 'ช่างแอร์',
  'พนักงานแคชเชียร์', 'พนักงานขาย', 'พนักงานร้านค้า',
  'เกษตรกร', 'คนสวน',
  'ช่างตัดผม', 'พนักงานนวด',
];

const ID_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'pekerja gudang', 'sopir truk', 'supir', 'kurir', 'pengantar barang',
  'operator mesin', 'pekerja pabrik', 'buruh pabrik', 'operator produksi', 'packing',
  'tukang listrik', 'tukang las', 'tukang ledeng', 'tukang kayu', 'tukang batu', 'tukang cat',
  'koki', 'juru masak', 'pramusaji', 'tukang roti',
  'cleaning service', 'office boy', 'satpam', 'security',
  'montir', 'mekanik', 'teknisi',
  'kasir', 'pramuniaga', 'SPG',
  'petani', 'tukang kebun', 'nelayan',
  'penjahit', 'buruh', 'kuli bangunan',
  'ojol', 'grab driver', 'gojek',
];

const SE_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  'lagerarbetare', 'truckförare', 'godshanterare', 'plocka order', 'paketerare',
  'lastbilschaufför', 'chaufför', 'budbil', 'brevbärare',
  'elektriker', 'svetsare', 'rörmokare', 'snickare', 'murare', 'målare',
  'kock', 'köksbiträde', 'servitör', 'servitris', 'bagare', 'slaktare',
  'städare', 'lokalvårdare', 'fastighetsskötare', 'vaktmästare',
  'väktare', 'ordningsvakt',
  'maskinoperatör', 'montör', 'mekaniker', 'bilmekaniker',
  'byggnadsarbetare', 'anläggningsarbetare', 'betongarbetare',
  'kassör', 'butikssäljare', 'lagermedarbetare',
  'undersköterska', 'vårdbiträde', 'hemtjänst',
  'trädgårdsmästare', 'lantarbetare',
];

const AR_KEYWORDS = [
  ...ENGLISH_KEYWORDS,
  // Arabic keywords for SA, AE, EG
  'عامل مستودع', 'سائق شاحنة', 'سائق توصيل', 'مندوب توصيل',
  'كهربائي', 'لحام', 'سباك', 'نجار', 'بناء', 'دهان',
  'طباخ', 'شيف', 'مساعد مطبخ', 'نادل', 'خباز', 'جزار',
  'عامل نظافة', 'حارس أمن', 'عامل صيانة',
  'عامل مصنع', 'مشغل آلات', 'فني', 'ميكانيكي',
  'عامل بناء', 'عامل',
  'بائع', 'كاشير', 'مندوب',
  'مزارع', 'بستاني', 'سائق',
];

const MARKET_CONFIGS: MarketConfig[] = [
  // ─── Markets with localized keywords ───
  { market: 'DE', location: 'Germany', keywords: DE_KEYWORDS },
  { market: 'FR', location: 'France', keywords: FR_KEYWORDS },
  { market: 'TR', location: 'Turkey', keywords: TR_KEYWORDS },
  { market: 'ES', location: 'Spain', keywords: ES_KEYWORDS },
  { market: 'MX', location: 'Mexico', keywords: ES_KEYWORDS },
  { market: 'CO', location: 'Colombia', keywords: ES_KEYWORDS },
  { market: 'AR', location: 'Argentina', keywords: ES_KEYWORDS },
  { market: 'PT', location: 'Portugal', keywords: PT_KEYWORDS },
  { market: 'BR', location: 'Brazil', keywords: PT_KEYWORDS },
  { market: 'RU', location: 'Russia', keywords: RU_KEYWORDS },
  { market: 'IT', location: 'Italy', keywords: IT_KEYWORDS },
  { market: 'NL', location: 'Netherlands', keywords: NL_KEYWORDS },
  { market: 'PL', location: 'Poland', keywords: PL_KEYWORDS },
  { market: 'JP', location: 'Japan', keywords: JP_KEYWORDS },
  { market: 'KR', location: 'South Korea', keywords: KR_KEYWORDS },
  { market: 'VN', location: 'Vietnam', keywords: VN_KEYWORDS },
  { market: 'TH', location: 'Thailand', keywords: TH_KEYWORDS },
  { market: 'ID', location: 'Indonesia', keywords: ID_KEYWORDS },
  { market: 'SE', location: 'Sweden', keywords: SE_KEYWORDS },
  { market: 'SA', location: 'Saudi Arabia', keywords: AR_KEYWORDS },
  { market: 'AE', location: 'United Arab Emirates', keywords: AR_KEYWORDS },
  { market: 'EG', location: 'Egypt', keywords: AR_KEYWORDS },
  // ─── Markets where English keywords work well ───
  { market: 'US', location: 'United States', keywords: ENGLISH_KEYWORDS },
  { market: 'UK', location: 'United Kingdom', keywords: ENGLISH_KEYWORDS },
  { market: 'CA', location: 'Canada', keywords: ENGLISH_KEYWORDS },
  { market: 'AU', location: 'Australia', keywords: ENGLISH_KEYWORDS },
  { market: 'IN', location: 'India', keywords: ENGLISH_KEYWORDS },
  { market: 'PH', location: 'Philippines', keywords: ENGLISH_KEYWORDS },
  { market: 'MY', location: 'Malaysia', keywords: ENGLISH_KEYWORDS },
  { market: 'ZA', location: 'South Africa', keywords: ENGLISH_KEYWORDS },
  { market: 'PK', location: 'Pakistan', keywords: ENGLISH_KEYWORDS },
];

// ─── Source management ───────────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `jooble-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'Jooble' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Jooble', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Jooble',
          slug: `jooble-${market.toLowerCase()}-${Date.now().toString(36)}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://jooble.org',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `Jooble ${market} Job Listings`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: ['https://jooble.org'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Jooble API fetch ────────────────────────────────────────────────

async function fetchJooble(keyword: string, location: string, page: number): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: keyword,
        location,
        page: String(page),
      }),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
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
        const data = await fetchJooble(keyword, config.location, page);
        const jobs = data.jobs || [];
        const totalCount = data.totalCount || 0;
        stats.fetched += jobs.length;

        for (const job of jobs) {
          const jobId = String(job.id || '');
          const jobUrl = job.link || '';
          if (!jobId || !jobUrl) { stats.skipped++; continue; }
          if (seen.has(jobId)) { stats.skipped++; continue; }
          seen.add(jobId);

          const title = job.title || keyword;
          const canonicalUrl = jobUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`jooble:${config.market}:${jobId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const desc = job.snippet?.substring(0, 5000) || null;
          const company = job.company || null;
          const location = job.location || null;

          if (!isBlueCollar(title, desc)) {
            stats.skipped++;
            continue;
          }

          // Parse salary if available (format: "val1 - val2 currency")
          let salaryMin: number | null = null;
          let salaryMax: number | null = null;
          if (job.salary) {
            const salaryMatch = job.salary.match(/([0-9,.]+)\s*[-–]\s*([0-9,.]+)/);
            if (salaryMatch) {
              salaryMin = Math.round(parseFloat(salaryMatch[1].replace(/[,]/g, '')));
              salaryMax = Math.round(parseFloat(salaryMatch[2].replace(/[,]/g, '')));
            }
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
            city: location,
            sector: detectSector(title, desc),
            description: desc,
            salaryMin,
            salaryMax,
            postedDate: job.updated ? new Date(job.updated) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        hasMore = jobs.length >= RESULTS_PER_PAGE && page < MAX_PAGES && (page * RESULTS_PER_PAGE) < totalCount;
        page++;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429') || msg.includes('403')) {
          console.warn(`  [${config.market}] Rate limited/blocked, waiting 120s...`);
          await delay(120_000);
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
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!JOOBLE_API_KEY) {
    console.error('❌ JOOBLE_API_KEY not set');
    console.error('   Register at: https://jooble.org/api/about');
    console.error('   Then: export JOOBLE_API_KEY=your_key_here');
    process.exit(1);
  }

  const target = (process.argv[2] || 'ALL').toUpperCase();

  console.log(`\n🟣 Mavi Yaka — Jooble Bulk Import`);
  console.log(`Target: ${target}`);
  console.log(`Markets: ${MARKET_CONFIGS.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };

  const configs = target === 'ALL'
    ? MARKET_CONFIGS
    : MARKET_CONFIGS.filter(c => c.market === target);

  if (configs.length === 0) {
    console.error(`No config found for "${target}"`);
    return;
  }

  try {
    for (const config of configs) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`[${config.market}] Starting... (${config.keywords.length} keywords, location: ${config.location})`);

      const unique = await importMarket(config, stats);
      console.log(`[${config.market}] Done: ${unique.toLocaleString()} unique`);
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
