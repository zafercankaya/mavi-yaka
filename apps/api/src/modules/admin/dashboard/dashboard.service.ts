import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CampaignStatus, Market } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(market?: Market) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const mf = market ? { market } : {};
    const campaignMf = market ? { market } : {};

    const [
      totalUsers,
      activeFollows,
      activeCampaigns,
      expiredCampaigns,
      hiddenCampaigns,
      todayCampaigns,
      weekCampaigns,
      totalBrands,
      totalCategories,
      totalSources,
      totalFavorites,
      recentCrawls,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.follow.count(),
      this.prisma.campaign.count({ where: { status: CampaignStatus.ACTIVE, ...campaignMf } }),
      this.prisma.campaign.count({ where: { status: CampaignStatus.EXPIRED, ...campaignMf } }),
      this.prisma.campaign.count({ where: { status: CampaignStatus.HIDDEN, ...campaignMf } }),
      this.prisma.campaign.count({ where: { createdAt: { gte: todayStart }, ...campaignMf } }),
      this.prisma.campaign.count({ where: { createdAt: { gte: weekAgo }, ...campaignMf } }),
      this.prisma.brand.count({ where: mf }),
      this.prisma.category.count(),
      this.prisma.crawlSource.count({ where: mf }),
      this.prisma.favorite.count(),
      this.prisma.crawlLog.findMany({
        include: {
          source: { select: { name: true, brand: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalUsers,
      activeFollows,
      activeCampaigns,
      expiredCampaigns,
      hiddenCampaigns,
      totalCampaigns: activeCampaigns + expiredCampaigns + hiddenCampaigns,
      todayCampaigns,
      weekCampaigns,
      totalBrands,
      totalCategories,
      totalSources,
      totalFavorites,
      recentCrawls,
    };
  }

  async getTopBrands(limit = 5, market?: Market) {
    const brands = await this.prisma.brand.findMany({
      where: market ? { market } : {},
      select: {
        id: true,
        name: true,
        logoUrl: true,
        _count: { select: { follows: true, campaigns: true } },
      },
      orderBy: { follows: { _count: 'desc' } },
      take: limit,
    });

    return brands.map((b) => ({
      id: b.id,
      name: b.name,
      logoUrl: b.logoUrl,
      activeCampaigns: b._count.campaigns,
      followers: b._count.follows,
    }));
  }
}
