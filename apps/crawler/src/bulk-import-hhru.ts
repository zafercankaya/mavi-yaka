/**
 * bulk-import-hhru.ts — Import blue-collar jobs from hh.ru (HeadHunter) API
 *
 * hh.ru is Russia's largest job board (800K+ listings).
 * API is 100% public, no auth required. JSON response.
 *
 * API docs: https://github.com/hhru/api
 * Endpoint: https://api.hh.ru/vacancies
 * - Free, no API key
 * - 100 per page max, 2000 results max per query
 * - Rate limit: generous but use delays
 *
 * Strategy: Multiple blue-collar keyword searches to maximize coverage
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-hhru.ts
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();
const PER_PAGE = 100;
const MAX_PAGES = 20; // 20 * 100 = 2000 per query (API limit)
const REQUEST_DELAY_MS = 1000;

// ─── Blue-collar search queries (Russian + English) ─────────────────

const SEARCH_QUERIES = [
  // Russian blue-collar keywords
  'грузчик',        // loader
  'водитель',       // driver
  'рабочий',        // worker
  'кладовщик',      // warehouse keeper
  'сварщик',        // welder
  'электрик',       // electrician
  'слесарь',        // mechanic/fitter
  'токарь',         // turner/lathe operator
  'монтажник',      // installer/assembler
  'разнорабочий',   // general laborer
  'курьер',         // courier
  'уборщик',        // cleaner
  'охранник',       // security guard
  'повар',          // cook
  'продавец',       // salesperson/retail
  'строитель',      // builder
  'маляр',          // painter
  'плотник',        // carpenter
  'каменщик',       // mason
  'оператор станка', // machine operator
  'упаковщик',      // packer
  'комплектовщик',  // order picker
  'фасовщик',       // packager
  'кассир',         // cashier
  'официант',       // waiter
  'мойщик',         // washer
  'дворник',        // janitor/yard sweeper
  'сантехник',      // plumber
  'штукатур',       // plasterer
  'бетонщик',       // concrete worker
];

// ─── Sector detection ──────────────────────────────────────────────

function detectSector(title: string): Sector {
  const t = title.toLowerCase();

  if (/водител|курьер|экспедитор|логист|склад|кладовщ|грузчик|комплект|упаковщ|фасовщ|перевоз/i.test(t))
    return 'LOGISTICS_TRANSPORTATION';
  if (/рабочий|оператор|станк|токар|слесар|монтажн|сборщик|наладчик|производств/i.test(t))
    return 'MANUFACTURING';
  if (/продавец|кассир|мерчанд|магазин|торгов/i.test(t))
    return 'RETAIL';
  if (/строител|камен|бетон|штукатур|маляр|плотник|монтаж.*строит|прораб|кровель/i.test(t))
    return 'CONSTRUCTION';
  if (/повар|кондитер|пекар|кухн|бармен|официант|пиццайол/i.test(t))
    return 'FOOD_BEVERAGE';
  if (/горничн|портье|админист.*гостин|отел/i.test(t))
    return 'HOSPITALITY';
  if (/уборщ|клинер|дворник|хозяйств/i.test(t))
    return 'FACILITY_MANAGEMENT';
  if (/охран|секьюрити|контрол.*доступ/i.test(t))
    return 'SECURITY';
  if (/медсестр|санитар|фельдшер|сидел/i.test(t))
    return 'HEALTHCARE';
  if (/автомехан|автослесар|шиномонт|автомой/i.test(t))
    return 'AUTOMOTIVE';
  if (/сварщ|электр|электромонт/i.test(t))
    return 'METAL_STEEL';
  if (/сантехник/i.test(t))
    return 'CONSTRUCTION';
  if (/швей|текстил|закройщ/i.test(t))
    return 'TEXTILE';
  if (/фермер|агроном|тракторист|садовод/i.test(t))
    return 'AGRICULTURE';

  return 'OTHER';
}

function md5(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

// ─── Source cache ─────────────────────────────────────────────────

let sourceData: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceData) return sourceData;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'RU', name: { contains: 'hh.ru' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'hh.ru (HeadHunter)', market: 'RU' },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'hh.ru (HeadHunter)',
          slug: 'hhru-headhunter-ru',
          market: 'RU',
          sector: 'OTHER',
          websiteUrl: 'https://hh.ru',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'hh.ru Blue-Collar Jobs',
        type: 'JOB_PLATFORM',
        crawlMethod: 'API',
        market: 'RU',
        companyId: company.id,
        seedUrls: ['https://api.hh.ru/vacancies'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceData = source;
  return source;
}

// ─── Main ──────────────────────────────────────────────────────────

interface HHVacancy {
  id: string;
  name: string;
  area: { id: string; name: string };
  employer: { id: string; name: string };
  salary: { from: number | null; to: number | null; currency: string } | null;
  published_at: string;
  alternate_url: string;
  type: { id: string; name: string };
  schedule: { id: string; name: string } | null;
  experience: { id: string; name: string } | null;
  snippet: { requirement: string | null; responsibility: string | null };
}

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalNotBlueCollar = 0;
  let totalErrors = 0;
  const seenIds = new Set<string>();

  console.log('🇷🇺 Mavi Yaka — hh.ru (HeadHunter) Blue-Collar Import');
  console.log(`Queries: ${SEARCH_QUERIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const source = await getOrCreateSource();

  for (const query of SEARCH_QUERIES) {
    let queryInserted = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      try {
        const params = new URLSearchParams({
          text: query,
          per_page: String(PER_PAGE),
          page: String(page),
          order_by: 'publication_time',
        });

        const url = `https://api.hh.ru/vacancies?${params}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'MaviYakaBot/1.0 (job-aggregator)' },
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          if (res.status === 429) {
            console.log(`  Rate limited on "${query}" page ${page}, waiting 30s...`);
            await delay(30000);
            continue;
          }
          break;
        }

        const json = await res.json() as {
          found: number;
          pages: number;
          items: HHVacancy[];
        };

        const items = json.items;
        if (!items || items.length === 0) break;

        totalFetched += items.length;

        for (const v of items) {
          if (seenIds.has(v.id)) { totalSkipped++; continue; }
          seenIds.add(v.id);

          try {
            const fingerprint = md5(`hhru|${v.id}`);

            const existing = await prisma.jobListing.findFirst({
              where: { fingerprint },
            });

            if (existing) {
              await prisma.jobListing.update({
                where: { id: existing.id },
                data: { lastSeenAt: new Date(), status: 'ACTIVE' },
              });
              totalSkipped++;
              continue;
            }

            const sector = detectSector(v.name);
            const titleSlug = slugify(`${v.name}-${v.employer.name}-${v.id}`);

            const description = [
              v.snippet?.requirement,
              v.snippet?.responsibility,
            ].filter(Boolean).join('\n').replace(/<[^>]*>/g, '').substring(0, 2000) || null;

            // Blue-collar filter — reject white-collar jobs
            if (!isBlueCollar(v.name, description)) {
              totalNotBlueCollar++;
              continue;
            }

            const scheduleMap: Record<string, string> = {
              fullDay: 'FULL_TIME',
              shift: 'FULL_TIME',
              flexible: 'PART_TIME',
              remote: 'FULL_TIME',
              flyInFlyOut: 'FULL_TIME',
            };
            const jobType = (v.schedule?.id && scheduleMap[v.schedule.id]) || 'FULL_TIME';
            const workMode = v.schedule?.id === 'remote' ? 'REMOTE' : 'ON_SITE';

            await prisma.jobListing.create({
              data: {
                title: v.name.substring(0, 500),
                slug: titleSlug,
                companyId: source.companyId,
                sourceId: source.id,
                sourceUrl: v.alternate_url,
                country: 'RU' as Market,
                city: v.area?.name?.substring(0, 100) || null,
                description,
                sector,
                jobType: jobType as any,
                workMode: workMode as any,
                salaryMin: v.salary?.from || null,
                salaryMax: v.salary?.to || null,
                salaryCurrency: v.salary?.currency || null,
                fingerprint,
                status: 'ACTIVE',
                lastSeenAt: new Date(),
                postedDate: v.published_at ? new Date(v.published_at) : new Date(),
              },
            });

            totalInserted++;
            queryInserted++;
          } catch (err: any) {
            if (err.code === 'P2002') {
              totalSkipped++;
            } else {
              totalErrors++;
            }
          }
        }

        if (page >= json.pages - 1) break;
        await delay(REQUEST_DELAY_MS);
      } catch (err: any) {
        console.log(`  "${query}" page ${page} error: ${err.message?.substring(0, 80)}`);
        totalErrors++;
        if (totalErrors > 50) break;
      }
    }

    console.log(`  "${query}": +${queryInserted} new`);
    await delay(500);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  console.log('\n📊 FINAL STATS');
  console.log(`  Queries: ${SEARCH_QUERIES.length}`);
  console.log(`  Fetched: ${totalFetched}`);
  console.log(`  Inserted: ${totalInserted}`);
  console.log(`  Skipped/Dupes: ${totalSkipped}`);
  console.log(`  Not blue-collar: ${totalNotBlueCollar}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log(`  Duration: ${elapsed}s`);
  console.log(`  Finished: ${new Date().toISOString()}`);

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
