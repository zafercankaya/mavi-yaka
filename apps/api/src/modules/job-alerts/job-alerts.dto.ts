import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsBoolean, IsNumber, IsEnum,
  MinLength, MaxLength, Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { Market, Sector, JobType, WorkMode } from '@prisma/client';

export class CreateJobAlertDto {
  @ApiProperty({ description: 'Alarm adı', example: 'İstanbul Lojistik' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name!: string;

  @ApiProperty({ enum: Market, description: 'Ülke' })
  @IsEnum(Market)
  country!: Market;

  @ApiPropertyOptional({ description: 'Eyalet/İl' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  state?: string;

  @ApiPropertyOptional({ description: 'Şehir/İlçe' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  city?: string;

  @ApiPropertyOptional({ enum: Sector, description: 'Sektör filtresi' })
  @IsEnum(Sector)
  @IsOptional()
  sector?: Sector;

  @ApiPropertyOptional({ enum: JobType, description: 'İş tipi filtresi' })
  @IsEnum(JobType)
  @IsOptional()
  jobType?: JobType;

  @ApiPropertyOptional({ enum: WorkMode, description: 'Çalışma modu filtresi' })
  @IsEnum(WorkMode)
  @IsOptional()
  workMode?: WorkMode;

  @ApiPropertyOptional({ description: 'Anahtar kelimeler (virgülle ayrılmış)' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  keywords?: string;

  @ApiPropertyOptional({ description: 'Minimum maaş filtresi' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;
}

export class UpdateJobAlertDto extends PartialType(CreateJobAlertDto) {
  @ApiPropertyOptional({ description: 'Alarm aktif/pasif' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
