import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find duplicates by title + brandId
  const dupes: any[] = await prisma.$queryRaw`
    SELECT title, brand_id as "brandId", COUNT(*) as cnt
    FROM campaigns
    WHERE status = 'ACTIVE'
    GROUP BY title, brand_id
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 30
  `;

  console.log(`Found ${dupes.length} duplicate groups:\n`);
  for (const d of dupes) {
    console.log(`  ${d.cnt}x | ${d.title.substring(0, 70)}`);
  }

  // Clean duplicates: keep oldest, delete newer ones
  if (dupes.length > 0) {
    let totalDeleted = 0;

    for (const d of dupes) {
      const campaigns = await prisma.campaign.findMany({
        where: { title: d.title, brandId: d.brandId, status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' },
        select: { id: true, createdAt: true },
      });

      // Keep first (oldest), delete rest
      const toDelete = campaigns.slice(1).map((c) => c.id);
      if (toDelete.length > 0) {
        await prisma.campaign.deleteMany({
          where: { id: { in: toDelete } },
        });
        totalDeleted += toDelete.length;
      }
    }

    console.log(`\nDeleted ${totalDeleted} duplicate campaigns.`);
  }

  // Also check total campaigns
  const total = await prisma.campaign.count({ where: { status: 'ACTIVE' } });
  console.log(`\nTotal active campaigns: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
