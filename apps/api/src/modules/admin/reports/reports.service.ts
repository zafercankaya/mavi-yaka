import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyReports(limit = 30) {
    return this.prisma.dailyReport.findMany({
      orderBy: { date: 'desc' },
      take: limit,
      select: {
        id: true,
        date: true,
        totalSources: true,
        sourcesSuccess: true,
        sourcesFailed: true,
        jobsFound: true,
        jobsNew: true,
        jobsUpdated: true,
        jobsExpired: true,
        crawlDurationMs: true,
        maintenanceActions: true,
        maintenanceErrors: true,
      },
    });
  }

  async getDailyReport(id: string) {
    const report = await this.prisma.dailyReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Rapor bulunamadi');
    return report;
  }
}
