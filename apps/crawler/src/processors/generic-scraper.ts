/**
 * Generic campaign scraper — works without site-specific selectors.
 * Uses HTTP fetch + Cheerio (NO Playwright).
 *
 * Strategy:
 * 1. HTTP fetch seed URL
 * 2. Try to extract campaign cards directly from the page
 * 3. Find campaign/promotion links and visit each one
 * 4. Extract data from meta tags, JSON-LD, and common HTML patterns
 * 5. Extract dates from all available sources
 *
 * If HTML is too sparse (SPA site), returns empty array so the engine
 * can fall back to Playwright.
 */
import * as cheerio from 'cheerio';
import { RawCampaignData, validatePromoCode } from '../pipeline/normalize';
import { CRAWL_DELAY_MS, REQUEST_TIMEOUT_MS, CrawlMarket, getAcceptLanguage } from '../config';
import { pickBestFromSrcset, isLikelyBrandLogo } from '../pipeline/optimize-images';
import { extractDates } from '../utils/date-extractor';
import { getStealthHeaders, randomDelay } from '../utils/stealth';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolve Next.js Image optimization URLs.
 * `/_next/image?url=ENCODED_URL&w=...&q=...` → actual image URL
 * Also handles prefixed paths like `/offers/_next/image?url=...`
 */
function resolveNextImageUrl(src: string, baseUrl: string): string | null {
  if (!src.includes('/_next/image')) return null;
  try {
    const fullUrl = new URL(src, baseUrl);
    const actualUrl = fullUrl.searchParams.get('url');
    if (actualUrl) {
      // url param might be absolute or relative
      return new URL(actualUrl, baseUrl).toString();
    }
  } catch {}
  return null;
}

// ─── __NEXT_DATA__ extraction (Next.js SPA sites) ─────────────

/**
 * Extract campaigns from Next.js __NEXT_DATA__ JSON embedded in the page.
 * Recursively searches the JSON structure for arrays of campaign-like objects.
 */
function extractFromNextData($: cheerio.CheerioAPI, baseUrl: string): RawCampaignData[] {
  const script = $('script#__NEXT_DATA__');
  if (script.length === 0) return [];

  try {
    const json = JSON.parse(script.html() || '');
    const campaigns: RawCampaignData[] = [];
    const seen = new Set<string>();

    findCampaignArrays(json, baseUrl, campaigns, seen, 0);

    if (campaigns.length > 0) {
      console.log(`  [Generic] Extracted ${campaigns.length} campaigns from __NEXT_DATA__`);
    }
    return campaigns;
  } catch {
    return [];
  }
}

/** Property names that indicate a title field */
const TITLE_KEYS = ['title', 'name', 'campaignTitle', 'campaignName', 'offerTitle', 'offerName', 'heading', 'baslik', 'dealTitle', 'promoTitle'];
/** Property names that indicate an image URL field */
const IMAGE_KEYS = ['imageUrl', 'image', 'imgUrl', 'img', 'imageURL', 'imageSrc', 'thumbnail', 'photo', 'coverImage', 'bannerImage', 'pictureUrl', 'campaignImageUrl', 'offerImage', 'offerImageUrl', 'bannerUrl', 'heroImage', 'featuredImage', 'cardImage'];
/** Property names that indicate a campaign URL/slug field */
const URL_KEYS = ['url', 'href', 'slug', 'link', 'path', 'campaignUrl', 'detailUrl', 'pageUrl', 'campaignSlug', 'offerSlug', 'offerUrl', 'dealUrl'];
/** Property names that indicate a description field */
const DESC_KEYS = ['description', 'desc', 'summary', 'subtitle', 'aciklama', 'content'];
/** Property names that indicate a promo/coupon code field */
const CODE_KEYS = ['promoCode', 'promo_code', 'couponCode', 'coupon_code', 'discountCode', 'discount_code', 'voucherCode', 'voucher_code', 'code', 'coupon', 'promocode'];

/**
 * Recursively search a JSON object for arrays of campaign-like objects.
 * A campaign-like object has at least a title and (url or image).
 */
function findCampaignArrays(
  obj: any,
  baseUrl: string,
  results: RawCampaignData[],
  seen: Set<string>,
  depth: number,
): void {
  if (depth > 10 || !obj || typeof obj !== 'object') return;

  if (Array.isArray(obj)) {
    // Check if this array contains campaign-like objects
    const campaignItems = obj.filter(
      (item) => item && typeof item === 'object' && !Array.isArray(item) && hasCampaignShape(item),
    );

    if (campaignItems.length >= 2) {
      for (const item of campaignItems) {
        const campaign = extractCampaignFromJsonObject(item, baseUrl);
        if (campaign && !seen.has(campaign.title)) {
          seen.add(campaign.title);
          results.push(campaign);
        }
      }
      return; // Don't recurse deeper into this array
    }

    // Recurse into array elements
    for (const item of obj) {
      findCampaignArrays(item, baseUrl, results, seen, depth + 1);
    }
  } else {
    // Recurse into object values
    for (const val of Object.values(obj)) {
      if (val && typeof val === 'object') {
        findCampaignArrays(val, baseUrl, results, seen, depth + 1);
      }
    }
  }
}

function hasCampaignShape(obj: Record<string, any>): boolean {
  const keys = Object.keys(obj).map((k) => k.toLowerCase());
  const hasTitle = TITLE_KEYS.some((tk) => keys.includes(tk.toLowerCase()));
  const hasUrl = URL_KEYS.some((uk) => keys.includes(uk.toLowerCase()));
  const hasImage = IMAGE_KEYS.some((ik) => keys.includes(ik.toLowerCase()));
  return hasTitle && (hasUrl || hasImage);
}

