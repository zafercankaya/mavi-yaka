/**
 * blue-collar-filter.ts — Mavi yaka iş ilanı filtresi
 *
 * Tüm veri giriş noktalarında (bulk import, crawler) kullanılır.
 * Beyaz yaka ilanları DB'ye girmeden engeller.
 *
 * Mantık:
 *   1. White-collar keyword → REJECT (isBlueCollarManager exception hariç)
 *   2. Blue-collar keyword → ACCEPT
 *   3. Ne beyaz ne mavi → REJECT (emin değilsek almıyoruz)
 */

// ─── White-collar keywords (all languages) ──────────────────────────

const WHITE_COLLAR_KEYWORDS = [
  // C-suite & executive
  'ceo', 'cto', 'cfo', 'coo', 'cmo', 'cio', 'cpo',
  'vice president', 'vp of', 'svp', 'evp',
  'chief executive', 'chief technology', 'chief financial', 'chief operating',
  'managing director', 'general manager', 'senior director', 'executive director',
  'board member', 'board of directors',
  // Software & IT
  'software engineer', 'software developer', 'frontend developer', 'backend developer',
  'full stack developer', 'fullstack developer', 'web developer', 'mobile developer',
  'devops', 'cloud engineer', 'cloud architect', 'sre ', 'site reliability',
  'ui/ux', 'ux designer', 'ui designer',
  // Data & AI
  'data scientist', 'data analyst', 'data engineer', 'machine learning',
  'artificial intelligence', 'deep learning', 'nlp engineer',
  // Management (non-operational)
  'product manager', 'product owner', 'project manager', 'program manager',
  'business analyst', 'financial analyst', 'market analyst', 'research analyst',
  'marketing manager', 'brand manager', 'digital marketing',
  'hr manager', 'human resources manager', 'talent acquisition', 'recruiter',
  // Professional
  'consultant', 'management consultant', 'strategy consultant',
  'lawyer', 'attorney', 'solicitor', 'barrister', 'legal counsel', 'paralegal',
  'doctor', 'physician', 'surgeon', 'psychiatrist', 'dentist', 'dermatologist',
  'professor', 'lecturer', 'researcher', 'academic', 'postdoc',
  'architect', 'solution architect', 'enterprise architect',
  // Finance
  'investment banker', 'portfolio manager', 'hedge fund', 'venture capital',
  'financial advisor', 'wealth manager', 'actuary', 'underwriter',
  'auditor', 'controller', 'treasurer',
  // Creative (non-operational)
  'creative director', 'art director', 'design director',
  'copywriter', 'content strategist', 'social media manager',
  // Accounting
  'accountant', 'bookkeeper', 'tax specialist', 'cpa',
  // German
  'geschäftsführer', 'vorstand', 'direktor', 'abteilungsleiter',
  'softwareentwickler', 'programmierer', 'datenanalyst', 'datenwissenschaftler',
  'unternehmensberater', 'rechtsanwalt', 'wirtschaftsprüfer', 'steuerberater',
  // Portuguese
  'desenvolvedor', 'programador', 'analista de sistemas', 'analista de dados',
  'gerente de projetos', 'advogado', 'contador', 'economista',
  // Spanish
  'desarrollador', 'programador', 'analista de sistemas', 'analista de datos',
  'gerente de proyecto', 'abogado', 'contador público', 'economista',
  // French
  'développeur', 'analyste de données', 'chef de projet', 'avocat',
  'comptable', 'consultant en management',
  // Italian
  'sviluppatore', 'analista dati', 'avvocato', 'commercialista',
  // Russian
  'разработчик', 'программист', 'аналитик данных', 'менеджер проектов',
  'бухгалтер', 'юрист', 'адвокат',
  // Japanese
  'エンジニア', 'プログラマー', 'データサイエンティスト', 'コンサルタント',
  '弁護士', '会計士', 'マネージャー',
  // Turkish
  'genel müdür', 'genel müdür yardımcısı', 'direktör',
  'yazılım geliştirici', 'yazılım mühendisi', 'frontend geliştirici',
  'veri bilimci', 'veri analisti', 'iş analisti',
  'ürün müdürü', 'proje müdürü', 'pazarlama müdürü',
  'danışman', 'avukat', 'mali müşavir', 'mimar',
  'akademisyen', 'araştırmacı', 'öğretim üyesi', 'profesör',
  'muhasebeci', 'savcı', 'hakim',
  // Korean
  '소프트웨어', '개발자', '데이터', '변호사', '회계사',
  // Arabic
  'مطور', 'محلل بيانات', 'محاسب', 'محامي', 'مستشار',
  // Thai
  'นักพัฒนา', 'โปรแกรมเมอร์', 'นักวิเคราะห์', 'ทนายความ', 'นักบัญชี',
  // Indonesian
  'pengembang', 'programmer', 'analis data', 'pengacara', 'akuntan',
  // Vietnamese
  'lập trình viên', 'nhà phát triển', 'kế toán', 'luật sư',
  // Polish
  'programista', 'analityk danych', 'prawnik', 'księgowy',
  // Malay
  'pembangun perisian', 'penganalisis data', 'peguam', 'akauntan',
  // Dutch
  'softwareontwikkelaar', 'data-analist', 'advocaat', 'accountant',
  // Swedish
  'mjukvaruutvecklare', 'dataanalytiker', 'advokat', 'revisor',
];

