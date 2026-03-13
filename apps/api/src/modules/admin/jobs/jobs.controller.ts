import {
  Controller, Get, Put, Delete, Post,
  Param, Body, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JobStatus, Market, Sector } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminJobsService } from './jobs.service';
import { UpdateJobListingDto } from './jobs.dto';

@Controller('admin/jobs')
@ApiTags('Admin - Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminJobsController {
  constructor(private readonly jobsService: AdminJobsService) {}

  @Get()
  @ApiOperation({ summary: 'İş ilanı listesi (filtreleme + sayfalama)' })
  @ApiQuery({ name: 'status', enum: JobStatus, required: false })
  @ApiQuery({ name: 'sector', enum: Sector, required: false })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'country', enum: Market, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Query('status') status?: JobStatus,
    @Query('sector') sector?: Sector,
    @Query('companyId') companyId?: string,
    @Query('search') search?: string,
    @Query('country') country?: Market,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return {
      data: await this.jobsService.findAll({
        status,
        sector,
        companyId,
        search,
        country,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      }),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'İş ilanı detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.jobsService.findOne(id) };
  }

  @Put(':id')
  @ApiOperation({ summary: 'İş ilanı güncelle' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobListingDto,
  ) {
    return { data: await this.jobsService.update(id, dto) };
  }

  @Put(':id/expire')
  @ApiOperation({ summary: 'İş ilanını süresi dolmuş olarak işaretle' })
  async expire(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.jobsService.markExpired(id) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'İş ilanı sil' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.jobsService.remove(id);
    return { data: { deleted: true } };
  }

  @Post('bulk-delete')
  @ApiOperation({ summary: 'Seçili iş ilanlarını toplu sil' })
  async bulkDelete(@Body('ids') ids: string[]) {
    return { data: await this.jobsService.bulkDelete(ids) };
  }
}
