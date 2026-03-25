/**
 * Expo config plugin to enable static frameworks via use_frameworks!
 *
 * Instead of relying on expo-build-properties' useFrameworks (which writes
 * a string to Podfile.properties.json, causing "Invalid linkage option"
 * on macOS 15 CocoaPods), this plugin directly injects the correct Ruby
 * symbol syntax: use_frameworks! :linkage => :static
 */
const { withPodfile } = require('expo/config-plugins');

function fixPodfileLinkage(config) {
  return withPodfile(config, (cfg) => {
    const podfile = cfg.modResults;

    // Strategy 1: If the template has the podfile_properties['ios.useFrameworks'] line,
    // replace it with the literal Ruby symbol
    if (podfile.contents.includes("podfile_properties['ios.useFrameworks']")) {
      podfile.contents = podfile.contents.replace(
        /if\s+podfile_properties\['ios\.useFrameworks'\]\s*\n\s*use_frameworks!\s*:linkage\s*=>\s*podfile_properties\['ios\.useFrameworks'\]\s*\n\s*end/,
        "use_frameworks! :linkage => :static"
      );
      console.log('[fix-podfile-linkage] Replaced useFrameworks property lookup with literal :static symbol');
    }

    // Strategy 2: If strategy 1 didn't match (different template format),
    // try replacing just the value
    if (podfile.contents.includes("podfile_properties['ios.useFrameworks']")) {
      podfile.contents = podfile.contents.replace(
        /podfile_properties\['ios\.useFrameworks'\]/g,
        ':static'
      );
      console.log('[fix-podfile-linkage] Replaced useFrameworks value with :static symbol');
    }

    // Strategy 3: If there's no use_frameworks line at all, add one
    // after the "prepare_react_native_project!" or "target" line
    if (!podfile.contents.includes('use_frameworks!')) {
      // Find a good insertion point - after platform or prepare_react_native_project
      const insertAfter = podfile.contents.match(
        /^(.*(?:prepare_react_native_project!|platform :ios.*))\s*$/m
      );
      if (insertAfter) {
        podfile.contents = podfile.contents.replace(
          insertAfter[0],
          insertAfter[0] + '\nuse_frameworks! :linkage => :static'
        );
        console.log('[fix-podfile-linkage] Injected use_frameworks! :linkage => :static');
      }
    }

    return cfg;
  });
}

module.exports = fixPodfileLinkage;
