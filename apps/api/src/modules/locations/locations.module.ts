import { Module } from '@nestjs/common';
import { LocationsController } from './locations.controller';
import { CacheService } from '../../common/cache.service';

@Module({
  controllers: [LocationsController],
  providers: [CacheService],
})
export class LocationsModule {}
