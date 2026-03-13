import { Module } from '@nestjs/common';
import { CompaniesPublicController } from './companies.controller';
import { CacheService } from '../../common/cache.service';

@Module({
  controllers: [CompaniesPublicController],
  providers: [CacheService],
})
export class CompaniesPublicModule {}
