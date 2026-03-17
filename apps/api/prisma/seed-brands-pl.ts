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
  { name: 'Allegro', websiteUrl: 'https://www.allegro.pl', categorySlug: 'alisveris', seedUrls: ['https://www.allegro.pl/promocje', 'https://www.allegro.pl/wyprzedaz'] },
  { name: 'OLX', websiteUrl: 'https://www.olx.pl', categorySlug: 'alisveris', seedUrls: ['https://www.olx.pl/oferty/promocje/'] },
  { name: 'Empik', websiteUrl: 'https://www.empik.com', categorySlug: 'alisveris', seedUrls: ['https://www.empik.com/promocje', 'https://www.empik.com/wyprzedaz'] },
  { name: 'MediaMarkt', websiteUrl: 'https://mediamarkt.pl', categorySlug: 'alisveris', seedUrls: ['https://mediamarkt.pl/promocje', 'https://mediamarkt.pl/wyprzedaz'] },
  { name: 'RTV Euro AGD', websiteUrl: 'https://www.euro.com.pl', categorySlug: 'alisveris', seedUrls: ['https://www.euro.com.pl/promocje.bhtml', 'https://www.euro.com.pl/wyprzedaz.bhtml'] },
  { name: 'Morele.net', websiteUrl: 'https://www.morele.net', categorySlug: 'alisveris', seedUrls: ['https://www.morele.net/promocje/', 'https://www.morele.net/wyprzedaz/'] },
  { name: 'X-Kom', websiteUrl: 'https://www.x-kom.pl', categorySlug: 'alisveris', seedUrls: ['https://www.x-kom.pl/promocje/', 'https://www.x-kom.pl/goracy-strzal/'] },
  { name: 'Komputronik', websiteUrl: 'https://www.komputronik.pl', categorySlug: 'alisveris', seedUrls: ['https://www.komputronik.pl/promocje/', 'https://www.komputronik.pl/wyprzedaz/'] },
  { name: 'Ceneo', websiteUrl: 'https://www.ceneo.pl', categorySlug: 'alisveris', seedUrls: ['https://www.ceneo.pl/Okazje'] },
  { name: 'Pepper.pl', websiteUrl: 'https://www.pepper.pl', categorySlug: 'alisveris', seedUrls: ['https://www.pepper.pl/', 'https://www.pepper.pl/grupa/technologia'] },
  { name: 'Amazon PL', websiteUrl: 'https://www.amazon.pl', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.pl/deals', 'https://www.amazon.pl/gp/goldbox'] },
  { name: 'AliExpress PL', websiteUrl: 'https://pl.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://pl.aliexpress.com/wholesale', 'https://sale.aliexpress.com/__pc/sale.htm'] },
  { name: 'Kaufland.pl', websiteUrl: 'https://www.kaufland.pl', categorySlug: 'alisveris', seedUrls: ['https://www.kaufland.pl/oferty.html'] },
  { name: 'Shopee PL', websiteUrl: 'https://shopee.pl', categorySlug: 'alisveris', seedUrls: ['https://shopee.pl/flash_sale', 'https://shopee.pl/daily_discover'] },
  { name: 'Temu PL', websiteUrl: 'https://www.temu.com/pl', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/pl/channel/best-sellers.html'] },
  { name: 'Action', websiteUrl: 'https://www.action.com/pl-pl', categorySlug: 'alisveris', seedUrls: ['https://www.action.com/pl-pl/oferty/'] },
  { name: 'Pepco', websiteUrl: 'https://pepco.pl', categorySlug: 'alisveris', seedUrls: ['https://pepco.pl/gazetka/', 'https://pepco.pl/promocje/'] },
  { name: 'KiK', websiteUrl: 'https://www.kik.pl', categorySlug: 'alisveris', seedUrls: ['https://www.kik.pl/oferty/'] },
  { name: 'Jysk', websiteUrl: 'https://jysk.pl', categorySlug: 'alisveris', seedUrls: ['https://jysk.pl/promocje', 'https://jysk.pl/wyprzedaz'] },
  { name: 'TK Maxx', websiteUrl: 'https://www.tkmaxx.pl', categorySlug: 'alisveris', seedUrls: ['https://www.tkmaxx.pl/wyprzedaz'] },
  { name: 'Rossnet', websiteUrl: 'https://www.rossnet.pl', categorySlug: 'alisveris', seedUrls: ['https://www.rossnet.pl/gazetka/'] },
  { name: 'Groupon PL', websiteUrl: 'https://www.groupon.pl', categorySlug: 'alisveris', seedUrls: ['https://www.groupon.pl/'] },
  { name: 'Picodi', websiteUrl: 'https://www.picodi.com/pl', categorySlug: 'alisveris', seedUrls: ['https://www.picodi.com/pl/'] },
  { name: 'Okazje.info', websiteUrl: 'https://www.okazje.info.pl', categorySlug: 'alisveris', seedUrls: ['https://www.okazje.info.pl/'] },
  { name: 'Mall.pl', websiteUrl: 'https://www.mall.pl', categorySlug: 'alisveris', seedUrls: ['https://www.mall.pl/wyprzedaz/'] },
  { name: 'Avans', websiteUrl: 'https://www.avans.pl', categorySlug: 'alisveris', seedUrls: ['https://www.avans.pl/promocje', 'https://www.avans.pl/wyprzedaz'] },
  { name: 'Neonet', websiteUrl: 'https://www.neonet.pl', categorySlug: 'alisveris', seedUrls: ['https://www.neonet.pl/promocje.html', 'https://www.neonet.pl/wyprzedaz.html'] },
  { name: 'MaxElektro', websiteUrl: 'https://www.maxelektro.pl', categorySlug: 'alisveris', seedUrls: ['https://www.maxelektro.pl/promocje/', 'https://www.maxelektro.pl/gazetka/'] },
  { name: 'Electro.pl', websiteUrl: 'https://www.electro.pl', categorySlug: 'alisveris', seedUrls: ['https://www.electro.pl/promocje/', 'https://www.electro.pl/wyprzedaz/'] },
  { name: 'Vobis', websiteUrl: 'https://www.vobis.pl', categorySlug: 'alisveris', seedUrls: ['https://www.vobis.pl/promocje/'] },
  { name: 'Proline', websiteUrl: 'https://proline.pl', categorySlug: 'alisveris', seedUrls: ['https://proline.pl/promocje/'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung PL', websiteUrl: 'https://www.samsung.com/pl', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/pl/offer/', 'https://www.samsung.com/pl/smartphones/all-smartphones/'] },
  { name: 'Apple PL', websiteUrl: 'https://www.apple.com/pl', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/pl/shop/go/special_deals'] },
  { name: 'Xiaomi PL', websiteUrl: 'https://www.mi.com/pl', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/pl/sale', 'https://www.mi.com/pl/promotion'] },
  { name: 'Huawei PL', websiteUrl: 'https://consumer.huawei.com/pl', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/pl/offer/'] },
  { name: 'LG PL', websiteUrl: 'https://www.lg.com/pl', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/pl/promocje'] },
  { name: 'Sony PL', websiteUrl: 'https://www.sony.pl', categorySlug: 'elektronik', seedUrls: ['https://www.sony.pl/electronics/promocje'] },
  { name: 'Philips PL', websiteUrl: 'https://www.philips.pl', categorySlug: 'elektronik', seedUrls: ['https://www.philips.pl/c-e/promocje'] },
  { name: 'Lenovo PL', websiteUrl: 'https://www.lenovo.com/pl/pl', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/pl/pl/d/deals/'] },
  { name: 'HP PL', websiteUrl: 'https://www.hp.com/pl-pl', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/pl-pl/shop/offer.aspx'] },
  { name: 'Dell PL', websiteUrl: 'https://www.dell.com/pl-pl', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/pl-pl/shop/deals'] },
  { name: 'Asus PL', websiteUrl: 'https://www.asus.com/pl', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/pl/campaign/'] },
  { name: 'Acer PL', websiteUrl: 'https://store.acer.com/pl-pl', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/pl-pl/deals'] },
  { name: 'MSI PL', websiteUrl: 'https://pl.msi.com', categorySlug: 'elektronik', seedUrls: ['https://pl.msi.com/Promotion/'] },
  { name: 'Canon PL', websiteUrl: 'https://www.canon.pl', categorySlug: 'elektronik', seedUrls: ['https://www.canon.pl/deals/'] },
  { name: 'Nikon PL', websiteUrl: 'https://www.nikon.pl', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.pl/pl_PL/promotions.page'] },
  { name: 'Logitech PL', websiteUrl: 'https://www.logitech.com/pl-pl', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/pl-pl/promo.html'] },
  { name: 'T-Mobile PL', websiteUrl: 'https://www.t-mobile.pl', categorySlug: 'elektronik', seedUrls: ['https://www.t-mobile.pl/promocje', 'https://www.t-mobile.pl/oferta-specjalna'] },
  { name: 'Orange PL', websiteUrl: 'https://www.orange.pl', categorySlug: 'elektronik', seedUrls: ['https://www.orange.pl/oferta/promocje'] },
  { name: 'Play', websiteUrl: 'https://www.play.pl', categorySlug: 'elektronik', seedUrls: ['https://www.play.pl/oferta/promocje/'] },
  { name: 'Plus', websiteUrl: 'https://www.plus.pl', categorySlug: 'elektronik', seedUrls: ['https://www.plus.pl/promocje'] },
  { name: 'UPC Polska', websiteUrl: 'https://www.upc.pl', categorySlug: 'elektronik', seedUrls: ['https://www.upc.pl/oferta/promocje/'] },
  { name: 'Bose PL', websiteUrl: 'https://www.bose.pl', categorySlug: 'elektronik', seedUrls: ['https://www.bose.pl/pl_pl/deals.html'] },
  { name: 'JBL PL', websiteUrl: 'https://pl.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://pl.jbl.com/wyprzedaz/'] },
  { name: 'Dyson PL', websiteUrl: 'https://www.dyson.pl', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.pl/promocje', 'https://www.dyson.pl/outlet'] },
  { name: 'Electrolux PL', websiteUrl: 'https://www.electrolux.pl', categorySlug: 'elektronik', seedUrls: ['https://www.electrolux.pl/promocje/'] },
  { name: 'Bosch PL', websiteUrl: 'https://www.bosch-home.pl', categorySlug: 'elektronik', seedUrls: ['https://www.bosch-home.pl/promocje'] },
  { name: 'Whirlpool PL', websiteUrl: 'https://www.whirlpool.pl', categorySlug: 'elektronik', seedUrls: ['https://www.whirlpool.pl/promocje'] },
  { name: 'TCL PL', websiteUrl: 'https://www.tcl.com/pl', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/pl/pl/promotions'] },
  { name: 'Hisense PL', websiteUrl: 'https://www.hisense.pl', categorySlug: 'elektronik', seedUrls: ['https://www.hisense.pl/promocje'] },
  { name: 'GoPro PL', websiteUrl: 'https://gopro.com/pl/pl', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/pl/pl/deals'] },
  { name: 'Razer PL', websiteUrl: 'https://www.razer.com/pl-pl', categorySlug: 'elektronik', seedUrls: ['https://www.razer.com/pl-pl/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Reserved', websiteUrl: 'https://www.reserved.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.reserved.com/pl/pl/sale', 'https://www.reserved.com/pl/pl/wyprzedaz'] },
  { name: 'Mohito', websiteUrl: 'https://www.mohito.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.mohito.com/pl/pl/sale', 'https://www.mohito.com/pl/pl/wyprzedaz'] },
  { name: 'Cropp', websiteUrl: 'https://www.cropp.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.cropp.com/pl/pl/sale', 'https://www.cropp.com/pl/pl/wyprzedaz'] },
  { name: 'House', websiteUrl: 'https://www.housebrand.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.housebrand.com/pl/pl/sale', 'https://www.housebrand.com/pl/pl/wyprzedaz'] },
  { name: 'Sinsay', websiteUrl: 'https://www.sinsay.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.sinsay.com/pl/pl/sale', 'https://www.sinsay.com/pl/pl/wyprzedaz'] },
  { name: 'CCC', websiteUrl: 'https://ccc.eu/pl', categorySlug: 'giyim-moda', seedUrls: ['https://ccc.eu/pl/wyprzedaz', 'https://ccc.eu/pl/promocje'] },
  { name: 'Eobuwie', websiteUrl: 'https://www.eobuwie.com.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.eobuwie.com.pl/wyprzedaz', 'https://www.eobuwie.com.pl/promocje'] },
  { name: 'Answear', websiteUrl: 'https://answear.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://answear.com/pl/sale', 'https://answear.com/pl/promocje'] },
  { name: 'Modivo', websiteUrl: 'https://modivo.pl', categorySlug: 'giyim-moda', seedUrls: ['https://modivo.pl/wyprzedaz', 'https://modivo.pl/promocje'] },
  { name: 'Zalando PL', websiteUrl: 'https://www.zalando.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.zalando.pl/promo/', 'https://www.zalando.pl/wyprzedaz/'] },
  { name: 'H&M PL', websiteUrl: 'https://www2.hm.com/pl_pl', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/pl_pl/wyprzedaz.html'] },
  { name: 'Zara PL', websiteUrl: 'https://www.zara.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/pl/pl/wyprzedaz-l1702.html'] },
  { name: 'About You PL', websiteUrl: 'https://www.aboutyou.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.aboutyou.pl/wyprzedaz', 'https://www.aboutyou.pl/promocje'] },
  { name: 'Deichmann', websiteUrl: 'https://www.deichmann.com/pl-pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.deichmann.com/pl-pl/wyprzedaz/', 'https://www.deichmann.com/pl-pl/promocje/'] },
  { name: 'Wojas', websiteUrl: 'https://www.wojas.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.wojas.pl/wyprzedaz', 'https://www.wojas.pl/promocje'] },
  { name: 'Wólczanka', websiteUrl: 'https://www.wolczanka.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.wolczanka.pl/wyprzedaz/', 'https://www.wolczanka.pl/promocje/'] },
  { name: 'Vistula', websiteUrl: 'https://www.vistula.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.vistula.pl/sale/', 'https://www.vistula.pl/promocje/'] },
  { name: 'Bytom', websiteUrl: 'https://www.bytom.com.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.bytom.com.pl/sale/', 'https://www.bytom.com.pl/promocje/'] },
  { name: 'Diverse', websiteUrl: 'https://www.diverse.com.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.diverse.com.pl/wyprzedaz/', 'https://www.diverse.com.pl/sale/'] },
  { name: 'Medicine', websiteUrl: 'https://www.wearmedicine.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.wearmedicine.com/pl/sale', 'https://www.wearmedicine.com/pl/wyprzedaz'] },
  { name: 'Bershka PL', websiteUrl: 'https://www.bershka.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/pl/wyprzedaz-c0p0.html'] },
  { name: 'Pull&Bear PL', websiteUrl: 'https://www.pullandbear.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/pl/wyprzedaz-n6417.html'] },
  { name: 'Massimo Dutti PL', websiteUrl: 'https://www.massimodutti.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/pl/wyprzedaz-c0p0.html'] },
  { name: 'Mango PL', websiteUrl: 'https://shop.mango.com/pl', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/pl/sale'] },
  { name: 'New Yorker PL', websiteUrl: 'https://www.newyorker.de/pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.newyorker.de/pl/sale/'] },
  { name: 'Carry', websiteUrl: 'https://carry.pl', categorySlug: 'giyim-moda', seedUrls: ['https://carry.pl/wyprzedaz/', 'https://carry.pl/sale/'] },
  { name: 'Bonprix PL', websiteUrl: 'https://www.bonprix.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.bonprix.pl/kategoria/wyprzedaz/', 'https://www.bonprix.pl/kategoria/promocje/'] },
  { name: 'Top Secret', websiteUrl: 'https://www.topsecret.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.topsecret.pl/sale/', 'https://www.topsecret.pl/wyprzedaz/'] },
  { name: 'Quiosque', websiteUrl: 'https://www.quiosque.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.quiosque.pl/sale/', 'https://www.quiosque.pl/wyprzedaz/'] },
  { name: 'Big Star', websiteUrl: 'https://www.bigstar.pl', categorySlug: 'giyim-moda', seedUrls: ['https://www.bigstar.pl/sale/', 'https://www.bigstar.pl/wyprzedaz/'] },
  { name: 'Ochnik', websiteUrl: 'https://www.ochnik.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.ochnik.com/wyprzedaz', 'https://www.ochnik.com/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Biedronka', websiteUrl: 'https://www.biedronka.pl', categorySlug: 'gida-market', seedUrls: ['https://www.biedronka.pl/pl/gazetki-i-promocje', 'https://www.biedronka.pl/pl/promocje'] },
  { name: 'Lidl PL', websiteUrl: 'https://www.lidl.pl', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.pl/c/oferty/s10016478', 'https://www.lidl.pl/c/gazetka/s10016470'] },
  { name: 'Kaufland PL', websiteUrl: 'https://www.kaufland.pl', categorySlug: 'gida-market', seedUrls: ['https://www.kaufland.pl/oferty.html', 'https://www.kaufland.pl/oferty/gazetka.html'] },
  { name: 'Auchan PL', websiteUrl: 'https://www.auchan.pl', categorySlug: 'gida-market', seedUrls: ['https://www.auchan.pl/promocje', 'https://www.auchan.pl/gazetka/'] },
  { name: 'Carrefour PL', websiteUrl: 'https://www.carrefour.pl', categorySlug: 'gida-market', seedUrls: ['https://www.carrefour.pl/promocje', 'https://www.carrefour.pl/gazetka'] },
  { name: 'Żabka', websiteUrl: 'https://www.zabka.pl', categorySlug: 'gida-market', seedUrls: ['https://www.zabka.pl/promocje', 'https://www.zabka.pl/oferty'] },
  { name: 'Dino', websiteUrl: 'https://www.marketdino.pl', categorySlug: 'gida-market', seedUrls: ['https://www.marketdino.pl/gazetki/', 'https://www.marketdino.pl/promocje/'] },
  { name: 'Netto PL', websiteUrl: 'https://www.netto.pl', categorySlug: 'gida-market', seedUrls: ['https://www.netto.pl/oferty/', 'https://www.netto.pl/gazetka/'] },
  { name: 'Stokrotka', websiteUrl: 'https://www.stokrotka.pl', categorySlug: 'gida-market', seedUrls: ['https://www.stokrotka.pl/gazetki/', 'https://www.stokrotka.pl/promocje/'] },
  { name: 'Intermarché PL', websiteUrl: 'https://www.intermarche.pl', categorySlug: 'gida-market', seedUrls: ['https://www.intermarche.pl/gazetka/', 'https://www.intermarche.pl/promocje/'] },
  { name: 'Aldi PL', websiteUrl: 'https://www.aldi.pl', categorySlug: 'gida-market', seedUrls: ['https://www.aldi.pl/oferty.html', 'https://www.aldi.pl/promocje.html'] },
  { name: 'Polomarket', websiteUrl: 'https://www.polomarket.pl', categorySlug: 'gida-market', seedUrls: ['https://www.polomarket.pl/gazetki/', 'https://www.polomarket.pl/promocje/'] },
  { name: 'Lewiatan', websiteUrl: 'https://www.lewiatan.pl', categorySlug: 'gida-market', seedUrls: ['https://www.lewiatan.pl/gazetka/', 'https://www.lewiatan.pl/promocje/'] },
  { name: 'Delikatesy Centrum', websiteUrl: 'https://www.delikatesycentrum.pl', categorySlug: 'gida-market', seedUrls: ['https://www.delikatesycentrum.pl/gazetka/', 'https://www.delikatesycentrum.pl/promocje/'] },
  { name: 'Freshmarket', websiteUrl: 'https://www.freshmarket.pl', categorySlug: 'gida-market', seedUrls: ['https://www.freshmarket.pl/gazetki/', 'https://www.freshmarket.pl/promocje/'] },
  { name: 'Makro PL', websiteUrl: 'https://www.makro.pl', categorySlug: 'gida-market', seedUrls: ['https://www.makro.pl/oferty', 'https://www.makro.pl/promocje'] },
  { name: 'Selgros PL', websiteUrl: 'https://www.selgros.pl', categorySlug: 'gida-market', seedUrls: ['https://www.selgros.pl/oferty/', 'https://www.selgros.pl/gazetka/'] },
  { name: 'Frisco.pl', websiteUrl: 'https://www.frisco.pl', categorySlug: 'gida-market', seedUrls: ['https://www.frisco.pl/stn,promocje'] },
  { name: 'Barbora', websiteUrl: 'https://barbora.pl', categorySlug: 'gida-market', seedUrls: ['https://barbora.pl/promocje'] },
  { name: 'E.Leclerc PL', websiteUrl: 'https://www.leclerc.pl', categorySlug: 'gida-market', seedUrls: ['https://www.leclerc.pl/gazetka/', 'https://www.leclerc.pl/promocje/'] },
  { name: 'Chata Polska', websiteUrl: 'https://www.chatapolska.pl', categorySlug: 'gida-market', seedUrls: ['https://www.chatapolska.pl/gazetka/', 'https://www.chatapolska.pl/promocje/'] },
  { name: 'Topaz', websiteUrl: 'https://topaz24.pl', categorySlug: 'gida-market', seedUrls: ['https://topaz24.pl/gazetki/', 'https://topaz24.pl/promocje/'] },
  { name: 'Piotr i Paweł', websiteUrl: 'https://www.piotripawel.pl', categorySlug: 'gida-market', seedUrls: ['https://www.piotripawel.pl/gazetka/', 'https://www.piotripawel.pl/promocje/'] },
  { name: 'Społem', websiteUrl: 'https://www.spolem.org.pl', categorySlug: 'gida-market', seedUrls: ['https://www.spolem.org.pl/promocje/'] },
  { name: 'Mila', websiteUrl: 'https://www.mila.pl', categorySlug: 'gida-market', seedUrls: ['https://www.mila.pl/gazetka/', 'https://www.mila.pl/promocje/'] },
  { name: 'Duży Ben', websiteUrl: 'https://www.duzy-ben.pl', categorySlug: 'gida-market', seedUrls: ['https://www.duzy-ben.pl/gazetka/'] },
  { name: 'Organic Farma Zdrowia', websiteUrl: 'https://www.organicmarket.pl', categorySlug: 'gida-market', seedUrls: ['https://www.organicmarket.pl/promocje/'] },
  { name: 'Spar PL', websiteUrl: 'https://www.spar.pl', categorySlug: 'gida-market', seedUrls: ['https://www.spar.pl/gazetka/', 'https://www.spar.pl/promocje/'] },
  { name: 'Euro Sklep', websiteUrl: 'https://eurosklep.com.pl', categorySlug: 'gida-market', seedUrls: ['https://eurosklep.com.pl/gazetka/'] },
  { name: 'Hebe Market', websiteUrl: 'https://www.hebe.pl', categorySlug: 'gida-market', seedUrls: ['https://www.hebe.pl/gazetka/'] },
  { name: 'Dealz PL', websiteUrl: 'https://www.dealz.pl', categorySlug: 'gida-market', seedUrls: ['https://www.dealz.pl/oferty/', 'https://www.dealz.pl/gazetka/'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Drink (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Pyszne.pl', websiteUrl: 'https://www.pyszne.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.pyszne.pl/promocje', 'https://www.pyszne.pl/kupony'] },
  { name: 'Glovo PL', websiteUrl: 'https://glovoapp.com/pl', categorySlug: 'yeme-icme', seedUrls: ['https://glovoapp.com/pl/pl/warszawa/'] },
  { name: 'Uber Eats PL', websiteUrl: 'https://www.ubereats.com/pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/pl/deals'] },
  { name: 'Wolt PL', websiteUrl: 'https://wolt.com/pl/pol', categorySlug: 'yeme-icme', seedUrls: ['https://wolt.com/pl/pol/warszawa'] },
  { name: 'Bolt Food PL', websiteUrl: 'https://food.bolt.eu/pl-pl', categorySlug: 'yeme-icme', seedUrls: ['https://food.bolt.eu/pl-pl/'] },
  { name: 'KFC PL', websiteUrl: 'https://www.kfc.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.pl/promocje', 'https://www.kfc.pl/kupony'] },
  { name: 'McDonald\'s PL', websiteUrl: 'https://www.mcdonalds.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.pl/promocje', 'https://www.mcdonalds.pl/oferty'] },
  { name: 'Burger King PL', websiteUrl: 'https://burgerking.pl', categorySlug: 'yeme-icme', seedUrls: ['https://burgerking.pl/promocje', 'https://burgerking.pl/kupony'] },
  { name: 'Pizza Hut PL', websiteUrl: 'https://www.pizzahut.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.pl/promocje/'] },
  { name: 'Domino\'s PL', websiteUrl: 'https://www.dominospizza.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominospizza.pl/promocje', 'https://www.dominospizza.pl/kupony'] },
  { name: 'Starbucks PL', websiteUrl: 'https://www.starbucks.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.pl/promocje'] },
  { name: 'Costa Coffee PL', websiteUrl: 'https://www.costacoffee.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.costacoffee.pl/promocje'] },
  { name: 'Subway PL', websiteUrl: 'https://www.subway.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.pl/promocje'] },
  { name: 'Telepizza PL', websiteUrl: 'https://www.telepizza.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.telepizza.pl/promocje'] },
  { name: 'Da Grasso', websiteUrl: 'https://www.dagrasso.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.dagrasso.pl/promocje/'] },
  { name: 'Biesiadowo', websiteUrl: 'https://biesiadowo.pl', categorySlug: 'yeme-icme', seedUrls: ['https://biesiadowo.pl/promocje/'] },
  { name: 'North Fish', websiteUrl: 'https://www.northfish.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.northfish.pl/promocje/'] },
  { name: 'Sphinx', websiteUrl: 'https://www.sphinx.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.sphinx.pl/promocje/'] },
  { name: 'Bobby Burger', websiteUrl: 'https://www.bobbyburger.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.bobbyburger.pl/promocje/'] },
  { name: 'Salad Story', websiteUrl: 'https://www.saladstory.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.saladstory.com/promocje/'] },
  { name: 'Żywiec Zdrój', websiteUrl: 'https://www.zywiec-zdroj.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.zywiec-zdroj.pl/promocje/'] },
  { name: 'Tymbark', websiteUrl: 'https://www.tymbark.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.tymbark.com/promocje/'] },
  { name: 'Coca-Cola PL', websiteUrl: 'https://www.coca-cola.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.coca-cola.pl/promocje'] },
  { name: 'Red Bull PL', websiteUrl: 'https://www.redbull.com/pl-pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.redbull.com/pl-pl/'] },
  { name: 'Wedel', websiteUrl: 'https://www.wedel.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.wedel.pl/sklep/promocje'] },
  { name: 'Wawel', websiteUrl: 'https://www.wawel.com.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.wawel.com.pl/promocje/'] },
  { name: 'Grycan', websiteUrl: 'https://www.grycan.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.grycan.pl/promocje/'] },
  { name: 'Sushi Kushi', websiteUrl: 'https://www.sushikushi.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushikushi.pl/promocje/'] },
  { name: 'Green Caffè Nero', websiteUrl: 'https://greencaffenero.pl', categorySlug: 'yeme-icme', seedUrls: ['https://greencaffenero.pl/promocje/'] },
  { name: 'Sushi Master PL', websiteUrl: 'https://sushimaster.pl', categorySlug: 'yeme-icme', seedUrls: ['https://sushimaster.pl/promocje/'] },
  { name: 'MAX Premium Burgers', websiteUrl: 'https://www.maxpremiumburgers.pl', categorySlug: 'yeme-icme', seedUrls: ['https://www.maxpremiumburgers.pl/promocje/'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Rossmann PL', websiteUrl: 'https://www.rossmann.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rossmann.pl/promocje/', 'https://www.rossmann.pl/gazetka/'] },
  { name: 'Hebe', websiteUrl: 'https://www.hebe.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.hebe.pl/promocje/', 'https://www.hebe.pl/wyprzedaz/'] },
  { name: 'Sephora PL', websiteUrl: 'https://www.sephora.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.pl/sale/', 'https://www.sephora.pl/promocje/'] },
  { name: 'Douglas PL', websiteUrl: 'https://www.douglas.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.douglas.pl/pl/c/sale/01', 'https://www.douglas.pl/pl/c/promocje/01'] },
  { name: 'Notino PL', websiteUrl: 'https://www.notino.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.notino.pl/wyprzedaz/', 'https://www.notino.pl/promocje/'] },
  { name: 'Natura PL', websiteUrl: 'https://www.drogerienatura.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.drogerienatura.pl/promocje/', 'https://www.drogerienatura.pl/gazetka/'] },
  { name: 'SuperPharm', websiteUrl: 'https://www.superpharm.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.superpharm.pl/promocje/', 'https://www.superpharm.pl/gazetka/'] },
  { name: 'Kontigo', websiteUrl: 'https://kontigo.com.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://kontigo.com.pl/wyprzedaz/', 'https://kontigo.com.pl/promocje/'] },
  { name: 'Inglot', websiteUrl: 'https://www.inglot.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.inglot.pl/sale', 'https://www.inglot.pl/promocje'] },
  { name: 'Ziaja', websiteUrl: 'https://www.ziaja.com/pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ziaja.com/pl/promocje'] },
  { name: 'Bielenda', websiteUrl: 'https://bielenda.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://bielenda.com/promocje/'] },
  { name: 'AA Oceanic', websiteUrl: 'https://www.aa-cosmetics.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.aa-cosmetics.pl/promocje/'] },
  { name: 'Eveline Cosmetics', websiteUrl: 'https://www.eveline.eu', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eveline.eu/promocje/'] },
  { name: 'Lirene', websiteUrl: 'https://lirene.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://lirene.pl/promocje/'] },
  { name: 'Farmona', websiteUrl: 'https://www.farmona.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmona.pl/promocje/'] },
  { name: 'Barwa Cosmetics', websiteUrl: 'https://www.barwa.com.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.barwa.com.pl/promocje/'] },
  { name: 'Sylveco', websiteUrl: 'https://www.sylveco.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sylveco.pl/promocje/'] },
  { name: 'Resibo', websiteUrl: 'https://resibo.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://resibo.pl/promocje/', 'https://resibo.pl/wyprzedaz/'] },
  { name: 'Paese Cosmetics', websiteUrl: 'https://www.paese.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.paese.pl/sale/', 'https://www.paese.pl/promocje/'] },
  { name: 'Golden Rose PL', websiteUrl: 'https://www.goldenrose.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.goldenrose.pl/promocje/', 'https://www.goldenrose.pl/wyprzedaz/'] },
  { name: 'Wibo', websiteUrl: 'https://wibo.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://wibo.pl/promocje/'] },
  { name: 'L\'Oréal PL', websiteUrl: 'https://www.loreal-paris.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.pl/promocje'] },
  { name: 'Nivea PL', websiteUrl: 'https://www.nivea.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.pl/promocje'] },
  { name: 'Garnier PL', websiteUrl: 'https://www.garnier.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.pl/promocje'] },
  { name: 'Dove PL', websiteUrl: 'https://www.dove.com/pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/pl/promocje.html'] },
  { name: 'Yves Rocher PL', websiteUrl: 'https://www.yves-rocher.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yves-rocher.pl/promocje', 'https://www.yves-rocher.pl/wyprzedaz'] },
  { name: 'The Body Shop PL', websiteUrl: 'https://www.thebodyshop.com/pl-pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com/pl-pl/wyprzedaz'] },
  { name: 'NYX PL', websiteUrl: 'https://www.nyxcosmetics.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.pl/wyprzedaz'] },
  { name: 'MAC PL', websiteUrl: 'https://www.maccosmetics.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.pl/wyprzedaz'] },
  { name: 'Clinique PL', websiteUrl: 'https://www.clinique.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.pl/promocje'] },
  { name: 'Estée Lauder PL', websiteUrl: 'https://www.esteelauder.pl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.pl/promocje'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA PL', websiteUrl: 'https://www.ikea.com/pl/pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/pl/pl/offers/', 'https://www.ikea.com/pl/pl/campaigns/'] },
  { name: 'Leroy Merlin PL', websiteUrl: 'https://www.leroymerlin.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.leroymerlin.pl/promocje/', 'https://www.leroymerlin.pl/wyprzedaz/'] },
  { name: 'Castorama', websiteUrl: 'https://www.castorama.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.castorama.pl/promocje/', 'https://www.castorama.pl/gazetka/'] },
  { name: 'OBI PL', websiteUrl: 'https://www.obi.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.obi.pl/promocje/', 'https://www.obi.pl/gazetka/'] },
  { name: 'Agata Meble', websiteUrl: 'https://www.agatameble.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.agatameble.pl/promocje', 'https://www.agatameble.pl/wyprzedaz'] },
  { name: 'Black Red White', websiteUrl: 'https://www.brw.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.brw.pl/promocje', 'https://www.brw.pl/wyprzedaz'] },
  { name: 'Bodzio', websiteUrl: 'https://www.bodzio.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.bodzio.pl/promocje/', 'https://www.bodzio.pl/wyprzedaz/'] },
  { name: 'VOX', websiteUrl: 'https://www.vox.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.vox.pl/promocje/', 'https://www.vox.pl/wyprzedaz/'] },
  { name: 'Forte', websiteUrl: 'https://www.forte.com.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.forte.com.pl/promocje/'] },
  { name: 'JYSK PL', websiteUrl: 'https://jysk.pl', categorySlug: 'ev-yasam', seedUrls: ['https://jysk.pl/promocje', 'https://jysk.pl/wyprzedaz'] },
  { name: 'Komfort', websiteUrl: 'https://www.komfort.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.komfort.pl/promocje/', 'https://www.komfort.pl/gazetka/'] },
  { name: 'Bricomarché PL', websiteUrl: 'https://www.bricomarche.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricomarche.pl/gazetka/', 'https://www.bricomarche.pl/promocje/'] },
  { name: 'PSB Mrówka', websiteUrl: 'https://www.mrowka.com.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.mrowka.com.pl/gazetka/', 'https://www.mrowka.com.pl/promocje/'] },
  { name: 'Abra Meble', websiteUrl: 'https://www.abra-meble.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.abra-meble.pl/promocje/', 'https://www.abra-meble.pl/wyprzedaz/'] },
  { name: 'Duka', websiteUrl: 'https://www.dfrg.com.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.dfrg.com.pl/wyprzedaz/', 'https://www.dfrg.com.pl/promocje/'] },
  { name: 'Home&You', websiteUrl: 'https://www.homeandyou.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.homeandyou.pl/sale', 'https://www.homeandyou.pl/wyprzedaz'] },
  { name: 'Westwing PL', websiteUrl: 'https://www.westwing.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.pl/sale/', 'https://www.westwing.pl/promocje/'] },
  { name: 'Salony Agata', websiteUrl: 'https://www.salonmeblowy.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.salonmeblowy.pl/promocje/'] },
  { name: 'Praktiker PL', websiteUrl: 'https://www.praktiker.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.praktiker.pl/promocje/', 'https://www.praktiker.pl/gazetka/'] },
  { name: 'Empik Home', websiteUrl: 'https://www.empik.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.empik.com/dom-i-ogrod/promocje'] },
  { name: 'Homla', websiteUrl: 'https://www.homla.com.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.homla.com.pl/wyprzedaz', 'https://www.homla.com.pl/promocje'] },
  { name: 'Dekoria', websiteUrl: 'https://www.dekoria.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.dekoria.pl/sale/', 'https://www.dekoria.pl/promocje/'] },
  { name: 'Kare Design PL', websiteUrl: 'https://www.kare-design.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.kare-design.pl/sale/'] },
  { name: 'Tchibo PL', websiteUrl: 'https://www.tchibo.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.tchibo.pl/promocje-c400077736.html'] },
  { name: 'Jula PL', websiteUrl: 'https://www.jula.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.jula.pl/kampanje/', 'https://www.jula.pl/gazetka/'] },
  { name: 'Łazienka Plus', websiteUrl: 'https://www.lazienkaplus.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.lazienkaplus.pl/pl/promocje'] },
  { name: 'Tesco Home PL', websiteUrl: 'https://ezakupy.tesco.pl', categorySlug: 'ev-yasam', seedUrls: ['https://ezakupy.tesco.pl/promocje/'] },
  { name: 'Pani Teresa Medica', websiteUrl: 'https://www.paniteresa.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.paniteresa.pl/promocje/'] },
  { name: 'Nomi', websiteUrl: 'https://www.nfrg.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.nfrg.pl/gazetka/', 'https://www.nfrg.pl/promocje/'] },
  { name: 'Gala Collezione', websiteUrl: 'https://www.gfrg.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.gfrg.pl/promocje/', 'https://www.gfrg.pl/wyprzedaz/'] },
  { name: 'Bricoman PL', websiteUrl: 'https://www.bricoman.pl', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricoman.pl/promocje/', 'https://www.bricoman.pl/gazetka/'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon PL', websiteUrl: 'https://www.decathlon.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.pl/browse/c0-wszystkie-sporty/c1-promocje/_/N-1ur8jnp', 'https://www.decathlon.pl/wyprzedaz'] },
  { name: 'Nike PL', websiteUrl: 'https://www.nike.com/pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/pl/w/sale-3yaep', 'https://www.nike.com/pl/sale'] },
  { name: 'Adidas PL', websiteUrl: 'https://www.adidas.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.pl/outlet', 'https://www.adidas.pl/sale'] },
  { name: '4F', websiteUrl: 'https://4f.com.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://4f.com.pl/wyprzedaz', 'https://4f.com.pl/promocje'] },
  { name: 'Under Armour PL', websiteUrl: 'https://www.underarmour.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.pl/outlet/', 'https://www.underarmour.pl/sale/'] },
  { name: 'Puma PL', websiteUrl: 'https://eu.puma.com/pl/pl', categorySlug: 'spor-outdoor', seedUrls: ['https://eu.puma.com/pl/pl/sale'] },
  { name: 'Reebok PL', websiteUrl: 'https://www.reebok.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.pl/outlet', 'https://www.reebok.pl/sale'] },
  { name: 'New Balance PL', websiteUrl: 'https://www.newbalance.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.pl/sale/', 'https://www.newbalance.pl/wyprzedaz/'] },
  { name: 'ASICS PL', websiteUrl: 'https://www.asics.com/pl/pl-pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/pl/pl-pl/outlet/'] },
  { name: 'Intersport PL', websiteUrl: 'https://www.intersport.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.pl/promocje/', 'https://www.intersport.pl/wyprzedaz/'] },
  { name: 'Martes Sport', websiteUrl: 'https://www.marfrg.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.marfrg.pl/wyprzedaz/', 'https://www.marfrg.pl/promocje/'] },
  { name: 'Hi Mountain', websiteUrl: 'https://www.himountain.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.himountain.pl/sale/', 'https://www.himountain.pl/wyprzedaz/'] },
  { name: 'Salomon PL', websiteUrl: 'https://www.salomon.com/pl-pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/pl-pl/sale/'] },
  { name: 'The North Face PL', websiteUrl: 'https://www.thenorthface.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.pl/wyprzedaz/'] },
  { name: 'Columbia PL', websiteUrl: 'https://www.columbia.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.pl/sale/', 'https://www.columbia.pl/wyprzedaz/'] },
  { name: 'Jack Wolfskin PL', websiteUrl: 'https://www.jack-wolfskin.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jack-wolfskin.pl/wyprzedaz/', 'https://www.jack-wolfskin.pl/sale/'] },
  { name: 'Sport Vision PL', websiteUrl: 'https://www.sportvision.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportvision.pl/wyprzedaz/', 'https://www.sportvision.pl/sale/'] },
  { name: 'SklepBiegacza', websiteUrl: 'https://www.sklepbiegacza.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sklepbiegacza.pl/wyprzedaz/', 'https://www.sklepbiegacza.pl/promocje/'] },
  { name: 'Ski24.pl', websiteUrl: 'https://www.ski24.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ski24.pl/wyprzedaz/', 'https://www.ski24.pl/promocje/'] },
  { name: 'Sizeer PL', websiteUrl: 'https://sizeer.com/pl', categorySlug: 'spor-outdoor', seedUrls: ['https://sizeer.com/pl/wyprzedaz', 'https://sizeer.com/pl/sale'] },
  { name: 'SneakerStudio PL', websiteUrl: 'https://sneakerstudio.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://sneakerstudio.pl/wyprzedaz', 'https://sneakerstudio.pl/sale'] },
  { name: 'Distance.pl', websiteUrl: 'https://www.distance.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.distance.pl/wyprzedaz/', 'https://www.distance.pl/sale/'] },
  { name: 'Sportisimo PL', websiteUrl: 'https://www.sportisimo.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportisimo.pl/wyprzedaz/', 'https://www.sportisimo.pl/sale/'] },
  { name: 'FootShop PL', websiteUrl: 'https://www.footshop.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.footshop.pl/sale/', 'https://www.footshop.pl/wyprzedaz/'] },
  { name: 'Fila PL', websiteUrl: 'https://ffrg.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://ffrg.pl/wyprzedaz/', 'https://ffrg.pl/sale/'] },
  { name: 'Converse PL', websiteUrl: 'https://www.converse.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.pl/sale/'] },
  { name: 'Vans PL', websiteUrl: 'https://www.vans.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.pl/wyprzedaz/'] },
  { name: 'Skechers PL', websiteUrl: 'https://www.skechers.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.pl/sale/'] },
  { name: 'Timberland PL', websiteUrl: 'https://www.timberland.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.pl/wyprzedaz/'] },
  { name: 'Helly Hansen PL', websiteUrl: 'https://www.hellyhansen.com/pl_pl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.com/pl_pl/sale'] },
  { name: 'Bergson', websiteUrl: 'https://bergfrg.pl', categorySlug: 'spor-outdoor', seedUrls: ['https://bergfrg.pl/wyprzedaz/', 'https://bergfrg.pl/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'LOT Polish Airlines', websiteUrl: 'https://www.lot.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lot.com/pl/pl/promocje', 'https://www.lot.com/pl/pl/oferty-specjalne'] },
  { name: 'Ryanair PL', websiteUrl: 'https://www.ryanair.com/pl/pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/pl/pl/loty-tanio', 'https://www.ryanair.com/pl/pl/oferty'] },
  { name: 'Wizz Air PL', websiteUrl: 'https://wizzair.com/pl-pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://wizzair.com/pl-pl#/booking/select-flight/search'] },
  { name: 'Itaka', websiteUrl: 'https://www.itaka.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.itaka.pl/promocje/', 'https://www.itaka.pl/last-minute/'] },
  { name: 'Rainbow Tours', websiteUrl: 'https://www.rainbowtours.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rainbowtours.pl/promocje/', 'https://www.rainbowtours.pl/last-minute/'] },
  { name: 'TUI PL', websiteUrl: 'https://www.tui.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tui.pl/promocje/', 'https://www.tui.pl/last-minute/'] },
  { name: 'Coral Travel PL', websiteUrl: 'https://www.coraltravel.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.coraltravel.pl/last-minute/', 'https://www.coraltravel.pl/promocje/'] },
  { name: 'Neckermann PL', websiteUrl: 'https://www.neckermann.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.neckermann.pl/last-minute/', 'https://www.neckermann.pl/promocje/'] },
  { name: 'Wakacje.pl', websiteUrl: 'https://www.wakacje.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.wakacje.pl/last-minute/', 'https://www.wakacje.pl/promocje/'] },
  { name: 'Travelplanet', websiteUrl: 'https://www.travelplanet.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travelplanet.pl/last-minute/', 'https://www.travelplanet.pl/promocje/'] },
  { name: 'Booking.com PL', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.pl.html'] },
  { name: 'Trivago PL', websiteUrl: 'https://www.trivago.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.pl/'] },
  { name: 'Hotels.com PL', websiteUrl: 'https://pl.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://pl.hotels.com/deals/'] },
  { name: 'Airbnb PL', websiteUrl: 'https://www.airbnb.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.pl/'] },
  { name: 'eSky', websiteUrl: 'https://www.esky.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.esky.pl/promocje', 'https://www.esky.pl/tanie-loty'] },
  { name: 'Fru.pl', websiteUrl: 'https://www.fru.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fru.pl/promocje/', 'https://www.fru.pl/tanie-loty/'] },
  { name: 'Fly4free', websiteUrl: 'https://www.fly4free.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fly4free.pl/'] },
  { name: 'PKP Intercity', websiteUrl: 'https://www.intercity.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.intercity.pl/pl/site/dla-pasazera/oferty/promocje/', 'https://www.intercity.pl/pl/site/dla-pasazera/oferty/'] },
  { name: 'FlixBus PL', websiteUrl: 'https://www.flixbus.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.pl/oferty-specjalne'] },
  { name: 'PolskiBus', websiteUrl: 'https://www.flixbus.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.pl/polskibus'] },
  { name: 'Uber PL', websiteUrl: 'https://www.uber.com/pl/pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/pl/pl/ride/'] },
  { name: 'Bolt PL', websiteUrl: 'https://bolt.eu/pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://bolt.eu/pl/'] },
  { name: 'BlaBlaCar PL', websiteUrl: 'https://www.blablacar.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.blablacar.pl/'] },
  { name: 'Skyscanner PL', websiteUrl: 'https://www.skyscanner.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.pl/deals'] },
  { name: 'Kayak PL', websiteUrl: 'https://www.kayak.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.pl/deals'] },
  { name: 'Kiwi.com PL', websiteUrl: 'https://www.kiwi.com/pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kiwi.com/pl/'] },
  { name: 'Expedia PL', websiteUrl: 'https://www.expedia.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.pl/deals'] },
  { name: 'Nocowanie.pl', websiteUrl: 'https://www.nocowanie.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nocowanie.pl/promocje/'] },
  { name: 'Polska Żegluga Bałtycka', websiteUrl: 'https://www.polferries.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.polferries.pl/promocje'] },
  { name: 'Grecos', websiteUrl: 'https://www.grecos.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.grecos.pl/last-minute/', 'https://www.grecos.pl/promocje/'] },
  { name: 'Sun & Fun', websiteUrl: 'https://www.sunfun.pl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sunfun.pl/last-minute/', 'https://www.sunfun.pl/promocje/'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'PKO Bank Polski', websiteUrl: 'https://www.pkobp.pl', categorySlug: 'finans', seedUrls: ['https://www.pkobp.pl/promocje/', 'https://www.pkobp.pl/oferty-specjalne/'] },
  { name: 'mBank', websiteUrl: 'https://www.mbank.pl', categorySlug: 'finans', seedUrls: ['https://www.mbank.pl/indywidualny/promocje/'] },
  { name: 'ING Bank Śląski', websiteUrl: 'https://www.ing.pl', categorySlug: 'finans', seedUrls: ['https://www.ing.pl/indywidualny/promocje'] },
  { name: 'Santander PL', websiteUrl: 'https://www.santander.pl', categorySlug: 'finans', seedUrls: ['https://www.santander.pl/klient-indywidualny/promocje'] },
  { name: 'Bank Millennium', websiteUrl: 'https://www.bankmillennium.pl', categorySlug: 'finans', seedUrls: ['https://www.bankmillennium.pl/klienci-indywidualni/promocje'] },
  { name: 'BNP Paribas PL', websiteUrl: 'https://www.bnpparibas.pl', categorySlug: 'finans', seedUrls: ['https://www.bnpparibas.pl/klienci-indywidualni/promocje'] },
  { name: 'Pekao', websiteUrl: 'https://www.pekao.com.pl', categorySlug: 'finans', seedUrls: ['https://www.pekao.com.pl/klient-indywidualny/promocje.html'] },
  { name: 'Alior Bank', websiteUrl: 'https://www.aliorbank.pl', categorySlug: 'finans', seedUrls: ['https://www.aliorbank.pl/klienci-indywidualni/promocje.html'] },
  { name: 'Credit Agricole PL', websiteUrl: 'https://www.credit-agricole.pl', categorySlug: 'finans', seedUrls: ['https://www.credit-agricole.pl/promocje'] },
  { name: 'Citi Handlowy', websiteUrl: 'https://www.citibank.pl', categorySlug: 'finans', seedUrls: ['https://www.citibank.pl/klienci-indywidualni/promocje/'] },
  { name: 'Getin Noble Bank', websiteUrl: 'https://www.getinbank.pl', categorySlug: 'finans', seedUrls: ['https://www.getinbank.pl/promocje/'] },
  { name: 'T-Mobile Usługi Bankowe', websiteUrl: 'https://www.t-mobilebankowe.pl', categorySlug: 'finans', seedUrls: ['https://www.t-mobilebankowe.pl/promocje/'] },
  { name: 'Revolut PL', websiteUrl: 'https://www.revolut.com/pl-PL', categorySlug: 'finans', seedUrls: ['https://www.revolut.com/pl-PL/'] },
  { name: 'Wise PL', websiteUrl: 'https://wise.com/pl', categorySlug: 'finans', seedUrls: ['https://wise.com/pl/'] },
  { name: 'N26 PL', websiteUrl: 'https://n26.com/pl-pl', categorySlug: 'finans', seedUrls: ['https://n26.com/pl-pl/'] },
  { name: 'PayPal PL', websiteUrl: 'https://www.paypal.com/pl', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/pl/webapps/mpp/offers'] },
  { name: 'Klarna PL', websiteUrl: 'https://www.klarna.com/pl', categorySlug: 'finans', seedUrls: ['https://www.klarna.com/pl/'] },
  { name: 'Blik', websiteUrl: 'https://bfrg.pl', categorySlug: 'finans', seedUrls: ['https://bfrg.pl/promocje/'] },
  { name: 'Przelewy24', websiteUrl: 'https://www.przelewy24.pl', categorySlug: 'finans', seedUrls: ['https://www.przelewy24.pl/'] },
  { name: 'Nest Bank', websiteUrl: 'https://www.nestbank.pl', categorySlug: 'finans', seedUrls: ['https://www.nestbank.pl/promocje/'] },
  { name: 'BOŚ Bank', websiteUrl: 'https://www.bosbank.pl', categorySlug: 'finans', seedUrls: ['https://www.bosbank.pl/klienci-indywidualni/promocje'] },
  { name: 'Plus Bank', websiteUrl: 'https://www.plusbank.pl', categorySlug: 'finans', seedUrls: ['https://www.plusbank.pl/promocje/'] },
  { name: 'Mastercard PL', websiteUrl: 'https://www.mastercard.pl', categorySlug: 'finans', seedUrls: ['https://www.mastercard.pl/pl-pl/consumers/offers-promotions.html'] },
  { name: 'Visa PL', websiteUrl: 'https://www.visa.pl', categorySlug: 'finans', seedUrls: ['https://www.visa.pl/oferty-i-promocje/'] },
  { name: 'ZEN.com', websiteUrl: 'https://www.zen.com/pl', categorySlug: 'finans', seedUrls: ['https://www.zen.com/pl/'] },
  { name: 'Vivus', websiteUrl: 'https://www.vivus.pl', categorySlug: 'finans', seedUrls: ['https://www.vivus.pl/promocje/'] },
  { name: 'Wonga PL', websiteUrl: 'https://www.wonga.pl', categorySlug: 'finans', seedUrls: ['https://www.wonga.pl/promocje/'] },
  { name: 'Aion Bank PL', websiteUrl: 'https://www.aion.eu/pl', categorySlug: 'finans', seedUrls: ['https://www.aion.eu/pl/'] },
  { name: 'VeloBank', websiteUrl: 'https://www.velobank.pl', categorySlug: 'finans', seedUrls: ['https://www.velobank.pl/promocje/'] },
  { name: 'mElements', websiteUrl: 'https://www.melements.pl', categorySlug: 'finans', seedUrls: ['https://www.melements.pl/promocje/'] },
  { name: 'Pocztowy Bank', websiteUrl: 'https://www.pocztowy.pl', categorySlug: 'finans', seedUrls: ['https://www.pocztowy.pl/promocje/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'PZU', websiteUrl: 'https://www.pzu.pl', categorySlug: 'sigorta', seedUrls: ['https://www.pzu.pl/promocje', 'https://www.pzu.pl/oferty'] },
  { name: 'Warta', websiteUrl: 'https://www.warta.pl', categorySlug: 'sigorta', seedUrls: ['https://www.warta.pl/promocje/'] },
  { name: 'Allianz PL', websiteUrl: 'https://www.allianz.pl', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.pl/pl_PL/promocje.html'] },
  { name: 'UNIQA PL', websiteUrl: 'https://www.uniqa.pl', categorySlug: 'sigorta', seedUrls: ['https://www.uniqa.pl/promocje/'] },
  { name: 'Generali PL', websiteUrl: 'https://www.generali.pl', categorySlug: 'sigorta', seedUrls: ['https://www.generali.pl/promocje/'] },
  { name: 'Ergo Hestia', websiteUrl: 'https://www.ergohestia.pl', categorySlug: 'sigorta', seedUrls: ['https://www.ergohestia.pl/promocje/', 'https://www.ergohestia.pl/oferty/'] },
  { name: 'Compensa', websiteUrl: 'https://www.compensa.pl', categorySlug: 'sigorta', seedUrls: ['https://www.compensa.pl/promocje/'] },
  { name: 'Aviva PL', websiteUrl: 'https://www.aviva.pl', categorySlug: 'sigorta', seedUrls: ['https://www.aviva.pl/promocje/'] },
  { name: 'InterRisk', websiteUrl: 'https://www.interrisk.pl', categorySlug: 'sigorta', seedUrls: ['https://www.interrisk.pl/promocje/'] },
  { name: 'Link4', websiteUrl: 'https://www.link4.pl', categorySlug: 'sigorta', seedUrls: ['https://www.link4.pl/promocje', 'https://www.link4.pl/oferty'] },
  { name: 'Wiener', websiteUrl: 'https://www.wiener.pl', categorySlug: 'sigorta', seedUrls: ['https://www.wiener.pl/promocje/'] },
  { name: 'Beesafe', websiteUrl: 'https://www.beesafe.pl', categorySlug: 'sigorta', seedUrls: ['https://www.beesafe.pl/promocje/'] },
  { name: 'Nationale-Nederlanden PL', websiteUrl: 'https://www.nn.pl', categorySlug: 'sigorta', seedUrls: ['https://www.nn.pl/promocje/'] },
  { name: 'AXA PL', websiteUrl: 'https://www.axa.pl', categorySlug: 'sigorta', seedUrls: ['https://www.axa.pl/promocje/'] },
  { name: 'MetLife PL', websiteUrl: 'https://www.metlife.pl', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.pl/promocje/'] },
  { name: 'Proama', websiteUrl: 'https://www.proama.pl', categorySlug: 'sigorta', seedUrls: ['https://www.proama.pl/promocje/'] },
  { name: 'Europa Ubezpieczenia', websiteUrl: 'https://www.tueuropa.pl', categorySlug: 'sigorta', seedUrls: ['https://www.tueuropa.pl/promocje/'] },
  { name: 'Signal Iduna PL', websiteUrl: 'https://www.signal-iduna.pl', categorySlug: 'sigorta', seedUrls: ['https://www.signal-iduna.pl/promocje/'] },
  { name: 'Aegon PL', websiteUrl: 'https://www.aegon.pl', categorySlug: 'sigorta', seedUrls: ['https://www.aegon.pl/promocje/'] },
  { name: 'TUZ Ubezpieczenia', websiteUrl: 'https://www.tuz.pl', categorySlug: 'sigorta', seedUrls: ['https://www.tuz.pl/promocje/'] },
  { name: 'Benefia', websiteUrl: 'https://www.benefia.pl', categorySlug: 'sigorta', seedUrls: ['https://www.benefia.pl/promocje/'] },
  { name: 'Gothaer PL', websiteUrl: 'https://www.gothaer.pl', categorySlug: 'sigorta', seedUrls: ['https://www.gothaer.pl/promocje/'] },
  { name: 'Pocztowe TUW', websiteUrl: 'https://www.pocztowe.pl', categorySlug: 'sigorta', seedUrls: ['https://www.pocztowe.pl/promocje/'] },
  { name: 'Saltus', websiteUrl: 'https://www.saltus.pl', categorySlug: 'sigorta', seedUrls: ['https://www.saltus.pl/promocje/'] },
  { name: 'mtu24.pl', websiteUrl: 'https://www.mtu24.pl', categorySlug: 'sigorta', seedUrls: ['https://www.mtu24.pl/promocje/'] },
  { name: 'Rankomat', websiteUrl: 'https://rankomat.pl', categorySlug: 'sigorta', seedUrls: ['https://rankomat.pl/promocje/'] },
  { name: 'Mubi', websiteUrl: 'https://www.mubi.pl', categorySlug: 'sigorta', seedUrls: ['https://www.mubi.pl/promocje/'] },
  { name: 'Ubea', websiteUrl: 'https://www.ubea.pl', categorySlug: 'sigorta', seedUrls: ['https://www.ubea.pl/promocje/'] },
  { name: 'CUK Ubezpieczenia', websiteUrl: 'https://www.cuk.pl', categorySlug: 'sigorta', seedUrls: ['https://www.cuk.pl/promocje/'] },
  { name: 'Punkta', websiteUrl: 'https://punkta.pl', categorySlug: 'sigorta', seedUrls: ['https://punkta.pl/promocje/'] },
  { name: 'Polisa.pl', websiteUrl: 'https://polisa.pl', categorySlug: 'sigorta', seedUrls: ['https://polisa.pl/promocje/'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota PL', websiteUrl: 'https://www.toyota.pl', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.pl/promocje', 'https://www.toyota.pl/oferty-specjalne'] },
  { name: 'Volkswagen PL', websiteUrl: 'https://www.volkswagen.pl', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.pl/pl/oferty.html', 'https://www.volkswagen.pl/pl/promocje.html'] },
  { name: 'Škoda PL', websiteUrl: 'https://www.skoda-auto.pl', categorySlug: 'otomobil', seedUrls: ['https://www.skoda-auto.pl/oferty/', 'https://www.skoda-auto.pl/promocje/'] },
  { name: 'Hyundai PL', websiteUrl: 'https://www.hyundai.com/pl', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/pl/oferty.html', 'https://www.hyundai.com/pl/promocje.html'] },
  { name: 'Kia PL', websiteUrl: 'https://www.kia.com/pl', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/pl/oferty/', 'https://www.kia.com/pl/promocje/'] },
  { name: 'Ford PL', websiteUrl: 'https://www.ford.pl', categorySlug: 'otomobil', seedUrls: ['https://www.ford.pl/oferty', 'https://www.ford.pl/promocje'] },
  { name: 'Opel PL', websiteUrl: 'https://www.opel.pl', categorySlug: 'otomobil', seedUrls: ['https://www.opel.pl/oferty.html', 'https://www.opel.pl/promocje.html'] },
  { name: 'Renault PL', websiteUrl: 'https://www.renault.pl', categorySlug: 'otomobil', seedUrls: ['https://www.renault.pl/oferty.html', 'https://www.renault.pl/promocje.html'] },
  { name: 'Peugeot PL', websiteUrl: 'https://www.peugeot.pl', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.pl/oferty.html', 'https://www.peugeot.pl/promocje.html'] },
  { name: 'Citroën PL', websiteUrl: 'https://www.citroen.pl', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.pl/oferty.html'] },
  { name: 'Fiat PL', websiteUrl: 'https://www.fiat.pl', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.pl/oferty', 'https://www.fiat.pl/promocje'] },
  { name: 'Nissan PL', websiteUrl: 'https://www.nissan.pl', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.pl/oferty.html', 'https://www.nissan.pl/promocje.html'] },
  { name: 'Honda PL', websiteUrl: 'https://www.honda.pl', categorySlug: 'otomobil', seedUrls: ['https://www.honda.pl/cars/campaign.html'] },
  { name: 'Mazda PL', websiteUrl: 'https://www.mazda.pl', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.pl/oferty/', 'https://www.mazda.pl/promocje/'] },
  { name: 'Suzuki PL', websiteUrl: 'https://www.suzuki.pl', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.pl/oferty/', 'https://www.suzuki.pl/promocje/'] },
  { name: 'Mitsubishi PL', websiteUrl: 'https://www.mitsubishi.pl', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi.pl/oferty/', 'https://www.mitsubishi.pl/promocje/'] },
  { name: 'Mercedes-Benz PL', websiteUrl: 'https://www.mercedes-benz.pl', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.pl/passengercars/campaigns.html'] },
  { name: 'BMW PL', websiteUrl: 'https://www.bmw.pl', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.pl/pl/offers.html'] },
  { name: 'Audi PL', websiteUrl: 'https://www.audi.pl', categorySlug: 'otomobil', seedUrls: ['https://www.audi.pl/pl/web/pl/oferty.html'] },
  { name: 'Volvo PL', websiteUrl: 'https://www.volvocars.com/pl', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/pl/oferty/'] },
  { name: 'Jeep PL', websiteUrl: 'https://www.jeep.pl', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.pl/oferty', 'https://www.jeep.pl/promocje'] },
  { name: 'Dacia PL', websiteUrl: 'https://www.dacia.pl', categorySlug: 'otomobil', seedUrls: ['https://www.dacia.pl/oferty.html', 'https://www.dacia.pl/promocje.html'] },
  { name: 'Seat PL', websiteUrl: 'https://www.seat.pl', categorySlug: 'otomobil', seedUrls: ['https://www.seat.pl/oferty.html'] },
  { name: 'Cupra PL', websiteUrl: 'https://www.cupraofficial.pl', categorySlug: 'otomobil', seedUrls: ['https://www.cupraofficial.pl/oferty.html'] },
  { name: 'Tesla PL', websiteUrl: 'https://www.tesla.com/pl_pl', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/pl_pl/inventory/'] },
  { name: 'Subaru PL', websiteUrl: 'https://www.subaru.pl', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.pl/oferty/'] },
  { name: 'Orlen', websiteUrl: 'https://www.orlen.pl', categorySlug: 'otomobil', seedUrls: ['https://www.orlen.pl/pl/dla-klientow-indywidualnych/promocje'] },
  { name: 'Shell PL', websiteUrl: 'https://www.shell.pl', categorySlug: 'otomobil', seedUrls: ['https://www.shell.pl/motorisci/promocje.html'] },
  { name: 'BP PL', websiteUrl: 'https://www.bp.com/pl_pl', categorySlug: 'otomobil', seedUrls: ['https://www.bp.com/pl_pl/poland/home/produkty-i-uslugi/promocje.html'] },
  { name: 'Bridgestone PL', websiteUrl: 'https://www.bridgestone.pl', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestone.pl/pl/promocje'] },
  { name: 'Michelin PL', websiteUrl: 'https://www.michelin.pl', categorySlug: 'otomobil', seedUrls: ['https://www.michelin.pl/promocje'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Empik Books', websiteUrl: 'https://www.empik.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.empik.com/ksiazki/promocje', 'https://www.empik.com/ksiazki/wyprzedaz'] },
  { name: 'Świat Książki', websiteUrl: 'https://www.swiatksiazki.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.swiatksiazki.pl/promocje/', 'https://www.swiatksiazki.pl/wyprzedaz/'] },
  { name: 'Bonito.pl', websiteUrl: 'https://bonito.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://bonito.pl/promocje/', 'https://bonito.pl/wyprzedaz/'] },
  { name: 'Matras', websiteUrl: 'https://www.matras.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.matras.pl/promocje/', 'https://www.matras.pl/wyprzedaz/'] },
  { name: 'TaniaKsiazka.pl', websiteUrl: 'https://www.taniaksiazka.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.taniaksiazka.pl/promocje/', 'https://www.taniaksiazka.pl/wyprzedaz/'] },
  { name: 'Gandalf', websiteUrl: 'https://www.gandalf.com.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gandalf.com.pl/promocje/', 'https://www.gandalf.com.pl/b/wyprzedaz/'] },
  { name: 'Znak', websiteUrl: 'https://www.znak.com.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.znak.com.pl/promocje', 'https://www.znak.com.pl/wyprzedaz'] },
  { name: 'Wydawnictwo Literackie', websiteUrl: 'https://www.wydawnictwoliterackie.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.wydawnictwoliterackie.pl/promocje/'] },
  { name: 'PWN', websiteUrl: 'https://ksiegarnia.pwn.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://ksiegarnia.pwn.pl/promocje/'] },
  { name: 'Nexto', websiteUrl: 'https://www.nexto.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nexto.pl/promocje/'] },
  { name: 'Legimi', websiteUrl: 'https://www.legimi.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.legimi.pl/promocje/'] },
  { name: 'Audioteka', websiteUrl: 'https://audioteka.com/pl', categorySlug: 'kitap-hobi', seedUrls: ['https://audioteka.com/pl/promocje/'] },
  { name: 'Netflix PL', websiteUrl: 'https://www.netflix.com/pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/pl/'] },
  { name: 'Disney+ PL', websiteUrl: 'https://www.disneyplus.com/pl-pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/pl-pl/'] },
  { name: 'HBO Max PL', websiteUrl: 'https://www.max.com/pl/pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.max.com/pl/pl/'] },
  { name: 'Spotify PL', websiteUrl: 'https://www.spotify.com/pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/pl/premium/'] },
  { name: 'Player.pl', websiteUrl: 'https://player.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://player.pl/'] },
  { name: 'Canal+ Online PL', websiteUrl: 'https://www.cfrg.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cfrg.pl/kup-online/'] },
  { name: 'PlayStation PL', websiteUrl: 'https://store.playstation.com/pl-pl', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/pl-pl/category/deals'] },
  { name: 'Xbox PL', websiteUrl: 'https://www.xbox.com/pl-PL', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/pl-PL/games/sales-and-specials'] },
  { name: 'Nintendo PL', websiteUrl: 'https://www.nintendo.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.pl/Gry/'] },
  { name: 'Steam PL', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'GOG.com', websiteUrl: 'https://www.gog.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gog.com/games?discounted=true', 'https://www.gog.com/en/games?discounted=true'] },
  { name: 'Epic Games PL', websiteUrl: 'https://store.epicgames.com/pl', categorySlug: 'kitap-hobi', seedUrls: ['https://store.epicgames.com/pl/free-games', 'https://store.epicgames.com/pl/browse?sortBy=currentPrice&sortDir=ASC'] },
  { name: 'Lego PL', websiteUrl: 'https://www.lego.com/pl-pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/pl-pl/categories/sales-and-deals'] },
  { name: 'Smyk', websiteUrl: 'https://www.smyk.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.smyk.com/wyprzedaz', 'https://www.smyk.com/promocje'] },
  { name: 'al.to', websiteUrl: 'https://www.al.to', categorySlug: 'kitap-hobi', seedUrls: ['https://www.al.to/promocje/', 'https://www.al.to/wyprzedaz/'] },
  { name: 'Eventim PL', websiteUrl: 'https://www.eventim.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.eventim.pl/'] },
  { name: 'eBilet', websiteUrl: 'https://www.ebilet.pl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ebilet.pl/promocje/'] },
  { name: 'Udemy PL', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=pl&src=ukw&q=promocje'] },
  { name: 'Coursera PL', websiteUrl: 'https://www.coursera.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coursera.org/courses?query=free'] },
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
  console.log('=== PL Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'PL' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'PL', categoryId: category.id },
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
            market: 'PL',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'PL' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'PL', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active PL sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
