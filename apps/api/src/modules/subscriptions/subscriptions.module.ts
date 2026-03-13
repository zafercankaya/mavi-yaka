import { Module, Global } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { RevenueCatWebhookGuard } from './guards/revenuecat-webhook.guard';

@Global()
@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, RevenueCatWebhookGuard],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
