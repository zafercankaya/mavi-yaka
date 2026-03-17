import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── German-aware slug generator ──────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Brand entry type ──────────────────────────────────────
interface BrandEntry {
  name: string;
  websiteUrl: string;
  categorySlug: string;
  seedUrls: string[];
}

// ── Category English name mapping ─────────────────────────
const CATEGORY_NAME_EN: Record<string, string> = {
  'alisveris': 'Shopping',
  'elektronik': 'Electronics',
  'giyim-moda': 'Clothing & Fashion',
  'ev-yasam': 'Home & Living',
  'gida-market': 'Grocery & Market',
  'yeme-icme': 'Food & Dining',
  'kozmetik-kisisel-bakim': 'Beauty & Personal Care',
  'spor-outdoor': 'Sports & Outdoor',
  'seyahat-ulasim': 'Travel & Transport',
  'finans': 'Finance',
  'sigorta': 'Insurance',
  'otomobil': 'Automotive',
  'kitap-hobi': 'Books & Hobbies',
};

// ── ALL DE BRANDS DATA ───────────────────────────────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon.de', websiteUrl: 'https://www.amazon.de', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.de/deals'] },
  { name: 'eBay.de', websiteUrl: 'https://www.ebay.de', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.de/deals'] },
  { name: 'Otto', websiteUrl: 'https://www.otto.de', categorySlug: 'alisveris', seedUrls: ['https://www.otto.de/sale/'] },
  { name: 'Zalando DE', websiteUrl: 'https://www.zalando.de', categorySlug: 'alisveris', seedUrls: ['https://www.zalando.de/sale/'] },
  { name: 'MediaMarkt DE', websiteUrl: 'https://www.mediamarkt.de', categorySlug: 'alisveris', seedUrls: ['https://www.mediamarkt.de/de/campaign/angebote'] },
  { name: 'Saturn', websiteUrl: 'https://www.saturn.de', categorySlug: 'alisveris', seedUrls: ['https://www.saturn.de/de/campaign/angebote'] },
  { name: 'Lidl DE', websiteUrl: 'https://www.lidl.de', categorySlug: 'alisveris', seedUrls: ['https://www.lidl.de/c/angebote/s10005951'] },
  { name: 'Kaufland DE', websiteUrl: 'https://www.kaufland.de', categorySlug: 'alisveris', seedUrls: ['https://www.kaufland.de/angebote/aktuelle-woche.html'] },
  { name: 'Idealo', websiteUrl: 'https://www.idealo.de', categorySlug: 'alisveris', seedUrls: ['https://www.idealo.de/deals/'] },
  { name: 'myToys', websiteUrl: 'https://www.mytoys.de', categorySlug: 'alisveris', seedUrls: ['https://www.mytoys.de/sale/'] },
  { name: 'About You DE', websiteUrl: 'https://www.aboutyou.de', categorySlug: 'alisveris', seedUrls: ['https://www.aboutyou.de/sale'] },
  { name: 'Bonprix DE', websiteUrl: 'https://www.bonprix.de', categorySlug: 'alisveris', seedUrls: ['https://www.bonprix.de/kategorie/sale/'] },
  { name: 'Tchibo', websiteUrl: 'https://www.tchibo.de', categorySlug: 'alisveris', seedUrls: ['https://www.tchibo.de/sale-c400098810.html'] },
  { name: 'BAUR', websiteUrl: 'https://www.baur.de', categorySlug: 'alisveris', seedUrls: ['https://www.baur.de/sale/'] },
  { name: 'Alternate', websiteUrl: 'https://www.alternate.de', categorySlug: 'alisveris', seedUrls: ['https://www.alternate.de/Deals'] },
  { name: 'Cyberport', websiteUrl: 'https://www.cyberport.de', categorySlug: 'alisveris', seedUrls: ['https://www.cyberport.de/sale.html'] },
  { name: 'Notebooksbilliger.de', websiteUrl: 'https://www.notebooksbilliger.de', categorySlug: 'alisveris', seedUrls: ['https://www.notebooksbilliger.de/angebote'] },
  { name: 'Conrad', websiteUrl: 'https://www.conrad.de', categorySlug: 'alisveris', seedUrls: ['https://www.conrad.de/de/sale.html'] },
  { name: 'PEARL', websiteUrl: 'https://www.pearl.de', categorySlug: 'alisveris', seedUrls: ['https://www.pearl.de/deals/'] },
  { name: 'Galaxus DE', websiteUrl: 'https://www.galaxus.de', categorySlug: 'alisveris', seedUrls: ['https://www.galaxus.de/de/campaign/deals'] },
  { name: 'Limango', websiteUrl: 'https://www.limango.de', categorySlug: 'alisveris', seedUrls: ['https://www.limango.de/sale'] },
  { name: 'Avocadostore', websiteUrl: 'https://www.avocadostore.de', categorySlug: 'alisveris', seedUrls: ['https://www.avocadostore.de/sale'] },
  { name: 'Rakuten DE', websiteUrl: 'https://www.rakuten.de', categorySlug: 'alisveris', seedUrls: ['https://www.rakuten.de/deals'] },
  { name: 'Shein DE', websiteUrl: 'https://de.shein.com', categorySlug: 'alisveris', seedUrls: ['https://de.shein.com/sale.html'] },
  { name: 'real.de', websiteUrl: 'https://www.kaufland.de', categorySlug: 'alisveris', seedUrls: ['https://www.kaufland.de/angebote/aktuelle-woche.html'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'MediaMarkt Elektronik', websiteUrl: 'https://www.mediamarkt.de', categorySlug: 'elektronik', seedUrls: ['https://www.mediamarkt.de/de/campaign/angebote'] },
  { name: 'Saturn Elektronik', websiteUrl: 'https://www.saturn.de', categorySlug: 'elektronik', seedUrls: ['https://www.saturn.de/de/campaign/angebote'] },
  { name: 'Alternate Elektronik', websiteUrl: 'https://www.alternate.de', categorySlug: 'elektronik', seedUrls: ['https://www.alternate.de/Deals'] },
  { name: 'Cyberport Elektronik', websiteUrl: 'https://www.cyberport.de', categorySlug: 'elektronik', seedUrls: ['https://www.cyberport.de/sale.html'] },
  { name: 'Notebooksbilliger Elektronik', websiteUrl: 'https://www.notebooksbilliger.de', categorySlug: 'elektronik', seedUrls: ['https://www.notebooksbilliger.de/angebote'] },
  { name: 'Conrad Elektronik', websiteUrl: 'https://www.conrad.de', categorySlug: 'elektronik', seedUrls: ['https://www.conrad.de/de/sale.html'] },
  { name: 'Apple DE', websiteUrl: 'https://www.apple.com/de', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/de/shop/go/product/refurbished'] },
  { name: 'Samsung DE', websiteUrl: 'https://www.samsung.com/de', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/de/offer/'] },
  { name: 'Xiaomi DE', websiteUrl: 'https://www.mi.com/de', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/de/sale'] },
  { name: 'HP DE', websiteUrl: 'https://www.hp.com/de-de', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/de-de/shop/angebote'] },
  { name: 'Lenovo DE', websiteUrl: 'https://www.lenovo.com/de/de', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/de/de/deals/'] },
  { name: 'Dell DE', websiteUrl: 'https://www.dell.com/de-de', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/de-de/shop/deals'] },
  { name: 'Asus DE', websiteUrl: 'https://www.asus.com/de', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/de/campaign/sale/'] },
  { name: 'Acer DE', websiteUrl: 'https://store.acer.com/de-de', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/de-de/sale'] },
  { name: 'Logitech DE', websiteUrl: 'https://www.logitech.com/de-de', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/de-de/promotions.html'] },
  { name: 'Sony DE', websiteUrl: 'https://www.sony.de', categorySlug: 'elektronik', seedUrls: ['https://www.sony.de/campaign/angebote'] },
  { name: 'LG DE', websiteUrl: 'https://www.lg.com/de', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/de/promotions/'] },
  { name: 'Philips DE', websiteUrl: 'https://www.philips.de', categorySlug: 'elektronik', seedUrls: ['https://www.philips.de/c-e/sale.html'] },
  { name: 'Bose DE', websiteUrl: 'https://www.bose.de', categorySlug: 'elektronik', seedUrls: ['https://www.bose.de/de_de/deals.html'] },
  { name: 'JBL DE', websiteUrl: 'https://de.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://de.jbl.com/sale/'] },
  { name: 'Razer DE', websiteUrl: 'https://www.razer.com/de-de', categorySlug: 'elektronik', seedUrls: ['https://www.razer.com/de-de/deals'] },
  { name: 'MSI DE', websiteUrl: 'https://de.msi.com', categorySlug: 'elektronik', seedUrls: ['https://de.msi.com/Promotion/'] },
  { name: 'Teufel', websiteUrl: 'https://www.teufel.de', categorySlug: 'elektronik', seedUrls: ['https://www.teufel.de/sale/'] },
  { name: 'Anker DE', websiteUrl: 'https://www.anker.com/eu-de', categorySlug: 'elektronik', seedUrls: ['https://www.anker.com/eu-de/deals'] },
  { name: 'Western Digital DE', websiteUrl: 'https://www.westerndigital.com/de-de', categorySlug: 'elektronik', seedUrls: ['https://www.westerndigital.com/de-de/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Zalando Mode', websiteUrl: 'https://www.zalando.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.zalando.de/sale/'] },
  { name: 'About You Mode', websiteUrl: 'https://www.aboutyou.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.aboutyou.de/sale'] },
  { name: 'H&M DE', websiteUrl: 'https://www2.hm.com/de_de', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/de_de/sale.html'] },
  { name: 'Zara DE', websiteUrl: 'https://www.zara.com/de', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/de/de/sale-l1702.html'] },
  { name: 'C&A', websiteUrl: 'https://www.c-and-a.com/de/de', categorySlug: 'giyim-moda', seedUrls: ['https://www.c-and-a.com/de/de/shop/sale'] },
  { name: 'Peek & Cloppenburg', websiteUrl: 'https://www.peek-cloppenburg.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.peek-cloppenburg.de/sale/'] },
  { name: 'Breuninger', websiteUrl: 'https://www.breuninger.com/de', categorySlug: 'giyim-moda', seedUrls: ['https://www.breuninger.com/de/sale/'] },
  { name: 'ASOS DE', websiteUrl: 'https://www.asos.com/de', categorySlug: 'giyim-moda', seedUrls: ['https://www.asos.com/de/sale/'] },
  { name: 'Esprit DE', websiteUrl: 'https://www.esprit.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.esprit.de/sale'] },
  { name: 's.Oliver', websiteUrl: 'https://www.s-oliver.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.s-oliver.de/sale/'] },
  { name: 'Hugo Boss DE', websiteUrl: 'https://www.hugoboss.com/de', categorySlug: 'giyim-moda', seedUrls: ['https://www.hugoboss.com/de/sale/'] },
  { name: 'Adidas DE', websiteUrl: 'https://www.adidas.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.de/sale'] },
  { name: 'Nike DE', websiteUrl: 'https://www.nike.com/de', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/de/sale'] },
  { name: 'Puma DE', websiteUrl: 'https://eu.puma.com/de/de', categorySlug: 'giyim-moda', seedUrls: ['https://eu.puma.com/de/de/sale'] },
  { name: 'Jack Wolfskin DE', websiteUrl: 'https://www.jack-wolfskin.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.jack-wolfskin.de/sale/'] },
  { name: "Marc O'Polo", websiteUrl: 'https://www.marc-o-polo.com/de-de', categorySlug: 'giyim-moda', seedUrls: ['https://www.marc-o-polo.com/de-de/sale/'] },
  { name: 'Tom Tailor', websiteUrl: 'https://www.tom-tailor.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.tom-tailor.de/sale/'] },
  { name: 'Street One', websiteUrl: 'https://www.street-one.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.street-one.de/sale/'] },
  { name: 'Cecil', websiteUrl: 'https://www.cecil.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.cecil.de/sale/'] },
  { name: 'Snipes DE', websiteUrl: 'https://www.snipes.com/de', categorySlug: 'giyim-moda', seedUrls: ['https://www.snipes.com/de/sale/'] },
  { name: 'Foot Locker DE', websiteUrl: 'https://www.footlocker.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.footlocker.de/de/sale/'] },
  { name: 'Deichmann DE', websiteUrl: 'https://www.deichmann.com/de-de', categorySlug: 'giyim-moda', seedUrls: ['https://www.deichmann.com/de-de/sale/'] },
  { name: 'Tamaris', websiteUrl: 'https://www.tamaris.com/de-de', categorySlug: 'giyim-moda', seedUrls: ['https://www.tamaris.com/de-de/sale/'] },
  { name: 'Goertz', websiteUrl: 'https://www.goertz.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.goertz.de/sale/'] },
  { name: 'Engelhorn', websiteUrl: 'https://www.engelhorn.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.engelhorn.de/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA DE', websiteUrl: 'https://www.ikea.com/de/de', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/de/de/angebote/'] },
  { name: 'Wayfair DE', websiteUrl: 'https://www.wayfair.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.wayfair.de/daily-sales/'] },
  { name: 'Home24', websiteUrl: 'https://www.home24.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.home24.de/sale/'] },
  { name: 'Westwing', websiteUrl: 'https://www.westwing.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.de/sale/'] },
  { name: 'XXXLutz', websiteUrl: 'https://www.xxxlutz.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.xxxlutz.de/angebote'] },
  { name: 'Hoeffner', websiteUrl: 'https://www.hoeffner.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.hoeffner.de/angebote'] },
  { name: 'Segmueller', websiteUrl: 'https://www.segmueller.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.segmueller.de/aktionen/'] },
  { name: 'Porta', websiteUrl: 'https://www.porta.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.porta.de/angebote/'] },
  { name: 'POCO', websiteUrl: 'https://www.poco.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.poco.de/angebote/'] },
  { name: 'Roller', websiteUrl: 'https://www.roller.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.roller.de/angebote/'] },
  { name: 'Moemax', websiteUrl: 'https://www.moemax.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.moemax.de/angebote'] },
  { name: 'Depot DE', websiteUrl: 'https://www.depot-online.com/de', categorySlug: 'ev-yasam', seedUrls: ['https://www.depot-online.com/de/sale/'] },
  { name: 'WMF', websiteUrl: 'https://www.wmf.com/de', categorySlug: 'ev-yasam', seedUrls: ['https://www.wmf.com/de/sale/'] },
  { name: 'Zwilling', websiteUrl: 'https://www.zwilling.com/de', categorySlug: 'ev-yasam', seedUrls: ['https://www.zwilling.com/de/sale/'] },
  { name: 'Villeroy & Boch', websiteUrl: 'https://www.villeroy-boch.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.villeroy-boch.de/sale.html'] },
  { name: 'Rosenthal', websiteUrl: 'https://www.rosenthal.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.rosenthal.de/sale/'] },
  { name: 'Maisons du Monde DE', websiteUrl: 'https://www.maisonsdumonde.com/DE/de', categorySlug: 'ev-yasam', seedUrls: ['https://www.maisonsdumonde.com/DE/de/sale.htm'] },
  { name: 'Butlers', websiteUrl: 'https://www.butlers.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.butlers.com/sale/'] },
  { name: 'Lampenwelt', websiteUrl: 'https://www.lampenwelt.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.lampenwelt.de/sale/'] },
  { name: 'Dyson DE', websiteUrl: 'https://www.dyson.de', categorySlug: 'ev-yasam', seedUrls: ['https://www.dyson.de/angebote'] },

  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery & Market — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Lidl Markt', websiteUrl: 'https://www.lidl.de', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.de/c/angebote/s10005951'] },
  { name: 'ALDI DE', websiteUrl: 'https://www.aldi-sued.de', categorySlug: 'gida-market', seedUrls: ['https://www.aldi-sued.de/de/angebote.html', 'https://www.aldi-nord.de/angebote.html'] },
  { name: 'REWE', websiteUrl: 'https://www.rewe.de', categorySlug: 'gida-market', seedUrls: ['https://www.rewe.de/angebote/'] },
  { name: 'Edeka', websiteUrl: 'https://www.edeka.de', categorySlug: 'gida-market', seedUrls: ['https://www.edeka.de/angebote.jsp'] },
  { name: 'Penny DE', websiteUrl: 'https://www.penny.de', categorySlug: 'gida-market', seedUrls: ['https://www.penny.de/angebote'] },
  { name: 'Netto DE', websiteUrl: 'https://www.netto-online.de', categorySlug: 'gida-market', seedUrls: ['https://www.netto-online.de/angebote/'] },
  { name: 'Kaufland Markt', websiteUrl: 'https://www.kaufland.de', categorySlug: 'gida-market', seedUrls: ['https://www.kaufland.de/angebote/aktuelle-woche.html'] },
  { name: 'Flink', websiteUrl: 'https://www.goflink.com/de-DE', categorySlug: 'gida-market', seedUrls: ['https://www.goflink.com/de-DE/'] },
  { name: 'Getir DE', websiteUrl: 'https://getir.com/de', categorySlug: 'gida-market', seedUrls: ['https://getir.com/de/'] },
  { name: 'Picnic DE', websiteUrl: 'https://www.picnic.app/de', categorySlug: 'gida-market', seedUrls: ['https://www.picnic.app/de/'] },
  { name: 'Bringmeister', websiteUrl: 'https://www.bringmeister.de', categorySlug: 'gida-market', seedUrls: ['https://www.bringmeister.de/angebote'] },
  { name: 'Flaschenpost', websiteUrl: 'https://www.flaschenpost.de', categorySlug: 'gida-market', seedUrls: ['https://www.flaschenpost.de/angebote'] },
  { name: 'HelloFresh DE', websiteUrl: 'https://www.hellofresh.de', categorySlug: 'gida-market', seedUrls: ['https://www.hellofresh.de/plans'] },
  { name: 'Eismann', websiteUrl: 'https://www.eismann.de', categorySlug: 'gida-market', seedUrls: ['https://www.eismann.de/angebote/'] },
  { name: 'MyTime', websiteUrl: 'https://www.mytime.de', categorySlug: 'gida-market', seedUrls: ['https://www.mytime.de/angebote/'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Dining — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Lieferando', websiteUrl: 'https://www.lieferando.de', categorySlug: 'yeme-icme', seedUrls: ['https://www.lieferando.de/angebote'] },
  { name: 'Wolt DE', websiteUrl: 'https://wolt.com/de/deu', categorySlug: 'yeme-icme', seedUrls: ['https://wolt.com/de/deu/'] },
  { name: 'Uber Eats DE', websiteUrl: 'https://www.ubereats.com/de', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/de/'] },
  { name: "Domino's DE", websiteUrl: 'https://www.dominos.de', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.de/angebote'] },
  { name: 'Pizza Hut DE', websiteUrl: 'https://www.pizzahut.de', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.de/deals'] },
  { name: "McDonald's DE", websiteUrl: 'https://www.mcdonalds.com/de/de-de.html', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com/de/de-de/aktionen.html'] },
  { name: 'Burger King DE', websiteUrl: 'https://www.burgerking.de', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.de/angebote'] },
  { name: 'KFC DE', websiteUrl: 'https://www.kfc.de', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.de/angebote'] },
  { name: 'Subway DE', websiteUrl: 'https://www.subway.com/de-DE', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/de-DE/menunutrition/deals'] },
  { name: 'Vapiano', websiteUrl: 'https://de.vapiano.com', categorySlug: 'yeme-icme', seedUrls: ['https://de.vapiano.com/de/angebote/'] },
  { name: "Hans im Glueck", websiteUrl: 'https://hansimglueck-burgergrill.de', categorySlug: 'yeme-icme', seedUrls: ['https://hansimglueck-burgergrill.de/angebote/'] },
  { name: 'Peter Pane', websiteUrl: 'https://www.peterpane.de', categorySlug: 'yeme-icme', seedUrls: ['https://www.peterpane.de/aktionen/'] },
  { name: "L'Osteria DE", websiteUrl: 'https://losteria.net/de/de', categorySlug: 'yeme-icme', seedUrls: ['https://losteria.net/de/de/aktionen/'] },
  { name: 'Block House', websiteUrl: 'https://www.block-house.de', categorySlug: 'yeme-icme', seedUrls: ['https://www.block-house.de/aktionen/'] },
  { name: 'Nordsee', websiteUrl: 'https://www.nordsee.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.nordsee.com/de/angebote/'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty & Personal Care — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Douglas', websiteUrl: 'https://www.douglas.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.douglas.de/de/c/sale/010000'] },
  { name: 'Flaconi', websiteUrl: 'https://www.flaconi.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.flaconi.de/sale/'] },
  { name: 'Sephora DE', websiteUrl: 'https://www.sephora.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.de/sale/'] },
  { name: 'dm-drogerie', websiteUrl: 'https://www.dm.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dm.de/angebote'] },
  { name: 'Rossmann DE', websiteUrl: 'https://www.rossmann.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rossmann.de/de/angebote'] },
  { name: 'Mueller DE', websiteUrl: 'https://www.mueller.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mueller.de/angebote/'] },
  { name: 'The Body Shop DE', websiteUrl: 'https://www.thebodyshop.com/de-de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com/de-de/sale/'] },
  { name: 'Rituals DE', websiteUrl: 'https://www.rituals.com/de-de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/de-de/sale'] },
  { name: 'MAC DE', websiteUrl: 'https://www.maccosmetics.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.de/angebote'] },
  { name: 'Parfumdreams', websiteUrl: 'https://www.parfumdreams.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.parfumdreams.de/sale/'] },
  { name: 'Notino DE', websiteUrl: 'https://www.notino.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.notino.de/sale/'] },
  { name: "Kiehl's DE", websiteUrl: 'https://www.kiehls.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.de/angebote'] },
  { name: "L'Oreal Paris DE", websiteUrl: 'https://www.loreal-paris.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.de/angebote'] },
  { name: 'Nivea DE', websiteUrl: 'https://www.nivea.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.de/angebote'] },
  { name: 'Schwarzkopf', websiteUrl: 'https://www.schwarzkopf.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.schwarzkopf.de/de/angebote.html'] },
  { name: 'Weleda', websiteUrl: 'https://www.weleda.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.weleda.de/sale'] },
  { name: 'Dr. Hauschka', websiteUrl: 'https://www.dr.hauschka.com/de_DE', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dr.hauschka.com/de_DE/angebote/'] },
  { name: 'Lavera', websiteUrl: 'https://www.lavera.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lavera.de/sale/'] },
  { name: "Paula's Choice DE", websiteUrl: 'https://www.paulas-choice.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.paulas-choice.de/sale'] },
  { name: 'Lookfantastic DE', websiteUrl: 'https://www.lookfantastic.de', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lookfantastic.de/angebote.list'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon DE', websiteUrl: 'https://www.decathlon.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.de/sale'] },
  { name: 'SportScheck', websiteUrl: 'https://www.sportscheck.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportscheck.com/sale/'] },
  { name: 'Intersport DE', websiteUrl: 'https://www.intersport.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.de/sale/'] },
  { name: 'Adidas Sport DE', websiteUrl: 'https://www.adidas.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.de/sale'] },
  { name: 'Nike Sport DE', websiteUrl: 'https://www.nike.com/de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/de/sale'] },
  { name: 'Puma Sport DE', websiteUrl: 'https://eu.puma.com/de/de', categorySlug: 'spor-outdoor', seedUrls: ['https://eu.puma.com/de/de/sale'] },
  { name: 'Jack Wolfskin Sport', websiteUrl: 'https://www.jack-wolfskin.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jack-wolfskin.de/sale/'] },
  { name: 'Bergfreunde', websiteUrl: 'https://www.bergfreunde.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bergfreunde.de/sale/'] },
  { name: 'Globetrotter', websiteUrl: 'https://www.globetrotter.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.globetrotter.de/sale/'] },
  { name: 'Mammut DE', websiteUrl: 'https://www.mammut.com/de/de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mammut.com/de/de/sale/'] },
  { name: 'The North Face DE', websiteUrl: 'https://www.thenorthface.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.de/sale/'] },
  { name: 'Vaude', websiteUrl: 'https://www.vaude.com/de-DE', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vaude.com/de-DE/sale/'] },
  { name: 'Reebok DE', websiteUrl: 'https://www.reebok.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.de/sale'] },
  { name: 'Under Armour DE', websiteUrl: 'https://www.underarmour.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.de/de-de/c/sale/'] },
  { name: 'Asics DE', websiteUrl: 'https://www.asics.com/de/de-de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/de/de-de/sale/'] },
  { name: 'Brooks DE', websiteUrl: 'https://www.brooksrunning.com/de_de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.brooksrunning.com/de_de/sale/'] },
  { name: 'Salomon DE', websiteUrl: 'https://www.salomon.com/de-de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/de-de/sale/'] },
  { name: 'Patagonia DE', websiteUrl: 'https://eu.patagonia.com/de/de', categorySlug: 'spor-outdoor', seedUrls: ['https://eu.patagonia.com/de/de/shop/web-specials/'] },
  { name: 'Outdooractive', websiteUrl: 'https://www.outdooractive.com/de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.outdooractive.com/de/'] },
  { name: 'Bergzeit', websiteUrl: 'https://www.bergzeit.de', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bergzeit.de/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Lufthansa', websiteUrl: 'https://www.lufthansa.com/de/de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lufthansa.com/de/de/angebote'] },
  { name: 'Eurowings', websiteUrl: 'https://www.eurowings.com/de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.eurowings.com/de/angebote.html'] },
  { name: 'Ryanair DE', websiteUrl: 'https://www.ryanair.com/de/de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/de/de/lp/deals'] },
  { name: 'easyJet DE', websiteUrl: 'https://www.easyjet.com/de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easyjet.com/de/sale'] },
  { name: 'FlixBus DE', websiteUrl: 'https://www.flixbus.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.de/aktionen'] },
  { name: 'Deutsche Bahn', websiteUrl: 'https://www.bahn.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bahn.de/angebot/sparpreis'] },
  { name: 'Check24 Reisen', websiteUrl: 'https://urlaub.check24.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://urlaub.check24.de/'] },
  { name: 'HolidayCheck', websiteUrl: 'https://www.holidaycheck.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.holidaycheck.de/deals'] },
  { name: 'Booking.com DE', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.de.html'] },
  { name: 'Expedia DE', websiteUrl: 'https://www.expedia.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.de/deals'] },
  { name: 'TUI DE', websiteUrl: 'https://www.tui.com/de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tui.com/angebote/'] },
  { name: 'FTI', websiteUrl: 'https://www.fti.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fti.de/angebote/'] },
  { name: 'Sixt DE', websiteUrl: 'https://www.sixt.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sixt.de/angebote/'] },
  { name: 'Europcar DE', websiteUrl: 'https://www.europcar.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.de/angebote'] },
  { name: 'SHARE NOW', websiteUrl: 'https://www.share-now.com/de/de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.share-now.com/de/de/'] },
  { name: 'ADAC Reisen', websiteUrl: 'https://www.adac.de/reise', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.adac.de/reise/angebote/'] },
  { name: 'Omio', websiteUrl: 'https://www.omio.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.omio.de/deals'] },
  { name: 'Trivago DE', websiteUrl: 'https://www.trivago.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.de/'] },
  { name: 'GetYourGuide DE', websiteUrl: 'https://www.getyourguide.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.getyourguide.de/deals/'] },
  { name: 'Airbnb DE', websiteUrl: 'https://www.airbnb.de', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.de/'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Check24', websiteUrl: 'https://www.check24.de', categorySlug: 'finans', seedUrls: ['https://www.check24.de/konto-kredit/'] },
  { name: 'Verivox Finanz', websiteUrl: 'https://www.verivox.de', categorySlug: 'finans', seedUrls: ['https://www.verivox.de/girokonto/'] },
  { name: 'N26', websiteUrl: 'https://n26.com/de-de', categorySlug: 'finans', seedUrls: ['https://n26.com/de-de/angebote'] },
  { name: 'Trade Republic', websiteUrl: 'https://traderepublic.com/de-de', categorySlug: 'finans', seedUrls: ['https://traderepublic.com/de-de/'] },
  { name: 'DKB', websiteUrl: 'https://www.dkb.de', categorySlug: 'finans', seedUrls: ['https://www.dkb.de/privatkunden/'] },
  { name: 'ING DE', websiteUrl: 'https://www.ing.de', categorySlug: 'finans', seedUrls: ['https://www.ing.de/girokonto/'] },
  { name: 'Commerzbank', websiteUrl: 'https://www.commerzbank.de', categorySlug: 'finans', seedUrls: ['https://www.commerzbank.de/angebote/'] },
  { name: 'Sparkasse', websiteUrl: 'https://www.sparkasse.de', categorySlug: 'finans', seedUrls: ['https://www.sparkasse.de/unsere-loesungen/angebote.html'] },
  { name: 'PayPal DE', websiteUrl: 'https://www.paypal.com/de', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/de/webapps/mpp/offers'] },
  { name: 'Klarna DE', websiteUrl: 'https://www.klarna.com/de', categorySlug: 'finans', seedUrls: ['https://www.klarna.com/de/deals/'] },
  { name: 'Scalable Capital', websiteUrl: 'https://de.scalable.capital', categorySlug: 'finans', seedUrls: ['https://de.scalable.capital/'] },
  { name: 'Finanzcheck', websiteUrl: 'https://www.finanzcheck.de', categorySlug: 'finans', seedUrls: ['https://www.finanzcheck.de/angebote/'] },
  { name: 'Smava', websiteUrl: 'https://www.smava.de', categorySlug: 'finans', seedUrls: ['https://www.smava.de/kredit/'] },
  { name: 'auxmoney', websiteUrl: 'https://www.auxmoney.com', categorySlug: 'finans', seedUrls: ['https://www.auxmoney.com/angebote'] },
  { name: 'Clark', websiteUrl: 'https://www.clark.de', categorySlug: 'finans', seedUrls: ['https://www.clark.de/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Check24 Versicherung', websiteUrl: 'https://www.check24.de/versicherungen', categorySlug: 'sigorta', seedUrls: ['https://www.check24.de/versicherungen/'] },
  { name: 'HUK-COBURG', websiteUrl: 'https://www.huk.de', categorySlug: 'sigorta', seedUrls: ['https://www.huk.de/angebote/'] },
  { name: 'Allianz DE', websiteUrl: 'https://www.allianz.de', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.de/angebote/'] },
  { name: 'AXA DE', websiteUrl: 'https://www.axa.de', categorySlug: 'sigorta', seedUrls: ['https://www.axa.de/angebote'] },
  { name: 'ERGO', websiteUrl: 'https://www.ergo.de', categorySlug: 'sigorta', seedUrls: ['https://www.ergo.de/de/Produkte'] },
  { name: 'Generali DE', websiteUrl: 'https://www.generali.de', categorySlug: 'sigorta', seedUrls: ['https://www.generali.de/produkte/'] },
  { name: 'Zurich DE', websiteUrl: 'https://www.zurich.de', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.de/de-de/angebote'] },
  { name: 'Debeka', websiteUrl: 'https://www.debeka.de', categorySlug: 'sigorta', seedUrls: ['https://www.debeka.de/produkte/'] },
  { name: 'Gothaer', websiteUrl: 'https://www.gothaer.de', categorySlug: 'sigorta', seedUrls: ['https://www.gothaer.de/privatkunden/'] },
  { name: 'HDI DE', websiteUrl: 'https://www.hdi.de', categorySlug: 'sigorta', seedUrls: ['https://www.hdi.de/privatkunden/'] },
  { name: 'R+V Versicherung', websiteUrl: 'https://www.ruv.de', categorySlug: 'sigorta', seedUrls: ['https://www.ruv.de/'] },
  { name: 'Verivox Versicherung', websiteUrl: 'https://www.verivox.de', categorySlug: 'sigorta', seedUrls: ['https://www.verivox.de/versicherungsvergleich/'] },
  { name: 'CosmosDirekt', websiteUrl: 'https://www.cosmosdirekt.de', categorySlug: 'sigorta', seedUrls: ['https://www.cosmosdirekt.de/angebote/'] },
  { name: 'DEVK', websiteUrl: 'https://www.devk.de', categorySlug: 'sigorta', seedUrls: ['https://www.devk.de/privatkunden/'] },
  { name: 'Wuerttembergische', websiteUrl: 'https://www.wuerttembergische.de', categorySlug: 'sigorta', seedUrls: ['https://www.wuerttembergische.de/de/privatkunden/'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Volkswagen DE', websiteUrl: 'https://www.volkswagen.de', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.de/de/angebote.html'] },
  { name: 'BMW DE', websiteUrl: 'https://www.bmw.de', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.de/de/angebote.html'] },
  { name: 'Mercedes-Benz DE', websiteUrl: 'https://www.mercedes-benz.de', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.de/passengercars/campaigns.html'] },
  { name: 'Audi DE', websiteUrl: 'https://www.audi.de', categorySlug: 'otomobil', seedUrls: ['https://www.audi.de/de/brand/de/angebote.html'] },
  { name: 'Opel DE', websiteUrl: 'https://www.opel.de', categorySlug: 'otomobil', seedUrls: ['https://www.opel.de/angebote.html'] },
  { name: 'Porsche DE', websiteUrl: 'https://www.porsche.com/germany', categorySlug: 'otomobil', seedUrls: ['https://www.porsche.com/germany/models/'] },
  { name: 'Ford DE', websiteUrl: 'https://www.ford.de', categorySlug: 'otomobil', seedUrls: ['https://www.ford.de/angebote'] },
  { name: 'Toyota DE', websiteUrl: 'https://www.toyota.de', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.de/angebote-aktionen'] },
  { name: 'Hyundai DE', websiteUrl: 'https://www.hyundai.com/de', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/de/angebote.html'] },
  { name: 'Kia DE', websiteUrl: 'https://www.kia.com/de', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/de/angebote/'] },
  { name: 'Skoda DE', websiteUrl: 'https://www.skoda.de', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.de/angebote'] },
  { name: 'Seat Cupra DE', websiteUrl: 'https://www.seat.de', categorySlug: 'otomobil', seedUrls: ['https://www.seat.de/angebote.html', 'https://www.cupraofficial.de/angebote.html'] },
  { name: 'Tesla DE', websiteUrl: 'https://www.tesla.com/de_DE', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/de_DE/inventory/new/m3'] },
  { name: 'mobile.de', websiteUrl: 'https://www.mobile.de', categorySlug: 'otomobil', seedUrls: ['https://www.mobile.de/'] },
  { name: 'AutoScout24', websiteUrl: 'https://www.autoscout24.de', categorySlug: 'otomobil', seedUrls: ['https://www.autoscout24.de/angebote/'] },
  { name: 'ADAC', websiteUrl: 'https://www.adac.de', categorySlug: 'otomobil', seedUrls: ['https://www.adac.de/rund-ums-fahrzeug/'] },
  { name: 'A.T.U', websiteUrl: 'https://www.atu.de', categorySlug: 'otomobil', seedUrls: ['https://www.atu.de/angebote'] },
  { name: 'Euromaster DE', websiteUrl: 'https://www.euromaster.de', categorySlug: 'otomobil', seedUrls: ['https://www.euromaster.de/angebote'] },
  { name: 'Vergoelst', websiteUrl: 'https://www.vergoelst.de', categorySlug: 'otomobil', seedUrls: ['https://www.vergoelst.de/angebote/'] },
  { name: 'Reifen.com', websiteUrl: 'https://www.reifen.com', categorySlug: 'otomobil', seedUrls: ['https://www.reifen.com/angebote/'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Thalia', websiteUrl: 'https://www.thalia.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.thalia.de/sale/'] },
  { name: 'Amazon Books DE', websiteUrl: 'https://www.amazon.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.de/deals?ref=books'] },
  { name: 'Hugendubel', websiteUrl: 'https://www.hugendubel.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hugendubel.de/de/sale/'] },
  { name: 'Weltbild', websiteUrl: 'https://www.weltbild.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.weltbild.de/sale/'] },
  { name: 'buecher.de', websiteUrl: 'https://www.buecher.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.buecher.de/sale/'] },
  { name: 'Medimops', websiteUrl: 'https://www.medimops.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.medimops.de/sale/'] },
  { name: 'reBuy', websiteUrl: 'https://www.rebuy.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.rebuy.de/angebote'] },
  { name: 'booklooker', websiteUrl: 'https://www.booklooker.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.booklooker.de/'] },
  { name: 'Lego DE', websiteUrl: 'https://www.lego.com/de-de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/de-de/offers'] },
  { name: 'Ravensburger', websiteUrl: 'https://www.ravensburger.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ravensburger.de/sale/'] },
  { name: 'PLAYMOBIL', websiteUrl: 'https://www.playmobil.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.playmobil.de/sale'] },
  { name: 'Thomann', websiteUrl: 'https://www.thomann.de', categorySlug: 'kitap-hobi', seedUrls: ['https://www.thomann.de/de/deals.html'] },
  { name: 'Hobby Lobby DE', websiteUrl: 'https://www.hobbylobby.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbylobby.com/sale'] },
  { name: 'Idee Creativmarkt', websiteUrl: 'https://www.idee-shop.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.idee-shop.com/sale/'] },
  { name: 'VBS Hobby', websiteUrl: 'https://www.vbs-hobby.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.vbs-hobby.com/sale/'] },
];

// ── Deduplicate by slug (first entry wins) ────────────────
function deduplicateBrands(brands: BrandEntry[]): BrandEntry[] {
  const seen = new Map<string, BrandEntry>();
  for (const b of brands) {
    const slug = toSlug(b.name);
    if (!seen.has(slug)) {
      seen.set(slug, b);
    }
  }
  return Array.from(seen.values());
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log('=== DE Market Brand Seed Script ===\n');

  // 1. Ensure English names for categories
  for (const [slug, nameEn] of Object.entries(CATEGORY_NAME_EN)) {
    await prisma.category.updateMany({
      where: { slug },
      data: { nameEn },
    });
  }
  console.log(`Updated English names for ${Object.keys(CATEGORY_NAME_EN).length} categories.\n`);

  // Load all categories into a slug -> id map
  const allCats = await prisma.category.findMany();
  const categoryMap = new Map<string, string>();
  for (const c of allCats) {
    categoryMap.set(c.slug, c.id);
  }
  console.log(`Categories ready: ${categoryMap.size} total\n`);

  // 2. Deduplicate
  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Total brands: ${uniqueBrands.length} (${BRANDS.length - uniqueBrands.length} duplicates skipped)\n`);

  // 3. Process brands + sources
  let brandsOk = 0;
  let sourcesCreated = 0;
  let sourcesUpdated = 0;
  let errors = 0;

  for (const entry of uniqueBrands) {
    const slug = toSlug(entry.name);
    const categoryId = categoryMap.get(entry.categorySlug) ?? null;

    if (!categoryId) {
      console.warn(`  Category not found: ${entry.categorySlug} (brand: ${entry.name})`);
      errors++;
      continue;
    }

    try {
      // Upsert brand with DE market (unique on slug+market)
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'DE' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'DE',
          categoryId,
        },
      });

      // Check for existing crawl source
      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, crawlMethod: 'HTML' },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Deals`,
            crawlMethod: 'HTML',
            seedUrls: entry.seedUrls,
            maxDepth: 2,
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'DE',
            isActive: true,
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'DE' },
          });
          sourcesUpdated++;
        }
      }

      brandsOk++;
      if (brandsOk % 50 === 0) console.log(`  Processed: ${brandsOk}/${uniqueBrands.length}`);
    } catch (err) {
      console.error(`  ERROR: ${entry.name} (${slug}) — ${(err as Error).message}`);
      errors++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Brands:           ${brandsOk} ok, ${errors} errors`);
  console.log(`New sources:      ${sourcesCreated}`);
  console.log(`Updated sources:  ${sourcesUpdated}`);

  // 4. Summary of all DE sources
  const totalDESources = await prisma.crawlSource.count({
    where: { market: 'DE', isActive: true },
  });
  console.log(`Total active DE sources: ${totalDESources}`);
  console.log('\nDone! To trigger crawl: POST /admin/crawl/trigger-all');
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
