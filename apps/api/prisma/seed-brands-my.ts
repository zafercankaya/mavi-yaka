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
  { name: 'Shopee', websiteUrl: 'https://shopee.com.my', categorySlug: 'alisveris', seedUrls: ['https://shopee.com.my/mall/deals', 'https://shopee.com.my/flash_sale'] },
  { name: 'Lazada', websiteUrl: 'https://www.lazada.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.lazada.com.my/wow/i/my/sale', 'https://www.lazada.com.my/deals/'] },
  { name: 'PG Mall', websiteUrl: 'https://www.pgmall.my', categorySlug: 'alisveris', seedUrls: ['https://www.pgmall.my/deals', 'https://www.pgmall.my/promotion'] },
  { name: 'Lelong', websiteUrl: 'https://www.lelong.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.lelong.com.my/deals/', 'https://www.lelong.com.my/sale/'] },
  { name: 'Mydin', websiteUrl: 'https://www.mydin.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.mydin.com.my/promotions', 'https://www.mydin.com.my/deals'] },
  { name: 'Mr DIY', websiteUrl: 'https://www.mrdiy.com', categorySlug: 'alisveris', seedUrls: ['https://www.mrdiy.com/promotions', 'https://www.mrdiy.com/deals'] },
  { name: 'KK Super Mart', websiteUrl: 'https://www.kksupermart.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.kksupermart.com.my/promotions'] },
  { name: 'Daiso', websiteUrl: 'https://www.daisomalaysia.com', categorySlug: 'alisveris', seedUrls: ['https://www.daisomalaysia.com/promotions'] },
  { name: 'Miniso', websiteUrl: 'https://www.miniso.com/my', categorySlug: 'alisveris', seedUrls: ['https://www.miniso.com/my/promotions'] },
  { name: 'PrestoMall', websiteUrl: 'https://www.prestomall.com', categorySlug: 'alisveris', seedUrls: ['https://www.prestomall.com/sale', 'https://www.prestomall.com/deals'] },
  { name: 'Vinda', websiteUrl: 'https://www.vindashop.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.vindashop.com.my/promotion'] },
  { name: 'Aeon', websiteUrl: 'https://www.aeon.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.aeon.com.my/promotions', 'https://www.aeon.com.my/deals'] },
  { name: 'Parkson', websiteUrl: 'https://www.parkson.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.parkson.com.my/promotions', 'https://www.parkson.com.my/sale'] },
  { name: 'Metrojaya', websiteUrl: 'https://www.metrojaya.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.metrojaya.com.my/sale', 'https://www.metrojaya.com.my/promotions'] },
  { name: 'Isetan', websiteUrl: 'https://www.isetanklcc.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.isetanklcc.com.my/promotions', 'https://www.isetanklcc.com.my/sale'] },
  { name: 'Sogo', websiteUrl: 'https://www.sogo.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.sogo.com.my/promotions', 'https://www.sogo.com.my/sale'] },
  { name: 'TF Value-Mart', websiteUrl: 'https://www.tfvaluemart.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.tfvaluemart.com.my/promotions'] },
  { name: 'Econsave', websiteUrl: 'https://www.econsave.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.econsave.com.my/promotions', 'https://www.econsave.com.my/deals'] },
  { name: 'NSK Trade City', websiteUrl: 'https://www.nsk.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.nsk.com.my/promotions'] },
  { name: 'Billion', websiteUrl: 'https://www.billion.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.billion.com.my/promotions'] },
  { name: 'Caring Pharmacy', websiteUrl: 'https://www.caring2u.com', categorySlug: 'alisveris', seedUrls: ['https://www.caring2u.com/promotions', 'https://www.caring2u.com/sale'] },
  { name: 'Lotus', websiteUrl: 'https://www.lotuss.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.lotuss.com.my/promotions', 'https://www.lotuss.com.my/deals'] },
  { name: 'HomePro', websiteUrl: 'https://www.homepro.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.homepro.com.my/promotion', 'https://www.homepro.com.my/sale'] },
  { name: 'MR.D.I.Y.', websiteUrl: 'https://mrdiy.com.my', categorySlug: 'alisveris', seedUrls: ['https://mrdiy.com.my/promotions'] },
  { name: 'Kaison', websiteUrl: 'https://www.kaison.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.kaison.com.my/promotions'] },
  { name: 'GrabMart', websiteUrl: 'https://www.grab.com/my/mart/', categorySlug: 'alisveris', seedUrls: ['https://www.grab.com/my/mart/deals/'] },
  { name: 'Senheng', websiteUrl: 'https://www.senheng.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.senheng.com.my/promotions', 'https://www.senheng.com.my/deals'] },
  { name: 'Courts', websiteUrl: 'https://www.courts.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.courts.com.my/sale', 'https://www.courts.com.my/promotions'] },
  { name: 'Harvey Norman', websiteUrl: 'https://www.harveynorman.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.harveynorman.com.my/sale', 'https://www.harveynorman.com.my/deals'] },
  { name: 'All IT Hypermarket', websiteUrl: 'https://www.allithypermarket.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.allithypermarket.com.my/promotions', 'https://www.allithypermarket.com.my/deals'] },
  { name: 'Emart', websiteUrl: 'https://www.emart.com.my', categorySlug: 'alisveris', seedUrls: ['https://www.emart.com.my/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung', websiteUrl: 'https://www.samsung.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/my/offer/', 'https://www.samsung.com/my/smartphones/all-smartphones/'] },
  { name: 'Apple', websiteUrl: 'https://www.apple.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/my/shop/go/special_deals'] },
  { name: 'Xiaomi', websiteUrl: 'https://www.mi.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/my/sale', 'https://www.mi.com/my/promotion'] },
  { name: 'OPPO', websiteUrl: 'https://www.oppo.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/my/offer/', 'https://www.oppo.com/my/promotion/'] },
  { name: 'Vivo', websiteUrl: 'https://www.vivo.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com/my/promotion', 'https://www.vivo.com/my/offer'] },
  { name: 'Huawei', websiteUrl: 'https://consumer.huawei.com/my', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/my/offer/', 'https://consumer.huawei.com/my/campaign/'] },
  { name: 'Realme', websiteUrl: 'https://www.realme.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/my/deals'] },
  { name: 'Sony', websiteUrl: 'https://www.sony.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.sony.com.my/en/promotions', 'https://www.sony.com.my/en/campaigns'] },
  { name: 'LG', websiteUrl: 'https://www.lg.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/my/promotions'] },
  { name: 'Panasonic', websiteUrl: 'https://www.panasonic.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/my/promotions.html', 'https://www.panasonic.com/my/campaign.html'] },
  { name: 'Dell', websiteUrl: 'https://www.dell.com/en-my', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-my/shop/deals'] },
  { name: 'HP', websiteUrl: 'https://www.hp.com/my-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/my-en/shop/offer', 'https://www.hp.com/my-en/shop/promotions'] },
  { name: 'Lenovo', websiteUrl: 'https://www.lenovo.com/my/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/my/en/d/deals/'] },
  { name: 'Asus', websiteUrl: 'https://www.asus.com/my', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/my/campaign/', 'https://www.asus.com/my/Promotions/'] },
  { name: 'Acer', websiteUrl: 'https://www.acer.com/my-en', categorySlug: 'elektronik', seedUrls: ['https://www.acer.com/my-en/promotions'] },
  { name: 'Microsoft', websiteUrl: 'https://www.microsoft.com/en-my', categorySlug: 'elektronik', seedUrls: ['https://www.microsoft.com/en-my/store/deals'] },
  { name: 'Maxis', websiteUrl: 'https://www.maxis.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.maxis.com.my/deals/', 'https://www.maxis.com.my/promotions/'] },
  { name: 'Celcom', websiteUrl: 'https://www.celcom.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.celcom.com.my/deals', 'https://www.celcom.com.my/promotions'] },
  { name: 'Digi', websiteUrl: 'https://www.digi.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.digi.com.my/deals', 'https://www.digi.com.my/promotions'] },
  { name: 'U Mobile', websiteUrl: 'https://www.u.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.u.com.my/en/promotions', 'https://www.u.com.my/en/deals'] },
  { name: 'Yes 4G', websiteUrl: 'https://www.yes.my', categorySlug: 'elektronik', seedUrls: ['https://www.yes.my/promotions', 'https://www.yes.my/deals'] },
  { name: 'Unifi', websiteUrl: 'https://unifi.com.my', categorySlug: 'elektronik', seedUrls: ['https://unifi.com.my/personal/deals', 'https://unifi.com.my/personal/promotions'] },
  { name: 'Dyson', websiteUrl: 'https://www.dyson.my', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.my/promotions', 'https://www.dyson.my/offers'] },
  { name: 'Canon', websiteUrl: 'https://www.canon.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.canon.com.my/promotions'] },
  { name: 'Bose', websiteUrl: 'https://www.bose.my', categorySlug: 'elektronik', seedUrls: ['https://www.bose.my/promotions.html'] },
  { name: 'JBL', websiteUrl: 'https://my.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://my.jbl.com/promotions.html'] },
  { name: 'Logitech', websiteUrl: 'https://www.logitech.com/en-my', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/en-my/promo.html'] },
  { name: 'Switch', websiteUrl: 'https://www.switch.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.switch.com.my/promotions', 'https://www.switch.com.my/deals'] },
  { name: 'Machines', websiteUrl: 'https://www.machines.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.machines.com.my/promotions', 'https://www.machines.com.my/deals'] },
  { name: 'Thunder Match', websiteUrl: 'https://www.thundermatch.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.thundermatch.com.my/promotions'] },
  { name: 'DirectD', websiteUrl: 'https://www.directd.com.my', categorySlug: 'elektronik', seedUrls: ['https://www.directd.com.my/promotion', 'https://www.directd.com.my/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Zalora', websiteUrl: 'https://www.zalora.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.zalora.com.my/sale/', 'https://www.zalora.com.my/deals/'] },
  { name: 'FashionValet', websiteUrl: 'https://www.fashionvalet.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.fashionvalet.com/sale', 'https://www.fashionvalet.com/deals'] },
  { name: 'Padini', websiteUrl: 'https://www.padini.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.padini.com/sale', 'https://www.padini.com/promotions'] },
  { name: 'Bonia', websiteUrl: 'https://www.bonia.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.bonia.com/sale', 'https://www.bonia.com/promotion'] },
  { name: 'Carlo Rino', websiteUrl: 'https://www.carlorino.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.carlorino.com.my/sale', 'https://www.carlorino.com.my/promotions'] },
  { name: 'Christy Ng', websiteUrl: 'https://www.christyng.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.christyng.com/sale', 'https://www.christyng.com/deals'] },
  { name: 'Uniqlo', websiteUrl: 'https://www.uniqlo.com/my', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/my/en/sale', 'https://www.uniqlo.com/my/en/limited-offers'] },
  { name: 'H&M', websiteUrl: 'https://www2.hm.com/en_my', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/en_my/sale.html'] },
  { name: 'Zara', websiteUrl: 'https://www.zara.com/my', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/my/en/z-sale-l1702.html'] },
  { name: 'Cotton On', websiteUrl: 'https://cottonon.com/MY', categorySlug: 'giyim-moda', seedUrls: ['https://cottonon.com/MY/sale/'] },
  { name: 'Mango', websiteUrl: 'https://www.mango.com/my', categorySlug: 'giyim-moda', seedUrls: ['https://www.mango.com/my/sale'] },
  { name: 'Nike', websiteUrl: 'https://www.nike.com/my', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/my/w/sale', 'https://www.nike.com/my/sale'] },
  { name: 'Adidas', websiteUrl: 'https://www.adidas.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.com.my/sale', 'https://www.adidas.com.my/outlet'] },
  { name: 'Puma', websiteUrl: 'https://my.puma.com', categorySlug: 'giyim-moda', seedUrls: ['https://my.puma.com/my/en/sale'] },
  { name: 'Skechers', websiteUrl: 'https://www.skechers.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.skechers.com.my/sale'] },
  { name: 'Charles & Keith', websiteUrl: 'https://www.charleskeith.com/my', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/my/sale'] },
  { name: 'Vincci', websiteUrl: 'https://www.vincci.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.vincci.com.my/sale', 'https://www.vincci.com.my/promotions'] },
  { name: 'Bata', websiteUrl: 'https://www.bata.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.bata.com.my/sale', 'https://www.bata.com.my/promotions'] },
  { name: 'Hush Puppies', websiteUrl: 'https://www.hushpuppies.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.hushpuppies.com.my/sale'] },
  { name: 'Voir', websiteUrl: 'https://www.voir.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.voir.com.my/sale', 'https://www.voir.com.my/promotions'] },
  { name: 'Sometime by Asian Designers', websiteUrl: 'https://www.sometime.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.sometime.com.my/sale'] },
  { name: 'Pestle & Mortar', websiteUrl: 'https://www.pestleandmortar.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.pestleandmortar.com/sale'] },
  { name: 'Jovian', websiteUrl: 'https://www.jovian.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.jovian.com.my/sale', 'https://www.jovian.com.my/promotions'] },
  { name: 'Naelofar', websiteUrl: 'https://www.naelofar.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.naelofar.com/sale', 'https://www.naelofar.com/promotions'] },
  { name: 'Duck', websiteUrl: 'https://www.duck.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.duck.com.my/sale'] },
  { name: 'Siti Khadijah', websiteUrl: 'https://www.sitikhadijah.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sitikhadijah.com/sale', 'https://www.sitikhadijah.com/promotions'] },
  { name: 'Levi\'s', websiteUrl: 'https://www.levi.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com.my/sale'] },
  { name: 'Guess', websiteUrl: 'https://www.guess.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.com.my/sale'] },
  { name: 'Clarks', websiteUrl: 'https://www.clarks.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.clarks.com.my/sale'] },
  { name: 'Birkenstock', websiteUrl: 'https://www.birkenstock.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.birkenstock.com.my/sale'] },
  { name: 'Fipper', websiteUrl: 'https://www.fipper.com.my', categorySlug: 'giyim-moda', seedUrls: ['https://www.fipper.com.my/sale', 'https://www.fipper.com.my/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Giant', websiteUrl: 'https://www.giant.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.giant.com.my/promotions', 'https://www.giant.com.my/deals'] },
  { name: '99 Speedmart', websiteUrl: 'https://www.99speedmart.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.99speedmart.com.my/promotions'] },
  { name: 'Jaya Grocer', websiteUrl: 'https://www.jayagrocer.com', categorySlug: 'gida-market', seedUrls: ['https://www.jayagrocer.com/promotions', 'https://www.jayagrocer.com/deals'] },
  { name: 'Village Grocer', websiteUrl: 'https://www.villagegrocer.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.villagegrocer.com.my/promotions'] },
  { name: 'Ben\'s Independent Grocer', websiteUrl: 'https://www.bensindependentgrocer.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.bensindependentgrocer.com.my/promotions'] },
  { name: 'Cold Storage', websiteUrl: 'https://coldstorage.com.my', categorySlug: 'gida-market', seedUrls: ['https://coldstorage.com.my/promotions'] },
  { name: 'Aeon Big', websiteUrl: 'https://www.aeonbig.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.aeonbig.com.my/promotions', 'https://www.aeonbig.com.my/deals'] },
  { name: 'Aeon MaxValu', websiteUrl: 'https://www.aeonmaxvalu.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.aeonmaxvalu.com.my/promotions'] },
  { name: 'Family Mart', websiteUrl: 'https://www.familymart.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.familymart.com.my/promotions', 'https://www.familymart.com.my/deals'] },
  { name: '7-Eleven', websiteUrl: 'https://www.7eleven.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.7eleven.com.my/promotions', 'https://www.7eleven.com.my/deals'] },
  { name: 'Petronas Mesra', websiteUrl: 'https://www.petronas.com/mesra', categorySlug: 'gida-market', seedUrls: ['https://www.petronas.com/mesra/promotions'] },
  { name: 'HappyFresh', websiteUrl: 'https://www.happyfresh.my', categorySlug: 'gida-market', seedUrls: ['https://www.happyfresh.my/deals', 'https://www.happyfresh.my/promotions'] },
  { name: 'Tesco', websiteUrl: 'https://www.tesco.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.tesco.com.my/promotions'] },
  { name: 'Sam\'s Groceria', websiteUrl: 'https://www.samsgroceria.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.samsgroceria.com.my/promotions'] },
  { name: 'Hero Market', websiteUrl: 'https://www.heromarket.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.heromarket.com.my/promotions'] },
  { name: 'Everrise', websiteUrl: 'https://www.everrise.com', categorySlug: 'gida-market', seedUrls: ['https://www.everrise.com/promotions'] },
  { name: 'Pasaraya OTK', websiteUrl: 'https://www.otkgroup.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.otkgroup.com.my/promotions'] },
  { name: 'Sunshine', websiteUrl: 'https://www.sunshine.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.sunshine.com.my/promotions'] },
  { name: 'Maslee', websiteUrl: 'https://www.maslee.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.maslee.com.my/promotions'] },
  { name: 'Pacific', websiteUrl: 'https://www.pacific.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.pacific.com.my/promotions'] },
  { name: 'Tunas Manja', websiteUrl: 'https://www.tunasmanja.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.tunasmanja.com.my/promotions'] },
  { name: 'Pantai Timur', websiteUrl: 'https://www.pantaitimur.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.pantaitimur.com.my/promotions'] },
  { name: 'Donki', websiteUrl: 'https://www.donki.com/my', categorySlug: 'gida-market', seedUrls: ['https://www.donki.com/my/promotions'] },
  { name: 'Mercato', websiteUrl: 'https://www.mercato.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.mercato.com.my/promotions'] },
  { name: 'Tealive', websiteUrl: 'https://www.tealive.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.tealive.com.my/promotions', 'https://www.tealive.com.my/deals'] },
  { name: 'Inside Scoop', websiteUrl: 'https://www.myinsidescoop.com', categorySlug: 'gida-market', seedUrls: ['https://www.myinsidescoop.com/promotions'] },
  { name: 'Spritzer', websiteUrl: 'https://www.spritzer.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.spritzer.com.my/promotions'] },
  { name: 'Nestle', websiteUrl: 'https://www.nestle.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.nestle.com.my/promotions'] },
  { name: 'Dutch Lady', websiteUrl: 'https://www.dutchlady.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.dutchlady.com.my/promotions'] },
  { name: 'Munchy\'s', websiteUrl: 'https://www.munchys.com', categorySlug: 'gida-market', seedUrls: ['https://www.munchys.com/promotions'] },
  { name: 'Gardenia', websiteUrl: 'https://www.gardenia.com.my', categorySlug: 'gida-market', seedUrls: ['https://www.gardenia.com.my/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme-İçme / Food & Beverage (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'GrabFood', websiteUrl: 'https://food.grab.com/my', categorySlug: 'yeme-icme', seedUrls: ['https://food.grab.com/my/en/deals', 'https://www.grab.com/my/food/deals/'] },
  { name: 'Foodpanda', websiteUrl: 'https://www.foodpanda.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.foodpanda.my/deals', 'https://www.foodpanda.my/vouchers'] },
  { name: 'ShopeeFood', websiteUrl: 'https://shopee.com.my/food', categorySlug: 'yeme-icme', seedUrls: ['https://shopee.com.my/food/deals'] },
  { name: 'McDonald\'s', websiteUrl: 'https://www.mcdonalds.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com.my/promotions', 'https://www.mcdonalds.com.my/deals'] },
  { name: 'KFC', websiteUrl: 'https://www.kfc.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.com.my/promotions', 'https://www.kfc.com.my/deals'] },
  { name: 'Pizza Hut', websiteUrl: 'https://www.pizzahut.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.my/deals', 'https://www.pizzahut.com.my/promotions'] },
  { name: 'Domino\'s', websiteUrl: 'https://www.dominos.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.my/deals', 'https://www.dominos.com.my/promotions'] },
  { name: 'Nando\'s', websiteUrl: 'https://www.nandos.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.com.my/promotions', 'https://www.nandos.com.my/deals'] },
  { name: 'Old Town White Coffee', websiteUrl: 'https://www.oldtown.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.oldtown.com.my/promotions', 'https://www.oldtown.com.my/deals'] },
  { name: 'Starbucks', websiteUrl: 'https://www.starbucks.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.my/promotions'] },
  { name: 'ZUS Coffee', websiteUrl: 'https://www.zuscoffee.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.zuscoffee.com/promotions', 'https://www.zuscoffee.com/deals'] },
  { name: 'Gigi Coffee', websiteUrl: 'https://www.gigicoffee.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.gigicoffee.com/promotions'] },
  { name: 'Kenny Rogers Roasters', websiteUrl: 'https://www.kennyrogersroasters.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.kennyrogersroasters.com.my/promotions'] },
  { name: 'The Chicken Rice Shop', websiteUrl: 'https://www.thechickenriceshop.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.thechickenriceshop.com/promotions'] },
  { name: 'Marrybrown', websiteUrl: 'https://www.marrybrown.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.marrybrown.com/promotions', 'https://www.marrybrown.com/deals'] },
  { name: 'A&W', websiteUrl: 'https://www.anwmalaysia.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.anwmalaysia.com.my/promotions'] },
  { name: 'Subway', websiteUrl: 'https://www.subway.com/en-MY', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/en-MY/deals'] },
  { name: 'Burger King', websiteUrl: 'https://www.burgerking.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.my/promotions', 'https://www.burgerking.com.my/deals'] },
  { name: 'Texas Chicken', websiteUrl: 'https://www.texaschickenmalaysia.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.texaschickenmalaysia.com/promotions'] },
  { name: 'Sushi King', websiteUrl: 'https://www.sushiking.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushiking.com.my/promotions'] },
  { name: 'Secret Recipe', websiteUrl: 'https://www.secretrecipe.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.secretrecipe.com.my/promotions'] },
  { name: 'PappaRich', websiteUrl: 'https://www.papparich.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.papparich.com.my/promotions'] },
  { name: 'Absolute Thai', websiteUrl: 'https://www.absolutethai.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.absolutethai.com/promotions'] },
  { name: 'Boat Noodle', websiteUrl: 'https://www.boatnoodle.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.boatnoodle.com/promotions'] },
  { name: 'myBurgerLab', websiteUrl: 'https://www.myburgerlab.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.myburgerlab.com/promotions'] },
  { name: 'Wingstop', websiteUrl: 'https://www.wingstop.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.wingstop.com.my/promotions'] },
  { name: 'Baskin-Robbins', websiteUrl: 'https://www.baskinrobbins.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbins.com.my/promotions'] },
  { name: 'Chatime', websiteUrl: 'https://www.chatime.com.my', categorySlug: 'yeme-icme', seedUrls: ['https://www.chatime.com.my/promotions'] },
  { name: 'CoCo', websiteUrl: 'https://www.coco-tea.com/my', categorySlug: 'yeme-icme', seedUrls: ['https://www.coco-tea.com/my/promotions'] },
  { name: 'Bask Bear Coffee', websiteUrl: 'https://www.baskbear.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskbear.com/promotions'] },
  { name: 'Sushi Mentai', websiteUrl: 'https://www.sushimentai.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushimentai.com/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Guardian', websiteUrl: 'https://www.guardian.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.guardian.com.my/promotions', 'https://www.guardian.com.my/deals'] },
  { name: 'Watsons', websiteUrl: 'https://www.watsons.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.watsons.com.my/promotions', 'https://www.watsons.com.my/deals'] },
  { name: 'Sephora', websiteUrl: 'https://www.sephora.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.my/sale', 'https://www.sephora.my/promotions'] },
  { name: 'Hermo', websiteUrl: 'https://www.hermo.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.hermo.my/sale', 'https://www.hermo.my/deals'] },
  { name: 'Althea', websiteUrl: 'https://www.althea.kr/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.althea.kr/my/sale'] },
  { name: 'MAC', websiteUrl: 'https://www.maccosmetics.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.my/offers', 'https://www.maccosmetics.com.my/sale'] },
  { name: 'Clinique', websiteUrl: 'https://www.clinique.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.my/offers'] },
  { name: 'Estee Lauder', websiteUrl: 'https://www.esteelauder.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.my/offers'] },
  { name: 'Laneige', websiteUrl: 'https://www.laneige.com/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laneige.com/my/en/promotions.html'] },
  { name: 'Innisfree', websiteUrl: 'https://www.innisfree.com/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.innisfree.com/my/en/promotion/'] },
  { name: 'Sulwhasoo', websiteUrl: 'https://www.sulwhasoo.com/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sulwhasoo.com/my/en/promotions.html'] },
  { name: 'The Body Shop', websiteUrl: 'https://www.thebodyshop.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com.my/sale', 'https://www.thebodyshop.com.my/offers'] },
  { name: 'Bath & Body Works', websiteUrl: 'https://www.bathandbodyworks.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.com.my/sale'] },
  { name: 'Kiehl\'s', websiteUrl: 'https://www.kiehls.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.com.my/offers'] },
  { name: 'L\'Occitane', websiteUrl: 'https://www.loccitane.com/en-my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loccitane.com/en-my/sale'] },
  { name: 'Benefit', websiteUrl: 'https://www.benefitcosmetics.com/en-my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.benefitcosmetics.com/en-my/offers'] },
  { name: 'Maybelline', websiteUrl: 'https://www.maybelline.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.my/promotions'] },
  { name: 'L\'Oreal', websiteUrl: 'https://www.loreal-paris.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.my/promotions'] },
  { name: 'Shiseido', websiteUrl: 'https://www.shiseido.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.shiseido.com.my/offers'] },
  { name: 'SK-II', websiteUrl: 'https://www.sk-ii.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sk-ii.com.my/offers'] },
  { name: 'Nars', websiteUrl: 'https://www.narscosmetics.com/MY', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.narscosmetics.com/MY/offers.html'] },
  { name: 'Bobbi Brown', websiteUrl: 'https://www.bobbibrown.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bobbibrown.com.my/offers'] },
  { name: 'Aesop', websiteUrl: 'https://www.aesop.com/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.aesop.com/my/'] },
  { name: 'Lush', websiteUrl: 'https://www.lush.com/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/my/en/sale'] },
  { name: 'SimplySiti', websiteUrl: 'https://www.simplysiti.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.simplysiti.com/sale', 'https://www.simplysiti.com/promotions'] },
  { name: 'Primavera', websiteUrl: 'https://www.primaveramalaysia.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.primaveramalaysia.com/promotions'] },
  { name: 'Olive Young', websiteUrl: 'https://www.oliveyoung.com.my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.oliveyoung.com.my/sale'] },
  { name: 'Sociolla', websiteUrl: 'https://www.sociolla.com/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sociolla.com/my/sale'] },
  { name: 'Luxasia', websiteUrl: 'https://www.luxasia.com/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.luxasia.com/my/promotions'] },
  { name: 'Nu Skin', websiteUrl: 'https://www.nuskin.com/en_MY', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nuskin.com/en_MY/promotions.html'] },
  { name: 'Bio-essence', websiteUrl: 'https://www.bio-essence.com/my', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bio-essence.com/my/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA', websiteUrl: 'https://www.ikea.com/my', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/my/en/offers/', 'https://www.ikea.com/my/en/campaigns/'] },
  { name: 'ACE Hardware', websiteUrl: 'https://www.acehardware.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.acehardware.com.my/promotions', 'https://www.acehardware.com.my/deals'] },
  { name: 'MR.DIY', websiteUrl: 'https://www.mrdiy.com/my', categorySlug: 'ev-yasam', seedUrls: ['https://www.mrdiy.com/my/promotions'] },
  { name: 'Nippon Paint', websiteUrl: 'https://www.nipponpaint.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.nipponpaint.com.my/promotions'] },
  { name: 'Dulux', websiteUrl: 'https://www.dulux.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.dulux.com.my/promotions'] },
  { name: 'Kaison Home', websiteUrl: 'https://www.kaisonhome.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.kaisonhome.com.my/promotions'] },
  { name: 'Hooga', websiteUrl: 'https://www.hooga.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.hooga.com.my/sale', 'https://www.hooga.com.my/promotions'] },
  { name: 'Fella Design', websiteUrl: 'https://www.felladesign.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.felladesign.com/promotions', 'https://www.felladesign.com/sale'] },
  { name: 'Lorenzo', websiteUrl: 'https://www.lorenzo.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.lorenzo.com.my/promotions', 'https://www.lorenzo.com.my/sale'] },
  { name: 'Coway', websiteUrl: 'https://www.coway.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.coway.com.my/promotion/', 'https://www.coway.com.my/deals/'] },
  { name: 'Cuckoo', websiteUrl: 'https://www.cuckoo.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.cuckoo.com.my/promotions/', 'https://www.cuckoo.com.my/deals/'] },
  { name: 'SK Magic', websiteUrl: 'https://www.skmagic.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.skmagic.com.my/promotions'] },
  { name: 'Philips', websiteUrl: 'https://www.philips.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.philips.com.my/c-e/promotions.html'] },
  { name: 'Tefal', websiteUrl: 'https://www.tefal.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.tefal.com.my/promotions'] },
  { name: 'Sharp', websiteUrl: 'https://www.sharp.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.sharp.com.my/promotions'] },
  { name: 'Daikin', websiteUrl: 'https://www.daikin.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.daikin.com.my/promotions'] },
  { name: 'Midea', websiteUrl: 'https://www.midea.com/my', categorySlug: 'ev-yasam', seedUrls: ['https://www.midea.com/my/promotions'] },
  { name: 'Elba', websiteUrl: 'https://www.elba.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.elba.com.my/promotions'] },
  { name: 'Khind', websiteUrl: 'https://www.khind.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.khind.com.my/promotions', 'https://www.khind.com.my/sale'] },
  { name: 'Pensonic', websiteUrl: 'https://www.pensonic.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.pensonic.com/promotions'] },
  { name: 'Hafele', websiteUrl: 'https://www.hafele.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.hafele.com.my/promotions'] },
  { name: 'Dreamland', websiteUrl: 'https://www.dreamland.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.dreamland.com.my/promotions', 'https://www.dreamland.com.my/sale'] },
  { name: 'Getha', websiteUrl: 'https://www.getha.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.getha.com.my/promotions'] },
  { name: 'King Koil', websiteUrl: 'https://www.kingkoil.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.kingkoil.com.my/promotions'] },
  { name: 'Vono', websiteUrl: 'https://www.vono.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.vono.com.my/promotions'] },
  { name: 'Gardex', websiteUrl: 'https://www.gardex.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.gardex.com.my/promotions'] },
  { name: 'OEM', websiteUrl: 'https://www.oemsystem.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.oemsystem.com.my/promotions'] },
  { name: 'HomeFix', websiteUrl: 'https://www.homefix.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.homefix.com.my/promotions'] },
  { name: 'Nitori', websiteUrl: 'https://www.nitori-net.jp/ec/my', categorySlug: 'ev-yasam', seedUrls: ['https://www.nitori-net.jp/ec/my/promotions'] },
  { name: 'Spotlight', websiteUrl: 'https://www.spotlightstores.com/my', categorySlug: 'ev-yasam', seedUrls: ['https://www.spotlightstores.com/my/sale'] },
  { name: 'SSF', websiteUrl: 'https://www.ssf.com.my', categorySlug: 'ev-yasam', seedUrls: ['https://www.ssf.com.my/promotions', 'https://www.ssf.com.my/sale'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon', websiteUrl: 'https://www.decathlon.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.my/sale', 'https://www.decathlon.my/deals'] },
  { name: 'Sports Direct', websiteUrl: 'https://www.sportsdirect.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportsdirect.com.my/sale', 'https://www.sportsdirect.com.my/deals'] },
  { name: 'Al-Ikhsan', websiteUrl: 'https://www.al-ikhsan.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.al-ikhsan.com/sale', 'https://www.al-ikhsan.com/promotions'] },
  { name: 'Royal Sporting House', websiteUrl: 'https://www.royalsportinghouse.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.royalsportinghouse.com.my/sale', 'https://www.royalsportinghouse.com.my/promotions'] },
  { name: 'Supersports', websiteUrl: 'https://www.supersports.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.supersports.com.my/sale'] },
  { name: 'Under Armour', websiteUrl: 'https://www.underarmour.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.my/sale'] },
  { name: 'New Balance', websiteUrl: 'https://www.newbalance.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.my/sale'] },
  { name: 'ASICS', websiteUrl: 'https://www.asics.com/my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/my/en/sale'] },
  { name: 'Reebok', websiteUrl: 'https://www.reebok.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com.my/sale'] },
  { name: 'The North Face', websiteUrl: 'https://www.thenorthface.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.my/sale'] },
  { name: 'Columbia', websiteUrl: 'https://www.columbia.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.com.my/sale'] },
  { name: 'Merrell', websiteUrl: 'https://www.merrell.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.com.my/sale'] },
  { name: 'Converse', websiteUrl: 'https://www.converse.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com.my/sale'] },
  { name: 'Vans', websiteUrl: 'https://www.vans.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.com.my/sale'] },
  { name: 'Fila', websiteUrl: 'https://www.fila.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.com.my/sale'] },
  { name: 'Yonex', websiteUrl: 'https://www.yonex.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.yonex.com.my/promotions'] },
  { name: 'Li-Ning', websiteUrl: 'https://www.li-ning.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.li-ning.com.my/sale'] },
  { name: 'Victor', websiteUrl: 'https://www.victorsport.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.victorsport.com.my/promotions'] },
  { name: 'Wilson', websiteUrl: 'https://www.wilson.com/en-my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wilson.com/en-my/sale'] },
  { name: 'Garmin', websiteUrl: 'https://www.garmin.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.garmin.com.my/promotions/'] },
  { name: 'GoPro', websiteUrl: 'https://gopro.com/en/my', categorySlug: 'spor-outdoor', seedUrls: ['https://gopro.com/en/my/deals'] },
  { name: 'Fitbit', websiteUrl: 'https://www.fitbit.com/my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitbit.com/my/sale'] },
  { name: 'Lululemon', websiteUrl: 'https://www.lululemon.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lululemon.com.my/sale'] },
  { name: 'Onitsuka Tiger', websiteUrl: 'https://www.onitsukatiger.com/my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.onitsukatiger.com/my/en/sale'] },
  { name: 'Saucony', websiteUrl: 'https://www.saucony.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.saucony.com.my/sale'] },
  { name: 'Brooks', websiteUrl: 'https://www.brooksrunning.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.brooksrunning.com.my/sale'] },
  { name: 'Hoka', websiteUrl: 'https://www.hoka.com/my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hoka.com/my/sale'] },
  { name: 'Arena', websiteUrl: 'https://www.arena.com/my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.arena.com/my/sale'] },
  { name: 'Speedo', websiteUrl: 'https://www.speedo.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.speedo.com.my/sale'] },
  { name: 'Oakley', websiteUrl: 'https://www.oakley.com/en-my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.oakley.com/en-my/sale'] },
  { name: 'Timberland', websiteUrl: 'https://www.timberland.com.my', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.com.my/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'AirAsia', websiteUrl: 'https://www.airasia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airasia.com/deals', 'https://www.airasia.com/promotions'] },
  { name: 'Malaysia Airlines', websiteUrl: 'https://www.malaysiaairlines.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.malaysiaairlines.com/my/en/deals.html', 'https://www.malaysiaairlines.com/my/en/promotions.html'] },
  { name: 'Firefly', websiteUrl: 'https://www.fireflyz.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fireflyz.com.my/promotions'] },
  { name: 'Batik Air', websiteUrl: 'https://www.batikair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.batikair.com/promotions', 'https://www.batikair.com/deals'] },
  { name: 'Traveloka', websiteUrl: 'https://www.traveloka.com/en-my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.traveloka.com/en-my/promotion', 'https://www.traveloka.com/en-my/deals'] },
  { name: 'Agoda', websiteUrl: 'https://www.agoda.com/my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/deals', 'https://www.agoda.com/promotions'] },
  { name: 'Booking.com', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.html'] },
  { name: 'Expedia', websiteUrl: 'https://www.expedia.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.my/deals', 'https://www.expedia.com.my/offers'] },
  { name: 'Trip.com', websiteUrl: 'https://www.trip.com/my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trip.com/sale/deals', 'https://www.trip.com/sale/promotion'] },
  { name: 'Klook', websiteUrl: 'https://www.klook.com/en-MY', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klook.com/en-MY/promo/', 'https://www.klook.com/en-MY/deals/'] },
  { name: 'Grab', websiteUrl: 'https://www.grab.com/my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.grab.com/my/deals/', 'https://www.grab.com/my/promotions/'] },
  { name: 'Fave', websiteUrl: 'https://myfave.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://myfave.com/deals', 'https://myfave.com/promotions'] },
  { name: 'Trivago', websiteUrl: 'https://www.trivago.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.com.my/'] },
  { name: 'Hotels.com', websiteUrl: 'https://www.hotels.com/my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hotels.com/deals/'] },
  { name: 'Hilton', websiteUrl: 'https://www.hilton.com/en/locations/malaysia', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hilton.com/en/offers/'] },
  { name: 'Marriott', websiteUrl: 'https://www.marriott.com/en-us/hotel-deals.mi', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com/en-us/hotel-deals.mi'] },
  { name: 'Shangri-La', websiteUrl: 'https://www.shangri-la.com/my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.shangri-la.com/offers/'] },
  { name: 'Genting', websiteUrl: 'https://www.rwgenting.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rwgenting.com/promotions/', 'https://www.rwgenting.com/deals/'] },
  { name: 'Sunway', websiteUrl: 'https://www.sunway.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sunway.com.my/promotions', 'https://www.sunway.com.my/deals'] },
  { name: 'Legoland', websiteUrl: 'https://www.legoland.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.legoland.com.my/tickets-passes/promotions/'] },
  { name: 'Sunway Lagoon', websiteUrl: 'https://www.sunwaylagoon.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sunwaylagoon.com/promotions/'] },
  { name: 'ETS', websiteUrl: 'https://www.ktmb.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ktmb.com.my/promotions.html'] },
  { name: 'Rapid KL', websiteUrl: 'https://www.myrapid.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.myrapid.com.my/promotions'] },
  { name: 'Easybook', websiteUrl: 'https://www.easybook.com/en-my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easybook.com/en-my/promotions'] },
  { name: 'Redbus', websiteUrl: 'https://www.redbus.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.redbus.my/offers'] },
  { name: 'Zuji', websiteUrl: 'https://www.zuji.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.zuji.com.my/deals'] },
  { name: 'Desaru Coast', websiteUrl: 'https://www.desarucoast.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.desarucoast.com/promotions'] },
  { name: 'Club Med', websiteUrl: 'https://www.clubmed.com.my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.clubmed.com.my/l/deals'] },
  { name: 'Tigerair', websiteUrl: 'https://www.tigerair.com/my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tigerair.com/my/deals'] },
  { name: 'Scoot', websiteUrl: 'https://www.flyscoot.com/en/my', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flyscoot.com/en/deals'] },
  { name: 'Thai AirAsia', websiteUrl: 'https://www.airasia.com/en/th', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airasia.com/deals'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Maybank', websiteUrl: 'https://www.maybank2u.com.my', categorySlug: 'finans', seedUrls: ['https://www.maybank2u.com.my/deals', 'https://www.maybank2u.com.my/promotions'] },
  { name: 'CIMB', websiteUrl: 'https://www.cimb.com.my', categorySlug: 'finans', seedUrls: ['https://www.cimb.com.my/en/personal/promotions.html', 'https://www.cimb.com.my/en/personal/offers.html'] },
  { name: 'Public Bank', websiteUrl: 'https://www.pbebank.com', categorySlug: 'finans', seedUrls: ['https://www.pbebank.com/promotions.html'] },
  { name: 'RHB', websiteUrl: 'https://www.rhbgroup.com', categorySlug: 'finans', seedUrls: ['https://www.rhbgroup.com/promotions/', 'https://www.rhbgroup.com/deals/'] },
  { name: 'Hong Leong Bank', websiteUrl: 'https://www.hlb.com.my', categorySlug: 'finans', seedUrls: ['https://www.hlb.com.my/en/personal-banking/promotions.html'] },
  { name: 'AmBank', websiteUrl: 'https://www.ambank.com.my', categorySlug: 'finans', seedUrls: ['https://www.ambank.com.my/eng/promotions'] },
  { name: 'Bank Islam', websiteUrl: 'https://www.bankislam.com', categorySlug: 'finans', seedUrls: ['https://www.bankislam.com/promotions/'] },
  { name: 'Bank Rakyat', websiteUrl: 'https://www.bankrakyat.com.my', categorySlug: 'finans', seedUrls: ['https://www.bankrakyat.com.my/promotions'] },
  { name: 'OCBC', websiteUrl: 'https://www.ocbc.com.my', categorySlug: 'finans', seedUrls: ['https://www.ocbc.com.my/personal-banking/promotions.page'] },
  { name: 'UOB', websiteUrl: 'https://www.uob.com.my', categorySlug: 'finans', seedUrls: ['https://www.uob.com.my/personal/deals/index.page', 'https://www.uob.com.my/personal/promotions/'] },
  { name: 'HSBC', websiteUrl: 'https://www.hsbc.com.my', categorySlug: 'finans', seedUrls: ['https://www.hsbc.com.my/offers/', 'https://www.hsbc.com.my/promotions/'] },
  { name: 'Standard Chartered', websiteUrl: 'https://www.sc.com/my', categorySlug: 'finans', seedUrls: ['https://www.sc.com/my/promotions/', 'https://www.sc.com/my/deals/'] },
  { name: 'Citibank', websiteUrl: 'https://www.citibank.com.my', categorySlug: 'finans', seedUrls: ['https://www.citibank.com.my/promotions/'] },
  { name: 'Alliance Bank', websiteUrl: 'https://www.alliancebank.com.my', categorySlug: 'finans', seedUrls: ['https://www.alliancebank.com.my/promotions'] },
  { name: 'Affin Bank', websiteUrl: 'https://www.affinbank.com.my', categorySlug: 'finans', seedUrls: ['https://www.affinbank.com.my/promotions'] },
  { name: 'Touch \'n Go eWallet', websiteUrl: 'https://www.touchngo.com.my', categorySlug: 'finans', seedUrls: ['https://www.touchngo.com.my/deals/', 'https://www.touchngo.com.my/promotions/'] },
  { name: 'GrabPay', websiteUrl: 'https://www.grab.com/my/pay', categorySlug: 'finans', seedUrls: ['https://www.grab.com/my/pay/deals/', 'https://www.grab.com/my/pay/promotions/'] },
  { name: 'Boost', websiteUrl: 'https://www.myboost.com.my', categorySlug: 'finans', seedUrls: ['https://www.myboost.com.my/deals', 'https://www.myboost.com.my/promotions'] },
  { name: 'ShopeePay', websiteUrl: 'https://shopee.com.my/shopeepay', categorySlug: 'finans', seedUrls: ['https://shopee.com.my/shopeepay/deals'] },
  { name: 'BigPay', websiteUrl: 'https://www.bigpayme.com', categorySlug: 'finans', seedUrls: ['https://www.bigpayme.com/promotions', 'https://www.bigpayme.com/deals'] },
  { name: 'MAE by Maybank', websiteUrl: 'https://mae.maybank2u.com.my', categorySlug: 'finans', seedUrls: ['https://mae.maybank2u.com.my/deals'] },
  { name: 'Setel', websiteUrl: 'https://www.setel.com', categorySlug: 'finans', seedUrls: ['https://www.setel.com/deals', 'https://www.setel.com/promotions'] },
  { name: 'KiplePay', websiteUrl: 'https://www.kiple.com', categorySlug: 'finans', seedUrls: ['https://www.kiple.com/promotions'] },
  { name: 'Visa', websiteUrl: 'https://www.visa.com.my', categorySlug: 'finans', seedUrls: ['https://www.visa.com.my/en_my/offers/'] },
  { name: 'Mastercard', websiteUrl: 'https://www.mastercard.com.my', categorySlug: 'finans', seedUrls: ['https://www.mastercard.com.my/en-my/personal/offers.html'] },
  { name: 'Aeon Credit', websiteUrl: 'https://www.aeoncredit.com.my', categorySlug: 'finans', seedUrls: ['https://www.aeoncredit.com.my/promotions'] },
  { name: 'MBSB Bank', websiteUrl: 'https://www.mbsbbank.com', categorySlug: 'finans', seedUrls: ['https://www.mbsbbank.com/promotions'] },
  { name: 'Bank Muamalat', websiteUrl: 'https://www.muamalat.com.my', categorySlug: 'finans', seedUrls: ['https://www.muamalat.com.my/promotions'] },
  { name: 'Agrobank', websiteUrl: 'https://www.agrobank.com.my', categorySlug: 'finans', seedUrls: ['https://www.agrobank.com.my/promotions'] },
  { name: 'BSN', websiteUrl: 'https://www.bsn.com.my', categorySlug: 'finans', seedUrls: ['https://www.bsn.com.my/promotions'] },
  { name: 'Kuwait Finance House', websiteUrl: 'https://www.kfh.com.my', categorySlug: 'finans', seedUrls: ['https://www.kfh.com.my/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'AIA', websiteUrl: 'https://www.aia.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.aia.com.my/en/promotions.html', 'https://www.aia.com.my/en/offers.html'] },
  { name: 'Prudential', websiteUrl: 'https://www.prudential.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.prudential.com.my/en/promotions/'] },
  { name: 'Great Eastern', websiteUrl: 'https://www.greateasternlife.com/my', categorySlug: 'sigorta', seedUrls: ['https://www.greateasternlife.com/my/en/promotions.html'] },
  { name: 'Allianz', websiteUrl: 'https://www.allianz.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.com.my/promotions'] },
  { name: 'Zurich', websiteUrl: 'https://www.zurich.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.com.my/en/promotions'] },
  { name: 'AXA', websiteUrl: 'https://www.axa.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.axa.com.my/promotions'] },
  { name: 'Manulife', websiteUrl: 'https://www.manulife.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.manulife.com.my/en/promotions.html'] },
  { name: 'Tokio Marine', websiteUrl: 'https://www.tokiomarine.com/my', categorySlug: 'sigorta', seedUrls: ['https://www.tokiomarine.com/my/en/promotions.html'] },
  { name: 'Etiqa', websiteUrl: 'https://www.etiqa.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.etiqa.com.my/v2/promotions', 'https://www.etiqa.com.my/v2/deals'] },
  { name: 'Takaful Malaysia', websiteUrl: 'https://www.takaful-malaysia.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.takaful-malaysia.com.my/promotions'] },
  { name: 'FWD', websiteUrl: 'https://www.fwd.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.fwd.com.my/promotions/'] },
  { name: 'Sun Life', websiteUrl: 'https://www.sunlifemalaysia.com', categorySlug: 'sigorta', seedUrls: ['https://www.sunlifemalaysia.com/promotions'] },
  { name: 'MSIG', websiteUrl: 'https://www.msig.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.msig.com.my/promotions'] },
  { name: 'RHB Insurance', websiteUrl: 'https://www.rhbinsurance.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.rhbinsurance.com.my/promotions'] },
  { name: 'AmMetLife', websiteUrl: 'https://www.ammetlife.com', categorySlug: 'sigorta', seedUrls: ['https://www.ammetlife.com/promotions'] },
  { name: 'Hong Leong Assurance', websiteUrl: 'https://www.hla.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.hla.com.my/promotions'] },
  { name: 'CIMB Aviva', websiteUrl: 'https://www.cimbaviva.com', categorySlug: 'sigorta', seedUrls: ['https://www.cimbaviva.com/promotions'] },
  { name: 'Generali', websiteUrl: 'https://www.generali.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.generali.com.my/promotions'] },
  { name: 'Liberty', websiteUrl: 'https://www.libertyinsurance.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.libertyinsurance.com.my/promotions'] },
  { name: 'PolicyStreet', websiteUrl: 'https://www.policystreet.com', categorySlug: 'sigorta', seedUrls: ['https://www.policystreet.com/promotions', 'https://www.policystreet.com/deals'] },
  { name: 'GetCover', websiteUrl: 'https://www.getcover.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.getcover.com.my/promotions'] },
  { name: 'Bjak', websiteUrl: 'https://bjak.my', categorySlug: 'sigorta', seedUrls: ['https://bjak.my/promotions', 'https://bjak.my/deals'] },
  { name: 'RinggitPlus', websiteUrl: 'https://ringgitplus.com', categorySlug: 'sigorta', seedUrls: ['https://ringgitplus.com/en/insurance/promotions/'] },
  { name: 'iMoney', websiteUrl: 'https://www.imoney.my', categorySlug: 'sigorta', seedUrls: ['https://www.imoney.my/promotions'] },
  { name: 'GoBear', websiteUrl: 'https://www.gobear.com/my', categorySlug: 'sigorta', seedUrls: ['https://www.gobear.com/my/promotions'] },
  { name: 'Kurnia', websiteUrl: 'https://www.kurnia.com', categorySlug: 'sigorta', seedUrls: ['https://www.kurnia.com/promotions'] },
  { name: 'Berjaya Sompo', websiteUrl: 'https://www.berjayasompo.com.my', categorySlug: 'sigorta', seedUrls: ['https://www.berjayasompo.com.my/promotions'] },
  { name: 'Pacific & Orient', websiteUrl: 'https://www.pacific-orient.com', categorySlug: 'sigorta', seedUrls: ['https://www.pacific-orient.com/promotions'] },
  { name: 'Lonpac', websiteUrl: 'https://www.lonpac.com', categorySlug: 'sigorta', seedUrls: ['https://www.lonpac.com/promotions'] },
  { name: 'Tune Protect', websiteUrl: 'https://www.tuneprotect.com', categorySlug: 'sigorta', seedUrls: ['https://www.tuneprotect.com/promotions', 'https://www.tuneprotect.com/deals'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Perodua', websiteUrl: 'https://www.perodua.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.perodua.com.my/promotions', 'https://www.perodua.com.my/deals'] },
  { name: 'Proton', websiteUrl: 'https://www.proton.com', categorySlug: 'otomobil', seedUrls: ['https://www.proton.com/promotions', 'https://www.proton.com/offers'] },
  { name: 'Toyota', websiteUrl: 'https://www.toyota.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.my/promotions', 'https://www.toyota.com.my/deals'] },
  { name: 'Honda', websiteUrl: 'https://www.honda.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.my/promotions', 'https://www.honda.com.my/offers'] },
  { name: 'Nissan', websiteUrl: 'https://www.nissan.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.my/promotions.html', 'https://www.nissan.com.my/offers.html'] },
  { name: 'Mazda', websiteUrl: 'https://www.mazda.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.com.my/promotions/', 'https://www.mazda.com.my/offers/'] },
  { name: 'BMW', websiteUrl: 'https://www.bmw.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.my/en/topics/offers-and-services/bmw-offers.html'] },
  { name: 'Mercedes-Benz', websiteUrl: 'https://www.mercedes-benz.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.my/passengercars/buy/offers.html'] },
  { name: 'Audi', websiteUrl: 'https://www.audi.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.my/my/web/en/offers.html'] },
  { name: 'Volkswagen', websiteUrl: 'https://www.volkswagen.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.com.my/en/offers.html'] },
  { name: 'Hyundai', websiteUrl: 'https://www.hyundai.com/my', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/my/en/promotions'] },
  { name: 'Kia', websiteUrl: 'https://www.kia.com/my', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/my/promotions.html'] },
  { name: 'Mitsubishi', websiteUrl: 'https://www.mitsubishi-motors.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.com.my/promotions'] },
  { name: 'Subaru', websiteUrl: 'https://www.subaru.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.com.my/promotions'] },
  { name: 'Suzuki', websiteUrl: 'https://www.suzuki.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.com.my/promotions'] },
  { name: 'Isuzu', websiteUrl: 'https://www.isuzu.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.isuzu.com.my/promotions'] },
  { name: 'Ford', websiteUrl: 'https://www.ford.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.ford.com.my/offers/'] },
  { name: 'Volvo', websiteUrl: 'https://www.volvocars.com/my', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/my/offers/'] },
  { name: 'Peugeot', websiteUrl: 'https://www.peugeot.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.my/offers/'] },
  { name: 'Citroen', websiteUrl: 'https://www.citroen.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.com.my/offers/'] },
  { name: 'Chery', websiteUrl: 'https://www.chery.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.chery.com.my/promotions'] },
  { name: 'GWM', websiteUrl: 'https://www.gwm.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.gwm.com.my/promotions'] },
  { name: 'BYD', websiteUrl: 'https://www.byd.com/my', categorySlug: 'otomobil', seedUrls: ['https://www.byd.com/my/promotions'] },
  { name: 'Tesla', websiteUrl: 'https://www.tesla.com/en_my', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/en_my/'] },
  { name: 'Lexus', websiteUrl: 'https://www.lexus.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.lexus.com.my/promotions'] },
  { name: 'Porsche', websiteUrl: 'https://www.porsche.com/malaysia', categorySlug: 'otomobil', seedUrls: ['https://www.porsche.com/malaysia/offers/'] },
  { name: 'Shell', websiteUrl: 'https://www.shell.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.shell.com.my/motorist/promotions.html'] },
  { name: 'Petronas', websiteUrl: 'https://www.petronas.com', categorySlug: 'otomobil', seedUrls: ['https://www.petronas.com/mesra/promotions'] },
  { name: 'Caltex', websiteUrl: 'https://www.caltex.com/my', categorySlug: 'otomobil', seedUrls: ['https://www.caltex.com/my/promotions.html'] },
  { name: 'Goodyear', websiteUrl: 'https://www.goodyear.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.goodyear.com.my/promotions'] },
  { name: 'Michelin', websiteUrl: 'https://www.michelin.com.my', categorySlug: 'otomobil', seedUrls: ['https://www.michelin.com.my/auto/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobby (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Popular Bookstore', websiteUrl: 'https://www.popular.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.popular.com.my/promotions', 'https://www.popular.com.my/sale'] },
  { name: 'MPH', websiteUrl: 'https://www.mph.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mph.com.my/promotions', 'https://www.mph.com.my/sale'] },
  { name: 'Kinokuniya', websiteUrl: 'https://www.kinokuniya.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kinokuniya.com.my/promotions/', 'https://www.kinokuniya.com.my/sale/'] },
  { name: 'BookXcess', websiteUrl: 'https://www.bookxcess.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookxcess.com/sale', 'https://www.bookxcess.com/deals'] },
  { name: 'Toy World', websiteUrl: 'https://www.toyworld.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toyworld.com.my/promotions', 'https://www.toyworld.com.my/sale'] },
  { name: 'Toys R Us', websiteUrl: 'https://www.toysrus.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.com.my/sale', 'https://www.toysrus.com.my/promotions'] },
  { name: 'LEGO', websiteUrl: 'https://www.lego.com/en-my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-my/deals'] },
  { name: 'PlayStation', websiteUrl: 'https://store.playstation.com/en-my', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/en-my/category/deals'] },
  { name: 'Xbox', websiteUrl: 'https://www.xbox.com/en-MY', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/en-MY/games/sales-and-specials'] },
  { name: 'Nintendo', websiteUrl: 'https://www.nintendo.com/en-my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/en-my/store/deals/'] },
  { name: 'Steam', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Netflix', websiteUrl: 'https://www.netflix.com/my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/my/'] },
  { name: 'Disney+', websiteUrl: 'https://www.disneyplus.com/en-my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/en-my/'] },
  { name: 'Spotify', websiteUrl: 'https://www.spotify.com/my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/my-en/premium/'] },
  { name: 'Astro', websiteUrl: 'https://www.astro.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.astro.com.my/promotions', 'https://www.astro.com.my/deals'] },
  { name: 'HBO Go', websiteUrl: 'https://www.hbogoasia.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hbogoasia.my/'] },
  { name: 'iQIYI', websiteUrl: 'https://www.iq.com/my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.iq.com/my/'] },
  { name: 'Viu', websiteUrl: 'https://www.viu.com/ott/my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.viu.com/ott/my/'] },
  { name: 'Art Friend', websiteUrl: 'https://www.artfriend.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.artfriend.com.my/promotions'] },
  { name: 'Nala Designs', websiteUrl: 'https://www.naladesigns.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.naladesigns.com/sale'] },
  { name: 'GSC', websiteUrl: 'https://www.gsc.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gsc.com.my/promotions/', 'https://www.gsc.com.my/deals/'] },
  { name: 'TGV Cinemas', websiteUrl: 'https://www.tgv.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.tgv.com.my/promotions/', 'https://www.tgv.com.my/deals/'] },
  { name: 'MBO Cinemas', websiteUrl: 'https://www.mbocinemas.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mbocinemas.com/promotions'] },
  { name: 'Hobbycraft', websiteUrl: 'https://www.hobbycraft.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbycraft.com.my/sale'] },
  { name: 'Tamiya', websiteUrl: 'https://www.tamiya.com/malaysia', categorySlug: 'kitap-hobi', seedUrls: ['https://www.tamiya.com/malaysia/promotions'] },
  { name: 'Pet Lovers Centre', websiteUrl: 'https://www.petloverscentre.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.petloverscentre.com.my/promotions', 'https://www.petloverscentre.com.my/sale'] },
  { name: 'PetSmart', websiteUrl: 'https://www.petsmart.com.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.petsmart.com.my/sale'] },
  { name: 'Sunway Theme Parks', websiteUrl: 'https://www.sunwaythemeparks.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sunwaythemeparks.com/promotions/'] },
  { name: 'Escape Park', websiteUrl: 'https://www.escape.my', categorySlug: 'kitap-hobi', seedUrls: ['https://www.escape.my/promotions'] },
  { name: 'Apple Music', websiteUrl: 'https://music.apple.com/my', categorySlug: 'kitap-hobi', seedUrls: ['https://music.apple.com/my/'] },
  { name: 'YouTube Premium', websiteUrl: 'https://www.youtube.com/premium', categorySlug: 'kitap-hobi', seedUrls: ['https://www.youtube.com/premium'] },
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
  console.log('=== MY Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'MY' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'MY', categoryId: category.id },
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
            market: 'MY',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'MY' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'MY', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active MY sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
