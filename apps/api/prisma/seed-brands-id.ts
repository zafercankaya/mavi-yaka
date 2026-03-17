import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── Slug generator ──────────────────────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Brand entry type ────────────────────────────────────
interface BrandEntry {
  name: string;
  websiteUrl: string;
  categorySlug: string;
  seedUrls: string[];
}

// ── ALL INDONESIA BRANDS DATA ───────────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tokopedia', websiteUrl: 'https://www.tokopedia.com', categorySlug: 'alisveris', seedUrls: ['https://www.tokopedia.com/discovery/deals', 'https://www.tokopedia.com/promo'] },
  { name: 'Shopee Indonesia', websiteUrl: 'https://shopee.co.id', categorySlug: 'alisveris', seedUrls: ['https://shopee.co.id/flash_sale', 'https://shopee.co.id/m/promo'] },
  { name: 'Lazada Indonesia', websiteUrl: 'https://www.lazada.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.lazada.co.id/wow/gcp/route/lazada/id/channel/flashsale', 'https://www.lazada.co.id/promo/'] },
  { name: 'Blibli', websiteUrl: 'https://www.blibli.com', categorySlug: 'alisveris', seedUrls: ['https://www.blibli.com/promosi', 'https://www.blibli.com/promo/flash-sale'] },
  { name: 'Bukalapak', websiteUrl: 'https://www.bukalapak.com', categorySlug: 'alisveris', seedUrls: ['https://www.bukalapak.com/promo', 'https://www.bukalapak.com/flash-deal'] },
  { name: 'JD.ID', websiteUrl: 'https://www.jd.id', categorySlug: 'alisveris', seedUrls: ['https://www.jd.id/promo.html', 'https://www.jd.id/flashsale.html'] },
  { name: 'Zalora Indonesia', websiteUrl: 'https://www.zalora.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.zalora.co.id/sale/', 'https://www.zalora.co.id/promo/'] },
  { name: 'Bhinneka', websiteUrl: 'https://www.bhinneka.com', categorySlug: 'alisveris', seedUrls: ['https://www.bhinneka.com/promo', 'https://www.bhinneka.com/flash-deal'] },
  { name: 'Orami', websiteUrl: 'https://www.orami.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.orami.co.id/shopping/promo'] },
  { name: 'MatahariMall', websiteUrl: 'https://www.matahari.com', categorySlug: 'alisveris', seedUrls: ['https://www.matahari.com/promo'] },
  { name: 'Sociolla', websiteUrl: 'https://www.sociolla.com', categorySlug: 'alisveris', seedUrls: ['https://www.sociolla.com/promo', 'https://www.sociolla.com/sale'] },
  { name: 'iLotte', websiteUrl: 'https://www.ilotte.com', categorySlug: 'alisveris', seedUrls: ['https://www.ilotte.com/promo'] },
  { name: 'Sephora Indonesia', websiteUrl: 'https://www.sephora.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.sephora.co.id/sale', 'https://www.sephora.co.id/promo'] },
  { name: 'Mapemall', websiteUrl: 'https://www.mapemall.com', categorySlug: 'alisveris', seedUrls: ['https://www.mapemall.com/promo', 'https://www.mapemall.com/sale'] },
  { name: 'Bobobobo', websiteUrl: 'https://www.bobobobo.com', categorySlug: 'alisveris', seedUrls: ['https://www.bobobobo.com/sale'] },
  { name: 'Berrybenka', websiteUrl: 'https://berrybenka.com', categorySlug: 'alisveris', seedUrls: ['https://berrybenka.com/sale'] },
  { name: 'Zilingo', websiteUrl: 'https://zilingo.co.id', categorySlug: 'alisveris', seedUrls: ['https://zilingo.co.id/deals'] },
  { name: 'AliExpress ID', websiteUrl: 'https://id.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://id.aliexpress.com/wholesale', 'https://id.aliexpress.com/campaign/wow/id/sale.htm'] },
  { name: 'Elevenia', websiteUrl: 'https://www.elevenia.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.elevenia.co.id/promo/'] },
  { name: 'Jakmall', websiteUrl: 'https://www.jakmall.com', categorySlug: 'alisveris', seedUrls: ['https://www.jakmall.com/promo', 'https://www.jakmall.com/flashsale'] },
  { name: 'Ralali', websiteUrl: 'https://www.ralali.com', categorySlug: 'alisveris', seedUrls: ['https://www.ralali.com/promo'] },
  { name: 'Matahari', websiteUrl: 'https://www.matahari.com', categorySlug: 'alisveris', seedUrls: ['https://www.matahari.com/promo', 'https://www.matahari.com/sale'] },
  { name: 'Gramedia', websiteUrl: 'https://www.gramedia.com', categorySlug: 'alisveris', seedUrls: ['https://www.gramedia.com/promo', 'https://www.gramedia.com/sale'] },
  { name: 'Ace Hardware Indonesia', websiteUrl: 'https://www.acehardware.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.acehardware.co.id/promo'] },
  { name: 'JYSK Indonesia', websiteUrl: 'https://jysk.co.id', categorySlug: 'alisveris', seedUrls: ['https://jysk.co.id/promo', 'https://jysk.co.id/sale'] },
  { name: 'IKEA Indonesia', websiteUrl: 'https://www.ikea.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.ikea.co.id/in/offers', 'https://www.ikea.co.id/in/ikea-family/offers'] },
  { name: 'Informa', websiteUrl: 'https://www.informa.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.informa.co.id/promo'] },
  { name: 'Courts Indonesia', websiteUrl: 'https://www.courts.co.id', categorySlug: 'alisveris', seedUrls: ['https://www.courts.co.id/promo'] },
  { name: 'Ruparupa', websiteUrl: 'https://www.ruparupa.com', categorySlug: 'alisveris', seedUrls: ['https://www.ruparupa.com/promo', 'https://www.ruparupa.com/sale'] },
  { name: 'Krisbow', websiteUrl: 'https://www.krisbow.com', categorySlug: 'alisveris', seedUrls: ['https://www.krisbow.com/promo'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung Indonesia', websiteUrl: 'https://www.samsung.com/id/', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/id/offer/', 'https://www.samsung.com/id/campaign/'] },
  { name: 'Xiaomi Indonesia', websiteUrl: 'https://www.mi.co.id', categorySlug: 'elektronik', seedUrls: ['https://www.mi.co.id/id/sale/', 'https://www.mi.co.id/id/event/'] },
  { name: 'Apple Indonesia (iBox)', websiteUrl: 'https://ibox.co.id', categorySlug: 'elektronik', seedUrls: ['https://ibox.co.id/promo', 'https://ibox.co.id/sale'] },
  { name: 'Oppo Indonesia', websiteUrl: 'https://www.oppo.com/id/', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/id/offer/', 'https://www.oppo.com/id/events/'] },
  { name: 'Vivo Indonesia', websiteUrl: 'https://www.vivo.com/id', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com/id/campaign', 'https://www.vivo.com/id/promotion'] },
  { name: 'Realme Indonesia', websiteUrl: 'https://www.realme.com/id', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/id/deal'] },
  { name: 'ASUS Indonesia', websiteUrl: 'https://www.asus.com/id/', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/id/campaign/', 'https://www.asus.com/id/events/'] },
  { name: 'Lenovo Indonesia', websiteUrl: 'https://www.lenovo.com/id/in/', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/id/in/d/deals/'] },
  { name: 'HP Indonesia', websiteUrl: 'https://www.hp.com/id-id/', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/id-id/shop/offer.aspx'] },
  { name: 'Dell Indonesia', websiteUrl: 'https://www.dell.com/id-id', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/id-id/lp/deals'] },
  { name: 'Acer Indonesia', websiteUrl: 'https://www.acer.com/id-id', categorySlug: 'elektronik', seedUrls: ['https://www.acer.com/id-id/promotions'] },
  { name: 'LG Indonesia', websiteUrl: 'https://www.lg.com/id/', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/id/promo/'] },
  { name: 'Sony Indonesia', websiteUrl: 'https://www.sony.co.id', categorySlug: 'elektronik', seedUrls: ['https://www.sony.co.id/promo', 'https://www.sony.co.id/campaign'] },
  { name: 'Panasonic Indonesia', websiteUrl: 'https://www.panasonic.com/id/', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/id/promo.html'] },
  { name: 'Sharp Indonesia', websiteUrl: 'https://www.sharp-indonesia.com', categorySlug: 'elektronik', seedUrls: ['https://www.sharp-indonesia.com/promo'] },
  { name: 'Philips Indonesia', websiteUrl: 'https://www.philips.co.id', categorySlug: 'elektronik', seedUrls: ['https://www.philips.co.id/promo'] },
  { name: 'Erafone', websiteUrl: 'https://erafone.com', categorySlug: 'elektronik', seedUrls: ['https://erafone.com/promo', 'https://erafone.com/flash-sale'] },
  { name: 'iBox', websiteUrl: 'https://ibox.co.id', categorySlug: 'elektronik', seedUrls: ['https://ibox.co.id/promo'] },
  { name: 'Electronic City', websiteUrl: 'https://www.electronic-city.com', categorySlug: 'elektronik', seedUrls: ['https://www.electronic-city.com/promo', 'https://www.electronic-city.com/flash-sale'] },
  { name: 'Best Denki Indonesia', websiteUrl: 'https://www.bestdenki.co.id', categorySlug: 'elektronik', seedUrls: ['https://www.bestdenki.co.id/promo'] },
  { name: 'Digimap', websiteUrl: 'https://www.digimap.co.id', categorySlug: 'elektronik', seedUrls: ['https://www.digimap.co.id/promo'] },
  { name: 'Urban Republic', websiteUrl: 'https://www.urbanrepublic.co.id', categorySlug: 'elektronik', seedUrls: ['https://www.urbanrepublic.co.id/promo'] },
  { name: 'Compuzone', websiteUrl: 'https://www.compuzone.co.id', categorySlug: 'elektronik', seedUrls: ['https://www.compuzone.co.id/promo'] },
  { name: 'DataScrip', websiteUrl: 'https://www.datascrip.com', categorySlug: 'elektronik', seedUrls: ['https://www.datascrip.com/promo'] },
  { name: 'Axioo', websiteUrl: 'https://www.axiooworld.com', categorySlug: 'elektronik', seedUrls: ['https://www.axiooworld.com/promo'] },
  { name: 'Advan', websiteUrl: 'https://www.advan.id', categorySlug: 'elektronik', seedUrls: ['https://www.advan.id/promo'] },
  { name: 'Infinix Indonesia', websiteUrl: 'https://www.infinixmobility.com/id', categorySlug: 'elektronik', seedUrls: ['https://www.infinixmobility.com/id/offer'] },
  { name: 'Tecno Indonesia', websiteUrl: 'https://www.tecno-mobile.com/id/', categorySlug: 'elektronik', seedUrls: ['https://www.tecno-mobile.com/id/promo/'] },
  { name: 'Honor Indonesia', websiteUrl: 'https://www.honor.com/id/', categorySlug: 'elektronik', seedUrls: ['https://www.honor.com/id/offer/'] },
  { name: 'Nothing Indonesia', websiteUrl: 'https://id.nothing.tech', categorySlug: 'elektronik', seedUrls: ['https://id.nothing.tech/pages/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Fashion (giyim-moda) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'UNIQLO Indonesia', websiteUrl: 'https://www.uniqlo.com/id/id/', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/id/id/spl/sale', 'https://www.uniqlo.com/id/id/spl/limited-offers'] },
  { name: 'H&M Indonesia', websiteUrl: 'https://www2.hm.com/id_id/', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/id_id/sale.html', 'https://www2.hm.com/id_id/offers.html'] },
  { name: 'Zara Indonesia', websiteUrl: 'https://www.zara.com/id/', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/id/en/z-sale-l1314.html'] },
  { name: 'Cotton On Indonesia', websiteUrl: 'https://cottonon.com/ID/', categorySlug: 'giyim-moda', seedUrls: ['https://cottonon.com/ID/sale/'] },
  { name: 'Pull&Bear Indonesia', websiteUrl: 'https://www.pullandbear.com/id/', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/id/sale-n6417'] },
  { name: 'Mango Indonesia', websiteUrl: 'https://shop.mango.com/id', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/id/sale'] },
  { name: 'Charles & Keith Indonesia', websiteUrl: 'https://www.charleskeith.com/id', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/id/sale'] },
  { name: 'Skechers Indonesia', websiteUrl: 'https://www.skechers.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.skechers.co.id/sale', 'https://www.skechers.co.id/promo'] },
  { name: 'Nike Indonesia', websiteUrl: 'https://www.nike.com/id/', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/id/w/sale-3yaep'] },
  { name: 'Adidas Indonesia', websiteUrl: 'https://www.adidas.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.co.id/sale', 'https://www.adidas.co.id/outlet'] },
  { name: 'Puma Indonesia', websiteUrl: 'https://id.puma.com', categorySlug: 'giyim-moda', seedUrls: ['https://id.puma.com/id/id/sale'] },
  { name: 'New Balance Indonesia', websiteUrl: 'https://www.newbalance.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.newbalance.co.id/sale'] },
  { name: 'Converse Indonesia', websiteUrl: 'https://www.converse.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.converse.co.id/sale'] },
  { name: 'Vans Indonesia', websiteUrl: 'https://www.vans.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.vans.co.id/sale'] },
  { name: 'Eiger', websiteUrl: 'https://eigeradventure.com', categorySlug: 'giyim-moda', seedUrls: ['https://eigeradventure.com/promo', 'https://eigeradventure.com/sale'] },
  { name: 'Brodo', websiteUrl: 'https://www.bfrodo.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.bfrodo.com/sale'] },
  { name: 'Erigo', websiteUrl: 'https://erfrigo.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://erfrigo.co.id/sale', 'https://erfrigo.co.id/promo'] },
  { name: 'This Is April', websiteUrl: 'https://www.thisisapril.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.thisisapril.com/sale'] },
  { name: 'Cottonink', websiteUrl: 'https://www.cottonink.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.cottonink.co.id/sale'] },
  { name: 'Hijup', websiteUrl: 'https://www.hijup.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.hijup.com/sale', 'https://www.hijup.com/promo'] },
  { name: 'Buttonscarves', websiteUrl: 'https://www.buttonscarves.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.buttonscarves.com/sale'] },
  { name: 'ELHAUS', websiteUrl: 'https://elfrhaus.com', categorySlug: 'giyim-moda', seedUrls: ['https://elfrhaus.com/sale'] },
  { name: '3Second', websiteUrl: 'https://www.3second.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.3second.co.id/sale', 'https://www.3second.co.id/promo'] },
  { name: 'Greenlight', websiteUrl: 'https://www.greenlightclothing.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.greenlightclothing.co.id/sale'] },
  { name: 'The Executive', websiteUrl: 'https://www.executive.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.executive.co.id/sale'] },
  { name: 'Hammer', websiteUrl: 'https://www.hammer.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.hammer.co.id/sale'] },
  { name: 'Cardinal', websiteUrl: 'https://www.cardinal.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.cardinal.co.id/sale', 'https://www.cardinal.co.id/promo'] },
  { name: 'Polo Ralph Lauren ID', websiteUrl: 'https://www.ralphlauren.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.ralphlauren.co.id/sale'] },
  { name: 'Marks & Spencer Indonesia', websiteUrl: 'https://www.marksandspencer.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.marksandspencer.co.id/sale'] },
  { name: 'Payless Indonesia', websiteUrl: 'https://www.payless.co.id', categorySlug: 'giyim-moda', seedUrls: ['https://www.payless.co.id/sale', 'https://www.payless.co.id/promo'] },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA Indonesia (Home)', websiteUrl: 'https://www.ikea.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.co.id/in/offers', 'https://www.ikea.co.id/in/last-chance'] },
  { name: 'Informa (Home)', websiteUrl: 'https://www.informa.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.informa.co.id/promo', 'https://www.informa.co.id/sale'] },
  { name: 'ACE Hardware Indonesia (Home)', websiteUrl: 'https://www.acehardware.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.acehardware.co.id/promo'] },
  { name: 'Ruparupa (Home)', websiteUrl: 'https://www.ruparupa.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ruparupa.com/promo', 'https://www.ruparupa.com/diskon'] },
  { name: 'Courts Indonesia (Home)', websiteUrl: 'https://www.courts.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.courts.co.id/promo'] },
  { name: 'JYSK Indonesia (Home)', websiteUrl: 'https://jysk.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://jysk.co.id/promo'] },
  { name: 'Dekoruma', websiteUrl: 'https://www.dekoruma.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.dekoruma.com/promo', 'https://www.dekoruma.com/sale'] },
  { name: 'Fabelio', websiteUrl: 'https://fabelio.com', categorySlug: 'ev-yasam', seedUrls: ['https://fabelio.com/sale', 'https://fabelio.com/promo'] },
  { name: 'Krisbow (Home)', websiteUrl: 'https://www.krisbow.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.krisbow.com/promo'] },
  { name: 'Index Living Mall Indonesia', websiteUrl: 'https://www.indexlivingmall.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.indexlivingmall.co.id/promo'] },
  { name: 'Vinoti Living', websiteUrl: 'https://www.vinotiliving.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.vinotiliving.com/promo'] },
  { name: 'Melandas', websiteUrl: 'https://www.mfrelandas.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.mfrelandas.co.id/promo'] },
  { name: 'TOTO Indonesia', websiteUrl: 'https://www.toto.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.toto.co.id/promo'] },
  { name: 'Kohler Indonesia', websiteUrl: 'https://www.kohler.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.kohler.co.id/promo'] },
  { name: 'American Standard Indonesia', websiteUrl: 'https://www.americanstandard.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.americanstandard.co.id/promo'] },
  { name: 'Tupperware Indonesia', websiteUrl: 'https://www.tupperware.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.tupperware.co.id/promo'] },
  { name: 'Lock & Lock Indonesia', websiteUrl: 'https://www.locknlock.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.locknlock.co.id/promo'] },
  { name: 'Philips Home Indonesia', websiteUrl: 'https://www.philips.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.philips.co.id/c/penawaran/'] },
  { name: 'Electrolux Indonesia', websiteUrl: 'https://www.electrolux.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.electrolux.co.id/promotion/'] },
  { name: 'Samsung Home Indonesia', websiteUrl: 'https://www.samsung.com/id/', categorySlug: 'ev-yasam', seedUrls: ['https://www.samsung.com/id/offer/home-appliances/'] },
  { name: 'LG Home Indonesia', websiteUrl: 'https://www.lg.com/id/', categorySlug: 'ev-yasam', seedUrls: ['https://www.lg.com/id/promo/'] },
  { name: 'Modena Indonesia', websiteUrl: 'https://www.modena.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.modena.co.id/promo'] },
  { name: 'Ariston Indonesia', websiteUrl: 'https://www.ariston.com/id-id/', categorySlug: 'ev-yasam', seedUrls: ['https://www.ariston.com/id-id/promo/'] },
  { name: 'Rinnai Indonesia', websiteUrl: 'https://www.rinnai.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.rinnai.co.id/promo'] },
  { name: 'Daikin Indonesia', websiteUrl: 'https://www.daikin.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.daikin.co.id/promo'] },
  { name: 'Panasonic Home Indonesia', websiteUrl: 'https://www.panasonic.com/id/', categorySlug: 'ev-yasam', seedUrls: ['https://www.panasonic.com/id/promo.html'] },
  { name: 'Sharp Home Indonesia', websiteUrl: 'https://www.sharp-indonesia.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.sharp-indonesia.com/promo'] },
  { name: 'Florence Indonesia', websiteUrl: 'https://www.florence.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.florence.co.id/promo'] },
  { name: 'Olympic Furniture', websiteUrl: 'https://www.olympicfurniture.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.olympicfurniture.co.id/promo'] },
  { name: 'Atria Furniture', websiteUrl: 'https://www.atfrria.co.id', categorySlug: 'ev-yasam', seedUrls: ['https://www.atfrria.co.id/promo'] },

  // ═══════════════════════════════════════════════════════
  // 5) Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Alfamart', websiteUrl: 'https://alfamart.co.id', categorySlug: 'gida-market', seedUrls: ['https://alfamart.co.id/promo', 'https://alfamart.co.id/promo-jsm'] },
  { name: 'Indomaret', websiteUrl: 'https://www.indomaret.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.indomaret.co.id/promo', 'https://www.indomaret.co.id/promo/super-hemat'] },
  { name: 'HappyFresh', websiteUrl: 'https://www.happyfresh.id', categorySlug: 'gida-market', seedUrls: ['https://www.happyfresh.id/promo/'] },
  { name: 'Sayurbox', websiteUrl: 'https://www.sayurbox.com', categorySlug: 'gida-market', seedUrls: ['https://www.sayurbox.com/promo'] },
  { name: 'TaniHub', websiteUrl: 'https://tanihub.com', categorySlug: 'gida-market', seedUrls: ['https://tanihub.com/promo'] },
  { name: 'Segari', websiteUrl: 'https://segari.id', categorySlug: 'gida-market', seedUrls: ['https://segari.id/promo'] },
  { name: 'Astro', websiteUrl: 'https://www.astronauts.id', categorySlug: 'gida-market', seedUrls: ['https://www.astronauts.id/promo'] },
  { name: 'Klik Indomaret', websiteUrl: 'https://www.klikindomaret.com', categorySlug: 'gida-market', seedUrls: ['https://www.klikindomaret.com/promo', 'https://www.klikindomaret.com/page/promo-hemat'] },
  { name: 'Alfagift', websiteUrl: 'https://alfagift.id', categorySlug: 'gida-market', seedUrls: ['https://alfagift.id/promo'] },
  { name: 'Lotte Mart Indonesia', websiteUrl: 'https://www.lottemart.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.lottemart.co.id/promo'] },
  { name: 'Hypermart', websiteUrl: 'https://www.hypermart.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.hypermart.co.id/promo'] },
  { name: 'Giant Indonesia', websiteUrl: 'https://giant.co.id', categorySlug: 'gida-market', seedUrls: ['https://giant.co.id/promo'] },
  { name: 'Transmart', websiteUrl: 'https://www.transmart.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.transmart.co.id/promo'] },
  { name: 'Farmers Market Indonesia', websiteUrl: 'https://www.farmersmarket.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.farmersmarket.co.id/promo'] },
  { name: 'Ranch Market', websiteUrl: 'https://www.rfranchmarket.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.rfranchmarket.co.id/promo'] },
  { name: 'Food Hall', websiteUrl: 'https://www.foodhall.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.foodhall.co.id/promo'] },
  { name: 'Grand Lucky', websiteUrl: 'https://www.grandlucky.com', categorySlug: 'gida-market', seedUrls: ['https://www.grandlucky.com/promo'] },
  { name: 'Superindo', websiteUrl: 'https://www.superindo.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.superindo.co.id/promo', 'https://www.superindo.co.id/promo-hemat'] },
  { name: 'Foodmart', websiteUrl: 'https://www.foodmart.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.foodmart.co.id/promo'] },
  { name: 'Hero Supermarket', websiteUrl: 'https://www.hero.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.hero.co.id/promo'] },
  { name: 'Yogya', websiteUrl: 'https://www.yogyagroup.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.yogyagroup.co.id/promo'] },
  { name: 'Borma', websiteUrl: 'https://www.borma.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.borma.co.id/promo'] },
  { name: 'Ada Swalayan', websiteUrl: 'https://www.adaswalayan.com', categorySlug: 'gida-market', seedUrls: ['https://www.adaswalayan.com/promo'] },
  { name: 'Tip Top', websiteUrl: 'https://www.tfriptop.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.tfriptop.co.id/promo'] },
  { name: 'Hari Hari', websiteUrl: 'https://www.harihari.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.harihari.co.id/promo'] },
  { name: 'Carrefour Indonesia', websiteUrl: 'https://www.transmart.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.transmart.co.id/promo'] },
  { name: 'Lottemart', websiteUrl: 'https://www.lottemart.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.lottemart.co.id/promo'] },
  { name: 'KKV', websiteUrl: 'https://www.kkv.com', categorySlug: 'gida-market', seedUrls: ['https://www.kkv.com/promo'] },
  { name: 'Miniso Indonesia', websiteUrl: 'https://www.miniso.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.miniso.co.id/promo'] },
  { name: 'Daiso Indonesia', websiteUrl: 'https://www.dfraisojapan.co.id', categorySlug: 'gida-market', seedUrls: ['https://www.dfraisojapan.co.id/promo'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Dining (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'GoFood', websiteUrl: 'https://gofood.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://gofood.co.id/promo', 'https://www.gojek.com/gofood/promo/'] },
  { name: 'GrabFood', websiteUrl: 'https://food.grab.com/id/', categorySlug: 'yeme-icme', seedUrls: ['https://food.grab.com/id/en/promo', 'https://www.grab.com/id/promo/food/'] },
  { name: 'ShopeeFood', websiteUrl: 'https://shopee.co.id/m/shopeefood', categorySlug: 'yeme-icme', seedUrls: ['https://shopee.co.id/m/shopeefood-promo'] },
  { name: "McDonald's Indonesia", websiteUrl: 'https://www.mcdonalds.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.co.id/promo'] },
  { name: 'KFC Indonesia', websiteUrl: 'https://kfrfcindonesia.com', categorySlug: 'yeme-icme', seedUrls: ['https://kfrfcindonesia.com/promo'] },
  { name: 'Pizza Hut Indonesia', websiteUrl: 'https://www.pizzahut.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.co.id/promo'] },
  { name: 'Burger King Indonesia', websiteUrl: 'https://www.burgerking.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.co.id/promo'] },
  { name: "Domino's Pizza Indonesia", websiteUrl: 'https://www.dominos.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.co.id/promo'] },
  { name: 'Starbucks Indonesia', websiteUrl: 'https://www.starbucks.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.co.id/promo'] },
  { name: 'J.CO Indonesia', websiteUrl: 'https://jfrco.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://jfrco.co.id/promo'] },
  { name: 'Chatime Indonesia', websiteUrl: 'https://www.chatime.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.chatime.co.id/promo'] },
  { name: 'Kopi Kenangan', websiteUrl: 'https://www.kopikenangan.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kopikenangan.com/promo'] },
  { name: 'Janji Jiwa', websiteUrl: 'https://janjijiwa.com', categorySlug: 'yeme-icme', seedUrls: ['https://janjijiwa.com/promo'] },
  { name: 'Fore Coffee', websiteUrl: 'https://fore.coffee', categorySlug: 'yeme-icme', seedUrls: ['https://fore.coffee/promo'] },
  { name: 'HokBen', websiteUrl: 'https://www.hokfrben.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.hokfrben.co.id/promo'] },
  { name: 'Yoshinoya Indonesia', websiteUrl: 'https://www.yoshinoya.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.yoshinoya.co.id/promo'] },
  { name: 'Marugame Udon Indonesia', websiteUrl: 'https://www.marfrugame-udon.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.marfrugame-udon.co.id/promo'] },
  { name: 'Pepper Lunch Indonesia', websiteUrl: 'https://www.pepperlunch.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.pepperlunch.co.id/promo'] },
  { name: 'Solaria', websiteUrl: 'https://www.solaria.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.solaria.co.id/promo'] },
  { name: 'Es Teler 77', websiteUrl: 'https://www.esteler77.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.esteler77.com/promo'] },
  { name: 'Bakmi GM', websiteUrl: 'https://www.bakmigm.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.bakmigm.com/promo'] },
  { name: 'CFC Indonesia', websiteUrl: 'https://www.cfcindonesia.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.cfcindonesia.com/promo'] },
  { name: 'A&W Indonesia', websiteUrl: 'https://www.awrestaurants.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.awrestaurants.co.id/promo'] },
  { name: 'Texas Chicken Indonesia', websiteUrl: 'https://www.texaschickenindonesia.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.texaschickenindonesia.com/promo'] },
  { name: "Wendy's Indonesia", websiteUrl: 'https://www.wendys.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.wendys.co.id/promo'] },
  { name: 'PHD (Pizza Hut Delivery)', websiteUrl: 'https://www.phd.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.phd.co.id/promo'] },
  { name: 'Richeese Factory', websiteUrl: 'https://www.richeesefactory.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.richeesefactory.com/promo'] },
  { name: 'Mie Gacoan', websiteUrl: 'https://www.mfriegacoan.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.mfriegacoan.co.id/promo'] },
  { name: 'Mixue Indonesia', websiteUrl: 'https://www.mixue.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://www.mixue.co.id/promo'] },
  { name: 'Haus Indonesia', websiteUrl: 'https://haus.co.id', categorySlug: 'yeme-icme', seedUrls: ['https://haus.co.id/promo'] },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty (kozmetik-kisisel-bakim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sociolla (Beauty)', websiteUrl: 'https://www.sociolla.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sociolla.com/promo', 'https://www.sociolla.com/sale'] },
  { name: 'Sephora Indonesia (Beauty)', websiteUrl: 'https://www.sephora.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.co.id/sale', 'https://www.sephora.co.id/promo'] },
  { name: 'Guardian Indonesia', websiteUrl: 'https://www.guardian.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.guardian.co.id/promo', 'https://www.guardian.co.id/offers'] },
  { name: 'Watsons Indonesia', websiteUrl: 'https://www.watsons.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.watsons.co.id/promo', 'https://www.watsons.co.id/offers'] },
  { name: 'The Body Shop Indonesia', websiteUrl: 'https://www.thebodyshop.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.co.id/promo', 'https://www.thebodyshop.co.id/sale'] },
  { name: "L'Oreal Indonesia", websiteUrl: 'https://www.loreal-paris.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.co.id/promo'] },
  { name: 'Maybelline Indonesia', websiteUrl: 'https://www.maybelline.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.co.id/promo'] },
  { name: 'NYX Indonesia', websiteUrl: 'https://www.nyxcosmetics.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.co.id/promo'] },
  { name: 'Make Over', websiteUrl: 'https://www.makeovefrrid.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.makeovefrrid.com/promo'] },
  { name: 'Wardah', websiteUrl: 'https://www.wardahbeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.wardahbeauty.com/promo'] },
  { name: 'Emina', websiteUrl: 'https://www.eminacosmetics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eminacosmetics.com/promo'] },
  { name: 'Somethinc', websiteUrl: 'https://www.somethinc.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.somethinc.com/promo', 'https://www.somethinc.com/sale'] },
  { name: 'Avoskin', websiteUrl: 'https://avoskinbeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://avoskinbeauty.com/promo'] },
  { name: 'Skintific', websiteUrl: 'https://www.skintific.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.skintific.co.id/promo'] },
  { name: 'Whitelab', websiteUrl: 'https://www.whitelab.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.whitelab.co.id/promo'] },
  { name: 'NPURE', websiteUrl: 'https://npfrure.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://npfrure.co.id/promo'] },
  { name: 'Bio Beauty Lab', websiteUrl: 'https://www.biobeautylab.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.biobeautylab.com/promo'] },
  { name: 'Scarlett Whitening', websiteUrl: 'https://www.scarlettwhitening.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.scarlettwhitening.com/promo'] },
  { name: 'MS Glow', websiteUrl: 'https://www.msglowid.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.msglowid.com/promo'] },
  { name: 'YOU Beauty', websiteUrl: 'https://www.youbeauty.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.youbeauty.id/promo'] },
  { name: 'Luxcrime', websiteUrl: 'https://www.luxcrime.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.luxcrime.co.id/promo'] },
  { name: 'BLP Beauty', websiteUrl: 'https://blfrpbeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://blfrpbeauty.com/promo'] },
  { name: 'Dear Me Beauty', websiteUrl: 'https://www.dearmebeauty.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dearmebeauty.com/promo'] },
  { name: 'Rollover Reaction', websiteUrl: 'https://rollfrover-reaction.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://rollfrover-reaction.com/promo'] },
  { name: 'Elsheskin', websiteUrl: 'https://elsheskin.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://elsheskin.com/promo'] },
  { name: 'Mineral Botanica', websiteUrl: 'https://www.mineralbotanica.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mineralbotanica.com/promo'] },
  { name: 'Sensatia Botanicals', websiteUrl: 'https://sensfratiabotanicals.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://sensfratiabotanicals.com/promo'] },
  { name: 'Nature Republic Indonesia', websiteUrl: 'https://www.naturerepublic.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.naturerepublic.co.id/promo'] },
  { name: 'Innisfree Indonesia', websiteUrl: 'https://www.innisfree.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.innisfree.co.id/promo'] },
  { name: 'COSRX Indonesia', websiteUrl: 'https://www.cosrx.co.id', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cosrx.co.id/promo'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nike Indonesia (Sports)', websiteUrl: 'https://www.nike.com/id/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/id/w/sale-3yaep'] },
  { name: 'Adidas Indonesia (Sports)', websiteUrl: 'https://www.adidas.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.co.id/sale'] },
  { name: 'Puma Indonesia (Sports)', websiteUrl: 'https://id.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://id.puma.com/id/id/sale'] },
  { name: 'Under Armour Indonesia', websiteUrl: 'https://www.underarmour.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.co.id/sale'] },
  { name: 'Reebok Indonesia', websiteUrl: 'https://www.refrreebok.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.refrreebok.co.id/sale'] },
  { name: 'New Balance Indonesia (Sports)', websiteUrl: 'https://www.newbalance.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.co.id/sale'] },
  { name: 'Skechers Indonesia (Sports)', websiteUrl: 'https://www.skechers.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.co.id/sale'] },
  { name: 'ASICS Indonesia', websiteUrl: 'https://www.asics.com/id/id-id/', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/id/id-id/sale/'] },
  { name: 'Fila Indonesia', websiteUrl: 'https://www.fila.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.co.id/sale'] },
  { name: 'Converse Indonesia (Sports)', websiteUrl: 'https://www.converse.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.co.id/sale'] },
  { name: 'Eiger (Sports)', websiteUrl: 'https://eigeradventure.com', categorySlug: 'spor-outdoor', seedUrls: ['https://eigeradventure.com/promo', 'https://eigeradventure.com/sale'] },
  { name: 'Consina', websiteUrl: 'https://www.consina.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.consina.com/promo'] },
  { name: 'REI Indonesia', websiteUrl: 'https://www.rei.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.rei.co.id/promo'] },
  { name: 'Arei', websiteUrl: 'https://www.arfreioutdoorgear.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.arfreioutdoorgear.com/promo'] },
  { name: 'Bodypack', websiteUrl: 'https://www.bodypack.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bodypack.co.id/sale', 'https://www.bodypack.co.id/promo'] },
  { name: 'Kalibre', websiteUrl: 'https://kalibre.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://kalibre.co.id/promo'] },
  { name: 'Specs', websiteUrl: 'https://www.specs.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.specs.co.id/sale', 'https://www.specs.co.id/promo'] },
  { name: 'Mills', websiteUrl: 'https://www.millssport.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.millssport.co.id/promo'] },
  { name: 'Ortuseight', websiteUrl: 'https://www.ortuseight.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ortuseight.com/promo'] },
  { name: 'Decathlon Indonesia', websiteUrl: 'https://www.decathlon.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.co.id/id/promo', 'https://www.decathlon.co.id/id/sale'] },
  { name: 'Planet Sports', websiteUrl: 'https://www.planetsports.asia', categorySlug: 'spor-outdoor', seedUrls: ['https://www.planetsports.asia/sale'] },
  { name: 'Sports Station', websiteUrl: 'https://www.sfrportsstation.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sfrportsstation.co.id/sale'] },
  { name: 'MAP Active', websiteUrl: 'https://www.mapactive.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mapactive.co.id/promo'] },
  { name: 'Garmin Indonesia', websiteUrl: 'https://www.garmin.co.id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.garmin.co.id/promo/'] },
  { name: 'Fitbit Indonesia', websiteUrl: 'https://www.fitbit.com/id', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitbit.com/id/sale'] },
  { name: 'GoPro Indonesia', websiteUrl: 'https://gopro.com/id/id/', categorySlug: 'spor-outdoor', seedUrls: ['https://gopro.com/id/id/deals'] },
  { name: 'Polygon', websiteUrl: 'https://www.polygonbikes.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.polygonbikes.com/promo/', 'https://www.polygonbikes.com/sale/'] },
  { name: 'United Bike', websiteUrl: 'https://www.unitedbike.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.unitedbike.com/promo'] },
  { name: 'Pacific Bike', websiteUrl: 'https://www.pacificbikes.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.pacificbikes.com/promo'] },
  { name: 'Brompton Indonesia', websiteUrl: 'https://www.brompton.com/find-a-dealer/indonesia', categorySlug: 'spor-outdoor', seedUrls: ['https://www.brompton.com/sale'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Traveloka', websiteUrl: 'https://www.traveloka.com/id-id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.traveloka.com/id-id/promotion', 'https://www.traveloka.com/id-id/promo'] },
  { name: 'Tiket.com', websiteUrl: 'https://www.tiket.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tiket.com/promo', 'https://www.tiket.com/info/promo'] },
  { name: 'Pegipegi', websiteUrl: 'https://www.pegipegi.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pegipegi.com/promo/'] },
  { name: 'Agoda Indonesia', websiteUrl: 'https://www.agoda.com/id-id/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/id-id/deals'] },
  { name: 'Booking.com Indonesia', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.html'] },
  { name: 'Airbnb Indonesia', websiteUrl: 'https://www.airbnb.co.id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.co.id/deals'] },
  { name: 'Trip.com Indonesia', websiteUrl: 'https://id.trip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://id.trip.com/sale/deals'] },
  { name: 'KAI Access', websiteUrl: 'https://www.kai.id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kai.id/promo'] },
  { name: 'Garuda Indonesia', websiteUrl: 'https://www.garuda-indonesia.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.garuda-indonesia.com/id/id/special-offers/'] },
  { name: 'Lion Air', websiteUrl: 'https://www.lionair.co.id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lionair.co.id/promo'] },
  { name: 'Citilink', websiteUrl: 'https://www.citilink.co.id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.citilink.co.id/promo'] },
  { name: 'AirAsia Indonesia', websiteUrl: 'https://www.airasia.com/id/id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airasia.com/id/id/promotions.page'] },
  { name: 'Batik Air', websiteUrl: 'https://www.batikair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.batikair.com/promo'] },
  { name: 'Pelni', websiteUrl: 'https://www.pelni.co.id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pelni.co.id/promo'] },
  { name: 'Blue Bird', websiteUrl: 'https://www.bluebirdgroup.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bluebirdgroup.com/promo'] },
  { name: 'Grab Indonesia', websiteUrl: 'https://www.grab.com/id/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.grab.com/id/promo/'] },
  { name: 'Gojek', websiteUrl: 'https://www.gojek.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.gojek.com/promo/', 'https://www.gojek.com/blog/promo/'] },
  { name: 'InDrive Indonesia', websiteUrl: 'https://indrive.com/id/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://indrive.com/id/promo'] },
  { name: 'Maxim Indonesia', websiteUrl: 'https://taximaxim.com/id/id/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://taximaxim.com/id/id/promo'] },
  { name: 'Bluebird', websiteUrl: 'https://www.bluebirdgroup.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bluebirdgroup.com/promo'] },
  { name: 'Transjakarta', websiteUrl: 'https://transjakarta.co.id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://transjakarta.co.id/promo'] },
  { name: 'KRL Access', websiteUrl: 'https://www.krl.co.id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.krl.co.id/promo'] },
  { name: 'MRT Jakarta', websiteUrl: 'https://www.jakartamrt.co.id', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jakartamrt.co.id/promo'] },
  { name: 'Klook Indonesia', websiteUrl: 'https://www.klook.com/id/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klook.com/id/promo/', 'https://www.klook.com/id/promos/deals/'] },
  { name: 'GetYourGuide Indonesia', websiteUrl: 'https://www.getyourguide.com/indonesia-l205/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.getyourguide.com/indonesia-l205/'] },
  { name: 'RedDoorz', websiteUrl: 'https://www.reddoorz.com/id-id/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.reddoorz.com/id-id/deals'] },
  { name: 'OYO Indonesia', websiteUrl: 'https://www.oyorooms.com/id/', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.oyorooms.com/id/offers'] },
  { name: 'Airy', websiteUrl: 'https://www.airyrooms.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airyrooms.com/promo'] },
  { name: 'ZEN Rooms', websiteUrl: 'https://www.zenrooms.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.zenrooms.com/deals'] },
  { name: 'Nusatrip', websiteUrl: 'https://www.nusatrip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nusatrip.com/id/promo'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'BCA', websiteUrl: 'https://www.bca.co.id', categorySlug: 'finans', seedUrls: ['https://www.bca.co.id/id/informasi/promo'] },
  { name: 'BRI', websiteUrl: 'https://bri.co.id', categorySlug: 'finans', seedUrls: ['https://bri.co.id/promo'] },
  { name: 'BNI', websiteUrl: 'https://www.bni.co.id', categorySlug: 'finans', seedUrls: ['https://www.bni.co.id/id-id/promo'] },
  { name: 'Bank Mandiri', websiteUrl: 'https://www.bankmandiri.co.id', categorySlug: 'finans', seedUrls: ['https://www.bankmandiri.co.id/promo'] },
  { name: 'CIMB Niaga', websiteUrl: 'https://www.cimbniaga.co.id', categorySlug: 'finans', seedUrls: ['https://www.cimbniaga.co.id/id/personal/promo'] },
  { name: 'Danamon', websiteUrl: 'https://www.danamon.co.id', categorySlug: 'finans', seedUrls: ['https://www.danamon.co.id/id/personal/promo'] },
  { name: 'OCBC NISP', websiteUrl: 'https://www.ocbcnisp.com', categorySlug: 'finans', seedUrls: ['https://www.ocbcnisp.com/id/promo'] },
  { name: 'Permata Bank', websiteUrl: 'https://www.permatabank.com', categorySlug: 'finans', seedUrls: ['https://www.permatabank.com/id/promo-penawaran/'] },
  { name: 'Jenius (BTPN)', websiteUrl: 'https://www.jenius.com', categorySlug: 'finans', seedUrls: ['https://www.jenius.com/promo'] },
  { name: 'Bank Jago', websiteUrl: 'https://www.jfrago.com', categorySlug: 'finans', seedUrls: ['https://www.jfrago.com/promo'] },
  { name: 'Blu by BCA', websiteUrl: 'https://blu.bca.co.id', categorySlug: 'finans', seedUrls: ['https://blu.bca.co.id/promo'] },
  { name: 'Livin by Mandiri', websiteUrl: 'https://livin.mandiri.co.id', categorySlug: 'finans', seedUrls: ['https://livin.mandiri.co.id/promo'] },
  { name: 'BRImo', websiteUrl: 'https://brfrimo.bri.co.id', categorySlug: 'finans', seedUrls: ['https://brfrimo.bri.co.id/promo'] },
  { name: 'myBCA', websiteUrl: 'https://mybca.bca.co.id', categorySlug: 'finans', seedUrls: ['https://www.bca.co.id/id/informasi/promo'] },
  { name: 'OVO', websiteUrl: 'https://www.ovo.id', categorySlug: 'finans', seedUrls: ['https://www.ovo.id/promo', 'https://www.ovo.id/deals'] },
  { name: 'GoPay', websiteUrl: 'https://www.gojek.com/gopay/', categorySlug: 'finans', seedUrls: ['https://www.gojek.com/gopay/promo/'] },
  { name: 'DANA', websiteUrl: 'https://www.dana.id', categorySlug: 'finans', seedUrls: ['https://www.dana.id/promo'] },
  { name: 'ShopeePay', websiteUrl: 'https://shopee.co.id/m/shopeepay', categorySlug: 'finans', seedUrls: ['https://shopee.co.id/m/shopeepay-deals'] },
  { name: 'LinkAja', websiteUrl: 'https://www.linkaja.id', categorySlug: 'finans', seedUrls: ['https://www.linkaja.id/promo'] },
  { name: 'Kredivo', websiteUrl: 'https://www.kredivo.com', categorySlug: 'finans', seedUrls: ['https://www.kredivo.com/promo'] },
  { name: 'Akulaku', websiteUrl: 'https://www.akulaku.com', categorySlug: 'finans', seedUrls: ['https://www.akulaku.com/promo'] },
  { name: 'Home Credit Indonesia', websiteUrl: 'https://www.homecredit.co.id', categorySlug: 'finans', seedUrls: ['https://www.homecredit.co.id/promo'] },
  { name: 'Paylater by Traveloka', websiteUrl: 'https://www.traveloka.com/id-id/paylater', categorySlug: 'finans', seedUrls: ['https://www.traveloka.com/id-id/promotion'] },
  { name: 'Indodana', websiteUrl: 'https://www.indodana.com', categorySlug: 'finans', seedUrls: ['https://www.indodana.com/promo'] },
  { name: 'Flip', websiteUrl: 'https://flip.id', categorySlug: 'finans', seedUrls: ['https://flip.id/promo'] },
  { name: 'Wise Indonesia', websiteUrl: 'https://wise.com/id/', categorySlug: 'finans', seedUrls: ['https://wise.com/id/promo'] },
  { name: 'Tokopedia Saldo', websiteUrl: 'https://www.tokopedia.com', categorySlug: 'finans', seedUrls: ['https://www.tokopedia.com/promo/saldo'] },
  { name: 'Blibli PayLater', websiteUrl: 'https://www.blibli.com', categorySlug: 'finans', seedUrls: ['https://www.blibli.com/promosi/paylater'] },
  { name: 'Bank Neo Commerce', websiteUrl: 'https://www.bankneo.co.id', categorySlug: 'finans', seedUrls: ['https://www.bankneo.co.id/promo'] },
  { name: 'Seabank Indonesia', websiteUrl: 'https://www.seabank.co.id', categorySlug: 'finans', seedUrls: ['https://www.seabank.co.id/promo'] },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Prudential Indonesia', websiteUrl: 'https://www.prudential.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.prudential.co.id/id/promo/'] },
  { name: 'AIA Indonesia', websiteUrl: 'https://www.aia.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.aia.co.id/id/promo.html'] },
  { name: 'Allianz Indonesia', websiteUrl: 'https://www.allianz.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.co.id/promo'] },
  { name: 'AXA Mandiri', websiteUrl: 'https://www.axa-mandiri.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.axa-mandiri.co.id/promo/'] },
  { name: 'Manulife Indonesia', websiteUrl: 'https://www.manulife.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.manulife.co.id/id/promo.html'] },
  { name: 'BRI Life', websiteUrl: 'https://www.brilife.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.brilife.co.id/promo'] },
  { name: 'Sinarmas MSIG', websiteUrl: 'https://www.sfrinarmasmsiglife.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.sfrinarmasmsiglife.co.id/promo'] },
  { name: 'FWD Insurance Indonesia', websiteUrl: 'https://www.fwd.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.fwd.co.id/promo/'] },
  { name: 'Zurich Indonesia', websiteUrl: 'https://www.zurich.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.co.id/id-id/promo'] },
  { name: 'Great Eastern Indonesia', websiteUrl: 'https://www.greateasternlife.com/id/', categorySlug: 'sigorta', seedUrls: ['https://www.greateasternlife.com/id/id/promo.html'] },
  { name: 'Cigna Indonesia', websiteUrl: 'https://www.cigna.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.cigna.co.id/promo'] },
  { name: 'Generali Indonesia', websiteUrl: 'https://www.generali.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.generali.co.id/id/promo'] },
  { name: 'Astra Life', websiteUrl: 'https://www.astralife.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.astralife.co.id/promo'] },
  { name: 'BNI Life', websiteUrl: 'https://www.bfrni-life.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.bfrni-life.co.id/promo'] },
  { name: 'Chubb Life Indonesia', websiteUrl: 'https://www.chubblife.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.chubblife.co.id/promo'] },
  { name: 'Avrist', websiteUrl: 'https://www.avrist.com', categorySlug: 'sigorta', seedUrls: ['https://www.avrist.com/promo'] },
  { name: 'Sequis', websiteUrl: 'https://www.sequis.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.sequis.co.id/id/promo'] },
  { name: 'Panin Dai-ichi Life', websiteUrl: 'https://www.paninlife.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.paninlife.co.id/promo'] },
  { name: 'Capital Life', websiteUrl: 'https://www.capitallife.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.capitallife.co.id/promo'] },
  { name: 'Tugu Insurance', websiteUrl: 'https://www.tfrugu.com', categorySlug: 'sigorta', seedUrls: ['https://www.tfrugu.com/promo'] },
  { name: 'Asuransi Simas Net', websiteUrl: 'https://www.simasnet.com', categorySlug: 'sigorta', seedUrls: ['https://www.simasnet.com/promo'] },
  { name: 'Astra Buana', websiteUrl: 'https://www.afrsuransiastrabuana.com', categorySlug: 'sigorta', seedUrls: ['https://www.afrsuransiastrabuana.com/promo'] },
  { name: 'Adira Insurance', websiteUrl: 'https://www.afrdirafrstransaksi.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.afrdirafrstransaksi.co.id/promo'] },
  { name: 'Sompo Insurance Indonesia', websiteUrl: 'https://www.sompo.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.sompo.co.id/promo'] },
  { name: 'Tokio Marine Indonesia', websiteUrl: 'https://www.tokiomarine.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.tokiomarine.co.id/promo'] },
  { name: 'Lippo General Insurance', websiteUrl: 'https://www.lippoinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.lippoinsurance.com/promo'] },
  { name: 'Jasindo', websiteUrl: 'https://www.jasindo.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.jasindo.co.id/promo'] },
  { name: 'MSIG Indonesia', websiteUrl: 'https://www.msig.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.msig.co.id/promo'] },
  { name: 'Asuransi MAG', websiteUrl: 'https://www.mag.co.id', categorySlug: 'sigorta', seedUrls: ['https://www.mag.co.id/promo'] },
  { name: 'Lifepal', websiteUrl: 'https://lifepal.co.id', categorySlug: 'sigorta', seedUrls: ['https://lifepal.co.id/promo/', 'https://lifepal.co.id/promo/asuransi/'] },

  // ═══════════════════════════════════════════════════════
  // 12) Automotive (otomobil) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Toyota Indonesia', websiteUrl: 'https://www.toyota.astra.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.astra.co.id/promo'] },
  { name: 'Honda Indonesia', websiteUrl: 'https://www.honda-indonesia.com', categorySlug: 'otomobil', seedUrls: ['https://www.honda-indonesia.com/promo'] },
  { name: 'Suzuki Indonesia', websiteUrl: 'https://www.suzuki.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.co.id/promo'] },
  { name: 'Daihatsu Indonesia', websiteUrl: 'https://dfraihatsu.co.id', categorySlug: 'otomobil', seedUrls: ['https://dfraihatsu.co.id/promo'] },
  { name: 'Mitsubishi Motors Indonesia', websiteUrl: 'https://www.mitsubishi-motors.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.co.id/promo'] },
  { name: 'Hyundai Indonesia', websiteUrl: 'https://www.hyundai.com/id/id', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/id/id/campaign-offers.html'] },
  { name: 'Wuling Indonesia', websiteUrl: 'https://wfruling.id', categorySlug: 'otomobil', seedUrls: ['https://wfruling.id/promo'] },
  { name: 'Nissan Indonesia', websiteUrl: 'https://www.nissan.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.co.id/offers.html'] },
  { name: 'BMW Indonesia', websiteUrl: 'https://www.bmw.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.co.id/id/topics/offers-and-services/offers.html'] },
  { name: 'Mercedes-Benz Indonesia', websiteUrl: 'https://www.mercedes-benz.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.co.id/passengercars/the-brand/offers.html'] },
  { name: 'Mazda Indonesia', websiteUrl: 'https://www.mazda.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.co.id/offers/'] },
  { name: 'Kia Indonesia', websiteUrl: 'https://www.kia.com/id', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/id/campaign/'] },
  { name: 'Isuzu Indonesia', websiteUrl: 'https://www.isuzu-astra.com', categorySlug: 'otomobil', seedUrls: ['https://www.isuzu-astra.com/promo'] },
  { name: 'Subaru Indonesia', websiteUrl: 'https://www.subaru.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.co.id/promo'] },
  { name: 'Volkswagen Indonesia', websiteUrl: 'https://www.volkswagen.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.co.id/id/offers.html'] },
  { name: 'MG Motor Indonesia', websiteUrl: 'https://www.mgmotor.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.mgmotor.co.id/promo'] },
  { name: 'Chery Indonesia', websiteUrl: 'https://www.chery.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.chery.co.id/promo'] },
  { name: 'DFSK Indonesia', websiteUrl: 'https://www.dfrskindonesia.com', categorySlug: 'otomobil', seedUrls: ['https://www.dfrskindonesia.com/promo'] },
  { name: 'Ford Indonesia', websiteUrl: 'https://www.ford.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.ford.co.id/offers/'] },
  { name: 'Lexus Indonesia', websiteUrl: 'https://www.lexus.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.lexus.co.id/promo'] },
  { name: 'Auto2000', websiteUrl: 'https://auto2000.co.id', categorySlug: 'otomobil', seedUrls: ['https://auto2000.co.id/promo'] },
  { name: 'Astra Motor', websiteUrl: 'https://www.astramotor.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.astramotor.co.id/promo/'] },
  { name: 'Tunas Toyota', websiteUrl: 'https://www.tunastoyota.com', categorySlug: 'otomobil', seedUrls: ['https://www.tunastoyota.com/promo'] },
  { name: 'Honda Prospect Motor', websiteUrl: 'https://www.honda-indonesia.com', categorySlug: 'otomobil', seedUrls: ['https://www.honda-indonesia.com/promo'] },
  { name: 'Suzuki Finance', websiteUrl: 'https://www.sfruzukifrinance.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.sfruzukifrinance.co.id/promo'] },
  { name: 'Astra Daihatsu', websiteUrl: 'https://dfraihatsu.co.id', categorySlug: 'otomobil', seedUrls: ['https://dfraihatsu.co.id/promo'] },
  { name: 'Garasi.id', websiteUrl: 'https://garasi.id', categorySlug: 'otomobil', seedUrls: ['https://garasi.id/promo'] },
  { name: 'Carro Indonesia', websiteUrl: 'https://www.carro.id', categorySlug: 'otomobil', seedUrls: ['https://www.carro.id/promo'] },
  { name: 'OLX Autos Indonesia', websiteUrl: 'https://www.olxautos.co.id', categorySlug: 'otomobil', seedUrls: ['https://www.olxautos.co.id/promo'] },
  { name: 'Moladin', websiteUrl: 'https://www.moladin.com', categorySlug: 'otomobil', seedUrls: ['https://www.moladin.com/promo'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobbies (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Gramedia (Books)', websiteUrl: 'https://www.gramedia.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.gramedia.com/promo', 'https://www.gramedia.com/sale'] },
  { name: 'Periplus', websiteUrl: 'https://www.periplus.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.periplus.com/sale'] },
  { name: 'Togamas', websiteUrl: 'https://togamas.com', categorySlug: 'kitap-hobi', seedUrls: ['https://togamas.com/promo'] },
  { name: 'Books & Beyond', websiteUrl: 'https://www.booksbeyond.co.id', categorySlug: 'kitap-hobi', seedUrls: ['https://www.booksbeyond.co.id/promo'] },
  { name: 'Kinokuniya Indonesia', websiteUrl: 'https://www.kinokuniya.co.id', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kinokuniya.co.id/promo'] },
  { name: 'Bukukita', websiteUrl: 'https://www.bukukfrita.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bukukfrita.com/promo.php'] },
  { name: 'Deepublish', websiteUrl: 'https://deepublish.co.id', categorySlug: 'kitap-hobi', seedUrls: ['https://deepublish.co.id/promo/'] },
  { name: 'Bentang Pustaka', websiteUrl: 'https://bentangpustaka.com', categorySlug: 'kitap-hobi', seedUrls: ['https://bentangpustaka.com/promo'] },
  { name: 'Gramedia Digital', websiteUrl: 'https://ebooks.gramedia.com', categorySlug: 'kitap-hobi', seedUrls: ['https://ebooks.gramedia.com/promo'] },
  { name: 'iPusnas', websiteUrl: 'https://ipusnas.id', categorySlug: 'kitap-hobi', seedUrls: ['https://ipusnas.id/promo'] },
  { name: 'Spotify Indonesia', websiteUrl: 'https://www.spotify.com/id-id/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/id-id/premium/'] },
  { name: 'Vidio', websiteUrl: 'https://www.vidio.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.vidio.com/premier-league', 'https://www.vidio.com/promo'] },
  { name: 'Disney+ Hotstar Indonesia', websiteUrl: 'https://www.hotstar.com/id', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hotstar.com/id/promo'] },
  { name: 'Netflix Indonesia', websiteUrl: 'https://www.netflix.com/id/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/id/'] },
  { name: 'WeTV', websiteUrl: 'https://wetv.vip/id', categorySlug: 'kitap-hobi', seedUrls: ['https://wetv.vip/id/promo'] },
  { name: 'Viu Indonesia', websiteUrl: 'https://www.viu.com/ott/id/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.viu.com/ott/id/promo'] },
  { name: 'IQIYI Indonesia', websiteUrl: 'https://www.iq.com/intl-common/id/', categorySlug: 'kitap-hobi', seedUrls: ['https://www.iq.com/intl-common/id/promo'] },
  { name: 'Nintendo Indonesia', websiteUrl: 'https://www.nintendo.co.id', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.co.id/deals'] },
  { name: 'PlayStation Indonesia', websiteUrl: 'https://store.playstation.com/id-id/', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/id-id/category/deals'] },
  { name: 'Steam Indonesia', websiteUrl: 'https://store.steampowered.com/?cc=id', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials/'] },
  { name: 'Hobbycraft Indonesia', websiteUrl: 'https://www.hobbycraft.co.id', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hobbycraft.co.id/promo'] },
  { name: 'Papercraft', websiteUrl: 'https://www.papercraft.co.id', categorySlug: 'kitap-hobi', seedUrls: ['https://www.papercraft.co.id/promo'] },
  { name: 'Art Friend Indonesia', websiteUrl: 'https://www.artfriend.co.id', categorySlug: 'kitap-hobi', seedUrls: ['https://www.artfriend.co.id/promo'] },
  { name: 'Tokopedia Gaming', websiteUrl: 'https://www.tokopedia.com/discovery/gaming', categorySlug: 'kitap-hobi', seedUrls: ['https://www.tokopedia.com/discovery/gaming'] },
  { name: 'Blibli Gaming', websiteUrl: 'https://www.blibli.com/jual/gaming', categorySlug: 'kitap-hobi', seedUrls: ['https://www.blibli.com/promosi/gaming'] },
  { name: 'Elex Media', websiteUrl: 'https://elfrexmedia.id', categorySlug: 'kitap-hobi', seedUrls: ['https://elfrexmedia.id/promo'] },
  { name: 'Mizan', websiteUrl: 'https://mizan.com', categorySlug: 'kitap-hobi', seedUrls: ['https://mizan.com/promo'] },
  { name: 'KPG (Kepustakaan Populer Gramedia)', websiteUrl: 'https://kpg.id', categorySlug: 'kitap-hobi', seedUrls: ['https://kpg.id/promo'] },
  { name: 'GPU (Gramedia Pustaka Utama)', websiteUrl: 'https://gpu.id', categorySlug: 'kitap-hobi', seedUrls: ['https://gpu.id/promo'] },
  { name: 'Noura Books', websiteUrl: 'https://www.nofrurabooks.co.id', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nofrurabooks.co.id/promo'] },
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
  console.log('=== Indonesia Brand Seeding Script ===\n');

  // Load all categories into a slug -> id map
  const allCats = await prisma.category.findMany();
  const categoryMap = new Map<string, string>();
  for (const c of allCats) {
    categoryMap.set(c.slug, c.id);
  }
  console.log(`Categories ready: ${categoryMap.size} found\n`);

  // Deduplicate
  const uniqueBrands = deduplicateBrands(BRANDS);
  console.log(`Total brands: ${uniqueBrands.length} (${BRANDS.length - uniqueBrands.length} duplicates skipped)\n`);

  // Process brands + sources
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
      // Upsert brand using unique slug+market constraint
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'ID' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'ID',
          categoryId,
        },
      });

      // Check if crawl source already exists for this brand
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
            market: 'ID',
          },
        });
        sourcesCreated++;
      } else {
        // Update seedUrls if changed
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'ID' },
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

  // Total active sources
  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'ID' } });
  console.log(`Total active ID sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=ID');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
