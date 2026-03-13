import { Injectable, NotFoundException } from '@nestjs/common';
import { Market } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateSourceDto, UpdateSourceDto } from './sources.dto';

@Injectable()
export class SourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(sector?: string, companyId?: string, market?: Market) {
    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    } else if (sector) {
      where.company = { sector };
    }
    if (market) where.market = market;
    return this.prisma.crawlSource.findMany({
      where,
      include: { company: { select: { name: true, sector: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const source = await this.prisma.crawlSource.findUnique({
      where: { id },
      include: { company: { select: { name: true } } },
    });
    if (!source) throw new NotFoundException('Kaynak bulunamadı');
    return source;
  }

  async create(dto: CreateSourceDto) {
    return this.prisma.crawlSource.create({
      data: {
        companyId: dto.companyId,
        name: dto.name,
        crawlMethod: dto.crawlMethod,
        seedUrls: dto.seedUrls,
        maxDepth: dto.maxDepth ?? 2,
        selectors: dto.selectors ?? undefined,
        schedule: dto.schedule ?? '0 3 * * *',
        agingDays: dto.agingDays ?? 7,
        market: dto.market ?? Market.TR,
      },
      include: { company: { select: { name: true } } },
    });
  }

  async update(id: string, dto: UpdateSourceDto) {
    await this.findOne(id);
    return this.prisma.crawlSource.update({
      where: { id },
      data: dto as any,
      include: { company: { select: { name: true } } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      // Delete job listings of this source (saved jobs cascade automatically)
      await tx.jobListing.deleteMany({ where: { sourceId: id } });
      // Delete the source (logs cascade automatically)
      return tx.crawlSource.delete({ where: { id } });
    });
  }
}
