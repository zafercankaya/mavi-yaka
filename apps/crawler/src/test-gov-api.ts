/**
 * test-gov-api.ts — Test government API processor
 * Usage: npx ts-node --transpile-only src/test-gov-api.ts [market]
 *   npx ts-node --transpile-only src/test-gov-api.ts SE
 *   npx ts-node --transpile-only src/test-gov-api.ts DE
 *   npx ts-node --transpile-only src/test-gov-api.ts     # Test all
 */

import { fetchGovApiJobs, hasGovApiHandler } from './processors/gov-api.processor';
import type { Market } from './pipeline/normalize';

const MARKETS: Market[] = ['SE', 'DE', 'RU', 'US', 'FR'];

async function main() {
  const targetMarket = process.argv[2]?.toUpperCase() as Market | undefined;
  const marketsToTest = targetMarket ? [targetMarket] : MARKETS;

  console.log('Government API Processor Test');
  console.log('='.repeat(50));

  for (const market of marketsToTest) {
    if (!hasGovApiHandler(market)) {
      console.log(`\n${market}: No handler, skipping`);
      continue;
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Testing ${market}...`);
    console.log('='.repeat(50));

    const startTime = Date.now();
    const jobs = await fetchGovApiJobs(market);
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\nResults: ${jobs.length} jobs in ${duration}s`);

    // Show first 3 samples
    for (const job of jobs.slice(0, 3)) {
      console.log(`  - "${job.title}"`);
      console.log(`    URL: ${job.sourceUrl}`);
      console.log(`    Location: ${job.locationText || 'N/A'}`);
      console.log(`    Salary: ${job.salaryText || 'N/A'}`);
      console.log(`    Deadline: ${job.deadline || 'N/A'}`);
    }
    if (jobs.length > 3) {
      console.log(`  ... and ${jobs.length - 3} more`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('Test complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
