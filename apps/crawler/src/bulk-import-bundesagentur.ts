/**
 * bulk-import-bundesagentur.ts — Bulk Import from German Bundesagentur für Arbeit
 *
 * Usage: npx ts-node --transpile-only src/bulk-import-bundesagentur.ts
 *
 * API: https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs
 * - Auth: X-API-Key header with value "jobboerse-jobsuche" (public)
 * - ~274K blue-collar relevant jobs
 * - Pagination: page (1-based), size (max 100?)
 */

import { PrismaClient, Market, JobStatus, Sector } from '@prisma/client';
import { createHash } from 'crypto';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const API_BASE = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs';
const API_KEY = 'jobboerse-jobsuche';
const RESULTS_PER_PAGE = 100;
const MAX_PAGES = 25; // Limit to 25 pages per keyword to prevent DB inflation (was 10)
const MAX_TOTAL_LISTINGS = 50_000; // Hard cap on total listings per import run (was 15_000)
const REQUEST_DELAY_MS = 300;
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
    .replace(/[äàáâãå]/g, 'a').replace(/[öòóôõø]/g, 'o').replace(/[üùúû]/g, 'u')
    .replace(/[ëèéê]/g, 'e').replace(/[ïìíî]/g, 'i').replace(/ß/g, 'ss')
    .replace(/ñ/g, 'n').replace(/[çć]/g, 'c').replace(/[şś]/g, 's').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80);
}

// ─── Sector detection (German) ──────────────────────────────────────

function detectSector(title: string, employer?: string): Sector {
  const t = `${title} ${employer || ''}`.toLowerCase();
  if (/lager|transport|logistik|fahrer|chauffeur|kurier|paketzustell|spedition|versand|kommission/i.test(t)) return 'LOGISTICS_TRANSPORTATION';
  if (/produktion|fertigung|fabrik|maschine|montage|industrie|cnc|dreh|fräs/i.test(t)) return 'MANUFACTURING';
  if (/verkäuf|kasse|handel|einzelhandel|filial|supermarkt|markt|discounter/i.test(t)) return 'RETAIL';
  if (/bau|maurer|zimmer|dachdecker|estrich|beton|tiefbau|straßen|gerüst|fliesen|maler|trockenbau/i.test(t)) return 'CONSTRUCTION';
  if (/koch|küche|restaurant|bäcker|fleischer|metzger|kellner|service.*kraft|gastronomie|konditor/i.test(t)) return 'FOOD_BEVERAGE';
  if (/kfz|mechaniker|werkstatt|karosserie|lackier|autoh/i.test(t)) return 'AUTOMOTIVE';
  if (/textil|näh|schneid|polster/i.test(t)) return 'TEXTILE';
  if (/berg|energie|strom|solar|wind|kraft.*werk/i.test(t)) return 'MINING_ENERGY';
  if (/pflege|kranken|alten|klinik|hospital|gesundheit|betreuung/i.test(t)) return 'HEALTHCARE';
  if (/hotel|reinigung|hauswirtschaft|wäscherei|rezeption|housekeeping/i.test(t)) return 'HOSPITALITY_TOURISM';
  if (/garten|landwirtschaft|forst|landschaft|agrar|tierpflege/i.test(t)) return 'AGRICULTURE';
  if (/sicherheit|wach|schutz|bewach|pförtner/i.test(t)) return 'SECURITY_SERVICES';
  if (/gebäude|reinig|hausmeist|facility|vaktmäst|renhåll|müll|entsorg/i.test(t)) return 'FACILITY_MANAGEMENT';
  if (/metall|stahl|schweiß|schmiede|schlosser|gieß|blech|werkzeug/i.test(t)) return 'METAL_STEEL';
  if (/chemi|pharma|kunststoff|gummi|lack|labor/i.test(t)) return 'CHEMICALS_PLASTICS';
  if (/telekom|kabel|glasfaser|netz.*technik|fernmelde/i.test(t)) return 'TELECOMMUNICATIONS';
  return 'OTHER';
}

// ─── German blue-collar search queries ───────────────────────────────

