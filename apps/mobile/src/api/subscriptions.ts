import api from './client';
import { useMarketStore } from '../store/market';

const CURRENCY_SYMBOL: Record<string, string> = {
  TRY: '₺', USD: '$', EUR: '€', GBP: '£', JPY: '¥', KRW: '₩',
  BRL: 'R$', MXN: 'MX$', ARS: 'AR$', RUB: '₽', INR: '₹',
  IDR: 'Rp', PHP: '₱', THB: '฿', CAD: 'C$', AUD: 'A$',
  EGP: 'E£', SAR: 'SR',
};

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOL[currency] || currency;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  market: string;
  currency: string;
  appleProductId: string | null;
  googleProductId: string | null;
  priceMonthly: number | null;
  priceYearly: number | null;
  maxCompanyFollows: number;
  maxSavedJobs: number;
  dailyViewLimit: number;
  hasAdvancedFilter: boolean;
  adFree: boolean;
  weeklyDigest: boolean;
}

export interface Entitlement {
  planName: string;
  maxCompanyFollows: number;
  maxSavedJobs: number;
  dailyViewLimit: number;
  hasAdvancedFilter: boolean;
  adFree: boolean;
  weeklyDigest: boolean;
  currentCompanyFollowCount: number;
  frozenCompanyFollowCount: number;
  currentSavedJobCount: number;
  frozenSavedJobCount: number;
  isPremium: boolean;
}

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  const market = useMarketStore.getState().market;
  const { data } = await api.get('/subscriptions/plans', { params: { market } });
  return data.data;
}

export async function fetchEntitlement(): Promise<Entitlement> {
  const { data } = await api.get('/subscriptions/entitlement');
  return data.data;
}

export async function verifyReceipt(
  provider: 'APPLE' | 'GOOGLE',
  receipt: string,
  productId: string,
) {
  const { data } = await api.post('/subscriptions/verify', {
    provider,
    receipt,
    productId,
  });
  return data.data;
}

export async function cancelSubscription() {
  const { data } = await api.delete('/subscriptions');
  return data.data;
}
