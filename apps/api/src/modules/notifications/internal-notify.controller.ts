import { Controller, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationsService } from './notifications.service';
import { InternalKeyGuard } from '../../common/guards/internal-key.guard';

class JobItemDto {
  @IsString()
  id!: string;

  @IsString()
  title!: string;
}

class InternalNotifyDto {
  @IsString()
  companyId!: string;

  @IsString()
  @IsOptional()
  sector?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobItemDto)
  jobListings!: JobItemDto[];
}

@Controller('internal')
@ApiTags('Internal')
@UseGuards(InternalKeyGuard)
export class InternalNotifyController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('notify')
  @ApiOperation({ summary: 'Internal: crawler bildirim webhook' })
  async notify(@Body() dto: InternalNotifyDto) {
    await this.notificationsService.notifyNewJobListings(
      dto.companyId,
      (dto.sector as any) ?? null,
      dto.jobListings,
    );

    return { data: { dispatched: true } };
  }

  /**
   * Scheduled: Win-back bildirimleri (7 gün inaktif kullanıcılar).
   * Crawler scheduler'dan günlük çağrılır.
   */
  @Post('scheduled/win-back')
  @ApiOperation({ summary: 'Internal: win-back bildirimleri gönder' })
  async sendWinBack(@Query('markets') marketsParam?: string) {
    const markets = marketsParam ? marketsParam.split(',') as any[] : undefined;
    const result = await this.notificationsService.sendWinBackNotifications(markets);
    return { data: result };
  }

  /**
   * Scheduled: Haftalık özet bildirimleri (Premium kullanıcılar).
   * Haftada bir çağrılır (Pazar günü).
   */
  @Post('scheduled/weekly-summary')
  @ApiOperation({ summary: 'Internal: haftalık özet bildirimleri gönder' })
  async sendWeeklySummary(@Query('markets') marketsParam?: string) {
    const markets = marketsParam ? marketsParam.split(',') as any[] : undefined;
    const result = await this.notificationsService.sendWeeklySummary(markets);
    return { data: result };
  }

  /**
   * Scheduled: Favori kampanya bitiş bildirimleri.
   * Günlük çağrılır — yarın biten kampanyaları bildirir.
   */
  @Post('scheduled/expiring-favorites')
  @ApiOperation({ summary: 'Internal: favori bitiş bildirimleri gönder' })
  async sendExpiringFavorites(@Query('markets') marketsParam?: string) {
    const markets = marketsParam ? marketsParam.split(',') as any[] : undefined;
    const result = await this.notificationsService.sendExpiringSavedJobNotifications(markets);
    return { data: result };
  }
}