// ─── Blue-collar keywords (all languages) ───────────────────────────

const BLUE_COLLAR_KEYWORDS = [
  // English — Transport & Logistics
  'driver', 'truck driver', 'bus driver', 'taxi driver', 'courier', 'delivery',
  'forklift', 'warehouse', 'loader', 'packer', 'picker', 'stocker', 'sorter',
  'dispatcher', 'dock worker', 'stevedore', 'longshoreman',
  // English — Trades & Construction
  'electrician', 'plumber', 'carpenter', 'painter', 'mason', 'welder',
  'roofer', 'glazier', 'bricklayer', 'tiler', 'plasterer', 'scaffolder',
  'pipefitter', 'sheet metal', 'ironworker', 'insulator',
  // English — Manufacturing
  'machinist', 'operator', 'assembly', 'factory worker', 'production worker',
  'process worker', 'line worker', 'press operator', 'cnc operator',
  'lathe operator', 'mill operator', 'tool and die',
  // English — Food & Hospitality
  'cook', 'chef', 'baker', 'butcher', 'kitchen', 'dishwasher', 'barista',
  'waiter', 'waitress', 'bartender', 'server', 'busser',
  // English — Maintenance & Cleaning
  'janitor', 'cleaner', 'custodian', 'housekeeper', 'caretaker',
  'groundskeeper', 'landscaper', 'gardener', 'maintenance',
  'laundry worker', 'ironer', 'presser',
  // English — Security
  'security guard', 'security officer', 'patrol', 'bouncer',
  'correctional officer', 'detention officer',
  // English — Healthcare Support
  'nursing assistant', 'nurse aide', 'cna', 'home health aide',
  'orderly', 'hospital housekeeping', 'phlebotomist',
  // English — Other
  'technician', 'mechanic', 'installer', 'repair', 'laborer',
  'construction worker', 'helper', 'attendant', 'handler',
  'farmworker', 'harvest', 'miner', 'driller', 'rigger', 'crane operator',
  'tailor', 'seamstress', 'textile worker',
  'porter', 'bellboy', 'doorman', 'valet',
  'hairdresser', 'barber', 'nail technician',
  'hvac', 'locksmith', 'elevator mechanic',
  'pest control', 'exterminator', 'pool technician',
  // Blue-collar manager/supervisor (exceptions)
  'shift manager', 'warehouse manager', 'site manager', 'floor manager',
  'store manager', 'restaurant manager', 'kitchen manager', 'factory manager',
  'plant manager', 'production manager', 'foreman', 'supervisor',
  'shift leader', 'team leader', 'crew leader', 'gang leader',
  // Blue-collar engineer (field/maintenance)
  'maintenance engineer', 'field engineer', 'site engineer', 'service engineer',
  'process engineer', 'plant engineer', 'manufacturing engineer',
  'production engineer', 'reliability engineer', 'quality engineer',
  // German
  'fahrer', 'lkw-fahrer', 'busfahrer', 'kurier', 'zusteller',
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
  'helfer', 'aushilfe', 'fachkraft',
  // Portuguese
  'motorista', 'caminhoneiro', 'entregador', 'motoboy',
  'eletricista', 'encanador', 'pedreiro', 'pintor', 'soldador',
  'carpinteiro', 'marceneiro', 'vidraceiro', 'serralheiro',
  'operador', 'ajudante', 'auxiliar', 'servente',
  'cozinheiro', 'padeiro', 'açougueiro', 'garçom', 'copeiro',
  'faxineiro', 'zelador', 'porteiro', 'vigia', 'segurança',
  'costureiro', 'costureira', 'tecelão',
  'mecânico', 'técnico', 'instalador', 'montador',
  'estoquista', 'almoxarife', 'conferente', 'empacotador',
  // Spanish
  'conductor', 'chofer', 'repartidor', 'mensajero',
  'electricista', 'plomero', 'fontanero', 'albañil', 'pintor', 'soldador',
  'carpintero', 'cerrajero', 'vidriería', 'herrero',
  'operario', 'ayudante', 'auxiliar', 'peón',
  'cocinero', 'panadero', 'carnicero', 'mesero', 'camarero',
  'limpiador', 'conserje', 'portero', 'vigilante', 'guardia',
  'costurero', 'modista', 'sastre',
  'mecánico', 'técnico', 'instalador', 'montador',
  'almacenista', 'bodeguero', 'empacador',
  // French
  'chauffeur', 'livreur', 'coursier',
  'électricien', 'plombier', 'maçon', 'peintre', 'soudeur',
  'charpentier', 'menuisier', 'couvreur', 'vitrier', 'serrurier',
  'opérateur', 'ouvrier', 'manœuvre', 'aide',
  'cuisinier', 'boulanger', 'boucher', 'serveur', 'barman',
  'nettoyeur', 'agent d\'entretien', 'concierge', 'gardien',
  'couturier', 'tailleur',
  'mécanicien', 'technicien', 'installateur', 'monteur',
  'magasinier', 'manutentionnaire', 'préparateur',
  // Italian
  'autista', 'corriere', 'fattorino',
  'elettricista', 'idraulico', 'muratore', 'imbianchino', 'saldatore',
  'falegname', 'carpentiere', 'vetraio', 'fabbro',
  'operaio', 'manovale', 'addetto',
  'cuoco', 'panettiere', 'macellaio', 'cameriere', 'barista',
  'addetto pulizie', 'custode', 'portiere', 'guardia', 'vigilante',
  'sarto', 'cucitrice',
  'meccanico', 'tecnico', 'installatore', 'montatore',
  'magazziniere',
  // Turkish
  'şoför', 'sürücü', 'kurye', 'dağıtıcı', 'teslimatçı',
  'teknisyen', 'tekniker', 'elektrikçi', 'tesisatçı', 'boyacı',
  'kaynakçı', 'tornacı', 'frezeci', 'tesviyeci', 'kalıpçı',
  'marangoz', 'doğramacı', 'mobilyacı', 'döşemeci',
  'usta', 'kalfa', 'çırak', 'işçi', 'amele', 'taşeron',
  'garson', 'komi', 'aşçı', 'aşçıbaşı', 'bulaşıkçı', 'fırıncı',
  'kasiyer', 'reyon görevlisi', 'depocu', 'raf düzenleyici',
  'forklift operatörü', 'vinçci', 'beko operatörü', 'kepçe operatörü',
  'güvenlik', 'güvenlik görevlisi', 'bekçi', 'koruma',
  'temizlik', 'temizlik görevlisi', 'hizmetli', 'hademe',
  'bakıcı', 'hasta bakıcı', 'yaşlı bakıcı',
  'terzi', 'konfeksiyoncu', 'overlokçu', 'makineci',
  'inşaat işçisi', 'demirci', 'sıvacı', 'alçıcı',
  'bahçıvan', 'çiftçi', 'hayvancı', 'çoban',
  'montajcı', 'cam ustası', 'seramikçi',
  'çamaşırcı', 'ütücü', 'kasap',
  'vardiya amiri', 'vardiya sorumlusu', 'depo sorumlusu',
  'şantiye şefi', 'mağaza müdürü', 'restoran müdürü',
  'fabrika müdürü', 'üretim müdürü',
  'bakım mühendisi', 'saha mühendisi', 'üretim mühendisi',
  // Russian
  'водитель', 'курьер', 'грузчик', 'кладовщик', 'комплектовщик',
  'электрик', 'сантехник', 'сварщик', 'токарь', 'фрезеровщик', 'слесарь',
  'плотник', 'столяр', 'маляр', 'каменщик', 'штукатур',
  'повар', 'пекарь', 'мясник', 'официант', 'бармен',
  'уборщик', 'дворник', 'охранник', 'вахтер', 'сторож',
  'швея', 'портной', 'оператор', 'рабочий', 'разнорабочий',
  'механик', 'техник', 'монтажник', 'наладчик',
  // Japanese
  '運転手', 'ドライバー', '配達', '倉庫', 'フォークリフト',
  '電気工事', '配管工', '溶接', '大工', '塗装',
  '調理', '料理人', 'キッチン', '清掃', '警備',
  'メンテナンス', '整備士', '技術者', '作業員', '製造',
  '介護', '看護助手',
  // Korean
  '운전기사', '택배', '배달', '지게차', '창고',
  '전기기사', '배관공', '용접', '목수', '도장',
  '조리사', '요리사', '주방', '청소', '경비',
  '정비사', '기술자', '생산직', '제조',
  // Arabic
  'سائق', 'عامل', 'كهربائي', 'سباك', 'لحام', 'نجار', 'دهان',
  'طباخ', 'خباز', 'جزار', 'نادل', 'حارس', 'عامل نظافة',
  'فني', 'ميكانيكي', 'مشغل',
  // Thai
  'คนขับ', 'พนักงานส่งของ', 'พนักงานคลังสินค้า',
  'ช่างไฟฟ้า', 'ช่างประปา', 'ช่างเชื่อม', 'ช่างไม้',
  'พ่อครัว', 'แม่ครัว', 'พนักงานเสิร์ฟ', 'รปภ', 'แม่บ้าน',
  'ช่างเทคนิค', 'ช่างซ่อม', 'พนักงานผลิต',
  // Indonesian
  'sopir', 'pengemudi', 'kurir', 'kuli', 'buruh',
  'teknisi', 'mekanik', 'tukang', 'operator', 'satpam',
  'koki', 'juru masak', 'pelayan', 'pramusaji', 'cleaning service',
  // Vietnamese
  'tài xế', 'lái xe', 'giao hàng', 'thợ điện', 'thợ hàn',
  'thợ mộc', 'thợ sơn', 'thợ xây', 'thợ máy', 'thợ cơ khí',
  'đầu bếp', 'phục vụ', 'bảo vệ', 'tạp vụ', 'công nhân',
  // Polish
  'kierowca', 'kurier', 'magazynier', 'pakowacz',
  'elektryk', 'hydraulik', 'spawacz', 'stolarz', 'malarz', 'murarz',
  'kucharz', 'piekarz', 'kelner', 'ochroniarz', 'sprzątacz',
  'mechanik', 'technik', 'operator', 'robotnik', 'pracownik produkcji',
  // Malay
  'pemandu', 'penghantar', 'pekerja kilang', 'operator mesin',
  'juruteknik', 'mekanik', 'tukang', 'pengawal keselamatan',
  'tukang masak', 'pelayan', 'pencuci',
  // Dutch
  'chauffeur', 'bezorger', 'magazijnmedewerker', 'orderpicker',
  'elektricien', 'loodgieter', 'lasser', 'timmerman', 'schilder', 'metselaar',
  'kok', 'bakker', 'kelner', 'beveiliger', 'schoonmaker',
  'monteur', 'productiemedewerker', 'machinebediener',
  // Swedish
  'chaufför', 'förare', 'lagerpersonal', 'truckförare',
  'elektriker', 'rörmokare', 'svetsare', 'snickare', 'målare', 'murare',
  'kock', 'bagare', 'servitör', 'vakt', 'städare',
  'mekaniker', 'tekniker', 'operatör', 'montör',
  // Urdu
  'ڈرائیور', 'الیکٹریشن', 'مستری', 'ویلڈر', 'مزدور',
  'باورچی', 'چوکیدار', 'صفائی',
  // Wage grade (USAJobs specific)
  'wage grade', 'wg-',
];

