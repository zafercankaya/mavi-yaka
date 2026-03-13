import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('categories')
@ApiTags('Categories (Public)')
export class CategoriesPublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kategorileri listele' })
  async findAll() {
    const categories = await this.prisma.category.findMany({
      select: { id: true, name: true, nameEn: true, slug: true, iconName: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    });
    return { data: categories };
  }
}
