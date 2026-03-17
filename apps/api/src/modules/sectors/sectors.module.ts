import { Module } from '@nestjs/common';
import { SectorsPublicController } from './sectors.controller';
import { CacheService } from '../../common/cache.service';

@Module({
  controllers: [SectorsPublicController],
  providers: [CacheService],
})
export class SectorsPublicModule {}
