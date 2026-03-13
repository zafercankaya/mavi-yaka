import api from './client';
import { Campaign } from './campaigns';
import { useMarketStore } from '../store/market';

interface FavoriteItem {
  id: string;
  userId: string;
  campaignId: string;
  createdAt: string;
  campaign: Campaign;
}

export type FavoriteFilter = 'active' | 'upcoming' | 'past';

export async function fetchFavorites(filter: FavoriteFilter = 'active'): Promise<FavoriteItem[]> {
  const market = useMarketStore.getState().market;
  const { data } = await api.get<{ data: FavoriteItem[] }>('/favorites', {
    params: { filter, market },
  });
  return data.data;
}

export async function toggleFavorite(campaignId: string): Promise<{ favorited: boolean }> {
  const { data } = await api.post<{ data: { favorited: boolean } }>(
    `/favorites/${campaignId}/toggle`,
  );
  return data.data;
}

export async function checkFavoriteStatus(campaignId: string): Promise<{ favorited: boolean }> {
  const { data } = await api.get<{ data: { favorited: boolean } }>(
    `/favorites/${campaignId}/status`,
  );
  return data.data;
}
