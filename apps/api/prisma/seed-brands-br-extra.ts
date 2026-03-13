import { PrismaClient, CrawlMethod } from '@prisma/client';

const prisma = new PrismaClient();

// ── Portuguese-aware slug generator ──────────────────────
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ã/g, 'a')
    .replace(/á/g, 'a')
    .replace(/â/g, 'a')
    .replace(/é/g, 'e')
    .replace(/ê/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ô/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/ç/g, 'c')
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
  'ev-yasam': 'Home & Living',
  'gida-market': 'Grocery & Market',
  'yeme-icme': 'Food & Dining',
  'kozmetik-kisisel-bakim': 'Beauty & Personal Care',
  'spor-outdoor': 'Sports & Outdoor',
  'seyahat-ulasim': 'Travel & Transport',
  'finans': 'Finance',
  'sigorta': 'Insurance',
  'otomobil': 'Automotive',
  'kitap-hobi': 'Books & Hobbies',
};

// ── EXTRA BR BRANDS (150 new brands) ─────────────────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Enjoei', websiteUrl: 'https://www.enjoei.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.enjoei.com.br'] },
  { name: 'OLX Brasil', websiteUrl: 'https://www.olx.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.olx.com.br'] },
  { name: 'Elo7', websiteUrl: 'https://www.elo7.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.elo7.com.br'] },
  { name: 'Posthaus', websiteUrl: 'https://www.posthaus.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.posthaus.com.br/ofertas'] },
  { name: 'Loja do Mecânico', websiteUrl: 'https://www.lojadomecanico.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.lojadomecanico.com.br/ofertas'] },
  { name: 'GBarbosa', websiteUrl: 'https://www.gbarbosa.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.gbarbosa.com.br'] },
  { name: 'Zattini', websiteUrl: 'https://www.zattini.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.zattini.com.br/ofertas'] },
  { name: 'Cissa Magazine', websiteUrl: 'https://www.cissamagazine.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.cissamagazine.com.br/ofertas'] },
  { name: 'Compra Certa', websiteUrl: 'https://www.compracerta.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.compracerta.com.br/ofertas'] },
  { name: 'WebContinental', websiteUrl: 'https://www.webcontinental.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.webcontinental.com.br/ofertas'] },
  { name: 'Mania Virtual', websiteUrl: 'https://www.maniavirtual.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.maniavirtual.com.br'] },
  { name: 'Atacado Games', websiteUrl: 'https://www.atacadogames.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.atacadogames.com.br/ofertas'] },
  { name: 'Cia dos Livros', websiteUrl: 'https://www.ciadoslivros.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.ciadoslivros.com.br'] },
  { name: 'Shopclub', websiteUrl: 'https://www.shopclub.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.shopclub.com.br'] },
  { name: 'Olist', websiteUrl: 'https://olist.com', categorySlug: 'alisveris', seedUrls: ['https://olist.com'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 12 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Pichau Informática', websiteUrl: 'https://www.pichau.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.pichau.com.br/ofertas'] },
  { name: 'Kalunga', websiteUrl: 'https://www.kalunga.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.kalunga.com.br/ofertas'] },
  { name: 'Positivo Tecnologia', websiteUrl: 'https://www.positivotecnologia.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.positivotecnologia.com.br'] },
  { name: 'Intelbras', websiteUrl: 'https://www.intelbras.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.intelbras.com.br'] },
  { name: 'JBL Store Brasil', websiteUrl: 'https://store.jbl.com.br', categorySlug: 'elektronik', seedUrls: ['https://store.jbl.com.br'] },
  { name: 'Harman Brasil', websiteUrl: 'https://www.harmanaudio.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.harmanaudio.com.br'] },
  { name: 'Wacom Brasil', websiteUrl: 'https://www.wacom.com/pt-br', categorySlug: 'elektronik', seedUrls: ['https://www.wacom.com/pt-br'] },
  { name: 'AOC Brasil', websiteUrl: 'https://www.aoc.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.aoc.com.br'] },
  { name: 'Epson Brasil', websiteUrl: 'https://epson.com.br', categorySlug: 'elektronik', seedUrls: ['https://epson.com.br'] },
  { name: 'Canon Brasil', websiteUrl: 'https://www.canon.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.canon.com.br'] },
  { name: 'Brother Brasil', websiteUrl: 'https://www.brother.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.brother.com.br'] },
  { name: 'Razer Brasil', websiteUrl: 'https://www.razer.com/br-pt', categorySlug: 'elektronik', seedUrls: ['https://www.razer.com/br-pt'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Youcom', websiteUrl: 'https://www.youcom.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.youcom.com.br/promocoes'] },
  { name: 'Riachuelo Moda', websiteUrl: 'https://www.riachuelo.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.riachuelo.com.br/ofertas'] },
  { name: 'Renner Kids', websiteUrl: 'https://www.lojasrenner.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.lojasrenner.com.br/infantil'] },
  { name: 'Caedu', websiteUrl: 'https://www.caedu.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.caedu.com.br/promocoes'] },
  { name: 'Brooksfield', websiteUrl: 'https://www.brooksfield.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.brooksfield.com.br'] },
  { name: 'Dudalina', websiteUrl: 'https://www.dudalina.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.dudalina.com.br/outlet'] },
  { name: 'Ellus', websiteUrl: 'https://www.ellus.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.ellus.com'] },
  { name: 'Forum', websiteUrl: 'https://www.forum.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.forum.com.br'] },
  { name: 'Morena Rosa', websiteUrl: 'https://www.morenarosa.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.morenarosa.com.br'] },
  { name: 'Zinzane', websiteUrl: 'https://www.zinzane.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.zinzane.com.br/outlet'] },
  { name: 'Maria Filó', websiteUrl: 'https://www.mariafilo.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.mariafilo.com.br'] },
  { name: 'Le Lis', websiteUrl: 'https://www.lelis.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.lelis.com.br'] },
  { name: 'Mob', websiteUrl: 'https://www.mob.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.mob.com.br'] },
  { name: 'Cantão', websiteUrl: 'https://www.cantao.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.cantao.com.br'] },
  { name: 'Richards', websiteUrl: 'https://www.richards.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.richards.com.br'] },
  { name: 'Anacapri', websiteUrl: 'https://www.anacapri.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.anacapri.com.br'] },
  { name: 'Via Mia', websiteUrl: 'https://www.viamia.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.viamia.com.br'] },
  { name: 'Lupo', websiteUrl: 'https://www.lupo.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.lupo.com.br/outlet'] },
  { name: 'Malwee', websiteUrl: 'https://www.malwee.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.malwee.com.br'] },
  { name: 'Lunender', websiteUrl: 'https://www.lunender.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.lunender.com.br'] },
  { name: 'Democrata', websiteUrl: 'https://www.democrata.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.democrata.com.br'] },
  { name: 'Piccadilly', websiteUrl: 'https://www.piccadilly.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.piccadilly.com.br/outlet'] },
  { name: 'Vizzano', websiteUrl: 'https://www.vizzano.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.vizzano.com.br'] },
  { name: 'Grendene', websiteUrl: 'https://www.grendene.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.grendene.com.br'] },
  { name: 'Rider', websiteUrl: 'https://www.rider.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.rider.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 4) Spor & Outdoor / Sports & Outdoor — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Penalty', websiteUrl: 'https://www.penalty.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.penalty.com.br'] },
  { name: 'Topper', websiteUrl: 'https://www.topper.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.topper.com.br'] },
  { name: 'Rainha', websiteUrl: 'https://www.rainha.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.rainha.com.br'] },
  { name: 'Mormaii', websiteUrl: 'https://www.mormaii.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mormaii.com.br'] },
  { name: 'Nautika', websiteUrl: 'https://www.nautika.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nautika.com.br'] },
  { name: 'NTK Camping', websiteUrl: 'https://www.ntkcamping.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ntkcamping.com.br'] },
  { name: 'Everlast Brasil', websiteUrl: 'https://www.everlast.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.everlast.com.br'] },
  { name: 'Netshoes Oficial', websiteUrl: 'https://www.netshoes.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.netshoes.com.br/ofertas'] },
  { name: 'Surf Center', websiteUrl: 'https://www.surfcenter.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.surfcenter.com.br'] },
  { name: 'Garupas', websiteUrl: 'https://www.garupas.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.garupas.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 5) Kozmetik & Kişisel Bakım / Beauty — 15 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Quem Disse Berenice', websiteUrl: 'https://www.quemdisseberenice.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.quemdisseberenice.com.br/promocoes'] },
  { name: 'MAC Cosméticos', websiteUrl: 'https://www.maccosmetics.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.br'] },
  { name: 'Clinique Brasil', websiteUrl: 'https://www.clinique.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.clinique.com.br'] },
  { name: 'Dermatus', websiteUrl: 'https://www.dermatus.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dermatus.com.br'] },
  { name: 'Bio Extratus', websiteUrl: 'https://www.bioextratus.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bioextratus.com.br'] },
  { name: 'Skala Cosméticos', websiteUrl: 'https://www.skala.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.skala.com.br'] },
  { name: 'Lola Cosmetics', websiteUrl: 'https://www.lolacosmetics.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.lolacosmetics.com.br'] },
  { name: 'QDB Pro', websiteUrl: 'https://www.qdbpro.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.qdbpro.com.br'] },
  { name: 'Dailus', websiteUrl: 'https://www.dailus.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dailus.com.br'] },
  { name: 'Tracta', websiteUrl: 'https://www.tracta.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.tracta.com.br'] },
  { name: 'Boni Natural', websiteUrl: 'https://www.bfranca.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.bfranca.com.br'] },
  { name: 'Simple Organic', websiteUrl: 'https://www.simpleorganic.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.simpleorganic.com.br'] },
  { name: 'Truss Professional', websiteUrl: 'https://www.truss.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.truss.com.br'] },
  { name: 'Wella Brasil', websiteUrl: 'https://www.wella.com/pt-br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.wella.com/pt-br'] },
  { name: 'Risqué', websiteUrl: 'https://www.risque.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.risque.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 6) Ev & Yaşam / Home & Living — 12 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Tok&Stok', websiteUrl: 'https://www.tokstok.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.tokstok.com.br/ofertas'] },
  { name: 'Consul Eletro', websiteUrl: 'https://loja.consul.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://loja.consul.com.br/ofertas'] },
  { name: 'Brastemp Loja', websiteUrl: 'https://loja.brastemp.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://loja.brastemp.com.br/ofertas'] },
  { name: 'Karsten', websiteUrl: 'https://www.karsten.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.karsten.com.br/outlet'] },
  { name: 'Buddemeyer', websiteUrl: 'https://www.buddemeyer.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.buddemeyer.com.br'] },
  { name: 'Camesa', websiteUrl: 'https://www.camesa.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.camesa.com.br'] },
  { name: 'Leroy Merlin Loja', websiteUrl: 'https://www.leroymerlin.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.leroymerlin.com.br/ofertas'] },
  { name: 'C&C Casa', websiteUrl: 'https://www.cec.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.cec.com.br/ofertas'] },
  { name: 'Tumelero', websiteUrl: 'https://www.tumelero.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.tumelero.com.br'] },
  { name: 'Vivara', websiteUrl: 'https://www.vivara.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.vivara.com.br/promocoes'] },
  { name: 'Zelo', websiteUrl: 'https://www.zelo.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.zelo.com.br'] },
  { name: 'Loja Electrolux', websiteUrl: 'https://loja.electrolux.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://loja.electrolux.com.br/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 7) Gıda & Market / Grocery — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Condor Super Center', websiteUrl: 'https://www.condor.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.condor.com.br'] },
  { name: 'Muffato', websiteUrl: 'https://www.supermuffato.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.supermuffato.com.br'] },
  { name: 'Super Nosso Delivery', websiteUrl: 'https://delivery.supernosso.com.br', categorySlug: 'gida-market', seedUrls: ['https://delivery.supernosso.com.br'] },
  { name: 'Angeloni', websiteUrl: 'https://www.angeloni.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.angeloni.com.br'] },
  { name: 'Coop', websiteUrl: 'https://www.coopsp.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.coopsp.com.br'] },
  { name: 'Nagumo', websiteUrl: 'https://www.nagumo.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.nagumo.com.br'] },
  { name: 'Covabra', websiteUrl: 'https://www.covabra.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.covabra.com.br'] },
  { name: 'Shibata', websiteUrl: 'https://www.shibata.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.shibata.com.br'] },
  { name: 'Supermercados Mundial', websiteUrl: 'https://www.supermundial.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.supermundial.com.br'] },
  { name: 'Zaffari', websiteUrl: 'https://www.zfraga.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.zfraga.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 8) Yeme-İçme / Food & Dining — 12 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Madero Restaurantes', websiteUrl: 'https://www.madero.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.madero.com.br'] },
  { name: 'Habib\'s Restaurantes', websiteUrl: 'https://www.habibs.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.habibs.com.br/promocoes'] },
  { name: 'Vivenda do Camarão', websiteUrl: 'https://www.vivendadocamarao.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.vivendadocamarao.com.br'] },
  { name: 'Fogo de Chão', websiteUrl: 'https://fogodechao.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://fogodechao.com.br'] },
  { name: 'Cacau Show', websiteUrl: 'https://www.cacaushow.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.cacaushow.com.br/promocoes'] },
  { name: 'Kopenhagen', websiteUrl: 'https://www.kopenhagen.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.kopenhagen.com.br'] },
  { name: 'Chocolates Brasil Cacau', websiteUrl: 'https://www.brasilcacau.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.brasilcacau.com.br'] },
  { name: 'Bella Gula', websiteUrl: 'https://www.bellagula.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.bellagula.com.br'] },
  { name: 'Paris 6', websiteUrl: 'https://www.paris6.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.paris6.com.br'] },
  { name: 'Mania de Churrasco', websiteUrl: 'https://www.maniadechurrasco.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.maniadechurrasco.com.br'] },
  { name: 'Montana Grill', websiteUrl: 'https://www.montanagrill.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.montanagrill.com.br'] },
  { name: 'Rei do Mate', websiteUrl: 'https://www.reidomate.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.reidomate.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel — 8 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Voepass', websiteUrl: 'https://www.voepass.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.voepass.com.br'] },
  { name: 'Hotel Urbano', websiteUrl: 'https://www.hotelurbano.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hotelurbano.com/promocoes'] },
  { name: 'Zarpo', websiteUrl: 'https://www.zarpo.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.zarpo.com.br/ofertas'] },
  { name: 'Guichê Virtual', websiteUrl: 'https://www.guichevirtual.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.guichevirtual.com.br'] },
  { name: 'Rodoviária Online', websiteUrl: 'https://www.rodoviariaonline.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.rodoviariaonline.com.br'] },
  { name: 'MSC Cruzeiros', websiteUrl: 'https://www.msccruzeiros.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.msccruzeiros.com.br/ofertas'] },
  { name: 'Pinguim', websiteUrl: 'https://www.pinguim.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.pinguim.com.br'] },
  { name: 'ViajaNet Pacotes', websiteUrl: 'https://www.viajanet.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.viajanet.com.br/pacotes'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance — 10 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Banco Pan', websiteUrl: 'https://www.bancopan.com.br', categorySlug: 'finans', seedUrls: ['https://www.bancopan.com.br'] },
  { name: 'Banco Original', websiteUrl: 'https://www.original.com.br', categorySlug: 'finans', seedUrls: ['https://www.original.com.br'] },
  { name: 'Banco Safra', websiteUrl: 'https://www.safra.com.br', categorySlug: 'finans', seedUrls: ['https://www.safra.com.br'] },
  { name: 'Banco Daycoval', websiteUrl: 'https://www.daycoval.com.br', categorySlug: 'finans', seedUrls: ['https://www.daycoval.com.br'] },
  { name: 'Banco BMG', websiteUrl: 'https://www.bancobmg.com.br', categorySlug: 'finans', seedUrls: ['https://www.bancobmg.com.br'] },
  { name: 'Will Bank', websiteUrl: 'https://www.willbank.com.br', categorySlug: 'finans', seedUrls: ['https://www.willbank.com.br'] },
  { name: 'Agibank', websiteUrl: 'https://www.agibank.com.br', categorySlug: 'finans', seedUrls: ['https://www.agibank.com.br'] },
  { name: 'Pagbank Ofertas', websiteUrl: 'https://pagseguro.uol.com.br', categorySlug: 'finans', seedUrls: ['https://pagseguro.uol.com.br'] },
  { name: 'Cresol', websiteUrl: 'https://www.cresol.com.br', categorySlug: 'finans', seedUrls: ['https://www.cresol.com.br'] },
  { name: 'Genial Investimentos', websiteUrl: 'https://www.genialinvestimentos.com.br', categorySlug: 'finans', seedUrls: ['https://www.genialinvestimentos.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 5 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Azul Seguros', websiteUrl: 'https://www.azulseguros.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.azulseguros.com.br'] },
  { name: 'Sura Seguros', websiteUrl: 'https://segurossura.com.br', categorySlug: 'sigorta', seedUrls: ['https://segurossura.com.br'] },
  { name: 'Sompo Seguros', websiteUrl: 'https://www.sompo.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.sompo.com.br'] },
  { name: 'Zurich Vida', websiteUrl: 'https://www.zurich.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.com.br'] },
  { name: 'Caixa Previdência', websiteUrl: 'https://www.caixavidaeprevidencia.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.caixavidaeprevidencia.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 8 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Caoa', websiteUrl: 'https://www.caoa.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.caoa.com.br/ofertas'] },
  { name: 'JAC Motors Brasil', websiteUrl: 'https://www.jacmotors.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.jacmotors.com.br'] },
  { name: 'Citroën Ofertas', websiteUrl: 'https://www.citroen.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.com.br/ofertas.html'] },
  { name: 'Kia Brasil', websiteUrl: 'https://www.kia.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.kia.com.br/ofertas'] },
  { name: 'Suzuki Brasil', websiteUrl: 'https://www.suzuki.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.suzuki.com.br'] },
  { name: 'Mitsubishi Brasil', websiteUrl: 'https://www.mitsubishimotors.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.mitsubishimotors.com.br/ofertas'] },
  { name: 'Subaru Brasil', websiteUrl: 'https://www.subaru.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.subaru.com.br'] },
  { name: 'RAM Brasil', websiteUrl: 'https://www.ram.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.ram.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 8 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon Livros BR', websiteUrl: 'https://www.amazon.com.br/livros', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.br/gp/bestsellers/books'] },
  { name: 'Leitura Livraria', websiteUrl: 'https://www.leitura.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.leitura.com.br/promocoes'] },
  { name: 'Martin Fontes', websiteUrl: 'https://www.martinsfontespaulista.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.martinsfontespaulista.com.br'] },
  { name: 'Loja PBKIDS', websiteUrl: 'https://www.pbkids.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.pbkids.com.br/ofertas'] },
  { name: 'Estrela Brinquedos', websiteUrl: 'https://www.estrela.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.estrela.com.br'] },
  { name: 'MP Brinquedos', websiteUrl: 'https://www.mpbrinquedos.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mpbrinquedos.com.br/ofertas'] },
  { name: 'Pais & Filhos', websiteUrl: 'https://www.paisefilhos.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.paisefilhos.com.br'] },
  { name: 'Grow Jogos', websiteUrl: 'https://www.grow.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.grow.com.br'] },
];

