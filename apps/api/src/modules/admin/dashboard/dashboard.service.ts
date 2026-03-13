import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JobStatus, Market } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(market?: Market) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const mf = market ? { market } : {};
    const jobMf = market ? { country: market } : {};

    const [
      totalUsers,
      followedCompanies,
      followedSectors,
      activeJobs,
      expiredJobs,
      removedJobs,
      todayJobs,
      weekJobs,
      totalCompanies,
      totalSources,
      totalSavedJobs,
      recentCrawls,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.followedCompany.count(),
      this.prisma.followedSector.count(),
      this.prisma.jobListing.count({ where: { status: JobStatus.ACTIVE, ...jobMf } }),
      this.prisma.jobListing.count({ where: { status: JobStatus.EXPIRED, ...jobMf } }),
      this.prisma.jobListing.count({ where: { status: JobStatus.REMOVED, ...jobMf } }),
      this.prisma.jobListing.count({ where: { createdAt: { gte: todayStart }, ...jobMf } }),
      this.prisma.jobListing.count({ where: { createdAt: { gte: weekAgo }, ...jobMf } }),
      this.prisma.company.count({ where: mf }),
      this.prisma.crawlSource.count({ where: mf }),
      this.prisma.savedJob.count(),
      this.prisma.crawlLog.findMany({
        include: {
          source: { select: { name: true, company: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalUsers,
      activeFollows: followedCompanies + followedSectors,
      activeJobs,
      expiredJobs,
      removedJobs,
      totalJobs: activeJobs + expiredJobs + removedJobs,
      todayJobs,
      weekJobs,
      totalCompanies,
      totalSources,
      totalSavedJobs,
      recentCrawls,
    };
  }

  async getTopCompanies(limit = 5, market?: Market) {
    const companies = await this.prisma.company.findMany({
      where: market ? { market } : {},
      select: {
        id: true,
        name: true,
        logoUrl: true,
        _count: { select: { followers: true, jobListings: true } },
      },
      orderBy: { followers: { _count: 'desc' } },
      take: limit,
    });

    return companies.map((c) => ({
      id: c.id,
      name: c.name,
      logoUrl: c.logoUrl,
      activeJobs: c._count.jobListings,
      followers: c._count.followers,
    }));
  }
}
