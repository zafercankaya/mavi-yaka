import { useQuery } from '@tanstack/react-query';
import { fetchEntitlement } from '../api/subscriptions';
import { useAuthStore } from '../store/auth';

/**
 * Returns true if the user has an ad-free subscription (Premium).
 * Free users and unauthenticated users see ads.
 */
export function useAdFree(): boolean {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data } = useQuery({
    queryKey: ['entitlement'],
    queryFn: fetchEntitlement,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  return data?.adFree ?? false;
}
