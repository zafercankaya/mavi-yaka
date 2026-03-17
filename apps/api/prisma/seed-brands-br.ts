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

// ── ALL BR BRANDS DATA ───────────────────────────────────
const BRANDS: BrandEntry[] = [
  // ═══════════════════════════════════════════════════════
  // 1) Alışveriş / Shopping — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Mercado Livre', websiteUrl: 'https://www.mercadolivre.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.mercadolivre.com.br/ofertas'] },
  { name: 'Magazine Luiza', websiteUrl: 'https://www.magazineluiza.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.magazineluiza.com.br/ofertas/'] },
  { name: 'Amazon Brasil', websiteUrl: 'https://www.amazon.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.amazon.com.br/gp/goldbox', 'https://www.amazon.com.br/deals'] },
  { name: 'Casas Bahia', websiteUrl: 'https://www.casasbahia.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.casasbahia.com.br/ofertas'] },
  { name: 'Americanas', websiteUrl: 'https://www.americanas.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.americanas.com.br/hotsite/ofertas-do-dia'] },
  { name: 'Shopee Brasil', websiteUrl: 'https://www.shopee.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.shopee.com.br/flash_sale'] },
  { name: 'AliExpress Brasil', websiteUrl: 'https://best.aliexpress.com', categorySlug: 'alisveris', seedUrls: ['https://best.aliexpress.com/'] },
  { name: 'Extra', websiteUrl: 'https://www.extra.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.extra.com.br/ofertas'] },
  { name: 'Submarino', websiteUrl: 'https://www.submarino.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.submarino.com.br/hotsite/ofertas'] },
  { name: 'Ponto', websiteUrl: 'https://www.pontofrio.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.pontofrio.com.br/ofertas'] },
  { name: 'Carrefour Brasil', websiteUrl: 'https://www.carrefour.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.carrefour.com.br/ofertas'] },
  { name: 'Kabum', websiteUrl: 'https://www.kabum.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.kabum.com.br/ofertas'] },
  { name: 'Shein Brasil', websiteUrl: 'https://br.shein.com', categorySlug: 'alisveris', seedUrls: ['https://br.shein.com/sale.html'] },
  { name: 'Shoptime', websiteUrl: 'https://www.shoptime.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.shoptime.com.br/hotsite/ofertas'] },
  { name: 'Lojas Colombo', websiteUrl: 'https://www.colombo.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.colombo.com.br/ofertas'] },
  { name: 'Fast Shop', websiteUrl: 'https://www.fastshop.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.fastshop.com.br/web/promocoes'] },
  { name: 'Havan', websiteUrl: 'https://www.havan.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.havan.com.br/ofertas'] },
  { name: 'Pernambucanas', websiteUrl: 'https://www.pernambucanas.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.pernambucanas.com.br/ofertas'] },
  { name: 'Madeira Madeira', websiteUrl: 'https://www.madeiramadeira.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.madeiramadeira.com.br/ofertas'] },
  { name: 'Polishop', websiteUrl: 'https://www.polishop.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.polishop.com.br/ofertas'] },
  { name: 'Temu Brasil', websiteUrl: 'https://www.temu.com', categorySlug: 'alisveris', seedUrls: ['https://www.temu.com/br/channel/best-sellers.html'] },
  { name: 'Mercado Pago', websiteUrl: 'https://www.mercadopago.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.mercadopago.com.br/ofertas'] },
  { name: 'Bemol', websiteUrl: 'https://www.bemol.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.bemol.com.br/ofertas'] },
  { name: 'TendTudo', websiteUrl: 'https://www.tendtudo.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.tendtudo.com.br/ofertas'] },
  { name: 'Girafa', websiteUrl: 'https://www.girafa.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.girafa.com.br/ofertas'] },
  { name: 'Lojas Renner', websiteUrl: 'https://www.lojasrenner.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.lojasrenner.com.br/promocoes'] },
  { name: 'Ricardo Eletro', websiteUrl: 'https://www.ricardoeletro.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.ricardoeletro.com.br/ofertas'] },
  { name: 'Wish Brasil', websiteUrl: 'https://www.wish.com', categorySlug: 'alisveris', seedUrls: ['https://www.wish.com/feed/daily_deals'] },
  { name: 'Luiza Via', websiteUrl: 'https://www.magazineluiza.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.magazineluiza.com.br/selecao/super-ofertas/'] },
  { name: 'Shopee Oficial', websiteUrl: 'https://www.shopee.com.br', categorySlug: 'alisveris', seedUrls: ['https://www.shopee.com.br/daily_discover'] },

  // ═══════════════════════════════════════════════════════
  // 2) Elektronik / Electronics — 28 brands
  // ═══════════════════════════════════════════════════════
  { name: 'KaBuM!', websiteUrl: 'https://www.kabum.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.kabum.com.br/ofertas'] },
  { name: 'Fast Shop Eletrônicos', websiteUrl: 'https://www.fastshop.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.fastshop.com.br/web/promocoes'] },
  { name: 'Samsung Brasil', websiteUrl: 'https://www.samsung.com/br', categorySlug: 'elektronik', seedUrls: ['https://www.samsung.com/br/offer/'] },
  { name: 'Apple Brasil', websiteUrl: 'https://www.apple.com/br', categorySlug: 'elektronik', seedUrls: ['https://www.apple.com/br/shop/go/product/refurbished'] },
  { name: 'Xiaomi Brasil', websiteUrl: 'https://www.mi.com/br', categorySlug: 'elektronik', seedUrls: ['https://www.mi.com/br/sale'] },
  { name: 'LG Brasil', websiteUrl: 'https://www.lg.com/br', categorySlug: 'elektronik', seedUrls: ['https://www.lg.com/br/promotions/'] },
  { name: 'Sony Brasil', websiteUrl: 'https://store.sony.com.br', categorySlug: 'elektronik', seedUrls: ['https://store.sony.com.br/promocoes'] },
  { name: 'Motorola Brasil', websiteUrl: 'https://www.motorola.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.motorola.com.br/ofertas'] },
  { name: 'Dell Brasil', websiteUrl: 'https://www.dell.com/pt-br', categorySlug: 'elektronik', seedUrls: ['https://www.dell.com/pt-br/shop/deals'] },
  { name: 'Lenovo Brasil', websiteUrl: 'https://www.lenovo.com/br/pt', categorySlug: 'elektronik', seedUrls: ['https://www.lenovo.com/br/pt/deals/'] },
  { name: 'HP Brasil', websiteUrl: 'https://www.hp.com/br-pt', categorySlug: 'elektronik', seedUrls: ['https://www.hp.com/br-pt/shop/ofertas'] },
  { name: 'Acer Brasil', websiteUrl: 'https://store.acer.com/pt-br', categorySlug: 'elektronik', seedUrls: ['https://store.acer.com/pt-br/ofertas'] },
  { name: 'Pichau', websiteUrl: 'https://www.pichau.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.pichau.com.br/ofertas'] },
  { name: 'Terabyte Shop', websiteUrl: 'https://www.terabyteshop.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.terabyteshop.com.br/promocoes'] },
  { name: 'Electrolux Brasil', websiteUrl: 'https://loja.electrolux.com.br', categorySlug: 'elektronik', seedUrls: ['https://loja.electrolux.com.br/ofertas'] },
  { name: 'Consul', websiteUrl: 'https://loja.consul.com.br', categorySlug: 'elektronik', seedUrls: ['https://loja.consul.com.br/ofertas'] },
  { name: 'Brastemp', websiteUrl: 'https://loja.brastemp.com.br', categorySlug: 'elektronik', seedUrls: ['https://loja.brastemp.com.br/ofertas'] },
  { name: 'Philco', websiteUrl: 'https://www.philco.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.philco.com.br/ofertas'] },
  { name: 'JBL Brasil', websiteUrl: 'https://br.jbl.com', categorySlug: 'elektronik', seedUrls: ['https://br.jbl.com/sale/'] },
  { name: 'Logitech Brasil', websiteUrl: 'https://www.logitech.com/pt-br', categorySlug: 'elektronik', seedUrls: ['https://www.logitech.com/pt-br/promo.html'] },
  { name: 'Asus Brasil', websiteUrl: 'https://www.asus.com/br', categorySlug: 'elektronik', seedUrls: ['https://www.asus.com/br/campaign/sale/'] },
  { name: 'Positivo', websiteUrl: 'https://www.meupositivo.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.meupositivo.com.br/ofertas'] },
  { name: 'Multilaser', websiteUrl: 'https://www.multilaser.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.multilaser.com.br/ofertas'] },
  { name: 'Mondial', websiteUrl: 'https://www.mondialeletro.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.mondialeletro.com.br/promocoes'] },
  { name: 'Claro Shop', websiteUrl: 'https://www.claro.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.claro.com.br/celular/ofertas'] },
  { name: 'Magazine Luiza Eletrônicos', websiteUrl: 'https://www.magazineluiza.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.magazineluiza.com.br/ofertas/eletronicos/'] },
  { name: 'Casas Bahia Eletrônicos', websiteUrl: 'https://www.casasbahia.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.casasbahia.com.br/ofertas/eletronicos'] },
  { name: 'Intel Brasil', websiteUrl: 'https://www.intel.com.br', categorySlug: 'elektronik', seedUrls: ['https://www.intel.com.br'] },

  // ═══════════════════════════════════════════════════════
  // 3) Giyim & Moda / Clothing & Fashion — 30 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Renner', websiteUrl: 'https://www.lojasrenner.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.lojasrenner.com.br/promocoes'] },
  { name: 'Riachuelo', websiteUrl: 'https://www.riachuelo.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.riachuelo.com.br/sale'] },
  { name: 'C&A Brasil', websiteUrl: 'https://www.cea.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.cea.com.br/sale'] },
  { name: 'Marisa', websiteUrl: 'https://www.marisa.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.marisa.com.br/sale'] },
  { name: 'Zara Brasil', websiteUrl: 'https://www.zara.com/br', categorySlug: 'giyim-moda', seedUrls: ['https://www.zara.com/br/pt/sale-702.html'] },
  { name: 'H&M Brasil', websiteUrl: 'https://www2.hm.com/pt_br', categorySlug: 'giyim-moda', seedUrls: ['https://www2.hm.com/pt_br/sale.html'] },
  { name: 'Nike Brasil', websiteUrl: 'https://www.nike.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.nike.com.br/sale'] },
  { name: 'Adidas Brasil', websiteUrl: 'https://www.adidas.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.adidas.com.br/sale'] },
  { name: 'Hering', websiteUrl: 'https://www.hering.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.hering.com.br/sale'] },
  { name: 'Shoulder', websiteUrl: 'https://www.shoulder.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.shoulder.com.br/sale'] },
  { name: 'Farm', websiteUrl: 'https://www.farmrio.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.farmrio.com.br/sale'] },
  { name: 'Arezzo', websiteUrl: 'https://www.arezzo.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.arezzo.com.br/sale'] },
  { name: 'Amaro', websiteUrl: 'https://amaro.com/br/pt', categorySlug: 'giyim-moda', seedUrls: ['https://amaro.com/br/pt/sale'] },
  { name: 'Dafiti', websiteUrl: 'https://www.dafiti.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.dafiti.com.br/sale/'] },
  { name: 'Netshoes', websiteUrl: 'https://www.netshoes.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.netshoes.com.br/ofertas'] },
  { name: 'Centauro', websiteUrl: 'https://www.centauro.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.centauro.com.br/ofertas'] },
  { name: 'Havaianas', websiteUrl: 'https://www.havaianas.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.havaianas.com.br/sale'] },
  { name: 'Reserva', websiteUrl: 'https://www.usereserva.com', categorySlug: 'giyim-moda', seedUrls: ['https://www.usereserva.com/sale'] },
  { name: 'Melissa', websiteUrl: 'https://www.lojamelissa.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.lojamelissa.com.br/sale'] },
  { name: 'Lacoste Brasil', websiteUrl: 'https://www.lacoste.com/br', categorySlug: 'giyim-moda', seedUrls: ['https://www.lacoste.com/br/sale.html'] },
  { name: 'Tommy Hilfiger Brasil', websiteUrl: 'https://br.tommy.com', categorySlug: 'giyim-moda', seedUrls: ['https://br.tommy.com/sale'] },
  { name: 'Calvin Klein Brasil', websiteUrl: 'https://www.calvinklein.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.calvinklein.com.br/sale'] },
  { name: 'Schutz', websiteUrl: 'https://www.schutz.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.schutz.com.br/sale'] },
  { name: 'Animale', websiteUrl: 'https://www.animale.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.animale.com.br/sale'] },
  { name: 'Olympikus', websiteUrl: 'https://www.olympikus.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.olympikus.com.br/sale'] },
  { name: 'Puma Brasil', websiteUrl: 'https://br.puma.com', categorySlug: 'giyim-moda', seedUrls: ['https://br.puma.com/sale'] },
  { name: 'Colcci', websiteUrl: 'https://www.colcci.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.colcci.com.br/sale'] },
  { name: 'Track & Field', websiteUrl: 'https://www.tf.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.tf.com.br/sale'] },
  { name: 'Shein Brasil Moda', websiteUrl: 'https://br.shein.com', categorySlug: 'giyim-moda', seedUrls: ['https://br.shein.com/sale.html'] },
  { name: "Levi's Brasil", websiteUrl: 'https://www.lfrfrevi.com.br', categorySlug: 'giyim-moda', seedUrls: ['https://www.lfrfrevi.com.br/sale'] },

  // ═══════════════════════════════════════════════════════
  // 4) Ev & Yaşam / Home & Living — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'MadeiraMadeira', websiteUrl: 'https://www.madeiramadeira.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.madeiramadeira.com.br/ofertas'] },
  { name: 'Tok&Stok', websiteUrl: 'https://www.tokstok.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.tokstok.com.br/ofertas'] },
  { name: 'Leroy Merlin Brasil', websiteUrl: 'https://www.leroymerlin.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.leroymerlin.com.br/ofertas'] },
  { name: 'Telhanorte', websiteUrl: 'https://www.telhanorte.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.telhanorte.com.br/ofertas'] },
  { name: 'C&C Casa', websiteUrl: 'https://www.cec.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.cec.com.br/ofertas'] },
  { name: 'Etna', websiteUrl: 'https://www.etna.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.etna.com.br/sale'] },
  { name: 'Mobly', websiteUrl: 'https://www.mobly.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.mobly.com.br/ofertas/'] },
  { name: 'Westwing Brasil', websiteUrl: 'https://www.westwing.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.westwing.com.br/campanhas/'] },
  { name: 'Camicado', websiteUrl: 'https://www.camicado.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.camicado.com.br/ofertas'] },
  { name: 'IKEA Brasil', websiteUrl: 'https://www.ikea.com/br/pt', categorySlug: 'ev-yasam', seedUrls: ['https://www.ikea.com/br/pt/offers/'] },
  { name: 'Tramontina', websiteUrl: 'https://loja.tramontina.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://loja.tramontina.com.br/ofertas'] },
  { name: 'Electrolux Home', websiteUrl: 'https://loja.electrolux.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://loja.electrolux.com.br/ofertas'] },
  { name: 'Brastemp Casa', websiteUrl: 'https://loja.brastemp.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://loja.brastemp.com.br/ofertas'] },
  { name: 'Consul Casa', websiteUrl: 'https://loja.consul.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://loja.consul.com.br/ofertas'] },
  { name: 'Havan Casa', websiteUrl: 'https://www.havan.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.havan.com.br/ofertas'] },
  { name: 'Portobello Shop', websiteUrl: 'https://www.portobello.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.portobello.com.br/promocoes'] },
  { name: 'Atlas Eletrodomesticos', websiteUrl: 'https://www.lojaatlas.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.lojaatlas.com.br/ofertas'] },
  { name: 'Tigre', websiteUrl: 'https://www.tigre.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.tigre.com.br/promocoes'] },
  { name: 'Suvinil', websiteUrl: 'https://www.suvinil.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.suvinil.com.br/promocoes'] },
  { name: 'Coral Tintas', websiteUrl: 'https://www.coral.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.coral.com.br/pt/promocoes'] },
  { name: 'Magazine Luiza Casa', websiteUrl: 'https://www.magazineluiza.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.magazineluiza.com.br/ofertas/moveis/'] },
  { name: 'Casas Bahia Casa', websiteUrl: 'https://www.casasbahia.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.casasbahia.com.br/ofertas/moveis'] },
  { name: 'Shoptime Casa', websiteUrl: 'https://www.shoptime.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.shoptime.com.br/hotsite/ofertas'] },
  { name: 'TendTudo Home', websiteUrl: 'https://www.tendtudo.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.tendtudo.com.br/ofertas'] },
  { name: 'Polishop Casa', websiteUrl: 'https://www.polishop.com.br', categorySlug: 'ev-yasam', seedUrls: ['https://www.polishop.com.br/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 5) Gıda & Market / Grocery & Market — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Carrefour Mercado', websiteUrl: 'https://www.carrefour.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.carrefour.com.br/ofertas'] },
  { name: 'Pão de Açúcar', websiteUrl: 'https://www.paodeacucar.com', categorySlug: 'gida-market', seedUrls: ['https://www.paodeacucar.com/ofertas'] },
  { name: 'Extra Supermercado', websiteUrl: 'https://www.extra.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.extra.com.br/ofertas'] },
  { name: 'Assaí Atacadista', websiteUrl: 'https://www.assai.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.assai.com.br/ofertas'] },
  { name: 'Atacadão', websiteUrl: 'https://www.atacadao.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.atacadao.com.br/ofertas'] },
  { name: "Sam's Club Brasil", websiteUrl: 'https://www.samsclub.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.samsclub.com.br/ofertas'] },
  { name: 'Supermercado Dia', websiteUrl: 'https://www.dia.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.dia.com.br/ofertas'] },
  { name: 'Prezunic', websiteUrl: 'https://www.prezunic.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.prezunic.com.br/ofertas'] },
  { name: 'Mambo Supermercado', websiteUrl: 'https://www.mambo.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.mambo.com.br/ofertas'] },
  { name: 'Shopper', websiteUrl: 'https://www.shopper.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.shopper.com.br/ofertas'] },
  { name: 'Supermercado BH', websiteUrl: 'https://www.supermercadobh.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.supermercadobh.com.br/ofertas'] },
  { name: 'Mercado Livre Supermercado', websiteUrl: 'https://www.mercadolivre.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.mercadolivre.com.br/ofertas/supermercado'] },
  { name: 'Amazon Fresh Brasil', websiteUrl: 'https://www.amazon.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.amazon.com.br/alimentos-bebidas/b?node=16254072011'] },
  { name: 'Savegnago', websiteUrl: 'https://www.savegnago.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.savegnago.com.br/ofertas'] },
  { name: 'Makro Brasil', websiteUrl: 'https://www.makro.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.makro.com.br/ofertas'] },
  { name: 'Nacional Supermercados', websiteUrl: 'https://www.nacionalsupermercados.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.nacionalsupermercados.com.br/ofertas'] },
  { name: 'St Marche', websiteUrl: 'https://www.stmarche.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.stmarche.com.br/ofertas'] },
  { name: 'Supernosso', websiteUrl: 'https://www.supernosso.com', categorySlug: 'gida-market', seedUrls: ['https://www.supernosso.com/ofertas'] },
  { name: 'Fort Atacadista', websiteUrl: 'https://www.fortatacadista.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.fortatacadista.com.br/ofertas'] },
  { name: 'Spani Atacadista', websiteUrl: 'https://www.spani.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.spani.com.br/ofertas'] },
  { name: 'Guanabara', websiteUrl: 'https://www.supermercadosguanabara.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.supermercadosguanabara.com.br/ofertas'] },
  { name: 'Bemol Market', websiteUrl: 'https://www.bemol.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.bemol.com.br/ofertas'] },
  { name: 'Sonda Supermercados', websiteUrl: 'https://www.sondasupermercados.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.sondasupermercados.com.br/ofertas'] },
  { name: 'Big Delivery', websiteUrl: 'https://www.bigdelivery.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.bigdelivery.com.br/ofertas'] },
  { name: 'Hiper Bompreço', websiteUrl: 'https://www.bompreco.com.br', categorySlug: 'gida-market', seedUrls: ['https://www.bompreco.com.br/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 6) Yeme & İçme / Food & Dining — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'iFood', websiteUrl: 'https://www.ifood.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.ifood.com.br/cupons'] },
  { name: 'Rappi Brasil', websiteUrl: 'https://www.rappi.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.rappi.com.br/promocoes'] },
  { name: 'Uber Eats Brasil', websiteUrl: 'https://www.ubereats.com/br', categorySlug: 'yeme-icme', seedUrls: ['https://www.ubereats.com/br/'] },
  { name: "McDonald's Brasil", websiteUrl: 'https://www.mcdonalds.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.mcdonalds.com.br/ofertas'] },
  { name: 'Burger King Brasil', websiteUrl: 'https://www.burgerking.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.burgerking.com.br/cupons'] },
  { name: 'Pizza Hut Brasil', websiteUrl: 'https://www.pizzahut.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.pizzahut.com.br/ofertas'] },
  { name: "Domino's Brasil", websiteUrl: 'https://www.dominos.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.dominos.com.br/promocoes'] },
  { name: 'Subway Brasil', websiteUrl: 'https://www.subway.com/pt-BR', categorySlug: 'yeme-icme', seedUrls: ['https://www.subway.com/pt-BR/menunutrition/deals'] },
  { name: 'KFC Brasil', websiteUrl: 'https://www.kfc.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.kfc.com.br/ofertas'] },
  { name: "Bob's", websiteUrl: 'https://www.bobs.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.bobs.com.br/promocoes'] },
  { name: "Habib's", websiteUrl: 'https://www.habibs.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.habibs.com.br/promocoes'] },
  { name: 'Giraffas', websiteUrl: 'https://www.giraffas.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.giraffas.com.br/promocoes'] },
  { name: 'Outback Brasil', websiteUrl: 'https://www.outback.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.outback.com.br/promocoes'] },
  { name: 'Spoleto', websiteUrl: 'https://www.spoleto.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.spoleto.com.br/promocoes'] },
  { name: 'Madero', websiteUrl: 'https://www.restaurantemadero.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.restaurantemadero.com.br/promocoes'] },
  { name: 'Starbucks Brasil', websiteUrl: 'https://www.starbucks.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.starbucks.com.br/promocoes'] },
  { name: 'Popeyes Brasil', websiteUrl: 'https://www.popeyes.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.popeyes.com.br/ofertas'] },
  { name: 'China in Box', websiteUrl: 'https://www.chinainbox.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.chinainbox.com.br/promocoes'] },
  { name: 'Coco Bambu', websiteUrl: 'https://www.cocobambu.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.cocobambu.com/promocoes'] },
  { name: 'Zé Delivery', websiteUrl: 'https://www.ze.delivery', categorySlug: 'yeme-icme', seedUrls: ['https://www.ze.delivery/ofertas'] },
  { name: '99Food', websiteUrl: 'https://www.99food.com', categorySlug: 'yeme-icme', seedUrls: ['https://www.99food.com/'] },
  { name: 'Ragazzo', websiteUrl: 'https://www.ragazzo.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.ragazzo.com.br/promocoes'] },
  { name: 'Forno de Minas', websiteUrl: 'https://www.fornodeminas.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.fornodeminas.com.br/promocoes'] },
  { name: 'Jeronimo', websiteUrl: 'https://www.jeronimo.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.jeronimo.com.br/promocoes'] },
  { name: 'Ambev', websiteUrl: 'https://www.ambev.com.br', categorySlug: 'yeme-icme', seedUrls: ['https://www.ambev.com.br/promocoes'] },

  // ═══════════════════════════════════════════════════════
  // 7) Kozmetik & Kişisel Bakım / Beauty & Personal Care — 28 brands
  // ═══════════════════════════════════════════════════════
  { name: 'O Boticário', websiteUrl: 'https://www.boticario.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.boticario.com.br/ofertas'] },
  { name: 'Natura', websiteUrl: 'https://www.natura.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.natura.com.br/promocoes'] },
  { name: 'Avon Brasil', websiteUrl: 'https://www.avon.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.avon.com.br/promocoes'] },
  { name: 'Sephora Brasil', websiteUrl: 'https://www.sephora.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.sephora.com.br/sale/'] },
  { name: 'Beleza na Web', websiteUrl: 'https://www.belezanaweb.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.belezanaweb.com.br/ofertas'] },
  { name: 'Época Cosméticos', websiteUrl: 'https://www.epocacosmeticos.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.epocacosmeticos.com.br/ofertas'] },
  { name: 'Drogasil', websiteUrl: 'https://www.drogasil.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.drogasil.com.br/ofertas'] },
  { name: 'Droga Raia', websiteUrl: 'https://www.drogaraia.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.drogaraia.com.br/ofertas'] },
  { name: 'Panvel', websiteUrl: 'https://www.panvel.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.panvel.com/ofertas'] },
  { name: 'Eudora', websiteUrl: 'https://www.eudora.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.eudora.com.br/promocoes'] },
  { name: 'Quem Disse Berenice', websiteUrl: 'https://www.quemdisseberenice.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.quemdisseberenice.com.br/promocoes'] },
  { name: 'MAC Brasil', websiteUrl: 'https://www.maccosmetics.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.maccosmetics.com.br/ofertas'] },
  { name: "L'Oréal Paris Brasil", websiteUrl: 'https://www.loreal-paris.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.loreal-paris.com.br/ofertas'] },
  { name: 'Nivea Brasil', websiteUrl: 'https://www.nivea.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.nivea.com.br/promocoes'] },
  { name: 'Salon Line', websiteUrl: 'https://www.salonline.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.salonline.com.br/promocoes'] },
  { name: 'Loccitane Brasil', websiteUrl: 'https://br.loccitane.com', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://br.loccitane.com/sale/'] },
  { name: 'Body Shop Brasil', websiteUrl: 'https://www.thebodyshop.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebodyshop.com.br/sale/'] },
  { name: 'Granado', websiteUrl: 'https://www.granado.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.granado.com.br/sale'] },
  { name: 'Dermage', websiteUrl: 'https://www.dermage.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dermage.com.br/sale'] },
  { name: 'Vichy Brasil', websiteUrl: 'https://www.vichy.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vichy.com.br/ofertas'] },
  { name: 'La Roche-Posay Brasil', websiteUrl: 'https://www.laroche-posay.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.laroche-posay.com.br/ofertas'] },
  { name: 'Drogaria São Paulo', websiteUrl: 'https://www.drogariasaopaulo.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.drogariasaopaulo.com.br/ofertas'] },
  { name: 'Drogaria Pacheco', websiteUrl: 'https://www.pacheco.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.pacheco.com.br/ofertas'] },
  { name: 'The Beauty Box', websiteUrl: 'https://www.thebeautybox.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.thebeautybox.com.br/ofertas'] },
  { name: 'Ruby Rose', websiteUrl: 'https://www.rubyrose.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.rubyrose.com.br/ofertas'] },
  { name: 'Payot Brasil', websiteUrl: 'https://www.payot.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.payot.com.br/promocoes'] },
  { name: 'Dove Brasil', websiteUrl: 'https://www.dove.com/br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.dove.com/br/promocoes.html'] },
  { name: 'Vult', websiteUrl: 'https://www.vult.com.br', categorySlug: 'kozmetik-kisisel-bakim', seedUrls: ['https://www.vult.com.br/promocoes'] },

  // ═══════════════════════════════════════════════════════
  // 8) Spor & Outdoor / Sports & Outdoor — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Centauro Sport', websiteUrl: 'https://www.centauro.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.centauro.com.br/ofertas'] },
  { name: 'Netshoes Sport', websiteUrl: 'https://www.netshoes.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.netshoes.com.br/ofertas'] },
  { name: 'Decathlon Brasil', websiteUrl: 'https://www.decathlon.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.decathlon.com.br/ofertas'] },
  { name: 'Nike Brasil Sport', websiteUrl: 'https://www.nike.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.nike.com.br/sale'] },
  { name: 'Adidas Brasil Sport', websiteUrl: 'https://www.adidas.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.adidas.com.br/sale'] },
  { name: 'Puma Brasil Sport', websiteUrl: 'https://br.puma.com', categorySlug: 'spor-outdoor', seedUrls: ['https://br.puma.com/sale'] },
  { name: 'Under Armour Brasil', websiteUrl: 'https://www.underarmour.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.underarmour.com.br/pt-br/c/sale/'] },
  { name: 'Asics Brasil', websiteUrl: 'https://www.asics.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.asics.com.br/sale'] },
  { name: 'Mizuno Brasil', websiteUrl: 'https://www.mizuno.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.mizuno.com.br/sale'] },
  { name: 'Olympikus Sport', websiteUrl: 'https://www.olympikus.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.olympikus.com.br/sale'] },
  { name: 'Fila Brasil', websiteUrl: 'https://www.fila.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.fila.com.br/sale'] },
  { name: 'Reebok Brasil', websiteUrl: 'https://www.reebok.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.reebok.com.br/sale'] },
  { name: 'New Balance Brasil', websiteUrl: 'https://www.newbalance.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.newbalance.com.br/sale'] },
  { name: 'Track & Field Sport', websiteUrl: 'https://www.tf.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.tf.com.br/sale'] },
  { name: 'Kanui', websiteUrl: 'https://www.kanui.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.kanui.com.br/ofertas'] },
  { name: 'World Tennis', websiteUrl: 'https://www.worldtennis.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.worldtennis.com.br/ofertas'] },
  { name: 'Columbia Brasil', websiteUrl: 'https://www.columbia.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.columbia.com.br/sale'] },
  { name: 'Oakley Brasil', websiteUrl: 'https://www.oakley.com/pt-br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.oakley.com/pt-br/sale'] },
  { name: 'Salomon Brasil', websiteUrl: 'https://www.salomon.com/pt-br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.salomon.com/pt-br/sale/'] },
  { name: 'Speedo Brasil', websiteUrl: 'https://www.speedo.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.speedo.com.br/sale'] },
  { name: 'Skechers Brasil', websiteUrl: 'https://www.skechers.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.skechers.com.br/sale'] },
  { name: 'Rip Curl Brasil', websiteUrl: 'https://www.ripcurl.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.ripcurl.com.br/sale'] },
  { name: 'Bike Plus', websiteUrl: 'https://www.bikeplus.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.bikeplus.com.br/ofertas'] },
  { name: 'FutFanatics', websiteUrl: 'https://www.futfanatics.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.futfanatics.com.br/promocoes'] },
  { name: 'Loja do Esporte', websiteUrl: 'https://www.lojadoesporte.com.br', categorySlug: 'spor-outdoor', seedUrls: ['https://www.lojadoesporte.com.br/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 9) Seyahat & Ulaşım / Travel & Transport — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'CVC', websiteUrl: 'https://www.cvc.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.cvc.com.br/ofertas'] },
  { name: 'Decolar', websiteUrl: 'https://www.decolar.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.decolar.com/ofertas'] },
  { name: 'LATAM Airlines Brasil', websiteUrl: 'https://www.latamairlines.com/br/pt', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.latamairlines.com/br/pt/ofertas'] },
  { name: 'GOL', websiteUrl: 'https://www.voegol.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.voegol.com.br/ofertas'] },
  { name: 'Azul', websiteUrl: 'https://www.voeazul.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.voeazul.com.br/ofertas'] },
  { name: 'Booking.com Brasil', websiteUrl: 'https://www.booking.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.booking.com/deals.pt-br.html'] },
  { name: 'Hurb', websiteUrl: 'https://www.hurb.com/br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.hurb.com/br/ofertas'] },
  { name: '123 Milhas', websiteUrl: 'https://www.123milhas.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.123milhas.com/ofertas'] },
  { name: 'MaxMilhas', websiteUrl: 'https://www.maxmilhas.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.maxmilhas.com.br/ofertas'] },
  { name: 'Smiles', websiteUrl: 'https://www.smiles.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.smiles.com.br/ofertas'] },
  { name: 'Airbnb Brasil', websiteUrl: 'https://www.airbnb.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.airbnb.com.br/'] },
  { name: 'Expedia Brasil', websiteUrl: 'https://www.expedia.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.expedia.com.br/deals'] },
  { name: 'Kayak Brasil', websiteUrl: 'https://www.kayak.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.kayak.com.br/deals'] },
  { name: 'Skyscanner Brasil', websiteUrl: 'https://www.skyscanner.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.skyscanner.com.br/ofertas'] },
  { name: 'Localiza', websiteUrl: 'https://www.localiza.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.localiza.com/brasil/pt-br/ofertas'] },
  { name: 'Movida', websiteUrl: 'https://www.movida.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.movida.com.br/ofertas'] },
  { name: 'Unidas', websiteUrl: 'https://www.unidas.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.unidas.com.br/ofertas'] },
  { name: '99 Transporte', websiteUrl: 'https://www.99app.com', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.99app.com/promocoes'] },
  { name: 'Uber Brasil', websiteUrl: 'https://www.uber.com/br/pt-br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.uber.com/br/pt-br/ofertas/'] },
  { name: 'Buser', websiteUrl: 'https://www.buser.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.buser.com.br/promocoes'] },
  { name: 'ClickBus', websiteUrl: 'https://www.clickbus.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.clickbus.com.br/ofertas'] },
  { name: 'ViajaNet', websiteUrl: 'https://www.viajanet.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.viajanet.com.br/ofertas'] },
  { name: 'Melhores Destinos', websiteUrl: 'https://www.melhoresdestinos.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.melhoresdestinos.com.br/promocoes'] },
  { name: 'Submarino Viagens', websiteUrl: 'https://www.submarinoviagens.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.submarinoviagens.com.br/ofertas'] },
  { name: 'TudoAzul', websiteUrl: 'https://www.voeazul.com.br', categorySlug: 'seyahat-ulasim', seedUrls: ['https://www.voeazul.com.br/tudoazul/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 10) Finans / Finance — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Nubank', websiteUrl: 'https://www.nubank.com.br', categorySlug: 'finans', seedUrls: ['https://www.nubank.com.br/ofertas'] },
  { name: 'Banco do Brasil', websiteUrl: 'https://www.bb.com.br', categorySlug: 'finans', seedUrls: ['https://www.bb.com.br/pbb/pagina-inicial/solucoes-digitais/ourocard/ofertas'] },
  { name: 'Itaú Unibanco', websiteUrl: 'https://www.itau.com.br', categorySlug: 'finans', seedUrls: ['https://www.itau.com.br/ofertas'] },
  { name: 'Bradesco', websiteUrl: 'https://banco.bradesco', categorySlug: 'finans', seedUrls: ['https://banco.bradesco/html/classic/promocoes/index.shtm'] },
  { name: 'Santander Brasil', websiteUrl: 'https://www.santander.com.br', categorySlug: 'finans', seedUrls: ['https://www.santander.com.br/ofertas'] },
  { name: 'Caixa', websiteUrl: 'https://www.caixa.gov.br', categorySlug: 'finans', seedUrls: ['https://www.caixa.gov.br/voce/ofertas/'] },
  { name: 'Banco Inter', websiteUrl: 'https://www.bancointer.com.br', categorySlug: 'finans', seedUrls: ['https://www.bancointer.com.br/inter-shop/'] },
  { name: 'C6 Bank', websiteUrl: 'https://www.c6bank.com.br', categorySlug: 'finans', seedUrls: ['https://www.c6bank.com.br/conta-digital'] },
  { name: 'PagBank', websiteUrl: 'https://www.pagseguro.uol.com.br', categorySlug: 'finans', seedUrls: ['https://www.pagseguro.uol.com.br/ofertas'] },
  { name: 'PicPay', websiteUrl: 'https://www.picpay.com', categorySlug: 'finans', seedUrls: ['https://www.picpay.com/ofertas'] },
  { name: 'Mercado Pago Fin', websiteUrl: 'https://www.mercadopago.com.br', categorySlug: 'finans', seedUrls: ['https://www.mercadopago.com.br/ofertas'] },
  { name: 'Elo', websiteUrl: 'https://www.elo.com.br', categorySlug: 'finans', seedUrls: ['https://www.elo.com.br/ofertas'] },
  { name: 'Visa Brasil', websiteUrl: 'https://www.visa.com.br', categorySlug: 'finans', seedUrls: ['https://www.visa.com.br/vai-de-visa/ofertas.html'] },
  { name: 'Mastercard Brasil', websiteUrl: 'https://www.mastercard.com.br', categorySlug: 'finans', seedUrls: ['https://www.mastercard.com.br/pt-br/consumidores/encontrar-recurso/priceless.html'] },
  { name: 'Sicredi', websiteUrl: 'https://www.sicredi.com.br', categorySlug: 'finans', seedUrls: ['https://www.sicredi.com.br/ofertas'] },
  { name: 'Sicoob', websiteUrl: 'https://www.sicoob.com.br', categorySlug: 'finans', seedUrls: ['https://www.sicoob.com.br/web/sicoob/ofertas'] },
  { name: 'Neon Banco', websiteUrl: 'https://www.neon.com.br', categorySlug: 'finans', seedUrls: ['https://www.neon.com.br/ofertas'] },
  { name: 'Stone', websiteUrl: 'https://www.stone.com.br', categorySlug: 'finans', seedUrls: ['https://www.stone.com.br/promocoes'] },
  { name: 'Ame Digital', websiteUrl: 'https://www.amedigital.com', categorySlug: 'finans', seedUrls: ['https://www.amedigital.com/ofertas'] },
  { name: 'BTG Pactual', websiteUrl: 'https://www.btgpactual.com', categorySlug: 'finans', seedUrls: ['https://www.btgpactual.com/digital/investimentos'] },
  { name: 'XP Investimentos', websiteUrl: 'https://www.xpi.com.br', categorySlug: 'finans', seedUrls: ['https://www.xpi.com.br/investimentos/ofertas/'] },
  { name: 'Rico', websiteUrl: 'https://www.rico.com.vc', categorySlug: 'finans', seedUrls: ['https://www.rico.com.vc/ofertas'] },
  { name: 'Original', websiteUrl: 'https://www.original.com.br', categorySlug: 'finans', seedUrls: ['https://www.original.com.br/ofertas'] },
  { name: 'Next', websiteUrl: 'https://www.next.me', categorySlug: 'finans', seedUrls: ['https://www.next.me/ofertas'] },
  { name: 'Iti', websiteUrl: 'https://iti.itau', categorySlug: 'finans', seedUrls: ['https://iti.itau/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 11) Sigorta / Insurance — 20 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Porto Seguro', websiteUrl: 'https://www.portoseguro.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.portoseguro.com.br/ofertas'] },
  { name: 'Bradesco Seguros', websiteUrl: 'https://www.bradescoseguros.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.bradescoseguros.com.br/clientes/ofertas'] },
  { name: 'SulAmérica', websiteUrl: 'https://www.sulamerica.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.sulamerica.com.br/ofertas'] },
  { name: 'Itaú Seguros', websiteUrl: 'https://www.itau.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.itau.com.br/seguros/ofertas'] },
  { name: 'BB Seguros', websiteUrl: 'https://www.bbseguros.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.bbseguros.com.br/seguros/ofertas'] },
  { name: 'Allianz Brasil', websiteUrl: 'https://www.allianz.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.allianz.com.br/ofertas'] },
  { name: 'Liberty Seguros', websiteUrl: 'https://www.libertyseguros.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.libertyseguros.com.br/promocoes'] },
  { name: 'Zurich Brasil', websiteUrl: 'https://www.zurich.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.zurich.com.br/pt-br/ofertas'] },
  { name: 'Mapfre Brasil', websiteUrl: 'https://www.mapfre.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.mapfre.com.br/ofertas/'] },
  { name: 'HDI Seguros', websiteUrl: 'https://www.hdiseguros.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.hdiseguros.com.br/promocoes'] },
  { name: 'Tokio Marine', websiteUrl: 'https://www.tokiomarine.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.tokiomarine.com.br/promocoes'] },
  { name: 'Caixa Seguros', websiteUrl: 'https://www.caixaseguradora.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.caixaseguradora.com.br/ofertas'] },
  { name: 'Amil', websiteUrl: 'https://www.amil.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.amil.com.br/planos/ofertas'] },
  { name: 'Unimed', websiteUrl: 'https://www.unimed.coop.br', categorySlug: 'sigorta', seedUrls: ['https://www.unimed.coop.br/web/guest/ofertas'] },
  { name: 'Hapvida', websiteUrl: 'https://www.hapvida.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.hapvida.com.br/ofertas'] },
  { name: 'Youse', websiteUrl: 'https://www.youse.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.youse.com.br/ofertas'] },
  { name: 'Azos', websiteUrl: 'https://www.azos.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.azos.com.br/'] },
  { name: 'Pier Digital', websiteUrl: 'https://www.pier.digital', categorySlug: 'sigorta', seedUrls: ['https://www.pier.digital/'] },
  { name: 'Minuto Seguros', websiteUrl: 'https://www.minutoseguros.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.minutoseguros.com.br/ofertas'] },
  { name: 'Bidu Seguros', websiteUrl: 'https://www.bidu.com.br', categorySlug: 'sigorta', seedUrls: ['https://www.bidu.com.br/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 12) Otomobil / Automotive — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Fiat Brasil', websiteUrl: 'https://www.fiat.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.fiat.com.br/ofertas.html'] },
  { name: 'Volkswagen Brasil', websiteUrl: 'https://www.vw.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.vw.com.br/pt/ofertas.html'] },
  { name: 'Chevrolet Brasil', websiteUrl: 'https://www.chevrolet.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.chevrolet.com.br/ofertas'] },
  { name: 'Hyundai Brasil', websiteUrl: 'https://www.hyundai.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.hyundai.com.br/ofertas'] },
  { name: 'Toyota Brasil', websiteUrl: 'https://www.toyota.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.toyota.com.br/ofertas'] },
  { name: 'Honda Autos Brasil', websiteUrl: 'https://www.honda.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.br/automoveis/ofertas'] },
  { name: 'Jeep Brasil', websiteUrl: 'https://www.jeep.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.jeep.com.br/ofertas.html'] },
  { name: 'Renault Brasil', websiteUrl: 'https://www.renault.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.renault.com.br/ofertas.html'] },
  { name: 'Nissan Brasil', websiteUrl: 'https://www.nissan.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.nissan.com.br/ofertas.html'] },
  { name: 'Peugeot Brasil', websiteUrl: 'https://www.peugeot.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.peugeot.com.br/ofertas.html'] },
  { name: 'Citroën Brasil', websiteUrl: 'https://www.citroen.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.citroen.com.br/ofertas.html'] },
  { name: 'Caoa Chery', websiteUrl: 'https://www.caoa.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.caoa.com.br/chery/ofertas'] },
  { name: 'BYD Brasil', websiteUrl: 'https://www.byd.com/br', categorySlug: 'otomobil', seedUrls: ['https://www.byd.com/br/ofertas'] },
  { name: 'GWM Brasil', websiteUrl: 'https://www.gwmmotors.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.gwmmotors.com.br/ofertas'] },
  { name: 'BMW Brasil', websiteUrl: 'https://www.bmw.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.bmw.com.br/pt/topics/ofertas.html'] },
  { name: 'Mercedes-Benz Brasil', websiteUrl: 'https://www.mercedes-benz.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.mercedes-benz.com.br/passageiros/ofertas.html'] },
  { name: 'Audi Brasil', websiteUrl: 'https://www.audi.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.audi.com.br/br/web/pt/ofertas.html'] },
  { name: 'Ford Brasil', websiteUrl: 'https://www.ford.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.ford.com.br/ofertas/'] },
  { name: 'Volvo Brasil', websiteUrl: 'https://www.volvocars.com/br', categorySlug: 'otomobil', seedUrls: ['https://www.volvocars.com/br/ofertas/'] },
  { name: 'Yamaha Motor Brasil', websiteUrl: 'https://www.yamaha-motor.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.yamaha-motor.com.br/promocoes'] },
  { name: 'Honda Motos Brasil', websiteUrl: 'https://www.honda.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.honda.com.br/motos/ofertas'] },
  { name: 'Webmotors', websiteUrl: 'https://www.webmotors.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.webmotors.com.br/ofertas'] },
  { name: 'iCarros', websiteUrl: 'https://www.icarros.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.icarros.com.br/ofertas'] },
  { name: 'OLX Autos', websiteUrl: 'https://www.olx.com.br', categorySlug: 'otomobil', seedUrls: ['https://www.olx.com.br/autos/ofertas'] },
  { name: 'Kavak Brasil', websiteUrl: 'https://www.kavak.com/br', categorySlug: 'otomobil', seedUrls: ['https://www.kavak.com/br/ofertas'] },

  // ═══════════════════════════════════════════════════════
  // 13) Kitap & Hobi / Books & Hobbies — 25 brands
  // ═══════════════════════════════════════════════════════
  { name: 'Amazon Livros Brasil', websiteUrl: 'https://www.amazon.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.br/Livros/b?node=6740748011'] },
  { name: 'Saraiva', websiteUrl: 'https://www.saraiva.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.saraiva.com.br/ofertas'] },
  { name: 'Livraria Cultura', websiteUrl: 'https://www.livrariacultura.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.livrariacultura.com.br/ofertas'] },
  { name: 'Livraria da Travessa', websiteUrl: 'https://www.travessa.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.travessa.com.br/ofertas'] },
  { name: 'Estante Virtual', websiteUrl: 'https://www.estantevirtual.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.estantevirtual.com.br/ofertas'] },
  { name: 'Companhia das Letras', websiteUrl: 'https://www.companhiadasletras.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.companhiadasletras.com.br/promocoes'] },
  { name: 'Leitura', websiteUrl: 'https://www.leitura.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.leitura.com.br/ofertas'] },
  { name: 'Magazine Luiza Livros', websiteUrl: 'https://www.magazineluiza.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.magazineluiza.com.br/ofertas/livros/'] },
  { name: 'Submarino Livros', websiteUrl: 'https://www.submarino.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.submarino.com.br/categoria/livros/ofertas'] },
  { name: 'Ri Happy', websiteUrl: 'https://www.rihappy.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.rihappy.com.br/ofertas'] },
  { name: 'PBKids', websiteUrl: 'https://www.pbkids.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.pbkids.com.br/ofertas'] },
  { name: 'LEGO Store Brasil', websiteUrl: 'https://www.lego.com/pt-br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.lego.com/pt-br/categories/sales-and-deals'] },
  { name: 'Estrela', websiteUrl: 'https://www.estrela.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.estrela.com.br/promocoes'] },
  { name: 'TAG Livros', websiteUrl: 'https://www.taglivros.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.taglivros.com/ofertas'] },
  { name: 'Darkside Books', websiteUrl: 'https://www.darksidebooks.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.darksidebooks.com.br/promocoes'] },
  { name: 'Udemy Brasil', websiteUrl: 'https://www.udemy.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.udemy.com/courses/search/?lang=pt'] },
  { name: 'Alura', websiteUrl: 'https://www.alura.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.alura.com.br/promocoes'] },
  { name: 'Hotmart', websiteUrl: 'https://www.hotmart.com', categorySlug: 'kitap-hobi', seedUrls: ['https://www.hotmart.com/marketplace'] },
  { name: 'Spotify Brasil', websiteUrl: 'https://www.spotify.com/br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.spotify.com/br/premium/'] },
  { name: 'Globoplay', websiteUrl: 'https://globoplay.globo.com', categorySlug: 'kitap-hobi', seedUrls: ['https://globoplay.globo.com/assine/'] },
  { name: 'Kindle Brasil', websiteUrl: 'https://www.amazon.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.amazon.com.br/b?node=17877541011'] },
  { name: 'Livrarias Curitiba', websiteUrl: 'https://www.livrariascuritiba.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.livrariascuritiba.com.br/ofertas'] },
  { name: 'Deezer Brasil', websiteUrl: 'https://www.deezer.com/br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.deezer.com/br/offers'] },
  { name: 'Mercado Livre Games', websiteUrl: 'https://www.mercadolivre.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://www.mercadolivre.com.br/ofertas/games'] },
  { name: 'Editora Abril', websiteUrl: 'https://assine.abril.com.br', categorySlug: 'kitap-hobi', seedUrls: ['https://assine.abril.com.br/promocoes'] },
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
  console.log('=== BR Market Brand Seed Script ===\n');

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
      // Upsert brand with BR market (unique on slug+market)
      const brand = await prisma.brand.upsert({
        where: { slug_market: { slug, market: 'BR' } },
        update: {
          name: entry.name,
          websiteUrl: entry.websiteUrl,
          categoryId,
        },
        create: {
          name: entry.name,
          slug,
          websiteUrl: entry.websiteUrl,
          market: 'BR',
          categoryId,
        },
      });

      // Check for existing crawl source
      const existingSource = await prisma.crawlSource.findFirst({
        where: { brandId: brand.id, crawlMethod: 'HTML' },
      });

      if (!existingSource) {
        await prisma.crawlSource.create({
          data: {
            brandId: brand.id,
            name: `${entry.name} Deals`,
            crawlMethod: 'HTML',
            seedUrls: entry.seedUrls,
            maxDepth: 2,
            schedule: '0 4 * * *',
            agingDays: 7,
            market: 'BR',
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

  // 4. Summary of all BR sources
  const totalBRSources = await prisma.crawlSource.count({
    where: { market: 'BR', isActive: true },
  });
  console.log(`Total active BR sources: ${totalBRSources}`);
  console.log('\nDone! To trigger crawl: POST /admin/crawl/trigger-all');
}

main()
  .catch((e) => {
    console.error('Script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
