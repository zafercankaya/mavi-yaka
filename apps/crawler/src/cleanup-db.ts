/**
 * Cleanup script: re-evaluate all existing job listings against the improved quality filter.
 * Listings that fail are deleted from DB.
 */
import { PrismaClient } from '@prisma/client';
import { normalizeJobListing, RawJobData } from './pipeline/normalize';
import { filterJobListings } from './pipeline/quality-filter';

// scoreListing is no longer exported; use filterJobListings wrapper
function scoreListing(normalized: any, companyName?: string) {
  const { passed, rejected } = filterJobListings([normalized], companyName);
  if (passed.length > 0) {
    return { passed: true, score: 3, reasons: ['passed-filter'], hardRejected: null };
  }
  return { passed: false, score: 0, reasons: ['rejected'], hardRejected: 'quality-filter' };
}

const prisma = new PrismaClient();

async function main() {
  const listings = await prisma.jobListing.findMany({
    include: {
      company: { select: { name: true } },
      source: { select: { name: true } },
    },
  });

  console.log(`\n=== ILAN TEMIZLIGI ===`);
  console.log(`Toplam ilan: ${listings.length}\n`);

  const toDelete: { id: string; title: string; company: string; reason: string }[] = [];
  const toKeep: { id: string; title: string; company: string; score: number }[] = [];

  for (const c of listings) {
    // Re-create a normalized listing from DB data for quality scoring
    const raw: RawJobData = {
      title: c.title,
      description: c.description || undefined,
      sourceUrl: c.sourceUrl,
      imageUrls: c.imageUrl ? [c.imageUrl] : [],
      deadline: c.deadline?.toISOString(),
    };

    const normalized = normalizeJobListing(raw);
    const companyName = c.company?.name;
    const result = scoreListing(normalized, companyName);

    if (!result.passed) {
      const reason = result.hardRejected
        ? `HARD_REJECT(${result.hardRejected})`
        : `score=${result.score} [${result.reasons.join(', ')}]`;
      toDelete.push({
        id: c.id,
        title: c.title.substring(0, 70),
        company: c.company?.name || '?',
        reason,
      });
    } else {
      toKeep.push({
        id: c.id,
        title: normalized.title.substring(0, 70),
        company: c.company?.name || '?',
        score: result.score,
      });

      // Update the listing with cleaned title if it changed
      if (normalized.title !== c.title || normalized.description !== c.description) {
        await prisma.jobListing.update({
          where: { id: c.id },
          data: {
            title: normalized.title,
            description: normalized.description,
            sourceUrl: normalized.sourceUrl,
          },
        });
        console.log(`  [Update] "${c.title.substring(0, 50)}" → "${normalized.title.substring(0, 50)}"`);
      }
    }
  }

  // Show what will be deleted
  console.log(`\n=== SILINECEK ILANLAR (${toDelete.length}) ===`);
  for (const d of toDelete) {
    console.log(`  [${d.company}] "${d.title}" → ${d.reason}`);
  }

  // Show what will be kept
  console.log(`\n=== KALACAK ILANLAR (${toKeep.length}) ===`);
  for (const k of toKeep) {
    console.log(`  [${k.company}] (score=${k.score}) "${k.title}"`);
  }

  // Delete rejected listings
  if (toDelete.length > 0) {
    const ids = toDelete.map((d) => d.id);
    const result = await prisma.jobListing.deleteMany({
      where: { id: { in: ids } },
    });
    console.log(`\n=== ${result.count} ILAN SILINDI ===`);
  }

  // Final stats
  const remaining = await prisma.jobListing.count();
  console.log(`\nSonuc: ${remaining} ilan kaldi (${listings.length - remaining} silindi)`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
