import { Market } from '@prisma/client';
import { NormalizedJobListing } from './normalize';
import { classifyAndEnrich } from '../utils/ai-client';
import { isBlueCollar } from '../utils/blue-collar-filter';

// ====== SCORING THRESHOLDS ======

const MIN_SCORE = 3;           // Minimum score to accept
const AUTO_ACCEPT_SCORE = 6;   // Auto-accept without AI
const AUTO_REJECT_SCORE = 0;   // Auto-reject without AI
const AI_BORDERLINE_MIN = 3;   // Min score for AI borderline
const AI_BORDERLINE_MAX = 5;   // Max score for AI borderline
const AI_CONFIDENCE_THRESHOLD = 0.6;

// ====== MARKET KEYWORD CONFIGURATION ======

interface JobMarketKeywords {
  blueCollarKeywords: string[];     // +3 score — core blue-collar job terms
  jobPostingKeywords: string[];     // +2 score — job posting indicator terms
  whiteCollarKeywords: string[];    // Hard reject — white-collar job terms
  blacklistedTitles: string[];      // Hard reject — non-content pages
  jobUrlPatterns: RegExp[];         // +2 score — job/career URL patterns
  nonJobUrlPatterns: RegExp[];      // -2 score — non-job URL patterns
}

// ─── Shared keyword blocks ──────────────────────────────────────

const SHARED_BLUE_COLLAR_EN = [
  'driver', 'courier', 'delivery', 'technician', 'mechanic', 'electrician', 'plumber',
  'welder', 'carpenter', 'painter', 'mason', 'security guard', 'janitor', 'cleaner',
  'housekeeper', 'waiter', 'waitress', 'bartender', 'cook', 'chef', 'baker',
  'cashier', 'stock clerk', 'warehouse', 'forklift', 'loader', 'packer', 'picker',
  'assembly', 'operator', 'machinist', 'factory worker', 'production worker',
  'construction worker', 'laborer', 'maintenance', 'installer', 'repair',
  'truck driver', 'bus driver', 'taxi driver', 'dispatcher',
  'security officer', 'patrol', 'guard',
  'farmworker', 'harvest', 'landscaper', 'gardener',
  'miner', 'driller', 'rigger', 'crane operator',
  'tailor', 'seamstress', 'textile worker',
  'receptionist', 'porter', 'bellboy', 'doorman',
  'helper', 'assistant', 'attendant', 'handler',
  // Additional blue-collar roles
  'butcher', 'dishwasher', 'barista', 'valet', 'stocker',
  'sorter', 'bundler', 'stacker', 'roofer', 'glazier',
  'bricklayer', 'tiler', 'plasterer', 'scaffolder',
  'dock worker', 'stevedore', 'longshoreman',
  'laundry worker', 'ironer', 'presser',
  'caretaker', 'groundskeeper', 'custodian',
  'nail technician', 'hairdresser', 'barber',
  'process worker', 'line worker', 'press operator',
  'cnc operator', 'lathe operator', 'mill operator',
  'maintenance engineer', 'field engineer', 'site engineer', 'process engineer',
  'warehouse manager', 'shift manager', 'site manager',
];

const SHARED_JOB_POSTING_EN = [
  'hiring', 'now hiring', 'we are hiring', 'job opening', 'vacancy', 'vacancies',
  'career', 'careers', 'open position', 'apply now', 'job opportunity',
  'join our team', 'recruitment', 'wanted', 'looking for', 'seeking',
  'job description', 'responsibilities', 'qualifications', 'requirements',
  'salary', 'compensation', 'benefits', 'shift', 'overtime',
];

const SHARED_WHITE_COLLAR = [
  'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'cpo',
  'vice president', 'vp of', 'svp', 'evp',
  'chief executive', 'chief technology', 'chief financial', 'chief operating',
  'managing director', 'general manager', 'senior director', 'executive director',
  'board member', 'board of directors',
  'software engineer', 'software developer', 'frontend developer', 'backend developer',
  'full stack developer', 'fullstack developer', 'web developer', 'mobile developer',
  'data scientist', 'data analyst', 'data engineer', 'machine learning',
  'product manager', 'product owner', 'project manager', 'program manager',
  'business analyst', 'financial analyst', 'market analyst', 'research analyst',
  'consultant', 'management consultant', 'strategy consultant',
  'lawyer', 'attorney', 'solicitor', 'barrister', 'legal counsel',
  'doctor', 'physician', 'surgeon', 'psychiatrist', 'dentist',
  'professor', 'lecturer', 'researcher', 'academic',
  'architect', 'solution architect', 'enterprise architect',
  'investment banker', 'portfolio manager', 'hedge fund', 'venture capital',
  'creative director', 'art director', 'design director',
  'marketing manager', 'brand manager', 'digital marketing manager',
  'hr manager', 'human resources manager', 'talent acquisition',
];

const SHARED_BLACKLISTED_TITLES = [
  'home', 'homepage', 'main page', 'about', 'about us', 'contact', 'contact us',
  'privacy policy', 'terms of service', 'terms and conditions', 'cookie policy',
  'login', 'sign in', 'sign up', 'register', 'my account', 'dashboard',
  'faq', 'help', 'support', 'sitemap', 'accessibility',
  'press', 'media', 'blog', 'news', 'newsletter',
  'investors', 'investor relations', 'annual report',
  'our story', 'our team', 'leadership', 'mission', 'values',
  'error', 'page not found', '404', 'not found', 'forbidden', '403',
  'access denied', 'under construction', 'coming soon',
];

const SHARED_JOB_URL_PATTERNS: RegExp[] = [
  /\/careers?\b/i, /\/jobs?\b/i, /\/hiring\b/i, /\/vacancies\b/i,
  /\/openings?\b/i, /\/positions?\b/i, /\/recruitment\b/i,
  /\/apply\b/i, /\/join-us\b/i, /\/work-with-us\b/i,
];

const SHARED_NON_JOB_URL_PATTERNS: RegExp[] = [
  /\/about\b/i, /\/contact\b/i, /\/privacy/i, /\/terms/i, /\/legal\b/i,
  /\/faq\b/i, /\/help\b/i, /\/support\b/i, /\/blog\b/i, /\/news\b/i,
  /\/press\b/i, /\/media\b/i, /\/investors?\b/i, /\/annual-report/i,
  /\/login\b/i, /\/signin\b/i, /\/signup\b/i, /\/register\b/i,
  /\/account\b/i, /\/dashboard\b/i, /\/profile\b/i,
  /\/warranty\b/i, /\/recall\b/i, /\/corporate\b/i,
  /\/sitemap/i, /\/accessibility/i, /\/cookie/i,
];

