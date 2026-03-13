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

const CATEGORY_NAME_EN: Record<string, string> = {
  'alisveris': 'Shopping',
  'elektronik': 'Electronics',
  'giyim-moda': 'Clothing & Fashion',
  'ev-yasam': 'Home & Living',
  'gida-market': 'Grocery & Market',
  'yeme-icme': 'Food & Dining',
  'kozmetik-kisisel-bakim': 'Beauty & Personal Care',
  'spor-outdoor': 'Sports & Outdoor',
  'seyahat-ulasim': 'Travel & Transport',
  'finans': 'Finance',
  'sigorta': 'Insurance',
  'otomobil': 'Automotive',
  'kitap-hobi': 'Books & Hobbies',
};

// ── EXTRA EG BRANDS (100 new brands) ─────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Alisveris / Shopping — 12 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Cairo Sales', websiteUrl: 'https://cairosales.com', categorySlug: 'alisveris', seedUrls: ['https://cairosales.com/en/'] },
  { name: 'Cairo Cart', websiteUrl: 'https://cairocart.com', categorySlug: 'alisveris', seedUrls: ['https://cairocart.com/en/'] },
  { name: 'Sharaf DG Egypt', websiteUrl: 'https://egypt.sharafdg.com', categorySlug: 'alisveris', seedUrls: ['https://egypt.sharafdg.com/catalogue-offers/'] },
  { name: 'Dstore Egypt', websiteUrl: 'https://dstoreegypt.com', categorySlug: 'alisveris', seedUrls: ['https://dstoreegypt.com/'] },
  { name: '6th Street Egypt', websiteUrl: 'https://www.6thstreet.com', categorySlug: 'alisveris', seedUrls: ['https://www.6thstreet.com/eg/en/sale/'] },
  { name: 'MITCHA', websiteUrl: 'https://www.mitcha.com', categorySlug: 'alisveris', seedUrls: ['https://www.mitcha.com/collections/women', 'https://www.mitcha.com/collections/collections'] },
  { name: 'Brantu Egypt', websiteUrl: 'https://brantu.com', categorySlug: 'alisveris', seedUrls: ['https://brantu.com/'] },
  { name: 'EGPrices', websiteUrl: 'https://www.egprices.com', categorySlug: 'alisveris', seedUrls: ['https://www.egprices.com/en/'] },
  { name: 'Kanbkam Egypt', websiteUrl: 'https://www.kanbkam.com', categorySlug: 'alisveris', seedUrls: ['https://www.kanbkam.com/eg/en/home'] },
  { name: 'WaffarX', websiteUrl: 'https://www.waffarx.com', categorySlug: 'alisveris', seedUrls: ['https://www.waffarx.com/en-eg'] },
  { name: 'Yajny Egypt', websiteUrl: 'https://yajny.com', categorySlug: 'alisveris', seedUrls: ['https://yajny.com/en-eg/'] },
  { name: 'City Centre Almaza', websiteUrl: 'https://www.citycentrealmaza.com', categorySlug: 'alisveris', seedUrls: ['https://www.citycentrealmaza.com/en/offers/'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 6 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tradeline Stores', websiteUrl: 'https://www.tradelinestores.com', categorySlug: 'elektronik', seedUrls: ['https://www.tradelinestores.com/'] },
  { name: 'Egypt Laptop', websiteUrl: 'https://egyptlaptop.com', categorySlug: 'elektronik', seedUrls: ['https://egyptlaptop.com/offers/laptops'] },
  // iStore Egypt already in original seed
  { name: 'HANS Egypt', websiteUrl: 'https://hansegypt.com', categorySlug: 'elektronik', seedUrls: ['https://hansegypt.com/collections/discounted-products'] },
  { name: 'Air Group Egypt', websiteUrl: 'https://airgroupegypt.com', categorySlug: 'elektronik', seedUrls: ['https://airgroupegypt.com/en/'] },
  { name: 'Home Egypt', websiteUrl: 'https://homeegypt.net', categorySlug: 'elektronik', seedUrls: ['http://homeegypt.net/'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Parfois Egypt', websiteUrl: 'https://www.parfoisegypt.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.parfoisegypt.com/en/deals'] },
  { name: 'Sportive Go', websiteUrl: 'https://www.sportivego.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sportivego.com/'] },
  { name: 'Shell Egypt Shoes', websiteUrl: 'https://www.shellegypt.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.shellegypt.com/'] },
  { name: 'Sports Shop Egypt', websiteUrl: 'https://www.sportsshopegypt.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sportsshopegypt.com/'] },
  { name: 'WayUp Sports', websiteUrl: 'https://wayupsports.com', categorySlug: 'giyim-moda', seedUrls: ['https://wayupsports.com/'] },
  { name: 'Footcourt Egypt', websiteUrl: 'https://www.footcourt-eg.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.footcourt-eg.com/'] },
  { name: 'Malaabes', websiteUrl: 'https://malaabes.com', categorySlug: 'giyim-moda', seedUrls: ['https://malaabes.com/'] },
  { name: 'Opio Egypt', websiteUrl: 'https://www.opioshop.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.opioshop.com/'] },
  { name: 'Punto Roma Egypt', websiteUrl: 'https://www.puntroma.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.puntroma.com/'] },
  { name: 'New Yorker EG', websiteUrl: 'https://www.newyorker.de', categorySlug: 'giyim-moda', seedUrls: ['https://www.newyorker.de/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yasam / Home & Living — 8 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Ariika', websiteUrl: 'https://ariika.com', categorySlug: 'ev-yasam', seedUrls: ['https://ariika.com/'] },
  { name: 'Manzzeli', websiteUrl: 'https://manzzeli.com', categorySlug: 'ev-yasam', seedUrls: ['https://manzzeli.com/'] },
  { name: 'HUB Furniture', websiteUrl: 'https://hubfurniture.com.eg', categorySlug: 'ev-yasam', seedUrls: ['https://hubfurniture.com.eg/'] },
  { name: 'Wasilaah', websiteUrl: 'https://www.wasilaah.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.wasilaah.com/'] },
  { name: 'Ras Home Egypt', websiteUrl: 'https://rashome.com', categorySlug: 'ev-yasam', seedUrls: ['https://rashome.com/'] },
  { name: 'Duravit EG', websiteUrl: 'https://www.duravit.eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.duravit.eg/'] },
  { name: 'Mahgoub Egypt', websiteUrl: 'https://www.mahgoub.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.mahgoub.com/'] },
  // Roca Egypt already in original seed

  // ═══════════════════════════════════════════════════════
  // 5) Gida & Market / Grocery & Market — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Gomla Market', websiteUrl: 'https://gomlamarket.com', categorySlug: 'gida-market', seedUrls: ['https://gomlamarket.com/'] },
  { name: 'Seoudi Market EG', websiteUrl: 'https://www.seoudimarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.seoudimarket.com/'] },
  { name: 'Zahran Market EG', websiteUrl: 'https://www.zahranmarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.zahranmarket.com/'] },
  { name: 'Sunny Market EG', websiteUrl: 'https://sunnymarket.com', categorySlug: 'gida-market', seedUrls: ['https://sunnymarket.com/'] },
  // Ghallab Market already in original seed
  { name: 'Tsawq Egypt', websiteUrl: 'https://www.tsawq.net', categorySlug: 'gida-market', seedUrls: ['https://www.tsawq.net/eg/en/latest'] },
  { name: 'FilOffer Egypt', websiteUrl: 'https://www.filloffer.com', categorySlug: 'gida-market', seedUrls: ['https://www.filloffer.com/magazines'] },
  { name: 'ClicFlyer Egypt', websiteUrl: 'https://clicflyer.com', categorySlug: 'gida-market', seedUrls: ['https://clicflyer.com/shoppers/en/egypt/cairo/home'] },
  { name: 'D4D Egypt', websiteUrl: 'https://d4donline.com', categorySlug: 'gida-market', seedUrls: ['https://d4donline.com/en/egypt/cairo/1/supermarket-offer-cairo-egypt'] },
  { name: 'iLoFo Egypt', websiteUrl: 'https://eg.ilofo.com', categorySlug: 'gida-market', seedUrls: ['https://eg.ilofo.com/en'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & Icme / Food & Dining — 8 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Elmenus Egypt', websiteUrl: 'https://www.elmenus.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.elmenus.com/cairo/delivery/offers'] },
  { name: 'Talabat Egypt', websiteUrl: 'https://www.talabat.com/egypt', categorySlug: 'yeme-icme', seedUrls: ['https://www.talabat.com/egypt/offers'] },
  { name: 'Breadfast EG', websiteUrl: 'https://www.breadfast.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.breadfast.com/'] },
  { name: 'Koshary Abou Tarek', websiteUrl: 'https://www.aboutarek.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.aboutarek.com/'] },
  { name: 'Gad Restaurants EG', websiteUrl: 'https://www.gad.com.eg', categorySlug: 'yeme-icme', seedUrls: ['https://www.gad.com.eg/'] },
  { name: 'Zooba Egypt', websiteUrl: 'https://www.zooba.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.zooba.com/'] },
  { name: 'Eish & Malh EG', websiteUrl: 'https://www.eishwmalh.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.eishwmalh.com/'] },
  { name: 'Nola Cupcakes EG', websiteUrl: 'https://www.nolacupcakes.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.nolacupcakes.com/'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kisisel Bakim / Beauty & Personal Care — 8 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Feel22 Egypt', websiteUrl: 'https://eg.feel22.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://eg.feel22.com/'] },
  { name: 'Ramfa Beauty', websiteUrl: 'https://ramfabeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://ramfabeauty.com/collections/makeup'] },
  { name: 'Gomyz Egypt', websiteUrl: 'https://gomyz.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://gomyz.com/egypt-en/'] },
  { name: 'Tdawi Egypt', websiteUrl: 'https://tdawi.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://tdawi.com/'] },
  { name: 'Roshdy Pharmacies', websiteUrl: 'https://roshdypharmacies.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://roshdypharmacies.com/'] },
  { name: 'Yodawy', websiteUrl: 'https://www.yodawy.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yodawy.com/'] },
  { name: 'Care Pharmacies', websiteUrl: 'https://care-pharmacies.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://care-pharmacies.com/'] },
  { name: 'PetsEgypt', websiteUrl: 'https://petsegypt.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://petsegypt.com/'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor — 5 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Wadi Degla Clubs', websiteUrl: 'https://www.wadideglaclubs.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wadideglaclubs.com/'] },
  { name: 'Anytime Fitness EG', websiteUrl: 'https://www.anytimefitness.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.anytimefitness.com/'] },
  { name: 'Cairo Gyms', websiteUrl: 'https://cairogyms.com', categorySlug: 'spor-outdoor', seedUrls: ['https://cairogyms.com/'] },
  { name: 'Sun & Sand Sports EG', websiteUrl: 'https://www.sssports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sssports.com/eg/en/sale/'] },
  { name: 'Go Sport EG', websiteUrl: 'https://www.sportivego.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportivego.com/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulasim / Travel & Transport — 8 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Flyin Egypt', websiteUrl: 'https://eg.flyin.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://eg.flyin.com/?lng=en'] },
  { name: 'Wego EG', websiteUrl: 'https://eg.wego.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://eg.wego.com/en/flights', 'https://eg.wego.com/en'] },
  { name: 'InDrive EG', websiteUrl: 'https://indrive.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://indrive.com/'] },
  { name: 'Nawy', websiteUrl: 'https://www.nawy.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nawy.com/real-estate-offers', 'https://www.nawy.com/new-launches'] },
  { name: 'Aqarmap', websiteUrl: 'https://aqarmap.com.eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://aqarmap.com.eg/en/'] },
  { name: 'Property Finder EG', websiteUrl: 'https://www.propertyfinder.eg', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.propertyfinder.eg/en/'] },
  { name: 'Hatla2ee EG', websiteUrl: 'https://www.hatla2ee.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hatla2ee.com/en/'] },
  { name: 'ContactCars EG', websiteUrl: 'https://www.contactcars.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.contactcars.com/en/'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance — 8 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Vodafone Cash EG', websiteUrl: 'https://web.vodafone.com.eg', categorySlug: 'finans', seedUrls: ['https://web.vodafone.com.eg/en/promotions'] },
  { name: 'Orange Money EG', websiteUrl: 'https://www.orange.eg', categorySlug: 'finans', seedUrls: ['https://www.orange.eg/en/'] },
  { name: 'Etisalat Cash EG', websiteUrl: 'https://www.etisalat.eg', categorySlug: 'finans', seedUrls: ['https://www.etisalat.eg/'] },
  { name: 'Souhoola EG', websiteUrl: 'https://souhoola.com', categorySlug: 'finans', seedUrls: ['https://souhoola.com/'] },
  { name: 'MNT-Halan EG', websiteUrl: 'https://www.halan.com', categorySlug: 'finans', seedUrls: ['https://www.halan.com/'] },
  { name: 'PayMob EG', websiteUrl: 'https://www.paymob.com', categorySlug: 'finans', seedUrls: ['https://www.paymob.com/'] },
  { name: 'Contact Financial EG', websiteUrl: 'https://www.contact.eg', categorySlug: 'finans', seedUrls: ['https://www.contact.eg/'] },
  { name: 'Khazna EG', websiteUrl: 'https://www.khazna.app', categorySlug: 'finans', seedUrls: ['https://www.khazna.app/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 3 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amanleek', websiteUrl: 'https://amanleek.com', categorySlug: 'sigorta', seedUrls: ['https://amanleek.com/en/'] },
  { name: 'Wisely Insure', websiteUrl: 'https://wiselyinsure.com', categorySlug: 'sigorta', seedUrls: ['https://wiselyinsure.com/'] },
  { name: 'Medmark Egypt', websiteUrl: 'https://medmark.eg', categorySlug: 'sigorta', seedUrls: ['https://medmark.eg/'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 4 brands
  // ═══════════════════════════════════════════════════════
  { name: 'AutoTager EG', websiteUrl: 'https://www.autotager.com', categorySlug: 'otomobil', seedUrls: ['https://www.autotager.com/'] },
  { name: 'Al-Mansour Automotive', websiteUrl: 'https://www.almansour.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.almansour.com.eg/mansour-services', 'https://www.almansour.com.eg/brands'] },
  { name: 'Dubizzle Motors EG', websiteUrl: 'https://www.dubizzle.com.eg', categorySlug: 'otomobil', seedUrls: ['https://www.dubizzle.com.eg/en/vehicles/'] },
  { name: 'ElMekaniki EG', websiteUrl: 'https://www.elmekaniki.com', categorySlug: 'otomobil', seedUrls: ['https://www.elmekaniki.com/'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 6 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Diwanegypt', websiteUrl: 'https://diwanegypt.com', categorySlug: 'kitap-hobi', seedUrls: ['https://diwanegypt.com/'] },
  { name: 'Anghami Egypt', websiteUrl: 'https://www.anghami.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.anghami.com/plus'] },
  { name: 'WATCH IT', websiteUrl: 'https://www.watchit.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.watchit.com/'] },
  { name: 'OSN Egypt', websiteUrl: 'https://www.osn.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.osn.com/en-eg/home'] },
  { name: 'Shahid Egypt', websiteUrl: 'https://shahid.mbc.net', categorySlug: 'kitap-hobi', seedUrls: ['https://shahid.mbc.net/en/hub/promo'] },
  { name: 'Floward Egypt', websiteUrl: 'https://floward.com', categorySlug: 'kitap-hobi', seedUrls: ['https://floward.com/en-eg/cairo/'] },

  // ═══════════════════════════════════════════════════════
  // 14) Telecom / Shopping (telecom as alisveris) — 4 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Vodafone Egypt Offers', websiteUrl: 'https://web.vodafone.com.eg', categorySlug: 'alisveris', seedUrls: ['https://web.vodafone.com.eg/en/promotions', 'https://web.vodafone.com.eg/en/flexaweya-discounts'] },
  { name: 'Orange Egypt Offers', websiteUrl: 'https://www.orange.eg', categorySlug: 'alisveris', seedUrls: ['https://www.orange.eg/en/', 'https://shop.orange.eg/en/'] },
  { name: 'Etisalat EG Offers', websiteUrl: 'https://www.etisalat.eg', categorySlug: 'alisveris', seedUrls: ['https://www.etisalat.eg/etisalat/portal/roam_international_promotion_en'] },
  { name: 'WE Egypt Offers', websiteUrl: 'https://te.eg', categorySlug: 'alisveris', seedUrls: ['https://te.eg/wps/portal/te/personal'] },

  // ═══════════════════════════════════════════════════════
  // 15) Additional verified brands — 13 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Carrefour Deals EG', websiteUrl: 'https://www.carrefouregypt.com', categorySlug: 'gida-market', seedUrls: ['https://www.carrefouregypt.com/mafegy/en/n/c/clp_carrefour-deals', 'https://www.carrefouregypt.com/mafegy/en/n/c/clp_carrefour-ramadan-offers'] },
  { name: 'Spinneys Offers EG', websiteUrl: 'https://www.spinneys-egypt.com', categorySlug: 'gida-market', seedUrls: ['https://spinneys-egypt.com/en/categories/hot-offers', 'https://www.spinneys-egypt.com/en-us/spinneys/promotions/promotions'] },
  { name: 'Noon Hot Deals EG', websiteUrl: 'https://www.noon.com', categorySlug: 'alisveris', seedUrls: ['https://www.noon.com/egypt-en/hot-deals-eg/', 'https://www.noon.com/egypt-en/coupon/'] },
  { name: 'Amazon EG Deals', websiteUrl: 'https://www.amazon.eg', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.eg/-/en/gp/goldbox', 'https://www.amazon.eg/-/en/primeday'] },
  { name: 'Jumia Deals EG', websiteUrl: 'https://www.jumia.com.eg', categorySlug: 'alisveris', seedUrls: ['https://www.jumia.com.eg/sp-jumia-discount/', 'https://www.jumia.com.eg/mlp-official-stores/'] },
  { name: 'Samsung EG Offers', websiteUrl: 'https://www.samsung.com/eg', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/eg/offer/', 'https://shop.samsung.com/eg_en/Products/Refrigerator-Promotion/c/EG_DA_Sale'] },
  { name: 'LG EG Offers', websiteUrl: 'https://www.lg.com/eg_en', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/eg_en/offers/'] },
  { name: 'IKEA EG Offers', websiteUrl: 'https://www.ikea.com/eg', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/eg/en/offers/', 'https://www.ikea.com/eg/en/offers/limited-time-offers/', 'https://www.ikea.com/eg/en/campaigns/'] },
  { name: 'Adidas EG Sale', websiteUrl: 'https://www.adidas.com.eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.com.eg/en/sale'] },
  { name: 'Zara EG Sale', websiteUrl: 'https://www.zara.com/eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/eg/en/woman-special-prices-l1314.html'] },
  { name: 'DeFacto EG Sale', websiteUrl: 'https://www.defacto.com.eg', categorySlug: 'giyim-moda', seedUrls: ['https://www.defacto.com.eg/en-eg/special-offer', 'https://www.defacto.com.eg/en-eg/sale-collection', 'https://www.defacto.com.eg/en-eg/big-sale'] },
  { name: 'B.TECH Offers EG', websiteUrl: 'https://btech.com', categorySlug: 'elektronik', seedUrls: ['https://btech.com/en/'] },
  { name: 'Elaraby Offers EG', websiteUrl: 'https://www.elarabygroup.com', categorySlug: 'elektronik', seedUrls: ['https://www.elarabygroup.com/en/offers-and-discounts', 'https://www.elarabygroup.com/en/offers-and-discounts/promotions'] },
];

// ── MAIN ──────────────────────────────────────────────────
async function main() {
  console.log(`\n🇪🇬 Seeding ${BRANDS.length} EXTRA EG brands …\n`);

  // 1. Ensure categories exist
  const catSlugs = [...new Set(BRANDS.map((b) => b.categorySlug))];
  for (const slug of catSlugs) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name: CATEGORY_NAME_EN[slug] ?? slug },
    });
  }
  console.log(`Categories OK: ${catSlugs.join(', ')}\n`);

  // 2. Deduplicate within the list
  const seen = new Set<string>();
  const uniqueBrands = BRANDS.filter((b) => {
    const slug = toSlug(b.name);
    if (seen.has(slug)) {
      console.log(`  SKIP duplicate in list: ${b.name} (${slug})`);
      return false;
    }
    seen.add(slug);
    return true;
  });

  // 3. Upsert brands + crawl sources
  let brandsOk = 0;
  let sourcesCreated = 0;
  let sourcesUpdated = 0;
  let errors = 0;

  for (const entry of uniqueBrands) {
    const slug = toSlug(entry.name);
    try {
      // Upsert brand
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'EG' } },
        update: { websiteUrl: entry.websiteUrl },
        create: {
          name: entry.name,
          slug,
          market: 'EG',
          websiteUrl: entry.websiteUrl,
          isActive: true,
          category: { connect: { slug: entry.categorySlug } },
        },
      });

      // Upsert crawl source
      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, market: 'EG' },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            name: `${entry.name} EG`,
            crawlMethod: CrawlMethod.CAMPAIGN,
            seedUrls: entry.seedUrls,
            brandId: brand.id,
            market: 'EG',
            maxDepth: 2,
            schedule: '0 */8 * * *',
            agingDays: 7,
            isActive: true,
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'EG' },
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
  console.log(`Brands:           ${brandsOk} ok, ${errors} errors`);
  console.log(`New sources:      ${sourcesCreated}`);
  console.log(`Updated sources:  ${sourcesUpdated}`);

  const totalEGBrands = await prisma.brand.count({ where: { market: 'EG' } });
  const totalEGSources = await prisma.crawlSource.count({ where: { market: 'EG', isActive: true } });
  console.log(`Total EG brands:  ${totalEGBrands}`);
  console.log(`Total active EG sources: ${totalEGSources}`);
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
