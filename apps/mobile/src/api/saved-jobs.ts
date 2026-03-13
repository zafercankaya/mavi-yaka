import api from './client';
import { JobListing } from './jobs';
import { useMarketStore } from '../store/market';

export interface SavedJobItem {
  id: string;
  userId: string;
  jobListingId: string;
  createdAt: string;
  isFrozen?: boolean;
  jobListing: JobListing;
}

export type SavedJobFilter = 'active' | 'upcoming' | 'past';

export async function fetchSavedJobs(filter: SavedJobFilter = 'active'): Promise<SavedJobItem[]> {
  const market = useMarketStore.getState().market;
  const { data } = await api.get<{ data: SavedJobItem[] }>('/saved-jobs', {
    params: { filter, market },
  });
  return data.data;
}

export async function toggleSavedJob(jobListingId: string): Promise<{ saved: boolean }> {
  const { data } = await api.post<{ data: { saved: boolean } }>(
    `/saved-jobs/${jobListingId}/toggle`,
  );
  return data.data;
}

export async function checkSavedStatus(jobListingId: string): Promise<{ saved: boolean }> {
  const { data } = await api.get<{ data: { saved: boolean } }>(
    `/saved-jobs/${jobListingId}/status`,
  );
  return data.data;
}
