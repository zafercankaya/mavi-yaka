import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

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

@Controller('sectors')
@ApiTags('Sectors (Public)')
export class SectorsPublicController {
  @Get()
  @ApiOperation({ summary: 'Tüm sektörleri listele' })
  findAll() {
    return { data: DEFAULT_SECTORS };
  }
}
