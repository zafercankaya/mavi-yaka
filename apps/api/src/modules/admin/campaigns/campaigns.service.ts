import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CampaignStatus, Market, Prisma } from '@prisma/client';
import { UpdateCampaignDto } from './campaigns.dto';

@Injectable()
export class AdminCampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    status?: CampaignStatus;
    categoryId?: string;
    brandId?: string;
    search?: string;
    market?: Market;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.CampaignWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.market && { market: params.market }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.brandId && { brandId: params.brandId }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' as const } },
          { description: { contains: params.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.campaign.count({ where }),
    ]);

    return {
      items: campaigns,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Kampanya bulunamadi');
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    await this.findOne(id);
    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  async hide(id: string) {
    await this.findOne(id);
    return this.prisma.campaign.update({
      where: { id },
      data: { status: CampaignStatus.HIDDEN },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.campaign.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.campaign.deleteMany({
      where: { id: { in: ids } },
    });
    return { deleted: result.count };
  }
}
