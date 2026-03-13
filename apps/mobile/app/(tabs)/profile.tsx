import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/auth';
import { useMarketStore } from '../../src/store/market';
import { fetchUnreadCount } from '../../src/api/notifications';
import { fetchEntitlement } from '../../src/api/subscriptions';
import { deleteAccountApi } from '../../src/api/auth';
import { Colors, Spacing, FontSize, BorderRadius, TAB_BAR_HEIGHT } from '../../src/constants/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { market } = useMarketStore();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count'],
    queryFn: fetchUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const { data: entitlement } = useQuery({
    queryKey: ['entitlement'],
    queryFn: fetchEntitlement,
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const [deleting, setDeleting] = React.useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.deleteAccountConfirm'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('profile.deleteAccountFinal'),
              t('profile.deleteAccountFinalMessage'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('profile.deleteAccountConfirm'),
                  style: 'destructive',
                  onPress: async () => {
                    setDeleting(true);
                    try {
                      await deleteAccountApi();
                      await logout();
                    } catch {
                      Alert.alert(t('common.error'), t('profile.deleteAccountError'));
                    } finally {
                      setDeleting(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleCountryChange = () => {
    router.push('/select-country');
  };

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      Alert.alert(
        t('guest.featureRequiresAccount'),
        t('guest.signUpToFollow'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('guest.signUpFree'), onPress: () => router.push('/(auth)/register') },
        ],
      );
      return;
    }
    action();
  };

  const marketSubtitle =
    market === 'TR' ? `🇹🇷 ${t('profile.turkey')}` :
    market === 'DE' ? `🇩🇪 ${t('profile.germany')}` :
    market === 'UK' ? `🇬🇧 ${t('profile.uk')}` :
    market === 'IN' ? `🇮🇳 ${t('profile.india')}` :
    market === 'BR' ? `🇧🇷 ${t('profile.brazil')}` :
    market === 'ID' ? `🇮🇩 ${t('profile.indonesia')}` :
    market === 'RU' ? `🇷🇺 ${t('profile.russia')}` :
    market === 'MX' ? `🇲🇽 ${t('profile.mexico')}` :
    market === 'JP' ? `🇯🇵 ${t('profile.japan')}` :
    market === 'PH' ? `🇵🇭 ${t('profile.philippines')}` :
    market === 'TH' ? `🇹🇭 ${t('profile.thailand')}` :
    market === 'CA' ? `🇨🇦 ${t('profile.canada')}` :
    market === 'AU' ? `🇦🇺 ${t('profile.australia')}` :
    market === 'FR' ? `🇫🇷 ${t('profile.france')}` :
    market === 'IT' ? `🇮🇹 ${t('profile.italy')}` :
    market === 'ES' ? `🇪🇸 ${t('profile.spain')}` :
    market === 'EG' ? `🇪🇬 ${t('profile.egypt')}` :
    market === 'SA' ? `🇸🇦 ${t('profile.saudiarabia')}` :
    market === 'KR' ? `🇰🇷 ${t('profile.southkorea')}` :
    market === 'AR' ? `🇦🇷 ${t('profile.argentina')}` :
    market === 'AE' ? `🇦🇪 ${t('profile.uae')}` :
    market === 'VN' ? `🇻🇳 ${t('profile.vietnam')}` :
    market === 'PL' ? `🇵🇱 ${t('profile.poland')}` :
    market === 'MY' ? `🇲🇾 ${t('profile.malaysia')}` :
    market === 'CO' ? `🇨🇴 ${t('profile.colombia')}` :
    market === 'ZA' ? `🇿🇦 ${t('profile.south_africa')}` :
    market === 'PT' ? `🇵🇹 ${t('profile.portugal')}` :
    market === 'NL' ? `🇳🇱 ${t('profile.netherlands')}` :
    market === 'PK' ? `🇵🇰 ${t('profile.pakistan')}` :
    market === 'SE' ? `🇸🇪 ${t('profile.sweden')}` :
    `🇺🇸 ${t('profile.usa')}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + Spacing.md }}>
      {/* Profile Card / Guest Banner */}
      {isAuthenticated ? (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.displayName || user?.email || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user?.displayName || t('profile.defaultName')}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Ionicons name="person-outline" size={48} color={Colors.textLight} />
          <Text style={[styles.name, { marginTop: Spacing.sm }]}>{t('profile.guestUser')}</Text>
          <TouchableOpacity
            style={[styles.primaryButton, { marginTop: Spacing.md }]}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.primaryButtonText}>{t('guest.signUpFree')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.menu}>
        <MenuItem
          icon="megaphone-outline"
          label={t('profile.campaignNotifications')}
          badge={unreadCount > 0 ? unreadCount : undefined}
          onPress={() => requireAuth(() => router.push('/campaign-notifications'))}
        />
        <MenuItem
          icon="notifications-outline"
          label={t('profile.notificationSettings')}
          onPress={() => requireAuth(() => router.push('/notification-settings'))}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          label={t('profile.subscription')}
          subtitle={!isAuthenticated ? t('profile.guestUser') : entitlement?.isPremium ? 'Premium' : t('profile.freePlan')}
          onPress={() => router.push('/subscription')}
        />
        <MenuItem
          icon="globe-outline"
          label={t('profile.country')}
          subtitle={marketSubtitle}
          onPress={handleCountryChange}
        />
        <MenuItem
          icon="people-outline"
          label={t('profile.referral')}
          subtitle={t('profile.referralHint')}
          onPress={() => requireAuth(() => router.push('/referral'))}
        />
        <MenuItem
          icon="document-text-outline"
          label={t('profile.privacyPolicy')}
          onPress={() => router.push('/privacy-policy')}
        />
        <MenuItem
          icon="reader-outline"
          label={t('profile.termsOfService')}
          onPress={() => router.push('/terms-of-service')}
        />
        <MenuItem
          icon="information-circle-outline"
          label={t('profile.about')}
          subtitle="v1.0.0"
          onPress={() => Alert.alert(t('app.name'), t('profile.aboutMessage', { version: '1.0.0' }))}
        />
      </View>

      {/* Logout / Login */}
      {isAuthenticated ? (
        <>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.logoutButton, { marginTop: Spacing.sm }]}
          onPress={handleDeleteAccount}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          )}
          <Text style={styles.logoutText}>{t('profile.deleteAccount')}</Text>
        </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: Colors.primary }]}
          onPress={() => router.push('/(auth)/login')}
        >
          <Ionicons name="log-in-outline" size={20} color={Colors.primary} />
          <Text style={[styles.logoutText, { color: Colors.primary }]}>{t('common.login')}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function MenuItem({
  icon, label, subtitle, badge, onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle?: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={menuStyles.item} onPress={onPress}>
      <Ionicons name={icon} size={22} color={Colors.text} />
      <View style={menuStyles.textContainer}>
        <Text style={menuStyles.label}>{label}</Text>
        {subtitle && <Text style={menuStyles.subtitle}>{subtitle}</Text>}
      </View>
      {badge != null && (
        <View style={menuStyles.badge}>
          <Text style={menuStyles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.md, paddingBottom: TAB_BAR_HEIGHT },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.white },
  name: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.text },
  email: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  menu: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  logoutText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.error },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  primaryButtonText: { color: Colors.white, fontSize: FontSize.md, fontWeight: '600' },
});

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceVariant,
    gap: Spacing.md,
  },
  textContainer: { flex: 1 },
  label: { fontSize: FontSize.md, color: Colors.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 4,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