function extractCampaignFromJsonObject(obj: Record<string, any>, baseUrl: string): RawCampaignData | null {
  const title = findValue(obj, TITLE_KEYS);
  if (!title || typeof title !== 'string' || title.length < 5 || title.length > 300) return null;

  const urlVal = findValue(obj, URL_KEYS);
  let sourceUrl = baseUrl;
  if (urlVal && typeof urlVal === 'string') {
    try { sourceUrl = new URL(urlVal, baseUrl).toString(); } catch {}
  }

  const imageUrls: string[] = [];
  const imgVal = findValue(obj, IMAGE_KEYS);
  if (imgVal && typeof imgVal === 'string') {
    try {
      const resolved = new URL(imgVal, baseUrl).toString();
      if (!isLikelyBrandLogo(resolved)) imageUrls.push(resolved);
    } catch {}
  }

  const descVal = findValue(obj, DESC_KEYS);
  const description = descVal && typeof descVal === 'string' && descVal.length > 10
    ? descVal.substring(0, 500)
    : undefined;

  const fullText = `${title} ${description || ''}`;
  const discountRate = parseDiscountSafe(fullText);

  // Extract promo code from JSON keys
  const codeVal = findValue(obj, CODE_KEYS);
  const promoCode = codeVal && typeof codeVal === 'string' && codeVal.length >= 3 && codeVal.length <= 30
    ? codeVal.trim().toUpperCase()
    : undefined;

  return { title, description, sourceUrl, imageUrls, discountRate, promoCode };
}

function findValue(obj: Record<string, any>, keys: string[]): any {
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) return obj[key];
  }
  // Case-insensitive fallback
  const lowerMap = new Map(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), v]));
  for (const key of keys) {
    const val = lowerMap.get(key.toLowerCase());
    if (val !== undefined && val !== null) return val;
  }
  return undefined;
}

// Material/fabric composition patterns — NOT discounts
const MATERIAL_PATTERN = /(?:pamuk|cotton|polyester|elastan|viskon|viscose|keten|linen|yün|wool|ipek|silk|naylon|nylon|akrilik|acrylic|sentetik|lycra|rayon|algod[ãa]o|poli[ée]ster|seda|linho|l[ãa]|baumwolle|seide|leinen|wolle|viskose|coton|soie|lin|laine|cotone|seta|lana|katun|sutra|хлопок|шёлк|шерсть|綿|絹)/i;

function parseDiscountSafe(text: string): number | undefined {
  const match = text.match(/%\s*(\d+)/) || text.match(/(\d+)\s*%/);
  if (!match) return undefined;
  const val = parseInt(match[1], 10);
  if (val < 1 || val > 95) return undefined;
  const afterMatch = text.substring(match.index! + match[0].length, match.index! + match[0].length + 30);
  if (MATERIAL_PATTERN.test(afterMatch)) return undefined;
  return val;
}

/**
 * Fetch HTML from a URL using HTTP fetch (no browser).
 * Uses stealth headers (random UA, Sec-Fetch-*, Referer).
 * Single retry on 429 (3s wait).
 */
