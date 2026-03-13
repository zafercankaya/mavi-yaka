import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { CacheService } from './common/cache.service';
import { HealthController } from './health.controller';
import { PrivacyController } from './privacy.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { BrandsPublicModule } from './modules/brands/brands.module';
import { CategoriesPublicModule } from './modules/categories/categories.module';
import { FollowsModule } from './modules/follows/follows.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UploadModule } from './modules/upload/upload.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      serveStaticOptions: {
        index: false,
      },
    }),
    PrismaModule,
    AuthModule,
    AdminModule,
    CampaignsModule,
    BrandsPublicModule,
    CategoriesPublicModule,
    FollowsModule,
    NotificationsModule,
    SubscriptionsModule,
    UploadModule,
    FavoritesModule,
    ReferralsModule,
    AnalyticsModule,
  ],
  controllers: [HealthController, PrivacyController],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppModule {}
