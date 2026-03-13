/**
 * Google Gemini 2.5 Flash API client for campaign classification + enrichment.
 * Free tier: ~20 RPM, ~1500 RPD.
 * No external dependencies — uses native fetch().
 */

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

// Rate limiter: stay well under 20 RPM — 4s gap = ~15 RPM max
const MIN_GAP_MS = 4000;
let lastRequestTime = 0;

export interface AICampaignResult {
  isCampaign: boolean;
  confidence: number;
  reason: string;
  endDate?: string | null;
  startDate?: string | null;
  discountRate?: number | null;
}

const FALLBACK_RESULT: AICampaignResult = {
  isCampaign: true,
  confidence: 0.5,
  reason: 'AI unavailable, falling back to static score',
};

function buildPrompt(
  title: string,
  description: string | null,
  sourceUrl: string,
  brandName: string,
): string {
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

SADECE JSON cevap ver, başka bir şey yazma:
{"isCampaign":true,"confidence":0.95,"reason":"kısa açıklama","endDate":"YYYY-MM-DD veya null","startDate":"YYYY-MM-DD veya null","discountRate":null}`;
}

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_GAP_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_GAP_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

function parseAIResponse(text: string): AICampaignResult | null {
  // Try to extract JSON from response (handles ```json ... ``` wrapper or plain JSON)
  const jsonMatch = text.match(/\{[\s\S]*?"isCampaign"[\s\S]*?\}/);
  if (!jsonMatch) return null;

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (typeof parsed.isCampaign !== 'boolean') return null;

    const result: AICampaignResult = {
      isCampaign: parsed.isCampaign,
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
      reason: typeof parsed.reason === 'string' ? parsed.reason.substring(0, 200) : 'no reason',
    };

    // Optional enrichment fields
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

    return result;
  } catch {
    return null;
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
      // For 429, try to extract retry delay from response body
      if (status === 429) {
        try {
          const errBody: any = await response.json();
          const retryInfo = errBody?.error?.details?.find(
            (d: any) => d['@type']?.includes('RetryInfo'),
          );
          const retryDelay = retryInfo?.retryDelay;
          if (retryDelay) {
            const seconds = parseFloat(retryDelay) || 0;
            if (seconds > 0) {
              throw new Error(`429:${Math.ceil(seconds)}`);
            }
          }
        } catch (e) {
          if ((e as Error).message.startsWith('429:')) throw e;
        }
      }
      throw new Error(`Gemini API error: ${status}`);
    }

    const data: any = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Classify a campaign using Gemini AI and optionally extract enrichment data.
 * Returns a fallback result on any error (never throws).
 */
export async function classifyAndEnrich(
  title: string,
  description: string | null,
  sourceUrl: string,
  brandName: string,
): Promise<AICampaignResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return FALLBACK_RESULT;

  const prompt = buildPrompt(title, description, sourceUrl, brandName);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await waitForRateLimit();
      const responseText = await callGeminiAPI(prompt, apiKey);
      const result = parseAIResponse(responseText);

      if (result) return result;

      // If parsing failed, don't retry — the response format is the issue
      console.warn(`[AI] Failed to parse Gemini response for "${title.substring(0, 50)}"`);
      return FALLBACK_RESULT;
    } catch (err) {
      const message = (err as Error).message || '';

      // Smart retry: parse wait time from 429 response
      if (message.startsWith('429:')) {
        const waitSec = parseInt(message.split(':')[1], 10) || 60;
        if (attempt < MAX_RETRIES) {
          console.warn(`  [AI] Rate limited, waiting ${waitSec}s before retry ${attempt + 1}/${MAX_RETRIES}...`);
          await new Promise((resolve) => setTimeout(resolve, waitSec * 1000));
          continue;
        }
      }

      const isRetryable = message.includes('429') || message.includes('500') || message.includes('503');
      if (attempt < MAX_RETRIES && isRetryable) {
        console.warn(`  [AI] Retrying (${attempt + 1}/${MAX_RETRIES}): ${message}`);
        await new Promise((resolve) => setTimeout(resolve, 15000));
        continue;
      }

      console.warn(`[AI] Error for "${title.substring(0, 50)}": ${message}`);
      return FALLBACK_RESULT;
    }
  }

  return FALLBACK_RESULT;
}