async function fetchHtml(url: string, market?: CrawlMarket): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: getStealthHeaders(market),
      signal: controller.signal,
      redirect: 'follow',
    });

    // 429 Too Many Requests — single retry after 3s
    if (response.status === 429) {
      clearTimeout(timer);
      await delay(3000);
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), REQUEST_TIMEOUT_MS);
      try {
        const retry = await fetch(url, {
          headers: getStealthHeaders(market),
          signal: controller2.signal,
          redirect: 'follow',
        });
        if (!retry.ok) throw new Error(`HTTP ${retry.status} ${retry.statusText}`);
        return await retry.text();
      } finally {
        clearTimeout(timer2);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

// Campaign-related URL patterns (Turkish + English)
const CAMPAIGN_PATH_PATTERNS = [
  // Turkish (TR)
  /kampanya/i, /indirim/i, /firsat/i, /promosyon/i, /teklif/i,
  // English (US, UK, AU, PH, CA, IN)
  /outlet/i, /sale/i, /deal/i, /offer/i, /promo/i, /special/i,
  /discount/i, /campaign/i, /clearance/i, /coupon/i, /voucher/i,
  /savings/i, /bargain/i, /flash-sale/i, /weekly-ad/i,
  // Portuguese (BR)
  /oferta/i, /promocao/i, /desconto/i, /liquidacao/i, /cupom/i, /queima/i,
  /black-friday/i, /esquenta/i,
  // German (DE)
  /angebot/i, /aktion/i, /rabatt/i, /gutschein/i, /sonderangebot/i,
  /ausverkauf/i, /schn[äa]ppchen/i, /sparpreis/i, /restposten/i,
  // Indian (IN)
  /cashback/i, /combo/i, /emi/i, /exchange/i, /festive/i,
  /diwali/i, /loot/i, /bonanza/i,
  // Indonesian (ID)
  /diskon/i, /penawaran/i, /obral/i, /harbolnas/i, /flash-sale/i,
  /gratis-ongkir/i, /hemat/i,
  // Russian (RU)
  /akts[iy][iy]?/i, /skidki?/i, /rasprodazha/i, /promokod/i,
  /kupon/i, /bonus/i,
  // Spanish (MX)
  /oferta/i, /promocion/i, /descuento/i, /cupon/i, /rebaja/i,
  /liquidacion/i, /hot-sale/i, /buen-fin/i, /ahorro/i,
  // Japanese (JP)
  /tokka/i, /timesale/i, /campaign/i, /bargain/i, /outlet/i,
  // Thai (TH)
  /promotion/i, /flash-sale/i,
  // French (FR, CA)
  /soldes?/i, /remise/i, /destockage/i, /vente-flash/i,
  /bon-plan/i, /bons-plans/i, /code-promo/i, /vente-privee/i, /braderie/i,
  // Italian (IT)
  /offert[ae]/i, /sconti/i, /saldi/i, /svendita/i,
  /codice-sconto/i, /sottocosto/i, /fuori-tutto/i, /volantino/i, /occasioni/i,
];

// Patterns to EXCLUDE (non-campaign pages)
const EXCLUDE_PATTERNS = [
  /login|signin|sign-in|giris/i,
  /register|kayit|signup|sign-up/i,
  /privacy|gizlilik/i,
  /terms|sartlar|kosullar/i,
  /contact|iletisim|kontakt|contatti|contactez/i,
  /about|hakkimizda|hakkinda|a-propos|chi-siamo|uber-uns/i,
  /cart|sepet|warenkorb|panier|carrello/i,
  /checkout|odeme|kasse|caisse|cassa/i,
  /account|hesap|hesabim|konto|compte|conto/i,
  /faq|sss|yardim|help|hilfe|aide|aiuto/i,
  /blog\/\d{4}/i,
  /\.pdf$/i, /\.zip$/i, /\.exe$/i,
  /javascript:|mailto:|tel:/i,
  // Customer service / support / shipping / returns pages
  /musteri[_-]?hizmet|customer[_-]?service|kundenservice|service[_-]?client|servizio[_-]?clienti/i,
  /destek|support|soutien|assistenza|unterst[uü]tzung/i,
  /kargo|shipping|delivery|versand|livraison|spedizione/i,
  /iade|returns?|retoure|retour|reso/i,
  /magaza[_-]?bul|store[_-]?locator|store[_-]?finder|filial/i,
  /kariyer|career|jobs|stelle|emploi|lavora/i,
  /uyelik|membership|abonnement/i,
  /sikca[_-]?sorulan|frequently[_-]?asked/i,
  /kvkk|gdpr|ccpa|dsgvo|lgpd/i,
  /cerez|cookie/i,
  // Portuguese (BR)
  /fale[_-]?conosco|atendimento|ouvidoria|sac/i,
  /politica[_-]?de[_-]?privacidade|termos[_-]?de[_-]?uso/i,
  // German (DE)
  /impressum/i, /datenschutz/i, /\bagb\b/i,
  // Russian (RU)
  /kontakty|o-?kompanii|dostavka|vozvrat|oplatai?/i,
  /politika[_-]?konfidentsialnosti|usloviya/i,
  // Spanish (MX)
  /contacto|acerca[_-]?de|quienes[_-]?somos|aviso[_-]?legal/i,
  /politica[_-]?de[_-]?privacidad|terminos[_-]?y[_-]?condiciones/i,
  /devoluciones|envios|atencion[_-]?al[_-]?cliente/i,
  // Indonesian (ID)
  /hubungi[_-]?kami|tentang[_-]?kami|kebijakan[_-]?privasi|syarat/i,
  /pengiriman|pengembalian|pusat[_-]?bantuan/i,
  // Japanese (JP)
  /お問い合わせ|会社概要|プライバシー|利用規約|配送|返品/i,
  // Thai (TH)
  /ติดต่อ|เกี่ยวกับ|นโยบาย|ข้อกำหนด|จัดส่ง|คืนสินค้า/i,
  // French (FR, CA)
  /mentions[_-]?legales|conditions[_-]?generales|cgv/i,
  /nous[_-]?contacter|qui[_-]?sommes/i,
  // Italian (IT)
  /contattaci|chi[_-]?siamo|condizioni[_-]?generali/i,
  /informativa[_-]?privacy|termini[_-]?e[_-]?condizioni/i,
  // Store locator / branch / hours pages
  /magazalar|subeler|store-?list|our-?stores|nos-?magasins|unsere-?filialen|nostri-?negozi/i,
  /calisma[_-]?saat|opening[_-]?hours?|store[_-]?hours?|[oö]ffnungszeiten|horaires|orari/i,
];

/**
 * Find campaign-related links on a page.
 */
function findCampaignLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const links = new Set<string>();
  const baseHost = new URL(baseUrl).hostname;

  $('a[href]').each((_i, el) => {
    const href = $(el).attr('href');
    if (!href) return;

    try {
      const url = new URL(href, baseUrl);
      if (url.hostname !== baseHost) return;

      const fullUrl = url.toString();
      const path = url.pathname + url.search;

      if (EXCLUDE_PATTERNS.some((p) => p.test(path))) return;

      const text = $(el).text().trim().toLowerCase();
      const isCampaignUrl = CAMPAIGN_PATH_PATTERNS.some((p) => p.test(path));
      const isCampaignText = CAMPAIGN_PATH_PATTERNS.some((p) => p.test(text));

      if (isCampaignUrl || isCampaignText) {
        if (fullUrl.replace(/\/$/, '') !== baseUrl.replace(/\/$/, '')) {
          links.add(fullUrl);
        }
      }
    } catch { /* invalid URL */ }
  });

  return Array.from(links);
}

/**
 * Extract campaign-like cards directly from the page.
 */
