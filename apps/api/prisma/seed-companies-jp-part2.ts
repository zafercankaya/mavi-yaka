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
  { name: 'Seino Transportation', websiteUrl: 'https://www.seino.co.jp', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fukuyama Transporting', websiteUrl: 'https://www.fukutsu.co.jp', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kintetsu World Express', websiteUrl: 'https://www.kwe.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nittsu', websiteUrl: 'https://www.nittsu.co.jp', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Senko Group', websiteUrl: 'https://www.senko.co.jp', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

  // ========== MANUFACTURING (5) ==========
  { name: 'Daikin Industries', websiteUrl: 'https://www.daikin.co.jp', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Komatsu', websiteUrl: 'https://home.komatsu', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fujifilm', websiteUrl: 'https://www.fujifilm.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Omron', websiteUrl: 'https://www.omron.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nidec Corporation', websiteUrl: 'https://www.nidec.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

  // ========== RETAIL (5) ==========
  { name: 'Ito-Yokado', websiteUrl: 'https://www.itoyokado.co.jp', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Daiso Industries', websiteUrl: 'https://www.daiso-sangyo.co.jp', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sundrug', websiteUrl: 'https://www.sundrug.co.jp', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Welcia Holdings', websiteUrl: 'https://www.welcia.co.jp', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tsuruha Holdings', websiteUrl: 'https://www.tsuruha-hd.co.jp', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CONSTRUCTION (5) ==========
  { name: 'Takenaka Corporation', websiteUrl: 'https://www.takenaka.co.jp', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Haseko Corporation', websiteUrl: 'https://www.haseko.co.jp', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nishimatsu Construction', websiteUrl: 'https://www.nishimatsu.co.jp', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Maeda Corporation', websiteUrl: 'https://www.maeda.co.jp', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Toda Corporation', websiteUrl: 'https://www.toda.co.jp', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

  // ========== FOOD_BEVERAGE (5) ==========
  { name: 'Nichirei Corporation', websiteUrl: 'https://www.nichirei.co.jp', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Meiji Holdings', websiteUrl: 'https://www.meiji.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yamazaki Baking', websiteUrl: 'https://www.yamazakipan.co.jp', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nisshin Seifun', websiteUrl: 'https://www.nisshin.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Maruha Nichiro', websiteUrl: 'https://www.maruha-nichiro.co.jp', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

  // ========== AUTOMOTIVE (5) ==========
  { name: 'Isuzu Motors', websiteUrl: 'https://www.isuzu.co.jp', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hino Motors', websiteUrl: 'https://www.hino.co.jp', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Daihatsu Motor', websiteUrl: 'https://www.daihatsu.co.jp', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aisin Corporation', websiteUrl: 'https://www.aisin.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Toyoda Gosei', websiteUrl: 'https://www.toyoda-gosei.co.jp', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

  // ========== TEXTILE (5) ==========
  { name: 'Teijin Limited', websiteUrl: 'https://www.teijin.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kuraray', websiteUrl: 'https://www.kuraray.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Asahi Kasei Textiles', websiteUrl: 'https://www.asahi-kasei.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Toyobo', websiteUrl: 'https://www.toyobo.co.jp', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Unitika', websiteUrl: 'https://www.unitika.co.jp', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

  // ========== MINING_ENERGY (5) ==========
  { name: 'Inpex Corporation', websiteUrl: 'https://www.inpex.co.jp', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ENEOS Holdings', websiteUrl: 'https://www.hd.eneos.co.jp', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Idemitsu Kosan', websiteUrl: 'https://www.idemitsu.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cosmo Energy', websiteUrl: 'https://www.cosmo-energy.co.jp', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chugoku Electric Power', websiteUrl: 'https://www.energia.co.jp', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

  // ========== HEALTHCARE (5) ==========
  { name: 'Terumo Corporation', websiteUrl: 'https://www.terumo.co.jp', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sysmex Corporation', websiteUrl: 'https://www.sysmex.co.jp', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hoya Corporation', websiteUrl: 'https://www.hoya.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nipro Corporation', websiteUrl: 'https://www.nipro.co.jp', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Takeda Pharmaceutical', websiteUrl: 'https://www.takeda.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

  // ========== HOSPITALITY_TOURISM (5) ==========
  { name: 'Prince Hotels', websiteUrl: 'https://www.princehotels.co.jp', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tokyu Hotels', websiteUrl: 'https://www.tokyuhotels.co.jp', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hoshino Resorts', websiteUrl: 'https://www.hoshinoresorts.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Route Inn Hotels', websiteUrl: 'https://www.route-inn.co.jp', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hotel Okura', websiteUrl: 'https://www.hotelokura.co.jp', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

  // ========== AGRICULTURE (5) ==========
  { name: 'Zen-Noh', websiteUrl: 'https://www.zennoh.or.jp', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kubota Agriculture', websiteUrl: 'https://www.kubota.co.jp', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nippon Suisan Kaisha', websiteUrl: 'https://www.nissui.co.jp', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sakata Seed', websiteUrl: 'https://www.sakataseed.co.jp', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Takii Seed', websiteUrl: 'https://www.takii.co.jp', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

  // ========== SECURITY_SERVICES (5) ==========
  { name: 'Central Security Patrols', websiteUrl: 'https://www.csp.co.jp', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sohgo Security Services', websiteUrl: 'https://www.alsok.co.jp', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Toyo Tec', websiteUrl: 'https://www.toyotec.co.jp', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Japan Security System', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fullcast Holdings', websiteUrl: 'https://www.fullcastholdings.co.jp', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

  // ========== FACILITY_MANAGEMENT (5) ==========
  { name: 'Aeon Delight', websiteUrl: 'https://www.aeondelight.co.jp', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nitto Kogyo', websiteUrl: 'https://www.nitto-kogyo.co.jp', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Japan Facility Solutions', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Leopalace21', websiteUrl: 'https://www.leopalace21.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tokyu Community', websiteUrl: 'https://www.tokyu-com.co.jp', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

  // ========== METAL_STEEL (5) ==========
  { name: 'Kobe Steel', websiteUrl: 'https://www.kobelco.co.jp', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Daido Steel', websiteUrl: 'https://www.daido.co.jp', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hitachi Metals', websiteUrl: 'https://www.hitachi-metals.co.jp', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sanyo Special Steel', websiteUrl: 'https://www.sanyo-steel.co.jp', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aichi Steel', websiteUrl: 'https://www.aichi-steel.co.jp', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CHEMICALS_PLASTICS (5) ==========
  { name: 'Mitsui Chemicals', websiteUrl: 'https://www.mitsuichemicals.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sekisui Chemical', websiteUrl: 'https://www.sekisui.co.jp', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nitto Denko', websiteUrl: 'https://www.nitto.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kaneka Corporation', websiteUrl: 'https://www.kaneka.co.jp', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'DIC Corporation', websiteUrl: 'https://www.dic-global.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },

  // ========== ECOMMERCE_CARGO (4) ==========
  { name: 'MonotaRO', websiteUrl: 'https://www.monotaro.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ZOZO', websiteUrl: 'https://corp.zozo.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Askul Corporation', websiteUrl: 'https://www.askul.co.jp', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yahoo Japan Shopping', websiteUrl: 'https://shopping.yahoo.co.jp', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },

  // ========== TELECOMMUNICATIONS (4) ==========
  { name: 'KDDI Engineering', websiteUrl: 'https://www.kddien.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Internet Initiative Japan', websiteUrl: 'https://www.iij.ad.jp', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mixi', websiteUrl: 'https://mixi.co.jp', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'LINE Yahoo', websiteUrl: 'https://www.lycorp.co.jp', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },

  // ========== OTHER (5) ==========
  { name: 'Pasona Group', websiteUrl: 'https://www.pasonagroup.co.jp', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Recruit Holdings', websiteUrl: 'https://www.recruit.co.jp', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Temp Holdings', websiteUrl: 'https://www.tempstaff.co.jp', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Adecco Japan', websiteUrl: 'https://www.adecco.co.jp', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Randstad Japan', websiteUrl: 'https://www.randstad.co.jp', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
];

async function main() {
  const market = Market.JP;
  console.log(`Seeding ${ALL_ENTRIES.length} additional companies for JP market (part2)...`);
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
            name: `${entry.name} 求人`,
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
