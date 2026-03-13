import { Platform } from 'react-native';

const IS_TEST = __DEV__;

// Google's official test Ad Unit IDs for development
const TEST_BANNER_IOS = 'ca-app-pub-3940256099942544/2934735716';
const TEST_BANNER_ANDROID = 'ca-app-pub-3940256099942544/6300978111';
const TEST_INTERSTITIAL_IOS = 'ca-app-pub-3940256099942544/4411468910';
const TEST_INTERSTITIAL_ANDROID = 'ca-app-pub-3940256099942544/1033173712';

// Real Ad Unit IDs from AdMob console (pub-4200780317005480)
const PROD_BANNER_IOS = 'ca-app-pub-4200780317005480/3687590107';
const PROD_BANNER_ANDROID = 'ca-app-pub-4200780317005480/9694236466';
const PROD_INTERSTITIAL_IOS = 'ca-app-pub-4200780317005480/3823321474';
const PROD_INTERSTITIAL_ANDROID = 'ca-app-pub-4200780317005480/6313753449';

export const AD_UNIT_IDS = {
  BANNER: Platform.select({
    ios: IS_TEST ? TEST_BANNER_IOS : PROD_BANNER_IOS,
    android: IS_TEST ? TEST_BANNER_ANDROID : PROD_BANNER_ANDROID,
    default: TEST_BANNER_ANDROID,
  })!,
  INTERSTITIAL: Platform.select({
    ios: IS_TEST ? TEST_INTERSTITIAL_IOS : PROD_INTERSTITIAL_IOS,
    android: IS_TEST ? TEST_INTERSTITIAL_ANDROID : PROD_INTERSTITIAL_ANDROID,
    default: TEST_INTERSTITIAL_ANDROID,
  })!,
};

/** Number of job items between each ad slot */
export const AD_INTERVAL = 5;
