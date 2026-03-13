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

// ── ALL CA BRANDS DATA ──────────────────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon CA', websiteUrl: 'https://www.amazon.ca', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.ca/deals', 'https://www.amazon.ca/gp/goldbox'] },
  { name: 'Walmart Canada', websiteUrl: 'https://www.walmart.ca', categorySlug: 'alisveris', seedUrls: ['https://www.walmart.ca/rollbacks'] },
  { name: 'Costco Canada', websiteUrl: 'https://www.costco.ca', categorySlug: 'alisveris', seedUrls: ['https://www.costco.ca/CatalogSearch?dept=All&keyword=deals', 'https://www.costco.ca/saving-centre.html'] },
  { name: 'Hudson\'s Bay', websiteUrl: 'https://www.thebay.com', categorySlug: 'alisveris', seedUrls: ['https://www.thebay.com/c/sale', 'https://www.thebay.com/c/deals'] },
  { name: 'eBay Canada', websiteUrl: 'https://www.ebay.ca', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.ca/deals'] },
  { name: 'Best Buy Canada', websiteUrl: 'https://www.bestbuy.ca', categorySlug: 'alisveris', seedUrls: ['https://www.bestbuy.ca/en-ca/collection/top-deals/36005', 'https://www.bestbuy.ca/en-ca/collection/clearance-sale/36582'] },
  { name: 'Staples Canada', websiteUrl: 'https://www.staples.ca', categorySlug: 'alisveris', seedUrls: ['https://www.staples.ca/collections/deals-1', 'https://www.staples.ca/collections/clearance-centre-350'] },
  { name: 'London Drugs', websiteUrl: 'https://www.londondrugs.com', categorySlug: 'alisveris', seedUrls: ['https://www.londondrugs.com/on-sale/', 'https://www.londondrugs.com/clearance/'] },
  { name: 'Giant Tiger', websiteUrl: 'https://www.gianttiger.com', categorySlug: 'alisveris', seedUrls: ['https://www.gianttiger.com/collections/clearance'] },
  { name: 'Home Hardware', websiteUrl: 'https://www.homehardware.ca', categorySlug: 'alisveris', seedUrls: ['https://www.homehardware.ca/en/sale', 'https://www.homehardware.ca/en/flyer'] },
  { name: 'Simons', websiteUrl: 'https://www.simons.ca', categorySlug: 'alisveris', seedUrls: ['https://www.simons.ca/en/promo', 'https://www.simons.ca/en/sale'] },
  { name: 'Shopify Deals', websiteUrl: 'https://www.shopify.ca', categorySlug: 'alisveris', seedUrls: ['https://www.shopify.ca/pricing'] },
  { name: 'RedFlagDeals', websiteUrl: 'https://www.redflagdeals.com', categorySlug: 'alisveris', seedUrls: ['https://www.redflagdeals.com/deals/'] },
  { name: 'SmartCanucks', websiteUrl: 'https://www.smartcanucks.ca', categorySlug: 'alisveris', seedUrls: ['https://www.smartcanucks.ca/deals/'] },
  { name: 'Rakuten Canada', websiteUrl: 'https://www.rakuten.ca', categorySlug: 'alisveris', seedUrls: ['https://www.rakuten.ca/deals', 'https://www.rakuten.ca/hot-deals'] },
  { name: 'Visions Electronics', websiteUrl: 'https://www.visions.ca', categorySlug: 'alisveris', seedUrls: ['https://www.visions.ca/promotions', 'https://www.visions.ca/clearance'] },
  { name: 'Cabela\'s Canada', websiteUrl: 'https://www.cabelas.ca', categorySlug: 'alisveris', seedUrls: ['https://www.cabelas.ca/category/bargain-cave/1499', 'https://www.cabelas.ca/pages/deals'] },
  { name: 'Winners', websiteUrl: 'https://www.winners.ca', categorySlug: 'alisveris', seedUrls: ['https://www.winners.ca/en/deals'] },
  { name: 'HomeSense Canada', websiteUrl: 'https://www.homesense.ca', categorySlug: 'alisveris', seedUrls: ['https://www.homesense.ca/en/new-arrivals'] },
  { name: 'Marshalls Canada', websiteUrl: 'https://www.marshalls.ca', categorySlug: 'alisveris', seedUrls: ['https://www.marshalls.ca/en/new-arrivals'] },
  { name: 'Real Canadian Superstore', websiteUrl: 'https://www.realcanadiansuperstore.ca', categorySlug: 'alisveris', seedUrls: ['https://www.realcanadiansuperstore.ca/deals'] },
  { name: 'TSC Canada', websiteUrl: 'https://www.tsc.ca', categorySlug: 'alisveris', seedUrls: ['https://www.tsc.ca/deals', 'https://www.tsc.ca/clearance'] },
  { name: 'Lee Valley', websiteUrl: 'https://www.leevalley.com', categorySlug: 'alisveris', seedUrls: ['https://www.leevalley.com/en-ca/shop/sale'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Best Buy Electronics CA', websiteUrl: 'https://www.bestbuy.ca', categorySlug: 'elektronik', seedUrls: ['https://www.bestbuy.ca/en-ca/collection/top-deals/36005', 'https://www.bestbuy.ca/en-ca/category/laptops-on-sale/36697'] },
  { name: 'Memory Express', websiteUrl: 'https://www.memoryexpress.com', categorySlug: 'elektronik', seedUrls: ['https://www.memoryexpress.com/Sale', 'https://www.memoryexpress.com/Clearance'] },
  { name: 'Samsung Canada', websiteUrl: 'https://www.samsung.com/ca', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/ca/offer/', 'https://www.samsung.com/ca/smartphones/all-smartphones/'] },
  { name: 'Dell Canada', websiteUrl: 'https://www.dell.com/en-ca', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-ca/shop/deals'] },
  { name: 'HP Canada', websiteUrl: 'https://www.hp.com/ca-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/ca-en/shop/offer.aspx?p=c-deals'] },
  { name: 'Lenovo Canada', websiteUrl: 'https://www.lenovo.com/ca/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/ca/en/d/deals/'] },
  { name: 'LG Canada', websiteUrl: 'https://www.lg.com/ca_en', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/ca_en/promotions'] },
  { name: 'Google Store CA', websiteUrl: 'https://store.google.com/ca', categorySlug: 'elektronik', seedUrls: ['https://store.google.com/ca/collection/offers'] },
  { name: 'Visions Electronics Tech', websiteUrl: 'https://www.visions.ca', categorySlug: 'elektronik', seedUrls: ['https://www.visions.ca/promotions', 'https://www.visions.ca/catalogue/category/computers.aspx'] },
  { name: 'London Drugs Electronics', websiteUrl: 'https://www.londondrugs.com', categorySlug: 'elektronik', seedUrls: ['https://www.londondrugs.com/electronics/', 'https://www.londondrugs.com/electronics/on-sale/'] },
  { name: 'Staples Tech CA', websiteUrl: 'https://www.staples.ca', categorySlug: 'elektronik', seedUrls: ['https://www.staples.ca/collections/technology-deals-369'] },
  { name: 'Amazon CA Electronics', websiteUrl: 'https://www.amazon.ca', categorySlug: 'elektronik', seedUrls: ['https://www.amazon.ca/deals?category=electronics'] },
  { name: 'B&H Photo CA', websiteUrl: 'https://www.bhphotovideo.com', categorySlug: 'elektronik', seedUrls: ['https://www.bhphotovideo.com/c/browse/Deal-Zone/ci/702/N/4294543665'] },
  { name: 'PlayStation Canada', websiteUrl: 'https://store.playstation.com/en-ca', categorySlug: 'elektronik', seedUrls: ['https://store.playstation.com/en-ca/category/deals/'] },
  { name: 'ASUS Canada', websiteUrl: 'https://www.asus.com/ca-en', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/ca-en/deals/'] },
  { name: 'Acer Canada', websiteUrl: 'https://store.acer.com/en-ca', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/en-ca/sale'] },
  // ═══════════════════════════════════════════════════════
  // 3) Fashion (giyim-moda) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Aritzia', websiteUrl: 'https://www.aritzia.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.aritzia.com/en/sale'] },
  { name: 'Roots', websiteUrl: 'https://www.roots.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.roots.com/ca/en/sale/'] },
  { name: 'Joe Fresh', websiteUrl: 'https://www.joefresh.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.joefresh.com/ca/Sale/c/sale'] },
  { name: 'H&M Canada', websiteUrl: 'https://www2.hm.com/en_ca', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/en_ca/sale.html'] },
  { name: 'Zara Canada', websiteUrl: 'https://www.zara.com/ca', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/ca/en/z-sale-l1702.html'] },
  { name: 'Gap Canada', websiteUrl: 'https://www.gapcanada.ca', categorySlug: 'giyim-moda', seedUrls: ['https://www.gapcanada.ca/browse/category.do?cid=1143581'] },
  { name: 'Old Navy Canada', websiteUrl: 'https://oldnavy.gapcanada.ca', categorySlug: 'giyim-moda', seedUrls: ['https://oldnavy.gapcanada.ca/browse/category.do?cid=1143581'] },
  { name: 'Banana Republic Canada', websiteUrl: 'https://bananarepublic.gapcanada.ca', categorySlug: 'giyim-moda', seedUrls: ['https://bananarepublic.gapcanada.ca/browse/category.do?cid=1143581'] },
  { name: 'Club Monaco', websiteUrl: 'https://www.clubmonaco.ca', categorySlug: 'giyim-moda', seedUrls: ['https://www.clubmonaco.ca/en/sale'] },
  { name: 'Ssense', websiteUrl: 'https://www.ssense.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.ssense.com/en-ca/sale'] },
  { name: 'Simons Fashion', websiteUrl: 'https://www.simons.ca', categorySlug: 'giyim-moda', seedUrls: ['https://www.simons.ca/en/sale--women', 'https://www.simons.ca/en/sale--men'] },
  { name: 'Mark\'s', websiteUrl: 'https://www.marks.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.marks.com/en/sale.html', 'https://www.marks.com/en/deals.html'] },
  { name: 'Sport Chek Fashion', websiteUrl: 'https://www.sportchek.ca', categorySlug: 'giyim-moda', seedUrls: ['https://www.sportchek.ca/sale.html'] },
  { name: 'Dynamite', websiteUrl: 'https://www.dynamiteclothing.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.dynamiteclothing.com/ca/sale'] },
  { name: 'Garage Clothing', websiteUrl: 'https://www.garageclothing.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.garageclothing.com/ca/sale'] },
  { name: 'Reitmans', websiteUrl: 'https://www.reitmans.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.reitmans.com/en/sale/'] },
  { name: 'Penningtons', websiteUrl: 'https://www.penningtons.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.penningtons.com/en/sale/'] },
  { name: 'Addition Elle', websiteUrl: 'https://www.additionelle.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.additionelle.com/en/sale/'] },
  { name: 'Nike Canada', websiteUrl: 'https://www.nike.com/ca', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/ca/w/sale-3yaep'] },
  { name: 'Adidas Canada', websiteUrl: 'https://www.adidas.ca', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.ca/en/sale'] },
  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA Canada', websiteUrl: 'https://www.ikea.com/ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/ca/en/offers/', 'https://www.ikea.com/ca/en/cat/last-chance-702/'] },
  { name: 'Wayfair Canada', websiteUrl: 'https://www.wayfair.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.wayfair.ca/deals', 'https://www.wayfair.ca/daily-sales'] },
  { name: 'Structube', websiteUrl: 'https://www.structube.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.structube.com/en_ca/sale'] },
  { name: 'Crate and Barrel Canada', websiteUrl: 'https://www.crateandbarrel.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.crateandbarrel.ca/sale'] },
  { name: 'West Elm Canada', websiteUrl: 'https://www.westelm.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.westelm.ca/shop/sale/'] },
  { name: 'Pottery Barn Canada', websiteUrl: 'https://www.potterybarn.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.potterybarn.ca/shop/sale/'] },
  { name: 'Home Depot Canada', websiteUrl: 'https://www.homedepot.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.homedepot.ca/en/home/categories/deals.html', 'https://www.homedepot.ca/en/home/categories/clearance.html'] },
  { name: 'Lowe\'s Canada', websiteUrl: 'https://www.lowes.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.lowes.ca/deals', 'https://www.lowes.ca/clearance'] },
  { name: 'Rona', websiteUrl: 'https://www.rona.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.rona.ca/en/promotions', 'https://www.rona.ca/en/clearance'] },
  { name: 'HomeSense', websiteUrl: 'https://www.homesense.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.homesense.ca/en/new-arrivals'] },
  { name: 'Bouclair', websiteUrl: 'https://www.bouclair.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.bouclair.com/en/sale/'] },
  { name: 'Article', websiteUrl: 'https://www.article.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.article.com/sale'] },
  { name: 'Leon\'s', websiteUrl: 'https://www.leons.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.leons.ca/collections/deals', 'https://www.leons.ca/collections/clearance'] },
  { name: 'Sleep Country', websiteUrl: 'https://www.sleepcountry.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.sleepcountry.ca/promotions', 'https://www.sleepcountry.ca/sale'] },
  { name: 'Restoration Hardware CA', websiteUrl: 'https://www.rh.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.rh.com/catalog/category/products.jsp?categoryId=cat10210008'] },
  { name: 'CB2 Canada', websiteUrl: 'https://www.cb2.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.cb2.ca/sale/'] },
  { name: 'Kitchen Stuff Plus', websiteUrl: 'https://www.kitchenstuffplus.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.kitchenstuffplus.com/sale', 'https://www.kitchenstuffplus.com/red-hot-deals'] },
  { name: 'Pier 1 Canada', websiteUrl: 'https://www.pier1.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.pier1.ca/collections/sale'] },
  { name: 'Home Hardware Living', websiteUrl: 'https://www.homehardware.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.homehardware.ca/en/cat/home-decor-c2500', 'https://www.homehardware.ca/en/sale'] },
  { name: 'Mobilia', websiteUrl: 'https://www.mobilia.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.mobilia.ca/en/sale'] },
  { name: 'Williams-Sonoma Canada', websiteUrl: 'https://www.williams-sonoma.ca', categorySlug: 'ev-yasam', seedUrls: ['https://www.williams-sonoma.ca/shop/sale/'] },
  { name: 'Linen Chest', websiteUrl: 'https://www.linenchest.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.linenchest.com/en/sale.html'] },

  // ═══════════════════════════════════════════════════════
  // 5) Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'No Frills', websiteUrl: 'https://www.nofrills.ca', categorySlug: 'gida-market', seedUrls: ['https://www.nofrills.ca/deals', 'https://www.nofrills.ca/print-flyer'] },
  { name: 'Loblaws', websiteUrl: 'https://www.loblaws.ca', categorySlug: 'gida-market', seedUrls: ['https://www.loblaws.ca/deals', 'https://www.loblaws.ca/print-flyer'] },
  { name: 'Metro Ontario', websiteUrl: 'https://www.metro.ca', categorySlug: 'gida-market', seedUrls: ['https://www.metro.ca/en/flyer', 'https://www.metro.ca/en/online-grocery/deals'] },
  { name: 'Sobeys', websiteUrl: 'https://www.sobeys.com', categorySlug: 'gida-market', seedUrls: ['https://www.sobeys.com/en/flyer/', 'https://www.sobeys.com/en/promotions/'] },
  { name: 'FreshCo', websiteUrl: 'https://www.freshco.com', categorySlug: 'gida-market', seedUrls: ['https://www.freshco.com/flyer/'] },
  { name: 'Food Basics', websiteUrl: 'https://www.foodbasics.ca', categorySlug: 'gida-market', seedUrls: ['https://www.foodbasics.ca/flyer'] },
  { name: 'Save-On-Foods', websiteUrl: 'https://www.saveonfoods.com', categorySlug: 'gida-market', seedUrls: ['https://www.saveonfoods.com/flyer/', 'https://www.saveonfoods.com/promotions/'] },
  { name: 'IGA Canada', websiteUrl: 'https://www.iga.net', categorySlug: 'gida-market', seedUrls: ['https://www.iga.net/en/flyer', 'https://www.iga.net/en/online-grocery/deals'] },
  { name: 'Maxi', websiteUrl: 'https://www.maxi.ca', categorySlug: 'gida-market', seedUrls: ['https://www.maxi.ca/deals', 'https://www.maxi.ca/print-flyer'] },
  { name: 'Provigo', websiteUrl: 'https://www.provigo.ca', categorySlug: 'gida-market', seedUrls: ['https://www.provigo.ca/deals', 'https://www.provigo.ca/print-flyer'] },
  { name: 'Walmart Grocery CA', websiteUrl: 'https://www.walmart.ca', categorySlug: 'gida-market', seedUrls: ['https://www.walmart.ca/browse/grocery/10019'] },
  { name: 'Costco Grocery CA', websiteUrl: 'https://www.costco.ca', categorySlug: 'gida-market', seedUrls: ['https://www.costco.ca/grocery-702.html'] },
  { name: 'T&T Supermarket', websiteUrl: 'https://www.tntsupermarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.tntsupermarket.com/flyer.html', 'https://www.tntsupermarket.com/weekly-deals.html'] },
  { name: 'Shoppers Drug Mart Grocery', websiteUrl: 'https://www.shoppersdrugmart.ca', categorySlug: 'gida-market', seedUrls: ['https://www.shoppersdrugmart.ca/en/deals'] },
  { name: 'Superstore', websiteUrl: 'https://www.realcanadiansuperstore.ca', categorySlug: 'gida-market', seedUrls: ['https://www.realcanadiansuperstore.ca/deals', 'https://www.realcanadiansuperstore.ca/print-flyer'] },
  { name: 'Atlantic Superstore', websiteUrl: 'https://www.atlanticsuperstore.ca', categorySlug: 'gida-market', seedUrls: ['https://www.atlanticsuperstore.ca/deals', 'https://www.atlanticsuperstore.ca/print-flyer'] },
  { name: 'Farm Boy', websiteUrl: 'https://www.farmboy.ca', categorySlug: 'gida-market', seedUrls: ['https://www.farmboy.ca/flyer/'] },
  { name: 'Safeway Canada', websiteUrl: 'https://www.safeway.ca', categorySlug: 'gida-market', seedUrls: ['https://www.safeway.ca/flyer'] },
  { name: 'PC Express', websiteUrl: 'https://www.pcexpress.ca', categorySlug: 'gida-market', seedUrls: ['https://www.pcexpress.ca/deals'] },
  { name: 'Whole Foods Canada', websiteUrl: 'https://www.wholefoodsmarket.com/stores/list/canada', categorySlug: 'gida-market', seedUrls: ['https://www.wholefoodsmarket.com/sales-flyer'] },
  { name: 'Longo\'s Brothers', websiteUrl: 'https://www.longos.com', categorySlug: 'gida-market', seedUrls: ['https://www.longos.com/flyer'] },
  { name: 'Fortinos', websiteUrl: 'https://www.fortinos.ca', categorySlug: 'gida-market', seedUrls: ['https://www.fortinos.ca/deals', 'https://www.fortinos.ca/print-flyer'] },
  { name: 'Foodland Ontario', websiteUrl: 'https://www.foodland.ca', categorySlug: 'gida-market', seedUrls: ['https://www.foodland.ca/deals', 'https://www.foodland.ca/print-flyer'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Drink / Restaurants (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tim Hortons', websiteUrl: 'https://www.timhortons.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.timhortons.ca/offers', 'https://www.timhortons.ca/promotions'] },
  { name: 'McDonald\'s Canada', websiteUrl: 'https://www.mcdonalds.com/ca/en-ca.html', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com/ca/en-ca/deals.html'] },
  { name: 'Starbucks Canada', websiteUrl: 'https://www.starbucks.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.ca/menu/promotions'] },
  { name: 'A&W Canada', websiteUrl: 'https://web.aw.ca', categorySlug: 'yeme-icme', seedUrls: ['https://web.aw.ca/en/our-menu/deals', 'https://web.aw.ca/en/promotions'] },
  { name: 'Wendy\'s Canada', websiteUrl: 'https://www.wendys.com/en-ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.wendys.com/en-ca/deals'] },
  { name: 'Burger King Canada', websiteUrl: 'https://www.burgerking.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.ca/offers'] },
  { name: 'Pizza Pizza', websiteUrl: 'https://www.pizzapizza.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzapizza.ca/promotions', 'https://www.pizzapizza.ca/deals'] },
  { name: 'Domino\'s Canada', websiteUrl: 'https://www.dominos.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.ca/pages/order/coupon'] },
  { name: 'Pizza Hut Canada', websiteUrl: 'https://www.pizzahut.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.ca/deals'] },
  { name: 'KFC Canada', websiteUrl: 'https://www.kfc.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.ca/deals', 'https://www.kfc.ca/promotions'] },
  { name: 'Swiss Chalet', websiteUrl: 'https://www.swisschalet.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.swisschalet.com/promotions', 'https://www.swisschalet.com/deals'] },
  { name: 'Harvey\'s', websiteUrl: 'https://www.harveys.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.harveys.ca/en/deals', 'https://www.harveys.ca/en/promotions'] },
  { name: 'Mary Brown\'s', websiteUrl: 'https://www.marybrowns.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.marybrowns.com/offers', 'https://www.marybrowns.com/promotions'] },
  { name: 'Boston Pizza', websiteUrl: 'https://bostonpizza.com', categorySlug: 'yeme-icme', seedUrls: ['https://bostonpizza.com/en/promotions.html'] },
  { name: 'The Keg', websiteUrl: 'https://www.thekeg.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.thekeg.com/promotions'] },
  { name: 'Montana\'s', websiteUrl: 'https://www.montanas.ca', categorySlug: 'yeme-icme', seedUrls: ['https://www.montanas.ca/promotions'] },
  { name: 'East Side Mario\'s', websiteUrl: 'https://www.eastsidemarios.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.eastsidemarios.com/promotions'] },
  { name: 'DoorDash Canada', websiteUrl: 'https://www.doordash.com/en-CA', categorySlug: 'yeme-icme', seedUrls: ['https://www.doordash.com/en-CA/promos/'] },
  { name: 'Uber Eats Canada', websiteUrl: 'https://www.ubereats.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/ca/deals'] },
  { name: 'Skip The Dishes', websiteUrl: 'https://www.skipthedishes.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.skipthedishes.com/deals'] },
  { name: 'St-Hubert', websiteUrl: 'https://www.st-hubert.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.st-hubert.com/en/promotions.html'] },
  { name: 'New York Fries', websiteUrl: 'https://www.newyorkfries.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.newyorkfries.com/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty & Personal Care (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Shoppers Drug Mart', websiteUrl: 'https://www.shoppersdrugmart.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.shoppersdrugmart.ca/en/deals', 'https://www.shoppersdrugmart.ca/en/beauty/deals'] },
  { name: 'Sephora Canada', websiteUrl: 'https://www.sephora.com/ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.com/ca/en/sale', 'https://www.sephora.com/ca/en/beauty/beauty-deals'] },
  { name: 'Bath and Body Works Canada', websiteUrl: 'https://www.bathandbodyworks.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.ca/c/sale'] },
  { name: 'Lush Canada', websiteUrl: 'https://www.lush.com/ca/en', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/ca/en/c/sale'] },
  { name: 'L\'Oreal Canada', websiteUrl: 'https://www.loreal-paris.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.ca/offers', 'https://www.loreal-paris.ca/promotions'] },
  { name: 'Clinique Canada', websiteUrl: 'https://www.clinique.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.ca/offers'] },
  { name: 'Rexall', websiteUrl: 'https://www.rexall.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rexall.ca/deals', 'https://www.rexall.ca/flyer'] },
  { name: 'Jean Coutu', websiteUrl: 'https://www.jeancoutu.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.jeancoutu.com/en/promotions/', 'https://www.jeancoutu.com/en/flyer/'] },
  { name: 'Pharmaprix', websiteUrl: 'https://www.pharmaprix.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pharmaprix.ca/en/deals'] },
  { name: 'NYX Canada', websiteUrl: 'https://www.nyxcosmetics.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.ca/en/sale'] },
  { name: 'Urban Decay CA', websiteUrl: 'https://www.urbandecay.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.urbandecay.ca/en/sale'] },
  { name: 'Kiehls Canada', websiteUrl: 'https://www.kiehls.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.ca/en/offers'] },
  { name: 'Lancome Canada', websiteUrl: 'https://www.lancome.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lancome.ca/offers'] },
  { name: 'Quo Beauty', websiteUrl: 'https://www.shoppersdrugmart.ca/en/beauty/quo', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.shoppersdrugmart.ca/en/beauty/quo/deals'] },
  { name: 'Yves Rocher Canada', websiteUrl: 'https://www.yvesrocher.ca', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yvesrocher.ca/control/main?externalCatalogId=1000&catalogType=M'] },
  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sport Chek', websiteUrl: 'https://www.sportchek.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportchek.ca/sale.html'] },
  { name: 'Atmosphere', websiteUrl: 'https://www.atmosphere.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.atmosphere.ca/sale.html'] },
  { name: 'MEC', websiteUrl: 'https://www.mec.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mec.ca/en/explore/deals', 'https://www.mec.ca/en/products/clearance'] },
  { name: 'Decathlon Canada', websiteUrl: 'https://www.decathlon.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.ca/en/sale', 'https://www.decathlon.ca/en/deals'] },
  { name: 'Nike Canada Sports', websiteUrl: 'https://www.nike.com/ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/ca/w/sale-3yaep'] },
  { name: 'Puma Canada', websiteUrl: 'https://ca.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://ca.puma.com/ca/en/sale'] },
  { name: 'New Balance Canada', websiteUrl: 'https://www.newbalance.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.ca/en_ca/sale/'] },
  { name: 'The North Face Canada', websiteUrl: 'https://www.thenorthface.com/en-ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com/en-ca/sale'] },
  { name: 'Columbia Canada', websiteUrl: 'https://www.columbiasportswear.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.ca/en/sale/'] },
  { name: 'Patagonia Canada', websiteUrl: 'https://www.patagonia.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.patagonia.ca/shop/web-specials'] },
  { name: 'Arc\'teryx', websiteUrl: 'https://arcteryx.com', categorySlug: 'spor-outdoor', seedUrls: ['https://arcteryx.com/ca/en/c/outlet'] },
  { name: 'Canada Goose', websiteUrl: 'https://www.canadagoose.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.canadagoose.com/ca/en/sale/'] },
  { name: 'Sail', websiteUrl: 'https://www.sail.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sail.ca/en/promotions'] },
  { name: 'Sporting Life', websiteUrl: 'https://www.sportinglife.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportinglife.ca/collections/sale'] },
  { name: 'Altitude Sports', websiteUrl: 'https://www.altitude-sports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.altitude-sports.com/collections/sale'] },
  { name: 'Bass Pro Shops Canada', websiteUrl: 'https://www.basspro.com/shop/en/ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.basspro.com/shop/en/ca/sale'] },
  { name: 'Cabela\'s Outdoors', websiteUrl: 'https://www.cabelas.ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.cabelas.ca/category/bargain-cave/1499'] },
  { name: 'Running Room', websiteUrl: 'https://www.runningroom.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.runningroom.com/collections/sale'] },
  { name: 'Pro Hockey Life', websiteUrl: 'https://www.prohockeylife.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.prohockeylife.com/collections/clearance'] },
  { name: 'Asics Canada', websiteUrl: 'https://www.asics.com/ca/en-ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/ca/en-ca/sale/'] },
  { name: 'Brooks Canada', websiteUrl: 'https://www.brooksrunning.com/en_ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.brooksrunning.com/en_ca/sale/'] },
  { name: 'Helly Hansen Canada', websiteUrl: 'https://www.hellyhansen.com/en_ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.com/en_ca/sale'] },
  { name: 'Salomon Canada', websiteUrl: 'https://www.salomon.com/en-ca', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/en-ca/sale/'] },
  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'WestJet', websiteUrl: 'https://www.westjet.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.westjet.com/en-ca/deals'] },
  { name: 'Porter Airlines', websiteUrl: 'https://www.flyporter.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flyporter.com/en/deals-and-offers'] },
  { name: 'Flair Airlines', websiteUrl: 'https://flyflair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://flyflair.com/deals'] },
  { name: 'Swoop', websiteUrl: 'https://www.flyswoop.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flyswoop.com/deals/'] },
  { name: 'Expedia Canada', websiteUrl: 'https://www.expedia.ca', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.ca/deals', 'https://www.expedia.ca/coupons'] },
  { name: 'Booking.com Canada', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.en-ca.html'] },
  { name: 'Kayak Canada', websiteUrl: 'https://www.ca.kayak.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ca.kayak.com/deals'] },
  { name: 'FlightHub', websiteUrl: 'https://www.flighthub.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flighthub.com/deals'] },
  { name: 'Transat', websiteUrl: 'https://www.airtransat.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airtransat.com/en-CA/deals-and-promotions'] },
  { name: 'Travelocity Canada', websiteUrl: 'https://www.travelocity.ca', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travelocity.ca/deals'] },
  { name: 'Rocky Mountaineer', websiteUrl: 'https://www.rockymountaineer.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rockymountaineer.com/promotions'] },
  { name: 'Greyhound Canada', websiteUrl: 'https://www.greyhound.ca', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.greyhound.ca/en/deals-and-promotions'] },
  { name: 'Enterprise Canada', websiteUrl: 'https://www.enterprise.ca', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.enterprise.ca/en/car-rental/deals.html'] },
  { name: 'Budget Canada', websiteUrl: 'https://www.budget.ca', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.budget.ca/en/deals'] },
  { name: 'Hertz Canada', websiteUrl: 'https://www.hertz.ca', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.ca/rentacar/Car-rental-deals'] },
  { name: 'Avis Canada', websiteUrl: 'https://www.avis.ca', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avis.ca/en/offers'] },
  { name: 'Hilton Canada', websiteUrl: 'https://www.hilton.com/en/offers/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hilton.com/en/offers/'] },
  { name: 'Fairmont Hotels', websiteUrl: 'https://www.fairmont.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fairmont.com/promotions/'] },
  { name: 'Turo Canada', websiteUrl: 'https://turo.com/ca/en', categorySlug: 'seyahat-ulasim', seedUrls: ['https://turo.com/ca/en/deals'] },
  { name: 'Redtag.ca', websiteUrl: 'https://www.redtag.ca', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.redtag.ca/deals/'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'TD Canada Trust', websiteUrl: 'https://www.td.com', categorySlug: 'finans', seedUrls: ['https://www.td.com/ca/en/personal-banking/special-offers'] },
  { name: 'CIBC', websiteUrl: 'https://www.cibc.com', categorySlug: 'finans', seedUrls: ['https://www.cibc.com/en/special-offers.html'] },
  { name: 'Tangerine', websiteUrl: 'https://www.tangerine.ca', categorySlug: 'finans', seedUrls: ['https://www.tangerine.ca/en/landing-page/offers'] },
  { name: 'Simplii Financial', websiteUrl: 'https://www.simplii.com', categorySlug: 'finans', seedUrls: ['https://www.simplii.com/en/special-offers.html'] },
  { name: 'Questrade', websiteUrl: 'https://www.questrade.com', categorySlug: 'finans', seedUrls: ['https://www.questrade.com/offers'] },
  { name: 'PC Financial', websiteUrl: 'https://www.pcfinancial.ca', categorySlug: 'finans', seedUrls: ['https://www.pcfinancial.ca/en/credit-cards/offers/'] },
  { name: 'MBNA Canada', websiteUrl: 'https://www.mbna.ca', categorySlug: 'finans', seedUrls: ['https://www.mbna.ca/credit-cards/overview/promotions/'] },
  { name: 'Rogers Bank', websiteUrl: 'https://www.rogersbank.com', categorySlug: 'finans', seedUrls: ['https://www.rogersbank.com/en/offers'] },
  { name: 'Scotiabank Scene', websiteUrl: 'https://www.scene.ca', categorySlug: 'finans', seedUrls: ['https://www.scene.ca/offers/'] },
  { name: 'Ratehub.ca', websiteUrl: 'https://www.ratehub.ca', categorySlug: 'finans', seedUrls: ['https://www.ratehub.ca/credit-cards/best-credit-cards', 'https://www.ratehub.ca/best-mortgage-rates'] },
  { name: 'LowestRates.ca', websiteUrl: 'https://www.lowestrates.ca', categorySlug: 'finans', seedUrls: ['https://www.lowestrates.ca/credit-cards', 'https://www.lowestrates.ca/insurance'] },
  { name: 'Meridian Credit Union', websiteUrl: 'https://www.meridiancu.ca', categorySlug: 'finans', seedUrls: ['https://www.meridiancu.ca/offers'] },
  { name: 'Vancity', websiteUrl: 'https://www.vancity.com', categorySlug: 'finans', seedUrls: ['https://www.vancity.com/offers/'] },
  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Intact Insurance', websiteUrl: 'https://www.intact.ca', categorySlug: 'sigorta', seedUrls: ['https://www.intact.ca/en/personal-insurance/promotions.html'] },
  { name: 'Desjardins Insurance', websiteUrl: 'https://www.desjardinsinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.desjardinsinsurance.com/en/promotions'] },
  { name: 'Economical Insurance', websiteUrl: 'https://www.economical.com', categorySlug: 'sigorta', seedUrls: ['https://www.economical.com/en/offers'] },
  { name: 'Wawanesa Insurance', websiteUrl: 'https://www.wawanesa.com', categorySlug: 'sigorta', seedUrls: ['https://www.wawanesa.com/canada/promotions'] },
  { name: 'RSA Canada', websiteUrl: 'https://www.rsagroup.ca', categorySlug: 'sigorta', seedUrls: ['https://www.rsagroup.ca/promotions'] },
  { name: 'Zurich Canada', websiteUrl: 'https://www.zurichcanada.com', categorySlug: 'sigorta', seedUrls: ['https://www.zurichcanada.com/en/offers'] },
  { name: 'Pembridge Insurance', websiteUrl: 'https://www.pembridgeinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.pembridgeinsurance.com/promotions'] },
  { name: 'Definity Insurance', websiteUrl: 'https://www.definityfinancial.com', categorySlug: 'sigorta', seedUrls: ['https://www.definityfinancial.com/offers'] },
  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Ford Canada', websiteUrl: 'https://www.ford.ca', categorySlug: 'otomobil', seedUrls: ['https://www.ford.ca/offers/'] },
  { name: 'Kia Canada', websiteUrl: 'https://www.kia.ca', categorySlug: 'otomobil', seedUrls: ['https://www.kia.ca/offers'] },
  { name: 'Nissan Canada', websiteUrl: 'https://www.nissan.ca', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.ca/offers.html'] },
  { name: 'Mazda Canada', websiteUrl: 'https://www.mazda.ca', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.ca/en/shopping-tools/offers-and-incentives/'] },
  { name: 'Jeep Canada', websiteUrl: 'https://www.jeep.ca', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.ca/en/offers'] },
  { name: 'Ram Canada', websiteUrl: 'https://www.ramtruck.ca', categorySlug: 'otomobil', seedUrls: ['https://www.ramtruck.ca/en/offers'] },
  { name: 'Dodge Canada', websiteUrl: 'https://www.dodge.ca', categorySlug: 'otomobil', seedUrls: ['https://www.dodge.ca/en/offers'] },
  { name: 'Chrysler Canada', websiteUrl: 'https://www.chrysler.ca', categorySlug: 'otomobil', seedUrls: ['https://www.chrysler.ca/en/offers'] },
  { name: 'Tesla Canada', websiteUrl: 'https://www.tesla.com/en_ca', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/en_ca/inventory/'] },
  { name: 'Volvo Canada', websiteUrl: 'https://www.volvocars.com/en-ca', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/en-ca/offers/'] },
  { name: 'Canadian Tire Auto', websiteUrl: 'https://www.canadiantire.ca', categorySlug: 'otomobil', seedUrls: ['https://www.canadiantire.ca/en/automotive.html'] },
  { name: 'Kal Tire', websiteUrl: 'https://www.kaltire.com', categorySlug: 'otomobil', seedUrls: ['https://www.kaltire.com/en/promotions/', 'https://www.kaltire.com/en/rebates/'] },
  { name: 'NAPA Auto Parts Canada', websiteUrl: 'https://www.napacanada.com', categorySlug: 'otomobil', seedUrls: ['https://www.napacanada.com/en/promotions'] },
  { name: 'AutoTrader Canada', websiteUrl: 'https://www.autotrader.ca', categorySlug: 'otomobil', seedUrls: ['https://www.autotrader.ca/deals/'] },
  { name: 'Mr. Lube', websiteUrl: 'https://www.mrlube.com', categorySlug: 'otomobil', seedUrls: ['https://www.mrlube.com/offers/', 'https://www.mrlube.com/promotions/'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon CA Books', websiteUrl: 'https://www.amazon.ca', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.ca/deals?category=books'] },
  { name: 'Book Outlet', websiteUrl: 'https://bookoutlet.ca', categorySlug: 'kitap-hobi', seedUrls: ['https://bookoutlet.ca/deals', 'https://bookoutlet.ca/sale'] },
  { name: 'Kobo', websiteUrl: 'https://www.kobo.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kobo.com/ca/en/p/deals', 'https://www.kobo.com/ca/en/deals'] },
  { name: 'Michaels Canada', websiteUrl: 'https://canada.michaels.com', categorySlug: 'kitap-hobi', seedUrls: ['https://canada.michaels.com/en/sale', 'https://canada.michaels.com/en/coupons'] },
  { name: 'DeSerres', websiteUrl: 'https://www.deserres.ca', categorySlug: 'kitap-hobi', seedUrls: ['https://www.deserres.ca/collections/sale'] },
  { name: 'Mastermind Toys', websiteUrl: 'https://www.mastermindtoys.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mastermindtoys.com/collections/sale'] },
  { name: 'Games Workshop Canada', websiteUrl: 'https://www.games-workshop.com/en-CA', categorySlug: 'kitap-hobi', seedUrls: ['https://www.games-workshop.com/en-CA/New-Exclusive'] },
  { name: 'EB Games Canada', websiteUrl: 'https://www.ebgames.ca', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ebgames.ca/Deals', 'https://www.ebgames.ca/Sale'] },
  { name: 'GameStop Canada', websiteUrl: 'https://www.gamestop.ca', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gamestop.ca/Views/Locale/Content/Deals', 'https://www.gamestop.ca/sale'] },
  { name: 'Steam Canada', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/'] },
  { name: 'PlayStation Store CA', websiteUrl: 'https://store.playstation.com/en-ca', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/en-ca/category/deals/'] },
  { name: 'Scribd', websiteUrl: 'https://www.scribd.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.scribd.com/subscribe'] },
  { name: 'Hobby Lobby Canada', websiteUrl: 'https://www.hobbylobby.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbylobby.com/weekly-ad'] },
  { name: 'Crayola Canada', websiteUrl: 'https://www.crayola.ca', categorySlug: 'kitap-hobi', seedUrls: ['https://www.crayola.ca/promotions'] },
  { name: 'Costco Toys CA', websiteUrl: 'https://www.costco.ca', categorySlug: 'kitap-hobi', seedUrls: ['https://www.costco.ca/toys.html'] },
  { name: 'Scholar\'s Choice', websiteUrl: 'https://www.scholarschoice.ca', categorySlug: 'kitap-hobi', seedUrls: ['https://www.scholarschoice.ca/collections/sale'] },
];

// ── Deduplicate by slug ─────────────────────────────────
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

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log('=== CA Brand Seeding Script ===\n');
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
        where: { slug_market: { slug, market: 'CA' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'CA', categoryId },
      });

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
            market: 'CA',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'CA' },
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

  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'CA' } });
  console.log(`Total active CA sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=CA');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
