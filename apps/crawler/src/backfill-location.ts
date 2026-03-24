/**
 * One-time backfill: Extract location from cvyolla-style titles and URLs
 * for existing job listings that have NULL city/state.
 *
 * Usage: npx ts-node --transpile-only src/backfill-location.ts [--apply]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Turkish provinces (81 il) — lowercase for matching
const TR_PROVINCES = new Set([
  'adana', 'adıyaman', 'afyonkarahisar', 'ağrı', 'aksaray', 'amasya', 'ankara', 'antalya', 'ardahan',
  'artvin', 'aydın', 'balıkesir', 'bartın', 'batman', 'bayburt', 'bilecik', 'bingöl', 'bitlis',
  'bolu', 'burdur', 'bursa', 'çanakkale', 'çankırı', 'çorum', 'denizli', 'diyarbakır', 'düzce',
  'edirne', 'elazığ', 'erzincan', 'erzurum', 'eskişehir', 'gaziantep', 'giresun', 'gümüşhane',
  'hakkari', 'hatay', 'ığdır', 'isparta', 'istanbul', 'izmir', 'kahramanmaraş', 'karabük',
  'karaman', 'kars', 'kastamonu', 'kayseri', 'kırıkkale', 'kırklareli', 'kırşehir', 'kilis',
  'kocaeli', 'konya', 'kütahya', 'malatya', 'manisa', 'mardin', 'mersin', 'muğla', 'muş',
  'nevşehir', 'niğde', 'ordu', 'osmaniye', 'rize', 'sakarya', 'samsun', 'şanlıurfa', 'siirt',
  'sinop', 'sivas', 'şırnak', 'tekirdağ', 'tokat', 'trabzon', 'tunceli', 'uşak', 'van',
  'yalova', 'yozgat', 'zonguldak',
]);

function toAscii(s: string): string {
  return s.replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/İ/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a')
    .replace(/Ç/g, 'c').replace(/Ğ/g, 'g').replace(/Ö/g, 'o').replace(/Ş/g, 's')
    .replace(/Ü/g, 'u').replace(/Â/g, 'a').replace(/ê/g, 'e').toLowerCase();
}

const TR_PROVINCES_ASCII = new Map<string, string>();
for (const p of TR_PROVINCES) {
  TR_PROVINCES_ASCII.set(toAscii(p), p);
}

function extractLocationFromTitle(title: string): { city: string | null; state: string | null } | null {
  const dashParts = title.split(/\s*-\s*/);
  if (dashParts.length < 4) return null;

  for (let i = 1; i < dashParts.length - 1; i++) {
    const candidate = dashParts[i].trim().toLowerCase();
    const candidateAscii = toAscii(candidate);
    const matchedProvince = TR_PROVINCES_ASCII.get(candidateAscii) || (TR_PROVINCES.has(candidate) ? candidate : null);
    if (matchedProvince) {
      const properName = dashParts[i].trim();
      const ilce = dashParts[i + 1]?.trim();
      if (ilce && ilce.length < 30 && !ilce.toLowerCase().includes('iş ilanı') && !ilce.toLowerCase().includes('is ilani')) {
        return { state: properName, city: ilce };
      }
      return { state: properName, city: null };
    }
  }
  return null;
}

function extractLocationFromUrl(url: string): { city: string | null; state: string | null } | null {
  if (!url.includes('cvyolla.com')) return null;
  const slugMatch = url.match(/cvyolla\.com\/\d+-(.+)/);
  if (!slugMatch) return null;

  const slug = slugMatch[1].replace(/-is-ilani$/, '');
  const parts = slug.split('-');

  for (let i = 0; i < parts.length - 1; i++) {
    const matchedProvince = TR_PROVINCES_ASCII.get(parts[i]);
    if (matchedProvince) {
      const ilceParts: string[] = [];
      for (let j = i + 1; j < parts.length; j++) {
        if (TR_PROVINCES_ASCII.has(parts[j])) break;
        ilceParts.push(parts[j]);
        if (ilceParts.length >= 3) break;
      }
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      return {
        state: capitalize(matchedProvince),
        city: ilceParts.length > 0 ? ilceParts.map(capitalize).join(' ') : null,
      };
    }
  }
  return null;
}

async function main() {
  const dryRun = !process.argv.includes('--apply');
  console.log(`\n=== Backfill Location from Title/URL (${dryRun ? 'DRY RUN' : 'APPLYING'}) ===\n`);

  // Get all TR active jobs with no location
  const jobs = await prisma.jobListing.findMany({
    where: {
      country: 'TR',
      status: 'ACTIVE',
      city: null,
      state: null,
    },
    select: { id: true, title: true, sourceUrl: true },
  });

  console.log(`Found ${jobs.length} TR active jobs with no location\n`);

  let extracted = 0;
  const results: { title: string; state: string | null; city: string | null }[] = [];

  for (const job of jobs) {
    // Try title first
    let loc = extractLocationFromTitle(job.title);
    // Then URL
    if (!loc) loc = extractLocationFromUrl(job.sourceUrl);

    if (loc) {
      extracted++;
      results.push({ title: job.title.substring(0, 60), ...loc });

      if (!dryRun) {
        await prisma.jobListing.update({
          where: { id: job.id },
          data: { state: loc.state, city: loc.city },
        });
      }
    }
  }

  console.log(`\n--- Results ---`);
  for (const r of results) {
    console.log(`  ${r.state || '?'} / ${r.city || '?'} ← "${r.title}"`);
  }
  console.log(`\nExtracted location for ${extracted}/${jobs.length} jobs`);
  if (dryRun) console.log(`\nRun with --apply to save changes`);

  await prisma.$disconnect();
}

main().catch(console.error);
