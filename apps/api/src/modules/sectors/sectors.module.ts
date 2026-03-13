import { Module } from '@nestjs/common';
import { SectorsPublicController } from './sectors.controller';

@Module({
  controllers: [SectorsPublicController],
})
export class SectorsPublicModule {}
