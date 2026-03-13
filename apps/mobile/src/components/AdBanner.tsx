import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useAdFree } from '../hooks/useAdFree';
import { AD_UNIT_IDS } from '../constants/ads';

const isExpoGo = Constants.appOwnership === 'expo';

let BannerAd: any = null;
let BannerAdSize: any = null;
if (!isExpoGo) {
  try {
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
  } catch {}
}

interface AdBannerProps {
  unitId?: string;
}

export function AdBanner({ unitId = AD_UNIT_IDS.BANNER }: AdBannerProps) {
  const adFree = useAdFree();
  const [failed, setFailed] = useState(false);

  if (adFree || failed || isExpoGo || !BannerAd) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
});
