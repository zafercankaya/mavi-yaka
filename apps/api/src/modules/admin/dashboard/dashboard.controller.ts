import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';

@Controller('admin/dashboard')
@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Dashboard istatistikleri' })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async getStats(@Query('market') market?: Market) {
    return { data: await this.dashboardService.getStats(market) };
  }

  @Get('top-companies')
  @ApiOperation({ summary: 'En populer sirketler' })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async getTopCompanies(@Query('market') market?: Market) {
    return { data: await this.dashboardService.getTopCompanies(5, market) };
  }
}
