import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional, IsString, IsUUID, IsEnum, IsInt, IsNumber,
  Min, Max, MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  JobStatus, Market, Sector, JobType, WorkMode, ExperienceLevel,
} from '@prisma/client';

export enum JobSort {
  NEWEST = 'newest',
  SALARY_HIGH = 'salary_high',
  SALARY_LOW = 'salary_low',
  ENDING_SOON = 'ending_soon',
  DEADLINE = 'deadline',
  POSTED_TODAY = 'posted_today',
  NEAREST = 'nearest',
  RECOMMENDED = 'recommended',
}

export class JobQueryDto {
  @ApiPropertyOptional({ description: 'Search term (title, description, company)' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ enum: Market, description: 'Country filter' })
  @IsEnum(Market)
  @IsOptional()
  country?: Market;

  @ApiPropertyOptional({ description: 'State / province filter' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  state?: string;

  @ApiPropertyOptional({ description: 'City filter' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  city?: string;

  @ApiPropertyOptional({ enum: Sector, description: 'Sector filter' })
  @IsEnum(Sector)
  @IsOptional()
  sector?: Sector;

  @ApiPropertyOptional({ enum: JobType, description: 'Job type filter' })
  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType;

  @ApiPropertyOptional({ enum: WorkMode, description: 'Work mode filter' })
  @IsEnum(WorkMode)
  @IsOptional()
  workMode?: WorkMode;

  @ApiPropertyOptional({ enum: ExperienceLevel, description: 'Experience level filter' })
  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ description: 'Company ID filter' })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({ description: 'Comma-separated company IDs' })
  @IsString()
  @IsOptional()
  companyIds?: string;

  @ApiPropertyOptional({ description: 'Minimum salary filter' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional({ description: 'Maximum salary filter' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @ApiPropertyOptional({ description: 'Show jobs posted within last N days' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  @IsOptional()
  postedWithinDays?: number;

  @ApiPropertyOptional({ enum: JobStatus, default: JobStatus.ACTIVE })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional({ description: 'Only jobs from followed companies' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  followingOnly?: boolean;

  @ApiPropertyOptional({ enum: JobSort, default: JobSort.NEWEST })
  @IsEnum(JobSort)
  @IsOptional()
  sort?: JobSort;

  @ApiPropertyOptional({ description: 'User latitude for NEAREST sort' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ description: 'User longitude for NEAREST sort' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional({ description: 'Cursor for pagination (job ID)' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 20;
}
