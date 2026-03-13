module.exports = function (api) {
  // Invalidate cache when EXPO_ROUTER_APP_ROOT changes
  api.cache.using(() => process.env.EXPO_ROUTER_APP_ROOT || '');

  // Ensure env var is set for babel-preset-expo to inline it
  if (!process.env.EXPO_ROUTER_APP_ROOT) {
    process.env.EXPO_ROUTER_APP_ROOT = './app';
  }

  return {
    presets: [require.resolve('babel-preset-expo')],
  };
};
