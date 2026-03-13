import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/Ğ/g, 'g').replace(/Ü/g, 'u').replace(/Ş/g, 's')
    .replace(/İ/g, 'i').replace(/Ö/g, 'o').replace(/Ç/g, 'c')
    .replace(/&/g, 've')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface BrandEntry {
  name: string;
  websiteUrl: string;
  categorySlug: string;
  seedUrls: string[];
}

// ══════════════════════════════════════════════════════════════
// ~130 NEW popular Turkish brands — NOT in the existing TR list
// ══════════════════════════════════════════════════════════════
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'GittiGidiyor',
    websiteUrl: 'https://www.gittigidiyor.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.gittigidiyor.com/kampanyalar',
      'https://www.gittigidiyor.com/indirimler',
    ],
  },
  {
    name: 'Dolap',
    websiteUrl: 'https://www.dolap.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.dolap.com/kampanyalar',
      'https://www.dolap.com/indirimler',
    ],
  },
  {
    name: 'Modanisa',
    websiteUrl: 'https://www.modanisa.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.modanisa.com/kampanyalar.html',
      'https://www.modanisa.com/indirimler.html',
    ],
  },
  {
    name: 'Lidyana',
    websiteUrl: 'https://www.lidyana.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.lidyana.com/kampanyalar',
      'https://www.lidyana.com/indirimler',
    ],
  },
  {
    name: 'Sahibinden',
    websiteUrl: 'https://www.sahibinden.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.sahibinden.com/kampanyalar',
    ],
  },
  {
    name: 'Kasaba',
    websiteUrl: 'https://www.kasaba.com.tr',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.kasaba.com.tr/kampanyalar',
    ],
  },
  {
    name: 'ePttAVM',
    websiteUrl: 'https://www.epttavm.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.epttavm.com/kampanyalar',
      'https://www.epttavm.com/firsatlar',
    ],
  },
  {
    name: 'Akakçe',
    websiteUrl: 'https://www.akakce.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.akakce.com/kampanyalar',
      'https://www.akakce.com/firsatlar',
    ],
  },
  {
    name: 'Cimri',
    websiteUrl: 'https://www.cimri.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.cimri.com/kampanyalar',
      'https://www.cimri.com/firsatlar',
    ],
  },
  {
    name: 'Hızlı Ali',
    websiteUrl: 'https://www.hizlial.com',
    categorySlug: 'alisveris',
    seedUrls: [
      'https://www.hizlial.com/kampanyalar',
      'https://www.hizlial.com/indirimler',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Oppo',
    websiteUrl: 'https://www.oppo.com/tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.oppo.com/tr/campaign/',
      'https://www.oppo.com/tr/smartphones/promotion/',
    ],
  },
  {
    name: 'Sony Türkiye',
    websiteUrl: 'https://www.sony.com.tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.sony.com.tr/kampanyalar',
      'https://www.sony.com.tr/promosyonlar',
    ],
  },
  {
    name: 'LG Türkiye',
    websiteUrl: 'https://www.lg.com/tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.lg.com/tr/kampanyalar/',
      'https://www.lg.com/tr/promosyonlar/',
    ],
  },
  {
    name: 'Dell Türkiye',
    websiteUrl: 'https://www.dell.com/tr-tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.dell.com/tr-tr/shop/deals',
      'https://www.dell.com/tr-tr/shop/kampanyalar',
    ],
  },
  {
    name: 'Microsoft Store TR',
    websiteUrl: 'https://www.microsoft.com/tr-tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.microsoft.com/tr-tr/store/b/sale',
      'https://www.microsoft.com/tr-tr/store/collections/pcsales',
    ],
  },
  {
    name: 'Honor Türkiye',
    websiteUrl: 'https://www.honor.com/tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.honor.com/tr/campaign/',
      'https://www.honor.com/tr/offer/',
    ],
  },
  {
    name: 'Realme Türkiye',
    websiteUrl: 'https://www.realme.com/tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.realme.com/tr/campaign',
      'https://www.realme.com/tr/deal',
    ],
  },
  {
    name: 'Epson Türkiye',
    websiteUrl: 'https://www.epson.com.tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.epson.com.tr/kampanyalar',
      'https://www.epson.com.tr/promosyonlar',
    ],
  },
  {
    name: 'OnePlus Türkiye',
    websiteUrl: 'https://www.oneplus.com/tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.oneplus.com/tr/offer',
    ],
  },
  {
    name: 'Electrolux Türkiye',
    websiteUrl: 'https://www.electrolux.com.tr',
    categorySlug: 'elektronik',
    seedUrls: [
      'https://www.electrolux.com.tr/kampanyalar/',
      'https://www.electrolux.com.tr/promosyonlar/',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Collezione',
    websiteUrl: 'https://www.collezione.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.collezione.com/kampanyalar',
      'https://www.collezione.com/indirimler',
    ],
  },
  {
    name: 'Hotiç',
    websiteUrl: 'https://www.hotic.com.tr',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.hotic.com.tr/kampanyalar',
      'https://www.hotic.com.tr/indirim',
    ],
  },
  {
    name: 'Kemal Tanca',
    websiteUrl: 'https://www.kemaltanca.com.tr',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.kemaltanca.com.tr/kampanyalar',
      'https://www.kemaltanca.com.tr/indirimli-urunler',
    ],
  },
  {
    name: 'Oxxo',
    websiteUrl: 'https://www.oxxo.com.tr',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.oxxo.com.tr/kampanyalar',
      'https://www.oxxo.com.tr/outlet',
    ],
  },
  {
    name: 'Gizia',
    websiteUrl: 'https://www.gizia.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.gizia.com/kampanyalar',
      'https://www.gizia.com/outlet',
    ],
  },
  {
    name: 'Aker',
    websiteUrl: 'https://www.aker.com.tr',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.aker.com.tr/kampanyalar',
      'https://www.aker.com.tr/firsatlar',
    ],
  },
  {
    name: 'Park Bravo',
    websiteUrl: 'https://www.parkbravo.com',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.parkbravo.com/kampanyalar',
      'https://www.parkbravo.com/indirimler',
    ],
  },
  {
    name: 'Ramsey',
    websiteUrl: 'https://www.ramsey.com.tr',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.ramsey.com.tr/kampanyalar',
      'https://www.ramsey.com.tr/outlet',
    ],
  },
  {
    name: 'Kip',
    websiteUrl: 'https://www.kip.com.tr',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.kip.com.tr/kampanyalar',
      'https://www.kip.com.tr/indirimler',
    ],
  },
  {
    name: 'Derimod',
    websiteUrl: 'https://www.derimod.com.tr',
    categorySlug: 'giyim-moda',
    seedUrls: [
      'https://www.derimod.com.tr/kampanyalar',
      'https://www.derimod.com.tr/indirimli-urunler',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 4) Gıda & Market / Grocery & Market — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Yunus Market',
    websiteUrl: 'https://www.yunusmarket.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.yunusmarket.com.tr/kampanyalar',
      'https://www.yunusmarket.com.tr/indirimler',
    ],
  },
  {
    name: 'Tarım Kredi Kooperatif Market',
    websiteUrl: 'https://www.tarimkredimarket.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.tarimkredimarket.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Kim Market',
    websiteUrl: 'https://www.kimmarket.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.kimmarket.com.tr/kampanyalar',
    ],
  },
  {
    name: 'İyi Geldi',
    websiteUrl: 'https://www.iyigeldi.com',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.iyigeldi.com/kampanyalar',
      'https://www.iyigeldi.com/indirimler',
    ],
  },
  {
    name: 'Hakmar',
    websiteUrl: 'https://www.hakmar.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.hakmar.com.tr/kampanyalar',
      'https://www.hakmar.com.tr/aktuel',
    ],
  },
  {
    name: 'Çağdaş Market',
    websiteUrl: 'https://www.cagdasmarket.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.cagdasmarket.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Başak Market',
    websiteUrl: 'https://www.basakmarket.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.basakmarket.com.tr/kampanyalar',
      'https://www.basakmarket.com.tr/indirimler',
    ],
  },
  {
    name: 'Maxi Market',
    websiteUrl: 'https://www.maximarketler.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.maximarketler.com.tr/kampanyalar',
    ],
  },
  {
    name: 'İtikat',
    websiteUrl: 'https://www.itikat.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.itikat.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Şekerciler Market',
    websiteUrl: 'https://www.sekerciler.com.tr',
    categorySlug: 'gida-market',
    seedUrls: [
      'https://www.sekerciler.com.tr/kampanyalar',
      'https://www.sekerciler.com.tr/indirimler',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Dining — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: "Papa John's TR",
    websiteUrl: 'https://www.papajohns.com.tr',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.papajohns.com.tr/kampanyalar',
      'https://www.papajohns.com.tr/firsatlar',
    ],
  },
  {
    name: 'Çiğköftem',
    websiteUrl: 'https://www.cigkoftem.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.cigkoftem.com/kampanyalar',
    ],
  },
  {
    name: 'Midpoint',
    websiteUrl: 'https://www.midpoint.com.tr',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.midpoint.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Sbarro TR',
    websiteUrl: 'https://www.sbarro.com.tr',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.sbarro.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Usta Dönerci',
    websiteUrl: 'https://www.ustadonerci.com.tr',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.ustadonerci.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Coffy',
    websiteUrl: 'https://www.coffy.com.tr',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.coffy.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Gloria Jeans Coffees TR',
    websiteUrl: 'https://www.gloriajeanscoffees.com.tr',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.gloriajeanscoffees.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Makarnam',
    websiteUrl: 'https://www.makarnam.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.makarnam.com/kampanyalar',
    ],
  },
  {
    name: 'Tostçu Erol',
    websiteUrl: 'https://www.tostcuerol.com.tr',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.tostcuerol.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Benusen',
    websiteUrl: 'https://www.benusen.com',
    categorySlug: 'yeme-icme',
    seedUrls: [
      'https://www.benusen.com/kampanyalar',
      'https://www.benusen.com/firsatlar',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty & Personal Care — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Kiko Milano TR',
    websiteUrl: 'https://www.kikocosmetics.com/tr-tr',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.kikocosmetics.com/tr-tr/kampanyalar.html',
      'https://www.kikocosmetics.com/tr-tr/sale.html',
    ],
  },
  {
    name: 'NYX TR',
    websiteUrl: 'https://www.nyxcosmetics.com.tr',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.nyxcosmetics.com.tr/kampanyalar',
      'https://www.nyxcosmetics.com.tr/indirimler',
    ],
  },
  {
    name: 'Inglot TR',
    websiteUrl: 'https://www.inglot.com.tr',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.inglot.com.tr/kampanyalar',
      'https://www.inglot.com.tr/indirimler',
    ],
  },
  {
    name: 'Dior Beauty TR',
    websiteUrl: 'https://www.dior.com/tr_tr',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.dior.com/tr_tr/beauty/offers.html',
    ],
  },
  {
    name: 'Cosmetica',
    websiteUrl: 'https://www.cosmetica.com.tr',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.cosmetica.com.tr/kampanyalar',
      'https://www.cosmetica.com.tr/firsatlar',
    ],
  },
  {
    name: 'Trendyol Güzellik',
    websiteUrl: 'https://www.trendyol.com/butik/liste/kozmetik',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.trendyol.com/kampanyalar/kozmetik',
      'https://www.trendyol.com/butik/liste/kozmetik-kampanyalari',
    ],
  },
  {
    name: 'Makyaj.com',
    websiteUrl: 'https://www.makyaj.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.makyaj.com/kampanyalar',
      'https://www.makyaj.com/indirimler',
    ],
  },
  {
    name: 'Boyner Fresh',
    websiteUrl: 'https://www.boynerfresh.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.boynerfresh.com/kampanyalar',
    ],
  },
  {
    name: 'Dermoeczanem',
    websiteUrl: 'https://www.dermoeczanem.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.dermoeczanem.com/kampanyalar',
      'https://www.dermoeczanem.com/firsatlar',
    ],
  },
  {
    name: 'Eveshop',
    websiteUrl: 'https://www.eveshop.com.tr',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: [
      'https://www.eveshop.com.tr/kampanyalar',
      'https://www.eveshop.com.tr/indirimler',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Çilek Mobilya',
    websiteUrl: 'https://www.cilek.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.cilek.com/kampanyalar',
      'https://www.cilek.com/firsatlar',
    ],
  },
  {
    name: 'Tepe Home',
    websiteUrl: 'https://www.tepehome.com.tr',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.tepehome.com.tr/kampanyalar',
      'https://www.tepehome.com.tr/indirimler',
    ],
  },
  {
    name: 'Kilim Mobilya',
    websiteUrl: 'https://www.kilfrm.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.kilfrm.com/kampanyalar',
      'https://www.kilfrm.com/firsatlar',
    ],
  },
  {
    name: 'Weltew Home',
    websiteUrl: 'https://www.weltewhome.com.tr',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.weltewhome.com.tr/kampanyalar',
      'https://www.weltewhome.com.tr/firsatlar',
    ],
  },
  {
    name: 'Özdilek',
    websiteUrl: 'https://www.ozdilekteyim.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.ozdilekteyim.com/kampanyalar',
      'https://www.ozdilekteyim.com/indirimler',
    ],
  },
  {
    name: 'Evmanya',
    websiteUrl: 'https://www.evmanya.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.evmanya.com/kampanyalar',
      'https://www.evmanya.com/firsatlar',
    ],
  },
  {
    name: 'Marshall',
    websiteUrl: 'https://www.marshall.com.tr',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.marshall.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Yataş Bedding',
    websiteUrl: 'https://www.yatasbedding.com',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.yatasbedding.com/kampanyalar',
      'https://www.yatasbedding.com/firsatlar',
    ],
  },
  {
    name: 'Alfemo',
    websiteUrl: 'https://www.alfemo.com.tr',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.alfemo.com.tr/kampanyalar',
      'https://www.alfemo.com.tr/firsatlar',
    ],
  },
  {
    name: 'Mondi Mobilya',
    websiteUrl: 'https://www.mondimobilya.com.tr',
    categorySlug: 'ev-yasam',
    seedUrls: [
      'https://www.mondimobilya.com.tr/kampanyalar',
      'https://www.mondimobilya.com.tr/firsatlar',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Reebok TR',
    websiteUrl: 'https://www.reebok.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.reebok.com.tr/kampanyalar',
      'https://www.reebok.com.tr/outlet',
    ],
  },
  {
    name: 'Flo',
    websiteUrl: 'https://www.flo.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.flo.com.tr/kampanyalar',
      'https://www.flo.com.tr/indirimler',
    ],
  },
  {
    name: 'Ayakkabı Dünyası',
    websiteUrl: 'https://www.ayakkabi-dunyasi.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.ayakkabi-dunyasi.com.tr/kampanyalar',
      'https://www.ayakkabi-dunyasi.com.tr/indirimler',
    ],
  },
  {
    name: 'Kinetix',
    websiteUrl: 'https://www.kinetix.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.kinetix.com.tr/kampanyalar',
      'https://www.kinetix.com.tr/indirimler',
    ],
  },
  {
    name: 'Lotto TR',
    websiteUrl: 'https://www.lotto.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.lotto.com.tr/kampanyalar',
      'https://www.lotto.com.tr/indirimler',
    ],
  },
  {
    name: 'Kappa TR',
    websiteUrl: 'https://www.kappa.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.kappa.com.tr/kampanyalar',
      'https://www.kappa.com.tr/indirimler',
    ],
  },
  {
    name: 'Brooks TR',
    websiteUrl: 'https://www.brooksrunning.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.brooksrunning.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Björka Sport',
    websiteUrl: 'https://www.bjorkasport.com',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.bjorkasport.com/kampanyalar',
      'https://www.bjorkasport.com/indirimler',
    ],
  },
  {
    name: 'SPX',
    websiteUrl: 'https://www.spx.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.spx.com.tr/kampanyalar',
      'https://www.spx.com.tr/indirimler',
    ],
  },
  {
    name: 'Superstep',
    websiteUrl: 'https://www.superstep.com.tr',
    categorySlug: 'spor-outdoor',
    seedUrls: [
      'https://www.superstep.com.tr/kampanyalar',
      'https://www.superstep.com.tr/indirimler',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Otel.com',
    websiteUrl: 'https://www.otel.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.otel.com/kampanyalar',
      'https://www.otel.com/firsatlar',
    ],
  },
  {
    name: 'Odamax',
    websiteUrl: 'https://www.odamax.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.odamax.com/kampanyalar',
      'https://www.odamax.com/firsatlar',
    ],
  },
  {
    name: 'Trivago TR',
    websiteUrl: 'https://www.trivago.com.tr',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.trivago.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Skyscanner TR',
    websiteUrl: 'https://www.skyscanner.com.tr',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.skyscanner.com.tr/kampanyalar',
      'https://www.skyscanner.com.tr/firsatlar',
    ],
  },
  {
    name: 'Corendon Airlines',
    websiteUrl: 'https://www.corendonairlines.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.corendonairlines.com/tr/kampanyalar',
      'https://www.corendonairlines.com/tr/firsatlar',
    ],
  },
  {
    name: 'Tailwind Airlines',
    websiteUrl: 'https://www.tailwindairlines.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.tailwindairlines.com/kampanyalar',
    ],
  },
  {
    name: 'HolidayCheck TR',
    websiteUrl: 'https://www.holidaycheck.com.tr',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.holidaycheck.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Otopratik',
    websiteUrl: 'https://www.otopratik.com.tr',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.otopratik.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Onur Air',
    websiteUrl: 'https://www.onurair.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.onurair.com/kampanyalar',
      'https://www.onurair.com/firsatlar',
    ],
  },
  {
    name: 'Etstur',
    websiteUrl: 'https://www.etstur.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: [
      'https://www.etstur.com/kampanyalar',
      'https://www.etstur.com/firsatlar',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 10) Finans / Finance — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Enpara',
    websiteUrl: 'https://www.enpara.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.enpara.com/kampanyalar',
      'https://www.enpara.com/firsatlar',
    ],
  },
  {
    name: 'Papara',
    websiteUrl: 'https://www.papara.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.papara.com/kampanyalar',
      'https://www.papara.com/blog/kampanyalar',
    ],
  },
  {
    name: 'İninal',
    websiteUrl: 'https://www.ininal.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.ininal.com/kampanyalar',
    ],
  },
  {
    name: 'Vakıfbank',
    websiteUrl: 'https://www.vakifbank.com.tr',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.vakifbank.com.tr/kampanyalar.aspx',
      'https://www.vakifbank.com.tr/bireysel-kampanyalar.aspx',
    ],
  },
  {
    name: 'Fibabanka',
    websiteUrl: 'https://www.fibabanka.com.tr',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.fibabanka.com.tr/kampanyalar',
    ],
  },
  {
    name: 'HSBC TR',
    websiteUrl: 'https://www.hsbc.com.tr',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.hsbc.com.tr/kampanyalar',
      'https://www.hsbc.com.tr/guncel-kampanyalar',
    ],
  },
  {
    name: 'Odeabank',
    websiteUrl: 'https://www.odeabank.com.tr',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.odeabank.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Moka',
    websiteUrl: 'https://www.moka.com',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.moka.com/kampanyalar',
    ],
  },
  {
    name: 'Türkiye Finans',
    websiteUrl: 'https://www.turkiyefinans.com.tr',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.turkiyefinans.com.tr/tr-tr/kampanyalar',
      'https://www.turkiyefinans.com.tr/tr-tr/bireysel/kampanyalar',
    ],
  },
  {
    name: 'Şekerbank',
    websiteUrl: 'https://www.sekerbank.com.tr',
    categorySlug: 'finans',
    seedUrls: [
      'https://www.sekerbank.com.tr/kampanyalar',
      'https://www.sekerbank.com.tr/bireysel/kampanyalar',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Bereket Sigorta',
    websiteUrl: 'https://www.bereketsig.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.bereketsig.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Güneş Sigorta',
    websiteUrl: 'https://www.gunessigorta.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.gunessigorta.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Ray Sigorta',
    websiteUrl: 'https://www.raysigorta.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.raysigorta.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Zurich Sigorta TR',
    websiteUrl: 'https://www.zurich.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.zurich.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Ankara Sigorta',
    websiteUrl: 'https://www.ankarasigorta.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.ankarasigorta.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Unico Sigorta',
    websiteUrl: 'https://www.unicosigorta.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.unicosigorta.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Hepiyi Sigorta',
    websiteUrl: 'https://www.hepiyisigorta.com',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.hepiyisigorta.com/kampanyalar',
    ],
  },
  {
    name: 'Neova Sigorta',
    websiteUrl: 'https://www.neovasigorta.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.neovasigorta.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Groupama Sigorta',
    websiteUrl: 'https://www.groupama.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.groupama.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Eureko Sigorta',
    websiteUrl: 'https://www.eurekosigorta.com.tr',
    categorySlug: 'sigorta',
    seedUrls: [
      'https://www.eurekosigorta.com.tr/kampanyalar',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Togg',
    websiteUrl: 'https://www.togg.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.togg.com.tr/kampanyalar',
      'https://www.togg.com.tr/firsatlar',
    ],
  },
  {
    name: 'Mitsubishi TR',
    websiteUrl: 'https://www.mitsubishi-motors.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.mitsubishi-motors.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Suzuki TR',
    websiteUrl: 'https://www.suzuki.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.suzuki.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Mazda TR',
    websiteUrl: 'https://www.mazda.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.mazda.com.tr/kampanyalar',
      'https://www.mazda.com.tr/teklifler',
    ],
  },
  {
    name: 'Cupra TR',
    websiteUrl: 'https://www.cupraofficial.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.cupraofficial.com.tr/kampanyalar',
    ],
  },
  {
    name: 'Mini TR',
    websiteUrl: 'https://www.mini.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.mini.com.tr/kampanyalar.html',
    ],
  },
  {
    name: 'Porsche TR',
    websiteUrl: 'https://www.porsche.com/turkey',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.porsche.com/turkey/kampanyalar/',
    ],
  },
  {
    name: 'Jaguar TR',
    websiteUrl: 'https://www.jaguar.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.jaguar.com.tr/kampanyalar.html',
    ],
  },
  {
    name: 'Land Rover TR',
    websiteUrl: 'https://www.landrover.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.landrover.com.tr/kampanyalar.html',
    ],
  },
  {
    name: 'Subaru TR',
    websiteUrl: 'https://www.subaru.com.tr',
    categorySlug: 'otomobil',
    seedUrls: [
      'https://www.subaru.com.tr/kampanyalar',
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 10 brands
  // ═══════════════════════════════════════════════════════════
  {
    name: 'Epsilon Yayınevi',
    websiteUrl: 'https://www.epsilonyayinevi.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.epsilonyayinevi.com/kampanyalar',
      'https://www.epsilonyayinevi.com/indirimli-kitaplar',
    ],
  },
  {
    name: 'Can Yayınları',
    websiteUrl: 'https://www.canyayinlari.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.canyayinlari.com/kampanyalar',
      'https://www.canyayinlari.com/indirimli-kitaplar',
    ],
  },
  {
    name: 'Yapı Kredi Yayınları',
    websiteUrl: 'https://www.yapikrediyayinlari.com.tr',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.yapikrediyayinlari.com.tr/kampanyalar',
      'https://www.yapikrediyayinlari.com.tr/firsatlar',
    ],
  },
  {
    name: 'İlknokta',
    websiteUrl: 'https://www.ilknokta.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.ilknokta.com/kampanyalar',
      'https://www.ilknokta.com/indirimler',
    ],
  },
  {
    name: 'Remzi Kitabevi',
    websiteUrl: 'https://www.remzi.com.tr',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.remzi.com.tr/kampanyalar',
      'https://www.remzi.com.tr/indirimli-kitaplar',
    ],
  },
  {
    name: 'Pandora Kitabevi',
    websiteUrl: 'https://www.pandora.com.tr',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.pandora.com.tr/kampanyalar',
      'https://www.pandora.com.tr/firsatlar',
    ],
  },
  {
    name: 'Arkadaş Yayınevi',
    websiteUrl: 'https://www.arkadasyayinevi.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.arkadasyayinevi.com/kampanyalar',
    ],
  },
  {
    name: 'Doğan Kitap',
    websiteUrl: 'https://www.dogankitap.com.tr',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.dogankitap.com.tr/kampanyalar',
      'https://www.dogankitap.com.tr/indirimli-kitaplar',
    ],
  },
  {
    name: 'Pegasus Yayınları',
    websiteUrl: 'https://www.pegasusyayinlari.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.pegasusyayinlari.com/kampanyalar',
    ],
  },
  {
    name: '1000Kitap',
    websiteUrl: 'https://www.1000kitap.com',
    categorySlug: 'kitap-hobi',
    seedUrls: [
      'https://www.1000kitap.com/kampanyalar',
      'https://www.1000kitap.com/firsatlar',
    ],
  },
];

// ── Deduplicate by slug ──────────────────────────────────────
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

// ── Main ─────────────────────────────────────────────────────
async function main() {
  console.log('=== TR Extra Brand Seeding Script ===\n');

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
        where: { slug_market: { slug, market: 'TR' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          market: 'TR',
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
            name: `${entry.name} Kampanyalar`,
            crawlMethod: CrawlMethod.CAMPAIGN,
            seedUrls: entry.seedUrls,
            maxDepth: 2,
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'TR',
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
