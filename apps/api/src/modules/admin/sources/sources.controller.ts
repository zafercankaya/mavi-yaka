import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { SourcesService } from './sources.service';
import { CreateSourceDto, UpdateSourceDto } from './sources.dto';

@Controller('admin/sources')
@ApiTags('Admin - Sources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kaynakları listele' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('market') market?: Market,
  ) {
    return { data: await this.sourcesService.findAll(categoryId, brandId, market) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kaynak detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.sourcesService.findOne(id) };
  }

  @Post()
  @ApiOperation({ summary: 'Yeni kaynak oluştur' })
  async create(@Body() dto: CreateSourceDto) {
    return { data: await this.sourcesService.create(dto) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kaynak güncelle' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSourceDto,
  ) {
    return { data: await this.sourcesService.update(id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kaynak sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.sourcesService.remove(id);
    return { data: { deleted: true } };
  }
}
