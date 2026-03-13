import api from './client';
import { useMarketStore } from '../store/market';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  categoryId: string | null;
}

export interface Category {
  id: string;
  name: string;
  nameEn: string | null;
  nameDe: string | null;
  slug: string;
  iconName: string | null;
  sortOrder: number;
}

/** German category name mapping (slug → German name) */
const CATEGORY_NAME_DE: Record<string, string> = {
  'alisveris': 'Einkaufen',
  'elektronik': 'Elektronik',
  'giyim-moda': 'Mode & Bekleidung',
  'ev-yasam': 'Wohnen & Leben',
  'gida-market': 'Lebensmittel & Supermarkt',
  'yeme-icme': 'Essen & Trinken',
  'kozmetik-kisisel-bakim': 'Kosmetik & Pflege',
  'spor-outdoor': 'Sport & Outdoor',
  'seyahat-ulasim': 'Reisen & Verkehr',
  'finans': 'Finanzen',
  'sigorta': 'Versicherungen',
  'otomobil': 'Automobil',
  'kitap-hobi': 'Bücher & Hobbys',
  'telekomunikasyon': 'Telekommunikation',
  'teknoloji-yazilim': 'Technologie & Software',
  'diger': 'Sonstiges',
};

/** Portuguese category name mapping (slug → Portuguese name) */
const CATEGORY_NAME_PT: Record<string, string> = {
  'alisveris': 'Compras',
  'elektronik': 'Eletrônicos',
  'giyim-moda': 'Moda & Vestuário',
  'ev-yasam': 'Casa & Vida',
  'gida-market': 'Alimentos & Supermercado',
  'yeme-icme': 'Comida & Bebida',
  'kozmetik-kisisel-bakim': 'Cosméticos & Cuidados',
  'spor-outdoor': 'Esportes & Outdoor',
  'seyahat-ulasim': 'Viagens & Transporte',
  'finans': 'Finanças',
  'sigorta': 'Seguros',
  'otomobil': 'Automóvel',
  'kitap-hobi': 'Livros & Hobbies',
  'telekomunikasyon': 'Telecomunicações',
  'teknoloji-yazilim': 'Tecnologia & Software',
  'diger': 'Outros',
};

/** Indonesian category name mapping */
const CATEGORY_NAME_ID: Record<string, string> = {
  'alisveris': 'Belanja', 'elektronik': 'Elektronik', 'giyim-moda': 'Fashion & Mode',
  'ev-yasam': 'Rumah & Kehidupan', 'gida-market': 'Makanan & Supermarket',
  'yeme-icme': 'Makanan & Minuman', 'kozmetik-kisisel-bakim': 'Kecantikan & Perawatan',
  'spor-outdoor': 'Olahraga & Outdoor', 'seyahat-ulasim': 'Perjalanan & Transportasi',
  'finans': 'Keuangan', 'sigorta': 'Asuransi', 'otomobil': 'Otomotif',
  'kitap-hobi': 'Buku & Hobi', 'telekomunikasyon': 'Telekomunikasi', 'teknoloji-yazilim': 'Teknologi & Perangkat Lunak',
  'diger': 'Lainnya',
};

/** Russian category name mapping */
const CATEGORY_NAME_RU: Record<string, string> = {
  'alisveris': 'Покупки', 'elektronik': 'Электроника', 'giyim-moda': 'Одежда и мода',
  'ev-yasam': 'Дом и жизнь', 'gida-market': 'Продукты', 'yeme-icme': 'Еда и напитки',
  'kozmetik-kisisel-bakim': 'Красота и уход', 'spor-outdoor': 'Спорт и отдых',
  'seyahat-ulasim': 'Путешествия', 'finans': 'Финансы', 'sigorta': 'Страхование',
  'otomobil': 'Автомобили', 'kitap-hobi': 'Книги и хобби',
  'telekomunikasyon': 'Телеком', 'teknoloji-yazilim': 'Технологии и ПО',
  'diger': 'Другое',
};

/** Spanish (MX) category name mapping */
const CATEGORY_NAME_ES: Record<string, string> = {
  'alisveris': 'Compras', 'elektronik': 'Electrónica', 'giyim-moda': 'Moda y Ropa',
  'ev-yasam': 'Hogar y Vida', 'gida-market': 'Alimentos', 'yeme-icme': 'Comida y Bebida',
  'kozmetik-kisisel-bakim': 'Belleza y Cuidado', 'spor-outdoor': 'Deportes y Outdoor',
  'seyahat-ulasim': 'Viajes y Transporte', 'finans': 'Finanzas', 'sigorta': 'Seguros',
  'otomobil': 'Automóvil', 'kitap-hobi': 'Libros y Hobbies',
  'telekomunikasyon': 'Telecomunicaciones', 'teknoloji-yazilim': 'Tecnología y Software',
  'diger': 'Otros',
};

