import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';

// Push notifications temporarily disabled — expo-notifications removed
// to fix iOS provisioning profile build error. Will be re-added when
// capabilities are properly configured in Apple Developer Portal.

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    console.log('Push notifications: temporarily disabled');
  }, [isAuthenticated]);
}
