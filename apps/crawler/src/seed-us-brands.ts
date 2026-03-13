/**
 * Seed US market brands and crawl sources into the database.
 * Run: npx ts-node src/seed-us-brands.ts
 */
import './config';
import { PrismaClient, CrawlMethod, Market } from '@prisma/client';

const prisma = new PrismaClient();

interface BrandEntry {
  name: string;
  slug: string;
  websiteUrl: string;
  dealUrls: string[]; // Multiple deal/offer/promo pages
}

interface CategoryBrands {
  categorySlug: string;
  brands: BrandEntry[];
}

const US_BRANDS: CategoryBrands[] = [
  // ═══════════════════════════════════════════════════════════
  // 1. SHOPPING (General Retail / Marketplace)
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'alisveris',
    brands: [
      { name: 'Amazon', slug: 'amazon', websiteUrl: 'https://www.amazon.com', dealUrls: ['https://www.amazon.com/deals', 'https://www.amazon.com/gp/goldbox', 'https://www.amazon.com/events/deals'] },
      { name: 'Walmart', slug: 'walmart', websiteUrl: 'https://www.walmart.com', dealUrls: ['https://www.walmart.com/shop/deals', 'https://www.walmart.com/cp/rollbacks/1474410'] },
      { name: 'Target', slug: 'target', websiteUrl: 'https://www.target.com', dealUrls: ['https://www.target.com/c/top-deals/-/N-4xw74', 'https://www.target.com/c/clearance/-/N-5q0ga'] },
      { name: 'Costco', slug: 'costco', websiteUrl: 'https://www.costco.com', dealUrls: ['https://www.costco.com/warehouse-hot-buys.html', 'https://www.costco.com/online-offers.html'] },
      { name: 'eBay', slug: 'ebay', websiteUrl: 'https://www.ebay.com', dealUrls: ['https://www.ebay.com/deals', 'https://www.ebay.com/globaldeals'] },
      { name: 'Etsy', slug: 'etsy', websiteUrl: 'https://www.etsy.com', dealUrls: ['https://www.etsy.com/featured/sales-and-deals'] },
      { name: 'Sam\'s Club', slug: 'sams-club', websiteUrl: 'https://www.samsclub.com', dealUrls: ['https://www.samsclub.com/shop/savings', 'https://www.samsclub.com/cp/instant-savings/15660127'] },
      { name: 'Dollar General', slug: 'dollar-general', websiteUrl: 'https://www.dollargeneral.com', dealUrls: ['https://www.dollargeneral.com/savings'] },
      { name: 'Dollar Tree', slug: 'dollar-tree', websiteUrl: 'https://www.dollartree.com', dealUrls: ['https://www.dollartree.com/c/new-arrivals'] },
      { name: 'Five Below', slug: 'five-below', websiteUrl: 'https://www.fivebelow.com', dealUrls: ['https://www.fivebelow.com/collections/deals'] },
      { name: 'TJ Maxx', slug: 'tj-maxx', websiteUrl: 'https://www.tjmaxx.com', dealUrls: ['https://www.tjmaxx.com/shop/clearance'] },
      { name: 'Marshalls', slug: 'marshalls', websiteUrl: 'https://www.marshalls.com', dealUrls: ['https://www.marshalls.com/shop/clearance'] },
      { name: 'Ross', slug: 'ross', websiteUrl: 'https://www.rossstores.com', dealUrls: ['https://www.rossstores.com/'] },
      { name: 'Big Lots', slug: 'big-lots', websiteUrl: 'https://www.biglots.com', dealUrls: ['https://www.biglots.com/'] },
      { name: 'Overstock', slug: 'overstock', websiteUrl: 'https://www.overstock.com', dealUrls: ['https://www.overstock.com/deals'] },
      { name: 'Wish', slug: 'wish', websiteUrl: 'https://www.wish.com', dealUrls: ['https://www.wish.com/feed/tabbed_feed_latest'] },
      { name: 'Temu', slug: 'temu', websiteUrl: 'https://www.temu.com', dealUrls: ['https://www.temu.com/deals', 'https://www.temu.com/flash-sale.html'] },
      { name: 'Kohl\'s', slug: 'kohls', websiteUrl: 'https://www.kohls.com', dealUrls: ['https://www.kohls.com/sale-event.jsp', 'https://www.kohls.com/sale/clearance.jsp'] },
      { name: 'Macy\'s', slug: 'macys', websiteUrl: 'https://www.macys.com', dealUrls: ['https://www.macys.com/shop/sale', 'https://www.macys.com/shop/sale/clearance'] },
      { name: 'Nordstrom', slug: 'nordstrom', websiteUrl: 'https://www.nordstrom.com', dealUrls: ['https://www.nordstrom.com/browse/sale', 'https://www.nordstromrack.com/clearance'] },
      { name: 'JCPenney', slug: 'jcpenney', websiteUrl: 'https://www.jcpenney.com', dealUrls: ['https://www.jcpenney.com/g/clearance', 'https://www.jcpenney.com/g/coupons-deals'] },
      { name: 'Nordstrom Rack', slug: 'nordstrom-rack', websiteUrl: 'https://www.nordstromrack.com', dealUrls: ['https://www.nordstromrack.com/clearance', 'https://www.nordstromrack.com/clearance'] },
      { name: 'Burlington', slug: 'burlington', websiteUrl: 'https://www.burlington.com', dealUrls: ['https://www.burlington.com/deals'] },
      { name: 'Groupon', slug: 'groupon', websiteUrl: 'https://www.groupon.com', dealUrls: ['https://www.groupon.com/local', 'https://www.groupon.com/local'] },
      { name: 'Slickdeals', slug: 'slickdeals', websiteUrl: 'https://www.slickdeals.net', dealUrls: ['https://slickdeals.net/deals/', 'https://slickdeals.net/coupons/'] },
      { name: 'RetailMeNot', slug: 'retailmenot', websiteUrl: 'https://www.retailmenot.com', dealUrls: ['https://www.retailmenot.com/deals', 'https://www.retailmenot.com/coupons'] },
      { name: 'BJ\'s Wholesale', slug: 'bjs-wholesale', websiteUrl: 'https://www.bjs.com', dealUrls: ['https://www.bjs.com/promos', 'https://www.bjs.com/savings'] },
      { name: 'Overstock / BBB', slug: 'overstock-bbb', websiteUrl: 'https://www.overstock.com', dealUrls: ['https://www.overstock.com/deals'] },
      { name: 'Rakuten', slug: 'rakuten', websiteUrl: 'https://www.rakuten.com', dealUrls: ['https://www.rakuten.com/stores', 'https://www.rakuten.com/coupons'] },
      { name: 'Honey / PayPal', slug: 'honey-paypal', websiteUrl: 'https://www.joinhoney.com', dealUrls: ['https://www.paypal.com/us/deals'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 2. ELECTRONICS
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'elektronik',
    brands: [
      { name: 'Best Buy', slug: 'best-buy', websiteUrl: 'https://www.bestbuy.com', dealUrls: ['https://www.bestbuy.com/site/misc/deal-of-the-day/pcmcat248000050016.c', 'https://www.bestbuy.com/site/electronics/top-deals/pcmcat1563299784494.c', 'https://www.bestbuy.com/site/misc/clearance-products/pcmcat152700050018.c'] },
      { name: 'Apple', slug: 'apple', websiteUrl: 'https://www.apple.com', dealUrls: ['https://www.apple.com/shop/refurbished', 'https://www.apple.com/shop/refurbished/mac'] },
      { name: 'Samsung', slug: 'samsung', websiteUrl: 'https://www.samsung.com', dealUrls: ['https://www.samsung.com/us/offer/', 'https://www.samsung.com/us/shop/cell-phone-offers/'] },
      { name: 'Newegg', slug: 'newegg', websiteUrl: 'https://www.newegg.com', dealUrls: ['https://www.newegg.com/Newegg-Deals/EventSaleStore/ID-9447', 'https://www.newegg.com/todays-deals'] },
      { name: 'B&H Photo', slug: 'bh-photo', websiteUrl: 'https://www.bhphotovideo.com', dealUrls: ['https://www.bhphotovideo.com/c/browse/Deal-Zone/ci/17590'] },
      { name: 'Microsoft', slug: 'microsoft', websiteUrl: 'https://www.microsoft.com', dealUrls: ['https://www.microsoft.com/en-us/store/b/sale', 'https://www.microsoft.com/en-us/store/collections/pcdeals'] },
      { name: 'Dell', slug: 'dell', websiteUrl: 'https://www.dell.com', dealUrls: ['https://www.dell.com/en-us/shop/deals', 'https://deals.dell.com/en-us'] },
      { name: 'HP', slug: 'hp', websiteUrl: 'https://www.hp.com', dealUrls: ['https://www.hp.com/us-en/shop/slp/weekly-deals', 'https://www.hp.com/us-en/shop/cv/hp-deals'] },
      { name: 'Lenovo', slug: 'lenovo', websiteUrl: 'https://www.lenovo.com', dealUrls: ['https://www.lenovo.com/us/en/d/deals/'] },
      { name: 'Sony', slug: 'sony', websiteUrl: 'https://www.sony.com', dealUrls: ['https://www.sony.com/en/deals', 'https://www.sony.com/en/electronics/deals'] },
      { name: 'LG', slug: 'lg', websiteUrl: 'https://www.lg.com', dealUrls: ['https://www.lg.com/us/promotions'] },
      { name: 'Google Store', slug: 'google-store', websiteUrl: 'https://store.google.com', dealUrls: ['https://store.google.com/us/collection/offers'] },
      { name: 'Bose', slug: 'bose', websiteUrl: 'https://www.bose.com', dealUrls: ['https://www.bose.com/c/refurbished', 'https://www.bose.com/c/sale'] },
      { name: 'Logitech', slug: 'logitech', websiteUrl: 'https://www.logitech.com', dealUrls: ['https://www.logitech.com/en-us/shop/deals'] },
      { name: 'Razer', slug: 'razer', websiteUrl: 'https://www.razer.com', dealUrls: ['https://www.razer.com/store/final-round'] },
      { name: 'Asus', slug: 'asus', websiteUrl: 'https://www.asus.com', dealUrls: ['https://www.asus.com/us/deals/'] },
      { name: 'Acer', slug: 'acer', websiteUrl: 'https://www.acer.com', dealUrls: ['https://store.acer.com/en-us/deals'] },
      { name: 'Nintendo', slug: 'nintendo', websiteUrl: 'https://www.nintendo.com', dealUrls: ['https://www.nintendo.com/us/store/sales-and-deals/'] },
      { name: 'GameStop', slug: 'gamestop', websiteUrl: 'https://www.gamestop.com', dealUrls: ['https://www.gamestop.com/deals', 'https://www.gamestop.com/collection/top-deals'] },
      { name: 'Monoprice', slug: 'monoprice', websiteUrl: 'https://www.monoprice.com', dealUrls: ['https://www.monoprice.com/pages/daily_deals'] },
      { name: 'Adorama', slug: 'adorama', websiteUrl: 'https://www.adorama.com', dealUrls: ['https://www.adorama.com/l/deals'] },
      { name: 'TCL', slug: 'tcl', websiteUrl: 'https://www.tcl.com', dealUrls: ['https://www.tcl.com/us/en/promotions'] },
      { name: 'JBL', slug: 'jbl', websiteUrl: 'https://www.jbl.com', dealUrls: ['https://www.jbl.com/sale/'] },
      { name: 'Ring', slug: 'ring', websiteUrl: 'https://ring.com', dealUrls: ['https://ring.com/collections/offers'] },
      { name: 'Anker', slug: 'anker', websiteUrl: 'https://www.anker.com', dealUrls: ['https://www.anker.com/deals'] },
      { name: 'Roku', slug: 'roku', websiteUrl: 'https://www.roku.com', dealUrls: ['https://www.roku.com/en-us/offers'] },
      { name: 'Sonos', slug: 'sonos', websiteUrl: 'https://www.sonos.com', dealUrls: ['https://www.sonos.com/en-us/shop/certified-refurbished'] },
      { name: 'Canon', slug: 'canon', websiteUrl: 'https://www.usa.canon.com', dealUrls: ['https://www.usa.canon.com/shop/refurbished'] },
      { name: 'GoPro', slug: 'gopro', websiteUrl: 'https://gopro.com', dealUrls: ['https://gopro.com/en/us/deals'] },
      { name: 'Staples', slug: 'staples', websiteUrl: 'https://www.staples.com', dealUrls: ['https://www.staples.com/deals/deals/BI1237923', 'https://www.staples.com/clearance/cat_CL160487'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 3. HOME & LIVING
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'ev-yasam',
    brands: [
      { name: 'IKEA', slug: 'ikea', websiteUrl: 'https://www.ikea.com', dealUrls: ['https://www.ikea.com/us/en/offers/', 'https://www.ikea.com/us/en/collections/low-price/'] },
      { name: 'Wayfair', slug: 'wayfair', websiteUrl: 'https://www.wayfair.com', dealUrls: ['https://www.wayfair.com/daily-sales', 'https://www.wayfair.com/deals'] },
      { name: 'The Home Depot', slug: 'home-depot', websiteUrl: 'https://www.homedepot.com', dealUrls: ['https://www.homedepot.com/c/Deals', 'https://www.homedepot.com/b/Special-Values/N-5yc1v'] },
      { name: 'Lowe\'s', slug: 'lowes', websiteUrl: 'https://www.lowes.com', dealUrls: ['https://www.lowes.com/l/shop/weekly-deals', 'https://www.lowes.com/l/shop/clearance-markdowns'] },
      { name: 'Pottery Barn', slug: 'pottery-barn', websiteUrl: 'https://www.potterybarn.com', dealUrls: ['https://www.potterybarn.com/shop/sale/'] },
      { name: 'West Elm', slug: 'west-elm', websiteUrl: 'https://www.westelm.com', dealUrls: ['https://www.westelm.com/shop/sale/'] },
      { name: 'Crate & Barrel', slug: 'crate-barrel', websiteUrl: 'https://www.crateandbarrel.com', dealUrls: ['https://www.crateandbarrel.com/sale'] },
      { name: 'CB2', slug: 'cb2', websiteUrl: 'https://www.cb2.com', dealUrls: ['https://www.cb2.com/sale'] },
      { name: 'Restoration Hardware', slug: 'restoration-hardware', websiteUrl: 'https://www.rh.com', dealUrls: ['https://www.rh.com/catalog/sale.jsp'] },
      { name: 'Williams-Sonoma', slug: 'williams-sonoma', websiteUrl: 'https://www.williams-sonoma.com', dealUrls: ['https://www.williams-sonoma.com/shop/sale/'] },
      { name: 'HomeGoods', slug: 'homegoods', websiteUrl: 'https://www.homegoods.com', dealUrls: ['https://www.homegoods.com/shop/clearance'] },
      { name: 'Ashley Furniture', slug: 'ashley-furniture', websiteUrl: 'https://www.ashleyfurniture.com', dealUrls: ['https://www.ashleyfurniture.com/c/deals/', 'https://www.ashleyfurniture.com/c/sale/'] },
      { name: 'Pier 1', slug: 'pier-1', websiteUrl: 'https://www.pier1.com', dealUrls: ['https://www.pier1.com/pages/sale'] },
      { name: 'Arhaus', slug: 'arhaus', websiteUrl: 'https://www.arhaus.com', dealUrls: ['https://www.arhaus.com/'] },
      { name: 'Ethan Allen', slug: 'ethan-allen', websiteUrl: 'https://www.ethanallen.com', dealUrls: ['https://www.ethanallen.com/en_US/shop-sale/'] },
      { name: 'Anthropologie Home', slug: 'anthropologie-home', websiteUrl: 'https://www.anthropologie.com', dealUrls: ['https://www.anthropologie.com/home-sale'] },
      { name: 'Rooms To Go', slug: 'rooms-to-go', websiteUrl: 'https://www.roomstogo.com', dealUrls: ['https://www.roomstogo.com/furniture/sale'] },
      { name: 'Overstock', slug: 'overstock-home', websiteUrl: 'https://www.overstock.com', dealUrls: ['https://www.overstock.com/deals', 'https://www.overstock.com/Home-Garden,/31/dept.html'] },
      { name: 'Overstock Home', slug: 'overstock-home-bb', websiteUrl: 'https://www.overstock.com', dealUrls: ['https://www.overstock.com/Home-Garden/Deals/store/20/dept.html'] },
      { name: 'Casper', slug: 'casper', websiteUrl: 'https://casper.com', dealUrls: ['https://casper.com/sale/'] },
      { name: 'Purple Mattress', slug: 'purple-mattress', websiteUrl: 'https://purple.com', dealUrls: ['https://purple.com/mattresses'] },
      { name: 'Dyson', slug: 'dyson', websiteUrl: 'https://www.dyson.com', dealUrls: ['https://www.dyson.com/deals', 'https://www.dyson.com/refurbished'] },
      { name: 'Brooklinen', slug: 'brooklinen', websiteUrl: 'https://www.brooklinen.com', dealUrls: ['https://www.brooklinen.com/collections/sale'] },
      { name: 'Ruggable', slug: 'ruggable', websiteUrl: 'https://ruggable.com', dealUrls: ['https://ruggable.com/collections/sale'] },
      { name: 'Article', slug: 'article', websiteUrl: 'https://www.article.com', dealUrls: ['https://www.article.com/sale'] },
      { name: 'Burrow', slug: 'burrow', websiteUrl: 'https://burrow.com', dealUrls: ['https://burrow.com/sale'] },
      { name: 'Ace Hardware', slug: 'ace-hardware', websiteUrl: 'https://www.acehardware.com', dealUrls: ['https://www.acehardware.com/sale'] },
      { name: 'Menards', slug: 'menards', websiteUrl: 'https://www.menards.com', dealUrls: ['https://www.menards.com/main/c-19342.htm'] },
      { name: 'Havertys', slug: 'havertys', websiteUrl: 'https://www.havertys.com', dealUrls: ['https://www.havertys.com/furniture/sale'] },
      { name: 'La-Z-Boy', slug: 'la-z-boy', websiteUrl: 'https://www.la-z-boy.com', dealUrls: ['https://www.la-z-boy.com/sale/'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 4. FINANCE
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'finans',
    brands: [
      { name: 'Chase', slug: 'chase', websiteUrl: 'https://www.chase.com', dealUrls: ['https://www.chase.com/personal/credit-cards', 'https://creditcards.chase.com/cash-back-credit-cards'] },
      { name: 'American Express', slug: 'amex', websiteUrl: 'https://www.americanexpress.com', dealUrls: ['https://www.americanexpress.com/us/credit-cards/', 'https://global.americanexpress.com/offers/eligible'] },
      { name: 'Capital One', slug: 'capital-one', websiteUrl: 'https://www.capitalone.com', dealUrls: ['https://www.capitalone.com/credit-cards/', 'https://www.capitalone.com/credit-cards/compare/'] },
      { name: 'Discover', slug: 'discover', websiteUrl: 'https://www.discover.com', dealUrls: ['https://www.discover.com/credit-cards/', 'https://www.discover.com/credit-cards/cash-back/'] },
      { name: 'Citi', slug: 'citi', websiteUrl: 'https://www.citi.com', dealUrls: ['https://www.citi.com/credit-cards/compare-credit-cards'] },
      { name: 'Bank of America', slug: 'bank-of-america', websiteUrl: 'https://www.bankofamerica.com', dealUrls: ['https://www.bankofamerica.com/credit-cards/'] },
      { name: 'Wells Fargo', slug: 'wells-fargo', websiteUrl: 'https://www.wellsfargo.com', dealUrls: ['https://www.wellsfargo.com/credit-cards/'] },
      { name: 'US Bank', slug: 'us-bank', websiteUrl: 'https://www.usbank.com', dealUrls: ['https://www.usbank.com/credit-cards.html'] },
      { name: 'PayPal', slug: 'paypal', websiteUrl: 'https://www.paypal.com', dealUrls: ['https://www.paypal.com/us/deals'] },
      { name: 'Venmo', slug: 'venmo', websiteUrl: 'https://venmo.com', dealUrls: ['https://venmo.com/offers'] },
      { name: 'Cash App', slug: 'cash-app', websiteUrl: 'https://cash.app', dealUrls: ['https://cash.app/boost'] },
      { name: 'SoFi', slug: 'sofi', websiteUrl: 'https://www.sofi.com', dealUrls: ['https://www.sofi.com/credit-card/', 'https://www.sofi.com/banking/'] },
      { name: 'Robinhood', slug: 'robinhood', websiteUrl: 'https://robinhood.com', dealUrls: ['https://robinhood.com/credit-card/'] },
      { name: 'Marcus by Goldman Sachs', slug: 'marcus-goldman', websiteUrl: 'https://www.marcus.com', dealUrls: ['https://www.marcus.com/us/en/savings/high-yield-savings'] },
      { name: 'Ally Bank', slug: 'ally-bank', websiteUrl: 'https://www.ally.com', dealUrls: ['https://www.ally.com/bank/online-savings-account/'] },
      { name: 'NerdWallet', slug: 'nerdwallet', websiteUrl: 'https://www.nerdwallet.com', dealUrls: ['https://www.nerdwallet.com/credit-cards/best', 'https://www.nerdwallet.com/banking/best-savings-accounts'] },
      { name: 'Credit Karma', slug: 'credit-karma', websiteUrl: 'https://www.creditkarma.com', dealUrls: ['https://www.creditkarma.com/credit-cards'] },
      { name: 'Mint / Intuit', slug: 'intuit', websiteUrl: 'https://www.intuit.com', dealUrls: ['https://turbotax.intuit.com/personal-taxes/online/'] },
      { name: 'Chime', slug: 'chime', websiteUrl: 'https://www.chime.com', dealUrls: ['https://www.chime.com/'] },
      { name: 'Synchrony', slug: 'synchrony', websiteUrl: 'https://www.synchrony.com', dealUrls: ['https://www.synchrony.com/credit'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 5. GROCERY & MARKET
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'gida-market',
    brands: [
      { name: 'Kroger', slug: 'kroger', websiteUrl: 'https://www.kroger.com', dealUrls: ['https://www.kroger.com/savings/cl/offers/', 'https://www.kroger.com/d/weekly-ad'] },
      { name: 'Whole Foods', slug: 'whole-foods', websiteUrl: 'https://www.wholefoodsmarket.com', dealUrls: ['https://www.wholefoodsmarket.com/sales-flyer', 'https://www.wholefoodsmarket.com/shop/deals'] },
      { name: 'Trader Joe\'s', slug: 'trader-joes', websiteUrl: 'https://www.traderjoes.com', dealUrls: ['https://www.traderjoes.com/home/products/category'] },
      { name: 'ALDI', slug: 'aldi', websiteUrl: 'https://www.aldi.us', dealUrls: ['https://www.aldi.us/weekly-specials/this-weeks-aldi-finds/', 'https://www.aldi.us/weekly-specials/upcoming-aldi-finds/'] },
      { name: 'Publix', slug: 'publix', websiteUrl: 'https://www.publix.com', dealUrls: ['https://www.publix.com/savings/weekly-ad', 'https://www.publix.com/savings/coupons'] },
      { name: 'H-E-B', slug: 'heb', websiteUrl: 'https://www.heb.com', dealUrls: ['https://www.heb.com/weekly-ad', 'https://www.heb.com/deals'] },
      { name: 'Albertsons', slug: 'albertsons', websiteUrl: 'https://www.albertsons.com', dealUrls: ['https://www.albertsons.com/weeklyad/'] },
      { name: 'Safeway', slug: 'safeway', websiteUrl: 'https://www.safeway.com', dealUrls: ['https://www.safeway.com/weeklyad/', 'https://www.safeway.com/foru/coupons-deals'] },
      { name: 'Meijer', slug: 'meijer', websiteUrl: 'https://www.meijer.com', dealUrls: ['https://www.meijer.com/shopping/deal/weekly-ad.html'] },
      { name: 'WinCo Foods', slug: 'winco-foods', websiteUrl: 'https://www.wincofoods.com', dealUrls: ['https://www.wincofoods.com/ads'] },
      { name: 'Food Lion', slug: 'food-lion', websiteUrl: 'https://www.foodlion.com', dealUrls: ['https://www.foodlion.com/weekly-specials/'] },
      { name: 'Sprouts Farmers Market', slug: 'sprouts', websiteUrl: 'https://www.sprouts.com', dealUrls: ['https://www.sprouts.com/weekly-ad/'] },
      { name: 'Wegmans', slug: 'wegmans', websiteUrl: 'https://www.wegmans.com', dealUrls: ['https://www.wegmans.com/savings/digital-coupons/'] },
      { name: 'Lidl', slug: 'lidl', websiteUrl: 'https://www.lidl.com', dealUrls: ['https://www.lidl.com/weekly-ads', 'https://www.lidl.com/specials'] },
      { name: 'Giant Food', slug: 'giant-food', websiteUrl: 'https://giantfood.com', dealUrls: ['https://giantfood.com/savings/weekly-ad'] },
      { name: 'Stop & Shop', slug: 'stop-and-shop', websiteUrl: 'https://stopandshop.com', dealUrls: ['https://stopandshop.com/savings/weekly-circular/'] },
      { name: 'Instacart', slug: 'instacart', websiteUrl: 'https://www.instacart.com', dealUrls: ['https://www.instacart.com/'] },
      { name: 'FreshDirect', slug: 'freshdirect', websiteUrl: 'https://www.freshdirect.com', dealUrls: ['https://www.freshdirect.com/browse.jsp?pageType=deals'] },
      { name: 'Thrive Market', slug: 'thrive-market', websiteUrl: 'https://thrivemarket.com', dealUrls: ['https://thrivemarket.com/collections/sales'] },
      { name: 'Gopuff', slug: 'gopuff', websiteUrl: 'https://gopuff.com', dealUrls: ['https://gopuff.com/deals'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 6. CLOTHING & FASHION
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'giyim-moda',
    brands: [
      { name: 'Nike', slug: 'nike', websiteUrl: 'https://www.nike.com', dealUrls: ['https://www.nike.com/w/sale-3yaep', 'https://www.nike.com/w/mens-sale-3yaepznik1', 'https://www.nike.com/w/womens-sale-3yaepz5e1x6'] },
      { name: 'Adidas', slug: 'adidas', websiteUrl: 'https://www.adidas.com', dealUrls: ['https://www.adidas.com/us/sale', 'https://www.adidas.com/us/outlet'] },
      { name: 'H&M', slug: 'hm', websiteUrl: 'https://www.hm.com', dealUrls: ['https://www2.hm.com/en_us/sale.html'] },
      { name: 'Zara', slug: 'zara', websiteUrl: 'https://www.zara.com', dealUrls: ['https://www.zara.com/us/en/z-sale-l1314.html'] },
      { name: 'GAP', slug: 'gap', websiteUrl: 'https://www.gap.com', dealUrls: ['https://www.gap.com/browse/category.do?cid=1143596', 'https://www.gap.com/browse/category.do?cid=5225'] },
      { name: 'Old Navy', slug: 'old-navy', websiteUrl: 'https://oldnavy.gap.com', dealUrls: ['https://oldnavy.gap.com/browse/category.do?cid=1143596'] },
      { name: 'Levi\'s', slug: 'levis', websiteUrl: 'https://www.levi.com', dealUrls: ['https://www.levi.com/US/en_US/sale/men/c/levi_clothing_men_sale', 'https://www.levi.com/US/en_US/sale/women/c/levi_clothing_women_sale'] },
      { name: 'Uniqlo', slug: 'uniqlo', websiteUrl: 'https://www.uniqlo.com', dealUrls: ['https://www.uniqlo.com/us/en/feature/sale/men', 'https://www.uniqlo.com/us/en/feature/limited-offers/men'] },
      { name: 'Ralph Lauren', slug: 'ralph-lauren', websiteUrl: 'https://www.ralphlauren.com', dealUrls: ['https://www.ralphlauren.com/sale'] },
      { name: 'Tommy Hilfiger', slug: 'tommy-hilfiger', websiteUrl: 'https://usa.tommy.com', dealUrls: ['https://usa.tommy.com/en/sale'] },
      { name: 'Calvin Klein', slug: 'calvin-klein', websiteUrl: 'https://www.calvinklein.us', dealUrls: ['https://www.calvinklein.us/en/sale'] },
      { name: 'American Eagle', slug: 'american-eagle', websiteUrl: 'https://www.ae.com', dealUrls: ['https://www.ae.com/us/en/c/aerie/clearance/cat4840006', 'https://www.ae.com/us/en/c/clearance/cat8170102'] },
      { name: 'Abercrombie & Fitch', slug: 'abercrombie', websiteUrl: 'https://www.abercrombie.com', dealUrls: ['https://www.abercrombie.com/shop/us/sale'] },
      { name: 'Forever 21', slug: 'forever-21', websiteUrl: 'https://www.forever21.com', dealUrls: ['https://www.forever21.com/us/shop/catalog/category/f21/sale'] },
      { name: 'SHEIN', slug: 'shein', websiteUrl: 'https://us.shein.com', dealUrls: ['https://us.shein.com/flash-sale.html', 'https://us.shein.com/daily-new.html'] },
      { name: 'Banana Republic', slug: 'banana-republic', websiteUrl: 'https://bananarepublic.gap.com', dealUrls: ['https://bananarepublic.gap.com/browse/category.do?cid=1143596'] },
      { name: 'J.Crew', slug: 'j-crew', websiteUrl: 'https://www.jcrew.com', dealUrls: ['https://www.jcrew.com/c/sale'] },
      { name: 'Free People', slug: 'free-people', websiteUrl: 'https://www.freepeople.com', dealUrls: ['https://www.freepeople.com/sale/'] },
      { name: 'Anthropologie', slug: 'anthropologie', websiteUrl: 'https://www.anthropologie.com', dealUrls: ['https://www.anthropologie.com/sale'] },
      { name: 'Urban Outfitters', slug: 'urban-outfitters', websiteUrl: 'https://www.urbanoutfitters.com', dealUrls: ['https://www.urbanoutfitters.com/sale'] },
      { name: 'Madewell', slug: 'madewell', websiteUrl: 'https://www.madewell.com', dealUrls: ['https://www.madewell.com/womens/sale'] },
      { name: 'Reformation', slug: 'reformation', websiteUrl: 'https://www.thereformation.com', dealUrls: ['https://www.thereformation.com/sale'] },
      { name: 'Everlane', slug: 'everlane', websiteUrl: 'https://www.everlane.com', dealUrls: ['https://www.everlane.com/collections/womens-sale'] },
      { name: 'Lululemon', slug: 'lululemon', websiteUrl: 'https://www.lululemon.com', dealUrls: ['https://shop.lululemon.com/c/sale/_/N-1z0xcmkZ8ok'] },
      { name: 'Puma', slug: 'puma', websiteUrl: 'https://us.puma.com', dealUrls: ['https://us.puma.com/us/en/sale'] },
      { name: 'New Balance', slug: 'new-balance', websiteUrl: 'https://www.newbalance.com', dealUrls: ['https://www.newbalance.com/sale/'] },
      { name: 'Coach', slug: 'coach', websiteUrl: 'https://www.coach.com', dealUrls: ['https://www.coach.com/shop/sale', 'https://www.coachoutlet.com/shop/sale'] },
      { name: 'Michael Kors', slug: 'michael-kors', websiteUrl: 'https://www.michaelkors.com', dealUrls: ['https://www.michaelkors.com/sale/'] },
      { name: 'Victoria\'s Secret', slug: 'victorias-secret', websiteUrl: 'https://www.victoriassecret.com', dealUrls: ['https://www.victoriassecret.com/us/sale'] },
      { name: 'Asos', slug: 'asos', websiteUrl: 'https://www.asos.com', dealUrls: ['https://www.asos.com/us/sale/'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 7. BOOKS & HOBBIES
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'kitap-hobi',
    brands: [
      { name: 'Barnes & Noble', slug: 'barnes-noble', websiteUrl: 'https://www.barnesandnoble.com', dealUrls: ['https://www.barnesandnoble.com/b/deals-of-the-day/_/N-2k8b', 'https://www.barnesandnoble.com/b/coupons-deals/_/N-rsg'] },
      { name: 'Amazon Books', slug: 'amazon-books', websiteUrl: 'https://www.amazon.com/books', dealUrls: ['https://www.amazon.com/b?node=8794559011', 'https://www.amazon.com/b?node=283155'] },
      { name: 'Hobby Lobby', slug: 'hobby-lobby', websiteUrl: 'https://www.hobbylobby.com', dealUrls: ['https://www.hobbylobby.com/find-a-sale', 'https://www.hobbylobby.com/weekly-ad'] },
      { name: 'Michaels', slug: 'michaels', websiteUrl: 'https://www.michaels.com', dealUrls: ['https://www.michaels.com/coupons', 'https://www.michaels.com/sale'] },
      { name: 'JOANN', slug: 'joann', websiteUrl: 'https://www.joann.com', dealUrls: ['https://www.joann.com/coupons/', 'https://www.joann.com/sale/'] },
      { name: 'ThriftBooks', slug: 'thriftbooks', websiteUrl: 'https://www.thriftbooks.com', dealUrls: ['https://www.thriftbooks.com/browse/#b.s=mostPopular-desc&b.p=1'] },
      { name: 'Better World Books', slug: 'better-world-books', websiteUrl: 'https://www.betterworldbooks.com', dealUrls: ['https://www.betterworldbooks.com/go/sale'] },
      { name: 'Half Price Books', slug: 'half-price-books', websiteUrl: 'https://www.hpb.com', dealUrls: ['https://www.hpb.com/deals'] },
      { name: 'AbeBooks', slug: 'abebooks', websiteUrl: 'https://www.abebooks.com', dealUrls: ['https://www.abebooks.com/books/'] },
      { name: 'Audible', slug: 'audible', websiteUrl: 'https://www.audible.com', dealUrls: ['https://www.audible.com/ep/2-for-1-sale', 'https://www.audible.com/ep/special-offer'] },
      { name: 'Lego', slug: 'lego', websiteUrl: 'https://www.lego.com', dealUrls: ['https://www.lego.com/en-us/categories/sales-and-deals', 'https://www.lego.com/en-us/categories/retiring-soon'] },
      { name: 'Games Workshop', slug: 'games-workshop', websiteUrl: 'https://www.games-workshop.com', dealUrls: ['https://www.games-workshop.com/en-US/shop/new'] },
      { name: 'Blick Art Materials', slug: 'blick-art', websiteUrl: 'https://www.dickblick.com', dealUrls: ['https://www.dickblick.com/sale/'] },
      { name: 'Guitar Center', slug: 'guitar-center', websiteUrl: 'https://www.guitarcenter.com', dealUrls: ['https://www.guitarcenter.com/sale', 'https://www.guitarcenter.com/deals'] },
      { name: 'Bookshop.org', slug: 'bookshop-org', websiteUrl: 'https://bookshop.org', dealUrls: ['https://bookshop.org/shop/bestsellers'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 8. BEAUTY & PERSONAL CARE
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'kozmetik-kisisel-bakim',
    brands: [
      { name: 'Sephora', slug: 'sephora', websiteUrl: 'https://www.sephora.com', dealUrls: ['https://www.sephora.com/sale', 'https://www.sephora.com/beauty-deals'] },
      { name: 'Ulta Beauty', slug: 'ulta', websiteUrl: 'https://www.ulta.com', dealUrls: ['https://www.ulta.com/promotion/sale', 'https://www.ulta.com/promotion/buy-more-save-more'] },
      { name: 'Bath & Body Works', slug: 'bath-body-works', websiteUrl: 'https://www.bathandbodyworks.com', dealUrls: ['https://www.bathandbodyworks.com/c/sale', 'https://www.bathandbodyworks.com/c/semi-annual-sale'] },
      { name: 'Glossier', slug: 'glossier', websiteUrl: 'https://www.glossier.com', dealUrls: ['https://www.glossier.com/shop'] },
      { name: 'Fenty Beauty', slug: 'fenty-beauty', websiteUrl: 'https://fentybeauty.com', dealUrls: ['https://fentybeauty.com/collections/sale'] },
      { name: 'Rare Beauty', slug: 'rare-beauty', websiteUrl: 'https://www.rarebeauty.com', dealUrls: ['https://www.rarebeauty.com/collections/all'] },
      { name: 'e.l.f. Cosmetics', slug: 'elf-cosmetics', websiteUrl: 'https://www.elfcosmetics.com', dealUrls: ['https://www.elfcosmetics.com/sale/', 'https://www.elfcosmetics.com/offers/'] },
      { name: 'Tarte', slug: 'tarte', websiteUrl: 'https://tartecosmetics.com', dealUrls: ['https://tartecosmetics.com/collections/sale'] },
      { name: 'MAC Cosmetics', slug: 'mac-cosmetics', websiteUrl: 'https://www.maccosmetics.com', dealUrls: ['https://www.maccosmetics.com/offers'] },
      { name: 'Clinique', slug: 'clinique', websiteUrl: 'https://www.clinique.com', dealUrls: ['https://www.clinique.com/offers'] },
      { name: 'Estée Lauder', slug: 'estee-lauder', websiteUrl: 'https://www.esteelauder.com', dealUrls: ['https://www.esteelauder.com/offers'] },
      { name: 'CeraVe', slug: 'cerave', websiteUrl: 'https://www.cerave.com', dealUrls: ['https://www.cerave.com/'] },
      { name: 'Olay', slug: 'olay', websiteUrl: 'https://www.olay.com', dealUrls: ['https://www.olay.com/skin-care', 'https://www.olay.com/skin-care/sets-and-bundles'] },
      { name: 'Neutrogena', slug: 'neutrogena', websiteUrl: 'https://www.neutrogena.com', dealUrls: ['https://www.neutrogena.com/offers'] },
      { name: 'The Ordinary', slug: 'the-ordinary', websiteUrl: 'https://theordinary.com', dealUrls: ['https://theordinary.com/en-us'] },
      { name: 'Drunk Elephant', slug: 'drunk-elephant', websiteUrl: 'https://www.drunkelephant.com', dealUrls: ['https://www.drunkelephant.com/collections/sale'] },
      { name: 'Sol de Janeiro', slug: 'sol-de-janeiro', websiteUrl: 'https://soldejaneiro.com', dealUrls: ['https://soldejaneiro.com/collections/sale'] },
      { name: 'NYX Professional', slug: 'nyx', websiteUrl: 'https://www.nyxcosmetics.com', dealUrls: ['https://www.nyxcosmetics.com/sale.html'] },
      { name: 'Maybelline', slug: 'maybelline', websiteUrl: 'https://www.maybelline.com', dealUrls: ['https://www.maybelline.com/offers'] },
      { name: 'ColourPop', slug: 'colourpop', websiteUrl: 'https://colourpop.com', dealUrls: ['https://colourpop.com/collections/sale'] },
      { name: 'Dove', slug: 'dove', websiteUrl: 'https://www.dove.com', dealUrls: ['https://www.dove.com/us/en/offers.html'] },
      { name: 'Old Spice', slug: 'old-spice', websiteUrl: 'https://oldspice.com', dealUrls: ['https://oldspice.com/'] },
      { name: 'Dollar Shave Club', slug: 'dollar-shave-club', websiteUrl: 'https://www.dollarshaveclub.com', dealUrls: ['https://www.dollarshaveclub.com/get-started'] },
      { name: 'Harry\'s', slug: 'harrys', websiteUrl: 'https://www.harrys.com', dealUrls: ['https://www.harrys.com/en/us/products'] },
      { name: 'Charlotte Tilbury', slug: 'charlotte-tilbury', websiteUrl: 'https://www.charlottetilbury.com', dealUrls: ['https://www.charlottetilbury.com/us'] },
      { name: 'Kiehl\'s', slug: 'kiehls', websiteUrl: 'https://www.kiehls.com', dealUrls: ['https://www.kiehls.com/offers/'] },
      { name: 'La Roche-Posay', slug: 'la-roche-posay', websiteUrl: 'https://www.laroche-posay.us', dealUrls: ['https://www.laroche-posay.us/offers'] },
      { name: 'Paula\'s Choice', slug: 'paulas-choice', websiteUrl: 'https://www.paulaschoice.com', dealUrls: ['https://www.paulaschoice.com/skin-care-products/sale'] },
      { name: 'Rhode', slug: 'rhode', websiteUrl: 'https://www.rhodeskin.com', dealUrls: ['https://www.rhodeskin.com/collections/all'] },
      { name: 'Tatcha', slug: 'tatcha', websiteUrl: 'https://www.tatcha.com', dealUrls: ['https://www.tatcha.com/collections/bestsellers'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 9. AUTOMOTIVE
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'otomobil',
    brands: [
      { name: 'AutoZone', slug: 'autozone', websiteUrl: 'https://www.autozone.com', dealUrls: ['https://www.autozone.com/deals', 'https://www.autozone.com/rebates'] },
      { name: 'O\'Reilly Auto Parts', slug: 'oreilly-auto', websiteUrl: 'https://www.oreillyauto.com', dealUrls: ['https://www.oreillyauto.com/deals'] },
      { name: 'Advance Auto Parts', slug: 'advance-auto', websiteUrl: 'https://www.advanceautoparts.com', dealUrls: ['https://www.advanceautoparts.com/deals-offers', 'https://www.advanceautoparts.com/web/AdvancedSearchAction'] },
      { name: 'NAPA Auto Parts', slug: 'napa', websiteUrl: 'https://www.napaonline.com', dealUrls: ['https://www.napaonline.com/en/promos-and-coupons'] },
      { name: 'Pep Boys', slug: 'pep-boys', websiteUrl: 'https://www.pepboys.com', dealUrls: ['https://www.pepboys.com/deals'] },
      { name: 'CarMax', slug: 'carmax', websiteUrl: 'https://www.carmax.com', dealUrls: ['https://www.carmax.com/cars'] },
      { name: 'Carvana', slug: 'carvana', websiteUrl: 'https://www.carvana.com', dealUrls: ['https://www.carvana.com/cars'] },
      { name: 'Ford', slug: 'ford', websiteUrl: 'https://www.ford.com', dealUrls: ['https://www.ford.com/deals/', 'https://www.ford.com/trucks/deals/'] },
      { name: 'Toyota', slug: 'toyota', websiteUrl: 'https://www.toyota.com', dealUrls: ['https://www.toyota.com/deals'] },
      { name: 'Chevrolet', slug: 'chevrolet', websiteUrl: 'https://www.chevrolet.com', dealUrls: ['https://www.chevrolet.com/current-offers'] },
      { name: 'Honda', slug: 'honda', websiteUrl: 'https://automobiles.honda.com', dealUrls: ['https://automobiles.honda.com/tools/current-offers'] },
      { name: 'Hyundai', slug: 'hyundai-us', websiteUrl: 'https://www.hyundaiusa.com', dealUrls: ['https://www.hyundaiusa.com/us/en/offers'] },
      { name: 'Tesla', slug: 'tesla', websiteUrl: 'https://www.tesla.com', dealUrls: ['https://www.tesla.com/inventory'] },
      { name: 'BMW', slug: 'bmw', websiteUrl: 'https://www.bmwusa.com', dealUrls: ['https://www.bmwusa.com/explore/bmw-value.html'] },
      { name: 'Mercedes-Benz', slug: 'mercedes-benz', websiteUrl: 'https://www.mbusa.com', dealUrls: ['https://www.mbusa.com/en/special-offers'] },
      { name: 'Jeep', slug: 'jeep', websiteUrl: 'https://www.jeep.com', dealUrls: ['https://www.jeep.com/incentives/bonus-incentives.html'] },
      { name: 'Subaru', slug: 'subaru', websiteUrl: 'https://www.subaru.com', dealUrls: ['https://www.subaru.com/shopping-tools/special-offers.html'] },
      { name: 'Nissan', slug: 'nissan', websiteUrl: 'https://www.nissanusa.com', dealUrls: ['https://www.nissanusa.com/shopping-tools/deals-incentives-offers.html'] },
      { name: 'Kia', slug: 'kia', websiteUrl: 'https://www.kia.com', dealUrls: ['https://www.kia.com/us/en/offers/landing'] },
      { name: 'Tire Rack', slug: 'tire-rack', websiteUrl: 'https://www.tirerack.com', dealUrls: ['https://www.tirerack.com/content/tirerack/desktop/en/homepage/promotions.html'] },
      { name: 'Discount Tire', slug: 'discount-tire', websiteUrl: 'https://www.discounttire.com', dealUrls: ['https://www.discounttire.com/promotions'] },
      { name: 'Cars.com', slug: 'cars-com', websiteUrl: 'https://www.cars.com', dealUrls: ['https://www.cars.com/shopping/'] },
      { name: 'Volkswagen', slug: 'volkswagen', websiteUrl: 'https://www.vw.com', dealUrls: ['https://www.vw.com/en/offers.html'] },
      { name: 'Mazda', slug: 'mazda', websiteUrl: 'https://www.mazdausa.com', dealUrls: ['https://www.mazdausa.com/shopping-tools/special-offers-and-incentives'] },
      { name: 'Audi', slug: 'audi', websiteUrl: 'https://www.audiusa.com', dealUrls: ['https://www.audiusa.com/us/web/en/models.html'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 10. TRAVEL & TRANSPORT
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'seyahat-ulasim',
    brands: [
      { name: 'Expedia', slug: 'expedia', websiteUrl: 'https://www.expedia.com', dealUrls: ['https://www.expedia.com/deals', 'https://www.expedia.com/coupons'] },
      { name: 'Booking.com', slug: 'booking-com', websiteUrl: 'https://www.booking.com', dealUrls: ['https://www.booking.com/dealspage.html', 'https://www.booking.com/dealspage.html'] },
      { name: 'Kayak', slug: 'kayak', websiteUrl: 'https://www.kayak.com', dealUrls: ['https://www.kayak.com/explore/', 'https://www.kayak.com/deals'] },
      { name: 'Priceline', slug: 'priceline', websiteUrl: 'https://www.priceline.com', dealUrls: ['https://www.priceline.com/deals/', 'https://www.priceline.com/partner/v2/express-deals/'] },
      { name: 'Hotels.com', slug: 'hotels-com', websiteUrl: 'https://www.hotels.com', dealUrls: ['https://www.hotels.com/deals'] },
      { name: 'Delta Airlines', slug: 'delta', websiteUrl: 'https://www.delta.com', dealUrls: ['https://www.delta.com/flight-search/search', 'https://www.delta.com/us/en/flight-deals/overview'] },
      { name: 'United Airlines', slug: 'united', websiteUrl: 'https://www.united.com', dealUrls: ['https://www.united.com/en/us/deals'] },
      { name: 'American Airlines', slug: 'american-airlines', websiteUrl: 'https://www.aa.com', dealUrls: ['https://www.aa.com/booking/flights/deals'] },
      { name: 'Southwest Airlines', slug: 'southwest', websiteUrl: 'https://www.southwest.com', dealUrls: ['https://www.southwest.com/air/low-fare-calendar/'] },
      { name: 'JetBlue', slug: 'jetblue', websiteUrl: 'https://www.jetblue.com', dealUrls: ['https://www.jetblue.com/best-fare-finder'] },
      { name: 'Alaska Airlines', slug: 'alaska-airlines', websiteUrl: 'https://www.alaskaair.com', dealUrls: ['https://www.alaskaair.com/deals'] },
      { name: 'Spirit Airlines', slug: 'spirit', websiteUrl: 'https://www.spirit.com', dealUrls: ['https://www.spirit.com/deals'] },
      { name: 'Frontier Airlines', slug: 'frontier', websiteUrl: 'https://www.flyfrontier.com', dealUrls: ['https://www.flyfrontier.com/deals/'] },
      { name: 'Uber', slug: 'uber', websiteUrl: 'https://www.uber.com', dealUrls: ['https://www.uber.com/us/en/u/offers/'] },
      { name: 'Lyft', slug: 'lyft', websiteUrl: 'https://www.lyft.com', dealUrls: ['https://www.lyft.com/rider'] },
      { name: 'Hilton', slug: 'hilton', websiteUrl: 'https://www.hilton.com', dealUrls: ['https://www.hilton.com/en/offers/', 'https://www.hilton.com/en/offers/'] },
      { name: 'Marriott', slug: 'marriott', websiteUrl: 'https://www.marriott.com', dealUrls: ['https://www.marriott.com/offers.mi'] },
      { name: 'Hyatt', slug: 'hyatt', websiteUrl: 'https://www.hyatt.com', dealUrls: ['https://www.hyatt.com/en-US/offers'] },
      { name: 'IHG Hotels', slug: 'ihg', websiteUrl: 'https://www.ihg.com', dealUrls: ['https://www.ihg.com/content/us/en/deals'] },
      { name: 'Airbnb', slug: 'airbnb', websiteUrl: 'https://www.airbnb.com', dealUrls: ['https://www.airbnb.com/'] },
      { name: 'Vrbo', slug: 'vrbo', websiteUrl: 'https://www.vrbo.com', dealUrls: ['https://www.vrbo.com/deals'] },
      { name: 'Travelzoo', slug: 'travelzoo', websiteUrl: 'https://www.travelzoo.com', dealUrls: ['https://www.travelzoo.com/top20/', 'https://www.travelzoo.com/deals/'] },
      { name: 'Hopper', slug: 'hopper', websiteUrl: 'https://www.hopper.com', dealUrls: ['https://www.hopper.com/deals'] },
      { name: 'Scott\'s Cheap Flights', slug: 'going-flights', websiteUrl: 'https://www.going.com', dealUrls: ['https://www.going.com/deals'] },
      { name: 'Enterprise', slug: 'enterprise', websiteUrl: 'https://www.enterprise.com', dealUrls: ['https://www.enterprise.com/en/deals.html'] },
      { name: 'Hertz', slug: 'hertz', websiteUrl: 'https://www.hertz.com', dealUrls: ['https://www.hertz.com/rentacar/specials/'] },
      { name: 'Wyndham Hotels', slug: 'wyndham', websiteUrl: 'https://www.wyndhamhotels.com', dealUrls: ['https://www.wyndhamhotels.com/hotel-deals'] },
      { name: 'Choice Hotels', slug: 'choice-hotels', websiteUrl: 'https://www.choicehotels.com', dealUrls: ['https://www.choicehotels.com/deals'] },
      { name: 'Cruise Critic', slug: 'cruise-critic', websiteUrl: 'https://www.cruisecritic.com', dealUrls: ['https://www.cruisecritic.com/deals/'] },
      { name: 'Royal Caribbean', slug: 'royal-caribbean', websiteUrl: 'https://www.royalcaribbean.com', dealUrls: ['https://www.royalcaribbean.com/cruise-deals'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 11. INSURANCE
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'sigorta',
    brands: [
      { name: 'GEICO', slug: 'geico', websiteUrl: 'https://www.geico.com', dealUrls: ['https://www.geico.com/save/discounts/'] },
      { name: 'State Farm', slug: 'state-farm', websiteUrl: 'https://www.statefarm.com', dealUrls: ['https://www.statefarm.com/insurance/auto/discounts'] },
      { name: 'Progressive', slug: 'progressive', websiteUrl: 'https://www.progressive.com', dealUrls: ['https://www.progressive.com/auto/discounts/'] },
      { name: 'Allstate', slug: 'allstate', websiteUrl: 'https://www.allstate.com', dealUrls: ['https://www.allstate.com/auto-insurance/discounts'] },
      { name: 'USAA', slug: 'usaa', websiteUrl: 'https://www.usaa.com', dealUrls: ['https://www.usaa.com/inet/wc/insurance-auto-discounts'] },
      { name: 'Liberty Mutual', slug: 'liberty-mutual', websiteUrl: 'https://www.libertymutual.com', dealUrls: ['https://www.libertymutual.com/auto-insurance'] },
      { name: 'Nationwide', slug: 'nationwide', websiteUrl: 'https://www.nationwide.com', dealUrls: ['https://www.nationwide.com/personal/insurance/auto/discounts/'] },
      { name: 'Farmers Insurance', slug: 'farmers', websiteUrl: 'https://www.farmers.com', dealUrls: ['https://www.farmers.com/auto/discounts/'] },
      { name: 'Travelers', slug: 'travelers', websiteUrl: 'https://www.travelers.com', dealUrls: ['https://www.travelers.com/car-insurance/discounts'] },
      { name: 'Erie Insurance', slug: 'erie', websiteUrl: 'https://www.erieinsurance.com', dealUrls: ['https://www.erieinsurance.com/auto-insurance'] },
      { name: 'American Family', slug: 'american-family', websiteUrl: 'https://www.amfam.com', dealUrls: ['https://www.amfam.com/insurance/auto/discounts'] },
      { name: 'Lemonade', slug: 'lemonade', websiteUrl: 'https://www.lemonade.com', dealUrls: ['https://www.lemonade.com/renters'] },
      { name: 'The Hartford', slug: 'the-hartford', websiteUrl: 'https://www.thehartford.com', dealUrls: ['https://www.thehartford.com/aarp/auto-insurance'] },
      { name: 'Root Insurance', slug: 'root', websiteUrl: 'https://www.joinroot.com', dealUrls: ['https://www.joinroot.com/car-insurance/'] },
      { name: 'The Zebra', slug: 'the-zebra', websiteUrl: 'https://www.thezebra.com', dealUrls: ['https://www.thezebra.com/auto-insurance/'] },
      { name: 'Policygenius', slug: 'policygenius', websiteUrl: 'https://www.policygenius.com', dealUrls: ['https://www.policygenius.com/auto-insurance/'] },
      { name: 'Clearcover', slug: 'clearcover', websiteUrl: 'https://clearcover.com', dealUrls: ['https://clearcover.com/'] },
      { name: 'Mercury Insurance', slug: 'mercury', websiteUrl: 'https://www.mercuryinsurance.com', dealUrls: ['https://www.mercuryinsurance.com/auto/discounts/'] },
      { name: 'Auto-Owners', slug: 'auto-owners', websiteUrl: 'https://www.auto-owners.com', dealUrls: ['https://www.auto-owners.com/insurance/auto'] },
      { name: 'Hippo Insurance', slug: 'hippo', websiteUrl: 'https://www.hippo.com', dealUrls: ['https://www.hippo.com/homeowners-insurance'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 12. SPORTS & OUTDOOR
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'spor-outdoor',
    brands: [
      { name: 'REI', slug: 'rei', websiteUrl: 'https://www.rei.com', dealUrls: ['https://www.rei.com/deals', 'https://www.rei.com/rei-garage/deals', 'https://www.rei.com/promotions'] },
      { name: 'Dick\'s Sporting Goods', slug: 'dicks-sporting', websiteUrl: 'https://www.dickssportinggoods.com', dealUrls: ['https://www.dickssportinggoods.com/c/sale', 'https://www.dickssportinggoods.com/c/clearance'] },
      { name: 'Under Armour', slug: 'under-armour', websiteUrl: 'https://www.underarmour.com', dealUrls: ['https://www.underarmour.com/en-us/c/outlet/', 'https://www.underarmour.com/en-us/c/outlet/'] },
      { name: 'The North Face', slug: 'north-face', websiteUrl: 'https://www.thenorthface.com', dealUrls: ['https://www.thenorthface.com/en-us/sale'] },
      { name: 'Patagonia', slug: 'patagonia', websiteUrl: 'https://www.patagonia.com', dealUrls: ['https://www.patagonia.com/shop/web-specials', 'https://wornwear.patagonia.com/'] },
      { name: 'Columbia Sportswear', slug: 'columbia', websiteUrl: 'https://www.columbia.com', dealUrls: ['https://www.columbia.com/c/sale/', 'https://www.columbia.com/c/web_specials/'] },
      { name: 'Academy Sports', slug: 'academy-sports', websiteUrl: 'https://www.academy.com', dealUrls: ['https://www.academy.com/c/shop-deals', 'https://www.academy.com/c/clearance'] },
      { name: 'Bass Pro Shops', slug: 'bass-pro', websiteUrl: 'https://www.basspro.com', dealUrls: ['https://www.basspro.com/shop/en/deals'] },
      { name: 'Cabela\'s', slug: 'cabelas', websiteUrl: 'https://www.cabelas.com', dealUrls: ['https://www.cabelas.com/shop/en/bargain-cave'] },
      { name: 'Backcountry', slug: 'backcountry', websiteUrl: 'https://www.backcountry.com', dealUrls: ['https://www.backcountry.com/', 'https://www.backcountry.com/'] },
      { name: 'Sierra', slug: 'sierra', websiteUrl: 'https://www.sierra.com', dealUrls: ['https://www.sierra.com/deals/'] },
      { name: 'Moosejaw', slug: 'moosejaw', websiteUrl: 'https://www.moosejaw.com', dealUrls: ['https://www.moosejaw.com/content/sale'] },
      { name: 'Yeti', slug: 'yeti', websiteUrl: 'https://www.yeti.com', dealUrls: ['https://www.yeti.com/sale'] },
      { name: 'Hydro Flask', slug: 'hydro-flask', websiteUrl: 'https://www.hydroflask.com', dealUrls: ['https://www.hydroflask.com/sale'] },
      { name: 'Brooks Running', slug: 'brooks-running', websiteUrl: 'https://www.brooksrunning.com', dealUrls: ['https://www.brooksrunning.com/en_us/sale/'] },
      { name: 'ASICS', slug: 'asics', websiteUrl: 'https://www.asics.com', dealUrls: ['https://www.asics.com/us/en-us/sale/'] },
      { name: 'Hoka', slug: 'hoka', websiteUrl: 'https://www.hoka.com', dealUrls: ['https://www.hoka.com/en/us/sale/'] },
      { name: 'On Running', slug: 'on-running', websiteUrl: 'https://www.on.com', dealUrls: ['https://www.on.com/en-us/collection/sale'] },
      { name: 'Arc\'teryx', slug: 'arcteryx', websiteUrl: 'https://arcteryx.com', dealUrls: ['https://arcteryx.com/us/en/c/outlet'] },
      { name: 'Salomon', slug: 'salomon', websiteUrl: 'https://www.salomon.com', dealUrls: ['https://www.salomon.com/en-us/sale/'] },
      { name: 'Osprey', slug: 'osprey', websiteUrl: 'https://www.osprey.com', dealUrls: ['https://www.osprey.com/collections/sale'] },
      { name: 'Peloton', slug: 'peloton', websiteUrl: 'https://www.onepeloton.com', dealUrls: ['https://www.onepeloton.com/shop'] },
      { name: 'Decathlon', slug: 'decathlon', websiteUrl: 'https://www.decathlon.com', dealUrls: ['https://www.decathlon.com/collections/deals'] },
      { name: 'Merrell', slug: 'merrell', websiteUrl: 'https://www.merrell.com', dealUrls: ['https://www.merrell.com/US/en/sale/'] },
      { name: 'Reebok', slug: 'reebok', websiteUrl: 'https://www.reebok.com', dealUrls: ['https://www.reebok.com/collections/sale'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 13. FOOD & DINING
  // ═══════════════════════════════════════════════════════════
  {
    categorySlug: 'yeme-icme',
    brands: [
      { name: 'McDonald\'s', slug: 'mcdonalds', websiteUrl: 'https://www.mcdonalds.com', dealUrls: ['https://www.mcdonalds.com/us/en-us/deals.html'] },
      { name: 'Starbucks', slug: 'starbucks', websiteUrl: 'https://www.starbucks.com', dealUrls: ['https://www.starbucks.com/rewards', 'https://www.starbucks.com/menu'] },
      { name: 'Chick-fil-A', slug: 'chick-fil-a', websiteUrl: 'https://www.chick-fil-a.com', dealUrls: ['https://www.chick-fil-a.com/one'] },
      { name: 'Taco Bell', slug: 'taco-bell', websiteUrl: 'https://www.tacobell.com', dealUrls: ['https://www.tacobell.com/food/deals-and-combos'] },
      { name: 'Wendy\'s', slug: 'wendys', websiteUrl: 'https://www.wendys.com', dealUrls: ['https://www.wendys.com/deals'] },
      { name: 'Burger King', slug: 'burger-king', websiteUrl: 'https://www.bk.com', dealUrls: ['https://www.bk.com/offers'] },
      { name: 'Subway', slug: 'subway', websiteUrl: 'https://www.subway.com', dealUrls: ['https://www.subway.com/en-US/menunutrition/deals'] },
      { name: 'Domino\'s', slug: 'dominos', websiteUrl: 'https://www.dominos.com', dealUrls: ['https://www.dominos.com/pages/order/coupon'] },
      { name: 'Pizza Hut', slug: 'pizza-hut', websiteUrl: 'https://www.pizzahut.com', dealUrls: ['https://www.pizzahut.com/deals'] },
      { name: 'Papa John\'s', slug: 'papa-johns', websiteUrl: 'https://www.papajohns.com', dealUrls: ['https://www.papajohns.com/specials'] },
      { name: 'Chipotle', slug: 'chipotle', websiteUrl: 'https://www.chipotle.com', dealUrls: ['https://www.chipotle.com/rewards'] },
      { name: 'Panera Bread', slug: 'panera', websiteUrl: 'https://www.panerabread.com', dealUrls: ['https://www.panerabread.com/en-us/mypanera.html'] },
      { name: 'Popeyes', slug: 'popeyes', websiteUrl: 'https://www.popeyes.com', dealUrls: ['https://www.popeyes.com/offers'] },
      { name: 'KFC', slug: 'kfc', websiteUrl: 'https://www.kfc.com', dealUrls: ['https://www.kfc.com/deals'] },
      { name: 'Chili\'s', slug: 'chilis', websiteUrl: 'https://www.chilis.com', dealUrls: ['https://www.chilis.com/menu'] },
      { name: 'Applebee\'s', slug: 'applebees', websiteUrl: 'https://www.applebees.com', dealUrls: ['https://www.applebees.com/specials'] },
      { name: 'Olive Garden', slug: 'olive-garden', websiteUrl: 'https://www.olivegarden.com', dealUrls: ['https://www.olivegarden.com/specials'] },
      { name: 'DoorDash', slug: 'doordash', websiteUrl: 'https://www.doordash.com', dealUrls: ['https://www.doordash.com/deals/', 'https://www.doordash.com/promos/'] },
      { name: 'Uber Eats', slug: 'uber-eats', websiteUrl: 'https://www.ubereats.com', dealUrls: ['https://www.ubereats.com/deals'] },
      { name: 'Grubhub', slug: 'grubhub', websiteUrl: 'https://www.grubhub.com', dealUrls: ['https://www.grubhub.com/deals'] },
      { name: 'Dunkin\'', slug: 'dunkin', websiteUrl: 'https://www.dunkindonuts.com', dealUrls: ['https://www.dunkindonuts.com/en/dd-perks'] },
      { name: 'Sonic Drive-In', slug: 'sonic', websiteUrl: 'https://www.sonicdrivein.com', dealUrls: ['https://www.sonicdrivein.com/deals'] },
      { name: 'Jack in the Box', slug: 'jack-in-the-box', websiteUrl: 'https://www.jackinthebox.com', dealUrls: ['https://www.jackinthebox.com/menu'] },
      { name: 'Arby\'s', slug: 'arbys', websiteUrl: 'https://www.arbys.com', dealUrls: ['https://www.arbys.com/deals'] },
      { name: 'Dairy Queen', slug: 'dairy-queen', websiteUrl: 'https://www.dairyqueen.com', dealUrls: ['https://www.dairyqueen.com/us-en/deals/'] },
      { name: 'Five Guys', slug: 'five-guys', websiteUrl: 'https://www.fiveguys.com', dealUrls: ['https://www.fiveguys.com/menu'] },
      { name: 'Wingstop', slug: 'wingstop', websiteUrl: 'https://www.wingstop.com', dealUrls: ['https://www.wingstop.com/specials'] },
      { name: 'Panda Express', slug: 'panda-express', websiteUrl: 'https://www.pandaexpress.com', dealUrls: ['https://www.pandaexpress.com/rewards'] },
      { name: 'IHOP', slug: 'ihop', websiteUrl: 'https://www.ihop.com', dealUrls: ['https://www.ihop.com/en/specials'] },
      { name: 'Denny\'s', slug: 'dennys', websiteUrl: 'https://www.dennys.com', dealUrls: ['https://www.dennys.com/deals'] },
    ],
  },
];

async function main() {
  console.log('Starting US brand & source seeding...\n');

  let totalBrands = 0;
  let totalSources = 0;

  for (const entry of US_BRANDS) {
    const category = await prisma.category.findUnique({
      where: { slug: entry.categorySlug },
    });

    if (!category) {
      console.warn(`⚠ Category not found: ${entry.categorySlug}, skipping...`);
      continue;
    }

    console.log(`\n── ${category.name} (${category.nameEn}) ──`);

    for (const b of entry.brands) {
      try {
        // Upsert brand (slug + market unique)
        const brand = await prisma.brand.upsert({
          where: { slug_market: { slug: b.slug, market: Market.US } },
          update: {
            name: b.name,
            websiteUrl: b.websiteUrl,
            categoryId: category.id,
            isActive: true,
          },
          create: {
            name: b.name,
            slug: b.slug,
            websiteUrl: b.websiteUrl,
            categoryId: category.id,
            market: Market.US,
            isActive: true,
          },
        });
        totalBrands++;

        // Check if source already exists for this brand + US market
        const existingSource = await prisma.crawlSource.findFirst({
          where: { brandId: brand.id, market: Market.US },
        });

        if (!existingSource) {
          await prisma.crawlSource.create({
            data: {
              brandId: brand.id,
              name: `${b.name} Deals`,
              crawlMethod: CrawlMethod.CAMPAIGN,
              seedUrls: b.dealUrls,
              maxDepth: 2,
              schedule: '0 4 * * *', // 4 AM daily
              agingDays: 7,
              market: Market.US,
              isActive: true,
            },
          });
          totalSources++;
          console.log(`  ✓ ${b.name} — brand + source (${b.dealUrls.length} URLs)`);
        } else {
          console.log(`  ✓ ${b.name} — brand updated, source exists`);
        }
      } catch (err: any) {
        console.error(`  ✕ ${b.name}: ${err.message}`);
      }
    }
  }

  console.log(`\n════════════════════════════════`);
  console.log(`Total brands upserted: ${totalBrands}`);
  console.log(`Total new sources created: ${totalSources}`);
  console.log(`════════════════════════════════`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
