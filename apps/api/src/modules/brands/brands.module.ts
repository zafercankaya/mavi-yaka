import { Module } from '@nestjs/common';
import { BrandsPublicController } from './brands.controller';
import { CacheService } from '../../common/cache.service';

@Module({
  controllers: [BrandsPublicController],
  providers: [CacheService],
})
export class BrandsPublicModule {}
