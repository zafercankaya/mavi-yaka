import {
  Controller, Get, Post, Delete, Query, Body, UseGuards, HttpCode, Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SubscriptionsService } from './subscriptions.service';
import { VerifyReceiptDto } from './subscriptions.dto';
import { RevenueCatWebhookGuard } from './guards/revenuecat-webhook.guard';
import type { RevenueCatWebhookBody } from './dto/revenuecat-webhook.dto';
import { Market } from '@prisma/client';

@Controller('subscriptions')
@ApiTags('Subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /** Aktif planları listele (auth gerektirmez, opsiyonel market filtre) */
  @Get('plans')
  @ApiOperation({ summary: 'Aktif abonelik planlarını listele' })
  @ApiQuery({ name: 'market', enum: Market, required: false })
  async getPlans(@Query('market') market?: Market) {
    return { data: await this.subscriptionsService.getActivePlans(market) };
  }

  /** Kullanıcının plan haklarını döndür */
  @Get('entitlement')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcının mevcut plan hakları' })
  async getEntitlement(@CurrentUser('sub') userId: string) {
    return { data: await this.subscriptionsService.getEntitlement(userId) };
  }

  /** Apple/Google receipt doğrula ve aboneliği aktifle */
  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Receipt doğrulama ve abonelik aktivasyon' })
  async verify(
    @CurrentUser('sub') userId: string,
    @Body() dto: VerifyReceiptDto,
  ) {
    const subscription = await this.subscriptionsService.verifyAndActivate(
      userId,
      dto.provider,
      dto.receipt,
      dto.productId,
    );
    return { data: subscription };
  }

  /** Aboneliği iptal et */
  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Aboneliği iptal et' })
  async cancel(@CurrentUser('sub') userId: string) {
    await this.subscriptionsService.cancel(userId);
    return { data: { cancelled: true } };
  }

  /** RevenueCat webhook endpoint */
  @Post('webhook/revenuecat')
  @HttpCode(200)
  @UseGuards(RevenueCatWebhookGuard)
  @ApiExcludeEndpoint()
  async handleWebhook(@Body() body: RevenueCatWebhookBody) {
    if (body?.event) {
      await this.subscriptionsService.handleRevenueCatWebhook(body.event);
    }
    return { success: true };
  }
}
