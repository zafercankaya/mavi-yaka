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
  maxBrandFollows: z.number().int().min(-1).default(1),
  maxCampaignFollows: z.number().int().min(-1).default(1),
  dailyNotifLimit: z.number().int().min(-1).default(3),
  hasAdvancedFilter: z.boolean().default(false),
  adFree: z.boolean().default(false),
});

export type CreatePlanDto = z.infer<typeof createPlanSchema>;

export interface SubscriptionPlanPublic {
  id: string;
  name: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  maxBrandFollows: number;
  maxCampaignFollows: number;
  dailyNotifLimit: number;
  hasAdvancedFilter: boolean;
  adFree: boolean;
  isActive: boolean;
}

export interface Entitlement {
  planName: string;
  maxBrandFollows: number;
  maxCampaignFollows: number;
  dailyNotifLimit: number;
  hasAdvancedFilter: boolean;
  adFree: boolean;
  currentBrandFollowCount: number;
  currentCampaignFollowCount: number;
  isPremium: boolean;
}
