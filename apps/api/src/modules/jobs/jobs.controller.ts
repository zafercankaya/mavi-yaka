import { Controller, Get, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JobQueryDto } from './jobs.dto';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('jobs')
@ApiTags('Jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Job listings (filtering, sorting, cursor pagination)' })
  async findAll(
    @Query() query: JobQueryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.jobsService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Job listing detail' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.jobsService.findOne(id) };
  }
}
