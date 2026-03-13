import { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Share, StyleSheet, Dimensions, Alert,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useInterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../src/hooks/useAnalytics';
import { fetchJobById } from '../../src/api/jobs';
import { checkSavedStatus, toggleSavedJob } from '../../src/api/saved-jobs';
import { useAuthStore } from '../../src/store/auth';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_UNIT_IDS } from '../../src/constants/ads';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { maybeRequestReview } from '../../src/hooks/useStoreReview';
import { getApiErrorMessage } from '../../src/utils/api-error';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
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
    queryKey: ['job', id],
    queryFn: () => fetchJobById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: savedStatus } = useQuery({
    queryKey: ['saved-status', id],
    queryFn: () => checkSavedStatus(id!),
    enabled: !!id && isAuthenticated,
  });

  const savedMutation = useMutation({
    mutationFn: () => toggleSavedJob(id!),
    onSuccess: (result) => {
      queryClient.setQueryData(['saved-status', id], result);
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      if (result?.saved) maybeRequestReview();
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const msg = getApiErrorMessage(err, t, 'job.saveError');
      const title = status === 403 ? t('common.warning') : t('common.error');
      Alert.alert(title, msg);
    },
  });

  const isSaved = savedStatus?.saved ?? false;

  // Track job view — must be before any early returns (React hooks rule)
  useEffect(() => {
    if (data) {
      trackEvent('job_view', {
        job_id: id,
        company: data.company?.name,
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
        <Text style={styles.errorText}>{t('job.notFound')}</Text>
      </View>
    );
  }

  const job = data;

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
    if (!job.sourceUrl) return;
    if (!adFree && isLoaded) {
      pendingOpenRef.current = job.sourceUrl;
      show();
    } else {
      await WebBrowser.openBrowserAsync(job.sourceUrl);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://api.maviyaka.app/share/j/${id}`;
      await Share.share({
        message: `${job.title}\n\n${shareUrl}`,
        title: job.title,
      });
      trackEvent('job_share', { job_id: id, company: job.company?.name });
    } catch {}
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: job.company?.name || t('job.defaultTitle'),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TouchableOpacity
                onPress={() => {
                  if (!isAuthenticated) {
                    Alert.alert(
                      t('guest.featureRequiresAccount'),
                      t('guest.signUpToSave'),
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('guest.signUpFree'), onPress: () => router.push('/(auth)/register') },
                      ],
                    );
                    return;
                  }
                  savedMutation.mutate();
                }}
                style={{ padding: 8 }}
                disabled={savedMutation.isPending}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isSaved ? Colors.error : Colors.text}
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
        {/* Image — prefer real job image, fall back to company logo */}
        {(() => {
          const jobImage = job.imageUrl;
          const companyLogo = job.company?.logoUrl;

          if (jobImage) {
            return (
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: jobImage }}
                  style={styles.image}
                  contentFit="cover"
                  transition={200}
                  placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                />
              </View>
            );
          }

          if (companyLogo) {
            return (
              <View style={styles.companyLogoWrapper}>
                <Image
                  source={{ uri: companyLogo }}
                  style={styles.companyLogoImage}
                  contentFit="contain"
                  transition={200}
                />
              </View>
            );
          }

          // No image and no company logo
          return (
            <View style={styles.noImageHeader}>
              {job.company && (
                <Text style={styles.noImageCompany}>{job.company.name}</Text>
              )}
            </View>
          );
        })()}

        {/* Header */}
        <View style={styles.header}>
          {job.imageUrl && (
            <View style={styles.badges}>
              {job.company && (
                <View style={styles.companyBadge}>
                  <Text style={styles.companyText}>{job.company.name}</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.title}>{job.title}</Text>

          {job.company?.sector && (
            <View style={styles.categoryChip}>
              <Ionicons name="grid-outline" size={12} color={Colors.textSecondary} />
              <Text style={styles.categoryText}>{job.company.sector}</Text>
            </View>
          )}
        </View>

        {/* Deadline */}
        {job.deadline && (
          <View style={styles.dateCard}>
            <View style={styles.dateRow}>
              <Ionicons name="time-outline" size={16} color={Colors.warning} />
              <Text style={styles.dateLabel}>{t('job.deadline')}</Text>
              <Text style={[styles.dateValue, { color: Colors.warning }]}>
                {formatDate(job.deadline)}
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('job.descriptionSection')}</Text>
            <Text style={styles.description}>{job.description}</Text>
          </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity style={styles.ctaButton} onPress={handleOpenLink}>
          <Ionicons name="open-outline" size={20} color={Colors.white} />
          <Text style={styles.ctaText}>{t('job.goToListing')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
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
  companyLogoWrapper: {
    position: 'relative',
    width: '100%',
    height: SCREEN_WIDTH * 0.45,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  companyLogoImage: {
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
  noImageCompany: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  header: { padding: Spacing.md },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  companyBadge: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  companyText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
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
