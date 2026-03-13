import { canonicalizeUrl } from '@kampanya/shared';
import { optimizeImageUrls } from './optimize-images';

export interface RawCampaignData {
  title: string;
  description?: string;
  sourceUrl: string;
  imageUrls?: string[];
  startDate?: string;
  endDate?: string;
  discountRate?: number;
  promoCode?: string;
}

export interface NormalizedCampaign {
  title: string;
  description: string | null;
  sourceUrl: string;
  canonicalUrl: string;
  imageUrls: string[];
  startDate: Date | null;
  endDate: Date | null;
  discountRate: number | null;
  promoCode: string | null;
}

// UUID pattern: 8-4-4-4-12 hex chars (with or without dashes)
const UUID_PATTERN = /[A-F0-9]{8}-?[A-F0-9]{4}-?[A-F0-9]{4}-?[A-F0-9]{4}-?[A-F0-9]{12,}/gi;

// Long hex strings (8+ hex chars, possibly with dashes between)
const HEX_GARBAGE_PATTERN = /[A-Fa-f0-9]{8,}(?:-[A-Fa-f0-9]{2,}){2,}/g;

// Short hex segments with dashes (e.g., DC00-4049-891A from Altınyıldız)
const SHORT_HEX_DASH_PATTERN = /-?[A-Fa-f0-9]{4}(?:-[A-Fa-f0-9]{4}){2,}/g;

// Short hex garbage that follows brand names directly (e.g., "ClassicsC3239...")
const INLINE_HEX_PATTERN = /(?<=[a-zışğüöç])[A-F][A-F0-9]{6,}[A-F0-9\-]*/gi;

// Known garbage suffixes that appear after brand names
const GARBAGE_SUFFIX_PATTERNS = [
  /Anasayfa\s*Plan\s*de\s*travail\s*\d*/gi,   // Bioderma SVG artifact
  /[A-Za-z]*-?key[A-Za-z0-9-]*/gi,             // Altınyıldız key artifacts (door-key, Boor-key, etc.)
  /-{2,}[A-Z]$/g,                               // Trailing "--B" remnants
  /#\s*site-main\s*$/i,
  /#\s*mobile-menu[A-Za-z0-9-]*/i,
  /#\s*main-content\s*$/i,
  /#\s*main\s*$/i,
  /#\s*skippedLink\s*$/i,
];

// Common brand suffix patterns in titles: "... | Brand Name", "... - Brand Name"
const BRAND_SUFFIX_PATTERN = /\s*[|–—-]\s*(Audi|BMW|BYD|Allianz|Arçelik|Beko|LCW|BIODERMA|Bauhaus|Altınyıldız|Altinyildiz)\s*(Classics|Türkiye|Turkey|Sigorta|\.com\.tr)?\s*$/i;

// Navigation/UI junk that gets concatenated into titles from SPA sites
const NAV_JUNK_KEYWORDS = [
  'Facebook', 'Instagram', 'TikTok', 'YouTube', 'Twitter', 'Pinterest', 'LinkedIn', 'Snapchat',
  'Gear Card', 'Gift Card', 'Mobile', 'Phone', 'Account', 'Rewards', 'Help', 'Contact Us',
  'Cart', 'Sign In', 'Sign Up', 'Log In', 'Register', 'My Account', 'Wishlist',
  'Back to Top', 'Skip to Content', 'Skip to Main', 'Menu', 'Search', 'Close',
  'titleBack', 'titleBack to Top',
];
// Build regex that matches any of these keywords concatenated at end of title
const NAV_JUNK_PATTERN = new RegExp(
  `(?:${NAV_JUNK_KEYWORDS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})+\\s*$`,
  'i',
);

// Garbage description values
const GARBAGE_DESCRIPTIONS = [
  'default description',
  'bu sitede çerez kullanıyoruz',
  'bu sitede cerez kullaniyoruz',
  'we use cookies',
  'cookie policy',
  'çerez politikası',
  'cerez politikasi',
];

