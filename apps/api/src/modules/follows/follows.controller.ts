import {
  Controller, Get, Post, Delete,
  Param, UseGuards, ParseUUIDPipe, ParseEnumPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Sector } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FollowsService } from './follows.service';

@Controller('follows')
@ApiTags('Follows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının takip listesi (şirketler + sektörler)' })
  async findAll(@CurrentUser('sub') userId: string) {
    return { data: await this.followsService.findUserFollows(userId) };
  }

  @Post('company/:companyId')
  @ApiOperation({ summary: 'Şirket takip et' })
  async followCompany(
    @CurrentUser('sub') userId: string,
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ) {
    return { data: await this.followsService.followCompany(userId, companyId) };
  }

  @Delete('company/:companyId')
  @ApiOperation({ summary: 'Şirket takibini bırak' })
  async unfollowCompany(
    @CurrentUser('sub') userId: string,
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ) {
    await this.followsService.unfollowCompany(userId, companyId);
    return { data: { deleted: true } };
  }

  @Post('sector/:sector')
  @ApiOperation({ summary: 'Sektör takip et' })
  async followSector(
    @CurrentUser('sub') userId: string,
    @Param('sector', new ParseEnumPipe(Sector)) sector: Sector,
  ) {
    return { data: await this.followsService.followSector(userId, sector) };
  }

  @Delete('sector/:sector')
  @ApiOperation({ summary: 'Sektör takibini bırak' })
  async unfollowSector(
    @CurrentUser('sub') userId: string,
    @Param('sector', new ParseEnumPipe(Sector)) sector: Sector,
  ) {
    await this.followsService.unfollowSector(userId, sector);
    return { data: { deleted: true } };
  }
}
