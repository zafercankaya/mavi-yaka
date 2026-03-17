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
  // 1) Alışveriş / Shopping (alisveris) — 15 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Fnac', websiteUrl: 'https://www.fnac.com', categorySlug: 'alisveris', seedUrls: ['https://www.fnac.com/soldes', 'https://www.fnac.com/bonnes-affaires'] },
  { name: 'Darty', websiteUrl: 'https://www.darty.com', categorySlug: 'alisveris', seedUrls: ['https://www.darty.com/nav/extra/soldes', 'https://www.darty.com/nav/extra/promotions'] },
  { name: 'Boulanger', websiteUrl: 'https://www.boulanger.com', categorySlug: 'alisveris', seedUrls: ['https://www.boulanger.com/c/soldes', 'https://www.boulanger.com/c/promotions'] },
  { name: 'Auchan', websiteUrl: 'https://www.auchan.fr', categorySlug: 'alisveris', seedUrls: ['https://www.auchan.fr/bons-plans', 'https://www.auchan.fr/promotions'] },
  { name: 'Rue du Commerce', websiteUrl: 'https://www.rueducommerce.fr', categorySlug: 'alisveris', seedUrls: ['https://www.rueducommerce.fr/rayon/bons-plans', 'https://www.rueducommerce.fr/rayon/soldes'] },
  { name: 'Electro Depot', websiteUrl: 'https://www.electrodepot.fr', categorySlug: 'alisveris', seedUrls: ['https://www.electrodepot.fr/promotions', 'https://www.electrodepot.fr/destockage'] },
  { name: 'Priceclub FR', websiteUrl: 'https://www.priceclub.fr', categorySlug: 'alisveris', seedUrls: ['https://www.priceclub.fr/promotions'] },
  { name: 'GiFi', websiteUrl: 'https://www.gifi.fr', categorySlug: 'alisveris', seedUrls: ['https://www.gifi.fr/promotions', 'https://www.gifi.fr/soldes'] },
  { name: 'Action FR', websiteUrl: 'https://www.action.com/fr-fr', categorySlug: 'alisveris', seedUrls: ['https://www.action.com/fr-fr/offres/'] },
  { name: 'Hema FR', websiteUrl: 'https://www.hema.com/fr-fr', categorySlug: 'alisveris', seedUrls: ['https://www.hema.com/fr-fr/soldes'] },
  { name: 'Noz', websiteUrl: 'https://www.noz.fr', categorySlug: 'alisveris', seedUrls: ['https://www.noz.fr/nos-arrivages'] },
  { name: 'La Foir\'Fouille', websiteUrl: 'https://www.lafoirfouille.fr', categorySlug: 'alisveris', seedUrls: ['https://www.lafoirfouille.fr/promotions', 'https://www.lafoirfouille.fr/soldes'] },
  { name: 'Centrakor', websiteUrl: 'https://www.centrakor.com', categorySlug: 'alisveris', seedUrls: ['https://www.centrakor.com/promotions'] },
  { name: 'Maxplus', websiteUrl: 'https://www.maxplus.fr', categorySlug: 'alisveris', seedUrls: ['https://www.maxplus.fr/promotions'] },
  { name: 'Bazarchic', websiteUrl: 'https://www.bazarchic.com', categorySlug: 'alisveris', seedUrls: ['https://www.bazarchic.com/'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 15 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Orange FR', websiteUrl: 'https://www.orange.fr', categorySlug: 'elektronik', seedUrls: ['https://boutique.orange.fr/offres-mobile/', 'https://boutique.orange.fr/offres-internet/'] },
  { name: 'Fnac Tech', websiteUrl: 'https://www.fnac.com', categorySlug: 'elektronik', seedUrls: ['https://www.fnac.com/informatique/soldes', 'https://www.fnac.com/telephone-et-objet-connecte/soldes'] },
  { name: 'Darty Tech', websiteUrl: 'https://www.darty.com', categorySlug: 'elektronik', seedUrls: ['https://www.darty.com/nav/achat/informatique.html', 'https://www.darty.com/nav/achat/telephonie.html'] },
  { name: 'Boulanger Tech', websiteUrl: 'https://www.boulanger.com', categorySlug: 'elektronik', seedUrls: ['https://www.boulanger.com/c/informatique/promotions', 'https://www.boulanger.com/c/telephone-portable/promotions'] },
  { name: 'Apple FR', websiteUrl: 'https://www.apple.com/fr', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/fr/shop/go/product/refurbished'] },
  { name: 'HP FR', websiteUrl: 'https://www.hp.com/fr-fr', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/fr-fr/shop/offer.aspx'] },
  { name: 'Asus FR', websiteUrl: 'https://www.asus.com/fr', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/fr/deals/'] },
  { name: 'Acer FR', websiteUrl: 'https://store.acer.com/fr-fr', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/fr-fr/promotions'] },
  { name: 'Grosbill', websiteUrl: 'https://www.grosbill.com', categorySlug: 'elektronik', seedUrls: ['https://www.grosbill.com/promotions'] },
  { name: 'Materiel.net', websiteUrl: 'https://www.materiel.net', categorySlug: 'elektronik', seedUrls: ['https://www.materiel.net/promotions/'] },
  { name: 'TopAchat', websiteUrl: 'https://www.topachat.com', categorySlug: 'elektronik', seedUrls: ['https://www.topachat.com/pages/soldes.php'] },
  { name: 'Electro Depot Tech', websiteUrl: 'https://www.electrodepot.fr', categorySlug: 'elektronik', seedUrls: ['https://www.electrodepot.fr/informatique/promotions', 'https://www.electrodepot.fr/telephonie/promotions'] },
  { name: 'RED by SFR', websiteUrl: 'https://www.red-by-sfr.fr', categorySlug: 'elektronik', seedUrls: ['https://www.red-by-sfr.fr/forfaits-mobiles/', 'https://www.red-by-sfr.fr/box-internet/'] },
  { name: 'Sosh', websiteUrl: 'https://www.sosh.fr', categorySlug: 'elektronik', seedUrls: ['https://www.sosh.fr/forfaits-mobile', 'https://www.sosh.fr/offres-internet'] },
  { name: 'B&You', websiteUrl: 'https://www.bouyguestelecom.fr/forfaits-mobiles/b-and-you', categorySlug: 'elektronik', seedUrls: ['https://www.bouyguestelecom.fr/forfaits-mobiles/b-and-you'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 15 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Jules', websiteUrl: 'https://www.jules.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.jules.com/fr-fr/soldes/', 'https://www.jules.com/fr-fr/promotions/'] },
  { name: 'Promod', websiteUrl: 'https://www.promod.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.promod.fr/soldes/', 'https://www.promod.fr/promotions/'] },
  { name: 'Pimkie', websiteUrl: 'https://www.pimkie.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.pimkie.fr/soldes/', 'https://www.pimkie.fr/promotions/'] },
  { name: 'Mango FR', websiteUrl: 'https://shop.mango.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/fr/soldes'] },
  { name: 'Uniqlo FR', websiteUrl: 'https://www.uniqlo.com/fr/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/fr/fr/spl/sale'] },
  { name: 'Primark FR', websiteUrl: 'https://www.primark.com/fr-fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.primark.com/fr-fr/nouveautes'] },
  { name: 'Bonobo', websiteUrl: 'https://www.bonoboplanet.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.bonoboplanet.com/soldes/', 'https://www.bonoboplanet.com/promotions/'] },
  { name: 'Cache Cache', websiteUrl: 'https://www.cache-cache.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.cache-cache.fr/soldes/', 'https://www.cache-cache.fr/promotions/'] },
  { name: 'Jennyfer', websiteUrl: 'https://www.jennyfer.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.jennyfer.com/fr-fr/soldes/'] },
  { name: 'Sandro FR', websiteUrl: 'https://fr.sandro-paris.com', categorySlug: 'giyim-moda', seedUrls: ['https://fr.sandro-paris.com/fr/soldes/'] },
  { name: 'Maje FR', websiteUrl: 'https://fr.maje.com', categorySlug: 'giyim-moda', seedUrls: ['https://fr.maje.com/fr/soldes/'] },
  { name: 'Claudie Pierlot', websiteUrl: 'https://www.claudiepierlot.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.claudiepierlot.com/fr/soldes/'] },
  { name: 'Petit Bateau', websiteUrl: 'https://www.petit-bateau.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.petit-bateau.fr/soldes/', 'https://www.petit-bateau.fr/promotions/'] },
  { name: 'Tape a l\'Oeil', websiteUrl: 'https://www.tape-a-loeil.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.tape-a-loeil.com/soldes/', 'https://www.tape-a-loeil.com/bons-plans/'] },
  { name: 'Okaidi', websiteUrl: 'https://www.okaidi.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.okaidi.fr/soldes/', 'https://www.okaidi.fr/bons-plans/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living (ev-yasam) — 14 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Alinea', websiteUrl: 'https://www.alinea.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.alinea.com/soldes/', 'https://www.alinea.com/promotions/'] },
  { name: 'Habitat FR', websiteUrl: 'https://www.habitat.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.habitat.fr/soldes/'] },
  { name: 'Camif', websiteUrl: 'https://www.camif.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.camif.fr/soldes.html', 'https://www.camif.fr/promotions.html'] },
  { name: 'Delamaison', websiteUrl: 'https://www.delamaison.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.delamaison.fr/soldes/', 'https://www.delamaison.fr/promotions/'] },
  { name: 'Miliboo', websiteUrl: 'https://www.miliboo.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.miliboo.com/soldes.html', 'https://www.miliboo.com/promotions.html'] },
  { name: 'Le Bon Marche Maison', websiteUrl: 'https://www.24s.com/fr-fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.24s.com/fr-fr/maison/soldes'] },
  { name: 'Cocktail Scandinave', websiteUrl: 'https://www.cocktail-scandinave.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.cocktail-scandinave.fr/promotions/'] },
  { name: 'Gamm Vert', websiteUrl: 'https://www.gammvert.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.gammvert.fr/promotions', 'https://www.gammvert.fr/soldes'] },
  { name: 'Villaverde', websiteUrl: 'https://www.villaverde.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.villaverde.fr/promotions/'] },
  { name: 'Mr Bricolage', websiteUrl: 'https://www.mr-bricolage.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.mr-bricolage.fr/promotions', 'https://www.mr-bricolage.fr/soldes'] },
  { name: 'Bricomarche', websiteUrl: 'https://www.bricomarche.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricomarche.com/promotions.html', 'https://www.bricomarche.com/soldes.html'] },
  { name: 'Blooma', websiteUrl: 'https://www.castorama.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.castorama.fr/jardin/promotions'] },
  { name: 'Vente-Unique', websiteUrl: 'https://www.vente-unique.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.vente-unique.com/soldes.html', 'https://www.vente-unique.com/promotions.html'] },
  { name: 'Zodio', websiteUrl: 'https://www.zodio.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.zodio.fr/promotions/', 'https://www.zodio.fr/soldes/'] },

  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery (gida-market) — 14 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Intermarche', websiteUrl: 'https://www.intermarche.com', categorySlug: 'gida-market', seedUrls: ['https://www.intermarche.com/promotions', 'https://www.intermarche.com/catalogues'] },
  { name: 'Auchan Market', websiteUrl: 'https://www.auchan.fr', categorySlug: 'gida-market', seedUrls: ['https://www.auchan.fr/courses/promotions'] },
  { name: 'Aldi FR', websiteUrl: 'https://www.aldi.fr', categorySlug: 'gida-market', seedUrls: ['https://www.aldi.fr/nos-offres.html', 'https://www.aldi.fr/promotions.html'] },
  { name: 'Bio c\' Bon', websiteUrl: 'https://www.bio-c-bon.eu', categorySlug: 'gida-market', seedUrls: ['https://www.bio-c-bon.eu/promotions'] },
  { name: 'La Vie Claire', websiteUrl: 'https://www.lavieclaire.com', categorySlug: 'gida-market', seedUrls: ['https://www.lavieclaire.com/promotions/'] },
  { name: 'Biocoop', websiteUrl: 'https://www.biocoop.fr', categorySlug: 'gida-market', seedUrls: ['https://www.biocoop.fr/offres-du-moment'] },
  { name: 'Colruyt FR', websiteUrl: 'https://www.colruyt.fr', categorySlug: 'gida-market', seedUrls: ['https://www.colruyt.fr/fr/promotions'] },
  { name: 'Thiriet', websiteUrl: 'https://www.thiriet.com', categorySlug: 'gida-market', seedUrls: ['https://www.thiriet.com/promotions', 'https://www.thiriet.com/offres-du-moment'] },
  { name: 'Gorillas FR', websiteUrl: 'https://www.getir.com/fr', categorySlug: 'gida-market', seedUrls: ['https://www.getir.com/fr/offres'] },
  { name: 'Epicery', websiteUrl: 'https://www.epicery.com', categorySlug: 'gida-market', seedUrls: ['https://www.epicery.com/promotions'] },
  { name: 'Houra', websiteUrl: 'https://www.houra.fr', categorySlug: 'gida-market', seedUrls: ['https://www.houra.fr/promotions.html'] },
  { name: 'EAU de Paris Market', websiteUrl: 'https://www.eaudeparis.fr', categorySlug: 'gida-market', seedUrls: ['https://www.eaudeparis.fr/offres'] },
  { name: 'Carrefour City', websiteUrl: 'https://www.carrefour.fr', categorySlug: 'gida-market', seedUrls: ['https://www.carrefour.fr/promotions/city'] },
  { name: 'Dia FR', websiteUrl: 'https://www.dia.fr', categorySlug: 'gida-market', seedUrls: ['https://www.dia.fr/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Drink (yeme-icme) — 14 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Uber Eats FR', websiteUrl: 'https://www.ubereats.com/fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/fr/offers'] },
  { name: 'Deliveroo FR', websiteUrl: 'https://deliveroo.fr', categorySlug: 'yeme-icme', seedUrls: ['https://deliveroo.fr/fr/offers'] },
  { name: 'Just Eat FR', websiteUrl: 'https://www.just-eat.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.just-eat.fr/offres'] },
  { name: 'Burger King FR', websiteUrl: 'https://www.burgerking.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.fr/offres', 'https://www.burgerking.fr/bons-plans'] },
  { name: 'Subway FR', websiteUrl: 'https://www.subway.com/fr-FR', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/fr-FR/offers'] },
  { name: 'Paul FR', websiteUrl: 'https://www.paul.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.paul.fr/offres', 'https://www.paul.fr/bons-plans'] },
  { name: 'Flunch', websiteUrl: 'https://www.flunch.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.flunch.fr/offres/', 'https://www.flunch.fr/promotions/'] },
  { name: 'Starbucks FR', websiteUrl: 'https://www.starbucks.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.fr/offres'] },
  { name: 'Nespresso FR', websiteUrl: 'https://www.nespresso.com/fr/fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.nespresso.com/fr/fr/offres-promotions'] },
  { name: 'Chateau du Vin', websiteUrl: 'https://www.chateaunet.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.chateaunet.com/promotions/'] },
  { name: 'Nicolas FR', websiteUrl: 'https://www.nicolas.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.nicolas.com/promotions', 'https://www.nicolas.com/offres'] },
  { name: 'Courir FR Cafe', websiteUrl: 'https://www.lavazza.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.lavazza.fr/fr/offres.html'] },
  { name: 'Five Guys FR', websiteUrl: 'https://www.fiveguys.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.fiveguys.fr/offres'] },
  { name: 'Vente-Privee Vins', websiteUrl: 'https://www.veepee.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.veepee.fr/'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 14 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nocibe', websiteUrl: 'https://www.nocibe.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nocibe.fr/promotions', 'https://www.nocibe.fr/soldes'] },
  { name: 'Clarins FR', websiteUrl: 'https://www.clarins.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clarins.fr/offres/'] },
  { name: 'Nuxe', websiteUrl: 'https://fr.nuxe.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://fr.nuxe.com/offres-speciales/', 'https://fr.nuxe.com/promotions/'] },
  { name: 'Sisley Paris', websiteUrl: 'https://www.sisley-paris.com/fr-FR', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sisley-paris.com/fr-FR/offres/'] },
  { name: 'Caudalie', websiteUrl: 'https://fr.caudalie.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://fr.caudalie.com/offres-speciales.html'] },
  { name: 'Bioderma FR', websiteUrl: 'https://www.bioderma.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.fr/offres'] },
  { name: 'Avene FR', websiteUrl: 'https://www.eau-thermale-avene.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eau-thermale-avene.fr/offres'] },
  { name: 'Guerlain FR', websiteUrl: 'https://www.guerlain.com/fr/fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.guerlain.com/fr/fr/offres/'] },
  { name: 'Givenchy Beaute FR', websiteUrl: 'https://www.givenchybeauty.com/fr/fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.givenchybeauty.com/fr/fr/offres/'] },
  { name: 'YSL Beaute FR', websiteUrl: 'https://www.yslbeauty.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yslbeauty.fr/offres/'] },
  { name: 'Pharmacie Lafayette', websiteUrl: 'https://www.pharmacielafayette.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pharmacielafayette.com/promotions', 'https://www.pharmacielafayette.com/soldes'] },
  { name: 'Parapharmacie Leclerc', websiteUrl: 'https://www.e.leclerc', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.e.leclerc/cat/parapharmacie/promo'] },
  { name: 'MAC Cosmetics FR', websiteUrl: 'https://www.maccosmetics.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.fr/offres'] },
  { name: 'Rituals FR', websiteUrl: 'https://www.rituals.com/fr-fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/fr-fr/soldes'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 15 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon FR', websiteUrl: 'https://www.decathlon.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.fr/browse/c0-toutes-les-promotions/', 'https://www.decathlon.fr/browse/c0-soldes/'] },
  { name: 'Go Sport FR', websiteUrl: 'https://www.go-sport.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.go-sport.com/soldes/', 'https://www.go-sport.com/promotions/'] },
  { name: 'Foot Locker FR', websiteUrl: 'https://www.footlocker.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.footlocker.fr/fr/soldes/'] },
  { name: 'Puma FR', websiteUrl: 'https://fr.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://fr.puma.com/fr/fr/soldes', 'https://fr.puma.com/fr/fr/promotions'] },
  { name: 'Reebok FR', websiteUrl: 'https://www.reebok.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.fr/soldes', 'https://www.reebok.fr/outlet'] },
  { name: 'Asics FR', websiteUrl: 'https://www.asics.com/fr/fr-fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/fr/fr-fr/soldes/'] },
  { name: 'Columbia FR', websiteUrl: 'https://www.columbiasportswear.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.fr/soldes/'] },
  { name: 'The North Face FR', websiteUrl: 'https://www.thenorthface.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.fr/soldes/'] },
  { name: 'Under Armour FR', websiteUrl: 'https://www.underarmour.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.fr/c/fr/soldes/'] },
  { name: 'Timberland FR', websiteUrl: 'https://www.timberland.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.fr/soldes/'] },
  { name: 'Rossignol FR', websiteUrl: 'https://www.rossignol.com/fr/fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.rossignol.com/fr/fr/soldes/'] },
  { name: 'i-Run FR', websiteUrl: 'https://www.i-run.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.i-run.fr/soldes/', 'https://www.i-run.fr/promotions/'] },
  { name: 'Courir FR', websiteUrl: 'https://www.courir.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.courir.com/soldes/', 'https://www.courir.com/promotions/'] },
  { name: 'Sport 2000 FR', websiteUrl: 'https://www.sport2000.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sport2000.fr/soldes/', 'https://www.sport2000.fr/promotions/'] },
  { name: 'Lafuma FR', websiteUrl: 'https://www.lafuma.com/fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lafuma.com/fr/soldes/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport (seyahat-ulasim) — 15 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Ouigo', websiteUrl: 'https://www.ouigo.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ouigo.com/fr/offres-speciales'] },
  { name: 'TGV Inoui', websiteUrl: 'https://www.sncf-connect.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sncf-connect.com/train/tgv-inoui'] },
  { name: 'Eurostar FR', websiteUrl: 'https://www.eurostar.com/fr-fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.eurostar.com/fr-fr/offres'] },
  { name: 'Vueling FR', websiteUrl: 'https://www.vueling.com/fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vueling.com/fr/offres'] },
  { name: 'Volotea FR', websiteUrl: 'https://www.volotea.com/fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.volotea.com/fr/offres/'] },
  { name: 'Ryanair FR', websiteUrl: 'https://www.ryanair.com/fr/fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/fr/fr/offres'] },
  { name: 'Opodo FR', websiteUrl: 'https://www.opodo.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.opodo.fr/offres/', 'https://www.opodo.fr/bons-plans/'] },
  { name: 'Promovacances', websiteUrl: 'https://www.promovacances.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.promovacances.com/vacances-derniere-minute/', 'https://www.promovacances.com/promotions/'] },
  { name: 'Voyage Prive', websiteUrl: 'https://www.voyage-prive.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.voyage-prive.com/'] },
  { name: 'Travelski', websiteUrl: 'https://www.travelski.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travelski.com/bons-plans/'] },
  { name: 'Pierre et Vacances', websiteUrl: 'https://www.pierreetvacances.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pierreetvacances.com/offres-speciales', 'https://www.pierreetvacances.com/promotions'] },
  { name: 'Center Parcs FR', websiteUrl: 'https://www.centerparcs.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.centerparcs.fr/fr-fr/offres-speciales'] },
  { name: 'Club Med FR', websiteUrl: 'https://www.clubmed.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.clubmed.fr/l/offres-speciales'] },
  { name: 'Sixt FR', websiteUrl: 'https://www.sixt.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sixt.fr/offres/'] },
  { name: 'Europcar FR', websiteUrl: 'https://www.europcar.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.fr/offres', 'https://www.europcar.fr/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 14 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Boursorama', websiteUrl: 'https://www.boursorama.com', categorySlug: 'finans', seedUrls: ['https://www.boursorama.com/banque/offres/'] },
  { name: 'Hello Bank FR', websiteUrl: 'https://www.hellobank.fr', categorySlug: 'finans', seedUrls: ['https://www.hellobank.fr/offres/'] },
  { name: 'Fortuneo', websiteUrl: 'https://www.fortuneo.fr', categorySlug: 'finans', seedUrls: ['https://www.fortuneo.fr/offres'] },
  { name: 'Monabanq', websiteUrl: 'https://www.monabanq.com', categorySlug: 'finans', seedUrls: ['https://www.monabanq.com/fr/offres.html'] },
  { name: 'N26 FR', websiteUrl: 'https://n26.com/fr-fr', categorySlug: 'finans', seedUrls: ['https://n26.com/fr-fr/offres'] },
  { name: 'Orange Bank', websiteUrl: 'https://www.orangebank.fr', categorySlug: 'finans', seedUrls: ['https://www.orangebank.fr/offres/'] },
  { name: 'Credit Mutuel', websiteUrl: 'https://www.creditmutuel.fr', categorySlug: 'finans', seedUrls: ['https://www.creditmutuel.fr/fr/particuliers/offres.html'] },
  { name: 'LCL', websiteUrl: 'https://www.lcl.fr', categorySlug: 'finans', seedUrls: ['https://www.lcl.fr/offres-promotionnelles'] },
  { name: 'Banque Populaire', websiteUrl: 'https://www.banquepopulaire.fr', categorySlug: 'finans', seedUrls: ['https://www.banquepopulaire.fr/particuliers/offres/'] },
  { name: 'La Banque Postale', websiteUrl: 'https://www.labanquepostale.fr', categorySlug: 'finans', seedUrls: ['https://www.labanquepostale.fr/particulier/offres.html'] },
  { name: 'Cetelem FR', websiteUrl: 'https://www.cetelem.fr', categorySlug: 'finans', seedUrls: ['https://www.cetelem.fr/offres'] },
  { name: 'Cofidis FR', websiteUrl: 'https://www.cofidis.fr', categorySlug: 'finans', seedUrls: ['https://www.cofidis.fr/offres/'] },
  { name: 'Sofinco FR', websiteUrl: 'https://www.sofinco.fr', categorySlug: 'finans', seedUrls: ['https://www.sofinco.fr/offres/'] },
  { name: 'Trade Republic FR', websiteUrl: 'https://traderepublic.com/fr-fr', categorySlug: 'finans', seedUrls: ['https://traderepublic.com/fr-fr/offres'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 14 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Matmut', websiteUrl: 'https://www.matmut.fr', categorySlug: 'sigorta', seedUrls: ['https://www.matmut.fr/assurance-auto', 'https://www.matmut.fr/offres'] },
  { name: 'Direct Assurance', websiteUrl: 'https://www.direct-assurance.fr', categorySlug: 'sigorta', seedUrls: ['https://www.direct-assurance.fr/assurance-auto', 'https://www.direct-assurance.fr/offres'] },
  { name: 'MAAF', websiteUrl: 'https://www.maaf.fr', categorySlug: 'sigorta', seedUrls: ['https://www.maaf.fr/fr/assurance-auto', 'https://www.maaf.fr/fr/offres'] },
  { name: 'AG2R La Mondiale', websiteUrl: 'https://www.ag2rlamondiale.fr', categorySlug: 'sigorta', seedUrls: ['https://www.ag2rlamondiale.fr/particulier/offres'] },
  { name: 'Harmonie Mutuelle', websiteUrl: 'https://www.harmonie-mutuelle.fr', categorySlug: 'sigorta', seedUrls: ['https://www.harmonie-mutuelle.fr/offres'] },
  { name: 'Axa FR', websiteUrl: 'https://www.axa.fr', categorySlug: 'sigorta', seedUrls: ['https://www.axa.fr/assurance-auto.html', 'https://www.axa.fr/offres.html'] },
  { name: 'Generali FR', websiteUrl: 'https://www.generali.fr', categorySlug: 'sigorta', seedUrls: ['https://www.generali.fr/assurance-auto/', 'https://www.generali.fr/offres/'] },
  { name: 'CNP Assurances', websiteUrl: 'https://www.cnp.fr', categorySlug: 'sigorta', seedUrls: ['https://www.cnp.fr/particuliers/offres'] },
  { name: 'Aviva FR', websiteUrl: 'https://www.aviva.fr', categorySlug: 'sigorta', seedUrls: ['https://www.aviva.fr/assurances/offres/'] },
  { name: 'Malakoff Humanis', websiteUrl: 'https://www.malakoffhumanis.com', categorySlug: 'sigorta', seedUrls: ['https://www.malakoffhumanis.com/particuliers/offres'] },
  { name: 'Assurland', websiteUrl: 'https://www.assurland.com', categorySlug: 'sigorta', seedUrls: ['https://www.assurland.com/assurance-auto.html', 'https://www.assurland.com/offres.html'] },
  { name: 'Gan Assurances', websiteUrl: 'https://www.gan.fr', categorySlug: 'sigorta', seedUrls: ['https://www.gan.fr/assurance-auto/', 'https://www.gan.fr/offres/'] },
  { name: 'Pacifica Assurances', websiteUrl: 'https://www.credit-agricole.fr', categorySlug: 'sigorta', seedUrls: ['https://www.credit-agricole.fr/particulier/assurances.html'] },
  { name: 'Covea', websiteUrl: 'https://www.covea.eu', categorySlug: 'sigorta', seedUrls: ['https://www.mma.fr/offres.html'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 15 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Peugeot FR', websiteUrl: 'https://www.peugeot.fr', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.fr/nos-offres.html'] },
  { name: 'Citroen FR', websiteUrl: 'https://www.citroen.fr', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.fr/offres.html'] },
  { name: 'DS Automobiles FR', websiteUrl: 'https://www.dsautomobiles.fr', categorySlug: 'otomobil', seedUrls: ['https://www.dsautomobiles.fr/offres.html'] },
  { name: 'Volkswagen FR', websiteUrl: 'https://www.volkswagen.fr', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.fr/fr/offres.html'] },
  { name: 'Audi FR', websiteUrl: 'https://www.audi.fr', categorySlug: 'otomobil', seedUrls: ['https://www.audi.fr/fr/web/fr/offres.html'] },
  { name: 'BMW FR', websiteUrl: 'https://www.bmw.fr', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.fr/fr/offres.html'] },
  { name: 'Mercedes-Benz FR', websiteUrl: 'https://www.mercedes-benz.fr', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.fr/passengercars/buy/offers.html'] },
  { name: 'Ford FR', websiteUrl: 'https://www.ford.fr', categorySlug: 'otomobil', seedUrls: ['https://www.ford.fr/offres'] },
  { name: 'Kia FR', websiteUrl: 'https://www.kia.com/fr', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/fr/offres/'] },
  { name: 'Mazda FR', websiteUrl: 'https://www.mazda.fr', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.fr/offres/'] },
  { name: 'Suzuki FR', websiteUrl: 'https://www.suzuki.fr', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.fr/offres/'] },
  { name: 'Volvo FR', websiteUrl: 'https://www.volvocars.com/fr', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/fr/offres/'] },
  { name: 'Mini FR', websiteUrl: 'https://www.mini.fr', categorySlug: 'otomobil', seedUrls: ['https://www.mini.fr/fr_FR/home/offres.html'] },
  { name: 'Midas FR', websiteUrl: 'https://www.midas.fr', categorySlug: 'otomobil', seedUrls: ['https://www.midas.fr/promotions', 'https://www.midas.fr/offres'] },
  { name: 'Speedy FR', websiteUrl: 'https://www.speedy.fr', categorySlug: 'otomobil', seedUrls: ['https://www.speedy.fr/promotions', 'https://www.speedy.fr/offres'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 18 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Fnac Livres', websiteUrl: 'https://www.fnac.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.fnac.com/livre-a-prix-reduit/w-4', 'https://www.fnac.com/Livres-Soldes/s281530'] },
  { name: 'Cultura', websiteUrl: 'https://www.cultura.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cultura.com/promotions.html', 'https://www.cultura.com/soldes.html'] },
  { name: 'Fnac Jeux Video', websiteUrl: 'https://www.fnac.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.fnac.com/jeux-video/soldes', 'https://www.fnac.com/jeux-video/bons-plans'] },
  { name: 'JouéClub', websiteUrl: 'https://www.joueclub.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.joueclub.fr/promotions/', 'https://www.joueclub.fr/soldes/'] },
  { name: 'Oxybul', websiteUrl: 'https://www.oxybul.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.oxybul.com/soldes', 'https://www.oxybul.com/bons-plans'] },
  { name: 'La Grande Recre', websiteUrl: 'https://www.lagranderecre.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lagranderecre.fr/promotions/', 'https://www.lagranderecre.fr/soldes/'] },
  { name: 'Playmobil FR', websiteUrl: 'https://www.playmobil.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.playmobil.fr/offres-speciales/'] },
  { name: 'Picwic Toys', websiteUrl: 'https://www.picwictoys.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.picwictoys.com/promotions/', 'https://www.picwictoys.com/soldes/'] },
  { name: 'Xbox FR', websiteUrl: 'https://www.xbox.com/fr-FR', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/fr-FR/games/deals'] },
  { name: 'Epic Games FR', websiteUrl: 'https://store.epicgames.com/fr', categorySlug: 'kitap-hobi', seedUrls: ['https://store.epicgames.com/fr/free-games', 'https://store.epicgames.com/fr/browse?sortBy=currentPrice&sortDir=ASC'] },
  { name: 'Hachette FR', websiteUrl: 'https://www.hachette.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hachette.fr/offres'] },
  { name: 'Livre de Poche', websiteUrl: 'https://www.livredepoche.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.livredepoche.com/offres-speciales'] },
  { name: 'Place des Libraires', websiteUrl: 'https://www.placedeslibraires.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.placedeslibraires.fr/bons-plans'] },
  { name: 'Esprit Jeu', websiteUrl: 'https://www.espritjeu.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.espritjeu.com/promotions', 'https://www.espritjeu.com/soldes'] },
  { name: 'Boutique du Geek', websiteUrl: 'https://www.boutiquedugeek.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.boutiquedugeek.com/promotions/'] },
  { name: 'Cdiscount Jeux', websiteUrl: 'https://www.cdiscount.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cdiscount.com/jeux-pc-video-console/r-promotions+jeux+video.html'] },
  { name: 'Rakuten Livres FR', websiteUrl: 'https://fr.shopping.rakuten.com', categorySlug: 'kitap-hobi', seedUrls: ['https://fr.shopping.rakuten.com/event/bon-plan-livres'] },
  { name: 'Ludum FR', websiteUrl: 'https://www.ludum.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ludum.fr/promotions/'] },
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
  console.log('=== FR Extra Brand Seeding Script ===\n');
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
        where: { slug_market: { slug, market: 'FR' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'FR', categoryId },
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
            market: 'FR',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'FR' },
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

  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'FR' } });
  console.log(`Total active FR sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=FR');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
