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
  { name: 'Uber Freight', websiteUrl: 'https://www.uberfreight.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Prime Inc', websiteUrl: 'https://www.primeinc.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Crete Carrier', websiteUrl: 'https://www.cretecarrier.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hub Group', websiteUrl: 'https://www.hubgroup.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Radiant Logistics', websiteUrl: 'https://www.radiantdelivers.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Atlas Air', websiteUrl: 'https://www.atlasair.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MANUFACTURING (6) ==========
const MANUFACTURING: CompanyEntry[] = [
  { name: 'Parker Hannifin Manufacturing', websiteUrl: 'https://www.parker.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Textron Aviation', websiteUrl: 'https://txtav.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Masco Corporation', websiteUrl: 'https://www.masco.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'A.O. Smith', websiteUrl: 'https://www.aosmith.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nordson Corporation', websiteUrl: 'https://www.nordson.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hubbell Manufacturing', websiteUrl: 'https://www.hubbell.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
];

// ========== RETAIL (6) ==========
const RETAIL: CompanyEntry[] = [
  { name: 'Menards', websiteUrl: 'https://www.menards.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'BJ Wholesale Club', websiteUrl: 'https://www.bjs.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Floor & Decor', websiteUrl: 'https://www.flooranddecor.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dicks Sporting Goods', websiteUrl: 'https://www.dickssportinggoods.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rural King', websiteUrl: 'https://www.ruralking.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tuesday Morning', websiteUrl: 'https://www.tuesdaymorning.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CONSTRUCTION (6) ==========
const CONSTRUCTION: CompanyEntry[] = [
  { name: 'Granite Telecomm Construction', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sundt Construction', websiteUrl: 'https://www.sundt.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Robins & Morton Construction', websiteUrl: 'https://www.robinsmorton.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Power Construction', websiteUrl: 'https://www.powerconstruction.net', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mortenson Construction', websiteUrl: 'https://www.mortenson.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Manhattan Construction', websiteUrl: 'https://www.manhattanconstruction.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FOOD_BEVERAGE (6) ==========
const FOOD_BEVERAGE: CompanyEntry[] = [
  { name: 'Wawa', websiteUrl: 'https://www.wawa.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sheetz', websiteUrl: 'https://www.sheetz.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Culvers', websiteUrl: 'https://www.culvers.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Zaxbys', websiteUrl: 'https://www.zaxbys.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Raising Canes', websiteUrl: 'https://www.raisingcanes.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Portillos', websiteUrl: 'https://www.portillos.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AUTOMOTIVE (6) ==========
const AUTOMOTIVE: CompanyEntry[] = [
  { name: 'Rivian Automotive', websiteUrl: 'https://rivian.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lucid Motors Automotive', websiteUrl: 'https://www.lucidmotors.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Navistar', websiteUrl: 'https://www.navistar.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cummins Inc', websiteUrl: 'https://www.cummins.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Allison Transmission', websiteUrl: 'https://www.allisontransmission.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Modine Manufacturing Corp', websiteUrl: 'https://www.modine.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TEXTILE (6) ==========
const TEXTILE: CompanyEntry[] = [
  { name: 'Mohawk Industries', websiteUrl: 'https://www.mohawkind.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Shaw Industries', websiteUrl: 'https://www.shawinc.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Interface Inc', websiteUrl: 'https://www.interface.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Milliken & Company', websiteUrl: 'https://www.milliken.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mount Vernon Mills', websiteUrl: 'https://www.mvmills.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Springs Industries', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MINING_ENERGY (6) ==========
const MINING_ENERGY: CompanyEntry[] = [
  { name: 'Consol Mining', websiteUrl: 'https://www.consolenergy.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vistra Energy', websiteUrl: 'https://www.vistraenergy.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Talen Energy', websiteUrl: 'https://www.talenenergy.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Arch Coal', websiteUrl: null, sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kinross Gold US', websiteUrl: 'https://www.kinross.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Minerals Technologies', websiteUrl: 'https://www.mineralstech.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HEALTHCARE (6) ==========
const HEALTHCARE: CompanyEntry[] = [
  { name: 'Molina Healthcare', websiteUrl: 'https://www.molinahealthcare.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Centene Corporation', websiteUrl: 'https://www.centene.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Acadia Healthcare', websiteUrl: 'https://www.acadiahealthcare.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Henry Ford Health', websiteUrl: 'https://www.henryford.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sanford Health', websiteUrl: 'https://www.sanfordhealth.org', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Geisinger Health', websiteUrl: 'https://www.geisinger.org', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HOSPITALITY_TOURISM (6) ==========
const HOSPITALITY_TOURISM: CompanyEntry[] = [
  { name: 'Great Wolf Resorts', websiteUrl: 'https://www.greatwolf.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cracker Barrel Old Country', websiteUrl: 'https://www.crackerbarrel.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Darden Restaurants', websiteUrl: 'https://www.darden.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bloomin Brands', websiteUrl: 'https://www.bloominbrands.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aramark Hospitality', websiteUrl: 'https://www.aramark.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Host Hotels', websiteUrl: 'https://www.hosthotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AGRICULTURE (6) ==========
const AGRICULTURE: CompanyEntry[] = [
  { name: 'Deere & Company', websiteUrl: 'https://www.deere.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nutrien US', websiteUrl: 'https://www.nutrien.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Scoular Company', websiteUrl: 'https://www.scoular.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dairy Farmers of America', websiteUrl: 'https://www.dfamilk.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Land O Lakes', websiteUrl: 'https://www.landolakesinc.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cal-Maine Foods', websiteUrl: 'https://www.calmainefoods.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== SECURITY_SERVICES (6) ==========
const SECURITY_SERVICES: CompanyEntry[] = [
  { name: 'Brinks US', websiteUrl: 'https://www.brinks.com', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Prosegur Security US', websiteUrl: 'https://www.prosegur.us', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Metro One Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'National Security Alarms', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Titan Security Group', websiteUrl: 'https://www.titan-security.com', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Protos Security', websiteUrl: 'https://www.protossecurity.com', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FACILITY_MANAGEMENT (6) ==========
const FACILITY_MANAGEMENT: CompanyEntry[] = [
  { name: 'ABM Industries Facilities', websiteUrl: 'https://www.abm.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pritchard Industries Facilities', websiteUrl: 'https://www.pritchardindustries.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ISS Facility US', websiteUrl: 'https://www.us.issworld.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'DTZ Facilities', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ServiceMaster Facilities', websiteUrl: 'https://www.servicemaster.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Marsden Facilities', websiteUrl: 'https://www.marsden.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
];

// ========== METAL_STEEL (6) ==========
const METAL_STEEL: CompanyEntry[] = [
  { name: 'Nucor Steel', websiteUrl: 'https://www.nucor.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Steel Technologies', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Metals USA Steel', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Schnitzer Steel', websiteUrl: 'https://www.schnitzersteel.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Steel Partners Holdings', websiteUrl: 'https://www.steelpartners.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Northwest Pipe Company', websiteUrl: 'https://www.nwpipe.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CHEMICALS_PLASTICS (6) ==========
const CHEMICALS_PLASTICS: CompanyEntry[] = [
  { name: 'Ashland Chemical', websiteUrl: 'https://www.ashland.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Olin Chemical', websiteUrl: 'https://www.olin.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PolyOne Corporation', websiteUrl: 'https://www.avient.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Trinseo', websiteUrl: 'https://www.trinseo.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kronos Worldwide', websiteUrl: 'https://www.kronosww.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Calumet Specialty Products', websiteUrl: 'https://www.calumetspecialty.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== ECOMMERCE_CARGO (6) ==========
const ECOMMERCE_CARGO: CompanyEntry[] = [
  { name: 'Chewy Fulfillment', websiteUrl: 'https://www.chewy.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Boxed Fulfillment', websiteUrl: 'https://www.boxed.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Radial Commerce', websiteUrl: 'https://www.radial.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ShipStation', websiteUrl: 'https://www.shipstation.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pitney Bowes', websiteUrl: 'https://www.pitneybowes.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Stamps.com', websiteUrl: 'https://www.stamps.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TELECOMMUNICATIONS (6) ==========
const TELECOMMUNICATIONS: CompanyEntry[] = [
  { name: 'Windstream Holdings', websiteUrl: 'https://www.windstream.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TDS Telecom US', websiteUrl: 'https://www.tdstelecom.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Consolidated Comm', websiteUrl: 'https://www.consolidated.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Altice USA Telecom', websiteUrl: 'https://www.alticeusa.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cogent Communications Corp', websiteUrl: 'https://www.cogentco.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ziply Fiber', websiteUrl: 'https://ziplyfiber.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== OTHER (2) ==========
const OTHER: CompanyEntry[] = [
  { name: 'Goodwill Industries', websiteUrl: 'https://www.goodwill.org', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Salvation Army US', websiteUrl: 'https://www.salvationarmyusa.org', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
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
  const market = Market.US;
  console.log(`Seeding ${ALL_ENTRIES.length} companies for US market (part 2)...`);

  let count = 0;
  for (const entry of ALL_ENTRIES) {
    const slug = slugify(entry.name);
    try {
      const company = await prisma.company.upsert({
        where: { slug_market: { slug, market } },
        update: { websiteUrl: entry.websiteUrl ?? undefined, sector: entry.sector },
        create: {
          name: entry.name,
          slug,
          market,
          sector: entry.sector,
          websiteUrl: entry.websiteUrl,
          isActive: true,
        },
      });

      await prisma.crawlSource.upsert({
        where: { id: company.id },
        update: {},
        create: {
          id: company.id,
          companyId: company.id,
          name: `${entry.name} Job Listings`,
          type: entry.sourceType,
          crawlMethod: CrawlMethod.HTML,
          seedUrls: [],
          schedule: '0 3 * * *',
          agingDays: 14,
          market,
          isActive: true,
        },
      });
      count++;
    } catch (e: any) {
      console.error(`  ✗ ${entry.name}: ${e.message}`);
    }
  }

  console.log(`\n✓ Seeded ${count}/${ALL_ENTRIES.length} companies for US (part 2)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
