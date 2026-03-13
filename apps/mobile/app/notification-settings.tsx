import {
  View, Text, Switch, ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Stack } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { fetchNotifPreferences, updateNotifPreferences } from '../src/api/notifications';
import { useAuthStore } from '../src/store/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/theme';

export default function NotificationSettingsScreen() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useTranslation();

  const { data: prefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['notif-preferences'],
    queryFn: fetchNotifPreferences,
    enabled: isAuthenticated,
  });

  const updateMutation = useMutation({
    mutationFn: (data: { enabled?: boolean }) => updateNotifPreferences(data),
    onSuccess: (result) => {
      queryClient.setQueryData(['notif-preferences'], result);
    },
  });

  if (prefsLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t('notificationSettings.title') }} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('notificationSettings.title') }} />

      <View style={styles.container}>
        <View style={styles.settingsContent}>
          {/* Master toggle */}
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="notifications" size={22} color={Colors.primary} />
                <View>
                  <Text style={styles.rowLabel}>{t('notificationSettings.allNotifications')}</Text>
                  <Text style={styles.rowSubtitle}>
                    {prefs?.enabled ? t('notificationSettings.enabled') : t('notificationSettings.disabled')}
                  </Text>
                </View>
              </View>
              <Switch
                value={prefs?.enabled ?? true}
                onValueChange={(enabled) => updateMutation.mutate({ enabled })}
                trackColor={{ false: Colors.border, true: Colors.border }}
                thumbColor={prefs?.enabled ? Colors.primary : Colors.textLight}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {t('notificationSettings.description')}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  settingsContent: {
    padding: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  rowLabel: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text },
  rowSubtitle: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  infoText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1, lineHeight: 18 },
});
