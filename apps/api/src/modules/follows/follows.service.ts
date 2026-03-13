import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Sector } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findUserFollows(userId: string) {
    const [companies, sectors] = await Promise.all([
      this.prisma.followedCompany.findMany({
        where: { userId },
        select: {
          id: true,
          companyId: true,
          isFrozen: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              sector: true,
              market: true,
            },
          },
        },
        orderBy: [{ isFrozen: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.followedSector.findMany({
        where: { userId },
        select: {
          id: true,
          sector: true,
          market: true,
          isFrozen: true,
          createdAt: true,
        },
        orderBy: [{ isFrozen: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    return { companies, sectors };
  }

  async followCompany(userId: string, companyId: string) {
    const canFollow = await this.subscriptionsService.canAddCompanyFollow(userId);
    if (!canFollow) {
      throw new ForbiddenException('COMPANY_FOLLOW_LIMIT_REACHED');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException('COMPANY_NOT_FOUND');
    }

    try {
      return await this.prisma.followedCompany.create({
        data: { userId, companyId },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              sector: true,
              market: true,
            },
          },
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('ALREADY_FOLLOWING_COMPANY');
      }
      throw err;
    }
  }

  async unfollowCompany(userId: string, companyId: string) {
    const follow = await this.prisma.followedCompany.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    if (!follow) throw new NotFoundException('FOLLOW_NOT_FOUND');

    return this.prisma.followedCompany.delete({ where: { id: follow.id } });
  }

  async followSector(userId: string, sector: Sector) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { market: true },
    });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    try {
      return await this.prisma.followedSector.create({
        data: { userId, sector, market: user.market },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException('ALREADY_FOLLOWING_SECTOR');
      }
      throw err;
    }
  }

  async unfollowSector(userId: string, sector: Sector) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { market: true },
    });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    const follow = await this.prisma.followedSector.findUnique({
      where: { userId_sector_market: { userId, sector, market: user.market } },
    });
    if (!follow) throw new NotFoundException('FOLLOW_NOT_FOUND');

    return this.prisma.followedSector.delete({ where: { id: follow.id } });
  }
}
