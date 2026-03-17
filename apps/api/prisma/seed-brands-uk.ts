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

// ── ALL UK BRANDS DATA ──────────────────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon UK', websiteUrl: 'https://www.amazon.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.co.uk/deals'] },
  { name: 'eBay UK', websiteUrl: 'https://www.ebay.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.co.uk/deals'] },
  { name: 'Argos', websiteUrl: 'https://www.argos.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.argos.co.uk/deals', 'https://www.argos.co.uk/clearance'] },
  { name: 'John Lewis', websiteUrl: 'https://www.johnlewis.com', categorySlug: 'alisveris', seedUrls: ['https://www.johnlewis.com/sale', 'https://www.johnlewis.com/offers'] },
  { name: 'Currys', websiteUrl: 'https://www.currys.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.currys.co.uk/deals', 'https://www.currys.co.uk/sale'] },
  { name: 'Very', websiteUrl: 'https://www.very.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.very.co.uk/offers', 'https://www.very.co.uk/sale'] },
  { name: 'AO.com', websiteUrl: 'https://ao.com', categorySlug: 'alisveris', seedUrls: ['https://ao.com/deals', 'https://ao.com/sale'] },
  { name: 'ASOS', websiteUrl: 'https://www.asos.com', categorySlug: 'alisveris', seedUrls: ['https://www.asos.com/sale/', 'https://www.asos.com/women/sale/', 'https://www.asos.com/men/sale/'] },
  { name: 'Next', websiteUrl: 'https://www.next.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.next.co.uk/sale'] },
  { name: 'Marks and Spencer', websiteUrl: 'https://www.marksandspencer.com', categorySlug: 'alisveris', seedUrls: ['https://www.marksandspencer.com/c/sale', 'https://www.marksandspencer.com/c/offers'] },
  { name: 'Tesco Direct', websiteUrl: 'https://www.tesco.com', categorySlug: 'alisveris', seedUrls: ['https://www.tesco.com/groceries/en-GB/promotions'] },
  { name: 'Asda', websiteUrl: 'https://www.asda.com', categorySlug: 'alisveris', seedUrls: ['https://www.asda.com/offers', 'https://groceries.asda.com/special-offers'] },
  { name: "Sainsbury's", websiteUrl: 'https://www.sainsburys.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.sainsburys.co.uk/shop/gb/groceries/great-offers'] },
  { name: 'Debenhams', websiteUrl: 'https://www.debenhams.com', categorySlug: 'alisveris', seedUrls: ['https://www.debenhams.com/sale'] },
  { name: 'House of Fraser', websiteUrl: 'https://www.houseoffraser.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.houseoffraser.co.uk/sale'] },
  { name: 'TK Maxx', websiteUrl: 'https://www.tkmaxx.com', categorySlug: 'alisveris', seedUrls: ['https://www.tkmaxx.com/uk/en/clearance/c/01200000'] },
  { name: 'Matalan', websiteUrl: 'https://www.matalan.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.matalan.co.uk/sale'] },
  { name: 'George at Asda', websiteUrl: 'https://direct.asda.com/george', categorySlug: 'alisveris', seedUrls: ['https://direct.asda.com/george/sale/D26G10,default,sc.html'] },
  { name: 'Groupon UK', websiteUrl: 'https://www.groupon.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.groupon.co.uk/deals'] },
  { name: 'Wowcher', websiteUrl: 'https://www.wowcher.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.wowcher.co.uk/deals'] },
  { name: 'Hotukdeals', websiteUrl: 'https://www.hotukdeals.com', categorySlug: 'alisveris', seedUrls: ['https://www.hotukdeals.com/deals', 'https://www.hotukdeals.com/hot-deals'] },
  { name: 'Quidco', websiteUrl: 'https://www.quidco.com', categorySlug: 'alisveris', seedUrls: ['https://www.quidco.com/deals/', 'https://www.quidco.com/best-cashback-deals/'] },
  { name: 'TopCashback', websiteUrl: 'https://www.topcashback.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.topcashback.co.uk/deals/'] },
  { name: 'ShopStyle UK', websiteUrl: 'https://www.shopstyle.co.uk', categorySlug: 'alisveris', seedUrls: ['https://www.shopstyle.co.uk/browse/sale'] },
  { name: 'Frasers Group', websiteUrl: 'https://www.frasers.com', categorySlug: 'alisveris', seedUrls: ['https://www.frasers.com/sale'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Currys Electronics', websiteUrl: 'https://www.currys.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.currys.co.uk/deals', 'https://www.currys.co.uk/computing/deals'] },
  { name: 'AO Electronics', websiteUrl: 'https://ao.com', categorySlug: 'elektronik', seedUrls: ['https://ao.com/deals', 'https://ao.com/sale/tv-deals'] },
  { name: 'Argos Tech', websiteUrl: 'https://www.argos.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.argos.co.uk/browse/technology/c:702145/', 'https://www.argos.co.uk/deals/technology-deals'] },
  { name: 'Amazon UK Electronics', websiteUrl: 'https://www.amazon.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.amazon.co.uk/deals?category=electronics'] },
  { name: 'Apple UK', websiteUrl: 'https://www.apple.com/uk', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/uk/shop/go/product/refurbished', 'https://www.apple.com/uk/shop/buy-iphone'] },
  { name: 'Samsung UK', websiteUrl: 'https://www.samsung.com/uk', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/uk/offer/', 'https://www.samsung.com/uk/offer/galaxy/'] },
  { name: 'Laptops Direct', websiteUrl: 'https://www.laptopsdirect.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.laptopsdirect.co.uk/deals/', 'https://www.laptopsdirect.co.uk/sale/'] },
  { name: 'Box.co.uk', websiteUrl: 'https://www.box.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.box.co.uk/deals'] },
  { name: 'Ebuyer', websiteUrl: 'https://www.ebuyer.com', categorySlug: 'elektronik', seedUrls: ['https://www.ebuyer.com/deals'] },
  { name: 'Scan', websiteUrl: 'https://www.scan.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.scan.co.uk/todayonly', 'https://www.scan.co.uk/shops/deals'] },
  { name: 'Overclockers UK', websiteUrl: 'https://www.overclockers.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.overclockers.co.uk/offers'] },
  { name: 'CCL Computers', websiteUrl: 'https://www.cclonline.com', categorySlug: 'elektronik', seedUrls: ['https://www.cclonline.com/deals/'] },
  { name: 'John Lewis Tech', websiteUrl: 'https://www.johnlewis.com', categorySlug: 'elektronik', seedUrls: ['https://www.johnlewis.com/electricals/sale', 'https://www.johnlewis.com/electricals/offers'] },
  { name: 'Richer Sounds', websiteUrl: 'https://www.richersounds.com', categorySlug: 'elektronik', seedUrls: ['https://www.richersounds.com/deals-of-the-week', 'https://www.richersounds.com/clearance'] },
  { name: 'Sony UK', websiteUrl: 'https://www.sony.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.sony.co.uk/promotions'] },
  { name: 'LG UK', websiteUrl: 'https://www.lg.com/uk', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/uk/promotions'] },
  { name: 'HP UK', websiteUrl: 'https://www.hp.com/gb-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/gb-en/shop/offer.aspx?p=c-deals'] },
  { name: 'Dell UK', websiteUrl: 'https://www.dell.com/en-uk', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-uk/shop/deals'] },
  { name: 'Lenovo UK', websiteUrl: 'https://www.lenovo.com/gb/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/gb/en/d/deals/'] },
  { name: 'Microsoft UK', websiteUrl: 'https://www.microsoft.com/en-gb', categorySlug: 'elektronik', seedUrls: ['https://www.microsoft.com/en-gb/store/deals'] },
  { name: 'Google Store UK', websiteUrl: 'https://store.google.com/gb', categorySlug: 'elektronik', seedUrls: ['https://store.google.com/gb/collection/offers'] },
  { name: 'Bose UK', websiteUrl: 'https://www.bose.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.bose.co.uk/deals'] },
  { name: 'JBL UK', websiteUrl: 'https://uk.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://uk.jbl.com/sale/'] },
  { name: 'Canon UK', websiteUrl: 'https://www.canon.co.uk', categorySlug: 'elektronik', seedUrls: ['https://www.canon.co.uk/deals/', 'https://store.canon.co.uk/deals/'] },
  { name: 'Sky', websiteUrl: 'https://www.sky.com', categorySlug: 'elektronik', seedUrls: ['https://www.sky.com/deals', 'https://www.sky.com/tv/offers'] },

  // ═══════════════════════════════════════════════════════
  // 3) Clothing & Fashion (giyim-moda) — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'ASOS Fashion', websiteUrl: 'https://www.asos.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.asos.com/women/sale/', 'https://www.asos.com/men/sale/'] },
  { name: 'Next Fashion', websiteUrl: 'https://www.next.co.uk', categorySlug: 'giyim-moda', seedUrls: ['https://www.next.co.uk/sale', 'https://www.next.co.uk/sale/women', 'https://www.next.co.uk/sale/men'] },
  { name: 'M&S Fashion', websiteUrl: 'https://www.marksandspencer.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.marksandspencer.com/c/sale/clothing'] },
  { name: 'H&M UK', websiteUrl: 'https://www2.hm.com/en_gb', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/en_gb/sale.html'] },
  { name: 'Zara UK', websiteUrl: 'https://www.zara.com/uk', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/uk/en/z-sale-l1702.html'] },
  { name: 'Primark', websiteUrl: 'https://www.primark.com/en-gb', categorySlug: 'giyim-moda', seedUrls: ['https://www.primark.com/en-gb/new-in'] },
  { name: 'River Island', websiteUrl: 'https://www.riverisland.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.riverisland.com/c/sale', 'https://www.riverisland.com/c/sale/women'] },
  { name: 'New Look', websiteUrl: 'https://www.newlook.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.newlook.com/uk/sale', 'https://www.newlook.com/uk/womens/sale'] },
  { name: 'Topshop at ASOS', websiteUrl: 'https://www.asos.com/topshop', categorySlug: 'giyim-moda', seedUrls: ['https://www.asos.com/women/a-to-z-of-brands/topshop/cat/?cid=33059'] },
  { name: 'boohoo', websiteUrl: 'https://www.boohoo.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.boohoo.com/sale', 'https://www.boohoo.com/womens/sale'] },
  { name: 'PrettyLittleThing', websiteUrl: 'https://www.prettylittlething.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.prettylittlething.com/sale.html'] },
  { name: 'Missguided', websiteUrl: 'https://www.missguided.co.uk', categorySlug: 'giyim-moda', seedUrls: ['https://www.missguided.co.uk/sale'] },
  { name: 'JD Sports Fashion', websiteUrl: 'https://www.jdsports.co.uk', categorySlug: 'giyim-moda', seedUrls: ['https://www.jdsports.co.uk/sale/'] },
  { name: 'Sports Direct Fashion', websiteUrl: 'https://www.sportsdirect.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sportsdirect.com/sale'] },
  { name: 'Superdry', websiteUrl: 'https://www.superdry.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.superdry.com/sale', 'https://www.superdry.com/womens/sale'] },
  { name: 'Fat Face', websiteUrl: 'https://www.fatface.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.fatface.com/sale'] },
  { name: 'Joules', websiteUrl: 'https://www.joules.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.joules.com/sale'] },
  { name: 'Ted Baker', websiteUrl: 'https://www.tedbaker.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.tedbaker.com/uk/sale'] },
  { name: 'Reiss', websiteUrl: 'https://www.reiss.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.reiss.com/sale/womens/', 'https://www.reiss.com/sale/mens/'] },
  { name: 'AllSaints', websiteUrl: 'https://www.allsaints.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.allsaints.com/women/sale/', 'https://www.allsaints.com/men/sale/'] },
  { name: 'Whistles', websiteUrl: 'https://www.whistles.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.whistles.com/sale/'] },
  { name: 'COS', websiteUrl: 'https://www.cos.com/en_gbp', categorySlug: 'giyim-moda', seedUrls: ['https://www.cos.com/en_gbp/sale.html'] },
  { name: 'And Other Stories', websiteUrl: 'https://www.stories.com/en_gbp', categorySlug: 'giyim-moda', seedUrls: ['https://www.stories.com/en_gbp/sale.html'] },
  { name: 'Monsoon', websiteUrl: 'https://www.monsoon.co.uk', categorySlug: 'giyim-moda', seedUrls: ['https://www.monsoon.co.uk/sale'] },
  { name: 'Hobbs', websiteUrl: 'https://www.hobbs.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.hobbs.com/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA UK', websiteUrl: 'https://www.ikea.com/gb/en', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/gb/en/offers/', 'https://www.ikea.com/gb/en/offers/lower-price/'] },
  { name: 'Wayfair UK', websiteUrl: 'https://www.wayfair.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.wayfair.co.uk/daily-sales', 'https://www.wayfair.co.uk/deals'] },
  { name: 'Dunelm', websiteUrl: 'https://www.dunelm.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.dunelm.com/sale', 'https://www.dunelm.com/offers'] },
  { name: 'The Range', websiteUrl: 'https://www.therange.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.therange.co.uk/sale/'] },
  { name: 'B&Q', websiteUrl: 'https://www.diy.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.diy.com/deals', 'https://www.diy.com/clearance'] },
  { name: 'Homebase', websiteUrl: 'https://www.homebase.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.homebase.co.uk/sale', 'https://www.homebase.co.uk/deals'] },
  { name: 'Habitat', websiteUrl: 'https://www.habitat.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.habitat.co.uk/sale'] },
  { name: 'Made.com', websiteUrl: 'https://www.made.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.made.com/sale'] },
  { name: 'Swoon', websiteUrl: 'https://www.swooneditions.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.swooneditions.com/sale'] },
  { name: 'John Lewis Home', websiteUrl: 'https://www.johnlewis.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.johnlewis.com/home-garden/sale', 'https://www.johnlewis.com/home-garden/offers'] },
  { name: 'M&S Home', websiteUrl: 'https://www.marksandspencer.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.marksandspencer.com/c/sale/home'] },
  { name: 'Next Home', websiteUrl: 'https://www.next.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.next.co.uk/sale/homeware'] },
  { name: 'Laura Ashley', websiteUrl: 'https://www.lauraashley.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.lauraashley.com/sale'] },
  { name: "Heal's", websiteUrl: 'https://www.heals.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.heals.com/sale'] },
  { name: 'Loaf', websiteUrl: 'https://loaf.com', categorySlug: 'ev-yasam', seedUrls: ['https://loaf.com/sale'] },
  { name: 'Furniture Village', websiteUrl: 'https://www.furniturevillage.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.furniturevillage.co.uk/sale/'] },
  { name: 'DFS', websiteUrl: 'https://www.dfs.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.dfs.co.uk/sale'] },
  { name: 'ScS', websiteUrl: 'https://www.scs.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.scs.co.uk/sale/'] },
  { name: 'Oak Furnitureland', websiteUrl: 'https://www.oakfurnitureland.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.oakfurnitureland.co.uk/sale/'] },
  { name: 'Dyson UK', websiteUrl: 'https://www.dyson.co.uk', categorySlug: 'ev-yasam', seedUrls: ['https://www.dyson.co.uk/deals', 'https://www.dyson.co.uk/outlet'] },

  // ═══════════════════════════════════════════════════════
  // 5) Grocery & Market (gida-market) — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tesco', websiteUrl: 'https://www.tesco.com', categorySlug: 'gida-market', seedUrls: ['https://www.tesco.com/groceries/en-GB/promotions', 'https://www.tesco.com/groceries/en-GB/promotions/alloffers'] },
  { name: "Sainsbury's Groceries", websiteUrl: 'https://www.sainsburys.co.uk', categorySlug: 'gida-market', seedUrls: ['https://www.sainsburys.co.uk/shop/gb/groceries/great-offers', 'https://www.sainsburys.co.uk/gol-ui/groceries/offers'] },
  { name: 'Asda Groceries', websiteUrl: 'https://www.asda.com', categorySlug: 'gida-market', seedUrls: ['https://groceries.asda.com/special-offers', 'https://www.asda.com/offers'] },
  { name: 'Morrisons', websiteUrl: 'https://www.morrisons.com', categorySlug: 'gida-market', seedUrls: ['https://www.morrisons.com/food-cupboard/offers/', 'https://groceries.morrisons.com/browse/offers'] },
  { name: 'Aldi UK', websiteUrl: 'https://www.aldi.co.uk', categorySlug: 'gida-market', seedUrls: ['https://www.aldi.co.uk/specialbuys', 'https://www.aldi.co.uk/offers'] },
  { name: 'Lidl UK', websiteUrl: 'https://www.lidl.co.uk', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.co.uk/offers', 'https://www.lidl.co.uk/middle-of-lidl'] },
  { name: 'Waitrose', websiteUrl: 'https://www.waitrose.com', categorySlug: 'gida-market', seedUrls: ['https://www.waitrose.com/ecom/shop/browse/offers', 'https://www.waitrose.com/ecom/shop/offers'] },
  { name: 'Ocado', websiteUrl: 'https://www.ocado.com', categorySlug: 'gida-market', seedUrls: ['https://www.ocado.com/browse/offers-366', 'https://www.ocado.com/offers'] },
  { name: 'Iceland', websiteUrl: 'https://www.iceland.co.uk', categorySlug: 'gida-market', seedUrls: ['https://www.iceland.co.uk/offers', 'https://www.iceland.co.uk/offers/all-offers'] },
  { name: 'Co-op', websiteUrl: 'https://www.coop.co.uk', categorySlug: 'gida-market', seedUrls: ['https://www.coop.co.uk/deals', 'https://www.coop.co.uk/products/offers'] },
  { name: 'Amazon Fresh UK', websiteUrl: 'https://www.amazon.co.uk/alm/storefront', categorySlug: 'gida-market', seedUrls: ['https://www.amazon.co.uk/Amazon-Fresh/b?ie=UTF8&node=6723205031'] },
  { name: 'Gousto', websiteUrl: 'https://www.gousto.co.uk', categorySlug: 'gida-market', seedUrls: ['https://www.gousto.co.uk/cookbook/meal-plans'] },
  { name: 'HelloFresh UK', websiteUrl: 'https://www.hellofresh.co.uk', categorySlug: 'gida-market', seedUrls: ['https://www.hellofresh.co.uk/plans'] },
  { name: 'Mindful Chef', websiteUrl: 'https://www.mindfulchef.com', categorySlug: 'gida-market', seedUrls: ['https://www.mindfulchef.com/healthy-recipes'] },
  { name: 'Abel and Cole', websiteUrl: 'https://www.abelandcole.co.uk', categorySlug: 'gida-market', seedUrls: ['https://www.abelandcole.co.uk/offers'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Dining (yeme-icme) — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Deliveroo', websiteUrl: 'https://deliveroo.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://deliveroo.co.uk/offers'] },
  { name: 'Just Eat', websiteUrl: 'https://www.just-eat.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.just-eat.co.uk/offers'] },
  { name: 'Uber Eats UK', websiteUrl: 'https://www.ubereats.com/gb', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/gb/feed?pl=JTdCJTIyYWRkcmVzcyUyMiUzQSUyMkxvbmRvbiUyMiU3RA%3D%3D'] },
  { name: "Domino's UK", websiteUrl: 'https://www.dominos.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.co.uk/deals'] },
  { name: 'Pizza Hut UK', websiteUrl: 'https://www.pizzahut.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.co.uk/deals/'] },
  { name: "McDonald's UK", websiteUrl: 'https://www.mcdonalds.com/gb/en-gb.html', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com/gb/en-gb/latest-offers.html'] },
  { name: 'KFC UK', websiteUrl: 'https://www.kfc.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.co.uk/offers'] },
  { name: "Nando's", websiteUrl: 'https://www.nandos.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.co.uk/offers'] },
  { name: 'Wagamama', websiteUrl: 'https://www.wagamama.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.wagamama.com/offers'] },
  { name: 'Greggs', websiteUrl: 'https://www.greggs.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.greggs.co.uk/offers'] },
  { name: 'Pret A Manger', websiteUrl: 'https://www.pret.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.pret.co.uk/en-GB'] },
  { name: 'Pizza Express', websiteUrl: 'https://www.pizzaexpress.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzaexpress.com/offers'] },
  { name: 'Five Guys UK', websiteUrl: 'https://www.fiveguys.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.fiveguys.co.uk/'] },
  { name: 'Honest Burgers', websiteUrl: 'https://www.honestburgers.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.honestburgers.co.uk/offers/'] },
  { name: 'GBK', websiteUrl: 'https://www.gbk.co.uk', categorySlug: 'yeme-icme', seedUrls: ['https://www.gbk.co.uk/offers'] },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty & Personal Care (kozmetik-kisisel-bakim) — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Boots', websiteUrl: 'https://www.boots.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.boots.com/offers', 'https://www.boots.com/beauty/beauty-offers'] },
  { name: 'Superdrug', websiteUrl: 'https://www.superdrug.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.superdrug.com/offers', 'https://www.superdrug.com/sale'] },
  { name: 'Lookfantastic', websiteUrl: 'https://www.lookfantastic.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lookfantastic.com/offers.list', 'https://www.lookfantastic.com/sale.list'] },
  { name: 'ASOS Beauty', websiteUrl: 'https://www.asos.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.asos.com/beauty/sale/'] },
  { name: 'Cult Beauty', websiteUrl: 'https://www.cultbeauty.co.uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cultbeauty.co.uk/offers', 'https://www.cultbeauty.co.uk/sale'] },
  { name: 'Space NK', websiteUrl: 'https://www.spacenk.com/uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.spacenk.com/uk/sale', 'https://www.spacenk.com/uk/offers'] },
  { name: 'The Body Shop UK', websiteUrl: 'https://www.thebodyshop.com/en-gb', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com/en-gb/offers', 'https://www.thebodyshop.com/en-gb/sale'] },
  { name: 'Sephora UK', websiteUrl: 'https://www.sephora.co.uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.co.uk/sale', 'https://www.sephora.co.uk/offers'] },
  { name: 'Charlotte Tilbury UK', websiteUrl: 'https://www.charlottetilbury.com/uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.charlottetilbury.com/uk/gifts/offers', 'https://www.charlottetilbury.com/uk/sale'] },
  { name: 'MAC UK', websiteUrl: 'https://www.maccosmetics.co.uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.co.uk/offers', 'https://www.maccosmetics.co.uk/sale'] },
  { name: 'NARS UK', websiteUrl: 'https://www.narscosmetics.co.uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.narscosmetics.co.uk/offers'] },
  { name: 'Benefit UK', websiteUrl: 'https://www.benefitcosmetics.com/en-gb', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.benefitcosmetics.com/en-gb/offers'] },
  { name: 'Clinique UK', websiteUrl: 'https://www.clinique.co.uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.co.uk/offers', 'https://www.clinique.co.uk/sale'] },
  { name: 'Lush', websiteUrl: 'https://www.lush.com/uk/en', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/uk/en/c/sale'] },
  { name: 'Molton Brown', websiteUrl: 'https://www.moltonbrown.co.uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.moltonbrown.co.uk/sale', 'https://www.moltonbrown.co.uk/offers'] },
  { name: "Neal's Yard", websiteUrl: 'https://www.nealsyardremedies.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nealsyardremedies.com/offers', 'https://www.nealsyardremedies.com/sale'] },
  { name: 'Elemis', websiteUrl: 'https://www.elemis.com/uk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.elemis.com/uk/offers', 'https://www.elemis.com/uk/sale'] },
  { name: 'The Ordinary UK', websiteUrl: 'https://theordinary.com/en-gb', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://theordinary.com/en-gb/offers.html'] },
  { name: 'Revolution Beauty', websiteUrl: 'https://www.revolutionbeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.revolutionbeauty.com/sale/', 'https://www.revolutionbeauty.com/offers/'] },
  { name: 'beautybay', websiteUrl: 'https://www.beautybay.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.beautybay.com/l/sale/', 'https://www.beautybay.com/l/offers/'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sports Direct', websiteUrl: 'https://www.sportsdirect.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportsdirect.com/sale', 'https://www.sportsdirect.com/deals'] },
  { name: 'JD Sports', websiteUrl: 'https://www.jdsports.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jdsports.co.uk/sale/', 'https://www.jdsports.co.uk/men/sale/', 'https://www.jdsports.co.uk/women/sale/'] },
  { name: 'Decathlon UK', websiteUrl: 'https://www.decathlon.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.co.uk/browse/c0-sale/_/N-1ujxcvh', 'https://www.decathlon.co.uk/deals'] },
  { name: 'Nike UK', websiteUrl: 'https://www.nike.com/gb', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/gb/w/sale-3yaep', 'https://www.nike.com/gb/sale'] },
  { name: 'Adidas UK', websiteUrl: 'https://www.adidas.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.co.uk/sale', 'https://www.adidas.co.uk/outlet'] },
  { name: 'Puma UK', websiteUrl: 'https://uk.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://uk.puma.com/uk/en/sale', 'https://uk.puma.com/uk/en/sale/mens-sale'] },
  { name: 'Under Armour UK', websiteUrl: 'https://www.underarmour.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.co.uk/en-gb/c/outlet/'] },
  { name: 'New Balance UK', websiteUrl: 'https://www.newbalance.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.co.uk/sale/', 'https://www.newbalance.co.uk/men/sale/'] },
  { name: 'ASICS UK', websiteUrl: 'https://www.asics.com/gb/en-gb', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/gb/en-gb/sale/c/sale/'] },
  { name: 'Cotswold Outdoor', websiteUrl: 'https://www.cotswoldoutdoor.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.cotswoldoutdoor.com/sale/', 'https://www.cotswoldoutdoor.com/clearance/'] },
  { name: 'Go Outdoors', websiteUrl: 'https://www.gooutdoors.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gooutdoors.co.uk/sale/', 'https://www.gooutdoors.co.uk/clearance/'] },
  { name: 'Millets', websiteUrl: 'https://www.millets.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.millets.co.uk/sale/'] },
  { name: 'Blacks', websiteUrl: 'https://www.blacks.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.blacks.co.uk/sale/'] },
  { name: 'Wiggle', websiteUrl: 'https://www.wiggle.co.uk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wiggle.co.uk/sale/', 'https://www.wiggle.co.uk/deals/'] },
  { name: 'Chain Reaction Cycles', websiteUrl: 'https://www.chainreactioncycles.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.chainreactioncycles.com/sale', 'https://www.chainreactioncycles.com/deals'] },
  { name: 'Evans Cycles', websiteUrl: 'https://www.evanscycles.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.evanscycles.com/deals', 'https://www.evanscycles.com/sale'] },
  { name: 'Halfords Sports', websiteUrl: 'https://www.halfords.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.halfords.com/cycling/deals/', 'https://www.halfords.com/offers/'] },
  { name: 'Regatta', websiteUrl: 'https://www.regatta.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.regatta.com/sale/', 'https://www.regatta.com/outlet/'] },
  { name: 'Mountain Warehouse', websiteUrl: 'https://www.mountainwarehouse.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mountainwarehouse.com/sale/', 'https://www.mountainwarehouse.com/clearance/'] },
  { name: 'Helly Hansen UK', websiteUrl: 'https://www.hellyhansen.com/en_gb', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.com/en_gb/sale', 'https://www.hellyhansen.com/en_gb/outlet'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'British Airways', websiteUrl: 'https://www.britishairways.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.britishairways.com/en-gb/flights/special-offers', 'https://www.britishairways.com/en-gb/offers'] },
  { name: 'easyJet', websiteUrl: 'https://www.easyjet.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easyjet.com/en/cheap-flights', 'https://www.easyjet.com/en/inspireme'] },
  { name: 'Ryanair UK', websiteUrl: 'https://www.ryanair.com/gb/en', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/gb/en/lp/deals', 'https://www.ryanair.com/gb/en/cheap-flights'] },
  { name: 'Jet2', websiteUrl: 'https://www.jet2.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jet2.com/deals', 'https://www.jet2holidays.com/deals'] },
  { name: 'TUI UK', websiteUrl: 'https://www.tui.co.uk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tui.co.uk/destinations/deals', 'https://www.tui.co.uk/holidays/deals'] },
  { name: 'Virgin Atlantic', websiteUrl: 'https://www.virginatlantic.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.virginatlantic.com/offers/gb/en'] },
  { name: 'Trainline', websiteUrl: 'https://www.thetrainline.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thetrainline.com/train-times/deals', 'https://www.thetrainline.com/offers'] },
  { name: 'National Express', websiteUrl: 'https://www.nationalexpress.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nationalexpress.com/en/offers'] },
  { name: 'Booking.com UK', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.en-gb.html'] },
  { name: 'Expedia UK', websiteUrl: 'https://www.expedia.co.uk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.co.uk/deals', 'https://www.expedia.co.uk/coupons'] },
  { name: 'Skyscanner', websiteUrl: 'https://www.skyscanner.net', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.net/transport/flights-from/uk/cheapest-flights-from-united-kingdom.html'] },
  { name: 'Kayak UK', websiteUrl: 'https://www.kayak.co.uk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.co.uk/deals'] },
  { name: 'lastminute.com', websiteUrl: 'https://www.lastminute.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lastminute.com/deals/', 'https://www.lastminute.com/holidays/deals'] },
  { name: 'On the Beach', websiteUrl: 'https://www.onthebeach.co.uk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.onthebeach.co.uk/deals', 'https://www.onthebeach.co.uk/holidays/deals'] },
  { name: 'Loveholidays', websiteUrl: 'https://www.loveholidays.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.loveholidays.com/deals', 'https://www.loveholidays.com/holidays/cheap'] },
  { name: 'Airbnb UK', websiteUrl: 'https://www.airbnb.co.uk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.co.uk/'] },
  { name: 'Premier Inn', websiteUrl: 'https://www.premierinn.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.premierinn.com/gb/en/deals.html', 'https://www.premierinn.com/gb/en/offers.html'] },
  { name: 'Travelodge', websiteUrl: 'https://www.travelodge.co.uk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travelodge.co.uk/offers', 'https://www.travelodge.co.uk/offers/deals'] },
  { name: 'Holiday Inn UK', websiteUrl: 'https://www.ihg.com/holidayinn/hotels/gb/en', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ihg.com/holidayinn/hotels/gb/en/find-hotels/special-offers'] },
  { name: 'Enterprise UK', websiteUrl: 'https://www.enterprise.co.uk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.enterprise.co.uk/en/car-hire/deals.html'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Monzo', websiteUrl: 'https://monzo.com', categorySlug: 'finans', seedUrls: ['https://monzo.com/blog/'] },
  { name: 'Starling Bank', websiteUrl: 'https://www.starlingbank.com', categorySlug: 'finans', seedUrls: ['https://www.starlingbank.com/current-account/'] },
  { name: 'Revolut UK', websiteUrl: 'https://www.revolut.com/en-GB', categorySlug: 'finans', seedUrls: ['https://www.revolut.com/en-GB/rewards'] },
  { name: 'NatWest', websiteUrl: 'https://www.natwest.com', categorySlug: 'finans', seedUrls: ['https://www.natwest.com/current-accounts/deals-and-offers.html', 'https://www.natwest.com/reward.html'] },
  { name: 'Barclays', websiteUrl: 'https://www.barclays.co.uk', categorySlug: 'finans', seedUrls: ['https://www.barclays.co.uk/current-accounts/blue-rewards/', 'https://www.barclays.co.uk/offers/'] },
  { name: 'HSBC UK', websiteUrl: 'https://www.hsbc.co.uk', categorySlug: 'finans', seedUrls: ['https://www.hsbc.co.uk/current-accounts/offers/', 'https://www.hsbc.co.uk/credit-cards/offers/'] },
  { name: 'Lloyds', websiteUrl: 'https://www.lloydsbank.com', categorySlug: 'finans', seedUrls: ['https://www.lloydsbank.com/current-accounts/offers.html'] },
  { name: 'Santander UK', websiteUrl: 'https://www.santander.co.uk', categorySlug: 'finans', seedUrls: ['https://www.santander.co.uk/current-accounts/offers'] },
  { name: 'Halifax', websiteUrl: 'https://www.halifax.co.uk', categorySlug: 'finans', seedUrls: ['https://www.halifax.co.uk/current-accounts/switch-offer.html'] },
  { name: 'Nationwide', websiteUrl: 'https://www.nationwide.co.uk', categorySlug: 'finans', seedUrls: ['https://www.nationwide.co.uk/current-accounts/offers/'] },
  { name: 'Chase UK', websiteUrl: 'https://www.chase.co.uk', categorySlug: 'finans', seedUrls: ['https://www.chase.co.uk/gb/en/rewards/'] },
  { name: 'PayPal UK', websiteUrl: 'https://www.paypal.com/gb', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/gb/webapps/mpp/offers'] },
  { name: 'Klarna UK', websiteUrl: 'https://www.klarna.com/uk', categorySlug: 'finans', seedUrls: ['https://www.klarna.com/uk/deals/', 'https://www.klarna.com/uk/shopping/'] },
  { name: 'ClearScore', websiteUrl: 'https://www.clearscore.com', categorySlug: 'finans', seedUrls: ['https://www.clearscore.com/offers'] },
  { name: 'MoneySuperMarket', websiteUrl: 'https://www.moneysupermarket.com', categorySlug: 'finans', seedUrls: ['https://www.moneysupermarket.com/current-accounts/', 'https://www.moneysupermarket.com/credit-cards/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Compare the Market', websiteUrl: 'https://www.comparethemarket.com', categorySlug: 'sigorta', seedUrls: ['https://www.comparethemarket.com/car-insurance/', 'https://www.comparethemarket.com/home-insurance/'] },
  { name: 'GoCompare', websiteUrl: 'https://www.gocompare.com', categorySlug: 'sigorta', seedUrls: ['https://www.gocompare.com/car-insurance/', 'https://www.gocompare.com/home-insurance/'] },
  { name: 'MoneySuperMarket Insurance', websiteUrl: 'https://www.moneysupermarket.com', categorySlug: 'sigorta', seedUrls: ['https://www.moneysupermarket.com/car-insurance/', 'https://www.moneysupermarket.com/home-insurance/'] },
  { name: 'Confused.com', websiteUrl: 'https://www.confused.com', categorySlug: 'sigorta', seedUrls: ['https://www.confused.com/car-insurance', 'https://www.confused.com/home-insurance'] },
  { name: 'Admiral', websiteUrl: 'https://www.admiral.com', categorySlug: 'sigorta', seedUrls: ['https://www.admiral.com/car-insurance', 'https://www.admiral.com/multicar-insurance'] },
  { name: 'Direct Line', websiteUrl: 'https://www.directline.com', categorySlug: 'sigorta', seedUrls: ['https://www.directline.com/car-insurance', 'https://www.directline.com/home-insurance'] },
  { name: 'Aviva UK', websiteUrl: 'https://www.aviva.co.uk', categorySlug: 'sigorta', seedUrls: ['https://www.aviva.co.uk/insurance/car-insurance/', 'https://www.aviva.co.uk/insurance/home-insurance/'] },
  { name: 'AXA UK', websiteUrl: 'https://www.axa.co.uk', categorySlug: 'sigorta', seedUrls: ['https://www.axa.co.uk/car-insurance/', 'https://www.axa.co.uk/home-insurance/'] },
  { name: 'LV=', websiteUrl: 'https://www.lv.com', categorySlug: 'sigorta', seedUrls: ['https://www.lv.com/car-insurance', 'https://www.lv.com/home-insurance'] },
  { name: 'Churchill', websiteUrl: 'https://www.churchill.com', categorySlug: 'sigorta', seedUrls: ['https://www.churchill.com/car-insurance', 'https://www.churchill.com/home-insurance'] },
  { name: 'Hastings Direct', websiteUrl: 'https://www.hastingsdirect.com', categorySlug: 'sigorta', seedUrls: ['https://www.hastingsdirect.com/car-insurance/', 'https://www.hastingsdirect.com/home-insurance/'] },
  { name: 'esure', websiteUrl: 'https://www.esure.com', categorySlug: 'sigorta', seedUrls: ['https://www.esure.com/car-insurance', 'https://www.esure.com/home-insurance'] },
  { name: 'Saga', websiteUrl: 'https://www.saga.co.uk', categorySlug: 'sigorta', seedUrls: ['https://www.saga.co.uk/insurance/car-insurance', 'https://www.saga.co.uk/insurance/home-insurance'] },
  { name: 'RAC', websiteUrl: 'https://www.rac.co.uk', categorySlug: 'sigorta', seedUrls: ['https://www.rac.co.uk/breakdown-cover', 'https://www.rac.co.uk/car-insurance'] },
  { name: 'AA Insurance', websiteUrl: 'https://www.theaa.com', categorySlug: 'sigorta', seedUrls: ['https://www.theaa.com/car-insurance', 'https://www.theaa.com/breakdown-cover'] },

  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'AutoTrader', websiteUrl: 'https://www.autotrader.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.autotrader.co.uk/car-deals', 'https://www.autotrader.co.uk/car-news/best-deals/'] },
  { name: 'CarGurus UK', websiteUrl: 'https://www.cargurus.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.cargurus.co.uk/Cars/deals'] },
  { name: 'Cinch', websiteUrl: 'https://www.cinch.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.cinch.co.uk/deals'] },
  { name: 'Cazoo', websiteUrl: 'https://www.cazoo.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.cazoo.co.uk/offers/'] },
  { name: 'We Buy Any Car', websiteUrl: 'https://www.webuyanycar.com', categorySlug: 'otomobil', seedUrls: ['https://www.webuyanycar.com/'] },
  { name: 'Arnold Clark', websiteUrl: 'https://www.arnoldclark.com', categorySlug: 'otomobil', seedUrls: ['https://www.arnoldclark.com/offers', 'https://www.arnoldclark.com/new-cars/deals'] },
  { name: 'Evans Halshaw', websiteUrl: 'https://www.evanshalshaw.com', categorySlug: 'otomobil', seedUrls: ['https://www.evanshalshaw.com/offers/', 'https://www.evanshalshaw.com/car-offers/'] },
  { name: 'Halfords Auto', websiteUrl: 'https://www.halfords.com', categorySlug: 'otomobil', seedUrls: ['https://www.halfords.com/motoring/offers/', 'https://www.halfords.com/offers/'] },
  { name: 'Kwik Fit', websiteUrl: 'https://www.kwik-fit.com', categorySlug: 'otomobil', seedUrls: ['https://www.kwik-fit.com/offers'] },
  { name: 'National Tyres', websiteUrl: 'https://www.national.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.national.co.uk/offers'] },
  { name: 'ATS Euromaster', websiteUrl: 'https://www.atseuromaster.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.atseuromaster.co.uk/offers'] },
  { name: 'BMW UK', websiteUrl: 'https://www.bmw.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.co.uk/en/offers.html', 'https://www.bmw.co.uk/en/offers/new-car-offers.html'] },
  { name: 'Mercedes-Benz UK', websiteUrl: 'https://www.mercedes-benz.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.co.uk/passengercars/buy/offers.html'] },
  { name: 'Audi UK', websiteUrl: 'https://www.audi.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.audi.co.uk/uk/web/en/offers.html'] },
  { name: 'Volkswagen UK', websiteUrl: 'https://www.volkswagen.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.co.uk/en/offers.html'] },
  { name: 'Toyota UK', websiteUrl: 'https://www.toyota.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.co.uk/new-cars/offers'] },
  { name: 'Ford UK', websiteUrl: 'https://www.ford.co.uk', categorySlug: 'otomobil', seedUrls: ['https://www.ford.co.uk/offers'] },
  { name: 'Hyundai UK', websiteUrl: 'https://www.hyundai.com/uk/en', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/uk/en/offers.html'] },
  { name: 'Kia UK', websiteUrl: 'https://www.kia.com/uk', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/uk/offers/'] },
  { name: 'Tesla UK', websiteUrl: 'https://www.tesla.com/en_gb', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/en_gb/inventory/new/m3', 'https://www.tesla.com/en_gb/inventory/new/my'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Waterstones', websiteUrl: 'https://www.waterstones.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.waterstones.com/category/offers', 'https://www.waterstones.com/category/book-of-the-month'] },
  { name: 'WHSmith', websiteUrl: 'https://www.whsmith.co.uk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.whsmith.co.uk/offers/', 'https://www.whsmith.co.uk/sale/'] },
  { name: 'Amazon Books UK', websiteUrl: 'https://www.amazon.co.uk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.co.uk/gp/bestsellers/books/', 'https://www.amazon.co.uk/b?ie=UTF8&node=266239'] },
  { name: 'The Book People', websiteUrl: 'https://www.thebookpeople.co.uk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.thebookpeople.co.uk/deals', 'https://www.thebookpeople.co.uk/sale'] },
  { name: "Blackwell's", websiteUrl: 'https://blackwells.co.uk', categorySlug: 'kitap-hobi', seedUrls: ['https://blackwells.co.uk/bookshop/offers/'] },
  { name: 'Foyles', websiteUrl: 'https://www.foyles.co.uk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.foyles.co.uk/offers'] },
  { name: 'Hobbycraft', websiteUrl: 'https://www.hobbycraft.co.uk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbycraft.co.uk/sale', 'https://www.hobbycraft.co.uk/offers'] },
  { name: 'The Works', websiteUrl: 'https://www.theworks.co.uk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.theworks.co.uk/c/offers', 'https://www.theworks.co.uk/c/clearance'] },
  { name: 'Lego UK', websiteUrl: 'https://www.lego.com/en-gb', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-gb/categories/sales-and-deals', 'https://www.lego.com/en-gb/offers'] },
  { name: 'Games Workshop', websiteUrl: 'https://www.games-workshop.com/en-GB', categorySlug: 'kitap-hobi', seedUrls: ['https://www.games-workshop.com/en-GB/New-Exclusive'] },
  { name: 'Forbidden Planet', websiteUrl: 'https://forbiddenplanet.com', categorySlug: 'kitap-hobi', seedUrls: ['https://forbiddenplanet.com/sale/', 'https://forbiddenplanet.com/deals/'] },
  { name: 'BookBub UK', websiteUrl: 'https://www.bookbub.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookbub.com/ebook-deals'] },
  { name: 'Hive', websiteUrl: 'https://www.hive.co.uk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hive.co.uk/Offers', 'https://www.hive.co.uk/BookOfTheMonth'] },
  { name: 'Osprey Publishing', websiteUrl: 'https://www.ospreypublishing.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ospreypublishing.com/uk/offers/'] },
  { name: 'Wordery', websiteUrl: 'https://wordery.com', categorySlug: 'kitap-hobi', seedUrls: ['https://wordery.com/deals', 'https://wordery.com/top-100'] },
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
  console.log('=== UK Brand Seeding Script ===\n');

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
        where: { slug_market: { slug, market: 'UK' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'UK',
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
            market: 'UK',
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'UK' },
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
  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'UK' } });
  console.log(`Total active UK sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=UK');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