function extractCardsFromPage($: cheerio.CheerioAPI, baseUrl: string): RawCampaignData[] {
  const campaigns: RawCampaignData[] = [];

  const cardSelectors = [
    '.campaign-card', '.kampanya-card', '.campaign-item', '.kampanya-item',
    '.promo-card', '.promo-item', '.deal-card', '.deal-item',
    '.offer-card', '.offer-item', '.deal-item',
    '[class*="campaign"]', '[class*="kampanya"]', '[class*="promo"]',
    '[class*="offer"]', '[class*="deal"]',
    '.slider-item', '.banner-item', '.dot-card-content',
    'a[href*="kampanya"]', 'a[href*="campaign"]', 'a[href*="offer"]', 'a[href*="deal"]',
    // Portuguese (BR)
    '[class*="oferta"]', '[class*="promocao"]', '[class*="desconto"]',
    'a[href*="oferta"]', 'a[href*="promocao"]', 'a[href*="desconto"]',
    // German (DE)
    '[class*="angebot"]', '[class*="aktion"]', '[class*="rabatt"]',
    'a[href*="angebot"]', 'a[href*="aktion"]', 'a[href*="rabatt"]', 'a[href*="gutschein"]',
    // Indian (IN)
    '[class*="cashback"]', 'a[href*="cashback"]', 'a[href*="emi"]',
    'a[href*="exchange-offer"]', 'a[href*="festive"]', 'a[href*="loot"]',
    // Indonesian (ID)
    '[class*="diskon"]', '[class*="penawaran"]', 'a[href*="diskon"]', 'a[href*="promo"]',
    // Russian (RU)
    '[class*="akci"]', '[class*="skidka"]', 'a[href*="akci"]', 'a[href*="skidki"]',
    // Spanish (MX)
    'a[href*="oferta"]', 'a[href*="promocion"]', 'a[href*="descuento"]',
    // French (FR, CA)
    '[class*="solde"]', '[class*="promo"]', 'a[href*="solde"]', 'a[href*="bon-plan"]',
    // Italian (IT)
    '[class*="offert"]', '[class*="scont"]', 'a[href*="offert"]', 'a[href*="saldi"]',
    // Japanese (JP)
    'a[href*="campaign"]', 'a[href*="sale"]', 'a[href*="tokka"]',
    'article', '.card',
  ];

  for (const selector of cardSelectors) {
    const cards = $(selector);
    if (cards.length === 0) continue;
    if (cards.length > 50) continue;

    cards.each((_i, el) => {
      // Skip wrapper elements that contain a tab list (not individual cards)
      if ($(el).find('[role="tablist"]').length > 0) return;
      const campaign = extractCampaignFromElement($, el, baseUrl);
      if (campaign) campaigns.push(campaign);
    });

    if (campaigns.length > 0) break;
  }

  // Fallback: tab-based campaign layouts (e.g., ÇiçekSepeti)
  if (campaigns.length === 0) {
    const tabCampaigns = extractTabCampaigns($, baseUrl);
    campaigns.push(...tabCampaigns);
  }

  return campaigns;
}

/**
 * Extract campaigns from tab-based layouts.
 * Some sites (e.g., ÇiçekSepeti) organize campaigns as tabs with
 * role="tab" buttons and role="tabpanel" content sections.
 */
function extractTabCampaigns($: cheerio.CheerioAPI, baseUrl: string): RawCampaignData[] {
  const tabs = $('[role="tablist"] [role="tab"]');
  if (tabs.length === 0 || tabs.length > 30) return [];

  const campaigns: RawCampaignData[] = [];

  tabs.each((_i, tabEl) => {
    const title = $(tabEl).text().trim();
    if (!title || title.length < 2 || title.length > 200) return;
    // Skip generic overflow buttons like "Diğer"
    if (/^di[gğ]er$/i.test(title)) return;

    // Find the associated panel via aria-controls
    const panelId = $(tabEl).attr('aria-controls');
    let description: string | undefined;
    if (panelId) {
      const panel = $(`#${panelId}`);
      if (panel.length) {
        description = panel.text().trim().substring(0, 500) || undefined;
      }
    }

    // Look for images in the tab or its panel
    const imageUrls: string[] = [];
    const panel = panelId ? $(`#${panelId}`) : null;
    const container = panel ?? $(tabEl);
    // Prefer <picture><source srcset> over plain <img src>
    const pictureSource = container.find('picture source[srcset]').first();
    if (pictureSource.length) {
      const best = pickBestFromSrcset(pictureSource.attr('srcset')!, baseUrl);
      if (best) imageUrls.push(best);
    }
    if (imageUrls.length === 0) {
      const imgEl = container.find('img').first();
      if (imgEl?.length) {
        const src = imgEl.attr('data-original') || imgEl.attr('data-src') || imgEl.attr('data-lazy-src') || imgEl.attr('data-image') || imgEl.attr('src');
        if (src && !src.startsWith('data:')) {
          const nextImg = resolveNextImageUrl(src, baseUrl);
          if (nextImg) { imageUrls.push(nextImg); }
          else { try { imageUrls.push(new URL(src, baseUrl).toString()); } catch {} }
        }
      }
    }

    campaigns.push({
      title,
      description: description && description.length > 10 ? description : undefined,
      sourceUrl: baseUrl,
      imageUrls,
    });
  });

  if (campaigns.length > 0) {
    console.log(`  [Generic] Extracted ${campaigns.length} campaigns from tab layout`);
  }

  return campaigns;
}

// ─── HTML-based promo code extraction ────────────────────────
const PROMO_CSS_SELECTORS = [
  '[class*="coupon-code"]', '[class*="promo-code"]', '[class*="discount-code"]',
  '[class*="voucher-code"]', '[class*="couponcode"]', '[class*="promocode"]',
  '[class*="discountcode"]', '[class*="vouchercode"]',
  '[class*="kuponcod"]', '[class*="promokod"]',
  '[class*="copy-code"]', '[class*="code-copy"]',
  '.coupon-value', '.promo-value', '.code-value',
  '[class*="coupon"] code', '[class*="promo"] code',
  '[class*="coupon"] .value', '[class*="promo"] .value',
];

const PROMO_ATTR_SELECTORS = [
  'data-clipboard-text',
  'data-copy',
  'data-code',
  'data-coupon-code',
  'data-coupon',
  'data-promo-code',
  'data-promo',
  'data-voucher',
];

/**
 * Extract promo code from HTML elements — CSS selectors, data attributes, and JSON-LD.
 * @param $ Cheerio instance
 * @param scope Optional element to search within (for card-level extraction)
 */
