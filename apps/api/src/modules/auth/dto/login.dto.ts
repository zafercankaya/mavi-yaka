import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@maviyaka.app' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin123456' })
  @IsString()
  password!: string;
}
