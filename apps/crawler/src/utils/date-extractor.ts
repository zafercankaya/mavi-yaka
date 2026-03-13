import * as cheerio from 'cheerio';

export interface ExtractedDates {
  startDate: string | null;
  endDate: string | null;
}

const EMPTY: ExtractedDates = { startDate: null, endDate: null };

// Turkish month names — both Unicode and ASCII-folded variants
const TR_MONTHS: Record<string, number> = {
  'ocak': 0, 'şubat': 1, 'subat': 1, 'mart': 2, 'nisan': 3,
  'mayıs': 4, 'mayis': 4, 'haziran': 5, 'temmuz': 6,
  'ağustos': 7, 'agustos': 7, 'eylül': 8, 'eylul': 8,
  'ekim': 9, 'kasım': 10, 'kasim': 10, 'aralık': 11, 'aralik': 11,
};

// English month names — full and abbreviated
const EN_MONTHS: Record<string, number> = {
  'january': 0, 'jan': 0, 'february': 1, 'feb': 1,
  'march': 2, 'mar': 2, 'april': 3, 'apr': 3,
  'may': 4, 'june': 5, 'jun': 5,
  'july': 6, 'jul': 6, 'august': 7, 'aug': 7,
  'september': 8, 'sep': 8, 'sept': 8,
  'october': 9, 'oct': 9, 'november': 10, 'nov': 10,
  'december': 11, 'dec': 11,
};

// Indonesian month names — full and abbreviated
const ID_MONTHS: Record<string, number> = {
  'januari': 0, 'februari': 1, 'maret': 2, 'april': 3,
  'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7,
  'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
  // Abbreviated
  'feb': 1, 'mar': 2, 'apr': 3,
  'jun': 5, 'jul': 6, 'ags': 7, 'agt': 7,
  'sep': 8, 'okt': 9, 'nov': 10, 'des': 11,
};

// Russian month names — genitive (used in dates) and nominative forms
const RU_MONTHS: Record<string, number> = {
  // Genitive (в датах: "1 января")
  'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3,
  'мая': 4, 'июня': 5, 'июля': 6, 'августа': 7,
  'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11,
  // Nominative
  'январь': 0, 'февраль': 1, 'март': 2, 'апрель': 3,
  'май': 4, 'июнь': 5, 'июль': 6, 'август': 7,
  'сентябрь': 8, 'октябрь': 9, 'ноябрь': 10, 'декабрь': 11,
};

// Spanish month names — full and abbreviated (for MX market)
const ES_MONTHS: Record<string, number> = {
  'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
  'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
  'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11,
  // Abbreviated
  'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3,
  'may': 4, 'jun': 5, 'jul': 6, 'ago': 7,
  'sep': 8, 'sept': 8, 'oct': 9, 'nov': 10, 'dic': 11,
};

// Thai month names — full and abbreviated
const TH_MONTHS: Record<string, number> = {
  // Full names
  'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2, 'เมษายน': 3,
  'พฤษภาคม': 4, 'มิถุนายน': 5, 'กรกฎาคม': 6, 'สิงหาคม': 7,
  'กันยายน': 8, 'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11,
  // Abbreviated
  'ม.ค.': 0, 'ก.พ.': 1, 'มี.ค.': 2, 'เม.ย.': 3,
  'พ.ค.': 4, 'มิ.ย.': 5, 'ก.ค.': 6, 'ส.ค.': 7,
  'ก.ย.': 8, 'ต.ค.': 9, 'พ.ย.': 10, 'ธ.ค.': 11,
};

// French month names — full and abbreviated
const FR_MONTHS: Record<string, number> = {
  'janvier': 0, 'février': 1, 'fevrier': 1, 'mars': 2, 'avril': 3,
  'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7, 'aout': 7,
  'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11, 'decembre': 11,
  // Abbreviated
  'janv': 0, 'févr': 1, 'fevr': 1, 'avr': 3,
  'juil': 6, 'sept': 8, 'oct': 9, 'nov': 10, 'déc': 11, 'dec': 11,
};

