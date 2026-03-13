import { Controller, Post, Delete, Get, Put, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Market } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

class RegisterTokenDto {
  @IsString()
  token!: string;

  @IsEnum(['IOS', 'ANDROID'])
  platform!: 'IOS' | 'ANDROID';

  @IsOptional()
  @IsEnum(Market)
  market?: Market;
}

class RemoveTokenDto {
  @IsString()
  token!: string;
}

class UpdatePreferencesDto {
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

class UpdateMarketDto {
  @IsEnum(Market)
  market!: Market;
}

@Controller('notifications')
@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('register-token')
  @ApiOperation({ summary: 'FCM token kaydet' })
  async registerToken(
    @CurrentUser('sub') userId: string,
    @Body() dto: RegisterTokenDto,
  ) {
    await this.notificationsService.registerToken(userId, dto.token, dto.platform, dto.market);
    return { data: { registered: true } };
  }

  @Delete('remove-token')
  @ApiOperation({ summary: 'FCM token sil' })
  async removeToken(@Body() dto: RemoveTokenDto) {
    await this.notificationsService.removeToken(dto.token);
    return { data: { removed: true } };
  }

  @Get('inbox')
  @ApiOperation({ summary: 'Bildirim inbox listesi' })
  async getInbox(
    @CurrentUser('sub') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getInbox(userId, cursor, limit ? parseInt(limit, 10) : 20);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Okunmamış bildirim sayısı' })
  async getUnreadCount(@CurrentUser('sub') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { data: { count } };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Bildirimi okundu işaretle' })
  async markAsRead(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.notificationsService.markAsRead(userId, id);
    return { data: { read: true } };
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Bildirim tercihlerini getir' })
  async getPreferences(@CurrentUser('sub') userId: string) {
    return { data: await this.notificationsService.getPreferences(userId) };
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Bildirim tercihlerini guncelle' })
  async updatePreferences(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return { data: await this.notificationsService.updatePreferences(userId, dto) };
  }

  @Patch('market')
  @ApiOperation({ summary: 'Kullanıcı market (ülke) güncelle' })
  async updateMarket(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateMarketDto,
  ) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { market: dto.market },
    });
    return { data: { market: dto.market } };
  }
}
