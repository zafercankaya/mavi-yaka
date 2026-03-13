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

// ── ALL THAILAND BRANDS DATA ────────────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Shopee Thailand', websiteUrl: 'https://shopee.co.th', categorySlug: 'alisveris', seedUrls: ['https://shopee.co.th/flash_sale', 'https://shopee.co.th/m/promo'] },
  { name: 'Lazada Thailand', websiteUrl: 'https://www.lazada.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.lazada.co.th/wow/gcp/route/lazada/th/channel/flashsale', 'https://www.lazada.co.th/promotion/'] },
  { name: 'JD Central', websiteUrl: 'https://www.jd.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.jd.co.th/promotion.html', 'https://www.jd.co.th/flashsale.html'] },
  { name: 'Central Online', websiteUrl: 'https://www.central.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.central.co.th/th/sale', 'https://www.central.co.th/th/promotion'] },
  { name: 'Tops Online', websiteUrl: 'https://www.tops.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.tops.co.th/en/promotion', 'https://www.tops.co.th/en/deals'] },
  { name: 'NocNoc', websiteUrl: 'https://www.nocnoc.com', categorySlug: 'alisveris', seedUrls: ['https://www.nocnoc.com/promotion', 'https://www.nocnoc.com/sale'] },
  { name: 'Robinson Online', websiteUrl: 'https://www.robinson.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.robinson.co.th/th/sale', 'https://www.robinson.co.th/th/promotion'] },
  { name: 'The Mall', websiteUrl: 'https://www.themall.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.themall.co.th/promotion'] },
  { name: 'Big C Online', websiteUrl: 'https://www.bigc.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.bigc.co.th/promotion', 'https://www.bigc.co.th/deals'] },
  { name: 'Lotus Online', websiteUrl: 'https://www.lotuss.com', categorySlug: 'alisveris', seedUrls: ['https://www.lotuss.com/th/promotion', 'https://www.lotuss.com/th/deals'] },
  { name: 'AliExpress Thailand', websiteUrl: 'https://th.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://th.aliexpress.com/campaign/wow/th/sale.htm', 'https://th.aliexpress.com/wholesale'] },
  { name: 'Temu Thailand', websiteUrl: 'https://www.temu.com/th', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/th/sale.html', 'https://www.temu.com/th/deals.html'] },
  { name: 'King Power Online', websiteUrl: 'https://www.kingpower.com', categorySlug: 'alisveris', seedUrls: ['https://www.kingpower.com/en/promotion', 'https://www.kingpower.com/en/sale'] },
  { name: 'Siam Paragon', websiteUrl: 'https://www.siamparagon.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.siamparagon.co.th/promotion'] },
  { name: 'EmQuartier', websiteUrl: 'https://www.emquartier.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.emquartier.co.th/promotions'] },
  { name: 'Emporium', websiteUrl: 'https://www.emporium.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.emporium.co.th/promotions'] },
  { name: 'ICON Siam', websiteUrl: 'https://www.iconsiam.com', categorySlug: 'alisveris', seedUrls: ['https://www.iconsiam.com/en/promotions', 'https://www.iconsiam.com/en/events'] },
  { name: 'Terminal 21', websiteUrl: 'https://www.terminal21.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.terminal21.co.th/promotion'] },
  { name: 'Siam Center', websiteUrl: 'https://www.siamcenter.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.siamcenter.co.th/promotion'] },
  { name: 'Siam Discovery', websiteUrl: 'https://www.siamdiscovery.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.siamdiscovery.co.th/promotion'] },
  { name: 'CentralWorld', websiteUrl: 'https://www.centralworld.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.centralworld.co.th/promotion'] },
  { name: 'MBK Center', websiteUrl: 'https://www.mbk-center.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.mbk-center.co.th/en/promotion'] },
  { name: 'Central Pattana', websiteUrl: 'https://www.centralpattana.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.centralpattana.co.th/en/promotions'] },
  { name: 'The1', websiteUrl: 'https://www.the1.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.the1.co.th/privilege', 'https://www.the1.co.th/deals'] },
  { name: 'Pomelo', websiteUrl: 'https://www.pomelofashion.com/th/en/', categorySlug: 'alisveris', seedUrls: ['https://www.pomelofashion.com/th/en/sale'] },
  { name: 'Zilingo Thailand', websiteUrl: 'https://zilingo.co.th', categorySlug: 'alisveris', seedUrls: ['https://zilingo.co.th/deals'] },
  { name: 'LnwShop', websiteUrl: 'https://www.lnwshop.com', categorySlug: 'alisveris', seedUrls: ['https://www.lnwshop.com/promotion'] },
  { name: 'Officemate', websiteUrl: 'https://www.ofm.co.th', categorySlug: 'alisveris', seedUrls: ['https://www.ofm.co.th/promotion', 'https://www.ofm.co.th/sale'] },
  { name: 'Konvy', websiteUrl: 'https://www.konvy.com', categorySlug: 'alisveris', seedUrls: ['https://www.konvy.com/promotion/', 'https://www.konvy.com/sale/'] },
  { name: 'LOOKSI', websiteUrl: 'https://www.looksi.com', categorySlug: 'alisveris', seedUrls: ['https://www.looksi.com/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Banana IT', websiteUrl: 'https://www.bananait.com', categorySlug: 'elektronik', seedUrls: ['https://www.bananait.com/promotion', 'https://www.bananait.com/sale'] },
  { name: 'JIB', websiteUrl: 'https://www.jib.co.th', categorySlug: 'elektronik', seedUrls: ['https://www.jib.co.th/web/promotion', 'https://www.jib.co.th/web/sale'] },
  { name: 'Power Buy', websiteUrl: 'https://www.powerbuy.co.th', categorySlug: 'elektronik', seedUrls: ['https://www.powerbuy.co.th/th/promotion', 'https://www.powerbuy.co.th/th/sale'] },
  { name: 'IT City', websiteUrl: 'https://www.itcity.co.th', categorySlug: 'elektronik', seedUrls: ['https://www.itcity.co.th/promotion'] },
  { name: 'BNN', websiteUrl: 'https://www.bnn.in.th', categorySlug: 'elektronik', seedUrls: ['https://www.bnn.in.th/promotion', 'https://www.bnn.in.th/sale'] },
  { name: 'Samsung Thailand', websiteUrl: 'https://www.samsung.com/th/', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/th/offer/', 'https://www.samsung.com/th/campaign/'] },
  { name: 'Apple Thailand (iStudio)', websiteUrl: 'https://www.istudio.store', categorySlug: 'elektronik', seedUrls: ['https://www.istudio.store/promotion', 'https://www.istudio.store/sale'] },
  { name: 'Xiaomi Thailand', websiteUrl: 'https://www.mi.com/th', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/th/sale/', 'https://www.mi.com/th/event/'] },
  { name: 'OPPO Thailand', websiteUrl: 'https://www.oppo.com/th/', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/th/offer/', 'https://www.oppo.com/th/events/'] },
  { name: 'Vivo Thailand', websiteUrl: 'https://www.vivo.com/th', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com/th/campaign', 'https://www.vivo.com/th/promotion'] },
  { name: 'Realme Thailand', websiteUrl: 'https://www.realme.com/th', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/th/deal'] },
  { name: 'ASUS Thailand', websiteUrl: 'https://www.asus.com/th/', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/th/campaign/', 'https://www.asus.com/th/events/'] },
  { name: 'Lenovo Thailand', websiteUrl: 'https://www.lenovo.com/th/th/', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/th/th/d/deals/'] },
  { name: 'HP Thailand', websiteUrl: 'https://www.hp.com/th-th/', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/th-th/shop/offer.aspx'] },
  { name: 'Dell Thailand', websiteUrl: 'https://www.dell.com/th-th', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/th-th/lp/deals'] },
  { name: 'Acer Thailand', websiteUrl: 'https://www.acer.com/th-th', categorySlug: 'elektronik', seedUrls: ['https://www.acer.com/th-th/promotions'] },
  { name: 'LG Thailand', websiteUrl: 'https://www.lg.com/th/', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/th/promo/'] },
  { name: 'Sony Thailand', websiteUrl: 'https://www.sony.co.th', categorySlug: 'elektronik', seedUrls: ['https://www.sony.co.th/en/promotions', 'https://www.sony.co.th/en/campaign'] },
  { name: 'Panasonic Thailand', websiteUrl: 'https://www.panasonic.com/th/', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/th/promotion.html'] },
  { name: 'Sharp Thailand', websiteUrl: 'https://www.sharpthai.co.th', categorySlug: 'elektronik', seedUrls: ['https://www.sharpthai.co.th/promotion'] },
  { name: 'Philips Thailand', websiteUrl: 'https://www.philips.co.th', categorySlug: 'elektronik', seedUrls: ['https://www.philips.co.th/promo'] },
  { name: 'Studio7', websiteUrl: 'https://www.studio7thailand.com', categorySlug: 'elektronik', seedUrls: ['https://www.studio7thailand.com/promotion', 'https://www.studio7thailand.com/sale'] },
  { name: 'Jaymart', websiteUrl: 'https://www.jaymart.co.th', categorySlug: 'elektronik', seedUrls: ['https://www.jaymart.co.th/promotion'] },
  { name: 'AIS Shop', websiteUrl: 'https://shop.ais.co.th', categorySlug: 'elektronik', seedUrls: ['https://shop.ais.co.th/promotion', 'https://shop.ais.co.th/deal'] },
  { name: 'True Store', websiteUrl: 'https://store.true.th', categorySlug: 'elektronik', seedUrls: ['https://store.true.th/promotion'] },
  { name: 'DTAC Shop', websiteUrl: 'https://shop.dtac.co.th', categorySlug: 'elektronik', seedUrls: ['https://shop.dtac.co.th/promotion'] },
  { name: 'Infinix Thailand', websiteUrl: 'https://www.infinixmobility.com/th', categorySlug: 'elektronik', seedUrls: ['https://www.infinixmobility.com/th/offer'] },
  { name: 'Tecno Thailand', websiteUrl: 'https://www.tecno-mobile.com/th/', categorySlug: 'elektronik', seedUrls: ['https://www.tecno-mobile.com/th/promo/'] },
  { name: 'Honor Thailand', websiteUrl: 'https://www.honor.com/th/', categorySlug: 'elektronik', seedUrls: ['https://www.honor.com/th/offer/'] },
  { name: 'Nothing Thailand', websiteUrl: 'https://th.nothing.tech', categorySlug: 'elektronik', seedUrls: ['https://th.nothing.tech/pages/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Fashion (giyim-moda) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'UNIQLO Thailand', websiteUrl: 'https://www.uniqlo.com/th/th/', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/th/th/spl/sale', 'https://www.uniqlo.com/th/th/spl/limited-offers'] },
  { name: 'H&M Thailand', websiteUrl: 'https://www2.hm.com/th_th/', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/th_th/sale.html', 'https://www2.hm.com/th_th/offers.html'] },
  { name: 'Zara Thailand', websiteUrl: 'https://www.zara.com/th/', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/th/en/z-sale-l1314.html'] },
  { name: 'Cotton On Thailand', websiteUrl: 'https://cottonon.com/TH/', categorySlug: 'giyim-moda', seedUrls: ['https://cottonon.com/TH/sale/'] },
  { name: 'Pull&Bear Thailand', websiteUrl: 'https://www.pullandbear.com/th/', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/th/sale-n6417'] },
  { name: 'Mango Thailand', websiteUrl: 'https://shop.mango.com/th', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/th/sale'] },
  { name: 'Charles & Keith Thailand', websiteUrl: 'https://www.charleskeith.com/th', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/th/sale'] },
  { name: 'Nike Thailand', websiteUrl: 'https://www.nike.com/th/', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/th/w/sale-3yaep'] },
  { name: 'Adidas Thailand', websiteUrl: 'https://www.adidas.co.th', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.co.th/sale', 'https://www.adidas.co.th/outlet'] },
  { name: 'Pomelo Fashion', websiteUrl: 'https://www.pomelofashion.com/th/en/', categorySlug: 'giyim-moda', seedUrls: ['https://www.pomelofashion.com/th/en/sale', 'https://www.pomelofashion.com/th/en/promotion'] },
  { name: 'Jaspal', websiteUrl: 'https://www.jaspal.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.jaspal.com/sale', 'https://www.jaspal.com/promotion'] },
  { name: 'CPS Chaps', websiteUrl: 'https://www.cpschaps.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.cpschaps.com/sale'] },
  { name: 'Sretsis', websiteUrl: 'https://www.sretsisbangkok.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sretsisbangkok.com/sale'] },
  { name: 'Greyhound Original', websiteUrl: 'https://www.greyhoundoriginal.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.greyhoundoriginal.com/sale'] },
  { name: 'Disaya', websiteUrl: 'https://www.disaya.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.disaya.com/sale'] },
  { name: 'Naraya', websiteUrl: 'https://www.naraya.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.naraya.com/promotion'] },
  { name: 'Carnival', websiteUrl: 'https://www.carnivalbkk.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.carnivalbkk.com/sale'] },
  { name: 'Kloset', websiteUrl: 'https://www.kloset.co.th', categorySlug: 'giyim-moda', seedUrls: ['https://www.kloset.co.th/sale'] },
  { name: 'AIIZ', websiteUrl: 'https://www.aiiz.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.aiiz.com/sale', 'https://www.aiiz.com/promotion'] },
  { name: 'Gentlewoman', websiteUrl: 'https://gentlewomanonline.com', categorySlug: 'giyim-moda', seedUrls: ['https://gentlewomanonline.com/sale'] },
  { name: 'Padini Thailand', websiteUrl: 'https://www.padini.com/th', categorySlug: 'giyim-moda', seedUrls: ['https://www.padini.com/th/sale'] },
  { name: 'Puma Thailand', websiteUrl: 'https://th.puma.com', categorySlug: 'giyim-moda', seedUrls: ['https://th.puma.com/th/th/sale'] },
  { name: 'New Balance Thailand', websiteUrl: 'https://www.newbalance.co.th', categorySlug: 'giyim-moda', seedUrls: ['https://www.newbalance.co.th/sale'] },
  { name: 'Converse Thailand', websiteUrl: 'https://www.converse.co.th', categorySlug: 'giyim-moda', seedUrls: ['https://www.converse.co.th/sale'] },
  { name: 'Vans Thailand', websiteUrl: 'https://www.vans.co.th', categorySlug: 'giyim-moda', seedUrls: ['https://www.vans.co.th/sale'] },
  { name: 'Skechers Thailand', websiteUrl: 'https://www.skechers.co.th', categorySlug: 'giyim-moda', seedUrls: ['https://www.skechers.co.th/sale', 'https://www.skechers.co.th/promotion'] },
  { name: 'Marks & Spencer Thailand', websiteUrl: 'https://www.marksandspencer.co.th', categorySlug: 'giyim-moda', seedUrls: ['https://www.marksandspencer.co.th/sale'] },
  { name: 'Bershka Thailand', websiteUrl: 'https://www.bershka.com/th/', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/th/sale-c1010076518.html'] },
  { name: 'Massimo Dutti Thailand', websiteUrl: 'https://www.massimodutti.com/th/', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/th/sale'] },
  { name: 'Lyn Around', websiteUrl: 'https://www.lynaround.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.lynaround.com/sale', 'https://www.lynaround.com/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 4) Groceries (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tops Market', websiteUrl: 'https://www.tops.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.tops.co.th/en/promotion', 'https://www.tops.co.th/en/weekly-deals'] },
  { name: 'Big C', websiteUrl: 'https://www.bigc.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.bigc.co.th/promotion', 'https://www.bigc.co.th/weekly-promotion'] },
  { name: 'Lotus (Tesco)', websiteUrl: 'https://www.lotuss.com', categorySlug: 'gida-market', seedUrls: ['https://www.lotuss.com/th/promotion', 'https://www.lotuss.com/th/weekly-promotion'] },
  { name: 'Makro', websiteUrl: 'https://www.makro.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.makro.co.th/promotion', 'https://www.makro.co.th/deals'] },
  { name: 'Villa Market', websiteUrl: 'https://www.villamarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.villamarket.com/promotion', 'https://www.villamarket.com/weekly-deals'] },
  { name: 'Gourmet Market', websiteUrl: 'https://www.gourmetmarketthailand.com', categorySlug: 'gida-market', seedUrls: ['https://www.gourmetmarketthailand.com/promotion'] },
  { name: 'MaxValu', websiteUrl: 'https://www.maxvalu.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.maxvalu.co.th/promotion'] },
  { name: 'Family Mart Thailand', websiteUrl: 'https://www.familymart.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.familymart.co.th/promotion'] },
  { name: '7-Eleven Thailand', websiteUrl: 'https://www.7eleven.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.7eleven.co.th/promotion', 'https://www.7eleven.co.th/deals'] },
  { name: 'CJ Express', websiteUrl: 'https://www.cjexpress.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.cjexpress.co.th/promotion'] },
  { name: 'Lawson 108 Thailand', websiteUrl: 'https://www.lawson108.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.lawson108.co.th/promotion'] },
  { name: 'Central Food Hall', websiteUrl: 'https://www.centralfoodhall.com', categorySlug: 'gida-market', seedUrls: ['https://www.centralfoodhall.com/promotion'] },
  { name: 'Foodland Thailand', websiteUrl: 'https://www.foodland.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.foodland.co.th/promotion'] },
  { name: 'HappyFresh Thailand', websiteUrl: 'https://www.happyfresh.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.happyfresh.co.th/promotion/'] },
  { name: 'Freshket', websiteUrl: 'https://www.freshket.co', categorySlug: 'gida-market', seedUrls: ['https://www.freshket.co/promotion'] },
  { name: 'Siam Makro Online', websiteUrl: 'https://www.makroclick.com', categorySlug: 'gida-market', seedUrls: ['https://www.makroclick.com/promotion', 'https://www.makroclick.com/deals'] },
  { name: 'CP FreshMart', websiteUrl: 'https://www.cpfreshmart.com', categorySlug: 'gida-market', seedUrls: ['https://www.cpfreshmart.com/promotion'] },
  { name: 'Rimping Supermarket', websiteUrl: 'https://www.rimping.com', categorySlug: 'gida-market', seedUrls: ['https://www.rimping.com/promotion'] },
  { name: 'UFM Fuji Super', websiteUrl: 'https://www.ufmfujisuper.com', categorySlug: 'gida-market', seedUrls: ['https://www.ufmfujisuper.com/promotion'] },
  { name: 'Tops Daily', websiteUrl: 'https://www.topsdaily.com', categorySlug: 'gida-market', seedUrls: ['https://www.topsdaily.com/promotion'] },
  { name: 'Mini Big C', websiteUrl: 'https://www.bigc.co.th/mini', categorySlug: 'gida-market', seedUrls: ['https://www.bigc.co.th/mini/promotion'] },
  { name: 'True Smart Merchant', websiteUrl: 'https://www.truesmartmerchant.com', categorySlug: 'gida-market', seedUrls: ['https://www.truesmartmerchant.com/promotion'] },
  { name: 'All Online', websiteUrl: 'https://www.allonline.7eleven.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.allonline.7eleven.co.th/promotion'] },
  { name: 'Lotus Go Fresh', websiteUrl: 'https://www.lotuss.com/th/go-fresh', categorySlug: 'gida-market', seedUrls: ['https://www.lotuss.com/th/go-fresh/promotion'] },
  { name: 'Miniso Thailand', websiteUrl: 'https://www.miniso.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.miniso.co.th/promotion'] },
  { name: 'Daiso Thailand', websiteUrl: 'https://www.daisojapan.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.daisojapan.co.th/promotion'] },
  { name: 'Tesco Lotus Express', websiteUrl: 'https://www.lotuss.com/th/express', categorySlug: 'gida-market', seedUrls: ['https://www.lotuss.com/th/express/promotion'] },
  { name: 'Don Don Donki Thailand', websiteUrl: 'https://www.dondondonki.com/th/', categorySlug: 'gida-market', seedUrls: ['https://www.dondondonki.com/th/promotions'] },
  { name: 'Mega Home', websiteUrl: 'https://www.megahome.co.th', categorySlug: 'gida-market', seedUrls: ['https://www.megahome.co.th/promotion'] },
  { name: 'KKV Thailand', websiteUrl: 'https://www.kkv.com/th', categorySlug: 'gida-market', seedUrls: ['https://www.kkv.com/th/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 5) Food & Dining (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'GrabFood Thailand', websiteUrl: 'https://food.grab.com/th/', categorySlug: 'yeme-icme', seedUrls: ['https://food.grab.com/th/en/promo', 'https://www.grab.com/th/promo/food/'] },
  { name: 'LINE MAN', websiteUrl: 'https://www.lineman.line.me', categorySlug: 'yeme-icme', seedUrls: ['https://www.lineman.line.me/promotion/', 'https://www.lineman.line.me/deals/'] },
  { name: 'Robinhood Thailand', websiteUrl: 'https://robinhoodthailand.com', categorySlug: 'yeme-icme', seedUrls: ['https://robinhoodthailand.com/promotion'] },
  { name: 'Foodpanda Thailand', websiteUrl: 'https://www.foodpanda.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.foodpanda.co.th/vouchers', 'https://www.foodpanda.co.th/deals'] },
  { name: 'McDonald Thailand', websiteUrl: 'https://www.mcdonalds.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.co.th/promotion'] },
  { name: 'KFC Thailand', websiteUrl: 'https://www.kfcthailand.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfcthailand.com/promotion'] },
  { name: 'Pizza Hut Thailand', websiteUrl: 'https://www.pizzahut.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.co.th/promotion'] },
  { name: 'Burger King Thailand', websiteUrl: 'https://www.burgerking.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.co.th/promotion'] },
  { name: 'The Pizza Company', websiteUrl: 'https://www.1112.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.1112.com/promotion', 'https://www.1112.com/deal'] },
  { name: 'Starbucks Thailand', websiteUrl: 'https://www.starbucks.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.co.th/promotion'] },
  { name: 'Cafe Amazon', websiteUrl: 'https://www.cafe-amazon.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.cafe-amazon.com/promotion'] },
  { name: 'Inthanin Coffee', websiteUrl: 'https://www.inthanincoffee.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.inthanincoffee.com/promotion'] },
  { name: 'MK Restaurant', websiteUrl: 'https://www.mkrestaurant.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.mkrestaurant.com/th/promotion'] },
  { name: 'Suki Shi', websiteUrl: 'https://www.sukishi.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.sukishi.co.th/promotion'] },
  { name: 'Bar B Q Plaza', websiteUrl: 'https://www.barbbqplaza.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.barbbqplaza.com/promotion'] },
  { name: 'Sizzler Thailand', websiteUrl: 'https://www.sizzler.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.sizzler.co.th/promotion'] },
  { name: 'Bonchon Thailand', websiteUrl: 'https://www.bonchon.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.bonchon.co.th/promotion'] },
  { name: 'Swensen Thailand', websiteUrl: 'https://www.swensens1112.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.swensens1112.com/promotion'] },
  { name: 'Chester Grill', websiteUrl: 'https://www.chesterfood.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.chesterfood.com/promotion'] },
  { name: 'After You', websiteUrl: 'https://www.afteryoudessertcafe.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.afteryoudessertcafe.com/promotion'] },
  { name: 'Dominos Pizza Thailand', websiteUrl: 'https://www.dominos.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.co.th/promotion'] },
  { name: 'Shabu Shi', websiteUrl: 'https://www.shabushi.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.shabushi.co.th/promotion'] },
  { name: 'Dairy Queen Thailand', websiteUrl: 'https://www.dairyqueenthailand.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.dairyqueenthailand.com/promotion'] },
  { name: 'Baskin Robbins Thailand', websiteUrl: 'https://www.baskinrobbinsthailand.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbinsthailand.com/promotion'] },
  { name: 'ChaTraMue', websiteUrl: 'https://www.chatramue.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.chatramue.com/promotion'] },
  { name: 'Kor Panich', websiteUrl: 'https://www.korpanich.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.korpanich.com/promotion'] },
  { name: 'Texas Chicken Thailand', websiteUrl: 'https://www.texaschickenthailand.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.texaschickenthailand.com/promotion'] },
  { name: 'Subway Thailand', websiteUrl: 'https://www.subway.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.co.th/promotion'] },
  { name: 'Yoshinoya Thailand', websiteUrl: 'https://www.yoshinoya.co.th', categorySlug: 'yeme-icme', seedUrls: ['https://www.yoshinoya.co.th/promotion'] },
  { name: 'S&P Restaurant', websiteUrl: 'https://www.snpfood.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.snpfood.com/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 6) Health & Beauty (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Boots Thailand', websiteUrl: 'https://www.boots.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.boots.co.th/promotion', 'https://www.boots.co.th/offers'] },
  { name: 'Watsons Thailand', websiteUrl: 'https://www.watsons.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.watsons.co.th/promotion', 'https://www.watsons.co.th/offers'] },
  { name: 'Konvy Beauty', websiteUrl: 'https://www.konvy.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.konvy.com/promotion/', 'https://www.konvy.com/sale/'] },
  { name: 'Beautrium', websiteUrl: 'https://www.beautrium.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.beautrium.com/promotion', 'https://www.beautrium.com/sale'] },
  { name: 'Eveandboy', websiteUrl: 'https://www.eveandboy.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eveandboy.com/promotion', 'https://www.eveandboy.com/sale'] },
  { name: 'Sephora Thailand', websiteUrl: 'https://www.sephora.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.co.th/sale', 'https://www.sephora.co.th/promotion'] },
  { name: 'The Body Shop Thailand', websiteUrl: 'https://www.thebodyshop.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.co.th/promotion', 'https://www.thebodyshop.co.th/sale'] },
  { name: 'Loccitane Thailand', websiteUrl: 'https://th.loccitane.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://th.loccitane.com/promotion', 'https://th.loccitane.com/sale'] },
  { name: 'Oriental Princess', websiteUrl: 'https://www.orientalprincess.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.orientalprincess.com/promotion', 'https://www.orientalprincess.com/sale'] },
  { name: 'THANN', websiteUrl: 'https://www.thann.info', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thann.info/promotion'] },
  { name: 'Panpuri', websiteUrl: 'https://www.panpuri.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.panpuri.com/promotion'] },
  { name: 'Erb', websiteUrl: 'https://www.erbasia.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.erbasia.com/promotion'] },
  { name: 'Mistine', websiteUrl: 'https://www.mistine.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mistine.co.th/promotion'] },
  { name: 'Beauty Buffet', websiteUrl: 'https://www.beautybuffet.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.beautybuffet.co.th/promotion'] },
  { name: 'Cute Press', websiteUrl: 'https://www.cutepress.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cutepress.com/promotion'] },
  { name: 'Kiehl Thailand', websiteUrl: 'https://www.kiehls.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.co.th/promotion'] },
  { name: 'Innisfree Thailand', websiteUrl: 'https://www.innisfree.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.innisfree.co.th/promotion'] },
  { name: 'Laneige Thailand', websiteUrl: 'https://www.laneige.com/th/', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laneige.com/th/promotion'] },
  { name: 'Sulwhasoo Thailand', websiteUrl: 'https://www.sulwhasoo.com/th/', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sulwhasoo.com/th/promotion'] },
  { name: 'Clinique Thailand', websiteUrl: 'https://www.clinique.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.co.th/promotion'] },
  { name: 'MAC Thailand', websiteUrl: 'https://www.maccosmetics.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.co.th/promotion'] },
  { name: 'Bumrungrad Hospital', websiteUrl: 'https://www.bumrungrad.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bumrungrad.com/en/promotions'] },
  { name: 'Bangkok Hospital', websiteUrl: 'https://www.bangkokhospital.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bangkokhospital.com/en/promotion'] },
  { name: 'Samitivej Hospital', websiteUrl: 'https://www.samitivejhospitals.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.samitivejhospitals.com/promotion'] },
  { name: 'Rajhans Thailand', websiteUrl: 'https://www.rajhansthailand.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rajhansthailand.com/promotion'] },
  { name: 'Yanhee Hospital', websiteUrl: 'https://www.yanhee.net', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yanhee.net/promotion'] },
  { name: 'GNC Thailand', websiteUrl: 'https://www.gnc.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.gnc.co.th/promotion'] },
  { name: 'iHerb Thailand', websiteUrl: 'https://th.iherb.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://th.iherb.com/specials'] },
  { name: 'Amway Thailand', websiteUrl: 'https://www.amway.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.amway.co.th/promotion'] },
  { name: 'Nature Republic Thailand', websiteUrl: 'https://www.naturerepublic.co.th', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.naturerepublic.co.th/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 7) Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'HomePro', websiteUrl: 'https://www.homepro.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.homepro.co.th/promotion', 'https://www.homepro.co.th/sale'] },
  { name: 'Thai Watsadu', websiteUrl: 'https://www.thaiwatsadu.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.thaiwatsadu.com/promotion', 'https://www.thaiwatsadu.com/sale'] },
  { name: 'IKEA Thailand', websiteUrl: 'https://www.ikea.com/th/th/', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/th/th/offers/', 'https://www.ikea.com/th/th/ikea-family/offers/'] },
  { name: 'Index Living Mall', websiteUrl: 'https://www.indexlivingmall.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.indexlivingmall.com/promotion', 'https://www.indexlivingmall.com/sale'] },
  { name: 'SB Design Square', websiteUrl: 'https://www.sbdesignsquare.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.sbdesignsquare.com/promotion', 'https://www.sbdesignsquare.com/sale'] },
  { name: 'Baan & Beyond', websiteUrl: 'https://www.baanandbeyond.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.baanandbeyond.com/promotion'] },
  { name: 'Do Home', websiteUrl: 'https://www.dohome.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.dohome.co.th/promotion', 'https://www.dohome.co.th/sale'] },
  { name: 'Global House', websiteUrl: 'https://www.globalhouse.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.globalhouse.co.th/promotion'] },
  { name: 'Mr. DIY Thailand', websiteUrl: 'https://www.mrdiy.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.mrdiy.co.th/promotion'] },
  { name: 'SCG Building Materials', websiteUrl: 'https://www.scgbuildingmaterials.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.scgbuildingmaterials.com/th/promotion'] },
  { name: 'TOA Paint', websiteUrl: 'https://www.toagroup.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.toagroup.com/promotion'] },
  { name: 'Hafele Thailand', websiteUrl: 'https://www.hafele.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.hafele.co.th/en/promotion'] },
  { name: 'COTTO', websiteUrl: 'https://www.cotto.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.cotto.com/promotion'] },
  { name: 'American Standard Thailand', websiteUrl: 'https://www.americanstandard.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.americanstandard.co.th/promotion'] },
  { name: 'Kohler Thailand', websiteUrl: 'https://www.kohler.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.kohler.co.th/promotion'] },
  { name: 'Samsung Home Thailand', websiteUrl: 'https://www.samsung.com/th/', categorySlug: 'ev-yasam', seedUrls: ['https://www.samsung.com/th/offer/home-appliances/'] },
  { name: 'LG Home Thailand', websiteUrl: 'https://www.lg.com/th/', categorySlug: 'ev-yasam', seedUrls: ['https://www.lg.com/th/promo/'] },
  { name: 'Electrolux Thailand', websiteUrl: 'https://www.electrolux.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.electrolux.co.th/promotion/'] },
  { name: 'Daikin Thailand', websiteUrl: 'https://www.daikin.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.daikin.co.th/promotion'] },
  { name: 'Mitsubishi Electric Thailand', websiteUrl: 'https://www.mitsubishi-electric.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.mitsubishi-electric.co.th/promotion'] },
  { name: 'Panasonic Home Thailand', websiteUrl: 'https://www.panasonic.com/th/', categorySlug: 'ev-yasam', seedUrls: ['https://www.panasonic.com/th/promotion.html'] },
  { name: 'Dyson Thailand', websiteUrl: 'https://www.dyson.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.dyson.co.th/promotions', 'https://www.dyson.co.th/sale'] },
  { name: 'Mister Robot', websiteUrl: 'https://www.misterrobot.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.misterrobot.com/promotion'] },
  { name: 'Lock & Lock Thailand', websiteUrl: 'https://www.locknlock.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.locknlock.co.th/promotion'] },
  { name: 'Modernform', websiteUrl: 'https://www.modernform.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.modernform.co.th/promotion'] },
  { name: 'SB Furniture', websiteUrl: 'https://www.sbfurniture.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.sbfurniture.com/promotion'] },
  { name: 'NocNoc Home', websiteUrl: 'https://www.nocnoc.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.nocnoc.com/promotion/home', 'https://www.nocnoc.com/sale/home'] },
  { name: 'TOTO Thailand', websiteUrl: 'https://www.toto-asia.com/th/', categorySlug: 'ev-yasam', seedUrls: ['https://www.toto-asia.com/th/promotion'] },
  { name: 'Boonthavorn', websiteUrl: 'https://www.boonthavorn.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.boonthavorn.com/promotion'] },
  { name: 'Sharp Home Thailand', websiteUrl: 'https://www.sharpthai.co.th', categorySlug: 'ev-yasam', seedUrls: ['https://www.sharpthai.co.th/promotion/home-appliances'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Supersports', websiteUrl: 'https://www.supersports.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.supersports.co.th/promotion', 'https://www.supersports.co.th/sale'] },
  { name: 'Decathlon Thailand', websiteUrl: 'https://www.decathlon.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.co.th/th/promotion', 'https://www.decathlon.co.th/th/sale'] },
  { name: 'Nike Thailand Sports', websiteUrl: 'https://www.nike.com/th/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/th/w/sale-3yaep'] },
  { name: 'Adidas Thailand Sports', websiteUrl: 'https://www.adidas.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.co.th/sale'] },
  { name: 'Under Armour Thailand', websiteUrl: 'https://www.underarmour.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.co.th/sale'] },
  { name: 'Puma Thailand Sports', websiteUrl: 'https://th.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://th.puma.com/th/th/sale'] },
  { name: 'ASICS Thailand', websiteUrl: 'https://www.asics.com/th/th-th/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/th/th-th/sale/'] },
  { name: 'Fila Thailand', websiteUrl: 'https://www.fila.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.co.th/sale'] },
  { name: 'Reebok Thailand', websiteUrl: 'https://www.reebok.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.co.th/sale'] },
  { name: 'New Balance Thailand Sports', websiteUrl: 'https://www.newbalance.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.co.th/sale'] },
  { name: 'Garmin Thailand', websiteUrl: 'https://www.garmin.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.garmin.co.th/promotion/'] },
  { name: 'GoPro Thailand', websiteUrl: 'https://gopro.com/th/th/', categorySlug: 'spor-outdoor', seedUrls: ['https://gopro.com/th/th/deals'] },
  { name: 'Sport Planet', websiteUrl: 'https://www.sportplanet.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportplanet.co.th/promotion'] },
  { name: 'ProDirect Thailand', websiteUrl: 'https://www.prodirectsport.com/th/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.prodirectsport.com/th/sale'] },
  { name: 'Marathon Sports', websiteUrl: 'https://www.marathonsports.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.marathonsports.co.th/promotion'] },
  { name: 'Fitbit Thailand', websiteUrl: 'https://www.fitbit.com/th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitbit.com/th/sale'] },
  { name: 'Mizuno Thailand', websiteUrl: 'https://www.mizuno.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mizuno.co.th/promotion'] },
  { name: 'Yonex Thailand', websiteUrl: 'https://www.yonex.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.yonex.co.th/promotion'] },
  { name: 'Wilson Thailand', websiteUrl: 'https://www.wilson.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wilson.co.th/promotion'] },
  { name: 'Anytime Fitness Thailand', websiteUrl: 'https://www.anytimefitness.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.anytimefitness.co.th/promotion'] },
  { name: 'Fitness First Thailand', websiteUrl: 'https://www.fitnessfirst.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitnessfirst.co.th/promotion'] },
  { name: 'Virgin Active Thailand', websiteUrl: 'https://www.virginactive.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.virginactive.co.th/promotion'] },
  { name: 'Jetts Fitness Thailand', websiteUrl: 'https://www.jetts.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jetts.co.th/promotion'] },
  { name: 'Mountain Creek Thailand', websiteUrl: 'https://www.mountaincreek.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mountaincreek.co.th/promotion'] },
  { name: 'Giant Cycling Thailand', websiteUrl: 'https://www.giantbicycle.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.giantbicycle.co.th/promotion'] },
  { name: 'Trek Thailand', websiteUrl: 'https://www.trekbikes.com/th/th_TH/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.trekbikes.com/th/th_TH/sale'] },
  { name: 'Callaway Golf Thailand', websiteUrl: 'https://www.callawaygolf.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.callawaygolf.co.th/promotion'] },
  { name: 'TaylorMade Thailand', websiteUrl: 'https://www.taylormadegolf.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.taylormadegolf.co.th/promotion'] },
  { name: 'Speedo Thailand', websiteUrl: 'https://www.speedo.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.speedo.co.th/promotion'] },
  { name: 'Columbia Thailand', websiteUrl: 'https://www.columbia.co.th', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.co.th/promotion', 'https://www.columbia.co.th/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'AirAsia Thailand', websiteUrl: 'https://www.airasia.com/th/th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airasia.com/th/th/promotions.page', 'https://www.airasia.com/th/th/offers'] },
  { name: 'Nok Air', websiteUrl: 'https://www.nokair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nokair.com/promotion', 'https://www.nokair.com/deals'] },
  { name: 'Thai Airways', websiteUrl: 'https://www.thaiairways.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thaiairways.com/en/promotion.page'] },
  { name: 'Bangkok Airways', websiteUrl: 'https://www.bangkokair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bangkokair.com/promotion', 'https://www.bangkokair.com/offers'] },
  { name: 'Thai Lion Air', websiteUrl: 'https://www.lionairthai.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lionairthai.com/en/promotion'] },
  { name: 'Thai VietJet Air', websiteUrl: 'https://www.vietjetair.com/th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vietjetair.com/th/promotion'] },
  { name: 'Thai Smile Airways', websiteUrl: 'https://www.thaismileair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thaismileair.com/en/promotion'] },
  { name: 'Agoda Thailand', websiteUrl: 'https://www.agoda.com/th-th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/th-th/deals'] },
  { name: 'Booking.com Thailand', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.html'] },
  { name: 'Traveloka Thailand', websiteUrl: 'https://www.traveloka.com/th-th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.traveloka.com/th-th/promotion', 'https://www.traveloka.com/th-th/promo'] },
  { name: 'Trip.com Thailand', websiteUrl: 'https://th.trip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://th.trip.com/sale/deals'] },
  { name: 'Expedia Thailand', websiteUrl: 'https://www.expedia.co.th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.co.th/deals'] },
  { name: 'Klook Thailand', websiteUrl: 'https://www.klook.com/th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klook.com/th/promo/', 'https://www.klook.com/th/promos/deals/'] },
  { name: 'KKday Thailand', websiteUrl: 'https://www.kkday.com/th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kkday.com/th/promo'] },
  { name: 'Airbnb Thailand', websiteUrl: 'https://www.airbnb.co.th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.co.th/deals'] },
  { name: 'Centara Hotels', websiteUrl: 'https://www.centarahotelsresorts.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.centarahotelsresorts.com/offers'] },
  { name: 'Dusit Hotels', websiteUrl: 'https://www.dusit.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.dusit.com/special-offers/'] },
  { name: 'Anantara Hotels', websiteUrl: 'https://www.anantara.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.anantara.com/en/offers'] },
  { name: 'Minor Hotels', websiteUrl: 'https://www.minorhotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.minorhotels.com/en/offers'] },
  { name: 'Marriott Thailand', websiteUrl: 'https://www.marriott.com/th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com/offers/th'] },
  { name: 'Grab Thailand', websiteUrl: 'https://www.grab.com/th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.grab.com/th/promo/'] },
  { name: 'Bolt Thailand', websiteUrl: 'https://bolt.eu/th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://bolt.eu/th/promo/'] },
  { name: 'InDrive Thailand', websiteUrl: 'https://indrive.com/th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://indrive.com/th/promo'] },
  { name: 'BTS Skytrain', websiteUrl: 'https://www.bts.co.th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bts.co.th/promotion.html'] },
  { name: 'MRT Bangkok', websiteUrl: 'https://www.mrta.co.th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.mrta.co.th/en/promotion'] },
  { name: 'OYO Thailand', websiteUrl: 'https://www.oyorooms.com/th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.oyorooms.com/th/offers'] },
  { name: 'RedDoorz Thailand', websiteUrl: 'https://www.reddoorz.com/th-th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.reddoorz.com/th-th/deals'] },
  { name: 'Hilton Thailand', websiteUrl: 'https://www.hilton.com/th/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hilton.com/en/offers/'] },
  { name: 'AccorHotels Thailand', websiteUrl: 'https://all.accor.com/thailand/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://all.accor.com/offers/thailand/'] },
  { name: 'Thai Railway', websiteUrl: 'https://www.railway.co.th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.railway.co.th/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SCB (Siam Commercial Bank)', websiteUrl: 'https://www.scb.co.th', categorySlug: 'finans', seedUrls: ['https://www.scb.co.th/en/personal-banking/promotions.html'] },
  { name: 'Kasikorn Bank (KBank)', websiteUrl: 'https://www.kasikornbank.com', categorySlug: 'finans', seedUrls: ['https://www.kasikornbank.com/en/personal/promotion'] },
  { name: 'Bangkok Bank', websiteUrl: 'https://www.bangkokbank.com', categorySlug: 'finans', seedUrls: ['https://www.bangkokbank.com/en/Personal/Promotions'] },
  { name: 'Krungthai Bank', websiteUrl: 'https://krungthai.com', categorySlug: 'finans', seedUrls: ['https://krungthai.com/en/personal/promotion'] },
  { name: 'Bank of Ayudhya (Krungsri)', websiteUrl: 'https://www.krungsri.com', categorySlug: 'finans', seedUrls: ['https://www.krungsri.com/en/personal/promotions'] },
  { name: 'TMBThanachart Bank (ttb)', websiteUrl: 'https://www.ttbbank.com', categorySlug: 'finans', seedUrls: ['https://www.ttbbank.com/en/promotion'] },
  { name: 'UOB Thailand', websiteUrl: 'https://www.uob.co.th', categorySlug: 'finans', seedUrls: ['https://www.uob.co.th/personal/promotion.page'] },
  { name: 'CIMB Thai', websiteUrl: 'https://www.cimbthai.com', categorySlug: 'finans', seedUrls: ['https://www.cimbthai.com/en/personal/promotion.html'] },
  { name: 'KTC (Krungthai Card)', websiteUrl: 'https://www.ktc.co.th', categorySlug: 'finans', seedUrls: ['https://www.ktc.co.th/en/promotion'] },
  { name: 'Citibank Thailand', websiteUrl: 'https://www.citibank.co.th', categorySlug: 'finans', seedUrls: ['https://www.citibank.co.th/en/promotion.html'] },
  { name: 'TrueMoney Wallet', websiteUrl: 'https://www.truemoney.com', categorySlug: 'finans', seedUrls: ['https://www.truemoney.com/promotion/', 'https://www.truemoney.com/deals/'] },
  { name: 'PromptPay', websiteUrl: 'https://www.bot.or.th/promptpay', categorySlug: 'finans', seedUrls: ['https://www.bot.or.th/en/our-roles/payment-systems/promotion'] },
  { name: 'LINE Pay Thailand', websiteUrl: 'https://pay.line.me/th/', categorySlug: 'finans', seedUrls: ['https://pay.line.me/th/promotion'] },
  { name: 'ShopeePay Thailand', websiteUrl: 'https://shopee.co.th/m/shopeepay', categorySlug: 'finans', seedUrls: ['https://shopee.co.th/m/shopeepay-deals'] },
  { name: 'Rabbit LINE Pay', websiteUrl: 'https://pay.line.me/th/', categorySlug: 'finans', seedUrls: ['https://pay.line.me/th/promotion/rabbit'] },
  { name: 'Ascend Money', websiteUrl: 'https://www.ascendmoney.com', categorySlug: 'finans', seedUrls: ['https://www.ascendmoney.com/promotion'] },
  { name: 'Aeon Thailand', websiteUrl: 'https://www.aeon.co.th', categorySlug: 'finans', seedUrls: ['https://www.aeon.co.th/promotion'] },
  { name: 'Tisco Bank', websiteUrl: 'https://www.tisco.co.th', categorySlug: 'finans', seedUrls: ['https://www.tisco.co.th/en/personal/promotion.html'] },
  { name: 'LH Bank', websiteUrl: 'https://www.lhbank.co.th', categorySlug: 'finans', seedUrls: ['https://www.lhbank.co.th/en/promotion'] },
  { name: 'Kiatnakin Phatra Bank', websiteUrl: 'https://www.kkpfg.com', categorySlug: 'finans', seedUrls: ['https://www.kkpfg.com/en/promotion'] },
  { name: 'Government Savings Bank', websiteUrl: 'https://www.gsb.or.th', categorySlug: 'finans', seedUrls: ['https://www.gsb.or.th/en/promotion/'] },
  { name: 'SCB Easy', websiteUrl: 'https://www.scbeasy.com', categorySlug: 'finans', seedUrls: ['https://www.scbeasy.com/promotion'] },
  { name: 'K PLUS (KBank App)', websiteUrl: 'https://www.kasikornbank.com/kplus', categorySlug: 'finans', seedUrls: ['https://www.kasikornbank.com/en/personal/promotion/kplus'] },
  { name: 'KrungThai NEXT', websiteUrl: 'https://krungthai.com/next', categorySlug: 'finans', seedUrls: ['https://krungthai.com/en/personal/promotion/next'] },
  { name: 'PayPay Thailand', websiteUrl: 'https://www.paypay.co.th', categorySlug: 'finans', seedUrls: ['https://www.paypay.co.th/promotion'] },
  { name: 'Atome Thailand', websiteUrl: 'https://www.atome.co.th', categorySlug: 'finans', seedUrls: ['https://www.atome.co.th/promotion'] },
  { name: 'Home Credit Thailand', websiteUrl: 'https://www.homecredit.co.th', categorySlug: 'finans', seedUrls: ['https://www.homecredit.co.th/promotion'] },
  { name: 'Central Card', websiteUrl: 'https://www.centralcard.co.th', categorySlug: 'finans', seedUrls: ['https://www.centralcard.co.th/promotion'] },
  { name: 'Muang Thai Life', websiteUrl: 'https://www.muangthai.co.th', categorySlug: 'finans', seedUrls: ['https://www.muangthai.co.th/en/promotion'] },
  { name: 'AIA Thailand', websiteUrl: 'https://www.aia.co.th', categorySlug: 'finans', seedUrls: ['https://www.aia.co.th/en/promotion.html'] },

  // ═══════════════════════════════════════════════════════
  // 11) Education (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SkillLane', websiteUrl: 'https://www.skilllane.com', categorySlug: 'sigorta', seedUrls: ['https://www.skilllane.com/promotion', 'https://www.skilllane.com/sale'] },
  { name: 'Skooldio', websiteUrl: 'https://www.skooldio.com', categorySlug: 'sigorta', seedUrls: ['https://www.skooldio.com/promotion', 'https://www.skooldio.com/sale'] },
  { name: 'Chula MOOC', websiteUrl: 'https://mooc.chula.ac.th', categorySlug: 'sigorta', seedUrls: ['https://mooc.chula.ac.th/promotion'] },
  { name: 'Thai MOOC', websiteUrl: 'https://thaimooc.org', categorySlug: 'sigorta', seedUrls: ['https://thaimooc.org/promotion'] },
  { name: 'Coursera Thailand', websiteUrl: 'https://www.coursera.org', categorySlug: 'sigorta', seedUrls: ['https://www.coursera.org/promo'] },
  { name: 'Udemy Thailand', websiteUrl: 'https://www.udemy.com', categorySlug: 'sigorta', seedUrls: ['https://www.udemy.com/promotion/', 'https://www.udemy.com/sale/'] },
  { name: 'Wall Street English Thailand', websiteUrl: 'https://www.wallstreetenglish.co.th', categorySlug: 'sigorta', seedUrls: ['https://www.wallstreetenglish.co.th/promotion'] },
  { name: 'EF Thailand', websiteUrl: 'https://www.ef.co.th', categorySlug: 'sigorta', seedUrls: ['https://www.ef.co.th/promotion/'] },
  { name: 'British Council Thailand', websiteUrl: 'https://www.britishcouncil.or.th', categorySlug: 'sigorta', seedUrls: ['https://www.britishcouncil.or.th/promotion'] },
  { name: 'Goethe Institut Thailand', websiteUrl: 'https://www.goethe.de/ins/th/', categorySlug: 'sigorta', seedUrls: ['https://www.goethe.de/ins/th/en/promotion.html'] },
  { name: 'AUA Language Center', websiteUrl: 'https://www.auathai.com', categorySlug: 'sigorta', seedUrls: ['https://www.auathai.com/promotion'] },
  { name: 'Enconcept', websiteUrl: 'https://www.enconcept.com', categorySlug: 'sigorta', seedUrls: ['https://www.enconcept.com/promotion'] },
  { name: 'Dek-D', websiteUrl: 'https://www.dek-d.com', categorySlug: 'sigorta', seedUrls: ['https://www.dek-d.com/promotion'] },
  { name: 'OnDemand', websiteUrl: 'https://www.ondemand.in.th', categorySlug: 'sigorta', seedUrls: ['https://www.ondemand.in.th/promotion'] },
  { name: 'TruePlookpanya', websiteUrl: 'https://www.trueplookpanya.com', categorySlug: 'sigorta', seedUrls: ['https://www.trueplookpanya.com/promotion'] },
  { name: 'Edutech Thailand', websiteUrl: 'https://www.edutech.co.th', categorySlug: 'sigorta', seedUrls: ['https://www.edutech.co.th/promotion'] },
  { name: 'Kumon Thailand', websiteUrl: 'https://www.kumon.co.th', categorySlug: 'sigorta', seedUrls: ['https://www.kumon.co.th/promotion'] },
  { name: 'DataRockie', websiteUrl: 'https://datarockie.com', categorySlug: 'sigorta', seedUrls: ['https://datarockie.com/promotion'] },
  { name: 'BornToCode', websiteUrl: 'https://www.borntodev.com', categorySlug: 'sigorta', seedUrls: ['https://www.borntodev.com/promotion', 'https://www.borntodev.com/sale'] },
  { name: 'Codecamp Thailand', websiteUrl: 'https://www.codecamp.co.th', categorySlug: 'sigorta', seedUrls: ['https://www.codecamp.co.th/promotion'] },
  { name: 'KMITL Online', websiteUrl: 'https://www.learn.kmitl.ac.th', categorySlug: 'sigorta', seedUrls: ['https://www.learn.kmitl.ac.th/promotion'] },
  { name: 'SET e-Learning', websiteUrl: 'https://www.set.or.th/education', categorySlug: 'sigorta', seedUrls: ['https://www.set.or.th/education/promotion'] },
  { name: 'Globish', websiteUrl: 'https://www.globish.co.th', categorySlug: 'sigorta', seedUrls: ['https://www.globish.co.th/promotion'] },
  { name: 'Ignite by OnDemand', websiteUrl: 'https://www.ignitebyon.com', categorySlug: 'sigorta', seedUrls: ['https://www.ignitebyon.com/promotion'] },
  { name: 'Taamkru', websiteUrl: 'https://www.taamkru.com', categorySlug: 'sigorta', seedUrls: ['https://www.taamkru.com/promotion'] },
  { name: 'NockAcademy', websiteUrl: 'https://www.nockacademy.com', categorySlug: 'sigorta', seedUrls: ['https://www.nockacademy.com/promotion'] },
  { name: 'Vonder', websiteUrl: 'https://www.vonder.co.th', categorySlug: 'sigorta', seedUrls: ['https://www.vonder.co.th/promotion'] },
  { name: 'MindDoJo', websiteUrl: 'https://www.minddojo.com', categorySlug: 'sigorta', seedUrls: ['https://www.minddojo.com/promotion'] },
  { name: 'Thailand Coding Education', websiteUrl: 'https://www.codingeducation.or.th', categorySlug: 'sigorta', seedUrls: ['https://www.codingeducation.or.th/promotion'] },
  { name: 'Alpha Camp Thailand', websiteUrl: 'https://www.alphacamp.co/th', categorySlug: 'sigorta', seedUrls: ['https://www.alphacamp.co/th/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota Thailand', websiteUrl: 'https://www.toyota.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.co.th/en/promotion'] },
  { name: 'Honda Thailand', websiteUrl: 'https://www.honda.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.honda.co.th/promotion'] },
  { name: 'Isuzu Thailand', websiteUrl: 'https://www.isuzu-tis.com', categorySlug: 'otomobil', seedUrls: ['https://www.isuzu-tis.com/promotion'] },
  { name: 'Mitsubishi Motors Thailand', websiteUrl: 'https://www.mitsubishi-motors.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.co.th/en/promotion'] },
  { name: 'Mazda Thailand', websiteUrl: 'https://www.mazda.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.co.th/offers/'] },
  { name: 'Nissan Thailand', websiteUrl: 'https://www.nissan.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.co.th/offers.html'] },
  { name: 'Ford Thailand', websiteUrl: 'https://www.ford.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.ford.co.th/offers/'] },
  { name: 'Suzuki Thailand', websiteUrl: 'https://www.suzuki.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.co.th/promotion'] },
  { name: 'MG Thailand', websiteUrl: 'https://www.mgcars.com/th/', categorySlug: 'otomobil', seedUrls: ['https://www.mgcars.com/th/promotion'] },
  { name: 'Hyundai Thailand', websiteUrl: 'https://www.hyundai.com/th/th', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/th/th/campaign-offers.html'] },
  { name: 'BMW Thailand', websiteUrl: 'https://www.bmw.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.co.th/th/topics/offers-and-services/offers.html'] },
  { name: 'Mercedes-Benz Thailand', websiteUrl: 'https://www.mercedes-benz.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.co.th/passengercars/the-brand/offers.html'] },
  { name: 'Kia Thailand', websiteUrl: 'https://www.kia.com/th', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/th/campaign/'] },
  { name: 'Subaru Thailand', websiteUrl: 'https://www.subaru.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.co.th/promotion'] },
  { name: 'Volkswagen Thailand', websiteUrl: 'https://www.volkswagen.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.co.th/en/offers.html'] },
  { name: 'Volvo Thailand', websiteUrl: 'https://www.volvocars.com/th/', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/th/offers/'] },
  { name: 'Lexus Thailand', websiteUrl: 'https://www.lexus.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.lexus.co.th/promotion'] },
  { name: 'Porsche Thailand', websiteUrl: 'https://www.porsche.com/thailand/', categorySlug: 'otomobil', seedUrls: ['https://www.porsche.com/thailand/offers/'] },
  { name: 'GWM Thailand', websiteUrl: 'https://www.gwm.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.gwm.co.th/promotion'] },
  { name: 'BYD Thailand', websiteUrl: 'https://www.byd.com/th', categorySlug: 'otomobil', seedUrls: ['https://www.byd.com/th/promotion'] },
  { name: 'Neta Thailand', websiteUrl: 'https://www.netaauto.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.netaauto.co.th/promotion'] },
  { name: 'ORA Thailand', websiteUrl: 'https://www.gwm-ora.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.gwm-ora.co.th/promotion'] },
  { name: 'One2Car', websiteUrl: 'https://www.one2car.com', categorySlug: 'otomobil', seedUrls: ['https://www.one2car.com/promotion'] },
  { name: 'Kaidee Auto', websiteUrl: 'https://www.kaidee.com/cars', categorySlug: 'otomobil', seedUrls: ['https://www.kaidee.com/cars/promotion'] },
  { name: 'Carro Thailand', websiteUrl: 'https://www.carro.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.carro.co.th/promotion'] },
  { name: 'Changan Thailand', websiteUrl: 'https://www.changan.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.changan.co.th/promotion'] },
  { name: 'Honda Motorcycle Thailand', websiteUrl: 'https://www.aphonda.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.aphonda.co.th/promotion'] },
  { name: 'Yamaha Thailand', websiteUrl: 'https://www.yamaha-motor.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.yamaha-motor.co.th/promotion'] },
  { name: 'Kawasaki Thailand', websiteUrl: 'https://www.kawasaki.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.kawasaki.co.th/promotion'] },
  { name: 'Bridgestone Thailand', websiteUrl: 'https://www.bridgestone.co.th', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestone.co.th/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SE-ED', websiteUrl: 'https://www.se-ed.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.se-ed.com/promotion', 'https://www.se-ed.com/sale'] },
  { name: 'B2S', websiteUrl: 'https://www.b2s.co.th', categorySlug: 'kitap-hobi', seedUrls: ['https://www.b2s.co.th/promotion', 'https://www.b2s.co.th/sale'] },
  { name: 'Naiin', websiteUrl: 'https://www.naiin.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.naiin.com/promotion', 'https://www.naiin.com/sale'] },
  { name: 'Kinokuniya Thailand', websiteUrl: 'https://www.kinokuniya.co.th', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kinokuniya.co.th/promotion'] },
  { name: 'Asia Books', websiteUrl: 'https://www.asiabooks.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.asiabooks.com/promotion', 'https://www.asiabooks.com/sale'] },
  { name: 'Amarin Book Center', websiteUrl: 'https://www.amarinbooks.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amarinbooks.com/promotion'] },
  { name: 'Readery', websiteUrl: 'https://www.readery.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.readery.co/promotion', 'https://www.readery.co/sale'] },
  { name: 'Ookbee', websiteUrl: 'https://www.ookbee.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ookbee.com/promotion'] },
  { name: 'MEB (Thai eBook)', websiteUrl: 'https://www.mebmarket.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mebmarket.com/promotion'] },
  { name: 'Spotify Thailand', websiteUrl: 'https://www.spotify.com/th-th/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/th-th/premium/'] },
  { name: 'Netflix Thailand', websiteUrl: 'https://www.netflix.com/th/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/th/'] },
  { name: 'Disney+ Hotstar Thailand', websiteUrl: 'https://www.hotstar.com/th', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hotstar.com/th/promo'] },
  { name: 'WeTV Thailand', websiteUrl: 'https://wetv.vip/th', categorySlug: 'kitap-hobi', seedUrls: ['https://wetv.vip/th/promo'] },
  { name: 'Viu Thailand', websiteUrl: 'https://www.viu.com/ott/th/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.viu.com/ott/th/promo'] },
  { name: 'JOOX Thailand', websiteUrl: 'https://www.joox.com/th', categorySlug: 'kitap-hobi', seedUrls: ['https://www.joox.com/th/promotion'] },
  { name: 'YouTube Premium Thailand', websiteUrl: 'https://www.youtube.com/premium', categorySlug: 'kitap-hobi', seedUrls: ['https://www.youtube.com/premium'] },
  { name: 'TrueID', websiteUrl: 'https://www.trueid.net', categorySlug: 'kitap-hobi', seedUrls: ['https://www.trueid.net/promotion'] },
  { name: 'AIS Play', websiteUrl: 'https://aisplay.ais.co.th', categorySlug: 'kitap-hobi', seedUrls: ['https://aisplay.ais.co.th/promotion'] },
  { name: 'Nintendo Thailand', websiteUrl: 'https://www.nintendo.co.th', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.co.th/deals'] },
  { name: 'PlayStation Thailand', websiteUrl: 'https://store.playstation.com/th-th/', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/th-th/category/deals'] },
  { name: 'Steam Thailand', websiteUrl: 'https://store.steampowered.com/?cc=th', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/'] },
  { name: 'Lazada Books Thailand', websiteUrl: 'https://www.lazada.co.th/tag/books/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lazada.co.th/tag/books-promotion/'] },
  { name: 'Shopee Books Thailand', websiteUrl: 'https://shopee.co.th/books', categorySlug: 'kitap-hobi', seedUrls: ['https://shopee.co.th/books/promotion'] },
  { name: 'Nanmeebooks', websiteUrl: 'https://www.nanmeebooks.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nanmeebooks.com/promotion'] },
  { name: 'Bunpakarn', websiteUrl: 'https://www.bunpakarn.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bunpakarn.com/promotion'] },
  { name: 'Thai Rath Book', websiteUrl: 'https://www.thairath.co.th/book', categorySlug: 'kitap-hobi', seedUrls: ['https://www.thairath.co.th/book/promotion'] },
  { name: 'Major Cineplex', websiteUrl: 'https://www.majorcineplex.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.majorcineplex.com/promotion'] },
  { name: 'SF Cinema', websiteUrl: 'https://www.sfcinemacity.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sfcinemacity.com/promotion'] },
  { name: 'House Samyan', websiteUrl: 'https://www.housesamyan.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.housesamyan.com/promotion'] },
  { name: 'Paperback Book Shop', websiteUrl: 'https://www.paperbackbookshop.co.th', categorySlug: 'kitap-hobi', seedUrls: ['https://www.paperbackbookshop.co.th/promotion'] },
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
  console.log('=== Thailand Brand Seeding Script ===\n');

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
        where: { slug_market: { slug, market: 'TH' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'TH',
          categoryId,
        },
      });

      // Check if crawl source already exists for this brand
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
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'TH',
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'TH' },
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
  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'TH' } });
  console.log(`Total active TH sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=TH');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
