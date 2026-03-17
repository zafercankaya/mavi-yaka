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

const ALL_ENTRIES: CompanyEntry[] = [
  // ========== LOGISTICS_TRANSPORTATION (8) ==========
  { name: 'LBC Express', websiteUrl: 'https://www.lbcexpress.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'JRS Express', websiteUrl: 'https://www.jfrgroup.com.ph', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'AP Cargo', websiteUrl: 'https://www.apcargo.com.ph', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lalamove Philippines', websiteUrl: 'https://www.lalamove.com/philippines', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Transportify PH', websiteUrl: 'https://www.transportify.com.ph', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Philippine Airlines Ground', websiteUrl: 'https://www.philippineairlines.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Air21', websiteUrl: 'https://www.air21.com.ph', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: '2GO Group', websiteUrl: 'https://supershuttle.com.ph', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

  // ========== MANUFACTURING (8) ==========
  { name: 'Monde Nissin', websiteUrl: 'https://www.mondenissin.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Century Pacific Food', websiteUrl: 'https://www.centurypacific.com.ph', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'RFM Corporation', websiteUrl: 'https://www.rfm.com.ph', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Asia Brewery', websiteUrl: 'https://www.asiabrewery.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'D&L Industries', websiteUrl: 'https://www.dnl.com.ph', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Integrated Micro-Electronics', websiteUrl: 'https://www.global-imi.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pepsi-Cola Products Philippines', websiteUrl: 'https://www.pepsi.com.ph', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alaska Milk Corporation', websiteUrl: 'https://www.alaskamilk.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

  // ========== RETAIL (8) ==========
  { name: 'Mercury Drug', websiteUrl: 'https://www.mercurydrug.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Watsons Philippines', websiteUrl: 'https://www.watsons.com.ph', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Shopwise', websiteUrl: null, sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Metro Retail Stores', websiteUrl: 'https://www.metroretail.com.ph', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'AllDay Supermarket', websiteUrl: 'https://www.alldaysupermarket.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'S&R Membership Shopping', websiteUrl: 'https://www.snrfrgroup.com.ph', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Wilcon Depot', websiteUrl: 'https://www.wilcon.com.ph', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Handyman Do It Best', websiteUrl: 'https://www.handyman.com.ph', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CONSTRUCTION (8) ==========
  { name: 'Megawide Construction', websiteUrl: 'https://www.megawide.com.ph', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'EEI Corporation', websiteUrl: 'https://www.eei.com.ph', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'First Balfour', websiteUrl: 'https://www.firstbalfour.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Leighton Contractors PH', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'F.F. Cruz & Co', websiteUrl: 'https://www.ffcruz.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PHINMA Construction', websiteUrl: 'https://www.phinma.com.ph', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Monolith Construction', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'AllHome Construction', websiteUrl: 'https://www.allhome.com.ph', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

  // ========== FOOD_BEVERAGE (8) ==========
  { name: 'Shakeys Pizza', websiteUrl: 'https://www.shakeys.ph', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Max Restaurant Group', websiteUrl: 'https://www.maxschicken.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mang Inasal', websiteUrl: 'https://www.manginasal.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Goldilocks Bakeshop', websiteUrl: 'https://www.goldilocks.com.ph', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Red Ribbon Bakeshop', websiteUrl: 'https://www.redribbonbakeshop.com.ph', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Greenwich Pizza', websiteUrl: 'https://www.greenwichdelivery.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Army Navy Burger', websiteUrl: 'https://www.armynavy.com.ph', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yellow Cab Pizza', websiteUrl: 'https://www.yellowcabpizza.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

  // ========== AUTOMOTIVE (8) ==========
  { name: 'Toyota Motor Philippines', websiteUrl: 'https://www.toyota.com.ph', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Honda Cars Philippines', websiteUrl: 'https://www.hondaphil.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mitsubishi Motors PH', websiteUrl: 'https://www.mitsubishi-motors.com.ph', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nissan Philippines', websiteUrl: 'https://www.nissan.ph', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ford Philippines', websiteUrl: 'https://www.ford.com.ph', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Isuzu Philippines', websiteUrl: 'https://www.isuzuphil.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hyundai Philippines', websiteUrl: 'https://www.hyundai.com.ph', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Suzuki Philippines', websiteUrl: 'https://www.suzuki.com.ph', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

  // ========== TEXTILE (8) ==========
  { name: 'Zubiri Apparel Manufacturing', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mactan Apparel', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Philippine Spring Water (Garments Div)', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lotus Lingerie', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tanduay Apparel', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cagayan Apparel', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Phil Zone Industrial Dev Corp', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yakult Philippines Garments', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

  // ========== MINING_ENERGY (8) ==========
  { name: 'Semirara Mining', websiteUrl: 'https://www.semiraramining.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nickel Asia', websiteUrl: 'https://www.nickelasia.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aboitiz Power', websiteUrl: 'https://www.aboitizpower.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'First Gen Corporation', websiteUrl: 'https://www.firstgen.com.ph', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Manila Electric Railroad and Light', websiteUrl: null, sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alsons Consolidated', websiteUrl: 'https://www.alsonscons.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Global Business Power', websiteUrl: null, sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Philex Mining', websiteUrl: 'https://www.philexmining.com.ph', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

  // ========== HEALTHCARE (8) ==========
  { name: 'The Medical City', websiteUrl: 'https://www.themedicalcity.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'St. Lukes Medical Center', websiteUrl: 'https://www.stluke.com.ph', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Makati Medical Center', websiteUrl: 'https://www.makatimed.net.ph', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Manila Doctors Hospital', websiteUrl: 'https://www.maniladoctors.com.ph', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Asian Hospital', websiteUrl: 'https://www.asianhospital.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chong Hua Hospital', websiteUrl: 'https://www.chonghua.com.ph', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Metro Pacific Hospital Holdings', websiteUrl: 'https://www.mfrgroup.com.ph', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Philippine Heart Center', websiteUrl: null, sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

  // ========== HOSPITALITY_TOURISM (8) ==========
  { name: 'Shangri-La at the Fort', websiteUrl: 'https://www.shangri-la.com/manila', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Okada Manila', websiteUrl: 'https://www.okadamanila.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Solaire Resort', websiteUrl: 'https://www.solaireresort.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'City of Dreams Manila', websiteUrl: 'https://www.cityofdreamsmanila.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hotel H2O Manila', websiteUrl: 'https://www.hotelh2o.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Discovery Hospitality', websiteUrl: 'https://www.discoveryhotel.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Enderun Hotels', websiteUrl: 'https://www.enderunhotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Marco Polo Hotels PH', websiteUrl: 'https://www.marcopolohotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

  // ========== AGRICULTURE (8) ==========
  { name: 'Del Monte Philippines', websiteUrl: 'https://www.dfrgroup.com.ph', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dole Philippines', websiteUrl: 'https://www.dole.com/en/products', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vitarich Corporation', websiteUrl: 'https://www.vitarich.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bounty Agro Ventures', websiteUrl: 'https://www.bountyagro.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SL Agritech', websiteUrl: 'https://www.slfrgroup.com.ph', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Manila Seedling Bank', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cargill Philippines', websiteUrl: 'https://www.cargill.com/ph', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'San Miguel Foods', websiteUrl: 'https://www.sanmiguelfoods.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

  // ========== SECURITY_SERVICES (8) ==========
  { name: 'Omnipay Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Onesource Security PH', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Marksmen Security PH', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CIS Bayani Fernando Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'RSSA Security Agency', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Eagle Star Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Philippine Veterans Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Watchman Security PH', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

  // ========== FACILITY_MANAGEMENT (8) ==========
  { name: 'Rockwell Land', websiteUrl: 'https://www.rockwell.com.ph', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vista Land', websiteUrl: 'https://www.vistaland.com.ph', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Federal Land', websiteUrl: 'https://www.federalland.ph', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Filinvest Land', websiteUrl: 'https://www.filinvestland.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Century Properties', websiteUrl: 'https://www.century-properties.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Shang Properties', websiteUrl: 'https://www.shangproperties.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alveo Land', websiteUrl: 'https://www.alveoland.com.ph', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Avida Land', websiteUrl: 'https://www.avidaland.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

  // ========== METAL_STEEL (8) ==========
  { name: 'SteelAsia Manufacturing', websiteUrl: 'https://www.steelasia.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Manila Metal Container', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pacific Steel Manufacturing', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Prime Steel Mill', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hi-Temp Steel Philippines', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pag-asa Steel Works', websiteUrl: 'https://www.pagasasteel.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Capitol Steel', websiteUrl: 'https://www.capitolsteel.com.ph', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Steel Center Philippines', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
];

async function main() {
  const market = Market.PH;
  console.log(`Seeding ${ALL_ENTRIES.length} additional companies for PH market (part2)...`);
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
            name: `${entry.name} Job Openings`,
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
