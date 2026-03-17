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
  { name: 'Worten', websiteUrl: 'https://www.worten.pt', categorySlug: 'alisveris', seedUrls: ['https://www.worten.pt/promocoes', 'https://www.worten.pt/saldos'] },
  { name: 'FNAC Portugal', websiteUrl: 'https://www.fnac.pt', categorySlug: 'alisveris', seedUrls: ['https://www.fnac.pt/promocoes', 'https://www.fnac.pt/saldos'] },
  { name: 'KuantoKusta', websiteUrl: 'https://www.kuantokusta.pt', categorySlug: 'alisveris', seedUrls: ['https://www.kuantokusta.pt/promocoes'] },
  { name: 'OLX Portugal', websiteUrl: 'https://www.olx.pt', categorySlug: 'alisveris', seedUrls: ['https://www.olx.pt/promocoes'] },
  { name: 'Amazon PT', websiteUrl: 'https://www.amazon.es', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.es/deals', 'https://www.amazon.es/gp/goldbox'] },
  { name: 'AliExpress PT', websiteUrl: 'https://pt.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://pt.aliexpress.com/wholesale', 'https://sale.aliexpress.com/__pc/sale.htm'] },
  { name: 'PCDiga', websiteUrl: 'https://www.pcdiga.com', categorySlug: 'alisveris', seedUrls: ['https://www.pcdiga.com/promocoes', 'https://www.pcdiga.com/saldos'] },
  { name: 'Radio Popular', websiteUrl: 'https://www.radiopopular.pt', categorySlug: 'alisveris', seedUrls: ['https://www.radiopopular.pt/promocoes', 'https://www.radiopopular.pt/saldos'] },
  { name: 'El Corte Inglés PT', websiteUrl: 'https://www.elcorteingles.pt', categorySlug: 'alisveris', seedUrls: ['https://www.elcorteingles.pt/promocoes/', 'https://www.elcorteingles.pt/saldos/'] },
  { name: 'MediaMarkt PT', websiteUrl: 'https://www.mediamarkt.pt', categorySlug: 'alisveris', seedUrls: ['https://www.mediamarkt.pt/pt/category/ofertas.html'] },
  { name: 'Continente', websiteUrl: 'https://www.continente.pt', categorySlug: 'alisveris', seedUrls: ['https://www.continente.pt/promocoes/', 'https://www.continente.pt/campanhas/'] },
  { name: 'Pingo Doce', websiteUrl: 'https://www.pingodoce.pt', categorySlug: 'alisveris', seedUrls: ['https://www.pingodoce.pt/folhetos-702/promocoes/', 'https://www.pingodoce.pt/campanhas/'] },
  { name: 'Auchan PT', websiteUrl: 'https://www.auchan.pt', categorySlug: 'alisveris', seedUrls: ['https://www.auchan.pt/promocoes', 'https://www.auchan.pt/campanhas'] },
  { name: 'Leroy Merlin PT', websiteUrl: 'https://www.leroymerlin.pt', categorySlug: 'alisveris', seedUrls: ['https://www.leroymerlin.pt/promocoes', 'https://www.leroymerlin.pt/saldos'] },
  { name: 'Staples PT', websiteUrl: 'https://www.staples.pt', categorySlug: 'alisveris', seedUrls: ['https://www.staples.pt/promocoes'] },
  { name: 'Conforama PT', websiteUrl: 'https://www.conforama.pt', categorySlug: 'alisveris', seedUrls: ['https://www.conforama.pt/promocoes', 'https://www.conforama.pt/saldos'] },
  { name: 'IKEA PT', websiteUrl: 'https://www.ikea.com/pt', categorySlug: 'alisveris', seedUrls: ['https://www.ikea.com/pt/pt/offers/', 'https://www.ikea.com/pt/pt/campaigns/'] },
  { name: 'Prozis', websiteUrl: 'https://www.prozis.com/pt', categorySlug: 'alisveris', seedUrls: ['https://www.prozis.com/pt/pt/promocoes', 'https://www.prozis.com/pt/pt/descontos'] },
  { name: 'Decathlon PT', websiteUrl: 'https://www.decathlon.pt', categorySlug: 'alisveris', seedUrls: ['https://www.decathlon.pt/browse/c0-todas-as-promocoes/_/N-ynko2u'] },
  { name: 'Primark PT', websiteUrl: 'https://www.primark.com/pt-pt', categorySlug: 'alisveris', seedUrls: ['https://www.primark.com/pt-pt/ofertas'] },
  { name: 'MaisFarmácia', websiteUrl: 'https://www.maisfarmacia.com', categorySlug: 'alisveris', seedUrls: ['https://www.maisfarmacia.com/promocoes'] },
  { name: 'CashConverters PT', websiteUrl: 'https://www.cashconverters.pt', categorySlug: 'alisveris', seedUrls: ['https://www.cashconverters.pt/promocoes'] },
  { name: 'Mbit', websiteUrl: 'https://www.mbit.pt', categorySlug: 'alisveris', seedUrls: ['https://www.mbit.pt/promocoes'] },
  { name: 'Chip7', websiteUrl: 'https://www.chip7.pt', categorySlug: 'alisveris', seedUrls: ['https://www.chip7.pt/promocoes', 'https://www.chip7.pt/saldos'] },
  { name: 'Fnac Kids', websiteUrl: 'https://www.fnac.pt', categorySlug: 'alisveris', seedUrls: ['https://www.fnac.pt/brinquedos/promocoes'] },
  { name: 'Wook', websiteUrl: 'https://www.wook.pt', categorySlug: 'alisveris', seedUrls: ['https://www.wook.pt/promocoes'] },
  { name: 'Regalos.pt', websiteUrl: 'https://www.regalos.pt', categorySlug: 'alisveris', seedUrls: ['https://www.regalos.pt/promocoes'] },
  { name: 'Dott', websiteUrl: 'https://www.dfrancq.pt', categorySlug: 'alisveris', seedUrls: ['https://www.dfrancq.pt/promocoes'] },
  { name: 'CustoJusto', websiteUrl: 'https://www.custojusto.pt', categorySlug: 'alisveris', seedUrls: ['https://www.custojusto.pt/'] },
  { name: 'Amazon ES/PT', websiteUrl: 'https://www.amazon.es', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.es/gp/goldbox'] },
  { name: 'Lidl PT', websiteUrl: 'https://www.lidl.pt', categorySlug: 'alisveris', seedUrls: ['https://www.lidl.pt/pt/ofertas', 'https://www.lidl.pt/pt/promocoes'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Worten Tech', websiteUrl: 'https://www.worten.pt', categorySlug: 'elektronik', seedUrls: ['https://www.worten.pt/tecnologia/promocoes'] },
  { name: 'Samsung PT', websiteUrl: 'https://www.samsung.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/pt/offer/', 'https://www.samsung.com/pt/smartphones/all-smartphones/'] },
  { name: 'Apple PT', websiteUrl: 'https://www.apple.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/pt/shop/go/special_deals'] },
  { name: 'MEO', websiteUrl: 'https://www.meo.pt', categorySlug: 'elektronik', seedUrls: ['https://www.meo.pt/promocoes', 'https://www.meo.pt/loja/promocoes'] },
  { name: 'NOS', websiteUrl: 'https://www.nos.pt', categorySlug: 'elektronik', seedUrls: ['https://www.nos.pt/particulares/promocoes', 'https://www.nos.pt/particulares/campanhas'] },
  { name: 'Vodafone Portugal', websiteUrl: 'https://www.vodafone.pt', categorySlug: 'elektronik', seedUrls: ['https://www.vodafone.pt/loja/promocoes.html', 'https://www.vodafone.pt/loja/campanhas.html'] },
  { name: 'NOWO', websiteUrl: 'https://www.nowo.pt', categorySlug: 'elektronik', seedUrls: ['https://www.nowo.pt/promocoes'] },
  { name: 'LG PT', websiteUrl: 'https://www.lg.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/pt/promocoes'] },
  { name: 'Sony PT', websiteUrl: 'https://www.sony.pt', categorySlug: 'elektronik', seedUrls: ['https://www.sony.pt/promotions'] },
  { name: 'Huawei PT', websiteUrl: 'https://consumer.huawei.com/pt', categorySlug: 'elektronik', seedUrls: ['https://consumer.huawei.com/pt/offer/'] },
  { name: 'HP PT', websiteUrl: 'https://www.hp.com/pt-pt', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/pt-pt/shop/ofertas'] },
  { name: 'Lenovo PT', websiteUrl: 'https://www.lenovo.com/pt/pt', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/pt/pt/d/deals/'] },
  { name: 'Dell PT', websiteUrl: 'https://www.dell.com/pt-pt', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/pt-pt/shop/deals'] },
  { name: 'Asus PT', websiteUrl: 'https://www.asus.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/pt/campaign/'] },
  { name: 'Xiaomi PT', websiteUrl: 'https://www.mi.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/pt/sale'] },
  { name: 'Philips PT', websiteUrl: 'https://www.philips.pt', categorySlug: 'elektronik', seedUrls: ['https://www.philips.pt/c-e/ofertas'] },
  { name: 'Canon PT', websiteUrl: 'https://www.canon.pt', categorySlug: 'elektronik', seedUrls: ['https://www.canon.pt/promotions'] },
  { name: 'Epson PT', websiteUrl: 'https://www.epson.pt', categorySlug: 'elektronik', seedUrls: ['https://www.epson.pt/promotions'] },
  { name: 'Logitech PT', websiteUrl: 'https://www.logitech.com/pt-pt', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/pt-pt/promo.html'] },
  { name: 'JBL PT', websiteUrl: 'https://pt.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://pt.jbl.com/ofertas'] },
  { name: 'Hisense PT', websiteUrl: 'https://hisense-pt.com', categorySlug: 'elektronik', seedUrls: ['https://hisense-pt.com/promotions'] },
  { name: 'TCL PT', websiteUrl: 'https://www.tcl.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.tcl.com/pt/pt/promotions'] },
  { name: 'Bose PT', websiteUrl: 'https://www.bose.pt', categorySlug: 'elektronik', seedUrls: ['https://www.bose.pt/offers'] },
  { name: 'GoPro PT', websiteUrl: 'https://gopro.com/pt/pt', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/pt/pt/deals'] },
  { name: 'Motorola PT', websiteUrl: 'https://www.motorola.pt', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.pt/ofertas'] },
  { name: 'OnePlus PT', websiteUrl: 'https://www.oneplus.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.oneplus.com/pt/sale'] },
  { name: 'Oppo PT', websiteUrl: 'https://www.oppo.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/pt/offer/'] },
  { name: 'Realme PT', websiteUrl: 'https://www.realme.com/pt', categorySlug: 'elektronik', seedUrls: ['https://www.realme.com/pt/sale'] },
  { name: 'Nikon PT', websiteUrl: 'https://www.nikon.pt', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.pt/promotions'] },
  { name: 'Dyson PT', websiteUrl: 'https://www.dyson.pt', categorySlug: 'elektronik', seedUrls: ['https://www.dyson.pt/ofertas'] },
  { name: 'Brother PT', websiteUrl: 'https://www.brother.pt', categorySlug: 'elektronik', seedUrls: ['https://www.brother.pt/promocoes'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Salsa Jeans', websiteUrl: 'https://www.salsajeans.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.salsajeans.com/pt/saldos', 'https://www.salsajeans.com/pt/promocoes'] },
  { name: 'Lanidor', websiteUrl: 'https://www.lanidor.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.lanidor.com/saldos', 'https://www.lanidor.com/promocoes'] },
  { name: 'Sacoor Brothers', websiteUrl: 'https://www.sacoorbrothers.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.sacoorbrothers.com/pt/sale'] },
  { name: 'Zara PT', websiteUrl: 'https://www.zara.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/pt/pt/saldos-l1702.html'] },
  { name: 'Bershka PT', websiteUrl: 'https://www.bershka.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.bershka.com/pt/saldos-c0p1.html'] },
  { name: 'Pull & Bear PT', websiteUrl: 'https://www.pullandbear.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.pullandbear.com/pt/saldos-n6417.html'] },
  { name: 'Massimo Dutti PT', websiteUrl: 'https://www.massimodutti.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.massimodutti.com/pt/saldos-c0p1.html'] },
  { name: 'Stradivarius PT', websiteUrl: 'https://www.stradivarius.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.stradivarius.com/pt/saldos-c0p1.html'] },
  { name: 'H&M PT', websiteUrl: 'https://www2.hm.com/pt_pt', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/pt_pt/saldos.html'] },
  { name: 'Mango PT', websiteUrl: 'https://shop.mango.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://shop.mango.com/pt/saldos'] },
  { name: 'Nike PT', websiteUrl: 'https://www.nike.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com/pt/sale'] },
  { name: 'Adidas PT', websiteUrl: 'https://www.adidas.pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.pt/saldos', 'https://www.adidas.pt/outlet'] },
  { name: 'Levi\'s PT', websiteUrl: 'https://www.levi.com/PT', categorySlug: 'giyim-moda', seedUrls: ['https://www.levi.com/PT/sale'] },
  { name: 'Springfield PT', websiteUrl: 'https://www.spf.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.spf.com/pt/saldos'] },
  { name: 'Tiffosi', websiteUrl: 'https://www.tiffosi.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.tiffosi.com/saldos', 'https://www.tiffosi.com/promocoes'] },
  { name: 'Throttleman', websiteUrl: 'https://www.throttleman.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.throttleman.com/saldos'] },
  { name: 'Quebramar', websiteUrl: 'https://www.quebramar.pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.quebramar.pt/saldos'] },
  { name: 'Decenio', websiteUrl: 'https://www.decenio.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.decenio.com/saldos'] },
  { name: 'Lion of Porches', websiteUrl: 'https://www.lionofporches.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.lionofporches.com/saldos'] },
  { name: 'Parfois', websiteUrl: 'https://www.parfois.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.parfois.com/pt/saldos', 'https://www.parfois.com/pt/promocoes'] },
  { name: 'Modalfa', websiteUrl: 'https://www.modalfa.pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.modalfa.pt/saldos'] },
  { name: 'C&A PT', websiteUrl: 'https://www.c-and-a.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.c-and-a.com/pt/pt/loja/saldos'] },
  { name: 'Guess PT', websiteUrl: 'https://www.guess.eu/pt-pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.guess.eu/pt-pt/saldos'] },
  { name: 'Tommy Hilfiger PT', websiteUrl: 'https://pt.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://pt.tommy.com/saldos'] },
  { name: 'Calvin Klein PT', websiteUrl: 'https://www.calvinklein.pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.pt/saldos'] },
  { name: 'Lacoste PT', websiteUrl: 'https://www.lacoste.com/pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com/pt/saldos.html'] },
  { name: 'Skechers PT', websiteUrl: 'https://www.skechers.pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.skechers.pt/saldos'] },
  { name: 'Geox PT', websiteUrl: 'https://www.geox.com/pt-PT', categorySlug: 'giyim-moda', seedUrls: ['https://www.geox.com/pt-PT/saldos/'] },
  { name: 'Timberland PT', websiteUrl: 'https://www.timberland.pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.timberland.pt/saldos'] },
  { name: 'New Balance PT', websiteUrl: 'https://www.newbalance.pt', categorySlug: 'giyim-moda', seedUrls: ['https://www.newbalance.pt/saldos'] },
  { name: 'Puma PT', websiteUrl: 'https://pt.puma.com', categorySlug: 'giyim-moda', seedUrls: ['https://pt.puma.com/saldos'] },

  // ═══════════════════════════════════════════════════════
  // 4) Gıda & Market / Food & Grocery (gida-market) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Continente Food', websiteUrl: 'https://www.continente.pt', categorySlug: 'gida-market', seedUrls: ['https://www.continente.pt/promocoes/', 'https://www.continente.pt/campanhas/'] },
  { name: 'Pingo Doce Food', websiteUrl: 'https://www.pingodoce.pt', categorySlug: 'gida-market', seedUrls: ['https://www.pingodoce.pt/folhetos-702/promocoes/'] },
  { name: 'Lidl Portugal', websiteUrl: 'https://www.lidl.pt', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.pt/pt/ofertas'] },
  { name: 'Auchan Food', websiteUrl: 'https://www.auchan.pt', categorySlug: 'gida-market', seedUrls: ['https://www.auchan.pt/promocoes'] },
  { name: 'Minipreço', websiteUrl: 'https://www.minipreco.pt', categorySlug: 'gida-market', seedUrls: ['https://www.minipreco.pt/promocoes', 'https://www.minipreco.pt/folhetos'] },
  { name: 'Intermarché PT', websiteUrl: 'https://www.intermarche.pt', categorySlug: 'gida-market', seedUrls: ['https://www.intermarche.pt/promocoes', 'https://www.intermarche.pt/folhetos'] },
  { name: 'Mercadona PT', websiteUrl: 'https://www.mercadona.pt', categorySlug: 'gida-market', seedUrls: ['https://www.mercadona.pt/pt/promocoes'] },
  { name: 'Coviran PT', websiteUrl: 'https://www.coviran.pt', categorySlug: 'gida-market', seedUrls: ['https://www.coviran.pt/promocoes'] },
  { name: 'Apolónia', websiteUrl: 'https://www.apolonia.com', categorySlug: 'gida-market', seedUrls: ['https://www.apolonia.com/promocoes'] },
  { name: 'Froiz PT', websiteUrl: 'https://www.froiz.com/pt', categorySlug: 'gida-market', seedUrls: ['https://www.froiz.com/pt/promocoes'] },
  { name: 'E.Leclerc PT', websiteUrl: 'https://www.e-leclerc.pt', categorySlug: 'gida-market', seedUrls: ['https://www.e-leclerc.pt/promocoes'] },
  { name: 'Garrafeira Nacional', websiteUrl: 'https://www.garrafeiranacional.com', categorySlug: 'gida-market', seedUrls: ['https://www.garrafeiranacional.com/promocoes'] },
  { name: 'Garrafeira Soares', websiteUrl: 'https://www.garrafeirasoares.pt', categorySlug: 'gida-market', seedUrls: ['https://www.garrafeirasoares.pt/promocoes'] },
  { name: 'El Corte Inglés Food', websiteUrl: 'https://www.elcorteingles.pt', categorySlug: 'gida-market', seedUrls: ['https://www.elcorteingles.pt/supermercado/promocoes/'] },
  { name: 'Celeiro', websiteUrl: 'https://www.celeiro.pt', categorySlug: 'gida-market', seedUrls: ['https://www.celeiro.pt/promocoes'] },
  { name: 'Go Natural', websiteUrl: 'https://www.gonatural.pt', categorySlug: 'gida-market', seedUrls: ['https://www.gonatural.pt/promocoes'] },
  { name: 'Nespresso PT', websiteUrl: 'https://www.nespresso.com/pt', categorySlug: 'gida-market', seedUrls: ['https://www.nespresso.com/pt/pt/ofertas'] },
  { name: 'Delta Cafés', websiteUrl: 'https://www.deltacafes.pt', categorySlug: 'gida-market', seedUrls: ['https://www.deltacafes.pt/promocoes'] },
  { name: 'Wine.pt', websiteUrl: 'https://www.wine.pt', categorySlug: 'gida-market', seedUrls: ['https://www.wine.pt/promocoes'] },
  { name: 'Vivino PT', websiteUrl: 'https://www.vivino.com/explore?country_code=PT', categorySlug: 'gida-market', seedUrls: ['https://www.vivino.com/explore?country_code=PT'] },
  { name: 'MaisFarmácia Food', websiteUrl: 'https://www.maisfarmacia.com', categorySlug: 'gida-market', seedUrls: ['https://www.maisfarmacia.com/alimentacao/promocoes'] },
  { name: 'Bimbo PT', websiteUrl: 'https://www.bimbo.pt', categorySlug: 'gida-market', seedUrls: ['https://www.bimbo.pt/promocoes'] },
  { name: 'Nestlé PT', websiteUrl: 'https://www.nestle.pt', categorySlug: 'gida-market', seedUrls: ['https://www.nestle.pt/ofertas'] },
  { name: 'Danone PT', websiteUrl: 'https://www.danone.pt', categorySlug: 'gida-market', seedUrls: ['https://www.danone.pt/ofertas'] },
  { name: 'Compal', websiteUrl: 'https://www.compal.pt', categorySlug: 'gida-market', seedUrls: ['https://www.compal.pt/promocoes'] },
  { name: 'Sumol', websiteUrl: 'https://www.sumol.pt', categorySlug: 'gida-market', seedUrls: ['https://www.sumol.pt/promocoes'] },
  { name: 'Sagres', websiteUrl: 'https://www.sagres.pt', categorySlug: 'gida-market', seedUrls: ['https://www.sagres.pt/promocoes'] },
  { name: 'Super Bock', websiteUrl: 'https://www.superbock.pt', categorySlug: 'gida-market', seedUrls: ['https://www.superbock.pt/promocoes'] },
  { name: 'HelloFresh PT', websiteUrl: 'https://www.hellofresh.pt', categorySlug: 'gida-market', seedUrls: ['https://www.hellofresh.pt/ofertas'] },
  { name: 'Prozis Food', websiteUrl: 'https://www.prozis.com/pt', categorySlug: 'gida-market', seedUrls: ['https://www.prozis.com/pt/pt/alimentacao/promocoes'] },
  { name: 'MyProtein PT', websiteUrl: 'https://www.myprotein.pt', categorySlug: 'gida-market', seedUrls: ['https://www.myprotein.pt/ofertas.list'] },

  // ═══════════════════════════════════════════════════════
  // 5) Yeme & İçme / Food & Dining (yeme-icme) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Uber Eats PT', websiteUrl: 'https://www.ubereats.com/pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/pt/deals'] },
  { name: 'Glovo PT', websiteUrl: 'https://glovoapp.com/pt', categorySlug: 'yeme-icme', seedUrls: ['https://glovoapp.com/pt/lis/ofertas/'] },
  { name: 'Bolt Food PT', websiteUrl: 'https://food.bolt.eu/pt-pt', categorySlug: 'yeme-icme', seedUrls: ['https://food.bolt.eu/pt-pt/ofertas'] },
  { name: 'McDonald\'s PT', websiteUrl: 'https://www.mcdonalds.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.pt/promocoes', 'https://www.mcdonalds.pt/ofertas'] },
  { name: 'Telepizza', websiteUrl: 'https://www.telepizza.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.telepizza.pt/promocoes', 'https://www.telepizza.pt/ofertas'] },
  { name: 'Pizza Hut PT', websiteUrl: 'https://www.pizzahut.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.pt/promocoes'] },
  { name: 'Domino\'s PT', websiteUrl: 'https://www.dominos.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.pt/promocoes'] },
  { name: 'Burger King PT', websiteUrl: 'https://www.burgerking.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.pt/promocoes'] },
  { name: 'KFC PT', websiteUrl: 'https://www.kfc.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.pt/promocoes'] },
  { name: 'Starbucks PT', websiteUrl: 'https://www.starbucks.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.pt/ofertas'] },
  { name: 'Nando\'s PT', websiteUrl: 'https://www.nandos.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.nandos.pt/promocoes'] },
  { name: 'Pans & Company', websiteUrl: 'https://www.pansandcompany.com/pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.pansandcompany.com/pt/promocoes'] },
  { name: 'Taco Bell PT', websiteUrl: 'https://www.tacobell.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.tacobell.pt/promocoes'] },
  { name: 'Subway PT', websiteUrl: 'https://www.subway.com/pt-PT', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/pt-PT/menunutrition/menu/deals'] },
  { name: 'Pingo Doce Meal', websiteUrl: 'https://www.pingodoce.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.pingodoce.pt/takeaway/promocoes/'] },
  { name: 'Time Out Market', websiteUrl: 'https://www.timeoutmarket.com/lisboa', categorySlug: 'yeme-icme', seedUrls: ['https://www.timeoutmarket.com/lisboa/ofertas'] },
  { name: 'Cervejaria Ramiro', websiteUrl: 'https://www.cervejariaramiro.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.cervejariaramiro.pt/'] },
  { name: 'O Velho Eurico', websiteUrl: 'https://www.ovelhoeurico.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.ovelhoeurico.pt/'] },
  { name: 'Vitaminas', websiteUrl: 'https://www.vitaminas.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.vitaminas.pt/promocoes'] },
  { name: 'Padaria Portuguesa', websiteUrl: 'https://www.apadariaportuguesa.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.apadariaportuguesa.pt/promocoes'] },
  { name: 'Jerónimo', websiteUrl: 'https://www.jeronimo.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.jeronimo.pt/promocoes'] },
  { name: 'Grupo Pestana Food', websiteUrl: 'https://www.pestana.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.pestana.com/pt/ofertas'] },
  { name: 'Fábrica Coffee Roasters', websiteUrl: 'https://www.fabricacoffeeroasters.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.fabricacoffeeroasters.com/'] },
  { name: 'Honest Greens PT', websiteUrl: 'https://www.honestgreens.com/pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.honestgreens.com/pt/promocoes'] },
  { name: 'Wok to Walk PT', websiteUrl: 'https://www.woktowalk.com/pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.woktowalk.com/pt/ofertas'] },
  { name: 'La Boulangerie', websiteUrl: 'https://www.laboulangerie.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.laboulangerie.pt/promocoes'] },
  { name: 'Five Guys PT', websiteUrl: 'https://www.fiveguys.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.fiveguys.pt/'] },
  { name: 'Toscana Grill', websiteUrl: 'https://www.toscanagrill.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.toscanagrill.pt/promocoes'] },
  { name: 'Noori Sushi', websiteUrl: 'https://www.noorisushi.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.noorisushi.pt/promocoes'] },
  { name: 'Costa Coffee PT', websiteUrl: 'https://www.costa-coffee.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.costa-coffee.pt/ofertas'] },
  { name: 'Sushi Lovers', websiteUrl: 'https://www.sushilovers.pt', categorySlug: 'yeme-icme', seedUrls: ['https://www.sushilovers.pt/promocoes'] },

  // ═══════════════════════════════════════════════════════
  // 6) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Wells', websiteUrl: 'https://www.wells.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.wells.pt/promocoes', 'https://www.wells.pt/saldos'] },
  { name: 'Perfumes & Companhia', websiteUrl: 'https://www.perfumesecompanhia.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.perfumesecompanhia.pt/promocoes', 'https://www.perfumesecompanhia.pt/saldos'] },
  { name: 'Sephora PT', websiteUrl: 'https://www.sephora.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.pt/saldos'] },
  { name: 'Douglas PT', websiteUrl: 'https://www.douglas.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.douglas.pt/saldos', 'https://www.douglas.pt/promocoes'] },
  { name: 'MAC PT', websiteUrl: 'https://www.maccosmetics.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.pt/ofertas'] },
  { name: 'Estée Lauder PT', websiteUrl: 'https://www.esteelauder.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.pt/ofertas'] },
  { name: 'Clinique PT', websiteUrl: 'https://www.clinique.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.pt/ofertas'] },
  { name: 'The Body Shop PT', websiteUrl: 'https://www.thebodyshop.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.pt/saldos', 'https://www.thebodyshop.pt/ofertas'] },
  { name: 'Lush PT', websiteUrl: 'https://www.lush.com/pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/pt/saldos'] },
  { name: 'Kiehl\'s PT', websiteUrl: 'https://www.kiehls.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kiehls.pt/ofertas'] },
  { name: 'L\'Occitane PT', websiteUrl: 'https://pt.loccitane.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://pt.loccitane.com/saldos'] },
  { name: 'Clarins PT', websiteUrl: 'https://www.clarins.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clarins.pt/ofertas/'] },
  { name: 'Charlotte Tilbury PT', websiteUrl: 'https://www.charlottetilbury.com/pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.charlottetilbury.com/pt/saldos'] },
  { name: 'Rituals PT', websiteUrl: 'https://www.rituals.com/pt-pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rituals.com/pt-pt/sale'] },
  { name: 'Nivea PT', websiteUrl: 'https://www.nivea.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.pt/ofertas'] },
  { name: 'Garnier PT', websiteUrl: 'https://www.garnier.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.garnier.pt/ofertas'] },
  { name: 'L\'Oréal PT', websiteUrl: 'https://www.loreal-paris.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.pt/ofertas'] },
  { name: 'Vichy PT', websiteUrl: 'https://www.vichy.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.pt/ofertas'] },
  { name: 'La Roche-Posay PT', websiteUrl: 'https://www.laroche-posay.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.pt/ofertas'] },
  { name: 'Bioderma PT', websiteUrl: 'https://www.bioderma.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.pt/ofertas'] },
  { name: 'Avène PT', websiteUrl: 'https://www.eau-thermale-avene.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eau-thermale-avene.pt/ofertas'] },
  { name: 'Clarel', websiteUrl: 'https://www.clarel.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clarel.pt/promocoes'] },
  { name: 'Notino PT', websiteUrl: 'https://www.notino.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.notino.pt/saldos/', 'https://www.notino.pt/promocoes/'] },
  { name: 'Primor PT', websiteUrl: 'https://www.primor.eu/pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.primor.eu/pt/ofertas'] },
  { name: 'NYX PT', websiteUrl: 'https://www.nyxcosmetics.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nyxcosmetics.pt/saldos'] },
  { name: 'Maybelline PT', websiteUrl: 'https://www.maybelline.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maybelline.pt/ofertas'] },
  { name: 'Avon PT', websiteUrl: 'https://www.avon.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avon.pt/promocoes'] },
  { name: 'Oriflame PT', websiteUrl: 'https://www.oriflame.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.oriflame.pt/ofertas'] },
  { name: 'Holland & Barrett PT', websiteUrl: 'https://www.hollandandbarrett.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.hollandandbarrett.pt/promocoes'] },
  { name: 'Dove PT', websiteUrl: 'https://www.dove.com/pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/pt/ofertas.html'] },
  { name: 'Yves Rocher PT', websiteUrl: 'https://www.yves-rocher.pt', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yves-rocher.pt/saldos'] },

  // ═══════════════════════════════════════════════════════
  // 7) Ev & Yaşam / Home & Living (ev-yasam) — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'IKEA Portugal', websiteUrl: 'https://www.ikea.com/pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/pt/pt/offers/', 'https://www.ikea.com/pt/pt/campaigns/'] },
  { name: 'Leroy Merlin Home', websiteUrl: 'https://www.leroymerlin.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.leroymerlin.pt/promocoes'] },
  { name: 'AKI', websiteUrl: 'https://www.aki.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.aki.pt/promocoes', 'https://www.aki.pt/saldos'] },
  { name: 'Conforama Home', websiteUrl: 'https://www.conforama.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.conforama.pt/promocoes', 'https://www.conforama.pt/saldos'] },
  { name: 'Moviflor', websiteUrl: 'https://www.moviflor.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.moviflor.pt/promocoes', 'https://www.moviflor.pt/saldos'] },
  { name: 'Area', websiteUrl: 'https://www.area.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.area.pt/saldos'] },
  { name: 'Zara Home PT', websiteUrl: 'https://www.zarahome.com/pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.zarahome.com/pt/saldos-l1555.html'] },
  { name: 'Maisons du Monde PT', websiteUrl: 'https://www.maisonsdumonde.com/PT', categorySlug: 'ev-yasam', seedUrls: ['https://www.maisonsdumonde.com/PT/pt/saldos'] },
  { name: 'La Redoute PT', websiteUrl: 'https://www.laredoute.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.laredoute.pt/saldos.aspx'] },
  { name: 'JYSK PT', websiteUrl: 'https://www.jysk.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.jysk.pt/promocoes', 'https://www.jysk.pt/saldos'] },
  { name: 'Kika PT', websiteUrl: 'https://www.kfrancq.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.kfrancq.pt/promocoes'] },
  { name: 'Homeart', websiteUrl: 'https://www.homeart.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.homeart.pt/promocoes'] },
  { name: 'Maxmat', websiteUrl: 'https://www.maxmat.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.maxmat.pt/promocoes'] },
  { name: 'Casa PT', websiteUrl: 'https://www.casashops.com/pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.casashops.com/pt/saldos'] },
  { name: 'Flying Tiger PT', websiteUrl: 'https://flyingtiger.com/pt-PT', categorySlug: 'ev-yasam', seedUrls: ['https://flyingtiger.com/pt-PT/ofertas'] },
  { name: 'Gato Preto', websiteUrl: 'https://www.gatopreto.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.gatopreto.com/saldos', 'https://www.gatopreto.com/promocoes'] },
  { name: 'Vista Alegre', websiteUrl: 'https://www.vfrancq.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.vfrancq.pt/saldos'] },
  { name: 'Cutipol', websiteUrl: 'https://www.cutipol.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.cutipol.pt/promocoes'] },
  { name: 'Herdmar', websiteUrl: 'https://www.herdmar.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.herdmar.com/saldos'] },
  { name: 'Matcerâmica', websiteUrl: 'https://www.matceramica.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.matceramica.com/saldos'] },
  { name: 'Robbialac', websiteUrl: 'https://www.robbialac.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.robbialac.pt/promocoes'] },
  { name: 'Revigrés', websiteUrl: 'https://www.revigres.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.revigres.pt/promocoes'] },
  { name: 'Valis PT', websiteUrl: 'https://www.valis.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.valis.pt/saldos'] },
  { name: 'Habitat PT', websiteUrl: 'https://www.habitat.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.habitat.pt/saldos'] },
  { name: 'Bricor PT', websiteUrl: 'https://www.bricor.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricor.pt/promocoes'] },
  { name: 'Bricomarché PT', websiteUrl: 'https://www.bricomarche.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricomarche.pt/promocoes'] },
  { name: 'Loja do Gato Preto', websiteUrl: 'https://www.gatopreto.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.gatopreto.com/saldos'] },
  { name: 'Miele PT', websiteUrl: 'https://www.miele.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.miele.pt/domestico/promocoes.htm'] },
  { name: 'Bosch Home PT', websiteUrl: 'https://www.bosch-home.pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.bosch-home.pt/ofertas'] },
  { name: 'Siemens Home PT', websiteUrl: 'https://www.siemens-home.bsh-group.com/pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.siemens-home.bsh-group.com/pt/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor (spor-outdoor) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Sport Zone', websiteUrl: 'https://www.sportzone.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportzone.pt/promocoes', 'https://www.sportzone.pt/saldos'] },
  { name: 'Decathlon Sport', websiteUrl: 'https://www.decathlon.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.pt/browse/c0-todas-as-promocoes/_/N-ynko2u'] },
  { name: 'Nike Sport PT', websiteUrl: 'https://www.nike.com/pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com/pt/sale'] },
  { name: 'Adidas Sport PT', websiteUrl: 'https://www.adidas.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.pt/saldos'] },
  { name: 'New Balance Sport PT', websiteUrl: 'https://www.newbalance.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.pt/saldos'] },
  { name: 'Puma Sport PT', websiteUrl: 'https://pt.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://pt.puma.com/saldos'] },
  { name: 'Under Armour PT', websiteUrl: 'https://www.underarmour.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.pt/saldos'] },
  { name: 'Asics PT', websiteUrl: 'https://www.asics.com/pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/pt/saldos'] },
  { name: 'Reebok PT', websiteUrl: 'https://www.reebok.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.pt/saldos'] },
  { name: 'Salomon PT', websiteUrl: 'https://www.salomon.com/pt-pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/pt-pt/sale'] },
  { name: 'Columbia PT', websiteUrl: 'https://www.columbiasportswear.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.pt/saldos'] },
  { name: 'The North Face PT', websiteUrl: 'https://www.thenorthface.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.pt/saldos'] },
  { name: 'Merrell PT', websiteUrl: 'https://www.merrell.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.merrell.pt/saldos'] },
  { name: 'Berghaus PT', websiteUrl: 'https://www.berghaus.com/pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.berghaus.com/pt/sale'] },
  { name: 'Quiksilver PT', websiteUrl: 'https://www.quiksilver.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.quiksilver.pt/saldos'] },
  { name: 'Billabong PT', websiteUrl: 'https://www.billabong.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.billabong.pt/saldos'] },
  { name: 'Rip Curl PT', websiteUrl: 'https://www.ripcurl.com/pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ripcurl.com/pt/saldos'] },
  { name: 'Ericeira Surf & Skate', websiteUrl: 'https://www.ericeirasurfskate.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ericeirasurfskate.pt/saldos'] },
  { name: 'Vans PT', websiteUrl: 'https://www.vans.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.vans.pt/saldos'] },
  { name: 'Converse PT', websiteUrl: 'https://www.converse.com/pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.converse.com/pt/saldos'] },
  { name: 'Skechers Sport PT', websiteUrl: 'https://www.skechers.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.pt/saldos'] },
  { name: 'Crocs PT', websiteUrl: 'https://www.crocs.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.crocs.pt/saldos'] },
  { name: 'Holmes Place PT', websiteUrl: 'https://www.holmesplace.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.holmesplace.pt/promocoes'] },
  { name: 'Fitness Hut', websiteUrl: 'https://www.fitnesshut.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fitnesshut.pt/promocoes'] },
  { name: 'Solinca', websiteUrl: 'https://www.solinca.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.solinca.pt/promocoes'] },
  { name: 'Intersport PT', websiteUrl: 'https://www.intersport.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.intersport.pt/saldos'] },
  { name: 'Hi-Tec PT', websiteUrl: 'https://www.hi-tec.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.hi-tec.pt/saldos'] },
  { name: 'Timberland Sport PT', websiteUrl: 'https://www.timberland.pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.timberland.pt/saldos'] },
  { name: 'Garmin PT', websiteUrl: 'https://www.garmin.com/pt-PT', categorySlug: 'spor-outdoor', seedUrls: ['https://www.garmin.com/pt-PT/sale/'] },
  { name: 'Polar PT', websiteUrl: 'https://www.polar.com/pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.polar.com/pt/sale'] },
  { name: 'Suunto PT', websiteUrl: 'https://www.suunto.com/pt-pt', categorySlug: 'spor-outdoor', seedUrls: ['https://www.suunto.com/pt-pt/sale/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel (seyahat-ulasim) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'TAP Air Portugal', websiteUrl: 'https://www.flytap.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flytap.com/pt-pt/ofertas', 'https://www.flytap.com/pt-pt/promocoes'] },
  { name: 'Ryanair PT', websiteUrl: 'https://www.ryanair.com/pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ryanair.com/pt/pt/ofertas'] },
  { name: 'easyJet PT', websiteUrl: 'https://www.easyjet.com/pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easyjet.com/pt/ofertas'] },
  { name: 'Vueling PT', websiteUrl: 'https://www.vueling.com/pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vueling.com/pt/ofertas'] },
  { name: 'Transavia PT', websiteUrl: 'https://www.transavia.com/pt-PT', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.transavia.com/pt-PT/ofertas/'] },
  { name: 'Wizz Air PT', websiteUrl: 'https://wizzair.com/pt-pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://wizzair.com/pt-pt#/offers'] },
  { name: 'Booking PT', websiteUrl: 'https://www.booking.com/country/pt.html', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/dealspage.html?cc1=pt'] },
  { name: 'Expedia PT', websiteUrl: 'https://www.expedia.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.pt/ofertas'] },
  { name: 'Airbnb PT', websiteUrl: 'https://www.airbnb.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.pt/'] },
  { name: 'Trivago PT', websiteUrl: 'https://www.trivago.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.trivago.pt/'] },
  { name: 'Kayak PT', websiteUrl: 'https://www.kayak.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.pt/ofertas'] },
  { name: 'Skyscanner PT', websiteUrl: 'https://www.skyscanner.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.pt/ofertas'] },
  { name: 'eDreams PT', websiteUrl: 'https://www.edreams.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.edreams.pt/ofertas-viagem/'] },
  { name: 'Lastminute PT', websiteUrl: 'https://www.lastminute.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.lastminute.pt/ofertas'] },
  { name: 'Pestana', websiteUrl: 'https://www.pestana.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pestana.com/pt/ofertas', 'https://www.pestana.com/pt/promocoes'] },
  { name: 'Vila Galé', websiteUrl: 'https://www.vilagale.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vilagale.com/pt/ofertas', 'https://www.vilagale.com/pt/promocoes'] },
  { name: 'Tivoli Hotels', websiteUrl: 'https://www.tivolihotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tivolihotels.com/pt/ofertas'] },
  { name: 'Uber PT', websiteUrl: 'https://www.uber.com/pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/pt/pt/ride/'] },
  { name: 'Bolt PT', websiteUrl: 'https://bolt.eu/pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://bolt.eu/pt/ofertas/'] },
  { name: 'Europcar PT', websiteUrl: 'https://www.europcar.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.europcar.pt/ofertas'] },
  { name: 'Hertz PT', websiteUrl: 'https://www.hertz.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hertz.pt/promocoes'] },
  { name: 'Avis PT', websiteUrl: 'https://www.avis.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.avis.pt/ofertas'] },
  { name: 'CP Comboios', websiteUrl: 'https://www.cp.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.cp.pt/passageiros/pt/consultar-horarios/promocoes'] },
  { name: 'Rede Expressos', websiteUrl: 'https://www.rede-expressos.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rede-expressos.pt/promocoes'] },
  { name: 'FlixBus PT', websiteUrl: 'https://www.flixbus.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.pt/ofertas'] },
  { name: 'Hotels.com PT', websiteUrl: 'https://pt.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://pt.hotels.com/deals'] },
  { name: 'Soltrópico', websiteUrl: 'https://www.soltropico.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.soltropico.pt/promocoes'] },
  { name: 'Abreu Viagens', websiteUrl: 'https://www.abreu.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.abreu.pt/ofertas', 'https://www.abreu.pt/promocoes'] },
  { name: 'Nortravel', websiteUrl: 'https://www.nortravel.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.nortravel.pt/promocoes'] },
  { name: 'Iberojet PT', websiteUrl: 'https://www.iberojet.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.iberojet.pt/ofertas'] },
  { name: 'Top Atlântico', websiteUrl: 'https://www.topatlantico.pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.topatlantico.pt/promocoes'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'CGD', websiteUrl: 'https://www.cgd.pt', categorySlug: 'finans', seedUrls: ['https://www.cgd.pt/Particulares/Promocoes/Pages/promocoes.aspx'] },
  { name: 'Millennium BCP', websiteUrl: 'https://www.millenniumbcp.pt', categorySlug: 'finans', seedUrls: ['https://www.millenniumbcp.pt/pt/particulares/campanhas/'] },
  { name: 'Santander PT', websiteUrl: 'https://www.santander.pt', categorySlug: 'finans', seedUrls: ['https://www.santander.pt/campanhas', 'https://www.santander.pt/promocoes'] },
  { name: 'Novo Banco', websiteUrl: 'https://www.novobanco.pt', categorySlug: 'finans', seedUrls: ['https://www.novobanco.pt/particulares/campanhas'] },
  { name: 'BPI', websiteUrl: 'https://www.bancobpi.pt', categorySlug: 'finans', seedUrls: ['https://www.bancobpi.pt/particulares/campanhas'] },
  { name: 'Bankinter PT', websiteUrl: 'https://www.bankinter.pt', categorySlug: 'finans', seedUrls: ['https://www.bankinter.pt/campanhas'] },
  { name: 'Crédito Agrícola', websiteUrl: 'https://www.creditoagricola.pt', categorySlug: 'finans', seedUrls: ['https://www.creditoagricola.pt/campanhas'] },
  { name: 'Revolut PT', websiteUrl: 'https://www.revolut.com/pt-PT', categorySlug: 'finans', seedUrls: ['https://www.revolut.com/pt-PT/ofertas'] },
  { name: 'MB WAY', websiteUrl: 'https://www.mbway.pt', categorySlug: 'finans', seedUrls: ['https://www.mbway.pt/promocoes'] },
  { name: 'Visa PT', websiteUrl: 'https://www.visa.pt', categorySlug: 'finans', seedUrls: ['https://www.visa.pt/ofertas-e-promocoes.html'] },
  { name: 'Mastercard PT', websiteUrl: 'https://www.mastercard.pt', categorySlug: 'finans', seedUrls: ['https://www.mastercard.pt/pt-pt/consumers/offers-promotions.html'] },
  { name: 'American Express PT', websiteUrl: 'https://www.americanexpress.com/pt', categorySlug: 'finans', seedUrls: ['https://www.americanexpress.com/pt/ofertas/'] },
  { name: 'N26 PT', websiteUrl: 'https://n26.com/pt-pt', categorySlug: 'finans', seedUrls: ['https://n26.com/pt-pt/ofertas'] },
  { name: 'Moey', websiteUrl: 'https://www.moey.pt', categorySlug: 'finans', seedUrls: ['https://www.moey.pt/promocoes'] },
  { name: 'Openbank PT', websiteUrl: 'https://www.openbank.pt', categorySlug: 'finans', seedUrls: ['https://www.openbank.pt/campanhas'] },
  { name: 'ActivoBank', websiteUrl: 'https://www.activobank.pt', categorySlug: 'finans', seedUrls: ['https://www.activobank.pt/campanhas'] },
  { name: 'Cofidis PT', websiteUrl: 'https://www.cofidis.pt', categorySlug: 'finans', seedUrls: ['https://www.cofidis.pt/campanhas'] },
  { name: 'Cetelem PT', websiteUrl: 'https://www.cetelem.pt', categorySlug: 'finans', seedUrls: ['https://www.cetelem.pt/campanhas'] },
  { name: 'WiZink PT', websiteUrl: 'https://www.wizink.pt', categorySlug: 'finans', seedUrls: ['https://www.wizink.pt/campanhas'] },
  { name: 'Unibanco', websiteUrl: 'https://www.unibanco.pt', categorySlug: 'finans', seedUrls: ['https://www.unibanco.pt/campanhas'] },
  { name: 'PayPal PT', websiteUrl: 'https://www.paypal.com/pt', categorySlug: 'finans', seedUrls: ['https://www.paypal.com/pt/webapps/mpp/offers'] },
  { name: 'Klarna PT', websiteUrl: 'https://www.klarna.com/pt', categorySlug: 'finans', seedUrls: ['https://www.klarna.com/pt/ofertas/'] },
  { name: 'Wise PT', websiteUrl: 'https://wise.com/pt', categorySlug: 'finans', seedUrls: ['https://wise.com/pt/'] },
  { name: 'Degiro PT', websiteUrl: 'https://www.degiro.pt', categorySlug: 'finans', seedUrls: ['https://www.degiro.pt/campanhas'] },
  { name: 'Trading 212 PT', websiteUrl: 'https://www.trading212.com/pt', categorySlug: 'finans', seedUrls: ['https://www.trading212.com/pt/ofertas'] },
  { name: 'XTB PT', websiteUrl: 'https://www.xtb.com/pt', categorySlug: 'finans', seedUrls: ['https://www.xtb.com/pt/promocoes'] },
  { name: 'Binance PT', websiteUrl: 'https://www.binance.com/pt', categorySlug: 'finans', seedUrls: ['https://www.binance.com/pt/activity'] },
  { name: 'Montepio', websiteUrl: 'https://www.montepio.pt', categorySlug: 'finans', seedUrls: ['https://www.montepio.pt/campanhas'] },
  { name: 'Banco CTT', websiteUrl: 'https://www.bancoctt.pt', categorySlug: 'finans', seedUrls: ['https://www.bancoctt.pt/campanhas'] },
  { name: 'EuroBic', websiteUrl: 'https://www.eurobic.pt', categorySlug: 'finans', seedUrls: ['https://www.eurobic.pt/campanhas'] },
  { name: 'Best Bank', websiteUrl: 'https://www.bancobest.pt', categorySlug: 'finans', seedUrls: ['https://www.bancobest.pt/campanhas'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Fidelidade', websiteUrl: 'https://www.fidelidade.pt', categorySlug: 'sigorta', seedUrls: ['https://www.fidelidade.pt/pt/campanhas', 'https://www.fidelidade.pt/pt/promocoes'] },
  { name: 'Allianz PT', websiteUrl: 'https://www.allianz.pt', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.pt/campanhas'] },
  { name: 'Tranquilidade', websiteUrl: 'https://www.tranquilidade.pt', categorySlug: 'sigorta', seedUrls: ['https://www.tranquilidade.pt/campanhas', 'https://www.tranquilidade.pt/promocoes'] },
  { name: 'Ageas PT', websiteUrl: 'https://www.ageas.pt', categorySlug: 'sigorta', seedUrls: ['https://www.ageas.pt/campanhas'] },
  { name: 'Generali PT', websiteUrl: 'https://www.generali.pt', categorySlug: 'sigorta', seedUrls: ['https://www.generali.pt/campanhas'] },
  { name: 'Liberty Seguros PT', websiteUrl: 'https://www.libertyseguros.pt', categorySlug: 'sigorta', seedUrls: ['https://www.libertyseguros.pt/campanhas'] },
  { name: 'Zurich PT', websiteUrl: 'https://www.zurich.pt', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.pt/campanhas'] },
  { name: 'MAPFRE PT', websiteUrl: 'https://www.mapfre.pt', categorySlug: 'sigorta', seedUrls: ['https://www.mapfre.pt/campanhas'] },
  { name: 'AXA PT', websiteUrl: 'https://www.axa.pt', categorySlug: 'sigorta', seedUrls: ['https://www.axa.pt/campanhas'] },
  { name: 'Lusitania', websiteUrl: 'https://www.lusitania.pt', categorySlug: 'sigorta', seedUrls: ['https://www.lusitania.pt/campanhas'] },
  { name: 'Multicare', websiteUrl: 'https://www.multicare.pt', categorySlug: 'sigorta', seedUrls: ['https://www.multicare.pt/campanhas'] },
  { name: 'Médis', websiteUrl: 'https://www.medis.pt', categorySlug: 'sigorta', seedUrls: ['https://www.medis.pt/campanhas'] },
  { name: 'AdvanceCare', websiteUrl: 'https://www.advancecare.pt', categorySlug: 'sigorta', seedUrls: ['https://www.advancecare.pt/campanhas'] },
  { name: 'Ok! Seguros', websiteUrl: 'https://www.ok-seguros.pt', categorySlug: 'sigorta', seedUrls: ['https://www.ok-seguros.pt/campanhas'] },
  { name: 'Logo Seguros', websiteUrl: 'https://www.logo.pt', categorySlug: 'sigorta', seedUrls: ['https://www.logo.pt/campanhas'] },
  { name: 'Caravela Seguros', websiteUrl: 'https://www.caravela.pt', categorySlug: 'sigorta', seedUrls: ['https://www.caravela.pt/campanhas'] },
  { name: 'Real Vida Seguros', websiteUrl: 'https://www.realvidaseguros.pt', categorySlug: 'sigorta', seedUrls: ['https://www.realvidaseguros.pt/campanhas'] },
  { name: 'Victoria Seguros', websiteUrl: 'https://www.victoriaseguros.pt', categorySlug: 'sigorta', seedUrls: ['https://www.victoriaseguros.pt/campanhas'] },
  { name: 'Una Seguros', websiteUrl: 'https://www.una.pt', categorySlug: 'sigorta', seedUrls: ['https://www.una.pt/campanhas'] },
  { name: 'N Seguros', websiteUrl: 'https://www.nseguros.pt', categorySlug: 'sigorta', seedUrls: ['https://www.nseguros.pt/campanhas'] },
  { name: 'Prevoir PT', websiteUrl: 'https://www.prevoir.pt', categorySlug: 'sigorta', seedUrls: ['https://www.prevoir.pt/campanhas'] },
  { name: 'Crédito Agrícola Seguros', websiteUrl: 'https://www.ca-seguros.pt', categorySlug: 'sigorta', seedUrls: ['https://www.ca-seguros.pt/campanhas'] },
  { name: 'BPI Vida', websiteUrl: 'https://www.bancobpi.pt', categorySlug: 'sigorta', seedUrls: ['https://www.bancobpi.pt/particulares/seguros/campanhas'] },
  { name: 'Santander Totta Seguros', websiteUrl: 'https://www.santander.pt', categorySlug: 'sigorta', seedUrls: ['https://www.santander.pt/seguros/campanhas'] },
  { name: 'GNB Seguros', websiteUrl: 'https://www.novobanco.pt', categorySlug: 'sigorta', seedUrls: ['https://www.novobanco.pt/seguros/campanhas'] },
  { name: 'Chubb PT', websiteUrl: 'https://www.chubb.com/pt-pt', categorySlug: 'sigorta', seedUrls: ['https://www.chubb.com/pt-pt/ofertas.html'] },
  { name: 'HDI PT', websiteUrl: 'https://www.hdi.pt', categorySlug: 'sigorta', seedUrls: ['https://www.hdi.pt/campanhas'] },
  { name: 'MetLife PT', websiteUrl: 'https://www.metlife.pt', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.pt/campanhas'] },
  { name: 'Mútua dos Pescadores', websiteUrl: 'https://www.mutuapescadores.pt', categorySlug: 'sigorta', seedUrls: ['https://www.mutuapescadores.pt/campanhas'] },
  { name: 'Eurovida', websiteUrl: 'https://www.eurovida.pt', categorySlug: 'sigorta', seedUrls: ['https://www.eurovida.pt/campanhas'] },
  { name: 'Ocidental Seguros', websiteUrl: 'https://www.ocidental.pt', categorySlug: 'sigorta', seedUrls: ['https://www.ocidental.pt/campanhas'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Renault PT', websiteUrl: 'https://www.renault.pt', categorySlug: 'otomobil', seedUrls: ['https://www.renault.pt/ofertas.html', 'https://www.renault.pt/promocoes.html'] },
  { name: 'Peugeot PT', websiteUrl: 'https://www.peugeot.pt', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.pt/ofertas.html'] },
  { name: 'Citroën PT', websiteUrl: 'https://www.citroen.pt', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.pt/ofertas.html'] },
  { name: 'BMW PT', websiteUrl: 'https://www.bmw.pt', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.pt/pt/offers.html'] },
  { name: 'Mercedes-Benz PT', websiteUrl: 'https://www.mercedes-benz.pt', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.pt/passengercars/campaigns.html'] },
  { name: 'Volkswagen PT', websiteUrl: 'https://www.volkswagen.pt', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.pt/pt/ofertas.html'] },
  { name: 'Toyota PT', websiteUrl: 'https://www.toyota.pt', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.pt/campanhas', 'https://www.toyota.pt/ofertas'] },
  { name: 'Audi PT', websiteUrl: 'https://www.audi.pt', categorySlug: 'otomobil', seedUrls: ['https://www.audi.pt/pt/web/pt/ofertas.html'] },
  { name: 'Fiat PT', websiteUrl: 'https://www.fiat.pt', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.pt/ofertas'] },
  { name: 'Nissan PT', websiteUrl: 'https://www.nissan.pt', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.pt/ofertas.html'] },
  { name: 'Honda PT', websiteUrl: 'https://www.honda.pt', categorySlug: 'otomobil', seedUrls: ['https://www.honda.pt/ofertas'] },
  { name: 'Hyundai PT', websiteUrl: 'https://www.hyundai.pt', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.pt/ofertas'] },
  { name: 'Kia PT', websiteUrl: 'https://www.kia.com/pt', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/pt/ofertas/'] },
  { name: 'Ford PT', websiteUrl: 'https://www.ford.pt', categorySlug: 'otomobil', seedUrls: ['https://www.ford.pt/ofertas/', 'https://www.ford.pt/promocoes/'] },
  { name: 'Opel PT', websiteUrl: 'https://www.opel.pt', categorySlug: 'otomobil', seedUrls: ['https://www.opel.pt/ofertas.html'] },
  { name: 'SEAT PT', websiteUrl: 'https://www.seat.pt', categorySlug: 'otomobil', seedUrls: ['https://www.seat.pt/ofertas.html'] },
  { name: 'Cupra PT', websiteUrl: 'https://www.cupraofficial.pt', categorySlug: 'otomobil', seedUrls: ['https://www.cupraofficial.pt/ofertas.html'] },
  { name: 'Skoda PT', websiteUrl: 'https://www.skoda.pt', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.pt/ofertas.html'] },
  { name: 'Volvo PT', websiteUrl: 'https://www.volvocars.com/pt', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/pt/ofertas/'] },
  { name: 'Mazda PT', websiteUrl: 'https://www.mazda.pt', categorySlug: 'otomobil', seedUrls: ['https://www.mazda.pt/ofertas/'] },
  { name: 'Suzuki PT', websiteUrl: 'https://www.suzuki.pt', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.pt/ofertas'] },
  { name: 'Mitsubishi PT', websiteUrl: 'https://www.mitsubishi-motors.pt', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishi-motors.pt/ofertas'] },
  { name: 'Dacia PT', websiteUrl: 'https://www.dacia.pt', categorySlug: 'otomobil', seedUrls: ['https://www.dacia.pt/ofertas.html'] },
  { name: 'Tesla PT', websiteUrl: 'https://www.tesla.com/pt_pt', categorySlug: 'otomobil', seedUrls: ['https://www.tesla.com/pt_pt/'] },
  { name: 'Jeep PT', websiteUrl: 'https://www.jeep.pt', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.pt/ofertas'] },
  { name: 'Land Rover PT', websiteUrl: 'https://www.landrover.pt', categorySlug: 'otomobil', seedUrls: ['https://www.landrover.pt/offers.html'] },
  { name: 'Galp', websiteUrl: 'https://www.galp.com/pt', categorySlug: 'otomobil', seedUrls: ['https://www.galp.com/pt/campanhas', 'https://www.galp.com/pt/promocoes'] },
  { name: 'Repsol PT', websiteUrl: 'https://www.repsol.pt', categorySlug: 'otomobil', seedUrls: ['https://www.repsol.pt/campanhas'] },
  { name: 'BP PT', websiteUrl: 'https://www.bp.com/pt_pt', categorySlug: 'otomobil', seedUrls: ['https://www.bp.com/pt_pt/portugal/home/campanhas.html'] },
  { name: 'Michelin PT', websiteUrl: 'https://www.michelin.pt', categorySlug: 'otomobil', seedUrls: ['https://www.michelin.pt/ofertas'] },
  { name: 'Continental PT', websiteUrl: 'https://www.continental-pneus.pt', categorySlug: 'otomobil', seedUrls: ['https://www.continental-pneus.pt/promocoes'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 31 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Bertrand', websiteUrl: 'https://www.bertrand.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bertrand.pt/promocoes', 'https://www.bertrand.pt/saldos'] },
  { name: 'FNAC Livros', websiteUrl: 'https://www.fnac.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.fnac.pt/livros/promocoes'] },
  { name: 'Wook', websiteUrl: 'https://www.wook.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.wook.pt/promocoes', 'https://www.wook.pt/saldos'] },
  { name: 'Livraria Lello', websiteUrl: 'https://www.livrarialello.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.livrarialello.pt/promocoes'] },
  { name: 'Almedina', websiteUrl: 'https://www.almedina.net', categorySlug: 'kitap-hobi', seedUrls: ['https://www.almedina.net/promocoes'] },
  { name: 'Porto Editora', websiteUrl: 'https://www.portoeditora.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.portoeditora.pt/promocoes'] },
  { name: 'LeYa', websiteUrl: 'https://www.leyaonline.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.leyaonline.com/promocoes'] },
  { name: 'Planeta PT', websiteUrl: 'https://www.planetadelivros.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.planetadelivros.pt/promocoes'] },
  { name: 'Netflix PT', websiteUrl: 'https://www.netflix.com/pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.netflix.com/pt/'] },
  { name: 'Disney+ PT', websiteUrl: 'https://www.disneyplus.com/pt-pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.disneyplus.com/pt-pt/'] },
  { name: 'HBO Max PT', websiteUrl: 'https://www.max.com/pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.max.com/pt/'] },
  { name: 'Spotify PT', websiteUrl: 'https://www.spotify.com/pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/pt/premium/'] },
  { name: 'Amazon Prime PT', websiteUrl: 'https://www.primevideo.com/region/eu', categorySlug: 'kitap-hobi', seedUrls: ['https://www.primevideo.com/region/eu/'] },
  { name: 'Apple Music PT', websiteUrl: 'https://www.apple.com/pt/apple-music', categorySlug: 'kitap-hobi', seedUrls: ['https://www.apple.com/pt/apple-music/'] },
  { name: 'PlayStation PT', websiteUrl: 'https://store.playstation.com/pt-pt', categorySlug: 'kitap-hobi', seedUrls: ['https://store.playstation.com/pt-pt/category/ofertas'] },
  { name: 'Xbox PT', websiteUrl: 'https://www.xbox.com/pt-PT', categorySlug: 'kitap-hobi', seedUrls: ['https://www.xbox.com/pt-PT/games/sales-and-specials'] },
  { name: 'Nintendo PT', websiteUrl: 'https://www.nintendo.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nintendo.pt/store/deals/'] },
  { name: 'Steam PT', websiteUrl: 'https://store.steampowered.com', categorySlug: 'kitap-hobi', seedUrls: ['https://store.steampowered.com/specials'] },
  { name: 'Lego PT', websiteUrl: 'https://www.lego.com/pt-pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/pt-pt/categories/sales-and-deals'] },
  { name: 'CNA PT', websiteUrl: 'https://www.cna.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.cna.pt/promocoes'] },
  { name: 'Toys R Us PT', websiteUrl: 'https://www.toysrus.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.toysrus.pt/promocoes'] },
  { name: 'Imaginarium PT', websiteUrl: 'https://www.imaginarium.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.imaginarium.pt/saldos'] },
  { name: 'NOS Cinemas', websiteUrl: 'https://cinemas.nos.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://cinemas.nos.pt/campanhas'] },
  { name: 'UCI Cinemas PT', websiteUrl: 'https://www.ucicinemas.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ucicinemas.pt/promocoes'] },
  { name: 'Ticketline', websiteUrl: 'https://www.ticketline.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.ticketline.pt/promocoes'] },
  { name: 'BOL', websiteUrl: 'https://www.bol.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.bol.pt/promocoes'] },
  { name: 'Eventbrite PT', websiteUrl: 'https://www.eventbrite.pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.eventbrite.pt/d/portugal/ofertas/'] },
  { name: 'Udemy PT', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=pt&src=ukw&q=ofertas'] },
  { name: 'Coursera PT', websiteUrl: 'https://www.coursera.org', categorySlug: 'kitap-hobi', seedUrls: ['https://www.coursera.org/deals'] },
  { name: 'Domestika PT', websiteUrl: 'https://www.domestika.org/pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.domestika.org/pt/sale'] },
  { name: 'Audible PT', websiteUrl: 'https://www.audible.com/pt', categorySlug: 'kitap-hobi', seedUrls: ['https://www.audible.com/pt/deals'] },
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
  console.log('=== PT Brand Seeding Script ===');
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
        where: { slug_market: { slug, market: 'PT' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId: category.id },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'PT', categoryId: category.id },
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
            market: 'PT',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'PT' },
          });
          sourcesUpdated++;
        }
      }
    } catch (err) {
      errors++;
      console.error(`Error: ${entry.name} — ${(err as Error).message}`);
    }
  }

  const totalActive = await prisma.crawlSource.count({ where: { market: 'PT', isActive: true } });
  console.log(`\nResults: ${brandsOk} brands OK, ${sourcesCreated} sources created, ${sourcesUpdated} updated, ${errors} errors`);
  if (missingCategories.size) console.log(`Missing categories: ${[...missingCategories].join(', ')}`);
  console.log(`Total active PT sources: ${totalActive}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