// ─── TR Keywords ────────────────────────────────────────────────

const TR_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'şoför', 'sürücü', 'kurye', 'dağıtıcı', 'teslimatçı',
    'teknisyen', 'tekniker', 'elektrikçi', 'tesisatçı', 'boyacı', 'badanacı',
    'kaynakçı', 'tornacı', 'frezeci', 'tesviyeci', 'kalıpçı',
    'marangoz', 'doğramacı', 'mobilyacı', 'döşemeci',
    'usta', 'kalfa', 'çırak', 'işçi', 'amele', 'taşeron',
    'garson', 'komi', 'aşçı', 'aşçıbaşı', 'bulaşıkçı', 'fırıncı',
    'kasiyer', 'reyon görevlisi', 'depocu', 'raf düzenleyici',
    'forklift operatörü', 'vinçci', 'beko operatörü', 'kepçe operatörü',
    'güvenlik', 'güvenlik görevlisi', 'bekçi', 'koruma',
    'temizlik', 'temizlik görevlisi', 'hizmetli', 'hademe',
    'bakıcı', 'hasta bakıcı', 'yaşlı bakıcı', 'çocuk bakıcı',
    'terzi', 'konfeksiyoncu', 'overlokçu', 'makineci',
    'inşaat işçisi', 'kalıpçı', 'demirci', 'sıvacı', 'alçıcı',
    'bahçıvan', 'çiftçi', 'hayvancı', 'çoban',
    'kaptan', 'gemici', 'denizci', 'balıkçı',
    'matbaacı', 'baskıcı', 'ambalajcı', 'paketçi',
    'montajcı', 'döşemeci', 'cam ustası', 'seramikçi',
    'çamaşırcı', 'ütücü', 'vinçci', 'beko operatörü', 'kepçe operatörü',
    'kasap', 'tornacı', 'frezeci', 'kalıpçı',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'iş ilanı', 'eleman aranıyor', 'personel alınacaktır', 'personel aranıyor',
    'açık pozisyon', 'iş başvurusu', 'başvuru', 'maaş', 'ücret',
    'mesai', 'vardiya', 'sigorta', 'sgk', 'asgari ücret',
    'bay-bayan', 'deneyimli', 'deneyimsiz', 'acil eleman',
    'kadro', 'kadrolu', 'daimi', 'geçici', 'part-time',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'genel müdür', 'genel müdür yardımcısı', 'direktör', 'başkan',
    'yazılım geliştirici', 'yazılım mühendisi', 'frontend geliştirici',
    'veri bilimci', 'veri analisti', 'iş analisti',
    'ürün müdürü', 'proje müdürü', 'pazarlama müdürü',
    'danışman', 'avukat', 'mali müşavir', 'mimar',
    'akademisyen', 'araştırmacı', 'öğretim üyesi', 'profesör',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'anasayfa', 'ana sayfa', 'hakkımızda', 'hakkimizda', 'iletişim', 'iletisim',
    'giriş yap', 'giris yap', 'kayıt ol', 'kayit ol',
    'gizlilik politikası', 'gizlilik politikasi', 'kvkk',
    'çerez politikası', 'cerez politikasi', 'kullanım şartları',
    'sıkça sorulan sorular', 'yardım', 'destek',
    'sayfa bulunamadı', 'sayfa bulunamadi',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/kariyer/i, /\/is-ilanlari/i, /\/is-ilani/i, /\/basvuru/i,
    /\/pozisyonlar/i, /\/acik-pozisyonlar/i, /\/ise-alim/i,
    /\/eleman/i, /\/personel/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/hakkimizda/i, /\/hakkımızda/i, /\/iletisim/i, /\/iletişim/i,
    /\/kvkk/i, /\/gizlilik/i, /\/cerez/i,
  ],
};

// ─── US/UK/AU/CA/PH/ZA/PK/IN Keywords (English) ────────────────

const EN_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: SHARED_BLUE_COLLAR_EN,
  jobPostingKeywords: SHARED_JOB_POSTING_EN,
  whiteCollarKeywords: SHARED_WHITE_COLLAR,
  blacklistedTitles: SHARED_BLACKLISTED_TITLES,
  jobUrlPatterns: SHARED_JOB_URL_PATTERNS,
  nonJobUrlPatterns: SHARED_NON_JOB_URL_PATTERNS,
};

// ─── DE Keywords ────────────────────────────────────────────────

const DE_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'fahrer', 'lkw-fahrer', 'busfahrer', 'taxifahrer', 'kurier', 'zusteller',
    'techniker', 'mechaniker', 'elektriker', 'klempner', 'installateur',
    'schweißer', 'schlosser', 'dreher', 'fräser', 'werkzeugmacher',
    'tischler', 'schreiner', 'zimmermann', 'dachdecker',
    'maurer', 'fliesenleger', 'maler', 'lackierer', 'verputzer',
    'koch', 'bäcker', 'konditor', 'küchenhilfe', 'kellner', 'servicekraft',
    'kassierer', 'verkäufer', 'lagerist', 'kommissionierer', 'staplerfahrer',
    'produktionshelfer', 'produktionsmitarbeiter', 'maschinenbediener',
    'wachmann', 'sicherheitsdienst', 'pförtner',
    'reinigungskraft', 'gebäudereiniger', 'raumpfleger', 'hauswirtschafter',
    'altenpfleger', 'krankenpfleger', 'pflegehelfer',
    'schneider', 'näher', 'textilarbeiter',
    'gärtner', 'landwirt', 'erntehelfer',
    'monteur', 'servicetechniker', 'wartungstechniker',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'stellenangebot', 'stellenanzeige', 'jobangebot', 'wir suchen',
    'offene stelle', 'freie stelle', 'mitarbeiter gesucht',
    'bewerbung', 'bewerben', 'gehalt', 'vergütung', 'lohn',
    'schichtarbeit', 'vollzeit', 'teilzeit', 'minijob',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'geschäftsführer', 'vorstand', 'direktor', 'abteilungsleiter',
    'softwareentwickler', 'programmierer', 'datenanalyst',
    'unternehmensberater', 'rechtsanwalt', 'wirtschaftsprüfer',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'startseite', 'über uns', 'kontakt', 'impressum',
    'datenschutz', 'agb', 'nutzungsbedingungen',
    'seite nicht gefunden', 'fehler',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/karriere/i, /\/stellenangebote/i, /\/stellen\b/i, /\/bewerbung/i,
    /\/offene-stellen/i, /\/mitarbeiten/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/ueber-uns/i, /\/impressum/i, /\/datenschutz/i, /\/agb\b/i,
  ],
};

