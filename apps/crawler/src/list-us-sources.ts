import './config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  // Count US sources by category
  const sources = await p.crawlSource.findMany({
    where: { market: 'US', isActive: true },
    include: { 
      brand: { 
        select: { name: true, category: { select: { name: true, nameEn: true, slug: true } } } 
      } 
    },
    orderBy: { brand: { category: { slug: 'asc' } } },
  });

  // Group by category
  const byCategory: Record<string, { slug: string; nameEn: string | null; brands: string[] }> = {};
  for (const s of sources) {
    const catSlug = s.brand.category?.slug || 'uncategorized';
    const catName = s.brand.category?.name || 'Uncategorized';
    const catNameEn = s.brand.category?.nameEn || null;
    if (!byCategory[catSlug]) {
      byCategory[catSlug] = { slug: catSlug, nameEn: catNameEn, brands: [] };
    }
    byCategory[catSlug].brands.push(s.brand.name);
  }

  console.log(`\n=== US Crawl Sources: ${sources.length} total ===\n`);
  
  const sortedCategories = Object.entries(byCategory).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [slug, data] of sortedCategories) {
    console.log(`\n📁 ${slug} (${data.nameEn || slug}) — ${data.brands.length} brands:`);
    data.brands.sort().forEach(b => console.log(`   - ${b}`));
  }

  console.log(`\n\nTotal: ${sources.length} US sources across ${Object.keys(byCategory).length} categories`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
