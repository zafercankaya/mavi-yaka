/**
 * job-platform-api.processor.ts — Unified processor for job platform APIs
 * Supports: Adzuna, Jooble, CareerJet
 * Each platform fetches blue-collar job listings using market-specific queries.
 *
 * Environment variables:
 *   ADZUNA_APP_ID, ADZUNA_APP_KEY
 *   JOOBLE_API_KEY
 *   CAREERJET_API_KEY
 */

import type { RawJobData, Market } from '../pipeline/normalize';

// ── Blue-collar search queries per market (localized) ──

const BLUE_COLLAR_QUERIES: Record<Market, string[]> = {
  TR: ['garson', 'kurye', 'şoför', 'temizlik', 'depocu', 'kasap', 'fırıncı', 'aşçı', 'kaynakçı', 'operatör',
       'forklift', 'paketçi', 'güvenlik görevlisi', 'inşaat işçisi', 'boyacı', 'tesisatçı', 'elektrikçi',
       'bulaşıkçı', 'komi', 'kat görevlisi'],
  US: ['warehouse worker', 'forklift operator', 'truck driver', 'janitor', 'construction laborer',
       'delivery driver', 'machine operator', 'welder', 'plumber', 'electrician',
       'housekeeper', 'dishwasher', 'cook', 'security guard', 'landscaper',
       'painter', 'carpenter', 'mechanic', 'assembly line', 'dock worker'],
  DE: ['Lagerarbeiter', 'Gabelstaplerfahrer', 'LKW-Fahrer', 'Reinigungskraft', 'Bauarbeiter',
       'Lieferfahrer', 'Maschinenführer', 'Schweißer', 'Klempner', 'Elektriker',
       'Zimmermädchen', 'Koch', 'Sicherheitsmitarbeiter', 'Gärtner', 'Maler',
       'Schreiner', 'Mechaniker', 'Montagearbeiter', 'Produktionshelfer', 'Kommissionierer'],
  UK: ['warehouse operative', 'forklift driver', 'HGV driver', 'cleaner', 'labourer',
       'delivery driver', 'machine operator', 'welder', 'plumber', 'electrician',
       'housekeeper', 'kitchen porter', 'chef', 'security officer', 'groundskeeper',
       'painter decorator', 'carpenter', 'mechanic', 'picker packer', 'care assistant'],
  IN: ['warehouse worker', 'delivery boy', 'driver', 'housekeeping', 'construction worker',
       'security guard', 'helper', 'machine operator', 'welder', 'plumber',
       'electrician', 'cook', 'peon', 'loader', 'painter',
       'carpenter', 'mechanic', 'fitter', 'technician', 'packer'],
  BR: ['ajudante de carga', 'motorista', 'empilhadeirista', 'faxineiro', 'pedreiro',
       'entregador', 'operador de máquinas', 'soldador', 'encanador', 'eletricista',
       'camareira', 'cozinheiro', 'vigilante', 'jardineiro', 'pintor',
       'carpinteiro', 'mecânico', 'montador', 'auxiliar de produção', 'estoquista'],
  ID: ['operator gudang', 'supir', 'kurir', 'cleaning service', 'buruh bangunan',
       'pengemudi', 'operator mesin', 'tukang las', 'tukang ledeng', 'teknisi listrik',
       'housekeeping', 'koki', 'satpam', 'tukang kebun', 'tukang cat',
       'tukang kayu', 'mekanik', 'operator produksi', 'helper', 'packer'],
  RU: ['грузчик', 'водитель', 'курьер', 'уборщик', 'разнорабочий',
       'экспедитор', 'оператор станка', 'сварщик', 'сантехник', 'электрик',
       'горничная', 'повар', 'охранник', 'дворник', 'маляр',
       'плотник', 'механик', 'сборщик', 'комплектовщик', 'кладовщик'],
  MX: ['almacenista', 'chofer', 'repartidor', 'limpieza', 'albañil',
       'operador de montacargas', 'soldador', 'plomero', 'electricista', 'cocinero',
       'mesero', 'vigilante', 'jardinero', 'pintor', 'carpintero',
       'mecánico', 'operador de producción', 'empacador', 'ayudante general', 'guardia de seguridad'],
  JP: ['倉庫作業', 'フォークリフト', 'ドライバー', '清掃', '建設作業員',
       '配達', '機械オペレーター', '溶接工', '配管工', '電気工事',
       '客室清掃', '調理師', '警備員', '造園', '塗装工',
       '大工', '整備士', '組立作業', 'ピッキング', '製造スタッフ'],
  FR: ['manutentionnaire', 'cariste', 'chauffeur', 'agent de nettoyage', 'ouvrier bâtiment',
       'livreur', 'opérateur machine', 'soudeur', 'plombier', 'électricien',
       'femme de chambre', 'cuisinier', 'agent de sécurité', 'jardinier', 'peintre',
       'menuisier', 'mécanicien', 'opérateur de production', 'préparateur de commandes', 'agent de quai'],
  IT: ['magazziniere', 'carrellista', 'autista', 'addetto pulizie', 'operaio edile',
       'corriere', 'operatore macchine', 'saldatore', 'idraulico', 'elettricista',
       'cameriera ai piani', 'cuoco', 'guardia giurata', 'giardiniere', 'imbianchino',
       'falegname', 'meccanico', 'operaio di produzione', 'confezionatore', 'facchino'],
  ES: ['mozo de almacén', 'carretillero', 'conductor', 'limpiador', 'peón de obra',
       'repartidor', 'operario de máquinas', 'soldador', 'fontanero', 'electricista',
       'camarero de pisos', 'cocinero', 'vigilante', 'jardinero', 'pintor',
       'carpintero', 'mecánico', 'operario de producción', 'empaquetador', 'mozo de carga'],
  PH: ['warehouse staff', 'delivery rider', 'driver', 'janitor', 'construction worker',
       'helper', 'machine operator', 'welder', 'plumber', 'electrician',
       'housekeeping', 'cook', 'security guard', 'gardener', 'painter',
       'carpenter', 'mechanic', 'factory worker', 'packer', 'loader'],
  TH: ['พนักงานคลังสินค้า', 'คนขับรถ', 'แม่บ้าน', 'ก่อสร้าง', 'ช่างเชื่อม',
       'ช่างไฟฟ้า', 'ช่างประปา', 'พ่อครัว', 'รปภ', 'ช่างทาสี',
       'warehouse', 'driver', 'cleaner', 'cook', 'security guard',
       'mechanic', 'electrician', 'factory worker', 'delivery', 'helper'],
  CA: ['warehouse worker', 'forklift operator', 'truck driver', 'janitor', 'construction labourer',
       'delivery driver', 'machine operator', 'welder', 'plumber', 'electrician',
       'housekeeper', 'dishwasher', 'cook', 'security guard', 'landscaper',
       'painter', 'carpenter', 'mechanic', 'general labour', 'picker packer'],
  AU: ['warehouse worker', 'forklift driver', 'truck driver', 'cleaner', 'labourer',
       'delivery driver', 'machine operator', 'welder', 'plumber', 'electrician',
       'housekeeper', 'kitchen hand', 'chef', 'security officer', 'landscaper',
       'painter', 'carpenter', 'mechanic', 'picker packer', 'process worker'],
  EG: ['عامل مستودع', 'سائق', 'عامل نظافة', 'عامل بناء', 'حارس أمن',
       'طباخ', 'كهربائي', 'سباك', 'لحام', 'نجار',
       'warehouse worker', 'driver', 'cleaner', 'security guard', 'cook',
       'electrician', 'plumber', 'welder', 'carpenter', 'helper'],
  SA: ['عامل مستودع', 'سائق', 'عامل نظافة', 'عامل بناء', 'حارس أمن',
       'طباخ', 'كهربائي', 'سباك', 'لحام', 'نجار',
       'warehouse worker', 'driver', 'cleaner', 'security guard', 'cook',
       'electrician', 'plumber', 'welder', 'carpenter', 'helper'],
  KR: ['창고 작업', '지게차 운전', '배달 기사', '청소', '건설 노동자',
       '용접공', '배관공', '전기 기사', '경비원', '요리사',
       'warehouse', 'driver', 'cleaner', 'welder', 'mechanic',
       'electrician', 'plumber', 'cook', 'security', 'factory worker'],
  AR: ['operario de depósito', 'chofer', 'repartidor', 'limpieza', 'albañil',
       'soldador', 'plomero', 'electricista', 'cocinero', 'mozo',
       'vigilante', 'jardinero', 'pintor', 'carpintero', 'mecánico',
       'operario de producción', 'empacador', 'peón', 'sereno', 'cadete'],
  AE: ['warehouse worker', 'driver', 'cleaner', 'construction worker', 'security guard',
       'cook', 'electrician', 'plumber', 'welder', 'carpenter',
       'helper', 'delivery driver', 'machine operator', 'painter', 'mechanic',
       'technician', 'labourer', 'housekeeper', 'gardener', 'packer'],
  VN: ['công nhân kho', 'tài xế', 'lao công', 'công nhân xây dựng', 'bảo vệ',
       'đầu bếp', 'thợ điện', 'thợ hàn', 'thợ sơn', 'thợ mộc',
       'thợ cơ khí', 'nhân viên giao hàng', 'phụ bếp', 'tạp vụ', 'đóng gói',
       'warehouse', 'driver', 'welder', 'electrician', 'mechanic'],
  PL: ['magazynier', 'operator wózka', 'kierowca', 'sprzątaczka', 'pracownik budowlany',
       'kurier', 'operator maszyn', 'spawacz', 'hydraulik', 'elektryk',
       'pokojówka', 'kucharz', 'ochroniarz', 'ogrodnik', 'malarz',
       'stolarz', 'mechanik', 'pracownik produkcji', 'pakowacz', 'pracownik magazynu'],
  MY: ['warehouse worker', 'driver', 'cleaner', 'construction worker', 'security guard',
       'cook', 'electrician', 'plumber', 'welder', 'carpenter',
       'helper', 'delivery rider', 'machine operator', 'painter', 'mechanic',
       'factory worker', 'labourer', 'housekeeper', 'gardener', 'packer'],
  CO: ['operario de bodega', 'conductor', 'domiciliario', 'servicios generales', 'albañil',
       'soldador', 'plomero', 'electricista', 'cocinero', 'mesero',
       'vigilante', 'jardinero', 'pintor', 'carpintero', 'mecánico',
       'operario de producción', 'empacador', 'auxiliar de carga', 'todero', 'aseador'],
  ZA: ['warehouse worker', 'forklift driver', 'truck driver', 'cleaner', 'labourer',
       'delivery driver', 'machine operator', 'welder', 'plumber', 'electrician',
       'housekeeper', 'cook', 'security guard', 'gardener', 'painter',
       'carpenter', 'mechanic', 'picker packer', 'general worker', 'driver'],
  PT: ['operador de armazém', 'empilhadorista', 'motorista', 'empregada de limpeza', 'pedreiro',
       'estafeta', 'operador de máquinas', 'soldador', 'canalizador', 'eletricista',
       'empregada de andares', 'cozinheiro', 'vigilante', 'jardineiro', 'pintor',
       'carpinteiro', 'mecânico', 'operário fabril', 'embalador', 'ajudante'],
  NL: ['magazijnmedewerker', 'heftruckchauffeur', 'vrachtwagenchauffeur', 'schoonmaker', 'bouwvakker',
       'bezorger', 'machineoperator', 'lasser', 'loodgieter', 'elektricien',
       'kamermeisje', 'kok', 'beveiliger', 'hovenier', 'schilder',
       'timmerman', 'monteur', 'productiemedewerker', 'orderpicker', 'inpakker'],
  PK: ['warehouse worker', 'driver', 'cleaner', 'construction worker', 'security guard',
       'cook', 'electrician', 'plumber', 'welder', 'carpenter',
       'helper', 'delivery rider', 'machine operator', 'painter', 'mechanic',
       'factory worker', 'labourer', 'housekeeper', 'gardener', 'packer'],
  SE: ['lagerarbetare', 'truckförare', 'lastbilsförare', 'städare', 'byggnadsarbetare',
       'leveransförare', 'maskinoperatör', 'svetsare', 'rörmokare', 'elektriker',
       'städerska', 'kock', 'väktare', 'trädgårdsarbetare', 'målare',
       'snickare', 'mekaniker', 'produktionsmedarbetare', 'plockare', 'packare'],
};

