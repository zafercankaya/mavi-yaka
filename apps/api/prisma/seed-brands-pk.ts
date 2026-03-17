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
  isActive?: boolean;
}

const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping (alisveris) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Daraz', websiteUrl: 'https://www.daraz.pk', categorySlug: 'alisveris', seedUrls: ['https://www.daraz.pk/wow/gcp/route/daraz/pk/upr_header/channelHeaderOther498?spm=a2a0e.home.header.1', 'https://www.daraz.pk/campaign/'] },
  { name: 'Amazon PK', websiteUrl: 'https://www.amazon.com', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.com/deals', 'https://www.amazon.com/gp/goldbox'], isActive: false },
  { name: 'AliExpress PK', websiteUrl: 'https://www.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://www.aliexpress.com/wholesale', 'https://sale.aliexpress.com/'] },
  { name: 'Goto', websiteUrl: 'https://www.goto.com.pk', categorySlug: 'alisveris', seedUrls: ['https://www.goto.com.pk/sale', 'https://www.goto.com.pk/deals'] },
  { name: 'Yayvo', websiteUrl: 'https://www.yayvo.com', categorySlug: 'alisveris', seedUrls: ['https://www.yayvo.com/deals', 'https://www.yayvo.com/sale'] },
  { name: 'PriceOye', websiteUrl: 'https://priceoye.pk', categorySlug: 'alisveris', seedUrls: ['https://priceoye.pk/deals', 'https://priceoye.pk/offers'] },
  { name: 'iShopping', websiteUrl: 'https://www.ishopping.pk', categorySlug: 'alisveris', seedUrls: ['https://www.ishopping.pk/sale', 'https://www.ishopping.pk/deals'] },
  { name: 'Telemart', websiteUrl: 'https://www.telemart.pk', categorySlug: 'alisveris', seedUrls: ['https://www.telemart.pk/deals', 'https://www.telemart.pk/sale'] },
  { name: 'Mega.pk', websiteUrl: 'https://www.mega.pk', categorySlug: 'alisveris', seedUrls: ['https://www.mega.pk/deals/', 'https://www.mega.pk/sale/'] },
  { name: 'Shophive', websiteUrl: 'https://www.shophive.com', categorySlug: 'alisveris', seedUrls: ['https://www.shophive.com/deals', 'https://www.shophive.com/sale'] },
  { name: 'Homeshopping', websiteUrl: 'https://homeshopping.pk', categorySlug: 'alisveris', seedUrls: ['https://homeshopping.pk/deals/', 'https://homeshopping.pk/sale/'] },
  { name: 'Chase Value', websiteUrl: 'https://chasevalue.pk', categorySlug: 'alisveris', seedUrls: ['https://chasevalue.pk/collections/sale', 'https://chasevalue.pk/pages/deals'] },
  { name: 'Metro Online', websiteUrl: 'https://www.metro-online.pk', categorySlug: 'alisveris', seedUrls: ['https://www.metro-online.pk/promotions', 'https://www.metro-online.pk/offers'] },
  { name: 'Carrefour PK', websiteUrl: 'https://www.carrefour.pk', categorySlug: 'alisveris', seedUrls: ['https://www.carrefour.pk/offers', 'https://www.carrefour.pk/promotions'] },
  { name: 'Hyperstar', websiteUrl: 'https://www.hyperstar.com.pk', categorySlug: 'alisveris', seedUrls: ['https://www.hyperstar.com.pk/offers'] },
  { name: 'Alfatah', websiteUrl: 'https://alfatah.com.pk', categorySlug: 'alisveris', seedUrls: ['https://alfatah.com.pk/promotions', 'https://alfatah.com.pk/offers'] },
  { name: 'Imtiaz Super Market', websiteUrl: 'https://www.imtiaz.com.pk', categorySlug: 'alisveris', seedUrls: ['https://www.imtiaz.com.pk/offers', 'https://www.imtiaz.com.pk/promotions'] },
  { name: 'Naheed', websiteUrl: 'https://www.naheed.pk', categorySlug: 'alisveris', seedUrls: ['https://www.naheed.pk/promotions', 'https://www.naheed.pk/sale'] },
  { name: 'OLX Pakistan', websiteUrl: 'https://www.olx.com.pk', categorySlug: 'alisveris', seedUrls: ['https://www.olx.com.pk/'] },
  { name: 'Savyour', websiteUrl: 'https://www.savyour.com', categorySlug: 'alisveris', seedUrls: ['https://www.savyour.com/deals', 'https://www.savyour.com/offers'] },
  { name: 'CashKaro PK', websiteUrl: 'https://www.cashkaro.pk', categorySlug: 'alisveris', seedUrls: ['https://www.cashkaro.pk/deals', 'https://www.cashkaro.pk/offers'] },
  { name: 'Bata PK', websiteUrl: 'https://www.bfrancq.com.pk', categorySlug: 'alisveris', seedUrls: ['https://www.bata.com.pk/collections/sale'] },
  { name: 'Miniso PK', websiteUrl: 'https://miniso.com.pk', categorySlug: 'alisveris', seedUrls: ['https://miniso.com.pk/collections/sale'] },
  { name: 'Dolmen Mall', websiteUrl: 'https://www.dolmenmall.com.pk', categorySlug: 'alisveris', seedUrls: ['https://www.dolmenmall.com.pk/offers', 'https://www.dolmenmall.com.pk/promotions'] },
  { name: 'Lucky One Mall', websiteUrl: 'https://www.luckyonemall.com', categorySlug: 'alisveris', seedUrls: ['https://www.luckyonemall.com/offers'] },
  { name: 'Packages Mall', websiteUrl: 'https://www.packagesmall.com.pk', categorySlug: 'alisveris', seedUrls: ['https://www.packagesmall.com.pk/offers'] },
  { name: 'Centurion', websiteUrl: 'https://centurion.pk', categorySlug: 'alisveris', seedUrls: ['https://centurion.pk/collections/sale'] },
  { name: 'Bagallery', websiteUrl: 'https://bagallery.com', categorySlug: 'alisveris', seedUrls: ['https://bagallery.com/collections/sale', 'https://bagallery.com/pages/deals'] },
  { name: 'Temu PK', websiteUrl: 'https://www.temu.com', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/deals', 'https://www.temu.com/sale'] },
  { name: 'Shopsy PK', websiteUrl: 'https://shopsy.pk', categorySlug: 'alisveris', seedUrls: ['https://shopsy.pk/deals', 'https://shopsy.pk/sale'] },
  { name: 'Laam', websiteUrl: 'https://www.laam.pk', categorySlug: 'alisveris', seedUrls: ['https://www.laam.pk/sale', 'https://www.laam.pk/deals'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung PK', websiteUrl: 'https://www.samsung.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/pk/offer/', 'https://www.samsung.com/pk/smartphones/all-smartphones/'] },
  { name: 'Apple PK', websiteUrl: 'https://www.apple.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/pk/shop/go/special_deals'] },
  { name: 'Jazz', websiteUrl: 'https://www.jazz.com.pk', categorySlug: 'elektronik', seedUrls: ['https://www.jazz.com.pk/offers/', 'https://www.jazz.com.pk/promotions/'] },
  { name: 'Telenor Pakistan', websiteUrl: 'https://www.telenor.com.pk', categorySlug: 'elektronik', seedUrls: ['https://www.telenor.com.pk/offers/', 'https://www.telenor.com.pk/promotions/'] },
  { name: 'Zong', websiteUrl: 'https://www.zong.com.pk', categorySlug: 'elektronik', seedUrls: ['https://www.zong.com.pk/offers', 'https://www.zong.com.pk/promotions'] },
  { name: 'Ufone', websiteUrl: 'https://www.ufone.com', categorySlug: 'elektronik', seedUrls: ['https://www.ufone.com/offers/', 'https://www.ufone.com/promotions/'] },
  { name: 'PTCL', websiteUrl: 'https://www.ptcl.com.pk', categorySlug: 'elektronik', seedUrls: ['https://www.ptcl.com.pk/offers', 'https://www.ptcl.com.pk/promotions'] },
  { name: 'StormFiber', websiteUrl: 'https://www.stormfiber.com', categorySlug: 'elektronik', seedUrls: ['https://www.stormfiber.com/promotions', 'https://www.stormfiber.com/offers'] },
  { name: 'Nayatel', websiteUrl: 'https://nayatel.com', categorySlug: 'elektronik', seedUrls: ['https://nayatel.com/offers/', 'https://nayatel.com/promotions/'] },
  { name: 'Xiaomi PK', websiteUrl: 'https://www.mi.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/pk/sale', 'https://www.mi.com/pk/promotion'] },
  { name: 'Oppo PK', websiteUrl: 'https://www.oppo.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/pk/events/', 'https://www.oppo.com/pk/promotion/'] },
  { name: 'Vivo PK', websiteUrl: 'https://www.vivo.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com/pk/promotion', 'https://www.vivo.com/pk/activity'] },
  { name: 'Realme PK', websiteUrl: 'https://www.realme.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/pk/deals', 'https://www.realme.com/pk/sale'] },
  { name: 'Infinix PK', websiteUrl: 'https://www.infinixmobility.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.infinixmobility.com/pk/promotion'] },
  { name: 'Tecno PK', websiteUrl: 'https://www.tecno-mobile.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.tecno-mobile.com/pk/promotion/'] },
  { name: 'itel PK', websiteUrl: 'https://www.itel-mobile.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.itel-mobile.com/pk/promotion'] },
  { name: 'LG PK', websiteUrl: 'https://www.lg.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/pk/promotions'] },
  { name: 'Sony PK', websiteUrl: 'https://www.sony.com.pk', categorySlug: 'elektronik', seedUrls: ['https://www.sony.com.pk/promotions'] },
  { name: 'HP PK', websiteUrl: 'https://www.hp.com/pk-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/pk-en/shop/deals'] },
  { name: 'Dell PK', websiteUrl: 'https://www.dell.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/pk/deals'] },
  { name: 'Lenovo PK', websiteUrl: 'https://www.lenovo.com/pk/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/pk/en/d/deals/'] },
  { name: 'Haier PK', websiteUrl: 'https://www.haier.com/pk', categorySlug: 'elektronik', seedUrls: ['https://www.haier.com/pk/promotions/', 'https://www.haier.com/pk/offers/'] },
  { name: 'Dawlance', websiteUrl: 'https://www.dawlance.com', categorySlug: 'elektronik', seedUrls: ['https://www.dawlance.com/promotions', 'https://www.dawlance.com/offers'] },
  { name: 'Orient Electronics', websiteUrl: 'https://www.orient.com.pk', categorySlug: 'elektronik', seedUrls: ['https://www.orient.com.pk/offers/', 'https://www.orient.com.pk/promotions/'] },
  { name: 'PEL', websiteUrl: 'https://pel.com.pk', categorySlug: 'elektronik', seedUrls: ['https://pel.com.pk/promotions', 'https://pel.com.pk/offers'] },
  { name: 'Gree PK', websiteUrl: 'https://www.gree.pk', categorySlug: 'elektronik', seedUrls: ['https://www.gree.pk/promotions', 'https://www.gree.pk/offers'] },
  { name: 'Ecostar', websiteUrl: 'https://www.ecostar.com.pk', categorySlug: 'elektronik', seedUrls: ['https://www.ecostar.com.pk/promotions'] },
  { name: 'Waves', websiteUrl: 'https://waves.com.pk', categorySlug: 'elektronik', seedUrls: ['https://waves.com.pk/promotions', 'https://waves.com.pk/offers'] },
  { name: 'Kenwood PK', websiteUrl: 'https://www.kenwood.com.pk', categorySlug: 'elektronik', seedUrls: ['https://www.kenwood.com.pk/promotions'] },
  { name: 'Changhong Ruba', websiteUrl: 'https://www.changhongruba.pk', categorySlug: 'elektronik', seedUrls: ['https://www.changhongruba.pk/promotions'] },
  { name: 'National PK', websiteUrl: 'https://national.com.pk', categorySlug: 'elektronik', seedUrls: ['https://national.com.pk/offers', 'https://national.com.pk/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Khaadi', websiteUrl: 'https://www.khaadi.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.khaadi.com/sale/', 'https://www.khaadi.com/collections/sale'] },
  { name: 'Gul Ahmed', websiteUrl: 'https://www.gulahmedshop.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.gulahmedshop.com/sale', 'https://www.gulahmedshop.com/ideas-sale'] },
  { name: 'Sapphire', websiteUrl: 'https://pk.sapphireonline.pk', categorySlug: 'giyim-moda', seedUrls: ['https://pk.sapphireonline.pk/collections/sale', 'https://pk.sapphireonline.pk/pages/sale'] },
  { name: 'Alkaram Studio', websiteUrl: 'https://www.alkaramstudio.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.alkaramstudio.com/sale', 'https://www.alkaramstudio.com/collections/sale'] },
  { name: 'Junaid Jamshed', websiteUrl: 'https://www.junaidjamshed.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.junaidjamshed.com/sale', 'https://www.junaidjamshed.com/collections/sale'] },
  { name: 'Bonanza Satrangi', websiteUrl: 'https://www.bonanzagt.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.bonanzagt.com/sale', 'https://www.bonanzagt.com/collections/sale'] },
  { name: 'Nishat Linen', websiteUrl: 'https://nfrancqhatlinen.com', categorySlug: 'giyim-moda', seedUrls: ['https://nishatlinen.com/collections/sale', 'https://nishatlinen.com/pages/sale'] },
  { name: 'Sana Safinaz', websiteUrl: 'https://www.sanasafinaz.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sanasafinaz.com/sale', 'https://www.sanasafinaz.com/collections/sale'] },
  { name: 'Maria B', websiteUrl: 'https://www.mariab.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.mariab.pk/sale', 'https://www.mariab.pk/collections/sale'] },
  { name: 'Elan', websiteUrl: 'https://efrancqlan.pk', categorySlug: 'giyim-moda', seedUrls: ['https://elan.pk/collections/sale'] },
  { name: 'Zara PK', websiteUrl: 'https://www.zara.com/pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/pk/en/z-sale-l1314.html'] },
  { name: 'Limelight', websiteUrl: 'https://www.limelight.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.limelight.pk/collections/sale', 'https://www.limelight.pk/pages/sale'] },
  { name: 'Ego', websiteUrl: 'https://www.ego.com.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.ego.com.pk/sale', 'https://www.ego.com.pk/collections/sale'] },
  { name: 'Ethnic by Outfitters', websiteUrl: 'https://www.ethnicbyoutfitters.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.ethnicbyoutfitters.com/sale'] },
  { name: 'Outfitters', websiteUrl: 'https://outfitters.com.pk', categorySlug: 'giyim-moda', seedUrls: ['https://outfitters.com.pk/collections/sale', 'https://outfitters.com.pk/pages/sale'] },
  { name: 'Breakout', websiteUrl: 'https://www.breakout.com.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.breakout.com.pk/collections/sale'] },
  { name: 'Ideas by Gul Ahmed', websiteUrl: 'https://www.gulahmedshop.com/ideas', categorySlug: 'giyim-moda', seedUrls: ['https://www.gulahmedshop.com/ideas-sale'] },
  { name: 'Generation', websiteUrl: 'https://generation.com.pk', categorySlug: 'giyim-moda', seedUrls: ['https://generation.com.pk/collections/sale'] },
  { name: 'Rang Ja', websiteUrl: 'https://www.rangja.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.rangja.pk/collections/sale'] },
  { name: 'Bareeze', websiteUrl: 'https://www.bareeze.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.bareeze.com/sale', 'https://www.bareeze.com/collections/sale'] },
  { name: 'Cross Stitch', websiteUrl: 'https://www.crossstitch.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.crossstitch.pk/collections/sale'] },
  { name: 'Agha Noor', websiteUrl: 'https://www.aghanoor.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.aghanoor.com/collections/sale'] },
  { name: 'Beechtree', websiteUrl: 'https://www.beechtree.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.beechtree.pk/collections/sale'] },
  { name: 'Zeen Woman', websiteUrl: 'https://www.zeenwoman.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.zeenwoman.com/sale', 'https://www.zeenwoman.com/collections/sale'] },
  { name: 'Diners', websiteUrl: 'https://www.difrancqners.com.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.diners.com.pk/collections/sale'] },
  { name: 'Cougar', websiteUrl: 'https://www.cougar.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.cougar.pk/sale', 'https://www.cougar.pk/collections/sale'] },
  { name: 'Leisure Club', websiteUrl: 'https://www.leisureclub.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.leisureclub.pk/collections/sale'] },
  { name: 'Jade', websiteUrl: 'https://www.jade-store.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.jade-store.com/sale'] },
  { name: 'Unze London PK', websiteUrl: 'https://www.unze.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.unze.pk/sale', 'https://www.unze.pk/collections/sale'] },
  { name: 'Ndure', websiteUrl: 'https://ndure.com', categorySlug: 'giyim-moda', seedUrls: ['https://ndure.com/collections/sale', 'https://ndure.com/pages/sale'] },
  { name: 'ECS', websiteUrl: 'https://www.ecfrancqs.pk', categorySlug: 'giyim-moda', seedUrls: ['https://www.ecs.com.pk/sale', 'https://www.ecs.com.pk/collections/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Food & Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Foodpanda PK', websiteUrl: 'https://www.foodpanda.pk', categorySlug: 'gida-market', seedUrls: ['https://www.foodpanda.pk/vouchers', 'https://www.foodpanda.pk/deals'] },
  { name: 'Careem Food PK', websiteUrl: 'https://www.careem.com/en-pk', categorySlug: 'gida-market', seedUrls: ['https://www.careem.com/en-pk/food/', 'https://www.careem.com/en-pk/promo/'] },
  { name: 'Cheetay', websiteUrl: 'https://cheetay.pk', categorySlug: 'gida-market', seedUrls: ['https://cheetay.pk/deals', 'https://cheetay.pk/offers'] },
  { name: 'Airlift Grocery', websiteUrl: 'https://www.airliftexpress.com', categorySlug: 'gida-market', seedUrls: ['https://www.airliftexpress.com/offers'] },
  { name: 'GrocerApp', websiteUrl: 'https://www.grocerapp.pk', categorySlug: 'gida-market', seedUrls: ['https://www.grocerapp.pk/offers', 'https://www.grocerapp.pk/deals'] },
  { name: 'Meezan Foods', websiteUrl: 'https://www.meezan.pk', categorySlug: 'gida-market', seedUrls: ['https://www.meezan.pk/offers'] },
  { name: 'Engro Foods', websiteUrl: 'https://www.engrofoods.com', categorySlug: 'gida-market', seedUrls: ['https://www.engrofoods.com/promotions'] },
  { name: 'Nestle PK', websiteUrl: 'https://www.nestle.pk', categorySlug: 'gida-market', seedUrls: ['https://www.nestle.pk/promotions', 'https://www.nestle.pk/offers'] },
  { name: 'Shan Foods', websiteUrl: 'https://www.shanfoods.com', categorySlug: 'gida-market', seedUrls: ['https://www.shanfoods.com/promotions', 'https://www.shanfoods.com/offers'] },
  { name: 'National Foods', websiteUrl: 'https://www.nfrancqationalfoods.com', categorySlug: 'gida-market', seedUrls: ['https://www.nationalfoods.com/promotions'] },
  { name: 'KFC PK', websiteUrl: 'https://www.kfrancqfc.com.pk', categorySlug: 'gida-market', seedUrls: ['https://www.kfc.com.pk/deals', 'https://www.kfc.com.pk/promotions'] },
  { name: 'McDonald PK', websiteUrl: 'https://www.mcdonalds.com.pk', categorySlug: 'gida-market', seedUrls: ['https://www.mcdonalds.com.pk/deals', 'https://www.mcdonalds.com.pk/promotions'] },
  { name: 'Pizza Hut PK', websiteUrl: 'https://www.pizzahut.com.pk', categorySlug: 'gida-market', seedUrls: ['https://www.pizzahut.com.pk/deals', 'https://www.pizzahut.com.pk/promotions'] },
  { name: 'Dominos PK', websiteUrl: 'https://www.dominos.com.pk', categorySlug: 'gida-market', seedUrls: ['https://www.dominos.com.pk/deals', 'https://www.dominos.com.pk/promotions'] },
  { name: 'Burger King PK', websiteUrl: 'https://www.burgerking.pk', categorySlug: 'gida-market', seedUrls: ['https://www.burgerking.pk/deals', 'https://www.burgerking.pk/offers'] },
  { name: 'Hardees PK', websiteUrl: 'https://www.hardees.pk', categorySlug: 'gida-market', seedUrls: ['https://www.hardees.pk/deals', 'https://www.hardees.pk/offers'] },
  { name: 'OPTP', websiteUrl: 'https://www.optp.pk', categorySlug: 'gida-market', seedUrls: ['https://www.optp.pk/deals', 'https://www.optp.pk/offers'] },
  { name: 'Howdy', websiteUrl: 'https://www.howdy.pk', categorySlug: 'gida-market', seedUrls: ['https://www.howdy.pk/deals'] },
  { name: 'Subway PK', websiteUrl: 'https://www.subwaypakistan.com', categorySlug: 'gida-market', seedUrls: ['https://www.subwaypakistan.com/deals', 'https://www.subwaypakistan.com/offers'] },
  { name: 'Kolachi', websiteUrl: 'https://www.kolachi.com.pk', categorySlug: 'gida-market', seedUrls: ['https://www.kolachi.com.pk/deals'] },
  { name: 'Gourmet PK', websiteUrl: 'https://www.gourmetpakistan.com', categorySlug: 'gida-market', seedUrls: ['https://www.gourmetpakistan.com/offers', 'https://www.gourmetpakistan.com/promotions'] },
  { name: 'Tapal', websiteUrl: 'https://www.tapal.com.pk', categorySlug: 'gida-market', seedUrls: ['https://www.tapal.com.pk/offers'] },
  { name: 'Olpers', websiteUrl: 'https://www.olpers.com.pk', categorySlug: 'gida-market', seedUrls: ['https://www.olpers.com.pk/promotions'] },
  { name: 'Al-Fatah Grocery', websiteUrl: 'https://alfatah.com.pk', categorySlug: 'gida-market', seedUrls: ['https://alfatah.com.pk/grocery-offers'] },
  { name: 'Jalal Sons', websiteUrl: 'https://www.jalalsons.com', categorySlug: 'gida-market', seedUrls: ['https://www.jalalsons.com/offers'] },
  { name: 'Green Valley', websiteUrl: 'https://www.greenvalley.pk', categorySlug: 'gida-market', seedUrls: ['https://www.greenvalley.pk/offers'] },
  { name: 'Bakers PK', websiteUrl: 'https://www.bfrancqakers.pk', categorySlug: 'gida-market', seedUrls: ['https://bakers.pk/offers'] },
  { name: 'Unilever PK', websiteUrl: 'https://www.unilever.pk', categorySlug: 'gida-market', seedUrls: ['https://www.unilever.pk/brands/offers/'] },
  { name: 'Pepsi PK', websiteUrl: 'https://www.pepsi.com.pk', categorySlug: 'gida-market', seedUrls: ['https://www.pepsi.com.pk/promotions'] },
  { name: 'Coca-Cola PK', websiteUrl: 'https://www.coca-cola.com/pk', categorySlug: 'gida-market', seedUrls: ['https://www.coca-cola.com/pk/en/offers'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Dining (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nandos PK', websiteUrl: 'https://www.nandos.com.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.com.pk/deals', 'https://www.nandos.com.pk/offers'] },
  { name: 'Starbucks PK', websiteUrl: 'https://www.starbucks.com.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.pk/offers', 'https://www.starbucks.com.pk/promotions'] },
  { name: 'Gloria Jeans PK', websiteUrl: 'https://www.gloriajeanscoffees.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.gloriajeanscoffees.pk/promotions'] },
  { name: 'Dunkin PK', websiteUrl: 'https://www.dunkindonuts.com.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.com.pk/deals', 'https://www.dunkindonuts.com.pk/offers'] },
  { name: 'Baskin Robbins PK', websiteUrl: 'https://www.baskinrobbins.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbins.pk/offers'] },
  { name: 'Cheezious', websiteUrl: 'https://www.cheezious.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.cheezious.pk/deals'] },
  { name: 'Tehzeeb Bakers', websiteUrl: 'https://www.tehzeebbakers.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.tehzeebbakers.com/offers'] },
  { name: 'Bundu Khan', websiteUrl: 'https://www.bundukhan.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.bundukhan.com/deals'] },
  { name: 'Kababjees', websiteUrl: 'https://www.kababjees.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kababjees.com/offers', 'https://www.kababjees.com/deals'] },
  { name: 'Monal', websiteUrl: 'https://www.themonal.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.themonal.com/offers'] },
  { name: 'Salt n Pepper', websiteUrl: 'https://www.saltnpepper.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.saltnpepper.pk/offers'] },
  { name: 'Bar.B.Q Tonight', websiteUrl: 'https://www.barbqtonight.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.barbqtonight.com/offers'] },
  { name: 'Roasters', websiteUrl: 'https://www.roasters.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.roasters.pk/deals', 'https://www.roasters.pk/offers'] },
  { name: 'Ginyaki', websiteUrl: 'https://www.ginyaki.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.ginyaki.com/offers'] },
  { name: 'Kaybees', websiteUrl: 'https://www.kaybees.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.kaybees.pk/deals'] },
  { name: 'Texas Chicken PK', websiteUrl: 'https://www.texaschicken.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.texaschicken.pk/deals'] },
  { name: 'Layers Bakeshop', websiteUrl: 'https://www.layers.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.layers.pk/offers', 'https://www.layers.pk/deals'] },
  { name: 'California Pizza PK', websiteUrl: 'https://www.californiapizza.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.californiapizza.pk/deals'] },
  { name: 'Broadway Pizza PK', websiteUrl: 'https://broadwaypizza.com.pk', categorySlug: 'yeme-icme', seedUrls: ['https://broadwaypizza.com.pk/deals', 'https://broadwaypizza.com.pk/offers'] },
  { name: 'Crust Pizza PK', websiteUrl: 'https://www.crustpizza.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.crustpizza.pk/deals'] },
  { name: 'Sardarji', websiteUrl: 'https://www.sardarji.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.sardarji.pk/deals'] },
  { name: 'Tooso', websiteUrl: 'https://www.tooso.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.tooso.pk/deals'] },
  { name: 'Chaaye Khana', websiteUrl: 'https://www.chaayekhana.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.chaayekhana.pk/offers'] },
  { name: 'English Tea House', websiteUrl: 'https://www.englishteahouse.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.englishteahouse.pk/offers'] },
  { name: 'Burning Brownie', websiteUrl: 'https://www.burningbrownie.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.burningbrownie.pk/offers'] },
  { name: 'Smash Burger PK', websiteUrl: 'https://www.smashburger.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.smashburger.pk/deals'] },
  { name: 'Bamboo Union', websiteUrl: 'https://www.bamboounion.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.bamboounion.com/offers'] },
  { name: 'Voila', websiteUrl: 'https://www.voila.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.voila.pk/offers'] },
  { name: 'Eat Fit PK', websiteUrl: 'https://www.eatfit.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.eatfit.pk/deals'] },
  { name: 'DelFrio', websiteUrl: 'https://www.delfrio.pk', categorySlug: 'yeme-icme', seedUrls: ['https://www.delfrio.pk/offers'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'J. Beauty', websiteUrl: 'https://www.junaidjamshed.com/beauty', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.junaidjamshed.com/beauty/sale'] },
  { name: 'Medora', websiteUrl: 'https://medfrancqora.com.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://medora.com.pk/collections/sale'] },
  { name: 'WB by Hemani', websiteUrl: 'https://www.wfrancqbhemani.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.wbhemani.com/sale', 'https://www.wbhemani.com/deals'] },
  { name: 'Saeed Ghani', websiteUrl: 'https://www.saeedghani.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.saeedghani.pk/sale', 'https://www.saeedghani.pk/collections/sale'] },
  { name: 'Conatural', websiteUrl: 'https://conatural.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://conatural.com/collections/sale'] },
  { name: 'Hemani', websiteUrl: 'https://www.hemani.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.hemani.pk/sale'] },
  { name: 'Rivaj UK PK', websiteUrl: 'https://rivfrancqaj.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://rivaj.pk/collections/sale'] },
  { name: 'Golden Pearl', websiteUrl: 'https://www.goldenpearl.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.goldenpearl.pk/offers'] },
  { name: 'LOreal PK', websiteUrl: 'https://www.loreal-paris.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.pk/offers', 'https://www.loreal-paris.pk/promotions'] },
  { name: 'Maybelline PK', websiteUrl: 'https://www.maybelline.com.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.pk/offers'] },
  { name: 'Garnier PK', websiteUrl: 'https://www.garnier.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.pk/offers', 'https://www.garnier.pk/promotions'] },
  { name: 'The Body Shop PK', websiteUrl: 'https://www.thebodyshop.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.pk/sale', 'https://www.thebodyshop.pk/offers'] },
  { name: 'Bath and Body Works PK', websiteUrl: 'https://www.bathandbodyworks.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bathandbodyworks.pk/sale'] },
  { name: 'Victoria Secret PK', websiteUrl: 'https://www.victoriassecret.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.victoriassecret.pk/sale'] },
  { name: 'MAC PK', websiteUrl: 'https://www.maccosmetics.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.pk/offers'] },
  { name: 'Kiehl PK', websiteUrl: 'https://www.kiehls.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.pk/offers'] },
  { name: 'Masarrat Misbah', websiteUrl: 'https://www.masarratmisbah.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.masarratmisbah.com/collections/sale'] },
  { name: 'Zero Makeup', websiteUrl: 'https://www.zeromakeup.com.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.zeromakeup.com.pk/sale'] },
  { name: 'Fragrance Studio PK', websiteUrl: 'https://fragrancestudio.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://fragrancestudio.pk/collections/sale'] },
  { name: 'Scentsation', websiteUrl: 'https://www.scentsation.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.scentsation.pk/sale'] },
  { name: 'All Things Hair PK', websiteUrl: 'https://www.allthingshair.com/en-pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.allthingshair.com/en-pk/offers/'] },
  { name: 'Natures Store PK', websiteUrl: 'https://www.naturesstore.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.naturesstore.pk/collections/sale'] },
  { name: 'Skin Deva', websiteUrl: 'https://skindeva.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://skindeva.pk/collections/sale'] },
  { name: 'Amaira PK', websiteUrl: 'https://amaira.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://amaira.pk/collections/sale'] },
  { name: 'Nabila Salon', websiteUrl: 'https://www.nabila.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nabila.pk/offers'] },
  { name: 'WYLD', websiteUrl: 'https://wyld.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://wyld.pk/collections/sale'] },
  { name: 'Daraz Beauty', websiteUrl: 'https://www.daraz.pk/health-beauty', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.daraz.pk/health-beauty/?sale=1'] },
  { name: 'SkinCeuticals PK', websiteUrl: 'https://www.skinceuticals.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.skinceuticals.pk/offers'] },
  { name: 'Neutrogena PK', websiteUrl: 'https://www.neutrogena.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.neutrogena.pk/offers'] },
  { name: 'CeraVe PK', websiteUrl: 'https://www.cerave.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cerave.pk/offers'] },
  { name: 'SenStore', websiteUrl: 'https://senstore.pk', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://senstore.pk/collections/sale'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Interwood', websiteUrl: 'https://www.interwood.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.interwood.pk/sale', 'https://www.interwood.pk/offers'] },
  { name: 'Habitt', websiteUrl: 'https://www.habitt.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.habitt.com/sale', 'https://www.habitt.com/deals'] },
  { name: 'Molty Foam', websiteUrl: 'https://www.moltyfoam.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.moltyfoam.pk/offers', 'https://www.moltyfoam.pk/sale'] },
  { name: 'Master Molty', websiteUrl: 'https://www.mastermoltyfoam.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.mastermoltyfoam.pk/sale'] },
  { name: 'Diamond Foam', websiteUrl: 'https://www.diamondfoam.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.diamondfoam.com/offers'] },
  { name: 'IKEA PK', websiteUrl: 'https://www.ikfrancqea.com.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com.pk/offers/', 'https://www.ikea.com.pk/campaigns/'] },
  { name: 'Home Factory Outlet', websiteUrl: 'https://www.homefactoryoutlet.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.homefactoryoutlet.pk/sale'] },
  { name: 'Al-Karam Home', websiteUrl: 'https://www.alkaramstudio.com/home', categorySlug: 'ev-yasam', seedUrls: ['https://www.alkaramstudio.com/home/sale'] },
  { name: 'Gul Ahmed Home', websiteUrl: 'https://www.gulahmedshop.com/home', categorySlug: 'ev-yasam', seedUrls: ['https://www.gulahmedshop.com/home/sale'] },
  { name: 'Artistic Milliners', websiteUrl: 'https://www.artisticmilliners.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.artisticmilliners.com/sale'] },
  { name: 'Berger Paints PK', websiteUrl: 'https://www.bergerpaints.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.bergerpaints.pk/promotions'] },
  { name: 'Nippon Paint PK', websiteUrl: 'https://www.nipponpaint.com.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.nipponpaint.com.pk/promotions'] },
  { name: 'ICI Dulux PK', websiteUrl: 'https://www.dulux.com.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.dulux.com.pk/offers'] },
  { name: 'Ace Hardware PK', websiteUrl: 'https://www.acehardware.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.acehardware.pk/sale', 'https://www.acehardware.pk/offers'] },
  { name: 'Master Tiles', websiteUrl: 'https://www.mastertiles.com.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.mastertiles.com.pk/offers'] },
  { name: 'National Ceramics PK', websiteUrl: 'https://www.nationalceramics.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.nationalceramics.pk/offers'] },
  { name: 'Khaas Home', websiteUrl: 'https://www.khaas.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.khaas.pk/sale'] },
  { name: 'Chenone', websiteUrl: 'https://www.chenone.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.chenone.com/sale', 'https://www.chenone.com/collections/sale'] },
  { name: 'Dynasty', websiteUrl: 'https://www.dynasty.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.dynasty.pk/sale'] },
  { name: 'Candles PK', websiteUrl: 'https://www.candles.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.candles.pk/sale'] },
  { name: 'Asghar Furniture', websiteUrl: 'https://www.asgharfurniture.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.asgharfurniture.pk/sale'] },
  { name: 'Zubaidas', websiteUrl: 'https://www.zubaidas.com.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.zubaidas.com.pk/sale'] },
  { name: 'HomeMart PK', websiteUrl: 'https://www.homemart.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.homemart.pk/sale'] },
  { name: 'Stylo Shoes Home', websiteUrl: 'https://www.styloshoes.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.styloshoes.com/sale'] },
  { name: 'Pakistan Cables', websiteUrl: 'https://www.pakistancables.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.pakistancables.com/offers'] },
  { name: 'Boss Appliances PK', websiteUrl: 'https://boss.com.pk', categorySlug: 'ev-yasam', seedUrls: ['https://boss.com.pk/promotions'] },
  { name: 'Sogo PK', websiteUrl: 'https://sogo.pk', categorySlug: 'ev-yasam', seedUrls: ['https://sogo.pk/sale'] },
  { name: 'Surmawala', websiteUrl: 'https://www.surmawala.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.surmawala.pk/sale'] },
  { name: 'Pakomatic', websiteUrl: 'https://www.pakomatic.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.pakomatic.pk/offers'] },
  { name: 'NasGas', websiteUrl: 'https://www.nasgas.pk', categorySlug: 'ev-yasam', seedUrls: ['https://www.nasgas.pk/offers'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nike PK', websiteUrl: 'https://www.nike.com/pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/pk/w/sale-3yaep', 'https://www.nike.com/pk/sale'] },
  { name: 'Adidas PK', websiteUrl: 'https://www.adidas.com.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.com.pk/sale', 'https://www.adidas.com.pk/outlet'] },
  { name: 'Puma PK', websiteUrl: 'https://pk.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://pk.puma.com/collections/sale'] },
  { name: 'Reebok PK', websiteUrl: 'https://www.reebok.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.pk/sale'] },
  { name: 'Skechers PK', websiteUrl: 'https://www.skechers.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.pk/sale'] },
  { name: 'New Balance PK', websiteUrl: 'https://www.newbalance.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.pk/sale'] },
  { name: 'Under Armour PK', websiteUrl: 'https://www.underarmour.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.pk/sale'] },
  { name: 'Converse PK', websiteUrl: 'https://www.converse.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.pk/sale'] },
  { name: 'Hush Puppies PK', websiteUrl: 'https://www.hfrancqushpuppies.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hushpuppies.pk/sale'] },
  { name: 'Servis Shoes', websiteUrl: 'https://www.serfrancqvisshoes.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.servisshoes.com/sale', 'https://www.servisshoes.com/offers'] },
  { name: 'Stylo', websiteUrl: 'https://www.styloshoes.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.styloshoes.com/sale'] },
  { name: 'Borjan', websiteUrl: 'https://www.borjan.com.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.borjan.com.pk/sale', 'https://www.borjan.com.pk/collections/sale'] },
  { name: 'Urban Sole', websiteUrl: 'https://www.urbansole.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.urbansole.pk/sale'] },
  { name: 'Decathlon PK', websiteUrl: 'https://www.decathlon.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.pk/deals', 'https://www.decathlon.pk/sale'] },
  { name: 'GS Sports PK', websiteUrl: 'https://gssports.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://gssports.pk/sale'] },
  { name: 'Crocs PK', websiteUrl: 'https://www.crocs.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.crocs.pk/sale'] },
  { name: 'Fila PK', websiteUrl: 'https://www.fila.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.pk/sale'] },
  { name: 'Woodland PK', websiteUrl: 'https://www.woodlandpk.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.woodlandpk.com/sale'] },
  { name: 'Peak Sports PK', websiteUrl: 'https://peaksports.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://peaksports.pk/sale'] },
  { name: 'PCB Store', websiteUrl: 'https://store.pcb.com.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://store.pcb.com.pk/sale'] },
  { name: 'Gray Nicolls PK', websiteUrl: 'https://www.graynicolls.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.graynicolls.pk/sale'] },
  { name: 'HS Sports', websiteUrl: 'https://hssports.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://hssports.pk/sale'] },
  { name: 'MB Malik', websiteUrl: 'https://mbmalik.com', categorySlug: 'spor-outdoor', seedUrls: ['https://mbmalik.com/sale'] },
  { name: 'CA Sports', websiteUrl: 'https://www.casports.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.casports.pk/sale'] },
  { name: 'Gym Culture PK', websiteUrl: 'https://gymculture.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://gymculture.pk/sale'] },
  { name: 'Levi PK', websiteUrl: 'https://www.levis.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.levis.pk/sale'] },
  { name: 'North Face PK', websiteUrl: 'https://www.thenorthface.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.pk/sale'] },
  { name: 'Timberland PK', websiteUrl: 'https://www.timberland.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.pk/sale'] },
  { name: 'Columbia PK', websiteUrl: 'https://www.columbia.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.pk/sale'] },
  { name: 'Asics PK', websiteUrl: 'https://www.asics.pk', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.pk/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'PIA', websiteUrl: 'https://www.piac.com.pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.piac.com.pk/offers', 'https://www.piac.com.pk/promotions'] },
  { name: 'Airblue', websiteUrl: 'https://www.airblue.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airblue.com/deals', 'https://www.airblue.com/offers'] },
  { name: 'AirSial', websiteUrl: 'https://www.airsial.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airsial.com/deals', 'https://www.airsial.com/offers'] },
  { name: 'Serene Air', websiteUrl: 'https://www.sereneair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sereneair.com/deals', 'https://www.sereneair.com/offers'] },
  { name: 'FlyJinnah', websiteUrl: 'https://www.flyjinnah.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flyjinnah.com/deals', 'https://www.flyjinnah.com/offers'] },
  { name: 'Emirates PK', websiteUrl: 'https://www.emirates.com/pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.emirates.com/pk/english/special-offers/'] },
  { name: 'Qatar Airways PK', websiteUrl: 'https://www.qatarairways.com/en-pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.qatarairways.com/en-pk/offers.html'] },
  { name: 'Turkish Airlines PK', websiteUrl: 'https://www.turkishairlines.com/en-pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.turkishairlines.com/en-pk/promotions/'] },
  { name: 'Etihad PK', websiteUrl: 'https://www.etihad.com/en-pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.etihad.com/en-pk/deals'] },
  { name: 'Saudi Airlines PK', websiteUrl: 'https://www.saudia.com/pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.saudia.com/pk/offers'] },
  { name: 'Booking.com PK', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.html', 'https://www.booking.com/dealspage.html'] },
  { name: 'Trivago PK', websiteUrl: 'https://www.trivago.pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.pk/'] },
  { name: 'Agoda PK', websiteUrl: 'https://www.agoda.com/en-pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/deals', 'https://www.agoda.com/en-pk/promos'] },
  { name: 'Expedia PK', websiteUrl: 'https://www.expedia.com.pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.pk/deals'] },
  { name: 'Pearl Continental', websiteUrl: 'https://www.pchotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pchotels.com/offers', 'https://www.pchotels.com/promotions'] },
  { name: 'Serena Hotels PK', websiteUrl: 'https://www.serenahotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.serenahotels.com/offers'] },
  { name: 'Marriott PK', websiteUrl: 'https://www.marriott.com/en-us/hotels/pakistan', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com/offers/pakistan'] },
  { name: 'Avari Hotels', websiteUrl: 'https://www.avari.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avari.com/offers', 'https://www.avari.com/promotions'] },
  { name: 'Careem PK', websiteUrl: 'https://www.careem.com/en-pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.careem.com/en-pk/promo/', 'https://www.careem.com/en-pk/offers/'] },
  { name: 'Uber PK', websiteUrl: 'https://www.uber.com/pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/pk/en/ride/offers/'] },
  { name: 'inDrive PK', websiteUrl: 'https://indrive.com/en/city/pakistan', categorySlug: 'seyahat-ulasim', seedUrls: ['https://indrive.com/en/city/pakistan/offers'] },
  { name: 'Daewoo Express', websiteUrl: 'https://www.daewoo.com.pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.daewoo.com.pk/offers'] },
  { name: 'Faisal Movers', websiteUrl: 'https://faisalmovers.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://faisalmovers.com/offers'] },
  { name: 'Bookme PK', websiteUrl: 'https://www.bookme.pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bookme.pk/deals', 'https://www.bookme.pk/offers'] },
  { name: 'Sastaticket', websiteUrl: 'https://www.sastaticket.pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.sastaticket.pk/deals', 'https://www.sastaticket.pk/offers'] },
  { name: 'Jovago PK', websiteUrl: 'https://www.jovago.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jovago.com/deals'] },
  { name: 'Travelstart PK', websiteUrl: 'https://www.travelstart.pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travelstart.pk/deals'] },
  { name: 'Airblue Holidays', websiteUrl: 'https://www.airblueholidays.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airblueholidays.com/deals'] },
  { name: 'PTDC', websiteUrl: 'https://www.tourism.gov.pk', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tourism.gov.pk/offers'] },
  { name: 'Gerry International', websiteUrl: 'https://www.gerrysinternational.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.gerrysinternational.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'HBL', websiteUrl: 'https://www.hbl.com', categorySlug: 'finans', seedUrls: ['https://www.hbl.com/personal/promotions', 'https://www.hbl.com/cards/offers'] },
  { name: 'UBL', websiteUrl: 'https://www.ubfrancql.com.pk', categorySlug: 'finans', seedUrls: ['https://www.ubl.com.pk/offers', 'https://www.ubl.com.pk/promotions'] },
  { name: 'MCB Bank', websiteUrl: 'https://www.mcb.com.pk', categorySlug: 'finans', seedUrls: ['https://www.mcb.com.pk/promotions', 'https://www.mcb.com.pk/personal/offers'] },
  { name: 'Allied Bank', websiteUrl: 'https://www.abl.com', categorySlug: 'finans', seedUrls: ['https://www.abl.com/promotions', 'https://www.abl.com/offers'] },
  { name: 'Bank Alfalah', websiteUrl: 'https://www.bankalfalah.com', categorySlug: 'finans', seedUrls: ['https://www.bankalfalah.com/promotions/', 'https://www.bankalfalah.com/offers/'] },
  { name: 'Meezan Bank', websiteUrl: 'https://www.meezanbank.com', categorySlug: 'finans', seedUrls: ['https://www.meezanbank.com/promotions/', 'https://www.meezanbank.com/offers/'] },
  { name: 'Standard Chartered PK', websiteUrl: 'https://www.sc.com/pk', categorySlug: 'finans', seedUrls: ['https://www.sc.com/pk/promotions/', 'https://www.sc.com/pk/credit-cards/offers/'] },
  { name: 'Faysal Bank', websiteUrl: 'https://www.faysalbank.com', categorySlug: 'finans', seedUrls: ['https://www.faysalbank.com/promotions/', 'https://www.faysalbank.com/offers/'] },
  { name: 'Askari Bank', websiteUrl: 'https://www.askaribank.com', categorySlug: 'finans', seedUrls: ['https://www.askaribank.com/offers/'] },
  { name: 'Bank Al Habib', websiteUrl: 'https://www.bankalhabib.com', categorySlug: 'finans', seedUrls: ['https://www.bankalhabib.com/promotions'] },
  { name: 'Habib Metro Bank', websiteUrl: 'https://www.habibmetro.com', categorySlug: 'finans', seedUrls: ['https://www.habibmetro.com/offers'] },
  { name: 'JS Bank', websiteUrl: 'https://www.jsbl.com', categorySlug: 'finans', seedUrls: ['https://www.jsbl.com/promotions/', 'https://www.jsbl.com/offers/'] },
  { name: 'Soneri Bank', websiteUrl: 'https://www.soneribank.com', categorySlug: 'finans', seedUrls: ['https://www.soneribank.com/offers'] },
  { name: 'Summit Bank', websiteUrl: 'https://www.summitbank.com.pk', categorySlug: 'finans', seedUrls: ['https://www.summitbank.com.pk/offers'] },
  { name: 'Dubai Islamic Bank PK', websiteUrl: 'https://www.dibpak.com', categorySlug: 'finans', seedUrls: ['https://www.dibpak.com/promotions'] },
  { name: 'JazzCash', websiteUrl: 'https://www.jazzcash.com.pk', categorySlug: 'finans', seedUrls: ['https://www.jazzcash.com.pk/offers', 'https://www.jazzcash.com.pk/promotions'] },
  { name: 'Easypaisa', websiteUrl: 'https://easypaisa.com.pk', categorySlug: 'finans', seedUrls: ['https://easypaisa.com.pk/offers', 'https://easypaisa.com.pk/promotions'] },
  { name: 'NayaPay', websiteUrl: 'https://www.nayapay.com', categorySlug: 'finans', seedUrls: ['https://www.nayapay.com/offers', 'https://www.nayapay.com/promotions'] },
  { name: 'SadaPay', websiteUrl: 'https://www.sadapay.pk', categorySlug: 'finans', seedUrls: ['https://www.sadapay.pk/offers', 'https://www.sadapay.pk/promotions'] },
  { name: 'Payoneer PK', websiteUrl: 'https://www.payoneer.com/pk', categorySlug: 'finans', seedUrls: ['https://www.payoneer.com/pk/promotions/'] },
  { name: 'Visa PK', websiteUrl: 'https://www.visa.com.pk', categorySlug: 'finans', seedUrls: ['https://www.visa.com.pk/offers/'] },
  { name: 'Mastercard PK', websiteUrl: 'https://www.mastercard.com.pk', categorySlug: 'finans', seedUrls: ['https://www.mastercard.com.pk/en-pk/personal/offers-promotions.html'] },
  { name: 'UnionPay PK', websiteUrl: 'https://www.unionpayintl.com/en/country/pakistan', categorySlug: 'finans', seedUrls: ['https://www.unionpayintl.com/en/country/pakistan/offers/'] },
  { name: 'Daraz Wallet', websiteUrl: 'https://www.daraz.pk/wallet', categorySlug: 'finans', seedUrls: ['https://www.daraz.pk/wallet/offers'] },
  { name: 'BankIslami', websiteUrl: 'https://www.bankislami.com.pk', categorySlug: 'finans', seedUrls: ['https://www.bankislami.com.pk/offers'] },
  { name: 'Al Baraka PK', websiteUrl: 'https://www.albaraka.com.pk', categorySlug: 'finans', seedUrls: ['https://www.albaraka.com.pk/offers'] },
  { name: 'Silkbank', websiteUrl: 'https://www.silkbank.com.pk', categorySlug: 'finans', seedUrls: ['https://www.silkbank.com.pk/offers', 'https://www.silkbank.com.pk/promotions'] },
  { name: 'National Bank PK', websiteUrl: 'https://www.nbp.com.pk', categorySlug: 'finans', seedUrls: ['https://www.nbp.com.pk/offers'] },
  { name: 'First Women Bank', websiteUrl: 'https://www.fwbl.com.pk', categorySlug: 'finans', seedUrls: ['https://www.fwbl.com.pk/offers'] },
  { name: 'Keenu', websiteUrl: 'https://www.keenu.pk', categorySlug: 'finans', seedUrls: ['https://www.keenu.pk/offers'] },
  { name: 'FINCA PK', websiteUrl: 'https://www.ffrancqinca.pk', categorySlug: 'finans', seedUrls: ['https://www.finca.pk/offers'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'State Life Insurance', websiteUrl: 'https://www.statelife.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.statelife.com.pk/offers'] },
  { name: 'EFU Life', websiteUrl: 'https://www.efulife.com', categorySlug: 'sigorta', seedUrls: ['https://www.efulife.com/promotions', 'https://www.efulife.com/offers'] },
  { name: 'Jubilee Life Insurance', websiteUrl: 'https://www.jubileelife.com', categorySlug: 'sigorta', seedUrls: ['https://www.jubileelife.com/promotions'] },
  { name: 'Adamjee Insurance', websiteUrl: 'https://www.adamjeeinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.adamjeeinsurance.com/offers'] },
  { name: 'IGI Insurance', websiteUrl: 'https://www.igi.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.igi.com.pk/offers'] },
  { name: 'UBL Insurers', websiteUrl: 'https://www.ublinsurers.com', categorySlug: 'sigorta', seedUrls: ['https://www.ublinsurers.com/offers'] },
  { name: 'Askari Life', websiteUrl: 'https://www.askarilife.com', categorySlug: 'sigorta', seedUrls: ['https://www.askarilife.com/offers'] },
  { name: 'Pak Qatar Takaful', websiteUrl: 'https://www.pakqatar.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.pakqatar.com.pk/offers'] },
  { name: 'TPL Insurance', websiteUrl: 'https://www.tfrancqplinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.tplinsurance.com/offers', 'https://www.tplinsurance.com/promotions'] },
  { name: 'Allianz EFU', websiteUrl: 'https://www.allianzefuhealth.com', categorySlug: 'sigorta', seedUrls: ['https://www.allianzefuhealth.com/offers'] },
  { name: 'East West Insurance', websiteUrl: 'https://www.ewi.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.ewi.com.pk/offers'] },
  { name: 'Salaam Takaful', websiteUrl: 'https://www.salaamtakaful.com', categorySlug: 'sigorta', seedUrls: ['https://www.salaamtakaful.com/offers'] },
  { name: 'Asia Insurance', websiteUrl: 'https://www.asiainsurance.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.asiainsurance.com.pk/offers'] },
  { name: 'Century Insurance', websiteUrl: 'https://www.centuryinsurance.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.centuryinsurance.com.pk/offers'] },
  { name: 'United Insurance', websiteUrl: 'https://www.unitedinsurance.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.unitedinsurance.com.pk/offers'] },
  { name: 'Habib Insurance', websiteUrl: 'https://www.habibinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.habibinsurance.com/offers'] },
  { name: 'Pakistan Reinsurance', websiteUrl: 'https://www.pakre.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.pakre.com.pk/offers'] },
  { name: 'Premier Insurance', websiteUrl: 'https://www.premierinsurance.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.premierinsurance.com.pk/offers'] },
  { name: 'Silver Star Insurance', websiteUrl: 'https://www.silverstarins.com', categorySlug: 'sigorta', seedUrls: ['https://www.silverstarins.com/offers'] },
  { name: 'Atlas Insurance', websiteUrl: 'https://www.atlasinsurance.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.atlasinsurance.com.pk/offers'] },
  { name: 'TPL Life', websiteUrl: 'https://www.tpllife.com', categorySlug: 'sigorta', seedUrls: ['https://www.tpllife.com/offers'] },
  { name: 'Jubilee General Insurance', websiteUrl: 'https://www.jubileegeneral.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.jubileegeneral.com.pk/offers'] },
  { name: 'EFU General Insurance', websiteUrl: 'https://www.efugeneral.com', categorySlug: 'sigorta', seedUrls: ['https://www.efugeneral.com/offers'] },
  { name: 'Chubb Pakistan', websiteUrl: 'https://www.chubb.com/pk', categorySlug: 'sigorta', seedUrls: ['https://www.chubb.com/pk/offers/'] },
  { name: 'Reliance Insurance PK', websiteUrl: 'https://www.relianceinsurance.pk', categorySlug: 'sigorta', seedUrls: ['https://www.relianceinsurance.pk/offers'] },
  { name: 'Alpha Insurance', websiteUrl: 'https://www.alphainsurance.com.pk', categorySlug: 'sigorta', seedUrls: ['https://www.alphainsurance.com.pk/offers'] },
  { name: 'Shaheen Insurance', websiteUrl: 'https://www.shaheeninsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.shaheeninsurance.com/offers'] },
  { name: 'Pak Kuwait Takaful', websiteUrl: 'https://www.pfrancqaktakaful.com', categorySlug: 'sigorta', seedUrls: ['https://www.paktakaful.com/offers'] },
  { name: 'AKD Insurance', websiteUrl: 'https://www.akdinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.akdinsurance.com/offers'] },
  { name: 'Dawood Family Takaful', websiteUrl: 'https://www.dawoodfamilytakaful.com', categorySlug: 'sigorta', seedUrls: ['https://www.dawoodfamilytakaful.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota Pakistan', websiteUrl: 'https://www.toyota-indus.com', categorySlug: 'otomobil', seedUrls: ['https://www.toyota-indus.com/offers/', 'https://www.toyota-indus.com/promotions/'] },
  { name: 'Honda Pakistan', websiteUrl: 'https://www.honda.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.pk/offers', 'https://www.honda.com.pk/promotions'] },
  { name: 'Suzuki Pakistan', websiteUrl: 'https://www.pakfsuzuki.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.paksuzuki.com.pk/offers', 'https://www.paksuzuki.com.pk/promotions'] },
  { name: 'Hyundai Pakistan', websiteUrl: 'https://www.hyundai-sagar.com', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai-sagar.com/offers/'] },
  { name: 'KIA Pakistan', websiteUrl: 'https://www.kia.com/pk', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/pk/offers/', 'https://www.kia.com/pk/promotions/'] },
  { name: 'Changan Pakistan', websiteUrl: 'https://www.changanpakistan.com', categorySlug: 'otomobil', seedUrls: ['https://www.changanpakistan.com/offers'] },
  { name: 'MG Pakistan', websiteUrl: 'https://www.mgmotor.pk', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.pk/offers', 'https://www.mgmotor.pk/promotions'] },
  { name: 'Proton Pakistan', websiteUrl: 'https://www.proton.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.proton.com.pk/offers'] },
  { name: 'BAIC Pakistan', websiteUrl: 'https://www.baic.pk', categorySlug: 'otomobil', seedUrls: ['https://www.baic.pk/offers'] },
  { name: 'Chery Pakistan', websiteUrl: 'https://www.chery.pk', categorySlug: 'otomobil', seedUrls: ['https://www.chery.pk/offers'] },
  { name: 'BMW Pakistan', websiteUrl: 'https://www.bmw.pk', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.pk/en/topics/offers-and-services.html'] },
  { name: 'Mercedes PK', websiteUrl: 'https://www.mercedes-benz.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.pk/passengercars/buy/offers.html'] },
  { name: 'Audi PK', websiteUrl: 'https://www.audi.pk', categorySlug: 'otomobil', seedUrls: ['https://www.audi.pk/pk/web/en/models/offers.html'] },
  { name: 'Haval Pakistan', websiteUrl: 'https://www.haval.pk', categorySlug: 'otomobil', seedUrls: ['https://www.haval.pk/offers'] },
  { name: 'DFSK Pakistan', websiteUrl: 'https://www.dfrancqfsk.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.dfsk.com.pk/offers'] },
  { name: 'United Auto', websiteUrl: 'https://www.unitedauto.pk', categorySlug: 'otomobil', seedUrls: ['https://www.unitedauto.pk/offers'] },
  { name: 'Prince Motors', websiteUrl: 'https://www.princemotors.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.princemotors.com.pk/offers'] },
  { name: 'Honda Atlas Motorcycle', websiteUrl: 'https://www.atlashonda.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.atlashonda.com.pk/offers'] },
  { name: 'Yamaha PK', websiteUrl: 'https://www.yamaha-motor.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.yamaha-motor.com.pk/offers'] },
  { name: 'Super Power Motorcycles', websiteUrl: 'https://www.superpowergroup.com', categorySlug: 'otomobil', seedUrls: ['https://www.superpowergroup.com/offers'] },
  { name: 'PakWheels', websiteUrl: 'https://www.pakwheels.com', categorySlug: 'otomobil', seedUrls: ['https://www.pakwheels.com/deals', 'https://www.pakwheels.com/offers'] },
  { name: 'OLX Motors PK', websiteUrl: 'https://www.olx.com.pk/cars', categorySlug: 'otomobil', seedUrls: ['https://www.olx.com.pk/cars/'] },
  { name: 'Shell Pakistan', websiteUrl: 'https://www.shell.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.shell.com.pk/motorists/offers.html'] },
  { name: 'PSO', websiteUrl: 'https://www.psopk.com', categorySlug: 'otomobil', seedUrls: ['https://www.psopk.com/offers'] },
  { name: 'Total Parco PK', websiteUrl: 'https://www.total.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.total.com.pk/offers'] },
  { name: 'Attock Petroleum', websiteUrl: 'https://www.apl.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.apl.com.pk/offers'] },
  { name: 'Bridgestone PK', websiteUrl: 'https://www.bridgestone.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestone.com.pk/offers'] },
  { name: 'General Tyre PK', websiteUrl: 'https://www.generaltyre.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.generaltyre.com.pk/offers'] },
  { name: 'Panther Tyres', websiteUrl: 'https://www.panthertyres.com', categorySlug: 'otomobil', seedUrls: ['https://www.panthertyres.com/offers'] },
  { name: 'Atlas Battery', websiteUrl: 'https://www.atlasbattery.com.pk', categorySlug: 'otomobil', seedUrls: ['https://www.atlasbattery.com.pk/offers'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Liberty Books', websiteUrl: 'https://www.libertybooks.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.libertybooks.com/sale', 'https://www.libertybooks.com/deals'] },
  { name: 'Readings PK', websiteUrl: 'https://www.readings.com.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.readings.com.pk/sale'] },
  { name: 'Kitabain', websiteUrl: 'https://kitabain.com', categorySlug: 'kitap-hobi', seedUrls: ['https://kitabain.com/sale', 'https://kitabain.com/deals'] },
  { name: 'Book Corner', websiteUrl: 'https://www.bookcorner.com.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookcorner.com.pk/sale'] },
  { name: 'Netflix PK', websiteUrl: 'https://www.netflix.com/pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/pk/'] },
  { name: 'Disney+ PK', websiteUrl: 'https://www.disneyplus.com/en-pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/en-pk/'] },
  { name: 'Spotify PK', websiteUrl: 'https://www.spotify.com/pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/pk/premium/'] },
  { name: 'YouTube Premium PK', websiteUrl: 'https://www.youtube.com/premium', categorySlug: 'kitap-hobi', seedUrls: ['https://www.youtube.com/premium'] },
  { name: 'Amazon Prime PK', websiteUrl: 'https://www.primevideo.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.primevideo.com/'] },
  { name: 'PlayStation PK', websiteUrl: 'https://store.playstation.com/en-pk', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/en-pk/category/deals'] },
  { name: 'Xbox PK', websiteUrl: 'https://www.xbox.com/en-PK', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/en-PK/games/sales-and-specials'] },
  { name: 'Steam PK', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Lego PK', websiteUrl: 'https://www.lego.com/en-pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-pk/categories/sales-and-deals'] },
  { name: 'Cinestar PK', websiteUrl: 'https://www.cfrancqinestar.com.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cinestar.com.pk/promotions'] },
  { name: 'Nueplex Cinemas', websiteUrl: 'https://www.nueplex.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nueplex.com/promotions'] },
  { name: 'Cinepax', websiteUrl: 'https://www.cinepax.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cinepax.com/promotions'] },
  { name: 'Ticketmaster PK', websiteUrl: 'https://www.ticketmaster.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ticketmaster.pk/offers'] },
  { name: 'Yonder PK', websiteUrl: 'https://www.yonderbook.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.yonderbook.pk/sale'] },
  { name: 'Udemy PK', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=en&q=deals'] },
  { name: 'Coursera PK', websiteUrl: 'https://www.coursera.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coursera.org/deals'] },
  { name: 'Daraz Books', websiteUrl: 'https://www.daraz.pk/books', categorySlug: 'kitap-hobi', seedUrls: ['https://www.daraz.pk/books/?sale=1'] },
  { name: 'Funland PK', websiteUrl: 'https://www.funlandpk.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.funlandpk.com/offers'] },
  { name: 'Sindbad Wonderland', websiteUrl: 'https://www.sindbad.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sindbad.pk/offers'] },
  { name: 'ARY Digital', websiteUrl: 'https://www.arydigital.tv', categorySlug: 'kitap-hobi', seedUrls: ['https://www.arydigital.tv/promotions'] },
  { name: 'Geo Entertainment', websiteUrl: 'https://www.geo.tv/entertainment', categorySlug: 'kitap-hobi', seedUrls: ['https://www.geo.tv/entertainment/promotions'] },
  { name: 'Hum TV', websiteUrl: 'https://www.humtv.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.humtv.pk/promotions'] },
  { name: 'Toy City PK', websiteUrl: 'https://toycity.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://toycity.pk/collections/sale'] },
  { name: 'Skill.pk', websiteUrl: 'https://skill.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://skill.pk/deals'] },
  { name: 'ePlanet PK', websiteUrl: 'https://www.eplanet.pk', categorySlug: 'kitap-hobi', seedUrls: ['https://www.eplanet.pk/sale'] },
  { name: 'Apple Music PK', websiteUrl: 'https://www.apple.com/pk/apple-music', categorySlug: 'kitap-hobi', seedUrls: ['https://www.apple.com/pk/apple-music/'] },
  { name: 'CricketGateway', websiteUrl: 'https://www.cricketgateway.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cricketgateway.com/offers'] },
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
  console.log('=== PK Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'PK' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'PK', categoryId: category.id },
      });

      brandsOk++;

      const isActive = entry.isActive !== false;

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
            market: 'PK',
            isActive,
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged || existingSource.isActive !== isActive) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'PK', isActive },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'PK', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active PK sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