const SEARCH_QUERIES = [
  // Lager & Logistik
  'Lagerarbeiter', 'Lagerhelfer', 'Staplerfahrer', 'Kommissionierer', 'Lkw Fahrer',
  'Berufskraftfahrer', 'Paketzusteller', 'Kurierfahrer', 'Versandmitarbeiter',
  // Reinigung & Gebäude
  'Reinigungskraft', 'Gebäudereiniger', 'Hausmeister', 'Raumpfleger',
  // Gastronomie & Hotel
  'Koch', 'Küchenhilfe', 'Spülkraft', 'Kellner', 'Servicekraft', 'Bäcker',
  'Konditor', 'Fleischer', 'Metzger', 'Barkeeper',
  // Bau & Handwerk
  'Bauhelfer', 'Bauarbeiter', 'Maurer', 'Zimmermann', 'Zimmerer', 'Dachdecker', 'Maler Lackierer',
  'Fliesenleger', 'Estrichleger', 'Trockenbauer', 'Gerüstbauer', 'Betonbauer',
  'Straßenbauer', 'Tiefbau', 'Tiefbauer', 'Hochbau', 'Rohrleger', 'Isolierer', 'Glaser',
  'Klempner',
  // Produktion & Maschine
  'Produktionsmitarbeiter', 'Produktionshelfer', 'Maschinenführer', 'Maschinenbediener',
  'Montierer', 'Verpackungsmitarbeiter', 'Fertigungsmitarbeiter',
  // Metall & Schweißen
  'Schweißer', 'Schlosser', 'Metallbauer', 'Zerspanungsmechaniker',
  'Industriemechaniker', 'Werkzeugmechaniker', 'Dreher', 'Fräser',
  'CNC Dreher', 'CNC Fräser',
  // Elektro & Technik
  'Elektriker', 'Elektroniker', 'Elektroinstallateur', 'Mechatroniker',
  'Anlagenmechaniker', 'Kältetechniker', 'Kälteanlagenbauer', 'Heizungsmonteur', 'Sanitär Monteur',
  'Aufzugmonteur',
  // KFZ & Mechanik
  'Kfz Mechatroniker', 'Kfz Mechaniker', 'Fahrzeuglackierer', 'Karosseriebauer',
  // Pflege & Betreuung
  'Pflegehelfer', 'Altenpflegehelfer', 'Krankenpflegehelfer', 'Betreuungskraft',
  // Garten & Landwirtschaft
  'Gärtner', 'Landschaftsgärtner', 'Landwirtschaftshelfer', 'Forstarbeiter', 'Tierpfleger',
  'Landmaschinenmechaniker', 'Winzer',
  // Gastronomie Ergänzung
  'Bäckereiverkäufer',
  // Sicherheit & Sonstige
  'Sicherheitsmitarbeiter', 'Wachmann', 'Pförtner', 'Busfahrer', 'Müllwerker',
  'Briefträger', 'Straßenreiniger', 'Haustechniker', 'Schädlingsbekämpfer',
  // Hafen & Schwerlast
  'Hafenarbeiter', 'Kranführer', 'Baggerführer',
];

// ─── Source lookup/creation ──────────────────────────────────────────

let sourceInfo: { id: string; companyId: string } | null = null;

async function getOrCreateSource(): Promise<{ id: string; companyId: string }> {
  if (sourceInfo) return sourceInfo;

  let source = await prisma.crawlSource.findFirst({
    where: { market: 'DE', name: { contains: 'Bundesagentur' }, isActive: true },
    select: { id: true, companyId: true },
  });

  if (!source) {
    let company = await prisma.company.findFirst({
      where: { name: 'Bundesagentur für Arbeit', market: 'DE' },
      select: { id: true },
    });

    if (!company) {
      const uniqueSlug = `bundesagentur-fur-arbeit-gov-de-${Date.now().toString(36)}`;
      company = await prisma.company.create({
        data: {
          name: 'Bundesagentur für Arbeit',
          slug: uniqueSlug,
          market: 'DE',
          sector: 'OTHER',
          websiteUrl: 'https://www.arbeitsagentur.de',
        },
      });
    }

    const created = await prisma.crawlSource.create({
      data: {
        name: 'Bundesagentur für Arbeit Job Listings',
        type: 'GOVERNMENT',
        crawlMethod: 'API',
        market: 'DE',
        companyId: company.id,
        seedUrls: ['https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs'],
        isActive: true,
      },
    });
    source = { id: created.id, companyId: created.companyId };
  }

  sourceInfo = source;
  return source;
}

// ─── API fetch ───────────────────────────────────────────────────────

