import './config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const categorySlug = process.argv[2] || 'kitap-hobi';
  
  const sources = await p.crawlSource.findMany({
    where: { market: 'US', isActive: true, brand: { category: { slug: categorySlug } } },
    include: { brand: { select: { name: true } } },
    orderBy: { brand: { name: 'asc' } },
  });

  console.log(`\n=== US Sources in ${categorySlug}: ${sources.length} ===\n`);
  
  for (const s of sources) {
    console.log(`${s.brand.name}:`);
    console.log(`  method: ${s.crawlMethod}, maxDepth: ${s.maxDepth}`);
    console.log(`  URLs: ${s.seedUrls.join(', ')}`);
    if (s.discoveredFeedUrl) console.log(`  feed: ${s.discoveredFeedUrl}`);
    if (s.discoveredApiUrl) console.log(`  api: ${s.discoveredApiUrl}`);
    console.log('');
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
