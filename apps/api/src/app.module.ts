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
import { JobsModule } from './modules/jobs/jobs.module';
import { CompaniesPublicModule } from './modules/companies/companies.module';
import { SectorsPublicModule } from './modules/sectors/sectors.module';
import { FollowsModule } from './modules/follows/follows.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UploadModule } from './modules/upload/upload.module';
import { SavedJobsModule } from './modules/saved-jobs/saved-jobs.module';
import { JobAlertsModule } from './modules/job-alerts/job-alerts.module';
import { LocationsModule } from './modules/locations/locations.module';
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
    JobsModule,
    CompaniesPublicModule,
    SectorsPublicModule,
    FollowsModule,
    NotificationsModule,
    SubscriptionsModule,
    UploadModule,
    SavedJobsModule,
    JobAlertsModule,
    LocationsModule,
    ReferralsModule,
    AnalyticsModule,
  ],
  controllers: [HealthController, PrivacyController],
  providers: [CacheService],
  exports: [CacheService],
})
export class AppModule {}
