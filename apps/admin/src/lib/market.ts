'use client';

import { useState, useEffect, useCallback } from 'react';

export type Market = 'TR' | 'US' | 'DE' | 'UK' | 'IN' | 'BR' | 'ID' | 'RU' | 'MX' | 'JP' | 'PH' | 'TH' | 'CA' | 'AU' | 'FR' | 'IT' | 'ES' | 'EG' | 'SA' | 'KR' | 'AR' | 'AE' | 'VN' | 'PL' | 'MY' | 'CO' | 'ZA' | 'PT' | 'NL' | 'PK' | 'SE';

const STORAGE_KEY = 'adminMarket';

function getStoredMarket(): Market {
  if (typeof window === 'undefined') return 'TR';
  return (localStorage.getItem(STORAGE_KEY) as Market) || 'TR';
}

/**
 * Global market state for admin panel.
 * Uses localStorage for persistence and a custom event for cross-component sync.
 */
export function useMarket() {
  const [market, setMarketState] = useState<Market>(getStoredMarket);

  // Listen for changes from other components
  useEffect(() => {
    const handler = () => setMarketState(getStoredMarket());
    window.addEventListener('market-change', handler);
    return () => window.removeEventListener('market-change', handler);
  }, []);

  const setMarket = useCallback((m: Market) => {
    localStorage.setItem(STORAGE_KEY, m);
    setMarketState(m);
    window.dispatchEvent(new Event('market-change'));
  }, []);

  return { market, setMarket } as const;
}

/** Append market param to URLSearchParams if not 'all' */
export function appendMarketParam(params: URLSearchParams, market: Market) {
  params.set('market', market);
}
