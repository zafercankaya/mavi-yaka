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
    .replace(/[åä]/g, 'a').replace(/[ö]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const ALL_ENTRIES: CompanyEntry[] = [
  // ========== LOGISTICS_TRANSPORTATION (5) ==========
  { name: 'Green Cargo', websiteUrl: 'https://www.greencargo.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'DHL Sweden', websiteUrl: 'https://www.dhl.se', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bring Sverige', websiteUrl: 'https://www.bring.se', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Budbee', websiteUrl: 'https://www.budbee.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SL Storstockholms Lokaltrafik', websiteUrl: 'https://www.sl.se', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

  // ========== MANUFACTURING (5) ==========
  { name: 'ABB Sverige', websiteUrl: 'https://new.abb.com/se', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alfa Laval', websiteUrl: 'https://www.alfalaval.se', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SKF', websiteUrl: 'https://www.skf.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Epiroc', websiteUrl: 'https://www.epiroc.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tetra Pak Sverige', websiteUrl: 'https://www.tetrapak.com/se', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

  // ========== RETAIL (5) ==========
  { name: 'Axfood', websiteUrl: 'https://www.axfood.se', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Willys', websiteUrl: 'https://www.willys.se', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hemköp', websiteUrl: 'https://www.hemkop.se', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lidl Sverige', websiteUrl: 'https://www.lidl.se', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'City Gross', websiteUrl: 'https://www.citygross.se', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CONSTRUCTION (5) ==========
  { name: 'Skanska Sverige', websiteUrl: 'https://www.skanska.se', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NCC Sverige', websiteUrl: 'https://www.ncc.se', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Peab Sverige', websiteUrl: 'https://www.peab.se', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'JM Byggnads', websiteUrl: 'https://www.jm.se', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Veidekke Sverige', websiteUrl: 'https://www.veidekke.se', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

  // ========== FOOD_BEVERAGE (5) ==========
  { name: 'Arla Foods Sverige', websiteUrl: 'https://www.arla.se', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lantmännen', websiteUrl: 'https://www.lantmannen.se', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Scan', websiteUrl: 'https://www.scan.se', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pågen', websiteUrl: 'https://www.pagen.se', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kopparbergs Bryggeri', websiteUrl: 'https://www.kopparbergs.se', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

  // ========== AUTOMOTIVE (5) ==========
  { name: 'Volvo Cars SE', websiteUrl: 'https://www.volvocars.com/se', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Scania Södertälje', websiteUrl: null, sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Koenigsegg', websiteUrl: 'https://www.koenigsegg.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Autoliv', websiteUrl: 'https://www.autoliv.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Haldex', websiteUrl: 'https://www.haldex.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

  // ========== TEXTILE (5) ==========
  { name: 'Lindex', websiteUrl: 'https://www.lindex.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'KappAhl', websiteUrl: 'https://www.kappahl.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gina Tricot', websiteUrl: 'https://www.ginatricot.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fjällräven', websiteUrl: 'https://www.fjallraven.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Haglöfs', websiteUrl: 'https://www.haglofs.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

  // ========== MINING_ENERGY (5) ==========
  { name: 'Vattenfall SE', websiteUrl: 'https://www.vattenfall.se', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'LKAB', websiteUrl: 'https://www.lkab.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Boliden', websiteUrl: 'https://www.boliden.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fortum Sverige', websiteUrl: 'https://www.fortum.se', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'E.ON Sverige', websiteUrl: 'https://www.eon.se', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

  // ========== HEALTHCARE (5) ==========
  { name: 'Karolinska Universitetssjukhuset', websiteUrl: 'https://www.karolinska.se', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sahlgrenska Universitetssjukhuset', websiteUrl: null, sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Capio Sverige', websiteUrl: 'https://www.capio.se', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ambea', websiteUrl: 'https://www.ambea.se', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Attendo', websiteUrl: 'https://www.attendo.se', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

  // ========== HOSPITALITY_TOURISM (5) ==========
  { name: 'Scandic Hotels', websiteUrl: 'https://www.scandichotels.se', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nordic Choice Hotels', websiteUrl: 'https://www.nordicchoicehotels.se', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Liseberg', websiteUrl: 'https://www.liseberg.se', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gröna Lund', websiteUrl: 'https://www.gronalund.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Max Hamburgerrestauranger', websiteUrl: 'https://www.max.se', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

  // ========== AGRICULTURE (5) ==========
  { name: 'Lantmännen Lantbruk', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Svevia', websiteUrl: 'https://www.svevia.se', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sveaskog', websiteUrl: 'https://www.sveaskog.se', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SCA Skog', websiteUrl: 'https://www.sca.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Holmen Skog', websiteUrl: 'https://www.holmen.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

  // ========== SECURITY_SERVICES (5) ==========
  { name: 'Securitas Sverige', websiteUrl: 'https://www.securitas.se', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Avarn Security', websiteUrl: 'https://www.avarnsecurity.se', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nokas Sverige', websiteUrl: 'https://www.nokas.se', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Loomis Sverige', websiteUrl: 'https://www.loomis.se', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Stanley Security Sverige', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

  // ========== FACILITY_MANAGEMENT (5) ==========
  { name: 'Coor Service Management', websiteUrl: 'https://www.coor.se', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sodexo Sverige', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ISS Sverige', websiteUrl: 'https://www.issworld.com/se', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Samhall', websiteUrl: 'https://www.samhall.se', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Assemblin', websiteUrl: 'https://www.assemblin.se', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

  // ========== METAL_STEEL (5) ==========
  { name: 'SSAB Oxelösund', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sandvik Materials', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ovako', websiteUrl: 'https://www.ovako.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Outokumpu Avesta', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Uddeholms AB', websiteUrl: 'https://www.uddeholm.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CHEMICALS_PLASTICS (5) ==========
  { name: 'Perstorp', websiteUrl: 'https://www.perstorp.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Borealis Sverige', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nouryon Sverige', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hexpol', websiteUrl: 'https://www.hexpol.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Trelleborg AB', websiteUrl: 'https://www.trelleborg.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },

  // ========== ECOMMERCE_CARGO (6) ==========
  { name: 'Webhallen Lager', websiteUrl: null, sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CDON Logistik', websiteUrl: 'https://www.cdon.se', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Apotea Lager', websiteUrl: 'https://www.apotea.se', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MatHem Logistik', websiteUrl: 'https://www.mathem.se', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Inet Lager', websiteUrl: 'https://www.inet.se', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Elgiganten Lager', websiteUrl: 'https://www.elgiganten.se', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },

  // ========== TELECOMMUNICATIONS (6) ==========
  { name: 'Telia Sverige', websiteUrl: 'https://www.telia.se', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tele2', websiteUrl: 'https://www.tele2.se', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tre Sverige', websiteUrl: 'https://www.tre.se', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Telenor Sverige', websiteUrl: 'https://www.telenor.se', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'IP-Only', websiteUrl: 'https://www.ip-only.se', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bredband2', websiteUrl: 'https://www.bredband2.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

async function main() {
  const market = Market.SE;
  console.log(`Seeding ${ALL_ENTRIES.length} additional companies for SE market (part 2)...`);
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
            name: `${entry.name} Lediga jobb`,
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