async function fetchJobs(query: string, page: number): Promise<any> {
  const params = new URLSearchParams({
    was: query,
    size: String(RESULTS_PER_PAGE),
    page: String(page),
    angebotsart: '1', // 1 = work (not training/internship)
  });

  const url = `${API_BASE}?${params.toString()}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        'X-API-Key': API_KEY,
        'Accept': 'application/json',
      },
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
  console.log(`\n🇩🇪 Mavi Yaka — Bundesagentur für Arbeit Bulk Import`);
  console.log(`Queries: ${SEARCH_QUERIES.length}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const stats: ImportStats = { fetched: 0, inserted: 0, skipped: 0, errors: 0 };
  const source = await getOrCreateSource();
  const seen = new Set<string>(); // refnr dedup
  const seenTitles = new Map<string, number>(); // base title dedup (max 2 per title)
  const MAX_PER_TITLE = 2;
  let batch: any[] = [];
  let totalAccepted = 0;

  for (const query of SEARCH_QUERIES) {
    if (totalAccepted >= MAX_TOTAL_LISTINGS) {
      console.log(`  Hard cap reached (${MAX_TOTAL_LISTINGS.toLocaleString()}), stopping.`);
      break;
    }

    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const data = await fetchJobs(query, page);
        const totalAvailable = data.maxErgebnisse || 0;
        const jobs = data.stellenangebote || [];

        stats.fetched += jobs.length;

        for (const job of jobs) {
          const refnr = job.refnr || '';
          if (!refnr || seen.has(refnr)) { stats.skipped++; continue; }
          seen.add(refnr);

          const title = job.titel || query;
          const employer = job.arbeitgeber || '';
          const sourceUrl = job.externeUrl || `https://www.arbeitsagentur.de/jobsuche/suche?was=${encodeURIComponent(title)}&id=${refnr}`;
          const canonicalUrl = sourceUrl.split('?')[0].split('#')[0].toLowerCase();
          const fingerprint = md5(`ba:${refnr}`);
          const slug = `${slugify(title)}-${Date.now().toString(36)}${Math.random().toString(36).substring(2, 5)}`;

          // Location
          const ort = job.arbeitsort || {};
          const city = ort.ort || null;
          const state = ort.region || null;
          const lat = ort.koordinaten?.lat || null;
          const lon = ort.koordinaten?.lon || null;

          // Full title with employer
          const fullTitle = employer ? `${title} — ${employer}` : title;

          // Blue-collar filter
          const occupation = job.beruf || '';
          const searchText = `${title} ${occupation}`;
          if (!isBlueCollar(searchText, null)) {
            stats.skipped++;
            continue;
          }

          // Title dedup: max N per base title (without employer)
          const baseTitle = title.toLowerCase().replace(/\s*\(m\/w\/d\)\s*/g, '').trim();
          const titleCount = seenTitles.get(baseTitle) || 0;
          if (titleCount >= MAX_PER_TITLE) {
            stats.skipped++;
            continue;
          }
          seenTitles.set(baseTitle, titleCount + 1);
          totalAccepted++;

          // Hard cap check
          if (totalAccepted >= MAX_TOTAL_LISTINGS) {
            hasMore = false;
          }

          // Posted date
          const postedDate = job.aktuelleVeroeffentlichungsdatum
            ? new Date(job.aktuelleVeroeffentlichungsdatum) : null;

          batch.push({
            title: fullTitle.substring(0, 500),
            slug,
            sourceUrl,
            canonicalUrl,
            fingerprint,
            companyId: source.companyId,
            sourceId: source.id,
            country: 'DE' as Market,
            city,
            state,
            latitude: lat,
            longitude: lon,
            sector: detectSector(title, employer),
            description: `${occupation}\n\nArbeitgeber: ${employer}\nOrt: ${city || ''}, ${state || ''}`.substring(0, 5000) || null,
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

        hasMore = jobs.length === RESULTS_PER_PAGE && page < MAX_PAGES;
        page++;

        await delay(REQUEST_DELAY_MS);

        if (jobs.length > 0 && page === 2) {
          console.log(`  "${query}": ${totalAvailable.toLocaleString()} total, fetching...`);
        }
      } catch (e) {
        const msg = (e as Error).message;
        if (msg.includes('429')) {
          console.warn(`  Rate limited, waiting 60s...`);
          await delay(60_000);
        } else {
          console.warn(`  "${query}" p${page}: ${msg.substring(0, 100)}`);
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
