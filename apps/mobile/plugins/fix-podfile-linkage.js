/**
 * Expo config plugin to fix CocoaPods linkage option.
 * On macOS 15 + newer CocoaPods, `use_frameworks! :linkage => "static"` fails
 * because it expects a Ruby symbol (:static) not a string ("static").
 * This plugin patches the Podfile to add `.to_sym` conversion.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

function fixPodfileLinkage(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');

      if (fs.existsSync(podfilePath)) {
        let contents = fs.readFileSync(podfilePath, 'utf-8');

        // Fix: podfile_properties['ios.useFrameworks'] → .to_sym
        // The auto-generated line: use_frameworks! :linkage => podfile_properties['ios.useFrameworks']
        // needs to be: use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym
        if (
          contents.includes("podfile_properties['ios.useFrameworks']") &&
          !contents.includes(".to_sym")
        ) {
          contents = contents.replace(
            /podfile_properties\['ios\.useFrameworks'\]/g,
            "podfile_properties['ios.useFrameworks'].to_sym"
          );
          fs.writeFileSync(podfilePath, contents);
          console.log('[fix-podfile-linkage] Patched Podfile: added .to_sym for useFrameworks');
        }
      }

      return config;
    },
  ]);
}

module.exports = fixPodfileLinkage;
