import api from './client';
import { useMarketStore } from '../store/market';

export interface JobAlert {
  id: string;
  name: string;
  sector?: string | null;
  jobType?: string | null;
  workMode?: string | null;
  experienceLevel?: string | null;
  state?: string | null;
  city?: string | null;
  keywords?: string | null;
  minSalary?: number | null;
  isActive: boolean;
  matchCount?: number;
  createdAt: string;
}

export interface CreateJobAlertInput {
  name: string;
  sector?: string;
  jobType?: string;
  workMode?: string;
  experienceLevel?: string;
  state?: string;
  city?: string;
  keywords?: string;
  minSalary?: number;
}

export async function fetchJobAlerts(): Promise<JobAlert[]> {
  const market = useMarketStore.getState().market;
  const { data } = await api.get<{ data: JobAlert[] }>('/job-alerts', {
    params: { market },
  });
  return data.data;
}

export async function createJobAlert(input: CreateJobAlertInput): Promise<JobAlert> {
  const market = useMarketStore.getState().market;
  const { data } = await api.post<{ data: JobAlert }>('/job-alerts', {
    ...input,
    country: market,
  });
  return data.data;
}

export async function toggleJobAlert(id: string): Promise<JobAlert> {
  const { data } = await api.patch<{ data: JobAlert }>(`/job-alerts/${id}/toggle`);
  return data.data;
}

export async function deleteJobAlert(id: string): Promise<void> {
  await api.delete(`/job-alerts/${id}`);
}