// ── Adzuna ──

const ADZUNA_COUNTRIES: Record<string, string> = {
  GB: 'gb', UK: 'gb', US: 'us', AU: 'au', BR: 'br', CA: 'ca',
  DE: 'de', FR: 'fr', IN: 'in', NL: 'nl', PL: 'pl', RU: 'ru',
  ZA: 'za', AT: 'at', NZ: 'nz', IT: 'it', ES: 'es', SE: 'se',
  MX: 'mx',
};

const ADZUNA_DELAY_MS = 350; // stay under ~250 req/day if running 10 queries
const ADZUNA_RESULTS_PER_PAGE = 50;
const ADZUNA_MAX_PAGES = 2; // 2 pages × 50 = 100 per query

async function fetchAdzunaJobs(market: Market): Promise<RawJobData[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) {
    console.log('[Adzuna] Missing ADZUNA_APP_ID or ADZUNA_APP_KEY');
    return [];
  }

  const country = ADZUNA_COUNTRIES[market];
  if (!country) {
    console.log(`[Adzuna] Market ${market} not supported`);
    return [];
  }

  // Use localized queries for the market, fall back to English
  const localQueries = BLUE_COLLAR_QUERIES[market];
  const queries = localQueries ? localQueries.slice(0, 10) : [
    'warehouse worker', 'forklift operator', 'truck driver', 'cleaner', 'construction worker',
    'delivery driver', 'machine operator', 'welder', 'plumber', 'electrician',
  ];
  const jobs: RawJobData[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    for (let page = 1; page <= ADZUNA_MAX_PAGES; page++) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?` +
          `app_id=${appId}&app_key=${appKey}` +
          `&results_per_page=${ADZUNA_RESULTS_PER_PAGE}` +
          `&what=${encodeURIComponent(query)}` +
          `&content-type=application/json`;

        const res = await fetch(url, {
          headers: { 'Accept': 'application/json' },
        });

        if (res.status === 429) {
          console.log(`[Adzuna] Rate limited on "${query}" page ${page}, stopping`);
          return jobs;
        }

        if (!res.ok) {
          console.log(`[Adzuna] ${res.status} for "${query}" page ${page}`);
          break; // next query
        }

        const data = await res.json() as {
          results: Array<{
            title: string;
            description: string;
            redirect_url: string;
            location: { display_name: string; area: string[] };
            company: { display_name: string };
            salary_min?: number;
            salary_max?: number;
            contract_type?: string;
            created: string;
            category: { label: string; tag: string };
          }>;
          count: number;
        };

        if (!data.results?.length) break;

        for (const r of data.results) {
          const jobUrl = r.redirect_url;
          if (seenUrls.has(jobUrl)) continue;
          seenUrls.add(jobUrl);

          const salaryParts: string[] = [];
          if (r.salary_min) salaryParts.push(String(Math.round(r.salary_min)));
          if (r.salary_max) salaryParts.push(String(Math.round(r.salary_max)));

          jobs.push({
            title: r.title,
            description: r.description || '',
            sourceUrl: jobUrl,
            locationText: r.location?.display_name || r.location?.area?.join(', ') || undefined,
            salaryText: salaryParts.length ? salaryParts.join(' - ') : undefined,
            postedDate: r.created || undefined,
            jobTypeText: r.contract_type || undefined,
          });
        }

        if (data.results.length < ADZUNA_RESULTS_PER_PAGE) break; // no more pages

        await delay(ADZUNA_DELAY_MS);
      } catch (err) {
        console.log(`[Adzuna] Error "${query}" p${page}: ${(err as Error).message}`);
        break;
      }
    }
    await delay(ADZUNA_DELAY_MS);
  }

  console.log(`[Adzuna] ${market}: ${jobs.length} jobs from ${queries.length} queries`);
  return jobs;
}

// ── Jooble ──

// Jooble uses a single endpoint; country filtering via location parameter
const JOOBLE_LOCATIONS: Record<string, string> = {
  TR: 'Turkey', US: 'United States', DE: 'Germany', UK: 'United Kingdom',
  IN: 'India', BR: 'Brazil', ID: 'Indonesia', RU: 'Russia',
  MX: 'Mexico', JP: 'Japan', PH: 'Philippines', TH: 'Thailand',
  CA: 'Canada', AU: 'Australia', FR: 'France', IT: 'Italy',
  ES: 'Spain', EG: 'Egypt', SA: 'Saudi Arabia', KR: 'South Korea',
  AR: 'Argentina', AE: 'United Arab Emirates', VN: 'Vietnam', PL: 'Poland',
  MY: 'Malaysia', CO: 'Colombia', ZA: 'South Africa', PT: 'Portugal',
  NL: 'Netherlands', PK: 'Pakistan', SE: 'Sweden',
};

const JOOBLE_DELAY_MS = 500;
const JOOBLE_RESULTS_PER_PAGE = 100;
const JOOBLE_MAX_PAGES = 2;

// Jooble API only supports English queries — use these for all markets
const JOOBLE_EN_QUERIES = [
  'warehouse worker', 'driver', 'cleaner', 'construction worker', 'security guard',
  'cook', 'electrician', 'plumber', 'welder', 'carpenter',
  'delivery driver', 'machine operator', 'mechanic', 'painter', 'factory worker',
  'helper', 'housekeeper', 'gardener', 'packer', 'labourer',
];

async function fetchJoobleJobs(market: Market): Promise<RawJobData[]> {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) {
    console.log('[Jooble] Missing JOOBLE_API_KEY');
    return [];
  }

  const location = JOOBLE_LOCATIONS[market];
  if (!location) {
    console.log(`[Jooble] Market ${market} not supported`);
    return [];
  }

  // Use localized queries for the market, fall back to English
  const localQueries = BLUE_COLLAR_QUERIES[market] || JOOBLE_EN_QUERIES;
  const queries = localQueries.slice(0, 10);
  const jobs: RawJobData[] = [];
  const seenIds = new Set<string>();

  for (const query of queries) {
    for (let page = 1; page <= JOOBLE_MAX_PAGES; page++) {
      try {
        const url = `https://jooble.org/api/${apiKey}`;

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keywords: query,
            location: location,
            page: page,
            ResultOnPage: JOOBLE_RESULTS_PER_PAGE,
          }),
        });

        if (res.status === 429) {
          console.log(`[Jooble] Rate limited on "${query}", stopping`);
          return jobs;
        }

        if (res.status === 403) {
          console.log(`[Jooble] Access denied — invalid API key`);
          return jobs;
        }

        if (!res.ok) {
          console.log(`[Jooble] ${res.status} for "${query}" page ${page}`);
          break;
        }

        const data = await res.json() as {
          totalCount: number;
          jobs: Array<{
            title: string;
            location: string;
            snippet: string;
            salary: string;
            source: string;
            type: string;
            link: string;
            company: string;
            updated: string;
            id: string;
          }>;
        };

        if (!data.jobs?.length) break;

        for (const r of data.jobs) {
          if (seenIds.has(r.id)) continue;
          seenIds.add(r.id);

          jobs.push({
            title: r.title,
            description: r.snippet || '',
            sourceUrl: r.link,
            locationText: r.location || undefined,
            salaryText: r.salary || undefined,
            postedDate: r.updated || undefined,
            jobTypeText: r.type || undefined,
          });
        }

        if (data.jobs.length < JOOBLE_RESULTS_PER_PAGE) break;

        await delay(JOOBLE_DELAY_MS);
      } catch (err) {
        console.log(`[Jooble] Error "${query}" p${page}: ${(err as Error).message}`);
        break;
      }
    }
    await delay(JOOBLE_DELAY_MS);
  }

  console.log(`[Jooble] ${market}: ${jobs.length} jobs from ${queries.length} queries`);
  return jobs;
}

