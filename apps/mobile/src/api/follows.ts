import api from './client';

export interface Follow {
  id: string;
  companyId: string | null;
  sector: string | null;
  isFrozen: boolean;
  company: { name: string; logoUrl: string | null } | null;
  createdAt: string;
}

export async function fetchFollows(): Promise<{ data: Follow[] }> {
  const { data } = await api.get<{ data: Follow[] }>('/follows');
  return data;
}

export async function createFollow(params: { companyId?: string; sector?: string }): Promise<{ data: Follow }> {
  const { data } = await api.post<{ data: Follow }>('/follows', params);
  return data;
}

export async function deleteFollow(id: string): Promise<void> {
  await api.delete(`/follows/${id}`);
}