function extractPromoFromHtml($: cheerio.CheerioAPI, scope?: any): string | null {
  const root = scope ? $(scope) : $('body');

  // 1. CSS class-based selectors
  for (const sel of PROMO_CSS_SELECTORS) {
    const els = root.find(sel).toArray();
    for (const el of els) {
      const text = $(el).text().trim();
      const code = validatePromoCode(text);
      if (code) return code;
    }
  }

  // 2. Data attributes (clipboard, copy, code)
  for (const attr of PROMO_ATTR_SELECTORS) {
    const els = root.find(`[${attr}]`).toArray();
    for (const el of els) {
      const val = $(el).attr(attr);
      const code = validatePromoCode(val);
      if (code) return code;
    }
  }

  // 3. JSON-LD structured data (schema.org Offer.couponCode)
  const jsonLdScripts = $('script[type="application/ld+json"]').toArray();
  for (const el of jsonLdScripts) {
    try {
      const json = JSON.parse($(el).text());
      const code = findCouponInJsonLd(json);
      if (code) return code;
    } catch { /* ignore malformed JSON-LD */ }
  }

  return null;
}

/** Recursively search JSON-LD for couponCode fields */
function findCouponInJsonLd(obj: any, depth = 0): string | null {
  if (depth > 5 || !obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const code = findCouponInJsonLd(item, depth + 1);
      if (code) return code;
    }
    return null;
  }
  for (const key of ['couponCode', 'discountCode', 'voucherCode', 'promoCode']) {
    if (typeof obj[key] === 'string') {
      const code = validatePromoCode(obj[key]);
      if (code) return code;
    }
  }
  for (const val of Object.values(obj)) {
    if (typeof val === 'object') {
      const code = findCouponInJsonLd(val, depth + 1);
      if (code) return code;
    }
  }
  return null;
}

function extractCampaignFromElement(
  $: cheerio.CheerioAPI,
  el: any,
  baseUrl: string,
): RawCampaignData | null {
  const title =
    $(el).find('h1, h2, h3, h4').first().text().trim() ||
    $(el).find('a').first().text().trim() ||
    $(el).find('[class*="title"]').first().text().trim();

  if (!title || title.length < 5 || title.length > 300) return null;
  // Reject URL-like text (e.g., "www.example.com/path")
  if (/^(https?:\/\/|www\.)\S+$/.test(title)) return null;

  const href = $(el).find('a').first().attr('href') || $(el).attr('href');
  let sourceUrl = baseUrl;
  if (href) {
    try { sourceUrl = new URL(href, baseUrl).toString(); } catch {}
  }

  const imageUrls: string[] = [];
  // 1. <img> tag — skip UI elements, prefer <picture><source srcset> when img is inside <picture>
  const imgs = $(el).find('img').toArray();
  for (const imgEl of imgs) {
    if (isLikelyUIElement($, imgEl)) continue;
    // If img is inside <picture>, prefer <source srcset> (higher quality, e.g. Opel, Toyota)
    const parent = $(imgEl).parent();
    if (parent.is('picture')) {
      const source = parent.find('source[srcset]').first();
      if (source.length) {
        const best = pickBestFromSrcset(source.attr('srcset')!, baseUrl);
        if (best) { imageUrls.push(best); break; }
      }
    }
    const srcset = $(imgEl).attr('srcset') || $(imgEl).attr('data-srcset');
    if (srcset) {
      const best = pickBestFromSrcset(srcset, baseUrl);
      if (best) { imageUrls.push(best); break; }
    }
    const src = $(imgEl).attr('data-original') || $(imgEl).attr('data-src') || $(imgEl).attr('data-lazy-src') || $(imgEl).attr('data-image') || $(imgEl).attr('src');
    if (src && !src.startsWith('data:')) {
      // Resolve Next.js /_next/image?url= URLs to actual image URLs
      const nextImg = resolveNextImageUrl(src, baseUrl);
      if (nextImg) { imageUrls.push(nextImg); break; }
      try { imageUrls.push(new URL(src, baseUrl).toString()); break; } catch {}
    }
  }
  // 2. <picture><source> tag (fallback for standalone <picture> without <img>)
  if (imageUrls.length === 0) {
    const source = $(el).find('picture source[srcset]').first();
    if (source.length) {
      const best = pickBestFromSrcset(source.attr('srcset')!, baseUrl);
      if (best) imageUrls.push(best);
    }
  }
  // 3. CSS background-image on element or children
  if (imageUrls.length === 0) {
    const bgEls = [el, ...$(el).find('[style*="background"]').toArray()];
    for (const bgEl of bgEls) {
      const style = $(bgEl).attr('style') || '';
      const bgMatch = style.match(/background(?:-image)?\s*:\s*url\(\s*['"]?([^'")\s]+)['"]?\s*\)/i);
      if (bgMatch?.[1]) {
        try { imageUrls.push(new URL(bgMatch[1], baseUrl).toString()); break; } catch {}
      }
    }
  }
  // 4. data-bg / data-background (lazy-load patterns)
  if (imageUrls.length === 0) {
    const lazyEl = $(el).find('[data-bg], [data-background]').first();
    if (lazyEl.length) {
      const bg = lazyEl.attr('data-bg') || lazyEl.attr('data-background');
      if (bg) { try { imageUrls.push(new URL(bg, baseUrl).toString()); } catch {} }
    }
  }

  const description =
    $(el).find('p, [class*="desc"]').first().text().trim() || undefined;

  const discountRate = parseDiscountSafe(title);

  return {
    title,
    description: description && description.length > 5 ? description : undefined,
    sourceUrl,
    imageUrls,
    discountRate,
    promoCode: extractPromoFromHtml($, el) || undefined,
  };
}

/**
 * Extract campaign data from a detail page using meta tags and common patterns.
 */
