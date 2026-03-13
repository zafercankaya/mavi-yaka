import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Market, SubStatus } from '@prisma/client';
import type { RevenueCatEvent } from './dto/revenuecat-webhook.dto';

/** Free plan defaults when user has no subscription */
const FREE_PLAN = {
  planName: 'Free',
  maxCompanyFollows: 1,
  maxSavedJobs: 1,
  dailyViewLimit: 20,
  hasAdvancedFilter: false,
  adFree: false,
  weeklyDigest: false,
  isPremium: false,
};

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Kullanıcının mevcut plan haklarını döndürür.
   */
  async getEntitlement(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscription: {
          select: {
            status: true,
            currentPeriodEnd: true,
            plan: {
              select: {
                name: true,
                maxCompanyFollows: true,
                maxSavedJobs: true,
                dailyViewLimit: true,
                hasAdvancedFilter: true,
                adFree: true,
                weeklyDigest: true,
              },
            },
          },
        },
        _count: { select: { followedCompanies: true, savedJobs: true } },
      },
    });

    if (!user) throw new NotFoundException('USER_NOT_FOUND');

    const sub = user.subscription;
    const isActive =
      sub &&
      (sub.status === SubStatus.ACTIVE || sub.status === SubStatus.GRACE_PERIOD) &&
      (!sub.currentPeriodEnd || sub.currentPeriodEnd > new Date());

    // Frozen counts + active-only saved job count (exclude expired jobs)
    const [frozenFollows, frozenSavedJobs, activeSavedJobCount] = await Promise.all([
      this.prisma.followedCompany.count({ where: { userId, isFrozen: true } }),
      this.prisma.savedJob.count({ where: { userId, isFrozen: true } }),
      this.prisma.savedJob.count({ where: { userId, jobListing: { status: 'ACTIVE' } } }),
    ]);

    if (!isActive) {
      // Lazy freeze: premium değilse ve limit aşılıyorsa dondur
      const activeFollows = user._count.followedCompanies - frozenFollows;
      const activeSavedJobs = activeSavedJobCount - frozenSavedJobs;
      if (activeFollows > FREE_PLAN.maxCompanyFollows || activeSavedJobs > FREE_PLAN.maxSavedJobs) {
        await this.freezeUserFollows(userId);
        // Recount after freeze
        const newFrozenFollows = await this.prisma.followedCompany.count({ where: { userId, isFrozen: true } });
        const newFrozenSavedJobs = await this.prisma.savedJob.count({ where: { userId, isFrozen: true } });
        return {
          ...FREE_PLAN,
          currentCompanyFollowCount: user._count.followedCompanies,
          currentSavedJobCount: activeSavedJobCount,
          frozenCompanyFollowCount: newFrozenFollows,
          frozenSavedJobCount: newFrozenSavedJobs,
        };
      }

      return {
        ...FREE_PLAN,
        currentCompanyFollowCount: user._count.followedCompanies,
        currentSavedJobCount: activeSavedJobCount,
        frozenCompanyFollowCount: frozenFollows,
        frozenSavedJobCount: frozenSavedJobs,
      };
    }

    return {
      planName: sub!.plan.name,
      maxCompanyFollows: sub!.plan.maxCompanyFollows,
      maxSavedJobs: sub!.plan.maxSavedJobs,
      dailyViewLimit: sub!.plan.dailyViewLimit,
      hasAdvancedFilter: sub!.plan.hasAdvancedFilter,
      adFree: sub!.plan.adFree,
      weeklyDigest: sub!.plan.weeklyDigest,
      isPremium: true,
      currentCompanyFollowCount: user._count.followedCompanies,
      currentSavedJobCount: activeSavedJobCount,
      frozenCompanyFollowCount: frozenFollows,
      frozenSavedJobCount: frozenSavedJobs,
    };
  }

  /**
   * Aktif planları listeler (mobil abonelik ekranı için).
   * Market parametresi verilirse sadece o market'in planlarını döner.
   */
  async getActivePlans(market?: Market) {
    return this.prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
        ...(market && { market }),
      },
      select: {
        id: true,
        name: true,
        market: true,
        currency: true,
        appleProductId: true,
        googleProductId: true,
        priceMonthly: true,
        priceYearly: true,
        maxCompanyFollows: true,
        maxSavedJobs: true,
        dailyViewLimit: true,
        hasAdvancedFilter: true,
        adFree: true,
        weeklyDigest: true,
      },
      orderBy: { priceMonthly: { sort: 'asc', nulls: 'first' } },
    });
  }

  /**
   * Apple / Google receipt doğrulama ve subscription oluşturma.
   * Gerçek production'da Apple App Store Server API ve Google Play Developer API
   * ile doğrulama yapılır. Şimdilik temel yapıyı kuruyoruz.
   */
  async verifyAndActivate(
    userId: string,
    provider: 'APPLE' | 'GOOGLE',
    receipt: string,
    productId: string,
  ) {
    // Find the plan by product ID
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: provider === 'APPLE'
        ? { appleProductId: productId }
        : { googleProductId: productId },
    });

    if (!plan) {
      throw new BadRequestException('INVALID_PRODUCT_ID');
    }

    // TODO: Gerçek receipt doğrulama
    // Apple: App Store Server API v2 ile verify
    // Google: Google Play Developer API ile verify
    this.logger.log(
      `Receipt verification for user=${userId} provider=${provider} product=${productId}`,
    );

    // Subscription period (monthly or yearly based on productId)
    const isYearly = productId.includes('yearly') || productId.includes('annual');
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (isYearly ? 12 : 1));

    // Upsert subscription
    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId: plan.id,
        provider,
        providerSubId: receipt.substring(0, 100),
        status: SubStatus.ACTIVE,
        currentPeriodEnd: periodEnd,
      },
      update: {
        planId: plan.id,
        provider,
        providerSubId: receipt.substring(0, 100),
        status: SubStatus.ACTIVE,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    });

    this.logger.log(`Subscription activated: user=${userId} plan=${plan.name}`);

    return subscription;
  }

  /**
   * Subscription iptal et.
   */
  async cancel(userId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub) throw new NotFoundException('SUBSCRIPTION_NOT_FOUND');

    return this.prisma.subscription.update({
      where: { userId },
      data: { status: SubStatus.CANCELLED },
    });
  }

  /**
   * Kullanıcının şirket takip limiti dahilinde olup olmadığını kontrol eder.
   */
  async canAddCompanyFollow(userId: string): Promise<boolean> {
    const entitlement = await this.getEntitlement(userId);
    if (entitlement.maxCompanyFollows === -1) return true;
    const activeCount = entitlement.currentCompanyFollowCount - entitlement.frozenCompanyFollowCount;
    return activeCount < entitlement.maxCompanyFollows;
  }

  /**
   * Kullanıcının kayıtlı ilan limiti dahilinde olup olmadığını kontrol eder.
   */
  async canAddSavedJob(userId: string): Promise<boolean> {
    const entitlement = await this.getEntitlement(userId);
    if (entitlement.maxSavedJobs === -1) return true;
    const activeCount = entitlement.currentSavedJobCount - entitlement.frozenSavedJobCount;
    return activeCount < entitlement.maxSavedJobs;
  }

  /**
   * Kullanıcının günlük görüntüleme limitini döndürür.
   */
  async getDailyViewLimit(userId: string): Promise<number> {
    const entitlement = await this.getEntitlement(userId);
    return entitlement.dailyViewLimit;
  }

  /**
   * Premium sona erdiğinde: en son takip edilen N kayıt aktif kalır, kalanlar frozen.
   */
  async freezeUserFollows(userId: string) {
    const follows = await this.prisma.followedCompany.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    // İlk N aktif kalır (free limit), kalanlar frozen
    const toFreeze = follows.slice(FREE_PLAN.maxCompanyFollows).map((f) => f.id);
    if (toFreeze.length > 0) {
      await this.prisma.followedCompany.updateMany({
        where: { id: { in: toFreeze } },
        data: { isFrozen: true },
      });
    }
    // Aktif kalanları unfreeze et (eğer daha önce frozen ise)
    const toUnfreeze = follows.slice(0, FREE_PLAN.maxCompanyFollows).map((f) => f.id);
    if (toUnfreeze.length > 0) {
      await this.prisma.followedCompany.updateMany({
        where: { id: { in: toUnfreeze }, isFrozen: true },
        data: { isFrozen: false },
      });
    }

    // Saved Jobs
    const savedJobs = await this.prisma.savedJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    const toFreezeSaved = savedJobs.slice(FREE_PLAN.maxSavedJobs).map((f) => f.id);
    if (toFreezeSaved.length > 0) {
      await this.prisma.savedJob.updateMany({
        where: { id: { in: toFreezeSaved } },
        data: { isFrozen: true },
      });
    }
    const toUnfreezeSaved = savedJobs.slice(0, FREE_PLAN.maxSavedJobs).map((f) => f.id);
    if (toUnfreezeSaved.length > 0) {
      await this.prisma.savedJob.updateMany({
        where: { id: { in: toUnfreezeSaved }, isFrozen: true },
        data: { isFrozen: false },
      });
    }

    this.logger.log(`Follows frozen: user=${userId} follows=${toFreeze.length} savedJobs=${toFreezeSaved.length}`);
  }

  /**
   * Premium aktif olduğunda: tüm frozen takipleri aç.
   */
  async unfreezeUserFollows(userId: string) {
    const [follows, savedJobs] = await Promise.all([
      this.prisma.followedCompany.updateMany({
        where: { userId, isFrozen: true },
        data: { isFrozen: false },
      }),
      this.prisma.savedJob.updateMany({
        where: { userId, isFrozen: true },
        data: { isFrozen: false },
      }),
    ]);
    if (follows.count > 0 || savedJobs.count > 0) {
      this.logger.log(`Follows unfrozen: user=${userId} follows=${follows.count} savedJobs=${savedJobs.count}`);
    }
  }

  /**
   * RevenueCat webhook event'lerini işler.
   * Subscription durumunu DB'de günceller.
   */
  async handleRevenueCatWebhook(event: RevenueCatEvent) {
    const userId = event.app_user_id;
    const productId = event.product_id;
    const store = event.store;

    this.logger.log(
      `RevenueCat webhook: type=${event.type} user=${userId} product=${productId} store=${store}`,
    );

    const provider = store === 'APP_STORE' ? 'APPLE' : 'GOOGLE';

    // Product ID ile planı bul
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: provider === 'APPLE'
        ? { appleProductId: productId }
        : { googleProductId: productId },
    });

    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'UNCANCELLATION': {
        if (!plan) {
          this.logger.warn(`Plan bulunamadı: product=${productId}`);
          return;
        }

        const periodEnd = event.expiration_at_ms
          ? new Date(event.expiration_at_ms)
          : null;

        await this.prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId: plan.id,
            provider,
            providerSubId: `rc_${userId}_${productId}`,
            status: SubStatus.ACTIVE,
            currentPeriodEnd: periodEnd,
          },
          update: {
            planId: plan.id,
            provider,
            status: SubStatus.ACTIVE,
            currentPeriodEnd: periodEnd,
          },
        });
        this.logger.log(`Abonelik aktif: user=${userId} plan=${plan.name}`);
        // Premium aktif → frozen takipleri aç
        await this.unfreezeUserFollows(userId);
        break;
      }

      case 'CANCELLATION': {
        await this.prisma.subscription.updateMany({
          where: { userId },
          data: { status: SubStatus.CANCELLED },
        });
        this.logger.log(`Abonelik iptal: user=${userId}`);
        // Premium bitti → fazla takipleri dondur
        await this.freezeUserFollows(userId);
        break;
      }

      case 'EXPIRATION': {
        await this.prisma.subscription.updateMany({
          where: { userId },
          data: { status: SubStatus.EXPIRED },
        });
        this.logger.log(`Abonelik sona erdi: user=${userId}`);
        // Premium bitti → fazla takipleri dondur
        await this.freezeUserFollows(userId);
        break;
      }

      case 'BILLING_ISSUE': {
        await this.prisma.subscription.updateMany({
          where: { userId },
          data: { status: SubStatus.GRACE_PERIOD },
        });
        this.logger.log(`Ödeme sorunu: user=${userId} → GRACE_PERIOD`);
        break;
      }

      case 'PRODUCT_CHANGE': {
        if (!plan) {
          this.logger.warn(`Plan bulunamadı (product change): product=${productId}`);
          return;
        }
        await this.prisma.subscription.updateMany({
          where: { userId },
          data: { planId: plan.id },
        });
        this.logger.log(`Plan değişikliği: user=${userId} → ${plan.name}`);
        break;
      }

      default:
        this.logger.log(`İşlenmemiş RevenueCat event: ${event.type}`);
    }
  }
}
