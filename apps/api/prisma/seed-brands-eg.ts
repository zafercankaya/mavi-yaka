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
  { name: 'Jumia', websiteUrl: 'https://www.jumia.com.eg', categorySlug: 'alisveris', seedUrls: ['https://www.jumia.com.eg/deals/', 'https://www.jumia.com.eg/flash-sales/'] },
  { name: 'Amazon EG', websiteUrl: 'https://www.amazon.eg', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.eg/deals', 'https://www.amazon.eg/gp/goldbox'] },
  { name: 'Noon', websiteUrl: 'https://www.noon.com/egypt-en', categorySlug: 'alisveris', seedUrls: ['https://www.noon.com/egypt-en/deals/', 'https://www.noon.com/egypt-en/offers/'] },
  { name: 'B.TECH', websiteUrl: 'https://btech.com', categorySlug: 'alisveris', seedUrls: ['https://btech.com/en/offers', 'https://btech.com/en/deals'] },
  { name: '2B', websiteUrl: 'https://www.2b.com.eg', categorySlug: 'alisveris', seedUrls: ['https://www.2b.com.eg/en/offers.html', 'https://www.2b.com.eg/en/deals.html'] },
  { name: 'Carrefour Egypt', websiteUrl: 'https://www.carrefouregypt.com', categorySlug: 'alisveris', seedUrls: ['https://www.carrefouregypt.com/mafegy/en/offers', 'https://www.carrefouregypt.com/mafegy/en/weekly-deals'] },
  { name: 'Fawry', websiteUrl: 'https://www.fawry.com', categorySlug: 'alisveris', seedUrls: ['https://www.fawry.com/offers', 'https://www.fawry.com/deals'] },
  { name: 'Souq', websiteUrl: 'https://egypt.souq.com', categorySlug: 'alisveris', seedUrls: ['https://egypt.souq.com/eg-en/deals/'] },
  { name: 'AliExpress EG', websiteUrl: 'https://www.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://www.aliexpress.com/wholesale', 'https://sale.aliexpress.com/__pc/sale.htm'] },
  { name: 'Talabat Market', websiteUrl: 'https://www.talabat.com/egypt', categorySlug: 'alisveris', seedUrls: ['https://www.talabat.com/egypt/groceries/offers'] },
  { name: 'Raya Shop', websiteUrl: 'https://www.rayashop.com', categorySlug: 'alisveris', seedUrls: ['https://www.rayashop.com/offers', 'https://www.rayashop.com/deals'] },
  { name: 'Homzmart', websiteUrl: 'https://www.homzmart.com', categorySlug: 'alisveris', seedUrls: ['https://www.homzmart.com/en/sale', 'https://www.homzmart.com/en/offers'] },
  { name: 'Temu EG', websiteUrl: 'https://www.temu.com', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/deals'] },
  { name: 'Ubuy Egypt', websiteUrl: 'https://www.ubuy.com.eg', categorySlug: 'alisveris', seedUrls: ['https://www.ubuy.com.eg/en/deals'] },
  { name: 'eBay EG', websiteUrl: 'https://www.ebay.com', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.com/deals'] },
  { name: 'OpenSooq', websiteUrl: 'https://eg.opensooq.com', categorySlug: 'alisveris', seedUrls: ['https://eg.opensooq.com/en'] },
  { name: 'OLX Egypt', websiteUrl: 'https://www.olx.com.eg', categorySlug: 'alisveris', seedUrls: ['https://www.olx.com.eg/en/'] },
  { name: 'Bsata', websiteUrl: 'https://bsata.com', categorySlug: 'alisveris', seedUrls: ['https://bsata.com/offers', 'https://bsata.com/deals'] },
  { name: 'El Araby Group', websiteUrl: 'https://elarabygroup.com', categorySlug: 'alisveris', seedUrls: ['https://elarabygroup.com/en/offers', 'https://elarabygroup.com/en/promotions'] },
  { name: 'City Stars', websiteUrl: 'https://www.citystars.com.eg', categorySlug: 'alisveris', seedUrls: ['https://www.citystars.com.eg/offers', 'https://www.citystars.com.eg/events'] },
  { name: 'Mall of Egypt', websiteUrl: 'https://www.mallofegypt.com', categorySlug: 'alisveris', seedUrls: ['https://www.mallofegypt.com/en/offers', 'https://www.mallofegypt.com/en/events'] },
  { name: 'Cairo Festival City Mall', websiteUrl: 'https://www.cairofestivalcity.com', categorySlug: 'alisveris', seedUrls: ['https://www.cairofestivalcity.com/en/offers'] },
  { name: 'Mall of Arabia', websiteUrl: 'https://www.mallofarabia.com.eg', categorySlug: 'alisveris', seedUrls: ['https://www.mallofarabia.com.eg/en/offers'] },
  { name: 'Couponsawy', websiteUrl: 'https://www.couponsawy.com', categorySlug: 'alisveris', seedUrls: ['https://www.couponsawy.com/offers', 'https://www.couponsawy.com/coupons'] },
  { name: 'Yashry', websiteUrl: 'https://yashry.com', categorySlug: 'alisveris', seedUrls: ['https://yashry.com/en/offers', 'https://yashry.com/en/deals'] },
  { name: 'Shein EG', websiteUrl: 'https://eg.shein.com', categorySlug: 'alisveris', seedUrls: ['https://eg.shein.com/sale-c-2503.html', 'https://eg.shein.com/flash-sale.html'] },
  { name: 'Tager', websiteUrl: 'https://www.tfrgy.com', categorySlug: 'alisveris', seedUrls: ['https://www.tfrgy.com/offers'] },
  { name: 'Egypt Gold', websiteUrl: 'https://www.egyptgold.com', categorySlug: 'alisveris', seedUrls: ['https://www.egyptgold.com/offers'] },
  { name: 'Free Market', websiteUrl: 'https://www.freemarket-eg.com', categorySlug: 'alisveris', seedUrls: ['https://www.freemarket-eg.com/offers'] },
  { name: 'Wasla', websiteUrl: 'https://wasla.com', categorySlug: 'alisveris', seedUrls: ['https://wasla.com/offers'] },
  { name: 'Rabbit', websiteUrl: 'https://www.rabbit.com.eg', categorySlug: 'alisveris', seedUrls: ['https://www.rabbit.com.eg/offers'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'B.TECH Electronics', websiteUrl: 'https://btech.com', categorySlug: 'elektronik', seedUrls: ['https://btech.com/en/electronics-offers', 'https://btech.com/en/mobile-offers'] },
  { name: '2B Electronics', websiteUrl: 'https://www.2b.com.eg', categorySlug: 'elektronik', seedUrls: ['https://www.2b.com.eg/en/electronics/offers.html'] },
  { name: 'Samsung Egypt', websiteUrl: 'https://www.samsung.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/eg/offer/', 'https://www.samsung.com/eg/smartphones/all-smartphones/'] },
  { name: 'Apple', websiteUrl: 'https://www.apple.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/eg/shop/go/trade_in'] },
  { name: 'LG Egypt', websiteUrl: 'https://www.lg.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/eg/promotions'] },
  { name: 'Raya', websiteUrl: 'https://www.rfranchise.com', categorySlug: 'elektronik', seedUrls: ['https://www.rfranchise.com/offers', 'https://www.rfranchise.com/deals'] },
  { name: 'Sony Egypt', websiteUrl: 'https://store.sony.com.eg', categorySlug: 'elektronik', seedUrls: ['https://store.sony.com.eg/offers', 'https://store.sony.com.eg/promotions'] },
  { name: 'Huawei Egypt', websiteUrl: 'https://consumer.huawei.com/eg-en', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/eg-en/offer/'] },
  { name: 'Xiaomi Egypt', websiteUrl: 'https://www.mi.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/eg/sale'] },
  { name: 'OPPO Egypt', websiteUrl: 'https://www.oppo.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/eg/offer/', 'https://www.oppo.com/eg/events/'] },
  { name: 'Vivo Egypt', websiteUrl: 'https://www.vivo.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com/eg/offer'] },
  { name: 'Realme Egypt', websiteUrl: 'https://www.realme.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/eg/deals'] },
  { name: 'Nokia Egypt', websiteUrl: 'https://www.nokia.com/phones/en_eg', categorySlug: 'elektronik', seedUrls: ['https://www.nokia.com/phones/en_eg/offers'] },
  { name: 'Lenovo Egypt', websiteUrl: 'https://www.lenovo.com/eg/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/eg/en/d/deals/'] },
  { name: 'HP Egypt', websiteUrl: 'https://www.hp.com/eg-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/eg-en/shop/offer.aspx'] },
  { name: 'Dell Egypt', websiteUrl: 'https://www.dell.com/en-eg', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-eg/shop/deals'] },
  { name: 'Vodafone Egypt', websiteUrl: 'https://www.vodafone.com.eg', categorySlug: 'elektronik', seedUrls: ['https://www.vodafone.com.eg/en/offers', 'https://www.vodafone.com.eg/en/deals'] },
  { name: 'Orange Egypt', websiteUrl: 'https://www.orange.eg', categorySlug: 'elektronik', seedUrls: ['https://www.orange.eg/en/offers', 'https://www.orange.eg/en/deals'] },
  { name: 'Etisalat Egypt', websiteUrl: 'https://www.etisalat.eg', categorySlug: 'elektronik', seedUrls: ['https://www.etisalat.eg/en/offers', 'https://www.etisalat.eg/en/deals'] },
  { name: 'WE Egypt', websiteUrl: 'https://te.eg', categorySlug: 'elektronik', seedUrls: ['https://te.eg/en/offers', 'https://te.eg/en/deals'] },
  { name: 'Union Air', websiteUrl: 'https://www.unionair.com', categorySlug: 'elektronik', seedUrls: ['https://www.unionair.com/offers', 'https://www.unionair.com/promotions'] },
  { name: 'Tornado Egypt', websiteUrl: 'https://www.tornado.com.eg', categorySlug: 'elektronik', seedUrls: ['https://www.tornado.com.eg/en/offers'] },
  { name: 'Sharp Egypt', websiteUrl: 'https://www.sharp.com.eg', categorySlug: 'elektronik', seedUrls: ['https://www.sharp.com.eg/offers', 'https://www.sharp.com.eg/promotions'] },
  { name: 'Toshiba Egypt', websiteUrl: 'https://www.toshibaarabia.com', categorySlug: 'elektronik', seedUrls: ['https://www.toshibaarabia.com/offers'] },
  { name: 'Beko Egypt', websiteUrl: 'https://www.beko.com.eg', categorySlug: 'elektronik', seedUrls: ['https://www.beko.com.eg/campaigns'] },
  { name: 'Bosch Egypt', websiteUrl: 'https://www.bosch-home.com.eg', categorySlug: 'elektronik', seedUrls: ['https://www.bosch-home.com.eg/special-offers'] },
  { name: 'Whirlpool Egypt', websiteUrl: 'https://www.whirlpoolmea.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.whirlpoolmea.com/eg/offers'] },
  { name: 'Fresh Electric', websiteUrl: 'https://www.freshegypt.com', categorySlug: 'elektronik', seedUrls: ['https://www.freshegypt.com/offers', 'https://www.freshegypt.com/promotions'] },
  { name: 'Zanussi Egypt', websiteUrl: 'https://www.zanussi.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.zanussi.com/eg/offers'] },
  { name: 'Dyson Egypt', websiteUrl: 'https://www.dyson.com.eg', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.com.eg/offers'] },
  { name: 'TCL Egypt', websiteUrl: 'https://www.tcl.com/eg/en', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/eg/en/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'LC Waikiki', websiteUrl: 'https://www.lcwaikiki.com.eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.lcwaikiki.com.eg/en/sale', 'https://www.lcwaikiki.com.eg/en/campaign'] },
  { name: 'DeFacto', websiteUrl: 'https://www.defacto.com.eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.defacto.com.eg/sale', 'https://www.defacto.com.eg/campaign'] },
  { name: 'H&M Egypt', websiteUrl: 'https://eg.hm.com', categorySlug: 'giyim-moda', seedUrls: ['https://eg.hm.com/en/sale', 'https://eg.hm.com/en/offers'] },
  { name: 'Zara Egypt', websiteUrl: 'https://www.zara.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/eg/en/sale-l1702.html'] },
  { name: 'Max Fashion', websiteUrl: 'https://www.maxfashion.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.maxfashion.com/eg/en/sale', 'https://www.maxfashion.com/eg/en/offers'] },
  { name: 'American Eagle Egypt', websiteUrl: 'https://www.aeo-me.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.aeo-me.com/eg/en/sale'] },
  { name: 'Cotton On Egypt', websiteUrl: 'https://cottonon.com/EG', categorySlug: 'giyim-moda', seedUrls: ['https://cottonon.com/EG/sale/'] },
  { name: 'Pull & Bear Egypt', websiteUrl: 'https://www.pullandbear.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/eg/en/sale-n6486'] },
  { name: 'Bershka Egypt', websiteUrl: 'https://www.bershka.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/eg/en/sale/'] },
  { name: 'Stradivarius Egypt', websiteUrl: 'https://www.stradivarius.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/eg/en/sale-c1020196507.html'] },
  { name: 'Massimo Dutti Egypt', websiteUrl: 'https://www.massimodutti.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/eg/en/sale/'] },
  { name: 'Mango Egypt', websiteUrl: 'https://shop.mango.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/eg/en/sale'] },
  { name: 'Splash', websiteUrl: 'https://www.splashfashions.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.splashfashions.com/eg/en/sale', 'https://www.splashfashions.com/eg/en/offers'] },
  { name: 'Centrepoint Egypt', websiteUrl: 'https://www.centrepointstores.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.centrepointstores.com/eg/en/sale'] },
  { name: 'Aldo Egypt', websiteUrl: 'https://www.aldoshoes.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.aldoshoes.com/eg/en/sale'] },
  { name: 'Charles & Keith Egypt', websiteUrl: 'https://www.charleskeith.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/eg/sale'] },
  { name: 'Tommy Hilfiger Egypt', websiteUrl: 'https://egypt.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://egypt.tommy.com/sale'] },
  { name: 'Calvin Klein Egypt', websiteUrl: 'https://egypt.calvinklein.com', categorySlug: 'giyim-moda', seedUrls: ['https://egypt.calvinklein.com/sale'] },
  { name: 'Levi\'s Egypt', websiteUrl: 'https://www.levi.com.eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com.eg/sale'] },
  { name: 'Gap Egypt', websiteUrl: 'https://www.gap.com.eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.gap.com.eg/sale'] },
  { name: 'Twist Egypt', websiteUrl: 'https://www.twistegypt.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.twistegypt.com/sale'] },
  { name: 'Karim Ghaleb', websiteUrl: 'https://www.karimghaleb.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.karimghaleb.com/sale', 'https://www.karimghaleb.com/offers'] },
  { name: 'Concrete Egypt', websiteUrl: 'https://www.concreteegypt.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.concreteegypt.com/sale'] },
  { name: 'Oysho Egypt', websiteUrl: 'https://www.oysho.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.oysho.com/eg/en/sale/'] },
  { name: 'Intimissimi Egypt', websiteUrl: 'https://www.intimissimi.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.intimissimi.com/eg/en/sale/'] },
  { name: 'Tezenis Egypt', websiteUrl: 'https://www.tezenis.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.tezenis.com/eg/en/sale/'] },
  { name: 'Lacoste Egypt', websiteUrl: 'https://www.lacoste.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com/eg/sale/'] },
  { name: 'Guess Egypt', websiteUrl: 'https://www.guess.eu/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.eu/eg/en/sale/'] },
  { name: 'New Yorker Egypt', websiteUrl: 'https://www.newyorker.de/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.newyorker.de/eg/en/sale/'] },
  { name: 'Koton Egypt', websiteUrl: 'https://www.koton.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.koton.com/eg/en/sale'] },
  { name: 'Forever 21 Egypt', websiteUrl: 'https://www.forever21.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.forever21.com/eg/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living (ev-yasam) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA Egypt', websiteUrl: 'https://www.ikea.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/eg/en/offers/', 'https://www.ikea.com/eg/en/campaigns/'] },
  { name: 'ACE Hardware Egypt', websiteUrl: 'https://www.acehardware.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.acehardware.com.eg/offers', 'https://www.acehardware.com.eg/promotions'] },
  { name: 'Home Centre Egypt', websiteUrl: 'https://www.homecentre.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.homecentre.com/eg/en/sale'] },
  { name: 'Homes r Us Egypt', websiteUrl: 'https://www.homesrus.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.homesrus.com/eg/en/sale', 'https://www.homesrus.com/eg/en/offers'] },
  { name: 'Pottery Barn Egypt', websiteUrl: 'https://www.potterybarn.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.potterybarn.com.eg/sale'] },
  { name: 'West Elm Egypt', websiteUrl: 'https://www.westelm.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.westelm.com.eg/sale'] },
  { name: 'Crate & Barrel Egypt', websiteUrl: 'https://www.crateandbarrel.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.crateandbarrel.com.eg/sale'] },
  { name: 'Pan Home Egypt', websiteUrl: 'https://www.pan-home.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.pan-home.com/eg/en/sale'] },
  { name: 'Mobica', websiteUrl: 'https://www.mobica.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.mobica.com/offers', 'https://www.mobica.com/sale'] },
  { name: 'Furniture House Egypt', websiteUrl: 'https://www.furniturehouse.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.furniturehouse.com.eg/offers'] },
  { name: 'Zara Home Egypt', websiteUrl: 'https://www.zarahome.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/eg/en/sale/'] },
  { name: 'Marina Home Egypt', websiteUrl: 'https://www.marinahomefurnishings.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.marinahomefurnishings.com/sale'] },
  { name: 'IDdesign Egypt', websiteUrl: 'https://www.iddesign.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.iddesign.com/eg/en/sale', 'https://www.iddesign.com/eg/en/offers'] },
  { name: 'THE One Egypt', websiteUrl: 'https://www.theone.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.theone.com/sale'] },
  { name: 'Muji Egypt', websiteUrl: 'https://www.muji.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.muji.com/eg/sale'] },
  { name: 'Abyat Egypt', websiteUrl: 'https://www.abyat.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.abyat.com/en-eg/offers'] },
  { name: 'Homebox Egypt', websiteUrl: 'https://www.homeboxstores.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.homeboxstores.com/eg/en/sale'] },
  { name: 'Banta Furniture', websiteUrl: 'https://www.banta.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.banta.com.eg/offers'] },
  { name: 'Mahgoub', websiteUrl: 'https://www.mahgoub.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.mahgoub.com/offers', 'https://www.mahgoub.com/promotions'] },
  { name: 'Duravit Egypt', websiteUrl: 'https://www.duravit.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.duravit.com.eg/offers'] },
  { name: 'Roca Egypt', websiteUrl: 'https://www.rfranchise.com/roca', categorySlug: 'ev-yasam', seedUrls: ['https://www.rfranchise.com/roca/offers'] },
  { name: 'Jumbo Egypt', websiteUrl: 'https://www.jumbo.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.jumbo.com.eg/offers'] },
  { name: 'Egypt Lighting', websiteUrl: 'https://www.egyptlighting.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.egyptlighting.com/offers'] },
  { name: 'Sagrada Egypt', websiteUrl: 'https://www.sagrada-eg.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.sagrada-eg.com/sale'] },
  { name: 'Home Works Egypt', websiteUrl: 'https://www.homeworks.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.homeworks.com.eg/offers'] },
  { name: 'SKM Egypt', websiteUrl: 'https://www.skm.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.skm.com.eg/offers'] },
  { name: 'Bedding N Beyond', websiteUrl: 'https://www.beddingnbeyond.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.beddingnbeyond.com/sale'] },
  { name: 'Tavola Egypt', websiteUrl: 'https://www.tavola.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.tavola.com.eg/sale'] },
  { name: 'Ras Home', websiteUrl: 'https://www.rashome.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.rashome.com.eg/offers'] },
  { name: 'Fix Egypt', websiteUrl: 'https://www.fix.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.fix.com.eg/offers'] },
  { name: 'DAF Egypt', websiteUrl: 'https://www.daf.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.daf.com.eg/offers'] },

  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Carrefour Grocery', websiteUrl: 'https://www.carrefouregypt.com', categorySlug: 'gida-market', seedUrls: ['https://www.carrefouregypt.com/mafegy/en/grocery-deals', 'https://www.carrefouregypt.com/mafegy/en/offers'] },
  { name: 'Spinneys Egypt', websiteUrl: 'https://www.spinneys-egypt.com', categorySlug: 'gida-market', seedUrls: ['https://www.spinneys-egypt.com/offers', 'https://www.spinneys-egypt.com/promotions'] },
  { name: 'Kazyon', websiteUrl: 'https://www.kazyon.com', categorySlug: 'gida-market', seedUrls: ['https://www.kazyon.com/offers', 'https://www.kazyon.com/promotions'] },
  { name: 'Fathalla Market', websiteUrl: 'https://www.fathalla.com', categorySlug: 'gida-market', seedUrls: ['https://www.fathalla.com/offers', 'https://www.fathalla.com/promotions'] },
  { name: 'Metro Markets', websiteUrl: 'https://www.metro.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.metro.com.eg/offers', 'https://www.metro.com.eg/deals'] },
  { name: 'Kheir Zaman', websiteUrl: 'https://www.kheirzaman.com', categorySlug: 'gida-market', seedUrls: ['https://www.kheirzaman.com/offers'] },
  { name: 'Seoudi Market', websiteUrl: 'https://www.seoudi.com', categorySlug: 'gida-market', seedUrls: ['https://www.seoudi.com/offers', 'https://www.seoudi.com/promotions'] },
  { name: 'Oscar Grand Stores', websiteUrl: 'https://www.oscar.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.oscar.com.eg/offers'] },
  { name: 'Alfa Market', websiteUrl: 'https://www.alfamarket.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.alfamarket.com.eg/offers', 'https://www.alfamarket.com.eg/deals'] },
  { name: 'Ragab Sons', websiteUrl: 'https://www.ragabsons.com', categorySlug: 'gida-market', seedUrls: ['https://www.ragabsons.com/offers', 'https://www.ragabsons.com/promotions'] },
  { name: 'Hyper One', websiteUrl: 'https://www.hyperone.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.hyperone.com.eg/offers', 'https://www.hyperone.com.eg/deals'] },
  { name: 'Lulu Hypermarket Egypt', websiteUrl: 'https://www.luluhypermarket.com/en-eg', categorySlug: 'gida-market', seedUrls: ['https://www.luluhypermarket.com/en-eg/offers'] },
  { name: 'BIM Egypt', websiteUrl: 'https://www.bim.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.bim.com.eg/offers', 'https://www.bim.com.eg/weekly-deals'] },
  { name: 'Awlad Ragab', websiteUrl: 'https://www.awladragab.com', categorySlug: 'gida-market', seedUrls: ['https://www.awladragab.com/offers'] },
  { name: 'Basata Supermarket', websiteUrl: 'https://www.basatasupermarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.basatasupermarket.com/offers'] },
  { name: 'Farm Supermarket', websiteUrl: 'https://www.farm.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.farm.com.eg/offers'] },
  { name: 'Fresh Food Market', websiteUrl: 'https://www.freshfoodmarket.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.freshfoodmarket.com.eg/offers'] },
  { name: 'Gourmet Egypt', websiteUrl: 'https://www.gourmetegypt.com', categorySlug: 'gida-market', seedUrls: ['https://www.gourmetegypt.com/offers', 'https://www.gourmetegypt.com/deals'] },
  { name: 'Royal House', websiteUrl: 'https://www.royalhouse.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.royalhouse.com.eg/offers'] },
  { name: 'Nola Cupcakes', websiteUrl: 'https://www.nolacupcakes.com', categorySlug: 'gida-market', seedUrls: ['https://www.nolacupcakes.com/offers'] },
  { name: 'Breadfast', websiteUrl: 'https://www.breadfast.com', categorySlug: 'gida-market', seedUrls: ['https://www.breadfast.com/offers', 'https://www.breadfast.com/deals'] },
  { name: 'Instashop Egypt', websiteUrl: 'https://www.instashop.com/eg', categorySlug: 'gida-market', seedUrls: ['https://www.instashop.com/eg/offers'] },
  { name: 'Goodsmart', websiteUrl: 'https://www.goodsmart.com', categorySlug: 'gida-market', seedUrls: ['https://www.goodsmart.com/offers'] },
  { name: 'Zahran Market', websiteUrl: 'https://www.zahranmarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.zahranmarket.com/offers'] },
  { name: 'El Mahlawy', websiteUrl: 'https://www.elmahlawy.com', categorySlug: 'gida-market', seedUrls: ['https://www.elmahlawy.com/offers'] },
  { name: 'Sunny Market', websiteUrl: 'https://www.sunnymarket.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.sunnymarket.com.eg/offers'] },
  { name: 'Town Market', websiteUrl: 'https://www.townmarket.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.townmarket.com.eg/offers'] },
  { name: 'Othaim Egypt', websiteUrl: 'https://www.othaimmarkets.com/eg', categorySlug: 'gida-market', seedUrls: ['https://www.othaimmarkets.com/eg/offers'] },
  { name: 'Panda Market Egypt', websiteUrl: 'https://www.panda.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.panda.com.eg/offers'] },
  { name: 'Shoprite Egypt', websiteUrl: 'https://www.shoprite.com.eg', categorySlug: 'gida-market', seedUrls: ['https://www.shoprite.com.eg/offers'] },
  { name: 'Ghallab Market', websiteUrl: 'https://www.ghallabmarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.ghallabmarket.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Drink (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'KFC Egypt', websiteUrl: 'https://www.kfc-egypt.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc-egypt.com/offers', 'https://www.kfc-egypt.com/deals'] },
  { name: 'McDonald\'s Egypt', websiteUrl: 'https://www.mcdonaldsarabia.com/egypt', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonaldsarabia.com/egypt/offers', 'https://www.mcdonaldsarabia.com/egypt/deals'] },
  { name: 'Hardee\'s Egypt', websiteUrl: 'https://www.hardees.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.hardees.com.eg/offers', 'https://www.hardees.com.eg/deals'] },
  { name: 'Pizza Hut Egypt', websiteUrl: 'https://www.pizzahut.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.eg/offers', 'https://www.pizzahut.com.eg/deals'] },
  { name: 'Domino\'s Pizza Egypt', websiteUrl: 'https://www.dominos.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.eg/offers', 'https://www.dominos.com.eg/deals'] },
  { name: 'Gad', websiteUrl: 'https://www.gad.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.gad.com.eg/offers', 'https://www.gad.com.eg/menu'] },
  { name: 'Shawerma El Reem', websiteUrl: 'https://www.shawermaelreem.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.shawermaelreem.com/offers', 'https://www.shawermaelreem.com/deals'] },
  { name: 'Talabat', websiteUrl: 'https://www.talabat.com/egypt', categorySlug: 'yeme-icme', seedUrls: ['https://www.talabat.com/egypt/offers', 'https://www.talabat.com/egypt/deals'] },
  { name: 'Elmenus', websiteUrl: 'https://www.elmenus.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.elmenus.com/offers', 'https://www.elmenus.com/deals'] },
  { name: 'Burger King Egypt', websiteUrl: 'https://www.burgerking.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.eg/offers', 'https://www.burgerking.com.eg/deals'] },
  { name: 'Subway Egypt', websiteUrl: 'https://www.subway.com/en-eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/en-eg/offers'] },
  { name: 'Chili\'s Egypt', websiteUrl: 'https://www.chilis.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.chilis.com.eg/offers'] },
  { name: 'TBS (The Bakery Shop)', websiteUrl: 'https://www.tbs.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.tbs.com.eg/offers'] },
  { name: 'Cook Door', websiteUrl: 'https://www.cookdoor.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.cookdoor.com/offers'] },
  { name: 'Zooba', websiteUrl: 'https://www.zooba.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.zooba.com.eg/offers'] },
  { name: 'Kazouza', websiteUrl: 'https://www.kazouza.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kazouza.com/offers'] },
  { name: 'Papa John\'s Egypt', websiteUrl: 'https://www.papajohns.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.com.eg/offers', 'https://www.papajohns.com.eg/deals'] },
  { name: 'Baskin Robbins Egypt', websiteUrl: 'https://www.baskinrobbins.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbins.com.eg/offers'] },
  { name: 'Costa Coffee Egypt', websiteUrl: 'https://www.costa.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.costa.com.eg/offers'] },
  { name: 'Starbucks Egypt', websiteUrl: 'https://www.starbucks.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.eg/offers'] },
  { name: 'Dunkin\' Donuts Egypt', websiteUrl: 'https://www.dunkindonuts.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.com.eg/offers'] },
  { name: 'Mo\'men', websiteUrl: 'https://www.moumen.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.moumen.com/offers', 'https://www.moumen.com/deals'] },
  { name: 'Buffalo Burger', websiteUrl: 'https://www.buffaloburger.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.buffaloburger.com/offers'] },
  { name: 'Wimpy Egypt', websiteUrl: 'https://www.wimpy.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.wimpy.com.eg/offers'] },
  { name: 'Eish & Malh', websiteUrl: 'https://www.eishwmalh.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.eishwmalh.com/offers'] },
  { name: 'Sachi Egypt', websiteUrl: 'https://www.sachi.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.sachi.com.eg/offers'] },
  { name: 'Mori Sushi', websiteUrl: 'https://www.morisushi.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.morisushi.com/offers'] },
  { name: 'Lucille\'s Egypt', websiteUrl: 'https://www.lucilles.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.lucilles.com.eg/offers'] },
  { name: 'Cinnabon Egypt', websiteUrl: 'https://www.cinnabon.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.cinnabon.com.eg/offers'] },
  { name: 'El Abd Patisserie', websiteUrl: 'https://www.elabd.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.elabd.com/offers'] },
  { name: 'Krispy Kreme Egypt', websiteUrl: 'https://www.krispykreme.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.krispykreme.com.eg/offers'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'MAC Egypt', websiteUrl: 'https://www.maccosmetics.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.eg/offers', 'https://www.maccosmetics.com.eg/sale'] },
  { name: 'Sephora Egypt', websiteUrl: 'https://www.sephora.com/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.com/eg/sale'] },
  { name: 'Bath & Body Works Egypt', websiteUrl: 'https://www.bathandbodyworks.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.com.eg/sale', 'https://www.bathandbodyworks.com.eg/offers'] },
  { name: 'The Body Shop Egypt', websiteUrl: 'https://www.thebodyshop.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com.eg/sale', 'https://www.thebodyshop.com.eg/offers'] },
  { name: 'Faces Egypt', websiteUrl: 'https://www.faceswatches.com/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.faceswatches.com/eg/en/sale'] },
  { name: 'Victoria\'s Secret Egypt', websiteUrl: 'https://www.victoriassecret.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.victoriassecret.com.eg/sale'] },
  { name: 'NYX Egypt', websiteUrl: 'https://www.nyxcosmetics.com/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.com/eg/offers'] },
  { name: 'L\'Oreal Egypt', websiteUrl: 'https://www.loreal-paris.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.eg/offers'] },
  { name: 'Maybelline Egypt', websiteUrl: 'https://www.maybelline.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.eg/offers'] },
  { name: 'Garnier Egypt', websiteUrl: 'https://www.garnier.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.com.eg/offers'] },
  { name: 'Nivea Egypt', websiteUrl: 'https://www.nivea.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.com.eg/offers', 'https://www.nivea.com.eg/promotions'] },
  { name: 'Dove Egypt', websiteUrl: 'https://www.dove.com/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/eg/offers.html'] },
  { name: 'Huda Beauty Egypt', websiteUrl: 'https://www.hudabeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.hudabeauty.com/sale'] },
  { name: 'Charlotte Tilbury Egypt', websiteUrl: 'https://www.charlottetilbury.com/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.charlottetilbury.com/eg/sale'] },
  { name: 'Kiehl\'s Egypt', websiteUrl: 'https://www.kiehls.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.com.eg/offers'] },
  { name: 'Clinique Egypt', websiteUrl: 'https://www.clinique.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.eg/offers'] },
  { name: 'Estee Lauder Egypt', websiteUrl: 'https://www.esteelauder.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.eg/offers'] },
  { name: 'Inglot Egypt', websiteUrl: 'https://inglot.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://inglot.com.eg/sale', 'https://inglot.com.eg/offers'] },
  { name: 'Flormar Egypt', websiteUrl: 'https://www.flormar.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.flormar.com.eg/sale'] },
  { name: 'Catrice Egypt', websiteUrl: 'https://www.catrice.eu/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.catrice.eu/eg/offers'] },
  { name: 'Essence Cosmetics Egypt', websiteUrl: 'https://www.essence.eu/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.essence.eu/eg/offers'] },
  { name: 'Lush Egypt', websiteUrl: 'https://www.lush.com/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/eg/en/c/sale'] },
  { name: 'Al Tayer Beauty', websiteUrl: 'https://www.altayer.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.altayer.com/offers'] },
  { name: 'Mikyajy Egypt', websiteUrl: 'https://www.mikyajy.com/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mikyajy.com/eg/sale'] },
  { name: 'Rituals Egypt', websiteUrl: 'https://www.rituals.com/eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/eg/sale'] },
  { name: 'Avon Egypt', websiteUrl: 'https://www.avon.com.eg', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avon.com.eg/offers'] },
  { name: 'Oriflame Egypt', websiteUrl: 'https://eg.oriflame.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://eg.oriflame.com/offers'] },
  { name: 'Saydlia.com', websiteUrl: 'https://www.saydlia.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.saydlia.com/offers', 'https://www.saydlia.com/deals'] },
  { name: 'Seif Pharmacies', websiteUrl: 'https://www.seifpharmacies.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.seifpharmacies.com/offers'] },
  { name: 'Al Ezaby Pharmacy', websiteUrl: 'https://www.ezabypharmacy.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ezabypharmacy.com/offers', 'https://www.ezabypharmacy.com/deals'] },
  { name: 'Rosheta', websiteUrl: 'https://www.rosheta.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rosheta.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Go Sport Egypt', websiteUrl: 'https://www.go-sport.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.go-sport.com/eg/en/sale'] },
  { name: 'Adidas Egypt', websiteUrl: 'https://www.adidas.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.com.eg/sale', 'https://www.adidas.com.eg/outlet'] },
  { name: 'Nike Egypt', websiteUrl: 'https://www.nike.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/eg/w/sale'] },
  { name: 'Sun & Sand Sports Egypt', websiteUrl: 'https://www.sssports.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sssports.com/eg/en/sale'] },
  { name: 'Decathlon Egypt', websiteUrl: 'https://www.decathlon.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.com.eg/en/sale', 'https://www.decathlon.com.eg/en/offers'] },
  { name: 'Puma Egypt', websiteUrl: 'https://eg.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://eg.puma.com/eg/en/sale'] },
  { name: 'Reebok Egypt', websiteUrl: 'https://www.reebok.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com/eg/sale'] },
  { name: 'Under Armour Egypt', websiteUrl: 'https://www.underarmour.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com/eg/en/sale'] },
  { name: 'New Balance Egypt', websiteUrl: 'https://www.newbalance.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.eg/sale'] },
  { name: 'Skechers Egypt', websiteUrl: 'https://www.skechers.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.eg/sale'] },
  { name: 'Converse Egypt', websiteUrl: 'https://www.converse.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com/eg/sale'] },
  { name: 'Foot Locker Egypt', websiteUrl: 'https://www.footlocker.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.footlocker.com.eg/sale'] },
  { name: 'Timberland Egypt', websiteUrl: 'https://www.timberland.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.com.eg/sale'] },
  { name: 'Columbia Egypt', websiteUrl: 'https://www.columbia.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.com/eg/sale'] },
  { name: 'The North Face Egypt', websiteUrl: 'https://www.thenorthface.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.eg/sale'] },
  { name: 'Fila Egypt', websiteUrl: 'https://www.fila.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.com.eg/sale'] },
  { name: 'Asics Egypt', websiteUrl: 'https://www.asics.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/eg/en/sale'] },
  { name: 'Athlete\'s Co Egypt', websiteUrl: 'https://www.athletesco.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.athletesco.com/sale'] },
  { name: 'Planet Fitness Egypt', websiteUrl: 'https://www.planetfitness.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.planetfitness.com.eg/offers'] },
  { name: 'Gold\'s Gym Egypt', websiteUrl: 'https://www.goldsgym.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.goldsgym.com.eg/offers'] },
  { name: 'Fitness First Egypt', websiteUrl: 'https://www.fitnessfirst.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitnessfirst.com.eg/offers'] },
  { name: 'Sports Mall Egypt', websiteUrl: 'https://www.sportsmall.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportsmall.com.eg/sale'] },
  { name: 'Intersport Egypt', websiteUrl: 'https://www.intersport.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.com.eg/sale'] },
  { name: 'Jordan Egypt', websiteUrl: 'https://www.nike.com/eg/w/jordan-sale', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/eg/w/jordan-sale'] },
  { name: 'Lotto Egypt', websiteUrl: 'https://www.lotto.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lotto.com.eg/sale'] },
  { name: 'Speedo Egypt', websiteUrl: 'https://www.speedo.com/eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.speedo.com/eg/sale'] },
  { name: 'Vans Egypt', websiteUrl: 'https://www.vans.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.com.eg/sale'] },
  { name: 'Kipsta Egypt', websiteUrl: 'https://www.decathlon.com.eg/en/kipsta', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.com.eg/en/browse/c0-all-sports/c1-kipsta-sale/'] },
  { name: 'Umbro Egypt', websiteUrl: 'https://www.umbro.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.umbro.com.eg/sale'] },
  { name: 'Champion Egypt', websiteUrl: 'https://www.champion.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.champion.com.eg/sale'] },
  { name: 'Li-Ning Egypt', websiteUrl: 'https://www.li-ning.com.eg', categorySlug: 'spor-outdoor', seedUrls: ['https://www.li-ning.com.eg/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'EgyptAir', websiteUrl: 'https://www.egyptair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.egyptair.com/en/offers', 'https://www.egyptair.com/en/deals'] },
  { name: 'Booking.com Egypt', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.en.html'] },
  { name: 'Wego Egypt', websiteUrl: 'https://www.wego.com.eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.wego.com.eg/deals', 'https://www.wego.com.eg/offers'] },
  { name: 'Trivago Egypt', websiteUrl: 'https://www.trivago.com.eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.com.eg/'] },
  { name: 'Uber Egypt', websiteUrl: 'https://www.uber.com/eg/en', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/eg/en/ride/offers/'] },
  { name: 'SWVL', websiteUrl: 'https://www.swvl.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.swvl.com/offers', 'https://www.swvl.com/deals'] },
  { name: 'Careem Egypt', websiteUrl: 'https://www.careem.com/eg-en', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.careem.com/eg-en/offers/'] },
  { name: 'Air Cairo', websiteUrl: 'https://www.flyaircairo.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flyaircairo.com/offers'] },
  { name: 'Nile Air', websiteUrl: 'https://www.nileair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nileair.com/offers', 'https://www.nileair.com/deals'] },
  { name: 'Flydubai Egypt', websiteUrl: 'https://www.flydubai.com/en/offers', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flydubai.com/en/offers'] },
  { name: 'Emirates Egypt', websiteUrl: 'https://www.emirates.com/eg/english', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.emirates.com/eg/english/offers/'] },
  { name: 'Qatar Airways Egypt', websiteUrl: 'https://www.qatarairways.com/en-eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.qatarairways.com/en-eg/offers.html'] },
  { name: 'Turkish Airlines Egypt', websiteUrl: 'https://www.turkishairlines.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.turkishairlines.com/en-eg/offers/'] },
  { name: 'Etihad Egypt', websiteUrl: 'https://www.etihad.com/en-eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.etihad.com/en-eg/deals'] },
  { name: 'Skyscanner Egypt', websiteUrl: 'https://www.skyscanner.com.eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.com.eg/'] },
  { name: 'Expedia Egypt', websiteUrl: 'https://www.expedia.com.eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.eg/deals'] },
  { name: 'Agoda Egypt', websiteUrl: 'https://www.agoda.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/deals'] },
  { name: 'Hotels.com Egypt', websiteUrl: 'https://eg.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://eg.hotels.com/deals/'] },
  { name: 'Almosafer Egypt', websiteUrl: 'https://www.almosafer.com/en-eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.almosafer.com/en-eg/deals'] },
  { name: 'Hilton Egypt', websiteUrl: 'https://www.hilton.com/en/locations/egypt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hilton.com/en/offers/'] },
  { name: 'Marriott Egypt', websiteUrl: 'https://www.marriott.com/en-us/hotel-deals', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com/en-us/hotel-deals/'] },
  { name: 'Airbnb Egypt', websiteUrl: 'https://www.airbnb.com.eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.com.eg/'] },
  { name: 'Trip.com Egypt', websiteUrl: 'https://www.trip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trip.com/flights/deals'] },
  { name: 'Travelyalla', websiteUrl: 'https://www.travelyalla.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travelyalla.com/offers', 'https://www.travelyalla.com/deals'] },
  { name: 'Travco Group', websiteUrl: 'https://www.travcogroup.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travcogroup.com/offers'] },
  { name: 'Thomas Cook Egypt', websiteUrl: 'https://www.thomascookegypt.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thomascookegypt.com/offers'] },
  { name: 'Spring Tours', websiteUrl: 'https://www.springtours.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.springtours.com/offers'] },
  { name: 'Emeco Travel', websiteUrl: 'https://www.emecotravel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.emecotravel.com/offers'] },
  { name: 'Go Bus Egypt', websiteUrl: 'https://www.gobus.com.eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.gobus.com.eg/offers'] },
  { name: 'DiDi Egypt', websiteUrl: 'https://www.didiglobal.com/eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.didiglobal.com/eg/offers'] },
  { name: 'InDrive Egypt', websiteUrl: 'https://www.indrive.com/eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.indrive.com/eg/offers'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'National Bank of Egypt', websiteUrl: 'https://www.nbe.com.eg', categorySlug: 'finans', seedUrls: ['https://www.nbe.com.eg/en/offers', 'https://www.nbe.com.eg/en/campaigns'] },
  { name: 'Banque Misr', websiteUrl: 'https://www.banquemisr.com', categorySlug: 'finans', seedUrls: ['https://www.banquemisr.com/en/offers', 'https://www.banquemisr.com/en/campaigns'] },
  { name: 'CIB Egypt', websiteUrl: 'https://www.cibeg.com', categorySlug: 'finans', seedUrls: ['https://www.cibeg.com/en/offers', 'https://www.cibeg.com/en/personal/credit-cards/offers'] },
  { name: 'QNB Egypt', websiteUrl: 'https://www.qnb.com/sites/qnb/qnbegypt', categorySlug: 'finans', seedUrls: ['https://www.qnb.com/sites/qnb/qnbegypt/page/en/offers.html'] },
  { name: 'Vodafone Cash', websiteUrl: 'https://www.vodafone.com.eg/en/vodafone-cash', categorySlug: 'finans', seedUrls: ['https://www.vodafone.com.eg/en/vodafone-cash/offers'] },
  { name: 'Fawry Finance', websiteUrl: 'https://www.fawry.com', categorySlug: 'finans', seedUrls: ['https://www.fawry.com/offers', 'https://www.fawry.com/services'] },
  { name: 'HSBC Egypt', websiteUrl: 'https://www.hsbc.com.eg', categorySlug: 'finans', seedUrls: ['https://www.hsbc.com.eg/credit-cards/offers/'] },
  { name: 'Arab African International Bank', websiteUrl: 'https://www.aaib.com', categorySlug: 'finans', seedUrls: ['https://www.aaib.com/offers'] },
  { name: 'Banque du Caire', websiteUrl: 'https://www.banqueducaire.com', categorySlug: 'finans', seedUrls: ['https://www.banqueducaire.com/en/offers'] },
  { name: 'Alex Bank', websiteUrl: 'https://www.alexbank.com', categorySlug: 'finans', seedUrls: ['https://www.alexbank.com/en/offers', 'https://www.alexbank.com/en/campaigns'] },
  { name: 'Ahli United Bank Egypt', websiteUrl: 'https://www.aaborig.com/egypt', categorySlug: 'finans', seedUrls: ['https://www.aaborig.com/egypt/en/offers'] },
  { name: 'Abu Dhabi Islamic Bank Egypt', websiteUrl: 'https://www.adib.eg', categorySlug: 'finans', seedUrls: ['https://www.adib.eg/en/offers'] },
  { name: 'Faisal Islamic Bank Egypt', websiteUrl: 'https://www.faisalbank.com.eg', categorySlug: 'finans', seedUrls: ['https://www.faisalbank.com.eg/offers'] },
  { name: 'Mashreq Egypt', websiteUrl: 'https://www.mashreqbank.com/eg', categorySlug: 'finans', seedUrls: ['https://www.mashreqbank.com/eg/en/offers'] },
  { name: 'Emirates NBD Egypt', websiteUrl: 'https://www.emiratesnbd.com.eg', categorySlug: 'finans', seedUrls: ['https://www.emiratesnbd.com.eg/en/offers'] },
  { name: 'First Abu Dhabi Bank Egypt', websiteUrl: 'https://www.bankfab.com/eg', categorySlug: 'finans', seedUrls: ['https://www.bankfab.com/eg/en/offers'] },
  { name: 'Attijariwafa Bank Egypt', websiteUrl: 'https://www.attijariwafabank.com.eg', categorySlug: 'finans', seedUrls: ['https://www.attijariwafabank.com.eg/offers'] },
  { name: 'valU', websiteUrl: 'https://www.valu.com.eg', categorySlug: 'finans', seedUrls: ['https://www.valu.com.eg/offers', 'https://www.valu.com.eg/deals'] },
  { name: 'Kashier', websiteUrl: 'https://www.kashier.io', categorySlug: 'finans', seedUrls: ['https://www.kashier.io/offers'] },
  { name: 'PayMob', websiteUrl: 'https://www.paymob.com', categorySlug: 'finans', seedUrls: ['https://www.paymob.com/offers'] },
  { name: 'Sympl', websiteUrl: 'https://www.sympl.com', categorySlug: 'finans', seedUrls: ['https://www.sympl.com/offers'] },
  { name: 'Contact Financial', websiteUrl: 'https://www.contactcars.com', categorySlug: 'finans', seedUrls: ['https://www.contactcars.com/offers'] },
  { name: 'Souhoola', websiteUrl: 'https://www.souhoola.com', categorySlug: 'finans', seedUrls: ['https://www.souhoola.com/offers'] },
  { name: 'Shahry', websiteUrl: 'https://www.shahry.app', categorySlug: 'finans', seedUrls: ['https://www.shahry.app/offers'] },
  { name: 'Khazna', websiteUrl: 'https://www.khaznafintech.com', categorySlug: 'finans', seedUrls: ['https://www.khaznafintech.com/offers'] },
  { name: 'NBE Credit Cards', websiteUrl: 'https://www.nbe.com.eg', categorySlug: 'finans', seedUrls: ['https://www.nbe.com.eg/en/personal/credit-cards/offers'] },
  { name: 'Banque Misr Cards', websiteUrl: 'https://www.banquemisr.com', categorySlug: 'finans', seedUrls: ['https://www.banquemisr.com/en/cards/offers'] },
  { name: 'Orange Money Egypt', websiteUrl: 'https://www.orange.eg/en/orange-money', categorySlug: 'finans', seedUrls: ['https://www.orange.eg/en/orange-money/offers'] },
  { name: 'Etisalat Cash', websiteUrl: 'https://www.etisalat.eg/en/etisalat-cash', categorySlug: 'finans', seedUrls: ['https://www.etisalat.eg/en/etisalat-cash/offers'] },
  { name: 'Lucky', websiteUrl: 'https://www.getlucky.com.eg', categorySlug: 'finans', seedUrls: ['https://www.getlucky.com.eg/offers'] },
  { name: 'MNT-Halan', websiteUrl: 'https://www.hfranchise.com', categorySlug: 'finans', seedUrls: ['https://www.hfranchise.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Allianz Egypt', websiteUrl: 'https://www.allianz.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.com.eg/en/offers', 'https://www.allianz.com.eg/en/promotions'] },
  { name: 'AXA Egypt', websiteUrl: 'https://www.axa.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.axa.com.eg/en/offers', 'https://www.axa.com.eg/en/promotions'] },
  { name: 'MetLife Egypt', websiteUrl: 'https://www.metlife.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.com.eg/offers'] },
  { name: 'Bupa Egypt', websiteUrl: 'https://www.bupa.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.bupa.com.eg/offers', 'https://www.bupa.com.eg/deals'] },
  { name: 'GIG Egypt', websiteUrl: 'https://www.gfranchise.com/egypt', categorySlug: 'sigorta', seedUrls: ['https://www.gfranchise.com/egypt/offers'] },
  { name: 'Misr Insurance', websiteUrl: 'https://www.misrins.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.misrins.com.eg/offers'] },
  { name: 'Misr Life Insurance', websiteUrl: 'https://www.misrlife.com', categorySlug: 'sigorta', seedUrls: ['https://www.misrlife.com/offers'] },
  { name: 'Suez Canal Insurance', websiteUrl: 'https://www.scfranchise.com', categorySlug: 'sigorta', seedUrls: ['https://www.scfranchise.com/offers'] },
  { name: 'Egyptian Takaful Insurance', websiteUrl: 'https://www.etfranchise.com', categorySlug: 'sigorta', seedUrls: ['https://www.etfranchise.com/offers'] },
  { name: 'Delta Insurance Egypt', websiteUrl: 'https://www.deltainsurance.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.deltainsurance.com.eg/offers'] },
  { name: 'Mohandes Insurance', websiteUrl: 'https://www.mohandesinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.mohandesinsurance.com/offers'] },
  { name: 'CHUBB Egypt', websiteUrl: 'https://www.chubb.com/eg', categorySlug: 'sigorta', seedUrls: ['https://www.chubb.com/eg/en/offers.html'] },
  { name: 'QBE Egypt', websiteUrl: 'https://www.qbe.com/eg', categorySlug: 'sigorta', seedUrls: ['https://www.qbe.com/eg/offers'] },
  { name: 'Royal Insurance Egypt', websiteUrl: 'https://www.royalinsurance.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.royalinsurance.com.eg/offers'] },
  { name: 'Orient Insurance Egypt', websiteUrl: 'https://www.orient-insurance.com/eg', categorySlug: 'sigorta', seedUrls: ['https://www.orient-insurance.com/eg/offers'] },
  { name: 'Sanad Insurance', websiteUrl: 'https://www.sanadinsurance.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.sanadinsurance.com.eg/offers'] },
  { name: 'AIG Egypt', websiteUrl: 'https://www.aig.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.aig.com.eg/offers'] },
  { name: 'Wethaq Takaful', websiteUrl: 'https://www.wethaq.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.wethaq.com.eg/offers'] },
  { name: 'Tokio Marine Egypt', websiteUrl: 'https://www.tokiomarinegypt.com', categorySlug: 'sigorta', seedUrls: ['https://www.tokiomarinegypt.com/offers'] },
  { name: 'Arope Insurance Egypt', websiteUrl: 'https://www.arfranchise.com/egypt', categorySlug: 'sigorta', seedUrls: ['https://www.arfranchise.com/egypt/offers'] },
  { name: 'Sarwa Insurance', websiteUrl: 'https://www.sarwa-ins.com', categorySlug: 'sigorta', seedUrls: ['https://www.sarwa-ins.com/offers'] },
  { name: 'Iskan Insurance', websiteUrl: 'https://www.iskaninsurance.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.iskaninsurance.com.eg/offers'] },
  { name: 'Arab Misr Insurance Group', websiteUrl: 'https://www.amig.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.amig.com.eg/offers'] },
  { name: 'Egyptian American Insurance', websiteUrl: 'https://www.eaig.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.eaig.com.eg/offers'] },
  { name: 'Commercial International Life', websiteUrl: 'https://www.cfranchise.com', categorySlug: 'sigorta', seedUrls: ['https://www.cfranchise.com/offers'] },
  { name: 'Pharos Insurance', websiteUrl: 'https://www.pharosinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.pharosinsurance.com/offers'] },
  { name: 'Nile General Takaful', websiteUrl: 'https://www.nfranchise.com', categorySlug: 'sigorta', seedUrls: ['https://www.nfranchise.com/offers'] },
  { name: 'El Sagr Insurance', websiteUrl: 'https://www.elsagr.com', categorySlug: 'sigorta', seedUrls: ['https://www.elsagr.com/offers'] },
  { name: 'Export Credit Guarantee', websiteUrl: 'https://www.ecgfranchise.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.ecgfranchise.com.eg/offers'] },
  { name: 'Amenity Insurance', websiteUrl: 'https://www.amenityins.com', categorySlug: 'sigorta', seedUrls: ['https://www.amenityins.com/offers'] },
  { name: 'Wafa Insurance', websiteUrl: 'https://www.wafainsurance.com.eg', categorySlug: 'sigorta', seedUrls: ['https://www.wafainsurance.com.eg/offers'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Ghabbour Auto', websiteUrl: 'https://www.ghabbour.com', categorySlug: 'otomobil', seedUrls: ['https://www.ghabbour.com/offers', 'https://www.ghabbour.com/promotions'] },
  { name: 'Toyota Egypt', websiteUrl: 'https://www.toyota.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.eg/en/offers', 'https://www.toyota.com.eg/en/promotions'] },
  { name: 'Hyundai Egypt', websiteUrl: 'https://www.hyundai.com/eg', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/eg/en/offers', 'https://www.hyundai.com/eg/en/campaigns'] },
  { name: 'Nissan Egypt', websiteUrl: 'https://www.nissan.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.eg/offers.html'] },
  { name: 'Al-Futtaim Automotive', websiteUrl: 'https://www.alfuttaim.com', categorySlug: 'otomobil', seedUrls: ['https://www.alfuttaim.com/offers'] },
  { name: 'Chevrolet Egypt', websiteUrl: 'https://www.chevrolet.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.com.eg/offers', 'https://www.chevrolet.com.eg/deals'] },
  { name: 'BMW Egypt', websiteUrl: 'https://www.bmw.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.eg/en/offers.html'] },
  { name: 'Mercedes-Benz Egypt', websiteUrl: 'https://www.mercedes-benz.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.eg/passengercars/being-an-owner/offers.html'] },
  { name: 'Kia Egypt', websiteUrl: 'https://www.kia.com/eg', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/eg/offers.html'] },
  { name: 'MG Egypt', websiteUrl: 'https://www.mgmotor.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.com.eg/offers'] },
  { name: 'Chery Egypt', websiteUrl: 'https://www.cheryegypt.com', categorySlug: 'otomobil', seedUrls: ['https://www.cheryegypt.com/offers'] },
  { name: 'BYD Egypt', websiteUrl: 'https://www.bydauto.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.bydauto.com.eg/offers'] },
  { name: 'Geely Egypt', websiteUrl: 'https://www.geelyegypt.com', categorySlug: 'otomobil', seedUrls: ['https://www.geelyegypt.com/offers'] },
  { name: 'SEAT Egypt', websiteUrl: 'https://www.seat.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.seat.com.eg/offers.html'] },
  { name: 'Skoda Egypt', websiteUrl: 'https://www.skoda-auto.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.skoda-auto.com.eg/offers/'] },
  { name: 'Suzuki Egypt', websiteUrl: 'https://www.suzukiegypt.com', categorySlug: 'otomobil', seedUrls: ['https://www.suzukiegypt.com/offers'] },
  { name: 'Renault Egypt', websiteUrl: 'https://www.renault.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.renault.com.eg/offers.html'] },
  { name: 'Fiat Egypt', websiteUrl: 'https://www.fiat.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.com.eg/offers.html'] },
  { name: 'Peugeot Egypt', websiteUrl: 'https://www.peugeot.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.eg/offers/'] },
  { name: 'Citroen Egypt', websiteUrl: 'https://www.citroen.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.com.eg/offers/'] },
  { name: 'Opel Egypt', websiteUrl: 'https://www.opel.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.opel.com.eg/offers.html'] },
  { name: 'Mitsubishi Egypt', websiteUrl: 'https://www.mitsubishi-motors.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.com.eg/offers'] },
  { name: 'Volkswagen Egypt', websiteUrl: 'https://www.volkswagen.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.com.eg/en/offers.html'] },
  { name: 'Audi Egypt', websiteUrl: 'https://www.audi.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.eg/eg/web/en/offers.html'] },
  { name: 'Volvo Egypt', websiteUrl: 'https://www.volvocars.com/eg', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/eg/offers/'] },
  { name: 'Hatla2ee', websiteUrl: 'https://www.hatla2ee.com', categorySlug: 'otomobil', seedUrls: ['https://www.hatla2ee.com/en/offers'] },
  { name: 'ContactCars', websiteUrl: 'https://www.contactcars.com', categorySlug: 'otomobil', seedUrls: ['https://www.contactcars.com/en/offers'] },
  { name: 'Dubizzle Motors Egypt', websiteUrl: 'https://www.dubizzle.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.dubizzle.com.eg/motors/'] },
  { name: 'AutoTager', websiteUrl: 'https://www.autotager.com', categorySlug: 'otomobil', seedUrls: ['https://www.autotager.com/offers'] },
  { name: 'ElMekaniki', websiteUrl: 'https://www.elmekaniki.com', categorySlug: 'otomobil', seedUrls: ['https://www.elmekaniki.com/offers'] },
  { name: 'Petromin Egypt', websiteUrl: 'https://www.petromin.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.petromin.com.eg/offers'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Diwan', websiteUrl: 'https://www.dfranchise.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dfranchise.com.eg/offers', 'https://www.dfranchise.com.eg/sale'] },
  { name: 'Alef Bookstores', websiteUrl: 'https://www.alfranchise.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.alfranchise.com/offers', 'https://www.alfranchise.com/sale'] },
  { name: 'Jamalon', websiteUrl: 'https://www.jamalon.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.jamalon.com/en/offers', 'https://www.jamalon.com/en/deals'] },
  { name: 'Dar El Shorouk', websiteUrl: 'https://www.shorouk.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.shorouk.com/offers'] },
  { name: 'Virgin Megastore Egypt', websiteUrl: 'https://www.virginmegastore.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.virginmegastore.com.eg/sale', 'https://www.virginmegastore.com.eg/offers'] },
  { name: 'Kotobna', websiteUrl: 'https://www.kotobna.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kotobna.com/offers'] },
  { name: 'Neelwafurat', websiteUrl: 'https://www.neelwafurat.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.neelwafurat.com/offers'] },
  { name: 'Nile Bookstore', websiteUrl: 'https://www.nilebookstore.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nilebookstore.com/offers'] },
  { name: 'Amazon EG Books', websiteUrl: 'https://www.amazon.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.eg/gp/bestsellers/books/'] },
  { name: 'Lego Egypt', websiteUrl: 'https://www.lego.com/en-eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-eg/categories/sales-and-deals'] },
  { name: 'Toyzone Egypt', websiteUrl: 'https://www.toyzone.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toyzone.com.eg/sale'] },
  { name: 'Toys R Us Egypt', websiteUrl: 'https://www.toysrus.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.com.eg/sale'] },
  { name: 'PlayStation Egypt', websiteUrl: 'https://store.playstation.com/en-eg', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/en-eg/category/deals'] },
  { name: 'Xbox Egypt', websiteUrl: 'https://www.xbox.com/en-EG', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/en-EG/games/deals'] },
  { name: 'Steam', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/'] },
  { name: 'Nintendo Egypt', websiteUrl: 'https://www.nintendo.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/us/store/games/#deals'] },
  { name: 'Game Station Egypt', websiteUrl: 'https://www.gamestation.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gamestation.com.eg/sale'] },
  { name: 'El Shorouk Publishing', websiteUrl: 'https://www.shorouk.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.shorouk.com/deals'] },
  { name: 'Dar El Maaref', websiteUrl: 'https://www.darelmaaref.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.darelmaaref.com/offers'] },
  { name: 'Hindawi Foundation', websiteUrl: 'https://www.hindawi.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hindawi.org/books/'] },
  { name: 'Asfar Bookstore', websiteUrl: 'https://www.asfar.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.asfar.com.eg/offers'] },
  { name: 'Tanmia Bookshop', websiteUrl: 'https://www.tanmia.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.tanmia.com.eg/offers'] },
  { name: 'Gamers Lounge', websiteUrl: 'https://www.gamerslounge.net', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gamerslounge.net/offers'] },
  { name: 'Sphinx Bookstore', websiteUrl: 'https://www.sphinxbooks.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sphinxbooks.com.eg/offers'] },
  { name: 'Papyrus Egypt', websiteUrl: 'https://www.papyrus.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.papyrus.com.eg/offers'] },
  { name: 'Music Box Egypt', websiteUrl: 'https://www.musicboxeg.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.musicboxeg.com/offers'] },
  { name: 'Hobby Land Egypt', websiteUrl: 'https://www.hobbyland.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbyland.com.eg/sale'] },
  { name: 'Artellewa', websiteUrl: 'https://www.artellewa.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.artellewa.com/offers'] },
  { name: 'Spot Hobby Egypt', websiteUrl: 'https://www.spothobby.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spothobby.com.eg/sale'] },
  { name: 'Craft Store Egypt', websiteUrl: 'https://www.craftstore.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.craftstore.com.eg/offers'] },
  { name: 'iStore Egypt', websiteUrl: 'https://www.istore.com.eg', categorySlug: 'kitap-hobi', seedUrls: ['https://www.istore.com.eg/sale', 'https://www.istore.com.eg/offers'] },
];

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

async function main() {
  console.log('=== EG Brand Seeding Script ===\n');
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
        where: { slug_market: { slug, market: 'EG' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'EG', categoryId },
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
            market: 'EG',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'EG' },
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

  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'EG' } });
  console.log(`Total active EG sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=EG');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