function extractFromMetaTags($: cheerio.CheerioAPI, pageUrl: string): RawCampaignData | null {
  const title =
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('meta[name="twitter:title"]').attr('content')?.trim() ||
    $('title').text().trim() ||
    $('h1').first().text().trim();

  if (!title || title.length < 5) return null;

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="twitter:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    undefined;

  const imageUrls: string[] = [];
  const ogImage = $('meta[property="og:image"]').attr('content') || undefined;
  const twitterImage = $('meta[name="twitter:image"]').attr('content') || undefined;

  // Always try content images first — they're usually campaign-specific,
  // while og:image is often a shared brand/site image
  const contentImg = findContentImage($, pageUrl);
  if (contentImg) {
    imageUrls.push(contentImg);
  }

  // Fall back to meta images: prefer non-logo og:image, then twitter:image
  if (imageUrls.length === 0) {
    const ogResolved = ogImage ? tryResolve(ogImage, pageUrl) : null;
    const twResolved = twitterImage ? tryResolve(twitterImage, pageUrl) : null;

    if (ogResolved && !isLikelyBrandLogo(ogResolved)) {
      imageUrls.push(ogResolved);
    } else if (twResolved && !isLikelyBrandLogo(twResolved)) {
      imageUrls.push(twResolved);
    } else if (ogResolved) {
      // Last resort — use og:image even if it looks like a logo
      imageUrls.push(ogResolved);
    }
  }

  const fullText = `${title} ${description || ''}`;
  const discountRate = parseDiscountSafe(fullText);

  // Extract dates from the page
  const dates = extractDates($);

  return {
    title,
    description: description && description.length > 10 ? description : undefined,
    sourceUrl: pageUrl,
    imageUrls,
    discountRate,
    startDate: dates.startDate ?? undefined,
    endDate: dates.endDate ?? undefined,
    promoCode: extractPromoFromHtml($) || undefined,
  };
}

/** Safely resolve a relative URL, returning null on failure */
function tryResolve(url: string, base: string): string | null {
  try { return new URL(url, base).toString(); } catch { return null; }
}

/** Content image selectors — ordered from most specific to least */
const CONTENT_IMG_SELECTORS = [
  '[class*="detail"] img',
  '[class*="highlight"] img',
  '[class*="hero"] img',
  '[class*="banner"] img',
  '[class*="campaign"] img',
  '[class*="kampanya"] img',
  'article img',
  '.content img',
  'main img',
  '[role="main"] img',
].join(', ');

/**
 * Check if an image element is likely a UI element (chat widget, icon, button)
 * rather than meaningful page content.
 */
function isLikelyUIElement($: cheerio.CheerioAPI, el: any): boolean {
  // border="0" is old-school HTML used for UI icons/buttons
  if ($(el).attr('border') !== undefined) return true;

  // Skip images with IDs suggesting help/chat/widget
  const id = $(el).attr('id') || '';
  if (/help|chat|support|live|widget|destek/i.test(id)) return true;

  // Skip very small explicitly-sized images (icons)
  const w = parseInt($(el).attr('width') || '0', 10);
  const h = parseInt($(el).attr('height') || '0', 10);
  if (w > 0 && h > 0 && w < 80 && h < 80) return true;

  return false;
}

/**
 * Find the best content image on a page (not header/footer/nav logos).
 * Handles: regular <img src>, <picture><source srcset>, data-src, and SVG placeholders.
 * Skips UI elements (chat widgets, icons with border="0", etc.)
 */
function findContentImage($: cheerio.CheerioAPI, pageUrl: string): string | null {
  const candidates = $(CONTENT_IMG_SELECTORS).toArray();
  for (const el of candidates) {
    // Skip UI elements (chat widgets, icons, buttons)
    if (isLikelyUIElement($, el)) continue;

    // 1. Check if inside <picture> — extract from <source srcset>
    const parent = $(el).parent();
    if (parent.is('picture')) {
      const source = parent.find('source[srcset]').first();
      if (source.length) {
        const srcset = source.attr('srcset')!;
        const best = pickBestFromSrcset(srcset, pageUrl);
        if (best && !isLikelyBrandLogo(best)) return best;
      }
    }

    // 2. Prefer data-src (lazy-loaded content images) over src (may be placeholder/UI)
    const src = $(el).attr('data-original') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('data-image') || $(el).attr('src');
    if (!src || src.startsWith('data:')) continue;
    // Resolve Next.js /_next/image?url= URLs
    const nextImg = resolveNextImageUrl(src, pageUrl);
    if (nextImg && !isLikelyBrandLogo(nextImg)) return nextImg;
    try {
      const resolved = new URL(src, pageUrl).toString();
      if (!isLikelyBrandLogo(resolved)) return resolved;
    } catch { /* skip */ }

    // 3. Check srcset on the img itself
    const srcset = $(el).attr('srcset') || $(el).attr('data-srcset');
    if (srcset) {
      const best = pickBestFromSrcset(srcset, pageUrl);
      if (best && !isLikelyBrandLogo(best)) return best;
    }
  }

  // 4. Broad fallback: scan ALL img tags for a campaign-like image
  // Priority: images in campaign-related paths > images with multi-word filenames > any valid image
  const allImgs = $('img').toArray();
  const fallbackCandidates: { url: string; priority: number }[] = [];

  for (const el of allImgs) {
    if (isLikelyUIElement($, el)) continue;
    const rawSrc = $(el).attr('data-original') || $(el).attr('data-src') || $(el).attr('data-lazy-src') || $(el).attr('data-image') || $(el).attr('src');
    if (!rawSrc || rawSrc.startsWith('data:')) continue;
    // Resolve Next.js /_next/image?url= URLs
    const src = resolveNextImageUrl(rawSrc, pageUrl) || rawSrc;
    try {
      const resolved = new URL(src, pageUrl).toString();
      if (isLikelyBrandLogo(resolved)) continue;
      const pathLower = new URL(resolved).pathname.toLowerCase();
      // Skip sprite sheets and single-word icon filenames
      if (/sprites?\./i.test(pathLower)) continue;
      const filename = pathLower.split('/').pop() || '';
      if (/^[a-z]+\.(png|jpg|gif|webp)$/i.test(filename)) continue; // e.g., money.png, cursor.png
      // Priority scoring
      let priority = 0;
      if (/campaign|kampanya|banner|promo|offer|firsat/i.test(pathLower)) priority += 10;
      if (/\d{3,}x\d{3,}/.test(filename)) priority += 5; // Large dimensions in filename
      if (filename.length > 20) priority += 3; // Long filenames are usually campaign-specific
      fallbackCandidates.push({ url: resolved, priority });
    } catch { /* skip */ }
  }

  if (fallbackCandidates.length > 0) {
    fallbackCandidates.sort((a, b) => b.priority - a.priority);
    return fallbackCandidates[0].url;
  }

  return null;
}

