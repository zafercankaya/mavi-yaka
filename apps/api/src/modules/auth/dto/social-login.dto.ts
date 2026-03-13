import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class SocialLoginDto {
  @ApiProperty({ enum: ['GOOGLE', 'APPLE'], example: 'GOOGLE' })
  @IsEnum(['GOOGLE', 'APPLE'])
  provider!: 'GOOGLE' | 'APPLE';

  @ApiProperty({ description: 'Google veya Apple ID token' })
  @IsString()
  @MinLength(1)
  idToken!: string;

  @ApiPropertyOptional({ description: 'Apple Sign In ile gelen kullanıcı adı' })
  @IsOptional()
  @IsString()
  displayName?: string;
}
