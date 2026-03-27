/**
 * bulk-import-computrabajo.ts — Scrape blue-collar jobs from Computrabajo
 *
 * Computrabajo is Latin America's largest job board (200K+ listings).
 * Covers: MX, CO, AR, PE, CL, EC, VE + more.
 * No API available — HTML scraping required.
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-computrabajo.ts
 */

import { PrismaClient, Market, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();
const REQUEST_DELAY_MS = 3000;
const MAX_PAGES = 15; // per category per country

// ─── Country configs ──────────────────────────────────────────────

interface CountryConfig {
  domain: string;
  market: Market;
  name: string;
}

const COUNTRIES: CountryConfig[] = [
  { domain: 'mx.computrabajo.com', market: 'MX', name: 'Mexico' },
  { domain: 'co.computrabajo.com', market: 'CO', name: 'Colombia' },
  { domain: 'ar.computrabajo.com', market: 'AR', name: 'Argentina' },
  { domain: 'br.computrabajo.com', market: 'BR', name: 'Brazil' },
];

// Blue-collar job categories (Spanish URL slugs)
const CATEGORIES = [
  'trabajo-de-almacen',           // warehouse
  'trabajo-de-chofer',            // driver
  'trabajo-de-operador',          // operator
  'trabajo-de-obrero',            // laborer
  'trabajo-de-limpieza',          // cleaning
  'trabajo-de-seguridad',         // security
  'trabajo-de-construccion',      // construction
  'trabajo-de-mantenimiento',     // maintenance
  'trabajo-de-produccion',        // production
  'trabajo-de-electricista',      // electrician
  'trabajo-de-soldador',          // welder
  'trabajo-de-mecanico',          // mechanic
  'trabajo-de-mesero',            // waiter
  'trabajo-de-cocinero',          // cook
  'trabajo-de-cajero',            // cashier
  'trabajo-de-repartidor',        // delivery
  'trabajo-de-vendedor',          // salesperson
  'trabajo-de-empacador',         // packer
];

// ─── Sector detection ──────────────────────────────────────────────

function detectSector(title: string, category: string): Sector {
  const t = `${title} ${category}`.toLowerCase();

  if (/almacen|almacén|chofer|conductor|repartid|logist|transport|bodega|mensajer/i.test(t))
    return 'LOGISTICS_TRANSPORTATION';
  if (/operador|producci|manufactur|obrer|ensambl|maquinaria/i.test(t))
    return 'MANUFACTURING';
  if (/vendedor|cajero|tienda|comerci|mostrador/i.test(t))
    return 'RETAIL';
  if (/construcci|alba[ñn]il|pintor|carpinter|plomer|herrer/i.test(t))
    return 'CONSTRUCTION';
  if (/cociner|mesero|bartender|chef|restauran|panadero/i.test(t))
    return 'FOOD_BEVERAGE';
  if (/limpieza|intendencia|conserj|aseo/i.test(t))
    return 'FACILITY_MANAGEMENT';
  if (/seguridad|vigilant|custodi|guardia/i.test(t))
    return 'SECURITY';
  if (/enferm|hospital|cuid|auxiliar.*medic/i.test(t))
    return 'HEALTHCARE';
  if (/mecanic|automotriz|taller/i.test(t))
    return 'AUTOMOTIVE';
  if (/electricist|electromec/i.test(t))
    return 'METAL_STEEL';
  if (/soldad/i.test(t))
    return 'METAL_STEEL';
  if (/mantenimiento/i.test(t))
    return 'FACILITY_MANAGEMENT';
  if (/empacador|empaqu/i.test(t))
    return 'ECOMMERCE_CARGO';

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
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 200);
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&#xE9;/g, 'é').replace(/&#xF3;/g, 'ó').replace(/&#xED;/g, 'í')
    .replace(/&#xE1;/g, 'á').replace(/&#xFA;/g, 'ú').replace(/&#xF1;/g, 'ñ')
    .replace(/&#xC1;/g, 'Á').replace(/&#xC9;/g, 'É').replace(/&#xCD;/g, 'Í')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

// ─── Source cache ─────────────────────────────────────────────────

const sourceCache = new Map<string, { id: string; companyId: string }>();

async function getOrCreateSource(market: Market): Promise<{ id: string; companyId: string }> {
  const key = `ct-${market}`;
  if (sourceCache.has(key)) return sourceCache.get(key)!;

  let source = await prisma.crawlSource.findFirst({
    where: { market, name: { contains: 'Computrabajo' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Computrabajo', market },
      select: { id: true },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Computrabajo',
          slug: `computrabajo-${market.toLowerCase()}`,
          market,
          sector: 'OTHER',
          websiteUrl: 'https://www.computrabajo.com',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: `Computrabajo ${market} Blue-Collar Jobs`,
        type: 'JOB_PLATFORM',
        crawlMethod: 'HTML',
        market,
        companyId: company.id,
        seedUrls: [`https://${COUNTRIES.find(c => c.market === market)?.domain || 'www.computrabajo.com'}`],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceCache.set(key, source);
  return source;
}

// ─── HTML Parser ─────────────────────────────────────────────────

interface ParsedJob {
  title: string;
  company: string;
  location: string;
  url: string;
}

function parseJobListings(html: string, domain: string): ParsedJob[] {
  const jobs: ParsedJob[] = [];

  // Pattern 1: fs18 title pattern
  const titleRegex = /<a[^>]*href="(\/[^"]*oferta-de-trabajo[^"]*)"[^>]*class="[^"]*js-o-link[^"]*"[^>]*>\s*<p[^>]*class="[^"]*fs18[^"]*"[^>]*>([^<]+)<\/p>/g;
  let match;

  while ((match = titleRegex.exec(html)) !== null) {
    const url = `https://${domain}${match[1]}`;
    const title = decodeHtmlEntities(match[2].trim());

    // Try to find company and location nearby
    const afterMatch = html.substring(match.index, match.index + 500);
    const companyMatch = afterMatch.match(/class="[^"]*fc-company[^"]*"[^>]*>([^<]+)</);
    const locationMatch = afterMatch.match(/class="[^"]*fs13[^"]*text-ellipsis[^"]*"[^>]*>([^<]+)</);

    jobs.push({
      title,
      company: companyMatch ? decodeHtmlEntities(companyMatch[1].trim()) : 'Unknown',
      location: locationMatch ? decodeHtmlEntities(locationMatch[1].trim()) : '',
      url,
    });
  }

  // Pattern 2: Simpler title link pattern
  if (jobs.length === 0) {
    const simpleRegex = /<a[^>]*href="(\/[^"]*oferta[^"]*)"[^>]*>([^<]{10,100})<\/a>/g;
    while ((match = simpleRegex.exec(html)) !== null) {
      const url = `https://${domain}${match[1]}`;
      const title = decodeHtmlEntities(match[2].trim());
      if (title.length > 10 && !title.includes('Ver más')) {
        jobs.push({ title, company: 'Unknown', location: '', url });
      }
    }
  }

  return jobs;
}

// ─── Main ──────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();
  let totalFetched = 0;
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalNotBlueCollar = 0;
  let totalErrors = 0;
  const seenUrls = new Set<string>();
  const marketCounts: Record<string, number> = {};

  console.log('🌎 Mavi Yaka — Computrabajo LATAM Blue-Collar Import');
  console.log(`Countries: ${COUNTRIES.length}, Categories: ${CATEGORIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  for (const country of COUNTRIES) {
    let countryInserted = 0;

    for (const category of CATEGORIES) {
      for (let page = 1; page <= MAX_PAGES; page++) {
        try {
          const pageParam = page > 1 ? `?p=${page}` : '';
          const url = `https://${country.domain}/${category}${pageParam}`;

          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml',
              'Accept-Language': 'es-ES,es;q=0.9',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(15000),
          });

          if (!res.ok) {
            if (res.status === 403 || res.status === 429) {
              console.log(`  ${country.market}/${category} page ${page}: ${res.status}, backing off...`);
              await delay(10000);
            }
            break;
          }

          const html = await res.text();
          const jobs = parseJobListings(html, country.domain);

          if (jobs.length === 0) break;

          totalFetched += jobs.length;

          for (const job of jobs) {
            if (seenUrls.has(job.url)) { totalSkipped++; continue; }
            seenUrls.add(job.url);

            try {
              const source = await getOrCreateSource(country.market);
              const fingerprint = md5(`computrabajo|${job.url}`);

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

              // Blue-collar filter — reject white-collar jobs
              if (!isBlueCollar(job.title, null)) {
                totalNotBlueCollar++;
                continue;
              }

              const sector = detectSector(job.title, category);
              const titleSlug = slugify(`${job.title}-${job.company}`.substring(0, 150));

              await prisma.jobListing.create({
                data: {
                  title: job.title.substring(0, 500),
                  slug: titleSlug,
                  companyId: source.companyId,
                  sourceId: source.id,
                  sourceUrl: job.url,
                  country: country.market,
                  city: job.location?.split(',')[0]?.trim()?.substring(0, 100) || null,
                  sector,
                  jobType: 'FULL_TIME',
                  workMode: 'ON_SITE',
                  fingerprint,
                  status: 'ACTIVE',
                  lastSeenAt: new Date(),
                  postedDate: new Date(),
                },
              });

              totalInserted++;
              countryInserted++;
              marketCounts[country.market] = (marketCounts[country.market] || 0) + 1;
            } catch (err: any) {
              if (err.code === 'P2002') {
                totalSkipped++;
              } else {
                totalErrors++;
              }
            }
          }

          await delay(REQUEST_DELAY_MS);
        } catch (err: any) {
          if (err.message?.includes('timeout')) {
            await delay(5000);
          }
          totalErrors++;
          break;
        }
      }
    }

    console.log(`  ${country.name} (${country.market}): +${countryInserted} new`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);

  console.log('\n📊 FINAL STATS');
  console.log(`  Fetched: ${totalFetched}`);
  console.log(`  Inserted: ${totalInserted}`);
  console.log(`  Skipped/Dupes: ${totalSkipped}`);
  console.log(`  Not blue-collar: ${totalNotBlueCollar}`);
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
