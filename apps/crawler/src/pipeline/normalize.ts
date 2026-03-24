import { optimizeImageUrls } from './optimize-images';

// ─── Types ──────────────────────────────────────────────────────────

export type Market = 'TR' | 'US' | 'DE' | 'UK' | 'IN' | 'BR' | 'ID' | 'RU' | 'MX' | 'JP' | 'PH' | 'TH' | 'CA' | 'AU' | 'FR' | 'IT' | 'ES' | 'EG' | 'SA' | 'KR' | 'AR' | 'AE' | 'VN' | 'PL' | 'MY' | 'CO' | 'ZA' | 'PT' | 'NL' | 'PK' | 'SE';

export interface RawJobData {
  title: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  sourceUrl: string;
  imageUrls?: string[];
  deadline?: string;
  postedDate?: string;
  salaryText?: string;
  locationText?: string;
  jobTypeText?: string;
  workModeText?: string;
  experienceText?: string;
}

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'DAILY' | 'SEASONAL' | 'INTERNSHIP' | 'CONTRACT';
export type WorkMode = 'ON_SITE' | 'REMOTE' | 'HYBRID';
export type ExperienceLevel = 'NONE' | 'ENTRY' | 'MID' | 'SENIOR';
export type SalaryPeriod = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type Sector = 'LOGISTICS_TRANSPORTATION' | 'MANUFACTURING' | 'RETAIL' | 'CONSTRUCTION' | 'FOOD_BEVERAGE' | 'AUTOMOTIVE' | 'TEXTILE' | 'MINING_ENERGY' | 'HEALTHCARE' | 'HOSPITALITY_TOURISM' | 'AGRICULTURE' | 'SECURITY_SERVICES' | 'FACILITY_MANAGEMENT' | 'METAL_STEEL' | 'CHEMICALS_PLASTICS' | 'ECOMMERCE_CARGO' | 'TELECOMMUNICATIONS' | 'OTHER';

export interface SalaryInfo {
  min: number | null;
  max: number | null;
  currency: string;
  period: SalaryPeriod;
}

export interface NormalizedJobListing {
  title: string;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  summary: string | null;
  sourceUrl: string;
  canonicalUrl: string;
  imageUrls: string[];
  deadline: Date | null;
  postedDate: Date | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriod | null;
  jobType: JobType | null;
  workMode: WorkMode | null;
  experienceLevel: ExperienceLevel | null;
  sector: Sector | null;
  city: string | null;
  state: string | null;
}

// ─── Constants ──────────────────────────────────────────────────────

const MARKET_CURRENCY: Record<Market, { code: string; symbols: string[] }> = {
  TR: { code: 'TRY', symbols: ['₺', 'TL', 'TRY'] },
  US: { code: 'USD', symbols: ['$', 'USD'] },
  DE: { code: 'EUR', symbols: ['€', 'EUR'] },
  UK: { code: 'GBP', symbols: ['£', 'GBP'] },
  IN: { code: 'INR', symbols: ['₹', 'Rs', 'INR'] },
  BR: { code: 'BRL', symbols: ['R$', 'BRL'] },
  ID: { code: 'IDR', symbols: ['Rp', 'IDR'] },
  RU: { code: 'RUB', symbols: ['₽', 'руб', 'RUB'] },
  MX: { code: 'MXN', symbols: ['$', 'MXN'] },
  JP: { code: 'JPY', symbols: ['¥', '円', 'JPY'] },
  PH: { code: 'PHP', symbols: ['₱', 'PHP'] },
  TH: { code: 'THB', symbols: ['฿', 'THB', 'บาท'] },
  CA: { code: 'CAD', symbols: ['$', 'CAD', 'C$'] },
  AU: { code: 'AUD', symbols: ['$', 'AUD', 'A$'] },
  FR: { code: 'EUR', symbols: ['€', 'EUR'] },
  IT: { code: 'EUR', symbols: ['€', 'EUR'] },
  ES: { code: 'EUR', symbols: ['€', 'EUR'] },
  EG: { code: 'EGP', symbols: ['EGP', 'ج.م', 'E£'] },
  SA: { code: 'SAR', symbols: ['SAR', 'ر.س', 'SR'] },
  KR: { code: 'KRW', symbols: ['₩', 'KRW', '원'] },
  AR: { code: 'ARS', symbols: ['$', 'ARS', 'AR$'] },
  AE: { code: 'AED', symbols: ['AED', 'د.إ'] },
  VN: { code: 'VND', symbols: ['₫', 'VND', 'đ'] },
  PL: { code: 'PLN', symbols: ['zł', 'PLN'] },
  MY: { code: 'MYR', symbols: ['RM', 'MYR'] },
  CO: { code: 'COP', symbols: ['$', 'COP', 'COL$'] },
  ZA: { code: 'ZAR', symbols: ['R', 'ZAR'] },
  PT: { code: 'EUR', symbols: ['€', 'EUR'] },
  NL: { code: 'EUR', symbols: ['€', 'EUR'] },
  PK: { code: 'PKR', symbols: ['Rs', 'PKR', '₨'] },
  SE: { code: 'SEK', symbols: ['kr', 'SEK'] },
};

