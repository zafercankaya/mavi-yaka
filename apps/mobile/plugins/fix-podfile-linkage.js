/**
 * Expo config plugin to fix CocoaPods linkage option.
 * On macOS 15 + newer CocoaPods, `use_frameworks! :linkage => "static"` fails
 * because it expects a Ruby symbol (:static) not a string ("static").
 *
 * Uses withPodfile modifier (not withDangerousMod) to patch at the right time
 * in the Expo config plugin lifecycle, after the Podfile content is generated.
 */
const { withPodfile } = require('expo/config-plugins');

function fixPodfileLinkage(config) {
  return withPodfile(config, (cfg) => {
    const podfile = cfg.modResults;

    if (
      podfile.contents.includes("podfile_properties['ios.useFrameworks']") &&
      !podfile.contents.includes(".to_sym")
    ) {
      podfile.contents = podfile.contents.replace(
        /podfile_properties\['ios\.useFrameworks'\]/g,
        "podfile_properties['ios.useFrameworks'].to_sym"
      );
      console.log('[fix-podfile-linkage] Patched Podfile: added .to_sym for useFrameworks');
    }

    return cfg;
  });
}

module.exports = fixPodfileLinkage;
