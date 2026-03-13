import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsUUID, IsEnum, IsInt, IsObject,
  Min, Max, MinLength, MaxLength, IsBoolean, IsArray, IsUrl,
} from 'class-validator';
import { CrawlMethod, Market } from '@prisma/client';

export class CreateSourceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  brandId!: string;

  @ApiProperty({ example: 'Trendyol Kampanyalar' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ enum: CrawlMethod, example: 'CAMPAIGN' })
  @IsEnum(CrawlMethod)
  crawlMethod!: CrawlMethod;

  @ApiProperty({
    example: ['https://www.trendyol.com/kampanyalar'],
    description: 'Crawl edilecek URL listesi (1-20 arası)',
  })
  @IsArray()
  @IsUrl({}, { each: true })
  seedUrls!: string[];

  @ApiPropertyOptional({ example: 2, default: 2 })
  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  maxDepth?: number;

  @ApiPropertyOptional({
    example: {
      list: '.campaign-card',
      link: 'a.card-link',
      title: 'h1.campaign-title',
      description: '.campaign-desc',
      image: 'img.campaign-img',
    },
  })
  @IsObject()
  @IsOptional()
  selectors?: Record<string, string>;

  @ApiPropertyOptional({ example: '0 3 * * *', default: '0 3 * * *' })
  @IsString()
  @IsOptional()
  schedule?: string;

  @ApiPropertyOptional({ example: 7, default: 7 })
  @IsInt()
  @Min(1)
  @Max(90)
  @IsOptional()
  agingDays?: number;

  @ApiPropertyOptional({ enum: Market, default: Market.TR })
  @IsEnum(Market)
  @IsOptional()
  market?: Market;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSourceDto extends PartialType(CreateSourceDto) {}
