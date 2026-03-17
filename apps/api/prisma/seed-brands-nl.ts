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
  // 1) Alışveriş / Shopping (alisveris) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Bol.com', websiteUrl: 'https://www.bol.com', categorySlug: 'alisveris', seedUrls: ['https://www.bol.com/nl/nl/m/deals/', 'https://www.bol.com/nl/nl/m/aanbiedingen/'] },
  { name: 'Coolblue', websiteUrl: 'https://www.coolblue.nl', categorySlug: 'alisveris', seedUrls: ['https://www.coolblue.nl/acties', 'https://www.coolblue.nl/aanbiedingen'] },
  { name: 'Wehkamp', websiteUrl: 'https://www.wehkamp.nl', categorySlug: 'alisveris', seedUrls: ['https://www.wehkamp.nl/sale/', 'https://www.wehkamp.nl/aanbiedingen/'] },
  { name: 'HEMA', websiteUrl: 'https://www.hema.nl', categorySlug: 'alisveris', seedUrls: ['https://www.hema.nl/aanbiedingen', 'https://www.hema.nl/sale'] },
  { name: 'Action', websiteUrl: 'https://www.action.com/nl-nl', categorySlug: 'alisveris', seedUrls: ['https://www.action.com/nl-nl/aanbiedingen/'] },
  { name: 'Blokker', websiteUrl: 'https://www.blokker.nl', categorySlug: 'alisveris', seedUrls: ['https://www.blokker.nl/sale', 'https://www.blokker.nl/aanbiedingen'] },
  { name: 'IKEA NL', websiteUrl: 'https://www.ikea.com/nl', categorySlug: 'alisveris', seedUrls: ['https://www.ikea.com/nl/nl/offers/', 'https://www.ikea.com/nl/nl/campaigns/'] },
  { name: 'Amazon NL', websiteUrl: 'https://www.amazon.nl', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.nl/deals', 'https://www.amazon.nl/gp/goldbox'] },
  { name: 'MediaMarkt NL', websiteUrl: 'https://www.mediamarkt.nl', categorySlug: 'alisveris', seedUrls: ['https://www.mediamarkt.nl/nl/shop/aanbiedingen.html', 'https://www.mediamarkt.nl/nl/shop/acties.html'] },
  { name: 'Kruidvat', websiteUrl: 'https://www.kruidvat.nl', categorySlug: 'alisveris', seedUrls: ['https://www.kruidvat.nl/aanbiedingen', 'https://www.kruidvat.nl/acties'] },
  { name: 'Trekpleister', websiteUrl: 'https://www.trekpleister.nl', categorySlug: 'alisveris', seedUrls: ['https://www.trekpleister.nl/aanbiedingen'] },
  { name: 'Praxis', websiteUrl: 'https://www.praxis.nl', categorySlug: 'alisveris', seedUrls: ['https://www.praxis.nl/aanbiedingen', 'https://www.praxis.nl/acties'] },
  { name: 'Gamma', websiteUrl: 'https://www.gamma.nl', categorySlug: 'alisveris', seedUrls: ['https://www.gamma.nl/aanbiedingen', 'https://www.gamma.nl/acties'] },
  { name: 'KARWEI', websiteUrl: 'https://www.karwei.nl', categorySlug: 'alisveris', seedUrls: ['https://www.karwei.nl/aanbiedingen', 'https://www.karwei.nl/acties'] },
  { name: 'Hornbach NL', websiteUrl: 'https://www.hornbach.nl', categorySlug: 'alisveris', seedUrls: ['https://www.hornbach.nl/aanbiedingen/', 'https://www.hornbach.nl/acties/'] },
  { name: 'Fonq', websiteUrl: 'https://www.fonq.nl', categorySlug: 'alisveris', seedUrls: ['https://www.fonq.nl/sale/', 'https://www.fonq.nl/aanbiedingen/'] },
  { name: 'Marktplaats', websiteUrl: 'https://www.marktplaats.nl', categorySlug: 'alisveris', seedUrls: ['https://www.marktplaats.nl/'] },
  { name: 'Lidl NL', websiteUrl: 'https://www.lidl.nl', categorySlug: 'alisveris', seedUrls: ['https://www.lidl.nl/aanbiedingen', 'https://www.lidl.nl/acties'] },
  { name: 'Aldi NL', websiteUrl: 'https://www.aldi.nl', categorySlug: 'alisveris', seedUrls: ['https://www.aldi.nl/aanbiedingen.html', 'https://www.aldi.nl/acties.html'] },
  { name: 'Big Bazar', websiteUrl: 'https://www.bigbazar.nl', categorySlug: 'alisveris', seedUrls: ['https://www.bigbazar.nl/aanbiedingen'] },
  { name: 'Xenos', websiteUrl: 'https://www.xenos.nl', categorySlug: 'alisveris', seedUrls: ['https://www.xenos.nl/aanbiedingen', 'https://www.xenos.nl/sale'] },
  { name: 'Flying Tiger NL', websiteUrl: 'https://flyingtiger.com/nl-nl', categorySlug: 'alisveris', seedUrls: ['https://flyingtiger.com/nl-nl/'] },
  { name: 'Wibra', websiteUrl: 'https://www.wibra.nl', categorySlug: 'alisveris', seedUrls: ['https://www.wibra.nl/aanbiedingen'] },
  { name: 'Zeeman', websiteUrl: 'https://www.zeeman.com/nl', categorySlug: 'alisveris', seedUrls: ['https://www.zeeman.com/nl/aanbiedingen'] },
  { name: 'Bristol', websiteUrl: 'https://www.bristol.nl', categorySlug: 'alisveris', seedUrls: ['https://www.bristol.nl/sale/', 'https://www.bristol.nl/aanbiedingen/'] },
  { name: 'Bever', websiteUrl: 'https://www.bfrancq.nl', categorySlug: 'alisveris', seedUrls: ['https://www.bfrancq.nl/sale/', 'https://www.bfrancq.nl/aanbiedingen/'] },
  { name: 'BCC', websiteUrl: 'https://www.bcc.nl', categorySlug: 'alisveris', seedUrls: ['https://www.bcc.nl/acties', 'https://www.bcc.nl/aanbiedingen'] },
  { name: 'Expert NL', websiteUrl: 'https://www.expert.nl', categorySlug: 'alisveris', seedUrls: ['https://www.expert.nl/acties', 'https://www.expert.nl/aanbiedingen'] },
  { name: 'EP NL', websiteUrl: 'https://www.ep.nl', categorySlug: 'alisveris', seedUrls: ['https://www.ep.nl/acties', 'https://www.ep.nl/aanbiedingen'] },
  { name: 'Thuisbezorgd', websiteUrl: 'https://www.thuisbezorgd.nl', categorySlug: 'alisveris', seedUrls: ['https://www.thuisbezorgd.nl/deals'] },
  { name: 'Otto NL', websiteUrl: 'https://www.otto.nl', categorySlug: 'alisveris', seedUrls: ['https://www.otto.nl/sale/', 'https://www.otto.nl/aanbiedingen/'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung NL', websiteUrl: 'https://www.samsung.com/nl', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/nl/offer/', 'https://www.samsung.com/nl/smartphones/all-smartphones/'] },
  { name: 'Apple NL', websiteUrl: 'https://www.apple.com/nl', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/nl/shop/go/special_deals'] },
  { name: 'KPN', websiteUrl: 'https://www.kpn.com', categorySlug: 'elektronik', seedUrls: ['https://www.kpn.com/acties', 'https://www.kpn.com/aanbiedingen'] },
  { name: 'Ziggo', websiteUrl: 'https://www.ziggo.nl', categorySlug: 'elektronik', seedUrls: ['https://www.ziggo.nl/acties', 'https://www.ziggo.nl/aanbiedingen'] },
  { name: 'T-Mobile NL', websiteUrl: 'https://www.t-mobile.nl', categorySlug: 'elektronik', seedUrls: ['https://www.t-mobile.nl/acties', 'https://www.t-mobile.nl/aanbiedingen'] },
  { name: 'Vodafone NL', websiteUrl: 'https://www.vodafone.nl', categorySlug: 'elektronik', seedUrls: ['https://www.vodafone.nl/acties', 'https://www.vodafone.nl/aanbiedingen'] },
  { name: 'Odido', websiteUrl: 'https://www.odido.nl', categorySlug: 'elektronik', seedUrls: ['https://www.odido.nl/acties', 'https://www.odido.nl/aanbiedingen'] },
  { name: 'Simyo', websiteUrl: 'https://www.simyo.nl', categorySlug: 'elektronik', seedUrls: ['https://www.simyo.nl/acties'] },
  { name: 'Ben NL', websiteUrl: 'https://www.ben.nl', categorySlug: 'elektronik', seedUrls: ['https://www.ben.nl/acties', 'https://www.ben.nl/aanbiedingen'] },
  { name: 'LG NL', websiteUrl: 'https://www.lg.com/nl', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/nl/promoties/'] },
  { name: 'Sony NL', websiteUrl: 'https://www.sony.nl', categorySlug: 'elektronik', seedUrls: ['https://www.sony.nl/aanbiedingen'] },
  { name: 'HP NL', websiteUrl: 'https://www.hp.com/nl-nl', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/nl-nl/shop/aanbiedingen'] },
  { name: 'Lenovo NL', websiteUrl: 'https://www.lenovo.com/nl/nl', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/nl/nl/d/deals/'] },
  { name: 'Dell NL', websiteUrl: 'https://www.dell.com/nl-nl', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/nl-nl/shop/deals'] },
  { name: 'Asus NL', websiteUrl: 'https://www.asus.com/nl', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/nl/campaign/'] },
  { name: 'Philips NL', websiteUrl: 'https://www.philips.nl', categorySlug: 'elektronik', seedUrls: ['https://www.philips.nl/c-e/aanbiedingen.html'] },
  { name: 'Dyson NL', websiteUrl: 'https://www.dyson.nl', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.nl/aanbiedingen'] },
  { name: 'Xiaomi NL', websiteUrl: 'https://www.mi.com/nl', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/nl/sale'] },
  { name: 'Huawei NL', websiteUrl: 'https://consumer.huawei.com/nl', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/nl/offer/'] },
  { name: 'Canon NL', websiteUrl: 'https://www.canon.nl', categorySlug: 'elektronik', seedUrls: ['https://www.canon.nl/promoties'] },
  { name: 'Logitech NL', websiteUrl: 'https://www.logitech.com/nl-nl', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/nl-nl/promo.html'] },
  { name: 'JBL NL', websiteUrl: 'https://nl.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://nl.jbl.com/aanbiedingen'] },
  { name: 'Bose NL', websiteUrl: 'https://www.bose.nl', categorySlug: 'elektronik', seedUrls: ['https://www.bose.nl/aanbiedingen'] },
  { name: 'Sonos NL', websiteUrl: 'https://www.sonos.com/nl-nl', categorySlug: 'elektronik', seedUrls: ['https://www.sonos.com/nl-nl/shop/offers'] },
  { name: 'Garmin NL', websiteUrl: 'https://www.garmin.com/nl-NL', categorySlug: 'elektronik', seedUrls: ['https://www.garmin.com/nl-NL/sale/'] },
  { name: 'GoPro NL', websiteUrl: 'https://gopro.com/nl/nl', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/nl/nl/deals'] },
  { name: 'OnePlus NL', websiteUrl: 'https://www.oneplus.com/nl', categorySlug: 'elektronik', seedUrls: ['https://www.oneplus.com/nl/sale'] },
  { name: 'Epson NL', websiteUrl: 'https://www.epson.nl', categorySlug: 'elektronik', seedUrls: ['https://www.epson.nl/promoties'] },
  { name: 'Nikon NL', websiteUrl: 'https://www.nikon.nl', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.nl/promoties'] },
  { name: 'Motorola NL', websiteUrl: 'https://www.motorola.nl', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.nl/aanbiedingen'] },
  { name: 'Teufel NL', websiteUrl: 'https://www.teufel.nl', categorySlug: 'elektronik', seedUrls: ['https://www.teufel.nl/sale', 'https://www.teufel.nl/aanbiedingen'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Zalando NL', websiteUrl: 'https://www.zalando.nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.zalando.nl/sale/', 'https://www.zalando.nl/aanbiedingen/'] },
  { name: 'H&M NL', websiteUrl: 'https://www2.hm.com/nl_nl', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/nl_nl/sale.html'] },
  { name: 'Zara NL', websiteUrl: 'https://www.zara.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/nl/nl/sale-l1702.html'] },
  { name: 'C&A NL', websiteUrl: 'https://www.c-and-a.com/nl/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.c-and-a.com/nl/nl/shop/sale', 'https://www.c-and-a.com/nl/nl/shop/aanbiedingen'] },
  { name: 'WE Fashion', websiteUrl: 'https://www.wefashion.nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.wefashion.nl/sale', 'https://www.wefashion.nl/aanbiedingen'] },
  { name: 'Scotch & Soda', websiteUrl: 'https://www.scotchandsoda.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.scotchandsoda.com/nl/nl/sale'] },
  { name: 'G-Star RAW', websiteUrl: 'https://www.g-star.com/nl_nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.g-star.com/nl_nl/sale'] },
  { name: 'Tommy Hilfiger NL', websiteUrl: 'https://nl.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://nl.tommy.com/sale'] },
  { name: 'Calvin Klein NL', websiteUrl: 'https://www.calvinklein.nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.nl/sale'] },
  { name: 'Nike NL', websiteUrl: 'https://www.nike.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/nl/sale'] },
  { name: 'Adidas NL', websiteUrl: 'https://www.adidas.nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.nl/sale', 'https://www.adidas.nl/outlet'] },
  { name: 'ONLY', websiteUrl: 'https://www.only.com/nl/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.only.com/nl/nl/sale/'] },
  { name: 'Vero Moda NL', websiteUrl: 'https://www.veromoda.com/nl/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.veromoda.com/nl/nl/sale/'] },
  { name: 'Jack & Jones NL', websiteUrl: 'https://www.jackjones.com/nl/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.jackjones.com/nl/nl/sale/'] },
  { name: 'Mango NL', websiteUrl: 'https://shop.mango.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/nl/sale'] },
  { name: 'COS NL', websiteUrl: 'https://www.cos.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.cos.com/nl/sale'] },
  { name: 'Uniqlo NL', websiteUrl: 'https://www.uniqlo.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/nl/nl/sale'] },
  { name: 'Levi\'s NL', websiteUrl: 'https://www.levi.com/NL', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com/NL/sale'] },
  { name: 'The Sting', websiteUrl: 'https://www.thesting.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.thesting.com/nl/sale'] },
  { name: 'Sissy-Boy', websiteUrl: 'https://www.sissy-boy.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sissy-boy.com/sale'] },
  { name: 'Shoeby', websiteUrl: 'https://www.shoeby.nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.shoeby.nl/sale', 'https://www.shoeby.nl/aanbiedingen'] },
  { name: 'Expresso Fashion', websiteUrl: 'https://www.expfrancq.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.expfrancq.com/sale'] },
  { name: 'Suitsupply', websiteUrl: 'https://suitsupply.com/nl-nl', categorySlug: 'giyim-moda', seedUrls: ['https://suitsupply.com/nl-nl/sale'] },
  { name: 'Oilily', websiteUrl: 'https://www.oilily.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.oilily.com/sale'] },
  { name: 'McGregor', websiteUrl: 'https://www.mcgregorstore.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.mcgregorstore.com/sale'] },
  { name: 'Bershka NL', websiteUrl: 'https://www.bershka.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/nl/sale-c0p101133.html'] },
  { name: 'Stradivarius NL', websiteUrl: 'https://www.stradivarius.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/nl/sale-c0p101190.html'] },
  { name: 'Pull & Bear NL', websiteUrl: 'https://www.pullandbear.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/nl/sale-n6485'] },
  { name: 'Massimo Dutti NL', websiteUrl: 'https://www.massimodutti.com/nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/nl/sale'] },
  { name: 'Omoda', websiteUrl: 'https://www.omoda.nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.omoda.nl/sale/', 'https://www.omoda.nl/aanbiedingen/'] },
  { name: 'Van Haren', websiteUrl: 'https://www.vanharen.nl', categorySlug: 'giyim-moda', seedUrls: ['https://www.vanharen.nl/sale/', 'https://www.vanharen.nl/aanbiedingen/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Food & Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Albert Heijn', websiteUrl: 'https://www.ah.nl', categorySlug: 'gida-market', seedUrls: ['https://www.ah.nl/bonus', 'https://www.ah.nl/acties'] },
  { name: 'Jumbo', websiteUrl: 'https://www.jumbo.com', categorySlug: 'gida-market', seedUrls: ['https://www.jumbo.com/aanbiedingen', 'https://www.jumbo.com/acties'] },
  { name: 'Plus Supermarkt', websiteUrl: 'https://www.plus.nl', categorySlug: 'gida-market', seedUrls: ['https://www.plus.nl/aanbiedingen', 'https://www.plus.nl/acties'] },
  { name: 'Dirk', websiteUrl: 'https://www.dirk.nl', categorySlug: 'gida-market', seedUrls: ['https://www.dirk.nl/aanbiedingen'] },
  { name: 'DekaMarkt', websiteUrl: 'https://www.dekamarkt.nl', categorySlug: 'gida-market', seedUrls: ['https://www.dekamarkt.nl/aanbiedingen'] },
  { name: 'Coop NL', websiteUrl: 'https://www.coop.nl', categorySlug: 'gida-market', seedUrls: ['https://www.coop.nl/aanbiedingen'] },
  { name: 'Spar NL', websiteUrl: 'https://www.spar.nl', categorySlug: 'gida-market', seedUrls: ['https://www.spar.nl/aanbiedingen/'] },
  { name: 'Vomar', websiteUrl: 'https://www.vomar.nl', categorySlug: 'gida-market', seedUrls: ['https://www.vomar.nl/aanbiedingen'] },
  { name: 'Jan Linders', websiteUrl: 'https://www.janlinders.nl', categorySlug: 'gida-market', seedUrls: ['https://www.janlinders.nl/aanbiedingen'] },
  { name: 'Hoogvliet', websiteUrl: 'https://www.hoogvliet.com', categorySlug: 'gida-market', seedUrls: ['https://www.hoogvliet.com/aanbiedingen'] },
  { name: 'Picnic', websiteUrl: 'https://picnic.app', categorySlug: 'gida-market', seedUrls: ['https://picnic.app/nl/aanbiedingen'] },
  { name: 'Gorillas NL', websiteUrl: 'https://www.gorillas.io/nl', categorySlug: 'gida-market', seedUrls: ['https://www.gorillas.io/nl/aanbiedingen'] },
  { name: 'Flink NL', websiteUrl: 'https://www.goflink.com/nl', categorySlug: 'gida-market', seedUrls: ['https://www.goflink.com/nl/aanbiedingen'] },
  { name: 'Crisp', websiteUrl: 'https://www.crisp.nl', categorySlug: 'gida-market', seedUrls: ['https://www.crisp.nl/aanbiedingen'] },
  { name: 'Makro NL', websiteUrl: 'https://www.makro.nl', categorySlug: 'gida-market', seedUrls: ['https://www.makro.nl/aanbiedingen', 'https://www.makro.nl/acties'] },
  { name: 'Sligro', websiteUrl: 'https://www.sligro.nl', categorySlug: 'gida-market', seedUrls: ['https://www.sligro.nl/acties'] },
  { name: 'Hanos', websiteUrl: 'https://www.hanos.nl', categorySlug: 'gida-market', seedUrls: ['https://www.hanos.nl/acties'] },
  { name: 'Gall & Gall', websiteUrl: 'https://www.gfrancq.nl', categorySlug: 'gida-market', seedUrls: ['https://www.gfrancq.nl/aanbiedingen'] },
  { name: 'Ekoplaza', websiteUrl: 'https://www.ekoplaza.nl', categorySlug: 'gida-market', seedUrls: ['https://www.ekoplaza.nl/aanbiedingen'] },
  { name: 'Bidfood', websiteUrl: 'https://www.bidfood.nl', categorySlug: 'gida-market', seedUrls: ['https://www.bidfood.nl/acties'] },
  { name: 'Holland & Barrett NL', websiteUrl: 'https://www.hollandandbarrett.nl', categorySlug: 'gida-market', seedUrls: ['https://www.hollandandbarrett.nl/aanbiedingen'] },
  { name: 'Poiesz', websiteUrl: 'https://www.poiesz-supermarkten.nl', categorySlug: 'gida-market', seedUrls: ['https://www.poiesz-supermarkten.nl/aanbiedingen'] },
  { name: 'Boni', websiteUrl: 'https://www.bfrancq-supermarkt.nl', categorySlug: 'gida-market', seedUrls: ['https://www.bfrancq-supermarkt.nl/aanbiedingen'] },
  { name: 'Nettorama', websiteUrl: 'https://www.nettorama.nl', categorySlug: 'gida-market', seedUrls: ['https://www.nettorama.nl/aanbiedingen'] },
  { name: 'Deen', websiteUrl: 'https://www.deen.nl', categorySlug: 'gida-market', seedUrls: ['https://www.deen.nl/aanbiedingen'] },
  { name: 'MCD NL', websiteUrl: 'https://www.mcdonalds.com/nl/nl-nl.html', categorySlug: 'gida-market', seedUrls: ['https://www.mcdonalds.com/nl/nl-nl/aanbiedingen.html'] },
  { name: 'Starbucks NL', websiteUrl: 'https://www.starbucks.nl', categorySlug: 'gida-market', seedUrls: ['https://www.starbucks.nl/aanbiedingen'] },
  { name: 'Domino\'s NL', websiteUrl: 'https://www.dominos.nl', categorySlug: 'gida-market', seedUrls: ['https://www.dominos.nl/acties'] },
  { name: 'New York Pizza', websiteUrl: 'https://www.newyorkpizza.nl', categorySlug: 'gida-market', seedUrls: ['https://www.newyorkpizza.nl/acties'] },
  { name: 'Subway NL', websiteUrl: 'https://www.subway.com/nl-NL', categorySlug: 'gida-market', seedUrls: ['https://www.subway.com/nl-NL/aanbiedingen'] },
  { name: 'Burger King NL', websiteUrl: 'https://www.burgerking.nl', categorySlug: 'gida-market', seedUrls: ['https://www.burgerking.nl/acties', 'https://www.burgerking.nl/aanbiedingen'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Drink (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Thuisbezorgd.nl', websiteUrl: 'https://www.thuisbezorgd.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.thuisbezorgd.nl/deals', 'https://www.thuisbezorgd.nl/aanbiedingen'] },
  { name: 'Uber Eats NL', websiteUrl: 'https://www.ubereats.com/nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/nl/deals'] },
  { name: 'Just Eat NL', websiteUrl: 'https://www.justeat.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.justeat.nl/deals'] },
  { name: 'Vapiano NL', websiteUrl: 'https://nl.vapiano.com', categorySlug: 'yeme-icme', seedUrls: ['https://nl.vapiano.com/aanbiedingen/'] },
  { name: 'La Place', websiteUrl: 'https://www.laplace.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.laplace.com/acties'] },
  { name: 'FEBO', websiteUrl: 'https://www.febo.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.febo.nl/acties'] },
  { name: 'Dunkin\' NL', websiteUrl: 'https://www.dunkin.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkin.nl/acties'] },
  { name: 'KFC NL', websiteUrl: 'https://www.kfc.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.nl/acties', 'https://www.kfc.nl/deals'] },
  { name: 'Five Guys NL', websiteUrl: 'https://www.fiveguys.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.fiveguys.nl/'] },
  { name: 'Wagamama NL', websiteUrl: 'https://www.wagamama.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.wagamama.nl/acties'] },
  { name: 'Happy Italy', websiteUrl: 'https://www.happyitaly.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.happyitaly.nl/acties'] },
  { name: 'Spare Rib Express', websiteUrl: 'https://www.spareribs.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.spareribs.nl/acties'] },
  { name: 'Bakker Bart', websiteUrl: 'https://www.bakkerbart.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.bakkerbart.nl/acties'] },
  { name: 'Bagels & Beans', websiteUrl: 'https://www.bagelsbeans.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.bagelsbeans.nl/acties'] },
  { name: 'De Bijenkorf Restaurant', websiteUrl: 'https://www.debijenkorf.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.debijenkorf.nl/restaurant'] },
  { name: 'Anne&Max', websiteUrl: 'https://www.annemax.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.annemax.nl/'] },
  { name: 'Loetje', websiteUrl: 'https://www.loetje.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.loetje.nl/acties'] },
  { name: 'Iens', websiteUrl: 'https://www.iens.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.iens.nl/deals'] },
  { name: 'Social Deal', websiteUrl: 'https://www.socialdeal.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.socialdeal.nl/eten-drinken'] },
  { name: 'Restaurant Week NL', websiteUrl: 'https://www.restaurantweek.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.restaurantweek.nl/'] },
  { name: 'HelloFresh NL', websiteUrl: 'https://www.hellofresh.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.hellofresh.nl/aanbiedingen', 'https://www.hellofresh.nl/acties'] },
  { name: 'Marley Spoon NL', websiteUrl: 'https://marleyspoon.nl', categorySlug: 'yeme-icme', seedUrls: ['https://marleyspoon.nl/aanbiedingen'] },
  { name: 'Ekomenu', websiteUrl: 'https://www.ekomenu.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.ekomenu.nl/acties'] },
  { name: 'Bistroo', websiteUrl: 'https://www.bistroo.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.bistroo.nl/deals'] },
  { name: 'Smulweb', websiteUrl: 'https://www.smulweb.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.smulweb.nl/'] },
  { name: 'Pizza Hut NL', websiteUrl: 'https://www.pizzahut.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.nl/deals', 'https://www.pizzahut.nl/acties'] },
  { name: 'Taco Bell NL', websiteUrl: 'https://www.tacobell.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.tacobell.nl/deals'] },
  { name: 'Papa John\'s NL', websiteUrl: 'https://www.papajohns.nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.nl/deals'] },
  { name: 'Too Good To Go NL', websiteUrl: 'https://www.toogoodtogo.com/nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.toogoodtogo.com/nl/'] },
  { name: 'Sushi Daily NL', websiteUrl: 'https://www.sushidaily.com/nl', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushidaily.com/nl/aanbiedingen'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Etos', websiteUrl: 'https://www.etos.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.etos.nl/aanbiedingen', 'https://www.etos.nl/acties'] },
  { name: 'Douglas NL', websiteUrl: 'https://www.douglas.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.douglas.nl/nl/sale', 'https://www.douglas.nl/nl/aanbiedingen'] },
  { name: 'ICI Paris XL', websiteUrl: 'https://www.iciparisxl.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.iciparisxl.nl/aanbiedingen', 'https://www.iciparisxl.nl/sale'] },
  { name: 'Rituals NL', websiteUrl: 'https://www.rituals.com/nl-nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/nl-nl/sale'] },
  { name: 'De Bijenkorf Beauty', websiteUrl: 'https://www.debijenkorf.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.debijenkorf.nl/beauty/sale'] },
  { name: 'The Body Shop NL', websiteUrl: 'https://www.thebodyshop.com/nl-nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com/nl-nl/sale'] },
  { name: 'Lush NL', websiteUrl: 'https://www.lush.com/nl/nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/nl/nl/'] },
  { name: 'Sephora NL', websiteUrl: 'https://www.sephora.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.nl/sale'] },
  { name: 'Kiehl\'s NL', websiteUrl: 'https://www.kiehls.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.nl/aanbiedingen'] },
  { name: 'Clinique NL', websiteUrl: 'https://www.clinique.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.nl/aanbiedingen'] },
  { name: 'MAC NL', websiteUrl: 'https://www.maccosmetics.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.nl/aanbiedingen'] },
  { name: 'L\'Oréal NL', websiteUrl: 'https://www.loreal-paris.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.nl/aanbiedingen'] },
  { name: 'Nivea NL', websiteUrl: 'https://www.nivea.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.nl/acties'] },
  { name: 'Dove NL', websiteUrl: 'https://www.dove.com/nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/nl/aanbiedingen.html'] },
  { name: 'Yves Rocher NL', websiteUrl: 'https://www.yfrancq.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yfrancq.nl/acties'] },
  { name: 'Bioderma NL', websiteUrl: 'https://www.bioderma.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.nl/aanbiedingen'] },
  { name: 'Vichy NL', websiteUrl: 'https://www.vichy.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.nl/aanbiedingen'] },
  { name: 'La Roche-Posay NL', websiteUrl: 'https://www.laroche-posay.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.nl/aanbiedingen'] },
  { name: 'Weleda NL', websiteUrl: 'https://www.weleda.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.weleda.nl/aanbiedingen'] },
  { name: 'Dr. Hauschka NL', websiteUrl: 'https://www.dfrancq.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dfrancq.nl/acties'] },
  { name: 'Hunkemöller', websiteUrl: 'https://www.hunkemoller.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.hunkemoller.nl/sale', 'https://www.hunkemoller.nl/acties'] },
  { name: 'Drogisterij.net', websiteUrl: 'https://www.drogisterij.net', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.drogisterij.net/aanbiedingen'] },
  { name: 'Plein.nl', websiteUrl: 'https://www.plein.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.plein.nl/aanbiedingen', 'https://www.plein.nl/acties'] },
  { name: 'Parfumania', websiteUrl: 'https://www.parfumania.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.parfumania.nl/aanbiedingen'] },
  { name: 'Notino NL', websiteUrl: 'https://www.notino.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.notino.nl/acties/', 'https://www.notino.nl/sale/'] },
  { name: 'Lucardi', websiteUrl: 'https://www.lucardi.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lucardi.nl/sale', 'https://www.lucardi.nl/aanbiedingen'] },
  { name: 'Specsavers NL', websiteUrl: 'https://www.specsavers.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.specsavers.nl/aanbiedingen', 'https://www.specsavers.nl/acties'] },
  { name: 'Pearle', websiteUrl: 'https://www.pearle.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pearle.nl/aanbiedingen'] },
  { name: 'Charlie Temple', websiteUrl: 'https://www.charlietemple.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.charlietemple.com/acties'] },
  { name: 'Hans Anders', websiteUrl: 'https://www.hansanders.nl', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.hansanders.nl/acties', 'https://www.hansanders.nl/aanbiedingen'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'De Bijenkorf', websiteUrl: 'https://www.debijenkorf.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.debijenkorf.nl/sale', 'https://www.debijenkorf.nl/acties'] },
  { name: 'Kwantum', websiteUrl: 'https://www.kwantum.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.kwantum.nl/aanbiedingen', 'https://www.kwantum.nl/sale'] },
  { name: 'Leen Bakker', websiteUrl: 'https://www.leenbakker.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.leenbakker.nl/sale', 'https://www.leenbakker.nl/aanbiedingen'] },
  { name: 'JYSK NL', websiteUrl: 'https://www.jysk.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.jysk.nl/aanbiedingen', 'https://www.jysk.nl/sale'] },
  { name: 'Swiss Sense', websiteUrl: 'https://www.swisssense.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.swisssense.nl/acties', 'https://www.swisssense.nl/sale'] },
  { name: 'Beter Bed', websiteUrl: 'https://www.beterbed.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.beterbed.nl/acties', 'https://www.beterbed.nl/sale'] },
  { name: 'Auping', websiteUrl: 'https://www.auping.com/nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.auping.com/nl/acties'] },
  { name: 'Goossens Wonen', websiteUrl: 'https://www.goossens.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.goossens.nl/sale', 'https://www.goossens.nl/acties'] },
  { name: 'Loods 5', websiteUrl: 'https://www.loods5.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.loods5.nl/sale'] },
  { name: 'DUSK', websiteUrl: 'https://www.dusk.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.dusk.nl/sale'] },
  { name: 'Rivièra Maison', websiteUrl: 'https://www.rivieramaison.com/nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.rivieramaison.com/nl/sale'] },
  { name: 'Woonfabrique', websiteUrl: 'https://www.woonfrancq.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.woonfrancq.nl/sale'] },
  { name: 'FonQ Home', websiteUrl: 'https://www.fonq.nl/wonen', categorySlug: 'ev-yasam', seedUrls: ['https://www.fonq.nl/wonen/sale/'] },
  { name: 'WestwingNow NL', websiteUrl: 'https://www.westwing.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.nl/sale/'] },
  { name: 'Xenos Home', websiteUrl: 'https://www.xenos.nl/wonen', categorySlug: 'ev-yasam', seedUrls: ['https://www.xenos.nl/wonen/sale'] },
  { name: 'Emma Matras', websiteUrl: 'https://www.emma-matras.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.emma-matras.nl/acties'] },
  { name: 'Flexa NL', websiteUrl: 'https://www.flexa.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.flexa.nl/acties'] },
  { name: 'Sikkens NL', websiteUrl: 'https://www.sikkens.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.sikkens.nl/acties'] },
  { name: 'Intratuin', websiteUrl: 'https://www.intratuin.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.intratuin.nl/aanbiedingen', 'https://www.intratuin.nl/acties'] },
  { name: 'TuinMeubelen.nl', websiteUrl: 'https://www.tuinmeubelen.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.tuinmeubelen.nl/sale/'] },
  { name: 'Bomont', websiteUrl: 'https://www.bomont.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.bomont.nl/sale'] },
  { name: 'Flinders', websiteUrl: 'https://www.flfrancq.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.flfrancq.nl/sale'] },
  { name: 'Basiclabel', websiteUrl: 'https://www.basiclabel.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.basiclabel.nl/sale'] },
  { name: 'HKliving', websiteUrl: 'https://www.hkliving.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.hkliving.nl/sale/'] },
  { name: 'Nijhof', websiteUrl: 'https://www.nijhof.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.nijhof.nl/acties'] },
  { name: 'Eijerkamp', websiteUrl: 'https://www.eijerkamp.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.eijerkamp.nl/sale', 'https://www.eijerkamp.nl/acties'] },
  { name: 'Mandemakers Keukens', websiteUrl: 'https://www.mandemakers.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.mandemakers.nl/acties'] },
  { name: 'Bruynzeel Keukens', websiteUrl: 'https://www.bruynzeel.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.bruynzeel.nl/acties'] },
  { name: 'Keuken Kampioen', websiteUrl: 'https://www.keukenkampioen.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.keukenkampioen.nl/acties'] },
  { name: 'Sanitairwinkel', websiteUrl: 'https://www.sanitairwinkel.nl', categorySlug: 'ev-yasam', seedUrls: ['https://www.sanitairwinkel.nl/aanbiedingen'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon NL', websiteUrl: 'https://www.decathlon.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.nl/browse/c0-sale/_/N-1i3gvkb', 'https://www.decathlon.nl/aanbiedingen'] },
  { name: 'Intersport NL', websiteUrl: 'https://www.intersport.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.nl/sale/', 'https://www.intersport.nl/aanbiedingen/'] },
  { name: 'Perry Sport', websiteUrl: 'https://www.perrysport.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.perrysport.nl/sale/', 'https://www.perrysport.nl/aanbiedingen/'] },
  { name: 'Aktiesport', websiteUrl: 'https://www.aktiesport.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.aktiesport.nl/sale/', 'https://www.aktiesport.nl/aanbiedingen/'] },
  { name: 'JD Sports NL', websiteUrl: 'https://www.jdsports.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jdsports.nl/sale/'] },
  { name: 'Foot Locker NL', websiteUrl: 'https://www.footlocker.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.footlocker.nl/nl/sale'] },
  { name: 'Bever Outdoor', websiteUrl: 'https://www.bever.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bever.nl/sale/', 'https://www.bever.nl/aanbiedingen/'] },
  { name: 'AS Adventure NL', websiteUrl: 'https://www.asadventure.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asadventure.nl/sale/'] },
  { name: 'Runners World NL', websiteUrl: 'https://www.runnersworld.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.runnersworld.nl/sale/'] },
  { name: 'Puma NL', websiteUrl: 'https://eu.puma.com/nl', categorySlug: 'spor-outdoor', seedUrls: ['https://eu.puma.com/nl/nl/sale'] },
  { name: 'Reebok NL', websiteUrl: 'https://www.reebok.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.nl/sale'] },
  { name: 'New Balance NL', websiteUrl: 'https://www.newbalance.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.nl/sale/'] },
  { name: 'Under Armour NL', websiteUrl: 'https://www.underarmour.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.nl/nl-nl/sale/'] },
  { name: 'The North Face NL', websiteUrl: 'https://www.thenorthface.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.nl/sale/'] },
  { name: 'Asics NL', websiteUrl: 'https://www.asics.com/nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/nl/nl-nl/sale/'] },
  { name: 'Skechers NL', websiteUrl: 'https://www.skechers.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.nl/sale/'] },
  { name: 'Helly Hansen NL', websiteUrl: 'https://www.hellyhansen.com/nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.com/nl/sale'] },
  { name: 'Columbia NL', websiteUrl: 'https://www.columbiasportswear.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.nl/sale/'] },
  { name: 'Salomon NL', websiteUrl: 'https://www.salomon.com/nl-nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/nl-nl/sale/'] },
  { name: 'Vans NL', websiteUrl: 'https://www.vans.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.nl/sale.html'] },
  { name: 'Converse NL', websiteUrl: 'https://www.converse.com/nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com/nl/sale'] },
  { name: 'Timberland NL', websiteUrl: 'https://www.timberland.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.nl/sale.html'] },
  { name: 'Basic-Fit', websiteUrl: 'https://www.basic-fit.com/nl-nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.basic-fit.com/nl-nl/acties'] },
  { name: 'SportCity', websiteUrl: 'https://www.sportcity.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportcity.nl/acties'] },
  { name: 'Anytime Fitness NL', websiteUrl: 'https://www.anytimefitness.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.anytimefitness.nl/acties'] },
  { name: 'Fitness.nl', websiteUrl: 'https://www.fitness.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitness.nl/aanbiedingen'] },
  { name: 'Fietsenwinkel.nl', websiteUrl: 'https://www.fietsenwinkel.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fietsenwinkel.nl/sale/', 'https://www.fietsenwinkel.nl/aanbiedingen/'] },
  { name: 'Mantel', websiteUrl: 'https://www.mantel.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mantel.com/sale', 'https://www.mantel.com/aanbiedingen'] },
  { name: 'Futurumshop', websiteUrl: 'https://www.futurumshop.nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.futurumshop.nl/sale/', 'https://www.futurumshop.nl/aanbiedingen/'] },
  { name: 'Protest NL', websiteUrl: 'https://www.protest.eu/nl', categorySlug: 'spor-outdoor', seedUrls: ['https://www.protest.eu/nl/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'NS', websiteUrl: 'https://www.ns.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ns.nl/acties', 'https://www.ns.nl/aanbiedingen'] },
  { name: 'KLM', websiteUrl: 'https://www.klm.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klm.nl/information/aanbiedingen'] },
  { name: 'Transavia', websiteUrl: 'https://www.transavia.com/nl-NL', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.transavia.com/nl-NL/aanbiedingen/'] },
  { name: 'Corendon', websiteUrl: 'https://www.corendon.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.corendon.nl/last-minutes', 'https://www.corendon.nl/acties'] },
  { name: 'TUI NL', websiteUrl: 'https://www.tui.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tui.nl/aanbiedingen/', 'https://www.tui.nl/last-minutes/'] },
  { name: 'Sunweb', websiteUrl: 'https://www.sunweb.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sunweb.nl/aanbiedingen', 'https://www.sunweb.nl/last-minutes'] },
  { name: 'D-reizen', websiteUrl: 'https://www.d-reizen.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.d-reizen.nl/aanbiedingen', 'https://www.d-reizen.nl/last-minutes'] },
  { name: 'ANWB', websiteUrl: 'https://www.anwb.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.anwb.nl/vakantie/aanbiedingen', 'https://www.anwb.nl/acties'] },
  { name: 'Booking.com NL', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.nl.html'] },
  { name: 'Expedia NL', websiteUrl: 'https://www.expedia.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.nl/deals'] },
  { name: 'Hotels.nl', websiteUrl: 'https://www.hotels.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hotels.nl/aanbiedingen'] },
  { name: 'Trivago NL', websiteUrl: 'https://www.trivago.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.nl/'] },
  { name: 'Vliegtickets.nl', websiteUrl: 'https://www.vliegtickets.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vliegtickets.nl/aanbiedingen'] },
  { name: 'CheapTickets NL', websiteUrl: 'https://www.cheaptickets.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.cheaptickets.nl/aanbiedingen'] },
  { name: 'Prijsvrij', websiteUrl: 'https://www.prijsvrij.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.prijsvrij.nl/aanbiedingen', 'https://www.prijsvrij.nl/last-minutes'] },
  { name: 'VakantieDiscounter', websiteUrl: 'https://www.vakantiediscounter.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vakantiediscounter.nl/aanbiedingen'] },
  { name: 'Center Parcs NL', websiteUrl: 'https://www.centerparcs.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.centerparcs.nl/nl-nl/aanbiedingen'] },
  { name: 'Landal GreenParks', websiteUrl: 'https://www.landal.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.landal.nl/aanbiedingen'] },
  { name: 'Roompot', websiteUrl: 'https://www.roompot.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.roompot.nl/aanbiedingen/', 'https://www.roompot.nl/last-minutes/'] },
  { name: 'EuroParcs', websiteUrl: 'https://www.europarcs.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europarcs.nl/aanbiedingen/'] },
  { name: 'Eurocamp NL', websiteUrl: 'https://www.eurocamp.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.eurocamp.nl/aanbiedingen'] },
  { name: 'EasyJet NL', websiteUrl: 'https://www.easyjet.com/nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easyjet.com/nl/aanbiedingen'] },
  { name: 'Ryanair NL', websiteUrl: 'https://www.ryanair.com/nl/nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/nl/nl/aanbiedingen'] },
  { name: 'Vueling NL', websiteUrl: 'https://www.vueling.com/nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vueling.com/nl/aanbiedingen'] },
  { name: 'FlixBus NL', websiteUrl: 'https://www.flixbus.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.nl/acties'] },
  { name: 'Europcar NL', websiteUrl: 'https://www.europcar.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.nl/aanbiedingen'] },
  { name: 'Sixt NL', websiteUrl: 'https://www.sixt.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sixt.nl/aanbiedingen/'] },
  { name: 'Hertz NL', websiteUrl: 'https://www.hertz.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.nl/aanbiedingen'] },
  { name: 'Sunnycars NL', websiteUrl: 'https://www.sunnycars.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sunnycars.nl/acties'] },
  { name: 'Pharos Reizen', websiteUrl: 'https://www.pharosreizen.nl', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pharosreizen.nl/aanbiedingen'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'ING NL', websiteUrl: 'https://www.ing.nl', categorySlug: 'finans', seedUrls: ['https://www.ing.nl/acties', 'https://www.ing.nl/aanbiedingen'] },
  { name: 'ABN AMRO', websiteUrl: 'https://www.abnamro.nl', categorySlug: 'finans', seedUrls: ['https://www.abnamro.nl/nl/prive/acties/index.html'] },
  { name: 'Rabobank', websiteUrl: 'https://www.rabobank.nl', categorySlug: 'finans', seedUrls: ['https://www.rabobank.nl/acties'] },
  { name: 'SNS Bank', websiteUrl: 'https://www.snsbank.nl', categorySlug: 'finans', seedUrls: ['https://www.snsbank.nl/acties'] },
  { name: 'ASN Bank', websiteUrl: 'https://www.asnbank.nl', categorySlug: 'finans', seedUrls: ['https://www.asnbank.nl/acties'] },
  { name: 'Triodos Bank NL', websiteUrl: 'https://www.triodos.nl', categorySlug: 'finans', seedUrls: ['https://www.triodos.nl/acties'] },
  { name: 'Knab', websiteUrl: 'https://www.knab.nl', categorySlug: 'finans', seedUrls: ['https://www.knab.nl/acties'] },
  { name: 'bunq', websiteUrl: 'https://www.bunq.com/nl', categorySlug: 'finans', seedUrls: ['https://www.bunq.com/nl/acties'] },
  { name: 'N26 NL', websiteUrl: 'https://n26.com/nl-nl', categorySlug: 'finans', seedUrls: ['https://n26.com/nl-nl/acties'] },
  { name: 'Revolut NL', websiteUrl: 'https://www.revolut.com/nl-NL', categorySlug: 'finans', seedUrls: ['https://www.revolut.com/nl-NL/aanbiedingen'] },
  { name: 'Tikkie', websiteUrl: 'https://www.tikkie.me', categorySlug: 'finans', seedUrls: ['https://www.tikkie.me/acties'] },
  { name: 'Adyen', websiteUrl: 'https://www.adyen.com/nl_NL', categorySlug: 'finans', seedUrls: ['https://www.adyen.com/nl_NL/'] },
  { name: 'Klarna NL', websiteUrl: 'https://www.klarna.com/nl', categorySlug: 'finans', seedUrls: ['https://www.klarna.com/nl/deals/'] },
  { name: 'AfterPay NL', websiteUrl: 'https://www.afterpay.nl', categorySlug: 'finans', seedUrls: ['https://www.afterpay.nl/acties'] },
  { name: 'BinckBank', websiteUrl: 'https://www.binck.nl', categorySlug: 'finans', seedUrls: ['https://www.binck.nl/acties'] },
  { name: 'DeGiro', websiteUrl: 'https://www.degiro.nl', categorySlug: 'finans', seedUrls: ['https://www.degiro.nl/acties'] },
  { name: 'eToro NL', websiteUrl: 'https://www.etoro.com/nl', categorySlug: 'finans', seedUrls: ['https://www.etoro.com/nl/trading/'] },
  { name: 'Meesman', websiteUrl: 'https://www.meesman.nl', categorySlug: 'finans', seedUrls: ['https://www.meesman.nl/acties'] },
  { name: 'Brand New Day', websiteUrl: 'https://www.brandnewday.nl', categorySlug: 'finans', seedUrls: ['https://www.brandnewday.nl/acties'] },
  { name: 'Nationale-Nederlanden', websiteUrl: 'https://www.nn.nl', categorySlug: 'finans', seedUrls: ['https://www.nn.nl/acties', 'https://www.nn.nl/aanbiedingen'] },
  { name: 'Aegon NL', websiteUrl: 'https://www.aegon.nl', categorySlug: 'finans', seedUrls: ['https://www.aegon.nl/acties'] },
  { name: 'a.s.r.', websiteUrl: 'https://www.asr.nl', categorySlug: 'finans', seedUrls: ['https://www.asr.nl/acties'] },
  { name: 'Florius', websiteUrl: 'https://www.florius.nl', categorySlug: 'finans', seedUrls: ['https://www.florius.nl/acties'] },
  { name: 'Hypotheek24', websiteUrl: 'https://www.hypotheek24.nl', categorySlug: 'finans', seedUrls: ['https://www.hypotheek24.nl/acties'] },
  { name: 'Freo', websiteUrl: 'https://www.freo.nl', categorySlug: 'finans', seedUrls: ['https://www.freo.nl/acties'] },
  { name: 'Visa NL', websiteUrl: 'https://www.visa.nl', categorySlug: 'finans', seedUrls: ['https://www.visa.nl/aanbiedingen'] },
  { name: 'Mastercard NL', websiteUrl: 'https://www.mastercard.nl', categorySlug: 'finans', seedUrls: ['https://www.mastercard.nl/nl-nl/consumer/aanbiedingen-promoties.html'] },
  { name: 'American Express NL', websiteUrl: 'https://www.americanexpress.com/nl', categorySlug: 'finans', seedUrls: ['https://www.americanexpress.com/nl/offers/'] },
  { name: 'PayPal NL', websiteUrl: 'https://www.paypal.com/nl', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/nl/webapps/mpp/offers'] },
  { name: 'Wise NL', websiteUrl: 'https://wise.com/nl', categorySlug: 'finans', seedUrls: ['https://wise.com/nl/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Centraal Beheer', websiteUrl: 'https://www.centraalbeheer.nl', categorySlug: 'sigorta', seedUrls: ['https://www.centraalbeheer.nl/acties', 'https://www.centraalbeheer.nl/aanbiedingen'] },
  { name: 'OHRA', websiteUrl: 'https://www.ohra.nl', categorySlug: 'sigorta', seedUrls: ['https://www.ohra.nl/acties'] },
  { name: 'Interpolis', websiteUrl: 'https://www.interpolis.nl', categorySlug: 'sigorta', seedUrls: ['https://www.interpolis.nl/acties'] },
  { name: 'FBTO', websiteUrl: 'https://www.fbto.nl', categorySlug: 'sigorta', seedUrls: ['https://www.fbto.nl/acties'] },
  { name: 'Ditzo', websiteUrl: 'https://www.ditzo.nl', categorySlug: 'sigorta', seedUrls: ['https://www.ditzo.nl/acties'] },
  { name: 'InShared', websiteUrl: 'https://www.inshared.nl', categorySlug: 'sigorta', seedUrls: ['https://www.inshared.nl/acties'] },
  { name: 'Univé', websiteUrl: 'https://www.unive.nl', categorySlug: 'sigorta', seedUrls: ['https://www.unive.nl/acties', 'https://www.unive.nl/aanbiedingen'] },
  { name: 'CZ', websiteUrl: 'https://www.cz.nl', categorySlug: 'sigorta', seedUrls: ['https://www.cz.nl/acties'] },
  { name: 'Menzis', websiteUrl: 'https://www.menzis.nl', categorySlug: 'sigorta', seedUrls: ['https://www.menzis.nl/acties'] },
  { name: 'Zilveren Kruis', websiteUrl: 'https://www.zilverenkruis.nl', categorySlug: 'sigorta', seedUrls: ['https://www.zilverenkruis.nl/acties'] },
  { name: 'VGZ', websiteUrl: 'https://www.vgz.nl', categorySlug: 'sigorta', seedUrls: ['https://www.vgz.nl/acties'] },
  { name: 'DSW', websiteUrl: 'https://www.dsw.nl', categorySlug: 'sigorta', seedUrls: ['https://www.dsw.nl/acties'] },
  { name: 'ONVZ', websiteUrl: 'https://www.onvz.nl', categorySlug: 'sigorta', seedUrls: ['https://www.onvz.nl/acties'] },
  { name: 'Zorg en Zekerheid', websiteUrl: 'https://www.zorgenzekerheid.nl', categorySlug: 'sigorta', seedUrls: ['https://www.zorgenzekerheid.nl/acties'] },
  { name: 'Independer', websiteUrl: 'https://www.independer.nl', categorySlug: 'sigorta', seedUrls: ['https://www.independer.nl/acties', 'https://www.independer.nl/aanbiedingen'] },
  { name: 'Polis Direct', websiteUrl: 'https://www.polisdirect.nl', categorySlug: 'sigorta', seedUrls: ['https://www.polisdirect.nl/acties'] },
  { name: 'Allianz NL', websiteUrl: 'https://www.allianz.nl', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.nl/acties'] },
  { name: 'AXA NL', websiteUrl: 'https://www.axa.nl', categorySlug: 'sigorta', seedUrls: ['https://www.axa.nl/acties'] },
  { name: 'Reaal', websiteUrl: 'https://www.reaal.nl', categorySlug: 'sigorta', seedUrls: ['https://www.reaal.nl/acties'] },
  { name: 'Delta Lloyd', websiteUrl: 'https://www.deltalloyd.nl', categorySlug: 'sigorta', seedUrls: ['https://www.deltalloyd.nl/acties'] },
  { name: 'Klaverblad', websiteUrl: 'https://www.klaverblad.nl', categorySlug: 'sigorta', seedUrls: ['https://www.klaverblad.nl/acties'] },
  { name: 'De Goudse', websiteUrl: 'https://www.goudse.nl', categorySlug: 'sigorta', seedUrls: ['https://www.goudse.nl/acties'] },
  { name: 'Besured', websiteUrl: 'https://www.besured.nl', categorySlug: 'sigorta', seedUrls: ['https://www.besured.nl/acties'] },
  { name: 'Just NL', websiteUrl: 'https://www.just.nl', categorySlug: 'sigorta', seedUrls: ['https://www.just.nl/acties'] },
  { name: 'Energiedirect', websiteUrl: 'https://www.energiedirect.nl', categorySlug: 'sigorta', seedUrls: ['https://www.energiedirect.nl/acties'] },
  { name: 'Vattenfall NL', websiteUrl: 'https://www.vattenfall.nl', categorySlug: 'sigorta', seedUrls: ['https://www.vattenfall.nl/acties', 'https://www.vattenfall.nl/aanbiedingen'] },
  { name: 'Essent', websiteUrl: 'https://www.essent.nl', categorySlug: 'sigorta', seedUrls: ['https://www.essent.nl/acties'] },
  { name: 'Eneco', websiteUrl: 'https://www.eneco.nl', categorySlug: 'sigorta', seedUrls: ['https://www.eneco.nl/acties'] },
  { name: 'Budget Energie', websiteUrl: 'https://www.budgetenergie.nl', categorySlug: 'sigorta', seedUrls: ['https://www.budgetenergie.nl/acties'] },
  { name: 'Greenchoice', websiteUrl: 'https://www.greenchoice.nl', categorySlug: 'sigorta', seedUrls: ['https://www.greenchoice.nl/acties'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota NL', websiteUrl: 'https://www.toyota.nl', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.nl/aanbiedingen', 'https://www.toyota.nl/acties'] },
  { name: 'Volkswagen NL', websiteUrl: 'https://www.volkswagen.nl', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.nl/nl/modellen/aanbiedingen.html'] },
  { name: 'BMW NL', websiteUrl: 'https://www.bmw.nl', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.nl/nl/offers.html'] },
  { name: 'Mercedes-Benz NL', websiteUrl: 'https://www.mercedes-benz.nl', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.nl/passengercars/campaigns.html'] },
  { name: 'Audi NL', websiteUrl: 'https://www.audi.nl', categorySlug: 'otomobil', seedUrls: ['https://www.audi.nl/nl/web/nl/modellen/aanbiedingen.html'] },
  { name: 'Hyundai NL', websiteUrl: 'https://www.hyundai.com/nl', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/nl/aanbiedingen'] },
  { name: 'Kia NL', websiteUrl: 'https://www.kia.com/nl', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/nl/aanbiedingen/'] },
  { name: 'Ford NL', websiteUrl: 'https://www.ford.nl', categorySlug: 'otomobil', seedUrls: ['https://www.ford.nl/aanbiedingen/', 'https://www.ford.nl/acties/'] },
  { name: 'Nissan NL', websiteUrl: 'https://www.nissan.nl', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.nl/aanbiedingen.html'] },
  { name: 'Renault NL', websiteUrl: 'https://www.renault.nl', categorySlug: 'otomobil', seedUrls: ['https://www.renault.nl/aanbiedingen.html'] },
  { name: 'Peugeot NL', websiteUrl: 'https://www.peugeot.nl', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.nl/aanbiedingen.html'] },
  { name: 'Citroën NL', websiteUrl: 'https://www.citroen.nl', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.nl/aanbiedingen.html'] },
  { name: 'Opel NL', websiteUrl: 'https://www.opel.nl', categorySlug: 'otomobil', seedUrls: ['https://www.opel.nl/aanbiedingen.html'] },
  { name: 'Skoda NL', websiteUrl: 'https://www.skoda.nl', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.nl/aanbiedingen'] },
  { name: 'SEAT NL', websiteUrl: 'https://www.seat.nl', categorySlug: 'otomobil', seedUrls: ['https://www.seat.nl/aanbiedingen.html'] },
  { name: 'Cupra NL', websiteUrl: 'https://www.cupraofficial.nl', categorySlug: 'otomobil', seedUrls: ['https://www.cupraofficial.nl/aanbiedingen.html'] },
  { name: 'Tesla NL', websiteUrl: 'https://www.tesla.com/nl_nl', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/nl_nl/'] },
  { name: 'Volvo NL', websiteUrl: 'https://www.volvocars.com/nl', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/nl/aanbiedingen/'] },
  { name: 'Mazda NL', websiteUrl: 'https://www.mazda.nl', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.nl/aanbiedingen/'] },
  { name: 'Suzuki NL', websiteUrl: 'https://www.suzuki.nl', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.nl/aanbiedingen'] },
  { name: 'Honda NL', websiteUrl: 'https://www.honda.nl', categorySlug: 'otomobil', seedUrls: ['https://www.honda.nl/cars/aanbiedingen.html'] },
  { name: 'Dacia NL', websiteUrl: 'https://www.dacia.nl', categorySlug: 'otomobil', seedUrls: ['https://www.dacia.nl/aanbiedingen.html'] },
  { name: 'Fiat NL', websiteUrl: 'https://www.fiat.nl', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.nl/aanbiedingen'] },
  { name: 'Jeep NL', websiteUrl: 'https://www.jeep.nl', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.nl/aanbiedingen'] },
  { name: 'Porsche NL', websiteUrl: 'https://www.porsche.com/netherlands', categorySlug: 'otomobil', seedUrls: ['https://www.porsche.com/netherlands/'] },
  { name: 'Shell NL', websiteUrl: 'https://www.shell.nl', categorySlug: 'otomobil', seedUrls: ['https://www.shell.nl/motorists/acties.html'] },
  { name: 'BP NL', websiteUrl: 'https://www.bp.com/nl_nl', categorySlug: 'otomobil', seedUrls: ['https://www.bp.com/nl_nl/netherlands/home/producten-en-services/acties.html'] },
  { name: 'TotalEnergies NL', websiteUrl: 'https://www.totalenergies.nl', categorySlug: 'otomobil', seedUrls: ['https://www.totalenergies.nl/acties'] },
  { name: 'Halfords NL', websiteUrl: 'https://www.halfords.nl', categorySlug: 'otomobil', seedUrls: ['https://www.halfords.nl/aanbiedingen', 'https://www.halfords.nl/acties'] },
  { name: 'Kwik-Fit NL', websiteUrl: 'https://www.kwik-fit.nl', categorySlug: 'otomobil', seedUrls: ['https://www.kwik-fit.nl/acties'] },
  { name: 'AutoTrack', websiteUrl: 'https://www.autotrack.nl', categorySlug: 'otomobil', seedUrls: ['https://www.autotrack.nl/aanbiedingen'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Bol.com Books', websiteUrl: 'https://www.bol.com/nl/nl/m/boeken/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bol.com/nl/nl/m/boeken/aanbiedingen/'] },
  { name: 'Bruna', websiteUrl: 'https://www.bruna.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bruna.nl/aanbiedingen', 'https://www.bruna.nl/sale'] },
  { name: 'Boekenvoordeel', websiteUrl: 'https://www.boekenvoordeel.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.boekenvoordeel.nl/acties'] },
  { name: 'Kobo NL', websiteUrl: 'https://www.kobo.com/nl/nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kobo.com/nl/nl/p/deals'] },
  { name: 'Storytel NL', websiteUrl: 'https://www.storytel.com/nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.storytel.com/nl/nl/aanbiedingen'] },
  { name: 'BookSpot', websiteUrl: 'https://www.bookspot.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookspot.nl/aanbiedingen'] },
  { name: 'Netflix NL', websiteUrl: 'https://www.netflix.com/nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/nl/'] },
  { name: 'Disney+ NL', websiteUrl: 'https://www.disneyplus.com/nl-nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/nl-nl/'] },
  { name: 'HBO Max NL', websiteUrl: 'https://www.max.com/nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.max.com/nl/'] },
  { name: 'Videoland', websiteUrl: 'https://www.videoland.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.videoland.com/acties'] },
  { name: 'Spotify NL', websiteUrl: 'https://www.spotify.com/nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/nl/premium/'] },
  { name: 'Apple Music NL', websiteUrl: 'https://www.apple.com/nl/apple-music', categorySlug: 'kitap-hobi', seedUrls: ['https://www.apple.com/nl/apple-music/'] },
  { name: 'PlayStation NL', websiteUrl: 'https://store.playstation.com/nl-nl', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/nl-nl/category/deals'] },
  { name: 'Xbox NL', websiteUrl: 'https://www.xbox.com/nl-NL', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/nl-NL/games/sales-and-specials'] },
  { name: 'Nintendo NL', websiteUrl: 'https://www.nintendo.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.nl/store/deals/'] },
  { name: 'Steam NL', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Game Mania', websiteUrl: 'https://www.gamemania.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gamemania.nl/sale', 'https://www.gamemania.nl/aanbiedingen'] },
  { name: 'Nedgame', websiteUrl: 'https://www.nedgame.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nedgame.nl/aanbiedingen/'] },
  { name: 'Lego NL', websiteUrl: 'https://www.lego.com/nl-nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/nl-nl/categories/sales-and-deals'] },
  { name: 'Intertoys', websiteUrl: 'https://www.intertoys.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.intertoys.nl/aanbiedingen', 'https://www.intertoys.nl/sale'] },
  { name: 'Toys R Us NL', websiteUrl: 'https://www.toysrus.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.nl/aanbiedingen'] },
  { name: 'Ticketmaster NL', websiteUrl: 'https://www.ticketmaster.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ticketmaster.nl/acties'] },
  { name: 'Pathé', websiteUrl: 'https://www.pathe.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.pathe.nl/acties'] },
  { name: 'Vue NL', websiteUrl: 'https://www.vue.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.vue.nl/acties'] },
  { name: 'Kinepolis NL', websiteUrl: 'https://kinepolis.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://kinepolis.nl/acties'] },
  { name: 'Efteling', websiteUrl: 'https://www.efteling.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.efteling.com/nl/aanbiedingen'] },
  { name: 'Walibi Holland', websiteUrl: 'https://www.walibi.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.walibi.nl/nl/acties'] },
  { name: 'Madurodam', websiteUrl: 'https://www.madurodam.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.madurodam.nl/nl/acties'] },
  { name: 'ARTIS', websiteUrl: 'https://www.artis.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.artis.nl/nl/acties/'] },
  { name: 'Burgers\' Zoo', websiteUrl: 'https://www.burgerszoo.nl', categorySlug: 'kitap-hobi', seedUrls: ['https://www.burgerszoo.nl/acties'] },
  { name: 'Udemy NL', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=nl&src=ukw&q=deals'] },
];

const AMAZON_SLUGS = new Set(['amazon-nl']);

function deduplicateBrands(brands: BrandEntry[]): BrandEntry[] {
  const seen = new Map<string, BrandEntry>();
  for (const b of brands) {
    const slug = toSlug(b.name);
    if (!seen.has(slug)) seen.set(slug, b);
  }
  return Array.from(seen.values());
}

async function main() {
  console.log('=== NL Brand Seeding Script ===');
  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Total brands (after dedup): ${uniqueBrands.length}`);

  let brandsOk = 0;
  let sourcesCreated = 0;
  let sourcesUpdated = 0;
  let errors = 0;
  const missingCategories = new Set<string>();

  for (const entry of uniqueBrands) {
    try {
      const slug = toSlug(entry.name);
      const category = await prisma.category.findUnique({ where: { slug: entry.categorySlug } });
      if (!category) {
        missingCategories.add(entry.categorySlug);
        continue;
      }

      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'NL' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'NL', categoryId: category.id },
      });

      brandsOk++;

      const isAmazon = AMAZON_SLUGS.has(slug);

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
            schedule: '0 10 * * *',
            agingDays: 14,
            market: 'NL',
            isActive: !isAmazon,
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'NL' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'NL', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active NL sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
