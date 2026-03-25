import { Platform } from 'react-native';

// RevenueCat dashboard'dan alınan API key'ler — Mavi Yaka apps
// iOS: App Store (app0dd60a6563)
// Android: Play Store (app52c509df32)
export const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_SJlQhuqybYaexxTmWfQiYjrTfAI',
  android: 'goog_petUdlBLneRiMBFVnvsPoETPJun',
}) as string;
