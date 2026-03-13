/**
 * JSON API processor — fetches campaign data from REST APIs.
 * Uses flexible field mapping to support both Turkish and English field names.
 */
import { RawCampaignData } from '../pipeline/normalize';
import { REQUEST_TIMEOUT_MS } from '../config';

const TITLE_FIELDS = ['title', 'baslik', 'name', 'ad', 'campaignName', 'kampanyaAdi', 'kampanya_adi'];
const DESC_FIELDS = ['description', 'aciklama', 'summary', 'ozet', 'content', 'icerik', 'body'];
const URL_FIELDS = ['url', 'link', 'href', 'sourceUrl', 'detailUrl', 'slug', 'path', 'permalink'];
const IMAGE_FIELDS = ['image', 'imageUrl', 'image_url', 'resim', 'gorsel', 'thumbnail', 'banner', 'photo', 'img', 'media'];
const START_FIELDS = ['startDate', 'start_date', 'baslangicTarihi', 'baslangic_tarihi', 'validFrom', 'valid_from', 'dateStart', 'publishDate', 'publish_date', 'created_at'];
const END_FIELDS = ['endDate', 'end_date', 'bitisTarihi', 'bitis_tarihi', 'validThrough', 'valid_through', 'dateEnd', 'expiryDate', 'expiry_date', 'expires_at'];
const DISCOUNT_FIELDS = ['discountRate', 'discount_rate', 'indirimOrani', 'indirim_orani', 'discount', 'rate', 'percentage'];

export async function fetchApiCampaigns(apiUrl: string, baseUrl?: string): Promise<RawCampaignData[]> {
  console.log(`  Fetching API: ${apiUrl}`);

  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'IndirimAvcisi/1.0',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`API fetch failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  const items = findItemsArray(data);
  if (!items) {
    console.warn('  [API] No items array found in response');
    return [];
  }

  const campaigns = items
    .map((item) => mapApiItem(item, baseUrl))
    .filter(Boolean) as RawCampaignData[];

  console.log(`  [API] Parsed ${campaigns.length} campaigns`);
  return campaigns;
}

function findItemsArray(data: any): any[] | null {
  if (Array.isArray(data)) return data;

  // Common wrapper keys
  const wrapperKeys = ['data', 'items', 'results', 'campaigns', 'kampanyalar', 'content', 'list', 'records', 'posts'];

  for (const key of wrapperKeys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  // One level deeper
  for (const val of Object.values(data || {})) {
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      for (const key of wrapperKeys) {
        if (Array.isArray((val as any)[key])) return (val as any)[key];
      }
    }
  }

  return null;
}

function mapApiItem(item: any, baseUrl?: string): RawCampaignData | null {
  const title = findStringField(item, TITLE_FIELDS);
  if (!title) return null;

  let sourceUrl = findStringField(item, URL_FIELDS) || '';
  if (sourceUrl && baseUrl && !sourceUrl.startsWith('http')) {
    try { sourceUrl = new URL(sourceUrl, baseUrl).toString(); } catch {}
  }
  if (!sourceUrl) return null;

  const description = findStringField(item, DESC_FIELDS) || undefined;
  const startDate = findStringField(item, START_FIELDS) || undefined;
  const endDate = findStringField(item, END_FIELDS) || undefined;
  const discountRate = parseNumber(findStringField(item, DISCOUNT_FIELDS));
  const imageUrls = extractImageUrls(item, baseUrl);

  return { title, description, sourceUrl, imageUrls, startDate, endDate, discountRate };
}

function findStringField(obj: any, fieldNames: string[]): string | undefined {
  for (const name of fieldNames) {
    const val = obj[name];
    if (val !== undefined && val !== null && val !== '') {
      return String(val);
    }
  }
  return undefined;
}

function parseNumber(val: string | undefined): number | undefined {
  if (!val) return undefined;
  const num = parseFloat(val);
  return isNaN(num) ? undefined : num;
}

function extractImageUrls(item: any, baseUrl?: string): string[] {
  const urls: string[] = [];

  for (const field of IMAGE_FIELDS) {
    const val = item[field];
    if (!val) continue;

    if (typeof val === 'string') {
      const resolved = resolveUrl(val, baseUrl);
      if (resolved) urls.push(resolved);
      break;
    }

    if (Array.isArray(val)) {
      for (const v of val) {
        const url = typeof v === 'string' ? v : v?.url || v?.src || v?.href;
        if (url) {
          const resolved = resolveUrl(url, baseUrl);
          if (resolved) urls.push(resolved);
        }
      }
      break;
    }

    if (typeof val === 'object') {
      const url = val.url || val.src || val.href;
      if (url) {
        const resolved = resolveUrl(url, baseUrl);
        if (resolved) urls.push(resolved);
      }
      break;
    }
  }

  return urls;
}

function resolveUrl(url: string, baseUrl?: string): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (baseUrl) {
    try { return new URL(url, baseUrl).toString(); } catch {}
  }
  return null;
}
