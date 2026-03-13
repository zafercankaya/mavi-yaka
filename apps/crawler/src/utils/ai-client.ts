/**
 * AI client for campaign classification + enrichment.
 * Primary: Gemini 2.5 Flash — free tier: ~30 RPM (2s gap)
 * Fallback: Groq (Llama 3.3 70B) — free tier: 30 RPM, 14,400 RPD
 * No external dependencies — uses native fetch().
 */

// --- Groq config ---
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// --- Cerebras config ---
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const CEREBRAS_MODEL = 'gpt-oss-120b';

// --- Gemini config ---
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

// Rate limiter: Groq free tier — 4s gap = ~15 RPM for safety
const GROQ_MIN_GAP_MS = 4000;
let groqLastRequestTime = 0;

// Rate limiter: Cerebras free tier — 2s gap = ~30 RPM
const CEREBRAS_MIN_GAP_MS = 2000;
let cerebrasLastRequestTime = 0;

// Rate limiter: Gemini free tier — 2s gap = ~30 RPM (now primary provider)
const GEMINI_MIN_GAP_MS = 2000;
let geminiLastRequestTime = 0;

// Circuit breaker: 429 aldıktan sonra provider'ı geçici devre dışı bırak
// Bu sayede her kampanya için boşuna 30s+30s bekleme yaşanmaz
const CIRCUIT_BREAKER_MS = 60_000; // 429 sonrası 60 saniye devre dışı
let geminiExhaustedUntil = 0;
let cerebrasExhaustedUntil = 0;
let groqExhaustedUntil = 0;

export interface AICampaignResult {
  isCampaign: boolean;
  confidence: number;
  reason: string;
  endDate?: string | null;
  startDate?: string | null;
  discountRate?: number | null;
  promoCode?: string | null;
}

const FALLBACK_RESULT: AICampaignResult = {
  isCampaign: true,
  confidence: 0.5,
  reason: 'AI unavailable, falling back to static score',
};

type AIMarket = 'TR' | 'US' | 'DE' | 'UK' | 'IN' | 'BR' | 'ID' | 'RU' | 'MX' | 'JP' | 'PH' | 'TH' | 'CA' | 'AU' | 'FR' | 'IT' | 'ES' | 'EG' | 'SA' | 'KR' | 'AR' | 'AE' | 'VN' | 'PL' | 'MY' | 'CO' | 'ZA' | 'PT' | 'NL' | 'PK' | 'SE';

