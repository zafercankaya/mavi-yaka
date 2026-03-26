/**
 * bulk-import-arbeitnow.ts — Import jobs from ArbeitNow free API
 *
 * ArbeitNow aggregates jobs from ATS systems (Greenhouse, SmartRecruiters,
 * Join.com, TeamTailor, Recruitee, Comeet). Primarily Europe/Germany focused.
 *
 * API: https://www.arbeitnow.com/api/job-board-api
 * - Free, no API key needed
 * - 100 jobs per page, paginated
 * - Updated hourly
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-arbeitnow.ts
 */

import { PrismaClient, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

const API_BASE = 'https://www.arbeitnow.com/api/job-board-api';
const MAX_PAGES = 30; // safety cap
const REQUEST_DELAY_MS = 2000;

// Map location keywords to our Market enum
const LOCATION_ENTRIES: [string, string][] = [
  ['germany', 'DE'], ['deutschland', 'DE'], ['berlin', 'DE'], ['munich', 'DE'], ['münchen', 'DE'],
  ['hamburg', 'DE'], ['frankfurt', 'DE'], ['cologne', 'DE'], ['köln', 'DE'], ['düsseldorf', 'DE'],
  ['stuttgart', 'DE'], ['dortmund', 'DE'], ['essen', 'DE'], ['leipzig', 'DE'], ['bremen', 'DE'],
  ['dresden', 'DE'], ['hannover', 'DE'], ['nürnberg', 'DE'], ['duisburg', 'DE'], ['bochum', 'DE'],
  ['austria', 'DE'], ['wien', 'DE'], ['vienna', 'DE'],
  ['switzerland', 'DE'], ['zürich', 'DE'], ['zurich', 'DE'],
  ['netherlands', 'NL'], ['amsterdam', 'NL'], ['rotterdam', 'NL'], ['utrecht', 'NL'],
  ['the hague', 'NL'], ['eindhoven', 'NL'], ['den haag', 'NL'],
  ['france', 'FR'], ['paris', 'FR'], ['lyon', 'FR'], ['marseille', 'FR'],
  ['spain', 'ES'], ['madrid', 'ES'], ['barcelona', 'ES'],
  ['italy', 'IT'], ['milan', 'IT'], ['rome', 'IT'], ['roma', 'IT'], ['milano', 'IT'],
  ['portugal', 'PT'], ['lisbon', 'PT'], ['lisboa', 'PT'], ['porto', 'PT'],
  ['poland', 'PL'], ['warsaw', 'PL'], ['warszawa', 'PL'], ['krakow', 'PL'], ['kraków', 'PL'],
  ['sweden', 'SE'], ['stockholm', 'SE'], ['gothenburg', 'SE'], ['malmö', 'SE'],
  ['uk', 'UK'], ['london', 'UK'], ['manchester', 'UK'], ['birmingham', 'UK'],
  ['united kingdom', 'UK'], ['england', 'UK'],
  ['us', 'US'], ['united states', 'US'], ['new york', 'US'], ['california', 'US'],
  ['canada', 'CA'], ['toronto', 'CA'], ['vancouver', 'CA'],
  ['australia', 'AU'], ['sydney', 'AU'], ['melbourne', 'AU'],
  ['india', 'IN'], ['bangalore', 'IN'], ['mumbai', 'IN'],
  ['brazil', 'BR'], ['sao paulo', 'BR'],
  ['mexico', 'MX'], ['mexico city', 'MX'],
  ['japan', 'JP'], ['tokyo', 'JP'],
  ['turkey', 'TR'], ['istanbul', 'TR'], ['ankara', 'TR'],
  ['russia', 'RU'], ['moscow', 'RU'],
  ['south korea', 'KR'], ['korea', 'KR'], ['seoul', 'KR'],
  ['indonesia', 'ID'], ['jakarta', 'ID'],
  ['philippines', 'PH'], ['manila', 'PH'],
  ['thailand', 'TH'], ['bangkok', 'TH'],
  ['vietnam', 'VN'], ['ho chi minh', 'VN'], ['hanoi', 'VN'],
  ['malaysia', 'MY'], ['kuala lumpur', 'MY'],
  ['pakistan', 'PK'], ['karachi', 'PK'], ['lahore', 'PK'],
  ['egypt', 'EG'], ['cairo', 'EG'],
  ['saudi arabia', 'SA'], ['riyadh', 'SA'], ['jeddah', 'SA'],
  ['uae', 'AE'], ['dubai', 'AE'], ['abu dhabi', 'AE'],
  ['south africa', 'ZA'], ['johannesburg', 'ZA'], ['cape town', 'ZA'],
  ['colombia', 'CO'], ['bogota', 'CO'],
  ['argentina', 'AR'], ['buenos aires', 'AR'],
];

function detectMarket(location: string): string | null {
  const loc = (location || '').toLowerCase().trim();
  if (!loc) return null;

  // Direct match
  for (const [key, market] of LOCATION_ENTRIES) {
    if (loc.includes(key)) return market;
  }

  // Try last part (often "City, Country" format)
  const parts = loc.split(',').map(p => p.trim());
  for (const part of parts.reverse()) {
    for (const [key, market] of LOCATION_ENTRIES) {
      if (part.includes(key)) return market;
    }
  }

  return null;
}

function detectSector(title: string, tags: string[]): Sector {
  const text = `${title} ${tags.join(' ')}`.toLowerCase();

  if (/logist|warehouse|lager|driver|fahrer|transport|delivery|versand|shipping|postal/i.test(text))
    return 'LOGISTICS_TRANSPORTATION';
  if (/manufactur|produktion|factory|fabrik|assembly|fertigung|machine operator/i.test(text))
    return 'MANUFACTURING';
  if (/retail|verkauf|store|shop|kassier|cashier|filiall/i.test(text))
    return 'RETAIL';
  if (/construct|bau|carpenter|zimmerer|plumber|electrician|elektrik|maler|painter/i.test(text))
    return 'CONSTRUCTION';
  if (/food|beverage|cook|koch|küche|kitchen|restaurant|gastro|café|baker|bäcker/i.test(text))
    return 'FOOD_BEVERAGE';
  if (/hotel|hospitality|housekeep|rezeption|front desk|concierge/i.test(text))
    return 'HOSPITALITY';
  if (/clean|reinigung|facility|hausmeis|janitor|maintenance|instandhalt/i.test(text))
    return 'FACILITY_MANAGEMENT';
  if (/secur|sicherheit|wach|guard|schutz/i.test(text))
    return 'SECURITY';
  if (/health|pflege|nurse|kranken|hospital|clinic|klinik|altenpflege|care/i.test(text))
    return 'HEALTHCARE';
  if (/auto|kfz|mechanic|werkstatt|vehicle|fahrzeug/i.test(text))
    return 'AUTOMOTIVE';
  if (/agri|farm|landwirt|gärtner|garden/i.test(text))
    return 'AGRICULTURE';
  if (/metal|steel|stahl|schwei[ßs]|weld|schlosser/i.test(text))
    return 'METAL_STEEL';
  if (/chemi|pharma|labor|lab /i.test(text))
    return 'CHEMICALS';
  if (/textile|näh|sewing|fashion|schneider/i.test(text))
    return 'TEXTILE';
  if (/mining|bergbau|energy|energie|solar|wind/i.test(text))
    return 'MINING_ENERGY';
  if (/ecommerce|e-commerce|versand|fulfilment|packing|verpack/i.test(text))
    return 'ECOMMERCE_CARGO';
  if (/telecom|telko|netzwerk|network|cable|kabel/i.test(text))
    return 'TELECOM';

  return 'OTHER';
}

function md5(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

interface ArbeitNowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number; // unix timestamp
}

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  const marketCounts: Record<string, number> = {};

  console.log('🟠 Mavi Yaka — ArbeitNow Bulk Import');
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const url = `${API_BASE}?page=${page}`;
      const res = await fetch(url, {
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        console.log(`  Page ${page}: HTTP ${res.status}`);
        if (res.status === 429) {
          console.log('  Rate limited, waiting 60s...');
          await delay(60000);
          continue;
        }
        break;
      }

      const json = await res.json() as {
        data: ArbeitNowJob[];
        links: { next: string | null };
      };

      const jobs = json.data;
      if (!jobs || jobs.length === 0) {
        console.log(`  Page ${page}: No more jobs. Done.`);
        break;
      }

      totalFetched += jobs.length;

      for (const job of jobs) {
        try {
          const market = detectMarket(job.location);
          if (!market) {
            totalSkipped++;
            continue;
          }

          const sector = detectSector(job.title, job.tags || []);
          const externalId = `arbeitnow-${job.slug}`;
          const fingerprint = md5(`${job.title}|${job.company_name}|${market}`);

          // Check if already exists
          const existing = await prisma.jobListing.findFirst({
            where: {
              external_id: externalId,
            },
          });

          if (existing) {
            // Update last_seen
            await prisma.jobListing.update({
              where: { id: existing.id },
              data: { last_seen_at: new Date(), status: 'ACTIVE' },
            });
            totalSkipped++;
            continue;
          }

          // Also check fingerprint to avoid dupes
          const dupeCheck = await prisma.jobListing.findFirst({
            where: {
              fingerprint,
              country: market,
              status: 'ACTIVE',
            },
          });

          if (dupeCheck) {
            totalSkipped++;
            continue;
          }

          const workMode = job.remote ? 'REMOTE' : 'ONSITE';
          const jobType = (job.job_types || []).includes('Full Time')
            ? 'FULL_TIME'
            : (job.job_types || []).includes('Part Time')
              ? 'PART_TIME'
              : (job.job_types || []).includes('Contract')
                ? 'CONTRACT'
                : 'FULL_TIME';

          await prisma.jobListing.create({
            data: {
              title: job.title.substring(0, 500),
              company_name: job.company_name.substring(0, 200),
              country: market,
              city: job.location?.split(',')[0]?.trim()?.substring(0, 100) || null,
              url: job.url,
              description: job.description?.substring(0, 5000) || null,
              summary: job.description?.replace(/<[^>]*>/g, '')?.substring(0, 300) || null,
              sector,
              job_type: jobType,
              work_mode: workMode,
              source: 'ARBEITNOW',
              external_id: externalId,
              fingerprint,
              status: 'ACTIVE',
              last_seen_at: new Date(),
              posted_date: job.created_at ? new Date(job.created_at * 1000) : new Date(),
            },
          });

          totalInserted++;
          marketCounts[market] = (marketCounts[market] || 0) + 1;
        } catch (err: any) {
          if (err.code === 'P2002') {
            totalSkipped++;
          } else {
            totalErrors++;
          }
        }
      }

      console.log(`  Page ${page}: ${jobs.length} fetched, running total: +${totalInserted} inserted`);

      if (!json.links?.next) {
        console.log('  No more pages.');
        break;
      }

      await delay(REQUEST_DELAY_MS);
    } catch (err: any) {
      console.log(`  Page ${page} error: ${err.message}`);
      totalErrors++;
      if (totalErrors > 5) break;
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  console.log('\n📊 FINAL STATS');
  console.log(`  Fetched: ${totalFetched}`);
  console.log(`  Inserted: ${totalInserted}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Duration: ${elapsed}s`);

  if (Object.keys(marketCounts).length > 0) {
    console.log('\n  Per market:');
    for (const [m, c] of Object.entries(marketCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${m}: +${c}`);
    }
  }

  console.log(`  Finished: ${new Date().toISOString()}`);
  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
