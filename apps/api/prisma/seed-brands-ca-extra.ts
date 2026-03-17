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
// SUPPLEMENTAL CA BRANDS — ~154 additional brands
// Fills each category to ~30 total brands.
// ══════════════════════════════════════════════════════════
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 7 more (23 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Dollarama',
    websiteUrl: 'https://www.dollarama.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.dollarama.com/en-CA/products/new-arrivals'],
  },
  {
    name: 'Canadian Tire',
    websiteUrl: 'https://www.canadiantire.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.canadiantire.ca/en/deals.html', 'https://www.canadiantire.ca/en/clearance.html'],
  },
  {
    name: 'Indigo',
    websiteUrl: 'https://www.indigo.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.indigo.ca/en-ca/sale/', 'https://www.indigo.ca/en-ca/deals/'],
  },
  {
    name: 'Well.ca',
    websiteUrl: 'https://well.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://well.ca/on-sale/', 'https://well.ca/deals/'],
  },
  {
    name: 'The Source',
    websiteUrl: 'https://www.thesource.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.thesource.ca/en-ca/deals', 'https://www.thesource.ca/en-ca/clearance'],
  },
  {
    name: 'Bed Bath and Beyond Canada',
    websiteUrl: 'https://www.bedbathandbeyond.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.bedbathandbeyond.ca/store/category/clearance/16006/'],
  },
  {
    name: 'Princess Auto',
    websiteUrl: 'https://www.princessauto.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.princessauto.com/en/clearance', 'https://www.princessauto.com/en/deals'],
  },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 14 more (16 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Canada Computers',
    websiteUrl: 'https://www.canadacomputers.com',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.canadacomputers.com/promotions', 'https://www.canadacomputers.com/clearance'],
  },
  {
    name: 'Newegg Canada',
    websiteUrl: 'https://www.newegg.ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.newegg.ca/todays-deals', 'https://www.newegg.ca/promotions'],
  },
  {
    name: 'The Source Electronics',
    websiteUrl: 'https://www.thesource.ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.thesource.ca/en-ca/deals', 'https://www.thesource.ca/en-ca/computers-tablets/c/scc-1'],
  },
  {
    name: 'Apple Canada',
    websiteUrl: 'https://www.apple.com/ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.apple.com/ca/shop/go/product/refurbished', 'https://www.apple.com/ca/shop/go/special_deals'],
  },
  {
    name: 'Microsoft Canada',
    websiteUrl: 'https://www.microsoft.com/en-ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.microsoft.com/en-ca/store/deals', 'https://www.microsoft.com/en-ca/store/collections/pcsale'],
  },
  {
    name: 'Sony Canada',
    websiteUrl: 'https://www.sony.ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.sony.ca/en/promotions', 'https://www.sony.ca/en/electronics/outlet'],
  },
  {
    name: 'Bose Canada',
    websiteUrl: 'https://www.bose.ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.bose.ca/en/promotions', 'https://www.bose.ca/en/deals'],
  },
  {
    name: 'JBL Canada',
    websiteUrl: 'https://www.jbl.ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.jbl.ca/sale', 'https://www.jbl.ca/deals'],
  },
  {
    name: 'Canon Canada',
    websiteUrl: 'https://www.canon.ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.canon.ca/en/promotions', 'https://www.canon.ca/en/shop/refurbished'],
  },
  {
    name: 'Dyson Canada',
    websiteUrl: 'https://www.dyson.ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.dyson.ca/en/offers', 'https://www.dyson.ca/en/outlet'],
  },
  {
    name: 'Nintendo Canada',
    websiteUrl: 'https://www.nintendo.com/en-ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.nintendo.com/en-ca/store/deals/'],
  },
  {
    name: 'Xbox Canada',
    websiteUrl: 'https://www.xbox.com/en-CA',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.xbox.com/en-CA/promotions', 'https://www.xbox.com/en-CA/games/deals'],
  },
  {
    name: 'Logitech Canada',
    websiteUrl: 'https://www.logitech.com/en-ca',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.logitech.com/en-ca/promo.html'],
  },
  {
    name: 'Razer Canada',
    websiteUrl: 'https://www.razer.com/ca-en',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.razer.com/ca-en/deals', 'https://www.razer.com/ca-en/campaigns'],
  },

  // ═══════════════════════════════════════════════════════
  // 3) Fashion (giyim-moda) — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Ardene',
    websiteUrl: 'https://www.ardene.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.ardene.com/en/sale', 'https://www.ardene.com/en/deals'],
  },
  {
    name: 'Lululemon Canada',
    websiteUrl: 'https://shop.lululemon.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://shop.lululemon.com/c/sale/_/N-1z0xcmkZ1z0xl3b'],
  },
  {
    name: 'Frank And Oak',
    websiteUrl: 'https://www.frankandoak.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.frankandoak.com/collections/sale'],
  },
  {
    name: 'Uniqlo Canada',
    websiteUrl: 'https://www.uniqlo.com/ca/en',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.uniqlo.com/ca/en/spl/sale'],
  },
  {
    name: 'RW and Co',
    websiteUrl: 'https://www.rw-co.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.rw-co.com/en/sale/', 'https://www.rw-co.com/en/deals/'],
  },
  {
    name: 'Laura Canada',
    websiteUrl: 'https://www.laura.ca',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.laura.ca/sale', 'https://www.laura.ca/promotions'],
  },
  {
    name: 'Aldo Canada',
    websiteUrl: 'https://www.aldoshoes.com/ca/en',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.aldoshoes.com/ca/en/sale'],
  },
  {
    name: 'Forever 21 Canada',
    websiteUrl: 'https://www.forever21.ca',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.forever21.ca/collections/sale'],
  },
  {
    name: 'Nordstrom Canada',
    websiteUrl: 'https://www.nordstrom.ca',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.nordstrom.ca/browse/sale'],
  },
  {
    name: 'Suzy Shier',
    websiteUrl: 'https://www.suzyshier.com',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.suzyshier.com/en/sale/'],
  },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 8 more (22 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'The Brick',
    websiteUrl: 'https://www.thebrick.com',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.thebrick.com/collections/deals', 'https://www.thebrick.com/collections/clearance'],
  },
  {
    name: 'EQ3',
    websiteUrl: 'https://www.eq3.com',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.eq3.com/ca/en/sale'],
  },
  {
    name: 'Jysk Canada',
    websiteUrl: 'https://www.jysk.ca',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.jysk.ca/sale', 'https://www.jysk.ca/clearance'],
  },
  {
    name: 'Urban Barn',
    websiteUrl: 'https://www.urbanbarn.com',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.urbanbarn.com/en/sale/', 'https://www.urbanbarn.com/en/clearance/'],
  },
  {
    name: 'Endy',
    websiteUrl: 'https://www.endy.com',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.endy.com/pages/promotions'],
  },
  {
    name: 'Canadian Tire Home',
    websiteUrl: 'https://www.canadiantire.ca',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.canadiantire.ca/en/home-living.html', 'https://www.canadiantire.ca/en/deals.html'],
  },
  {
    name: 'Bed Bath and Beyond Home CA',
    websiteUrl: 'https://www.bedbathandbeyond.ca',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.bedbathandbeyond.ca/store/category/clearance/16006/'],
  },
  {
    name: 'Casper Canada',
    websiteUrl: 'https://casper.com/ca/en',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://casper.com/ca/en/promo/'],
  },

  // ═══════════════════════════════════════════════════════
  // 5) Grocery (gida-market) — 7 more (23 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Voila by Sobeys',
    websiteUrl: 'https://voila.ca',
    categorySlug: 'gida-market',
    seedUrls: ['https://voila.ca/promotions'],
  },
  {
    name: 'Bulk Barn',
    websiteUrl: 'https://www.bulkbarn.ca',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.bulkbarn.ca/en/Flyer'],
  },
  {
    name: 'Instacart Canada',
    websiteUrl: 'https://www.instacart.ca',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.instacart.ca/store/deals'],
  },
  {
    name: 'Natura Market',
    websiteUrl: 'https://naturamarket.ca',
    categorySlug: 'gida-market',
    seedUrls: ['https://naturamarket.ca/collections/sale', 'https://naturamarket.ca/collections/deals'],
  },
  {
    name: 'Thrifty Foods',
    websiteUrl: 'https://www.thriftyfoods.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.thriftyfoods.com/weekly-flyer'],
  },
  {
    name: 'Co-op Canada',
    websiteUrl: 'https://www.coopconnection.ca',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.coopconnection.ca/flyer/'],
  },
  {
    name: 'Galleria Supermarket',
    websiteUrl: 'https://www.galleriasm.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.galleriasm.com/flyer'],
  },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Drink / Restaurants (yeme-icme) — 8 more (22 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Popeyes Canada',
    websiteUrl: 'https://www.popeyes.ca',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.popeyes.ca/offers', 'https://www.popeyes.ca/promotions'],
  },
  {
    name: 'Subway Canada',
    websiteUrl: 'https://www.subway.com/en-CA',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.subway.com/en-CA/menunutrition/deals'],
  },
  {
    name: 'Taco Bell Canada',
    websiteUrl: 'https://www.tacobell.ca',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.tacobell.ca/en/deals', 'https://www.tacobell.ca/en/offers'],
  },
  {
    name: 'Dairy Queen Canada',
    websiteUrl: 'https://www.dairyqueen.com/en-ca',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.dairyqueen.com/en-ca/deals/'],
  },
  {
    name: 'Pita Pit Canada',
    websiteUrl: 'https://pitapit.ca',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://pitapit.ca/promotions/'],
  },
  {
    name: 'Nando\'s Canada',
    websiteUrl: 'https://www.nandos.ca',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.nandos.ca/whats-new', 'https://www.nandos.ca/offers'],
  },
  {
    name: 'Cora Breakfast',
    websiteUrl: 'https://www.chezcora.com',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.chezcora.com/en/promotions'],
  },
  {
    name: 'Instacart Eats Canada',
    websiteUrl: 'https://www.instacart.ca',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.instacart.ca/store/deals'],
  },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty & Personal Care (kozmetik-kisisel-bakim) — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'MAC Cosmetics Canada',
    websiteUrl: 'https://www.maccosmetics.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.maccosmetics.ca/offers', 'https://www.maccosmetics.ca/last-chance'],
  },
  {
    name: 'The Body Shop Canada',
    websiteUrl: 'https://www.thebodyshop.com/en-ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.thebodyshop.com/en-ca/offers', 'https://www.thebodyshop.com/en-ca/sale'],
  },
  {
    name: 'Estee Lauder Canada',
    websiteUrl: 'https://www.esteelauder.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.esteelauder.ca/offers'],
  },
  {
    name: 'Aveda Canada',
    websiteUrl: 'https://www.aveda.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.aveda.ca/offers'],
  },
  {
    name: 'Bobbi Brown Canada',
    websiteUrl: 'https://www.bobbibrown.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.bobbibrown.ca/offers', 'https://www.bobbibrown.ca/sale'],
  },
  {
    name: 'Origins Canada',
    websiteUrl: 'https://www.origins.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.origins.ca/offers'],
  },
  {
    name: 'Clarins Canada',
    websiteUrl: 'https://www.clarins.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.clarins.ca/offers', 'https://www.clarins.ca/promotions'],
  },
  {
    name: 'Benefit Cosmetics Canada',
    websiteUrl: 'https://www.benefitcosmetics.com/en-ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.benefitcosmetics.com/en-ca/offers'],
  },
  {
    name: 'Biotherm Canada',
    websiteUrl: 'https://www.biotherm.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.biotherm.ca/offers', 'https://www.biotherm.ca/promotions'],
  },
  {
    name: 'Deciem Canada',
    websiteUrl: 'https://deciem.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://deciem.com/ca/offers', 'https://deciem.com/ca/theordinary'],
  },
  {
    name: 'Well.ca Beauty',
    websiteUrl: 'https://well.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://well.ca/categories/beauty_33.html', 'https://well.ca/on-sale/'],
  },
  {
    name: 'Murale',
    websiteUrl: 'https://www.shoppersdrugmart.ca/en/beauty',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.shoppersdrugmart.ca/en/beauty/deals'],
  },
  {
    name: 'Caudalie Canada',
    websiteUrl: 'https://ca.caudalie.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://ca.caudalie.com/offers', 'https://ca.caudalie.com/promotions'],
  },
  {
    name: 'Vichy Canada',
    websiteUrl: 'https://www.vichy.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.vichy.ca/offers', 'https://www.vichy.ca/promotions'],
  },
  {
    name: 'La Roche-Posay Canada',
    websiteUrl: 'https://www.laroche-posay.ca',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.laroche-posay.ca/offers'],
  },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 7 more (23 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Under Armour Canada',
    websiteUrl: 'https://www.underarmour.com/en-ca',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.underarmour.com/en-ca/c/outlet/'],
  },
  {
    name: 'Lululemon Sports',
    websiteUrl: 'https://shop.lululemon.com',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://shop.lululemon.com/c/sale/_/N-1z0xcmkZ1z0xl3b'],
  },
  {
    name: 'Hockey Monkey Canada',
    websiteUrl: 'https://www.hockeymonkey.ca',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.hockeymonkey.ca/sale/', 'https://www.hockeymonkey.ca/clearance/'],
  },
  {
    name: 'Reebok Canada',
    websiteUrl: 'https://www.reebok.ca',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.reebok.ca/en/sale'],
  },
  {
    name: 'Vans Canada',
    websiteUrl: 'https://www.vans.ca',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.vans.ca/en-ca/sale'],
  },
  {
    name: 'Saucony Canada',
    websiteUrl: 'https://www.saucony.com/en/ca',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.saucony.com/en/ca/sale/'],
  },
  {
    name: 'Mountain Warehouse Canada',
    websiteUrl: 'https://www.mountainwarehouse.com/ca',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.mountainwarehouse.com/ca/sale/', 'https://www.mountainwarehouse.com/ca/clearance/'],
  },

  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Air Canada',
    websiteUrl: 'https://www.aircanada.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.aircanada.com/ca/en/aco/home/book/deals-and-offers.html'],
  },
  {
    name: 'Marriott Canada',
    websiteUrl: 'https://www.marriott.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.marriott.com/offers/deals-canada'],
  },
  {
    name: 'IHG Canada',
    websiteUrl: 'https://www.ihg.com/hotels/ca/en',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.ihg.com/hotels/ca/en/offers'],
  },
  {
    name: 'Sunwing',
    websiteUrl: 'https://www.sunwing.ca',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.sunwing.ca/en/deals', 'https://www.sunwing.ca/en/promotions'],
  },
  {
    name: 'itravel2000',
    websiteUrl: 'https://www.itravel2000.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.itravel2000.com/deals'],
  },
  {
    name: 'VIA Rail',
    websiteUrl: 'https://www.viarail.ca',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.viarail.ca/en/offers-and-deals'],
  },
  {
    name: 'National Car Rental Canada',
    websiteUrl: 'https://www.nationalcar.ca',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.nationalcar.ca/en/car-rental/deals.html'],
  },
  {
    name: 'Hotwire Canada',
    websiteUrl: 'https://www.hotwire.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.hotwire.com/deals'],
  },
  {
    name: 'Trivago Canada',
    websiteUrl: 'https://www.trivago.ca',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.trivago.ca/en-CA/lm/deals'],
  },
  {
    name: 'Hotels.com Canada',
    websiteUrl: 'https://ca.hotels.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://ca.hotels.com/deals/', 'https://ca.hotels.com/page/travel-deals/'],
  },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 17 more (13 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'RBC Royal Bank',
    websiteUrl: 'https://www.rbcroyalbank.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.rbcroyalbank.com/personal/offers.html'],
  },
  {
    name: 'BMO Bank of Montreal',
    websiteUrl: 'https://www.bmo.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.bmo.com/main/personal/credit-cards/offers/'],
  },
  {
    name: 'National Bank of Canada',
    websiteUrl: 'https://www.nbc.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.nbc.ca/personal/offers.html'],
  },
  {
    name: 'HSBC Canada',
    websiteUrl: 'https://www.hsbc.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.hsbc.ca/offers/'],
  },
  {
    name: 'ATB Financial',
    websiteUrl: 'https://www.atb.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.atb.com/personal/offers/'],
  },
  {
    name: 'Coast Capital Savings',
    websiteUrl: 'https://www.coastcapitalsavings.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.coastcapitalsavings.com/offers'],
  },
  {
    name: 'Desjardins',
    websiteUrl: 'https://www.desjardins.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.desjardins.com/ca/personal/promotions/'],
  },
  {
    name: 'Wealthsimple',
    websiteUrl: 'https://www.wealthsimple.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.wealthsimple.com/en-ca/offers'],
  },
  {
    name: 'EQ Bank',
    websiteUrl: 'https://www.eqbank.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.eqbank.ca/personal-banking/promotions'],
  },
  {
    name: 'Neo Financial',
    websiteUrl: 'https://www.neofinancial.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.neofinancial.com/offers'],
  },
  {
    name: 'KOHO',
    websiteUrl: 'https://www.koho.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.koho.ca/offers/'],
  },
  {
    name: 'Mogo',
    websiteUrl: 'https://www.mogo.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.mogo.ca/offers'],
  },
  {
    name: 'Laurentian Bank',
    websiteUrl: 'https://www.laurentianbank.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.laurentianbank.ca/en/personal-banking/promotions.html'],
  },
  {
    name: 'Servus Credit Union',
    websiteUrl: 'https://www.servus.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.servus.ca/offers'],
  },
  {
    name: 'Alterna Savings',
    websiteUrl: 'https://www.alterna.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.alterna.ca/personal/promotions/'],
  },
  {
    name: 'Canadian Western Bank',
    websiteUrl: 'https://www.cwbank.com',
    categorySlug: 'finans',
    seedUrls: ['https://www.cwbank.com/personal/offers'],
  },
  {
    name: 'Libro Credit Union',
    websiteUrl: 'https://www.libro.ca',
    categorySlug: 'finans',
    seedUrls: ['https://www.libro.ca/offers'],
  },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 12 more (8 → 20)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Sonnet Insurance',
    websiteUrl: 'https://www.sonnet.ca',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.sonnet.ca/offers', 'https://www.sonnet.ca/promotions'],
  },
  {
    name: 'Aviva Canada',
    websiteUrl: 'https://www.aviva.ca',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.aviva.ca/en/offers/'],
  },
  {
    name: 'Co-operators Insurance',
    websiteUrl: 'https://www.cooperators.ca',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.cooperators.ca/en/promotions'],
  },
  {
    name: 'Manulife Insurance',
    websiteUrl: 'https://www.manulife.ca',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.manulife.ca/personal/offers.html'],
  },
  {
    name: 'Sun Life Canada',
    websiteUrl: 'https://www.sunlife.ca',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.sunlife.ca/en/offers/'],
  },
  {
    name: 'Great-West Lifeco',
    websiteUrl: 'https://www.greatwestlifeco.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.greatwestlifeco.com/offers'],
  },
  {
    name: 'Canada Life',
    websiteUrl: 'https://www.canadalife.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.canadalife.com/offers'],
  },
  {
    name: 'Industrial Alliance',
    websiteUrl: 'https://ia.ca',
    categorySlug: 'sigorta',
    seedUrls: ['https://ia.ca/individuals/promotions'],
  },
  {
    name: 'Belairdirect',
    websiteUrl: 'https://www.belairdirect.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.belairdirect.com/offers', 'https://www.belairdirect.com/promotions'],
  },
  {
    name: 'TD Insurance',
    websiteUrl: 'https://www.tdinsurance.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.tdinsurance.com/offers'],
  },
  {
    name: 'RBC Insurance',
    websiteUrl: 'https://www.rbcinsurance.com',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.rbcinsurance.com/offers/'],
  },
  {
    name: 'Kanetix',
    websiteUrl: 'https://www.kanetix.ca',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.kanetix.ca/insurance-deals'],
  },

  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Toyota Canada',
    websiteUrl: 'https://www.toyota.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.toyota.ca/toyota/en/offers'],
  },
  {
    name: 'Honda Canada',
    websiteUrl: 'https://www.honda.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.honda.ca/offers'],
  },
  {
    name: 'Hyundai Canada',
    websiteUrl: 'https://www.hyundaicanada.com',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.hyundaicanada.com/en/offers'],
  },
  {
    name: 'Chevrolet Canada',
    websiteUrl: 'https://www.chevrolet.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.chevrolet.ca/en/current-offers'],
  },
  {
    name: 'GMC Canada',
    websiteUrl: 'https://www.gmc.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.gmc.ca/en/current-offers'],
  },
  {
    name: 'Subaru Canada',
    websiteUrl: 'https://www.subaru.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.subaru.ca/en/offers'],
  },
  {
    name: 'Volkswagen Canada',
    websiteUrl: 'https://www.vw.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.vw.ca/en/offers.html'],
  },
  {
    name: 'BMW Canada',
    websiteUrl: 'https://www.bmw.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.bmw.ca/en/offers.html'],
  },
  {
    name: 'Mercedes-Benz Canada',
    websiteUrl: 'https://www.mercedes-benz.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.mercedes-benz.ca/en/vehicles/offers.html'],
  },
  {
    name: 'Audi Canada',
    websiteUrl: 'https://www.audi.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.audi.ca/ca/web/en/offers.html'],
  },
  {
    name: 'Mitsubishi Canada',
    websiteUrl: 'https://www.mitsubishi-motors.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.mitsubishi-motors.ca/en/offers/'],
  },
  {
    name: 'Lexus Canada',
    websiteUrl: 'https://www.lexus.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.lexus.ca/lexus/en/offers'],
  },
  {
    name: 'Acura Canada',
    websiteUrl: 'https://www.acura.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.acura.ca/offers'],
  },
  {
    name: 'Midas Canada',
    websiteUrl: 'https://www.midas.ca',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.midas.ca/offers/', 'https://www.midas.ca/coupons/'],
  },
  {
    name: 'Fountain Tire',
    websiteUrl: 'https://www.fountaintire.com',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.fountaintire.com/promotions', 'https://www.fountaintire.com/rebates'],
  },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 14 more (16 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Indigo Books',
    websiteUrl: 'https://www.indigo.ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.indigo.ca/en-ca/sale/', 'https://www.indigo.ca/en-ca/books/deals/'],
  },
  {
    name: 'BMV Books',
    websiteUrl: 'https://www.bmvbooks.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.bmvbooks.com/categories/sale'],
  },
  {
    name: 'Chapters',
    websiteUrl: 'https://www.chapters.indigo.ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.chapters.indigo.ca/en-ca/sale/'],
  },
  {
    name: 'Nintendo Store CA',
    websiteUrl: 'https://www.nintendo.com/en-ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.nintendo.com/en-ca/store/deals/'],
  },
  {
    name: 'Xbox Store CA',
    websiteUrl: 'https://www.xbox.com/en-CA',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.xbox.com/en-CA/games/deals'],
  },
  {
    name: 'Epic Games CA',
    websiteUrl: 'https://store.epicgames.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://store.epicgames.com/en-US/free-games', 'https://store.epicgames.com/en-US/browse?sortBy=currentPrice&sortDir=ASC'],
  },
  {
    name: 'Lego Canada',
    websiteUrl: 'https://www.lego.com/en-ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.lego.com/en-ca/categories/sales-and-deals', 'https://www.lego.com/en-ca/categories/last-chance-to-buy'],
  },
  {
    name: 'Board Game Bliss',
    websiteUrl: 'https://www.boardgamebliss.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.boardgamebliss.com/collections/sale', 'https://www.boardgamebliss.com/collections/clearance'],
  },
  {
    name: 'Dollar Tree Canada',
    websiteUrl: 'https://www.dollartree.ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.dollartree.ca/collections/toys-games'],
  },
  {
    name: 'Walmart Toys CA',
    websiteUrl: 'https://www.walmart.ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.walmart.ca/browse/toys/10020', 'https://www.walmart.ca/browse/toys/clearance-toys/10020-20008'],
  },
  {
    name: 'Audible Canada',
    websiteUrl: 'https://www.audible.ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.audible.ca/ep/2for1', 'https://www.audible.ca/ep/special-offers'],
  },
  {
    name: 'Toys R Us Canada',
    websiteUrl: 'https://www.toysrus.ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.toysrus.ca/collections/deals', 'https://www.toysrus.ca/collections/clearance'],
  },
  {
    name: 'Spin Master',
    websiteUrl: 'https://www.spinmaster.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.spinmaster.com/en-CA/shop/deals'],
  },
  {
    name: 'Staples Craft CA',
    websiteUrl: 'https://www.staples.ca',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.staples.ca/collections/arts-crafts-deals-370'],
  },

  // ═══════════════════════════════════════════════════════
  // BONUS: Telecom & Services (alisveris) — 20 more
  // Major Canadian telecoms, services, and additional retailers
  // ═══════════════════════════════════════════════════════
  {
    name: 'Rogers',
    websiteUrl: 'https://www.rogers.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.rogers.com/plans/wireless/offers', 'https://www.rogers.com/plans/internet/offers'],
  },
  {
    name: 'Bell Canada',
    websiteUrl: 'https://www.bell.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.bell.ca/Promotions', 'https://www.bell.ca/Mobility/Promotions'],
  },
  {
    name: 'Telus',
    websiteUrl: 'https://www.telus.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.telus.com/en/deals', 'https://www.telus.com/en/mobility/offers'],
  },
  {
    name: 'Fido',
    websiteUrl: 'https://www.fido.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.fido.ca/promotions', 'https://www.fido.ca/phones/offers'],
  },
  {
    name: 'Koodo',
    websiteUrl: 'https://www.koodomobile.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.koodomobile.com/en/rate-plans', 'https://www.koodomobile.com/en/promotions'],
  },
  {
    name: 'Virgin Plus',
    websiteUrl: 'https://www.virginplus.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.virginplus.ca/en/offers/', 'https://www.virginplus.ca/en/deals/'],
  },
  {
    name: 'Freedom Mobile',
    websiteUrl: 'https://www.freedommobile.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.freedommobile.ca/en-CA/promotions', 'https://www.freedommobile.ca/en-CA/deals'],
  },
  {
    name: 'Shaw',
    websiteUrl: 'https://www.shaw.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.shaw.ca/internet/offers', 'https://www.shaw.ca/tv/offers'],
  },
  {
    name: 'SaskTel',
    websiteUrl: 'https://www.sasktel.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.sasktel.com/store/shop/promotions'],
  },
  {
    name: 'Videotron',
    websiteUrl: 'https://www.videotron.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.videotron.com/en/promotions'],
  },
  {
    name: 'Dollarama Plus',
    websiteUrl: 'https://www.dollarama.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.dollarama.com/en-CA/products/seasonal'],
  },
  {
    name: 'Party City Canada',
    websiteUrl: 'https://www.partycity.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.partycity.ca/collections/sale', 'https://www.partycity.ca/collections/clearance'],
  },
  {
    name: 'Costco Online CA',
    websiteUrl: 'https://www.costco.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.costco.ca/online-offers.html'],
  },
  {
    name: 'Cabelz',
    websiteUrl: 'https://cabelz.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://cabelz.ca/collections/deals'],
  },
  {
    name: 'PetSmart Canada',
    websiteUrl: 'https://www.petsmart.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.petsmart.ca/sale/', 'https://www.petsmart.ca/featured-shops/deals/'],
  },
  {
    name: 'Pet Valu',
    websiteUrl: 'https://www.petvalu.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.petvalu.ca/promotions', 'https://www.petvalu.ca/deals'],
  },
  {
    name: 'Reno-Depot',
    websiteUrl: 'https://www.renodepot.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.renodepot.com/en/promotions', 'https://www.renodepot.com/en/clearance'],
  },
  {
    name: 'Build.com Canada',
    websiteUrl: 'https://www.build.com',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.build.com/sale'],
  },
  {
    name: 'iRobot Canada',
    websiteUrl: 'https://www.irobot.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.irobot.ca/en_CA/deals.html', 'https://www.irobot.ca/en_CA/offers.html'],
  },
  {
    name: 'Sport Check',
    websiteUrl: 'https://www.sportchek.ca',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.sportchek.ca/sale.html', 'https://www.sportchek.ca/clearance.html'],
  },
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
  console.log('=== CA Brand Seeding Script (EXTRA) ===\n');
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
