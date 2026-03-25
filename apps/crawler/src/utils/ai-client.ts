/**
 * AI client for job listing classification + enrichment.
 * Primary: Gemini 2.5 Flash — free tier: ~30 RPM (2s gap)
 * Secondary: Cerebras qwen-3-235b — free tier: ~30 RPM (2s gap)
 * Tertiary: Groq (Llama 3.3 70B) — free tier: 30 RPM, 14,400 RPD
 * No external dependencies — uses native fetch().
 */

// --- Groq config ---
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// --- Cerebras config ---
const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';
const CEREBRAS_MODEL = 'qwen-3-235b-a22b-instruct-2507';

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

// Circuit breaker: 429 sonrası provider'ı geçici devre dışı bırak
const CIRCUIT_BREAKER_MS = 60_000; // 429 sonrası 60 saniye devre dışı
let geminiExhaustedUntil = 0;
let cerebrasExhaustedUntil = 0;
let groqExhaustedUntil = 0;

export interface AIJobResult {
  isJobListing: boolean;    // true = valid job listing
  confidence: number;
  reason: string;
  endDate?: string | null;  // application deadline
  startDate?: string | null; // posted date (kept for compat)
  // Job-specific fields (extracted by AI)
  isBlueCollar?: boolean;
  jobType?: string | null;
  workMode?: string | null;
  experienceLevel?: string | null;
  sector?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
  city?: string | null;
  state?: string | null;
}

const FALLBACK_RESULT: AIJobResult = {
  isJobListing: true,
  confidence: 0.5,
  reason: 'AI unavailable, falling back to static score',
};

type AIMarket = 'TR' | 'US' | 'DE' | 'UK' | 'IN' | 'BR' | 'ID' | 'RU' | 'MX' | 'JP' | 'PH' | 'TH' | 'CA' | 'AU' | 'FR' | 'IT' | 'ES' | 'EG' | 'SA' | 'KR' | 'AR' | 'AE' | 'VN' | 'PL' | 'MY' | 'CO' | 'ZA' | 'PT' | 'NL' | 'PK' | 'SE';

// ─── Prompts ────────────────────────────────────────────────────

function buildPrompt(
  title: string,
  description: string | null,
  sourceUrl: string,
  companyName: string,
  market: AIMarket = 'TR',
): string {
  const descText = description ? description.substring(0, 500) : '(none)';

  if (market === 'TR') {
    return `Sen bir iş ilanı sınıflandırma sistemisin. Aşağıdaki içeriği analiz et.

Firma: ${companyName}
Başlık: ${title}
Açıklama: ${descText}
URL: ${sourceUrl}

GÖREVLER:
1. Bu gerçek bir iş ilanı mı? (şirket sayfası, blog, hakkımızda, iletişim gibi içerikler İŞ İLANI DEĞİL)
2. Bu bir MAVİ YAKA iş ilanı mı? (fiziksel/manuel iş, hizmet sektörü, lojistik, üretim vb.)
3. İlan bilgilerini çıkar: iş tipi, çalışma şekli, deneyim seviyesi, sektör, son başvuru tarihi
4. Lokasyon: şehir ve il/eyalet (metinde geçiyorsa)
5. Ücret: maaş aralığı, para birimi ve periyod (metinde geçiyorsa)

MAVİ YAKA ÖRNEKLER: şoför, kurye, teknisyen, güvenlik, temizlik, garson, kasiyer, depocu, forklift operatörü, kaynak, inşaat işçisi, fabrika işçisi, bakıcı, aşçı, montajcı, elektrikçi, tesisatçı

BEYAZ YAKA (RET): CEO, CTO, direktör, genel müdür, yazılım geliştirici, veri bilimci, danışman, avukat, mimar, analist

SINIRDA (kararını kullan): vardiya amiri, takım lideri, depo müdürü, şantiye şefi, mağaza müdürü

SADECE JSON cevap ver:
{"isJobListing":true,"isBlueCollar":true,"confidence":0.95,"reason":"kısa açıklama","endDate":"YYYY-MM-DD veya null","jobType":"FULL_TIME veya null","workMode":"ON_SITE veya null","experienceLevel":"ENTRY veya null","sector":"MANUFACTURING veya null","city":"İstanbul veya null","state":"İstanbul veya null","salaryMin":10000,"salaryMax":15000,"salaryCurrency":"TRY","salaryPeriod":"MONTHLY"}`;
  }

  // Default: English prompt for all other markets
  return `You are a job listing classification system for blue-collar jobs. Analyze the following content.

Company: ${companyName}
Title: ${title}
Description: ${descText}
URL: ${sourceUrl}

TASKS:
1. Is this a real job listing? (NOT company about page, blog, login, contact, etc.)
2. Is this a BLUE-COLLAR job? (manual labor, trades, service industry, logistics, manufacturing)
3. Extract: job type, work mode, experience level, sector, application deadline
4. Location: city and state/province (if mentioned in text)
5. Salary: pay range, currency and period (if mentioned in text)

BLUE-COLLAR EXAMPLES: warehouse worker, driver, courier, technician, security guard, cleaner, factory worker, construction, mechanic, welder, electrician, plumber, cook, waiter, cashier, delivery, forklift operator, maintenance

WHITE-COLLAR (REJECT): CEO, CTO, VP, Director, Senior Manager, Consultant, Data Analyst, Software Engineer, Architect, Lawyer, Doctor

BORDERLINE (use judgment): supervisor, team lead, shift manager, warehouse manager, site manager, foreman

NOT A JOB:
- Company about/culture pages, blog posts, news
- Login/register pages, privacy policy, terms
- Product listings, service pages
- General homepages, contact pages

Reply with ONLY JSON, nothing else:
{"isJobListing":true,"isBlueCollar":true,"confidence":0.95,"reason":"short explanation","endDate":"YYYY-MM-DD or null","jobType":"FULL_TIME or null","workMode":"ON_SITE or null","experienceLevel":"ENTRY or null","sector":"MANUFACTURING or null","city":"Chicago or null","state":"Illinois or null","salaryMin":15,"salaryMax":22,"salaryCurrency":"USD","salaryPeriod":"HOURLY"}`;
}

