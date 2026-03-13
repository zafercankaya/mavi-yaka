import { z } from 'zod';
import { Market, Sector, JobType, WorkMode } from './job';

export const createAlertSchema = z.object({
  name: z.string().min(1).max(200),
  country: z.nativeEnum(Market),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  sector: z.nativeEnum(Sector).optional(),
  jobType: z.nativeEnum(JobType).optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  keywords: z.string().max(200).optional(),
  salaryMin: z.number().positive().optional(),
});

export type CreateAlertDto = z.infer<typeof createAlertSchema>;

export interface JobAlertPublic {
  id: string;
  name: string;
  country: Market;
  state: string | null;
  city: string | null;
  sector: Sector | null;
  jobType: JobType | null;
  workMode: WorkMode | null;
  keywords: string | null;
  salaryMin: number | null;
  isActive: boolean;
  lastNotifiedAt: string | null;
  matchCount?: number;
  createdAt: string;
}