// Period keywords in multiple languages
const PERIOD_KEYWORDS: { period: SalaryPeriod; keywords: string[] }[] = [
  { period: 'HOURLY', keywords: ['hour', 'hr', '/h', 'saat', 'saatlik', 'stunde', 'hora', 'heure', 'ora', 'час', 'jam', 'ชั่วโมง', '時間', '시간', 'godzin', 'uur', 'timme'] },
  { period: 'DAILY', keywords: ['day', '/d', 'gün', 'günlük', 'tag', 'día', 'jour', 'giorno', 'день', 'hari', 'วัน', '日', '일', 'dzień', 'dag'] },
  { period: 'WEEKLY', keywords: ['week', '/w', 'hafta', 'haftalık', 'woche', 'semana', 'semaine', 'settimana', 'неделя', 'minggu', 'สัปดาห์', '週', '주', 'tydzień', 'vecka'] },
  { period: 'MONTHLY', keywords: ['month', '/mo', 'ay', 'aylık', 'monat', 'mes', 'mois', 'mese', 'месяц', 'bulan', 'เดือน', '月', '월', 'miesiąc', 'maand', 'månad', 'brutto', 'net'] },
  { period: 'YEARLY', keywords: ['year', 'annual', '/yr', 'yıl', 'yıllık', 'jahr', 'año', 'anual', 'année', 'annuel', 'anno', 'annuale', 'год', 'tahun', 'ปี', '年', '연', 'rok', 'jaar', 'år'] },
];

// Job type keywords per language
const JOB_TYPE_KEYWORDS: { type: JobType; keywords: string[] }[] = [
  { type: 'FULL_TIME', keywords: [
    'full-time', 'full time', 'fulltime', 'tam zamanlı', 'tam zamanli', 'vollzeit',
    'tiempo completo', 'jornada completa', 'temps plein', 'tempo pieno', 'tempo integral',
    'полная занятость', 'полный рабочий', 'penuh waktu', 'เต็มเวลา', '正社員', 'フルタイム',
    '정규직', '풀타임', 'pełny etat', 'sepenuh masa', 'voltijd', 'heltid',
  ]},
  { type: 'PART_TIME', keywords: [
    'part-time', 'part time', 'parttime', 'yarı zamanlı', 'yari zamanli', 'teilzeit',
    'medio tiempo', 'media jornada', 'temps partiel', 'tempo parziale', 'meio período',
    'частичная занятость', 'неполный', 'paruh waktu', 'พาร์ทไทม์', 'パート', 'アルバイト',
    '파트타임', '시간제', 'pół etatu', 'separuh masa', 'deeltijd', 'deltid',
  ]},
  { type: 'DAILY', keywords: [
    'daily', 'day labor', 'günlük', 'günübirlik', 'tagelohn', 'jornalero',
    'journalier', 'giornaliero', 'diário', 'дневной', 'harian', 'รายวัน', '日雇い', '일용직',
    'dzienna', 'harian', 'dagelijks', 'daglig',
  ]},
  { type: 'SEASONAL', keywords: [
    'seasonal', 'mevsimlik', 'saisonarbeit', 'saisonal', 'temporada', 'estacional',
    'saisonnier', 'stagionale', 'temporário', 'сезонный', 'musiman', 'ตามฤดูกาล', '季節',
    '계절', 'sezonow', 'bermusim', 'seizoens', 'säsongs',
  ]},
  { type: 'INTERNSHIP', keywords: [
    'intern', 'internship', 'staj', 'stajyer', 'praktikum', 'praktikant',
    'pasantía', 'prácticas', 'stage', 'stagiaire', 'tirocinio', 'estágio',
    'стажировка', 'стажёр', 'magang', 'ฝึกงาน', 'インターン', '실습', '인턴',
    'staż', 'praktyk', 'latihan industri', 'stage', 'praktik',
  ]},
  { type: 'CONTRACT', keywords: [
    'contract', 'contractor', 'freelance', 'sözleşmeli', 'befristet', 'freiberuflich',
    'contrato', 'freelance', 'contrat', 'indépendant', 'contratto', 'libero professionista',
    'контракт', 'фриланс', 'kontrak', 'สัญญาจ้าง', '契約', '계약직', '프리랜서',
    'umowa zlecenie', 'kontrak', 'contract', 'kontrakt',
  ]},
];

