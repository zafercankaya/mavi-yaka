import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface BrandEntry {
  name: string;
  websiteUrl: string;
  categorySlug: string;
  seedUrls: string[];
}

const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping (alisveris) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'MercadoLibre', websiteUrl: 'https://www.mercadolibre.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.mercadolibre.com.co/ofertas', 'https://www.mercadolibre.com.co/descuentos'] },
  { name: 'Falabella', websiteUrl: 'https://www.falabella.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.falabella.com.co/falabella-co/collection/ofertas', 'https://www.falabella.com.co/falabella-co/collection/promociones'] },
  { name: 'Éxito', websiteUrl: 'https://www.exito.com', categorySlug: 'alisveris', seedUrls: ['https://www.exito.com/ofertas', 'https://www.exito.com/promociones'] },
  { name: 'Linio', websiteUrl: 'https://www.linio.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.linio.com.co/ofertas', 'https://www.linio.com.co/promociones'] },
  { name: 'Alkosto', websiteUrl: 'https://www.alkosto.com', categorySlug: 'alisveris', seedUrls: ['https://www.alkosto.com/ofertas', 'https://www.alkosto.com/promociones'] },
  { name: 'Ktronix', websiteUrl: 'https://www.ktronix.com', categorySlug: 'alisveris', seedUrls: ['https://www.ktronix.com/ofertas', 'https://www.ktronix.com/promociones'] },
  { name: 'Homecenter', websiteUrl: 'https://www.homecenter.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.homecenter.com.co/homecenter-co/content/ofertas', 'https://www.homecenter.com.co/homecenter-co/content/promociones'] },
  { name: 'Olímpica', websiteUrl: 'https://www.olimpica.com', categorySlug: 'alisveris', seedUrls: ['https://www.olimpica.com/ofertas', 'https://www.olimpica.com/promociones'] },
  { name: 'Jumbo', websiteUrl: 'https://www.tiendasjumbo.co', categorySlug: 'alisveris', seedUrls: ['https://www.tiendasjumbo.co/ofertas', 'https://www.tiendasjumbo.co/promociones'] },
  { name: 'Cencosud', websiteUrl: 'https://www.cencosud.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.cencosud.com.co/ofertas'] },
  { name: 'Rappi Mall', websiteUrl: 'https://www.rappi.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.rappi.com.co/promociones', 'https://www.rappi.com.co/ofertas'] },
  { name: 'Dafiti', websiteUrl: 'https://www.dafiti.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.dafiti.com.co/ofertas', 'https://www.dafiti.com.co/descuentos'] },
  { name: 'Tiendas Metro', websiteUrl: 'https://www.tiendasmetro.co', categorySlug: 'alisveris', seedUrls: ['https://www.tiendasmetro.co/ofertas', 'https://www.tiendasmetro.co/promociones'] },
  { name: 'Panamericana', websiteUrl: 'https://www.panamericana.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.panamericana.com.co/ofertas', 'https://www.panamericana.com.co/promociones'] },
  { name: 'AliExpress CO', websiteUrl: 'https://es.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://es.aliexpress.com/wholesale', 'https://sale.aliexpress.com/__pc/sale.htm'] },
  { name: 'Flamingo', websiteUrl: 'https://www.flamingo.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.flamingo.com.co/ofertas', 'https://www.flamingo.com.co/promociones'] },
  { name: 'Coppel', websiteUrl: 'https://www.coppel.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.coppel.com.co/ofertas', 'https://www.coppel.com.co/promociones'] },
  { name: 'Tiendamia', websiteUrl: 'https://tiendamia.com/co', categorySlug: 'alisveris', seedUrls: ['https://tiendamia.com/co/ofertas'] },
  { name: 'Mercado Shops', websiteUrl: 'https://www.mercadoshops.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.mercadoshops.com.co/'] },
  { name: 'La 14', websiteUrl: 'https://www.la14.com', categorySlug: 'alisveris', seedUrls: ['https://www.la14.com/ofertas', 'https://www.la14.com/promociones'] },
  { name: 'Pepe Ganga', websiteUrl: 'https://www.pepeganga.com', categorySlug: 'alisveris', seedUrls: ['https://www.pepeganga.com/ofertas', 'https://www.pepeganga.com/promociones'] },
  { name: 'Makro', websiteUrl: 'https://www.makro.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.makro.com.co/ofertas', 'https://www.makro.com.co/promociones'] },
  { name: 'Cuponatic', websiteUrl: 'https://www.cuponatic.com/co', categorySlug: 'alisveris', seedUrls: ['https://www.cuponatic.com/co/ofertas'] },
  { name: 'Groupon CO', websiteUrl: 'https://www.groupon.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.groupon.com.co/descuentos'] },
  { name: 'Jamar', websiteUrl: 'https://www.jamar.com', categorySlug: 'alisveris', seedUrls: ['https://www.jamar.com/ofertas', 'https://www.jamar.com/promociones'] },
  { name: 'Tugó', websiteUrl: 'https://www.tugo.co', categorySlug: 'alisveris', seedUrls: ['https://www.tugo.co/ofertas', 'https://www.tugo.co/outlet'] },
  { name: 'Henkel', websiteUrl: 'https://www.henkel.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.henkel.com.co/ofertas'] },
  { name: 'Abcdin', websiteUrl: 'https://www.abcdin.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.abcdin.com.co/ofertas'] },
  { name: 'Multimax', websiteUrl: 'https://www.multimax.co', categorySlug: 'alisveris', seedUrls: ['https://www.multimax.co/ofertas', 'https://www.multimax.co/promociones'] },
  { name: 'Lulo Bank Shop', websiteUrl: 'https://www.lulobank.com', categorySlug: 'alisveris', seedUrls: ['https://www.lulobank.com/ofertas'] },
  { name: 'Spring Step', websiteUrl: 'https://www.springstep.com.co', categorySlug: 'alisveris', seedUrls: ['https://www.springstep.com.co/sale', 'https://www.springstep.com.co/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung', websiteUrl: 'https://www.samsung.com/co', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/co/offer/', 'https://www.samsung.com/co/smartphones/all-smartphones/'] },
  { name: 'Apple', websiteUrl: 'https://www.apple.com/co', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/co/shop/go/special_deals'] },
  { name: 'LG', websiteUrl: 'https://www.lg.com/co', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/co/promociones'] },
  { name: 'Sony', websiteUrl: 'https://store.sony.com.co', categorySlug: 'elektronik', seedUrls: ['https://store.sony.com.co/ofertas', 'https://store.sony.com.co/promociones'] },
  { name: 'Huawei', websiteUrl: 'https://consumer.huawei.com/co', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/co/offer/'] },
  { name: 'Xiaomi', websiteUrl: 'https://www.mi.com/co', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/co/sale'] },
  { name: 'Motorola', websiteUrl: 'https://www.motorola.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.com.co/ofertas', 'https://www.motorola.com.co/promociones'] },
  { name: 'Claro', websiteUrl: 'https://www.claro.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.claro.com.co/personas/ofertas', 'https://www.claro.com.co/personas/promociones'] },
  { name: 'Movistar', websiteUrl: 'https://www.movistar.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.movistar.com.co/promociones', 'https://www.movistar.com.co/ofertas'] },
  { name: 'Tigo', websiteUrl: 'https://www.tigo.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.tigo.com.co/promociones', 'https://www.tigo.com.co/ofertas'] },
  { name: 'WOM', websiteUrl: 'https://www.wom.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.wom.com.co/promociones', 'https://www.wom.com.co/ofertas'] },
  { name: 'ETB', websiteUrl: 'https://www.etb.com', categorySlug: 'elektronik', seedUrls: ['https://www.etb.com/ofertas', 'https://www.etb.com/promociones'] },
  { name: 'HP', websiteUrl: 'https://www.hp.com/co-es', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/co-es/shop/ofertas'] },
  { name: 'Lenovo', websiteUrl: 'https://www.lenovo.com/co/es', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/co/es/d/deals/'] },
  { name: 'Dell', websiteUrl: 'https://www.dell.com/es-co', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/es-co/shop/deals'] },
  { name: 'Asus', websiteUrl: 'https://www.asus.com/co', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/co/campaign/'] },
  { name: 'Logitech', websiteUrl: 'https://www.logitech.com/es-co', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/es-co/promo.html'] },
  { name: 'Canon', websiteUrl: 'https://www.canon.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.canon.com.co/promociones'] },
  { name: 'Epson', websiteUrl: 'https://www.epson.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.epson.com.co/promociones'] },
  { name: 'Philips', websiteUrl: 'https://www.philips.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.philips.com.co/c-e/ofertas'] },
  { name: 'JBL', websiteUrl: 'https://co.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://co.jbl.com/ofertas'] },
  { name: 'Bose', websiteUrl: 'https://www.bose.co', categorySlug: 'elektronik', seedUrls: ['https://www.bose.co/ofertas'] },
  { name: 'TCL', websiteUrl: 'https://www.tcl.com/co', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/co/es/promotions'] },
  { name: 'Hisense', websiteUrl: 'https://www.hisense-colombia.com', categorySlug: 'elektronik', seedUrls: ['https://www.hisense-colombia.com/promociones'] },
  { name: 'Whirlpool', websiteUrl: 'https://www.whirlpool.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.whirlpool.com.co/promociones'] },
  { name: 'Electrolux', websiteUrl: 'https://www.electrolux.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.electrolux.com.co/promociones'] },
  { name: 'Mabe', websiteUrl: 'https://www.mabe.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.mabe.com.co/promociones', 'https://www.mabe.com.co/ofertas'] },
  { name: 'Challenger', websiteUrl: 'https://www.challenger.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.challenger.com.co/ofertas', 'https://www.challenger.com.co/promociones'] },
  { name: 'Kalley', websiteUrl: 'https://www.kalley.com.co', categorySlug: 'elektronik', seedUrls: ['https://www.kalley.com.co/ofertas', 'https://www.kalley.com.co/promociones'] },
  { name: 'DirecTV', websiteUrl: 'https://www.directvgo.com/co', categorySlug: 'elektronik', seedUrls: ['https://www.directvgo.com/co/ofertas'] },
  { name: 'GoPro', websiteUrl: 'https://gopro.com/es/co', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/es/co/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Arturo Calle', websiteUrl: 'https://www.arturocalle.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.arturocalle.com/sale', 'https://www.arturocalle.com/ofertas'] },
  { name: 'Studio F', websiteUrl: 'https://www.studiof.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.studiof.com.co/sale', 'https://www.studiof.com.co/ofertas'] },
  { name: 'Tennis', websiteUrl: 'https://www.tennis.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.tennis.com.co/sale', 'https://www.tennis.com.co/ofertas'] },
  { name: 'Offcorss', websiteUrl: 'https://www.offcorss.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.offcorss.com/sale', 'https://www.offcorss.com/ofertas'] },
  { name: 'GEF', websiteUrl: 'https://www.gef.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.gef.com.co/sale', 'https://www.gef.com.co/ofertas'] },
  { name: 'Totto', websiteUrl: 'https://www.totto.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.totto.com/sale', 'https://www.totto.com/ofertas'] },
  { name: 'Vélez', websiteUrl: 'https://www.velez.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.velez.com.co/sale', 'https://www.velez.com.co/ofertas'] },
  { name: 'Mario Hernández', websiteUrl: 'https://www.mariohernandez.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.mariohernandez.com/sale', 'https://www.mariohernandez.com/ofertas'] },
  { name: 'Bosi', websiteUrl: 'https://www.bfranco.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.bfranco.com/sale', 'https://www.bfranco.com/ofertas'] },
  { name: 'Zara', websiteUrl: 'https://www.zara.com/co', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/co/es/rebajas-l1702.html'] },
  { name: 'H&M', websiteUrl: 'https://www2.hm.com/es_co', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/es_co/ofertas.html', 'https://www2.hm.com/es_co/rebajas.html'] },
  { name: 'Pull&Bear', websiteUrl: 'https://www.pullandbear.com/co', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/co/rebajas-n6485.html'] },
  { name: 'Bershka', websiteUrl: 'https://www.bershka.com/co', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/co/rebajas-c1010378091.html'] },
  { name: 'Stradivarius', websiteUrl: 'https://www.stradivarius.com/co', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/co/rebajas-c1020130530.html'] },
  { name: 'Mango', websiteUrl: 'https://shop.mango.com/co', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/co/rebajas'] },
  { name: 'Pat Primo', websiteUrl: 'https://www.patprimo.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.patprimo.com/sale', 'https://www.patprimo.com/ofertas'] },
  { name: 'Punto Blanco', websiteUrl: 'https://www.puntoblanco.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.puntoblanco.com/sale', 'https://www.puntoblanco.com/ofertas'] },
  { name: 'Koaj', websiteUrl: 'https://www.koaj.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.koaj.co/sale', 'https://www.koaj.co/ofertas'] },
  { name: 'Americanino', websiteUrl: 'https://www.americanino.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.americanino.com.co/sale', 'https://www.americanino.com.co/ofertas'] },
  { name: 'Chevignon', websiteUrl: 'https://www.chevignon.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.chevignon.com.co/sale', 'https://www.chevignon.com.co/ofertas'] },
  { name: 'Naf Naf', websiteUrl: 'https://www.nafnaf.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.nafnaf.com.co/sale', 'https://www.nafnaf.com.co/ofertas'] },
  { name: 'Pronto', websiteUrl: 'https://www.pronto.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.pronto.com.co/sale', 'https://www.pronto.com.co/ofertas'] },
  { name: 'Ela', websiteUrl: 'https://www.ela.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.ela.com.co/sale', 'https://www.ela.com.co/ofertas'] },
  { name: 'Levi\'s', websiteUrl: 'https://www.levi.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com.co/sale', 'https://www.levi.com.co/ofertas'] },
  { name: 'Guess', websiteUrl: 'https://www.guess.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.com.co/sale'] },
  { name: 'Tommy Hilfiger', websiteUrl: 'https://co.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://co.tommy.com/sale'] },
  { name: 'Calvin Klein', websiteUrl: 'https://www.calvinklein.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.com.co/sale'] },
  { name: 'Diesel', websiteUrl: 'https://www.diesel.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.diesel.com.co/sale'] },
  { name: 'Rosario Shoes', websiteUrl: 'https://www.rosarioshoes.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.rosarioshoes.com/sale', 'https://www.rosarioshoes.com/ofertas'] },
  { name: 'Baby Fresh', websiteUrl: 'https://www.babyfresh.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.babyfresh.com/sale', 'https://www.babyfresh.com/ofertas'] },
  { name: 'Bronzini', websiteUrl: 'https://www.bronzini.com.co', categorySlug: 'giyim-moda', seedUrls: ['https://www.bronzini.com.co/sale', 'https://www.bronzini.com.co/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Éxito Market', websiteUrl: 'https://www.exito.com', categorySlug: 'gida-market', seedUrls: ['https://www.exito.com/mercado/ofertas', 'https://www.exito.com/mercado/promociones'] },
  { name: 'Carulla', websiteUrl: 'https://www.carulla.com', categorySlug: 'gida-market', seedUrls: ['https://www.carulla.com/ofertas', 'https://www.carulla.com/promociones'] },
  { name: 'Olímpica Market', websiteUrl: 'https://www.olimpica.com', categorySlug: 'gida-market', seedUrls: ['https://www.olimpica.com/supermercado/ofertas', 'https://www.olimpica.com/supermercado/promociones'] },
  { name: 'D1', websiteUrl: 'https://www.d1.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.d1.com.co/ofertas', 'https://www.d1.com.co/promociones'] },
  { name: 'Ara', websiteUrl: 'https://www.aratiendas.com', categorySlug: 'gida-market', seedUrls: ['https://www.aratiendas.com/ofertas', 'https://www.aratiendas.com/promociones'] },
  { name: 'Justo & Bueno', websiteUrl: 'https://www.justoybueno.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.justoybueno.com.co/ofertas'] },
  { name: 'Jumbo Market', websiteUrl: 'https://www.tiendasjumbo.co', categorySlug: 'gida-market', seedUrls: ['https://www.tiendasjumbo.co/supermercado/ofertas', 'https://www.tiendasjumbo.co/supermercado/promociones'] },
  { name: 'Metro Market', websiteUrl: 'https://www.tiendasmetro.co', categorySlug: 'gida-market', seedUrls: ['https://www.tiendasmetro.co/supermercado/ofertas'] },
  { name: 'Makro Market', websiteUrl: 'https://www.makro.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.makro.com.co/alimentos/ofertas'] },
  { name: 'PriceSmart', websiteUrl: 'https://www.pricesmart.com', categorySlug: 'gida-market', seedUrls: ['https://www.pricesmart.com/es-co/ofertas'] },
  { name: 'Alkosto Market', websiteUrl: 'https://www.alkosto.com', categorySlug: 'gida-market', seedUrls: ['https://www.alkosto.com/mercado/ofertas'] },
  { name: 'La Vaquita', websiteUrl: 'https://www.lavaquita.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.lavaquita.com.co/ofertas'] },
  { name: 'Surtimax', websiteUrl: 'https://www.surtimax.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.surtimax.com.co/ofertas'] },
  { name: 'Super Inter', websiteUrl: 'https://www.superinter.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.superinter.com.co/ofertas'] },
  { name: 'Colsubsidio', websiteUrl: 'https://www.colsubsidio.com', categorySlug: 'gida-market', seedUrls: ['https://www.colsubsidio.com/supermercado/ofertas', 'https://www.colsubsidio.com/supermercado/promociones'] },
  { name: 'Alpina', websiteUrl: 'https://www.alpina.com', categorySlug: 'gida-market', seedUrls: ['https://www.alpina.com/promociones'] },
  { name: 'Alquería', websiteUrl: 'https://www.alqueria.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.alqueria.com.co/promociones'] },
  { name: 'Nutresa', websiteUrl: 'https://www.gruponutresa.com', categorySlug: 'gida-market', seedUrls: ['https://www.gruponutresa.com/promociones'] },
  { name: 'Zenú', websiteUrl: 'https://www.zenu.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.zenu.com.co/promociones'] },
  { name: 'Colombina', websiteUrl: 'https://www.colombina.com', categorySlug: 'gida-market', seedUrls: ['https://www.colombina.com/promociones'] },
  { name: 'Nestlé', websiteUrl: 'https://www.nestle.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.nestle.com.co/promociones'] },
  { name: 'Coca-Cola', websiteUrl: 'https://www.coca-cola.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.coca-cola.com.co/promociones'] },
  { name: 'Bavaria', websiteUrl: 'https://www.bavaria.co', categorySlug: 'gida-market', seedUrls: ['https://www.bavaria.co/promociones'] },
  { name: 'Postobón', websiteUrl: 'https://www.postobon.com', categorySlug: 'gida-market', seedUrls: ['https://www.postobon.com/promociones'] },
  { name: 'Merqueo', websiteUrl: 'https://www.merqueo.com', categorySlug: 'gida-market', seedUrls: ['https://www.merqueo.com/ofertas', 'https://www.merqueo.com/promociones'] },
  { name: 'Frubana', websiteUrl: 'https://www.frubana.com', categorySlug: 'gida-market', seedUrls: ['https://www.frubana.com/ofertas'] },
  { name: 'Catessen', websiteUrl: 'https://www.catessen.com', categorySlug: 'gida-market', seedUrls: ['https://www.catessen.com/ofertas'] },
  { name: 'La Recetta', websiteUrl: 'https://www.larecetta.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.larecetta.com.co/ofertas'] },
  { name: 'Dislicores', websiteUrl: 'https://www.dislicores.com', categorySlug: 'gida-market', seedUrls: ['https://www.dislicores.com/ofertas', 'https://www.dislicores.com/promociones'] },
  { name: 'Club Colombia', websiteUrl: 'https://www.clubcolombia.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.clubcolombia.com.co/promociones'] },
  { name: 'Ramo', websiteUrl: 'https://www.ramo.com.co', categorySlug: 'gida-market', seedUrls: ['https://www.ramo.com.co/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food Delivery (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Rappi', websiteUrl: 'https://www.rappi.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.rappi.com.co/restaurantes/ofertas', 'https://www.rappi.com.co/restaurantes/promociones'] },
  { name: 'iFood', websiteUrl: 'https://www.ifood.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.ifood.com.co/promociones'] },
  { name: 'Domicilios.com', websiteUrl: 'https://www.domicilios.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.domicilios.com/promociones', 'https://www.domicilios.com/ofertas'] },
  { name: 'Uber Eats', websiteUrl: 'https://www.ubereats.com/co', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/co/feed?pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMkJvZ290YSUyMiU3RA%3D%3D'] },
  { name: 'Didi Food', websiteUrl: 'https://www.didi-food.com/es-CO', categorySlug: 'yeme-icme', seedUrls: ['https://www.didi-food.com/es-CO/promociones'] },
  { name: 'McDonald\'s', websiteUrl: 'https://www.mcdonalds.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com.co/promociones', 'https://www.mcdonalds.com.co/ofertas'] },
  { name: 'Burger King', websiteUrl: 'https://www.burgerking.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.co/promociones', 'https://www.burgerking.com.co/ofertas'] },
  { name: 'Crepes & Waffles', websiteUrl: 'https://www.crepesywaffles.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.crepesywaffles.com/promociones'] },
  { name: 'Juan Valdez', websiteUrl: 'https://www.juanvaldezcafe.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.juanvaldezcafe.com/es-CO/promociones', 'https://www.juanvaldezcafe.com/es-CO/ofertas'] },
  { name: 'El Corral', websiteUrl: 'https://www.elcorral.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.elcorral.com/promociones', 'https://www.elcorral.com/ofertas'] },
  { name: 'Frisby', websiteUrl: 'https://www.frisby.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.frisby.com.co/promociones', 'https://www.frisby.com.co/ofertas'] },
  { name: 'Subway', websiteUrl: 'https://www.subway.com/es-CO', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/es-CO/promociones'] },
  { name: 'KFC', websiteUrl: 'https://www.kfc.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.com.co/promociones', 'https://www.kfc.com.co/ofertas'] },
  { name: 'Domino\'s Pizza', websiteUrl: 'https://www.dominos.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.co/promociones', 'https://www.dominos.com.co/ofertas'] },
  { name: 'Pizza Hut', websiteUrl: 'https://www.pizzahut.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.co/promociones'] },
  { name: 'Starbucks', websiteUrl: 'https://www.starbucks.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.co/promociones'] },
  { name: 'Oma', websiteUrl: 'https://www.oma.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.oma.com.co/promociones'] },
  { name: 'Tostao', websiteUrl: 'https://www.tostao.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.tostao.com/promociones'] },
  { name: 'Wok', websiteUrl: 'https://www.wok.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.wok.com.co/promociones'] },
  { name: 'Archie\'s', websiteUrl: 'https://www.archies.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.archies.com.co/promociones', 'https://www.archies.com.co/ofertas'] },
  { name: 'Jeno\'s Pizza', websiteUrl: 'https://www.jenospizza.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.jenospizza.com/promociones'] },
  { name: 'Presto', websiteUrl: 'https://www.presto.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.presto.com.co/promociones', 'https://www.presto.com.co/ofertas'] },
  { name: 'Kokoriko', websiteUrl: 'https://www.kokoriko.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.kokoriko.com.co/promociones'] },
  { name: 'PPC', websiteUrl: 'https://www.ppc.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.ppc.com.co/promociones'] },
  { name: 'Popsy', websiteUrl: 'https://www.popsy.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.popsy.co/promociones'] },
  { name: 'Mimo\'s', websiteUrl: 'https://www.mimos.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.mimos.com.co/promociones'] },
  { name: 'Dunkin\' Donuts', websiteUrl: 'https://www.dunkindonuts.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.com.co/promociones'] },
  { name: 'Papa John\'s', websiteUrl: 'https://www.papajohns.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.com.co/promociones', 'https://www.papajohns.com.co/ofertas'] },
  { name: 'Wendy\'s', websiteUrl: 'https://www.wendys.com.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.wendys.com.co/promociones'] },
  { name: 'La Hamburguesería', websiteUrl: 'https://www.lahamburgueseria.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.lahamburgueseria.co/promociones'] },
  { name: 'Andrés Carne de Res', websiteUrl: 'https://www.andrescarnederes.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.andrescarnederes.com/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Natura', websiteUrl: 'https://www.natura.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.natura.com.co/promociones', 'https://www.natura.com.co/ofertas'] },
  { name: 'Belcorp', websiteUrl: 'https://www.belcorp.biz', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.belcorp.biz/promociones'] },
  { name: 'Yanbal', websiteUrl: 'https://www.yanbal.com/co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yanbal.com/co/promociones', 'https://www.yanbal.com/co/ofertas'] },
  { name: 'L\'Bel', websiteUrl: 'https://www.lbel.com/co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lbel.com/co/promociones', 'https://www.lbel.com/co/ofertas'] },
  { name: 'Ésika', websiteUrl: 'https://www.esika.com/co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esika.com/co/promociones', 'https://www.esika.com/co/ofertas'] },
  { name: 'Cyzone', websiteUrl: 'https://www.cyzone.com/co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cyzone.com/co/promociones', 'https://www.cyzone.com/co/ofertas'] },
  { name: 'Avon', websiteUrl: 'https://www.avon.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avon.com.co/promociones', 'https://www.avon.com.co/ofertas'] },
  { name: 'MAC Cosmetics', websiteUrl: 'https://www.maccosmetics.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.co/ofertas'] },
  { name: 'Bath & Body Works', websiteUrl: 'https://www.bathandbodyworks.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.com.co/promociones', 'https://www.bathandbodyworks.com.co/ofertas'] },
  { name: 'Fedco', websiteUrl: 'https://www.fedco.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.fedco.com.co/ofertas', 'https://www.fedco.com.co/promociones'] },
  { name: 'Farmatodo', websiteUrl: 'https://www.farmatodo.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmatodo.com.co/ofertas', 'https://www.farmatodo.com.co/promociones'] },
  { name: 'Droguería La Rebaja', websiteUrl: 'https://www.larebajavirtual.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.larebajavirtual.com/ofertas', 'https://www.larebajavirtual.com/promociones'] },
  { name: 'Cruz Verde', websiteUrl: 'https://www.cruzverde.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cruzverde.com.co/ofertas', 'https://www.cruzverde.com.co/promociones'] },
  { name: 'Locatel', websiteUrl: 'https://www.locatelcolombia.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.locatelcolombia.com/ofertas', 'https://www.locatelcolombia.com/promociones'] },
  { name: 'L\'Oréal', websiteUrl: 'https://www.loreal-paris.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.co/promociones'] },
  { name: 'Garnier', websiteUrl: 'https://www.garnier.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.com.co/promociones'] },
  { name: 'Nivea', websiteUrl: 'https://www.nivea.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.com.co/promociones'] },
  { name: 'Dove', websiteUrl: 'https://www.dove.com/co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/co/promociones.html'] },
  { name: 'Rexona', websiteUrl: 'https://www.rexona.com/co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rexona.com/co/promociones'] },
  { name: 'Head & Shoulders', websiteUrl: 'https://www.headandshoulders.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.headandshoulders.com.co/promociones'] },
  { name: 'Gillette', websiteUrl: 'https://www.gillette.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.gillette.com.co/promociones'] },
  { name: 'Oral-B', websiteUrl: 'https://www.oral-b.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.oral-b.com.co/promociones'] },
  { name: 'Jolie de Vogue', websiteUrl: 'https://www.joliedevogue.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.joliedevogue.com/ofertas', 'https://www.joliedevogue.com/promociones'] },
  { name: 'Vogue', websiteUrl: 'https://www.vogue.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vogue.com.co/ofertas'] },
  { name: 'Recamier', websiteUrl: 'https://www.recamier.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.recamier.com.co/promociones'] },
  { name: 'Prebel', websiteUrl: 'https://www.prebel.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.prebel.com/promociones'] },
  { name: 'The Body Shop', websiteUrl: 'https://www.thebodyshop.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com.co/ofertas', 'https://www.thebodyshop.com.co/promociones'] },
  { name: 'Victoria\'s Secret', websiteUrl: 'https://www.victoriassecret.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.victoriassecret.com.co/sale'] },
  { name: 'Sephora', websiteUrl: 'https://www.sephora.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.com.co/ofertas', 'https://www.sephora.com.co/promociones'] },
  { name: 'Wella', websiteUrl: 'https://www.wella.com/es-CO', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.wella.com/es-CO/promociones'] },
  { name: 'Henkel Beauty', websiteUrl: 'https://www.schwarzkopf.com.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.schwarzkopf.com.co/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Homecenter Sodimac', websiteUrl: 'https://www.homecenter.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.homecenter.com.co/homecenter-co/content/ofertas', 'https://www.homecenter.com.co/homecenter-co/content/promociones'] },
  { name: 'Easy', websiteUrl: 'https://www.easy.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.easy.com.co/ofertas', 'https://www.easy.com.co/promociones'] },
  { name: 'IKEA', websiteUrl: 'https://www.ikea.com/co/es', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/co/es/offers/', 'https://www.ikea.com/co/es/campaigns/'] },
  { name: 'Tugó Home', websiteUrl: 'https://www.tugo.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.tugo.co/ofertas', 'https://www.tugo.co/outlet'] },
  { name: 'Jamar Home', websiteUrl: 'https://www.jamar.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.jamar.com/ofertas', 'https://www.jamar.com/promociones'] },
  { name: 'Spring Home', websiteUrl: 'https://www.spring.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.spring.com.co/ofertas'] },
  { name: 'Muebles RTA', websiteUrl: 'https://www.mueblesrta.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.mueblesrta.com/ofertas', 'https://www.mueblesrta.com/promociones'] },
  { name: 'Corona', websiteUrl: 'https://www.corona.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.corona.co/ofertas', 'https://www.corona.co/promociones'] },
  { name: 'Pintuco', websiteUrl: 'https://www.pintuco.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.pintuco.com.co/promociones'] },
  { name: 'Grival', websiteUrl: 'https://www.grival.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.grival.com/promociones'] },
  { name: 'San Alejo', websiteUrl: 'https://www.sanalejo.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.sanalejo.com.co/ofertas'] },
  { name: 'Home Sentry', websiteUrl: 'https://www.homesentry.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.homesentry.co/ofertas', 'https://www.homesentry.co/promociones'] },
  { name: 'Rimax', websiteUrl: 'https://www.rimax.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.rimax.com.co/ofertas', 'https://www.rimax.com.co/promociones'] },
  { name: 'Estra', websiteUrl: 'https://www.estra.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.estra.com/ofertas'] },
  { name: 'Haceb', websiteUrl: 'https://www.haceb.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.haceb.com/ofertas', 'https://www.haceb.com/promociones'] },
  { name: 'Imusa', websiteUrl: 'https://www.imusa.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.imusa.com.co/ofertas', 'https://www.imusa.com.co/promociones'] },
  { name: 'Totto Home', websiteUrl: 'https://www.totto.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.totto.com/hogar/ofertas'] },
  { name: 'Arredo', websiteUrl: 'https://www.arredo.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.arredo.com.co/ofertas', 'https://www.arredo.com.co/promociones'] },
  { name: 'Colchones Spring', websiteUrl: 'https://www.colchonesspring.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.colchonesspring.com.co/ofertas', 'https://www.colchonesspring.com.co/promociones'] },
  { name: 'Colchones Paraíso', websiteUrl: 'https://www.colchonesparaiso.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.colchonesparaiso.com.co/ofertas'] },
  { name: 'Celta', websiteUrl: 'https://www.celta.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.celta.com.co/ofertas', 'https://www.celta.com.co/promociones'] },
  { name: 'Cali Electric', websiteUrl: 'https://www.calielectric.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.calielectric.com/ofertas'] },
  { name: 'Constructor', websiteUrl: 'https://www.constructor.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.constructor.com.co/ofertas', 'https://www.constructor.com.co/promociones'] },
  { name: 'Ferretería La Roca', websiteUrl: 'https://www.ferreteriallaroca.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ferreteriallaroca.com/ofertas'] },
  { name: 'Pepe Sierra', websiteUrl: 'https://www.pepesierra.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.pepesierra.com/ofertas'] },
  { name: 'Gerfor', websiteUrl: 'https://www.gerfor.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.gerfor.com/promociones'] },
  { name: 'Pavco', websiteUrl: 'https://www.pavco.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.pavco.com.co/promociones'] },
  { name: 'Eternit', websiteUrl: 'https://www.eternit.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.eternit.com.co/promociones'] },
  { name: 'Muebles Fantásticos', websiteUrl: 'https://www.mueblesfantasticos.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.mueblesfantasticos.com/ofertas'] },
  { name: 'Recubre', websiteUrl: 'https://www.recubre.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.recubre.com/ofertas'] },
  { name: 'Abrakadabra', websiteUrl: 'https://www.abrakadabra.com.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.abrakadabra.com.co/ofertas', 'https://www.abrakadabra.com.co/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor (spor-outdoor) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nike', websiteUrl: 'https://www.nike.com/co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/co/w/sale', 'https://www.nike.com/co/w/ofertas'] },
  { name: 'Adidas', websiteUrl: 'https://www.adidas.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.co/sale', 'https://www.adidas.co/outlet'] },
  { name: 'Puma', websiteUrl: 'https://co.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://co.puma.com/sale.html', 'https://co.puma.com/ofertas.html'] },
  { name: 'Reebok', websiteUrl: 'https://www.reebok.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com.co/sale', 'https://www.reebok.com.co/outlet'] },
  { name: 'Under Armour', websiteUrl: 'https://www.underarmour.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.co/sale', 'https://www.underarmour.com.co/outlet'] },
  { name: 'Decathlon', websiteUrl: 'https://www.decathlon.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.com.co/ofertas', 'https://www.decathlon.com.co/promociones'] },
  { name: 'Totto Sport', websiteUrl: 'https://www.totto.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.totto.com/deportes/ofertas', 'https://www.totto.com/deportes/sale'] },
  { name: 'New Balance', websiteUrl: 'https://www.newbalance.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.co/sale'] },
  { name: 'Converse', websiteUrl: 'https://www.converse.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com.co/sale'] },
  { name: 'Vans', websiteUrl: 'https://www.vans.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.com.co/sale'] },
  { name: 'Skechers', websiteUrl: 'https://www.skechers.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.co/sale', 'https://www.skechers.com.co/ofertas'] },
  { name: 'Asics', websiteUrl: 'https://www.asics.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com.co/sale'] },
  { name: 'Fila', websiteUrl: 'https://www.fila.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.com.co/sale', 'https://www.fila.com.co/outlet'] },
  { name: 'The North Face', websiteUrl: 'https://www.thenorthface.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.co/sale'] },
  { name: 'Columbia Sportswear', websiteUrl: 'https://www.columbia.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.com.co/sale', 'https://www.columbia.com.co/ofertas'] },
  { name: 'Timberland', websiteUrl: 'https://www.timberland.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.com.co/sale'] },
  { name: 'Crocs', websiteUrl: 'https://www.crocs.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.crocs.com.co/sale', 'https://www.crocs.com.co/ofertas'] },
  { name: 'GEF Sport', websiteUrl: 'https://www.gef.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gef.com.co/deportes/ofertas'] },
  { name: 'Sportline', websiteUrl: 'https://www.sportline.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportline.com.co/ofertas', 'https://www.sportline.com.co/promociones'] },
  { name: 'Bicicletas Clásicas', websiteUrl: 'https://www.bicicletasclasicas.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bicicletasclasicas.com.co/ofertas'] },
  { name: 'Trek Colombia', websiteUrl: 'https://www.trekbikes.com/co/es_CO', categorySlug: 'spor-outdoor', seedUrls: ['https://www.trekbikes.com/co/es_CO/sale/'] },
  { name: 'Specialized', websiteUrl: 'https://www.specialized.com/co/es', categorySlug: 'spor-outdoor', seedUrls: ['https://www.specialized.com/co/es/sale'] },
  { name: 'Bodytech', websiteUrl: 'https://www.bodytech.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bodytech.com.co/promociones', 'https://www.bodytech.com.co/ofertas'] },
  { name: 'Smart Fit', websiteUrl: 'https://www.smartfit.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.smartfit.com.co/promociones'] },
  { name: 'GNC', websiteUrl: 'https://www.gnc.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gnc.com.co/ofertas', 'https://www.gnc.com.co/promociones'] },
  { name: 'Lacoste', websiteUrl: 'https://www.lacoste.com/co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lacoste.com/co/sale.html'] },
  { name: 'Speedo', websiteUrl: 'https://www.speedo.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.speedo.com.co/sale'] },
  { name: 'Arena', websiteUrl: 'https://www.arenasport.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.arenasport.com.co/ofertas'] },
  { name: 'Oakley', websiteUrl: 'https://www.oakley.com/co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.oakley.com/co/sale'] },
  { name: 'CAT Colombia', websiteUrl: 'https://www.catfootwear.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.catfootwear.com.co/sale'] },
  { name: 'Merrell', websiteUrl: 'https://www.merrell.com.co', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.com.co/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Avianca', websiteUrl: 'https://www.avianca.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avianca.com/co/es/ofertas/', 'https://www.avianca.com/co/es/promociones/'] },
  { name: 'LATAM Airlines', websiteUrl: 'https://www.latamairlines.com/co/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.latamairlines.com/co/es/ofertas', 'https://www.latamairlines.com/co/es/promociones'] },
  { name: 'Viva Air', websiteUrl: 'https://www.vivaair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vivaair.com/co/es/ofertas', 'https://www.vivaair.com/co/es/promociones'] },
  { name: 'Wingo', websiteUrl: 'https://www.wingo.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.wingo.com/es/ofertas', 'https://www.wingo.com/es/promociones'] },
  { name: 'JetSmart', websiteUrl: 'https://jetsmart.com/co/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://jetsmart.com/co/es/ofertas'] },
  { name: 'Copa Airlines', websiteUrl: 'https://www.copaair.com/es-co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.copaair.com/es-co/ofertas/'] },
  { name: 'Despegar', websiteUrl: 'https://www.despegar.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.despegar.com.co/ofertas/', 'https://www.despegar.com.co/promociones/'] },
  { name: 'Booking.com', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.html'] },
  { name: 'Trivago', websiteUrl: 'https://www.trivago.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.com.co/'] },
  { name: 'Kayak', websiteUrl: 'https://www.kayak.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.com.co/ofertas'] },
  { name: 'Skyscanner', websiteUrl: 'https://www.skyscanner.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.com.co/ofertas'] },
  { name: 'Expedia', websiteUrl: 'https://www.expedia.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.co/ofertas', 'https://www.expedia.com.co/promociones'] },
  { name: 'Viajes Éxito', websiteUrl: 'https://www.viajesexito.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.viajesexito.com/ofertas', 'https://www.viajesexito.com/promociones'] },
  { name: 'Viajes Falabella', websiteUrl: 'https://www.viajesfalabella.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.viajesfalabella.com.co/ofertas', 'https://www.viajesfalabella.com.co/promociones'] },
  { name: 'Decameron', websiteUrl: 'https://www.decameron.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.decameron.com/es/ofertas', 'https://www.decameron.com/es/promociones'] },
  { name: 'On Vacation', websiteUrl: 'https://www.onvacation.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.onvacation.com/ofertas', 'https://www.onvacation.com/promociones'] },
  { name: 'Airbnb', websiteUrl: 'https://www.airbnb.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.com.co/'] },
  { name: 'Uber', websiteUrl: 'https://www.uber.com/co/es', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/co/es/ride/'] },
  { name: 'InDrive', websiteUrl: 'https://indrive.com/es/city/bogota', categorySlug: 'seyahat-ulasim', seedUrls: ['https://indrive.com/es/city/bogota'] },
  { name: 'Didi', websiteUrl: 'https://www.didiglobal.com/es-CO', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.didiglobal.com/es-CO/promociones'] },
  { name: 'Beat', websiteUrl: 'https://thebeat.co/co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://thebeat.co/co/promociones'] },
  { name: 'RedBus', websiteUrl: 'https://www.redbus.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.redbus.co/ofertas'] },
  { name: 'Pinbus', websiteUrl: 'https://www.pinbus.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pinbus.com/ofertas'] },
  { name: 'Hotels.com', websiteUrl: 'https://co.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://co.hotels.com/deals/'] },
  { name: 'Hoteles.com', websiteUrl: 'https://www.hoteles.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hoteles.com/ofertas'] },
  { name: 'Price Travel', websiteUrl: 'https://co.pricetravel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://co.pricetravel.com/ofertas'] },
  { name: 'Ecohotels', websiteUrl: 'https://www.ecohotels.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ecohotels.com.co/ofertas'] },
  { name: 'Marriott', websiteUrl: 'https://www.marriott.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com.co/especiales/mesDeOfertas.mi'] },
  { name: 'Hilton', websiteUrl: 'https://www.hilton.com/es/locations/colombia', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hilton.com/es/offers/'] },
  { name: 'Rent-a-Car', websiteUrl: 'https://www.rentacar.com.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rentacar.com.co/ofertas'] },
  { name: 'Localiza', websiteUrl: 'https://www.localiza.com/colombia/es-co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.localiza.com/colombia/es-co/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Bancolombia', websiteUrl: 'https://www.bancolombia.com', categorySlug: 'finans', seedUrls: ['https://www.bancolombia.com/personas/promociones', 'https://www.bancolombia.com/personas/ofertas'] },
  { name: 'Davivienda', websiteUrl: 'https://www.davivienda.com', categorySlug: 'finans', seedUrls: ['https://www.davivienda.com/wps/portal/personas/promociones', 'https://www.davivienda.com/wps/portal/personas/ofertas'] },
  { name: 'Banco de Bogotá', websiteUrl: 'https://www.bancodebogota.com', categorySlug: 'finans', seedUrls: ['https://www.bancodebogota.com/wps/portal/banco-de-bogota/bogota/promociones'] },
  { name: 'BBVA Colombia', websiteUrl: 'https://www.bbva.com.co', categorySlug: 'finans', seedUrls: ['https://www.bbva.com.co/personas/promociones.html', 'https://www.bbva.com.co/personas/ofertas.html'] },
  { name: 'Scotiabank Colpatria', websiteUrl: 'https://www.scotiabankcolpatria.com', categorySlug: 'finans', seedUrls: ['https://www.scotiabankcolpatria.com/promociones', 'https://www.scotiabankcolpatria.com/ofertas'] },
  { name: 'Banco Popular', websiteUrl: 'https://www.bancopopular.com.co', categorySlug: 'finans', seedUrls: ['https://www.bancopopular.com.co/wps/portal/popular/promociones'] },
  { name: 'Banco de Occidente', websiteUrl: 'https://www.bancodeoccidente.com.co', categorySlug: 'finans', seedUrls: ['https://www.bancodeoccidente.com.co/wps/portal/banco-de-occidente/promociones'] },
  { name: 'Banco AV Villas', websiteUrl: 'https://www.avvillas.com.co', categorySlug: 'finans', seedUrls: ['https://www.avvillas.com.co/wps/portal/avvillas/promociones'] },
  { name: 'Nequi', websiteUrl: 'https://www.nequi.com.co', categorySlug: 'finans', seedUrls: ['https://www.nequi.com.co/promociones', 'https://www.nequi.com.co/ofertas'] },
  { name: 'Daviplata', websiteUrl: 'https://www.daviplata.com', categorySlug: 'finans', seedUrls: ['https://www.daviplata.com/promociones'] },
  { name: 'Nu Colombia', websiteUrl: 'https://nu.com.co', categorySlug: 'finans', seedUrls: ['https://nu.com.co/blog/', 'https://nu.com.co/promociones/'] },
  { name: 'Rappipay', websiteUrl: 'https://www.rappipay.co', categorySlug: 'finans', seedUrls: ['https://www.rappipay.co/promociones'] },
  { name: 'Addi', websiteUrl: 'https://www.addi.com', categorySlug: 'finans', seedUrls: ['https://www.addi.com/promociones'] },
  { name: 'Sistecredito', websiteUrl: 'https://www.sistecredito.com', categorySlug: 'finans', seedUrls: ['https://www.sistecredito.com/promociones'] },
  { name: 'Banco Caja Social', websiteUrl: 'https://www.bancocajasocial.com', categorySlug: 'finans', seedUrls: ['https://www.bancocajasocial.com/promociones'] },
  { name: 'Banco Falabella', websiteUrl: 'https://www.bancofalabella.com.co', categorySlug: 'finans', seedUrls: ['https://www.bancofalabella.com.co/promociones', 'https://www.bancofalabella.com.co/ofertas'] },
  { name: 'Banco Itaú', websiteUrl: 'https://www.itau.co', categorySlug: 'finans', seedUrls: ['https://www.itau.co/promociones'] },
  { name: 'Banco Pichincha', websiteUrl: 'https://www.bancopichincha.com.co', categorySlug: 'finans', seedUrls: ['https://www.bancopichincha.com.co/promociones'] },
  { name: 'Banco GNB Sudameris', websiteUrl: 'https://www.gnbsudameris.com.co', categorySlug: 'finans', seedUrls: ['https://www.gnbsudameris.com.co/promociones'] },
  { name: 'Banco Agrario', websiteUrl: 'https://www.bancoagrario.gov.co', categorySlug: 'finans', seedUrls: ['https://www.bancoagrario.gov.co/promociones'] },
  { name: 'Bancamía', websiteUrl: 'https://www.bancamia.com.co', categorySlug: 'finans', seedUrls: ['https://www.bancamia.com.co/promociones'] },
  { name: 'Tuya', websiteUrl: 'https://www.tuya.com.co', categorySlug: 'finans', seedUrls: ['https://www.tuya.com.co/promociones', 'https://www.tuya.com.co/ofertas'] },
  { name: 'Movii', websiteUrl: 'https://www.movii.com.co', categorySlug: 'finans', seedUrls: ['https://www.movii.com.co/promociones'] },
  { name: 'Dale!', websiteUrl: 'https://www.dale.com.co', categorySlug: 'finans', seedUrls: ['https://www.dale.com.co/promociones'] },
  { name: 'Tpaga', websiteUrl: 'https://www.tpaga.co', categorySlug: 'finans', seedUrls: ['https://www.tpaga.co/promociones'] },
  { name: 'Bold', websiteUrl: 'https://www.bold.co', categorySlug: 'finans', seedUrls: ['https://www.bold.co/promociones'] },
  { name: 'Efecty', websiteUrl: 'https://www.efecty.com.co', categorySlug: 'finans', seedUrls: ['https://www.efecty.com.co/promociones'] },
  { name: 'Western Union', websiteUrl: 'https://www.westernunion.com/co', categorySlug: 'finans', seedUrls: ['https://www.westernunion.com/co/es/send-money/app.html'] },
  { name: 'Credibanco', websiteUrl: 'https://www.credibanco.com', categorySlug: 'finans', seedUrls: ['https://www.credibanco.com/promociones'] },
  { name: 'Finandina', websiteUrl: 'https://www.bancofinandina.com', categorySlug: 'finans', seedUrls: ['https://www.bancofinandina.com/promociones'] },
  { name: 'RappiCard', websiteUrl: 'https://www.rappicard.co', categorySlug: 'finans', seedUrls: ['https://www.rappicard.co/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sura', websiteUrl: 'https://www.segurossura.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.segurossura.com.co/promociones', 'https://www.segurossura.com.co/ofertas'] },
  { name: 'Bolívar Seguros', websiteUrl: 'https://www.segurosbolivar.com', categorySlug: 'sigorta', seedUrls: ['https://www.segurosbolivar.com/promociones', 'https://www.segurosbolivar.com/ofertas'] },
  { name: 'Allianz', websiteUrl: 'https://www.allianz.co', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.co/promociones'] },
  { name: 'Liberty Seguros', websiteUrl: 'https://www.libertyseguros.co', categorySlug: 'sigorta', seedUrls: ['https://www.libertyseguros.co/promociones', 'https://www.libertyseguros.co/ofertas'] },
  { name: 'Mapfre', websiteUrl: 'https://www.mapfre.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.mapfre.com.co/seguros-co/promociones/'] },
  { name: 'AXA Colpatria', websiteUrl: 'https://www.axacolpatria.co', categorySlug: 'sigorta', seedUrls: ['https://www.axacolpatria.co/promociones'] },
  { name: 'Seguros del Estado', websiteUrl: 'https://www.segurosdelestado.com', categorySlug: 'sigorta', seedUrls: ['https://www.segurosdelestado.com/promociones'] },
  { name: 'Previsora Seguros', websiteUrl: 'https://www.previsora.gov.co', categorySlug: 'sigorta', seedUrls: ['https://www.previsora.gov.co/promociones'] },
  { name: 'Zurich', websiteUrl: 'https://www.zurich.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.com.co/promociones'] },
  { name: 'HDI Seguros', websiteUrl: 'https://www.hdi.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.hdi.com.co/promociones'] },
  { name: 'Equidad Seguros', websiteUrl: 'https://www.laequidadseguros.coop', categorySlug: 'sigorta', seedUrls: ['https://www.laequidadseguros.coop/promociones'] },
  { name: 'Positiva', websiteUrl: 'https://www.positiva.gov.co', categorySlug: 'sigorta', seedUrls: ['https://www.positiva.gov.co/promociones'] },
  { name: 'Solidaria', websiteUrl: 'https://www.solidaria.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.solidaria.com.co/promociones'] },
  { name: 'Mundial Seguros', websiteUrl: 'https://www.mundialseguros.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.mundialseguros.com.co/promociones'] },
  { name: 'Colmena Seguros', websiteUrl: 'https://www.colmenaseguros.com', categorySlug: 'sigorta', seedUrls: ['https://www.colmenaseguros.com/promociones'] },
  { name: 'Berkley Seguros', websiteUrl: 'https://www.berkleyseguros.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.berkleyseguros.com.co/promociones'] },
  { name: 'Chubb', websiteUrl: 'https://www.chubb.com/co-es', categorySlug: 'sigorta', seedUrls: ['https://www.chubb.com/co-es/promociones.html'] },
  { name: 'MetLife', websiteUrl: 'https://www.metlife.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.com.co/promociones/'] },
  { name: 'Aseguradora Confianza', websiteUrl: 'https://www.confianza.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.confianza.com.co/promociones'] },
  { name: 'Nacional de Seguros', websiteUrl: 'https://www.nacionaldeseguros.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.nacionaldeseguros.com.co/promociones'] },
  { name: 'Salud Total', websiteUrl: 'https://www.saludtotal.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.saludtotal.com.co/promociones'] },
  { name: 'EPS Sura', websiteUrl: 'https://www.epssura.com', categorySlug: 'sigorta', seedUrls: ['https://www.epssura.com/promociones'] },
  { name: 'Nueva EPS', websiteUrl: 'https://www.nuevaeps.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.nuevaeps.com.co/promociones'] },
  { name: 'Sanitas', websiteUrl: 'https://www.epssanitas.com', categorySlug: 'sigorta', seedUrls: ['https://www.epssanitas.com/promociones'] },
  { name: 'Compensar', websiteUrl: 'https://www.compensar.com', categorySlug: 'sigorta', seedUrls: ['https://www.compensar.com/promociones', 'https://www.compensar.com/ofertas'] },
  { name: 'Colsanitas', websiteUrl: 'https://www.colsanitas.com', categorySlug: 'sigorta', seedUrls: ['https://www.colsanitas.com/promociones'] },
  { name: 'Famisanar', websiteUrl: 'https://www.famisanar.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.famisanar.com.co/promociones'] },
  { name: 'Comfenalco', websiteUrl: 'https://www.comfenalcoantioquia.com', categorySlug: 'sigorta', seedUrls: ['https://www.comfenalcoantioquia.com/promociones'] },
  { name: 'Cafam', websiteUrl: 'https://www.cafam.com.co', categorySlug: 'sigorta', seedUrls: ['https://www.cafam.com.co/promociones', 'https://www.cafam.com.co/ofertas'] },
  { name: 'Comfama', websiteUrl: 'https://www.comfama.com', categorySlug: 'sigorta', seedUrls: ['https://www.comfama.com/promociones', 'https://www.comfama.com/ofertas'] },
  { name: 'Assist Card', websiteUrl: 'https://www.assistcard.com/co', categorySlug: 'sigorta', seedUrls: ['https://www.assistcard.com/co/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Chevrolet', websiteUrl: 'https://www.chevrolet.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.com.co/ofertas', 'https://www.chevrolet.com.co/promociones'] },
  { name: 'Renault', websiteUrl: 'https://www.renault.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.renault.com.co/ofertas.html', 'https://www.renault.com.co/promociones.html'] },
  { name: 'Mazda', websiteUrl: 'https://www.mazda.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.com.co/ofertas', 'https://www.mazda.com.co/promociones'] },
  { name: 'Toyota', websiteUrl: 'https://www.toyota.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.co/ofertas', 'https://www.toyota.com.co/promociones'] },
  { name: 'Kia', websiteUrl: 'https://www.kia.com/co', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/co/ofertas.html', 'https://www.kia.com/co/promociones.html'] },
  { name: 'Hyundai', websiteUrl: 'https://www.hyundai.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com.co/ofertas', 'https://www.hyundai.com.co/promociones'] },
  { name: 'Nissan', websiteUrl: 'https://www.nissan.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.co/ofertas.html', 'https://www.nissan.com.co/promociones.html'] },
  { name: 'Volkswagen', websiteUrl: 'https://www.volkswagen.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.com.co/es/ofertas.html', 'https://www.volkswagen.com.co/es/promociones.html'] },
  { name: 'Ford', websiteUrl: 'https://www.ford.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.ford.com.co/ofertas/', 'https://www.ford.com.co/promociones/'] },
  { name: 'Suzuki', websiteUrl: 'https://www.suzuki.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.com.co/ofertas', 'https://www.suzuki.com.co/promociones'] },
  { name: 'Subaru', websiteUrl: 'https://www.subaru.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.com.co/ofertas'] },
  { name: 'Mitsubishi', websiteUrl: 'https://www.mitsubishi-motors.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.com.co/ofertas', 'https://www.mitsubishi-motors.com.co/promociones'] },
  { name: 'Honda', websiteUrl: 'https://www.honda.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.co/autos/ofertas', 'https://www.honda.com.co/autos/promociones'] },
  { name: 'BMW', websiteUrl: 'https://www.bmw.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.co/es/ofertas.html'] },
  { name: 'Mercedes-Benz', websiteUrl: 'https://www.mercedes-benz.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.co/passengercars/campaigns.html'] },
  { name: 'Audi', websiteUrl: 'https://www.audi.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.co/co/web/es/modelos/ofertas.html'] },
  { name: 'Volvo', websiteUrl: 'https://www.volvocars.com/co', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/co/ofertas/'] },
  { name: 'Peugeot', websiteUrl: 'https://www.peugeot.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.co/ofertas.html'] },
  { name: 'Citroën', websiteUrl: 'https://www.citroen.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.com.co/ofertas.html'] },
  { name: 'DFSK', websiteUrl: 'https://www.dfsk.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.dfsk.com.co/ofertas', 'https://www.dfsk.com.co/promociones'] },
  { name: 'JAC Motors', websiteUrl: 'https://www.jacmotors.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.jacmotors.com.co/ofertas'] },
  { name: 'Chery', websiteUrl: 'https://www.chery.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.chery.com.co/ofertas'] },
  { name: 'BYD', websiteUrl: 'https://www.byd.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.byd.com.co/ofertas', 'https://www.byd.com.co/promociones'] },
  { name: 'Great Wall', websiteUrl: 'https://www.gwm.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.gwm.com.co/ofertas'] },
  { name: 'Autogermana', websiteUrl: 'https://www.autogermana.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.autogermana.com.co/ofertas'] },
  { name: 'Yamaha', websiteUrl: 'https://www.yamaha-motor.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.yamaha-motor.com.co/promociones'] },
  { name: 'Bajaj', websiteUrl: 'https://www.bajaj.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.bajaj.com.co/ofertas', 'https://www.bajaj.com.co/promociones'] },
  { name: 'Hero', websiteUrl: 'https://www.heromotos.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.heromotos.com.co/ofertas', 'https://www.heromotos.com.co/promociones'] },
  { name: 'AKT', websiteUrl: 'https://www.aktmotos.com', categorySlug: 'otomobil', seedUrls: ['https://www.aktmotos.com/ofertas', 'https://www.aktmotos.com/promociones'] },
  { name: 'Auteco', websiteUrl: 'https://www.auteco.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.auteco.com.co/ofertas', 'https://www.auteco.com.co/promociones'] },
  { name: 'Michelin', websiteUrl: 'https://www.michelin.com.co', categorySlug: 'otomobil', seedUrls: ['https://www.michelin.com.co/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobby (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Librería Nacional', websiteUrl: 'https://www.librerianacional.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.librerianacional.com/ofertas', 'https://www.librerianacional.com/promociones'] },
  { name: 'Panamericana Books', websiteUrl: 'https://www.panamericana.com.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.panamericana.com.co/libros/ofertas', 'https://www.panamericana.com.co/libros/promociones'] },
  { name: 'Buscalibre', websiteUrl: 'https://www.buscalibre.com.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.buscalibre.com.co/libros/ofertas', 'https://www.buscalibre.com.co/libros/promociones'] },
  { name: 'Lerner', websiteUrl: 'https://www.lerner.com.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lerner.com.co/ofertas', 'https://www.lerner.com.co/promociones'] },
  { name: 'Amazon Books CO', websiteUrl: 'https://www.amazon.com.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.co/libros/deals'] },
  { name: 'Tornamesa', websiteUrl: 'https://www.tornamesa.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.tornamesa.co/ofertas'] },
  { name: 'Netflix', websiteUrl: 'https://www.netflix.com/co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/co/'] },
  { name: 'Disney+', websiteUrl: 'https://www.disneyplus.com/es-co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/es-co'] },
  { name: 'HBO Max', websiteUrl: 'https://www.hbomax.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hbomax.com/'] },
  { name: 'Spotify', websiteUrl: 'https://www.spotify.com/co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/co/premium/'] },
  { name: 'Deezer', websiteUrl: 'https://www.deezer.com/es', categorySlug: 'kitap-hobi', seedUrls: ['https://www.deezer.com/es/offers'] },
  { name: 'Xbox', websiteUrl: 'https://www.xbox.com/es-CO', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/es-CO/promotions', 'https://www.xbox.com/es-CO/games/deals-with-gold'] },
  { name: 'PlayStation', websiteUrl: 'https://store.playstation.com/es-co', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/es-co/category/ofertas'] },
  { name: 'Nintendo', websiteUrl: 'https://www.nintendo.com/es-co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/es-co/store/deals/'] },
  { name: 'Steam', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/'] },
  { name: 'Level Up', websiteUrl: 'https://www.levelup.com/co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.levelup.com/co/ofertas'] },
  { name: 'LEGO', websiteUrl: 'https://www.lego.com/es-co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/es-co/categories/sale-and-offers'] },
  { name: 'Mattel', websiteUrl: 'https://www.mattel.com/es-co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mattel.com/es-co/sale'] },
  { name: 'Hasbro', websiteUrl: 'https://www.hasbro.com/es-co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hasbro.com/es-co/ofertas'] },
  { name: 'Toysmart', websiteUrl: 'https://www.toysmart.com.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysmart.com.co/ofertas', 'https://www.toysmart.com.co/promociones'] },
  { name: 'Pepe Ganga Toys', websiteUrl: 'https://www.pepeganga.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.pepeganga.com/juguetes/ofertas'] },
  { name: 'Cinemark', websiteUrl: 'https://www.cinemark.com.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cinemark.com.co/promociones'] },
  { name: 'Cinépolis', websiteUrl: 'https://www.cinepolis.com.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cinepolis.com.co/promociones'] },
  { name: 'Cine Colombia', websiteUrl: 'https://www.cinecolombia.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cinecolombia.com/promociones'] },
  { name: 'Royal Films', websiteUrl: 'https://www.royalfilms.com.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.royalfilms.com.co/promociones'] },
  { name: 'Coursera', websiteUrl: 'https://www.coursera.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coursera.org/promo/'] },
  { name: 'Platzi', websiteUrl: 'https://platzi.com', categorySlug: 'kitap-hobi', seedUrls: ['https://platzi.com/precios/'] },
  { name: 'Udemy', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?q=&src=ukw&p=1&price=price-free'] },
  { name: 'MasterClass', websiteUrl: 'https://www.masterclass.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.masterclass.com/offers'] },
  { name: 'Audible', websiteUrl: 'https://www.audible.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.com/ep/special-offers'] },
  { name: 'Kindle', websiteUrl: 'https://www.amazon.com.co/kindle-dbs/storefront', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.co/kindle-dbs/deals'] },
];

function deduplicateBrands(brands: BrandEntry[]): BrandEntry[] {
  const seen = new Map<string, BrandEntry>();
  for (const b of brands) {
    const slug = toSlug(b.name);
    if (!seen.has(slug)) seen.set(slug, b);
  }
  return Array.from(seen.values());
}

async function main() {
  console.log('=== CO Brand Seeding Script ===');
  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Total brands (after dedup): ${uniqueBrands.length}`);

  let brandsOk = 0;
  let sourcesCreated = 0;
  let sourcesUpdated = 0;
  let errors = 0;
  const missingCategories = new Set<string>();

  for (const entry of uniqueBrands) {
    try {
      const slug = toSlug(entry.name);
      const category = await prisma.category.findUnique({ where: { slug: entry.categorySlug } });
      if (!category) {
        missingCategories.add(entry.categorySlug);
        continue;
      }

      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'CO' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'CO', categoryId: category.id },
      });

      brandsOk++;

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
            schedule: '0 10 * * *',
            agingDays: 7,
            market: 'CO',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'CO' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'CO', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active CO sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
