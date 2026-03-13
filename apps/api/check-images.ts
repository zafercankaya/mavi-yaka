import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  // Get all brands with active campaigns
  const brands = await p.brand.findMany({
    where: { campaigns: { some: { status: 'ACTIVE' } } },
    select: { id: true, name: true, logoUrl: true },
    orderBy: { name: 'asc' },
  });

  console.log(`\n=== Kampanya Resim Durumu (${brands.length} marka) ===\n`);

  const problems: string[] = [];

  for (const brand of brands) {
    const campaigns = await p.campaign.findMany({
      where: { brandId: brand.id, status: 'ACTIVE' },
      select: { id: true, title: true, imageUrls: true, startDate: true, endDate: true },
    });

    const total = campaigns.length;
    const noImage = campaigns.filter(c => c.imageUrls.length === 0).length;
    const noDate = campaigns.filter(c => !c.startDate && !c.endDate).length;

    const imagePercent = total > 0 ? Math.round(((total - noImage) / total) * 100) : 0;
    const datePercent = total > 0 ? Math.round(((total - noDate) / total) * 100) : 0;

    const imageStatus = noImage === 0 ? '✓' : noImage === total ? '✗' : '△';
    const dateStatus = noDate === total ? '·' : noDate === 0 ? '✓' : '△';
    const logoStatus = brand.logoUrl ? '✓' : '✗';

    console.log(
      `${imageStatus} ${brand.name.padEnd(30)} | ${total} kampanya | Resim: ${imagePercent}% (${total - noImage}/${total}) | Tarih: ${datePercent}% | Logo: ${logoStatus}`
    );

    if (noImage === total && total > 0) {
      problems.push(`${brand.name}: TÜM ${total} kampanya resim eksik`);
    } else if (noImage > 0) {
      problems.push(`${brand.name}: ${noImage}/${total} kampanya resim eksik`);
    }
    if (!brand.logoUrl) {
      problems.push(`${brand.name}: Brand logoUrl NULL`);
    }
  }

  if (problems.length > 0) {
    console.log(`\n=== SORUNLAR (${problems.length}) ===`);
    for (const p of problems) {
      console.log(`  - ${p}`);
    }
  } else {
    console.log('\n✓ Tüm markalarda resim mevcut');
  }

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
