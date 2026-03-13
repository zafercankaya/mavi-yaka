/**
 * Backfill promo codes for existing ACTIVE campaigns.
 * Applies extractPromoCode() to title + description of all campaigns
 * that currently have promo_code = NULL.
 *
 * Usage:
 *   npx tsx src/backfill-promo-codes.ts          # dry-run (count only)
 *   npx tsx src/backfill-promo-codes.ts --apply   # actually update DB
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { extractPromoCode } from './pipeline/normalize';

const BATCH_SIZE = 1000;
const applyMode = process.argv.includes('--apply');

async function main() {
  const prisma = new PrismaClient();

  console.log(`\n=== Promo Code Backfill ${applyMode ? '(APPLY MODE)' : '(DRY RUN)'} ===\n`);

  const totalActive = await prisma.campaign.count({
    where: { status: 'ACTIVE', promoCode: null },
  });
  console.log(`Total ACTIVE campaigns without promo code: ${totalActive}\n`);

  const marketStats: Record<string, { found: number; total: number }> = {};
  let totalFound = 0;
  let offset = 0;

  while (true) {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'ACTIVE', promoCode: null },
      select: { id: true, title: true, description: true, market: true },
      orderBy: { createdAt: 'desc' },
      take: BATCH_SIZE,
      skip: offset,
    });

    if (campaigns.length === 0) break;

    for (const c of campaigns) {
      const market = c.market || 'TR';
      if (!marketStats[market]) marketStats[market] = { found: 0, total: 0 };
      marketStats[market].total++;

      const code = extractPromoCode(c.title, c.description);
      if (code) {
        totalFound++;
        marketStats[market].found++;
        console.log(`  [${market}] "${c.title.substring(0, 50)}" → ${code}`);

        if (applyMode) {
          await prisma.campaign.update({
            where: { id: c.id },
            data: { promoCode: code },
          });
        }
      }
    }

    offset += campaigns.length;
    process.stdout.write(`  Processed ${offset}/${totalActive}...\r`);
  }

  console.log(`\n\n=== Results ===`);
  console.log(`Total scanned: ${offset}`);
  console.log(`Total promo codes found: ${totalFound} (${((totalFound / Math.max(offset, 1)) * 100).toFixed(1)}%)\n`);

  console.log('Market breakdown:');
  const sorted = Object.entries(marketStats).sort((a, b) => b[1].found - a[1].found);
  for (const [market, stats] of sorted) {
    if (stats.found > 0) {
      console.log(`  ${market}: ${stats.found}/${stats.total} campaigns (${((stats.found / stats.total) * 100).toFixed(1)}%)`);
    }
  }

  if (!applyMode && totalFound > 0) {
    console.log(`\nRun with --apply to update these ${totalFound} campaigns in DB.`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
