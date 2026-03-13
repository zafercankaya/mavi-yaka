import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ReportsService } from './reports.service';

@Controller('admin/reports')
@ApiTags('Admin - Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Gunluk raporlari listele' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getDailyReports(@Query('limit') limit?: string) {
    return {
      data: await this.reportsService.getDailyReports(limit ? parseInt(limit) : 30),
    };
  }

  @Get('daily/:id')
  @ApiOperation({ summary: 'Gunluk rapor detayi' })
  async getDailyReport(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.reportsService.getDailyReport(id) };
  }
}
