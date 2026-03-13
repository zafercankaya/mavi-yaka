import { Market } from '@prisma/client';
import { NormalizedCampaign } from './normalize';
import { classifyAndEnrich } from '../utils/ai-client';

// ====== MARKET-SPECIFIC KEYWORD CONFIGURATION ======

interface MarketKeywords {
  strongCampaignKeywords: string[];        // +3 score — core campaign/deal terms
  strongCampaignKeywordsWordBoundary: RegExp[];  // +3 score — word boundary
  campaignKeywords: string[];              // +2 score — secondary campaign terms
  campaignKeywordsWordBoundary: RegExp[];  // +2 score — word boundary
  blacklistedTitles: string[];
  campaignUrlPatterns: RegExp[];
  nonCampaignUrlPatterns: RegExp[];
  nonCampaignTitleKeywords: string[];
  listingPageTitlePatterns: RegExp[];
  listingPageUrlPatterns: RegExp[];
  homepageCampaignCheck: RegExp;
  productTypeRe?: RegExp;
  categoryOnlyRe?: RegExp;
  productListingPatterns?: RegExp[];
}

// ─── TR Market Keywords ───────────────────────────────────────

const TR_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'kampanya', 'indirim', 'fırsat', 'firsat', 'promosyon', 'kupon', 'outlet',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'teklif', 'taksit', 'hediye', 'ücretsiz kargo', 'ucretsiz kargo',
    'avantaj', 'özel fiyat', 'ozel fiyat', 'sezon sonu',
    'black friday', 'ramazan', 'bayram', 'bonus', 'cashback',
    'sepette', 'fiyatına', 'fiyatina', 'varan', 'kazan', 'bedava',
    'al öde', 'al ode', '4 al 3 öde',
    // Telekom
    'tarife', 'paket kampanyası', 'hat kampanyası', 'numara taşıma',
    'sınırsız internet', 'ek paket', 'mobil paket', 'fiber kampanya',
    // Teknoloji & Yazılım
    'abonelik fırsatı', 'ücretsiz deneme', 'premium üyelik', 'yazılım indirimi',
    'lisans kampanyası', 'bulut depolama', 'teknoloji fırsatı',
  ],
  campaignKeywordsWordBoundary: [
    /\bpuan\b/i,    // "puan" but not "şampuan"
    /\d+\s*%/,      // "20%", "50 %" — contextual discount (not bare %)
    /%\s*\d+/,      // "%20", "% 50" — Turkish style discount
  ],
  blacklistedTitles: [
    'anasayfa', 'ana sayfa', 'hakkimizda', 'hakkımızda',
    'iletisim', 'iletişim', 'giris yap', 'giriş yap',
    'uyelik', 'üyelik', 'kayit ol', 'kayıt ol',
    'sepet', 'sepetim', 'odeme', 'ödeme',
    'gizlilik', 'cerez', 'çerez', 'kvkk',
    'sartlar', 'şartlar', 'kosullar', 'koşullar',
    'sss', 'sikca sorulan', 'sıkça sorulan',
    'yardim', 'yardım', 'destek merkezi',
    'iade', 'iade politikası', 'kargo takip',
  ],
  campaignUrlPatterns: [
    /\/kampanya/i, /\/indirim/i, /\/firsat/i, /\/outlet/i,
    /\/sale/i, /\/deal/i, /\/offer/i, /\/promo/i,
    /\/discount/i, /\/campaign/i, /\/special/i,
    /\/firsatlar/i, /\/avantaj/i,
  ],
  nonCampaignUrlPatterns: [
    /\/warranty\b/i,
    /\/hakkimizda/i, /\/about\b/i, /\/iletisim/i, /\/contact\b/i,
    /\/kvkk/i, /\/gizlilik/i, /\/privacy/i, /\/terms\b/i,
    /\/recycling/i, /\/geri-cagirma/i, /\/yardim/i, /\/help\b/i,
    /\/faq\b/i, /\/sss\b/i,
  ],
  nonCampaignTitleKeywords: [
    'satış sonrası', 'satis sonrasi', 'yetkili servis', 'yetkili satıcı',
    'gönüllü geri çağırma', 'gonullu geri cagirma', 'recycling',
    'motor yağı', 'motor yagi', 'garanti +', 'garanti güvence',
    'garantiler', 'tasarlayın', 'tasarlayin', 'orijinal yedek',
    'servis çözümleri', 'servis cozumleri', 'resmi web sitesi',
    'plan de travail', 'anasayfaplan',
  ],
  listingPageTitlePatterns: [
    /modelleri\s*(ve\s*)?(fiyat|ürün)/i,
    /fırsat\s*ürünleri/i, /firsat\s*urunleri/i,
    /^yeni\s*sezon\s*(indirim|ürün|koleksiyon)/i,
  ],
  listingPageUrlPatterns: [
    /^\/kampanyalar?$/,
    /^\/[a-z]{2}\/campaigns?$/,
  ],
  homepageCampaignCheck: /indirim|kampanya|fırsat|firsat|promosyon|teklif|bonus/i,
  productTypeRe: /(?:^|\s|[-/])(şampuan|sampuan|kremi?\b|serumu?\b|losyonu?\b|parfüm|deodorant|roll[\s-]?on\b|temizleyici|maskesi?\b|toniği?\b|jeli?\b|peeling|ruj\b|allık|allik|fondöten|fondoten|maskara|eyeliner|pudra\b|oje\b|rimel|kapatıcı|aydınlatıcı|nemlendirici|güneş\s*krem|gunes\s*krem|saç\s*boyası|sac\s*boyasi|diş\s*macunu|dis\s*macunu|duş\s*jeli|dus\s*jeli|el\s*krem)/i,
  categoryOnlyRe: /^(parfüm|parfum|kozmetik|makyaj|cilt\s*bakım[ıi]?|saç?\s*bakım[ıi]?|vücut|vucut|banyo|güzellik|guzellik|aksesuar|giyim|ayakkabı|ayakkabi|çanta|canta|saat|takı|taki|hırka|hirka|kazak|elbise|bluz|gömlek|gomlek|ceket|pantolon|etek|mont|triko|yelek|t-?shirt|şort|sort|jean|denim|pijama|iç\s*giyim|ic\s*giyim|mayo|bikini|eşofman|esofman|kaban|parka|sweatshirt|hoodie)(\s*[&+ve]\s*(banyo|bakım[ıi]?|bakim[ıi]?|güzellik|guzellik|aksesuar|giyim))?(\s*[-–—|]\s*.+)?$/i,
  productListingPatterns: [
    /modelleri\s*(ve\s*)?(fiyat|ürün)/i,
    /^outlet\s*(erkek|kadın|kadin|çocuk|cocuk)?\s*(giyim|ayakkabı|ayakkabi)/i,
    /^yeni\s*sezon\s*(indirim|ürün|koleksiyon)/i,
    /^(erkek|kadın|kadin|çocuk|cocuk)\s*(giyim|ayakkabı|ayakkabi|aksesuar)/i,
    /fırsat\s*ürünleri\s*(ve\s*indirimler?)?$/i,
    /firsat\s*urunleri/i,
  ],
};

// ─── US Market Keywords ───────────────────────────────────────

const US_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'campaign', 'sale', 'deal', 'deals', 'discount', 'promo', 'promotion',
    'coupon', 'coupons', 'clearance', 'offer', 'offers',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary terms
    'on sale', 'special', 'specials',
    'flash sale', 'limited time', 'price drop',
    'doorbuster', 'doorbusters', 'weekly ad',
    "today's deals", 'today\'s deals',
    // Aksiyon terimleri
    'save', 'savings', '% off', 'off', 'free shipping',
    'buy one get one', 'bogo', 'bonus', 'cashback', 'cash back',
    'reward', 'rewards', 'rebate',
    // Sezon / etkinlik
    'black friday', 'cyber monday', 'prime day', 'memorial day sale',
    'labor day sale', 'back to school',
    // Fiyat / indirim
    'half price', 'half off', 'extra',
    // Telecom
    'phone deal', 'wireless deal', 'unlimited data', 'data plan',
    'internet bundle', 'broadband deal', 'mobile plan', 'switch and save',
    // Tech & Software
    'free trial', 'subscription deal', 'software discount', 'app deal',
    'cloud storage', 'annual plan', 'premium plan',
  ],
  campaignKeywordsWordBoundary: [
    /\bfree\b/i,    // "free" but not "freestyle" etc.
    /\d+\s*%/,      // "20%", "50 %" — contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    'home', 'homepage', 'about us', 'about', 'contact us', 'contact',
    'login', 'log in', 'sign in', 'sign up', 'register', 'create account',
    'cart', 'my cart', 'shopping cart', 'checkout', 'payment',
    'privacy', 'privacy policy', 'cookie policy', 'cookies',
    'terms', 'terms of service', 'terms and conditions', 'terms of use',
    'faq', 'frequently asked questions', 'help', 'help center', 'support',
    'return policy', 'returns', 'shipping', 'shipping info', 'track order',
    'careers', 'jobs', 'press', 'investor relations', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/deals?\b/i, /\/sale\b/i, /\/offers?\b/i, /\/promo/i,
    /\/discount/i, /\/campaign/i, /\/specials?\b/i,
    /\/clearance/i, /\/coupons?\b/i, /\/weekly-?ad/i,
    /\/flash-?sale/i, /\/savings?\b/i, /\/outlet/i,
    /\/today/i, /\/bargain/i,
  ],
  nonCampaignUrlPatterns: [
    /\/warranty\b/i, /\/about\b/i, /\/contact\b/i,
    /\/privacy/i, /\/terms\b/i, /\/legal\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i,
    /\/careers?\b/i, /\/jobs\b/i, /\/press\b/i,
    /\/investor/i, /\/recycling/i, /\/recall\b/i,
    /\/sitemap/i, /\/accessibility/i,
  ],
  nonCampaignTitleKeywords: [
    'after sales', 'warranty service', 'authorized dealer',
    'recall', 'product recall', 'safety notice',
    'official website', 'corporate', 'investor relations',
    'press release', 'careers', 'work with us',
    'recycling program', 'sustainability',
    // Fintech/payment non-campaign pages
    'pay me on', 'send money', 'transfer money',
    'download the app', 'get the app', 'create account',
  ],
  listingPageTitlePatterns: [
    /^all\s*(deals|offers|sales|promotions|coupons)$/i,
    /^(shop\s*)?all\s*products$/i,
    /^browse\s*(all|our)\s*/i,
  ],
  listingPageUrlPatterns: [
    /^\/deals?$/,
    /^\/sale$/,
    /^\/offers?$/,
    /^\/specials?$/,
  ],
  homepageCampaignCheck: /deal|sale|offer|discount|promo|coupon|special|clearance|save/i,
  productTypeRe: /(?:^|\s|[-/])(shampoo|cream\b|serum\b|lotion\b|perfume|deodorant|cleanser|mask\b|toner\b|gel\b|lipstick|blush|foundation|mascara|eyeliner|powder\b|nail\s*polish|concealer|highlighter|moisturizer|sunscreen|hair\s*dye|toothpaste|body\s*wash|hand\s*cream)/i,
  categoryOnlyRe: /^(perfume|cosmetics|makeup|skincare|haircare|bodycare|beauty|accessories|clothing|shoes|bags|watches|jewelry|jackets?|coats?|sweaters?|cardigans?|dresses?|blouses?|shirts?|pants|trousers|skirts?|t-?shirts?|shorts|jeans?|denim|pajamas?|swimwear|bikini|hoodies?|sweatshirts?|activewear|loungewear|outerwear|underwear|lingerie|socks|sandals|boots|sneakers|heels|flats)(\s*[&+and]\s*(bath|care|beauty|accessories|clothing))?(\s*[-–—|]\s*.+)?$/i,
  productListingPatterns: [
    /^new\s*(arrivals?|season|collection)/i,
    /^(men'?s?|women'?s?|kids?)\s*(clothing|shoes|accessories)/i,
    /^shop\s*(men|women|kids|all)/i,
  ],
};

// ─── DE Market Keywords ───────────────────────────────────────

const DE_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'angebot', 'angebote', 'rabatt', 'aktion', 'aktionen', 'gutschein',
    'sale', 'deal', 'deals', 'discount', 'promotion', 'promo', 'coupon', 'offer', 'offers', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [
    /\bwsv\b/i, /\bssv\b/i, /\bgratis\b/i,
  ],
  campaignKeywords: [
    // Secondary German terms
    'sonderangebot', 'sonderangebote', 'preisnachlass',
    'schnäppchen', 'schnappchen', 'reduziert', 'spare', 'sparen',
    'sparpreis', 'preissenkung', 'ermäßigung', 'ermaessigung',
    'gutscheine', 'coupons',
    'kostenloser versand', 'gratis versand', 'versandkostenfrei',
    'prozent rabatt', 'tiefpreis', 'bestpreis', 'preisknaller',
    'ausverkauf', 'räumungsverkauf', 'raeumungsverkauf',
    'winterschlussverkauf', 'sommerschlussverkauf', 'schlussverkauf',
    'saisonschlussverkauf', 'jetzt sparen', 'zeitlich begrenzt', 'nur für kurze zeit',
    // Additional German deal terms
    'restposten', 'lagerräumung', 'lagerraeumung',
    'hammerpreis', 'knallerpreis', 'preishit', 'preiskracher',
    'vorteilspreis', 'megadeal', 'super sale',
    'tagesangebot', 'tagesangebote', 'wochenangebot', 'wochenangebote',
    '2 für 1', '2-für-1', 'zwei für eins',
    'zugabe', 'gratiszugabe', 'prozente',
    'jubiläumsangebot', 'jubilaeumsangebot',
    // Seasonal / events
    'black friday', 'cyber monday', 'cyber week',
    // English secondary terms on German sites
    'special', 'flash sale', 'limited time',
    'save', 'savings', '% off', 'off', 'free shipping',
    'buy one get one', 'bogo', 'bonus', 'cashback', 'cash back',
    // Telekom
    'tarif', 'mobilfunk-angebot', 'handyvertrag', 'internet-aktion',
    'datenpaket', 'flatrate', 'sim-karte', 'vertragsverlängerung',
    // Technologie & Software
    'software-angebot', 'abo-angebot', 'kostenlos testen', 'premium-abo',
    'cloud-angebot', 'lizenz-rabatt', 'tech-deal',
  ],
  campaignKeywordsWordBoundary: [
    /\bfrei\b/i,    // "frei" (free) but not "Freitag" etc.
    /\bfree\b/i,
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    // German navigation/info pages
    'startseite', 'impressum', 'datenschutz', 'datenschutzerklärung',
    'agb', 'allgemeine geschäftsbedingungen', 'kontakt', 'kontaktformular',
    'über uns', 'ueber uns', 'karriere', 'presse', 'pressemitteilung',
    'hilfe', 'hilfecenter', 'faq', 'häufige fragen',
    'warenkorb', 'mein warenkorb', 'kasse', 'bezahlung',
    'anmelden', 'registrieren', 'konto erstellen', 'mein konto',
    'widerrufsrecht', 'widerrufsbelehrung', 'versandinformationen',
    'rückgabe', 'rueckgabe', 'rücksendung',
    'cookie-einstellungen', 'cookie einstellungen',
    // English fallback
    'home', 'homepage', 'about us', 'contact', 'login', 'sign in',
    'cart', 'checkout', 'privacy', 'privacy policy', 'terms',
    'faq', 'help', 'support', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    // German URL paths (user-specified)
    /\/angebote?\b/i, /\/sale\b/i, /\/aktion/i, /\/deals?\b/i,
    /\/gutschein/i, /\/rabatt/i,
    // Extended German paths
    /\/sonderangebot/i, /\/schnaeppchen/i, /\/schnäppchen/i,
    /\/ausverkauf/i, /\/sparpreis/i, /\/aktionspreise/i,
    /\/restposten/i, /\/lagerraeumung/i, /\/tagesangebot/i, /\/wochenangebot/i,
    /\/preishit/i, /\/gratis/i,
    // English paths common on German sites
    /\/offers?\b/i, /\/promo/i, /\/discount/i, /\/specials?\b/i,
    /\/clearance/i, /\/coupons?\b/i, /\/outlet/i, /\/savings?\b/i,
  ],
  nonCampaignUrlPatterns: [
    /\/impressum/i, /\/datenschutz/i, /\/agb\b/i, /\/kontakt/i,
    /\/ueber-uns/i, /\/about\b/i, /\/hilfe/i, /\/help\b/i,
    /\/faq\b/i, /\/karriere/i, /\/presse/i, /\/widerruf/i,
    /\/ruecksendung/i, /\/rueckgabe/i, /\/versand\b/i,
    /\/warranty\b/i, /\/terms\b/i, /\/privacy/i, /\/legal\b/i,
    /\/support\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'kundenservice', 'kundendienst', 'reparaturservice',
    'garantie', 'garantiebedingungen', 'rückrufaktion', 'rueckrufaktion',
    'offizielle webseite', 'offizielle website',
    'unternehmensinfo', 'investor relations', 'pressemitteilung',
    'nachhaltigkeitsbericht', 'umweltschutz',
    // English fallback
    'after sales', 'warranty service', 'recall', 'official website',
    'corporate', 'press release', 'sustainability',
  ],
  listingPageTitlePatterns: [
    /^alle\s*(angebote|aktionen|deals|rabatte|gutscheine)$/i,
    /^(shop\s*)?alle\s*produkte$/i,
    /^(all\s*)?(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/angebote?$/,
    /^\/aktionen?$/,
    /^\/deals?$/,
    /^\/sale$/,
    /^\/gutscheine?$/,
  ],
  homepageCampaignCheck: /angebot|aktion|rabatt|sale|deal|reduziert|spare|gutschein|schnäppchen|sonderangebot|discount|promo|offer/i,
  productTypeRe: /(?:^|\s|[-/])(shampoo|creme\b|serum\b|lotion\b|parfüm|parfum|deodorant|reiniger|maske\b|toner\b|gel\b|lippenstift|rouge|foundation|mascara|eyeliner|puder\b|nagellack|concealer|highlighter|feuchtigkeitscreme|sonnencreme|haarfarbe|zahnpasta|duschgel|handcreme)/i,
  categoryOnlyRe: /^(parfüm|parfum|kosmetik|make-?up|hautpflege|haarpflege|körperpflege|beauty|accessoires|bekleidung|schuhe|taschen|uhren|schmuck|jacken?|mäntel?|mantel|pullover|strickjacken?|kleider?|blusen?|hemden?|hosen?|röcke?|t-?shirts?|shorts|jeans?|denim|schlafanzüge?|bademode|bikini|hoodies?|sweatshirts?|sportbekleidung|unterwäsche|socken|sandalen|stiefel|sneakers?)(\s*[&+und]\s*(bad|pflege|beauty|accessoires|bekleidung))?(\s*[-–—|]\s*.+)?$/i,
  productListingPatterns: [
    /^neue?\s*(kollektion|saison|arrivals?)/i,
    /^(herren|damen|kinder)\s*(bekleidung|schuhe|accessoires)/i,
    /^(men'?s?|women'?s?|kids?)\s*(clothing|shoes|accessories)/i,
    /^shop\s*(herren|damen|kinder|alle)/i,
  ],
};

