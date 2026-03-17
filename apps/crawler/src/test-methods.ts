/**
 * Test each crawl method individually.
 * Crawls a few sources and shows results with dates.
 */
import { PrismaClient } from '@prisma/client';
import { discoverBestMethod } from './processors/auto-discover';
import { fetchRssJobListings } from './processors/rss.processor';
import { scrapeGeneric } from './processors/generic-scraper';
import { normalizeJobListing, RawJobData } from './pipeline/normalize';
import { filterJobListings } from './pipeline/quality-filter';

// scoreListing is no longer exported; use filterJobListings wrapper
function scoreListing(normalized: any, companyName?: string) {
  const { passed, rejected } = filterJobListings([normalized], companyName);
  if (passed.length > 0) {
    return { passed: true, score: 3, reasons: ['passed-filter'], hardRejected: null };
  }
  return { passed: false, score: 0, reasons: ['rejected'], hardRejected: 'quality-filter' };
}

const prisma = new PrismaClient();

// Test sources with different expected methods
const TEST_URLS = [
  { name: 'Indeed TR', url: 'https://tr.indeed.com/jobs?q=garson', expectation: 'HTML' },
  { name: 'Kariyer.net', url: 'https://www.kariyer.net/is-ilanlari', expectation: 'HTML' },
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/search/?keywords=driver', expectation: 'HTML' },
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
    const jobs = await fetchRssJobListings(feedUrl);
    console.log(`  Found: ${jobs.length} job listings`);
    showJobListings(jobs);
    return jobs;
  } catch (err) {
    console.error(`  RSS FAILED: ${(err as Error).message}`);
    return [];
  }
}

async function testGenericScraper(url: string) {
  console.log(`\n--- HTML Cheerio Test: ${url} ---`);
  try {
    const jobs = await scrapeGeneric(url, 2);
    console.log(`  Found: ${jobs.length} job listings`);
    showJobListings(jobs);
    return jobs;
  } catch (err) {
    console.error(`  HTML Scrape FAILED: ${(err as Error).message}`);
    return [];
  }
}

function showJobListings(jobs: RawJobData[]) {
  for (const j of jobs.slice(0, 5)) {
    const normalized = normalizeJobListing(j);
    const quality = scoreListing(normalized);

    console.log(`\n  "${j.title?.substring(0, 70)}"`);
    console.log(`     URL: ${j.sourceUrl?.substring(0, 80)}`);
    console.log(`     PostedDate: ${j.postedDate || 'N/A'}`);
    console.log(`     Deadline: ${j.deadline || 'N/A'}`);
    console.log(`     Salary: ${j.salaryText || 'N/A'}`);
    console.log(`     Location: ${j.locationText || 'N/A'}`);
    console.log(`     Images: ${j.imageUrls?.length || 0}`);
    console.log(`     Quality: score=${quality.score} ${quality.passed ? 'PASSED' : 'REJECTED'} [${quality.reasons.join(', ')}]`);
  }

  if (jobs.length > 5) {
    console.log(`\n  ... and ${jobs.length - 5} more`);
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
