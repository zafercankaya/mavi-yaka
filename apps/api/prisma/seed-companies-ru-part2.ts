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
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ========== LOGISTICS_TRANSPORTATION (6) ==========
const LOGISTICS: CompanyEntry[] = [
  { name: 'Russian Railways RZD', websiteUrl: 'https://www.rzd.ru', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TransContainer', websiteUrl: 'https://www.trcont.ru', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fesco Transport', websiteUrl: 'https://www.fesco.ru', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Delovye Linii', websiteUrl: 'https://www.dellin.ru', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Baikal Service', websiteUrl: 'https://www.baikalsr.ru', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aeroflot Ground', websiteUrl: 'https://www.aeroflot.ru', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MANUFACTURING (6) ==========
const MANUFACTURING: CompanyEntry[] = [
  { name: 'Kirov Plant', websiteUrl: 'https://www.kirovplant.ru', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Uralvagonzavod', websiteUrl: 'https://www.uvz.ru', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Transmashholding', websiteUrl: 'https://www.tmholding.ru', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Izhmash Kalashnikov', websiteUrl: 'https://www.kalashnikov.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'OMZ Group', websiteUrl: 'https://www.omz.ru', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Silovye Mashiny', websiteUrl: 'https://www.power-m.ru', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
];

// ========== RETAIL (6) ==========
const RETAIL: CompanyEntry[] = [
  { name: 'Magnit Retail', websiteUrl: 'https://www.magnit.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'X5 Group Pyaterochka', websiteUrl: 'https://www.x5.ru', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lenta Supermarket', websiteUrl: 'https://www.lenta.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Diksi Group', websiteUrl: 'https://www.dixy.ru', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Svetofor Discounter', websiteUrl: null, sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: "O'Key Group", websiteUrl: 'https://www.okmarket.ru', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CONSTRUCTION (6) ==========
const CONSTRUCTION: CompanyEntry[] = [
  { name: 'PIK Group Construction', websiteUrl: 'https://www.pik.ru', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'LSR Group', websiteUrl: 'https://www.lsrgroup.ru', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Etalon Group', websiteUrl: 'https://www.etalongroup.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Samolet Group', websiteUrl: 'https://www.samolet.ru', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Setl Group', websiteUrl: 'https://www.setlgroup.ru', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MR Group', websiteUrl: 'https://www.mr-group.ru', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FOOD_BEVERAGE (6) ==========
const FOOD_BEVERAGE: CompanyEntry[] = [
  { name: 'Cherkizovo Group', websiteUrl: 'https://www.cherkizovo.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rusagro Group', websiteUrl: 'https://www.rusagrogroup.ru', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Efko Group', websiteUrl: 'https://www.efko.ru', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Miratorg Agribusiness', websiteUrl: 'https://www.miratorg.ru', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Agrocomplex Labinskiy', websiteUrl: null, sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Prostokvashino Danone', websiteUrl: 'https://www.danone.ru', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AUTOMOTIVE (6) ==========
const AUTOMOTIVE: CompanyEntry[] = [
  { name: 'KAMAZ Trucks', websiteUrl: 'https://www.kamaz.ru', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'AvtoVAZ Lada', websiteUrl: 'https://www.lada.ru', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'GAZ Group Vehicles', websiteUrl: 'https://www.gazgroup.ru', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'UAZ Motors', websiteUrl: 'https://www.uaz.ru', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sollers Auto', websiteUrl: 'https://www.sollers-auto.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Avtodor Roads', websiteUrl: 'https://www.russianhighways.ru', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TEXTILE (6) ==========
const TEXTILE: CompanyEntry[] = [
  { name: 'Gloria Jeans Factory', websiteUrl: 'https://www.gloria-jeans.ru', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Melon Fashion Group', websiteUrl: 'https://www.melonfashion.ru', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sportmaster Russia', websiteUrl: 'https://www.sportmaster.ru', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Detsky Mir', websiteUrl: 'https://www.detmir.ru', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Brusnika Fashion', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sela Fashion', websiteUrl: 'https://www.sela.ru', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MINING_ENERGY (6) ==========
const MINING_ENERGY: CompanyEntry[] = [
  { name: 'Gazprom Neft', websiteUrl: 'https://www.gazprom-neft.ru', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rosneft Oil', websiteUrl: 'https://www.rosneft.ru', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Novatek Gas', websiteUrl: 'https://www.novatek.ru', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nornickel Mining', websiteUrl: 'https://www.nornickel.ru', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Polyus Gold', websiteUrl: 'https://www.polyus.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alrosa Diamonds', websiteUrl: 'https://www.alrosa.ru', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HEALTHCARE (6) ==========
const HEALTHCARE: CompanyEntry[] = [
  { name: 'Medsi Clinics', websiteUrl: 'https://www.medsi.ru', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'EMC European Medical', websiteUrl: 'https://www.emcmos.ru', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Madre Hospital', websiteUrl: null, sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Invitro Diagnostics', websiteUrl: 'https://www.invitro.ru', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gemc Medical', websiteUrl: 'https://www.gfrmc.ru', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chaika Clinics', websiteUrl: 'https://www.chaika.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HOSPITALITY_TOURISM (5) ==========
const HOSPITALITY_TOURISM: CompanyEntry[] = [
  { name: 'Azimut Hotels Russia', websiteUrl: 'https://www.azimuthotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cosmos Hotel Group', websiteUrl: 'https://www.cosmosgroup.ru', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Amaks Hotels', websiteUrl: 'https://www.amfrks.ru', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Heliopark Hotels', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'VGIK Hotel Group', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AGRICULTURE (6) ==========
const AGRICULTURE: CompanyEntry[] = [
  { name: 'EkoNiva Agriculture', websiteUrl: 'https://www.ekoniva-apk.ru', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Agrokomplex Kubani', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Step Agroholding', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Prodimex Agriculture', websiteUrl: 'https://www.prodimex.ru', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aston Foods Russia', websiteUrl: 'https://www.aston.ru', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dominant Agriculture', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== SECURITY_SERVICES (6) ==========
const SECURITY_SERVICES: CompanyEntry[] = [
  { name: 'Garda Russia', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Oskar Security Russia', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Delta Security Moscow', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Redline Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bastion Security Russia', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alpha Security Group RU', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FACILITY_MANAGEMENT (5) ==========
const FACILITY_MANAGEMENT: CompanyEntry[] = [
  { name: 'Zhilishchnik Moscow', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chisty Gorod', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mosinzhproekt', websiteUrl: 'https://www.mosinzhproekt.ru', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Moscow Metro Facility', websiteUrl: 'https://www.mosmetro.ru', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Domovoy Facility', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
];

// ========== METAL_STEEL (6) ==========
const METAL_STEEL: CompanyEntry[] = [
  { name: 'Severstal Steel', websiteUrl: 'https://www.severstal.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NLMK Steel', websiteUrl: 'https://www.nlmk.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MMK Magnitogorsk', websiteUrl: 'https://www.mmk.ru', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Evraz Steel Russia', websiteUrl: 'https://www.evraz.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mechel Mining Steel', websiteUrl: 'https://www.mechel.ru', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TMK Pipe', websiteUrl: 'https://www.tmk-group.ru', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CHEMICALS_PLASTICS (6) ==========
const CHEMICALS_PLASTICS: CompanyEntry[] = [
  { name: 'Sibur Petrochemical', websiteUrl: 'https://www.sibur.ru', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PhosAgro Chemicals', websiteUrl: 'https://www.phosagro.ru', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'EuroChem Group', websiteUrl: 'https://www.eurochemgroup.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Acron Fertilizers', websiteUrl: 'https://www.acron.ru', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Uralchem Holding', websiteUrl: 'https://www.uralchem.ru', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nizhnekamskneftekhim', websiteUrl: 'https://www.nfrknc.ru', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== ECOMMERCE_CARGO (6) ==========
const ECOMMERCE_CARGO: CompanyEntry[] = [
  { name: 'Ozon Warehouse', websiteUrl: 'https://www.ozon.ru', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Wildberries Warehouse', websiteUrl: 'https://www.wildberries.ru', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yandex Lavka', websiteUrl: 'https://www.lavka.yandex.ru', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sber Mega Market', websiteUrl: 'https://www.sbermegamarket.ru', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Samokat Delivery', websiteUrl: 'https://www.samokat.ru', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Boxberry Logistics', websiteUrl: 'https://www.boxberry.ru', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TELECOMMUNICATIONS (6) ==========
const TELECOMMUNICATIONS: CompanyEntry[] = [
  { name: 'Rostelecom Infrastructure', websiteUrl: 'https://www.rt.ru', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MTS Towers', websiteUrl: 'https://www.mts.ru', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MegaFon Infrastructure', websiteUrl: 'https://www.megafon.ru', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Beeline Vimpelcom', websiteUrl: 'https://www.beeline.ru', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tele2 Russia', websiteUrl: 'https://www.tele2.ru', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ER-Telecom', websiteUrl: 'https://www.ertelecom.ru', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== OTHER (5) ==========
const OTHER: CompanyEntry[] = [
  { name: 'Sberbank Facility Services', websiteUrl: 'https://www.sberbank.ru', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Russian Post Pochta', websiteUrl: 'https://www.pochta.ru', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'VTB Arena Services', websiteUrl: 'https://www.vtb.ru', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rosatom Services', websiteUrl: 'https://www.rosatom.ru', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Roscosmos Services', websiteUrl: 'https://www.roscosmos.ru', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
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
  const market = Market.RU;
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
            name: `${entry.name} Вакансии`,
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
  console.log(`\n✓ RU part 2: ${created} created, ${existed} existed (total ${ALL_ENTRIES.length})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
