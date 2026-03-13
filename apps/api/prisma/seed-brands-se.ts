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
  { name: 'CDON', websiteUrl: 'https://www.cdon.se', categorySlug: 'alisveris', seedUrls: ['https://www.cdon.se/rea', 'https://www.cdon.se/erbjudanden'] },
  { name: 'Webhallen', websiteUrl: 'https://www.webhallen.com', categorySlug: 'alisveris', seedUrls: ['https://www.webhallen.com/se/campaign', 'https://www.webhallen.com/se/sale'] },
  { name: 'Elgiganten', websiteUrl: 'https://www.elgiganten.se', categorySlug: 'alisveris', seedUrls: ['https://www.elgiganten.se/kampanjer', 'https://www.elgiganten.se/rea'] },
  { name: 'NetOnNet', websiteUrl: 'https://www.netonnet.se', categorySlug: 'alisveris', seedUrls: ['https://www.netonnet.se/kampanjer', 'https://www.netonnet.se/rea'] },
  { name: 'Tradera', websiteUrl: 'https://www.tradera.com', categorySlug: 'alisveris', seedUrls: ['https://www.tradera.com/'] },
  { name: 'Blocket', websiteUrl: 'https://www.blocket.se', categorySlug: 'alisveris', seedUrls: ['https://www.blocket.se/'] },
  { name: 'Komplett', websiteUrl: 'https://www.komplett.se', categorySlug: 'alisveris', seedUrls: ['https://www.komplett.se/kampanjer', 'https://www.komplett.se/rea'] },
  { name: 'MediaMarkt SE', websiteUrl: 'https://www.mediamarkt.se', categorySlug: 'alisveris', seedUrls: ['https://www.mediamarkt.se/sv/category/erbjudanden.html'] },
  { name: 'Kjell & Company', websiteUrl: 'https://www.kjell.com', categorySlug: 'alisveris', seedUrls: ['https://www.kjell.com/se/kampanjer', 'https://www.kjell.com/se/rea'] },
  { name: 'Dustin', websiteUrl: 'https://www.dustin.se', categorySlug: 'alisveris', seedUrls: ['https://www.dustin.se/kampanjer', 'https://www.dustin.se/rea'] },
  { name: 'Inet', websiteUrl: 'https://www.inet.se', categorySlug: 'alisveris', seedUrls: ['https://www.inet.se/kampanj', 'https://www.inet.se/rea'] },
  { name: 'Amazon SE', websiteUrl: 'https://www.amazon.se', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.se/deals', 'https://www.amazon.se/gp/goldbox'] },
  { name: 'Prisjakt', websiteUrl: 'https://www.prisjakt.nu', categorySlug: 'alisveris', seedUrls: ['https://www.prisjakt.nu/'] },
  { name: 'Pricerunner SE', websiteUrl: 'https://www.pricerunner.se', categorySlug: 'alisveris', seedUrls: ['https://www.pricerunner.se/'] },
  { name: 'IKEA SE', websiteUrl: 'https://www.ikea.com/se', categorySlug: 'alisveris', seedUrls: ['https://www.ikea.com/se/sv/offers/', 'https://www.ikea.com/se/sv/campaigns/'] },
  { name: 'Jula', websiteUrl: 'https://www.jula.se', categorySlug: 'alisveris', seedUrls: ['https://www.jula.se/erbjudanden/', 'https://www.jula.se/kampanjer/'] },
  { name: 'Clas Ohlson', websiteUrl: 'https://www.clasohlson.com/se', categorySlug: 'alisveris', seedUrls: ['https://www.clasohlson.com/se/kampanjer', 'https://www.clasohlson.com/se/rea'] },
  { name: 'Biltema', websiteUrl: 'https://www.biltema.se', categorySlug: 'alisveris', seedUrls: ['https://www.biltema.se/erbjudanden'] },
  { name: 'Byggmax', websiteUrl: 'https://www.byggmax.se', categorySlug: 'alisveris', seedUrls: ['https://www.byggmax.se/erbjudanden', 'https://www.byggmax.se/kampanjer'] },
  { name: 'Power SE', websiteUrl: 'https://www.power.se', categorySlug: 'alisveris', seedUrls: ['https://www.power.se/kampanjer', 'https://www.power.se/rea'] },
  { name: 'Nelly', websiteUrl: 'https://nelly.com/se', categorySlug: 'alisveris', seedUrls: ['https://nelly.com/se/rea/', 'https://nelly.com/se/erbjudanden/'] },
  { name: 'Boozt', websiteUrl: 'https://www.boozt.com/se', categorySlug: 'alisveris', seedUrls: ['https://www.boozt.com/se/sv/sale', 'https://www.boozt.com/se/sv/campaign'] },
  { name: 'Zalando SE', websiteUrl: 'https://www.zalando.se', categorySlug: 'alisveris', seedUrls: ['https://www.zalando.se/rea/', 'https://www.zalando.se/kampanjer/'] },
  { name: 'NA-KD', websiteUrl: 'https://www.na-kd.com/sv', categorySlug: 'alisveris', seedUrls: ['https://www.na-kd.com/sv/rea', 'https://www.na-kd.com/sv/sale'] },
  { name: 'Lyko', websiteUrl: 'https://www.lyko.se', categorySlug: 'alisveris', seedUrls: ['https://www.lyko.se/rea', 'https://www.lyko.se/erbjudanden'] },
  { name: 'Apotea', websiteUrl: 'https://www.apotea.se', categorySlug: 'alisveris', seedUrls: ['https://www.apotea.se/erbjudanden', 'https://www.apotea.se/kampanjer'] },
  { name: 'MatHem', websiteUrl: 'https://www.mathem.se', categorySlug: 'alisveris', seedUrls: ['https://www.mathem.se/erbjudanden'] },
  { name: 'Cervera', websiteUrl: 'https://www.cervera.se', categorySlug: 'alisveris', seedUrls: ['https://www.cervera.se/rea', 'https://www.cervera.se/erbjudanden'] },
  { name: 'Lagerhaus', websiteUrl: 'https://www.lfrancq.se', categorySlug: 'alisveris', seedUrls: ['https://www.lfrancq.se/rea'] },
  { name: 'ÖoB', websiteUrl: 'https://www.oob.se', categorySlug: 'alisveris', seedUrls: ['https://www.oob.se/erbjudanden'] },
  { name: 'Rusta', websiteUrl: 'https://www.rusta.com/se', categorySlug: 'alisveris', seedUrls: ['https://www.rusta.com/se/erbjudanden', 'https://www.rusta.com/se/kampanjer'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung SE', websiteUrl: 'https://www.samsung.com/se', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/se/offer/', 'https://www.samsung.com/se/smartphones/all-smartphones/'] },
  { name: 'Apple SE', websiteUrl: 'https://www.apple.com/se', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/se/shop/go/special_deals'] },
  { name: 'Telia', websiteUrl: 'https://www.telia.se', categorySlug: 'elektronik', seedUrls: ['https://www.telia.se/privat/erbjudanden', 'https://www.telia.se/privat/kampanjer'] },
  { name: 'Tele2', websiteUrl: 'https://www.tele2.se', categorySlug: 'elektronik', seedUrls: ['https://www.tele2.se/erbjudanden', 'https://www.tele2.se/kampanjer'] },
  { name: 'Tre', websiteUrl: 'https://www.tre.se', categorySlug: 'elektronik', seedUrls: ['https://www.tre.se/erbjudanden', 'https://www.tre.se/kampanjer'] },
  { name: 'Telenor SE', websiteUrl: 'https://www.telenor.se', categorySlug: 'elektronik', seedUrls: ['https://www.telenor.se/erbjudanden', 'https://www.telenor.se/kampanjer'] },
  { name: 'Halebop', websiteUrl: 'https://www.halebop.se', categorySlug: 'elektronik', seedUrls: ['https://www.halebop.se/erbjudanden'] },
  { name: 'Comviq', websiteUrl: 'https://www.comviq.se', categorySlug: 'elektronik', seedUrls: ['https://www.comviq.se/erbjudanden'] },
  { name: 'LG SE', websiteUrl: 'https://www.lg.com/se', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/se/kampanjer'] },
  { name: 'Sony SE', websiteUrl: 'https://www.sony.se', categorySlug: 'elektronik', seedUrls: ['https://www.sony.se/erbjudanden'] },
  { name: 'HP SE', websiteUrl: 'https://www.hp.com/se-sv', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/se-sv/shop/erbjudanden'] },
  { name: 'Lenovo SE', websiteUrl: 'https://www.lenovo.com/se/sv', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/se/sv/d/deals/'] },
  { name: 'Dell SE', websiteUrl: 'https://www.dell.com/sv-se', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/sv-se/shop/deals'] },
  { name: 'Asus SE', websiteUrl: 'https://www.asus.com/se', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/se/campaign/'] },
  { name: 'Xiaomi SE', websiteUrl: 'https://www.mi.com/se', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/se/sale'] },
  { name: 'Huawei SE', websiteUrl: 'https://consumer.huawei.com/se', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/se/offer/'] },
  { name: 'Philips SE', websiteUrl: 'https://www.philips.se', categorySlug: 'elektronik', seedUrls: ['https://www.philips.se/c-e/erbjudanden'] },
  { name: 'Canon SE', websiteUrl: 'https://www.canon.se', categorySlug: 'elektronik', seedUrls: ['https://www.canon.se/kampanjer'] },
  { name: 'Logitech SE', websiteUrl: 'https://www.logitech.com/sv-se', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/sv-se/promo.html'] },
  { name: 'JBL SE', websiteUrl: 'https://se.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://se.jbl.com/erbjudanden'] },
  { name: 'Bose SE', websiteUrl: 'https://www.bose.se', categorySlug: 'elektronik', seedUrls: ['https://www.bose.se/erbjudanden'] },
  { name: 'Sonos SE', websiteUrl: 'https://www.sonos.com/sv-se', categorySlug: 'elektronik', seedUrls: ['https://www.sonos.com/sv-se/shop/offers'] },
  { name: 'Dyson SE', websiteUrl: 'https://www.dyson.se', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.se/erbjudanden'] },
  { name: 'GoPro SE', websiteUrl: 'https://gopro.com/sv/se', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/sv/se/deals'] },
  { name: 'Nikon SE', websiteUrl: 'https://www.nikon.se', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.se/kampanjer'] },
  { name: 'Epson SE', websiteUrl: 'https://www.epson.se', categorySlug: 'elektronik', seedUrls: ['https://www.epson.se/kampanjer'] },
  { name: 'TCL SE', websiteUrl: 'https://www.tcl.com/se', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/se/sv/kampanjer'] },
  { name: 'Hisense SE', websiteUrl: 'https://hisense-se.com', categorySlug: 'elektronik', seedUrls: ['https://hisense-se.com/kampanjer'] },
  { name: 'OnePlus SE', websiteUrl: 'https://www.oneplus.com/se', categorySlug: 'elektronik', seedUrls: ['https://www.oneplus.com/se/sale'] },
  { name: 'Motorola SE', websiteUrl: 'https://www.motorola.se', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.se/erbjudanden'] },
  { name: 'Garmin SE', websiteUrl: 'https://www.garmin.com/sv-SE', categorySlug: 'elektronik', seedUrls: ['https://www.garmin.com/sv-SE/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'H&M', websiteUrl: 'https://www2.hm.com/sv_se', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/sv_se/rea.html'] },
  { name: 'Lindex', websiteUrl: 'https://www.lindex.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.lindex.com/se/rea', 'https://www.lindex.com/se/erbjudanden'] },
  { name: 'KappAhl', websiteUrl: 'https://www.kappahl.com/sv-SE', categorySlug: 'giyim-moda', seedUrls: ['https://www.kappahl.com/sv-SE/rea/', 'https://www.kappahl.com/sv-SE/erbjudanden/'] },
  { name: 'Gina Tricot', websiteUrl: 'https://www.ginatricot.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.ginatricot.com/se/rea', 'https://www.ginatricot.com/se/sale'] },
  { name: 'MQ', websiteUrl: 'https://www.marfrancq.se', categorySlug: 'giyim-moda', seedUrls: ['https://www.marfrancq.se/rea'] },
  { name: 'Cubus SE', websiteUrl: 'https://cubus.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://cubus.com/se/rea/'] },
  { name: 'Dressmann SE', websiteUrl: 'https://dfrancq.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://dfrancq.com/se/rea/'] },
  { name: 'Brothers', websiteUrl: 'https://www.brothers.se', categorySlug: 'giyim-moda', seedUrls: ['https://www.brothers.se/rea', 'https://www.brothers.se/sale'] },
  { name: 'Filippa K', websiteUrl: 'https://www.filippa-k.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.filippa-k.com/se/sale'] },
  { name: 'Acne Studios', websiteUrl: 'https://www.acnestudios.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.acnestudios.com/se/en/sale/'] },
  { name: 'Tiger of Sweden', websiteUrl: 'https://www.tigerofsweden.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.tigerofsweden.com/se/sale'] },
  { name: 'J.Lindeberg', websiteUrl: 'https://www.jlindeberg.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.jlindeberg.com/se/sale'] },
  { name: 'Nudie Jeans', websiteUrl: 'https://www.nudiejeans.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.nudiejeans.com/se/sale'] },
  { name: 'Zara SE', websiteUrl: 'https://www.zara.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/se/sv/rea-l1702.html'] },
  { name: 'Nike SE', websiteUrl: 'https://www.nike.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/se/sale'] },
  { name: 'Adidas SE', websiteUrl: 'https://www.adidas.se', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.se/rea', 'https://www.adidas.se/outlet'] },
  { name: 'Levi\'s SE', websiteUrl: 'https://www.levi.com/SE', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com/SE/sale'] },
  { name: 'Mango SE', websiteUrl: 'https://shop.mango.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/se/rea'] },
  { name: 'COS SE', websiteUrl: 'https://www.cos.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.cos.com/se/sale'] },
  { name: 'Arket SE', websiteUrl: 'https://www.arket.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.arket.com/se/sale'] },
  { name: 'Weekday', websiteUrl: 'https://www.weekday.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.weekday.com/se/sale'] },
  { name: 'Monki', websiteUrl: 'https://www.monki.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.monki.com/se/sale'] },
  { name: 'Uniqlo SE', websiteUrl: 'https://www.uniqlo.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/se/sv/sale'] },
  { name: 'Tommy Hilfiger SE', websiteUrl: 'https://se.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://se.tommy.com/rea'] },
  { name: 'Calvin Klein SE', websiteUrl: 'https://www.calvinklein.se', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.se/rea'] },
  { name: 'Björn Borg', websiteUrl: 'https://www.bjornborg.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.bjornborg.com/se/rea', 'https://www.bjornborg.com/se/sale'] },
  { name: 'Odd Molly', websiteUrl: 'https://www.oddmolly.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.oddmolly.com/se/rea'] },
  { name: 'Helly Hansen SE', websiteUrl: 'https://www.hellyhansen.com/sv_se', categorySlug: 'giyim-moda', seedUrls: ['https://www.hellyhansen.com/sv_se/sale'] },
  { name: 'Peak Performance', websiteUrl: 'https://www.peakperformance.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.peakperformance.com/se/sale'] },
  { name: 'Sandqvist', websiteUrl: 'https://www.sandqvist.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.sandqvist.com/se/sale'] },
  { name: 'Happy Socks SE', websiteUrl: 'https://www.happysocks.com/se', categorySlug: 'giyim-moda', seedUrls: ['https://www.happysocks.com/se/rea'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Food & Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'ICA', websiteUrl: 'https://www.ica.se', categorySlug: 'gida-market', seedUrls: ['https://www.ica.se/erbjudanden/', 'https://www.ica.se/kampanjer/'] },
  { name: 'Coop SE', websiteUrl: 'https://www.coop.se', categorySlug: 'gida-market', seedUrls: ['https://www.coop.se/erbjudanden/', 'https://www.coop.se/kampanjer/'] },
  { name: 'Willys', websiteUrl: 'https://www.willys.se', categorySlug: 'gida-market', seedUrls: ['https://www.willys.se/erbjudanden', 'https://www.willys.se/kampanjer'] },
  { name: 'Hemköp', websiteUrl: 'https://www.hemkop.se', categorySlug: 'gida-market', seedUrls: ['https://www.hemkop.se/erbjudanden', 'https://www.hemkop.se/kampanjer'] },
  { name: 'Lidl Sweden', websiteUrl: 'https://www.lidl.se', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.se/erbjudanden', 'https://www.lidl.se/kampanjer'] },
  { name: 'City Gross', websiteUrl: 'https://www.citygross.se', categorySlug: 'gida-market', seedUrls: ['https://www.citygross.se/erbjudanden', 'https://www.citygross.se/kampanjer'] },
  { name: 'Netto SE', websiteUrl: 'https://www.netto.se', categorySlug: 'gida-market', seedUrls: ['https://www.netto.se/erbjudanden'] },
  { name: 'Aldi SE', websiteUrl: 'https://www.aldi.se', categorySlug: 'gida-market', seedUrls: ['https://www.aldi.se/erbjudanden/'] },
  { name: 'MatHem Food', websiteUrl: 'https://www.mathem.se', categorySlug: 'gida-market', seedUrls: ['https://www.mathem.se/erbjudanden'] },
  { name: 'Matsmart', websiteUrl: 'https://www.matsmart.se', categorySlug: 'gida-market', seedUrls: ['https://www.matsmart.se/erbjudanden', 'https://www.matsmart.se/rea'] },
  { name: 'iHerb SE', websiteUrl: 'https://se.iherb.com', categorySlug: 'gida-market', seedUrls: ['https://se.iherb.com/specials'] },
  { name: 'Nespresso SE', websiteUrl: 'https://www.nespresso.com/se', categorySlug: 'gida-market', seedUrls: ['https://www.nespresso.com/se/sv/erbjudanden'] },
  { name: 'HelloFresh SE', websiteUrl: 'https://www.hellofresh.se', categorySlug: 'gida-market', seedUrls: ['https://www.hellofresh.se/erbjudanden'] },
  { name: 'Linas Matkasse', websiteUrl: 'https://www.linasmatkasse.se', categorySlug: 'gida-market', seedUrls: ['https://www.linasmatkasse.se/erbjudanden'] },
  { name: 'Systembolaget', websiteUrl: 'https://www.systembolaget.se', categorySlug: 'gida-market', seedUrls: ['https://www.systembolaget.se/sortiment/nyheter/'] },
  { name: 'Kavall', websiteUrl: 'https://www.kavall.se', categorySlug: 'gida-market', seedUrls: ['https://www.kavall.se/erbjudanden'] },
  { name: 'Hagavägen Mat', websiteUrl: 'https://www.paradiset.se', categorySlug: 'gida-market', seedUrls: ['https://www.paradiset.se/erbjudanden'] },
  { name: 'Axfood', websiteUrl: 'https://www.axfood.se', categorySlug: 'gida-market', seedUrls: ['https://www.axfood.se/erbjudanden'] },
  { name: 'Tempo', websiteUrl: 'https://www.tempo.se', categorySlug: 'gida-market', seedUrls: ['https://www.tempo.se/erbjudanden'] },
  { name: 'ICA Maxi', websiteUrl: 'https://www.ica.se', categorySlug: 'gida-market', seedUrls: ['https://www.ica.se/erbjudanden/'] },
  { name: 'Hemtex Food', websiteUrl: 'https://www.hemtex.se', categorySlug: 'gida-market', seedUrls: ['https://www.hemtex.se/erbjudanden'] },
  { name: 'Godis.se', websiteUrl: 'https://www.godis.se', categorySlug: 'gida-market', seedUrls: ['https://www.godis.se/erbjudanden'] },
  { name: 'Hälsokost', websiteUrl: 'https://www.halsobutiken.se', categorySlug: 'gida-market', seedUrls: ['https://www.halsobutiken.se/erbjudanden'] },
  { name: 'MyProtein SE', websiteUrl: 'https://www.myprotein.se', categorySlug: 'gida-market', seedUrls: ['https://www.myprotein.se/erbjudanden.list'] },
  { name: 'Bodystore', websiteUrl: 'https://www.bodystore.com', categorySlug: 'gida-market', seedUrls: ['https://www.bodystore.com/erbjudanden'] },
  { name: 'Kung Markatta', websiteUrl: 'https://www.kungmarkatta.se', categorySlug: 'gida-market', seedUrls: ['https://www.kungmarkatta.se/erbjudanden'] },
  { name: 'Oatly SE', websiteUrl: 'https://www.oatly.com/se', categorySlug: 'gida-market', seedUrls: ['https://www.oatly.com/se/erbjudanden'] },
  { name: 'Fazer SE', websiteUrl: 'https://www.fazer.se', categorySlug: 'gida-market', seedUrls: ['https://www.fazer.se/erbjudanden'] },
  { name: 'Zoégas', websiteUrl: 'https://www.zoegas.se', categorySlug: 'gida-market', seedUrls: ['https://www.zoegas.se/erbjudanden'] },
  { name: 'Löfbergs', websiteUrl: 'https://www.lofbergs.se', categorySlug: 'gida-market', seedUrls: ['https://www.lofbergs.se/erbjudanden'] },
  { name: 'Dafgårds', websiteUrl: 'https://www.dafgards.se', categorySlug: 'gida-market', seedUrls: ['https://www.dafgards.se/erbjudanden'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Dining (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Foodora SE', websiteUrl: 'https://www.foodora.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.foodora.se/erbjudanden', 'https://www.foodora.se/kampanjer'] },
  { name: 'Uber Eats SE', websiteUrl: 'https://www.ubereats.com/se', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/se/deals'] },
  { name: 'Wolt SE', websiteUrl: 'https://wolt.com/sv/swe', categorySlug: 'yeme-icme', seedUrls: ['https://wolt.com/sv/swe/erbjudanden'] },
  { name: 'Max Hamburgers', websiteUrl: 'https://www.max.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.max.se/erbjudanden', 'https://www.max.se/kampanjer'] },
  { name: 'Espresso House', websiteUrl: 'https://www.espressohouse.com/se', categorySlug: 'yeme-icme', seedUrls: ['https://www.espressohouse.com/se/erbjudanden'] },
  { name: 'McDonald\'s SE', websiteUrl: 'https://www.mcdonalds.com/se', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com/se/sv-se/erbjudanden.html'] },
  { name: 'Burger King SE', websiteUrl: 'https://www.burgerking.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.se/erbjudanden'] },
  { name: 'KFC SE', websiteUrl: 'https://www.kfc.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.se/erbjudanden'] },
  { name: 'Subway SE', websiteUrl: 'https://www.subway.com/sv-SE', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/sv-SE/menunutrition/menu/deals'] },
  { name: 'Domino\'s SE', websiteUrl: 'https://www.dominos.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.se/erbjudanden'] },
  { name: 'Pizza Hut SE', websiteUrl: 'https://www.pizzahut.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.se/erbjudanden'] },
  { name: 'Starbucks SE', websiteUrl: 'https://www.starbucks.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.se/erbjudanden'] },
  { name: 'Wayne\'s Coffee', websiteUrl: 'https://www.waynescoffee.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.waynescoffee.se/erbjudanden'] },
  { name: 'Sibylla', websiteUrl: 'https://www.sibylla.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.sibylla.se/erbjudanden'] },
  { name: 'Bastard Burgers', websiteUrl: 'https://www.bastardburgers.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.bastardburgers.com/erbjudanden'] },
  { name: 'Sushi Yama', websiteUrl: 'https://www.sushiyama.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushiyama.se/erbjudanden'] },
  { name: 'O\'Learys', websiteUrl: 'https://www.olearys.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.olearys.se/erbjudanden'] },
  { name: 'Vapiano SE', websiteUrl: 'https://www.vapiano.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.vapiano.se/erbjudanden'] },
  { name: 'TGI Friday\'s SE', websiteUrl: 'https://www.tgifridays.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.tgifridays.se/erbjudanden'] },
  { name: 'Pinchos', websiteUrl: 'https://www.pinchos.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.pinchos.se/erbjudanden'] },
  { name: 'Pitchers', websiteUrl: 'https://www.pitchers.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.pitchers.se/erbjudanden'] },
  { name: 'Hard Rock Cafe SE', websiteUrl: 'https://www.hardrockcafe.com/location/stockholm', categorySlug: 'yeme-icme', seedUrls: ['https://www.hardrockcafe.com/location/stockholm/deals.aspx'] },
  { name: 'Joe & The Juice SE', websiteUrl: 'https://www.joejuice.com/se', categorySlug: 'yeme-icme', seedUrls: ['https://www.joejuice.com/se/erbjudanden'] },
  { name: 'Taco Bar', websiteUrl: 'https://www.tacobar.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.tacobar.se/erbjudanden'] },
  { name: 'Brödernas', websiteUrl: 'https://www.brodernas.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.brodernas.com/erbjudanden'] },
  { name: 'Five Guys SE', websiteUrl: 'https://www.fiveguys.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.fiveguys.se/'] },
  { name: 'Nando\'s SE', websiteUrl: 'https://www.nandos.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.se/erbjudanden'] },
  { name: 'Jureskog', websiteUrl: 'https://www.jureskog.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.jureskog.se/erbjudanden'] },
  { name: 'Leon SE', websiteUrl: 'https://www.leon.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.leon.se/erbjudanden'] },
  { name: 'Sumo Sushi', websiteUrl: 'https://www.sumosushi.se', categorySlug: 'yeme-icme', seedUrls: ['https://www.sumosushi.se/erbjudanden'] },
  { name: 'Sticks \'n\' Sushi SE', websiteUrl: 'https://www.sticksnsushi.com/se', categorySlug: 'yeme-icme', seedUrls: ['https://www.sticksnsushi.com/se/erbjudanden'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Kicks', websiteUrl: 'https://www.kicks.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kicks.se/rea', 'https://www.kicks.se/erbjudanden'] },
  { name: 'Åhléns', websiteUrl: 'https://www.ahlens.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ahlens.se/rea', 'https://www.ahlens.se/erbjudanden'] },
  { name: 'Lyko Beauty', websiteUrl: 'https://www.lyko.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lyko.se/rea', 'https://www.lyko.se/erbjudanden'] },
  { name: 'Bangerhead', websiteUrl: 'https://www.bangerhead.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bangerhead.se/rea', 'https://www.bangerhead.se/erbjudanden'] },
  { name: 'Eleven SE', websiteUrl: 'https://www.eleven.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eleven.se/rea', 'https://www.eleven.se/erbjudanden'] },
  { name: 'Sephora SE', websiteUrl: 'https://www.sephora.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.se/rea'] },
  { name: 'MAC SE', websiteUrl: 'https://www.maccosmetics.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.se/erbjudanden'] },
  { name: 'Estée Lauder SE', websiteUrl: 'https://www.esteelauder.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.se/erbjudanden'] },
  { name: 'Clinique SE', websiteUrl: 'https://www.clinique.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.se/erbjudanden'] },
  { name: 'The Body Shop SE', websiteUrl: 'https://www.thebodyshop.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.se/rea', 'https://www.thebodyshop.se/erbjudanden'] },
  { name: 'Lush SE', websiteUrl: 'https://www.lush.com/se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/se/rea'] },
  { name: 'L\'Occitane SE', websiteUrl: 'https://se.loccitane.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://se.loccitane.com/rea'] },
  { name: 'Clarins SE', websiteUrl: 'https://www.clarins.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clarins.se/erbjudanden/'] },
  { name: 'Rituals SE', websiteUrl: 'https://www.rituals.com/sv-se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/sv-se/sale'] },
  { name: 'Kiehl\'s SE', websiteUrl: 'https://www.kiehls.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.se/erbjudanden'] },
  { name: 'Charlotte Tilbury SE', websiteUrl: 'https://www.charlottetilbury.com/se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.charlottetilbury.com/se/sale'] },
  { name: 'Dermalogica SE', websiteUrl: 'https://www.dermalogica.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dermalogica.se/erbjudanden'] },
  { name: 'La Roche-Posay SE', websiteUrl: 'https://www.laroche-posay.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.se/erbjudanden'] },
  { name: 'Vichy SE', websiteUrl: 'https://www.vichy.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.se/erbjudanden'] },
  { name: 'Bioderma SE', websiteUrl: 'https://www.bioderma.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.se/erbjudanden'] },
  { name: 'Apoteket', websiteUrl: 'https://www.apoteket.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.apoteket.se/erbjudanden/', 'https://www.apoteket.se/kampanjer/'] },
  { name: 'Kronans Apotek', websiteUrl: 'https://www.kronansapotek.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kronansapotek.se/erbjudanden'] },
  { name: 'Apotek Hjärtat', websiteUrl: 'https://www.apotekhjartat.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.apotekhjartat.se/erbjudanden/', 'https://www.apotekhjartat.se/kampanjer/'] },
  { name: 'Nivea SE', websiteUrl: 'https://www.nivea.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.se/erbjudanden'] },
  { name: 'Garnier SE', websiteUrl: 'https://www.garnier.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.se/erbjudanden'] },
  { name: 'L\'Oréal SE', websiteUrl: 'https://www.loreal-paris.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.se/erbjudanden'] },
  { name: 'NYX SE', websiteUrl: 'https://www.nyxcosmetics.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.se/rea'] },
  { name: 'Maybelline SE', websiteUrl: 'https://www.maybelline.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.se/erbjudanden'] },
  { name: 'Yves Rocher SE', websiteUrl: 'https://www.yves-rocher.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yves-rocher.se/rea'] },
  { name: 'Oriflame SE', websiteUrl: 'https://www.oriflame.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.oriflame.se/erbjudanden'] },
  { name: 'Notino SE', websiteUrl: 'https://www.notino.se', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.notino.se/rea/', 'https://www.notino.se/erbjudanden/'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA Home SE', websiteUrl: 'https://www.ikea.com/se', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/se/sv/offers/'] },
  { name: 'JYSK SE', websiteUrl: 'https://www.jysk.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.jysk.se/erbjudanden', 'https://www.jysk.se/rea'] },
  { name: 'Mio', websiteUrl: 'https://www.mio.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.mio.se/rea', 'https://www.mio.se/erbjudanden'] },
  { name: 'Ellos Home', websiteUrl: 'https://www.ellos.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.ellos.se/hem/rea', 'https://www.ellos.se/hem/erbjudanden'] },
  { name: 'Hemtex', websiteUrl: 'https://www.hemtex.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.hemtex.se/rea', 'https://www.hemtex.se/erbjudanden'] },
  { name: 'Granit', websiteUrl: 'https://www.granit.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.granit.com/sv/rea'] },
  { name: 'Zara Home SE', websiteUrl: 'https://www.zarahome.com/se', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/se/rea-l1555.html'] },
  { name: 'H&M Home SE', websiteUrl: 'https://www2.hm.com/sv_se/hem.html', categorySlug: 'ev-yasam', seedUrls: ['https://www2.hm.com/sv_se/hem/rea.html'] },
  { name: 'Indiska', websiteUrl: 'https://www.indiska.com/se', categorySlug: 'ev-yasam', seedUrls: ['https://www.indiska.com/se/rea'] },
  { name: 'Designtorget', websiteUrl: 'https://www.designtorget.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.designtorget.se/rea'] },
  { name: 'Rum21', websiteUrl: 'https://www.rum21.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.rum21.se/rea'] },
  { name: 'Norrgavel', websiteUrl: 'https://www.norrgavel.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.norrgavel.se/rea'] },
  { name: 'Svenssons i Lammhult', websiteUrl: 'https://www.sfrancq.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.sfrancq.se/rea'] },
  { name: 'Länna Möbler', websiteUrl: 'https://www.lannamobler.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.lannamobler.se/rea'] },
  { name: 'Bauhaus SE', websiteUrl: 'https://www.bauhaus.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.bauhaus.se/erbjudanden', 'https://www.bauhaus.se/kampanjer'] },
  { name: 'Hornbach SE', websiteUrl: 'https://www.hornbach.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.hornbach.se/erbjudanden'] },
  { name: 'K-Rauta SE', websiteUrl: 'https://www.krauta.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.krauta.se/erbjudanden'] },
  { name: 'Plantagen', websiteUrl: 'https://www.plantagen.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.plantagen.se/erbjudanden', 'https://www.plantagen.se/kampanjer'] },
  { name: 'Granngården', websiteUrl: 'https://www.granngarden.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.granngarden.se/erbjudanden'] },
  { name: 'Miele SE', websiteUrl: 'https://www.miele.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.miele.se/erbjudanden'] },
  { name: 'Electrolux SE', websiteUrl: 'https://www.electrolux.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.electrolux.se/erbjudanden/'] },
  { name: 'Bosch Home SE', websiteUrl: 'https://www.bosch-home.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.bosch-home.se/erbjudanden'] },
  { name: 'Siemens Home SE', websiteUrl: 'https://www.siemens-home.bsh-group.com/se', categorySlug: 'ev-yasam', seedUrls: ['https://www.siemens-home.bsh-group.com/se/erbjudanden'] },
  { name: 'Trademax', websiteUrl: 'https://www.trademax.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.trademax.se/rea', 'https://www.trademax.se/erbjudanden'] },
  { name: 'Chilli', websiteUrl: 'https://www.chilli.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.chilli.se/erbjudanden'] },
  { name: 'Jollyroom', websiteUrl: 'https://www.jollyroom.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.jollyroom.se/rea', 'https://www.jollyroom.se/erbjudanden'] },
  { name: 'BabyV', websiteUrl: 'https://www.babyv.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.babyv.se/rea'] },
  { name: 'Panduro', websiteUrl: 'https://www.panduro.com/sv-se', categorySlug: 'ev-yasam', seedUrls: ['https://www.panduro.com/sv-se/rea'] },
  { name: 'Flying Tiger SE', websiteUrl: 'https://flyingtiger.com/sv-SE', categorySlug: 'ev-yasam', seedUrls: ['https://flyingtiger.com/sv-SE/erbjudanden'] },
  { name: 'Desenio', websiteUrl: 'https://desenio.se', categorySlug: 'ev-yasam', seedUrls: ['https://desenio.se/rea/'] },
  { name: 'Duka', websiteUrl: 'https://www.dfrancq.se', categorySlug: 'ev-yasam', seedUrls: ['https://www.dfrancq.se/rea'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor (spor-outdoor) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Stadium', websiteUrl: 'https://www.stadium.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.stadium.se/rea', 'https://www.stadium.se/erbjudanden'] },
  { name: 'XXL SE', websiteUrl: 'https://www.xxl.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.xxl.se/rea', 'https://www.xxl.se/erbjudanden'] },
  { name: 'Sportamore', websiteUrl: 'https://www.sportamore.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportamore.se/rea', 'https://www.sportamore.se/erbjudanden'] },
  { name: 'Intersport SE', websiteUrl: 'https://www.intersport.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.se/rea', 'https://www.intersport.se/erbjudanden'] },
  { name: 'Nike Sport SE', websiteUrl: 'https://www.nike.com/se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/se/sale'] },
  { name: 'Adidas Sport SE', websiteUrl: 'https://www.adidas.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.se/rea'] },
  { name: 'New Balance SE', websiteUrl: 'https://www.newbalance.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.se/rea'] },
  { name: 'Puma SE', websiteUrl: 'https://se.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://se.puma.com/rea'] },
  { name: 'Under Armour SE', websiteUrl: 'https://www.underarmour.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.se/rea'] },
  { name: 'Asics SE', websiteUrl: 'https://www.asics.com/se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/se/rea'] },
  { name: 'Reebok SE', websiteUrl: 'https://www.reebok.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.se/rea'] },
  { name: 'Salomon SE', websiteUrl: 'https://www.salomon.com/sv-se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/sv-se/sale'] },
  { name: 'Fjällräven', websiteUrl: 'https://www.fjallraven.com/se/sv-se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fjallraven.com/se/sv-se/rea'] },
  { name: 'Haglöfs', websiteUrl: 'https://www.haglofs.com/se/sv-se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.haglofs.com/se/sv-se/sale'] },
  { name: 'Helly Hansen SE', websiteUrl: 'https://www.hellyhansen.com/sv_se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.com/sv_se/sale'] },
  { name: 'Peak Performance Sport', websiteUrl: 'https://www.peakperformance.com/se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.peakperformance.com/se/sale'] },
  { name: 'The North Face SE', websiteUrl: 'https://www.thenorthface.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.se/rea'] },
  { name: 'Columbia SE', websiteUrl: 'https://www.columbiasportswear.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.se/rea'] },
  { name: 'Naturkompaniet', websiteUrl: 'https://www.naturkompaniet.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.naturkompaniet.se/rea/', 'https://www.naturkompaniet.se/erbjudanden/'] },
  { name: 'Outnorth', websiteUrl: 'https://www.outnorth.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.outnorth.se/rea'] },
  { name: 'Addnature', websiteUrl: 'https://www.addnature.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.addnature.se/rea'] },
  { name: 'Craft SE', websiteUrl: 'https://www.craft.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.craft.se/rea'] },
  { name: 'Skechers SE', websiteUrl: 'https://www.skechers.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.se/rea'] },
  { name: 'Vans SE', websiteUrl: 'https://www.vans.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.se/rea'] },
  { name: 'Converse SE', websiteUrl: 'https://www.converse.com/se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com/se/rea'] },
  { name: 'Crocs SE', websiteUrl: 'https://www.crocs.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.crocs.se/rea'] },
  { name: 'SATS SE', websiteUrl: 'https://www.sats.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sats.se/erbjudanden/'] },
  { name: 'Nordic Wellness', websiteUrl: 'https://www.nordicwellness.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nordicwellness.se/erbjudanden'] },
  { name: 'Actic', websiteUrl: 'https://www.actic.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.actic.se/erbjudanden'] },
  { name: 'Thule SE', websiteUrl: 'https://www.thule.com/sv-se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thule.com/sv-se/sale'] },
  { name: 'Merrell SE', websiteUrl: 'https://www.merrell.se', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.se/rea'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SAS', websiteUrl: 'https://www.flysas.com/sv', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flysas.com/sv/erbjudanden/', 'https://www.flysas.com/sv/kampanjer/'] },
  { name: 'Norwegian SE', websiteUrl: 'https://www.norwegian.com/sv', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.norwegian.com/sv/erbjudanden/'] },
  { name: 'Ving', websiteUrl: 'https://www.ving.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ving.se/erbjudanden', 'https://www.ving.se/kampanjer'] },
  { name: 'Fritidsresor', websiteUrl: 'https://www.tui.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tui.se/erbjudanden', 'https://www.tui.se/kampanjer'] },
  { name: 'Apollo SE', websiteUrl: 'https://www.apollo.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.apollo.se/erbjudanden', 'https://www.apollo.se/kampanjer'] },
  { name: 'Ryanair SE', websiteUrl: 'https://www.ryanair.com/se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/se/sv/erbjudanden'] },
  { name: 'Booking SE', websiteUrl: 'https://www.booking.com/country/se.html', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.html?cc1=se'] },
  { name: 'SJ', websiteUrl: 'https://www.sj.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sj.se/sv/erbjudanden', 'https://www.sj.se/sv/kampanjer'] },
  { name: 'Expedia SE', websiteUrl: 'https://www.expedia.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.se/erbjudanden'] },
  { name: 'Airbnb SE', websiteUrl: 'https://www.airbnb.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.se/'] },
  { name: 'Trivago SE', websiteUrl: 'https://www.trivago.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.se/'] },
  { name: 'Kayak SE', websiteUrl: 'https://www.kayak.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.se/erbjudanden'] },
  { name: 'Skyscanner SE', websiteUrl: 'https://www.skyscanner.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.se/erbjudanden'] },
  { name: 'Hotels.com SE', websiteUrl: 'https://sv.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://sv.hotels.com/deals'] },
  { name: 'FlixBus SE', websiteUrl: 'https://www.flixbus.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.se/erbjudanden'] },
  { name: 'Uber SE', websiteUrl: 'https://www.uber.com/se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/se/sv/ride/'] },
  { name: 'Bolt SE', websiteUrl: 'https://bolt.eu/sv-se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://bolt.eu/sv-se/erbjudanden/'] },
  { name: 'Europcar SE', websiteUrl: 'https://www.europcar.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.se/erbjudanden'] },
  { name: 'Hertz SE', websiteUrl: 'https://www.hertz.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.se/erbjudanden'] },
  { name: 'Avis SE', websiteUrl: 'https://www.avis.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avis.se/erbjudanden'] },
  { name: 'Sixt SE', websiteUrl: 'https://www.sixt.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sixt.se/erbjudanden'] },
  { name: 'Sunclass Airlines', websiteUrl: 'https://www.sunclass.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sunclass.se/erbjudanden'] },
  { name: 'easyJet SE', websiteUrl: 'https://www.easyjet.com/sv', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easyjet.com/sv/erbjudanden'] },
  { name: 'Wizz Air SE', websiteUrl: 'https://wizzair.com/sv-se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://wizzair.com/sv-se#/erbjudanden'] },
  { name: 'Scandic Hotels', websiteUrl: 'https://www.scandichotels.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.scandichotels.se/erbjudanden', 'https://www.scandichotels.se/kampanjer'] },
  { name: 'Nordic Choice Hotels', websiteUrl: 'https://www.nordicchoicehotels.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nordicchoicehotels.se/erbjudanden'] },
  { name: 'Best Western SE', websiteUrl: 'https://www.bestwestern.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bestwestern.se/erbjudanden'] },
  { name: 'Stena Line SE', websiteUrl: 'https://www.stenaline.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.stenaline.se/erbjudanden', 'https://www.stenaline.se/kampanjer'] },
  { name: 'Viking Line', websiteUrl: 'https://www.vikingline.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vikingline.se/erbjudanden', 'https://www.vikingline.se/kampanjer'] },
  { name: 'Tallink Silja Line', websiteUrl: 'https://www.tallinksilja.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tallinksilja.se/erbjudanden'] },
  { name: 'Destination Gotland', websiteUrl: 'https://www.destinationgotland.se', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.destinationgotland.se/erbjudanden'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Handelsbanken', websiteUrl: 'https://www.handelsbanken.se', categorySlug: 'finans', seedUrls: ['https://www.handelsbanken.se/sv/privat/erbjudanden'] },
  { name: 'SEB', websiteUrl: 'https://www.seb.se', categorySlug: 'finans', seedUrls: ['https://www.seb.se/privat/erbjudanden'] },
  { name: 'Swedbank', websiteUrl: 'https://www.swedbank.se', categorySlug: 'finans', seedUrls: ['https://www.swedbank.se/privat/erbjudanden.html'] },
  { name: 'Nordea SE', websiteUrl: 'https://www.nordea.se', categorySlug: 'finans', seedUrls: ['https://www.nordea.se/privat/erbjudanden/'] },
  { name: 'Klarna', websiteUrl: 'https://www.klarna.com/se', categorySlug: 'finans', seedUrls: ['https://www.klarna.com/se/erbjudanden/', 'https://www.klarna.com/se/kampanjer/'] },
  { name: 'Swish', websiteUrl: 'https://www.swish.nu', categorySlug: 'finans', seedUrls: ['https://www.swish.nu/'] },
  { name: 'Avanza', websiteUrl: 'https://www.avanza.se', categorySlug: 'finans', seedUrls: ['https://www.avanza.se/erbjudanden.html'] },
  { name: 'Nordnet SE', websiteUrl: 'https://www.nordnet.se', categorySlug: 'finans', seedUrls: ['https://www.nordnet.se/kampanjer/'] },
  { name: 'Länsförsäkringar Bank', websiteUrl: 'https://www.lansforsakringar.se', categorySlug: 'finans', seedUrls: ['https://www.lansforsakringar.se/privat/erbjudanden/'] },
  { name: 'ICA Banken', websiteUrl: 'https://www.icabanken.se', categorySlug: 'finans', seedUrls: ['https://www.icabanken.se/erbjudanden/'] },
  { name: 'Coop MedMera Bank', websiteUrl: 'https://www.coopmedmera.se', categorySlug: 'finans', seedUrls: ['https://www.coopmedmera.se/erbjudanden'] },
  { name: 'Revolut SE', websiteUrl: 'https://www.revolut.com/sv-SE', categorySlug: 'finans', seedUrls: ['https://www.revolut.com/sv-SE/erbjudanden'] },
  { name: 'N26 SE', websiteUrl: 'https://n26.com/sv-se', categorySlug: 'finans', seedUrls: ['https://n26.com/sv-se/erbjudanden'] },
  { name: 'Lunar SE', websiteUrl: 'https://www.lunar.app/se', categorySlug: 'finans', seedUrls: ['https://www.lunar.app/se/erbjudanden'] },
  { name: 'Visa SE', websiteUrl: 'https://www.visa.se', categorySlug: 'finans', seedUrls: ['https://www.visa.se/erbjudanden-och-kampanjer.html'] },
  { name: 'Mastercard SE', websiteUrl: 'https://www.mastercard.se', categorySlug: 'finans', seedUrls: ['https://www.mastercard.se/sv-se/konsument/erbjudanden.html'] },
  { name: 'American Express SE', websiteUrl: 'https://www.americanexpress.com/se', categorySlug: 'finans', seedUrls: ['https://www.americanexpress.com/se/erbjudanden/'] },
  { name: 'PayPal SE', websiteUrl: 'https://www.paypal.com/se', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/se/webapps/mpp/offers'] },
  { name: 'Wise SE', websiteUrl: 'https://wise.com/se', categorySlug: 'finans', seedUrls: ['https://wise.com/se/'] },
  { name: 'Skandia', websiteUrl: 'https://www.skandia.se', categorySlug: 'finans', seedUrls: ['https://www.skandia.se/erbjudanden/'] },
  { name: 'Folksam Bank', websiteUrl: 'https://www.folksam.se', categorySlug: 'finans', seedUrls: ['https://www.folksam.se/erbjudanden'] },
  { name: 'SBAB', websiteUrl: 'https://www.sbab.se', categorySlug: 'finans', seedUrls: ['https://www.sbab.se/erbjudanden'] },
  { name: 'Lendo', websiteUrl: 'https://www.lendo.se', categorySlug: 'finans', seedUrls: ['https://www.lendo.se/erbjudanden'] },
  { name: 'Resurs Bank', websiteUrl: 'https://www.resursbank.se', categorySlug: 'finans', seedUrls: ['https://www.resursbank.se/erbjudanden'] },
  { name: 'Collector Bank', websiteUrl: 'https://www.collector.se', categorySlug: 'finans', seedUrls: ['https://www.collector.se/erbjudanden'] },
  { name: 'TF Bank', websiteUrl: 'https://www.tfbank.se', categorySlug: 'finans', seedUrls: ['https://www.tfbank.se/erbjudanden'] },
  { name: 'Marginalen Bank', websiteUrl: 'https://www.marginalen.se', categorySlug: 'finans', seedUrls: ['https://www.marginalen.se/erbjudanden'] },
  { name: 'Svea Bank', websiteUrl: 'https://www.svea.com/se', categorySlug: 'finans', seedUrls: ['https://www.svea.com/se/sv/erbjudanden/'] },
  { name: 'Luno SE', websiteUrl: 'https://www.luno.com/sv/se', categorySlug: 'finans', seedUrls: ['https://www.luno.com/sv/se/erbjudanden'] },
  { name: 'Safello', websiteUrl: 'https://www.safello.com/sv', categorySlug: 'finans', seedUrls: ['https://www.safello.com/sv/erbjudanden'] },
  { name: 'Degiro SE', websiteUrl: 'https://www.degiro.se', categorySlug: 'finans', seedUrls: ['https://www.degiro.se/erbjudanden'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Folksam', websiteUrl: 'https://www.folksam.se', categorySlug: 'sigorta', seedUrls: ['https://www.folksam.se/erbjudanden', 'https://www.folksam.se/kampanjer'] },
  { name: 'Trygg-Hansa', websiteUrl: 'https://www.trygghansa.se', categorySlug: 'sigorta', seedUrls: ['https://www.trygghansa.se/erbjudanden', 'https://www.trygghansa.se/kampanjer'] },
  { name: 'Länsförsäkringar', websiteUrl: 'https://www.lansforsakringar.se', categorySlug: 'sigorta', seedUrls: ['https://www.lansforsakringar.se/privat/erbjudanden/'] },
  { name: 'IF SE', websiteUrl: 'https://www.if.se', categorySlug: 'sigorta', seedUrls: ['https://www.if.se/privat/erbjudanden'] },
  { name: 'Gjensidige SE', websiteUrl: 'https://www.gjensidige.se', categorySlug: 'sigorta', seedUrls: ['https://www.gjensidige.se/erbjudanden'] },
  { name: 'Skandia Insurance', websiteUrl: 'https://www.skandia.se', categorySlug: 'sigorta', seedUrls: ['https://www.skandia.se/forsakring/erbjudanden/'] },
  { name: 'Dina Försäkringar', websiteUrl: 'https://www.dfrancq.se', categorySlug: 'sigorta', seedUrls: ['https://www.dfrancq.se/erbjudanden'] },
  { name: 'Moderna Försäkringar', websiteUrl: 'https://www.modernaforsakringar.se', categorySlug: 'sigorta', seedUrls: ['https://www.modernaforsakringar.se/erbjudanden'] },
  { name: 'Hedvig', websiteUrl: 'https://www.hedvig.com/se', categorySlug: 'sigorta', seedUrls: ['https://www.hedvig.com/se/erbjudanden'] },
  { name: 'ICA Försäkring', websiteUrl: 'https://www.icaforsakring.se', categorySlug: 'sigorta', seedUrls: ['https://www.icaforsakring.se/erbjudanden'] },
  { name: 'Bliwa', websiteUrl: 'https://www.bliwa.se', categorySlug: 'sigorta', seedUrls: ['https://www.bliwa.se/erbjudanden'] },
  { name: 'Gar-Bo', websiteUrl: 'https://www.gar-bo.se', categorySlug: 'sigorta', seedUrls: ['https://www.gar-bo.se/erbjudanden'] },
  { name: 'Protector SE', websiteUrl: 'https://www.protectorforsakring.se', categorySlug: 'sigorta', seedUrls: ['https://www.protectorforsakring.se/erbjudanden'] },
  { name: 'Zurich SE', websiteUrl: 'https://www.zurich.se', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.se/erbjudanden'] },
  { name: 'Allianz SE', websiteUrl: 'https://www.allianz.se', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.se/erbjudanden'] },
  { name: 'AIG SE', websiteUrl: 'https://www.aig.se', categorySlug: 'sigorta', seedUrls: ['https://www.aig.se/erbjudanden'] },
  { name: 'Euro Accident', websiteUrl: 'https://www.euroaccident.se', categorySlug: 'sigorta', seedUrls: ['https://www.euroaccident.se/erbjudanden'] },
  { name: 'SPP', websiteUrl: 'https://www.spp.se', categorySlug: 'sigorta', seedUrls: ['https://www.spp.se/erbjudanden'] },
  { name: 'AMF', websiteUrl: 'https://www.amf.se', categorySlug: 'sigorta', seedUrls: ['https://www.amf.se/erbjudanden'] },
  { name: 'Alecta', websiteUrl: 'https://www.alecta.se', categorySlug: 'sigorta', seedUrls: ['https://www.alecta.se/erbjudanden'] },
  { name: 'KPA Pension', websiteUrl: 'https://www.kpa.se', categorySlug: 'sigorta', seedUrls: ['https://www.kpa.se/erbjudanden'] },
  { name: 'Collectum', websiteUrl: 'https://www.collectum.se', categorySlug: 'sigorta', seedUrls: ['https://www.collectum.se/erbjudanden'] },
  { name: 'SEB Försäkring', websiteUrl: 'https://www.seb.se', categorySlug: 'sigorta', seedUrls: ['https://www.seb.se/privat/forsakring/erbjudanden'] },
  { name: 'Swedbank Försäkring', websiteUrl: 'https://www.swedbank.se', categorySlug: 'sigorta', seedUrls: ['https://www.swedbank.se/privat/forsakring/erbjudanden.html'] },
  { name: 'Nordea Försäkring', websiteUrl: 'https://www.nordea.se', categorySlug: 'sigorta', seedUrls: ['https://www.nordea.se/privat/forsakring/erbjudanden/'] },
  { name: 'Lassus Tandvårdsförsäkring', websiteUrl: 'https://www.lassus.se', categorySlug: 'sigorta', seedUrls: ['https://www.lassus.se/erbjudanden'] },
  { name: 'Agria', websiteUrl: 'https://www.agria.se', categorySlug: 'sigorta', seedUrls: ['https://www.agria.se/erbjudanden/', 'https://www.agria.se/kampanjer/'] },
  { name: 'Sveland', websiteUrl: 'https://www.sveland.se', categorySlug: 'sigorta', seedUrls: ['https://www.sveland.se/erbjudanden'] },
  { name: 'Svedea', websiteUrl: 'https://www.svedea.se', categorySlug: 'sigorta', seedUrls: ['https://www.svedea.se/erbjudanden'] },
  { name: 'ERV SE', websiteUrl: 'https://www.erv.se', categorySlug: 'sigorta', seedUrls: ['https://www.erv.se/erbjudanden'] },
  { name: 'Gouda SE', websiteUrl: 'https://www.gouda.se', categorySlug: 'sigorta', seedUrls: ['https://www.gouda.se/erbjudanden'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Volvo Cars', websiteUrl: 'https://www.volvocars.com/se', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/se/erbjudanden/'] },
  { name: 'Polestar', websiteUrl: 'https://www.polestar.com/se', categorySlug: 'otomobil', seedUrls: ['https://www.polestar.com/se/erbjudanden/'] },
  { name: 'Toyota SE', websiteUrl: 'https://www.toyota.se', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.se/erbjudanden', 'https://www.toyota.se/kampanjer'] },
  { name: 'Volkswagen SE', websiteUrl: 'https://www.volkswagen.se', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.se/sv/erbjudanden.html'] },
  { name: 'BMW SE', websiteUrl: 'https://www.bmw.se', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.se/sv/offers.html'] },
  { name: 'Mercedes-Benz SE', websiteUrl: 'https://www.mercedes-benz.se', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.se/passengercars/campaigns.html'] },
  { name: 'Audi SE', websiteUrl: 'https://www.audi.se', categorySlug: 'otomobil', seedUrls: ['https://www.audi.se/se/web/sv/erbjudanden.html'] },
  { name: 'Hyundai SE', websiteUrl: 'https://www.hyundai.com/se', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/se/erbjudanden'] },
  { name: 'Kia SE', websiteUrl: 'https://www.kia.com/se', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/se/erbjudanden/'] },
  { name: 'Ford SE', websiteUrl: 'https://www.ford.se', categorySlug: 'otomobil', seedUrls: ['https://www.ford.se/erbjudanden/', 'https://www.ford.se/kampanjer/'] },
  { name: 'Nissan SE', websiteUrl: 'https://www.nissan.se', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.se/erbjudanden.html'] },
  { name: 'Renault SE', websiteUrl: 'https://www.renault.se', categorySlug: 'otomobil', seedUrls: ['https://www.renault.se/erbjudanden.html'] },
  { name: 'Skoda SE', websiteUrl: 'https://www.skoda.se', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.se/erbjudanden.html'] },
  { name: 'SEAT SE', websiteUrl: 'https://www.seat.se', categorySlug: 'otomobil', seedUrls: ['https://www.seat.se/erbjudanden.html'] },
  { name: 'Cupra SE', websiteUrl: 'https://www.cupraofficial.se', categorySlug: 'otomobil', seedUrls: ['https://www.cupraofficial.se/erbjudanden.html'] },
  { name: 'Mazda SE', websiteUrl: 'https://www.mazda.se', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.se/erbjudanden/'] },
  { name: 'Suzuki SE', websiteUrl: 'https://www.suzuki.se', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.se/erbjudanden'] },
  { name: 'Honda SE', websiteUrl: 'https://www.honda.se', categorySlug: 'otomobil', seedUrls: ['https://www.honda.se/erbjudanden'] },
  { name: 'Mitsubishi SE', websiteUrl: 'https://www.mitsubishi-motors.se', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.se/erbjudanden'] },
  { name: 'Dacia SE', websiteUrl: 'https://www.dacia.se', categorySlug: 'otomobil', seedUrls: ['https://www.dacia.se/erbjudanden.html'] },
  { name: 'Tesla SE', websiteUrl: 'https://www.tesla.com/sv_se', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/sv_se/'] },
  { name: 'Porsche SE', websiteUrl: 'https://www.porsche.com/sweden', categorySlug: 'otomobil', seedUrls: ['https://www.porsche.com/sweden/erbjudanden/'] },
  { name: 'Jeep SE', websiteUrl: 'https://www.jeep.se', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.se/erbjudanden'] },
  { name: 'Fiat SE', websiteUrl: 'https://www.fiat.se', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.se/erbjudanden'] },
  { name: 'Citroën SE', websiteUrl: 'https://www.citroen.se', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.se/erbjudanden.html'] },
  { name: 'Peugeot SE', websiteUrl: 'https://www.peugeot.se', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.se/erbjudanden.html'] },
  { name: 'Opel SE', websiteUrl: 'https://www.opel.se', categorySlug: 'otomobil', seedUrls: ['https://www.opel.se/erbjudanden.html'] },
  { name: 'OKQ8', websiteUrl: 'https://www.okq8.se', categorySlug: 'otomobil', seedUrls: ['https://www.okq8.se/erbjudanden/', 'https://www.okq8.se/kampanjer/'] },
  { name: 'Circle K SE', websiteUrl: 'https://www.circlek.se', categorySlug: 'otomobil', seedUrls: ['https://www.circlek.se/erbjudanden'] },
  { name: 'Preem', websiteUrl: 'https://www.preem.se', categorySlug: 'otomobil', seedUrls: ['https://www.preem.se/erbjudanden/'] },
  { name: 'Mekonomen', websiteUrl: 'https://www.mekonomen.se', categorySlug: 'otomobil', seedUrls: ['https://www.mekonomen.se/erbjudanden', 'https://www.mekonomen.se/kampanjer'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Bokus', websiteUrl: 'https://www.bokus.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bokus.com/rea', 'https://www.bokus.com/erbjudanden'] },
  { name: 'Adlibris', websiteUrl: 'https://www.adlibris.com/se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.adlibris.com/se/rea', 'https://www.adlibris.com/se/erbjudanden'] },
  { name: 'Akademibokhandeln', websiteUrl: 'https://www.akademibokhandeln.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.akademibokhandeln.se/rea', 'https://www.akademibokhandeln.se/erbjudanden'] },
  { name: 'Storytel', websiteUrl: 'https://www.storytel.com/se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.storytel.com/se/sv/erbjudanden'] },
  { name: 'BookBeat', websiteUrl: 'https://www.bookbeat.com/se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookbeat.com/se/erbjudanden'] },
  { name: 'Nextory', websiteUrl: 'https://www.nextory.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nextory.se/erbjudanden'] },
  { name: 'Netflix SE', websiteUrl: 'https://www.netflix.com/se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/se/'] },
  { name: 'Disney+ SE', websiteUrl: 'https://www.disneyplus.com/sv-se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/sv-se/'] },
  { name: 'HBO Max SE', websiteUrl: 'https://www.max.com/se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.max.com/se/'] },
  { name: 'Viaplay', websiteUrl: 'https://viaplay.se', categorySlug: 'kitap-hobi', seedUrls: ['https://viaplay.se/erbjudanden'] },
  { name: 'Spotify SE', websiteUrl: 'https://www.spotify.com/se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/se/premium/'] },
  { name: 'Amazon Prime SE', websiteUrl: 'https://www.primevideo.com/region/eu', categorySlug: 'kitap-hobi', seedUrls: ['https://www.primevideo.com/region/eu/'] },
  { name: 'Apple Music SE', websiteUrl: 'https://www.apple.com/se/apple-music', categorySlug: 'kitap-hobi', seedUrls: ['https://www.apple.com/se/apple-music/'] },
  { name: 'PlayStation SE', websiteUrl: 'https://store.playstation.com/sv-se', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/sv-se/category/erbjudanden'] },
  { name: 'Xbox SE', websiteUrl: 'https://www.xbox.com/sv-SE', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/sv-SE/games/sales-and-specials'] },
  { name: 'Nintendo SE', websiteUrl: 'https://www.nintendo.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.se/store/deals/'] },
  { name: 'Steam SE', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Lego SE', websiteUrl: 'https://www.lego.com/sv-se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/sv-se/categories/sales-and-deals'] },
  { name: 'SF Bio', websiteUrl: 'https://www.sfbio.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sfbio.se/erbjudanden'] },
  { name: 'Filmstaden', websiteUrl: 'https://www.filmstaden.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.filmstaden.se/erbjudanden'] },
  { name: 'Ticketmaster SE', websiteUrl: 'https://www.ticketmaster.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ticketmaster.se/erbjudanden'] },
  { name: 'Biljett.nu', websiteUrl: 'https://www.biljett.nu', categorySlug: 'kitap-hobi', seedUrls: ['https://www.biljett.nu/erbjudanden'] },
  { name: 'Sci-Fi Bokhandeln', websiteUrl: 'https://www.sfbok.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sfbok.se/rea'] },
  { name: 'Spelbutiken', websiteUrl: 'https://www.spelbutiken.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spelbutiken.se/rea/'] },
  { name: 'Toys R Us SE', websiteUrl: 'https://www.toysrus.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.se/erbjudanden', 'https://www.toysrus.se/rea'] },
  { name: 'Lekmer', websiteUrl: 'https://www.lekmer.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lekmer.se/rea', 'https://www.lekmer.se/erbjudanden'] },
  { name: 'Udemy SE', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=sv&src=ukw&q=erbjudanden'] },
  { name: 'Coursera SE', websiteUrl: 'https://www.coursera.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coursera.org/deals'] },
  { name: 'Domestika SE', websiteUrl: 'https://www.domestika.org/sv', categorySlug: 'kitap-hobi', seedUrls: ['https://www.domestika.org/sv/sale'] },
  { name: 'Audible SE', websiteUrl: 'https://www.audible.com/se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.com/se/deals'] },
  { name: 'Norstedts', websiteUrl: 'https://www.norstedts.se', categorySlug: 'kitap-hobi', seedUrls: ['https://www.norstedts.se/rea'] },
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
  console.log('=== SE Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'SE' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'SE', categoryId: category.id },
      });

      brandsOk++;

      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, crawlMethod: CrawlMethod.CAMPAIGN },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Deals`,
            crawlMethod: CrawlMethod.CAMPAIGN,
            seedUrls: entry.seedUrls,
            maxDepth: 2,
            schedule: '0 10 * * *',
            agingDays: 7,
            market: 'SE',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'SE' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'SE', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active SE sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
