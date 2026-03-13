import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import '../src/i18n';
import { useAuthStore } from '../src/store/auth';
import { useMarketStore } from '../src/store/market';
import { useNotifications } from '../src/hooks/useNotifications';
import { useRevenueCatInit } from '../src/hooks/useRevenueCat';
import { useStoreReviewInit } from '../src/hooks/useStoreReview';
import { trackEvent } from '../src/hooks/useAnalytics';
import { Colors } from '../src/constants/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});

function RootLayout() {
  const { t } = useTranslation();
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);
  const loadStoredMarket = useMarketStore((s) => s.loadStoredMarket);

  useEffect(() => {
    loadStoredAuth();
    loadStoredMarket();
  }, []);

  // Initialize push notifications
  useNotifications();

  // Initialize RevenueCat
  useRevenueCatInit();

  // Track app opens for store review prompt
  useStoreReviewInit();

  // Analytics: track app open
  useEffect(() => {
    trackEvent('app_open');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerTitleStyle: { fontWeight: '600' },
            headerBackTitle: t('common.back'),
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="job/[id]"
            options={{ title: t('job.detail') }}
          />
          <Stack.Screen
            name="subscription"
            options={{ title: t('subscription.title') }}
          />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;
