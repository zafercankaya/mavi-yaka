import { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { REVENUECAT_API_KEY } from '../constants/revenuecat';
import { useAuthStore } from '../store/auth';

const isExpoGo = Constants.appOwnership === 'expo';

let Purchases: any = null;
let LOG_LEVEL: any = null;
if (!isExpoGo) {
  try {
    const mod = require('react-native-purchases');
    Purchases = mod.default;
    LOG_LEVEL = mod.LOG_LEVEL;
  } catch {}
}

type PurchasesOfferings = any;
type PurchasesPackage = any;
type CustomerInfo = any;

let isConfigured = false;

/**
 * RevenueCat SDK'yı başlatır ve kullanıcıyı tanımlar.
 * App root layout'ta çağrılmalı.
 */
export function useRevenueCatInit() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!Purchases || isExpoGo) return;
    if (!isConfigured && REVENUECAT_API_KEY) {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      try {
        Purchases.configure({ apiKey: REVENUECAT_API_KEY });
        isConfigured = true;
      } catch (err) {
        console.warn('[RevenueCat] configure failed (Expo Go?):', err);
      }
    }
  }, []);

  // Login sonrası kullanıcıyı RevenueCat'e tanıt
  useEffect(() => {
    if (isAuthenticated && user?.id && isConfigured && Purchases) {
      Purchases.logIn(user.id).catch((err: any) => {
        console.error('[RevenueCat] logIn hatası:', err);
      });
    }
  }, [isAuthenticated, user?.id]);
}

/**
 * RevenueCat offering'lerini (satın alınabilir paketler) getirir.
 */
export function useOfferings() {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured || !Purchases) {
      setLoading(false);
      return;
    }

    Purchases.getOfferings()
      .then((offs: PurchasesOfferings) => setOfferings(offs))
      .catch((err: any) => console.error('[RevenueCat] getOfferings hatası:', err))
      .finally(() => setLoading(false));
  }, []);

  return { offerings, loading };
}

/**
 * Bir RevenueCat paketini satın alır.
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  if (!Purchases) throw new Error('RevenueCat not available');
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

/**
 * Önceki satın almaları geri yükler.
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  if (!Purchases) throw new Error('RevenueCat not available');
  return Purchases.restorePurchases();
}
