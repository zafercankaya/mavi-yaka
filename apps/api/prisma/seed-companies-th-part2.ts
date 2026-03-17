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
  // ========== LOGISTICS_TRANSPORTATION (10) ==========
  { name: 'Kerry Express Thailand', websiteUrl: 'https://www.kerryexpress.com/th', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Flash Express', websiteUrl: 'https://www.flashexpress.co.th', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Best Express Thailand', websiteUrl: 'https://www.best-inc.co.th', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NocNoc Logistics', websiteUrl: 'https://www.nocnoc.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SCG Logistics', websiteUrl: 'https://www.scglogistics.co.th', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'BTS Group (Skytrain)', websiteUrl: 'https://www.bfrgroup.co.th', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nok Air', websiteUrl: 'https://www.nokair.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Smile Airways', websiteUrl: 'https://www.thaismileair.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Lion Air', websiteUrl: 'https://www.lionairthai.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Alpha Fast', websiteUrl: 'https://www.alphafast.com', sector: Sector.LOGISTICS_TRANSPORTATION, sourceType: SourceType.COMPANY_CAREER },

  // ========== MANUFACTURING (10) ==========
  { name: 'Thai Summit Group', websiteUrl: 'https://www.thaisummit.co.th', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Siam Cement Group Packaging', websiteUrl: 'https://www.scgpackaging.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Delta Electronics Thailand', websiteUrl: 'https://www.deltathailand.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Hana Microelectronics', websiteUrl: 'https://www.hfrgroup.co.th', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cal-Comp Electronics Thailand', websiteUrl: 'https://www.calcomp.co.th', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Fabrinet', websiteUrl: 'https://www.fabrinet.com', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SVI Public Company', websiteUrl: 'https://www.sfrgroup.co.th', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Stanley Electric', websiteUrl: 'https://www.tfrgroup.co.th', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Loxley Public Company', websiteUrl: 'https://www.loxley.co.th', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vinythai Public Company', websiteUrl: 'https://www.afrgroup.co.th', sector: Sector.MANUFACTURING, sourceType: SourceType.COMPANY_CAREER },

  // ========== RETAIL (10) ==========
  { name: 'The Mall Group', websiteUrl: 'https://www.themalfrgroup.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Robinson Department Store', websiteUrl: 'https://www.robinson.co.th', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'HomePro', websiteUrl: 'https://www.homepro.co.th', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Makro Thailand', websiteUrl: 'https://www.makro.co.th', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Siam Global House', websiteUrl: 'https://www.globalhouse.co.th', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Central Retail Corporation', websiteUrl: 'https://www.centralretail.com', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tops Supermarket', websiteUrl: 'https://www.tops.co.th', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CPN (Central Pattana)', websiteUrl: 'https://www.centralpattana.co.th', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Power Buy', websiteUrl: 'https://www.powerbuy.co.th', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Watsons Thailand', websiteUrl: 'https://www.watsons.co.th', sector: Sector.RETAIL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CONSTRUCTION (10) ==========
  { name: 'Italian-Thai Development', websiteUrl: 'https://www.itd.co.th', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CH. Karnchang', websiteUrl: 'https://www.chfrgroup.co.th', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sino-Thai Engineering', websiteUrl: 'https://www.stecon.co.th', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Unique Engineering', websiteUrl: 'https://www.unique.co.th', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nawarat Patanakarn', websiteUrl: 'https://www.nawarat.co.th', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Christiani & Nielsen Thai', websiteUrl: 'https://www.cn-thai.co.th', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pruksa Holding', websiteUrl: 'https://www.pruksa.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Quality Houses', websiteUrl: 'https://www.qh.co.th', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sansiri', websiteUrl: 'https://www.sansiri.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },
  { name: 'AP Thailand', websiteUrl: 'https://www.apthai.com', sector: Sector.CONSTRUCTION, sourceType: SourceType.COMPANY_CAREER },

  // ========== FOOD_BEVERAGE (10) ==========
  { name: 'Thai Union Group', websiteUrl: 'https://www.thaiunion.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Betagro Group', websiteUrl: 'https://www.betagro.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Oishi Group', websiteUrl: 'https://www.ofrgroup.co.th', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'S&P Syndicate', websiteUrl: 'https://www.snpfood.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Minor Food', websiteUrl: 'https://www.minorfood.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Singha Corporation', websiteUrl: 'https://www.singha.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'BeerThai (Chang)', websiteUrl: 'https://www.beerthai.co.th', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tipco Foods', websiteUrl: 'https://www.tipco.net', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Khao Shong', websiteUrl: 'https://www.khaoshong.com', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MAMA (Thai President Foods)', websiteUrl: 'https://www.tfrgroup.co.th', sector: Sector.FOOD_BEVERAGE, sourceType: SourceType.COMPANY_CAREER },

  // ========== AUTOMOTIVE (10) ==========
  { name: 'Toyota Motor Thailand', websiteUrl: 'https://www.toyota.co.th', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Honda Automobile Thailand', websiteUrl: 'https://www.honda.co.th', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Isuzu Motors Thailand', websiteUrl: 'https://www.isuzu-tis.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mitsubishi Motors Thailand', websiteUrl: 'https://www.mitsubishi-motors.co.th', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Nissan Motor Thailand', websiteUrl: 'https://www.nissan.co.th', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Mazda Sales Thailand', websiteUrl: 'https://www.mazda.co.th', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ford Thailand', websiteUrl: 'https://www.ford.co.th', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MG Sales Thailand', websiteUrl: 'https://www.mgcars.com', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'GWM Thailand', websiteUrl: 'https://www.gwm.co.th', sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Auto Tools', websiteUrl: null, sector: Sector.AUTOMOTIVE, sourceType: SourceType.COMPANY_CAREER },

  // ========== TEXTILE (9) ==========
  { name: 'Saha Group (Textiles)', websiteUrl: 'https://www.sahfrgroup.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Rayon', websiteUrl: 'https://www.thairayon.com', sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Erawan Textile', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thong Thai Textile', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Melon Polyester', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kangwal Textile', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Siam Textile', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Asia Fiber Public', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Textile Prestige', websiteUrl: null, sector: Sector.TEXTILE, sourceType: SourceType.COMPANY_CAREER },

  // ========== MINING_ENERGY (10) ==========
  { name: 'EGAT (Electricity Generating Authority)', websiteUrl: 'https://www.egat.co.th', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'IRPC Public Company', websiteUrl: 'https://www.irpc.co.th', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PTTEP', websiteUrl: 'https://www.pttep.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Gulf Energy Development', websiteUrl: 'https://www.gulf.co.th', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'B.Grimm Power', websiteUrl: 'https://www.bfrgroup.co.th', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Global Power Synergy', websiteUrl: 'https://www.gpscgroup.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ratchaburi Electricity', websiteUrl: 'https://www.ratch.co.th', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Oil', websiteUrl: 'https://www.thaioilgroup.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Star Petroleum Refining', websiteUrl: 'https://www.sprc.co.th', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Banpu Public Company', websiteUrl: 'https://www.banpu.com', sector: Sector.MINING_ENERGY, sourceType: SourceType.COMPANY_CAREER },

  // ========== HEALTHCARE (10) ==========
  { name: 'Bangkok Dusit Medical Services', websiteUrl: 'https://www.bdms.co.th', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Bumrungrad International', websiteUrl: 'https://www.bumrungrad.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Samitivej Hospital', websiteUrl: 'https://www.samitivejhospitals.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thonburi Healthcare', websiteUrl: 'https://www.thonburihealthcare.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Chularat Hospital', websiteUrl: 'https://www.chularat.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Vibhavadi Hospital', websiteUrl: 'https://www.vibhavadi.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Phyathai Hospital', websiteUrl: 'https://www.phyathai.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Paolo Hospital', websiteUrl: 'https://www.paolohospital.com', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ramathibodi Hospital', websiteUrl: 'https://www.rama.mahidol.ac.th', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kasemrad Hospital', websiteUrl: 'https://www.kasemrad.co.th', sector: Sector.HEALTHCARE, sourceType: SourceType.COMPANY_CAREER },

  // ========== HOSPITALITY_TOURISM (10) ==========
  { name: 'Dusit Thani', websiteUrl: 'https://www.dusit.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Centara Hotels', websiteUrl: 'https://www.centarahotelsresorts.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Anantara Hotels', websiteUrl: 'https://www.anantara.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Amari Hotels', websiteUrl: 'https://www.amari.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Onyx Hospitality Group', websiteUrl: 'https://www.onfrgroup.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'U Hotels & Resorts', websiteUrl: 'https://www.uhotelsresorts.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Agoda Thailand', websiteUrl: 'https://www.agoda.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'The Erawan Group', websiteUrl: 'https://www.thefrgroup.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Banyan Tree Thailand', websiteUrl: 'https://www.bfrgroup.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Cape & Kantary Hotels', websiteUrl: 'https://www.capekantaryhotels.com', sector: Sector.HOSPITALITY_TOURISM, sourceType: SourceType.COMPANY_CAREER },

  // ========== AGRICULTURE (10) ==========
  { name: 'Mitr Phol Sugar', websiteUrl: 'https://www.mitrphol.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Khon Kaen Sugar', websiteUrl: 'https://www.kfrgroup.co.th', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Wah Public', websiteUrl: 'https://www.thaiwah.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Kaset Thai International', websiteUrl: 'https://www.kasetthai.co.th', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NR Instant Produce', websiteUrl: 'https://www.nrfrgroup.co.th', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Sri Trang Agro-Industry', websiteUrl: 'https://www.sfrgroup.co.th', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lam Soon Thailand', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pacific Seeds Thailand', websiteUrl: null, sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'East-West Seed Thailand', websiteUrl: 'https://www.eastwestseed.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Univanich Palm Oil', websiteUrl: 'https://www.univanich.com', sector: Sector.AGRICULTURE, sourceType: SourceType.COMPANY_CAREER },

  // ========== SECURITY_SERVICES (10) ==========
  { name: 'Guardian Security Thailand', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'MK Guard', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Top Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SQ Security Guard', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Siam Nistrans Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Major Security Guard', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'K.S.P. Security Guard', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Safety Life Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Samakkhi Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },
  { name: 'King Power Security', websiteUrl: null, sector: Sector.SECURITY_SERVICES, sourceType: SourceType.COMPANY_CAREER },

  // ========== FACILITY_MANAGEMENT (10) ==========
  { name: 'Land and Houses', websiteUrl: 'https://www.lh.co.th', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Supalai Public', websiteUrl: 'https://www.supalai.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Lalin Property', websiteUrl: 'https://www.lalin.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'SC Asset Corporation', websiteUrl: 'https://www.scasset.com', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Origin Property', websiteUrl: 'https://www.origin.co.th', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Noble Development', websiteUrl: 'https://www.nfrgroup.co.th', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Ananda Development', websiteUrl: 'https://www.ananda.co.th', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Plus Property', websiteUrl: 'https://www.plusfrgroup.co.th', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Property Perfect', websiteUrl: 'https://www.pfrgroup.co.th', sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Golden Land Property', websiteUrl: null, sector: Sector.FACILITY_MANAGEMENT, sourceType: SourceType.COMPANY_CAREER },

  // ========== METAL_STEEL (6) ==========
  { name: 'Sahaviriya Steel', websiteUrl: 'https://www.sfrgroup.co.th', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'G Steel Public Company', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Millcon Steel Public', websiteUrl: 'https://www.millconsteel.com', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Tata Steel Thailand', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'NS BlueScope Thailand', websiteUrl: null, sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pacific Pipe Public Company', websiteUrl: 'https://www.pacificpipe.co.th', sector: Sector.METAL_STEEL, sourceType: SourceType.COMPANY_CAREER },

  // ========== CHEMICALS_PLASTICS (8) ==========
  { name: 'Indorama Ventures', websiteUrl: 'https://www.indoramaventures.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'PTT Global Chemical', websiteUrl: 'https://www.pttgcgroup.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Plastic Industries', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Berli Jucker (BJC)', websiteUrl: 'https://www.bjc.co.th', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'TOA Paint Thailand', websiteUrl: 'https://www.toagroup.com', sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Aica Asia Pacific', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Asian Chemical Public', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai ABS Company', websiteUrl: null, sector: Sector.CHEMICALS_PLASTICS, sourceType: SourceType.COMPANY_CAREER },

  // ========== ECOMMERCE_CARGO (8) ==========
  { name: 'Lazada Thailand', websiteUrl: 'https://www.lazada.co.th', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'JD Central', websiteUrl: 'https://www.jd.co.th', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Line Man Wongnai', websiteUrl: 'https://www.lineman.line.me', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Robinhood Thailand', websiteUrl: 'https://www.robinhood.in.th', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Happy Fresh Thailand', websiteUrl: 'https://www.happyfresh.co.th', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Pomelo Fashion', websiteUrl: 'https://www.pomelofashion.com', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thai Post EMS', websiteUrl: 'https://www.thailandpost.co.th', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },
  { name: 'GrabMart Thailand', websiteUrl: 'https://www.grab.com/th', sector: Sector.ECOMMERCE_CARGO, sourceType: SourceType.COMPANY_CAREER },

  // ========== TELECOMMUNICATIONS (10) ==========
  { name: 'TOT Public Company', websiteUrl: 'https://www.tot.co.th', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CAT Telecom', websiteUrl: 'https://www.cattelecom.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'JASMINE International', websiteUrl: 'https://www.jasmine.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Samart Corporation', websiteUrl: 'https://www.samart.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Thaicom', websiteUrl: 'https://www.thaicom.net', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'CS Loxinfo', websiteUrl: 'https://www.csloxinfo.com', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Advanced Info Service Mobile', websiteUrl: 'https://www.ais.th', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Triple T Internet', websiteUrl: 'https://www.3bb.co.th', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Interlink Telecom', websiteUrl: 'https://www.interlink.co.th', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
  { name: 'Synnex Thailand', websiteUrl: 'https://www.synfrgroup.co.th', sector: Sector.TELECOMMUNICATIONS, sourceType: SourceType.COMPANY_CAREER },
];

async function main() {
  const market = Market.TH;
  console.log(`Seeding ${ALL_ENTRIES.length} additional companies for TH market (part2)...`);
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
            name: `${entry.name} สมัครงาน`,
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
