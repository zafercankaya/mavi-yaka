import './config';
import { PrismaClient } from '@prisma/client';

const companyName = process.argv[2] || 'Fiat';
const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.jobListing.findMany({
    where: { company: { name: { contains: companyName, mode: 'insensitive' } } },
    select: { id: true, title: true, imageUrl: true, status: true },
    orderBy: { updatedAt: 'desc' },
    take: 15,
  });

  console.log(`Found ${listings.length} ${companyName} job listings:\n`);
  for (const c of listings) {
    console.log(`[${c.status}] ${c.title.substring(0, 60)}`);
    if (c.imageUrl) {
      console.log(`  IMG: ${c.imageUrl.substring(0, 110)}`);
    } else {
      console.log(`  IMG: (yok)`);
    }
    console.log();
  }
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
