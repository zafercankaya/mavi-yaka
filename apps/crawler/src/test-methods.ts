/**
 * Test each crawl method individually.
 * Crawls a few brands and shows results with dates.
 */
import { PrismaClient } from '@prisma/client';
import { discoverBestMethod } from './processors/auto-discover';
import { fetchRssCampaigns } from './processors/rss.processor';
import { scrapeGeneric } from './processors/generic-scraper';
import { normalizeCampaign, RawCampaignData } from './pipeline/normalize';
import { filterCampaigns } from './pipeline/quality-filter';

// scoreCampaign is no longer exported; use filterCampaigns wrapper
function scoreCampaign(normalized: any, companyName?: string) {
  const { passed, rejected } = filterCampaigns([normalized], companyName);
  if (passed.length > 0) {
    return { passed: true, score: 3, reasons: ['passed-filter'], hardRejected: null };
  }
  return { passed: false, score: 0, reasons: ['rejected'], hardRejected: 'quality-filter' };
}

const prisma = new PrismaClient();

// Test brands with different expected methods
const TEST_URLS = [
  { name: 'Migros', url: 'https://www.migros.com.tr/kampanyalar', expectation: 'HTML or RSS' },
  { name: 'Teknosa', url: 'https://www.teknosa.com/kampanyalar', expectation: 'HTML' },
  { name: 'Boyner', url: 'https://www.boyner.com.tr/kampanyalar', expectation: 'HTML' },
];

async function testDiscovery(name: string, url: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`DISCOVERY: ${name} (${url})`);
  console.log('='.repeat(60));

  try {
    const result = await discoverBestMethod(url);
    console.log(`  Method: ${result.method}`);
    if (result.feedUrl) console.log(`  Feed URL: ${result.feedUrl}`);
    if (result.apiUrl) console.log(`  API URL: ${result.apiUrl}`);
    return result;
  } catch (err) {
    console.error(`  Discovery FAILED: ${(err as Error).message}`);
    return null;
  }
}

async function testRSS(feedUrl: string) {
  console.log(`\n--- RSS Test: ${feedUrl} ---`);
  try {
    const campaigns = await fetchRssCampaigns(feedUrl);
    console.log(`  Found: ${campaigns.length} campaigns`);
    showCampaigns(campaigns);
    return campaigns;
  } catch (err) {
    console.error(`  RSS FAILED: ${(err as Error).message}`);
    return [];
  }
}

async function testGenericScraper(url: string) {
  console.log(`\n--- HTML Cheerio Test: ${url} ---`);
  try {
    const campaigns = await scrapeGeneric(url, 2);
    console.log(`  Found: ${campaigns.length} campaigns`);
    showCampaigns(campaigns);
    return campaigns;
  } catch (err) {
    console.error(`  HTML Scrape FAILED: ${(err as Error).message}`);
    return [];
  }
}

function showCampaigns(campaigns: RawCampaignData[]) {
  for (const c of campaigns.slice(0, 5)) {
    const normalized = normalizeCampaign(c);
    const quality = scoreCampaign(normalized);

    console.log(`\n  📌 "${c.title?.substring(0, 70)}"`);
    console.log(`     URL: ${c.sourceUrl?.substring(0, 80)}`);
    console.log(`     PostedDate: ${c.postedDate || 'YOK'}`);
    console.log(`     Deadline: ${c.deadline || 'YOK'}`);
    console.log(`     Discount: YOK`);
    console.log(`     Images: ${c.imageUrls?.length || 0}`);
    console.log(`     Quality: score=${quality.score} ${quality.passed ? 'PASSED' : 'REJECTED'} [${quality.reasons.join(', ')}]`);
  }

  if (campaigns.length > 5) {
    console.log(`\n  ... ve ${campaigns.length - 5} daha`);
  }
}

async function main() {
  console.log('=== CRAWL METHOD TESTING ===\n');

  for (const test of TEST_URLS) {
    // Step 1: Discover best method
    const discovery = await testDiscovery(test.name, test.url);

    // Step 2: If RSS found, test RSS
    if (discovery?.method === 'RSS' && discovery.feedUrl) {
      await testRSS(discovery.feedUrl);
    }

    // Step 3: Always test generic HTML scraper too
    await testGenericScraper(test.url);
  }

  console.log('\n\n=== ALL TESTS COMPLETE ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