// ─── BR/PT Keywords (Portuguese) ───────────────────────────────

const PT_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'motorista', 'caminhoneiro', 'entregador', 'motoboy',
    'técnico', 'mecânico', 'eletricista', 'encanador', 'soldador',
    'pedreiro', 'pintor', 'azulejista', 'marceneiro', 'carpinteiro',
    'cozinheiro', 'padeiro', 'garçom', 'atendente', 'balconista',
    'caixa', 'estoquista', 'repositor', 'operador de empilhadeira',
    'operário', 'auxiliar de produção', 'operador de máquina',
    'vigilante', 'porteiro', 'segurança',
    'faxineiro', 'diarista', 'zelador', 'copeiro',
    'costureira', 'tecelão',
    'ajudante', 'servente', 'auxiliar',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'vaga', 'vagas', 'vaga de emprego', 'contratando', 'estamos contratando',
    'oportunidade', 'processo seletivo', 'candidatar', 'salário', 'remuneração',
    'benefícios', 'clt', 'carteira assinada', 'temporário',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'diretor executivo', 'diretor geral', 'gerente geral',
    'desenvolvedor', 'programador', 'analista de dados',
    'consultor', 'advogado', 'contador', 'arquiteto',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'página inicial', 'sobre nós', 'contato', 'fale conosco',
    'política de privacidade', 'termos de uso',
    'página não encontrada',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/carreiras/i, /\/vagas/i, /\/trabalhe-conosco/i, /\/oportunidades/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/sobre/i, /\/contato/i, /\/privacidade/i, /\/termos/i,
  ],
};

// ─── ES/MX/AR/CO Keywords (Spanish) ────────────────────────────

const ES_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'conductor', 'chofer', 'chófer', 'repartidor', 'mensajero',
    'técnico', 'mecánico', 'electricista', 'plomero', 'soldador',
    'albañil', 'pintor', 'carpintero', 'herrero',
    'cocinero', 'panadero', 'mesero', 'camarero', 'barista',
    'cajero', 'almacenista', 'bodeguero', 'montacarguista',
    'obrero', 'operario', 'operador de máquina', 'jornalero',
    'vigilante', 'guardia', 'conserje', 'portero',
    'limpiador', 'aseador', 'intendente',
    'costurera', 'modista', 'textil',
    'peón', 'ayudante', 'auxiliar',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'vacante', 'vacantes', 'oferta de empleo', 'empleo', 'se busca',
    'se solicita', 'se requiere', 'convocatoria', 'postular',
    'sueldo', 'salario', 'prestaciones', 'nómina',
    'turno', 'jornada', 'tiempo completo', 'medio tiempo',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'director general', 'gerente general', 'director ejecutivo',
    'desarrollador', 'programador', 'analista de datos',
    'consultor', 'abogado', 'contador', 'arquitecto',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'inicio', 'página principal', 'acerca de', 'quiénes somos',
    'contacto', 'contáctenos', 'aviso de privacidad', 'términos',
    'página no encontrada',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/carreras/i, /\/empleo/i, /\/vacantes/i, /\/trabaja-con-nosotros/i,
    /\/bolsa-de-trabajo/i, /\/ofertas-de-empleo/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/acerca/i, /\/contacto/i, /\/privacidad/i, /\/aviso-legal/i,
  ],
};

// ─── FR Keywords ────────────────────────────────────────────────

const FR_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'chauffeur', 'routier', 'livreur', 'coursier',
    'technicien', 'mécanicien', 'électricien', 'plombier', 'soudeur',
    'maçon', 'peintre', 'menuisier', 'charpentier', 'couvreur',
    'cuisinier', 'boulanger', 'pâtissier', 'serveur', 'commis',
    'caissier', 'magasinier', 'préparateur', 'cariste',
    'ouvrier', 'opérateur', 'agent de production', 'manoeuvre',
    'agent de sécurité', 'vigile', 'gardien', 'concierge',
    'agent d\'entretien', 'femme de ménage', 'nettoyeur',
    'couturier', 'couturière',
    'aide', 'auxiliaire', 'manutentionnaire',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'offre d\'emploi', 'poste à pourvoir', 'recrutement', 'nous recrutons',
    'candidature', 'postuler', 'salaire', 'rémunération',
    'cdi', 'cdd', 'intérim', 'temps plein', 'temps partiel',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'directeur général', 'directeur exécutif', 'directeur financier',
    'développeur', 'analyste', 'consultant', 'avocat', 'architecte',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'accueil', 'à propos', 'qui sommes-nous', 'contact', 'nous contacter',
    'politique de confidentialité', 'conditions générales',
    'page non trouvée',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/carrieres/i, /\/emplois/i, /\/recrutement/i, /\/offres-d-emploi/i,
    /\/rejoignez-nous/i, /\/postuler/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/a-propos/i, /\/nous-contacter/i, /\/confidentialite/i, /\/mentions-legales/i,
  ],
};

// ─── IT Keywords ────────────────────────────────────────────────

const IT_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'autista', 'camionista', 'corriere', 'fattorino',
    'tecnico', 'meccanico', 'elettricista', 'idraulico', 'saldatore',
    'muratore', 'imbianchino', 'falegname', 'carpentiere',
    'cuoco', 'panettiere', 'cameriere', 'barista',
    'cassiere', 'magazziniere', 'carrellista',
    'operaio', 'addetto alla produzione', 'macchinista',
    'guardia', 'vigilante', 'portiere',
    'addetto alle pulizie', 'bidello',
    'sarto', 'sarta', 'operaio tessile',
    'manovale', 'aiutante',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'offerta di lavoro', 'posizione aperta', 'ricerca personale', 'cerchiamo',
    'candidatura', 'stipendio', 'retribuzione', 'contratto',
    'tempo indeterminato', 'tempo determinato', 'turni',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'direttore generale', 'amministratore delegato',
    'sviluppatore', 'analista', 'consulente', 'avvocato', 'architetto',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'home', 'chi siamo', 'contatti', 'contattaci',
    'informativa sulla privacy', 'termini e condizioni',
    'pagina non trovata',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/carriere/i, /\/lavora-con-noi/i, /\/posizioni-aperte/i, /\/offerte-lavoro/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/chi-siamo/i, /\/contatti/i, /\/privacy/i,
  ],
};

// ─── RU Keywords ────────────────────────────────────────────────

