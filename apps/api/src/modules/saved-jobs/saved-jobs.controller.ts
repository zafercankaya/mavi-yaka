import {
  Controller, Get, Post, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SavedJobsService } from './saved-jobs.service';
import { Market } from '@prisma/client';

@Controller('saved-jobs')
@ApiTags('Saved Jobs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class SavedJobsController {
  constructor(private readonly savedJobsService: SavedJobsService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanicinin kaydedilmis is ilanlari' })
  @ApiQuery({ name: 'filter', enum: ['active', 'expired'], required: false })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('filter') filter?: 'active' | 'expired',
    @Query('market') market?: Market,
  ) {
    return { data: await this.savedJobsService.findUserSavedJobs(userId, filter, market) };
  }

  @Post(':jobId/toggle')
  @ApiOperation({ summary: 'Is ilanini kaydet/kaldir' })
  async toggle(
    @CurrentUser('sub') userId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return { data: await this.savedJobsService.toggle(userId, jobId) };
  }

  @Get(':jobId/status')
  @ApiOperation({ summary: 'Is ilani kayit durumu' })
  async status(
    @CurrentUser('sub') userId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
  ) {
    return { data: await this.savedJobsService.isSaved(userId, jobId) };
  }
}
