import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Sector } from '@prisma/client';

const DEFAULT_SECTORS = [
  { name: 'Lojistik & Taşımacılık', nameEn: 'Logistics & Transportation', slug: 'LOGISTICS_TRANSPORTATION', iconName: 'local_shipping', sortOrder: 1 },
  { name: 'Üretim & İmalat', nameEn: 'Manufacturing', slug: 'MANUFACTURING', iconName: 'factory', sortOrder: 2 },
  { name: 'Perakende & Mağazacılık', nameEn: 'Retail', slug: 'RETAIL', iconName: 'store', sortOrder: 3 },
  { name: 'İnşaat', nameEn: 'Construction', slug: 'CONSTRUCTION', iconName: 'construction', sortOrder: 4 },
  { name: 'Gıda & İçecek', nameEn: 'Food & Beverage', slug: 'FOOD_BEVERAGE', iconName: 'restaurant', sortOrder: 5 },
  { name: 'Otomotiv', nameEn: 'Automotive', slug: 'AUTOMOTIVE', iconName: 'directions_car', sortOrder: 6 },
  { name: 'Tekstil & Konfeksiyon', nameEn: 'Textile & Apparel', slug: 'TEXTILE', iconName: 'checkroom', sortOrder: 7 },
  { name: 'Madencilik & Enerji', nameEn: 'Mining & Energy', slug: 'MINING_ENERGY', iconName: 'bolt', sortOrder: 8 },
  { name: 'Sağlık', nameEn: 'Healthcare', slug: 'HEALTHCARE', iconName: 'local_hospital', sortOrder: 9 },
  { name: 'Konaklama & Turizm', nameEn: 'Hospitality & Tourism', slug: 'HOSPITALITY_TOURISM', iconName: 'hotel', sortOrder: 10 },
  { name: 'Tarım & Hayvancılık', nameEn: 'Agriculture', slug: 'AGRICULTURE', iconName: 'agriculture', sortOrder: 11 },
  { name: 'Güvenlik Hizmetleri', nameEn: 'Security Services', slug: 'SECURITY_SERVICES', iconName: 'security', sortOrder: 12 },
  { name: 'Temizlik & Tesis Yönetimi', nameEn: 'Facility Management', slug: 'FACILITY_MANAGEMENT', iconName: 'cleaning_services', sortOrder: 13 },
  { name: 'Metal & Çelik', nameEn: 'Metal & Steel', slug: 'METAL_STEEL', iconName: 'hardware', sortOrder: 14 },
  { name: 'Kimya & Plastik', nameEn: 'Chemicals & Plastics', slug: 'CHEMICALS_PLASTICS', iconName: 'science', sortOrder: 15 },
  { name: 'E-ticaret & Kargo', nameEn: 'E-commerce & Cargo', slug: 'ECOMMERCE_CARGO', iconName: 'inventory_2', sortOrder: 16 },
  { name: 'Telekomünikasyon', nameEn: 'Telecommunications', slug: 'TELECOMMUNICATIONS', iconName: 'cell_tower', sortOrder: 17 },
  { name: 'Diğer', nameEn: 'Other', slug: 'OTHER', iconName: 'work', sortOrder: 99 },
] as const;

@Injectable()
export class AdminSectorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // Sector is a Prisma enum, not a DB table.
    // Return DEFAULT_SECTORS enriched with job & company counts per sector.
    const [jobCounts, companyCounts] = await Promise.all([
      this.prisma.jobListing.groupBy({
        by: ['sector'],
        _count: { id: true },
        where: { status: 'ACTIVE' },
      }),
      this.prisma.company.groupBy({
        by: ['sector'],
        _count: { id: true },
        where: { isActive: true },
      }),
    ]);

    const jobMap = new Map(jobCounts.map((r) => [r.sector, r._count.id]));
    const companyMap = new Map(companyCounts.map((r) => [r.sector, r._count.id]));

    return DEFAULT_SECTORS.map((s) => ({
      ...s,
      activeJobs: jobMap.get(s.slug as Sector) ?? 0,
      activeCompanies: companyMap.get(s.slug as Sector) ?? 0,
    }));
  }
}