/** Japanese category name mapping */
const CATEGORY_NAME_JA: Record<string, string> = {
  'alisveris': 'ショッピング', 'elektronik': '家電・電子機器', 'giyim-moda': 'ファッション',
  'ev-yasam': 'ホーム・ライフ', 'gida-market': '食品・スーパー', 'yeme-icme': 'グルメ',
  'kozmetik-kisisel-bakim': 'コスメ・ケア', 'spor-outdoor': 'スポーツ',
  'seyahat-ulasim': '旅行・交通', 'finans': '金融', 'sigorta': '保険',
  'otomobil': '自動車', 'kitap-hobi': '本・趣味',
  'telekomunikasyon': '通信', 'teknoloji-yazilim': 'テクノロジー',
  'diger': 'その他',
};

/** Thai category name mapping */
const CATEGORY_NAME_TH: Record<string, string> = {
  'alisveris': 'ช้อปปิ้ง', 'elektronik': 'อิเล็กทรอนิกส์', 'giyim-moda': 'แฟชั่น',
  'ev-yasam': 'บ้านและการใช้ชีวิต', 'gida-market': 'อาหารและซูเปอร์มาร์เก็ต',
  'yeme-icme': 'อาหารและเครื่องดื่ม', 'kozmetik-kisisel-bakim': 'ความงาม',
  'spor-outdoor': 'กีฬา', 'seyahat-ulasim': 'ท่องเที่ยว', 'finans': 'การเงิน',
  'sigorta': 'ประกันภัย', 'otomobil': 'ยานยนต์', 'kitap-hobi': 'หนังสือและงานอดิเรก',
  'telekomunikasyon': 'โทรคมนาคม', 'teknoloji-yazilim': 'เทคโนโลยี',
  'diger': 'อื่นๆ',
};

/** French category name mapping */
const CATEGORY_NAME_FR: Record<string, string> = {
  'alisveris': 'Shopping', 'elektronik': 'Électronique', 'giyim-moda': 'Mode & Vêtements',
  'ev-yasam': 'Maison & Vie', 'gida-market': 'Alimentation & Supermarché',
  'yeme-icme': 'Restauration', 'kozmetik-kisisel-bakim': 'Beauté & Soins',
  'spor-outdoor': 'Sport & Outdoor', 'seyahat-ulasim': 'Voyages & Transport',
  'finans': 'Finance', 'sigorta': 'Assurance', 'otomobil': 'Automobile',
  'kitap-hobi': 'Livres & Loisirs',
  'telekomunikasyon': 'Télécoms', 'teknoloji-yazilim': 'Technologie & Logiciels',
  'diger': 'Autres',
};

/** Italian category name mapping */
const CATEGORY_NAME_IT: Record<string, string> = {
  'alisveris': 'Shopping', 'elektronik': 'Elettronica', 'giyim-moda': 'Moda & Abbigliamento',
  'ev-yasam': 'Casa & Vita', 'gida-market': 'Alimentari & Supermercato',
  'yeme-icme': 'Ristorazione', 'kozmetik-kisisel-bakim': 'Bellezza & Cura',
  'spor-outdoor': 'Sport & Outdoor', 'seyahat-ulasim': 'Viaggi & Trasporti',
  'finans': 'Finanza', 'sigorta': 'Assicurazioni', 'otomobil': 'Automobile',
  'kitap-hobi': 'Libri & Hobby',
  'telekomunikasyon': 'Telecomunicazioni', 'teknoloji-yazilim': 'Tecnologia & Software',
  'diger': 'Altro',
};

/** Arabic category name mapping */
const CATEGORY_NAME_AR: Record<string, string> = {
  'alisveris': 'تسوق', 'elektronik': 'إلكترونيات', 'giyim-moda': 'أزياء وموضة',
  'ev-yasam': 'المنزل والحياة', 'gida-market': 'أغذية وسوبرماركت',
  'yeme-icme': 'مأكولات ومشروبات', 'kozmetik-kisisel-bakim': 'تجميل وعناية',
  'spor-outdoor': 'رياضة', 'seyahat-ulasim': 'سفر ومواصلات', 'finans': 'مالية',
  'sigorta': 'تأمين', 'otomobil': 'سيارات', 'kitap-hobi': 'كتب وهوايات',
  'telekomunikasyon': 'اتصالات', 'teknoloji-yazilim': 'تقنية وبرمجيات',
  'diger': 'أخرى',
};

