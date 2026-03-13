import {
  Injectable,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CreateFollowDto } from './follows.dto';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findUserFollows(userId: string) {
    return this.prisma.follow.findMany({
      where: { userId },
      select: {
        id: true,
        brandId: true,
        categoryId: true,
        isFrozen: true,
        createdAt: true,
        brand: { select: { id: true, name: true, slug: true, logoUrl: true, market: true } },
        category: { select: { id: true, name: true, slug: true, iconName: true } },
      },
      orderBy: [{ isFrozen: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async create(userId: string, dto: CreateFollowDto) {
    if (!dto.brandId && !dto.categoryId) {
      throw new BadRequestException('BRAND_OR_CATEGORY_REQUIRED');
    }
    if (dto.brandId && dto.categoryId) {
      throw new BadRequestException('BOTH_IDS_PROVIDED');
    }

    // Marka takip limiti kontrolü
    const canFollow = await this.subscriptionsService.canAddBrandFollow(userId);
    if (!canFollow) {
      throw new ForbiddenException('BRAND_FOLLOW_LIMIT_REACHED');
    }

    try {
      return await this.prisma.follow.create({
        data: {
          userId,
          brandId: dto.brandId ?? null,
          categoryId: dto.categoryId ?? null,
        },
        include: {
          brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
          category: { select: { id: true, name: true, slug: true, iconName: true } },
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('FOLLOW_ALREADY_EXISTS');
      }
      throw err;
    }
  }

  async remove(userId: string, followId: string) {
    const follow = await this.prisma.follow.findFirst({
      where: { id: followId, userId },
    });
    if (!follow) throw new NotFoundException('FOLLOW_NOT_FOUND');

    return this.prisma.follow.delete({ where: { id: followId } });
  }
}
