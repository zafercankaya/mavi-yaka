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

// ── ALL PH BRANDS DATA ──────────────────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Shopee Philippines', websiteUrl: 'https://shopee.ph', categorySlug: 'alisveris', seedUrls: ['https://shopee.ph/flash_sale', 'https://shopee.ph/m/vouchers'] },
  { name: 'Lazada Philippines', websiteUrl: 'https://www.lazada.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.lazada.com.ph/wow/gcp/route/lazada/ph/upr_1000345_lazada/channel/ph/upr-router/ph', 'https://www.lazada.com.ph/campaign/'] },
  { name: 'Zalora Philippines', websiteUrl: 'https://www.zalora.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.zalora.com.ph/sale/', 'https://www.zalora.com.ph/vouchers/'] },
  { name: 'SM Store Online', websiteUrl: 'https://www.smstore.com', categorySlug: 'alisveris', seedUrls: ['https://www.smstore.com/pages/sale', 'https://www.smstore.com/pages/promos'] },
  { name: 'Robinsons Department Store', websiteUrl: 'https://www.robinsonsdepartmentstore.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.robinsonsdepartmentstore.com.ph/promo', 'https://www.robinsonsdepartmentstore.com.ph/sale'] },
  { name: 'Metro Department Store', websiteUrl: 'https://www.metrodepartmentstore.com', categorySlug: 'alisveris', seedUrls: ['https://www.metrodepartmentstore.com/promos'] },
  { name: 'Landmark', websiteUrl: 'https://www.landmarkstores.ph', categorySlug: 'alisveris', seedUrls: ['https://www.landmarkstores.ph/promos'] },
  { name: 'Puregold Online', websiteUrl: 'https://www.puregold.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.puregold.com.ph/promos'] },
  { name: 'S&R Philippines', websiteUrl: 'https://www.snrshopping.com', categorySlug: 'alisveris', seedUrls: ['https://www.snrshopping.com/promos', 'https://www.snrshopping.com/sale'] },
  { name: 'Wilcon Depot', websiteUrl: 'https://www.wilcon.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.wilcon.com.ph/sale', 'https://www.wilcon.com.ph/promos'] },
  { name: 'AllHome', websiteUrl: 'https://www.allhome.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.allhome.com.ph/sale', 'https://www.allhome.com.ph/promos'] },
  { name: 'CW Home Depot', websiteUrl: 'https://www.cwhomedepot.com', categorySlug: 'alisveris', seedUrls: ['https://www.cwhomedepot.com/promos'] },
  { name: 'True Value Philippines', websiteUrl: 'https://www.truevalue.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.truevalue.com.ph/promos', 'https://www.truevalue.com.ph/sale'] },
  { name: 'Ace Hardware Philippines', websiteUrl: 'https://www.acehardware.ph', categorySlug: 'alisveris', seedUrls: ['https://www.acehardware.ph/promos', 'https://www.acehardware.ph/sale'] },
  { name: 'Handyman', websiteUrl: 'https://www.handyman.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.handyman.com.ph/promos'] },
  { name: 'National Book Store', websiteUrl: 'https://www.nationalbookstore.com', categorySlug: 'alisveris', seedUrls: ['https://www.nationalbookstore.com/sale', 'https://www.nationalbookstore.com/promos'] },
  { name: 'SM Appliance', websiteUrl: 'https://www.smappliance.com', categorySlug: 'alisveris', seedUrls: ['https://www.smappliance.com/promos', 'https://www.smappliance.com/sale'] },
  { name: 'Abenson', websiteUrl: 'https://www.abenson.com', categorySlug: 'alisveris', seedUrls: ['https://www.abenson.com/promo', 'https://www.abenson.com/sale'] },
  { name: 'Western Appliances', websiteUrl: 'https://www.western.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.western.com.ph/promos', 'https://www.western.com.ph/sale'] },
  { name: "Anson's", websiteUrl: 'https://www.ansons.ph', categorySlug: 'alisveris', seedUrls: ['https://www.ansons.ph/promos', 'https://www.ansons.ph/sale'] },
  { name: 'Automatic Centre', websiteUrl: 'https://www.automaticcentre.com', categorySlug: 'alisveris', seedUrls: ['https://www.automaticcentre.com/promos'] },
  { name: 'Octagon Computer', websiteUrl: 'https://octagon.com.ph', categorySlug: 'alisveris', seedUrls: ['https://octagon.com.ph/promos', 'https://octagon.com.ph/sale'] },
  { name: 'PC Express', websiteUrl: 'https://pcx.com.ph', categorySlug: 'alisveris', seedUrls: ['https://pcx.com.ph/sale', 'https://pcx.com.ph/promos'] },
  { name: 'Villman', websiteUrl: 'https://www.villman.com', categorySlug: 'alisveris', seedUrls: ['https://www.villman.com/Sale', 'https://www.villman.com/Promos'] },
  { name: 'DataBlitz', websiteUrl: 'https://www.datablitz.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.datablitz.com.ph/collections/sale', 'https://www.datablitz.com.ph/pages/deals'] },
  { name: 'Kimstore', websiteUrl: 'https://www.kimstore.com', categorySlug: 'alisveris', seedUrls: ['https://www.kimstore.com/sale', 'https://www.kimstore.com/promos'] },
  { name: 'MemoXpress', websiteUrl: 'https://www.memoxpress.com', categorySlug: 'alisveris', seedUrls: ['https://www.memoxpress.com/sale', 'https://www.memoxpress.com/promos'] },
  { name: 'Beyond the Box', websiteUrl: 'https://www.beyondthebox.ph', categorySlug: 'alisveris', seedUrls: ['https://www.beyondthebox.ph/promos', 'https://www.beyondthebox.ph/sale'] },
  { name: 'Switch', websiteUrl: 'https://www.switch.com.ph', categorySlug: 'alisveris', seedUrls: ['https://www.switch.com.ph/promos', 'https://www.switch.com.ph/sale'] },
  { name: 'Digital Walker', websiteUrl: 'https://www.digitalwalker.ph', categorySlug: 'alisveris', seedUrls: ['https://www.digitalwalker.ph/sale', 'https://www.digitalwalker.ph/promos'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung Philippines', websiteUrl: 'https://www.samsung.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/ph/offer/', 'https://www.samsung.com/ph/smartphones/all-smartphones/?galaxy-deals'] },
  { name: 'Power Mac Center', websiteUrl: 'https://www.powermaccenter.com', categorySlug: 'elektronik', seedUrls: ['https://www.powermaccenter.com/promos', 'https://www.powermaccenter.com/sale'] },
  { name: 'Xiaomi Philippines', websiteUrl: 'https://www.mi.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/ph/sale', 'https://www.mi.com/ph/promotion'] },
  { name: 'OPPO Philippines', websiteUrl: 'https://www.oppo.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/ph/offer/', 'https://www.oppo.com/ph/events/'] },
  { name: 'Vivo Philippines', websiteUrl: 'https://www.vivo.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com/ph/campaign', 'https://www.vivo.com/ph/promotion'] },
  { name: 'Realme Philippines', websiteUrl: 'https://www.realme.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/ph/offer', 'https://www.realme.com/ph/promotion'] },
  { name: 'ASUS Philippines', websiteUrl: 'https://www.asus.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/ph/campaign/', 'https://www.asus.com/ph/Promotions/'] },
  { name: 'Acer Philippines', websiteUrl: 'https://store.acer.com/en-ph', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/en-ph/sale', 'https://www.acer.com/ph-en/promotions'] },
  { name: 'Lenovo Philippines', websiteUrl: 'https://www.lenovo.com/ph/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/ph/en/d/deals/', 'https://www.lenovo.com/ph/en/sale/'] },
  { name: 'HP Philippines', websiteUrl: 'https://www.hp.com/ph-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/ph-en/shop/offer', 'https://www.hp.com/ph-en/shop/promotion'] },
  { name: 'Dell Philippines', websiteUrl: 'https://www.dell.com/en-ph', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-ph/lp/deals', 'https://www.dell.com/en-ph/shop/deals'] },
  { name: 'LG Philippines', websiteUrl: 'https://www.lg.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/ph/promotions/', 'https://www.lg.com/ph/offer/'] },
  { name: 'Sony Philippines', websiteUrl: 'https://store.sony.com.ph', categorySlug: 'elektronik', seedUrls: ['https://store.sony.com.ph/collections/sale', 'https://store.sony.com.ph/pages/promos'] },
  { name: 'Panasonic Philippines', websiteUrl: 'https://www.panasonic.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/ph/promotions.html', 'https://www.panasonic.com/ph/campaign.html'] },
  { name: 'Philips Philippines', websiteUrl: 'https://www.philips.com.ph', categorySlug: 'elektronik', seedUrls: ['https://www.philips.com.ph/c-e/promotions.html'] },
  { name: 'Huawei Philippines', websiteUrl: 'https://consumer.huawei.com/ph', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/ph/offer/', 'https://consumer.huawei.com/ph/campaign/'] },
  { name: 'Infinix Philippines', websiteUrl: 'https://www.infinixmobility.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.infinixmobility.com/ph/promotion'] },
  { name: 'Tecno Philippines', websiteUrl: 'https://www.tecno-mobile.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.tecno-mobile.com/ph/promotion/'] },
  { name: 'Honor Philippines', websiteUrl: 'https://www.honor.com/ph', categorySlug: 'elektronik', seedUrls: ['https://www.honor.com/ph/offer/', 'https://www.honor.com/ph/promotion/'] },
  { name: 'Nothing Philippines', websiteUrl: 'https://ph.nothing.tech', categorySlug: 'elektronik', seedUrls: ['https://ph.nothing.tech/pages/deals'] },
  { name: 'Canon Philippines', websiteUrl: 'https://ph.canon', categorySlug: 'elektronik', seedUrls: ['https://ph.canon/en/campaign', 'https://ph.canon/en/consumer/promo'] },
  { name: 'Nikon Philippines', websiteUrl: 'https://www.nikon.com.ph', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.com.ph/promotions'] },
  { name: 'JBL Philippines', websiteUrl: 'https://ph.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://ph.jbl.com/sale.html', 'https://ph.jbl.com/promotions.html'] },
  { name: 'Bose Philippines', websiteUrl: 'https://www.bose.ph', categorySlug: 'elektronik', seedUrls: ['https://www.bose.ph/c/sale'] },
  { name: 'Dyson Philippines', websiteUrl: 'https://www.dyson.com.ph', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.com.ph/offers', 'https://www.dyson.com.ph/promotions'] },
  { name: 'Daikin Philippines', websiteUrl: 'https://www.daikin.com.ph', categorySlug: 'elektronik', seedUrls: ['https://www.daikin.com.ph/promotions'] },
  { name: 'Carrier Philippines', websiteUrl: 'https://www.carrier.com/residential/en/ph', categorySlug: 'elektronik', seedUrls: ['https://www.carrier.com/residential/en/ph/promotions/'] },
  { name: 'Condura', websiteUrl: 'https://www.condura.com', categorySlug: 'elektronik', seedUrls: ['https://www.condura.com/promos', 'https://www.condura.com/sale'] },
  { name: 'Fujidenzo', websiteUrl: 'https://www.fujidenzo.com.ph', categorySlug: 'elektronik', seedUrls: ['https://www.fujidenzo.com.ph/promos'] },
  { name: 'Hanabishi', websiteUrl: 'https://www.hanabishi.com', categorySlug: 'elektronik', seedUrls: ['https://www.hanabishi.com/promos', 'https://www.hanabishi.com/sale'] },

  // ═══════════════════════════════════════════════════════
  // 3) Fashion (giyim-moda) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'UNIQLO Philippines', websiteUrl: 'https://www.uniqlo.com/ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/ph/en/sale', 'https://www.uniqlo.com/ph/en/spl/limited-offers'] },
  { name: 'H&M Philippines', websiteUrl: 'https://www2.hm.com/en_ph', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/en_ph/sale.html', 'https://www2.hm.com/en_ph/offers.html'] },
  { name: 'Zara Philippines', websiteUrl: 'https://www.zara.com/ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/ph/en/z-sale-l1314.html'] },
  { name: 'SM Fashion', websiteUrl: 'https://www.smstore.com/collections/fashion', categorySlug: 'giyim-moda', seedUrls: ['https://www.smstore.com/collections/fashion-sale', 'https://www.smstore.com/pages/fashion-promos'] },
  { name: 'Bench', websiteUrl: 'https://www.bench.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.bench.com.ph/sale', 'https://www.bench.com.ph/promos'] },
  { name: 'Penshoppe', websiteUrl: 'https://www.penshoppe.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.penshoppe.com/sale', 'https://www.penshoppe.com/promos'] },
  { name: 'Oxygen', websiteUrl: 'https://www.oxygenfashion.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.oxygenfashion.com/sale'] },
  { name: 'Regatta', websiteUrl: 'https://regatta.ph', categorySlug: 'giyim-moda', seedUrls: ['https://regatta.ph/collections/sale', 'https://regatta.ph/pages/promos'] },
  { name: 'Plains & Prints', websiteUrl: 'https://www.plainsandprints.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.plainsandprints.com/sale', 'https://www.plainsandprints.com/promos'] },
  { name: 'Kashieca', websiteUrl: 'https://www.kashieca.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.kashieca.com/sale'] },
  { name: 'Kamiseta', websiteUrl: 'https://www.kamiseta.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.kamiseta.com.ph/sale'] },
  { name: 'Nike Philippines', websiteUrl: 'https://www.nike.com/ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/ph/w/sale-3yaep', 'https://www.nike.com/ph/w/deals-pf6kh'] },
  { name: 'Adidas Philippines', websiteUrl: 'https://www.adidas.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.com.ph/sale', 'https://www.adidas.com.ph/outlet'] },
  { name: 'Converse Philippines', websiteUrl: 'https://www.converse.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.converse.com.ph/sale'] },
  { name: 'Vans Philippines', websiteUrl: 'https://www.vans.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.vans.com.ph/sale'] },
  { name: 'Skechers Philippines', websiteUrl: 'https://www.skechers.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.skechers.com.ph/sale', 'https://www.skechers.com.ph/promos'] },
  { name: 'Charles & Keith Philippines', websiteUrl: 'https://www.charleskeith.com/ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/ph/sale'] },
  { name: 'Aldo Philippines', websiteUrl: 'https://www.aldoshoes.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.aldoshoes.com.ph/sale'] },
  { name: 'Payless Philippines', websiteUrl: 'https://www.payless.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.payless.ph/sale', 'https://www.payless.ph/promos'] },
  { name: 'SM Shoes', websiteUrl: 'https://www.smstore.com/collections/shoes', categorySlug: 'giyim-moda', seedUrls: ['https://www.smstore.com/collections/shoes-sale'] },
  { name: 'Celine Philippines', websiteUrl: 'https://www.celine.com/en-ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.celine.com/en-ph/sale.html'] },
  { name: 'Mango Philippines', websiteUrl: 'https://shop.mango.com/ph', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/ph/en/c/sale'] },
  { name: 'Cotton On Philippines', websiteUrl: 'https://cottonon.com/PH', categorySlug: 'giyim-moda', seedUrls: ['https://cottonon.com/PH/sale/'] },
  { name: 'Forever 21 Philippines', websiteUrl: 'https://www.forever21.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.forever21.com.ph/sale'] },
  { name: 'GAP Philippines', websiteUrl: 'https://www.gap.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.gap.com.ph/sale'] },
  { name: "Levi's Philippines", websiteUrl: 'https://www.levi.com.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com.ph/sale', 'https://www.levi.com.ph/deals'] },
  { name: 'Guess Philippines', websiteUrl: 'https://www.guess.ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.ph/sale'] },
  { name: 'Lacoste Philippines', websiteUrl: 'https://www.lacoste.com/ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com/ph/sale.html'] },
  { name: 'Tommy Hilfiger Philippines', websiteUrl: 'https://ph.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://ph.tommy.com/sale'] },
  { name: 'Marks & Spencer Philippines', websiteUrl: 'https://www.marksandspencer.com/ph', categorySlug: 'giyim-moda', seedUrls: ['https://www.marksandspencer.com/ph/sale', 'https://www.marksandspencer.com/ph/offers'] },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SM Home', websiteUrl: 'https://www.smhome.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.smhome.com/promos', 'https://www.smhome.com/sale'] },
  { name: 'Landmark Home', websiteUrl: 'https://www.landmarkstores.ph/home', categorySlug: 'ev-yasam', seedUrls: ['https://www.landmarkstores.ph/home/promos'] },
  { name: 'AllHome PH', websiteUrl: 'https://www.allhome.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.allhome.com.ph/sale', 'https://www.allhome.com.ph/promos'] },
  { name: 'Wilcon Depot PH', websiteUrl: 'https://www.wilcon.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.wilcon.com.ph/sale', 'https://www.wilcon.com.ph/promos'] },
  { name: 'CW Home Depot PH', websiteUrl: 'https://www.cwhomedepot.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.cwhomedepot.com/promos'] },
  { name: 'True Value PH', websiteUrl: 'https://www.truevalue.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.truevalue.com.ph/promos', 'https://www.truevalue.com.ph/sale'] },
  { name: 'Ace Hardware PH', websiteUrl: 'https://www.acehardware.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.acehardware.ph/promos', 'https://www.acehardware.ph/sale'] },
  { name: 'Handyman PH', websiteUrl: 'https://www.handyman.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.handyman.com.ph/promos'] },
  { name: 'IKEA Philippines', websiteUrl: 'https://www.ikea.com/ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/ph/en/offers/', 'https://www.ikea.com/ph/en/campaigns/'] },
  { name: 'HMR Trading', websiteUrl: 'https://hmr.ph', categorySlug: 'ev-yasam', seedUrls: ['https://hmr.ph/deals', 'https://hmr.ph/promos'] },
  { name: 'Our Home', websiteUrl: 'https://www.ourhome.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.ourhome.ph/sale', 'https://www.ourhome.ph/promos'] },
  { name: 'Crate & Barrel Philippines', websiteUrl: 'https://www.crateandbarrel.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.crateandbarrel.com.ph/sale/'] },
  { name: 'West Elm Philippines', websiteUrl: 'https://www.westelm.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.westelm.com.ph/shop/sale/'] },
  { name: 'Pottery Barn Philippines', websiteUrl: 'https://www.potterybarn.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.potterybarn.com.ph/shop/sale/'] },
  { name: 'Mandaue Foam', websiteUrl: 'https://www.mandauefoam.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.mandauefoam.ph/sale', 'https://www.mandauefoam.ph/promos'] },
  { name: 'Uratex', websiteUrl: 'https://www.uratex.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.uratex.com.ph/promos', 'https://www.uratex.com.ph/sale'] },
  { name: 'Salem', websiteUrl: 'https://www.salembed.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.salembed.com/promos', 'https://www.salembed.com/sale'] },
  { name: 'Serta Philippines', websiteUrl: 'https://www.serta.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.serta.com.ph/promos'] },
  { name: 'Electrolux Philippines', websiteUrl: 'https://www.electrolux.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.electrolux.com.ph/promotions/', 'https://www.electrolux.com.ph/sale/'] },
  { name: 'Samsung Home Philippines', websiteUrl: 'https://www.samsung.com/ph/home-appliances', categorySlug: 'ev-yasam', seedUrls: ['https://www.samsung.com/ph/offer/home-appliances/'] },
  { name: 'LG Home Philippines', websiteUrl: 'https://www.lg.com/ph/home-appliances', categorySlug: 'ev-yasam', seedUrls: ['https://www.lg.com/ph/promotions/home-appliances/'] },
  { name: 'Panasonic Home Philippines', websiteUrl: 'https://www.panasonic.com/ph/consumer/home-appliances', categorySlug: 'ev-yasam', seedUrls: ['https://www.panasonic.com/ph/promotions.html'] },
  { name: 'Whirlpool Philippines', websiteUrl: 'https://www.whirlpool.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.whirlpool.com.ph/promotions', 'https://www.whirlpool.com.ph/sale'] },
  { name: 'Dyson Philippines PH', websiteUrl: 'https://www.dyson.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.dyson.com.ph/offers'] },
  { name: 'Philips Home Philippines', websiteUrl: 'https://www.philips.com.ph/c-m/household', categorySlug: 'ev-yasam', seedUrls: ['https://www.philips.com.ph/c-e/promotions.html'] },
  { name: 'Condura PH', websiteUrl: 'https://www.condura.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.condura.com/promos'] },
  { name: 'Hanabishi PH', websiteUrl: 'https://www.hanabishi.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.hanabishi.com/promos'] },
  { name: 'Imarflex', websiteUrl: 'https://www.imarflex.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.imarflex.com.ph/promos'] },
  { name: 'La Germania Philippines', websiteUrl: 'https://www.lagermania.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.lagermania.com.ph/promos'] },
  { name: 'Tecnogas Philippines', websiteUrl: 'https://www.tecnogas.com.ph', categorySlug: 'ev-yasam', seedUrls: ['https://www.tecnogas.com.ph/promos'] },

  // ═══════════════════════════════════════════════════════
  // 5) Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SM Supermarket', websiteUrl: 'https://www.smsupermarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.smsupermarket.com/promos', 'https://www.smsupermarket.com/sale'] },
  { name: 'Robinsons Supermarket', websiteUrl: 'https://www.robinsonssupermarket.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.robinsonssupermarket.com.ph/promos', 'https://www.robinsonssupermarket.com.ph/deals'] },
  { name: 'Puregold', websiteUrl: 'https://www.puregold.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.puregold.com.ph/promos'] },
  { name: "S&R Members Treat", websiteUrl: 'https://www.snrshopping.com', categorySlug: 'gida-market', seedUrls: ['https://www.snrshopping.com/promos', 'https://www.snrshopping.com/members-treat'] },
  { name: 'Landers', websiteUrl: 'https://www.lfranchise.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.lfranchise.com.ph/promos'] },
  { name: 'Metro Mart', websiteUrl: 'https://www.metromart.com', categorySlug: 'gida-market', seedUrls: ['https://www.metromart.com/promos', 'https://www.metromart.com/sale'] },
  { name: 'Walter Mart', websiteUrl: 'https://www.waltermart.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.waltermart.com.ph/promos'] },
  { name: 'Shopwise', websiteUrl: 'https://www.shopwise.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.shopwise.com.ph/promos'] },
  { name: "Rustan's Supermarket", websiteUrl: 'https://www.rustans.com', categorySlug: 'gida-market', seedUrls: ['https://www.rustans.com/promos', 'https://www.rustans.com/sale'] },
  { name: 'AllDay Supermarket', websiteUrl: 'https://www.allday.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.allday.com.ph/promos'] },
  { name: 'MerryMart', websiteUrl: 'https://www.merrymart.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.merrymart.com.ph/promos'] },
  { name: 'Ever Gotesco', websiteUrl: 'https://www.evergotesco.com', categorySlug: 'gida-market', seedUrls: ['https://www.evergotesco.com/promos'] },
  { name: 'Pioneer Centre', websiteUrl: 'https://www.pioneercentre.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.pioneercentre.com.ph/promos'] },
  { name: 'Gaisano', websiteUrl: 'https://www.gaisano.com', categorySlug: 'gida-market', seedUrls: ['https://www.gaisano.com/promos'] },
  { name: 'Savemore', websiteUrl: 'https://www.savemore.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.savemore.com.ph/promos'] },
  { name: 'Prince Hypermart', websiteUrl: 'https://www.princehypermart.com', categorySlug: 'gida-market', seedUrls: ['https://www.princehypermart.com/promos'] },
  { name: 'Cherry Foodarama', websiteUrl: 'https://www.cherryfoodarama.com', categorySlug: 'gida-market', seedUrls: ['https://www.cherryfoodarama.com/promos'] },
  { name: 'South Supermarket', websiteUrl: 'https://www.southsupermarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.southsupermarket.com/promos'] },
  { name: 'GrabMart Philippines', websiteUrl: 'https://www.grab.com/ph/mart', categorySlug: 'gida-market', seedUrls: ['https://www.grab.com/ph/mart/promo/', 'https://www.grab.com/ph/mart/deals/'] },
  { name: 'MetroMart', websiteUrl: 'https://www.metromart.com', categorySlug: 'gida-market', seedUrls: ['https://www.metromart.com/promos'] },
  { name: 'Lazmart', websiteUrl: 'https://www.lazada.com.ph/lazmart', categorySlug: 'gida-market', seedUrls: ['https://www.lazada.com.ph/lazmart/'] },
  { name: 'Shopee Supermarket PH', websiteUrl: 'https://shopee.ph/m/shopee-supermarket', categorySlug: 'gida-market', seedUrls: ['https://shopee.ph/m/shopee-supermarket'] },
  { name: 'Robinsons Easymart', websiteUrl: 'https://www.robinsonseasymart.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.robinsonseasymart.com.ph/promos'] },
  { name: 'Alfamart Philippines', websiteUrl: 'https://www.alfamart.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.alfamart.com.ph/promos'] },
  { name: 'Ministop Philippines', websiteUrl: 'https://www.ministop.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.ministop.com.ph/promos'] },
  { name: '7-Eleven Philippines', websiteUrl: 'https://www.7-eleven.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.7-eleven.com.ph/promos', 'https://www.7-eleven.com.ph/deals'] },
  { name: 'FamilyMart Philippines', websiteUrl: 'https://www.familymart.ph', categorySlug: 'gida-market', seedUrls: ['https://www.familymart.ph/promos'] },
  { name: 'Lawson Philippines', websiteUrl: 'https://www.lawson.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.lawson.com.ph/promos'] },
  { name: 'Mercury Drug', websiteUrl: 'https://www.mercurydrug.com', categorySlug: 'gida-market', seedUrls: ['https://www.mercurydrug.com/promos', 'https://www.mercurydrug.com/sale'] },
  { name: 'Watsons Philippines', websiteUrl: 'https://www.watsons.com.ph', categorySlug: 'gida-market', seedUrls: ['https://www.watsons.com.ph/sale', 'https://www.watsons.com.ph/promos'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Dining (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'GrabFood Philippines', websiteUrl: 'https://www.grab.com/ph/food', categorySlug: 'yeme-icme', seedUrls: ['https://www.grab.com/ph/food/promo/', 'https://www.grab.com/ph/food/vouchers/'] },
  { name: 'Foodpanda Philippines', websiteUrl: 'https://www.foodpanda.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.foodpanda.ph/vouchers', 'https://www.foodpanda.ph/deals'] },
  { name: 'Jollibee', websiteUrl: 'https://www.jollibee.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.jollibee.com.ph/promos', 'https://www.jollibee.com.ph/deals'] },
  { name: "McDonald's Philippines", websiteUrl: 'https://www.mcdonalds.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com.ph/promos', 'https://www.mcdonalds.com.ph/deals'] },
  { name: 'KFC Philippines', websiteUrl: 'https://www.kfc.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.com.ph/promos', 'https://www.kfc.com.ph/deals'] },
  { name: 'Chowking', websiteUrl: 'https://www.chowking.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.chowking.com/promos'] },
  { name: 'Greenwich', websiteUrl: 'https://www.greenwichdelivery.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.greenwichdelivery.com/promos'] },
  { name: 'Red Ribbon', websiteUrl: 'https://www.redribbonbakeshop.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.redribbonbakeshop.com.ph/promos'] },
  { name: 'Goldilocks', websiteUrl: 'https://www.goldilocksdelivery.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.goldilocksdelivery.com.ph/promos'] },
  { name: 'Mang Inasal', websiteUrl: 'https://www.manginasal.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.manginasal.com/promos'] },
  { name: 'Burger King Philippines', websiteUrl: 'https://www.burgerking.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.ph/promos', 'https://www.burgerking.com.ph/deals'] },
  { name: "Wendy's Philippines", websiteUrl: 'https://www.wendys.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.wendys.com.ph/promos'] },
  { name: 'Popeyes Philippines', websiteUrl: 'https://www.popeyes.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.popeyes.ph/promos'] },
  { name: 'Subway Philippines', websiteUrl: 'https://www.subway.com/en-ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/en-ph/promotions'] },
  { name: 'Pizza Hut Philippines', websiteUrl: 'https://www.pizzahut.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.ph/promos', 'https://www.pizzahut.com.ph/deals'] },
  { name: "Domino's Pizza Philippines", websiteUrl: 'https://www.dominos.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.ph/promos', 'https://www.dominos.com.ph/deals'] },
  { name: "Shakey's", websiteUrl: 'https://www.shakeyspizza.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.shakeyspizza.ph/promos', 'https://www.shakeyspizza.ph/deals'] },
  { name: 'Yellow Cab', websiteUrl: 'https://www.yellowcabpizza.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.yellowcabpizza.com/promos'] },
  { name: 'Army Navy', websiteUrl: 'https://www.armynavy.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.armynavy.com.ph/promos'] },
  { name: 'BonChon Philippines', websiteUrl: 'https://www.bonchon.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.bonchon.com.ph/promos'] },
  { name: 'Starbucks Philippines', websiteUrl: 'https://www.starbucks.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.ph/promos', 'https://www.starbucks.ph/card/promos'] },
  { name: 'Coffee Bean Philippines', websiteUrl: 'https://www.coffeebean.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.coffeebean.com.ph/promos'] },
  { name: 'Tim Hortons Philippines', websiteUrl: 'https://www.timhortons.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.timhortons.ph/promos'] },
  { name: "Dunkin' Philippines", websiteUrl: 'https://www.dunkindonuts.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.ph/promos', 'https://www.dunkindonuts.ph/deals'] },
  { name: 'J.CO Philippines', websiteUrl: 'https://www.jcodonuts.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.jcodonuts.ph/promos'] },
  { name: 'Krispy Kreme Philippines', websiteUrl: 'https://www.krispykreme.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.krispykreme.com.ph/promos'] },
  { name: "Max's Restaurant", websiteUrl: 'https://www.maxschicken.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.maxschicken.com/promos'] },
  { name: 'Pancake House', websiteUrl: 'https://www.pancakehouse.com.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.pancakehouse.com.ph/promos'] },
  { name: 'CIBO', websiteUrl: 'https://www.cibo.ph', categorySlug: 'yeme-icme', seedUrls: ['https://www.cibo.ph/promos'] },
  { name: 'Kuya J', websiteUrl: 'https://www.kuyaj.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kuyaj.com/promos'] },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty & Personal Care (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Watsons PH', websiteUrl: 'https://www.watsons.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.watsons.com.ph/sale', 'https://www.watsons.com.ph/promos'] },
  { name: 'Mercury Drug Beauty', websiteUrl: 'https://www.mercurydrug.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mercurydrug.com/beauty-promos'] },
  { name: 'Sephora Philippines', websiteUrl: 'https://www.sephora.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.ph/sale', 'https://www.sephora.ph/promos'] },
  { name: 'SM Beauty', websiteUrl: 'https://www.smbeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.smbeauty.com/promos', 'https://www.smbeauty.com/sale'] },
  { name: "Rustan's Beauty", websiteUrl: 'https://www.rustans.com/beauty', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rustans.com/beauty/promos'] },
  { name: 'BeautyMNL', websiteUrl: 'https://www.beautymnl.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.beautymnl.com/sale', 'https://www.beautymnl.com/deals'] },
  { name: 'Skin Station', websiteUrl: 'https://www.skinstation.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.skinstation.ph/promos'] },
  { name: 'Flawless', websiteUrl: 'https://www.flawless.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.flawless.com.ph/promos'] },
  { name: 'Belo Medical Group', websiteUrl: 'https://www.belomed.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.belomed.com/promos'] },
  { name: 'Dermclinic', websiteUrl: 'https://www.dermclinic.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dermclinic.com.ph/promos'] },
  { name: 'MAC Philippines', websiteUrl: 'https://www.maccosmetics.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.ph/sale'] },
  { name: 'Maybelline Philippines', websiteUrl: 'https://www.maybelline.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.ph/offers', 'https://www.maybelline.com.ph/promos'] },
  { name: "L'Oreal Philippines", websiteUrl: 'https://www.loreal-paris.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.ph/offers', 'https://www.loreal-paris.com.ph/promos'] },
  { name: 'Garnier Philippines', websiteUrl: 'https://www.garnier.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.com.ph/promos'] },
  { name: 'Nivea Philippines', websiteUrl: 'https://www.nivea.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.com.ph/promos'] },
  { name: 'Dove Philippines', websiteUrl: 'https://www.dove.com/ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/ph/offers.html'] },
  { name: 'The Body Shop Philippines', websiteUrl: 'https://www.thebodyshop.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com.ph/sale', 'https://www.thebodyshop.com.ph/promos'] },
  { name: 'Lush Philippines', websiteUrl: 'https://www.lush.com/ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/ph/en/sale'] },
  { name: 'Bath & Body Works Philippines', websiteUrl: 'https://www.bathandbodyworks.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.com.ph/sale', 'https://www.bathandbodyworks.com.ph/promos'] },
  { name: 'Clinique Philippines', websiteUrl: 'https://www.clinique.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.ph/offers'] },
  { name: 'Estee Lauder Philippines', websiteUrl: 'https://www.esteelauder.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.ph/offers'] },
  { name: 'Fresh Philippines', websiteUrl: 'https://www.fresh.com/ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.fresh.com/ph/offers'] },
  { name: "Kiehl's Philippines", websiteUrl: 'https://www.kiehls.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.com.ph/offers', 'https://www.kiehls.com.ph/promos'] },
  { name: 'La Mer Philippines', websiteUrl: 'https://www.lamer.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lamer.com.ph/offers'] },
  { name: 'Happy Skin', websiteUrl: 'https://www.happyskincosmetics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.happyskincosmetics.com/sale', 'https://www.happyskincosmetics.com/promos'] },
  { name: 'Sunnies Face', websiteUrl: 'https://www.sunniesface.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sunniesface.com/sale'] },
  { name: 'BLK Cosmetics', websiteUrl: 'https://www.blkcosmetics.com.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.blkcosmetics.com.ph/sale', 'https://www.blkcosmetics.com.ph/promos'] },
  { name: 'Issy & Co', websiteUrl: 'https://www.issyandco.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.issyandco.com/sale'] },
  { name: 'Colourette', websiteUrl: 'https://www.colourette.ph', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.colourette.ph/sale', 'https://www.colourette.ph/promos'] },
  { name: 'Vice Cosmetics', websiteUrl: 'https://www.vicecosmetics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vicecosmetics.com/sale', 'https://www.vicecosmetics.com/promos'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nike PH', websiteUrl: 'https://www.nike.com/ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/ph/w/sale-3yaep'] },
  { name: 'Adidas PH', websiteUrl: 'https://www.adidas.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.com.ph/sale', 'https://www.adidas.com.ph/outlet'] },
  { name: 'Under Armour Philippines', websiteUrl: 'https://www.underarmour.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.ph/sale', 'https://www.underarmour.com.ph/outlet'] },
  { name: 'Puma Philippines', websiteUrl: 'https://ph.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://ph.puma.com/ph/en/sale'] },
  { name: 'New Balance Philippines', websiteUrl: 'https://www.newbalance.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.ph/sale', 'https://www.newbalance.com.ph/promos'] },
  { name: 'Skechers PH', websiteUrl: 'https://www.skechers.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.ph/sale'] },
  { name: 'ASICS Philippines', websiteUrl: 'https://www.asics.com/ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/ph/sale'] },
  { name: 'Fila Philippines', websiteUrl: 'https://www.fila.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.com.ph/sale'] },
  { name: 'Reebok Philippines', websiteUrl: 'https://www.reebok.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com.ph/sale'] },
  { name: 'Converse PH', websiteUrl: 'https://www.converse.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com.ph/sale'] },
  { name: "Toby's Sports", websiteUrl: 'https://www.tobys.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.tobys.com/sale', 'https://www.tobys.com/promos'] },
  { name: 'Runnr', websiteUrl: 'https://www.runnr.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.runnr.com.ph/sale', 'https://www.runnr.com.ph/promos'] },
  { name: 'Olympic Village', websiteUrl: 'https://www.olympicvillage.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.olympicvillage.ph/sale'] },
  { name: 'Chris Sports', websiteUrl: 'https://www.chrissports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.chrissports.com/sale', 'https://www.chrissports.com/promos'] },
  { name: 'ROX Philippines', websiteUrl: 'https://www.rox.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.rox.ph/sale', 'https://www.rox.ph/promos'] },
  { name: 'Columbia Philippines', websiteUrl: 'https://www.columbiasportswear.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.com.ph/sale'] },
  { name: 'The North Face Philippines', websiteUrl: 'https://www.thenorthface.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.ph/sale'] },
  { name: 'Patagonia Philippines', websiteUrl: 'https://www.patagonia.com/ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.patagonia.com/ph/sale/'] },
  { name: 'Merrell Philippines', websiteUrl: 'https://www.merrell.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.com.ph/sale'] },
  { name: 'Garmin Philippines', websiteUrl: 'https://www.garmin.com/en-PH', categorySlug: 'spor-outdoor', seedUrls: ['https://www.garmin.com/en-PH/sale/'] },
  { name: 'GoPro Philippines', websiteUrl: 'https://www.gopro.com/en/ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gopro.com/en/ph/deals'] },
  { name: 'Decathlon Philippines', websiteUrl: 'https://www.decathlon.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.ph/sale', 'https://www.decathlon.ph/deals'] },
  { name: 'Planet Sports Philippines', websiteUrl: 'https://www.planetsports.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.planetsports.ph/sale'] },
  { name: 'SM Sports', websiteUrl: 'https://www.smsports.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.smsports.com.ph/promos', 'https://www.smsports.com.ph/sale'] },
  { name: 'Royal Sporting House PH', websiteUrl: 'https://www.royalsportinghouse.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.royalsportinghouse.ph/sale'] },
  { name: 'Speedo Philippines', websiteUrl: 'https://www.speedo.com.ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.speedo.com.ph/sale'] },
  { name: 'Arena Philippines', websiteUrl: 'https://www.arenawaterinstinct.com/ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.arenawaterinstinct.com/ph/sale'] },
  { name: 'Wilson Philippines', websiteUrl: 'https://www.wilson.com/en-ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wilson.com/en-ph/sale'] },
  { name: 'Prince Philippines', websiteUrl: 'https://www.princetennis.com/ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.princetennis.com/ph/sale'] },
  { name: 'Yonex Philippines', websiteUrl: 'https://www.yonex.com/ph', categorySlug: 'spor-outdoor', seedUrls: ['https://www.yonex.com/ph/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Cebu Pacific', websiteUrl: 'https://www.cebupacificair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.cebupacificair.com/en-ph/pages/seat-sale', 'https://www.cebupacificair.com/en-ph/pages/promotions'] },
  { name: 'Philippine Airlines', websiteUrl: 'https://www.philippineairlines.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.philippineairlines.com/promotions', 'https://www.philippineairlines.com/deals'] },
  { name: 'AirAsia Philippines', websiteUrl: 'https://www.airasia.com/en/ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airasia.com/en/ph/promotions.html', 'https://www.airasia.com/en/ph/deals.html'] },
  { name: 'Booking.com Philippines', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.html'] },
  { name: 'Agoda Philippines', websiteUrl: 'https://www.agoda.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/deals', 'https://www.agoda.com/promos'] },
  { name: 'Traveloka Philippines', websiteUrl: 'https://www.traveloka.com/en-ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.traveloka.com/en-ph/promotion'] },
  { name: 'Trip.com Philippines', websiteUrl: 'https://www.trip.com/ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trip.com/sale/deal'] },
  { name: 'Klook Philippines', websiteUrl: 'https://www.klook.com/en-PH', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klook.com/en-PH/promos/', 'https://www.klook.com/en-PH/sale/'] },
  { name: 'Airbnb Philippines', websiteUrl: 'https://www.airbnb.com/philippines', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.com/s/Philippines/homes'] },
  { name: 'Hotels.com Philippines', websiteUrl: 'https://www.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hotels.com/deals'] },
  { name: 'Expedia Philippines', websiteUrl: 'https://www.expedia.com.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.ph/deals'] },
  { name: 'Trivago Philippines', websiteUrl: 'https://www.trivago.com.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.com.ph/'] },
  { name: 'Skyscanner Philippines', websiteUrl: 'https://www.skyscanner.com.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.com.ph/deals'] },
  { name: 'Grab Philippines', websiteUrl: 'https://www.grab.com/ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.grab.com/ph/promos/', 'https://www.grab.com/ph/transport/promo/'] },
  { name: 'Angkas', websiteUrl: 'https://www.angkas.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.angkas.com/promos'] },
  { name: 'JoyRide', websiteUrl: 'https://www.joyride.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.joyride.ph/promos'] },
  { name: 'Move It', websiteUrl: 'https://www.moveit.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.moveit.ph/promos'] },
  { name: '2GO Travel', websiteUrl: 'https://travel.2go.com.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://travel.2go.com.ph/promos', 'https://travel.2go.com.ph/deals'] },
  { name: 'Victory Liner', websiteUrl: 'https://www.victoryliner.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.victoryliner.com/promos'] },
  { name: 'PITX', websiteUrl: 'https://www.pitx.com.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pitx.com.ph/promos'] },
  { name: 'Philippine Rabbit', websiteUrl: 'https://www.philrabbit.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.philrabbit.com/promos'] },
  { name: 'DLTB', websiteUrl: 'https://www.dltb.com.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.dltb.com.ph/promos'] },
  { name: 'Ceres Bus', websiteUrl: 'https://www.ceresbus.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ceresbus.com/promos'] },
  { name: 'Jam Liner', websiteUrl: 'https://www.jamliner.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jamliner.com/promos'] },
  { name: 'OYO Philippines', websiteUrl: 'https://www.oyorooms.com/ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.oyorooms.com/ph/offers'] },
  { name: 'RedDoorz Philippines', websiteUrl: 'https://www.reddoorz.com/en-ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.reddoorz.com/en-ph/promos'] },
  { name: 'ZEN Rooms Philippines', websiteUrl: 'https://www.zenrooms.com/ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.zenrooms.com/ph/deals'] },
  { name: 'Go Hotels', websiteUrl: 'https://www.gohotels.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.gohotels.ph/promos', 'https://www.gohotels.ph/deals'] },
  { name: 'Microtel Philippines', websiteUrl: 'https://www.microtel-inn.com.ph', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.microtel-inn.com.ph/promos'] },
  { name: 'Quest Hotel', websiteUrl: 'https://www.questhotelsandresorts.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.questhotelsandresorts.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'BDO', websiteUrl: 'https://www.bdo.com.ph', categorySlug: 'finans', seedUrls: ['https://www.bdo.com.ph/promos', 'https://www.bdo.com.ph/credit-cards/promos'] },
  { name: 'BPI', websiteUrl: 'https://www.bpi.com.ph', categorySlug: 'finans', seedUrls: ['https://www.bpi.com.ph/promos', 'https://www.bpi.com.ph/creditcards/promos'] },
  { name: 'Metrobank', websiteUrl: 'https://www.metrobank.com.ph', categorySlug: 'finans', seedUrls: ['https://www.metrobank.com.ph/promos', 'https://www.metrobank.com.ph/articles/promos'] },
  { name: 'UnionBank', websiteUrl: 'https://www.unionbankph.com', categorySlug: 'finans', seedUrls: ['https://www.unionbankph.com/promos', 'https://www.unionbankph.com/offers'] },
  { name: 'Security Bank', websiteUrl: 'https://www.securitybank.com', categorySlug: 'finans', seedUrls: ['https://www.securitybank.com/promos/'] },
  { name: 'RCBC', websiteUrl: 'https://www.rcbc.com', categorySlug: 'finans', seedUrls: ['https://www.rcbc.com/promos'] },
  { name: 'PNB', websiteUrl: 'https://www.pnb.com.ph', categorySlug: 'finans', seedUrls: ['https://www.pnb.com.ph/promos'] },
  { name: 'Landbank', websiteUrl: 'https://www.landbank.com', categorySlug: 'finans', seedUrls: ['https://www.landbank.com/promos'] },
  { name: 'EastWest Bank', websiteUrl: 'https://www.eastwestbanker.com', categorySlug: 'finans', seedUrls: ['https://www.eastwestbanker.com/promos'] },
  { name: 'China Bank', websiteUrl: 'https://www.chinabank.ph', categorySlug: 'finans', seedUrls: ['https://www.chinabank.ph/promos'] },
  { name: 'CIMB Philippines', websiteUrl: 'https://www.cimb.com.ph', categorySlug: 'finans', seedUrls: ['https://www.cimb.com.ph/promos'] },
  { name: 'ING Philippines', websiteUrl: 'https://www.ing.com.ph', categorySlug: 'finans', seedUrls: ['https://www.ing.com.ph/promos'] },
  { name: 'Maya', websiteUrl: 'https://www.maya.ph', categorySlug: 'finans', seedUrls: ['https://www.maya.ph/deals', 'https://www.maya.ph/promos'] },
  { name: 'GCash', websiteUrl: 'https://www.gcash.com', categorySlug: 'finans', seedUrls: ['https://www.gcash.com/promos', 'https://www.gcash.com/deals'] },
  { name: 'ShopeePay Philippines', websiteUrl: 'https://shopee.ph/m/shopeepay', categorySlug: 'finans', seedUrls: ['https://shopee.ph/m/shopeepay-deals'] },
  { name: 'GrabPay Philippines', websiteUrl: 'https://www.grab.com/ph/pay', categorySlug: 'finans', seedUrls: ['https://www.grab.com/ph/pay/promo/'] },
  { name: 'PayPal Philippines', websiteUrl: 'https://www.paypal.com/ph', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/ph/webapps/mpp/offers'] },
  { name: 'Coins.ph', websiteUrl: 'https://coins.ph', categorySlug: 'finans', seedUrls: ['https://coins.ph/promos'] },
  { name: 'Tonik', websiteUrl: 'https://www.tonikbank.com', categorySlug: 'finans', seedUrls: ['https://www.tonikbank.com/promos'] },
  { name: 'GoTyme', websiteUrl: 'https://www.gotyme.com.ph', categorySlug: 'finans', seedUrls: ['https://www.gotyme.com.ph/promos'] },
  { name: 'UnionDigital', websiteUrl: 'https://www.uniondigitalbank.ph', categorySlug: 'finans', seedUrls: ['https://www.uniondigitalbank.ph/promos'] },
  { name: 'CIMB Bank PH', websiteUrl: 'https://www.cimb.com.ph', categorySlug: 'finans', seedUrls: ['https://www.cimb.com.ph/promos'] },
  { name: 'Seabank Philippines', websiteUrl: 'https://www.seabank.com.ph', categorySlug: 'finans', seedUrls: ['https://www.seabank.com.ph/promos'] },
  { name: 'Diskartech', websiteUrl: 'https://www.diskartech.ph', categorySlug: 'finans', seedUrls: ['https://www.diskartech.ph/promos'] },
  { name: 'BillEase', websiteUrl: 'https://www.billease.ph', categorySlug: 'finans', seedUrls: ['https://www.billease.ph/promos', 'https://www.billease.ph/deals'] },
  { name: 'Home Credit Philippines', websiteUrl: 'https://www.homecredit.ph', categorySlug: 'finans', seedUrls: ['https://www.homecredit.ph/promos', 'https://www.homecredit.ph/deals'] },
  { name: 'Cashalo', websiteUrl: 'https://www.cashalo.com', categorySlug: 'finans', seedUrls: ['https://www.cashalo.com/promos'] },
  { name: 'Tala Philippines', websiteUrl: 'https://tala.co/ph', categorySlug: 'finans', seedUrls: ['https://tala.co/ph/promos'] },
  { name: 'Lendly', websiteUrl: 'https://www.lendly.ph', categorySlug: 'finans', seedUrls: ['https://www.lendly.ph/promos'] },
  { name: 'Robocash Philippines', websiteUrl: 'https://www.robocash.ph', categorySlug: 'finans', seedUrls: ['https://www.robocash.ph/promos'] },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'AIA Philippines', websiteUrl: 'https://www.aia.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.aia.com.ph/en/promotions.html'] },
  { name: 'Sun Life Philippines', websiteUrl: 'https://www.sunlife.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.sunlife.com.ph/en/promotions/'] },
  { name: 'Pru Life UK', websiteUrl: 'https://www.prulifeuk.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.prulifeuk.com.ph/en/promotions/'] },
  { name: 'Manulife Philippines', websiteUrl: 'https://www.manulife.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.manulife.com.ph/promotions.html'] },
  { name: 'Allianz Philippines', websiteUrl: 'https://www.allianzpnblife.ph', categorySlug: 'sigorta', seedUrls: ['https://www.allianzpnblife.ph/promos'] },
  { name: 'AXA Philippines', websiteUrl: 'https://www.axa.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.axa.com.ph/promos'] },
  { name: 'FWD Philippines', websiteUrl: 'https://www.fwd.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.fwd.com.ph/promos/'] },
  { name: 'Insular Life', websiteUrl: 'https://www.insularlife.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.insularlife.com.ph/promos'] },
  { name: 'BPI-Philam', websiteUrl: 'https://www.bpi-philam.com', categorySlug: 'sigorta', seedUrls: ['https://www.bpi-philam.com/en/promotions.html'] },
  { name: 'BDO Life', websiteUrl: 'https://www.bdo.com.ph/bdolife', categorySlug: 'sigorta', seedUrls: ['https://www.bdo.com.ph/bdolife/promos'] },
  { name: 'Generali Philippines', websiteUrl: 'https://www.generali.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.generali.com.ph/promos'] },
  { name: 'Malayan Insurance', websiteUrl: 'https://www.malayan.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.malayan.com.ph/promos'] },
  { name: 'Pioneer Insurance', websiteUrl: 'https://www.pioneer.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.pioneer.com.ph/promos'] },
  { name: 'Paramount Life', websiteUrl: 'https://www.paramount.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.paramount.com.ph/promos'] },
  { name: 'Cocolife', websiteUrl: 'https://www.cocolife.com', categorySlug: 'sigorta', seedUrls: ['https://www.cocolife.com/promos'] },
  { name: 'Standard Insurance', websiteUrl: 'https://www.standard-insurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.standard-insurance.com/promos'] },
  { name: 'Pacific Cross', websiteUrl: 'https://www.pacificcross.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.pacificcross.com.ph/promos'] },
  { name: 'Maxicare', websiteUrl: 'https://www.maxicare.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.maxicare.com.ph/promos', 'https://www.maxicare.com.ph/offers'] },
  { name: 'Intellicare', websiteUrl: 'https://www.intellicare.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.intellicare.com.ph/promos'] },
  { name: 'Medicard', websiteUrl: 'https://www.medicard.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.medicard.com.ph/promos'] },
  { name: 'PhilCare', websiteUrl: 'https://www.philcare.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.philcare.com.ph/promos'] },
  { name: 'HMO Pacific', websiteUrl: 'https://www.hmopacific.com', categorySlug: 'sigorta', seedUrls: ['https://www.hmopacific.com/promos'] },
  { name: 'Etiqa Philippines', websiteUrl: 'https://www.etiqa.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.etiqa.com.ph/promos'] },
  { name: 'MAPFRE Insurance Philippines', websiteUrl: 'https://www.mapfre.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.mapfre.com.ph/promos'] },
  { name: 'PGA Sompo', websiteUrl: 'https://www.pgasompo.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.pgasompo.com.ph/promos'] },
  { name: 'Stronghold Insurance', websiteUrl: 'https://www.strongholdins.com', categorySlug: 'sigorta', seedUrls: ['https://www.strongholdins.com/promos'] },
  { name: 'Milestone Insurance', websiteUrl: 'https://www.milestone.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.milestone.com.ph/promos'] },
  { name: 'Mercantile Insurance', websiteUrl: 'https://www.mercantile.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.mercantile.com.ph/promos'] },
  { name: 'FPG Insurance', websiteUrl: 'https://www.fpg.com.ph', categorySlug: 'sigorta', seedUrls: ['https://www.fpg.com.ph/promos'] },
  { name: 'Charter Ping An', websiteUrl: 'https://www.charterpingan.com', categorySlug: 'sigorta', seedUrls: ['https://www.charterpingan.com/promos'] },

  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota Philippines', websiteUrl: 'https://www.toyota.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.ph/promos', 'https://www.toyota.com.ph/deals'] },
  { name: 'Mitsubishi Philippines', websiteUrl: 'https://www.mitsubishi-motors.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.com.ph/promos', 'https://www.mitsubishi-motors.com.ph/deals'] },
  { name: 'Honda Philippines', websiteUrl: 'https://www.hondaphil.com', categorySlug: 'otomobil', seedUrls: ['https://www.hondaphil.com/promos', 'https://www.hondaphil.com/deals'] },
  { name: 'Nissan Philippines', websiteUrl: 'https://www.nissan.ph', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.ph/offers.html', 'https://www.nissan.ph/promotions.html'] },
  { name: 'Suzuki Philippines', websiteUrl: 'https://www.suzuki.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.com.ph/promos'] },
  { name: 'Ford Philippines', websiteUrl: 'https://www.ford.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.ford.com.ph/offers/', 'https://www.ford.com.ph/promotions/'] },
  { name: 'Hyundai Philippines', websiteUrl: 'https://www.hyundai.com/ph', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/ph/en/offers', 'https://www.hyundai.com/ph/en/promos'] },
  { name: 'Kia Philippines', websiteUrl: 'https://www.kia.com/ph', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/ph/offers.html'] },
  { name: 'Mazda Philippines', websiteUrl: 'https://www.mazda.ph', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.ph/offers', 'https://www.mazda.ph/promos'] },
  { name: 'Subaru Philippines', websiteUrl: 'https://www.subaru.ph', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.ph/promos'] },
  { name: 'Isuzu Philippines', websiteUrl: 'https://www.isuzuphil.com', categorySlug: 'otomobil', seedUrls: ['https://www.isuzuphil.com/promos'] },
  { name: 'Chevrolet Philippines', websiteUrl: 'https://www.chevrolet.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.com.ph/offers'] },
  { name: 'MG Philippines', websiteUrl: 'https://www.mgmotor.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.com.ph/promos'] },
  { name: 'Geely Philippines', websiteUrl: 'https://www.geely.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.geely.com.ph/promos'] },
  { name: 'Chery Philippines', websiteUrl: 'https://www.cheryph.com', categorySlug: 'otomobil', seedUrls: ['https://www.cheryph.com/promos'] },
  { name: 'BYD Philippines', websiteUrl: 'https://www.byd.com/ph', categorySlug: 'otomobil', seedUrls: ['https://www.byd.com/ph/promos'] },
  { name: 'GWM Philippines', websiteUrl: 'https://www.gwm.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.gwm.com.ph/promos'] },
  { name: 'JAC Philippines', websiteUrl: 'https://www.jacmotors.ph', categorySlug: 'otomobil', seedUrls: ['https://www.jacmotors.ph/promos'] },
  { name: 'BAIC Philippines', websiteUrl: 'https://www.baicphilippines.com', categorySlug: 'otomobil', seedUrls: ['https://www.baicphilippines.com/promos'] },
  { name: 'Foton Philippines', websiteUrl: 'https://www.foton.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.foton.com.ph/promos'] },
  { name: 'BMW Philippines', websiteUrl: 'https://www.bmw.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.ph/en/offers.html'] },
  { name: 'Mercedes-Benz Philippines', websiteUrl: 'https://www.mercedes-benz.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.ph/en/passengercars/campaigns-and-offers.html'] },
  { name: 'Volkswagen Philippines', websiteUrl: 'https://www.volkswagen.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.com.ph/en/offers.html'] },
  { name: 'Volvo Philippines', websiteUrl: 'https://www.volvocars.com/ph', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/ph/offers/'] },
  { name: 'AutoDeal', websiteUrl: 'https://www.autodeal.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.autodeal.com.ph/promos', 'https://www.autodeal.com.ph/deals'] },
  { name: 'Carmudi Philippines', websiteUrl: 'https://www.carmudi.com.ph', categorySlug: 'otomobil', seedUrls: ['https://www.carmudi.com.ph/promos'] },
  { name: 'Tsikot', websiteUrl: 'https://www.tsikot.com', categorySlug: 'otomobil', seedUrls: ['https://www.tsikot.com/promos'] },
  { name: 'OLX Autos Philippines', websiteUrl: 'https://www.olx.com.ph/autos', categorySlug: 'otomobil', seedUrls: ['https://www.olx.com.ph/autos/promos'] },
  { name: 'Carousell Cars', websiteUrl: 'https://www.carousell.ph/categories/cars', categorySlug: 'otomobil', seedUrls: ['https://www.carousell.ph/categories/cars/'] },
  { name: 'Zigwheels Philippines', websiteUrl: 'https://www.zigwheels.ph', categorySlug: 'otomobil', seedUrls: ['https://www.zigwheels.ph/promos', 'https://www.zigwheels.ph/deals'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'National Book Store PH', websiteUrl: 'https://www.nationalbookstore.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nationalbookstore.com/sale', 'https://www.nationalbookstore.com/promos'] },
  { name: 'Fully Booked', websiteUrl: 'https://www.fullybookedonline.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.fullybookedonline.com/sale', 'https://www.fullybookedonline.com/promos'] },
  { name: 'Books For Less', websiteUrl: 'https://www.booksforless.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.booksforless.ph/sale'] },
  { name: 'Powerbooks', websiteUrl: 'https://www.powerbooks.com.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.powerbooks.com.ph/sale'] },
  { name: 'Precious Pages', websiteUrl: 'https://www.preciouspages.com.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.preciouspages.com.ph/sale'] },
  { name: 'Rex Bookstore', websiteUrl: 'https://www.rexbookstore.com.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.rexbookstore.com.ph/sale', 'https://www.rexbookstore.com.ph/promos'] },
  { name: 'Shopee Books PH', websiteUrl: 'https://shopee.ph/mall/books', categorySlug: 'kitap-hobi', seedUrls: ['https://shopee.ph/mall/books'] },
  { name: 'Lazada Books PH', websiteUrl: 'https://www.lazada.com.ph/catalog/?q=books', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lazada.com.ph/catalog/?q=books+sale'] },
  { name: 'Spotify Philippines', websiteUrl: 'https://www.spotify.com/ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/ph/premium/'] },
  { name: 'Apple Music Philippines', websiteUrl: 'https://www.apple.com/ph/apple-music', categorySlug: 'kitap-hobi', seedUrls: ['https://www.apple.com/ph/apple-music/'] },
  { name: 'Netflix Philippines', websiteUrl: 'https://www.netflix.com/ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/ph/'] },
  { name: 'Disney+ Philippines', websiteUrl: 'https://www.disneyplus.com/ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/ph/'] },
  { name: 'HBO Go Philippines', websiteUrl: 'https://www.hbogoasia.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hbogoasia.ph/'] },
  { name: 'Viu Philippines', websiteUrl: 'https://www.viu.com/ott/ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.viu.com/ott/ph/en/'] },
  { name: 'iWantTFC', websiteUrl: 'https://www.iwanttfc.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.iwanttfc.com/'] },
  { name: 'GMA Network', websiteUrl: 'https://www.gmanetwork.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gmanetwork.com/entertainment/'] },
  { name: 'PlayStation Philippines', websiteUrl: 'https://store.playstation.com/en-ph', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/en-ph/category/deals'] },
  { name: 'Nintendo Philippines', websiteUrl: 'https://www.nintendo.com/ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/ph/games/sales-and-deals/'] },
  { name: 'Xbox Philippines', websiteUrl: 'https://www.xbox.com/en-PH', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/en-PH/promotions/sales/sales-and-specials'] },
  { name: 'Steam Philippines', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'DataBlitz PH', websiteUrl: 'https://www.datablitz.com.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.datablitz.com.ph/collections/sale'] },
  { name: 'iTech', websiteUrl: 'https://www.itech.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.itech.ph/sale'] },
  { name: 'Game One', websiteUrl: 'https://www.gameone.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gameone.ph/sale', 'https://www.gameone.ph/promos'] },
  { name: 'Hobbes & Landes', websiteUrl: 'https://www.hobbesandlandes.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbesandlandes.com/sale'] },
  { name: 'Lego Philippines', websiteUrl: 'https://www.lego.com/en-ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-ph/categories/sales-and-deals'] },
  { name: 'Toy Kingdom', websiteUrl: 'https://www.toykingdom.com.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toykingdom.com.ph/sale', 'https://www.toykingdom.com.ph/promos'] },
  { name: 'Toys R Us Philippines', websiteUrl: 'https://www.toysrus.com.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.com.ph/sale', 'https://www.toysrus.com.ph/promos'] },
  { name: 'Miniso Philippines', websiteUrl: 'https://www.miniso.com/ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.miniso.com/ph/promos'] },
  { name: 'Daiso Philippines', websiteUrl: 'https://www.daisoph.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.daisoph.com/promos'] },
  { name: 'Japan Home Centre', websiteUrl: 'https://www.japanhomecentre.com.ph', categorySlug: 'kitap-hobi', seedUrls: ['https://www.japanhomecentre.com.ph/promos'] },
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
  console.log('=== PH Brand Seeding Script ===\n');

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
        where: { slug_market: { slug, market: 'PH' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'PH',
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
            market: 'PH',
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'PH' },
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
  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'PH' } });
  console.log(`Total active PH sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=PH');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
