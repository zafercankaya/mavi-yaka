import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sources = await prisma.crawlSource.findMany({
    where: { isActive: true },
    include: { brand: { select: { name: true, categoryId: true } } },
    take: 15,
    orderBy: { createdAt: 'asc' },
  });

  for (const s of sources) {
    console.log(`${s.brand.name} | ${s.seedUrls[0]} | cat: ${s.brand.categoryId ? 'YES' : 'NO'}`);
  }

  const total = await prisma.crawlSource.count({ where: { isActive: true } });
  console.log(`\nTotal active sources: ${total}`);
  console.log(`Campaigns: ${await prisma.campaign.count()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