// Italian month names — full and abbreviated
const IT_MONTHS: Record<string, number> = {
  'gennaio': 0, 'febbraio': 1, 'marzo': 2, 'aprile': 3,
  'maggio': 4, 'giugno': 5, 'luglio': 6, 'agosto': 7,
  'settembre': 8, 'ottobre': 9, 'novembre': 10, 'dicembre': 11,
  // Abbreviated
  'gen': 0, 'feb': 1, 'mar': 2, 'apr': 3,
  'mag': 4, 'giu': 5, 'lug': 6, 'ago': 7,
  'set': 8, 'ott': 9, 'dic': 11,
};

// Portuguese month names — full and abbreviated (for BR market)
const PT_MONTHS: Record<string, number> = {
  'janeiro': 0, 'fevereiro': 1, 'março': 2, 'marco': 2, 'abril': 3,
  'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
  'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11,
  // Abbreviated
  'fev': 1, 'abr': 3, 'mai': 4,
  'jun': 5, 'jul': 6, 'ago': 7,
  'set': 8, 'out': 9, 'dez': 11,
};

// Arabic month names — Gregorian calendar with Arabic names
const AR_MONTHS: Record<string, number> = {
  'يناير': 0, 'فبراير': 1, 'مارس': 2, 'أبريل': 3,
  'مايو': 4, 'يونيو': 5, 'يوليو': 6, 'أغسطس': 7,
  'سبتمبر': 8, 'أكتوبر': 9, 'نوفمبر': 10, 'ديسمبر': 11,
  // Alternative spellings
  'كانون الثاني': 0, 'شباط': 1, 'آذار': 2, 'نيسان': 3,
  'أيار': 4, 'حزيران': 5, 'تموز': 6, 'آب': 7,
  'أيلول': 8, 'تشرين الأول': 9, 'تشرين الثاني': 10, 'كانون الأول': 11,
};

// Korean month names — numeric + suffix pattern
const KO_MONTHS: Record<string, number> = {
  '1월': 0, '2월': 1, '3월': 2, '4월': 3,
  '5월': 4, '6월': 5, '7월': 6, '8월': 7,
  '9월': 8, '10월': 9, '11월': 10, '12월': 11,
};

// Vietnamese month names — full and abbreviated
const VI_MONTHS: Record<string, number> = {
  'tháng một': 0, 'tháng hai': 1, 'tháng ba': 2, 'tháng tư': 3,
  'tháng năm': 4, 'tháng sáu': 5, 'tháng bảy': 6, 'tháng tám': 7,
  'tháng chín': 8, 'tháng mười': 9, 'tháng mười một': 10, 'tháng mười hai': 11,
  'thg 1': 0, 'thg 2': 1, 'thg 3': 2, 'thg 4': 3, 'thg 5': 4, 'thg 6': 5,
  'thg 7': 6, 'thg 8': 7, 'thg 9': 8, 'thg 10': 9, 'thg 11': 10, 'thg 12': 11,
};

// Polish month names — nominative, abbreviated, and genitive forms
const PL_MONTHS: Record<string, number> = {
  'styczeń': 0, 'luty': 1, 'marzec': 2, 'kwiecień': 3, 'maj': 4, 'czerwiec': 5,
  'lipiec': 6, 'sierpień': 7, 'wrzesień': 8, 'październik': 9, 'listopad': 10, 'grudzień': 11,
  'sty': 0, 'lut': 1, 'mar': 2, 'kwi': 3, 'cze': 5, 'lip': 6, 'sie': 7, 'wrz': 8, 'paź': 9, 'lis': 10, 'gru': 11,
  'stycznia': 0, 'lutego': 1, 'marca': 2, 'kwietnia': 3, 'maja': 4, 'czerwca': 5,
  'lipca': 6, 'sierpnia': 7, 'września': 8, 'października': 9, 'listopada': 10, 'grudnia': 11,
};

