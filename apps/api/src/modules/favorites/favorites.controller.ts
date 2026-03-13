import {
  Controller, Get, Post, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FavoritesService } from './favorites.service';
import { Market } from '@prisma/client';

@Controller('favorites')
@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcının favori kampanyaları' })
  @ApiQuery({ name: 'filter', enum: ['active', 'upcoming', 'past'], required: false })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('filter') filter?: 'active' | 'upcoming' | 'past',
    @Query('market') market?: Market,
  ) {
    return { data: await this.favoritesService.findUserFavorites(userId, filter, market) };
  }

  @Post(':campaignId/toggle')
  @ApiOperation({ summary: 'Kampanyayı favorilere ekle/çıkar' })
  async toggle(
    @CurrentUser('sub') userId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {
    return { data: await this.favoritesService.toggle(userId, campaignId) };
  }

  @Get(':campaignId/status')
  @ApiOperation({ summary: 'Kampanya favori durumu' })
  async status(
    @CurrentUser('sub') userId: string,
    @Param('campaignId', ParseUUIDPipe) campaignId: string,
  ) {
    return { data: await this.favoritesService.isFavorited(userId, campaignId) };
  }
}
