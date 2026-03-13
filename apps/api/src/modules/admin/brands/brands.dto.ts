import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUrl, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { Market } from '@prisma/client';

export class CreateBrandDto {
  @ApiProperty({ example: 'Trendyol' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'trendyol' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug sadece küçük harf, rakam ve tire içerebilir' })
  slug!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/trendyol-logo.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.trendyol.com' })
  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  categoryId?: string | null;

  @ApiPropertyOptional({ enum: Market, default: Market.TR })
  @IsEnum(Market)
  @IsOptional()
  market?: Market;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {}