// ── CareerJet ──

const CAREERJET_LOCALES: Record<string, string> = {
  TR: 'tr_TR', US: 'en_US', DE: 'de_DE', UK: 'en_GB', IN: 'en_IN',
  BR: 'pt_BR', ID: 'id_ID', RU: 'ru_RU', MX: 'es_MX', JP: 'ja_JP',
  PH: 'en_PH', TH: 'th_TH', CA: 'en_CA', AU: 'en_AU', FR: 'fr_FR',
  IT: 'it_IT', ES: 'es_ES', EG: 'en_EG', SA: 'en_SA', KR: 'ko_KR',
  AR: 'es_AR', AE: 'en_AE', VN: 'vi_VN', PL: 'pl_PL', MY: 'en_MY',
  CO: 'es_CO', ZA: 'en_ZA', PT: 'pt_PT', NL: 'nl_NL', PK: 'en_PK',
  SE: 'sv_SE',
};

const CAREERJET_DELAY_MS = 400;
const CAREERJET_RESULTS_PER_PAGE = 99; // max 100
const CAREERJET_MAX_PAGES = 2;

async function fetchCareerJetJobs(market: Market): Promise<RawJobData[]> {
  const apiKey = process.env.CAREERJET_API_KEY;
  if (!apiKey) {
    console.log('[CareerJet] Missing CAREERJET_API_KEY');
    return [];
  }

  const locale = CAREERJET_LOCALES[market];
  if (!locale) {
    console.log(`[CareerJet] Market ${market} not supported`);
    return [];
  }

  const queries = (BLUE_COLLAR_QUERIES[market] || BLUE_COLLAR_QUERIES.US).slice(0, 8);
  const jobs: RawJobData[] = [];
  const seenUrls = new Set<string>();

  for (const query of queries) {
    for (let page = 0; page < CAREERJET_MAX_PAGES; page++) {
      try {
        const params = new URLSearchParams({
          keywords: query,
          locale_code: locale,
          page_size: String(CAREERJET_RESULTS_PER_PAGE),
          offset: String(page * CAREERJET_RESULTS_PER_PAGE),
          sort: 'date',
          user_ip: '1.2.3.4',
          user_agent: 'Mozilla/5.0',
        });

        const url = `https://search.api.careerjet.net/v4/query?${params}`;

        // Basic auth: username=apiKey, password=empty
        const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64');

        const res = await fetch(url, {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
          },
        });

        if (res.status === 429) {
          console.log(`[CareerJet] Rate limited on "${query}", stopping`);
          return jobs;
        }

        if (!res.ok) {
          console.log(`[CareerJet] ${res.status} for "${query}" page ${page}`);
          break;
        }

        const data = await res.json() as {
          hits: number;
          jobs: Array<{
            title: string;
            description: string;
            url: string;
            locations: string;
            company: string;
            salary: string;
            date: string;
            site: string;
          }>;
        };

        if (!data.jobs?.length) break;

        for (const r of data.jobs) {
          if (seenUrls.has(r.url)) continue;
          seenUrls.add(r.url);

          jobs.push({
            title: r.title,
            description: r.description || '',
            sourceUrl: r.url,
            locationText: r.locations || undefined,
            salaryText: r.salary || undefined,
            postedDate: r.date || undefined,
          });
        }

        if (data.jobs.length < CAREERJET_RESULTS_PER_PAGE) break;

        await delay(CAREERJET_DELAY_MS);
      } catch (err) {
        console.log(`[CareerJet] Error "${query}" p${page}: ${(err as Error).message}`);
        break;
      }
    }
    await delay(CAREERJET_DELAY_MS);
  }

  console.log(`[CareerJet] ${market}: ${jobs.length} jobs from ${queries.length} queries`);
  return jobs;
}

