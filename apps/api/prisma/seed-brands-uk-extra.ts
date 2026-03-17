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

// ══════════════════════════════════════════════════════════
// SUPPLEMENTAL UK BRANDS — 140 additional brands
// Fills each category to 30 total brands.
// ══════════════════════════════════════════════════════════
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 5 more (25 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Littlewoods',
    websiteUrl: 'https://www.littlewoods.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.littlewoods.com/offers', 'https://www.littlewoods.com/sale'],
  },
  {
    name: 'Studio',
    websiteUrl: 'https://www.studio.co.uk',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.studio.co.uk/sale', 'https://www.studio.co.uk/offers'],
  },
  {
    name: 'Freemans',
    websiteUrl: 'https://www.freemans.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.freemans.com/sale', 'https://www.freemans.com/offers'],
  },
  {
    name: 'Robert Dyas',
    websiteUrl: 'https://www.robertdyas.co.uk',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.robertdyas.co.uk/sale', 'https://www.robertdyas.co.uk/deals'],
  },
  {
    name: 'Wilko',
    websiteUrl: 'https://www.wilko.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.wilko.com/offers', 'https://www.wilko.com/sale'],
  },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 5 more (25 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Maplin',
    websiteUrl: 'https://www.maplin.co.uk',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.maplin.co.uk/deals', 'https://www.maplin.co.uk/sale'],
  },
  {
    name: 'BT Shop',
    websiteUrl: 'https://www.bt.com/shop',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.bt.com/shop/offers', 'https://www.bt.com/deals'],
  },
  {
    name: 'Panasonic UK',
    websiteUrl: 'https://www.panasonic.com/uk',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.panasonic.com/uk/promotions.html'],
  },
  {
    name: 'Huawei UK',
    websiteUrl: 'https://consumer.huawei.com/uk',
    categorySlug: 'elektronik',
    seedUrls: ['https://consumer.huawei.com/uk/offer/'],
  },
  {
    name: 'OnePlus UK',
    websiteUrl: 'https://www.oneplus.com/uk',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.oneplus.com/uk/offer'],
  },

  // ═══════════════════════════════════════════════════════
  // 3) Clothing & Fashion (giyim-moda) — 5 more (25 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'White Stuff',
    websiteUrl: 'https://www.whitestuff.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.whitestuff.com/sale', 'https://www.whitestuff.com/sale/womens'],
  },
  {
    name: 'Phase Eight',
    websiteUrl: 'https://www.phase-eight.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.phase-eight.com/sale', 'https://www.phase-eight.com/sale/dresses'],
  },
  {
    name: 'Karen Millen',
    websiteUrl: 'https://www.karenmillen.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.karenmillen.com/sale', 'https://www.karenmillen.com/sale/dresses'],
  },
  {
    name: 'Jack Wills',
    websiteUrl: 'https://www.jackwills.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.jackwills.com/sale', 'https://www.jackwills.com/sale/mens'],
  },
  {
    name: 'Oliver Bonas',
    websiteUrl: 'https://www.oliverbonas.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.oliverbonas.com/sale', 'https://www.oliverbonas.com/clothing/sale'],
  },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Wickes',
    websiteUrl: 'https://www.wickes.co.uk',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.wickes.co.uk/offers', 'https://www.wickes.co.uk/clearance'],
  },
  {
    name: 'Toolstation',
    websiteUrl: 'https://www.toolstation.com',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.toolstation.com/clearance', 'https://www.toolstation.com/deals'],
  },
  {
    name: 'Screwfix',
    websiteUrl: 'https://www.screwfix.com',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.screwfix.com/clearance', 'https://www.screwfix.com/deals'],
  },
  {
    name: 'Trago Mills',
    websiteUrl: 'https://www.trago.co.uk',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.trago.co.uk/offers'],
  },
  {
    name: 'ProCook',
    websiteUrl: 'https://www.procook.co.uk',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.procook.co.uk/sale', 'https://www.procook.co.uk/offers'],
  },
  {
    name: 'Emma Mattress UK',
    websiteUrl: 'https://www.emma-sleep.co.uk',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.emma-sleep.co.uk/offers/', 'https://www.emma-sleep.co.uk/sale/'],
  },
  {
    name: 'Silentnight',
    websiteUrl: 'https://www.silentnight.co.uk',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.silentnight.co.uk/sale', 'https://www.silentnight.co.uk/offers'],
  },
  {
    name: 'Sofology',
    websiteUrl: 'https://www.sofology.co.uk',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.sofology.co.uk/offers', 'https://www.sofology.co.uk/sale'],
  },
  {
    name: 'Cox & Cox',
    websiteUrl: 'https://www.coxandcox.co.uk',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.coxandcox.co.uk/sale/', 'https://www.coxandcox.co.uk/offers/'],
  },
  {
    name: 'Lakeland',
    websiteUrl: 'https://www.lakeland.co.uk',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.lakeland.co.uk/sale', 'https://www.lakeland.co.uk/offers'],
  },

  // ═══════════════════════════════════════════════════════
  // 5) Sports & Outdoor (spor-outdoor) — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Reebok UK',
    websiteUrl: 'https://www.reebok.co.uk',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.reebok.co.uk/sale', 'https://www.reebok.co.uk/outlet'],
  },
  {
    name: 'The North Face UK',
    websiteUrl: 'https://www.thenorthface.co.uk',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.thenorthface.co.uk/sale.html'],
  },
  {
    name: 'Berghaus',
    websiteUrl: 'https://www.berghaus.com',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.berghaus.com/sale/', 'https://www.berghaus.com/outlet/'],
  },
  {
    name: 'Sweaty Betty',
    websiteUrl: 'https://www.sweatybetty.com',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.sweatybetty.com/sale', 'https://www.sweatybetty.com/sale/tops'],
  },
  {
    name: 'Lululemon UK',
    websiteUrl: 'https://www.lululemon.co.uk',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.lululemon.co.uk/en-gb/c/we-made-too-much'],
  },
  {
    name: 'Gymshark',
    websiteUrl: 'https://uk.gymshark.com',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://uk.gymshark.com/collections/sale'],
  },
  {
    name: 'Castore',
    websiteUrl: 'https://castore.com',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://castore.com/collections/sale'],
  },
  {
    name: 'Saucony UK',
    websiteUrl: 'https://www.saucony.com/en-gb',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.saucony.com/en-gb/sale/'],
  },
  {
    name: 'Merrell UK',
    websiteUrl: 'https://www.merrell.com/UK/en_GB',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.merrell.com/UK/en_GB/sale/'],
  },
  {
    name: 'Snow+Rock',
    websiteUrl: 'https://www.snowandrock.com',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.snowandrock.com/sale/', 'https://www.snowandrock.com/clearance/'],
  },

  // ═══════════════════════════════════════════════════════
  // 6) Beauty & Personal Care (kozmetik-kisisel-bakim) — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Glossier UK',
    websiteUrl: 'https://www.glossier.com/en-gb',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.glossier.com/en-gb/sets'],
  },
  {
    name: 'Jo Malone UK',
    websiteUrl: 'https://www.jomalone.co.uk',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.jomalone.co.uk/offers', 'https://www.jomalone.co.uk/gift-sets'],
  },
  {
    name: 'REN Clean Skincare',
    websiteUrl: 'https://www.renskincare.com/en-gb',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.renskincare.com/en-gb/offers', 'https://www.renskincare.com/en-gb/sale'],
  },
  {
    name: 'Dermalogica UK',
    websiteUrl: 'https://www.dermalogica.co.uk',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.dermalogica.co.uk/offers', 'https://www.dermalogica.co.uk/sale'],
  },
  {
    name: 'Kiehls UK',
    websiteUrl: 'https://www.kiehls.co.uk',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.kiehls.co.uk/offers', 'https://www.kiehls.co.uk/sale'],
  },
  {
    name: 'Estee Lauder UK',
    websiteUrl: 'https://www.esteelauder.co.uk',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.esteelauder.co.uk/offers', 'https://www.esteelauder.co.uk/sale'],
  },
  {
    name: 'The Perfume Shop',
    websiteUrl: 'https://www.theperfumeshop.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.theperfumeshop.com/offers', 'https://www.theperfumeshop.com/sale'],
  },
  {
    name: 'Fragrance Direct',
    websiteUrl: 'https://www.fragrancedirect.co.uk',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.fragrancedirect.co.uk/offers', 'https://www.fragrancedirect.co.uk/sale'],
  },
  {
    name: 'Holland & Barrett',
    websiteUrl: 'https://www.hollandandbarrett.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.hollandandbarrett.com/offers/', 'https://www.hollandandbarrett.com/sale/'],
  },
  {
    name: 'Tropic Skincare',
    websiteUrl: 'https://www.tropicskincare.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.tropicskincare.com/offers', 'https://www.tropicskincare.com/collections/sale'],
  },

  // ═══════════════════════════════════════════════════════
  // 7) Travel & Transport (seyahat-ulasim) — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Flybe',
    websiteUrl: 'https://www.flybe.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.flybe.com/cheap-flights', 'https://www.flybe.com/deals'],
  },
  {
    name: 'Wizz Air UK',
    websiteUrl: 'https://wizzair.com/en-gb',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://wizzair.com/en-gb/flights/offers'],
  },
  {
    name: 'Eurostar',
    websiteUrl: 'https://www.eurostar.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.eurostar.com/uk-en/deals', 'https://www.eurostar.com/uk-en/offers'],
  },
  {
    name: 'P&O Ferries',
    websiteUrl: 'https://www.poferries.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.poferries.com/en/offers'],
  },
  {
    name: 'DFDS',
    websiteUrl: 'https://www.dfds.com/en-gb',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.dfds.com/en-gb/passenger-ferries/offers'],
  },
  {
    name: 'Haven Holidays',
    websiteUrl: 'https://www.haven.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.haven.com/offers', 'https://www.haven.com/deals'],
  },
  {
    name: 'Center Parcs UK',
    websiteUrl: 'https://www.centerparcs.co.uk',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.centerparcs.co.uk/deals', 'https://www.centerparcs.co.uk/offers'],
  },
  {
    name: 'Butlins',
    websiteUrl: 'https://www.butlins.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.butlins.com/offers', 'https://www.butlins.com/deals'],
  },
  {
    name: 'Megabus UK',
    websiteUrl: 'https://uk.megabus.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://uk.megabus.com/best-bus-deals'],
  },
  {
    name: 'Hertz UK',
    websiteUrl: 'https://www.hertz.co.uk',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.hertz.co.uk/rentacar/offers/', 'https://www.hertz.co.uk/rentacar/deals/'],
  },

  // ═══════════════════════════════════════════════════════
  // 8) Automotive (otomobil) — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Nissan UK',
    websiteUrl: 'https://www.nissan.co.uk',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.nissan.co.uk/offers.html'],
  },
  {
    name: 'Honda UK',
    websiteUrl: 'https://www.honda.co.uk',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.honda.co.uk/cars/offers.html'],
  },
  {
    name: 'Vauxhall',
    websiteUrl: 'https://www.vauxhall.co.uk',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.vauxhall.co.uk/offers.html'],
  },
  {
    name: 'Peugeot UK',
    websiteUrl: 'https://www.peugeot.co.uk',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.peugeot.co.uk/offers/'],
  },
  {
    name: 'SEAT UK',
    websiteUrl: 'https://www.seat.co.uk',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.seat.co.uk/offers.html'],
  },
  {
    name: 'Skoda UK',
    websiteUrl: 'https://www.skoda.co.uk',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.skoda.co.uk/offers'],
  },
  {
    name: 'Volvo UK',
    websiteUrl: 'https://www.volvocars.com/uk',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.volvocars.com/uk/offers/'],
  },
  {
    name: 'Mazda UK',
    websiteUrl: 'https://www.mazda.co.uk',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.mazda.co.uk/offers/'],
  },
  {
    name: 'Euro Car Parts',
    websiteUrl: 'https://www.eurocarparts.com',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.eurocarparts.com/deals', 'https://www.eurocarparts.com/offers'],
  },
  {
    name: 'GSF Car Parts',
    websiteUrl: 'https://www.gsfcarparts.com',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.gsfcarparts.com/offers'],
  },

  // ═══════════════════════════════════════════════════════
  // 9) Grocery & Market (gida-market) — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'M&S Food',
    websiteUrl: 'https://www.marksandspencer.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.marksandspencer.com/c/food-to-order/offers'],
  },
  {
    name: 'Costco UK',
    websiteUrl: 'https://www.costco.co.uk',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.costco.co.uk/offers', 'https://www.costco.co.uk/hot-buys'],
  },
  {
    name: 'Booths',
    websiteUrl: 'https://www.booths.co.uk',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.booths.co.uk/offers/'],
  },
  {
    name: 'Farmfoods',
    websiteUrl: 'https://www.farmfoods.co.uk',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.farmfoods.co.uk/offers'],
  },
  {
    name: 'Jack\'s Supermarket',
    websiteUrl: 'https://www.jacks.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.jacks.com/offers'],
  },
  {
    name: 'Getir UK',
    websiteUrl: 'https://getir.com/en-gb',
    categorySlug: 'gida-market',
    seedUrls: ['https://getir.com/en-gb/campaigns/'],
  },
  {
    name: 'Riverford',
    websiteUrl: 'https://www.riverford.co.uk',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.riverford.co.uk/offers', 'https://www.riverford.co.uk/recipes'],
  },
  {
    name: 'Muscle Food',
    websiteUrl: 'https://www.musclefood.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.musclefood.com/deals', 'https://www.musclefood.com/sale/'],
  },
  {
    name: 'Approved Food',
    websiteUrl: 'https://www.approvedfood.co.uk',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.approvedfood.co.uk/clearance-food.html'],
  },
  {
    name: 'Grape Tree',
    websiteUrl: 'https://www.grapetree.co.uk',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.grapetree.co.uk/offers', 'https://www.grapetree.co.uk/sale'],
  },
  {
    name: 'Whittard of Chelsea',
    websiteUrl: 'https://www.whittard.co.uk',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.whittard.co.uk/sale', 'https://www.whittard.co.uk/offers'],
  },
  {
    name: 'Hotel Chocolat',
    websiteUrl: 'https://www.hotelchocolat.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.hotelchocolat.com/uk/sale.html', 'https://www.hotelchocolat.com/uk/offers.html'],
  },
  {
    name: 'Brew Tea Co',
    websiteUrl: 'https://www.brewteaco.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.brewteaco.com/collections/sale'],
  },
  {
    name: 'Wiltshire Farm Foods',
    websiteUrl: 'https://www.wiltshirefarmfoods.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.wiltshirefarmfoods.com/offers'],
  },
  {
    name: 'SimplyCook',
    websiteUrl: 'https://www.simplycook.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.simplycook.com/offers'],
  },

  // ═══════════════════════════════════════════════════════
  // 10) Food & Dining (yeme-icme) — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Burger King UK',
    websiteUrl: 'https://www.burgerking.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.burgerking.co.uk/offers', 'https://www.burgerking.co.uk/deals'],
  },
  {
    name: 'Subway UK',
    websiteUrl: 'https://www.subway.com/en-GB',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.subway.com/en-GB/menunutrition/offers'],
  },
  {
    name: 'Costa Coffee',
    websiteUrl: 'https://www.costa.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.costa.co.uk/offers'],
  },
  {
    name: 'Starbucks UK',
    websiteUrl: 'https://www.starbucks.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.starbucks.co.uk/rewards'],
  },
  {
    name: 'Caffe Nero',
    websiteUrl: 'https://caffenero.com',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://caffenero.com/uk/rewards/'],
  },
  {
    name: 'Toby Carvery',
    websiteUrl: 'https://www.tobycarvery.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.tobycarvery.co.uk/offers'],
  },
  {
    name: 'Harvester',
    websiteUrl: 'https://www.harvester.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.harvester.co.uk/offers'],
  },
  {
    name: 'Beefeater',
    websiteUrl: 'https://www.beefeater.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.beefeater.co.uk/offers'],
  },
  {
    name: 'Prezzo',
    websiteUrl: 'https://www.prezzorestaurants.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.prezzorestaurants.co.uk/offers/'],
  },
  {
    name: 'ASK Italian',
    websiteUrl: 'https://www.askitalian.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.askitalian.co.uk/offers/'],
  },
  {
    name: 'Zizzi',
    websiteUrl: 'https://www.zizzi.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.zizzi.co.uk/offers/'],
  },
  {
    name: 'TGI Fridays UK',
    websiteUrl: 'https://www.tgifridays.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.tgifridays.co.uk/offers/', 'https://www.tgifridays.co.uk/deals/'],
  },
  {
    name: 'Frankie & Benny\'s',
    websiteUrl: 'https://www.frankieandbennys.com',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.frankieandbennys.com/offers'],
  },
  {
    name: 'Bella Italia',
    websiteUrl: 'https://www.bellaitalia.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.bellaitalia.co.uk/offers/'],
  },
  {
    name: 'Tastecard',
    websiteUrl: 'https://www.tastecard.co.uk',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.tastecard.co.uk/deals', 'https://www.tastecard.co.uk/restaurants'],
  },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Vitality',
    websiteUrl: 'https://www.vitality.co.uk',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.vitality.co.uk/life-insurance/', 'https://www.vitality.co.uk/health-insurance/'],
  },
  {
    name: 'Bupa UK',
    websiteUrl: 'https://www.bupa.co.uk',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.bupa.co.uk/health-insurance', 'https://www.bupa.co.uk/dental-insurance'],
  },
  {
    name: 'Legal & General',
    websiteUrl: 'https://www.legalandgeneral.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.legalandgeneral.com/insurance/', 'https://www.legalandgeneral.com/life-cover/'],
  },
  {
    name: 'NFU Mutual',
    websiteUrl: 'https://www.nfumutual.co.uk',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.nfumutual.co.uk/insurance/car-insurance/', 'https://www.nfumutual.co.uk/insurance/home-insurance/'],
  },
  {
    name: 'More Than',
    websiteUrl: 'https://www.morethan.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.morethan.com/car-insurance', 'https://www.morethan.com/home-insurance'],
  },
  {
    name: 'Zurich UK',
    websiteUrl: 'https://www.zurich.co.uk',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.zurich.co.uk/insurance', 'https://www.zurich.co.uk/car-insurance'],
  },
  {
    name: 'Swinton Insurance',
    websiteUrl: 'https://www.swinton.co.uk',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.swinton.co.uk/car-insurance/', 'https://www.swinton.co.uk/home-insurance/'],
  },
  {
    name: 'John Lewis Finance',
    websiteUrl: 'https://www.johnlewisfinance.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.johnlewisfinance.com/insurance/home-insurance', 'https://www.johnlewisfinance.com/insurance/car-insurance'],
  },
  {
    name: 'M&S Insurance',
    websiteUrl: 'https://bank.marksandspencer.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://bank.marksandspencer.com/insurance/car-insurance/', 'https://bank.marksandspencer.com/insurance/home-insurance/'],
  },
  {
    name: 'Tesco Bank Insurance',
    websiteUrl: 'https://www.tescobank.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.tescobank.com/insurance/car-insurance/', 'https://www.tescobank.com/insurance/home-insurance/'],
  },
  {
    name: 'Endsleigh',
    websiteUrl: 'https://www.endsleigh.co.uk',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.endsleigh.co.uk/car-insurance/', 'https://www.endsleigh.co.uk/home-insurance/'],
  },
  {
    name: 'Sheila\'s Wheels',
    websiteUrl: 'https://www.sheilaswheels.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.sheilaswheels.com/car-insurance', 'https://www.sheilaswheels.com/home-insurance'],
  },
  {
    name: 'One Call Insurance',
    websiteUrl: 'https://www.onecallinsurance.co.uk',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.onecallinsurance.co.uk/car-insurance', 'https://www.onecallinsurance.co.uk/home-insurance'],
  },
  {
    name: 'Hiscox UK',
    websiteUrl: 'https://www.hiscox.co.uk',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.hiscox.co.uk/business-insurance', 'https://www.hiscox.co.uk/home-insurance'],
  },
  {
    name: 'Lemonade UK',
    websiteUrl: 'https://www.lemonade.com/gb',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.lemonade.com/gb/renters', 'https://www.lemonade.com/gb/homeowners'],
  },

  // ═══════════════════════════════════════════════════════
  // 12) Books & Hobbies (kitap-hobi) — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Amazon Kindle UK',
    websiteUrl: 'https://www.amazon.co.uk',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.amazon.co.uk/b?node=341689031', 'https://www.amazon.co.uk/gp/browse.html?node=12icons-deals'],
  },
  {
    name: 'Audible UK',
    websiteUrl: 'https://www.audible.co.uk',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.audible.co.uk/ep/2for1', 'https://www.audible.co.uk/ep/deals'],
  },
  {
    name: 'Book Depository',
    websiteUrl: 'https://www.bookdepository.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.bookdepository.com/deals', 'https://www.bookdepository.com/bestsellers'],
  },
  {
    name: 'Smyths Toys',
    websiteUrl: 'https://www.smythstoys.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.smythstoys.com/uk/en-gb/sale', 'https://www.smythstoys.com/uk/en-gb/deals'],
  },
  {
    name: 'The Entertainer',
    websiteUrl: 'https://www.thetoyshop.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.thetoyshop.com/sale', 'https://www.thetoyshop.com/offers'],
  },
  {
    name: 'Hamleys',
    websiteUrl: 'https://www.hamleys.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.hamleys.com/sale', 'https://www.hamleys.com/offers'],
  },
  {
    name: 'Cass Art',
    websiteUrl: 'https://www.cassart.co.uk',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.cassart.co.uk/sale', 'https://www.cassart.co.uk/offers'],
  },
  {
    name: 'Fred Aldous',
    websiteUrl: 'https://www.fredaldous.co.uk',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.fredaldous.co.uk/sale'],
  },
  {
    name: 'Jackson\'s Art Supplies',
    websiteUrl: 'https://www.jacksonsart.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.jacksonsart.com/sale/', 'https://www.jacksonsart.com/offers/'],
  },
  {
    name: 'Ravensburger UK',
    websiteUrl: 'https://www.ravensburger.co.uk',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.ravensburger.co.uk/en-GB/sale'],
  },
  {
    name: 'Warhammer',
    websiteUrl: 'https://www.warhammer.com/en-GB',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.warhammer.com/en-GB/shop/warhammer-age-of-sigmar', 'https://www.warhammer.com/en-GB/new-in'],
  },
  {
    name: 'Zavvi',
    websiteUrl: 'https://www.zavvi.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.zavvi.com/offers.list', 'https://www.zavvi.com/sale.list'],
  },
  {
    name: 'Magic Madhouse',
    websiteUrl: 'https://www.magicmadhouse.co.uk',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.magicmadhouse.co.uk/sale/', 'https://www.magicmadhouse.co.uk/deals/'],
  },
  {
    name: 'Zatu Games',
    websiteUrl: 'https://www.board-game.co.uk',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.board-game.co.uk/sale/', 'https://www.board-game.co.uk/deals/'],
  },
  {
    name: 'Kobo UK',
    websiteUrl: 'https://www.kobo.com/gb/en',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.kobo.com/gb/en/p/daily-deals'],
  },

  // ═══════════════════════════════════════════════════════
  // 13) Finance (finans) — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Wise UK',
    websiteUrl: 'https://wise.com/gb',
    categorySlug: 'finans',
    seedUrls: ['https://wise.com/gb/pricing/'],
  },
  {
    name: 'Hargreaves Lansdown',
    websiteUrl: 'https://www.hl.co.uk',
    categorySlug: 'finans',
    seedUrls: ['https://www.hl.co.uk/investment-services/fund-and-share-account/offers'],
  },
  {
    name: 'AJ Bell',
    websiteUrl: 'https://www.ajbell.co.uk',
    categorySlug: 'finans',
    seedUrls: ['https://www.ajbell.co.uk/account/offers'],
  },
  {
    name: 'Trading 212 UK',
    websiteUrl: 'https://www.trading212.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.trading212.com/promotions'],
  },
  {
    name: 'Freetrade',
    websiteUrl: 'https://freetrade.io',
    categorySlug: 'finans',
    seedUrls: ['https://freetrade.io/offers'],
  },
  {
    name: 'Nutmeg',
    websiteUrl: 'https://www.nutmeg.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.nutmeg.com/offers'],
  },
  {
    name: 'Zopa',
    websiteUrl: 'https://www.zopa.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.zopa.com/savings', 'https://www.zopa.com/credit-cards'],
  },
  {
    name: 'Metro Bank',
    websiteUrl: 'https://www.metrobankonline.co.uk',
    categorySlug: 'finans',
    seedUrls: ['https://www.metrobankonline.co.uk/current-accounts/'],
  },
  {
    name: 'TSB',
    websiteUrl: 'https://www.tsb.co.uk',
    categorySlug: 'finans',
    seedUrls: ['https://www.tsb.co.uk/current-accounts/', 'https://www.tsb.co.uk/current-accounts/switch-offer/'],
  },
  {
    name: 'Virgin Money',
    websiteUrl: 'https://uk.virginmoney.com',
    categorySlug: 'finans',
    seedUrls: ['https://uk.virginmoney.com/current-accounts/', 'https://uk.virginmoney.com/credit-cards/offers/'],
  },
  {
    name: 'Yorkshire Building Society',
    websiteUrl: 'https://www.ybs.co.uk',
    categorySlug: 'finans',
    seedUrls: ['https://www.ybs.co.uk/savings/', 'https://www.ybs.co.uk/mortgages/'],
  },
  {
    name: 'Coventry Building Society',
    websiteUrl: 'https://www.coventrybuildingsociety.co.uk',
    categorySlug: 'finans',
    seedUrls: ['https://www.coventrybuildingsociety.co.uk/savings/', 'https://www.coventrybuildingsociety.co.uk/mortgages/'],
  },
  {
    name: 'Currensea',
    websiteUrl: 'https://www.currensea.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.currensea.com/offers'],
  },
  {
    name: 'Chip Financial',
    websiteUrl: 'https://www.getchip.uk',
    categorySlug: 'finans',
    seedUrls: ['https://www.getchip.uk/savings'],
  },
  {
    name: 'Plum',
    websiteUrl: 'https://withplum.com',
    categorySlug: 'finans',
    seedUrls: ['https://withplum.com/offers', 'https://withplum.com/savings'],
  },
];

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log('=== UK Market Supplemental Brand Seed ===\n');
  console.log(`Adding ${BRANDS.length} additional brands to reach 30 per category.\n`);

  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map(c => [c.slug, c.id]));
  console.log(`Categories loaded: ${catMap.size}\n`);

  let brandOk = 0, brandErr = 0, srcNew = 0, srcUpdated = 0;

  for (const b of BRANDS) {
    const slug = toSlug(b.name);
    const categoryId = catMap.get(b.categorySlug);
    if (!categoryId) {
      console.warn(`  Category not found: ${b.categorySlug} — skipping ${b.name}`);
      brandErr++;
      continue;
    }

    try {
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'UK' } },
        update: { name: b.name, websiteUrl: b.websiteUrl, categoryId },
        create: {
          name: b.name,
          slug,
          websiteUrl: b.websiteUrl,
          market: 'UK',
          isActive: true,
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
            name: `${b.name} Deals`,
            crawlMethod: CrawlMethod.HTML,
            seedUrls: b.seedUrls,
            maxDepth: 2,
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'UK',
          },
        });
        srcNew++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(b.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: b.seedUrls, market: 'UK' },
          });
          srcUpdated++;
        }
      }

      brandOk++;
    } catch (err) {
      console.error(`  Error: ${b.name} — ${(err as Error).message}`);
      brandErr++;
    }
  }

  // Print per-category summary
  const categoryCounts = new Map<string, number>();
  for (const b of BRANDS) {
    categoryCounts.set(b.categorySlug, (categoryCounts.get(b.categorySlug) || 0) + 1);
  }
  console.log('\n--- Per-Category Additions ---');
  for (const [slug, count] of categoryCounts) {
    console.log(`  ${slug}: +${count}`);
  }

  console.log('\n=== Summary ===');
  console.log(`Brands: ${brandOk} ok, ${brandErr} errors`);
  console.log(`New sources: ${srcNew}`);
  console.log(`Updated sources: ${srcUpdated}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Script error:', e);
  process.exit(1);
});
