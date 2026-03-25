/**
 * bulk-import-gov-apis.ts — Bulk Import from Government Job APIs
 *
 * Fetches ALL blue-collar job listings from government APIs with full pagination.
 * Target: 400K+ from Bundesagentur (DE) + 50K+ from JobTech (SE) + Trudvsem (RU)
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-gov-apis.ts [market]
 * Example: npx ts-node --transpile-only src/bulk-import-gov-apis.ts DE
 *          npx ts-node --transpile-only src/bulk-import-gov-apis.ts ALL
 */

import { PrismaClient, Market, JobStatus, Sector, SourceType } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// ─── Config ───────────────────────────────────────────────────────────

const PAGE_SIZE = 100;
const REQUEST_DELAY_MS = 300;  // Be polite
const REQUEST_TIMEOUT_MS = 20_000;

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function md5(s: string): string {
  return createHash('md5').update(s).digest('hex');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äàáâã]/g, 'a').replace(/[öòóôõ]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/ç/g, 'c').replace(/ş/g, 's').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

async function fetchJson(url: string, headers: Record<string, string> = {}): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(url, { headers, signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Sector detection (simplified) ───────────────────────────────────

function detectSector(title: string, description?: string): Sector {
  const t = `${title} ${description || ''}`.toLowerCase();
  if (/lager|warehouse|logist|kommission|versand|spedition|kuri|pakete|post|zustellung/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/produktion|fertigung|manufactur|fabrik|montage|assembly|industrie/i.test(t)) return 'MANUFACTURING';
  if (/verkäuf|retail|kasse|filial|markt|supermarkt|einzelhandel|mağaza|perakende/i.test(t)) return 'RETAIL';
  if (/bau|construction|maurer|dachdeck|zimmerer|betonmisch|gerüstbau|tiefbau|straßenbau/i.test(t)) return 'CONSTRUCTION';
  if (/koch|küche|gastro|restaurant|bäck|fleisch|metzg|food|catering|kellner|küchenhilfe/i.test(t)) return 'FOOD_BEVERAGE';
  if (/kfz|auto|motor|fahrzeug|werkstatt|lackier|karosserie|automotive/i.test(t)) return 'AUTOMOTIVE';
  if (/näh|textil|schneid|textile|konfektio/i.test(t)) return 'TEXTILE';
  if (/bergbau|mining|energy|energi|solar|wind|strom|gas/i.test(t)) return 'MINING_ENERGY';
  if (/pflege|kranken|klinik|health|hospital|altenpflege|arzt/i.test(t)) return 'HEALTHCARE';
  if (/hotel|gastgew|tourismus|zimmer|housekeep|hospitality|rezeption/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/landwirt|agrar|gärtn|agriculture|farm|ernte|forstwirt/i.test(t)) return 'AGRICULTURE';
  if (/sicherheit|security|wachschutz|objekt.*schutz|pförtner/i.test(t)) return 'SECURITY_SERVICES';
  if (/gebäude|facility|hausmeis|reinigungs|cleaning|janitor|caretaker/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metall|stahl|schweiß|schlosser|dreh|fräs|cnc|zerspanun|gieß/i.test(t)) return 'METAL_STEEL';
  if (/chemi|pharma|labor|kunststoff|gummi|lacki|farb/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/e-commerce|versandhandel|online.*shop|paket.*dienst/i.test(t)) return 'ECOMMERCE_CARGO';
  if (/telekom|netzwerk|kabel|glasfaser|antennen/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── Stats tracking ──────────────────────────────────────────────────

interface ImportStats {
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

// ─── DE: Bundesagentur für Arbeit ────────────────────────────────────

const DE_BLUE_COLLAR_KEYWORDS = [
  'Helfer', 'Lagerist', 'Lagerarbeiter', 'Berufskraftfahrer', 'Fahrer',
  'Gabelstapler', 'Reinigungskraft', 'Produktionsmitarbeiter', 'Koch',
  'Industriemechaniker', 'Zerspanungsmechaniker', 'Maler', 'Lackierer',
  'Elektriker', 'Mechaniker', 'Schweisser', 'Schlosser', 'Fleischer',
  'Kommissionierer', 'Servicetechniker', 'Monteur', 'Dachdecker',
  'Klempner', 'Schreiner', 'Maurer', 'Zimmerer', 'Sicherheitsmitarbeiter',
  'Gebäudereiniger', 'Bauarbeiter', 'Handwerker', 'Gärtner',
  'Bäcker', 'Kellner', 'Küchenhilfe', 'Packer', 'Sortierer',
  'Staplerfahrer', 'Busfahrer', 'Taxifahrer', 'Altenpfleger',
  'Krankenpfleger', 'Hausmeister', 'Installateur', 'Anlagenmechaniker',
  'Elektroniker', 'Mechatroniker', 'Fachkraft Lagerlogistik',
  'Produktionshelfer', 'Maschinenführer', 'Verpackungsmitarbeiter',
];

async function importDE(stats: ImportStats): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[DE] Starting Bundesagentur bulk import...`);
  console.log(`Keywords: ${DE_BLUE_COLLAR_KEYWORDS.length}`);

  // Find or create the government source for DE
  const govSource = await prisma.crawlSource.findFirst({
    where: { market: 'DE', type: 'GOVERNMENT' as SourceType, isActive: true },
  });
  if (!govSource) {
    console.error('[DE] No active government source found!');
    return;
  }

  const seen = new Set<string>();
  const batchSize = 1000;
  let batch: any[] = [];

  for (const keyword of DE_BLUE_COLLAR_KEYWORDS) {
    let page = 1;
    let hasMore = true;
    let kwFetched = 0;

    while (hasMore) {
      try {
        const url = `https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?was=${encodeURIComponent(keyword)}&size=${PAGE_SIZE}&page=${page}`;
        const data = await fetchJson(url, { 'X-API-Key': 'jobboerse-jobsuche' });

        const jobs = data.stellenangebote || [];
        stats.fetched += jobs.length;
        kwFetched += jobs.length;

        for (const job of jobs) {
          const ref = job.refnr || job.hashId;
          if (!ref || seen.has(ref)) { stats.skipped++; continue; }
          seen.add(ref);

          const title = job.titel || keyword;
          const sourceUrl = job.externeUrl || `https://www.arbeitsagentur.de/jobsuche/suche?id=${ref}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`${govSource.id}:${canonicalUrl}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          const city = job.arbeitsort?.ort || null;
          const state = job.arbeitsort?.region || null;
          const lat = job.arbeitsort?.koordinaten?.lat || null;
          const lon = job.arbeitsort?.koordinaten?.lon || null;
          const sector = detectSector(title, job.beruf);

          batch.push({
            title,
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: govSource.companyId,
            sourceId: govSource.id,
            country: 'DE' as Market,
            city,
            state,
            latitude: lat,
            longitude: lon,
            sector,
            description: job.beruf || null,
            postedDate: job.aktuelleVeroeffentlichungsdatum ? new Date(job.aktuelleVeroeffentlichungsdatum) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          // Flush batch
          if (batch.length >= batchSize) {
            const result = await flushBatch(batch);
            stats.inserted += result.inserted;
            stats.updated += result.updated;
            batch = [];
          }
        }

        // Check if more pages
        const totalResults = data.maxErgebnisse || 0;
        const fetchedSoFar = page * PAGE_SIZE;
        hasMore = jobs.length === PAGE_SIZE && fetchedSoFar < totalResults && fetchedSoFar < 10000; // API limit ~10K per query
        page++;

        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        console.warn(`[DE] "${keyword}" page ${page} error: ${(e as Error).message}`);
        stats.errors++;
        hasMore = false;
      }
    }

    if (kwFetched > 0) {
      process.stdout.write(`  ${keyword}: ${kwFetched} fetched (${seen.size} unique total)\r`);
    }
  }

  // Flush remaining
  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result.inserted;
    stats.updated += result.updated;
  }

  console.log(`\n[DE] Done: ${seen.size} unique jobs, ${stats.inserted} inserted, ${stats.updated} updated`);
}

// ─── SE: JobTech/Platsbanken ─────────────────────────────────────────

const SE_BLUE_COLLAR_KEYWORDS = [
  'lagerarbetare', 'svetsare', 'lastbilschaufför', 'städare', 'byggnadsarbetare',
  'elektriker', 'mekaniker', 'kock', 'montör', 'maskinförare',
  'truckförare', 'chaufför', 'bagare', 'slaktare', 'målare',
  'snickare', 'murare', 'rörmokare', 'takläggare', 'plåtslagare',
  'lokalvårdare', 'vaktmästare', 'brevbärare', 'grovarbetare',
  'anläggningsarbetare', 'industriarbetare', 'produktionsmedarbetare',
  'plocka och packa', 'diskare', 'köksbiträde', 'bartender',
  'fastighetsskötare', 'trädgårdsarbetare', 'väktare', 'ordningsvakt',
];

async function importSE(stats: ImportStats): Promise<void> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[SE] Starting JobTech/Platsbanken bulk import...`);

  const govSource = await prisma.crawlSource.findFirst({
    where: { market: 'SE', type: 'GOVERNMENT' as SourceType, isActive: true },
  });
  if (!govSource) { console.error('[SE] No gov source!'); return; }

  const seen = new Set<string>();
  let batch: any[] = [];

  for (const keyword of SE_BLUE_COLLAR_KEYWORDS) {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      try {
        const url = `https://jobsearch.api.jobtechdev.se/search?q=${encodeURIComponent(keyword)}&limit=${PAGE_SIZE}&offset=${offset}`;
        const data = await fetchJson(url, { accept: 'application/json' });

        const hits = data.hits || [];
        stats.fetched += hits.length;

        for (const hit of hits) {
          const id = String(hit.id);
          if (seen.has(id)) { stats.skipped++; continue; }
          seen.add(id);

          const title = hit.headline || keyword;
          const sourceUrl = hit.webpage_url || `https://arbetsformedlingen.se/platsbanken/annonser/${id}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`${govSource.id}:${canonicalUrl}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          batch.push({
            title,
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: govSource.companyId,
            sourceId: govSource.id,
            country: 'SE' as Market,
            city: hit.workplace_address?.municipality || null,
            state: hit.workplace_address?.region || null,
            latitude: hit.workplace_address?.coordinates?.[1] || null,
            longitude: hit.workplace_address?.coordinates?.[0] || null,
            sector: detectSector(title, hit.description?.text),
            description: hit.description?.text?.substring(0, 5000) || null,
            postedDate: hit.publication_date ? new Date(hit.publication_date) : null,
            deadline: hit.application_deadline ? new Date(hit.application_deadline) : null,
            lastSeenAt: new Date(),
            status: 'ACTIVE' as JobStatus,
          });

          if (batch.length >= 1000) {
            const result = await flushBatch(batch);
            stats.inserted += result.inserted;
            stats.updated += result.updated;
            batch = [];
          }
        }

        const total = data.total?.value || 0;
        hasMore = hits.length === PAGE_SIZE && (offset + PAGE_SIZE) < Math.min(total, 2000); // SE API max offset 2000
        offset += PAGE_SIZE;
        await delay(REQUEST_DELAY_MS);
      } catch (e) {
        console.warn(`[SE] "${keyword}" offset ${offset} error: ${(e as Error).message}`);
        stats.errors++;
        hasMore = false;
      }
    }

    process.stdout.write(`  ${keyword}: ${seen.size} unique total\r`);
  }

  if (batch.length > 0) {
    const result = await flushBatch(batch);
    stats.inserted += result.inserted;
    stats.updated += result.updated;
  }

  console.log(`\n[SE] Done: ${seen.size} unique jobs, ${stats.inserted} inserted, ${stats.updated} updated`);
}

// ─── Batch upsert logic ──────────────────────────────────────────────

async function flushBatch(batch: any[]): Promise<{ inserted: number; updated: number }> {
  const { flushBatchUpsert } = await import('./utils/flush-batch-upsert');
  return flushBatchUpsert(prisma, batch);
}

// ─── Main ────────────────────────────────────────────────────────────

async function main() {
  const market = (process.argv[2] || 'ALL').toUpperCase();

  console.log(`\n🔵 Mavi Yaka — Bulk Government API Import`);
  console.log(`Target: ${market}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, updated: 0, skipped: 0, errors: 0 };

  try {
    if (market === 'ALL' || market === 'DE') await importDE(stats);
    if (market === 'ALL' || market === 'SE') await importSE(stats);
    // RU skipped for now — API is unreliable
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 FINAL STATS`);
  console.log(`  Fetched: ${stats.fetched.toLocaleString()}`);
  console.log(`  Inserted: ${stats.inserted.toLocaleString()}`);
  console.log(`  Updated: ${stats.updated.toLocaleString()}`);
  console.log(`  Skipped (dupes): ${stats.skipped.toLocaleString()}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Finished: ${new Date().toISOString()}`);
}

main().catch(console.error);
