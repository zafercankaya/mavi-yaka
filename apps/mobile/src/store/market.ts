import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { getLocales } from 'expo-localization';
import i18n from '../i18n';
import api from '../api/client';

export type Market = 'TR' | 'US' | 'DE' | 'UK' | 'IN' | 'BR' | 'ID' | 'RU' | 'MX' | 'JP' | 'PH' | 'TH' | 'CA' | 'AU' | 'FR' | 'IT' | 'ES' | 'EG' | 'SA' | 'KR' | 'AR' | 'AE' | 'VN' | 'PL' | 'MY' | 'CO' | 'ZA' | 'PT' | 'NL' | 'PK' | 'SE';

interface MarketState {
  market: Market;
  isLoaded: boolean;
  setMarket: (market: Market) => Promise<void>;
  loadStoredMarket: () => Promise<void>;
}

/** Detect market from device locale */
function detectMarketFromLocale(): Market {
  try {
    const locales = getLocales();
    const lang = locales[0]?.languageCode ?? 'en';
    const region = locales[0]?.regionCode ?? '';
    if (lang === 'tr') return 'TR';
    if (lang === 'de') return 'DE';
    if (region === 'GB' || region === 'UK') return 'UK';
    if (lang === 'hi' || region === 'IN') return 'IN';
    if (lang === 'pt' && region === 'PT') return 'PT';
    if (lang === 'pt' || region === 'BR') return 'BR';
    if (lang === 'id' || region === 'ID') return 'ID';
    if (lang === 'ru' || region === 'RU') return 'RU';
    if (lang === 'es' && region === 'CO') return 'CO';
    if (lang === 'es' && region === 'ES') return 'ES';
    if (lang === 'es' && region === 'AR') return 'AR';
    if (lang === 'es' && region === 'MX') return 'MX';
    if (region === 'AE') return 'AE';
    if (lang === 'ar' && region === 'EG') return 'EG';
    if (lang === 'ar' && region === 'SA') return 'SA';
    if (lang === 'ar') return 'EG';
    if (lang === 'ko' || region === 'KR') return 'KR';
    if (lang === 'vi' || region === 'VN') return 'VN';
    if (lang === 'pl' || region === 'PL') return 'PL';
    if (lang === 'ms' || region === 'MY') return 'MY';
    if (region === 'ZA') return 'ZA';
    if (lang === 'nl' || region === 'NL') return 'NL';
    if (lang === 'ur' || region === 'PK') return 'PK';
    if (lang === 'sv' || region === 'SE') return 'SE';
    if (lang === 'ja' || region === 'JP') return 'JP';
    if (region === 'PH') return 'PH';
    if (lang === 'th' || region === 'TH') return 'TH';
    if (region === 'CA') return 'CA';
    if (region === 'AU') return 'AU';
    if (lang === 'fr') return 'FR';
    if (lang === 'it' || region === 'IT') return 'IT';
    return 'US';
  } catch {
    return 'US';
  }
}

export const useMarketStore = create<MarketState>((set) => ({
  market: detectMarketFromLocale(),
  isLoaded: false,

  setMarket: async (market) => {
    await SecureStore.setItemAsync('selectedMarket', market);
    // Sync i18n language with market
    const langMap: Record<Market, string> = {
      TR: 'tr', DE: 'de', BR: 'pt', ID: 'id', RU: 'ru', MX: 'es', JP: 'ja', TH: 'th',
      US: 'en', UK: 'en', IN: 'en', PH: 'en',
      CA: 'en', AU: 'en', FR: 'fr', IT: 'it',
      ES: 'es', AR: 'es', EG: 'ar', SA: 'ar', KR: 'ko',
      AE: 'ar', VN: 'vi', PL: 'pl', MY: 'ms', CO: 'es', ZA: 'en', PT: 'pt', NL: 'nl', PK: 'ur', SE: 'sv',
    };
    const lang = langMap[market] || 'en';
    await i18n.changeLanguage(lang);
    set({ market });
    // Sync market to backend (fire-and-forget)
    api.patch('/notifications/market', { market }).catch(() => {});
  },

  loadStoredMarket: async () => {
    try {
      const stored = await SecureStore.getItemAsync('selectedMarket');
      const validMarkets = ['TR', 'US', 'DE', 'UK', 'IN', 'BR', 'ID', 'RU', 'MX', 'JP', 'PH', 'TH', 'CA', 'AU', 'FR', 'IT', 'ES', 'EG', 'SA', 'KR', 'AR', 'AE', 'VN', 'PL', 'MY', 'CO', 'ZA', 'PT', 'NL', 'PK', 'SE'];
      if (stored && validMarkets.includes(stored)) {
        const langMap: Record<string, string> = {
          TR: 'tr', DE: 'de', BR: 'pt', ID: 'id', RU: 'ru', MX: 'es', JP: 'ja', TH: 'th',
          CA: 'en', AU: 'en', FR: 'fr', IT: 'it',
          ES: 'es', AR: 'es', EG: 'ar', SA: 'ar', KR: 'ko',
          AE: 'ar', VN: 'vi', PL: 'pl', MY: 'ms', CO: 'es', ZA: 'en', PT: 'pt', NL: 'nl', PK: 'ur', SE: 'sv',
        };
        const lang = langMap[stored] || 'en';
        await i18n.changeLanguage(lang);
        set({ market: stored as Market, isLoaded: true });
      } else {
        // First launch — use device locale detection
        const detected = detectMarketFromLocale();
        await SecureStore.setItemAsync('selectedMarket', detected);
        set({ market: detected, isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));