// False positive discount contexts: these contain % but are NOT discounts
const FALSE_DISCOUNT_PATTERNS = [
  // Material/fabric composition (e.g., %100 Pamuklu, %95 Polyester)
  /%\s*\d+\s*(pamuk|cotton|polyester|elastan|viskon|viscose|keten|linen|yün|wool|ipek|silk|naylon|nylon|akrilik|acrylic|sentetik|lycra|rayon|baumwolle|wolle|seide|leinen)/i,
  /yüzde\s*\d+\s*(pamuk|polyester|elastan|viskon|keten|ipek|naylon|akrilik|sentetik|lycra)/i,
  // German fabric: "100% Baumwolle", "95% Polyester"
  /\d+\s*%\s*(baumwolle|wolle|seide|leinen|polyester|elastan|viskose|nylon|acryl|synthetik|lycra)/i,
  // Portuguese fabric: "100% algodão", "95% poliéster"
  /\d+\s*%\s*(algod[ãa]o|poli[ée]ster|elastano|viscose|linho|seda|l[ãa]|nylon|acr[ií]lico|lycra)/i,
  /%\s*\d+\s*(algod[ãa]o|poli[ée]ster|elastano|viscose|linho|seda|l[ãa]|nylon|acr[ií]lico|lycra)/i,
  // French fabric: "100% coton", "95% soie"
  /\d+\s*%\s*(coton|soie|lin|laine|polyester|viscose|nylon|acrylique|lycra|élasthanne|elasthanne)/i,
  // Italian fabric: "100% cotone", "95% seta"
  /\d+\s*%\s*(cotone|seta|lana|lino|poliestere|viscosa|nylon|acrilico|lycra|elastan)/i,
  // Spanish fabric: "100% algodón", "95% seda"
  /\d+\s*%\s*(algod[oó]n|seda|lana|lino|poli[eé]ster|viscosa|nylon|acr[ií]lico|lycra|elastano)/i,
  // Russian fabric: "100% хлопок"
  /\d+\s*%\s*(хлопок|шёлк|шелк|шерсть|лён|лен|полиэстер|вискоза|нейлон|акрил|лайкра)/i,
  // Indonesian fabric: "100% katun"
  /\d+\s*%\s*(katun|sutra|wol|linen|poliester|nilon|akrilik|lycra)/i,
  // Arabic fabric: "100% قطن" (cotton), "95% بوليستر" (polyester)
  /\d+\s*%\s*(قطن|حرير|صوف|كتان|بوليستر|نايلون|اكريليك|لايكرا|فيسكوز)/i,
  // Korean fabric: "100% 면" (cotton), "95% 폴리에스터"
  /\d+\s*%\s*(면|실크|울|리넨|폴리에스터|나일론|아크릴|레이온|비스코스|라이크라)/i,
  // Non-discount percentage contexts
  /%\s*0\s*faiz/i,          // %0 faiz
  /%\s*0\s*komisyon/i,      // %0 komisyon
  /0\s*%\s*zinsen/i,        // 0% Zinsen (German: 0% interest)
  // Product spec percentages (alcohol, battery, etc.)
  /%\s*\d+\s*(alkol|alcohol|pil|batarya|battery|alkohol)/i,
];

export function normalizeCampaign(raw: RawCampaignData): NormalizedCampaign {
  let title = cleanTitle(stripHtml(raw.title).trim());
  let description = raw.description ? cleanDescription(stripHtml(raw.description).trim()) : null;
  const sourceUrl = cleanUrl(raw.sourceUrl);

  // Extract discount, handling false positives
  // Always check false positives — scrapers may pass through fake discount rates
  // (e.g., "%100 pamuklu" → 100% discount)
  const isFalseDiscount = FALSE_DISCOUNT_PATTERNS.some((p) => p.test(raw.title) || p.test(title));
  let discountRate = isFalseDiscount ? null : (raw.discountRate ?? extractDiscount(raw.title, title));
  // Validate range: realistic discounts are 1-95%
  if (discountRate !== null && discountRate !== undefined && (discountRate < 1 || discountRate > 95)) {
    discountRate = null;
  }

  // Extract promo code: prefer raw (from scraper JSON), then regex from title/description
  const promoCode = validatePromoCode(raw.promoCode) || extractPromoCode(title, description) || null;

  return {
    title,
    description,
    sourceUrl,
    canonicalUrl: canonicalizeUrl(sourceUrl),
    imageUrls: optimizeImageUrls((raw.imageUrls ?? []).filter(Boolean)),
    startDate: parseDate(raw.startDate),
    endDate: parseDate(raw.endDate),
    discountRate,
    promoCode,
  };
}

