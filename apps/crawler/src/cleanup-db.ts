/**
 * Cleanup script: re-evaluate all existing campaigns against the improved quality filter.
 * Campaigns that fail are deleted from DB.
 */
import { PrismaClient } from '@prisma/client';
import { normalizeCampaign, RawCampaignData } from './pipeline/normalize';
import { scoreCampaign } from './pipeline/quality-filter';

const prisma = new PrismaClient();

async function main() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      brand: { select: { name: true } },
      source: { select: { name: true } },
    },
  });

  console.log(`\n=== KAMPANYA TEMIZLIGI ===`);
  console.log(`Toplam kampanya: ${campaigns.length}\n`);

  const toDelete: { id: string; title: string; brand: string; reason: string }[] = [];
  const toKeep: { id: string; title: string; brand: string; score: number }[] = [];

  for (const c of campaigns) {
    // Re-create a NormalizedCampaign from DB data for quality scoring
    const raw: RawCampaignData = {
      title: c.title,
      description: c.description || undefined,
      sourceUrl: c.sourceUrl,
      imageUrls: c.imageUrls || [],
      startDate: c.startDate?.toISOString(),
      endDate: c.endDate?.toISOString(),
      discountRate: c.discountRate != null ? Number(c.discountRate) : undefined,
    };

    const normalized = normalizeCampaign(raw);
    const brandName = c.brand?.name;
    const result = scoreCampaign(normalized, brandName);

    if (!result.passed) {
      const reason = result.hardRejected
        ? `HARD_REJECT(${result.hardRejected})`
        : `score=${result.score} [${result.reasons.join(', ')}]`;
      toDelete.push({
        id: c.id,
        title: c.title.substring(0, 70),
        brand: c.brand?.name || '?',
        reason,
      });
    } else {
      toKeep.push({
        id: c.id,
        title: normalized.title.substring(0, 70),
        brand: c.brand?.name || '?',
        score: result.score,
      });

      // Update the campaign with cleaned title if it changed
      if (normalized.title !== c.title || normalized.description !== c.description) {
        await prisma.campaign.update({
          where: { id: c.id },
          data: {
            title: normalized.title,
            description: normalized.description,
            sourceUrl: normalized.sourceUrl,
            discountRate: normalized.discountRate,
          },
        });
        console.log(`  [Update] "${c.title.substring(0, 50)}" → "${normalized.title.substring(0, 50)}"`);
      }
    }
  }

  // Show what will be deleted
  console.log(`\n=== SILINECEK KAMPANYALAR (${toDelete.length}) ===`);
  for (const d of toDelete) {
    console.log(`  [${d.brand}] "${d.title}" → ${d.reason}`);
  }

  // Show what will be kept
  console.log(`\n=== KALACAK KAMPANYALAR (${toKeep.length}) ===`);
  for (const k of toKeep) {
    console.log(`  [${k.brand}] (score=${k.score}) "${k.title}"`);
  }

  // Delete rejected campaigns
  if (toDelete.length > 0) {
    const ids = toDelete.map((d) => d.id);
    const result = await prisma.campaign.deleteMany({
      where: { id: { in: ids } },
    });
    console.log(`\n=== ${result.count} KAMPANYA SILINDI ===`);
  }

  // Final stats
  const remaining = await prisma.campaign.count();
  console.log(`\nSonuc: ${remaining} kampanya kaldi (${campaigns.length - remaining} silindi)`);

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
