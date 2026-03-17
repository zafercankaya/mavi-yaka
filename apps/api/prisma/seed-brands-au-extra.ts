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
  // 1) Shopping (alisveris) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Harris Scarfe', websiteUrl: 'https://www.harrisscarfe.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.harrisscarfe.com.au/sale', 'https://www.harrisscarfe.com.au/clearance'] },
  { name: 'Spotlight', websiteUrl: 'https://www.spotlightstores.com', categorySlug: 'alisveris', seedUrls: ['https://www.spotlightstores.com/sale'] },
  { name: 'Anaconda', websiteUrl: 'https://www.anacondastores.com', categorySlug: 'alisveris', seedUrls: ['https://www.anacondastores.com/sale', 'https://www.anacondastores.com/deals'] },
  { name: 'TK Maxx AU', websiteUrl: 'https://www.tkmaxx.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.tkmaxx.com.au/clearance'] },
  { name: 'Daiso AU', websiteUrl: 'https://www.daisoau.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.daisoau.com.au/collections/new-arrivals'] },
  { name: 'Cashrewards', websiteUrl: 'https://www.cashrewards.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.cashrewards.com.au/offers', 'https://www.cashrewards.com.au/hot-offers'] },
  { name: 'ShopBack AU', websiteUrl: 'https://www.shopback.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.shopback.com.au/deals', 'https://www.shopback.com.au/cashback-deals'] },
  { name: 'Lasoo', websiteUrl: 'https://www.lasoo.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.lasoo.com.au/deals/'] },
  { name: 'Coles Best Buys', websiteUrl: 'https://www.coles.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.coles.com.au/browse/best-buys'] },
  { name: 'Costco Online AU', websiteUrl: 'https://www.costco.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.costco.com.au/c/online-deals'] },
  { name: 'Deals Direct', websiteUrl: 'https://www.dealsdirect.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.dealsdirect.com.au/deals/'] },
  { name: 'My Deal', websiteUrl: 'https://www.mydeal.com.au', categorySlug: 'alisveris', seedUrls: ['https://www.mydeal.com.au/deals', 'https://www.mydeal.com.au/sale'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'JB Hi-Fi', websiteUrl: 'https://www.jbhifi.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.jbhifi.com.au/collections/sale', 'https://www.jbhifi.com.au/pages/top-deals'] },
  { name: 'Officeworks', websiteUrl: 'https://www.officeworks.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.officeworks.com.au/shop/officeworks/sale', 'https://www.officeworks.com.au/shop/officeworks/deals'] },
  { name: 'Centre Com', websiteUrl: 'https://www.centrecom.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.centrecom.com.au/sale', 'https://www.centrecom.com.au/clearance'] },
  { name: 'MSY Technology', websiteUrl: 'https://www.msy.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.msy.com.au/promotions'] },
  { name: 'PLE Computers', websiteUrl: 'https://www.ple.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.ple.com.au/sale', 'https://www.ple.com.au/clearance'] },
  { name: 'Mwave', websiteUrl: 'https://www.mwave.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.mwave.com.au/deals', 'https://www.mwave.com.au/specials'] },
  { name: 'Umart', websiteUrl: 'https://www.umart.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.umart.com.au/sale'] },
  { name: 'TPG', websiteUrl: 'https://www.tpg.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.tpg.com.au/deals'] },
  { name: 'iiNet', websiteUrl: 'https://www.iinet.net.au', categorySlug: 'elektronik', seedUrls: ['https://www.iinet.net.au/internet/deals'] },
  { name: 'Belong', websiteUrl: 'https://www.belong.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.belong.com.au/deals'] },
  { name: 'Bing Lee', websiteUrl: 'https://www.binglee.com.au', categorySlug: 'elektronik', seedUrls: ['https://www.binglee.com.au/sale', 'https://www.binglee.com.au/deals'] },
  { name: 'Canon AU', websiteUrl: 'https://store.canon.com.au', categorySlug: 'elektronik', seedUrls: ['https://store.canon.com.au/promotions', 'https://store.canon.com.au/sale'] },

  // ═══════════════════════════════════════════════════════
  // 3) Clothing & Fashion (giyim-moda) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'General Pants', websiteUrl: 'https://www.generalpants.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.generalpants.com.au/sale'] },
  { name: 'Uniqlo AU', websiteUrl: 'https://www.uniqlo.com/au/en', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/au/en/spl/sale'] },
  { name: 'Trenery', websiteUrl: 'https://www.trenery.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.trenery.com.au/sale/'] },
  { name: 'Oxford', websiteUrl: 'https://www.oxford.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.oxford.com.au/sale'] },
  { name: 'Saba', websiteUrl: 'https://www.saba.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.saba.com.au/sale'] },
  { name: 'Alannah Hill', websiteUrl: 'https://www.alannahhill.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.alannahhill.com.au/sale'] },
  { name: 'Gorman', websiteUrl: 'https://www.gormanshop.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.gormanshop.com.au/sale'] },
  { name: 'Oroton', websiteUrl: 'https://www.oroton.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.oroton.com.au/sale', 'https://www.oroton.com.au/outlet'] },
  { name: 'Bec and Bridge', websiteUrl: 'https://www.becandbridge.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.becandbridge.com.au/collections/sale'] },
  { name: 'Decjuba', websiteUrl: 'https://www.decjuba.com.au', categorySlug: 'giyim-moda', seedUrls: ['https://www.decjuba.com.au/sale'] },
  { name: 'Camilla', websiteUrl: 'https://www.camilla.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.camilla.com/sale'] },
  { name: 'Morrison', websiteUrl: 'https://www.morrisonshop.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.morrisonshop.com/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Fantastic Furniture', websiteUrl: 'https://www.fantasticfurniture.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.fantasticfurniture.com.au/sale', 'https://www.fantasticfurniture.com.au/deals'] },
  { name: 'King Living', websiteUrl: 'https://www.kingliving.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.kingliving.com.au/sale'] },
  { name: 'Adairs', websiteUrl: 'https://www.adairs.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.adairs.com.au/sale/', 'https://www.adairs.com.au/clearance/'] },
  { name: 'Snooze', websiteUrl: 'https://www.snooze.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.snooze.com.au/pages/sale'] },
  { name: 'Koala', websiteUrl: 'https://koala.com', categorySlug: 'ev-yasam', seedUrls: ['https://koala.com/en-au/sale'] },
  { name: 'Plumbing Plus', websiteUrl: 'https://www.plumbingplus.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.plumbingplus.com.au/specials'] },
  { name: 'Sheridan', websiteUrl: 'https://www.sheridan.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.sheridan.com.au/sale'] },
  { name: 'The Reject Shop', websiteUrl: 'https://www.rejectshop.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.rejectshop.com.au/sale'] },
  { name: 'Oz Design Furniture', websiteUrl: 'https://www.ozdesignfurniture.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.ozdesignfurniture.com.au/sale'] },
  { name: 'Matt Blatt', websiteUrl: 'https://www.mattblatt.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.mattblatt.com.au/sale'] },
  { name: 'Koala Living', websiteUrl: 'https://www.koalaliving.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.koalaliving.com.au/sale'] },
  { name: 'Mitre 10', websiteUrl: 'https://www.mitre10.com.au', categorySlug: 'ev-yasam', seedUrls: ['https://www.mitre10.com.au/specials'] },

  // ═══════════════════════════════════════════════════════
  // 5) Grocery (gida-market) — 10 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Marley Spoon AU', websiteUrl: 'https://marleyspoon.com.au', categorySlug: 'gida-market', seedUrls: ['https://marleyspoon.com.au/our-plans'] },
  { name: 'Dinnerly AU', websiteUrl: 'https://dinnerly.com.au', categorySlug: 'gida-market', seedUrls: ['https://dinnerly.com.au/plans'] },
  { name: 'Wine Selectors', websiteUrl: 'https://www.wineselectors.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.wineselectors.com.au/shop/deals', 'https://www.wineselectors.com.au/shop/sale'] },
  { name: 'Naked Wines AU', websiteUrl: 'https://www.nakedwines.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.nakedwines.com.au/offers'] },
  { name: 'Vinomofo', websiteUrl: 'https://www.vinomofo.com', categorySlug: 'gida-market', seedUrls: ['https://www.vinomofo.com/deals'] },
  { name: 'Catch Grocery', websiteUrl: 'https://www.catch.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.catch.com.au/shop/grocery/'] },
  { name: 'SpudBAR', websiteUrl: 'https://www.spudbar.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.spudbar.com.au/deals'] },
  { name: 'The Drinks Collective', websiteUrl: 'https://thedrinkscollective.com.au', categorySlug: 'gida-market', seedUrls: ['https://thedrinkscollective.com.au/deals'] },
  { name: 'Cellarmasters', websiteUrl: 'https://www.cellarmasters.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.cellarmasters.com.au/deals', 'https://www.cellarmasters.com.au/specials'] },
  { name: 'Black Box Wines', websiteUrl: 'https://www.blackboxwines.com.au', categorySlug: 'gida-market', seedUrls: ['https://www.blackboxwines.com.au/deals'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Drink / Restaurants (yeme-icme) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Subway AU', websiteUrl: 'https://www.subway.com/en-AU', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/en-AU/promotions'] },
  { name: 'Boost Juice', websiteUrl: 'https://www.boostjuice.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.boostjuice.com.au/deals', 'https://www.boostjuice.com.au/promotions'] },
  { name: 'Red Rooster', websiteUrl: 'https://www.redrooster.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.redrooster.com.au/deals', 'https://www.redrooster.com.au/offers'] },
  { name: 'Oporto', websiteUrl: 'https://www.oporto.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.oporto.com.au/deals', 'https://www.oporto.com.au/offers'] },
  { name: 'Guzman y Gomez', websiteUrl: 'https://www.guzmanygomez.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.guzmanygomez.com.au/deals'] },
  { name: 'Starbucks AU', websiteUrl: 'https://www.starbucks.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.au/offers'] },
  { name: 'Mad Mex', websiteUrl: 'https://www.madmex.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.madmex.com.au/deals', 'https://www.madmex.com.au/offers'] },
  { name: 'Rashays', websiteUrl: 'https://www.rashays.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.rashays.com/promotions'] },
  { name: 'Schnitz', websiteUrl: 'https://www.schnitz.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.schnitz.com.au/deals'] },
  { name: 'Sushi Hub', websiteUrl: 'https://www.sushihub.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushihub.com.au/deals'] },
  { name: 'Zambrero', websiteUrl: 'https://www.zambrero.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.zambrero.com.au/deals'] },
  { name: 'Lone Star Rib House', websiteUrl: 'https://www.lonestarribhouse.com.au', categorySlug: 'yeme-icme', seedUrls: ['https://www.lonestarribhouse.com.au/deals'] },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty & Personal Care (kozmetik-kisisel-bakim) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Mecca', websiteUrl: 'https://www.mecca.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mecca.com.au/sale', 'https://www.mecca.com.au/offers'] },
  { name: 'Oz Hair and Beauty', websiteUrl: 'https://www.ozhairandbeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ozhairandbeauty.com/sale'] },
  { name: 'Estee Lauder AU', websiteUrl: 'https://www.esteelauder.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.au/offers'] },
  { name: 'MAC Cosmetics AU', websiteUrl: 'https://www.maccosmetics.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.au/offers'] },
  { name: 'Skinstitut', websiteUrl: 'https://www.skinstitut.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.skinstitut.com/sale'] },
  { name: 'Frank Body', websiteUrl: 'https://www.frankbody.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.frankbody.com/collections/sale'] },
  { name: 'Sukin', websiteUrl: 'https://sukinnaturals.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://sukinnaturals.com.au/collections/sale'] },
  { name: 'Natio', websiteUrl: 'https://www.natio.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.natio.com.au/sale'] },
  { name: 'Go-To Skincare', websiteUrl: 'https://www.gotoskincare.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.gotoskincare.com/offers'] },
  { name: 'Ultra Violette', websiteUrl: 'https://ultraviolette.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://ultraviolette.com.au/collections/sale'] },
  { name: 'MyChemist', websiteUrl: 'https://www.mychemist.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mychemist.com.au/shop-online/256/beauty', 'https://www.mychemist.com.au/sale'] },
  { name: 'Amcal', websiteUrl: 'https://www.amcal.com.au', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.amcal.com.au/sale'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'ASICS AU', websiteUrl: 'https://www.asics.com/au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/au/outlet/'] },
  { name: 'Under Armour AU', websiteUrl: 'https://www.underarmour.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.au/en-au/c/sale/'] },
  { name: 'Rip Curl', websiteUrl: 'https://www.ripcurl.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ripcurl.com.au/sale.html'] },
  { name: 'Billabong AU', websiteUrl: 'https://www.billabong.com/au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.billabong.com/au/sale/'] },
  { name: 'Roxy AU', websiteUrl: 'https://www.roxy.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.roxy.com.au/sale/'] },
  { name: '2XU', websiteUrl: 'https://www.2xu.com/au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.2xu.com/au/sale/'] },
  { name: 'Snowys', websiteUrl: 'https://www.snowys.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.snowys.com.au/sale', 'https://www.snowys.com.au/clearance'] },
  { name: 'Converse AU', websiteUrl: 'https://www.converse.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com.au/sale'] },
  { name: 'Platypus Shoes', websiteUrl: 'https://www.platypusshoes.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.platypusshoes.com.au/sale', 'https://www.platypusshoes.com.au/deals'] },
  { name: 'Decathlon AU', websiteUrl: 'https://www.decathlon.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.com.au/collections/sale'] },
  { name: 'Mountain Designs', websiteUrl: 'https://www.mountaindesigns.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mountaindesigns.com/sale/'] },
  { name: 'Reebok AU', websiteUrl: 'https://www.reebok.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com.au/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Virgin Australia', websiteUrl: 'https://www.virginaustralia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.virginaustralia.com/au/en/deals/', 'https://www.virginaustralia.com/au/en/offers/'] },
  { name: 'Rex Airlines', websiteUrl: 'https://www.rex.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rex.com.au/promotions/'] },
  { name: 'Bonza', websiteUrl: 'https://www.flybonza.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flybonza.com/deals'] },
  { name: 'Luxury Escapes AU', websiteUrl: 'https://luxuryescapes.com/au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://luxuryescapes.com/au'] },
  { name: 'Intrepid Travel AU', websiteUrl: 'https://www.intrepidtravel.com/au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.intrepidtravel.com/au/deals'] },
  { name: 'Stayz', websiteUrl: 'https://www.stayz.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.stayz.com.au/deals'] },
  { name: 'Thrifty AU', websiteUrl: 'https://www.thrifty.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thrifty.com.au/deals'] },
  { name: 'Europcar AU', websiteUrl: 'https://www.europcar.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.com.au/deals'] },
  { name: 'Hotels.com AU', websiteUrl: 'https://au.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://au.hotels.com/deals/'] },
  { name: 'Agoda AU', websiteUrl: 'https://www.agoda.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/deals'] },
  { name: 'Britz AU', websiteUrl: 'https://www.britz.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.britz.com.au/deals/', 'https://www.britz.com.au/specials/'] },
  { name: 'STA Travel AU', websiteUrl: 'https://www.statravel.com.au', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.statravel.com.au/deals.htm'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 12 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Macquarie Bank', websiteUrl: 'https://www.macquarie.com.au', categorySlug: 'finans', seedUrls: ['https://www.macquarie.com.au/personal/offers.html'] },
  { name: 'ING AU', websiteUrl: 'https://www.ing.com.au', categorySlug: 'finans', seedUrls: ['https://www.ing.com.au/savings/offers.html'] },
  { name: 'Bank of Queensland', websiteUrl: 'https://www.boq.com.au', categorySlug: 'finans', seedUrls: ['https://www.boq.com.au/personal/offers'] },
  { name: 'ME Bank', websiteUrl: 'https://www.mebank.com.au', categorySlug: 'finans', seedUrls: ['https://www.mebank.com.au/offers/'] },
  { name: 'St. George Bank', websiteUrl: 'https://www.stgeorge.com.au', categorySlug: 'finans', seedUrls: ['https://www.stgeorge.com.au/personal/offers'] },
  { name: 'Bank of Melbourne', websiteUrl: 'https://www.bankofmelbourne.com.au', categorySlug: 'finans', seedUrls: ['https://www.bankofmelbourne.com.au/personal/offers'] },
  { name: 'BankSA', websiteUrl: 'https://www.banksa.com.au', categorySlug: 'finans', seedUrls: ['https://www.banksa.com.au/personal/offers'] },
  { name: 'Zip Pay', websiteUrl: 'https://zip.co', categorySlug: 'finans', seedUrls: ['https://zip.co/au/deals'] },
  { name: 'Afterpay', websiteUrl: 'https://www.afterpay.com/en-AU', categorySlug: 'finans', seedUrls: ['https://www.afterpay.com/en-AU/deals'] },
  { name: 'AMP', websiteUrl: 'https://www.amp.com.au', categorySlug: 'finans', seedUrls: ['https://www.amp.com.au/personal/offers'] },
  { name: 'Australian Unity', websiteUrl: 'https://www.australianunity.com.au', categorySlug: 'finans', seedUrls: ['https://www.australianunity.com.au/banking/offers'] },
  { name: 'Canstar', websiteUrl: 'https://www.canstar.com.au', categorySlug: 'finans', seedUrls: ['https://www.canstar.com.au/promotions/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 10 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'AAMI', websiteUrl: 'https://www.aami.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.aami.com.au/offers.html'] },
  { name: 'NRMA Insurance', websiteUrl: 'https://www.nrma.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.nrma.com.au/offers'] },
  { name: 'GIO Insurance', websiteUrl: 'https://www.gio.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.gio.com.au/offers.html'] },
  { name: 'Budget Direct', websiteUrl: 'https://www.budgetdirect.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.budgetdirect.com.au/offers.html'] },
  { name: 'RACV', websiteUrl: 'https://www.racv.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.racv.com.au/offers.html', 'https://www.racv.com.au/membership/offers.html'] },
  { name: 'RACQ', websiteUrl: 'https://www.racq.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.racq.com.au/offers'] },
  { name: 'RAA', websiteUrl: 'https://www.raa.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.raa.com.au/offers'] },
  { name: 'RAC WA', websiteUrl: 'https://rac.com.au', categorySlug: 'sigorta', seedUrls: ['https://rac.com.au/offers'] },
  { name: 'Medibank', websiteUrl: 'https://www.medibank.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.medibank.com.au/health-insurance/offers/'] },
  { name: 'AHM', websiteUrl: 'https://www.ahm.com.au', categorySlug: 'sigorta', seedUrls: ['https://www.ahm.com.au/health-insurance/offers'] },

  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 10 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Subaru AU', websiteUrl: 'https://www.subaru.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.com.au/offers'] },
  { name: 'BMW AU', websiteUrl: 'https://www.bmw.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.au/en/offers.html'] },
  { name: 'Volkswagen AU', websiteUrl: 'https://www.volkswagen.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.com.au/en/offers.html'] },
  { name: 'Jeep AU', websiteUrl: 'https://www.jeep.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.com.au/offers.html'] },
  { name: 'Land Rover AU', websiteUrl: 'https://www.landrover.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.landrover.com.au/offers.html'] },
  { name: 'Lexus AU', websiteUrl: 'https://www.lexus.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.lexus.com.au/offers'] },
  { name: 'BYD AU', websiteUrl: 'https://www.bydauto.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.bydauto.com.au/offers'] },
  { name: 'Skoda AU', websiteUrl: 'https://www.skoda.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.com.au/offers'] },
  { name: 'Bridgestone AU', websiteUrl: 'https://www.bridgestonetyres.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestonetyres.com.au/promotions'] },
  { name: 'Beaurepaires', websiteUrl: 'https://www.beaurepaires.com.au', categorySlug: 'otomobil', seedUrls: ['https://www.beaurepaires.com.au/offers', 'https://www.beaurepaires.com.au/deals'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 10 extra brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toy World AU', websiteUrl: 'https://www.toyworld.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toyworld.com.au/sale'] },
  { name: 'QBD Books', websiteUrl: 'https://www.qbd.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.qbd.com.au/sale/'] },
  { name: 'Riot Art and Craft', websiteUrl: 'https://www.rioartandcraft.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.rioartandcraft.com.au/sale'] },
  { name: 'Toymate', websiteUrl: 'https://www.toymate.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toymate.com.au/sale', 'https://www.toymate.com.au/deals'] },
  { name: 'Kinokuniya AU', websiteUrl: 'https://www.kinokuniya.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kinokuniya.com.au/promotions/'] },
  { name: 'Amazon Kindle AU', websiteUrl: 'https://www.amazon.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.au/b?node=4919248051'] },
  { name: 'Hobbyking AU', websiteUrl: 'https://hobbyking.com', categorySlug: 'kitap-hobi', seedUrls: ['https://hobbyking.com/en_us/deals'] },
  { name: 'Readings', websiteUrl: 'https://www.readings.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.readings.com.au/sale'] },
  { name: 'JB Hi-Fi Games', websiteUrl: 'https://www.jbhifi.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.jbhifi.com.au/collections/games/sale'] },
  { name: 'Toys R Us AU', websiteUrl: 'https://www.toysrus.com.au', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.com.au/sale', 'https://www.toysrus.com.au/deals'] },
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
  console.log('=== AU Extra Brand Seeding Script ===\n');
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
