import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { JobStatus, Market, Sector, Prisma } from '@prisma/client';
import { UpdateJobListingDto } from './jobs.dto';

@Injectable()
export class AdminJobsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    status?: JobStatus;
    sector?: Sector;
    companyId?: string;
    search?: string;
    country?: Market;
    page?: number;
    limit?: number;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.JobListingWhereInput = {
      ...(params.status && { status: params.status }),
      ...(params.country && { country: params.country }),
      ...(params.sector && { sector: params.sector }),
      ...(params.companyId && { companyId: params.companyId }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' as const } },
          { description: { contains: params.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      this.prisma.jobListing.findMany({
        where,
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.jobListing.count({ where }),
    ]);

    return {
      items: jobs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.jobListing.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true } },
      },
    });
    if (!job) throw new NotFoundException('İş ilanı bulunamadı');
    return job;
  }

  async update(id: string, dto: UpdateJobListingDto) {
    await this.findOne(id);
    return this.prisma.jobListing.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.deadline && { deadline: new Date(dto.deadline) }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.jobListing.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.jobListing.deleteMany({
      where: { id: { in: ids } },
    });
    return { deleted: result.count };
  }

  async markExpired(id: string) {
    await this.findOne(id);
    return this.prisma.jobListing.update({
      where: { id },
      data: { status: JobStatus.EXPIRED },
    });
  }
}
