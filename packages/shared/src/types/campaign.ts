import { z } from 'zod';

export enum Market {
  TR = 'TR',
  US = 'US',
  DE = 'DE',
  UK = 'UK',
  IN = 'IN',
  BR = 'BR',
  ID = 'ID',
  RU = 'RU',
  MX = 'MX',
  JP = 'JP',
  PH = 'PH',
  TH = 'TH',
  CA = 'CA',
  AU = 'AU',
  FR = 'FR',
  IT = 'IT',
  ES = 'ES',
  EG = 'EG',
  SA = 'SA',
  KR = 'KR',
  AR = 'AR',
  AE = 'AE',
  VN = 'VN',
  PL = 'PL',
  MY = 'MY',
  CO = 'CO',
  ZA = 'ZA',
  PT = 'PT',
  NL = 'NL',
  PK = 'PK',
  SE = 'SE',
}

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  HIDDEN = 'HIDDEN',
}

export enum CampaignSort {
  NEWEST = 'newest',
  ENDING_SOON = 'ending_soon',
  DISCOUNT_HIGH = 'discount_high',
  POPULARITY = 'popularity',
}

export const campaignFilterSchema = z.object({
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.nativeEnum(CampaignStatus).optional(),
  search: z.string().max(200).optional(),
  sort: z.nativeEnum(CampaignSort).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  market: z.nativeEnum(Market).optional(),
});

export type CampaignFilter = z.infer<typeof campaignFilterSchema>;

export interface CampaignListItem {
  id: string;
  title: string;
  brandId: string;
  brandName: string;
  brandLogoUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  discountRate: number | null;
  promoCode: string | null;
  imageUrls: string[];
  sourceUrl: string;
  startDate: string | null;
  endDate: string | null;
  status: CampaignStatus;
  createdAt: string;
}

export interface CampaignDetail extends CampaignListItem {
  description: string | null;
  canonicalUrl: string | null;
  updatedAt: string;
}

export interface BrandPublic {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  market?: Market;
}

export interface CategoryPublic {
  id: string;
  name: string;
  slug: string;
  iconName: string | null;
  sortOrder: number;
}
