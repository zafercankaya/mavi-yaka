import { Module } from '@nestjs/common';
import { AdminCompaniesController } from './companies/companies.controller';
import { CompaniesService } from './companies/companies.service';
import { AdminSectorsController } from './sectors/sectors.controller';
import { AdminSectorsService } from './sectors/sectors.service';
import { SourcesController } from './sources/sources.controller';
import { SourcesService } from './sources/sources.service';
import { PlansController } from './plans/plans.controller';
import { PlansService } from './plans/plans.service';
import { CrawlController } from './crawl/crawl.controller';
import { CrawlService } from './crawl/crawl.service';
import { AdminJobsController } from './jobs/jobs.controller';
import { AdminJobsService } from './jobs/jobs.service';
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
    AdminCompaniesController,
    AdminSectorsController,
    SourcesController,
    PlansController,
    CrawlController,
    AdminJobsController,
    DashboardController,
    SettingsController,
    AdminAnalyticsController,
    ReportsController,
  ],
  providers: [CompaniesService, AdminSectorsService, SourcesService, PlansService, CrawlService, AdminJobsService, DashboardService, SettingsService, AdminAnalyticsService, ReportsService],
})
export class AdminModule {}
