import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsBoolean, IsNumber, IsInt, IsEnum, Min,
  MinLength, MaxLength,
} from 'class-validator';
import { Market } from '@prisma/client';

export class CreatePlanDto {
  @ApiProperty({ example: 'Premium' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ enum: Market, default: Market.TR, description: 'Market (TR veya US)' })
  @IsEnum(Market)
  @IsOptional()
  market?: Market;

  @ApiPropertyOptional({ example: 'TRY', description: 'Para birimi (TRY, USD vb.)' })
  @IsString()
  @MaxLength(3)
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: 'com.indirim.premium.monthly' })
  @IsString()
  @IsOptional()
  appleProductId?: string;

  @ApiPropertyOptional({ example: 'premium_monthly' })
  @IsString()
  @IsOptional()
  googleProductId?: string;

  @ApiPropertyOptional({ example: 49.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceMonthly?: number;

  @ApiPropertyOptional({ example: 399.99 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  priceYearly?: number;

  @ApiPropertyOptional({ example: -1, description: '-1 = sınırsız (marka takip limiti)' })
  @IsInt()
  @Min(-1)
  @IsOptional()
  maxBrandFollows?: number;

  @ApiPropertyOptional({ example: -1, description: '-1 = sınırsız (kampanya takip limiti)' })
  @IsInt()
  @Min(-1)
  @IsOptional()
  maxCampaignFollows?: number;

  @ApiPropertyOptional({ example: -1, description: '-1 = sınırsız' })
  @IsInt()
  @Min(-1)
  @IsOptional()
  dailyNotifLimit?: number;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  hasAdvancedFilter?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  adFree?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Haftalık bildirim özeti' })
  @IsBoolean()
  @IsOptional()
  weeklyDigest?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
