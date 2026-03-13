import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.jobListing.findMany({
    include: { company: { select: { name: true } } },
    orderBy: [{ companyId: 'asc' }, { title: 'asc' }],
  });

  console.log(`Toplam: ${listings.length} ilan\n`);

  // 1. Exact title duplicates within same company
  console.log('=== AYNI SIRKET - AYNI BASLIK ===');
  const byCompanyTitle = new Map<string, typeof listings>();
  for (const c of listings) {
    const key = `${c.companyId}::${c.title.toLowerCase().trim()}`;
    if (!byCompanyTitle.has(key)) byCompanyTitle.set(key, []);
    byCompanyTitle.get(key)!.push(c);
  }
  for (const [, dupes] of byCompanyTitle) {
    if (dupes.length > 1) {
      console.log(`\n  [${dupes[0].company?.name}] "${dupes[0].title.substring(0, 60)}" x${dupes.length}`);
      for (const d of dupes) {
        console.log(`    ID: ${d.id} | URL: ${d.sourceUrl.substring(0, 80)}`);
      }
    }
  }

  // 2. Same canonical URL within same company
  console.log('\n\n=== AYNI SIRKET - AYNI URL ===');
  const byCompanyUrl = new Map<string, typeof listings>();
  for (const c of listings) {
    const key = `${c.companyId}::${c.canonicalUrl || c.sourceUrl}`;
    if (!byCompanyUrl.has(key)) byCompanyUrl.set(key, []);
    byCompanyUrl.get(key)!.push(c);
  }
  for (const [, dupes] of byCompanyUrl) {
    if (dupes.length > 1) {
      console.log(`\n  [${dupes[0].company?.name}] URL: ${(dupes[0].canonicalUrl || dupes[0].sourceUrl).substring(0, 80)} x${dupes.length}`);
      for (const d of dupes) {
        console.log(`    ID: ${d.id} | "${d.title.substring(0, 60)}"`);
      }
    }
  }

  // 3. Similar titles within same company (fuzzy - first 30 chars match)
  console.log('\n\n=== AYNI SIRKET - BENZER BASLIK (ilk 30 karakter ayni) ===');
  const byCompanyPrefix = new Map<string, typeof listings>();
  for (const c of listings) {
    const prefix = c.title.toLowerCase().trim().substring(0, 30);
    const key = `${c.companyId}::${prefix}`;
    if (!byCompanyPrefix.has(key)) byCompanyPrefix.set(key, []);
    byCompanyPrefix.get(key)!.push(c);
  }
  for (const [, dupes] of byCompanyPrefix) {
    if (dupes.length > 1) {
      // Skip if they're already exact matches (caught above)
      const titles = new Set(dupes.map(d => d.title.toLowerCase().trim()));
      if (titles.size > 1) {
        console.log(`\n  [${dupes[0].company?.name}] Benzer basliklar:`);
        for (const d of dupes) {
          console.log(`    "${d.title.substring(0, 70)}" | URL: ${d.sourceUrl.substring(0, 60)}`);
        }
      }
    }
  }

  // 4. Overall stats
  console.log('\n\n=== SIRKET BAZINDA ILAN SAYILARI ===');
  const byCompany = new Map<string, number>();
  for (const c of listings) {
    const name = c.company?.name || '?';
    byCompany.set(name, (byCompany.get(name) || 0) + 1);
  }
  const sorted = [...byCompany.entries()].sort((a, b) => b[1] - a[1]);
  for (const [name, count] of sorted) {
    console.log(`  ${name}: ${count}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