const RU_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'водитель', 'шофёр', 'курьер', 'экспедитор',
    'техник', 'механик', 'электрик', 'сантехник', 'сварщик',
    'слесарь', 'токарь', 'фрезеровщик', 'наладчик',
    'каменщик', 'маляр', 'штукатур', 'плотник', 'столяр',
    'повар', 'пекарь', 'кондитер', 'официант', 'бармен',
    'кассир', 'кладовщик', 'грузчик', 'комплектовщик', 'упаковщик',
    'оператор', 'рабочий', 'разнорабочий', 'подсобный',
    'охранник', 'вахтёр', 'контролёр',
    'уборщик', 'уборщица', 'дворник',
    'швея', 'закройщик',
    'монтажник', 'стропальщик', 'крановщик',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'вакансия', 'вакансии', 'ищем', 'требуется', 'набор персонала',
    'заработная плата', 'зарплата', 'оклад', 'график работы',
    'полная занятость', 'частичная занятость', 'вахта', 'смена',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'генеральный директор', 'директор', 'заместитель директора',
    'разработчик', 'программист', 'аналитик данных',
    'консультант', 'юрист', 'адвокат', 'бухгалтер', 'архитектор',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'главная', 'о компании', 'о нас', 'контакты',
    'политика конфиденциальности', 'пользовательское соглашение',
    'страница не найдена',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/vakansii/i, /\/kariera/i, /\/rabota/i, /\/trudoustrojstvo/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/o-kompanii/i, /\/o-nas/i, /\/kontakty/i,
  ],
};

// ─── JP Keywords ────────────────────────────────────────────────

const JP_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'ドライバー', '運転手', '配達員', '配送', 'トラック運転手',
    '技術者', '整備士', '電気工事', '配管工', '溶接工',
    '大工', '左官', '鳶', '塗装工',
    '調理師', 'コック', 'パン職人', 'ウェイター', 'ホールスタッフ',
    'レジ', '倉庫', 'フォークリフト', 'ピッキング', '仕分け',
    '製造', '工場', '組立', 'オペレーター', '作業員',
    '警備員', 'ガードマン', '守衛',
    '清掃', 'ハウスクリーニング', 'ビルメンテナンス',
    '縫製', '裁縫',
    '土木', '建設', '現場作業',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    '求人', '募集', '採用', '応募', '正社員', 'パート', 'アルバイト',
    '給与', '時給', '日給', '月給', '年収',
    'シフト', '勤務時間', '交通費', '福利厚生',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    '社長', '取締役', '部長', '課長', 'ディレクター',
    'エンジニア', 'プログラマー', 'データサイエンティスト',
    'コンサルタント', '弁護士', '会計士', '建築家',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'トップページ', '会社概要', 'お問い合わせ',
    'プライバシーポリシー', '利用規約',
    'ページが見つかりません',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/saiyou/i, /\/boshu/i, /\/kyujin/i, /\/recruit/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/company/i, /\/gaiyou/i,
  ],
};

// ─── ID Keywords ────────────────────────────────────────────────

const ID_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'sopir', 'pengemudi', 'kurir', 'pengantar',
    'teknisi', 'mekanik', 'tukang listrik', 'tukang las',
    'tukang batu', 'tukang cat', 'tukang kayu',
    'koki', 'juru masak', 'pelayan', 'barista',
    'kasir', 'gudang', 'forklift', 'picker',
    'operator', 'buruh', 'pekerja pabrik', 'karyawan produksi',
    'satpam', 'security', 'penjaga',
    'cleaning service', 'office boy', 'ob',
    'penjahit', 'tukang jahit',
    'kuli', 'pembantu', 'asisten',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'lowongan', 'lowongan kerja', 'dibutuhkan', 'dicari',
    'lamaran', 'melamar', 'gaji', 'upah', 'tunjangan',
    'shift', 'full time', 'part time', 'kontrak',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'direktur utama', 'direktur', 'manajer umum',
    'developer', 'programmer', 'analis data',
    'konsultan', 'pengacara', 'akuntan', 'arsitek',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'beranda', 'tentang kami', 'hubungi kami', 'kontak',
    'kebijakan privasi', 'syarat dan ketentuan',
    'halaman tidak ditemukan',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/karir/i, /\/lowongan/i, /\/rekrutmen/i, /\/bergabung/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/tentang/i, /\/hubungi/i, /\/privasi/i,
  ],
};

// ─── TH Keywords ────────────────────────────────────────────────

const TH_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'คนขับ', 'คนส่งของ', 'ไรเดอร์',
    'ช่าง', 'ช่างเทคนิค', 'ช่างไฟฟ้า', 'ช่างประปา', 'ช่างเชื่อม',
    'ช่างก่อสร้าง', 'ช่างทาสี', 'ช่างไม้',
    'พ่อครัว', 'แม่ครัว', 'พนักงานเสิร์ฟ', 'บาริสต้า',
    'แคชเชียร์', 'พนักงานคลังสินค้า', 'โฟล์คลิฟท์',
    'พนักงานผลิต', 'โอเปอเรเตอร์', 'คนงาน',
    'รปภ', 'เจ้าหน้าที่รักษาความปลอดภัย',
    'แม่บ้าน', 'พนักงานทำความสะอาด',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'รับสมัคร', 'สมัครงาน', 'ตำแหน่งว่าง', 'เปิดรับสมัคร',
    'เงินเดือน', 'ค่าจ้าง', 'สวัสดิการ', 'กะ', 'เวร',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'กรรมการผู้จัดการ', 'ผู้อำนวยการ',
    'นักพัฒนา', 'โปรแกรมเมอร์', 'นักวิเคราะห์',
    'ที่ปรึกษา', 'ทนายความ', 'สถาปนิก',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'หน้าแรก', 'เกี่ยวกับเรา', 'ติดต่อเรา',
    'นโยบายความเป็นส่วนตัว', 'ข้อกำหนด',
    'ไม่พบหน้า',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/career/i, /\/jobs?-th/i, /\/สมัครงาน/i,
  ],
  nonJobUrlPatterns: SHARED_NON_JOB_URL_PATTERNS,
};

// ─── KR Keywords ────────────────────────────────────────────────