// UK market keywords (English, same as US with minor additions)
const UK_KEYWORDS: MarketKeywords = {
  ...US_KEYWORDS,
  strongCampaignKeywords: [
    ...US_KEYWORDS.strongCampaignKeywords,
    'voucher', 'vouchers',
  ],
  campaignKeywords: [
    ...US_KEYWORDS.campaignKeywords,
    'bank holiday sale', 'boxing day sale',
    'half term deals', 'january sale', 'summer sale',
    'quid', 'pounds off', '£ off',
  ],
};

// ─── IN (India) Market Keywords ──────────────────────────────
// Indian market uses English + Hindi. Most e-commerce is in English.

const IN_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'deal', 'deals', 'sale', 'offer', 'offers', 'discount', 'promo', 'promotion',
    'coupon', 'coupons', 'clearance', 'campaign', 'cashback',
    // Hindi terms
    'dhamaka', 'mela', 'utsav', 'loot',
  ],
  strongCampaignKeywordsWordBoundary: [
    /₹\s*\d+/,     // "₹999 off" rupee pattern
  ],
  campaignKeywords: [
    // Secondary terms
    'on sale', 'special', 'specials', 'flash sale', 'limited time',
    'price drop', 'doorbuster', 'doorbusters', 'weekly ad',
    "today's deals",
    'save', 'savings', '% off', 'off', 'free shipping', 'free delivery',
    'buy one get one', 'bogo', 'bonus', 'cash back',
    'reward', 'rewards', 'rebate',
    'black friday', 'cyber monday',
    'half price', 'half off', 'extra',
    // India-specific English terms
    'festive sale', 'festive offer', 'big billion', 'great indian',
    'republic day sale', 'independence day sale', 'diwali sale',
    'navratri offer', 'holi sale', 'raksha bandhan offer',
    'ganesh chaturthi', 'onam', 'pongal', 'eid sale',
    'christmas sale', 'new year sale', 'makar sankranti',
    'emi', 'no cost emi', 'exchange offer', 'bank offer',
    'supercoins', 'extra off', 'combo offer', 'mega deal',
    'lowest price', 'best price', 'price slash', 'flat off',
    'steal deal', 'loot deal', 'bumper offer', 'bonanza',
    'price crash', 'lightning deal', 'midnight deal',
    'big saving days', 'end of season sale', 'clearance sale',
    // Hindi terms
    'sasta', 'bachat', 'paisa vasool',
    // Telecom
    'recharge offer', 'prepaid plan', 'postpaid plan', 'data pack',
    'unlimited calls', 'broadband plan', 'fiber plan', 'jio offer',
    // Tech & Software
    'free trial', 'subscription offer', 'app offer', 'premium plan',
    'cloud deal', 'annual plan', 'tech deal',
  ],
  campaignKeywordsWordBoundary: [
    /\bfree\b/i,
    /\bflat\b/i,   // "flat 50% off" — common in India
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    'home', 'homepage', 'about us', 'about', 'contact us', 'contact',
    'login', 'log in', 'sign in', 'sign up', 'register', 'create account',
    'cart', 'my cart', 'shopping cart', 'checkout', 'payment',
    'privacy', 'privacy policy', 'cookie policy', 'cookies',
    'terms', 'terms of service', 'terms and conditions', 'terms of use',
    'faq', 'frequently asked questions', 'help', 'help center', 'support',
    'return policy', 'returns', 'shipping', 'shipping info', 'track order',
    'careers', 'jobs', 'press', 'investor relations', 'sitemap',
    'grievance', 'legal', 'compliance',
  ],
  campaignUrlPatterns: [
    /\/deals?\b/i, /\/sale\b/i, /\/offers?\b/i, /\/promo/i,
    /\/discount/i, /\/campaign/i, /\/specials?\b/i,
    /\/clearance/i, /\/coupons?\b/i, /\/weekly-?ad/i,
    /\/flash-?sale/i, /\/savings?\b/i, /\/outlet/i,
    /\/today/i, /\/bargain/i,
    // India-specific URL patterns
    /\/festive/i, /\/diwali/i, /\/republic-day/i,
    /\/independence-day/i, /\/bank-offer/i, /\/emi\b/i,
    /\/exchange/i, /\/cashback/i, /\/combo/i,
    /\/lightning/i, /\/loot/i, /\/bumper/i, /\/bonanza/i, /\/steal/i,
  ],
  nonCampaignUrlPatterns: [
    /\/warranty\b/i, /\/about\b/i, /\/contact\b/i,
    /\/privacy/i, /\/terms\b/i, /\/legal\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i,
    /\/careers?\b/i, /\/jobs\b/i, /\/press\b/i,
    /\/investor/i, /\/grievance/i, /\/compliance/i,
    /\/sitemap/i, /\/accessibility/i, /\/recycling/i, /\/recall\b/i,
  ],
  nonCampaignTitleKeywords: [
    'after sales', 'warranty service', 'authorized dealer',
    'recall', 'product recall', 'safety notice',
    'official website', 'corporate', 'investor relations',
    'press release', 'careers', 'work with us',
    'grievance officer', 'compliance',
    'recycling program', 'sustainability',
    'pay me on', 'send money', 'transfer money',
    'download the app', 'get the app', 'create account',
  ],
  listingPageTitlePatterns: [
    /^all\s*(deals|offers|sales|promotions|coupons)$/i,
    /^(shop\s*)?all\s*products$/i,
    /^browse\s*(all|our)\s*/i,
  ],
  listingPageUrlPatterns: [
    /^\/deals?$/, /^\/sale$/, /^\/offers?$/, /^\/specials?$/,
  ],
  homepageCampaignCheck: /deal|sale|offer|discount|promo|coupon|special|clearance|save|festive|diwali|cashback/i,
  productTypeRe: /(?:^|\s|[-/])(shampoo|cream\b|serum\b|lotion\b|perfume|deodorant|cleanser|mask\b|toner\b|gel\b|lipstick|blush|foundation|mascara|eyeliner|powder\b|nail\s*polish|concealer|highlighter|moisturizer|sunscreen|hair\s*dye|toothpaste|body\s*wash|hand\s*cream)/i,
  categoryOnlyRe: /^(perfume|cosmetics|makeup|skincare|haircare|bodycare|beauty|accessories|clothing|shoes|bags|watches|jewelry|jackets?|coats?|sweaters?|cardigans?|dresses?|blouses?|shirts?|pants|trousers|skirts?|t-?shirts?|shorts|jeans?|denim|pajamas?|swimwear|bikini|hoodies?|sweatshirts?|activewear|loungewear|outerwear|underwear|lingerie|socks|sandals|boots|sneakers|heels|flats)(\s*[&+and]\s*(bath|care|beauty|accessories|clothing))?(\s*[-–—|]\s*.+)?$/i,
  productListingPatterns: [
    /^new\s*(arrivals?|season|collection)/i,
    /^(men'?s?|women'?s?|kids?)\s*(clothing|shoes|accessories)/i,
    /^shop\s*(men|women|kids|all)/i,
  ],
};

// ─── BR (Brazil) Market Keywords ─────────────────────────────
// Brazilian market uses Portuguese.

const BR_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'oferta', 'ofertas', 'promoção', 'promoçao', 'promocao', 'desconto', 'descontos',
    'liquidação', 'liquidacao', 'cupom', 'cupons', 'imperdível', 'imperdivel',
    'ofertão', 'ofertao',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'clearance', 'offer',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary Portuguese terms
    'promoções', 'voucher', 'frete grátis', 'frete gratis',
    'frete gratuito', 'cashback', 'reembolso',
    'queima de estoque', 'outlet', 'pechincha', 'barganha',
    'economize', 'poupe', 'parcele', 'parcelamento',
    'sem juros', 'à vista', 'a vista', 'pix',
    'compre e ganhe', 'leve 2 pague 1', 'leve 3 pague 2',
    'preço especial', 'preco especial',
    'condições especiais', 'condicoes especiais',
    'últimas unidades', 'ultimas unidades',
    'tempo limitado', 'exclusivo', 'exclusiva',
    'aproveite', 'brinde', 'brindes', 'relâmpago', 'relampago',
    'desconto no pix', 'desconto pix',
    'compre mais pague menos', 'combo', 'kit',
    'vale-compras', 'vale compras',
    'código promocional', 'codigo promocional',
    'melhor preço', 'menor preço',
    'super oferta', 'mega desconto',
    // Brazil-specific campaigns/seasons
    'black friday', 'cyber monday', 'dia do consumidor',
    'dia das mães', 'dia das maes', 'dia dos pais',
    'dia dos namorados', 'natal', 'ano novo', 'carnaval',
    'semana do cliente', 'esquenta', 'mega oferta',
    'dia do frete grátis', 'dia do frete gratis',
    'semana brasil', 'semana do consumidor',
    // English secondary terms
    'off', '% off',
    'flash sale', 'limited', 'special',
    // Telecom
    'plano de celular', 'recarga', 'pacote de dados', 'internet fibra',
    'plano pós-pago', 'plano pré-pago', 'banda larga',
    // Tecnologia & Software
    'teste grátis', 'assinatura', 'plano premium', 'desconto software',
  ],
  campaignKeywordsWordBoundary: [
    /\bgrátis\b/i, /\bgratis\b/i,
    /\bfree\b/i,
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
    /\baté\s+\d+\s*%/i,  // "até 50% off"
    /R\$\s*\d+\s*off\b/i, // "R$ 50 off"
  ],
  blacklistedTitles: [
    // Portuguese
    'página inicial', 'pagina inicial', 'início', 'inicio',
    'sobre nós', 'sobre nos', 'quem somos', 'contato', 'fale conosco',
    'entrar', 'login', 'cadastro', 'criar conta', 'registrar',
    'carrinho', 'meu carrinho', 'finalizar compra', 'pagamento',
    'privacidade', 'política de privacidade', 'politica de privacidade',
    'cookies', 'termos', 'termos de uso', 'termos e condições',
    'perguntas frequentes', 'ajuda', 'central de ajuda', 'suporte',
    'trocas e devoluções', 'devolução', 'rastrear pedido',
    'trabalhe conosco', 'vagas', 'imprensa', 'mapa do site',
    // English fallback
    'home', 'about', 'contact', 'login', 'sign in', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'support', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/ofertas?\b/i, /\/promocao/i, /\/promoção/i, /\/promoc/i,
    /\/descontos?\b/i, /\/liquidacao/i, /\/liquidação/i,
    /\/cupom/i, /\/cupons\b/i, /\/outlet/i,
    /\/queima/i, /\/black-?friday/i, /\/cyber-?monday/i,
    /\/dia-d/i, /\/mega/i, /\/flash/i, /\/relampago/i,
    /\/desconto-?pix/i, /\/cupom-?de-?desconto/i, /\/esquenta/i,
    // English paths
    /\/deals?\b/i, /\/sale\b/i, /\/promo/i, /\/specials?\b/i,
    /\/clearance/i, /\/savings?\b/i,
  ],
  nonCampaignUrlPatterns: [
    /\/sobre\b/i, /\/contato\b/i, /\/fale-conosco/i,
    /\/privacidade/i, /\/termos\b/i, /\/lgpd\b/i,
    /\/ajuda\b/i, /\/perguntas/i, /\/suporte\b/i,
    /\/trabalhe/i, /\/vagas\b/i, /\/imprensa/i,
    /\/mapa-do-site/i, /\/ouvidoria/i,
    // English fallback
    /\/about\b/i, /\/contact\b/i, /\/privacy/i, /\/terms\b/i,
    /\/help\b/i, /\/faq\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'pós-venda', 'pos-venda', 'garantia', 'assistência técnica',
    'assistencia tecnica', 'recall', 'site oficial',
    'institucional', 'relações com investidores',
    'comunicado de imprensa', 'trabalhe conosco',
    'sustentabilidade', 'ouvidoria',
    // English fallback
    'after sales', 'warranty service', 'recall', 'official website',
    'corporate', 'press release', 'sustainability',
    'pay me on', 'send money', 'transfer money',
    'download the app', 'get the app', 'create account',
  ],
  listingPageTitlePatterns: [
    /^todas?\s*(as\s*)?(ofertas|promoções|promoçoes|descontos|cupons)$/i,
    /^(ver\s*)?todos?\s*(os\s*)?produtos$/i,
    /^all\s*(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/ofertas?$/, /^\/promocoes?$/, /^\/descontos?$/,
    /^\/deals?$/, /^\/sale$/,
  ],
  homepageCampaignCheck: /oferta|promoção|promocao|desconto|liquidação|liquidacao|cupom|cashback|deal|sale|promo|queima/i,
  productTypeRe: /(?:^|\s|[-/])(shampoo|cream\b|creme\b|serum\b|sérum\b|lotion\b|loção\b|perfume|desodorante|deodorant|cleanser|limpador|mask\b|máscara\b|toner\b|gel\b|batom|lipstick|blush|base\b|foundation|mascara|rímel|eyeliner|powder\b|pó\b|esmalte|nail\s*polish|concealer|corretivo|highlighter|iluminador|hidratante|moisturizer|protetor\s*solar|sunscreen|tintura|hair\s*dye|pasta\s*de\s*dente|toothpaste|sabonete|body\s*wash|creme\s*para\s*mãos|hand\s*cream)/i,
  categoryOnlyRe: /^(perfume|cosméticos|cosmeticos|maquiagem|makeup|skincare|cuidados|beleza|beauty|acessórios|acessorios|accessories|roupas|clothing|calçados|calcados|shoes|bolsas|bags|relógios|relogios|watches|joias|jewelry|jaquetas?|casacos?|suéteres?|sueteres?|cardigãs?|cardigas?|vestidos?|blusas?|camisas?|calças|calcas|saias?|camisetas?|t-?shirts?|shorts|jeans?|denim|pijamas?|biquíni|biquini|moletons?|cuecas?|calcinhas?|meias|sandálias|sandalias|botas|tênis|tenis)(\s*[&+e]\s*(banho|cuidados|beleza|acessórios|acessorios|roupas))?(\s*[-–—|]\s*.+)?$/i,
  productListingPatterns: [
    /^nov(os?|as?)\s*(chegadas?|coleção|colecao|temporada)/i,
    /^(masculin[oa]|feminin[oa]|infantil)\s*(roupas|calçados|calcados|acessórios|acessorios)/i,
    /^(compre|ver)\s*(masculin|feminin|infantil|tudo|todos)/i,
    /^new\s*(arrivals?|season|collection)/i,
    /^shop\s*(men|women|kids|all)/i,
  ],
};

