import { Module } from '@nestjs/common';
import { BrandsController } from './brands/brands.controller';
import { BrandsService } from './brands/brands.service';
import { CategoriesController } from './categories/categories.controller';
import { CategoriesService } from './categories/categories.service';
import { SourcesController } from './sources/sources.controller';
import { SourcesService } from './sources/sources.service';
import { PlansController } from './plans/plans.controller';
import { PlansService } from './plans/plans.service';
import { CrawlController } from './crawl/crawl.controller';
import { CrawlService } from './crawl/crawl.service';
import { AdminCampaignsController } from './campaigns/campaigns.controller';
import { AdminCampaignsService } from './campaigns/campaigns.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { SettingsController } from './settings/settings.controller';
import { SettingsService } from './settings/settings.service';
import { AdminAnalyticsController } from './analytics/analytics.controller';
import { AdminAnalyticsService } from './analytics/analytics.service';
import { ReportsController } from './reports/reports.controller';
import { ReportsService } from './reports/reports.service';

@Module({
  controllers: [
    BrandsController,
    CategoriesController,
    SourcesController,
    PlansController,
    CrawlController,
    AdminCampaignsController,
    DashboardController,
    SettingsController,
    AdminAnalyticsController,
    ReportsController,
  ],
  providers: [BrandsService, CategoriesService, SourcesService, PlansService, CrawlService, AdminCampaignsService, DashboardService, SettingsService, AdminAnalyticsService, ReportsService],
})
export class AdminModule {}
