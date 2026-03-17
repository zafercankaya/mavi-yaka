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

// ========== LOGISTICS_TRANSPORTATION (5) ==========
const LOGISTICS: CompanyEntry[] = [
  { name: 'Transnet Freight Rail', websiteUrl: 'https://www.transnet.net', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Unitrans Supply Chain', websiteUrl: 'https://www.unitrans.co.za', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Barloworld Logistics', websiteUrl: 'https://www.barloworld-logistics.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Imperial Logistics SA', websiteUrl: 'https://www.imperiallogistics.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Supergroup Logistics', websiteUrl: 'https://www.supergroup.co.za', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MANUFACTURING (5) ==========
const MANUFACTURING: CompanyEntry[] = [
  { name: 'Nampak Packaging', websiteUrl: 'https://www.nampak.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Barloworld Equipment', websiteUrl: 'https://www.barloworld-equipment.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Reunert Limited', websiteUrl: 'https://www.reunert.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hudaco Industries', websiteUrl: 'https://www.hudaco.co.za', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bell Equipment SA', websiteUrl: 'https://www.bellequipment.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
];

// ========== RETAIL (5) ==========
const RETAIL: CompanyEntry[] = [
  { name: 'Shoprite Holdings', websiteUrl: 'https://www.shopriteholdings.co.za', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Spar Group SA', websiteUrl: 'https://www.spar.co.za', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Massmart Holdings', websiteUrl: 'https://www.massmart.co.za', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pepkor Holdings', websiteUrl: 'https://www.pepkor.co.za', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mr Price Group', websiteUrl: 'https://www.mrpricegroup.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CONSTRUCTION (5) ==========
const CONSTRUCTION: CompanyEntry[] = [
  { name: 'Murray Roberts Construction', websiteUrl: 'https://www.mfrurrayandroberts.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'WBHO Construction', websiteUrl: 'https://www.wbho.co.za', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Stefanutti Stocks', websiteUrl: 'https://www.stefstocks.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Raubex Group', websiteUrl: 'https://www.raubex.co.za', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aveng Group', websiteUrl: 'https://www.aveng.co.za', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FOOD_BEVERAGE (5) ==========
const FOOD_BEVERAGE: CompanyEntry[] = [
  { name: 'Tiger Brands Foods', websiteUrl: 'https://www.tigerbrands.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'RCL Foods', websiteUrl: 'https://www.rclfoods.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pioneer Foods', websiteUrl: 'https://www.pioneerfoods.co.za', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Clover Industries', websiteUrl: 'https://www.clover.co.za', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Distell Group', websiteUrl: 'https://www.distell.co.za', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AUTOMOTIVE (5) ==========
const AUTOMOTIVE: CompanyEntry[] = [
  { name: 'Toyota SA Manufacturing', websiteUrl: 'https://www.toyota.co.za', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Volkswagen SA Plant', websiteUrl: 'https://www.vw.co.za', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'BMW SA Rosslyn', websiteUrl: 'https://www.bmw.co.za', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mercedes-Benz SA Plant', websiteUrl: 'https://www.mercedes-benz.co.za', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nissan SA Rosslyn', websiteUrl: 'https://www.nissan.co.za', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TEXTILE (5) ==========
const TEXTILE: CompanyEntry[] = [
  { name: 'Edcon Group', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Foschini Group TFG', websiteUrl: 'https://www.tfg.co.za', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Truworths International', websiteUrl: 'https://www.truworths.co.za', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rex Trueform', websiteUrl: 'https://www.rfrextrueform.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cape Union Mart', websiteUrl: 'https://www.capeunionmart.co.za', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MINING_ENERGY (6) ==========
const MINING_ENERGY: CompanyEntry[] = [
  { name: 'Sasol Energy', websiteUrl: 'https://www.sasol.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Eskom Power', websiteUrl: 'https://www.eskom.co.za', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gold Fields SA', websiteUrl: 'https://www.goldfields.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sibanye Stillwater', websiteUrl: 'https://www.sibanyestillwater.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Harmony Gold Mining', websiteUrl: 'https://www.harmony.co.za', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Impala Platinum', websiteUrl: 'https://www.implats.co.za', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HEALTHCARE (5) ==========
const HEALTHCARE: CompanyEntry[] = [
  { name: 'Netcare Limited', websiteUrl: 'https://www.netcare.co.za', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mediclinic Southern Africa', websiteUrl: 'https://www.mediclinic.co.za', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Life Healthcare SA', websiteUrl: 'https://www.lifehealthcare.co.za', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Discovery Health SA', websiteUrl: 'https://www.discovery.co.za', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Clicks Group Healthcare', websiteUrl: 'https://www.clicks.co.za', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HOSPITALITY_TOURISM (5) ==========
const HOSPITALITY_TOURISM: CompanyEntry[] = [
  { name: 'Sun International Hotels', websiteUrl: 'https://www.suninternational.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tsogo Sun Hotels', websiteUrl: 'https://www.tsogosun.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'City Lodge Hotels', websiteUrl: 'https://www.citylodgehotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Protea Hotels SA', websiteUrl: 'https://www.marriott.com/protea-hotels', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'South African Airways Ground', websiteUrl: 'https://www.flysaa.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AGRICULTURE (5) ==========
const AGRICULTURE: CompanyEntry[] = [
  { name: 'Tongaat Hulett', websiteUrl: 'https://www.tongaat.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Astral Foods', websiteUrl: 'https://www.astralfoods.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Senwes Agriculture', websiteUrl: 'https://www.senwes.co.za', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Afgri Group', websiteUrl: 'https://www.afgri.co.za', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Illovo Sugar Africa', websiteUrl: 'https://www.illovosugarfrafrica.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== SECURITY_SERVICES (5) ==========
const SECURITY_SERVICES: CompanyEntry[] = [
  { name: 'Fidelity Services Group', websiteUrl: 'https://www.fidelity-services.com', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ADT South Africa', websiteUrl: 'https://www.adt.co.za', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chubb Fire Safety ZA', websiteUrl: 'https://www.chubb.co.za', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bidvest Protea Coin', websiteUrl: 'https://www.proteacoin.co.za', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thorburn Security', websiteUrl: 'https://www.thorburnfrsecurity.co.za', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FACILITY_MANAGEMENT (5) ==========
const FACILITY_MANAGEMENT: CompanyEntry[] = [
  { name: 'Tsebo Solutions Group', websiteUrl: 'https://www.tsebo.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bidvest Facilities', websiteUrl: 'https://www.bidvest.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Supercare Cleaning', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'LG Facility Management SA', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Clean-All Services ZA', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
];

// ========== METAL_STEEL (5) ==========
const METAL_STEEL: CompanyEntry[] = [
  { name: 'ArcelorMittal South Africa Plant', websiteUrl: 'https://www.arcelormittalsa.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Evraz Highveld Steel', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hulamin Aluminium', websiteUrl: 'https://www.hulamin.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Samancor Chrome', websiteUrl: 'https://www.samancor.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Columbus Stainless', websiteUrl: 'https://www.columbus.co.za', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CHEMICALS_PLASTICS (5) ==========
const CHEMICALS_PLASTICS: CompanyEntry[] = [
  { name: 'AECI Limited', websiteUrl: 'https://www.aeciworld.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Omnia Holdings', websiteUrl: 'https://www.omnia.co.za', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kansai Plascon SA', websiteUrl: 'https://www.plascon.co.za', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NCP Chlorchem', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chemspec South Africa', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== ECOMMERCE_CARGO (5) ==========
const ECOMMERCE_CARGO: CompanyEntry[] = [
  { name: 'Takealot Warehouse', websiteUrl: 'https://www.takealot.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Superbalist Fulfilment', websiteUrl: 'https://www.superbalist.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bob Shop Logistics', websiteUrl: 'https://www.bobshop.co.za', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Zando Warehouse', websiteUrl: 'https://www.zando.co.za', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'The Courier Guy ZA', websiteUrl: 'https://www.thecourierguy.co.za', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TELECOMMUNICATIONS (5) ==========
const TELECOMMUNICATIONS: CompanyEntry[] = [
  { name: 'Vodacom Field Services', websiteUrl: 'https://www.vodacom.co.za', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MTN SA Infrastructure', websiteUrl: 'https://www.mtn.co.za', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Telkom SA Infrastructure', websiteUrl: 'https://www.telkom.co.za', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cell C Field Operations', websiteUrl: 'https://www.cellc.co.za', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rain 5G Network', websiteUrl: 'https://www.rain.co.za', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== OTHER (3) ==========
const OTHER: CompanyEntry[] = [
  { name: 'Transnet SOC', websiteUrl: 'https://www.transnet.net', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Eskom Holdings SOC', websiteUrl: 'https://www.eskom.co.za', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'South African Post Office', websiteUrl: 'https://www.postoffice.co.za', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
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
  const market = Market.ZA;
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
            name: `${entry.name} Careers`,
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
  console.log(`\n✓ ZA part 2: ${created} created, ${existed} existed (total ${ALL_ENTRIES.length})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
