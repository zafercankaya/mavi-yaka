import {
  Controller, Get, Put, Delete, Post,
  Param, Body, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CampaignStatus, Market } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminCampaignsService } from './campaigns.service';
import { UpdateCampaignDto } from './campaigns.dto';

@Controller('admin/campaigns')
@ApiTags('Admin - Campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminCampaignsController {
  constructor(private readonly campaignsService: AdminCampaignsService) {}

  @Get()
  @ApiOperation({ summary: 'Kampanya listesi (filtreleme + sayfalama)' })
  @ApiQuery({ name: 'status', enum: CampaignStatus, required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('status') status?: CampaignStatus,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('search') search?: string,
    @Query('market') market?: Market,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return {
      data: await this.campaignsService.findAll({
        status,
        categoryId,
        brandId,
        search,
        market,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      }),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kampanya detayi' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.campaignsService.findOne(id) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Kampanya guncelle' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return { data: await this.campaignsService.update(id, dto) };
  }

  @Put(':id/hide')
  @ApiOperation({ summary: 'Kampanyayi gizle' })
  async hide(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.campaignsService.hide(id) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Kampanya sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.campaignsService.remove(id);
    return { data: { deleted: true } };
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Secili kampanyalari toplu sil' })
  async bulkDelete(@Body('ids') ids: string[]) {
    return { data: await this.campaignsService.bulkDelete(ids) };
  }
}
