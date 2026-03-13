import { Injectable, NotFoundException } from '@nestjs/common';
import { Market } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBrandDto, UpdateBrandDto } from './brands.dto';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categoryId?: string, market?: Market) {
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (market) where.market = market;
    return this.prisma.brand.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { name: 'asc' },
      include: { category: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!brand) throw new NotFoundException('Marka bulunamadı');
    return brand;
  }

  async create(dto: CreateBrandDto) {
    return this.prisma.brand.create({ data: dto });
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      // Delete campaigns of this brand (favorites cascade automatically)
      await tx.campaign.deleteMany({ where: { brandId: id } });
      // Delete crawl sources of this brand (logs cascade automatically)
      await tx.crawlSource.deleteMany({ where: { brandId: id } });
      // Delete the brand (follows cascade automatically)
      return tx.brand.delete({ where: { id } });
    });
  }
}