// ─── Rate Limiters ──────────────────────────────────────────────

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

// ─── Response Parser ────────────────────────────────────────────

function parseAIResponse(text: string): AIJobResult | null {
  const jsonMatch = text.match(/\{[\s\S]*?"isJobListing"[\s\S]*?\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const flag = parsed.isJobListing;
    if (typeof flag !== 'boolean') return null;

    const result: AIJobResult = {
      isJobListing: flag,
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
      reason: typeof parsed.reason === 'string' ? parsed.reason.substring(0, 200) : 'no reason',
    };

    // Extract application deadline
    if (parsed.endDate && typeof parsed.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.endDate)) {
      const d = new Date(parsed.endDate);
      if (!isNaN(d.getTime()) && d.getFullYear() >= 2024 && d.getFullYear() <= 2030) {
        result.endDate = parsed.endDate;
      }
    }

    // Extract blue-collar flag
    if (typeof parsed.isBlueCollar === 'boolean') {
      result.isBlueCollar = parsed.isBlueCollar;
    }

    // Extract job-specific fields
    const validJobTypes = ['FULL_TIME', 'PART_TIME', 'DAILY', 'SEASONAL', 'INTERNSHIP', 'CONTRACT'];
    if (typeof parsed.jobType === 'string' && validJobTypes.includes(parsed.jobType)) {
      result.jobType = parsed.jobType;
    }

    const validWorkModes = ['ON_SITE', 'REMOTE', 'HYBRID'];
    if (typeof parsed.workMode === 'string' && validWorkModes.includes(parsed.workMode)) {
      result.workMode = parsed.workMode;
    }

    const validExpLevels = ['NONE', 'ENTRY', 'MID', 'SENIOR'];
    if (typeof parsed.experienceLevel === 'string' && validExpLevels.includes(parsed.experienceLevel)) {
      result.experienceLevel = parsed.experienceLevel;
    }

    const validSectors = [
      'LOGISTICS_TRANSPORTATION', 'MANUFACTURING', 'RETAIL', 'CONSTRUCTION',
      'FOOD_BEVERAGE', 'AUTOMOTIVE', 'TEXTILE', 'MINING_ENERGY',
      'HEALTHCARE', 'HOSPITALITY_TOURISM', 'AGRICULTURE', 'SECURITY_SERVICES',
      'FACILITY_MANAGEMENT', 'METAL_STEEL', 'CHEMICALS_PLASTICS',
      'ECOMMERCE_CARGO', 'TELECOMMUNICATIONS', 'OTHER',
    ];
    if (typeof parsed.sector === 'string' && validSectors.includes(parsed.sector)) {
      result.sector = parsed.sector;
    }

    // Extract salary fields
    if (typeof parsed.salaryMin === 'number' && parsed.salaryMin > 0 && parsed.salaryMin < 10_000_000) {
      result.salaryMin = parsed.salaryMin;
    }
    if (typeof parsed.salaryMax === 'number' && parsed.salaryMax > 0 && parsed.salaryMax < 10_000_000) {
      result.salaryMax = parsed.salaryMax;
    }
    if (typeof parsed.salaryCurrency === 'string' && /^[A-Z]{3}$/.test(parsed.salaryCurrency)) {
      result.salaryCurrency = parsed.salaryCurrency;
    }
    const validPeriods = ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];
    if (typeof parsed.salaryPeriod === 'string' && validPeriods.includes(parsed.salaryPeriod)) {
      result.salaryPeriod = parsed.salaryPeriod;
    }

    // Extract location fields
    if (typeof parsed.city === 'string' && parsed.city.length >= 2 && parsed.city.length <= 50 && parsed.city !== 'null') {
      result.city = parsed.city;
    }
    if (typeof parsed.state === 'string' && parsed.state.length >= 2 && parsed.state.length <= 50 && parsed.state !== 'null') {
      result.state = parsed.state;
    }

    return result;
  } catch {
    return null;
  }
}

