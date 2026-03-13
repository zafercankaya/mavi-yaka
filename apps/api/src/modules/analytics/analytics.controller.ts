import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto } from './analytics.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @UseGuards(OptionalJwtAuthGuard)
  async trackEvents(
    @Request() req: any,
    @Body() dto: TrackEventDto,
  ) {
    const userId = req.user?.sub || null;
    await this.analyticsService.trackEvents(userId, dto.events);
    return { ok: true };
  }
}
