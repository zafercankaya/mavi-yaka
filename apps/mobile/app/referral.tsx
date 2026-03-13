import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Share, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { getMyReferralCode, applyReferralCode } from '../src/api/referrals';
import { useAuthStore } from '../src/store/auth';
import { Colors, Spacing, FontSize, BorderRadius } from '../src/constants/theme';
import { getApiErrorMessage } from '../src/utils/api-error';

export default function ReferralScreen() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [inputCode, setInputCode] = useState('');
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: myCode, isLoading } = useQuery({
    queryKey: ['referral-code'],
    queryFn: getMyReferralCode,
    enabled: isAuthenticated,
  });

  const handleShare = async () => {
    if (!myCode) return;
    try {
      await Share.share({
        message: t('referral.shareMessage', { code: myCode }),
      });
    } catch {}
  };

  const handleCopy = async () => {
    if (!myCode) return;
    await Clipboard.setStringAsync(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async () => {
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 8) {
      Alert.alert(t('common.error'), t('referral.invalidCode'));
      return;
    }
    setApplying(true);
    try {
      const result = await applyReferralCode(code);
      queryClient.invalidateQueries({ queryKey: ['entitlement'] });
      queryClient.invalidateQueries({ queryKey: ['follows'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      Alert.alert(t('common.success'), t('referral.applySuccess'));
      setInputCode('');
    } catch (err: any) {
      const msg = getApiErrorMessage(err, t, 'referral.applyError');
      Alert.alert(t('common.error'), msg);
    } finally {
      setApplying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Ionicons name="people-outline" size={64} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>{t('referral.loginRequired')}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.primaryButtonText}>{t('common.login')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('referral.title')}</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Hero */}
        <View style={styles.heroCard}>
          <Ionicons name="gift-outline" size={48} color={Colors.primary} />
          <Text style={styles.heroTitle}>{t('referral.heroTitle')}</Text>
          <Text style={styles.heroSubtitle}>{t('referral.heroSubtitle')}</Text>
        </View>

        {/* My Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{t('referral.myCode')}</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>{myCode}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={18} color="#fff" />
            <Text style={styles.shareButtonText}>{t('referral.share')}</Text>
          </TouchableOpacity>
        </View>

        {/* Apply Code */}
        <View style={styles.applyCard}>
          <Text style={styles.codeLabel}>{t('referral.enterCode')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('referral.codePlaceholder')}
            placeholderTextColor={Colors.textLight}
            value={inputCode}
            onChangeText={setInputCode}
            autoCapitalize="characters"
            maxLength={8}
          />
          <TouchableOpacity
            style={[styles.applyButton, (!inputCode.trim() || applying) && styles.buttonDisabled]}
            onPress={handleApply}
            disabled={!inputCode.trim() || applying}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.applyButtonText}>{t('referral.apply')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.text },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  heroSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  codeLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  codeText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 4,
  },
  copyButton: {
    padding: Spacing.xs,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  shareButtonText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  applyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: Spacing.md,
  },
  applyButton: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  applyButtonText: { fontSize: FontSize.md, fontWeight: '700', color: '#fff' },
  buttonDisabled: { opacity: 0.5 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  primaryButtonText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
});
