import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
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
  // 1) Alışveriş / Shopping — 5 more (25 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Kaufhof',
    websiteUrl: 'https://www.galeria.de',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.galeria.de/sale/'],
  },
  {
    name: 'Mindfactory',
    websiteUrl: 'https://www.mindfactory.de',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.mindfactory.de/Highlights/MindStar'],
  },
  {
    name: 'Proshop DE',
    websiteUrl: 'https://www.proshop.de',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.proshop.de/Angebote'],
  },
  {
    name: 'Computeruniverse',
    websiteUrl: 'https://www.computeruniverse.net',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.computeruniverse.net/de/deals'],
  },
  {
    name: 'Voelkner',
    websiteUrl: 'https://www.voelkner.de',
    categorySlug: 'alisveris',
    seedUrls: ['https://www.voelkner.de/deals/'],
  },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 5 more (25 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Dyson Elektronik DE',
    websiteUrl: 'https://www.dyson.de',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.dyson.de/angebote'],
  },
  {
    name: 'Sennheiser',
    websiteUrl: 'https://www.sennheiser.com/de-de',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.sennheiser.com/de-de/sale'],
  },
  {
    name: 'Beyerdynamic',
    websiteUrl: 'https://www.beyerdynamic.com',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.beyerdynamic.com/sale.html'],
  },
  {
    name: 'Medion',
    websiteUrl: 'https://www.medion.com/de',
    categorySlug: 'elektronik',
    seedUrls: ['https://www.medion.com/de/shop/angebote'],
  },
  {
    name: 'AVM Fritz',
    websiteUrl: 'https://avm.de',
    categorySlug: 'elektronik',
    seedUrls: ['https://avm.de/aktionen/'],
  },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion — 5 more (25 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Bogner',
    websiteUrl: 'https://www.bogner.com/de-de',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.bogner.com/de-de/sale/'],
  },
  {
    name: 'Gerry Weber',
    websiteUrl: 'https://www.gerryweber.com/de-de',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.gerryweber.com/de-de/sale/'],
  },
  {
    name: 'Orsay',
    websiteUrl: 'https://www.orsay.com/de-de',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.orsay.com/de-de/sale/'],
  },
  {
    name: 'Mango DE',
    websiteUrl: 'https://shop.mango.com/de',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://shop.mango.com/de/damen/sale'],
  },
  {
    name: 'Calzedonia DE',
    websiteUrl: 'https://www.calzedonia.com/de',
    categorySlug: 'giyim-moda',
    seedUrls: ['https://www.calzedonia.com/de/sale.html'],
  },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Hornbach',
    websiteUrl: 'https://www.hornbach.de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.hornbach.de/aktuell/angebote/'],
  },
  {
    name: 'OBI',
    websiteUrl: 'https://www.obi.de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.obi.de/angebote/'],
  },
  {
    name: 'Bauhaus DE',
    websiteUrl: 'https://www.bauhaus.info',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.bauhaus.info/aktionen'],
  },
  {
    name: 'toom',
    websiteUrl: 'https://www.toom.de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.toom.de/angebote/'],
  },
  {
    name: 'Hagebau',
    websiteUrl: 'https://www.hagebau.de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.hagebau.de/angebote/'],
  },
  {
    name: 'Miele DE',
    websiteUrl: 'https://www.miele.de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.miele.de/haushalt/aktionen-3498.htm'],
  },
  {
    name: 'Bosch Hausgeraete',
    websiteUrl: 'https://www.bosch-home.com/de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.bosch-home.com/de/angebote'],
  },
  {
    name: 'Siemens Hausgeraete',
    websiteUrl: 'https://www.siemens-home.bsh-group.com/de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.siemens-home.bsh-group.com/de/angebote'],
  },
  {
    name: 'moebel.de',
    websiteUrl: 'https://www.moebel.de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.moebel.de/sale/'],
  },
  {
    name: 'Waschbaer',
    websiteUrl: 'https://www.waschbaer.de',
    categorySlug: 'ev-yasam',
    seedUrls: ['https://www.waschbaer.de/sale/'],
  },

  // ═══════════════════════════════════════════════════════
  // 5) Spor & Outdoor / Sports & Outdoor — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Engelhorn Sport',
    websiteUrl: 'https://www.engelhorn.de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.engelhorn.de/sport/sale/'],
  },
  {
    name: 'Keller Sports',
    websiteUrl: 'https://www.kfrancesports.com/de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.kfrancesports.com/de/sale/'],
  },
  {
    name: 'Bike24',
    websiteUrl: 'https://www.bike24.de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.bike24.de/sale'],
  },
  {
    name: 'Fahrrad.de',
    websiteUrl: 'https://www.fahrrad.de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.fahrrad.de/sale/'],
  },
  {
    name: 'Bike-Discount',
    websiteUrl: 'https://www.bike-discount.de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.bike-discount.de/de/sale'],
  },
  {
    name: 'SC24',
    websiteUrl: 'https://www.sc24.com',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.sc24.com/sale/'],
  },
  {
    name: 'Sport-Tiedje',
    websiteUrl: 'https://www.sport-tiedje.de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.sport-tiedje.de/angebote'],
  },
  {
    name: 'Campz',
    websiteUrl: 'https://www.campz.de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.campz.de/sale/'],
  },
  {
    name: 'Sportsshoes DE',
    websiteUrl: 'https://www.sportsshoes.com/de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.sportsshoes.com/de/sale/'],
  },
  {
    name: 'New Balance DE',
    websiteUrl: 'https://www.newbalance.de',
    categorySlug: 'spor-outdoor',
    seedUrls: ['https://www.newbalance.de/de/sale/'],
  },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty & Personal Care — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Parfuemerie Pieper',
    websiteUrl: 'https://www.pieper.de',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.pieper.de/sale/'],
  },
  {
    name: 'Cocopanda DE',
    websiteUrl: 'https://www.cocopanda.de',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.cocopanda.de/sale'],
  },
  {
    name: 'kosmetik4less',
    websiteUrl: 'https://www.kosmetik4less.de',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.kosmetik4less.de/sale/'],
  },
  {
    name: 'Kneipp',
    websiteUrl: 'https://www.kneipp.com/de_de',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.kneipp.com/de_de/angebote/'],
  },
  {
    name: 'Bipa DE',
    websiteUrl: 'https://www.bipa.at',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.bipa.at/angebote'],
  },
  {
    name: 'Ecco Verde',
    websiteUrl: 'https://www.ecco-verde.de',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.ecco-verde.de/sale/'],
  },
  {
    name: 'Yves Rocher DE',
    websiteUrl: 'https://www.yves-rocher.de',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.yves-rocher.de/angebote'],
  },
  {
    name: 'Clinique DE',
    websiteUrl: 'https://www.clinique.de',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.clinique.de/angebote'],
  },
  {
    name: 'Manhattan Cosmetics',
    websiteUrl: 'https://www.manhattan-cosmetics.com/de',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://www.manhattan-cosmetics.com/de/angebote/'],
  },
  {
    name: 'Nuxe DE',
    websiteUrl: 'https://de.nuxe.com',
    categorySlug: 'kozmetik-kisisel-bakim',
    seedUrls: ['https://de.nuxe.com/sale.html'],
  },

  // ═══════════════════════════════════════════════════════
  // 7) Seyahat & Ulaşım / Travel & Transport — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Condor',
    websiteUrl: 'https://www.condor.com/de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.condor.com/de/angebote.jsp'],
  },
  {
    name: 'SunExpress DE',
    websiteUrl: 'https://www.sunexpress.com/de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.sunexpress.com/de/angebote/'],
  },
  {
    name: 'Wizzair DE',
    websiteUrl: 'https://wizzair.com/de-de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://wizzair.com/de-de#/offers'],
  },
  {
    name: 'DER Touristik',
    websiteUrl: 'https://www.dertouristik.com',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.dertour.de/angebote'],
  },
  {
    name: 'Schauinsland Reisen',
    websiteUrl: 'https://www.schauinsland-reisen.de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.schauinsland-reisen.de/angebote/'],
  },
  {
    name: 'alltours',
    websiteUrl: 'https://www.alltours.de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.alltours.de/angebote'],
  },
  {
    name: 'AIDA Cruises',
    websiteUrl: 'https://www.aida.de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.aida.de/angebote.html'],
  },
  {
    name: 'Travelcircus',
    websiteUrl: 'https://www.travelcircus.de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.travelcircus.de/angebote'],
  },
  {
    name: 'Urlaubsguru DE',
    websiteUrl: 'https://www.urlaubsguru.de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.urlaubsguru.de/reiseangebote/'],
  },
  {
    name: 'Berge und Meer',
    websiteUrl: 'https://www.berge-meer.de',
    categorySlug: 'seyahat-ulasim',
    seedUrls: ['https://www.berge-meer.de/angebote'],
  },

  // ═══════════════════════════════════════════════════════
  // 8) Otomobil / Automotive — 10 more (20 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Renault DE',
    websiteUrl: 'https://www.renault.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.renault.de/angebote.html'],
  },
  {
    name: 'Peugeot DE',
    websiteUrl: 'https://www.peugeot.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.peugeot.de/angebote.html'],
  },
  {
    name: 'Fiat DE',
    websiteUrl: 'https://www.fiat.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.fiat.de/angebote'],
  },
  {
    name: 'Mazda DE',
    websiteUrl: 'https://www.mazda.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.mazda.de/angebote/'],
  },
  {
    name: 'Nissan DE',
    websiteUrl: 'https://www.nissan.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.nissan.de/angebote.html'],
  },
  {
    name: 'Volvo DE',
    websiteUrl: 'https://www.volvocars.com/de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.volvocars.com/de/angebote/'],
  },
  {
    name: 'Suzuki DE',
    websiteUrl: 'https://www.suzuki.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.suzuki.de/automobile/aktionen.html'],
  },
  {
    name: 'Mitsubishi DE',
    websiteUrl: 'https://www.mitsubishi-motors.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.mitsubishi-motors.de/aktionen'],
  },
  {
    name: 'Tirendo',
    websiteUrl: 'https://www.tirendo.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.tirendo.de/angebote/'],
  },
  {
    name: 'Reifendirekt',
    websiteUrl: 'https://www.reifendirekt.de',
    categorySlug: 'otomobil',
    seedUrls: ['https://www.reifendirekt.de/angebote'],
  },

  // ═══════════════════════════════════════════════════════
  // 9) Gıda & Market / Grocery & Market — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'ALDI Nord',
    websiteUrl: 'https://www.aldi-nord.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.aldi-nord.de/angebote.html'],
  },
  {
    name: 'Norma',
    websiteUrl: 'https://www.norma-online.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.norma-online.de/de/angebote/'],
  },
  {
    name: 'Globus',
    websiteUrl: 'https://www.globus.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.globus.de/angebote/'],
  },
  {
    name: 'tegut',
    websiteUrl: 'https://www.tegut.com',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.tegut.com/angebote.html'],
  },
  {
    name: 'Combi',
    websiteUrl: 'https://www.combi.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.combi.de/angebote/'],
  },
  {
    name: 'Famila',
    websiteUrl: 'https://www.famila.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.famila.de/angebote'],
  },
  {
    name: 'denn\'s Biomarkt',
    websiteUrl: 'https://www.denns-biomarkt.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.denns-biomarkt.de/angebote/'],
  },
  {
    name: 'Alnatura',
    websiteUrl: 'https://www.alnatura.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.alnatura.de/de-de/angebote/'],
  },
  {
    name: 'Rossmann Markt',
    websiteUrl: 'https://www.rossmann.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.rossmann.de/de/angebote'],
  },
  {
    name: 'dm Markt',
    websiteUrl: 'https://www.dm.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.dm.de/angebote'],
  },
  {
    name: 'Knuspr',
    websiteUrl: 'https://www.knuspr.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.knuspr.de/angebote'],
  },
  {
    name: 'Marley Spoon DE',
    websiteUrl: 'https://marleyspoon.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://marleyspoon.de/angebote'],
  },
  {
    name: 'Dinkelbacker',
    websiteUrl: 'https://www.kamps.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.kamps.de/angebote/'],
  },
  {
    name: 'Trinkgut',
    websiteUrl: 'https://www.trinkgut.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.trinkgut.de/angebote/'],
  },
  {
    name: 'Netto Marken-Discount',
    websiteUrl: 'https://www.netto-online.de',
    categorySlug: 'gida-market',
    seedUrls: ['https://www.netto-online.de/angebote/'],
  },

  // ═══════════════════════════════════════════════════════
  // 10) Yeme & İçme / Food & Dining — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Starbucks DE',
    websiteUrl: 'https://www.starbucks.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.starbucks.de/angebote'],
  },
  {
    name: 'Dunkin DE',
    websiteUrl: 'https://www.dunkindonuts.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.dunkindonuts.de/de/angebote.html'],
  },
  {
    name: 'Dean and David',
    websiteUrl: 'https://www.deananddavid.com',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.deananddavid.com/de/angebote/'],
  },
  {
    name: 'Backwerk',
    websiteUrl: 'https://www.back-werk.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.back-werk.de/aktionen/'],
  },
  {
    name: 'Ditsch',
    websiteUrl: 'https://www.ditsch.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.ditsch.de/aktionen/'],
  },
  {
    name: 'Sausalitos',
    websiteUrl: 'https://www.sausalitos.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.sausalitos.de/angebote/'],
  },
  {
    name: 'CurryWurst Express',
    websiteUrl: 'https://www.currywurstexpress.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.currywurstexpress.de/angebote/'],
  },
  {
    name: 'Call a Pizza',
    websiteUrl: 'https://www.call-a-pizza.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.call-a-pizza.de/angebote'],
  },
  {
    name: 'Smileys Pizza',
    websiteUrl: 'https://www.smileyspizza.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.smileyspizza.de/angebote/'],
  },
  {
    name: 'Freddy Fresh',
    websiteUrl: 'https://www.freddyfresh.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.freddyfresh.de/angebote'],
  },
  {
    name: 'Jim Block',
    websiteUrl: 'https://www.jimblock.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.jimblock.de/aktionen/'],
  },
  {
    name: 'Cotidiano',
    websiteUrl: 'https://www.cotidiano.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.cotidiano.de/angebote/'],
  },
  {
    name: 'Five Guys DE',
    websiteUrl: 'https://www.fiveguys.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.fiveguys.de/angebote'],
  },
  {
    name: 'Frittenwerk',
    websiteUrl: 'https://www.frittenwerk.com',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.frittenwerk.com/angebote/'],
  },
  {
    name: 'Taco Bell DE',
    websiteUrl: 'https://www.tacobell.de',
    categorySlug: 'yeme-icme',
    seedUrls: ['https://www.tacobell.de/angebote/'],
  },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Nuernberger Versicherung',
    websiteUrl: 'https://www.nuernberger.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.nuernberger.de/produkte/'],
  },
  {
    name: 'Provinzial',
    websiteUrl: 'https://www.provinzial.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.provinzial.de/privatkunden/'],
  },
  {
    name: 'LVM Versicherung',
    websiteUrl: 'https://www.lvm.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.lvm.de/privatkunden/'],
  },
  {
    name: 'Barmer',
    websiteUrl: 'https://www.barmer.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.barmer.de/unsere-leistungen/'],
  },
  {
    name: 'Techniker Krankenkasse',
    websiteUrl: 'https://www.tk.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.tk.de/techniker/leistungen-und-mitgliedschaft/'],
  },
  {
    name: 'AOK',
    websiteUrl: 'https://www.aok.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.aok.de/pk/leistungen/'],
  },
  {
    name: 'DAK Gesundheit',
    websiteUrl: 'https://www.dak.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.dak.de/dak/leistungen/'],
  },
  {
    name: 'Signal Iduna',
    websiteUrl: 'https://www.signal-iduna.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.signal-iduna.de/privatkunden.html'],
  },
  {
    name: 'Continentale',
    websiteUrl: 'https://www.continentale.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.continentale.de/privatkunden/'],
  },
  {
    name: 'Alte Leipziger',
    websiteUrl: 'https://www.alte-leipziger.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.alte-leipziger.de/privatkunden/'],
  },
  {
    name: 'Stuttgarter Versicherung',
    websiteUrl: 'https://www.stuttgarter.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.stuttgarter.de/privatkunden/'],
  },
  {
    name: 'Barmenia',
    websiteUrl: 'https://www.barmenia.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.barmenia.de/produkte/'],
  },
  {
    name: 'VHV Versicherung',
    websiteUrl: 'https://www.vhv.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.vhv.de/privatkunden/'],
  },
  {
    name: 'WGV Versicherung',
    websiteUrl: 'https://www.wgv.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.wgv.de/versicherungen/'],
  },
  {
    name: 'Hanse Merkur',
    websiteUrl: 'https://www.hansemerkur.de',
    categorySlug: 'sigorta',
    seedUrls: ['https://www.hansemerkur.de/produkte/'],
  },

  // ═══════════════════════════════════════════════════════
  // 12) Kitap & Hobi / Books & Hobbies — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Osiander',
    websiteUrl: 'https://www.osiander.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.osiander.de/sale/'],
  },
  {
    name: 'Jokers',
    websiteUrl: 'https://www.jokers.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.jokers.de/sale/'],
  },
  {
    name: 'ebook.de',
    websiteUrl: 'https://www.ebook.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.ebook.de/de/pathfinder/sale/'],
  },
  {
    name: 'Elbenwald',
    websiteUrl: 'https://www.elbenwald.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.elbenwald.de/Sale/'],
  },
  {
    name: 'EMP DE',
    websiteUrl: 'https://www.emp.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.emp.de/sale/'],
  },
  {
    name: 'Games Workshop DE',
    websiteUrl: 'https://www.games-workshop.com/de-DE',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.games-workshop.com/de-DE/Angebote'],
  },
  {
    name: 'Fantasy In',
    websiteUrl: 'https://www.fantasyin.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.fantasyin.de/sale/'],
  },
  {
    name: 'Spiele Max',
    websiteUrl: 'https://www.spiele-max.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.spiele-max.de/sale/'],
  },
  {
    name: 'Smyths Toys DE',
    websiteUrl: 'https://www.smythstoys.com/de/de-de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.smythstoys.com/de/de-de/angebote/'],
  },
  {
    name: 'Kosmos Verlag',
    websiteUrl: 'https://www.kosmos.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.kosmos.de/sale/'],
  },
  {
    name: 'Schmidt Spiele',
    websiteUrl: 'https://www.schmidtspiele.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.schmidtspiele.de/angebote/'],
  },
  {
    name: 'Modulor',
    websiteUrl: 'https://www.modulor.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.modulor.de/sale/'],
  },
  {
    name: 'Boesner',
    websiteUrl: 'https://www.boesner.com',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.boesner.com/angebote'],
  },
  {
    name: 'Gerstaecker',
    websiteUrl: 'https://www.gerstaecker.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.gerstaecker.de/sale/'],
  },
  {
    name: 'Schreiber und Leser',
    websiteUrl: 'https://www.schreiberundleser.de',
    categorySlug: 'kitap-hobi',
    seedUrls: ['https://www.schreiberundleser.de/angebote/'],
  },

  // ═══════════════════════════════════════════════════════
  // 13) Finans / Finance — 15 more (15 → 30)
  // ═══════════════════════════════════════════════════════
  {
    name: 'Deutsche Bank',
    websiteUrl: 'https://www.deutsche-bank.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.deutsche-bank.de/pk/angebote.html'],
  },
  {
    name: 'Postbank',
    websiteUrl: 'https://www.postbank.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.postbank.de/privatkunden/angebote.html'],
  },
  {
    name: 'Consorsbank',
    websiteUrl: 'https://www.consorsbank.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.consorsbank.de/ev/Angebote/'],
  },
  {
    name: 'comdirect',
    websiteUrl: 'https://www.comdirect.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.comdirect.de/angebote/'],
  },
  {
    name: 'Targobank',
    websiteUrl: 'https://www.targobank.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.targobank.de/de/angebote.html'],
  },
  {
    name: 'Norisbank',
    websiteUrl: 'https://www.norisbank.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.norisbank.de/angebote/'],
  },
  {
    name: 'HypoVereinsbank',
    websiteUrl: 'https://www.hypovereinsbank.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.hypovereinsbank.de/hvb/angebote'],
  },
  {
    name: 'Sparda Bank',
    websiteUrl: 'https://www.sparda.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.sparda.de/angebote/'],
  },
  {
    name: 'Volksbank',
    websiteUrl: 'https://www.volksbank.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.volksbank.de/privatkunden/angebote.html'],
  },
  {
    name: 'Wuestenrot',
    websiteUrl: 'https://www.wuestenrot.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.wuestenrot.de/de/angebote.html'],
  },
  {
    name: 'Santander DE',
    websiteUrl: 'https://www.santander.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.santander.de/angebote/'],
  },
  {
    name: 'Vivid Money',
    websiteUrl: 'https://vivid.money/de-de',
    categorySlug: 'finans',
    seedUrls: ['https://vivid.money/de-de/'],
  },
  {
    name: 'Tomorrow Bank',
    websiteUrl: 'https://www.tomorrow.one',
    categorySlug: 'finans',
    seedUrls: ['https://www.tomorrow.one/de-DE/'],
  },
  {
    name: 'Weltsparen',
    websiteUrl: 'https://www.weltsparen.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.weltsparen.de/angebote/'],
  },
  {
    name: 'Barclays DE',
    websiteUrl: 'https://www.barclays.de',
    categorySlug: 'finans',
    seedUrls: ['https://www.barclays.de/angebote/'],
  },
];

