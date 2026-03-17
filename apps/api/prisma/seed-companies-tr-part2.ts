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
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ========== LOGISTICS_TRANSPORTATION (8) ==========
const LOGISTICS: CompanyEntry[] = [
  { name: 'Koç Holding Lojistik', websiteUrl: 'https://www.koc.com.tr', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sabancı Lojistik', websiteUrl: 'https://www.sabanci.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TAV Havalimanları', websiteUrl: 'https://www.tavhavalimanlari.com.tr', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ulusoy Kargo', websiteUrl: 'https://www.ulusoykargo.com.tr', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kargo Turk', websiteUrl: null, sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fillo Lojistik', websiteUrl: 'https://www.ffrr.com.tr', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Genel Transport', websiteUrl: null, sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Koçak Farma Lojistik', websiteUrl: 'https://www.kocakfarma.com.tr', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MANUFACTURING (8) ==========
const MANUFACTURING: CompanyEntry[] = [
  { name: 'Vestel Beyaz Eşya', websiteUrl: 'https://www.vestel.com.tr', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Beko Üretim', websiteUrl: 'https://www.beko.com.tr', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Silverline Üretim', websiteUrl: 'https://www.silverline.com.tr', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kaleseramik', websiteUrl: 'https://www.kale.com.tr', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Viko Elektrik', websiteUrl: 'https://www.viko.com.tr', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Eczacıbaşı Yapı Gereçleri', websiteUrl: 'https://www.eczacibasi.com.tr', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Uzel Makina', websiteUrl: null, sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Elginkan Holding', websiteUrl: 'https://www.elginkan.com.tr', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
];

// ========== RETAIL (8) ==========
const RETAIL: CompanyEntry[] = [
  { name: 'Koçtaş Yapı Market', websiteUrl: 'https://www.koctas.com.tr', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tekzen Yapı Market', websiteUrl: 'https://www.tekzen.com.tr', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Watsons Türkiye', websiteUrl: 'https://www.watsons.com.tr', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Praktiker Türkiye', websiteUrl: null, sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Joker Baby', websiteUrl: 'https://www.jokerbaby.com.tr', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Migros Depo', websiteUrl: 'https://www.migros.com.tr', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ToyzzShop', websiteUrl: 'https://www.toyzz.com.tr', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vakko Mağazacılık', websiteUrl: 'https://www.vakko.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CONSTRUCTION (8) ==========
const CONSTRUCTION: CompanyEntry[] = [
  { name: 'Limak İnşaat', websiteUrl: 'https://www.limak.com.tr', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'İlk Yapı', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alarko İnşaat', websiteUrl: 'https://www.alarko.com.tr', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Doğuş İnşaat Proje', websiteUrl: 'https://www.dogusinsaat.com.tr', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Çalık İnşaat Proje', websiteUrl: 'https://www.calik.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Makyol İnşaat', websiteUrl: 'https://www.makyol.com.tr', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Özaltın Yapı', websiteUrl: null, sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mesa İnşaat', websiteUrl: 'https://www.mesa.com.tr', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FOOD_BEVERAGE (8) ==========
const FOOD_BEVERAGE: CompanyEntry[] = [
  { name: 'Yıldız Holding', websiteUrl: 'https://www.yildizholding.com.tr', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Eti Bisküvi', websiteUrl: 'https://www.etigida.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dardanel', websiteUrl: 'https://www.dardanel.com.tr', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Uludağ Gazoz', websiteUrl: 'https://www.uludagicecek.com.tr', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nuh Çimento', websiteUrl: 'https://www.nuhcimento.com.tr', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Altıparmak Gıda', websiteUrl: 'https://www.altiparmak.com.tr', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Doğadan Çay', websiteUrl: 'https://www.dogadan.com.tr', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Niğde Gazoz', websiteUrl: null, sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AUTOMOTIVE (8) ==========
const AUTOMOTIVE: CompanyEntry[] = [
  { name: 'Doğuş Otomotiv Servis', websiteUrl: 'https://www.dogusotomotiv.com.tr', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Otokoç Servis', websiteUrl: 'https://www.otokoc.com.tr', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Anadolu Motor', websiteUrl: null, sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Renault MAİS Otomotiv', websiteUrl: 'https://www.renaultmais.com.tr', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hattat Otomotiv', websiteUrl: 'https://www.hattatholding.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Koluman Otomotiv', websiteUrl: 'https://www.koluman.com.tr', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Çelik Motor Servis', websiteUrl: null, sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Otokar Savunma', websiteUrl: 'https://www.otokar.com.tr', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TEXTILE (7) ==========
const TEXTILE: CompanyEntry[] = [
  { name: 'Sarar Giyim', websiteUrl: 'https://www.sarar.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kiğılı Giyim', websiteUrl: 'https://www.kigili.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Altınyıldız Classics', websiteUrl: 'https://www.altinyildizclassics.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Karaca Giyim', websiteUrl: 'https://www.karfraca.com.tr', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Colin\'s Mağazacılık', websiteUrl: 'https://www.colins.com.tr', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'US Polo Türkiye', websiteUrl: 'https://www.uspolo.com.tr', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Network Giyim', websiteUrl: 'https://www.network.com.tr', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== MINING_ENERGY (7) ==========
const MINING_ENERGY: CompanyEntry[] = [
  { name: 'OYAK Madencilik', websiteUrl: 'https://www.oyak.com.tr', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tüpraş Enerji', websiteUrl: 'https://www.tupras.com.tr', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kalyon Enerji Güneş', websiteUrl: 'https://www.kalyonenerji.com.tr', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'İçdaş Enerji', websiteUrl: 'https://www.icdas.com.tr', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cengiz Enerji', websiteUrl: 'https://www.cengizholding.com.tr', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kolin Madencilik', websiteUrl: 'https://www.kolin.com.tr', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Demir Export Madencilik', websiteUrl: 'https://www.demirexport.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HEALTHCARE (7) ==========
const HEALTHCARE: CompanyEntry[] = [
  { name: 'Koç Üniversitesi Hastane', websiteUrl: 'https://www.kuh.ku.edu.tr', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yeditepe Üniversitesi Hastanesi', websiteUrl: 'https://www.yeditepe.edu.tr', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Medline Sağlık', websiteUrl: null, sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'İstanbul Cerrahi Hastanesi', websiteUrl: 'https://www.istanbulcerrahi.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Dünyagöz Hastanesi', websiteUrl: 'https://www.dunyagoz.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Başkent Üniversitesi Hastanesi', websiteUrl: 'https://www.baskent.edu.tr', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TürkMedya Sağlık', websiteUrl: null, sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== HOSPITALITY_TOURISM (7) ==========
const HOSPITALITY_TOURISM: CompanyEntry[] = [
  { name: 'Rixos Premium', websiteUrl: 'https://www.rixos.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Jolly Hotels', websiteUrl: 'https://www.jollytur.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Calista Resort', websiteUrl: 'https://www.calistaspa.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Voyage Belek', websiteUrl: 'https://www.voyagehotel.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Adam Eve Resort', websiteUrl: null, sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kaya Palazzo', websiteUrl: 'https://www.kayahotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sueno Hotels Personel', websiteUrl: 'https://www.suenohotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
];

// ========== AGRICULTURE (7) ==========
const AGRICULTURE: CompanyEntry[] = [
  { name: 'Cargill Türkiye Tarım', websiteUrl: 'https://www.cargill.com.tr', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yara Türkiye', websiteUrl: 'https://www.yara.com.tr', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Toros Tarım', websiteUrl: 'https://www.torostarım.com.tr', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Öztürkler Tarım', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bayer Tarım Türkiye', websiteUrl: 'https://www.bayer.com.tr', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Syngenta Türkiye', websiteUrl: 'https://www.syngenta.com.tr', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Polatlı Tarım Kooperatifi', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
];

// ========== SECURITY_SERVICES (7) ==========
const SECURITY_SERVICES: CompanyEntry[] = [
  { name: 'Prosegur Türkiye Güvenlik', websiteUrl: 'https://www.prosegur.com.tr', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Brink\'s Türkiye', websiteUrl: 'https://www.brinks.com.tr', sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Loomis Türkiye', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hedef Güvenlik', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Akay Güvenlik', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Anadolu Güvenlik Hizmetleri', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Güvenlik Dünyası', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
];

// ========== FACILITY_MANAGEMENT (7) ==========
const FACILITY_MANAGEMENT: CompanyEntry[] = [
  { name: 'Sodexo Tesis Türkiye', websiteUrl: 'https://www.sodexo.com.tr', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ISS Tesis Yönetimi', websiteUrl: 'https://www.tr.issworld.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Engie Tesis Türkiye', websiteUrl: 'https://www.engie.com.tr', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tepe Servis', websiteUrl: 'https://www.tepe.com.tr', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aras Tesis Yönetimi', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Park Tesis Bakım', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Temiz İş Tesis', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
];

// ========== METAL_STEEL (7) ==========
const METAL_STEEL: CompanyEntry[] = [
  { name: 'OYAK Çelik', websiteUrl: 'https://www.oyak.com.tr', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tosyalı Demir Çelik', websiteUrl: 'https://www.tosyaliholding.com.tr', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Diler Demir Çelik', websiteUrl: 'https://www.diler.com.tr', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kaptan Demir', websiteUrl: 'https://www.kaptandemir.com.tr', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'İskenderun Demir', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yazıcılar Holding Çelik', websiteUrl: 'https://www.yazicilar.com.tr', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cevher Döküm', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
];

// ========== CHEMICALS_PLASTICS (7) ==========
const CHEMICALS_PLASTICS: CompanyEntry[] = [
  { name: 'Aksa Kimya', websiteUrl: 'https://www.aksa.com.tr', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Petkim Kimya', websiteUrl: 'https://www.petkim.com.tr', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kibar Holding Plastik', websiteUrl: 'https://www.kibar.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Polisan Kimya', websiteUrl: 'https://www.polisan.com.tr', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Betek Boya', websiteUrl: 'https://www.bfretek.com.tr', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Teklas Kauçuk', websiteUrl: 'https://www.teklas.com.tr', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Organik Kimya', websiteUrl: 'https://www.organikkimya.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== ECOMMERCE_CARGO (7) ==========
const ECOMMERCE_CARGO: CompanyEntry[] = [
  { name: 'Trendyol Depo', websiteUrl: 'https://www.trendyol.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hepsiburada Lojistik', websiteUrl: 'https://www.hepsiburada.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'n11 Kargo', websiteUrl: 'https://www.n11.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Amazon Türkiye Depo', websiteUrl: 'https://www.amazon.com.tr', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Getir Depo', websiteUrl: 'https://www.getir.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Yemeksepeti Kurye', websiteUrl: 'https://www.yemeksepeti.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Trendyol Go', websiteUrl: 'https://www.trendyol.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
];

// ========== TELECOMMUNICATIONS (7) ==========
const TELECOMMUNICATIONS: CompanyEntry[] = [
  { name: 'Türk Telekom Altyapı', websiteUrl: 'https://www.turktelekom.com.tr', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vodafone Türkiye Saha', websiteUrl: 'https://www.vodafone.com.tr', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Turkcell Altyapı', websiteUrl: 'https://www.turkcell.com.tr', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Huawei Türkiye Telecom', websiteUrl: 'https://www.huawei.com/tr', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ericsson Türkiye Telecom', websiteUrl: 'https://www.ericsson.com/tr', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ZTE Türkiye Telecom', websiteUrl: null, sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nokia Türkiye Telecom', websiteUrl: null, sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

// ========== OTHER (7) ==========
const OTHER: CompanyEntry[] = [
  { name: 'Sabiha Gökçen Havalimanı', websiteUrl: 'https://www.sabihagokcen.aero', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'İGA İstanbul Havalimanı', websiteUrl: 'https://www.igairport.com', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'KoçSistem Bilişim', websiteUrl: 'https://www.kocsistem.com.tr', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Logo Yazılım Holding', websiteUrl: 'https://www.logo.com.tr', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Havelsan Savunma', websiteUrl: 'https://www.havelsan.com.tr', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Baykar Savunma', websiteUrl: 'https://www.baykartech.com', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
  { name: 'ASELSAN Savunma', websiteUrl: 'https://www.aselsan.com.tr', sector: Sector.OTHER, sourceType: SourceType.COMPANY_CAREER },
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
  const market = Market.TR;
  console.log(`Seeding ${ALL_ENTRIES.length} companies for TR market (part 2)...`);

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
          name: `${entry.name} İş İlanları`,
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

  console.log(`\n✓ Seeded ${count}/${ALL_ENTRIES.length} companies for TR (part 2)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