// ── Unified entry point ──

export type JobPlatform = 'ADZUNA' | 'JOOBLE' | 'CAREERJET';

/**
 * Fetch blue-collar jobs from a specific platform for a given market.
 * Falls back gracefully if API keys are missing.
 */
export async function fetchJobPlatformJobs(
  platform: JobPlatform,
  market: Market,
): Promise<RawJobData[]> {
  switch (platform) {
    case 'ADZUNA': return fetchAdzunaJobs(market);
    case 'JOOBLE': return fetchJoobleJobs(market);
    case 'CAREERJET': return fetchCareerJetJobs(market);
    default: return [];
  }
}

/**
 * Fetch from ALL available platforms for a market, merging results.
 */
export async function fetchAllPlatformJobs(market: Market): Promise<RawJobData[]> {
  const allJobs: RawJobData[] = [];
  const seenUrls = new Set<string>();

  // Try each platform, collect what we can
  for (const platform of ['ADZUNA', 'JOOBLE', 'CAREERJET'] as JobPlatform[]) {
    try {
      const jobs = await fetchJobPlatformJobs(platform, market);
      for (const job of jobs) {
        if (!seenUrls.has(job.sourceUrl)) {
          seenUrls.add(job.sourceUrl);
          allJobs.push(job);
        }
      }
    } catch (err) {
      console.log(`[JobPlatform] ${platform} error for ${market}: ${(err as Error).message}`);
    }
  }

  console.log(`[JobPlatform] ${market} total: ${allJobs.length} unique jobs from all platforms`);
  return allJobs;
}

/**
 * Check which platforms have API keys configured.
 */
export function getAvailablePlatforms(): JobPlatform[] {
  const platforms: JobPlatform[] = [];
  if (process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) platforms.push('ADZUNA');
  if (process.env.JOOBLE_API_KEY) platforms.push('JOOBLE');
  if (process.env.CAREERJET_API_KEY) platforms.push('CAREERJET');
  return platforms;
}

// ── Util ──

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
