/**
 * create-platform-sources.js — Create JOB_PLATFORM sources for all 31 markets
 * Each market gets one source per platform (Adzuna, Jooble, CareerJet)
 * These sources use crawlMethod=API and type=JOB_PLATFORM
 *
 * Usage: node create-platform-sources.js [--apply]
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const DRY_RUN = !process.argv.includes('--apply');

const ALL_MARKETS = [
  'TR', 'US', 'DE', 'UK', 'IN', 'BR', 'ID', 'RU', 'MX', 'JP',
  'PH', 'TH', 'CA', 'AU', 'FR', 'IT', 'ES', 'EG', 'SA', 'KR',
  'AR', 'AE', 'VN', 'PL', 'MY', 'CO', 'ZA', 'PT', 'NL', 'PK', 'SE',
];

// Platform definitions — name pattern and company name for each
const PLATFORMS = [
  {
    key: 'ADZUNA',
    companyName: (m) => `Adzuna ${m}`,
    sourceName: (m) => `Adzuna API (${m})`,
    websiteUrl: 'https://www.adzuna.com',
    seedUrl: (m) => `https://api.adzuna.com/v1/api/jobs/${m.toLowerCase()}/search`,
    // Adzuna supports these markets
    markets: ['US', 'UK', 'DE', 'FR', 'IN', 'BR', 'AU', 'CA', 'NL', 'PL', 'RU', 'ZA', 'IT', 'ES', 'SE', 'MX'],
  },
  {
    key: 'JOOBLE',
    companyName: (m) => `Jooble ${m}`,
    sourceName: (m) => `Jooble API (${m})`,
    websiteUrl: 'https://jooble.org',
    seedUrl: (m) => `https://${m.toLowerCase()}.jooble.org/api`,
    // Jooble supports all 31 markets (67 countries total)
    markets: ALL_MARKETS,
  },
  {
    key: 'CAREERJET',
    companyName: (m) => `CareerJet ${m}`,
    sourceName: (m) => `CareerJet API (${m})`,
    websiteUrl: 'https://www.careerjet.com',
    seedUrl: (m) => `https://search.api.careerjet.net/v4/query`,
    // CareerJet supports all 31 markets (60+ countries)
    markets: ALL_MARKETS,
  },
];

async function main() {
  console.log(`Create Job Platform Sources — ${DRY_RUN ? 'DRY RUN' : 'APPLYING'}\n`);

  let created = 0;
  let skipped = 0;

  for (const platform of PLATFORMS) {
    console.log(`\n=== ${platform.key} ===`);

    for (const market of platform.markets) {
      const companyName = platform.companyName(market);
      const sourceName = platform.sourceName(market);

      // Check if source already exists
      const existing = await p.crawlSource.findFirst({
        where: {
          name: sourceName,
          market: market,
        },
      });

      if (existing) {
        console.log(`  ✓ ${market}: ${sourceName} already exists`);
        skipped++;
        continue;
      }

      // Find or create platform company
      let company = await p.company.findFirst({
        where: { name: companyName, market: market },
      });

      if (!company) {
        if (!DRY_RUN) {
          const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          company = await p.company.create({
            data: {
              name: companyName,
              slug: slug,
              market: market,
              sector: 'OTHER',
              websiteUrl: platform.websiteUrl,
              isActive: true,
            },
          });
        }
        console.log(`  ${DRY_RUN ? '[DRY]' : '+'} Company: ${companyName}`);
      }

      // Create source
      if (!DRY_RUN) {
        await p.crawlSource.create({
          data: {
            name: sourceName,
            market: market,
            companyId: company.id,
            type: 'JOB_PLATFORM',
            crawlMethod: 'API',
            seedUrls: [platform.seedUrl(market)],
            isActive: true,
            maxDepth: 1,
          },
        });
      }

      console.log(`  ${DRY_RUN ? '[DRY]' : '+'} Source: ${sourceName}`);
      created++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLIED'}`);
  console.log(`Created: ${created} sources`);
  console.log(`Skipped (existing): ${skipped}`);
  console.log(`\nPlatform coverage:`);
  for (const platform of PLATFORMS) {
    console.log(`  ${platform.key}: ${platform.markets.length} markets`);
  }
  console.log(`Total: ${PLATFORMS.reduce((s, p) => s + p.markets.length, 0)} platform-market combinations`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
