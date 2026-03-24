/**
 * Generate a human-readable summary for a job listing from its metadata.
 * Runs at crawl time — no AI call needed, purely data-driven.
 */

import { NormalizedJobListing, Market } from './normalize';

// ─── Market-aware label maps ──────────────────────────────────────

const LABELS: Record<string, Record<string, string>> = {
  tr: {
    company: 'Firma',
    sector: 'Sektör',
    jobType: 'Çalışma Tipi',
    workMode: 'Çalışma Şekli',
    experience: 'Deneyim',
    location: 'Lokasyon',
    salary: 'Maaş',
    deadline: 'Son Başvuru',
    posted: 'Yayın Tarihi',
  },
  en: {
    company: 'Company',
    sector: 'Sector',
    jobType: 'Job Type',
    workMode: 'Work Mode',
    experience: 'Experience',
    location: 'Location',
    salary: 'Salary',
    deadline: 'Deadline',
    posted: 'Posted',
  },
  de: {
    company: 'Unternehmen',
    sector: 'Branche',
    jobType: 'Beschäftigungsart',
    workMode: 'Arbeitsmodell',
    experience: 'Erfahrung',
    location: 'Standort',
    salary: 'Gehalt',
    deadline: 'Bewerbungsfrist',
    posted: 'Veröffentlicht',
  },
  pt: {
    company: 'Empresa',
    sector: 'Setor',
    jobType: 'Tipo de Vaga',
    workMode: 'Modalidade',
    experience: 'Experiência',
    location: 'Localização',
    salary: 'Salário',
    deadline: 'Prazo',
    posted: 'Publicado',
  },
  es: {
    company: 'Empresa',
    sector: 'Sector',
    jobType: 'Tipo de Empleo',
    workMode: 'Modalidad',
    experience: 'Experiencia',
    location: 'Ubicación',
    salary: 'Salario',
    deadline: 'Fecha Límite',
    posted: 'Publicado',
  },
  fr: {
    company: 'Entreprise',
    sector: 'Secteur',
    jobType: "Type d'emploi",
    workMode: 'Mode de travail',
    experience: 'Expérience',
    location: 'Lieu',
    salary: 'Salaire',
    deadline: 'Date limite',
    posted: 'Publié',
  },
  ja: {
    company: '会社',
    sector: '業種',
    jobType: '雇用形態',
    workMode: '勤務形態',
    experience: '経験',
    location: '勤務地',
    salary: '給与',
    deadline: '応募締切',
    posted: '掲載日',
  },
  ru: {
    company: 'Компания',
    sector: 'Отрасль',
    jobType: 'Тип занятости',
    workMode: 'Формат работы',
    experience: 'Опыт',
    location: 'Местоположение',
    salary: 'Зарплата',
    deadline: 'Срок подачи',
    posted: 'Опубликовано',
  },
  id: {
    company: 'Perusahaan',
    sector: 'Sektor',
    jobType: 'Tipe Pekerjaan',
    workMode: 'Mode Kerja',
    experience: 'Pengalaman',
    location: 'Lokasi',
    salary: 'Gaji',
    deadline: 'Batas Waktu',
    posted: 'Diposting',
  },
  th: {
    company: 'บริษัท',
    sector: 'อุตสาหกรรม',
    jobType: 'ประเภทงาน',
    workMode: 'รูปแบบการทำงาน',
    experience: 'ประสบการณ์',
    location: 'สถานที่',
    salary: 'เงินเดือน',
    deadline: 'วันปิดรับสมัคร',
    posted: 'วันที่ลง',
  },
  ar: {
    company: 'الشركة',
    sector: 'القطاع',
    jobType: 'نوع الوظيفة',
    workMode: 'نمط العمل',
    experience: 'الخبرة',
    location: 'الموقع',
    salary: 'الراتب',
    deadline: 'آخر موعد',
    posted: 'تاريخ النشر',
  },
  ko: {
    company: '회사',
    sector: '업종',
    jobType: '고용형태',
    workMode: '근무형태',
    experience: '경력',
    location: '근무지',
    salary: '급여',
    deadline: '마감일',
    posted: '게시일',
  },
  it: {
    company: 'Azienda',
    sector: 'Settore',
    jobType: 'Tipo di Lavoro',
    workMode: 'Modalità',
    experience: 'Esperienza',
    location: 'Sede',
    salary: 'Stipendio',
    deadline: 'Scadenza',
    posted: 'Pubblicato',
  },
  vi: {
    company: 'Công ty',
    sector: 'Ngành',
    jobType: 'Loại công việc',
    workMode: 'Hình thức',
    experience: 'Kinh nghiệm',
    location: 'Địa điểm',
    salary: 'Lương',
    deadline: 'Hạn nộp',
    posted: 'Ngày đăng',
  },
  pl: {
    company: 'Firma',
    sector: 'Branża',
    jobType: 'Typ zatrudnienia',
    workMode: 'Tryb pracy',
    experience: 'Doświadczenie',
    location: 'Lokalizacja',
    salary: 'Wynagrodzenie',
    deadline: 'Termin',
    posted: 'Opublikowano',
  },
  ms: {
    company: 'Syarikat',
    sector: 'Sektor',
    jobType: 'Jenis Pekerjaan',
    workMode: 'Mod Kerja',
    experience: 'Pengalaman',
    location: 'Lokasi',
    salary: 'Gaji',
    deadline: 'Tarikh Akhir',
    posted: 'Disiarkan',
  },
  nl: {
    company: 'Bedrijf',
    sector: 'Sector',
    jobType: 'Dienstverband',
    workMode: 'Werkmodel',
    experience: 'Ervaring',
    location: 'Locatie',
    salary: 'Salaris',
    deadline: 'Deadline',
    posted: 'Geplaatst',
  },
  sv: {
    company: 'Företag',
    sector: 'Bransch',
    jobType: 'Anställningsform',
    workMode: 'Arbetsmodell',
    experience: 'Erfarenhet',
    location: 'Plats',
    salary: 'Lön',
    deadline: 'Sista ansökningsdag',
    posted: 'Publicerad',
  },
  ur: {
    company: 'کمپنی',
    sector: 'شعبہ',
    jobType: 'ملازمت کی قسم',
    workMode: 'کام کا طریقہ',
    experience: 'تجربہ',
    location: 'مقام',
    salary: 'تنخواہ',
    deadline: 'آخری تاریخ',
    posted: 'شائع شدہ',
  },
};