function stripHtml(html: string): string {
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

/** Clean title: remove UUID garbage, excessive brand suffixes */
function cleanTitle(title: string): string {
  // Remove unicode escape artifacts like \u0027
  title = title.replace(/\\u[0-9a-fA-F]{4}/g, (m) => {
    try {
      return JSON.parse(`"${m}"`);
    } catch {
      return m;
    }
  });

  // Remove UUID-like patterns
  title = title.replace(UUID_PATTERN, '').trim();

  // Remove inline hex that follows brand names directly (e.g., "ClassicsC3239...")
  title = title.replace(INLINE_HEX_PATTERN, '').trim();

  // Remove long hex garbage strings with dashes
  title = title.replace(HEX_GARBAGE_PATTERN, '').trim();

  // Remove short hex-dash segments (e.g., DC00-4049-891A)
  title = title.replace(SHORT_HEX_DASH_PATTERN, '').trim();

  // Remove known garbage suffixes
  for (const pattern of GARBAGE_SUFFIX_PATTERNS) {
    title = title.replace(pattern, '').trim();
  }

  // Clean trailing separators before brand suffix removal (hex cleanup may leave dashes)
  title = title.replace(/[-–—|]+\s*$/, '').trim();

  // Remove common brand suffix like "| Audi Türkiye"
  title = title.replace(BRAND_SUFFIX_PATTERN, '').trim();

  // Remove navigation/UI junk concatenated from SPA sites
  // e.g. "Guitar Deals | Guitar CenterGear CardMobileGift CardPhoneFacebookXYouTube..."
  for (let i = 0; i < 3; i++) {
    title = title.replace(NAV_JUNK_PATTERN, '').trim();
  }

  // Remove "title" prefix artifact from some scrapers (e.g. "titleBack to Top")
  title = title.replace(/\btitle\s*$/i, '').trim();

  // If title still has concatenated junk after pipe, keep only the first meaningful part
  // e.g. "HP Weekly Deals | HP StoreSome random nav text" → "HP Weekly Deals"
  const pipeMatch = title.match(/^(.{10,}?)\s*[|]\s*.{0,30}(?:Card|Mobile|Phone|Facebook|Store|Home|Shop)/i);
  if (pipeMatch) {
    title = pipeMatch[1].trim();
  }

  // Collapse multiple spaces
  title = title.replace(/\s+/g, ' ').trim();

  // Remove trailing | or - with nothing after (or with just whitespace)
  title = title.replace(/\s*[-–—|]+\s*$/, '').trim();

  // Remove leading/trailing quotes if they wrap the whole title
  if ((title.startsWith('"') && title.endsWith('"')) || (title.startsWith("'") && title.endsWith("'"))) {
    title = title.slice(1, -1).trim();
  }
  // Remove mismatched leading/trailing special chars
  if (title.startsWith('"') || title.startsWith('"') || title.startsWith('«')) {
    title = title.slice(1).trim();
  }
  if (title.endsWith('"') || title.endsWith('"') || title.endsWith('»')) {
    title = title.slice(0, -1).trim();
  }

  return title;
}

/** Clean description: remove garbage values */
function cleanDescription(desc: string): string | null {
  if (!desc || desc.length < 5) return null;

  const lower = desc.toLowerCase().trim();
  if (GARBAGE_DESCRIPTIONS.some((g) => lower === g || lower.startsWith(g))) {
    return null;
  }

  // Remove unicode escape artifacts
  desc = desc.replace(/\\u[0-9a-fA-F]{4}/g, (m) => {
    try {
      return JSON.parse(`"${m}"`);
    } catch {
      return m;
    }
  });

  return desc;
}

/** Clean URL: normalize fragments and tracking params */
function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove hash fragments (they don't affect the page)
    parsed.hash = '';
    // Remove common tracking params
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

  // Reject dates that are clearly wrong
  if (year < 2020 || year > now.getFullYear() + 2) return null;

  return d;
}

function extractDiscount(rawTitle: string, cleanedTitle: string): number | null {
  // Check false positive patterns first
  if (FALSE_DISCOUNT_PATTERNS.some((p) => p.test(rawTitle) || p.test(cleanedTitle))) {
    return null;
  }

  const text = `${cleanedTitle} ${rawTitle}`;

  // Pattern: %50, % 50 (Turkish style)
  const match = text.match(/%\s*(\d+)/);
  if (match) {
    const val = parseInt(match[1], 10);
    if (val >= 1 && val <= 95) return val;
  }

  // Pattern: 50%, 50 % (universal)
  const match2 = text.match(/(\d+)\s*%/);
  if (match2) {
    const val = parseInt(match2[1], 10);
    if (val >= 1 && val <= 95) return val;
  }

  // US/EN patterns: "save 30%", "up to 50% off", "30% off"
  const usPercentOff = text.match(/(?:save|up\s*to|get)\s+(\d+)\s*%\s*(?:off|savings?)?/i);
  if (usPercentOff) {
    const val = parseInt(usPercentOff[1], 10);
    if (val >= 1 && val <= 95) return val;
  }

  // US/EN patterns: "X% off", "X% savings"
  const percentOff = text.match(/(\d+)\s*%\s*(?:off|savings?|discount)/i);
  if (percentOff) {
    const val = parseInt(percentOff[1], 10);
    if (val >= 1 && val <= 95) return val;
  }

  // German patterns: "spare 20%", "bis zu 50% sparen", "20% Rabatt", "20% reduziert"
  const deSpare = text.match(/(?:spare?n?|bis\s+zu)\s+(\d+)\s*%/i);
  if (deSpare) {
    const val = parseInt(deSpare[1], 10);
    if (val >= 1 && val <= 95) return val;
  }

  const deRabatt = text.match(/(\d+)\s*%\s*(?:rabatt|reduziert|ermäßigung|ermaessigung|nachlass|günstiger)/i);
  if (deRabatt) {
    const val = parseInt(deRabatt[1], 10);
    if (val >= 1 && val <= 95) return val;
  }

  return null;
}

// --- Promo Code Extraction ---

// Blacklisted words that look like codes but aren't
const CODE_BLACKLIST = new Set([
  'NULL', 'N/A', 'NONE', 'FALSE', 'TRUE', 'YES', 'NO', 'FREE', 'NEW', 'SALE', 'OFF',
  'THE', 'AND', 'FOR', 'NOT', 'WITH', 'THIS', 'THAT', 'FROM', 'YOUR', 'CODE',
  'PROMO', 'COUPON', 'DISCOUNT', 'OFFER', 'DEAL', 'SAVE', 'GET', 'BUY', 'NOW',
  'HERE', 'CLICK', 'APPLY', 'ENTER', 'USE', 'TRY', 'SHOP', 'MORE', 'BEST',
  'HTTP', 'HTTPS', 'HTML', 'JSON', 'JPEG', 'PNG', 'GIF', 'PDF', 'CSS',
  'PRICE', 'SIZE', 'MULTIPLE', 'ALL', 'CATALOG', 'MANUFACTURER', 'FILTER',
  'SORT', 'ORDER', 'VIEW', 'LIST', 'GRID', 'LOAD', 'LOADING', 'SEARCH',
  // Turkish
  'KODU', 'KUPON', 'INDIRIM', 'KAMPANYA', 'FIRSATI', 'FIRSAT',
  // German
  'GUTSCHEIN', 'RABATT', 'AKTION', 'ANGEBOT', 'KOPIERT',
  // French
  'REDUCTION', 'OFFRE', 'SOLDES',
  // Spanish
  'DESCUENTO', 'OFERTA', 'CUPÓN', 'CUPON', 'REBAJAS', 'PROMOCODE', 'PROMOCIONAL',
  // Portuguese
  'CUPOM', 'DESCONTO', 'OFERTA',
  // Italian
  'SCONTO', 'CODICE', 'OFFERTA',
  // Indonesian
  'UNTUK', 'DISKON',
  // Polish
  'WIOSNA', 'RABAT',
  // UI elements & brand names scraped as codes
  'EMAIL', 'PREMIUM', 'SAMSUNG', 'SONY',
]);

// Multi-language keyword patterns that signal a promo code is nearby
const PROMO_KEYWORD_PATTERNS: RegExp[] = [
  // TR
  /(?:indirim\s*)?kod[u]?\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /kupon\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  // EN (US, UK, IN, PH, CA, AU)
  /(?:promo|coupon|discount|voucher)\s*code\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /(?:use|apply|enter|with)\s+(?:the\s+)?(?:code|coupon)\s+["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /code\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  // DE
  /(?:gutschein|rabatt|aktions?)code\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /(?:mit|mit\s+dem)\s+code\s+["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  // FR
  /code\s*(?:promo|de\s*réduction|de\s*reduction)\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /(?:avec|utilisez)\s+(?:le\s+)?code\s+["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  // IT
  /codice\s*(?:sconto|promozionale)?\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /(?:usa|inserisci)\s+(?:il\s+)?codice\s+["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  // PT/BR
  /(?:código|cupom|cupão)\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /(?:use|utilize)\s+o?\s*(?:código|cupom)\s+["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  // ES (ES, MX, AR)
  /(?:código|cupón)\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /(?:usa|utiliza|aplica)\s+(?:el\s+)?(?:código|cupón)\s+["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  // ID
  /(?:kode|voucher)\s*(?:promo)?\s*[:：=]\s*["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  /(?:gunakan|pakai)\s+(?:kode|voucher)\s+["'「]?([A-Z0-9][A-Z0-9_\-]{2,29})["'」]?/i,
  // RU
  /промокод\s*[:：=]\s*["'«]?([A-Z0-9А-ЯЁ][A-Z0-9А-ЯЁ_\-]{2,29})["'»]?/i,
  /(?:используйте|введите)\s+(?:код|промокод)\s+["'«]?([A-Z0-9А-ЯЁ][A-Z0-9А-ЯЁ_\-]{2,29})["'»]?/i,
  // JA
  /(?:クーポンコード|プロモコード|クーポン|コード)\s*[:：=]\s*["'「]?([A-Z0-9]{3,29})["'」]?/i,
  // TH
  /(?:โค้ด|รหัส|คูปอง)\s*[:：=]\s*["'「]?([A-Z0-9]{3,29})["'」]?/i,
  // AR (Arabic)
  /(?:كود|رمز|كوبون)\s*[:：=]\s*["'「]?([A-Z0-9]{3,29})["'」]?/i,
  /(?:استخدم|أدخل)\s+(?:الكود|الرمز)\s+["'「]?([A-Z0-9]{3,29})["'」]?/i,
  // KO
  /(?:코드|쿠폰|프로모\s*코드)\s*[:：=]\s*["'「]?([A-Z0-9]{3,29})["'」]?/i,
];

// Price patterns — currency symbols + digits (e.g. "12,99€", "₹1,149.00", "$29.99")
const PRICE_PATTERNS = [
  /[€$₺£¥₹₽₩฿]/,                // Any currency symbol
  /^\d+[.,]\d{2}$/,               // Pure decimal: 12,99 or 29.99
  /^\d{1,3}([.,]\d{3})+/,         // Thousands-separated: 1.299,99
  /^R\$/i,                         // Brazilian Real
  /^RP\s?\d/i,                     // Indonesian Rupiah
  /^RM\s?\d/i,                     // Malaysian Ringgit
  /^RS\.?\s?\d/i,                  // Pakistani/Indian Rupee
  /^KR\s?\d/i,                     // Scandinavian Krone
  /^SAR\s?\d/i,                    // Saudi Riyal
  /^AED\s?\d/i,                    // UAE Dirham
  /^FROM\s*[\d€$£₺¥₹]/i,         // "from $12.99"
  /^DESDE\s+\d/i,                  // PT/ES "desde 12,99€"
  /^AB\s+\d/i,                     // DE "ab 12,99€"
  /^A\s+PARTIR/i,                  // PT "a partir de..."
];

// CSS/UI artifact patterns scraped from page elements
const CSS_UI_JUNK_PATTERNS = [
  /^QUICK[-_]?FILTER/i,
  /^PRODUCT[-_]?LIST/i,
  /^PRICE[-_]?(ASC|DESC)/i,
  /^SILENT\d+LOADING/i,
  /^INFO[-_]?BLOCK/i,
  /^TEXT[-_]?BLOCK/i,
  /[-_]FILTER$/i,
  /[-_]ORDER$/i,
  /[-_]BLOCK$/i,
  /[-_]SORT$/i,
  /[-_]LOADING$/i,
];

export function validatePromoCode(code?: string): string | null {
  if (!code) return null;
  const cleaned = code.trim().toUpperCase();
  if (cleaned.length < 3 || cleaned.length > 30) return null;
  // Must contain at least one alphanumeric char
  if (!/[A-Z0-9]/.test(cleaned)) return null;
  // No spaces allowed in codes
  if (/\s/.test(cleaned)) return null;
  // Reject if it's a blacklisted word
  if (CODE_BLACKLIST.has(cleaned)) return null;
  // Reject UUID-like patterns
  if (UUID_PATTERN.test(cleaned)) return null;
  // Reject pure hex garbage (8+ hex chars)
  if (/^[A-Fa-f0-9]{8,}$/.test(cleaned)) return null;
  // Reject price patterns (currency symbols + digits)
  if (PRICE_PATTERNS.some(p => p.test(cleaned))) return null;
  // Reject pure numeric values (product IDs, prices without currency symbol)
  if (/^\d+([.,]\d+)*$/.test(cleaned)) return null;
  // Reject comma-separated number lists (product ID lists)
  if (/^\d{4,},\d{4,}/.test(cleaned)) return null;
  // Reject CSS class / UI artifact patterns
  if (CSS_UI_JUNK_PATTERNS.some(p => p.test(cleaned))) return null;
  // Reject SKU-like codes: 2+ consonants + 4+ digits, no vowels (e.g. TB0A41DB, LV047D753G)
  if (/^[A-Z]{2,}\d{4,}/.test(cleaned) && !/[AEIOU]/.test(cleaned.replace(/\d/g, ''))) return null;
  // Reject long random strings (12+ chars, low readability = likely SKU/hash/session ID)
  // Real promo codes are human-readable: SUMMER2026, BLACKFRIDAY, SAVE20
  // Fake ones look random: PLSRQL0F24IYFCH9, M2026021909C2E686, PYAEVXDF19SKCLRSTD
  if (cleaned.length >= 12) {
    const letters = cleaned.replace(/[^A-Z]/g, '');
    const consonants = letters.replace(/[AEIOU]/g, '').length;
    const vowels = letters.length - consonants;
    // If consonant-to-vowel ratio > 4:1 or no vowels at all → random gibberish
    if (letters.length >= 4 && (vowels === 0 || consonants / vowels > 4)) return null;
  }
  return cleaned;
}

export function extractPromoCode(title: string, description: string | null): string | null {
  const text = `${title} ${description || ''}`;

  for (const pattern of PROMO_KEYWORD_PATTERNS) {
    // Reset lastIndex for global-safe patterns
    pattern.lastIndex = 0;
    const match = text.match(pattern);
    if (match && match[1]) {
      const code = validatePromoCode(match[1]);
      if (code) return code;
    }
  }

  return null;
}
