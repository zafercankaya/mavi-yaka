/**
 * Expo config plugin to enable static frameworks via use_frameworks!
 *
 * Instead of relying on expo-build-properties' useFrameworks (which writes
 * a string to Podfile.properties.json, causing "Invalid linkage option"
 * on macOS 15 + CocoaPods 1.16.2), this plugin:
 * 1. Removes the template's if/end block that reads from properties
 * 2. Injects use_frameworks! :linkage => :static as Ruby literal
 */
const { withPodfile } = require('expo/config-plugins');

function fixPodfileLinkage(config) {
  return withPodfile(config, (cfg) => {
    let contents = cfg.modResults.contents;

    // Remove the template's if/end block for useFrameworks (it reads a string from JSON)
    // This block may contain pods added by other plugins (like Google-Mobile-Ads-SDK)
    // We need to preserve those pods
    const ifBlockRegex = /if\s+podfile_properties\['ios\.useFrameworks'\]\s*\n([\s\S]*?)\n\s*end/;
    const match = contents.match(ifBlockRegex);

    let extractedPods = '';
    if (match) {
      // Extract any pod lines from inside the if block
      const blockContents = match[1];
      const podLines = blockContents.split('\n').filter(l => l.trim().startsWith('pod '));
      extractedPods = podLines.map(l => l.trim()).join('\n  ');

      // Remove the entire if/end block
      contents = contents.replace(ifBlockRegex, '');
      console.log('[fix-podfile-linkage] Removed template useFrameworks if/end block');
    }

    // Find the right place to insert use_frameworks! — after use_native_modules! or config = use_native_modules!
    if (!contents.includes('use_frameworks!') || contents.includes("ENV['USE_FRAMEWORKS']")) {
      // Only add if there's no existing use_frameworks! (excluding the ENV-based one)
      const hasOurLine = contents.includes('use_frameworks! :linkage => :static');
      if (!hasOurLine) {
        const insertPoint = contents.match(/config\s*=\s*use_native_modules!\(.*?\)/s);
        if (insertPoint) {
          const line = `use_frameworks! :linkage => :static`;
          const podsLine = extractedPods ? `\n  ${extractedPods}` : '';
          contents = contents.replace(
            insertPoint[0],
            `${insertPoint[0]}\n  ${line}${podsLine}`
          );
          console.log('[fix-podfile-linkage] Injected use_frameworks! :linkage => :static');
        }
      }
    }

    cfg.modResults.contents = contents;
    return cfg;
  });
}

module.exports = fixPodfileLinkage;
