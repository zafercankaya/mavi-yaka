import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── Slug generator ──────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Brand entry type ──────────────────────────────────────
interface BrandEntry {
  name: string;
  websiteUrl: string;
  categorySlug: string;
  seedUrls: string[];
}

// ── Category English name mapping ─────────────────────────
const CATEGORY_NAME_EN: Record<string, string> = {
  'alisveris': 'Shopping',
  'elektronik': 'Electronics',
  'giyim-moda': 'Clothing & Fashion',
  'gida-market': 'Grocery & Market',
  'yeme-icme': 'Food & Dining',
  'kozmetik-kisisel-bakim': 'Health & Beauty',
  'ev-yasam': 'Home & Living',
  'spor-outdoor': 'Sports & Outdoor',
  'seyahat-ulasim': 'Travel & Tourism',
  'finans': 'Finance',
  'sigorta': 'Education',
  'otomobil': 'Automotive',
  'kitap-hobi': 'Books & Hobbies',
};

// ── ALL JP BRANDS DATA ───────────────────────────────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Rakuten Ichiba', websiteUrl: 'https://www.rakuten.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.rakuten.co.jp/event/', 'https://www.rakuten.co.jp/campaign/'] },
  { name: 'Amazon Japan', websiteUrl: 'https://www.amazon.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.co.jp/deals', 'https://www.amazon.co.jp/gp/goldbox'] },
  { name: 'Yahoo Shopping Japan', websiteUrl: 'https://shopping.yahoo.co.jp', categorySlug: 'alisveris', seedUrls: ['https://shopping.yahoo.co.jp/promotion/campaign/', 'https://shopping.yahoo.co.jp/event/sale/'] },
  { name: 'PayPay Mall', websiteUrl: 'https://paypaymall.yahoo.co.jp', categorySlug: 'alisveris', seedUrls: ['https://paypaymall.yahoo.co.jp/event/'] },
  { name: 'Mercari', websiteUrl: 'https://www.mercari.com/jp', categorySlug: 'alisveris', seedUrls: ['https://jp.mercari.com/campaign/'] },
  { name: 'ZOZOTOWN', websiteUrl: 'https://zozo.jp', categorySlug: 'alisveris', seedUrls: ['https://zozo.jp/sale/', 'https://zozo.jp/event/'] },
  { name: 'Qoo10 Japan', websiteUrl: 'https://www.qoo10.jp', categorySlug: 'alisveris', seedUrls: ['https://www.qoo10.jp/gmkt.inc/Event/'] },
  { name: 'au PAY Market', websiteUrl: 'https://wowma.jp', categorySlug: 'alisveris', seedUrls: ['https://wowma.jp/event/', 'https://wowma.jp/campaign/'] },
  { name: 'Dinos', websiteUrl: 'https://www.dinos.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.dinos.co.jp/campaign/', 'https://www.dinos.co.jp/sale/'] },
  { name: 'Bellemaison', websiteUrl: 'https://www.bellemaison.jp', categorySlug: 'alisveris', seedUrls: ['https://www.bellemaison.jp/campaign/', 'https://www.bellemaison.jp/sale/'] },
  { name: 'Cecile', websiteUrl: 'https://www.cecile.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.cecile.co.jp/sale/'] },
  { name: 'Felissimo', websiteUrl: 'https://www.felissimo.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.felissimo.co.jp/campaign/'] },
  { name: 'Nissen', websiteUrl: 'https://www.nissen.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.nissen.co.jp/sale/', 'https://www.nissen.co.jp/campaign/'] },
  { name: 'Shop Japan', websiteUrl: 'https://www.shopjapan.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.shopjapan.co.jp/campaign/'] },
  { name: 'Lohaco', websiteUrl: 'https://lohaco.yahoo.co.jp', categorySlug: 'alisveris', seedUrls: ['https://lohaco.yahoo.co.jp/event/', 'https://lohaco.yahoo.co.jp/campaign/'] },
  { name: 'Kojima Online', websiteUrl: 'https://www.kojima.net', categorySlug: 'alisveris', seedUrls: ['https://www.kojima.net/ec/campaign/'] },
  { name: 'Japanet Takata', websiteUrl: 'https://www.japanet.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.japanet.co.jp/shopping/campaign/'] },
  { name: 'Rakuma', websiteUrl: 'https://fril.jp', categorySlug: 'alisveris', seedUrls: ['https://fril.jp/campaign/'] },
  { name: 'Yahoo Auctions Japan', websiteUrl: 'https://auctions.yahoo.co.jp', categorySlug: 'alisveris', seedUrls: ['https://auctions.yahoo.co.jp/topic/promo/'] },
  { name: 'Murauchi', websiteUrl: 'https://www.murauchi.com', categorySlug: 'alisveris', seedUrls: ['https://www.murauchi.com/MCJ-front-web/CoD/campaign/'] },
  { name: 'Oisix', websiteUrl: 'https://www.oisix.com', categorySlug: 'alisveris', seedUrls: ['https://www.oisix.com/OtameshiTouroku.lp.g6--top--top-shinki_dOisix__html.htm'] },
  { name: 'Askul', websiteUrl: 'https://www.askul.co.jp', categorySlug: 'alisveris', seedUrls: ['https://www.askul.co.jp/event/', 'https://www.askul.co.jp/campaign/'] },
  { name: 'Monotaro', websiteUrl: 'https://www.monotaro.com', categorySlug: 'alisveris', seedUrls: ['https://www.monotaro.com/campaign/'] },
  { name: 'Cainz Online', websiteUrl: 'https://www.cainz.com', categorySlug: 'alisveris', seedUrls: ['https://www.cainz.com/campaign/'] },
  { name: 'DCM Online', websiteUrl: 'https://www.dcm-ekurashi.com', categorySlug: 'alisveris', seedUrls: ['https://www.dcm-ekurashi.com/campaign/'] },
  { name: 'Yodobashi.com', websiteUrl: 'https://www.yodobashi.com', categorySlug: 'alisveris', seedUrls: ['https://www.yodobashi.com/ec/campaign/'] },
  { name: 'Biccamera.com', websiteUrl: 'https://www.biccamera.com', categorySlug: 'alisveris', seedUrls: ['https://www.biccamera.com/bc/c/sale/'] },
  { name: 'Joshin Web', websiteUrl: 'https://joshinweb.jp', categorySlug: 'alisveris', seedUrls: ['https://joshinweb.jp/event/'] },
  { name: 'Sofmap', websiteUrl: 'https://www.sofmap.com', categorySlug: 'alisveris', seedUrls: ['https://www.sofmap.com/campaign/'] },
  { name: 'Tower Records Online', websiteUrl: 'https://tower.jp', categorySlug: 'alisveris', seedUrls: ['https://tower.jp/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Yodobashi Camera', websiteUrl: 'https://www.yodobashi.com', categorySlug: 'elektronik', seedUrls: ['https://www.yodobashi.com/ec/campaign/', 'https://www.yodobashi.com/ec/store/bargain/'] },
  { name: 'Bic Camera', websiteUrl: 'https://www.biccamera.com', categorySlug: 'elektronik', seedUrls: ['https://www.biccamera.com/bc/c/sale/', 'https://www.biccamera.com/bc/c/campaign/'] },
  { name: 'Ks Denki', websiteUrl: 'https://www.ksdenki.com', categorySlug: 'elektronik', seedUrls: ['https://www.ksdenki.com/shop/campaign/'] },
  { name: 'Joshin', websiteUrl: 'https://www.joshin.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.joshin.co.jp/event/', 'https://joshinweb.jp/event/'] },
  { name: 'Yamada Denki', websiteUrl: 'https://www.yamada-denki.jp', categorySlug: 'elektronik', seedUrls: ['https://www.yamada-denkiweb.com/event/', 'https://www.yamada-denkiweb.com/campaign/'] },
  { name: 'Nojima', websiteUrl: 'https://www.nojima.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.nojima.co.jp/campaign/', 'https://online.nojima.co.jp/campaign/'] },
  { name: 'Edion', websiteUrl: 'https://www.edion.com', categorySlug: 'elektronik', seedUrls: ['https://www.edion.com/campaign/', 'https://www.edion.com/sale/'] },
  { name: 'Sony Japan', websiteUrl: 'https://www.sony.jp', categorySlug: 'elektronik', seedUrls: ['https://www.sony.jp/campaign/', 'https://store.sony.jp/campaign/'] },
  { name: 'Panasonic Japan', websiteUrl: 'https://www.panasonic.com/jp', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/jp/campaign.html', 'https://ec-plus.panasonic.jp/store/campaign/'] },
  { name: 'Sharp Japan', websiteUrl: 'https://jp.sharp', categorySlug: 'elektronik', seedUrls: ['https://jp.sharp/campaign/', 'https://cocorostore.sharp.co.jp/campaign/'] },
  { name: 'Toshiba Lifestyle', websiteUrl: 'https://www.toshiba-lifestyle.com', categorySlug: 'elektronik', seedUrls: ['https://www.toshiba-lifestyle.com/jp/campaign/'] },
  { name: 'Hitachi', websiteUrl: 'https://www.hitachi.co.jp', categorySlug: 'elektronik', seedUrls: ['https://kadenfan.hitachi.co.jp/campaign/'] },
  { name: 'Dyson Japan', websiteUrl: 'https://www.dyson.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.co.jp/offers', 'https://www.dyson.co.jp/campaign/'] },
  { name: 'Apple Japan', websiteUrl: 'https://www.apple.com/jp', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/jp/shop/go/campaigns'] },
  { name: 'Canon Japan', websiteUrl: 'https://cweb.canon.jp', categorySlug: 'elektronik', seedUrls: ['https://cweb.canon.jp/campaign/', 'https://store.canon.jp/online/campaign/'] },
  { name: 'Nikon Japan', websiteUrl: 'https://www.nikon-image.com/jpn', categorySlug: 'elektronik', seedUrls: ['https://www.nikon-image.com/jpn/event/campaign/'] },
  { name: 'Fujifilm Japan', websiteUrl: 'https://www.fujifilm.com/jp', categorySlug: 'elektronik', seedUrls: ['https://www.fujifilm.com/jp/ja/campaign/'] },
  { name: 'Buffalo Japan', websiteUrl: 'https://www.buffalo.jp', categorySlug: 'elektronik', seedUrls: ['https://www.buffalo.jp/campaign/'] },
  { name: 'IO Data', websiteUrl: 'https://www.iodata.jp', categorySlug: 'elektronik', seedUrls: ['https://www.iodata.jp/campaign/'] },
  { name: 'Elecom', websiteUrl: 'https://www.elecom.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.elecom.co.jp/campaign/'] },
  { name: 'Epson Japan', websiteUrl: 'https://www.epson.jp', categorySlug: 'elektronik', seedUrls: ['https://www.epson.jp/campaign/', 'https://shop.epson.jp/campaign/'] },
  { name: 'Brother Japan', websiteUrl: 'https://www.brother.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.brother.co.jp/campaign/'] },
  { name: 'Daikin Japan', websiteUrl: 'https://www.daikin.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.daikin.co.jp/campaign/'] },
  { name: 'Mitsubishi Electric', websiteUrl: 'https://www.mitsubishielectric.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.mitsubishielectric.co.jp/home/campaign/'] },
  { name: 'Bose Japan', websiteUrl: 'https://www.bose.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.bose.co.jp/ja_jp/offers.html'] },
  { name: 'JBL Japan', websiteUrl: 'https://jp.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://jp.jbl.com/sale.html'] },
  { name: 'Dell Japan', websiteUrl: 'https://www.dell.com/ja-jp', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/ja-jp/lp/deals'] },
  { name: 'Lenovo Japan', websiteUrl: 'https://www.lenovo.com/jp/ja', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/jp/ja/d/deals/'] },
  { name: 'HP Japan', websiteUrl: 'https://www.hp.com/jp-ja', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/jp-ja/shop/campaign.aspx'] },
  { name: 'Mouse Computer', websiteUrl: 'https://www.mouse-jp.co.jp', categorySlug: 'elektronik', seedUrls: ['https://www.mouse-jp.co.jp/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'UNIQLO Japan', websiteUrl: 'https://www.uniqlo.com/jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/jp/ja/spl/sale/', 'https://www.uniqlo.com/jp/ja/campaign/'] },
  { name: 'GU Japan', websiteUrl: 'https://www.gu-global.com/jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.gu-global.com/jp/ja/feature/sale/'] },
  { name: 'ZOZOTOWN Fashion', websiteUrl: 'https://zozo.jp', categorySlug: 'giyim-moda', seedUrls: ['https://zozo.jp/sale/', 'https://zozo.jp/event/'] },
  { name: 'BEAMS', websiteUrl: 'https://www.beams.co.jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.beams.co.jp/sale/', 'https://www.beams.co.jp/campaign/'] },
  { name: 'United Arrows', websiteUrl: 'https://store.united-arrows.co.jp', categorySlug: 'giyim-moda', seedUrls: ['https://store.united-arrows.co.jp/sale/', 'https://store.united-arrows.co.jp/campaign/'] },
  { name: 'Muji Fashion', websiteUrl: 'https://www.muji.com/jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.muji.com/jp/ja/campaign/', 'https://www.muji.com/jp/ja/feature/clothing/'] },
  { name: 'Shimamura', websiteUrl: 'https://www.shimamura.gr.jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.shimamura.gr.jp/shimamura/campaign/'] },
  { name: 'Right-on', websiteUrl: 'https://right-on.co.jp', categorySlug: 'giyim-moda', seedUrls: ['https://right-on.co.jp/campaign/', 'https://right-on.co.jp/sale/'] },
  { name: 'Adidas Japan', websiteUrl: 'https://www.adidas.jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.jp/sale', 'https://www.adidas.jp/campaign'] },
  { name: 'Nike Japan', websiteUrl: 'https://www.nike.com/jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/jp/w/sale', 'https://www.nike.com/jp/w/campaign'] },
  { name: 'ZARA Japan', websiteUrl: 'https://www.zara.com/jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/jp/ja/z-sale-l1702.html'] },
  { name: 'H&M Japan', websiteUrl: 'https://www2.hm.com/ja_jp', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/ja_jp/sale.html', 'https://www2.hm.com/ja_jp/campaign.html'] },
  { name: 'GAP Japan', websiteUrl: 'https://www.gap.co.jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.gap.co.jp/browse/promo.do'] },
  { name: 'Onward Kashiyama', websiteUrl: 'https://crosset.onward.co.jp', categorySlug: 'giyim-moda', seedUrls: ['https://crosset.onward.co.jp/sale/', 'https://crosset.onward.co.jp/campaign/'] },
  { name: 'World Online Store', websiteUrl: 'https://store.world.co.jp', categorySlug: 'giyim-moda', seedUrls: ['https://store.world.co.jp/sale/', 'https://store.world.co.jp/campaign/'] },
  { name: 'Baycrews', websiteUrl: 'https://baycrews.jp', categorySlug: 'giyim-moda', seedUrls: ['https://baycrews.jp/sale/', 'https://baycrews.jp/campaign/'] },
  { name: 'SHIPS', websiteUrl: 'https://www.shipsltd.co.jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.shipsltd.co.jp/sale/', 'https://www.shipsltd.co.jp/campaign/'] },
  { name: 'Urban Research', websiteUrl: 'https://www.urban-research.jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.urban-research.jp/sale/', 'https://www.urban-research.jp/campaign/'] },
  { name: 'Nano Universe', websiteUrl: 'https://store.nanouniverse.jp', categorySlug: 'giyim-moda', seedUrls: ['https://store.nanouniverse.jp/sale/', 'https://store.nanouniverse.jp/campaign/'] },
  { name: 'Journal Standard', websiteUrl: 'https://journal-standard.jp', categorySlug: 'giyim-moda', seedUrls: ['https://journal-standard.jp/sale/'] },
  { name: 'ABC-Mart Fashion', websiteUrl: 'https://www.abc-mart.net', categorySlug: 'giyim-moda', seedUrls: ['https://www.abc-mart.net/shop/campaign/', 'https://www.abc-mart.net/shop/sale/'] },
  { name: 'Comme Ca Ism', websiteUrl: 'https://online.fivefoxes.co.jp', categorySlug: 'giyim-moda', seedUrls: ['https://online.fivefoxes.co.jp/sale/'] },
  { name: 'Global Work', websiteUrl: 'https://www.dot-st.com/globalwork', categorySlug: 'giyim-moda', seedUrls: ['https://www.dot-st.com/globalwork/sale/'] },
  { name: 'Lowrys Farm', websiteUrl: 'https://www.dot-st.com/lowrysfarm', categorySlug: 'giyim-moda', seedUrls: ['https://www.dot-st.com/lowrysfarm/sale/'] },
  { name: 'Niko and', websiteUrl: 'https://www.dot-st.com/nikoand', categorySlug: 'giyim-moda', seedUrls: ['https://www.dot-st.com/nikoand/sale/'] },
  { name: 'Earth Music Ecology', websiteUrl: 'https://www.stripe-club.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.stripe-club.com/sale/'] },
  { name: 'Snidel', websiteUrl: 'https://snidel.com', categorySlug: 'giyim-moda', seedUrls: ['https://snidel.com/sale/', 'https://usagi-online.com/sale/'] },
  { name: 'Issey Miyake', websiteUrl: 'https://www.isseymiyake.com/ja', categorySlug: 'giyim-moda', seedUrls: ['https://www.isseymiyake.com/ja/news/'] },
  { name: 'Comme des Garcons', websiteUrl: 'https://www.comme-des-garcons.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.comme-des-garcons.com/news/'] },
  { name: 'Asics Japan', websiteUrl: 'https://www.asics.com/jp', categorySlug: 'giyim-moda', seedUrls: ['https://www.asics.com/jp/ja-jp/mk/sale', 'https://www.asics.com/jp/ja-jp/mk/campaign'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Groceries — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Aeon', websiteUrl: 'https://www.aeon.com', categorySlug: 'gida-market', seedUrls: ['https://www.aeon.com/campaign/', 'https://chirashi.otoku.aeonsquare.net/'] },
  { name: 'Ito-Yokado', websiteUrl: 'https://www.itoyokado.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.itoyokado.co.jp/special/campaign/', 'https://www.itoyokado.co.jp/special/sale/'] },
  { name: 'Seiyu', websiteUrl: 'https://www.seiyu.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.seiyu.co.jp/campaign/'] },
  { name: 'Life Supermarket', websiteUrl: 'https://www.lifecorp.jp', categorySlug: 'gida-market', seedUrls: ['https://www.lifecorp.jp/campaign/'] },
  { name: 'Costco Japan', websiteUrl: 'https://www.costco.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.costco.co.jp/campaign', 'https://www.costco.co.jp/warehouse-hot-buys'] },
  { name: 'OK Store', websiteUrl: 'https://ok-corporation.jp', categorySlug: 'gida-market', seedUrls: ['https://ok-corporation.jp/campaign/'] },
  { name: 'Summit Store', websiteUrl: 'https://www.summitstore.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.summitstore.co.jp/campaign/'] },
  { name: 'Yaoko', websiteUrl: 'https://www.yaoko-net.com', categorySlug: 'gida-market', seedUrls: ['https://www.yaoko-net.com/campaign/'] },
  { name: 'Maruetsu', websiteUrl: 'https://www.maruetsu.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.maruetsu.co.jp/campaign/'] },
  { name: 'Daiei', websiteUrl: 'https://www.daiei.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.daiei.co.jp/campaign/'] },
  { name: 'MaxValu', websiteUrl: 'https://www.maxvalu.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.maxvalu.co.jp/campaign/'] },
  { name: 'Lawson', websiteUrl: 'https://www.lawson.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.lawson.co.jp/campaign/', 'https://www.lawson.co.jp/recommend/'] },
  { name: 'Seven-Eleven Japan', websiteUrl: 'https://www.sej.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.sej.co.jp/campaign/', 'https://www.sej.co.jp/products/fair/'] },
  { name: 'FamilyMart', websiteUrl: 'https://www.family.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.family.co.jp/campaign/', 'https://www.family.co.jp/goods/fair/'] },
  { name: 'Ministop', websiteUrl: 'https://www.ministop.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.ministop.co.jp/campaign/'] },
  { name: 'Don Quijote', websiteUrl: 'https://www.donki.com', categorySlug: 'gida-market', seedUrls: ['https://www.donki.com/campaign/', 'https://www.donki.com/tokushu/'] },
  { name: 'Gyomu Super', websiteUrl: 'https://www.gyomusuper.jp', categorySlug: 'gida-market', seedUrls: ['https://www.gyomusuper.jp/campaign/'] },
  { name: 'Seijo Ishii', websiteUrl: 'https://www.seijoishii.com', categorySlug: 'gida-market', seedUrls: ['https://www.seijoishii.com/campaign/'] },
  { name: 'Kaldi Coffee Farm', websiteUrl: 'https://www.kaldi.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.kaldi.co.jp/campaign/', 'https://www.kaldi.co.jp/event/'] },
  { name: 'Tokyu Store', websiteUrl: 'https://www.tokyu-store.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.tokyu-store.co.jp/campaign/'] },
  { name: 'Ozeki', websiteUrl: 'https://www.ozeki-corp.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.ozeki-corp.co.jp/campaign/'] },
  { name: 'Valor', websiteUrl: 'https://valor.jp', categorySlug: 'gida-market', seedUrls: ['https://valor.jp/campaign/'] },
  { name: 'York Mart', websiteUrl: 'https://www.york-inc.com', categorySlug: 'gida-market', seedUrls: ['https://www.york-inc.com/campaign/'] },
  { name: 'Belc', websiteUrl: 'https://www.belc.jp', categorySlug: 'gida-market', seedUrls: ['https://www.belc.jp/campaign/'] },
  { name: 'Izumi', websiteUrl: 'https://www.izumi.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.izumi.co.jp/campaign/'] },
  { name: 'Heiwado', websiteUrl: 'https://www.heiwado.jp', categorySlug: 'gida-market', seedUrls: ['https://www.heiwado.jp/campaign/'] },
  { name: 'Aeon Net Super', websiteUrl: 'https://shop.aeon.com', categorySlug: 'gida-market', seedUrls: ['https://shop.aeon.com/netsuper/campaign/'] },
  { name: 'Okuwa', websiteUrl: 'https://www.okuwa.net', categorySlug: 'gida-market', seedUrls: ['https://www.okuwa.net/campaign/'] },
  { name: 'Inageya', websiteUrl: 'https://www.inageya.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.inageya.co.jp/campaign/'] },
  { name: 'Fresta', websiteUrl: 'https://www.fresta.co.jp', categorySlug: 'gida-market', seedUrls: ['https://www.fresta.co.jp/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Dining — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Uber Eats Japan', websiteUrl: 'https://www.ubereats.com/jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/jp/promo'] },
  { name: 'Demae-can', websiteUrl: 'https://demae-can.com', categorySlug: 'yeme-icme', seedUrls: ['https://demae-can.com/campaign/'] },
  { name: 'McDonalds Japan', websiteUrl: 'https://www.mcdonalds.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.co.jp/campaign/', 'https://www.mcdonalds.co.jp/menu/limited/'] },
  { name: 'Sukiya', websiteUrl: 'https://www.sukiya.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.sukiya.jp/campaign/'] },
  { name: 'Yoshinoya', websiteUrl: 'https://www.yoshinoya.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.yoshinoya.com/campaign/', 'https://www.yoshinoya.com/menu/limited/'] },
  { name: 'Matsuya Foods', websiteUrl: 'https://www.matsuyafoods.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.matsuyafoods.co.jp/matsuya/campaign/'] },
  { name: 'Gusto', websiteUrl: 'https://www.skylark.co.jp/gusto', categorySlug: 'yeme-icme', seedUrls: ['https://www.skylark.co.jp/gusto/campaign/'] },
  { name: 'Saizeriya', websiteUrl: 'https://www.saizeriya.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.saizeriya.co.jp/campaign/'] },
  { name: 'Sushiro', websiteUrl: 'https://www.akindo-sushiro.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.akindo-sushiro.co.jp/campaign/', 'https://www.akindo-sushiro.co.jp/fair/'] },
  { name: 'Kura Sushi', websiteUrl: 'https://www.kurasushi.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.kurasushi.co.jp/campaign/', 'https://www.kurasushi.co.jp/fair/'] },
  { name: 'Hamazushi', websiteUrl: 'https://www.hamazushi.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.hamazushi.com/campaign/', 'https://www.hamazushi.com/fair/'] },
  { name: 'KFC Japan', websiteUrl: 'https://www.kfc.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.co.jp/campaign/', 'https://www.kfc.co.jp/menu/limited/'] },
  { name: 'Mos Burger', websiteUrl: 'https://www.mos.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.mos.jp/campaign/'] },
  { name: 'Freshness Burger', websiteUrl: 'https://www.freshnessburger.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.freshnessburger.co.jp/campaign/'] },
  { name: 'Coco Ichibanya', websiteUrl: 'https://www.ichibanya.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.ichibanya.co.jp/campaign/'] },
  { name: 'Starbucks Japan', websiteUrl: 'https://www.starbucks.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.co.jp/campaign/', 'https://www.starbucks.co.jp/beverage/limited/'] },
  { name: 'Tullys Coffee', websiteUrl: 'https://www.tullys.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.tullys.co.jp/campaign/'] },
  { name: 'Doutor Coffee', websiteUrl: 'https://www.doutor.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.doutor.co.jp/dcs/campaign/'] },
  { name: 'Komeda Coffee', websiteUrl: 'https://www.komeda.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.komeda.co.jp/campaign/'] },
  { name: 'Mister Donut', websiteUrl: 'https://www.misterdonut.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.misterdonut.jp/campaign/', 'https://www.misterdonut.jp/fair/'] },
  { name: 'Dominos Pizza Japan', websiteUrl: 'https://www.dominos.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.jp/campaign/', 'https://www.dominos.jp/topics/'] },
  { name: 'Pizza Hut Japan', websiteUrl: 'https://www.pizzahut.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.jp/campaign/'] },
  { name: 'Pizza-La', websiteUrl: 'https://www.pizza-la.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizza-la.co.jp/campaign/'] },
  { name: 'Torikizoku', websiteUrl: 'https://torikizoku.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://torikizoku.co.jp/campaign/'] },
  { name: 'Watami', websiteUrl: 'https://www.watami.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.watami.co.jp/campaign/'] },
  { name: 'Ootoya', websiteUrl: 'https://www.ootoya.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.ootoya.com/campaign/'] },
  { name: 'Tendon Tenya', websiteUrl: 'https://www.tenya.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.tenya.co.jp/campaign/'] },
  { name: 'Ringer Hut', websiteUrl: 'https://www.ringerhut.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.ringerhut.jp/campaign/'] },
  { name: 'Yayoiken', websiteUrl: 'https://www.yayoiken.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.yayoiken.com/campaign/'] },
  { name: 'Nakau', websiteUrl: 'https://www.nakau.co.jp', categorySlug: 'yeme-icme', seedUrls: ['https://www.nakau.co.jp/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 6) Sağlık & Güzellik / Health & Beauty — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Matsumoto Kiyoshi', websiteUrl: 'https://www.matsukiyo.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.matsukiyo.co.jp/store/online/campaign/', 'https://www.matsukiyo.co.jp/store/online/event/'] },
  { name: 'Sundrug', websiteUrl: 'https://www.sundrug.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sundrug.co.jp/campaign/', 'https://www.e-sundrug.com/campaign/'] },
  { name: 'Welcia', websiteUrl: 'https://www.welcia-yakkyoku.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.welcia-yakkyoku.co.jp/campaign/'] },
  { name: 'Tsuruha Drug', websiteUrl: 'https://www.tsuruha.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.tsuruha.co.jp/campaign/', 'https://shop.tsuruha.co.jp/campaign/'] },
  { name: 'Cocokara Fine', websiteUrl: 'https://www.cocokarafine.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cocokarafine.co.jp/campaign/'] },
  { name: 'Sugi Drug', websiteUrl: 'https://www.drug-sugi.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.drug-sugi.co.jp/campaign/'] },
  { name: 'Cosmos Drug', websiteUrl: 'https://www.cosmospc.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cosmospc.co.jp/campaign/'] },
  { name: 'Ain Pharmaciez', websiteUrl: 'https://www.ainj.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ainj.co.jp/campaign/'] },
  { name: 'Tomods', websiteUrl: 'https://www.tomods.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.tomods.jp/campaign/'] },
  { name: 'Shiseido Japan', websiteUrl: 'https://www.shiseido.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.shiseido.co.jp/campaign/', 'https://www.shiseido.co.jp/sw/campaign/'] },
  { name: 'Kao Japan', websiteUrl: 'https://www.kao.com/jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kao.com/jp/campaign/'] },
  { name: 'Kose', websiteUrl: 'https://www.kose.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kose.co.jp/campaign/', 'https://maison.kose.co.jp/campaign/'] },
  { name: 'Kanebo', websiteUrl: 'https://www.kanebo-cosmetics.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kanebo-cosmetics.jp/campaign/'] },
  { name: 'SK-II Japan', websiteUrl: 'https://www.sk-ii.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sk-ii.jp/offers', 'https://www.sk-ii.jp/campaign'] },
  { name: 'DHC Japan', websiteUrl: 'https://www.dhc.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dhc.co.jp/campaign/', 'https://www.dhc.co.jp/sale/'] },
  { name: 'Fancl', websiteUrl: 'https://www.fancl.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.fancl.co.jp/campaign/', 'https://www.fancl.co.jp/beauty/campaign/'] },
  { name: 'Orbis', websiteUrl: 'https://www.orbis.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.orbis.co.jp/campaign/'] },
  { name: 'Attenir', websiteUrl: 'https://www.attenir.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.attenir.co.jp/campaign/'] },
  { name: 'Shu Uemura Japan', websiteUrl: 'https://www.shuuemura.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.shuuemura.jp/offers.html', 'https://www.shuuemura.jp/campaign/'] },
  { name: 'Isetan Mitsukoshi Cosmetics', websiteUrl: 'https://www.isetan.mistore.jp/onlinestore/beauty', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.isetan.mistore.jp/onlinestore/beauty/campaign/'] },
  { name: 'Atcosme', websiteUrl: 'https://www.cosme.net', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cosme.net/campaign/', 'https://www.cosme.com/campaign/'] },
  { name: 'Ainz Tulpe', websiteUrl: 'https://ainz-tulpe.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://ainz-tulpe.jp/campaign/'] },
  { name: 'Pola', websiteUrl: 'https://www.pola.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pola.co.jp/campaign/', 'https://net.pola.co.jp/campaign/'] },
  { name: 'Menard', websiteUrl: 'https://www.menard.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.menard.co.jp/campaign/'] },
  { name: 'Albion', websiteUrl: 'https://www.albion.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.albion.co.jp/campaign/'] },
  { name: 'ReFa', websiteUrl: 'https://www.refa.net', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.refa.net/campaign/'] },
  { name: 'YA-MAN', websiteUrl: 'https://www.ya-man.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ya-man.com/campaign/', 'https://www.ya-man.com/sale/'] },
  { name: 'Panasonic Beauty', websiteUrl: 'https://panasonic.jp/beauty', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://panasonic.jp/beauty/campaign.html'] },
  { name: 'Create SD', websiteUrl: 'https://www.create-sd.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.create-sd.co.jp/campaign/'] },
  { name: 'V Drug', websiteUrl: 'https://www.vdrug.co.jp', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vdrug.co.jp/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nitori', websiteUrl: 'https://www.nitori-net.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.nitori-net.jp/ec/campaign/', 'https://www.nitori-net.jp/ec/tokushu/'] },
  { name: 'IKEA Japan', websiteUrl: 'https://www.ikea.com/jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/jp/ja/offers/', 'https://www.ikea.com/jp/ja/campaigns/'] },
  { name: 'Muji Home', websiteUrl: 'https://www.muji.com/jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.muji.com/jp/ja/campaign/', 'https://www.muji.com/jp/ja/feature/home/'] },
  { name: 'Cainz Home', websiteUrl: 'https://www.cainz.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.cainz.com/campaign/', 'https://www.cainz.com/tokushu/'] },
  { name: 'Komeri', websiteUrl: 'https://www.komeri.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.komeri.com/disp/campaign/', 'https://www.komeri.com/disp/fair/'] },
  { name: 'DCM Holdings', websiteUrl: 'https://www.dcm-hldgs.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.dcm-ekurashi.com/campaign/'] },
  { name: 'Kohnan', websiteUrl: 'https://www.kohnan-eshop.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.kohnan-eshop.com/shop/campaign/'] },
  { name: 'Viva Home', websiteUrl: 'https://www.vivahome.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.vivahome.co.jp/campaign/'] },
  { name: 'Joyful Honda', websiteUrl: 'https://www.joyfulhonda.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.joyfulhonda.com/campaign/'] },
  { name: 'Nafco', websiteUrl: 'https://nafco-online.com', categorySlug: 'ev-yasam', seedUrls: ['https://nafco-online.com/campaign/'] },
  { name: 'Francfranc', websiteUrl: 'https://francfranc.com', categorySlug: 'ev-yasam', seedUrls: ['https://francfranc.com/campaign/', 'https://francfranc.com/sale/'] },
  { name: 'Afternoon Tea Living', websiteUrl: 'https://shop.afternoon-tea.net', categorySlug: 'ev-yasam', seedUrls: ['https://shop.afternoon-tea.net/campaign/'] },
  { name: 'Loft', websiteUrl: 'https://www.loft.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.loft.co.jp/campaign/', 'https://www.loft.co.jp/fair/'] },
  { name: 'Tokyu Hands', websiteUrl: 'https://hands.net', categorySlug: 'ev-yasam', seedUrls: ['https://hands.net/campaign/', 'https://hands.net/fair/'] },
  { name: 'Daiso Japan', websiteUrl: 'https://www.daiso-sangyo.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.daiso-sangyo.co.jp/campaign/'] },
  { name: 'Seria', websiteUrl: 'https://www.seria-group.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.seria-group.com/campaign/'] },
  { name: 'Can Do', websiteUrl: 'https://www.cando-web.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.cando-web.co.jp/campaign/'] },
  { name: 'Watts', websiteUrl: 'https://www.watts-jp.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.watts-jp.com/campaign/'] },
  { name: 'Unico', websiteUrl: 'https://www.unico-fan.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.unico-fan.co.jp/campaign/', 'https://www.unico-fan.co.jp/sale/'] },
  { name: 'Actus', websiteUrl: 'https://www.actus-interior.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.actus-interior.com/campaign/', 'https://www.actus-interior.com/sale/'] },
  { name: 'Karimoku', websiteUrl: 'https://www.karimoku.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.karimoku.co.jp/campaign/', 'https://www.karimoku.co.jp/fair/'] },
  { name: 'Shimachu', websiteUrl: 'https://www.shimachu.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.shimachu.co.jp/campaign/'] },
  { name: 'Sundrug Home', websiteUrl: 'https://ec.sundrug.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://ec.sundrug.co.jp/campaign/'] },
  { name: 'Iris Ohyama', websiteUrl: 'https://www.irisohyama.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.irisohyama.co.jp/campaign/', 'https://www.irisplaza.co.jp/campaign/'] },
  { name: 'Tiger Japan', websiteUrl: 'https://www.tiger-corporation.com/ja/jpn', categorySlug: 'ev-yasam', seedUrls: ['https://www.tiger-corporation.com/ja/jpn/campaign/'] },
  { name: 'Zojirushi', websiteUrl: 'https://www.zojirushi.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.zojirushi.co.jp/campaign/'] },
  { name: 'Thermos Japan', websiteUrl: 'https://www.thermos.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.thermos.jp/campaign/'] },
  { name: 'Tansu no Gen', websiteUrl: 'https://www.tansu-gen.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.tansu-gen.jp/campaign/', 'https://www.tansu-gen.jp/sale/'] },
  { name: 'B-Company', websiteUrl: 'https://www.b-company.co.jp', categorySlug: 'ev-yasam', seedUrls: ['https://www.b-company.co.jp/campaign/'] },
  { name: 'Keyuca', websiteUrl: 'https://www.keyuca.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.keyuca.com/campaign/', 'https://www.keyuca.com/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Xebio', websiteUrl: 'https://www.supersports.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.supersports.com/ja-jp/xebio/campaign/', 'https://www.supersports.com/ja-jp/xebio/sale/'] },
  { name: 'Alpen', websiteUrl: 'https://www.alpen-group.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.alpen-group.jp/campaign/', 'https://store.alpen-group.jp/campaign/'] },
  { name: 'Sports Authority Japan', websiteUrl: 'https://www.sportsauthority.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportsauthority.jp/campaign/'] },
  { name: 'ABC-Mart Sports', websiteUrl: 'https://www.abc-mart.net', categorySlug: 'spor-outdoor', seedUrls: ['https://www.abc-mart.net/shop/campaign/', 'https://www.abc-mart.net/shop/sale/'] },
  { name: 'Himaraya Sports', websiteUrl: 'https://www.himaraya.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.himaraya.co.jp/campaign/', 'https://www.himaraya.co.jp/sale/'] },
  { name: 'Victoria Golf', websiteUrl: 'https://www.victoria.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.victoria.co.jp/campaign/'] },
  { name: 'Golf5', websiteUrl: 'https://store.alpen-group.jp/golf5', categorySlug: 'spor-outdoor', seedUrls: ['https://store.alpen-group.jp/golf5/campaign/'] },
  { name: 'GDO Golf Digest Online', websiteUrl: 'https://www.golfdigest.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.golfdigest.co.jp/campaign/', 'https://shop.golfdigest.co.jp/campaign/'] },
  { name: 'Mizuno Japan', websiteUrl: 'https://www.mizuno.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mizuno.jp/campaign/', 'https://www.mizunoshop.net/campaign/'] },
  { name: 'Asics Sports', websiteUrl: 'https://www.asics.com/jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/jp/ja-jp/mk/sale'] },
  { name: 'Descente Japan', websiteUrl: 'https://www.descente.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.descente.co.jp/campaign/', 'https://store.descente.co.jp/campaign/'] },
  { name: 'The North Face Japan', websiteUrl: 'https://www.goldwin.co.jp/tnf', categorySlug: 'spor-outdoor', seedUrls: ['https://www.goldwin.co.jp/tnf/campaign/', 'https://www.goldwin.co.jp/tnf/sale/'] },
  { name: 'Mont-bell', websiteUrl: 'https://www.montbell.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.montbell.jp/campaign/', 'https://webshop.montbell.jp/campaign/'] },
  { name: 'Snow Peak', websiteUrl: 'https://www.snowpeak.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.snowpeak.co.jp/campaign/', 'https://www.snowpeak.co.jp/sale/'] },
  { name: 'Coleman Japan', websiteUrl: 'https://www.coleman.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.coleman.co.jp/campaign/', 'https://www.coleman.co.jp/sale/'] },
  { name: 'L-Breath', websiteUrl: 'https://www.supersports.com/ja-jp/l-breath', categorySlug: 'spor-outdoor', seedUrls: ['https://www.supersports.com/ja-jp/l-breath/campaign/'] },
  { name: 'Wild-1', websiteUrl: 'https://www.wild1.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.wild1.co.jp/campaign/'] },
  { name: 'Logos Japan', websiteUrl: 'https://www.logos.ne.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.logos.ne.jp/campaign/', 'https://www.logos.ne.jp/sale/'] },
  { name: 'Captain Stag', websiteUrl: 'https://www.captainstag.net', categorySlug: 'spor-outdoor', seedUrls: ['https://www.captainstag.net/campaign/'] },
  { name: 'Goldwin', websiteUrl: 'https://www.goldwin.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.goldwin.co.jp/campaign/', 'https://www.goldwin.co.jp/sale/'] },
  { name: 'Under Armour Japan', websiteUrl: 'https://www.underarmour.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.co.jp/ja-jp/sale.html', 'https://www.underarmour.co.jp/ja-jp/campaign/'] },
  { name: 'New Balance Japan', websiteUrl: 'https://shop.newbalance.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://shop.newbalance.jp/shop/campaign/', 'https://shop.newbalance.jp/shop/sale/'] },
  { name: 'Puma Japan', websiteUrl: 'https://jp.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://jp.puma.com/jp/ja/campaign/', 'https://jp.puma.com/jp/ja/sale/'] },
  { name: 'Yonex Japan', websiteUrl: 'https://www.yonex.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.yonex.co.jp/campaign/'] },
  { name: 'Dunlop Sports Japan', websiteUrl: 'https://sports.dunlop.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://sports.dunlop.co.jp/campaign/'] },
  { name: 'Fila Japan', websiteUrl: 'https://www.fila.co.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.co.jp/campaign/', 'https://www.fila.co.jp/sale/'] },
  { name: 'Reebok Japan', websiteUrl: 'https://reebok.jp', categorySlug: 'spor-outdoor', seedUrls: ['https://reebok.jp/campaign/', 'https://reebok.jp/sale/'] },
  { name: 'Oakley Japan', websiteUrl: 'https://www.oakley.com/ja-jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.oakley.com/ja-jp/campaign/', 'https://www.oakley.com/ja-jp/sale'] },
  { name: 'Daiwa', websiteUrl: 'https://www.daiwa.com/jp', categorySlug: 'spor-outdoor', seedUrls: ['https://www.daiwa.com/jp/campaign/'] },
  { name: 'Shimano Japan', websiteUrl: 'https://www.shimano.com/ja-JP', categorySlug: 'spor-outdoor', seedUrls: ['https://store.shimano.co.jp/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Tatil / Travel — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'JAL', websiteUrl: 'https://www.jal.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jal.co.jp/jp/ja/dom/campaign/', 'https://www.jal.co.jp/jp/ja/inter/campaign/'] },
  { name: 'ANA', websiteUrl: 'https://www.ana.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ana.co.jp/ja/jp/campaign/', 'https://www.ana.co.jp/ja/jp/domtour/campaign/'] },
  { name: 'JTB', websiteUrl: 'https://www.jtb.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jtb.co.jp/campaign/', 'https://www.jtb.co.jp/kokunai/sale/'] },
  { name: 'HIS', websiteUrl: 'https://www.his-j.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.his-j.com/campaign/', 'https://www.his-j.com/tyo/sale/'] },
  { name: 'Rakuten Travel', websiteUrl: 'https://travel.rakuten.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://travel.rakuten.co.jp/campaign/', 'https://travel.rakuten.co.jp/special/'] },
  { name: 'Jalan.net', websiteUrl: 'https://www.jalan.net', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jalan.net/campaign/', 'https://www.jalan.net/jalan/doc/campaign/'] },
  { name: 'Ikyu', websiteUrl: 'https://www.ikyu.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ikyu.com/campaign/', 'https://www.ikyu.com/special/'] },
  { name: 'Yahoo Travel Japan', websiteUrl: 'https://travel.yahoo.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://travel.yahoo.co.jp/campaign/', 'https://travel.yahoo.co.jp/promo/'] },
  { name: 'Booking.com Japan', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.ja.html'] },
  { name: 'Expedia Japan', websiteUrl: 'https://www.expedia.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.co.jp/deals', 'https://www.expedia.co.jp/campaign/'] },
  { name: 'Agoda Japan', websiteUrl: 'https://www.agoda.com/ja-jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/ja-jp/deals'] },
  { name: 'Airtrip', websiteUrl: 'https://www.airtrip.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airtrip.jp/campaign/'] },
  { name: 'Skyticket', websiteUrl: 'https://skyticket.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://skyticket.jp/campaign/'] },
  { name: 'Peach Aviation', websiteUrl: 'https://www.flypeach.com/ja', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flypeach.com/ja/campaign/'] },
  { name: 'Jetstar Japan', websiteUrl: 'https://www.jetstar.com/jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jetstar.com/jp/ja/deals'] },
  { name: 'Spring Airlines Japan', websiteUrl: 'https://jp.ch.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://jp.ch.com/campaign/'] },
  { name: 'Club Tourism', websiteUrl: 'https://www.club-t.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.club-t.com/campaign/', 'https://www.club-t.com/special/'] },
  { name: 'Nippon Travel Agency', websiteUrl: 'https://www.nta.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nta.co.jp/campaign/', 'https://www.nta.co.jp/kokunai/campaign/'] },
  { name: 'Hankyu Travel', websiteUrl: 'https://www.hankyu-travel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hankyu-travel.com/campaign/'] },
  { name: 'Kinki Nippon Tourist', websiteUrl: 'https://www.knt.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.knt.co.jp/campaign/'] },
  { name: 'JR East', websiteUrl: 'https://www.jreast.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jreast.co.jp/tickets/campaign/', 'https://www.jreast.co.jp/press/'] },
  { name: 'JR West', websiteUrl: 'https://www.westjr.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.westjr.co.jp/press/campaign/', 'https://www.westjr.co.jp/railroad/ticket/campaign/'] },
  { name: 'Tobu Top Tours', websiteUrl: 'https://www.tobutoptours.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tobutoptours.co.jp/campaign/'] },
  { name: 'Rurubu Travel', websiteUrl: 'https://www.rurubu.travel', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rurubu.travel/campaign/'] },
  { name: 'OZmall Travel', websiteUrl: 'https://www.ozmall.co.jp/travel', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ozmall.co.jp/travel/campaign/'] },
  { name: 'Relux', websiteUrl: 'https://rlx.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://rlx.jp/campaign/', 'https://rlx.jp/special/'] },
  { name: 'Stays Japan', websiteUrl: 'https://stays.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://stays.jp/campaign/'] },
  { name: 'Willer Express', websiteUrl: 'https://travel.willer.co.jp', categorySlug: 'seyahat-ulasim', seedUrls: ['https://travel.willer.co.jp/campaign/'] },
  { name: 'Klook Japan', websiteUrl: 'https://www.klook.com/ja', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klook.com/ja/promo/', 'https://www.klook.com/ja/campaign/'] },
  { name: 'KKday Japan', websiteUrl: 'https://www.kkday.com/ja', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kkday.com/ja/promo/', 'https://www.kkday.com/ja/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Rakuten Card', websiteUrl: 'https://www.rakuten-card.co.jp', categorySlug: 'finans', seedUrls: ['https://www.rakuten-card.co.jp/campaign/', 'https://www.rakuten-card.co.jp/e-navi/campaign/'] },
  { name: 'SBI Securities', websiteUrl: 'https://www.sbisec.co.jp', categorySlug: 'finans', seedUrls: ['https://www.sbisec.co.jp/ETGate/WPLETmgR001Control?getFlg=on&burl=search_campaign'] },
  { name: 'PayPay', websiteUrl: 'https://paypay.ne.jp', categorySlug: 'finans', seedUrls: ['https://paypay.ne.jp/campaign/', 'https://paypay.ne.jp/event/'] },
  { name: 'Line Pay', websiteUrl: 'https://pay.line.me', categorySlug: 'finans', seedUrls: ['https://pay.line.me/portal/jp/about/campaign'] },
  { name: 'Merpay', websiteUrl: 'https://www.merpay.com', categorySlug: 'finans', seedUrls: ['https://www.merpay.com/campaign/'] },
  { name: 'au PAY', websiteUrl: 'https://aupay.wallet.auone.jp', categorySlug: 'finans', seedUrls: ['https://aupay.wallet.auone.jp/campaign/'] },
  { name: 'd Barai', websiteUrl: 'https://service.smt.docomo.ne.jp/keitai_payment', categorySlug: 'finans', seedUrls: ['https://service.smt.docomo.ne.jp/keitai_payment/campaign/'] },
  { name: 'Rakuten Bank', websiteUrl: 'https://www.rakuten-bank.co.jp', categorySlug: 'finans', seedUrls: ['https://www.rakuten-bank.co.jp/campaign/'] },
  { name: 'SBI Sumishin Net Bank', websiteUrl: 'https://www.netbk.co.jp', categorySlug: 'finans', seedUrls: ['https://www.netbk.co.jp/contents/campaign/'] },
  { name: 'Sony Bank', websiteUrl: 'https://moneykit.net', categorySlug: 'finans', seedUrls: ['https://moneykit.net/campaign/'] },
  { name: 'MUFG Bank', websiteUrl: 'https://www.bk.mufg.jp', categorySlug: 'finans', seedUrls: ['https://www.bk.mufg.jp/campaign/'] },
  { name: 'SMBC', websiteUrl: 'https://www.smbc.co.jp', categorySlug: 'finans', seedUrls: ['https://www.smbc.co.jp/campaign/'] },
  { name: 'Mizuho Bank', websiteUrl: 'https://www.mizuhobank.co.jp', categorySlug: 'finans', seedUrls: ['https://www.mizuhobank.co.jp/campaign/'] },
  { name: 'Rakuten Securities', websiteUrl: 'https://www.rakuten-sec.co.jp', categorySlug: 'finans', seedUrls: ['https://www.rakuten-sec.co.jp/web/campaign/'] },
  { name: 'Monex Securities', websiteUrl: 'https://www.monex.co.jp', categorySlug: 'finans', seedUrls: ['https://www.monex.co.jp/campaign/'] },
  { name: 'Matsui Securities', websiteUrl: 'https://www.matsui.co.jp', categorySlug: 'finans', seedUrls: ['https://www.matsui.co.jp/campaign/'] },
  { name: 'Au Jibun Bank', websiteUrl: 'https://www.jibunbank.co.jp', categorySlug: 'finans', seedUrls: ['https://www.jibunbank.co.jp/campaign/'] },
  { name: 'Aeon Card', websiteUrl: 'https://www.aeon.co.jp/card', categorySlug: 'finans', seedUrls: ['https://www.aeon.co.jp/campaign/'] },
  { name: 'JCB Card', websiteUrl: 'https://www.jcb.co.jp', categorySlug: 'finans', seedUrls: ['https://www.jcb.co.jp/campaign/'] },
  { name: 'Sumitomo Mitsui Card', websiteUrl: 'https://www.smbc-card.com', categorySlug: 'finans', seedUrls: ['https://www.smbc-card.com/mem/campaign/', 'https://www.smbc-card.com/nyukai/campaign/'] },
  { name: 'American Express Japan', websiteUrl: 'https://www.americanexpress.com/ja-jp', categorySlug: 'finans', seedUrls: ['https://www.americanexpress.com/ja-jp/campaigns/'] },
  { name: 'Daiwa Securities', websiteUrl: 'https://www.daiwa.jp', categorySlug: 'finans', seedUrls: ['https://www.daiwa.jp/campaign/'] },
  { name: 'Nomura Securities', websiteUrl: 'https://www.nomura.co.jp', categorySlug: 'finans', seedUrls: ['https://www.nomura.co.jp/campaign/'] },
  { name: 'SMBC Nikko Securities', websiteUrl: 'https://www.smbcnikko.co.jp', categorySlug: 'finans', seedUrls: ['https://www.smbcnikko.co.jp/campaign/'] },
  { name: 'Kabu.com Securities', websiteUrl: 'https://kabu.com', categorySlug: 'finans', seedUrls: ['https://kabu.com/campaign/'] },
  { name: 'Aplus Financial', websiteUrl: 'https://www.aplus.co.jp', categorySlug: 'finans', seedUrls: ['https://www.aplus.co.jp/campaign/'] },
  { name: 'Orico Card', websiteUrl: 'https://www.orico.co.jp', categorySlug: 'finans', seedUrls: ['https://www.orico.co.jp/campaign/'] },
  { name: 'Saison Card', websiteUrl: 'https://www.saisoncard.co.jp', categorySlug: 'finans', seedUrls: ['https://www.saisoncard.co.jp/campaign/'] },
  { name: 'Epos Card', websiteUrl: 'https://www.eposcard.co.jp', categorySlug: 'finans', seedUrls: ['https://www.eposcard.co.jp/campaign/'] },
  { name: 'PayPay Card', websiteUrl: 'https://www.paypay-card.co.jp', categorySlug: 'finans', seedUrls: ['https://www.paypay-card.co.jp/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Eğitim / Education — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Benesse', websiteUrl: 'https://www.benesse.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.benesse.co.jp/campaign/', 'https://www.benesse.co.jp/zemi/campaign/'] },
  { name: 'Study Sapuri', websiteUrl: 'https://studysapuri.jp', categorySlug: 'sigorta', seedUrls: ['https://studysapuri.jp/campaign/'] },
  { name: 'Schoo', websiteUrl: 'https://schoo.jp', categorySlug: 'sigorta', seedUrls: ['https://schoo.jp/campaign/'] },
  { name: 'Udemy Japan', websiteUrl: 'https://www.udemy.com/ja', categorySlug: 'sigorta', seedUrls: ['https://www.udemy.com/ja/deals/'] },
  { name: 'Z-Kai', websiteUrl: 'https://www.zkai.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.zkai.co.jp/campaign/'] },
  { name: 'Kumon Japan', websiteUrl: 'https://www.kumon.ne.jp', categorySlug: 'sigorta', seedUrls: ['https://www.kumon.ne.jp/campaign/'] },
  { name: 'Gakken', websiteUrl: 'https://www.gakken.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.gakken.co.jp/campaign/'] },
  { name: 'Yomiuri Culture Center', websiteUrl: 'https://www.ync.ne.jp', categorySlug: 'sigorta', seedUrls: ['https://www.ync.ne.jp/campaign/'] },
  { name: 'NHK Culture', websiteUrl: 'https://www.nhk-cul.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.nhk-cul.co.jp/campaign/'] },
  { name: 'ECC', websiteUrl: 'https://www.ecc.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.ecc.co.jp/campaign/'] },
  { name: 'Berlitz Japan', websiteUrl: 'https://www.berlitz.com/ja-jp', categorySlug: 'sigorta', seedUrls: ['https://www.berlitz.com/ja-jp/campaign/'] },
  { name: 'Aeon Eikaiwa', websiteUrl: 'https://www.aeonet.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.aeonet.co.jp/campaign/'] },
  { name: 'Gaba Eikaiwa', websiteUrl: 'https://www.gaba.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.gaba.co.jp/campaign/'] },
  { name: 'Nova Eikaiwa', websiteUrl: 'https://www.nova.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.nova.co.jp/campaign/'] },
  { name: 'DMM Eikaiwa', websiteUrl: 'https://eikaiwa.dmm.com', categorySlug: 'sigorta', seedUrls: ['https://eikaiwa.dmm.com/campaign/'] },
  { name: 'Native Camp', websiteUrl: 'https://nativecamp.net', categorySlug: 'sigorta', seedUrls: ['https://nativecamp.net/campaign/'] },
  { name: 'Rarejob', websiteUrl: 'https://www.rarejob.com', categorySlug: 'sigorta', seedUrls: ['https://www.rarejob.com/campaign/'] },
  { name: 'TAC', websiteUrl: 'https://www.tac-school.co.jp', categorySlug: 'sigorta', seedUrls: ['https://www.tac-school.co.jp/campaign/'] },
  { name: 'LEC Tokyo Legal Mind', websiteUrl: 'https://www.lec-jp.com', categorySlug: 'sigorta', seedUrls: ['https://www.lec-jp.com/campaign/'] },
  { name: 'Yotsuyaotsuka', websiteUrl: 'https://www.yotsuyaotsuka.com', categorySlug: 'sigorta', seedUrls: ['https://www.yotsuyaotsuka.com/campaign/'] },
  { name: 'Sundai', websiteUrl: 'https://www.sundai.ac.jp', categorySlug: 'sigorta', seedUrls: ['https://www.sundai.ac.jp/campaign/'] },
  { name: 'Kawai Juku', websiteUrl: 'https://www.kawaijuku.jp', categorySlug: 'sigorta', seedUrls: ['https://www.kawaijuku.jp/campaign/'] },
  { name: 'Toshin', websiteUrl: 'https://www.toshin.com', categorySlug: 'sigorta', seedUrls: ['https://www.toshin.com/campaign/'] },
  { name: 'Progate', websiteUrl: 'https://prog-8.com', categorySlug: 'sigorta', seedUrls: ['https://prog-8.com/campaign/'] },
  { name: 'TechAcademy', websiteUrl: 'https://techacademy.jp', categorySlug: 'sigorta', seedUrls: ['https://techacademy.jp/campaign/'] },
  { name: 'CodeCamp', websiteUrl: 'https://codecamp.jp', categorySlug: 'sigorta', seedUrls: ['https://codecamp.jp/campaign/'] },
  { name: 'Digital Hollywood', websiteUrl: 'https://school.dhw.co.jp', categorySlug: 'sigorta', seedUrls: ['https://school.dhw.co.jp/campaign/'] },
  { name: 'Human Academy', websiteUrl: 'https://haa.athuman.com', categorySlug: 'sigorta', seedUrls: ['https://haa.athuman.com/campaign/'] },
  { name: 'Agaroot Academy', websiteUrl: 'https://www.agaroot.jp', categorySlug: 'sigorta', seedUrls: ['https://www.agaroot.jp/campaign/'] },
  { name: 'Street Academy', websiteUrl: 'https://www.street-academy.com', categorySlug: 'sigorta', seedUrls: ['https://www.street-academy.com/campaign/'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota Japan', websiteUrl: 'https://toyota.jp', categorySlug: 'otomobil', seedUrls: ['https://toyota.jp/campaign/', 'https://toyota.jp/information/campaign/'] },
  { name: 'Honda Japan', websiteUrl: 'https://www.honda.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.honda.co.jp/campaign/', 'https://www.honda.co.jp/auto/campaign/'] },
  { name: 'Nissan Japan', websiteUrl: 'https://www.nissan.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.co.jp/campaign/', 'https://www.nissan.co.jp/EVENT/'] },
  { name: 'Mazda Japan', websiteUrl: 'https://www.mazda.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.co.jp/campaign/'] },
  { name: 'Subaru Japan', websiteUrl: 'https://www.subaru.jp', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.jp/campaign/'] },
  { name: 'Suzuki Japan', websiteUrl: 'https://www.suzuki.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.co.jp/car/campaign/'] },
  { name: 'Daihatsu', websiteUrl: 'https://www.daihatsu.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.daihatsu.co.jp/campaign/'] },
  { name: 'Mitsubishi Motors Japan', websiteUrl: 'https://www.mitsubishi-motors.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.co.jp/campaign/'] },
  { name: 'Lexus Japan', websiteUrl: 'https://lexus.jp', categorySlug: 'otomobil', seedUrls: ['https://lexus.jp/campaign/', 'https://lexus.jp/models/campaign/'] },
  { name: 'BMW Japan', websiteUrl: 'https://www.bmw.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.co.jp/ja/campaign.html'] },
  { name: 'Mercedes-Benz Japan', websiteUrl: 'https://www.mercedes-benz.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.co.jp/campaign/'] },
  { name: 'Audi Japan', websiteUrl: 'https://www.audi.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.audi.co.jp/jp/web/ja/campaign.html'] },
  { name: 'Volkswagen Japan', websiteUrl: 'https://www.volkswagen.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.co.jp/ja/campaign.html'] },
  { name: 'Volvo Japan', websiteUrl: 'https://www.volvocars.com/jp', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/jp/campaign/'] },
  { name: 'Gulliver', websiteUrl: 'https://www.gulliver.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.gulliver.co.jp/campaign/'] },
  { name: 'CarSensor', websiteUrl: 'https://www.carsensor.net', categorySlug: 'otomobil', seedUrls: ['https://www.carsensor.net/campaign/'] },
  { name: 'Goo-net', websiteUrl: 'https://www.goo-net.com', categorySlug: 'otomobil', seedUrls: ['https://www.goo-net.com/campaign/'] },
  { name: 'Car View', websiteUrl: 'https://carview.yahoo.co.jp', categorySlug: 'otomobil', seedUrls: ['https://carview.yahoo.co.jp/campaign/'] },
  { name: 'Autobacs', websiteUrl: 'https://www.autobacs.com', categorySlug: 'otomobil', seedUrls: ['https://www.autobacs.com/campaign/', 'https://www.autobacs.com/shop/campaign/'] },
  { name: 'Yellow Hat', websiteUrl: 'https://www.yellowhat.jp', categorySlug: 'otomobil', seedUrls: ['https://www.yellowhat.jp/campaign/'] },
  { name: 'ENEOS', websiteUrl: 'https://www.eneos.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.eneos.co.jp/consumer/campaign/', 'https://www.eneos.co.jp/campaign/'] },
  { name: 'Idemitsu', websiteUrl: 'https://www.idemitsu.com', categorySlug: 'otomobil', seedUrls: ['https://www.idemitsu.com/jp/personal/campaign/'] },
  { name: 'Bridgestone Japan', websiteUrl: 'https://www.bridgestone.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestone.co.jp/campaign/'] },
  { name: 'Yokohama Tire', websiteUrl: 'https://www.y-yokohama.com', categorySlug: 'otomobil', seedUrls: ['https://www.y-yokohama.com/campaign/'] },
  { name: 'Dunlop Tire', websiteUrl: 'https://tyre.dunlop.co.jp', categorySlug: 'otomobil', seedUrls: ['https://tyre.dunlop.co.jp/campaign/'] },
  { name: 'Toyo Tires', websiteUrl: 'https://www.toyotires.jp', categorySlug: 'otomobil', seedUrls: ['https://www.toyotires.jp/campaign/'] },
  { name: 'SBI Motor Japan', websiteUrl: 'https://www.sbimotor.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.sbimotor.co.jp/campaign/'] },
  { name: 'Nextage', websiteUrl: 'https://www.nextage.jp', categorySlug: 'otomobil', seedUrls: ['https://www.nextage.jp/campaign/'] },
  { name: 'Bike O', websiteUrl: 'https://www.bikeo.co.jp', categorySlug: 'otomobil', seedUrls: ['https://www.bikeo.co.jp/campaign/'] },
  { name: 'Naps', websiteUrl: 'https://www.naps-jp.com', categorySlug: 'otomobil', seedUrls: ['https://www.naps-jp.com/campaign/', 'https://www.naps-jp.com/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Kinokuniya', websiteUrl: 'https://www.kinokuniya.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kinokuniya.co.jp/c/campaign/', 'https://www.kinokuniya.co.jp/disp/CSfDispListPage_001.jsp?dispNo=006'] },
  { name: 'Tsutaya', websiteUrl: 'https://store-tsutaya.tsite.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://store-tsutaya.tsite.jp/campaign/', 'https://store-tsutaya.tsite.jp/fair/'] },
  { name: 'Amazon Books JP', websiteUrl: 'https://www.amazon.co.jp/books', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.co.jp/gp/browse.html?node=465610', 'https://www.amazon.co.jp/b?node=2293143051'] },
  { name: 'honto', websiteUrl: 'https://honto.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://honto.jp/cp/', 'https://honto.jp/sale/'] },
  { name: 'Rakuten Books', websiteUrl: 'https://books.rakuten.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://books.rakuten.co.jp/event/', 'https://books.rakuten.co.jp/campaign/'] },
  { name: 'BookOff Online', websiteUrl: 'https://www.bookoffonline.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bookoffonline.co.jp/campaign/', 'https://www.bookoffonline.co.jp/sale/'] },
  { name: 'Maruzen Junkudo', websiteUrl: 'https://www.maruzenjunkudo.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.maruzenjunkudo.co.jp/campaign/', 'https://www.maruzenjunkudo.co.jp/fair/'] },
  { name: 'Animate', websiteUrl: 'https://www.animate.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.animate.co.jp/campaign/', 'https://www.animate-onlineshop.jp/campaign/'] },
  { name: 'Toranoana', websiteUrl: 'https://ec.toranoana.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://ec.toranoana.jp/campaign/', 'https://ec.toranoana.jp/fair/'] },
  { name: 'Melonbooks', websiteUrl: 'https://www.melonbooks.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.melonbooks.co.jp/campaign/', 'https://www.melonbooks.co.jp/fair/'] },
  { name: 'Gamers', websiteUrl: 'https://www.gamers.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gamers.co.jp/campaign/'] },
  { name: 'Mandarake', websiteUrl: 'https://www.mandarake.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mandarake.co.jp/campaign/', 'https://www.mandarake.co.jp/information/event/'] },
  { name: 'Surugaya', websiteUrl: 'https://www.suruga-ya.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.suruga-ya.jp/campaign/'] },
  { name: 'Nintendo Japan', websiteUrl: 'https://www.nintendo.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://store-jp.nintendo.com/campaign/', 'https://www.nintendo.co.jp/campaign/'] },
  { name: 'PlayStation Japan', websiteUrl: 'https://www.playstation.com/ja-jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.playstation.com/ja-jp/deals/', 'https://store.playstation.com/ja-jp/category/deals'] },
  { name: 'Xbox Japan', websiteUrl: 'https://www.xbox.com/ja-JP', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/ja-JP/deals'] },
  { name: 'Steam Japan', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Geo Online', websiteUrl: 'https://geo-online.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://geo-online.co.jp/campaign/', 'https://geo-online.co.jp/sale/'] },
  { name: 'Joshin Game', websiteUrl: 'https://joshinweb.jp/game', categorySlug: 'kitap-hobi', seedUrls: ['https://joshinweb.jp/game/campaign/'] },
  { name: 'Hobby Japan', websiteUrl: 'https://hobbyjapan.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://hobbyjapan.co.jp/campaign/'] },
  { name: 'Tamiya', websiteUrl: 'https://www.tamiya.com/japan', categorySlug: 'kitap-hobi', seedUrls: ['https://www.tamiya.com/japan/campaign/'] },
  { name: 'Bandai Spirits', websiteUrl: 'https://www.bandaispirits.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bandaispirits.co.jp/campaign/', 'https://p-bandai.jp/campaign/'] },
  { name: 'Kotobukiya', websiteUrl: 'https://www.kotobukiya.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kotobukiya.co.jp/campaign/', 'https://shop.kotobukiya.co.jp/campaign/'] },
  { name: 'Good Smile Company', websiteUrl: 'https://www.goodsmile.info/ja', categorySlug: 'kitap-hobi', seedUrls: ['https://www.goodsmile.info/ja/campaign/', 'https://goodsmileshop.com/ja/campaign/'] },
  { name: 'Yuzawaya', websiteUrl: 'https://www.yuzawaya.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.yuzawaya.co.jp/campaign/', 'https://www.yuzawaya.co.jp/fair/'] },
  { name: 'Okadaya', websiteUrl: 'https://www.okadaya.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.okadaya.co.jp/campaign/'] },
  { name: 'Toei Animation Shop', websiteUrl: 'https://shopping.toei-anim.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://shopping.toei-anim.co.jp/campaign/'] },
  { name: 'Shueisha Online', websiteUrl: 'https://www.shueisha.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.shueisha.co.jp/campaign/'] },
  { name: 'Kodansha Online', websiteUrl: 'https://www.kodansha.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kodansha.co.jp/campaign/'] },
  { name: 'Shogakukan Online', websiteUrl: 'https://www.shogakukan.co.jp', categorySlug: 'kitap-hobi', seedUrls: ['https://www.shogakukan.co.jp/campaign/'] },
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
  console.log('=== JP Market Brand Seed Script ===\n');

  // 1. Ensure English names for categories
  for (const [slug, nameEn] of Object.entries(CATEGORY_NAME_EN)) {
    await prisma.category.updateMany({
      where: { slug },
      data: { nameEn },
    });
  }
  console.log(`Updated English names for ${Object.keys(CATEGORY_NAME_EN).length} categories.\n`);

  // Load all categories into a slug -> id map
  const allCats = await prisma.category.findMany();
  const categoryMap = new Map<string, string>();
  for (const c of allCats) {
    categoryMap.set(c.slug, c.id);
  }
  console.log(`Categories ready: ${categoryMap.size} total\n`);

  // 2. Deduplicate
  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Total brands: ${uniqueBrands.length} (${BRANDS.length - uniqueBrands.length} duplicates skipped)\n`);

  // 3. Process brands + sources
  let brandsOk = 0;
  let sourcesCreated = 0;
  let sourcesUpdated = 0;
  let errors = 0;

  for (const entry of uniqueBrands) {
    const slug = toSlug(entry.name);
    const categoryId = categoryMap.get(entry.categorySlug) ?? null;

    if (!categoryId) {
      console.warn(`  Category not found: ${entry.categorySlug} (brand: ${entry.name})`);
      errors++;
      continue;
    }

    try {
      // Upsert brand with JP market (unique on slug+market)
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'JP' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'JP',
          categoryId,
        },
      });

      // Check for existing crawl source
      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, crawlMethod: 'CAMPAIGN' },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Deals`,
            crawlMethod: 'CAMPAIGN',
            seedUrls: entry.seedUrls,
            maxDepth: 2,
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'JP',
            isActive: true,
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'JP' },
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
  console.log(`Brands:           ${brandsOk} ok, ${errors} errors`);
  console.log(`New sources:      ${sourcesCreated}`);
  console.log(`Updated sources:  ${sourcesUpdated}`);

  // 4. Summary of all JP sources
  const totalJPSources = await prisma.crawlSource.count({
    where: { market: 'JP', isActive: true },
  });
  console.log(`Total active JP sources: ${totalJPSources}`);
  console.log('\nDone! To trigger crawl: POST /admin/crawl/trigger-all');
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