// Pre-compile for performance
const _whiteCollarSet = new Set(WHITE_COLLAR_KEYWORDS.map(k => k.toLowerCase()));
const _blueCollarLower = BLUE_COLLAR_KEYWORDS.map(k => k.toLowerCase());

/**
 * Check if a job title/description indicates a blue-collar position.
 *
 * Returns true if the job should be ACCEPTED (blue-collar).
 * Returns false if the job should be REJECTED (white-collar or unknown).
 */
export function isBlueCollar(title: string, description?: string | null): boolean {
  const titleLower = title.toLowerCase();
  const fullText = description ? `${titleLower} ${description.toLowerCase()}` : titleLower;

  // Step 1: Check white-collar keywords in title — REJECT
  for (const wc of _whiteCollarSet) {
    if (wc.includes(' ')) {
      // Multi-word: substring match in title
      if (titleLower.includes(wc)) {
        // Exception: blue-collar manager/engineer roles
        if (_isBlueCollarException(titleLower)) continue;
        return false;
      }
    } else {
      // Single word: word boundary match in title
      const re = new RegExp(`\\b${_escapeRegex(wc)}\\b`, 'i');
      if (re.test(titleLower)) {
        if (_isBlueCollarException(titleLower)) continue;
        return false;
      }
    }
  }

  // Step 2: Check blue-collar keywords in title OR description — ACCEPT
  for (const bc of _blueCollarLower) {
    if (bc.includes(' ')) {
      if (fullText.includes(bc)) return true;
    } else {
      const re = new RegExp(`\\b${_escapeRegex(bc)}\\b`, 'i');
      if (re.test(fullText)) return true;
    }
  }

  // Step 3: Neither blue nor white → REJECT (when in doubt, filter out)
  return false;
}

