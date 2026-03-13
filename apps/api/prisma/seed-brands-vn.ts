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
  { name: 'Shopee', websiteUrl: 'https://shopee.vn', categorySlug: 'alisveris', seedUrls: ['https://shopee.vn/flash_sale', 'https://shopee.vn/m/khuyen-mai'] },
  { name: 'Lazada', websiteUrl: 'https://www.lazada.vn', categorySlug: 'alisveris', seedUrls: ['https://www.lazada.vn/wow/gcp/route/lazada/vn/upr_1000345_lazada/channel/vn/upr-router/vn', 'https://www.lazada.vn/khuyen-mai/'] },
  { name: 'Tiki', websiteUrl: 'https://tiki.vn', categorySlug: 'alisveris', seedUrls: ['https://tiki.vn/khuyen-mai', 'https://tiki.vn/deal-hot'] },
  { name: 'Sendo', websiteUrl: 'https://www.sendo.vn', categorySlug: 'alisveris', seedUrls: ['https://www.sendo.vn/khuyen-mai', 'https://www.sendo.vn/flash-sale'] },
  { name: 'Thế Giới Di Động', websiteUrl: 'https://www.thegioididong.com', categorySlug: 'alisveris', seedUrls: ['https://www.thegioididong.com/khuyen-mai', 'https://www.thegioididong.com/sieu-sale'] },
  { name: 'Điện Máy Xanh', websiteUrl: 'https://www.dienmayxanh.com', categorySlug: 'alisveris', seedUrls: ['https://www.dienmayxanh.com/khuyen-mai', 'https://www.dienmayxanh.com/sieu-sale'] },
  { name: 'Bách Hóa Xanh', websiteUrl: 'https://www.bachhoaxanh.com', categorySlug: 'alisveris', seedUrls: ['https://www.bachhoaxanh.com/khuyen-mai'] },
  { name: 'FPT Shop', websiteUrl: 'https://fptshop.com.vn', categorySlug: 'alisveris', seedUrls: ['https://fptshop.com.vn/khuyen-mai', 'https://fptshop.com.vn/sieu-sale'] },
  { name: 'CellphoneS', websiteUrl: 'https://cellphones.com.vn', categorySlug: 'alisveris', seedUrls: ['https://cellphones.com.vn/sforum/khuyen-mai', 'https://cellphones.com.vn/sale-thang'] },
  { name: 'Nguyễn Kim', websiteUrl: 'https://www.nguyenkim.com', categorySlug: 'alisveris', seedUrls: ['https://www.nguyenkim.com/khuyen-mai.html', 'https://www.nguyenkim.com/sieu-sale.html'] },
  { name: 'Phong Vũ', websiteUrl: 'https://phongvu.vn', categorySlug: 'alisveris', seedUrls: ['https://phongvu.vn/khuyen-mai', 'https://phongvu.vn/sieu-sale'] },
  { name: 'Con Cưng', websiteUrl: 'https://concung.com', categorySlug: 'alisveris', seedUrls: ['https://concung.com/khuyen-mai.html'] },
  { name: 'Vỏ Sò', websiteUrl: 'https://voso.vn', categorySlug: 'alisveris', seedUrls: ['https://voso.vn/khuyen-mai'] },
  { name: 'Tổng Kho', websiteUrl: 'https://tongkho.vn', categorySlug: 'alisveris', seedUrls: ['https://tongkho.vn/khuyen-mai'] },
  { name: 'Điện Máy Chợ Lớn', websiteUrl: 'https://www.dienmaycholon.vn', categorySlug: 'alisveris', seedUrls: ['https://www.dienmaycholon.vn/khuyen-mai', 'https://www.dienmaycholon.vn/sieu-sale'] },
  { name: 'HC', websiteUrl: 'https://www.hc.com.vn', categorySlug: 'alisveris', seedUrls: ['https://www.hc.com.vn/khuyen-mai'] },
  { name: 'Pico', websiteUrl: 'https://pico.vn', categorySlug: 'alisveris', seedUrls: ['https://pico.vn/khuyen-mai'] },
  { name: 'MediaMart', websiteUrl: 'https://mediamart.vn', categorySlug: 'alisveris', seedUrls: ['https://mediamart.vn/khuyen-mai', 'https://mediamart.vn/sieu-sale'] },
  { name: 'Yes24', websiteUrl: 'https://www.yes24.vn', categorySlug: 'alisveris', seedUrls: ['https://www.yes24.vn/khuyen-mai'] },
  { name: 'Lotte.vn', websiteUrl: 'https://www.lotte.vn', categorySlug: 'alisveris', seedUrls: ['https://www.lotte.vn/khuyen-mai'] },
  { name: 'Adayroi', websiteUrl: 'https://www.adayroi.com', categorySlug: 'alisveris', seedUrls: ['https://www.adayroi.com/khuyen-mai'] },
  { name: 'VnShop', websiteUrl: 'https://vnshop.vn', categorySlug: 'alisveris', seedUrls: ['https://vnshop.vn/khuyen-mai'] },
  { name: 'Mainguyen', websiteUrl: 'https://www.mainguyen.vn', categorySlug: 'alisveris', seedUrls: ['https://www.mainguyen.vn/khuyen-mai'] },
  { name: 'Hoàng Hà Mobile', websiteUrl: 'https://hoanghamobile.com', categorySlug: 'alisveris', seedUrls: ['https://hoanghamobile.com/khuyen-mai', 'https://hoanghamobile.com/sieu-sale'] },
  { name: 'Di Động Việt', websiteUrl: 'https://didongviet.vn', categorySlug: 'alisveris', seedUrls: ['https://didongviet.vn/khuyen-mai', 'https://didongviet.vn/tin-khuyen-mai'] },
  { name: 'Viettel Store', websiteUrl: 'https://viettelstore.vn', categorySlug: 'alisveris', seedUrls: ['https://viettelstore.vn/khuyen-mai', 'https://viettelstore.vn/tin-khuyen-mai'] },
  { name: 'AliExpress VN', websiteUrl: 'https://vi.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://vi.aliexpress.com/wholesale', 'https://sale.aliexpress.com/__pc/sale.htm'] },
  { name: 'Zanado', websiteUrl: 'https://www.zanado.com', categorySlug: 'alisveris', seedUrls: ['https://www.zanado.com/khuyen-mai.html'] },
  { name: 'Vuivui', websiteUrl: 'https://www.vuivui.com', categorySlug: 'alisveris', seedUrls: ['https://www.vuivui.com/khuyen-mai'] },
  { name: 'Hotdeal', websiteUrl: 'https://www.hotdeal.vn', categorySlug: 'alisveris', seedUrls: ['https://www.hotdeal.vn/', 'https://www.hotdeal.vn/khuyen-mai'] },
  { name: 'Giảm Giá XL', websiteUrl: 'https://www.giamgiaxl.com', categorySlug: 'alisveris', seedUrls: ['https://www.giamgiaxl.com/'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung', websiteUrl: 'https://www.samsung.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/vn/offer/', 'https://www.samsung.com/vn/smartphones/all-smartphones/'] },
  { name: 'Apple', websiteUrl: 'https://www.apple.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/vn/shop/go/special_deals'] },
  { name: 'Xiaomi', websiteUrl: 'https://www.mi.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/vn/sale', 'https://www.mi.com/vn/event'] },
  { name: 'OPPO', websiteUrl: 'https://www.oppo.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/vn/events/', 'https://www.oppo.com/vn/smartphones/'] },
  { name: 'Vivo', websiteUrl: 'https://www.vivo.com.vn', categorySlug: 'elektronik', seedUrls: ['https://www.vivo.com.vn/vn/promotion'] },
  { name: 'Realme', websiteUrl: 'https://www.realme.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/vn/deals'] },
  { name: 'LG', websiteUrl: 'https://www.lg.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/vn/khuyen-mai'] },
  { name: 'Sony', websiteUrl: 'https://store.sony.com.vn', categorySlug: 'elektronik', seedUrls: ['https://store.sony.com.vn/khuyen-mai'] },
  { name: 'HP', websiteUrl: 'https://www.hp.com/vn-vi', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/vn-vi/shop/offer'] },
  { name: 'Lenovo', websiteUrl: 'https://www.lenovo.com/vn/vi', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/vn/vi/d/deals/'] },
  { name: 'Dell', websiteUrl: 'https://www.dell.com/vi-vn', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/vi-vn/shop/deals'] },
  { name: 'Asus', websiteUrl: 'https://www.asus.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/vn/campaign/', 'https://www.asus.com/vn/Promotions/'] },
  { name: 'Acer', websiteUrl: 'https://www.acer.com/vn-vi', categorySlug: 'elektronik', seedUrls: ['https://www.acer.com/vn-vi/promotions'] },
  { name: 'Huawei', websiteUrl: 'https://consumer.huawei.com/vn', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/vn/offer/'] },
  { name: 'Motorola', websiteUrl: 'https://www.motorola.com.vn', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.com.vn/khuyen-mai'] },
  { name: 'Nokia', websiteUrl: 'https://www.nokia.com/vn_vi', categorySlug: 'elektronik', seedUrls: ['https://www.nokia.com/vn_vi/phones'] },
  { name: 'Panasonic', websiteUrl: 'https://www.panasonic.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/vn/khuyen-mai.html'] },
  { name: 'Toshiba', websiteUrl: 'https://www.toshiba-lifestyle.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.toshiba-lifestyle.com/vn/promotions'] },
  { name: 'Sharp', websiteUrl: 'https://www.sharp.vn', categorySlug: 'elektronik', seedUrls: ['https://www.sharp.vn/khuyen-mai'] },
  { name: 'Electrolux', websiteUrl: 'https://www.electrolux.com.vn', categorySlug: 'elektronik', seedUrls: ['https://www.electrolux.com.vn/promotion/'] },
  { name: 'Philips', websiteUrl: 'https://www.philips.com.vn', categorySlug: 'elektronik', seedUrls: ['https://www.philips.com.vn/c-e/khuyen-mai'] },
  { name: 'Daikin', websiteUrl: 'https://www.daikin.com.vn', categorySlug: 'elektronik', seedUrls: ['https://www.daikin.com.vn/khuyen-mai'] },
  { name: 'Viettel', websiteUrl: 'https://vietteltelecom.vn', categorySlug: 'elektronik', seedUrls: ['https://vietteltelecom.vn/khuyen-mai'] },
  { name: 'VNPT', websiteUrl: 'https://vnpt.com.vn', categorySlug: 'elektronik', seedUrls: ['https://vnpt.com.vn/khuyen-mai'] },
  { name: 'Mobifone', websiteUrl: 'https://www.mobifone.vn', categorySlug: 'elektronik', seedUrls: ['https://www.mobifone.vn/khuyen-mai'] },
  { name: 'FPT Telecom', websiteUrl: 'https://fpt.vn', categorySlug: 'elektronik', seedUrls: ['https://fpt.vn/khuyen-mai'] },
  { name: 'Canon', websiteUrl: 'https://www.canon.com.vn', categorySlug: 'elektronik', seedUrls: ['https://www.canon.com.vn/promotions'] },
  { name: 'JBL', websiteUrl: 'https://vn.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://vn.jbl.com/sale.html'] },
  { name: 'Logitech', websiteUrl: 'https://www.logitech.com/vi-vn', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/vi-vn/promo.html'] },
  { name: 'MSI', websiteUrl: 'https://vn.msi.com', categorySlug: 'elektronik', seedUrls: ['https://vn.msi.com/Promotion/'] },
  { name: 'TCL', websiteUrl: 'https://www.tcl.com/vn', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/vn/vi/promotions'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Canifa', websiteUrl: 'https://canifa.com', categorySlug: 'giyim-moda', seedUrls: ['https://canifa.com/khuyen-mai', 'https://canifa.com/sale'] },
  { name: 'NEM Fashion', websiteUrl: 'https://nemfashion.com', categorySlug: 'giyim-moda', seedUrls: ['https://nemfashion.com/sale', 'https://nemfashion.com/khuyen-mai'] },
  { name: 'IVY moda', websiteUrl: 'https://ivymoda.com', categorySlug: 'giyim-moda', seedUrls: ['https://ivymoda.com/sale', 'https://ivymoda.com/khuyen-mai'] },
  { name: 'Elise', websiteUrl: 'https://elise.vn', categorySlug: 'giyim-moda', seedUrls: ['https://elise.vn/sale', 'https://elise.vn/khuyen-mai'] },
  { name: 'Juno', websiteUrl: 'https://juno.vn', categorySlug: 'giyim-moda', seedUrls: ['https://juno.vn/sale', 'https://juno.vn/khuyen-mai'] },
  { name: 'Vascara', websiteUrl: 'https://vascara.com', categorySlug: 'giyim-moda', seedUrls: ['https://vascara.com/sale', 'https://vascara.com/khuyen-mai'] },
  { name: 'Routine', websiteUrl: 'https://routine.vn', categorySlug: 'giyim-moda', seedUrls: ['https://routine.vn/sale', 'https://routine.vn/khuyen-mai'] },
  { name: 'Aristino', websiteUrl: 'https://aristino.com', categorySlug: 'giyim-moda', seedUrls: ['https://aristino.com/sale.html', 'https://aristino.com/khuyen-mai.html'] },
  { name: 'Yody', websiteUrl: 'https://yody.vn', categorySlug: 'giyim-moda', seedUrls: ['https://yody.vn/sale', 'https://yody.vn/khuyen-mai'] },
  { name: 'Couple TX', websiteUrl: 'https://coupletx.com', categorySlug: 'giyim-moda', seedUrls: ['https://coupletx.com/sale', 'https://coupletx.com/khuyen-mai'] },
  { name: 'Owen', websiteUrl: 'https://owen.vn', categorySlug: 'giyim-moda', seedUrls: ['https://owen.vn/sale', 'https://owen.vn/khuyen-mai'] },
  { name: 'Việt Tiến', websiteUrl: 'https://viettien.com.vn', categorySlug: 'giyim-moda', seedUrls: ['https://viettien.com.vn/khuyen-mai', 'https://viettien.com.vn/sale'] },
  { name: 'May 10', websiteUrl: 'https://may10.vn', categorySlug: 'giyim-moda', seedUrls: ['https://may10.vn/khuyen-mai', 'https://may10.vn/sale'] },
  { name: 'An Phước', websiteUrl: 'https://anphuoc.com.vn', categorySlug: 'giyim-moda', seedUrls: ['https://anphuoc.com.vn/khuyen-mai', 'https://anphuoc.com.vn/sale'] },
  { name: 'Zara VN', websiteUrl: 'https://www.zara.com/vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/vn/vi/rebajas-l1702.html'] },
  { name: 'H&M VN', websiteUrl: 'https://www2.hm.com/vi_vn', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/vi_vn/sale.html'] },
  { name: 'Uniqlo VN', websiteUrl: 'https://www.uniqlo.com/vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/vn/vi/spl/sale'] },
  { name: 'Mango VN', websiteUrl: 'https://shop.mango.com/vn', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/vn/sale'] },
  { name: 'Levi\'s VN', websiteUrl: 'https://www.levi.com.vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com.vn/sale'] },
  { name: 'Nike VN', websiteUrl: 'https://www.nike.com/vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/vn/sale'] },
  { name: 'Adidas VN', websiteUrl: 'https://www.adidas.com.vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.com.vn/vi/outlet'] },
  { name: 'Bitis', websiteUrl: 'https://bfriendbitis.vn', categorySlug: 'giyim-moda', seedUrls: ['https://bfriendbitis.vn/khuyen-mai', 'https://bfriendbitis.vn/sale'] },
  { name: 'Thời Trang Hải Triều', websiteUrl: 'https://www.haitrieu.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.haitrieu.com/khuyen-mai/'] },
  { name: 'PNJ', websiteUrl: 'https://www.pnj.com.vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.pnj.com.vn/khuyen-mai/', 'https://www.pnj.com.vn/sale/'] },
  { name: 'DOJI', websiteUrl: 'https://www.doji.vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.doji.vn/khuyen-mai'] },
  { name: 'SJC', websiteUrl: 'https://sjc.com.vn', categorySlug: 'giyim-moda', seedUrls: ['https://sjc.com.vn/khuyen-mai'] },
  { name: 'Thế Giới Kim Cương', websiteUrl: 'https://www.thegioikimcuong.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.thegioikimcuong.com/khuyen-mai'] },
  { name: 'Eva de Eva', websiteUrl: 'https://www.evadeeva.vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.evadeeva.vn/sale', 'https://www.evadeeva.vn/khuyen-mai'] },
  { name: 'Valentino Creations', websiteUrl: 'https://www.valentinocreations.com.vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.valentinocreations.com.vn/khuyen-mai'] },
  { name: 'Charles & Keith VN', websiteUrl: 'https://www.charleskeith.com/vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/vn/sale'] },
  { name: 'Pedro VN', websiteUrl: 'https://www.pedroshoes.com/vn', categorySlug: 'giyim-moda', seedUrls: ['https://www.pedroshoes.com/vn/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'WinMart', websiteUrl: 'https://www.winmart.vn', categorySlug: 'gida-market', seedUrls: ['https://www.winmart.vn/khuyen-mai', 'https://www.winmart.vn/sieu-sale'] },
  { name: 'Co.opmart', websiteUrl: 'https://www.co-opmart.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.co-opmart.com.vn/khuyen-mai'] },
  { name: 'Big C', websiteUrl: 'https://www.bigc.vn', categorySlug: 'gida-market', seedUrls: ['https://www.bigc.vn/khuyen-mai'] },
  { name: 'Lotte Mart', websiteUrl: 'https://www.lottemart.vn', categorySlug: 'gida-market', seedUrls: ['https://www.lottemart.vn/khuyen-mai'] },
  { name: 'Aeon Mall', websiteUrl: 'https://aeonmall-long-bien.com.vn', categorySlug: 'gida-market', seedUrls: ['https://aeonmall-long-bien.com.vn/khuyen-mai/'] },
  { name: 'MM Mega Market', websiteUrl: 'https://www.mmvietnam.com', categorySlug: 'gida-market', seedUrls: ['https://www.mmvietnam.com/khuyen-mai/'] },
  { name: 'Go!', websiteUrl: 'https://www.go-mall.vn', categorySlug: 'gida-market', seedUrls: ['https://www.go-mall.vn/khuyen-mai'] },
  { name: 'Emart', websiteUrl: 'https://www.emart.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.emart.com.vn/khuyen-mai'] },
  { name: 'GS25', websiteUrl: 'https://gs25.com.vn', categorySlug: 'gida-market', seedUrls: ['https://gs25.com.vn/khuyen-mai'] },
  { name: 'Circle K', websiteUrl: 'https://www.circlek.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.circlek.com.vn/vi/khuyen-mai/'] },
  { name: 'FamilyMart', websiteUrl: 'https://www.familymart.vn', categorySlug: 'gida-market', seedUrls: ['https://www.familymart.vn/khuyen-mai'] },
  { name: 'MiniStop', websiteUrl: 'https://ministop.vn', categorySlug: 'gida-market', seedUrls: ['https://ministop.vn/khuyen-mai'] },
  { name: 'Co.opFood', websiteUrl: 'https://www.co-opfood.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.co-opfood.com.vn/khuyen-mai'] },
  { name: 'SatraMart', websiteUrl: 'https://satramart.com.vn', categorySlug: 'gida-market', seedUrls: ['https://satramart.com.vn/khuyen-mai'] },
  { name: 'VinMart+', websiteUrl: 'https://www.winmart.vn', categorySlug: 'gida-market', seedUrls: ['https://www.winmart.vn/cua-hang-gan-ban'] },
  { name: 'Vincom', websiteUrl: 'https://vincom.com.vn', categorySlug: 'gida-market', seedUrls: ['https://vincom.com.vn/khuyen-mai'] },
  { name: 'Aeon', websiteUrl: 'https://www.aeon.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.aeon.com.vn/khuyen-mai'] },
  { name: 'Tops Market', websiteUrl: 'https://www.tops.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.tops.com.vn/khuyen-mai'] },
  { name: 'Co.opXtra', websiteUrl: 'https://www.co-opxtra.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.co-opxtra.com.vn/khuyen-mai'] },
  { name: 'Saigon Co.op', websiteUrl: 'https://www.saigonco-op.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.saigonco-op.com.vn/khuyen-mai'] },
  { name: 'Nova Market', websiteUrl: 'https://novamarket.com.vn', categorySlug: 'gida-market', seedUrls: ['https://novamarket.com.vn/khuyen-mai'] },
  { name: 'Satra', websiteUrl: 'https://satra.com.vn', categorySlug: 'gida-market', seedUrls: ['https://satra.com.vn/khuyen-mai'] },
  { name: 'Vissan', websiteUrl: 'https://vissan.com.vn', categorySlug: 'gida-market', seedUrls: ['https://vissan.com.vn/khuyen-mai'] },
  { name: 'Vinamilk', websiteUrl: 'https://www.vinamilk.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.vinamilk.com.vn/khuyen-mai'] },
  { name: 'TH True Milk', websiteUrl: 'https://www.thtruemilk.vn', categorySlug: 'gida-market', seedUrls: ['https://www.thtruemilk.vn/khuyen-mai'] },
  { name: 'Masan', websiteUrl: 'https://www.masan.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.masan.com.vn/khuyen-mai'] },
  { name: 'Acecook', websiteUrl: 'https://www.acecookvietnam.vn', categorySlug: 'gida-market', seedUrls: ['https://www.acecookvietnam.vn/khuyen-mai'] },
  { name: 'Highlands Coffee', websiteUrl: 'https://www.highlandscoffee.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.highlandscoffee.com.vn/khuyen-mai'] },
  { name: 'Trung Nguyên', websiteUrl: 'https://trungnguyenlegend.com', categorySlug: 'gida-market', seedUrls: ['https://trungnguyenlegend.com/khuyen-mai'] },
  { name: 'Phúc Long', websiteUrl: 'https://www.phuclong.com.vn', categorySlug: 'gida-market', seedUrls: ['https://www.phuclong.com.vn/khuyen-mai'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme-İçme / Food Delivery (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'ShopeeFood', websiteUrl: 'https://shopeefood.vn', categorySlug: 'yeme-icme', seedUrls: ['https://shopeefood.vn/khuyen-mai', 'https://shopeefood.vn/deal-hot'] },
  { name: 'GrabFood', websiteUrl: 'https://food.grab.com/vn', categorySlug: 'yeme-icme', seedUrls: ['https://food.grab.com/vn/vi/'] },
  { name: 'GoFood', websiteUrl: 'https://gojek.com/vn', categorySlug: 'yeme-icme', seedUrls: ['https://gojek.com/vn/gofood/'] },
  { name: 'Baemin', websiteUrl: 'https://www.baemin.vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.baemin.vn/khuyen-mai'] },
  { name: 'Jollibee', websiteUrl: 'https://jollibee.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://jollibee.com.vn/khuyen-mai', 'https://jollibee.com.vn/tin-khuyen-mai'] },
  { name: 'Lotteria', websiteUrl: 'https://www.lotteria.vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.lotteria.vn/khuyen-mai'] },
  { name: 'KFC', websiteUrl: 'https://kfc.vn', categorySlug: 'yeme-icme', seedUrls: ['https://kfc.vn/khuyen-mai'] },
  { name: 'McDonald\'s', websiteUrl: 'https://mcdonalds.vn', categorySlug: 'yeme-icme', seedUrls: ['https://mcdonalds.vn/khuyen-mai', 'https://mcdonalds.vn/tin-khuyen-mai'] },
  { name: 'Pizza Hut', websiteUrl: 'https://pizzahut.vn', categorySlug: 'yeme-icme', seedUrls: ['https://pizzahut.vn/khuyen-mai'] },
  { name: 'Domino\'s Pizza', websiteUrl: 'https://www.dominos.vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.vn/khuyen-mai'] },
  { name: 'Burger King', websiteUrl: 'https://burgerking.vn', categorySlug: 'yeme-icme', seedUrls: ['https://burgerking.vn/khuyen-mai'] },
  { name: 'Starbucks', websiteUrl: 'https://www.starbucks.vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.vn/khuyen-mai'] },
  { name: 'The Coffee House', websiteUrl: 'https://www.thecoffeehouse.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.thecoffeehouse.com/pages/khuyen-mai'] },
  { name: 'Cộng Cà Phê', websiteUrl: 'https://congcaphe.com', categorySlug: 'yeme-icme', seedUrls: ['https://congcaphe.com/khuyen-mai'] },
  { name: 'Gong Cha', websiteUrl: 'https://www.gongcha.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.gongcha.com.vn/khuyen-mai/'] },
  { name: 'Tocotoco', websiteUrl: 'https://tocotocotea.com', categorySlug: 'yeme-icme', seedUrls: ['https://tocotocotea.com/khuyen-mai'] },
  { name: 'Phở 24', websiteUrl: 'https://www.pho24.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.pho24.com.vn/khuyen-mai'] },
  { name: 'Golden Gate', websiteUrl: 'https://ggg.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://ggg.com.vn/khuyen-mai/'] },
  { name: 'Pizza 4P\'s', websiteUrl: 'https://pizza4ps.com', categorySlug: 'yeme-icme', seedUrls: ['https://pizza4ps.com/khuyen-mai'] },
  { name: 'Popeyes', websiteUrl: 'https://popeyes.vn', categorySlug: 'yeme-icme', seedUrls: ['https://popeyes.vn/khuyen-mai'] },
  { name: 'Texas Chicken', websiteUrl: 'https://texaschicken.vn', categorySlug: 'yeme-icme', seedUrls: ['https://texaschicken.vn/khuyen-mai'] },
  { name: 'Subway', websiteUrl: 'https://subway.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://subway.com.vn/khuyen-mai'] },
  { name: 'Haidilao', websiteUrl: 'https://www.haidilao.com/vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.haidilao.com/vn/khuyen-mai'] },
  { name: 'Kichi-Kichi', websiteUrl: 'https://kichi.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://kichi.com.vn/khuyen-mai'] },
  { name: 'Sumo BBQ', websiteUrl: 'https://sumobbq.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://sumobbq.com.vn/khuyen-mai'] },
  { name: 'King BBQ', websiteUrl: 'https://kingbbq.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://kingbbq.com.vn/khuyen-mai'] },
  { name: 'Ding Tea', websiteUrl: 'https://dingtea.com.vn', categorySlug: 'yeme-icme', seedUrls: ['https://dingtea.com.vn/khuyen-mai'] },
  { name: 'Mixue', websiteUrl: 'https://mixuevietnam.com', categorySlug: 'yeme-icme', seedUrls: ['https://mixuevietnam.com/khuyen-mai'] },
  { name: 'Baskin Robbins', websiteUrl: 'https://www.baskinrobbins.vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbins.vn/khuyen-mai'] },
  { name: 'Dairy Queen', websiteUrl: 'https://www.dairyqueen.vn', categorySlug: 'yeme-icme', seedUrls: ['https://www.dairyqueen.vn/khuyen-mai'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Guardian', websiteUrl: 'https://www.guardian.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.guardian.com.vn/khuyen-mai', 'https://www.guardian.com.vn/sale'] },
  { name: 'Watsons', websiteUrl: 'https://www.watsons.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.watsons.vn/vi/khuyen-mai'] },
  { name: 'Hasaki', websiteUrl: 'https://hasaki.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://hasaki.vn/khuyen-mai', 'https://hasaki.vn/deal-hot'] },
  { name: 'Beauty Garden', websiteUrl: 'https://beautygarden.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://beautygarden.vn/khuyen-mai'] },
  { name: 'The Face Shop', websiteUrl: 'https://thefaceshop.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://thefaceshop.com.vn/khuyen-mai', 'https://thefaceshop.com.vn/sale'] },
  { name: 'Innisfree', websiteUrl: 'https://innisfree.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://innisfree.com.vn/khuyen-mai', 'https://innisfree.com.vn/sale'] },
  { name: 'Laneige', websiteUrl: 'https://www.laneige.com/vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laneige.com/vn/vi/offer.html'] },
  { name: 'Sulwhasoo', websiteUrl: 'https://www.sulwhasoo.com/vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sulwhasoo.com/vn/vi/offer.html'] },
  { name: 'MAC', websiteUrl: 'https://www.maccosmetics.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.vn/offers'] },
  { name: 'L\'Oréal', websiteUrl: 'https://www.loreal-paris.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.vn/khuyen-mai'] },
  { name: 'Maybelline', websiteUrl: 'https://www.maybelline.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.com.vn/khuyen-mai'] },
  { name: 'La Roche-Posay', websiteUrl: 'https://www.laroche-posay.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.com.vn/khuyen-mai'] },
  { name: 'Vichy', websiteUrl: 'https://www.vichy.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.com.vn/khuyen-mai'] },
  { name: 'Cetaphil', websiteUrl: 'https://www.cetaphil.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cetaphil.com.vn/khuyen-mai'] },
  { name: 'Bioderma', websiteUrl: 'https://www.bioderma.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.vn/khuyen-mai'] },
  { name: 'Eucerin', websiteUrl: 'https://www.eucerin.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eucerin.vn/khuyen-mai'] },
  { name: 'Shiseido', websiteUrl: 'https://www.shiseido.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.shiseido.com.vn/khuyen-mai'] },
  { name: 'Clinique', websiteUrl: 'https://www.clinique.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.vn/offers'] },
  { name: 'Estée Lauder', websiteUrl: 'https://www.esteelauder.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.com.vn/offers'] },
  { name: 'SK-II', websiteUrl: 'https://www.sk-ii.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sk-ii.com.vn/khuyen-mai'] },
  { name: 'Lancôme', websiteUrl: 'https://www.lancome.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lancome.com.vn/offers'] },
  { name: 'Missha', websiteUrl: 'https://missha.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://missha.com.vn/khuyen-mai'] },
  { name: 'Etude House', websiteUrl: 'https://etude.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://etude.com.vn/khuyen-mai', 'https://etude.com.vn/sale'] },
  { name: 'Cocoon', websiteUrl: 'https://cocoonvietnam.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://cocoonvietnam.com/khuyen-mai'] },
  { name: 'Thorakao', websiteUrl: 'https://thorakao.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://thorakao.vn/khuyen-mai'] },
  { name: 'Senka', websiteUrl: 'https://www.senka.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.senka.com.vn/khuyen-mai'] },
  { name: 'Pond\'s', websiteUrl: 'https://www.ponds.com/vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ponds.com/vn/khuyen-mai.html'] },
  { name: 'Dove', websiteUrl: 'https://www.dove.com/vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/vn/khuyen-mai.html'] },
  { name: 'Nivea', websiteUrl: 'https://www.nivea.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.com.vn/khuyen-mai'] },
  { name: 'Beauty Box', websiteUrl: 'https://beautybox.com.vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://beautybox.com.vn/khuyen-mai', 'https://beautybox.com.vn/sale'] },
  { name: 'Sociolla', websiteUrl: 'https://www.sociolla.com/vn', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sociolla.com/vn/sale'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA', websiteUrl: 'https://www.ikea.com/vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/vn/vi/offers/'] },
  { name: 'Nội Thất Hòa Phát', websiteUrl: 'https://noithathoaphat.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://noithathoaphat.com.vn/khuyen-mai'] },
  { name: 'UMA', websiteUrl: 'https://uma.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://uma.com.vn/khuyen-mai'] },
  { name: 'Baya', websiteUrl: 'https://bfriendbaya.com', categorySlug: 'ev-yasam', seedUrls: ['https://bfriendbaya.com/khuyen-mai'] },
  { name: 'Nhà Xinh', websiteUrl: 'https://nhaxinh.com', categorySlug: 'ev-yasam', seedUrls: ['https://nhaxinh.com/khuyen-mai/'] },
  { name: 'Nội Thất Xuân Hòa', websiteUrl: 'https://xuanhoa.net.vn', categorySlug: 'ev-yasam', seedUrls: ['https://xuanhoa.net.vn/khuyen-mai'] },
  { name: 'Index Living Mall', websiteUrl: 'https://www.indexlivingmall.com/vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.indexlivingmall.com/vn/promotion'] },
  { name: 'Nội Thất MOHO', websiteUrl: 'https://moho.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://moho.com.vn/khuyen-mai'] },
  { name: 'Phố Xinh', websiteUrl: 'https://www.phoxinh.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.phoxinh.com/khuyen-mai'] },
  { name: 'Nội Thất The One', websiteUrl: 'https://theone.vn', categorySlug: 'ev-yasam', seedUrls: ['https://theone.vn/khuyen-mai'] },
  { name: 'Điện Quang', websiteUrl: 'https://dienquang.com', categorySlug: 'ev-yasam', seedUrls: ['https://dienquang.com/khuyen-mai'] },
  { name: 'Rạng Đông', websiteUrl: 'https://rangdong.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://rangdong.com.vn/khuyen-mai'] },
  { name: 'Sơn Jotun', websiteUrl: 'https://www.jotun.com/vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.jotun.com/vn/vi/khuyen-mai'] },
  { name: 'Sơn Dulux', websiteUrl: 'https://www.dulux.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.dulux.com.vn/vi/khuyen-mai'] },
  { name: 'Kangaroo', websiteUrl: 'https://kangaroo.vn', categorySlug: 'ev-yasam', seedUrls: ['https://kangaroo.vn/khuyen-mai'] },
  { name: 'Sunhouse', websiteUrl: 'https://sunhouse.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://sunhouse.com.vn/khuyen-mai'] },
  { name: 'Toshiba Lifestyle', websiteUrl: 'https://www.toshibalifestyle.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.toshibalifestyle.com.vn/khuyen-mai'] },
  { name: 'Lock&Lock', websiteUrl: 'https://www.locknlock.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.locknlock.com.vn/khuyen-mai'] },
  { name: 'Electrolux Home', websiteUrl: 'https://www.electrolux.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.electrolux.com.vn/promotion/'] },
  { name: 'Midea', websiteUrl: 'https://www.midea.com/vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.midea.com/vn/khuyen-mai'] },
  { name: 'Hafele', websiteUrl: 'https://www.hafele.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.hafele.com.vn/vi/khuyen-mai'] },
  { name: 'Inax', websiteUrl: 'https://www.inax.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.inax.com.vn/khuyen-mai'] },
  { name: 'TOTO', websiteUrl: 'https://www.toto.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.toto.com.vn/khuyen-mai'] },
  { name: 'Viglacera', websiteUrl: 'https://www.viglacera.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.viglacera.com.vn/khuyen-mai'] },
  { name: 'Sơn Nippon', websiteUrl: 'https://nipponpaint.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://nipponpaint.com.vn/khuyen-mai'] },
  { name: 'Eurowindow', websiteUrl: 'https://eurowindow.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://eurowindow.com.vn/khuyen-mai'] },
  { name: 'Minh Hòa', websiteUrl: 'https://minhhoa.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://minhhoa.com.vn/khuyen-mai'] },
  { name: 'Nội Thất Đại Việt', websiteUrl: 'https://noithatdaiviet.com', categorySlug: 'ev-yasam', seedUrls: ['https://noithatdaiviet.com/khuyen-mai'] },
  { name: 'AConcept', websiteUrl: 'https://www.aconcept.com.vn', categorySlug: 'ev-yasam', seedUrls: ['https://www.aconcept.com.vn/khuyen-mai'] },
  { name: 'SHX', websiteUrl: 'https://shx.vn', categorySlug: 'ev-yasam', seedUrls: ['https://shx.vn/khuyen-mai'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Supersports', websiteUrl: 'https://supersports.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://supersports.com.vn/sale', 'https://supersports.com.vn/khuyen-mai'] },
  { name: 'Decathlon', websiteUrl: 'https://www.decathlon.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.vn/vi/browse/khuyen-mai/c0-all'] },
  { name: 'Nike', websiteUrl: 'https://www.nike.com/vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/vn/sale'] },
  { name: 'Adidas', websiteUrl: 'https://www.adidas.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.com.vn/vi/outlet'] },
  { name: 'Puma', websiteUrl: 'https://vn.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://vn.puma.com/vn/vi/sale'] },
  { name: 'New Balance', websiteUrl: 'https://www.newbalance.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.vn/sale'] },
  { name: 'Converse', websiteUrl: 'https://www.converse.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com.vn/sale'] },
  { name: 'Vans', websiteUrl: 'https://www.vans.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.com.vn/sale'] },
  { name: 'Asics', websiteUrl: 'https://www.asics.com/vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/vn/vi-vn/sale/'] },
  { name: 'Under Armour', websiteUrl: 'https://www.underarmour.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.vn/sale'] },
  { name: 'Reebok', websiteUrl: 'https://www.reebok.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com.vn/outlet'] },
  { name: 'Fila', websiteUrl: 'https://fila.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://fila.com.vn/sale'] },
  { name: 'MLB', websiteUrl: 'https://mlb-korea.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://mlb-korea.com.vn/sale'] },
  { name: 'The North Face', websiteUrl: 'https://www.thenorthface.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.com.vn/sale'] },
  { name: 'Columbia', websiteUrl: 'https://www.columbia.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.com.vn/sale'] },
  { name: 'Skechers', websiteUrl: 'https://www.skechers.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.vn/sale'] },
  { name: 'Crocs', websiteUrl: 'https://www.crocs.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.crocs.com.vn/sale'] },
  { name: 'Bitis Hunter', websiteUrl: 'https://www.bfriendbitis.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bfriendbitis.vn/hunter-khuyen-mai'] },
  { name: 'Yonex', websiteUrl: 'https://yonex.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://yonex.com.vn/khuyen-mai'] },
  { name: 'Li-Ning', websiteUrl: 'https://lining.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://lining.com.vn/khuyen-mai'] },
  { name: 'Victor', websiteUrl: 'https://www.victor.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.victor.com.vn/khuyen-mai'] },
  { name: 'Hoka', websiteUrl: 'https://www.hoka.com/vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hoka.com/vn/sale'] },
  { name: 'On Running', websiteUrl: 'https://www.on-running.com/vi-vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.on-running.com/vi-vn/sale'] },
  { name: 'GymShark', websiteUrl: 'https://www.gymshark.com/vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.gymshark.com/vn/sale'] },
  { name: 'Elite Fitness', websiteUrl: 'https://elitefitness.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://elitefitness.com.vn/khuyen-mai'] },
  { name: 'California Fitness', websiteUrl: 'https://www.cfyc.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.cfyc.com.vn/khuyen-mai'] },
  { name: 'Sport1', websiteUrl: 'https://sport1.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://sport1.vn/khuyen-mai'] },
  { name: 'Sporter', websiteUrl: 'https://sporter.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://sporter.vn/khuyen-mai'] },
  { name: 'Saucony', websiteUrl: 'https://www.saucony.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://www.saucony.com.vn/sale'] },
  { name: 'Mizuno', websiteUrl: 'https://mizuno.com.vn', categorySlug: 'spor-outdoor', seedUrls: ['https://mizuno.com.vn/khuyen-mai'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Vietnam Airlines', websiteUrl: 'https://www.vietnamairlines.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vietnamairlines.com/vn/vi/offers', 'https://www.vietnamairlines.com/vn/vi/promotions'] },
  { name: 'VietJet Air', websiteUrl: 'https://www.vietjetair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vietjetair.com/vi/khuyen-mai', 'https://www.vietjetair.com/vi/promotion'] },
  { name: 'Bamboo Airways', websiteUrl: 'https://www.bambooairways.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.bambooairways.com/vn-vi/khuyen-mai'] },
  { name: 'Pacific Airlines', websiteUrl: 'https://www.pacificairlines.com.vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pacificairlines.com.vn/khuyen-mai'] },
  { name: 'Traveloka', websiteUrl: 'https://www.traveloka.com/vi-vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.traveloka.com/vi-vn/promotion', 'https://www.traveloka.com/vi-vn/khuyen-mai'] },
  { name: 'Agoda', websiteUrl: 'https://www.agoda.com/vi-vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/vi-vn/deals'] },
  { name: 'Booking.com', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.vi.html'] },
  { name: 'Klook', websiteUrl: 'https://www.klook.com/vi', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klook.com/vi/deals/', 'https://www.klook.com/vi/promo/'] },
  { name: 'Vntrip', websiteUrl: 'https://www.vntrip.vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vntrip.vn/khuyen-mai', 'https://www.vntrip.vn/cam-nang/khuyen-mai'] },
  { name: 'Mytour', websiteUrl: 'https://mytour.vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://mytour.vn/khuyen-mai'] },
  { name: 'Ivivu', websiteUrl: 'https://www.ivivu.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ivivu.com/khuyen-mai'] },
  { name: 'Vé Xe Rẻ', websiteUrl: 'https://vexere.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://vexere.com/khuyen-mai'] },
  { name: 'Saigontourist', websiteUrl: 'https://saigontourist.net', categorySlug: 'seyahat-ulasim', seedUrls: ['https://saigontourist.net/khuyen-mai'] },
  { name: 'Vietravel', websiteUrl: 'https://www.vietravel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vietravel.com/khuyen-mai.aspx'] },
  { name: 'Fiditour', websiteUrl: 'https://www.fiditour.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.fiditour.com/khuyen-mai'] },
  { name: 'BestPrice', websiteUrl: 'https://bestprice.vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://bestprice.vn/khuyen-mai'] },
  { name: 'Luxstay', websiteUrl: 'https://www.luxstay.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.luxstay.com/khuyen-mai'] },
  { name: 'Grab', websiteUrl: 'https://www.grab.com/vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.grab.com/vn/blog/khuyen-mai/'] },
  { name: 'Be', websiteUrl: 'https://be.com.vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://be.com.vn/khuyen-mai'] },
  { name: 'Gojek', websiteUrl: 'https://www.gojek.com/vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.gojek.com/vn/blog/khuyen-mai/'] },
  { name: 'Xanh SM', websiteUrl: 'https://xanhsm.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://xanhsm.com/khuyen-mai'] },
  { name: 'Vinpearl', websiteUrl: 'https://vinpearl.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://vinpearl.com/vi/khuyen-mai', 'https://vinpearl.com/vi/deals'] },
  { name: 'FLC Hotels', websiteUrl: 'https://www.flchotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flchotels.com/khuyen-mai'] },
  { name: 'Mường Thanh', websiteUrl: 'https://muongthanh.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://muongthanh.com/khuyen-mai'] },
  { name: 'InterContinental VN', websiteUrl: 'https://www.ihg.com/intercontinental/hotels/vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ihg.com/intercontinental/offers/vn/vi'] },
  { name: 'Marriott VN', websiteUrl: 'https://www.marriott.com/vi', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.marriott.com/vi/offers.mi'] },
  { name: 'Accor VN', websiteUrl: 'https://all.accor.com/ssr/app/accor/hotels/vietnam', categorySlug: 'seyahat-ulasim', seedUrls: ['https://all.accor.com/promotions/vi.shtml'] },
  { name: 'Hilton VN', websiteUrl: 'https://www.hilton.com/vi', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hilton.com/vi/offers/'] },
  { name: 'Expedia VN', websiteUrl: 'https://www.expedia.com.vn', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.vn/deals'] },
  { name: 'Trip.com VN', websiteUrl: 'https://vn.trip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://vn.trip.com/sale/deals'] },
  { name: 'Hotels.com VN', websiteUrl: 'https://vi.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://vi.hotels.com/deals'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Vietcombank', websiteUrl: 'https://www.vietcombank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.vietcombank.com.vn/vi-VN/Promotions'] },
  { name: 'VietinBank', websiteUrl: 'https://www.vietinbank.vn', categorySlug: 'finans', seedUrls: ['https://www.vietinbank.vn/khuyen-mai'] },
  { name: 'BIDV', websiteUrl: 'https://www.bidv.com.vn', categorySlug: 'finans', seedUrls: ['https://www.bidv.com.vn/vn/khuyen-mai'] },
  { name: 'Techcombank', websiteUrl: 'https://www.techcombank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.techcombank.com.vn/khuyen-mai'] },
  { name: 'VPBank', websiteUrl: 'https://www.vpbank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.vpbank.com.vn/khuyen-mai'] },
  { name: 'MoMo', websiteUrl: 'https://momo.vn', categorySlug: 'finans', seedUrls: ['https://momo.vn/khuyen-mai', 'https://momo.vn/tin-tuc/khuyen-mai'] },
  { name: 'ZaloPay', websiteUrl: 'https://zalopay.vn', categorySlug: 'finans', seedUrls: ['https://zalopay.vn/khuyen-mai'] },
  { name: 'VNPay', websiteUrl: 'https://vnpay.vn', categorySlug: 'finans', seedUrls: ['https://vnpay.vn/khuyen-mai'] },
  { name: 'MB Bank', websiteUrl: 'https://www.mbbank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.mbbank.com.vn/khuyen-mai'] },
  { name: 'ACB', websiteUrl: 'https://www.acb.com.vn', categorySlug: 'finans', seedUrls: ['https://www.acb.com.vn/khuyen-mai'] },
  { name: 'Sacombank', websiteUrl: 'https://www.sacombank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.sacombank.com.vn/khuyen-mai'] },
  { name: 'SHB', websiteUrl: 'https://www.shb.com.vn', categorySlug: 'finans', seedUrls: ['https://www.shb.com.vn/khuyen-mai'] },
  { name: 'HDBank', websiteUrl: 'https://www.hdbank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.hdbank.com.vn/khuyen-mai'] },
  { name: 'TPBank', websiteUrl: 'https://tpb.vn', categorySlug: 'finans', seedUrls: ['https://tpb.vn/khuyen-mai'] },
  { name: 'VIB', websiteUrl: 'https://www.vib.com.vn', categorySlug: 'finans', seedUrls: ['https://www.vib.com.vn/khuyen-mai'] },
  { name: 'OCB', websiteUrl: 'https://www.ocb.com.vn', categorySlug: 'finans', seedUrls: ['https://www.ocb.com.vn/khuyen-mai'] },
  { name: 'MSB', websiteUrl: 'https://www.msb.com.vn', categorySlug: 'finans', seedUrls: ['https://www.msb.com.vn/khuyen-mai'] },
  { name: 'LPBank', websiteUrl: 'https://www.lpbank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.lpbank.com.vn/khuyen-mai'] },
  { name: 'Agribank', websiteUrl: 'https://www.agribank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.agribank.com.vn/khuyen-mai'] },
  { name: 'HSBC Vietnam', websiteUrl: 'https://www.hsbc.com.vn', categorySlug: 'finans', seedUrls: ['https://www.hsbc.com.vn/vi-vn/offers/'] },
  { name: 'Standard Chartered VN', websiteUrl: 'https://www.sc.com/vn', categorySlug: 'finans', seedUrls: ['https://www.sc.com/vn/khuyen-mai/'] },
  { name: 'Citibank VN', websiteUrl: 'https://www.citibank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.citibank.com.vn/vi/khuyen-mai/'] },
  { name: 'Shinhan Bank VN', websiteUrl: 'https://www.shinhanbank.com.vn', categorySlug: 'finans', seedUrls: ['https://www.shinhanbank.com.vn/khuyen-mai'] },
  { name: 'Home Credit', websiteUrl: 'https://www.homecredit.vn', categorySlug: 'finans', seedUrls: ['https://www.homecredit.vn/khuyen-mai'] },
  { name: 'FE Credit', websiteUrl: 'https://www.fecredit.com.vn', categorySlug: 'finans', seedUrls: ['https://www.fecredit.com.vn/khuyen-mai'] },
  { name: 'Visa VN', websiteUrl: 'https://www.visa.com.vn', categorySlug: 'finans', seedUrls: ['https://www.visa.com.vn/vi_VN/offers/'] },
  { name: 'Mastercard VN', websiteUrl: 'https://www.mastercard.com/vn', categorySlug: 'finans', seedUrls: ['https://www.mastercard.com/vn/vi-vn/offers.html'] },
  { name: 'ShopeePay', websiteUrl: 'https://shopeepay.vn', categorySlug: 'finans', seedUrls: ['https://shopeepay.vn/khuyen-mai'] },
  { name: 'Moca', websiteUrl: 'https://moca.vn', categorySlug: 'finans', seedUrls: ['https://moca.vn/khuyen-mai'] },
  { name: 'Payoo', websiteUrl: 'https://payoo.vn', categorySlug: 'finans', seedUrls: ['https://payoo.vn/khuyen-mai'] },
  { name: 'SmartPay', websiteUrl: 'https://smartpay.com.vn', categorySlug: 'finans', seedUrls: ['https://smartpay.com.vn/khuyen-mai'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Bảo Việt', websiteUrl: 'https://www.baoviet.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.baoviet.com.vn/khuyen-mai'] },
  { name: 'PVI', websiteUrl: 'https://www.pvi.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.pvi.com.vn/khuyen-mai'] },
  { name: 'Manulife', websiteUrl: 'https://www.manulife.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.manulife.com.vn/vi/khuyen-mai.html'] },
  { name: 'Prudential', websiteUrl: 'https://www.prudential.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.prudential.com.vn/vi/khuyen-mai/'] },
  { name: 'AIA', websiteUrl: 'https://www.aia.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.aia.com.vn/vi/khuyen-mai.html'] },
  { name: 'Dai-ichi Life', websiteUrl: 'https://www.dai-ichi-life.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.dai-ichi-life.com.vn/khuyen-mai'] },
  { name: 'Sun Life', websiteUrl: 'https://www.sunlife.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.sunlife.com.vn/vi/khuyen-mai/'] },
  { name: 'Generali', websiteUrl: 'https://www.generali.vn', categorySlug: 'sigorta', seedUrls: ['https://www.generali.vn/khuyen-mai'] },
  { name: 'FWD', websiteUrl: 'https://www.fwd.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.fwd.com.vn/vi/khuyen-mai/'] },
  { name: 'Cathay Life', websiteUrl: 'https://www.cathaylife.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.cathaylife.com.vn/khuyen-mai'] },
  { name: 'MB Ageas Life', websiteUrl: 'https://www.mbageas.life', categorySlug: 'sigorta', seedUrls: ['https://www.mbageas.life/khuyen-mai'] },
  { name: 'BIDV MetLife', websiteUrl: 'https://www.bidvmetlife.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.bidvmetlife.com.vn/khuyen-mai'] },
  { name: 'Hanwha Life', websiteUrl: 'https://www.hanwhalife.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.hanwhalife.com.vn/khuyen-mai'] },
  { name: 'Bảo Minh', websiteUrl: 'https://www.baominh.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.baominh.com.vn/khuyen-mai'] },
  { name: 'PetroVietnam Insurance', websiteUrl: 'https://pjico.com.vn', categorySlug: 'sigorta', seedUrls: ['https://pjico.com.vn/khuyen-mai'] },
  { name: 'MIC', websiteUrl: 'https://www.mic.vn', categorySlug: 'sigorta', seedUrls: ['https://www.mic.vn/khuyen-mai'] },
  { name: 'BIC', websiteUrl: 'https://www.bic.vn', categorySlug: 'sigorta', seedUrls: ['https://www.bic.vn/khuyen-mai'] },
  { name: 'PTI', websiteUrl: 'https://www.pti.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.pti.com.vn/khuyen-mai'] },
  { name: 'BSH', websiteUrl: 'https://www.bsh.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.bsh.com.vn/khuyen-mai'] },
  { name: 'VBI', websiteUrl: 'https://www.vbi.vn', categorySlug: 'sigorta', seedUrls: ['https://www.vbi.vn/khuyen-mai'] },
  { name: 'Tokio Marine VN', websiteUrl: 'https://www.tokiomarine.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.tokiomarine.com.vn/khuyen-mai'] },
  { name: 'Liberty Insurance VN', websiteUrl: 'https://www.libertyinsurance.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.libertyinsurance.com.vn/khuyen-mai'] },
  { name: 'Zurich VN', websiteUrl: 'https://www.zurich.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.com.vn/vi/khuyen-mai'] },
  { name: 'Chubb VN', websiteUrl: 'https://www.chubb.com/vn-vi', categorySlug: 'sigorta', seedUrls: ['https://www.chubb.com/vn-vi/khuyen-mai.html'] },
  { name: 'Samsung Vina Insurance', websiteUrl: 'https://www.samsungvina.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.samsungvina.com.vn/khuyen-mai'] },
  { name: 'Viettel Insurance', websiteUrl: 'https://baohiemviettel.vn', categorySlug: 'sigorta', seedUrls: ['https://baohiemviettel.vn/khuyen-mai'] },
  { name: 'MSIG VN', websiteUrl: 'https://www.msig.com.vn', categorySlug: 'sigorta', seedUrls: ['https://www.msig.com.vn/khuyen-mai'] },
  { name: 'HDI Global VN', websiteUrl: 'https://www.hdi-global.vn', categorySlug: 'sigorta', seedUrls: ['https://www.hdi-global.vn/khuyen-mai'] },
  { name: 'Saladin', websiteUrl: 'https://saladin.vn', categorySlug: 'sigorta', seedUrls: ['https://saladin.vn/khuyen-mai'] },
  { name: 'OPES', websiteUrl: 'https://opes.com.vn', categorySlug: 'sigorta', seedUrls: ['https://opes.com.vn/khuyen-mai'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'VinFast', websiteUrl: 'https://vinfast.vn', categorySlug: 'otomobil', seedUrls: ['https://vinfast.vn/khuyen-mai', 'https://vinfast.vn/uu-dai'] },
  { name: 'Toyota', websiteUrl: 'https://www.toyota.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.vn/khuyen-mai', 'https://www.toyota.com.vn/uu-dai'] },
  { name: 'Honda', websiteUrl: 'https://www.honda.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.vn/o-to/khuyen-mai'] },
  { name: 'Hyundai', websiteUrl: 'https://www.hyundai.com/vn', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/vn/vi/khuyen-mai'] },
  { name: 'KIA', websiteUrl: 'https://www.kia.com/vn', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/vn/khuyen-mai.html'] },
  { name: 'Mazda', websiteUrl: 'https://www.mazda.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.com.vn/khuyen-mai'] },
  { name: 'Ford', websiteUrl: 'https://www.ford.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.ford.com.vn/khuyen-mai/'] },
  { name: 'Mitsubishi', websiteUrl: 'https://www.mitsubishi-motors.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.com.vn/khuyen-mai'] },
  { name: 'Suzuki', websiteUrl: 'https://suzuki.com.vn', categorySlug: 'otomobil', seedUrls: ['https://suzuki.com.vn/khuyen-mai'] },
  { name: 'Nissan', websiteUrl: 'https://www.nissan.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.vn/khuyen-mai.html'] },
  { name: 'Mercedes-Benz', websiteUrl: 'https://www.mercedes-benz.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.vn/vi/passengercars/buy/offers.html'] },
  { name: 'BMW', websiteUrl: 'https://www.bmw.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.vn/vi/offers.html'] },
  { name: 'Audi', websiteUrl: 'https://www.audi.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.vn/vn/web/vi/offers.html'] },
  { name: 'Lexus', websiteUrl: 'https://www.lexus.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.lexus.com.vn/vi/khuyen-mai'] },
  { name: 'Volvo', websiteUrl: 'https://www.volvocars.com/vn', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/vn/offers/'] },
  { name: 'Subaru', websiteUrl: 'https://www.subaru.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.com.vn/khuyen-mai'] },
  { name: 'Peugeot', websiteUrl: 'https://www.peugeot.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.vn/khuyen-mai'] },
  { name: 'MG', websiteUrl: 'https://www.mgcars.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.mgcars.com.vn/khuyen-mai'] },
  { name: 'Wuling', websiteUrl: 'https://wuling.com.vn', categorySlug: 'otomobil', seedUrls: ['https://wuling.com.vn/khuyen-mai'] },
  { name: 'Chery', websiteUrl: 'https://chery.com.vn', categorySlug: 'otomobil', seedUrls: ['https://chery.com.vn/khuyen-mai'] },
  { name: 'Isuzu', websiteUrl: 'https://isuzu.com.vn', categorySlug: 'otomobil', seedUrls: ['https://isuzu.com.vn/khuyen-mai'] },
  { name: 'Yamaha Motor', websiteUrl: 'https://www.yamaha-motor.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.yamaha-motor.com.vn/khuyen-mai'] },
  { name: 'Honda Motor', websiteUrl: 'https://www.honda.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.vn/xe-may/khuyen-mai'] },
  { name: 'Piaggio', websiteUrl: 'https://www.piaggio.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.piaggio.com.vn/khuyen-mai'] },
  { name: 'SYM', websiteUrl: 'https://sym.com.vn', categorySlug: 'otomobil', seedUrls: ['https://sym.com.vn/khuyen-mai'] },
  { name: 'Petrolimex', websiteUrl: 'https://www.petrolimex.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.petrolimex.com.vn/khuyen-mai.html'] },
  { name: 'Bridgestone', websiteUrl: 'https://www.bridgestone.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.bridgestone.com.vn/vi/khuyen-mai'] },
  { name: 'Michelin', websiteUrl: 'https://www.michelin.com.vn', categorySlug: 'otomobil', seedUrls: ['https://www.michelin.com.vn/khuyen-mai'] },
  { name: 'GWM', websiteUrl: 'https://gwm.com.vn', categorySlug: 'otomobil', seedUrls: ['https://gwm.com.vn/khuyen-mai'] },
  { name: 'Haval', websiteUrl: 'https://haval.com.vn', categorySlug: 'otomobil', seedUrls: ['https://haval.com.vn/khuyen-mai'] },
  { name: 'BYD', websiteUrl: 'https://byd.com.vn', categorySlug: 'otomobil', seedUrls: ['https://byd.com.vn/khuyen-mai'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobby (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Fahasa', websiteUrl: 'https://www.fahasa.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.fahasa.com/khuyen-mai', 'https://www.fahasa.com/sale'] },
  { name: 'Tiki Books', websiteUrl: 'https://tiki.vn/sach-truyen-tieng-viet/c316', categorySlug: 'kitap-hobi', seedUrls: ['https://tiki.vn/sach-truyen-tieng-viet/c316?sort=discount_percent_desc'] },
  { name: 'Nhà Nam', websiteUrl: 'https://nhanam.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://nhanam.vn/khuyen-mai'] },
  { name: 'Alpha Books', websiteUrl: 'https://alphabooks.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://alphabooks.vn/khuyen-mai'] },
  { name: 'Nhà Sách Phương Nam', websiteUrl: 'https://nhasachphuongnam.com', categorySlug: 'kitap-hobi', seedUrls: ['https://nhasachphuongnam.com/khuyen-mai'] },
  { name: 'Vinabook', websiteUrl: 'https://www.vinabook.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.vinabook.com/khuyen-mai'] },
  { name: 'Kim Đồng', websiteUrl: 'https://nxbkimdong.com.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://nxbkimdong.com.vn/khuyen-mai'] },
  { name: 'Thái Hà Books', websiteUrl: 'https://thaihabooks.com', categorySlug: 'kitap-hobi', seedUrls: ['https://thaihabooks.com/khuyen-mai'] },
  { name: 'Skybooks', websiteUrl: 'https://skybooks.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://skybooks.vn/khuyen-mai'] },
  { name: 'Đông A Books', websiteUrl: 'https://dongabooks.com', categorySlug: 'kitap-hobi', seedUrls: ['https://dongabooks.com/khuyen-mai'] },
  { name: 'Netflix VN', websiteUrl: 'https://www.netflix.com/vn', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/vn/'] },
  { name: 'Spotify', websiteUrl: 'https://www.spotify.com/vn-vi', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/vn-vi/premium/'] },
  { name: 'Apple Music', websiteUrl: 'https://music.apple.com/vn', categorySlug: 'kitap-hobi', seedUrls: ['https://music.apple.com/vn/'] },
  { name: 'YouTube Premium', websiteUrl: 'https://www.youtube.com/premium', categorySlug: 'kitap-hobi', seedUrls: ['https://www.youtube.com/premium'] },
  { name: 'VTV Go', websiteUrl: 'https://vtvgo.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://vtvgo.vn/khuyen-mai'] },
  { name: 'FPT Play', websiteUrl: 'https://fptplay.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://fptplay.vn/khuyen-mai'] },
  { name: 'Galaxy Play', websiteUrl: 'https://galaxyplay.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://galaxyplay.vn/khuyen-mai'] },
  { name: 'PlayStation VN', websiteUrl: 'https://store.playstation.com/vi-vn', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/vi-vn/category/deals'] },
  { name: 'Steam VN', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Nintendo', websiteUrl: 'https://www.nintendo.com/vn', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.com/vn/store/deals/'] },
  { name: 'Lego', websiteUrl: 'https://www.lego.com/vi-vn', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/vi-vn/categories/sales-and-deals'] },
  { name: 'CGV', websiteUrl: 'https://www.cgv.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cgv.vn/khuyen-mai/'] },
  { name: 'Lotte Cinema', websiteUrl: 'https://www.lottecinemavn.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lottecinemavn.com/LCWS/Contents/Event/EventList.aspx'] },
  { name: 'Galaxy Cinema', websiteUrl: 'https://www.galaxycine.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://www.galaxycine.vn/khuyen-mai'] },
  { name: 'BHD Star', websiteUrl: 'https://www.bfriendbhdstar.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bfriendbhdstar.vn/khuyen-mai'] },
  { name: 'Ticketbox', websiteUrl: 'https://ticketbox.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://ticketbox.vn/khuyen-mai'] },
  { name: 'VNExpress Marathon', websiteUrl: 'https://vnexpress.net/marathon', categorySlug: 'kitap-hobi', seedUrls: ['https://vnexpress.net/marathon'] },
  { name: 'Udemy', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=vi&src=ukw&q=khuyen-mai'] },
  { name: 'Coursera', websiteUrl: 'https://www.coursera.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coursera.org/offers'] },
  { name: 'Zing MP3', websiteUrl: 'https://zingmp3.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://zingmp3.vn/vip'] },
  { name: 'VieON', websiteUrl: 'https://vieon.vn', categorySlug: 'kitap-hobi', seedUrls: ['https://vieon.vn/khuyen-mai'] },
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
  console.log('=== VN Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'VN' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'VN', categoryId: category.id },
      });

      brandsOk++;

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
            schedule: '0 10 * * *',
            agingDays: 7,
            market: 'VN',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'VN' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'VN', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active VN sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
