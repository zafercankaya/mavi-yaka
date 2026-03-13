import './config';
import { PrismaClient } from '@prisma/client';

const brandName = process.argv[2] || 'Fiat';
const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.campaign.findMany({
    where: { brand: { name: { contains: brandName, mode: 'insensitive' } } },
    select: { id: true, title: true, imageUrls: true, status: true },
    orderBy: { updatedAt: 'desc' },
    take: 15,
  });

  console.log(`Found ${campaigns.length} ${brandName} campaigns:\n`);
  for (const c of campaigns) {
    const imgs = c.imageUrls as string[];
    console.log(`[${c.status}] ${c.title.substring(0, 60)}`);
    if (imgs.length > 0) {
      for (const u of imgs) console.log(`  IMG: ${u.substring(0, 110)}`);
    } else {
      console.log(`  IMG: (yok)`);
    }
    console.log();
  }
  await prisma.$disconnect();
}
main().catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
