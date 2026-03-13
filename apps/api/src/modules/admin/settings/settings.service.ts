import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.appConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async update(key: string, value: string) {
    return this.prisma.appConfig.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}
