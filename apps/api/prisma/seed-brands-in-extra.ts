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

// ── EXTRA IN BRANDS DATA (170 new brands) ────────────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tata Neu', websiteUrl: 'https://www.tataneu.com', categorySlug: 'alisveris', seedUrls: ['https://www.tataneu.com/offers'] },
  { name: 'Shopsy', websiteUrl: 'https://www.shopsy.in', categorySlug: 'alisveris', seedUrls: ['https://www.shopsy.in/offers'] },
  { name: 'GoKwik', websiteUrl: 'https://www.gokwik.co', categorySlug: 'alisveris', seedUrls: ['https://www.gokwik.co/offers'] },
  { name: 'Netmeds', websiteUrl: 'https://www.netmeds.com', categorySlug: 'alisveris', seedUrls: ['https://www.netmeds.com/offers'] },
  { name: 'Apollo Pharmacy', websiteUrl: 'https://www.apollopharmacy.in', categorySlug: 'alisveris', seedUrls: ['https://www.apollopharmacy.in/offers'] },
  { name: 'Medlife', websiteUrl: 'https://www.medlife.com', categorySlug: 'alisveris', seedUrls: ['https://www.medlife.com/offers'] },
  { name: 'Healthkart', websiteUrl: 'https://www.healthkart.com', categorySlug: 'alisveris', seedUrls: ['https://www.healthkart.com/offers'] },
  { name: 'Nykaa Man', websiteUrl: 'https://www.nykaaman.com', categorySlug: 'alisveris', seedUrls: ['https://www.nykaaman.com/offers'] },
  { name: 'Tata CLiQ Palette', websiteUrl: 'https://www.tatacliq.com/palette', categorySlug: 'alisveris', seedUrls: ['https://www.tatacliq.com/palette/offers'] },
  { name: 'Fynd', websiteUrl: 'https://www.fynd.com', categorySlug: 'alisveris', seedUrls: ['https://www.fynd.com/offers'] },
  { name: 'Moglix', websiteUrl: 'https://www.moglix.com', categorySlug: 'alisveris', seedUrls: ['https://www.moglix.com/offers'] },
  { name: 'IGP', websiteUrl: 'https://www.igp.com', categorySlug: 'alisveris', seedUrls: ['https://www.igp.com/offers'] },
  { name: 'Ferns N Petals', websiteUrl: 'https://www.fnp.com', categorySlug: 'alisveris', seedUrls: ['https://www.fnp.com/offers'] },
  { name: 'Winni', websiteUrl: 'https://www.winni.in', categorySlug: 'alisveris', seedUrls: ['https://www.winni.in/offers'] },
  { name: 'CashKaro', websiteUrl: 'https://cashkaro.com', categorySlug: 'alisveris', seedUrls: ['https://cashkaro.com/stores'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Noise', websiteUrl: 'https://www.gonoise.com', categorySlug: 'elektronik', seedUrls: ['https://www.gonoise.com/collections/all'] },
  { name: 'Fire-Boltt', websiteUrl: 'https://www.fireboltt.com', categorySlug: 'elektronik', seedUrls: ['https://www.fireboltt.com/collections/all'] },
  { name: 'iQOO', websiteUrl: 'https://www.iqoo.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.iqoo.com/in/offer'] },
  { name: 'Nothing', websiteUrl: 'https://in.nothing.tech', categorySlug: 'elektronik', seedUrls: ['https://in.nothing.tech/pages/offers'] },
  { name: 'Poco', websiteUrl: 'https://www.poco.in', categorySlug: 'elektronik', seedUrls: ['https://www.poco.in/offers'] },
  { name: 'Tecno', websiteUrl: 'https://www.tecno-mobile.in', categorySlug: 'elektronik', seedUrls: ['https://www.tecno-mobile.in/offers'] },
  { name: 'Infinix', websiteUrl: 'https://www.infinixmobiles.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.infinixmobiles.com/in/offer'] },
  { name: 'Micromax', websiteUrl: 'https://www.micromaxinfo.com', categorySlug: 'elektronik', seedUrls: ['https://www.micromaxinfo.com/smartphones'] },
  { name: 'Logitech', websiteUrl: 'https://www.logitech.com/en-in', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/en-in/promo/current-offers.html'] },
  { name: 'Dyson', websiteUrl: 'https://www.dyson.in', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.in/offers'] },
  { name: 'Voltas', websiteUrl: 'https://www.voltas.com', categorySlug: 'elektronik', seedUrls: ['https://www.voltas.com/offers'] },
  { name: 'Blue Star', websiteUrl: 'https://www.bluestarindia.com', categorySlug: 'elektronik', seedUrls: ['https://www.bluestarindia.com/offers'] },
  { name: 'Haier', websiteUrl: 'https://www.haier.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.haier.com/in/promotions/'] },
  { name: 'Daikin', websiteUrl: 'https://www.daikinindia.com', categorySlug: 'elektronik', seedUrls: ['https://www.daikinindia.com/consumer-offers'] },
  { name: 'Lloyd', websiteUrl: 'https://www.lloydsindia.com', categorySlug: 'elektronik', seedUrls: ['https://www.lloydsindia.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim-Moda / Clothing & Fashion — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Manyavar', websiteUrl: 'https://www.manyavar.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.manyavar.com/offers'] },
  { name: 'FabAlley', websiteUrl: 'https://www.faballey.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.faballey.com/sale'] },
  { name: 'AND', websiteUrl: 'https://www.and.co.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.and.co.in/sale'] },
  { name: 'The Souled Store', websiteUrl: 'https://www.thesouledstore.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.thesouledstore.com/offers'] },
  { name: 'Snitch', websiteUrl: 'https://www.snitch.co.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.snitch.co.in/collections/sale'] },
  { name: 'RARE Rabbit', websiteUrl: 'https://www.rfrare.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.rfrare.com/collections/sale'] },
  { name: 'Mufti', websiteUrl: 'https://www.mufti.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.mufti.in/sale'] },
  { name: 'Jack & Jones', websiteUrl: 'https://www.jackjones.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.jackjones.in/sale'] },
  { name: 'Vero Moda', websiteUrl: 'https://www.veromoda.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.veromoda.in/sale'] },
  { name: 'ONLY', websiteUrl: 'https://www.only.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.only.in/sale'] },
  { name: 'Sabyasachi', websiteUrl: 'https://www.sabyasachi.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sabyasachi.com/'] },
  { name: 'W for Woman', websiteUrl: 'https://www.wforwoman.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.wforwoman.com/sale'] },
  { name: 'Aurelia', websiteUrl: 'https://www.aurfrelia.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.aurfrelia.com/sale'] },
  { name: 'Go Colors', websiteUrl: 'https://www.gocolors.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.gocolors.com/sale'] },
  { name: 'Kalki Fashion', websiteUrl: 'https://www.kalkifashion.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.kalkifashion.com/sale'] },
  { name: 'Libas', websiteUrl: 'https://www.libas.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.libas.in/collections/sale'] },
  { name: 'Ethnix by Raymond', websiteUrl: 'https://www.raymond.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.raymond.in/ethnix/offers'] },
  { name: 'Monte Carlo', websiteUrl: 'https://www.montecarlo.in', categorySlug: 'giyim-moda', seedUrls: ['https://www.montecarlo.in/sale'] },
  { name: 'Nalli', websiteUrl: 'https://www.nalli.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.nalli.com/offers'] },
  { name: 'Mokobara', websiteUrl: 'https://www.mokobara.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.mokobara.com/collections/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda-Market / Grocery — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Grofers (Blinkit)', websiteUrl: 'https://blinkit.com', categorySlug: 'gida-market', seedUrls: ['https://blinkit.com/'] },
  { name: 'BBDaily', websiteUrl: 'https://www.bbdaily.com', categorySlug: 'gida-market', seedUrls: ['https://www.bbdaily.com/offers'] },
  { name: 'Flipkart Supermart', websiteUrl: 'https://www.flipkart.com/grocery-supermart-store', categorySlug: 'gida-market', seedUrls: ['https://www.flipkart.com/grocery-supermart-store'] },
  { name: 'Amazon Pantry', websiteUrl: 'https://www.amazon.in/pantry', categorySlug: 'gida-market', seedUrls: ['https://www.amazon.in/pantry'] },
  { name: 'Kissan', websiteUrl: 'https://www.kissan.in', categorySlug: 'gida-market', seedUrls: ['https://www.kissan.in/'] },
  { name: 'Amul', websiteUrl: 'https://amul.com', categorySlug: 'gida-market', seedUrls: ['https://amul.com/products'] },
  { name: 'Mother Dairy', websiteUrl: 'https://www.motherdairy.com', categorySlug: 'gida-market', seedUrls: ['https://www.motherdairy.com/'] },
  { name: 'Aashirvaad', websiteUrl: 'https://www.aashirvaad.com', categorySlug: 'gida-market', seedUrls: ['https://www.aashirvaad.com/'] },
  { name: 'Saffola', websiteUrl: 'https://www.saffolalife.com', categorySlug: 'gida-market', seedUrls: ['https://www.saffolalife.com/'] },
  { name: 'Patanjali', websiteUrl: 'https://www.patanjaliayurved.net', categorySlug: 'gida-market', seedUrls: ['https://www.patanjaliayurved.net/offers'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme-İçme / Food & Dining — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'EatSure', websiteUrl: 'https://www.eatsure.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.eatsure.com/offers'] },
  { name: 'Ovenstory Pizza', websiteUrl: 'https://www.ovenstory.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.ovenstory.in/offers'] },
  { name: 'La Pino\'z Pizza', websiteUrl: 'https://www.lapinozpizza.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.lapinozpizza.in/offers'] },
  { name: 'Theobroma', websiteUrl: 'https://www.theobroma.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.theobroma.in/'] },
  { name: 'Haldiram\'s Online', websiteUrl: 'https://www.haldirams.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.haldirams.com/offers'] },
  { name: 'Mad Over Donuts', websiteUrl: 'https://www.madoverdonuts.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.madoverdonuts.com/offers'] },
  { name: 'Rebel Foods', websiteUrl: 'https://www.rebelfoods.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.rebelfoods.com/'] },
  { name: 'Chai Kings', websiteUrl: 'https://www.chaikings.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.chaikings.com/'] },
  { name: 'Natural Ice Cream', websiteUrl: 'https://www.naturalicecream.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.naturalicecream.com/'] },
  { name: 'Barbeque Nation Online', websiteUrl: 'https://www.barbequenation.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.barbequenation.com/offers'] },
  { name: 'Biryani By Kilo', websiteUrl: 'https://www.biryanibykilo.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.biryanibykilo.com/offers'] },
  { name: 'Dineout', websiteUrl: 'https://www.dineout.co.in', categorySlug: 'yeme-icme', seedUrls: ['https://www.dineout.co.in/offers'] },
  { name: 'Innerchef', websiteUrl: 'https://www.innerchef.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.innerchef.com/offers'] },
  { name: 'Third Wave Coffee', websiteUrl: 'https://thirdwavecoffee.in', categorySlug: 'yeme-icme', seedUrls: ['https://thirdwavecoffee.in/'] },
  { name: 'Blue Tokai Coffee', websiteUrl: 'https://bluetokaicoffee.com', categorySlug: 'yeme-icme', seedUrls: ['https://bluetokaicoffee.com/collections/sale'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik-Kişisel Bakım / Beauty — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Minimalist', websiteUrl: 'https://beminimalist.co', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://beminimalist.co/collections/all'] },
  { name: 'mCaffeine', websiteUrl: 'https://www.mcaffeine.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mcaffeine.com/collections/offers'] },
  { name: 'Dot & Key', websiteUrl: 'https://www.dotandkey.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dotandkey.com/collections/sale'] },
  { name: 'Plum', websiteUrl: 'https://plumgoodness.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://plumgoodness.com/collections/offers'] },
  { name: 'WOW Skin Science', websiteUrl: 'https://www.buywow.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.buywow.in/collections/sale'] },
  { name: 'Kama Ayurveda', websiteUrl: 'https://www.kamaayurveda.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kamaayurveda.com/offers'] },
  { name: 'Juicy Chemistry', websiteUrl: 'https://juicychemistry.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://juicychemistry.com/collections/sale'] },
  { name: 'The Man Company', websiteUrl: 'https://www.themancompany.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.themancompany.com/collections/sale'] },
  { name: 'Bombay Shaving Company', websiteUrl: 'https://www.bombayshavingcompany.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bombayshavingcompany.com/collections/offers'] },
  { name: 'Renee Cosmetics', websiteUrl: 'https://www.reneecosmetics.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.reneecosmetics.in/collections/sale'] },
  { name: 'Mama Earth Baby', websiteUrl: 'https://mamaearth.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://mamaearth.in/offers'] },
  { name: 'Earth Rhythm', websiteUrl: 'https://earthrhythm.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://earthrhythm.com/collections/sale'] },
  { name: 'SoulTree', websiteUrl: 'https://www.soultree.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.soultree.in/collections/sale'] },
  { name: 'PAC Cosmetics', websiteUrl: 'https://www.paccosmetics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.paccosmetics.com/collections/sale'] },
  { name: 'Swiss Beauty', websiteUrl: 'https://www.swissbeauty.in', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.swissbeauty.in/collections/sale'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev-Yaşam / Home & Living — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'HomeTown', websiteUrl: 'https://www.hometown.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.hometown.in/sale'] },
  { name: 'WoodenStreet', websiteUrl: 'https://www.woodenstreet.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.woodenstreet.com/offers'] },
  { name: 'Durian', websiteUrl: 'https://www.durianfurniture.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.durianfurniture.com/offers'] },
  { name: 'Sleepyhead', websiteUrl: 'https://www.sleepyhead.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.sleepyhead.com/offers'] },
  { name: 'The Sleep Company', websiteUrl: 'https://www.thesleepcompany.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.thesleepcompany.in/offers'] },
  { name: 'HomeLane', websiteUrl: 'https://www.homelane.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.homelane.com/offers'] },
  { name: 'Livpure', websiteUrl: 'https://www.livpure.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.livpure.com/offers'] },
  { name: 'Hindware', websiteUrl: 'https://www.hindware.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.hindware.com/offers'] },
  { name: 'Jaquar', websiteUrl: 'https://www.jaquar.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.jaquar.com/'] },
  { name: 'Sleepwell', websiteUrl: 'https://www.sleepwell.co.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.sleepwell.co.in/offers'] },
  { name: 'Nilkamal', websiteUrl: 'https://www.nilkamalfurniture.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.nilkamalfurniture.com/offers'] },
  { name: 'Spaces by Welspun', websiteUrl: 'https://www.spacesbyresidences.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.spacesbyresidences.com/'] },
  { name: 'D\'Decor', websiteUrl: 'https://www.ddecor.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ddecor.com/'] },
  { name: 'Elica', websiteUrl: 'https://www.elica.in', categorySlug: 'ev-yasam', seedUrls: ['https://www.elica.in/offers'] },
  { name: 'Cello World', websiteUrl: 'https://www.celloworld.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.celloworld.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor-Outdoor / Sports & Outdoor — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'HRX by Hrithik', websiteUrl: 'https://www.myntra.com/hrx-by-hrithik-roshan', categorySlug: 'spor-outdoor', seedUrls: ['https://www.myntra.com/hrx-by-hrithik-roshan'] },
  { name: 'SG Cricket Equipment', websiteUrl: 'https://www.sgcricket.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sgcricket.com/offers'] },
  { name: 'Cosco Sports', websiteUrl: 'https://www.cosco.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.cosco.in/'] },
  { name: 'SS Sports (Sunridges)', websiteUrl: 'https://www.sssports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sssports.com/offers'] },
  { name: 'Kookaburra Cricket', websiteUrl: 'https://www.kookaburra.com.au', categorySlug: 'spor-outdoor', seedUrls: ['https://www.kookaburra.com.au/'] },
  { name: 'ProKick', websiteUrl: 'https://www.prokicksports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.prokicksports.com/offers'] },
  { name: 'Boldfit', websiteUrl: 'https://www.boldfit.in', categorySlug: 'spor-outdoor', seedUrls: ['https://www.boldfit.in/collections/sale'] },
  { name: 'Fitkit', websiteUrl: 'https://fitkit.in', categorySlug: 'spor-outdoor', seedUrls: ['https://fitkit.in/'] },
  { name: 'PowerMax Fitness', websiteUrl: 'https://www.powermaxfitness.net', categorySlug: 'spor-outdoor', seedUrls: ['https://www.powermaxfitness.net/offers'] },
  { name: 'Lifelong Fitness', websiteUrl: 'https://www.lifelongindia.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lifelongindia.com/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat-Ulaşım / Travel & Transport — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Treebo Hotels', websiteUrl: 'https://www.treebo.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.treebo.com/offers'] },
  { name: 'FabHotels', websiteUrl: 'https://www.fabhotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fabhotels.com/offers'] },
  { name: 'Lemon Tree Hotels', websiteUrl: 'https://www.lemontreehotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lemontreehotels.com/offers'] },
  { name: 'Taj Hotels', websiteUrl: 'https://www.tajhotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tajhotels.com/en-in/offers/'] },
  { name: 'ITC Hotels', websiteUrl: 'https://www.itchotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.itchotels.com/in/en/offers'] },
  { name: 'Zostel', websiteUrl: 'https://www.zostel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.zostel.com/'] },
  { name: 'GoAir (Go First)', websiteUrl: 'https://www.flygofirst.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flygofirst.com/offers'] },
  { name: 'Akasa Air', websiteUrl: 'https://www.akasaair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.akasaair.com/offers'] },
  { name: 'Air India Express', websiteUrl: 'https://www.airindiaexpress.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airindiaexpress.com/offers'] },
  { name: 'Via.com', websiteUrl: 'https://www.via.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.via.com/offers'] },
  { name: 'Pickyourtrail', websiteUrl: 'https://www.pickyourtrail.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pickyourtrail.com/offers'] },
  { name: 'Thrillophilia', websiteUrl: 'https://www.thrillophilia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thrillophilia.com/offers'] },
  { name: 'ConfirmTkt', websiteUrl: 'https://www.confirmtkt.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.confirmtkt.com/offers'] },
  { name: 'Railyatri', websiteUrl: 'https://www.railyatri.in', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.railyatri.in/offers'] },
  { name: 'TravelTriangle', websiteUrl: 'https://traveltriangle.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://traveltriangle.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Razorpay', websiteUrl: 'https://razorpay.com', categorySlug: 'finans', seedUrls: ['https://razorpay.com/'] },
  { name: 'Slice', websiteUrl: 'https://www.sliceit.com', categorySlug: 'finans', seedUrls: ['https://www.sliceit.com/offers'] },
  { name: 'Jupiter', websiteUrl: 'https://jupiter.money', categorySlug: 'finans', seedUrls: ['https://jupiter.money/offers'] },
  { name: 'Fi Money', websiteUrl: 'https://fi.money', categorySlug: 'finans', seedUrls: ['https://fi.money/'] },
  { name: 'Niyo', websiteUrl: 'https://www.goniyo.com', categorySlug: 'finans', seedUrls: ['https://www.goniyo.com/offers'] },
  { name: 'KreditBee', websiteUrl: 'https://www.kreditbee.in', categorySlug: 'finans', seedUrls: ['https://www.kreditbee.in/offers'] },
  { name: 'MoneyTap', websiteUrl: 'https://www.moneytap.com', categorySlug: 'finans', seedUrls: ['https://www.moneytap.com/offers'] },
  { name: 'BharatPe', websiteUrl: 'https://www.bharatpe.com', categorySlug: 'finans', seedUrls: ['https://www.bharatpe.com/offers'] },
  { name: 'Paytm Payments Bank', websiteUrl: 'https://paytm.com/bank', categorySlug: 'finans', seedUrls: ['https://paytm.com/offers'] },
  { name: 'Coin DCX', websiteUrl: 'https://coindcx.com', categorySlug: 'finans', seedUrls: ['https://coindcx.com/offers'] },
  { name: 'Kuvera', websiteUrl: 'https://kuvera.in', categorySlug: 'finans', seedUrls: ['https://kuvera.in/'] },
  { name: 'ET Money', websiteUrl: 'https://www.etmoney.com', categorySlug: 'finans', seedUrls: ['https://www.etmoney.com/'] },
  { name: 'INDmoney', websiteUrl: 'https://www.indmoney.com', categorySlug: 'finans', seedUrls: ['https://www.indmoney.com/'] },
  { name: 'Paisa Bazaar', websiteUrl: 'https://www.paisabazaar.com', categorySlug: 'finans', seedUrls: ['https://www.paisabazaar.com/offers'] },
  { name: 'Bank Bazaar', websiteUrl: 'https://www.bankbazaar.com', categorySlug: 'finans', seedUrls: ['https://www.bankbazaar.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'InsuranceDekho', websiteUrl: 'https://www.insurancedekho.com', categorySlug: 'sigorta', seedUrls: ['https://www.insurancedekho.com/'] },
  { name: 'Turtlemint', websiteUrl: 'https://www.turtlemint.com', categorySlug: 'sigorta', seedUrls: ['https://www.turtlemint.com/'] },
  { name: 'Niva Bupa', websiteUrl: 'https://www.nivabupa.com', categorySlug: 'sigorta', seedUrls: ['https://www.nivabupa.com/offers'] },
  { name: 'Tata AIA Life', websiteUrl: 'https://www.tataaia.com', categorySlug: 'sigorta', seedUrls: ['https://www.tataaia.com/'] },
  { name: 'Religare Health', websiteUrl: 'https://www.religarehealthinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.religarehealthinsurance.com/'] },
  { name: 'Edelweiss Tokio', websiteUrl: 'https://www.edelweisstokio.in', categorySlug: 'sigorta', seedUrls: ['https://www.edelweisstokio.in/'] },
  { name: 'Raheja QBE', websiteUrl: 'https://www.rahejaqbe.com', categorySlug: 'sigorta', seedUrls: ['https://www.rahejaqbe.com/'] },
  { name: 'Shriram General Insurance', websiteUrl: 'https://www.shriramgi.com', categorySlug: 'sigorta', seedUrls: ['https://www.shriramgi.com/'] },
  { name: 'Royal Sundaram', websiteUrl: 'https://www.royalsundaram.in', categorySlug: 'sigorta', seedUrls: ['https://www.royalsundaram.in/offers'] },
  { name: 'ManipalCigna', websiteUrl: 'https://www.manipalcigna.com', categorySlug: 'sigorta', seedUrls: ['https://www.manipalcigna.com/'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tata Motors Cars', websiteUrl: 'https://cars.tatamotors.com', categorySlug: 'otomobil', seedUrls: ['https://cars.tatamotors.com/offers'] },
  { name: 'Mahindra Cars', websiteUrl: 'https://auto.mahindra.com', categorySlug: 'otomobil', seedUrls: ['https://auto.mahindra.com/offers'] },
  { name: 'Bajaj Auto Bikes', websiteUrl: 'https://www.bajajauto.com', categorySlug: 'otomobil', seedUrls: ['https://www.bajajauto.com/offers'] },
  { name: 'TVS Motor Bikes', websiteUrl: 'https://www.tvsmotor.com', categorySlug: 'otomobil', seedUrls: ['https://www.tvsmotor.com/offers'] },
  { name: 'Ather Energy', websiteUrl: 'https://www.atherenergy.com', categorySlug: 'otomobil', seedUrls: ['https://www.atherenergy.com/offers'] },
  { name: 'Hero Electric', websiteUrl: 'https://www.heroelectric.in', categorySlug: 'otomobil', seedUrls: ['https://www.heroelectric.in/offers'] },
  { name: 'Honda Motorcycle', websiteUrl: 'https://www.honda2wheelersindia.com', categorySlug: 'otomobil', seedUrls: ['https://www.honda2wheelersindia.com/offers'] },
  { name: 'Yamaha Motor', websiteUrl: 'https://www.yamaha-motor-india.com', categorySlug: 'otomobil', seedUrls: ['https://www.yamaha-motor-india.com/offers'] },
  { name: 'CarDekho', websiteUrl: 'https://www.cardekho.com', categorySlug: 'otomobil', seedUrls: ['https://www.cardekho.com/best-deals'] },
  { name: 'Cars24', websiteUrl: 'https://www.cars24.com', categorySlug: 'otomobil', seedUrls: ['https://www.cars24.com/offers'] },
  { name: 'Spinny', websiteUrl: 'https://www.spinny.com', categorySlug: 'otomobil', seedUrls: ['https://www.spinny.com/offers'] },
  { name: 'Droom', websiteUrl: 'https://droom.in', categorySlug: 'otomobil', seedUrls: ['https://droom.in/offers'] },
  { name: 'Park+', websiteUrl: 'https://www.parkplus.io', categorySlug: 'otomobil', seedUrls: ['https://www.parkplus.io/offers'] },
  { name: 'Carvana India', websiteUrl: 'https://www.kavak.com/in', categorySlug: 'otomobil', seedUrls: ['https://www.kavak.com/in/'] },
  { name: 'Jawa Motorcycles', websiteUrl: 'https://www.jawamotorcycles.com', categorySlug: 'otomobil', seedUrls: ['https://www.jawamotorcycles.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap-Hobi / Books & Hobbies — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Audible India', websiteUrl: 'https://www.audible.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.in/offers'] },
  { name: 'Pratilipi', websiteUrl: 'https://www.pratilipi.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.pratilipi.com/'] },
  { name: 'Kitabay', websiteUrl: 'https://www.kitabay.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kitabay.com/'] },
  { name: 'Hamleys Toys', websiteUrl: 'https://www.hamleys.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hamleys.in/offers'] },
  { name: 'Archies', websiteUrl: 'https://www.archiesonline.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.archiesonline.com/offers'] },
  { name: 'Toycra', websiteUrl: 'https://www.toycra.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toycra.com/'] },
  { name: 'Pothi.com', websiteUrl: 'https://pothi.com', categorySlug: 'kitap-hobi', seedUrls: ['https://pothi.com/'] },
  { name: 'Educart', websiteUrl: 'https://www.educart.co', categorySlug: 'kitap-hobi', seedUrls: ['https://www.educart.co/offers'] },
  { name: 'PaperFry Books', websiteUrl: 'https://www.pepperfry.com/books', categorySlug: 'kitap-hobi', seedUrls: ['https://www.pepperfry.com/books'] },
  { name: 'Yellow Owl', websiteUrl: 'https://www.yellowowl.in', categorySlug: 'kitap-hobi', seedUrls: ['https://www.yellowowl.in/'] },

  // ═══════════════════════════════════════════════════════
  // Extra brands to reach 170 total
  // ═══════════════════════════════════════════════════════
  // More fashion brands
  { name: 'Urbanic', websiteUrl: 'https://www.urbanic.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.urbanic.com/sale'] },
  { name: 'Virgio', websiteUrl: 'https://www.virfrgio.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.virfrgio.com/collections/sale'] },
  { name: 'Clovia', websiteUrl: 'https://www.clovia.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.clovia.com/sale'] },
  { name: 'Zivame', websiteUrl: 'https://www.zivame.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.zivame.com/sale'] },
  { name: 'Chumbak', websiteUrl: 'https://www.chumbak.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.chumbak.com/sale'] },
  // More electronics
  { name: 'Bosch Home', websiteUrl: 'https://www.bosch-home.in', categorySlug: 'elektronik', seedUrls: ['https://www.bosch-home.in/offers'] },
  { name: 'Siemens Home', websiteUrl: 'https://www.siemens-home.bsh-group.com/in', categorySlug: 'elektronik', seedUrls: ['https://www.siemens-home.bsh-group.com/in/'] },
  { name: 'Canon', websiteUrl: 'https://www.canon.co.in', categorySlug: 'elektronik', seedUrls: ['https://www.canon.co.in/offers'] },
  { name: 'Nikon', websiteUrl: 'https://www.nikon.co.in', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.co.in/'] },
  { name: 'Marshall', websiteUrl: 'https://www.marshallheadphones.com/in/en', categorySlug: 'elektronik', seedUrls: ['https://www.marshallheadphones.com/in/en/'] },
];

