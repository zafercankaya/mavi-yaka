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
  // 1) Alışveriş / Shopping (alisveris) — 16 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'ePRICE', websiteUrl: 'https://www.eprice.it', categorySlug: 'alisveris', seedUrls: ['https://www.eprice.it/offerte-del-giorno', 'https://www.eprice.it/promozioni'] },
  { name: 'Privalia IT', websiteUrl: 'https://www.privalia.com/it', categorySlug: 'alisveris', seedUrls: ['https://www.privalia.com/it/'] },
  { name: 'Veepee IT', websiteUrl: 'https://www.veepee.it', categorySlug: 'alisveris', seedUrls: ['https://www.veepee.it/'] },
  { name: 'SaldiPrivati', websiteUrl: 'https://www.saldiprivati.com', categorySlug: 'alisveris', seedUrls: ['https://www.saldiprivati.com/'] },
  { name: 'Groupon IT', websiteUrl: 'https://www.groupon.it', categorySlug: 'alisveris', seedUrls: ['https://www.groupon.it/offerte', 'https://www.groupon.it/occasioni'] },
  { name: 'PromoQui', websiteUrl: 'https://www.promoqui.it', categorySlug: 'alisveris', seedUrls: ['https://www.promoqui.it/volantini', 'https://www.promoqui.it/offerte'] },
  { name: 'DoveConviene', websiteUrl: 'https://www.doveconviene.it', categorySlug: 'alisveris', seedUrls: ['https://www.doveconviene.it/volantini', 'https://www.doveconviene.it/offerte'] },
  { name: 'Trovaprezzi', websiteUrl: 'https://www.trovaprezzi.it', categorySlug: 'alisveris', seedUrls: ['https://www.trovaprezzi.it/prezzi_offerte.aspx'] },
  { name: 'Monclick', websiteUrl: 'https://www.monclick.it', categorySlug: 'alisveris', seedUrls: ['https://www.monclick.it/offerte'] },
  { name: 'Bottega Verde', websiteUrl: 'https://www.bottegaverde.it', categorySlug: 'alisveris', seedUrls: ['https://www.bottegaverde.it/offerte', 'https://www.bottegaverde.it/promozioni'] },
  { name: 'Tigotà', websiteUrl: 'https://www.tigota.it', categorySlug: 'alisveris', seedUrls: ['https://www.tigota.it/volantino', 'https://www.tigota.it/offerte'] },
  { name: 'Prenatal', websiteUrl: 'https://www.prenatal.com/it', categorySlug: 'alisveris', seedUrls: ['https://www.prenatal.com/it/promozioni', 'https://www.prenatal.com/it/saldi'] },
  { name: 'Piazza Italia', websiteUrl: 'https://www.piazzaitalia.it', categorySlug: 'alisveris', seedUrls: ['https://www.piazzaitalia.it/saldi', 'https://www.piazzaitalia.it/promozioni'] },
  { name: 'Risparmio Super', websiteUrl: 'https://www.risparmiosuper.it', categorySlug: 'alisveris', seedUrls: ['https://www.risparmiosuper.it/volantini', 'https://www.risparmiosuper.it/offerte'] },
  { name: 'Expert IT', websiteUrl: 'https://www.expert.it', categorySlug: 'alisveris', seedUrls: ['https://www.expert.it/offerte', 'https://www.expert.it/promozioni'] },
  { name: 'Comet IT', websiteUrl: 'https://www.comet.it', categorySlug: 'alisveris', seedUrls: ['https://www.comet.it/offerte', 'https://www.comet.it/promozioni'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics (elektronik) — 18 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'ePRICE Elettronica', websiteUrl: 'https://www.eprice.it', categorySlug: 'elektronik', seedUrls: ['https://www.eprice.it/informatica/offerte', 'https://www.eprice.it/telefonia/offerte'] },
  { name: 'Monclick Elettronica', websiteUrl: 'https://www.monclick.it', categorySlug: 'elektronik', seedUrls: ['https://www.monclick.it/offerte'] },
  { name: 'OPPO IT', websiteUrl: 'https://www.oppo.com/it', categorySlug: 'elektronik', seedUrls: ['https://www.oppo.com/it/offer/'] },
  { name: 'OnePlus IT', websiteUrl: 'https://www.oneplus.com/it', categorySlug: 'elektronik', seedUrls: ['https://www.oneplus.com/it/offer'] },
  { name: 'Motorola IT', websiteUrl: 'https://www.motorola.it', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.it/offerte'] },
  { name: 'Acer IT', websiteUrl: 'https://store.acer.com/it-it', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/it-it/offerte'] },
  { name: 'ASUS IT', websiteUrl: 'https://www.asus.com/it', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/it/deals/'] },
  { name: 'MSI IT', websiteUrl: 'https://it.msi.com', categorySlug: 'elektronik', seedUrls: ['https://it.msi.com/Promotion/'] },
  { name: 'LG IT', websiteUrl: 'https://www.lg.com/it', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/it/promozioni/'] },
  { name: 'Panasonic IT', websiteUrl: 'https://www.panasonic.com/it', categorySlug: 'elektronik', seedUrls: ['https://www.panasonic.com/it/promozioni.html'] },
  { name: 'Philips IT', websiteUrl: 'https://www.philips.it', categorySlug: 'elektronik', seedUrls: ['https://www.philips.it/c-e/offerte.html'] },
  { name: 'Canon IT', websiteUrl: 'https://www.canon.it', categorySlug: 'elektronik', seedUrls: ['https://www.canon.it/promozioni/'] },
  { name: 'Nikon IT', websiteUrl: 'https://www.nikon.it', categorySlug: 'elektronik', seedUrls: ['https://www.nikon.it/it_IT/promozioni.page'] },
  { name: 'JBL IT', websiteUrl: 'https://it.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://it.jbl.com/offerte/'] },
  { name: 'Marshall IT', websiteUrl: 'https://www.marshallheadphones.com/it/it', categorySlug: 'elektronik', seedUrls: ['https://www.marshallheadphones.com/it/it/sale.html'] },
  { name: 'Logitech IT', websiteUrl: 'https://www.logitech.com/it-it', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/it-it/promo.html'] },
  { name: 'Razer IT', websiteUrl: 'https://www.razer.com/it-it', categorySlug: 'elektronik', seedUrls: ['https://www.razer.com/it-it/deals'] },
  { name: 'GoPro IT', websiteUrl: 'https://gopro.com/it/it', categorySlug: 'elektronik', seedUrls: ['https://gopro.com/it/it/deals'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Fashion (giyim-moda) — 25 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Calzedonia', websiteUrl: 'https://www.calzedonia.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.calzedonia.com/it/saldi.html'] },
  { name: 'Intimissimi', websiteUrl: 'https://www.intimissimi.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.intimissimi.com/it/saldi.html'] },
  { name: 'Tezenis', websiteUrl: 'https://www.tezenis.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.tezenis.com/it/saldi.html'] },
  { name: 'MaxMara', websiteUrl: 'https://it.maxmara.com', categorySlug: 'giyim-moda', seedUrls: ['https://it.maxmara.com/saldi'] },
  { name: 'Furla', websiteUrl: 'https://www.furla.com/it/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.furla.com/it/it/saldi/'] },
  { name: 'Liu Jo', websiteUrl: 'https://www.liujo.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.liujo.com/it/saldi/'] },
  { name: 'Patrizia Pepe', websiteUrl: 'https://www.patriziapepe.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.patriziapepe.com/it/saldi/'] },
  { name: 'Elisabetta Franchi', websiteUrl: 'https://www.elisabettafranchi.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.elisabettafranchi.com/it/outlet/'] },
  { name: 'Motivi', websiteUrl: 'https://www.motivi.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.motivi.com/saldi/'] },
  { name: 'Terranova', websiteUrl: 'https://www.terranovastyle.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.terranovastyle.com/it/saldi.html'] },
  { name: 'Alcott', websiteUrl: 'https://www.alcott.eu/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.alcott.eu/it/saldi/'] },
  { name: 'Geox IT', websiteUrl: 'https://www.geox.com/it-IT', categorySlug: 'giyim-moda', seedUrls: ['https://www.geox.com/it-IT/saldi/'] },
  { name: 'Tod\'s', websiteUrl: 'https://www.tods.com/it-it', categorySlug: 'giyim-moda', seedUrls: ['https://www.tods.com/it-it/sale/'] },
  { name: 'Hogan', websiteUrl: 'https://www.hogan.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.hogan.com/it/saldi/'] },
  { name: 'Armani IT', websiteUrl: 'https://www.armani.com/it-it', categorySlug: 'giyim-moda', seedUrls: ['https://www.armani.com/it-it/saldi/'] },
  { name: 'Versace IT', websiteUrl: 'https://www.versace.com/it/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.versace.com/it/it/saldi/'] },
  { name: 'Dolce & Gabbana IT', websiteUrl: 'https://www.dolcegabbana.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.dolcegabbana.com/it/saldi/'] },
  { name: 'Prada IT', websiteUrl: 'https://www.prada.com/it/it.html', categorySlug: 'giyim-moda', seedUrls: ['https://www.prada.com/it/it/saldi.html'] },
  { name: 'Valentino IT', websiteUrl: 'https://www.valentino.com/it-it', categorySlug: 'giyim-moda', seedUrls: ['https://www.valentino.com/it-it/saldi/'] },
  { name: 'Gucci IT', websiteUrl: 'https://www.gucci.com/it/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.gucci.com/it/it/ca/sale-c-sale'] },
  { name: 'Sisley IT', websiteUrl: 'https://it.sisley.com', categorySlug: 'giyim-moda', seedUrls: ['https://it.sisley.com/saldi/'] },
  { name: 'Stefanel', websiteUrl: 'https://www.stefanel.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.stefanel.com/it/saldi/'] },
  { name: 'Falconeri', websiteUrl: 'https://www.falconeri.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.falconeri.com/it/saldi.html'] },
  { name: 'Boggi Milano', websiteUrl: 'https://www.boggi.com/it-it', categorySlug: 'giyim-moda', seedUrls: ['https://www.boggi.com/it-it/saldi.html'] },
  { name: 'Pennyblack', websiteUrl: 'https://www.pennyblack.com/it', categorySlug: 'giyim-moda', seedUrls: ['https://www.pennyblack.com/it/saldi/'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living (ev-yasam) — 16 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Mondo Convenienza', websiteUrl: 'https://www.mondoconv.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.mondoconv.it/promozioni', 'https://www.mondoconv.it/offerte'] },
  { name: 'Maisons du Monde IT', websiteUrl: 'https://www.maisonsdumonde.com/IT/it', categorySlug: 'ev-yasam', seedUrls: ['https://www.maisonsdumonde.com/IT/it/saldi.htm'] },
  { name: 'Poltronesofà', websiteUrl: 'https://www.poltronesofa.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.poltronesofa.com/it-IT/promozioni'] },
  { name: 'Westwing IT', websiteUrl: 'https://www.westwing.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.it/'] },
  { name: 'Scavolini', websiteUrl: 'https://www.scavolini.com/it', categorySlug: 'ev-yasam', seedUrls: ['https://www.scavolini.com/it/promozioni/'] },
  { name: 'Calligaris', websiteUrl: 'https://www.calligaris.com/it-it', categorySlug: 'ev-yasam', seedUrls: ['https://www.calligaris.com/it-it/outlet/'] },
  { name: 'Veneta Cucine', websiteUrl: 'https://www.venetacucine.com/it', categorySlug: 'ev-yasam', seedUrls: ['https://www.venetacucine.com/it/promozioni/'] },
  { name: 'Arredissima', websiteUrl: 'https://www.arredissima.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.arredissima.com/promozioni/', 'https://www.arredissima.com/offerte/'] },
  { name: 'Mercatone Uno', websiteUrl: 'https://www.mercatoneuno.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.mercatoneuno.com/offerte', 'https://www.mercatoneuno.com/promozioni'] },
  { name: 'Bricoman IT', websiteUrl: 'https://www.bricoman.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricoman.it/offerte'] },
  { name: 'Brico IO', websiteUrl: 'https://www.bricoio.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.bricoio.it/offerte', 'https://www.bricoio.it/promozioni'] },
  { name: 'Self Italia', websiteUrl: 'https://www.selfitalia.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.selfitalia.it/offerte/'] },
  { name: 'Emu Group', websiteUrl: 'https://www.emu.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.emu.it/it/outlet/'] },
  { name: 'Alessi', websiteUrl: 'https://www.alessi.com/it_it', categorySlug: 'ev-yasam', seedUrls: ['https://www.alessi.com/it_it/sale.html'] },
  { name: 'Thun', websiteUrl: 'https://www.thun.com', categorySlug: 'ev-yasam', seedUrls: ['https://www.thun.com/it/saldi/', 'https://www.thun.com/it/promozioni/'] },
  { name: 'Dalani IT', websiteUrl: 'https://www.westwing.it', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.it/campagne/'] },

  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery (gida-market) — 16 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Esselunga', websiteUrl: 'https://www.esselunga.it', categorySlug: 'gida-market', seedUrls: ['https://www.esselunga.it/cms/offerte/offerte-e-promozioni.html', 'https://www.esselunga.it/cms/offerte/volantino.html'] },
  { name: 'Conad', websiteUrl: 'https://www.conad.it', categorySlug: 'gida-market', seedUrls: ['https://www.conad.it/offerte-e-promozioni', 'https://www.conad.it/volantino'] },
  { name: 'Lidl IT', websiteUrl: 'https://www.lidl.it', categorySlug: 'gida-market', seedUrls: ['https://www.lidl.it/offerte', 'https://www.lidl.it/assortimento'] },
  { name: 'Aldi IT', websiteUrl: 'https://www.aldi.it', categorySlug: 'gida-market', seedUrls: ['https://www.aldi.it/offerte.html'] },
  { name: 'Despar IT', websiteUrl: 'https://www.despar.it', categorySlug: 'gida-market', seedUrls: ['https://www.despar.it/offerte/', 'https://www.despar.it/volantino/'] },
  { name: 'Bennet', websiteUrl: 'https://www.bennet.com', categorySlug: 'gida-market', seedUrls: ['https://www.bennet.com/volantino', 'https://www.bennet.com/offerte'] },
  { name: 'Sigma IT', websiteUrl: 'https://www.supersigma.com', categorySlug: 'gida-market', seedUrls: ['https://www.supersigma.com/offerte/', 'https://www.supersigma.com/volantino/'] },
  { name: 'Iper La Grande i', websiteUrl: 'https://www.iper.it', categorySlug: 'gida-market', seedUrls: ['https://www.iper.it/offerte', 'https://www.iper.it/volantino'] },
  { name: 'Famila IT', websiteUrl: 'https://www.famila.it', categorySlug: 'gida-market', seedUrls: ['https://www.famila.it/offerte/', 'https://www.famila.it/volantino/'] },
  { name: 'Tigros', websiteUrl: 'https://www.tigros.it', categorySlug: 'gida-market', seedUrls: ['https://www.tigros.it/offerte/'] },
  { name: 'Eataly', websiteUrl: 'https://www.eataly.net/it_it', categorySlug: 'gida-market', seedUrls: ['https://www.eataly.net/it_it/promozioni'] },
  { name: 'EasyCoop', websiteUrl: 'https://www.easycoop.com', categorySlug: 'gida-market', seedUrls: ['https://www.easycoop.com/offerte'] },
  { name: 'Supermercato24', websiteUrl: 'https://www.everli.com/it', categorySlug: 'gida-market', seedUrls: ['https://www.everli.com/it/offerte'] },
  { name: 'Pewex', websiteUrl: 'https://www.pewex.it', categorySlug: 'gida-market', seedUrls: ['https://www.pewex.it/offerte/'] },
  { name: 'Unes Supermercati', websiteUrl: 'https://www.unes.it', categorySlug: 'gida-market', seedUrls: ['https://www.unes.it/offerte/', 'https://www.unes.it/volantino/'] },
  { name: 'Crai IT', websiteUrl: 'https://www.crai-supermercati.it', categorySlug: 'gida-market', seedUrls: ['https://www.crai-supermercati.it/offerte', 'https://www.crai-supermercati.it/volantino'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Drink (yeme-icme) — 18 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Deliveroo IT', websiteUrl: 'https://deliveroo.it', categorySlug: 'yeme-icme', seedUrls: ['https://deliveroo.it/it/offerte'] },
  { name: 'Glovo IT', websiteUrl: 'https://glovoapp.com/it/it', categorySlug: 'yeme-icme', seedUrls: ['https://glovoapp.com/it/it/promozioni'] },
  { name: 'Uber Eats IT', websiteUrl: 'https://www.ubereats.com/it', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/it/offers'] },
  { name: 'Starbucks IT', websiteUrl: 'https://www.starbucks.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.it/promozioni'] },
  { name: 'Subway IT', websiteUrl: 'https://www.subway.com/it-IT', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/it-IT/promozioni'] },
  { name: 'Old Wild West', websiteUrl: 'https://www.oldwildwest.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.oldwildwest.it/promozioni/'] },
  { name: 'Roadhouse IT', websiteUrl: 'https://www.roadhouse.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.roadhouse.it/promozioni/'] },
  { name: 'Illy', websiteUrl: 'https://www.illy.com/it-it', categorySlug: 'yeme-icme', seedUrls: ['https://www.illy.com/it-it/offerte'] },
  { name: 'Nespresso IT', websiteUrl: 'https://www.nespresso.com/it/it', categorySlug: 'yeme-icme', seedUrls: ['https://www.nespresso.com/it/it/offerte'] },
  { name: 'Caffè Borbone', websiteUrl: 'https://www.caffeborbone.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.caffeborbone.com/offerte/'] },
  { name: 'Caffè Vergnano', websiteUrl: 'https://www.caffevergnano.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.caffevergnano.com/promozioni/'] },
  { name: 'Esselunga a Casa', websiteUrl: 'https://www.esselungaacasa.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.esselungaacasa.it/offerte/'] },
  { name: 'Vino.com', websiteUrl: 'https://www.vino.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.vino.com/offerte/', 'https://www.vino.com/promozioni/'] },
  { name: 'Callmewine', websiteUrl: 'https://www.callmewine.com/it', categorySlug: 'yeme-icme', seedUrls: ['https://www.callmewine.com/it/offerte.html'] },
  { name: 'Bernini Pasta', websiteUrl: 'https://www.dececco.com/it-it', categorySlug: 'yeme-icme', seedUrls: ['https://www.dececco.com/it-it/promozioni'] },
  { name: 'Rossopomodoro', websiteUrl: 'https://www.rossopomodoro.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.rossopomodoro.it/promozioni/'] },
  { name: 'Alice Pizza', websiteUrl: 'https://www.alicepizza.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.alicepizza.it/promozioni/'] },
  { name: 'Spontini', websiteUrl: 'https://www.spontinipizza.it', categorySlug: 'yeme-icme', seedUrls: ['https://www.spontinipizza.it/promozioni/'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty (kozmetik-kisisel-bakim) — 20 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Kiko Milano', websiteUrl: 'https://www.kikocosmetics.com/it-it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.kikocosmetics.com/it-it/offerte/', 'https://www.kikocosmetics.com/it-it/saldi/'] },
  { name: 'Sephora IT', websiteUrl: 'https://www.sephora.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.it/offerte/', 'https://www.sephora.it/saldi/'] },
  { name: 'Douglas IT', websiteUrl: 'https://www.douglas.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.douglas.it/it/c/offerte/', 'https://www.douglas.it/it/c/saldi/'] },
  { name: 'MAC Cosmetics IT', websiteUrl: 'https://www.maccosmetics.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.it/offerte'] },
  { name: 'Clinique IT', websiteUrl: 'https://www.clinique.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.it/offerte'] },
  { name: 'Estée Lauder IT', websiteUrl: 'https://www.esteelauder.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.esteelauder.it/offerte'] },
  { name: 'Yves Rocher IT', websiteUrl: 'https://www.yves-rocher.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.yves-rocher.it/offerte', 'https://www.yves-rocher.it/promozioni'] },
  { name: 'Pupa Milano', websiteUrl: 'https://www.pupa.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pupa.it/offerte/', 'https://www.pupa.it/promozioni/'] },
  { name: 'Deborah Milano', websiteUrl: 'https://www.deborahmilano.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.deborahmilano.com/offerte/'] },
  { name: 'Wycon Cosmetics', websiteUrl: 'https://www.wyconcosmetics.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.wyconcosmetics.com/saldi/'] },
  { name: 'The Body Shop IT', websiteUrl: 'https://www.thebodyshop.com/it-it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com/it-it/offerte', 'https://www.thebodyshop.com/it-it/saldi'] },
  { name: 'Lush IT', websiteUrl: 'https://www.lush.com/it/it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lush.com/it/it/offerte'] },
  { name: 'Dr. Scholl IT', websiteUrl: 'https://www.drscholl.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.drscholl.it/offerte/'] },
  { name: 'Farmaè', websiteUrl: 'https://www.farmae.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmae.it/offerte.html'] },
  { name: 'Farmacia Loreto', websiteUrl: 'https://www.farmacialoreto.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmacialoreto.it/offerte'] },
  { name: 'Farmacosmo', websiteUrl: 'https://www.farmacosmo.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.farmacosmo.it/offerte/'] },
  { name: 'Nuxe IT', websiteUrl: 'https://www.nuxe.com/it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nuxe.com/it/offerte/'] },
  { name: 'Bioderma IT', websiteUrl: 'https://www.bioderma.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioderma.it/promozioni'] },
  { name: 'Avène IT', websiteUrl: 'https://www.eau-thermale-avene.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eau-thermale-avene.it/promozioni'] },
  { name: 'Abiby', websiteUrl: 'https://www.abiby.it', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.abiby.it/offerte/'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor (spor-outdoor) — 17 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Decathlon IT', websiteUrl: 'https://www.decathlon.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.it/saldi.html', 'https://www.decathlon.it/offerte.html'] },
  { name: 'Cisalfa Sport', websiteUrl: 'https://www.cisalfasport.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.cisalfasport.it/saldi/', 'https://www.cisalfasport.it/offerte/'] },
  { name: 'Sportler', websiteUrl: 'https://www.sportler.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.sportler.com/it/outlet/', 'https://www.sportler.com/it/offerte/'] },
  { name: 'Foot Locker IT', websiteUrl: 'https://www.footlocker.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.footlocker.it/it/saldi', 'https://www.footlocker.it/it/offerte'] },
  { name: 'Puma IT', websiteUrl: 'https://it.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://it.puma.com/it/it/saldi'] },
  { name: 'Reebok IT', websiteUrl: 'https://www.reebok.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.it/saldi'] },
  { name: 'ASICS IT', websiteUrl: 'https://www.asics.com/it/it-it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com/it/it-it/outlet/'] },
  { name: 'Fila IT', websiteUrl: 'https://www.fila.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.com/it/saldi/'] },
  { name: 'Lotto Sport', websiteUrl: 'https://www.lottosport.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lottosport.com/it/outlet/'] },
  { name: 'Kappa IT', websiteUrl: 'https://www.kappa.com/it/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.kappa.com/it/it/saldi/'] },
  { name: 'Superga IT', websiteUrl: 'https://www.superga.com/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.superga.com/it/saldi/'] },
  { name: 'The North Face IT', websiteUrl: 'https://www.thenorthface.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.thenorthface.it/saldi.html'] },
  { name: 'Columbia IT', websiteUrl: 'https://www.columbiasportswear.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbiasportswear.it/it/saldi/'] },
  { name: 'Napapijri IT', websiteUrl: 'https://www.napapijri.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.napapijri.it/saldi.html'] },
  { name: 'Ellesse IT', websiteUrl: 'https://www.ellesse.com/it/it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ellesse.com/it/it/saldi/'] },
  { name: 'Lululemon IT', websiteUrl: 'https://www.lululemon.it', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lululemon.it/it-it/c/we-made-too-much/'] },
  { name: 'Maxi Sport', websiteUrl: 'https://www.maxisport.com', categorySlug: 'spor-outdoor', seedUrls: ['https://www.maxisport.com/saldi/', 'https://www.maxisport.com/offerte/'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport (seyahat-ulasim) — 16 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'ITA Airways', websiteUrl: 'https://www.ita-airways.com/it-it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.ita-airways.com/it-it/offerte'] },
  { name: 'Italo Treno', websiteUrl: 'https://www.italotreno.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.italotreno.it/offerte', 'https://www.italotreno.it/promozioni'] },
  { name: 'Flixbus IT', websiteUrl: 'https://www.flixbus.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.flixbus.it/offerte'] },
  { name: 'Booking.com IT', websiteUrl: 'https://www.booking.com/it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.it.html'] },
  { name: 'Hotels.com IT', websiteUrl: 'https://it.hotels.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://it.hotels.com/deals/'] },
  { name: 'Airbnb IT', websiteUrl: 'https://www.airbnb.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.it/'] },
  { name: 'eDreams IT', websiteUrl: 'https://www.edreams.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.edreams.it/offerte/'] },
  { name: 'EasyJet IT', websiteUrl: 'https://www.easyjet.com/it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.easyjet.com/it/offerte'] },
  { name: 'Vueling IT', websiteUrl: 'https://www.vueling.com/it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vueling.com/it/offerte-voli'] },
  { name: 'Tirrenia', websiteUrl: 'https://www.tirrenia.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.tirrenia.it/offerte/'] },
  { name: 'Moby Lines', websiteUrl: 'https://www.moby.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.moby.it/offerte/'] },
  { name: 'GNV IT', websiteUrl: 'https://www.gnv.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.gnv.it/offerte'] },
  { name: 'Sardinia Ferries', websiteUrl: 'https://www.corsica-ferries.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.corsica-ferries.it/offerte-traghetti.html'] },
  { name: 'MSC Crociere', websiteUrl: 'https://www.msccrociere.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.msccrociere.it/it-it/Offerte-Crociera.aspx'] },
  { name: 'Alitalia Loyalty', websiteUrl: 'https://www.vfrequentflyer.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.vfrequentflyer.com/promozioni/'] },
  { name: 'Viaggiare IT', websiteUrl: 'https://www.viaggiare.it', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.viaggiare.it/offerte/'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance (finans) — 18 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Intesa Sanpaolo', websiteUrl: 'https://www.intesasanpaolo.com', categorySlug: 'finans', seedUrls: ['https://www.intesasanpaolo.com/it/persone-e-famiglie/promozioni.html'] },
  { name: 'UniCredit IT', websiteUrl: 'https://www.unicredit.it', categorySlug: 'finans', seedUrls: ['https://www.unicredit.it/it/privati/promozioni.html'] },
  { name: 'Poste Italiane', websiteUrl: 'https://www.poste.it', categorySlug: 'finans', seedUrls: ['https://www.poste.it/promozioni.html'] },
  { name: 'BancoPosta', websiteUrl: 'https://www.poste.it/bancoposta.html', categorySlug: 'finans', seedUrls: ['https://www.poste.it/promozioni-bancoposta.html'] },
  { name: 'Fineco Bank', websiteUrl: 'https://www.finecobank.com', categorySlug: 'finans', seedUrls: ['https://www.finecobank.com/it/online/promozioni.html'] },
  { name: 'Mediolanum', websiteUrl: 'https://www.bancamediolanum.it', categorySlug: 'finans', seedUrls: ['https://www.bancamediolanum.it/promozioni'] },
  { name: 'ING Italia', websiteUrl: 'https://www.ing.it', categorySlug: 'finans', seedUrls: ['https://www.ing.it/promozioni.html'] },
  { name: 'Widiba', websiteUrl: 'https://www.widiba.it', categorySlug: 'finans', seedUrls: ['https://www.widiba.it/it/promozioni'] },
  { name: 'Buddybank', websiteUrl: 'https://www.buddybank.com', categorySlug: 'finans', seedUrls: ['https://www.buddybank.com/promozioni/'] },
  { name: 'N26 IT', websiteUrl: 'https://n26.com/it-it', categorySlug: 'finans', seedUrls: ['https://n26.com/it-it/promozioni'] },
  { name: 'Satispay', websiteUrl: 'https://www.satispay.com/it-it', categorySlug: 'finans', seedUrls: ['https://www.satispay.com/it-it/promozioni/'] },
  { name: 'Facile.it', websiteUrl: 'https://www.facile.it', categorySlug: 'finans', seedUrls: ['https://www.facile.it/mutui.html', 'https://www.facile.it/conti-correnti.html'] },
  { name: 'SOStariffe IT', websiteUrl: 'https://www.sostariffe.it', categorySlug: 'finans', seedUrls: ['https://www.sostariffe.it/conti-correnti/', 'https://www.sostariffe.it/prestiti/'] },
  { name: 'Banca Sella', websiteUrl: 'https://www.sella.it', categorySlug: 'finans', seedUrls: ['https://www.sella.it/banca-on-line/promozioni'] },
  { name: 'Credem', websiteUrl: 'https://www.credem.it', categorySlug: 'finans', seedUrls: ['https://www.credem.it/promozioni/'] },
  { name: 'Monte dei Paschi', websiteUrl: 'https://www.mps.it', categorySlug: 'finans', seedUrls: ['https://www.mps.it/promozioni'] },
  { name: 'Banco BPM', websiteUrl: 'https://www.bancobpm.it', categorySlug: 'finans', seedUrls: ['https://www.bancobpm.it/promozioni/'] },
  { name: 'Trade Republic IT', websiteUrl: 'https://traderepublic.com/it-it', categorySlug: 'finans', seedUrls: ['https://traderepublic.com/it-it'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance (sigorta) — 10 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Generali Italia', websiteUrl: 'https://www.generali.it', categorySlug: 'sigorta', seedUrls: ['https://www.generali.it/promozioni'] },
  { name: 'UnipolSai', websiteUrl: 'https://www.unipolsai.it', categorySlug: 'sigorta', seedUrls: ['https://www.unipolsai.it/promozioni', 'https://www.unipolsai.it/offerte'] },
  { name: 'Zurich IT', websiteUrl: 'https://www.zurich.it', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.it/promozioni'] },
  { name: 'AXA Italia', websiteUrl: 'https://www.axa.it', categorySlug: 'sigorta', seedUrls: ['https://www.axa.it/promozioni'] },
  { name: 'Cattolica Assicurazioni', websiteUrl: 'https://www.cattolica.it', categorySlug: 'sigorta', seedUrls: ['https://www.cattolica.it/promozioni'] },
  { name: 'Verti IT', websiteUrl: 'https://www.verti.it', categorySlug: 'sigorta', seedUrls: ['https://www.verti.it/promozioni/', 'https://www.verti.it/offerte/'] },
  { name: 'Quixa', websiteUrl: 'https://www.quixa.it', categorySlug: 'sigorta', seedUrls: ['https://www.quixa.it/promozioni/'] },
  { name: 'MetLife IT', websiteUrl: 'https://www.metlife.it', categorySlug: 'sigorta', seedUrls: ['https://www.metlife.it/promozioni/'] },
  { name: 'Sara Assicurazioni', websiteUrl: 'https://www.sara.it', categorySlug: 'sigorta', seedUrls: ['https://www.sara.it/promozioni/'] },
  { name: 'Helvetia IT', websiteUrl: 'https://www.helvetia.com/it/web/it', categorySlug: 'sigorta', seedUrls: ['https://www.helvetia.com/it/web/it/promozioni.html'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive (otomobil) — 17 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Volkswagen IT', websiteUrl: 'https://www.volkswagen.it', categorySlug: 'otomobil', seedUrls: ['https://www.volkswagen.it/it/offerte.html'] },
  { name: 'BMW IT', websiteUrl: 'https://www.bmw.it', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.it/it/offerte.html'] },
  { name: 'Audi IT', websiteUrl: 'https://www.audi.it', categorySlug: 'otomobil', seedUrls: ['https://www.audi.it/it/web/it/offerte.html'] },
  { name: 'Kia IT', websiteUrl: 'https://www.kia.com/it', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com/it/offerte/'] },
  { name: 'Ford IT', websiteUrl: 'https://www.ford.it', categorySlug: 'otomobil', seedUrls: ['https://www.ford.it/offerte'] },
  { name: 'Peugeot IT', websiteUrl: 'https://www.peugeot.it', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.it/offerte.html'] },
  { name: 'Citroën IT', websiteUrl: 'https://www.citroen.it', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.it/offerte.html'] },
  { name: 'SEAT IT', websiteUrl: 'https://www.seat.it', categorySlug: 'otomobil', seedUrls: ['https://www.seat.it/offerte.html'] },
  { name: 'Škoda IT', websiteUrl: 'https://www.skoda.it', categorySlug: 'otomobil', seedUrls: ['https://www.skoda.it/offerte'] },
  { name: 'Suzuki IT', websiteUrl: 'https://www.suzuki.it', categorySlug: 'otomobil', seedUrls: ['https://auto.suzuki.it/offerte'] },
  { name: 'Jeep IT', websiteUrl: 'https://www.jeep.it', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.it/offerte'] },
  { name: 'Volvo IT', websiteUrl: 'https://www.volvocars.com/it', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/it/offerte/'] },
  { name: 'Maserati', websiteUrl: 'https://www.maserati.com/it/it', categorySlug: 'otomobil', seedUrls: ['https://www.maserati.com/it/it/shopping-tools/offerte'] },
  { name: 'Lamborghini', websiteUrl: 'https://www.lamborghini.com/it-en', categorySlug: 'otomobil', seedUrls: ['https://www.lamborghini.com/it-en/models'] },
  { name: 'AutoScout24 IT', websiteUrl: 'https://www.autoscout24.it', categorySlug: 'otomobil', seedUrls: ['https://www.autoscout24.it/offerte/', 'https://www.autoscout24.it/promozioni/'] },
  { name: 'Subaru IT', websiteUrl: 'https://www.subaru.it', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.it/offerte.html'] },
  { name: 'Dacia IT', websiteUrl: 'https://www.dacia.it', categorySlug: 'otomobil', seedUrls: ['https://www.dacia.it/offerte.html'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies (kitap-hobi) — 7 more brands
  // ═══════════════════════════════════════════════════════
  { name: 'Hoepli', websiteUrl: 'https://www.hoepli.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hoepli.it/offerte/', 'https://www.hoepli.it/promozioni/'] },
  { name: 'Il Libraccio Online', websiteUrl: 'https://www.illibraccio.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.illibraccio.it/offerte/'] },
  { name: 'Giochi Preziosi', websiteUrl: 'https://www.giochipreziosi.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.giochipreziosi.it/offerte/', 'https://www.giochipreziosi.it/promozioni/'] },
  { name: 'Chegiochi', websiteUrl: 'https://www.chegiochi.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.chegiochi.it/offerte/'] },
  { name: 'Amazon Prime Video IT', websiteUrl: 'https://www.primevideo.com/region/eu', categorySlug: 'kitap-hobi', seedUrls: ['https://www.primevideo.com/offers/'] },
  { name: 'NOW TV IT', websiteUrl: 'https://www.nowtv.it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.nowtv.it/offerte', 'https://www.nowtv.it/promozioni'] },
  { name: 'Paramount+ IT', websiteUrl: 'https://www.paramountplus.com/it', categorySlug: 'kitap-hobi', seedUrls: ['https://www.paramountplus.com/it/offers/'] },

  // ═══════════════════════════════════════════════════════
  // BONUS: Telco & Utilities (alisveris category — IT telecom brands)
  // ═══════════════════════════════════════════════════════
  { name: 'TIM IT', websiteUrl: 'https://www.tim.it', categorySlug: 'alisveris', seedUrls: ['https://www.tim.it/offerte', 'https://www.tim.it/promozioni'] },
  { name: 'Vodafone IT', websiteUrl: 'https://www.vodafone.it', categorySlug: 'alisveris', seedUrls: ['https://www.vodafone.it/offerte.html'] },
  { name: 'Wind Tre', websiteUrl: 'https://www.windtre.it', categorySlug: 'alisveris', seedUrls: ['https://www.windtre.it/offerte-mobile/', 'https://www.windtre.it/offerte-fibra/'] },
  { name: 'Iliad IT', websiteUrl: 'https://www.iliad.it', categorySlug: 'alisveris', seedUrls: ['https://www.iliad.it/offerta.html'] },
  { name: 'Fastweb', websiteUrl: 'https://www.fastweb.it', categorySlug: 'alisveris', seedUrls: ['https://www.fastweb.it/internet/offerte-fibra/', 'https://www.fastweb.it/smartphone/offerte-mobile/'] },
  { name: 'PosteMobile', websiteUrl: 'https://www.postemobile.it', categorySlug: 'alisveris', seedUrls: ['https://www.postemobile.it/offerte'] },
  { name: 'ho. Mobile', websiteUrl: 'https://www.ho-mobile.it', categorySlug: 'alisveris', seedUrls: ['https://www.ho-mobile.it/offerta.html'] },
  { name: 'Kena Mobile', websiteUrl: 'https://www.kenamobile.it', categorySlug: 'alisveris', seedUrls: ['https://www.kenamobile.it/offerte/'] },
  { name: 'Very Mobile', websiteUrl: 'https://www.verymobile.it', categorySlug: 'alisveris', seedUrls: ['https://www.verymobile.it/offerte'] },
  { name: 'Spusu IT', websiteUrl: 'https://www.spusu.it', categorySlug: 'alisveris', seedUrls: ['https://www.spusu.it/offerte'] },
  { name: 'Tiscali', websiteUrl: 'https://casa.tiscali.it', categorySlug: 'alisveris', seedUrls: ['https://casa.tiscali.it/offerte/'] },
  { name: 'Sky WiFi', websiteUrl: 'https://www.sky.it/offerte/sky-wifi', categorySlug: 'alisveris', seedUrls: ['https://www.sky.it/offerte/sky-wifi'] },
  { name: 'Enel Energia', websiteUrl: 'https://www.enel.it', categorySlug: 'alisveris', seedUrls: ['https://www.enel.it/it/luce-e-gas/offerte'] },
  { name: 'ENI Plenitude', websiteUrl: 'https://eniplenitude.com/it', categorySlug: 'alisveris', seedUrls: ['https://eniplenitude.com/it/offerte'] },
  { name: 'A2A Energia', websiteUrl: 'https://www.a2aenergia.eu', categorySlug: 'alisveris', seedUrls: ['https://www.a2aenergia.eu/offerte'] },
  { name: 'Edison Energia', websiteUrl: 'https://www.edison.it', categorySlug: 'alisveris', seedUrls: ['https://www.edison.it/offerte'] },
  { name: 'Sorgenia', websiteUrl: 'https://www.sorgenia.it', categorySlug: 'alisveris', seedUrls: ['https://www.sorgenia.it/offerte-luce-e-gas'] },
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
  console.log('=== IT Market Supplemental Brand Seed ===\n');
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
        where: { slug_market: { slug, market: 'IT' } },
        update: { name: entry.name, websiteUrl: entry.websiteUrl, categoryId },
        create: { name: entry.name, slug, websiteUrl: entry.websiteUrl, market: 'IT', categoryId },
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
            market: 'IT',
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'IT' },
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

  const totalSources = await prisma.crawlSource.count({ where: { isActive: true, market: 'IT' } });
  console.log(`Total active IT sources: ${totalSources}`);
  console.log('\nDone! Trigger crawling with: POST /admin/crawl/trigger-all?market=IT');
}

main()
  .catch((e) => { console.error('Script error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
