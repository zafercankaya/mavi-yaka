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
  // 1) Alışveriş / Shopping (alisveris) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon IT', websiteUrl: 'https://www.amazon.it', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.it/deals', 'https://www.amazon.it/gp/goldbox'] },
  { name: 'eBay IT', websiteUrl: 'https://www.ebay.it', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.it/deals', 'https://www.ebay.it/e/offerte'] },
  { name: 'Subito.it', websiteUrl: 'https://www.subito.it', categorySlug: 'alisveris', seedUrls: ['https://www.subito.it/'] },
  { name: 'Zalando IT', websiteUrl: 'https://www.zalando.it', categorySlug: 'alisveris', seedUrls: ['https://www.zalando.it/saldi/'] },
  { name: 'Yoox', websiteUrl: 'https://www.yoox.com/it', categorySlug: 'alisveris', seedUrls: ['https://www.yoox.com/it/outlet'] },
  { name: 'AliExpress IT', websiteUrl: 'https://it.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://it.aliexpress.com/campaign/wow/gcp/ae/channel/gcp/acm/bottommodule-ede/ae/it/deals'] },
  { name: 'Temu IT', websiteUrl: 'https://www.temu.com/it', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/it/deals'] },
  { name: 'IBS.it', websiteUrl: 'https://www.ibs.it', categorySlug: 'alisveris', seedUrls: ['https://www.ibs.it/offerte'] },
  { name: 'Unieuro', websiteUrl: 'https://www.unieuro.it', categorySlug: 'alisveris', seedUrls: ['https://www.unieuro.it/online/offerte', 'https://www.unieuro.it/online/promozioni'] },
  { name: 'MediaWorld', websiteUrl: 'https://www.mediaworld.it', categorySlug: 'alisveris', seedUrls: ['https://www.mediaworld.it/offerte'] },
  { name: 'Euronics IT', websiteUrl: 'https://www.euronics.it', categorySlug: 'alisveris', seedUrls: ['https://www.euronics.it/offerte/', 'https://www.euronics.it/promozioni/'] },
  { name: 'Leroy Merlin IT', websiteUrl: 'https://www.leroymerlin.it', categorySlug: 'alisveris', seedUrls: ['https://www.leroymerlin.it/offerte.html'] },
  { name: 'Trony', websiteUrl: 'https://www.trony.it', categorySlug: 'alisveris', seedUrls: ['https://www.trony.it/volantino'] },
  { name: 'Acqua e Sapone', websiteUrl: 'https://www.acquaesapone.it', categorySlug: 'alisveris', seedUrls: ['https://www.acquaesapone.it/volantino/'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'MediaWorld Elettronica', websiteUrl: 'https://www.mediaworld.it', categorySlug: 'elektronik', seedUrls: ['https://www.mediaworld.it/offerte'] },
  { name: 'Unieuro Elettronica', websiteUrl: 'https://www.unieuro.it', categorySlug: 'elektronik', seedUrls: ['https://www.unieuro.it/online/offerte', 'https://www.unieuro.it/online/Informatica/'] },
  { name: 'Euronics Elettronica', websiteUrl: 'https://www.euronics.it', categorySlug: 'elektronik', seedUrls: ['https://www.euronics.it/offerte/', 'https://www.euronics.it/informatica/'] },
  { name: 'Apple IT', websiteUrl: 'https://www.apple.com/it', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/it/shop/buy-iphone'] },
  { name: 'Samsung IT', websiteUrl: 'https://www.samsung.com/it', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/it/offer/'] },
  { name: 'Huawei IT', websiteUrl: 'https://consumer.huawei.com/it', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/it/offer/'] },
  { name: 'HP IT', websiteUrl: 'https://www.hp.com/it-it', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/it-it/shop/offerte'] },
  { name: 'Lenovo IT', websiteUrl: 'https://www.lenovo.com/it/it', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/it/it/d/offerte/'] },
  { name: 'Dell IT', websiteUrl: 'https://www.dell.com/it-it', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/it-it/shop/offerte'] },
  { name: 'Sony IT', websiteUrl: 'https://www.sony.it', categorySlug: 'elektronik', seedUrls: ['https://www.sony.it/promozioni'] },
  { name: 'Bose IT', websiteUrl: 'https://www.bose.it', categorySlug: 'elektronik', seedUrls: ['https://www.bose.it/offerte'] },
  { name: 'Dyson IT', websiteUrl: 'https://www.dyson.it', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.it/offerte'] },
  { name: 'Xiaomi IT', websiteUrl: 'https://www.mi.com/it', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/it/sale'] },
  { name: 'Google Store IT', websiteUrl: 'https://store.google.com/it', categorySlug: 'elektronik', seedUrls: ['https://store.google.com/it/collection/offers'] },
  { name: 'GameStop IT', websiteUrl: 'https://www.gamestop.it', categorySlug: 'elektronik', seedUrls: ['https://www.gamestop.it/offerte', 'https://www.gamestop.it/promozioni'] },
  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Zalando Moda IT', websiteUrl: 'https://www.zalando.it', categorySlug: 'giyim-moda', seedUrls: ['https://www.zalando.it/saldi/', 'https://www.zalando.it/saldi/donna/'] },
  { name: 'Yoox Moda', websiteUrl: 'https://www.yoox.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.yoox.com/it/outlet'] },
  { name: 'Luisaviaroma', websiteUrl: 'https://www.luisaviaroma.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.luisaviaroma.com/it-it/shop/donna?lvrid=_go_sale'] },
  { name: 'OVS', websiteUrl: 'https://www.ovs.it', categorySlug: 'giyim-moda', seedUrls: ['https://www.ovs.it/saldi/', 'https://www.ovs.it/promozioni/'] },
  { name: 'Benetton', websiteUrl: 'https://www.benetton.com', categorySlug: 'giyim-moda', seedUrls: ['https://it.benetton.com/saldi/'] },
  { name: 'Guess IT', websiteUrl: 'https://www.guess.eu/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.eu/it/saldi/', 'https://www.guess.eu/it/saldi/donna/'] },
  { name: 'Diesel IT', websiteUrl: 'https://www.diesel.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.diesel.com/it/sale/'] },
  { name: 'Pinko', websiteUrl: 'https://www.pinko.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.pinko.com/it/saldi/'] },
  { name: 'Rinascente', websiteUrl: 'https://www.rinascente.it', categorySlug: 'giyim-moda', seedUrls: ['https://www.rinascente.it/saldi', 'https://www.rinascente.it/offerte'] },
  { name: 'Coin', websiteUrl: 'https://www.coin.it', categorySlug: 'giyim-moda', seedUrls: ['https://www.coin.it/saldi'] },
  { name: 'H&M IT', websiteUrl: 'https://www2.hm.com/it_it', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/it_it/saldi.html'] },
  { name: 'Zara IT', websiteUrl: 'https://www.zara.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/it/it/saldi-l1702.html'] },
  { name: 'Antony Morato', websiteUrl: 'https://www.antonymorato.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.antonymorato.com/it/saldi.html'] },
  { name: 'Original Marines', websiteUrl: 'https://www.originalmarines.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.originalmarines.com/saldi/'] },
  { name: 'ASOS IT', websiteUrl: 'https://www.asos.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.asos.com/it/donna/saldi/', 'https://www.asos.com/it/uomo/saldi/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA IT', websiteUrl: 'https://www.ikea.com/it', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/it/it/offers/', 'https://www.ikea.com/it/it/campaigns/'] },
  { name: 'Leroy Merlin Casa', websiteUrl: 'https://www.leroymerlin.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.leroymerlin.it/offerte.html', 'https://www.leroymerlin.it/promozioni.html'] },
  { name: 'Conforama IT', websiteUrl: 'https://www.conforama.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.conforama.it/offerte'] },
  { name: 'Zara Home IT', websiteUrl: 'https://www.zarahome.com/it', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/it/saldi-l1713.html'] },
  { name: 'Kasanova', websiteUrl: 'https://www.kasanova.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.kasanova.com/saldi/'] },
  { name: 'La Feltrinelli Casa', websiteUrl: 'https://www.lafeltrinelli.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.lafeltrinelli.it/offerte'] },
  { name: 'Bricocenter', websiteUrl: 'https://www.bricocenter.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricocenter.it/offerte.html'] },
  { name: 'ManoMano IT', websiteUrl: 'https://www.manomano.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.manomano.it/offerte'] },
  { name: 'Coincasa', websiteUrl: 'https://www.coincasa.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.coincasa.it/saldi'] },
  { name: 'Kartell', websiteUrl: 'https://www.kartell.com/it', categorySlug: 'ev-yasam', seedUrls: ['https://www.kartell.com/it/sale/'] },
  { name: 'Poliform', websiteUrl: 'https://www.poliform.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.poliform.it/promozioni/'] },
  { name: 'Natuzzi', websiteUrl: 'https://www.natuzzi.com/it', categorySlug: 'ev-yasam', seedUrls: ['https://www.natuzzi.com/it/promozioni.html'] },
  { name: 'La Rinascente Casa', websiteUrl: 'https://www.rinascente.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.rinascente.it/casa/'] },
  { name: 'OBI IT', websiteUrl: 'https://www.obi-italia.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.obi-italia.it/offerte'] },
  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Coop IT', websiteUrl: 'https://www.e-coop.it', categorySlug: 'gida-market', seedUrls: ['https://www.e-coop.it/offerte'] },
  { name: 'Carrefour IT', websiteUrl: 'https://www.carrefour.it', categorySlug: 'gida-market', seedUrls: ['https://www.carrefour.it/offerte', 'https://www.carrefour.it/volantino'] },
  { name: 'Eurospin', websiteUrl: 'https://www.eurospin.it', categorySlug: 'gida-market', seedUrls: ['https://www.eurospin.it/volantino/'] },
  { name: 'MD Discount', websiteUrl: 'https://www.mdspa.it', categorySlug: 'gida-market', seedUrls: ['https://www.mdspa.it/volantino/'] },
  { name: 'Penny Market IT', websiteUrl: 'https://www.pennymarket.it', categorySlug: 'gida-market', seedUrls: ['https://www.pennymarket.it/offerte', 'https://www.pennymarket.it/volantino'] },
  { name: 'Pam Panorama', websiteUrl: 'https://www.pampanorama.it', categorySlug: 'gida-market', seedUrls: ['https://www.pampanorama.it/offerte', 'https://www.pampanorama.it/volantino'] },
  { name: 'NaturaSì', websiteUrl: 'https://www.naturasi.it', categorySlug: 'gida-market', seedUrls: ['https://www.naturasi.it/offerte', 'https://www.naturasi.it/promozioni'] },
  { name: 'Todis', websiteUrl: 'https://www.todis.it', categorySlug: 'gida-market', seedUrls: ['https://www.todis.it/volantino/'] },
  { name: 'In\'s Mercato', websiteUrl: 'https://www.insmercato.it', categorySlug: 'gida-market', seedUrls: ['https://www.insmercato.it/offerte/'] },
  { name: 'Iperal', websiteUrl: 'https://www.iperal.it', categorySlug: 'gida-market', seedUrls: ['https://www.iperal.it/offerte/'] },
  { name: 'Basko', websiteUrl: 'https://www.basko.it', categorySlug: 'gida-market', seedUrls: ['https://www.basko.it/offerte/'] },
  { name: 'Decò', websiteUrl: 'https://www.supermercatideco.it', categorySlug: 'gida-market', seedUrls: ['https://www.supermercatideco.it/offerte/'] },
  { name: 'Coop Online', websiteUrl: 'https://www.coopshop.it', categorySlug: 'gida-market', seedUrls: ['https://www.coopshop.it/offerte'] },
  { name: 'Il Gigante', websiteUrl: 'https://www.ilgigante.net', categorySlug: 'gida-market', seedUrls: ['https://www.ilgigante.net/offerte/'] },
  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Drink (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'TheFork IT', websiteUrl: 'https://www.thefork.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.thefork.it/offerte-ristoranti', 'https://www.thefork.it/promozioni'] },
  { name: 'Just Eat IT', websiteUrl: 'https://www.justeat.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.justeat.it/offerte'] },
  { name: 'McDonald\'s IT', websiteUrl: 'https://www.mcdonalds.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.it/offerte', 'https://www.mcdonalds.it/promozioni'] },
  { name: 'Burger King IT', websiteUrl: 'https://www.burgerking.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.it/offerte', 'https://www.burgerking.it/promozioni'] },
  { name: 'KFC IT', websiteUrl: 'https://www.kfc.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.it/promozioni'] },
  { name: 'Domino\'s IT', websiteUrl: 'https://www.dominos.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.it/offerte'] },
  { name: 'Lavazza', websiteUrl: 'https://www.lavazza.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.lavazza.it/it/promozioni'] },
  { name: 'Barilla', websiteUrl: 'https://www.barilla.com/it-it', categorySlug: 'yeme-icme', seedUrls: ['https://www.barilla.com/it-it/promozioni'] },
  { name: 'Mulino Bianco', websiteUrl: 'https://www.mulinobianco.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.mulinobianco.it/promozioni'] },
  { name: 'Ferrero', websiteUrl: 'https://www.ferrero.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.ferrero.it/promozioni'] },
  { name: 'Nutella IT', websiteUrl: 'https://www.nutella.com/it', categorySlug: 'yeme-icme', seedUrls: ['https://www.nutella.com/it/it/promozioni'] },
  { name: 'Tannico', websiteUrl: 'https://www.tannico.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.tannico.it/offerte.html'] },
  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'L\'Erbolario', websiteUrl: 'https://www.erbolario.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.erbolario.com/promozioni'] },
  { name: 'L\'Oréal IT', websiteUrl: 'https://www.loreal-paris.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.it/offerte'] },
  { name: 'Lancôme IT', websiteUrl: 'https://www.lancome.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lancome.it/offerte', 'https://www.lancome.it/promozioni'] },
  { name: 'Collistar', websiteUrl: 'https://www.collistar.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.collistar.it/promozioni/'] },
  { name: 'Acqua di Parma', websiteUrl: 'https://www.acquadiparma.com/it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.acquadiparma.com/it/offerte/'] },
  { name: 'eFarma', websiteUrl: 'https://www.efarma.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.efarma.com/offerte.html'] },
  { name: 'Notino IT', websiteUrl: 'https://www.notino.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.notino.it/offerte/', 'https://www.notino.it/saldi/'] },
  { name: 'Pinalli', websiteUrl: 'https://www.pinalli.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pinalli.it/offerte/', 'https://www.pinalli.it/saldi/'] },
  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nike IT', websiteUrl: 'https://www.nike.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/it/w/saldi-3yaep'] },
  { name: 'Adidas IT', websiteUrl: 'https://www.adidas.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.it/saldi', 'https://www.adidas.it/outlet'] },
  { name: 'New Balance IT', websiteUrl: 'https://www.newbalance.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.it/saldi/'] },
  { name: 'Under Armour IT', websiteUrl: 'https://www.underarmour.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.it/it-it/outlet/'] },
  { name: 'Salomon IT', websiteUrl: 'https://www.salomon.com/it-it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/it-it/sale.html'] },
  { name: 'Diadora', websiteUrl: 'https://www.diadora.com/it/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.diadora.com/it/it/saldi/'] },
  { name: 'Saucony IT', websiteUrl: 'https://www.saucony.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.saucony.com/it/saldi/'] },
  { name: 'Converse IT', websiteUrl: 'https://www.converse.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com/it/saldi/'] },
  { name: 'Vans IT', websiteUrl: 'https://www.vans.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.it/saldi.html'] },
  { name: 'Timberland IT', websiteUrl: 'https://www.timberland.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.it/saldi.html'] },
  { name: 'Patagonia IT', websiteUrl: 'https://eu.patagonia.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://eu.patagonia.com/it/it/shop/web-specials'] },
  { name: 'La Sportiva', websiteUrl: 'https://www.lasportiva.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lasportiva.com/it/outlet'] },
  { name: 'Dolomite', websiteUrl: 'https://www.dolomite.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.dolomite.it/outlet/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Trenitalia', websiteUrl: 'https://www.trenitalia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trenitalia.com/it/offerte.html'] },
  { name: 'Ryanair IT', websiteUrl: 'https://www.ryanair.com/it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/it/it/offerte'] },
  { name: 'Wizz Air IT', websiteUrl: 'https://wizzair.com/it-it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://wizzair.com/it-it#/offers'] },
  { name: 'Volotea', websiteUrl: 'https://www.volotea.com/it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.volotea.com/it/offerte/'] },
  { name: 'Neos Air', websiteUrl: 'https://www.neosair.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.neosair.it/offerte'] },
  { name: 'Expedia IT', websiteUrl: 'https://www.expedia.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.it/offerte'] },
  { name: 'Volagratis', websiteUrl: 'https://www.volagratis.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.volagratis.com/offerte'] },
  { name: 'Lastminute.com IT', websiteUrl: 'https://www.it.lastminute.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.it.lastminute.com/offerte'] },
  { name: 'Piratinviaggio', websiteUrl: 'https://www.piratinviaggio.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.piratinviaggio.it/'] },
  { name: 'Trivago IT', websiteUrl: 'https://www.trivago.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.it/'] },
  { name: 'Skyscanner IT', websiteUrl: 'https://www.skyscanner.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.it/offerte'] },
  { name: 'Kayak IT', websiteUrl: 'https://www.kayak.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.it/deals'] },
  { name: 'BlaBlaCar IT', websiteUrl: 'https://www.blablacar.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.blablacar.it/'] },
  { name: 'Alpitour', websiteUrl: 'https://www.alpitour.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.alpitour.it/offerte'] },
  { name: 'Veratour', websiteUrl: 'https://www.veratour.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.veratour.it/offerte/'] },
  { name: 'Eden Viaggi', websiteUrl: 'https://www.edenviaggi.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.edenviaggi.it/offerte/'] },
  { name: 'Grimaldi Lines', websiteUrl: 'https://www.grimaldi-lines.com/it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.grimaldi-lines.com/it/offerte'] },
  { name: 'Costa Crociere', websiteUrl: 'https://www.costacrociere.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.costacrociere.it/offerte.html'] },
  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'BPER Banca', websiteUrl: 'https://www.bper.it', categorySlug: 'finans', seedUrls: ['https://www.bper.it/promozioni'] },
  { name: 'Hype', websiteUrl: 'https://www.hype.it', categorySlug: 'finans', seedUrls: ['https://www.hype.it/promozioni'] },
  { name: 'Revolut IT', websiteUrl: 'https://www.revolut.com/it-IT', categorySlug: 'finans', seedUrls: ['https://www.revolut.com/it-IT/promozioni'] },
  { name: 'PayPal IT', websiteUrl: 'https://www.paypal.com/it', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/it/webapps/mpp/offers'] },
  { name: 'Compass', websiteUrl: 'https://www.compass.it', categorySlug: 'finans', seedUrls: ['https://www.compass.it/promozioni'] },
  { name: 'Prestito Si', websiteUrl: 'https://www.prestitosi.it', categorySlug: 'finans', seedUrls: ['https://www.prestitosi.it/promozioni/'] },
  { name: 'Moneyfarm IT', websiteUrl: 'https://www.moneyfarm.com/it', categorySlug: 'finans', seedUrls: ['https://www.moneyfarm.com/it/promozioni/'] },
  { name: 'Illimity Bank', websiteUrl: 'https://www.illimitybank.com', categorySlug: 'finans', seedUrls: ['https://www.illimitybank.com/promozioni'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Allianz Italia', websiteUrl: 'https://www.allianz.it', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.it/promozioni.html'] },
  { name: 'Reale Mutua', websiteUrl: 'https://www.realemutua.it', categorySlug: 'sigorta', seedUrls: ['https://www.realemutua.it/promozioni'] },
  { name: 'Linear', websiteUrl: 'https://www.linear.it', categorySlug: 'sigorta', seedUrls: ['https://www.linear.it/offerte', 'https://www.linear.it/promozioni'] },
  { name: 'ConTe.it', websiteUrl: 'https://www.conte.it', categorySlug: 'sigorta', seedUrls: ['https://www.conte.it/offerte/', 'https://www.conte.it/promozioni/'] },
  { name: 'Genialloyd', websiteUrl: 'https://www.allianz.it/genialloyd', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.it/genialloyd/promozioni'] },
  { name: 'Prima Assicurazioni', websiteUrl: 'https://www.prima.it', categorySlug: 'sigorta', seedUrls: ['https://www.prima.it/offerte', 'https://www.prima.it/promozioni'] },
  { name: 'Facile.it Assicurazioni', websiteUrl: 'https://www.facile.it', categorySlug: 'sigorta', seedUrls: ['https://www.facile.it/assicurazioni.html'] },
  { name: 'Segugio.it', websiteUrl: 'https://www.segugio.it', categorySlug: 'sigorta', seedUrls: ['https://www.segugio.it/offerte/'] },
  { name: 'SOStariffe Assicurazioni', websiteUrl: 'https://www.sostariffe.it', categorySlug: 'sigorta', seedUrls: ['https://www.sostariffe.it/assicurazioni/'] },
  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Fiat', websiteUrl: 'https://www.fiat.it', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.it/offerte'] },
  { name: 'Alfa Romeo', websiteUrl: 'https://www.alfaromeo.it', categorySlug: 'otomobil', seedUrls: ['https://www.alfaromeo.it/offerte'] },
  { name: 'Lancia', websiteUrl: 'https://www.lancia.it', categorySlug: 'otomobil', seedUrls: ['https://www.lancia.it/offerte'] },
  { name: 'Ferrari', websiteUrl: 'https://www.ferrari.com/it-IT', categorySlug: 'otomobil', seedUrls: ['https://www.ferrari.com/it-IT/auto'] },
  { name: 'Abarth', websiteUrl: 'https://www.abarth.it', categorySlug: 'otomobil', seedUrls: ['https://www.abarth.it/offerte'] },
  { name: 'Mercedes-Benz IT', websiteUrl: 'https://www.mercedes-benz.it', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.it/passengercars/campaigns.html'] },
  { name: 'Toyota IT', websiteUrl: 'https://www.toyota.it', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.it/promozioni'] },
  { name: 'Hyundai IT', websiteUrl: 'https://www.hyundai.it', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.it/promozioni/'] },
  { name: 'Renault IT', websiteUrl: 'https://www.renault.it', categorySlug: 'otomobil', seedUrls: ['https://www.renault.it/offerte.html'] },
  { name: 'Opel IT', websiteUrl: 'https://www.opel.it', categorySlug: 'otomobil', seedUrls: ['https://www.opel.it/offerte.html'] },
  { name: 'Nissan IT', websiteUrl: 'https://www.nissan.it', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.it/offerte.html'] },
  { name: 'Honda IT', websiteUrl: 'https://www.honda.it', categorySlug: 'otomobil', seedUrls: ['https://www.honda.it/cars/offers.html'] },
  { name: 'Mazda IT', websiteUrl: 'https://www.mazda.it', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.it/offerte/'] },
  { name: 'Tesla IT', websiteUrl: 'https://www.tesla.com/it_it', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/it_it/inventory'] },
  { name: 'Cupra IT', websiteUrl: 'https://www.cupraofficial.it', categorySlug: 'otomobil', seedUrls: ['https://www.cupraofficial.it/offerte.html'] },
  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Feltrinelli', websiteUrl: 'https://www.lafeltrinelli.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lafeltrinelli.it/offerte', 'https://www.lafeltrinelli.it/promozioni'] },
  { name: 'Mondadori Store', websiteUrl: 'https://www.mondadoristore.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mondadoristore.it/offerte/', 'https://www.mondadoristore.it/promozioni/'] },
  { name: 'IBS', websiteUrl: 'https://www.ibs.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ibs.it/offerte', 'https://www.ibs.it/promozioni'] },
  { name: 'Libraccio', websiteUrl: 'https://www.libraccio.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.libraccio.it/offerte/'] },
  { name: 'Amazon Libri IT', websiteUrl: 'https://www.amazon.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.it/gp/bestsellers/books/', 'https://www.amazon.it/deals?category=books'] },
  { name: 'Adelphi', websiteUrl: 'https://www.adelphi.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.adelphi.it/catalogo/'] },
  { name: 'GameStop Giochi', websiteUrl: 'https://www.gamestop.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gamestop.it/offerte', 'https://www.gamestop.it/giocattoli/offerte'] },
  { name: 'LEGO IT', websiteUrl: 'https://www.lego.com/it-it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/it-it/categories/sales-and-deals'] },
  { name: 'Toys Center', websiteUrl: 'https://www.toyscenter.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toyscenter.it/offerte/', 'https://www.toyscenter.it/promozioni/'] },
  { name: 'Ravensburger IT', websiteUrl: 'https://www.ravensburger.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ravensburger.it/promozioni/'] },
  { name: 'Djeco IT', websiteUrl: 'https://www.djeco.com/it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.djeco.com/it/promozioni'] },
  { name: 'Spotify IT', websiteUrl: 'https://www.spotify.com/it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/it/premium/'] },
  { name: 'Netflix IT', websiteUrl: 'https://www.netflix.com/it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/it/'] },
  { name: 'Disney+ IT', websiteUrl: 'https://www.disneyplus.com/it-it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/it-it'] },
  { name: 'Sky IT', websiteUrl: 'https://www.sky.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sky.it/offerte', 'https://www.sky.it/promozioni'] },
  { name: 'DAZN IT', websiteUrl: 'https://www.dazn.com/it-IT', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dazn.com/it-IT/offers'] },
  { name: 'TimVision', websiteUrl: 'https://www.timvision.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.timvision.it/offerte'] },
  { name: 'PlayStation IT', websiteUrl: 'https://store.playstation.com/it-it', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/it-it/category/deals/'] },
  { name: 'Nintendo IT', websiteUrl: 'https://www.nintendo.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.it/Offerte/', 'https://www.nintendo.it/Nintendo-eShop/Offerte-e-promozioni/'] },
  { name: 'Steam IT', websiteUrl: 'https://store.steampowered.com/?l=italian', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/?l=italian'] },
  { name: 'Epic Games IT', websiteUrl: 'https://store.epicgames.com/it-IT', categorySlug: 'kitap-hobi', seedUrls: ['https://store.epicgames.com/it-IT/free-games', 'https://store.epicgames.com/it-IT/browse?sortBy=currentPrice&sortDir=ASC'] },
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
  console.log('=== IT Brand Seeding Script ===\n');
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
        where: { slug_market: { slug, market: 'IT' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'IT', categoryId },
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
            market: 'IT',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'IT' },
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

  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'IT' } });
  console.log(`Total active IT sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=IT');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