// ─── Provider API Calls ─────────────────────────────────────────

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

// ─── Provider Chain ─────────────────────────────────────────────

/**
 * Try calling a provider with retries. Returns null if all attempts fail.
 */
async function tryProvider(
  provider: 'groq' | 'gemini' | 'cerebras',
  prompt: string,
  apiKey: string,
  titleSnippet: string,
): Promise<AIJobResult | null> {
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
    return null;
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

      // 429 rate limit — circuit breaker
      if (message.includes('429')) {
        const until = Date.now() + CIRCUIT_BREAKER_MS;
        if (provider === 'gemini') geminiExhaustedUntil = until;
        else if (provider === 'cerebras') cerebrasExhaustedUntil = until;
        else groqExhaustedUntil = until;
        console.warn(`  [AI/${label}] Rate limited (429) — circuit breaker ON for ${CIRCUIT_BREAKER_MS / 1000}s`);
        return null;
      }

      // 500/503 server errors — retry
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
 * Classify a job listing using AI.
 * Chain: Gemini (primary) → Cerebras (secondary) → Groq (tertiary) → static fallback.
 * Returns a fallback result on any error (never throws).
 */
export async function classifyAndEnrich(
  title: string,
  description: string | null,
  sourceUrl: string,
  companyName: string,
  market: AIMarket = 'TR',
): Promise<AIJobResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!geminiKey && !cerebrasKey && !groqKey) return FALLBACK_RESULT;

  // Fast path: all providers exhausted
  const now = Date.now();
  if (
    (!geminiKey || now < geminiExhaustedUntil) &&
    (!cerebrasKey || now < cerebrasExhaustedUntil) &&
    (!groqKey || now < groqExhaustedUntil)
  ) {
    return FALLBACK_RESULT;
  }

  const prompt = buildPrompt(title, description, sourceUrl, companyName, market);
  const titleSnippet = title.substring(0, 50);

  // 1. Gemini (primary)
  if (geminiKey) {
    const result = await tryProvider('gemini', prompt, geminiKey, titleSnippet);
    if (result) return result;
    if (now >= geminiExhaustedUntil) {
      console.warn(`  [AI] Gemini failed, trying Cerebras...`);
    }
  }

  // 2. Cerebras (secondary)
  if (cerebrasKey) {
    const result = await tryProvider('cerebras', prompt, cerebrasKey, titleSnippet);
    if (result) return result;
    if (now >= cerebrasExhaustedUntil) {
      console.warn(`  [AI] Cerebras failed, trying Groq...`);
    }
  }

  // 3. Groq (tertiary)
  if (groqKey) {
    const result = await tryProvider('groq', prompt, groqKey, titleSnippet);
    if (result) return result;
  }

  return FALLBACK_RESULT;
}
