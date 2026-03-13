/**
 * Monorepo fix: expo-router _ctx files need hardcoded paths
 * because babel-preset-expo's env var inlining doesn't work
 * when expo-router is hoisted to root node_modules in EAS builds.
 *
 * Run after npm install: node scripts/patch-expo-router.js
 */
const fs = require('fs');
const path = require('path');

// Check both local and hoisted (monorepo root) node_modules
const searchPaths = [
  path.join(__dirname, '..', 'node_modules', 'expo-router'),
  path.join(__dirname, '..', '..', '..', 'node_modules', 'expo-router'),
];

const files = ['_ctx.ios.js', '_ctx.android.js', '_ctx.js', '_ctx.web.js', '_ctx-html.js'];

let patched = 0;
for (const dir of searchPaths) {
  if (!fs.existsSync(dir)) continue;
  console.log(`Checking: ${dir}`);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('process.env.EXPO_ROUTER_APP_ROOT')) {
      content = content.replace(/process\.env\.EXPO_ROUTER_APP_ROOT/g, "'./app'");
      content = content.replace(/process\.env\.EXPO_ROUTER_IMPORT_MODE/g, "'sync'");
      fs.writeFileSync(filePath, content);
      patched++;
      console.log(`  Patched: ${file}`);
    }
  }
}
console.log(`expo-router: ${patched} file(s) patched`);
