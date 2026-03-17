import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── Slug generator ──────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Brand entry type ────────────────────────────────────
interface BrandEntry {
  name: string;
  websiteUrl: string;
  categorySlug: string;
  seedUrls: string[];
}

// ── ALL ES BRANDS DATA ──────────────────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 35 brands
  // ═══════════════════════════════════════════════════════
  { name: 'El Corte Inglés', websiteUrl: 'https://www.elcorteingles.es', categorySlug: 'alisveris', seedUrls: ['https://www.elcorteingles.es/ofertas/', 'https://www.elcorteingles.es/rebajas/'] },
  { name: 'Amazon', websiteUrl: 'https://www.amazon.es', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.es/deals', 'https://www.amazon.es/gp/goldbox'] },
  { name: 'AliExpress', websiteUrl: 'https://es.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://es.aliexpress.com/campaign/wow/gcp/superdeal/index', 'https://es.aliexpress.com/wholesale'] },
  { name: 'PCComponentes', websiteUrl: 'https://www.pccomponentes.com', categorySlug: 'alisveris', seedUrls: ['https://www.pccomponentes.com/ofertas', 'https://www.pccomponentes.com/rebajas'] },
  { name: 'FNAC', websiteUrl: 'https://www.fnac.es', categorySlug: 'alisveris', seedUrls: ['https://www.fnac.es/ofertas', 'https://www.fnac.es/promociones'] },
  { name: 'Carrefour', websiteUrl: 'https://www.carrefour.es', categorySlug: 'alisveris', seedUrls: ['https://www.carrefour.es/ofertas/', 'https://www.carrefour.es/promociones/'] },
  { name: 'Lidl', websiteUrl: 'https://www.lidl.es', categorySlug: 'alisveris', seedUrls: ['https://www.lidl.es/es/ofertas', 'https://www.lidl.es/es/folleto-ofertas'] },
  { name: 'MediaMarkt', websiteUrl: 'https://www.mediamarkt.es', categorySlug: 'alisveris', seedUrls: ['https://www.mediamarkt.es/es/category/ofertas-702.html', 'https://www.mediamarkt.es/es/campaign/ofertas-flash.html'] },
  { name: 'eBay', websiteUrl: 'https://www.ebay.es', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.es/deals'] },
  { name: 'Miravia', websiteUrl: 'https://www.miravia.es', categorySlug: 'alisveris', seedUrls: ['https://www.miravia.es/wow/gcp/channel/deals', 'https://www.miravia.es/campaign'] },
  { name: 'Privalia', websiteUrl: 'https://es.privalia.com', categorySlug: 'alisveris', seedUrls: ['https://es.privalia.com/campaigns'] },
  { name: 'Showroomprive', websiteUrl: 'https://www.showroomprive.es', categorySlug: 'alisveris', seedUrls: ['https://www.showroomprive.es/ventas-actuales.aspx'] },
  { name: 'Vente-Privee', websiteUrl: 'https://www.veepee.es', categorySlug: 'alisveris', seedUrls: ['https://www.veepee.es/gr/home/default/classic'] },
  { name: 'Groupon', websiteUrl: 'https://www.groupon.es', categorySlug: 'alisveris', seedUrls: ['https://www.groupon.es/deals'] },
  { name: 'Rakuten', websiteUrl: 'https://es.shopping.rakuten.com', categorySlug: 'alisveris', seedUrls: ['https://es.shopping.rakuten.com/deals'] },
  { name: 'CashConverters', websiteUrl: 'https://www.cashconverters.es', categorySlug: 'alisveris', seedUrls: ['https://www.cashconverters.es/ofertas'] },
  { name: 'Alcampo', websiteUrl: 'https://www.alcampo.es', categorySlug: 'alisveris', seedUrls: ['https://www.alcampo.es/ofertas', 'https://www.alcampo.es/folleto'] },
  { name: 'Hipercor', websiteUrl: 'https://www.hipercor.es', categorySlug: 'alisveris', seedUrls: ['https://www.hipercor.es/supermercado/ofertas/'] },
  { name: 'Worten', websiteUrl: 'https://www.worten.es', categorySlug: 'alisveris', seedUrls: ['https://www.worten.es/ofertas', 'https://www.worten.es/promociones'] },
  { name: 'Tiendanimal', websiteUrl: 'https://www.tiendanimal.es', categorySlug: 'alisveris', seedUrls: ['https://www.tiendanimal.es/ofertas/', 'https://www.tiendanimal.es/promociones/'] },
  { name: 'Kiwoko', websiteUrl: 'https://www.kiwoko.com', categorySlug: 'alisveris', seedUrls: ['https://www.kiwoko.com/ofertas', 'https://www.kiwoko.com/promociones'] },
  { name: 'Zooplus', websiteUrl: 'https://www.zooplus.es', categorySlug: 'alisveris', seedUrls: ['https://www.zooplus.es/shop/ofertas'] },
  { name: 'PC Box', websiteUrl: 'https://www.pcbox.com', categorySlug: 'alisveris', seedUrls: ['https://www.pcbox.com/ofertas'] },
  { name: 'Coolmod', websiteUrl: 'https://www.coolmod.com', categorySlug: 'alisveris', seedUrls: ['https://www.coolmod.com/ofertas', 'https://www.coolmod.com/rebajas'] },
  { name: 'TuImagen', websiteUrl: 'https://www.tuimeilibre.com', categorySlug: 'alisveris', seedUrls: ['https://www.tuimeilibre.com/ofertas'] },
  { name: 'Phone House', websiteUrl: 'https://www.phonehouse.es', categorySlug: 'alisveris', seedUrls: ['https://www.phonehouse.es/ofertas', 'https://www.phonehouse.es/promociones'] },
  { name: 'Chollometro', websiteUrl: 'https://www.chollometro.com', categorySlug: 'alisveris', seedUrls: ['https://www.chollometro.com/deals', 'https://www.chollometro.com/hot'] },
  { name: 'Milanuncios', websiteUrl: 'https://www.milanuncios.com', categorySlug: 'alisveris', seedUrls: ['https://www.milanuncios.com/ofertas/'] },
  { name: 'Wallapop', websiteUrl: 'https://es.wallapop.com', categorySlug: 'alisveris', seedUrls: ['https://es.wallapop.com/app/search'] },
  { name: 'Tien21', websiteUrl: 'https://www.tien21.es', categorySlug: 'alisveris', seedUrls: ['https://www.tien21.es/ofertas'] },
  { name: 'Conforama', websiteUrl: 'https://www.conforama.es', categorySlug: 'alisveris', seedUrls: ['https://www.conforama.es/ofertas', 'https://www.conforama.es/rebajas'] },
  { name: 'Outlet PC', websiteUrl: 'https://www.aussar.es', categorySlug: 'alisveris', seedUrls: ['https://www.aussar.es/ofertas'] },
  { name: 'Back Market', websiteUrl: 'https://www.backmarket.es', categorySlug: 'alisveris', seedUrls: ['https://www.backmarket.es/es-es/deals'] },
  { name: 'Bulevip', websiteUrl: 'https://www.bulevip.com', categorySlug: 'alisveris', seedUrls: ['https://www.bulevip.com/ofertas'] },
  { name: 'Latiendaencasa', websiteUrl: 'https://www.latiendaencasa.es', categorySlug: 'alisveris', seedUrls: ['https://www.latiendaencasa.es/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Apple', websiteUrl: 'https://www.apple.com/es', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/es/shop/go/product/refurbished', 'https://www.apple.com/es/shop/go/campaigns'] },
  { name: 'Samsung', websiteUrl: 'https://www.samsung.com/es', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/es/offer/', 'https://www.samsung.com/es/smartphones/all-smartphones/'] },
  { name: 'Xiaomi', websiteUrl: 'https://www.mi.com/es', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/es/sale', 'https://www.mi.com/es/products'] },
  { name: 'HP', websiteUrl: 'https://www.hp.com/es-es', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/es-es/shop/ofertas.html'] },
  { name: 'Lenovo', websiteUrl: 'https://www.lenovo.com/es/es', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/es/es/d/ofertas/'] },
  { name: 'Dell', websiteUrl: 'https://www.dell.com/es-es', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/es-es/shop/deals'] },
  { name: 'LG', websiteUrl: 'https://www.lg.com/es', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/es/promociones/'] },
  { name: 'Sony', websiteUrl: 'https://www.sony.es', categorySlug: 'elektronik', seedUrls: ['https://www.sony.es/es/promotional-offers'] },
  { name: 'Huawei', websiteUrl: 'https://consumer.huawei.com/es', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/es/offer/'] },
  { name: 'OPPO', websiteUrl: 'https://www.oppo.com/es', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/es/offer/'] },
  { name: 'realme', websiteUrl: 'https://www.realme.com/es', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/es/offer'] },
  { name: 'ASUS', websiteUrl: 'https://www.asus.com/es', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/es/deals/'] },
  { name: 'Acer', websiteUrl: 'https://store.acer.com/es-es', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/es-es/sale'] },
  { name: 'MSI', websiteUrl: 'https://es.msi.com', categorySlug: 'elektronik', seedUrls: ['https://es.msi.com/Promotion/'] },
  { name: 'Dyson', websiteUrl: 'https://www.dyson.es', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.es/ofertas'] },
  { name: 'Philips', websiteUrl: 'https://www.philips.es', categorySlug: 'elektronik', seedUrls: ['https://www.philips.es/c-m/ofertas-especiales'] },
  { name: 'Bose', websiteUrl: 'https://www.bose.es', categorySlug: 'elektronik', seedUrls: ['https://www.bose.es/es_es/deals.html'] },
  { name: 'JBL', websiteUrl: 'https://es.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://es.jbl.com/ofertas/'] },
  { name: 'PlayStation', websiteUrl: 'https://store.playstation.com/es-es', categorySlug: 'elektronik', seedUrls: ['https://store.playstation.com/es-es/category/ofertas/'] },
  { name: 'Nintendo', websiteUrl: 'https://www.nintendo.es', categorySlug: 'elektronik', seedUrls: ['https://www.nintendo.es/Juegos/Ofertas/Ofertas-de-juegos-de-Nintendo-Switch-1439747.html'] },
  { name: 'Xbox', websiteUrl: 'https://www.xbox.com/es-ES', categorySlug: 'elektronik', seedUrls: ['https://www.xbox.com/es-ES/games/deals'] },
  { name: 'Google Store', websiteUrl: 'https://store.google.com/es', categorySlug: 'elektronik', seedUrls: ['https://store.google.com/es/collection/offers'] },
  { name: 'Logitech', websiteUrl: 'https://www.logitech.com/es-es', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/es-es/promo/sale.html'] },
  { name: 'Razer', websiteUrl: 'https://www.razer.com/es-es', categorySlug: 'elektronik', seedUrls: ['https://www.razer.com/es-es/deals'] },
  { name: 'Cecotec', websiteUrl: 'https://www.cecotec.es', categorySlug: 'elektronik', seedUrls: ['https://www.cecotec.es/ofertas'] },
  { name: 'Rowenta', websiteUrl: 'https://www.rowenta.es', categorySlug: 'elektronik', seedUrls: ['https://www.rowenta.es/promociones'] },
  { name: 'Taurus', websiteUrl: 'https://www.taurus-home.com', categorySlug: 'elektronik', seedUrls: ['https://www.taurus-home.com/es/ofertas'] },
  { name: 'Bosch Home', websiteUrl: 'https://www.bosch-home.es', categorySlug: 'elektronik', seedUrls: ['https://www.bosch-home.es/ofertas'] },
  { name: 'Siemens Home', websiteUrl: 'https://www.siemens-home.bsh-group.com/es', categorySlug: 'elektronik', seedUrls: ['https://www.siemens-home.bsh-group.com/es/ofertas'] },
  { name: 'Balay', websiteUrl: 'https://www.balay.es', categorySlug: 'elektronik', seedUrls: ['https://www.balay.es/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 3) Fashion (giyim-moda) — 35 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Zara', websiteUrl: 'https://www.zara.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/es/es/z-sale-l1702.html'] },
  { name: 'Mango', websiteUrl: 'https://shop.mango.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/es/mujer/rebajas', 'https://shop.mango.com/es/hombre/rebajas'] },
  { name: 'Massimo Dutti', websiteUrl: 'https://www.massimodutti.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/es/rebajas-mujer-702.html', 'https://www.massimodutti.com/es/rebajas-hombre-704.html'] },
  { name: 'Pull & Bear', websiteUrl: 'https://www.pullandbear.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/es/rebajas-mujer-702.html', 'https://www.pullandbear.com/es/rebajas-hombre-704.html'] },
  { name: 'Bershka', websiteUrl: 'https://www.bershka.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/es/rebajas-c1010378062.html'] },
  { name: 'Stradivarius', websiteUrl: 'https://www.stradivarius.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/es/rebajas-702.html'] },
  { name: 'Desigual', websiteUrl: 'https://www.desigual.com/es_ES', categorySlug: 'giyim-moda', seedUrls: ['https://www.desigual.com/es_ES/rebajas/'] },
  { name: 'Cortefiel', websiteUrl: 'https://www.cortefiel.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.cortefiel.com/es/rebajas/', 'https://www.cortefiel.com/es/ofertas/'] },
  { name: 'Springfield', websiteUrl: 'https://www.springfield.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.springfield.com/es/rebajas/'] },
  { name: 'Women\'secret', websiteUrl: 'https://www.womensecret.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.womensecret.com/es/rebajas/'] },
  { name: 'Oysho', websiteUrl: 'https://www.oysho.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.oysho.com/es/rebajas-702.html'] },
  { name: 'H&M', websiteUrl: 'https://www2.hm.com/es_es', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/es_es/rebajas.html'] },
  { name: 'Primark', websiteUrl: 'https://www.primark.com/es-es', categorySlug: 'giyim-moda', seedUrls: ['https://www.primark.com/es-es/nuevos-productos'] },
  { name: 'C&A', websiteUrl: 'https://www.c-and-a.com/es/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.c-and-a.com/es/es/shop/rebajas'] },
  { name: 'Kiabi', websiteUrl: 'https://www.kiabi.es', categorySlug: 'giyim-moda', seedUrls: ['https://www.kiabi.es/rebajas', 'https://www.kiabi.es/ofertas'] },
  { name: 'Uniqlo', websiteUrl: 'https://www.uniqlo.com/es/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/es/es/spl/sale'] },
  { name: 'Nike', websiteUrl: 'https://www.nike.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/es/w/rebajas-3yaep'] },
  { name: 'Adidas', websiteUrl: 'https://www.adidas.es', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.es/rebajas'] },
  { name: 'Puma', websiteUrl: 'https://eu.puma.com/es/es', categorySlug: 'giyim-moda', seedUrls: ['https://eu.puma.com/es/es/rebajas'] },
  { name: 'Levi\'s', websiteUrl: 'https://www.levi.com/ES/es_ES', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com/ES/es_ES/sale/'] },
  { name: 'Lacoste', websiteUrl: 'https://www.lacoste.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com/es/rebajas/'] },
  { name: 'Tommy Hilfiger', websiteUrl: 'https://es.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://es.tommy.com/rebajas'] },
  { name: 'Calvin Klein', websiteUrl: 'https://www.calvinklein.es', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.es/rebajas'] },
  { name: 'Guess', websiteUrl: 'https://www.guess.eu/es-es', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.eu/es-es/sale/'] },
  { name: 'Adolfo Dominguez', websiteUrl: 'https://www.adolfodominguez.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.adolfodominguez.com/es-es/rebajas/'] },
  { name: 'Pedro del Hierro', websiteUrl: 'https://www.pedrodelhierro.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.pedrodelhierro.com/es/rebajas/'] },
  { name: 'Scalpers', websiteUrl: 'https://www.scalperscompany.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.scalperscompany.com/es/hombre/rebajas', 'https://www.scalperscompany.com/es/mujer/rebajas'] },
  { name: 'El Ganso', websiteUrl: 'https://www.elganso.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.elganso.com/es/rebajas/'] },
  { name: 'Bimba y Lola', websiteUrl: 'https://www.bimbaylola.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.bimbaylola.com/es/rebajas'] },
  { name: 'Tous', websiteUrl: 'https://www.tous.com/es-es', categorySlug: 'giyim-moda', seedUrls: ['https://www.tous.com/es-es/ofertas'] },
  { name: 'Pepe Jeans', websiteUrl: 'https://www.pepejeans.com/es_es', categorySlug: 'giyim-moda', seedUrls: ['https://www.pepejeans.com/es_es/sale/'] },
  { name: 'Lefties', websiteUrl: 'https://www.lefties.com/es', categorySlug: 'giyim-moda', seedUrls: ['https://www.lefties.com/es/rebajas-702.html'] },
  { name: 'Inside', websiteUrl: 'https://www.insideshops.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.insideshops.com/es/rebajas'] },
  { name: 'Tendam', websiteUrl: 'https://www.tendam.es', categorySlug: 'giyim-moda', seedUrls: ['https://www.tendam.es/ofertas'] },
  { name: 'Promod', websiteUrl: 'https://www.promod.es', categorySlug: 'giyim-moda', seedUrls: ['https://www.promod.es/rebajas/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA', websiteUrl: 'https://www.ikea.com/es', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/es/es/offers/', 'https://www.ikea.com/es/es/cat/ultimas-unidades-702/'] },
  { name: 'Leroy Merlin', websiteUrl: 'https://www.leroymerlin.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.leroymerlin.es/ofertas', 'https://www.leroymerlin.es/promociones'] },
  { name: 'Maisons du Monde', websiteUrl: 'https://www.maisonsdumonde.com/ES/es', categorySlug: 'ev-yasam', seedUrls: ['https://www.maisonsdumonde.com/ES/es/ofertas.htm'] },
  { name: 'Zara Home', websiteUrl: 'https://www.zarahome.com/es', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/es/rebajas-702.html'] },
  { name: 'Bricomart', websiteUrl: 'https://www.bricomart.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricomart.es/ofertas'] },
  { name: 'Bricodepot', websiteUrl: 'https://www.bricodepot.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricodepot.es/ofertas'] },
  { name: 'Bauhaus', websiteUrl: 'https://www.bauhaus.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.bauhaus.es/ofertas'] },
  { name: 'Jysk', websiteUrl: 'https://jysk.es', categorySlug: 'ev-yasam', seedUrls: ['https://jysk.es/ofertas', 'https://jysk.es/rebajas'] },
  { name: 'La Oca', websiteUrl: 'https://www.laoca.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.laoca.es/ofertas', 'https://www.laoca.es/rebajas'] },
  { name: 'Brico Depot', websiteUrl: 'https://www.bricodepot.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricodepot.es/ofertas'] },
  { name: 'ManoMano', websiteUrl: 'https://www.manomano.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.manomano.es/ofertas', 'https://www.manomano.es/rebajas'] },
  { name: 'Casa Viva', websiteUrl: 'https://www.casaviva.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.casaviva.es/ofertas'] },
  { name: 'Westwing', websiteUrl: 'https://www.westwing.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.es/campaign/'] },
  { name: 'Kave Home', websiteUrl: 'https://kavehome.com/es/es', categorySlug: 'ev-yasam', seedUrls: ['https://kavehome.com/es/es/outlet', 'https://kavehome.com/es/es/ofertas'] },
  { name: 'Kenay Home', websiteUrl: 'https://kenayhome.com', categorySlug: 'ev-yasam', seedUrls: ['https://kenayhome.com/ofertas', 'https://kenayhome.com/outlet'] },
  { name: 'Habitat', websiteUrl: 'https://www.habitat.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.habitat.es/ofertas'] },
  { name: 'BoConcept', websiteUrl: 'https://www.boconcept.com/es-es', categorySlug: 'ev-yasam', seedUrls: ['https://www.boconcept.com/es-es/ofertas/'] },
  { name: 'Porcelanosa', websiteUrl: 'https://www.porcelanosa.com/es', categorySlug: 'ev-yasam', seedUrls: ['https://www.porcelanosa.com/es/promociones'] },
  { name: 'El Corte Inglés Hogar', websiteUrl: 'https://www.elcorteingles.es/hogar', categorySlug: 'ev-yasam', seedUrls: ['https://www.elcorteingles.es/hogar/ofertas/'] },
  { name: 'Very', websiteUrl: 'https://www.very.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.very.es/ofertas'] },
  { name: 'Schmidt Cocinas', websiteUrl: 'https://www.schmidt-cocinas.com/es-es', categorySlug: 'ev-yasam', seedUrls: ['https://www.schmidt-cocinas.com/es-es/promociones'] },
  { name: 'Tuco', websiteUrl: 'https://www.tuco.net', categorySlug: 'ev-yasam', seedUrls: ['https://www.tuco.net/ofertas'] },
  { name: 'Sklum', websiteUrl: 'https://www.sklum.com/es', categorySlug: 'ev-yasam', seedUrls: ['https://www.sklum.com/es/ofertas', 'https://www.sklum.com/es/outlet'] },
  { name: 'Hogar24', websiteUrl: 'https://www.hogar24.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.hogar24.es/ofertas'] },
  { name: 'Swisshome', websiteUrl: 'https://www.swisshome.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.swisshome.es/ofertas'] },
  { name: 'Banak Importa', websiteUrl: 'https://www.bfrankfurt.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.bfrankfurt.com/ofertas'] },
  { name: 'Aki Bricolaje', websiteUrl: 'https://www.aki.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.aki.es/ofertas'] },
  { name: 'Verdecora', websiteUrl: 'https://www.verdecora.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.verdecora.es/ofertas'] },
  { name: 'La Redoute', websiteUrl: 'https://www.laredoute.es', categorySlug: 'ev-yasam', seedUrls: ['https://www.laredoute.es/ppdp/cat-3801/page1.aspx'] },
  { name: 'Tramas', websiteUrl: 'https://www.tramasoline.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.tramasoline.com/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 5) Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Mercadona', websiteUrl: 'https://www.mercadona.es', categorySlug: 'gida-market', seedUrls: ['https://www.mercadona.es/ofertas/'] },
  { name: 'Carrefour Supermercado', websiteUrl: 'https://www.carrefour.es', categorySlug: 'gida-market', seedUrls: ['https://www.carrefour.es/supermercado/ofertas/', 'https://www.carrefour.es/supermercado/folleto-ofertas/'] },
  { name: 'DIA', websiteUrl: 'https://www.dia.es', categorySlug: 'gida-market', seedUrls: ['https://www.dia.es/ofertas', 'https://www.dia.es/folleto'] },
  { name: 'Eroski', websiteUrl: 'https://www.eroski.es', categorySlug: 'gida-market', seedUrls: ['https://www.eroski.es/ofertas/', 'https://www.eroski.es/folleto/'] },
  { name: 'Aldi', websiteUrl: 'https://www.aldi.es', categorySlug: 'gida-market', seedUrls: ['https://www.aldi.es/ofertas/', 'https://www.aldi.es/folleto/'] },
  { name: 'Lidl Supermercado', websiteUrl: 'https://www.lidl.es', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.es/es/ofertas-de-la-semana'] },
  { name: 'Alcampo Supermercado', websiteUrl: 'https://www.alcampo.es', categorySlug: 'gida-market', seedUrls: ['https://www.alcampo.es/compra-online/ofertas'] },
  { name: 'Hipercor Supermercado', websiteUrl: 'https://www.hipercor.es', categorySlug: 'gida-market', seedUrls: ['https://www.hipercor.es/supermercado/ofertas/'] },
  { name: 'Condis', websiteUrl: 'https://www.condisline.com', categorySlug: 'gida-market', seedUrls: ['https://www.condisline.com/ofertas'] },
  { name: 'Consum', websiteUrl: 'https://www.consum.es', categorySlug: 'gida-market', seedUrls: ['https://www.consum.es/ofertas'] },
  { name: 'BonPreu', websiteUrl: 'https://www.bonpreuesclat.cat', categorySlug: 'gida-market', seedUrls: ['https://www.bonpreuesclat.cat/ofertes'] },
  { name: 'Caprabo', websiteUrl: 'https://www.caprabo.com', categorySlug: 'gida-market', seedUrls: ['https://www.caprabo.com/es/ofertas/'] },
  { name: 'Simply', websiteUrl: 'https://www.simply.es', categorySlug: 'gida-market', seedUrls: ['https://www.simply.es/ofertas'] },
  { name: 'Ahorramas', websiteUrl: 'https://www.ahorramas.com', categorySlug: 'gida-market', seedUrls: ['https://www.ahorramas.com/ofertas'] },
  { name: 'Gadis', websiteUrl: 'https://www.gadis.es', categorySlug: 'gida-market', seedUrls: ['https://www.gadis.es/ofertas'] },
  { name: 'Coviran', websiteUrl: 'https://www.coviran.es', categorySlug: 'gida-market', seedUrls: ['https://www.coviran.es/ofertas'] },
  { name: 'Familia', websiteUrl: 'https://www.masymas.com', categorySlug: 'gida-market', seedUrls: ['https://www.masymas.com/ofertas'] },
  { name: 'SuperSol', websiteUrl: 'https://www.supersol.es', categorySlug: 'gida-market', seedUrls: ['https://www.supersol.es/ofertas'] },
  { name: 'BM Supermercados', websiteUrl: 'https://www.bmsupermercados.es', categorySlug: 'gida-market', seedUrls: ['https://www.bmsupermercados.es/ofertas'] },
  { name: 'La Plaza de DIA', websiteUrl: 'https://www.laplazadedia.es', categorySlug: 'gida-market', seedUrls: ['https://www.laplazadedia.es/ofertas'] },
  { name: 'Spar', websiteUrl: 'https://www.spar.es', categorySlug: 'gida-market', seedUrls: ['https://www.spar.es/ofertas'] },
  { name: 'El Corte Inglés Supermercado', websiteUrl: 'https://www.elcorteingles.es/supermercado', categorySlug: 'gida-market', seedUrls: ['https://www.elcorteingles.es/supermercado/ofertas/'] },
  { name: 'Tu Super', websiteUrl: 'https://www.tusuper.com', categorySlug: 'gida-market', seedUrls: ['https://www.tusuper.com/ofertas'] },
  { name: 'Uvesco', websiteUrl: 'https://www.uvesco.es', categorySlug: 'gida-market', seedUrls: ['https://www.uvesco.es/ofertas'] },
  { name: 'Hiber', websiteUrl: 'https://www.hiber.es', categorySlug: 'gida-market', seedUrls: ['https://www.hiber.es/ofertas'] },
  { name: 'El Jamón', websiteUrl: 'https://www.eljamon.es', categorySlug: 'gida-market', seedUrls: ['https://www.eljamon.es/ofertas'] },
  { name: 'Makro', websiteUrl: 'https://www.makro.es', categorySlug: 'gida-market', seedUrls: ['https://www.makro.es/ofertas'] },
  { name: 'Costco', websiteUrl: 'https://www.costco.es', categorySlug: 'gida-market', seedUrls: ['https://www.costco.es/ofertas'] },
  { name: 'Veritas', websiteUrl: 'https://www.veritas.es', categorySlug: 'gida-market', seedUrls: ['https://www.veritas.es/ofertas'] },
  { name: 'Froiz', websiteUrl: 'https://www.froiz.com', categorySlug: 'gida-market', seedUrls: ['https://www.froiz.com/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Drink / Restaurants (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Telepizza', websiteUrl: 'https://www.telepizza.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.telepizza.es/ofertas', 'https://www.telepizza.es/promociones'] },
  { name: 'Domino\'s Pizza', websiteUrl: 'https://www.dominos.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.es/ofertas'] },
  { name: 'Just Eat', websiteUrl: 'https://www.just-eat.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.just-eat.es/ofertas', 'https://www.just-eat.es/descuentos'] },
  { name: 'Uber Eats', websiteUrl: 'https://www.ubereats.com/es', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/es/deals'] },
  { name: 'Glovo', websiteUrl: 'https://glovoapp.com/es/es', categorySlug: 'yeme-icme', seedUrls: ['https://glovoapp.com/es/es/ofertas'] },
  { name: 'Burger King', websiteUrl: 'https://www.burgerking.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.es/ofertas', 'https://www.burgerking.es/promociones'] },
  { name: 'McDonald\'s', websiteUrl: 'https://www.mcdonalds.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.es/ofertas', 'https://www.mcdonalds.es/promociones'] },
  { name: 'KFC', websiteUrl: 'https://www.kfc.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.es/ofertas', 'https://www.kfc.es/promociones'] },
  { name: 'Pizza Hut', websiteUrl: 'https://www.pizzahut.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.es/ofertas'] },
  { name: 'Papa John\'s', websiteUrl: 'https://www.papajohns.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.es/ofertas', 'https://www.papajohns.es/promociones'] },
  { name: 'Subway', websiteUrl: 'https://www.subway.com/es-ES', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/es-ES/menunutrition/offers'] },
  { name: 'Taco Bell', websiteUrl: 'https://www.tacobell.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.tacobell.es/ofertas'] },
  { name: 'Five Guys', websiteUrl: 'https://fiveguys.es', categorySlug: 'yeme-icme', seedUrls: ['https://fiveguys.es/promociones'] },
  { name: 'Goiko', websiteUrl: 'https://www.goiko.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.goiko.com/ofertas', 'https://www.goiko.com/promociones'] },
  { name: 'Vips', websiteUrl: 'https://www.vips.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.vips.es/ofertas', 'https://www.vips.es/promociones'] },
  { name: 'Ginos', websiteUrl: 'https://www.ginos.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.ginos.es/ofertas'] },
  { name: 'La Tagliatella', websiteUrl: 'https://www.latagliatella.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.latagliatella.es/ofertas', 'https://www.latagliatella.es/promociones'] },
  { name: 'Foster\'s Hollywood', websiteUrl: 'https://www.fostershollywood.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.fostershollywood.es/ofertas', 'https://www.fostershollywood.es/promociones'] },
  { name: '100 Montaditos', websiteUrl: 'https://spain.100montaditos.com', categorySlug: 'yeme-icme', seedUrls: ['https://spain.100montaditos.com/ofertas'] },
  { name: 'TGB - The Good Burger', websiteUrl: 'https://www.tgb.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.tgb.es/ofertas', 'https://www.tgb.es/promociones'] },
  { name: 'Starbucks', websiteUrl: 'https://www.starbucks.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.es/ofertas'] },
  { name: 'Dunkin\'', websiteUrl: 'https://www.dunkindonuts.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.es/ofertas', 'https://www.dunkindonuts.es/promociones'] },
  { name: 'Popeyes', websiteUrl: 'https://www.popeyes.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.popeyes.es/ofertas'] },
  { name: 'Pans & Company', websiteUrl: 'https://www.pansandcompany.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.pansandcompany.com/ofertas'] },
  { name: 'Carl\'s Jr.', websiteUrl: 'https://www.carlsjr.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.carlsjr.es/ofertas'] },
  { name: 'Wok to Walk', websiteUrl: 'https://www.woktowalk.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.woktowalk.com/ofertas'] },
  { name: 'Tony Roma\'s', websiteUrl: 'https://www.tonyromasrestaurant.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.tonyromasrestaurant.es/ofertas'] },
  { name: 'Rodilla', websiteUrl: 'https://www.rodilla.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.rodilla.es/ofertas', 'https://www.rodilla.es/promociones'] },
  { name: 'Deliveroo', websiteUrl: 'https://deliveroo.es', categorySlug: 'yeme-icme', seedUrls: ['https://deliveroo.es/es/ofertas'] },
  { name: 'El Tenedor', websiteUrl: 'https://www.thefork.es', categorySlug: 'yeme-icme', seedUrls: ['https://www.thefork.es/ofertas', 'https://www.thefork.es/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty & Personal Care (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sephora', websiteUrl: 'https://www.sephora.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.es/ofertas/', 'https://www.sephora.es/rebajas/'] },
  { name: 'Druni', websiteUrl: 'https://www.druni.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.druni.es/ofertas', 'https://www.druni.es/promociones'] },
  { name: 'Primor', websiteUrl: 'https://www.primor.eu', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.primor.eu/ofertas/', 'https://www.primor.eu/rebajas/'] },
  { name: 'Douglas', websiteUrl: 'https://www.douglas.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.douglas.es/es/c/ofertas/01'] },
  { name: 'Yves Rocher', websiteUrl: 'https://www.yves-rocher.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yves-rocher.es/ofertas', 'https://www.yves-rocher.es/promociones'] },
  { name: 'Rituals', websiteUrl: 'https://www.rituals.com/es-es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/es-es/sale.html'] },
  { name: 'The Body Shop', websiteUrl: 'https://www.thebodyshop.com/es-es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com/es-es/ofertas/'] },
  { name: 'MAC Cosmetics', websiteUrl: 'https://www.maccosmetics.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.es/ofertas'] },
  { name: 'Clinique', websiteUrl: 'https://www.clinique.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.es/ofertas'] },
  { name: 'Estee Lauder', websiteUrl: 'https://www.esteelauder.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.es/ofertas'] },
  { name: 'Kiko Milano', websiteUrl: 'https://www.kikocosmetics.com/es-es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kikocosmetics.com/es-es/ofertas/'] },
  { name: 'NYX Professional Makeup', websiteUrl: 'https://www.nyxcosmetics.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.es/rebajas/'] },
  { name: 'L\'Oreal Paris', websiteUrl: 'https://www.loreal-paris.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.es/ofertas'] },
  { name: 'Lancôme', websiteUrl: 'https://www.lancome.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lancome.es/ofertas'] },
  { name: 'Kiehl\'s', websiteUrl: 'https://www.kiehls.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.es/ofertas'] },
  { name: 'Natura Bissé', websiteUrl: 'https://www.naturabisse.com/es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.naturabisse.com/es/ofertas'] },
  { name: 'Freshly Cosmetics', websiteUrl: 'https://www.freshlycosmetics.com/es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.freshlycosmetics.com/es/ofertas'] },
  { name: 'Sesderma', websiteUrl: 'https://www.sesderma.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sesderma.com/es/ofertas'] },
  { name: 'Isdin', websiteUrl: 'https://www.isdin.com/es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.isdin.com/es/ofertas'] },
  { name: 'Vichy', websiteUrl: 'https://www.vichy.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.es/ofertas'] },
  { name: 'La Roche-Posay', websiteUrl: 'https://www.laroche-posay.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.es/ofertas'] },
  { name: 'Avene', websiteUrl: 'https://www.avene.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avene.es/ofertas'] },
  { name: 'Nivea', websiteUrl: 'https://www.nivea.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.es/ofertas', 'https://www.nivea.es/promociones'] },
  { name: 'Garnier', websiteUrl: 'https://www.garnier.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.es/ofertas'] },
  { name: 'Lush', websiteUrl: 'https://www.lush.com/es/es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/es/es/c/sale'] },
  { name: 'Maquillalia', websiteUrl: 'https://www.maquillalia.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maquillalia.com/ofertas', 'https://www.maquillalia.com/rebajas'] },
  { name: 'Perfumes Club', websiteUrl: 'https://www.perfumesclub.com/es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.perfumesclub.com/es/ofertas/'] },
  { name: 'Arenal Perfumerias', websiteUrl: 'https://www.arenalperfumerias.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.arenalperfumerias.com/ofertas'] },
  { name: 'Biotherm', websiteUrl: 'https://www.biotherm.es', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.biotherm.es/ofertas'] },
  { name: 'PromoFarma', websiteUrl: 'https://www.promofarma.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.promofarma.com/ofertas', 'https://www.promofarma.com/descuentos'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon', websiteUrl: 'https://www.decathlon.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.es/es/ofertas', 'https://www.decathlon.es/es/rebajas'] },
  { name: 'Sprinter', websiteUrl: 'https://www.sprinter.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sprinter.es/ofertas', 'https://www.sprinter.es/rebajas'] },
  { name: 'Forum Sport', websiteUrl: 'https://www.forumsport.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.forumsport.com/ofertas', 'https://www.forumsport.com/rebajas'] },
  { name: 'Nike Sport', websiteUrl: 'https://www.nike.com/es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/es/w/rebajas-3yaep'] },
  { name: 'Adidas Sport', websiteUrl: 'https://www.adidas.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.es/rebajas', 'https://www.adidas.es/outlet'] },
  { name: 'Puma Sport', websiteUrl: 'https://eu.puma.com/es/es', categorySlug: 'spor-outdoor', seedUrls: ['https://eu.puma.com/es/es/rebajas'] },
  { name: 'New Balance', websiteUrl: 'https://www.newbalance.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.es/rebajas/'] },
  { name: 'Asics', websiteUrl: 'https://www.asics.com/es/es-es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/es/es-es/outlet/'] },
  { name: 'Under Armour', websiteUrl: 'https://www.underarmour.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.es/es-es/c/outlet/'] },
  { name: 'Reebok', websiteUrl: 'https://www.reebok.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.es/rebajas'] },
  { name: 'The North Face', websiteUrl: 'https://www.thenorthface.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.es/rebajas/'] },
  { name: 'Columbia', websiteUrl: 'https://www.columbiasportswear.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.es/es/sale/'] },
  { name: 'Salomon', websiteUrl: 'https://www.salomon.com/es-es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/es-es/sale/'] },
  { name: 'Helly Hansen', websiteUrl: 'https://www.hellyhansen.com/es_es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.com/es_es/sale'] },
  { name: 'Intersport', websiteUrl: 'https://www.intersport.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.es/ofertas/', 'https://www.intersport.es/rebajas/'] },
  { name: 'Deporvillage', websiteUrl: 'https://www.deporvillage.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.deporvillage.com/ofertas'] },
  { name: 'Tradeinn', websiteUrl: 'https://www.tradeinn.com/trekkinn/es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.tradeinn.com/trekkinn/es/ofertas'] },
  { name: 'Skechers', websiteUrl: 'https://www.skechers.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.es/rebajas/'] },
  { name: 'Vans', websiteUrl: 'https://www.vans.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.es/rebajas.html'] },
  { name: 'Converse', websiteUrl: 'https://www.converse.com/es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com/es/rebajas/'] },
  { name: 'Foot Locker', websiteUrl: 'https://www.footlocker.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.footlocker.es/es/category/rebajas.html'] },
  { name: 'JD Sports', websiteUrl: 'https://www.jdsports.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jdsports.es/ofertas/'] },
  { name: 'Snipes', websiteUrl: 'https://www.snipes.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.snipes.es/c-sale'] },
  { name: 'Padel Nuestro', websiteUrl: 'https://www.padelnuestro.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.padelnuestro.com/ofertas'] },
  { name: 'Barrabes', websiteUrl: 'https://www.barrabes.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.barrabes.com/ofertas', 'https://www.barrabes.com/rebajas'] },
  { name: 'Mammut', websiteUrl: 'https://www.mammut.com/es/es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mammut.com/es/es/sale/'] },
  { name: 'Patagonia', websiteUrl: 'https://eu.patagonia.com/es/es', categorySlug: 'spor-outdoor', seedUrls: ['https://eu.patagonia.com/es/es/shop/web-specials'] },
  { name: 'Fútbol Emotion', websiteUrl: 'https://www.futbolemotion.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.futbolemotion.com/ofertas', 'https://www.futbolemotion.com/rebajas'] },
  { name: 'Wiggle', websiteUrl: 'https://www.wiggle.es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wiggle.es/ofertas'] },
  { name: 'Chain Reaction Cycles', websiteUrl: 'https://www.chainreactioncycles.com/es/es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.chainreactioncycles.com/es/es/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Iberia', websiteUrl: 'https://www.iberia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.iberia.com/es/ofertas/', 'https://www.iberia.com/es/ofertas-vuelos/'] },
  { name: 'Vueling', websiteUrl: 'https://www.vueling.com/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vueling.com/es/ofertas'] },
  { name: 'Ryanair', websiteUrl: 'https://www.ryanair.com/es/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/es/es/ofertas'] },
  { name: 'EasyJet', websiteUrl: 'https://www.easyjet.com/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easyjet.com/es/ofertas'] },
  { name: 'Air Europa', websiteUrl: 'https://www.aireuropa.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.aireuropa.com/es/es/ofertas'] },
  { name: 'Renfe', websiteUrl: 'https://www.renfe.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.renfe.com/es/es/ofertas-descuentos'] },
  { name: 'Iryo', websiteUrl: 'https://iryo.eu', categorySlug: 'seyahat-ulasim', seedUrls: ['https://iryo.eu/ofertas'] },
  { name: 'Ouigo', websiteUrl: 'https://www.ouigo.com/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ouigo.com/es/ofertas'] },
  { name: 'Avlo', websiteUrl: 'https://www.renfe.com/es/es/avlo', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.renfe.com/es/es/avlo/ofertas'] },
  { name: 'Booking.com', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.es.html'] },
  { name: 'Skyscanner', websiteUrl: 'https://www.skyscanner.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.es/ofertas'] },
  { name: 'Kayak', websiteUrl: 'https://www.kayak.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.es/ofertas'] },
  { name: 'eDreams', websiteUrl: 'https://www.edreams.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.edreams.es/ofertas/', 'https://www.edreams.es/descuentos/'] },
  { name: 'Viajes El Corte Inglés', websiteUrl: 'https://www.viajeselcorteingles.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.viajeselcorteingles.es/ofertas/', 'https://www.viajeselcorteingles.es/promociones/'] },
  { name: 'Logitravel', websiteUrl: 'https://www.logitravel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.logitravel.com/ofertas/'] },
  { name: 'Destinia', websiteUrl: 'https://www.destinia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.destinia.com/ofertas/'] },
  { name: 'Muchoviaje', websiteUrl: 'https://www.muchoviaje.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.muchoviaje.com/ofertas'] },
  { name: 'Rumbo', websiteUrl: 'https://www.rumbo.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rumbo.es/ofertas/'] },
  { name: 'Expedia', websiteUrl: 'https://www.expedia.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.es/ofertas', 'https://www.expedia.es/deals'] },
  { name: 'Trivago', websiteUrl: 'https://www.trivago.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.es/ofertas'] },
  { name: 'Hotels.com', websiteUrl: 'https://es.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://es.hotels.com/deals/'] },
  { name: 'Meliá Hotels', websiteUrl: 'https://www.melia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.melia.com/es/ofertas.htm'] },
  { name: 'NH Hotels', websiteUrl: 'https://www.nh-hotels.com/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nh-hotels.com/es/ofertas'] },
  { name: 'Paradores', websiteUrl: 'https://www.parador.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.parador.es/es/ofertas'] },
  { name: 'Barceló Hotels', websiteUrl: 'https://www.barcelo.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.barcelo.com/es-es/ofertas/'] },
  { name: 'Riu Hotels', websiteUrl: 'https://www.riu.com/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.riu.com/es/ofertas/'] },
  { name: 'Europcar', websiteUrl: 'https://www.europcar.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.es/ofertas'] },
  { name: 'Sixt', websiteUrl: 'https://www.sixt.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sixt.es/ofertas/'] },
  { name: 'Blablacar', websiteUrl: 'https://www.blablacar.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.blablacar.es/ofertas'] },
  { name: 'FlixBus', websiteUrl: 'https://www.flixbus.es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.es/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Santander', websiteUrl: 'https://www.bancosantander.es', categorySlug: 'finans', seedUrls: ['https://www.bancosantander.es/particulares/ofertas', 'https://www.bancosantander.es/particulares/promociones'] },
  { name: 'BBVA', websiteUrl: 'https://www.bbva.es', categorySlug: 'finans', seedUrls: ['https://www.bbva.es/personas/ofertas.html', 'https://www.bbva.es/personas/promociones.html'] },
  { name: 'CaixaBank', websiteUrl: 'https://www.caixabank.es', categorySlug: 'finans', seedUrls: ['https://www.caixabank.es/particular/ofertas.html'] },
  { name: 'Bankinter', websiteUrl: 'https://www.bankinter.com', categorySlug: 'finans', seedUrls: ['https://www.bankinter.com/banca/particulares/ofertas'] },
  { name: 'ING', websiteUrl: 'https://www.ing.es', categorySlug: 'finans', seedUrls: ['https://www.ing.es/ofertas', 'https://www.ing.es/promociones'] },
  { name: 'Revolut', websiteUrl: 'https://www.revolut.com/es-ES', categorySlug: 'finans', seedUrls: ['https://www.revolut.com/es-ES/ofertas'] },
  { name: 'N26', websiteUrl: 'https://n26.com/es-es', categorySlug: 'finans', seedUrls: ['https://n26.com/es-es/ofertas'] },
  { name: 'Openbank', websiteUrl: 'https://www.openbank.es', categorySlug: 'finans', seedUrls: ['https://www.openbank.es/ofertas', 'https://www.openbank.es/promociones'] },
  { name: 'Sabadell', websiteUrl: 'https://www.bancsabadell.com', categorySlug: 'finans', seedUrls: ['https://www.bancsabadell.com/cs/Satellite/SabsES/Particulares/Ofertas/'] },
  { name: 'Unicaja', websiteUrl: 'https://www.unicajabanco.es', categorySlug: 'finans', seedUrls: ['https://www.unicajabanco.es/es/ofertas'] },
  { name: 'Abanca', websiteUrl: 'https://www.abanca.com', categorySlug: 'finans', seedUrls: ['https://www.abanca.com/es/ofertas/'] },
  { name: 'Ibercaja', websiteUrl: 'https://www.ibercaja.es', categorySlug: 'finans', seedUrls: ['https://www.ibercaja.es/ofertas'] },
  { name: 'Kutxabank', websiteUrl: 'https://www.kutxabank.es', categorySlug: 'finans', seedUrls: ['https://www.kutxabank.es/ofertas'] },
  { name: 'Laboral Kutxa', websiteUrl: 'https://www.laboralkutxa.com', categorySlug: 'finans', seedUrls: ['https://www.laboralkutxa.com/es/ofertas'] },
  { name: 'EVO Banco', websiteUrl: 'https://www.evobanco.com', categorySlug: 'finans', seedUrls: ['https://www.evobanco.com/ofertas/'] },
  { name: 'Pibank', websiteUrl: 'https://www.pibank.es', categorySlug: 'finans', seedUrls: ['https://www.pibank.es/ofertas'] },
  { name: 'WiZink', websiteUrl: 'https://www.wizink.es', categorySlug: 'finans', seedUrls: ['https://www.wizink.es/ofertas', 'https://www.wizink.es/promociones'] },
  { name: 'Cetelem', websiteUrl: 'https://www.cetelem.es', categorySlug: 'finans', seedUrls: ['https://www.cetelem.es/ofertas'] },
  { name: 'Cofidis', websiteUrl: 'https://www.cofidis.es', categorySlug: 'finans', seedUrls: ['https://www.cofidis.es/ofertas'] },
  { name: 'Vivus', websiteUrl: 'https://www.vivus.es', categorySlug: 'finans', seedUrls: ['https://www.vivus.es/ofertas'] },
  { name: 'Trade Republic', websiteUrl: 'https://www.traderepublic.com/es-es', categorySlug: 'finans', seedUrls: ['https://www.traderepublic.com/es-es/ofertas'] },
  { name: 'eToro', websiteUrl: 'https://www.etoro.com/es', categorySlug: 'finans', seedUrls: ['https://www.etoro.com/es/ofertas/'] },
  { name: 'Degiro', websiteUrl: 'https://www.degiro.es', categorySlug: 'finans', seedUrls: ['https://www.degiro.es/ofertas'] },
  { name: 'Interactive Brokers', websiteUrl: 'https://www.interactivebrokers.es', categorySlug: 'finans', seedUrls: ['https://www.interactivebrokers.es/es/trading/ofertas.php'] },
  { name: 'Raisin', websiteUrl: 'https://www.raisin.es', categorySlug: 'finans', seedUrls: ['https://www.raisin.es/ofertas/'] },
  { name: 'MyInvestor', websiteUrl: 'https://myinvestor.es', categorySlug: 'finans', seedUrls: ['https://myinvestor.es/ofertas/'] },
  { name: 'Bizum', websiteUrl: 'https://bizum.es', categorySlug: 'finans', seedUrls: ['https://bizum.es/ofertas/'] },
  { name: 'Wise', websiteUrl: 'https://wise.com/es', categorySlug: 'finans', seedUrls: ['https://wise.com/es/ofertas'] },
  { name: 'PayPal', websiteUrl: 'https://www.paypal.com/es', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/es/webapps/mpp/ofertas'] },
  { name: 'Klarna', websiteUrl: 'https://www.klarna.com/es', categorySlug: 'finans', seedUrls: ['https://www.klarna.com/es/ofertas/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Mapfre', websiteUrl: 'https://www.mapfre.es', categorySlug: 'sigorta', seedUrls: ['https://www.mapfre.es/seguros/ofertas/', 'https://www.mapfre.es/seguros/promociones/'] },
  { name: 'Allianz', websiteUrl: 'https://www.allianz.es', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.es/seguros/ofertas.html'] },
  { name: 'AXA', websiteUrl: 'https://www.axa.es', categorySlug: 'sigorta', seedUrls: ['https://www.axa.es/seguros/ofertas', 'https://www.axa.es/seguros/promociones'] },
  { name: 'Mutua Madrileña', websiteUrl: 'https://www.mutua.es', categorySlug: 'sigorta', seedUrls: ['https://www.mutua.es/seguros/ofertas/', 'https://www.mutua.es/seguros/promociones/'] },
  { name: 'Línea Directa', websiteUrl: 'https://www.lineadirecta.com', categorySlug: 'sigorta', seedUrls: ['https://www.lineadirecta.com/seguros/ofertas', 'https://www.lineadirecta.com/seguros/promociones'] },
  { name: 'Pelayo', websiteUrl: 'https://www.pelayo.com', categorySlug: 'sigorta', seedUrls: ['https://www.pelayo.com/seguros/ofertas'] },
  { name: 'Zurich', websiteUrl: 'https://www.zurich.es', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.es/seguros/ofertas'] },
  { name: 'Generali', websiteUrl: 'https://www.generali.es', categorySlug: 'sigorta', seedUrls: ['https://www.generali.es/seguros/ofertas'] },
  { name: 'Sanitas', websiteUrl: 'https://www.sanitas.es', categorySlug: 'sigorta', seedUrls: ['https://www.sanitas.es/seguros/ofertas', 'https://www.sanitas.es/seguros/promociones'] },
  { name: 'DKV', websiteUrl: 'https://dkvseguros.com', categorySlug: 'sigorta', seedUrls: ['https://dkvseguros.com/seguros/ofertas'] },
  { name: 'Adeslas', websiteUrl: 'https://www.segurcaixaadeslas.es', categorySlug: 'sigorta', seedUrls: ['https://www.segurcaixaadeslas.es/es/seguros-salud/ofertas'] },
  { name: 'Asisa', websiteUrl: 'https://www.asisa.es', categorySlug: 'sigorta', seedUrls: ['https://www.asisa.es/seguros/ofertas'] },
  { name: 'Caser', websiteUrl: 'https://www.caser.es', categorySlug: 'sigorta', seedUrls: ['https://www.caser.es/seguros/ofertas'] },
  { name: 'Fiatc', websiteUrl: 'https://www.fiatc.es', categorySlug: 'sigorta', seedUrls: ['https://www.fiatc.es/seguros/ofertas'] },
  { name: 'Helvetia', websiteUrl: 'https://www.helvetia.es', categorySlug: 'sigorta', seedUrls: ['https://www.helvetia.es/seguros/ofertas'] },
  { name: 'Reale Seguros', websiteUrl: 'https://www.reale.es', categorySlug: 'sigorta', seedUrls: ['https://www.reale.es/seguros/ofertas'] },
  { name: 'Liberty Seguros', websiteUrl: 'https://www.libertyseguros.es', categorySlug: 'sigorta', seedUrls: ['https://www.libertyseguros.es/seguros/ofertas'] },
  { name: 'Catalana Occidente', websiteUrl: 'https://www.seguroscatalanaoccidente.com', categorySlug: 'sigorta', seedUrls: ['https://www.seguroscatalanaoccidente.com/seguros/ofertas'] },
  { name: 'Previsora Bilbaina', websiteUrl: 'https://www.pbilbaina.com', categorySlug: 'sigorta', seedUrls: ['https://www.pbilbaina.com/seguros/ofertas'] },
  { name: 'Santa Lucía', websiteUrl: 'https://www.santalucia.es', categorySlug: 'sigorta', seedUrls: ['https://www.santalucia.es/seguros/ofertas'] },
  { name: 'Plus Ultra Seguros', websiteUrl: 'https://www.plusultra.es', categorySlug: 'sigorta', seedUrls: ['https://www.plusultra.es/seguros/ofertas'] },
  { name: 'Rastreator', websiteUrl: 'https://www.rastreator.com', categorySlug: 'sigorta', seedUrls: ['https://www.rastreator.com/seguros/ofertas', 'https://www.rastreator.com/seguros/promociones'] },
  { name: 'Acierto.com', websiteUrl: 'https://www.acierto.com', categorySlug: 'sigorta', seedUrls: ['https://www.acierto.com/seguros/ofertas'] },
  { name: 'Kelisto', websiteUrl: 'https://www.kelisto.es', categorySlug: 'sigorta', seedUrls: ['https://www.kelisto.es/seguros/ofertas'] },
  { name: 'Verti', websiteUrl: 'https://www.verti.es', categorySlug: 'sigorta', seedUrls: ['https://www.verti.es/seguros/ofertas'] },
  { name: 'Balumba', websiteUrl: 'https://www.balumba.es', categorySlug: 'sigorta', seedUrls: ['https://www.balumba.es/seguros/ofertas'] },
  { name: 'Qualitas Auto', websiteUrl: 'https://www.qualitasauto.com', categorySlug: 'sigorta', seedUrls: ['https://www.qualitasauto.com/seguros/ofertas'] },
  { name: 'Nationale-Nederlanden', websiteUrl: 'https://www.nn-seguros.es', categorySlug: 'sigorta', seedUrls: ['https://www.nn-seguros.es/seguros/ofertas'] },
  { name: 'Aegon', websiteUrl: 'https://www.aegon.es', categorySlug: 'sigorta', seedUrls: ['https://www.aegon.es/seguros/ofertas'] },
  { name: 'MetLife', websiteUrl: 'https://www.metlife.es', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.es/seguros/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SEAT', websiteUrl: 'https://www.seat.es', categorySlug: 'otomobil', seedUrls: ['https://www.seat.es/ofertas.html', 'https://www.seat.es/promociones.html'] },
  { name: 'Cupra', websiteUrl: 'https://www.cupraofficial.es', categorySlug: 'otomobil', seedUrls: ['https://www.cupraofficial.es/ofertas.html'] },
  { name: 'Renault', websiteUrl: 'https://www.renault.es', categorySlug: 'otomobil', seedUrls: ['https://www.renault.es/ofertas.html', 'https://www.renault.es/promociones.html'] },
  { name: 'Peugeot', websiteUrl: 'https://www.peugeot.es', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.es/ofertas.html'] },
  { name: 'Citroën', websiteUrl: 'https://www.citroen.es', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.es/ofertas.html'] },
  { name: 'Toyota', websiteUrl: 'https://www.toyota.es', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.es/ofertas'] },
  { name: 'Volkswagen', websiteUrl: 'https://www.volkswagen.es', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.es/es/ofertas.html'] },
  { name: 'Ford', websiteUrl: 'https://www.ford.es', categorySlug: 'otomobil', seedUrls: ['https://www.ford.es/ofertas'] },
  { name: 'Hyundai', websiteUrl: 'https://www.hyundai.com/es', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/es/ofertas.html'] },
  { name: 'Kia', websiteUrl: 'https://www.kia.com/es', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/es/ofertas/'] },
  { name: 'Nissan', websiteUrl: 'https://www.nissan.es', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.es/ofertas.html'] },
  { name: 'Mazda', websiteUrl: 'https://www.mazda.es', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.es/ofertas/'] },
  { name: 'BMW', websiteUrl: 'https://www.bmw.es', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.es/es/ofertas.html'] },
  { name: 'Mercedes-Benz', websiteUrl: 'https://www.mercedes-benz.es', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.es/passengercars/campaigns.html'] },
  { name: 'Audi', websiteUrl: 'https://www.audi.es', categorySlug: 'otomobil', seedUrls: ['https://www.audi.es/es/web/es/ofertas.html'] },
  { name: 'Opel', websiteUrl: 'https://www.opel.es', categorySlug: 'otomobil', seedUrls: ['https://www.opel.es/ofertas.html'] },
  { name: 'Fiat', websiteUrl: 'https://www.fiat.es', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.es/ofertas'] },
  { name: 'Dacia', websiteUrl: 'https://www.dacia.es', categorySlug: 'otomobil', seedUrls: ['https://www.dacia.es/ofertas.html'] },
  { name: 'Skoda', websiteUrl: 'https://www.skoda.es', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.es/ofertas'] },
  { name: 'Volvo', websiteUrl: 'https://www.volvocars.com/es', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/es/ofertas/'] },
  { name: 'Tesla', websiteUrl: 'https://www.tesla.com/es_es', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/es_es/inventory/'] },
  { name: 'MG Motor', websiteUrl: 'https://www.mgmotor.es', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.es/ofertas'] },
  { name: 'Honda', websiteUrl: 'https://www.honda.es', categorySlug: 'otomobil', seedUrls: ['https://www.honda.es/cars/ofertas.html'] },
  { name: 'Suzuki', websiteUrl: 'https://www.suzuki.es', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.es/automoviles/ofertas'] },
  { name: 'Mitsubishi', websiteUrl: 'https://www.mitsubishi-motors.es', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.es/ofertas'] },
  { name: 'Norauto', websiteUrl: 'https://www.norauto.es', categorySlug: 'otomobil', seedUrls: ['https://www.norauto.es/ofertas/', 'https://www.norauto.es/promociones/'] },
  { name: 'Midas', websiteUrl: 'https://www.midas.es', categorySlug: 'otomobil', seedUrls: ['https://www.midas.es/ofertas', 'https://www.midas.es/promociones'] },
  { name: 'Feu Vert', websiteUrl: 'https://www.feuvert.es', categorySlug: 'otomobil', seedUrls: ['https://www.feuvert.es/ofertas'] },
  { name: 'Coches.net', websiteUrl: 'https://www.coches.net', categorySlug: 'otomobil', seedUrls: ['https://www.coches.net/ofertas/'] },
  { name: 'AutoScout24', websiteUrl: 'https://www.autoscout24.es', categorySlug: 'otomobil', seedUrls: ['https://www.autoscout24.es/ofertas/'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Casa del Libro', websiteUrl: 'https://www.casadellibro.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.casadellibro.com/ofertas', 'https://www.casadellibro.com/promociones'] },
  { name: 'Amazon Libros', websiteUrl: 'https://www.amazon.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.es/gp/bestsellers/books'] },
  { name: 'FNAC Libros', websiteUrl: 'https://www.fnac.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.fnac.es/n710/Libros-mas-vendidos', 'https://www.fnac.es/ofertas-libros'] },
  { name: 'Abacus', websiteUrl: 'https://www.abacus.coop', categorySlug: 'kitap-hobi', seedUrls: ['https://www.abacus.coop/ofertas', 'https://www.abacus.coop/rebajas'] },
  { name: 'Lego', websiteUrl: 'https://www.lego.com/es-es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/es-es/categories/deals', 'https://www.lego.com/es-es/categories/sale'] },
  { name: 'Toys R Us', websiteUrl: 'https://www.toysrus.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.es/ofertas', 'https://www.toysrus.es/rebajas'] },
  { name: 'Juguettos', websiteUrl: 'https://www.juguettos.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.juguettos.com/ofertas', 'https://www.juguettos.com/rebajas'] },
  { name: 'Playmobil', websiteUrl: 'https://www.playmobil.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.playmobil.es/ofertas'] },
  { name: 'Imaginarium', websiteUrl: 'https://www.imaginarium.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.imaginarium.es/ofertas'] },
  { name: 'Game', websiteUrl: 'https://www.game.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.game.es/ofertas', 'https://www.game.es/rebajas'] },
  { name: 'Steam', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/'] },
  { name: 'PlayStation Store', websiteUrl: 'https://store.playstation.com/es-es', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/es-es/category/ofertas/'] },
  { name: 'Xbox Store', websiteUrl: 'https://www.xbox.com/es-ES', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/es-ES/games/deals'] },
  { name: 'Nintendo eShop', websiteUrl: 'https://www.nintendo.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.es/Juegos/Ofertas/Ofertas-de-juegos-de-Nintendo-Switch-1439747.html'] },
  { name: 'Xtralife', websiteUrl: 'https://www.xtralife.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xtralife.com/ofertas'] },
  { name: 'Hobby Consolas', websiteUrl: 'https://www.hobbyconsolas.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbyconsolas.com/reportajes/ofertas'] },
  { name: 'Todocoleccion', websiteUrl: 'https://www.todocoleccion.net', categorySlug: 'kitap-hobi', seedUrls: ['https://www.todocoleccion.net/ofertas'] },
  { name: 'Games Workshop', websiteUrl: 'https://www.games-workshop.com/es-ES', categorySlug: 'kitap-hobi', seedUrls: ['https://www.games-workshop.com/es-ES/New-Exclusive'] },
  { name: 'Zacatrus', websiteUrl: 'https://zacatrus.es', categorySlug: 'kitap-hobi', seedUrls: ['https://zacatrus.es/ofertas', 'https://zacatrus.es/rebajas'] },
  { name: 'Mathom', websiteUrl: 'https://mathom.es', categorySlug: 'kitap-hobi', seedUrls: ['https://mathom.es/ofertas'] },
  { name: 'Juguetronica', websiteUrl: 'https://www.juguetronica.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.juguetronica.com/ofertas'] },
  { name: 'Dideco', websiteUrl: 'https://www.dideco.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dideco.es/ofertas'] },
  { name: 'Nidecora', websiteUrl: 'https://www.nidecora.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nidecora.com/ofertas'] },
  { name: 'Milbby', websiteUrl: 'https://www.milbby.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.milbby.com/ofertas', 'https://www.milbby.com/rebajas'] },
  { name: 'Manualidades', websiteUrl: 'https://www.manualidades.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.manualidades.es/ofertas'] },
  { name: 'Tiendas MGI', websiteUrl: 'https://tiendasmgi.es', categorySlug: 'kitap-hobi', seedUrls: ['https://tiendasmgi.es/ofertas'] },
  { name: 'Kobo ES', websiteUrl: 'https://www.kobo.com/es/es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kobo.com/es/es/p/deals'] },
  { name: 'Audible', websiteUrl: 'https://www.audible.es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.es/ofertas'] },
  { name: 'Kindle', websiteUrl: 'https://www.amazon.es/kindle-dbs/storefront', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.es/gp/bestsellers/digital-text'] },
  { name: 'Norma Comics', websiteUrl: 'https://www.normaeditorial.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.normaeditorial.com/ofertas'] },
];

// ── Deduplicate by slug ─────────────────────────────────
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

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log('=== ES Brand Seeding Script ===\n');
  const allCats = await prisma.category.findMany();
  const categoryMap = new Map<string, string>();
  for (const c of allCats) {
    categoryMap.set(c.slug, c.id);
  }
  console.log(`Categories ready: ${categoryMap.size} found\n`);

  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Total brands: ${uniqueBrands.length} (${BRANDS.length - uniqueBrands.length} duplicates skipped)\n`);

  let brandsOk = 0;
  let sourcesCreated = 0;
  let sourcesUpdated = 0;
  let errors = 0;
  const missingCategories = new Set<string>();

  for (const entry of uniqueBrands) {
    const slug = toSlug(entry.name);
    const categoryId = categoryMap.get(entry.categorySlug) ?? null;

    if (!categoryId) {
      missingCategories.add(entry.categorySlug);
      console.warn(`  Category not found: ${entry.categorySlug} — skipping ${entry.name}`);
      continue;
    }

    try {
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'ES' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'ES', categoryId },
      });

      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, crawlMethod: CrawlMethod.HTML },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Deals`,
            crawlMethod: CrawlMethod.HTML,
            seedUrls: entry.seedUrls,
            maxDepth: 2,
            schedule: '0 8 * * *',
            agingDays: 7,
            market: 'ES',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'ES' },
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
  console.log(`Brands:            ${brandsOk} OK, ${errors} errors`);
  console.log(`Sources created:   ${sourcesCreated}`);
  console.log(`Sources updated:   ${sourcesUpdated}`);
  if (missingCategories.size > 0) {
    console.log(`Missing categories: ${Array.from(missingCategories).join(', ')}`);
  }

  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'ES' } });
  console.log(`Total active ES sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=ES');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
