import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalEvents, uniqueUsers, topEvent] = await Promise.all([
      this.prisma.analyticsEvent.count({
        where: { timestamp: { gte: since } },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['userId'],
        where: { timestamp: { gte: since }, userId: { not: null } },
      }),
      this.prisma.analyticsEvent.groupBy({
        by: ['event'],
        where: { timestamp: { gte: since } },
        _count: { event: true },
        orderBy: { _count: { event: 'desc' } },
        take: 1,
      }),
    ]);

    return {
      totalEvents,
      uniqueUsers: uniqueUsers.length,
      topEvent: topEvent[0]?.event || null,
      topEventCount: topEvent[0]?._count?.event || 0,
      days,
    };
  }

  async getTopEvents(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const events = await this.prisma.analyticsEvent.groupBy({
      by: ['event'],
      where: { timestamp: { gte: since } },
      _count: { event: true },
      orderBy: { _count: { event: 'desc' } },
      take: 20,
    });

    return events.map((e) => ({
      event: e.event,
      count: e._count.event,
    }));
  }

  async getDailyStats(days: number) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows: Array<{ day: Date; count: bigint }> = await this.prisma.$queryRaw`
      SELECT DATE_TRUNC('day', timestamp) as day, COUNT(*)::bigint as count
      FROM analytics_events
      WHERE timestamp >= ${since}
      GROUP BY DATE_TRUNC('day', timestamp)
      ORDER BY day ASC
    `;

    return rows.map((r) => ({
      day: r.day.toISOString().split('T')[0],
      count: Number(r.count),
    }));
  }
}
