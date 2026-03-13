import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MinLength, MaxLength, Matches, Min, Max } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Elektronik' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'elektronik' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;

  @ApiPropertyOptional({ example: 'Electronics', description: 'English name for US/UK market' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  nameEn?: string;

  @ApiPropertyOptional({ example: 'Elektronik', description: 'German name for DE market' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  nameDe?: string;

  @ApiPropertyOptional({ example: 'devices' })
  @IsString()
  @IsOptional()
  iconName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(999)
  @IsOptional()
  sortOrder?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
