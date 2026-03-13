import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { JobStatus, Sector, JobType, WorkMode, ExperienceLevel, SalaryPeriod } from '@prisma/client';

export class UpdateJobListingDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  benefits?: string;

  @ApiPropertyOptional({ enum: JobStatus })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional({ enum: Sector })
  @IsEnum(Sector)
  @IsOptional()
  sector?: Sector;

  @ApiPropertyOptional({ enum: JobType })
  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType;

  @ApiPropertyOptional({ enum: WorkMode })
  @IsEnum(WorkMode)
  @IsOptional()
  workMode?: WorkMode;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  salaryMin?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  salaryMax?: number;

  @ApiPropertyOptional({ enum: SalaryPeriod })
  @IsEnum(SalaryPeriod)
  @IsOptional()
  salaryPeriod?: SalaryPeriod;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  deadline?: string;
}
