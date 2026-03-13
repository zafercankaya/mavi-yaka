import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './follows.dto';

@Controller('follows')
@ApiTags('Follows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının takip listesi' })
  async findAll(@CurrentUser('sub') userId: string) {
    return { data: await this.followsService.findUserFollows(userId) };
  }

  @Post()
  @ApiOperation({ summary: 'Marka veya kategori takip et' })
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateFollowDto,
  ) {
    return { data: await this.followsService.create(userId, dto) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Takibi bırak' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.followsService.remove(userId, id);
    return { data: { deleted: true } };
  }
}
