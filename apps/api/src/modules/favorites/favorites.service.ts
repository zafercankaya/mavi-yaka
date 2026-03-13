import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CampaignStatus, Market } from '@prisma/client';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

type FavoriteFilter = 'active' | 'upcoming' | 'past';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findUserFavorites(userId: string, filter: FavoriteFilter = 'active', market?: Market) {
    const now = new Date();

    const campaignConditions: any[] = [];

    // Market filter
    if (market) {
      campaignConditions.push({ market });
    }

    if (filter === 'active') {
      campaignConditions.push(
        { status: CampaignStatus.ACTIVE },
        { OR: [{ endDate: null }, { endDate: { gt: now } }] },
      );
    } else if (filter === 'upcoming') {
      campaignConditions.push({ startDate: { gt: now } });
    } else if (filter === 'past') {
      campaignConditions.push({
        OR: [
          { status: CampaignStatus.EXPIRED },
          { endDate: { lt: now } },
        ],
      });
    }

    const where: any = { userId };
    if (campaignConditions.length > 0) {
      where.campaign = { AND: campaignConditions };
    }

    return this.prisma.favorite.findMany({
      where,
      select: {
        id: true,
        campaignId: true,
        isFrozen: true,
        createdAt: true,
        campaign: {
          include: {
            brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
            category: { select: { id: true, name: true, nameEn: true, slug: true } },
          },
        },
      },
      orderBy: [{ isFrozen: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async toggle(userId: string, campaignId: string) {
    const campaign = await this.prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundException('CAMPAIGN_NOT_FOUND');

    const existing = await this.prisma.favorite.findUnique({
      where: { userId_campaignId: { userId, campaignId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { favorited: false };
    }

    // Kampanya takip limiti kontrolü (sadece ekleme sırasında)
    const canAdd = await this.subscriptionsService.canAddCampaignFollow(userId);
    if (!canAdd) {
      throw new ForbiddenException('CAMPAIGN_FOLLOW_LIMIT_REACHED');
    }

    await this.prisma.favorite.create({ data: { userId, campaignId } });
    return { favorited: true };
  }

  async isFavorited(userId: string, campaignId: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: { userId_campaignId: { userId, campaignId } },
    });
    return { favorited: !!fav };
  }

  async count(campaignId: string) {
    const count = await this.prisma.favorite.count({ where: { campaignId } });
    return { count };
  }
}
