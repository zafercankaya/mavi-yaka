import './config';
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

async function main() {
  // Get US job listings created today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const listings = await p.jobListing.findMany({
    where: { country: 'US', createdAt: { gte: today } },
    include: {
      company: { select: { name: true, sector: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  console.log(`\n=== US Job Listings Created Today: ${listings.length} ===\n`);

  for (const c of listings) {
    console.log(`Company: ${c.company.name}`);
    console.log(`  Title: ${c.title}`);
    console.log(`  Sector: ${c.company.sector || 'N/A'}`);
    console.log(`  URL: ${c.sourceUrl}`);
    console.log(`  Image: ${c.imageUrl || 'NONE'}`);
    console.log(`  Deadline: ${c.deadline ? c.deadline.toISOString().split('T')[0] : 'N/A'}`);
    console.log(`  Status: ${c.status}`);
    console.log(`  Description: ${c.description ? c.description.substring(0, 100) : 'NONE'}`);
    console.log('');
  }

  // Summary stats
  const withImages = listings.filter(c => c.imageUrl).length;
  const withDeadline = listings.filter(c => c.deadline).length;
  const withDesc = listings.filter(c => c.description).length;

  console.log('\n=== QUALITY STATS ===');
  console.log(`Total: ${listings.length}`);
  console.log(`With images: ${withImages}/${listings.length} (${listings.length > 0 ? Math.round(withImages/listings.length*100) : 0}%)`);
  console.log(`With deadline: ${withDeadline}/${listings.length} (${listings.length > 0 ? Math.round(withDeadline/listings.length*100) : 0}%)`);
  console.log(`With description: ${withDesc}/${listings.length} (${listings.length > 0 ? Math.round(withDesc/listings.length*100) : 0}%)`);

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
