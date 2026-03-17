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
  { name: 'Takealot', websiteUrl: 'https://www.takealot.com', categorySlug: 'alisveris', seedUrls: ['https://www.takealot.com/deals', 'https://www.takealot.com/specials'] },
  { name: 'Makro', websiteUrl: 'https://www.makro.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.makro.co.za/deals', 'https://www.makro.co.za/specials'] },
  { name: 'Game', websiteUrl: 'https://www.game.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.game.co.za/game-za/en/deals', 'https://www.game.co.za/game-za/en/specials'] },
  { name: 'Checkers', websiteUrl: 'https://www.checkers.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.checkers.co.za/specials', 'https://www.checkers.co.za/promotions'] },
  { name: 'Pick n Pay', websiteUrl: 'https://www.pnp.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.pnp.co.za/promotions', 'https://www.pnp.co.za/specials'] },
  { name: 'Woolworths', websiteUrl: 'https://www.woolworths.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.woolworths.co.za/cat/sale', 'https://www.woolworths.co.za/cat/specials'] },
  { name: 'Mr Price', websiteUrl: 'https://www.mrprice.com', categorySlug: 'alisveris', seedUrls: ['https://www.mrprice.com/sale', 'https://www.mrprice.com/specials'] },
  { name: 'Shoprite', websiteUrl: 'https://www.shoprite.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.shoprite.co.za/specials', 'https://www.shoprite.co.za/promotions'] },
  { name: 'Dis-Chem', websiteUrl: 'https://www.dischem.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.dischem.co.za/promotions', 'https://www.dischem.co.za/deals'] },
  { name: 'Clicks', websiteUrl: 'https://www.clicks.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.clicks.co.za/promotions', 'https://www.clicks.co.za/specials'] },
  { name: 'Superbalist', websiteUrl: 'https://superbalist.com', categorySlug: 'alisveris', seedUrls: ['https://superbalist.com/sale', 'https://superbalist.com/deals'] },
  { name: 'Bash', websiteUrl: 'https://bash.com', categorySlug: 'alisveris', seedUrls: ['https://bash.com/deals', 'https://bash.com/sale'] },
  { name: 'Loot', websiteUrl: 'https://www.loot.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.loot.co.za/deals', 'https://www.loot.co.za/specials'] },
  { name: 'Massmart', websiteUrl: 'https://www.massmart.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.massmart.co.za/deals'] },
  { name: 'Builders Warehouse', websiteUrl: 'https://www.builders.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.builders.co.za/specials', 'https://www.builders.co.za/promotions'] },
  { name: 'Wetherlys', websiteUrl: 'https://www.wfrancq.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.wfrancq.co.za/sale'] },
  { name: 'Incredible Connection', websiteUrl: 'https://www.incredible.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.incredible.co.za/deals', 'https://www.incredible.co.za/specials'] },
  { name: 'HiFi Corp', websiteUrl: 'https://www.hificorp.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.hificorp.co.za/deals', 'https://www.hificorp.co.za/specials'] },
  { name: 'Everyshop', websiteUrl: 'https://www.everyshop.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.everyshop.co.za/deals', 'https://www.everyshop.co.za/sale'] },
  { name: 'Zando', websiteUrl: 'https://www.zando.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.zando.co.za/sale/', 'https://www.zando.co.za/deals/'] },
  { name: 'OneDayOnly', websiteUrl: 'https://www.onedayonly.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.onedayonly.co.za/'] },
  { name: 'Yuppiechef', websiteUrl: 'https://www.yuppiechef.com', categorySlug: 'alisveris', seedUrls: ['https://www.yuppiechef.com/sale', 'https://www.yuppiechef.com/specials'] },
  { name: 'Faithful to Nature', websiteUrl: 'https://www.faithful-to-nature.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.faithful-to-nature.co.za/sale', 'https://www.faithful-to-nature.co.za/specials'] },
  { name: 'Cape Union Mart', websiteUrl: 'https://www.capeunionmart.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.capeunionmart.co.za/sale', 'https://www.capeunionmart.co.za/specials'] },
  { name: 'TFG', websiteUrl: 'https://www.tfg.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.tfg.co.za/sale'] },
  { name: 'PEP', websiteUrl: 'https://www.pepstores.com', categorySlug: 'alisveris', seedUrls: ['https://www.pepstores.com/specials', 'https://www.pepstores.com/promotions'] },
  { name: 'Ackermans', websiteUrl: 'https://www.ackermans.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.ackermans.co.za/sale', 'https://www.ackermans.co.za/specials'] },
  { name: 'Jet', websiteUrl: 'https://www.jet.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.jet.co.za/sale', 'https://www.jet.co.za/specials'] },
  { name: 'Russells', websiteUrl: 'https://www.russells.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.russells.co.za/deals', 'https://www.russells.co.za/specials'] },
  { name: 'Lewis', websiteUrl: 'https://www.lewis.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.lewis.co.za/deals', 'https://www.lewis.co.za/specials'] },
  { name: 'Bridgeway', websiteUrl: 'https://www.bridgeway.co.za', categorySlug: 'alisveris', seedUrls: ['https://www.bridgeway.co.za/deals'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung ZA', websiteUrl: 'https://www.samsung.com/za', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/za/offer/', 'https://www.samsung.com/za/smartphones/all-smartphones/'] },
  { name: 'Apple ZA', websiteUrl: 'https://www.apple.com/za', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/za/shop/go/special_deals'] },
  { name: 'Vodacom', websiteUrl: 'https://www.vodacom.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.vodacom.co.za/vodacom/shopping/deals', 'https://www.vodacom.co.za/vodacom/shopping/specials'] },
  { name: 'MTN', websiteUrl: 'https://www.mtn.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.mtn.co.za/deals', 'https://www.mtn.co.za/specials'] },
  { name: 'Cell C', websiteUrl: 'https://www.cellc.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.cellc.co.za/deals', 'https://www.cellc.co.za/specials'] },
  { name: 'Telkom', websiteUrl: 'https://www.telkom.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.telkom.co.za/deals', 'https://www.telkom.co.za/specials'] },
  { name: 'Rain', websiteUrl: 'https://www.rain.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.rain.co.za/deals'] },
  { name: 'Matrix Warehouse', websiteUrl: 'https://www.matrixwarehouse.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.matrixwarehouse.co.za/deals', 'https://www.matrixwarehouse.co.za/specials'] },
  { name: 'Evetech', websiteUrl: 'https://www.evetech.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.evetech.co.za/specials/', 'https://www.evetech.co.za/deals/'] },
  { name: 'Wootware', websiteUrl: 'https://www.wootware.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.wootware.co.za/deals', 'https://www.wootware.co.za/specials'] },
  { name: 'Rectron', websiteUrl: 'https://www.rectron.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.rectron.co.za/deals'] },
  { name: 'LG ZA', websiteUrl: 'https://www.lg.com/za', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/za/promotions'] },
  { name: 'Sony ZA', websiteUrl: 'https://www.sony.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.sony.co.za/promotions'] },
  { name: 'Huawei ZA', websiteUrl: 'https://consumer.huawei.com/za', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/za/offer/'] },
  { name: 'HP ZA', websiteUrl: 'https://www.hp.com/za-en', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/za-en/shop/deals'] },
  { name: 'Dell ZA', websiteUrl: 'https://www.dell.com/en-za', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/en-za/shop/deals'] },
  { name: 'Lenovo ZA', websiteUrl: 'https://www.lenovo.com/za/en', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/za/en/d/deals/'] },
  { name: 'Asus ZA', websiteUrl: 'https://www.asus.com/za', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/za/campaign/'] },
  { name: 'Xiaomi ZA', websiteUrl: 'https://www.mi.com/za', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/za/sale'] },
  { name: 'DStv', websiteUrl: 'https://www.dstv.com', categorySlug: 'elektronik', seedUrls: ['https://www.dstv.com/en-za/deals', 'https://www.dstv.com/en-za/specials'] },
  { name: 'Showmax', websiteUrl: 'https://www.showmax.com', categorySlug: 'elektronik', seedUrls: ['https://www.showmax.com/eng/deals'] },
  { name: 'Philips ZA', websiteUrl: 'https://www.philips.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.philips.co.za/c-e/deals'] },
  { name: 'Hisense ZA', websiteUrl: 'https://hisense-za.com', categorySlug: 'elektronik', seedUrls: ['https://hisense-za.com/promotions'] },
  { name: 'TCL ZA', websiteUrl: 'https://www.tcl.com/za', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/za/en/promotions'] },
  { name: 'Logitech ZA', websiteUrl: 'https://www.logitech.com/en-za', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/en-za/promo.html'] },
  { name: 'Canon ZA', websiteUrl: 'https://www.canon.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.canon.co.za/promotions'] },
  { name: 'Epson ZA', websiteUrl: 'https://www.epson.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.epson.co.za/promotions'] },
  { name: 'JBL ZA', websiteUrl: 'https://za.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://za.jbl.com/deals'] },
  { name: 'Nikon ZA', websiteUrl: 'https://www.nikon.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.co.za/promotions'] },
  { name: 'GoPro ZA', websiteUrl: 'https://gopro.com/en/za', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/en/za/deals'] },
  { name: 'iStore', websiteUrl: 'https://www.istore.co.za', categorySlug: 'elektronik', seedUrls: ['https://www.istore.co.za/deals', 'https://www.istore.co.za/specials'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Truworths', websiteUrl: 'https://www.truworths.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.truworths.co.za/sale', 'https://www.truworths.co.za/specials'] },
  { name: 'Foschini', websiteUrl: 'https://www.foschini.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.foschini.co.za/sale', 'https://www.foschini.co.za/specials'] },
  { name: 'Edgars', websiteUrl: 'https://www.edgars.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.edgars.co.za/sale', 'https://www.edgars.co.za/specials'] },
  { name: 'Sportscene', websiteUrl: 'https://www.sportscene.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.sportscene.co.za/sale', 'https://www.sportscene.co.za/specials'] },
  { name: 'Markham', websiteUrl: 'https://www.markham.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.markham.co.za/sale', 'https://www.markham.co.za/specials'] },
  { name: 'Identity', websiteUrl: 'https://www.identity.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.identity.co.za/sale'] },
  { name: 'Exact', websiteUrl: 'https://www.exact.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.exact.co.za/sale'] },
  { name: 'Cotton On ZA', websiteUrl: 'https://cottonon.com/ZA', categorySlug: 'giyim-moda', seedUrls: ['https://cottonon.com/ZA/sale/'] },
  { name: 'H&M ZA', websiteUrl: 'https://www2.hm.com/en_za', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/en_za/sale.html'] },
  { name: 'Zara ZA', websiteUrl: 'https://www.zara.com/za', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/za/en/sale-l1702.html'] },
  { name: 'Nike ZA', websiteUrl: 'https://www.nike.com/za', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/za/sale', 'https://www.nike.com/za/deals'] },
  { name: 'Adidas ZA', websiteUrl: 'https://www.adidas.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.co.za/sale', 'https://www.adidas.co.za/outlet'] },
  { name: 'Levi\'s ZA', websiteUrl: 'https://www.levi.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.co.za/sale'] },
  { name: 'Country Road ZA', websiteUrl: 'https://www.countryroad.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.countryroad.co.za/sale'] },
  { name: 'Trenery', websiteUrl: 'https://www.trenery.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.trenery.co.za/sale'] },
  { name: 'Fabiani', websiteUrl: 'https://www.fabiani.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.fabiani.co.za/sale'] },
  { name: 'Old Khaki', websiteUrl: 'https://www.oldkhaki.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.oldkhaki.co.za/sale'] },
  { name: 'Poetry', websiteUrl: 'https://www.poetry.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.poetry.co.za/sale'] },
  { name: 'Witchery ZA', websiteUrl: 'https://www.witchery.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.witchery.co.za/sale'] },
  { name: 'G-Star RAW ZA', websiteUrl: 'https://www.g-star.com/en_za', categorySlug: 'giyim-moda', seedUrls: ['https://www.g-star.com/en_za/sale'] },
  { name: 'Forever New ZA', websiteUrl: 'https://www.forevernew.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.forevernew.co.za/sale'] },
  { name: 'Sissy Boy', websiteUrl: 'https://www.sissyboy.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.sissyboy.co.za/sale'] },
  { name: 'Steve Madden ZA', websiteUrl: 'https://www.stevemadden.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.stevemadden.co.za/sale'] },
  { name: 'Aldo ZA', websiteUrl: 'https://www.aldoshoes.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.aldoshoes.co.za/sale'] },
  { name: 'Guess ZA', websiteUrl: 'https://www.guess.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.co.za/sale'] },
  { name: 'Levi Strauss', websiteUrl: 'https://www.levistrauss.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.levistrauss.co.za/sale'] },
  { name: 'Relay Jeans', websiteUrl: 'https://www.relayjeans.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.relayjeans.co.za/sale'] },
  { name: 'Donna', websiteUrl: 'https://www.donna.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.donna.co.za/sale'] },
  { name: 'Legit', websiteUrl: 'https://www.legit.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.legit.co.za/sale', 'https://www.legit.co.za/specials'] },
  { name: 'Queenspark', websiteUrl: 'https://www.queenspark.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.queenspark.com/sale'] },
  { name: 'Spree', websiteUrl: 'https://www.spree.co.za', categorySlug: 'giyim-moda', seedUrls: ['https://www.spree.co.za/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Food & Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Woolworths Food', websiteUrl: 'https://www.woolworths.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.woolworths.co.za/cat/food/specials', 'https://www.woolworths.co.za/cat/food/promotions'] },
  { name: 'Spar', websiteUrl: 'https://www.spar.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.spar.co.za/specials', 'https://www.spar.co.za/promotions'] },
  { name: 'Food Lover\'s Market', websiteUrl: 'https://www.foodloversmarket.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.foodloversmarket.co.za/specials', 'https://www.foodloversmarket.co.za/promotions'] },
  { name: 'Checkers Food', websiteUrl: 'https://www.checkers.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.checkers.co.za/specials', 'https://www.checkers.co.za/deals'] },
  { name: 'Pick n Pay Food', websiteUrl: 'https://www.pnp.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.pnp.co.za/promotions', 'https://www.pnp.co.za/deals'] },
  { name: 'Shoprite Food', websiteUrl: 'https://www.shoprite.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.shoprite.co.za/specials'] },
  { name: 'Sixty60', websiteUrl: 'https://www.sixty60.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.sixty60.co.za/specials'] },
  { name: 'Boxer', websiteUrl: 'https://www.boxer.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.boxer.co.za/specials', 'https://www.boxer.co.za/promotions'] },
  { name: 'OK Foods', websiteUrl: 'https://www.okfoods.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.okfoods.co.za/specials'] },
  { name: 'Cambridge Food', websiteUrl: 'https://www.cambridgefood.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.cambridgefood.co.za/specials'] },
  { name: 'Usave', websiteUrl: 'https://www.usave.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.usave.co.za/specials'] },
  { name: 'Checkers Hyper', websiteUrl: 'https://www.checkers.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.checkers.co.za/hyper/specials'] },
  { name: 'NetFlorist', websiteUrl: 'https://www.netflorist.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.netflorist.co.za/specials', 'https://www.netflorist.co.za/deals'] },
  { name: 'Wellness Warehouse', websiteUrl: 'https://www.wellnesswarehouse.com', categorySlug: 'gida-market', seedUrls: ['https://www.wellnesswarehouse.com/specials', 'https://www.wellnesswarehouse.com/sale'] },
  { name: 'Dischem Food', websiteUrl: 'https://www.dischem.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.dischem.co.za/food-and-beverages/promotions'] },
  { name: 'Absolute Pets', websiteUrl: 'https://www.absolutepets.com', categorySlug: 'gida-market', seedUrls: ['https://www.absolutepets.com/specials'] },
  { name: 'Takealot Groceries', websiteUrl: 'https://www.takealot.com', categorySlug: 'gida-market', seedUrls: ['https://www.takealot.com/groceries/deals'] },
  { name: 'Drinksmart', websiteUrl: 'https://www.drinksmart.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.drinksmart.co.za/specials'] },
  { name: 'Norman Goodfellows', websiteUrl: 'https://www.normangoodfellows.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.normangoodfellows.co.za/specials'] },
  { name: 'Tops at Spar', websiteUrl: 'https://www.spar.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.spar.co.za/tops/specials'] },
  { name: 'Wine.co.za', websiteUrl: 'https://www.wine.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.wine.co.za/specials/', 'https://www.wine.co.za/deals/'] },
  { name: 'Woolworths Taste', websiteUrl: 'https://www.woolworths.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.woolworths.co.za/cat/food/taste/specials'] },
  { name: 'HelloFresh ZA', websiteUrl: 'https://www.hellofresh.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.hellofresh.co.za/deals'] },
  { name: 'Zulzi', websiteUrl: 'https://www.zulzi.com', categorySlug: 'gida-market', seedUrls: ['https://www.zulzi.com/specials'] },
  { name: 'OneCart', websiteUrl: 'https://www.onecart.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.onecart.co.za/specials'] },
  { name: 'Jacksons', websiteUrl: 'https://www.jacksons.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.jacksons.co.za/specials'] },
  { name: 'Makro Food', websiteUrl: 'https://www.makro.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.makro.co.za/food/deals'] },
  { name: 'Fruit & Veg City', websiteUrl: 'https://www.fruitandvegcity.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.fruitandvegcity.co.za/specials'] },
  { name: 'Lidl ZA', websiteUrl: 'https://www.lidl.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.co.za/specials'] },
  { name: 'Massmart Wholesale', websiteUrl: 'https://www.massmart.co.za', categorySlug: 'gida-market', seedUrls: ['https://www.massmart.co.za/food/deals'] },
  { name: 'Sasol Delight', websiteUrl: 'https://www.sasol.com', categorySlug: 'gida-market', seedUrls: ['https://www.sasol.com/delight/specials'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Dining (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Mr D Food', websiteUrl: 'https://www.mrdfood.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.mrdfood.com/deals', 'https://www.mrdfood.com/specials'] },
  { name: 'Uber Eats ZA', websiteUrl: 'https://www.ubereats.com/za', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/za/deals'] },
  { name: 'Nando\'s ZA', websiteUrl: 'https://www.nandos.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.co.za/deals', 'https://www.nandos.co.za/specials'] },
  { name: 'Steers', websiteUrl: 'https://www.steers.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.steers.co.za/deals', 'https://www.steers.co.za/specials'] },
  { name: 'Spur', websiteUrl: 'https://www.spur.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.spur.co.za/deals', 'https://www.spur.co.za/specials'] },
  { name: 'Ocean Basket', websiteUrl: 'https://www.oceanbasket.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.oceanbasket.com/deals', 'https://www.oceanbasket.com/specials'] },
  { name: 'Debonairs Pizza', websiteUrl: 'https://www.debonairs.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.debonairs.co.za/deals', 'https://www.debonairs.co.za/specials'] },
  { name: 'Roman\'s Pizza', websiteUrl: 'https://www.romanspizza.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.romanspizza.co.za/deals', 'https://www.romanspizza.co.za/specials'] },
  { name: 'KFC ZA', websiteUrl: 'https://www.kfc.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.co.za/deals', 'https://www.kfc.co.za/specials'] },
  { name: 'McDonald\'s ZA', websiteUrl: 'https://www.mcdonalds.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.co.za/deals', 'https://www.mcdonalds.co.za/specials'] },
  { name: 'Burger King ZA', websiteUrl: 'https://www.burgerking.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.co.za/deals'] },
  { name: 'Wimpy', websiteUrl: 'https://www.wimpy.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.wimpy.co.za/deals', 'https://www.wimpy.co.za/specials'] },
  { name: 'Fishaways', websiteUrl: 'https://www.fishaways.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.fishaways.co.za/deals'] },
  { name: 'Panarottis', websiteUrl: 'https://www.panarottis.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.panarottis.co.za/deals'] },
  { name: 'John Dory\'s', websiteUrl: 'https://www.johndorys.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.johndorys.co.za/deals'] },
  { name: 'Galito\'s', websiteUrl: 'https://www.galitos.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.galitos.co.za/deals'] },
  { name: 'Barcelos', websiteUrl: 'https://www.barcelos.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.barcelos.co.za/deals'] },
  { name: 'Starbucks ZA', websiteUrl: 'https://www.starbucks.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.co.za/deals'] },
  { name: 'Vida e Caffè', websiteUrl: 'https://www.vidaecaffe.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.vidaecaffe.com/deals'] },
  { name: 'Seattle Coffee Company', websiteUrl: 'https://www.seattlecoffeecompany.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.seattlecoffeecompany.co.za/deals'] },
  { name: 'Mugg & Bean', websiteUrl: 'https://www.muggandbean.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.muggandbean.co.za/deals'] },
  { name: 'The Hussar Grill', websiteUrl: 'https://www.hussargrill.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.hussargrill.co.za/specials'] },
  { name: 'Salsa Mexican Grill', websiteUrl: 'https://www.salsagrill.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.salsagrill.co.za/deals'] },
  { name: 'RocoMamas', websiteUrl: 'https://www.rocomamas.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.rocomamas.co.za/deals'] },
  { name: 'Col\'Cacchio', websiteUrl: 'https://www.colcacchio.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.colcacchio.co.za/deals'] },
  { name: 'Doppio Zero', websiteUrl: 'https://www.doppiozero.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.doppiozero.co.za/deals'] },
  { name: 'Primi', websiteUrl: 'https://www.primi.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.primi.co.za/deals'] },
  { name: 'Tashas', websiteUrl: 'https://www.tashas.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.tashas.co.za/specials'] },
  { name: 'Domino\'s ZA', websiteUrl: 'https://www.dominos.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.co.za/deals'] },
  { name: 'Pizza Hut ZA', websiteUrl: 'https://www.pizzahut.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.co.za/deals'] },
  { name: 'Anat', websiteUrl: 'https://www.anat.co.za', categorySlug: 'yeme-icme', seedUrls: ['https://www.anat.co.za/deals'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Clicks Beauty', websiteUrl: 'https://www.clicks.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clicks.co.za/beauty/promotions', 'https://www.clicks.co.za/beauty/specials'] },
  { name: 'Dis-Chem Beauty', websiteUrl: 'https://www.dischem.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dischem.co.za/beauty/promotions', 'https://www.dischem.co.za/beauty/specials'] },
  { name: 'Woolworths Beauty', websiteUrl: 'https://www.woolworths.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.woolworths.co.za/cat/beauty/specials'] },
  { name: 'MAC ZA', websiteUrl: 'https://www.maccosmetics.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.co.za/offers'] },
  { name: 'Estée Lauder ZA', websiteUrl: 'https://www.esteelauder.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.co.za/offers'] },
  { name: 'Clinique ZA', websiteUrl: 'https://www.clinique.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.co.za/offers'] },
  { name: 'Sorbet', websiteUrl: 'https://www.sorbet.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sorbet.co.za/deals', 'https://www.sorbet.co.za/specials'] },
  { name: 'Skin Renewal', websiteUrl: 'https://www.skinrenewal.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.skinrenewal.co.za/specials'] },
  { name: 'Dermalogica ZA', websiteUrl: 'https://www.dermalogica.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dermalogica.co.za/deals'] },
  { name: 'The Body Shop ZA', websiteUrl: 'https://www.thebodyshop.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.co.za/sale', 'https://www.thebodyshop.co.za/deals'] },
  { name: 'Lush ZA', websiteUrl: 'https://www.lush.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.co.za/sale'] },
  { name: 'Sephora ZA', websiteUrl: 'https://www.sephora.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.co.za/sale'] },
  { name: 'Red Square', websiteUrl: 'https://www.redsquare.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.redsquare.co.za/specials'] },
  { name: 'Foschini Beauty', websiteUrl: 'https://www.foschini.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.foschini.co.za/beauty/sale'] },
  { name: 'Rain Africa', websiteUrl: 'https://www.rainafrica.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rainafrica.com/sale'] },
  { name: 'Oh So Heavenly', websiteUrl: 'https://www.ohsoheavenly.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ohsoheavenly.co.za/specials'] },
  { name: 'Loccitane ZA', websiteUrl: 'https://za.loccitane.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://za.loccitane.com/sale'] },
  { name: 'Clarins ZA', websiteUrl: 'https://www.clarins.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clarins.co.za/offers/'] },
  { name: 'Charlotte Tilbury ZA', websiteUrl: 'https://www.charlottetilbury.com/za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.charlottetilbury.com/za/sale'] },
  { name: 'Kiehl\'s ZA', websiteUrl: 'https://www.kiehls.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.co.za/offers'] },
  { name: 'Avon ZA', websiteUrl: 'https://www.avon.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avon.co.za/specials', 'https://www.avon.co.za/deals'] },
  { name: 'Revlon ZA', websiteUrl: 'https://www.revlon.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.revlon.co.za/offers'] },
  { name: 'Yardley ZA', websiteUrl: 'https://www.yardley.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yardley.co.za/specials'] },
  { name: 'Nivea ZA', websiteUrl: 'https://www.nivea.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.co.za/offers'] },
  { name: 'Dove ZA', websiteUrl: 'https://www.dove.com/za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/za/offers.html'] },
  { name: 'Bioderma ZA', websiteUrl: 'https://www.bioderma.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.co.za/offers'] },
  { name: 'La Roche-Posay ZA', websiteUrl: 'https://www.laroche-posay.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.co.za/offers'] },
  { name: 'Vichy ZA', websiteUrl: 'https://www.vichy.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.co.za/offers'] },
  { name: 'NYX ZA', websiteUrl: 'https://www.nyxcosmetics.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.co.za/sale'] },
  { name: 'Maybelline ZA', websiteUrl: 'https://www.maybelline.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.co.za/offers'] },
  { name: 'Garnier ZA', websiteUrl: 'https://www.garnier.co.za', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.co.za/offers'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: '@home', websiteUrl: 'https://www.home.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.home.co.za/sale', 'https://www.home.co.za/specials'] },
  { name: 'Mr Price Home', websiteUrl: 'https://www.mrphome.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.mrphome.com/sale', 'https://www.mrphome.com/specials'] },
  { name: 'Sheet Street', websiteUrl: 'https://www.sheetstreet.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.sheetstreet.co.za/sale', 'https://www.sheetstreet.co.za/specials'] },
  { name: 'IKEA ZA', websiteUrl: 'https://www.ikea.com/za', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/za/en/offers/', 'https://www.ikea.com/za/en/campaigns/'] },
  { name: 'Leroy Merlin ZA', websiteUrl: 'https://www.leroymerlin.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.leroymerlin.co.za/specials', 'https://www.leroymerlin.co.za/promotions'] },
  { name: 'Builders', websiteUrl: 'https://www.builders.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.builders.co.za/specials', 'https://www.builders.co.za/deals'] },
  { name: 'Coricraft', websiteUrl: 'https://www.coricraft.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.coricraft.co.za/sale'] },
  { name: 'Weylandts', websiteUrl: 'https://www.weylandts.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.weylandts.co.za/sale'] },
  { name: 'Block & Chisel', websiteUrl: 'https://www.blockandchisel.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.blockandchisel.co.za/sale'] },
  { name: 'Rochester', websiteUrl: 'https://www.rochester.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.rochester.co.za/sale'] },
  { name: 'Volpes', websiteUrl: 'https://www.volpes.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.volpes.co.za/sale', 'https://www.volpes.co.za/specials'] },
  { name: 'House of Monatic', websiteUrl: 'https://www.houseofmonatic.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.houseofmonatic.co.za/sale'] },
  { name: 'Woolworths Home', websiteUrl: 'https://www.woolworths.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.woolworths.co.za/cat/homeware/specials'] },
  { name: 'Linen House', websiteUrl: 'https://www.linenhouse.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.linenhouse.co.za/sale'] },
  { name: 'CTM', websiteUrl: 'https://www.ctm.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.ctm.co.za/specials', 'https://www.ctm.co.za/promotions'] },
  { name: 'Italtile', websiteUrl: 'https://www.italtile.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.italtile.co.za/specials'] },
  { name: 'Cashbuild', websiteUrl: 'https://www.cashbuild.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.cashbuild.co.za/specials'] },
  { name: 'Tile Africa', websiteUrl: 'https://www.tileafrica.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.tileafrica.co.za/specials'] },
  { name: 'HomeChoice', websiteUrl: 'https://www.homechoice.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.homechoice.co.za/sale', 'https://www.homechoice.co.za/specials'] },
  { name: 'Russells Home', websiteUrl: 'https://www.russells.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.russells.co.za/deals'] },
  { name: 'Lewis Home', websiteUrl: 'https://www.lewis.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.lewis.co.za/deals'] },
  { name: 'Dial-a-Bed', websiteUrl: 'https://www.dialabed.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.dialabed.co.za/specials', 'https://www.dialabed.co.za/deals'] },
  { name: 'Bed Bath & Beyond ZA', websiteUrl: 'https://www.bedbathbeyond.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.bedbathbeyond.co.za/sale'] },
  { name: 'Plascon', websiteUrl: 'https://www.plascon.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.plascon.co.za/promotions'] },
  { name: 'Dulux ZA', websiteUrl: 'https://www.dulux.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.dulux.co.za/promotions'] },
  { name: 'Garden Master', websiteUrl: 'https://www.gardenmaster.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.gardenmaster.co.za/specials'] },
  { name: 'Stodels', websiteUrl: 'https://www.stodels.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.stodels.com/specials'] },
  { name: 'Lifestyle Garden', websiteUrl: 'https://www.lifestylegarden.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.lifestylegarden.co.za/specials'] },
  { name: 'Hirsch\'s', websiteUrl: 'https://www.hirschs.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.hirschs.co.za/deals', 'https://www.hirschs.co.za/specials'] },
  { name: 'DERA', websiteUrl: 'https://www.dera.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.dera.co.za/specials'] },
  { name: 'Outdoor Warehouse', websiteUrl: 'https://www.outdoorwarehouse.co.za', categorySlug: 'ev-yasam', seedUrls: ['https://www.outdoorwarehouse.co.za/specials'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor (spor-outdoor) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sportsmans Warehouse', websiteUrl: 'https://www.sportsmans.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportsmans.co.za/specials', 'https://www.sportsmans.co.za/deals'] },
  { name: 'Totalsports', websiteUrl: 'https://www.totalsports.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.totalsports.co.za/sale', 'https://www.totalsports.co.za/specials'] },
  { name: 'Cape Union Mart Sport', websiteUrl: 'https://www.capeunionmart.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.capeunionmart.co.za/sale'] },
  { name: 'Nike ZA Sport', websiteUrl: 'https://www.nike.com/za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/za/sale'] },
  { name: 'Adidas ZA Sport', websiteUrl: 'https://www.adidas.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.co.za/sale'] },
  { name: 'New Balance ZA', websiteUrl: 'https://www.newbalance.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.co.za/sale'] },
  { name: 'Puma ZA', websiteUrl: 'https://za.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://za.puma.com/sale', 'https://za.puma.com/deals'] },
  { name: 'Under Armour ZA', websiteUrl: 'https://www.underarmour.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.co.za/sale'] },
  { name: 'Asics ZA', websiteUrl: 'https://www.asics.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.co.za/sale'] },
  { name: 'K-Way', websiteUrl: 'https://www.k-way.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.k-way.co.za/sale'] },
  { name: 'First Ascent', websiteUrl: 'https://www.firstascent.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.firstascent.co.za/sale'] },
  { name: 'Rogue', websiteUrl: 'https://www.rogue.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.rogue.co.za/sale'] },
  { name: 'Sportscene Sport', websiteUrl: 'https://www.sportscene.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportscene.co.za/sale'] },
  { name: 'Reebok ZA', websiteUrl: 'https://www.reebok.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.co.za/sale'] },
  { name: 'Salomon ZA', websiteUrl: 'https://www.salomon.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.co.za/sale'] },
  { name: 'Columbia ZA', websiteUrl: 'https://www.columbia.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.co.za/sale'] },
  { name: 'The North Face ZA', websiteUrl: 'https://www.thenorthface.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.co.za/sale'] },
  { name: 'Merrell ZA', websiteUrl: 'https://www.merrell.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.co.za/sale'] },
  { name: 'Hi-Tec ZA', websiteUrl: 'https://www.hi-tec.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hi-tec.co.za/sale'] },
  { name: 'Crocs ZA', websiteUrl: 'https://www.crocs.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.crocs.co.za/sale'] },
  { name: 'Vans ZA', websiteUrl: 'https://www.vans.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.co.za/sale'] },
  { name: 'Converse ZA', websiteUrl: 'https://www.converse.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.co.za/sale'] },
  { name: 'Trappers', websiteUrl: 'https://www.trappers.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.trappers.co.za/sale'] },
  { name: 'Cycle Lab', websiteUrl: 'https://www.cyclelab.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.cyclelab.com/specials', 'https://www.cyclelab.com/deals'] },
  { name: 'Due South', websiteUrl: 'https://www.duesouth.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.duesouth.co.za/sale'] },
  { name: 'Thule ZA', websiteUrl: 'https://www.thule.com/en-za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thule.com/en-za/sale'] },
  { name: 'Planet Fitness ZA', websiteUrl: 'https://www.planetfitness.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.planetfitness.co.za/deals'] },
  { name: 'Virgin Active ZA', websiteUrl: 'https://www.virginactive.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.virginactive.co.za/deals'] },
  { name: 'Dis-Chem Sport', websiteUrl: 'https://www.dischem.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.dischem.co.za/sports-nutrition/specials'] },
  { name: 'Safari Outdoor', websiteUrl: 'https://www.safarioutdoor.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.safarioutdoor.co.za/specials'] },
  { name: 'Skechers ZA', websiteUrl: 'https://www.skechers.co.za', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.co.za/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'FlySafair', websiteUrl: 'https://www.flysafair.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flysafair.co.za/deals', 'https://www.flysafair.co.za/specials'] },
  { name: 'Kulula', websiteUrl: 'https://www.kulula.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kulula.com/deals', 'https://www.kulula.com/specials'] },
  { name: 'South African Airways', websiteUrl: 'https://www.flysaa.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flysaa.com/deals', 'https://www.flysaa.com/specials'] },
  { name: 'Mango Airlines', websiteUrl: 'https://www.flymango.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flymango.com/deals'] },
  { name: 'LIFT Airlines', websiteUrl: 'https://www.lift.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lift.co.za/deals'] },
  { name: 'CemAir', websiteUrl: 'https://www.cemair.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.cemair.co.za/specials'] },
  { name: 'Airlink', websiteUrl: 'https://www.flyairlink.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flyairlink.com/specials'] },
  { name: 'Booking ZA', websiteUrl: 'https://www.booking.com/country/za.html', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.html?cc1=za'] },
  { name: 'Travelstart', websiteUrl: 'https://www.travelstart.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travelstart.co.za/deals', 'https://www.travelstart.co.za/specials'] },
  { name: 'Cheapflights ZA', websiteUrl: 'https://www.cheapflights.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.cheapflights.co.za/deals'] },
  { name: 'Travelcheck', websiteUrl: 'https://www.travelcheck.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.travelcheck.co.za/deals'] },
  { name: 'Club Travel', websiteUrl: 'https://www.clubtravel.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.clubtravel.co.za/specials'] },
  { name: 'Flight Centre ZA', websiteUrl: 'https://www.flightcentre.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flightcentre.co.za/deals', 'https://www.flightcentre.co.za/specials'] },
  { name: 'Thompsons Travel', websiteUrl: 'https://www.thompsons.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.thompsons.co.za/specials'] },
  { name: 'Expedia ZA', websiteUrl: 'https://www.expedia.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.co.za/deals'] },
  { name: 'Airbnb ZA', websiteUrl: 'https://www.airbnb.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.co.za/'] },
  { name: 'Sun International', websiteUrl: 'https://www.suninternational.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.suninternational.com/specials', 'https://www.suninternational.com/deals'] },
  { name: 'Protea Hotels', websiteUrl: 'https://www.marriott.com/protea-hotels', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com/protea-hotels/hotel-deals'] },
  { name: 'City Lodge', websiteUrl: 'https://www.clhg.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.clhg.com/specials'] },
  { name: 'Tsogo Sun Hotels', websiteUrl: 'https://www.tsogosun.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tsogosun.com/specials', 'https://www.tsogosun.com/deals'] },
  { name: 'Uber ZA', websiteUrl: 'https://www.uber.com/za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/za/en/ride/'] },
  { name: 'Bolt ZA', websiteUrl: 'https://bolt.eu/en-za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://bolt.eu/en-za/deals/'] },
  { name: 'Europcar ZA', websiteUrl: 'https://www.europcar.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.co.za/deals'] },
  { name: 'Avis ZA', websiteUrl: 'https://www.avis.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avis.co.za/specials'] },
  { name: 'Hertz ZA', websiteUrl: 'https://www.hertz.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.co.za/specials'] },
  { name: 'Budget ZA', websiteUrl: 'https://www.budget.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.budget.co.za/specials'] },
  { name: 'Tempest Car Hire', websiteUrl: 'https://www.tempestcarhire.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tempestcarhire.co.za/specials'] },
  { name: 'Greyhound', websiteUrl: 'https://www.greyhound.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.greyhound.co.za/specials'] },
  { name: 'Intercape', websiteUrl: 'https://www.intercape.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.intercape.co.za/specials', 'https://www.intercape.co.za/deals'] },
  { name: 'Gautrain', websiteUrl: 'https://www.gautrain.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.gautrain.co.za/promotions'] },
  { name: 'LekkeSlaap', websiteUrl: 'https://www.lekkeslaap.co.za', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lekkeslaap.co.za/specials'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'FNB', websiteUrl: 'https://www.fnb.co.za', categorySlug: 'finans', seedUrls: ['https://www.fnb.co.za/deals', 'https://www.fnb.co.za/promotions'] },
  { name: 'Standard Bank', websiteUrl: 'https://www.standardbank.co.za', categorySlug: 'finans', seedUrls: ['https://www.standardbank.co.za/promotions', 'https://www.standardbank.co.za/deals'] },
  { name: 'Absa', websiteUrl: 'https://www.absa.co.za', categorySlug: 'finans', seedUrls: ['https://www.absa.co.za/deals', 'https://www.absa.co.za/promotions'] },
  { name: 'Nedbank', websiteUrl: 'https://www.nedbank.co.za', categorySlug: 'finans', seedUrls: ['https://www.nedbank.co.za/promotions', 'https://www.nedbank.co.za/deals'] },
  { name: 'Capitec', websiteUrl: 'https://www.capitecbank.co.za', categorySlug: 'finans', seedUrls: ['https://www.capitecbank.co.za/promotions', 'https://www.capitecbank.co.za/deals'] },
  { name: 'Discovery Bank', websiteUrl: 'https://www.discovery.co.za', categorySlug: 'finans', seedUrls: ['https://www.discovery.co.za/bank/deals', 'https://www.discovery.co.za/bank/promotions'] },
  { name: 'TymeBank', websiteUrl: 'https://www.tymebank.co.za', categorySlug: 'finans', seedUrls: ['https://www.tymebank.co.za/deals', 'https://www.tymebank.co.za/promotions'] },
  { name: 'Bank Zero', websiteUrl: 'https://www.bankzero.co.za', categorySlug: 'finans', seedUrls: ['https://www.bankzero.co.za/promotions'] },
  { name: 'African Bank', websiteUrl: 'https://www.africanbank.co.za', categorySlug: 'finans', seedUrls: ['https://www.africanbank.co.za/promotions'] },
  { name: 'Investec ZA', websiteUrl: 'https://www.investec.com/en_za', categorySlug: 'finans', seedUrls: ['https://www.investec.com/en_za/welcome-to-investec/promotions.html'] },
  { name: 'Visa ZA', websiteUrl: 'https://www.visa.co.za', categorySlug: 'finans', seedUrls: ['https://www.visa.co.za/pay-with-visa/offers-and-promotions.html'] },
  { name: 'Mastercard ZA', websiteUrl: 'https://www.mastercard.co.za', categorySlug: 'finans', seedUrls: ['https://www.mastercard.co.za/en-za/consumers/offers-promotions.html'] },
  { name: 'American Express ZA', websiteUrl: 'https://www.americanexpress.com/za', categorySlug: 'finans', seedUrls: ['https://www.americanexpress.com/za/offers/'] },
  { name: 'RCS', websiteUrl: 'https://www.rfrancq.co.za', categorySlug: 'finans', seedUrls: ['https://www.rfrancq.co.za/promotions'] },
  { name: 'Woolworths Financial', websiteUrl: 'https://www.woolworths.co.za', categorySlug: 'finans', seedUrls: ['https://www.woolworths.co.za/financial-services/deals'] },
  { name: 'Wonga ZA', websiteUrl: 'https://www.wonga.co.za', categorySlug: 'finans', seedUrls: ['https://www.wonga.co.za/promotions'] },
  { name: 'Old Mutual Bank', websiteUrl: 'https://www.oldmutual.co.za', categorySlug: 'finans', seedUrls: ['https://www.oldmutual.co.za/personal/offers/'] },
  { name: 'Sanlam Bank', websiteUrl: 'https://www.sanlam.co.za', categorySlug: 'finans', seedUrls: ['https://www.sanlam.co.za/promotions'] },
  { name: 'PayFast', websiteUrl: 'https://www.payfast.co.za', categorySlug: 'finans', seedUrls: ['https://www.payfast.co.za/promotions'] },
  { name: 'Ozow', websiteUrl: 'https://www.ozow.com', categorySlug: 'finans', seedUrls: ['https://www.ozow.com/promotions'] },
  { name: 'SnapScan', websiteUrl: 'https://www.snapscan.co.za', categorySlug: 'finans', seedUrls: ['https://www.snapscan.co.za/deals'] },
  { name: 'Zapper', websiteUrl: 'https://www.zapper.com', categorySlug: 'finans', seedUrls: ['https://www.zapper.com/deals'] },
  { name: 'Easy Equities', websiteUrl: 'https://www.easyequities.co.za', categorySlug: 'finans', seedUrls: ['https://www.easyequities.co.za/promotions'] },
  { name: 'Satrix', websiteUrl: 'https://www.satrix.co.za', categorySlug: 'finans', seedUrls: ['https://www.satrix.co.za/promotions'] },
  { name: 'FedGroup', websiteUrl: 'https://www.fedgroup.co.za', categorySlug: 'finans', seedUrls: ['https://www.fedgroup.co.za/promotions'] },
  { name: 'Luno ZA', websiteUrl: 'https://www.luno.com/en/za', categorySlug: 'finans', seedUrls: ['https://www.luno.com/en/za/promotions'] },
  { name: 'VALR', websiteUrl: 'https://www.valr.com', categorySlug: 'finans', seedUrls: ['https://www.valr.com/promotions'] },
  { name: 'Allan Gray', websiteUrl: 'https://www.allangray.co.za', categorySlug: 'finans', seedUrls: ['https://www.allangray.co.za/offers/'] },
  { name: 'Coronation', websiteUrl: 'https://www.coronation.com', categorySlug: 'finans', seedUrls: ['https://www.coronation.com/promotions'] },
  { name: 'PSG Konsult', websiteUrl: 'https://www.psg.co.za', categorySlug: 'finans', seedUrls: ['https://www.psg.co.za/promotions'] },
  { name: 'Bidvest Bank', websiteUrl: 'https://www.bidvestbank.co.za', categorySlug: 'finans', seedUrls: ['https://www.bidvestbank.co.za/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Discovery', websiteUrl: 'https://www.discovery.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.discovery.co.za/portal/deals', 'https://www.discovery.co.za/portal/promotions'] },
  { name: 'Old Mutual', websiteUrl: 'https://www.oldmutual.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.oldmutual.co.za/personal/offers/', 'https://www.oldmutual.co.za/personal/promotions/'] },
  { name: 'Sanlam', websiteUrl: 'https://www.sanlam.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.sanlam.co.za/promotions', 'https://www.sanlam.co.za/deals'] },
  { name: 'OUTsurance', websiteUrl: 'https://www.outsurance.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.outsurance.co.za/promotions', 'https://www.outsurance.co.za/deals'] },
  { name: 'Hollard', websiteUrl: 'https://www.hollard.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.hollard.co.za/promotions'] },
  { name: 'Santam', websiteUrl: 'https://www.santam.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.santam.co.za/promotions'] },
  { name: 'Momentum', websiteUrl: 'https://www.momentum.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.momentum.co.za/promotions', 'https://www.momentum.co.za/deals'] },
  { name: 'Liberty', websiteUrl: 'https://www.liberty.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.liberty.co.za/promotions'] },
  { name: 'MiWay', websiteUrl: 'https://www.miway.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.miway.co.za/promotions', 'https://www.miway.co.za/deals'] },
  { name: 'Dialdirect', websiteUrl: 'https://www.dialdirect.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.dialdirect.co.za/promotions'] },
  { name: 'King Price', websiteUrl: 'https://www.kingprice.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.kingprice.co.za/promotions'] },
  { name: 'First for Women', websiteUrl: 'https://www.firstforwomen.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.firstforwomen.co.za/promotions'] },
  { name: 'Budget Insurance', websiteUrl: 'https://www.budgetinsurance.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.budgetinsurance.co.za/promotions'] },
  { name: 'Auto & General', websiteUrl: 'https://www.autoandgeneral.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.autoandgeneral.co.za/promotions'] },
  { name: 'Zurich ZA', websiteUrl: 'https://www.zurich.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.co.za/promotions'] },
  { name: 'Allianz ZA', websiteUrl: 'https://www.allianz.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.co.za/promotions'] },
  { name: 'Clientele', websiteUrl: 'https://www.clientele.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.clientele.co.za/promotions'] },
  { name: 'Bryte Insurance', websiteUrl: 'https://www.bryte.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.bryte.co.za/promotions'] },
  { name: 'Guardrisk', websiteUrl: 'https://www.guardrisk.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.guardrisk.co.za/promotions'] },
  { name: 'Discovery Health', websiteUrl: 'https://www.discovery.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.discovery.co.za/medical-aid/deals'] },
  { name: 'Bonitas', websiteUrl: 'https://www.bonitas.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.bonitas.co.za/promotions'] },
  { name: 'Medihelp', websiteUrl: 'https://www.medihelp.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.medihelp.co.za/promotions'] },
  { name: 'Bestmed', websiteUrl: 'https://www.bestmed.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.bestmed.co.za/promotions'] },
  { name: 'GEMS', websiteUrl: 'https://www.gems.gov.za', categorySlug: 'sigorta', seedUrls: ['https://www.gems.gov.za/promotions'] },
  { name: 'Fedhealth', websiteUrl: 'https://www.fedhealth.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.fedhealth.co.za/promotions'] },
  { name: 'Profmed', websiteUrl: 'https://www.profmed.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.profmed.co.za/promotions'] },
  { name: 'Vitality', websiteUrl: 'https://www.discovery.co.za/vitality', categorySlug: 'sigorta', seedUrls: ['https://www.discovery.co.za/vitality/deals', 'https://www.discovery.co.za/vitality/promotions'] },
  { name: 'PPS', websiteUrl: 'https://www.pps.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.pps.co.za/promotions'] },
  { name: 'Assupol', websiteUrl: 'https://www.assupol.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.assupol.co.za/promotions'] },
  { name: 'Metropolitan', websiteUrl: 'https://www.metropolitan.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.metropolitan.co.za/promotions'] },
  { name: 'Absa Insurance', websiteUrl: 'https://www.absa.co.za', categorySlug: 'sigorta', seedUrls: ['https://www.absa.co.za/insurance/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota ZA', websiteUrl: 'https://www.toyota.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.co.za/deals', 'https://www.toyota.co.za/specials'] },
  { name: 'Volkswagen ZA', websiteUrl: 'https://www.vw.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.vw.co.za/en/offers.html'] },
  { name: 'Ford ZA', websiteUrl: 'https://www.ford.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.ford.co.za/deals/', 'https://www.ford.co.za/offers/'] },
  { name: 'Hyundai ZA', websiteUrl: 'https://www.hyundai.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.co.za/deals', 'https://www.hyundai.co.za/specials'] },
  { name: 'Suzuki ZA', websiteUrl: 'https://www.suzukiauto.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.suzukiauto.co.za/deals', 'https://www.suzukiauto.co.za/specials'] },
  { name: 'Nissan ZA', websiteUrl: 'https://www.nissan.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.co.za/deals.html'] },
  { name: 'Kia ZA', websiteUrl: 'https://www.kia.com/za', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/za/offers/'] },
  { name: 'Honda ZA', websiteUrl: 'https://www.honda.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.honda.co.za/deals'] },
  { name: 'BMW ZA', websiteUrl: 'https://www.bmw.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.co.za/en/offers.html'] },
  { name: 'Mercedes-Benz ZA', websiteUrl: 'https://www.mercedes-benz.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.co.za/passengercars/campaigns.html'] },
  { name: 'Audi ZA', websiteUrl: 'https://www.audi.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.audi.co.za/za/web/en/offers.html'] },
  { name: 'Mazda ZA', websiteUrl: 'https://www.mazda.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.co.za/deals'] },
  { name: 'Renault ZA', websiteUrl: 'https://www.renault.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.renault.co.za/deals.html'] },
  { name: 'Peugeot ZA', websiteUrl: 'https://www.peugeot.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.co.za/deals.html'] },
  { name: 'Citroën ZA', websiteUrl: 'https://www.citroen.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.co.za/deals.html'] },
  { name: 'Chevrolet ZA', websiteUrl: 'https://www.chevrolet.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.co.za/deals'] },
  { name: 'Mitsubishi ZA', websiteUrl: 'https://www.mitsubishi-motors.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.co.za/deals'] },
  { name: 'Volvo ZA', websiteUrl: 'https://www.volvocars.com/za', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/za/offers/'] },
  { name: 'Land Rover ZA', websiteUrl: 'https://www.landrover.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.landrover.co.za/offers.html'] },
  { name: 'Jaguar ZA', websiteUrl: 'https://www.jaguar.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.jaguar.co.za/offers.html'] },
  { name: 'Jeep ZA', websiteUrl: 'https://www.jeep.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.co.za/deals'] },
  { name: 'Isuzu ZA', websiteUrl: 'https://www.isuzu.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.isuzu.co.za/deals'] },
  { name: 'Haval ZA', websiteUrl: 'https://www.haval.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.haval.co.za/deals'] },
  { name: 'Chery ZA', websiteUrl: 'https://www.chery.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.chery.co.za/deals'] },
  { name: 'GWM ZA', websiteUrl: 'https://www.gwm.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.gwm.co.za/deals'] },
  { name: 'Engen', websiteUrl: 'https://www.engen.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.engen.co.za/promotions'] },
  { name: 'Shell ZA', websiteUrl: 'https://www.shell.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.shell.co.za/motorists/promotions.html'] },
  { name: 'Sasol', websiteUrl: 'https://www.sasol.com', categorySlug: 'otomobil', seedUrls: ['https://www.sasol.com/promotions'] },
  { name: 'Bridgestone ZA', websiteUrl: 'https://www.bridgestone.co.za', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestone.co.za/promotions'] },
  { name: 'Tiger Wheel & Tyre', websiteUrl: 'https://www.twt.to', categorySlug: 'otomobil', seedUrls: ['https://www.twt.to/specials'] },
  { name: 'Supa Quick', websiteUrl: 'https://www.supaquick.com', categorySlug: 'otomobil', seedUrls: ['https://www.supaquick.com/specials'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Exclusive Books', websiteUrl: 'https://www.exclusivebooks.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.exclusivebooks.co.za/specials', 'https://www.exclusivebooks.co.za/deals'] },
  { name: 'Takealot Books', websiteUrl: 'https://www.takealot.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.takealot.com/books/deals'] },
  { name: 'Loot Books', websiteUrl: 'https://www.loot.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.loot.co.za/books/deals'] },
  { name: 'CNA', websiteUrl: 'https://www.cna.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cna.co.za/specials', 'https://www.cna.co.za/deals'] },
  { name: 'Bargain Books', websiteUrl: 'https://www.bargainbooks.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bargainbooks.co.za/specials'] },
  { name: 'Protea Bookshop', websiteUrl: 'https://www.proteabookshop.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.proteabookshop.co.za/specials'] },
  { name: 'Netflix ZA', websiteUrl: 'https://www.netflix.com/za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/za/'] },
  { name: 'Disney+ ZA', websiteUrl: 'https://www.disneyplus.com/za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/za/'] },
  { name: 'Showmax ZA', websiteUrl: 'https://www.showmax.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.showmax.com/eng/deals'] },
  { name: 'Spotify ZA', websiteUrl: 'https://www.spotify.com/za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/za/premium/'] },
  { name: 'Amazon Prime ZA', websiteUrl: 'https://www.primevideo.com/region/za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.primevideo.com/region/za/'] },
  { name: 'Apple Music ZA', websiteUrl: 'https://www.apple.com/za/apple-music', categorySlug: 'kitap-hobi', seedUrls: ['https://www.apple.com/za/apple-music/'] },
  { name: 'PlayStation ZA', websiteUrl: 'https://store.playstation.com/en-za', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/en-za/category/deals'] },
  { name: 'Xbox ZA', websiteUrl: 'https://www.xbox.com/en-ZA', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/en-ZA/games/sales-and-specials'] },
  { name: 'Nintendo ZA', websiteUrl: 'https://www.nintendo.com/en-za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/en-za/store/deals/'] },
  { name: 'Steam ZA', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Lego ZA', websiteUrl: 'https://www.lego.com/en-za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/en-za/categories/sales-and-deals'] },
  { name: 'Hasbro ZA', websiteUrl: 'https://shop.hasbro.com/en-za', categorySlug: 'kitap-hobi', seedUrls: ['https://shop.hasbro.com/en-za/sale'] },
  { name: 'Toys R Us ZA', websiteUrl: 'https://www.toysrus.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.co.za/specials', 'https://www.toysrus.co.za/deals'] },
  { name: 'Ster-Kinekor', websiteUrl: 'https://www.sterkinekor.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.sterkinekor.com/specials'] },
  { name: 'Nu Metro', websiteUrl: 'https://www.numetro.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.numetro.co.za/specials'] },
  { name: 'Computicket', websiteUrl: 'https://www.computicket.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.computicket.com/deals'] },
  { name: 'Webtickets', websiteUrl: 'https://www.webtickets.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.webtickets.co.za/deals'] },
  { name: 'Orms', websiteUrl: 'https://www.ormsdirect.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ormsdirect.co.za/specials'] },
  { name: 'Hobby X', websiteUrl: 'https://www.hobbyx.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbyx.co.za/specials'] },
  { name: 'Dion Wired', websiteUrl: 'https://www.dionwired.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.dionwired.co.za/specials'] },
  { name: 'Audible ZA', websiteUrl: 'https://www.audible.com/za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.com/za/deals'] },
  { name: 'Kindle ZA', websiteUrl: 'https://www.amazon.co.za/kindle-store', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.co.za/kindle-store/deals'] },
  { name: 'Udemy ZA', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=en&src=ukw&q=deals'] },
  { name: 'Coursera ZA', websiteUrl: 'https://www.coursera.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coursera.org/deals'] },
  { name: 'BidOrBuy', websiteUrl: 'https://www.bidorbuy.co.za', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bidorbuy.co.za/specials', 'https://www.bidorbuy.co.za/deals'] },
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
  console.log('=== ZA Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'ZA' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'ZA', categoryId: category.id },
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
            market: 'ZA',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'ZA' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'ZA', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active ZA sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