// ── Main seed function ────────────────────────────────────
async function main() {
  console.log(`Seeding ${BRANDS.length} EXTRA IN brands...\n`);

  // Get all existing categories (categories are global, not per-market)
  const categories = await prisma.category.findMany({
    select: { id: true, slug: true },
  });
  const catMap = new Map(categories.map(c => [c.slug, c.id]));

  // Get all existing brands for duplicate check
  const existingBrands = await prisma.brand.findMany({
    where: { market: 'IN' },
    select: { id: true, name: true, slug: true },
  });
  const existingSlugs = new Set(existingBrands.map(b => b.slug));
  const existingNames = new Set(existingBrands.map(b => b.name.toLowerCase()));

  let created = 0;
  let skipped = 0;
  let sourcesCreated = 0;

  for (const brand of BRANDS) {
    const slug = toSlug(brand.name);

    // Skip if brand already exists (by slug or name)
    if (existingSlugs.has(slug) || existingNames.has(brand.name.toLowerCase())) {
      console.log(`  SKIP (exists): ${brand.name}`);
      skipped++;
      continue;
    }

    const categoryId = catMap.get(brand.categorySlug);
    if (!categoryId) {
      console.log(`  SKIP (no category ${brand.categorySlug}): ${brand.name}`);
      skipped++;
      continue;
    }

    // Create brand
    const newBrand = await prisma.brand.create({
      data: {
        name: brand.name,
        slug,
        websiteUrl: brand.websiteUrl,
        market: 'IN',
        isActive: true,
        categoryId,
      },
    });

    console.log(`  ✓ Brand: ${brand.name} (${brand.categorySlug})`);
    created++;

    // Create crawl sources for each seed URL
    for (const seedUrl of brand.seedUrls) {
      try {
        await prisma.crawlSource.create({
          data: {
            name: `${brand.name} - ${CATEGORY_NAME_EN[brand.categorySlug] || brand.categorySlug}`,
            brandId: newBrand.id,
            categoryId,
            url: seedUrl,
            crawlMethod: 'CSS_SELECTOR',
            isActive: true,
            market: 'IN',
          },
        });
        sourcesCreated++;
      } catch (err) {
        console.log(`    ⚠ Source error for ${seedUrl}: ${(err as Error).message}`);
      }
    }
  }

  console.log(`\nDone: ${created} brands created, ${skipped} skipped, ${sourcesCreated} sources created`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