// Malay month names — full and abbreviated
const MS_MONTHS: Record<string, number> = {
  'januari': 0, 'februari': 1, 'mac': 2, 'april': 3, 'mei': 4, 'jun': 5,
  'julai': 6, 'ogos': 7, 'september': 8, 'oktober': 9, 'november': 10, 'disember': 11,
  'jan': 0, 'feb': 1, 'apr': 3, 'jul': 6, 'ogo': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dis': 11,
};

// Dutch month names — full and abbreviated
const NL_MONTHS: Record<string, number> = {
  'januari': 0, 'februari': 1, 'maart': 2, 'april': 3, 'mei': 4, 'juni': 5,
  'juli': 6, 'augustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11,
  'jan': 0, 'feb': 1, 'mrt': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11,
};

// Urdu month names — Gregorian calendar with Urdu names
const UR_MONTHS: Record<string, number> = {
  'جنوری': 0, 'فروری': 1, 'مارچ': 2, 'اپریل': 3, 'مئی': 4, 'جون': 5,
  'جولائی': 6, 'اگست': 7, 'ستمبر': 8, 'اکتوبر': 9, 'نومبر': 10, 'دسمبر': 11,
};

// Swedish month names — full and abbreviated
const SV_MONTHS: Record<string, number> = {
  'januari': 0, 'februari': 1, 'mars': 2, 'april': 3, 'maj': 4, 'juni': 5,
  'juli': 6, 'augusti': 7, 'september': 8, 'oktober': 9, 'november': 10, 'december': 11,
  'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'dec': 11,
};

// Combined month lookup for universal parsing
const ALL_MONTHS: Record<string, number> = {
  ...TR_MONTHS, ...EN_MONTHS,
  ...ID_MONTHS, ...RU_MONTHS, ...ES_MONTHS, ...TH_MONTHS,
  ...FR_MONTHS, ...IT_MONTHS, ...PT_MONTHS,
  ...AR_MONTHS, ...KO_MONTHS,
  ...VI_MONTHS, ...PL_MONTHS, ...MS_MONTHS, ...NL_MONTHS, ...UR_MONTHS, ...SV_MONTHS,
};

/**
 * Master date extraction — tries multiple sources in priority order.
 */
export function extractDates($: cheerio.CheerioAPI): ExtractedDates {
  return extractDatesFromJsonLd($)
    ?? extractDatesFromMeta($)
    ?? extractDatesFromTimeElements($)
    ?? extractDatesFromHtmlText($)
    ?? EMPTY;
}

/**
 * Extract dates from plain text content (for RSS descriptions etc.)
 */
export function extractDatesFromText(text: string): ExtractedDates {
  if (!text) return EMPTY;
  return parseDateRange(text) ?? EMPTY;
}

// ─── 1. JSON-LD (Schema.org) ─────────────────────────────

function extractDatesFromJsonLd($: cheerio.CheerioAPI): ExtractedDates | null {
  const scripts = $('script[type="application/ld+json"]');
  if (scripts.length === 0) return null;

  let best: ExtractedDates | null = null;

  scripts.each((_i, el) => {
    if (best) return;
    try {
      const raw = $(el).html();
      if (!raw) return;
      const data = JSON.parse(raw);
      const result = extractFromLdObject(data);
      if (result) best = result;
    } catch { /* invalid JSON */ }
  });

  return best;
}

