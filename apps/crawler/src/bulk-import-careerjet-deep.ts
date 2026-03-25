/**
 * bulk-import-careerjet-deep.ts — Deep CareerJet Import for Weak Markets
 *
 * Targets markets with <600 listings using 50+ keywords each.
 * Usage: npx ts-node --transpile-only src/bulk-import-careerjet-deep.ts [market|ALL]
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const CAREERJET_API_KEY = process.env.CAREERJET_API_KEY || '';
const API_BASE = 'https://search.api.careerjet.net/v4/query';
const PAGE_SIZE = 100;
const MAX_PAGES = 20; // Increased from 10 for deeper coverage
const REQUEST_DELAY_MS = 600;
const REQUEST_TIMEOUT_MS = 20_000;
const REFERER = 'https://mavi-yaka-api.onrender.com/find-jobs/';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const USER_IP = '109.123.248.85';

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/[çć]/g, 'c').replace(/[şś]/g, 's').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/warehouse|lager|logist|driver|chauffeur|courier|delivery|shipping|freight|forklift|truck|postal|packer|kargo|운전|배달|tài xế|motorista|conductor|vận chuyển|gudang|supir|kurir/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|production|factory|assembly|fabrik|usine|fábrica|produktion|operario|생산|공장|sản xuất|nhà máy|pabrik|buruh/i.test(t)) return 'MANUFACTURING';
  if (/retail|cashier|store|shop|vendeur|verkäuf|cajero|loja|supermarket|매장|판매|cửa hàng|bán hàng|kasir|toko/i.test(t)) return 'RETAIL';
  if (/construct|builder|mason|carpenter|plumber|roofer|bricklayer|건설|목수|thợ xây|xây dựng|pedreiro|albañil|tukang/i.test(t)) return 'CONSTRUCTION';
  if (/cook|chef|kitchen|restaurant|baker|butcher|food|catering|waiter|barista|조리|요리|đầu bếp|nhà hàng|koki|cocinero|cozinheiro/i.test(t)) return 'FOOD_BEVERAGE';
  if (/mechanic|automotive|car|vehicle|garage|workshop|정비|수리|thợ sửa|ô tô|montir|mecánico|mecânico/i.test(t)) return 'AUTOMOTIVE';
  if (/textile|sewing|tailor|garment|fabric|봉제|재봉|may mặc|dệt|tekstil|costura/i.test(t)) return 'TEXTILE';
  if (/mining|energy|electric.*power|oil|gas|광산|에너지|năng lượng|mỏ|minería|mineração/i.test(t)) return 'MINING_ENERGY';
  if (/nurse|hospital|care.*assist|patient|health.*aide|간호|요양|y tá|bệnh viện|enfermero|enfermeiro/i.test(t)) return 'HEALTHCARE';
  if (/hotel|cleaning|housekeeper|reception|laundry|청소|객실|khách sạn|dọn phòng|limpieza|limpeza/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/farm|agricult|tractor|livestock|garden|농업|농장|nông nghiệp|trồng|pertanian|agricultor/i.test(t)) return 'AGRICULTURE';
  if (/security|guard|watchman|경비|보안|bảo vệ|an ninh|satpam|vigilante|segurança/i.test(t)) return 'SECURITY_SERVICES';
  if (/janitor|facility|maintenance|building|관리|시설|vệ sinh|tòa nhà|petugas|portero|zelador/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/weld|metal|steel|iron|forge|용접|금속|hàn|thép|las|besi|soldador/i.test(t)) return 'METAL_STEEL';
  if (/chemical|plastic|paint|pharma|lab|화학|플라스틱|hóa chất|nhựa|kimia|químico/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/telecom|cable|fiber|network.*install|통신|케이블|viễn thông|cáp|telekomunikasi/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

interface MarketConfig {
  locale: string;
  market: Market;
  keywords: string[];
}

// ─── DEEP KEYWORD SETS FOR WEAK MARKETS ─────────────────────────────

const MARKET_CONFIGS: MarketConfig[] = [
  {
    locale: 'vi_VN', market: 'VN',
    keywords: [
      // Kho vận & Logistics
      'công nhân kho', 'nhân viên kho', 'lái xe tải', 'tài xế', 'shipper', 'giao hàng',
      'bốc xếp', 'vận chuyển', 'kho bãi', 'phụ xe', 'lái xe container',
      // Sản xuất & Nhà máy
      'công nhân sản xuất', 'công nhân nhà máy', 'thợ máy', 'vận hành máy', 'đóng gói',
      'kiểm hàng', 'công nhân may', 'thợ in', 'thợ dệt', 'lắp ráp',
      // Xây dựng
      'thợ xây', 'thợ nề', 'thợ sơn', 'thợ mộc', 'thợ ống nước', 'thợ trát',
      'phụ hồ', 'công nhân xây dựng', 'lái cẩu', 'thợ chống thấm',
      // Điện & Kỹ thuật
      'thợ điện', 'thợ điện lạnh', 'thợ điện nước', 'kỹ thuật viên', 'thợ hàn',
      'thợ tiện', 'thợ cơ khí', 'thợ sửa chữa',
      // Ẩm thực & Nhà hàng
      'đầu bếp', 'phụ bếp', 'bếp trưởng', 'nhân viên bếp', 'phục vụ', 'pha chế',
      'rửa bát', 'nhân viên nhà hàng', 'thợ làm bánh',
      // Bán lẻ
      'thu ngân', 'nhân viên bán hàng', 'bán hàng siêu thị', 'trưng bày hàng',
      // Bảo vệ & Vệ sinh
      'bảo vệ', 'nhân viên an ninh', 'lao công', 'tạp vụ', 'vệ sinh',
      'nhân viên vệ sinh', 'bảo trì', 'bảo dưỡng',
      // Nông nghiệp
      'nông dân', 'công nhân nông trại', 'chăn nuôi', 'trồng trọt', 'thu hoạch',
      // Khác
      'thợ cắt tóc', 'giặt ủi', 'may vá', 'xe ôm', 'grab bike',
    ],
  },
  {
    locale: 'ko_KR', market: 'KR',
    keywords: [
      // 물류 & 창고
      '물류창고', '지게차 운전', '화물차 운전', '택배기사', '배달기사',
      '창고관리', '상하차', '물류센터', '운송기사', '포장작업',
      // 생산 & 제조
      '생산직', '공장 작업', '조립', '기계 운전', 'CNC', '프레스',
      '제조업', '품질검사', '포장', '생산관리', '라인작업',
      // 건설
      '건설노동자', '비계공', '미장공', '목수', '배관공', '용접공',
      '철근공', '도장공', '콘크리트', '토공', '방수공',
      // 전기 & 기술
      '전기기사', '전기공', '설비기사', '냉동기사', '보일러',
      '기계설비', '배관설비', '에어컨설치',
      // 요식업
      '조리사', '주방보조', '주방장', '제빵사', '바리스타',
      '서빙', '식당 보조', '설거지', '급식조리',
      // 판매 & 매장
      '판매원', '매장 직원', '캐셔', '마트 직원', '편의점',
      // 경비 & 청소
      '경비원', '보안요원', '청소원', '환경미화원', '건물관리',
      '시설관리', '주차관리',
      // 돌봄
      '요양보호사', '간병인', '가사도우미',
      // 농업
      '농장', '축산', '어업', '양식',
      // 기타
      '택시기사', '버스기사', '대리운전', '세차', '이사',
    ],
  },
  {
    locale: 'en_PK', market: 'PK',
    keywords: [
      // Warehouse & Logistics
      'warehouse helper', 'store keeper', 'truck driver', 'delivery rider', 'loader',
      'goods handler', 'logistics helper', 'van driver', 'transport', 'courier',
      'rider', 'dispatch worker', 'warehouse supervisor',
      // Manufacturing & Factory
      'factory worker', 'machine operator', 'production worker', 'packing', 'quality check',
      'assembly worker', 'mill worker', 'textile worker', 'garment worker', 'stitching operator',
      // Construction
      'mason', 'carpenter', 'painter', 'plumber', 'electrician helper',
      'steel fixer', 'scaffolder', 'construction labourer', 'tile worker', 'shuttering',
      // Electrical & Technical
      'electrician', 'AC technician', 'generator technician', 'UPS technician',
      'welder', 'fitter', 'turner', 'fabricator', 'pipe fitter',
      // Food & Kitchen
      'cook', 'chef', 'kitchen helper', 'baker', 'butcher',
      'waiter', 'dishwasher', 'tandoor', 'hotel staff',
      // Retail & Sales
      'salesman', 'shop assistant', 'cashier', 'helper', 'counter staff',
      // Security & Cleaning
      'security guard', 'chowkidar', 'sweeper', 'cleaner', 'janitor',
      'peon', 'office boy', 'gardener', 'mali', 'naib qasid',
      // Auto & Mechanic
      'mechanic', 'auto electrician', 'denter', 'car painter', 'tyre fitter',
      // Agriculture & Other
      'farmer', 'farm worker', 'tailor', 'darzi', 'barber',
      'laundry worker', 'press wala', 'driver domestic',
    ],
  },
  {
    locale: 'pt_PT', market: 'PT',
    keywords: [
      // Armazém & Logística
      'operador armazém', 'empilhadorista', 'motorista pesados', 'motorista ligeiros',
      'estafeta', 'distribuição', 'preparador encomendas', 'arrumador', 'logística',
      'carregador', 'conferente', 'motorista carta D',
      // Produção & Fábrica
      'operário fabril', 'operador máquina', 'operador CNC', 'embalador',
      'operador produção', 'montador', 'serralheiro', 'torneiro', 'fresador',
      'soldador', 'controlador qualidade', 'operário industrial',
      // Construção Civil
      'pedreiro', 'servente', 'carpinteiro', 'pintor construção', 'canalizador',
      'trolha', 'ladrilhador', 'estucador', 'impermeabilizador', 'calceteiro',
      'armador ferro', 'gruista', 'manobrador',
      // Eletricidade & Técnica
      'eletricista', 'técnico AVAC', 'técnico manutenção', 'técnico frio',
      'instalador', 'serralheiro civil',
      // Restauração & Hotelaria
      'cozinheiro', 'ajudante cozinha', 'pasteleiro', 'padeiro', 'talhante',
      'empregado mesa', 'barman', 'copeiro', 'empregada andares',
      // Comércio
      'repositor', 'operador caixa', 'empregado balcão', 'promotor vendas',
      // Limpeza & Segurança
      'empregada limpeza', 'auxiliar limpeza', 'vigilante', 'porteiro',
      'jardineiro', 'auxiliar manutenção',
      // Saúde
      'auxiliar saúde', 'ajudante lar', 'cuidador idosos',
      // Agricultura
      'trabalhador agrícola', 'apanhador fruta', 'viticultor', 'horticultor',
      'trator', 'vindimador',
    ],
  },
  {
    locale: 'ar_EG', market: 'EG',
    keywords: [
      // مستودعات ولوجستيات
      'عامل مخزن', 'عامل تحميل', 'سائق نقل', 'سائق توصيل', 'عامل شحن',
      'مندوب توصيل', 'عامل لوجستيات', 'سائق تريلا', 'سائق ميكروباص',
      // تصنيع ومصانع
      'عامل مصنع', 'عامل انتاج', 'مشغل ماكينة', 'عامل تعبئة', 'عامل تغليف',
      'فني انتاج', 'مشغل خط انتاج', 'عامل نسيج', 'خياط', 'عامل ملابس',
      // بناء وتشييد
      'عامل بناء', 'بناء', 'نقاش', 'سباك', 'نجار',
      'حداد مسلح', 'عامل محارة', 'عامل بلاط', 'عامل عزل', 'عامل خرسانة',
      // كهرباء وفنيات
      'كهربائي', 'فني تكييف', 'فني صيانة', 'لحام', 'خراط',
      'فني تبريد', 'فني كهرباء', 'فني مصاعد',
      // مطاعم وفنادق
      'طباخ', 'مساعد طباخ', 'شيف', 'خباز', 'جزار',
      'جرسون', 'عامل بوفيه', 'غسيل أطباق', 'عامل فندق',
      // بيع بالتجزئة
      'بائع', 'كاشير', 'عامل محل', 'مندوب مبيعات',
      // أمن ونظافة
      'أمن', 'حارس', 'عامل نظافة', 'فراش', 'بواب',
      'عامل حدائق', 'حارس ليلي',
      // سيارات
      'ميكانيكي', 'كهربائي سيارات', 'سمكري', 'دهان سيارات', 'فني إطارات',
      // زراعة
      'عامل زراعي', 'فلاح', 'عامل مزرعة',
      // أخرى
      'حلاق', 'عامل مغسلة', 'سائق تاكسي', 'عامل مطبعة',
    ],
  },
  {
    locale: 'id_ID', market: 'ID',
    keywords: [
      // Gudang & Logistik
      'operator gudang', 'helper gudang', 'supir truk', 'kurir', 'driver pengiriman',
      'bongkar muat', 'checker gudang', 'forklift operator', 'supir container',
      // Produksi & Pabrik
      'operator mesin', 'buruh pabrik', 'operator produksi', 'helper produksi',
      'quality control', 'packing', 'operator sewing', 'buruh harian',
      'operator cutting', 'operator welding',
      // Konstruksi
      'kuli bangunan', 'tukang batu', 'tukang cat', 'tukang kayu', 'tukang pipa',
      'tukang besi', 'mandor', 'operator alat berat', 'tukang keramik',
      // Listrik & Teknik
      'teknisi listrik', 'tukang las', 'teknisi AC', 'teknisi mesin',
      'teknisi maintenance', 'tukang bubut', 'mekanik',
      // Makanan & Restoran
      'koki', 'juru masak', 'helper dapur', 'tukang roti', 'barista',
      'pelayan', 'waitress', 'pencuci piring', 'tukang daging',
      // Ritel
      'kasir', 'pramuniaga', 'SPG', 'SPB', 'sales counter',
      // Keamanan & Kebersihan
      'satpam', 'security', 'cleaning service', 'office boy', 'tukang kebun',
      'petugas parkir', 'penjaga malam',
      // Otomotif
      'montir', 'mekanik mobil', 'mekanik motor', 'tukang ketok',
      // Pertanian
      'petani', 'buruh tani', 'nelayan', 'peternak',
      // Lainnya
      'tukang cukur', 'tukang jahit', 'laundry', 'ojek online',
      'sopir pribadi', 'baby sitter',
    ],
  },
  {
    locale: 'ja_JP', market: 'JP',
    keywords: [
      // 倉庫・物流
      '倉庫作業', 'フォークリフト', 'トラック運転手', '配送ドライバー', '配達員',
      '仕分け作業', 'ピッキング', '梱包', '検品', '引越し作業員',
      '宅配ドライバー', '軽貨物',
      // 製造・工場
      '製造スタッフ', '工場作業', '組立作業', '機械オペレーター', 'プレス作業',
      '溶接工', '旋盤工', 'CNC', '検査作業', 'ライン作業',
      '食品製造', 'マシンオペレーター', '金属加工',
      // 建設
      '建設作業員', '土木作業', '鳶職', '大工', '左官',
      '塗装工', '配管工', '鉄筋工', 'クレーンオペレーター', '足場',
      'はつり', '型枠大工', '解体工',
      // 電気・技術
      '電気工事', '電気技師', '設備工事', 'エアコン取付', '空調設備',
      'ボイラー技士', '消防設備', 'ビルメンテナンス',
      // 飲食
      '調理師', '調理補助', 'キッチンスタッフ', 'パン職人', '寿司職人',
      'ホールスタッフ', '洗い場', 'バリスタ', '居酒屋',
      // 販売
      'レジスタッフ', '販売スタッフ', 'コンビニ', 'スーパー', '品出し',
      // 警備・清掃
      '警備員', '清掃員', 'ビル清掃', '施設管理', '管理人',
      // 介護
      '介護スタッフ', '介護福祉士', 'ヘルパー', '看護助手',
      // 農業
      '農業', '農作業', '酪農', '漁業',
      // その他
      '美容師', 'クリーニング', 'タクシードライバー', '自動車整備士',
    ],
  },
  {
    locale: 'es_ES', market: 'ES',
    keywords: [
      // Almacén y Logística
      'mozo almacén', 'carretillero', 'conductor camión', 'repartidor', 'transportista',
      'preparador pedidos', 'operador logístico', 'empaquetador', 'cargador',
      'mensajero', 'conductor autobús',
      // Producción y Fábrica
      'operario producción', 'operador máquina', 'operario CNC', 'envasador',
      'montador industrial', 'soldador', 'tornero', 'fresador',
      'operario línea', 'peón industrial',
      // Construcción
      'albañil', 'peón construcción', 'encofrador', 'ferrallista', 'pintor',
      'fontanero', 'carpintero', 'cristalero', 'gruista', 'yesero',
      'techador', 'impermeabilizador', 'escayolista',
      // Electricidad y Técnica
      'electricista', 'técnico mantenimiento', 'instalador', 'climatización',
      'técnico frigorista', 'cerrajero',
      // Hostelería y Restauración
      'cocinero', 'ayudante cocina', 'pastelero', 'panadero', 'carnicero',
      'camarero', 'barman', 'friegaplatos', 'camarera pisos',
      // Comercio
      'reponedor', 'cajero', 'dependiente', 'promotor ventas',
      // Limpieza y Seguridad
      'limpiador', 'auxiliar limpieza', 'vigilante seguridad', 'conserje',
      'jardinero', 'peón mantenimiento',
      // Sanidad
      'auxiliar enfermería', 'cuidador', 'gerocultora',
      // Agricultura
      'peón agrícola', 'jornalero', 'recolector', 'tractorista',
      // Otros
      'mecánico', 'chapista', 'tapicero', 'costurera',
    ],
  },
  // Also boost some mid-tier markets
  {
    locale: 'th_TH', market: 'TH',
    keywords: [
      'พนักงานคลังสินค้า', 'พนักงานขับรถ', 'พนักงานขับรถบรรทุก', 'คนส่งของ', 'ไรเดอร์',
      'พนักงานขนส่ง', 'พนักงานยกของ',
      'พนักงานผลิต', 'พนักงานโรงงาน', 'ช่างเทคนิค', 'ช่างเครื่อง', 'พนักงานบรรจุ',
      'ช่างไฟฟ้า', 'ช่างเชื่อม', 'ช่างกลึง', 'ช่างซ่อมบำรุง',
      'คนงานก่อสร้าง', 'ช่างปูน', 'ช่างไม้', 'ช่างทาสี', 'ช่างประปา',
      'แม่บ้าน', 'พ่อครัว', 'แม่ครัว', 'ผู้ช่วยเชฟ', 'พนักงานเสิร์ฟ',
      'บาริสต้า', 'พนักงานล้างจาน', 'คนขายของ', 'แคชเชียร์',
      'รปภ', 'พนักงานรักษาความปลอดภัย', 'พนักงานทำความสะอาด',
      'ช่างยนต์', 'ช่างซ่อมรถ', 'พนักงานล้างรถ',
      'คนสวน', 'ผู้ดูแลผู้สูงอายุ', 'แม่บ้านโรงแรม',
      'ช่างตัดผม', 'ช่างแอร์', 'พนักงานซักรีด',
    ],
  },
  {
    locale: 'en_PH', market: 'PH',
    keywords: [
      'warehouse worker', 'forklift operator', 'truck driver', 'delivery rider', 'messenger',
      'dispatcher', 'loader', 'packer', 'sorter',
      'factory worker', 'machine operator', 'production worker', 'assembly worker',
      'sewing operator', 'quality inspector',
      'construction worker', 'mason', 'carpenter', 'painter', 'plumber',
      'steel man', 'laborer', 'heavy equipment operator',
      'electrician', 'welder', 'aircon technician', 'mechanic', 'technician',
      'cook', 'kitchen helper', 'baker', 'butcher', 'barista',
      'waiter', 'food server', 'dishwasher', 'restaurant crew',
      'cashier', 'sales lady', 'sales clerk', 'store crew', 'promodiser',
      'security guard', 'janitor', 'utility worker', 'gardener',
      'building maintenance', 'housekeeping', 'caregiver',
      'driver personal', 'tricycle driver', 'grab rider',
      'laundry worker', 'tailor', 'barber',
      'farm worker', 'fisherman', 'farmer',
    ],
  },
  {
    locale: 'en_MY', market: 'MY',
    keywords: [
      'warehouse worker', 'forklift operator', 'lorry driver', 'delivery rider', 'dispatch',
      'store keeper', 'goods handler', 'loader',
      'factory worker', 'machine operator', 'production operator', 'assembly worker',
      'sewing operator', 'packer', 'quality inspector',
      'construction worker', 'general worker', 'carpenter', 'painter', 'plumber',
      'electrician', 'welder', 'aircon technician', 'mechanic', 'technician',
      'cook', 'kitchen helper', 'baker', 'barista', 'food server',
      'waiter', 'dishwasher', 'restaurant crew',
      'cashier', 'sales assistant', 'promoter', 'shop assistant',
      'security guard', 'cleaner', 'gardener', 'building maintenance',
      'housekeeping', 'room attendant', 'caregiver',
      'grab driver', 'e-hailing driver', 'personal driver',
      'laundry worker', 'tailor',
      'farm worker', 'plantation worker', 'fisherman',
    ],
  },
  {
    locale: 'ar_SA', market: 'SA',
    keywords: [
      'عامل مستودع', 'مشغل رافعة', 'سائق شاحنة', 'سائق توصيل', 'مندوب توصيل',
      'عامل شحن', 'مراقب مخزون', 'عامل تحميل',
      'عامل مصنع', 'مشغل آلات', 'عامل إنتاج', 'عامل تعبئة', 'عامل تغليف',
      'فني إنتاج', 'عامل نسيج',
      'عامل بناء', 'بنّاء', 'نقاش', 'سباك', 'نجار',
      'حداد', 'عامل بلاط', 'مبلط',
      'كهربائي', 'فني تكييف', 'فني صيانة', 'لحام', 'فني تبريد',
      'طباخ', 'طاهي', 'مساعد مطبخ', 'خباز', 'جزار',
      'نادل', 'عامل مطعم', 'غسيل أواني',
      'بائع', 'كاشير', 'مروج مبيعات',
      'حارس أمن', 'عامل نظافة', 'بستاني', 'عامل حدائق',
      'ميكانيكي', 'كهربائي سيارات', 'فني إطارات',
      'عامل مزرعة', 'راعي', 'سائق خاص',
      'حلاق', 'عامل مغسلة', 'خياط',
    ],
  },
  {
    locale: 'ar_AE', market: 'AE',
    keywords: [
      'warehouse worker', 'forklift operator', 'heavy driver', 'delivery driver', 'rider',
      'loader', 'store keeper', 'logistics helper',
      'factory worker', 'machine operator', 'production worker', 'packer', 'quality worker',
      'construction labourer', 'mason', 'painter', 'plumber', 'carpenter',
      'steel fixer', 'tiler', 'scaffolder',
      'electrician', 'AC technician', 'maintenance technician', 'welder', 'fitter',
      'cook', 'kitchen helper', 'baker', 'butcher', 'barista',
      'waiter', 'steward', 'dishwasher', 'hotel housekeeping',
      'salesman', 'cashier', 'shop assistant', 'merchandiser',
      'security guard', 'cleaner', 'office boy', 'gardener',
      'car mechanic', 'auto electrician', 'tyre technician',
      'farm worker', 'driver personal', 'laundry worker', 'tailor', 'barber',
    ],
  },
  {
    locale: 'es_CO', market: 'CO',
    keywords: [
      'bodeguero', 'auxiliar bodega', 'conductor camión', 'domiciliario', 'mensajero',
      'repartidor', 'auxiliar logística', 'empacador', 'patinador',
      'operario producción', 'operario máquina', 'operario planta', 'auxiliar producción',
      'empacador', 'confeccionista',
      'albañil', 'ayudante construcción', 'oficial construcción', 'pintor', 'plomero',
      'carpintero', 'enchapador', 'mampostero',
      'electricista', 'soldador', 'mecánico industrial', 'tornero', 'técnico mantenimiento',
      'cocinero', 'auxiliar cocina', 'panadero', 'mesero', 'barista',
      'tendero', 'cajero', 'impulsador', 'mercaderista',
      'vigilante', 'guarda seguridad', 'auxiliar aseo', 'todero',
      'jardinero', 'auxiliar servicios generales',
      'mecánico automotriz', 'latonero', 'electricista automotriz',
      'agricultor', 'jornalero', 'recolector café',
      'peluquero', 'conductor taxi',
    ],
  },
  {
    locale: 'es_AR', market: 'AR',
    keywords: [
      'operario depósito', 'playero', 'chofer camión', 'cadete', 'repartidor',
      'fletero', 'auxiliar logística', 'embalador',
      'operario producción', 'operario máquina', 'ayudante producción', 'empacador',
      'costurero', 'operario textil',
      'albañil', 'peón construcción', 'oficial albañil', 'pintor', 'plomero',
      'carpintero', 'yesero', 'durlock',
      'electricista', 'soldador', 'tornero', 'mecánico industrial', 'matricero',
      'cocinero', 'ayudante cocina', 'panadero', 'mozo', 'barista',
      'carnicero', 'fiambrero',
      'repositor', 'cajero', 'vendedor mostrador', 'promotor',
      'vigilador', 'sereno', 'auxiliar limpieza', 'encargado edificio',
      'jardinero', 'mantenimiento',
      'mecánico automotriz', 'chapista', 'electricista automotriz',
      'peón rural', 'tractorista', 'tambero',
      'peluquero', 'remisero',
    ],
  },
  {
    locale: 'nl_NL', market: 'NL',
    keywords: [
      'magazijnmedewerker', 'orderpicker', 'heftruckchauffeur', 'vrachtwagenchauffeur',
      'bezorger', 'koerier', 'chauffeur', 'logistiek medewerker', 'expeditiemedewerker',
      'productiemedewerker', 'machine operator', 'inpakker', 'assemblage medewerker',
      'fabrieksmedewerker', 'operator',
      'bouwvakker', 'timmerman', 'metselaar', 'schilder', 'stukadoor',
      'loodgieter', 'dakdekker', 'stratenmaker', 'grondwerker', 'betonvlechter',
      'lasser', 'constructiebankwerker', 'CNC operator', 'draaier', 'frezer',
      'plaatwerker', 'pijpfitter', 'monteur', 'onderhoudsmonteur',
      'kok', 'keukenhulp', 'afwasser', 'kelner', 'barmedewerker',
      'bakker', 'slager', 'horeca medewerker',
      'schoonmaker', 'glazenwasser', 'huishoudelijk medewerker',
      'beveiliger', 'portier', 'receptionist beveiliging',
      'tuinman', 'hovenier', 'groenmedewerker', 'agrarisch medewerker',
      'zorgmedewerker', 'verzorgende', 'thuishulp',
      'elektricien', 'installateur', 'servicemonteur',
      'vuilnisman', 'straatreiniger', 'gemeentewerker',
      'winkelmedewerker', 'vakkenvuller', 'caissière',
      'automonteur', 'APK keurmeester', 'bandenmonteur',
    ],
  },
  {
    locale: 'pl_PL', market: 'PL',
    keywords: [
      'magazynier', 'operator wózka widłowego', 'kierowca ciężarówki', 'kurier',
      'dostawca', 'kierowca kat C', 'pakowacz', 'komisjoner', 'logistyk',
      'operator produkcji', 'pracownik produkcji', 'monter', 'operator maszyn',
      'pracownik fabryki', 'kontroler jakości',
      'murarz', 'tynkarz', 'cieśla', 'dekarz', 'malarz budowlany',
      'płytkarz', 'zbrojarz', 'betoniarz', 'pracownik budowlany', 'brukarz',
      'spawacz', 'ślusarz', 'tokarz', 'frezer', 'operator CNC',
      'lakiernik', 'blacharz', 'mechanik przemysłowy',
      'kucharz', 'pomoc kuchenna', 'kelner', 'barman', 'piekarz',
      'cukiernik', 'rzeźnik', 'kucharz pizzy',
      'sprzątaczka', 'pracownik gospodarczy', 'konserwator',
      'ochroniarz', 'portier', 'dozorca',
      'elektryk', 'hydraulik', 'instalator', 'serwisant',
      'ogrodnik', 'pracownik zieleni',
      'opiekunka', 'opiekun osoby starszej',
      'kasjer', 'sprzedawca', 'pracownik sklepu',
      'mechanik samochodowy', 'wulkanizator', 'lakiernik samochodowy',
      'pracownik sortowni', 'ładowacz', 'pomocnik magazyniera',
    ],
  },
  {
    locale: 'it_IT', market: 'IT',
    keywords: [
      'magazziniere', 'carrellista', 'mulettista', 'autista', 'corriere',
      'facchino', 'addetto logistica', 'spedizioniere', 'camionista',
      'operaio', 'addetto produzione', 'operatore macchina', 'assemblatore',
      'confezionatore', 'operaio generico',
      'muratore', 'piastrellista', 'imbianchino', 'carpentiere', 'idraulico',
      'elettricista', 'cartongessista', 'ferraiolo', 'manovale', 'gruista',
      'saldatore', 'tornitore', 'fresatore', 'operatore CNC', 'fabbro',
      'lattoniere', 'tubista', 'meccanico industriale',
      'cuoco', 'aiuto cuoco', 'lavapiatti', 'cameriere', 'barista',
      'pizzaiolo', 'panettiere', 'pasticcere', 'macellaio',
      'addetto pulizie', 'bidello', 'custode', 'portiere',
      'guardia giurata', 'addetto vigilanza',
      'giardiniere', 'operaio agricolo', 'bracciante',
      'badante', 'assistente anziani', 'operatore socio sanitario',
      'commesso', 'cassiere', 'scaffalista',
      'meccanico auto', 'gommista', 'carrozziere',
      'netturbino', 'operatore ecologico',
    ],
  },
  {
    locale: 'fr_FR', market: 'FR',
    keywords: [
      'manutentionnaire', 'cariste', 'préparateur commandes', 'chauffeur poids lourd',
      'livreur', 'magasinier', 'agent logistique', 'conducteur routier',
      'ouvrier production', 'opérateur machine', 'agent fabrication', 'conditionneur',
      'emballeur', 'opérateur usine',
      'maçon', 'peintre bâtiment', 'plaquiste', 'carreleur', 'couvreur',
      'charpentier', 'plombier', 'manoeuvre', 'coffreur', 'ferrailleur',
      'soudeur', 'tourneur', 'fraiseur', 'opérateur CNC', 'serrurier',
      'tôlier', 'chaudronnier', 'mécanicien industriel',
      'cuisinier', 'commis cuisine', 'plongeur', 'serveur', 'barman',
      'boulanger', 'pâtissier', 'boucher',
      'agent entretien', 'agent propreté', 'femme ménage', 'gardien immeuble',
      'agent sécurité', 'veilleur nuit',
      'jardinier', 'paysagiste', 'ouvrier agricole',
      'aide soignant', 'auxiliaire vie', 'aide domicile',
      'employé libre service', 'caissier', 'vendeur',
      'mécanicien auto', 'carrossier',
      'éboueur', 'agent voirie',
    ],
  },
  {
    locale: 'en_IN', market: 'IN',
    keywords: [
      'warehouse helper', 'godown keeper', 'forklift operator', 'truck driver',
      'delivery boy', 'courier boy', 'loading unloading', 'packer',
      'factory worker', 'machine operator', 'production helper', 'fitter',
      'assembly worker', 'quality checker',
      'mason', 'painter', 'carpenter', 'plumber', 'electrician',
      'tile fitter', 'rod binder', 'construction helper', 'scaffolder',
      'welder', 'turner', 'CNC operator', 'fitter mechanic', 'blacksmith',
      'cook', 'kitchen helper', 'waiter', 'chef', 'tandoor',
      'baker', 'butcher',
      'housekeeping', 'sweeper', 'cleaner', 'peon', 'office boy',
      'security guard', 'watchman', 'bouncer',
      'gardener', 'farm labourer', 'tractor driver',
      'nursing assistant', 'ward boy', 'ayah',
      'cashier', 'shop assistant', 'salesman',
      'auto mechanic', 'car washer', 'tyre fitter',
      'tailor', 'stitcher', 'ironing',
    ],
  },
  {
    locale: 'en_GB', market: 'UK',
    keywords: [
      'warehouse operative', 'picker packer', 'forklift driver', 'HGV driver',
      'delivery driver', 'courier', 'van driver', 'logistics operative',
      'factory operative', 'machine operator', 'production operative', 'assembler',
      'packer', 'quality inspector',
      'labourer', 'bricklayer', 'plasterer', 'painter decorator', 'roofer',
      'plumber', 'scaffolder', 'groundworker', 'steel fixer', 'banksman',
      'welder', 'fabricator', 'CNC operator', 'sheet metal worker', 'fitter',
      'pipe fitter', 'maintenance engineer',
      'chef', 'kitchen porter', 'commis chef', 'waiting staff', 'barista',
      'baker', 'butcher',
      'cleaner', 'window cleaner', 'domestic assistant',
      'security officer', 'door supervisor', 'CCTV operator',
      'gardener', 'groundskeeper', 'farm worker',
      'care assistant', 'support worker', 'domiciliary carer',
      'retail assistant', 'shelf stacker', 'checkout operator',
      'vehicle technician', 'tyre fitter', 'valet',
      'refuse collector', 'street cleaner',
    ],
  },
  {
    locale: 'pt_BR', market: 'BR',
    keywords: [
      'auxiliar logística', 'operador empilhadeira', 'motorista caminhão',
      'entregador', 'motoboy', 'ajudante carga', 'conferente', 'estoquista',
      'operador produção', 'auxiliar produção', 'operador máquina', 'montador',
      'embalador', 'operário',
      'pedreiro', 'pintor', 'carpinteiro', 'encanador', 'eletricista',
      'azulejista', 'armador', 'servente obra', 'gesseiro',
      'soldador', 'torneiro', 'fresador', 'operador CNC', 'serralheiro',
      'caldeireiro', 'funileiro',
      'cozinheiro', 'ajudante cozinha', 'garçom', 'barman', 'padeiro',
      'confeiteiro', 'açougueiro',
      'auxiliar limpeza', 'zelador', 'faxineiro', 'porteiro',
      'vigilante', 'segurança',
      'jardineiro', 'trabalhador rural', 'tratorista',
      'cuidador idosos', 'auxiliar enfermagem',
      'operador caixa', 'repositor', 'vendedor',
      'mecânico automotivo', 'borracheiro', 'lanterneiro',
      'gari', 'coletor lixo',
    ],
  },
  {
    locale: 'es_MX', market: 'MX',
    keywords: [
      'almacenista', 'montacarguista', 'chofer trailer', 'repartidor',
      'ayudante general', 'cargador', 'auxiliar almacén', 'empacador',
      'operador producción', 'obrero', 'maquilador', 'operador máquina',
      'armador', 'inspector calidad',
      'albañil', 'pintor', 'plomero', 'electricista', 'carpintero',
      'yesero', 'azulejero', 'fierrero', 'peón obra',
      'soldador', 'tornero', 'operador CNC', 'herrero',
      'mecánico industrial',
      'cocinero', 'ayudante cocina', 'mesero', 'barista', 'panadero',
      'tortillero', 'carnicero',
      'intendencia', 'limpieza', 'conserje', 'velador',
      'vigilante', 'guardia seguridad',
      'jardinero', 'jornalero', 'peón campo',
      'auxiliar enfermería', 'cuidador',
      'cajero', 'acomodador', 'vendedor piso',
      'mecánico automotriz', 'hojalatero', 'vulcanizador',
    ],
  },
];

// ─── Source lookup/creation ──────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `careerjet-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'CareerJet' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'CareerJet', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'CareerJet',
          slug: `careerjet-${market.toLowerCase()}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.careerjet.com',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `CareerJet ${market} Job Listings`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market,
        companyId: company.id,
        seedUrls: [`https://www.careerjet.com`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── Fetch ───────────────────────────────────────────────────────────

async function fetchCareerJet(locale: string, keyword: string, page: number): Promise<any> {
  const params = new URLSearchParams({
    locale_code: locale,
    keywords: keyword,
    page: String(page),
    page_size: String(PAGE_SIZE),
    fragment_size: '500',
    sort: 'date',
    user_ip: USER_IP,
    user_agent: USER_AGENT,
  });

  const url = `${API_BASE}?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const authHeader = 'Basic ' + Buffer.from(`${CAREERJET_API_KEY}:`).toString('base64');
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Referer': REFERER,
      },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Import single market ────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function importMarket(config: MarketConfig, stats: ImportStats): Promise<number> {
  const source = await getOrCreateSource(config.market);
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const keyword of config.keywords) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchCareerJet(config.locale, keyword, page);

        if (data.type === 'ERROR') {
          console.warn(`  [${config.market}] API error for "${keyword}": ${data.error}`);
          stats.errors++;
          hasMore = false;
          continue;
        }

        const jobs = data.jobs || [];
        stats.fetched += jobs.length;

        for (const job of jobs) {
          const jobUrl = job.url || '';
          if (!jobUrl) { stats.skipped++; continue; }

          const urlHash = md5(jobUrl);
          if (seen.has(urlHash)) { stats.skipped++; continue; }
          seen.add(urlHash);

          const title = job.title || keyword;
          const canonicalUrl = jobUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`careerjet:${config.locale}:${urlHash}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const city = job.locations || null;
          const desc = job.description?.substring(0, 5000) || null;

          if (!isBlueCollar(title, desc)) {
            stats.skipped++;
            continue;
          }

          batch.push({
            title,
            slug,
            sourceUrl: jobUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: config.market,
            city,
            sector: detectSector(title, desc),
            description: desc,
            postedDate: job.date ? new Date(job.date) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        const totalHits = data.hits || 0;
        hasMore = jobs.length === PAGE_SIZE && page < MAX_PAGES && (page * PAGE_SIZE) < totalHits;
        page++;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          console.warn(`  [${config.market}] Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  [${config.market}] "${keyword}" p${page}: ${msg.substring(0, 80)}`);
          stats.errors++;
          hasMore = false;
        }
      }
    }
  }

  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  return seen.size;
}

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!CAREERJET_API_KEY) {
    console.error('❌ CAREERJET_API_KEY not set');
    process.exit(1);
  }

  const target = (process.argv[2] || 'ALL').toUpperCase();

  console.log(`\n🔵 Mavi Yaka — CareerJet DEEP Import (Weak Markets)`);
  console.log(`Target: ${target}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };

  const configs = target === 'ALL'
    ? MARKET_CONFIGS
    : MARKET_CONFIGS.filter(c => c.market === target);

  if (configs.length === 0) {
    console.error(`No config found for "${target}"`);
    return;
  }

  try {
    for (const config of configs) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`[${config.locale} → ${config.market}] Starting... (${config.keywords.length} keywords)`);

      const unique = await importMarket(config, stats);
      console.log(`[${config.locale} → ${config.market}] Done: ${unique.toLocaleString()} unique`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
  console.log(`  Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

main().catch(console.error);
