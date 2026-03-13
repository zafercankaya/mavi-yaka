import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { socialLoginApi } from '../api/auth';
import { useAuthStore } from '../store/auth';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth client ID'leri — kendi değerlerinizle değiştirin
const GOOGLE_CLIENT_ID_WEB = '1088967980979-70b4roa2v9p7v5vm652tqstac5umrbt9.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export function useSocialAuth() {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t } = useTranslation();

  // Google OAuth request
  const [, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID_WEB,
      responseType: AuthSession.ResponseType.IdToken,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'kampanya' }),
    },
    discovery,
  );

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'success' && result.params.id_token) {
        const data = await socialLoginApi('GOOGLE', result.params.id_token);
        await setAuth(data.user, data.accessToken, data.refreshToken);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || t('auth.googleLoginFailed');
      Alert.alert(t('auth.loginError'), msg);
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') return;

    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple Sign In: identityToken missing');
      }

      // Apple only sends fullName on FIRST sign-in, extract it
      const fullName = credential.fullName;
      const displayName = fullName
        ? [fullName.givenName, fullName.familyName].filter(Boolean).join(' ') || undefined
        : undefined;

      const data = await socialLoginApi('APPLE', credential.identityToken, displayName);
      await setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') return;
      const msg = err.response?.data?.message || t('auth.appleLoginFailed');
      Alert.alert(t('auth.loginError'), msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    signInWithApple,
    isAppleAvailable: Platform.OS === 'ios',
    loading,
  };
}