// Work mode keywords per language
const WORK_MODE_KEYWORDS: { mode: WorkMode; keywords: string[] }[] = [
  { mode: 'REMOTE', keywords: [
    'remote', 'work from home', 'wfh', 'uzaktan', 'uzaktan çalışma', 'homeoffice', 'home office',
    'remoto', 'teletrabajo', 'télétravail', 'lavoro da remoto', 'trabalho remoto',
    'удалённая', 'удаленная', 'удалённо', 'jarak jauh', 'ทำงานที่บ้าน', 'リモート', '在宅',
    '재택', '원격', 'zdaln', 'kerja dari rumah', 'thuiswerk', 'distans',
  ]},
  { mode: 'HYBRID', keywords: [
    'hybrid', 'hibrit', 'hybrid', 'híbrido', 'hybride', 'ibrido', 'гибридный',
    'hibrida', 'ไฮบริด', 'ハイブリッド', '하이브리드', 'hybrydo', 'hibrid', 'hybride',
  ]},
  { mode: 'ON_SITE', keywords: [
    'on-site', 'on site', 'onsite', 'in-person', 'in person', 'office',
    'yerinde', 'sahada', 'vor ort', 'präsenz', 'presencial', 'en sitio',
    'sur site', 'en présentiel', 'in sede', 'in loco', 'очная', 'офис',
    'di lokasi', 'ทำงานที่ออฟฟิศ', 'オフィス', '出社', '사무실', '현장',
    'stacjonarn', 'di lokasi', 'op locatie', 'på plats',
  ]},
];

// Experience level keywords
const EXPERIENCE_KEYWORDS: { level: ExperienceLevel; keywords: string[] }[] = [
  { level: 'NONE', keywords: [
    'no experience', 'without experience', 'experience not required',
    'deneyim aranmaz', 'deneyim şartı yok', 'deneyimsiz', 'tecrübe aranmaz',
    'keine erfahrung', 'ohne erfahrung', 'sin experiencia', 'sans expérience',
    'senza esperienza', 'sem experiência', 'без опыта', 'tanpa pengalaman',
    'ไม่จำเป็นต้องมีประสบการณ์', '未経験', '경험 불문', '경험 무관',
    'bez doświadczenia', 'tiada pengalaman', 'geen ervaring', 'ingen erfarenhet',
  ]},
  { level: 'ENTRY', keywords: [
    'entry level', 'entry-level', 'junior', '0-2 year', '1-2 year', '0-1 year',
    'yeni mezun', 'yeni başlayan', '0-2 yıl', 'berufseinsteiger', 'berufseinstieg',
    'nivel inicial', 'débutant', 'neolaureato', 'júnior', 'начальный', 'начинающий',
    'fresh graduate', 'pemula', 'เริ่มต้น', 'ジュニア', '新卒', '신입', '주니어',
    'początkujący', 'permulaan', 'starter', 'nybörjare',
  ]},
  { level: 'MID', keywords: [
    '2-5 year', '3-5 year', '2-4 year', 'experienced', 'mid-level', 'mid level',
    'deneyimli', 'tecrübeli', '2-5 yıl', '3-5 yıl', 'erfahren', 'berufserfahrung',
    'experimentado', 'expérimenté', 'esperienza', 'experiente', 'опытный', 'средний',
    'berpengalaman', 'มีประสบการณ์', '経験者', '경력', 'doświadczony', 'pengalaman', 'ervaren', 'erfaren',
  ]},
  { level: 'SENIOR', keywords: [
    '5+ year', '5-10 year', 'senior', 'expert', 'lead', 'foreman', 'master',
    'kıdemli', 'usta', 'uzman', 'baş', '5+ yıl', 'formen', 'meister', 'vorarbeiter',
    'sénior', 'experto', 'capataz', 'sénior', 'chef', 'maître', 'caposquadra',
    'старший', 'мастер', 'бригадир', 'mandor', 'หัวหน้า', 'ベテラン', '시니어', '숙련',
    'starszy', 'ketua', 'senior', 'förman',
  ]},
];

