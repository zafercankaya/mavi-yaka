import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JobStatus, Market } from '@prisma/client';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

type SavedJobFilter = 'active' | 'expired';

@Injectable()
export class SavedJobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findUserSavedJobs(userId: string, filter: SavedJobFilter = 'active', market?: Market) {
    const jobConditions: any = {};

    if (market) {
      jobConditions.market = market;
    }

    if (filter === 'active') {
      jobConditions.status = JobStatus.ACTIVE;
    } else if (filter === 'expired') {
      jobConditions.OR = [
        { status: JobStatus.EXPIRED },
        { status: JobStatus.REMOVED },
      ];
    }

    const where: any = { userId };
    if (Object.keys(jobConditions).length > 0) {
      where.jobListing = jobConditions;
    }

    return this.prisma.savedJob.findMany({
      where,
      select: {
        id: true,
        jobListingId: true,
        createdAt: true,
        jobListing: {
          include: {
            company: { select: { id: true, name: true, slug: true, logoUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async toggle(userId: string, jobId: string) {
    const jobListing = await this.prisma.jobListing.findUnique({ where: { id: jobId } });
    if (!jobListing) throw new NotFoundException('JOB_NOT_FOUND');

    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobListingId: { userId, jobListingId: jobId } },
    });

    if (existing) {
      await this.prisma.savedJob.delete({ where: { id: existing.id } });
      return { saved: false };
    }

    // Kaydetme limiti kontrolu (sadece ekleme sirasinda)
    const canAdd = await this.subscriptionsService.canAddSavedJob(userId);
    if (!canAdd) {
      throw new ForbiddenException('SAVED_JOB_LIMIT_REACHED');
    }

    await this.prisma.savedJob.create({ data: { userId, jobListingId: jobId } });
    return { saved: true };
  }

  async isSaved(userId: string, jobId: string) {
    const saved = await this.prisma.savedJob.findUnique({
      where: { userId_jobListingId: { userId, jobListingId: jobId } },
    });
    return { saved: !!saved };
  }

  async count(jobId: string) {
    const count = await this.prisma.savedJob.count({ where: { jobListingId: jobId } });
    return { count };
  }
}
