import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JobAlertsService } from './job-alerts.service';
import { CreateJobAlertDto, UpdateJobAlertDto } from './job-alerts.dto';

@Controller('job-alerts')
@ApiTags('Job Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class JobAlertsController {
  constructor(private readonly jobAlertsService: JobAlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının iş alarmlarını listele' })
  async findAll(@CurrentUser('sub') userId: string) {
    return { data: await this.jobAlertsService.findUserAlerts(userId) };
  }

  @Post()
  @ApiOperation({ summary: 'Yeni iş alarmı oluştur' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateJobAlertDto,
  ) {
    return { data: await this.jobAlertsService.create(userId, dto) };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'İş alarmını güncelle' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJobAlertDto,
  ) {
    return { data: await this.jobAlertsService.update(userId, id, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'İş alarmını sil' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return { data: await this.jobAlertsService.remove(userId, id) };
  }
}
