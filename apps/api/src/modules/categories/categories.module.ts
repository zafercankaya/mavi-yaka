import { Module } from '@nestjs/common';
import { CategoriesPublicController } from './categories.controller';

@Module({
  controllers: [CategoriesPublicController],
})
export class CategoriesPublicModule {}
