import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { ShareController } from './share.controller';
import { WellKnownController } from './well-known.controller';
import { JobsService } from './jobs.service';
import { CacheService } from '../../common/cache.service';

@Module({
  controllers: [JobsController, ShareController, WellKnownController],
  providers: [JobsService, CacheService],
  exports: [JobsService],
})
export class JobsModule {}
