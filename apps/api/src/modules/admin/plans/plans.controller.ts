import {
  Controller, Get, Post, Put, Delete,
  Param, Query, Body, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './plans.dto';
import { Market } from '@prisma/client';

@Controller('admin/subscription-plans')
@ApiTags('Admin - Subscription Plans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Planları listele (opsiyonel market filtre)' })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async findAll(@Query('market') market?: Market) {
    return { data: await this.plansService.findAll(market) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Plan detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.plansService.findOne(id) };
  }

  @Post()
  @ApiOperation({ summary: 'Yeni plan oluştur' })
  async create(@Body() dto: CreatePlanDto) {
    return { data: await this.plansService.create(dto) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Plan güncelle' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return { data: await this.plansService.update(id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Plan sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.plansService.remove(id);
    return { data: { deleted: true } };
  }
}
