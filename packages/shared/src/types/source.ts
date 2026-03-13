import { z } from 'zod';
import { Market } from './campaign';

export enum CrawlMethod {
  CAMPAIGN = 'CAMPAIGN',
  PRODUCT = 'PRODUCT',
  RSS = 'RSS',
  FEED = 'FEED',
  API = 'API',
}

// Keep SourceType as alias for backward compatibility during migration
export const SourceType = CrawlMethod;
export type SourceType = CrawlMethod;

export enum CrawlStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
}

export const selectorsConfigSchema = z.object({
  list: z.string().describe('CSS selector for campaign card list'),
  link: z.string().describe('CSS selector for campaign link within card'),
  title: z.string().describe('CSS selector for title on detail page'),
  description: z.string().optional().describe('CSS selector for description'),
  image: z.string().optional().describe('CSS selector for campaign image'),
  startDate: z.string().optional().describe('CSS selector for start date'),
  endDate: z.string().optional().describe('CSS selector for end date'),
  discountRate: z.string().optional().describe('CSS selector for discount rate'),
});

export type SelectorsConfig = z.infer<typeof selectorsConfigSchema>;

export const createSourceSchema = z.object({
  brandId: z.string().uuid(),
  name: z.string().min(1).max(200),
  crawlMethod: z.nativeEnum(CrawlMethod),
  seedUrls: z.array(z.string().url()).min(1).max(20),
  maxDepth: z.number().int().min(1).max(3).default(2),
  selectors: selectorsConfigSchema.optional(),
  schedule: z.string().default('0 3 * * *'),
  agingDays: z.number().int().min(1).max(90).default(7),
  market: z.nativeEnum(Market).default(Market.TR),
});

export type CreateSourceDto = z.infer<typeof createSourceSchema>;

export interface CrawlSourcePublic {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  crawlMethod: CrawlMethod;
  seedUrls: string[];
  schedule: string;
  agingDays: number;
  market: Market;
  isActive: boolean;
  lastCrawledAt: string | null;
}

export interface CrawlLogPublic {
  id: string;
  sourceId: string;
  sourceName: string;
  status: CrawlStatus;
  campaignsFound: number;
  campaignsNew: number;
  campaignsUpdated: number;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
}
