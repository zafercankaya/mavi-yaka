import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { PurchasesPackage } from 'react-native-purchases';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../src/store/auth';
import { useMarketStore } from '../src/store/market';
import { fetchPlans, fetchEntitlement, getCurrencySymbol, type SubscriptionPlan } from '../src/api/subscriptions';
import { useOfferings, purchasePackage, restorePurchases } from '../src/hooks/useRevenueCat';
import { trackEvent } from '../src/hooks/useAnalytics';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function SubscriptionScreen() {
  const { isAuthenticated } = useAuthStore();
  const market = useMarketStore((s) => s.market);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  // Analytics: track subscription page view
  useState(() => { trackEvent('subscription_view', { market }); });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans', market],
    queryFn: fetchPlans,
  });

  const { data: entitlement, isLoading: entitlementLoading } = useQuery({
    queryKey: ['entitlement'],
    queryFn: fetchEntitlement,
    enabled: isAuthenticated,
  });

  const { offerings, loading: offeringsLoading } = useOfferings();

  const findPackageForPlan = (plan: SubscriptionPlan): PurchasesPackage | undefined => {
    if (!offerings?.current) return undefined;
    const productId = Platform.OS === 'ios' ? plan.appleProductId : plan.googleProductId;
    if (!productId) return undefined;
    return offerings.current.availablePackages.find(
      (pkg: PurchasesPackage) => pkg.product.identifier === productId,
    );
  };

  const handleRestore = async () => {
    try {
      await restorePurchases();
      queryClient.invalidateQueries({ queryKey: ['entitlement'] });
      Alert.alert(t('common.success'), t('subscription.restoreSuccess'));
    } catch {
      Alert.alert(t('common.error'), t('subscription.restoreError'));
    }
  };

  if (plansLoading || entitlementLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Plan — Guest / Free / Premium */}
      {!isAuthenticated ? (
        <View style={styles.currentPlan}>
          <View style={styles.currentPlanHeader}>
            <Ionicons name="person-outline" size={24} color={Colors.textSecondary} />
            <Text style={styles.currentPlanTitle}>{t('subscription.currentPlan')}</Text>
          </View>
          <Text style={styles.currentPlanName}>{t('profile.guestUser')}</Text>
          <Text style={styles.guestHint}>{t('subscription.guestHint')}</Text>
          <TouchableOpacity
            style={[styles.subscribeButton, { marginTop: Spacing.md }]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.subscribeButtonText}>{t('guest.signUpFree')}</Text>
          </TouchableOpacity>
        </View>
      ) : entitlement ? (
        <View style={styles.currentPlan}>
          <View style={styles.currentPlanHeader}>
            <Ionicons
              name={entitlement.isPremium ? 'diamond' : 'shield-outline'}
              size={24}
              color={entitlement.isPremium ? Colors.primary : Colors.textSecondary}
            />
            <Text style={styles.currentPlanTitle}>{t('subscription.currentPlan')}</Text>
          </View>
          <Text style={styles.currentPlanName}>
            {entitlement.isPremium ? entitlement.planName : t('profile.freePlan')}
          </Text>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>{t('subscription.companyFollowLimit')}</Text>
            <Text style={styles.usageValue}>
              {entitlement.currentCompanyFollowCount} / {entitlement.maxCompanyFollows === -1 ? '∞' : entitlement.maxCompanyFollows}
            </Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>{t('subscription.dailyViews')}</Text>
            <Text style={styles.usageValue}>
              {entitlement.dailyViewLimit === -1 ? t('common.unlimited') : entitlement.dailyViewLimit}
            </Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>{t('subscription.advancedFilters')}</Text>
            <Text style={styles.usageValue}>
              {entitlement.hasAdvancedFilter ? t('common.available') : t('common.unavailable')}
            </Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>{t('subscription.adFree')}</Text>
            <Text style={styles.usageValue}>
              {entitlement.adFree ? t('common.yes') : t('common.no')}
            </Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>{t('subscription.weeklyDigest')}</Text>
            <Text style={styles.usageValue}>
              {entitlement.weeklyDigest ? t('common.available') : t('common.unavailable')}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Frozen banner */}
      {entitlement && !entitlement.isPremium && (entitlement.frozenCompanyFollowCount > 0 || entitlement.frozenCompanyFollowCount > 0) && (
        <View style={styles.frozenBanner}>
          <Ionicons name="lock-closed" size={20} color="#E65100" />
          <Text style={styles.frozenBannerText}>
            {t('subscription.frozenBanner', {
              companies: entitlement.frozenCompanyFollowCount,
              jobs: entitlement.frozenCompanyFollowCount,
            })}
          </Text>
        </View>
      )}

      {/* Referral banner */}
      {entitlement && !entitlement.isPremium && (
        <TouchableOpacity style={styles.referralBanner} onPress={() => router.push('/referral')}>
          <Ionicons name="gift-outline" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.referralBannerTitle}>{t('subscription.referralTitle')}</Text>
            <Text style={styles.referralBannerText}>{t('subscription.referralHint')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Plans */}
      <Text style={styles.sectionTitle}>{t('subscription.plans')}</Text>

      {plans?.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrent={entitlement?.planName === plan.name}
          isPremium={entitlement?.isPremium ?? false}
          isAuthenticated={isAuthenticated}
          rcPackage={findPackageForPlan(plan)}
          onPurchaseSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['entitlement'] });
          }}
        />
      ))}

      {/* If no plans available */}
      {(!plans || plans.length === 0) && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('subscription.noPlans')}</Text>
        </View>
      )}

      {/* Restore Purchases */}
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreButtonText}>{t('subscription.restore')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/profile'); }}>
        <Text style={styles.backButtonText}>{t('subscription.goBack')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function PlanCard({
  plan,
  isCurrent,
  isPremium,
  isAuthenticated,
  rcPackage,
  onPurchaseSuccess,
}: {
  plan: SubscriptionPlan;
  isCurrent: boolean;
  isPremium: boolean;
  isAuthenticated: boolean;
  rcPackage?: PurchasesPackage;
  onPurchaseSuccess: () => void;
}) {
  const [purchasing, setPurchasing] = useState(false);

  const { t } = useTranslation();

  const handleSubscribe = async () => {
    if (!rcPackage) {
      Alert.alert(t('common.info'), t('subscription.unavailableMsg'));
      return;
    }

    setPurchasing(true);
    try {
      await purchasePackage(rcPackage);
      onPurchaseSuccess();
      trackEvent('subscription_purchase', { plan: plan.name });
      Alert.alert(t('common.success'), t('subscription.subscriptionActivated'));
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert(t('common.error'), t('subscription.purchaseFailed'));
      }
    } finally {
      setPurchasing(false);
    }
  };

  const isFreePlan = !plan.priceMonthly && !plan.priceYearly;

  const rcPrice = rcPackage?.product.priceString;
  const sym = getCurrencySymbol(plan.currency);

  return (
    <View style={[styles.planCard, isCurrent && styles.planCardCurrent]}>
      {isCurrent && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>{t('common.current')}</Text>
        </View>
      )}

      <Text style={styles.planName}>{plan.name}</Text>

      {/* Price */}
      {isFreePlan ? (
        <Text style={styles.planPrice}>{t('common.free')}</Text>
      ) : (
        <View>
          <Text style={styles.planPrice}>
            {rcPrice ?? t('subscription.monthly', { price: `${sym}${Number(plan.priceMonthly).toFixed(2)}` })}
          </Text>
          {!rcPrice && plan.priceYearly && (
            <Text style={styles.planPriceYearly}>
              {t('subscription.yearly', { price: `${sym}${Number(plan.priceYearly).toFixed(2)}` })}
            </Text>
          )}
        </View>
      )}

      {/* Features */}
      <View style={styles.features}>
        <FeatureRow
          label={t('subscription.companyFollowLimit')}
          value={plan.maxCompanyFollows === -1 ? t('common.unlimited') : `${plan.maxCompanyFollows}`}
          highlighted={plan.maxCompanyFollows === -1}
        />
        <FeatureRow
          label={t('subscription.dailyViews')}
          value={plan.dailyViewLimit === -1 ? t('common.unlimited') : `${plan.dailyViewLimit}`}
          highlighted={plan.dailyViewLimit === -1}
        />
        <FeatureRow
          label={t('subscription.advancedFilters')}
          value={plan.hasAdvancedFilter ? t('common.available') : t('common.unavailable')}
          highlighted={plan.hasAdvancedFilter}
        />
        <FeatureRow
          label={t('subscription.adFree')}
          value={plan.adFree ? t('common.yes') : t('common.no')}
          highlighted={plan.adFree}
        />
        <FeatureRow
          label={t('subscription.weeklyDigest')}
          value={plan.weeklyDigest ? t('common.available') : t('common.unavailable')}
          highlighted={plan.weeklyDigest}
        />
      </View>

      {/* Subscribe / Sign Up Button */}
      {!isCurrent && !isFreePlan && isAuthenticated && (
        <TouchableOpacity
          style={[styles.subscribeButton, purchasing && styles.buttonDisabled]}
          onPress={handleSubscribe}
          disabled={purchasing}
        >
          <Text style={styles.subscribeButtonText}>
            {purchasing ? t('common.processing') : isPremium ? t('subscription.changePlan') : t('subscription.subscribe')}
          </Text>
        </TouchableOpacity>
      )}
      {!isAuthenticated && !isFreePlan && (
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.subscribeButtonText}>{t('subscription.subscribe')}</Text>
        </TouchableOpacity>
      )}
      {!isAuthenticated && isFreePlan && (
        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: Colors.success }]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.subscribeButtonText}>{t('guest.signUpFree')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function FeatureRow({
  label,
  value,
  highlighted,
}: {
  label: string;
  value: string;
  highlighted: boolean;
}) {
  return (
    <View style={styles.featureRow}>
      <Ionicons
        name={highlighted ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={highlighted ? Colors.success : Colors.textLight}
      />
      <Text style={styles.featureLabel}>{label}</Text>
      <Text style={[styles.featureValue, highlighted && styles.featureValueHighlighted]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Current Plan
  currentPlan: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  currentPlanTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  currentPlanName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  usageLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  usageValue: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  guestHint: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },

  // Frozen banner
  frozenBanner: {
    backgroundColor: '#FFF3E0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  frozenBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: '#E65100',
    lineHeight: 18,
  },
  // Referral banner
  referralBanner: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  referralBannerTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.text },
  referralBannerText: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },

  // Section
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Plan Card
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planCardCurrent: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  currentBadge: {
    position: 'absolute',
    top: -10,
    right: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  currentBadgeText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.white },
  planName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  planPrice: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.primary },
  planPricePeriod: { fontSize: FontSize.md, fontWeight: '400', color: Colors.textSecondary },
  planPriceYearly: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },

  // Features
  features: { marginTop: Spacing.md, gap: Spacing.sm },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureLabel: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  featureValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  featureValueHighlighted: { color: Colors.success },

  // Subscribe Button
  subscribeButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  subscribeButtonText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  buttonDisabled: { opacity: 0.6 },

  // Restore
  restoreButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  restoreButtonText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },

  // Empty
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary },

  // Back
  backButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  backButtonText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
});
