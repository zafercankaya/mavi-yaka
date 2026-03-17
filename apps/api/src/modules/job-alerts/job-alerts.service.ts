import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobAlertDto, UpdateJobAlertDto } from './job-alerts.dto';

@Injectable()
export class JobAlertsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findUserAlerts(userId: string) {
    return this.prisma.jobAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateJobAlertDto) {
    // Check alert limit from subscription plan
    const canAdd = await this.canAddAlert(userId);
    if (!canAdd) {
      throw new ForbiddenException('ALERT_LIMIT_REACHED');
    }

    return this.prisma.jobAlert.create({
      data: {
        userId,
        name: dto.name,
        country: dto.country,
        state: dto.state,
        city: dto.city,
        sector: dto.sector,
        jobType: dto.jobType,
        workMode: dto.workMode,
        keywords: dto.keywords,
        salaryMin: dto.salaryMin,
      },
    });
  }

  async update(userId: string, alertId: string, dto: UpdateJobAlertDto) {
    const alert = await this.prisma.jobAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) throw new NotFoundException('ALERT_NOT_FOUND');
    if (alert.userId !== userId) throw new ForbiddenException('NOT_YOUR_ALERT');

    return this.prisma.jobAlert.update({
      where: { id: alertId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.sector !== undefined && { sector: dto.sector }),
        ...(dto.jobType !== undefined && { jobType: dto.jobType }),
        ...(dto.workMode !== undefined && { workMode: dto.workMode }),
        ...(dto.keywords !== undefined && { keywords: dto.keywords }),
        ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(userId: string, alertId: string) {
    const alert = await this.prisma.jobAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) throw new NotFoundException('ALERT_NOT_FOUND');
    if (alert.userId !== userId) throw new ForbiddenException('NOT_YOUR_ALERT');

    await this.prisma.jobAlert.delete({ where: { id: alertId } });
    return { deleted: true };
  }

  private async canAddAlert(userId: string): Promise<boolean> {
    // Get user's subscription plan limits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: {
          select: { plan: { select: { maxAlerts: true } }, status: true },
        },
      },
    });

    const sub = user?.subscription;
    const maxAlerts = (sub?.status === 'ACTIVE' ? sub.plan?.maxAlerts : null) ?? 1;
    if (maxAlerts === -1) return true; // unlimited

    const currentCount = await this.prisma.jobAlert.count({
      where: { userId },
    });

    return currentCount < maxAlerts;
  }
}
