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
  // ========== LOGISTICS_TRANSPORTATION (7) ==========
  { name: 'Anteraja', websiteUrl: 'https://anteraja.id', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ID Express', websiteUrl: 'https://idexpress.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Wahana Express', websiteUrl: 'https://www.wahana.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TIKI', websiteUrl: 'https://www.tiki.id', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pelni', websiteUrl: 'https://www.pelni.co.id', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'KAI (Kereta Api Indonesia)', websiteUrl: 'https://www.kai.id', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TransJakarta', websiteUrl: 'https://www.transjakarta.co.id', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

  // ========== MANUFACTURING (7) ==========
  { name: 'Kalbe Farma', websiteUrl: 'https://www.kalbe.co.id', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Unilever Indonesia', websiteUrl: 'https://www.unilever.co.id', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Semen Indonesia', websiteUrl: 'https://www.semenindonesia.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Suzuki Indomobil', websiteUrl: 'https://www.suzuki.co.id', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yamaha Indonesia Motor', websiteUrl: 'https://www.yamaha-motor.co.id', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Samsung Indonesia', websiteUrl: 'https://www.samsung.com/id', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Polytron', websiteUrl: 'https://www.polytron.co.id', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

  // ========== RETAIL (8) ==========
  { name: 'Matahari Department Store', websiteUrl: 'https://www.matahari.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hero Supermarket', websiteUrl: 'https://www.hero.co.id', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lotte Mart Indonesia', websiteUrl: 'https://www.lottemart.co.id', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hypermart', websiteUrl: 'https://www.hypermart.co.id', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ace Hardware Indonesia', websiteUrl: 'https://www.acehardware.co.id', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Electronic City', websiteUrl: 'https://www.electronic-city.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ramayana', websiteUrl: 'https://www.ramayana.co.id', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Transmart', websiteUrl: 'https://www.transmart.co.id', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CONSTRUCTION (7) ==========
  { name: 'Adhi Karya', websiteUrl: 'https://www.adhi.co.id', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PP (Pembangunan Perumahan)', websiteUrl: 'https://www.pp.co.id', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hutama Karya', websiteUrl: 'https://www.hutamakarya.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Brantas Abipraya', websiteUrl: 'https://www.brantas-abipraya.co.id', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nindya Karya', websiteUrl: 'https://www.nindyakarya.co.id', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Total Bangun Persada', websiteUrl: 'https://www.totalbp.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Acset Indonusa', websiteUrl: 'https://www.acset.co', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

  // ========== FOOD_BEVERAGE (8) ==========
  { name: 'Garudafood', websiteUrl: 'https://www.garudafood.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ABC President Indonesia', websiteUrl: null, sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Siantar Top', websiteUrl: 'https://www.siantartop.co.id', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ultrajaya', websiteUrl: 'https://www.ultrajaya.co.id', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nippon Indosari', websiteUrl: 'https://www.sariroti.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sosro', websiteUrl: 'https://www.sosro.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Campina Ice Cream', websiteUrl: 'https://www.campina.co.id', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Orang Tua Group', websiteUrl: 'https://www.ot.id', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

  // ========== AUTOMOTIVE (7) ==========
  { name: 'Toyota Astra Motor', websiteUrl: 'https://www.toyota.astra.co.id', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Honda Prospect Motor', websiteUrl: 'https://www.honda-indonesia.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mitsubishi Motors Indonesia', websiteUrl: 'https://www.mitsubishi-motors.co.id', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Daihatsu Indonesia', websiteUrl: 'https://daihatsu.co.id', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hyundai Indonesia', websiteUrl: 'https://www.hyundai.com/id', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Wuling Motors Indonesia', websiteUrl: 'https://wuling.id', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Astra Otoparts', websiteUrl: 'https://www.astra-otoparts.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

  // ========== TEXTILE (7) ==========
  { name: 'Pan Brothers', websiteUrl: 'https://www.panbrothers.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sritex (Sri Rejeki Isman)', websiteUrl: 'https://www.sfrgroup.co.id', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Asia Pacific Fibers', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Indo-Rama Synthetics', websiteUrl: 'https://www.indorama.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Trisula International', websiteUrl: 'https://www.trisulainternational.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Argo Pantes', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Eratex Djaja', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

  // ========== MINING_ENERGY (7) ==========
  { name: 'Adaro Energy', websiteUrl: 'https://www.adaro.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bukit Asam', websiteUrl: 'https://www.ptba.co.id', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Medco Energi', websiteUrl: 'https://www.medcoenergi.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bumi Resources', websiteUrl: 'https://www.bumiresources.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vale Indonesia', websiteUrl: 'https://www.vale.com/indonesia', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Antam', websiteUrl: 'https://www.antam.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Timah', websiteUrl: 'https://www.timah.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

  // ========== HEALTHCARE (7) ==========
  { name: 'Kimia Farma', websiteUrl: 'https://www.kimiafarma.co.id', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bio Farma', websiteUrl: 'https://www.biofarma.co.id', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mitra Keluarga Hospital', websiteUrl: 'https://www.mitrakeluarga.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Medikaloka Health', websiteUrl: null, sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hermina Hospital', websiteUrl: 'https://www.herminahospitals.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pondok Indah Hospital', websiteUrl: 'https://www.rspondokindah.co.id', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mayapada Hospital', websiteUrl: 'https://www.mayapadahospital.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

  // ========== HOSPITALITY_TOURISM (8) ==========
  { name: 'Archipelago International', websiteUrl: 'https://www.archipelagointernational.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sahid Hotels', websiteUrl: 'https://www.sahidhotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Santika Hotels', websiteUrl: 'https://www.santika.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Swiss-Belhotel Indonesia', websiteUrl: 'https://www.swiss-belhotel.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Traveloka', websiteUrl: 'https://www.traveloka.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tiket.com', websiteUrl: 'https://www.tiket.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'RedDoorz Indonesia', websiteUrl: 'https://www.reddoorz.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'AYANA Resort', websiteUrl: 'https://www.ayana.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

  // ========== AGRICULTURE (7) ==========
  { name: 'PTPN III', websiteUrl: 'https://www.holding-perkebunan.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sampoerna Agro', websiteUrl: 'https://www.sampoernaagro.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Astra Agro Lestari', websiteUrl: 'https://www.astra-agro.co.id', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'London Sumatra Indonesia', websiteUrl: 'https://www.londonsumatra.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Salim Ivomas Pratama', websiteUrl: 'https://www.sifrgroup.co.id', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Eagle High Plantations', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tunas Baru Lampung', websiteUrl: 'https://www.tunasbarulampung.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

  // ========== SECURITY_SERVICES (7) ==========
  { name: 'ISS Indonesia', websiteUrl: 'https://www.iss.id', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bravo Satria Perkasa', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PT Garda Bhakti Nusantara', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PT Handal Perkasa Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PT Prima Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PT Jaga Raya', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PT Shield On Service', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

  // ========== FACILITY_MANAGEMENT (7) ==========
  { name: 'Ciputra Group', websiteUrl: 'https://www.ciputra.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lippo Karawaci', websiteUrl: 'https://www.lippokarawaci.co.id', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pakuwon Jati', websiteUrl: 'https://www.pakuwon.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Summarecon Agung', websiteUrl: 'https://www.summarecon.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Agung Podomoro Land', websiteUrl: 'https://www.agungpodomoroland.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bumi Serpong Damai', websiteUrl: 'https://www.sfrgroup.co.id', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alam Sutera Realty', websiteUrl: 'https://www.alamsutera.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

  // ========== METAL_STEEL (7) ==========
  { name: 'Gunung Raja Paksi', websiteUrl: 'https://www.gunungrajapaksi.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gunawan Dianjaya Steel', websiteUrl: 'https://www.gfrgroup.co.id', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Betonjaya Manunggal', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Jakarta Cakratunggal Steel', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pelangi Indah Canindo', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ispatindo', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alumindo Light Metal', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CHEMICALS_PLASTICS (7) ==========
  { name: 'Barito Pacific', websiteUrl: 'https://www.barito-pacific.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lotte Chemical Indonesia', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lautan Luas', websiteUrl: 'https://www.lautan-luas.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Unggul Indah Cahaya', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tridomain Chemical', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Indo Acidatama', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Argha Karya Prima', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },

  // ========== ECOMMERCE_CARGO (7) ==========
  { name: 'Bukalapak Logistics', websiteUrl: 'https://www.bukalapak.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lazada Indonesia', websiteUrl: 'https://www.lazada.co.id', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Blibli Express', websiteUrl: 'https://www.blibli.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sayurbox', websiteUrl: 'https://www.sayurbox.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'HappyFresh Indonesia', websiteUrl: 'https://www.happyfresh.id', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Astro Groceries', websiteUrl: 'https://www.astronauts.id', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Segari', websiteUrl: null, sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },

  // ========== TELECOMMUNICATIONS (7) ==========
  { name: 'XL Axiata', websiteUrl: 'https://www.xl.co.id', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Smartfren', websiteUrl: 'https://www.smartfren.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tower Bersama Infrastructure', websiteUrl: 'https://www.tfrgroup.co.id', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sarana Menara Nusantara', websiteUrl: 'https://www.sfrgroup.co.id', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lintasarta', websiteUrl: 'https://www.lintasarta.net', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Biznet', websiteUrl: 'https://www.biznetnetworks.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'First Media', websiteUrl: 'https://www.firstmedia.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

async function main() {
  const market = Market.ID;
  console.log(`Seeding ${ALL_ENTRIES.length} additional companies for ID market (part2)...`);
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
            name: `${entry.name} Lowongan Kerja`,
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
