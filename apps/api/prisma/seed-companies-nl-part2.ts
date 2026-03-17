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
  { name: 'Vos Logistics', websiteUrl: 'https://www.voslogistics.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Jan de Rijk Logistics', websiteUrl: 'https://www.janderijk.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bakker Logistiek', websiteUrl: 'https://www.bakkerlogistiek.nl', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Simon Loos', websiteUrl: 'https://www.simonloos.nl', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Van den Bosch Transporten', websiteUrl: 'https://www.vandenbosch.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

  // ========== MANUFACTURING (5) ==========
  { name: 'VDL Groep', websiteUrl: 'https://www.vdlgroep.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Stork', websiteUrl: 'https://www.stork.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NXP Semiconductors', websiteUrl: 'https://www.nxp.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thales Nederland', websiteUrl: 'https://www.thalesgroup.com/nl', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Damen Shipyards', websiteUrl: 'https://www.damen.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

  // ========== RETAIL (5) ==========
  { name: 'Jumbo Supermarkten', websiteUrl: 'https://www.jumbo.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dirk van den Broek', websiteUrl: 'https://www.dirk.nl', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Plus Supermarkt', websiteUrl: 'https://www.plus.nl', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Spar NL', websiteUrl: 'https://www.spar.nl', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Coop NL', websiteUrl: 'https://www.coop.nl', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CONSTRUCTION (5) ==========
  { name: 'VolkerWessels', websiteUrl: 'https://www.volkerwessels.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Heijmans', websiteUrl: 'https://www.heijmans.nl', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dura Vermeer', websiteUrl: 'https://www.duravermeer.nl', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Van Wijnen', websiteUrl: 'https://www.vanwijnen.nl', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TBI Infra', websiteUrl: 'https://www.tbi.nl', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

  // ========== FOOD_BEVERAGE (5) ==========
  { name: 'FrieslandCampina NL', websiteUrl: 'https://www.frieslandcampina.com/nl', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vion Food NL', websiteUrl: 'https://www.vionfoodgroup.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lamb Weston Meijer', websiteUrl: 'https://www.lambweston-emea.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vandemoortele NL', websiteUrl: 'https://www.vandemoortele.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grolsch', websiteUrl: 'https://www.grolsch.nl', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

  // ========== AUTOMOTIVE (5) ==========
  { name: 'DAF Trucks NL', websiteUrl: 'https://www.daf.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'VDL Nedcar', websiteUrl: 'https://www.vdlnedcar.nl', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Inalfa Roof Systems', websiteUrl: 'https://www.inalfa.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bosch Breda', websiteUrl: null, sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NedSchroef', websiteUrl: 'https://www.nedschroef.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

  // ========== TEXTILE (5) ==========
  { name: 'Vlisco', websiteUrl: 'https://www.vlisco.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ten Cate Textiles', websiteUrl: 'https://www.tencatetextiles.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'WE Fashion', websiteUrl: 'https://www.wefashion.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Scotch & Soda', websiteUrl: 'https://www.scotch-soda.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'G-Star RAW', websiteUrl: 'https://www.g-star.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

  // ========== MINING_ENERGY (5) ==========
  { name: 'Eneco', websiteUrl: 'https://www.eneco.nl', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vattenfall NL', websiteUrl: 'https://www.vattenfall.nl', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Essent', websiteUrl: 'https://www.essent.nl', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TenneT NL', websiteUrl: 'https://www.tennet.eu', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Stedin', websiteUrl: 'https://www.stedin.net', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

  // ========== HEALTHCARE (5) ==========
  { name: 'Erasmus MC', websiteUrl: 'https://www.erasmusmc.nl', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Amsterdam UMC', websiteUrl: 'https://www.amsterdamumc.nl', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Radboudumc', websiteUrl: 'https://www.radboudumc.nl', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'UMCG Groningen', websiteUrl: 'https://www.umcg.nl', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Isala Ziekenhuis', websiteUrl: 'https://www.isala.nl', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

  // ========== HOSPITALITY_TOURISM (5) ==========
  { name: 'Van der Valk', websiteUrl: 'https://www.vandervalk.nl', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Efteling', websiteUrl: 'https://www.efteling.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Center Parcs NL', websiteUrl: 'https://www.centerparcs.nl', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Landal GreenParks NL', websiteUrl: 'https://www.landal.nl', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'De Efteling Horeca', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

  // ========== AGRICULTURE (5) ==========
  { name: 'Royal Cosun', websiteUrl: 'https://www.cosun.nl', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Agrifirm', websiteUrl: 'https://www.agrifirm.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ForFarmers NL', websiteUrl: 'https://www.forfarmers.nl', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'De Heus', websiteUrl: 'https://www.deheus.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lely', websiteUrl: 'https://www.lely.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

  // ========== SECURITY_SERVICES (5) ==========
  { name: 'Trigion', websiteUrl: 'https://www.trigion.nl', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'G4S Nederland', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Securitas NL', websiteUrl: 'https://www.securitas.nl', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Brinks NL', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Seris Security NL', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

  // ========== FACILITY_MANAGEMENT (5) ==========
  { name: 'ISS Nederland', websiteUrl: 'https://www.nl.issworld.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CSU Cleaning', websiteUrl: 'https://www.csu.nl', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hago', websiteUrl: 'https://www.vinci-facilities.nl', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gom Schoonhouden', websiteUrl: 'https://www.gom.nl', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Asito', websiteUrl: 'https://www.asito.nl', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

  // ========== METAL_STEEL (5) ==========
  { name: 'Tata Steel IJmuiden', websiteUrl: 'https://www.tatasteeleurope.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aalberts Industries', websiteUrl: 'https://www.aalberts.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nedal Aluminium', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Heerema Fabrication', websiteUrl: 'https://www.heerema.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Allard International', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CHEMICALS_PLASTICS (5) ==========
  { name: 'AkzoNobel Werk NL', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'DSM-Firmenich NL', websiteUrl: 'https://www.dsm-firmenich.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sabic Limburg', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nouryon', websiteUrl: 'https://www.nouryon.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Teijin Aramid', websiteUrl: 'https://www.teijinaramid.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },

  // ========== ECOMMERCE_CARGO (5) ==========
  { name: 'Bol.com Logistiek', websiteUrl: null, sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Coolblue Magazijn', websiteUrl: null, sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Wehkamp Logistiek', websiteUrl: 'https://www.wehkamp.nl', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Picnic Magazijn NL', websiteUrl: null, sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thuisbezorgd NL', websiteUrl: 'https://www.thuisbezorgd.nl', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },

  // ========== TELECOMMUNICATIONS (5) ==========
  { name: 'KPN Techniek', websiteUrl: null, sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'T-Mobile Techniek NL', websiteUrl: null, sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'VodafoneZiggo', websiteUrl: 'https://www.vodafoneziggo.nl', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Glaspoort', websiteUrl: 'https://www.glaspoort.nl', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Delta Fiber', websiteUrl: 'https://www.deltafiber.nl', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

async function main() {
  const market = Market.NL;
  console.log(`Seeding ${ALL_ENTRIES.length} additional companies for NL market (part 2)...`);
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
            name: `${entry.name} Vacatures`,
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
