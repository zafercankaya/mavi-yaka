import {
  Controller, Get, Post, Put, Delete,
  Param, Body, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

@Controller('admin/categories')
@ApiTags('Admin - Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kategorileri listele' })
  async findAll() {
    return { data: await this.categoriesService.findAll() };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kategori detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.categoriesService.findOne(id) };
  }

  @Post()
  @ApiOperation({ summary: 'Yeni kategori oluştur' })
  async create(@Body() dto: CreateCategoryDto) {
    return { data: await this.categoriesService.create(dto) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kategori güncelle' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return { data: await this.categoriesService.update(id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kategori sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categoriesService.remove(id);
    return { data: { deleted: true } };
  }
}
