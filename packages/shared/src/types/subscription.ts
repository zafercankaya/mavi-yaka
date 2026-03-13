import { z } from 'zod';

export enum SubStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  GRACE_PERIOD = 'GRACE_PERIOD',
}

export enum PaymentProvider {
  APPLE = 'APPLE',
  GOOGLE = 'GOOGLE',
}

export const createPlanSchema = z.object({
  name: z.string().min(1).max(100),
  appleProductId: z.string().optional(),
  googleProductId: z.string().optional(),
  priceMonthly: z.number().positive().optional(),
  priceYearly: z.number().positive().optional(),
  maxCompanyFollows: z.number().int().min(-1).default(5),
  maxSavedJobs: z.number().int().min(-1).default(20),
  maxAlerts: z.number().int().min(-1).default(1),
  dailyViewLimit: z.number().int().min(-1).default(20),
  hasAdvancedFilter: z.boolean().default(false),
  adFree: z.boolean().default(false),
});

export type CreatePlanDto = z.infer<typeof createPlanSchema>;

export interface SubscriptionPlanPublic {
  id: string;
  name: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  maxCompanyFollows: number;
  maxSavedJobs: number;
  maxAlerts: number;
  dailyViewLimit: number;
  hasAdvancedFilter: boolean;
  adFree: boolean;
  isActive: boolean;
}

export interface Entitlement {
  planName: string;
  maxCompanyFollows: number;
  maxSavedJobs: number;
  maxAlerts: number;
  dailyViewLimit: number;
  hasAdvancedFilter: boolean;
  adFree: boolean;
  currentCompanyFollowCount: number;
  currentSavedJobCount: number;
  currentAlertCount: number;
  isPremium: boolean;
}
