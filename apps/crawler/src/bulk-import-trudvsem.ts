/**
 * bulk-import-trudvsem.ts — Bulk Import from Russian Trudvsem.ru (Open Data API)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-trudvsem.ts
 *
 * API: https://opendata.trudvsem.ru/api/v1/vacancies
 * - No authentication required (open data)
 * - Max 100 results per page, offset-based pagination
 * - ~457K total vacancies available (all sectors)
 * - Rich data: salary, geo-coordinates, company INN/OGRN
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const API_BASE = 'https://opendata.trudvsem.ru/api/v1/vacancies';
const RESULTS_PER_PAGE = 100; // API max
const MAX_OFFSET = 5000; // 50 pages per keyword
const REQUEST_DELAY_MS = 500; // Respectful crawling
const REQUEST_TIMEOUT_MS = 30_000;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/[çć]/g, 'c').replace(/[şś]/g, 's').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Sector detection (Russian) ──────────────────────────────────────

function detectSector(title: string, desc?: string): Sector {
  const t = `${title} ${desc || ''}`.toLowerCase();
  if (/склад|грузчик|логист|водитель|шофер|курьер|экспедитор|транспорт|перевоз|доставк|кладовщик|комплектовщик|упаков/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/произв|завод|станок|слесарь|токарь|фрезеровщик|сборщик|оператор.*линии|оператор.*станк|монтажник|наладчик/i.test(t)) return 'MANUFACTURING';
  if (/магазин|касс|продавец|торгов|розни|мерчендайзер|кладовщик.*магаз/i.test(t)) return 'RETAIL';
  if (/строи|камен|штукатур|бетон|каменщик|маляр|плитк|отделоч|кровел|монолит|плотник|столяр|стекольщик/i.test(t)) return 'CONSTRUCTION';
  if (/повар|кухон|пекарь|кондитер|мясник|официант|бармен|шеф.*повар|кулинар|буфетч/i.test(t)) return 'FOOD_BEVERAGE';
  if (/автомех|автослесарь|автомобил|шиномонт|кузовн|моторист|диагност.*авто/i.test(t)) return 'AUTOMOTIVE';
  if (/швея|портн|текстил|закройщик/i.test(t)) return 'TEXTILE';
  if (/горн|энерг|электр.*станц|нефт|газ|буров|шахт/i.test(t)) return 'MINING_ENERGY';
  if (/санитар|медсестр|сиделк|больниц|клиник|медицин.*персонал/i.test(t)) return 'HEALTHCARE';
  if (/гостиниц|уборщ|горничн|стир|прачечн|хозяйств|клинер|химчист/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/сельск|ферм|агро|садовн|тракторист|животновод|доярк|механизатор|комбайнер/i.test(t)) return 'AGRICULTURE';
  if (/охран|сторож|вахтер|безопасност|секьюрити|ЧОП/i.test(t)) return 'SECURITY_SERVICES';
  if (/дворник|уборщи|сантехн|техник.*здан|обслужив.*здан|коммунальн/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/свар|металл|литей|кузне|жестян|термист|гальван|прокат/i.test(t)) return 'METAL_STEEL';
  if (/хими|пластмасс|резин|фармацевт|лаборант.*хим/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/телеком|связист|кабельщ|монтажник.*связ/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Russian blue-collar search queries ──────────────────────────────

const SEARCH_QUERIES = [
  // Warehouse & Logistics
  'грузчик', 'кладовщик', 'комплектовщик', 'упаковщик', 'сортировщик',
  'водитель', 'водитель категории C', 'водитель погрузчика', 'экспедитор', 'курьер',
  'оператор склада', 'приемщик товара',
  // Cleaning & Facility
  'уборщик', 'уборщица', 'дворник', 'сантехник', 'разнорабочий',
  'подсобный рабочий', 'техник здания', 'электрик',
  // Gastronomy & Food
  'повар', 'кухонный работник', 'посудомойщик', 'пекарь', 'кондитер',
  'официант', 'бармен', 'мясник', 'буфетчик', 'шеф-повар',
  // Construction
  'каменщик', 'штукатур', 'маляр', 'плиточник', 'бетонщик',
  'кровельщик', 'монолитчик', 'плотник', 'столяр', 'стекольщик',
  'строитель', 'отделочник', 'фасадчик', 'монтажник',
  // Manufacturing & Production
  'оператор станка', 'токарь', 'фрезеровщик', 'слесарь', 'сборщик',
  'наладчик', 'оператор производственной линии', 'контролер ОТК',
  'прессовщик', 'шлифовщик',
  // Automotive & Mechanic
  'автослесарь', 'автомеханик', 'шиномонтажник', 'кузовной мастер',
  'автоэлектрик', 'диагност',
  // Welding & Metalwork
  'сварщик', 'газосварщик', 'металлург', 'литейщик', 'кузнец',
  'жестянщик', 'термист', 'гальваник',
  // Textile
  'швея', 'портной', 'закройщик', 'вязальщик',
  // Security
  'охранник', 'сторож', 'вахтер', 'контролер КПП',
  // Healthcare support
  'санитар', 'санитарка', 'сиделка', 'медсестра',
  // Hotel & Hospitality
  'горничная', 'администратор гостиницы', 'прачечная',
  // Agriculture
  'тракторист', 'механизатор', 'животновод', 'доярка', 'агроном',
  'садовник', 'овощевод', 'комбайнер',
  // Energy & Mining
  'шахтер', 'горняк', 'буровик', 'электромонтер',
  // Telecom
  'кабельщик', 'монтажник связи',
  // E-commerce & Delivery
  'курьер доставки', 'сборщик заказов', 'оператор пункта выдачи',
];

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'RU', name: { contains: 'Trudvsem' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: { contains: 'Trudvsem' }, market: 'RU' },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `trudvsem-gov-ru-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'Trudvsem (Работа в России)',
          slug: uniqueSlug,
          market: 'RU',
          sector: 'OTHER',
          websiteUrl: 'https://trudvsem.ru',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'Trudvsem Government Job Listings',
        type: 'GOVERNMENT',
        crawlMethod: 'API',
        market: 'RU',
        companyId: company.id,
        seedUrls: ['https://opendata.trudvsem.ru/api/v1/vacancies'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── API fetch ───────────────────────────────────────────────────────

async function fetchJobs(query: string, offset: number): Promise<any> {
  const url = `${API_BASE}?text=${encodeURIComponent(query)}&limit=${RESULTS_PER_PAGE}&offset=${offset}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Main import ─────────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  skipped: number;
  errors: number;
}

async function main() {
  console.log(`\n🇷🇺 Mavi Yaka — Trudvsem.ru Bulk Import`);
  console.log(`Queries: ${SEARCH_QUERIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  const seen = new Set<string>();
  let batch: any[] = [];

  for (const query of SEARCH_QUERIES) {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchJobs(query, offset);
        const total = data?.meta?.total || 0;
        const vacancies = data?.results?.vacancies || [];

        stats.fetched += vacancies.length;

        for (const item of vacancies) {
          const vac = item.vacancy || item;
          const vacId = vac.id || '';
          if (!vacId || seen.has(vacId)) { stats.skipped++; continue; }
          seen.add(vacId);

          const title = vac['job-name'] || query;
          const companyName = vac.company?.name || '';
          const duty = vac.duty || '';
          const requirements = vac.requirements || vac.requirement?.qualification || '';

          // Source URL
          const sourceUrl = vac.vac_url || `https://trudvsem.ru/vacancy/card/${vacId}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`trudvsem:${vacId}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          // Location
          const region = vac.region || {};
          const addresses = vac.addresses?.address || [];
          const addr = addresses[0] || {};
          const city = addr.location || null;
          const state = region.name || null;
          const lat = addr.lat ? parseFloat(addr.lat) : null;
          const lon = addr.lng ? parseFloat(addr.lng) : null;

          // Salary
          const salaryMin = vac.salary_min ? Number(vac.salary_min) : null;
          const salaryMax = vac.salary_max ? Number(vac.salary_max) : null;

          // Full title with company
          const fullTitle = companyName ? `${title} — ${companyName}` : title;

          // Blue-collar filter
          const searchText = `${title} ${duty} ${requirements}`;
          if (!isBlueCollar(searchText, null)) {
            stats.skipped++;
            continue;
          }

          // Posted date
          const postedDate = vac['creation-date']
            ? new Date(vac['creation-date']) : null;

          // Description
          const descParts: string[] = [];
          if (duty) descParts.push(duty);
          if (requirements) descParts.push(`Требования: ${requirements}`);
          if (companyName) descParts.push(`Работодатель: ${companyName}`);
          if (city || state) descParts.push(`Место: ${city || ''}, ${state || ''}`);
          if (vac.schedule) descParts.push(`График: ${vac.schedule}`);

          batch.push({
            title: fullTitle.substring(0, 500),
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: 'RU' as Market,
            city: city?.substring(0, 200) || null,
            state: state?.substring(0, 200) || null,
            latitude: lat,
            longitude: lon,
            salaryMin,
            salaryMax,
            salaryCurrency: (salaryMin || salaryMax) ? 'RUB' : null,
            salaryPeriod: (salaryMin || salaryMax) ? 'MONTHLY' : null,
            sector: detectSector(title, duty),
            description: descParts.join('\n\n').substring(0, 5000) || null,
            postedDate,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 500) {
            const result = await flushBatch(batch);
            stats.inserted += result;
            batch = [];
          }
        }

        hasMore = vacancies.length === RESULTS_PER_PAGE && offset < MAX_OFFSET;
        offset += RESULTS_PER_PAGE;

        await delay(REQUEST_DELAY_MS);

        if (vacancies.length > 0 && offset === RESULTS_PER_PAGE) {
          console.log(`  "${query}": ${total.toLocaleString()} total, fetching...`);
        }
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          console.warn(`  Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  "${query}" offset=${offset}: ${msg.substring(0, 100)}`);
          stats.errors++;
          hasMore = false;
        }
      }
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result;
  }

  await prisma.$disconnect();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Unique: ${seen.size.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
  console.log(`  Skipped: ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

async function flushBatch(batch: any[]): Promise<number> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  const result = await flushBatchUpsert(prisma, batch);
  return result.inserted;
}

main().catch(console.error);
