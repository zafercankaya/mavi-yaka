import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    // Lazy connection: don't block startup, Prisma connects on first query.
    // This lets the container pass Render's health check before DB is ready.
    this.$connect()
      .then(() => this.logger.log('Database connected'))
      .catch((err: Error) => this.logger.warn(`DB initial connect failed (will retry on first query): ${err.message}`));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
