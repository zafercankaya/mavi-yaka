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
    .replace(/[áàâã]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íì]/g, 'i').replace(/[óòôõ]/g, 'o').replace(/[úù]/g, 'u').replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const ALL_ENTRIES: CompanyEntry[] = [
  // ========== LOGISTICS_TRANSPORTATION (5) ==========
  { name: 'CTT Correios de Portugal', websiteUrl: 'https://www.ctt.pt', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Rangel Logistics', websiteUrl: 'https://www.rangel.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Luís Simões', websiteUrl: 'https://www.luis-simoes.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Patinter', websiteUrl: 'https://www.patinter.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Torrestir', websiteUrl: 'https://www.torrestir.pt', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

  // ========== MANUFACTURING (5) ==========
  { name: 'Volkswagen Autoeuropa', websiteUrl: 'https://www.volkswagenautoeuropa.pt', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bosch Portugal', websiteUrl: 'https://www.bosch.pt', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Renault CACIA', websiteUrl: 'https://www.renault.pt', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Siemens Portugal', websiteUrl: 'https://www.siemens.pt', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Continental Mabor', websiteUrl: 'https://www.continental.com/pt-pt', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

  // ========== RETAIL (5) ==========
  { name: 'Continente', websiteUrl: 'https://www.continente.pt', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pingo Doce', websiteUrl: 'https://www.pingodoce.pt', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lidl Portugal', websiteUrl: 'https://www.lidl.pt', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Auchan Portugal', websiteUrl: 'https://www.auchan.pt', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Intermarché Portugal', websiteUrl: 'https://www.intermarche.pt', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CONSTRUCTION (5) ==========
  { name: 'Mota-Engil Portugal', websiteUrl: 'https://www.mota-engil.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Teixeira Duarte', websiteUrl: 'https://www.teixeiraduarte.pt', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Soares da Costa', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Casais Group', websiteUrl: 'https://www.casais.pt', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'DST Group', websiteUrl: 'https://www.dstgroup.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

  // ========== FOOD_BEVERAGE (5) ==========
  { name: 'Delta Cafés', websiteUrl: 'https://www.deltacafes.pt', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Super Bock Group', websiteUrl: 'https://www.superbockgroup.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lactogal', websiteUrl: 'https://www.lactogal.pt', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cerealis', websiteUrl: 'https://www.cerealis.pt', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sumol+Compal', websiteUrl: 'https://www.sumolcompal.pt', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

  // ========== AUTOMOTIVE (5) ==========
  { name: 'Salvador Caetano', websiteUrl: 'https://www.salvadorcaetano.pt', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SATA Group', websiteUrl: 'https://www.sata.pt', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Autoeuropa Palmela', websiteUrl: 'https://www.volkswagenautoeuropa.pt', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Faurecia Portugal', websiteUrl: 'https://www.forvia.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Delphi Portugal', websiteUrl: 'https://www.aptiv.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

  // ========== TEXTILE (5) ==========
  { name: 'Pedrosa & Rodrigues', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Riopele', websiteUrl: 'https://www.riopele.pt', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Paulo de Oliveira', websiteUrl: 'https://www.paulodeoliveira.pt', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Calvelex', websiteUrl: 'https://www.calvelex.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TMG Automotive', websiteUrl: 'https://www.tmgautomotive.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

  // ========== MINING_ENERGY (5) ==========
  { name: 'EDP Energias de Portugal', websiteUrl: 'https://www.edp.pt', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Galp Energia', websiteUrl: 'https://www.galp.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'REN', websiteUrl: 'https://www.ren.pt', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Endesa Portugal', websiteUrl: 'https://www.endesa.pt', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Iberdrola Portugal', websiteUrl: 'https://www.iberdrola.pt', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

  // ========== HEALTHCARE (5) ==========
  { name: 'CUF Saúde', websiteUrl: 'https://www.cuf.pt', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Luz Saúde', websiteUrl: 'https://www.luzsaude.pt', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hospital da Cruz Vermelha', websiteUrl: 'https://www.hcvp.pt', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lusíadas Saúde', websiteUrl: 'https://www.lusiadas.pt', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Trofa Saúde', websiteUrl: 'https://www.trofasaude.pt', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

  // ========== HOSPITALITY_TOURISM (5) ==========
  { name: 'Pestana Hotel Group', websiteUrl: 'https://www.pestana.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vila Galé', websiteUrl: 'https://www.vilagale.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tivoli Hotels', websiteUrl: 'https://www.tivolihotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NAU Hotels', websiteUrl: 'https://www.nauhotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'AP Hotels', websiteUrl: 'https://www.aphotels.pt', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

  // ========== AGRICULTURE (5) ==========
  { name: 'Sugalidal', websiteUrl: 'https://www.sugalidal.pt', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sovena', websiteUrl: 'https://www.sovenagroup.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vitacress Portugal', websiteUrl: 'https://www.vitacress.pt', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Campotec', websiteUrl: 'https://www.campotec.pt', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Herdade do Esporão', websiteUrl: 'https://www.esporao.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

  // ========== SECURITY_SERVICES (5) ==========
  { name: 'Securitas Portugal', websiteUrl: 'https://www.securitas.pt', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Prosegur Portugal', websiteUrl: 'https://www.prosegur.pt', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: '2045 Segurança', websiteUrl: 'https://www.2045.pt', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Grupo 8 Segurança', websiteUrl: 'https://www.grupo8.pt', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Strong Segurança', websiteUrl: 'https://www.strongseguranca.pt', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

  // ========== FACILITY_MANAGEMENT (5) ==========
  { name: 'ISS Portugal', websiteUrl: 'https://www.pt.issworld.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sodexo Portugal', websiteUrl: 'https://www.sodexo.pt', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Manpower Portugal', websiteUrl: 'https://www.manpower.pt', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Multiserviços Portugal', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Eulen Portugal', websiteUrl: 'https://www.eulen.pt', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

  // ========== METAL_STEEL (5) ==========
  { name: 'Siderurgia Nacional', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fapricela', websiteUrl: 'https://www.fapricela.pt', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CaetanoBus', websiteUrl: 'https://www.caetanobus.pt', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Duritcast', websiteUrl: 'https://www.duritcast.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sofarimex', websiteUrl: 'https://www.sofarimex.pt', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CHEMICALS_PLASTICS (5) ==========
  { name: 'Bondalti', websiteUrl: 'https://www.bondalti.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sapec', websiteUrl: 'https://www.sapec.pt', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CUF Químicos', websiteUrl: 'https://www.bondalti.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hovione', websiteUrl: 'https://www.hovione.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Solvay Portugal', websiteUrl: 'https://www.solvay.pt', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },

  // ========== ECOMMERCE_CARGO (5) ==========
  { name: 'Worten', websiteUrl: 'https://www.worten.pt', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'KuantoKusta', websiteUrl: 'https://www.kuantokusta.pt', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'FNAC Portugal', websiteUrl: 'https://www.fnac.pt', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CTT Expresso', websiteUrl: 'https://www.cttexpresso.pt', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'GLS Portugal', websiteUrl: 'https://www.gls-group.eu/pt', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },

  // ========== TELECOMMUNICATIONS (5) ==========
  { name: 'NOS Portugal', websiteUrl: 'https://www.nos.pt', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MEO Altice Portugal', websiteUrl: 'https://www.meo.pt', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vodafone Portugal', websiteUrl: 'https://www.vodafone.pt', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nokia Portugal', websiteUrl: 'https://www.nokia.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ericsson Portugal', websiteUrl: 'https://www.ericsson.com/pt', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },

  // ========== OTHER — Government (5) ==========
  { name: 'IEFP Portugal', websiteUrl: 'https://www.iefp.pt', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'Segurança Social', websiteUrl: 'https://www.seg-social.pt', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'ADSE', websiteUrl: 'https://www.adse.pt', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'ePortugal', websiteUrl: 'https://eportugal.gov.pt', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
  { name: 'AMA', websiteUrl: 'https://www.ama.gov.pt', sector: Sector.OTHER, sourceType: SourceType.GOVERNMENT },
];

async function main() {
  const market = Market.PT;
  console.log(`Seeding ${ALL_ENTRIES.length} additional companies for PT market (part 2)...`);
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
            name: `${entry.name} Empregos`,
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