/** Korean category name mapping */
const CATEGORY_NAME_KO: Record<string, string> = {
  'alisveris': '쇼핑', 'elektronik': '전자제품', 'giyim-moda': '패션',
  'ev-yasam': '홈·라이프', 'gida-market': '식품·마트',
  'yeme-icme': '맛집·음료', 'kozmetik-kisisel-bakim': '뷰티·케어',
  'spor-outdoor': '스포츠', 'seyahat-ulasim': '여행·교통', 'finans': '금융',
  'sigorta': '보험', 'otomobil': '자동차', 'kitap-hobi': '도서·취미',
  'telekomunikasyon': '통신', 'teknoloji-yazilim': '기술·소프트웨어',
  'diger': '기타',
};

/** Vietnamese category name mapping */
const CATEGORY_NAME_VI: Record<string, string> = {
  'alisveris': 'Mua sắm', 'elektronik': 'Điện tử', 'giyim-moda': 'Thời trang',
  'gida-market': 'Thực phẩm', 'yeme-icme': 'Ẩm thực', 'kozmetik-kisisel-bakim': 'Làm đẹp',
  'ev-yasam': 'Nhà cửa', 'spor-outdoor': 'Thể thao', 'seyahat-ulasim': 'Du lịch',
  'finans': 'Tài chính', 'sigorta': 'Bảo hiểm', 'otomobil': 'Ô tô', 'kitap-hobi': 'Sách & Sở thích',
  'telekomunikasyon': 'Viễn thông', 'teknoloji-yazilim': 'Công nghệ & Phần mềm',
};

/** Polish category name mapping */
const CATEGORY_NAME_PL: Record<string, string> = {
  'alisveris': 'Zakupy', 'elektronik': 'Elektronika', 'giyim-moda': 'Moda',
  'gida-market': 'Spożywcze', 'yeme-icme': 'Gastronomia', 'kozmetik-kisisel-bakim': 'Uroda',
  'ev-yasam': 'Dom', 'spor-outdoor': 'Sport', 'seyahat-ulasim': 'Podróże',
  'finans': 'Finanse', 'sigorta': 'Ubezpieczenia', 'otomobil': 'Motoryzacja', 'kitap-hobi': 'Książki & Hobby',
  'telekomunikasyon': 'Telekomunikacja', 'teknoloji-yazilim': 'Technologia & Oprogramowanie',
};

/** Malay category name mapping */
const CATEGORY_NAME_MS: Record<string, string> = {
  'alisveris': 'Beli-belah', 'elektronik': 'Elektronik', 'giyim-moda': 'Fesyen',
  'gida-market': 'Makanan', 'yeme-icme': 'Restoran', 'kozmetik-kisisel-bakim': 'Kecantikan',
  'ev-yasam': 'Rumah', 'spor-outdoor': 'Sukan', 'seyahat-ulasim': 'Pelancongan',
  'finans': 'Kewangan', 'sigorta': 'Insurans', 'otomobil': 'Automotif', 'kitap-hobi': 'Buku & Hobi',
  'telekomunikasyon': 'Telekomunikasi', 'teknoloji-yazilim': 'Teknologi & Perisian',
};

/** Dutch category name mapping */
const CATEGORY_NAME_NL: Record<string, string> = {
  'alisveris': 'Winkelen', 'elektronik': 'Elektronica', 'giyim-moda': 'Mode',
  'gida-market': 'Supermarkt', 'yeme-icme': 'Eten & Drinken', 'kozmetik-kisisel-bakim': 'Beauty',
  'ev-yasam': 'Huis & Tuin', 'spor-outdoor': 'Sport', 'seyahat-ulasim': 'Reizen',
  'finans': 'Financiën', 'sigorta': 'Verzekeringen', 'otomobil': 'Auto', 'kitap-hobi': 'Boeken & Hobby',
  'telekomunikasyon': 'Telecom', 'teknoloji-yazilim': 'Technologie & Software',
};

/** Urdu category name mapping */
const CATEGORY_NAME_UR: Record<string, string> = {
  'alisveris': 'خریداری', 'elektronik': 'الیکٹرانکس', 'giyim-moda': 'فیشن',
  'gida-market': 'گروسری', 'yeme-icme': 'کھانا', 'kozmetik-kisisel-bakim': 'خوبصورتی',
  'ev-yasam': 'گھر', 'spor-outdoor': 'کھیل', 'seyahat-ulasim': 'سفر',
  'finans': 'مالیات', 'sigorta': 'انشورنس', 'otomobil': 'گاڑیاں', 'kitap-hobi': 'کتابیں اور مشاغل',
  'telekomunikasyon': 'ٹیلی کام', 'teknoloji-yazilim': 'ٹیکنالوجی اور سافٹ ویئر',
};

