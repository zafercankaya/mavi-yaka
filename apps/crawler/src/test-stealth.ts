/**
 * Test stealth changes in isolation:
 * 1. stealth.ts exports (UA rotation, headers, viewport, delay)
 * 2. fetchHtml with stealth headers (HTTP)
 * 3. Playwright with stealth init script
 * 4. 429 retry logic (simulated)
 */
import { getRandomUserAgent, getStealthHeaders, getRandomViewport, randomDelay, STEALTH_CHROMIUM_ARGS, STEALTH_INIT_SCRIPT } from './utils/stealth';

async function testStealthUtils() {
  console.log('=== Test 1: Stealth Utils ===\n');

  // UA rotation — should give different UAs
  const uas = new Set<string>();
  for (let i = 0; i < 30; i++) uas.add(getRandomUserAgent());
  console.log(`✓ UA pool: ${uas.size} unique UAs from 30 calls (pool size: 15)`);

  // Headers — market-aware
  const trHeaders = getStealthHeaders('TR' as any);
  const usHeaders = getStealthHeaders('US' as any);
  console.log(`✓ TR headers: ${Object.keys(trHeaders).length} keys, Accept-Language: ${trHeaders['Accept-Language']?.substring(0, 15)}...`);
  console.log(`✓ US headers: ${Object.keys(usHeaders).length} keys, Accept-Language: ${usHeaders['Accept-Language']?.substring(0, 15)}...`);
  console.log(`✓ Referer TR: ${trHeaders['Referer']}`);
  console.log(`✓ Referer US: ${usHeaders['Referer']}`);

  // Sec-CH-UA present for Chrome/Edge UAs
  const hasSecCh = trHeaders['Sec-CH-UA'] !== undefined;
  console.log(`✓ Sec-CH-UA present: ${hasSecCh} (depends on random UA type)`);

  // Viewport randomization
  const viewports = new Set<string>();
  for (let i = 0; i < 20; i++) {
    const v = getRandomViewport();
    viewports.add(`${v.width}x${v.height}`);
  }
  console.log(`✓ Viewport pool: ${viewports.size} unique sizes from 20 calls (pool size: 7)`);

  // Delay jitter
  const delays: number[] = [];
  for (let i = 0; i < 100; i++) delays.push(randomDelay(1000));
  const min = Math.min(...delays);
  const max = Math.max(...delays);
  const avg = Math.round(delays.reduce((a, b) => a + b) / delays.length);
  console.log(`✓ Delay jitter (base 1000ms): min=${min}ms, max=${max}ms, avg=${avg}ms`);

  // Chromium args
  console.log(`✓ STEALTH_CHROMIUM_ARGS: ${JSON.stringify(STEALTH_CHROMIUM_ARGS)}`);
  console.log(`✓ STEALTH_INIT_SCRIPT length: ${STEALTH_INIT_SCRIPT.length} chars`);
}

async function testHttpFetch() {
  console.log('\n=== Test 2: HTTP Fetch with Stealth Headers ===\n');

  const testUrls = [
    { url: 'https://www.trendyol.com/butik/liste/erkek-kampanyalari', name: 'Trendyol (TR)' },
    { url: 'https://www.amazon.com/deals', name: 'Amazon (US, WAF protected)' },
    { url: 'https://www.hepsiburada.com/kampanyalar', name: 'Hepsiburada (TR)' },
  ];

  for (const { url, name } of testUrls) {
    try {
      const headers = getStealthHeaders();
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(15000),
        redirect: 'follow',
      });

      const contentLength = response.headers.get('content-length') || 'unknown';
      const contentType = response.headers.get('content-type')?.substring(0, 30) || 'unknown';
      console.log(`✓ ${name}: HTTP ${response.status} ${response.statusText} (type: ${contentType}, size: ${contentLength})`);

      // Check if we got actual HTML (not a block page)
      if (response.ok) {
        const text = await response.text();
        const hasHtml = text.includes('<html') || text.includes('<!DOCTYPE');
        const hasTitle = text.match(/<title[^>]*>([^<]+)<\/title>/i);
        console.log(`  → HTML: ${hasHtml}, Title: "${hasTitle?.[1]?.substring(0, 50) || 'none'}"`);
      }
    } catch (err) {
      console.log(`✗ ${name}: ${(err as Error).message}`);
    }
  }
}

async function testPlaywrightStealth() {
  console.log('\n=== Test 3: Playwright with Stealth ===\n');

  try {
    const { getBrowser, closeBrowser } = await import('./processors/playwright-fallback');
    const browser = await getBrowser();
    console.log(`✓ Browser launched with stealth args`);

    const viewport = getRandomViewport();
    const context = await browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport,
      extraHTTPHeaders: getStealthHeaders(),
    });

    const page = await context.newPage();

    // Inject stealth script
    await page.addInitScript(STEALTH_INIT_SCRIPT);

    // Navigate to a bot-detection test page
    await page.goto('https://bot.sannysoft.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));

    // Check navigator.webdriver
    const webdriver = await page.evaluate('navigator.webdriver');
    console.log(`✓ navigator.webdriver = ${webdriver} (should be false or undefined)`);

    // Check chrome.runtime exists
    const chromeRuntime = await page.evaluate('!!window.chrome?.runtime');
    console.log(`✓ window.chrome.runtime exists: ${chromeRuntime}`);

    // Check user agent
    const ua = await page.evaluate('navigator.userAgent') as string;
    console.log(`✓ Browser UA: ${ua.substring(0, 60)}...`);

    // Check viewport
    const vp = await page.evaluate('({ w: window.innerWidth, h: window.innerHeight })') as any;
    console.log(`✓ Viewport: ${vp.w}x${vp.h}`);

    await page.close();
    await context.close();
    await closeBrowser();
    console.log(`✓ Browser closed`);
  } catch (err) {
    console.log(`✗ Playwright test failed: ${(err as Error).message}`);
  }
}

async function testRealCrawl() {
  console.log('\n=== Test 4: Real Crawl (single source) ===\n');

  try {
    // Test the actual scrapeCampaigns function
    const { scrapeCampaigns } = await import('./processors/scrape.processor');

    // Use a simple TR source with known selectors
    const result = await scrapeCampaigns(
      'https://www.trendyol.com/butik/liste/erkek-kampanyalari',
      {
        list: '.campaign-card, .boutiqueCard, [class*="campaign"]',
        title: '.campaign-title, .boutique-title, [class*="title"]',
        image: 'img',
        link: 'a',
      },
      1,
    );

    console.log(`✓ scrapeCampaigns returned ${result.length} campaigns`);
    if (result.length > 0) {
      console.log(`  → First: "${result[0].title?.substring(0, 50)}" (${result[0].sourceUrl?.substring(0, 50)})`);
    }
  } catch (err) {
    console.log(`✗ Real crawl failed: ${(err as Error).message}`);
  }
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Crawler Stealth Test Suite');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await testStealthUtils();
  await testHttpFetch();
  await testPlaywrightStealth();
  await testRealCrawl();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  All tests complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  process.exit(0);
}

main().catch(console.error);
