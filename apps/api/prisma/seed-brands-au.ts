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
  // 1) Shopping (alisveris) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon AU', websiteUrl: 'https://www.amazon.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.com.au/deals', 'https://www.amazon.com.au/gp/goldbox'] },
  { name: 'eBay AU', websiteUrl: 'https://www.ebay.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.com.au/deals', 'https://www.ebay.com.au/b/Daily-Deals/'] },
  { name: 'Kmart AU', websiteUrl: 'https://www.kmart.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.kmart.com.au/category/shop-all-deals/', 'https://www.kmart.com.au/category/new-lower-prices/'] },
  { name: 'Target AU', websiteUrl: 'https://www.target.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.target.com.au/c/clearance', 'https://www.target.com.au/c/sale'] },
  { name: 'Big W', websiteUrl: 'https://www.bigw.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.bigw.com.au/deals', 'https://www.bigw.com.au/sale'] },
  { name: 'Myer', websiteUrl: 'https://www.myer.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.myer.com.au/c/sale', 'https://www.myer.com.au/c/offers'] },
  { name: 'David Jones', websiteUrl: 'https://www.davidjones.com', categorySlug: 'alisveris', seedUrls: ['https://www.davidjones.com/sale', 'https://www.davidjones.com/clearance'] },
  { name: 'Catch', websiteUrl: 'https://www.catch.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.catch.com.au/deals/', 'https://www.catch.com.au/event/'] },
  { name: 'Kogan', websiteUrl: 'https://www.kogan.com', categorySlug: 'alisveris', seedUrls: ['https://www.kogan.com/au/deals/', 'https://www.kogan.com/au/sale/'] },
  { name: 'The Iconic', websiteUrl: 'https://www.theiconic.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.theiconic.com.au/sale/', 'https://www.theiconic.com.au/outlet/'] },
  { name: 'OzBargain', websiteUrl: 'https://www.ozbargain.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.ozbargain.com.au/deals'] },
  { name: 'Costco AU', websiteUrl: 'https://www.costco.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.costco.com.au/c/online-deals', 'https://www.costco.com.au/c/warehouse-hot-buys'] },
  { name: 'The Good Guys', websiteUrl: 'https://www.thegoodguys.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.thegoodguys.com.au/sale'] },
  { name: 'Best and Less', websiteUrl: 'https://www.bestandless.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.bestandless.com.au/sale'] },
  { name: 'Aldi AU', websiteUrl: 'https://www.aldi.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.aldi.com.au/en/special-buys/', 'https://www.aldi.com.au/en/special-buys/special-buys-wed/'] },
  { name: 'Groupon AU', websiteUrl: 'https://www.groupon.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.groupon.com.au/goods/deals'] },
  { name: 'Temple and Webster', websiteUrl: 'https://www.templeandwebster.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.templeandwebster.com.au/sale.html', 'https://www.templeandwebster.com.au/daily-deals.html'] },
  { name: 'Marketplace by Myer', websiteUrl: 'https://www.myer.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.myer.com.au/c/offers', 'https://www.myer.com.au/c/sale/clearance'] },
  { name: 'Crazysales', websiteUrl: 'https://www.crazysales.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.crazysales.com.au/deals/', 'https://www.crazysales.com.au/sale/'] },
  { name: 'Temu AU', websiteUrl: 'https://www.temu.com/au', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/au/deals', 'https://www.temu.com/au/sale'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Harvey Norman', websiteUrl: 'https://www.harveynorman.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.harveynorman.com.au/deals/', 'https://www.harveynorman.com.au/sale/'] },
  { name: 'Kogan Electronics', websiteUrl: 'https://www.kogan.com', categorySlug: 'elektronik', seedUrls: ['https://www.kogan.com/au/electronics/', 'https://www.kogan.com/au/deals/electronics/'] },
  { name: 'Apple AU', websiteUrl: 'https://www.apple.com/au', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/au/shop/buy-iphone'] },
  { name: 'Samsung AU', websiteUrl: 'https://www.samsung.com/au', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/au/offer/'] },
  { name: 'Dell AU', websiteUrl: 'https://www.dell.com/en-au', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-au/shop/deals', 'https://www.dell.com/en-au/shop/sale'] },
  { name: 'Lenovo AU', websiteUrl: 'https://www.lenovo.com/au/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/au/en/d/deals/'] },
  { name: 'HP AU', websiteUrl: 'https://www.hp.com/au-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/au-en/shop/offer.aspx?p=c-deals'] },
  { name: 'Sony AU', websiteUrl: 'https://www.sony.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.sony.com.au/promotions', 'https://www.sony.com.au/section/promotions'] },
  { name: 'LG AU', websiteUrl: 'https://www.lg.com/au', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/au/promotions/'] },
  { name: 'Google Store AU', websiteUrl: 'https://store.google.com/au', categorySlug: 'elektronik', seedUrls: ['https://store.google.com/au/collection/offers'] },
  { name: 'Scorptec', websiteUrl: 'https://www.scorptec.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.scorptec.com.au/deals', 'https://www.scorptec.com.au/sale'] },
  { name: 'Nikon AU', websiteUrl: 'https://www.nikon.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.com.au/en_AU/learn-and-explore/promotions.page'] },
  { name: 'Logitech AU', websiteUrl: 'https://www.logitech.com/en-au', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/en-au/promotions.html'] },
  { name: 'Dyson AU', websiteUrl: 'https://www.dyson.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.com.au/offers'] },
  { name: 'Catch Electronics', websiteUrl: 'https://www.catch.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.catch.com.au/shop/electronics/'] },
  { name: 'Telstra', websiteUrl: 'https://www.telstra.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.telstra.com.au/deals'] },
  { name: 'Optus', websiteUrl: 'https://www.optus.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.optus.com.au/deals', 'https://www.optus.com.au/shop/deals'] },
  { name: 'Vodafone AU', websiteUrl: 'https://www.vodafone.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.vodafone.com.au/deals', 'https://www.vodafone.com.au/plans/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Clothing & Fashion (giyim-moda) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'The Iconic Fashion', websiteUrl: 'https://www.theiconic.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.theiconic.com.au/sale/', 'https://www.theiconic.com.au/outlet/'] },
  { name: 'Cotton On', websiteUrl: 'https://www.cottonon.com/AU', categorySlug: 'giyim-moda', seedUrls: ['https://www.cottonon.com/AU/sale/', 'https://www.cottonon.com/AU/deals/'] },
  { name: 'Country Road', websiteUrl: 'https://www.countryroad.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.countryroad.com.au/sale/', 'https://www.countryroad.com.au/shop/woman/sale/'] },
  { name: 'Witchery', websiteUrl: 'https://www.witchery.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.witchery.com.au/sale/', 'https://www.witchery.com.au/collections/sale'] },
  { name: 'Seed Heritage', websiteUrl: 'https://www.seedheritage.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.seedheritage.com/sale/'] },
  { name: 'Zimmermann', websiteUrl: 'https://www.zimmermannwear.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.zimmermannwear.com/sale'] },
  { name: 'Sass and Bide', websiteUrl: 'https://www.sassandbide.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sassandbide.com/sale'] },
  { name: 'Myer Fashion', websiteUrl: 'https://www.myer.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.myer.com.au/c/sale/women', 'https://www.myer.com.au/c/sale/men'] },
  { name: 'David Jones Fashion', websiteUrl: 'https://www.davidjones.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.davidjones.com/sale/women', 'https://www.davidjones.com/sale/men'] },
  { name: 'H&M AU', websiteUrl: 'https://www2.hm.com/en_au', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/en_au/sale.html'] },
  { name: 'Zara AU', websiteUrl: 'https://www.zara.com/au', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/au/en/z-sale-l1702.html'] },
  { name: 'ASOS AU', websiteUrl: 'https://www.asos.com/au', categorySlug: 'giyim-moda', seedUrls: ['https://www.asos.com/au/women/sale/', 'https://www.asos.com/au/men/sale/'] },
  { name: 'Glue Store', websiteUrl: 'https://www.gluestore.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.gluestore.com.au/sale'] },
  { name: 'Princess Polly', websiteUrl: 'https://www.princesspolly.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.princesspolly.com.au/collections/sale'] },
  { name: 'Showpo', websiteUrl: 'https://www.showpo.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.showpo.com/sale'] },
  { name: 'Jeanswest', websiteUrl: 'https://www.jeanswest.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.jeanswest.com.au/sale/'] },
  { name: 'Just Jeans', websiteUrl: 'https://www.justjeans.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.justjeans.com.au/sale'] },
  { name: 'Forever New', websiteUrl: 'https://www.forevernew.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.forevernew.com.au/sale'] },
  { name: 'R.M.Williams', websiteUrl: 'https://www.rmwilliams.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.rmwilliams.com.au/sale/'] },
  { name: 'Bonds', websiteUrl: 'https://www.bonds.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.bonds.com.au/sale/'] },
  { name: 'Cue', websiteUrl: 'https://www.cue.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.cue.com.au/sale'] },
  { name: 'Review', websiteUrl: 'https://www.review-australia.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.review-australia.com/au/sale/'] },
  { name: 'Industrie', websiteUrl: 'https://www.industrie.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.industrie.com.au/sale'] },
  { name: 'Rollie Nation', websiteUrl: 'https://www.rollienation.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.rollienation.com/collections/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Bunnings', websiteUrl: 'https://www.bunnings.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.bunnings.com.au/our-range/specials', 'https://www.bunnings.com.au/our-range/specials/lowest-prices'] },
  { name: 'IKEA AU', websiteUrl: 'https://www.ikea.com/au/en', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/au/en/offers/', 'https://www.ikea.com/au/en/campaigns/'] },
  { name: 'Freedom Furniture', websiteUrl: 'https://www.freedom.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.freedom.com.au/sale', 'https://www.freedom.com.au/deals'] },
  { name: 'Harvey Norman Home', websiteUrl: 'https://www.harveynorman.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.harveynorman.com.au/sale/furniture-bedding/'] },
  { name: 'Temple and Webster Home', websiteUrl: 'https://www.templeandwebster.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.templeandwebster.com.au/sale.html', 'https://www.templeandwebster.com.au/daily-deals.html'] },
  { name: 'Amart Furniture', websiteUrl: 'https://www.amartfurniture.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.amartfurniture.com.au/sale/'] },
  { name: 'Pillow Talk', websiteUrl: 'https://www.pillowtalk.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.pillowtalk.com.au/sale'] },
  { name: 'West Elm AU', websiteUrl: 'https://www.westelm.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.westelm.com.au/sale'] },
  { name: 'Pottery Barn AU', websiteUrl: 'https://www.potterybarn.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.potterybarn.com.au/sale'] },
  { name: 'Beacon Lighting', websiteUrl: 'https://www.beaconlighting.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.beaconlighting.com.au/sale'] },
  { name: 'Brosa', websiteUrl: 'https://www.brosa.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.brosa.com.au/sale'] },
  { name: 'Domayne', websiteUrl: 'https://www.domayne.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.domayne.com.au/sale', 'https://www.domayne.com.au/deals'] },
  { name: 'Bed Bath N Table', websiteUrl: 'https://www.bedbathntable.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.bedbathntable.com.au/sale'] },
  { name: 'Nick Scali', websiteUrl: 'https://www.nickscali.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.nickscali.com.au/promotions'] },
  { name: 'Zanui', websiteUrl: 'https://www.zanui.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.zanui.com.au/sale/'] },
  { name: 'House', websiteUrl: 'https://www.house.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.house.com.au/sale'] },
  { name: 'Kitchen Warehouse', websiteUrl: 'https://www.kitchenwarehouse.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.kitchenwarehouse.com.au/sale', 'https://www.kitchenwarehouse.com.au/clearance'] },
  { name: 'Myer Home', websiteUrl: 'https://www.myer.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.myer.com.au/c/sale/home'] },
  { name: 'Forty Winks', websiteUrl: 'https://www.fortywinks.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.fortywinks.com.au/sale'] },
  { name: 'Early Settler', websiteUrl: 'https://www.earlysettler.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.earlysettler.com.au/sale'] },
  // ═══════════════════════════════════════════════════════
  // 5) Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Woolworths', websiteUrl: 'https://www.woolworths.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.woolworths.com.au/shop/browse/specials', 'https://www.woolworths.com.au/shop/browse/half-price-specials'] },
  { name: 'Coles', websiteUrl: 'https://www.coles.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.coles.com.au/on-special', 'https://www.coles.com.au/half-price-specials'] },
  { name: 'Aldi Grocery', websiteUrl: 'https://www.aldi.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.aldi.com.au/en/special-buys/', 'https://www.aldi.com.au/en/groceries/super-savers/'] },
  { name: 'IGA', websiteUrl: 'https://www.iga.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.iga.com.au/catalogue/'] },
  { name: 'Costco Grocery AU', websiteUrl: 'https://www.costco.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.costco.com.au/c/grocery-household'] },
  { name: 'Harris Farm Markets', websiteUrl: 'https://www.harrisfarm.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.harrisfarm.com.au/specials/'] },
  { name: 'Ritchies', websiteUrl: 'https://www.ritchies.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.ritchies.com.au/specials'] },
  { name: 'FoodWorks', websiteUrl: 'https://www.foodworks.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.foodworks.com.au/specials'] },
  { name: 'Dan Murphy', websiteUrl: 'https://www.danmurphys.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.danmurphys.com.au/deals', 'https://www.danmurphys.com.au/specials'] },
  { name: 'BWS', websiteUrl: 'https://bws.com.au', categorySlug: 'gida-market', seedUrls: ['https://bws.com.au/specials'] },
  { name: 'Liquorland', websiteUrl: 'https://www.liquorland.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.liquorland.com.au/specials'] },
  { name: 'First Choice Liquor', websiteUrl: 'https://www.firstchoiceliquor.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.firstchoiceliquor.com.au/specials', 'https://www.firstchoiceliquor.com.au/deals'] },
  { name: 'Vintage Cellars', websiteUrl: 'https://www.vintagecellars.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.vintagecellars.com.au/specials'] },
  { name: 'Hello Fresh AU', websiteUrl: 'https://www.hellofresh.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.hellofresh.com.au/deals/'] },
  { name: 'Chemist Warehouse Food', websiteUrl: 'https://www.chemistwarehouse.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.chemistwarehouse.com.au/shop-online/1115/health-foods'] },
  { name: 'Healthy Life', websiteUrl: 'https://www.healthylife.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.healthylife.com.au/specials'] },
  { name: 'Coles Online', websiteUrl: 'https://shop.coles.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.coles.com.au/on-special', 'https://www.coles.com.au/browse/specials'] },
  { name: 'Woolworths Metro', websiteUrl: 'https://www.woolworths.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.woolworths.com.au/shop/browse/specials/prices-dropped'] },
  { name: 'T2 Tea', websiteUrl: 'https://www.t2tea.com', categorySlug: 'gida-market', seedUrls: ['https://www.t2tea.com/en/au/sale/'] },
  { name: 'Aldi Liquor', websiteUrl: 'https://www.aldi.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.aldi.com.au/en/groceries/liquor/'] },
  { name: 'Macro Wholefoods', websiteUrl: 'https://www.woolworths.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.woolworths.com.au/shop/browse/macro'] },
  { name: 'Youfoodz', websiteUrl: 'https://www.youfoodz.com', categorySlug: 'gida-market', seedUrls: ['https://www.youfoodz.com/deals'] },
  { name: 'My Muscle Chef', websiteUrl: 'https://www.mymusclechef.com', categorySlug: 'gida-market', seedUrls: ['https://www.mymusclechef.com/deals'] },
  { name: 'EveryPlate AU', websiteUrl: 'https://www.everyplate.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.everyplate.com.au/deals/'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Drink / Restaurants (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'McDonald\'s AU', websiteUrl: 'https://mcdonalds.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://mcdonalds.com.au/deals', 'https://mcdonalds.com.au/mymaccas-app-deals'] },
  { name: 'KFC AU', websiteUrl: 'https://www.kfc.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.com.au/deals', 'https://www.kfc.com.au/offers'] },
  { name: 'Hungry Jack\'s', websiteUrl: 'https://www.hungryjacks.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.hungryjacks.com.au/offers', 'https://www.hungryjacks.com.au/deals'] },
  { name: 'Domino\'s AU', websiteUrl: 'https://www.dominos.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.au/menu/coupons', 'https://www.dominos.com.au/deals'] },
  { name: 'Pizza Hut AU', websiteUrl: 'https://www.pizzahut.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.au/deals', 'https://www.pizzahut.com.au/menu/deals-combos'] },
  { name: 'Nando\'s AU', websiteUrl: 'https://www.nandos.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.com.au/deals', 'https://www.nandos.com.au/offers'] },
  { name: 'Grill\'d', websiteUrl: 'https://www.grilld.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.grilld.com.au/deals', 'https://www.grilld.com.au/promotions'] },
  { name: 'Menulog', websiteUrl: 'https://www.menulog.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.menulog.com.au/deals'] },
  { name: 'Uber Eats AU', websiteUrl: 'https://www.ubereats.com/au', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/au/deals'] },
  { name: 'DoorDash AU', websiteUrl: 'https://www.doordash.com/en-AU', categorySlug: 'yeme-icme', seedUrls: ['https://www.doordash.com/en-AU/promos/'] },
  { name: 'Deliveroo AU', websiteUrl: 'https://deliveroo.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://deliveroo.com.au/offers'] },
  { name: 'Roll\'d', websiteUrl: 'https://www.rolld.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.rolld.com.au/deals'] },
  { name: 'Betty\'s Burgers', websiteUrl: 'https://www.bettysburgers.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.bettysburgers.com.au/deals'] },
  { name: 'Hog\'s Breath Cafe', websiteUrl: 'https://www.hogsbreath.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.hogsbreath.com.au/deals', 'https://www.hogsbreath.com.au/promotions'] },
  // ═══════════════════════════════════════════════════════
  // 7) Beauty & Personal Care (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Chemist Warehouse', websiteUrl: 'https://www.chemistwarehouse.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.chemistwarehouse.com.au/shop-online/256/beauty', 'https://www.chemistwarehouse.com.au/sale'] },
  { name: 'Priceline Pharmacy', websiteUrl: 'https://www.priceline.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.priceline.com.au/sale', 'https://www.priceline.com.au/beauty/sale'] },
  { name: 'Sephora AU', websiteUrl: 'https://www.sephora.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.com.au/sale'] },
  { name: 'Adore Beauty', websiteUrl: 'https://www.adorebeauty.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.adorebeauty.com.au/sale', 'https://www.adorebeauty.com.au/offers'] },
  { name: 'L\'Occitane AU', websiteUrl: 'https://au.loccitane.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://au.loccitane.com/sale', 'https://au.loccitane.com/offers'] },
  { name: 'Clinique AU', websiteUrl: 'https://www.clinique.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.au/offers'] },
  { name: 'Aesop', websiteUrl: 'https://www.aesop.com/au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.aesop.com/au/r/offers/'] },
  { name: 'Jurlique', websiteUrl: 'https://www.jurlique.com/au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.jurlique.com/au/sale/', 'https://www.jurlique.com/au/offers/'] },
  { name: 'Lush AU', websiteUrl: 'https://www.lush.com/au/en', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/au/en/c/sale'] },
  { name: 'Ella Bache', websiteUrl: 'https://www.ellabache.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ellabache.com.au/sale/'] },
  { name: 'Kiehl\'s AU', websiteUrl: 'https://www.kiehls.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.com.au/offers'] },
  { name: 'Bondi Sands', websiteUrl: 'https://bondisands.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://bondisands.com.au/collections/sale'] },
  { name: 'Sand and Sky', websiteUrl: 'https://www.sandandsky.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sandandsky.com/collections/sale'] },
  { name: 'Myer Beauty', websiteUrl: 'https://www.myer.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.myer.com.au/c/sale/beauty'] },
  { name: 'David Jones Beauty', websiteUrl: 'https://www.davidjones.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.davidjones.com/sale/beauty'] },
  { name: 'Shaver Shop', websiteUrl: 'https://www.shavershop.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.shavershop.com.au/sale', 'https://www.shavershop.com.au/deals'] },
  { name: 'Silk Oil of Morocco', websiteUrl: 'https://silkoilofmorocco.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://silkoilofmorocco.com.au/collections/sale'] },
  { name: 'Kora Organics', websiteUrl: 'https://www.koraorganics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.koraorganics.com/collections/sale'] },
  { name: 'Beauty Depot AU', websiteUrl: 'https://www.beautydepot.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.beautydepot.com.au/sale'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Rebel Sport', websiteUrl: 'https://www.rebelsport.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.rebelsport.com.au/sale', 'https://www.rebelsport.com.au/deals'] },
  { name: 'BCF', websiteUrl: 'https://www.bcf.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bcf.com.au/sale', 'https://www.bcf.com.au/deals'] },
  { name: 'Kathmandu', websiteUrl: 'https://www.kathmandu.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.kathmandu.com.au/sale'] },
  { name: 'Macpac', websiteUrl: 'https://www.macpac.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.macpac.com.au/sale/', 'https://www.macpac.com.au/clearance/'] },
  { name: 'Nike AU', websiteUrl: 'https://www.nike.com/au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/au/w/sale-3yaep'] },
  { name: 'Adidas AU', websiteUrl: 'https://www.adidas.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.com.au/sale', 'https://www.adidas.com.au/outlet'] },
  { name: 'New Balance AU', websiteUrl: 'https://www.newbalance.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.au/sale/'] },
  { name: 'Puma AU', websiteUrl: 'https://au.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://au.puma.com/au/en/sale'] },
  { name: 'The North Face AU', websiteUrl: 'https://www.thenorthface.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.au/sale/'] },
  { name: 'Patagonia AU', websiteUrl: 'https://www.patagonia.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.patagonia.com.au/collections/sale'] },
  { name: 'Quiksilver AU', websiteUrl: 'https://www.quiksilver.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.quiksilver.com.au/sale/'] },
  { name: 'Helly Hansen AU', websiteUrl: 'https://www.hellyhansen.com/en_au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.com/en_au/sale'] },
  { name: 'Lorna Jane', websiteUrl: 'https://www.lornajane.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lornajane.com.au/sale'] },
  { name: 'Lululemon AU', websiteUrl: 'https://www.lululemon.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lululemon.com.au/en-au/c/sale/'] },
  { name: 'Hype DC', websiteUrl: 'https://www.hypedc.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hypedc.com/sale'] },
  { name: 'Skechers AU', websiteUrl: 'https://www.skechers.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.au/sale/'] },
  { name: 'Brooks Running AU', websiteUrl: 'https://www.brooksrunning.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.brooksrunning.com.au/sale/'] },
  { name: 'Torpedo7 AU', websiteUrl: 'https://www.torpedo7.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.torpedo7.com.au/sale'] },
  { name: 'SurfStitch', websiteUrl: 'https://www.surfstitch.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.surfstitch.com/sale'] },
  { name: 'Wild Earth', websiteUrl: 'https://www.wildearth.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wildearth.com.au/sale', 'https://www.wildearth.com.au/clearance'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Qantas', websiteUrl: 'https://www.qantas.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.qantas.com/au/en/flight-deals.html'] },
  { name: 'Jetstar', websiteUrl: 'https://www.jetstar.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jetstar.com/au/en/deals'] },
  { name: 'Webjet', websiteUrl: 'https://www.webjet.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.webjet.com.au/flights/deals/', 'https://www.webjet.com.au/holidays/deals/'] },
  { name: 'Flight Centre AU', websiteUrl: 'https://www.flightcentre.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flightcentre.com.au/deals'] },
  { name: 'Expedia AU', websiteUrl: 'https://www.expedia.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.au/deals', 'https://www.expedia.com.au/lp/deals'] },
  { name: 'Booking.com AU', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.en-gb.html'] },
  { name: 'Skyscanner AU', websiteUrl: 'https://www.skyscanner.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.com.au/deals'] },
  { name: 'Wotif', websiteUrl: 'https://www.wotif.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.wotif.com/deals', 'https://www.wotif.com/lp/deals'] },
  { name: 'Lastminute AU', websiteUrl: 'https://www.lastminute.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lastminute.com.au/deals/', 'https://www.lastminute.com.au/holidays/deals/'] },
  { name: 'TripADeal', websiteUrl: 'https://www.tripadeal.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tripadeal.com.au/deals'] },
  { name: 'Hertz AU', websiteUrl: 'https://www.hertz.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.com.au/rentacar/specials/'] },
  { name: 'Budget AU', websiteUrl: 'https://www.budget.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.budget.com.au/en/deals'] },
  { name: 'Avis AU', websiteUrl: 'https://www.avis.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avis.com.au/deals'] },
  { name: 'Jucy AU', websiteUrl: 'https://www.jucy.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jucy.com.au/deals/'] },
  { name: 'Apollo Motorhome AU', websiteUrl: 'https://www.apollocamper.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.apollocamper.com/au/specials/'] },
  { name: 'Greyhound Australia', websiteUrl: 'https://www.greyhound.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.greyhound.com.au/deals'] },
  { name: 'Tourism Australia', websiteUrl: 'https://www.australia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.australia.com/en/deals-and-travel-packages.html'] },
  { name: 'Helloworld', websiteUrl: 'https://www.helloworld.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.helloworld.com.au/deals'] },
  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Commonwealth Bank', websiteUrl: 'https://www.commbank.com.au', categorySlug: 'finans', seedUrls: ['https://www.commbank.com.au/home-loans/offers.html'] },
  { name: 'ANZ', websiteUrl: 'https://www.anz.com.au', categorySlug: 'finans', seedUrls: ['https://www.anz.com.au/personal/home-loans/offers/'] },
  { name: 'Westpac', websiteUrl: 'https://www.westpac.com.au', categorySlug: 'finans', seedUrls: ['https://www.westpac.com.au/personal-banking/offers/'] },
  { name: 'NAB', websiteUrl: 'https://www.nab.com.au', categorySlug: 'finans', seedUrls: ['https://www.nab.com.au/personal/offers', 'https://www.nab.com.au/personal/home-loans/offers'] },
  { name: 'Bendigo Bank', websiteUrl: 'https://www.bendigobank.com.au', categorySlug: 'finans', seedUrls: ['https://www.bendigobank.com.au/personal/offers/'] },
  { name: 'Suncorp Bank', websiteUrl: 'https://www.suncorp.com.au', categorySlug: 'finans', seedUrls: ['https://www.suncorp.com.au/banking/offers.html'] },
  { name: 'Up Bank', websiteUrl: 'https://up.com.au', categorySlug: 'finans', seedUrls: ['https://up.com.au/blog/'] },
  { name: 'Latitude Financial', websiteUrl: 'https://www.latitudefinancial.com.au', categorySlug: 'finans', seedUrls: ['https://www.latitudefinancial.com.au/offers/'] },
  { name: 'Finder AU', websiteUrl: 'https://www.finder.com.au', categorySlug: 'finans', seedUrls: ['https://www.finder.com.au/deals', 'https://www.finder.com.au/credit-cards/deals'] },
  { name: 'Greater Bank', websiteUrl: 'https://www.greater.com.au', categorySlug: 'finans', seedUrls: ['https://www.greater.com.au/personal/offers'] },
  { name: 'Heritage Bank', websiteUrl: 'https://www.heritage.com.au', categorySlug: 'finans', seedUrls: ['https://www.heritage.com.au/offers'] },
  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Suncorp Insurance', websiteUrl: 'https://www.suncorp.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.suncorp.com.au/insurance/offers.html'] },
  { name: 'Allianz AU', websiteUrl: 'https://www.allianz.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.com.au/offers/'] },
  { name: 'QBE Insurance AU', websiteUrl: 'https://www.qbe.com/au', categorySlug: 'sigorta', seedUrls: ['https://www.qbe.com/au/offers'] },
  { name: 'Youi', websiteUrl: 'https://www.youi.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.youi.com.au/offers'] },
  { name: 'Bupa AU', websiteUrl: 'https://www.bupa.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.bupa.com.au/offers'] },
  { name: 'HBF', websiteUrl: 'https://www.hbf.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.hbf.com.au/health-insurance/offers'] },
  { name: 'HCF', websiteUrl: 'https://www.hcf.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.hcf.com.au/health-insurance/offers'] },
  { name: 'NIB', websiteUrl: 'https://www.nib.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.nib.com.au/health-insurance/offers'] },
  { name: 'iSelect', websiteUrl: 'https://www.iselect.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.iselect.com.au/deals/'] },
  { name: 'Real Insurance', websiteUrl: 'https://www.realinsurance.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.realinsurance.com.au/offers'] },
  { name: 'Coles Insurance', websiteUrl: 'https://www.colesinsurance.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.colesinsurance.com.au/offers/'] },
  { name: 'Defence Health', websiteUrl: 'https://www.defencehealth.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.defencehealth.com.au/offers'] },
  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota AU', websiteUrl: 'https://www.toyota.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.au/offers', 'https://www.toyota.com.au/special-offers'] },
  { name: 'Mazda AU', websiteUrl: 'https://www.mazda.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.com.au/offers/'] },
  { name: 'Hyundai AU', websiteUrl: 'https://www.hyundai.com/au', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/au/en/offers.html'] },
  { name: 'Kia AU', websiteUrl: 'https://www.kia.com/au', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/au/offers.html'] },
  { name: 'Ford AU', websiteUrl: 'https://www.ford.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.ford.com.au/offers/'] },
  { name: 'Holden (GM)', websiteUrl: 'https://www.holden.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.holden.com.au/offers'] },
  { name: 'Mitsubishi AU', websiteUrl: 'https://www.mitsubishi-motors.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.com.au/offers'] },
  { name: 'Nissan AU', websiteUrl: 'https://www.nissan.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.au/offers.html'] },
  { name: 'Honda AU', websiteUrl: 'https://www.honda.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.au/offers'] },
  { name: 'Mercedes-Benz AU', websiteUrl: 'https://www.mercedes-benz.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.au/passengercars/campaigns.html'] },
  { name: 'Audi AU', websiteUrl: 'https://www.audi.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.au/au/web/en/offers.html'] },
  { name: 'Tesla AU', websiteUrl: 'https://www.tesla.com/en_au', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/en_au/inventory'] },
  { name: 'Isuzu UTE', websiteUrl: 'https://www.isuzuute.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.isuzuute.com.au/offers/'] },
  { name: 'Suzuki AU', websiteUrl: 'https://www.suzuki.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.com.au/offers/'] },
  { name: 'GWM AU', websiteUrl: 'https://www.gwmhaval.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.gwmhaval.com.au/offers'] },
  { name: 'Supercheap Auto', websiteUrl: 'https://www.supercheapauto.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.supercheapauto.com.au/sale', 'https://www.supercheapauto.com.au/deals'] },
  { name: 'Repco', websiteUrl: 'https://www.repco.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.repco.com.au/deals', 'https://www.repco.com.au/sale'] },
  { name: 'Autobarn', websiteUrl: 'https://www.autobarn.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.autobarn.com.au/sale', 'https://www.autobarn.com.au/deals'] },
  { name: 'mycar (Kmart Tyre & Auto)', websiteUrl: 'https://www.mycar.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.mycar.com.au/offers', 'https://www.mycar.com.au/deals'] },
  { name: 'Carsales', websiteUrl: 'https://www.carsales.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.carsales.com.au/new-cars/offers/'] },
  { name: 'CarsGuide', websiteUrl: 'https://www.carsguide.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.carsguide.com.au/car-news/deals'] },
  { name: 'Volvo AU', websiteUrl: 'https://www.volvocars.com/au', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/au/offers/'] },
  { name: 'MG Motor AU', websiteUrl: 'https://mgmotor.com.au', categorySlug: 'otomobil', seedUrls: ['https://mgmotor.com.au/offers/'] },
  { name: 'Peugeot AU', websiteUrl: 'https://www.peugeot.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.au/offers/'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Booktopia', websiteUrl: 'https://www.booktopia.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.booktopia.com.au/deals', 'https://www.booktopia.com.au/book-sale'] },
  { name: 'Dymocks', websiteUrl: 'https://www.dymocks.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dymocks.com.au/sale', 'https://www.dymocks.com.au/specials'] },
  { name: 'Book Depository AU', websiteUrl: 'https://www.bookdepository.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookdepository.com/deals'] },
  { name: 'Angus and Robertson', websiteUrl: 'https://www.angusrobertson.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.angusrobertson.com.au/sale'] },
  { name: 'Amazon AU Books', websiteUrl: 'https://www.amazon.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.au/b?node=4851626051'] },
  { name: 'Games World', websiteUrl: 'https://www.gamesworld.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gamesworld.com.au/sale/'] },
  { name: 'EB Games', websiteUrl: 'https://www.ebgames.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ebgames.com.au/deals', 'https://www.ebgames.com.au/sale'] },
  { name: 'Lego AU', websiteUrl: 'https://www.lego.com/en-au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-au/categories/sales-and-deals'] },
  { name: 'Hobbyco', websiteUrl: 'https://www.hobbyco.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbyco.com.au/sale'] },
  { name: 'Eckersley\'s', websiteUrl: 'https://www.eckersleys.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.eckersleys.com.au/sale'] },
  { name: 'Lincraft', websiteUrl: 'https://www.lincraft.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lincraft.com.au/sale'] },
  { name: 'Mr Toys', websiteUrl: 'https://www.mrtoys.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mrtoys.com.au/sale'] },
  { name: 'Gamesmen', websiteUrl: 'https://www.gamesmen.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gamesmen.com.au/sale'] },
  { name: 'Mighty Ape AU', websiteUrl: 'https://www.mightyape.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mightyape.com.au/deals', 'https://www.mightyape.com.au/sale'] },
  { name: 'Audible AU', websiteUrl: 'https://www.audible.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.com.au/ep/deals'] },
  { name: 'Kobo AU', websiteUrl: 'https://www.kobo.com/au/en', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kobo.com/au/en/p/deals'] },
  { name: 'Paintback AU', websiteUrl: 'https://www.artshop.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.artshop.com.au/sale/'] },
  { name: 'Milligram', websiteUrl: 'https://milligram.com', categorySlug: 'kitap-hobi', seedUrls: ['https://milligram.com/sale'] },
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
  console.log('=== AU Brand Seeding Script ===\n');
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
        where: { slug_market: { slug, market: 'AU' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'AU', categoryId },
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
            market: 'AU',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'AU' },
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

  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'AU' } });
  console.log(`Total active AU sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=AU');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
