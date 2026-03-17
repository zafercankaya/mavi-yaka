import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Market, Sector } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache.service';

@Controller('companies')
@ApiTags('Companies (Public)')
export class CompaniesPublicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Aktif şirketleri listele' })
  @ApiQuery({ name: 'market', enum: Market, required: false, description: 'Ülke bazlı filtre' })
  @ApiQuery({ name: 'sector', required: false, description: 'Sektör bazlı filtre' })
  async findAll(
    @Query('market') market?: Market,
    @Query('sector') sector?: string,
  ) {
    const cacheKey = `companies:${market || 'all'}:${sector || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const companies = await this.prisma.company.findMany({
      where: {
        isActive: true,
        ...(market && { market: market }),
        ...(sector && { sector: sector as Sector }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        websiteUrl: true,
        sector: true,
        market: true,
      },
      orderBy: { name: 'asc' },
    });
    const result = { data: companies };
    this.cache.set(cacheKey, result, 1800); // 30 minutes
    return result;
  }
}
