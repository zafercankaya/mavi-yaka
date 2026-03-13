import {
  Controller, Get, Post, Delete, Param, Query, Body,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Market } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CrawlService } from './crawl.service';

@Controller('admin/crawl')
@ApiTags('Admin - Crawl')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Crawl loglarını listele' })
  @ApiQuery({ name: 'sourceId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  async getLogs(
    @Query('sourceId') sourceId?: string,
    @Query('brandId') brandId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('market') market?: Market,
    @Query('limit') limit?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return {
      data: await this.crawlService.getLogs({
        sourceId,
        brandId,
        categoryId,
        status,
        market,
        limit: limit ? parseInt(limit) : 50,
        sortOrder,
      }),
    };
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Crawl log detayı' })
  async getLog(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.crawlService.getLog(id) };
  }

  @Delete('logs')
  @ApiOperation({ summary: 'Seçili crawl loglarını sil' })
  async deleteLogs(@Body('ids') ids: string[]) {
    return { data: await this.crawlService.deleteLogs(ids) };
  }

  @Post('trigger/:sourceId')
  @ApiOperation({ summary: 'Tek kaynak icin crawl tetikle' })
  async triggerOne(@Param('sourceId', ParseUUIDPipe) sourceId: string) {
    return { data: await this.crawlService.triggerCrawl(sourceId) };
  }

  @Post('trigger-all')
  @ApiOperation({ summary: 'Tum aktif kaynaklari crawl et' })
  async triggerAll() {
    return { data: await this.crawlService.triggerAllCrawls() };
  }
}
