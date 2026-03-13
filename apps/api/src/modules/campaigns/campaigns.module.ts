import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { ShareController } from './share.controller';
import { WellKnownController } from './well-known.controller';
import { CampaignsService } from './campaigns.service';
import { CacheService } from '../../common/cache.service';
import { FollowsModule } from '../follows/follows.module';

@Module({
  imports: [FollowsModule],
  controllers: [CampaignsController, ShareController, WellKnownController],
  providers: [CampaignsService, CacheService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
