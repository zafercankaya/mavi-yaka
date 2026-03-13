// Mock for react-native-google-mobile-ads in Expo Go / local dev
const noop = () => {};
const noopComponent = () => null;

module.exports = {
  BannerAd: noopComponent,
  BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' },
  TestIds: { BANNER: 'test-banner', INTERSTITIAL: 'test-interstitial' },
  AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed' },
  MobileAds: () => ({ initialize: () => Promise.resolve() }),
  useInterstitialAd: () => ({
    isLoaded: false,
    isClosed: false,
    load: noop,
    show: noop,
    error: null,
  }),
  useRewardedAd: () => ({
    isLoaded: false,
    isClosed: false,
    load: noop,
    show: noop,
    error: null,
    reward: null,
  }),
};