// Sector keywords for detection
const SECTOR_KEYWORDS: { sector: Sector; keywords: string[] }[] = [
  { sector: 'LOGISTICS_TRANSPORTATION', keywords: [
    'logistics', 'transport', 'shipping', 'delivery', 'cargo', 'freight', 'warehouse', 'supply chain',
    'driver', 'truck driver', 'forklift', 'dock worker', 'dispatcher', 'courier', 'loader', 'picker packer',
    'lojistik', 'nakliye', 'taşımacılık', 'kargo', 'depo', 'dağıtım', 'sevkiyat', 'şoför', 'kurye', 'forklift',
    'logistik', 'spedition', 'lkw-fahrer', 'gabelstapler', 'kommissionierer',
    'logística', 'transporte', 'motorista', 'empilhadeirista', 'estoquista', 'chofer', 'repartidor', 'almacenista',
    'logistique', 'chauffeur', 'cariste', 'manutentionnaire', 'préparateur',
    'logistica', 'trasporto', 'autista', 'carrellista', 'magazziniere', 'facchino',
  ]},
  { sector: 'MANUFACTURING', keywords: [
    'manufacturing', 'factory', 'production', 'assembly', 'industrial', 'machine operator', 'process worker',
    'üretim', 'fabrika', 'imalat', 'montaj', 'sanayi', 'endüstri', 'operatör',
    'produktion', 'fertigung', 'maschinenführer', 'produktionshelfer', 'montagearbeiter',
    'fabricación', 'fábrica', 'operador de producción', 'operario',
    'fabrication', 'usine', 'opérateur machine', 'opérateur de production',
    'fabbrica', 'produzione', 'operaio di produzione', 'operatore macchine',
  ]},
  { sector: 'RETAIL', keywords: [
    'retail', 'store', 'shop', 'sales', 'cashier', 'merchandising', 'stock clerk', 'stocker',
    'perakende', 'mağaza', 'satış', 'kasiyer', 'market', 'reyon',
    'einzelhandel', 'verkäufer',
    'comercio', 'tienda', 'vendedor',
    'commerce', 'magasin', 'vendeur',
    'negozio', 'vendita', 'commesso',
  ]},
  { sector: 'CONSTRUCTION', keywords: [
    'construction', 'building', 'civil engineering', 'carpenter', 'mason', 'roofer', 'plumber', 'pipefitter',
    'painter', 'concrete', 'scaffolding', 'laborer', 'labourer', 'heavy equipment',
    'inşaat', 'yapı', 'bina', 'şantiye', 'duvarcı', 'boyacı', 'tesisatçı', 'kalıpçı', 'usta',
    'bau', 'baustelle', 'maurer', 'zimmermann', 'klempner', 'maler', 'schreiner', 'dachdecker',
    'construcción', 'obra', 'albañil', 'pintor', 'carpintero', 'plomero', 'peón',
    'bâtiment', 'chantier', 'maçon', 'peintre', 'menuisier', 'plombier',
    'edilizia', 'cantiere', 'muratore', 'imbianchino', 'falegname', 'idraulico',
  ]},
  { sector: 'FOOD_BEVERAGE', keywords: [
    'food', 'beverage', 'restaurant', 'catering', 'kitchen', 'bakery', 'cafe',
    'cook', 'chef', 'dishwasher', 'waiter', 'waitress', 'barista', 'bartender', 'butcher',
    'gıda', 'yiyecek', 'içecek', 'restoran', 'mutfak', 'fırın', 'pastane', 'aşçı', 'garson', 'komi', 'kasap',
    'gastronomie', 'lebensmittel', 'koch', 'bäcker', 'metzger', 'kellner',
    'alimentos', 'restaurante', 'cocinero', 'mesero', 'panadero', 'carnicero',
    'restauration', 'cuisinier', 'boulanger', 'serveur',
    'ristorazione', 'cucina', 'cuoco', 'cameriere', 'pizzaiolo',
  ]},
  { sector: 'AUTOMOTIVE', keywords: [
    'automotive', 'automobile', 'car', 'vehicle', 'motor', 'mechanic', 'auto repair', 'body shop',
    'technician', 'tire', 'brake', 'engine',
    'otomotiv', 'otomobil', 'araç', 'oto', 'tamirci', 'oto boyacı',
    'automobil', 'fahrzeug', 'kfz', 'mechaniker', 'werkstatt',
    'automotriz', 'automóvil', 'mecánico', 'taller',
    'automobile', 'véhicule', 'mécanicien', 'garagiste',
    'veicolo', 'meccanico', 'officina',
  ]},
  { sector: 'TEXTILE', keywords: [
    'textile', 'garment', 'apparel', 'clothing', 'fashion', 'sewing', 'tailor', 'seamstress',
    'tekstil', 'konfeksiyon', 'giyim', 'dikiş', 'kumaş', 'terzi',
    'textil', 'bekleidung', 'schneider', 'näher',
    'confección', 'costura', 'sastre',
    'habillement', 'couture', 'couturier',
    'tessile', 'abbigliamento', 'sarto',
  ]},
  { sector: 'MINING_ENERGY', keywords: [
    'mining', 'energy', 'oil', 'gas', 'power', 'electricity', 'solar', 'wind turbine',
    'madencilik', 'maden', 'enerji', 'petrol', 'doğalgaz', 'elektrik',
    'bergbau', 'energie', 'minería', 'energía', 'mines', 'énergie', 'minerario', 'energia',
  ]},
  { sector: 'HEALTHCARE', keywords: [
    'healthcare', 'health', 'hospital', 'medical', 'clinic', 'nursing', 'care', 'caregiver',
    'nurse aide', 'orderly', 'phlebotomist', 'dental assistant',
    'sağlık', 'hastane', 'klinik', 'hemşire', 'bakım', 'tıbbi', 'hasta bakıcı',
    'gesundheit', 'krankenhaus', 'pflege', 'altenpfleger',
    'salud', 'hospital', 'enfermero', 'cuidador',
    'santé', 'hôpital', 'infirmier', 'aide-soignant',
    'sanità', 'ospedale', 'infermiere', 'badante',
  ]},
  { sector: 'HOSPITALITY_TOURISM', keywords: [
    'hotel', 'hospitality', 'tourism', 'travel', 'resort', 'accommodation',
    'housekeeper', 'room attendant', 'bellboy', 'concierge', 'front desk',
    'otel', 'konaklama', 'turizm', 'seyahat', 'tatil', 'kat görevlisi',
    'gastgewerbe', 'tourismus', 'zimmermädchen',
    'hostelería', 'turismo', 'camarero de pisos',
    'hôtellerie', 'femme de chambre',
    'alberghiero', 'cameriera ai piani',
  ]},
  { sector: 'AGRICULTURE', keywords: [
    'agriculture', 'farming', 'farm', 'livestock', 'harvest', 'crop', 'greenhouse', 'ranch',
    'tarım', 'çiftlik', 'hayvancılık', 'ziraat', 'hasat', 'seracılık',
    'landwirtschaft', 'agricultura', 'granja', 'agricoltura', 'fattoria',
  ]},
  { sector: 'SECURITY_SERVICES', keywords: [
    'security', 'guard', 'surveillance', 'patrol', 'watchman', 'bouncer',
    'güvenlik', 'koruma', 'bekçi', 'özel güvenlik',
    'sicherheit', 'wachdienst', 'seguridad', 'vigilancia', 'sécurité', 'surveillance', 'sicurezza', 'vigilanza',
  ]},
  { sector: 'FACILITY_MANAGEMENT', keywords: [
    'facility', 'cleaning', 'janitor', 'maintenance', 'housekeeping', 'cleaner', 'custodian',
    'groundskeeper', 'landscaper', 'pest control',
    'temizlik', 'tesis yönetimi', 'bina bakım', 'hizmetli', 'bahçıvan',
    'gebäudemanagement', 'reinigung', 'reinigungskraft', 'hausmeister',
    'limpieza', 'mantenimiento', 'conserje', 'jardinero',
    'nettoyage', 'entretien', 'agent de nettoyage', 'jardinier',
    'pulizia', 'addetto pulizie', 'giardiniere',
  ]},
  { sector: 'METAL_STEEL', keywords: [
    'metal', 'steel', 'iron', 'welding', 'foundry', 'forge', 'welder', 'blacksmith', 'sheet metal',
    'metal', 'çelik', 'demir', 'kaynak', 'döküm', 'dövme', 'kaynakçı',
    'stahl', 'metall', 'schweißer',
    'acero', 'soldador',
    'acier', 'métallurgie', 'soudeur',
    'acciaio', 'metallurgia', 'saldatore',
  ]},
  { sector: 'CHEMICALS_PLASTICS', keywords: [
    'chemical', 'plastic', 'polymer', 'rubber', 'petrochemical', 'laboratory',
    'kimya', 'plastik', 'polimer', 'kauçuk', 'petrokimya',
    'chemie', 'kunststoff', 'química', 'plástico', 'chimie', 'plastique', 'chimica', 'plastica',
  ]},
  { sector: 'ECOMMERCE_CARGO', keywords: [
    'ecommerce', 'e-commerce', 'online', 'marketplace', 'fulfillment', 'packing', 'sorting',
    'e-ticaret', 'kargo', 'teslimat', 'sipariş', 'paketleme',
    'e-handel', 'comercio electrónico', 'e-commerce', 'commercio elettronico',
  ]},
  { sector: 'TELECOMMUNICATIONS', keywords: [
    'telecom', 'telecommunications', 'network', 'mobile operator', 'fiber', 'cable installer',
    'telekom', 'telekomünikasyon', 'iletişim', 'ağ',
    'telekommunikation', 'telecomunicaciones', 'télécommunications', 'telecomunicazioni',
  ]},
];

