import './config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  const companyName = process.argv[2] || 'Anadolu Hayat';
  const company = await p.company.findFirst({ where: { name: { contains: companyName } } });
  if (!company) { console.log('Company not found:', companyName); await p.$disconnect(); return; }

  console.log(`Company: ${company.name} | logoUrl: ${company.logoUrl || 'NULL'}`);

  const listings = await p.jobListing.findMany({
    where: { companyId: company.id, status: 'ACTIVE' },
    select: { title: true, imageUrl: true, deadline: true },
  });

  for (const c of listings) {
    const img = c.imageUrl ? c.imageUrl.substring(0, 80) : '(none)';
    const dates = `${c.deadline ? 'D' : '-'}`;
    console.log(`  [${dates}] ${c.title.substring(0, 50)} | ${img}`);
  }

  await p.$disconnect();
}

main().catch(async (e) => { console.error(e); await p.$disconnect(); });
