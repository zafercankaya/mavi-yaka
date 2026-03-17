import api from './client';
import { useMarketStore } from '../store/market';

export interface JobListing {
  id: string;
  title: string;
  description: string | null;
  companyId: string;
  company: { name: string; logoUrl: string | null; sector?: string } | null;
  sourceUrl: string;
  imageUrl: string | null;
  deadline: string | null;
  status: string;
  country: string;
  state: string | null;
  city: string | null;
  sector: string | null;
  jobType: string | null;
  workMode: string | null;
  experienceLevel: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: string | null;
  requirements: string | null;
  benefits: string | null;
  postedDate: string | null;
  createdAt: string;
}

interface JobListResponse {
  data: JobListing[];
  meta: {
    nextCursor: string | null;
    hasMore: boolean;
    total: number;
  };
}

export interface JobFilters {
  companyId?: string;
  companyIds?: string[];
  sector?: string;
  jobType?: string;
  workMode?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  state?: string;
  city?: string;
  search?: string;
  sort?: 'newest' | 'recommended' | 'deadline' | 'posted_today' | 'salary_high' | 'salary_low' | 'nearest';
  followingOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export async function fetchJobs(filters: JobFilters = {}): Promise<JobListResponse> {
  const params: Record<string, string> = {};
  params.country = useMarketStore.getState().market;
  if (filters.companyIds && filters.companyIds.length > 0) {
    params.companyIds = filters.companyIds.join(',');
  } else if (filters.companyId) {
    params.companyId = filters.companyId;
  }
  if (filters.sector) params.sector = filters.sector;
  if (filters.jobType) params.jobType = filters.jobType;
  if (filters.workMode) params.workMode = filters.workMode;
  if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
  if (filters.salaryMin) params.salaryMin = String(filters.salaryMin);
  if (filters.salaryMax) params.salaryMax = String(filters.salaryMax);
  if (filters.state) params.state = filters.state;
  if (filters.city) params.city = filters.city;
  if (filters.search) params.search = filters.search;
  if (filters.sort) params.sort = filters.sort;
  if (filters.followingOnly) params.followingOnly = 'true';
  if (filters.cursor) params.cursor = filters.cursor;
  if (filters.limit) params.limit = String(filters.limit);

  const { data } = await api.get<JobListResponse>('/jobs', { params });
  return data;
}

export async function fetchJobById(id: string): Promise<{ data: JobListing }> {
  const { data } = await api.get<{ data: JobListing }>(`/jobs/${id}`);
  return data;
}
