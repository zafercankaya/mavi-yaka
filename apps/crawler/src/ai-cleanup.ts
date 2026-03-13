/**
 * One-time script: Run all existing DB job listings through Gemini AI.
 * - isCampaign=false + confidence >= 0.7 → DELETE
 * - isCampaign=true → UPDATE missing endDate/startDate/discountRate
 *
 * Usage: npx ts-node src/ai-cleanup.ts [--dry-run]
 */
import './config';
import { PrismaClient } from '@prisma/client';
import { classifyAndEnrich } from './utils/ai-client';

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes('--dry-run');

interface Stats {
  total: number;
  processed: number;
  deleted: number;
  updated: number;
  unchanged: number;
  errors: number;
}

async function main() {
  console.log(`=== AI Job Listing Cleanup ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  const jobListings = await prisma.jobListing.findMany({
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const stats: Stats = {
    total: jobListings.length,
    processed: 0,
    deleted: 0,
    updated: 0,
    unchanged: 0,
    errors: 0,
  };

  console.log(`Found ${stats.total} job listings to process.\n`);

  for (const jobListing of jobListings) {
    stats.processed++;
    const prefix = `[${stats.processed}/${stats.total}]`;
    const companyName = jobListing.company?.name || 'Unknown';
    const shortTitle = jobListing.title.substring(0, 55);

    try {
      const result = await classifyAndEnrich(
        jobListing.title,
        jobListing.description,
        jobListing.sourceUrl || '',
        companyName,
      );

      // AI unavailable / fallback — skip
      if (result.confidence <= 0.5) {
        console.log(`${prefix} SKIP (AI fallback): "${shortTitle}"`);
        stats.unchanged++;
        continue;
      }

      // NOT a valid listing → delete
      if (!result.isCampaign && result.confidence >= 0.7) {
        console.log(`${prefix} DELETE (${result.confidence.toFixed(2)}): "${shortTitle}" — ${result.reason}`);
        if (!DRY_RUN) {
          await prisma.jobListing.delete({ where: { id: jobListing.id } });
        }
        stats.deleted++;
        continue;
      }

      // IS a valid listing → check for enrichment updates
      if (result.isCampaign) {
        const updates: Record<string, any> = {};

        if (result.endDate && !jobListing.deadline) {
          updates.deadline = new Date(result.endDate);
        }

        if (Object.keys(updates).length > 0) {
          const updateDesc = Object.entries(updates)
            .map(([k, v]) => `${k}=${v instanceof Date ? v.toISOString().split('T')[0] : v}`)
            .join(', ');
          console.log(`${prefix} UPDATE (${result.confidence.toFixed(2)}): "${shortTitle}" → ${updateDesc}`);
          if (!DRY_RUN) {
            await prisma.jobListing.update({ where: { id: jobListing.id }, data: updates });
          }
          stats.updated++;
        } else {
          console.log(`${prefix} OK (${result.confidence.toFixed(2)}): "${shortTitle}"`);
          stats.unchanged++;
        }
      }
    } catch (err) {
      console.error(`${prefix} ERROR: "${shortTitle}" — ${(err as Error).message}`);
      stats.errors++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`  Total:     ${stats.total}`);
  console.log(`  Deleted:   ${stats.deleted}`);
  console.log(`  Updated:   ${stats.updated}`);
  console.log(`  Unchanged: ${stats.unchanged}`);
  console.log(`  Errors:    ${stats.errors}`);
  if (DRY_RUN) console.log('\n  (DRY RUN — no changes were made)');

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