/** Blue-collar manager/supervisor/engineer exception patterns */
function _isBlueCollarException(titleLower: string): boolean {
  const patterns = [
    /\bshift\s+(manager|leader|supervisor)\b/,
    /\bwarehouse\s+(manager|supervisor)\b/,
    /\bsite\s+(manager|supervisor|engineer)\b/,
    /\bfloor\s+(manager|supervisor)\b/,
    /\bstore\s+manager\b/,
    /\brestaurant\s+manager\b/,
    /\bkitchen\s+manager\b/,
    /\bfactory\s+(manager|supervisor)\b/,
    /\bplant\s+(manager|engineer)\b/,
    /\bproduction\s+(manager|supervisor|engineer)\b/,
    /\boperations?\s+(manager|supervisor)\b/,
    /\bfacilit(y|ies)\s+(manager|engineer)\b/,
    /\bmaintenance\s+(manager|supervisor|engineer)\b/,
    /\bfield\s+engineer\b/,
    /\bservice\s+engineer\b/,
    /\bmanufacturing\s+engineer\b/,
    /\breliability\s+engineer\b/,
    /\bquality\s+engineer\b/,
    /\bprocess\s+engineer\b/,
    /\bforeman\b/, /\bsupervisor\b/,
    // Turkish
    /\bvardiya\s+(müdürü|amiri|sorumlusu)\b/,
    /\bdepo\s+(müdürü|sorumlusu)\b/,
    /\bşantiye\s+(şefi|müdürü)\b/,
    /\bmağaza\s+müdürü\b/, /\brestoran\s+müdürü\b/,
    /\bfabrika\s+müdürü\b/, /\büretim\s+müdürü\b/,
    /\bbakım\s+mühendisi\b/, /\bsaha\s+mühendisi\b/,
    /\büretim\s+mühendisi\b/, /\bproses\s+mühendisi\b/,
    // German
    /\bschichtleiter\b/, /\blagerleiter\b/, /\bbauleiter\b/,
    /\bwerkstattleiter\b/, /\bfilialleiter\b/,
    /\bmeister\b/, /\bvorarbeiter\b/,
  ];
  return patterns.some(p => p.test(titleLower));
}

function _escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Filter a batch of items, returning only blue-collar ones.
 * Useful for bulk imports.
 */
export function filterBlueCollar<T extends { title: string; description?: string | null }>(
  items: T[],
): { passed: T[]; rejected: number } {
  const passed: T[] = [];
  let rejected = 0;
  for (const item of items) {
    if (isBlueCollar(item.title, item.description)) {
      passed.push(item);
    } else {
      rejected++;
    }
  }
  return { passed, rejected };
}
