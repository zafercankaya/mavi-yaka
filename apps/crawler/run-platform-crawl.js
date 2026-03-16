/**
 * run-platform-crawl.js — Run platform API crawl for specified markets
 * Uses FIXED Jooble English queries + proper Prisma field mapping
 * Usage: node run-platform-crawl.js TR US DE ...
 */
require('dotenv').config();
require('ts-node').register({ transpileOnly: true });
require('./src/config');

const { fetchAllPlatformJobs, getAvailablePlatforms } = require('./src/processors/job-platform-api.processor');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const p = new PrismaClient();

const markets = process.argv.slice(2).map(m => m.toUpperCase());
if (markets.length === 0) {
  console.log('Usage: node run-platform-crawl.js TR US DE ...');
  process.exit(1);
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 200) || 'job';
}

// Cache sources per market to avoid repeated queries
const sourceCache = new Map();

async function getSource(market) {
  if (sourceCache.has(market)) return sourceCache.get(market);
  const source = await p.crawlSource.findFirst({
    where: { market, type: 'JOB_PLATFORM', isActive: true },
    select: { id: true, companyId: true },
  });
  sourceCache.set(market, source);
  return source;
}

async function main() {
  const platforms = getAvailablePlatforms();
  console.log(`Platforms: ${platforms.join(', ')}`);
  console.log(`Markets: ${markets.join(', ')}\n`);

  const results = [];

  for (const market of markets) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  Crawling ${market}...`);
    console.log('='.repeat(50));

    const source = await getSource(market);
    if (!source) {
      console.log(`  No JOB_PLATFORM source for ${market}, skipping`);
      results.push({ market, fetched: 0, saved: 0, dupes: 0, errors: 0, duration: '0' });
      continue;
    }

    const startTime = Date.now();
    try {
      const jobs = await fetchAllPlatformJobs(market);
      const fetchDuration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  ${market}: ${jobs.length} fetched in ${fetchDuration}s, saving...`);

      let saved = 0;
      let dupes = 0;
      let errors = 0;

      for (const job of jobs) {
        // Skip invalid entries
        if (!job.title || typeof job.title !== 'string' || job.title.trim().length < 3) continue;
        if (!job.sourceUrl || typeof job.sourceUrl !== 'string' || !job.sourceUrl.startsWith('http')) continue;

        const title = job.title.trim().substring(0, 500);
        const sourceUrl = job.sourceUrl.trim().substring(0, 2000);
        const slug = slugify(title) + '-' + crypto.randomBytes(3).toString('hex');
        const fingerprint = crypto.createHash('md5').update(sourceUrl).digest('hex');

        try {
          await p.jobListing.create({
            data: {
              title,
              slug,
              companyId: source.companyId,
              sourceId: source.id,
              sourceUrl,
              canonicalUrl: sourceUrl,
              country: market,
              city: (job.locationText && typeof job.locationText === 'string') ? job.locationText.substring(0, 200) : null,
              description: (job.description && typeof job.description === 'string') ? job.description.substring(0, 5000) : null,
              status: 'ACTIVE',
              fingerprint,
              lastSeenAt: new Date(),
            },
          });
          saved++;
        } catch (e) {
          if (e.code === 'P2002') {
            dupes++;
          } else {
            errors++;
            if (errors <= 2) console.log(`    Save error: ${e.message.substring(0, 200)}`);
          }
        }
      }

      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  ${market}: ${saved} saved, ${dupes} dupes, ${errors} errors (${totalDuration}s)`);
      results.push({ market, fetched: jobs.length, saved, dupes, errors, duration: totalDuration });
    } catch (err) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`  ${market}: ERROR - ${err.message.substring(0, 200)} (${duration}s)`);
      results.push({ market, fetched: 0, saved: 0, dupes: 0, errors: 1, duration });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('  PLATFORM CRAWL SUMMARY');
  console.log('='.repeat(60));
  let totalFetched = 0, totalSaved = 0, totalDupes = 0;
  for (const r of results) {
    console.log(`  ${r.market.padEnd(4)} ${String(r.fetched).padStart(5)} fetched  ${String(r.saved).padStart(5)} saved  ${String(r.dupes).padStart(4)} dupes  ${String(r.errors).padStart(3)} err`);
    totalFetched += r.fetched;
    totalSaved += r.saved;
    totalDupes += r.dupes;
  }
  console.log(`\n  TOTAL: ${totalFetched} fetched, ${totalSaved} saved, ${totalDupes} dupes`);

  await p.$disconnect();
}

main().catch(async e => { console.error(e); await p.$disconnect(); });
