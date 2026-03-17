import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Calendar, Clock, ExternalLink, Tag, MapPin, Briefcase, Wifi } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { JobListing } from '../api/jobs';
import { Colors } from '../constants/theme';

interface JobCardProps {
  job: JobListing;
  onPress?: (job: JobListing) => void;
  showFollowButton?: boolean;
}

/** Map i18n language code to date locale string */
function getDateLocale(lang: string): string {
  switch (lang) {
    case 'tr': return 'tr-TR';
    case 'de': return 'de-DE';
    case 'pt': return 'pt-BR';
    case 'id': return 'id-ID';
    case 'ru': return 'ru-RU';
    case 'es': return 'es-MX';
    case 'ja': return 'ja-JP';
    case 'th': return 'th-TH';
    case 'fr': return 'fr-FR';
    case 'it': return 'it-IT';
    case 'ar': return 'ar-SA';
    case 'ko': return 'ko-KR';
    case 'vi': return 'vi-VN';
    case 'pl': return 'pl-PL';
    case 'ms': return 'ms-MY';
    case 'nl': return 'nl-NL';
    case 'ur': return 'ur-PK';
    case 'sv': return 'sv-SE';
    default: return 'en-US';
  }
}

function daysLeft(deadline: string | null): number {
  if (!deadline) return -1;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

// Consistent gradient colors for companies without images
const GRADIENT_COLORS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a18cd1', '#fbc2eb'],
  ['#fccb90', '#d57eeb'],
  ['#e0c3fc', '#8ec5fc'],
];

function getCompanyColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
  return colors[0];
}

function formatSalary(job: JobListing, t: any): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency || '';
  const min = job.salaryMin;
  const max = job.salaryMax;
  if (min && max) return `${currency}${min.toLocaleString()} - ${currency}${max.toLocaleString()}`;
  if (min) return `${currency}${min.toLocaleString()}+`;
  if (max) return `${currency}${max.toLocaleString()}`;
  return null;
}

function JobCardInner({ job, onPress }: JobCardProps) {
  const { t, i18n } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const jobImage = job.imageUrl || null;
  const companyLogo = job.company?.logoUrl || null;
  const hasImage = !!jobImage;
  const remaining = daysLeft(job.deadline);
  const isEndingSoon = remaining >= 0 && remaining <= 2;
  const companyName = job.company?.name || '';
  const salary = formatSalary(job, t);
  const location = [job.city, job.state].filter(Boolean).join(', ');

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress(job);
    } else {
      router.push(`/job/${job.id}`);
    }
  }, [job, onPress, router]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Image area — ALWAYS same height */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image
              source={{ uri: jobImage! }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
          ) : companyLogo ? (
            <View style={[styles.companyLogoFill, { backgroundColor: getCompanyColor(companyName || job.title) }]}>
              <Image
                source={{ uri: companyLogo }}
                style={styles.companyLogoCard}
                contentFit="contain"
                transition={200}
              />
            </View>
          ) : (
            <View style={[styles.noImageFill, { backgroundColor: getCompanyColor(companyName || job.title) }]}>
              <Text style={styles.noImageCompanyName} numberOfLines={2}>
                {companyName || job.title.substring(0, 30)}
              </Text>
              <Tag size={28} color="rgba(255,255,255,0.25)" />
            </View>
          )}

          {/* Badges overlay */}
          {isEndingSoon ? (
            <View style={styles.urgentBadge}>
              <Clock size={10} color="#fff" />
              <Text style={styles.urgentText}>
                {remaining === 0 ? t('job.lastDay') : t('job.daysLeft', { days: remaining })}
              </Text>
            </View>
          ) : null}

          {/* Remote badge overlay */}
          {job.workMode === 'REMOTE' && (
            <View style={styles.remoteBadge}>
              <Wifi size={10} color="#fff" />
              <Text style={styles.remoteBadgeText}>{t('workMode.REMOTE')}</Text>
            </View>
          )}
        </View>

        {/* Content area */}
        <View style={styles.content}>
          <View style={styles.meta}>
            {job.company && (
              <View style={styles.companyRow}>
                {job.company.logoUrl && (
                  <Image
                    source={{ uri: job.company.logoUrl }}
                    style={styles.companyLogo}
                    contentFit="cover"
                  />
                )}
                <Text style={styles.companyName} numberOfLines={1}>{job.company.name}</Text>
              </View>
            )}
            {job.company?.sector && (
              <View style={styles.sectorTag}>
                <Text style={styles.sectorText}>{t(`sector.${job.company.sector}`)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>{job.title}</Text>

          {/* Info chips row */}
          <View style={styles.chipsRow}>
            {job.jobType && (
              <View style={styles.infoChip}>
                <Briefcase size={11} color={Colors.primary} />
                <Text style={styles.infoChipText}>{t(`jobType.${job.jobType}`, job.jobType)}</Text>
              </View>
            )}
            {location ? (
              <View style={styles.infoChip}>
                <MapPin size={11} color={Colors.textSecondary} />
                <Text style={styles.infoChipText} numberOfLines={1}>{location}</Text>
              </View>
            ) : null}
            {job.workMode && job.workMode !== 'REMOTE' && (
              <View style={styles.infoChip}>
                <Wifi size={11} color={Colors.textSecondary} />
                <Text style={styles.infoChipText}>{t(`workMode.${job.workMode}`, job.workMode)}</Text>
              </View>
            )}
          </View>

          {/* Salary */}
          {salary && (
            <View style={styles.salaryRow}>
              <Text style={styles.salaryText}>{salary}</Text>
              {job.salaryPeriod && (
                <Text style={styles.salaryPeriod}>/ {t(`salary.period.${job.salaryPeriod}`, job.salaryPeriod)}</Text>
              )}
            </View>
          )}

          <View style={styles.footer}>
            {/* Deadline */}
            {job.deadline ? (
              <View style={styles.timeRow}>
                <Calendar size={12} color={Colors.textTertiary} />
                <Text style={styles.dateText}>
                  {new Date(job.deadline).toLocaleDateString(getDateLocale(i18n.language), { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            ) : <View />}
            <View style={styles.sourceRow}>
              <ExternalLink size={11} color={Colors.primary} />
              <Text style={styles.sourceText}>{t('job.goToSource')}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(JobCardInner);

const IMAGE_HEIGHT = 170;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: IMAGE_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  companyLogoFill: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  companyLogoCard: {
    width: '60%',
    height: '60%',
  },
  noImageFill: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  noImageCompanyName: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  urgentBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  urgentText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  remoteBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#27AE60',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  remoteBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  content: {
    padding: 14,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  companyLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.borderLight,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  sectorTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight + '20',
  },
  sectorText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  infoChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    maxWidth: 100,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
  },
  salaryPeriod: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