// UUID pattern: 8-4-4-4-12 hex chars
const UUID_PATTERN = /[A-F0-9]{8}-?[A-F0-9]{4}-?[A-F0-9]{4}-?[A-F0-9]{4}-?[A-F0-9]{12,}/gi;
const HEX_GARBAGE_PATTERN = /[A-Fa-f0-9]{8,}(?:-[A-Fa-f0-9]{2,}){2,}/g;
const SHORT_HEX_DASH_PATTERN = /-?[A-Fa-f0-9]{4}(?:-[A-Fa-f0-9]{4}){2,}/g;
const INLINE_HEX_PATTERN = /(?<=[a-zışğüöç])[A-F][A-F0-9]{6,}[A-F0-9\-]*/gi;

const GARBAGE_SUFFIX_PATTERNS = [
  /Anasayfa\s*Plan\s*de\s*travail\s*\d*/gi,
  /[A-Za-z]*-?key[A-Za-z0-9-]*/gi,
  /-{2,}[A-Z]$/g,
  /#\s*site-main\s*$/i,
  /#\s*mobile-menu[A-Za-z0-9-]*/i,
  /#\s*main-content\s*$/i,
  /#\s*main\s*$/i,
  /#\s*skippedLink\s*$/i,
];

const NAV_JUNK_KEYWORDS = [
  'Facebook', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Pinterest', 'LinkedIn', 'Snapchat',
  'Gear Card', 'Gift Card', 'Mobile', 'Phone', 'Account', 'Rewards', 'Help', 'Contact Us',
  'Cart', 'Sign In', 'Sign Up', 'Log In', 'Register', 'My Account', 'Wishlist',
  'Back to Top', 'Skip to Content', 'Skip to Main', 'Menu', 'Search', 'Close',
];
const NAV_JUNK_PATTERN = new RegExp(
  `(?:${NAV_JUNK_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})+\\s*$`,
  'i',
);

