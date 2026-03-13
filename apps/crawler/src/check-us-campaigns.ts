import './config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  // Get US campaigns created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const campaigns = await p.campaign.findMany({
    where: { market: 'US', createdAt: { gte: today } },
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true, nameEn: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  console.log(`\n=== US Campaigns Created Today: ${campaigns.length} ===\n`);

  for (const c of campaigns) {
    console.log(`Brand: ${c.brand.name}`);
    console.log(`  Title: ${c.title}`);
    console.log(`  Category: ${c.category?.nameEn || c.category?.name || 'N/A'}`);
    console.log(`  URL: ${c.sourceUrl}`);
    console.log(`  Images: ${c.imageUrls.length > 0 ? c.imageUrls.join(', ').substring(0, 120) : 'NONE'}`);
    console.log(`  Discount: ${c.discountRate ? c.discountRate + '%' : 'N/A'}`);
    console.log(`  Start: ${c.startDate ? c.startDate.toISOString().split('T')[0] : 'N/A'}`);
    console.log(`  End: ${c.endDate ? c.endDate.toISOString().split('T')[0] : 'N/A'}`);
    console.log(`  Status: ${c.status}`);
    console.log(`  Description: ${c.description ? c.description.substring(0, 100) : 'NONE'}`);
    console.log('');
  }

  // Summary stats
  const withImages = campaigns.filter(c => c.imageUrls.length > 0).length;
  const withDates = campaigns.filter(c => c.startDate || c.endDate).length;
  const withDesc = campaigns.filter(c => c.description).length;
  const withDiscount = campaigns.filter(c => c.discountRate).length;
  
  console.log('\n=== QUALITY STATS ===');
  console.log(`Total: ${campaigns.length}`);
  console.log(`With images: ${withImages}/${campaigns.length} (${Math.round(withImages/campaigns.length*100)}%)`);
  console.log(`With dates: ${withDates}/${campaigns.length} (${Math.round(withDates/campaigns.length*100)}%)`);
  console.log(`With description: ${withDesc}/${campaigns.length} (${Math.round(withDesc/campaigns.length*100)}%)`);
  console.log(`With discount: ${withDiscount}/${campaigns.length} (${Math.round(withDiscount/campaigns.length*100)}%)`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
