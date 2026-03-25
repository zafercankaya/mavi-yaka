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
  @ApiQuery({ name: 'limit', required: false, description: 'Sayfa başına sonuç (default: 50, max: 200)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Atlanacak sonuç sayısı' })
  async findAll(
    @Query('market') market?: Market,
    @Query('sector') sector?: string,
    @Query('withJobCount') withJobCount?: string,
    @Query('search') search?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const includeJobCount = withJobCount === 'true';
    const limit = Math.min(Math.max(parseInt(limitStr || '50', 10) || 50, 1), 200);
    const offset = Math.max(parseInt(offsetStr || '0', 10) || 0, 0);
    const cacheKey = `companies:${market || 'all'}:${sector || 'all'}:${includeJobCount}:${search || ''}:${limit}:${offset}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const where = {
      isActive: true,
      ...(market && { market }),
      ...(sector && { sector: sector as Sector }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
    };

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
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
        take: limit,
        skip: offset,
      }),
      this.prisma.company.count({ where }),
    ]);

    const data = companies.map((c: any) => {
      const { _count, ...rest } = c;
      return {
        ...rest,
        ...(includeJobCount && { activeJobCount: _count?.jobListings ?? 0 }),
      };
    });

    const result = { data, meta: { total, limit, offset, hasMore: offset + limit < total } };
    this.cache.set(cacheKey, result, 1800); // 30 minutes
    return result;
  }
}
