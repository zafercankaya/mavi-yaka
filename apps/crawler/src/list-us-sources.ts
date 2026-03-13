import './config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  // Count US sources by sector
  const sources = await p.crawlSource.findMany({
    where: { market: 'US', isActive: true },
    include: {
      company: {
        select: { name: true, sector: true }
      }
    },
    orderBy: { company: { name: 'asc' } },
  });

  // Group by sector
  const bySector: Record<string, { companies: string[] }> = {};
  for (const s of sources) {
    const sectorKey = s.company.sector || 'OTHER';
    if (!bySector[sectorKey]) {
      bySector[sectorKey] = { companies: [] };
    }
    bySector[sectorKey].companies.push(s.company.name);
  }

  console.log(`\n=== US Crawl Sources: ${sources.length} total ===\n`);

  const sortedSectors = Object.entries(bySector).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [sector, data] of sortedSectors) {
    console.log(`\n${sector} — ${data.companies.length} companies:`);
    data.companies.sort().forEach(b => console.log(`   - ${b}`));
  }

  console.log(`\n\nTotal: ${sources.length} US sources across ${Object.keys(bySector).length} sectors`);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
