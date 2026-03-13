import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Calendar, Clock, ExternalLink, Tag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Campaign } from '../api/campaigns';
import { getCategoryDisplayName } from '../api/brands';
import { useMarketStore } from '../store/market';
import { Colors } from '../constants/theme';
import { findCampaignImage } from '../utils/image';

interface CampaignCardProps {
  campaign: Campaign;
  onPress?: (campaign: Campaign) => void;
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

function daysLeft(endDate: string | null): number {
  if (!endDate) return -1;
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

// Consistent gradient colors for brands without images
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

function getBrandColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = GRADIENT_COLORS[Math.abs(hash) % GRADIENT_COLORS.length];
  return colors[0];
}

function CampaignCardInner({ campaign, onPress }: CampaignCardProps) {
  const { t, i18n } = useTranslation();
  const market = useMarketStore((s) => s.market);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const campaignImage = findCampaignImage(campaign.imageUrls);
  const brandLogo = campaign.brand?.logoUrl || null;
  const hasImage = !!campaignImage;
  const remaining = daysLeft(campaign.endDate);
  const isEndingSoon = remaining >= 0 && remaining <= 2;
  const brandName = campaign.brand?.name || '';

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
      onPress(campaign);
    } else {
      router.push(`/campaign/${campaign.id}`);
    }
  }, [campaign, onPress, router]);

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
              source={{ uri: campaignImage! }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            />
          ) : brandLogo ? (
            <View style={[styles.brandLogoFill, { backgroundColor: getBrandColor(brandName || campaign.title) }]}>
              <Image
                source={{ uri: brandLogo }}
                style={styles.brandLogoCard}
                contentFit="contain"
                transition={200}
              />
            </View>
          ) : (
            <View style={[styles.noImageFill, { backgroundColor: getBrandColor(brandName || campaign.title) }]}>
              <Text style={styles.noImageBrandName} numberOfLines={2}>
                {brandName || campaign.title.substring(0, 30)}
              </Text>
              <Tag size={28} color="rgba(255,255,255,0.25)" />
            </View>
          )}

          {/* Badges overlay — always positioned the same */}
          {campaign.discountRate != null && Number(campaign.discountRate) > 0 ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>%{campaign.discountRate}</Text>
            </View>
          ) : null}
          {isEndingSoon ? (
            <View style={styles.urgentBadge}>
              <Clock size={10} color="#fff" />
              <Text style={styles.urgentText}>
                {remaining === 0 ? t('campaign.lastDay') : t('campaign.daysLeft', { days: remaining })}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Content area */}
        <View style={styles.content}>
          <View style={styles.meta}>
            {campaign.brand && (
              <View style={styles.brandRow}>
                {campaign.brand.logoUrl && (
                  <Image
                    source={{ uri: campaign.brand.logoUrl }}
                    style={styles.brandLogo}
                    contentFit="cover"
                  />
                )}
                <Text style={styles.brandName} numberOfLines={1}>{campaign.brand.name}</Text>
              </View>
            )}
            {campaign.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{getCategoryDisplayName(campaign.category, market)}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title} numberOfLines={2}>{campaign.title}</Text>

          {/* Kampanya tarihleri */}
          {(campaign.startDate || campaign.endDate) && (
            <View style={styles.dateRow}>
              <Calendar size={12} color={Colors.textTertiary} />
              <Text style={styles.dateText}>
                {campaign.startDate
                  ? new Date(campaign.startDate).toLocaleDateString(getDateLocale(i18n.language), { day: 'numeric', month: 'short' })
                  : ''}
                {campaign.startDate && campaign.endDate ? ' - ' : ''}
                {campaign.endDate
                  ? new Date(campaign.endDate).toLocaleDateString(getDateLocale(i18n.language), { day: 'numeric', month: 'short' })
                  : ''}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            {campaign.promoCode ? (
              <View style={styles.promoRow}>
                <Tag size={12} color={Colors.primary} />
                <Text style={styles.promoText}>{campaign.promoCode}</Text>
              </View>
            ) : !isEndingSoon && remaining > 0 ? (
              <View style={styles.timeRow}>
                <Clock size={12} color={Colors.textTertiary} />
                <Text style={styles.timeText}>{t('campaign.daysLeft', { days: remaining })}</Text>
              </View>
            ) : campaign.endDate ? (
              <View style={styles.timeRow}>
                <Clock size={12} color={Colors.textTertiary} />
                <Text style={styles.timeText}>
                  {new Date(campaign.endDate).toLocaleDateString(getDateLocale(i18n.language), { day: 'numeric', month: 'short' })}
                </Text>
              </View>
            ) : <View />}
            <View style={styles.sourceRow}>
              <ExternalLink size={11} color={Colors.primary} />
              <Text style={styles.sourceText}>{t('campaign.goToSource')}</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default React.memo(CampaignCardInner);

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
  brandLogoFill: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brandLogoCard: {
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
  noImageBrandName: {
    fontSize: 22,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  discountText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
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
  content: {
    padding: 14,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  brandLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.borderLight,
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    flex: 1,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight + '20',
  },
  categoryText: {
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
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
  timeText: {
    fontSize: 12,
    color: Colors.textTertiary,
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
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight + '15',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  promoText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});
