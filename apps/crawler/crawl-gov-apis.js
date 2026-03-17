/**
 * Crawl government job portals via official APIs
 * Uses gov-api.processor.ts handlers for 19 markets
 */
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { fetchGovApiJobs, hasGovApiHandler } = require('./dist/processors/gov-api.processor');
const { normalizeJobListing } = require('./dist/pipeline/normalize');
const { filterJobListings } = require('./dist/pipeline/quality-filter');
const { checkAndUpsert, deduplicateBatch } = require('./dist/pipeline/deduplicate');

const prisma = new PrismaClient();

const ALL_GOV_MARKETS = [
  'SE','DE','RU','UK','CA','AU','PL','TR',  // original 10 (US/FR need keys)
  'NL','BR','JP','IN','KR','ES','IT','MX','CO', // new 9
];

const MARKETS = process.argv[2]
  ? [process.argv[2]]
  : ALL_GOV_MARKETS;

async function crawlGovMarket(market) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[GOV:${market}] Starting government API crawl...`);
  const start = Date.now();

  if (!hasGovApiHandler(market)) {
    console.log(`[GOV:${market}] No handler, skipping`);
    return { market, fetched: 0, saved: 0, error: 'No handler' };
  }

  // Find the GOVERNMENT source for this market
  const source = await prisma.crawlSource.findFirst({
    where: { isActive: true, type: 'GOVERNMENT', market },
    include: { company: true },
  });

  if (!source) {
    console.log(`[GOV:${market}] No GOVERNMENT source found, skipping`);
    return { market, fetched: 0, saved: 0, error: 'No source' };
  }

  try {
    // 1. Fetch raw jobs from government API
    const rawJobs = await fetchGovApiJobs(market);
    console.log(`[GOV:${market}] Fetched ${rawJobs.length} raw jobs`);

    if (rawJobs.length === 0) {
      return { market, fetched: 0, saved: 0, error: 'No results from API' };
    }

    // 2. Normalize
    const normalized = rawJobs.map(j => normalizeJobListing(j, market)).filter(Boolean);
    console.log(`[GOV:${market}] Normalized: ${normalized.length}`);

    // 3. Quality filter (static only)
    const { passed: filtered } = filterJobListings(normalized, undefined, market);
    console.log(`[GOV:${market}] After quality filter: ${filtered.length}`);

    // 4. Dedup batch
    const deduped = deduplicateBatch(filtered);
    console.log(`[GOV:${market}] After dedup: ${deduped.length}`);

    // 5. Save to DB
    let saved = 0;
    let updated = 0;
    const sector = source.company?.sector || null;

    for (const job of deduped) {
      try {
        const result = await checkAndUpsert(
          prisma,
          source.id,
          source.companyId,
          sector,
          job,
          market,
        );

        if (result.isNew) {
          saved++;
          if (saved % 50 === 0) {
            await new Promise(r => setTimeout(r, 150));
          }
        } else {
          updated++;
        }
      } catch (e) {
        // Skip silently (duplicates etc)
      }
    }

    const duration = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[GOV:${market}] ✅ ${saved} new, ${updated} updated in ${duration}s`);
    return { market, fetched: rawJobs.length, saved, error: null };

  } catch (e) {
    console.error(`[GOV:${market}] ❌ Error: ${e.message}`);
    return { market, fetched: 0, saved: 0, error: e.message };
  }
}

async function main() {
  console.log(`Gov API crawl — ${MARKETS.length} markets: ${MARKETS.join(', ')}`);
  const results = [];

  for (const market of MARKETS) {
    const result = await crawlGovMarket(market);
    results.push(result);
    // 2 second gap between markets
    await new Promise(r => setTimeout(r, 2000));
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('GOV API SUMMARY:');
  let totalSaved = 0;
  for (const r of results) {
    const status = r.error ? `❌ ${r.error}` : `✅ ${r.saved} new`;
    console.log(`  ${r.market}: fetched=${r.fetched}, ${status}`);
    totalSaved += r.saved;
  }
  console.log(`Total new gov jobs saved: ${totalSaved}`);

  const total = await prisma.jobListing.count({ where: { status: 'ACTIVE' } });
  console.log(`Total active jobs in DB: ${total}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
