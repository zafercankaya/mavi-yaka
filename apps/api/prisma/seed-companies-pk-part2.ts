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
  { name: 'Pakistan Railways', websiteUrl: 'https://www.pakrail.gov.pk', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pakistan Post', websiteUrl: 'https://www.pakpost.gov.pk', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lahore Metro Bus', websiteUrl: null, sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rawalpindi-Islamabad Metro', websiteUrl: null, sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Multan Metro Bus', websiteUrl: null, sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MANUFACTURING (5) ==========
const MANUFACTURING: CompanyEntry[] = [
  { name: 'PAC Kamra (Aviation)', websiteUrl: null, sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Heavy Industries Taxila', websiteUrl: null, sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pakistan Machine Tool Factory', websiteUrl: null, sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gul Ahmed Textile Mills', websiteUrl: 'https://www.gulahmedshop.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dewan Salman Fibre', websiteUrl: null, sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
];

// ========== RETAIL (5) ==========
const RETAIL: CompanyEntry[] = [
  { name: 'Imtiaz Super Market', websiteUrl: 'https://www.imtiaz.com.pk', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Al-Fatah Department Store', websiteUrl: 'https://www.alfatah.com.pk', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chase Up', websiteUrl: null, sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hyperstar (Carrefour PK)', websiteUrl: null, sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Metro Cash & Carry PK', websiteUrl: null, sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CONSTRUCTION (5) ==========
const CONSTRUCTION: CompanyEntry[] = [
  { name: 'DHA (Defence Housing)', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bahria Town', websiteUrl: 'https://www.bahriatown.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NLC (National Logistics Cell)', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Frontier Works Organization', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nespak Engineering', websiteUrl: 'https://www.nespak.com.pk', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FOOD_BEVERAGE (5) ==========
const FOOD_BEVERAGE: CompanyEntry[] = [
  { name: 'Shan Foods', websiteUrl: 'https://www.shanfoods.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'National Foods', websiteUrl: 'https://www.nfrtti.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Olper\'s (Engro Foods)', websiteUrl: null, sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'K&N\'s Foods', websiteUrl: 'https://www.knfoods.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tapal Tea', websiteUrl: 'https://www.tapaltea.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AUTOMOTIVE (5) ==========
const AUTOMOTIVE: CompanyEntry[] = [
  { name: 'Pak Suzuki Motor', websiteUrl: 'https://www.paksuzuki.com.pk', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Honda Atlas Cars', websiteUrl: 'https://www.honda.com.pk', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Toyota Indus Motor', websiteUrl: 'https://www.toyota-indus.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hyundai Nishat Motor', websiteUrl: 'https://www.hyundai-nishat.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Master Motor Corporation', websiteUrl: 'https://www.mastermotor.com.pk', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TEXTILE (5) ==========
const TEXTILE: CompanyEntry[] = [
  { name: 'Interloop Limited', websiteUrl: 'https://www.interloop.com.pk', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Masood Textile Mills', websiteUrl: 'https://www.masoodtextile.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sapphire Textile Mills', websiteUrl: 'https://www.sapphireonline.pk', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alkaram Textile', websiteUrl: 'https://www.alkaram.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Khaadi PK', websiteUrl: 'https://www.khaadi.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MINING_ENERGY (5) ==========
const MINING_ENERGY: CompanyEntry[] = [
  { name: 'WAPDA Pakistan', websiteUrl: 'https://www.wapda.gov.pk', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'LESCO Lahore', websiteUrl: 'https://www.lesco.gov.pk', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SNGPL (Sui Northern)', websiteUrl: 'https://www.sngpl.com.pk', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SSGC (Sui Southern)', websiteUrl: 'https://www.ssgc.com.pk', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hub Power Company (HUBCO)', websiteUrl: 'https://www.hubpower.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HEALTHCARE (5) ==========
const HEALTHCARE: CompanyEntry[] = [
  { name: 'Shaukat Khanum Hospital', websiteUrl: 'https://www.shaukatkhanum.org.pk', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aga Khan University Hospital', websiteUrl: 'https://www.aku.edu', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Indus Hospital & Health Network', websiteUrl: 'https://www.indushospital.org.pk', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pakistan Institute of Medical Sciences', websiteUrl: null, sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Liaquat National Hospital', websiteUrl: 'https://www.lnh.edu.pk', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HOSPITALITY_TOURISM (4) ==========
const HOSPITALITY_TOURISM: CompanyEntry[] = [
  { name: 'Serena Hotels Pakistan', websiteUrl: 'https://www.serenahotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pearl Continental Hotels', websiteUrl: 'https://www.pchotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Marriott Hotel Islamabad', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PTDC (Pakistan Tourism)', websiteUrl: 'https://www.tourism.gov.pk', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AGRICULTURE (5) ==========
const AGRICULTURE: CompanyEntry[] = [
  { name: 'ICI Pakistan Agri', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fauji Fertilizer Bin Qasim', websiteUrl: 'https://www.ffbl.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Guard Agricultural Research', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fatima Fertilizer', websiteUrl: 'https://www.fatima-group.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Engro Fertilizers', websiteUrl: 'https://www.engrofertilizers.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== SECURITY_SERVICES (4) ==========
const SECURITY_SERVICES: CompanyEntry[] = [
  { name: 'Rangers Pakistan', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Wackenhut Pakistan', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Askari Guards PK', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Commander Security PK', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FACILITY_MANAGEMENT (4) ==========
const FACILITY_MANAGEMENT: CompanyEntry[] = [
  { name: 'Abacus Consulting FM', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Systems Limited FM', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dolmen Mall Management', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Emaar Pakistan FM', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
];

// ========== METAL_STEEL (5) ==========
const METAL_STEEL: CompanyEntry[] = [
  { name: 'Amreli Steels', websiteUrl: 'https://www.amrelisteels.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'International Steels', websiteUrl: 'https://www.isl.com.pk', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aisha Steel Mills', websiteUrl: 'https://www.aishasteelmills.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mughal Iron & Steel', websiteUrl: 'https://www.mughalsteel.com.pk', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Agha Steel Industries', websiteUrl: 'https://www.aghasteel.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CHEMICALS_PLASTICS (5) ==========
const CHEMICALS_PLASTICS: CompanyEntry[] = [
  { name: 'Engro Polymer & Chemicals', websiteUrl: 'https://www.engropolymer.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lotte Chemical Pakistan', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sitara Chemical Industries', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nimir Industrial Chemicals', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Archroma Pakistan', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== ECOMMERCE_CARGO (5) ==========
const ECOMMERCE_CARGO: CompanyEntry[] = [
  { name: 'TCS Express PK', websiteUrl: 'https://www.tcsexpress.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Leopards Courier', websiteUrl: 'https://www.leopardscourier.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Blue Ex', websiteUrl: 'https://www.blue-ex.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'M&P (Muller & Phipps)', websiteUrl: 'https://www.mullerandphipps.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PostEx PK', websiteUrl: 'https://www.postex.pk', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TELECOMMUNICATIONS (5) ==========
const TELECOMMUNICATIONS: CompanyEntry[] = [
  { name: 'PTCL', websiteUrl: 'https://www.ptcl.com.pk', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ufone (PTML)', websiteUrl: 'https://www.ufone.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nayatel Fiber', websiteUrl: 'https://www.nayatel.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'StormFiber PK', websiteUrl: 'https://www.stormfiber.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Wateen Telecom', websiteUrl: 'https://www.wateen.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
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
];

async function main() {
  const market = Market.PK;
  console.log(`Seeding ${ALL_ENTRIES.length} companies for PK market (part 2)...`);

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
            name: `${entry.name} Jobs`,
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
