import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.campaign.findMany({
    include: { brand: { select: { name: true } } },
    orderBy: [{ brandId: 'asc' }, { title: 'asc' }],
  });

  console.log(`Toplam: ${campaigns.length} kampanya\n`);

  // 1. Exact title duplicates within same brand
  console.log('=== AYNI MARKA - AYNI BASLIK ===');
  const byBrandTitle = new Map<string, typeof campaigns>();
  for (const c of campaigns) {
    const key = `${c.brandId}::${c.title.toLowerCase().trim()}`;
    if (!byBrandTitle.has(key)) byBrandTitle.set(key, []);
    byBrandTitle.get(key)!.push(c);
  }
  for (const [, dupes] of byBrandTitle) {
    if (dupes.length > 1) {
      console.log(`\n  [${dupes[0].brand?.name}] "${dupes[0].title.substring(0, 60)}" x${dupes.length}`);
      for (const d of dupes) {
        console.log(`    ID: ${d.id} | URL: ${d.sourceUrl.substring(0, 80)}`);
      }
    }
  }

  // 2. Same canonical URL within same brand
  console.log('\n\n=== AYNI MARKA - AYNI URL ===');
  const byBrandUrl = new Map<string, typeof campaigns>();
  for (const c of campaigns) {
    const key = `${c.brandId}::${c.canonicalUrl || c.sourceUrl}`;
    if (!byBrandUrl.has(key)) byBrandUrl.set(key, []);
    byBrandUrl.get(key)!.push(c);
  }
  for (const [, dupes] of byBrandUrl) {
    if (dupes.length > 1) {
      console.log(`\n  [${dupes[0].brand?.name}] URL: ${(dupes[0].canonicalUrl || dupes[0].sourceUrl).substring(0, 80)} x${dupes.length}`);
      for (const d of dupes) {
        console.log(`    ID: ${d.id} | "${d.title.substring(0, 60)}"`);
      }
    }
  }

  // 3. Similar titles within same brand (fuzzy - first 30 chars match)
  console.log('\n\n=== AYNI MARKA - BENZER BASLIK (ilk 30 karakter ayni) ===');
  const byBrandPrefix = new Map<string, typeof campaigns>();
  for (const c of campaigns) {
    const prefix = c.title.toLowerCase().trim().substring(0, 30);
    const key = `${c.brandId}::${prefix}`;
    if (!byBrandPrefix.has(key)) byBrandPrefix.set(key, []);
    byBrandPrefix.get(key)!.push(c);
  }
  for (const [, dupes] of byBrandPrefix) {
    if (dupes.length > 1) {
      // Skip if they're already exact matches (caught above)
      const titles = new Set(dupes.map(d => d.title.toLowerCase().trim()));
      if (titles.size > 1) {
        console.log(`\n  [${dupes[0].brand?.name}] Benzer basliklar:`);
        for (const d of dupes) {
          console.log(`    "${d.title.substring(0, 70)}" | URL: ${d.sourceUrl.substring(0, 60)}`);
        }
      }
    }
  }

  // 4. Overall stats
  console.log('\n\n=== MARKA BAZINDA KAMPANYA SAYILARI ===');
  const byBrand = new Map<string, number>();
  for (const c of campaigns) {
    const name = c.brand?.name || '?';
    byBrand.set(name, (byBrand.get(name) || 0) + 1);
  }
  const sorted = [...byBrand.entries()].sort((a, b) => b[1] - a[1]);
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
