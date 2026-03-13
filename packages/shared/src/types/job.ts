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

export enum Sector {
  LOGISTICS_TRANSPORTATION = 'LOGISTICS_TRANSPORTATION',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  CONSTRUCTION = 'CONSTRUCTION',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  AUTOMOTIVE = 'AUTOMOTIVE',
  TEXTILE = 'TEXTILE',
  MINING_ENERGY = 'MINING_ENERGY',
  HEALTHCARE = 'HEALTHCARE',
  HOSPITALITY_TOURISM = 'HOSPITALITY_TOURISM',
  AGRICULTURE = 'AGRICULTURE',
  SECURITY_SERVICES = 'SECURITY_SERVICES',
  FACILITY_MANAGEMENT = 'FACILITY_MANAGEMENT',
  METAL_STEEL = 'METAL_STEEL',
  CHEMICALS_PLASTICS = 'CHEMICALS_PLASTICS',
  ECOMMERCE_CARGO = 'ECOMMERCE_CARGO',
  TELECOMMUNICATIONS = 'TELECOMMUNICATIONS',
  OTHER = 'OTHER',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  DAILY = 'DAILY',
  SEASONAL = 'SEASONAL',
  INTERNSHIP = 'INTERNSHIP',
  CONTRACT = 'CONTRACT',
}

export enum WorkMode {
  ON_SITE = 'ON_SITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum ExperienceLevel {
  NONE = 'NONE',
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
}

export enum SalaryPeriod {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum JobStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REMOVED = 'REMOVED',
}

export enum JobSort {
  NEWEST = 'newest',
  SALARY_HIGH = 'salary_high',
  SALARY_LOW = 'salary_low',
  NEAREST = 'nearest',
  DEADLINE = 'deadline',
}

export const jobFilterSchema = z.object({
  companyId: z.string().uuid().optional(),
  sector: z.nativeEnum(Sector).optional(),
  sectors: z.array(z.nativeEnum(Sector)).optional(),
  jobType: z.nativeEnum(JobType).optional(),
  workMode: z.nativeEnum(WorkMode).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  search: z.string().max(200).optional(),
  sort: z.nativeEnum(JobSort).optional(),
  // Location filters
  country: z.nativeEnum(Market).optional(),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  radiusKm: z.coerce.number().min(1).max(500).optional(),
  // Salary filters
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  salaryCurrency: z.string().max(3).optional(),
  // Time filter
  postedWithinDays: z.coerce.number().int().min(1).max(90).optional(),
  // Pagination
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  market: z.nativeEnum(Market).optional(),
});

export type JobFilter = z.infer<typeof jobFilterSchema>;

export interface JobListItem {
  id: string;
  title: string;
  slug: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string | null;
  sector: Sector;
  jobType: JobType;
  workMode: WorkMode;
  country: Market;
  state: string | null;
  city: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriod | null;
  sourceUrl: string;
  imageUrl: string | null;
  postedDate: string | null;
  deadline: string | null;
  status: JobStatus;
  createdAt: string;
}

export interface JobDetail extends JobListItem {
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  experienceLevel: ExperienceLevel | null;
  latitude: number | null;
  longitude: number | null;
  canonicalUrl: string | null;
  viewCount: number;
  clickCount: number;
  updatedAt: string;
}

export interface CompanyPublic {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  sector: Sector;
  market: Market;
  description: string | null;
  employeeCount: string | null;
}