// ── MAIN ──────────────────────────────────────────────────
async function main() {
  console.log(`\n🇧🇷 Seeding ${BRANDS.length} EXTRA BR brands …\n`);

  // 1. Ensure categories exist
  const catSlugs = [...new Set(BRANDS.map((b) => b.categorySlug))];
  for (const slug of catSlugs) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { slug, name: CATEGORY_NAME_EN[slug] ?? slug },
    });
  }
  console.log(`Categories OK: ${catSlugs.join(', ')}\n`);

  // 2. Deduplicate within the list
  const seen = new Set<string>();
  const uniqueBrands = BRANDS.filter((b) => {
    const slug = toSlug(b.name);
    if (seen.has(slug)) {
      console.log(`  SKIP duplicate in list: ${b.name} (${slug})`);
      return false;
    }
    seen.add(slug);
    return true;
  });

  // 3. Upsert brands + crawl sources
  let brandsOk = 0;
  let sourcesCreated = 0;
  let sourcesUpdated = 0;
  let errors = 0;

  for (const entry of uniqueBrands) {
    const slug = toSlug(entry.name);
    try {
      // Upsert brand
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'BR' } },
        update: { websiteUrl: entry.websiteUrl },
        create: {
          name: entry.name,
          slug,
          market: 'BR',
          websiteUrl: entry.websiteUrl,
          isActive: true,
          category: { connect: { slug: entry.categorySlug } },
        },
      });

      // Upsert crawl source
      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, market: 'BR' },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            name: `${entry.name} BR`,
            crawlMethod: CrawlMethod.CAMPAIGN,
            seedUrls: entry.seedUrls,
            brandId: brand.id,
            market: 'BR',
            maxDepth: 2,
            schedule: '0 */8 * * *',
            agingDays: 7,
            isActive: true,
          },
        });
        sourcesCreated++;
      } else {
        const urlsChanged = JSON.stringify(existingSource.seedUrls) !== JSON.stringify(entry.seedUrls);
        if (urlsChanged) {
          await prisma.crawlSource.update({
            where: { id: existingSource.id },
            data: { seedUrls: entry.seedUrls, market: 'BR' },
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

  const totalBRBrands = await prisma.brand.count({ where: { market: 'BR' } });
  const totalBRSources = await prisma.crawlSource.count({ where: { market: 'BR', isActive: true } });
  console.log(`Total BR brands:  ${totalBRBrands}`);
  console.log(`Total active BR sources: ${totalBRSources}`);
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