const KR_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    '운전기사', '배달원', '택배기사', '라이더',
    '기술자', '정비사', '전기기사', '배관공', '용접공',
    '목수', '미장이', '도장공', '타일공',
    '요리사', '주방장', '조리사', '서빙', '바리스타',
    '캐셔', '창고관리', '지게차', '물류',
    '생산직', '공장', '제조', '조립', '오퍼레이터',
    '경비원', '보안요원',
    '청소', '미화원', '관리원',
    '재봉사', '봉제',
    '현장', '노무', '인부',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    '채용', '구인', '모집', '구직', '일자리', '지원',
    '급여', '월급', '시급', '일당', '연봉',
    '교대', '주간', '야간', '복리후생',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    '대표이사', '이사', '부장', '차장',
    '개발자', '프로그래머', '데이터분석가',
    '컨설턴트', '변호사', '회계사', '건축가',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    '홈', '회사소개', '문의', '연락처',
    '개인정보처리방침', '이용약관',
    '페이지를 찾을 수 없습니다',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/chaeyang/i, /\/recruit/i, /\/채용/i,
  ],
  nonJobUrlPatterns: SHARED_NON_JOB_URL_PATTERNS,
};

// ─── AR/EG/SA/AE Keywords (Arabic) ─────────────────────────────

const AR_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'سائق', 'مندوب توصيل', 'ساعي',
    'فني', 'ميكانيكي', 'كهربائي', 'سباك', 'لحام',
    'بناء', 'نقاش', 'نجار', 'حداد',
    'طباخ', 'خباز', 'نادل', 'باريستا',
    'كاشير', 'أمين مخزن', 'فورك لفت', 'عامل مستودع',
    'عامل إنتاج', 'مشغل آلات', 'عامل مصنع',
    'حارس أمن', 'أمن', 'بواب',
    'عامل نظافة', 'منظف',
    'خياط', 'عامل نسيج',
    'عامل', 'مساعد',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'وظيفة', 'وظائف', 'فرصة عمل', 'مطلوب', 'توظيف',
    'تقديم', 'راتب', 'مرتب', 'دوام', 'نوبات',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'مدير عام', 'مدير تنفيذي', 'نائب رئيس',
    'مطور برمجيات', 'مبرمج', 'محلل بيانات',
    'مستشار', 'محامي', 'محاسب', 'مهندس معماري',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'الرئيسية', 'من نحن', 'اتصل بنا', 'تواصل معنا',
    'سياسة الخصوصية', 'الشروط والأحكام',
    'الصفحة غير موجودة',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/wazaif/i, /\/tawzif/i, /\/careers-ar/i,
  ],
  nonJobUrlPatterns: SHARED_NON_JOB_URL_PATTERNS,
};

// ─── VN Keywords ────────────────────────────────────────────────

const VN_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'tài xế', 'lái xe', 'shipper', 'giao hàng',
    'kỹ thuật viên', 'thợ máy', 'thợ điện', 'thợ hàn', 'thợ ống nước',
    'thợ xây', 'thợ sơn', 'thợ mộc',
    'đầu bếp', 'phụ bếp', 'phục vụ', 'pha chế',
    'thu ngân', 'kho', 'bốc xếp',
    'công nhân', 'thợ may', 'lao động',
    'bảo vệ', 'vệ sĩ',
    'tạp vụ', 'lao công', 'vệ sinh',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'tuyển dụng', 'việc làm', 'cần tuyển', 'tuyển gấp',
    'ứng tuyển', 'lương', 'mức lương', 'phúc lợi', 'ca làm',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'giám đốc', 'tổng giám đốc', 'phó giám đốc',
    'lập trình viên', 'chuyên viên phân tích',
    'tư vấn viên', 'luật sư', 'kế toán', 'kiến trúc sư',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'trang chủ', 'giới thiệu', 'liên hệ',
    'chính sách bảo mật', 'điều khoản',
    'không tìm thấy trang',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/tuyen-dung/i, /\/viec-lam/i, /\/ung-tuyen/i,
  ],
  nonJobUrlPatterns: SHARED_NON_JOB_URL_PATTERNS,
};

// ─── PL Keywords ────────────────────────────────────────────────

const PL_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'kierowca', 'kurier', 'dostawca',
    'technik', 'mechanik', 'elektryk', 'hydraulik', 'spawacz',
    'murarz', 'malarz', 'stolarz', 'cieśla', 'dekarz',
    'kucharz', 'piekarz', 'kelner', 'barman',
    'kasjer', 'magazynier', 'operator wózka',
    'operator', 'pracownik produkcji', 'robotnik',
    'ochroniarz', 'portier',
    'sprzątaczka', 'sprzątacz',
    'krawiec', 'szwaczka',
    'pomocnik', 'pracownik fizyczny',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'oferta pracy', 'praca', 'zatrudnimy', 'poszukujemy',
    'aplikuj', 'wynagrodzenie', 'pensja', 'zmiana', 'etat',
  ],
  whiteCollarKeywords: [
    ...SHARED_WHITE_COLLAR,
    'dyrektor generalny', 'dyrektor zarządzający', 'prezes',
    'programista', 'analityk danych',
    'konsultant', 'prawnik', 'księgowy', 'architekt',
  ],
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'strona główna', 'o nas', 'kontakt',
    'polityka prywatności', 'regulamin',
    'nie znaleziono strony',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/kariera/i, /\/praca/i, /\/oferty-pracy/i, /\/rekrutacja/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/o-nas/i, /\/kontakt/i, /\/regulamin/i,
  ],
};

// ─── MY Keywords ────────────────────────────────────────────────

const MY_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'pemandu', 'penghantar', 'kurier',
    'juruteknik', 'mekanik', 'juruelektrik', 'tukang paip', 'pengimpal',
    'tukang batu', 'tukang cat', 'tukang kayu',
    'tukang masak', 'pelayan', 'barista',
    'juruwang', 'penjaga stor', 'forklift',
    'operator', 'pekerja kilang', 'buruh',
    'pengawal keselamatan', 'jaga',
    'pembersih', 'cleaner',
    'tukang jahit',
    'pekerja am', 'pembantu',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'jawatan kosong', 'kekosongan', 'pengambilan', 'diperlukan',
    'mohon', 'gaji', 'elaun', 'syif',
  ],
  whiteCollarKeywords: SHARED_WHITE_COLLAR,
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'laman utama', 'tentang kami', 'hubungi kami',
    'dasar privasi', 'terma dan syarat',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/kerjaya/i, /\/jawatan/i,
  ],
  nonJobUrlPatterns: SHARED_NON_JOB_URL_PATTERNS,
};

// ─── NL Keywords ────────────────────────────────────────────────

