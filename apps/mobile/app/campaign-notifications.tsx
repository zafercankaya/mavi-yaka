import {
  View, Text, FlatList, ActivityIndicator,
  StyleSheet, Pressable,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  fetchNotificationInbox, markNotificationRead,
  InAppNotification,
} from '../src/api/notifications';
import { useAuthStore } from '../src/store/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function CampaignNotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t, i18n } = useTranslation();

  const {
    data: inboxData,
    isLoading: inboxLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['notification-inbox'],
    queryFn: ({ pageParam }) => fetchNotificationInbox(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined,
    enabled: isAuthenticated,
  });

  const notifications = inboxData?.pages.flatMap((p) => p.data) ?? [];

  const readMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-inbox'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });

  const handleNotificationPress = (notif: InAppNotification) => {
    if (!notif.isRead) {
      readMutation.mutate(notif.id);
    }
    if (notif.data?.campaignId) {
      router.push(`/campaign/${notif.data.campaignId}`);
    } else {
      router.push('/(tabs)?feedMode=following&sort=last_24h');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return t('notifications.justNow');
    if (diffMin < 60) return t('notifications.minutesAgo', { minutes: diffMin });
    if (diffHour < 24) return t('notifications.hoursAgo', { hours: diffHour });
    if (diffDay < 7) return t('notifications.daysAgo', { days: diffDay });
    const locale = { tr: 'tr-TR', de: 'de-DE', pt: 'pt-BR', id: 'id-ID', ru: 'ru-RU', es: 'es-MX', ja: 'ja-JP', th: 'th-TH' }[i18n.language] || 'en-US';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  const renderNotification = ({ item }: { item: InAppNotification }) => (
    <Pressable
      style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notifIcon}>
        <Ionicons
          name={item.isRead ? 'notifications-outline' : 'notifications'}
          size={20}
          color={item.isRead ? Colors.textTertiary : Colors.primary}
        />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{formatDate(item.createdAt)}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </Pressable>
  );

  return (
    <>
      <Stack.Screen options={{ title: t('notifications.title') }} />

      <View style={styles.container}>
        {inboxLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>{t('notifications.empty')}</Text>
            <Text style={styles.emptyText}>
              {t('notifications.emptyHint')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator color={Colors.primary} style={{ padding: 16 }} />
              ) : null
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 30,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  notifCardUnread: {
    backgroundColor: Colors.primaryLight + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notifIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  notifBody: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
