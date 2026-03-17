import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MinLength } from 'class-validator';

export class VerifyReceiptDto {
  @ApiProperty({ enum: ['APPLE', 'GOOGLE'] })
  @IsEnum(['APPLE', 'GOOGLE'])
  provider!: 'APPLE' | 'GOOGLE';

  @ApiProperty({ description: 'Store receipt / purchase token' })
  @IsString()
  @MinLength(1)
  receipt!: string;

  @ApiProperty({ description: 'Product ID (e.g. com.maviyaka.premium.monthly)' })
  @IsString()
  @MinLength(1)
  productId!: string;
}
