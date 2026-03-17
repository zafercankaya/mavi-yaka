import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Market, Sector, JobStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../common/cache.service';

const SECTOR_META: Record<string, { name: string; nameEn: string; iconName: string; sortOrder: number }> = {
  LOGISTICS_TRANSPORTATION: { name: 'Lojistik & Taşımacılık', nameEn: 'Logistics & Transportation', iconName: 'local_shipping', sortOrder: 1 },
  MANUFACTURING: { name: 'Üretim & İmalat', nameEn: 'Manufacturing', iconName: 'factory', sortOrder: 2 },
  RETAIL: { name: 'Perakende & Mağazacılık', nameEn: 'Retail', iconName: 'store', sortOrder: 3 },
  CONSTRUCTION: { name: 'İnşaat', nameEn: 'Construction', iconName: 'construction', sortOrder: 4 },
  FOOD_BEVERAGE: { name: 'Gıda & İçecek', nameEn: 'Food & Beverage', iconName: 'restaurant', sortOrder: 5 },
  AUTOMOTIVE: { name: 'Otomotiv', nameEn: 'Automotive', iconName: 'directions_car', sortOrder: 6 },
  TEXTILE: { name: 'Tekstil & Konfeksiyon', nameEn: 'Textile & Apparel', iconName: 'checkroom', sortOrder: 7 },
  MINING_ENERGY: { name: 'Madencilik & Enerji', nameEn: 'Mining & Energy', iconName: 'bolt', sortOrder: 8 },
  HEALTHCARE: { name: 'Sağlık', nameEn: 'Healthcare', iconName: 'local_hospital', sortOrder: 9 },
  HOSPITALITY_TOURISM: { name: 'Konaklama & Turizm', nameEn: 'Hospitality & Tourism', iconName: 'hotel', sortOrder: 10 },
  AGRICULTURE: { name: 'Tarım & Hayvancılık', nameEn: 'Agriculture', iconName: 'agriculture', sortOrder: 11 },
  SECURITY_SERVICES: { name: 'Güvenlik Hizmetleri', nameEn: 'Security Services', iconName: 'security', sortOrder: 12 },
  FACILITY_MANAGEMENT: { name: 'Temizlik & Tesis Yönetimi', nameEn: 'Facility Management', iconName: 'cleaning_services', sortOrder: 13 },
  METAL_STEEL: { name: 'Metal & Çelik', nameEn: 'Metal & Steel', iconName: 'hardware', sortOrder: 14 },
  CHEMICALS_PLASTICS: { name: 'Kimya & Plastik', nameEn: 'Chemicals & Plastics', iconName: 'science', sortOrder: 15 },
  ECOMMERCE_CARGO: { name: 'E-ticaret & Kargo', nameEn: 'E-commerce & Cargo', iconName: 'inventory_2', sortOrder: 16 },
  TELECOMMUNICATIONS: { name: 'Telekomünikasyon', nameEn: 'Telecommunications', iconName: 'cell_tower', sortOrder: 17 },
  OTHER: { name: 'Diğer', nameEn: 'Other', iconName: 'work', sortOrder: 99 },
};

@Controller('sectors')
@ApiTags('Sectors (Public)')
export class SectorsPublicController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Tüm sektörleri listele (iş ilanı ve şirket sayılarıyla)' })
  @ApiQuery({ name: 'market', enum: Market, required: false, description: 'Ülke bazlı filtre' })
  async findAll(@Query('market') market?: Market) {
    const cacheKey = `sectors:${market || 'all'}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const marketFilter = market ? { country: market } : {};
    const companyMarketFilter = market ? { market } : {};

    // Get job counts per sector
    const jobCounts = await this.prisma.jobListing.groupBy({
      by: ['sector'],
      where: {
        status: JobStatus.ACTIVE,
        ...marketFilter,
      },
      _count: { id: true },
    });

    // Get company counts per sector
    const companyCounts = await this.prisma.company.groupBy({
      by: ['sector'],
      where: {
        isActive: true,
        ...companyMarketFilter,
      },
      _count: { id: true },
    });

    const jobCountMap = new Map(jobCounts.map((j) => [j.sector, j._count.id]));
    const companyCountMap = new Map(companyCounts.map((c) => [c.sector, c._count.id]));

    const data = Object.values(Sector).map((sector) => {
      const meta = SECTOR_META[sector] || { name: sector, nameEn: sector, iconName: 'work', sortOrder: 50 };
      return {
        sector,
        name: meta.name,
        nameEn: meta.nameEn,
        iconName: meta.iconName,
        sortOrder: meta.sortOrder,
        jobCount: jobCountMap.get(sector) || 0,
        companyCount: companyCountMap.get(sector) || 0,
      };
    });

    data.sort((a, b) => a.sortOrder - b.sortOrder);

    const result = { data };
    this.cache.set(cacheKey, result, 600); // 10 minutes
    return result;
  }
}
