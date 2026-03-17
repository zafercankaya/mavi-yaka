const path = require('path');

// Must be set before any Metro/babel config loads — transform workers inherit this
// Always use absolute path to prevent monorepo/local-build resolution issues
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(__dirname, 'app');

const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch shared packages (not the entire monorepo root)
config.watchFolders = [
  path.resolve(monorepoRoot, 'packages'),
];

// 2. Let Metro know where to find node_modules — mobile first, then root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Force critical packages to resolve from mobile's node_modules
//    to prevent monorepo hoisting issues
const mobileModules = path.resolve(projectRoot, 'node_modules');
const singletonPkgs = [
  'react', 'react-native', 'react-dom',
  'expo', 'expo-router', 'expo-modules-core',
];

// Mock react-native-google-mobile-ads in Expo Go (no native module available)
const adsMockPath = path.resolve(projectRoot, 'src/mocks/google-mobile-ads.js');
// EAS Build sets EAS_BUILD=true; local metro dev does not
const isLocalDev = !process.env.EAS_BUILD;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // In Expo Go / local dev, redirect google-mobile-ads to a safe mock
  if (moduleName === 'react-native-google-mobile-ads' || moduleName.startsWith('react-native-google-mobile-ads/')) {
    if (isLocalDev) {
      return { filePath: adsMockPath, type: 'sourceFile' };
    }
  }

  const basePkg = moduleName.startsWith('@')
    ? moduleName.split('/').slice(0, 2).join('/')
    : moduleName.split('/')[0];

  if (singletonPkgs.includes(basePkg)) {
    try {
      const resolved = require.resolve(moduleName, { paths: [mobileModules] });
      return { filePath: resolved, type: 'sourceFile' };
    } catch {
      // Fall through to default resolution
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

// 4. Windows: disable watchman (not installed) and use polling to avoid
//    "Failed to start watch mode" timeout errors
if (process.platform === 'win32') {
  config.watcher = {
    ...config.watcher,
    watchman: { enabled: false },
  };
}

module.exports = config;
