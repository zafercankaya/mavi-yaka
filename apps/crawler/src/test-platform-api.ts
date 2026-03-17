/**
 * test-platform-api.ts — Test job platform API processors
 * Usage: npx ts-node --transpile-only src/test-platform-api.ts [market]
 */
import './config';
import { fetchAllPlatformJobs, getAvailablePlatforms } from './processors/job-platform-api.processor';
import type { Market } from './pipeline/normalize';

async function main() {
  const market = (process.argv[2]?.toUpperCase() || 'TR') as Market;

  console.log('Job Platform API Test');
  console.log('='.repeat(50));

  const platforms = getAvailablePlatforms();
  console.log(`Available platforms: ${platforms.join(', ') || 'NONE (no API keys set)'}`);
  console.log(`Testing market: ${market}\n`);

  if (platforms.length === 0) {
    console.log('No API keys configured. Set ADZUNA_APP_ID/KEY, JOOBLE_API_KEY, or CAREERJET_API_KEY');
    process.exit(1);
  }

  const startTime = Date.now();
  const jobs = await fetchAllPlatformJobs(market);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${jobs.length} unique jobs in ${duration}s`);

  // Show first 5 samples
  for (const job of jobs.slice(0, 5)) {
    console.log(`\n  - "${job.title}"`);
    console.log(`    URL: ${job.sourceUrl?.substring(0, 80)}`);
    console.log(`    Location: ${job.locationText || 'N/A'}`);
    console.log(`    Salary: ${job.salaryText || 'N/A'}`);
  }
  if (jobs.length > 5) {
    console.log(`\n  ... and ${jobs.length - 5} more`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
