import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { loginApi } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/auth';
import { useSocialAuth } from '../../src/hooks/useSocialAuth';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { getApiErrorMessage } from '../../src/utils/api-error';

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const enterGuestMode = useAuthStore((s) => s.enterGuestMode);
  const { signInWithGoogle, signInWithApple, isAppleAvailable, loading: socialLoading } = useSocialAuth();

  const isDisabled = loading || socialLoading;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('auth.emailRequired'));
      return;
    }

    setLoading(true);
    try {
      const result = await loginApi(email.trim(), password);
      await setAuth(result.user, result.accessToken, result.refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = getApiErrorMessage(err, t, 'auth.loginFailed');
      Alert.alert(t('auth.loginError'), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {router.canGoBack() && (
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.header}>
          <Text style={styles.logo}>{t('app.name')}</Text>
          <Text style={styles.subtitle}>{t('auth.discoverJobs')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            placeholderTextColor={Colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>{t('auth.password')}</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.passwordPlaceholder')}
            placeholderTextColor={Colors.textLight}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isDisabled}
          >
            <Text style={styles.buttonText}>
              {loading ? t('auth.loggingIn') : t('common.login')}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('common.or')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={signInWithGoogle}
            disabled={isDisabled}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialButtonText}>{t('auth.googleSignIn')}</Text>
          </TouchableOpacity>

          {/* Apple Sign In (iOS only) */}
          {isAppleAvailable && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={signInWithApple}
              disabled={isDisabled}
            >
              <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                {t('auth.appleSignIn')}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.noAccount')} </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>{t('common.register')}</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => {
              enterGuestMode();
              router.replace('/(tabs)');
            }}
          >
            <Text style={styles.guestButtonText}>{t('auth.continueAsGuest')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  closeButton: { position: 'absolute', top: Spacing.xl, right: Spacing.md, zIndex: 10, padding: Spacing.xs },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: FontSize.title, fontWeight: '700', color: Colors.primary },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  label: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.text, marginBottom: Spacing.xs, marginTop: Spacing.md },
  input: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: '600' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  googleButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  appleButton: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  socialButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  appleButtonText: {
    color: Colors.white,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { color: Colors.textSecondary, fontSize: FontSize.md },
  link: { color: Colors.primary, fontSize: FontSize.md, fontWeight: '600' },
  guestButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
  },
  guestButtonText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    textDecorationLine: 'underline',
  },
});
