import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Expo Go fiziksel cihazda: bilgisayarın local IP'sini kullan
// Android emülatör: 10.0.2.2, iOS simülatör: localhost
function getDevApiUrl(): string {
  // Expo Go'da debuggerHost'tan IP alınabilir
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];

  // Tunnel modunda debuggerHost tunnel domain olur, API'ye erişilemez
  // Bu durumda veya fiziksel cihazda local IP kullan
  if (debuggerHost && !debuggerHost.includes('exp.direct') && !debuggerHost.includes('ngrok')) {
    return `http://${debuggerHost}:3000`;
  }

  // Fiziksel cihaz veya tunnel: local network IP
  return 'http://192.168.68.108:3000';
}

// Dev'de de production API kullan (local network sorunlarını atla)
export const API_BASE_URL = 'https://mavi-yaka-api.onrender.com';

if (__DEV__) {
  console.log('[API] Base URL:', API_BASE_URL);
  console.log('[API] hostUri:', Constants.expoConfig?.hostUri);

  // Direct fetch test to diagnose networking
  fetch(`${API_BASE_URL}/categories`)
    .then((r) => r.json())
    .then((d) => console.log('[API TEST] fetch OK, categories:', d.data?.length))
    .catch((e) => console.error('[API TEST] fetch FAILED:', e.message));
}
