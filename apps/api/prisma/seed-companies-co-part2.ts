import { PrismaClient, Market, Sector, SourceType, CrawlMethod } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const prisma = new PrismaClient();

interface CompanyEntry {
  name: string;
  websiteUrl: string | null;
  sector: Sector;
  sourceType: SourceType;
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[áàäâã]/g, 'a').replace(/[éèëê]/g, 'e').replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o').replace(/[úùüû]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ========== LOGISTICS_TRANSPORTATION (5) ==========
const LOGISTICS: CompanyEntry[] = [
  { name: 'Coordinadora Mercantil', websiteUrl: 'https://www.coordinadora.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TCC Transporte', websiteUrl: 'https://www.tcc.com.co', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Deprisa Colombia', websiteUrl: 'https://www.deprisa.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Envía Colvanes', websiteUrl: 'https://www.enviacolvanes.com.co', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Saferbo Logística', websiteUrl: 'https://www.saferbo.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MANUFACTURING (5) ==========
const MANUFACTURING: CompanyEntry[] = [
  { name: 'Familia Sancela', websiteUrl: 'https://www.grupofamilia.com.co', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Haceb Electrodomésticos', websiteUrl: 'https://www.haceb.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Peldar Vidrio', websiteUrl: 'https://www.o-i.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Incolmotos Yamaha', websiteUrl: 'https://www.yamaha-motor.com.co', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Colcerámica Corona', websiteUrl: 'https://www.corona.co', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
];

// ========== RETAIL (5) ==========
const RETAIL: CompanyEntry[] = [
  { name: 'Alkosto Colombia', websiteUrl: 'https://www.alkosto.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Olímpica Supermercados', websiteUrl: 'https://www.olimpica.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Jumbo Colombia', websiteUrl: 'https://www.tiendasjumbo.co', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'D1 Tiendas', websiteUrl: 'https://www.d1.com.co', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ara Tiendas', websiteUrl: 'https://www.arfratiendas.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CONSTRUCTION (4) ==========
const CONSTRUCTION: CompanyEntry[] = [
  { name: 'Conconcreto', websiteUrl: 'https://www.conconcreto.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Constructora Bolívar', websiteUrl: 'https://www.constructorabolivar.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Odinsa Colombia', websiteUrl: 'https://www.odinsa.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Amarilo Constructora', websiteUrl: 'https://www.amarilo.com.co', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FOOD_BEVERAGE (5) ==========
const FOOD_BEVERAGE: CompanyEntry[] = [
  { name: 'Zenú Alimentos', websiteUrl: 'https://www.zenu.com.co', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Noel Galletas', websiteUrl: 'https://www.noel.com.co', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alquería Lácteos', websiteUrl: 'https://www.alqueria.com.co', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ramo Productos', websiteUrl: 'https://www.ramo.com.co', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Team Alimentos', websiteUrl: 'https://www.team.com.co', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AUTOMOTIVE (4) ==========
const AUTOMOTIVE: CompanyEntry[] = [
  { name: 'Sofasa Renault Colombia', websiteUrl: 'https://www.renault.com.co', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'GM Colmotores', websiteUrl: 'https://www.chevrolet.com.co', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Autogermana BMW', websiteUrl: 'https://www.autogermana.com.co', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mazda Colombia', websiteUrl: 'https://www.mazda.com.co', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TEXTILE (4) ==========
const TEXTILE: CompanyEntry[] = [
  { name: 'Fabricato Textil', websiteUrl: 'https://www.fabricato.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Coltejer Textiles', websiteUrl: 'https://www.coltejer.com.co', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Leonisa Ropa Interior', websiteUrl: 'https://www.leonisa.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CI Jeans Colombia', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MINING_ENERGY (5) ==========
const MINING_ENERGY: CompanyEntry[] = [
  { name: 'Cerrejón Carbón', websiteUrl: 'https://www.cerrejon.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Drummond Colombia', websiteUrl: 'https://www.drummondltd.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Celsia Energía', websiteUrl: 'https://www.celsia.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Isagén Hidroeléctrica', websiteUrl: 'https://www.isagen.com.co', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Promigas Colombia', websiteUrl: 'https://www.promigas.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HEALTHCARE (5) ==========
const HEALTHCARE: CompanyEntry[] = [
  { name: 'Fundación Santa Fe', websiteUrl: 'https://www.fsfb.org.co', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Clínica del Country', websiteUrl: 'https://www.clinicadelcountry.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hospital Pablo Tobón Uribe', websiteUrl: 'https://www.hptu.org.co', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fundación Valle del Lili', websiteUrl: 'https://www.valledellili.org', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Compensar Salud', websiteUrl: 'https://www.compensar.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HOSPITALITY_TOURISM (4) ==========
const HOSPITALITY_TOURISM: CompanyEntry[] = [
  { name: 'Hoteles Estelar', websiteUrl: 'https://www.hotelesestelar.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'GHL Hoteles', websiteUrl: 'https://www.gfrhlhoteles.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dann Carlton Hotels', websiteUrl: 'https://www.danncarlton.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Decameron Colombia', websiteUrl: 'https://www.decameron.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AGRICULTURE (5) ==========
const AGRICULTURE: CompanyEntry[] = [
  { name: 'Fedepalma Colombia', websiteUrl: 'https://www.fedepalma.org', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Federación Nacional de Cafeteros', websiteUrl: 'https://www.federaciondecafeteros.org', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Riopaila Castilla', websiteUrl: 'https://www.rfriopaila-castilla.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Manuelita Azúcar', websiteUrl: 'https://www.manuelita.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Syngenta Colombia', websiteUrl: 'https://www.syngenta.com.co', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== SECURITY_SERVICES (5) ==========
const SECURITY_SERVICES: CompanyEntry[] = [
  { name: 'Seguridad Atlas', websiteUrl: 'https://www.seguridadatlas.com.co', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'G4S Colombia', websiteUrl: 'https://www.g4s.com.co', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Securitas Colombia', websiteUrl: 'https://www.securitas.com.co', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vise Seguridad', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fortox Seguridad', websiteUrl: 'https://www.fortfrox.co', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FACILITY_MANAGEMENT (4) ==========
const FACILITY_MANAGEMENT: CompanyEntry[] = [
  { name: 'Sodexo Colombia', websiteUrl: 'https://www.sodexo.com.co', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Serviaseo Colombia', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Brilladora El Diamante', websiteUrl: 'https://www.diamante.com.co', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Casalimpia Colombia', websiteUrl: 'https://www.casalimpia.com.co', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
];

// ========== METAL_STEEL (4) ==========
const METAL_STEEL: CompanyEntry[] = [
  { name: 'Acerías Paz del Río', websiteUrl: 'https://www.pazdelrio.com.co', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Diaco Acero', websiteUrl: 'https://www.difraco.com.co', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sidenal Aceros', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ternium Colombia', websiteUrl: 'https://www.ternium.com/co', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CHEMICALS_PLASTICS (4) ==========
const CHEMICALS_PLASTICS: CompanyEntry[] = [
  { name: 'Monómeros Colombo Venezolanos', websiteUrl: 'https://www.monomeros.com.co', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mexichem Colombia', websiteUrl: 'https://www.orbia.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Brenntag Colombia', websiteUrl: 'https://www.brenntag.com/co', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pintuco Pinturas', websiteUrl: 'https://www.pintuco.com.co', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== ECOMMERCE_CARGO (4) ==========
const ECOMMERCE_CARGO: CompanyEntry[] = [
  { name: 'Mercado Libre Colombia Bodega', websiteUrl: 'https://www.mercadolibre.com.co', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rappi Logística', websiteUrl: 'https://www.rappi.com.co', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Falabella Colombia Online', websiteUrl: 'https://www.falabella.com.co', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Linio Colombia Bodega', websiteUrl: 'https://www.linio.com.co', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TELECOMMUNICATIONS (4) ==========
const TELECOMMUNICATIONS: CompanyEntry[] = [
  { name: 'Tigo Colombia Infraestructura', websiteUrl: 'https://www.tigo.com.co', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Claro Colombia Infraestructura', websiteUrl: 'https://www.claro.com.co', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Movistar Colombia Campo', websiteUrl: 'https://www.movistar.com.co', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ETB Bogotá Telecom', websiteUrl: 'https://www.etb.com.co', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== OTHER (4) ==========
const OTHER: CompanyEntry[] = [
  { name: 'SENA Colombia', websiteUrl: 'https://www.sena.edu.co', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'Caja de Compensación Colsubsidio', websiteUrl: 'https://www.colsubsidio.com', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Comfama Medellín', websiteUrl: 'https://www.comfama.com', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cafam Compensación', websiteUrl: 'https://www.cafam.com.co', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
];

const ALL_ENTRIES: CompanyEntry[] = [
  ...LOGISTICS,
  ...MANUFACTURING,
  ...RETAIL,
  ...CONSTRUCTION,
  ...FOOD_BEVERAGE,
  ...AUTOMOTIVE,
  ...TEXTILE,
  ...MINING_ENERGY,
  ...HEALTHCARE,
  ...HOSPITALITY_TOURISM,
  ...AGRICULTURE,
  ...SECURITY_SERVICES,
  ...FACILITY_MANAGEMENT,
  ...METAL_STEEL,
  ...CHEMICALS_PLASTICS,
  ...ECOMMERCE_CARGO,
  ...TELECOMMUNICATIONS,
  ...OTHER,
];

async function main() {
  const market = Market.CO;
  console.log(`Seeding ${ALL_ENTRIES.length} ${market} companies (part 2)...`);
  let created = 0, existed = 0;
  for (const entry of ALL_ENTRIES) {
    const slug = slugify(entry.name);
    try {
      const company = await prisma.company.upsert({
        where: { slug_market: { slug, market } },
        update: { websiteUrl: entry.websiteUrl ?? undefined, sector: entry.sector },
        create: { name: entry.name, slug, market, sector: entry.sector, websiteUrl: entry.websiteUrl, isActive: true },
      });
      const src = await prisma.crawlSource.findFirst({ where: { companyId: company.id } });
      if (!src) {
        await prisma.crawlSource.create({
          data: {
            companyId: company.id,
            name: `${entry.name} Empleos`,
            type: entry.sourceType as any,
            crawlMethod: CrawlMethod.HTML,
            seedUrls: [],
            schedule: '0 3 * * *',
            agingDays: 14,
            market,
            isActive: true,
          },
        });
        created++;
      } else { existed++; }
    } catch (e: any) {
      if (e.code === 'P2002') { existed++; } else { console.error(`Error: ${entry.name}:`, e.message); }
    }
  }
  console.log(`\n✓ CO part 2: ${created} created, ${existed} existed (total ${ALL_ENTRIES.length})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
