import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── Cyrillic transliteration map ─────────────────────────
const CYRILLIC_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
};

// ── Slug generator (with Cyrillic transliteration) ───────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .split('')
    .map(ch => CYRILLIC_MAP[ch] ?? ch)
    .join('')
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

// ── ALL RU BRANDS DATA ──────────────────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Wildberries', websiteUrl: 'https://www.wildberries.ru', categorySlug: 'alisveris', seedUrls: ['https://www.wildberries.ru/promotions'] },
  { name: 'Ozon', websiteUrl: 'https://www.ozon.ru', categorySlug: 'alisveris', seedUrls: ['https://www.ozon.ru/highlight/globalpromo/', 'https://www.ozon.ru/promo/'] },
  { name: 'Яндекс Маркет', websiteUrl: 'https://market.yandex.ru', categorySlug: 'alisveris', seedUrls: ['https://market.yandex.ru/special/promo', 'https://market.yandex.ru/promo/'] },
  { name: 'СберМегаМаркет', websiteUrl: 'https://sbermegamarket.ru', categorySlug: 'alisveris', seedUrls: ['https://sbermegamarket.ru/promo/', 'https://sbermegamarket.ru/discounts/'] },
  { name: 'AliExpress Россия', websiteUrl: 'https://aliexpress.ru', categorySlug: 'alisveris', seedUrls: ['https://aliexpress.ru/promo/', 'https://aliexpress.ru/sale/'] },
  { name: 'Lamoda', websiteUrl: 'https://www.lamoda.ru', categorySlug: 'alisveris', seedUrls: ['https://www.lamoda.ru/sale/', 'https://www.lamoda.ru/promo/'] },
  { name: 'KazanExpress', websiteUrl: 'https://kazanexpress.ru', categorySlug: 'alisveris', seedUrls: ['https://kazanexpress.ru/promo/'] },
  { name: 'Goods.ru', websiteUrl: 'https://goods.ru', categorySlug: 'alisveris', seedUrls: ['https://goods.ru/sale/'] },
  { name: '21vek', websiteUrl: 'https://www.21vek.ru', categorySlug: 'alisveris', seedUrls: ['https://www.21vek.ru/sale/'] },
  { name: 'Joom', websiteUrl: 'https://www.joom.com/ru', categorySlug: 'alisveris', seedUrls: ['https://www.joom.com/ru/best-deals'] },
  { name: 'СДЭК.Маркет', websiteUrl: 'https://market.cdek.ru', categorySlug: 'alisveris', seedUrls: ['https://market.cdek.ru/promo/'] },
  { name: 'Avito', websiteUrl: 'https://www.avito.ru', categorySlug: 'alisveris', seedUrls: ['https://www.avito.ru/rossiya/promo'] },
  { name: 'Юлмарт', websiteUrl: 'https://www.ulmart.ru', categorySlug: 'alisveris', seedUrls: ['https://www.ulmart.ru/aktsii'] },
  { name: 'Беру', websiteUrl: 'https://beru.ru', categorySlug: 'alisveris', seedUrls: ['https://beru.ru/promo/'] },
  { name: 'iHerb Россия', websiteUrl: 'https://ru.iherb.com', categorySlug: 'alisveris', seedUrls: ['https://ru.iherb.com/specials', 'https://ru.iherb.com/sales'] },
  { name: 'Amazon Россия', websiteUrl: 'https://www.amazon.com', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.com/international-sales-offers/b?node=15529609011'] },
  { name: 'eBay Россия', websiteUrl: 'https://www.ebay.com', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.com/deals'] },
  { name: 'ASOS Россия', websiteUrl: 'https://www.asos.com/ru', categorySlug: 'alisveris', seedUrls: ['https://www.asos.com/ru/women/sale/', 'https://www.asos.com/ru/men/sale/'] },
  { name: 'Bonprix', websiteUrl: 'https://www.bonprix.ru', categorySlug: 'alisveris', seedUrls: ['https://www.bonprix.ru/aktsii/', 'https://www.bonprix.ru/rasprodazha/'] },
  { name: 'Otto Россия', websiteUrl: 'https://www.otto.ru', categorySlug: 'alisveris', seedUrls: ['https://www.otto.ru/aktsii/', 'https://www.otto.ru/sale/'] },
  { name: 'Kari', websiteUrl: 'https://www.kari.com', categorySlug: 'alisveris', seedUrls: ['https://www.kari.com/sale/', 'https://www.kari.com/aktsii/'] },
  { name: 'Gloria Jeans', websiteUrl: 'https://www.gloria-jeans.ru', categorySlug: 'alisveris', seedUrls: ['https://www.gloria-jeans.ru/sale/', 'https://www.gloria-jeans.ru/promo/'] },
  { name: 'Familia', websiteUrl: 'https://www.famil.ru', categorySlug: 'alisveris', seedUrls: ['https://www.famil.ru/aktsii/'] },
  { name: 'METRO Cash & Carry', websiteUrl: 'https://www.metro-cc.ru', categorySlug: 'alisveris', seedUrls: ['https://www.metro-cc.ru/aktsii', 'https://www.metro-cc.ru/rasprodazha'] },
  { name: 'Лента Онлайн', websiteUrl: 'https://lenta.com', categorySlug: 'alisveris', seedUrls: ['https://lenta.com/promo/', 'https://lenta.com/aktsii/'] },
  { name: 'ВсеИнструменты', websiteUrl: 'https://www.vseinstrumenti.ru', categorySlug: 'alisveris', seedUrls: ['https://www.vseinstrumenti.ru/aktsii/', 'https://www.vseinstrumenti.ru/rasprodazha/'] },
  { name: 'Леруа Мерлен', websiteUrl: 'https://leroymerlin.ru', categorySlug: 'alisveris', seedUrls: ['https://leroymerlin.ru/promo/', 'https://leroymerlin.ru/aktsii/'] },
  { name: 'Петрович', websiteUrl: 'https://petrovich.ru', categorySlug: 'alisveris', seedUrls: ['https://petrovich.ru/aktsii/', 'https://petrovich.ru/sale/'] },
  { name: 'Ситилинк', websiteUrl: 'https://www.citilink.ru', categorySlug: 'alisveris', seedUrls: ['https://www.citilink.ru/promo/', 'https://www.citilink.ru/aktsii/'] },
  { name: 'DNS', websiteUrl: 'https://www.dns-shop.ru', categorySlug: 'alisveris', seedUrls: ['https://www.dns-shop.ru/actions/', 'https://www.dns-shop.ru/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'М.Видео', websiteUrl: 'https://www.mvideo.ru', categorySlug: 'elektronik', seedUrls: ['https://www.mvideo.ru/promo', 'https://www.mvideo.ru/aktsii'] },
  { name: 'DNS Electronics', websiteUrl: 'https://www.dns-shop.ru', categorySlug: 'elektronik', seedUrls: ['https://www.dns-shop.ru/actions/', 'https://www.dns-shop.ru/sale/'] },
  { name: 'Эльдорадо', websiteUrl: 'https://www.eldorado.ru', categorySlug: 'elektronik', seedUrls: ['https://www.eldorado.ru/promo/', 'https://www.eldorado.ru/actions/'] },
  { name: 'Ситилинк Electronics', websiteUrl: 'https://www.citilink.ru', categorySlug: 'elektronik', seedUrls: ['https://www.citilink.ru/promo/', 'https://www.citilink.ru/aktsii/'] },
  { name: 're:Store', websiteUrl: 'https://www.re-store.ru', categorySlug: 'elektronik', seedUrls: ['https://www.re-store.ru/actions/', 'https://www.re-store.ru/sale/'] },
  { name: 'Samsung Россия', websiteUrl: 'https://www.samsung.com/ru', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/ru/offer/', 'https://www.samsung.com/ru/smartphones/all-smartphones/'] },
  { name: 'Apple (re:Store)', websiteUrl: 'https://www.re-store.ru', categorySlug: 'elektronik', seedUrls: ['https://www.re-store.ru/actions/apple/'] },
  { name: 'Xiaomi Россия', websiteUrl: 'https://www.mi.com/ru', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/ru/sale/', 'https://www.mi.com/ru/promo/'] },
  { name: 'Huawei Россия', websiteUrl: 'https://consumer.huawei.com/ru', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/ru/offer/', 'https://consumer.huawei.com/ru/campaign/'] },
  { name: 'ASUS Россия', websiteUrl: 'https://www.asus.com/ru', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/ru/campaign/'] },
  { name: 'Lenovo Россия', websiteUrl: 'https://www.lenovo.com/ru/ru', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/ru/ru/d/deals/'] },
  { name: 'HP Россия', websiteUrl: 'https://www.hp.com/ru-ru', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/ru-ru/shop/offer.aspx'] },
  { name: 'Acer Россия', websiteUrl: 'https://www.acer.com/ru-ru', categorySlug: 'elektronik', seedUrls: ['https://www.acer.com/ru-ru/promotions'] },
  { name: 'LG Россия', websiteUrl: 'https://www.lg.com/ru', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/ru/promo/'] },
  { name: 'Sony Россия', websiteUrl: 'https://www.sony.ru', categorySlug: 'elektronik', seedUrls: ['https://www.sony.ru/promo/', 'https://www.sony.ru/offers/'] },
  { name: 'Philips Россия', websiteUrl: 'https://www.philips.ru', categorySlug: 'elektronik', seedUrls: ['https://www.philips.ru/c-e/promotions.html'] },
  { name: 'Panasonic Россия', websiteUrl: 'https://www.panasonic.com/ru', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/ru/promo.html'] },
  { name: 'Bose Россия', websiteUrl: 'https://www.bose.ru', categorySlug: 'elektronik', seedUrls: ['https://www.bose.ru/offers'] },
  { name: 'JBL Россия', websiteUrl: 'https://ru.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://ru.jbl.com/promo/'] },
  { name: 'Marshall Россия', websiteUrl: 'https://www.marshallheadphones.com/ru', categorySlug: 'elektronik', seedUrls: ['https://www.marshallheadphones.com/ru/sale.html'] },
  { name: 'DJI Россия', websiteUrl: 'https://store.dji.com/ru', categorySlug: 'elektronik', seedUrls: ['https://store.dji.com/ru/sale'] },
  { name: 'Garmin Россия', websiteUrl: 'https://www.garmin.com/ru-RU', categorySlug: 'elektronik', seedUrls: ['https://www.garmin.com/ru-RU/sale/'] },
  { name: 'Canon Россия', websiteUrl: 'https://www.canon.ru', categorySlug: 'elektronik', seedUrls: ['https://www.canon.ru/promo/', 'https://www.canon.ru/offers/'] },
  { name: 'Nikon Россия', websiteUrl: 'https://www.nikon.ru', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.ru/promo/'] },
  { name: 'Dyson Россия', websiteUrl: 'https://www.dyson.ru', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.ru/offers', 'https://www.dyson.ru/sale'] },
  { name: 'iRobot Россия', websiteUrl: 'https://www.irobot.ru', categorySlug: 'elektronik', seedUrls: ['https://www.irobot.ru/aktsii/'] },
  { name: 'Logitech Россия', websiteUrl: 'https://www.logitech.com/ru-ru', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/ru-ru/promo/'] },
  { name: 'MSI Россия', websiteUrl: 'https://ru.msi.com', categorySlug: 'elektronik', seedUrls: ['https://ru.msi.com/Promotion/'] },
  { name: 'Realme Россия', websiteUrl: 'https://www.realme.com/ru', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/ru/sale'] },
  { name: 'Honor Россия', websiteUrl: 'https://www.hihonor.com/ru', categorySlug: 'elektronik', seedUrls: ['https://www.hihonor.com/ru/offer/', 'https://www.hihonor.com/ru/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 3) Fashion (giyim-moda) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Lamoda Fashion', websiteUrl: 'https://www.lamoda.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.lamoda.ru/sale/', 'https://www.lamoda.ru/promo/'] },
  { name: 'Wildberries Fashion', websiteUrl: 'https://www.wildberries.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.wildberries.ru/promotions'] },
  { name: 'H&M Россия', websiteUrl: 'https://www2.hm.com/ru_ru', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/ru_ru/rasprodazha.html', 'https://www2.hm.com/ru_ru/aktsii.html'] },
  { name: 'UNIQLO Россия', websiteUrl: 'https://www.uniqlo.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/ru/ru/sale', 'https://www.uniqlo.com/ru/ru/promo'] },
  { name: 'Zara Россия', websiteUrl: 'https://www.zara.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/ru/ru/z-sale-l1314.html'] },
  { name: 'Mango Россия', websiteUrl: 'https://shop.mango.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/ru/sale'] },
  { name: 'Massimo Dutti Россия', websiteUrl: 'https://www.massimodutti.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/ru/sale'] },
  { name: 'Pull&Bear Россия', websiteUrl: 'https://www.pullandbear.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/ru/sale'] },
  { name: 'Bershka Россия', websiteUrl: 'https://www.bershka.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/ru/sale'] },
  { name: 'Reserved Россия', websiteUrl: 'https://www.reserved.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.reserved.com/ru/sale/'] },
  { name: 'Sinsay', websiteUrl: 'https://www.sinsay.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.sinsay.com/ru/sale/'] },
  { name: 'Cropp', websiteUrl: 'https://www.cropp.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.cropp.com/ru/sale/'] },
  { name: 'House', websiteUrl: 'https://www.housebrand.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.housebrand.com/ru/sale/'] },
  { name: 'Love Republic', websiteUrl: 'https://www.loverepublic.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.loverepublic.ru/sale/', 'https://www.loverepublic.ru/promo/'] },
  { name: 'befree', websiteUrl: 'https://befree.ru', categorySlug: 'giyim-moda', seedUrls: ['https://befree.ru/sale/', 'https://befree.ru/promo/'] },
  { name: 'Sela', websiteUrl: 'https://www.sela.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.sela.ru/sale/', 'https://www.sela.ru/aktsii/'] },
  { name: 'FINN FLARE', websiteUrl: 'https://www.finn-flare.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.finn-flare.ru/sale/', 'https://www.finn-flare.ru/promo/'] },
  { name: 'Ostin', websiteUrl: 'https://ostin.com', categorySlug: 'giyim-moda', seedUrls: ['https://ostin.com/sale/', 'https://ostin.com/promo/'] },
  { name: 'Gloria Jeans Fashion', websiteUrl: 'https://www.gloria-jeans.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.gloria-jeans.ru/sale/'] },
  { name: 'Kari Fashion', websiteUrl: 'https://www.kari.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.kari.com/sale/', 'https://www.kari.com/aktsii/'] },
  { name: 'Rendez-Vous', websiteUrl: 'https://www.rendez-vous.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.rendez-vous.ru/sale/', 'https://www.rendez-vous.ru/promo/'] },
  { name: 'Ecco Россия', websiteUrl: 'https://www.ecco.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.ecco.com/ru/sale/'] },
  { name: 'Geox Россия', websiteUrl: 'https://www.geox.com/ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.geox.com/ru/sale/'] },
  { name: 'Ralf Ringer', websiteUrl: 'https://www.rfrr.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.rfrr.ru/sale/', 'https://www.rfrr.ru/aktsii/'] },
  { name: 'TJ Collection', websiteUrl: 'https://www.tjcollection.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.tjcollection.ru/sale/'] },
  { name: 'Carlo Pazolini', websiteUrl: 'https://www.carlopazolini.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.carlopazolini.com/sale/'] },
  { name: 'Respect', websiteUrl: 'https://www.respect-shoes.ru', categorySlug: 'giyim-moda', seedUrls: ['https://www.respect-shoes.ru/sale/', 'https://www.respect-shoes.ru/aktsii/'] },
  { name: 'ТВОЕ', websiteUrl: 'https://tvoe.ru', categorySlug: 'giyim-moda', seedUrls: ['https://tvoe.ru/sale/', 'https://tvoe.ru/promo/'] },
  { name: 'Modis', websiteUrl: 'https://modis.ru', categorySlug: 'giyim-moda', seedUrls: ['https://modis.ru/sale/', 'https://modis.ru/aktsii/'] },
  { name: 'Incity', websiteUrl: 'https://incity.ru', categorySlug: 'giyim-moda', seedUrls: ['https://incity.ru/sale/', 'https://incity.ru/promo/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA Россия', websiteUrl: 'https://www.ikea.com/ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/ru/ru/offers/', 'https://www.ikea.com/ru/ru/campaigns/'] },
  { name: 'Леруа Мерлен Home', websiteUrl: 'https://leroymerlin.ru', categorySlug: 'ev-yasam', seedUrls: ['https://leroymerlin.ru/promo/', 'https://leroymerlin.ru/aktsii/'] },
  { name: 'Hoff', websiteUrl: 'https://hoff.ru', categorySlug: 'ev-yasam', seedUrls: ['https://hoff.ru/aktsii/', 'https://hoff.ru/rasprodazha/'] },
  { name: 'Askona', websiteUrl: 'https://www.askona.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.askona.ru/aktsii/', 'https://www.askona.ru/rasprodazha/'] },
  { name: 'Много Мебели', websiteUrl: 'https://www.mnogo-mebeli.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.mnogo-mebeli.ru/aktsii/', 'https://www.mnogo-mebeli.ru/rasprodazha/'] },
  { name: 'Столплит', websiteUrl: 'https://www.stolplit.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.stolplit.ru/aktsii/', 'https://www.stolplit.ru/rasprodazha/'] },
  { name: 'Лазурит', websiteUrl: 'https://www.lazurit.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.lazurit.com/aktsii/', 'https://www.lazurit.com/sale/'] },
  { name: 'HomeMe', websiteUrl: 'https://www.homeme.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.homeme.ru/aktsii/'] },
  { name: 'DG-Home', websiteUrl: 'https://www.dg-home.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.dg-home.ru/sale/'] },
  { name: 'Westwing Россия', websiteUrl: 'https://www.westwing.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.ru/sale/'] },
  { name: 'Zara Home Россия', websiteUrl: 'https://www.zarahome.com/ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/ru/sale'] },
  { name: 'H&M Home Россия', websiteUrl: 'https://www2.hm.com/ru_ru/dom.html', categorySlug: 'ev-yasam', seedUrls: ['https://www2.hm.com/ru_ru/dom/rasprodazha.html'] },
  { name: 'Мегафон Home', websiteUrl: 'https://www.megafon.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.megafon.ru/promo/'] },
  { name: 'Орматек', websiteUrl: 'https://www.ormatek.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ormatek.com/aktsii/', 'https://www.ormatek.com/rasprodazha/'] },
  { name: 'Dreamline', websiteUrl: 'https://www.dreamline.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.dreamline.ru/aktsii/'] },
  { name: 'Мебель Ангстрем', websiteUrl: 'https://www.angstrem-mebel.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.angstrem-mebel.ru/aktsii/'] },
  { name: 'Mr.Doors', websiteUrl: 'https://www.mrdoors.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.mrdoors.ru/aktsii/'] },
  { name: 'Stanley', websiteUrl: 'https://www.stanleytools.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.stanleytools.ru/promo/'] },
  { name: 'Black+Decker Россия', websiteUrl: 'https://www.blackanddecker.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.blackanddecker.ru/promo/'] },
  { name: 'Bosch Home Россия', websiteUrl: 'https://www.bosch-home.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.bosch-home.ru/aktsii', 'https://www.bosch-home.ru/promo'] },
  { name: 'Electrolux Россия', websiteUrl: 'https://www.electrolux.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.electrolux.ru/promo/', 'https://www.electrolux.ru/aktsii/'] },
  { name: 'Samsung Home Россия', websiteUrl: 'https://www.samsung.com/ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.samsung.com/ru/offer/home-appliances/'] },
  { name: 'LG Home Россия', websiteUrl: 'https://www.lg.com/ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.lg.com/ru/promo/'] },
  { name: 'Dyson Home Россия', websiteUrl: 'https://www.dyson.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.dyson.ru/offers'] },
  { name: 'Tefal Россия', websiteUrl: 'https://www.tefal.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.tefal.ru/promo/', 'https://www.tefal.ru/aktsii/'] },
  { name: 'Moulinex Россия', websiteUrl: 'https://www.moulinex.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.moulinex.ru/promo/'] },
  { name: 'Redmond', websiteUrl: 'https://multivarka.pro', categorySlug: 'ev-yasam', seedUrls: ['https://multivarka.pro/aktsii/', 'https://multivarka.pro/sale/'] },
  { name: 'Polaris', websiteUrl: 'https://www.polar.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.polar.ru/aktsii/'] },
  { name: 'Vitek', websiteUrl: 'https://www.vitek.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.vitek.ru/aktsii/'] },
  { name: 'Scarlett', websiteUrl: 'https://www.scarlett.ru', categorySlug: 'ev-yasam', seedUrls: ['https://www.scarlett.ru/aktsii/'] },

  // ═══════════════════════════════════════════════════════
  // 5) Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Пятёрочка', websiteUrl: 'https://5ka.ru', categorySlug: 'gida-market', seedUrls: ['https://5ka.ru/special_offers/', 'https://5ka.ru/actions/'] },
  { name: 'Магнит', websiteUrl: 'https://magnit.ru', categorySlug: 'gida-market', seedUrls: ['https://magnit.ru/promo/', 'https://magnit.ru/aktsii/'] },
  { name: 'Лента', websiteUrl: 'https://lenta.com', categorySlug: 'gida-market', seedUrls: ['https://lenta.com/promo/', 'https://lenta.com/aktsii/'] },
  { name: 'ВкусВилл', websiteUrl: 'https://vkusvill.ru', categorySlug: 'gida-market', seedUrls: ['https://vkusvill.ru/promo/', 'https://vkusvill.ru/aktsii/'] },
  { name: 'Перекрёсток', websiteUrl: 'https://www.perekrestok.ru', categorySlug: 'gida-market', seedUrls: ['https://www.perekrestok.ru/promo/', 'https://www.perekrestok.ru/aktsii/'] },
  { name: 'Ашан Россия', websiteUrl: 'https://www.auchan.ru', categorySlug: 'gida-market', seedUrls: ['https://www.auchan.ru/promo/', 'https://www.auchan.ru/aktsii/'] },
  { name: 'METRO Grocery', websiteUrl: 'https://www.metro-cc.ru', categorySlug: 'gida-market', seedUrls: ['https://www.metro-cc.ru/aktsii'] },
  { name: 'Глобус', websiteUrl: 'https://www.globus.ru', categorySlug: 'gida-market', seedUrls: ['https://www.globus.ru/aktsii/', 'https://www.globus.ru/promo/'] },
  { name: 'Дикси', websiteUrl: 'https://dixy.ru', categorySlug: 'gida-market', seedUrls: ['https://dixy.ru/promo/', 'https://dixy.ru/aktsii/'] },
  { name: 'Верный', websiteUrl: 'https://www.verno-info.ru', categorySlug: 'gida-market', seedUrls: ['https://www.verno-info.ru/aktsii/'] },
  { name: 'Монетка', websiteUrl: 'https://monetka.ru', categorySlug: 'gida-market', seedUrls: ['https://monetka.ru/aktsii/'] },
  { name: 'Fix Price', websiteUrl: 'https://fix-price.com', categorySlug: 'gida-market', seedUrls: ['https://fix-price.com/promo/', 'https://fix-price.com/aktsii/'] },
  { name: 'Красное и Белое', websiteUrl: 'https://www.krasnoebeloe.ru', categorySlug: 'gida-market', seedUrls: ['https://www.krasnoebeloe.ru/aktsii/'] },
  { name: 'Бристоль', websiteUrl: 'https://bristol.ru', categorySlug: 'gida-market', seedUrls: ['https://bristol.ru/aktsii/'] },
  { name: 'Самокат', websiteUrl: 'https://samokat.ru', categorySlug: 'gida-market', seedUrls: ['https://samokat.ru/promo/'] },
  { name: 'Яндекс Лавка', websiteUrl: 'https://lavka.yandex.ru', categorySlug: 'gida-market', seedUrls: ['https://lavka.yandex.ru/promo/'] },
  { name: 'СберМаркет', websiteUrl: 'https://sbermarket.ru', categorySlug: 'gida-market', seedUrls: ['https://sbermarket.ru/promo/', 'https://sbermarket.ru/aktsii/'] },
  { name: 'Delivery Club Маркет', websiteUrl: 'https://www.delivery-club.ru', categorySlug: 'gida-market', seedUrls: ['https://www.delivery-club.ru/promo/'] },
  { name: 'Ozon Fresh', websiteUrl: 'https://www.ozon.ru/category/fresh/', categorySlug: 'gida-market', seedUrls: ['https://www.ozon.ru/category/fresh/promo/'] },
  { name: 'Утконос', websiteUrl: 'https://www.utkonos.ru', categorySlug: 'gida-market', seedUrls: ['https://www.utkonos.ru/promo/', 'https://www.utkonos.ru/aktsii/'] },
  { name: 'Азбука Вкуса', websiteUrl: 'https://av.ru', categorySlug: 'gida-market', seedUrls: ['https://av.ru/promo/', 'https://av.ru/aktsii/'] },
  { name: 'Магнит Доставка', websiteUrl: 'https://dostavka.magnit.ru', categorySlug: 'gida-market', seedUrls: ['https://dostavka.magnit.ru/promo/'] },
  { name: "О'КЕЙ", websiteUrl: 'https://www.okeydostavka.ru', categorySlug: 'gida-market', seedUrls: ['https://www.okeydostavka.ru/aktsii/'] },
  { name: 'Prisma Россия', websiteUrl: 'https://www.prismamarket.ru', categorySlug: 'gida-market', seedUrls: ['https://www.prismamarket.ru/aktsii/'] },
  { name: 'Spar Россия', websiteUrl: 'https://www.spar.ru', categorySlug: 'gida-market', seedUrls: ['https://www.spar.ru/aktsii/'] },
  { name: 'Billa Россия', websiteUrl: 'https://www.billa.ru', categorySlug: 'gida-market', seedUrls: ['https://www.billa.ru/aktsii/'] },
  { name: 'Да!', websiteUrl: 'https://www.da-market.ru', categorySlug: 'gida-market', seedUrls: ['https://www.da-market.ru/aktsii/'] },
  { name: 'КБ Маркет', websiteUrl: 'https://www.kbmarket.ru', categorySlug: 'gida-market', seedUrls: ['https://www.kbmarket.ru/aktsii/'] },
  { name: 'Светофор', websiteUrl: 'https://svetofor.info', categorySlug: 'gida-market', seedUrls: ['https://svetofor.info/aktsii/'] },
  { name: 'Чижик', websiteUrl: 'https://chizhik.club', categorySlug: 'gida-market', seedUrls: ['https://chizhik.club/promo/', 'https://chizhik.club/aktsii/'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Dining (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Delivery Club', websiteUrl: 'https://www.delivery-club.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.delivery-club.ru/promo/', 'https://www.delivery-club.ru/aktsii/'] },
  { name: 'Яндекс Еда', websiteUrl: 'https://eda.yandex.ru', categorySlug: 'yeme-icme', seedUrls: ['https://eda.yandex.ru/promo/'] },
  { name: "McDonald's Россия", websiteUrl: 'https://mcdonalds.ru', categorySlug: 'yeme-icme', seedUrls: ['https://mcdonalds.ru/promo/'] },
  { name: 'Burger King Россия', websiteUrl: 'https://burgerking.ru', categorySlug: 'yeme-icme', seedUrls: ['https://burgerking.ru/promotions', 'https://burgerking.ru/coupons'] },
  { name: 'KFC Россия', websiteUrl: 'https://www.kfc.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.ru/promo/', 'https://www.kfc.ru/offers/'] },
  { name: "Domino's Pizza Россия", websiteUrl: 'https://www.dominospizza.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominospizza.ru/promo/'] },
  { name: "Papa John's Россия", websiteUrl: 'https://www.papajohns.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.ru/aktsii/'] },
  { name: 'Subway Россия', websiteUrl: 'https://www.subway.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.ru/promo/'] },
  { name: 'Шоколадница', websiteUrl: 'https://www.shoko.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.shoko.ru/aktsii/', 'https://www.shoko.ru/promo/'] },
  { name: 'Кофемания', websiteUrl: 'https://www.coffemania.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.coffemania.ru/promo/'] },
  { name: 'Starbucks Россия', websiteUrl: 'https://www.starbucks.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.ru/promo/'] },
  { name: 'Coffee Like', websiteUrl: 'https://coffee-like.com', categorySlug: 'yeme-icme', seedUrls: ['https://coffee-like.com/promo/'] },
  { name: 'Додо Пицца', websiteUrl: 'https://dodopizza.ru', categorySlug: 'yeme-icme', seedUrls: ['https://dodopizza.ru/promo/', 'https://dodopizza.ru/aktsii/'] },
  { name: 'Вкусно и точка', websiteUrl: 'https://vkusnoitochka.ru', categorySlug: 'yeme-icme', seedUrls: ['https://vkusnoitochka.ru/promo/', 'https://vkusnoitochka.ru/aktsii/'] },
  { name: 'Тануки', websiteUrl: 'https://www.tanuki.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.tanuki.ru/aktsii/', 'https://www.tanuki.ru/promo/'] },
  { name: 'Суши WOK', websiteUrl: 'https://sushiwok.ru', categorySlug: 'yeme-icme', seedUrls: ['https://sushiwok.ru/aktsii/'] },
  { name: 'Якитория', websiteUrl: 'https://www.yakitoriya.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.yakitoriya.ru/aktsii/', 'https://www.yakitoriya.ru/promo/'] },
  { name: 'IL Patio', websiteUrl: 'https://www.ilpatio.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.ilpatio.ru/aktsii/'] },
  { name: 'Планета Суши', websiteUrl: 'https://www.planetasushi.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.planetasushi.ru/aktsii/'] },
  { name: 'Теремок', websiteUrl: 'https://www.teremok.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.teremok.ru/aktsii/', 'https://www.teremok.ru/promo/'] },
  { name: 'Му-Му', websiteUrl: 'https://www.cafemumu.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.cafemumu.ru/aktsii/'] },
  { name: 'Крошка Картошка', websiteUrl: 'https://www.kartoshka.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kartoshka.com/aktsii/'] },
  { name: 'Black Star Burger', websiteUrl: 'https://blackstarburger.ru', categorySlug: 'yeme-icme', seedUrls: ['https://blackstarburger.ru/promo/'] },
  { name: 'Krispy Kreme Россия', websiteUrl: 'https://krispykreme.ru', categorySlug: 'yeme-icme', seedUrls: ['https://krispykreme.ru/promo/', 'https://krispykreme.ru/aktsii/'] },
  { name: "Dunkin' Россия", websiteUrl: 'https://www.dunkindonuts.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.ru/promo/'] },
  { name: 'Baskin Robbins Россия', websiteUrl: 'https://www.baskinrobbins.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbins.ru/aktsii/', 'https://www.baskinrobbins.ru/promo/'] },
  { name: 'Cinnabon Россия', websiteUrl: 'https://www.cinnabon.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.cinnabon.ru/promo/'] },
  { name: 'Cofix', websiteUrl: 'https://cofix.ru', categorySlug: 'yeme-icme', seedUrls: ['https://cofix.ru/promo/'] },
  { name: 'One Price Coffee', websiteUrl: 'https://onepricecoffee.com', categorySlug: 'yeme-icme', seedUrls: ['https://onepricecoffee.com/promo/'] },
  { name: 'Surf Coffee', websiteUrl: 'https://www.surfcoffee.ru', categorySlug: 'yeme-icme', seedUrls: ['https://www.surfcoffee.ru/promo/'] },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: "Л'Этуаль", websiteUrl: 'https://www.letu.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.letu.ru/aktsii/', 'https://www.letu.ru/sale/'] },
  { name: 'Рив Гош', websiteUrl: 'https://www.rivegauche.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rivegauche.ru/aktsii/', 'https://www.rivegauche.ru/sale/'] },
  { name: 'Золотое Яблоко', websiteUrl: 'https://goldapple.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://goldapple.ru/promo/', 'https://goldapple.ru/sale/'] },
  { name: 'Подружка', websiteUrl: 'https://www.podrygka.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.podrygka.ru/aktsii/'] },
  { name: 'Магнит Косметик', websiteUrl: 'https://magnitcosmetic.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://magnitcosmetic.ru/aktsii/', 'https://magnitcosmetic.ru/promo/'] },
  { name: 'MAC Россия', websiteUrl: 'https://www.maccosmetics.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.ru/offers'] },
  { name: 'NYX Россия', websiteUrl: 'https://www.nyxcosmetic.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetic.ru/sale/'] },
  { name: 'Maybelline Россия', websiteUrl: 'https://www.maybelline.com.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.ru/promo/'] },
  { name: "L'Oréal Россия", websiteUrl: 'https://www.loreal-paris.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.ru/promo/'] },
  { name: 'Garnier Россия', websiteUrl: 'https://www.garnier.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.ru/promo/'] },
  { name: 'Nivea Россия', websiteUrl: 'https://www.nivea.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.ru/promo/'] },
  { name: 'Dove Россия', websiteUrl: 'https://www.dove.com/ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/ru/promo/'] },
  { name: 'The Body Shop Россия', websiteUrl: 'https://www.thebodyshop.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.ru/sale/', 'https://www.thebodyshop.ru/promo/'] },
  { name: 'Yves Rocher Россия', websiteUrl: 'https://www.yves-rocher.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yves-rocher.ru/aktsii/', 'https://www.yves-rocher.ru/sale/'] },
  { name: 'Lush Россия', websiteUrl: 'https://www.lush.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.ru/promo/'] },
  { name: "Kiehl's Россия", websiteUrl: 'https://www.kiehls.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.ru/offers/', 'https://www.kiehls.ru/promo/'] },
  { name: 'Clinique Россия', websiteUrl: 'https://www.clinique.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.ru/offers'] },
  { name: 'Estée Lauder Россия', websiteUrl: 'https://www.esteelauder.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.ru/offers'] },
  { name: 'Lancôme Россия', websiteUrl: 'https://www.lancome.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lancome.ru/offers/', 'https://www.lancome.ru/promo/'] },
  { name: 'Vichy Россия', websiteUrl: 'https://www.vichy.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.ru/promo/'] },
  { name: 'La Roche-Posay Россия', websiteUrl: 'https://www.laroche-posay.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.ru/promo/'] },
  { name: 'Bioderma Россия', websiteUrl: 'https://www.bioderma.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.ru/promo/'] },
  { name: 'MIXIT', websiteUrl: 'https://mixit.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://mixit.ru/sale/', 'https://mixit.ru/promo/'] },
  { name: 'Natura Siberica', websiteUrl: 'https://www.naturasiberica.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.naturasiberica.ru/sale/', 'https://www.naturasiberica.ru/aktsii/'] },
  { name: 'Organic Shop', websiteUrl: 'https://organicshop.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://organicshop.ru/sale/'] },
  { name: 'Levrana', websiteUrl: 'https://www.levrana.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.levrana.ru/sale/', 'https://www.levrana.ru/aktsii/'] },
  { name: 'ArtDeco Россия', websiteUrl: 'https://www.artdeco.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.artdeco.ru/promo/'] },
  { name: 'Vivienne Sabó', websiteUrl: 'https://www.viviennesabo.com/ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.viviennesabo.com/ru/promo/'] },
  { name: 'Limoni', websiteUrl: 'https://limoni.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://limoni.ru/sale/', 'https://limoni.ru/promo/'] },
  { name: 'ЮниLook', websiteUrl: 'https://www.yunilook.ru', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yunilook.ru/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Спортмастер', websiteUrl: 'https://www.sportmaster.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportmaster.ru/promo/', 'https://www.sportmaster.ru/aktsii/'] },
  { name: 'Декатлон Россия', websiteUrl: 'https://www.decathlon.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.ru/promo/', 'https://www.decathlon.ru/sale/'] },
  { name: 'Nike Россия', websiteUrl: 'https://www.nike.com/ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/ru/w/sale'] },
  { name: 'Adidas Россия', websiteUrl: 'https://www.adidas.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.ru/sale', 'https://www.adidas.ru/promo/'] },
  { name: 'Puma Россия', websiteUrl: 'https://ru.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://ru.puma.com/sale.html', 'https://ru.puma.com/promo/'] },
  { name: 'Reebok Россия', websiteUrl: 'https://www.reebok.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.ru/sale', 'https://www.reebok.ru/promo/'] },
  { name: 'Under Armour Россия', websiteUrl: 'https://www.underarmour.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.ru/sale/'] },
  { name: 'New Balance Россия', websiteUrl: 'https://www.newbalance.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.ru/sale/', 'https://www.newbalance.ru/promo/'] },
  { name: 'ASICS Россия', websiteUrl: 'https://www.asics.com/ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/ru/ru-ru/sale/'] },
  { name: 'Fila Россия', websiteUrl: 'https://fila.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://fila.ru/sale/'] },
  { name: 'Salomon Россия', websiteUrl: 'https://www.salomon.com/ru-ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/ru-ru/sale/'] },
  { name: 'Columbia Россия', websiteUrl: 'https://www.columbia.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.ru/sale/', 'https://www.columbia.ru/promo/'] },
  { name: 'The North Face Россия', websiteUrl: 'https://www.thenorthface.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.ru/sale/'] },
  { name: 'Jack Wolfskin Россия', websiteUrl: 'https://www.jack-wolfskin.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jack-wolfskin.ru/sale/'] },
  { name: 'Merrell Россия', websiteUrl: 'https://www.merrell.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.ru/sale/'] },
  { name: 'Skechers Россия', websiteUrl: 'https://www.skechers.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.ru/sale/'] },
  { name: 'Arena Россия', websiteUrl: 'https://www.arenawaterinstinct.com/ru_ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.arenawaterinstinct.com/ru_ru/sale/'] },
  { name: 'Speedo Россия', websiteUrl: 'https://www.speedo.com/ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.speedo.com/ru/sale/'] },
  { name: 'Demix', websiteUrl: 'https://www.sportmaster.ru/brand/demix/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportmaster.ru/brand/demix/sale/'] },
  { name: 'Nordway', websiteUrl: 'https://www.sportmaster.ru/brand/nordway/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportmaster.ru/brand/nordway/sale/'] },
  { name: 'Outventure', websiteUrl: 'https://www.sportmaster.ru/brand/outventure/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportmaster.ru/brand/outventure/sale/'] },
  { name: 'Kappa Россия', websiteUrl: 'https://kappa-sport.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://kappa-sport.ru/sale/'] },
  { name: 'Lotto Россия', websiteUrl: 'https://lotto-sport.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://lotto-sport.ru/sale/'] },
  { name: 'Joma Россия', websiteUrl: 'https://joma-sport.ru', categorySlug: 'spor-outdoor', seedUrls: ['https://joma-sport.ru/sale/'] },
  { name: 'Wilson Россия', websiteUrl: 'https://www.wilson.com/ru-ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wilson.com/ru-ru/sale/'] },
  { name: 'Head Россия', websiteUrl: 'https://www.head.com/ru-ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.head.com/ru-ru/sale/'] },
  { name: 'Strava', websiteUrl: 'https://www.strava.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.strava.com/subscribe'] },
  { name: 'Garmin Sport Россия', websiteUrl: 'https://www.garmin.com/ru-RU', categorySlug: 'spor-outdoor', seedUrls: ['https://www.garmin.com/ru-RU/sale/'] },
  { name: 'Polar Россия', websiteUrl: 'https://www.polar.com/ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.polar.com/ru/sale/'] },
  { name: 'Suunto Россия', websiteUrl: 'https://www.suunto.com/ru-ru', categorySlug: 'spor-outdoor', seedUrls: ['https://www.suunto.com/ru-ru/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Aviasales', websiteUrl: 'https://www.aviasales.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.aviasales.ru/promo/', 'https://www.aviasales.ru/offers/'] },
  { name: 'Tutu.ru', websiteUrl: 'https://www.tutu.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tutu.ru/promo/', 'https://www.tutu.ru/aktsii/'] },
  { name: 'OneTwoTrip', websiteUrl: 'https://www.onetwotrip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.onetwotrip.com/ru/promo/'] },
  { name: 'Ostrovok', websiteUrl: 'https://ostrovok.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://ostrovok.ru/promo/', 'https://ostrovok.ru/sale/'] },
  { name: 'Яндекс Путешествия', websiteUrl: 'https://travel.yandex.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://travel.yandex.ru/promo/'] },
  { name: 'Аэрофлот', websiteUrl: 'https://www.aeroflot.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.aeroflot.ru/ru-ru/special-offers', 'https://www.aeroflot.ru/ru-ru/information/special_offers'] },
  { name: 'S7 Airlines', websiteUrl: 'https://www.s7.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.s7.ru/ru/info/special-offers/', 'https://www.s7.ru/ru/sale/'] },
  { name: 'Победа', websiteUrl: 'https://www.pobeda.aero', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pobeda.aero/sale/', 'https://www.pobeda.aero/promo/'] },
  { name: 'Уральские авиалинии', websiteUrl: 'https://www.uralairlines.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uralairlines.ru/special-offers/'] },
  { name: 'Nordwind', websiteUrl: 'https://nordwindairlines.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://nordwindairlines.ru/ru/special-offers'] },
  { name: 'Red Wings', websiteUrl: 'https://flyredwings.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://flyredwings.com/promo/'] },
  { name: 'Azur Air', websiteUrl: 'https://www.azurair.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.azurair.ru/promo/'] },
  { name: 'Utair', websiteUrl: 'https://www.utair.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.utair.ru/sale/', 'https://www.utair.ru/special-offers/'] },
  { name: 'РЖД', websiteUrl: 'https://www.rzd.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rzd.ru/ru/9288/page/103290', 'https://pass.rzd.ru/main-pass/public/ru'] },
  { name: 'Яндекс Такси', websiteUrl: 'https://taxi.yandex.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://taxi.yandex.ru/promo/'] },
  { name: 'Яндекс Драйв', websiteUrl: 'https://drive.yandex.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://drive.yandex.ru/promo/'] },
  { name: 'BelkaCar', websiteUrl: 'https://belkacar.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://belkacar.ru/promo/'] },
  { name: 'Делимобиль', websiteUrl: 'https://delimobil.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://delimobil.ru/promo/', 'https://delimobil.ru/aktsii/'] },
  { name: 'CityDrive', websiteUrl: 'https://citydrive.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://citydrive.ru/promo/'] },
  { name: 'Ситимобил', websiteUrl: 'https://city-mobil.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://city-mobil.ru/promo/'] },
  { name: 'Uber Россия', websiteUrl: 'https://www.uber.com/ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/ru/ru/promo/'] },
  { name: 'Bolt Россия', websiteUrl: 'https://bolt.eu/ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://bolt.eu/ru/promo/'] },
  { name: 'Booking.com Россия', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.ru.html'] },
  { name: 'Trivago Россия', websiteUrl: 'https://www.trivago.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.ru/'] },
  { name: 'Hotels.com Россия', websiteUrl: 'https://ru.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://ru.hotels.com/deals/'] },
  { name: 'Agoda Россия', websiteUrl: 'https://www.agoda.com/ru-ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/ru-ru/deals'] },
  { name: 'Airbnb Россия', websiteUrl: 'https://www.airbnb.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.ru/'] },
  { name: 'Суточно.ру', websiteUrl: 'https://sutochno.ru', categorySlug: 'seyahat-ulasim', seedUrls: ['https://sutochno.ru/promo/'] },
  { name: '101Hotels', websiteUrl: 'https://www.101hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.101hotels.com/promo/'] },
  { name: 'Bronevik.com', websiteUrl: 'https://www.bronevik.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bronevik.com/promo/'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Сбербанк', websiteUrl: 'https://www.sberbank.ru', categorySlug: 'finans', seedUrls: ['https://www.sberbank.ru/ru/person/promo', 'https://www.sberbank.ru/ru/person/contributions/'] },
  { name: 'Тинькофф', websiteUrl: 'https://www.tinkoff.ru', categorySlug: 'finans', seedUrls: ['https://www.tinkoff.ru/promo/', 'https://www.tinkoff.ru/cards/debit-cards/tinkoff-black/promo/'] },
  { name: 'ВТБ', websiteUrl: 'https://www.vtb.ru', categorySlug: 'finans', seedUrls: ['https://www.vtb.ru/personal/promo/', 'https://www.vtb.ru/personal/aktsii/'] },
  { name: 'Альфа-Банк', websiteUrl: 'https://alfabank.ru', categorySlug: 'finans', seedUrls: ['https://alfabank.ru/everyday/promo/', 'https://alfabank.ru/promo/'] },
  { name: 'Газпромбанк', websiteUrl: 'https://www.gazprombank.ru', categorySlug: 'finans', seedUrls: ['https://www.gazprombank.ru/personal/promo/'] },
  { name: 'Россельхозбанк', websiteUrl: 'https://www.rshb.ru', categorySlug: 'finans', seedUrls: ['https://www.rshb.ru/promo/'] },
  { name: 'Райффайзенбанк', websiteUrl: 'https://www.raiffeisen.ru', categorySlug: 'finans', seedUrls: ['https://www.raiffeisen.ru/promo/', 'https://www.raiffeisen.ru/retail/promo/'] },
  { name: 'Совкомбанк', websiteUrl: 'https://sovcombank.ru', categorySlug: 'finans', seedUrls: ['https://sovcombank.ru/promo/', 'https://sovcombank.ru/aktsii/'] },
  { name: 'Открытие', websiteUrl: 'https://www.open.ru', categorySlug: 'finans', seedUrls: ['https://www.open.ru/promo/'] },
  { name: 'Промсвязьбанк', websiteUrl: 'https://www.psbank.ru', categorySlug: 'finans', seedUrls: ['https://www.psbank.ru/promo/'] },
  { name: 'МКБ', websiteUrl: 'https://mkb.ru', categorySlug: 'finans', seedUrls: ['https://mkb.ru/promo/'] },
  { name: 'Почта Банк', websiteUrl: 'https://www.pochtabank.ru', categorySlug: 'finans', seedUrls: ['https://www.pochtabank.ru/promo/', 'https://www.pochtabank.ru/aktsii/'] },
  { name: 'Ренессанс Кредит', websiteUrl: 'https://rencredit.ru', categorySlug: 'finans', seedUrls: ['https://rencredit.ru/promo/'] },
  { name: 'Хоум Кредит Банк', websiteUrl: 'https://www.homecredit.ru', categorySlug: 'finans', seedUrls: ['https://www.homecredit.ru/promo/', 'https://www.homecredit.ru/aktsii/'] },
  { name: 'Банк Санкт-Петербург', websiteUrl: 'https://www.bspb.ru', categorySlug: 'finans', seedUrls: ['https://www.bspb.ru/promo/'] },
  { name: 'Уралсиб', websiteUrl: 'https://www.uralsib.ru', categorySlug: 'finans', seedUrls: ['https://www.uralsib.ru/promo/'] },
  { name: 'Юнистрим', websiteUrl: 'https://unistream.com', categorySlug: 'finans', seedUrls: ['https://unistream.com/promo/'] },
  { name: 'Яндекс Pay', websiteUrl: 'https://pay.yandex.ru', categorySlug: 'finans', seedUrls: ['https://pay.yandex.ru/promo/'] },
  { name: 'СберPay', websiteUrl: 'https://www.sberbank.ru/ru/person/sberpay', categorySlug: 'finans', seedUrls: ['https://www.sberbank.ru/ru/person/sberpay/promo/'] },
  { name: 'Тинькофф Pay', websiteUrl: 'https://www.tinkoff.ru/pay', categorySlug: 'finans', seedUrls: ['https://www.tinkoff.ru/pay/promo/'] },
  { name: 'Qiwi', websiteUrl: 'https://qiwi.com', categorySlug: 'finans', seedUrls: ['https://qiwi.com/promo/'] },
  { name: 'WebMoney', websiteUrl: 'https://www.webmoney.ru', categorySlug: 'finans', seedUrls: ['https://www.webmoney.ru/rus/promo/'] },
  { name: 'ЮMoney', websiteUrl: 'https://yoomoney.ru', categorySlug: 'finans', seedUrls: ['https://yoomoney.ru/promo/'] },
  { name: 'Халва', websiteUrl: 'https://halvacard.ru', categorySlug: 'finans', seedUrls: ['https://halvacard.ru/promo/', 'https://halvacard.ru/aktsii/'] },
  { name: 'Совесть', websiteUrl: 'https://sovest.ru', categorySlug: 'finans', seedUrls: ['https://sovest.ru/promo/'] },
  { name: 'Ozon Card', websiteUrl: 'https://www.ozon.ru/ozoncard', categorySlug: 'finans', seedUrls: ['https://www.ozon.ru/ozoncard/promo/'] },
  { name: 'Wildberries Pay', websiteUrl: 'https://www.wildberries.ru', categorySlug: 'finans', seedUrls: ['https://www.wildberries.ru/services/pay/'] },
  { name: 'Tinkoff Инвестиции', websiteUrl: 'https://www.tinkoff.ru/invest', categorySlug: 'finans', seedUrls: ['https://www.tinkoff.ru/invest/promo/'] },
  { name: 'Сбер Инвестиции', websiteUrl: 'https://www.sber-am.ru', categorySlug: 'finans', seedUrls: ['https://www.sber-am.ru/promo/'] },
  { name: 'БКС', websiteUrl: 'https://bcs.ru', categorySlug: 'finans', seedUrls: ['https://bcs.ru/promo/', 'https://bcs.ru/aktsii/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'РЕСО-Гарантия', websiteUrl: 'https://www.reso.ru', categorySlug: 'sigorta', seedUrls: ['https://www.reso.ru/promo/', 'https://www.reso.ru/aktsii/'] },
  { name: 'Ингосстрах', websiteUrl: 'https://www.ingos.ru', categorySlug: 'sigorta', seedUrls: ['https://www.ingos.ru/promo/', 'https://www.ingos.ru/aktsii/'] },
  { name: 'Росгосстрах', websiteUrl: 'https://www.rgs.ru', categorySlug: 'sigorta', seedUrls: ['https://www.rgs.ru/promo/', 'https://www.rgs.ru/aktsii/'] },
  { name: 'АльфаСтрахование', websiteUrl: 'https://www.alfastrah.ru', categorySlug: 'sigorta', seedUrls: ['https://www.alfastrah.ru/promo/', 'https://www.alfastrah.ru/aktsii/'] },
  { name: 'Согласие', websiteUrl: 'https://www.soglasie.ru', categorySlug: 'sigorta', seedUrls: ['https://www.soglasie.ru/promo/'] },
  { name: 'ВСК', websiteUrl: 'https://www.vsk.ru', categorySlug: 'sigorta', seedUrls: ['https://www.vsk.ru/promo/', 'https://www.vsk.ru/aktsii/'] },
  { name: 'Ренессанс Страхование', websiteUrl: 'https://www.renins.com', categorySlug: 'sigorta', seedUrls: ['https://www.renins.com/promo/'] },
  { name: 'МАКС', websiteUrl: 'https://www.makc.ru', categorySlug: 'sigorta', seedUrls: ['https://www.makc.ru/promo/'] },
  { name: 'Сбербанк Страхование', websiteUrl: 'https://sberbankins.ru', categorySlug: 'sigorta', seedUrls: ['https://sberbankins.ru/promo/', 'https://sberbankins.ru/aktsii/'] },
  { name: 'Тинькофф Страхование', websiteUrl: 'https://www.tinkoffinsurance.ru', categorySlug: 'sigorta', seedUrls: ['https://www.tinkoffinsurance.ru/promo/'] },
  { name: 'ВТБ Страхование', websiteUrl: 'https://www.vtbins.ru', categorySlug: 'sigorta', seedUrls: ['https://www.vtbins.ru/promo/'] },
  { name: 'Энергогарант', websiteUrl: 'https://www.energogarant.ru', categorySlug: 'sigorta', seedUrls: ['https://www.energogarant.ru/promo/'] },
  { name: 'Югория', websiteUrl: 'https://www.ugoria.ru', categorySlug: 'sigorta', seedUrls: ['https://www.ugoria.ru/promo/'] },
  { name: 'Зетта Страхование', websiteUrl: 'https://www.zettains.ru', categorySlug: 'sigorta', seedUrls: ['https://www.zettains.ru/promo/'] },
  { name: 'Либерти Страхование', websiteUrl: 'https://www.liberty24.ru', categorySlug: 'sigorta', seedUrls: ['https://www.liberty24.ru/promo/'] },
  { name: 'ERGO Россия', websiteUrl: 'https://www.ergo.ru', categorySlug: 'sigorta', seedUrls: ['https://www.ergo.ru/promo/'] },
  { name: 'Совкомбанк Страхование', websiteUrl: 'https://sovcomins.ru', categorySlug: 'sigorta', seedUrls: ['https://sovcomins.ru/promo/'] },
  { name: 'Абсолют Страхование', websiteUrl: 'https://www.absolutins.ru', categorySlug: 'sigorta', seedUrls: ['https://www.absolutins.ru/promo/'] },
  { name: 'Астро-Волга', websiteUrl: 'https://www.astrovolga.ru', categorySlug: 'sigorta', seedUrls: ['https://www.astrovolga.ru/promo/'] },
  { name: 'БИН Страхование', websiteUrl: 'https://www.binins.ru', categorySlug: 'sigorta', seedUrls: ['https://www.binins.ru/promo/'] },
  { name: 'ГАЙДЕ', websiteUrl: 'https://www.gaide.ru', categorySlug: 'sigorta', seedUrls: ['https://www.gaide.ru/promo/'] },
  { name: 'Гелиос', websiteUrl: 'https://www.ihelios.ru', categorySlug: 'sigorta', seedUrls: ['https://www.ihelios.ru/promo/'] },
  { name: 'Капитал Life', websiteUrl: 'https://www.kaplife.ru', categorySlug: 'sigorta', seedUrls: ['https://www.kaplife.ru/promo/'] },
  { name: 'Опора', websiteUrl: 'https://www.opora-ins.ru', categorySlug: 'sigorta', seedUrls: ['https://www.opora-ins.ru/promo/'] },
  { name: 'Пари', websiteUrl: 'https://www.pari-ins.ru', categorySlug: 'sigorta', seedUrls: ['https://www.pari-ins.ru/promo/'] },
  { name: 'ППФ Страхование жизни', websiteUrl: 'https://www.ppfinsurance.ru', categorySlug: 'sigorta', seedUrls: ['https://www.ppfinsurance.ru/promo/'] },
  { name: 'Райффайзен Life', websiteUrl: 'https://www.raiflife.ru', categorySlug: 'sigorta', seedUrls: ['https://www.raiflife.ru/promo/'] },
  { name: 'Сбербанк Life', websiteUrl: 'https://sberlife.ru', categorySlug: 'sigorta', seedUrls: ['https://sberlife.ru/promo/'] },
  { name: 'СК Согласие', websiteUrl: 'https://www.soglasie.ru', categorySlug: 'sigorta', seedUrls: ['https://www.soglasie.ru/promo/life/'] },
  { name: 'Уралсиб Life', websiteUrl: 'https://www.uralsiblife.ru', categorySlug: 'sigorta', seedUrls: ['https://www.uralsiblife.ru/promo/'] },

  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'LADA', websiteUrl: 'https://www.lada.ru', categorySlug: 'otomobil', seedUrls: ['https://www.lada.ru/actions/', 'https://www.lada.ru/promo/'] },
  { name: 'Toyota Россия', websiteUrl: 'https://www.toyota.ru', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.ru/offers/', 'https://www.toyota.ru/special-offers/'] },
  { name: 'Kia Россия', websiteUrl: 'https://www.kia.ru', categorySlug: 'otomobil', seedUrls: ['https://www.kia.ru/special-offers/', 'https://www.kia.ru/promo/'] },
  { name: 'Hyundai Россия', websiteUrl: 'https://www.hyundai.ru', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.ru/offers/', 'https://www.hyundai.ru/special-offers/'] },
  { name: 'Volkswagen Россия', websiteUrl: 'https://www.volkswagen.ru', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.ru/ru/offers.html'] },
  { name: 'Skoda Россия', websiteUrl: 'https://www.skoda-auto.ru', categorySlug: 'otomobil', seedUrls: ['https://www.skoda-auto.ru/offers/', 'https://www.skoda-auto.ru/promo/'] },
  { name: 'Renault Россия', websiteUrl: 'https://www.renault.ru', categorySlug: 'otomobil', seedUrls: ['https://www.renault.ru/offers/', 'https://www.renault.ru/promo/'] },
  { name: 'Nissan Россия', websiteUrl: 'https://www.nissan.ru', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.ru/offers.html'] },
  { name: 'Mazda Россия', websiteUrl: 'https://www.mazda.ru', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.ru/offers/'] },
  { name: 'Mitsubishi Россия', websiteUrl: 'https://www.mitsubishi-motors.ru', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.ru/offers/'] },
  { name: 'Suzuki Россия', websiteUrl: 'https://www.suzuki-auto.ru', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki-auto.ru/offers/'] },
  { name: 'Honda Россия', websiteUrl: 'https://www.honda.ru', categorySlug: 'otomobil', seedUrls: ['https://www.honda.ru/offers/'] },
  { name: 'BMW Россия', websiteUrl: 'https://www.bmw.ru', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.ru/ru/offers.html', 'https://www.bmw.ru/ru/topics/special-offers.html'] },
  { name: 'Mercedes-Benz Россия', websiteUrl: 'https://www.mercedes-benz.ru', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.ru/passengercars/campaigns.html'] },
  { name: 'Audi Россия', websiteUrl: 'https://www.audi.ru', categorySlug: 'otomobil', seedUrls: ['https://www.audi.ru/ru/web/ru/models/offers.html'] },
  { name: 'Volvo Россия', websiteUrl: 'https://www.volvocars.com/ru', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/ru/offers/'] },
  { name: 'Chery Россия', websiteUrl: 'https://www.chery.ru', categorySlug: 'otomobil', seedUrls: ['https://www.chery.ru/offers/', 'https://www.chery.ru/promo/'] },
  { name: 'Haval Россия', websiteUrl: 'https://www.haval.ru', categorySlug: 'otomobil', seedUrls: ['https://www.haval.ru/offers/'] },
  { name: 'Geely Россия', websiteUrl: 'https://www.geely-motors.com', categorySlug: 'otomobil', seedUrls: ['https://www.geely-motors.com/offers/'] },
  { name: 'Changan Россия', websiteUrl: 'https://changan.ru', categorySlug: 'otomobil', seedUrls: ['https://changan.ru/offers/', 'https://changan.ru/promo/'] },
  { name: 'Exeed Россия', websiteUrl: 'https://www.exeed.ru', categorySlug: 'otomobil', seedUrls: ['https://www.exeed.ru/offers/'] },
  { name: 'Omoda Россия', websiteUrl: 'https://www.omoda.ru', categorySlug: 'otomobil', seedUrls: ['https://www.omoda.ru/offers/'] },
  { name: 'BAIC Россия', websiteUrl: 'https://www.baic-motor.ru', categorySlug: 'otomobil', seedUrls: ['https://www.baic-motor.ru/offers/'] },
  { name: 'Jetour Россия', websiteUrl: 'https://jetour-auto.ru', categorySlug: 'otomobil', seedUrls: ['https://jetour-auto.ru/offers/'] },
  { name: 'Москвич', websiteUrl: 'https://www.moskvich-auto.ru', categorySlug: 'otomobil', seedUrls: ['https://www.moskvich-auto.ru/offers/', 'https://www.moskvich-auto.ru/promo/'] },
  { name: 'Drom.ru', websiteUrl: 'https://www.drom.ru', categorySlug: 'otomobil', seedUrls: ['https://www.drom.ru/promo/'] },
  { name: 'Auto.ru', websiteUrl: 'https://auto.ru', categorySlug: 'otomobil', seedUrls: ['https://auto.ru/promo/'] },
  { name: 'Авито Авто', websiteUrl: 'https://www.avito.ru/rossiya/avtomobili', categorySlug: 'otomobil', seedUrls: ['https://www.avito.ru/rossiya/avtomobili'] },
  { name: 'CarPrice', websiteUrl: 'https://carprice.ru', categorySlug: 'otomobil', seedUrls: ['https://carprice.ru/promo/'] },
  { name: 'Fresh Auto', websiteUrl: 'https://freshautomsk.ru', categorySlug: 'otomobil', seedUrls: ['https://freshautomsk.ru/promo/', 'https://freshautomsk.ru/aktsii/'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Лабиринт', websiteUrl: 'https://www.labirint.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.labirint.ru/actions/', 'https://www.labirint.ru/sale/'] },
  { name: 'Ozon Books', websiteUrl: 'https://www.ozon.ru/category/knigi-16500/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ozon.ru/category/knigi-16500/promo/'] },
  { name: 'Book24', websiteUrl: 'https://book24.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://book24.ru/aktsii/', 'https://book24.ru/sale/'] },
  { name: 'Читай-город', websiteUrl: 'https://www.chitai-gorod.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.chitai-gorod.ru/sales/', 'https://www.chitai-gorod.ru/promotions/'] },
  { name: 'ЛитРес', websiteUrl: 'https://www.litres.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.litres.ru/sales/', 'https://www.litres.ru/promo/'] },
  { name: 'Буквоед', websiteUrl: 'https://www.bookvoed.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookvoed.ru/aktsii/', 'https://www.bookvoed.ru/sale/'] },
  { name: 'Библио-Глобус', websiteUrl: 'https://www.biblio-globus.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.biblio-globus.ru/aktsii/'] },
  { name: 'Московский Дом Книги', websiteUrl: 'https://www.mdk-arbat.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mdk-arbat.ru/aktsii/'] },
  { name: 'MyBook', websiteUrl: 'https://mybook.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://mybook.ru/promo/'] },
  { name: 'Альпина', websiteUrl: 'https://alpinabook.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://alpinabook.ru/sale/', 'https://alpinabook.ru/promo/'] },
  { name: 'Эксмо', websiteUrl: 'https://eksmo.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://eksmo.ru/aktsii/'] },
  { name: 'АСТ', websiteUrl: 'https://ast.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://ast.ru/aktsii/'] },
  { name: 'МИФ', websiteUrl: 'https://www.mann-ivanov-ferber.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mann-ivanov-ferber.ru/sale/', 'https://www.mann-ivanov-ferber.ru/promo/'] },
  { name: 'Яндекс Музыка', websiteUrl: 'https://music.yandex.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://music.yandex.ru/promo/'] },
  { name: 'Spotify Россия', websiteUrl: 'https://www.spotify.com/ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/ru/premium/'] },
  { name: 'Apple Music Россия', websiteUrl: 'https://www.apple.com/ru/apple-music/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.apple.com/ru/apple-music/'] },
  { name: 'Кинопоиск', websiteUrl: 'https://www.kinopoisk.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kinopoisk.ru/promo/'] },
  { name: 'Okko', websiteUrl: 'https://okko.tv', categorySlug: 'kitap-hobi', seedUrls: ['https://okko.tv/promo/'] },
  { name: 'IVI', websiteUrl: 'https://www.ivi.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ivi.ru/promo/'] },
  { name: 'Wink', websiteUrl: 'https://wink.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://wink.ru/promo/'] },
  { name: 'Netflix Россия', websiteUrl: 'https://www.netflix.com/ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/ru/'] },
  { name: 'Steam Россия', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/'] },
  { name: 'PlayStation Россия', websiteUrl: 'https://www.playstation.com/ru-ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.playstation.com/ru-ru/deals/'] },
  { name: 'Xbox Россия', websiteUrl: 'https://www.xbox.com/ru-RU', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/ru-RU/promotions/sales/sale'] },
  { name: 'Nintendo Россия', websiteUrl: 'https://www.nintendo.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.ru/offers/'] },
  { name: 'DNS Games', websiteUrl: 'https://www.dns-shop.ru/catalog/igry/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dns-shop.ru/catalog/igry/sale/'] },
  { name: 'М.Видео Games', websiteUrl: 'https://www.mvideo.ru/igry', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mvideo.ru/promo/igry/'] },
  { name: 'Hobby Games', websiteUrl: 'https://hobbygames.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://hobbygames.ru/sale/', 'https://hobbygames.ru/aktsii/'] },
  { name: 'Мир Хобби', websiteUrl: 'https://www.hobbyworld.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbyworld.ru/sale/', 'https://www.hobbyworld.ru/aktsii/'] },
  { name: 'Леонардо', websiteUrl: 'https://leonardo.ru', categorySlug: 'kitap-hobi', seedUrls: ['https://leonardo.ru/aktsii/', 'https://leonardo.ru/sale/'] },
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
  console.log('=== RU Brand Seeding Script ===\n');

  // Load all categories into a slug -> id map
  const allCats = await prisma.category.findMany();
  const categoryMap = new Map<string, string>();
  for (const c of allCats) {
    categoryMap.set(c.slug, c.id);
  }
  console.log(`Categories ready: ${categoryMap.size} found\n`);

  // Deduplicate
  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Total brands: ${uniqueBrands.length} (${BRANDS.length - uniqueBrands.length} duplicates skipped)\n`);

  // Process brands + sources
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
      // Upsert brand using unique slug+market constraint
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'RU' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'RU',
          categoryId,
        },
      });

      // Check if crawl source already exists for this brand
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
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'RU',
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'RU' },
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

  // Total active sources
  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'RU' } });
  console.log(`Total active RU sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=RU');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
