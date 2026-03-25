/**
 * Expo Config Plugin: Safe Google Ads for iOS
 *
 * Replaces react-native-google-mobile-ads on iOS with a custom pure-ObjC (.m)
 * native module. This avoids the TurboModule crash on iOS 26 where NSExceptions
 * propagate through C++ personality routines causing SIGABRT.
 *
 * What this plugin does:
 * 1. Adds Google-Mobile-Ads-SDK pod dependency
 * 2. Adds GADApplicationIdentifier to Info.plist
 * 3. Creates MYGoogleAds native module (.m, NOT .mm)
 * 4. Creates MYBannerAdViewManager native view (.m)
 * 5. Adds source files to Xcode project
 */
const {
  withInfoPlist,
  withDangerousMod,
  withXcodeProject,
  withPodfile,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

// ─── Native Module: MYGoogleAds.h ──────────────────────────────────────────
const KSGOOGLEADS_H = `#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface MYGoogleAds : RCTEventEmitter <RCTBridgeModule>
@end
`;

// ─── Native Module: MYGoogleAds.m ──────────────────────────────────────────
// CRITICAL: This MUST be .m (pure ObjC), NOT .mm (ObjC++).
// In .m files, @try/@catch uses the ObjC runtime directly,
// without C++ personality routines that cause SIGABRT on iOS 26.
const KSGOOGLEADS_M = `#import "MYGoogleAds.h"
@import GoogleMobileAds;

@implementation MYGoogleAds {
  BOOL _hasListeners;
  GADInterstitialAd *_interstitialAd;
}

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup {
  return NO;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"onAdLoaded", @"onAdFailedToLoad", @"onAdClosed", @"onAdOpened"];
}

- (void)startObserving {
  _hasListeners = YES;
}

- (void)stopObserving {
  _hasListeners = NO;
}

RCT_EXPORT_METHOD(initialize:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    dispatch_async(dispatch_get_main_queue(), ^{
      @try {
        [[GADMobileAds sharedInstance] startWithCompletionHandler:^(GADInitializationStatus *status) {
          NSMutableDictionary *result = [NSMutableDictionary new];
          NSDictionary *adapters = status.adapterStatusesByClassName;
          for (NSString *className in adapters) {
            GADAdapterStatus *adapterStatus = adapters[className];
            result[className] = @{
              @"state": @(adapterStatus.state),
              @"description": adapterStatus.statusDescription ?: @""
            };
          }
          resolve(result);
        }];
      } @catch (NSException *exception) {
        reject(@"ads_init_error", exception.reason, nil);
      }
    });
  } @catch (NSException *exception) {
    reject(@"ads_init_error", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(loadInterstitial:(NSString *)adUnitId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    dispatch_async(dispatch_get_main_queue(), ^{
      @try {
        GADRequest *request = [GADRequest request];
        [GADInterstitialAd loadWithAdUnitID:adUnitId
                                    request:request
                          completionHandler:^(GADInterstitialAd *ad, NSError *error) {
          if (error) {
            reject(@"ad_load_error", error.localizedDescription, error);
            return;
          }
          self->_interstitialAd = ad;
          self->_interstitialAd.fullScreenContentDelegate = (id<GADFullScreenContentDelegate>)self;
          resolve(@YES);
        }];
      } @catch (NSException *exception) {
        reject(@"ad_load_error", exception.reason, nil);
      }
    });
  } @catch (NSException *exception) {
    reject(@"ad_load_error", exception.reason, nil);
  }
}

RCT_EXPORT_METHOD(showInterstitial:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  @try {
    dispatch_async(dispatch_get_main_queue(), ^{
      @try {
        if (!self->_interstitialAd) {
          reject(@"ad_not_ready", @"Interstitial ad not loaded", nil);
          return;
        }
        UIViewController *rootVC = [UIApplication sharedApplication].delegate.window.rootViewController;
        while (rootVC.presentedViewController) {
          rootVC = rootVC.presentedViewController;
        }
        [self->_interstitialAd presentFromRootViewController:rootVC];
        resolve(@YES);
      } @catch (NSException *exception) {
        reject(@"ad_show_error", exception.reason, nil);
      }
    });
  } @catch (NSException *exception) {
    reject(@"ad_show_error", exception.reason, nil);
  }
}

#pragma mark - GADFullScreenContentDelegate

- (void)adDidDismissFullScreenContent:(id<GADFullScreenPresentingAd>)ad {
  self->_interstitialAd = nil;
  if (_hasListeners) {
    [self sendEventWithName:@"onAdClosed" body:@{}];
  }
}

- (void)ad:(id<GADFullScreenPresentingAd>)ad
    didFailToPresentFullScreenContentWithError:(NSError *)error {
  self->_interstitialAd = nil;
}

- (void)adDidRecordImpression:(id<GADFullScreenPresentingAd>)ad {
  if (_hasListeners) {
    [self sendEventWithName:@"onAdOpened" body:@{}];
  }
}

@end
`;

// ─── Banner View Manager: MYBannerAdViewManager.h ──────────────────────────
const KSBANNER_H = `#import <React/RCTViewManager.h>

@interface MYBannerAdViewManager : RCTViewManager
@end
`;

// ─── Banner View Manager: MYBannerAdViewManager.m ──────────────────────────
const KSBANNER_M = `#import "MYBannerAdViewManager.h"
@import GoogleMobileAds;

@interface MYBannerAdView : UIView <GADBannerViewDelegate>
@property (nonatomic, strong) GADBannerView *bannerView;
@property (nonatomic, copy) NSString *unitId;
@property (nonatomic, copy) NSString *size;
@property (nonatomic, copy) RCTDirectEventBlock onAdLoaded;
@property (nonatomic, copy) RCTDirectEventBlock onAdFailedToLoad;
@end

@implementation MYBannerAdView

- (void)setUnitId:(NSString *)unitId {
  _unitId = unitId;
  [self loadAd];
}

- (void)setSize:(NSString *)size {
  _size = size;
  [self loadAd];
}

- (void)loadAd {
  if (!_unitId || _unitId.length == 0) return;

  @try {
    if (_bannerView) {
      [_bannerView removeFromSuperview];
    }

    GADAdSize adSize = GADAdSizeBanner; // 320x50 default
    if ([_size isEqualToString:@"LARGE_BANNER"]) {
      adSize = GADAdSizeLargeBanner;
    } else if ([_size isEqualToString:@"MEDIUM_RECTANGLE"]) {
      adSize = GADAdSizeMediumRectangle;
    } else if ([_size isEqualToString:@"FULL_BANNER"]) {
      adSize = GADAdSizeFullBanner;
    } else if ([_size isEqualToString:@"LEADERBOARD"]) {
      adSize = GADAdSizeLeaderboard;
    } else if ([_size isEqualToString:@"ADAPTIVE_BANNER"]) {
      CGFloat viewWidth = self.frame.size.width;
      if (viewWidth <= 0) viewWidth = 320;
      adSize = GADCurrentOrientationAnchoredAdaptiveBannerAdSizeWithWidth(viewWidth);
    }

    _bannerView = [[GADBannerView alloc] initWithAdSize:adSize];
    _bannerView.adUnitID = _unitId;

    // Find the root view controller
    UIViewController *rootVC = [UIApplication sharedApplication].delegate.window.rootViewController;
    while (rootVC.presentedViewController) {
      rootVC = rootVC.presentedViewController;
    }
    _bannerView.rootViewController = rootVC;
    _bannerView.delegate = self;

    [self addSubview:_bannerView];
    _bannerView.translatesAutoresizingMaskIntoConstraints = NO;
    [NSLayoutConstraint activateConstraints:@[
      [_bannerView.centerXAnchor constraintEqualToAnchor:self.centerXAnchor],
      [_bannerView.centerYAnchor constraintEqualToAnchor:self.centerYAnchor],
    ]];

    GADRequest *request = [GADRequest request];
    [_bannerView loadRequest:request];
  } @catch (NSException *exception) {
    NSLog(@"[MYBannerAd] Exception loading ad: %@", exception.reason);
  }
}

#pragma mark - GADBannerViewDelegate

- (void)bannerViewDidReceiveAd:(GADBannerView *)bannerView {
  if (_onAdLoaded) {
    _onAdLoaded(@{
      @"width": @(bannerView.adSize.size.width),
      @"height": @(bannerView.adSize.size.height)
    });
  }
}

- (void)bannerView:(GADBannerView *)bannerView didFailToReceiveAdWithError:(NSError *)error {
  if (_onAdFailedToLoad) {
    _onAdFailedToLoad(@{@"error": error.localizedDescription ?: @"Unknown error"});
  }
}

@end

@implementation MYBannerAdViewManager

RCT_EXPORT_MODULE(MYBannerAdView);

- (UIView *)view {
  return [[MYBannerAdView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(unitId, NSString);
RCT_EXPORT_VIEW_PROPERTY(size, NSString);
RCT_EXPORT_VIEW_PROPERTY(onAdLoaded, RCTDirectEventBlock);
RCT_EXPORT_VIEW_PROPERTY(onAdFailedToLoad, RCTDirectEventBlock);

@end
`;

// ─── Plugin Implementation ─────────────────────────────────────────────────

function withSafeGoogleAds(config, props = {}) {
  const iosAppId = props.iosAppId || 'ca-app-pub-4200780317005480~1889789676';

  // 1. Add GADApplicationIdentifier to Info.plist
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.GADApplicationIdentifier = iosAppId;
    // Required for iOS 14+ — disable SKAdNetwork for now
    if (!cfg.modResults.SKAdNetworkItems) {
      cfg.modResults.SKAdNetworkItems = [];
    }
    return cfg;
  });

  // 2. Add Google-Mobile-Ads-SDK pod
  config = withPodfile(config, (cfg) => {
    const podfile = cfg.modResults;
    // Check if already added
    if (!podfile.contents.includes('Google-Mobile-Ads-SDK')) {
      // Add pod right after use_frameworks (handles both property-based and literal :static)
      const replaced = podfile.contents.replace(
        /use_frameworks!\s*:linkage\s*=>\s*(?:podfile_properties\['ios\.useFrameworks'\](?:\.to_sym)?|:static)/,
        `$&\n  pod 'Google-Mobile-Ads-SDK'`
      );
      if (replaced !== podfile.contents) {
        podfile.contents = replaced;
      } else {
        // Fallback: add pod after target line
        podfile.contents = podfile.contents.replace(
          /(target\s+['"].*?['"]\s+do)/,
          `$1\n  pod 'Google-Mobile-Ads-SDK'`
        );
      }
    }
    return cfg;
  });

  // 3. Create native source files
  config = withDangerousMod(config, [
    'ios',
    (cfg) => {
      const iosDir = path.join(cfg.modRequest.platformProjectRoot, cfg.modRequest.projectName);

      // Write native files
      fs.writeFileSync(path.join(iosDir, 'MYGoogleAds.h'), KSGOOGLEADS_H);
      fs.writeFileSync(path.join(iosDir, 'MYGoogleAds.m'), KSGOOGLEADS_M);
      fs.writeFileSync(path.join(iosDir, 'MYBannerAdViewManager.h'), KSBANNER_H);
      fs.writeFileSync(path.join(iosDir, 'MYBannerAdViewManager.m'), KSBANNER_M);

      return cfg;
    },
  ]);

  // 4. Add source files to Xcode project
  config = withXcodeProject(config, (cfg) => {
    const project = cfg.modResults;
    const projectName = cfg.modRequest.projectName;

    const groupKey = project.findPBXGroupKey({ name: projectName });

    // Add .m files as source (compiled), .h files as headers
    const sourceFiles = ['MYGoogleAds.m', 'MYBannerAdViewManager.m'];
    const headerFiles = ['MYGoogleAds.h', 'MYBannerAdViewManager.h'];

    for (const fileName of sourceFiles) {
      project.addSourceFile(`${projectName}/${fileName}`, null, groupKey);
    }
    for (const fileName of headerFiles) {
      project.addHeaderFile(`${projectName}/${fileName}`, null, groupKey);
    }

    return cfg;
  });

  return config;
}

module.exports = withSafeGoogleAds;