function extractFromLdObject(data: any): ExtractedDates | null {
  if (!data || typeof data !== 'object') return null;

  // Handle @graph arrays
  if (Array.isArray(data['@graph'])) {
    for (const item of data['@graph']) {
      const result = extractFromLdObject(item);
      if (result) return result;
    }
  }

  // Handle arrays of LD objects
  if (Array.isArray(data)) {
    for (const item of data) {
      const result = extractFromLdObject(item);
      if (result) return result;
    }
  }

  // Offer/Event fields
  const startDate = data.validFrom || data.startDate || data.datePublished || null;
  const endDate = data.validThrough || data.endDate || data.expires || null;

  if (startDate || endDate) {
    return {
      startDate: toISOString(startDate),
      endDate: toISOString(endDate),
    };
  }

  // Check nested offers
  if (data.offers) {
    const offers = Array.isArray(data.offers) ? data.offers[0] : data.offers;
    const offerStart = offers?.validFrom || offers?.availabilityStarts || null;
    const offerEnd = offers?.validThrough || offers?.availabilityEnds || null;
    if (offerStart || offerEnd) {
      return {
        startDate: toISOString(offerStart),
        endDate: toISOString(offerEnd),
      };
    }
  }

  return null;
}

// ─── 2. Meta Tags ─────────────────────────────────────────

function extractDatesFromMeta($: cheerio.CheerioAPI): ExtractedDates | null {
  const published =
    $('meta[property="article:published_time"]').attr('content') ||
    $('meta[name="date"]').attr('content') ||
    $('meta[name="DC.date"]').attr('content') ||
    $('meta[name="dcterms.date"]').attr('content') ||
    $('meta[name="parsely-pub-date"]').attr('content') ||
    $('meta[property="og:updated_time"]').attr('content') ||
    null;

  const expiration =
    $('meta[property="article:expiration_time"]').attr('content') ||
    $('meta[name="dcterms.valid"]').attr('content') ||
    null;

  if (!published && !expiration) return null;

  return {
    startDate: toISOString(published),
    endDate: toISOString(expiration),
  };
}

// ─── 3. <time> Elements ──────────────────────────────────

function extractDatesFromTimeElements($: cheerio.CheerioAPI): ExtractedDates | null {
  const timeEls = $('time[datetime]');
  if (timeEls.length === 0) return null;

  const dates: string[] = [];
  timeEls.each((_i, el) => {
    const dt = $(el).attr('datetime');
    if (dt) {
      const iso = toISOString(dt);
      if (iso) dates.push(iso);
    }
  });

  if (dates.length === 0) return null;

  // Sort chronologically
  dates.sort();

  return {
    startDate: dates[0] || null,
    endDate: dates.length > 1 ? dates[dates.length - 1] : null,
  };
}

// ─── 4. Text Patterns (Turkish + English) ────────────────