const GARBAGE_DESCRIPTIONS = [
  'default description',
  'bu sitede çerez kullanıyoruz',
  'bu sitede cerez kullaniyoruz',
  'we use cookies',
  'cookie policy',
  'çerez politikası',
  'cerez politikasi',
];

// ─── Main Function ──────────────────────────────────────────────────

export function normalizeJobListing(raw: RawJobData, market: Market = 'TR'): NormalizedJobListing {
  const title = cleanTitle(stripHtml(raw.title).trim());
  const description = raw.description ? cleanDescription(stripHtml(raw.description).trim()) : null;
  const requirements = raw.requirements ? cleanDescription(stripHtml(raw.requirements).trim()) : null;
  const benefits = raw.benefits ? cleanDescription(stripHtml(raw.benefits).trim()) : null;
  const sourceUrl = cleanUrl(raw.sourceUrl);

  // Combine all text fields for extraction
  const allText = [title, description, requirements, benefits, raw.salaryText, raw.jobTypeText, raw.workModeText, raw.experienceText]
    .filter(Boolean).join(' ');

  const salary = extractSalary(raw.salaryText || allText, market);
  const jobType = detectJobType(raw.jobTypeText || allText, market);
  const workMode = detectWorkMode(raw.workModeText || allText, market);
  const experienceLevel = detectExperienceLevel(raw.experienceText || allText);
  const sector = detectSector(allText, market);
  const location = parseLocation(raw.locationText);

  return {
    title,
    description,
    requirements,
    benefits,
    summary: null, // Generated later by AI or from metadata
    sourceUrl,
    canonicalUrl: canonicalizeUrl(sourceUrl),
    imageUrls: optimizeImageUrls((raw.imageUrls ?? []).filter(Boolean)),
    deadline: parseDate(raw.deadline),
    postedDate: parseDate(raw.postedDate),
    salaryMin: salary?.min ?? null,
    salaryMax: salary?.max ?? null,
    salaryCurrency: salary?.currency ?? null,
    salaryPeriod: salary?.period ?? null,
    jobType,
    workMode,
    experienceLevel,
    sector,
    city: location?.city ?? null,
    state: location?.state ?? null,
  };
}

