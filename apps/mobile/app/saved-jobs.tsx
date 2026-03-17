import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { fetchSavedJobs, toggleSavedJob, SavedJobFilter } from '../src/api/saved-jobs';
import { useAuthStore } from '../src/store/auth';
import { useMarketStore } from '../src/store/market';
import { Colors, Spacing, FontSize, BorderRadius, TAB_BAR_HEIGHT } from '../src/constants/theme';

const SEGMENT_KEYS: SavedJobFilter[] = ['active', 'upcoming', 'past'];

export default function SavedJobsScreen() {
  const [filter, setFilter] = useState<SavedJobFilter>('active');
  const { isAuthenticated } = useAuthStore();
  const market = useMarketStore((s) => s.market);
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

  const segments = SEGMENT_KEYS.map((key) => ({
    key,
    label: t(`favorites.${key}`),
  }));

  const locale = { tr: 'tr-TR', de: 'de-DE', pt: 'pt-BR', id: 'id-ID', ru: 'ru-RU', es: 'es-ES', ja: 'ja-JP', th: 'th-TH', fr: 'fr-FR', it: 'it-IT', ar: 'ar-SA', ko: 'ko-KR', vi: 'vi-VN', pl: 'pl-PL', ms: 'ms-MY', nl: 'nl-NL', ur: 'ur-PK', sv: 'sv-SE' }[i18n.language] || 'en-US';

  const { data: savedJobs, isLoading, refetch } = useQuery({
    queryKey: ['saved-jobs', filter, market],
    queryFn: () => fetchSavedJobs(filter),
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: (jobListingId: string) => toggleSavedJob(jobListingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
  });

  const handleRemove = useCallback((jobListingId: string) => {
    removeMutation.mutate(jobListingId);
  }, [removeMutation]);

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={64} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>{t('favorites.loginToView')}</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.primaryButtonText}>{t('common.login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Segment Control */}
      <View style={styles.segmentContainer}>
        {segments.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.segment, filter === s.key && styles.segmentActive]}
            onPress={() => setFilter(s.key)}
          >
            <Text style={[styles.segmentText, filter === s.key && styles.segmentTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !savedJobs || savedJobs.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name={filter === 'past' ? 'time-outline' : 'heart-outline'}
            size={48}
            color={Colors.textLight}
          />
          <Text style={styles.emptyTitle}>
            {filter === 'active' && t('favorites.noActive')}
            {filter === 'upcoming' && t('favorites.noUpcoming')}
            {filter === 'past' && t('favorites.noPast')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t('favorites.addHint')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: Spacing.xxl }}
          renderItem={({ item }) => {
            const c = item.jobListing;
            const frozen = item.isFrozen;
            return (
              <TouchableOpacity
                style={[styles.card, frozen && styles.cardFrozen]}
                onPress={() => {
                  if (frozen) {
                    Alert.alert(
                      t('follows.frozenTitle'),
                      t('follows.frozenMessage'),
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('follows.upgradeToPremium'), onPress: () => router.push('/subscription') },
                      ],
                    );
                  } else {
                    router.push(`/job/${c.id}`);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    {c.company && (
                      <Text style={[styles.company, frozen && { color: Colors.textLight }]}>{c.company.name}</Text>
                    )}
                    <Text style={[styles.title, frozen && { color: Colors.textLight }]} numberOfLines={2}>{c.title}</Text>
                    <View style={styles.meta}>
                      {frozen && (
                        <View style={[styles.frozenBadge, { backgroundColor: Colors.textLight }]}>
                          <Ionicons name="lock-closed" size={10} color={Colors.white} />
                          <Text style={[styles.frozenBadgeText, { marginLeft: 2 }]}>{t('follows.frozen')}</Text>
                        </View>
                      )}
                      {c.deadline && !frozen && (
                        <Text style={styles.dateText}>
                          {new Date(c.deadline).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      )}
                    </View>
                  </View>

                  {frozen ? (
                    <View style={styles.removeButton}>
                      <Ionicons name="lock-closed" size={22} color={Colors.textLight} />
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemove(c.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons
                        name={filter === 'past' ? 'trash-outline' : 'heart'}
                        size={22}
                        color={filter === 'past' ? Colors.error : Colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  segmentContainer: {
    flexDirection: 'row',
    margin: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.surface,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  segmentText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  segmentTextActive: { color: Colors.primary, fontWeight: '600' },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  cardFrozen: {
    opacity: 0.6,
    borderWidth: 1,
    borderColor: Colors.textLight,
    borderStyle: 'dashed',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  cardLeft: { flex: 1 },
  company: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  title: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, lineHeight: 20 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xs },
  frozenBadge: {
    backgroundColor: Colors.badge,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 1,
  },
  frozenBadgeText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: '700' },
  dateText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  removeButton: { padding: Spacing.sm },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  primaryButtonText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '600' },
});