// ─── ID (Indonesia) Market Keywords ──────────────────────────
// Indonesian market uses Bahasa Indonesia + English.

const ID_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'diskon', 'promo', 'promosi', 'penawaran', 'obral', 'voucher', 'kupon',
    'sale', 'deal', 'deals', 'discount', 'coupon', 'clearance', 'offer', 'campaign',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary Bahasa Indonesia terms
    'penawaran khusus', 'flash sale', 'cashback', 'gratis ongkir',
    'hemat', 'murah', 'potongan harga', 'cicilan', 'cicilan 0%',
    // Indonesian seasonal/events
    'harbolnas', 'ramadan sale', 'lebaran', 'idul fitri',
    'imlek', 'tahun baru',
    // English secondary terms
    '% off', 'off', 'special', 'bonus', 'hadiah', 'reward', 'ekstra',
    // Telekomunikasi
    'paket data', 'kuota internet', 'unlimited', 'prabayar', 'pascabayar',
    'isi ulang', 'internet rumah',
    // Teknologi
    'uji coba gratis', 'langganan', 'paket premium',
  ],
  campaignKeywordsWordBoundary: [
    /\bgratis\b/i,
    /\bfree\b/i,
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    // Bahasa Indonesia
    'beranda', 'tentang kami', 'hubungi kami', 'kontak', 'masuk',
    'daftar', 'buat akun', 'keranjang', 'pembayaran',
    'kebijakan privasi', 'syarat dan ketentuan', 'faq', 'bantuan',
    'pusat bantuan', 'karier', 'lowongan', 'peta situs',
    // English fallback
    'home', 'homepage', 'about', 'contact', 'login', 'sign in',
    'cart', 'checkout', 'privacy', 'terms', 'help', 'support',
    'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/promo/i, /\/diskon/i, /\/penawaran/i, /\/flash-?sale/i,
    /\/voucher/i, /\/kupon/i, /\/obral/i,
    /\/sale\b/i, /\/deals?\b/i, /\/offers?\b/i,
    /\/cashback/i, /\/hemat/i,
  ],
  nonCampaignUrlPatterns: [
    /\/tentang/i, /\/kontak/i, /\/hubungi/i,
    /\/kebijakan/i, /\/syarat/i, /\/bantuan/i,
    /\/faq\b/i, /\/karier/i, /\/lowongan/i,
    /\/about\b/i, /\/contact\b/i, /\/privacy/i,
    /\/terms\b/i, /\/help\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'layanan pelanggan', 'pusat servis', 'garansi', 'penarikan produk',
    'situs resmi', 'hubungan investor', 'siaran pers', 'keberlanjutan',
    'customer service', 'warranty', 'official website', 'corporate',
    'press release',
  ],
  listingPageTitlePatterns: [
    /^semua\s*(promo|penawaran|diskon|deals?|produk)$/i,
    /^(all\s*)?(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/promo$/, /^\/diskon$/, /^\/deals?$/, /^\/sale$/,
  ],
  homepageCampaignCheck: /diskon|promo|penawaran|obral|sale|deal|cashback|voucher|hemat|flash/i,
};

// ─── RU (Russia) Market Keywords ─────────────────────────────
// Russian market uses Russian language.

const RU_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'акция', 'акции', 'скидка', 'скидки', 'распродажа', 'купон', 'купоны', 'промокод',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'clearance', 'offer', 'campaign',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary Russian terms
    'предложение', 'спецпредложение', 'промокоды', 'бесплатная доставка',
    'кешбэк', 'кэшбэк', 'бонус', 'бонусы',
    'выгода', 'экономия', 'подарок', 'рассрочка',
    'беспроцентная рассрочка',
    'скидка дня', 'товар дня', 'суперцена', 'хит продаж',
    // Russian seasonal/events
    'чёрная пятница', 'черная пятница', 'новый год',
    '8 марта', '23 февраля', 'киберпонедельник',
    // Телеком
    'тариф', 'тарифный план', 'безлимитный', 'мобильный интернет',
    'подключение', 'сим-карта', 'оптоволокно',
    // Технологии и ПО
    'бесплатный пробный', 'подписка', 'лицензия', 'облако',
    // English secondary terms
    '% off', 'off',
  ],
  campaignKeywordsWordBoundary: [
    /\bбесплатно\b/i,
    /\bfree\b/i,
    /\d+\s*%/,
    /%\s*\d+/,
  ],
  blacklistedTitles: [
    // Russian
    'главная', 'о нас', 'о компании', 'контакты', 'связаться',
    'войти', 'вход', 'регистрация', 'создать аккаунт',
    'корзина', 'оплата', 'оформление заказа',
    'политика конфиденциальности', 'пользовательское соглашение',
    'условия использования', 'вопросы и ответы',
    'помощь', 'центр помощи', 'служба поддержки',
    'вакансии', 'карьера', 'карта сайта',
    // English fallback
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/aktsii/i, /\/akcii/i, /\/skidki/i, /\/rasprodazha/i,
    /\/promokod/i, /\/kupon/i,
    /\/sale\b/i, /\/deals?\b/i, /\/offers?\b/i,
    /\/promo/i, /\/discount/i, /\/specials?\b/i, /\/bonus/i,
  ],
  nonCampaignUrlPatterns: [
    /\/o-nas/i, /\/kontakty/i, /\/pomoshch/i, /\/pomosch/i,
    /\/vakansii/i, /\/karera/i, /\/usloviya/i, /\/politika/i,
    /\/about\b/i, /\/contact\b/i, /\/privacy/i,
    /\/terms\b/i, /\/help\b/i, /\/faq\b/i,
    /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'служба поддержки', 'гарантийное обслуживание', 'гарантия',
    'отзыв товара', 'официальный сайт', 'пресс-релиз',
    'устойчивое развитие',
    'customer service', 'warranty', 'official website', 'corporate',
    'press release',
  ],
  listingPageTitlePatterns: [
    /^все\s*(акции|скидки|предложения|купоны|промокоды)$/i,
    /^(all\s*)?(deals|offers|sales)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/aktsii$/, /^\/skidki$/, /^\/rasprodazha$/, /^\/deals?$/, /^\/sale$/,
  ],
  homepageCampaignCheck: /акция|скидка|распродажа|промокод|купон|бонус|sale|deal|discount|promo/i,
};

// ─── MX (Mexico) Market Keywords ─────────────────────────────
// Mexican market uses Spanish.

const MX_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'oferta', 'ofertas', 'promoción', 'promocion', 'descuento', 'descuentos',
    'cupón', 'cupon', 'liquidación', 'liquidacion',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'clearance', 'offer', 'campaign',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary Spanish terms
    'promociones', 'cupones', 'envío gratis', 'envio gratis',
    'rebaja', 'rebajas', 'venta', 'venta especial',
    'ahorro', 'meses sin intereses', '2x1', '3x2',
    'cashback', 'bonus', 'precio especial', 'última oportunidad',
    // Mexican seasonal/events
    'hot sale', 'buen fin', 'el buen fin', 'black friday',
    'cyber monday', 'navidad', 'día de reyes', 'dia de reyes',
    // Telecomunicaciones
    'plan de celular', 'recarga', 'paquete de datos', 'fibra óptica',
    'internet ilimitado', 'portabilidad', 'prepago', 'pospago',
    // Tecnología y Software
    'prueba gratuita', 'suscripción', 'plan premium', 'licencia',
    // English secondary terms
    '% off', 'off',
  ],
  campaignKeywordsWordBoundary: [
    /\bgratis\b/i,
    /\bfree\b/i,
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    // Spanish
    'inicio', 'acerca de', 'sobre nosotros', 'contacto', 'contáctanos',
    'iniciar sesión', 'registrarse', 'crear cuenta',
    'carrito', 'pago', 'política de privacidad', 'aviso de privacidad',
    'términos y condiciones', 'preguntas frecuentes', 'ayuda',
    'centro de ayuda', 'empleos', 'bolsa de trabajo', 'mapa del sitio',
    // English fallback
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/ofertas?\b/i, /\/promocion/i, /\/descuento/i, /\/cupon/i,
    /\/rebaja/i, /\/liquidacion/i, /\/venta/i,
    /\/sale\b/i, /\/deals?\b/i, /\/promo/i, /\/discount/i,
    /\/hot-?sale/i, /\/buen-?fin/i, /\/ahorro/i,
  ],
  nonCampaignUrlPatterns: [
    /\/acerca/i, /\/contacto/i, /\/ayuda\b/i,
    /\/aviso/i, /\/privacidad/i, /\/terminos/i,
    /\/empleos/i, /\/bolsa/i,
    /\/about\b/i, /\/contact\b/i, /\/privacy/i,
    /\/terms\b/i, /\/help\b/i, /\/faq\b/i,
    /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'servicio al cliente', 'atención al cliente', 'garantía',
    'retiro de producto', 'sitio oficial', 'relaciones con inversionistas',
    'comunicado de prensa', 'sustentabilidad',
    'customer service', 'warranty', 'official website', 'corporate',
    'press release',
  ],
  listingPageTitlePatterns: [
    /^todas?\s*las?\s*(ofertas|promociones|descuentos|cupones)$/i,
    /^(all\s*)?(deals|offers|sales)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/ofertas?$/, /^\/promociones?$/, /^\/descuentos?$/, /^\/deals?$/, /^\/sale$/,
  ],
  homepageCampaignCheck: /oferta|promoción|promocion|descuento|cupón|cupon|rebaja|sale|deal|discount|promo|ahorro/i,
};

// ─── JP (Japan) Market Keywords ──────────────────────────────
// Japanese market uses Japanese language.

const JP_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'セール', 'キャンペーン', '割引', 'クーポン', '送料無料',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'clearance', 'offer', 'campaign',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary Japanese terms
    'お買い得', '特価', '特別価格', '限定', '期間限定',
    'ポイント', 'ポイントアップ', 'タイムセール', '値下げ',
    '半額', '初売り', '福袋',
    // Japanese seasonal/events
    'ゴールデンウィーク', 'お中元', 'お歳暮',
    'ブラックフライデー', 'サイバーマンデー',
    'アウトレット', '在庫処分', 'バーゲン', 'まとめ買い',
    // 通信
    '料金プラン', 'データ通信', '乗り換え', '格安sim', 'プラン変更',
    '光回線', 'ブロードバンド',
    // テクノロジー
    '無料体験', 'サブスクリプション', 'プレミアムプラン', 'ライセンス',
    // English secondary terms
    '% off', 'off', 'flash sale', 'SALE', 'OFF',
  ],
  campaignKeywordsWordBoundary: [
    /\b無料\b/,
    /\bfree\b/i,
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    // Japanese
    'ホーム', 'トップページ', '会社概要', '会社情報',
    'お問い合わせ', 'ログイン', '新規登録', 'アカウント作成',
    'カート', 'お支払い', 'プライバシーポリシー', '利用規約',
    'よくある質問', 'ヘルプ', 'サポート', '採用情報', '求人',
    'サイトマップ',
    // English fallback
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/sale\b/i, /\/campaign/i, /\/coupon/i, /\/deal/i,
    /\/tokka/i, /\/outlet/i, /\/bargain/i,
    /\/offers?\b/i, /\/promo/i, /\/discount/i,
    /\/specials?\b/i, /\/clearance/i, /\/timesale/i,
  ],
  nonCampaignUrlPatterns: [
    /\/company/i, /\/about\b/i, /\/contact\b/i, /\/inquiry/i,
    /\/privacy/i, /\/terms\b/i, /\/legal\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i,
    /\/careers?\b/i, /\/recruit/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'カスタマーサービス', 'アフターサービス', '保証', 'リコール',
    '公式サイト', 'IR情報', 'プレスリリース', 'サステナビリティ',
    'customer service', 'warranty', 'official website', 'corporate',
    'press release',
  ],
  listingPageTitlePatterns: [
    /^(すべての|全)(セール|キャンペーン|クーポン|割引)$/i,
    /^(all\s*)?(deals|offers|sales)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/sale$/, /^\/campaign$/, /^\/deals?$/, /^\/outlet$/,
  ],
  homepageCampaignCheck: /セール|キャンペーン|割引|クーポン|特価|お買い得|限定|sale|deal|discount|promo|OFF|off/i,
};

// ─── PH (Philippines) Market Keywords ────────────────────────
// Philippine market uses English + Tagalog. Based on US keywords with local additions.

const PH_KEYWORDS: MarketKeywords = {
  ...US_KEYWORDS,
  strongCampaignKeywords: [
    ...US_KEYWORDS.strongCampaignKeywords,
    'voucher', 'diskwento',
  ],
  campaignKeywords: [
    ...US_KEYWORDS.campaignKeywords,
    'GCash', 'PayMaya', 'libreng pagpapadala',
    'benta', 'promo',
    '9.9', '10.10', '11.11', '12.12',
    'payday sale', 'mega sale', 'mid-year sale',
    'anniversary sale', 'Pasko',
  ],
  blacklistedTitles: [
    ...US_KEYWORDS.blacklistedTitles,
    'tahanan', 'tungkol sa amin', 'makipag-ugnayan',
  ],
  campaignUrlPatterns: [
    ...US_KEYWORDS.campaignUrlPatterns,
    /\/voucher/i,
  ],
  homepageCampaignCheck: /deal|sale|offer|discount|promo|coupon|special|clearance|save|voucher|payday|mega/i,
};

// ─── TH (Thailand) Market Keywords ───────────────────────────
// Thai market uses Thai language.

const TH_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'ลดราคา', 'โปรโมชั่น', 'โปรโมชัน', 'ส่วนลด', 'คูปอง', 'ดีล',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'clearance', 'offer', 'campaign',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary Thai terms
    'ส่งฟรี', 'จัดส่งฟรี', 'ราคาพิเศษ', 'Flash Sale',
    'ของแถม', 'เงินคืน', 'แคชแบ็ค', 'คืนเงิน', 'สิทธิพิเศษ',
    'ช้อปดีมีคืน', 'ลดสูงสุด', 'ลดกระหน่ำ', 'โปรดี',
    // Thai seasonal/events
    'สงกรานต์', 'ลอยกระทง', 'ปีใหม่',
    '11.11', '12.12', '9.9', '10.10', 'Black Friday',
    // โทรคมนาคม
    'แพ็กเกจ', 'โปรเน็ต', 'เน็ตไม่อั้น', 'ซิมการ์ด',
    'ย้ายค่าย', 'ไฟเบอร์', 'เติมเงิน',
    // เทคโนโลยี
    'ทดลองใช้ฟรี', 'สมัครสมาชิก', 'แพลนพรีเมียม',
    // English secondary terms
    '% off', 'off', 'cashback', 'voucher',
    'free shipping',
  ],
  campaignKeywordsWordBoundary: [
    /\bฟรี\b/,
    /\bfree\b/i,
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    // Thai
    'หน้าแรก', 'เกี่ยวกับเรา', 'ติดต่อเรา', 'เข้าสู่ระบบ',
    'สมัครสมาชิก', 'ตะกร้าสินค้า', 'ชำระเงิน',
    'นโยบายความเป็นส่วนตัว', 'ข้อกำหนดการใช้งาน',
    'คำถามที่พบบ่อย', 'ช่วยเหลือ', 'ศูนย์ช่วยเหลือ',
    'ร่วมงานกับเรา', 'แผนผังเว็บไซต์',
    // English fallback
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/promotion/i, /\/sale\b/i, /\/deal/i, /\/coupon/i,
    /\/voucher/i, /\/discount/i, /\/offers?\b/i,
    /\/promo/i, /\/specials?\b/i, /\/clearance/i, /\/flash-?sale/i,
  ],
  nonCampaignUrlPatterns: [
    /\/about\b/i, /\/contact\b/i, /\/privacy/i,
    /\/terms\b/i, /\/help\b/i, /\/faq\b/i,
    /\/support\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'บริการลูกค้า', 'ศูนย์บริการ', 'การรับประกัน', 'เรียกคืนสินค้า',
    'เว็บไซต์ทางการ', 'ข่าวประชาสัมพันธ์', 'ความยั่งยืน',
    'customer service', 'warranty', 'official website', 'corporate',
    'press release',
  ],
  listingPageTitlePatterns: [
    /^(ทั้งหมด|รวม)(โปรโมชั่น|ส่วนลด|ดีล|คูปอง)$/,
    /^(all\s*)?(deals|offers|sales)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/promotion$/, /^\/sale$/, /^\/deals?$/, /^\/discount$/,
  ],
  homepageCampaignCheck: /ลดราคา|โปรโมชั่น|ส่วนลด|คูปอง|ดีล|ราคาพิเศษ|sale|deal|discount|promo|voucher|cashback/i,
};

// ─── CA (Canada) Market Keywords ─────────────────────────────
// Canadian market uses English + French. Based on US keywords with French additions.