/** Swedish category name mapping */
const CATEGORY_NAME_SV: Record<string, string> = {
  'alisveris': 'Shopping', 'elektronik': 'Elektronik', 'giyim-moda': 'Mode',
  'gida-market': 'Livsmedel', 'yeme-icme': 'Mat & Dryck', 'kozmetik-kisisel-bakim': 'Skönhet',
  'ev-yasam': 'Hem & Trädgård', 'spor-outdoor': 'Sport', 'seyahat-ulasim': 'Resor',
  'finans': 'Finans', 'sigorta': 'Försäkring', 'otomobil': 'Bil', 'kitap-hobi': 'Böcker & Hobby',
  'telekomunikasyon': 'Telekom', 'teknoloji-yazilim': 'Teknik & Mjukvara',
};

/** English category name mapping (slug → English name) — fallback when nameEn is null */
const CATEGORY_NAME_EN: Record<string, string> = {
  'alisveris': 'Shopping', 'elektronik': 'Electronics', 'giyim-moda': 'Fashion & Clothing',
  'ev-yasam': 'Home & Living', 'gida-market': 'Groceries & Supermarket',
  'yeme-icme': 'Food & Drink', 'kozmetik-kisisel-bakim': 'Beauty & Personal Care',
  'spor-outdoor': 'Sports & Outdoor', 'seyahat-ulasim': 'Travel & Transport',
  'finans': 'Finance', 'sigorta': 'Insurance', 'otomobil': 'Automotive',
  'kitap-hobi': 'Books & Hobbies', 'telekomunikasyon': 'Telecommunications',
  'teknoloji-yazilim': 'Technology & Software', 'diger': 'Others',
};

/** Return the localized category name for the given market */
export function getCategoryDisplayName(cat: Category, market: string): string {
  if (market === 'TR') return cat.name;
  if (market === 'DE') return cat.nameDe || CATEGORY_NAME_DE[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'BR') return CATEGORY_NAME_PT[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'ID') return CATEGORY_NAME_ID[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'RU') return CATEGORY_NAME_RU[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'MX' || market === 'ES' || market === 'AR' || market === 'CO') return CATEGORY_NAME_ES[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'JP') return CATEGORY_NAME_JA[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'TH') return CATEGORY_NAME_TH[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'FR') return CATEGORY_NAME_FR[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'IT') return CATEGORY_NAME_IT[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'EG' || market === 'SA' || market === 'AE') return CATEGORY_NAME_AR[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'KR') return CATEGORY_NAME_KO[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'VN') return CATEGORY_NAME_VI[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'PL') return CATEGORY_NAME_PL[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'MY') return CATEGORY_NAME_MS[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'NL') return CATEGORY_NAME_NL[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'PK') return CATEGORY_NAME_UR[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  if (market === 'SE') return CATEGORY_NAME_SV[cat.slug] || cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
  return cat.nameEn || CATEGORY_NAME_EN[cat.slug] || cat.name;
}

/**
 * Sort categories for display:
 * - TR: keep DB sortOrder
 * - US/UK/DE: alphabetical by English name, "Others" (diger) last
 */
export function sortCategories(categories: Category[], market: string): Category[] {
  if (market === 'TR') return categories;
  return [...categories].sort((a, b) => {
    if (a.slug === 'diger') return 1;
    if (b.slug === 'diger') return -1;
    const nameA = getCategoryDisplayName(a, market).toLowerCase();
    const nameB = getCategoryDisplayName(b, market).toLowerCase();
    const locale = market === 'DE' ? 'de' : (market === 'EG' || market === 'SA' || market === 'AE') ? 'ar' : market === 'KR' ? 'ko' : market === 'VN' ? 'vi' : market === 'PL' ? 'pl' : market === 'MY' ? 'ms' : market === 'NL' ? 'nl' : market === 'PK' ? 'ur' : market === 'SE' ? 'sv' : 'en';
    return nameA.localeCompare(nameB, locale);
  });
}

export async function fetchBrands(): Promise<{ data: Brand[] }> {
  const market = useMarketStore.getState().market;
  const { data } = await api.get<{ data: Brand[] }>('/brands', { params: { market } });
  return data;
}

export async function fetchCategories(): Promise<{ data: Category[] }> {
  const { data } = await api.get<{ data: Category[] }>('/categories');
  return data;
}
