import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsUrl, IsEnum, MinLength, MaxLength, Matches } from 'class-validator';
import { Market, Sector } from '@prisma/client';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Getir' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'getir' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug sadece küçük harf, rakam ve tire içerebilir' })
  slug!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/getir-logo.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://www.getir.com' })
  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional({ enum: Sector, default: Sector.OTHER })
  @IsEnum(Sector)
  @IsOptional()
  sector?: Sector;

  @ApiPropertyOptional({ enum: Market, default: Market.TR })
  @IsEnum(Market)
  @IsOptional()
  market?: Market;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: '1000-5000' })
  @IsString()
  @IsOptional()
  employeeCount?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {}