const MARKET_LANG: Record<Market, string> = {
  TR: 'tr', US: 'en', UK: 'en', CA: 'en', AU: 'en', PH: 'en', IN: 'en', ZA: 'en',
  DE: 'de', BR: 'pt', PT: 'pt', ES: 'es', MX: 'es', CO: 'es', AR: 'es',
  FR: 'fr', JP: 'ja', RU: 'ru', ID: 'id', TH: 'th', EG: 'ar', SA: 'ar', AE: 'ar',
  KR: 'ko', IT: 'it', VN: 'vi', PL: 'pl', MY: 'ms', NL: 'nl', SE: 'sv', PK: 'ur',
};

// Sector display names per language
const SECTOR_NAMES: Record<string, Record<string, string>> = {
  tr: {
    LOGISTICS_TRANSPORTATION: 'Lojistik & Taşımacılık', MANUFACTURING: 'Üretim & İmalat',
    RETAIL: 'Perakende & Mağazacılık', CONSTRUCTION: 'İnşaat', FOOD_BEVERAGE: 'Yiyecek & İçecek',
    AUTOMOTIVE: 'Otomotiv', TEXTILE: 'Tekstil', MINING_ENERGY: 'Madencilik & Enerji',
    HEALTHCARE: 'Sağlık', HOSPITALITY_TOURISM: 'Otelcilik & Turizm', AGRICULTURE: 'Tarım',
    SECURITY_SERVICES: 'Güvenlik Hizmetleri', FACILITY_MANAGEMENT: 'Tesis Yönetimi',
    METAL_STEEL: 'Metal & Çelik', CHEMICALS_PLASTICS: 'Kimya & Plastik',
    ECOMMERCE_CARGO: 'E-Ticaret & Kargo', TELECOMMUNICATIONS: 'Telekomünikasyon', OTHER: 'Diğer',
  },
  en: {
    LOGISTICS_TRANSPORTATION: 'Logistics & Transportation', MANUFACTURING: 'Manufacturing',
    RETAIL: 'Retail', CONSTRUCTION: 'Construction', FOOD_BEVERAGE: 'Food & Beverage',
    AUTOMOTIVE: 'Automotive', TEXTILE: 'Textile', MINING_ENERGY: 'Mining & Energy',
    HEALTHCARE: 'Healthcare', HOSPITALITY_TOURISM: 'Hospitality & Tourism', AGRICULTURE: 'Agriculture',
    SECURITY_SERVICES: 'Security Services', FACILITY_MANAGEMENT: 'Facility Management',
    METAL_STEEL: 'Metal & Steel', CHEMICALS_PLASTICS: 'Chemicals & Plastics',
    ECOMMERCE_CARGO: 'E-Commerce & Delivery', TELECOMMUNICATIONS: 'Telecommunications', OTHER: 'Other',
  },
};