// ─── Salary Extraction ──────────────────────────────────────────────

function extractSalary(text: string, market: Market): SalaryInfo | null {
  if (!text) return null;

  const curr = MARKET_CURRENCY[market];

  // Try to find a number pattern that looks like salary
  // Patterns: "15.000 - 20.000 TL/ay", "$18/hr", "€2,500/month", "₹25,000 - ₹35,000"
  // Number formats: 15000, 15.000, 15,000, 15.000,00

  // Find currency symbol/code in text to confirm this is salary
  const hasCurrencySignal = curr.symbols.some(s => text.includes(s)) ||
    /salary|wage|pay|maaş|ücret|maas|ucret|gehalt|salario|salaire|stipendio|зарплата|gaji|เงินเดือน|給与|급여|wynagrodzenie|gaji|salaris|lön/i.test(text);

  if (!hasCurrencySignal) return null;

  // Extract numbers (handle Turkish/European: 15.000,50 and US: 15,000.50)
  const numbers = extractNumbers(text, market);
  if (numbers.length === 0) return null;

  const period = detectPeriod(text);

  if (numbers.length >= 2) {
    // Range: min - max
    const sorted = numbers.sort((a, b) => a - b);
    return { min: sorted[0], max: sorted[sorted.length - 1], currency: curr.code, period };
  }

  // Single number — could be min or exact
  return { min: numbers[0], max: null, currency: curr.code, period };
}

function extractNumbers(text: string, market: Market): number[] {
  // Markets that use dot as thousands separator (TR, DE, BR, IT, ES, PT, etc.)
  const dotThousands = ['TR', 'DE', 'BR', 'IT', 'ES', 'PT', 'FR', 'NL', 'PL', 'AR', 'CO', 'ID', 'VN'];
  const useDotThousands = dotThousands.includes(market);

  const numbers: number[] = [];

  if (useDotThousands) {
    // Match: 15.000, 15.000,50, 1.500.000
    const pattern = /\b(\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:,\d{1,2})?)\b/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const numStr = match[1].replace(/\./g, '').replace(',', '.');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num >= 10) numbers.push(num);
    }
  }

  if (numbers.length === 0) {
    // Match: 15,000, 15,000.50, 1,500,000
    const pattern = /\b(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\b/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num >= 10) numbers.push(num);
    }
  }

  // Also try plain numbers without separators
  if (numbers.length === 0) {
    const pattern = /\b(\d{3,})\b/g;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num >= 10) numbers.push(num);
    }
  }

  return numbers;
}

function detectPeriod(text: string): SalaryPeriod {
  const lower = text.toLowerCase();
  for (const { period, keywords } of PERIOD_KEYWORDS) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return period;
    }
  }
  return 'MONTHLY'; // default
}

// ─── Job Type Detection ─────────────────────────────────────────────

function detectJobType(text: string, _market: Market): JobType | null {
  const lower = text.toLowerCase();
  for (const { type, keywords } of JOB_TYPE_KEYWORDS) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return type;
    }
  }
  return null;
}

