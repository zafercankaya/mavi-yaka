#!/usr/bin/env node
/**
 * Custom iOS prebuild script for EAS.
 * Runs expo prebuild, then patches the Podfile to fix the linkage symbol issue.
 *
 * On macOS 15 + newer CocoaPods, use_frameworks! expects a Ruby symbol (:static)
 * not a string ("static"). The default Expo template passes a string from
 * Podfile.properties.json. This script adds .to_sym conversion.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Run default expo prebuild
console.log('[prebuild-ios] Running expo prebuild...');
execSync('npx expo prebuild --platform ios --clean --no-install', {
  stdio: 'inherit',
  cwd: __dirname.replace(/[\\/]scripts$/, ''),
});

// Patch the generated Podfile
const podfilePath = path.join(__dirname, '..', 'ios', 'Podfile');

if (fs.existsSync(podfilePath)) {
  let contents = fs.readFileSync(podfilePath, 'utf-8');
  const before = contents;

  // Add .to_sym to convert string "static" to Ruby symbol :static
  contents = contents.replace(
    /podfile_properties\['ios\.useFrameworks'\](?!\.to_sym)/g,
    "podfile_properties['ios.useFrameworks'].to_sym"
  );

  if (contents !== before) {
    fs.writeFileSync(podfilePath, contents);
    console.log('[prebuild-ios] Patched Podfile: added .to_sym for useFrameworks linkage');
  } else {
    console.log('[prebuild-ios] Podfile already patched or pattern not found');
  }

  // Log the relevant line for debugging
  const lines = contents.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('use_frameworks')) {
      console.log(`[prebuild-ios] Podfile line ${i + 1}: ${lines[i].trim()}`);
    }
  }
} else {
  console.error('[prebuild-ios] WARNING: Podfile not found at', podfilePath);
}
