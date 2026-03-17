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
  // 1) Alışveriş / Shopping (alisveris) — 35 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Noon', websiteUrl: 'https://www.noon.com/saudi-en', categorySlug: 'alisveris', seedUrls: ['https://www.noon.com/saudi-en/deals/', 'https://www.noon.com/saudi-en/offers/'] },
  { name: 'Amazon Saudi', websiteUrl: 'https://www.amazon.sa', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.sa/deals', 'https://www.amazon.sa/gp/goldbox'] },
  { name: 'Jarir Bookstore', websiteUrl: 'https://www.jarir.com', categorySlug: 'alisveris', seedUrls: ['https://www.jarir.com/sa-en/offers', 'https://www.jarir.com/sa-en/promotions'] },
  { name: 'eXtra', websiteUrl: 'https://www.extra.com', categorySlug: 'alisveris', seedUrls: ['https://www.extra.com/en-sa/offers', 'https://www.extra.com/en-sa/deals'] },
  { name: 'Namshi', websiteUrl: 'https://www.namshi.com', categorySlug: 'alisveris', seedUrls: ['https://www.namshi.com/saudi-en/sale/', 'https://www.namshi.com/saudi-en/deals/'] },
  { name: 'Shein Saudi', websiteUrl: 'https://sa.shein.com', categorySlug: 'alisveris', seedUrls: ['https://sa.shein.com/sale-c-2503.html', 'https://sa.shein.com/flash-sale.html'] },
  { name: 'AliExpress Saudi', websiteUrl: 'https://www.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://www.aliexpress.com/wholesale', 'https://sale.aliexpress.com/__pc/sale.htm'] },
  { name: 'Temu Saudi', websiteUrl: 'https://www.temu.com/sa', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/sa/deals', 'https://www.temu.com/sa/best-sellers'] },
  { name: 'Fordeal', websiteUrl: 'https://www.fordeal.com', categorySlug: 'alisveris', seedUrls: ['https://www.fordeal.com/sa-en/activity/deals', 'https://www.fordeal.com/sa-en/flash-sale'] },
  { name: 'Lulu Online', websiteUrl: 'https://www.luluhypermarket.com/en-sa', categorySlug: 'alisveris', seedUrls: ['https://www.luluhypermarket.com/en-sa/offers', 'https://www.luluhypermarket.com/en-sa/promotions'] },
  { name: 'Souq', websiteUrl: 'https://www.amazon.sa', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.sa/deals', 'https://www.amazon.sa/-/ar/gp/goldbox'] },
  { name: 'Mumzworld', websiteUrl: 'https://www.mumzworld.com', categorySlug: 'alisveris', seedUrls: ['https://www.mumzworld.com/en/sale', 'https://www.mumzworld.com/en/offers'] },
  { name: 'Niceone', websiteUrl: 'https://www.niceone.com', categorySlug: 'alisveris', seedUrls: ['https://www.niceone.com/en/offers', 'https://www.niceone.com/en/sale'] },
  { name: 'Couponsaudi', websiteUrl: 'https://www.couponsaudi.com', categorySlug: 'alisveris', seedUrls: ['https://www.couponsaudi.com/offers', 'https://www.couponsaudi.com/deals'] },
  { name: 'Cobone', websiteUrl: 'https://www.cobone.com', categorySlug: 'alisveris', seedUrls: ['https://www.cobone.com/en/deals/saudi-arabia'] },
  { name: 'Wadi', websiteUrl: 'https://www.wadi.com', categorySlug: 'alisveris', seedUrls: ['https://www.wadi.com/deals', 'https://www.wadi.com/offers'] },
  { name: 'Xcite Saudi', websiteUrl: 'https://www.xcite.com.sa', categorySlug: 'alisveris', seedUrls: ['https://www.xcite.com.sa/offers', 'https://www.xcite.com.sa/deals'] },
  { name: 'Saco', websiteUrl: 'https://www.sfrstore.com', categorySlug: 'alisveris', seedUrls: ['https://www.sfrstore.com/en-sa/offers', 'https://www.sfrstore.com/en-sa/promotions'] },
  { name: 'Othaim Markets', websiteUrl: 'https://www.othaimmarkets.com', categorySlug: 'alisveris', seedUrls: ['https://www.othaimmarkets.com/en/offers', 'https://www.othaimmarkets.com/en/promotions'] },
  { name: 'Whites', websiteUrl: 'https://whites.sa', categorySlug: 'alisveris', seedUrls: ['https://whites.sa/en/sale', 'https://whites.sa/en/offers'] },
  { name: 'Mrsool Market', websiteUrl: 'https://www.mrsool.co', categorySlug: 'alisveris', seedUrls: ['https://www.mrsool.co/offers'] },
  { name: 'Alhaiah', websiteUrl: 'https://www.alhaiah.com', categorySlug: 'alisveris', seedUrls: ['https://www.alhaiah.com/en/offers'] },
  { name: 'Haraj', websiteUrl: 'https://haraj.com.sa', categorySlug: 'alisveris', seedUrls: ['https://haraj.com.sa/'] },
  { name: 'Btech', websiteUrl: 'https://btech.com', categorySlug: 'alisveris', seedUrls: ['https://btech.com/en/offers', 'https://btech.com/en/deals'] },
  { name: 'Sivvi', websiteUrl: 'https://www.sivvi.com', categorySlug: 'alisveris', seedUrls: ['https://www.sivvi.com/sa-en/sale/'] },
  { name: 'VogaCloset', websiteUrl: 'https://www.vogacloset.com', categorySlug: 'alisveris', seedUrls: ['https://www.vogacloset.com/en-sa/sale', 'https://www.vogacloset.com/en-sa/offers'] },
  { name: 'Bazaar', websiteUrl: 'https://www.bazaar.town', categorySlug: 'alisveris', seedUrls: ['https://www.bazaar.town/deals', 'https://www.bazaar.town/offers'] },
  { name: 'Alshaya Group', websiteUrl: 'https://www.alshaya.com', categorySlug: 'alisveris', seedUrls: ['https://www.alshaya.com/en/offers'] },
  { name: 'First Cry', websiteUrl: 'https://www.firstcry.sa', categorySlug: 'alisveris', seedUrls: ['https://www.firstcry.sa/offers', 'https://www.firstcry.sa/sale'] },
  { name: 'Sharaf DG Saudi', websiteUrl: 'https://www.sharafdg.com/sa', categorySlug: 'alisveris', seedUrls: ['https://www.sharafdg.com/sa/deals', 'https://www.sharafdg.com/sa/offers'] },
  { name: 'City Max', websiteUrl: 'https://www.citymax.com', categorySlug: 'alisveris', seedUrls: ['https://www.citymax.com/sa/en/offers'] },
  { name: 'Carrefour Saudi', websiteUrl: 'https://www.carrefourksa.com', categorySlug: 'alisveris', seedUrls: ['https://www.carrefourksa.com/mafsau/en/offers', 'https://www.carrefourksa.com/mafsau/en/promotions'] },
  { name: 'Spinneys Saudi', websiteUrl: 'https://www.spinneys.com/sa', categorySlug: 'alisveris', seedUrls: ['https://www.spinneys.com/sa/en/offers'] },
  { name: 'eBay Saudi', websiteUrl: 'https://www.ebay.com', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.com/deals'] },
  { name: 'Trendyol Saudi', websiteUrl: 'https://www.trendyol.com', categorySlug: 'alisveris', seedUrls: ['https://www.trendyol.com/en/deals', 'https://www.trendyol.com/en/sale'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 32 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Jarir Electronics', websiteUrl: 'https://www.jarir.com', categorySlug: 'elektronik', seedUrls: ['https://www.jarir.com/sa-en/electronics-offers', 'https://www.jarir.com/sa-en/computers-tablets-offers'] },
  { name: 'eXtra Electronics', websiteUrl: 'https://www.extra.com', categorySlug: 'elektronik', seedUrls: ['https://www.extra.com/en-sa/electronics-offers', 'https://www.extra.com/en-sa/tv-audio-offers'] },
  { name: 'Samsung Saudi', websiteUrl: 'https://www.samsung.com/sa', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/sa/offer/', 'https://www.samsung.com/sa/smartphones/all-smartphones/'] },
  { name: 'Apple Saudi', websiteUrl: 'https://www.apple.com/sa', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/sa/shop/go/trade_in', 'https://www.apple.com/sa/shop/refurbished'] },
  { name: 'Huawei Saudi', websiteUrl: 'https://consumer.huawei.com/sa-en', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/sa-en/offer/', 'https://consumer.huawei.com/sa-en/promotions/'] },
  { name: 'LG Saudi', websiteUrl: 'https://www.lg.com/sa', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/sa/promotions/', 'https://www.lg.com/sa/offers/'] },
  { name: 'STC', websiteUrl: 'https://www.stc.com.sa', categorySlug: 'elektronik', seedUrls: ['https://www.stc.com.sa/personal/offers', 'https://www.stc.com.sa/personal/deals'] },
  { name: 'Mobily', websiteUrl: 'https://www.mobily.com.sa', categorySlug: 'elektronik', seedUrls: ['https://www.mobily.com.sa/personal/offers', 'https://www.mobily.com.sa/personal/deals'] },
  { name: 'Zain Saudi', websiteUrl: 'https://sa.zain.com', categorySlug: 'elektronik', seedUrls: ['https://sa.zain.com/en/offers', 'https://sa.zain.com/en/deals'] },
  { name: 'Sony Saudi', websiteUrl: 'https://www.sony.com.sa', categorySlug: 'elektronik', seedUrls: ['https://www.sony.com.sa/en/promotions'] },
  { name: 'Lenovo Saudi', websiteUrl: 'https://www.lenovo.com/sa/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/sa/en/d/deals/'] },
  { name: 'Dell Saudi', websiteUrl: 'https://www.dell.com/sa/en', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/sa/en/shop/deals'] },
  { name: 'HP Saudi', websiteUrl: 'https://www.hp.com/sa-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/sa-en/shop/offer.aspx'] },
  { name: 'Xiaomi Saudi', websiteUrl: 'https://www.mi.com/sa', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/sa/sale'] },
  { name: 'TCL Saudi', websiteUrl: 'https://www.tcl.com/sa/en', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/sa/en/promotions'] },
  { name: 'Hisense Saudi', websiteUrl: 'https://hisense-sa.com', categorySlug: 'elektronik', seedUrls: ['https://hisense-sa.com/offers', 'https://hisense-sa.com/promotions'] },
  { name: 'Bose Saudi', websiteUrl: 'https://www.bose.sa', categorySlug: 'elektronik', seedUrls: ['https://www.bose.sa/en_sa/deals.html'] },
  { name: 'JBL Saudi', websiteUrl: 'https://sa.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://sa.jbl.com/sale.html', 'https://sa.jbl.com/offers.html'] },
  { name: 'Canon Saudi', websiteUrl: 'https://www.canon-me.com', categorySlug: 'elektronik', seedUrls: ['https://www.canon-me.com/en/promotions/'] },
  { name: 'Nikon Saudi', websiteUrl: 'https://www.nikon-me.com', categorySlug: 'elektronik', seedUrls: ['https://www.nikon-me.com/en_ME/promotions.page'] },
  { name: 'Microsoft Saudi', websiteUrl: 'https://www.microsoft.com/en-sa', categorySlug: 'elektronik', seedUrls: ['https://www.microsoft.com/en-sa/store/deals'] },
  { name: 'Google Store Saudi', websiteUrl: 'https://store.google.com', categorySlug: 'elektronik', seedUrls: ['https://store.google.com/collection/offers'] },
  { name: 'Dyson Saudi', websiteUrl: 'https://www.dyson.com.sa', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.com.sa/en/offers'] },
  { name: 'Philips Saudi', websiteUrl: 'https://www.philips.sa', categorySlug: 'elektronik', seedUrls: ['https://www.philips.sa/en/promotions'] },
  { name: 'Oppo Saudi', websiteUrl: 'https://www.oppo.com/sa-en', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/sa-en/offer/'] },
  { name: 'Realme Saudi', websiteUrl: 'https://www.realme.com/sa', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/sa/deals'] },
  { name: 'Vivo Saudi', websiteUrl: 'https://www.vivo.com/sa', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com/sa/offer'] },
  { name: 'Honor Saudi', websiteUrl: 'https://www.honor.com/sa-en', categorySlug: 'elektronik', seedUrls: ['https://www.honor.com/sa-en/offer/'] },
  { name: 'Panasonic Saudi', websiteUrl: 'https://www.panasonic.com/sa', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/sa/promotions.html'] },
  { name: 'Electrolux Saudi', websiteUrl: 'https://www.electrolux.sa', categorySlug: 'elektronik', seedUrls: ['https://www.electrolux.sa/promotions/'] },
  { name: 'Virgin Megastore Saudi', websiteUrl: 'https://www.virginmegastore.sa', categorySlug: 'elektronik', seedUrls: ['https://www.virginmegastore.sa/en/deals', 'https://www.virginmegastore.sa/en/offers'] },
  { name: 'Axiom Telecom', websiteUrl: 'https://www.axiomtelecom.com', categorySlug: 'elektronik', seedUrls: ['https://www.axiomtelecom.com/en-sa/offers', 'https://www.axiomtelecom.com/en-sa/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 35 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Namshi Fashion', websiteUrl: 'https://www.namshi.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.namshi.com/saudi-en/sale/', 'https://www.namshi.com/saudi-en/women/sale/'] },
  { name: 'H&M Saudi', websiteUrl: 'https://sa.hm.com', categorySlug: 'giyim-moda', seedUrls: ['https://sa.hm.com/en/sale', 'https://sa.hm.com/en/offers'] },
  { name: 'Zara Saudi', websiteUrl: 'https://www.zara.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/sa/en/sale-l1702.html'] },
  { name: 'Max Fashion', websiteUrl: 'https://www.maxfashion.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.maxfashion.com/sa/en/sale', 'https://www.maxfashion.com/sa/en/offers'] },
  { name: 'Centrepoint', websiteUrl: 'https://www.centrepointstores.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.centrepointstores.com/sa/en/sale', 'https://www.centrepointstores.com/sa/en/offers'] },
  { name: 'Ounass', websiteUrl: 'https://www.ounass.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.ounass.sa/en-sa/sale/', 'https://www.ounass.sa/en-sa/designers/'] },
  { name: 'Level Shoes', websiteUrl: 'https://www.levelshoes.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.levelshoes.com/sale.html', 'https://www.levelshoes.com/offers.html'] },
  { name: 'Styli', websiteUrl: 'https://www.styli.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.styli.com/sa-en/sale', 'https://www.styli.com/sa-en/offers'] },
  { name: 'Splash', websiteUrl: 'https://www.splashfashions.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.splashfashions.com/sa/en/sale'] },
  { name: 'Mango Saudi', websiteUrl: 'https://shop.mango.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/sa/en/sale'] },
  { name: 'Massimo Dutti Saudi', websiteUrl: 'https://www.massimodutti.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/sa/en/sale/'] },
  { name: 'American Eagle Saudi', websiteUrl: 'https://www.americaneagle.com.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.americaneagle.com.sa/en/sale'] },
  { name: 'GAP Saudi', websiteUrl: 'https://www.gap.com.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.gap.com.sa/en/sale'] },
  { name: 'Bershka Saudi', websiteUrl: 'https://www.bershka.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/sa/en/sale/'] },
  { name: 'Pull & Bear Saudi', websiteUrl: 'https://www.pullandbear.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/sa/en/sale'] },
  { name: 'Stradivarius Saudi', websiteUrl: 'https://www.stradivarius.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/sa/en/sale/'] },
  { name: 'Aldo Saudi', websiteUrl: 'https://www.aldoshoes.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.aldoshoes.com/sa/en/sale', 'https://www.aldoshoes.com/sa/en/offers'] },
  { name: 'Charles & Keith Saudi', websiteUrl: 'https://www.charleskeith.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/sa/sale'] },
  { name: 'Skechers Saudi', websiteUrl: 'https://www.skechers.com.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.skechers.com.sa/en/sale'] },
  { name: 'Levi\'s Saudi', websiteUrl: 'https://www.levi.com.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com.sa/en/sale'] },
  { name: 'Tommy Hilfiger Saudi', websiteUrl: 'https://sa.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://sa.tommy.com/sale'] },
  { name: 'Calvin Klein Saudi', websiteUrl: 'https://www.calvinklein.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.sa/en/sale'] },
  { name: 'Shein Fashion Saudi', websiteUrl: 'https://sa.shein.com', categorySlug: 'giyim-moda', seedUrls: ['https://sa.shein.com/Women-Sale-c-1766.html', 'https://sa.shein.com/Men-Sale-c-1981.html'] },
  { name: 'R&B Fashion', websiteUrl: 'https://www.randbfashion.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.randbfashion.com/sa/en/sale'] },
  { name: 'Brands For Less', websiteUrl: 'https://www.brandsforless.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.brandsforless.com/en-sa/deals', 'https://www.brandsforless.com/en-sa/sale'] },
  { name: 'Mothercare Saudi', websiteUrl: 'https://www.mothercare.com.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.mothercare.com.sa/en/sale'] },
  { name: 'Babyshop Saudi', websiteUrl: 'https://www.babyshopstores.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.babyshopstores.com/sa/en/sale'] },
  { name: 'Ted Baker Saudi', websiteUrl: 'https://www.tedbaker.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.tedbaker.com/sa/sale'] },
  { name: 'Reiss Saudi', websiteUrl: 'https://www.reiss.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.reiss.com/sa/sale/'] },
  { name: 'LC Waikiki Saudi', websiteUrl: 'https://www.lcwaikiki.com.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.lcwaikiki.com.sa/en/sale', 'https://www.lcwaikiki.com.sa/en/offers'] },
  { name: 'DeFacto Saudi', websiteUrl: 'https://www.defacto.com.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.defacto.com.sa/en/sale'] },
  { name: 'Koton Saudi', websiteUrl: 'https://www.koton.com/sa-en', categorySlug: 'giyim-moda', seedUrls: ['https://www.koton.com/sa-en/sale'] },
  { name: 'Uniqlo Saudi', websiteUrl: 'https://www.uniqlo.com/sa/en', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/sa/en/sale'] },
  { name: 'Next Saudi', websiteUrl: 'https://www.next.sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.next.sa/en/sale'] },
  { name: 'ASOS Saudi', websiteUrl: 'https://www.asos.com/sa', categorySlug: 'giyim-moda', seedUrls: ['https://www.asos.com/sa/women/sale/', 'https://www.asos.com/sa/men/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA Saudi', websiteUrl: 'https://www.ikea.com/sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/sa/en/offers/', 'https://www.ikea.com/sa/en/campaigns/'] },
  { name: 'Home Centre Saudi', websiteUrl: 'https://www.homecentre.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.homecentre.com/sa/en/sale', 'https://www.homecentre.com/sa/en/offers'] },
  { name: 'Homes r Us', websiteUrl: 'https://www.homesrus.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.homesrus.com/sa/en/sale', 'https://www.homesrus.com/sa/en/offers'] },
  { name: 'Pan Emirates', websiteUrl: 'https://www.panemirates.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.panemirates.com/sa/en/sale', 'https://www.panemirates.com/sa/en/offers'] },
  { name: 'ACE Hardware Saudi', websiteUrl: 'https://www.acehardware.com.sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.acehardware.com.sa/en/offers', 'https://www.acehardware.com.sa/en/promotions'] },
  { name: 'Pottery Barn Saudi', websiteUrl: 'https://www.potterybarn.com.sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.potterybarn.com.sa/en/sale/'] },
  { name: 'West Elm Saudi', websiteUrl: 'https://www.westelm.com.sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.westelm.com.sa/en/sale/'] },
  { name: 'Crate & Barrel Saudi', websiteUrl: 'https://www.crateandbarrel.com.sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.crateandbarrel.com.sa/en/sale/'] },
  { name: 'Zara Home Saudi', websiteUrl: 'https://www.zarahome.com/sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/sa/en/sale/'] },
  { name: 'Home Box', websiteUrl: 'https://www.homeboxstores.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.homeboxstores.com/sa/en/sale', 'https://www.homeboxstores.com/sa/en/offers'] },
  { name: 'Danube Home', websiteUrl: 'https://www.danubehome.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.danubehome.com/sa/en/offers', 'https://www.danubehome.com/sa/en/sale'] },
  { name: 'Muji Saudi', websiteUrl: 'https://www.muji.com/sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.muji.com/sa/feature/sale'] },
  { name: 'Tavola', websiteUrl: 'https://www.tavolashop.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.tavolashop.com/sa/en/sale'] },
  { name: 'Marina Home', websiteUrl: 'https://www.marinahomeinteriors.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.marinahomeinteriors.com/sa/en/sale'] },
  { name: 'Abyat', websiteUrl: 'https://www.abyat.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.abyat.com/offers', 'https://www.abyat.com/promotions'] },
  { name: 'Nice Saudi', websiteUrl: 'https://www.niceonline.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.niceonline.com/sa/en/sale'] },
  { name: 'The One Saudi', websiteUrl: 'https://www.theone.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.theone.com/sa/en/sale'] },
  { name: 'Samsung Home Saudi', websiteUrl: 'https://www.samsung.com/sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.samsung.com/sa/home-appliances/'] },
  { name: 'Bosch Saudi', websiteUrl: 'https://www.bosch-home.com.sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.bosch-home.com.sa/offers'] },
  { name: 'Siemens Home Saudi', websiteUrl: 'https://www.siemens-home.bsh-group.com/sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.siemens-home.bsh-group.com/sa/offers'] },
  { name: 'Whirlpool Saudi', websiteUrl: 'https://www.whirlpool-me.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.whirlpool-me.com/promotions'] },
  { name: 'Abdullah Al Othaim', websiteUrl: 'https://www.othaim.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.othaim.com/offers'] },
  { name: 'JYSK Saudi', websiteUrl: 'https://www.jysk.sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.jysk.sa/offers', 'https://www.jysk.sa/sale'] },
  { name: 'Maisons du Monde Saudi', websiteUrl: 'https://www.maisonsdumonde.com/SA', categorySlug: 'ev-yasam', seedUrls: ['https://www.maisonsdumonde.com/SA/en/sale'] },
  { name: 'H&M Home Saudi', websiteUrl: 'https://sa.hm.com', categorySlug: 'ev-yasam', seedUrls: ['https://sa.hm.com/en/home/sale'] },
  { name: 'Hempel Saudi', websiteUrl: 'https://www.jotun.com/sa-en', categorySlug: 'ev-yasam', seedUrls: ['https://www.jotun.com/sa-en/offers'] },
  { name: 'BoConcept Saudi', websiteUrl: 'https://www.boconcept.com/en-sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.boconcept.com/en-sa/sale/'] },
  { name: 'Midas Saudi', websiteUrl: 'https://www.midasfurniture.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.midasfurniture.com/sa/sale'] },
  { name: 'Ashley Furniture Saudi', websiteUrl: 'https://www.ashleyfurniture.com.sa', categorySlug: 'ev-yasam', seedUrls: ['https://www.ashleyfurniture.com.sa/en/sale'] },
  { name: '2XL Saudi', websiteUrl: 'https://www.2xlme.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.2xlme.com/sa/en/sale'] },

  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Danube', websiteUrl: 'https://www.danube.sa', categorySlug: 'gida-market', seedUrls: ['https://www.danube.sa/en/offers', 'https://www.danube.sa/en/promotions'] },
  { name: 'Panda', websiteUrl: 'https://www.pfrsa.com', categorySlug: 'gida-market', seedUrls: ['https://www.pfrsa.com/en/offers', 'https://www.pfrsa.com/en/promotions'] },
  { name: 'Lulu Hypermarket Saudi', websiteUrl: 'https://www.luluhypermarket.com/en-sa', categorySlug: 'gida-market', seedUrls: ['https://www.luluhypermarket.com/en-sa/offers', 'https://www.luluhypermarket.com/en-sa/deals'] },
  { name: 'Tamimi Markets', websiteUrl: 'https://www.tamimimarkets.com', categorySlug: 'gida-market', seedUrls: ['https://www.tamimimarkets.com/en/offers', 'https://www.tamimimarkets.com/en/promotions'] },
  { name: 'BinDawood', websiteUrl: 'https://www.bindawoodholding.com', categorySlug: 'gida-market', seedUrls: ['https://www.bindawoodholding.com/en/offers'] },
  { name: 'Farm Superstores', websiteUrl: 'https://www.farmsuperstore.com', categorySlug: 'gida-market', seedUrls: ['https://www.farmsuperstore.com/en/offers', 'https://www.farmsuperstore.com/en/promotions'] },
  { name: 'Nesto Saudi', websiteUrl: 'https://www.nestogroup.com', categorySlug: 'gida-market', seedUrls: ['https://www.nestogroup.com/offers'] },
  { name: 'Carrefour Market Saudi', websiteUrl: 'https://www.carrefourksa.com', categorySlug: 'gida-market', seedUrls: ['https://www.carrefourksa.com/mafsau/en/grocery-offers'] },
  { name: 'Manuel Market', websiteUrl: 'https://www.manuelmarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.manuelmarket.com/en/offers'] },
  { name: 'Sarawat', websiteUrl: 'https://www.sarawat.com', categorySlug: 'gida-market', seedUrls: ['https://www.sarawat.com/offers'] },
  { name: 'Al Raya', websiteUrl: 'https://www.alrayamarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.alrayamarket.com/en/offers'] },
  { name: 'Hyper Panda', websiteUrl: 'https://www.pfrsa.com', categorySlug: 'gida-market', seedUrls: ['https://www.pfrsa.com/en/hyper-offers'] },
  { name: 'Noon Grocery', websiteUrl: 'https://www.noon.com/saudi-en/grocery', categorySlug: 'gida-market', seedUrls: ['https://www.noon.com/saudi-en/grocery/deals/'] },
  { name: 'InstaShop Saudi', websiteUrl: 'https://www.instashop.com', categorySlug: 'gida-market', seedUrls: ['https://www.instashop.com/sa/offers'] },
  { name: 'Trolley Saudi', websiteUrl: 'https://www.trolley.ae', categorySlug: 'gida-market', seedUrls: ['https://www.trolley.ae/sa/offers'] },
  { name: 'Sary', websiteUrl: 'https://www.sary.sa', categorySlug: 'gida-market', seedUrls: ['https://www.sary.sa/en/offers'] },
  { name: 'Nana Direct', websiteUrl: 'https://www.nana.sa', categorySlug: 'gida-market', seedUrls: ['https://www.nana.sa/en/offers', 'https://www.nana.sa/en/deals'] },
  { name: 'Almarai', websiteUrl: 'https://www.almarai.com', categorySlug: 'gida-market', seedUrls: ['https://www.almarai.com/en/offers/'] },
  { name: 'Nadec', websiteUrl: 'https://www.nadec.com.sa', categorySlug: 'gida-market', seedUrls: ['https://www.nadec.com.sa/en/offers'] },
  { name: 'Al Sadhan', websiteUrl: 'https://www.alsadhan.com.sa', categorySlug: 'gida-market', seedUrls: ['https://www.alsadhan.com.sa/en/offers'] },
  { name: 'Kudu', websiteUrl: 'https://www.kudu.com.sa', categorySlug: 'gida-market', seedUrls: ['https://www.kudu.com.sa/en/offers'] },
  { name: 'Baqala Saudi', websiteUrl: 'https://www.baqala.com', categorySlug: 'gida-market', seedUrls: ['https://www.baqala.com/offers'] },
  { name: 'Al Jazira Supermarket', websiteUrl: 'https://www.aljazirasupermarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.aljazirasupermarket.com/offers'] },
  { name: 'Planet Saudi', websiteUrl: 'https://www.planetsa.com', categorySlug: 'gida-market', seedUrls: ['https://www.planetsa.com/offers'] },
  { name: 'Othaim Extra', websiteUrl: 'https://www.othaimmarkets.com', categorySlug: 'gida-market', seedUrls: ['https://www.othaimmarkets.com/en/extra-offers'] },
  { name: 'Dukan', websiteUrl: 'https://www.dukan.com.sa', categorySlug: 'gida-market', seedUrls: ['https://www.dukan.com.sa/offers'] },
  { name: 'Savola', websiteUrl: 'https://www.savola.com', categorySlug: 'gida-market', seedUrls: ['https://www.savola.com/offers'] },
  { name: 'Bateel', websiteUrl: 'https://www.bateel.com', categorySlug: 'gida-market', seedUrls: ['https://www.bateel.com/sa/en/offers'] },
  { name: 'Goody', websiteUrl: 'https://www.goody.com.sa', categorySlug: 'gida-market', seedUrls: ['https://www.goody.com.sa/en/offers'] },
  { name: 'Amazon Pantry Saudi', websiteUrl: 'https://www.amazon.sa', categorySlug: 'gida-market', seedUrls: ['https://www.amazon.sa/grocery/deals'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme-İçme / Food & Dining (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Jahez', websiteUrl: 'https://www.jahez.net', categorySlug: 'yeme-icme', seedUrls: ['https://www.jahez.net/offers', 'https://www.jahez.net/deals'] },
  { name: 'HungerStation', websiteUrl: 'https://hungerstation.com', categorySlug: 'yeme-icme', seedUrls: ['https://hungerstation.com/offers', 'https://hungerstation.com/deals'] },
  { name: 'The Chefz', websiteUrl: 'https://www.thechefz.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.thechefz.com/offers'] },
  { name: 'Talabat Saudi', websiteUrl: 'https://www.talabat.com/saudi', categorySlug: 'yeme-icme', seedUrls: ['https://www.talabat.com/saudi/offers'] },
  { name: 'Careem Food', websiteUrl: 'https://www.careem.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.careem.com/en-sa/food-offers/'] },
  { name: 'Al Baik', websiteUrl: 'https://www.albaik.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.albaik.com/en/offers'] },
  { name: 'Herfy', websiteUrl: 'https://www.herfy.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.herfy.com/en/offers'] },
  { name: 'McDonald\'s Saudi', websiteUrl: 'https://www.mcdonalds.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com.sa/en/offers'] },
  { name: 'KFC Saudi', websiteUrl: 'https://www.kfc.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.com.sa/en/offers', 'https://www.kfc.com.sa/en/deals'] },
  { name: 'Burger King Saudi', websiteUrl: 'https://www.burgerking.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.sa/en/offers'] },
  { name: 'Pizza Hut Saudi', websiteUrl: 'https://www.pizzahut.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.sa/en/offers'] },
  { name: 'Domino\'s Saudi', websiteUrl: 'https://www.dominos.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.sa/en/offers'] },
  { name: 'Starbucks Saudi', websiteUrl: 'https://www.starbucks.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.sa/offers'] },
  { name: 'Tim Hortons Saudi', websiteUrl: 'https://www.timhortons.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.timhortons.sa/offers'] },
  { name: 'Hardee\'s Saudi', websiteUrl: 'https://www.hardees.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.hardees.com.sa/en/offers'] },
  { name: 'Shawarmer', websiteUrl: 'https://www.shawarmer.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.shawarmer.com/en/offers'] },
  { name: 'Maestro Pizza', websiteUrl: 'https://www.maestropizza.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.maestropizza.com/en/offers'] },
  { name: 'The Cheesecake Factory Saudi', websiteUrl: 'https://www.thecheesecakefactory.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.thecheesecakefactory.sa/offers'] },
  { name: 'Subway Saudi', websiteUrl: 'https://www.subway.com/sa-en', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/sa-en/offers'] },
  { name: 'Kudu Food', websiteUrl: 'https://www.kudu.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.kudu.com.sa/en/menu-offers'] },
  { name: 'Popeyes Saudi', websiteUrl: 'https://www.popeyes.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.popeyes.com.sa/en/offers'] },
  { name: 'Dunkin Saudi', websiteUrl: 'https://www.dunkin.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkin.sa/en/offers'] },
  { name: 'Baskin Robbins Saudi', websiteUrl: 'https://www.baskinrobbins.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbins.sa/en/offers'] },
  { name: 'Mrsool Food', websiteUrl: 'https://www.mrsool.co', categorySlug: 'yeme-icme', seedUrls: ['https://www.mrsool.co/food-offers'] },
  { name: 'Papa John\'s Saudi', websiteUrl: 'https://www.papajohns.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.com.sa/en/offers'] },
  { name: 'Barn\'s Cafe', websiteUrl: 'https://www.barnscafe.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.barnscafe.com/en/offers'] },
  { name: 'Dr Cafe', websiteUrl: 'https://www.drcafe.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.drcafe.sa/offers'] },
  { name: 'Texas Chicken Saudi', websiteUrl: 'https://www.texaschicken.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.texaschicken.com.sa/en/offers'] },
  { name: 'Krispy Kreme Saudi', websiteUrl: 'https://www.krispykreme.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.krispykreme.sa/en/offers'] },
  { name: 'Nando\'s Saudi', websiteUrl: 'https://www.nandos.com.sa', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.com.sa/en/offers'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sephora Saudi', websiteUrl: 'https://www.sephora.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.sa/en/sale/', 'https://www.sephora.sa/en/offers/'] },
  { name: 'Faces Saudi', websiteUrl: 'https://www.faces.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.faces.com/sa-en/sale', 'https://www.faces.com/sa-en/offers'] },
  { name: 'Bath & Body Works Saudi', websiteUrl: 'https://www.bathandbodyworks.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.com.sa/en/sale', 'https://www.bathandbodyworks.com.sa/en/offers'] },
  { name: 'MAC Saudi', websiteUrl: 'https://www.maccosmetics.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.sa/offers'] },
  { name: 'Niceone Beauty', websiteUrl: 'https://www.niceone.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.niceone.com/en/beauty-offers', 'https://www.niceone.com/en/beauty-sale'] },
  { name: 'Golden Scent', websiteUrl: 'https://www.goldenscent.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.goldenscent.com/en/offers', 'https://www.goldenscent.com/en/sale'] },
  { name: 'Nahdi', websiteUrl: 'https://www.nahdionline.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nahdionline.com/en/offers', 'https://www.nahdionline.com/en/promotions'] },
  { name: 'Al Dawaa Pharmacy', websiteUrl: 'https://www.al-dawaa.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.al-dawaa.com/en/offers', 'https://www.al-dawaa.com/en/promotions'] },
  { name: 'The Body Shop Saudi', websiteUrl: 'https://www.thebodyshop.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com.sa/en/sale'] },
  { name: 'Kiehl\'s Saudi', websiteUrl: 'https://www.kiehls.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.com.sa/en/offers'] },
  { name: 'Clinique Saudi', websiteUrl: 'https://www.clinique.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.sa/offers'] },
  { name: 'Estee Lauder Saudi', websiteUrl: 'https://www.esteelauder.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.sa/offers'] },
  { name: 'Lush Saudi', websiteUrl: 'https://www.lush.com/sa/en', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/sa/en/offers'] },
  { name: 'Victoria\'s Secret Saudi', websiteUrl: 'https://www.victoriassecret.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.victoriassecret.com.sa/en/sale'] },
  { name: 'NYX Saudi', websiteUrl: 'https://www.nyxcosmetics.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.com.sa/en/offers'] },
  { name: 'Maybelline Saudi', websiteUrl: 'https://www.maybelline.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.sa/offers'] },
  { name: 'L\'Oreal Paris Saudi', websiteUrl: 'https://www.loreal-paris.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.sa/offers'] },
  { name: 'Rituals Saudi', websiteUrl: 'https://www.rituals.com/en-sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/en-sa/sale'] },
  { name: 'Jo Malone Saudi', websiteUrl: 'https://www.jomalone.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.jomalone.com.sa/offers'] },
  { name: 'Huda Beauty', websiteUrl: 'https://hudabeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://hudabeauty.com/en/sale', 'https://hudabeauty.com/en/offers'] },
  { name: 'Charlotte Tilbury Saudi', websiteUrl: 'https://www.charlottetilbury.com/sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.charlottetilbury.com/sa/offers'] },
  { name: 'Benefit Saudi', websiteUrl: 'https://www.benefitcosmetics.com/sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.benefitcosmetics.com/sa/offers'] },
  { name: 'Swiss Arabian', websiteUrl: 'https://www.swissarabian.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.swissarabian.com/offers', 'https://www.swissarabian.com/sale'] },
  { name: 'Abdul Samad Al Qurashi', websiteUrl: 'https://www.asqgrp.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.asqgrp.com/en/offers'] },
  { name: 'Ajmal Perfumes Saudi', websiteUrl: 'https://www.ajmalperfume.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ajmalperfume.com/sa/offers'] },
  { name: 'Arabian Oud', websiteUrl: 'https://www.arabianoud.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.arabianoud.com/en/offers', 'https://www.arabianoud.com/en/sale'] },
  { name: 'Rasasi', websiteUrl: 'https://www.rasasi.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rasasi.com/offers'] },
  { name: 'Whites Beauty', websiteUrl: 'https://whites.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://whites.sa/en/beauty/sale'] },
  { name: 'Bobbi Brown Saudi', websiteUrl: 'https://www.bobbibrowncosmetics.com.sa', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bobbibrowncosmetics.com.sa/offers'] },
  { name: 'Tom Ford Beauty Saudi', websiteUrl: 'https://www.tomford.com/beauty', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.tomford.com/beauty/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sun & Sand Sports', websiteUrl: 'https://www.sssports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sssports.com/sa/en/sale', 'https://www.sssports.com/sa/en/offers'] },
  { name: 'Decathlon Saudi', websiteUrl: 'https://www.decathlon.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.sa/en/offers', 'https://www.decathlon.sa/en/sale'] },
  { name: 'Nike Saudi', websiteUrl: 'https://www.nike.com/sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/sa/sale', 'https://www.nike.com/sa/w/sale'] },
  { name: 'Adidas Saudi', websiteUrl: 'https://www.adidas.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.com.sa/en/sale', 'https://www.adidas.com.sa/en/outlet'] },
  { name: 'Puma Saudi', websiteUrl: 'https://www.puma.com/sa/en', categorySlug: 'spor-outdoor', seedUrls: ['https://www.puma.com/sa/en/sale'] },
  { name: 'Reebok Saudi', websiteUrl: 'https://www.reebok.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com.sa/en/sale'] },
  { name: 'Under Armour Saudi', websiteUrl: 'https://www.underarmour.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.sa/en-sa/outlet.html'] },
  { name: 'New Balance Saudi', websiteUrl: 'https://www.newbalance.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.sa/en/sale'] },
  { name: 'Foot Locker Saudi', websiteUrl: 'https://www.footlocker.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.footlocker.sa/en/sale', 'https://www.footlocker.sa/en/offers'] },
  { name: 'Go Sport Saudi', websiteUrl: 'https://www.go-sport.com/sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.go-sport.com/sa/en/sale'] },
  { name: 'Columbia Saudi', websiteUrl: 'https://www.columbiasportswear.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.com.sa/en/sale'] },
  { name: 'The North Face Saudi', websiteUrl: 'https://www.thenorthface.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.sa/en/sale'] },
  { name: 'Fila Saudi', websiteUrl: 'https://www.filaksa.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.filaksa.com/en/sale'] },
  { name: 'Converse Saudi', websiteUrl: 'https://www.converse.com/sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com/sa/sale'] },
  { name: 'Vans Saudi', websiteUrl: 'https://www.vans.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.com.sa/en/sale'] },
  { name: 'ASICS Saudi', websiteUrl: 'https://www.asics.com/sa/en-sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/sa/en-sa/sale/'] },
  { name: 'Lululemon Saudi', websiteUrl: 'https://www.lululemon.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lululemon.com.sa/en-sa/sale/'] },
  { name: 'Timberland Saudi', websiteUrl: 'https://www.timberland.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.com.sa/en/sale'] },
  { name: 'Skechers Sport Saudi', websiteUrl: 'https://www.skechers.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.sa/en/sale-sport'] },
  { name: 'GNC Saudi', websiteUrl: 'https://www.gnc.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gnc.sa/en/offers', 'https://www.gnc.sa/en/sale'] },
  { name: 'Gym Shark Saudi', websiteUrl: 'https://www.gymshark.com/sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gymshark.com/sa/sale'] },
  { name: 'Athlete\'s Co', websiteUrl: 'https://www.athletesco.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.athletesco.com/sa/en/sale'] },
  { name: 'Fitness First Saudi', websiteUrl: 'https://www.fitnessfirst.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitnessfirst.com.sa/offers'] },
  { name: 'Body Building Saudi', websiteUrl: 'https://www.bodybuilding.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bodybuilding.com/deals'] },
  { name: 'iHerb Saudi', websiteUrl: 'https://sa.iherb.com', categorySlug: 'spor-outdoor', seedUrls: ['https://sa.iherb.com/deals', 'https://sa.iherb.com/specials'] },
  { name: 'Brooks Saudi', websiteUrl: 'https://www.brooksrunning.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.brooksrunning.com/en_us/sale/'] },
  { name: 'Sports Corner Saudi', websiteUrl: 'https://www.sportscorner.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportscorner.com/sa/en/sale'] },
  { name: 'Intersport Saudi', websiteUrl: 'https://www.intersport.com.sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.com.sa/en/sale'] },
  { name: 'Hoka Saudi', websiteUrl: 'https://www.hoka.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hoka.com/en/sale/'] },
  { name: 'On Running Saudi', websiteUrl: 'https://www.on-running.com/en-sa', categorySlug: 'spor-outdoor', seedUrls: ['https://www.on-running.com/en-sa/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Saudia', websiteUrl: 'https://www.saudia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.saudia.com/offers', 'https://www.saudia.com/deals'] },
  { name: 'Flynas', websiteUrl: 'https://www.flynas.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flynas.com/en/offers', 'https://www.flynas.com/en/deals'] },
  { name: 'Flyadeal', websiteUrl: 'https://www.flyadeal.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flyadeal.com/en/offers', 'https://www.flyadeal.com/en/deals'] },
  { name: 'Almosafer', websiteUrl: 'https://www.almosafer.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.almosafer.com/en/offers', 'https://www.almosafer.com/en/deals'] },
  { name: 'Booking.com Saudi', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.html', 'https://www.booking.com/dealspage.html'] },
  { name: 'Careem', websiteUrl: 'https://www.careem.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.careem.com/en-sa/offers/', 'https://www.careem.com/en-sa/deals/'] },
  { name: 'Uber Saudi', websiteUrl: 'https://www.uber.com/sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/sa/en/offers/'] },
  { name: 'Emirates Saudi', websiteUrl: 'https://www.emirates.com/sa/english', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.emirates.com/sa/english/special-offers/'] },
  { name: 'Qatar Airways Saudi', websiteUrl: 'https://www.qatarairways.com/en-sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.qatarairways.com/en-sa/offers.html'] },
  { name: 'Turkish Airlines Saudi', websiteUrl: 'https://www.turkishairlines.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.turkishairlines.com/en-sa/promotions/'] },
  { name: 'Etihad Saudi', websiteUrl: 'https://www.etihad.com/en-sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.etihad.com/en-sa/deals'] },
  { name: 'Hilton Saudi', websiteUrl: 'https://www.hilton.com/en/locations/saudi-arabia', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hilton.com/en/offers/'] },
  { name: 'Marriott Saudi', websiteUrl: 'https://www.marriott.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com/offers/'] },
  { name: 'Agoda Saudi', websiteUrl: 'https://www.agoda.com/deals', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/deals'] },
  { name: 'Hotels.com Saudi', websiteUrl: 'https://sa.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://sa.hotels.com/deals/'] },
  { name: 'Trivago Saudi', websiteUrl: 'https://www.trivago.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.sa/deals'] },
  { name: 'Expedia Saudi', websiteUrl: 'https://www.expedia.com.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.sa/deals'] },
  { name: 'Skyscanner Saudi', websiteUrl: 'https://www.skyscanner.com.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.com.sa/deals'] },
  { name: 'Wego Saudi', websiteUrl: 'https://www.wego.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.wego.sa/deals'] },
  { name: 'Tajawal', websiteUrl: 'https://www.tajawal.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tajawal.com/en/offers'] },
  { name: 'Rehlat', websiteUrl: 'https://www.rehlat.com.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rehlat.com.sa/en/offers'] },
  { name: 'Gathern', websiteUrl: 'https://www.gathern.co', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.gathern.co/en/offers'] },
  { name: 'IHG Saudi', websiteUrl: 'https://www.ihg.com/hotels/sa/en', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ihg.com/hotels/sa/en/offers'] },
  { name: 'Accor Saudi', websiteUrl: 'https://all.accor.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://all.accor.com/promotions-offers/index.en.shtml'] },
  { name: 'Hyatt Saudi', websiteUrl: 'https://www.hyatt.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hyatt.com/offers'] },
  { name: 'Budget Saudi', websiteUrl: 'https://www.budget.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.budget.sa/en/offers'] },
  { name: 'Theeb Rent a Car', websiteUrl: 'https://www.theeb.com.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.theeb.com.sa/en/offers'] },
  { name: 'Lumi Saudi', websiteUrl: 'https://www.lumi.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lumi.sa/en/offers'] },
  { name: 'Kayak Saudi', websiteUrl: 'https://www.kayak.sa', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.sa/deals'] },
  { name: 'Trip.com Saudi', websiteUrl: 'https://www.trip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trip.com/sale/deals/'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Al Rajhi Bank', websiteUrl: 'https://www.alrajhibank.com.sa', categorySlug: 'finans', seedUrls: ['https://www.alrajhibank.com.sa/en/personal/offers', 'https://www.alrajhibank.com.sa/en/personal/promotions'] },
  { name: 'SNB', websiteUrl: 'https://www.snb.com', categorySlug: 'finans', seedUrls: ['https://www.snb.com/en/personal/offers', 'https://www.snb.com/en/personal/promotions'] },
  { name: 'Riyad Bank', websiteUrl: 'https://www.riyadbank.com', categorySlug: 'finans', seedUrls: ['https://www.riyadbank.com/en/personal/offers', 'https://www.riyadbank.com/en/personal/promotions'] },
  { name: 'STC Pay', websiteUrl: 'https://www.stcpay.com.sa', categorySlug: 'finans', seedUrls: ['https://www.stcpay.com.sa/en/offers', 'https://www.stcpay.com.sa/en/promotions'] },
  { name: 'Tabby', websiteUrl: 'https://tabby.ai', categorySlug: 'finans', seedUrls: ['https://tabby.ai/en-sa/offers', 'https://tabby.ai/en-sa/deals'] },
  { name: 'Tamara', websiteUrl: 'https://www.tamara.co', categorySlug: 'finans', seedUrls: ['https://www.tamara.co/en/offers', 'https://www.tamara.co/en/deals'] },
  { name: 'Apple Pay Saudi', websiteUrl: 'https://www.apple.com/sa/apple-pay', categorySlug: 'finans', seedUrls: ['https://www.apple.com/sa/apple-pay/'] },
  { name: 'Alinma Bank', websiteUrl: 'https://www.alinma.com', categorySlug: 'finans', seedUrls: ['https://www.alinma.com/en/personal/offers'] },
  { name: 'Al Bilad Bank', websiteUrl: 'https://www.bankalbilad.com', categorySlug: 'finans', seedUrls: ['https://www.bankalbilad.com/en/personal/offers'] },
  { name: 'BSF', websiteUrl: 'https://www.bfrsa.com', categorySlug: 'finans', seedUrls: ['https://www.bfrsa.com/en/personal/offers'] },
  { name: 'Arab National Bank', websiteUrl: 'https://www.anb.com.sa', categorySlug: 'finans', seedUrls: ['https://www.anb.com.sa/en/personal/offers'] },
  { name: 'SABB', websiteUrl: 'https://www.sabb.com', categorySlug: 'finans', seedUrls: ['https://www.sabb.com/en/personal/offers', 'https://www.sabb.com/en/personal/promotions'] },
  { name: 'Al Jazeera Bank', websiteUrl: 'https://www.baj.com.sa', categorySlug: 'finans', seedUrls: ['https://www.baj.com.sa/en/personal/offers'] },
  { name: 'GIB', websiteUrl: 'https://www.gib.com', categorySlug: 'finans', seedUrls: ['https://www.gib.com/en/personal/offers'] },
  { name: 'Mada', websiteUrl: 'https://www.mada.com.sa', categorySlug: 'finans', seedUrls: ['https://www.mada.com.sa/en/offers'] },
  { name: 'Visa Saudi', websiteUrl: 'https://www.visa.com.sa', categorySlug: 'finans', seedUrls: ['https://www.visa.com.sa/en_SA/pay-with-visa/offers-and-promotions.html'] },
  { name: 'Mastercard Saudi', websiteUrl: 'https://www.mastercard.com.sa', categorySlug: 'finans', seedUrls: ['https://www.mastercard.com.sa/en-sa/personal/find-a-deal.html'] },
  { name: 'Spotii', websiteUrl: 'https://www.spotii.com', categorySlug: 'finans', seedUrls: ['https://www.spotii.com/en-sa/offers'] },
  { name: 'Emkan Finance', websiteUrl: 'https://www.emkan.sa', categorySlug: 'finans', seedUrls: ['https://www.emkan.sa/en/offers'] },
  { name: 'Abdul Latif Jameel Finance', websiteUrl: 'https://www.aljfinance.com', categorySlug: 'finans', seedUrls: ['https://www.aljfinance.com/en/offers'] },
  { name: 'Tasheel Finance', websiteUrl: 'https://www.tasheel.com.sa', categorySlug: 'finans', seedUrls: ['https://www.tasheel.com.sa/en/offers'] },
  { name: 'Nayifat', websiteUrl: 'https://www.nayifat.com', categorySlug: 'finans', seedUrls: ['https://www.nayifat.com/en/offers'] },
  { name: 'Murabaha Saudi', websiteUrl: 'https://www.murabaha.com.sa', categorySlug: 'finans', seedUrls: ['https://www.murabaha.com.sa/offers'] },
  { name: 'SAB Invest', websiteUrl: 'https://www.sabbinvest.com', categorySlug: 'finans', seedUrls: ['https://www.sabbinvest.com/en/offers'] },
  { name: 'Al Rajhi Takaful', websiteUrl: 'https://www.alrajhitakaful.com.sa', categorySlug: 'finans', seedUrls: ['https://www.alrajhitakaful.com.sa/en/offers'] },
  { name: 'Urpay', websiteUrl: 'https://www.urpay.com', categorySlug: 'finans', seedUrls: ['https://www.urpay.com/en/offers'] },
  { name: 'HalaPay', websiteUrl: 'https://www.halapay.com', categorySlug: 'finans', seedUrls: ['https://www.halapay.com/offers'] },
  { name: 'PayTabs', websiteUrl: 'https://www.paytabs.com/sa', categorySlug: 'finans', seedUrls: ['https://www.paytabs.com/sa/offers'] },
  { name: 'Moyasar', websiteUrl: 'https://moyasar.com', categorySlug: 'finans', seedUrls: ['https://moyasar.com/offers'] },
  { name: 'Saudi Fransi Capital', websiteUrl: 'https://www.fransicapital.com.sa', categorySlug: 'finans', seedUrls: ['https://www.fransicapital.com.sa/en/offers'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tawuniya', websiteUrl: 'https://www.tawuniya.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.tawuniya.com.sa/en/offers', 'https://www.tawuniya.com.sa/en/promotions'] },
  { name: 'Bupa Arabia', websiteUrl: 'https://www.bupa.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.bupa.com.sa/en/offers', 'https://www.bupa.com.sa/en/promotions'] },
  { name: 'Malath Insurance', websiteUrl: 'https://www.malath.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.malath.com.sa/en/offers'] },
  { name: 'Walaa Insurance', websiteUrl: 'https://www.walaa.com', categorySlug: 'sigorta', seedUrls: ['https://www.walaa.com/en/offers'] },
  { name: 'AXA Cooperative', websiteUrl: 'https://www.axa-cooperative.com', categorySlug: 'sigorta', seedUrls: ['https://www.axa-cooperative.com/en/offers'] },
  { name: 'Medgulf', websiteUrl: 'https://www.medgulf.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.medgulf.com.sa/en/offers'] },
  { name: 'Allianz Saudi', websiteUrl: 'https://www.allianzcare.com/sa', categorySlug: 'sigorta', seedUrls: ['https://www.allianzcare.com/sa/offers'] },
  { name: 'Gulf Union', websiteUrl: 'https://www.gulfunion.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.gulfunion.com.sa/en/offers'] },
  { name: 'ACIG', websiteUrl: 'https://www.acig.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.acig.com.sa/en/offers'] },
  { name: 'Salama Insurance', websiteUrl: 'https://www.salama.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.salama.com.sa/en/offers'] },
  { name: 'Saudi Re', websiteUrl: 'https://www.saudire.net', categorySlug: 'sigorta', seedUrls: ['https://www.saudire.net/en/offers'] },
  { name: 'Al Sagr Insurance', websiteUrl: 'https://www.alsagr.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.alsagr.com.sa/en/offers'] },
  { name: 'Solidarity Saudi', websiteUrl: 'https://www.solidarity.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.solidarity.com.sa/en/offers'] },
  { name: 'Arabian Shield', websiteUrl: 'https://www.arabianshield.com', categorySlug: 'sigorta', seedUrls: ['https://www.arabianshield.com/en/offers'] },
  { name: 'Buruj Insurance', websiteUrl: 'https://www.buruj.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.buruj.com.sa/en/offers'] },
  { name: 'SAICO', websiteUrl: 'https://www.saico.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.saico.com.sa/en/offers'] },
  { name: 'Chubb Saudi', websiteUrl: 'https://www.chubb.com/sa-en', categorySlug: 'sigorta', seedUrls: ['https://www.chubb.com/sa-en/offers.html'] },
  { name: 'Wataniya Insurance', websiteUrl: 'https://www.wataniya.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.wataniya.com.sa/en/offers'] },
  { name: 'Al Ahlia Insurance', websiteUrl: 'https://www.alahlia.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.alahlia.com.sa/en/offers'] },
  { name: 'MetLife Saudi', websiteUrl: 'https://www.metlife.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.com.sa/en/offers'] },
  { name: 'Tokio Marine Saudi', websiteUrl: 'https://www.tokiomarine.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.tokiomarine.com.sa/en/offers'] },
  { name: 'GIG Saudi', websiteUrl: 'https://www.gigsaudi.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.gigsaudi.com.sa/en/offers'] },
  { name: 'Amana Insurance', websiteUrl: 'https://www.amanainsurance.com.sa', categorySlug: 'sigorta', seedUrls: ['https://www.amanainsurance.com.sa/en/offers'] },
  { name: 'Najm', websiteUrl: 'https://www.najm.sa', categorySlug: 'sigorta', seedUrls: ['https://www.najm.sa/en/offers'] },
  { name: 'Tameeni', websiteUrl: 'https://www.tameeni.com', categorySlug: 'sigorta', seedUrls: ['https://www.tameeni.com/en/offers', 'https://www.tameeni.com/en/deals'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Abdul Latif Jameel', websiteUrl: 'https://www.alj.com', categorySlug: 'otomobil', seedUrls: ['https://www.alj.com/en/offers', 'https://www.alj.com/en/promotions'] },
  { name: 'Toyota Saudi', websiteUrl: 'https://www.toyota.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.sa/en/offers', 'https://www.toyota.com.sa/en/promotions'] },
  { name: 'Hyundai Saudi', websiteUrl: 'https://www.hyundai.com/sa/en', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/sa/en/offers', 'https://www.hyundai.com/sa/en/promotions'] },
  { name: 'Nissan Saudi', websiteUrl: 'https://www.nissan-sa.com', categorySlug: 'otomobil', seedUrls: ['https://www.nissan-sa.com/offers.html', 'https://www.nissan-sa.com/promotions.html'] },
  { name: 'Kia Saudi', websiteUrl: 'https://www.kia.com/sa/en', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/sa/en/offers.html'] },
  { name: 'Chevrolet Saudi', websiteUrl: 'https://www.chevrolet.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.com.sa/current-offers'] },
  { name: 'Ford Saudi', websiteUrl: 'https://www.ford.sa', categorySlug: 'otomobil', seedUrls: ['https://www.ford.sa/offers', 'https://www.ford.sa/deals'] },
  { name: 'Honda Saudi', websiteUrl: 'https://www.honda.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.sa/offers'] },
  { name: 'Mazda Saudi', websiteUrl: 'https://www.mazda.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.com.sa/offers'] },
  { name: 'BMW Saudi', websiteUrl: 'https://www.bmw-ksa.com', categorySlug: 'otomobil', seedUrls: ['https://www.bmw-ksa.com/en/offers.html'] },
  { name: 'Mercedes Saudi', websiteUrl: 'https://www.mercedes-benz.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.sa/en/passengercars/models/offers.html'] },
  { name: 'Audi Saudi', websiteUrl: 'https://www.audi.sa', categorySlug: 'otomobil', seedUrls: ['https://www.audi.sa/sa/web/en/offers.html'] },
  { name: 'Lexus Saudi', websiteUrl: 'https://www.lexus.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.lexus.com.sa/en/offers'] },
  { name: 'GMC Saudi', websiteUrl: 'https://www.gmc.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.gmc.com.sa/current-offers'] },
  { name: 'Mitsubishi Saudi', websiteUrl: 'https://www.mitsubishi-motors.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.com.sa/en/offers'] },
  { name: 'Suzuki Saudi', websiteUrl: 'https://www.suzuki.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.com.sa/en/offers'] },
  { name: 'Geely Saudi', websiteUrl: 'https://www.geely-ksa.com', categorySlug: 'otomobil', seedUrls: ['https://www.geely-ksa.com/en/offers'] },
  { name: 'Changan Saudi', websiteUrl: 'https://www.changan-ksa.com', categorySlug: 'otomobil', seedUrls: ['https://www.changan-ksa.com/en/offers'] },
  { name: 'MG Saudi', websiteUrl: 'https://www.mgmotor.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.com.sa/en/offers'] },
  { name: 'Haval Saudi', websiteUrl: 'https://www.haval-ksa.com', categorySlug: 'otomobil', seedUrls: ['https://www.haval-ksa.com/en/offers'] },
  { name: 'JAC Motors Saudi', websiteUrl: 'https://www.jac-motors.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.jac-motors.com.sa/en/offers'] },
  { name: 'Jetour Saudi', websiteUrl: 'https://www.jetour.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.jetour.com.sa/en/offers'] },
  { name: 'Chery Saudi', websiteUrl: 'https://www.cheryksa.com', categorySlug: 'otomobil', seedUrls: ['https://www.cheryksa.com/en/offers'] },
  { name: 'Land Rover Saudi', websiteUrl: 'https://www.landrover.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.landrover.com.sa/en/offers.html'] },
  { name: 'Porsche Saudi', websiteUrl: 'https://www.porsche.com/middle-east', categorySlug: 'otomobil', seedUrls: ['https://www.porsche.com/middle-east/offers/'] },
  { name: 'Volkswagen Saudi', websiteUrl: 'https://www.volkswagen.sa', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.sa/en/offers.html'] },
  { name: 'Peugeot Saudi', websiteUrl: 'https://www.peugeot.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.sa/en/offers/'] },
  { name: 'Subaru Saudi', websiteUrl: 'https://www.subaru.com.sa', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.com.sa/offers'] },
  { name: 'BYD Saudi', websiteUrl: 'https://www.byd.com/sa', categorySlug: 'otomobil', seedUrls: ['https://www.byd.com/sa/en/offers'] },
  { name: 'Tesla Saudi', websiteUrl: 'https://www.tesla.com/sa_en', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/sa_en'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi (kitap-hobi) — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Jarir Books', websiteUrl: 'https://www.jarir.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.jarir.com/sa-en/books-offers', 'https://www.jarir.com/sa-en/stationery-offers'] },
  { name: 'Virgin Megastore Saudi', websiteUrl: 'https://www.virginmegastore.sa', categorySlug: 'kitap-hobi', seedUrls: ['https://www.virginmegastore.sa/en/sale', 'https://www.virginmegastore.sa/en/deals'] },
  { name: 'Jamalon', websiteUrl: 'https://www.jamalon.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.jamalon.com/en/offers', 'https://www.jamalon.com/en/sale'] },
  { name: 'Obeikan', websiteUrl: 'https://www.obeikan.com.sa', categorySlug: 'kitap-hobi', seedUrls: ['https://www.obeikan.com.sa/en/offers'] },
  { name: 'Sony PlayStation Saudi', websiteUrl: 'https://store.playstation.com/en-sa', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/en-sa/category/deals'] },
  { name: 'Xbox Saudi', websiteUrl: 'https://www.xbox.com/en-SA', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/en-SA/games/sales-and-specials'] },
  { name: 'Nintendo Saudi', websiteUrl: 'https://www.nintendo.com/en-gb', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/en-gb/Games/Nintendo-Switch/deals'] },
  { name: 'Steam Saudi', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Epic Games', websiteUrl: 'https://store.epicgames.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.epicgames.com/en-US/free-games', 'https://store.epicgames.com/en-US/sales-and-specials'] },
  { name: 'Geekay Games Saudi', websiteUrl: 'https://www.geekaygames.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.geekaygames.com/sa/offers', 'https://www.geekaygames.com/sa/sale'] },
  { name: 'Games Store Saudi', websiteUrl: 'https://www.games-store.sa', categorySlug: 'kitap-hobi', seedUrls: ['https://www.games-store.sa/offers'] },
  { name: 'LEGO Saudi', websiteUrl: 'https://www.lego.com/en-sa', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-sa/deals'] },
  { name: 'Toys R Us Saudi', websiteUrl: 'https://www.toysrusmena.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrusmena.com/sa/en/sale', 'https://www.toysrusmena.com/sa/en/offers'] },
  { name: 'Hamleys Saudi', websiteUrl: 'https://www.hamleys.sa', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hamleys.sa/en/sale'] },
  { name: 'Amazon Books Saudi', websiteUrl: 'https://www.amazon.sa', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.sa/books-deals/'] },
  { name: 'Spotify Saudi', websiteUrl: 'https://www.spotify.com/sa-en', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/sa-en/premium/'] },
  { name: 'Netflix Saudi', websiteUrl: 'https://www.netflix.com/sa-en', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/sa-en/'] },
  { name: 'Shahid', websiteUrl: 'https://shahid.mbc.net', categorySlug: 'kitap-hobi', seedUrls: ['https://shahid.mbc.net/en/offers'] },
  { name: 'OSN', websiteUrl: 'https://www.osn.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.osn.com/en-sa/offers'] },
  { name: 'Anghami', websiteUrl: 'https://www.anghami.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.anghami.com/offers'] },
  { name: 'Apple Music Saudi', websiteUrl: 'https://music.apple.com/sa', categorySlug: 'kitap-hobi', seedUrls: ['https://music.apple.com/sa/offers'] },
  { name: 'Noon Books', websiteUrl: 'https://www.noon.com/saudi-en/books', categorySlug: 'kitap-hobi', seedUrls: ['https://www.noon.com/saudi-en/books/deals/'] },
  { name: 'Hobby Works', websiteUrl: 'https://www.hobbyworks.sa', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbyworks.sa/offers'] },
  { name: 'Darayn', websiteUrl: 'https://www.darayn.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.darayn.com/offers'] },
  { name: 'Manga Saudi', websiteUrl: 'https://www.mangaproductions.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mangaproductions.com/offers'] },
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
  console.log('=== SA Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'SA' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'SA', categoryId: category.id },
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
            schedule: '0 9 * * *',
            agingDays: 7,
            market: 'SA',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'SA' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'SA', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active SA sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
