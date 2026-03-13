import { z } from 'zod';
import { Market } from './job';

export enum SourceType {
  GOVERNMENT = 'GOVERNMENT',
  JOB_PLATFORM = 'JOB_PLATFORM',
  COMPANY_CAREER = 'COMPANY_CAREER',
}

export enum CrawlMethod {
  HTML = 'HTML',
  API = 'API',
  RSS = 'RSS',
  STRUCTURED_DATA = 'STRUCTURED_DATA',
}

export enum CrawlStatus {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  PARTIAL = 'PARTIAL',
  FAILED = 'FAILED',
}

export const listSelectorsSchema = z.object({
  list: z.string().describe('CSS selector for job listing cards'),
  link: z.string().describe('CSS selector for job detail link'),
  title: z.string().optional().describe('CSS selector for title in list'),
  company: z.string().optional().describe('CSS selector for company name'),
  location: z.string().optional().describe('CSS selector for location'),
  salary: z.string().optional().describe('CSS selector for salary'),
  jobType: z.string().optional().describe('CSS selector for job type tag'),
});

export const detailSelectorsSchema = z.object({
  title: z.string().describe('CSS selector for job title'),
  company: z.string().optional().describe('CSS selector for company name'),
  location: z.string().optional().describe('CSS selector for location'),
  salary: z.string().optional().describe('CSS selector for salary range'),
  jobType: z.string().optional().describe('CSS selector for employment type'),
  workMode: z.string().optional().describe('CSS selector for work mode'),
  description: z.string().optional().describe('CSS selector for description'),
  requirements: z.string().optional().describe('CSS selector for requirements'),
  benefits: z.string().optional().describe('CSS selector for benefits'),
  deadline: z.string().optional().describe('CSS selector for application deadline'),
  postedDate: z.string().optional().describe('CSS selector for posted date'),
  image: z.string().optional().describe('CSS selector for job/company image'),
  experience: z.string().optional().describe('CSS selector for experience level'),
});

export type ListSelectors = z.infer<typeof listSelectorsSchema>;
export type DetailSelectors = z.infer<typeof detailSelectorsSchema>;

export const createSourceSchema = z.object({
  companyId: z.string().uuid(),
  name: z.string().min(1).max(200),
  type: z.nativeEnum(SourceType).default(SourceType.COMPANY_CAREER),
  crawlMethod: z.nativeEnum(CrawlMethod),
  seedUrls: z.array(z.string().url()).min(1).max(20),
  maxDepth: z.number().int().min(1).max(3).default(2),
  selectors: listSelectorsSchema.optional(),
  detailSelectors: detailSelectorsSchema.optional(),
  schedule: z.string().default('0 3 * * *'),
  agingDays: z.number().int().min(1).max(90).default(14),
  market: z.nativeEnum(Market).default(Market.TR),
});

export type CreateSourceDto = z.infer<typeof createSourceSchema>;

export interface CrawlSourcePublic {
  id: string;
  companyId: string;
  companyName: string;
  name: string;
  type: SourceType;
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
  jobsFound: number;
  jobsNew: number;
  jobsUpdated: number;
  errorMessage: string | null;
  durationMs: number | null;
  createdAt: string;
}
