/**
 * test-gov-html.ts — Test HTML scraping for government portals
 * Usage: npx ts-node --transpile-only src/test-gov-html.ts [market]
 */

import { scrapeGeneric } from './processors/generic-scraper';
import { scrapeGenericPlaywright, closeBrowser } from './processors/playwright-fallback';
import type { CrawlMarket } from './config';

const GOV_URLS: Record<string, { url: string; needsPlaywright: boolean }> = {
  TR: { url: 'https://esube.iskur.gov.tr/Istihdam/AcikIsIlan662.aspx', needsPlaywright: true },
  UK: { url: 'https://findajob.dwp.gov.uk/', needsPlaywright: false },
  IN: { url: 'https://www.ncs.gov.in/Pages/Search.aspx', needsPlaywright: false },
  JP: { url: 'https://www.hellowork.mhlw.go.jp/kensaku/GECA110010.do?action=initDisp&screenId=GECA110010', needsPlaywright: false },
  PL: { url: 'https://oferty.praca.gov.pl/portal/index.cbop', needsPlaywright: false },
  MX: { url: 'https://www.empleo.gob.mx/empleo', needsPlaywright: false },
};

async function test() {
  const market = (process.argv[2]?.toUpperCase() || 'TR') as string;
  const config = GOV_URLS[market];

  if (!config) {
    console.log(`No test config for ${market}. Available: ${Object.keys(GOV_URLS).join(', ')}`);
    process.exit(1);
  }

  console.log(`Testing ${market} government portal HTML scraping`);
  console.log(`URL: ${config.url}`);
  console.log(`Playwright: ${config.needsPlaywright ? 'Yes' : 'No (Cheerio first)'}`);
  console.log('='.repeat(50));

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), 30_000);

  try {
    if (config.needsPlaywright) {
      console.log('Using Playwright...');
      const results = await scrapeGenericPlaywright(
        config.url, 1, market as CrawlMarket, abortController.signal,
      );
      console.log(`\nResults: ${results.length} items`);
      for (const r of results.slice(0, 5)) {
        console.log(`  - "${r.title?.substring(0, 60)}"`);
        console.log(`    URL: ${r.sourceUrl?.substring(0, 80)}`);
      }
    } else {
      console.log('Using Cheerio...');
      const results: any[] = [];
      await scrapeGeneric(config.url, 1, market as CrawlMarket, abortController.signal, results);
      console.log(`\nResults: ${results.length} items`);
      for (const r of results.slice(0, 5)) {
        console.log(`  - "${r.title?.substring(0, 60)}"`);
        console.log(`    URL: ${r.sourceUrl?.substring(0, 80)}`);
      }
    }
  } catch (e) {
    console.error(`Error: ${(e as Error).message}`);
  } finally {
    clearTimeout(timeout);
    await closeBrowser();
  }
}

test().catch(e => { console.error(e); process.exit(1); });