const JOB_TYPE_NAMES: Record<string, Record<string, string>> = {
  tr: { FULL_TIME: 'Tam Zamanlı', PART_TIME: 'Yarı Zamanlı', DAILY: 'Günlük', SEASONAL: 'Mevsimlik', INTERNSHIP: 'Staj', CONTRACT: 'Sözleşmeli' },
  en: { FULL_TIME: 'Full-Time', PART_TIME: 'Part-Time', DAILY: 'Daily', SEASONAL: 'Seasonal', INTERNSHIP: 'Internship', CONTRACT: 'Contract' },
};

const WORK_MODE_NAMES: Record<string, Record<string, string>> = {
  tr: { ON_SITE: 'İş Yerinde', REMOTE: 'Uzaktan', HYBRID: 'Hibrit' },
  en: { ON_SITE: 'On-Site', REMOTE: 'Remote', HYBRID: 'Hybrid' },
};

const EXPERIENCE_NAMES: Record<string, Record<string, string>> = {
  tr: { NONE: 'Deneyimsiz', ENTRY: 'Giriş Seviye', MID: 'Orta Seviye', SENIOR: 'Kıdemli' },
  en: { NONE: 'No Experience', ENTRY: 'Entry Level', MID: 'Mid Level', SENIOR: 'Senior' },
};

function getLabel(lang: string, key: string): string {
  return LABELS[lang]?.[key] ?? LABELS.en[key] ?? key;
}

function getEnumName(map: Record<string, Record<string, string>>, lang: string, value: string): string {
  return map[lang]?.[value] ?? map.en?.[value] ?? value;
}

function formatDate(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null,
): string | null {
  if (!min && !max) return null;
  const c = currency || '';
  if (min && max) return `${c}${min.toLocaleString('en')} - ${c}${max.toLocaleString('en')}`;
  if (min) return `${c}${min.toLocaleString('en')}+`;
  return `${c}${max!.toLocaleString('en')}`;
}

// ─── Main function ──────────────────────────────────────────────

/**
 * Generate a structured summary string for a job listing.
 * Format: "Label: Value" lines joined by newline.
 * Uses the market's language for labels.
 */
export function generateJobSummary(
  listing: NormalizedJobListing,
  companyName: string | null,
  companySector: string | null,
  market: Market = 'TR',
): string | null {
  const lang = MARKET_LANG[market] || 'en';
  const lines: string[] = [];

  if (companyName) {
    lines.push(`${getLabel(lang, 'company')}: ${companyName}`);
  }

  const sector = listing.sector || companySector;
  if (sector && sector !== 'OTHER') {
    lines.push(`${getLabel(lang, 'sector')}: ${getEnumName(SECTOR_NAMES, lang, sector)}`);
  }

  if (listing.jobType) {
    lines.push(`${getLabel(lang, 'jobType')}: ${getEnumName(JOB_TYPE_NAMES, lang, listing.jobType)}`);
  }

  if (listing.workMode) {
    lines.push(`${getLabel(lang, 'workMode')}: ${getEnumName(WORK_MODE_NAMES, lang, listing.workMode)}`);
  }

  if (listing.experienceLevel) {
    lines.push(`${getLabel(lang, 'experience')}: ${getEnumName(EXPERIENCE_NAMES, lang, listing.experienceLevel)}`);
  }

  const location = [listing.city, listing.state].filter(Boolean).join(', ');
  if (location) {
    lines.push(`${getLabel(lang, 'location')}: ${location}`);
  }

  const salary = formatSalary(listing.salaryMin, listing.salaryMax, listing.salaryCurrency);
  if (salary) {
    lines.push(`${getLabel(lang, 'salary')}: ${salary}`);
  }

  if (listing.deadline) {
    lines.push(`${getLabel(lang, 'deadline')}: ${formatDate(listing.deadline)}`);
  }

  if (listing.postedDate) {
    lines.push(`${getLabel(lang, 'posted')}: ${formatDate(listing.postedDate)}`);
  }

  return lines.length > 0 ? lines.join('\n') : null;
}
