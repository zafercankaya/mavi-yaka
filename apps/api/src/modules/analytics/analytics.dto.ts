import { IsArray, IsString, IsOptional, IsObject, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class EventItem {
  @IsString()
  event!: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;

  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class TrackEventDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => EventItem)
  events!: EventItem[];
}
