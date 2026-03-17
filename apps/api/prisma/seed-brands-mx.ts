import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── Slug generator ──────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
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
  'kozmetik-kisisel-bakim': 'Health & Beauty',
  'spor-outdoor': 'Sports & Outdoor',
  'seyahat-ulasim': 'Travel & Tourism',
  'finans': 'Finance',
  'sigorta': 'Education',
  'otomobil': 'Automotive',
  'kitap-hobi': 'Books & Hobbies',
};

// ── ALL MX BRANDS DATA ───────────────────────────────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Mercado Libre Mexico', websiteUrl: 'https://www.mercadolibre.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.mercadolibre.com.mx/ofertas', 'https://www.mercadolibre.com.mx/descuentos'] },
  { name: 'Amazon Mexico', websiteUrl: 'https://www.amazon.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.com.mx/deals', 'https://www.amazon.com.mx/gp/goldbox'] },
  { name: 'Liverpool', websiteUrl: 'https://www.liverpool.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.liverpool.com.mx/tienda/promociones', 'https://www.liverpool.com.mx/tienda/ofertas'] },
  { name: 'Coppel', websiteUrl: 'https://www.coppel.com', categorySlug: 'alisveris', seedUrls: ['https://www.coppel.com/ofertas', 'https://www.coppel.com/promociones'] },
  { name: 'Walmart Mexico', websiteUrl: 'https://www.walmart.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.walmart.com.mx/ofertas', 'https://www.walmart.com.mx/promociones'] },
  { name: 'Palacio de Hierro', websiteUrl: 'https://www.elpalaciodehierro.com', categorySlug: 'alisveris', seedUrls: ['https://www.elpalaciodehierro.com/ofertas', 'https://www.elpalaciodehierro.com/sale'] },
  { name: 'Costco Mexico', websiteUrl: 'https://www.costco.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.costco.com.mx/ofertas', 'https://www.costco.com.mx/promociones'] },
  { name: "Sam's Club Mexico", websiteUrl: 'https://www.sams.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.sams.com.mx/ofertas', 'https://www.sams.com.mx/promociones'] },
  { name: 'Elektra', websiteUrl: 'https://www.elektra.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.elektra.com.mx/ofertas', 'https://www.elektra.com.mx/promociones'] },
  { name: 'Soriana', websiteUrl: 'https://www.soriana.com', categorySlug: 'alisveris', seedUrls: ['https://www.soriana.com/ofertas', 'https://www.soriana.com/promociones'] },
  { name: 'Linio Mexico', websiteUrl: 'https://www.linio.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.linio.com.mx/ofertas', 'https://www.linio.com.mx/promociones'] },
  { name: 'Claro Shop', websiteUrl: 'https://www.claroshop.com', categorySlug: 'alisveris', seedUrls: ['https://www.claroshop.com/ofertas', 'https://www.claroshop.com/promociones'] },
  { name: 'Sanborns', websiteUrl: 'https://www.sanborns.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.sanborns.com.mx/ofertas', 'https://www.sanborns.com.mx/promociones'] },
  { name: 'Sears Mexico', websiteUrl: 'https://www.sears.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.sears.com.mx/ofertas', 'https://www.sears.com.mx/promociones'] },
  { name: 'Suburbia', websiteUrl: 'https://www.suburbia.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.suburbia.com.mx/ofertas', 'https://www.suburbia.com.mx/promociones'] },
  { name: 'Chedraui Online', websiteUrl: 'https://www.chedraui.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.chedraui.com.mx/ofertas', 'https://www.chedraui.com.mx/promociones'] },
  { name: 'Bodega Aurrera', websiteUrl: 'https://www.bodegaaurrera.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.bodegaaurrera.com.mx/ofertas', 'https://www.bodegaaurrera.com.mx/promociones'] },
  { name: 'Shein Mexico', websiteUrl: 'https://mx.shein.com', categorySlug: 'alisveris', seedUrls: ['https://mx.shein.com/sale.html', 'https://mx.shein.com/flash-sale.html'] },
  { name: 'AliExpress Mexico', websiteUrl: 'https://es.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://es.aliexpress.com/campaign/wow/gcp-plus/ae/right/msite/2024/newSuperDeals'] },
  { name: 'Privalia Mexico', websiteUrl: 'https://www.privalia.com/mx', categorySlug: 'alisveris', seedUrls: ['https://www.privalia.com/mx/'] },
  { name: 'MercadoPago', websiteUrl: 'https://www.mercadopago.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.mercadopago.com.mx/ofertas', 'https://www.mercadopago.com.mx/promociones'] },
  { name: 'Temu Mexico', websiteUrl: 'https://www.temu.com/mx', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/mx/sale.html'] },
  { name: 'Office Depot Mexico', websiteUrl: 'https://www.officedepot.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.officedepot.com.mx/officedepot/en/Ofertas', 'https://www.officedepot.com.mx/officedepot/en/promociones'] },
  { name: 'Miniso Mexico', websiteUrl: 'https://www.miniso.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.miniso.com.mx/promociones'] },
  { name: 'Sodimac Mexico', websiteUrl: 'https://www.sodimac.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.sodimac.com.mx/sodimac-mx/content/ofertas'] },
  { name: 'HEB Mexico', websiteUrl: 'https://www.heb.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.heb.com.mx/ofertas', 'https://www.heb.com.mx/promociones'] },
  { name: 'La Comer', websiteUrl: 'https://www.lacomer.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.lacomer.com.mx/lacomer/ofertas'] },
  { name: 'Fresko', websiteUrl: 'https://www.fresko.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.fresko.com.mx/ofertas'] },
  { name: 'City Market', websiteUrl: 'https://www.citymarket.com.mx', categorySlug: 'alisveris', seedUrls: ['https://www.citymarket.com.mx/ofertas'] },
  { name: 'Ofix Mexico', websiteUrl: 'https://www.ofix.mx', categorySlug: 'alisveris', seedUrls: ['https://www.ofix.mx/ofertas', 'https://www.ofix.mx/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Best Buy Mexico', websiteUrl: 'https://www.bestbuy.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.bestbuy.com.mx/ofertas', 'https://www.bestbuy.com.mx/promociones'] },
  { name: 'Steren', websiteUrl: 'https://www.steren.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.steren.com.mx/ofertas', 'https://www.steren.com.mx/promociones'] },
  { name: 'RadioShack Mexico', websiteUrl: 'https://www.radioshack.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.radioshack.com.mx/ofertas', 'https://www.radioshack.com.mx/promociones'] },
  { name: 'Apple Mexico', websiteUrl: 'https://www.apple.com/mx', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/mx/shop/go/product/', 'https://www.apple.com/mx/shop/buy-iphone'] },
  { name: 'Samsung Mexico', websiteUrl: 'https://www.samsung.com/mx', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/mx/offer/', 'https://www.samsung.com/mx/smartphones/all-smartphones/'] },
  { name: 'Huawei Mexico', websiteUrl: 'https://consumer.huawei.com/mx', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/mx/offer/'] },
  { name: 'Xiaomi Mexico', websiteUrl: 'https://www.mi.com/mx', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/mx/sale'] },
  { name: 'Sony Mexico', websiteUrl: 'https://store.sony.com.mx', categorySlug: 'elektronik', seedUrls: ['https://store.sony.com.mx/ofertas', 'https://store.sony.com.mx/promociones'] },
  { name: 'LG Mexico', websiteUrl: 'https://www.lg.com/mx', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/mx/promociones'] },
  { name: 'HP Mexico', websiteUrl: 'https://www.hp.com/mx-es', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/mx-es/shop/ofertas', 'https://www.hp.com/mx-es/shop/promociones'] },
  { name: 'Lenovo Mexico', websiteUrl: 'https://www.lenovo.com/mx/es', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/mx/es/d/ofertas/', 'https://www.lenovo.com/mx/es/d/promociones/'] },
  { name: 'Dell Mexico', websiteUrl: 'https://www.dell.com/es-mx', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/es-mx/shop/deals'] },
  { name: 'PCEL', websiteUrl: 'https://pcel.com', categorySlug: 'elektronik', seedUrls: ['https://pcel.com/ofertas', 'https://pcel.com/promociones'] },
  { name: 'CyberPuerta', websiteUrl: 'https://www.cyberpuerta.mx', categorySlug: 'elektronik', seedUrls: ['https://www.cyberpuerta.mx/ofertas/', 'https://www.cyberpuerta.mx/Promociones/'] },
  { name: 'DDTECH', websiteUrl: 'https://ddtech.mx', categorySlug: 'elektronik', seedUrls: ['https://ddtech.mx/ofertas', 'https://ddtech.mx/promociones'] },
  { name: 'Mercado Libre Electro', websiteUrl: 'https://www.mercadolibre.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.mercadolibre.com.mx/ofertas/electronica'] },
  { name: 'iShop Mexico', websiteUrl: 'https://www.ishop.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.ishop.com.mx/ofertas', 'https://www.ishop.com.mx/promociones'] },
  { name: 'MacStore Mexico', websiteUrl: 'https://www.macstore.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.macstore.com.mx/ofertas', 'https://www.macstore.com.mx/promociones'] },
  { name: 'Microsoft Mexico', websiteUrl: 'https://www.microsoft.com/es-mx', categorySlug: 'elektronik', seedUrls: ['https://www.microsoft.com/es-mx/store/b/sale'] },
  { name: 'Motorola Mexico', websiteUrl: 'https://www.motorola.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.com.mx/ofertas'] },
  { name: 'Telcel', websiteUrl: 'https://www.telcel.com', categorySlug: 'elektronik', seedUrls: ['https://www.telcel.com/promociones', 'https://www.telcel.com/ofertas'] },
  { name: 'AT&T Mexico', websiteUrl: 'https://www.att.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.att.com.mx/promociones', 'https://www.att.com.mx/ofertas'] },
  { name: 'Movistar Mexico', websiteUrl: 'https://www.movistar.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.movistar.com.mx/promociones'] },
  { name: 'Totalplay', websiteUrl: 'https://www.totalplay.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.totalplay.com.mx/promociones'] },
  { name: 'Telmex', websiteUrl: 'https://www.telmex.com', categorySlug: 'elektronik', seedUrls: ['https://www.telmex.com/promociones'] },
  { name: 'Bose Mexico', websiteUrl: 'https://www.bose.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.bose.com.mx/es_mx/offers.html'] },
  { name: 'JBL Mexico', websiteUrl: 'https://mx.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://mx.jbl.com/ofertas.html'] },
  { name: 'Logitech Mexico', websiteUrl: 'https://www.logitech.com/es-mx', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/es-mx/promo.html'] },
  { name: 'Canon Mexico', websiteUrl: 'https://www.canon.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.canon.com.mx/promociones'] },
  { name: 'Nikon Mexico', websiteUrl: 'https://www.nikon.com.mx', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.com.mx/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion & Clothing — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Zara Mexico', websiteUrl: 'https://www.zara.com/mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/mx/es/woman-special-prices-l1314.html', 'https://www.zara.com/mx/es/man-special-prices-l806.html'] },
  { name: 'H&M Mexico', websiteUrl: 'https://www2.hm.com/es_mx', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/es_mx/sale.html', 'https://www2.hm.com/es_mx/ofertas.html'] },
  { name: 'C&A Mexico', websiteUrl: 'https://www.cyamoda.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.cyamoda.com/ofertas', 'https://www.cyamoda.com/sale'] },
  { name: 'Pull & Bear Mexico', websiteUrl: 'https://www.pullandbear.com/mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/mx/mujer/sale-n6486.html', 'https://www.pullandbear.com/mx/hombre/sale-n6487.html'] },
  { name: 'Bershka Mexico', websiteUrl: 'https://www.bershka.com/mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/mx/mujer/sale-c1010378033.html'] },
  { name: 'Stradivarius Mexico', websiteUrl: 'https://www.stradivarius.com/mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/mx/mujer/sale-c1718512.html'] },
  { name: 'Massimo Dutti Mexico', websiteUrl: 'https://www.massimodutti.com/mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/mx/mujer/sale-n1666.html'] },
  { name: 'Oysho Mexico', websiteUrl: 'https://www.oysho.com/mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.oysho.com/mx/sale-c1010340560.html'] },
  { name: 'Forever 21 Mexico', websiteUrl: 'https://www.forever21.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.forever21.com.mx/sale', 'https://www.forever21.com.mx/ofertas'] },
  { name: 'Levis Mexico', websiteUrl: 'https://www.levi.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com.mx/sale', 'https://www.levi.com.mx/ofertas'] },
  { name: 'Guess Mexico', websiteUrl: 'https://www.guess.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.com.mx/sale'] },
  { name: 'Tommy Hilfiger Mexico', websiteUrl: 'https://mx.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://mx.tommy.com/sale'] },
  { name: 'Calvin Klein Mexico', websiteUrl: 'https://www.calvinklein.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.com.mx/sale'] },
  { name: 'Lacoste Mexico', websiteUrl: 'https://www.lacoste.com/mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com/mx/sale/'] },
  { name: 'GAP Mexico', websiteUrl: 'https://www.gap.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.gap.com.mx/sale', 'https://www.gap.com.mx/ofertas'] },
  { name: 'Old Navy Mexico', websiteUrl: 'https://oldnavy.gap.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://oldnavy.gap.com.mx/sale'] },
  { name: 'Banana Republic Mexico', websiteUrl: 'https://bananarepublic.gap.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://bananarepublic.gap.com.mx/sale'] },
  { name: 'Mango Mexico', websiteUrl: 'https://shop.mango.com/mx', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/mx/mujer/rebajas', 'https://shop.mango.com/mx/hombre/rebajas'] },
  { name: 'Cuidado con el Perro', websiteUrl: 'https://www.cuidadoconelperro.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.cuidadoconelperro.com.mx/sale', 'https://www.cuidadoconelperro.com.mx/ofertas'] },
  { name: 'Andrea', websiteUrl: 'https://www.andrea.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.andrea.com/ofertas', 'https://www.andrea.com/promociones'] },
  { name: 'Aldo Mexico', websiteUrl: 'https://www.aldoshoes.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.aldoshoes.com.mx/sale'] },
  { name: 'Steve Madden Mexico', websiteUrl: 'https://www.stevemadden.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.stevemadden.com.mx/sale'] },
  { name: 'Flexi', websiteUrl: 'https://www.flexi.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.flexi.com.mx/ofertas', 'https://www.flexi.com.mx/promociones'] },
  { name: 'Perry Ellis Mexico', websiteUrl: 'https://perryellis.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://perryellis.com.mx/sale'] },
  { name: 'Julio', websiteUrl: 'https://www.julio.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.julio.com/sale', 'https://www.julio.com/ofertas'] },
  { name: 'Shasa', websiteUrl: 'https://www.shasa.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.shasa.com/sale', 'https://www.shasa.com/ofertas'] },
  { name: 'Promoda', websiteUrl: 'https://www.promoda.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.promoda.com.mx/ofertas', 'https://www.promoda.com.mx/promociones'] },
  { name: 'LOB Mexico', websiteUrl: 'https://www.lob.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.lob.com.mx/sale', 'https://www.lob.com.mx/ofertas'] },
  { name: 'Reebok Mexico', websiteUrl: 'https://www.reebok.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.reebok.mx/outlet', 'https://www.reebok.mx/sale'] },
  { name: 'American Eagle Mexico', websiteUrl: 'https://www.ae.com.mx', categorySlug: 'giyim-moda', seedUrls: ['https://www.ae.com.mx/sale', 'https://www.ae.com.mx/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Groceries & Supermarkets — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Walmart Supercenter MX', websiteUrl: 'https://super.walmart.com.mx', categorySlug: 'gida-market', seedUrls: ['https://super.walmart.com.mx/ofertas', 'https://super.walmart.com.mx/promociones'] },
  { name: 'Soriana Super', websiteUrl: 'https://www.soriana.com', categorySlug: 'gida-market', seedUrls: ['https://www.soriana.com/super/ofertas', 'https://www.soriana.com/super/promociones'] },
  { name: 'Chedraui', websiteUrl: 'https://www.chedraui.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.chedraui.com.mx/ofertas', 'https://www.chedraui.com.mx/promociones'] },
  { name: 'HEB', websiteUrl: 'https://www.heb.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.heb.com.mx/promociones', 'https://www.heb.com.mx/ofertas'] },
  { name: 'La Comer Super', websiteUrl: 'https://www.lacomer.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.lacomer.com.mx/lacomer/promociones'] },
  { name: 'City Market Gourmet', websiteUrl: 'https://www.citymarket.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.citymarket.com.mx/promociones'] },
  { name: 'Fresko Gourmet', websiteUrl: 'https://www.fresko.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.fresko.com.mx/promociones'] },
  { name: 'Costco Wholesale MX', websiteUrl: 'https://www.costco.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.costco.com.mx/ofertas-alimentos'] },
  { name: "Sam's Club Super", websiteUrl: 'https://www.sams.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.sams.com.mx/despensa'] },
  { name: 'Bodega Aurrera Super', websiteUrl: 'https://www.bodegaaurrera.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.bodegaaurrera.com.mx/super/ofertas'] },
  { name: 'Superama', websiteUrl: 'https://www.superama.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.superama.com.mx/ofertas'] },
  { name: 'Cornershop', websiteUrl: 'https://cornershopapp.com', categorySlug: 'gida-market', seedUrls: ['https://cornershopapp.com/deals'] },
  { name: 'Jokr Mexico', websiteUrl: 'https://www.jokr.com/mx', categorySlug: 'gida-market', seedUrls: ['https://www.jokr.com/mx/ofertas'] },
  { name: 'Rappi Market MX', websiteUrl: 'https://www.rappi.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.rappi.com.mx/restaurantes/market'] },
  { name: 'Uber Eats Market MX', websiteUrl: 'https://www.ubereats.com/mx', categorySlug: 'gida-market', seedUrls: ['https://www.ubereats.com/mx/grocery'] },
  { name: 'Oxxo', websiteUrl: 'https://www.oxxo.com', categorySlug: 'gida-market', seedUrls: ['https://www.oxxo.com/promociones'] },
  { name: 'Modelorama', websiteUrl: 'https://www.modelorama.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.modelorama.com.mx/promociones'] },
  { name: '7-Eleven Mexico', websiteUrl: 'https://www.7-eleven.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.7-eleven.com.mx/promociones'] },
  { name: 'Nescafe Mexico', websiteUrl: 'https://www.nescafe.com/mx', categorySlug: 'gida-market', seedUrls: ['https://www.nescafe.com/mx/promociones'] },
  { name: 'Bimbo Mexico', websiteUrl: 'https://www.bimbo.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.bimbo.com.mx/promociones'] },
  { name: 'Coca-Cola Mexico', websiteUrl: 'https://www.coca-cola.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.coca-cola.com.mx/promociones'] },
  { name: 'Extra Soriana', websiteUrl: 'https://www.soriana.com', categorySlug: 'gida-market', seedUrls: ['https://www.soriana.com/extra/ofertas'] },
  { name: 'Super Aki', websiteUrl: 'https://www.superaki.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.superaki.com.mx/ofertas'] },
  { name: 'Ley Supermercados', websiteUrl: 'https://www.ley.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.ley.com.mx/promociones'] },
  { name: 'Alsuper', websiteUrl: 'https://www.alsuper.com', categorySlug: 'gida-market', seedUrls: ['https://www.alsuper.com/ofertas', 'https://www.alsuper.com/promociones'] },
  { name: 'Smart & Final Mexico', websiteUrl: 'https://www.smartfinal.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.smartfinal.com.mx/promociones'] },
  { name: "Waldo's Mexico", websiteUrl: 'https://www.waldos.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.waldos.com.mx/ofertas'] },
  { name: 'Del Sol Tiendas', websiteUrl: 'https://www.tiendassol.com', categorySlug: 'gida-market', seedUrls: ['https://www.tiendassol.com/ofertas'] },
  { name: 'S-Mart', websiteUrl: 'https://www.s-mart.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.s-mart.com.mx/promociones'] },
  { name: 'Merza', websiteUrl: 'https://www.merza.com.mx', categorySlug: 'gida-market', seedUrls: ['https://www.merza.com.mx/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Dining — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Uber Eats Mexico', websiteUrl: 'https://www.ubereats.com/mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/mx/promos'] },
  { name: 'Rappi Mexico', websiteUrl: 'https://www.rappi.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.rappi.com.mx/promos', 'https://www.rappi.com.mx/restaurantes'] },
  { name: 'DiDi Food Mexico', websiteUrl: 'https://www.didi-food.com/es-MX', categorySlug: 'yeme-icme', seedUrls: ['https://www.didi-food.com/es-MX/promos'] },
  { name: "McDonald's Mexico", websiteUrl: 'https://www.mcdonalds.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com.mx/promociones', 'https://www.mcdonalds.com.mx/ofertas'] },
  { name: "Domino's Mexico", websiteUrl: 'https://www.dominos.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.mx/promociones'] },
  { name: 'Burger King Mexico', websiteUrl: 'https://www.burgerking.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.mx/promociones', 'https://www.burgerking.com.mx/cupones'] },
  { name: 'Subway Mexico', websiteUrl: 'https://www.subway.com/es-MX', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/es-MX/promotions'] },
  { name: 'KFC Mexico', websiteUrl: 'https://www.kfc.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.com.mx/promociones'] },
  { name: 'Pizza Hut Mexico', websiteUrl: 'https://www.pizzahut.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.mx/promociones'] },
  { name: 'Little Caesars Mexico', websiteUrl: 'https://littlecaesars.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://littlecaesars.com.mx/promociones'] },
  { name: 'Starbucks Mexico', websiteUrl: 'https://www.starbucks.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.mx/promos', 'https://www.starbucks.com.mx/ofertas'] },
  { name: "Wendy's Mexico", websiteUrl: 'https://wendys.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://wendys.com.mx/promociones'] },
  { name: "Carl's Jr Mexico", websiteUrl: 'https://www.carlsjr.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.carlsjr.com.mx/promociones'] },
  { name: 'Popeyes Mexico', websiteUrl: 'https://www.popeyes.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.popeyes.com.mx/promociones'] },
  { name: 'Sushi Itto', websiteUrl: 'https://www.sushiitto.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushiitto.com.mx/promociones'] },
  { name: 'Toks', websiteUrl: 'https://www.toks.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.toks.com.mx/promociones'] },
  { name: 'Vips', websiteUrl: 'https://www.vips.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.vips.com.mx/promociones'] },
  { name: 'El Porton', websiteUrl: 'https://www.elporton.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.elporton.com.mx/promociones'] },
  { name: "Italianni's", websiteUrl: 'https://www.italiannis.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.italiannis.com.mx/promociones'] },
  { name: "Chili's Mexico", websiteUrl: 'https://www.chilis.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.chilis.com.mx/promociones'] },
  { name: 'TGI Fridays Mexico', websiteUrl: 'https://www.tgifridays.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.tgifridays.com.mx/promociones'] },
  { name: 'Wings Mexico', websiteUrl: 'https://www.wings.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.wings.com.mx/promociones'] },
  { name: 'El Fogoncito', websiteUrl: 'https://www.elfogoncito.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.elfogoncito.com.mx/promociones'] },
  { name: 'Alsea Brands', websiteUrl: 'https://www.alsea.net', categorySlug: 'yeme-icme', seedUrls: ['https://www.alsea.net/promociones'] },
  { name: 'La Parroquia de Veracruz', websiteUrl: 'https://www.laparroquia.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.laparroquia.com/promociones'] },
  { name: 'Cafe Punta del Cielo', websiteUrl: 'https://www.pfrancotiendas.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.pfrancotiendas.com.mx/promociones'] },
  { name: 'Cinepolis', websiteUrl: 'https://www.cinepolis.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.cinepolis.com/promociones'] },
  { name: 'Cinemex', websiteUrl: 'https://www.cinemex.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.cinemex.com/promociones'] },
  { name: 'Papa Johns Mexico', websiteUrl: 'https://www.papajohns.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.com.mx/promociones'] },
  { name: 'Wingstop Mexico', websiteUrl: 'https://www.wingstop.com.mx', categorySlug: 'yeme-icme', seedUrls: ['https://www.wingstop.com.mx/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 6) Sağlık & Güzellik / Health & Beauty — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Farmacias del Ahorro', websiteUrl: 'https://www.fahorro.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.fahorro.com/ofertas', 'https://www.fahorro.com/promociones'] },
  { name: 'Farmacias Similares', websiteUrl: 'https://www.farmaciasdesimilares.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmaciasdesimilares.com.mx/promociones'] },
  { name: 'Farmacias Guadalajara', websiteUrl: 'https://www.farmaciasguadalajara.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmaciasguadalajara.com/ofertas', 'https://www.farmaciasguadalajara.com/promociones'] },
  { name: 'Farmacias Benavides', websiteUrl: 'https://www.farmaciasbenavides.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmaciasbenavides.com.mx/ofertas', 'https://www.farmaciasbenavides.com.mx/promociones'] },
  { name: 'Farmacias San Pablo', websiteUrl: 'https://www.farmaciasanpablo.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmaciasanpablo.com.mx/ofertas', 'https://www.farmaciasanpablo.com.mx/promociones'] },
  { name: 'Sephora Mexico', websiteUrl: 'https://www.sephora.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.com.mx/sale', 'https://www.sephora.com.mx/ofertas'] },
  { name: 'MAC Cosmetics Mexico', websiteUrl: 'https://www.maccosmetics.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.mx/offers'] },
  { name: 'Bath & Body Works Mexico', websiteUrl: 'https://www.bathandbodyworks.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.com.mx/sale', 'https://www.bathandbodyworks.com.mx/ofertas'] },
  { name: 'The Body Shop Mexico', websiteUrl: 'https://www.thebodyshop.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com.mx/sale', 'https://www.thebodyshop.com.mx/ofertas'] },
  { name: "Victoria's Secret Mexico", websiteUrl: 'https://www.victoriassecret.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.victoriassecret.com.mx/sale'] },
  { name: 'Natura Mexico', websiteUrl: 'https://www.natura.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.natura.com.mx/promociones', 'https://www.natura.com.mx/ofertas'] },
  { name: 'Avon Mexico', websiteUrl: 'https://www.avon.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avon.com.mx/ofertas', 'https://www.avon.com.mx/promociones'] },
  { name: "L'Oreal Paris Mexico", websiteUrl: 'https://www.loreal-paris.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.mx/ofertas'] },
  { name: 'Clinique Mexico', websiteUrl: 'https://www.clinique.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.mx/offers'] },
  { name: 'Estee Lauder Mexico', websiteUrl: 'https://www.esteelauder.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.mx/offers'] },
  { name: 'Lancome Mexico', websiteUrl: 'https://www.lancome.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lancome.com.mx/ofertas'] },
  { name: 'GNC Mexico', websiteUrl: 'https://www.gnc.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.gnc.com.mx/ofertas', 'https://www.gnc.com.mx/promociones'] },
  { name: 'Nutrisa', websiteUrl: 'https://www.nutrisa.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nutrisa.com/promociones'] },
  { name: 'Superama Farmacia', websiteUrl: 'https://www.superama.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.superama.com.mx/farmacia/ofertas'] },
  { name: 'Prixz', websiteUrl: 'https://www.prixz.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.prixz.com/ofertas', 'https://www.prixz.com/promociones'] },
  { name: "Kiehl's Mexico", websiteUrl: 'https://www.kiehls.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.com.mx/ofertas'] },
  { name: 'Perfumes Club Mexico', websiteUrl: 'https://www.perfumesclub.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.perfumesclub.com.mx/ofertas'] },
  { name: 'Salud Digna', websiteUrl: 'https://www.saluddigna.org', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.saluddigna.org/promociones'] },
  { name: 'Costco Farmacia MX', websiteUrl: 'https://www.costco.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.costco.com.mx/farmacia'] },
  { name: 'NYX Mexico', websiteUrl: 'https://www.nyxcosmetics.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.com.mx/sale', 'https://www.nyxcosmetics.com.mx/ofertas'] },
  { name: 'Maybelline Mexico', websiteUrl: 'https://www.maybelline.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.mx/ofertas'] },
  { name: 'Farmacia YZA', websiteUrl: 'https://www.farmaciasfza.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmaciasfza.com.mx/promociones'] },
  { name: 'Farmatodo Mexico', websiteUrl: 'https://www.farmatodo.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmatodo.com.mx/ofertas'] },
  { name: 'Dulce Alma', websiteUrl: 'https://www.dulcealma.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dulcealma.mx/promociones'] },
  { name: 'Fragancia Fina Mexico', websiteUrl: 'https://www.fraganciafina.com.mx', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.fraganciafina.com.mx/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Home Depot Mexico', websiteUrl: 'https://www.homedepot.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.homedepot.com.mx/ofertas', 'https://www.homedepot.com.mx/promociones'] },
  { name: 'IKEA Mexico', websiteUrl: 'https://www.ikea.com/mx/es', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/mx/es/offers/', 'https://www.ikea.com/mx/es/campaigns/'] },
  { name: 'Coppel Hogar', websiteUrl: 'https://www.coppel.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.coppel.com/hogar/ofertas'] },
  { name: 'Liverpool Hogar', websiteUrl: 'https://www.liverpool.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.liverpool.com.mx/tienda/hogar/ofertas'] },
  { name: 'Mueblerias Dico', websiteUrl: 'https://www.muebleriasdico.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.muebleriasdico.com.mx/ofertas', 'https://www.muebleriasdico.com.mx/promociones'] },
  { name: 'Sodimac Home MX', websiteUrl: 'https://www.sodimac.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.sodimac.com.mx/sodimac-mx/content/ofertas-hogar'] },
  { name: 'Muebles Troncoso', websiteUrl: 'https://www.troncoso.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.troncoso.com.mx/ofertas', 'https://www.troncoso.com.mx/promociones'] },
  { name: 'Colchas Concord', websiteUrl: 'https://www.colchasconcord.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.colchasconcord.com.mx/ofertas', 'https://www.colchasconcord.com.mx/sale'] },
  { name: 'Pottery Barn Mexico', websiteUrl: 'https://www.potterybarn.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.potterybarn.com.mx/sale'] },
  { name: 'West Elm Mexico', websiteUrl: 'https://www.westelm.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.westelm.com.mx/sale'] },
  { name: 'Zara Home Mexico', websiteUrl: 'https://www.zarahome.com/mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/mx/es/sale-702.html'] },
  { name: 'Luuna', websiteUrl: 'https://www.luuna.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.luuna.mx/ofertas', 'https://www.luuna.mx/promociones'] },
  { name: 'Restonic Mexico', websiteUrl: 'https://www.restonic.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.restonic.com.mx/promociones'] },
  { name: 'Spring Air Mexico', websiteUrl: 'https://www.springair.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.springair.com.mx/ofertas'] },
  { name: 'Sears Hogar MX', websiteUrl: 'https://www.sears.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.sears.com.mx/hogar/ofertas'] },
  { name: 'Comex Mexico', websiteUrl: 'https://www.comex.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.comex.com.mx/promociones'] },
  { name: 'Pinturas Berel', websiteUrl: 'https://www.berel.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.berel.com.mx/promociones'] },
  { name: 'Interceramic', websiteUrl: 'https://www.interceramic.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.interceramic.com/promociones'] },
  { name: 'Helvex', websiteUrl: 'https://www.helvex.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.helvex.com.mx/promociones'] },
  { name: 'Tupperware Mexico', websiteUrl: 'https://www.tupperware.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.tupperware.com.mx/promociones', 'https://www.tupperware.com.mx/ofertas'] },
  { name: 'Betterware Mexico', websiteUrl: 'https://www.betterware.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.betterware.com.mx/ofertas', 'https://www.betterware.com.mx/promociones'] },
  { name: 'Mabe Mexico', websiteUrl: 'https://www.mabe.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.mabe.com.mx/ofertas', 'https://www.mabe.com.mx/promociones'] },
  { name: 'Whirlpool Mexico', websiteUrl: 'https://www.whirlpool.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.whirlpool.com.mx/ofertas', 'https://www.whirlpool.com.mx/promociones'] },
  { name: 'Crate & Barrel Mexico', websiteUrl: 'https://www.crateandbarrel.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.crateandbarrel.com.mx/sale'] },
  { name: 'Williams-Sonoma Mexico', websiteUrl: 'https://www.williams-sonoma.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.williams-sonoma.com.mx/sale'] },
  { name: 'Homy Mexico', websiteUrl: 'https://www.homy.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.homy.mx/ofertas'] },
  { name: 'Miniso Home MX', websiteUrl: 'https://www.miniso.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.miniso.com.mx/hogar/promociones'] },
  { name: 'Muebles America', websiteUrl: 'https://www.mueblesamerica.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.mueblesamerica.mx/ofertas', 'https://www.mueblesamerica.mx/promociones'] },
  { name: 'Famsa', websiteUrl: 'https://www.famsa.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.famsa.com/ofertas', 'https://www.famsa.com/promociones'] },
  { name: 'Elektra Hogar', websiteUrl: 'https://www.elektra.com.mx', categorySlug: 'ev-yasam', seedUrls: ['https://www.elektra.com.mx/hogar/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Marti Mexico', websiteUrl: 'https://www.marti.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.marti.mx/ofertas', 'https://www.marti.mx/promociones'] },
  { name: 'Innovasport', websiteUrl: 'https://www.innovasport.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.innovasport.com/sale', 'https://www.innovasport.com/ofertas'] },
  { name: 'Nike Mexico', websiteUrl: 'https://www.nike.com/mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/mx/w/sale', 'https://www.nike.com/mx/sale'] },
  { name: 'Adidas Mexico', websiteUrl: 'https://www.adidas.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.mx/outlet', 'https://www.adidas.mx/sale'] },
  { name: 'Puma Mexico', websiteUrl: 'https://mx.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://mx.puma.com/sale.html', 'https://mx.puma.com/outlet.html'] },
  { name: 'Under Armour Mexico', websiteUrl: 'https://www.underarmour.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.mx/outlet', 'https://www.underarmour.com.mx/sale'] },
  { name: 'New Balance Mexico', websiteUrl: 'https://www.newbalance.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.mx/sale'] },
  { name: 'Asics Mexico', websiteUrl: 'https://www.asics.com/mx/es-mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/mx/es-mx/sale/'] },
  { name: 'Decathlon Mexico', websiteUrl: 'https://www.decathlon.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.com.mx/ofertas', 'https://www.decathlon.com.mx/promociones'] },
  { name: 'Columbia Mexico', websiteUrl: 'https://www.columbia.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.com.mx/sale'] },
  { name: 'The North Face Mexico', websiteUrl: 'https://www.thenorthface.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.mx/sale'] },
  { name: 'Vans Mexico', websiteUrl: 'https://www.vans.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.com.mx/sale'] },
  { name: 'Converse Mexico', websiteUrl: 'https://www.converse.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com.mx/sale'] },
  { name: 'Skechers Mexico', websiteUrl: 'https://www.skechers.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.mx/sale'] },
  { name: 'Fila Mexico', websiteUrl: 'https://www.fila.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.com.mx/sale', 'https://www.fila.com.mx/ofertas'] },
  { name: 'Liverpool Deportes', websiteUrl: 'https://www.liverpool.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.liverpool.com.mx/tienda/deportes/ofertas'] },
  { name: 'Lupo Mexico', websiteUrl: 'https://www.lupo.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lupo.mx/ofertas'] },
  { name: 'Mercado Libre Deportes', websiteUrl: 'https://www.mercadolibre.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mercadolibre.com.mx/ofertas/deportes'] },
  { name: 'Dportenis', websiteUrl: 'https://www.dportenis.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.dportenis.mx/sale', 'https://www.dportenis.mx/ofertas'] },
  { name: 'Atlas Sport MX', websiteUrl: 'https://www.atlas-sport.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.atlas-sport.mx/ofertas'] },
  { name: 'GoPro Mexico', websiteUrl: 'https://gopro.com/es/mx', categorySlug: 'spor-outdoor', seedUrls: ['https://gopro.com/es/mx/deals'] },
  { name: 'Garmin Mexico', websiteUrl: 'https://www.garmin.com/es-MX', categorySlug: 'spor-outdoor', seedUrls: ['https://www.garmin.com/es-MX/sale/'] },
  { name: 'Trek Mexico', websiteUrl: 'https://www.trekbikes.com/mx/es_MX', categorySlug: 'spor-outdoor', seedUrls: ['https://www.trekbikes.com/mx/es_MX/sale/'] },
  { name: 'Specialized Mexico', websiteUrl: 'https://www.specialized.com/mx/es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.specialized.com/mx/es/sale'] },
  { name: 'Sport City', websiteUrl: 'https://www.sportcity.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportcity.com.mx/promociones'] },
  { name: 'Smart Fit Mexico', websiteUrl: 'https://www.smartfit.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.smartfit.com.mx/promociones'] },
  { name: 'Lululemon Mexico', websiteUrl: 'https://www.lululemon.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lululemon.com.mx/es-mx/c/we-made-too-much'] },
  { name: 'Oakley Mexico', websiteUrl: 'https://www.oakley.com/es-mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.oakley.com/es-mx/sale'] },
  { name: 'Timberland Mexico', websiteUrl: 'https://www.timberland.com.mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.com.mx/sale'] },
  { name: 'Wilson Mexico', websiteUrl: 'https://www.wilson.com/es-mx', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wilson.com/es-mx/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Tatil / Travel & Tourism — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Volaris', websiteUrl: 'https://www.volaris.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.volaris.com/ofertas', 'https://www.volaris.com/promociones'] },
  { name: 'VivaAerobus', websiteUrl: 'https://www.vivaaerobus.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vivaaerobus.com/ofertas', 'https://www.vivaaerobus.com/promociones'] },
  { name: 'Aeromexico', websiteUrl: 'https://www.aeromexico.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.aeromexico.com/es-mx/ofertas', 'https://www.aeromexico.com/es-mx/promociones'] },
  { name: 'Booking Mexico', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.es.html'] },
  { name: 'Expedia Mexico', websiteUrl: 'https://www.expedia.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.mx/ofertas', 'https://www.expedia.mx/deals'] },
  { name: 'Despegar Mexico', websiteUrl: 'https://www.despegar.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.despegar.com.mx/ofertas/', 'https://www.despegar.com.mx/promociones/'] },
  { name: 'BestDay', websiteUrl: 'https://www.bestday.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bestday.com.mx/ofertas/', 'https://www.bestday.com.mx/promociones/'] },
  { name: 'PriceTravel', websiteUrl: 'https://www.pricetravel.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pricetravel.com.mx/ofertas'] },
  { name: 'Kayak Mexico', websiteUrl: 'https://www.kayak.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.com.mx/ofertas'] },
  { name: 'Trivago Mexico', websiteUrl: 'https://www.trivago.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.com.mx/ofertas'] },
  { name: 'Airbnb Mexico', websiteUrl: 'https://www.airbnb.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.com.mx/deals'] },
  { name: 'Hoteles.com Mexico', websiteUrl: 'https://www.hoteles.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hoteles.com/ofertas'] },
  { name: 'Mundo Joven', websiteUrl: 'https://www.mundojoven.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.mundojoven.com/mx/ofertas', 'https://www.mundojoven.com/mx/promociones'] },
  { name: 'Interjet', websiteUrl: 'https://www.interjet.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.interjet.com/ofertas'] },
  { name: 'Hopper Mexico', websiteUrl: 'https://www.hopper.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hopper.com/deals'] },
  { name: 'Skyscanner Mexico', websiteUrl: 'https://www.skyscanner.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.com.mx/ofertas'] },
  { name: 'Copa Airlines MX', websiteUrl: 'https://www.copaair.com/es-mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.copaair.com/es-mx/ofertas/'] },
  { name: 'United Airlines MX', websiteUrl: 'https://www.united.com/es-mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.united.com/es-mx/deals'] },
  { name: 'American Airlines MX', websiteUrl: 'https://www.aa.com/homePage.do?locale=es_MX', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.aa.com/i18n/travel-info/deals/deals.jsp'] },
  { name: 'Marriott Mexico', websiteUrl: 'https://www.marriott.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com.mx/offers/'] },
  { name: 'Hilton Mexico', websiteUrl: 'https://www.hilton.com/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hilton.com/es/offers/'] },
  { name: 'Fiesta Americana', websiteUrl: 'https://www.fiestamericana.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fiestamericana.com/ofertas', 'https://www.fiestamericana.com/promociones'] },
  { name: 'Posadas Hotels', websiteUrl: 'https://www.posadas.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.posadas.com/ofertas', 'https://www.posadas.com/promociones'] },
  { name: 'Oasis Hotels Mexico', websiteUrl: 'https://www.oasishoteles.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.oasishoteles.com/ofertas'] },
  { name: 'Xcaret', websiteUrl: 'https://www.xcaret.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.xcaret.com/es/ofertas/', 'https://www.xcaret.com/es/promociones/'] },
  { name: 'Six Flags Mexico', websiteUrl: 'https://www.sixflags.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sixflags.com.mx/promociones'] },
  { name: 'Palladium Mexico', websiteUrl: 'https://www.palladiumhotelgroup.com/es/mexico', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.palladiumhotelgroup.com/es/mexico/ofertas'] },
  { name: 'Iberostar Mexico', websiteUrl: 'https://www.iberostar.com/es/destinos/mexico', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.iberostar.com/es/ofertas/mexico'] },
  { name: 'RIU Hotels Mexico', websiteUrl: 'https://www.riu.com/es/hotel/mexico', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.riu.com/es/ofertas/mexico/'] },
  { name: 'ADO Bus', websiteUrl: 'https://www.ado.com.mx', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ado.com.mx/promociones', 'https://www.ado.com.mx/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance & Banking — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'BBVA Mexico', websiteUrl: 'https://www.bbva.mx', categorySlug: 'finans', seedUrls: ['https://www.bbva.mx/personas/promociones.html', 'https://www.bbva.mx/personas/ofertas.html'] },
  { name: 'Banorte', websiteUrl: 'https://www.banorte.com', categorySlug: 'finans', seedUrls: ['https://www.banorte.com/promociones', 'https://www.banorte.com/ofertas'] },
  { name: 'Citibanamex', websiteUrl: 'https://www.banamex.com', categorySlug: 'finans', seedUrls: ['https://www.banamex.com/es/personas/promociones/', 'https://www.banamex.com/es/personas/ofertas-bancarias/'] },
  { name: 'Santander Mexico', websiteUrl: 'https://www.santander.com.mx', categorySlug: 'finans', seedUrls: ['https://www.santander.com.mx/personas/promociones.html'] },
  { name: 'HSBC Mexico', websiteUrl: 'https://www.hsbc.com.mx', categorySlug: 'finans', seedUrls: ['https://www.hsbc.com.mx/ofertas-y-promociones/'] },
  { name: 'Scotiabank Mexico', websiteUrl: 'https://www.scotiabank.com.mx', categorySlug: 'finans', seedUrls: ['https://www.scotiabank.com.mx/personas/promociones.aspx'] },
  { name: 'Mercado Pago MX', websiteUrl: 'https://www.mercadopago.com.mx', categorySlug: 'finans', seedUrls: ['https://www.mercadopago.com.mx/promociones'] },
  { name: 'Nu Mexico', websiteUrl: 'https://nu.com.mx', categorySlug: 'finans', seedUrls: ['https://nu.com.mx/promociones'] },
  { name: 'Rappi Pay', websiteUrl: 'https://www.rappi.com.mx', categorySlug: 'finans', seedUrls: ['https://www.rappi.com.mx/rappi-pay/promociones'] },
  { name: 'Clip Mexico', websiteUrl: 'https://www.clip.mx', categorySlug: 'finans', seedUrls: ['https://www.clip.mx/ofertas', 'https://www.clip.mx/promociones'] },
  { name: 'Stori Card', websiteUrl: 'https://www.storicard.com', categorySlug: 'finans', seedUrls: ['https://www.storicard.com/promociones'] },
  { name: 'Klar Mexico', websiteUrl: 'https://www.klar.mx', categorySlug: 'finans', seedUrls: ['https://www.klar.mx/promociones'] },
  { name: 'Spin by Oxxo', websiteUrl: 'https://www.spin.com.mx', categorySlug: 'finans', seedUrls: ['https://www.spin.com.mx/promociones'] },
  { name: 'Hey Banco', websiteUrl: 'https://www.heybanco.com', categorySlug: 'finans', seedUrls: ['https://www.heybanco.com/promociones'] },
  { name: 'Albo Mexico', websiteUrl: 'https://www.albo.mx', categorySlug: 'finans', seedUrls: ['https://www.albo.mx/promociones'] },
  { name: 'Broxel', websiteUrl: 'https://www.broxel.com', categorySlug: 'finans', seedUrls: ['https://www.broxel.com/promociones'] },
  { name: 'American Express Mexico', websiteUrl: 'https://www.americanexpress.com/mx', categorySlug: 'finans', seedUrls: ['https://www.americanexpress.com/mx/ofertas/'] },
  { name: 'Inbursa', websiteUrl: 'https://www.inbursa.com', categorySlug: 'finans', seedUrls: ['https://www.inbursa.com/Portal/Promociones.aspx'] },
  { name: 'Banco Azteca', websiteUrl: 'https://www.bancoazteca.com.mx', categorySlug: 'finans', seedUrls: ['https://www.bancoazteca.com.mx/promociones'] },
  { name: 'Afirme', websiteUrl: 'https://www.afirme.com', categorySlug: 'finans', seedUrls: ['https://www.afirme.com/promociones'] },
  { name: 'BanCoppel', websiteUrl: 'https://www.bancoppel.com', categorySlug: 'finans', seedUrls: ['https://www.bancoppel.com/promociones'] },
  { name: 'Coru Mexico', websiteUrl: 'https://www.coru.com', categorySlug: 'finans', seedUrls: ['https://www.coru.com/ofertas'] },
  { name: 'GBM Plus', websiteUrl: 'https://gbm.com', categorySlug: 'finans', seedUrls: ['https://gbm.com/promociones'] },
  { name: 'Fintual Mexico', websiteUrl: 'https://fintual.mx', categorySlug: 'finans', seedUrls: ['https://fintual.mx/promociones'] },
  { name: 'Bitso', websiteUrl: 'https://bitso.com', categorySlug: 'finans', seedUrls: ['https://bitso.com/promos', 'https://bitso.com/ofertas'] },
  { name: 'Kueski', websiteUrl: 'https://www.kueski.com', categorySlug: 'finans', seedUrls: ['https://www.kueski.com/promociones'] },
  { name: 'Coppel Financiero', websiteUrl: 'https://www.coppel.com', categorySlug: 'finans', seedUrls: ['https://www.coppel.com/servicios-financieros/promociones'] },
  { name: 'PayPal Mexico', websiteUrl: 'https://www.paypal.com/mx', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/mx/webapps/mpp/offers'] },
  { name: 'Konfio', websiteUrl: 'https://konfio.mx', categorySlug: 'finans', seedUrls: ['https://konfio.mx/promociones'] },
  { name: 'Credijusto', websiteUrl: 'https://www.credijusto.com', categorySlug: 'finans', seedUrls: ['https://www.credijusto.com/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 11) Eğitim / Education — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Platzi', websiteUrl: 'https://platzi.com', categorySlug: 'sigorta', seedUrls: ['https://platzi.com/precios/', 'https://platzi.com/ofertas/'] },
  { name: 'Coursera Mexico', websiteUrl: 'https://www.coursera.org', categorySlug: 'sigorta', seedUrls: ['https://www.coursera.org/promo', 'https://www.coursera.org/courseraplus/special/'] },
  { name: 'Udemy Mexico', websiteUrl: 'https://www.udemy.com', categorySlug: 'sigorta', seedUrls: ['https://www.udemy.com/courses/search/?src=ukw&q=ofertas', 'https://www.udemy.com/courses/development/'] },
  { name: 'Domestika Mexico', websiteUrl: 'https://www.domestika.org/es', categorySlug: 'sigorta', seedUrls: ['https://www.domestika.org/es/courses/on-sale', 'https://www.domestika.org/es/offers'] },
  { name: 'edX Mexico', websiteUrl: 'https://www.edx.org', categorySlug: 'sigorta', seedUrls: ['https://www.edx.org/promo', 'https://www.edx.org/es/deals'] },
  { name: 'Crehana', websiteUrl: 'https://www.crehana.com', categorySlug: 'sigorta', seedUrls: ['https://www.crehana.com/ofertas/', 'https://www.crehana.com/precios/'] },
  { name: 'LinkedIn Learning MX', websiteUrl: 'https://www.linkedin.com/learning', categorySlug: 'sigorta', seedUrls: ['https://www.linkedin.com/learning/subscription/products'] },
  { name: 'Skillshare MX', websiteUrl: 'https://www.skillshare.com', categorySlug: 'sigorta', seedUrls: ['https://www.skillshare.com/membership/checkout'] },
  { name: 'Google Certificates MX', websiteUrl: 'https://grow.google/intl/es-419_mx/certificates', categorySlug: 'sigorta', seedUrls: ['https://grow.google/intl/es-419_mx/certificates/'] },
  { name: 'Khan Academy MX', websiteUrl: 'https://es.khanacademy.org', categorySlug: 'sigorta', seedUrls: ['https://es.khanacademy.org/'] },
  { name: 'Tec de Monterrey Online', websiteUrl: 'https://www.tec.mx', categorySlug: 'sigorta', seedUrls: ['https://www.tec.mx/es/becas-y-financiamiento', 'https://www.tec.mx/es/oferta-educativa'] },
  { name: 'UNAM Online', websiteUrl: 'https://www.cuaieed.unam.mx', categorySlug: 'sigorta', seedUrls: ['https://www.cuaieed.unam.mx/oferta-educativa/'] },
  { name: 'Unitec Mexico', websiteUrl: 'https://www.unitec.mx', categorySlug: 'sigorta', seedUrls: ['https://www.unitec.mx/becas/', 'https://www.unitec.mx/promociones/'] },
  { name: 'Universidad del Valle de Mexico', websiteUrl: 'https://www.uvm.mx', categorySlug: 'sigorta', seedUrls: ['https://www.uvm.mx/becas', 'https://www.uvm.mx/promociones'] },
  { name: 'Open English MX', websiteUrl: 'https://www.openenglish.com/mx', categorySlug: 'sigorta', seedUrls: ['https://www.openenglish.com/mx/ofertas/'] },
  { name: 'British Council Mexico', websiteUrl: 'https://www.britishcouncil.org.mx', categorySlug: 'sigorta', seedUrls: ['https://www.britishcouncil.org.mx/cursos-ingles/ofertas'] },
  { name: 'Berlitz Mexico', websiteUrl: 'https://www.berlitz.com/es-mx', categorySlug: 'sigorta', seedUrls: ['https://www.berlitz.com/es-mx/promociones'] },
  { name: 'Preply Mexico', websiteUrl: 'https://preply.com/es', categorySlug: 'sigorta', seedUrls: ['https://preply.com/es/ofertas'] },
  { name: 'Duolingo MX', websiteUrl: 'https://www.duolingo.com', categorySlug: 'sigorta', seedUrls: ['https://www.duolingo.com/plus'] },
  { name: 'Babbel MX', websiteUrl: 'https://es.babbel.com', categorySlug: 'sigorta', seedUrls: ['https://es.babbel.com/ofertas'] },
  { name: 'MasterClass MX', websiteUrl: 'https://www.masterclass.com', categorySlug: 'sigorta', seedUrls: ['https://www.masterclass.com/offers'] },
  { name: 'Udacity MX', websiteUrl: 'https://www.udacity.com', categorySlug: 'sigorta', seedUrls: ['https://www.udacity.com/deals'] },
  { name: 'DataCamp MX', websiteUrl: 'https://www.datacamp.com', categorySlug: 'sigorta', seedUrls: ['https://www.datacamp.com/promo'] },
  { name: 'Codecademy MX', websiteUrl: 'https://www.codecademy.com', categorySlug: 'sigorta', seedUrls: ['https://www.codecademy.com/pricing'] },
  { name: 'Kumon Mexico', websiteUrl: 'https://www.kumon.com.mx', categorySlug: 'sigorta', seedUrls: ['https://www.kumon.com.mx/promociones/'] },
  { name: 'Anahuac Online', websiteUrl: 'https://www.anahuac.mx', categorySlug: 'sigorta', seedUrls: ['https://www.anahuac.mx/becas', 'https://www.anahuac.mx/promociones'] },
  { name: 'CENEVAL MX', websiteUrl: 'https://www.ceneval.edu.mx', categorySlug: 'sigorta', seedUrls: ['https://www.ceneval.edu.mx/convocatorias'] },
  { name: 'Harmon Hall', websiteUrl: 'https://www.harmonhall.com', categorySlug: 'sigorta', seedUrls: ['https://www.harmonhall.com/promociones'] },
  { name: 'Tutellus MX', websiteUrl: 'https://www.tutellus.com', categorySlug: 'sigorta', seedUrls: ['https://www.tutellus.com/ofertas/'] },
  { name: 'Alison MX', websiteUrl: 'https://alison.com', categorySlug: 'sigorta', seedUrls: ['https://alison.com/tag/deals'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Kavak', websiteUrl: 'https://www.kavak.com/mx', categorySlug: 'otomobil', seedUrls: ['https://www.kavak.com/mx/ofertas', 'https://www.kavak.com/mx/promociones'] },
  { name: 'Mercado Libre Autos MX', websiteUrl: 'https://autos.mercadolibre.com.mx', categorySlug: 'otomobil', seedUrls: ['https://autos.mercadolibre.com.mx/ofertas'] },
  { name: 'Nissan Mexico', websiteUrl: 'https://www.nissan.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.mx/ofertas/', 'https://www.nissan.com.mx/promociones/'] },
  { name: 'Volkswagen Mexico', websiteUrl: 'https://www.vw.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.vw.com.mx/es/ofertas.html', 'https://www.vw.com.mx/es/promociones.html'] },
  { name: 'Chevrolet Mexico', websiteUrl: 'https://www.chevrolet.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.com.mx/ofertas', 'https://www.chevrolet.com.mx/promociones'] },
  { name: 'Toyota Mexico', websiteUrl: 'https://www.toyota.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.mx/promociones'] },
  { name: 'Kia Mexico', websiteUrl: 'https://www.kia.com/mx', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/mx/ofertas/', 'https://www.kia.com/mx/promociones/'] },
  { name: 'Hyundai Mexico', websiteUrl: 'https://www.hyundai.com/mx/es', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/mx/es/ofertas', 'https://www.hyundai.com/mx/es/promociones'] },
  { name: 'Honda Mexico', websiteUrl: 'https://www.honda.mx', categorySlug: 'otomobil', seedUrls: ['https://www.honda.mx/promociones'] },
  { name: 'Mazda Mexico', websiteUrl: 'https://www.mazda.mx', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.mx/promociones/'] },
  { name: 'Ford Mexico', websiteUrl: 'https://www.ford.mx', categorySlug: 'otomobil', seedUrls: ['https://www.ford.mx/ofertas', 'https://www.ford.mx/promociones'] },
  { name: 'Suzuki Mexico', websiteUrl: 'https://www.suzuki.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.com.mx/promociones'] },
  { name: 'Renault Mexico', websiteUrl: 'https://www.renault.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.renault.com.mx/ofertas.html'] },
  { name: 'SEAT Mexico', websiteUrl: 'https://www.seat.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.seat.com.mx/ofertas', 'https://www.seat.com.mx/promociones'] },
  { name: 'MG Mexico', websiteUrl: 'https://www.mgmotor.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.com.mx/ofertas'] },
  { name: 'Changan Mexico', websiteUrl: 'https://www.changan.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.changan.com.mx/promociones'] },
  { name: 'Autozone Mexico', websiteUrl: 'https://www.autozone.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.autozone.com.mx/ofertas', 'https://www.autozone.com.mx/promociones'] },
  { name: 'Uber Mexico', websiteUrl: 'https://www.uber.com/mx', categorySlug: 'otomobil', seedUrls: ['https://www.uber.com/mx/es/ride/promotions/'] },
  { name: 'DiDi Mexico', websiteUrl: 'https://www.didiglobal.com/mx', categorySlug: 'otomobil', seedUrls: ['https://www.didiglobal.com/mx/promociones'] },
  { name: 'Cabify Mexico', websiteUrl: 'https://cabify.com/mx', categorySlug: 'otomobil', seedUrls: ['https://cabify.com/mx/promociones'] },
  { name: 'Semovi Mexico', websiteUrl: 'https://www.semovi.cdmx.gob.mx', categorySlug: 'otomobil', seedUrls: ['https://www.semovi.cdmx.gob.mx/promociones'] },
  { name: 'Michelin Mexico', websiteUrl: 'https://www.michelin.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.michelin.com.mx/promociones'] },
  { name: 'Bridgestone Mexico', websiteUrl: 'https://www.bridgestone.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestone.com.mx/promociones'] },
  { name: 'Llantera Monterrey', websiteUrl: 'https://www.llanteram.com', categorySlug: 'otomobil', seedUrls: ['https://www.llanteram.com/ofertas'] },
  { name: 'BMW Mexico', websiteUrl: 'https://www.bmw.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.mx/es/offers.html'] },
  { name: 'Mercedes-Benz Mexico', websiteUrl: 'https://www.mercedes-benz.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.mx/passengercars/the-brand/offers.html'] },
  { name: 'Audi Mexico', websiteUrl: 'https://www.audi.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.mx/mx/web/es/ofertas.html'] },
  { name: 'Carvana MX', websiteUrl: 'https://www.carvana.com', categorySlug: 'otomobil', seedUrls: ['https://www.carvana.com/deals'] },
  { name: 'Seminuevos.com', websiteUrl: 'https://www.seminuevos.com', categorySlug: 'otomobil', seedUrls: ['https://www.seminuevos.com/ofertas'] },
  { name: 'Soloautos', websiteUrl: 'https://www.soloautos.com.mx', categorySlug: 'otomobil', seedUrls: ['https://www.soloautos.com.mx/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Gandhi', websiteUrl: 'https://www.gandhi.com.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gandhi.com.mx/ofertas', 'https://www.gandhi.com.mx/promociones'] },
  { name: 'El Sotano', websiteUrl: 'https://www.elsotano.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.elsotano.com/ofertas', 'https://www.elsotano.com/promociones'] },
  { name: 'Amazon Libros MX', websiteUrl: 'https://www.amazon.com.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.mx/b?node=9687880011', 'https://www.amazon.com.mx/deals?ref=nav_cs_gb_td_mx_deals'] },
  { name: 'Gonvill', websiteUrl: 'https://www.gonvill.com.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gonvill.com.mx/ofertas', 'https://www.gonvill.com.mx/promociones'] },
  { name: 'Libreria Porrua', websiteUrl: 'https://www.porrua.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.porrua.mx/ofertas.html', 'https://www.porrua.mx/promociones.html'] },
  { name: 'Fondo de Cultura Economica', websiteUrl: 'https://www.fondodeculturaeconomica.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.fondodeculturaeconomica.com/Promociones'] },
  { name: 'Buscalibre Mexico', websiteUrl: 'https://www.buscalibre.com.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.buscalibre.com.mx/ofertas'] },
  { name: 'Mercado Libre Libros', websiteUrl: 'https://www.mercadolibre.com.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mercadolibre.com.mx/ofertas/libros'] },
  { name: 'Sanborns Libros', websiteUrl: 'https://www.sanborns.com.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sanborns.com.mx/libros/ofertas'] },
  { name: 'Kindle Mexico', websiteUrl: 'https://www.amazon.com.mx/kindle', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.mx/kindle-dbs/promos'] },
  { name: 'Audible Mexico', websiteUrl: 'https://www.audible.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.com/offers'] },
  { name: 'Spotify Mexico', websiteUrl: 'https://www.spotify.com/mx-es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/mx-es/premium/', 'https://www.spotify.com/mx-es/offers/'] },
  { name: 'Netflix Mexico', websiteUrl: 'https://www.netflix.com/mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/mx/'] },
  { name: 'Disney Plus Mexico', websiteUrl: 'https://www.disneyplus.com/es-mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/es-mx/'] },
  { name: 'HBO Max Mexico', websiteUrl: 'https://www.max.com/mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.max.com/mx/offers'] },
  { name: 'Amazon Prime MX', websiteUrl: 'https://www.amazon.com.mx/prime', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.mx/prime'] },
  { name: 'Apple TV Plus MX', websiteUrl: 'https://www.apple.com/mx/apple-tv-plus', categorySlug: 'kitap-hobi', seedUrls: ['https://www.apple.com/mx/apple-tv-plus/'] },
  { name: 'Paramount Plus MX', websiteUrl: 'https://www.paramountplus.com/mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.paramountplus.com/mx/'] },
  { name: 'Lego Mexico', websiteUrl: 'https://www.lego.com/es-mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/es-mx/offers', 'https://www.lego.com/es-mx/sale'] },
  { name: 'Juguetron', websiteUrl: 'https://www.juguetron.com.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.juguetron.com.mx/ofertas', 'https://www.juguetron.com.mx/promociones'] },
  { name: 'Mattel Mexico', websiteUrl: 'https://www.mattel.com/es-mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mattel.com/es-mx/offers'] },
  { name: 'Hasbro Mexico', websiteUrl: 'https://www.hasbro.com/es-mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hasbro.com/es-mx/offers'] },
  { name: 'PlayStation Mexico', websiteUrl: 'https://store.playstation.com/es-mx', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/es-mx/category/deals'] },
  { name: 'Xbox Mexico', websiteUrl: 'https://www.xbox.com/es-MX', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/es-MX/games/deals', 'https://www.xbox.com/es-MX/promotions'] },
  { name: 'Nintendo Mexico', websiteUrl: 'https://www.nintendo.com/es-mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/es-mx/store/deals/'] },
  { name: 'Steam Mexico', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Epic Games MX', websiteUrl: 'https://store.epicgames.com/es-MX', categorySlug: 'kitap-hobi', seedUrls: ['https://store.epicgames.com/es-MX/free-games', 'https://store.epicgames.com/es-MX/sales-and-specials'] },
  { name: 'Game Planet', websiteUrl: 'https://www.gameplanet.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gameplanet.com/ofertas', 'https://www.gameplanet.com/promociones'] },
  { name: 'Mixup Mexico', websiteUrl: 'https://www.mixup.com.mx', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mixup.com.mx/ofertas', 'https://www.mixup.com.mx/promociones'] },
  { name: 'YouTube Premium MX', websiteUrl: 'https://www.youtube.com/premium', categorySlug: 'kitap-hobi', seedUrls: ['https://www.youtube.com/premium'] },
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
  console.log('=== MX Market Brand Seed Script ===\n');

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
      // Upsert brand with MX market (unique on slug+market)
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'MX' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'MX',
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
            market: 'MX',
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
            data: { seedUrls: entry.seedUrls, market: 'MX' },
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

  // 4. Summary of all MX sources
  const totalMXSources = await prisma.crawlSource.count({
    where: { market: 'MX', isActive: true },
  });
  console.log(`Total active MX sources: ${totalMXSources}`);
  console.log('\nDone! To trigger crawl: POST /admin/crawl/trigger-all');
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
