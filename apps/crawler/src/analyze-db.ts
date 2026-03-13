import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.jobListing.count();
  console.log('=== GENEL ISTATISTIKLER ===');
  console.log('Toplam ilan:', total);

  // Per-company distribution
  const byCompany = await prisma.jobListing.groupBy({
    by: ['companyId'],
    _count: true,
    orderBy: { _count: { companyId: 'desc' } },
  });

  const companies = await prisma.company.findMany({
    select: { id: true, name: true, sector: true },
  });
  const companyMap = new Map(companies.map((b) => [b.id, { name: b.name, cat: b.sector }]));

  console.log('\n=== SIRKET BAZINDA ILAN SAYILARI ===');
  for (const b of byCompany) {
    const info = companyMap.get(b.companyId) || { name: 'Unknown', cat: '?' };
    console.log(`  ${info.name} [${info.cat}]: ${b._count}`);
  }

  // Missing data analysis
  const noDeadline = await prisma.jobListing.count({ where: { deadline: null } });
  const noImage = await prisma.jobListing.count({ where: { imageUrl: null } });
  const noDesc = await prisma.jobListing.count({
    where: { OR: [{ description: null }, { description: '' }] },
  });

  console.log('\n=== EKSIK VERI ANALIZI ===');
  console.log(`  deadline yok: ${noDeadline} / ${total}`);
  console.log(`  Gorsel yok: ${noImage} / ${total}`);
  console.log(`  Aciklama yok: ${noDesc} / ${total}`);

  // List ALL job listings with details for manual review
  const allListings = await prisma.jobListing.findMany({
    include: {
      company: { select: { name: true } },
      source: { select: { name: true } },
    },
    orderBy: { company: { name: 'asc' } },
  });

  console.log('\n=== TUM ILANLAR (DETAYLI) ===');
  for (const c of allListings) {
    const company = c.company?.name || '?';
    const src = c.source?.name || '?';
    const deadlineStr = c.deadline ? c.deadline.toISOString().split('T')[0] : 'YOK';
    const img = c.imageUrl ? '1' : '0';
    const titleShort = c.title.substring(0, 80);
    const descShort = (c.description || '').substring(0, 100);

    console.log(`\n--- [${company}] ${titleShort}`);
    console.log(`    Sektor: ${c.sector} | Kaynak: ${src}`);
    console.log(`    Deadline: ${deadlineStr} | Gorsel: ${img}`);
    console.log(`    URL: ${c.sourceUrl || 'yok'}`);
    if (descShort) console.log(`    Aciklama: ${descShort}`);
  }

  // Suspicious patterns
  console.log('\n\n=== SUPHELI ILANLAR ===');

  // 1. Very short titles
  const shortTitles = allListings.filter((c) => c.title.length < 10);
  if (shortTitles.length > 0) {
    console.log('\n--- Cok kisa basliklar (<10 karakter):');
    for (const c of shortTitles) {
      console.log(`  [${c.company?.name}] "${c.title}"`);
    }
  }

  // 2. Titles that look like navigation/menu items
  const navKeywords = [
    'anasayfa', 'hakkımızda', 'hakkimizda', 'iletişim', 'iletisim', 'giriş', 'giris',
    'kayıt', 'kayit', 'sepet', 'ödeme', 'odeme', 'çıkış', 'cikis', 'kvkk', 'gizlilik',
    'cookie', 'çerez', 'cerez', 'sss', 'faq', 'yardım', 'yardim', 'kargo',
    'iade', 'şikayet', 'sikayet', 'mağaza', 'magaza',
  ];
  const navItems = allListings.filter((c) => {
    const lower = c.title.toLowerCase();
    return navKeywords.some((kw) => lower === kw || lower.includes('giriş yap') || lower.includes('giris yap'));
  });
  if (navItems.length > 0) {
    console.log('\n--- Navigasyon/menu item gibi gorunen:');
    for (const c of navItems) {
      console.log(`  [${c.company?.name}] "${c.title}"`);
    }
  }

  // 3. Duplicate titles (same title, different companies)
  const titleCount = new Map<string, string[]>();
  for (const c of allListings) {
    const t = c.title.toLowerCase().trim();
    if (!titleCount.has(t)) titleCount.set(t, []);
    titleCount.get(t)!.push(c.company?.name || '?');
  }
  const dupes = [...titleCount.entries()].filter(([, companies]) => companies.length > 1);
  if (dupes.length > 0) {
    console.log('\n--- Tekrarlayan basliklar:');
    for (const [title, companies] of dupes) {
      console.log(`  "${title}" → ${companies.join(', ')}`);
    }
  }

  // 4. Listings with no useful data
  const useless = allListings.filter(
    (c) =>
      !c.description &&
      !c.imageUrl &&
      !c.deadline,
  );
  if (useless.length > 0) {
    console.log('\n--- Hicbir ek verisi olmayan (desc yok, gorsel yok, deadline yok):');
    for (const c of useless) {
      console.log(`  [${c.company?.name}] "${c.title.substring(0, 60)}"`);
    }
  }

  // 5. Very old postedDate (before 2024)
  const oldListings = allListings.filter(
    (c) => c.postedDate && c.postedDate < new Date('2024-01-01'),
  );
  if (oldListings.length > 0) {
    console.log('\n--- Cok eski ilanlar (2024 oncesi):');
    for (const c of oldListings) {
      console.log(`  [${c.company?.name}] "${c.title.substring(0, 50)}" posted=${c.postedDate?.toISOString().split('T')[0]}`);
    }
  }

  // Crawl log summary
  const logs = await prisma.crawlLog.findMany({
    include: { source: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  console.log('\n\n=== SON CRAWL LOGLARI ===');
  const logByStatus = { SUCCESS: 0, FAILED: 0, PARTIAL: 0, RUNNING: 0 };
  for (const l of logs) {
    if (l.status in logByStatus) (logByStatus as any)[l.status]++;
  }
  console.log(`  SUCCESS: ${logByStatus.SUCCESS} | PARTIAL: ${logByStatus.PARTIAL} | FAILED: ${logByStatus.FAILED} | RUNNING: ${logByStatus.RUNNING}`);

  const failedLogs = logs.filter((l) => l.status === 'FAILED');
  if (failedLogs.length > 0) {
    console.log('\n--- Basarisiz crawl\'ler:');
    for (const l of failedLogs.slice(0, 20)) {
      console.log(`  ${l.source?.name}: ${l.errorMessage?.substring(0, 100)}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