function buildPrompt(
  title: string,
  description: string | null,
  sourceUrl: string,
  brandName: string,
  market: AIMarket = 'TR',
): string {
  if (market === 'US' || market === 'UK' || market === 'ZA') {
    return `You are a campaign/deal analysis system. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% cotton" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FREECARGO"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie consent pages, privacy policies
- Category listing pages ("Men's Clothing", "Deals" alone)
- Service appointments, warranty, recalls
- Brand introduction pages ("Meet our...", "Discover...")
- General homepages, about us, contact pages

IS A DEAL:
- Discounts, sales, promotions, special offers
- Credit card rewards, cashback, BOGO
- Free shipping, gifts, coupons, promo codes
- Seasonal sales, clearance, Black Friday, Cyber Monday
- Flash sales, limited-time offers
- Telecom deals (phone plans, data packages, broadband bundles, switch & save)
- Tech/software deals (free trials, subscription discounts, license offers)

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'DE') {
    return `You are a campaign/deal analysis system for the German market. Content may be in German or English. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal (Angebot/Aktion/Rabatt)
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% Baumwolle" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FREECARGO"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie/Datenschutz pages, Impressum, AGB
- Category listing pages ("Alle Angebote", "Herrenbekleidung" alone)
- Service pages, Garantie, Rückrufaktion
- Brand introduction pages ("Über uns", "Entdecken Sie...")
- General homepages, Kontakt, Hilfe

IS A DEAL (keywords: angebot, aktion, rabatt, sale, reduziert, jetzt sparen, gutschein, gratis versand, zeitlich begrenzt):
- Angebote, Rabatte, Sonderangebote, Aktionen
- Gutscheine, Coupons, Promo-Codes
- Kostenloser/gratis Versand, Geschenke
- Schlussverkauf, Ausverkauf, Black Friday, Cyber Monday
- Zeitlich begrenzte Angebote, Flash Sales
- Discounts, sales, promotions, special offers (English on German sites)
- Telekom-Angebote (Tarife, Mobilfunkpakete, Internetpakete, Glasfaser)
- Tech/Software-Angebote (Testversionen, Abonnements, Lizenzen)

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'IN') {
    return `You are a campaign/deal analysis system for the Indian market. Content may be in English or Hindi. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal/offer
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% cotton" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FREECARGO"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie consent pages, privacy policies
- Category listing pages ("Men's Clothing", "All Products" alone)
- Service appointments, warranty, recalls
- Brand introduction pages ("About Us", "Discover...")
- General homepages, contact pages, grievance pages

IS A DEAL (keywords: offer, deal, sale, discount, cashback, coupon, EMI, exchange offer, festive sale, flat off, extra off):
- Discounts, sales, promotions, special offers
- Bank offers, no-cost EMI, exchange offers
- Cashback, SuperCoins, reward points
- Free delivery, gifts, coupons, promo codes
- Festive sales (Diwali, Navratri, Republic Day, Independence Day)
- Flash sales, limited-time offers, Big Billion Days, Great Indian Sale
- Combo offers, BOGO (Buy One Get One)

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'BR' || market === 'PT') {
    return `You are a campaign/deal analysis system for the Brazilian market. Content may be in Portuguese or English. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal (promoção/oferta/desconto)
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% algodão" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FRETE2024"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie/privacidade pages, termos de uso
- Category listing pages ("Todos os Produtos", "Ofertas" alone)
- Service pages, garantia, recall
- Brand introduction pages ("Sobre Nós", "Quem Somos")
- General homepages, contato, ajuda, ouvidoria

IS A DEAL (keywords: oferta, promoção, desconto, liquidação, cupom, frete grátis, cashback, queima de estoque, sem juros, parcele):
- Ofertas, descontos, promoções, liquidação
- Cupons, vouchers, códigos promocionais
- Frete grátis/gratuito, brindes
- Parcelamento sem juros, desconto no PIX, à vista
- Black Friday, Dia do Consumidor, Dia das Mães, Natal
- Queima de estoque, outlet, mega oferta
- Flash sales, ofertas relâmpago

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'ID') {
    return `Anda adalah sistem analisis kampanye/promo untuk pasar Indonesia. Konten mungkin dalam Bahasa Indonesia atau Inggris. Analisis konten berikut.

Brand: ${brandName}
Judul: ${title}
Deskripsi: ${description || '(tidak ada)'}
URL: ${sourceUrl}

TUGAS:
1. Tentukan apakah ini adalah promosi/diskon/penawaran nyata
2. Ekstrak tanggal berakhir jika disebutkan (ISO 8601: YYYY-MM-DD)
3. Ekstrak tanggal mulai jika disebutkan (ISO 8601: YYYY-MM-DD)
4. Ekstrak persentase diskon jika disebutkan (angka saja, 1-95). Catatan: "100% katun" BUKAN diskon

BUKAN PROMO:
- Halaman cookie/privasi, syarat dan ketentuan
- Halaman daftar kategori ("Semua Produk", "Promo" saja)
- Halaman layanan, garansi, recall
- Halaman perkenalan merek ("Tentang Kami", "Kenali...")
- Halaman utama, kontak, bantuan

ADALAH PROMO (kata kunci: diskon, promo, sale, flash sale, gratis ongkir, cashback, voucher, kupon, potongan harga, cicilan 0%, beli 1 gratis 1):
- Diskon, promo, penawaran spesial, flash sale
- Gratis ongkir, cashback, voucher, kupon
- Cicilan 0%, potongan harga, bundling
- Harbolnas (12.12), Ramadan Sale, Lebaran Sale, Imlek Sale
- Mega Sale, Super Sale, Brand Day
- Big Sale, Year End Sale, Mid Year Sale

Balas HANYA dengan JSON, tidak ada yang lain:
{"isCampaign":true,"confidence":0.95,"reason":"penjelasan singkat","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'RU') {
    return `Вы — система анализа акций и скидок для российского рынка. Контент может быть на русском или английском языке. Проанализируйте следующий контент.

Бренд: ${brandName}
Заголовок: ${title}
Описание: ${description || '(нет)'}
URL: ${sourceUrl}

ЗАДАЧИ:
1. Определите, является ли это реальной акцией/скидкой/предложением
2. Извлеките дату окончания, если указана (ISO 8601: YYYY-MM-DD)
3. Извлеките дату начала, если указана (ISO 8601: YYYY-MM-DD)
4. Извлеките процент скидки, если указан (только число, 1-95). Примечание: "100% хлопок" — это НЕ скидка

НЕ ЯВЛЯЕТСЯ АКЦИЕЙ:
- Страницы cookie/политики конфиденциальности, пользовательское соглашение
- Страницы категорий ("Все товары", "Акции" отдельно)
- Страницы сервиса, гарантии, отзыва товаров
- Страницы о бренде ("О нас", "О компании")
- Главные страницы, контакты, помощь

ЯВЛЯЕТСЯ АКЦИЕЙ (ключевые слова: акция, скидка, распродажа, промокод, купон, кэшбэк, бесплатная доставка, специальное предложение, выгода, рассрочка):
- Акции, скидки, распродажи, специальные предложения
- Промокоды, купоны, бонусные баллы
- Бесплатная доставка, подарки
- Рассрочка, кредит 0%, выгодная цена
- Новогодняя распродажа, 8 Марта, Чёрная пятница, Киберпонедельник
- Сезонные распродажи, ликвидация, финальная распродажа
- Телеком-акции (тарифы, мобильный интернет, подключение, оптоволокно)
- Техно/софт-акции (бесплатный пробный период, подписки, лицензии)

Ответьте ТОЛЬКО JSON, ничего больше:
{"isCampaign":true,"confidence":0.95,"reason":"краткое пояснение","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'MX' || market === 'CO') {
    return `Eres un sistema de análisis de promociones/ofertas para el mercado mexicano. El contenido puede estar en español o inglés. Analiza el siguiente contenido.

Marca: ${brandName}
Título: ${title}
Descripción: ${description || '(ninguna)'}
URL: ${sourceUrl}

TAREAS:
1. Determina si es una promoción/descuento/oferta real
2. Extrae la fecha de fin si se menciona (ISO 8601: YYYY-MM-DD)
3. Extrae la fecha de inicio si se menciona (ISO 8601: YYYY-MM-DD)
4. Extrae el porcentaje de descuento si se menciona (solo número, 1-95). Nota: "100% algodón" NO es un descuento

NO ES OFERTA:
- Páginas de cookies/privacidad, aviso legal, términos y condiciones
- Páginas de listado de categorías ("Todos los Productos", "Ofertas" solo)
- Páginas de servicio, garantía, recall
- Páginas de presentación de marca ("Sobre Nosotros", "Conócenos")
- Páginas principales, contacto, ayuda

ES OFERTA (palabras clave: oferta, promoción, descuento, liquidación, cupón, envío gratis, cashback, meses sin intereses, 2x1, precio especial):
- Ofertas, descuentos, promociones, liquidaciones
- Cupones, códigos de descuento, vales
- Envío gratis, regalos, muestras gratis
- Meses sin intereses (MSI), descuento con tarjeta, precio especial
- El Buen Fin, Hot Sale, Hot Days, Navidad, Día de las Madres
- Rebajas de temporada, outlet, venta nocturna
- Flash sales, ofertas relámpago, 2x1, 3x2
- Ofertas de telecomunicaciones (planes de celular, paquetes de datos, fibra óptica)
- Ofertas de tecnología/software (pruebas gratuitas, suscripciones, licencias)

Responde SOLO con JSON, nada más:
{"isCampaign":true,"confidence":0.95,"reason":"explicación breve","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'JP') {
    return `あなたは日本市場向けのキャンペーン・セール分析システムです。コンテンツは日本語または英語の場合があります。以下のコンテンツを分析してください。

ブランド: ${brandName}
タイトル: ${title}
説明: ${description || '(なし)'}
URL: ${sourceUrl}

タスク:
1. これが本当のプロモーション/割引/セールかどうか判定する
2. 終了日が記載されていれば抽出する（ISO 8601: YYYY-MM-DD）
3. 開始日が記載されていれば抽出する（ISO 8601: YYYY-MM-DD）
4. 割引率が記載されていれば抽出する（数値のみ、1-95）。注意：「綿100%」は割引ではありません

キャンペーンではない:
- Cookie同意ページ、プライバシーポリシー、利用規約
- カテゴリ一覧ページ（「メンズ」「全商品」単独）
- サービスページ、保証、リコール
- ブランド紹介ページ（「会社概要」「ブランドについて」）
- トップページ、お問い合わせ、ヘルプ

キャンペーンである（キーワード: セール, キャンペーン, 割引, クーポン, 送料無料, ポイント還元, タイムセール, 期間限定, お得, 値下げ, 半額, OFF）:
- セール、キャンペーン、割引、特別価格
- クーポン、ポイント還元、ポイントアップ
- 送料無料、プレゼント、ノベルティ
- 分割払い手数料無料、会員限定セール
- 初売り、福袋、ゴールデンウィークセール、ブラックフライデー、サイバーマンデー
- 季節セール（春夏秋冬）、クリアランスセール、アウトレット
- タイムセール、フラッシュセール、在庫一掃

JSONのみで回答してください。それ以外は書かないでください:
{"isCampaign":true,"confidence":0.95,"reason":"短い説明","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'PH') {
    return `You are a campaign/deal analysis system for the Philippine market. Content may be in English or Filipino. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% cotton" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FREECARGO"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie consent pages, privacy policies
- Category listing pages ("All Products", "Deals" alone)
- Service appointments, warranty, recalls
- Brand introduction pages ("About Us", "Discover...")
- General homepages, contact pages, help pages

IS A DEAL (keywords: sale, discount, promo, voucher, free shipping, cashback, GCash, PayMaya, coupon, buy 1 get 1, mega sale, flash sale, bundle deal):
- Discounts, sales, promotions, special offers
- Vouchers, coupons, promo codes
- Free shipping, gifts, freebies
- GCash/PayMaya cashback, bank promos, installment 0%
- Payday Sale, double-digit sales (9.9, 10.10, 11.11, 12.12)
- Pasko Sale, Mid-Year Sale, Year-End Sale
- Flash sales, limited-time offers, bundle deals
- Shopee/Lazada mega campaigns, Brand Day

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'TH') {
    return `คุณเป็นระบบวิเคราะห์แคมเปญ/โปรโมชั่นสำหรับตลาดประเทศไทย เนื้อหาอาจเป็นภาษาไทยหรือภาษาอังกฤษ วิเคราะห์เนื้อหาต่อไปนี้

แบรนด์: ${brandName}
หัวข้อ: ${title}
รายละเอียด: ${description || '(ไม่มี)'}
URL: ${sourceUrl}

งาน:
1. พิจารณาว่าเป็นโปรโมชั่น/ส่วนลด/ดีลจริงหรือไม่
2. สกัดวันที่สิ้นสุดถ้ามีระบุ (ISO 8601: YYYY-MM-DD)
3. สกัดวันที่เริ่มต้นถ้ามีระบุ (ISO 8601: YYYY-MM-DD)
4. สกัดเปอร์เซ็นต์ส่วนลดถ้ามีระบุ (ตัวเลขเท่านั้น, 1-95) หมายเหตุ: "ผ้าฝ้าย 100%" ไม่ใช่ส่วนลด

ไม่ใช่โปรโมชั่น:
- หน้าคุกกี้/นโยบายความเป็นส่วนตัว, ข้อกำหนดการใช้งาน
- หน้ารายการหมวดหมู่ ("สินค้าทั้งหมด", "โปรโมชั่น" เดี่ยว)
- หน้าบริการ, การรับประกัน, เรียกคืนสินค้า
- หน้าแนะนำแบรนด์ ("เกี่ยวกับเรา", "รู้จักเรา")
- หน้าแรก, ติดต่อเรา, ช่วยเหลือ

เป็นโปรโมชั่น (คำสำคัญ: ลดราคา, โปรโมชั่น, ส่วนลด, ส่งฟรี, แคชแบ็ก, คูปอง, โค้ดส่วนลด, ซื้อ 1 แถม 1, Flash Sale, ผ่อน 0%):
- ลดราคา, โปรโมชั่น, ส่วนลด, ราคาพิเศษ
- คูปอง, โค้ดส่วนลด, บัตรกำนัล
- ส่งฟรี, ของแถม, ของสมนาคุณ
- ผ่อน 0%, แคชแบ็ก, โปรบัตรเครดิต
- สงกรานต์เซลล์, ลอยกระทงเซลล์, ปีใหม่เซลล์
- 9.9, 10.10, 11.11, 12.12 เซลล์, Flash Sale
- Mid Year Sale, Year End Sale, Mega Sale

ตอบเฉพาะ JSON เท่านั้น ไม่ต้องเขียนอย่างอื่น:
{"isCampaign":true,"confidence":0.95,"reason":"คำอธิบายสั้นๆ","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'CA') {
    return `You are a campaign/deal analysis system for the Canadian market. Content may be in English or French. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% cotton" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FREECARGO"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie consent pages, privacy policies
- Category listing pages ("Men's Clothing", "Deals" alone)
- Service appointments, warranty, recalls
- Brand introduction pages ("Meet our...", "Discover...", "Découvrez...")
- General homepages, about us, contact pages

IS A DEAL (keywords: sale, discount, deal, promo, coupon, free shipping, cashback, BOGO, clearance, rabais, offre, promotion, solde, livraison gratuite):
- Discounts, sales, promotions, special offers
- Credit card rewards, cashback, BOGO
- Free shipping, gifts, coupons, promo codes
- Boxing Day Sale, Canada Day Sale, Victoria Day Sale, Thanksgiving Sale
- Black Friday, Cyber Monday, Back to School
- Flash sales, limited-time offers, clearance
- French deal keywords: rabais, offre, promotion, solde, réduction, aubaine

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'AU') {
    return `You are a campaign/deal analysis system for the Australian market. Content may be in English. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% cotton" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FREECARGO"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie consent pages, privacy policies
- Category listing pages ("Men's Clothing", "Deals" alone)
- Service appointments, warranty, recalls
- Brand introduction pages ("Meet our...", "Discover...")
- General homepages, about us, contact pages

IS A DEAL (keywords: sale, discount, deal, promo, coupon, free shipping, cashback, Afterpay, Zip Pay, BOGO, clearance, stocktake):
- Discounts, sales, promotions, special offers
- Credit card rewards, cashback, BOGO
- Free shipping, gifts, coupons, promo codes
- Afterpay Day, Click Frenzy, EOFY Sale (End of Financial Year)
- Boxing Day Sale, Australia Day Sale, Mid-Season Sale
- Black Friday, Cyber Monday, Stocktake Sale
- Flash sales, limited-time offers, clearance

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'FR') {
    return `Vous êtes un système d'analyse de campagnes/promotions pour le marché français. Le contenu peut être en français ou en anglais. Analysez le contenu suivant.

Marque: ${brandName}
Titre: ${title}
Description: ${description || '(aucune)'}
URL: ${sourceUrl}

TÂCHES:
1. Déterminez s'il s'agit d'une vraie promotion/réduction/offre
2. Extraire la date de fin si mentionnée (ISO 8601: YYYY-MM-DD)
3. Extraire la date de début si mentionnée (ISO 8601: YYYY-MM-DD)
4. Extraire le taux de réduction si mentionné (nombre uniquement, 1-95). Note: "100% coton" n'est PAS une réduction

PAS UNE OFFRE:
- Pages de cookies/confidentialité, mentions légales, CGV
- Pages de liste de catégories ("Tous les Produits", "Promotions" seul)
- Pages de service, garantie, rappel de produit
- Pages de présentation de marque ("À propos", "Découvrez...")
- Pages d'accueil, contact, aide

EST UNE OFFRE (mots-clés: soldes, promotion, réduction, rabais, offre, remise, bon plan, code promo, livraison gratuite, vente flash, déstockage):
- Soldes, promotions, réductions, offres spéciales
- Codes promo, bons de réduction, coupons
- Livraison gratuite, cadeaux, échantillons
- Facilités de paiement, cashback, remise fidélité
- Soldes d'hiver, Soldes d'été, French Days, Black Friday, Noël
- Ventes privées, déstockage, liquidation
- Ventes flash, offres limitées, bon plan
- Offres télécoms (forfaits mobiles, box internet, fibre optique)
- Offres tech/logiciels (essais gratuits, abonnements, licences)

Répondez UNIQUEMENT en JSON, rien d'autre:
{"isCampaign":true,"confidence":0.95,"reason":"explication courte","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'IT') {
    return `Sei un sistema di analisi di campagne/promozioni per il mercato italiano. Il contenuto può essere in italiano o inglese. Analizza il seguente contenuto.

Brand: ${brandName}
Titolo: ${title}
Descrizione: ${description || '(nessuna)'}
URL: ${sourceUrl}

COMPITI:
1. Determina se si tratta di una vera promozione/sconto/offerta
2. Estrai la data di fine se menzionata (ISO 8601: YYYY-MM-DD)
3. Estrai la data di inizio se menzionata (ISO 8601: YYYY-MM-DD)
4. Estrai la percentuale di sconto se menzionata (solo numero, 1-95). Nota: "100% cotone" NON è uno sconto

NON È UN'OFFERTA:
- Pagine cookie/privacy, informativa, termini e condizioni
- Pagine di elenco categorie ("Tutti i Prodotti", "Offerte" da solo)
- Pagine di servizio, garanzia, richiamo prodotto
- Pagine di presentazione del brand ("Chi Siamo", "Scopri...")
- Homepage, contatti, assistenza

È UN'OFFERTA (parole chiave: offerta, promozione, sconto, saldi, svendita, coupon, codice sconto, spedizione gratuita, cashback, sottocosto):
- Offerte, promozioni, sconti, saldi
- Coupon, codici sconto, buoni sconto
- Spedizione gratuita, omaggi, regali
- Pagamento rateale, cashback, punti fedeltà
- Saldi invernali, Saldi estivi, Black Friday, Natale
- Svendite, sottocosto, outlet, liquidazione
- Flash sale, offerte lampo, offerte a tempo limitato
- Offerte telecomunicazioni (piani tariffari, fibra ottica, offerte mobile)
- Offerte tecnologia/software (prove gratuite, abbonamenti, licenze)

Rispondi SOLO con JSON, nient'altro:
{"isCampaign":true,"confidence":0.95,"reason":"breve spiegazione","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'ES') {
    return `Eres un sistema de análisis de promociones para el mercado español. El contenido puede estar en español o inglés. Analiza el siguiente contenido.

Marca: ${brandName}
Título: ${title}
Descripción: ${description || '(sin descripción)'}
URL: ${sourceUrl}

Tareas:
1. Determina si es una promoción/oferta/descuento real
2. Extrae la fecha de fin si se menciona (ISO 8601: YYYY-MM-DD)
3. Extrae la fecha de inicio si se menciona (ISO 8601: YYYY-MM-DD)
4. Extrae el porcentaje de descuento si se menciona (solo número, 1-95)

NO ES OFERTA:
- Páginas de cookies, políticas de privacidad
- Páginas de categorías ("todos los productos" sola)
- Páginas de servicio, garantía, retirada de productos
- Páginas de inicio, contacto, ayuda

ES OFERTA (palabras clave: oferta, promoción, descuento, rebajas, liquidación, cupón, envío gratis, cashback, día sin iva, rebajas de verano/invierno):
- Descuentos específicos ("20% de descuento", "2x1")
- Ofertas por tiempo limitado
- Códigos de descuento o cupones

Responde SOLO con JSON:
{"isCampaign":true,"confidence":0.95,"reason":"breve explicación","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'AR') {
    return `Eres un sistema de análisis de promociones para el mercado argentino. El contenido puede estar en español o inglés. Analiza el siguiente contenido.

Marca: ${brandName}
Título: ${title}
Descripción: ${description || '(sin descripción)'}
URL: ${sourceUrl}

Tareas:
1. Determina si es una promoción/oferta/descuento real
2. Extrae la fecha de fin si se menciona (ISO 8601: YYYY-MM-DD)
3. Extrae la fecha de inicio si se menciona (ISO 8601: YYYY-MM-DD)
4. Extrae el porcentaje de descuento si se menciona (solo número, 1-95)

NO ES OFERTA:
- Páginas de cookies, políticas de privacidad
- Páginas de categorías
- Páginas de servicio, garantía
- Páginas de inicio, contacto, ayuda

ES OFERTA (palabras clave: oferta, promoción, descuento, cuotas sin interés, Hot Sale, CyberMonday, envío gratis, cashback, 2x1, Día de la Madre):
- Descuentos específicos
- Ofertas por tiempo limitado
- Cuotas sin interés
- Códigos de descuento

Responde SOLO con JSON:
{"isCampaign":true,"confidence":0.95,"reason":"breve explicación","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'EG' || market === 'AE') {
    return `أنت نظام تحليل العروض والخصومات للسوق المصري. قد يكون المحتوى باللغة العربية أو الإنجليزية. حلل المحتوى التالي.

العلامة التجارية: ${brandName}
العنوان: ${title}
الوصف: ${description || '(لا يوجد)'}
الرابط: ${sourceUrl}

المهام:
1. حدد ما إذا كان هذا عرضاً/خصماً/تخفيضاً حقيقياً
2. استخرج تاريخ الانتهاء إذا ذُكر (ISO 8601: YYYY-MM-DD)
3. استخرج تاريخ البدء إذا ذُكر (ISO 8601: YYYY-MM-DD)
4. استخرج نسبة الخصم إذا ذُكرت (رقم فقط، 1-95)

ليس عرضاً:
- صفحات ملفات تعريف الارتباط، سياسات الخصوصية
- صفحات قوائم الفئات
- صفحات الخدمة، الضمان
- الصفحات الرئيسية، اتصل بنا، المساعدة

هو عرض (كلمات مفتاحية: عروض، تخفيضات، خصم، كوبون، أوكازيون، شحن مجاني، كاش باك، رمضان، عيد، جمعة البيضاء):
- خصومات محددة ("خصم 20%"، "اشتر 2 واحصل على 1 مجاناً")
- عروض لفترة محدودة
- أكواد خصم أو كوبونات

أجب بـ JSON فقط:
{"isCampaign":true,"confidence":0.95,"reason":"شرح موجز","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'SA') {
    return `أنت نظام تحليل العروض والخصومات للسوق السعودي. قد يكون المحتوى باللغة العربية أو الإنجليزية. حلل المحتوى التالي.

العلامة التجارية: ${brandName}
العنوان: ${title}
الوصف: ${description || '(لا يوجد)'}
الرابط: ${sourceUrl}

المهام:
1. حدد ما إذا كان هذا عرضاً/خصماً/تخفيضاً حقيقياً
2. استخرج تاريخ الانتهاء إذا ذُكر (ISO 8601: YYYY-MM-DD)
3. استخرج تاريخ البدء إذا ذُكر (ISO 8601: YYYY-MM-DD)
4. استخرج نسبة الخصم إذا ذُكرت (رقم فقط، 1-95)

ليس عرضاً:
- صفحات ملفات تعريف الارتباط، سياسات الخصوصية
- صفحات قوائم الفئات
- صفحات الخدمة، الضمان
- الصفحات الرئيسية، اتصل بنا، المساعدة

هو عرض (كلمات مفتاحية: عروض، تخفيضات، خصم، كوبون، وايت فرايداي، اليوم الوطني، موسم الرياض، رمضان، عيد، شحن مجاني):
- خصومات محددة
- عروض لفترة محدودة
- أكواد خصم أو كوبونات

أجب بـ JSON فقط:
{"isCampaign":true,"confidence":0.95,"reason":"شرح موجز","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'KR') {
    return `당신은 한국 시장을 위한 프로모션/세일 분석 시스템입니다. 콘텐츠는 한국어 또는 영어일 수 있습니다. 다음 콘텐츠를 분석하세요.

브랜드: ${brandName}
제목: ${title}
설명: ${description || '(없음)'}
URL: ${sourceUrl}

작업:
1. 이것이 실제 프로모션/할인/세일인지 판단하세요
2. 종료 날짜가 언급된 경우 추출하세요 (ISO 8601: YYYY-MM-DD)
3. 시작 날짜가 언급된 경우 추출하세요 (ISO 8601: YYYY-MM-DD)
4. 할인율이 언급된 경우 추출하세요 (숫자만, 1-95)

세일이 아닌 경우:
- 쿠키 동의 페이지, 개인정보처리방침
- 카테고리 목록 페이지
- 서비스 페이지, 보증, 리콜
- 홈페이지, 회사소개, 고객센터

세일인 경우 (키워드: 세일, 할인, 특가, 쿠폰, 무료배송, 포인트, 타임세일, 1+1, 블랙 프라이데이, 추석 세일, 설날 세일):
- 구체적 할인 ("20% 할인", "1+1")
- 기간 한정 이벤트
- 할인 코드, 쿠폰

JSON만 응답하세요:
{"isCampaign":true,"confidence":0.95,"reason":"짧은 설명","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'VN') {
    return `Bạn là hệ thống phân tích khuyến mãi/ưu đãi cho thị trường Việt Nam. Nội dung có thể bằng tiếng Việt hoặc tiếng Anh. Phân tích nội dung sau.

Thương hiệu: ${brandName}
Tiêu đề: ${title}
Mô tả: ${description || '(không có)'}
URL: ${sourceUrl}

NHIỆM VỤ:
1. Xác định đây có phải là khuyến mãi/giảm giá/ưu đãi thực sự không
2. Trích xuất ngày kết thúc nếu được đề cập (ISO 8601: YYYY-MM-DD)
3. Trích xuất ngày bắt đầu nếu được đề cập (ISO 8601: YYYY-MM-DD)
4. Trích xuất tỷ lệ giảm giá nếu được đề cập (chỉ số, 1-95). Lưu ý: "100% cotton" KHÔNG phải giảm giá

KHÔNG PHẢI KHUYẾN MÃI:
- Trang cookie/chính sách bảo mật, điều khoản sử dụng
- Trang danh mục ("Tất cả sản phẩm", "Khuyến mãi" đơn lẻ)
- Trang dịch vụ, bảo hành, thu hồi sản phẩm
- Trang giới thiệu thương hiệu ("Về chúng tôi", "Giới thiệu")
- Trang chủ, liên hệ, trợ giúp

LÀ KHUYẾN MÃI (từ khóa: giảm giá, khuyến mãi, ưu đãi, sale, flash sale, miễn phí vận chuyển, mã giảm giá, voucher, combo, mua 1 tặng 1, hoàn tiền):
- Giảm giá, khuyến mãi, ưu đãi đặc biệt
- Mã giảm giá, voucher, coupon
- Miễn phí vận chuyển, quà tặng kèm
- Trả góp 0%, hoàn tiền, ưu đãi thẻ ngân hàng
- Sale 11.11, 12.12, Black Friday, Tết Sale
- Flash sale, Mega Sale, Brand Day, Mid-Year Sale
- Shopee/Lazada/Tiki mega campaigns

Trả lời CHỈ bằng JSON, không viết gì khác:
{"isCampaign":true,"confidence":0.95,"reason":"giải thích ngắn","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'PL') {
    return `Jesteś systemem analizy promocji i ofert dla polskiego rynku. Treść może być po polsku lub angielsku. Przeanalizuj poniższą treść.

Marka: ${brandName}
Tytuł: ${title}
Opis: ${description || '(brak)'}
URL: ${sourceUrl}

ZADANIA:
1. Określ, czy to jest prawdziwa promocja/zniżka/oferta
2. Wyodrębnij datę zakończenia, jeśli podana (ISO 8601: YYYY-MM-DD)
3. Wyodrębnij datę rozpoczęcia, jeśli podana (ISO 8601: YYYY-MM-DD)
4. Wyodrębnij procent zniżki, jeśli podany (tylko liczba, 1-95). Uwaga: "100% bawełna" to NIE zniżka

TO NIE JEST OFERTA:
- Strony cookies/polityki prywatności, regulamin
- Strony kategorii ("Wszystkie produkty", "Promocje" samodzielnie)
- Strony serwisowe, gwarancja, wycofanie produktu
- Strony o marce ("O nas", "Poznaj markę")
- Strona główna, kontakt, pomoc

TO JEST OFERTA (słowa kluczowe: promocja, wyprzedaż, rabat, zniżka, kupon, darmowa dostawa, cashback, okazja, kod rabatowy, 2 za 1, outlet):
- Promocje, wyprzedaże, rabaty, zniżki
- Kupony, kody rabatowe, vouchery
- Darmowa dostawa, prezenty, próbki gratis
- Raty 0%, cashback, oferty bankowe
- Black Friday, Cyber Monday, Dzień Kobiet, Mikołajki
- Wyprzedaże sezonowe (letnia, zimowa), outlet, likwidacja
- Flash sale, oferty limitowane, okazje dnia

Odpowiedz TYLKO w JSON, nic więcej:
{"isCampaign":true,"confidence":0.95,"reason":"krótkie wyjaśnienie","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'MY') {
    return `You are a campaign/deal analysis system for the Malaysian market. Content may be in Malay or English. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% cotton" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FREESHIP"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie consent pages, privacy policies
- Category listing pages ("Semua Produk", "All Products" alone)
- Service appointments, warranty, recalls
- Brand introduction pages ("Tentang Kami", "About Us")
- General homepages, contact pages, help pages

IS A DEAL (keywords: diskaun, promosi, jualan, tawaran, penghantaran percuma, baucar, kupon, cashback, potongan harga, beli 1 percuma 1, sale, voucher, free shipping):
- Diskaun, promosi, jualan, tawaran istimewa
- Baucar, kupon, kod promo
- Penghantaran percuma, hadiah percuma
- Ansuran 0%, cashback, tawaran kad bank
- Hari Raya Sale, Merdeka Sale, Malaysia Day Sale
- 9.9, 10.10, 11.11, 12.12 Sale, Year End Sale
- Flash sale, Mega Sale, Shopee/Lazada campaigns

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'NL') {
    return `Je bent een systeem voor het analyseren van campagnes/aanbiedingen voor de Nederlandse markt. De inhoud kan in het Nederlands of Engels zijn. Analyseer de volgende inhoud.

Merk: ${brandName}
Titel: ${title}
Beschrijving: ${description || '(geen)'}
URL: ${sourceUrl}

TAKEN:
1. Bepaal of dit een echte promotie/korting/aanbieding is
2. Extraheer de einddatum indien vermeld (ISO 8601: YYYY-MM-DD)
3. Extraheer de startdatum indien vermeld (ISO 8601: YYYY-MM-DD)
4. Extraheer het kortingspercentage indien vermeld (alleen getal, 1-95). Let op: "100% katoen" is GEEN korting

GEEN AANBIEDING:
- Cookie/privacypagina's, algemene voorwaarden
- Categoriepagina's ("Alle Producten", "Aanbiedingen" alleen)
- Servicepagina's, garantie, terugroepactie
- Merkintroductiepagina's ("Over Ons", "Ontdek...")
- Homepage, contact, hulp

IS EEN AANBIEDING (trefwoorden: aanbieding, korting, actie, sale, uitverkoop, kortingscode, gratis verzending, cashback, 1+1 gratis, opruiming):
- Aanbiedingen, kortingen, acties, uitverkoop
- Kortingscodes, vouchers, coupons
- Gratis verzending, cadeaus, samples
- Betaal achteraf, cashback, spaarpunten
- Black Friday, Sinterklaas, Koningsdag, Kerstmis
- Seizoensopruiming, outlet, mega deals
- Flash sale, dagaanbieding, weekaanbieding

Antwoord ALLEEN met JSON, niets anders:
{"isCampaign":true,"confidence":0.95,"reason":"korte uitleg","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  if (market === 'PK') {
    return `You are a campaign/deal analysis system for the Pakistani market. Content may be in English or Urdu. Analyze the following content.

Brand: ${brandName}
Title: ${title}
Description: ${description || '(none)'}
URL: ${sourceUrl}

TASKS:
1. Determine if this is a real promotion/discount/deal
2. Extract end date if mentioned (ISO 8601: YYYY-MM-DD)
3. Extract start date if mentioned (ISO 8601: YYYY-MM-DD)
4. Extract discount rate if mentioned (number only, 1-95). Note: "100% cotton" is NOT a discount
5. Extract promo/coupon code if explicitly mentioned (exact code text like "SAVE20", "FREESHIP"). Return null if no specific code found. Do NOT invent codes.

NOT A DEAL:
- Cookie consent pages, privacy policies
- Category listing pages ("All Products", "Deals" alone)
- Service appointments, warranty, recalls
- Brand introduction pages ("About Us", "Discover...")
- General homepages, contact pages, help pages

IS A DEAL (keywords: sale, discount, offer, deal, voucher, free delivery, cashback, installment, flat off, clearance, Eid sale, Jashn-e-Azadi sale, سیل، ڈسکاؤنٹ، آفر، مفت ڈیلیوری):
- Discounts, sales, promotions, special offers
- Vouchers, coupons, promo codes
- Free delivery, gifts, freebies
- Easy installments 0%, cashback, bank offers, JazzCash/Easypaisa deals
- Eid Sale, Independence Day Sale (14 August), Pakistan Day Sale
- 11.11, 12.12, Black Friday, Year End Sale
- Flash sales, Mega Sale, Brand Day, clearance

Reply with ONLY JSON, nothing else:
{"isCampaign":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null,"promoCode":"EXACT_CODE or null"}`;
  }

  if (market === 'SE') {
    return `Du är ett system för analys av kampanjer/erbjudanden för den svenska marknaden. Innehållet kan vara på svenska eller engelska. Analysera följande innehåll.

Varumärke: ${brandName}
Titel: ${title}
Beskrivning: ${description || '(ingen)'}
URL: ${sourceUrl}

UPPGIFTER:
1. Avgör om detta är en riktig kampanj/rabatt/erbjudande
2. Extrahera slutdatum om det nämns (ISO 8601: YYYY-MM-DD)
3. Extrahera startdatum om det nämns (ISO 8601: YYYY-MM-DD)
4. Extrahera rabattprocent om det nämns (bara siffra, 1-95). Obs: "100% bomull" är INTE en rabatt

INTE ETT ERBJUDANDE:
- Cookie/integritetspolicy-sidor, användarvillkor
- Kategorisidor ("Alla produkter", "Erbjudanden" ensamt)
- Servicesidor, garanti, produktåterkallelse
- Varumärkespresentation ("Om oss", "Upptäck...")
- Startsida, kontakt, hjälp

ÄR ETT ERBJUDANDE (nyckelord: rea, rabatt, erbjudande, kampanj, fri frakt, kupong, rabattkod, cashback, outlet, 3 för 2, mellandagsrea):
- Rea, rabatter, erbjudanden, kampanjer
- Rabattkoder, kuponger, presentkort
- Fri frakt, gratisprodukter, samples
- Delbetalning, cashback, bonuspoäng
- Black Friday, Cyber Monday, Julrea, Mellandagsrea
- Sommarrea, vinterrea, Back to School
- Flash sale, veckans erbjudande, dagserbjudande

Svara BARA med JSON, inget annat:
{"isCampaign":true,"confidence":0.95,"reason":"kort förklaring","endDate":"YYYY-MM-DD or null","startDate":"YYYY-MM-DD or null","discountRate":null}`;
  }

  return `Sen bir Türkçe kampanya analiz sistemisin. Aşağıdaki içeriği analiz et.

Marka: ${brandName}
Başlık: ${title}
Açıklama: ${description || '(yok)'}
URL: ${sourceUrl}

GÖREVLER:
1. Bu gerçek bir promosyon/indirim/fırsat kampanyası mı belirle
2. Metinde bitiş tarihi varsa çıkar (ISO 8601 format: YYYY-MM-DD)
3. Metinde başlangıç tarihi varsa çıkar (ISO 8601 format: YYYY-MM-DD)
4. Metinde indirim oranı varsa çıkar (sadece sayı, 1-95 arası). Dikkat: "%100 pamuklu" gibi malzeme oranları indirim DEĞİLDİR

KAMPANYA DEĞİLDİR:
- Çerez/cookie onay sayfaları, KVKK, gizlilik
- Kategori listeleme sayfaları ("Erkek Giyim", "Kampanyalar" tek başına)
- Servis randevusu, garanti, geri çağırma (recall)
- Marka tanıtım sayfaları ("ile Tanışın", "Portal'ı Keşfedin")
- Genel site ana sayfaları, hakkımızda, iletişim

KAMPANYADIR:
- İndirim, fırsat, promosyon, özel teklif
- Banka/kart kampanyaları (bonus, puan, taksit)
- Ücretsiz kargo, hediye, kupon
- Araç satış kampanyaları (kredi, takas, özel fiyat)
- Sezonluk indirimler, outlet, bayram/ramazan kampanyaları
- Telekom kampanyaları (tarife, paket, hat, numara taşıma, sınırsız internet)
- Yazılım/teknoloji kampanyaları (abonelik fırsatı, ücretsiz deneme, lisans indirimi)

SADECE JSON cevap ver, başka bir şey yazma:
{"isCampaign":true,"confidence":0.95,"reason":"kısa açıklama","endDate":"YYYY-MM-DD veya null","startDate":"YYYY-MM-DD veya null","discountRate":null}`;
}

async function waitForGroqRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - groqLastRequestTime;
  if (elapsed < GROQ_MIN_GAP_MS) {
    await new Promise((resolve) => setTimeout(resolve, GROQ_MIN_GAP_MS - elapsed));
  }
  groqLastRequestTime = Date.now();
}

async function waitForCerebrasRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - cerebrasLastRequestTime;
  if (elapsed < CEREBRAS_MIN_GAP_MS) {
    await new Promise((resolve) => setTimeout(resolve, CEREBRAS_MIN_GAP_MS - elapsed));
  }
  cerebrasLastRequestTime = Date.now();
}

async function waitForGeminiRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - geminiLastRequestTime;
  if (elapsed < GEMINI_MIN_GAP_MS) {
    await new Promise((resolve) => setTimeout(resolve, GEMINI_MIN_GAP_MS - elapsed));
  }
  geminiLastRequestTime = Date.now();
}

function parseAIResponse(text: string): AICampaignResult | null {
  const jsonMatch = text.match(/\{[\s\S]*?"isCampaign"[\s\S]*?\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed.isCampaign !== 'boolean') return null;

    const result: AICampaignResult = {
      isCampaign: parsed.isCampaign,
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
      reason: typeof parsed.reason === 'string' ? parsed.reason.substring(0, 200) : 'no reason',
    };

    if (parsed.endDate && typeof parsed.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.endDate)) {
      const d = new Date(parsed.endDate);
      if (!isNaN(d.getTime()) && d.getFullYear() >= 2024 && d.getFullYear() <= 2030) {
        result.endDate = parsed.endDate;
      }
    }

    if (parsed.startDate && typeof parsed.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.startDate)) {
      const d = new Date(parsed.startDate);
      if (!isNaN(d.getTime()) && d.getFullYear() >= 2024 && d.getFullYear() <= 2030) {
        result.startDate = parsed.startDate;
      }
    }

    if (typeof parsed.discountRate === 'number' && parsed.discountRate >= 1 && parsed.discountRate <= 95) {
      result.discountRate = Math.round(parsed.discountRate);
    }

    // Extract promo code from AI response
    if (typeof parsed.promoCode === 'string' && parsed.promoCode && parsed.promoCode !== 'null') {
      const code = parsed.promoCode.trim().toUpperCase();
      if (code.length >= 3 && code.length <= 30 && /[A-Z0-9]/.test(code)) {
        result.promoCode = code;
      }
    }

    return result;
  } catch {
    return null;
  }
}

async function callGroqAPI(prompt: string, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 256,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      throw new Error(`Groq API error: ${status}`);
    }

    const data: any = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  } finally {
    clearTimeout(timeout);
  }
}

async function callCerebrasAPI(prompt: string, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(CEREBRAS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CEREBRAS_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 256,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      throw new Error(`Cerebras API error: ${status}`);
    }

    const data: any = await response.json();
    return data?.choices?.[0]?.message?.content || '';
  } finally {
    clearTimeout(timeout);
  }
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const status = response.status;
      throw new Error(`Gemini API error: ${status}`);
    }

    const data: any = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Try calling a provider with retries. Returns null if all attempts fail.
 */
async function tryProvider(
  provider: 'groq' | 'gemini' | 'cerebras',
  prompt: string,
  apiKey: string,
  titleSnippet: string,
): Promise<AICampaignResult | null> {
  const callFnMap = { groq: callGroqAPI, gemini: callGeminiAPI, cerebras: callCerebrasAPI };
  const waitFnMap = { groq: waitForGroqRateLimit, gemini: waitForGeminiRateLimit, cerebras: waitForCerebrasRateLimit };
  const labelMap = { groq: 'Groq', gemini: 'Gemini', cerebras: 'Cerebras' };
  const exhaustedMap = { gemini: geminiExhaustedUntil, cerebras: cerebrasExhaustedUntil, groq: groqExhaustedUntil };

  const callFn = callFnMap[provider];
  const waitFn = waitFnMap[provider];
  const label = labelMap[provider];

  // Circuit breaker check — skip provider if recently rate-limited
  const exhaustedUntil = exhaustedMap[provider];
  if (Date.now() < exhaustedUntil) {
    return null; // Provider devre dışı, boşuna deneme
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await waitFn();
      const responseText = await callFn(prompt, apiKey);
      const result = parseAIResponse(responseText);

      if (result) return result;

      console.warn(`[AI/${label}] Failed to parse response for "${titleSnippet}"`);
      return null;
    } catch (err) {
      const message = (err as Error).message || '';

      // 429 rate limit — circuit breaker aç, retry YAPMA (boşa zaman kaybı)
      if (message.includes('429')) {
        const until = Date.now() + CIRCUIT_BREAKER_MS;
        if (provider === 'gemini') geminiExhaustedUntil = until;
        else if (provider === 'cerebras') cerebrasExhaustedUntil = until;
        else groqExhaustedUntil = until;
        console.warn(`  [AI/${label}] Rate limited (429) — circuit breaker ON for ${CIRCUIT_BREAKER_MS / 1000}s`);
        return null; // Anında fallback'e geç
      }

      // 500/503 server errors — retry with short wait
      const isRetryable = message.includes('500') || message.includes('503');
      if (attempt < MAX_RETRIES && isRetryable) {
        console.warn(`  [AI/${label}] Retrying (${attempt + 1}/${MAX_RETRIES}), waiting 5s: ${message}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        continue;
      }

      console.warn(`[AI/${label}] Error for "${titleSnippet}": ${message}`);
      return null;
    }
  }

  return null;
}

/**
 * Classify a campaign using AI and optionally extract enrichment data.
 * Chain: Gemini (primary) → Cerebras (secondary) → Groq (tertiary) → static fallback.
 * Returns a fallback result on any error (never throws).
 */
export async function classifyAndEnrich(
  title: string,
  description: string | null,
  sourceUrl: string,
  brandName: string,
  market: AIMarket = 'TR',
): Promise<AICampaignResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !cerebrasKey && !groqKey) return FALLBACK_RESULT;

  // Fast path: tüm provider'lar exhausted ise boşuna prompt bile oluşturma
  const now = Date.now();
  if (
    (!geminiKey || now < geminiExhaustedUntil) &&
    (!cerebrasKey || now < cerebrasExhaustedUntil) &&
    (!groqKey || now < groqExhaustedUntil)
  ) {
    return FALLBACK_RESULT; // 0ms — anında static fallback'e düş
  }

  const prompt = buildPrompt(title, description, sourceUrl, brandName, market);
  const titleSnippet = title.substring(0, 50);

  // 1. Try Gemini first (primary — different model, highest free tier)
  if (geminiKey) {
    const result = await tryProvider('gemini', prompt, geminiKey, titleSnippet);
    if (result) return result;
    if (now >= geminiExhaustedUntil) {
      console.warn(`  [AI] Gemini failed, trying Cerebras...`);
    }
  }

  // 2. Try Cerebras (secondary — fastest inference, ~3000 tok/s)
  if (cerebrasKey) {
    const result = await tryProvider('cerebras', prompt, cerebrasKey, titleSnippet);
    if (result) return result;
    if (now >= cerebrasExhaustedUntil) {
      console.warn(`  [AI] Cerebras failed, trying Groq...`);
    }
  }

  // 3. Try Groq as final fallback
  if (groqKey) {
    const result = await tryProvider('groq', prompt, groqKey, titleSnippet);
    if (result) return result;
  }

  return FALLBACK_RESULT;
}
