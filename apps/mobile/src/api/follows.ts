import api from './client';

export interface Follow {
  id: string;
  brandId: string | null;
  categoryId: string | null;
  isFrozen: boolean;
  brand: { name: string; logoUrl: string | null } | null;
  category: { name: string; slug: string } | null;
  createdAt: string;
}

export async function fetchFollows(): Promise<{ data: Follow[] }> {
  const { data } = await api.get<{ data: Follow[] }>('/follows');
  return data;
}

export async function createFollow(params: { brandId?: string; categoryId?: string }): Promise<{ data: Follow }> {
  const { data } = await api.post<{ data: Follow }>('/follows', params);
  return data;
}

export async function deleteFollow(id: string): Promise<void> {
  await api.delete(`/follows/${id}`);
}
