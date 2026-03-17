import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Market, Sector, JobStatus } from '@prisma/client';
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
  @ApiQuery({ name: 'sector', enum: Sector, required: false, description: 'Sektör bazlı filtre' })
  @ApiQuery({ name: 'withJobCount', required: false, description: 'Aktif ilan sayısını dahil et (true/false)' })
  @ApiQuery({ name: 'search', required: false, description: 'Şirket adı araması' })
  async findAll(
    @Query('market') market?: Market,
    @Query('sector') sector?: string,
    @Query('withJobCount') withJobCount?: string,
    @Query('search') search?: string,
  ) {
    const includeJobCount = withJobCount === 'true';
    const cacheKey = `companies:${market || 'all'}:${sector || 'all'}:${includeJobCount}:${search || ''}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const companies = await this.prisma.company.findMany({
      where: {
        isActive: true,
        ...(market && { market }),
        ...(sector && { sector: sector as Sector }),
        ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        websiteUrl: true,
        sector: true,
        market: true,
        description: true,
        employeeCount: true,
        ...(includeJobCount && {
          _count: {
            select: {
              jobListings: { where: { status: JobStatus.ACTIVE } },
            },
          },
        }),
      },
      orderBy: { name: 'asc' },
    });

    const data = companies.map((c: any) => {
      const { _count, ...rest } = c;
      return {
        ...rest,
        ...(includeJobCount && { activeJobCount: _count?.jobListings ?? 0 }),
      };
    });

    const result = { data };
    this.cache.set(cacheKey, result, 1800); // 30 minutes
    return result;
  }
}