const CA_KEYWORDS: MarketKeywords = {
  ...US_KEYWORDS,
  strongCampaignKeywords: [
    ...US_KEYWORDS.strongCampaignKeywords,
    'rabais', 'réduction', 'solde',  // French strong terms
  ],
  campaignKeywords: [
    ...US_KEYWORDS.campaignKeywords,
    // French secondary terms
    'aubaine', 'offre spéciale', 'livraison gratuite', 'vente éclair',
  ],
  campaignKeywordsWordBoundary: [
    ...US_KEYWORDS.campaignKeywordsWordBoundary,
    /\bBoxing Day\b/i, /\bCanada Day\b/i, /\bCyber Monday\b/i, /\bVictoria Day\b/i,
  ],
};

// ─── AU (Australia) Market Keywords ──────────────────────────
// Australian market uses English. Based on US keywords with AU-specific additions.

const AU_KEYWORDS: MarketKeywords = {
  ...US_KEYWORDS,
  campaignKeywords: [
    ...US_KEYWORDS.campaignKeywords,
    // Australia-specific terms
    'Click Frenzy', 'Afterpay', 'EOFY', 'end of financial year',
  ],
  campaignKeywordsWordBoundary: [
    ...US_KEYWORDS.campaignKeywordsWordBoundary,
    /\bBoxing Day\b/i, /\bEOFY Sale\b/i, /\bClick Frenzy\b/i, /\bAfterpay Day\b/i,
  ],
};

// ─── FR (France) Market Keywords ─────────────────────────────
// French market uses French language.

const FR_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'soldes', 'promotion', 'réduction', 'rabais', 'offre', 'promo', 'remise',
    'sale', 'deal', 'discount', 'coupon', 'clearance', 'offer', 'campaign',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary French terms
    'bon plan', 'code promo', 'livraison gratuite', 'cashback',
    'vente flash', 'déstockage', 'prix cassé', 'braderie',
    'destockage', 'affaire', 'bons plans', 'réductions',
    'offre spéciale', 'offre exclusive', 'code de réduction',
    'bon de réduction', 'vente privée', 'outlet',
    // English secondary terms
    'free shipping',
    // Télécom
    'forfait mobile', 'offre box', 'fibre optique', 'forfait internet',
    'renouvellement', 'carte sim', 'data illimité',
    // Technologie & Logiciels
    'essai gratuit', 'abonnement', 'plan premium', 'licence',
  ],
  campaignKeywordsWordBoundary: [
    /\bsoldes d'hiver\b/i, /\bsoldes d'été\b/i,
    /\bfrench days\b/i, /\bblack friday\b/i, /\bcyber monday\b/i,
    /\bnoël\b/i, /\bjours flash\b/i,
    /\bfree\b/i,
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    // French
    'politique de confidentialité', 'conditions générales', 'mentions légales',
    'à propos', 'contactez-nous', 'cookies', 'error 404', 'page introuvable',
    'access denied',
    // French navigation/info pages
    'accueil', 'mon compte', 'panier', 'connexion', 'inscription',
    'créer un compte', 'paiement', 'aide', 'centre d\'aide',
    'faq', 'questions fréquentes', 'plan du site',
    'retours', 'politique de retour', 'livraison', 'suivi de commande',
    'carrières', 'recrutement', 'presse', 'investisseurs',
    // English fallback
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'help', 'support', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/soldes\b/i, /\/promotion/i, /\/promo/i, /\/offres?\b/i,
    /\/remise/i, /\/destockage/i, /\/vente-?flash/i,
    /\/bon-?plan/i, /\/bons-?plans/i, /\/code-?promo/i,
    /\/vente-?privee/i, /\/braderie/i, /\/outlet/i,
    // English paths
    /\/deals?\b/i, /\/sale\b/i, /\/discount/i, /\/specials?\b/i,
    /\/clearance/i, /\/coupons?\b/i, /\/savings?\b/i,
  ],
  nonCampaignUrlPatterns: [
    /\/a-propos/i, /\/contact\b/i, /\/aide\b/i,
    /\/mentions-legales/i, /\/confidentialite/i, /\/cgv\b/i,
    /\/cgu\b/i, /\/faq\b/i, /\/recrutement/i, /\/carrieres/i,
    /\/presse\b/i, /\/plan-du-site/i,
    // English fallback
    /\/about\b/i, /\/privacy/i, /\/terms\b/i, /\/legal\b/i,
    /\/help\b/i, /\/support\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'service client', 'service après-vente', 'garantie',
    'rappel de produit', 'site officiel', 'relations investisseurs',
    'communiqué de presse', 'développement durable',
    // English fallback
    'after sales', 'warranty service', 'recall', 'official website',
    'corporate', 'press release', 'sustainability',
  ],
  listingPageTitlePatterns: [
    /^(toutes?\s*les?\s*)?(soldes|promotions|offres|réductions|bons?\s*plans?)$/i,
    /^(tous?\s*les?\s*)?produits$/i,
    /^(all\s*)?(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/soldes?$/, /^\/promotions?$/, /^\/offres?$/,
    /^\/bons?-?plans?$/, /^\/deals?$/, /^\/sale$/,
  ],
  homepageCampaignCheck: /soldes|promotion|réduction|rabais|offre|remise|promo|destockage|vente\s*flash|bon\s*plan|deal|sale|discount/i,
  productTypeRe: /(?:^|\s|[-/])(shampooing|crème\b|creme\b|sérum\b|serum\b|lotion\b|parfum|déodorant|deodorant|nettoyant|masque\b|tonique\b|gel\b|rouge\s*à\s*lèvres|blush|fond\s*de\s*teint|mascara|eyeliner|poudre\b|vernis|correcteur|enlumineur|hydratant|crème\s*solaire|coloration|dentifrice|gel\s*douche|crème\s*mains)/i,
  categoryOnlyRe: /^(parfum|cosmétiques|cosmetiques|maquillage|soin|soins|beauté|beaute|accessoires|vêtements|vetements|chaussures|sacs|montres|bijoux|vestes?|manteaux?|pulls?|gilets?|robes?|chemises?|chemisiers?|pantalons?|jupes?|t-?shirts?|shorts|jeans?|denim|pyjamas?|maillots?\s*de\s*bain|bikini|sweat-?shirts?|sous-?vêtements?|chaussettes|sandales|bottes|baskets)(\s*[&+et]\s*(bain|soin|beauté|beaute|accessoires|vêtements|vetements))?(\s*[-–—|]\s*.+)?$/i,
  productListingPatterns: [
    /^nouvelles?\s*(arrivées?|collection|saison)/i,
    /^(homme|femme|enfant)s?\s*(vêtements|vetements|chaussures|accessoires)/i,
    /^(shop|boutique)\s*(homme|femme|enfant|tout)/i,
    /^new\s*(arrivals?|season|collection)/i,
  ],
};

// ─── IT (Italy) Market Keywords ──────────────────────────────
// Italian market uses Italian language.

const IT_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'offerta', 'offerte', 'promozione', 'sconto', 'sconti', 'saldi', 'coupon', 'promo',
    'sale', 'deal', 'discount', 'clearance', 'offer', 'campaign',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    // Secondary Italian terms
    'svendita', 'codice sconto', 'spedizione gratuita', 'cashback',
    'affare', 'occasione', 'sottocosto', 'fuori tutto', 'outlet',
    'promozioni', 'risparmia', 'gratis', 'omaggio', 'buono sconto', 'volantino',
    // Telecomunicazioni
    'piano tariffario', 'offerta mobile', 'fibra ottica', 'sim card',
    'internet illimitato', 'ricarica', 'portabilità',
    // Tecnologia e Software
    'prova gratuita', 'abbonamento', 'piano premium', 'licenza',
    // English secondary terms
    'free shipping',
  ],
  campaignKeywordsWordBoundary: [
    /\bsaldi invernali\b/i, /\bsaldi estivi\b/i,
    /\bblack friday\b/i, /\bcyber monday\b/i,
    /\bnatale\b/i, /\bpasqua\b/i, /\bsan valentino\b/i,
    /\bfree\b/i,
    /\d+\s*%/,      // "20%" contextual discount
    /%\s*\d+/,      // "%20" style
  ],
  blacklistedTitles: [
    // Italian
    'informativa sulla privacy', 'termini e condizioni', 'chi siamo',
    'contattaci', 'cookie policy', 'error 404', 'pagina non trovata',
    'access denied',
    // Italian navigation/info pages
    'home', 'il mio account', 'carrello', 'accedi', 'registrati',
    'crea account', 'pagamento', 'aiuto', 'centro assistenza',
    'faq', 'domande frequenti', 'mappa del sito',
    'resi', 'politica di reso', 'spedizione', 'traccia ordine',
    'lavora con noi', 'stampa', 'investitori',
    // English fallback
    'homepage', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'help', 'support', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/offert[ae]\b/i, /\/promozioni?\b/i, /\/sconti?\b/i,
    /\/saldi\b/i, /\/svendita/i, /\/outlet/i,
    /\/codice-?sconto/i, /\/sottocosto/i, /\/fuori-?tutto/i,
    /\/volantino/i, /\/occasioni?\b/i,
    // English paths
    /\/deals?\b/i, /\/sale\b/i, /\/promo/i, /\/discount/i,
    /\/specials?\b/i, /\/clearance/i, /\/coupons?\b/i, /\/savings?\b/i,
  ],
  nonCampaignUrlPatterns: [
    /\/chi-siamo/i, /\/contatti?\b/i, /\/aiuto\b/i,
    /\/informativa/i, /\/privacy/i, /\/termini/i,
    /\/condizioni/i, /\/faq\b/i, /\/lavora-con-noi/i,
    /\/stampa\b/i, /\/mappa-del-sito/i,
    // English fallback
    /\/about\b/i, /\/contact\b/i, /\/terms\b/i, /\/legal\b/i,
    /\/help\b/i, /\/support\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'servizio clienti', 'assistenza clienti', 'garanzia',
    'richiamo prodotto', 'sito ufficiale', 'relazioni con investitori',
    'comunicato stampa', 'sostenibilità',
    // English fallback
    'after sales', 'warranty service', 'recall', 'official website',
    'corporate', 'press release', 'sustainability',
  ],
  listingPageTitlePatterns: [
    /^(tutt[ei]\s*l[ea]\s*)?(offerte|promozioni|sconti|saldi|occasioni)$/i,
    /^(tutti?\s*i?\s*)?prodotti$/i,
    /^(all\s*)?(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/offerte?$/, /^\/promozioni?$/, /^\/sconti?$/,
    /^\/saldi$/, /^\/deals?$/, /^\/sale$/,
  ],
  homepageCampaignCheck: /offerta|promozione|sconto|saldi|svendita|promo|outlet|sottocosto|fuori\s*tutto|deal|sale|discount/i,
  productTypeRe: /(?:^|\s|[-/])(shampoo|crema\b|siero\b|lozione\b|profumo|deodorante|detergente|maschera\b|tonico\b|gel\b|rossetto|fard|fondotinta|mascara|eyeliner|cipria\b|smalto|correttore|illuminante|idratante|crema\s*solare|tinta|dentifricio|bagnoschiuma|crema\s*mani)/i,
  categoryOnlyRe: /^(profumo|cosmetici|trucco|makeup|skincare|cura|bellezza|beauty|accessori|abbigliamento|scarpe|borse|orologi|gioielli|giacche?|cappotti?|maglion[ie]|cardigan|vestit[io]|camici[ae]|pantalon[ie]|gonn[ae]|t-?shirt|shorts|jeans?|denim|pigiami?|costum[ie]\s*da\s*bagno|bikini|felp[ae]|intimo|biancheria|calzini|sandali|stivali|sneakers?)(\s*[&+e]\s*(bagno|cura|bellezza|accessori|abbigliamento))?(\s*[-–—|]\s*.+)?$/i,
  productListingPatterns: [
    /^nuov[ieao]\s*(arrivi|collezione|stagione)/i,
    /^(uomo|donna|bambin[oi])\s*(abbigliamento|scarpe|accessori)/i,
    /^(shop|negozio)\s*(uomo|donna|bambin[oi]|tutto|tutti)/i,
    /^new\s*(arrivals?|season|collection)/i,
  ],
};

// ─── ES Market Keywords (Spain - Spanish) ────────────────────

const ES_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'oferta', 'ofertas', 'promoción', 'promocion', 'descuento', 'descuentos',
    'cupón', 'cupon', 'rebajas', 'rebaja', 'liquidación', 'liquidacion',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'clearance', 'offer', 'campaign',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'promociones', 'cupones', 'envío gratis', 'envio gratis',
    'cashback', 'precio especial', 'precio reducido', 'saldo', 'saldos',
    'cheque regalo', 'código descuento', 'codigo descuento',
    'ahorro', 'sin intereses', '2x1', '3x2',
    'rebajas de verano', 'rebajas de invierno', 'rebajas enero',
    'black friday', 'cyber monday', 'día sin iva', 'dia sin iva',
    'navidad', 'día de reyes', 'dia de reyes', 'semana santa',
    '% off', 'off', 'special', 'bonus',
  ],
  campaignKeywordsWordBoundary: [
    /\bgratis\b/i, /\bfree\b/i,
    /\d+\s*%/, /%\s*\d+/,
  ],
  blacklistedTitles: [
    'inicio', 'página de inicio', 'sobre nosotros', 'quiénes somos', 'contacto',
    'iniciar sesión', 'registrarse', 'crear cuenta', 'mi cuenta',
    'carrito', 'cesta', 'proceso de pago', 'pago',
    'política de privacidad', 'aviso legal', 'términos y condiciones',
    'preguntas frecuentes', 'ayuda', 'centro de ayuda', 'atención al cliente',
    'devoluciones', 'seguimiento de pedido',
    'trabaja con nosotros', 'empleo', 'mapa del sitio',
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/ofertas?\b/i, /\/promocion/i, /\/descuento/i,
    /\/rebaja/i, /\/rebajas/i, /\/liquidaci[oó]n/i, /\/saldo/i, /\/saldos/i,
    /\/cup[oó]n/i, /\/outlet/i, /\/venta\b/i,
    /\/deals?\b/i, /\/sale\b/i, /\/promo/i, /\/discount/i, /\/clearance/i,
    /\/ahorro/i, /\/flash/i,
  ],
  nonCampaignUrlPatterns: [
    /\/sobre\b/i, /\/contacto\b/i, /\/aviso-legal/i,
    /\/privacidad/i, /\/terminos\b/i, /\/condiciones/i,
    /\/ayuda\b/i, /\/faq\b/i, /\/atencion/i,
    /\/about\b/i, /\/contact\b/i, /\/privacy/i, /\/terms\b/i,
    /\/help\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'servicio postventa', 'servicio técnico', 'garantía',
    'aviso legal', 'sitio oficial',
    'after sales', 'warranty service', 'official website',
  ],
  listingPageTitlePatterns: [
    /^todas?\s*(las\s*)?(ofertas|promociones|descuentos|cupones)$/i,
    /^all\s*(deals|offers|sales)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/ofertas?$/, /^\/promociones?$/, /^\/descuentos?$/, /^\/rebajas?$/,
    /^\/deals?$/, /^\/sale$/,
  ],
  homepageCampaignCheck: /oferta|promoci[oó]n|descuento|rebaja|liquidaci[oó]n|cup[oó]n|cashback|deal|sale|promo|outlet|saldo/i,
};

// ─── AR Market Keywords (Argentina - Spanish, extends ES) ────

const AR_KEYWORDS: MarketKeywords = {
  ...ES_KEYWORDS,
  campaignKeywords: [
    ...ES_KEYWORDS.campaignKeywords,
    'hot sale', 'cybermonday', 'cyber monday', 'día de la madre', 'dia de la madre',
    'día del padre', 'dia del padre', 'día del amor', 'dia del amor',
    'cuotas sin interés', 'cuotas sin interes', 'cuotas',
  ],
  campaignKeywordsWordBoundary: [
    ...ES_KEYWORDS.campaignKeywordsWordBoundary,
    /\$\s*\d+\s*off\b/i,
  ],
  homepageCampaignCheck: /oferta|promoci[oó]n|descuento|rebaja|cup[oó]n|hot.?sale|cybermonday|cashback|sale|promo|cuotas/i,
};

// ─── EG Market Keywords (Egypt - Arabic) ─────────────────────

