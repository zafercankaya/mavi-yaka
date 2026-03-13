import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache.service';

@Controller('brands')
@ApiTags('Brands (Public)')
export class BrandsPublicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Aktif markaları listele' })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async findAll(@Query('market') market?: Market) {
    const cacheKey = `brands:${market || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const brands = await this.prisma.brand.findMany({
      where: {
        isActive: true,
        ...(market && { market }),
      },
      select: { id: true, name: true, slug: true, logoUrl: true, categoryId: true },
      orderBy: { name: 'asc' },
    });
    const result = { data: brands };
    this.cache.set(cacheKey, result, 1800); // 30 minutes
    return result;
  }
}
