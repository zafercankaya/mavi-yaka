import { Module } from '@nestjs/common';
import { SavedJobsController } from './saved-jobs.controller';
import { SavedJobsService } from './saved-jobs.service';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [SubscriptionsModule],
  controllers: [SavedJobsController],
  providers: [SavedJobsService],
  exports: [SavedJobsService],
})
export class SavedJobsModule {}
