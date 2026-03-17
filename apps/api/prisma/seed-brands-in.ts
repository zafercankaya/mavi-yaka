import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── Slug generator ──────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Brand entry type ──────────────────────────────────────
interface BrandEntry {
  name: string;
  websiteUrl: string;
  categorySlug: string;
  seedUrls: string[];
}

// ── Category English name mapping ─────────────────────────
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

// ── ALL IN BRANDS DATA ───────────────────────────────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Flipkart', websiteUrl: 'https://www.flipkart.com', categorySlug: 'alisveris', seedUrls: ['https://www.flipkart.com/offers-store'] },
  { name: 'Amazon India', websiteUrl: 'https://www.amazon.in', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.in/deals', 'https://www.amazon.in/gp/goldbox'] },
  { name: 'Myntra', websiteUrl: 'https://www.myntra.com', categorySlug: 'alisveris', seedUrls: ['https://www.myntra.com/sale'] },
  { name: 'Snapdeal', websiteUrl: 'https://www.snapdeal.com', categorySlug: 'alisveris', seedUrls: ['https://www.snapdeal.com/offers'] },
  { name: 'Tata CLiQ', websiteUrl: 'https://www.tatacliq.com', categorySlug: 'alisveris', seedUrls: ['https://www.tatacliq.com/offers-deals'] },
  { name: 'JioMart', websiteUrl: 'https://www.jiomart.com', categorySlug: 'alisveris', seedUrls: ['https://www.jiomart.com/all-offers'] },
  { name: 'Paytm Mall', websiteUrl: 'https://paytmmall.com', categorySlug: 'alisveris', seedUrls: ['https://paytmmall.com/offers'] },
  { name: 'Ajio', websiteUrl: 'https://www.ajio.com', categorySlug: 'alisveris', seedUrls: ['https://www.ajio.com/sale'] },
  { name: 'Nykaa', websiteUrl: 'https://www.nykaa.com', categorySlug: 'alisveris', seedUrls: ['https://www.nykaa.com/offers'] },
  { name: 'Meesho', websiteUrl: 'https://www.meesho.com', categorySlug: 'alisveris', seedUrls: ['https://www.meesho.com/deals'] },
  { name: 'ShopClues', websiteUrl: 'https://www.shopclues.com', categorySlug: 'alisveris', seedUrls: ['https://www.shopclues.com/deals.html'] },
  { name: 'IndiaMART', websiteUrl: 'https://www.indiamart.com', categorySlug: 'alisveris', seedUrls: ['https://www.indiamart.com/offers/'] },
  { name: 'BigBasket', websiteUrl: 'https://www.bigbasket.com', categorySlug: 'alisveris', seedUrls: ['https://www.bigbasket.com/cl/offers/'] },
  { name: 'Croma', websiteUrl: 'https://www.croma.com', categorySlug: 'alisveris', seedUrls: ['https://www.croma.com/offers'] },
  { name: 'Reliance Digital', websiteUrl: 'https://www.reliancedigital.in', categorySlug: 'alisveris', seedUrls: ['https://www.reliancedigital.in/offers'] },
  { name: 'Vijay Sales', websiteUrl: 'https://www.vijaysales.com', categorySlug: 'alisveris', seedUrls: ['https://www.vijaysales.com/offers'] },
  { name: 'DMart Ready', websiteUrl: 'https://www.dmart.in', categorySlug: 'alisveris', seedUrls: ['https://www.dmart.in/'] },
  { name: 'FirstCry', websiteUrl: 'https://www.firstcry.com', categorySlug: 'alisveris', seedUrls: ['https://www.firstcry.com/sale'] },
  { name: 'LimeRoad', websiteUrl: 'https://www.limeroad.com', categorySlug: 'alisveris', seedUrls: ['https://www.limeroad.com/sale'] },
  { name: 'Bewakoof', websiteUrl: 'https://www.bewakoof.com', categorySlug: 'alisveris', seedUrls: ['https://www.bewakoof.com/offers'] },
  { name: 'Pepperfry', websiteUrl: 'https://www.pepperfry.com', categorySlug: 'alisveris', seedUrls: ['https://www.pepperfry.com/sale.html'] },
  { name: 'Urban Ladder', websiteUrl: 'https://www.urbanladder.com', categorySlug: 'alisveris', seedUrls: ['https://www.urbanladder.com/sale'] },
  { name: 'HomeShop18', websiteUrl: 'https://www.homeshop18.com', categorySlug: 'alisveris', seedUrls: ['https://www.homeshop18.com/offers'] },
  { name: 'Club Factory', websiteUrl: 'https://www.clubfactory.com', categorySlug: 'alisveris', seedUrls: ['https://www.clubfactory.com/deals'] },
  { name: 'TataCliq Luxury', websiteUrl: 'https://luxury.tatacliq.com', categorySlug: 'alisveris', seedUrls: ['https://luxury.tatacliq.com/offers-deals'] },
  { name: '1mg', websiteUrl: 'https://www.1mg.com', categorySlug: 'alisveris', seedUrls: ['https://www.1mg.com/offers'] },
  { name: 'PharmEasy', websiteUrl: 'https://pharmeasy.in', categorySlug: 'alisveris', seedUrls: ['https://pharmeasy.in/offers'] },
  { name: 'Lenskart', websiteUrl: 'https://www.lenskart.com', categorySlug: 'alisveris', seedUrls: ['https://www.lenskart.com/offers'] },
  { name: 'CaratLane', websiteUrl: 'https://www.caratlane.com', categorySlug: 'alisveris', seedUrls: ['https://www.caratlane.com/offers.html'] },
  { name: 'Tanishq', websiteUrl: 'https://www.tanishq.co.in', categorySlug: 'alisveris', seedUrls: ['https://www.tanishq.co.in/offers'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Croma Electronics', websiteUrl: 'https://www.croma.com', categorySlug: 'elektronik', seedUrls: ['https://www.croma.com/offers'] },
  { name: 'Reliance Digital Electronics', websiteUrl: 'https://www.reliancedigital.in', categorySlug: 'elektronik', seedUrls: ['https://www.reliancedigital.in/offers'] },
  { name: 'Vijay Sales Electronics', websiteUrl: 'https://www.vijaysales.com', categorySlug: 'elektronik', seedUrls: ['https://www.vijaysales.com/offers'] },
  { name: 'Samsung India', websiteUrl: 'https://www.samsung.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/in/offer/'] },
  { name: 'Apple India', websiteUrl: 'https://www.apple.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/in/shop/go/product/refurbished'] },
  { name: 'OnePlus India', websiteUrl: 'https://www.oneplus.in', categorySlug: 'elektronik', seedUrls: ['https://www.oneplus.in/offers'] },
  { name: 'Xiaomi India', websiteUrl: 'https://www.mi.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/in/sale'] },
  { name: 'Realme India', websiteUrl: 'https://www.realme.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/in/deals'] },
  { name: 'Oppo India', websiteUrl: 'https://www.oppo.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/in/offers/'] },
  { name: 'Vivo India', websiteUrl: 'https://www.vivo.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com/in/offers'] },
  { name: 'LG India', websiteUrl: 'https://www.lg.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/in/promotions/'] },
  { name: 'Sony India', websiteUrl: 'https://www.sony.co.in', categorySlug: 'elektronik', seedUrls: ['https://www.sony.co.in/section/offers'] },
  { name: 'Panasonic India', websiteUrl: 'https://www.panasonic.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/in/promotions.html'] },
  { name: 'HP India', websiteUrl: 'https://www.hp.com/in-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/in-en/shop/offers'] },
  { name: 'Dell India', websiteUrl: 'https://www.dell.com/en-in', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-in/shop/deals'] },
  { name: 'Lenovo India', websiteUrl: 'https://www.lenovo.com/in/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/in/en/deals/'] },
  { name: 'Asus India', websiteUrl: 'https://www.asus.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/in/campaign/sale/'] },
  { name: 'Acer India', websiteUrl: 'https://store.acer.com/en-in', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/en-in/sale'] },
  { name: 'boAt', websiteUrl: 'https://www.boat-lifestyle.com', categorySlug: 'elektronik', seedUrls: ['https://www.boat-lifestyle.com/collections/deals'] },
  { name: 'JBL India', websiteUrl: 'https://in.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://in.jbl.com/sale/'] },
  { name: 'Bose India', websiteUrl: 'https://www.bose.in', categorySlug: 'elektronik', seedUrls: ['https://www.bose.in/deals'] },
  { name: 'Whirlpool India', websiteUrl: 'https://www.whirlpoolindia.com', categorySlug: 'elektronik', seedUrls: ['https://www.whirlpoolindia.com/offers'] },
  { name: 'Godrej Appliances', websiteUrl: 'https://www.godrejappliances.com', categorySlug: 'elektronik', seedUrls: ['https://www.godrejappliances.com/offers'] },
  { name: 'Havells', websiteUrl: 'https://www.havells.com', categorySlug: 'elektronik', seedUrls: ['https://www.havells.com/en/offers.html'] },
  { name: 'Bajaj Electricals', websiteUrl: 'https://www.bajajelectricals.com', categorySlug: 'elektronik', seedUrls: ['https://www.bajajelectricals.com/offers/'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Myntra Fashion', websiteUrl: 'https://www.myntra.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.myntra.com/sale'] },
  { name: 'Ajio Fashion', websiteUrl: 'https://www.ajio.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.ajio.com/sale'] },
  { name: 'Nykaa Fashion', websiteUrl: 'https://www.nykaafashion.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.nykaafashion.com/sale'] },
  { name: 'H&M India', websiteUrl: 'https://www2.hm.com/en_in', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/en_in/sale.html'] },
  { name: 'Zara India', websiteUrl: 'https://www.zara.com/in', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/in/en/sale-l1702.html'] },
  { name: 'Uniqlo India', websiteUrl: 'https://www.uniqlo.com/in/en', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/in/en/sale'] },
  { name: 'Nike India', websiteUrl: 'https://www.nike.com/in', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/in/sale'] },
  { name: 'Adidas India', websiteUrl: 'https://www.adidas.co.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.co.in/sale'] },
  { name: 'Puma India', websiteUrl: 'https://in.puma.com', categorySlug: 'giyim-moda', seedUrls: ['https://in.puma.com/in/en/sale'] },
  { name: "Levi's India", websiteUrl: 'https://www.levi.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.in/sale'] },
  { name: 'Allen Solly', websiteUrl: 'https://www.allensolly.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.allensolly.com/sale'] },
  { name: 'Peter England', websiteUrl: 'https://www.peterengland.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.peterengland.com/sale'] },
  { name: 'Van Heusen', websiteUrl: 'https://www.vanheusen.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.vanheusen.com/sale'] },
  { name: 'Raymond', websiteUrl: 'https://www.raymond.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.raymond.in/offers'] },
  { name: 'Louis Philippe', websiteUrl: 'https://www.louisphilippe.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.louisphilippe.com/sale'] },
  { name: 'Fabindia', websiteUrl: 'https://www.fabindia.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.fabindia.com/sale'] },
  { name: 'W (Wishful)', websiteUrl: 'https://www.wforwoman.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.wforwoman.com/sale/'] },
  { name: 'Biba', websiteUrl: 'https://www.biba.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.biba.in/sale'] },
  { name: 'Global Desi', websiteUrl: 'https://www.globaldesi.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.globaldesi.in/sale'] },
  { name: 'FBB (Fashion Big Bazaar)', websiteUrl: 'https://www.fbbonline.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.fbbonline.in/sale'] },
  { name: 'Max Fashion India', websiteUrl: 'https://www.maxfashion.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.maxfashion.in/in/en/offers'] },
  { name: 'Lifestyle India', websiteUrl: 'https://www.lifestylestores.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.lifestylestores.com/in/en/offers'] },
  { name: 'Pantaloons', websiteUrl: 'https://www.pantaloons.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.pantaloons.com/sale'] },
  { name: 'Westside', websiteUrl: 'https://www.westside.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.westside.com/collections/sale'] },
  { name: 'Shoppers Stop', websiteUrl: 'https://www.shoppersstop.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.shoppersstop.com/offers'] },
  { name: 'Jockey India', websiteUrl: 'https://www.jockey.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.jockey.in/sale'] },
  { name: 'Wildcraft', websiteUrl: 'https://www.wildcraft.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.wildcraft.com/sale'] },
  { name: 'Lenskart Eyewear', websiteUrl: 'https://www.lenskart.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.lenskart.com/offers'] },
  { name: 'Titan Watches', websiteUrl: 'https://www.titan.co.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.titan.co.in/offers'] },
  { name: 'Fastrack', websiteUrl: 'https://www.fastrack.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.fastrack.in/offers'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Pepperfry Home', websiteUrl: 'https://www.pepperfry.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.pepperfry.com/sale.html'] },
  { name: 'Urban Ladder Home', websiteUrl: 'https://www.urbanladder.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.urbanladder.com/sale'] },
  { name: 'Home Centre', websiteUrl: 'https://www.homecentre.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.homecentre.in/in/en/offers'] },
  { name: 'IKEA India', websiteUrl: 'https://www.ikea.com/in/en', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/in/en/offers/'] },
  { name: 'Hometown', websiteUrl: 'https://www.hometown.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.hometown.in/sale'] },
  { name: 'Godrej Interio', websiteUrl: 'https://www.godrejinterio.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.godrejinterio.com/offers'] },
  { name: 'Stanley Lifestyles', websiteUrl: 'https://www.stanleylifestyles.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.stanleylifestyles.com/offers'] },
  { name: 'Wakefit', websiteUrl: 'https://www.wakefit.co', categorySlug: 'ev-yasam', seedUrls: ['https://www.wakefit.co/offers'] },
  { name: 'SleepyCat', websiteUrl: 'https://www.sleepycat.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.sleepycat.in/offers'] },
  { name: 'HomeTown Store', websiteUrl: 'https://www.hometown.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.hometown.in/offers'] },
  { name: 'Crate & Barrel India', websiteUrl: 'https://www.crateandbarrel.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.crateandbarrel.in/sale'] },
  { name: 'Urban Company', websiteUrl: 'https://www.urbancompany.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.urbancompany.com/offers'] },
  { name: 'Asian Paints', websiteUrl: 'https://www.asianpaints.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.asianpaints.com/offers.html'] },
  { name: 'Berger Paints', websiteUrl: 'https://www.bergerpaints.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.bergerpaints.com/offers'] },
  { name: 'Pidilite', websiteUrl: 'https://www.pidilite.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.pidilite.com/'] },
  { name: 'Crompton', websiteUrl: 'https://www.crompton.co.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.crompton.co.in/offers'] },
  { name: 'Orient Electric', websiteUrl: 'https://www.orientelectric.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.orientelectric.com/offers'] },
  { name: 'Philips India', websiteUrl: 'https://www.philips.co.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.philips.co.in/c-e/promotions.html'] },
  { name: 'Kent RO', websiteUrl: 'https://www.kent.co.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.kent.co.in/offers'] },
  { name: 'Eureka Forbes', websiteUrl: 'https://www.eurekaforbes.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.eurekaforbes.com/offers'] },
  { name: 'IFB', websiteUrl: 'https://www.ifbappliances.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ifbappliances.com/offers'] },
  { name: 'Prestige', websiteUrl: 'https://www.prestigeappliances.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.prestigeappliances.in/offers'] },
  { name: 'TTK Prestige', websiteUrl: 'https://www.ttkprestige.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ttkprestige.com/offers'] },
  { name: 'Hawkins', websiteUrl: 'https://www.hawkinscookers.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.hawkinscookers.com/offers.aspx'] },
  { name: 'Butterfly', websiteUrl: 'https://www.butterflyindia.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.butterflyindia.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery & Market — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'BigBasket Grocery', websiteUrl: 'https://www.bigbasket.com', categorySlug: 'gida-market', seedUrls: ['https://www.bigbasket.com/cl/offers/'] },
  { name: 'JioMart Grocery', websiteUrl: 'https://www.jiomart.com', categorySlug: 'gida-market', seedUrls: ['https://www.jiomart.com/all-offers'] },
  { name: 'Amazon Fresh India', websiteUrl: 'https://www.amazon.in/alm/storefront', categorySlug: 'gida-market', seedUrls: ['https://www.amazon.in/alm/storefront?almBrandId=QW1hem9uIEZyZXNo'] },
  { name: 'Blinkit', websiteUrl: 'https://blinkit.com', categorySlug: 'gida-market', seedUrls: ['https://blinkit.com/offers'] },
  { name: 'Zepto', websiteUrl: 'https://www.zeptonow.com', categorySlug: 'gida-market', seedUrls: ['https://www.zeptonow.com/offers'] },
  { name: 'Swiggy Instamart', websiteUrl: 'https://www.swiggy.com/instamart', categorySlug: 'gida-market', seedUrls: ['https://www.swiggy.com/instamart/offers'] },
  { name: 'DMart Ready Grocery', websiteUrl: 'https://www.dmart.in', categorySlug: 'gida-market', seedUrls: ['https://www.dmart.in/'] },
  { name: "Nature's Basket", websiteUrl: 'https://www.naturesbasket.co.in', categorySlug: 'gida-market', seedUrls: ['https://www.naturesbasket.co.in/offers'] },
  { name: "Spencer's", websiteUrl: 'https://www.spencers.in', categorySlug: 'gida-market', seedUrls: ['https://www.spencers.in/offers'] },
  { name: 'More Supermarket', websiteUrl: 'https://www.morestore.com', categorySlug: 'gida-market', seedUrls: ['https://www.morestore.com/offers'] },
  { name: 'Star Bazaar', websiteUrl: 'https://www.starbazaar.com', categorySlug: 'gida-market', seedUrls: ['https://www.starbazaar.com/offers'] },
  { name: 'Reliance Fresh', websiteUrl: 'https://www.reliancefresh.in', categorySlug: 'gida-market', seedUrls: ['https://www.reliancefresh.in/offers'] },
  { name: 'Easyday', websiteUrl: 'https://www.easyday.in', categorySlug: 'gida-market', seedUrls: ['https://www.easyday.in/offers'] },
  { name: 'Grofers', websiteUrl: 'https://grofers.com', categorySlug: 'gida-market', seedUrls: ['https://grofers.com/offers'] },
  { name: 'FreshToHome', websiteUrl: 'https://www.freshtohome.com', categorySlug: 'gida-market', seedUrls: ['https://www.freshtohome.com/offers'] },
  { name: 'Licious', websiteUrl: 'https://www.licious.in', categorySlug: 'gida-market', seedUrls: ['https://www.licious.in/offers'] },
  { name: 'Country Delight', websiteUrl: 'https://www.countrydelight.in', categorySlug: 'gida-market', seedUrls: ['https://www.countrydelight.in/offers'] },
  { name: 'Milkbasket', websiteUrl: 'https://www.milkbasket.com', categorySlug: 'gida-market', seedUrls: ['https://www.milkbasket.com/offers'] },
  { name: 'Dunzo Daily', websiteUrl: 'https://www.dunzo.com', categorySlug: 'gida-market', seedUrls: ['https://www.dunzo.com/offers'] },
  { name: 'BigBazaar', websiteUrl: 'https://www.bigbazaar.com', categorySlug: 'gida-market', seedUrls: ['https://www.bigbazaar.com/offers'] },
  { name: 'Flipkart Grocery', websiteUrl: 'https://www.flipkart.com/grocery-supermart-store', categorySlug: 'gida-market', seedUrls: ['https://www.flipkart.com/grocery-supermart-store?otracker=nmenu_Grocery'] },
  { name: 'Amazon Pantry', websiteUrl: 'https://www.amazon.in/gp/pantry', categorySlug: 'gida-market', seedUrls: ['https://www.amazon.in/gp/pantry'] },
  { name: 'Supr Daily', websiteUrl: 'https://www.suprdaily.com', categorySlug: 'gida-market', seedUrls: ['https://www.suprdaily.com/offers'] },
  { name: 'BB Now', websiteUrl: 'https://www.bigbasket.com/bbnow/', categorySlug: 'gida-market', seedUrls: ['https://www.bigbasket.com/bbnow/'] },
  { name: 'Otipy', websiteUrl: 'https://www.otipy.com', categorySlug: 'gida-market', seedUrls: ['https://www.otipy.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Dining — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Swiggy', websiteUrl: 'https://www.swiggy.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.swiggy.com/offers'] },
  { name: 'Zomato', websiteUrl: 'https://www.zomato.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.zomato.com/offers'] },
  { name: "Domino's India", websiteUrl: 'https://www.dominos.co.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.co.in/offers'] },
  { name: 'Pizza Hut India', websiteUrl: 'https://www.pizzahut.co.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.co.in/offers'] },
  { name: "McDonald's India", websiteUrl: 'https://www.mcdonaldsindia.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonaldsindia.com/offers.html'] },
  { name: 'Burger King India', websiteUrl: 'https://www.burgerking.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.in/offers'] },
  { name: 'KFC India', websiteUrl: 'https://online.kfc.co.in', categorySlug: 'yeme-icme', seedUrls: ['https://online.kfc.co.in/offers'] },
  { name: 'Subway India', websiteUrl: 'https://www.subway.com/en-IN', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/en-IN/menunutrition/deals'] },
  { name: 'Starbucks India', websiteUrl: 'https://www.starbucks.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.in/offers'] },
  { name: 'Wow Momo', websiteUrl: 'https://www.wowmomos.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.wowmomos.com/offers'] },
  { name: 'Barbeque Nation', websiteUrl: 'https://www.barbequenation.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.barbequenation.com/offers'] },
  { name: "Haldiram's", websiteUrl: 'https://www.haldirams.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.haldirams.com/offers'] },
  { name: 'Chai Point', websiteUrl: 'https://www.chaipoint.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.chaipoint.com/offers'] },
  { name: 'Behrouz Biryani', websiteUrl: 'https://www.behrouzbiryani.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.behrouzbiryani.com/offers'] },
  { name: 'FreshMenu', websiteUrl: 'https://www.freshmenu.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.freshmenu.com/offers'] },
  { name: 'Box8', websiteUrl: 'https://www.box8.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.box8.in/offers'] },
  { name: 'EatFit', websiteUrl: 'https://www.eatfit.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.eatfit.in/offers'] },
  { name: 'Taco Bell India', websiteUrl: 'https://www.tacobell.co.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.tacobell.co.in/offers'] },
  { name: "Dunkin' India", websiteUrl: 'https://www.dunkindonuts.co.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.co.in/offers'] },
  { name: "Wendy's India", websiteUrl: 'https://www.wendys.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.wendys.in/offers'] },
  { name: "Papa John's India", websiteUrl: 'https://www.papajohns.co.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.co.in/offers'] },
  { name: 'Cafe Coffee Day', websiteUrl: 'https://www.cafecoffeeday.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.cafecoffeeday.com/offers'] },
  { name: 'Faasos', websiteUrl: 'https://www.faasos.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.faasos.com/offers'] },
  { name: 'Biryani Blues', websiteUrl: 'https://www.biryaniblues.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.biryaniblues.com/offers'] },
  { name: 'Chaayos', websiteUrl: 'https://chaayos.com', categorySlug: 'yeme-icme', seedUrls: ['https://chaayos.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty & Personal Care — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nykaa Beauty', websiteUrl: 'https://www.nykaa.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nykaa.com/offers'] },
  { name: 'Purplle', websiteUrl: 'https://www.purplle.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.purplle.com/offers'] },
  { name: 'MyGlamm', websiteUrl: 'https://www.myglamm.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.myglamm.com/offers'] },
  { name: 'Mamaearth', websiteUrl: 'https://www.mamaearth.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mamaearth.in/offers'] },
  { name: 'Sugar Cosmetics', websiteUrl: 'https://www.sugarcosmetics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sugarcosmetics.com/offers'] },
  { name: 'Plum Goodness', websiteUrl: 'https://www.plumgoodness.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.plumgoodness.com/offers'] },
  { name: 'Lakme', websiteUrl: 'https://www.lakmeindia.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lakmeindia.com/offers'] },
  { name: 'Colorbar', websiteUrl: 'https://www.colorbarcosmetics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.colorbarcosmetics.com/offers'] },
  { name: 'Faces Canada', websiteUrl: 'https://www.facescanada.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.facescanada.com/offers'] },
  { name: 'The Body Shop India', websiteUrl: 'https://www.thebodyshop.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.in/sale'] },
  { name: 'Bath & Body Works India', websiteUrl: 'https://www.bathandbodyworks.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.in/sale'] },
  { name: 'Forest Essentials', websiteUrl: 'https://www.forestessentialsindia.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.forestessentialsindia.com/offers'] },
  { name: 'Biotique', websiteUrl: 'https://www.biotique.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.biotique.com/offers'] },
  { name: 'Khadi Natural', websiteUrl: 'https://www.khadinatural.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.khadinatural.com/offers'] },
  { name: 'Dabur', websiteUrl: 'https://www.dabur.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dabur.com/offers'] },
  { name: 'Himalaya', websiteUrl: 'https://www.himalayawellness.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.himalayawellness.in/offers'] },
  { name: 'Emami', websiteUrl: 'https://www.emami.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.emami.com/offers'] },
  { name: 'Nivea India', websiteUrl: 'https://www.nivea.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.in/offers'] },
  { name: "L'Oreal India", websiteUrl: 'https://www.lorealparis.co.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lorealparis.co.in/offers'] },
  { name: 'Sephora India', websiteUrl: 'https://www.sephora.nnnow.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.nnnow.com/sale'] },
  { name: 'MAC India', websiteUrl: 'https://www.maccosmetics.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.in/offers'] },
  { name: 'Clinique India', websiteUrl: 'https://www.clinique.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.in/offers'] },
  { name: 'TRESemme India', websiteUrl: 'https://www.tresemme.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.tresemme.in/offers'] },
  { name: 'Dove India', websiteUrl: 'https://www.dove.com/in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/in/offers.html'] },
  { name: 'Garnier India', websiteUrl: 'https://www.garnier.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.in/offers'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon India', websiteUrl: 'https://www.decathlon.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.in/sale'] },
  { name: 'Nike Sport India', websiteUrl: 'https://www.nike.com/in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/in/sale'] },
  { name: 'Adidas Sport India', websiteUrl: 'https://www.adidas.co.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.co.in/sale'] },
  { name: 'Puma Sport India', websiteUrl: 'https://in.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://in.puma.com/in/en/sale'] },
  { name: 'Asics India', websiteUrl: 'https://www.asics.com/in/en-in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/in/en-in/sale/'] },
  { name: 'Reebok India', websiteUrl: 'https://www.reebok.co.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.co.in/sale'] },
  { name: 'Skechers India', websiteUrl: 'https://www.skechers.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.in/sale/'] },
  { name: 'Wildcraft Sport', websiteUrl: 'https://www.wildcraft.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wildcraft.com/sale'] },
  { name: 'Quechua India', websiteUrl: 'https://www.decathlon.in/brand/quechua', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.in/brand/quechua'] },
  { name: 'Yonex India', websiteUrl: 'https://www.yonex.co.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.yonex.co.in/offers'] },
  { name: 'Nivia', websiteUrl: 'https://www.niviasports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.niviasports.com/offers'] },
  { name: 'Vector X', websiteUrl: 'https://www.vectorxsports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vectorxsports.com/offers'] },
  { name: 'SG Cricket', websiteUrl: 'https://www.sgcricket.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sgcricket.com/offers'] },
  { name: 'MRF Sports', websiteUrl: 'https://www.mrfsports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mrfsports.com/offers'] },
  { name: 'SS (Sareen Sports)', websiteUrl: 'https://www.ss-cricket.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ss-cricket.com/offers'] },
  { name: 'GM Cricket', websiteUrl: 'https://www.gm-cricket.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gm-cricket.com/offers'] },
  { name: 'CEAT Sports', websiteUrl: 'https://www.ceatsports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ceatsports.com/offers'] },
  { name: 'Cult.fit', websiteUrl: 'https://www.cult.fit', categorySlug: 'spor-outdoor', seedUrls: ['https://www.cult.fit/offers'] },
  { name: 'HealthifyMe', websiteUrl: 'https://www.healthifyme.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.healthifyme.com/offers/'] },
  { name: 'Under Armour India', websiteUrl: 'https://www.underarmour.co.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.co.in/sale/'] },
  { name: 'New Balance India', websiteUrl: 'https://www.newbalance.co.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.co.in/sale/'] },
  { name: 'Fila India', websiteUrl: 'https://www.filaindia.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.filaindia.com/sale'] },
  { name: 'Columbia India', websiteUrl: 'https://www.columbiasportswear.co.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.co.in/sale/'] },
  { name: 'HRX', websiteUrl: 'https://www.hrxbrand.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hrxbrand.com/sale'] },
  { name: 'Sportsuncle', websiteUrl: 'https://www.sportsuncle.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportsuncle.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'MakeMyTrip', websiteUrl: 'https://www.makemytrip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.makemytrip.com/offers/'] },
  { name: 'Goibibo', websiteUrl: 'https://www.goibibo.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.goibibo.com/offers/'] },
  { name: 'Cleartrip', websiteUrl: 'https://www.cleartrip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.cleartrip.com/offers'] },
  { name: 'IRCTC', websiteUrl: 'https://www.irctc.co.in', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.irctc.co.in/nget/train-search'] },
  { name: 'Yatra', websiteUrl: 'https://www.yatra.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.yatra.com/offers'] },
  { name: 'EaseMyTrip', websiteUrl: 'https://www.easemytrip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easemytrip.com/offers/'] },
  { name: 'Ixigo', websiteUrl: 'https://www.ixigo.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ixigo.com/offers'] },
  { name: 'OYO Rooms', websiteUrl: 'https://www.oyorooms.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.oyorooms.com/offers'] },
  { name: 'Airbnb India', websiteUrl: 'https://www.airbnb.co.in', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.co.in/'] },
  { name: 'Booking.com India', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.en-gb.html'] },
  { name: 'Treebo', websiteUrl: 'https://www.treebo.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.treebo.com/offers/'] },
  { name: 'FabHotels', websiteUrl: 'https://www.fabhotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fabhotels.com/offers'] },
  { name: 'RedBus', websiteUrl: 'https://www.redbus.in', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.redbus.in/offers'] },
  { name: 'AbhiBus', websiteUrl: 'https://www.abhibus.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.abhibus.com/offers'] },
  { name: 'IntrCity', websiteUrl: 'https://www.intrcity.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.intrcity.com/offers'] },
  { name: 'SpiceJet', websiteUrl: 'https://www.spicejet.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.spicejet.com/offers'] },
  { name: 'IndiGo', websiteUrl: 'https://www.goindigo.in', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.goindigo.in/offers.html'] },
  { name: 'Air India', websiteUrl: 'https://www.airindia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airindia.com/in/en/offers.html'] },
  { name: 'Vistara', websiteUrl: 'https://www.airvistara.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airvistara.com/in/en/offers'] },
  { name: 'Ola', websiteUrl: 'https://www.olacabs.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.olacabs.com/offers'] },
  { name: 'Uber India', websiteUrl: 'https://www.uber.com/in/en', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/in/en/ride/offers/'] },
  { name: 'Rapido', websiteUrl: 'https://www.rapido.bike', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rapido.bike/offers'] },
  { name: 'Thomas Cook India', websiteUrl: 'https://www.thomascook.in', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thomascook.in/offers'] },
  { name: 'SOTC', websiteUrl: 'https://www.sotc.in', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sotc.in/offers'] },
  { name: 'Club Mahindra', websiteUrl: 'https://www.clubmahindra.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.clubmahindra.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SBI', websiteUrl: 'https://www.sbi.co.in', categorySlug: 'finans', seedUrls: ['https://www.sbi.co.in/web/personal-banking/offers'] },
  { name: 'HDFC Bank', websiteUrl: 'https://www.hdfcbank.com', categorySlug: 'finans', seedUrls: ['https://www.hdfcbank.com/personal/offers'] },
  { name: 'ICICI Bank', websiteUrl: 'https://www.icicibank.com', categorySlug: 'finans', seedUrls: ['https://www.icicibank.com/offers'] },
  { name: 'Axis Bank', websiteUrl: 'https://www.axisbank.com', categorySlug: 'finans', seedUrls: ['https://www.axisbank.com/grab-deals/offers'] },
  { name: 'Kotak Mahindra Bank', websiteUrl: 'https://www.kotak.com', categorySlug: 'finans', seedUrls: ['https://www.kotak.com/en/offers.html'] },
  { name: 'PNB', websiteUrl: 'https://www.pnbindia.in', categorySlug: 'finans', seedUrls: ['https://www.pnbindia.in/offers.html'] },
  { name: 'Bank of Baroda', websiteUrl: 'https://www.bankofbaroda.in', categorySlug: 'finans', seedUrls: ['https://www.bankofbaroda.in/offers'] },
  { name: 'Canara Bank', websiteUrl: 'https://www.canarabank.com', categorySlug: 'finans', seedUrls: ['https://www.canarabank.com/offers'] },
  { name: 'Yes Bank', websiteUrl: 'https://www.yesbank.in', categorySlug: 'finans', seedUrls: ['https://www.yesbank.in/offers'] },
  { name: 'IndusInd Bank', websiteUrl: 'https://www.indusind.com', categorySlug: 'finans', seedUrls: ['https://www.indusind.com/in/en/personal/offers.html'] },
  { name: 'Paytm', websiteUrl: 'https://paytm.com', categorySlug: 'finans', seedUrls: ['https://paytm.com/offers'] },
  { name: 'PhonePe', websiteUrl: 'https://www.phonepe.com', categorySlug: 'finans', seedUrls: ['https://www.phonepe.com/offers/'] },
  { name: 'Google Pay India', websiteUrl: 'https://pay.google.com/intl/en_in/about/', categorySlug: 'finans', seedUrls: ['https://pay.google.com/intl/en_in/about/offers/'] },
  { name: 'CRED', websiteUrl: 'https://cred.club', categorySlug: 'finans', seedUrls: ['https://cred.club/offers'] },
  { name: 'Amazon Pay India', websiteUrl: 'https://www.amazon.in/amazonpay', categorySlug: 'finans', seedUrls: ['https://www.amazon.in/amazonpay/offers'] },
  { name: 'Bajaj Finserv', websiteUrl: 'https://www.bajajfinserv.in', categorySlug: 'finans', seedUrls: ['https://www.bajajfinserv.in/offers'] },
  { name: 'Groww', websiteUrl: 'https://groww.in', categorySlug: 'finans', seedUrls: ['https://groww.in/offers'] },
  { name: 'Zerodha', websiteUrl: 'https://zerodha.com', categorySlug: 'finans', seedUrls: ['https://zerodha.com/'] },
  { name: 'Upstox', websiteUrl: 'https://upstox.com', categorySlug: 'finans', seedUrls: ['https://upstox.com/offers/'] },
  { name: 'Angel One', websiteUrl: 'https://www.angelone.in', categorySlug: 'finans', seedUrls: ['https://www.angelone.in/offers'] },
  { name: 'PolicyBazaar Finance', websiteUrl: 'https://www.policybazaar.com', categorySlug: 'finans', seedUrls: ['https://www.policybazaar.com/offers/'] },
  { name: 'BankBazaar', websiteUrl: 'https://www.bankbazaar.com', categorySlug: 'finans', seedUrls: ['https://www.bankbazaar.com/offers.html'] },
  { name: 'Freecharge', websiteUrl: 'https://www.freecharge.in', categorySlug: 'finans', seedUrls: ['https://www.freecharge.in/offers'] },
  { name: 'MobiKwik', websiteUrl: 'https://www.mobikwik.com', categorySlug: 'finans', seedUrls: ['https://www.mobikwik.com/offers'] },
  { name: 'Simpl', websiteUrl: 'https://getsimpl.com', categorySlug: 'finans', seedUrls: ['https://getsimpl.com/offers/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'LIC', websiteUrl: 'https://www.licindia.in', categorySlug: 'sigorta', seedUrls: ['https://www.licindia.in/Products'] },
  { name: 'HDFC Life', websiteUrl: 'https://www.hdfclife.com', categorySlug: 'sigorta', seedUrls: ['https://www.hdfclife.com/offers'] },
  { name: 'ICICI Prudential', websiteUrl: 'https://www.iciciprulife.com', categorySlug: 'sigorta', seedUrls: ['https://www.iciciprulife.com/offers.html'] },
  { name: 'SBI Life', websiteUrl: 'https://www.sbilife.co.in', categorySlug: 'sigorta', seedUrls: ['https://www.sbilife.co.in/en/offers'] },
  { name: 'Max Life', websiteUrl: 'https://www.maxlifeinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.maxlifeinsurance.com/offers'] },
  { name: 'Bajaj Allianz', websiteUrl: 'https://www.bajajallianz.com', categorySlug: 'sigorta', seedUrls: ['https://www.bajajallianz.com/offers.html'] },
  { name: 'Star Health', websiteUrl: 'https://www.starhealth.in', categorySlug: 'sigorta', seedUrls: ['https://www.starhealth.in/offers'] },
  { name: 'HDFC ERGO', websiteUrl: 'https://www.hdfcergo.com', categorySlug: 'sigorta', seedUrls: ['https://www.hdfcergo.com/offers'] },
  { name: 'ICICI Lombard', websiteUrl: 'https://www.icicilombard.com', categorySlug: 'sigorta', seedUrls: ['https://www.icicilombard.com/offers'] },
  { name: 'Tata AIG', websiteUrl: 'https://www.tataaig.com', categorySlug: 'sigorta', seedUrls: ['https://www.tataaig.com/offers'] },
  { name: 'New India Assurance', websiteUrl: 'https://www.newindia.co.in', categorySlug: 'sigorta', seedUrls: ['https://www.newindia.co.in/'] },
  { name: 'Digit Insurance', websiteUrl: 'https://www.godigit.com', categorySlug: 'sigorta', seedUrls: ['https://www.godigit.com/offers'] },
  { name: 'Acko', websiteUrl: 'https://www.acko.com', categorySlug: 'sigorta', seedUrls: ['https://www.acko.com/offers'] },
  { name: 'PolicyBazaar Insurance', websiteUrl: 'https://www.policybazaar.com', categorySlug: 'sigorta', seedUrls: ['https://www.policybazaar.com/offers/'] },
  { name: 'Coverfox', websiteUrl: 'https://www.coverfox.com', categorySlug: 'sigorta', seedUrls: ['https://www.coverfox.com/offers/'] },
  { name: 'GoDigit', websiteUrl: 'https://www.godigit.com', categorySlug: 'sigorta', seedUrls: ['https://www.godigit.com/offers'] },
  { name: 'Future Generali', websiteUrl: 'https://www.futuregenerali.in', categorySlug: 'sigorta', seedUrls: ['https://www.futuregenerali.in/offers'] },
  { name: 'Bharti AXA', websiteUrl: 'https://www.bhartiaxa.com', categorySlug: 'sigorta', seedUrls: ['https://www.bhartiaxa.com/offers'] },
  { name: 'Aditya Birla Health', websiteUrl: 'https://www.adityabirlahealthinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.adityabirlahealthinsurance.com/offers'] },
  { name: 'Care Health', websiteUrl: 'https://www.careinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.careinsurance.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Maruti Suzuki', websiteUrl: 'https://www.marutisuzuki.com', categorySlug: 'otomobil', seedUrls: ['https://www.marutisuzuki.com/offers-and-deals'] },
  { name: 'Hyundai India', websiteUrl: 'https://www.hyundai.com/in/en', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/in/en/offers.html'] },
  { name: 'Tata Motors', websiteUrl: 'https://www.tatamotors.com', categorySlug: 'otomobil', seedUrls: ['https://www.tatamotors.com/offers/'] },
  { name: 'Mahindra', websiteUrl: 'https://www.mahindra.com', categorySlug: 'otomobil', seedUrls: ['https://auto.mahindra.com/offers'] },
  { name: 'Kia India', websiteUrl: 'https://www.kia.com/in', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/in/utility/offers.html'] },
  { name: 'Toyota India', websiteUrl: 'https://www.toyotabharat.com', categorySlug: 'otomobil', seedUrls: ['https://www.toyotabharat.com/offers/'] },
  { name: 'Honda Cars India', websiteUrl: 'https://www.hondacarindia.com', categorySlug: 'otomobil', seedUrls: ['https://www.hondacarindia.com/offers'] },
  { name: 'MG Motor India', websiteUrl: 'https://www.mgmotor.co.in', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.co.in/offers'] },
  { name: 'Skoda India', websiteUrl: 'https://www.skoda-auto.co.in', categorySlug: 'otomobil', seedUrls: ['https://www.skoda-auto.co.in/offers'] },
  { name: 'Volkswagen India', websiteUrl: 'https://www.volkswagen.co.in', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.co.in/en/offers.html'] },
  { name: 'Renault India', websiteUrl: 'https://www.renault.co.in', categorySlug: 'otomobil', seedUrls: ['https://www.renault.co.in/offers.html'] },
  { name: 'Nissan India', websiteUrl: 'https://www.nissan.in', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.in/offers.html'] },
  { name: 'Citroen India', websiteUrl: 'https://www.citroen.in', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.in/offers.html'] },
  { name: 'Jeep India', websiteUrl: 'https://www.jeep-india.com', categorySlug: 'otomobil', seedUrls: ['https://www.jeep-india.com/offers.html'] },
  { name: 'Mercedes-Benz India', websiteUrl: 'https://www.mercedes-benz.co.in', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.co.in/passengercars/campaigns.html'] },
  { name: 'BMW India', websiteUrl: 'https://www.bmw.in', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.in/en/offers.html'] },
  { name: 'Audi India', websiteUrl: 'https://www.audi.in', categorySlug: 'otomobil', seedUrls: ['https://www.audi.in/in/web/en/offers.html'] },
  { name: 'Ford India', websiteUrl: 'https://www.india.ford.com', categorySlug: 'otomobil', seedUrls: ['https://www.india.ford.com/offers/'] },
  { name: 'Volvo India', websiteUrl: 'https://www.volvocars.com/in', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/in/offers/'] },
  { name: 'BYD India', websiteUrl: 'https://www.byd.com/in', categorySlug: 'otomobil', seedUrls: ['https://www.byd.com/in/offers'] },
  { name: 'Hero MotoCorp', websiteUrl: 'https://www.heromotocorp.com', categorySlug: 'otomobil', seedUrls: ['https://www.heromotocorp.com/en-in/offers.html'] },
  { name: 'TVS Motor', websiteUrl: 'https://www.tvsmotor.com', categorySlug: 'otomobil', seedUrls: ['https://www.tvsmotor.com/offers'] },
  { name: 'Bajaj Auto', websiteUrl: 'https://www.bajajauto.com', categorySlug: 'otomobil', seedUrls: ['https://www.bajajauto.com/offers'] },
  { name: 'Royal Enfield', websiteUrl: 'https://www.royalenfield.com', categorySlug: 'otomobil', seedUrls: ['https://www.royalenfield.com/in/en/offers/'] },
  { name: 'Ola Electric', websiteUrl: 'https://www.olaelectric.com', categorySlug: 'otomobil', seedUrls: ['https://www.olaelectric.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon Books India', websiteUrl: 'https://www.amazon.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.in/deals?ref=books'] },
  { name: 'Flipkart Books', websiteUrl: 'https://www.flipkart.com/books/pr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.flipkart.com/books/pr?otracker=nmenu_Books'] },
  { name: 'Crossword', websiteUrl: 'https://www.crossword.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.crossword.in/offers'] },
  { name: 'Kindle India', websiteUrl: 'https://www.amazon.in/kindle-dbs/storefront', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.in/kindle-dbs/deals'] },
  { name: 'Audible India', websiteUrl: 'https://www.audible.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.in/offers'] },
  { name: 'Sapnaonline', websiteUrl: 'https://www.sapnaonline.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sapnaonline.com/offers'] },
  { name: 'BookSwagon', websiteUrl: 'https://www.bookswagon.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookswagon.com/offers'] },
  { name: 'Bookish Santa', websiteUrl: 'https://www.bookishsanta.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookishsanta.com/collections/sale'] },
  { name: 'Notion Press', websiteUrl: 'https://notionpress.com', categorySlug: 'kitap-hobi', seedUrls: ['https://notionpress.com/offers'] },
  { name: 'PaperBack Shop', websiteUrl: 'https://www.paperbackshop.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.paperbackshop.in/offers'] },
  { name: 'Hamleys India', websiteUrl: 'https://www.hamleys.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hamleys.in/sale'] },
  { name: 'MyFirsToys', websiteUrl: 'https://www.myfirstoys.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.myfirstoys.com/offers'] },
  { name: 'Toycra', websiteUrl: 'https://www.toycra.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toycra.com/collections/sale'] },
  { name: 'Hobby Ideas', websiteUrl: 'https://www.hobbyideas.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbyideas.in/offers'] },
  { name: 'Games Workshop India', websiteUrl: 'https://www.games-workshop.com/en-IN', categorySlug: 'kitap-hobi', seedUrls: ['https://www.games-workshop.com/en-IN/'] },
  { name: 'Funskool', websiteUrl: 'https://www.funskool.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.funskool.com/offers'] },
  { name: 'Mattel India', websiteUrl: 'https://www.mattel.com/en-in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mattel.com/en-in/offers'] },
  { name: 'Lego India', websiteUrl: 'https://www.lego.com/en-in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-in/offers'] },
  { name: 'Spotify India', websiteUrl: 'https://www.spotify.com/in-en', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/in-en/premium/'] },
  { name: 'Gaana', websiteUrl: 'https://gaana.com', categorySlug: 'kitap-hobi', seedUrls: ['https://gaana.com/offers'] },
  { name: 'JioSaavn', websiteUrl: 'https://www.jiosaavn.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.jiosaavn.com/offers'] },
  { name: "Byju's", websiteUrl: 'https://byjus.com', categorySlug: 'kitap-hobi', seedUrls: ['https://byjus.com/offers/'] },
  { name: 'Unacademy', websiteUrl: 'https://unacademy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://unacademy.com/offers'] },
  { name: 'Coursera India', websiteUrl: 'https://www.coursera.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coursera.org/offers'] },
  { name: 'Udemy India', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?src=ukw&q=deals'] },
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
  console.log('=== IN Market Brand Seed Script ===\n');

  // 1. Ensure English names for categories
  for (const [slug, nameEn] of Object.entries(CATEGORY_NAME_EN)) {
    await prisma.category.updateMany({
      where: { slug },
      data: { nameEn },
    });
  }
  console.log(`Updated English names for ${Object.keys(CATEGORY_NAME_EN).length} categories.\n`);

  // Load all categories into a slug -> id map
  const allCats = await prisma.category.findMany();
  const categoryMap = new Map<string, string>();
  for (const c of allCats) {
    categoryMap.set(c.slug, c.id);
  }
  console.log(`Categories ready: ${categoryMap.size} total\n`);

  // 2. Deduplicate
  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Total brands: ${uniqueBrands.length} (${BRANDS.length - uniqueBrands.length} duplicates skipped)\n`);

  // 3. Process brands + sources
  let brandsOk = 0;
  let sourcesCreated = 0;
  let sourcesUpdated = 0;
  let errors = 0;

  for (const entry of uniqueBrands) {
    const slug = toSlug(entry.name);
    const categoryId = categoryMap.get(entry.categorySlug) ?? null;

    if (!categoryId) {
      console.warn(`  Category not found: ${entry.categorySlug} (brand: ${entry.name})`);
      errors++;
      continue;
    }

    try {
      // Upsert brand with IN market (unique on slug+market)
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'IN' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'IN',
          categoryId,
        },
      });

      // Check for existing crawl source
      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, crawlMethod: 'HTML' },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Deals`,
            crawlMethod: 'HTML',
            seedUrls: entry.seedUrls,
            maxDepth: 2,
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'IN',
            isActive: true,
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'IN' },
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

  // 4. Summary of all IN sources
  const totalINSources = await prisma.crawlSource.count({
    where: { market: 'IN', isActive: true },
  });
  console.log(`Total active IN sources: ${totalINSources}`);
  console.log('\nDone! To trigger crawl: POST /admin/crawl/trigger-all');
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
