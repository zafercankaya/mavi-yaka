import './config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const brandName = process.argv[2] || 'Anadolu Hayat';
  const brand = await p.brand.findFirst({ where: { name: { contains: brandName } } });
  if (!brand) { console.log('Brand not found:', brandName); await p.$disconnect(); return; }

  console.log(`Brand: ${brand.name} | logoUrl: ${brand.logoUrl || 'NULL'}`);

  const campaigns = await p.campaign.findMany({
    where: { brandId: brand.id, status: 'ACTIVE' },
    select: { title: true, imageUrls: true, startDate: true, endDate: true },
  });

  for (const c of campaigns) {
    const imgs = c.imageUrls.length > 0 ? c.imageUrls[0].substring(0, 80) : '(none)';
    const dates = `${c.startDate ? 'S' : '-'}/${c.endDate ? 'E' : '-'}`;
    console.log(`  [${dates}] ${c.title.substring(0, 50)} | ${imgs}`);
  }

  await p.$disconnect();
}

main().catch(async (e) => { console.error(e); await p.$disconnect(); });
