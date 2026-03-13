import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SubStatus } from '@prisma/client';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Kullanıcının referral kodunu döndür. Yoksa oluştur.
   */
  async getMyCode(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    if (user.referralCode) return user.referralCode;

    // Generate and save (retry on collision)
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = generateReferralCode();
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { referralCode: code },
        });
        return code;
      } catch (err: any) {
        if (err?.code === 'P2002' && attempt < 2) continue; // unique collision, retry
        throw err;
      }
    }
    throw new BadRequestException('CODE_GENERATION_FAILED');
  }

  /**
   * Referral kodunu uygula — her iki tarafa 7 gün Premium trial ver.
   */
  async applyCode(userId: string, code: string) {
    const upperCode = code.toUpperCase();

    // 1. Kodu bulan kişiyi bul
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode: upperCode },
      select: { id: true, market: true },
    });
    if (!referrer) {
      throw new NotFoundException('INVALID_REFERRAL_CODE');
    }

    // 2. Kendi kodunu kullanamaz
    if (referrer.id === userId) {
      throw new BadRequestException('CANNOT_USE_OWN_CODE');
    }

    // 3. Zaten davet edilmiş mi?
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referredById: true, createdAt: true, subscription: { select: { status: true, currentPeriodEnd: true } } },
    });
    if (!user) throw new NotFoundException('USER_NOT_FOUND');
    if (user.referredById) {
      throw new ConflictException('REFERRAL_ALREADY_USED');
    }

    // 3b. Hesap en az 1 saat eski olmalı (bot/sahte hesap önlemi)
    const accountAgeMs = Date.now() - user.createdAt.getTime();
    if (accountAgeMs < 60 * 60 * 1000) {
      throw new BadRequestException('ACCOUNT_TOO_NEW');
    }

    // 4. Zaten aktif premium varsa
    const sub = user.subscription;
    const isActive =
      sub &&
      (sub.status === SubStatus.ACTIVE || sub.status === SubStatus.GRACE_PERIOD) &&
      (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());
    if (isActive) {
      throw new BadRequestException('ALREADY_PREMIUM');
    }

    // 5. Market'e uygun premium planı bul
    const userInfo = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { market: true },
    });
    const market = userInfo?.market ?? 'TR';

    const premiumPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { market, isActive: true, priceMonthly: { not: null } },
      select: { id: true },
      orderBy: { priceMonthly: 'asc' },
    });

    if (!premiumPlan) {
      throw new BadRequestException('PLAN_NOT_FOUND');
    }

    // AppConfig'den referral süresini oku
    const trialDaysConfig = await this.prisma.appConfig.findUnique({
      where: { key: 'referral_trial_days' },
    });
    const parsed = trialDaysConfig ? parseInt(trialDaysConfig.value, 10) : 7;
    const trialDays = Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
    const trialEnd = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000);

    // 6. Transaction: referredById güncelle + her iki tarafa subscription oluştur
    await this.prisma.$transaction(async (tx) => {
      // Davet edilen → referredById güncelle
      await tx.user.update({
        where: { id: userId },
        data: { referredById: referrer.id },
      });

      // Davet edilen → trial subscription
      await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planId: premiumPlan.id,
          status: SubStatus.ACTIVE,
          provider: 'REFERRAL',
          currentPeriodEnd: trialEnd,
        },
        update: {
          planId: premiumPlan.id,
          status: SubStatus.ACTIVE,
          provider: 'REFERRAL',
          currentPeriodEnd: trialEnd,
        },
      });

      // Davet eden → trial subscription (eğer aktif premium yoksa + cap aşılmadıysa)
      const referrerSub = await tx.subscription.findUnique({
        where: { userId: referrer.id },
        select: { status: true, currentPeriodEnd: true },
      });
      const referrerActive =
        referrerSub &&
        (referrerSub.status === SubStatus.ACTIVE || referrerSub.status === SubStatus.GRACE_PERIOD) &&
        (!referrerSub.currentPeriodEnd || referrerSub.currentPeriodEnd > new Date());

      // Referrer max 5 kez ödül alabilir (abuse önlemi)
      const MAX_REFERRER_REWARDS = 5;
      const referralCount = await tx.user.count({
        where: { referredById: referrer.id },
      });

      if (!referrerActive && referralCount <= MAX_REFERRER_REWARDS) {
        // Referrer'ın market'ine uygun plan bul
        const referrerPlan = await tx.subscriptionPlan.findFirst({
          where: { market: referrer.market, isActive: true, priceMonthly: { not: null } },
          select: { id: true },
          orderBy: { priceMonthly: 'asc' },
        });
        if (referrerPlan) {
          await tx.subscription.upsert({
            where: { userId: referrer.id },
            create: {
              userId: referrer.id,
              planId: referrerPlan.id,
              status: SubStatus.ACTIVE,
              provider: 'REFERRAL',
              currentPeriodEnd: trialEnd,
            },
            update: {
              planId: referrerPlan.id,
              status: SubStatus.ACTIVE,
              provider: 'REFERRAL',
              currentPeriodEnd: trialEnd,
            },
          });
        }
      }
    });

    // 7. Frozen takipleri aç (her iki taraf)
    await Promise.all([
      this.subscriptionsService.unfreezeUserFollows(userId),
      this.subscriptionsService.unfreezeUserFollows(referrer.id),
    ]);

    // 8. Push bildirim gönder (her iki tarafa kendi dillerinde)
    await Promise.all([
      this.notificationsService.sendReferralNotification(userId, 'activated'),
      this.notificationsService.sendReferralNotification(referrer.id, 'referred'),
    ]);

    this.logger.log(`Referral applied: ${userId} → referrer=${referrer.id}, trial until ${trialEnd.toISOString()}`);

    return { trialEnd, trialDays };
  }
}
