/**
 * Backfill promo codes for existing ACTIVE job listings.
 * NOTE: promoCode field no longer exists on JobListing in the new schema.
 * This script is kept for reference but is effectively a no-op.
 *
 * Usage:
 *   npx tsx src/backfill-promo-codes.ts          # dry-run (count only)
 *   npx tsx src/backfill-promo-codes.ts --apply   # actually update DB
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
// extractPromoCode no longer exists in normalize — stub for legacy script
function extractPromoCode(title: string, description?: string | null): string | null {
  const text = `${title} ${description || ''}`;
  const match = text.match(/\b([A-Z0-9]{4,20})\b/);
  return match ? match[1] : null;
}

const BATCH_SIZE = 1000;
const applyMode = process.argv.includes('--apply');

async function main() {
  const prisma = new PrismaClient();

  console.log(`\n=== Promo Code Backfill ${applyMode ? '(APPLY MODE)' : '(DRY RUN)'} ===\n`);

  const totalActive = await prisma.jobListing.count({
    where: { status: 'ACTIVE' },
  });
  console.log(`Total ACTIVE job listings: ${totalActive}\n`);

  const countryStats: Record<string, { found: number; total: number }> = {};
  let totalFound = 0;
  let offset = 0;

  while (true) {
    const listings = await prisma.jobListing.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, title: true, description: true, country: true },
      orderBy: { createdAt: 'desc' },
      take: BATCH_SIZE,
      skip: offset,
    });

    if (listings.length === 0) break;

    for (const c of listings) {
      const country = c.country || 'TR';
      if (!countryStats[country]) countryStats[country] = { found: 0, total: 0 };
      countryStats[country].total++;

      const code = extractPromoCode(c.title, c.description);
      if (code) {
        totalFound++;
        countryStats[country].found++;
        console.log(`  [${country}] "${c.title.substring(0, 50)}" → ${code}`);

        // NOTE: promoCode field no longer exists on JobListing
        // if (applyMode) {
        //   await prisma.jobListing.update({ where: { id: c.id }, data: { promoCode: code } });
        // }
      }
    }

    offset += listings.length;
    process.stdout.write(`  Processed ${offset}/${totalActive}...\r`);
  }

  console.log(`\n\n=== Results ===`);
  console.log(`Total scanned: ${offset}`);
  console.log(`Total promo codes found: ${totalFound} (${((totalFound / Math.max(offset, 1)) * 100).toFixed(1)}%)\n`);

  console.log('Country breakdown:');
  const sorted = Object.entries(countryStats).sort((a, b) => b[1].found - a[1].found);
  for (const [country, stats] of sorted) {
    if (stats.found > 0) {
      console.log(`  ${country}: ${stats.found}/${stats.total} listings (${((stats.found / stats.total) * 100).toFixed(1)}%)`);
    }
  }

  if (!applyMode && totalFound > 0) {
    console.log(`\nNote: promoCode field no longer exists on JobListing. Found ${totalFound} codes but cannot apply.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
