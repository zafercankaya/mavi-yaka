import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './brands.dto';

@Controller('admin/brands')
@ApiTags('Admin - Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm markaları listele' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('market') market?: Market,
  ) {
    return { data: await this.brandsService.findAll(categoryId, market) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Marka detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.brandsService.findOne(id) };
  }

  @Post()
  @ApiOperation({ summary: 'Yeni marka oluştur' })
  async create(@Body() dto: CreateBrandDto) {
    return { data: await this.brandsService.create(dto) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Marka güncelle' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    return { data: await this.brandsService.update(id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Marka sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.brandsService.remove(id);
    return { data: { deleted: true } };
  }
}
