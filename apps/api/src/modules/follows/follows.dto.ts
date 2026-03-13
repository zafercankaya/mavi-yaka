import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Sector } from '@prisma/client';

export class FollowSectorParamDto {
  @ApiProperty({ description: 'Takip edilecek sektör', enum: Sector })
  @IsEnum(Sector)
  sector!: Sector;
}
