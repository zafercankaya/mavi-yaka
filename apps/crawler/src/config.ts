import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from api directory (shared DB connection)
config({ path: resolve(__dirname, '../../api/.env') });

export const DATABASE_URL = process.env.DATABASE_URL!;
export const CRAWL_DELAY_MS = 1000; // 1 second between requests per domain
export const MAX_CONCURRENT_BROWSERS = 2;
export const REQUEST_TIMEOUT_MS = 15000; // 15s per HTTP request

/** Market-aware locale helpers for HTTP headers */
export type CrawlMarket = 'TR' | 'US' | 'DE' | 'UK' | 'IN' | 'BR' | 'ID' | 'RU' | 'MX' | 'JP' | 'PH' | 'TH' | 'CA' | 'AU' | 'FR' | 'IT' | 'ES' | 'EG' | 'SA' | 'KR' | 'AR' | 'AE' | 'VN' | 'PL' | 'MY' | 'CO' | 'ZA' | 'PT' | 'NL' | 'PK' | 'SE';

export function getAcceptLanguage(market?: CrawlMarket): string {
  switch (market) {
    case 'US': return 'en-US,en;q=0.9';
    case 'UK': return 'en-GB,en;q=0.9';
    case 'DE': return 'de-DE,de;q=0.9,en;q=0.8';
    case 'IN': return 'en-IN,en;q=0.9,hi;q=0.8';
    case 'BR': return 'pt-BR,pt;q=0.9,en;q=0.8';
    case 'ID': return 'id-ID,id;q=0.9,en;q=0.8';
    case 'RU': return 'ru-RU,ru;q=0.9,en;q=0.8';
    case 'MX': return 'es-MX,es;q=0.9,en;q=0.8';
    case 'JP': return 'ja-JP,ja;q=0.9,en;q=0.8';
    case 'PH': return 'en-PH,en;q=0.9,fil;q=0.8';
    case 'TH': return 'th-TH,th;q=0.9,en;q=0.8';
    case 'CA': return 'en-CA,en;q=0.9,fr;q=0.8';
    case 'AU': return 'en-AU,en;q=0.9';
    case 'FR': return 'fr-FR,fr;q=0.9,en;q=0.8';
    case 'IT': return 'it-IT,it;q=0.9,en;q=0.8';
    case 'ES': return 'es-ES,es;q=0.9,en;q=0.8';
    case 'AR': return 'es-AR,es;q=0.9,en;q=0.8';
    case 'EG': return 'ar-EG,ar;q=0.9,en;q=0.8';
    case 'SA': return 'ar-SA,ar;q=0.9,en;q=0.8';
    case 'KR': return 'ko-KR,ko;q=0.9,en;q=0.8';
    case 'AE': return 'ar-AE,ar;q=0.9,en;q=0.8';
    case 'VN': return 'vi-VN,vi;q=0.9,en;q=0.8';
    case 'PL': return 'pl-PL,pl;q=0.9,en;q=0.8';
    case 'MY': return 'ms-MY,ms;q=0.9,en;q=0.8';
    case 'CO': return 'es-CO,es;q=0.9,en;q=0.8';
    case 'ZA': return 'en-ZA,en;q=0.9';
    case 'PT': return 'pt-PT,pt;q=0.9,en;q=0.8';
    case 'NL': return 'nl-NL,nl;q=0.9,en;q=0.8';
    case 'PK': return 'ur-PK,ur;q=0.9,en;q=0.8';
    case 'SE': return 'sv-SE,sv;q=0.9,en;q=0.8';
    default: return 'tr-TR,tr;q=0.9,en;q=0.8';
  }
}

export function getBrowserLocale(market?: CrawlMarket): string {
  switch (market) {
    case 'US': return 'en-US';
    case 'UK': return 'en-GB';
    case 'DE': return 'de-DE';
    case 'IN': return 'en-IN';
    case 'BR': return 'pt-BR';
    case 'ID': return 'id-ID';
    case 'RU': return 'ru-RU';
    case 'MX': return 'es-MX';
    case 'JP': return 'ja-JP';
    case 'PH': return 'en-PH';
    case 'TH': return 'th-TH';
    case 'CA': return 'en-CA';
    case 'AU': return 'en-AU';
    case 'FR': return 'fr-FR';
    case 'IT': return 'it-IT';
    case 'ES': return 'es-ES';
    case 'AR': return 'es-AR';
    case 'EG': return 'ar-EG';
    case 'SA': return 'ar-SA';
    case 'KR': return 'ko-KR';
    case 'AE': return 'ar-AE';
    case 'VN': return 'vi-VN';
    case 'PL': return 'pl-PL';
    case 'MY': return 'ms-MY';
    case 'CO': return 'es-CO';
    case 'ZA': return 'en-ZA';
    case 'PT': return 'pt-PT';
    case 'NL': return 'nl-NL';
    case 'PK': return 'ur-PK';
    case 'SE': return 'sv-SE';
    default: return 'tr-TR';
  }
}
