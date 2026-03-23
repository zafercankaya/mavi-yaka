export interface MarketConfig {
  market: string;
  slug: string;
  language: string;
  locale: string;
  appName: string;
  flag: string;
  countryName: string;
  storeListingFile: string;
  dir: 'ltr' | 'rtl';
  seoKeywords: string[];
  playStoreUrl: string;
  appStoreUrl: string;
}

const PLAY_STORE_BASE = 'https://play.google.com/store/apps/details?id=com.maviyaka.app';
const APP_STORE_BASE = 'https://apps.apple.com/app/mavi-yaka/id';

export const MARKETS: MarketConfig[] = [
  {
    market: 'TR', slug: 'tr', language: 'tr', locale: 'tr-TR',
    appName: 'Mavi Yaka', flag: '\u{1F1F9}\u{1F1F7}', countryName: 'Turkiye',
    storeListingFile: 'tr', dir: 'ltr',
    seoKeywords: ['is ilanlari', 'mavi yaka is', 'depo elemani', 'fabrika isci', 'sofor', 'insaat iscisi', 'guvenlik gorevlisi', 'temizlik elemani', 'garson', 'kurye'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'US', slug: 'us', language: 'en', locale: 'en-US',
    appName: 'Blue Collar Jobs', flag: '\u{1F1FA}\u{1F1F8}', countryName: 'United States',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['blue collar jobs', 'warehouse jobs', 'factory jobs', 'construction jobs', 'truck driver jobs', 'forklift operator', 'security guard jobs', 'cleaning jobs'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'DE', slug: 'de', language: 'de', locale: 'de-DE',
    appName: 'Arbeiter Jobs', flag: '\u{1F1E9}\u{1F1EA}', countryName: 'Deutschland',
    storeListingFile: 'de', dir: 'ltr',
    seoKeywords: ['Stellenangebote', 'Lagerarbeiter', 'Produktionsmitarbeiter', 'Bauarbeiter', 'LKW Fahrer', 'Fabrikarbeiter', 'Sicherheitsdienst', 'Reinigungskraft'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'UK', slug: 'uk', language: 'en', locale: 'en-GB',
    appName: 'Blue Collar Jobs', flag: '\u{1F1EC}\u{1F1E7}', countryName: 'United Kingdom',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['blue collar jobs UK', 'warehouse operative', 'factory worker', 'construction labourer', 'HGV driver', 'security officer', 'cleaning jobs', 'forklift driver'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'IN', slug: 'in', language: 'en', locale: 'en-IN',
    appName: 'Blue Collar Jobs', flag: '\u{1F1EE}\u{1F1F3}', countryName: 'India',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['blue collar jobs India', 'warehouse jobs', 'factory worker', 'driver jobs', 'security guard', 'helper jobs', 'construction worker', 'delivery boy jobs'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'BR', slug: 'br', language: 'pt', locale: 'pt-BR',
    appName: 'Vagas Operacionais', flag: '\u{1F1E7}\u{1F1F7}', countryName: 'Brasil',
    storeListingFile: 'pt', dir: 'ltr',
    seoKeywords: ['vagas de emprego', 'auxiliar de producao', 'operador de empilhadeira', 'motorista', 'pedreiro', 'ajudante geral', 'seguranca', 'servicos gerais'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'ID', slug: 'id', language: 'id', locale: 'id-ID',
    appName: 'Lowongan Kerja', flag: '\u{1F1EE}\u{1F1E9}', countryName: 'Indonesia',
    storeListingFile: 'id', dir: 'ltr',
    seoKeywords: ['lowongan kerja', 'operator gudang', 'buruh pabrik', 'supir', 'tukang bangunan', 'satpam', 'cleaning service', 'kurir'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'RU', slug: 'ru', language: 'ru', locale: 'ru-RU',
    appName: 'Rabochie Vakansii', flag: '\u{1F1F7}\u{1F1FA}', countryName: 'Rossiya',
    storeListingFile: 'ru', dir: 'ltr',
    seoKeywords: ['vakansii', 'rabota na sklade', 'rabochiy na zavode', 'voditel', 'stroitel', 'okhrannik', 'uborshchik', 'gruzchik'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'MX', slug: 'mx', language: 'es', locale: 'es-MX',
    appName: 'Empleos Operativos', flag: '\u{1F1F2}\u{1F1FD}', countryName: 'Mexico',
    storeListingFile: 'es', dir: 'ltr',
    seoKeywords: ['empleos', 'operador de almacen', 'obrero de fabrica', 'chofer', 'albanil', 'vigilante', 'intendencia', 'repartidor'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'JP', slug: 'jp', language: 'ja', locale: 'ja-JP',
    appName: 'Genba no Shigoto', flag: '\u{1F1EF}\u{1F1F5}', countryName: 'Nihon',
    storeListingFile: 'ja', dir: 'ltr',
    seoKeywords: ['kyuujin', 'souko sagyou', 'koujou sagyou', 'unten', 'kensetsu sagyou', 'keibi', 'seisou', 'haitatsu'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'PH', slug: 'ph', language: 'en', locale: 'en-PH',
    appName: 'Blue Collar Jobs', flag: '\u{1F1F5}\u{1F1ED}', countryName: 'Philippines',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['jobs Philippines', 'warehouse worker', 'factory worker', 'driver jobs', 'construction worker', 'security guard', 'janitor', 'delivery rider'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'TH', slug: 'th', language: 'th', locale: 'th-TH',
    appName: 'Haa Ngaan', flag: '\u{1F1F9}\u{1F1ED}', countryName: 'Prathet Thai',
    storeListingFile: 'th', dir: 'ltr',
    seoKeywords: ['haa ngaan', 'phanakngaan khlang', 'khon ngaan roong ngaan', 'khon khap rot', 'chang koo saang', 'yaam', 'mae baan', 'phanakngaan song khong'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'CA', slug: 'ca', language: 'en', locale: 'en-CA',
    appName: 'Blue Collar Jobs', flag: '\u{1F1E8}\u{1F1E6}', countryName: 'Canada',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['jobs Canada', 'warehouse jobs', 'construction jobs', 'truck driver', 'factory worker', 'general labourer', 'security guard', 'janitor'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'AU', slug: 'au', language: 'en', locale: 'en-AU',
    appName: 'Blue Collar Jobs', flag: '\u{1F1E6}\u{1F1FA}', countryName: 'Australia',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['jobs Australia', 'warehouse jobs', 'construction jobs', 'truck driver', 'factory hand', 'labourer', 'forklift operator', 'security officer'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'FR', slug: 'fr', language: 'fr', locale: 'fr-FR',
    appName: 'Emplois Manuels', flag: '\u{1F1EB}\u{1F1F7}', countryName: 'France',
    storeListingFile: 'fr', dir: 'ltr',
    seoKeywords: ['offres emploi', 'magasinier', 'ouvrier usine', 'chauffeur', 'macon', 'agent de securite', 'agent entretien', 'livreur'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'IT', slug: 'it', language: 'it', locale: 'it-IT',
    appName: 'Lavori Manuali', flag: '\u{1F1EE}\u{1F1F9}', countryName: 'Italia',
    storeListingFile: 'it', dir: 'ltr',
    seoKeywords: ['offerte lavoro', 'magazziniere', 'operaio fabbrica', 'autista', 'muratore', 'guardia giurata', 'addetto pulizie', 'corriere'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'ES', slug: 'es', language: 'es', locale: 'es-ES',
    appName: 'Empleos Operativos', flag: '\u{1F1EA}\u{1F1F8}', countryName: 'Espana',
    storeListingFile: 'es', dir: 'ltr',
    seoKeywords: ['ofertas empleo', 'mozo almacen', 'operario fabrica', 'conductor', 'albanil', 'vigilante seguridad', 'limpieza', 'repartidor'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'EG', slug: 'eg', language: 'ar', locale: 'ar-EG',
    appName: 'Wazaaif Ummaaliyya', flag: '\u{1F1EA}\u{1F1EC}', countryName: 'Misr',
    storeListingFile: 'ar', dir: 'rtl',
    seoKeywords: ['wazaaif', 'ameen mustodaa', 'aamil masna', 'saaeq', 'aamil binaa', 'haaris amn', 'aamil nazaafa', 'mandoob tawseel'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'SA', slug: 'sa', language: 'ar', locale: 'ar-SA',
    appName: 'Wazaaif Ummaaliyya', flag: '\u{1F1F8}\u{1F1E6}', countryName: 'As-Saudiyya',
    storeListingFile: 'ar', dir: 'rtl',
    seoKeywords: ['wazaaif', 'ameen mustodaa', 'aamil masna', 'saaeq', 'aamil binaa', 'haaris amn', 'aamil nazaafa'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'KR', slug: 'kr', language: 'ko', locale: 'ko-KR',
    appName: 'Saengsan-jik Chaeyong', flag: '\u{1F1F0}\u{1F1F7}', countryName: 'Hanguk',
    storeListingFile: 'ko', dir: 'ltr',
    seoKeywords: ['chaeyong jeongbo', 'changgo gwalli', 'gongjang geulloja', 'unjeonsawa', 'geonseol geulloja', 'gyeongbiwon', 'cheongso', 'baedal'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'AR', slug: 'ar-country', language: 'es', locale: 'es-AR',
    appName: 'Empleos Operativos', flag: '\u{1F1E6}\u{1F1F7}', countryName: 'Argentina',
    storeListingFile: 'es', dir: 'ltr',
    seoKeywords: ['empleos Argentina', 'operario almacen', 'obrero fabrica', 'chofer', 'albanil', 'vigilador', 'limpieza', 'cadete'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'AE', slug: 'ae', language: 'ar', locale: 'ar-AE',
    appName: 'Wazaaif Ummaaliyya', flag: '\u{1F1E6}\u{1F1EA}', countryName: 'Al-Imaaraat',
    storeListingFile: 'ar', dir: 'rtl',
    seoKeywords: ['wazaaif dubay', 'ameen mustodaa', 'aamil masna', 'saaeq', 'aamil binaa', 'haaris amn'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'VN', slug: 'vn', language: 'vi', locale: 'vi-VN',
    appName: 'Viec Lam Pho Thong', flag: '\u{1F1FB}\u{1F1F3}', countryName: 'Viet Nam',
    storeListingFile: 'vi', dir: 'ltr',
    seoKeywords: ['viec lam', 'thu kho', 'cong nhan nha may', 'tai xe', 'tho xay', 'bao ve', 'tap vu', 'shipper'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'PL', slug: 'pl', language: 'pl', locale: 'pl-PL',
    appName: 'Praca Fizyczna', flag: '\u{1F1F5}\u{1F1F1}', countryName: 'Polska',
    storeListingFile: 'pl', dir: 'ltr',
    seoKeywords: ['oferty pracy', 'magazynier', 'operator produkcji', 'kierowca', 'murarz', 'ochroniarz', 'sprzataczka', 'kurier'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'MY', slug: 'my', language: 'ms', locale: 'ms-MY',
    appName: 'Pekerjaan Am', flag: '\u{1F1F2}\u{1F1FE}', countryName: 'Malaysia',
    storeListingFile: 'ms', dir: 'ltr',
    seoKeywords: ['jawatan kosong', 'pekerja gudang', 'operator kilang', 'pemandu', 'pekerja binaan', 'pengawal keselamatan', 'pembersihan', 'penghantar'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'CO', slug: 'co', language: 'es', locale: 'es-CO',
    appName: 'Empleos Operativos', flag: '\u{1F1E8}\u{1F1F4}', countryName: 'Colombia',
    storeListingFile: 'es', dir: 'ltr',
    seoKeywords: ['empleos Colombia', 'auxiliar bodega', 'operario produccion', 'conductor', 'albanil', 'vigilante', 'aseo', 'mensajero'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'ZA', slug: 'za', language: 'en', locale: 'en-ZA',
    appName: 'Blue Collar Jobs', flag: '\u{1F1FF}\u{1F1E6}', countryName: 'South Africa',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['jobs South Africa', 'warehouse worker', 'factory worker', 'driver', 'construction worker', 'security guard', 'cleaner', 'general worker'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'PT', slug: 'pt-country', language: 'pt', locale: 'pt-PT',
    appName: 'Vagas Operacionais', flag: '\u{1F1F5}\u{1F1F9}', countryName: 'Portugal',
    storeListingFile: 'pt', dir: 'ltr',
    seoKeywords: ['ofertas emprego', 'armazenista', 'operador fabrica', 'motorista', 'pedreiro', 'seguranca', 'limpeza', 'estafeta'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'NL', slug: 'nl', language: 'nl', locale: 'nl-NL',
    appName: 'Handwerk Vacatures', flag: '\u{1F1F3}\u{1F1F1}', countryName: 'Nederland',
    storeListingFile: 'nl', dir: 'ltr',
    seoKeywords: ['vacatures', 'magazijnmedewerker', 'productiemedewerker', 'chauffeur', 'bouwvakker', 'beveiliger', 'schoonmaker', 'bezorger'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'PK', slug: 'pk', language: 'ur', locale: 'ur-PK',
    appName: 'Mazdoor Naukariyan', flag: '\u{1F1F5}\u{1F1F0}', countryName: 'Pakistan',
    storeListingFile: 'ur', dir: 'rtl',
    seoKeywords: ['naukariyan', 'godam worker', 'factory mazdoor', 'driver', 'mistri', 'chowkidar', 'safai worker', 'delivery boy'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'SE', slug: 'se', language: 'sv', locale: 'sv-SE',
    appName: 'Yrkesjobb', flag: '\u{1F1F8}\u{1F1EA}', countryName: 'Sverige',
    storeListingFile: 'sv', dir: 'ltr',
    seoKeywords: ['lediga jobb', 'lagerarbetare', 'fabriksarbetare', 'lastbilschauffor', 'byggarbetare', 'vakt', 'stadare', 'bud'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
];

export const MARKET_MAP: Record<string, MarketConfig> = Object.fromEntries(
  MARKETS.map(m => [m.slug, m])
);
