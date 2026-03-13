import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../src/store/auth';
import { Colors } from '../src/constants/theme';

export default function Index() {
  const { isLoading, isAuthenticated, isGuest } = useAuthStore();
  const router = useRouter();
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    // Root Layout'un mount olmasını bekle
    setIsLayoutReady(true);
  }, []);

  useEffect(() => {
    if (!isLayoutReady || isLoading) return;

    if (isAuthenticated || isGuest) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isLayoutReady, isLoading, isAuthenticated, isGuest]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