function extractDatesFromHtmlText($: cheerio.CheerioAPI): ExtractedDates | null {
  // Priority 1: Elements with date-related classes/attributes
  const dateSelectors = [
    '[class*="date"]', '[class*="tarih"]', '[class*="valid"]',
    '[class*="period"]', '[class*="sure"]', '[class*="süre"]',
    '[class*="expir"]', '[class*="ends"]', '[class*="deadline"]',
    '[data-date]', '[data-tarih]',
  ];

  for (const sel of dateSelectors) {
    const els = $(sel);
    if (els.length === 0) continue;
    const text = els.first().text().trim();
    const result = parseDateRange(text);
    if (result) return result;
  }

  // Priority 2: Text near date keywords (multi-language)
  const dateKeywords = [
    // Turkish
    'kampanya tarihi', 'geçerlilik', 'gecerlilik',
    'bitiş tarihi', 'bitis tarihi', 'son tarih',
    'başlangıç tarihi', 'baslangic tarihi',
    'tarihine kadar', 'tarihinden itibaren',
    'tarihleri arasında', 'tarihleri arasinda',
    'tarihleri arası', 'tarihleri arasi',
    'süre', 'sure', 'geçerli', 'gecerli',
    // English
    'valid through', 'valid until', 'valid thru',
    'expires', 'expiration', 'ends on', 'ending',
    'sale ends', 'deal ends', 'offer ends',
    'effective date', 'promotion period',
    'available through', 'available until',
    'limited time', 'while supplies last',
    // Indonesian
    'berlaku hingga', 'berlaku sampai', 'berlaku s/d',
    'periode promo', 'tanggal berakhir', 'sampai dengan',
    'masa berlaku', 'berakhir pada',
    // Russian
    'действует до', 'срок действия', 'акция действует',
    'действует с', 'до конца', 'окончание акции',
    'срок акции', 'акция заканчивается',
    // Spanish (MX)
    'válido hasta', 'valido hasta', 'vigente hasta',
    'fecha de vencimiento', 'promoción válida',
    'vigencia', 'termina el', 'finaliza el',
    // Japanese
    '期間', '開催期間', 'セール期間', 'キャンペーン期間',
    '終了日', '開始日', 'まで', 'から',
    // Thai
    'ระยะเวลา', 'สิ้นสุด', 'เริ่มต้น', 'ถึงวันที่',
    'โปรโมชั่นนี้', 'ตั้งแต่วันที่',
    // Portuguese (BR)
    'válido até', 'valido ate', 'vigente até', 'vigente ate',
    'promoção válida', 'promocao valida',
    'termina em', 'encerra em', 'vigência', 'vigencia',
    'data de término', 'data de termino',
    'período da promoção', 'periodo da promocao',
    // French
    'valide jusqu', 'valable jusqu', 'offre valable',
    'date de fin', 'se termine le', 'expire le',
    'promotion valable', 'du...au', 'jusqu\'au',
    // Italian
    'valido fino al', 'offerta valida', 'scade il',
    'data di scadenza', 'promozione valida',
    'dal...al', 'fino al',
    // Arabic
    'صالح حتى', 'ينتهي في', 'آخر موعد', 'مدة العرض', 'خلال فترة',
    'يسري حتى', 'ساري حتى', 'صلاحية', 'فترة العرض',
    // Korean
    '유효기간', '이벤트 기간', '적용 기간', '세일 기간',
    '종료일', '시작일', '까지', '부터',
  ];

  const bodyText = $('body').text();
  for (const keyword of dateKeywords) {
    const idx = bodyText.toLowerCase().indexOf(keyword);
    if (idx === -1) continue;
    const windowStart = Math.max(0, idx - 150);
    const window = bodyText.substring(windowStart, idx + 200);
    const result = parseDateRange(window);
    if (result) return result;
  }

  return null;
}

// ─── Date Parsing Utilities ───────────────────────────────

/**
 * Parse Turkish date range strings. Handles many formats:
 * - "1 Şubat 2026 - 28 Şubat 2026"
 * - "10 Ocak - 15 Şubat 2026"
 * - "01.02.2026 - 28.02.2026"
 * - "01/02/2026 - 28/02/2026"
 * - "Kampanya Tarihi: 1 Şubat - 28 Şubat 2026"
 * - "Son Gün: 28 Şubat 2026"
 * - "... tarihine kadar geçerlidir"
 */
// All month names as regex alternation (for compact range detection)
const ALL_MONTH_ALTS = Object.keys(ALL_MONTHS).join('|');

