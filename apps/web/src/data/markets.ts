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

const PLAY_STORE_BASE = 'https://play.google.com/store/apps/details?id=com.kampanyasepeti.app';
const APP_STORE_BASE = 'https://apps.apple.com/app/kampanya-sepeti/id';

export const MARKETS: MarketConfig[] = [
  {
    market: 'TR', slug: 'tr', language: 'tr', locale: 'tr-TR',
    appName: 'Kampanya Sepeti', flag: '\u{1F1F9}\u{1F1F7}', countryName: 'Turkiye',
    storeListingFile: 'tr', dir: 'ltr',
    seoKeywords: ['indirim', 'kampanya', 'kupon', 'firsat', 'taksit', 'promosyon', 'indirim uygulamasi'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'US', slug: 'us', language: 'en', locale: 'en-US',
    appName: 'Deal Box', flag: '\u{1F1FA}\u{1F1F8}', countryName: 'United States',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['deals', 'coupons', 'discounts', 'offers', 'sales', 'promo codes', 'deal app'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'DE', slug: 'de', language: 'de', locale: 'de-DE',
    appName: 'Angebot Box', flag: '\u{1F1E9}\u{1F1EA}', countryName: 'Deutschland',
    storeListingFile: 'de', dir: 'ltr',
    seoKeywords: ['Angebote', 'Rabatte', 'Gutscheine', 'Schnappchen', 'Aktionen', 'Deals App'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'UK', slug: 'uk', language: 'en', locale: 'en-GB',
    appName: 'Deal Box', flag: '\u{1F1EC}\u{1F1E7}', countryName: 'United Kingdom',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['deals', 'vouchers', 'discounts', 'offers', 'sales', 'money saving', 'deal finder'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'IN', slug: 'in', language: 'en', locale: 'en-IN',
    appName: 'Deal Box', flag: '\u{1F1EE}\u{1F1F3}', countryName: 'India',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['deals', 'offers', 'coupons', 'cashback', 'discounts', 'online shopping deals'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'BR', slug: 'br', language: 'pt', locale: 'pt-BR',
    appName: 'Caixa de Ofertas', flag: '\u{1F1E7}\u{1F1F7}', countryName: 'Brasil',
    storeListingFile: 'pt', dir: 'ltr',
    seoKeywords: ['ofertas', 'descontos', 'promocoes', 'cupons', 'liquidacao', 'app de ofertas'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'ID', slug: 'id', language: 'id', locale: 'id-ID',
    appName: 'Kotak Penawaran', flag: '\u{1F1EE}\u{1F1E9}', countryName: 'Indonesia',
    storeListingFile: 'id', dir: 'ltr',
    seoKeywords: ['promo', 'diskon', 'penawaran', 'cashback', 'voucher', 'aplikasi promo'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'RU', slug: 'ru', language: 'ru', locale: 'ru-RU',
    appName: '\u0411\u043e\u043a\u0441 \u0410\u043a\u0446\u0438\u0439', flag: '\u{1F1F7}\u{1F1FA}', countryName: '\u0420\u043e\u0441\u0441\u0438\u044f',
    storeListingFile: 'ru', dir: 'ltr',
    seoKeywords: ['\u0441\u043a\u0438\u0434\u043a\u0438', '\u0430\u043a\u0446\u0438\u0438', '\u043a\u0443\u043f\u043e\u043d\u044b', '\u0440\u0430\u0441\u043f\u0440\u043e\u0434\u0430\u0436\u0430', '\u043f\u0440\u043e\u043c\u043e\u043a\u043e\u0434\u044b', '\u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0441\u043a\u0438\u0434\u043e\u043a'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'MX', slug: 'mx', language: 'es', locale: 'es-MX',
    appName: 'Caja de Ofertas', flag: '\u{1F1F2}\u{1F1FD}', countryName: 'Mexico',
    storeListingFile: 'es', dir: 'ltr',
    seoKeywords: ['ofertas', 'descuentos', 'cupones', 'promociones', 'rebajas', 'app de ofertas'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'JP', slug: 'jp', language: 'ja', locale: 'ja-JP',
    appName: '\u30bb\u30fc\u30eb\u30dc\u30c3\u30af\u30b9', flag: '\u{1F1EF}\u{1F1F5}', countryName: '\u65e5\u672c',
    storeListingFile: 'ja', dir: 'ltr',
    seoKeywords: ['\u30bb\u30fc\u30eb', '\u30af\u30fc\u30dd\u30f3', '\u5272\u5f15', '\u304a\u5f97', '\u30ad\u30e3\u30f3\u30da\u30fc\u30f3', '\u30c7\u30a3\u30b9\u30ab\u30a6\u30f3\u30c8\u30a2\u30d7\u30ea'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'PH', slug: 'ph', language: 'en', locale: 'en-PH',
    appName: 'Deal Box', flag: '\u{1F1F5}\u{1F1ED}', countryName: 'Philippines',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['deals', 'promo', 'discounts', 'sale', 'vouchers', 'deal finder app'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'TH', slug: 'th', language: 'th', locale: 'th-TH',
    appName: '\u0e14\u0e35\u0e25\u0e1a\u0e47\u0e2d\u0e01\u0e0b\u0e4c', flag: '\u{1F1F9}\u{1F1ED}', countryName: '\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28\u0e44\u0e17\u0e22',
    storeListingFile: 'th', dir: 'ltr',
    seoKeywords: ['\u0e42\u0e1b\u0e23\u0e42\u0e21\u0e0a\u0e31\u0e48\u0e19', '\u0e2a\u0e48\u0e27\u0e19\u0e25\u0e14', '\u0e04\u0e39\u0e1b\u0e2d\u0e07', '\u0e14\u0e35\u0e25', '\u0e25\u0e14\u0e23\u0e32\u0e04\u0e32', '\u0e41\u0e2d\u0e1b\u0e2a\u0e48\u0e27\u0e19\u0e25\u0e14'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'CA', slug: 'ca', language: 'en', locale: 'en-CA',
    appName: 'Deal Box', flag: '\u{1F1E8}\u{1F1E6}', countryName: 'Canada',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['deals', 'coupons', 'discounts', 'flyers', 'sales', 'Canadian deals app'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'AU', slug: 'au', language: 'en', locale: 'en-AU',
    appName: 'Deal Box', flag: '\u{1F1E6}\u{1F1FA}', countryName: 'Australia',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['deals', 'bargains', 'discounts', 'offers', 'sales', 'deal finder Australia'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'FR', slug: 'fr', language: 'fr', locale: 'fr-FR',
    appName: 'Boite a Offres', flag: '\u{1F1EB}\u{1F1F7}', countryName: 'France',
    storeListingFile: 'fr', dir: 'ltr',
    seoKeywords: ['offres', 'reductions', 'bons plans', 'promotions', 'soldes', 'appli bons plans'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'IT', slug: 'it', language: 'it', locale: 'it-IT',
    appName: 'Box Offerte', flag: '\u{1F1EE}\u{1F1F9}', countryName: 'Italia',
    storeListingFile: 'it', dir: 'ltr',
    seoKeywords: ['offerte', 'sconti', 'promozioni', 'coupon', 'occasioni', 'app offerte'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'ES', slug: 'es', language: 'es', locale: 'es-ES',
    appName: 'Caja de Ofertas', flag: '\u{1F1EA}\u{1F1F8}', countryName: 'Espana',
    storeListingFile: 'es', dir: 'ltr',
    seoKeywords: ['ofertas', 'descuentos', 'cupones', 'promociones', 'rebajas', 'app de descuentos'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'EG', slug: 'eg', language: 'ar', locale: 'ar-EG',
    appName: '\u0635\u0646\u062f\u0648\u0642 \u0627\u0644\u0639\u0631\u0648\u0636', flag: '\u{1F1EA}\u{1F1EC}', countryName: '\u0645\u0635\u0631',
    storeListingFile: 'ar', dir: 'rtl',
    seoKeywords: ['\u0639\u0631\u0648\u0636', '\u062a\u062e\u0641\u064a\u0636\u0627\u062a', '\u0643\u0648\u0628\u0648\u0646\u0627\u062a', '\u062e\u0635\u0648\u0645\u0627\u062a', '\u062a\u0646\u0632\u064a\u0644\u0627\u062a', '\u062a\u0637\u0628\u064a\u0642 \u0639\u0631\u0648\u0636'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'SA', slug: 'sa', language: 'ar', locale: 'ar-SA',
    appName: '\u0635\u0646\u062f\u0648\u0642 \u0627\u0644\u0639\u0631\u0648\u0636', flag: '\u{1F1F8}\u{1F1E6}', countryName: '\u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629',
    storeListingFile: 'ar', dir: 'rtl',
    seoKeywords: ['\u0639\u0631\u0648\u0636', '\u062a\u062e\u0641\u064a\u0636\u0627\u062a', '\u0643\u0648\u0628\u0648\u0646\u0627\u062a', '\u062e\u0635\u0648\u0645\u0627\u062a', '\u062a\u0646\u0632\u064a\u0644\u0627\u062a', '\u062a\u0637\u0628\u064a\u0642 \u062a\u062e\u0641\u064a\u0636\u0627\u062a'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'KR', slug: 'kr', language: 'ko', locale: 'ko-KR',
    appName: '\ub51c\ubc15\uc2a4', flag: '\u{1F1F0}\u{1F1F7}', countryName: '\ud55c\uad6d',
    storeListingFile: 'ko', dir: 'ltr',
    seoKeywords: ['\ud560\uc778', '\ucfe0\ud3f0', '\uc138\uc77c', '\ud2b9\uac00', '\ud504\ub85c\ubaa8\uc158', '\ud560\uc778 \uc571'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'AR', slug: 'ar-country', language: 'es', locale: 'es-AR',
    appName: 'Caja de Ofertas', flag: '\u{1F1E6}\u{1F1F7}', countryName: 'Argentina',
    storeListingFile: 'es', dir: 'ltr',
    seoKeywords: ['ofertas', 'descuentos', 'cupones', 'promociones', 'rebajas', 'app de ofertas Argentina'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'AE', slug: 'ae', language: 'ar', locale: 'ar-AE',
    appName: '\u0635\u0646\u062f\u0648\u0642 \u0627\u0644\u0639\u0631\u0648\u0636', flag: '\u{1F1E6}\u{1F1EA}', countryName: 'UAE',
    storeListingFile: 'ar', dir: 'rtl',
    seoKeywords: ['\u0639\u0631\u0648\u0636', '\u062a\u062e\u0641\u064a\u0636\u0627\u062a', '\u0643\u0648\u0628\u0648\u0646\u0627\u062a', '\u062e\u0635\u0648\u0645\u0627\u062a', '\u062a\u0646\u0632\u064a\u0644\u0627\u062a', '\u062a\u0637\u0628\u064a\u0642 \u0639\u0631\u0648\u0636 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'VN', slug: 'vn', language: 'vi', locale: 'vi-VN',
    appName: 'H\u1ed9p \u01afu \u0110\u00e3i', flag: '\u{1F1FB}\u{1F1F3}', countryName: 'Vietnam',
    storeListingFile: 'vi', dir: 'ltr',
    seoKeywords: ['\u01b0u \u0111\u00e3i', 'khuy\u1ebfn m\u00e3i', 'gi\u1ea3m gi\u00e1', 'voucher', 'deal', '\u1ee9ng d\u1ee5ng khuy\u1ebfn m\u00e3i'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'PL', slug: 'pl-country', language: 'pl', locale: 'pl-PL',
    appName: 'Skrzynka Ofert', flag: '\u{1F1F5}\u{1F1F1}', countryName: 'Poland',
    storeListingFile: 'pl', dir: 'ltr',
    seoKeywords: ['oferty', 'zni\u017cki', 'kupony', 'promocje', 'wyprzeda\u017c', 'aplikacja z ofertami'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'MY', slug: 'my', language: 'ms', locale: 'ms-MY',
    appName: 'Kotak Tawaran', flag: '\u{1F1F2}\u{1F1FE}', countryName: 'Malaysia',
    storeListingFile: 'ms', dir: 'ltr',
    seoKeywords: ['tawaran', 'diskaun', 'kupon', 'promosi', 'jualan', 'aplikasi tawaran'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'CO', slug: 'co', language: 'es', locale: 'es-CO',
    appName: 'Caja de Ofertas', flag: '\u{1F1E8}\u{1F1F4}', countryName: 'Colombia',
    storeListingFile: 'es', dir: 'ltr',
    seoKeywords: ['ofertas', 'descuentos', 'cupones', 'promociones', 'rebajas', 'app de ofertas Colombia'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'ZA', slug: 'za', language: 'en', locale: 'en-ZA',
    appName: 'Deal Box', flag: '\u{1F1FF}\u{1F1E6}', countryName: 'South Africa',
    storeListingFile: 'en', dir: 'ltr',
    seoKeywords: ['deals', 'specials', 'discounts', 'coupons', 'sales', 'deal finder South Africa'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'PT', slug: 'pt-country', language: 'pt', locale: 'pt-PT',
    appName: 'Caixa de Ofertas', flag: '\u{1F1F5}\u{1F1F9}', countryName: 'Portugal',
    storeListingFile: 'pt', dir: 'ltr',
    seoKeywords: ['ofertas', 'descontos', 'promo\u00e7\u00f5es', 'cupons', 'saldos', 'app de ofertas Portugal'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'NL', slug: 'nl', language: 'nl', locale: 'nl-NL',
    appName: 'Deal Box', flag: '\u{1F1F3}\u{1F1F1}', countryName: 'Netherlands',
    storeListingFile: 'nl', dir: 'ltr',
    seoKeywords: ['aanbiedingen', 'kortingen', 'deals', 'acties', 'uitverkoop', 'kortings app'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'PK', slug: 'pk', language: 'ur', locale: 'ur-PK',
    appName: '\u0688\u06cc\u0644 \u0628\u0627\u06a9\u0633', flag: '\u{1F1F5}\u{1F1F0}', countryName: 'Pakistan',
    storeListingFile: 'ur', dir: 'rtl',
    seoKeywords: ['deals', 'discounts', '\u0622\u0641\u0631\u0632', '\u0688\u0633\u06a9\u0627\u0624\u0646\u0679', '\u0633\u06cc\u0644', 'deal app Pakistan'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
  {
    market: 'SE', slug: 'se', language: 'sv', locale: 'sv-SE',
    appName: 'Deal Box', flag: '\u{1F1F8}\u{1F1EA}', countryName: 'Sweden',
    storeListingFile: 'sv', dir: 'ltr',
    seoKeywords: ['erbjudanden', 'rabatter', 'kuponger', 'deals', 'rea', 'deal app Sverige'],
    playStoreUrl: PLAY_STORE_BASE, appStoreUrl: APP_STORE_BASE,
  },
];

export const MARKET_MAP = Object.fromEntries(
  MARKETS.map(m => [m.slug, m])
) as Record<string, MarketConfig>;
