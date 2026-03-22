/**
 * cleanup-non-blue-collar.ts — Mevcut DB'deki beyaz yaka ilanları EXPIRED yap
 *
 * Usage:
 *   npx ts-node --transpile-only src/cleanup-non-blue-collar.ts          # dry-run
 *   npx ts-node --transpile-only src/cleanup-non-blue-collar.ts --apply  # gerçekten expire et
 *   npx ts-node --transpile-only src/cleanup-non-blue-collar.ts US       # sadece US market
 */

import { PrismaClient } from '@prisma/client';
import { isBlueCollar } from './utils/blue-collar-filter';

const prisma = new PrismaClient();

const BATCH_SIZE = 5000;
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');
const marketFilter = args.find(a => a !== '--apply' && a.length === 2)?.toUpperCase() || null;

async function main() {
  console.log(`\n🧹 Mavi Yaka — Non-Blue-Collar Cleanup`);
  console.log(`Mode: ${dryRun ? 'DRY-RUN (sadece sayım)' : '⚠️  APPLY (EXPIRED yapılacak)'}`);
  if (marketFilter) console.log(`Market filter: ${marketFilter}`);
  console.log(`Started: ${new Date().toISOString()}\n`);

  const where: any = { status: 'ACTIVE' };
  if (marketFilter) where.country = marketFilter;

  const totalActive = await prisma.jobListing.count({ where });
  console.log(`Total active listings${marketFilter ? ` (${marketFilter})` : ''}: ${totalActive.toLocaleString()}`);

  let processed = 0;
  let toExpire = 0;
  let kept = 0;
  const sampleRejects: string[] = [];

  // Process in batches using cursor-based pagination
  let cursor: string | undefined;

  while (true) {
    const batch = await prisma.jobListing.findMany({
      where,
      select: { id: true, title: true, description: true, country: true },
      orderBy: { id: 'asc' },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (batch.length === 0) break;

    const idsToExpire: string[] = [];

    for (const job of batch) {
      if (!isBlueCollar(job.title, job.description)) {
        idsToExpire.push(job.id);
        if (sampleRejects.length < 50) {
          sampleRejects.push(`  [${job.country}] "${job.title.substring(0, 80)}"`);
        }
      }
    }

    toExpire += idsToExpire.length;
    kept += batch.length - idsToExpire.length;
    processed += batch.length;

    if (!dryRun && idsToExpire.length > 0) {
      await prisma.jobListing.updateMany({
        where: { id: { in: idsToExpire } },
        data: { status: 'EXPIRED' },
      });
    }

    cursor = batch[batch.length - 1].id;

    if (processed % 50000 === 0 || batch.length < BATCH_SIZE) {
      const pct = ((processed / totalActive) * 100).toFixed(1);
      console.log(`  Progress: ${processed.toLocaleString()}/${totalActive.toLocaleString()} (${pct}%) — expire: ${toExpire.toLocaleString()}, keep: ${kept.toLocaleString()}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SONUÇ`);
  console.log(`  Toplam taranan: ${processed.toLocaleString()}`);
  console.log(`  Mavi yaka (TUTULDU): ${kept.toLocaleString()} (${((kept / processed) * 100).toFixed(1)}%)`);
  console.log(`  Beyaz yaka (${dryRun ? 'EXPIRE EDİLECEK' : 'EXPIRED YAPILDI'}): ${toExpire.toLocaleString()} (${((toExpire / processed) * 100).toFixed(1)}%)`);

  if (sampleRejects.length > 0) {
    console.log(`\n📋 Örnek beyaz yaka ilanlar (ilk ${sampleRejects.length}):`);
    for (const s of sampleRejects) console.log(s);
  }

  if (dryRun) {
    console.log(`\n⚠️  DRY-RUN: Hiçbir değişiklik yapılmadı. --apply ile çalıştırın.`);
  }

  console.log(`\nFinished: ${new Date().toISOString()}`);
  await prisma.$disconnect();
}

main().catch(console.error);
