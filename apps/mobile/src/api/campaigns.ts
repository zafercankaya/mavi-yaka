import api from './client';
import { useMarketStore } from '../store/market';

export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  brandId: string;
  brand: { name: string; logoUrl: string | null } | null;
  category: { name: string; nameEn: string | null; nameDe: string | null; slug: string } | null;
  sourceUrl: string;
  discountRate: number | null;
  promoCode: string | null;
  imageUrls: string[];
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
}

interface CampaignListResponse {
  data: Campaign[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

export interface CampaignFilters {
  brandId?: string;
  brandIds?: string[];
  categoryId?: string;
  search?: string;
  sort?: 'newest' | 'recommended' | 'ending_soon' | 'discount_high' | 'last_24h' | 'has_promo';
  followingOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export async function fetchCampaigns(filters: CampaignFilters = {}): Promise<CampaignListResponse> {
  const params: Record<string, string> = {};
  params.market = useMarketStore.getState().market;
  if (filters.brandIds && filters.brandIds.length > 0) {
    params.brandIds = filters.brandIds.join(',');
  } else if (filters.brandId) {
    params.brandId = filters.brandId;
  }
  if (filters.categoryId) params.categoryId = filters.categoryId;
  if (filters.search) params.search = filters.search;
  if (filters.sort) params.sort = filters.sort;
  if (filters.followingOnly) params.followingOnly = 'true';
  if (filters.cursor) params.cursor = filters.cursor;
  if (filters.limit) params.limit = String(filters.limit);

  const { data } = await api.get<CampaignListResponse>('/campaigns', { params });
  return data;
}

export async function fetchCampaignById(id: string): Promise<{ data: Campaign }> {
  const { data } = await api.get<{ data: Campaign }>(`/campaigns/${id}`);
  return data;
}
