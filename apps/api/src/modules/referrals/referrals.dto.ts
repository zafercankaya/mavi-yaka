import { IsString, Length } from 'class-validator';

export class ApplyReferralDto {
  @IsString()
  @Length(8, 8, { message: 'Davet kodu 8 karakter olmalı' })
  code!: string;
}
