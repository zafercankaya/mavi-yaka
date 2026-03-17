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
    .replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íì]/g, 'i')
    .replace(/[óòôõ]/g, 'o').replace(/[úù]/g, 'u').replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const ALL_ENTRIES: CompanyEntry[] = [
// ========== LOGISTICS_TRANSPORTATION (9) ==========
  { name: 'Redpack', websiteUrl: 'https://www.redpack.com.mx', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Paquetexpress', websiteUrl: 'https://www.paquetexpress.com.mx', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Castores', websiteUrl: 'https://www.castores.com.mx', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TUM Transportes', websiteUrl: 'https://www.tum.com.mx', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Traxion', websiteUrl: 'https://www.traxion.global', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'FRISA Transportes', websiteUrl: null, sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'VivaAerobus', websiteUrl: 'https://www.vivaaerobus.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo ADO', websiteUrl: 'https://www.ado.com.mx', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo IAMSA', websiteUrl: 'https://www.iamsa.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

// ========== MANUFACTURING (9) ==========
  { name: 'Grupo Kuo', websiteUrl: 'https://www.kuo.com.mx', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Industrial Saltillo', websiteUrl: 'https://www.gis.com.mx', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mabe', websiteUrl: 'https://www.mabe.com.mx', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vitro', websiteUrl: 'https://www.vitro.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Metalsa', websiteUrl: 'https://www.metalsa.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rotoplas', websiteUrl: 'https://www.rotoplas.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Coppel Manufactura', websiteUrl: null, sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Whirlpool Mexico', websiteUrl: 'https://www.whirlpool.com.mx', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Samsung Mexico', websiteUrl: 'https://www.samsung.com/mx', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

// ========== RETAIL (9) ==========
  { name: 'Grupo Coppel', websiteUrl: 'https://www.coppel.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Farmacias del Ahorro', websiteUrl: 'https://www.fahorro.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Farmacias Guadalajara', websiteUrl: 'https://www.farmaciasguadalajara.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Elektra', websiteUrl: 'https://www.elektra.com.mx', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'HEB Mexico', websiteUrl: 'https://www.heb.com.mx', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Costco Mexico', websiteUrl: 'https://www.costco.com.mx', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sam Club Mexico', websiteUrl: 'https://www.sams.com.mx', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Palacio de Hierro', websiteUrl: 'https://www.elpalaciodehierro.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'La Comer', websiteUrl: 'https://www.lacomer.com.mx', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

// ========== CONSTRUCTION (9) ==========
  { name: 'Grupo Carso Infraestructura', websiteUrl: 'https://www.grupocarso.com.mx', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Empresas ICA', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'IDEAL', websiteUrl: 'https://www.ideal.com.mx', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pinfra', websiteUrl: 'https://www.pfrinfra.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Cementos Chihuahua', websiteUrl: 'https://www.gcc.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Elementia', websiteUrl: 'https://www.elementia.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CICSA', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Constructora y Perforadora Latina', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Marhnos', websiteUrl: 'https://www.marhnos.com.mx', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

// ========== FOOD_BEVERAGE (9) ==========
  { name: 'Grupo Herdez', websiteUrl: 'https://www.grupoherdez.com.mx', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Modelo', websiteUrl: 'https://www.grupomodelo.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Coca-Cola FEMSA', websiteUrl: 'https://www.coca-colafemsa.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PepsiCo Mexico', websiteUrl: 'https://www.pepsico.com.mx', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nestlé Mexico', websiteUrl: 'https://www.nestle.com.mx', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sigma Alimentos', websiteUrl: 'https://www.sigma-alimentos.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'La Costeña', websiteUrl: 'https://www.lacostena.com.mx', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Lala MX', websiteUrl: 'https://www.lala.com.mx', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Industrias Peñoles Alimentos', websiteUrl: null, sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

// ========== AUTOMOTIVE (9) ==========
  { name: 'Nissan Mexicana', websiteUrl: 'https://www.nissan.com.mx', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Volkswagen Mexico', websiteUrl: 'https://www.vw.com.mx', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'General Motors Mexico', websiteUrl: 'https://www.gm.com.mx', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Toyota Mexico', websiteUrl: 'https://www.toyota.com.mx', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ford Mexico', websiteUrl: 'https://www.ford.mx', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'BMW Mexico', websiteUrl: 'https://www.bmw.com.mx', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Honda Mexico', websiteUrl: 'https://www.honda.mx', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kia Mexico', websiteUrl: 'https://www.kia.com/mx', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Stellantis Mexico', websiteUrl: 'https://www.stellantis.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

// ========== TEXTILE (9) ==========
  { name: 'Grupo Avante Textil', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Industrias Cannon', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Denim', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Parras Cone', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Karani Textil', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Texcoco', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Levi Strauss Mexico', websiteUrl: 'https://www.levi.com.mx', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yakima Textiles', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hilasal Mexicana', websiteUrl: 'https://www.hilasal.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

// ========== MINING_ENERGY (9) ==========
  { name: 'Industrias Peñoles', websiteUrl: 'https://www.penoles.com.mx', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fresnillo PLC', websiteUrl: 'https://www.fresnilloplc.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Minera Alamos', websiteUrl: null, sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'First Majestic Silver MX', websiteUrl: 'https://www.firstmajestic.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Bal Minería', websiteUrl: null, sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'IEnova', websiteUrl: 'https://www.ienova.com.mx', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Iberdrola Mexico', websiteUrl: 'https://www.iberdrola.mx', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Enel Mexico', websiteUrl: 'https://www.enel.mx', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Naturgy Mexico', websiteUrl: 'https://www.naturgy.com.mx', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

// ========== HEALTHCARE (9) ==========
  { name: 'Grupo Christus Muguerza', websiteUrl: 'https://www.christusmuguerza.com.mx', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hospital Médica Sur', websiteUrl: 'https://www.medicasur.com.mx', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Star Médica', websiteUrl: 'https://www.starmedica.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Laboratorios Sanfer', websiteUrl: 'https://www.sanfer.com.mx', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Laboratorios Sophia', websiteUrl: 'https://www.sophia.com.mx', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Genomma Lab', websiteUrl: 'https://www.genommalab.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Farmacéuticos Maypo', websiteUrl: null, sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pisa Farmacéutica', websiteUrl: 'https://www.pfrfarmaceutica.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'IMSS Hospitales', websiteUrl: 'https://www.imss.gob.mx', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

// ========== HOSPITALITY_TOURISM (9) ==========
  { name: 'Grupo Vidanta', websiteUrl: 'https://www.grupovivanta.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Palace Resorts', websiteUrl: 'https://www.palaceresorts.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'RIU Hotels Mexico', websiteUrl: 'https://www.riu.com/es/hotel/mexico', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'City Express Hoteles', websiteUrl: 'https://www.cityexpress.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fiesta Americana', websiteUrl: 'https://www.fiestamericana.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ostar Grupo Hotelero', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hard Rock Hotel Mexico', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Marriott Mexico', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hilton Mexico', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

// ========== AGRICULTURE (9) ==========
  { name: 'Grupo Viz Agropecuario', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SuKarne', websiteUrl: 'https://www.sukarne.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Agrofin', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Driscoll Mexico', websiteUrl: 'https://www.driscolls.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mission Produce MX', websiteUrl: 'https://www.missionproduce.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Agromod Semillas', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Granjas Carroll', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pilgrim Pride Mexico', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cargill Mexico', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

// ========== SECURITY_SERVICES (9) ==========
  { name: 'Seguritec', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SEPROTEC Seguridad', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Multisistemas de Seguridad', websiteUrl: 'https://www.multisistemas.com.mx', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Securitas Mexico', websiteUrl: 'https://www.securitas.com.mx', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'G4S Mexico', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grumer Seguridad Privada', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SITE Seguridad', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Cusaem', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Allied Universal Mexico', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

// ========== FACILITY_MANAGEMENT (9) ==========
  { name: 'ISS Mexico', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sodexo Mexico', websiteUrl: 'https://www.sodexo.com.mx', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Compass Group Mexico', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CBRE Mexico', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'JLL Mexico', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cushman Wakefield Mexico', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Limpieza Total MX', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Servilimpia', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Limpiatec', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

// ========== METAL_STEEL (9) ==========
  { name: 'AHMSA', websiteUrl: 'https://www.ahmsa.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Deacero', websiteUrl: 'https://www.deacero.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aceros Corsa', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ArcelorMittal Mexico', websiteUrl: 'https://mexico.arcelormittal.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gerdau Corsa', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nucor Mexico', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Villacero', websiteUrl: 'https://www.villacero.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TAMSA Tubos de Acero', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Industrias CH', websiteUrl: 'https://www.industriasch.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },

// ========== CHEMICALS_PLASTICS (9) ==========
  { name: 'Mexichem (Orbia MX)', websiteUrl: 'https://www.orbia.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo Pochteca', websiteUrl: 'https://www.pochteca.com.mx', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'BASF Mexico', websiteUrl: 'https://www.basf.com/mx', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dow Mexico', websiteUrl: 'https://www.dow.com/es-mx', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Indorama Ventures MX', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Resirene', websiteUrl: 'https://www.resirene.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Polímeros Nacionales', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Quimir', websiteUrl: 'https://www.quimir.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dynasol Elastomers MX', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },

// ========== ECOMMERCE_CARGO (9) ==========
  { name: 'Mercado Libre Mexico', websiteUrl: 'https://www.mercadolibre.com.mx', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Amazon Mexico', websiteUrl: 'https://www.amazon.com.mx', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rappi Mexico', websiteUrl: 'https://www.rappi.com.mx', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Uber Eats Mexico', websiteUrl: null, sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'DiDi Mexico', websiteUrl: 'https://www.didiglobal.com/mx', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Enviaflores Logistica', websiteUrl: null, sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'iVoy', websiteUrl: 'https://www.ivoy.mx', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Skydropx', websiteUrl: 'https://www.skydropx.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: '99 Minutos', websiteUrl: 'https://www.99minutos.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },

// ========== TELECOMMUNICATIONS (9) ==========
  { name: 'América Móvil MX', websiteUrl: 'https://www.americamovil.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'AT&T Mexico', websiteUrl: 'https://www.att.com.mx', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Megacable', websiteUrl: 'https://www.megacable.com.mx', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Telmex', websiteUrl: 'https://www.telmex.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Totalplay', websiteUrl: 'https://www.totalplay.com.mx', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Axtel', websiteUrl: 'https://www.axtel.com.mx', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Altan Redes', websiteUrl: 'https://www.altanredes.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dish Mexico', websiteUrl: 'https://www.dish.com.mx', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sky Mexico', websiteUrl: 'https://www.sky.com.mx', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

async function main() {
  const market = Market.MX;
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
  console.log(`Done! Created: ${created}, Already existed: ${existed}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