const EG_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'عروض', 'عرض', 'تخفيضات', 'تخفيض', 'خصم', 'خصومات', 'كوبون', 'كوبونات',
    'أوكازيون', 'تنزيلات',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'offer', 'offers', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'شحن مجاني', 'توصيل مجاني', 'كاش باك', 'نقاط',
    'سعر خاص', 'عرض خاص', 'عرض محدود', 'عرض لفترة محدودة',
    'اشتر وفر', 'وفر', 'ادخر', 'تسوق',
    'رمضان', 'عيد', 'نهاية الموسم', 'تخفيضات الصيف', 'تخفيضات الشتاء',
    'جمعة البيضاء', 'الجمعة البيضاء',
    'بلاك فرايداي', 'سايبر مانداي',
    'black friday', 'cyber monday',
    // اتصالات
    'باقة', 'باقات', 'باقة بيانات', 'إنترنت لا محدود', 'شريحة',
    'فايبر', 'نقل رقم',
    // تقنية
    'تجربة مجانية', 'اشتراك', 'خطة بريميوم', 'ترخيص',
    '% off', 'off', 'free shipping',
  ],
  campaignKeywordsWordBoundary: [
    /\d+\s*%/, /%\s*\d+/,
  ],
  blacklistedTitles: [
    'الرئيسية', 'الصفحة الرئيسية', 'من نحن', 'اتصل بنا', 'تواصل معنا',
    'تسجيل الدخول', 'إنشاء حساب', 'سجل الآن',
    'سلة التسوق', 'الدفع', 'إتمام الشراء',
    'سياسة الخصوصية', 'الشروط والأحكام', 'سياسة الاستخدام',
    'الأسئلة الشائعة', 'مساعدة', 'الدعم', 'خدمة العملاء',
    'سياسة الإرجاع', 'تتبع الطلب',
    'وظائف', 'انضم إلينا', 'خريطة الموقع',
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/offers?\b/i, /\/deals?\b/i, /\/sale\b/i, /\/promo/i, /\/discount/i,
    /\/coupon/i, /\/clearance/i, /\/outlet/i,
    /\/ar\/offers?/i, /\/ar\/deals?/i,
    /\/ramadan/i, /\/eid/i, /\/white-friday/i, /\/friday/i,
  ],
  nonCampaignUrlPatterns: [
    /\/about\b/i, /\/contact\b/i, /\/privacy/i, /\/terms\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i, /\/careers?\b/i,
    /\/sitemap/i, /\/legal\b/i,
  ],
  nonCampaignTitleKeywords: [
    'خدمة ما بعد البيع', 'الضمان', 'استدعاء المنتج',
    'الموقع الرسمي', 'عن الشركة',
    'after sales', 'warranty', 'recall', 'official website', 'corporate',
  ],
  listingPageTitlePatterns: [
    /^كل\s*(العروض|التخفيضات|الكوبونات)$/i,
    /^all\s*(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/offers?$/, /^\/deals?$/, /^\/sale$/, /^\/promo$/,
  ],
  homepageCampaignCheck: /عروض|تخفيضات|خصم|كوبون|أوكازيون|offer|deal|sale|discount|promo|ramadan|eid|friday/i,
};

// ─── SA Market Keywords (Saudi Arabia - Arabic, extends EG) ──

const SA_KEYWORDS: MarketKeywords = {
  ...EG_KEYWORDS,
  campaignKeywords: [
    ...EG_KEYWORDS.campaignKeywords,
    'وايت فرايداي', 'الوايت فرايداي',
    'اليوم الوطني', 'اليوم الوطني السعودي',
    'موسم الرياض', 'موسم جدة',
  ],
  homepageCampaignCheck: /عروض|تخفيضات|خصم|كوبون|أوكازيون|وايت|offer|deal|sale|discount|promo|friday|ramadan|eid|national/i,
};

// ─── KR Market Keywords (South Korea - Korean) ──────────────

const KR_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    '세일', '할인', '특가', '쿠폰', '프로모션', '이벤트', '혜택',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'offer', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    '무료배송', '포인트 적립', '타임세일', '기간 한정',
    '특별 할인', '최저가', '품절 임박', '구매 혜택',
    '1+1', '2+1', '증정', '선물',
    '캐시백', '적립금', '쿠폰 다운로드',
    '블랙 프라이데이', '사이버 먼데이', '설날 세일', '추석 세일',
    '어버이날 선물', '크리스마스 세일', '연말 세일',
    '블프', '빼빼로데이',
    // 통신
    '요금제', '데이터 무제한', '알뜰폰', '번호이동', '인터넷 결합',
    '유심', '기기변경',
    // 기술·소프트웨어
    '무료 체험', '구독', '프리미엄 플랜', '라이선스',
    '% off', 'off', 'flash sale', 'limited time', 'black friday', 'cyber monday',
  ],
  campaignKeywordsWordBoundary: [
    /\d+\s*%/, /%\s*\d+/,
  ],
  blacklistedTitles: [
    '홈', '홈페이지', '회사소개', '소개', '문의하기', '연락처',
    '로그인', '회원가입', '계정 만들기',
    '장바구니', '결제', '주문 완료',
    '개인정보처리방침', '이용약관', '쿠키 정책',
    '자주 묻는 질문', '고객센터', '도움말',
    '반품정책', '교환 및 반품', '주문 조회',
    '채용', '인재채용', '사이트맵',
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/sale\b/i, /\/deals?\b/i, /\/event\b/i, /\/promo/i, /\/discount/i,
    /\/coupon/i, /\/offer/i, /\/specials?\b/i, /\/clearance/i, /\/outlet/i,
  ],
  nonCampaignUrlPatterns: [
    /\/about\b/i, /\/contact\b/i, /\/privacy/i, /\/terms\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i, /\/careers?\b/i,
    /\/sitemap/i, /\/legal\b/i,
  ],
  nonCampaignTitleKeywords: [
    'AS 서비스', '품질 보증', '고객센터', '리콜',
    '공식 웹사이트', '기업 소개', '채용 공고',
    'after sales', 'warranty', 'recall', 'official website',
  ],
  listingPageTitlePatterns: [
    /^전체\s*(세일|할인|이벤트|쿠폰)$/i,
    /^all\s*(deals|offers|sales|events)$/i,
  ],
  listingPageUrlPatterns: [
    /^\/sale$/, /^\/deals?$/, /^\/event$/, /^\/promo$/, /^\/coupon$/,
  ],
  homepageCampaignCheck: /세일|할인|특가|쿠폰|프로모션|이벤트|혜택|sale|deal|discount|promo|coupon|offer/i,
};

const AE_KEYWORDS: MarketKeywords = {
  ...EG_KEYWORDS,
  campaignKeywords: [
    ...EG_KEYWORDS.campaignKeywords,
    'مهرجان دبي للتسوق', 'دبي سمر سربرايز',
    'وايت فرايداي', 'الوايت فرايداي',
    'يلو فرايداي',
  ],
  homepageCampaignCheck: /عروض|تخفيضات|خصم|كوبون|أوكازيون|وايت|offer|deal|sale|discount|promo|friday|ramadan|eid|festival/i,
};

