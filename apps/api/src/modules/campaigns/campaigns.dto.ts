import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional, IsString, IsUUID, IsEnum, IsInt, Min, Max, MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CampaignStatus, Market } from '@prisma/client';

export enum CampaignSort {
  NEWEST = 'newest',
  RECOMMENDED = 'recommended',
  ENDING_SOON = 'ending_soon',
  DISCOUNT_HIGH = 'discount_high',
  LAST_24H = 'last_24h',
  HAS_PROMO = 'has_promo',
}

export class CampaignQueryDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Virgülle ayrılmış marka ID listesi (çoklu marka filtresi)' })
  @IsString()
  @IsOptional()
  brandIds?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus;

  @ApiPropertyOptional({ description: 'Arama terimi' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ enum: CampaignSort, default: CampaignSort.NEWEST })
  @IsEnum(CampaignSort)
  @IsOptional()
  sort?: CampaignSort;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsString()
  @IsOptional()
  cursor?: string;

  @ApiPropertyOptional({ description: 'Sadece takip edilen markaların kampanyaları' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  followingOnly?: boolean;

  @ApiPropertyOptional({ enum: Market, description: 'Market filtresi (TR veya US)' })
  @IsEnum(Market)
  @IsOptional()
  market?: Market;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 20;
}
