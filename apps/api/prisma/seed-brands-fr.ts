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
  { name: 'Amazon FR', websiteUrl: 'https://www.amazon.fr', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.fr/deals', 'https://www.amazon.fr/gp/goldbox'] },
  { name: 'Cdiscount', websiteUrl: 'https://www.cdiscount.com', categorySlug: 'alisveris', seedUrls: ['https://www.cdiscount.com/soldes.html', 'https://www.cdiscount.com/bonnes-affaires.html'] },
  { name: 'Rakuten FR', websiteUrl: 'https://fr.shopping.rakuten.com', categorySlug: 'alisveris', seedUrls: ['https://fr.shopping.rakuten.com/event/bon-plan', 'https://fr.shopping.rakuten.com/event/soldes'] },
  { name: 'Veepee', websiteUrl: 'https://www.veepee.fr', categorySlug: 'alisveris', seedUrls: ['https://www.veepee.fr/'] },
  { name: 'Showroomprive', websiteUrl: 'https://www.showroomprive.com', categorySlug: 'alisveris', seedUrls: ['https://www.showroomprive.com/'] },
  { name: 'Dealabs', websiteUrl: 'https://www.dealabs.com', categorySlug: 'alisveris', seedUrls: ['https://www.dealabs.com/bons-plans', 'https://www.dealabs.com/hot'] },
  { name: 'eBay FR', websiteUrl: 'https://www.ebay.fr', categorySlug: 'alisveris', seedUrls: ['https://www.ebay.fr/deals'] },
  { name: 'AliExpress FR', websiteUrl: 'https://fr.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://fr.aliexpress.com/wholesale', 'https://sale.aliexpress.com/__pc/sale.htm'] },
  { name: 'Leclerc', websiteUrl: 'https://www.e.leclerc', categorySlug: 'alisveris', seedUrls: ['https://www.e.leclerc/catalogue', 'https://www.e.leclerc/promo'] },
  { name: 'La Redoute', websiteUrl: 'https://www.laredoute.fr', categorySlug: 'alisveris', seedUrls: ['https://www.laredoute.fr/ppdp/cat-508.aspx', 'https://www.laredoute.fr/soldes.aspx'] },
  { name: 'Conforama', websiteUrl: 'https://www.conforama.fr', categorySlug: 'alisveris', seedUrls: ['https://www.conforama.fr/soldes', 'https://www.conforama.fr/promotions'] },
  { name: 'But', websiteUrl: 'https://www.but.fr', categorySlug: 'alisveris', seedUrls: ['https://www.but.fr/promotions.html', 'https://www.but.fr/soldes.html'] },
  { name: 'Carrefour', websiteUrl: 'https://www.carrefour.fr', categorySlug: 'alisveris', seedUrls: ['https://www.carrefour.fr/promotions', 'https://www.carrefour.fr/offres-du-moment'] },
  { name: 'Temu FR', websiteUrl: 'https://www.temu.com/fr', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/fr/deals'] },
  { name: 'ManoMano', websiteUrl: 'https://www.manomano.fr', categorySlug: 'alisveris', seedUrls: ['https://www.manomano.fr/bons-plans', 'https://www.manomano.fr/soldes'] },
  { name: 'CDiscount Marketplace', websiteUrl: 'https://www.cdiscount.com', categorySlug: 'alisveris', seedUrls: ['https://www.cdiscount.com/destockage.html'] },
  { name: 'PriceMinister', websiteUrl: 'https://fr.shopping.rakuten.com', categorySlug: 'alisveris', seedUrls: ['https://fr.shopping.rakuten.com/event/bons-plans'] },
  { name: 'Ubaldi', websiteUrl: 'https://www.ubaldi.com', categorySlug: 'alisveris', seedUrls: ['https://www.ubaldi.com/promotions.php'] },
  { name: 'iGraal', websiteUrl: 'https://www.igraal.com', categorySlug: 'alisveris', seedUrls: ['https://www.igraal.com/codes-promo'] },
  { name: 'Leroy Merlin', websiteUrl: 'https://www.leroymerlin.fr', categorySlug: 'alisveris', seedUrls: ['https://www.leroymerlin.fr/offres-promotions.html', 'https://www.leroymerlin.fr/soldes.html'] },
  { name: 'Castorama', websiteUrl: 'https://www.castorama.fr', categorySlug: 'alisveris', seedUrls: ['https://www.castorama.fr/soldes'] },
  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'LDLC', websiteUrl: 'https://www.ldlc.com', categorySlug: 'elektronik', seedUrls: ['https://www.ldlc.com/promotions/'] },
  { name: 'Samsung FR', websiteUrl: 'https://www.samsung.com/fr', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/fr/offer/', 'https://www.samsung.com/fr/smartphones/all-smartphones/'] },
  { name: 'Dell FR', websiteUrl: 'https://www.dell.com/fr-fr', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/fr-fr/shop/deals'] },
  { name: 'Lenovo FR', websiteUrl: 'https://www.lenovo.com/fr/fr', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/fr/fr/d/deals/'] },
  { name: 'Sony FR', websiteUrl: 'https://www.sony.fr', categorySlug: 'elektronik', seedUrls: ['https://www.sony.fr/promotions'] },
  { name: 'LG FR', websiteUrl: 'https://www.lg.com/fr', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/fr/promotions'] },
  { name: 'Xiaomi FR', websiteUrl: 'https://www.mi.com/fr', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/fr/sale'] },
  { name: 'Huawei FR', websiteUrl: 'https://consumer.huawei.com/fr', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/fr/offer/'] },
  { name: 'Google Store FR', websiteUrl: 'https://store.google.com/fr', categorySlug: 'elektronik', seedUrls: ['https://store.google.com/fr/collection/offers'] },
  { name: 'SFR', websiteUrl: 'https://www.sfr.fr', categorySlug: 'elektronik', seedUrls: ['https://www.sfr.fr/offre-mobile', 'https://www.sfr.fr/offre-internet'] },
  { name: 'Free Mobile', websiteUrl: 'https://mobile.free.fr', categorySlug: 'elektronik', seedUrls: ['https://mobile.free.fr/'] },
  { name: 'Bouygues Telecom', websiteUrl: 'https://www.bouyguestelecom.fr', categorySlug: 'elektronik', seedUrls: ['https://www.bouyguestelecom.fr/offres-internet'] },
  { name: 'Rue du Commerce Tech', websiteUrl: 'https://www.rueducommerce.fr', categorySlug: 'elektronik', seedUrls: ['https://www.rueducommerce.fr/rayon/informatique', 'https://www.rueducommerce.fr/rayon/telephonie'] },
  { name: 'Back Market FR', websiteUrl: 'https://www.backmarket.fr', categorySlug: 'elektronik', seedUrls: ['https://www.backmarket.fr/fr-fr/l/offres-du-moment/c00ac5db-6110-42a8-b274-cff2e96b7b0d'] },
  { name: 'Cdiscount Tech', websiteUrl: 'https://www.cdiscount.com', categorySlug: 'elektronik', seedUrls: ['https://www.cdiscount.com/informatique/r-promotions+informatique.html', 'https://www.cdiscount.com/telephonie/r-promotions+telephonie.html'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Zalando FR', websiteUrl: 'https://www.zalando.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.zalando.fr/soldes/', 'https://www.zalando.fr/promo/'] },
  { name: 'La Redoute Mode', websiteUrl: 'https://www.laredoute.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.laredoute.fr/ppdp/cat-508-soldes-femme.aspx', 'https://www.laredoute.fr/ppdp/cat-510-soldes-homme.aspx'] },
  { name: 'ASOS FR', websiteUrl: 'https://www.asos.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.asos.com/fr/femme/soldes/', 'https://www.asos.com/fr/homme/soldes/'] },
  { name: 'H&M FR', websiteUrl: 'https://www2.hm.com/fr_fr', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/fr_fr/soldes.html'] },
  { name: 'Zara FR', websiteUrl: 'https://www.zara.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/fr/fr/soldes-l1702.html'] },
  { name: 'Kiabi', websiteUrl: 'https://www.kiabi.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.kiabi.com/soldes', 'https://www.kiabi.com/promotions'] },
  { name: 'Galeries Lafayette', websiteUrl: 'https://www.galerieslafayette.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.galerieslafayette.com/soldes', 'https://www.galerieslafayette.com/bons-plans'] },
  { name: 'Le Printemps', websiteUrl: 'https://www.printemps.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.printemps.com/fr/fr/soldes', 'https://www.printemps.com/fr/fr/promotions'] },
  { name: 'Camaieu', websiteUrl: 'https://www.camaieu.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.camaieu.fr/soldes.html'] },
  { name: 'Celio', websiteUrl: 'https://www.celio.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.celio.com/soldes.html'] },
  { name: 'Etam', websiteUrl: 'https://www.etam.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.etam.com/soldes/', 'https://www.etam.com/promotions/'] },
  { name: 'Bershka FR', websiteUrl: 'https://www.bershka.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/fr/soldes/'] },
  { name: 'Pull & Bear FR', websiteUrl: 'https://www.pullandbear.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/fr/soldes-n6486'] },
  { name: 'Stradivarius FR', websiteUrl: 'https://www.stradivarius.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/fr/soldes-c1020196507.html'] },
  { name: 'Lacoste FR', websiteUrl: 'https://www.lacoste.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com/fr/soldes/'] },
  { name: 'Levi\'s FR', websiteUrl: 'https://www.levi.com/FR/fr_FR', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com/FR/fr_FR/soldes/'] },
  { name: 'Nike FR', websiteUrl: 'https://www.nike.com/fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/fr/w/promotions'] },
  { name: 'Adidas FR', websiteUrl: 'https://www.adidas.fr', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.fr/soldes', 'https://www.adidas.fr/promotions'] },
  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA FR', websiteUrl: 'https://www.ikea.com/fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/fr/fr/offers/', 'https://www.ikea.com/fr/fr/campaigns/soldes/'] },
  { name: 'Maisons du Monde', websiteUrl: 'https://www.maisonsdumonde.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.maisonsdumonde.com/FR/fr/soldes/', 'https://www.maisonsdumonde.com/FR/fr/bons-plans/'] },
  { name: 'Conforama Maison', websiteUrl: 'https://www.conforama.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.conforama.fr/decoration-textile/soldes', 'https://www.conforama.fr/canape-salon/soldes'] },
  { name: 'But Maison', websiteUrl: 'https://www.but.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.but.fr/soldes/decoration.html', 'https://www.but.fr/soldes/meuble.html'] },
  { name: 'Leroy Merlin Maison', websiteUrl: 'https://www.leroymerlin.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.leroymerlin.fr/offres-promotions/decoration.html'] },
  { name: 'La Redoute Interieur', websiteUrl: 'https://www.laredoute.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.laredoute.fr/ppdp/cat-509-soldes-maison.aspx'] },
  { name: 'AM.PM', websiteUrl: 'https://www.ampm.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.ampm.fr/soldes.html'] },
  { name: 'Made.com FR', websiteUrl: 'https://www.made.com/fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.made.com/fr/sale'] },
  { name: 'Zara Home FR', websiteUrl: 'https://www.zarahome.com/fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/fr/soldes/'] },
  { name: 'Westwing FR', websiteUrl: 'https://www.westwing.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.fr/'] },
  { name: 'ManoMano Maison', websiteUrl: 'https://www.manomano.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.manomano.fr/bons-plans/maison', 'https://www.manomano.fr/cat/decoration+maison'] },
  { name: 'Cdiscount Maison', websiteUrl: 'https://www.cdiscount.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.cdiscount.com/maison/r-promotions+maison.html'] },
  { name: 'Brico Depot', websiteUrl: 'https://www.bricodepot.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricodepot.fr/catalogue/'] },
  { name: 'Point P', websiteUrl: 'https://www.pointp.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.pointp.fr/promotions'] },
  { name: 'Truffaut', websiteUrl: 'https://www.truffaut.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.truffaut.com/promotions', 'https://www.truffaut.com/soldes'] },
  { name: 'Jardiland', websiteUrl: 'https://www.jardiland.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.jardiland.com/promotions.html'] },
  { name: 'Villeroy & Boch FR', websiteUrl: 'https://www.villeroy-boch.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.villeroy-boch.fr/shop/soldes.html'] },
  { name: 'Fly', websiteUrl: 'https://www.fly.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.fly.fr/soldes/'] },
  { name: 'Lapeyre', websiteUrl: 'https://www.lapeyre.fr', categorySlug: 'ev-yasam', seedUrls: ['https://www.lapeyre.fr/promotions', 'https://www.lapeyre.fr/soldes'] },
  { name: 'Saint-Maclou', websiteUrl: 'https://www.saint-maclou.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.saint-maclou.com/promotions/', 'https://www.saint-maclou.com/soldes/'] },
  { name: 'Nature et Decouvertes', websiteUrl: 'https://www.natureetdecouvertes.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.natureetdecouvertes.com/soldes'] },
  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Carrefour Market', websiteUrl: 'https://www.carrefour.fr', categorySlug: 'gida-market', seedUrls: ['https://www.carrefour.fr/promotions/marche', 'https://www.carrefour.fr/offres-du-moment'] },
  { name: 'Leclerc Drive', websiteUrl: 'https://fd-gourmet.leclercdrive.fr', categorySlug: 'gida-market', seedUrls: ['https://www.e.leclerc/catalogue', 'https://www.e.leclerc/promo'] },
  { name: 'Lidl FR', websiteUrl: 'https://www.lidl.fr', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.fr/nos-offres'] },
  { name: 'Monoprix', websiteUrl: 'https://www.monoprix.fr', categorySlug: 'gida-market', seedUrls: ['https://www.monoprix.fr/promotions', 'https://www.monoprix.fr/bons-plans'] },
  { name: 'Franprix', websiteUrl: 'https://www.franprix.fr', categorySlug: 'gida-market', seedUrls: ['https://www.franprix.fr/promotions'] },
  { name: 'Casino', websiteUrl: 'https://www.supercasino.fr', categorySlug: 'gida-market', seedUrls: ['https://www.casino.fr/promotions/'] },
  { name: 'Picard', websiteUrl: 'https://www.picard.fr', categorySlug: 'gida-market', seedUrls: ['https://www.picard.fr/offres-du-moment', 'https://www.picard.fr/promotions'] },
  { name: 'Grand Frais', websiteUrl: 'https://www.grandfrais.com', categorySlug: 'gida-market', seedUrls: ['https://www.grandfrais.com/promotions/'] },
  { name: 'Naturalia', websiteUrl: 'https://www.naturalia.fr', categorySlug: 'gida-market', seedUrls: ['https://www.naturalia.fr/promotions'] },
  { name: 'Cora', websiteUrl: 'https://www.cora.fr', categorySlug: 'gida-market', seedUrls: ['https://www.cora.fr/promotions', 'https://www.cora.fr/catalogue'] },
  { name: 'Super U', websiteUrl: 'https://www.magasins-u.com', categorySlug: 'gida-market', seedUrls: ['https://www.magasins-u.com/promotions', 'https://www.magasins-u.com/catalogues'] },
  { name: 'Netto FR', websiteUrl: 'https://www.netto.fr', categorySlug: 'gida-market', seedUrls: ['https://www.netto.fr/promotions'] },
  { name: 'Match Supermarche', websiteUrl: 'https://www.supermarchesmatch.fr', categorySlug: 'gida-market', seedUrls: ['https://www.supermarchesmatch.fr/promotions'] },
  { name: 'Toupargel', websiteUrl: 'https://www.toupargel.fr', categorySlug: 'gida-market', seedUrls: ['https://www.toupargel.fr/promotions'] },
  { name: 'Costco FR', websiteUrl: 'https://www.costco.fr', categorySlug: 'gida-market', seedUrls: ['https://www.costco.fr/offres-en-cours.html'] },
  { name: 'Flink FR', websiteUrl: 'https://www.goflink.com/fr-FR', categorySlug: 'gida-market', seedUrls: ['https://www.goflink.com/fr-FR/offres'] },
  { name: 'Chronodrive', websiteUrl: 'https://www.chronodrive.com', categorySlug: 'gida-market', seedUrls: ['https://www.chronodrive.com/promotions'] },
  { name: 'Carrefour Bio', websiteUrl: 'https://www.carrefour.fr', categorySlug: 'gida-market', seedUrls: ['https://www.carrefour.fr/promotions/bio'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Drink (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'McDonald\'s FR', websiteUrl: 'https://www.mcdonalds.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.fr/offres', 'https://www.mcdonalds.fr/bons-plans'] },
  { name: 'KFC FR', websiteUrl: 'https://www.kfc.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.fr/offres', 'https://www.kfc.fr/bons-plans'] },
  { name: 'Domino\'s Pizza FR', websiteUrl: 'https://www.dominos.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.fr/promotions', 'https://www.dominos.fr/bons-plans'] },
  { name: 'Pizza Hut FR', websiteUrl: 'https://www.pizzahut.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.fr/offres'] },
  { name: 'La Mie Caline', websiteUrl: 'https://www.lamiecaline.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.lamiecaline.com/offres'] },
  { name: 'TheFork FR', websiteUrl: 'https://www.thefork.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.thefork.fr/promotions', 'https://www.thefork.fr/offres-speciales'] },
  { name: 'Vinatis', websiteUrl: 'https://www.vinatis.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.vinatis.com/promotions', 'https://www.vinatis.com/ventes-flash'] },
  { name: 'Quick', websiteUrl: 'https://www.quick.fr', categorySlug: 'yeme-icme', seedUrls: ['https://www.quick.fr/offres', 'https://www.quick.fr/bons-plans'] },
  { name: 'O\'Tacos FR', websiteUrl: 'https://www.o-tacos.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.o-tacos.com/offres'] },
  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sephora FR', websiteUrl: 'https://www.sephora.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.fr/soldes/'] },
  { name: 'Marionnaud', websiteUrl: 'https://www.marionnaud.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.marionnaud.fr/promotions', 'https://www.marionnaud.fr/soldes'] },
  { name: 'Yves Rocher', websiteUrl: 'https://www.yves-rocher.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yves-rocher.fr/promotions'] },
  { name: 'L\'Occitane FR', websiteUrl: 'https://fr.loccitane.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://fr.loccitane.com/offres-du-moment', 'https://fr.loccitane.com/soldes'] },
  { name: 'L\'Oreal Paris FR', websiteUrl: 'https://www.loreal-paris.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.fr/offres'] },
  { name: 'Lancome FR', websiteUrl: 'https://www.lancome.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lancome.fr/offres/'] },
  { name: 'Kiehl\'s FR', websiteUrl: 'https://www.kiehls.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.fr/offres/'] },
  { name: 'Comptoir de l\'Homme', websiteUrl: 'https://www.comptoirdelhomme.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.comptoirdelhomme.com/promotions/'] },
  { name: 'Lush FR', websiteUrl: 'https://www.lush.com/fr/fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/fr/fr/c/sale'] },
  { name: 'Make Up For Ever', websiteUrl: 'https://www.makeupforever.com/fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.makeupforever.com/fr/offres.html'] },
  { name: 'Dior Beaute FR', websiteUrl: 'https://www.dior.com/fr_fr/beaute', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dior.com/fr_fr/beaute/offres.html'] },
  { name: 'Chanel Beaute FR', websiteUrl: 'https://www.chanel.com/fr/beaute', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.chanel.com/fr/beaute/offres/'] },
  { name: 'Bourjois', websiteUrl: 'https://www.bourjois.com/fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bourjois.com/fr/offres'] },
  { name: 'La Roche-Posay FR', websiteUrl: 'https://www.laroche-posay.fr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.fr/offres'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Intersport FR', websiteUrl: 'https://www.intersport.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.fr/soldes/'] },
  { name: 'Nike FR Sport', websiteUrl: 'https://www.nike.com/fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/fr/w/promotions-sport'] },
  { name: 'Adidas FR Sport', websiteUrl: 'https://www.adidas.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.fr/soldes', 'https://www.adidas.fr/outlet'] },
  { name: 'New Balance FR', websiteUrl: 'https://www.newbalance.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.fr/fr/soldes/'] },
  { name: 'Salomon FR', websiteUrl: 'https://www.salomon.com/fr-fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/fr-fr/soldes/'] },
  { name: 'Patagonia FR', websiteUrl: 'https://eu.patagonia.com/fr/fr', categorySlug: 'spor-outdoor', seedUrls: ['https://eu.patagonia.com/fr/fr/shop/web-specials'] },
  { name: 'Alltricks', websiteUrl: 'https://www.alltricks.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.alltricks.fr/promotions', 'https://www.alltricks.fr/soldes'] },
  { name: 'Ekosport', websiteUrl: 'https://www.ekosport.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ekosport.fr/soldes/', 'https://www.ekosport.fr/promotions/'] },
  { name: 'Snowleader', websiteUrl: 'https://www.snowleader.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.snowleader.com/soldes.html', 'https://www.snowleader.com/promotions.html'] },
  { name: 'Au Vieux Campeur', websiteUrl: 'https://www.auvieuxcampeur.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.auvieuxcampeur.fr/offres-speciales', 'https://www.auvieuxcampeur.fr/soldes'] },
  { name: 'Quechua', websiteUrl: 'https://www.quechua.com/fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.fr/browse/c0-camping-bivouac/c1-promotions/'] },
  { name: 'Millet FR', websiteUrl: 'https://www.millet-mountain.com/fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.millet-mountain.com/fr/soldes/'] },
  { name: 'Aigle', websiteUrl: 'https://www.aigle.com/fr/fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.aigle.com/fr/fr/soldes/'] },
  { name: 'Vieux Campeur Cyclisme', websiteUrl: 'https://www.auvieuxcampeur.fr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.auvieuxcampeur.fr/velo/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'SNCF', websiteUrl: 'https://www.sncf-connect.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sncf-connect.com/bons-plans'] },
  { name: 'Air France', websiteUrl: 'https://www.airfrance.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airfrance.fr/FR/fr/common/page_fl498/nos-meilleures-offres.htm', 'https://www.airfrance.fr/offres'] },
  { name: 'Transavia', websiteUrl: 'https://www.transavia.com/fr-FR', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.transavia.com/fr-FR/offres/'] },
  { name: 'EasyJet FR', websiteUrl: 'https://www.easyjet.com/fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easyjet.com/fr/vols-pas-chers'] },
  { name: 'Booking.com FR', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.fr.html'] },
  { name: 'Lastminute.com FR', websiteUrl: 'https://www.lastminute.com/fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lastminute.com/fr/offres'] },
  { name: 'Corsica Ferries', websiteUrl: 'https://www.corsica-ferries.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.corsica-ferries.fr/offres-speciales.html'] },
  { name: 'Brittany Ferries', websiteUrl: 'https://www.brittany-ferries.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.brittany-ferries.fr/offres-speciales'] },
  { name: 'BlaBlaCar', websiteUrl: 'https://www.blablacar.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://blog.blablacar.fr/bons-plans'] },
  { name: 'Thalys', websiteUrl: 'https://www.thalys.com/fr/fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thalys.com/fr/fr/promotions'] },
  { name: 'Hertz FR', websiteUrl: 'https://www.hertz.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.fr/rentacar/offers/france'] },
  { name: 'Airbnb FR', websiteUrl: 'https://www.airbnb.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.fr/'] },
  { name: 'Liligo', websiteUrl: 'https://www.liligo.fr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.liligo.fr/bons-plans'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'BNP Paribas', websiteUrl: 'https://mabanque.bnpparibas', categorySlug: 'finans', seedUrls: ['https://mabanque.bnpparibas/fr/ouvrir-un-compte'] },
  { name: 'Societe Generale', websiteUrl: 'https://www.societegenerale.fr', categorySlug: 'finans', seedUrls: ['https://www.societegenerale.fr/fr/offres'] },
  { name: 'Credit Agricole', websiteUrl: 'https://www.credit-agricole.fr', categorySlug: 'finans', seedUrls: ['https://www.credit-agricole.fr/particulier/offres.html'] },
  { name: 'ING FR', websiteUrl: 'https://www.ing.fr', categorySlug: 'finans', seedUrls: ['https://www.ing.fr/offres/'] },
  { name: 'Caisse d\'Epargne', websiteUrl: 'https://www.caisse-epargne.fr', categorySlug: 'finans', seedUrls: ['https://www.caisse-epargne.fr/particuliers/offres/'] },
  { name: 'Revolut FR', websiteUrl: 'https://www.revolut.com/fr-FR', categorySlug: 'finans', seedUrls: ['https://www.revolut.com/fr-FR/offres/'] },
  { name: 'Lydia', websiteUrl: 'https://www.lydia-app.com/fr', categorySlug: 'finans', seedUrls: ['https://www.lydia-app.com/fr/offres'] },
  { name: 'Ma French Bank', websiteUrl: 'https://www.mafrenchbank.fr', categorySlug: 'finans', seedUrls: ['https://www.mafrenchbank.fr/offres'] },
  { name: 'Degiro FR', websiteUrl: 'https://www.degiro.fr', categorySlug: 'finans', seedUrls: ['https://www.degiro.fr/offres'] },
  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Groupama', websiteUrl: 'https://www.groupama.fr', categorySlug: 'sigorta', seedUrls: ['https://www.groupama.fr/assurance-auto/'] },
  { name: 'MAIF', websiteUrl: 'https://www.maif.fr', categorySlug: 'sigorta', seedUrls: ['https://www.maif.fr/assurance-auto'] },
  { name: 'MACIF', websiteUrl: 'https://www.macif.fr', categorySlug: 'sigorta', seedUrls: ['https://www.macif.fr/assurance/offres', 'https://www.macif.fr/assurance/particuliers/assurance-auto'] },
  { name: 'GMF', websiteUrl: 'https://www.gmf.fr', categorySlug: 'sigorta', seedUrls: ['https://www.gmf.fr/offres/', 'https://www.gmf.fr/assurance-auto/'] },
  { name: 'MMA', websiteUrl: 'https://www.mma.fr', categorySlug: 'sigorta', seedUrls: ['https://www.mma.fr/offres.html', 'https://www.mma.fr/assurance-auto.html'] },
  { name: 'Allianz FR', websiteUrl: 'https://www.allianz.fr', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.fr/offres/', 'https://www.allianz.fr/assurance-auto/'] },
  { name: 'L\'olivier Assurance', websiteUrl: 'https://www.lolivier.fr', categorySlug: 'sigorta', seedUrls: ['https://www.lolivier.fr/offres/', 'https://www.lolivier.fr/assurance-auto/'] },
  { name: 'Leocare', websiteUrl: 'https://www.leocare.fr', categorySlug: 'sigorta', seedUrls: ['https://www.leocare.fr/offres/'] },
  { name: 'Alan', websiteUrl: 'https://alan.com/fr', categorySlug: 'sigorta', seedUrls: ['https://alan.com/fr/offres'] },
  { name: 'MGEN', websiteUrl: 'https://www.mgen.fr', categorySlug: 'sigorta', seedUrls: ['https://www.mgen.fr/offres-sante/'] },
  { name: 'Swiss Life FR', websiteUrl: 'https://www.swisslife.fr', categorySlug: 'sigorta', seedUrls: ['https://www.swisslife.fr/offres/'] },
  { name: 'April Assurance', websiteUrl: 'https://www.april.fr', categorySlug: 'sigorta', seedUrls: ['https://www.april.fr/offres/'] },
  { name: 'Europ Assistance FR', websiteUrl: 'https://www.europ-assistance.fr', categorySlug: 'sigorta', seedUrls: ['https://www.europ-assistance.fr/offres-speciales'] },
  { name: 'Axa Sante', websiteUrl: 'https://www.axa.fr', categorySlug: 'sigorta', seedUrls: ['https://www.axa.fr/complementaire-sante.html'] },
  { name: 'Ameli', websiteUrl: 'https://www.ameli.fr', categorySlug: 'sigorta', seedUrls: ['https://www.ameli.fr/assure/offres'] },
  { name: 'Lesfurets.com', websiteUrl: 'https://www.lesfurets.com', categorySlug: 'sigorta', seedUrls: ['https://www.lesfurets.com/assurance-auto', 'https://www.lesfurets.com/assurance-habitation'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Renault', websiteUrl: 'https://www.renault.fr', categorySlug: 'otomobil', seedUrls: ['https://www.renault.fr/offres.html'] },
  { name: 'Dacia FR', websiteUrl: 'https://www.dacia.fr', categorySlug: 'otomobil', seedUrls: ['https://www.dacia.fr/offres.html'] },
  { name: 'Toyota FR', websiteUrl: 'https://www.toyota.fr', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.fr/offres'] },
  { name: 'Hyundai FR', websiteUrl: 'https://www.hyundai.com/fr', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/fr/offres.html'] },
  { name: 'Fiat FR', websiteUrl: 'https://www.fiat.fr', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.fr/offres.html'] },
  { name: 'Opel FR', websiteUrl: 'https://www.opel.fr', categorySlug: 'otomobil', seedUrls: ['https://www.opel.fr/offres.html'] },
  { name: 'Skoda FR', websiteUrl: 'https://www.skoda.fr', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.fr/offres/'] },
  { name: 'Seat FR', websiteUrl: 'https://www.seat.fr', categorySlug: 'otomobil', seedUrls: ['https://www.seat.fr/offres.html'] },
  { name: 'Nissan FR', websiteUrl: 'https://www.nissan.fr', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.fr/offres.html'] },
  { name: 'Tesla FR', websiteUrl: 'https://www.tesla.com/fr_fr', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/fr_fr/inventory'] },
  { name: 'Norauto', websiteUrl: 'https://www.norauto.fr', categorySlug: 'otomobil', seedUrls: ['https://www.norauto.fr/promotions.html', 'https://www.norauto.fr/offres.html'] },
  { name: 'Feu Vert', websiteUrl: 'https://www.feuvert.fr', categorySlug: 'otomobil', seedUrls: ['https://www.feuvert.fr/promotions.html', 'https://www.feuvert.fr/offres.html'] },
  { name: 'Oscaro', websiteUrl: 'https://www.oscaro.com', categorySlug: 'otomobil', seedUrls: ['https://www.oscaro.com/promotions', 'https://www.oscaro.com/soldes'] },
  { name: 'Auto Plus', websiteUrl: 'https://www.autoplus.fr', categorySlug: 'otomobil', seedUrls: ['https://www.autoplus.fr/bons-plans/'] },
  { name: 'La Centrale', websiteUrl: 'https://www.lacentrale.fr', categorySlug: 'otomobil', seedUrls: ['https://www.lacentrale.fr/offres/'] },
  { name: 'Le Bon Coin Auto', websiteUrl: 'https://www.leboncoin.fr', categorySlug: 'otomobil', seedUrls: ['https://www.leboncoin.fr/voitures/offres/'] },
  { name: 'AramisAuto', websiteUrl: 'https://www.aramisauto.com', categorySlug: 'otomobil', seedUrls: ['https://www.aramisauto.com/offres/', 'https://www.aramisauto.com/bons-plans/'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon FR Livres', websiteUrl: 'https://www.amazon.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.fr/gp/bestsellers/books/'] },
  { name: 'Decitre', websiteUrl: 'https://www.decitre.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.decitre.fr/bons-plans', 'https://www.decitre.fr/promotions'] },
  { name: 'Gibert Joseph', websiteUrl: 'https://www.gibert.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gibert.com/promotions'] },
  { name: 'Le Furet du Nord', websiteUrl: 'https://www.furet.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.furet.com/bons-plans', 'https://www.furet.com/promotions'] },
  { name: 'Momox FR', websiteUrl: 'https://www.momox-shop.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.momox-shop.fr/offres/'] },
  { name: 'RecycLivre', websiteUrl: 'https://www.recyclivre.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.recyclivre.com/promotions'] },
  { name: 'Kobo FR', websiteUrl: 'https://www.kobo.com/fr/fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kobo.com/fr/fr/p/deals'] },
  { name: 'Audible FR', websiteUrl: 'https://www.audible.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.fr/ep/offres'] },
  { name: 'Lego FR', websiteUrl: 'https://www.lego.com/fr-fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/fr-fr/categories/sales-and-deals'] },
  { name: 'King Jouet', websiteUrl: 'https://www.king-jouet.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.king-jouet.com/soldes.htm', 'https://www.king-jouet.com/promotions.htm'] },
  { name: 'Micromania FR', websiteUrl: 'https://www.micromania.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.micromania.fr/soldes.html', 'https://www.micromania.fr/promotions.html'] },
  { name: 'Nintendo FR', websiteUrl: 'https://www.nintendo.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.fr/Divers/Nintendo-eShop/Offres-et-promotions/'] },
  { name: 'PlayStation FR', websiteUrl: 'https://store.playstation.com/fr-fr', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/fr-fr/category/deals'] },
  { name: 'Steam FR', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/'] },
  { name: 'Philibert', websiteUrl: 'https://www.philibertnet.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.philibertnet.com/fr/promotions'] },
  { name: 'Creavea', websiteUrl: 'https://www.creavea.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.creavea.com/promotions', 'https://www.creavea.com/soldes'] },
  { name: 'Variances', websiteUrl: 'https://www.variances.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.variances.com/promotions/'] },
  { name: 'Gallimard', websiteUrl: 'https://www.gallimard.fr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gallimard.fr/Catalogue/promotions'] },
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
  console.log('=== FR Brand Seeding Script ===\n');
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
        where: { brandId: brand.id, crawlMethod: CrawlMethod.CAMPAIGN },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Deals`,
            crawlMethod: CrawlMethod.CAMPAIGN,
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
