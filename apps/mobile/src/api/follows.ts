import api from './client';

export interface FollowedCompany {
  id: string;
  companyId: string;
  isFrozen: boolean;
  createdAt: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    sector: string | null;
    market: string;
  };
}

export interface FollowedSector {
  id: string;
  sector: string;
  market: string;
  isFrozen: boolean;
  createdAt: string;
}

export interface FollowsData {
  companies: FollowedCompany[];
  sectors: FollowedSector[];
}

export async function fetchFollows(): Promise<FollowsData> {
  const { data } = await api.get<{ data: FollowsData }>('/follows');
  return data.data;
}

export async function followCompany(companyId: string): Promise<FollowedCompany> {
  const { data } = await api.post<{ data: FollowedCompany }>(`/follows/company/${companyId}`);
  return data.data;
}

export async function unfollowCompany(companyId: string): Promise<void> {
  await api.delete(`/follows/company/${companyId}`);
}

export async function followSector(sector: string): Promise<FollowedSector> {
  const { data } = await api.post<{ data: FollowedSector }>(`/follows/sector/${sector}`);
  return data.data;
}

export async function unfollowSector(sector: string): Promise<void> {
  await api.delete(`/follows/sector/${sector}`);
}
