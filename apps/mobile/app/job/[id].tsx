import { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Share, StyleSheet, Dimensions, Alert, Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useInterstitialAd } from 'react-native-google-mobile-ads';
import { Ionicons } from '@expo/vector-icons';
import {
  Briefcase, MapPin, DollarSign, Building2, BarChart3, CalendarClock,
  ChevronDown, ChevronUp, ExternalLink, Bookmark,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../src/hooks/useAnalytics';
import { fetchJobById, JobListing } from '../../src/api/jobs';
import { checkSavedStatus, toggleSavedJob } from '../../src/api/saved-jobs';
import { useAuthStore } from '../../src/store/auth';
import { useAdFree } from '../../src/hooks/useAdFree';
import { AD_UNIT_IDS } from '../../src/constants/ads';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { maybeRequestReview } from '../../src/hooks/useStoreReview';
import { getApiErrorMessage } from '../../src/utils/api-error';

const SCREEN_WIDTH = Dimensions.get('window').width;

function formatSalaryRange(job: JobListing, t: any): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency || '';
  const min = job.salaryMin;
  const max = job.salaryMax;
  let range = '';
  if (min && max) range = `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  else if (min) range = `${currency}${min.toLocaleString()}+`;
  else if (max) range = `${currency}${max.toLocaleString()}`;
  if (job.salaryPeriod) {
    range += ` / ${t(`salary.period.${job.salaryPeriod}`, job.salaryPeriod)}`;
  }
  return range || null;
}

function parseBulletList(text: string | null): string[] {
  if (!text) return [];
  return text
    .split(/[\n;•\-\*]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const adFree = useAdFree();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [descExpanded, setDescExpanded] = useState(false);

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
      load();
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

  // Track job view
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

  const handleSave = () => {
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
  };

  const salaryText = formatSalaryRange(job, t);
  const location = [job.city, job.state].filter(Boolean).join(', ');
  const requirements = parseBulletList(job.requirements);
  const benefits = parseBulletList(job.benefits);
  const descriptionLong = (job.description?.length ?? 0) > 300;

  // Info cards data
  const infoCards: { icon: React.ComponentType<any>; label: string; value: string; color: string }[] = [];
  if (job.jobType) {
    infoCards.push({ icon: Briefcase, label: t('filter.jobType'), value: t(`jobType.${job.jobType}`, job.jobType), color: Colors.primary });
  }
  if (location) {
    infoCards.push({ icon: MapPin, label: t('filter.location'), value: location, color: '#4A90D9' });
  }
  if (salaryText) {
    infoCards.push({ icon: DollarSign, label: t('job.salary'), value: salaryText, color: Colors.success });
  }
  if (job.workMode) {
    infoCards.push({ icon: Building2, label: t('filter.workMode'), value: t(`workMode.${job.workMode}`, job.workMode), color: '#7C5CFC' });
  }
  if (job.experienceLevel) {
    infoCards.push({ icon: BarChart3, label: t('filter.experience'), value: t(`experience.${job.experienceLevel}`, job.experienceLevel), color: '#FF9F43' });
  }
  if (job.deadline) {
    infoCards.push({ icon: CalendarClock, label: t('job.deadline'), value: formatDate(job.deadline) || '', color: Colors.warning });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: job.company?.name || t('job.defaultTitle'),
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TouchableOpacity
                onPress={handleSave}
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
        {/* Company Header */}
        <View style={styles.companyHeader}>
          {job.company?.logoUrl ? (
            <Image
              source={{ uri: job.company.logoUrl }}
              style={styles.companyLogoImg}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <View style={styles.companyLogoPlaceholder}>
              <Building2 size={24} color={Colors.primary} />
            </View>
          )}
          <View style={styles.companyInfo}>
            <Pressable onPress={() => job.company && router.push(`/company/${job.companyId}`)}>
              <Text style={styles.companyName}>{job.company?.name || ''}</Text>
            </Pressable>
            {job.company?.sector && (
              <View style={styles.sectorBadge}>
                <Text style={styles.sectorBadgeText}>{t(`sector.${job.company.sector}`, job.company.sector)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Job Title */}
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          {job.postedDate && (
            <Text style={styles.postedDate}>
              {t('job.postedDate')}: {formatDate(job.postedDate)}
            </Text>
          )}
        </View>

        {/* Info Cards */}
        {infoCards.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.infoCardsContainer}
          >
            {infoCards.map((card, index) => {
              const IconComp = card.icon;
              return (
                <View key={index} style={styles.infoCard}>
                  <View style={[styles.infoCardIcon, { backgroundColor: card.color + '15' }]}>
                    <IconComp size={18} color={card.color} />
                  </View>
                  <Text style={styles.infoCardLabel}>{card.label}</Text>
                  <Text style={styles.infoCardValue} numberOfLines={2}>{card.value}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Image if available */}
        {job.imageUrl && (
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: job.imageUrl }}
              style={styles.jobImage}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
          </View>
        )}

        {/* Description */}
        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('job.description')}</Text>
            <Text
              style={styles.descriptionText}
              numberOfLines={descExpanded || !descriptionLong ? undefined : 6}
            >
              {job.description}
            </Text>
            {descriptionLong && (
              <Pressable onPress={() => setDescExpanded(!descExpanded)} style={styles.expandBtn}>
                {descExpanded ? (
                  <ChevronUp size={16} color={Colors.primary} />
                ) : (
                  <ChevronDown size={16} color={Colors.primary} />
                )}
                <Text style={styles.expandText}>
                  {descExpanded ? t('common.less', 'Daha az') : t('common.more', 'Devamini oku')}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Requirements */}
        {requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('job.requirements')}</Text>
            {requirements.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Benefits */}
        {benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('job.benefits')}</Text>
            {benefits.map((item, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: Colors.success }]} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA Button */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaButton} onPress={handleOpenLink}>
            <ExternalLink size={20} color={Colors.white} />
            <Text style={styles.ctaText}>{t('job.goToListing')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  errorText: { fontSize: FontSize.md, color: Colors.textSecondary },

  // Company header
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: 12,
    backgroundColor: Colors.surface,
  },
  companyLogoImg: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.surfaceVariant,
  },
  companyLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
    gap: 4,
  },
  companyName: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectorBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectorBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Title
  titleSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
  },
  postedDate: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 4,
  },

  // Info cards
  infoCardsContainer: {
    paddingHorizontal: Spacing.md,
    gap: 10,
    paddingVertical: Spacing.sm,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    width: 130,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  infoCardValue: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },

  // Image
  imageWrapper: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  jobImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.5,
  },

  // Section
  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  descriptionText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  expandText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Bullet list
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // CTA
  ctaRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    gap: 10,
  },
  ctaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  ctaText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  saveButton: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
