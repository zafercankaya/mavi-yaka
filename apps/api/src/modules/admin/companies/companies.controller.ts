import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Market, Sector } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './companies.dto';

@Controller('admin/companies')
@ApiTags('Admin - Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminCompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm şirketleri listele' })
  @ApiQuery({ name: 'sector', enum: Sector, required: false })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async findAll(
    @Query('sector') sector?: Sector,
    @Query('market') market?: Market,
  ) {
    return { data: await this.companiesService.findAll(sector, market) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Şirket detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.companiesService.findOne(id) };
  }

  @Post()
  @ApiOperation({ summary: 'Yeni şirket oluştur' })
  async create(@Body() dto: CreateCompanyDto) {
    return { data: await this.companiesService.create(dto) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Şirket güncelle' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return { data: await this.companiesService.update(id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Şirket sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.companiesService.remove(id);
    return { data: { deleted: true } };
  }
}
