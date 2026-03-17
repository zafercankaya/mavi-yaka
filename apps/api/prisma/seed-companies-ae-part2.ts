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
  // ========== LOGISTICS_TRANSPORTATION (5) ==========
  { name: 'Aramex', websiteUrl: 'https://www.aramex.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Al Futtaim Logistics', websiteUrl: 'https://www.alfuttaim.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tristar Transport', websiteUrl: 'https://www.tristar-group.co', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gulf Agency Company', websiteUrl: 'https://www.gac.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'RSA Logistics', websiteUrl: 'https://www.rsaglobal.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

  // ========== MANUFACTURING (5) ==========
  { name: 'Emirates Steel', websiteUrl: 'https://www.emiratessteelarkan.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Emirates Global Aluminium', websiteUrl: 'https://www.ega.ae', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gulf Extrusions', websiteUrl: 'https://www.gulfextrusions.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'RAK Ceramics', websiteUrl: 'https://www.rakceramics.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'National Cement', websiteUrl: 'https://www.natcem.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

  // ========== RETAIL (5) ==========
  { name: 'Lulu Hypermarket', websiteUrl: 'https://www.luluhypermarket.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Carrefour UAE', websiteUrl: 'https://www.carrefouruae.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Choithrams', websiteUrl: 'https://www.choithrams.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Spinneys UAE', websiteUrl: 'https://www.spinneys.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Union Coop', websiteUrl: 'https://www.unioncoop.ae', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CONSTRUCTION (5) ==========
  { name: 'Aldar Properties', websiteUrl: 'https://www.aldar.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Emaar Contracting', websiteUrl: 'https://www.emaar.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Arabtec', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Drake & Scull', websiteUrl: 'https://www.dfrgroup.ae', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Al Habtoor Construction', websiteUrl: 'https://www.habtoor.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

  // ========== FOOD_BEVERAGE (5) ==========
  { name: 'Al Islami Foods', websiteUrl: 'https://www.alislamifoods.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'IFFCO', websiteUrl: 'https://www.iffco.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'National Food Products Company', websiteUrl: 'https://www.nfpc.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Emirates Refreshments', websiteUrl: null, sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Americana UAE', websiteUrl: 'https://www.americanarestaurants.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

  // ========== AUTOMOTIVE (5) ==========
  { name: 'Al Futtaim Motors', websiteUrl: 'https://www.alfuttaim.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Al Tayer Motors', websiteUrl: 'https://www.altayermotors.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Al Nabooda Automobiles', websiteUrl: 'https://www.alnaboodaautomobiles.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gargash Enterprises', websiteUrl: 'https://www.gargash.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Al Masaood Automobiles', websiteUrl: 'https://www.almasaood.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

  // ========== TEXTILE (5) ==========
  { name: 'Al Khayyat Investments', websiteUrl: 'https://www.akigroup.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ajmal Industries', websiteUrl: 'https://www.ajmalperfume.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Raymond UAE', websiteUrl: 'https://www.raymond.in', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Al Jazeera Textiles', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'National Textiles', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

  // ========== MINING_ENERGY (5) ==========
  { name: 'ADNOC', websiteUrl: 'https://www.adnoc.ae', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ENOC', websiteUrl: 'https://www.enoc.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Masdar', websiteUrl: 'https://www.masdar.ae', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TAQA', websiteUrl: 'https://www.taqa.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dana Gas', websiteUrl: 'https://www.danagas.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

  // ========== HEALTHCARE (5) ==========
  { name: 'NMC Health', websiteUrl: 'https://www.nmchealth.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aster DM Healthcare', websiteUrl: 'https://www.asterdmhealthcare.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mediclinic Middle East', websiteUrl: 'https://www.mediclinic.ae', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'VPS Healthcare', websiteUrl: 'https://www.vpshealthcare.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SEHA', websiteUrl: 'https://www.seha.ae', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

  // ========== HOSPITALITY_TOURISM (5) ==========
  { name: 'Jumeirah Group', websiteUrl: 'https://www.jumeirah.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rotana Hotels', websiteUrl: 'https://www.rotana.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Emaar Hospitality', websiteUrl: 'https://www.emaarhospitality.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Minor Hotels Middle East', websiteUrl: 'https://www.minorhotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hilton UAE', websiteUrl: 'https://www.hilton.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

  // ========== AGRICULTURE (5) ==========
  { name: 'Al Dahra Agriculture', websiteUrl: 'https://www.aldahra.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Agthia Group', websiteUrl: 'https://www.agthia.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Al Rawabi Dairy', websiteUrl: 'https://www.alrawabidairy.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bustanica', websiteUrl: 'https://www.bustanica.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Emirates Bio Farm', websiteUrl: 'https://www.emiratesbiofarm.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

  // ========== SECURITY_SERVICES (5) ==========
  { name: 'G4S UAE', websiteUrl: 'https://www.g4s.com', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Transguard Group', websiteUrl: 'https://www.transguardgroup.com', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Emirates Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Securitas UAE', websiteUrl: 'https://www.securitas.ae', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SAMS Security', websiteUrl: 'https://www.saborarmedservices.com', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

  // ========== FACILITY_MANAGEMENT (5) ==========
  { name: 'Emrill Services', websiteUrl: 'https://www.emrill.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Farnek Services', websiteUrl: 'https://www.farnek.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dulsco', websiteUrl: 'https://www.dulsco.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Khidmah', websiteUrl: 'https://www.khidmah.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Imdaad', websiteUrl: 'https://www.imdaad.ae', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

  // ========== METAL_STEEL (5) ==========
  { name: 'Emirates Steel Arkan', websiteUrl: 'https://www.emiratessteelarkan.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gulf Steel Industries', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Conares Metal', websiteUrl: 'https://www.conares.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'RAK Steel', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Star Steel', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CHEMICALS_PLASTICS (5) ==========
  { name: 'Borouge', websiteUrl: 'https://www.borouge.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'FERTIL', websiteUrl: 'https://www.fertil.ae', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Abu Dhabi Polymers', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Emirates Industrial Gases', websiteUrl: 'https://www.eigases.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chemanol UAE', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },

  // ========== ECOMMERCE_CARGO (5) ==========
  { name: 'Noon', websiteUrl: 'https://www.noon.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fetchr', websiteUrl: 'https://www.fetchr.us', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Careem', websiteUrl: 'https://www.careem.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Talabat', websiteUrl: 'https://www.talabat.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Deliveroo UAE', websiteUrl: 'https://deliveroo.ae', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },

  // ========== TELECOMMUNICATIONS (5) ==========
  { name: 'Etisalat', websiteUrl: 'https://www.etisalat.ae', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'du EITC', websiteUrl: 'https://www.du.ae', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ericsson UAE', websiteUrl: 'https://www.ericsson.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Huawei UAE', websiteUrl: 'https://www.huawei.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nokia UAE', websiteUrl: 'https://www.nokia.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },

  // ========== OTHER (5) ==========
  { name: 'MOHRE', websiteUrl: 'https://www.mohre.gov.ae', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'Tawteen', websiteUrl: 'https://www.tawteen.ae', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'TAMM Abu Dhabi', websiteUrl: 'https://www.tamm.abudhabi', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'Abu Dhabi Government Services', websiteUrl: 'https://www.abudhabi.gov.ae', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'Dubai Municipality', websiteUrl: 'https://www.dm.gov.ae', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
];

async function main() {
  const market = Market.AE;
  console.log(`Seeding ${ALL_ENTRIES.length} additional companies for AE market (part 2)...`);
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
  console.log(`\nDone! Created: ${created}, Already existed: ${existed}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