const VN_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'khuyến mãi', 'giảm giá', 'ưu đãi', 'sale', 'deal', 'flash sale',
    'coupon', 'mã giảm giá', 'voucher',
    'deals', 'discount', 'promo', 'offer', 'offers', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'miễn phí vận chuyển', 'freeship', 'hoàn tiền', 'cashback',
    'giá sốc', 'giá tốt', 'siêu giảm', 'đại hạ giá',
    'mua 1 tặng 1', 'combo', 'quà tặng',
    'black friday', 'cyber monday', 'ngày đôi', 'ngày vàng',
    '11.11', '12.12', 'tết', 'lễ',
    // Viễn thông
    'gói cước', 'nạp tiền', 'data không giới hạn', 'chuyển mạng',
    'sim số đẹp', 'internet cáp quang',
    // Công nghệ
    'dùng thử miễn phí', 'đăng ký', 'gói premium',
    '% off', 'off', 'free shipping',
  ],
  campaignKeywordsWordBoundary: [/\d+\s*%/, /%\s*\d+/],
  blacklistedTitles: [
    'trang chủ', 'giới thiệu', 'liên hệ', 'đăng nhập', 'đăng ký',
    'giỏ hàng', 'thanh toán', 'chính sách bảo mật', 'điều khoản',
    'câu hỏi thường gặp', 'hỗ trợ', 'tuyển dụng', 'sơ đồ trang',
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/khuyen-mai\b/i, /\/giam-gia\b/i, /\/uu-dai\b/i,
    /\/sale\b/i, /\/deals?\b/i, /\/promo/i, /\/discount/i,
    /\/flash-sale/i, /\/voucher/i, /\/coupon/i,
  ],
  nonCampaignUrlPatterns: [
    /\/gioi-thieu\b/i, /\/lien-he\b/i, /\/about\b/i, /\/contact\b/i,
    /\/privacy/i, /\/terms\b/i, /\/help\b/i, /\/faq\b/i,
    /\/support\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'chính sách bảo hành', 'bảo hành', 'dịch vụ sau bán hàng',
    'trang chính thức', 'giới thiệu công ty',
    'after sales', 'warranty', 'recall', 'official website',
  ],
  listingPageTitlePatterns: [
    /^tất cả\s*(khuyến mãi|ưu đãi|giảm giá)$/i,
    /^all\s*(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [/^\/khuyen-mai$/, /^\/sale$/, /^\/deals?$/, /^\/promo$/],
  homepageCampaignCheck: /khuyến mãi|giảm giá|ưu đãi|sale|deal|discount|promo|voucher|flash/i,
};

const PL_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'promocja', 'wyprzedaż', 'rabat', 'okazja', 'zniżka', 'kupon',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'offer', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'darmowa dostawa', 'cashback', 'zwrot gotówki',
    'cena specjalna', 'okazja dnia', 'ostatnie sztuki',
    'kup teraz', 'oszczędź', 'taniej',
    'black friday', 'cyber monday', 'dzień kobiet', 'dzień matki',
    'mikołajki', 'święta', 'wyprzedaż sezonowa',
    // Telekomunikacja
    'plan taryfowy', 'abonament', 'internet mobilny', 'światłowód',
    'przeniesienie numeru', 'karta sim', 'pakiet danych',
    // Technologia
    'darmowy okres próbny', 'subskrypcja', 'plan premium', 'licencja',
    '% off', 'off', 'free shipping', 'gratis',
  ],
  campaignKeywordsWordBoundary: [/\d+\s*%/, /%\s*\d+/],
  blacklistedTitles: [
    'strona główna', 'o nas', 'kontakt', 'logowanie', 'rejestracja',
    'koszyk', 'płatność', 'polityka prywatności', 'regulamin',
    'faq', 'pomoc', 'kariera', 'mapa strony',
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/promocje\b/i, /\/wyprzedaz\b/i, /\/okazje\b/i, /\/rabaty\b/i,
    /\/sale\b/i, /\/deals?\b/i, /\/promo/i, /\/discount/i,
    /\/kupon/i, /\/outlet\b/i,
  ],
  nonCampaignUrlPatterns: [
    /\/o-nas\b/i, /\/kontakt\b/i, /\/about\b/i, /\/contact\b/i,
    /\/privacy/i, /\/terms\b/i, /\/regulamin\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i, /\/kariera\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'serwis posprzedażowy', 'gwarancja', 'reklamacja',
    'oficjalna strona', 'o firmie',
    'after sales', 'warranty', 'recall', 'official website',
  ],
  listingPageTitlePatterns: [
    /^wszystkie\s*(promocje|okazje|rabaty|wyprzedaże)$/i,
    /^all\s*(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [/^\/promocje$/, /^\/sale$/, /^\/deals?$/, /^\/okazje$/],
  homepageCampaignCheck: /promocja|wyprzedaż|rabat|okazja|zniżka|kupon|sale|deal|discount|promo|coupon/i,
};

const MY_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'jualan', 'diskaun', 'promosi', 'tawaran', 'kupon',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'offer', 'offers', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'penghantaran percuma', 'free shipping', 'cashback',
    'harga istimewa', 'tawaran istimewa', 'tawaran terhad',
    'beli 1 percuma 1', 'hadiah percuma',
    'hari raya', 'merdeka', 'malaysia day',
    'black friday', 'cyber monday', '11.11', '12.12',
    // Telekomunikasi
    'pelan data', 'internet tanpa had', 'prepaid', 'postpaid',
    'tukar nombor', 'jalur lebar',
    // Teknologi
    'percubaan percuma', 'langganan', 'pelan premium',
    '% off', 'off', 'voucher',
  ],
  campaignKeywordsWordBoundary: [/\d+\s*%/, /%\s*\d+/],
  blacklistedTitles: [
    'laman utama', 'tentang kami', 'hubungi kami', 'log masuk', 'daftar',
    'troli', 'pembayaran', 'dasar privasi', 'terma',
    'soalan lazim', 'bantuan', 'kerjaya', 'peta laman',
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/jualan\b/i, /\/promosi\b/i, /\/tawaran\b/i,
    /\/sale\b/i, /\/deals?\b/i, /\/promo/i, /\/discount/i,
    /\/coupon/i, /\/voucher/i, /\/offers?\b/i, /\/clearance/i,
  ],
  nonCampaignUrlPatterns: [
    /\/tentang\b/i, /\/hubungi\b/i, /\/about\b/i, /\/contact\b/i,
    /\/privacy/i, /\/terms\b/i, /\/help\b/i, /\/faq\b/i,
    /\/support\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'perkhidmatan selepas jualan', 'waranti', 'jaminan',
    'laman web rasmi', 'tentang syarikat',
    'after sales', 'warranty', 'recall', 'official website',
  ],
  listingPageTitlePatterns: [
    /^semua\s*(jualan|tawaran|promosi|diskaun)$/i,
    /^all\s*(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [/^\/jualan$/, /^\/sale$/, /^\/deals?$/, /^\/promo$/],
  homepageCampaignCheck: /jualan|diskaun|promosi|tawaran|kupon|sale|deal|discount|promo|coupon|offer/i,
};

const CO_KEYWORDS: MarketKeywords = {
  ...ES_KEYWORDS,
  campaignKeywords: [
    ...ES_KEYWORDS.campaignKeywords,
    'día sin iva', 'dia sin iva', 'cyberlunes', 'hot sale',
    'día de la madre', 'dia de la madre', 'amor y amistad',
    'cuotas sin interés', 'cuotas sin interes',
  ],
  homepageCampaignCheck: /oferta|promoci[oó]n|descuento|rebaja|cup[oó]n|hot.?sale|cyberlunes|cashback|sale|promo|iva/i,
};

const ZA_KEYWORDS: MarketKeywords = {
  ...US_KEYWORDS,
  campaignKeywords: [
    ...US_KEYWORDS.campaignKeywords,
    'black friday south africa', 'cyber monday sa',
    'heritage day', 'youth day sale',
  ],
  homepageCampaignCheck: /sale|deal|discount|offer|promo|coupon|clearance|special|bargain|cashback|friday|cyber/i,
};

const PT_MARKET_KEYWORDS: MarketKeywords = {
  ...BR_KEYWORDS,
  campaignKeywords: [
    ...BR_KEYWORDS.campaignKeywords,
    'saldos', 'promoções', 'portes grátis',
    'dia do consumidor', 'black friday portugal',
  ],
  homepageCampaignCheck: /promo[çc][ãa]o|desconto|oferta|cupom|cupon|saldo|liquidação|sale|deal|discount|promo|coupon|cashback/i,
};

const NL_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'aanbieding', 'korting', 'uitverkoop', 'actie', 'deal',
    'sale', 'deals', 'discount', 'promo', 'coupon', 'offer', 'offers', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'gratis verzending', 'cashback', 'kortingscode', 'kortingsbon',
    'speciale aanbieding', 'dagaanbieding', 'weekaanbieding',
    'op is op', 'laatste kans', 'tijdelijke actie',
    'black friday', 'cyber monday', 'koningsdag', 'sinterklaas',
    // Telecom
    'abonnement', 'mobiel internet', 'onbeperkt data', 'glasvezel',
    'overstappen', 'sim-only', 'bundel',
    // Technologie
    'gratis proefperiode', 'abonnement', 'premium plan', 'licentie',
    '% off', 'off', 'gratis',
  ],
  campaignKeywordsWordBoundary: [/\d+\s*%/, /%\s*\d+/],
  blacklistedTitles: [
    'home', 'over ons', 'contact', 'inloggen', 'registreren',
    'winkelwagen', 'betalen', 'privacybeleid', 'voorwaarden',
    'veelgestelde vragen', 'help', 'vacatures', 'sitemap',
    'about', 'login', 'cart', 'checkout', 'privacy', 'terms',
    'faq', 'careers',
  ],
  campaignUrlPatterns: [
    /\/aanbiedingen\b/i, /\/korting\b/i, /\/uitverkoop\b/i, /\/actie\b/i,
    /\/sale\b/i, /\/deals?\b/i, /\/promo/i, /\/discount/i,
    /\/coupon/i, /\/outlet\b/i,
  ],
  nonCampaignUrlPatterns: [
    /\/over-ons\b/i, /\/contact\b/i, /\/about\b/i,
    /\/privacy/i, /\/terms\b/i, /\/voorwaarden\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i, /\/vacatures\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'klantenservice', 'garantie', 'retourbeleid',
    'officiële website', 'over het bedrijf',
    'after sales', 'warranty', 'recall', 'official website',
  ],
  listingPageTitlePatterns: [
    /^alle\s*(aanbiedingen|kortingen|acties|deals)$/i,
    /^all\s*(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [/^\/aanbiedingen$/, /^\/sale$/, /^\/deals?$/, /^\/actie$/],
  homepageCampaignCheck: /aanbieding|korting|uitverkoop|actie|deal|sale|discount|promo|coupon|offer/i,
};

const PK_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'سیل', 'ڈسکاؤنٹ', 'آفر', 'پروموشن', 'کوپن',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'offer', 'offers', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'مفت ڈیلیوری', 'فری شپنگ', 'کیش بیک',
    'خاص قیمت', 'خاص آفر', 'محدود آفر',
    'ایک خریدیں ایک مفت', 'تحفہ',
    'رمضان', 'عید', 'جشن آزادی', 'یوم پاکستان',
    'black friday', 'cyber monday',
    // ٹیلی کام
    'ڈیٹا پیکج', 'موبائل پیکج', 'انٹرنیٹ پیکج', 'بنڈل آفر',
    // ٹیکنالوجی
    'مفت ٹرائل', 'سبسکرپشن', 'پریمیم پلان',
    '% off', 'off', 'free shipping', 'free delivery',
  ],
  campaignKeywordsWordBoundary: [/\d+\s*%/, /%\s*\d+/],
  blacklistedTitles: [
    'ہوم', 'ہمارے بارے میں', 'رابطہ', 'لاگ ان', 'رجسٹر',
    'کارٹ', 'چیک آؤٹ', 'رازداری کی پالیسی', 'شرائط',
    'عمومی سوالات', 'مدد', 'ملازمتیں',
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/sale\b/i, /\/deals?\b/i, /\/promo/i, /\/discount/i,
    /\/coupon/i, /\/offers?\b/i, /\/clearance/i, /\/voucher/i,
  ],
  nonCampaignUrlPatterns: [
    /\/about\b/i, /\/contact\b/i, /\/privacy/i, /\/terms\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i, /\/careers?\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'وارنٹی', 'ضمانت', 'فروخت کے بعد سروس',
    'سرکاری ویب سائٹ', 'کمپنی کے بارے میں',
    'after sales', 'warranty', 'recall', 'official website',
  ],
  listingPageTitlePatterns: [
    /^تمام\s*(آفرز|ڈیلز|سیل)$/i,
    /^all\s*(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [/^\/sale$/, /^\/deals?$/, /^\/offers?$/, /^\/promo$/],
  homepageCampaignCheck: /سیل|ڈسکاؤنٹ|آفر|پروموشن|کوپن|sale|deal|discount|promo|coupon|offer/i,
};

const SE_KEYWORDS: MarketKeywords = {
  strongCampaignKeywords: [
    'rea', 'erbjudande', 'rabatt', 'kampanj', 'fynd', 'kupong',
    'sale', 'deal', 'deals', 'discount', 'promo', 'coupon', 'offer', 'clearance',
  ],
  strongCampaignKeywordsWordBoundary: [],
  campaignKeywords: [
    'fri frakt', 'gratis frakt', 'cashback',
    'specialpris', 'veckans erbjudande', 'dagens deal',
    'sista chansen', 'begränsat erbjudande',
    'black friday', 'cyber monday', 'mellandagsrea', 'julrea',
    'midsommar', 'påsk',
    // Telekom
    'abonnemang', 'mobilabonnemang', 'bredband', 'fiber',
    'obegränsad data', 'byt operatör', 'sim-kort',
    // Teknik
    'gratis provperiod', 'prenumeration', 'premiumplan', 'licens',
    '% off', 'off', 'gratis',
  ],
  campaignKeywordsWordBoundary: [/\d+\s*%/, /%\s*\d+/],
  blacklistedTitles: [
    'hem', 'startsida', 'om oss', 'kontakt', 'logga in', 'registrera',
    'varukorg', 'kassa', 'integritetspolicy', 'villkor',
    'vanliga frågor', 'hjälp', 'karriär', 'webbplatskarta',
    'home', 'about', 'contact', 'login', 'cart', 'checkout',
    'privacy', 'terms', 'faq', 'help', 'careers', 'sitemap',
  ],
  campaignUrlPatterns: [
    /\/rea\b/i, /\/erbjudanden\b/i, /\/kampanjer\b/i, /\/rabatt\b/i,
    /\/sale\b/i, /\/deals?\b/i, /\/promo/i, /\/discount/i,
    /\/coupon/i, /\/outlet\b/i,
  ],
  nonCampaignUrlPatterns: [
    /\/om-oss\b/i, /\/kontakt\b/i, /\/about\b/i, /\/contact\b/i,
    /\/privacy/i, /\/terms\b/i, /\/villkor\b/i,
    /\/help\b/i, /\/faq\b/i, /\/support\b/i, /\/karriar\b/i, /\/sitemap/i,
  ],
  nonCampaignTitleKeywords: [
    'kundtjänst', 'garanti', 'reklamation',
    'officiell webbplats', 'om företaget',
    'after sales', 'warranty', 'recall', 'official website',
  ],
  listingPageTitlePatterns: [
    /^alla\s*(erbjudanden|kampanjer|rabatter|reor)$/i,
    /^all\s*(deals|offers|sales|promotions)$/i,
  ],
  listingPageUrlPatterns: [/^\/rea$/, /^\/sale$/, /^\/deals?$/, /^\/erbjudanden$/],
  homepageCampaignCheck: /rea|erbjudande|rabatt|kampanj|fynd|kupong|sale|deal|discount|promo|coupon|offer/i,
};

function getMarketKeywords(market?: Market): MarketKeywords {
  switch (market) {
    case Market.US: return US_KEYWORDS;
    case Market.DE: return DE_KEYWORDS;
    case Market.UK: return UK_KEYWORDS;
    case Market.IN: return IN_KEYWORDS;
    case Market.BR: return BR_KEYWORDS;
    case Market.ID: return ID_KEYWORDS;
    case Market.RU: return RU_KEYWORDS;
    case Market.MX: return MX_KEYWORDS;
    case Market.JP: return JP_KEYWORDS;
    case Market.PH: return PH_KEYWORDS;
    case Market.TH: return TH_KEYWORDS;
    case Market.CA: return CA_KEYWORDS;
    case Market.AU: return AU_KEYWORDS;
    case Market.FR: return FR_KEYWORDS;
    case Market.IT: return IT_KEYWORDS;
    case Market.ES: return ES_KEYWORDS;
    case Market.AR: return AR_KEYWORDS;
    case Market.EG: return EG_KEYWORDS;
    case Market.SA: return SA_KEYWORDS;
    case Market.KR: return KR_KEYWORDS;
    case Market.AE: return AE_KEYWORDS;
    case Market.VN: return VN_KEYWORDS;
    case Market.PL: return PL_KEYWORDS;
    case Market.MY: return MY_KEYWORDS;
    case Market.CO: return CO_KEYWORDS;
    case Market.ZA: return ZA_KEYWORDS;
    case Market.PT: return PT_MARKET_KEYWORDS;
    case Market.NL: return NL_KEYWORDS;
    case Market.PK: return PK_KEYWORDS;
    case Market.SE: return SE_KEYWORDS;
    default: return TR_KEYWORDS;
  }
}

// ====== HARD REJECT RULES (instant fail — no scoring needed) ======

/** Check if campaign should be instantly rejected. Returns reason string or null. */
function hardReject(campaign: NormalizedCampaign, brandName?: string, market?: Market): string | null {
  const titleLower = campaign.title.toLowerCase().trim();
  const url = campaign.sourceUrl;
  const kw = getMarketKeywords(market);

  // 0. WAF / bot detection / error pages (market-agnostic — tüm marketlerde geçerli)
  const wafErrorPatterns = [
    /\baccess\s*denied\b/i,
    /\brobot\s*or\s*human\b/i,
    /\bnot\s*a\s*robot\b/i,
    /\bchallenge\s*validation\b/i,
    /\bsomething\s*went\s*wrong\b/i,
    /\bjust\s*a\s*moment\b/i,
    /\bnur\s*einen\s*moment\b/i,
    /\bbir\s*dakika\s*l[üu]tfen\b/i,
    /\battention\s*required\b/i,
    /\bchecking\s*your\s*browser\b/i,
    /\bplease\s*verify\b/i,
    /\bare\s*you\s*a\s*human\b/i,
    /\bpardon\s*our\s*interruption\b/i,
    /\benable\s*(java\s*script|cookies)\b/i,
    /\bplease\s*wait\b/i,
    /잠시만\s*기다리/i,                               // KR: "잠시만 기다리십시오" (Cloudflare challenge)
    /\b기다려\s*주세요/i,                              // KR: "기다려 주세요" (please wait)
    /\b(error\s*)?(403|503)\s*(forbidden|service\s*unavailable)?\b/i,
    /\bservice\s*unavailable\b/i,
    /\bforbidden\b/i,
    /\bpage\s*not\s*found\b/i,
    /\bsayfa\s*bulunamad[ıi]\b/i,             // TR: "Sayfa bulunamadı"
    /\bseite\s*nicht\s*gefunden\b/i,           // DE: "Seite nicht gefunden"
    /\bpage\s*introuvable\b/i,                 // FR: "Page introuvable"
    /\bpagina\s*non\s*trovata\b/i,             // IT: "Pagina non trovata"
    /\bp[áa]gina\s*n[ãa]o\s*encontrada\b/i,   // PT: "Página não encontrada"
    /\bp[áa]gina\s*no\s*encontrada\b/i,        // ES: "Página no encontrada"
    /\bページが見つかりません/i,                  // JP: "ページが見つかりません"
    /\bстраница\s*не\s*найдена\b/i,             // RU: "Страница не найдена"
    /\bhalaman\s*tidak\s*ditemukan\b/i,          // ID: "Halaman tidak ditemukan"
    /\bไม่พบหน้า/i,                              // TH: "ไม่พบหน้า"
    /\b페이지를?\s*찾을\s*수\s*없/i,               // KR: "페이지를 찾을 수 없습니다"
    /\bالصفحة\s*غير\s*موجودة/i,                  // AR: "الصفحة غير موجودة"
    /\bbu\s*ba[ğg]lant[ıi]\s*yeni\s*sekmede/i, // TR: garbled tooltip text in title
    /^404\b/i,
    /\b404\s*not\s*found\b/i,
    /\bcloudflare\b/i,
    /\bcaptcha\b/i,
    /\bbitte\s*warten\b/i,
    /\baguarde\b/i,                  // BR: "please wait"
    /\bverifica(ção|cao)\s*(de\s*segurança|de\s*seguranca)/i,  // BR: "security verification"
    /\bun\s*momento\b/i,             // ES/generic: "one moment"
    /\bverify\s*you\s*are\s*human\b/i,
    /\brequest\s*could\s*not\s*be\s*satisfied\b/i, // CloudFront error
    /\bbot\s*detection\b/i,
    /\bsecurity\s*check\b/i,
    // System/error/maintenance pages (multi-language)
    /\bteknik\s*sorun/i,                          // TR: "teknik sorunlar yaşıyoruz"
    /\bbakım(da|dır|dayız)?\b/i,                  // TR: "bakımdayız"
    /\bşu\s*an\s*(hizmet|erişim)/i,               // TR: "şu an hizmet veremiyoruz"
    /\bsizinle\s*ileti[şs]ime\s*ge[çc]ece[ğg]iz/i, // TR: "sizinle iletişime geçeceğiz"
    /\bunder\s*maintenance\b/i,
    /\btemporarily\s*unavailable\b/i,
    /\bwe('re|\s*are)\s*(currently\s*)?(experiencing|having)\s*(technical\s*)?(issues|problems|difficulties)/i,
    /^coming\s*soon\.?!?$/i,                       // Only reject if entire title is "Coming Soon"
    /\bsite\s*is\s*(down|offline)\b/i,
    /\bsorry.{0,20}(inconvenience|trouble)/i,
    /\ben\s*maintenance\b/i,                       // FR: "en maintenance"
    /\bindisponible\b/i,                           // FR: "temporairement indisponible"
    /\bin\s*manutenzione\b/i,                      // IT: "in manutenzione"
    /\bwartungsarbeiten\b/i,                       // DE: "Wartungsarbeiten"
  ];
  if (wafErrorPatterns.some((p) => p.test(campaign.title))) {
    return 'waf-error-page';
  }

  // 0b. Garbled title — navigation fragments scraped as title content (market-agnostic)
  const navJunkPatterns = [
    /Dropdown(Track|search|Dropdown)/i,
    /searchWS\/Iconography/i,
    /we-icon__/i,
    /Track Your Order(Dropdown|we-icon)/i,
    /hamburger-?menu/i,
    /icon__store-locator/i,
  ];
  if (navJunkPatterns.some((p) => p.test(campaign.title))) {
    return 'garbled-nav-title';
  }

  // 0d. Repeated brand name garbled title (e.g. "idealoidealo")
  if (brandName && brandName.length >= 3) {
    const bl = brandName.toLowerCase();
    if (titleLower === bl + bl || titleLower === bl + bl + bl) {
      return 'repeated-brand-garbled';
    }
  }

  // 0c. Non-campaign generic app/service pages (market-agnostic)
  const genericNonCampaignPatterns = [
    /^pay\s*me\s*on\b/i,
    /^send\s*money\b/i,
    /^transfer\s*money\b/i,
    /^download\s*the\s*app\b/i,
    /^get\s*the\s*app\b/i,
    /^create\s*(an?\s*)?account\b/i,
    /^sign\s*up\s*(for|now|today|free)\b/i,
    /^(log|sign)\s*in\s*to\b/i,
    /^join\s*(us|now|today|free)\b/i,
    // Thank-you / confirmation / contact pages
    /^te[şs]ekk[üu]r/i,                          // TR: "Teşekkürler..."
    /^(thank\s*you|thanks)\b/i,                    // EN: "Thank you..."
    /^merci\b/i,                                   // FR: "Merci..."
    /^grazie\b/i,                                  // IT: "Grazie..."
    /^danke\b/i,                                   // DE: "Danke..."
    /^obrigad[oa]\b/i,                             // PT: "Obrigado..."
    /^(your\s*)?(form|message|request)\s*(has\s*been\s*)?(sent|submitted|received)/i,
    /^(başvurunuz|mesajınız|talebiniz)\s*(alındı|gönderildi|iletildi)/i,  // TR form confirmations
    /^ne\s*yaz[ıi]k\s*ki\b/i,                     // TR: "Ne yazık ki..."  (error/apology)
    /^(oops|uh\s*oh|whoops)\b/i,                   // EN error pages
    /^(cookie|privacy)\s*(policy|notice|consent)/i,
    /^(çerez|gizlilik)\s*(politika|ayar)/i,        // TR cookie/privacy
    // Customer service / support / contact pages
    /^m[üu][şs]teri\s*hizmet/i,                    // TR: "Müşteri Hizmetleri"
    /^(customer\s*service|customer\s*support|contact\s*us|help\s*center)\b/i,
    /^(service\s*client|contactez)/i,              // FR
    /^(servizio\s*clienti|contattaci)/i,           // IT
    /^(kundenservice|kontakt)/i,                   // DE
    /^(atendimento|fale\s*conosco)/i,              // PT/BR
    // App store / download / mobile app pages
    /^(mobil\s*uygulama|uygulamayı\s*indir)/i,     // TR
    /^(kolay\s*iade|[üu]cretsiz\s*(kargo|teslimat))\b/i,  // TR service features (not campaigns)
    /^(free\s*shipping|easy\s*returns?|free\s*delivery)\b/i,
    // Store info / hours / branch / announcement pages
    /[çc]al[ıi][şs]ma\s*saat/i,                    // TR: "Çalışma Saatleri"
    /ma[ğg]aza.{0,10}(listesi|bilgi|adres|saat)/i,  // TR: "Mağaza Listesi/Bilgileri/Adresleri"
    /[şs]ube.{0,10}(listesi|bilgi|adres|saat)/i,    // TR: "Şube Listesi"
    /^(store|opening)\s*hours?\b/i,
    /^(store|branch)\s*(list|locator|finder|directory)/i,
    /^(find\s*a\s*store|our\s*stores)\b/i,
    /^([öo]ffnungszeiten|filialen|standorte)/i,      // DE
    /^(nos\s*magasins|horaires)/i,                    // FR
    /^(i\s*nostri\s*negozi|orari)/i,                  // IT
    // Generic search/listing/category page titles (not real campaigns)
    /^search\s*results?\b/i,                            // "Search Results + FREE SHIPPING"
    /^on\s*sale\s*products?\b/i,                         // "On Sale Products + FREE SHIPPING"
    /^(all|shop\s*all|browse\s*all)\s*(products?|items?|categories)\b/i,
    /^(new\s*arrivals?|what'?s?\s*new|just\s*in)\s*[\+|–—-]/i,  // generic listing with brand suffix
    /^(best\s*sellers?|top\s*rated|most\s*popular)\s*[\+|–—-]/i,
    /^(clearance|outlet)\s*(items?|products?)?\s*[\+|–—-]/i,
    /^404\b/i,                                           // 404 error pages
    /^page\s*not\s*found\b/i,
    /^(error|hata)\s*\d{3}\b/i,                          // "Error 404", "Hata 503"
    // Navigation/CTA links scraped as campaigns (all markets)
    /^(view\s*all|see\s*all|shop\s*now|learn\s*more|read\s*more|explore|discover)\s*\.?!?$/i,
    /^(ver\s*todo|ver\s*todos|ver\s*mais|comprar\s*agora|saiba\s*mais)\s*\.?!?$/i,  // PT/ES
    /^(alle\s*angebote|mehr\s*erfahren|jetzt\s*kaufen|alle\s*ansehen)\s*\.?!?$/i,   // DE
    /^(voir\s*tout|en\s*savoir\s*plus|acheter)\s*\.?!?$/i,                         // FR
    /^(vedi\s*tutto|scopri\s*di\s*più|acquista\s*ora)\s*\.?!?$/i,                  // IT
    /^(lihat\s*semua|beli\s*sekarang)\s*\.?!?$/i,                                 // ID
    /^(すべて見る|もっと見る|今すぐ購入)\s*\.?!?$/i,                               // JP
    /^(ดูทั้งหมด|ซื้อเลย)\s*\.?!?$/i,                                            // TH
    /^(посмотреть\s*все|узнать\s*больше|купить)\s*\.?!?$/i,                         // RU
    /^(t[üu]m[üu]n[üu]\s*g[öo]r|hemen\s*al|detayl[ıi]\s*bilgi)\s*\.?!?$/i,       // TR
    /^trending\s*deals?\s*$/i,
    /^these\s*offers?\s*end\s*soon\s*$/i,
    /^(more|all)\s*deals?\s*$/i,
    // URL paths scraped as titles (e.g. "/sale", "/cupom-quero10")
    /^\/[a-z0-9_-]+$/i,
    // CSS/HTML fragments scraped as titles
    /^#[a-z-]+::?(before|after)/i,
    /#\{.*content:\s*["']/i,
    /^\.css-[a-z0-9]+\{/i,                                            // CSS class definition as title
    /\{overflow:\s*hidden/i,                                           // CSS property fragment
    // Generic non-campaign UI elements
    /^(sign\s*up\s*here|view\s*offer|how\s*can\s*i\s*help|filters)\s*\.?!?$/i,
    /^(vedi\s*l'offerta|ver\s*oferta|voir\s*l'offre)\s*\.?!?$/i,
    // Login/auth pages
    /\blogin\s*temu\b/i,
    /\blogin\s*page\b/i,
    // KR: Navigation category labels scraped as campaign titles
    /^(브랜드패션|트렌드패션|뷰티\/잡화|가구\/침구|생활\/건강|스포츠\/레저|문구\/도서|가전\/컴퓨터|패션의류|식품\/건강)$/,
    /^(베스트|기획전|라이브|공지사항|카테고리|전체|패션|일간)$/,  // KR: generic nav labels
    /^(전체\s*보기|모두\s*보기|더\s*보기)\s*\.?!?$/,              // KR: "view all" / "see all"
    // KR: Login/service pages
    /^로그인\b/,                                                   // KR: "Login"
  ];
  if (genericNonCampaignPatterns.some((p) => p.test(titleLower))) {
    return 'generic-non-campaign';
  }

  // 1. Invalid/garbage URLs
  if (!url || url.startsWith('javascript:') || url === '#' || url === '') {
    return 'invalid-url';
  }

  // 1b. Foreign locale URL — URL contains a locale prefix that doesn't match the market
  if (url && market) {
    const MARKET_LOCALES: Record<string, string[]> = {
      TR: ['tr-tr', 'tr'],
      US: ['en-us', 'en'],
      DE: ['de-de', 'de', 'de-at', 'de-ch'],
      UK: ['en-gb', 'en'],
      IN: ['en-in', 'hi-in', 'en'],
      BR: ['pt-br', 'pt'],
      ID: ['id-id', 'id', 'en-id'],
      RU: ['ru-ru', 'ru'],
      MX: ['es-mx', 'es'],
      JP: ['ja-jp', 'ja'],
      PH: ['en-ph', 'en'],
      TH: ['th-th', 'th', 'en-th'],
      CA: ['en-ca', 'fr-ca', 'en'],
      AU: ['en-au', 'en'],
      FR: ['fr-fr', 'fr'],
      IT: ['it-it', 'it'],
      ES: ['es-es', 'es'],
      EG: ['ar-eg', 'ar', 'en-eg'],
      SA: ['ar-sa', 'ar', 'en-sa'],
      KR: ['ko-kr', 'ko'],
      AR: ['es-ar', 'es'],
      AE: ['ar-ae', 'ar', 'en-ae'],
      VN: ['vi-vn', 'vi'],
      PL: ['pl-pl', 'pl'],
      MY: ['ms-my', 'ms', 'en-my'],
      CO: ['es-co', 'es'],
      ZA: ['en-za', 'en'],
      PT: ['pt-pt', 'pt'],
      NL: ['nl-nl', 'nl'],
      PK: ['ur-pk', 'ur', 'en-pk'],
      SE: ['sv-se', 'sv'],
    };
    // Match URL locale patterns like /en-us/, /tr-tr/, /de-de/ etc.
    const localeMatch = url.match(/\/([a-z]{2}-[a-z]{2})\//i);
    if (localeMatch) {
      const urlLocale = localeMatch[1].toLowerCase();
      const allowedLocales = MARKET_LOCALES[market] || [];
      const isAllowed = allowedLocales.some(loc => urlLocale === loc || urlLocale.startsWith(loc.split('-')[0] + '-'));
      if (!isAllowed) {
        // Check if the URL locale matches ANY other market — if so, it's a foreign locale
        const allLocales = Object.values(MARKET_LOCALES).flat();
        if (allLocales.includes(urlLocale)) {
          return `foreign-locale-url(${urlLocale})`;
        }
      }
    }
  }

  // 2. Listing page title detection (market-agnostic + market-specific)
  // English listing titles (apply to ALL markets — English titles common everywhere)
  if (/^(all\s*)?(deals?|sales?|offers?|specials?|promotions?|coupons?)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  if (/^(deals?|sales?|offers?|specials?|promotions?)\s*[|–—-]\s*.+$/i.test(titleLower)) {
    return 'listing-page-with-brand';
  }
  // TR
  if (/^(tüm\s*)?kampanyalar?$/i.test(titleLower) || /^(tüm\s*)?(indirimler|fırsatlar|teklifler)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  if (/^kampanyalar\s*[|–—-]\s*.+$/i.test(titleLower)) {
    return 'listing-page-with-brand';
  }
  // DE
  if (/^(alle\s*)?(angebote?|aktionen?|rabatte?|gutscheine?)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  if (/^(angebote?|aktionen?|rabatte?)\s*[|–—-]\s*.+$/i.test(titleLower)) {
    return 'listing-page-with-brand';
  }
  // BR/PT
  if (/^(todas?\s*)?(ofertas?|promoções?|promocoes?|descontos?|cupons?)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  // ID
  if (/^(semua\s*)?(promo|promosi|diskon|penawaran|voucher)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  // RU
  if (/^(все\s*)?(акции|скидки|предложения|промокоды|купоны)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  // MX/ES
  if (/^(todas?\s*las?\s*)?(ofertas?|promociones?|descuentos?|cupones?)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  // JP
  if (/^(全ての?)?(セール|キャンペーン|割引|クーポン|お得)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  // TH
  if (/^(ทั้งหมด\s*)?(โปรโมชั่น|โปรโมชัน|ส่วนลด|ดีล|คูปอง)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  // FR
  if (/^(toutes?\s*les?\s*)?(soldes|promotions?|réductions?|offres?|bons?\s*plans?)$/i.test(titleLower)) {
    return 'listing-page-title';
  }
  // IT
  if (/^(tutte?\s*le?\s*)?(offerte?|promozioni?|sconti?|saldi|coupon)$/i.test(titleLower)) {
    return 'listing-page-title';
  }

  // 3. Title is brand name only or brand + listing word
  if (brandName) {
    const brandLower = brandName.toLowerCase();
    if (titleLower === brandLower) {
      return 'brand-listing-page';
    }
    // Multi-language brand + listing word patterns
    const brandListingPatterns = [
      // EN
      `${brandLower} deals`, `${brandLower} sales`, `${brandLower} offers`, `${brandLower} promotions`,
      // TR
      `${brandLower} kampanyalar`, `${brandLower} kampanyaları`, `${brandLower} indirimleri`,
      // DE
      `${brandLower} angebote`, `${brandLower} aktionen`, `${brandLower} rabatte`,
      // BR/PT
      `${brandLower} ofertas`, `${brandLower} promoções`, `${brandLower} descontos`,
      // RU
      `${brandLower} акции`, `${brandLower} скидки`,
      // MX/ES
      `${brandLower} ofertas`, `${brandLower} promociones`, `${brandLower} descuentos`,
      // FR
      `${brandLower} soldes`, `${brandLower} promotions`, `${brandLower} offres`,
      // IT
      `${brandLower} offerte`, `${brandLower} promozioni`, `${brandLower} sconti`,
    ];
    if (brandListingPatterns.includes(titleLower)) {
      return 'brand-listing-page';
    }
  }

  // 4. Non-target content (Arabic script detection)
  if (/[\u0600-\u06FF]/.test(campaign.title)) {
    return 'arabic-content';
  }

  // 5. Market-specific language filtering
  if (market === Market.US || market === Market.UK) {
    // US/UK market: reject non-English content (Turkish, etc.)
    const turkishSpecific = /[çğıöşüÇĞİÖŞÜ]/;
    if (turkishSpecific.test(campaign.title)) {
      return 'non-english-content';
    }
  } else if (market === Market.DE) {
    // DE market: reject Turkish-specific chars (but allow German chars: ä, ö, ü, ß)
    const turkishOnly = /[çğışÇĞİŞ]/;  // Turkish chars NOT shared with German
    if (turkishOnly.test(campaign.title)) {
      return 'non-german-content';
    }
  } else {
    // TR market: Title is entirely English AND not campaign-related
    if (/^[A-Za-z0-9\s|&',.:!?%$€₺#@\-–—()\/]+$/.test(campaign.title)) {
      const englishCampaignWords = /campaign|deal|offer|discount|sale|promotion|free|bonus|special/i;
      const turkishWords = /kampanya|indirim|fırsat|firsat|teklif|avantaj|hediye|taksit|özel|ozel|ücretsiz|ucretsiz/i;
      if (!englishCampaignWords.test(campaign.title) && !turkishWords.test(campaign.title)) {
        const serviceWords = /service|warranty|guarantee|recycling|partnership|corporate|about|contact|FAQ|terms/i;
        if (serviceWords.test(campaign.title)) {
          return 'english-non-campaign';
        }
      }
    }
  }

  // 6. URL is the homepage
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, '');
    if (path === '' || path === '/') {
      if (!kw.homepageCampaignCheck.test(titleLower)) {
        return 'homepage-url';
      }
    }
  } catch { /* ignore parse errors */ }

  // 7. Legal/info page titles (market-specific)
  if (market === Market.US || market === Market.UK) {
    const usLegalPatterns = [
      /^privacy\s*policy$/i,
      /^terms\s*(of\s*(service|use)|and\s*conditions)$/i,
      /^cookie\s*(policy|settings|preferences)$/i,
      /^(all|browse)\s*(deals|offers|sales|promotions|coupons)$/i,
      /^(about|contact)\s*(us)?$/i,
      /^faq$/i,
      /^help\s*(center)?$/i,
      /^(return|refund)\s*policy$/i,
      /\brecall\b/i,
      /^careers?$/i,
      /^press(\s*releases?)?$/i,
    ];
    if (usLegalPatterns.some((p) => p.test(titleLower))) {
      return 'legal-page';
    }
  } else if (market === Market.DE) {
    const deLegalPatterns = [
      /^impressum$/i,
      /^datenschutz(erkl[äa]rung)?$/i,
      /^agb$/i, /^allgemeine\s*gesch[äa]ftsbedingungen$/i,
      /^kontakt(\s*formular)?$/i,
      /^[üu]ber\s*uns$/i,
      /^cookie[\s-]*(einstellungen|richtlinie|hinweis)$/i,
      /^hilfe(\s*center)?$/i, /^h[äa]ufige\s*fragen$/i,
      /^widerrufs(recht|belehrung)$/i,
      /^versand(informationen|bedingungen)?$/i,
      /^r[üu]ck(gabe|sendung)(s?recht)?$/i,
      /^karriere$/i, /^presse(mitteilung)?$/i,
      /^(alle\s*)?(angebote|aktionen|deals|rabatte|gutscheine)$/i,
      // English fallback on German sites
      /^privacy\s*policy$/i, /^terms/i, /^faq$/i,
      /^(about|contact)\s*(us)?$/i,
    ];
    if (deLegalPatterns.some((p) => p.test(titleLower))) {
      return 'legal-page';
    }
  } else {
    const trLegalPatterns = [
      /^kampanya\s*(şartları|sartlari|koşulları|kosullari|kurallari|kuralları)$/i,
      /çekilış\s*sonuçları|cekilis\s*sonuclari|çekiliş\s*sonuçları/i,
      /^gizlilik\s*(politikası|sozlesmesi|bildirimi)$/i,
      /^kvkk/i,
      /^cerez\s*politikası$/i,
      /^çerez\s*politikası$/i,
      /^tüm\s*kampanyalar$/i,
      /^tum\s*kampanyalar$/i,
      /^all\s*campaigns$/i,
      /^mağaza\s*kampanyalar/i,
      /^magaza\s*kampanyalar/i,
      /kampanyalar[ıi]?\s*[|–—-]/i,
      /\s+kampanyalar[ıi]$/i,
      /çerez(ler)?i?\s*(onayla|kabul|ayar|tercih|yönet)/i,
      /cookie\s*(consent|accept|settings|preferences)/i,
      /fonksiyonel\s*çerez/i,
      /^(fiyat\s*)?teklif\s*(formu|al)/i,
      /^size\s*en\s*yakın/i,
      /geri\s*çağırma\s*kampanyası/i,
      /geri\s*cagirma/i,
      /^daha\s*fazlasını\s*öğren$/i,
      /portal['ıi]?\s*keşfedin/i,
      /^(ile\s*)?tanışın$/i,
      /ile\s*tanışın$/i,
    ];
    if (trLegalPatterns.some((p) => p.test(titleLower))) {
      return 'legal-page';
    }
  }

  // 7b. DE: Product count pages (MediaMarkt/Saturn "(N Artikel)" pattern)
  if (market === Market.DE) {
    if (/\(\d+\s*artikel\)/i.test(campaign.title)) {
      return 'de-product-count-page';
    }
  }

  // 7c. US/UK: Insurance/finance info pages (not real campaigns)
  if (market === Market.US || market === Market.UK) {
    const insuranceInfoPatterns = [
      /\bget\s+(a\s+)?quote\b/i,
      /\bhow\s+(to|do|much)\b/i,
      /\btips\s+for\b/i,
      /\bcompare\s*(.*\s)?rates\b/i,
      /\btypes\s+of\s+(insurance|coverage)\b/i,
      /\binsurance\s+company\b/i,
      /\bwhat\s+is\s+.*(insurance|coverage)\b/i,
      /\blearn\s+(more\s+)?about\s+.*(insurance|coverage)\b/i,
    ];
    if (insuranceInfoPatterns.some((p) => p.test(campaign.title))) {
      // Only reject if NO discount/campaign language present
      const hasDealWord = /(sale|flash|limited|today|weekend|off|save\s*\$|coupon|promo|code|free|discount|\d+%)/i.test(campaign.title);
      if (!hasDealWord) {
        return 'insurance-info-page';
      }
    }
  }

  // 8. Individual product pages (not campaigns) — URL-based detection
  const productUrlPatterns = [
    /\/p\/\d+/i,
    /\/product\/\d+/i,
    /\/urun\/[^/]+$/i,
    /\/products\/[^/]+$/i,
    /[?&]productId=/i,
    /\/p-[a-z0-9]{5,}/i,
    // US/international product URL patterns
    /\/dp\/[A-Z0-9]{10}/i,   // Amazon ASIN: /dp/B08N5WRWNW
    /\/ip\/\d+/i,             // Walmart item: /ip/12345678
    /\/shop\/p\//i,           // Logitech etc: /shop/p/product-slug
    /\/shop\/[^/]+\.\d{3,}/i, // Logitech SKU: /shop/p/item.956-000126
    /\/item\/\d+/i,           // Generic: /item/12345
    /\/pd\/\d+/i,             // PD style: /pd/12345
    /\/sku\//i,               // SKU-based: /sku/ABC123
    /\/product\.html/i,       // Overstock etc: /product.html?option=...
    /\/\d+\/product\.html/i,  // Overstock: /43153751/product.html
    // Restaurant menu item pages (not campaigns)
    /\/food\/[^/]+\/[^/]+/i,  // Any /food/category/item (Taco Bell, etc.)
    /\/menu\/(item|product|detail)\//i,
    /\/cardapio\//i,          // BR: menu
    /\/speisekarte\//i,       // DE: menu
    /\/menu\/[^/]+\/[^/]+$/i, // Generic: /menu/category/item
  ];
  if (campaign.sourceUrl && productUrlPatterns.some((p) => p.test(campaign.sourceUrl))) {
    return 'individual-product-page';
  }

  // 8b. CMS component URLs (Marriott AEM, Sling etc.) — not campaigns
  if (campaign.sourceUrl && /jcr[:\/_]content/i.test(campaign.sourceUrl)) {
    return 'cms-component-url';
  }

  // 8c. Job listing pages — not campaigns
  const jobUrlPatterns = [
    /\/offerte-lavoro\//i,    // IT: Subito.it job listings
    /\/offres-emploi\//i,     // FR: job listings
    /\/stellenangebote\//i,   // DE: job listings
    /\/vagas\//i,             // BR: job listings
    /\/lowongan\//i,          // ID: job listings
  ];
  if (campaign.sourceUrl && jobUrlPatterns.some((p) => p.test(campaign.sourceUrl))) {
    return 'job-listing-page';
  }

  // 8d. CMS widget titles — generic components, not real campaigns
  if (/^offers?\s+(text\s+block|details?\s+card|search\s+results)/i.test(campaign.title)) {
    return 'cms-widget-title';
  }

  // 8e. Login/account/auth pages — never campaigns
  const authUrlPatterns = [
    /\/(login|log-in|signin|sign-in|signup|sign-up|register|auth|oauth|sso)\b/i,
    /\/(my-?account|account\/?(settings|profile|orders|dashboard|preferences|security))\b/i,
    /\/(profile|user-profile|my-profile)\b/i,
    /\/(forgot-?password|reset-?password|change-?password|verify-?email)\b/i,
  ];
  if (campaign.sourceUrl && authUrlPatterns.some((p) => p.test(campaign.sourceUrl))) {
    return 'auth-account-page';
  }

  // 8f. Cart/checkout/payment pages — never campaigns
  const cartUrlPatterns = [
    /\/(cart|shopping-?cart|my-?cart|sepet|warenkorb|carrello|panier)\b/i,
    /\/(checkout|check-out|ödeme|kasse|cassa|paiement)\b/i,
    /\/(basket|my-?basket)\b/i,
    /\/(order|order-?(confirmation|tracking|status|history|details))\b/i,
    /\/(payment|pay|billing)\b/i,
  ];
  if (campaign.sourceUrl && cartUrlPatterns.some((p) => p.test(campaign.sourceUrl))) {
    return 'cart-checkout-page';
  }

  // 8g. Blog/article/editorial pages — not campaigns
  const blogUrlPatterns = [
    /\/(blog|blogs|artikel|article|articles|magazine|journal|editorial|news|haber|haberler)\b/i,
    /\/(blog|artikel|article)\/[^/]+/i,  // blog post pages: /blog/some-post
    /\/(magazin|dergi|revista|rivista|zeitschrift)\b/i,  // TR/PT/IT/DE magazine
  ];
  if (campaign.sourceUrl && blogUrlPatterns.some((p) => p.test(campaign.sourceUrl))) {
    // Only reject if no campaign keyword in title (some blogs announce deals)
    const hasAnyCampaignWord = kw.strongCampaignKeywords.some((k) => titleLower.includes(k)) ||
      kw.campaignKeywords.some((k) => titleLower.includes(k));
    if (!hasAnyCampaignWord) {
      return 'blog-article-page';
    }
  }

  // 9. Individual product names without any campaign/discount language
  const hasCampaignKeyword = kw.strongCampaignKeywords.some((k) => titleLower.includes(k)) ||
    kw.strongCampaignKeywordsWordBoundary.some((re) => re.test(titleLower)) ||
    kw.campaignKeywords.some((k) => titleLower.includes(k)) ||
    kw.campaignKeywordsWordBoundary.some((re) => re.test(titleLower));
  if (!hasCampaignKeyword) {
    if (kw.productTypeRe && kw.productTypeRe.test(campaign.title)) {
      return 'individual-product-name';
    }
    if (kw.categoryOnlyRe && kw.categoryOnlyRe.test(titleLower.trim())) {
      return 'category-only-title';
    }
  }

  // 10. Product listing/category pages
  if (kw.productListingPatterns && kw.productListingPatterns.some((p) => p.test(campaign.title))) {
    if (!campaign.description && campaign.imageUrls.length === 0) {
      return 'product-listing-page';
    }
  }

  // 11. Generic site title
  const genericSiteTitles = [
    /resmi\s*web\s*site/i,
    /official\s*web\s*site/i,
    /^fırsatlar$/i,
    /^deals$/i,
  ];
  if (genericSiteTitles.some((p) => p.test(campaign.title))) {
    if (/resmi\s*web\s*site|official\s*web\s*site/i.test(campaign.title)) {
      return 'generic-site-title';
    }
    if (/^(fırsatlar|deals)$/i.test(titleLower) && !campaign.description && campaign.imageUrls.length === 0) {
      return 'generic-deals-title';
    }
  }

  // 12. Title too short
  if (campaign.title.length < 3) {
    return 'empty-title';
  }

  // 13. Stale campaigns: startDate more than 2 years ago
  if (campaign.startDate) {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    if (campaign.startDate < twoYearsAgo) {
      return 'stale-campaign';
    }
  }

  // 14. Expired campaigns: endDate in the past (more than 7 days grace)
  if (campaign.endDate) {
    const gracePeriod = new Date();
    gracePeriod.setDate(gracePeriod.getDate() - 7);
    if (campaign.endDate < gracePeriod) {
      return 'expired-campaign';
    }
  }

  return null;
}

// ====== SOFT SCORING ======

export interface QualityResult {
  score: number;
  reasons: string[];
  passed: boolean;
  hardRejected?: string;
}

const MIN_SCORE = 4;

export function scoreCampaign(
  campaign: NormalizedCampaign,
  brandName?: string,
  market?: Market,
): QualityResult {
  const kw = getMarketKeywords(market);

  // === HARD REJECT first ===
  const rejectReason = hardReject(campaign, brandName, market);
  if (rejectReason) {
    return { score: -99, reasons: [`HARD_REJECT: ${rejectReason}`], passed: false, hardRejected: rejectReason };
  }

  let score = 0;
  const reasons: string[] = [];
  const titleLower = campaign.title.toLowerCase();

  // +3: Strong campaign keywords (core terms: campaign, sale, deal, discount, promo, coupon, clearance, offer + local equivalents)
  const hasStrongKeyword = kw.strongCampaignKeywords.some((k) => titleLower.includes(k)) ||
      kw.strongCampaignKeywordsWordBoundary.some((re) => re.test(titleLower));
  if (hasStrongKeyword) {
    score += 3;
    reasons.push('+3 strong-keyword');
  } else if (kw.campaignKeywords.some((k) => titleLower.includes(k)) ||
      kw.campaignKeywordsWordBoundary.some((re) => re.test(titleLower))) {
    // +2: Secondary campaign keywords
    score += 2;
    reasons.push('+2 keyword');
  }

  // +1: Title >= 10 chars
  if (campaign.title.length >= 10) {
    score += 1;
    reasons.push('+1 title≥10');
  }

  // +1: Description exists and >= 20 chars
  if (campaign.description && campaign.description.length >= 20) {
    score += 1;
    reasons.push('+1 desc');
  }

  // +1: Has image
  if (campaign.imageUrls.length > 0) {
    score += 1;
    reasons.push('+1 image');
  }

  // +1: Has discount rate
  if (campaign.discountRate !== null && campaign.discountRate > 0) {
    score += 1;
    reasons.push('+1 discount');
  }

  // +1: Has start date
  if (campaign.startDate !== null) {
    score += 1;
    reasons.push('+1 startDate');
  }

  // +2: Has end date
  if (campaign.endDate !== null) {
    score += 2;
    reasons.push('+2 endDate');
  }

  // +1: Has promo code
  if (campaign.promoCode) {
    score += 1;
    reasons.push('+1 promoCode');
  }

  // +2: URL contains campaign path (/sale, /deals, /offer, /promo, /campaign etc.)
  if (kw.campaignUrlPatterns.some((p) => p.test(campaign.sourceUrl))) {
    score += 2;
    reasons.push('+2 campaign-url');
  }

  // -3: Blacklisted title
  if (kw.blacklistedTitles.some((bl) => titleLower === bl || titleLower.startsWith(bl + ' '))) {
    score -= 3;
    reasons.push('-3 blacklist');
  }

  // -2: Title = brand name only
  if (brandName && titleLower === brandName.toLowerCase()) {
    score -= 2;
    reasons.push('-2 brand-only');
  }

  // -2: Title < 5 chars
  if (campaign.title.length < 5) {
    score -= 2;
    reasons.push('-2 short');
  }

  // -2: URL is a non-campaign service/info page
  if (kw.nonCampaignUrlPatterns.some((p) => p.test(campaign.sourceUrl))) {
    score -= 2;
    reasons.push('-2 non-campaign-url');
  }

  // -2: Title contains non-campaign service keywords
  if (kw.nonCampaignTitleKeywords.some((k) => titleLower.includes(k))) {
    score -= 2;
    reasons.push('-2 non-campaign-title');
  }

  // -2: Product listing/category page title
  if (kw.listingPageTitlePatterns.some((p) => p.test(campaign.title))) {
    score -= 2;
    reasons.push('-2 product-listing');
  }

  // -1: No description and no image (very thin content)
  if (!campaign.description && campaign.imageUrls.length === 0) {
    score -= 1;
    reasons.push('-1 thin');
  }

  // -2: Seed/listing page URL pattern
  try {
    const parsed = new URL(campaign.sourceUrl);
    const path = parsed.pathname.replace(/\/+$/, '');
    if (kw.listingPageUrlPatterns.some((p) => p.test(path))) {
      score -= 2;
      reasons.push('-2 listing-url');
    }
    // -2 for English version URL (/en/) — exclude English-speaking markets
    const englishMarkets: Market[] = [Market.US, Market.UK, Market.IN, Market.PH, Market.CA, Market.AU];
    if (market && !englishMarkets.includes(market) && /\/en\//.test(path)) {
      score -= 2;
      reasons.push('-2 english-url');
    }
  } catch { /* ignore */ }

  return { score, reasons, passed: score >= MIN_SCORE };
}

export function filterCampaigns(
  campaigns: NormalizedCampaign[],
  brandName?: string,
  market?: Market,
): { passed: NormalizedCampaign[]; rejected: NormalizedCampaign[] } {
  const passed: NormalizedCampaign[] = [];
  const rejected: NormalizedCampaign[] = [];

  for (const c of campaigns) {
    const result = scoreCampaign(c, brandName, market);
    if (result.passed) {
      passed.push(c);
    } else {
      const reason = result.hardRejected
        ? `HARD_REJECT(${result.hardRejected})`
        : `score=${result.score}`;
      console.log(
        `  [Quality] REJECTED (${reason}): "${c.title.substring(0, 60)}" [${result.reasons.join(', ')}]`,
      );
      rejected.push(c);
    }
  }

  if (rejected.length > 0) {
    console.log(`  [Quality] ${passed.length} passed, ${rejected.length} rejected`);
  }

  return { passed, rejected };
}

// ====== AI-ENHANCED FILTERING ======

// Score thresholds for AI routing
const AUTO_ACCEPT_SCORE = 6;  // Score ≥ 6 → net kampanya, AI'ya gönderme
const AUTO_REJECT_SCORE = 3;  // Score < 3 → yetersiz sinyal, AI'ya gönderme
// Score 3-5 → AI borderline (dar ve verimli bant)
const AI_CONFIDENCE_THRESHOLD = 0.6;

/**
 * AI-enhanced campaign filtering.
 * Hard rejects stay static (fast, free). Borderline cases go to Gemini AI.
 * AI also enriches campaigns with missing dates/discount data.
 */
export async function filterCampaignsWithAI(
  campaigns: NormalizedCampaign[],
  brandName?: string,
  market?: Market,
): Promise<{ passed: NormalizedCampaign[]; rejected: NormalizedCampaign[] }> {
  const passed: NormalizedCampaign[] = [];
  const rejected: NormalizedCampaign[] = [];
  let aiCalls = 0;
  let aiFallbacks = 0; // AI unavailable (circuit breaker), static fallback kullanıldı

  for (const c of campaigns) {
    const result = scoreCampaign(c, brandName, market);

    // Hard reject — skip AI
    if (result.hardRejected) {
      console.log(
        `  [Quality] REJECTED (HARD_REJECT(${result.hardRejected})): "${c.title.substring(0, 60)}"`,
      );
      rejected.push(c);
      continue;
    }

    // Auto-accept — high confidence, skip AI
    if (result.score >= AUTO_ACCEPT_SCORE) {
      console.log(
        `  [AI] SKIPPED (score=${result.score}): "${c.title.substring(0, 50)}" → auto-accept`,
      );
      passed.push(c);
      continue;
    }

    // Auto-reject — very low score, skip AI
    if (result.score < AUTO_REJECT_SCORE) {
      console.log(
        `  [Quality] REJECTED (score=${result.score}): "${c.title.substring(0, 60)}" [${result.reasons.join(', ')}]`,
      );
      rejected.push(c);
      continue;
    }

    // Borderline (score 3-5) — ask AI
    try {
      const aiResult = await classifyAndEnrich(
        c.title,
        c.description,
        c.sourceUrl,
        brandName || '',
        market,
      );
      aiCalls++;

      if (aiResult.confidence >= AI_CONFIDENCE_THRESHOLD) {
        if (aiResult.isCampaign) {
          // AI says it's a campaign — enrich with missing data
          if (aiResult.endDate && !c.endDate) {
            c.endDate = new Date(aiResult.endDate);
          }
          if (aiResult.startDate && !c.startDate) {
            c.startDate = new Date(aiResult.startDate);
          }
          if (aiResult.discountRate && !c.discountRate) {
            c.discountRate = aiResult.discountRate;
          }

          const enrichments: string[] = [];
          if (aiResult.endDate) enrichments.push(`endDate:${aiResult.endDate}`);
          if (aiResult.startDate) enrichments.push(`startDate:${aiResult.startDate}`);
          if (aiResult.discountRate) enrichments.push(`discount:${aiResult.discountRate}%`);

          console.log(
            `  [AI] ACCEPTED (${aiResult.confidence.toFixed(2)}): "${c.title.substring(0, 50)}" → ${aiResult.reason}${enrichments.length ? ' | ' + enrichments.join(', ') : ''}`,
          );
          passed.push(c);
        } else {
          console.log(
            `  [AI] REJECTED (${aiResult.confidence.toFixed(2)}): "${c.title.substring(0, 50)}" → ${aiResult.reason}`,
          );
          rejected.push(c);
        }
      } else {
        // Low confidence or AI exhausted (FALLBACK_RESULT) — fall back to static score
        const isFallback = aiResult.reason.includes('fallback');
        if (isFallback) aiFallbacks++;
        const tag = isFallback ? 'AI_EXHAUSTED' : 'LOW_CONF';
        if (result.score >= MIN_SCORE) {
          console.log(
            `  [AI] ${tag} (${aiResult.confidence.toFixed(2)}, score=${result.score}): "${c.title.substring(0, 50)}" → accepted by static score`,
          );
          passed.push(c);
        } else {
          console.log(
            `  [AI] ${tag} (${aiResult.confidence.toFixed(2)}, score=${result.score}): "${c.title.substring(0, 50)}" → rejected by static score`,
          );
          rejected.push(c);
        }
      }
    } catch (err) {
      // AI error — fall back to static score
      aiFallbacks++;
      console.warn(`  [AI] ERROR: ${(err as Error).message} — falling back to static score`);
      if (result.score >= MIN_SCORE) {
        passed.push(c);
      } else {
        rejected.push(c);
      }
    }
  }

  const total = passed.length + rejected.length;
  console.log(`  [Quality+AI] ${passed.length}/${total} passed, ${rejected.length} rejected, ${aiCalls} AI calls${aiFallbacks > 0 ? `, ${aiFallbacks} AI fallbacks (circuit breaker)` : ''}`);

  return { passed, rejected };
}
