/**
 * Expo config plugin to disable Android lint fatal errors during release builds.
 * Fixes ExtraTranslation errors caused by iOS-specific locale keys (CFBundleDisplayName, etc.)
 * being converted to Android string resources without a default locale entry.
 */
const { withAppBuildGradle } = require('expo/config-plugins');

function disableLintPlugin(config) {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    // Add lintOptions to disable fatal lint errors
    if (!contents.includes('abortOnError false')) {
      config.modResults.contents = contents.replace(
        /android\s*\{/,
        `android {
    lint {
        abortOnError false
        checkReleaseBuilds false
    }`
      );
    }

    return config;
  });
}

module.exports = disableLintPlugin;
