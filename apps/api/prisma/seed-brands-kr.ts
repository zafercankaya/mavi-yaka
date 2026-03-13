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

// ── ALL KR BRANDS DATA ──────────────────────────────────
const BRANDS: BrandEntry[] = [

  // ═══════════════════════════════════════════════════════
  // 1) Shopping (alisveris) — 35 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Coupang', websiteUrl: 'https://www.coupang.com', categorySlug: 'alisveris', seedUrls: ['https://www.coupang.com/np/goldbox', 'https://www.coupang.com/np/campaigns'] },
  { name: '11st', websiteUrl: 'https://www.11st.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.11st.co.kr/html/event/index.html', 'https://www.11st.co.kr/html/deal/index.html'] },
  { name: 'Gmarket', websiteUrl: 'https://www.gmarket.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.gmarket.co.kr/n/superdeal', 'https://www.gmarket.co.kr/n/deal'] },
  { name: 'Auction', websiteUrl: 'https://www.auction.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.auction.co.kr/deal/specialdeal', 'https://www.auction.co.kr/deal/todaydeal'] },
  { name: 'SSG.com', websiteUrl: 'https://www.ssg.com', categorySlug: 'alisveris', seedUrls: ['https://www.ssg.com/event/eventMain.ssg', 'https://www.ssg.com/deal/dealMain.ssg'] },
  { name: 'Lotte ON', websiteUrl: 'https://www.lotteon.com', categorySlug: 'alisveris', seedUrls: ['https://www.lotteon.com/p/display/shop/seltDeal/main', 'https://www.lotteon.com/event'] },
  { name: 'Naver Shopping', websiteUrl: 'https://shopping.naver.com', categorySlug: 'alisveris', seedUrls: ['https://shopping.naver.com/plan2/p/index', 'https://shopping.naver.com/home/p/index'] },
  { name: 'Tmon', websiteUrl: 'https://www.tmon.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.tmon.co.kr/deal', 'https://www.tmon.co.kr/planning'] },
  { name: 'WeMakePrice', websiteUrl: 'https://www.wemakeprice.com', categorySlug: 'alisveris', seedUrls: ['https://www.wemakeprice.com/deal/timedeal', 'https://www.wemakeprice.com/deal/today'] },
  { name: 'Interpark', websiteUrl: 'https://www.interpark.com', categorySlug: 'alisveris', seedUrls: ['https://www.interpark.com/malls/index.html', 'https://www.interpark.com/exhibition/index.html'] },
  { name: 'AliExpress Korea', websiteUrl: 'https://ko.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://ko.aliexpress.com/campaign/wow/gcp-plus/ae/channel/channelPromotion', 'https://ko.aliexpress.com/wholesale'] },
  { name: 'Temu Korea', websiteUrl: 'https://www.temu.com/kr', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/kr/sale.html', 'https://www.temu.com/kr/deals.html'] },
  { name: 'CJ Onstyle', websiteUrl: 'https://www.cjonstyle.com', categorySlug: 'alisveris', seedUrls: ['https://www.cjonstyle.com/event', 'https://www.cjonstyle.com/deal'] },
  { name: 'GS Shop', websiteUrl: 'https://www.gsshop.com', categorySlug: 'alisveris', seedUrls: ['https://www.gsshop.com/shop/event/main.gs', 'https://www.gsshop.com/deal'] },
  { name: 'Hyundai Hmall', websiteUrl: 'https://www.hmall.com', categorySlug: 'alisveris', seedUrls: ['https://www.hmall.com/p/pda/eventMain.do', 'https://www.hmall.com/p/pda/dealMain.do'] },
  { name: 'Lotte Homeshopping', websiteUrl: 'https://www.lotteimall.com', categorySlug: 'alisveris', seedUrls: ['https://www.lotteimall.com/main/viewMain.lotte', 'https://www.lotteimall.com/event/planExhibition.lotte'] },
  { name: 'Naver Smart Store', websiteUrl: 'https://smartstore.naver.com', categorySlug: 'alisveris', seedUrls: ['https://shopping.naver.com/plan2/p/index'] },
  { name: 'Kakao Shopping', websiteUrl: 'https://store.kakao.com', categorySlug: 'alisveris', seedUrls: ['https://store.kakao.com/deals', 'https://store.kakao.com/events'] },
  { name: 'Danawa', websiteUrl: 'https://www.danawa.com', categorySlug: 'alisveris', seedUrls: ['https://www.danawa.com/event/', 'https://www.danawa.com/deal/'] },
  { name: 'Emart Mall', websiteUrl: 'https://emart.ssg.com', categorySlug: 'alisveris', seedUrls: ['https://emart.ssg.com/event/eventMain.ssg'] },
  { name: 'Hi Mart', websiteUrl: 'https://www.lotteon.com/p/display/shop/himart', categorySlug: 'alisveris', seedUrls: ['https://www.lotteon.com/p/display/shop/himart/main'] },
  { name: 'Kurly', websiteUrl: 'https://www.kurly.com', categorySlug: 'alisveris', seedUrls: ['https://www.kurly.com/collections/sales', 'https://www.kurly.com/collections/best'] },
  { name: 'iHerb Korea', websiteUrl: 'https://kr.iherb.com', categorySlug: 'alisveris', seedUrls: ['https://kr.iherb.com/specials', 'https://kr.iherb.com/deals'] },
  { name: 'HomePlus Online', websiteUrl: 'https://front.homeplus.co.kr', categorySlug: 'alisveris', seedUrls: ['https://front.homeplus.co.kr/event', 'https://front.homeplus.co.kr/deal'] },
  { name: 'Musinsa Store', websiteUrl: 'https://store.musinsa.com', categorySlug: 'alisveris', seedUrls: ['https://store.musinsa.com/app/campaign/lists'] },
  { name: 'GS25 Online', websiteUrl: 'https://gs25.gsretail.com', categorySlug: 'alisveris', seedUrls: ['https://gs25.gsretail.com/gscvs/ko/customer-engagement/event/current-events'] },
  { name: 'Olive Young Online', websiteUrl: 'https://www.oliveyoung.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.oliveyoung.co.kr/store/planshop/getPlanShopDetail.do', 'https://www.oliveyoung.co.kr/store/main/getEventList.do'] },
  { name: 'Oasis Market', websiteUrl: 'https://www.oasis.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.oasis.co.kr/event'] },
  { name: '29CM', websiteUrl: 'https://www.29cm.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.29cm.co.kr/collections/sale', 'https://www.29cm.co.kr/events'] },
  { name: 'W Concept', websiteUrl: 'https://www.wconcept.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.wconcept.co.kr/Exhibition', 'https://www.wconcept.co.kr/Sale'] },
  { name: 'Brandi', websiteUrl: 'https://www.brandi.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.brandi.co.kr/events', 'https://www.brandi.co.kr/sale'] },
  { name: 'Catch Fashion', websiteUrl: 'https://www.catchfashion.com', categorySlug: 'alisveris', seedUrls: ['https://www.catchfashion.com/sale'] },
  { name: 'Balaan', websiteUrl: 'https://www.balaan.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.balaan.co.kr/shop/sale.html'] },
  { name: 'Trenbe', websiteUrl: 'https://www.trenbe.com', categorySlug: 'alisveris', seedUrls: ['https://www.trenbe.com/sale', 'https://www.trenbe.com/event'] },
  { name: 'ABC Mart Korea', websiteUrl: 'https://www.abcmart.co.kr', categorySlug: 'alisveris', seedUrls: ['https://www.abcmart.co.kr/abc/event/event', 'https://www.abcmart.co.kr/abc/sale'] },

  // ═══════════════════════════════════════════════════════
  // 2) Electronics (elektronik) — 35 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung', websiteUrl: 'https://www.samsung.com/sec', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/sec/offer/', 'https://www.samsung.com/sec/event/'] },
  { name: 'LG', websiteUrl: 'https://www.lge.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.lge.co.kr/promotion', 'https://www.lge.co.kr/event'] },
  { name: 'Apple Korea', websiteUrl: 'https://www.apple.com/kr', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/kr/shop/go/special_deals', 'https://www.apple.com/kr/shop/go/product/refurbished'] },
  { name: 'SK Telecom', websiteUrl: 'https://www.sktelecom.com', categorySlug: 'elektronik', seedUrls: ['https://www.tworld.co.kr/normal/event/main.do'] },
  { name: 'KT', websiteUrl: 'https://www.kt.com', categorySlug: 'elektronik', seedUrls: ['https://shop.kt.com/event/eventMain.do', 'https://shop.kt.com/display/olhsPlan.do'] },
  { name: 'LG U+', websiteUrl: 'https://www.lguplus.com', categorySlug: 'elektronik', seedUrls: ['https://www.lguplus.com/event', 'https://www.lguplus.com/benefit'] },
  { name: 'Naver', websiteUrl: 'https://www.naver.com', categorySlug: 'elektronik', seedUrls: ['https://naver.shopping.naver.com/plan2/p/index'] },
  { name: 'Kakao', websiteUrl: 'https://www.kakaocorp.com', categorySlug: 'elektronik', seedUrls: ['https://store.kakao.com/deals'] },
  { name: 'Daangn Market', websiteUrl: 'https://www.daangn.com', categorySlug: 'elektronik', seedUrls: ['https://www.daangn.com/'] },
  { name: 'Samsung Electronics Store', websiteUrl: 'https://www.samsung.com/sec', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/sec/smartphones/all-smartphones/', 'https://www.samsung.com/sec/offer/online-exclusive/'] },
  { name: 'LG Best Shop', websiteUrl: 'https://www.lge.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.lge.co.kr/promotion', 'https://www.lge.co.kr/lgbestshop/event'] },
  { name: 'Hi Mart Electronics', websiteUrl: 'https://www.e-himart.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.e-himart.co.kr/app/event/eventMain.do', 'https://www.e-himart.co.kr/app/deal/dealMain.do'] },
  { name: 'Compuzone', websiteUrl: 'https://www.compuzone.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.compuzone.co.kr/event/event_list.htm'] },
  { name: 'Danawa Electronics', websiteUrl: 'https://www.danawa.com', categorySlug: 'elektronik', seedUrls: ['https://www.danawa.com/event/', 'https://www.danawa.com/deal/'] },
  { name: 'Joongna', websiteUrl: 'https://web.joongna.com', categorySlug: 'elektronik', seedUrls: ['https://web.joongna.com/event'] },
  { name: 'Bunjang', websiteUrl: 'https://m.bunjang.co.kr', categorySlug: 'elektronik', seedUrls: ['https://m.bunjang.co.kr/event'] },
  { name: 'Dell Korea', websiteUrl: 'https://www.dell.com/ko-kr', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/ko-kr/shop/deals'] },
  { name: 'HP Korea', websiteUrl: 'https://www.hp.com/kr-ko', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/kr-ko/shop/offer.aspx'] },
  { name: 'Lenovo Korea', websiteUrl: 'https://www.lenovo.com/kr/ko', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/kr/ko/d/deals/'] },
  { name: 'ASUS Korea', websiteUrl: 'https://www.asus.com/kr', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/kr/event/'] },
  { name: 'Sony Korea', websiteUrl: 'https://store.sony.co.kr', categorySlug: 'elektronik', seedUrls: ['https://store.sony.co.kr/event', 'https://store.sony.co.kr/promotion'] },
  { name: 'Dyson Korea', websiteUrl: 'https://www.dyson.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.co.kr/deals', 'https://www.dyson.co.kr/promotions'] },
  { name: 'Xiaomi Korea', websiteUrl: 'https://www.mi.com/kr', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/kr/sale', 'https://www.mi.com/kr/event'] },
  { name: 'Logitech Korea', websiteUrl: 'https://www.logitech.com/ko-kr', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/ko-kr/promo'] },
  { name: 'Nintendo Korea', websiteUrl: 'https://www.nintendo.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.nintendo.co.kr/news/event'] },
  { name: 'PlayStation Korea', websiteUrl: 'https://store.playstation.com/ko-kr', categorySlug: 'elektronik', seedUrls: ['https://store.playstation.com/ko-kr/category/deals/'] },
  { name: 'Coway', websiteUrl: 'https://www.coway.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.coway.co.kr/event/list.do', 'https://www.coway.co.kr/promotion'] },
  { name: 'SK Magic', websiteUrl: 'https://www.skmagic.com', categorySlug: 'elektronik', seedUrls: ['https://www.skmagic.com/event', 'https://www.skmagic.com/promotion'] },
  { name: 'Bose Korea', websiteUrl: 'https://www.bose.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.bose.co.kr/ko_kr/promotions.html'] },
  { name: 'JBL Korea', websiteUrl: 'https://kr.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://kr.jbl.com/promotion.html'] },
  { name: 'Canon Korea', websiteUrl: 'https://store.canon-ci.co.kr', categorySlug: 'elektronik', seedUrls: ['https://store.canon-ci.co.kr/event'] },
  { name: 'Epson Korea', websiteUrl: 'https://www.epson.co.kr', categorySlug: 'elektronik', seedUrls: ['https://www.epson.co.kr/event', 'https://www.epson.co.kr/promotion'] },
  { name: 'MSI Korea', websiteUrl: 'https://kr.msi.com', categorySlug: 'elektronik', seedUrls: ['https://kr.msi.com/Promotion/'] },
  { name: 'Razer Korea', websiteUrl: 'https://www.razer.com/kr-en', categorySlug: 'elektronik', seedUrls: ['https://www.razer.com/kr-en/deals'] },
  { name: 'Samsung Galaxy Store', websiteUrl: 'https://www.samsung.com/sec/galaxy', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/sec/galaxy/', 'https://www.samsung.com/sec/event/galaxy/'] },

  // ═══════════════════════════════════════════════════════
  // 3) Fashion (giyim-moda) — 35 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Musinsa', websiteUrl: 'https://www.musinsa.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.musinsa.com/app/campaign/lists', 'https://www.musinsa.com/app/sale'] },
  { name: 'Handsome', websiteUrl: 'https://www.thehandsome.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.thehandsome.com/ko/event', 'https://www.thehandsome.com/ko/sale'] },
  { name: 'Kolon Mall', websiteUrl: 'https://www.kolonmall.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.kolonmall.com/Event', 'https://www.kolonmall.com/Sale'] },
  { name: 'Samsung C&T Fashion', websiteUrl: 'https://www.ssfshop.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.ssfshop.com/event', 'https://www.ssfshop.com/sale'] },
  { name: 'Uniqlo Korea', websiteUrl: 'https://www.uniqlo.com/kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.uniqlo.com/kr/ko/spl/sale/', 'https://www.uniqlo.com/kr/ko/spl/limited-offers/'] },
  { name: 'Zara Korea', websiteUrl: 'https://www.zara.com/kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/kr/en/z-sale-l1702.html'] },
  { name: 'H&M Korea', websiteUrl: 'https://www2.hm.com/ko_kr', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/ko_kr/sale.html'] },
  { name: 'Nike Korea', websiteUrl: 'https://www.nike.com/kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/kr/w/sale-3yaep', 'https://www.nike.com/kr/w/deals-3x92y'] },
  { name: 'Adidas Korea', websiteUrl: 'https://www.adidas.co.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.co.kr/sale', 'https://www.adidas.co.kr/outlet'] },
  { name: 'New Balance Korea', websiteUrl: 'https://www.nbkorea.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.nbkorea.com/event/event_list.action'] },
  { name: 'Gentle Monster', websiteUrl: 'https://www.gentlemonster.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.gentlemonster.com/kr/shop'] },
  { name: 'MLB Korea', websiteUrl: 'https://www.mlb-korea.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.mlb-korea.com/sale', 'https://www.mlb-korea.com/event'] },
  { name: 'Fila Korea', websiteUrl: 'https://www.fila.co.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.fila.co.kr/event/index.asp', 'https://www.fila.co.kr/sale/'] },
  { name: 'Discovery Expedition', websiteUrl: 'https://www.discovery-expedition.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.discovery-expedition.com/event', 'https://www.discovery-expedition.com/sale'] },
  { name: 'Ader Error', websiteUrl: 'https://www.adererror.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.adererror.com/sale'] },
  { name: 'Covernat', websiteUrl: 'https://covernat.net', categorySlug: 'giyim-moda', seedUrls: ['https://covernat.net/product/sale'] },
  { name: 'Thisisneverthat', websiteUrl: 'https://thisisneverthat.com', categorySlug: 'giyim-moda', seedUrls: ['https://thisisneverthat.com/sale'] },
  { name: 'Andersson Bell', websiteUrl: 'https://www.anderssonbell.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.anderssonbell.com/sale'] },
  { name: 'Spao', websiteUrl: 'https://spao.com', categorySlug: 'giyim-moda', seedUrls: ['https://spao.com/sale', 'https://spao.com/event'] },
  { name: 'Top Ten', websiteUrl: 'https://www.topten10.co.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.topten10.co.kr/event', 'https://www.topten10.co.kr/sale'] },
  { name: 'Mixxo', websiteUrl: 'https://www.mixxo.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.mixxo.com/sale'] },
  { name: 'PAT', websiteUrl: 'https://www.pat.co.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.pat.co.kr/event', 'https://www.pat.co.kr/sale'] },
  { name: 'Beanpole', websiteUrl: 'https://www.ssfshop.com/beanpole', categorySlug: 'giyim-moda', seedUrls: ['https://www.ssfshop.com/beanpole/sale'] },
  { name: 'MCM Korea', websiteUrl: 'https://kr.mcmworldwide.com', categorySlug: 'giyim-moda', seedUrls: ['https://kr.mcmworldwide.com/ko_KR/sale'] },
  { name: 'Charles & Keith Korea', websiteUrl: 'https://www.charleskeith.com/kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.charleskeith.com/kr/sale'] },
  { name: 'Guess Korea', websiteUrl: 'https://www.guess.co.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.co.kr/event', 'https://www.guess.co.kr/sale'] },
  { name: 'Tommy Hilfiger Korea', websiteUrl: 'https://korea.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://korea.tommy.com/sale'] },
  { name: 'Calvin Klein Korea', websiteUrl: 'https://www.calvinklein.co.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.co.kr/sale'] },
  { name: 'Polo Ralph Lauren Korea', websiteUrl: 'https://www.ralphlauren.co.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.ralphlauren.co.kr/ko/sale'] },
  { name: 'Mango Korea', websiteUrl: 'https://shop.mango.com/kr', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/kr/ko/sale'] },
  { name: 'COS Korea', websiteUrl: 'https://www.cos.com/ko-kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.cos.com/ko-kr/sale.html'] },
  { name: 'Lacoste Korea', websiteUrl: 'https://www.lacoste.co.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.co.kr/lacoste/sale'] },
  { name: 'Hazzys', websiteUrl: 'https://www.hazzys.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.hazzys.com/event', 'https://www.hazzys.com/sale'] },
  { name: 'SJYP', websiteUrl: 'https://www.sjyp.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.sjyp.com/sale'] },
  { name: 'Nerdy', websiteUrl: 'https://www.nerdy.kr', categorySlug: 'giyim-moda', seedUrls: ['https://www.nerdy.kr/sale', 'https://www.nerdy.kr/event'] },

  // ═══════════════════════════════════════════════════════
  // 4) Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA Korea', websiteUrl: 'https://www.ikea.com/kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/kr/ko/offers/', 'https://www.ikea.com/kr/ko/campaigns/'] },
  { name: 'Hanssem', websiteUrl: 'https://www.hanssem.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.hanssem.com/event', 'https://www.hanssem.com/sale'] },
  { name: 'Livart', websiteUrl: 'https://www.livart.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.livart.co.kr/event', 'https://www.livart.co.kr/promotion'] },
  { name: 'LG Hausys', websiteUrl: 'https://www.lghausys.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.lghausys.co.kr/event'] },
  { name: 'Daiso Korea', websiteUrl: 'https://www.daiso.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.daiso.co.kr/event'] },
  { name: 'Iloom', websiteUrl: 'https://www.iloom.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.iloom.com/event', 'https://www.iloom.com/promotion'] },
  { name: 'Today House', websiteUrl: 'https://ohou.se', categorySlug: 'ev-yasam', seedUrls: ['https://ohou.se/events', 'https://ohou.se/deals'] },
  { name: 'Casamia', websiteUrl: 'https://www.casamia.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.casamia.co.kr/event'] },
  { name: 'JAJU', websiteUrl: 'https://www.ssfshop.com/jaju', categorySlug: 'ev-yasam', seedUrls: ['https://www.ssfshop.com/jaju/sale'] },
  { name: 'Muji Korea', websiteUrl: 'https://www.mujikorea.net', categorySlug: 'ev-yasam', seedUrls: ['https://www.mujikorea.net/event', 'https://www.mujikorea.net/sale'] },
  { name: 'Lock & Lock', websiteUrl: 'https://www.locknlockmall.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.locknlockmall.com/event', 'https://www.locknlockmall.com/sale'] },
  { name: 'Cuckoo', websiteUrl: 'https://www.cuckoo.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.cuckoo.co.kr/event', 'https://www.cuckoo.co.kr/promotion'] },
  { name: 'Kyung Dong Navien', websiteUrl: 'https://www.kdnavien.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.kdnavien.co.kr/event'] },
  { name: 'Samsung Bespoke Home', websiteUrl: 'https://www.samsung.com/sec/bespoke-home/', categorySlug: 'ev-yasam', seedUrls: ['https://www.samsung.com/sec/bespoke-home/event/'] },
  { name: 'LG Objet', websiteUrl: 'https://www.lge.co.kr/objet', categorySlug: 'ev-yasam', seedUrls: ['https://www.lge.co.kr/objet/promotion'] },
  { name: 'Coway Home', websiteUrl: 'https://www.coway.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.coway.co.kr/event/list.do'] },
  { name: 'Kuchen', websiteUrl: 'https://www.kuchen.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.kuchen.co.kr/event'] },
  { name: 'Morning Glory', websiteUrl: 'https://www.morningglory.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.morningglory.co.kr/event'] },
  { name: 'Ottogi Home', websiteUrl: 'https://www.ottogimart.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.ottogimart.com/event'] },
  { name: 'Winia', websiteUrl: 'https://www.winia.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.winia.co.kr/event', 'https://www.winia.co.kr/promotion'] },
  { name: 'Philips Korea Home', websiteUrl: 'https://www.philips.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.philips.co.kr/c-e/promotions.html'] },
  { name: 'Simmons Korea', websiteUrl: 'https://www.simmons.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.simmons.co.kr/event'] },
  { name: 'Ace Bed', websiteUrl: 'https://www.acebed.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.acebed.com/event'] },
  { name: 'Tempur Korea', websiteUrl: 'https://kr.tempur.com', categorySlug: 'ev-yasam', seedUrls: ['https://kr.tempur.com/event', 'https://kr.tempur.com/sale'] },
  { name: 'Serta Korea', websiteUrl: 'https://www.serta.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.serta.co.kr/event'] },
  { name: 'Evezary', websiteUrl: 'https://www.evezary.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.evezary.co.kr/event', 'https://www.evezary.co.kr/sale'] },
  { name: 'Hyundai Livart', websiteUrl: 'https://www.livart.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.livart.co.kr/event/planshop'] },
  { name: 'Emart Living', websiteUrl: 'https://emart.ssg.com', categorySlug: 'ev-yasam', seedUrls: ['https://emart.ssg.com/event/eventMain.ssg'] },
  { name: 'Zinus Korea', websiteUrl: 'https://www.zinus.co.kr', categorySlug: 'ev-yasam', seedUrls: ['https://www.zinus.co.kr/event'] },
  { name: 'LG Styler', websiteUrl: 'https://www.lge.co.kr/styler', categorySlug: 'ev-yasam', seedUrls: ['https://www.lge.co.kr/styler/promotion'] },

  // ═══════════════════════════════════════════════════════
  // 5) Food & Grocery (gida-market) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Emart', websiteUrl: 'https://www.emart.com', categorySlug: 'gida-market', seedUrls: ['https://www.emart.com/event', 'https://emart.ssg.com/event/eventMain.ssg'] },
  { name: 'Homeplus', websiteUrl: 'https://front.homeplus.co.kr', categorySlug: 'gida-market', seedUrls: ['https://front.homeplus.co.kr/event', 'https://front.homeplus.co.kr/deal'] },
  { name: 'Lotte Mart', websiteUrl: 'https://www.lottemart.com', categorySlug: 'gida-market', seedUrls: ['https://www.lottemart.com/event', 'https://www.lottemart.com/promotion'] },
  { name: 'GS25', websiteUrl: 'https://gs25.gsretail.com', categorySlug: 'gida-market', seedUrls: ['https://gs25.gsretail.com/gscvs/ko/customer-engagement/event/current-events'] },
  { name: 'CU', websiteUrl: 'https://cu.bgfretail.com', categorySlug: 'gida-market', seedUrls: ['https://cu.bgfretail.com/event/plus.do'] },
  { name: '7-Eleven Korea', websiteUrl: 'https://www.7-eleven.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.7-eleven.co.kr/event/eventList.asp'] },
  { name: 'Market Kurly', websiteUrl: 'https://www.kurly.com', categorySlug: 'gida-market', seedUrls: ['https://www.kurly.com/collections/sales', 'https://www.kurly.com/collections/market-best'] },
  { name: 'Costco Korea', websiteUrl: 'https://www.costco.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.costco.co.kr/event', 'https://www.costco.co.kr/hot-buys'] },
  { name: 'GS The Fresh', websiteUrl: 'https://gsfresh.gsretail.com', categorySlug: 'gida-market', seedUrls: ['https://gsfresh.gsretail.com/event'] },
  { name: 'Emart24', websiteUrl: 'https://www.emart24.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.emart24.co.kr/event'] },
  { name: 'Traders', websiteUrl: 'https://traders.ssg.com', categorySlug: 'gida-market', seedUrls: ['https://traders.ssg.com/event/eventMain.ssg'] },
  { name: 'Nongshim', websiteUrl: 'https://www.nongshim.com', categorySlug: 'gida-market', seedUrls: ['https://www.nongshim.com/event'] },
  { name: 'CJ CheilJedang', websiteUrl: 'https://www.cjthemarket.com', categorySlug: 'gida-market', seedUrls: ['https://www.cjthemarket.com/event', 'https://www.cjthemarket.com/sale'] },
  { name: 'Ottogi', websiteUrl: 'https://www.ottogimart.com', categorySlug: 'gida-market', seedUrls: ['https://www.ottogimart.com/event'] },
  { name: 'Pulmuone', websiteUrl: 'https://www.pulmuoneshop.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.pulmuoneshop.co.kr/event'] },
  { name: 'Dongwon', websiteUrl: 'https://www.dongwonmall.com', categorySlug: 'gida-market', seedUrls: ['https://www.dongwonmall.com/event', 'https://www.dongwonmall.com/sale'] },
  { name: 'Binggrae', websiteUrl: 'https://www.bing.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.bing.co.kr/event'] },
  { name: 'Orion', websiteUrl: 'https://www.orionworld.com', categorySlug: 'gida-market', seedUrls: ['https://www.orionworld.com/event'] },
  { name: 'Lotte Confectionery', websiteUrl: 'https://www.lotteconf.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.lotteconf.co.kr/event'] },
  { name: 'Starbucks Korea', websiteUrl: 'https://www.starbucks.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.starbucks.co.kr/whats_new/campaign_list.do'] },
  { name: 'SSG Food Market', websiteUrl: 'https://www.ssg.com', categorySlug: 'gida-market', seedUrls: ['https://www.ssg.com/event/eventMain.ssg'] },
  { name: 'Hanaro Mart', websiteUrl: 'https://www.nhhanaro.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.nhhanaro.co.kr/event'] },
  { name: 'No Brand', websiteUrl: 'https://nobrand.ssg.com', categorySlug: 'gida-market', seedUrls: ['https://nobrand.ssg.com/event/eventMain.ssg'] },
  { name: 'Hite Jinro', websiteUrl: 'https://www.hitejinro.com', categorySlug: 'gida-market', seedUrls: ['https://www.hitejinro.com/event'] },
  { name: 'Maeil Dairies', websiteUrl: 'https://www.maeil.com', categorySlug: 'gida-market', seedUrls: ['https://www.maeil.com/event'] },
  { name: 'Sempio', websiteUrl: 'https://www.sempio.com', categorySlug: 'gida-market', seedUrls: ['https://www.sempio.com/event'] },
  { name: 'Namyang', websiteUrl: 'https://www.namyangi.com', categorySlug: 'gida-market', seedUrls: ['https://www.namyangi.com/event'] },
  { name: 'Paris Baguette', websiteUrl: 'https://www.paris.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.paris.co.kr/event'] },
  { name: 'Tous Les Jours', websiteUrl: 'https://www.tlj.co.kr', categorySlug: 'gida-market', seedUrls: ['https://www.tlj.co.kr/event'] },
  { name: 'Shinsegae Food', websiteUrl: 'https://www.shinsegaefood.com', categorySlug: 'gida-market', seedUrls: ['https://www.shinsegaefood.com/event'] },

  // ═══════════════════════════════════════════════════════
  // 6) Food & Dining (yeme-icme) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Baemin', websiteUrl: 'https://www.baemin.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.baemin.com/event', 'https://www.baemin.com/promotion'] },
  { name: 'Yogiyo', websiteUrl: 'https://www.yogiyo.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.yogiyo.co.kr/event'] },
  { name: 'Coupang Eats', websiteUrl: 'https://www.coupangeats.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.coupangeats.com/event', 'https://www.coupangeats.com/promotion'] },
  { name: 'BBQ Chicken', websiteUrl: 'https://www.bbq.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.bbq.co.kr/event'] },
  { name: 'Kyochon', websiteUrl: 'https://www.kyochon.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.kyochon.com/event/event.asp'] },
  { name: 'BHC Chicken', websiteUrl: 'https://www.bhc.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.bhc.co.kr/event'] },
  { name: 'Goobne Chicken', websiteUrl: 'https://www.goobne.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.goobne.co.kr/event'] },
  { name: 'Nene Chicken', websiteUrl: 'https://www.nenechicken.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.nenechicken.com/event'] },
  { name: 'Pelicana', websiteUrl: 'https://www.pelicana.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.pelicana.co.kr/event'] },
  { name: 'Dominos Korea', websiteUrl: 'https://www.dominos.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.co.kr/event', 'https://www.dominos.co.kr/promotion'] },
  { name: 'Pizza Hut Korea', websiteUrl: 'https://www.pizzahut.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.co.kr/event'] },
  { name: 'Mr. Pizza', websiteUrl: 'https://www.mrpizza.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.mrpizza.co.kr/event'] },
  { name: 'McDonald\'s Korea', websiteUrl: 'https://www.mcdonalds.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.co.kr/kor/event/list.do'] },
  { name: 'Burger King Korea', websiteUrl: 'https://www.burgerking.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.co.kr/#/event'] },
  { name: 'Lotteria', websiteUrl: 'https://www.lotteria.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.lotteria.com/event'] },
  { name: 'Mom\'s Touch', websiteUrl: 'https://www.momstouch.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.momstouch.co.kr/event'] },
  { name: 'Ediya Coffee', websiteUrl: 'https://www.ediya.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.ediya.com/event'] },
  { name: 'Twosome Place', websiteUrl: 'https://www.twosome.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.twosome.co.kr/event'] },
  { name: 'Mega Coffee', websiteUrl: 'https://www.mega-mgccoffee.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.mega-mgccoffee.com/event'] },
  { name: 'Paik\'s Coffee', websiteUrl: 'https://paikdabang.com', categorySlug: 'yeme-icme', seedUrls: ['https://paikdabang.com/event'] },
  { name: 'Compose Coffee', websiteUrl: 'https://composecoffee.com', categorySlug: 'yeme-icme', seedUrls: ['https://composecoffee.com/event'] },
  { name: 'Hollys Coffee', websiteUrl: 'https://www.hollys.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.hollys.co.kr/event'] },
  { name: 'Angel-in-us Coffee', websiteUrl: 'https://www.angelinus.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.angelinus.co.kr/event'] },
  { name: 'Vips', websiteUrl: 'https://www.ivips.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.ivips.co.kr/event'] },
  { name: 'Outback Korea', websiteUrl: 'https://www.outback.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.outback.co.kr/event', 'https://www.outback.co.kr/promotion'] },
  { name: 'Ashley', websiteUrl: 'https://www.ashley.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.ashley.co.kr/event'] },
  { name: 'School Food', websiteUrl: 'https://www.schoolfood.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.schoolfood.co.kr/event'] },
  { name: 'Gongcha Korea', websiteUrl: 'https://www.gong-cha.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.gong-cha.co.kr/event'] },
  { name: 'Baskin Robbins Korea', websiteUrl: 'https://www.baskinrobbins.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.baskinrobbins.co.kr/event/list.php'] },
  { name: 'Dunkin Korea', websiteUrl: 'https://www.dunkindonuts.co.kr', categorySlug: 'yeme-icme', seedUrls: ['https://www.dunkindonuts.co.kr/event'] },

  // ═══════════════════════════════════════════════════════
  // 7) Beauty & Personal Care (kozmetik-kisisel-bakim) — 35 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Innisfree', websiteUrl: 'https://www.innisfree.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.innisfree.com/kr/ko/event/eventList.do', 'https://www.innisfree.com/kr/ko/sale/'] },
  { name: 'Laneige', websiteUrl: 'https://www.laneige.com/kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laneige.com/kr/ko/event/list.html'] },
  { name: 'Sulwhasoo', websiteUrl: 'https://www.sulwhasoo.com/kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sulwhasoo.com/kr/ko/event/list.html'] },
  { name: 'Etude House', websiteUrl: 'https://www.etude.com/kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.etude.com/kr/ko/event/list.html'] },
  { name: 'Missha', websiteUrl: 'https://www.missha.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.missha.com/event', 'https://www.missha.com/sale'] },
  { name: 'Olive Young', websiteUrl: 'https://www.oliveyoung.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.oliveyoung.co.kr/store/planshop/getPlanShopDetail.do', 'https://www.oliveyoung.co.kr/store/main/getEventList.do'] },
  { name: 'Amorepacific', websiteUrl: 'https://www.amorepacific.com/kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.amorepacific.com/kr/ko/event/list.html'] },
  { name: 'Hera', websiteUrl: 'https://www.hera.com/kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.hera.com/kr/ko/event/list.html'] },
  { name: 'Mamonde', websiteUrl: 'https://www.mamonde.com/kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mamonde.com/kr/ko/event/list.html'] },
  { name: 'The Face Shop', websiteUrl: 'https://www.thefaceshop.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thefaceshop.com/event'] },
  { name: 'Nature Republic', websiteUrl: 'https://www.naturerepublic.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.naturerepublic.com/event'] },
  { name: 'Tony Moly', websiteUrl: 'https://www.tonymoly.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.tonymoly.com/event'] },
  { name: 'Holika Holika', websiteUrl: 'https://www.holikaholika.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.holikaholika.co.kr/event'] },
  { name: 'Clio', websiteUrl: 'https://cliocosmetic.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://cliocosmetic.com/event'] },
  { name: 'Peripera', websiteUrl: 'https://www.peripera.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.peripera.com/event'] },
  { name: 'Banila Co', websiteUrl: 'https://www.banilaco.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.banilaco.com/event'] },
  { name: 'Dr. Jart+', websiteUrl: 'https://www.drjart.com/kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.drjart.com/kr/ko/event'] },
  { name: 'Cosrx', websiteUrl: 'https://www.cosrx.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cosrx.co.kr/event'] },
  { name: 'Mediheal', websiteUrl: 'https://www.mediheal.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.mediheal.com/event'] },
  { name: 'Lush Korea', websiteUrl: 'https://www.lush.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.co.kr/event'] },
  { name: 'MAC Korea', websiteUrl: 'https://www.maccosmetics.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.co.kr/offers'] },
  { name: 'Clinique Korea', websiteUrl: 'https://www.clinique.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.co.kr/offers'] },
  { name: 'Estee Lauder Korea', websiteUrl: 'https://www.esteelauder.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.co.kr/offers'] },
  { name: 'Lancome Korea', websiteUrl: 'https://www.lancome.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lancome.co.kr/offers'] },
  { name: 'Shiseido Korea', websiteUrl: 'https://www.shiseido.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.shiseido.co.kr/event'] },
  { name: 'Kiehl\'s Korea', websiteUrl: 'https://www.kiehls.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.co.kr/offers'] },
  { name: 'It\'s Skin', websiteUrl: 'https://www.itsskin.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.itsskin.com/event'] },
  { name: 'Skinfood', websiteUrl: 'https://www.theskinfood.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.theskinfood.com/event'] },
  { name: 'CNP Laboratory', websiteUrl: 'https://www.cnpcosmetics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.cnpcosmetics.com/event'] },
  { name: 'AHC', websiteUrl: 'https://www.ahc.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.ahc.co.kr/event'] },
  { name: 'Round Lab', websiteUrl: 'https://www.roundlab.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.roundlab.co.kr/event'] },
  { name: 'Goodal', websiteUrl: 'https://www.goodal.co.kr', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.goodal.co.kr/event'] },
  { name: 'Numbuzin', websiteUrl: 'https://www.numbuzin.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.numbuzin.com/event'] },
  { name: 'Beauty of Joseon', websiteUrl: 'https://beautyofjoseon.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://beautyofjoseon.com/event'] },
  { name: 'Torriden', websiteUrl: 'https://www.torriden.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.torriden.com/event'] },

  // ═══════════════════════════════════════════════════════
  // 8) Sports & Outdoor (spor-outdoor) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nike Korea Sports', websiteUrl: 'https://www.nike.com/kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/kr/w/sale-3yaep'] },
  { name: 'Adidas Korea Sports', websiteUrl: 'https://www.adidas.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.co.kr/sale'] },
  { name: 'Fila Korea Sports', websiteUrl: 'https://www.fila.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.co.kr/sale/'] },
  { name: 'Descente Korea', websiteUrl: 'https://www.descentekorea.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.descentekorea.co.kr/event', 'https://www.descentekorea.co.kr/sale'] },
  { name: 'The North Face Korea', websiteUrl: 'https://www.thenorthfacekorea.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthfacekorea.co.kr/event', 'https://www.thenorthfacekorea.co.kr/sale'] },
  { name: 'K2', websiteUrl: 'https://www.k2group.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.k2group.co.kr/event'] },
  { name: 'Black Yak', websiteUrl: 'https://www.blackyak.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.blackyak.com/event', 'https://www.blackyak.com/sale'] },
  { name: 'Nepa', websiteUrl: 'https://www.nepa.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nepa.co.kr/event'] },
  { name: 'Eider', websiteUrl: 'https://www.eider.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.eider.co.kr/event'] },
  { name: 'Columbia Korea', websiteUrl: 'https://www.columbiasportswear.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.co.kr/event'] },
  { name: 'Puma Korea', websiteUrl: 'https://kr.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://kr.puma.com/kr/ko/sale', 'https://kr.puma.com/kr/ko/sale/sale-shoes'] },
  { name: 'Reebok Korea', websiteUrl: 'https://www.reebok.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.co.kr/sale'] },
  { name: 'Under Armour Korea', websiteUrl: 'https://www.underarmour.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.co.kr/event', 'https://www.underarmour.co.kr/outlet'] },
  { name: 'Prospecs', websiteUrl: 'https://www.prospecs.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.prospecs.com/event'] },
  { name: 'Le Coq Sportif Korea', websiteUrl: 'https://www.lecoqsportif.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lecoqsportif.co.kr/event'] },
  { name: 'Mizuno Korea', websiteUrl: 'https://www.mizunokorea.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mizunokorea.co.kr/event'] },
  { name: 'Asics Korea', websiteUrl: 'https://www.asics.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.co.kr/sale'] },
  { name: 'Converse Korea', websiteUrl: 'https://www.converse.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.co.kr/sale'] },
  { name: 'Vans Korea', websiteUrl: 'https://www.vans.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.co.kr/sale'] },
  { name: 'Salomon Korea', websiteUrl: 'https://www.salomon.com/ko-kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/ko-kr/sale.html'] },
  { name: 'Hoka Korea', websiteUrl: 'https://www.hoka.com/ko-kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hoka.com/ko-kr/sale.html'] },
  { name: 'Skechers Korea', websiteUrl: 'https://www.skechersk.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechersk.com/event'] },
  { name: 'Patagonia Korea', websiteUrl: 'https://www.patagonia.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.patagonia.co.kr/event', 'https://www.patagonia.co.kr/sale'] },
  { name: 'Arc\'teryx Korea', websiteUrl: 'https://arcteryx.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://arcteryx.co.kr/event'] },
  { name: 'Helly Hansen Korea', websiteUrl: 'https://www.hellyhansen.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hellyhansen.co.kr/event'] },
  { name: 'Millet Korea', websiteUrl: 'https://www.millet.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.millet.co.kr/event'] },
  { name: 'Callaway Korea', websiteUrl: 'https://www.callawaykorea.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.callawaykorea.co.kr/event'] },
  { name: 'TaylorMade Korea', websiteUrl: 'https://www.taylormadegolf.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.taylormadegolf.co.kr/event'] },
  { name: 'Titleist Korea', websiteUrl: 'https://www.titleist.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.titleist.co.kr/event'] },
  { name: 'Volvik', websiteUrl: 'https://www.volvik.co.kr', categorySlug: 'spor-outdoor', seedUrls: ['https://www.volvik.co.kr/event'] },

  // ═══════════════════════════════════════════════════════
  // 9) Travel & Transport (seyahat-ulasim) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Korean Air', websiteUrl: 'https://www.koreanair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.koreanair.com/kr/ko/promotions', 'https://www.koreanair.com/kr/ko/promotions/ongoing'] },
  { name: 'Asiana Airlines', websiteUrl: 'https://flyasiana.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://flyasiana.com/C/KR/KO/event/list', 'https://flyasiana.com/C/KR/KO/promotion/list'] },
  { name: 'Jeju Air', websiteUrl: 'https://www.jejuair.net', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jejuair.net/ko/event/event_list.do'] },
  { name: 'T\'way Air', websiteUrl: 'https://www.twayair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.twayair.com/event/list'] },
  { name: 'Jin Air', websiteUrl: 'https://www.jinair.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.jinair.com/event/list'] },
  { name: 'Air Busan', websiteUrl: 'https://www.airbusan.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbusan.com/event/list'] },
  { name: 'Air Seoul', websiteUrl: 'https://flyairseoul.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://flyairseoul.com/event'] },
  { name: 'Easter Jet', websiteUrl: 'https://www.eastarjet.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.eastarjet.com/event'] },
  { name: 'Yanolja', websiteUrl: 'https://www.yanolja.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.yanolja.com/event', 'https://www.yanolja.com/promotion'] },
  { name: 'Goodchoice', websiteUrl: 'https://www.goodchoice.kr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.goodchoice.kr/event'] },
  { name: 'KTX', websiteUrl: 'https://www.letskorail.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.letskorail.com/ebizcom/event/eventList.do'] },
  { name: 'Interpark Tour', websiteUrl: 'https://tour.interpark.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://tour.interpark.com/event/'] },
  { name: 'Hana Tour', websiteUrl: 'https://www.hanatour.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hanatour.com/event/', 'https://www.hanatour.com/promotion/'] },
  { name: 'Mode Tour', websiteUrl: 'https://www.modetour.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.modetour.com/event'] },
  { name: 'Yellow Balloon', websiteUrl: 'https://www.ybtour.co.kr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ybtour.co.kr/event'] },
  { name: 'Naver Travel', websiteUrl: 'https://travel.naver.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://travel.naver.com/promotion'] },
  { name: 'Kakao T', websiteUrl: 'https://t.kakao.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://t.kakao.com/event'] },
  { name: 'SOCAR', websiteUrl: 'https://www.socar.kr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.socar.kr/event', 'https://www.socar.kr/promotion'] },
  { name: 'Green Car', websiteUrl: 'https://www.greencar.co.kr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.greencar.co.kr/event'] },
  { name: 'Tada', websiteUrl: 'https://tadatada.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://tadatada.com/event'] },
  { name: 'Booking.com Korea', websiteUrl: 'https://www.booking.com/ko', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.ko.html'] },
  { name: 'Agoda Korea', websiteUrl: 'https://www.agoda.com/ko-kr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.agoda.com/ko-kr/deals'] },
  { name: 'Hotels.com Korea', websiteUrl: 'https://kr.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://kr.hotels.com/deals/'] },
  { name: 'Expedia Korea', websiteUrl: 'https://www.expedia.co.kr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.co.kr/deals'] },
  { name: 'Skyscanner Korea', websiteUrl: 'https://www.skyscanner.co.kr', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.co.kr/deals'] },
  { name: 'Trip.com Korea', websiteUrl: 'https://kr.trip.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://kr.trip.com/sale/deals'] },
  { name: 'Klook Korea', websiteUrl: 'https://www.klook.com/ko', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.klook.com/ko/deals/'] },
  { name: 'Lotte Hotel', websiteUrl: 'https://www.lottehotel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lottehotel.com/global/ko/special-offer.html'] },
  { name: 'Shilla Stay', websiteUrl: 'https://www.shillastay.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.shillastay.com/promotion'] },
  { name: 'Josun Hotels', websiteUrl: 'https://www.josunhotel.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.josunhotel.com/offers'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finance (finans) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'KB Kookmin Bank', websiteUrl: 'https://www.kbstar.com', categorySlug: 'finans', seedUrls: ['https://www.kbstar.com/quics?page=C059652'] },
  { name: 'Shinhan Bank', websiteUrl: 'https://www.shinhan.com', categorySlug: 'finans', seedUrls: ['https://www.shinhan.com/hpe/index.jsp#050401000000'] },
  { name: 'Hana Bank', websiteUrl: 'https://www.kebhana.com', categorySlug: 'finans', seedUrls: ['https://www.kebhana.com/cont/event/event01/index.jsp'] },
  { name: 'Woori Bank', websiteUrl: 'https://www.wooribank.com', categorySlug: 'finans', seedUrls: ['https://www.wooribank.com/ib20/mnu/EventMgr'] },
  { name: 'NH Bank', websiteUrl: 'https://banking.nonghyup.com', categorySlug: 'finans', seedUrls: ['https://banking.nonghyup.com/nhbank.html'] },
  { name: 'IBK Bank', websiteUrl: 'https://www.ibk.co.kr', categorySlug: 'finans', seedUrls: ['https://www.ibk.co.kr/event/eventList.html'] },
  { name: 'Toss', websiteUrl: 'https://toss.im', categorySlug: 'finans', seedUrls: ['https://toss.im/event'] },
  { name: 'Kakao Bank', websiteUrl: 'https://www.kakaobank.com', categorySlug: 'finans', seedUrls: ['https://www.kakaobank.com/events'] },
  { name: 'K Bank', websiteUrl: 'https://www.kbanknow.com', categorySlug: 'finans', seedUrls: ['https://www.kbanknow.com/event'] },
  { name: 'Kakao Pay', websiteUrl: 'https://www.kakaopay.com', categorySlug: 'finans', seedUrls: ['https://www.kakaopay.com/event'] },
  { name: 'Naver Pay', websiteUrl: 'https://pay.naver.com', categorySlug: 'finans', seedUrls: ['https://pay.naver.com/event'] },
  { name: 'Samsung Card', websiteUrl: 'https://www.samsungcard.com', categorySlug: 'finans', seedUrls: ['https://www.samsungcard.com/personal/event/ing/UHPPEV0101M0.jsp'] },
  { name: 'Shinhan Card', websiteUrl: 'https://www.shinhancard.com', categorySlug: 'finans', seedUrls: ['https://www.shinhancard.com/pconts/html/event/list/1200820_13764.html'] },
  { name: 'KB Card', websiteUrl: 'https://card.kbcard.com', categorySlug: 'finans', seedUrls: ['https://card.kbcard.com/BON/DVIEW/HBBMCXEVENT0101?mainCC=a'] },
  { name: 'Hyundai Card', websiteUrl: 'https://www.hyundaicard.com', categorySlug: 'finans', seedUrls: ['https://www.hyundaicard.com/cpc/cr/CPCCR0603_01.hc'] },
  { name: 'Lotte Card', websiteUrl: 'https://www.lottecard.co.kr', categorySlug: 'finans', seedUrls: ['https://www.lottecard.co.kr/app/LPEVMCL_V100.lc'] },
  { name: 'Woori Card', websiteUrl: 'https://pc.wooricard.com', categorySlug: 'finans', seedUrls: ['https://pc.wooricard.com/dcpc/yh4/bnf/evt/BNFEVT0100D0.do'] },
  { name: 'Hana Card', websiteUrl: 'https://www.hanacard.co.kr', categorySlug: 'finans', seedUrls: ['https://www.hanacard.co.kr/event'] },
  { name: 'BC Card', websiteUrl: 'https://www.bccard.com', categorySlug: 'finans', seedUrls: ['https://www.bccard.com/event'] },
  { name: 'NH Card', websiteUrl: 'https://card.nonghyup.com', categorySlug: 'finans', seedUrls: ['https://card.nonghyup.com/event'] },
  { name: 'Toss Securities', websiteUrl: 'https://tossinvest.com', categorySlug: 'finans', seedUrls: ['https://tossinvest.com/event'] },
  { name: 'Samsung Securities', websiteUrl: 'https://www.samsungpop.com', categorySlug: 'finans', seedUrls: ['https://www.samsungpop.com/common/event/eventList.do'] },
  { name: 'Mirae Asset Securities', websiteUrl: 'https://securities.miraeasset.com', categorySlug: 'finans', seedUrls: ['https://securities.miraeasset.com/event'] },
  { name: 'NH Securities', websiteUrl: 'https://www.nhqv.com', categorySlug: 'finans', seedUrls: ['https://www.nhqv.com/event'] },
  { name: 'KB Securities', websiteUrl: 'https://www.kbsec.com', categorySlug: 'finans', seedUrls: ['https://www.kbsec.com/event'] },
  { name: 'Kiwoom Securities', websiteUrl: 'https://www.kiwoom.com', categorySlug: 'finans', seedUrls: ['https://www.kiwoom.com/h/common/event/VEventListView'] },
  { name: 'PAYCO', websiteUrl: 'https://www.payco.com', categorySlug: 'finans', seedUrls: ['https://www.payco.com/event'] },
  { name: 'Chai', websiteUrl: 'https://chai.finance', categorySlug: 'finans', seedUrls: ['https://chai.finance/event'] },
  { name: 'ZeroPay', websiteUrl: 'https://www.zeropay.or.kr', categorySlug: 'finans', seedUrls: ['https://www.zeropay.or.kr/event'] },
  { name: 'Samsung Pay', websiteUrl: 'https://www.samsung.com/sec/samsung-pay', categorySlug: 'finans', seedUrls: ['https://www.samsung.com/sec/samsung-pay/event/'] },

  // ═══════════════════════════════════════════════════════
  // 11) Insurance (sigorta) — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Samsung Life', websiteUrl: 'https://www.samsunglife.com', categorySlug: 'sigorta', seedUrls: ['https://www.samsunglife.com/event'] },
  { name: 'Hanwha Life', websiteUrl: 'https://www.hanwhalife.com', categorySlug: 'sigorta', seedUrls: ['https://www.hanwhalife.com/main/event/eventMain.do'] },
  { name: 'Samsung Fire & Marine', websiteUrl: 'https://www.samsungfire.com', categorySlug: 'sigorta', seedUrls: ['https://www.samsungfire.com/event'] },
  { name: 'DB Insurance', websiteUrl: 'https://www.idbins.com', categorySlug: 'sigorta', seedUrls: ['https://www.idbins.com/event'] },
  { name: 'Hyundai Marine & Fire', websiteUrl: 'https://www.hi.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.hi.co.kr/event'] },
  { name: 'KB Insurance', websiteUrl: 'https://www.kbinsure.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.kbinsure.co.kr/event'] },
  { name: 'Meritz Fire', websiteUrl: 'https://www.meritzfire.com', categorySlug: 'sigorta', seedUrls: ['https://www.meritzfire.com/event'] },
  { name: 'NH Insurance', websiteUrl: 'https://www.nhfire.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.nhfire.co.kr/event'] },
  { name: 'Lotte Insurance', websiteUrl: 'https://www.lotteins.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.lotteins.co.kr/event'] },
  { name: 'Kyobo Life', websiteUrl: 'https://www.kyobo.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.kyobo.co.kr/event'] },
  { name: 'Mirae Asset Life', websiteUrl: 'https://life.miraeasset.com', categorySlug: 'sigorta', seedUrls: ['https://life.miraeasset.com/event'] },
  { name: 'Shinhan Life', websiteUrl: 'https://www.shinhanlife.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.shinhanlife.co.kr/event'] },
  { name: 'Heungkuk Life', websiteUrl: 'https://www.heungkuklife.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.heungkuklife.co.kr/event'] },
  { name: 'AIA Korea', websiteUrl: 'https://www.aia.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.aia.co.kr/ko/event.html'] },
  { name: 'MetLife Korea', websiteUrl: 'https://www.metlife.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.co.kr/event'] },
  { name: 'AXA Korea', websiteUrl: 'https://www.axa.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.axa.co.kr/event'] },
  { name: 'Chubb Korea', websiteUrl: 'https://www.aceinsurance.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.aceinsurance.co.kr/event'] },
  { name: 'ABL Life', websiteUrl: 'https://www.abllife.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.abllife.co.kr/event'] },
  { name: 'Hana Insurance', websiteUrl: 'https://www.hanainsure.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.hanainsure.co.kr/event'] },
  { name: 'Carrot Insurance', websiteUrl: 'https://www.carrotins.com', categorySlug: 'sigorta', seedUrls: ['https://www.carrotins.com/event'] },
  { name: 'Kakao Pay Insurance', websiteUrl: 'https://insurance.kakaopay.com', categorySlug: 'sigorta', seedUrls: ['https://insurance.kakaopay.com/event'] },
  { name: 'Toss Insurance', websiteUrl: 'https://www.tossinsurance.com', categorySlug: 'sigorta', seedUrls: ['https://www.tossinsurance.com/event'] },
  { name: 'KB Life', websiteUrl: 'https://www.kbli.co.kr', categorySlug: 'sigorta', seedUrls: ['https://www.kbli.co.kr/event'] },
  { name: 'Woori Card Insurance', websiteUrl: 'https://insurance.wooricard.com', categorySlug: 'sigorta', seedUrls: ['https://insurance.wooricard.com/event'] },
  { name: 'Samsung Fire Direct', websiteUrl: 'https://direct.samsungfire.com', categorySlug: 'sigorta', seedUrls: ['https://direct.samsungfire.com/event'] },

  // ═══════════════════════════════════════════════════════
  // 12) Automobile (otomobil) — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Hyundai Motor', websiteUrl: 'https://www.hyundai.com/kr', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com/kr/ko/event', 'https://www.hyundai.com/kr/ko/purchase-guide/purchase-benefit'] },
  { name: 'Kia', websiteUrl: 'https://www.kia.com/kr', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/kr/discover/event', 'https://www.kia.com/kr/buy/purchase-benefit'] },
  { name: 'Genesis', websiteUrl: 'https://www.genesis.com/kr', categorySlug: 'otomobil', seedUrls: ['https://www.genesis.com/kr/ko/event.html'] },
  { name: 'KG Mobility', websiteUrl: 'https://www.kg-mobility.com', categorySlug: 'otomobil', seedUrls: ['https://www.kg-mobility.com/event'] },
  { name: 'Renault Korea', websiteUrl: 'https://www.renaultkorea.com', categorySlug: 'otomobil', seedUrls: ['https://www.renaultkorea.com/event', 'https://www.renaultkorea.com/promotion'] },
  { name: 'BMW Korea', websiteUrl: 'https://www.bmw.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.co.kr/ko/topics/offers-and-services/promotions.html'] },
  { name: 'Mercedes-Benz Korea', websiteUrl: 'https://www.mercedes-benz.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.co.kr/passengercars/campaigns.html'] },
  { name: 'Audi Korea', websiteUrl: 'https://www.audi.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.audi.co.kr/kr/web/ko/campaigns.html'] },
  { name: 'Volkswagen Korea', websiteUrl: 'https://www.volkswagen.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.co.kr/ko/campaign.html'] },
  { name: 'Volvo Korea', websiteUrl: 'https://www.volvocars.com/kr', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/kr/offers/'] },
  { name: 'Tesla Korea', websiteUrl: 'https://www.tesla.com/ko_kr', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/ko_kr/model3', 'https://www.tesla.com/ko_kr/modely'] },
  { name: 'Toyota Korea', websiteUrl: 'https://www.toyota.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.co.kr/event'] },
  { name: 'Lexus Korea', websiteUrl: 'https://www.lexus.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.lexus.co.kr/event'] },
  { name: 'Honda Korea', websiteUrl: 'https://www.honda.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.honda.co.kr/event'] },
  { name: 'Porsche Korea', websiteUrl: 'https://www.porsche.com/korea', categorySlug: 'otomobil', seedUrls: ['https://www.porsche.com/korea/ko/'] },
  { name: 'Land Rover Korea', websiteUrl: 'https://www.landrover.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.landrover.co.kr/offers.html'] },
  { name: 'Jaguar Korea', websiteUrl: 'https://www.jaguar.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.jaguar.co.kr/offers.html'] },
  { name: 'MINI Korea', websiteUrl: 'https://www.mini.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.mini.co.kr/ko_KR/home/campaigns.html'] },
  { name: 'Peugeot Korea', websiteUrl: 'https://www.peugeot.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.co.kr/offers.html'] },
  { name: 'Chevrolet Korea', websiteUrl: 'https://www.chevrolet.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.co.kr/purchase/purchase_benefit.gm'] },
  { name: 'SK Encar', websiteUrl: 'https://www.encar.com', categorySlug: 'otomobil', seedUrls: ['https://www.encar.com/ev/ev_event.do'] },
  { name: 'KB Chacha', websiteUrl: 'https://www.kbchachacha.com', categorySlug: 'otomobil', seedUrls: ['https://www.kbchachacha.com/event'] },
  { name: 'Hyundai Capital', websiteUrl: 'https://www.hyundaicapital.com', categorySlug: 'otomobil', seedUrls: ['https://www.hyundaicapital.com/event'] },
  { name: 'Hankook Tire', websiteUrl: 'https://www.hankooktire.com/kr', categorySlug: 'otomobil', seedUrls: ['https://www.hankooktire.com/kr/event.html'] },
  { name: 'Kumho Tire', websiteUrl: 'https://www.kumhotire.co.kr', categorySlug: 'otomobil', seedUrls: ['https://www.kumhotire.co.kr/event'] },

  // ═══════════════════════════════════════════════════════
  // 13) Books & Hobby (kitap-hobi) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Yes24', websiteUrl: 'https://www.yes24.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.yes24.com/main/EventCenter', 'https://www.yes24.com/main/default.aspx'] },
  { name: 'Kyobo Book', websiteUrl: 'https://www.kyobobook.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.kyobobook.co.kr/event', 'https://www.kyobobook.co.kr/eventPromotion'] },
  { name: 'Aladin', websiteUrl: 'https://www.aladin.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.aladin.co.kr/events/wevent_list.aspx'] },
  { name: 'Interpark Books', websiteUrl: 'https://book.interpark.com', categorySlug: 'kitap-hobi', seedUrls: ['https://book.interpark.com/event/'] },
  { name: 'Millie\'s Library', websiteUrl: 'https://www.millie.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.millie.co.kr/event'] },
  { name: 'Ridi', websiteUrl: 'https://ridibooks.com', categorySlug: 'kitap-hobi', seedUrls: ['https://ridibooks.com/event'] },
  { name: 'Naver Webtoon', websiteUrl: 'https://comic.naver.com', categorySlug: 'kitap-hobi', seedUrls: ['https://comic.naver.com/event'] },
  { name: 'Kakao Page', websiteUrl: 'https://page.kakao.com', categorySlug: 'kitap-hobi', seedUrls: ['https://page.kakao.com/event'] },
  { name: 'Netflix Korea', websiteUrl: 'https://www.netflix.com/kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/kr/'] },
  { name: 'Watcha', websiteUrl: 'https://watcha.com', categorySlug: 'kitap-hobi', seedUrls: ['https://watcha.com/event'] },
  { name: 'Wavve', websiteUrl: 'https://www.wavve.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.wavve.com/event'] },
  { name: 'Tving', websiteUrl: 'https://www.tving.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.tving.com/event'] },
  { name: 'Disney+ Korea', websiteUrl: 'https://www.disneyplus.com/ko-kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/ko-kr'] },
  { name: 'Coupang Play', websiteUrl: 'https://www.coupangplay.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coupangplay.com/event'] },
  { name: 'Melon', websiteUrl: 'https://www.melon.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.melon.com/event/index.htm'] },
  { name: 'Genie Music', websiteUrl: 'https://www.genie.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.genie.co.kr/event'] },
  { name: 'FLO', websiteUrl: 'https://www.music-flo.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.music-flo.com/event'] },
  { name: 'Bugs Music', websiteUrl: 'https://music.bugs.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://music.bugs.co.kr/event'] },
  { name: 'CGV', websiteUrl: 'https://www.cgv.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cgv.co.kr/culture-event/event/'] },
  { name: 'Lotte Cinema', websiteUrl: 'https://www.lottecinema.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lottecinema.co.kr/NLCHS/Event'] },
  { name: 'Megabox', websiteUrl: 'https://www.megabox.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.megabox.co.kr/event'] },
  { name: 'Lego Korea', websiteUrl: 'https://www.lego.com/ko-kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/ko-kr/offers-and-promotions'] },
  { name: 'Aladdin Second Hand', websiteUrl: 'https://www.aladin.co.kr/usedstore', categorySlug: 'kitap-hobi', seedUrls: ['https://www.aladin.co.kr/usedstore/wgate.aspx'] },
  { name: 'Interpark Ticket', websiteUrl: 'https://ticket.interpark.com', categorySlug: 'kitap-hobi', seedUrls: ['https://ticket.interpark.com/event/'] },
  { name: 'Yes24 Ticket', websiteUrl: 'https://ticket.yes24.com', categorySlug: 'kitap-hobi', seedUrls: ['https://ticket.yes24.com/New/Event/List.aspx'] },
  { name: 'Daehaknaeil', websiteUrl: 'https://www.naeil.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.naeil.com/event'] },
  { name: 'Class101', websiteUrl: 'https://class101.net', categorySlug: 'kitap-hobi', seedUrls: ['https://class101.net/events'] },
  { name: 'Taling', websiteUrl: 'https://taling.me', categorySlug: 'kitap-hobi', seedUrls: ['https://taling.me/event'] },
  { name: 'Artbox', websiteUrl: 'https://www.artbox.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.artbox.co.kr/event'] },
  { name: 'Hottracks', websiteUrl: 'https://www.hottracks.co.kr', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hottracks.co.kr/event'] },
];

// ── Deduplication ───────────────────────────────────────
function deduplicateBrands(brands: BrandEntry[]): BrandEntry[] {
  const seen = new Map<string, BrandEntry>();
  for (const b of brands) {
    const slug = toSlug(b.name);
    if (!seen.has(slug)) seen.set(slug, b);
  }
  return Array.from(seen.values());
}

// ── Main seeding function ───────────────────────────────
async function main() {
  console.log('=== KR Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'KR' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'KR', categoryId: category.id },
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
            schedule: '0 9 * * *',
            agingDays: 7,
            market: 'KR',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'KR' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'KR', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active KR sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
