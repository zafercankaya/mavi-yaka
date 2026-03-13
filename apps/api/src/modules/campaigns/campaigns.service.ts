import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, CampaignStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache.service';
import { FollowsService } from '../follows/follows.service';
import { CampaignQueryDto, CampaignSort } from './campaigns.dto';

const campaignSelect = {
  id: true,
  title: true,
  description: true,
  brandId: true,
  categoryId: true,
  discountRate: true,
  promoCode: true,
  imageUrls: true,
  sourceUrl: true,
  canonicalUrl: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
  category: { select: { id: true, name: true, nameEn: true, nameDe: true, slug: true, iconName: true } },
} satisfies Prisma.CampaignSelect;

@Injectable()
export class CampaignsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly followsService: FollowsService,
  ) {}

  async findAll(query: CampaignQueryDto, userId?: string) {
    const limit = query.limit ?? 20;

    // Cache only non-personalized queries (no followingOnly, no user-specific)
    const isCacheable = !query.followingOnly && !userId;
    const cacheKey = isCacheable
      ? `campaigns:${query.market || 'all'}:${query.sort || 'default'}:${query.cursor || '0'}:${limit}:${query.categoryId || ''}:${query.brandId || ''}:${query.brandIds || ''}:${query.search || ''}`
      : null;

    if (cacheKey) {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    // brandIds (comma-separated) takes precedence over single brandId
    const parsedBrandIds = query.brandIds
      ? query.brandIds.split(',').map((id) => id.trim()).filter(Boolean)
      : undefined;

    const where: Prisma.CampaignWhereInput = {
      status: query.status ?? CampaignStatus.ACTIVE,
      ...(query.market && { market: query.market }),
      ...(parsedBrandIds && parsedBrandIds.length > 0
        ? { brandId: { in: parsedBrandIds } }
        : query.brandId ? { brandId: query.brandId } : {}),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { description: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(query.sort === CampaignSort.LAST_24H && {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      ...(query.sort === CampaignSort.HAS_PROMO && {
        promoCode: { not: null },
      }),
    };

    // followingOnly: restrict to followed brands
    if (query.followingOnly) {
      if (!userId) {
        // Not authenticated — return empty instead of silently showing all
        return { data: [], meta: { nextCursor: null, hasMore: false, total: 0 } };
      }

      const follows = await this.followsService.findUserFollows(userId);

      // Filter follows to only include brands from the requested market
      const followedBrandIds = follows
        .filter((f) => f.brandId && (!query.market || f.brand?.market === query.market))
        .map((f) => f.brandId!);

      if (followedBrandIds.length === 0) {
        return { data: [], meta: { nextCursor: null, hasMore: false, total: 0 } };
      }

      if (parsedBrandIds && parsedBrandIds.length > 0) {
        // User selected specific brands — intersect with followed brands
        const validIds = parsedBrandIds.filter((id) => followedBrandIds.includes(id));
        where.brandId = validIds.length > 0 ? { in: validIds } : { in: [] };
      } else {
        // No explicit brand selection — show all followed brands
        const brandFilter: Prisma.CampaignWhereInput = { brandId: { in: followedBrandIds } };
        if (where.OR) {
          const searchOr = where.OR;
          delete where.OR;
          where.AND = [
            { OR: searchOr as Prisma.CampaignWhereInput[] },
            brandFilter,
          ];
        } else {
          Object.assign(where, brandFilter);
        }
      }
    }

    // Recommended sort uses in-memory scoring
    if (query.sort === CampaignSort.RECOMMENDED) {
      const result = await this.findAllRecommended(where, limit, query.cursor);
      if (cacheKey) this.cache.set(cacheKey, result, 300);
      return result;
    }

    const orderBy = this.getOrderBy(query.sort);

    const campaigns = await this.prisma.campaign.findMany({
      where,
      select: campaignSelect,
      orderBy,
      take: limit + 1,
      ...(query.cursor && {
        cursor: { id: query.cursor },
        skip: 1,
      }),
    });

    const hasMore = campaigns.length > limit;
    const items = hasMore ? campaigns.slice(0, limit) : campaigns;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const total = await this.prisma.campaign.count({ where });

    const result = {
      data: items.map(this.formatCampaign),
      meta: {
        nextCursor,
        hasMore,
        total,
      },
    };

    if (cacheKey) {
      this.cache.set(cacheKey, result, 300); // 5 minutes
    }

    return result;
  }

  async findOne(id: string) {
    const cacheKey = `campaign:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      select: campaignSelect,
    });

    if (!campaign) throw new NotFoundException('CAMPAIGN_NOT_FOUND');

    const result = this.formatCampaign(campaign);
    this.cache.set(cacheKey, result, 600); // 10 minutes
    return result;
  }

  private getOrderBy(sort?: CampaignSort): Prisma.CampaignOrderByWithRelationInput {
    switch (sort) {
      case CampaignSort.ENDING_SOON:
        return { endDate: { sort: 'asc', nulls: 'last' } };
      case CampaignSort.DISCOUNT_HIGH:
        return { discountRate: { sort: 'desc', nulls: 'last' } };
      case CampaignSort.HAS_PROMO:
      case CampaignSort.LAST_24H:
        return { createdAt: 'desc' };
      case CampaignSort.NEWEST:
      default:
        return { createdAt: 'desc' };
    }
  }

  private async findAllRecommended(
    where: Prisma.CampaignWhereInput,
    limit: number,
    cursor?: string,
  ) {
    const batchSize = Math.min(limit * 20, 500);
    const campaigns = await this.prisma.campaign.findMany({
      where,
      select: campaignSelect,
      orderBy: { createdAt: 'desc' },
      take: batchSize,
    });

    const now = Date.now();
    const scored = campaigns.map((c) => ({
      ...c,
      _score: this.computeRecommendedScore(c, now),
    }));

    scored.sort((a, b) => {
      if (b._score !== a._score) return b._score - a._score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    let startIndex = 0;
    if (cursor) {
      const cursorIndex = scored.findIndex((c) => c.id === cursor);
      startIndex = cursorIndex >= 0 ? cursorIndex + 1 : 0;
    }

    const sliced = scored.slice(startIndex, startIndex + limit + 1);
    const hasMore = sliced.length > limit;
    const items = hasMore ? sliced.slice(0, limit) : sliced;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const total = await this.prisma.campaign.count({ where });

    return {
      data: items.map((c) => {
        const { _score, ...rest } = c;
        return this.formatCampaign(rest);
      }),
      meta: { nextCursor, hasMore, total },
    };
  }

  private computeRecommendedScore(c: any, now: number): number {
    let score = 0;

    // Discount weight (max 30)
    const rate = c.discountRate ? Number(c.discountRate) : 0;
    score += (rate / 100) * 30;

    // Urgency weight
    if (c.endDate) {
      const daysUntilEnd = (new Date(c.endDate).getTime() - now) / 86400000;
      if (daysUntilEnd > 0 && daysUntilEnd <= 3) score += 25;
      else if (daysUntilEnd > 0 && daysUntilEnd <= 7) score += 15;
      else if (daysUntilEnd > 0 && daysUntilEnd <= 14) score += 5;
    }

    // Recency weight
    const ageDays = (now - new Date(c.createdAt).getTime()) / 86400000;
    if (ageDays <= 1) score += 20;
    else if (ageDays <= 3) score += 10;
    else if (ageDays <= 7) score += 5;

    // Promo bonus
    if (c.promoCode) score += 10;

    return score;
  }

  private formatCampaign(c: any) {
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      brandId: c.brandId,
      brand: c.brand ? { name: c.brand.name, slug: c.brand.slug, logoUrl: c.brand.logoUrl } : null,
      categoryId: c.categoryId,
      category: c.category ? { name: c.category.name, nameEn: c.category.nameEn, nameDe: c.category.nameDe, slug: c.category.slug, iconName: c.category.iconName } : null,
      discountRate: c.discountRate ? Number(c.discountRate) : null,
      promoCode: c.promoCode || null,
      imageUrls: c.imageUrls,
      sourceUrl: c.sourceUrl,
      canonicalUrl: c.canonicalUrl,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }
}
