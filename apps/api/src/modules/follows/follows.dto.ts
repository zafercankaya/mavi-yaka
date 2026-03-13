import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, ValidateIf } from 'class-validator';

export class CreateFollowDto {
  @ApiPropertyOptional({ description: 'Takip edilecek marka ID' })
  @IsUUID()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Takip edilecek kategori ID' })
  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.brandId)
  categoryId?: string;
}
