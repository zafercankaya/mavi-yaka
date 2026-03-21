import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import * as AuthSession from 'expo-auth-session';
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
      redirectUri: AuthSession.makeRedirectUri({ scheme: 'maviyaka' }),
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

  // Apple Sign In temporarily disabled — requires provisioning profile capabilities
  const signInWithApple = async () => {
    if (Platform.OS !== 'ios') return;
    Alert.alert('Apple Sign In', 'Coming soon');
  };

  return {
    signInWithGoogle,
    signInWithApple,
    isAppleAvailable: Platform.OS === 'ios',
    loading,
  };
}
