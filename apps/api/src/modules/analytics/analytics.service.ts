import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventItem } from './analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async trackEvents(userId: string | null, events: EventItem[]) {
    const rows = events.map((e) => ({
      event: e.event,
      userId,
      params: e.params || {},
      timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
    }));

    try {
      await this.prisma.analyticsEvent.createMany({ data: rows });
    } catch (err) {
      this.logger.error('Failed to insert analytics events', err);
    }
  }
}