// ─── Work Mode Detection ────────────────────────────────────────────

function detectWorkMode(text: string, _market: Market): WorkMode | null {
  const lower = text.toLowerCase();
  for (const { mode, keywords } of WORK_MODE_KEYWORDS) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return mode;
    }
  }
  return null;
}

// ─── Experience Level Detection ─────────────────────────────────────

function detectExperienceLevel(text: string): ExperienceLevel | null {
  const lower = text.toLowerCase();
  for (const { level, keywords } of EXPERIENCE_KEYWORDS) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return level;
    }
  }
  return null;
}

// ─── Sector Detection ───────────────────────────────────────────────

function detectSector(text: string, _market: Market): Sector | null {
  const lower = text.toLowerCase();
  let bestSector: Sector | null = null;
  let bestScore = 0;

  for (const { sector, keywords } of SECTOR_KEYWORDS) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestSector = sector;
    }
  }

  return bestSector;
}

// ─── Location Parsing ───────────────────────────────────────────────

function parseLocation(text?: string): { city: string | null; state: string | null } | null {
  if (!text) return null;
  const cleaned = stripHtml(text).trim();
  if (!cleaned || cleaned.length < 2) return null;

  // Common format: "City, State" or "City / State" or "City - State"
  const parts = cleaned.split(/[,\/\-–—]\s*/);
  if (parts.length >= 2) {
    return { city: parts[0].trim() || null, state: parts[1].trim() || null };
  }

  // Single location — assume city
  return { city: cleaned, state: null };
}

// ─── Shared Utilities (kept from original) ──────────────────────────

function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().replace(/\/+$/, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(title: string): string {
  // Remove unicode escape artifacts
  title = title.replace(/\\u[0-9a-fA-F]{4}/g, (m) => {
    try { return JSON.parse(`"${m}"`); } catch { return m; }
  });

  // Remove UUID-like patterns
  title = title.replace(UUID_PATTERN, '').trim();
  title = title.replace(INLINE_HEX_PATTERN, '').trim();
  title = title.replace(HEX_GARBAGE_PATTERN, '').trim();
  title = title.replace(SHORT_HEX_DASH_PATTERN, '').trim();

  // Remove known garbage suffixes
  for (const pattern of GARBAGE_SUFFIX_PATTERNS) {
    title = title.replace(pattern, '').trim();
  }

  // Clean trailing separators
  title = title.replace(/[-–—|]+\s*$/, '').trim();

  // Remove navigation/UI junk
  for (let i = 0; i < 3; i++) {
    title = title.replace(NAV_JUNK_PATTERN, '').trim();
  }

  // Remove "title" prefix artifact
  title = title.replace(/\btitle\s*$/i, '').trim();

  // If title has concatenated junk after pipe, keep first part
  const pipeMatch = title.match(/^(.{10,}?)\s*[|]\s*.{0,30}(?:Card|Mobile|Phone|Facebook|Store|Home|Shop)/i);
  if (pipeMatch) {
    title = pipeMatch[1].trim();
  }

  // Collapse spaces, clean trailing separators
  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/\s*[-–—|]+\s*$/, '').trim();

  // Remove wrapping quotes
  if ((title.startsWith('"') && title.endsWith('"')) || (title.startsWith("'") && title.endsWith("'"))) {
    title = title.slice(1, -1).trim();
  }
  if (title.startsWith('\u201C') || title.startsWith('\u00AB')) title = title.slice(1).trim();
  if (title.endsWith('\u201D') || title.endsWith('\u00BB')) title = title.slice(0, -1).trim();

  return title;
}

function cleanDescription(desc: string): string | null {
  if (!desc || desc.length < 5) return null;

  const lower = desc.toLowerCase().trim();
  if (GARBAGE_DESCRIPTIONS.some(g => lower === g || lower.startsWith(g))) return null;

  // Remove unicode escape artifacts
  desc = desc.replace(/\\u[0-9a-fA-F]{4}/g, (m) => {
    try { return JSON.parse(`"${m}"`); } catch { return m; }
  });

  return desc;
}

function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    for (const param of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', '_encoding']) {
      parsed.searchParams.delete(param);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;

  const now = new Date();
  const year = d.getFullYear();
  if (year < 2020 || year > now.getFullYear() + 2) return null;

  return d;
}

