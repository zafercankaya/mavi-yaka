import api from './client';
import { useMarketStore } from '../store/market';

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  sector: string | null;
  description: string | null;
  employeeCount: string | null;
  jobCount?: number;
}

export async function fetchCompanies(sector?: string): Promise<{ data: Company[] }> {
  const market = useMarketStore.getState().market;
  const params: Record<string, string> = { market };
  if (sector) params.sector = sector;
  const { data } = await api.get<{ data: Company[] }>('/companies', { params });
  return data;
}

export async function fetchCompanyById(id: string): Promise<{ data: Company }> {
  const { data } = await api.get<{ data: Company }>(`/companies/${id}`);
  return data;
}
