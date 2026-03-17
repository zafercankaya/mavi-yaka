import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString, IsOptional, IsUUID, IsEnum, IsInt, IsObject,
  Min, Max, MinLength, MaxLength, IsBoolean, IsArray, IsUrl,
} from 'class-validator';
import { CrawlMethod, Market } from '@prisma/client';

export class CreateSourceDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  companyId!: string;

  @ApiProperty({ example: 'Kariyer.net Ilanlar' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ enum: CrawlMethod, example: 'HTML' })
  @IsEnum(CrawlMethod)
  crawlMethod!: CrawlMethod;

  @ApiProperty({
    example: ['https://www.example.com/kariyer'],
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
      list: '.job-card',
      link: 'a.card-link',
      title: 'h1.job-title',
      description: '.job-desc',
      image: 'img.job-img',
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
