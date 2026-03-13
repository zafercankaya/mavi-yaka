import './config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const categorySlug = process.argv[2] || 'kitap-hobi';

  const sources = await p.crawlSource.findMany({
    where: { market: 'US', isActive: true, company: { sector: categorySlug as any } },
    include: { company: { select: { name: true } } },
    orderBy: { company: { name: 'asc' } },
  });

  console.log(`\n=== US Sources in ${categorySlug}: ${sources.length} ===\n`);

  for (const s of sources) {
    console.log(`${s.company.name}:`);
    console.log(`  method: ${s.crawlMethod}, maxDepth: ${s.maxDepth}`);
    console.log(`  URLs: ${s.seedUrls.join(', ')}`);
    console.log('');
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
