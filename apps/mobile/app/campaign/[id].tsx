import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Share, StyleSheet, Dimensions, Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useInterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../src/hooks/useAnalytics';
import { fetchCampaignById } from '../../src/api/campaigns';
import { getCategoryDisplayName } from '../../src/api/brands';
import { checkFavoriteStatus, toggleFavorite } from '../../src/api/favorites';
import { useAuthStore } from '../../src/store/auth';
import { useMarketStore } from '../../src/store/market';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_UNIT_IDS } from '../../src/constants/ads';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { findCampaignImage } from '../../src/utils/image';
import { maybeRequestReview } from '../../src/hooks/useStoreReview';
import { getApiErrorMessage } from '../../src/utils/api-error';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function CampaignDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const market = useMarketStore((s) => s.market);
  const adFree = useAdFree();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

  // Interstitial ad — preload on mount for free users
  const { isLoaded, load, show, isClosed } = useInterstitialAd(AD_UNIT_IDS.INTERSTITIAL);
  const pendingOpenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!adFree) load();
  }, [adFree, load]);

  // When interstitial closes, open the browser
  useEffect(() => {
    if (isClosed && pendingOpenRef.current) {
      WebBrowser.openBrowserAsync(pendingOpenRef.current);
      pendingOpenRef.current = null;
      load(); // preload next interstitial
    }
  }, [isClosed, load]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => fetchCampaignById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: favStatus } = useQuery({
    queryKey: ['favorite-status', id],
    queryFn: () => checkFavoriteStatus(id!),
    enabled: !!id && isAuthenticated,
  });

  const favMutation = useMutation({
    mutationFn: () => toggleFavorite(id!),
    onSuccess: (result) => {
      queryClient.setQueryData(['favorite-status', id], result);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      if (result?.favorited) maybeRequestReview();
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const msg = getApiErrorMessage(err, t, 'campaign.favoriteError');
      const title = status === 403 ? t('common.warning') : t('common.error');
      Alert.alert(title, msg);
    },
  });

  const isFavorited = favStatus?.favorited ?? false;

  // Track campaign view — must be before any early returns (React hooks rule)
  useEffect(() => {
    if (data) {
      trackEvent('campaign_view', {
        campaign_id: id,
        brand: data.brand?.name,
        category: data.category?.slug,
      });
    }
  }, [data?.id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textLight} />
        <Text style={styles.errorText}>{t('campaign.notFound')}</Text>
      </View>
    );
  }

  const campaign = data;

  const locale = { tr: 'tr-TR', de: 'de-DE', pt: 'pt-BR', id: 'id-ID', ru: 'ru-RU', es: 'es-ES', ja: 'ja-JP', th: 'th-TH', fr: 'fr-FR', it: 'it-IT', ar: 'ar-SA', ko: 'ko-KR', vi: 'vi-VN', pl: 'pl-PL', ms: 'ms-MY', nl: 'nl-NL', ur: 'ur-PK', sv: 'sv-SE' }[i18n.language] || 'en-US';
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleOpenLink = async () => {
    if (!campaign.sourceUrl) return;
    if (!adFree && isLoaded) {
      pendingOpenRef.current = campaign.sourceUrl;
      show();
    } else {
      await WebBrowser.openBrowserAsync(campaign.sourceUrl);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://kampanya-sepeti-api-3c9f.onrender.com/share/c/${id}`;
      await Share.share({
        message: `${campaign.title}\n\n${shareUrl}`,
        title: campaign.title,
      });
      trackEvent('campaign_share', { campaign_id: id, brand: campaign.brand?.name });
    } catch {}
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: campaign.brand?.name || t('campaign.defaultTitle'),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TouchableOpacity
                onPress={() => {
                  if (!isAuthenticated) {
                    Alert.alert(
                      t('guest.featureRequiresAccount'),
                      t('guest.signUpToFavorite'),
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('guest.signUpFree'), onPress: () => router.push('/(auth)/register') },
                      ],
                    );
                    return;
                  }
                  favMutation.mutate();
                }}
                style={{ padding: 8 }}
                disabled={favMutation.isPending}
              >
                <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorited ? Colors.error : Colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={{ padding: 8 }}>
                <Ionicons name="share-outline" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Image — prefer real campaign image, fall back to brand logo */}
        {(() => {
          const campaignImage = findCampaignImage(campaign.imageUrls);
          const brandLogo = campaign.brand?.logoUrl;

          if (campaignImage) {
            // Real campaign banner/image
            return (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: campaignImage }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                />
                {campaign.discountRate != null && Number(campaign.discountRate) > 0 ? (
                  <View style={styles.imageDiscountBadge}>
                    <Text style={styles.imageDiscountText}>%{campaign.discountRate}</Text>
                  </View>
                ) : null}
              </View>
            );
          }

          if (brandLogo) {
            // No campaign image → show brand logo centered
            return (
              <View style={styles.brandLogoWrapper}>
                <Image
                  source={{ uri: brandLogo }}
                  style={styles.brandLogoImage}
                  contentFit="contain"
                  transition={200}
                />
                {campaign.discountRate != null && Number(campaign.discountRate) > 0 ? (
                  <View style={styles.imageDiscountBadge}>
                    <Text style={styles.imageDiscountText}>%{campaign.discountRate}</Text>
                  </View>
                ) : null}
              </View>
            );
          }

          // No image and no brand logo
          return (
            <View style={styles.noImageHeader}>
              {campaign.brand && (
                <Text style={styles.noImageBrand}>{campaign.brand.name}</Text>
              )}
              {campaign.discountRate != null && Number(campaign.discountRate) > 0 ? (
                <View style={styles.noImageDiscountBadge}>
                  <Text style={styles.noImageDiscountText}>{t('campaign.discountBadge', { rate: campaign.discountRate })}</Text>
                </View>
              ) : null}
            </View>
          );
        })()}

        {/* Header */}
        <View style={styles.header}>
          {campaign.imageUrls.length > 0 && (
            <View style={styles.badges}>
              {campaign.brand && (
                <View style={styles.brandBadge}>
                  <Text style={styles.brandText}>{campaign.brand.name}</Text>
                </View>
              )}
              {campaign.discountRate != null && Number(campaign.discountRate) > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{t('campaign.discountBadge', { rate: campaign.discountRate })}</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.title}>{campaign.title}</Text>

          {campaign.category && (
            <View style={styles.categoryChip}>
              <Ionicons name="grid-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.categoryText}>{getCategoryDisplayName(campaign.category, market)}</Text>
            </View>
          )}
        </View>

        {/* Dates */}
        {(campaign.startDate || campaign.endDate) && (
          <View style={styles.dateCard}>
            {campaign.startDate && (
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.dateLabel}>{t('campaign.startDate')}</Text>
                <Text style={styles.dateValue}>{formatDate(campaign.startDate)}</Text>
              </View>
            )}
            {campaign.endDate && (
              <View style={styles.dateRow}>
                <Ionicons name="time-outline" size={16} color={Colors.warning} />
                <Text style={styles.dateLabel}>{t('campaign.endDate')}</Text>
                <Text style={[styles.dateValue, { color: Colors.warning }]}>
                  {formatDate(campaign.endDate)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Description */}
        {campaign.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('campaign.descriptionSection')}</Text>
            <Text style={styles.description}>{campaign.description}</Text>
          </View>
        )}

        {/* Promo Code */}
        {campaign.promoCode ? (
          <PromoCodeBox code={campaign.promoCode} t={t} />
        ) : null}

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={handleOpenLink}>
          <Ionicons name="open-outline" size={20} color={Colors.white} />
          <Text style={styles.ctaText}>{t('campaign.goToCampaign')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

function PromoCodeBox({ code, t }: { code: string; t: (key: string) => string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <View style={styles.promoSection}>
      <Text style={styles.promoLabel}>{t('campaign.promoCode')}</Text>
      <View style={styles.promoBox}>
        <Text style={styles.promoCodeText}>{code}</Text>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={Colors.white} />
          <Text style={styles.copyButtonText}>
            {copied ? t('campaign.codeCopied') : t('campaign.copyCode')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.md, color: Colors.textSecondary },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: SCREEN_WIDTH * 0.56,
    backgroundColor: Colors.surfaceVariant,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageDiscountBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  imageDiscountText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  brandLogoWrapper: {
    position: 'relative',
    width: '100%',
    height: SCREEN_WIDTH * 0.45,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  brandLogoImage: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.25,
  },
  noImageHeader: {
    width: '100%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noImageBrand: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  noImageDiscountBadge: {
    backgroundColor: Colors.discount,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  noImageDiscountText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#fff',
  },
  header: { padding: Spacing.md },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  brandBadge: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  brandText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  discountBadge: {
    backgroundColor: Colors.discount,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  discountText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.white },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text, lineHeight: 30 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  categoryText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dateCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  dateLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dateValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text },
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, lineHeight: 22 },
  promoSection: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  promoLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  promoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primaryLight + '15',
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    borderStyle: 'dashed',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  promoCodeText: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  copyButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.white,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  ctaText: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.white },
});