const NL_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'chauffeur', 'vrachtwagenchauffeur', 'koerier', 'bezorger',
    'monteur', 'monteur', 'elektricien', 'loodgieter', 'lasser',
    'metselaar', 'schilder', 'timmerman', 'dakdekker',
    'kok', 'bakker', 'ober', 'serveerster', 'barista',
    'kassamedewerker', 'magazijnmedewerker', 'heftruckchauffeur',
    'productiemedewerker', 'operator', 'fabrieksarbeider',
    'beveiliger', 'portier',
    'schoonmaker', 'schoonmaakster',
    'naaister', 'kleermaker',
    'hulp', 'medewerker',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'vacature', 'vacatures', 'wij zoeken', 'gezocht',
    'solliciteer', 'salaris', 'loon', 'ploegendienst',
    'fulltime', 'parttime', 'tijdelijk',
  ],
  whiteCollarKeywords: SHARED_WHITE_COLLAR,
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'home', 'over ons', 'contact', 'neem contact op',
    'privacybeleid', 'algemene voorwaarden',
    'pagina niet gevonden',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/vacatures/i, /\/werken-bij/i, /\/carriere/i,
  ],
  nonJobUrlPatterns: [
    ...SHARED_NON_JOB_URL_PATTERNS,
    /\/over-ons/i,
  ],
};

// ─── SE Keywords ────────────────────────────────────────────────

const SE_KEYWORDS: JobMarketKeywords = {
  blueCollarKeywords: [
    ...SHARED_BLUE_COLLAR_EN,
    'chaufför', 'lastbilschaufför', 'bud', 'brevbärare',
    'tekniker', 'mekaniker', 'elektriker', 'rörmokare', 'svetsare',
    'murare', 'målare', 'snickare', 'takläggare',
    'kock', 'bagare', 'servitör', 'servitris', 'barista',
    'kassör', 'lagerarbetare', 'truckförare',
    'produktionsarbetare', 'maskinoperatör', 'fabriksarbetare',
    'väktare', 'ordningsvakt',
    'städare', 'lokalvårdare',
    'sömmerska', 'skräddare',
    'byggnadsarbetare', 'hantverkare',
  ],
  jobPostingKeywords: [
    ...SHARED_JOB_POSTING_EN,
    'ledigt jobb', 'ledig tjänst', 'vi söker', 'sökes',
    'ansök', 'lön', 'skift', 'heltid', 'deltid', 'vikariat',
  ],
  whiteCollarKeywords: SHARED_WHITE_COLLAR,
  blacklistedTitles: [
    ...SHARED_BLACKLISTED_TITLES,
    'startsida', 'om oss', 'kontakt', 'kontakta oss',
    'integritetspolicy', 'villkor',
    'sidan hittades inte',
  ],
  jobUrlPatterns: [
    ...SHARED_JOB_URL_PATTERNS,
    /\/karriar/i, /\/lediga-jobb/i, /\/jobba-hos-oss/i,
  ],
  nonJobUrlPatterns: SHARED_NON_JOB_URL_PATTERNS,
};

// ─── Market Keyword Map ─────────────────────────────────────────

const MARKET_KEYWORDS: Record<string, JobMarketKeywords> = {
  TR: TR_KEYWORDS,
  US: EN_KEYWORDS, UK: EN_KEYWORDS, AU: EN_KEYWORDS, CA: EN_KEYWORDS,
  PH: EN_KEYWORDS, ZA: EN_KEYWORDS, PK: EN_KEYWORDS, IN: EN_KEYWORDS,
  DE: DE_KEYWORDS,
  BR: PT_KEYWORDS, PT: PT_KEYWORDS,
  ES: ES_KEYWORDS, MX: ES_KEYWORDS, AR: ES_KEYWORDS, CO: ES_KEYWORDS,
  FR: FR_KEYWORDS,
  IT: IT_KEYWORDS,
  RU: RU_KEYWORDS,
  JP: JP_KEYWORDS,
  ID: ID_KEYWORDS,
  TH: TH_KEYWORDS,
  KR: KR_KEYWORDS,
  EG: AR_KEYWORDS, SA: AR_KEYWORDS, AE: AR_KEYWORDS,
  VN: VN_KEYWORDS,
  PL: PL_KEYWORDS,
  MY: MY_KEYWORDS,
  NL: NL_KEYWORDS,
  SE: SE_KEYWORDS,
};

// ====== WAF / BOT DETECTION ======

const WAF_TITLE_PATTERNS = [
  /access denied/i, /permission denied/i, /forbidden/i,
  /cloudflare/i, /captcha/i, /recaptcha/i, /hcaptcha/i,
  /just a moment/i, /checking your browser/i, /please wait/i,
  /ddos protection/i, /bot detection/i,
  /too many requests/i, /rate limit/i,
  /security check/i, /verify you are human/i,
  /erişim engellendi/i, /güvenlik kontrolü/i,
];

// ====== 404 / ERROR PAGE DETECTION ======

const ERROR_TITLE_PATTERNS = [
  /^404\b/i, /\b404\b.*not found/i, /page not found/i,
  /sayfa bulunamadı/i, /sayfa bulunamadi/i,
  /seite nicht gefunden/i,
  /page non trouvée/i, /page introuvable/i,
  /página no encontrada/i,
  /pagina non trovata/i,
  /página não encontrada/i,
  /страница не найдена/i,
  /ページが見つかりません/i,
  /페이지를 찾을 수 없/i,
  /halaman tidak ditemukan/i,
  /ไม่พบหน้า/i,
  /الصفحة غير موجودة/i,
  /không tìm thấy trang/i,
  /nie znaleziono strony/i,
  /pagina niet gevonden/i,
  /sidan hittades inte/i,
];

// ====== FOREIGN LOCALE URL CHECK ======