export function parseDateRange(text: string): ExtractedDates | null {
  if (!text || text.length < 5) return null;

  // Early check: compact range "1-31 Mart 2026" / "March 1-31, 2026" (day-day Month Year)
  // TR format: "1-31 Mart 2026"
  const compactRangeRe = new RegExp(
    `(?<!\\d)(\\d{1,2})\\s*[-–—]\\s*(\\d{1,2})\\s+(${ALL_MONTH_ALTS})\\s+(\\d{4})`,
    'i',
  );
  const compactMatch = text.match(compactRangeRe);
  if (compactMatch) {
    const dayStart = parseInt(compactMatch[1], 10);
    const dayEnd = parseInt(compactMatch[2], 10);
    const month = ALL_MONTHS[compactMatch[3].toLowerCase()];
    const year = parseInt(compactMatch[4], 10);
    if (month !== undefined && dayStart >= 1 && dayStart <= 31 && dayEnd >= 1 && dayEnd <= 31) {
      return {
        startDate: new Date(year, month, dayStart).toISOString(),
        endDate: new Date(year, month, dayEnd).toISOString(),
      };
    }
  }

  // EN format: "March 1-31, 2026" (Month day-day, year)
  const enCompactRangeRe = new RegExp(
    `(${ALL_MONTH_ALTS})\\s+(\\d{1,2})\\s*[-–—]\\s*(\\d{1,2}),?\\s*(\\d{4})`,
    'i',
  );
  const enCompactMatch = text.match(enCompactRangeRe);
  if (enCompactMatch) {
    const month = ALL_MONTHS[enCompactMatch[1].toLowerCase()];
    const dayStart = parseInt(enCompactMatch[2], 10);
    const dayEnd = parseInt(enCompactMatch[3], 10);
    const year = parseInt(enCompactMatch[4], 10);
    if (month !== undefined && dayStart >= 1 && dayStart <= 31 && dayEnd >= 1 && dayEnd <= 31) {
      return {
        startDate: new Date(year, month, dayStart).toISOString(),
        endDate: new Date(year, month, dayEnd).toISOString(),
      };
    }
  }

  // Japanese date range: "2026年3月1日〜3月31日" / "3月1日～3月15日"
  const jaRangeMatch = text.match(
    /(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日\s*[〜～~\-–—]\s*(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日/,
  );
  if (jaRangeMatch) {
    const yearStart = jaRangeMatch[1] ? parseInt(jaRangeMatch[1], 10) : (jaRangeMatch[4] ? parseInt(jaRangeMatch[4], 10) : new Date().getFullYear());
    const monthStart = parseInt(jaRangeMatch[2], 10) - 1;
    const dayStart = parseInt(jaRangeMatch[3], 10);
    const yearEnd = jaRangeMatch[4] ? parseInt(jaRangeMatch[4], 10) : yearStart;
    const monthEnd = parseInt(jaRangeMatch[5], 10) - 1;
    const dayEnd = parseInt(jaRangeMatch[6], 10);
    if (monthStart >= 0 && monthStart <= 11 && monthEnd >= 0 && monthEnd <= 11 &&
        dayStart >= 1 && dayStart <= 31 && dayEnd >= 1 && dayEnd <= 31) {
      return {
        startDate: new Date(yearStart, monthStart, dayStart).toISOString(),
        endDate: new Date(yearEnd, monthEnd, dayEnd).toISOString(),
      };
    }
  }

  // Clean common prefixes (Turkish + English + multi-language)
  let cleaned = text
    .replace(/kampanya\s*tarihi\s*:?\s*/i, '')
    .replace(/geçerlilik\s*(?:tarihi)?\s*:?\s*/i, '')
    .replace(/gecerlilik\s*(?:tarihi)?\s*:?\s*/i, '')
    .replace(/süre\s*:?\s*/i, '')
    .replace(/sure\s*:?\s*/i, '')
    .replace(/valid\s*(?:through|until|thru)\s*:?\s*/i, '')
    .replace(/expires?\s*:?\s*/i, '')
    .replace(/(?:sale|deal|offer)\s*ends?\s*:?\s*/i, '')
    .replace(/promotion\s*period\s*:?\s*/i, '')
    .replace(/effective\s*(?:date)?\s*:?\s*/i, '')
    // Indonesian
    .replace(/berlaku\s*(?:hingga|sampai|s\/d)\s*:?\s*/i, '')
    .replace(/periode\s*(?:promo)?\s*:?\s*/i, '')
    // Russian
    .replace(/(?:действует|срок)\s*(?:до|по|с)?\s*:?\s*/i, '')
    .replace(/акция\s*(?:действует)?\s*:?\s*/i, '')
    // Spanish
    .replace(/(?:vigente|válido|valido)\s*(?:hasta|desde)?\s*:?\s*/i, '')
    .replace(/(?:promoción|promocion)\s*(?:vigente)?\s*:?\s*/i, '')
    // Japanese
    .replace(/(?:期間|開催期間|セール期間)\s*[:：]?\s*/i, '')
    // Thai
    .replace(/(?:ระยะเวลา|โปรโมชั่น)\s*[:：]?\s*/i, '')
    // Portuguese (BR)
    .replace(/(?:válido|valido|vigente)\s*(?:até|ate)?\s*:?\s*/i, '')
    .replace(/(?:promoção|promocao)\s*(?:válida|valida)?\s*:?\s*/i, '')
    .replace(/(?:termina|encerra)\s*(?:em)?\s*:?\s*/i, '')
    .replace(/(?:vigência|vigencia|período|periodo)\s*:?\s*/i, '')
    // French
    .replace(/(?:valide|valable)\s*(?:jusqu'?\s*au|du)?\s*:?\s*/i, '')
    .replace(/(?:offre|promotion)\s*(?:valable)?\s*:?\s*/i, '')
    .replace(/expire\s*(?:le)?\s*:?\s*/i, '')
    // Italian
    .replace(/(?:valido|valida)\s*(?:fino\s*al|dal)?\s*:?\s*/i, '')
    .replace(/(?:offerta|promozione)\s*(?:valida)?\s*:?\s*/i, '')
    .replace(/scade\s*(?:il)?\s*:?\s*/i, '')
    .trim();

  // Try range split (dash, "to", "ile", "through", "до", "hasta", "sampai", "au", "al", "〜", "～", "まで")
  const rangeParts = cleaned.split(/\s*[-–—〜～~]\s*|\s+ile\s+|\s+to\s+|\s+through\s+|\s+до\s+|\s+hasta\s+|\s+sampai\s+|\s+au\s+|\s+al\s+|\s+até\s+|\s+ate\s+|\s+إلى\s+|\s+حتى\s+|\s+까지\s+/);

  if (rangeParts.length >= 2) {
    let start = parseOneDate(rangeParts[0]);
    const end = parseOneDate(rangeParts[rangeParts.length - 1]);

    // Compact range: first part is bare day number → inherit month/year from end
    if (!start && end && /^\s*\d{1,2}\s*$/.test(rangeParts[0])) {
      const day = parseInt(rangeParts[0].trim(), 10);
      if (day >= 1 && day <= 31) {
        const endD = new Date(end);
        start = new Date(endD.getFullYear(), endD.getMonth(), day).toISOString();
      }
    }

    if (start && end) {
      return { startDate: start, endDate: end };
    }
    if (end) {
      return { startDate: null, endDate: end };
    }
    if (start) {
      return { startDate: start, endDate: null };
    }
  }

  // Check for "tarihine kadar" pattern (end date only — Turkish)
  const kadarMatch = cleaned.match(/(.+?)\s*tarihine\s*kadar/i);
  if (kadarMatch) {
    const end = parseOneDate(kadarMatch[1]);
    if (end) return { startDate: null, endDate: end };
  }

  // Check for "Son Gün/Tarih: ..." pattern (Turkish)
  const sonGunMatch = cleaned.match(/son\s*(?:gün|gun|tarih)\s*:?\s*(.+)/i);
  if (sonGunMatch) {
    const end = parseOneDate(sonGunMatch[1]);
    if (end) return { startDate: null, endDate: end };
  }

  // Check for "Bitiş: ..." pattern (Turkish)
  const bitisMatch = cleaned.match(/bitiş?\s*(?:tarihi)?\s*:?\s*(.+)/i);
  if (bitisMatch) {
    const end = parseOneDate(bitisMatch[1]);
    if (end) return { startDate: null, endDate: end };
  }

  // Check for "ends on ..." / "ends ..." pattern (English)
  const endsMatch = cleaned.match(/ends?\s*(?:on)?\s*:?\s*(.+)/i);
  if (endsMatch) {
    const end = parseOneDate(endsMatch[1]);
    if (end) return { startDate: null, endDate: end };
  }

  // Single date
  const single = parseOneDate(cleaned);
  if (single) return { startDate: single, endDate: null };

  return null;
}

/**
 * Parse a single date string in various formats (TR + EN).
 */
function parseOneDate(text: string): string | null {
  if (!text) return null;
  const s = text.trim();

  // Format: "1 Şubat 2026" / "1 February 2026" / "1 Feb" (day Month [year])
  const dayMonthMatch = s.match(/(\d{1,2})\s+(\S+)\s*(\d{4})?/i);
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const monthName = dayMonthMatch[2].toLowerCase().replace(/[.,]$/, '');
    const month = ALL_MONTHS[monthName];
    if (month !== undefined) {
      const year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3], 10) : new Date().getFullYear();
      return new Date(year, month, day).toISOString();
    }
  }

  // Format: "February 1, 2026" / "Feb 1, 2026" / "March 15 2026" (Month day[,] year — US English)
  const monthDayMatch = s.match(/(\S+)\s+(\d{1,2}),?\s*(\d{4})?/i);
  if (monthDayMatch) {
    const monthName = monthDayMatch[1].toLowerCase().replace(/[.,]$/, '');
    const month = ALL_MONTHS[monthName];
    if (month !== undefined) {
      const day = parseInt(monthDayMatch[2], 10);
      const year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : new Date().getFullYear();
      if (day >= 1 && day <= 31) {
        return new Date(year, month, day).toISOString();
      }
    }
  }

  // Format: "2026年3月15日" / "3月15日" (Japanese: [year年]month月day日)
  const jaFullMatch = s.match(/(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日/);
  if (jaFullMatch) {
    const year = jaFullMatch[1] ? parseInt(jaFullMatch[1], 10) : new Date().getFullYear();
    const month = parseInt(jaFullMatch[2], 10) - 1;
    const day = parseInt(jaFullMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day).toISOString();
    }
  }

  // Format: "01.02.2026" (dd.mm.yyyy — TR/EU)
  const dotMatch = s.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (dotMatch) {
    const day = parseInt(dotMatch[1], 10);
    const month = parseInt(dotMatch[2], 10) - 1;
    const year = parseInt(dotMatch[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day).toISOString();
    }
  }

  // Format: "02/01/2026" — ambiguous! Use context:
  // If first number > 12 → dd/mm/yyyy (TR/EU)
  // If second number > 12 → mm/dd/yyyy (US)
  // Otherwise default to mm/dd/yyyy for US compat (more common in deal sites)
  const slashMatch = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    const a = parseInt(slashMatch[1], 10);
    const b = parseInt(slashMatch[2], 10);
    const year = parseInt(slashMatch[3], 10);
    let day: number, month: number;
    if (a > 12) {
      // Must be dd/mm/yyyy
      day = a; month = b - 1;
    } else if (b > 12) {
      // Must be mm/dd/yyyy
      month = a - 1; day = b;
    } else {
      // Ambiguous — default mm/dd/yyyy (US convention for deal sites)
      month = a - 1; day = b;
    }
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day).toISOString();
    }
  }

  // Format: "2026-02-01" (ISO yyyy-mm-dd)
  const isoMatch = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  return null;
}

/**
 * Try to convert any date-like string to ISO string.
 */
function toISOString(val: any): string | null {
  if (!val) return null;
  const str = String(val).trim();
  if (!str) return null;

  // Already ISO or parseable by Date constructor
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString();

  // Try our Turkish parser
  return parseOneDate(str);
}
