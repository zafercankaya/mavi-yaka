/**
 * JSON API processor — fetches job listing data from REST APIs.
 * Uses flexible field mapping to support both Turkish and English field names.
 */
import { RawJobData } from '../pipeline/normalize';
import { REQUEST_TIMEOUT_MS } from '../config';

const TITLE_FIELDS = ['title', 'baslik', 'name', 'ad', 'jobTitle', 'job_title', 'position', 'pozisyon'];
const DESC_FIELDS = ['description', 'aciklama', 'summary', 'ozet', 'content', 'icerik', 'body', 'jobDescription', 'job_description'];
const URL_FIELDS = ['url', 'link', 'href', 'sourceUrl', 'detailUrl', 'slug', 'path', 'permalink', 'applyUrl', 'apply_url'];
const IMAGE_FIELDS = ['image', 'imageUrl', 'image_url', 'resim', 'gorsel', 'thumbnail', 'banner', 'photo', 'img', 'media', 'logo', 'companyLogo'];
const START_FIELDS = ['startDate', 'start_date', 'publishDate', 'publish_date', 'created_at', 'postedDate', 'posted_date', 'datePosted', 'date_posted'];
const END_FIELDS = ['endDate', 'end_date', 'deadline', 'applicationDeadline', 'application_deadline', 'validThrough', 'valid_through', 'expiryDate', 'expiry_date', 'expires_at'];
const SALARY_FIELDS = ['salary', 'salaryText', 'salary_text', 'wage', 'compensation', 'maas', 'ucret'];

export async function fetchApiJobListings(apiUrl: string, baseUrl?: string): Promise<RawJobData[]> {
  console.log(`  Fetching API: ${apiUrl}`);

  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'MaviYaka/1.0',
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

  const jobListings = items
    .map((item) => mapApiItem(item, baseUrl))
    .filter(Boolean) as RawJobData[];

  console.log(`  [API] Parsed ${jobListings.length} job listings`);
  return jobListings;
}

function findItemsArray(data: any): any[] | null {
  if (Array.isArray(data)) return data;

  // Common wrapper keys
  const wrapperKeys = ['data', 'items', 'results', 'jobs', 'listings', 'vacancies', 'positions', 'content', 'list', 'records', 'posts'];

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

function mapApiItem(item: any, baseUrl?: string): RawJobData | null {
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
  const salaryText = findStringField(item, SALARY_FIELDS) || undefined;
  const imageUrls = extractImageUrls(item, baseUrl);

  return { title, description, sourceUrl, imageUrls, postedDate: startDate, deadline: endDate, salaryText };
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
