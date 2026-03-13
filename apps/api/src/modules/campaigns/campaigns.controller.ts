import { Controller, Get, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CampaignQueryDto } from './campaigns.dto';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('campaigns')
@ApiTags('Campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Kampanya listesi (filtreleme, sıralama, cursor pagination)' })
  async findAll(
    @Query() query: CampaignQueryDto,
    @CurrentUser('sub') userId?: string,
  ) {
    return this.campaignsService.findAll(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kampanya detayı' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return { data: await this.campaignsService.findOne(id) };
  }
}
