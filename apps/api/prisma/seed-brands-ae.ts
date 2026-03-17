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
  { name: 'noon', websiteUrl: 'https://www.noon.com', categorySlug: 'alisveris', seedUrls: ['https://www.noon.com/uae-en/deals/', 'https://www.noon.com/uae-en/offers/'] },
  { name: 'Namshi', websiteUrl: 'https://www.namshi.com', categorySlug: 'alisveris', seedUrls: ['https://www.namshi.com/uae-en/sale/', 'https://www.namshi.com/uae-en/deals/'] },
  { name: 'Ounass', websiteUrl: 'https://www.ounass.ae', categorySlug: 'alisveris', seedUrls: ['https://www.ounass.ae/en-ae/sale/', 'https://www.ounass.ae/en-ae/designers-on-sale/'] },
  { name: 'Amazon.ae', websiteUrl: 'https://www.amazon.ae', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.ae/deals', 'https://www.amazon.ae/gp/goldbox'] },
  { name: 'Sharaf DG', websiteUrl: 'https://www.sharafdg.com', categorySlug: 'alisveris', seedUrls: ['https://www.sharafdg.com/deals', 'https://www.sharafdg.com/offers'] },
  { name: 'Carrefour UAE', websiteUrl: 'https://www.carrefouruae.com', categorySlug: 'alisveris', seedUrls: ['https://www.carrefouruae.com/mafuae/en/c/offers-promotions', 'https://www.carrefouruae.com/mafuae/en/c/deals'] },
  { name: 'LuLu Hypermarket', websiteUrl: 'https://www.luluhypermarket.com', categorySlug: 'alisveris', seedUrls: ['https://www.luluhypermarket.com/en-ae/offers', 'https://www.luluhypermarket.com/en-ae/deals'] },
  { name: 'Dubizzle', websiteUrl: 'https://www.dubizzle.com', categorySlug: 'alisveris', seedUrls: ['https://www.dubizzle.com/'] },
  { name: 'Mumzworld', websiteUrl: 'https://www.mumzworld.com', categorySlug: 'alisveris', seedUrls: ['https://www.mumzworld.com/en/sale', 'https://www.mumzworld.com/en/deals'] },
  { name: 'Sivvi', websiteUrl: 'https://www.sivvi.com', categorySlug: 'alisveris', seedUrls: ['https://www.sivvi.com/uae-en/sale/'] },
  { name: 'Brands For Less', websiteUrl: 'https://www.brandsforless.com', categorySlug: 'alisveris', seedUrls: ['https://www.brandsforless.com/en-ae/sale', 'https://www.brandsforless.com/en-ae/deals'] },
  { name: 'Centrepoint', websiteUrl: 'https://www.centrepointstores.com', categorySlug: 'alisveris', seedUrls: ['https://www.centrepointstores.com/ae/en/sale', 'https://www.centrepointstores.com/ae/en/offers'] },
  { name: 'Max Fashion', websiteUrl: 'https://www.maxfashion.com', categorySlug: 'alisveris', seedUrls: ['https://www.maxfashion.com/ae/en/sale', 'https://www.maxfashion.com/ae/en/offers'] },
  { name: '6thStreet', websiteUrl: 'https://www.6thstreet.com', categorySlug: 'alisveris', seedUrls: ['https://www.6thstreet.com/ae-en/sale', 'https://www.6thstreet.com/ae-en/offers'] },
  { name: 'Splash', websiteUrl: 'https://www.splashfashions.com', categorySlug: 'alisveris', seedUrls: ['https://www.splashfashions.com/ae/en/sale'] },
  { name: 'Jashanmal', websiteUrl: 'https://www.jashanmal.com', categorySlug: 'alisveris', seedUrls: ['https://www.jashanmal.com/offers', 'https://www.jashanmal.com/sale'] },
  { name: 'ACE Hardware', websiteUrl: 'https://www.aceuae.com', categorySlug: 'alisveris', seedUrls: ['https://www.aceuae.com/offers', 'https://www.aceuae.com/deals'] },
  { name: 'Home Centre', websiteUrl: 'https://www.homecentre.com', categorySlug: 'alisveris', seedUrls: ['https://www.homecentre.com/ae/en/sale', 'https://www.homecentre.com/ae/en/offers'] },
  { name: 'Pan Emirates', websiteUrl: 'https://www.panemirates.com', categorySlug: 'alisveris', seedUrls: ['https://www.panemirates.com/sale', 'https://www.panemirates.com/offers'] },
  { name: 'HomeBox', websiteUrl: 'https://www.homeboxstores.com', categorySlug: 'alisveris', seedUrls: ['https://www.homeboxstores.com/ae/en/sale', 'https://www.homeboxstores.com/ae/en/offers'] },
  { name: 'Pottery Barn', websiteUrl: 'https://www.potterybarn.ae', categorySlug: 'alisveris', seedUrls: ['https://www.potterybarn.ae/sale/'] },
  { name: 'Crate & Barrel', websiteUrl: 'https://www.crateandbarrel.ae', categorySlug: 'alisveris', seedUrls: ['https://www.crateandbarrel.ae/sale/'] },
  { name: 'West Elm', websiteUrl: 'https://www.westelm.ae', categorySlug: 'alisveris', seedUrls: ['https://www.westelm.ae/sale/'] },
  { name: 'Bloomingdales', websiteUrl: 'https://www.bloomingdales.ae', categorySlug: 'alisveris', seedUrls: ['https://www.bloomingdales.ae/sale/', 'https://www.bloomingdales.ae/offers/'] },
  { name: 'Harvey Nichols', websiteUrl: 'https://www.harveynichols.com', categorySlug: 'alisveris', seedUrls: ['https://www.harveynichols.com/sale/'] },
  { name: 'Level Shoes', websiteUrl: 'https://www.levelshoes.com', categorySlug: 'alisveris', seedUrls: ['https://www.levelshoes.com/sale.html', 'https://www.levelshoes.com/offers.html'] },
  { name: 'Emax', websiteUrl: 'https://www.emaxme.com', categorySlug: 'alisveris', seedUrls: ['https://www.emaxme.com/uae/offers', 'https://www.emaxme.com/uae/deals'] },
  { name: 'Virgin Megastore', websiteUrl: 'https://www.virginmegastore.ae', categorySlug: 'alisveris', seedUrls: ['https://www.virginmegastore.ae/en/offers', 'https://www.virginmegastore.ae/en/deals'] },
  { name: 'Geant', websiteUrl: 'https://www.geant.ae', categorySlug: 'alisveris', seedUrls: ['https://www.geant.ae/offers'] },
  { name: 'Spinneys', websiteUrl: 'https://www.spinneys.com', categorySlug: 'alisveris', seedUrls: ['https://www.spinneys.com/ae-en/offers', 'https://www.spinneys.com/ae-en/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Jumbo Electronics', websiteUrl: 'https://www.jumbo.ae', categorySlug: 'elektronik', seedUrls: ['https://www.jumbo.ae/deals', 'https://www.jumbo.ae/offers'] },
  { name: 'Apple', websiteUrl: 'https://www.apple.com/ae', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/ae/shop/go/special_deals'] },
  { name: 'Samsung', websiteUrl: 'https://www.samsung.com/ae', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/ae/offer/', 'https://www.samsung.com/ae/smartphones/all-smartphones/'] },
  { name: 'LG', websiteUrl: 'https://www.lg.com/ae', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/ae/promotions'] },
  { name: 'Sony', websiteUrl: 'https://www.sony.ae', categorySlug: 'elektronik', seedUrls: ['https://www.sony.ae/en/promotions', 'https://www.sony.ae/en/campaigns'] },
  { name: 'Microsoft', websiteUrl: 'https://www.microsoft.com/en-ae', categorySlug: 'elektronik', seedUrls: ['https://www.microsoft.com/en-ae/store/deals'] },
  { name: 'Dell', websiteUrl: 'https://www.dell.com/en-ae', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-ae/shop/deals'] },
  { name: 'HP', websiteUrl: 'https://www.hp.com/ae-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/ae-en/shop/offer'] },
  { name: 'Lenovo', websiteUrl: 'https://www.lenovo.com/ae/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/ae/en/d/deals/'] },
  { name: 'Huawei', websiteUrl: 'https://consumer.huawei.com/ae', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/ae/offer/'] },
  { name: 'Xiaomi', websiteUrl: 'https://www.mi.com/ae', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/ae/sale'] },
  { name: 'Asus', websiteUrl: 'https://www.asus.com/ae', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/ae/campaign/'] },
  { name: 'Bose', websiteUrl: 'https://www.bose.ae', categorySlug: 'elektronik', seedUrls: ['https://www.bose.ae/en/promotions.html'] },
  { name: 'JBL', websiteUrl: 'https://ae.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://ae.jbl.com/promotions.html'] },
  { name: 'Dyson', websiteUrl: 'https://www.dyson.ae', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.ae/promotions', 'https://www.dyson.ae/offers'] },
  { name: 'Logitech', websiteUrl: 'https://www.logitech.com/en-ae', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/en-ae/promo.html'] },
  { name: 'Canon', websiteUrl: 'https://www.canon-me.com', categorySlug: 'elektronik', seedUrls: ['https://www.canon-me.com/en/promotions'] },
  { name: 'Nikon', websiteUrl: 'https://www.nikon-me.com', categorySlug: 'elektronik', seedUrls: ['https://www.nikon-me.com/en_ME/promotions.page'] },
  { name: 'GoPro', websiteUrl: 'https://gopro.com/en/ae', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/en/ae/deals'] },
  { name: 'DJI', websiteUrl: 'https://store.dji.com/ae', categorySlug: 'elektronik', seedUrls: ['https://store.dji.com/ae/sale'] },
  { name: 'Anker', websiteUrl: 'https://www.anker.com/collections', categorySlug: 'elektronik', seedUrls: ['https://www.anker.com/collections/deals'] },
  { name: 'Etisalat', websiteUrl: 'https://www.etisalat.ae', categorySlug: 'elektronik', seedUrls: ['https://www.etisalat.ae/en/c/offers.jsp', 'https://www.etisalat.ae/en/c/deals.jsp'] },
  { name: 'du', websiteUrl: 'https://www.du.ae', categorySlug: 'elektronik', seedUrls: ['https://www.du.ae/personal/offers', 'https://www.du.ae/personal/deals'] },
  { name: 'Virgin Mobile', websiteUrl: 'https://www.virginmobile.ae', categorySlug: 'elektronik', seedUrls: ['https://www.virginmobile.ae/offers/'] },
  { name: 'Axiom Telecom', websiteUrl: 'https://www.axiomtelecom.com', categorySlug: 'elektronik', seedUrls: ['https://www.axiomtelecom.com/offers', 'https://www.axiomtelecom.com/deals'] },
  { name: 'Plug Ins', websiteUrl: 'https://www.pluginsonline.com', categorySlug: 'elektronik', seedUrls: ['https://www.pluginsonline.com/offers', 'https://www.pluginsonline.com/deals'] },
  { name: 'iStyle', websiteUrl: 'https://www.istyle.ae', categorySlug: 'elektronik', seedUrls: ['https://www.istyle.ae/offers', 'https://www.istyle.ae/deals'] },
  { name: 'Microless', websiteUrl: 'https://www.microless.com', categorySlug: 'elektronik', seedUrls: ['https://www.microless.com/deals', 'https://www.microless.com/offers'] },
  { name: 'Techno Blue', websiteUrl: 'https://www.technoblue.ae', categorySlug: 'elektronik', seedUrls: ['https://www.technoblue.ae/offers'] },
  { name: 'Jackys Electronics', websiteUrl: 'https://www.jackys.com', categorySlug: 'elektronik', seedUrls: ['https://www.jackys.com/deals', 'https://www.jackys.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'H&M', websiteUrl: 'https://www2.hm.com/en_ae', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/en_ae/sale.html', 'https://www2.hm.com/en_ae/deals.html'] },
  { name: 'Zara', websiteUrl: 'https://www.zara.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/ae/en/z-sale-l1702.html'] },
  { name: 'Massimo Dutti', websiteUrl: 'https://www.massimodutti.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/ae/en/sale-collection-c1718026.html'] },
  { name: 'Pull&Bear', websiteUrl: 'https://www.pullandbear.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/ae/en/sale-n6486.html'] },
  { name: 'Bershka', websiteUrl: 'https://www.bershka.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/ae/en/sale-c1010378033.html'] },
  { name: 'Mango', websiteUrl: 'https://www.mango.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.mango.com/ae/sale'] },
  { name: 'Forever 21', websiteUrl: 'https://www.forever21.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.forever21.ae/sale/'] },
  { name: 'Gap', websiteUrl: 'https://www.gap.com.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.gap.com.ae/sale/'] },
  { name: 'American Eagle', websiteUrl: 'https://www.americaneagle.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.americaneagle.ae/en/sale', 'https://www.americaneagle.ae/en/clearance'] },
  { name: "Levi's", websiteUrl: 'https://www.levi.com/AE/en', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com/AE/en/sale'] },
  { name: 'Nike', websiteUrl: 'https://www.nike.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/ae/w/sale-3yaep', 'https://www.nike.com/ae/w/deals-41h6y'] },
  { name: 'Adidas', websiteUrl: 'https://www.adidas.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.ae/en/sale'] },
  { name: 'Puma', websiteUrl: 'https://ae.puma.com', categorySlug: 'giyim-moda', seedUrls: ['https://ae.puma.com/ae/en/sale'] },
  { name: 'Under Armour', websiteUrl: 'https://www.underarmour.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.underarmour.ae/en-ae/sale/'] },
  { name: 'Foot Locker', websiteUrl: 'https://www.footlocker.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.footlocker.ae/en/sale/'] },
  { name: 'Skechers', websiteUrl: 'https://www.skechers.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.skechers.ae/sale/'] },
  { name: 'ASOS', websiteUrl: 'https://www.asos.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.asos.com/ae/sale/', 'https://www.asos.com/ae/offers/'] },
  { name: 'Farfetch', websiteUrl: 'https://www.farfetch.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.farfetch.com/ae/sale/all/items.aspx'] },
  { name: 'Net-a-Porter', websiteUrl: 'https://www.net-a-porter.com/en-ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.net-a-porter.com/en-ae/shop/sale'] },
  { name: 'The Luxury Closet', websiteUrl: 'https://www.theluxurycloset.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.theluxurycloset.com/sale', 'https://www.theluxurycloset.com/deals'] },
  { name: 'Splash Fashion', websiteUrl: 'https://www.splashfashions.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.splashfashions.com/ae/en/sale/'] },
  { name: 'R&B Fashion', websiteUrl: 'https://www.rnbfashion.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.rnbfashion.com/ae/en/sale'] },
  { name: 'Twenty4 Fashion', websiteUrl: 'https://www.twenty4.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.twenty4.ae/sale', 'https://www.twenty4.ae/offers'] },
  { name: 'Modanisa', websiteUrl: 'https://www.modanisa.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.modanisa.com/en/sale/'] },
  { name: 'Stradivarius', websiteUrl: 'https://www.stradivarius.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/ae/en/sale-n1721.html'] },
  { name: 'Guess', websiteUrl: 'https://www.guess.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.ae/en/sale'] },
  { name: 'Calvin Klein', websiteUrl: 'https://www.calvinklein.ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.ae/sale'] },
  { name: 'Tommy Hilfiger', websiteUrl: 'https://ae.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://ae.tommy.com/sale'] },
  { name: 'Lacoste', websiteUrl: 'https://www.lacoste.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com/ae/sale/'] },
  { name: 'Ted Baker', websiteUrl: 'https://www.tedbaker.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.tedbaker.com/ae/sale'] },
  { name: 'Charles & Keith', websiteUrl: 'https://www.charleskeith.com/ae', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/ae/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Carrefour', websiteUrl: 'https://www.carrefouruae.com', categorySlug: 'gida-market', seedUrls: ['https://www.carrefouruae.com/mafuae/en/c/deals', 'https://www.carrefouruae.com/mafuae/en/c/offers-promotions'] },
  { name: 'LuLu', websiteUrl: 'https://www.luluhypermarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.luluhypermarket.com/en-ae/offers', 'https://www.luluhypermarket.com/en-ae/promotions'] },
  { name: 'Kibsons', websiteUrl: 'https://www.kibsons.com', categorySlug: 'gida-market', seedUrls: ['https://www.kibsons.com/en-ae/offers', 'https://www.kibsons.com/en-ae/deals'] },
  { name: 'Noon Daily', websiteUrl: 'https://www.noon.com', categorySlug: 'gida-market', seedUrls: ['https://www.noon.com/uae-en/grocery/deals/'] },
  { name: 'Instashop', websiteUrl: 'https://www.instashop.com', categorySlug: 'gida-market', seedUrls: ['https://www.instashop.com/en/offers'] },
  { name: 'Talabat Mart', websiteUrl: 'https://www.talabat.com', categorySlug: 'gida-market', seedUrls: ['https://www.talabat.com/uae/groceries'] },
  { name: 'Al Maya', websiteUrl: 'https://www.almaya.ae', categorySlug: 'gida-market', seedUrls: ['https://www.almaya.ae/offers', 'https://www.almaya.ae/promotions'] },
  { name: 'Union Coop', websiteUrl: 'https://www.unioncoop.ae', categorySlug: 'gida-market', seedUrls: ['https://www.unioncoop.ae/en/offers', 'https://www.unioncoop.ae/en/promotions'] },
  { name: 'Waitrose', websiteUrl: 'https://www.waitrose.ae', categorySlug: 'gida-market', seedUrls: ['https://www.waitrose.ae/offers'] },
  { name: 'Choithrams', websiteUrl: 'https://www.choithrams.com', categorySlug: 'gida-market', seedUrls: ['https://www.choithrams.com/offers', 'https://www.choithrams.com/promotions'] },
  { name: 'Al Madina Hypermarket', websiteUrl: 'https://www.almadinahypermarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.almadinahypermarket.com/offers'] },
  { name: 'Grandiose Supermarket', websiteUrl: 'https://www.grandiose.ae', categorySlug: 'gida-market', seedUrls: ['https://www.grandiose.ae/offers', 'https://www.grandiose.ae/promotions'] },
  { name: 'West Zone', websiteUrl: 'https://www.westzone.com', categorySlug: 'gida-market', seedUrls: ['https://www.westzone.com/offers'] },
  { name: 'Baqala', websiteUrl: 'https://www.baqala.com', categorySlug: 'gida-market', seedUrls: ['https://www.baqala.com/offers'] },
  { name: 'NatureLand', websiteUrl: 'https://www.natureland.ae', categorySlug: 'gida-market', seedUrls: ['https://www.natureland.ae/offers', 'https://www.natureland.ae/deals'] },
  { name: 'Organic Foods', websiteUrl: 'https://www.organicfoodsandcafe.com', categorySlug: 'gida-market', seedUrls: ['https://www.organicfoodsandcafe.com/offers'] },
  { name: 'Quoodo', websiteUrl: 'https://www.quoodo.com', categorySlug: 'gida-market', seedUrls: ['https://www.quoodo.com/offers'] },
  { name: 'iHerb', websiteUrl: 'https://www.iherb.com', categorySlug: 'gida-market', seedUrls: ['https://www.iherb.com/specials', 'https://www.iherb.com/deals'] },
  { name: 'Viva Supermarket', websiteUrl: 'https://www.vivasupermarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.vivasupermarket.com/offers'] },
  { name: 'Fathima', websiteUrl: 'https://www.fathimagroup.ae', categorySlug: 'gida-market', seedUrls: ['https://www.fathimagroup.ae/offers'] },
  { name: 'Al Fair', websiteUrl: 'https://www.alfair.ae', categorySlug: 'gida-market', seedUrls: ['https://www.alfair.ae/offers'] },
  { name: 'Al Safeer', websiteUrl: 'https://www.alsafeergroup.com', categorySlug: 'gida-market', seedUrls: ['https://www.alsafeergroup.com/offers'] },
  { name: 'Barakat', websiteUrl: 'https://www.barakatfresh.ae', categorySlug: 'gida-market', seedUrls: ['https://www.barakatfresh.ae/offers', 'https://www.barakatfresh.ae/deals'] },
  { name: 'Emirates Coop', websiteUrl: 'https://www.emiratescoop.ae', categorySlug: 'gida-market', seedUrls: ['https://www.emiratescoop.ae/offers'] },
  { name: 'Nesto Hypermarket', websiteUrl: 'https://www.nesto.ae', categorySlug: 'gida-market', seedUrls: ['https://www.nesto.ae/offers', 'https://www.nesto.ae/promotions'] },
  { name: 'Ajman Market', websiteUrl: 'https://www.ajmanmarket.ae', categorySlug: 'gida-market', seedUrls: ['https://www.ajmanmarket.ae/offers'] },
  { name: 'HealthyPlanet', websiteUrl: 'https://www.healthyplanet.ae', categorySlug: 'gida-market', seedUrls: ['https://www.healthyplanet.ae/offers'] },
  { name: 'Danube Online', websiteUrl: 'https://www.danubehome.com', categorySlug: 'gida-market', seedUrls: ['https://www.danubehome.com/ae/en/offers'] },
  { name: 'El Grocer', websiteUrl: 'https://www.elgrocer.com', categorySlug: 'gida-market', seedUrls: ['https://www.elgrocer.com/offers', 'https://www.elgrocer.com/deals'] },
  { name: 'Trolley', websiteUrl: 'https://www.trolley.ae', categorySlug: 'gida-market', seedUrls: ['https://www.trolley.ae/offers', 'https://www.trolley.ae/deals'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Drink (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Talabat', websiteUrl: 'https://www.talabat.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.talabat.com/uae/offers', 'https://www.talabat.com/uae/deals'] },
  { name: 'Zomato', websiteUrl: 'https://www.zomato.com/dubai', categorySlug: 'yeme-icme', seedUrls: ['https://www.zomato.com/dubai/offers'] },
  { name: 'Deliveroo', websiteUrl: 'https://deliveroo.ae', categorySlug: 'yeme-icme', seedUrls: ['https://deliveroo.ae/offers', 'https://deliveroo.ae/deals'] },
  { name: 'Careem Now', websiteUrl: 'https://www.careem.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.careem.com/en-ae/food/'] },
  { name: 'Noon Food', websiteUrl: 'https://www.noon.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.noon.com/uae-en/food/deals/'] },
  { name: "McDonald's", websiteUrl: 'https://www.mcdonalds.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.ae/offers', 'https://www.mcdonalds.ae/deals'] },
  { name: 'KFC', websiteUrl: 'https://www.kfc.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.ae/offers', 'https://www.kfc.ae/deals'] },
  { name: 'Pizza Hut', websiteUrl: 'https://www.pizzahut.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.ae/offers', 'https://www.pizzahut.ae/deals'] },
  { name: 'Burger King', websiteUrl: 'https://www.burgerking.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.ae/offers', 'https://www.burgerking.ae/deals'] },
  { name: 'Subway', websiteUrl: 'https://www.subway.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.ae/offers'] },
  { name: "Nando's", websiteUrl: 'https://www.nandos.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.ae/offers'] },
  { name: "PF Chang's", websiteUrl: 'https://www.pfchangs.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.pfchangs.ae/offers'] },
  { name: 'Cheesecake Factory', websiteUrl: 'https://www.thecheesecakefactory.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.thecheesecakefactory.ae/offers'] },
  { name: 'Shake Shack', websiteUrl: 'https://www.shakeshack.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.shakeshack.ae/offers'] },
  { name: 'Five Guys', websiteUrl: 'https://www.fiveguys.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.fiveguys.ae/offers'] },
  { name: 'Salt', websiteUrl: 'https://www.findsalt.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.findsalt.com/offers'] },
  { name: 'Operation Falafel', websiteUrl: 'https://www.operationfalafel.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.operationfalafel.com/offers'] },
  { name: 'Al Fanar', websiteUrl: 'https://www.alfanarrestaurant.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.alfanarrestaurant.com/offers'] },
  { name: 'Arabian Tea House', websiteUrl: 'https://www.arabianteahouse.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.arabianteahouse.ae/offers'] },
  { name: 'Texas Roadhouse', websiteUrl: 'https://www.texasroadhouse.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.texasroadhouse.ae/offers'] },
  { name: 'Tim Hortons', websiteUrl: 'https://www.timhortons.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.timhortons.ae/offers', 'https://www.timhortons.ae/deals'] },
  { name: 'Starbucks', websiteUrl: 'https://www.starbucks.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.ae/offers'] },
  { name: 'Costa Coffee', websiteUrl: 'https://www.costacoffee.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.costacoffee.ae/offers'] },
  { name: "Dunkin'", websiteUrl: 'https://www.dunkindonuts.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.ae/offers', 'https://www.dunkindonuts.ae/deals'] },
  { name: 'Baskin Robbins', websiteUrl: 'https://www.baskinrobbins.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbins.ae/offers'] },
  { name: 'Jollibee', websiteUrl: 'https://www.jollibee.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.jollibee.ae/offers'] },
  { name: 'The Entertainer', websiteUrl: 'https://www.theentertainerme.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.theentertainerme.com/offers', 'https://www.theentertainerme.com/deals'] },
  { name: "Hardee's", websiteUrl: 'https://www.hardees.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.hardees.ae/offers'] },
  { name: "Papa John's", websiteUrl: 'https://www.papajohns.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.papajohns.ae/offers', 'https://www.papajohns.ae/deals'] },
  { name: "Popeyes", websiteUrl: 'https://www.popeyes.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.popeyes.ae/offers'] },
  { name: 'Smashburger', websiteUrl: 'https://www.smashburger.ae', categorySlug: 'yeme-icme', seedUrls: ['https://www.smashburger.ae/offers'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sephora', websiteUrl: 'https://www.sephora.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.ae/en/sale/', 'https://www.sephora.ae/en/offers/'] },
  { name: 'Faces', websiteUrl: 'https://www.faces.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.faces.com/ae-en/sale', 'https://www.faces.com/ae-en/offers'] },
  { name: 'Bath & Body Works', websiteUrl: 'https://www.bathandbodyworks.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.ae/en/sale', 'https://www.bathandbodyworks.ae/en/offers'] },
  { name: 'The Body Shop', websiteUrl: 'https://www.thebodyshop.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.ae/en/sale', 'https://www.thebodyshop.ae/en/offers'] },
  { name: 'MAC', websiteUrl: 'https://www.maccosmetics.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.ae/offers'] },
  { name: 'Huda Beauty', websiteUrl: 'https://hudabeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://hudabeauty.com/sale', 'https://hudabeauty.com/offers'] },
  { name: 'Charlotte Tilbury', websiteUrl: 'https://www.charlottetilbury.com/ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.charlottetilbury.com/ae/sale'] },
  { name: 'Estée Lauder', websiteUrl: 'https://www.esteelauder.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.ae/offers'] },
  { name: 'Clinique', websiteUrl: 'https://www.clinique.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.ae/offers'] },
  { name: 'Bobbi Brown', websiteUrl: 'https://www.bobbibrown.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bobbibrown.ae/offers'] },
  { name: 'NARS', websiteUrl: 'https://www.narscosmetics.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.narscosmetics.ae/offers'] },
  { name: 'Urban Decay', websiteUrl: 'https://www.urbandecay.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.urbandecay.ae/offers'] },
  { name: 'Benefit', websiteUrl: 'https://www.benefitcosmetics.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.benefitcosmetics.ae/offers'] },
  { name: 'Lush', websiteUrl: 'https://www.lush.com/ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/ae/en/offers'] },
  { name: "Kiehl's", websiteUrl: 'https://www.kiehls.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.ae/offers'] },
  { name: "L'Occitane", websiteUrl: 'https://www.loccitane.com/en-ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loccitane.com/en-ae/sale'] },
  { name: 'Jo Malone', websiteUrl: 'https://www.jomalone.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.jomalone.ae/offers'] },
  { name: 'Rituals', websiteUrl: 'https://www.rituals.com/en-ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/en-ae/sale'] },
  { name: 'Boots', websiteUrl: 'https://www.boots.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.boots.ae/offers', 'https://www.boots.ae/deals'] },
  { name: 'Paris Gallery', websiteUrl: 'https://www.parisgallery.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.parisgallery.com/en/sale', 'https://www.parisgallery.com/en/offers'] },
  { name: 'Wojooh', websiteUrl: 'https://www.wojooh.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.wojooh.com/en/offers', 'https://www.wojooh.com/en/sale'] },
  { name: 'Golden Scent', websiteUrl: 'https://www.goldenscent.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.goldenscent.com/en/sale', 'https://www.goldenscent.com/en/offers'] },
  { name: 'Swiss Arabian', websiteUrl: 'https://www.swissarabian.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.swissarabian.com/offers', 'https://www.swissarabian.com/deals'] },
  { name: 'Ajmal Perfumes', websiteUrl: 'https://www.ajmalperfume.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ajmalperfume.com/offers', 'https://www.ajmalperfume.com/deals'] },
  { name: 'Al Haramain', websiteUrl: 'https://www.alharamain.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.alharamain.com/offers'] },
  { name: 'Nabeel', websiteUrl: 'https://www.nabeelperfumes.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nabeelperfumes.com/offers'] },
  { name: 'Oud Milano', websiteUrl: 'https://www.oudmilano.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.oudmilano.com/offers'] },
  { name: 'Penhaligons', websiteUrl: 'https://www.penhaligons.com/ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.penhaligons.com/ae/en/sale'] },
  { name: 'La Mer', websiteUrl: 'https://www.lamer.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lamer.ae/offers'] },
  { name: 'Tom Ford Beauty', websiteUrl: 'https://www.tomfordbeauty.ae', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.tomfordbeauty.ae/offers'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA', websiteUrl: 'https://www.ikea.com/ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/ae/en/offers/', 'https://www.ikea.com/ae/en/campaigns/'] },
  { name: 'Danube Home', websiteUrl: 'https://www.danubehome.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.danubehome.com/ae/en/sale', 'https://www.danubehome.com/ae/en/offers'] },
  { name: 'Marina Home', websiteUrl: 'https://www.marinahome.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.marinahome.com/sale', 'https://www.marinahome.com/offers'] },
  { name: 'Homes r Us', websiteUrl: 'https://www.homesrus.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.homesrus.com/ae/en/sale', 'https://www.homesrus.com/ae/en/offers'] },
  { name: '2XL Furniture', websiteUrl: 'https://www.2xlme.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.2xlme.com/sale', 'https://www.2xlme.com/offers'] },
  { name: 'THE One', websiteUrl: 'https://www.theone.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.theone.com/sale', 'https://www.theone.com/offers'] },
  { name: 'Interiors', websiteUrl: 'https://www.interiorsfurniture.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.interiorsfurniture.com/sale'] },
  { name: 'Zara Home', websiteUrl: 'https://www.zarahome.com/ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/ae/en/sale-l1711.html'] },
  { name: 'H&M Home', websiteUrl: 'https://www2.hm.com/en_ae', categorySlug: 'ev-yasam', seedUrls: ['https://www2.hm.com/en_ae/home/sale.html'] },
  { name: 'Tavola', websiteUrl: 'https://www.tavolashop.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.tavolashop.com/sale'] },
  { name: 'Royal Furniture', websiteUrl: 'https://www.royalfurniture.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.royalfurniture.ae/sale', 'https://www.royalfurniture.ae/offers'] },
  { name: 'United Furniture', websiteUrl: 'https://www.unitedfurniture.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.unitedfurniture.ae/sale'] },
  { name: 'Lucky Furniture', websiteUrl: 'https://www.luckyfurniture.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.luckyfurniture.ae/offers'] },
  { name: 'Al Huzaifa', websiteUrl: 'https://www.alhuzaifa.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.alhuzaifa.com/sale', 'https://www.alhuzaifa.com/offers'] },
  { name: 'Ebarza', websiteUrl: 'https://www.ebarza.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ebarza.com/sale', 'https://www.ebarza.com/deals'] },
  { name: 'DesertCart', websiteUrl: 'https://www.desertcart.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.desertcart.ae/deals', 'https://www.desertcart.ae/offers'] },
  { name: 'Dragon Mart Online', websiteUrl: 'https://www.dragonmart.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.dragonmart.ae/deals', 'https://www.dragonmart.ae/offers'] },
  { name: 'CitiMax', websiteUrl: 'https://www.citimax.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.citimax.ae/offers'] },
  { name: 'Asghar Furniture', websiteUrl: 'https://www.asgharfurniture.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.asgharfurniture.ae/sale', 'https://www.asgharfurniture.ae/offers'] },
  { name: 'Tanagra', websiteUrl: 'https://www.tanagra.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.tanagra.ae/sale'] },
  { name: 'Crate & Barrel Home', websiteUrl: 'https://www.crateandbarrel.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.crateandbarrel.ae/sale/home/'] },
  { name: 'West Elm Home', websiteUrl: 'https://www.westelm.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.westelm.ae/sale/home/'] },
  { name: 'Pottery Barn Home', websiteUrl: 'https://www.potterybarn.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.potterybarn.ae/sale/home/'] },
  { name: 'Williams Sonoma', websiteUrl: 'https://www.williams-sonoma.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.williams-sonoma.ae/sale/'] },
  { name: 'Maisons du Monde', websiteUrl: 'https://www.maisonsdumonde.com/AE', categorySlug: 'ev-yasam', seedUrls: ['https://www.maisonsdumonde.com/AE/en/sale/'] },
  { name: 'Pottery Barn Kids', websiteUrl: 'https://www.potterybarnkids.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.potterybarnkids.ae/sale/'] },
  { name: 'Restoration Hardware', websiteUrl: 'https://rh.com', categorySlug: 'ev-yasam', seedUrls: ['https://rh.com/sale/'] },
  { name: 'BoConcept', websiteUrl: 'https://www.boconcept.com/en-ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.boconcept.com/en-ae/sale/'] },
  { name: 'Ethan Allen', websiteUrl: 'https://www.ethanallen.ae', categorySlug: 'ev-yasam', seedUrls: ['https://www.ethanallen.ae/sale/'] },
  { name: 'Chattels & More', websiteUrl: 'https://www.chattelsandmore.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.chattelsandmore.com/sale', 'https://www.chattelsandmore.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sun & Sand Sports', websiteUrl: 'https://www.sssports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sssports.com/ae/en/sale', 'https://www.sssports.com/ae/en/offers'] },
  { name: 'Go Sport', websiteUrl: 'https://www.go-sport.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.go-sport.ae/sale', 'https://www.go-sport.ae/offers'] },
  { name: 'Decathlon', websiteUrl: 'https://www.decathlon.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.ae/en/sale', 'https://www.decathlon.ae/en/special-offers'] },
  { name: 'JD Sports', websiteUrl: 'https://www.jdsports.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.jdsports.ae/sale/'] },
  { name: 'New Balance', websiteUrl: 'https://www.newbalance.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.ae/sale/'] },
  { name: 'Reebok', websiteUrl: 'https://www.reebok.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.ae/sale'] },
  { name: 'Asics', websiteUrl: 'https://www.asics.com/ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/ae/en/sale/'] },
  { name: 'Columbia', websiteUrl: 'https://www.columbiasportswear.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.ae/sale/'] },
  { name: 'The North Face', websiteUrl: 'https://www.thenorthface.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.ae/sale/'] },
  { name: 'Timberland', websiteUrl: 'https://www.timberland.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.ae/sale/'] },
  { name: 'Helly Hansen', websiteUrl: 'https://www.hellyhansen.com/ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.com/ae/sale'] },
  { name: 'Intersport', websiteUrl: 'https://www.intersport.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.ae/sale', 'https://www.intersport.ae/offers'] },
  { name: 'Fitness First', websiteUrl: 'https://www.fitnessfirst.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitnessfirst.ae/offers', 'https://www.fitnessfirst.ae/deals'] },
  { name: 'GymNation', websiteUrl: 'https://www.gymnation.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gymnation.com/offers'] },
  { name: 'Vogue Fitness', websiteUrl: 'https://www.voguefitness.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.voguefitness.ae/offers'] },
  { name: "Gold's Gym", websiteUrl: 'https://www.goldsgym.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.goldsgym.ae/offers'] },
  { name: 'F45', websiteUrl: 'https://www.f45training.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.f45training.ae/offers'] },
  { name: "Barry's", websiteUrl: 'https://www.barrys.com/ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.barrys.com/ae/offers'] },
  { name: 'Alo Yoga', websiteUrl: 'https://www.aloyoga.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.aloyoga.com/collections/sale'] },
  { name: 'Lululemon', websiteUrl: 'https://www.lululemon.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lululemon.ae/c/sale/'] },
  { name: 'Roxy', websiteUrl: 'https://www.roxy-me.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.roxy-me.com/ae/sale/'] },
  { name: 'Quiksilver', websiteUrl: 'https://www.quiksilver-me.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.quiksilver-me.com/ae/sale/'] },
  { name: 'GNC', websiteUrl: 'https://www.gnc.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gnc.ae/offers', 'https://www.gnc.ae/deals'] },
  { name: 'Optimum Nutrition', websiteUrl: 'https://www.optimumnutrition.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.optimumnutrition.ae/offers'] },
  { name: 'Myprotein', websiteUrl: 'https://www.myprotein.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.myprotein.ae/offers.list'] },
  { name: 'Fila', websiteUrl: 'https://www.fila.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.ae/sale/'] },
  { name: 'Converse', websiteUrl: 'https://www.converse.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.ae/sale/'] },
  { name: 'Vans', websiteUrl: 'https://www.vans.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.ae/sale/'] },
  { name: 'Crocs', websiteUrl: 'https://www.crocs.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.crocs.ae/sale/'] },
  { name: 'Speedo', websiteUrl: 'https://www.speedo.ae', categorySlug: 'spor-outdoor', seedUrls: ['https://www.speedo.ae/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Emirates', websiteUrl: 'https://www.emirates.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.emirates.com/ae/english/special-offers/', 'https://www.emirates.com/ae/english/deals/'] },
  { name: 'Etihad', websiteUrl: 'https://www.etihad.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.etihad.com/en-ae/deals', 'https://www.etihad.com/en-ae/special-offers'] },
  { name: 'flydubai', websiteUrl: 'https://www.flydubai.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flydubai.com/en/offers/', 'https://www.flydubai.com/en/deals/'] },
  { name: 'Air Arabia', websiteUrl: 'https://www.airarabia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airarabia.com/en/offers', 'https://www.airarabia.com/en/deals'] },
  { name: 'Booking.com', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.html'] },
  { name: 'Expedia', websiteUrl: 'https://www.expedia.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.ae/deals', 'https://www.expedia.ae/offers'] },
  { name: 'Agoda', websiteUrl: 'https://www.agoda.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/deals', 'https://www.agoda.com/promotions'] },
  { name: 'Hotels.com', websiteUrl: 'https://www.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hotels.com/deals/'] },
  { name: 'Trivago', websiteUrl: 'https://www.trivago.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.ae/'] },
  { name: 'Wego', websiteUrl: 'https://www.wego.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.wego.ae/deals', 'https://www.wego.ae/offers'] },
  { name: 'Skyscanner', websiteUrl: 'https://www.skyscanner.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.ae/deals'] },
  { name: 'Musafir', websiteUrl: 'https://www.musafir.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.musafir.com/offers', 'https://www.musafir.com/deals'] },
  { name: 'Almosafer', websiteUrl: 'https://www.almosafer.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.almosafer.com/en/offers', 'https://www.almosafer.com/en/deals'] },
  { name: 'Dnata Travel', websiteUrl: 'https://www.dnatatravel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.dnatatravel.com/offers', 'https://www.dnatatravel.com/deals'] },
  { name: 'Arabian Adventures', websiteUrl: 'https://www.arabian-adventures.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.arabian-adventures.com/offers'] },
  { name: 'Rayna Tours', websiteUrl: 'https://www.raynatours.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.raynatours.com/offers', 'https://www.raynatours.com/deals'] },
  { name: 'GetYourGuide', websiteUrl: 'https://www.getyourguide.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.getyourguide.com/dubai-l173/deals/'] },
  { name: 'Klook', websiteUrl: 'https://www.klook.com/en-AE', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klook.com/en-AE/promo/deals/', 'https://www.klook.com/en-AE/promo/offers/'] },
  { name: 'TripAdvisor', websiteUrl: 'https://www.tripadvisor.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tripadvisor.ae/Deals'] },
  { name: 'Holidayme', websiteUrl: 'https://www.holidayme.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.holidayme.com/deals', 'https://www.holidayme.com/offers'] },
  { name: 'Uber', websiteUrl: 'https://www.uber.com/ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/ae/en/ride/offers/'] },
  { name: 'Careem', websiteUrl: 'https://www.careem.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.careem.com/en-ae/offers/'] },
  { name: 'RTA Dubai', websiteUrl: 'https://www.rta.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rta.ae/wps/portal/rta/ae/home/offers'] },
  { name: 'Salik', websiteUrl: 'https://www.salik.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.salik.ae/offers'] },
  { name: 'Ekar', websiteUrl: 'https://www.ekar.app', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ekar.app/offers'] },
  { name: 'Udrive', websiteUrl: 'https://www.udrive.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.udrive.ae/offers'] },
  { name: 'Hertz', websiteUrl: 'https://www.hertz.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.ae/rentacar/reservation/offers'] },
  { name: 'Avis', websiteUrl: 'https://www.avis.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avis.ae/offers'] },
  { name: 'Budget', websiteUrl: 'https://www.budget.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.budget.ae/offers'] },
  { name: 'National Car Rental', websiteUrl: 'https://www.nationalcar.ae', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nationalcar.ae/offers'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Emirates NBD', websiteUrl: 'https://www.emiratesnbd.com', categorySlug: 'finans', seedUrls: ['https://www.emiratesnbd.com/en/offers/', 'https://www.emiratesnbd.com/en/deals/'] },
  { name: 'Abu Dhabi Commercial Bank', websiteUrl: 'https://www.adcb.com', categorySlug: 'finans', seedUrls: ['https://www.adcb.com/en/personal/offers/', 'https://www.adcb.com/en/personal/deals/'] },
  { name: 'First Abu Dhabi Bank', websiteUrl: 'https://www.bankfab.com', categorySlug: 'finans', seedUrls: ['https://www.bankfab.com/en-ae/personal/offers', 'https://www.bankfab.com/en-ae/personal/deals'] },
  { name: 'Mashreq Bank', websiteUrl: 'https://www.mashreqbank.com', categorySlug: 'finans', seedUrls: ['https://www.mashreqbank.com/en/uae/personal/offers', 'https://www.mashreqbank.com/en/uae/personal/deals'] },
  { name: 'Dubai Islamic Bank', websiteUrl: 'https://www.dib.ae', categorySlug: 'finans', seedUrls: ['https://www.dib.ae/personal/offers', 'https://www.dib.ae/personal/deals'] },
  { name: 'RAKBank', websiteUrl: 'https://www.rakbank.ae', categorySlug: 'finans', seedUrls: ['https://www.rakbank.ae/personal/offers', 'https://www.rakbank.ae/personal/deals'] },
  { name: 'Ajman Bank', websiteUrl: 'https://www.ajmanbank.ae', categorySlug: 'finans', seedUrls: ['https://www.ajmanbank.ae/offers'] },
  { name: 'Al Hilal Bank', websiteUrl: 'https://www.alhilalbank.ae', categorySlug: 'finans', seedUrls: ['https://www.alhilalbank.ae/en/personal/offers/'] },
  { name: 'Commercial Bank of Dubai', websiteUrl: 'https://www.cbd.ae', categorySlug: 'finans', seedUrls: ['https://www.cbd.ae/personal/offers', 'https://www.cbd.ae/personal/deals'] },
  { name: 'National Bank of Fujairah', websiteUrl: 'https://www.nbf.ae', categorySlug: 'finans', seedUrls: ['https://www.nbf.ae/offers'] },
  { name: 'Standard Chartered', websiteUrl: 'https://www.sc.com/ae', categorySlug: 'finans', seedUrls: ['https://www.sc.com/ae/promotions/', 'https://www.sc.com/ae/offers/'] },
  { name: 'HSBC', websiteUrl: 'https://www.hsbc.ae', categorySlug: 'finans', seedUrls: ['https://www.hsbc.ae/offers/', 'https://www.hsbc.ae/deals/'] },
  { name: 'Citibank', websiteUrl: 'https://www.citibank.ae', categorySlug: 'finans', seedUrls: ['https://www.citibank.ae/gcb/offers/', 'https://www.citibank.ae/gcb/deals/'] },
  { name: 'Liv', websiteUrl: 'https://www.liv.me', categorySlug: 'finans', seedUrls: ['https://www.liv.me/en/offers'] },
  { name: 'YAP', websiteUrl: 'https://www.yap.com', categorySlug: 'finans', seedUrls: ['https://www.yap.com/offers'] },
  { name: 'NOW Money', websiteUrl: 'https://www.nowmoney.me', categorySlug: 'finans', seedUrls: ['https://www.nowmoney.me/offers'] },
  { name: 'PayBy', websiteUrl: 'https://www.payby.com', categorySlug: 'finans', seedUrls: ['https://www.payby.com/offers'] },
  { name: 'Tabby', websiteUrl: 'https://www.tabby.ai', categorySlug: 'finans', seedUrls: ['https://www.tabby.ai/en-AE/offers', 'https://www.tabby.ai/en-AE/deals'] },
  { name: 'Postpay', websiteUrl: 'https://www.postpay.io', categorySlug: 'finans', seedUrls: ['https://www.postpay.io/offers'] },
  { name: 'Tamara', websiteUrl: 'https://www.tamara.co', categorySlug: 'finans', seedUrls: ['https://www.tamara.co/offers'] },
  { name: 'Cashew', websiteUrl: 'https://www.cashewpayments.com', categorySlug: 'finans', seedUrls: ['https://www.cashewpayments.com/offers'] },
  { name: 'Spotii', websiteUrl: 'https://www.spotii.com', categorySlug: 'finans', seedUrls: ['https://www.spotii.com/offers'] },
  { name: 'Al Ansari Exchange', websiteUrl: 'https://www.alansariexchange.com', categorySlug: 'finans', seedUrls: ['https://www.alansariexchange.com/offers'] },
  { name: 'UAE Exchange', websiteUrl: 'https://www.uaeexchange.com', categorySlug: 'finans', seedUrls: ['https://www.uaeexchange.com/offers'] },
  { name: 'Travelex', websiteUrl: 'https://www.travelex.ae', categorySlug: 'finans', seedUrls: ['https://www.travelex.ae/offers'] },
  { name: 'Western Union', websiteUrl: 'https://www.westernunion.com/ae', categorySlug: 'finans', seedUrls: ['https://www.westernunion.com/ae/en/offers.html'] },
  { name: 'MoneyGram', websiteUrl: 'https://www.moneygram.com/mgo/ae', categorySlug: 'finans', seedUrls: ['https://www.moneygram.com/mgo/ae/en/offers'] },
  { name: 'XE', websiteUrl: 'https://www.xe.com', categorySlug: 'finans', seedUrls: ['https://www.xe.com/offers/'] },
  { name: 'Wise', websiteUrl: 'https://wise.com', categorySlug: 'finans', seedUrls: ['https://wise.com/ae/'] },
  { name: 'Wio Bank', websiteUrl: 'https://www.wio.io', categorySlug: 'finans', seedUrls: ['https://www.wio.io/offers'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Oman Insurance', websiteUrl: 'https://www.tameen.ae', categorySlug: 'sigorta', seedUrls: ['https://www.tameen.ae/offers', 'https://www.tameen.ae/promotions'] },
  { name: 'AXA', websiteUrl: 'https://www.axa.ae', categorySlug: 'sigorta', seedUrls: ['https://www.axa.ae/offers', 'https://www.axa.ae/promotions'] },
  { name: 'Orient Insurance', websiteUrl: 'https://www.orientinsurance.ae', categorySlug: 'sigorta', seedUrls: ['https://www.orientinsurance.ae/offers'] },
  { name: 'Sukoon Insurance', websiteUrl: 'https://www.sukoon.com', categorySlug: 'sigorta', seedUrls: ['https://www.sukoon.com/offers'] },
  { name: 'Daman', websiteUrl: 'https://www.damanhealth.ae', categorySlug: 'sigorta', seedUrls: ['https://www.damanhealth.ae/offers', 'https://www.damanhealth.ae/promotions'] },
  { name: 'ADNIC', websiteUrl: 'https://www.adnic.ae', categorySlug: 'sigorta', seedUrls: ['https://www.adnic.ae/en/offers', 'https://www.adnic.ae/en/promotions'] },
  { name: 'Takaful Emarat', websiteUrl: 'https://www.takafulemarat.com', categorySlug: 'sigorta', seedUrls: ['https://www.takafulemarat.com/offers'] },
  { name: 'Noor Takaful', websiteUrl: 'https://www.noortakaful.ae', categorySlug: 'sigorta', seedUrls: ['https://www.noortakaful.ae/offers'] },
  { name: 'Abu Dhabi National Takaful', websiteUrl: 'https://www.adntakaful.ae', categorySlug: 'sigorta', seedUrls: ['https://www.adntakaful.ae/offers'] },
  { name: 'MetLife', websiteUrl: 'https://www.metlife.ae', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.ae/offers/'] },
  { name: 'Zurich', websiteUrl: 'https://www.zurich.ae', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.ae/offers'] },
  { name: 'Allianz', websiteUrl: 'https://www.allianz.ae', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.ae/offers'] },
  { name: 'Cigna', websiteUrl: 'https://www.cigna-me.com', categorySlug: 'sigorta', seedUrls: ['https://www.cigna-me.com/offers'] },
  { name: 'RSA', websiteUrl: 'https://www.rsagroup.ae', categorySlug: 'sigorta', seedUrls: ['https://www.rsagroup.ae/offers'] },
  { name: 'AIG', websiteUrl: 'https://www.aig.ae', categorySlug: 'sigorta', seedUrls: ['https://www.aig.ae/offers'] },
  { name: 'Bupa Global', websiteUrl: 'https://www.bupa.ae', categorySlug: 'sigorta', seedUrls: ['https://www.bupa.ae/offers'] },
  { name: 'GIG Gulf', websiteUrl: 'https://www.giggulf.ae', categorySlug: 'sigorta', seedUrls: ['https://www.giggulf.ae/offers'] },
  { name: 'Al Wathba Insurance', websiteUrl: 'https://www.awnic.com', categorySlug: 'sigorta', seedUrls: ['https://www.awnic.com/offers'] },
  { name: 'Arabia Insurance', websiteUrl: 'https://www.arabiainsurance.ae', categorySlug: 'sigorta', seedUrls: ['https://www.arabiainsurance.ae/offers'] },
  { name: 'Salama', websiteUrl: 'https://www.salama.ae', categorySlug: 'sigorta', seedUrls: ['https://www.salama.ae/offers'] },
  { name: 'Yas Takaful', websiteUrl: 'https://www.yastakaful.ae', categorySlug: 'sigorta', seedUrls: ['https://www.yastakaful.ae/offers'] },
  { name: 'RAK Insurance', websiteUrl: 'https://www.rakinsurance.ae', categorySlug: 'sigorta', seedUrls: ['https://www.rakinsurance.ae/offers'] },
  { name: 'Watania', websiteUrl: 'https://www.watania.ae', categorySlug: 'sigorta', seedUrls: ['https://www.watania.ae/offers'] },
  { name: 'Dubai Insurance', websiteUrl: 'https://www.dubaiinsurance.ae', categorySlug: 'sigorta', seedUrls: ['https://www.dubaiinsurance.ae/offers'] },
  { name: 'Al Ittihad Al Watani', websiteUrl: 'https://www.aiaw.ae', categorySlug: 'sigorta', seedUrls: ['https://www.aiaw.ae/offers'] },
  { name: 'United Fidelity', websiteUrl: 'https://www.ufinet.ae', categorySlug: 'sigorta', seedUrls: ['https://www.ufinet.ae/offers'] },
  { name: 'Dar Al Takaful', websiteUrl: 'https://www.daraltakaful.com', categorySlug: 'sigorta', seedUrls: ['https://www.daraltakaful.com/offers'] },
  { name: 'NGI', websiteUrl: 'https://www.ngi.ae', categorySlug: 'sigorta', seedUrls: ['https://www.ngi.ae/offers'] },
  { name: 'Bayzat', websiteUrl: 'https://www.bayzat.com', categorySlug: 'sigorta', seedUrls: ['https://www.bayzat.com/offers', 'https://www.bayzat.com/deals'] },
  { name: 'Yallacompare', websiteUrl: 'https://www.yallacompare.com', categorySlug: 'sigorta', seedUrls: ['https://www.yallacompare.com/uae/en/offers'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Al Futtaim Motors', websiteUrl: 'https://www.alfuttaim.com', categorySlug: 'otomobil', seedUrls: ['https://www.alfuttaim.com/offers'] },
  { name: 'Al Tayer Motors', websiteUrl: 'https://www.altayermotors.com', categorySlug: 'otomobil', seedUrls: ['https://www.altayermotors.com/offers', 'https://www.altayermotors.com/deals'] },
  { name: 'Al Nabooda Automobiles', websiteUrl: 'https://www.alnaboodaautomobiles.com', categorySlug: 'otomobil', seedUrls: ['https://www.alnaboodaautomobiles.com/offers'] },
  { name: 'Trading Enterprises', websiteUrl: 'https://www.tradingenterprises.ae', categorySlug: 'otomobil', seedUrls: ['https://www.tradingenterprises.ae/offers'] },
  { name: 'Al Habtoor Motors', websiteUrl: 'https://www.alhabtoormotors.com', categorySlug: 'otomobil', seedUrls: ['https://www.alhabtoormotors.com/offers'] },
  { name: 'Gargash Enterprises', websiteUrl: 'https://www.gargash.com', categorySlug: 'otomobil', seedUrls: ['https://www.gargash.com/offers'] },
  { name: 'Al Masaood Automobiles', websiteUrl: 'https://www.almasaoodautomobiles.com', categorySlug: 'otomobil', seedUrls: ['https://www.almasaoodautomobiles.com/offers'] },
  { name: 'Toyota', websiteUrl: 'https://www.toyota.ae', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.ae/en/offers/', 'https://www.toyota.ae/en/deals/'] },
  { name: 'Nissan', websiteUrl: 'https://www.nissan.ae', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.ae/offers.html', 'https://www.nissan.ae/deals.html'] },
  { name: 'Honda', websiteUrl: 'https://www.honda.ae', categorySlug: 'otomobil', seedUrls: ['https://www.honda.ae/offers', 'https://www.honda.ae/deals'] },
  { name: 'Hyundai', websiteUrl: 'https://www.hyundai.com/ae', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/ae/en/offers', 'https://www.hyundai.com/ae/en/deals'] },
  { name: 'Kia', websiteUrl: 'https://www.kia.com/ae', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/ae/offers.html', 'https://www.kia.com/ae/deals.html'] },
  { name: 'BMW', websiteUrl: 'https://www.bmw-abudhabi.com', categorySlug: 'otomobil', seedUrls: ['https://www.bmw-abudhabi.com/en/offers.html'] },
  { name: 'Mercedes-Benz', websiteUrl: 'https://www.mercedes-benz.ae', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.ae/en/passengercars/campaigns.html'] },
  { name: 'Audi', websiteUrl: 'https://www.audi.ae', categorySlug: 'otomobil', seedUrls: ['https://www.audi.ae/ae/web/en/offers.html'] },
  { name: 'Volkswagen', websiteUrl: 'https://www.volkswagen-me.com', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen-me.com/en/offers.html'] },
  { name: 'Porsche', websiteUrl: 'https://www.porsche.com/middle-east', categorySlug: 'otomobil', seedUrls: ['https://www.porsche.com/middle-east/offers/'] },
  { name: 'Land Rover', websiteUrl: 'https://www.landrover.ae', categorySlug: 'otomobil', seedUrls: ['https://www.landrover.ae/offers.html'] },
  { name: 'Lexus', websiteUrl: 'https://www.lexus.ae', categorySlug: 'otomobil', seedUrls: ['https://www.lexus.ae/en/offers/', 'https://www.lexus.ae/en/deals/'] },
  { name: 'Mazda', websiteUrl: 'https://www.mazda.ae', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.ae/offers/'] },
  { name: 'Mitsubishi', websiteUrl: 'https://www.mitsubishi-motors.ae', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.ae/offers'] },
  { name: 'Suzuki', websiteUrl: 'https://www.suzuki.ae', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.ae/offers/'] },
  { name: 'MG', websiteUrl: 'https://www.mgmotor.ae', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.ae/offers'] },
  { name: 'Chery', websiteUrl: 'https://www.cheryarabia.com', categorySlug: 'otomobil', seedUrls: ['https://www.cheryarabia.com/offers'] },
  { name: 'GAC', websiteUrl: 'https://www.gaborone.ae', categorySlug: 'otomobil', seedUrls: ['https://www.gaborone.ae/offers'] },
  { name: 'Geely', websiteUrl: 'https://www.geely.ae', categorySlug: 'otomobil', seedUrls: ['https://www.geely.ae/offers'] },
  { name: 'Tesla', websiteUrl: 'https://www.tesla.com/ae', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/ae'] },
  { name: 'Ford', websiteUrl: 'https://www.ford.ae', categorySlug: 'otomobil', seedUrls: ['https://www.ford.ae/offers', 'https://www.ford.ae/deals'] },
  { name: 'Chevrolet', websiteUrl: 'https://www.chevrolet.ae', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.ae/offers'] },
  { name: 'GMC', websiteUrl: 'https://www.gmc.ae', categorySlug: 'otomobil', seedUrls: ['https://www.gmc.ae/offers'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Kinokuniya', websiteUrl: 'https://www.kinokuniya.com/ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kinokuniya.com/ae/offers', 'https://www.kinokuniya.com/ae/deals'] },
  { name: "Magrudy's", websiteUrl: 'https://www.magrudy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.magrudy.com/offers', 'https://www.magrudy.com/sale'] },
  { name: 'Borders', websiteUrl: 'https://www.borders.ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.borders.ae/offers'] },
  { name: 'Book Depository', websiteUrl: 'https://www.bookdepository.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookdepository.com/deals'] },
  { name: 'Amazon Books', websiteUrl: 'https://www.amazon.ae/books', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.ae/gp/goldbox?ref=books', 'https://www.amazon.ae/books-deals/'] },
  { name: 'Jarir Bookstore', websiteUrl: 'https://www.jarir.com/ae-en', categorySlug: 'kitap-hobi', seedUrls: ['https://www.jarir.com/ae-en/offers', 'https://www.jarir.com/ae-en/deals'] },
  { name: 'Toys R Us', websiteUrl: 'https://www.toysrusmena.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrusmena.com/ae/en/sale', 'https://www.toysrusmena.com/ae/en/offers'] },
  { name: 'Hamleys', websiteUrl: 'https://www.hamleys.ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hamleys.ae/sale', 'https://www.hamleys.ae/offers'] },
  { name: 'Lego Store', websiteUrl: 'https://www.lego.com/en-ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-ae/categories/sales-and-deals'] },
  { name: 'Build-A-Bear', websiteUrl: 'https://www.buildabear.ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.buildabear.ae/offers'] },
  { name: 'Daiso', websiteUrl: 'https://www.daisojapan.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.daisojapan.com/'] },
  { name: 'Miniso', websiteUrl: 'https://www.miniso.ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.miniso.ae/offers', 'https://www.miniso.ae/sale'] },
  { name: 'Flying Tiger', websiteUrl: 'https://www.flyingtiger.com/ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.flyingtiger.com/ae/offers'] },
  { name: 'Japan Home', websiteUrl: 'https://www.japanhome.ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.japanhome.ae/offers'] },
  { name: 'Mumuso', websiteUrl: 'https://www.mumuso.ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mumuso.ae/offers'] },
  { name: 'Dubai Garden Centre', websiteUrl: 'https://www.dubaigardencentre.ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dubaigardencentre.ae/offers', 'https://www.dubaigardencentre.ae/sale'] },
  { name: 'PlayStation', websiteUrl: 'https://store.playstation.com/en-ae', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/en-ae/category/deals'] },
  { name: 'Xbox', websiteUrl: 'https://www.xbox.com/en-AE', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/en-AE/games/sales-and-specials'] },
  { name: 'Nintendo', websiteUrl: 'https://www.nintendo.com/en-ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/en-ae/store/deals/'] },
  { name: 'Steam', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Netflix', websiteUrl: 'https://www.netflix.com/ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/ae/'] },
  { name: 'Disney+', websiteUrl: 'https://www.disneyplus.com/ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/ae/'] },
  { name: 'Spotify', websiteUrl: 'https://www.spotify.com/ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/ae/premium/'] },
  { name: 'Apple Music', websiteUrl: 'https://music.apple.com/ae', categorySlug: 'kitap-hobi', seedUrls: ['https://music.apple.com/ae/'] },
  { name: 'OSN+', websiteUrl: 'https://www.osnplus.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.osnplus.com/offers'] },
  { name: 'Shahid', websiteUrl: 'https://www.shahid.mbc.net', categorySlug: 'kitap-hobi', seedUrls: ['https://www.shahid.mbc.net/en/offers'] },
  { name: 'Anghami', websiteUrl: 'https://www.anghami.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.anghami.com/plus'] },
  { name: 'Eventbrite', websiteUrl: 'https://www.eventbrite.ae', categorySlug: 'kitap-hobi', seedUrls: ['https://www.eventbrite.ae/d/uae/deals/'] },
  { name: 'Platinumlist', websiteUrl: 'https://www.platinumlist.net', categorySlug: 'kitap-hobi', seedUrls: ['https://www.platinumlist.net/offers', 'https://www.platinumlist.net/deals'] },
  { name: 'Dubai Parks', websiteUrl: 'https://www.dubaiparksandresorts.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dubaiparksandresorts.com/en/offers', 'https://www.dubaiparksandresorts.com/en/deals'] },
];

function deduplicateBrands(brands: BrandEntry[]): BrandEntry[] {
  const seen = new Map<string, BrandEntry>();
  for (const b of brands) {
    const slug = toSlug(b.name);
    if (!seen.has(slug)) seen.set(slug, b);
  }
  return Array.from(seen.values());
}

async function main() {
  console.log('=== AE Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'AE' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'AE', categoryId: category.id },
      });

      brandsOk++;

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
            agingDays: 7,
            market: 'AE',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'AE' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'AE', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active AE sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