/**
 * Fetch the best image from a detail page URL.
 * Priority: content image > non-logo og:image > twitter:image > null
 */
async function fetchDetailImage(url: string): Promise<string | null> {
  try {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    // 1. Try content images first — they're campaign-specific
    const contentImg = findContentImage($, url);
    if (contentImg) return contentImg;

    const ogImage = $('meta[property="og:image"]').attr('content');
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    const ogResolved = ogImage ? tryResolve(ogImage, url) : null;
    const twResolved = twitterImage ? tryResolve(twitterImage, url) : null;

    // 2. Prefer non-logo og:image
    if (ogResolved && !isLikelyBrandLogo(ogResolved)) return ogResolved;

    // 3. Prefer non-logo twitter:image
    if (twResolved && !isLikelyBrandLogo(twResolved)) return twResolved;

    // 4. Last resort: use og:image even if it looks like a logo — any image > no image
    if (ogResolved) return ogResolved;
    if (twResolved) return twResolved;

    return null;
  } catch (err) {
    console.warn(`  [Generic] Failed to fetch detail image from ${url}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

/**
 * For campaigns extracted from cards, if all images are logos or missing,
 * try to fetch a better image from the campaign's detail page.
 * Also detects shared images across campaigns (likely generic brand images).
 */
async function enrichLogoImages(campaigns: RawCampaignData[]): Promise<void> {
  // Phase 1: Fetch better images for campaigns with logo-only or no images
  for (const c of campaigns) {
    if (c.imageUrls && c.imageUrls.length > 0 && c.imageUrls.every(isLikelyBrandLogo)) {
      // All images are logos — try detail page
      if (c.sourceUrl) {
        console.log(`  [Generic] Image is logo, fetching detail page: ${c.sourceUrl}`);
        await delay(randomDelay(CRAWL_DELAY_MS));
        const img = await fetchDetailImage(c.sourceUrl);
        if (img) {
          console.log(`  [Generic] Found campaign image: ${img.substring(0, 80)}...`);
          c.imageUrls = [img];
        } else {
          console.log(`  [Generic] No campaign image found, keeping original: ${c.sourceUrl.substring(0, 60)}`);
          // Keep original logo images as fallback — better than nothing
        }
      }
    } else if (c.imageUrls && c.imageUrls.length === 0 && c.sourceUrl) {
      // No images at all — try detail page
      await delay(randomDelay(CRAWL_DELAY_MS));
      const img = await fetchDetailImage(c.sourceUrl);
      if (img) {
        c.imageUrls = [img];
      }
    }
  }

  // Phase 2: Detect shared images — if 3+ campaigns share the exact same
  // image URL, it's likely a generic brand image, not campaign-specific
  const imageCount = new Map<string, number>();
  for (const c of campaigns) {
    if (c.imageUrls && c.imageUrls.length === 1) {
      const url = c.imageUrls[0];
      imageCount.set(url, (imageCount.get(url) || 0) + 1);
    }
  }
  for (const [url, count] of Array.from(imageCount.entries())) {
    if (count >= 3) {
      console.log(`  [Generic] Shared image detected (${count}x): ${url.substring(0, 80)}`);
      let replaced = 0;
      // Try to fetch individual campaign images for these
      for (const c of campaigns) {
        if (c.imageUrls?.length === 1 && c.imageUrls[0] === url && c.sourceUrl) {
          await delay(randomDelay(CRAWL_DELAY_MS));
          const betterImg = await fetchDetailImage(c.sourceUrl);
          if (betterImg && betterImg !== url) {
            console.log(`  [Generic] Replaced shared image for: ${c.title.substring(0, 40)}`);
            c.imageUrls = [betterImg];
            replaced++;
          }
        }
      }
      // If no campaigns got a better image, keep the shared image
      // A repeated brand image is better than no image at all
      if (replaced === 0) {
        console.log(`  [Generic] No alternatives found — keeping shared image as fallback`);
      }
    }
  }
}

const MAX_TOTAL_VISITS = 30;
const MAX_LINKS_PER_PAGE = 10;
const LISTING_PAGE_THRESHOLD = 3;

/**
 * Recursively visit a page, detect listing pages, and extract campaigns.
 * If the page has 3+ campaign sub-links, treat it as a listing page
 * and go one level deeper instead of saving it as a campaign.
 */
async function visitPage(
  url: string,
  depthLeft: number,
  seenUrls: Set<string>,
  campaigns: RawCampaignData[],
  visited: { count: number },
  abortSignal?: AbortSignal,
): Promise<void> {
  if (abortSignal?.aborted) return;
  if (seenUrls.has(url) || visited.count >= MAX_TOTAL_VISITS) return;
  seenUrls.add(url);
  visited.count++;

  try {
    await delay(randomDelay(CRAWL_DELAY_MS));
    console.log(`  [Generic] Visiting${depthLeft < 2 ? ' (deep)' : ''}: ${url}`);

    const html = await fetchHtml(url);
    const detail$ = cheerio.load(html);

    // Check if this is a listing/category page (has many campaign sub-links)
    if (depthLeft > 0) {
      const subLinks = findCampaignLinks(detail$, url);
      if (subLinks.length >= LISTING_PAGE_THRESHOLD) {
        console.log(`  [Generic] Listing page (${subLinks.length} sub-links, depth=${depthLeft}): ${url}`);
        // Extract cards from listing page (captures images from card elements)
        const listingCards = extractCardsFromPage(detail$, url);
        if (listingCards.length > 0) {
          const listingDates = extractDates(detail$);
          for (const lc of listingCards) {
            if (!lc.startDate) lc.startDate = listingDates.startDate ?? undefined;
            if (!lc.endDate) lc.endDate = listingDates.endDate ?? undefined;
            const isDupe = campaigns.some(
              (c) => c.title === lc.title || c.sourceUrl === lc.sourceUrl,
            );
            if (!isDupe) campaigns.push(lc);
          }
          console.log(`  [Generic] Extracted ${listingCards.length} cards from listing page`);
        }
        // Also recurse deeper for campaign detail pages
        for (const subLink of subLinks.slice(0, MAX_LINKS_PER_PAGE)) {
          if (abortSignal?.aborted) break;
          await visitPage(subLink, depthLeft - 1, seenUrls, campaigns, visited, abortSignal);
        }
        return; // Don't save the listing page itself as a campaign
      }
    }

    // Individual campaign page — extract via meta tags
    const campaign = extractFromMetaTags(detail$, url);
    if (campaign) {
      const isDupe = campaigns.some(
        (c) => c.title === campaign.title || c.sourceUrl === campaign.sourceUrl,
      );
      if (!isDupe) campaigns.push(campaign);
    }
  } catch (err) {
    console.warn(`  [Generic] Failed: ${url} — ${(err as Error).message}`);
  }
}

/**
 * Main generic scraper function — HTTP fetch + Cheerio only.
 *
 * Phase 1: Visit seed URL, try to extract cards directly
 * Phase 2: Find campaign links and visit each (auto-detects listing pages
 *          and recurses up to 3 levels deep)
 * Phase 3: If still nothing, extract seed page itself as campaign
 *
 * Returns empty array if HTML is too sparse (SPA) — caller should
 * fall back to Playwright.
 */
export async function scrapeGeneric(
  seedUrl: string,
  maxDepth: number,
  market?: CrawlMarket,
  abortSignal?: AbortSignal,
  accumulator?: RawCampaignData[],
): Promise<RawCampaignData[]> {
  console.log(`  [Generic] Fetching: ${seedUrl}`);

  const html = await fetchHtml(seedUrl, market);
  const $ = cheerio.load(html);

  // Check if the page has meaningful content
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  if (bodyText.length < 500) {
    console.log(`  [Generic] Sparse HTML (${bodyText.length} chars), likely SPA — returning empty for Playwright fallback`);
    return [];
  }

  // Use accumulator if provided (allows engine to access results before function returns)
  const campaigns: RawCampaignData[] = accumulator || [];
  const seenUrls = new Set<string>();
  seenUrls.add(seedUrl);

  // Extract page-level dates for fallback
  const pageDates = extractDates($);

  // Phase 0: Try to extract campaigns from Next.js __NEXT_DATA__ JSON
  const nextDataCampaigns = extractFromNextData($, seedUrl);
  if (nextDataCampaigns.length > 0) {
    for (const c of nextDataCampaigns) {
      if (!c.startDate) c.startDate = pageDates.startDate ?? undefined;
      if (!c.endDate) c.endDate = pageDates.endDate ?? undefined;
    }
    campaigns.push(...nextDataCampaigns);
  }

  // Phase 1: Try to extract campaign cards directly from the page
  const directCampaigns = extractCardsFromPage($, seedUrl);
  if (directCampaigns.length > 0) {
    console.log(`  [Generic] Found ${directCampaigns.length} campaigns directly on page`);
    for (const c of directCampaigns) {
      if (!c.startDate) c.startDate = pageDates.startDate ?? undefined;
      if (!c.endDate) c.endDate = pageDates.endDate ?? undefined;
      // Avoid duplicates from __NEXT_DATA__ extraction
      const isDupe = campaigns.some(
        (existing) => existing.title === c.title || existing.sourceUrl === c.sourceUrl,
      );
      if (!isDupe) campaigns.push(c);
    }
  }

  // Phase 2: Find campaign links and visit them recursively
  // Depth 2 allows: seed → category → sub-category → campaign (3 hops)
  if (maxDepth > 0) {
    const campaignLinks = findCampaignLinks($, seedUrl);
    console.log(`  [Generic] Found ${campaignLinks.length} campaign links to visit`);

    const visited = { count: 0 };
    for (const link of campaignLinks.slice(0, MAX_LINKS_PER_PAGE)) {
      if (abortSignal?.aborted) break;
      await visitPage(link, 2, seenUrls, campaigns, visited, abortSignal);
    }
  }

  // If Phase 0+1+2 found nothing, skip Phase 3 (meta tag extraction) and return
  // empty so the engine falls back to Playwright which can render JS content.
  // Playwright fallback has its own meta tag extraction as last resort.
  if (campaigns.length === 0) {
    console.log(`  [Generic] No campaigns found in Phases 0-2, returning empty for Playwright fallback`);
    return [];
  }

  // Phase 4: Enrich campaigns that only have logo images
  await enrichLogoImages(campaigns);

  console.log(`  [Generic] Total campaigns extracted: ${campaigns.length}`);
  return campaigns;
}
