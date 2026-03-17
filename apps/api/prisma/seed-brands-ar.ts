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
  { name: 'MercadoLibre', websiteUrl: 'https://www.mercadolibre.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.mercadolibre.com.ar/ofertas', 'https://www.mercadolibre.com.ar/descuentos'] },
  { name: 'Garbarino', websiteUrl: 'https://www.garbarino.com', categorySlug: 'alisveris', seedUrls: ['https://www.garbarino.com/ofertas', 'https://www.garbarino.com/promociones'] },
  { name: 'Fravega', websiteUrl: 'https://www.fravega.com', categorySlug: 'alisveris', seedUrls: ['https://www.fravega.com/ofertas', 'https://www.fravega.com/promociones'] },
  { name: 'Musimundo', websiteUrl: 'https://www.musimundo.com', categorySlug: 'alisveris', seedUrls: ['https://www.musimundo.com/ofertas', 'https://www.musimundo.com/promociones'] },
  { name: 'Coto Digital', websiteUrl: 'https://www.cotodigital3.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.cotodigital3.com.ar/sitios/cdigi/browse?Ntt=ofertas', 'https://www.cotodigital3.com.ar/sitios/cdigi/browse?Ntt=promociones'] },
  { name: 'Falabella AR', websiteUrl: 'https://www.falabella.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.falabella.com.ar/falabella-ar/collection/ofertas', 'https://www.falabella.com.ar/falabella-ar/collection/promociones'] },
  { name: 'Tienda Nube', websiteUrl: 'https://www.tiendanube.com', categorySlug: 'alisveris', seedUrls: ['https://www.tiendanube.com/promociones'] },
  { name: 'Mercado Shops', websiteUrl: 'https://www.mercadoshops.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.mercadoshops.com.ar/'] },
  { name: 'Linio AR', websiteUrl: 'https://www.linio.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.linio.com.ar/ofertas', 'https://www.linio.com.ar/promociones'] },
  { name: 'Dafiti', websiteUrl: 'https://www.dafiti.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.dafiti.com.ar/ofertas', 'https://www.dafiti.com.ar/descuentos'] },
  { name: 'Walmart AR', websiteUrl: 'https://www.walmart.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.walmart.com.ar/ofertas', 'https://www.walmart.com.ar/promociones'] },
  { name: 'Sodimac AR', websiteUrl: 'https://www.sodimac.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.sodimac.com.ar/sodimac-ar/content/ofertas', 'https://www.sodimac.com.ar/sodimac-ar/content/promociones'] },
  { name: 'Easy AR', websiteUrl: 'https://www.easy.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.easy.com.ar/ofertas', 'https://www.easy.com.ar/promociones'] },
  { name: 'Naldo', websiteUrl: 'https://www.nfrizzera.com', categorySlug: 'alisveris', seedUrls: ['https://www.nfrizzera.com/ofertas', 'https://www.nfrizzera.com/promociones'] },
  { name: 'Ribeiro', websiteUrl: 'https://www.ribeiro.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.ribeiro.com.ar/ofertas', 'https://www.ribeiro.com.ar/promociones'] },
  { name: 'Megatone', websiteUrl: 'https://www.megatone.net', categorySlug: 'alisveris', seedUrls: ['https://www.megatone.net/ofertas', 'https://www.megatone.net/promociones'] },
  { name: 'Cetrogar', websiteUrl: 'https://www.cetrogar.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.cetrogar.com.ar/ofertas', 'https://www.cetrogar.com.ar/promociones'] },
  { name: 'Pintureria Rex', websiteUrl: 'https://www.rfrizzera.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.rfrizzera.com.ar/ofertas'] },
  { name: 'Tiendamia', websiteUrl: 'https://tiendamia.com/ar', categorySlug: 'alisveris', seedUrls: ['https://tiendamia.com/ar/ofertas'] },
  { name: 'AliExpress AR', websiteUrl: 'https://es.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://es.aliexpress.com/wholesale', 'https://sale.aliexpress.com/__pc/sale.htm'] },
  { name: 'Amazon AR', websiteUrl: 'https://www.amazon.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.com.ar/deals', 'https://www.amazon.com.ar/gp/goldbox'] },
  { name: 'Coppel AR', websiteUrl: 'https://www.coppel.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.coppel.com.ar/ofertas', 'https://www.coppel.com.ar/promociones'] },
  { name: 'Compumundo', websiteUrl: 'https://www.compumundo.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.compumundo.com.ar/ofertas', 'https://www.compumundo.com.ar/promociones'] },
  { name: 'Jumbo AR', websiteUrl: 'https://www.jumbo.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.jumbo.com.ar/ofertas', 'https://www.jumbo.com.ar/promociones'] },
  { name: 'Disco', websiteUrl: 'https://www.disco.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.disco.com.ar/ofertas', 'https://www.disco.com.ar/promociones'] },
  { name: 'Cuponstar', websiteUrl: 'https://www.cuponstar.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.cuponstar.com.ar/'] },
  { name: 'Groupon AR', websiteUrl: 'https://www.groupon.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.groupon.com.ar/descuentos'] },
  { name: 'Avenida.com', websiteUrl: 'https://www.avenida.com', categorySlug: 'alisveris', seedUrls: ['https://www.avenida.com/ofertas', 'https://www.avenida.com/promociones'] },
  { name: 'FullH4rd', websiteUrl: 'https://www.fullh4rd.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.fullh4rd.com.ar/ofertas'] },
  { name: 'GearStore', websiteUrl: 'https://www.gearstore.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.gearstore.com.ar/ofertas'] },
  { name: 'Bidcom', websiteUrl: 'https://www.bidcom.com.ar', categorySlug: 'alisveris', seedUrls: ['https://www.bidcom.com.ar/ofertas', 'https://www.bidcom.com.ar/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung AR', websiteUrl: 'https://www.samsung.com/ar', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/ar/offer/', 'https://www.samsung.com/ar/smartphones/all-smartphones/'] },
  { name: 'Apple AR', websiteUrl: 'https://www.apple.com/la', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/la/shop/go/special_deals'] },
  { name: 'LG AR', websiteUrl: 'https://www.lg.com/ar', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/ar/promociones'] },
  { name: 'Sony AR', websiteUrl: 'https://store.sony.com.ar', categorySlug: 'elektronik', seedUrls: ['https://store.sony.com.ar/ofertas', 'https://store.sony.com.ar/promociones'] },
  { name: 'Motorola AR', websiteUrl: 'https://www.motorola.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.com.ar/ofertas', 'https://www.motorola.com.ar/promociones'] },
  { name: 'Xiaomi AR', websiteUrl: 'https://www.mi.com/ar', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/ar/sale'] },
  { name: 'HP AR', websiteUrl: 'https://www.hp.com/ar-es', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/ar-es/shop/ofertas'] },
  { name: 'Lenovo AR', websiteUrl: 'https://www.lenovo.com/ar/es', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/ar/es/d/deals/'] },
  { name: 'Dell AR', websiteUrl: 'https://www.dell.com/es-ar', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/es-ar/shop/deals'] },
  { name: 'Asus AR', websiteUrl: 'https://www.asus.com/ar', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/ar/campaign/'] },
  { name: 'Logitech AR', websiteUrl: 'https://www.logitech.com/es-ar', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/es-ar/promo.html'] },
  { name: 'Movistar AR', websiteUrl: 'https://www.movistar.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.movistar.com.ar/promociones', 'https://www.movistar.com.ar/ofertas'] },
  { name: 'Personal', websiteUrl: 'https://www.personal.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.personal.com.ar/promociones', 'https://www.personal.com.ar/ofertas'] },
  { name: 'Claro AR', websiteUrl: 'https://www.claro.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.claro.com.ar/personas/ofertas', 'https://www.claro.com.ar/personas/promociones'] },
  { name: 'Telecentro', websiteUrl: 'https://www.telecentro.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.telecentro.com.ar/promociones'] },
  { name: 'DirecTV AR', websiteUrl: 'https://www.directvgo.com/ar', categorySlug: 'elektronik', seedUrls: ['https://www.directvgo.com/ar/ofertas'] },
  { name: 'Philips AR', websiteUrl: 'https://www.philips.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.philips.com.ar/c-e/ofertas'] },
  { name: 'BGH', websiteUrl: 'https://www.bgh.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.bgh.com.ar/promociones'] },
  { name: 'Noblex', websiteUrl: 'https://www.noblex.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.noblex.com.ar/promociones', 'https://www.noblex.com.ar/ofertas'] },
  { name: 'Whirlpool AR', websiteUrl: 'https://www.whirlpool.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.whirlpool.com.ar/promociones'] },
  { name: 'Electrolux AR', websiteUrl: 'https://www.electrolux.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.electrolux.com.ar/promociones'] },
  { name: 'Huawei AR', websiteUrl: 'https://consumer.huawei.com/ar', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/ar/offer/'] },
  { name: 'Canon AR', websiteUrl: 'https://www.canon.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.canon.com.ar/promociones'] },
  { name: 'Epson AR', websiteUrl: 'https://www.epson.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.epson.com.ar/promociones'] },
  { name: 'JBL AR', websiteUrl: 'https://ar.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://ar.jbl.com/ofertas'] },
  { name: 'Harman AR', websiteUrl: 'https://www.harmankardon.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.harmankardon.com.ar/ofertas'] },
  { name: 'TCL AR', websiteUrl: 'https://www.tcl.com/ar', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/ar/es/promotions'] },
  { name: 'Hisense AR', websiteUrl: 'https://www.hisense.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.hisense.com.ar/promociones'] },
  { name: 'Roku AR', websiteUrl: 'https://www.roku.com/es-ar', categorySlug: 'elektronik', seedUrls: ['https://www.roku.com/es-ar/offers'] },
  { name: 'Nikon AR', websiteUrl: 'https://www.nikon.com.ar', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.com.ar/promociones'] },
  { name: 'GoPro AR', websiteUrl: 'https://gopro.com/es/ar', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/es/ar/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 32 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Rapsodia', websiteUrl: 'https://www.rapsodia.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.rapsodia.com.ar/sale', 'https://www.rapsodia.com.ar/ofertas'] },
  { name: 'Cuesta Blanca', websiteUrl: 'https://www.cuestablanca.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.cuestablanca.com/sale', 'https://www.cuestablanca.com/ofertas'] },
  { name: 'Kosiuko', websiteUrl: 'https://www.kosiuko.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.kosiuko.com.ar/sale', 'https://www.kosiuko.com.ar/ofertas'] },
  { name: 'Mimo & Co', websiteUrl: 'https://www.mimo.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.mimo.com.ar/sale', 'https://www.mimo.com.ar/ofertas'] },
  { name: 'Cheeky', websiteUrl: 'https://www.cheeky.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.cheeky.com.ar/sale', 'https://www.cheeky.com.ar/ofertas'] },
  { name: 'Zara AR', websiteUrl: 'https://www.zara.com/ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/ar/es/rebajas-l1702.html'] },
  { name: 'H&M AR', websiteUrl: 'https://www2.hm.com/es_ar', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/es_ar/rebajas.html'] },
  { name: 'Falabella Moda', websiteUrl: 'https://www.falabella.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.falabella.com.ar/falabella-ar/collection/ofertas-moda'] },
  { name: 'Wanama', websiteUrl: 'https://www.wanama.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.wanama.com.ar/sale', 'https://www.wanama.com.ar/ofertas'] },
  { name: 'Akiabara', websiteUrl: 'https://www.akiabara.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.akiabara.com.ar/sale'] },
  { name: 'Uma', websiteUrl: 'https://www.uma.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.uma.com.ar/sale', 'https://www.uma.com.ar/ofertas'] },
  { name: 'Ayres', websiteUrl: 'https://www.ayres.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.ayres.com.ar/sale'] },
  { name: 'Vitamina', websiteUrl: 'https://www.vitamina.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.vitamina.com.ar/sale'] },
  { name: 'Jazmin Chebar', websiteUrl: 'https://www.jazminchebar.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.jazminchebar.com.ar/sale'] },
  { name: 'Maria Cher', websiteUrl: 'https://www.mariacher.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.mariacher.com.ar/sale'] },
  { name: 'Carmela Achaval', websiteUrl: 'https://www.carmelaachaval.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.carmelaachaval.com/sale'] },
  { name: 'Desiderata', websiteUrl: 'https://www.desiderata.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.desiderata.com.ar/sale', 'https://www.desiderata.com.ar/ofertas'] },
  { name: 'Yagmour', websiteUrl: 'https://www.yagmour.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.yagmour.com.ar/sale'] },
  { name: 'Kevingston', websiteUrl: 'https://www.kevingston.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.kevingston.com/sale', 'https://www.kevingston.com/ofertas'] },
  { name: 'Legacy', websiteUrl: 'https://www.legacy.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.legacy.com.ar/sale'] },
  { name: 'Etiqueta Negra', websiteUrl: 'https://www.etiquetanegra.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.etiquetanegra.com.ar/sale'] },
  { name: 'La Martina', websiteUrl: 'https://www.lamartina.com/ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.lamartina.com/ar/sale'] },
  { name: 'Levi\'s AR', websiteUrl: 'https://www.levi.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com.ar/sale', 'https://www.levi.com.ar/ofertas'] },
  { name: 'Ona Saez', websiteUrl: 'https://www.onasaez.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.onasaez.com/sale', 'https://www.onasaez.com/ofertas'] },
  { name: 'Complot', websiteUrl: 'https://www.complot.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.complot.com.ar/sale'] },
  { name: 'Bolivia', websiteUrl: 'https://www.bolivia.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.bolivia.com.ar/sale'] },
  { name: 'Giesso', websiteUrl: 'https://www.giesso.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.giesso.com/sale', 'https://www.giesso.com/ofertas'] },
  { name: 'Cardón', websiteUrl: 'https://www.cardon.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.cardon.com.ar/sale'] },
  { name: 'Lacoste AR', websiteUrl: 'https://www.lacoste.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com.ar/sale'] },
  { name: 'Tommy Hilfiger AR', websiteUrl: 'https://ar.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://ar.tommy.com/sale'] },
  { name: 'Bensimon', websiteUrl: 'https://www.bensimon.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.bensimon.com.ar/sale'] },
  { name: 'Portsaid', websiteUrl: 'https://www.portsaid.com.ar', categorySlug: 'giyim-moda', seedUrls: ['https://www.portsaid.com.ar/sale', 'https://www.portsaid.com.ar/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living (ev-yasam) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sodimac Homecenter', websiteUrl: 'https://www.sodimac.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.sodimac.com.ar/sodimac-ar/content/ofertas-hogar', 'https://www.sodimac.com.ar/sodimac-ar/content/promociones'] },
  { name: 'Easy Hogar', websiteUrl: 'https://www.easy.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.easy.com.ar/ofertas-hogar', 'https://www.easy.com.ar/promociones'] },
  { name: 'Dexter Hogar', websiteUrl: 'https://www.dexter.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.dexter.com.ar/ofertas', 'https://www.dexter.com.ar/promociones'] },
  { name: 'Falabella Hogar', websiteUrl: 'https://www.falabella.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.falabella.com.ar/falabella-ar/collection/ofertas-hogar'] },
  { name: 'Arredo', websiteUrl: 'https://www.arredo.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.arredo.com.ar/sale', 'https://www.arredo.com.ar/ofertas'] },
  { name: 'Blaisten', websiteUrl: 'https://www.blaisten.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.blaisten.com/ofertas', 'https://www.blaisten.com/promociones'] },
  { name: 'Ferrocons', websiteUrl: 'https://www.ferrocons.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.ferrocons.com.ar/ofertas'] },
  { name: 'Prestigio', websiteUrl: 'https://www.prestigio.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.prestigio.com.ar/sale', 'https://www.prestigio.com.ar/ofertas'] },
  { name: 'Colchon Express', websiteUrl: 'https://www.colchonexpress.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.colchonexpress.com.ar/ofertas', 'https://www.colchonexpress.com.ar/promociones'] },
  { name: 'Simmons AR', websiteUrl: 'https://www.simmons.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.simmons.com.ar/ofertas', 'https://www.simmons.com.ar/promociones'] },
  { name: 'La Anónima Hogar', websiteUrl: 'https://www.laanonima.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.laanonima.com.ar/ofertas-hogar'] },
  { name: 'Piero', websiteUrl: 'https://www.piero.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.piero.com.ar/ofertas', 'https://www.piero.com.ar/promociones'] },
  { name: 'Gaf Store', websiteUrl: 'https://www.gaf.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.gaf.com.ar/ofertas'] },
  { name: 'Dosplaza', websiteUrl: 'https://www.dosplaza.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.dosplaza.com.ar/ofertas'] },
  { name: 'Rosenthal AR', websiteUrl: 'https://www.rosenthal.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.rosenthal.com.ar/ofertas'] },
  { name: 'Fantasia Hogar', websiteUrl: 'https://www.fantasiahogar.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.fantasiahogar.com.ar/ofertas'] },
  { name: 'Ferrum', websiteUrl: 'https://www.ferrum.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ferrum.com/promociones'] },
  { name: 'Roca AR', websiteUrl: 'https://www.ar.roca.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ar.roca.com/promociones'] },
  { name: 'Petersen AR', websiteUrl: 'https://www.petersenhogar.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.petersenhogar.com.ar/ofertas'] },
  { name: 'Stanley AR', websiteUrl: 'https://www.stanley.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.stanley.com.ar/ofertas'] },
  { name: 'Black & Decker AR', websiteUrl: 'https://www.blackanddecker.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.blackanddecker.com.ar/ofertas'] },
  { name: 'Tramontina AR', websiteUrl: 'https://www.tramontina.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.tramontina.com.ar/ofertas'] },
  { name: 'Essen', websiteUrl: 'https://www.essen.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.essen.com.ar/ofertas', 'https://www.essen.com.ar/promociones'] },
  { name: 'TSU', websiteUrl: 'https://www.tsu.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.tsu.com.ar/ofertas'] },
  { name: 'HB Home', websiteUrl: 'https://www.hb-home.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.hb-home.com.ar/ofertas'] },
  { name: 'Juana de Arco', websiteUrl: 'https://www.juanadearco.net', categorySlug: 'ev-yasam', seedUrls: ['https://www.juanadearco.net/sale'] },
  { name: 'Luces y Formas', websiteUrl: 'https://www.lucesyformas.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.lucesyformas.com.ar/ofertas'] },
  { name: 'Casa Silvia', websiteUrl: 'https://www.casasilvia.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.casasilvia.com.ar/ofertas'] },
  { name: 'Crate & Barrel AR', websiteUrl: 'https://www.crateandbarrel.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.crateandbarrel.com.ar/sale'] },
  { name: 'Ikea AR', websiteUrl: 'https://www.ikea.com/ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/ar/es/offers/'] },
  { name: 'Pisano', websiteUrl: 'https://www.pisano.com.ar', categorySlug: 'ev-yasam', seedUrls: ['https://www.pisano.com.ar/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Food & Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Coto', websiteUrl: 'https://www.coto.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.coto.com.ar/ofertas', 'https://www.coto.com.ar/promociones'] },
  { name: 'Jumbo', websiteUrl: 'https://www.jumbo.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.jumbo.com.ar/ofertas', 'https://www.jumbo.com.ar/promociones'] },
  { name: 'Carrefour AR', websiteUrl: 'https://www.carrefour.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.carrefour.com.ar/ofertas', 'https://www.carrefour.com.ar/promociones'] },
  { name: 'DIA AR', websiteUrl: 'https://diaonline.supermercadosdia.com.ar', categorySlug: 'gida-market', seedUrls: ['https://diaonline.supermercadosdia.com.ar/ofertas', 'https://diaonline.supermercadosdia.com.ar/promociones'] },
  { name: 'Changomas', websiteUrl: 'https://www.changomas.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.changomas.com.ar/ofertas', 'https://www.changomas.com.ar/promociones'] },
  { name: 'La Anónima', websiteUrl: 'https://www.laanonima.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.laanonima.com.ar/ofertas', 'https://www.laanonima.com.ar/promociones'] },
  { name: 'Vea', websiteUrl: 'https://www.vea.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.vea.com.ar/ofertas', 'https://www.vea.com.ar/promociones'] },
  { name: 'Vital', websiteUrl: 'https://www.vital.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.vital.com.ar/ofertas'] },
  { name: 'Makro AR', websiteUrl: 'https://www.makro.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.makro.com.ar/ofertas', 'https://www.makro.com.ar/promociones'] },
  { name: 'Maxiconsumo', websiteUrl: 'https://www.maxiconsumo.com', categorySlug: 'gida-market', seedUrls: ['https://www.maxiconsumo.com/ofertas'] },
  { name: 'Diarco', websiteUrl: 'https://www.diarco.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.diarco.com.ar/ofertas', 'https://www.diarco.com.ar/promociones'] },
  { name: 'Yaguar', websiteUrl: 'https://www.yaguar.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.yaguar.com.ar/ofertas'] },
  { name: 'Auchan AR', websiteUrl: 'https://www.auchan.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.auchan.com.ar/ofertas'] },
  { name: 'Grido', websiteUrl: 'https://www.grido.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.grido.com.ar/promociones'] },
  { name: 'Arcor', websiteUrl: 'https://www.arcor.com', categorySlug: 'gida-market', seedUrls: ['https://www.arcor.com/ar/promociones'] },
  { name: 'Molinos Rio de la Plata', websiteUrl: 'https://www.molinos.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.molinos.com.ar/promociones'] },
  { name: 'Marolio', websiteUrl: 'https://www.marolio.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.marolio.com.ar/promociones'] },
  { name: 'La Serenísima', websiteUrl: 'https://www.laserenisima.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.laserenisima.com.ar/promociones'] },
  { name: 'SanCor', websiteUrl: 'https://www.sancor.com', categorySlug: 'gida-market', seedUrls: ['https://www.sancor.com/promociones'] },
  { name: 'Coca-Cola AR', websiteUrl: 'https://www.coca-cola.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.coca-cola.com.ar/ofertas'] },
  { name: 'Quilmes', websiteUrl: 'https://www.quilmes.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.quilmes.com.ar/promociones'] },
  { name: 'Bodega del Fin del Mundo', websiteUrl: 'https://www.bodegadelfindelmundo.com', categorySlug: 'gida-market', seedUrls: ['https://www.bodegadelfindelmundo.com/promociones'] },
  { name: 'Trapiche', websiteUrl: 'https://www.trapiche.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.trapiche.com.ar/promociones'] },
  { name: 'Luigi Bosca', websiteUrl: 'https://www.luigibosca.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.luigibosca.com.ar/promociones'] },
  { name: 'Catena Zapata', websiteUrl: 'https://www.catenawines.com', categorySlug: 'gida-market', seedUrls: ['https://www.catenawines.com/ofertas'] },
  { name: 'Norton', websiteUrl: 'https://www.norton.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.norton.com.ar/promociones'] },
  { name: 'Vinoteca Ligier', websiteUrl: 'https://www.ligier.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.ligier.com.ar/ofertas', 'https://www.ligier.com.ar/promociones'] },
  { name: 'Espacio de Vinos', websiteUrl: 'https://www.espaciovinos.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.espaciovinos.com.ar/ofertas'] },
  { name: 'Cervezas Patagonia', websiteUrl: 'https://www.cervezapatagonia.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.cervezapatagonia.com.ar/promociones'] },
  { name: 'Almacén de Pizzas', websiteUrl: 'https://www.almacendepizzas.com', categorySlug: 'gida-market', seedUrls: ['https://www.almacendepizzas.com/promociones'] },
  { name: 'Farmland', websiteUrl: 'https://www.farmland.com.ar', categorySlug: 'gida-market', seedUrls: ['https://www.farmland.com.ar/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Drink (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Rappi AR', websiteUrl: 'https://www.rappi.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.rappi.com.ar/promociones', 'https://www.rappi.com.ar/ofertas'] },
  { name: 'PedidosYa', websiteUrl: 'https://www.pedidosya.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.pedidosya.com.ar/ofertas', 'https://www.pedidosya.com.ar/promociones'] },
  { name: 'McDonald\'s AR', websiteUrl: 'https://www.mcdonalds.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com.ar/promociones', 'https://www.mcdonalds.com.ar/ofertas'] },
  { name: 'Burger King AR', websiteUrl: 'https://www.burgerking.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.ar/promociones', 'https://www.burgerking.com.ar/ofertas'] },
  { name: 'Mostaza', websiteUrl: 'https://www.mostaza.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.mostaza.com.ar/promociones', 'https://www.mostaza.com.ar/ofertas'] },
  { name: 'Starbucks AR', websiteUrl: 'https://www.starbucks.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.ar/ofertas'] },
  { name: 'Havanna', websiteUrl: 'https://www.havanna.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.havanna.com.ar/promociones', 'https://www.havanna.com.ar/ofertas'] },
  { name: 'Café Martínez', websiteUrl: 'https://www.cafemartinez.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.cafemartinez.com/promociones'] },
  { name: 'Bonafide', websiteUrl: 'https://www.bonafide.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.bonafide.com.ar/promociones'] },
  { name: 'KFC AR', websiteUrl: 'https://www.kfc.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.com.ar/promociones', 'https://www.kfc.com.ar/ofertas'] },
  { name: 'Wendy\'s AR', websiteUrl: 'https://www.wendys.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.wendys.com.ar/promociones'] },
  { name: 'Subway AR', websiteUrl: 'https://www.subway.com/es-AR', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/es-AR/ofertas'] },
  { name: 'Pizza Hut AR', websiteUrl: 'https://www.pizzahut.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.ar/promociones'] },
  { name: 'Domino\'s AR', websiteUrl: 'https://www.dominos.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.ar/promociones'] },
  { name: 'Sushi Pop', websiteUrl: 'https://www.sushipop.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushipop.com.ar/promociones'] },
  { name: 'Freddo', websiteUrl: 'https://www.freddo.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.freddo.com.ar/promociones'] },
  { name: 'Chungo', websiteUrl: 'https://www.chungo.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.chungo.com.ar/promociones'] },
  { name: 'Persicco', websiteUrl: 'https://www.persicco.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.persicco.com/promociones'] },
  { name: 'Dean & Dennys', websiteUrl: 'https://www.deanydennys.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.deanydennys.com/promociones'] },
  { name: 'Kansas', websiteUrl: 'https://www.kansas.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.kansas.com.ar/promociones'] },
  { name: 'Lo de Jesús', websiteUrl: 'https://www.lodejesus.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.lodejesus.com.ar/promociones'] },
  { name: 'La Cabrera', websiteUrl: 'https://www.lacabrera.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.lacabrera.com.ar/promociones'] },
  { name: 'iFood AR', websiteUrl: 'https://www.ifood.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.ifood.com.ar/ofertas'] },
  { name: 'Glovo AR', websiteUrl: 'https://glovoapp.com/ar', categorySlug: 'yeme-icme', seedUrls: ['https://glovoapp.com/ar/es/promociones'] },
  { name: 'Wabi', websiteUrl: 'https://www.wabi2b.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.wabi2b.com/ofertas'] },
  { name: 'Cachafaz', websiteUrl: 'https://www.cachafaz.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.cachafaz.com.ar/promociones'] },
  { name: 'Mamá Lucchetti', websiteUrl: 'https://www.mamalucchetti.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.mamalucchetti.com.ar/promociones'] },
  { name: 'Tostado Café Club', websiteUrl: 'https://www.tostadocafeclub.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.tostadocafeclub.com.ar/promociones'] },
  { name: 'Le Pain Quotidien AR', websiteUrl: 'https://www.lepainquotidien.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.lepainquotidien.com.ar/promociones'] },
  { name: 'Sipan', websiteUrl: 'https://www.sipan.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.sipan.com.ar/promociones'] },
  { name: 'Pani', websiteUrl: 'https://www.pani.com.ar', categorySlug: 'yeme-icme', seedUrls: ['https://www.pani.com.ar/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Farmacity', websiteUrl: 'https://www.farmacity.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmacity.com/ofertas', 'https://www.farmacity.com/promociones'] },
  { name: 'Juleriaque', websiteUrl: 'https://www.juleriaque.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.juleriaque.com.ar/ofertas', 'https://www.juleriaque.com.ar/promociones'] },
  { name: 'Pigmento', websiteUrl: 'https://www.pigmento.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pigmento.com.ar/ofertas', 'https://www.pigmento.com.ar/sale'] },
  { name: 'Avon AR', websiteUrl: 'https://www.avon.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avon.com.ar/ofertas', 'https://www.avon.com.ar/promociones'] },
  { name: 'Natura AR', websiteUrl: 'https://www.natura.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.natura.com.ar/promociones', 'https://www.natura.com.ar/ofertas'] },
  { name: 'L\'Oréal AR', websiteUrl: 'https://www.loreal-paris.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.ar/ofertas'] },
  { name: 'Maybelline AR', websiteUrl: 'https://www.maybelline.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.ar/ofertas'] },
  { name: 'Revlon AR', websiteUrl: 'https://www.revlon.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.revlon.com.ar/ofertas'] },
  { name: 'MAC AR', websiteUrl: 'https://www.maccosmetics.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.ar/ofertas'] },
  { name: 'Clinique AR', websiteUrl: 'https://www.clinique.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.ar/ofertas'] },
  { name: 'Estée Lauder AR', websiteUrl: 'https://www.esteelauder.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.ar/ofertas'] },
  { name: 'Garnier AR', websiteUrl: 'https://www.garnier.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.com.ar/ofertas'] },
  { name: 'Dove AR', websiteUrl: 'https://www.dove.com/ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/ar/ofertas.html'] },
  { name: 'Nivea AR', websiteUrl: 'https://www.nivea.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.com.ar/ofertas'] },
  { name: 'La Roche-Posay AR', websiteUrl: 'https://www.laroche-posay.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.com.ar/ofertas'] },
  { name: 'Vichy AR', websiteUrl: 'https://www.vichy.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.com.ar/ofertas'] },
  { name: 'Eucerin AR', websiteUrl: 'https://www.eucerin.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eucerin.com.ar/ofertas'] },
  { name: 'Egle Moda', websiteUrl: 'https://www.eglemoda.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eglemoda.com.ar/ofertas'] },
  { name: 'Perfumerías Julián', websiteUrl: 'https://www.perfumeriasjulian.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.perfumeriasjulian.com.ar/ofertas', 'https://www.perfumeriasjulian.com.ar/promociones'] },
  { name: 'Gillette AR', websiteUrl: 'https://www.gillette.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.gillette.com.ar/ofertas'] },
  { name: 'Pantene AR', websiteUrl: 'https://www.pantene.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pantene.com.ar/ofertas'] },
  { name: 'Head & Shoulders AR', websiteUrl: 'https://www.headandshoulders.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.headandshoulders.com.ar/ofertas'] },
  { name: 'Sedal AR', websiteUrl: 'https://www.sedal.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sedal.com.ar/ofertas'] },
  { name: 'Rexona AR', websiteUrl: 'https://www.rexona.com/ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rexona.com/ar/ofertas'] },
  { name: 'Carolina Herrera AR', websiteUrl: 'https://www.carolinaherrera.com/ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.carolinaherrera.com/ar/ofertas'] },
  { name: 'Isadora', websiteUrl: 'https://www.isadora.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.isadora.com.ar/ofertas'] },
  { name: 'Monique Arnold', websiteUrl: 'https://www.moniquearnold.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.moniquearnold.com.ar/ofertas'] },
  { name: 'Dermaglós', websiteUrl: 'https://www.dermaglos.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dermaglos.com.ar/promociones'] },
  { name: 'Bardot', websiteUrl: 'https://www.bardot.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bardot.com.ar/ofertas'] },
  { name: 'Lidherma', websiteUrl: 'https://www.lidherma.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lidherma.com.ar/ofertas', 'https://www.lidherma.com.ar/promociones'] },
  { name: 'Bioderma AR', websiteUrl: 'https://www.bioderma.com.ar', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.com.ar/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Dexter', websiteUrl: 'https://www.dexter.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.dexter.com.ar/ofertas', 'https://www.dexter.com.ar/sale'] },
  { name: 'Nike AR', websiteUrl: 'https://www.nike.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com.ar/sale', 'https://www.nike.com.ar/ofertas'] },
  { name: 'Adidas AR', websiteUrl: 'https://www.adidas.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.com.ar/sale', 'https://www.adidas.com.ar/ofertas'] },
  { name: 'Fila AR', websiteUrl: 'https://www.fila.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.com.ar/sale', 'https://www.fila.com.ar/ofertas'] },
  { name: 'Topper', websiteUrl: 'https://www.topper.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.topper.com.ar/sale', 'https://www.topper.com.ar/ofertas'] },
  { name: 'Open Sports', websiteUrl: 'https://www.opensports.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.opensports.com.ar/ofertas', 'https://www.opensports.com.ar/promociones'] },
  { name: 'Netshoes AR', websiteUrl: 'https://www.netshoes.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.netshoes.com.ar/ofertas', 'https://www.netshoes.com.ar/promociones'] },
  { name: 'Decathlon AR', websiteUrl: 'https://www.decathlon.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.com.ar/ofertas', 'https://www.decathlon.com.ar/rebajas'] },
  { name: 'Puma AR', websiteUrl: 'https://www.puma.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.puma.com.ar/sale', 'https://www.puma.com.ar/ofertas'] },
  { name: 'Reebok AR', websiteUrl: 'https://www.reebok.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com.ar/sale', 'https://www.reebok.com.ar/ofertas'] },
  { name: 'New Balance AR', websiteUrl: 'https://www.newbalance.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.ar/sale'] },
  { name: 'Under Armour AR', websiteUrl: 'https://www.underarmour.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.ar/sale', 'https://www.underarmour.com.ar/ofertas'] },
  { name: 'Converse AR', websiteUrl: 'https://www.converse.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com.ar/sale'] },
  { name: 'Vans AR', websiteUrl: 'https://www.vans.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.com.ar/sale'] },
  { name: 'Montagne', websiteUrl: 'https://www.montagne.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.montagne.com.ar/sale', 'https://www.montagne.com.ar/ofertas'] },
  { name: 'Salomon AR', websiteUrl: 'https://www.salomon.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com.ar/sale'] },
  { name: 'Columbia AR', websiteUrl: 'https://www.columbia.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.com.ar/sale'] },
  { name: 'The North Face AR', websiteUrl: 'https://www.thenorthface.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.ar/sale'] },
  { name: 'Merrell AR', websiteUrl: 'https://www.merrell.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.com.ar/sale'] },
  { name: 'Skechers AR', websiteUrl: 'https://www.skechers.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.ar/sale', 'https://www.skechers.com.ar/ofertas'] },
  { name: 'Asics AR', websiteUrl: 'https://www.asics.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com.ar/sale'] },
  { name: 'Rip Curl AR', websiteUrl: 'https://www.ripcurl.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ripcurl.com.ar/sale'] },
  { name: 'Quiksilver AR', websiteUrl: 'https://www.quiksilver.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.quiksilver.com.ar/sale'] },
  { name: 'DC Shoes AR', websiteUrl: 'https://www.dcshoes.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.dcshoes.com.ar/sale'] },
  { name: 'Reef AR', websiteUrl: 'https://www.reef.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reef.com.ar/sale'] },
  { name: 'Le Coq Sportif AR', websiteUrl: 'https://www.lecoqsportif.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lecoqsportif.com.ar/sale'] },
  { name: 'Rusty AR', websiteUrl: 'https://www.rusty.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.rusty.com.ar/sale'] },
  { name: 'Diadora AR', websiteUrl: 'https://www.diadora.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.diadora.com.ar/sale'] },
  { name: 'Umbro AR', websiteUrl: 'https://www.umbro.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.umbro.com.ar/sale'] },
  { name: 'Kappa AR', websiteUrl: 'https://www.kappa.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.kappa.com.ar/sale'] },
  { name: 'Solo Deportes', websiteUrl: 'https://www.solodeportes.com.ar', categorySlug: 'spor-outdoor', seedUrls: ['https://www.solodeportes.com.ar/ofertas', 'https://www.solodeportes.com.ar/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Aerolíneas Argentinas', websiteUrl: 'https://www.aerolineas.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.aerolineas.com.ar/ofertas', 'https://www.aerolineas.com.ar/promociones'] },
  { name: 'FlyBondi', websiteUrl: 'https://www.flybondi.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flybondi.com/ar/ofertas', 'https://www.flybondi.com/ar/promociones'] },
  { name: 'JetSmart AR', websiteUrl: 'https://www.jetsmart.com/ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jetsmart.com/ar/ofertas', 'https://www.jetsmart.com/ar/promociones'] },
  { name: 'Despegar', websiteUrl: 'https://www.despegar.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.despegar.com.ar/ofertas', 'https://www.despegar.com.ar/promociones'] },
  { name: 'Almundo', websiteUrl: 'https://www.almundo.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.almundo.com.ar/ofertas', 'https://www.almundo.com.ar/promociones'] },
  { name: 'Buquebús', websiteUrl: 'https://www.buquebus.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.buquebus.com.ar/ofertas', 'https://www.buquebus.com.ar/promociones'] },
  { name: 'Booking AR', websiteUrl: 'https://www.booking.com/country/ar.html', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.html?cc1=ar'] },
  { name: 'LATAM AR', websiteUrl: 'https://www.latamairlines.com/ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.latamairlines.com/ar/es/ofertas'] },
  { name: 'Avantrip', websiteUrl: 'https://www.avantrip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avantrip.com/ofertas', 'https://www.avantrip.com/promociones'] },
  { name: 'Turismocity', websiteUrl: 'https://www.turismocity.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.turismocity.com.ar/ofertas'] },
  { name: 'Airbnb AR', websiteUrl: 'https://www.airbnb.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.com.ar/'] },
  { name: 'Expedia AR', websiteUrl: 'https://www.expedia.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.ar/ofertas'] },
  { name: 'Kayak AR', websiteUrl: 'https://www.kayak.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.com.ar/ofertas'] },
  { name: 'Copa Airlines AR', websiteUrl: 'https://www.copaair.com/es-ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.copaair.com/es-ar/ofertas'] },
  { name: 'Gol AR', websiteUrl: 'https://www.voegol.com.br/es-ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.voegol.com.br/es-ar/ofertas'] },
  { name: 'Uber AR', websiteUrl: 'https://www.uber.com/ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/ar/es/ride/'] },
  { name: 'Cabify AR', websiteUrl: 'https://cabify.com/es-AR', categorySlug: 'seyahat-ulasim', seedUrls: ['https://cabify.com/es-AR/promociones'] },
  { name: 'DiDi AR', websiteUrl: 'https://www.didiglobal.com/ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.didiglobal.com/ar/ofertas'] },
  { name: 'Europcar AR', websiteUrl: 'https://www.europcar.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.com.ar/ofertas'] },
  { name: 'Hertz AR', websiteUrl: 'https://www.hertz.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.com.ar/promociones'] },
  { name: 'Localiza AR', websiteUrl: 'https://www.localiza.com/argentina', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.localiza.com/argentina/es-ar/ofertas'] },
  { name: 'Plataforma 10', websiteUrl: 'https://www.plataforma10.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.plataforma10.com.ar/ofertas', 'https://www.plataforma10.com.ar/promociones'] },
  { name: 'Central de Pasajes', websiteUrl: 'https://www.centraldepasajes.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.centraldepasajes.com.ar/ofertas'] },
  { name: 'Flecha Bus', websiteUrl: 'https://www.flechabus.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flechabus.com.ar/ofertas', 'https://www.flechabus.com.ar/promociones'] },
  { name: 'Via Bariloche', websiteUrl: 'https://www.viabariloche.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.viabariloche.com.ar/ofertas'] },
  { name: 'Andesmar', websiteUrl: 'https://www.andesmar.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.andesmar.com/ofertas'] },
  { name: 'Trenes Argentinos', websiteUrl: 'https://www.argentina.gob.ar/transporte/trenes-argentinos', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.argentina.gob.ar/transporte/trenes-argentinos'] },
  { name: 'Hotels.com AR', websiteUrl: 'https://ar.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://ar.hotels.com/deals'] },
  { name: 'Trivago AR', websiteUrl: 'https://www.trivago.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.com.ar/'] },
  { name: 'Smiles AR', websiteUrl: 'https://www.smiles.com.ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.smiles.com.ar/ofertas'] },
  { name: 'Assist Card', websiteUrl: 'https://www.assistcard.com/ar', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.assistcard.com/ar/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Banco Nación', websiteUrl: 'https://www.bna.com.ar', categorySlug: 'finans', seedUrls: ['https://www.bna.com.ar/Personas/Promociones', 'https://www.bna.com.ar/Personas/Beneficios'] },
  { name: 'Banco Galicia', websiteUrl: 'https://www.bancogalicia.com', categorySlug: 'finans', seedUrls: ['https://www.bancogalicia.com/personas/beneficios-y-promociones', 'https://www.bancogalicia.com/personas/beneficios'] },
  { name: 'Banco Santander AR', websiteUrl: 'https://www.santander.com.ar', categorySlug: 'finans', seedUrls: ['https://www.santander.com.ar/personas/beneficios', 'https://www.santander.com.ar/personas/promociones'] },
  { name: 'Mercado Pago', websiteUrl: 'https://www.mercadopago.com.ar', categorySlug: 'finans', seedUrls: ['https://www.mercadopago.com.ar/ofertas', 'https://www.mercadopago.com.ar/promociones'] },
  { name: 'Ualá', websiteUrl: 'https://www.uala.com.ar', categorySlug: 'finans', seedUrls: ['https://www.uala.com.ar/promociones', 'https://www.uala.com.ar/ofertas'] },
  { name: 'Brubank', websiteUrl: 'https://www.brubank.com.ar', categorySlug: 'finans', seedUrls: ['https://www.brubank.com.ar/promociones', 'https://www.brubank.com.ar/beneficios'] },
  { name: 'Naranja X', websiteUrl: 'https://www.naranjax.com', categorySlug: 'finans', seedUrls: ['https://www.naranjax.com/promociones', 'https://www.naranjax.com/beneficios'] },
  { name: 'BBVA AR', websiteUrl: 'https://www.bbva.com.ar', categorySlug: 'finans', seedUrls: ['https://www.bbva.com.ar/personas/beneficios.html', 'https://www.bbva.com.ar/personas/promociones.html'] },
  { name: 'Banco Provincia', websiteUrl: 'https://www.bancoprovincia.com.ar', categorySlug: 'finans', seedUrls: ['https://www.bancoprovincia.com.ar/web/beneficios', 'https://www.bancoprovincia.com.ar/web/promociones'] },
  { name: 'Banco Ciudad', websiteUrl: 'https://www.bancociudad.com.ar', categorySlug: 'finans', seedUrls: ['https://www.bancociudad.com.ar/institucional/beneficios', 'https://www.bancociudad.com.ar/institucional/promociones'] },
  { name: 'Banco Macro', websiteUrl: 'https://www.macro.com.ar', categorySlug: 'finans', seedUrls: ['https://www.macro.com.ar/personas/beneficios', 'https://www.macro.com.ar/personas/promociones'] },
  { name: 'Banco Patagonia', websiteUrl: 'https://www.bancopatagonia.com.ar', categorySlug: 'finans', seedUrls: ['https://www.bancopatagonia.com.ar/personas/beneficios'] },
  { name: 'HSBC AR', websiteUrl: 'https://www.hsbc.com.ar', categorySlug: 'finans', seedUrls: ['https://www.hsbc.com.ar/beneficios/', 'https://www.hsbc.com.ar/promociones/'] },
  { name: 'ICBC AR', websiteUrl: 'https://www.icbc.com.ar', categorySlug: 'finans', seedUrls: ['https://www.icbc.com.ar/personas/beneficios', 'https://www.icbc.com.ar/personas/promociones'] },
  { name: 'Banco Hipotecario', websiteUrl: 'https://www.hipotecario.com.ar', categorySlug: 'finans', seedUrls: ['https://www.hipotecario.com.ar/beneficios', 'https://www.hipotecario.com.ar/promociones'] },
  { name: 'Banco Supervielle', websiteUrl: 'https://www.supervielle.com.ar', categorySlug: 'finans', seedUrls: ['https://www.supervielle.com.ar/personas/beneficios', 'https://www.supervielle.com.ar/personas/promociones'] },
  { name: 'Banco Comafi', websiteUrl: 'https://www.comafi.com.ar', categorySlug: 'finans', seedUrls: ['https://www.comafi.com.ar/personas/beneficios'] },
  { name: 'Banco Credicoop', websiteUrl: 'https://www.bancocredicoop.coop', categorySlug: 'finans', seedUrls: ['https://www.bancocredicoop.coop/personas/beneficios'] },
  { name: 'Visa AR', websiteUrl: 'https://www.visa.com.ar', categorySlug: 'finans', seedUrls: ['https://www.visa.com.ar/ofertas-y-beneficios.html'] },
  { name: 'Mastercard AR', websiteUrl: 'https://www.mastercard.com.ar', categorySlug: 'finans', seedUrls: ['https://www.mastercard.com.ar/es-ar/consumers/offers-promotions.html'] },
  { name: 'American Express AR', websiteUrl: 'https://www.americanexpress.com/ar', categorySlug: 'finans', seedUrls: ['https://www.americanexpress.com/ar/beneficios/', 'https://www.americanexpress.com/ar/ofertas/'] },
  { name: 'Cabal', websiteUrl: 'https://www.cabal.coop', categorySlug: 'finans', seedUrls: ['https://www.cabal.coop/promociones'] },
  { name: 'Prex', websiteUrl: 'https://www.prex.com.ar', categorySlug: 'finans', seedUrls: ['https://www.prex.com.ar/promociones'] },
  { name: 'Personal Pay', websiteUrl: 'https://www.personalpay.com.ar', categorySlug: 'finans', seedUrls: ['https://www.personalpay.com.ar/beneficios', 'https://www.personalpay.com.ar/promociones'] },
  { name: 'Lemon Cash', websiteUrl: 'https://www.lemon.me', categorySlug: 'finans', seedUrls: ['https://www.lemon.me/promociones'] },
  { name: 'Belo', websiteUrl: 'https://www.belo.app', categorySlug: 'finans', seedUrls: ['https://www.belo.app/promociones'] },
  { name: 'Buenbit', websiteUrl: 'https://www.buenbit.com', categorySlug: 'finans', seedUrls: ['https://www.buenbit.com/promociones'] },
  { name: 'Ripio', websiteUrl: 'https://www.ripio.com/ar', categorySlug: 'finans', seedUrls: ['https://www.ripio.com/ar/promociones'] },
  { name: 'Banco San Juan', websiteUrl: 'https://www.bancosanjuan.com', categorySlug: 'finans', seedUrls: ['https://www.bancosanjuan.com/beneficios'] },
  { name: 'Banco de Córdoba', websiteUrl: 'https://www.bancor.com.ar', categorySlug: 'finans', seedUrls: ['https://www.bancor.com.ar/personas/beneficios'] },
  { name: 'Banco del Sol', websiteUrl: 'https://www.bancosol.com.ar', categorySlug: 'finans', seedUrls: ['https://www.bancosol.com.ar/beneficios'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'La Caja Seguros', websiteUrl: 'https://www.lacaja.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.lacaja.com.ar/promociones', 'https://www.lacaja.com.ar/ofertas'] },
  { name: 'Zurich AR', websiteUrl: 'https://www.zurich.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.com.ar/es-ar/promociones'] },
  { name: 'Sancor Seguros', websiteUrl: 'https://www.sancorseguros.com', categorySlug: 'sigorta', seedUrls: ['https://www.sancorseguros.com/ar/promociones', 'https://www.sancorseguros.com/ar/beneficios'] },
  { name: 'La Segunda', websiteUrl: 'https://www.lasegunda.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.lasegunda.com.ar/promociones', 'https://www.lasegunda.com.ar/beneficios'] },
  { name: 'MAPFRE AR', websiteUrl: 'https://www.mapfre.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.mapfre.com.ar/promociones'] },
  { name: 'Allianz AR', websiteUrl: 'https://www.allianz.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.com.ar/es_AR/ofertas.html'] },
  { name: 'Federación Patronal', websiteUrl: 'https://www.fedpat.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.fedpat.com.ar/promociones'] },
  { name: 'Meridional Seguros', websiteUrl: 'https://www.meridional.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.meridional.com.ar/promociones'] },
  { name: 'SMG Seguros', websiteUrl: 'https://www.smgseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.smgseguros.com.ar/promociones'] },
  { name: 'Rivadavia Seguros', websiteUrl: 'https://www.rivadaviaseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.rivadaviaseguros.com.ar/promociones'] },
  { name: 'Provincia Seguros', websiteUrl: 'https://www.provinciaseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.provinciaseguros.com.ar/promociones'] },
  { name: 'San Cristóbal Seguros', websiteUrl: 'https://www.sancristobalseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.sancristobalseguros.com.ar/promociones', 'https://www.sancristobalseguros.com.ar/beneficios'] },
  { name: 'Nación Seguros', websiteUrl: 'https://www.nacion-seguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.nacion-seguros.com.ar/promociones'] },
  { name: 'Chubb AR', websiteUrl: 'https://www.chubb.com/ar-es', categorySlug: 'sigorta', seedUrls: ['https://www.chubb.com/ar-es/ofertas.html'] },
  { name: 'HDI Seguros AR', websiteUrl: 'https://www.hdi.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.hdi.com.ar/promociones'] },
  { name: 'Galeno Seguros', websiteUrl: 'https://www.galenoseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.galenoseguros.com.ar/promociones'] },
  { name: 'OSDE', websiteUrl: 'https://www.osde.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.osde.com.ar/beneficios', 'https://www.osde.com.ar/promociones'] },
  { name: 'Swiss Medical', websiteUrl: 'https://www.swissmedical.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.swissmedical.com.ar/beneficios', 'https://www.swissmedical.com.ar/promociones'] },
  { name: 'Galeno', websiteUrl: 'https://www.galeno.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.galeno.com.ar/beneficios', 'https://www.galeno.com.ar/promociones'] },
  { name: 'Medifé', websiteUrl: 'https://www.medife.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.medife.com.ar/beneficios'] },
  { name: 'Omint', websiteUrl: 'https://www.omint.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.omint.com.ar/beneficios'] },
  { name: 'Accord Salud', websiteUrl: 'https://www.accordsalud.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.accordsalud.com.ar/beneficios'] },
  { name: 'Medicus', websiteUrl: 'https://www.medicus.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.medicus.com.ar/beneficios'] },
  { name: 'Prevención ART', websiteUrl: 'https://www.prevencionart.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.prevencionart.com.ar/promociones'] },
  { name: 'Experta ART', websiteUrl: 'https://www.experta-art.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.experta-art.com.ar/promociones'] },
  { name: 'Galicia Seguros', websiteUrl: 'https://www.galiciaseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.galiciaseguros.com.ar/promociones'] },
  { name: 'Integrity Seguros', websiteUrl: 'https://www.integrityseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.integrityseguros.com.ar/promociones'] },
  { name: 'Mercantil Andina', websiteUrl: 'https://www.mercantilandina.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.mercantilandina.com.ar/promociones'] },
  { name: 'Orbis Seguros', websiteUrl: 'https://www.orbisseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.orbisseguros.com.ar/promociones'] },
  { name: 'QBE Seguros', websiteUrl: 'https://www.qbe.com/ar', categorySlug: 'sigorta', seedUrls: ['https://www.qbe.com/ar/ofertas'] },
  { name: 'Triunfo Seguros', websiteUrl: 'https://www.triunfoseguros.com.ar', categorySlug: 'sigorta', seedUrls: ['https://www.triunfoseguros.com.ar/promociones'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota AR', websiteUrl: 'https://www.toyota.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.ar/promociones', 'https://www.toyota.com.ar/ofertas'] },
  { name: 'Volkswagen AR', websiteUrl: 'https://www.volkswagen.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.com.ar/es/ofertas.html', 'https://www.volkswagen.com.ar/es/promociones.html'] },
  { name: 'Fiat AR', websiteUrl: 'https://www.fiat.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.com.ar/ofertas', 'https://www.fiat.com.ar/promociones'] },
  { name: 'Chevrolet AR', websiteUrl: 'https://www.chevrolet.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.com.ar/ofertas', 'https://www.chevrolet.com.ar/promociones'] },
  { name: 'Ford AR', websiteUrl: 'https://www.ford.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.ford.com.ar/ofertas/', 'https://www.ford.com.ar/promociones/'] },
  { name: 'Peugeot AR', websiteUrl: 'https://www.peugeot.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.ar/ofertas.html', 'https://www.peugeot.com.ar/promociones.html'] },
  { name: 'Renault AR', websiteUrl: 'https://www.renault.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.renault.com.ar/ofertas.html', 'https://www.renault.com.ar/promociones.html'] },
  { name: 'Citroën AR', websiteUrl: 'https://www.citroen.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.com.ar/ofertas.html'] },
  { name: 'Nissan AR', websiteUrl: 'https://www.nissan.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.ar/ofertas.html', 'https://www.nissan.com.ar/promociones.html'] },
  { name: 'Honda AR', websiteUrl: 'https://www.honda.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.ar/ofertas', 'https://www.honda.com.ar/promociones'] },
  { name: 'Hyundai AR', websiteUrl: 'https://www.hyundai.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com.ar/ofertas', 'https://www.hyundai.com.ar/promociones'] },
  { name: 'Kia AR', websiteUrl: 'https://www.kia.com/ar', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/ar/ofertas/', 'https://www.kia.com/ar/promociones/'] },
  { name: 'Mercedes-Benz AR', websiteUrl: 'https://www.mercedes-benz.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.ar/passengercars/campaigns.html'] },
  { name: 'BMW AR', websiteUrl: 'https://www.bmw.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.ar/es/offers.html'] },
  { name: 'Audi AR', websiteUrl: 'https://www.audi.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.ar/ar/web/es/ofertas.html'] },
  { name: 'Jeep AR', websiteUrl: 'https://www.jeep.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.com.ar/ofertas', 'https://www.jeep.com.ar/promociones'] },
  { name: 'RAM AR', websiteUrl: 'https://www.ram.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.ram.com.ar/ofertas'] },
  { name: 'Suzuki AR', websiteUrl: 'https://www.suzuki.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.com.ar/ofertas'] },
  { name: 'Mitsubishi AR', websiteUrl: 'https://www.mitsubishi-motors.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.com.ar/ofertas'] },
  { name: 'Chery AR', websiteUrl: 'https://www.chery.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.chery.com.ar/ofertas', 'https://www.chery.com.ar/promociones'] },
  { name: 'GWM AR', websiteUrl: 'https://www.gwm.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.gwm.com.ar/ofertas'] },
  { name: 'Volvo AR', websiteUrl: 'https://www.volvocars.com/ar', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/ar/ofertas/'] },
  { name: 'Subaru AR', websiteUrl: 'https://www.subaru.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.com.ar/ofertas'] },
  { name: 'Iveco AR', websiteUrl: 'https://www.iveco.com/argentina', categorySlug: 'otomobil', seedUrls: ['https://www.iveco.com/argentina/promociones'] },
  { name: 'Scania AR', websiteUrl: 'https://www.scania.com/ar', categorySlug: 'otomobil', seedUrls: ['https://www.scania.com/ar/es/home/ofertas.html'] },
  { name: 'YPF', websiteUrl: 'https://www.ypf.com', categorySlug: 'otomobil', seedUrls: ['https://www.ypf.com/promociones', 'https://www.ypf.com/beneficios'] },
  { name: 'Shell AR', websiteUrl: 'https://www.shell.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.shell.com.ar/motoristas/promociones.html'] },
  { name: 'Axion Energy', websiteUrl: 'https://www.axionenergy.com', categorySlug: 'otomobil', seedUrls: ['https://www.axionenergy.com/promociones'] },
  { name: 'Bridgestone AR', websiteUrl: 'https://www.bridgestone.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestone.com.ar/es/promociones'] },
  { name: 'Pirelli AR', websiteUrl: 'https://www.pirelli.com/tyres/ar-es', categorySlug: 'otomobil', seedUrls: ['https://www.pirelli.com/tyres/ar-es/ofertas'] },
  { name: 'Michelin AR', websiteUrl: 'https://www.michelin.com.ar', categorySlug: 'otomobil', seedUrls: ['https://www.michelin.com.ar/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Cúspide', websiteUrl: 'https://www.cuspide.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cuspide.com/ofertas', 'https://www.cuspide.com/promociones'] },
  { name: 'El Ateneo', websiteUrl: 'https://www.elateneo.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.elateneo.com/ofertas', 'https://www.elateneo.com/promociones'] },
  { name: 'Librería Hernández', websiteUrl: 'https://www.libreriahernandez.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.libreriahernandez.com/ofertas'] },
  { name: 'Planeta AR', websiteUrl: 'https://www.planetadelibros.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.planetadelibros.com.ar/ofertas'] },
  { name: 'Librería Santa Fe', websiteUrl: 'https://www.lsf.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lsf.com.ar/ofertas'] },
  { name: 'Tematika', websiteUrl: 'https://www.tematika.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.tematika.com/ofertas'] },
  { name: 'BuscaLibre AR', websiteUrl: 'https://www.buscalibre.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.buscalibre.com.ar/ofertas'] },
  { name: 'SBS Librería', websiteUrl: 'https://www.sbs.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sbs.com.ar/ofertas'] },
  { name: 'Zivals', websiteUrl: 'https://www.zivals.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.zivals.com.ar/ofertas'] },
  { name: 'La Nación Tienda', websiteUrl: 'https://tienda.lanacion.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://tienda.lanacion.com.ar/ofertas'] },
  { name: 'Clarín 365', websiteUrl: 'https://365.clarin.com', categorySlug: 'kitap-hobi', seedUrls: ['https://365.clarin.com/ofertas', 'https://365.clarin.com/beneficios'] },
  { name: 'Netflix AR', websiteUrl: 'https://www.netflix.com/ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/ar/'] },
  { name: 'Disney+ AR', websiteUrl: 'https://www.disneyplus.com/ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/ar/'] },
  { name: 'HBO Max AR', websiteUrl: 'https://www.max.com/ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.max.com/ar/'] },
  { name: 'Spotify AR', websiteUrl: 'https://www.spotify.com/ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/ar/premium/'] },
  { name: 'Amazon Prime AR', websiteUrl: 'https://www.primevideo.com/region/ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.primevideo.com/region/ar/'] },
  { name: 'Star+ AR', websiteUrl: 'https://www.starplus.com/ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.starplus.com/ar/'] },
  { name: 'Paramount+ AR', websiteUrl: 'https://www.paramountplus.com/ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.paramountplus.com/ar/'] },
  { name: 'PlayStation AR', websiteUrl: 'https://store.playstation.com/es-ar', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/es-ar/category/ofertas'] },
  { name: 'Xbox AR', websiteUrl: 'https://www.xbox.com/es-AR', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/es-AR/games/sales-and-specials'] },
  { name: 'Nintendo AR', websiteUrl: 'https://www.nintendo.com/es-ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/es-ar/store/deals/'] },
  { name: 'Steam', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Lego AR', websiteUrl: 'https://www.lego.com/es-ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/es-ar/categories/sales-and-deals'] },
  { name: 'Duoplex', websiteUrl: 'https://www.duoplex.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.duoplex.com.ar/ofertas'] },
  { name: 'La Revistería', websiteUrl: 'https://www.larevisteria.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.larevisteria.com.ar/ofertas'] },
  { name: 'El Corte Inglés AR', websiteUrl: 'https://www.ticketek.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ticketek.com.ar/ofertas'] },
  { name: 'Ticketek', websiteUrl: 'https://www.ticketek.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ticketek.com.ar/promociones'] },
  { name: 'Eventbrite AR', websiteUrl: 'https://www.eventbrite.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.eventbrite.com.ar/d/argentina/ofertas/'] },
  { name: 'Fotocanvas', websiteUrl: 'https://www.fotocanvas.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.fotocanvas.com.ar/ofertas'] },
  { name: 'MercadoLibre Libros', websiteUrl: 'https://www.mercadolibre.com.ar', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mercadolibre.com.ar/ofertas#CATEGORY_ID=MLA3025'] },
  { name: 'Udemy AR', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=es&src=ukw&q=ofertas'] },
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
  console.log('=== AR Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'AR' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'AR', categoryId: category.id },
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
            market: 'AR',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'AR' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'AR', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active AR sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
