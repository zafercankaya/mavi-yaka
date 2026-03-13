import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminAnalyticsService } from './analytics.service';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminAnalyticsController {
  constructor(private readonly service: AdminAnalyticsService) {}

  @Get('summary')
  async getSummary(@Query('days') days?: string) {
    const d = parseInt(days || '7', 10) || 7;
    return { data: await this.service.getSummary(d) };
  }

  @Get('top-events')
  async getTopEvents(@Query('days') days?: string) {
    const d = parseInt(days || '7', 10) || 7;
    return { data: await this.service.getTopEvents(d) };
  }

  @Get('daily')
  async getDailyStats(@Query('days') days?: string) {
    const d = parseInt(days || '30', 10) || 30;
    return { data: await this.service.getDailyStats(d) };
  }
}