const MARKET_LOCALES: Record<string, RegExp[]> = {
  TR: [/\/(en|de|fr|it|es|pt|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i, /\/(en-us|en-gb|de-de|fr-fr)\//i],
  US: [/\/(tr|de|fr|it|es|pt|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  UK: [/\/(tr|de|fr|it|es|pt|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  DE: [/\/(en|tr|fr|it|es|pt|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  FR: [/\/(en|tr|de|it|es|pt|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  IT: [/\/(en|tr|de|fr|es|pt|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  ES: [/\/(en|tr|de|fr|it|pt|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  PT: [/\/(en|tr|de|fr|it|es|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  BR: [/\/(en|tr|de|fr|it|es|ru|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  JP: [/\/(en|tr|de|fr|it|es|pt|ru|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  KR: [/\/(en|tr|de|fr|it|es|pt|ru|ja|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
  RU: [/\/(en|tr|de|fr|it|es|pt|ja|ko|zh|ar|nl|sv|pl|vi|th|id|ms)\//i],
};

// ====== SCORING FUNCTIONS ======

interface ScoreResult {
  score: number;
  reasons: string[];
}

function hardReject(
  listing: NormalizedJobListing,
  keywords: JobMarketKeywords,
  market?: Market,
): string | null {
  const titleLower = listing.title.toLowerCase();
  const urlLower = listing.sourceUrl.toLowerCase();

  // 1. WAF/bot detection
  for (const p of WAF_TITLE_PATTERNS) {
    if (p.test(listing.title)) return 'waf_bot';
  }

  // 2. 404/error pages
  for (const p of ERROR_TITLE_PATTERNS) {
    if (p.test(listing.title)) return '404_error';
  }

  // 3. Too short title
  if (listing.title.length < 5) return 'title_too_short';

  // 4. Blacklisted titles (exact match)
  for (const bl of keywords.blacklistedTitles) {
    if (titleLower === bl.toLowerCase() || titleLower === bl.toLowerCase().replace(/\s+/g, '')) {
      return 'blacklisted_title';
    }
  }

  // 5. White-collar job detection (word boundary for precision)
  for (const wc of keywords.whiteCollarKeywords) {
    const wcLower = wc.toLowerCase();
    // Use word boundary for multi-word terms
    if (wcLower.includes(' ')) {
      if (titleLower.includes(wcLower)) return `white_collar:${wc}`;
    } else {
      // Single word — use word boundary regex
      const re = new RegExp(`\\b${wcLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(titleLower)) {
        // Exception: blue-collar manager roles
        if (isBlueCollarManager(titleLower, wcLower)) continue;
        return `white_collar:${wc}`;
      }
    }
  }

  // 6. Non-job URL patterns
  for (const p of keywords.nonJobUrlPatterns) {
    if (p.test(urlLower)) {
      // But if URL also matches job patterns, don't reject (e.g., /about-careers)
      const hasJobUrl = keywords.jobUrlPatterns.some(jp => jp.test(urlLower));
      if (!hasJobUrl) return 'non_job_url';
    }
  }

  // 7. CSS/garbage title fragments
  if (/^[.#\[\]{}@]/.test(listing.title) || /::before|::after|::placeholder/i.test(listing.title)) {
    return 'css_garbage';
  }

  // 8. Foreign locale URL check
  if (market) {
    const localePatterns = MARKET_LOCALES[market];
    if (localePatterns) {
      for (const lp of localePatterns) {
        if (lp.test(listing.sourceUrl)) return 'foreign_locale';
      }
    }
  }

  return null; // Not rejected
}

/** Check if a "manager" or "engineer" title is actually blue-collar */
function isBlueCollarManager(titleLower: string, _wcTerm: string): boolean {
  const blueCollarPatterns = [
    // Manager roles in operational/blue-collar settings
    /\bshift\s+manager\b/i,
    /\bwarehouse\s+manager\b/i,
    /\bsite\s+manager\b/i,
    /\bfloor\s+manager\b/i,
    /\bduty\s+manager\b/i,
    /\bstore\s+manager\b/i,
    /\brestaurant\s+manager\b/i,
    /\bkitchen\s+manager\b/i,
    /\bfactory\s+manager\b/i,
    /\bplant\s+manager\b/i,
    /\boperations\s+manager\b/i,
    /\bproduction\s+manager\b/i,
    /\bfacilities?\s+manager\b/i,
    /\bvardiya\s+(müdürü|amiri|sorumlusu)\b/i,
    /\bdepo\s+(müdürü|sorumlusu)\b/i,
    /\bşantiye\s+(şefi|müdürü)\b/i,
    /\bmağaza\s+müdürü\b/i,
    /\brestoran\s+müdürü\b/i,
    /\bfabrika\s+müdürü\b/i,
    /\büretim\s+müdürü\b/i,
    // Engineer roles that are blue-collar / field work
    /\bmaintenance\s+engineer\b/i,
    /\bfield\s+engineer\b/i,
    /\bsite\s+engineer\b/i,
    /\bprocess\s+engineer\b/i,
    /\bservice\s+engineer\b/i,
    /\bplant\s+engineer\b/i,
    /\bfacilities?\s+engineer\b/i,
    /\bproduction\s+engineer\b/i,
    /\bmanufacturing\s+engineer\b/i,
    /\breliability\s+engineer\b/i,
    /\btest\s+engineer\b/i,
    /\bquality\s+engineer\b/i,
    /\bbakım\s+mühendisi\b/i,
    /\bsaha\s+mühendisi\b/i,
    /\büretim\s+mühendisi\b/i,
    /\bproses\s+mühendisi\b/i,
  ];

  return blueCollarPatterns.some(p => p.test(titleLower));
}

function scoreJobListing(
  listing: NormalizedJobListing,
  keywords: JobMarketKeywords,
  companyName?: string,
): ScoreResult {
  let score = 0;
  const reasons: string[] = [];

  const titleLower = listing.title.toLowerCase();
  const urlLower = listing.sourceUrl.toLowerCase();

  // +3: Blue-collar keyword in title
  for (const kw of keywords.blueCollarKeywords) {
    if (titleLower.includes(kw.toLowerCase())) {
      score += 3;
      reasons.push(`blue_collar:${kw}`);
      break; // Only count once
    }
  }

  // +2: Job posting keyword in title or description
  const textToCheck = [titleLower, listing.description?.toLowerCase() || ''].join(' ');
  for (const kw of keywords.jobPostingKeywords) {
    if (textToCheck.includes(kw.toLowerCase())) {
      score += 2;
      reasons.push(`job_posting:${kw}`);
      break;
    }
  }

  // +2: Has salary info
  if (listing.salaryMin !== null || listing.salaryMax !== null) {
    score += 2;
    reasons.push('has_salary');
  }

  // +2: Has deadline
  if (listing.deadline) {
    score += 2;
    reasons.push('has_deadline');
  }

  // +2: Job URL pattern
  for (const p of keywords.jobUrlPatterns) {
    if (p.test(urlLower)) {
      score += 2;
      reasons.push('job_url');
      break;
    }
  }

  // +1: Title >= 10 chars
  if (listing.title.length >= 10) {
    score += 1;
    reasons.push('title_len');
  }

  // +1: Description >= 20 chars
  if (listing.description && listing.description.length >= 20) {
    score += 1;
    reasons.push('desc_len');
  }

  // +1: Has requirements
  if (listing.requirements && listing.requirements.length >= 10) {
    score += 1;
    reasons.push('has_requirements');
  }

  // +1: Has location
  if (listing.city || listing.state) {
    score += 1;
    reasons.push('has_location');
  }

  // +1: Has image
  if (listing.imageUrls.length > 0) {
    score += 1;
    reasons.push('has_image');
  }

  // -2: Non-job URL (if not already counted in hard reject)
  for (const p of keywords.nonJobUrlPatterns) {
    if (p.test(urlLower)) {
      score -= 2;
      reasons.push('non_job_url_penalty');
      break;
    }
  }

  // -2: Company-name-only title
  if (companyName && titleLower === companyName.toLowerCase()) {
    score -= 2;
    reasons.push('company_only_title');
  }

  // -1: No description AND no image (thin content)
  if (!listing.description && listing.imageUrls.length === 0) {
    score -= 1;
    reasons.push('thin_content');
  }

  return { score, reasons };
}

// ====== EXPORTED FILTER FUNCTIONS ======

/** Static quality filter (no AI) */
export function filterJobListings(
  listings: NormalizedJobListing[],
  companyName?: string,
  market?: Market,
): { passed: NormalizedJobListing[]; rejected: NormalizedJobListing[] } {
  const keywords = MARKET_KEYWORDS[market || 'TR'] || EN_KEYWORDS;
  const passed: NormalizedJobListing[] = [];
  const rejected: NormalizedJobListing[] = [];

  for (const listing of listings) {
    // Hard reject check
    const rejectReason = hardReject(listing, keywords, market);
    if (rejectReason) {
      console.log(`  [Quality] HARD_REJECT (${rejectReason}): "${listing.title.substring(0, 60)}"`);
      rejected.push(listing);
      continue;
    }

    // Blue-collar filter — reject non-blue-collar jobs at ingestion
    if (!isBlueCollar(listing.title, listing.description)) {
      console.log(`  [Quality] NOT_BLUE_COLLAR: "${listing.title.substring(0, 60)}"`);
      rejected.push(listing);
      continue;
    }

    // Score
    const result = scoreJobListing(listing, keywords, companyName);

    if (result.score >= MIN_SCORE) {
      console.log(
        `  [Quality] PASSED (score=${result.score}): "${listing.title.substring(0, 60)}" [${result.reasons.join(', ')}]`,
      );
      passed.push(listing);
    } else {
      console.log(
        `  [Quality] REJECTED (score=${result.score}): "${listing.title.substring(0, 60)}" [${result.reasons.join(', ')}]`,
      );
      rejected.push(listing);
    }
  }

  console.log(`  [Quality] ${passed.length}/${listings.length} passed, ${rejected.length} rejected`);
  return { passed, rejected };
}

/** Quality filter with AI for borderline cases */
export async function filterJobListingsWithAI(
  listings: NormalizedJobListing[],
  companyName?: string,
  market?: Market,
): Promise<{ passed: NormalizedJobListing[]; rejected: NormalizedJobListing[] }> {
  const keywords = MARKET_KEYWORDS[market || 'TR'] || EN_KEYWORDS;
  const passed: NormalizedJobListing[] = [];
  const rejected: NormalizedJobListing[] = [];
  let aiCalls = 0;
  let aiFallbacks = 0;

  for (const listing of listings) {
    // Hard reject check
    const rejectReason = hardReject(listing, keywords, market);
    if (rejectReason) {
      console.log(`  [Quality] HARD_REJECT (${rejectReason}): "${listing.title.substring(0, 60)}"`);
      rejected.push(listing);
      continue;
    }

    // Blue-collar filter — reject non-blue-collar jobs at ingestion
    if (!isBlueCollar(listing.title, listing.description)) {
      console.log(`  [Quality] NOT_BLUE_COLLAR: "${listing.title.substring(0, 60)}"`);
      rejected.push(listing);
      continue;
    }

    // Score
    const result = scoreJobListing(listing, keywords, companyName);

    // Auto-accept: score >= 6
    if (result.score >= AUTO_ACCEPT_SCORE) {
      console.log(
        `  [Quality] AUTO_ACCEPT (score=${result.score}): "${listing.title.substring(0, 60)}" [${result.reasons.join(', ')}]`,
      );
      passed.push(listing);
      continue;
    }

    // Auto-reject: score < borderline min
    if (result.score < AI_BORDERLINE_MIN) {
      console.log(
        `  [Quality] REJECTED (score=${result.score}): "${listing.title.substring(0, 60)}" [${result.reasons.join(', ')}]`,
      );
      rejected.push(listing);
      continue;
    }

    // Borderline (score 3-5) — ask AI
    try {
      const aiResult = await classifyAndEnrich(
        listing.title,
        listing.description,
        listing.sourceUrl,
        companyName || '',
        market,
      );
      aiCalls++;

      if (aiResult.confidence >= AI_CONFIDENCE_THRESHOLD) {
        if (aiResult.isJobListing) {
          // AI says it's a valid job listing — enrich with AI-extracted data
          if (aiResult.endDate && !listing.deadline) {
            listing.deadline = new Date(aiResult.endDate);
          }

          console.log(
            `  [AI] ACCEPTED (${aiResult.confidence.toFixed(2)}): "${listing.title.substring(0, 50)}" → ${aiResult.reason}`,
          );
          passed.push(listing);
        } else {
          console.log(
            `  [AI] REJECTED (${aiResult.confidence.toFixed(2)}): "${listing.title.substring(0, 50)}" → ${aiResult.reason}`,
          );
          rejected.push(listing);
        }
      } else {
        // Low confidence — fall back to static score
        const isFallback = aiResult.reason.includes('fallback');
        if (isFallback) aiFallbacks++;
        const tag = isFallback ? 'AI_EXHAUSTED' : 'LOW_CONF';
        if (result.score >= MIN_SCORE) {
          console.log(
            `  [AI] ${tag} (${aiResult.confidence.toFixed(2)}, score=${result.score}): "${listing.title.substring(0, 50)}" → accepted by static score`,
          );
          passed.push(listing);
        } else {
          console.log(
            `  [AI] ${tag} (${aiResult.confidence.toFixed(2)}, score=${result.score}): "${listing.title.substring(0, 50)}" → rejected by static score`,
          );
          rejected.push(listing);
        }
      }
    } catch (err) {
      aiFallbacks++;
      console.warn(`  [AI] ERROR: ${(err as Error).message} — falling back to static score`);
      if (result.score >= MIN_SCORE) {
        passed.push(listing);
      } else {
        rejected.push(listing);
      }
    }
  }

  const total = passed.length + rejected.length;
  console.log(`  [Quality+AI] ${passed.length}/${total} passed, ${rejected.length} rejected, ${aiCalls} AI calls${aiFallbacks > 0 ? `, ${aiFallbacks} AI fallbacks` : ''}`);

  return { passed, rejected };
}