async function main() {
  console.log('=== DE Market Supplemental Brand Seed ===\n');

  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map(c => [c.slug, c.id]));

  // Print category summary
  const categoryCounts: Record<string, number> = {};
  for (const b of BRANDS) {
    categoryCounts[b.categorySlug] = (categoryCounts[b.categorySlug] || 0) + 1;
  }
  console.log('Brands per category:');
  for (const [slug, count] of Object.entries(categoryCounts)) {
    console.log(`  ${slug}: +${count}`);
  }
  console.log(`  TOTAL: ${BRANDS.length}\n`);

  let brandOk = 0, brandErr = 0, srcNew = 0;

  for (const b of BRANDS) {
    const slug = toSlug(b.name);
    const categoryId = catMap.get(b.categorySlug);
    if (!categoryId) {
      console.warn('  Category not found: ' + b.categorySlug);
      brandErr++;
      continue;
    }

    try {
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'DE' as any } },
        update: { name: b.name, websiteUrl: b.websiteUrl, categoryId },
        create: {
          name: b.name,
          slug,
          websiteUrl: b.websiteUrl,
          market: 'DE' as any,
          isActive: true,
          categoryId,
        },
      });

      for (const seedUrl of b.seedUrls) {
        const existing = await prisma.crawlSource.findFirst({
          where: { brandId: brand.id, seedUrl: { has: seedUrl } },
        });
        if (!existing) {
          await prisma.crawlSource.create({
            data: {
              brandId: brand.id,
              name: `${b.name} Deals`,
              crawlMethod: CrawlMethod.HTML,
              seedUrls: [seedUrl],
              market: 'DE' as any,
              maxDepth: 2,
              schedule: '0 4 * * *',
              agingDays: 7,
              isActive: true,
            },
          });
          srcNew++;
        }
      }
      brandOk++;
    } catch (err) {
      console.error('  Error: ' + b.name + ' — ' + (err as Error).message);
      brandErr++;
    }
  }

  console.log('\n=== Summary ===');
  console.log('Brands: ' + brandOk + ' ok, ' + brandErr + ' errors');
  console.log('New sources: ' + srcNew);
  await prisma.$disconnect();
}

main().catch(console.error);
