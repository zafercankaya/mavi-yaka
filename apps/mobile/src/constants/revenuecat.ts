import { Platform } from 'react-native';

// RevenueCat dashboard'dan alınan API key'ler
// Android: Google Play Store production key
// iOS: App Store production key
export const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_HZJnbWRUqXlqshWBMAVaSvltWlQ',
  android: 'goog_HxzEnPoIpekePvJperlANvFVXRf',
}) as string;
