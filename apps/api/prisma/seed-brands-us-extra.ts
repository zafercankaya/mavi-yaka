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

// ── ~130 NEW popular US brands (not in existing seed) ──────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Neiman Marcus',
    websiteUrl: 'https://www.neimanmarcus.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.neimanmarcus.com/c/sale-cat000001',
      'https://www.neimanmarcus.com/c/designers-sale-cat58450731',
    ],
  },
  {
    name: 'Saks Fifth Avenue',
    websiteUrl: 'https://www.saksfifthavenue.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.saksfifthavenue.com/c/sale',
      'https://www.saksfifthavenue.com/c/sale/shop-all-sale',
    ],
  },
  {
    name: 'QVC',
    websiteUrl: 'https://www.qvc.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.qvc.com/content/today-special-value.html',
      'https://www.qvc.com/content/clearance.html',
    ],
  },
  {
    name: 'HSN',
    websiteUrl: 'https://www.hsn.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.hsn.com/shop/todays-special',
      'https://www.hsn.com/shop/clearance',
    ],
  },
  {
    name: 'Gilt',
    websiteUrl: 'https://www.gilt.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.gilt.com/sale/women',
      'https://www.gilt.com/sale/men',
    ],
  },
  {
    name: 'Zappos',
    websiteUrl: 'https://www.zappos.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.zappos.com/sale',
      'https://www.zappos.com/clearance',
    ],
  },
  {
    name: 'Costco Online',
    websiteUrl: 'https://www.costco.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.costco.com/online-offers.html',
      'https://www.costco.com/warehouse-savings.html',
    ],
  },
  {
    name: 'Bloomingdale\'s',
    websiteUrl: 'https://www.bloomingdales.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.bloomingdales.com/shop/sale?id=3977',
      'https://www.bloomingdales.com/shop/sale/clearance?id=3977',
    ],
  },
  {
    name: 'Rue La La',
    websiteUrl: 'https://www.ruelala.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.ruelala.com/boutique/',
    ],
  },
  {
    name: 'Mercari',
    websiteUrl: 'https://www.mercari.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.mercari.com/deals/',
      'https://www.mercari.com/promotions/',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Corsair',
    websiteUrl: 'https://www.corsair.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.corsair.com/us/en/sale',
      'https://www.corsair.com/us/en/deals',
    ],
  },
  {
    name: 'MSI',
    websiteUrl: 'https://us.msi.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://us.msi.com/Promotion/',
    ],
  },
  {
    name: 'OnePlus',
    websiteUrl: 'https://www.oneplus.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.oneplus.com/us/offers',
      'https://www.oneplus.com/us/deals',
    ],
  },
  {
    name: 'Philips',
    websiteUrl: 'https://www.usa.philips.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.usa.philips.com/c-e/deals-and-offers.html',
    ],
  },
  {
    name: 'TP-Link',
    websiteUrl: 'https://www.tp-link.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.tp-link.com/us/promotion/',
      'https://www.tp-link.com/us/deal/',
    ],
  },
  {
    name: 'Western Digital',
    websiteUrl: 'https://www.westerndigital.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.westerndigital.com/deals',
      'https://www.westerndigital.com/promotions',
    ],
  },
  {
    name: 'Sennheiser',
    websiteUrl: 'https://www.sennheiser.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.sennheiser.com/en-us/sale',
      'https://www.sennheiser.com/en-us/special-deals',
    ],
  },
  {
    name: 'SteelSeries',
    websiteUrl: 'https://steelseries.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://steelseries.com/gaming-accessories/deals',
    ],
  },
  {
    name: 'Audio-Technica',
    websiteUrl: 'https://www.audio-technica.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.audio-technica.com/en-us/sale',
      'https://www.audio-technica.com/en-us/clearance',
    ],
  },
  {
    name: 'Crucial',
    websiteUrl: 'https://www.crucial.com',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.crucial.com/promotions',
      'https://www.crucial.com/deals',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Brooks Brothers',
    websiteUrl: 'https://www.brooksbrothers.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.brooksbrothers.com/sale/',
      'https://www.brooksbrothers.com/clearance/',
    ],
  },
  {
    name: 'Kate Spade',
    websiteUrl: 'https://www.katespade.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.katespade.com/sale/',
      'https://www.katespade.com/new-arrivals/deals/',
    ],
  },
  {
    name: 'Tory Burch',
    websiteUrl: 'https://www.toryburch.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.toryburch.com/en-us/sale/',
    ],
  },
  {
    name: 'Vans',
    websiteUrl: 'https://www.vans.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.vans.com/sale',
      'https://www.vans.com/deals',
    ],
  },
  {
    name: 'Converse',
    websiteUrl: 'https://www.converse.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.converse.com/shop/sale',
      'https://www.converse.com/shop/deals',
    ],
  },
  {
    name: 'Dr. Martens',
    websiteUrl: 'https://www.drmartens.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.drmartens.com/us/en/sale',
    ],
  },
  {
    name: 'Steve Madden',
    websiteUrl: 'https://www.stevemadden.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.stevemadden.com/collections/sale',
      'https://www.stevemadden.com/collections/clearance',
    ],
  },
  {
    name: 'Crocs',
    websiteUrl: 'https://www.crocs.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.crocs.com/sale/',
      'https://www.crocs.com/deals.html',
    ],
  },
  {
    name: 'Guess',
    websiteUrl: 'https://www.guess.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.guess.com/us/en/sale/',
    ],
  },
  {
    name: 'Lucky Brand',
    websiteUrl: 'https://www.luckybrand.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.luckybrand.com/sale',
      'https://www.luckybrand.com/clearance',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 4) Gıda & Market / Grocery & Market — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Vitacost',
    websiteUrl: 'https://www.vitacost.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.vitacost.com/sale-items',
      'https://www.vitacost.com/deals',
    ],
  },
  {
    name: 'iHerb',
    websiteUrl: 'https://www.iherb.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.iherb.com/specials',
      'https://www.iherb.com/deals',
    ],
  },
  {
    name: 'Boxed',
    websiteUrl: 'https://www.boxed.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.boxed.com/deals',
    ],
  },
  {
    name: 'Peapod',
    websiteUrl: 'https://www.peapod.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.peapod.com/shop/savings',
    ],
  },
  {
    name: 'Amazon Fresh',
    websiteUrl: 'https://www.amazon.com/fmc/storefront',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.amazon.com/fmc/deals',
    ],
  },
  {
    name: 'ShopRite',
    websiteUrl: 'https://www.shoprite.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.shoprite.com/sm/planning/rsid/1/circular',
      'https://www.shoprite.com/coupons',
    ],
  },
  {
    name: 'Hy-Vee',
    websiteUrl: 'https://www.hy-vee.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.hy-vee.com/deals',
      'https://www.hy-vee.com/weekly-ads',
    ],
  },
  {
    name: 'Harris Teeter',
    websiteUrl: 'https://www.harristeeter.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.harristeeter.com/savings/deals',
      'https://www.harristeeter.com/savings/weekly-ad',
    ],
  },
  {
    name: 'Piggly Wiggly',
    websiteUrl: 'https://www.pigglywiggly.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.pigglywiggly.com/weekly-ads',
    ],
  },
  {
    name: 'Food City',
    websiteUrl: 'https://www.foodcity.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.foodcity.com/savings/',
      'https://www.foodcity.com/weeklyad/',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Dining — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Red Lobster',
    websiteUrl: 'https://www.redlobster.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.redlobster.com/deals',
      'https://www.redlobster.com/offers',
    ],
  },
  {
    name: 'TGI Friday\'s',
    websiteUrl: 'https://www.tgifridays.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.tgifridays.com/specials',
      'https://www.tgifridays.com/deals',
    ],
  },
  {
    name: 'Buffalo Wild Wings',
    websiteUrl: 'https://www.buffalowildwings.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.buffalowildwings.com/en/specials/',
      'https://www.buffalowildwings.com/en/promos/',
    ],
  },
  {
    name: 'Outback Steakhouse',
    websiteUrl: 'https://www.outback.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.outback.com/specials',
      'https://www.outback.com/offers',
    ],
  },
  {
    name: 'Cracker Barrel',
    websiteUrl: 'https://www.crackerbarrel.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.crackerbarrel.com/specials',
      'https://www.crackerbarrel.com/promotions',
    ],
  },
  {
    name: 'The Cheesecake Factory',
    websiteUrl: 'https://www.thecheesecakefactory.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.thecheesecakefactory.com/promotions',
      'https://www.thecheesecakefactory.com/specials',
    ],
  },
  {
    name: 'Whataburger',
    websiteUrl: 'https://www.whataburger.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.whataburger.com/offers',
    ],
  },
  {
    name: 'Culver\'s',
    websiteUrl: 'https://www.culvers.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.culvers.com/promotions',
      'https://www.culvers.com/menu-and-nutrition/limited-time-offerings',
    ],
  },
  {
    name: 'Raising Cane\'s',
    websiteUrl: 'https://www.raisingcanes.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.raisingcanes.com/offers',
    ],
  },
  {
    name: 'Noodles & Company',
    websiteUrl: 'https://www.noodles.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.noodles.com/deals',
      'https://www.noodles.com/offers',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty & Personal Care — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Morphe',
    websiteUrl: 'https://www.morphe.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.morphe.com/collections/sale',
      'https://www.morphe.com/collections/deals',
    ],
  },
  {
    name: 'Benefit Cosmetics',
    websiteUrl: 'https://www.benefitcosmetics.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.benefitcosmetics.com/en-us/shop/sale',
      'https://www.benefitcosmetics.com/en-us/offers',
    ],
  },
  {
    name: 'NARS',
    websiteUrl: 'https://www.narscosmetics.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.narscosmetics.com/USA/sale',
      'https://www.narscosmetics.com/USA/offers',
    ],
  },
  {
    name: 'Bobbi Brown',
    websiteUrl: 'https://www.bobbibrown.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.bobbibrown.com/offers',
      'https://www.bobbibrown.com/sale',
    ],
  },
  {
    name: 'Urban Decay',
    websiteUrl: 'https://www.urbandecay.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.urbandecay.com/sale',
      'https://www.urbandecay.com/offers',
    ],
  },
  {
    name: 'Too Faced',
    websiteUrl: 'https://www.toofaced.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.toofaced.com/sale/',
      'https://www.toofaced.com/offers/',
    ],
  },
  {
    name: 'IT Cosmetics',
    websiteUrl: 'https://www.itcosmetics.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.itcosmetics.com/sale',
      'https://www.itcosmetics.com/offers',
    ],
  },
  {
    name: 'Aveda',
    websiteUrl: 'https://www.aveda.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.aveda.com/offers',
      'https://www.aveda.com/sale',
    ],
  },
  {
    name: 'Dermstore',
    websiteUrl: 'https://www.dermstore.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.dermstore.com/sale.list',
      'https://www.dermstore.com/offers.list',
    ],
  },
  {
    name: 'Clinique',
    websiteUrl: 'https://www.clinique.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.clinique.com/offers',
      'https://www.clinique.com/sale',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'World Market',
    websiteUrl: 'https://www.worldmarket.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.worldmarket.com/category/sale.do',
      'https://www.worldmarket.com/category/sale/clearance.do',
    ],
  },
  {
    name: 'At Home',
    websiteUrl: 'https://www.athome.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.athome.com/sale/',
      'https://www.athome.com/clearance/',
    ],
  },
  {
    name: 'Lamps Plus',
    websiteUrl: 'https://www.lampsplus.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.lampsplus.com/sale/',
      'https://www.lampsplus.com/products/clearance/',
    ],
  },
  {
    name: 'Joss & Main',
    websiteUrl: 'https://www.jossandmain.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.jossandmain.com/deals',
      'https://www.jossandmain.com/daily-sales',
    ],
  },
  {
    name: 'Birch Lane',
    websiteUrl: 'https://www.birchlane.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.birchlane.com/deals',
      'https://www.birchlane.com/daily-sales',
    ],
  },
  {
    name: 'Kirkland\'s',
    websiteUrl: 'https://www.kirklands.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.kirklands.com/category/Sale/pc/2777/',
      'https://www.kirklands.com/category/Sale/Clearance/pc/2777/2778.uts',
    ],
  },
  {
    name: 'Pottery Barn Kids',
    websiteUrl: 'https://www.potterybarnkids.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.potterybarnkids.com/shop/sale/',
    ],
  },
  {
    name: 'Serena & Lily',
    websiteUrl: 'https://www.serenaandlily.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.serenaandlily.com/sale/',
    ],
  },
  {
    name: 'Havenly',
    websiteUrl: 'https://www.havenly.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.havenly.com/shop/sales',
    ],
  },
  {
    name: 'Tuft & Needle',
    websiteUrl: 'https://www.tuftandneedle.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.tuftandneedle.com/deals/',
      'https://www.tuftandneedle.com/sale/',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Saucony',
    websiteUrl: 'https://www.saucony.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.saucony.com/en/sale/',
      'https://www.saucony.com/en/clearance/',
    ],
  },
  {
    name: 'Oakley',
    websiteUrl: 'https://www.oakley.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.oakley.com/en-us/sale',
      'https://www.oakley.com/en-us/deals',
    ],
  },
  {
    name: 'Callaway Golf',
    websiteUrl: 'https://www.callawaygolf.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.callawaygolf.com/on-sale/',
      'https://www.callawaygolf.com/clearance/',
    ],
  },
  {
    name: 'prAna',
    websiteUrl: 'https://www.prana.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.prana.com/sale.html',
      'https://www.prana.com/clearance.html',
    ],
  },
  {
    name: 'KEEN',
    websiteUrl: 'https://www.keenfootwear.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.keenfootwear.com/sale/',
      'https://www.keenfootwear.com/clearance/',
    ],
  },
  {
    name: 'Garmin',
    websiteUrl: 'https://www.garmin.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.garmin.com/en-US/sale/',
      'https://www.garmin.com/en-US/deals/',
    ],
  },
  {
    name: 'Fitbit',
    websiteUrl: 'https://www.fitbit.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.fitbit.com/global/us/products/deals',
    ],
  },
  {
    name: 'TravisMathew',
    websiteUrl: 'https://www.travismathew.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.travismathew.com/collections/sale',
    ],
  },
  {
    name: 'Wolverine',
    websiteUrl: 'https://www.wolverine.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.wolverine.com/US/en/sale/',
      'https://www.wolverine.com/US/en/clearance/',
    ],
  },
  {
    name: 'Black Diamond',
    websiteUrl: 'https://www.blackdiamondequipment.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.blackdiamondequipment.com/en_US/shop/sale/',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Carnival Cruise',
    websiteUrl: 'https://www.carnival.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.carnival.com/cruise-deals',
      'https://www.carnival.com/cruise-deals/last-minute-deals',
    ],
  },
  {
    name: 'Norwegian Cruise Line',
    websiteUrl: 'https://www.ncl.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.ncl.com/cruise-deals',
      'https://www.ncl.com/cruise-deals/last-minute-cruises',
    ],
  },
  {
    name: 'Princess Cruises',
    websiteUrl: 'https://www.princess.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.princess.com/cruise-deals/',
    ],
  },
  {
    name: 'Holland America',
    websiteUrl: 'https://www.hollandamerica.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.hollandamerica.com/en/us/deals',
      'https://www.hollandamerica.com/en/us/cruise-deals',
    ],
  },
  {
    name: 'Avis',
    websiteUrl: 'https://www.avis.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.avis.com/en/offers/codes/coupon-codes',
      'https://www.avis.com/en/offers',
    ],
  },
  {
    name: 'Budget Car Rental',
    websiteUrl: 'https://www.budget.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.budget.com/en/deals',
      'https://www.budget.com/en/offers',
    ],
  },
  {
    name: 'National Car Rental',
    websiteUrl: 'https://www.nationalcar.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.nationalcar.com/en/deals.html',
      'https://www.nationalcar.com/en/offers.html',
    ],
  },
  {
    name: 'Sixt',
    websiteUrl: 'https://www.sixt.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.sixt.com/deals/',
      'https://www.sixt.com/car-rental/usa/',
    ],
  },
  {
    name: 'Trivago',
    websiteUrl: 'https://www.trivago.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.trivago.com/deals',
    ],
  },
  {
    name: 'Turo',
    websiteUrl: 'https://www.turo.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.turo.com/en-us/deals',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 10) Finans / Finance — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'TD Bank',
    websiteUrl: 'https://www.td.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.td.com/us/en/personal-banking/offers/',
      'https://www.td.com/us/en/personal-banking/promotions/',
    ],
  },
  {
    name: 'PNC Bank',
    websiteUrl: 'https://www.pnc.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.pnc.com/en/personal-banking/banking/savings/offers.html',
    ],
  },
  {
    name: 'Fidelity',
    websiteUrl: 'https://www.fidelity.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.fidelity.com/go/offers/',
      'https://www.fidelity.com/promotions/overview',
    ],
  },
  {
    name: 'Charles Schwab',
    websiteUrl: 'https://www.schwab.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.schwab.com/offers',
      'https://www.schwab.com/promotions',
    ],
  },
  {
    name: 'E*TRADE',
    websiteUrl: 'https://us.etrade.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://us.etrade.com/what-we-offer/our-accounts/promotions',
    ],
  },
  {
    name: 'Coinbase',
    websiteUrl: 'https://www.coinbase.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.coinbase.com/promotions',
      'https://www.coinbase.com/earn',
    ],
  },
  {
    name: 'Acorns',
    websiteUrl: 'https://www.acorns.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.acorns.com/promotions/',
    ],
  },
  {
    name: 'Betterment',
    websiteUrl: 'https://www.betterment.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.betterment.com/promotions',
    ],
  },
  {
    name: 'Wealthfront',
    websiteUrl: 'https://www.wealthfront.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.wealthfront.com/promotions',
    ],
  },
  {
    name: 'M1 Finance',
    websiteUrl: 'https://www.m1.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.m1.com/promotions/',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'MetLife',
    websiteUrl: 'https://www.metlife.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.metlife.com/insurance/offers/',
      'https://www.metlife.com/about-us/promotions/',
    ],
  },
  {
    name: 'Aflac',
    websiteUrl: 'https://www.aflac.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.aflac.com/individuals/promotions/',
      'https://www.aflac.com/individuals/offers/',
    ],
  },
  {
    name: 'Aetna',
    websiteUrl: 'https://www.aetna.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.aetna.com/individuals-families/member-savings.html',
      'https://www.aetna.com/health-guide/deals-and-discounts.html',
    ],
  },
  {
    name: 'Cigna',
    websiteUrl: 'https://www.cigna.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.cigna.com/individuals-families/member-resources/offers/',
    ],
  },
  {
    name: 'UnitedHealthcare',
    websiteUrl: 'https://www.uhc.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.uhc.com/member-resources/offers',
    ],
  },
  {
    name: 'Humana',
    websiteUrl: 'https://www.humana.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.humana.com/manage-your-health/discounts',
    ],
  },
  {
    name: 'Blue Cross Blue Shield',
    websiteUrl: 'https://www.bcbs.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.bcbs.com/member-discounts',
      'https://www.bcbs.com/offers',
    ],
  },
  {
    name: 'Chubb Insurance',
    websiteUrl: 'https://www.chubb.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.chubb.com/us-en/individuals-families/offers.html',
    ],
  },
  {
    name: 'Shelter Insurance',
    websiteUrl: 'https://www.shelterinsurance.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.shelterinsurance.com/products/discounts',
    ],
  },
  {
    name: 'Safeco Insurance',
    websiteUrl: 'https://www.safeco.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.safeco.com/insurance/discounts',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Lexus',
    websiteUrl: 'https://www.lexus.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.lexus.com/deals',
      'https://www.lexus.com/offers',
    ],
  },
  {
    name: 'Infiniti',
    websiteUrl: 'https://www.infinitiusa.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.infinitiusa.com/shopping-tools/offers-and-incentives',
    ],
  },
  {
    name: 'Acura',
    websiteUrl: 'https://www.acura.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.acura.com/deals',
      'https://www.acura.com/offers',
    ],
  },
  {
    name: 'Genesis',
    websiteUrl: 'https://www.genesis.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.genesis.com/us/en/offers.html',
    ],
  },
  {
    name: 'Volvo',
    websiteUrl: 'https://www.volvocars.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.volvocars.com/us/shopping-tools/current-offers/',
      'https://www.volvocars.com/us/shopping-tools/deals/',
    ],
  },
  {
    name: 'Buick',
    websiteUrl: 'https://www.buick.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.buick.com/current-offers',
    ],
  },
  {
    name: 'Ram Trucks',
    websiteUrl: 'https://www.ramtrucks.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.ramtrucks.com/incentives-offers.html',
    ],
  },
  {
    name: 'GMC',
    websiteUrl: 'https://www.gmc.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.gmc.com/current-offers',
    ],
  },
  {
    name: 'Chrysler',
    websiteUrl: 'https://www.chrysler.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.chrysler.com/incentives-offers.html',
    ],
  },
  {
    name: 'Dodge',
    websiteUrl: 'https://www.dodge.com',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.dodge.com/incentives-offers.html',
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 10 brands
  // ═══════════════════════════════════════════════════════════════
  {
    name: 'Cricut',
    websiteUrl: 'https://www.cricut.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.cricut.com/en-us/sale',
      'https://www.cricut.com/en-us/deals',
    ],
  },
  {
    name: 'Steam',
    websiteUrl: 'https://store.steampowered.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://store.steampowered.com/specials/',
      'https://store.steampowered.com/search/?specials=1',
    ],
  },
  {
    name: 'PlayStation Store',
    websiteUrl: 'https://store.playstation.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://store.playstation.com/en-us/category/deals/',
    ],
  },
  {
    name: 'Xbox',
    websiteUrl: 'https://www.xbox.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.xbox.com/en-US/games/deals',
      'https://www.xbox.com/en-US/promotions',
    ],
  },
  {
    name: 'Epic Games Store',
    websiteUrl: 'https://store.epicgames.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://store.epicgames.com/en-US/free-games',
      'https://store.epicgames.com/en-US/browse?sortBy=releaseDate&sortDir=DESC&priceTier=tierDiscouted',
    ],
  },
  {
    name: 'Fender',
    websiteUrl: 'https://www.fender.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.fender.com/en-US/sale/',
      'https://www.fender.com/en-US/deals/',
    ],
  },
  {
    name: 'Sweetwater',
    websiteUrl: 'https://www.sweetwater.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.sweetwater.com/deals',
      'https://www.sweetwater.com/sale',
    ],
  },
  {
    name: 'B&H Photo Hobbies',
    websiteUrl: 'https://www.bhphotovideo.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.bhphotovideo.com/c/browse/deals-savings/ci/36189',
    ],
  },
  {
    name: 'Spotify',
    websiteUrl: 'https://www.spotify.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.spotify.com/us/premium/',
      'https://www.spotify.com/us/offers/',
    ],
  },
  {
    name: 'Craftsy',
    websiteUrl: 'https://www.craftsy.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.craftsy.com/sale/',
      'https://www.craftsy.com/deals/',
    ],
  },
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
  console.log('=== US Extra Brand Seeding Script ===\n');

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
        where: { slug_market: { slug, market: 'US' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          market: 'US',
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
      });
      brandsOk++;

      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id },
      });

      if (existingSource) {
        await prisma.crawlSource.update({
          where: { id: existingSource.id },
          data: { seedUrls: entry.seedUrls, isActive: true },
        });
        sourcesUpdated++;
      } else {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Deals`,
            crawlMethod: CrawlMethod.HTML,
            seedUrls: entry.seedUrls,
            maxDepth: 2,
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'US',
            isActive: true,
          },
        });
        sourcesCreated++;
      }
    } catch (err: any) {
      errors++;
      console.error(`  Error processing ${entry.name}: ${err.message}`);
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Brands processed:  ${brandsOk}`);
  console.log(`Sources created:   ${sourcesCreated}`);
  console.log(`Sources updated:   ${sourcesUpdated}`);
  console.log(`Errors:            ${errors}`);
  if (missingCategories.size > 0) {
    console.log(`Missing categories: ${Array.from(missingCategories).join(', ')}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
