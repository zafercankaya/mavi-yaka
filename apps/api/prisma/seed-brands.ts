import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── Turkish-aware slug generator ──────────────────────────
function toSlug(name: string): string {
  return name
    .replace(/İ/g, 'I').replace(/Ö/g, 'O').replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S').replace(/Ç/g, 'C').replace(/Ğ/g, 'G')
    .toLowerCase()
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── New categories to add ─────────────────────────────────
const NEW_CATEGORIES = [
  { name: 'Alışveriş', slug: 'alisveris', iconName: 'cart-outline', sortOrder: 0 },
  { name: 'Otomobil', slug: 'otomobil', iconName: 'car-outline', sortOrder: 10 },
  { name: 'Finans', slug: 'finans', iconName: 'card-outline', sortOrder: 11 },
  { name: 'Sigorta', slug: 'sigorta', iconName: 'shield', sortOrder: 12 },
];

// ── Brand entry type ──────────────────────────────────────
interface BrandEntry {
  name: string;
  websiteUrl: string;
  categorySlug: string;
  seedUrls: string[];
}

// ── ALL BRANDS DATA ───────────────────────────────────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş (Marketplace & Genel)
  // ═══════════════════════════════════════════════════════
  { name: 'Trendyol', websiteUrl: 'https://www.trendyol.com', categorySlug: 'alisveris', seedUrls: ['https://www.trendyol.com/kampanyalar'] },
  { name: 'Hepsiburada', websiteUrl: 'https://www.hepsiburada.com', categorySlug: 'alisveris', seedUrls: ['https://www.hepsiburada.com/kampanyalar'] },
  { name: 'n11', websiteUrl: 'https://www.n11.com', categorySlug: 'alisveris', seedUrls: ['https://www.n11.com/kampanyalar'] },
  { name: 'Amazon', websiteUrl: 'https://www.amazon.com.tr', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.com.tr/deals'] },
  { name: 'Pazarama', websiteUrl: 'https://www.pazarama.com', categorySlug: 'alisveris', seedUrls: ['https://www.pazarama.com/kampanyalar'] },
  { name: 'ÇiçekSepeti', websiteUrl: 'https://www.ciceksepeti.com', categorySlug: 'alisveris', seedUrls: ['https://www.ciceksepeti.com/kampanyalar'] },
  { name: 'Boyner', websiteUrl: 'https://www.boyner.com.tr', categorySlug: 'alisveris', seedUrls: ['https://www.boyner.com.tr/kampanyalar'] },
  { name: 'Morhipo', websiteUrl: 'https://www.morhipo.com', categorySlug: 'alisveris', seedUrls: ['https://www.morhipo.com/kampanya'] },
  { name: 'Markafoni', websiteUrl: 'https://www.markafoni.com', categorySlug: 'alisveris', seedUrls: ['https://www.markafoni.com/'] },
  { name: 'Getir', websiteUrl: 'https://getir.com', categorySlug: 'gida-market', seedUrls: ['https://getir.com/'] },
  { name: 'PttAVM', websiteUrl: 'https://www.pttavm.com', categorySlug: 'alisveris', seedUrls: ['https://www.pttavm.com/kampanya'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik
  // ═══════════════════════════════════════════════════════
  { name: 'Teknosa', websiteUrl: 'https://www.teknosa.com', categorySlug: 'elektronik', seedUrls: ['https://www.teknosa.com/kampanyalar/'] },
  { name: 'MediaMarkt', websiteUrl: 'https://www.mediamarkt.com.tr', categorySlug: 'elektronik', seedUrls: ['https://www.mediamarkt.com.tr/tr/campaign/kampanyalar'] },
  { name: 'Vatan Bilgisayar', websiteUrl: 'https://www.vatanbilgisayar.com', categorySlug: 'elektronik', seedUrls: ['https://www.vatanbilgisayar.com/kampanya'] },
  { name: 'İtopya', websiteUrl: 'https://www.itopya.com', categorySlug: 'elektronik', seedUrls: ['https://www.itopya.com/kampanyalar/'] },
  { name: 'İncehesap', websiteUrl: 'https://www.incehesap.com', categorySlug: 'elektronik', seedUrls: ['https://www.incehesap.com/kampanyalar/'] },
  { name: 'Sinerji', websiteUrl: 'https://www.sinerji.gen.tr', categorySlug: 'elektronik', seedUrls: ['https://www.sinerji.gen.tr/kampanyalar'] },
  { name: 'Gaming.gen.tr', websiteUrl: 'https://www.gaming.gen.tr', categorySlug: 'elektronik', seedUrls: ['https://www.gaming.gen.tr/kampanyalar/'] },
  { name: 'Apple', websiteUrl: 'https://www.apple.com/tr', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/tr/shop'] },
  { name: 'Samsung', websiteUrl: 'https://www.samsung.com/tr', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/tr/offer/'] },
  { name: 'Xiaomi', websiteUrl: 'https://www.mi.com/tr', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/tr/'] },
  { name: 'Huawei', websiteUrl: 'https://consumer.huawei.com/tr', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/tr/offer/'] },
  { name: 'Dyson', websiteUrl: 'https://www.dyson.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.dyson.com.tr/kampanyalar'] },
  { name: 'Philips', websiteUrl: 'https://www.philips.com.tr', categorySlug: 'elektronik', seedUrls: ['https://www.philips.com.tr/'] },
  { name: 'Lenovo', websiteUrl: 'https://www.lenovo.com/tr/tr', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/tr/tr/deals/'] },
  { name: 'HP', websiteUrl: 'https://www.hp.com/tr-tr', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/tr-tr/shop/'] },
  { name: 'Asus', websiteUrl: 'https://www.asus.com/tr', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/tr/'] },
  { name: 'Monster Notebook', websiteUrl: 'https://www.monsternotebook.com.tr', categorySlug: 'elektronik', seedUrls: ['https://www.monsternotebook.com.tr/kampanyalar/'] },
  { name: 'Casper', websiteUrl: 'https://www.casper.com.tr', categorySlug: 'elektronik', seedUrls: ['https://www.casper.com.tr/kampanyalar'] },
  { name: 'Vestel', websiteUrl: 'https://www.vestel.com.tr', categorySlug: 'elektronik', seedUrls: ['https://www.vestel.com.tr/kampanyalar'] },
  { name: 'Arçelik', websiteUrl: 'https://www.arcelik.com.tr', categorySlug: 'elektronik', seedUrls: ['https://www.arcelik.com.tr/kampanyalar'] },
  { name: 'Beko', websiteUrl: 'https://www.beko.com.tr', categorySlug: 'elektronik', seedUrls: ['https://www.beko.com.tr/kampanyalar'] },
  { name: 'Grundig', websiteUrl: 'https://www.grundig.com.tr', categorySlug: 'elektronik', seedUrls: ['https://www.grundig.com.tr/kampanyalar'] },
  { name: 'TCL', websiteUrl: 'https://www.tcl.com/tr/tr', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/tr/tr'] },
  { name: 'Logitech', websiteUrl: 'https://www.logitech.com/tr-tr', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/tr-tr/promotions.html'] },
  { name: 'JBL', websiteUrl: 'https://tr.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://tr.jbl.com/collections/sale'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda
  // ═══════════════════════════════════════════════════════
  { name: 'LC Waikiki', websiteUrl: 'https://www.lcw.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.lcw.com/firsat-alani'] },
  { name: 'DeFacto', websiteUrl: 'https://www.defacto.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.defacto.com.tr/kampanyalar'] },
  { name: 'Koton', websiteUrl: 'https://www.koton.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.koton.com/kampanyalar'] },
  { name: 'Mavi', websiteUrl: 'https://www.mavi.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.mavi.com/kampanyalar'] },
  { name: "Colin's", websiteUrl: 'https://www.colins.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.colins.com.tr/kampanyalar'] },
  { name: 'İpekyol', websiteUrl: 'https://www.ipekyol.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.ipekyol.com.tr/indirim'] },
  { name: 'Twist', websiteUrl: 'https://www.twist.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.twist.com.tr/indirim'] },
  { name: 'Machka', websiteUrl: 'https://www.machka.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.machka.com.tr/indirim'] },
  { name: 'Network', websiteUrl: 'https://www.network.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.network.com.tr/outlet'] },
  { name: 'Roman', websiteUrl: 'https://www.roman.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.roman.com.tr/indirim'] },
  { name: 'Vakko', websiteUrl: 'https://www.vakko.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.vakko.com/outlet'] },
  { name: 'Beymen', websiteUrl: 'https://www.beymen.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.beymen.com/outlet'] },
  { name: 'Sarar', websiteUrl: 'https://sarar.com', categorySlug: 'giyim-moda', seedUrls: ['https://sarar.com/kampanyalar'] },
  { name: 'Kiğılı', websiteUrl: 'https://www.kigili.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.kigili.com/indirim'] },
  { name: 'Altınyıldız Classics', websiteUrl: 'https://www.altinyildizclassics.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.altinyildizclassics.com/kampanyalar-c'] },
  { name: 'Damat Tween', websiteUrl: 'https://www.damattween.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.damattween.com/outlet'] },
  { name: "D'S Damat", websiteUrl: 'https://www.dsdamat.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.dsdamat.com/indirim'] },
  { name: 'AVVA', websiteUrl: 'https://www.avva.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.avva.com.tr/outlet'] },
  { name: 'US Polo Assn', websiteUrl: 'https://tr.uspoloassn.com', categorySlug: 'giyim-moda', seedUrls: ['https://tr.uspoloassn.com/outlet'] },
  { name: 'Pierre Cardin', websiteUrl: 'https://www.pierrecardin.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.pierrecardin.com.tr/indirim'] },
  { name: 'Penti', websiteUrl: 'https://www.penti.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.penti.com/tr/kampanyalar'] },
  { name: 'Adidas', websiteUrl: 'https://www.adidas.com.tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.com.tr/outlet'] },
  { name: 'Nike', websiteUrl: 'https://www.nike.com/tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/tr/w/indirimli-urunler-3yaep'] },
  { name: 'Puma', websiteUrl: 'https://tr.puma.com', categorySlug: 'giyim-moda', seedUrls: ['https://tr.puma.com/outlet'] },
  { name: 'Zara', websiteUrl: 'https://www.zara.com/tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/tr/tr/sale-l5503.html'] },
  { name: 'H&M', websiteUrl: 'https://www2.hm.com/tr_tr', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/tr_tr/indirim.html'] },
  { name: 'Mango', websiteUrl: 'https://shop.mango.com/tr', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/tr/kadin/indirim_d7'] },
  { name: 'Stradivarius', websiteUrl: 'https://www.stradivarius.com/tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/tr/indirim-l1867.html'] },
  { name: 'Bershka', websiteUrl: 'https://www.bershka.com/tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/tr/indirimler-c1010193239.html'] },
  { name: 'Pull&Bear', websiteUrl: 'https://www.pullandbear.com/tr', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/tr/indirimler-n6417'] },

  // ═══════════════════════════════════════════════════════
  // 4) Seyahat & Ulaşım
  // ═══════════════════════════════════════════════════════
  { name: 'Türk Hava Yolları', websiteUrl: 'https://www.turkishairlines.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.turkishairlines.com/tr-tr/kampanyalar/'] },
  { name: 'Pegasus', websiteUrl: 'https://www.flypgs.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flypgs.com/kampanyalar'] },
  { name: 'AnadoluJet', websiteUrl: 'https://www.ajet.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ajet.com/tr/kampanyalar'] },
  { name: 'SunExpress', websiteUrl: 'https://www.sunexpress.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sunexpress.com/tr-tr/kampanyalar/'] },
  { name: 'TCDD Taşımacılık', websiteUrl: 'https://www.tcddtasimacilik.gov.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tcddtasimacilik.gov.tr/'] },
  { name: 'Enuygun', websiteUrl: 'https://www.enuygun.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.enuygun.com/kampanyalar/'] },
  { name: 'obilet', websiteUrl: 'https://www.obilet.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.obilet.com/kampanyalar'] },
  { name: 'Biletall', websiteUrl: 'https://www.biletall.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.biletall.com/kampanyalar'] },
  { name: 'Turna', websiteUrl: 'https://www.turna.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.turna.com/kampanyalar'] },
  { name: 'Tatilsepeti', websiteUrl: 'https://www.tatilsepeti.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tatilsepeti.com/kampanyalar'] },
  { name: 'Jolly', websiteUrl: 'https://www.jollytur.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jollytur.com/kampanyalar'] },
  { name: 'ETS Tur', websiteUrl: 'https://www.etstur.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.etstur.com/kampanyalar'] },
  { name: 'Setur', websiteUrl: 'https://www.setur.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.setur.com.tr/kampanyalar'] },
  { name: 'Kamil Koç', websiteUrl: 'https://www.kamilkoc.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kamilkoc.com.tr/kampanyalar'] },
  { name: 'Metro Turizm', websiteUrl: 'https://www.metroturizm.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.metroturizm.com.tr/kampanyalar'] },
  { name: 'Pamukkale Turizm', websiteUrl: 'https://www.pamukkale.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pamukkale.com.tr/kampanyalar'] },
  { name: 'FlixBus', websiteUrl: 'https://www.flixbus.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.com.tr/promosyonlar'] },
  { name: 'Airbnb', websiteUrl: 'https://www.airbnb.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.com.tr/'] },
  { name: 'Booking', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.tr.html'] },
  { name: 'Hotels.com', websiteUrl: 'https://tr.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://tr.hotels.com/deals/'] },
  { name: 'Avis', websiteUrl: 'https://www.avis.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avis.com.tr/kampanyalar'] },
  { name: 'Budget', websiteUrl: 'https://www.budget.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.budget.com.tr/kampanyalar'] },
  { name: 'Enterprise', websiteUrl: 'https://www.enterprise.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.enterprise.com.tr/kampanyalar'] },
  { name: 'Sixt', websiteUrl: 'https://www.sixt.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sixt.com.tr/kampanyalar'] },
  { name: 'Garenta', websiteUrl: 'https://www.garenta.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.garenta.com.tr/kampanyalar'] },
  { name: 'Yolcu360', websiteUrl: 'https://yolcu360.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://yolcu360.com/kampanyalar'] },
  { name: 'Martı', websiteUrl: 'https://www.marti.tech', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marti.tech/'] },
  { name: 'Bitaksi', websiteUrl: 'https://bitaksi.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://bitaksi.com/'] },
  { name: 'İBB Şehir Hatları', websiteUrl: 'https://www.sehirhatlari.istanbul', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sehirhatlari.istanbul/'] },
  { name: 'İDO', websiteUrl: 'https://www.ido.com.tr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ido.com.tr/kampanyalar'] },

  // ═══════════════════════════════════════════════════════
  // 5) Otomobil
  // ═══════════════════════════════════════════════════════
  { name: 'Renault', websiteUrl: 'https://www.renault.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.renault.com.tr/kampanyalar'] },
  { name: 'Toyota', websiteUrl: 'https://www.toyota.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.tr/kampanyalar'] },
  { name: 'Volkswagen', websiteUrl: 'https://www.vw.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.vw.com.tr/kampanyalar'] },
  { name: 'Hyundai', websiteUrl: 'https://www.hyundai.com/tr/tr', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/tr/tr/kampanyalar'] },
  { name: 'Fiat', websiteUrl: 'https://www.fiat.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.com.tr/kampanyalar'] },
  { name: 'Ford', websiteUrl: 'https://www.ford.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.ford.com.tr/kampanyalar'] },
  { name: 'Opel', websiteUrl: 'https://www.opel.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.opel.com.tr/kampanyalar'] },
  { name: 'Peugeot', websiteUrl: 'https://www.peugeot.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.tr/kampanyalar'] },
  { name: 'Citroen', websiteUrl: 'https://www.citroen.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.com.tr/kampanyalar'] },
  { name: 'Dacia', websiteUrl: 'https://www.dacia.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.dacia.com.tr/kampanyalar'] },
  { name: 'Honda', websiteUrl: 'https://www.honda.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.tr/otomobil/kampanyalar'] },
  { name: 'Skoda', websiteUrl: 'https://www.skoda.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.com.tr/kampanyalar'] },
  { name: 'Seat', websiteUrl: 'https://www.seat.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.seat.com.tr/kampanyalar'] },
  { name: 'Audi', websiteUrl: 'https://www.audi.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.tr/kampanyalar'] },
  { name: 'BMW', websiteUrl: 'https://www.bmw.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.tr/kampanyalar'] },
  { name: 'Mercedes-Benz', websiteUrl: 'https://www.mercedes-benz.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.tr/kampanyalar'] },
  { name: 'Volvo', websiteUrl: 'https://www.volvocars.com/tr', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/tr/kampanyalar'] },
  { name: 'Nissan', websiteUrl: 'https://www.nissan.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.tr/kampanyalar'] },
  { name: 'Kia', websiteUrl: 'https://www.kia.com/tr', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/tr/kampanyalar'] },
  { name: 'Chery', websiteUrl: 'https://www.cherytr.com', categorySlug: 'otomobil', seedUrls: ['https://www.cherytr.com/kampanyalar'] },
  { name: 'MG', websiteUrl: 'https://www.mgmotor.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.com.tr/kampanyalar'] },
  { name: 'BYD', websiteUrl: 'https://www.bydauto.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.bydauto.com.tr/kampanyalar'] },
  { name: 'Otokoç', websiteUrl: 'https://www.otokoc.com.tr', categorySlug: 'otomobil', seedUrls: ['https://www.otokoc.com.tr/kampanyalar'] },
  { name: 'Arabam.com', websiteUrl: 'https://www.arabam.com', categorySlug: 'otomobil', seedUrls: ['https://www.arabam.com/kampanyalar'] },
  { name: 'Otoshops', websiteUrl: 'https://www.otoshops.com', categorySlug: 'otomobil', seedUrls: ['https://www.otoshops.com/kampanyalar'] },

  // ═══════════════════════════════════════════════════════
  // 6) Finans
  // ═══════════════════════════════════════════════════════
  { name: 'Ziraat Bankası', websiteUrl: 'https://www.ziraatbank.com.tr', categorySlug: 'finans', seedUrls: ['https://www.ziraatbank.com.tr/kampanyalar'] },
  { name: 'İş Bankası', websiteUrl: 'https://www.isbank.com.tr', categorySlug: 'finans', seedUrls: ['https://www.isbank.com.tr/kampanyalar', 'https://www.maximum.com.tr/kampanyalar'] },
  { name: 'Garanti BBVA', websiteUrl: 'https://www.garantibbva.com.tr', categorySlug: 'finans', seedUrls: ['https://www.garantibbva.com.tr/kampanyalar', 'https://www.bonus.com.tr/kampanyalar'] },
  { name: 'Akbank', websiteUrl: 'https://www.akbank.com', categorySlug: 'finans', seedUrls: ['https://www.akbank.com/kampanyalar', 'https://www.axess.com.tr/kampanyalar'] },
  { name: 'Yapı Kredi', websiteUrl: 'https://www.yapikredi.com.tr', categorySlug: 'finans', seedUrls: ['https://www.yapikredi.com.tr/kampanyalar', 'https://www.worldcard.com.tr/kampanyalar'] },
  { name: 'QNB Finansbank', websiteUrl: 'https://www.qnb.com.tr', categorySlug: 'finans', seedUrls: ['https://www.qnb.com.tr/kampanyalar', 'https://www.enpara.com/kampanyalar'] },
  { name: 'Halkbank', websiteUrl: 'https://www.halkbank.com.tr', categorySlug: 'finans', seedUrls: ['https://www.halkbank.com.tr/kampanyalar'] },
  { name: 'DenizBank', websiteUrl: 'https://www.denizbank.com', categorySlug: 'finans', seedUrls: ['https://www.denizbank.com/kampanyalar'] },
  { name: 'ING', websiteUrl: 'https://www.ing.com.tr', categorySlug: 'finans', seedUrls: ['https://www.ing.com.tr/kampanyalar'] },
  { name: 'Kuveyt Türk', websiteUrl: 'https://www.kuveytturk.com.tr', categorySlug: 'finans', seedUrls: ['https://www.kuveytturk.com.tr/kampanyalar'] },
  { name: 'Albaraka Türk', websiteUrl: 'https://www.albaraka.com.tr', categorySlug: 'finans', seedUrls: ['https://www.albaraka.com.tr/kampanyalar'] },
  { name: 'TEB', websiteUrl: 'https://www.teb.com.tr', categorySlug: 'finans', seedUrls: ['https://www.teb.com.tr/kampanyalar'] },
  { name: 'Tosla', websiteUrl: 'https://www.tosla.com', categorySlug: 'finans', seedUrls: ['https://www.tosla.com/kampanyalar'] },
  { name: 'Paycell', websiteUrl: 'https://www.paycell.com.tr', categorySlug: 'finans', seedUrls: ['https://www.paycell.com.tr/kampanyalar'] },
  { name: 'BKM Express', websiteUrl: 'https://www.bkmexpress.com.tr', categorySlug: 'finans', seedUrls: ['https://www.bkmexpress.com.tr/kampanyalar'] },
  { name: 'HangiKredi', websiteUrl: 'https://www.hangikredi.com', categorySlug: 'finans', seedUrls: ['https://www.hangikredi.com/kampanyalar'] },
  { name: 'Hesapkurdu', websiteUrl: 'https://www.hesapkurdu.com', categorySlug: 'finans', seedUrls: ['https://www.hesapkurdu.com/kampanyalar'] },

  // ═══════════════════════════════════════════════════════
  // 7) Gıda & Market
  // ═══════════════════════════════════════════════════════
  { name: 'Migros', websiteUrl: 'https://www.migros.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.migros.com.tr/kampanyalar'] },
  { name: 'CarrefourSA', websiteUrl: 'https://www.carrefoursa.com', categorySlug: 'gida-market', seedUrls: ['https://www.carrefoursa.com/kampanyalar'] },
  { name: 'A101', websiteUrl: 'https://www.a101.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.a101.com.tr/'] },
  { name: 'ŞOK', websiteUrl: 'https://www.sokmarket.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.sokmarket.com.tr/'] },
  { name: 'BİM', websiteUrl: 'https://www.bim.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.bim.com.tr/'] },
  { name: 'Metro Market', websiteUrl: 'https://www.metro-tr.com', categorySlug: 'gida-market', seedUrls: ['https://www.metro-tr.com/kampanyalar'] },
  { name: 'Happy Center', websiteUrl: 'https://www.happycenter.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.happycenter.com.tr/kampanyalar'] },
  { name: 'Onur Market', websiteUrl: 'https://www.onurmarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.onurmarket.com/kampanyalar'] },
  { name: 'Bizim Toptan', websiteUrl: 'https://www.bizimtoptan.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.bizimtoptan.com.tr/kampanyalar'] },
  { name: 'File Market', websiteUrl: 'https://www.file.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.file.com.tr/kampanyalar'] },
  { name: 'Banabi', websiteUrl: 'https://www.banabi.com', categorySlug: 'gida-market', seedUrls: ['https://www.banabi.com/kampanyalar'] },
  { name: 'Tazedirekt', websiteUrl: 'https://www.tazedirekt.com', categorySlug: 'gida-market', seedUrls: ['https://www.tazedirekt.com/kampanyalar'] },
  { name: 'Macrocenter', websiteUrl: 'https://www.macrocenter.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.macrocenter.com.tr/kampanyalar'] },
  { name: 'Pınar Online', websiteUrl: 'https://www.pinaronline.com', categorySlug: 'gida-market', seedUrls: ['https://www.pinaronline.com/kampanyalar'] },
  { name: 'Ülker', websiteUrl: 'https://www.ulker.com.tr', categorySlug: 'gida-market', seedUrls: ['https://www.ulker.com.tr/kampanyalar'] },
  { name: 'Eti', websiteUrl: 'https://www.etietieti.com', categorySlug: 'gida-market', seedUrls: ['https://www.etietieti.com/kampanyalar'] },
  { name: 'Coca-Cola', websiteUrl: 'https://www.coca-colaturkiye.com', categorySlug: 'gida-market', seedUrls: ['https://www.coca-colaturkiye.com/kampanyalar'] },

  // ═══════════════════════════════════════════════════════
  // 8) Ev & Yaşam
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA', websiteUrl: 'https://www.ikea.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com.tr/kampanyalar'] },
  { name: 'Koçtaş', websiteUrl: 'https://www.koctas.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.koctas.com.tr/kampanyalar'] },
  { name: 'Bauhaus', websiteUrl: 'https://www.bauhaus.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.bauhaus.com.tr/kampanyalar'] },
  { name: 'Tekzen', websiteUrl: 'https://www.tekzen.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.tekzen.com.tr/kampanyalar'] },
  { name: 'Vivense', websiteUrl: 'https://www.vivense.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.vivense.com/kampanya'] },
  { name: 'Bellona', websiteUrl: 'https://www.bellona.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.bellona.com.tr/kampanyalar'] },
  { name: 'İstikbal', websiteUrl: 'https://www.istikbal.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.istikbal.com.tr/kampanyalar'] },
  { name: 'Doğtaş', websiteUrl: 'https://www.dogtas.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.dogtas.com/kampanyalar'] },
  { name: 'Kelebek', websiteUrl: 'https://www.kelebek.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.kelebek.com/kampanyalar'] },
  { name: 'English Home', websiteUrl: 'https://www.englishhome.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.englishhome.com/kampanyalar'] },
  { name: 'Madame Coco', websiteUrl: 'https://www.madamecoco.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.madamecoco.com/kampanyalar'] },
  { name: 'Karaca', websiteUrl: 'https://www.karaca.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.karaca.com/kampanyalar'] },
  { name: 'Taç', websiteUrl: 'https://www.tac.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.tac.com.tr/kampanyalar'] },
  { name: 'Emsan', websiteUrl: 'https://www.emsan.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.emsan.com.tr/kampanyalar'] },
  { name: 'Linens', websiteUrl: 'https://www.linens.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.linens.com.tr/kampanyalar'] },
  { name: 'Paşabahçe', websiteUrl: 'https://www.pasabahce.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.pasabahce.com/kampanyalar'] },
  { name: 'Bernardo', websiteUrl: 'https://www.bernardo.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.bernardo.com.tr/kampanyalar'] },
  { name: 'Porland', websiteUrl: 'https://www.porland.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.porland.com.tr/kampanyalar'] },
  { name: 'Arzum', websiteUrl: 'https://www.arzum.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.arzum.com.tr/kampanyalar'] },
  { name: 'Fakir', websiteUrl: 'https://www.fakir.com.tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.fakir.com.tr/kampanyalar'] },
  { name: 'Karcher', websiteUrl: 'https://www.kaercher.com/tr', categorySlug: 'ev-yasam', seedUrls: ['https://www.kaercher.com/tr/kampanyalar'] },

  // ═══════════════════════════════════════════════════════
  // 9) Kozmetik & Kişisel Bakım
  // ═══════════════════════════════════════════════════════
  { name: 'Sephora', websiteUrl: 'https://www.sephora.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.com.tr/kampanyalar'] },
  { name: 'Gratis', websiteUrl: 'https://www.gratis.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.gratis.com/kampanyalar'] },
  { name: 'Watsons', websiteUrl: 'https://www.watsons.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.watsons.com.tr/kampanyalar'] },
  { name: 'Rossmann', websiteUrl: 'https://www.rossmann.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rossmann.com.tr/kampanyalar'] },
  { name: 'Yves Rocher', websiteUrl: 'https://www.yvesrocher.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yvesrocher.com.tr/kampanyalar'] },
  { name: 'Flormar', websiteUrl: 'https://www.flormar.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.flormar.com.tr/kampanyalar'] },
  { name: 'Golden Rose', websiteUrl: 'https://www.goldenrose.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.goldenrose.com.tr/kampanyalar'] },
  { name: 'Farmasi', websiteUrl: 'https://www.farmasi.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmasi.com.tr/kampanyalar'] },
  { name: 'Avon', websiteUrl: 'https://www.avon.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avon.com.tr/kampanyalar'] },
  { name: 'Oriflame', websiteUrl: 'https://www.oriflame.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.oriflame.com.tr/kampanyalar'] },
  { name: "L'Occitane", websiteUrl: 'https://tr.loccitane.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://tr.loccitane.com/kampanyalar'] },
  { name: 'The Body Shop', websiteUrl: 'https://www.thebodyshop.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com.tr/kampanyalar'] },
  { name: 'Estee Lauder', websiteUrl: 'https://www.esteelauder.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.tr/kampanyalar'] },
  { name: 'Clinique', websiteUrl: 'https://www.clinique.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.tr/kampanyalar'] },
  { name: 'Nivea', websiteUrl: 'https://www.nivea.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.com.tr/kampanyalar'] },
  { name: "L'Oreal", websiteUrl: 'https://www.lorealparis.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lorealparis.com.tr/kampanyalar'] },
  { name: 'MAC', websiteUrl: 'https://www.maccosmetics.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.tr/kampanyalar'] },
  { name: 'Bioderma', websiteUrl: 'https://www.bioderma.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.com.tr/kampanyalar'] },
  { name: 'Vichy', websiteUrl: 'https://www.vichy.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.com.tr/kampanyalar'] },
  { name: 'La Roche Posay', websiteUrl: 'https://www.larocheposay.com.tr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.larocheposay.com.tr/kampanyalar'] },
  { name: 'Eyüp Sabri Tuncer', websiteUrl: 'https://www.eyupsabrituncer.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eyupsabrituncer.com/kampanyalar'] },

  // ═══════════════════════════════════════════════════════
  // 10) Spor & Outdoor
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon', websiteUrl: 'https://www.decathlon.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.com.tr/kampanyalar'] },
  { name: 'Under Armour', websiteUrl: 'https://www.underarmour.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.tr/kampanyalar'] },
  { name: 'Skechers', websiteUrl: 'https://www.skechers.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.tr/kampanyalar'] },
  { name: 'New Balance', websiteUrl: 'https://www.newbalance.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.tr/kampanyalar'] },
  { name: 'Columbia', websiteUrl: 'https://www.columbia.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.com.tr/kampanyalar'] },
  { name: 'The North Face', websiteUrl: 'https://www.thenorthface.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.tr/kampanyalar'] },
  { name: 'Salomon', websiteUrl: 'https://www.salomon.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com.tr/kampanyalar'] },
  { name: 'Intersport', websiteUrl: 'https://www.intersport.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.com.tr/kampanyalar'] },
  { name: 'Sportive', websiteUrl: 'https://www.sportive.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportive.com.tr/kampanyalar'] },
  { name: 'Lescon', websiteUrl: 'https://www.lescon.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lescon.com.tr/kampanyalar'] },
  { name: 'Hummel', websiteUrl: 'https://www.hummel.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hummel.com.tr/kampanyalar'] },
  { name: 'Slazenger', websiteUrl: 'https://www.slazenger.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.slazenger.com.tr/kampanyalar'] },
  { name: 'Asics', websiteUrl: 'https://www.asics.com/tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/tr/tr-tr/kampanyalar'] },
  { name: 'Jack Wolfskin', websiteUrl: 'https://www.jack-wolfskin.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jack-wolfskin.com.tr/kampanyalar'] },
  { name: 'Merrell', websiteUrl: 'https://www.merrell.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.com.tr/kampanyalar'] },
  { name: 'Timberland', websiteUrl: 'https://www.timberland.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.com.tr/kampanyalar'] },
  { name: 'Fenerium', websiteUrl: 'https://www.fenerium.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fenerium.com/kampanyalar'] },
  { name: 'GS Store', websiteUrl: 'https://www.gsstore.org', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gsstore.org/kampanyalar'] },
  { name: 'Kartal Yuvası', websiteUrl: 'https://www.kartalyuvasi.com.tr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.kartalyuvasi.com.tr/kampanyalar'] },
  { name: 'Korayspor', websiteUrl: 'https://www.korayspor.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.korayspor.com/kampanyalar'] },

  // ═══════════════════════════════════════════════════════
  // 11) Kitap & Hobi
  // ═══════════════════════════════════════════════════════
  { name: 'D&R', websiteUrl: 'https://www.dr.com.tr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dr.com.tr/kampanyalar'] },
  { name: 'İdefix', websiteUrl: 'https://www.idefix.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.idefix.com/kampanyalar'] },
  { name: 'Kitapyurdu', websiteUrl: 'https://www.kitapyurdu.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kitapyurdu.com/index.php?route=product/special'] },
  { name: 'BKM Kitap', websiteUrl: 'https://www.bkmkitap.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bkmkitap.com/kampanyalar'] },
  { name: 'Toyzz Shop', websiteUrl: 'https://www.toyzzshop.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toyzzshop.com/kampanyalar'] },
  { name: 'Lego', websiteUrl: 'https://www.lego.com/tr-tr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/tr-tr/offers'] },

  // ═══════════════════════════════════════════════════════
  // 12) Yeme & İçme
  // ═══════════════════════════════════════════════════════
  { name: "McDonald's", websiteUrl: 'https://www.mcdonalds.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com.tr/kampanyalar'] },
  { name: 'Burger King', websiteUrl: 'https://www.burgerking.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.tr/kampanyalar'] },
  { name: 'KFC', websiteUrl: 'https://www.kfcturkiye.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfcturkiye.com/kampanyalar'] },
  { name: 'Popeyes', websiteUrl: 'https://www.popeyes.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.popeyes.com.tr/kampanyalar'] },
  { name: "Arby's", websiteUrl: 'https://www.arbys.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.arbys.com.tr/kampanyalar'] },
  { name: "Domino's", websiteUrl: 'https://www.dominos.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.tr/kampanyalar'] },
  { name: 'Pizza Hut', websiteUrl: 'https://www.pizzahut.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.tr/kampanyalar'] },
  { name: 'Little Caesars', websiteUrl: 'https://www.littlecaesars.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.littlecaesars.com.tr/kampanyalar'] },
  { name: 'Tavuk Dünyası', websiteUrl: 'https://www.tavukdunyasi.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.tavukdunyasi.com/kampanyalar'] },
  { name: 'Baydöner', websiteUrl: 'https://www.baydoner.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.baydoner.com/kampanyalar'] },
  { name: 'Köfteci Yusuf', websiteUrl: 'https://www.kofteciyusuf.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kofteciyusuf.com/kampanyalar'] },
  { name: 'Simit Sarayı', websiteUrl: 'https://www.simitsarayi.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.simitsarayi.com/kampanyalar'] },
  { name: 'Starbucks', websiteUrl: 'https://www.starbucks.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.tr/kampanyalar'] },
  { name: 'Kahve Dünyası', websiteUrl: 'https://www.kahvedunyasi.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kahvedunyasi.com/kampanyalar'] },
  { name: 'Yemeksepeti', websiteUrl: 'https://www.yemeksepeti.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.yemeksepeti.com/kampanyalar'] },
  { name: 'Subway', websiteUrl: 'https://www.subway.com.tr', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com.tr/kampanyalar'] },

  // ═══════════════════════════════════════════════════════
  // 13) Sigorta
  // ═══════════════════════════════════════════════════════
  { name: 'Allianz Sigorta', websiteUrl: 'https://www.allianz.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.com.tr/tr_TR/faaliyetlerimiz/kampanyalar.html'] },
  { name: 'Anadolu Sigorta', websiteUrl: 'https://www.anadolusigorta.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.anadolusigorta.com.tr/kampanyalar-firsatlar'] },
  { name: 'Aksigorta', websiteUrl: 'https://www.aksigorta.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.aksigorta.com.tr/ayricaliklar'] },
  { name: 'AXA Sigorta', websiteUrl: 'https://www.axasigorta.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.axasigorta.com.tr/kampanyalar'] },
  { name: 'Türkiye Sigorta', websiteUrl: 'https://www.turkiyesigorta.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.turkiyesigorta.com.tr/aktif-kampanyalar', 'https://www.turkiyesigorta.com.tr/hakkimizda/kurumsal-iletisim/kampanya-duyurulari'] },
  { name: 'MAPFRE Sigorta', websiteUrl: 'https://www.mapfre.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.mapfre.com.tr/sigorta-tr/iletisim/kampanya-ve-duyurular/'] },
  { name: 'Sompo Sigorta', websiteUrl: 'https://www.somposigorta.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.somposigorta.com.tr/kampanyalar'] },
  { name: 'HDI Sigorta', websiteUrl: 'https://www.hdisigorta.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.hdisigorta.com.tr/kampanyalar'] },
  { name: 'Quick Sigorta', websiteUrl: 'https://quicksigorta.com', categorySlug: 'sigorta', seedUrls: ['https://quicksigorta.com/kampanyalar'] },
  { name: 'Doğa Sigorta', websiteUrl: 'https://www.dogasigorta.com', categorySlug: 'sigorta', seedUrls: ['https://www.dogasigorta.com/sigortali-sadakat-programi'] },
  { name: 'GIG Sigorta', websiteUrl: 'https://www.gig.com.tr', categorySlug: 'sigorta', seedUrls: ['https://www.gig.com.tr/hakkimizda/bizden-haberler/kampanyalar'] },
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
  console.log('=== Marka Ekleme Scripti ===\n');

  // 1. Upsert new categories
  for (const cat of NEW_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Load all categories into a slug→id map
  const allCats = await prisma.category.findMany();
  const categoryMap = new Map<string, string>();
  for (const c of allCats) {
    categoryMap.set(c.slug, c.id);
  }
  console.log(`Kategoriler hazır: ${categoryMap.size} adet\n`);

  // 2. Deduplicate
  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Toplam marka: ${uniqueBrands.length} (${BRANDS.length - uniqueBrands.length} duplike atlandı)\n`);

  // 3. Process brands + sources
  let brandsOk = 0, sourcesCreated = 0, sourcesUpdated = 0, errors = 0;

  for (const entry of uniqueBrands) {
    const slug = toSlug(entry.name);
    const categoryId = categoryMap.get(entry.categorySlug) ?? null;

    try {
      // Try to find existing brand by name first (handles slug changes)
      let brand = await prisma.brand.findFirst({ where: { name: entry.name } });
      if (brand) {
        brand = await prisma.brand.update({
          where: { id: brand.id },
          data: { slug, categoryId, websiteUrl: entry.websiteUrl },
        });
      } else {
        brand = await prisma.brand.upsert({
          where: { slug },
          update: { name: entry.name, categoryId, websiteUrl: entry.websiteUrl },
          create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, categoryId },
        });
      }

      // Check if source already exists
      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, crawlMethod: CrawlMethod.HTML },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Kampanyalar`,
            crawlMethod: CrawlMethod.HTML,
            seedUrls: entry.seedUrls,
            maxDepth: 1,
            schedule: '0 3 * * *',
            agingDays: 7,
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls },
          });
          sourcesUpdated++;
        }
      }

      brandsOk++;
      if (brandsOk % 50 === 0) console.log(`  İşlenen: ${brandsOk}/${uniqueBrands.length}`);
    } catch (err) {
      console.error(`  HATA: ${entry.name} (${slug}) — ${(err as Error).message}`);
      errors++;
    }
  }

  console.log(`\n=== Özet ===`);
  console.log(`Markalar:         ${brandsOk} başarılı, ${errors} hata`);
  console.log(`Yeni kaynaklar:   ${sourcesCreated}`);
  console.log(`Güncellenen:      ${sourcesUpdated}`);

  // 4. Summary of all sources
  const totalSources = await prisma.crawlSource.count({ where: { isActive: true } });
  console.log(`Toplam aktif kaynak: ${totalSources}`);
  console.log('\nBitti! Crawl tetiklemek için: POST /admin/crawl/trigger-all');
}

main()
  .catch((e) => { console.error('Script hatası:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
