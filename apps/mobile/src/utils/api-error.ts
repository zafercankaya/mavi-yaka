import type { TFunction } from 'i18next';

/**
 * API hata kodlarını i18n çevirisiyle eşleştirir.
 * API'den gelen message bir error code ise (ör. BRAND_FOLLOW_LIMIT_REACHED)
 * bunu apiErrors namespace'inden çevirir.
 * Eşleşme yoksa fallbackKey kullanılır.
 */
export function getApiErrorMessage(
  err: any,
  t: TFunction,
  fallbackKey: string,
): string {
  const code = err?.response?.data?.message;
  if (code && typeof code === 'string') {
    const translated = t(`apiErrors.${code}`, { defaultValue: '' });
    if (translated) return translated;
  }
  return t(fallbackKey);
}
