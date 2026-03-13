import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.campaign.count();
  console.log('=== GENEL ISTATISTIKLER ===');
  console.log('Toplam kampanya:', total);

  // Per-brand distribution
  const byBrand = await prisma.campaign.groupBy({
    by: ['brandId'],
    _count: true,
    orderBy: { _count: { brandId: 'desc' } },
  });

  const brands = await prisma.brand.findMany({
    select: { id: true, name: true, category: { select: { name: true } } },
  });
  const brandMap = new Map(brands.map((b) => [b.id, { name: b.name, cat: b.category?.name }]));

  console.log('\n=== MARKA BAZINDA KAMPANYA SAYILARI ===');
  for (const b of byBrand) {
    const info = brandMap.get(b.brandId) || { name: 'Unknown', cat: '?' };
    console.log(`  ${info.name} [${info.cat}]: ${b._count}`);
  }

  // Missing data analysis
  const noEnd = await prisma.campaign.count({ where: { endDate: null } });
  const noStart = await prisma.campaign.count({ where: { startDate: null } });
  const noImage = await prisma.campaign.count({ where: { imageUrls: { isEmpty: true } } });
  const noDiscount = await prisma.campaign.count({ where: { discountRate: null } });
  const noDesc = await prisma.campaign.count({
    where: { OR: [{ description: null }, { description: '' }] },
  });

  console.log('\n=== EKSIK VERI ANALIZI ===');
  console.log(`  endDate yok: ${noEnd} / ${total}`);
  console.log(`  startDate yok: ${noStart} / ${total}`);
  console.log(`  Gorsel yok: ${noImage} / ${total}`);
  console.log(`  Indirim orani yok: ${noDiscount} / ${total}`);
  console.log(`  Aciklama yok: ${noDesc} / ${total}`);

  // List ALL campaigns with details for manual review
  const allCampaigns = await prisma.campaign.findMany({
    include: {
      brand: { select: { name: true } },
      category: { select: { name: true } },
      source: { select: { name: true } },
    },
    orderBy: { brand: { name: 'asc' } },
  });

  console.log('\n=== TUM KAMPANYALAR (DETAYLI) ===');
  for (const c of allCampaigns) {
    const brand = c.brand?.name || '?';
    const cat = c.category?.name || '?';
    const src = c.source?.name || '?';
    const endStr = c.endDate ? c.endDate.toISOString().split('T')[0] : 'YOK';
    const startStr = c.startDate ? c.startDate.toISOString().split('T')[0] : 'YOK';
    const imgs = c.imageUrls?.length || 0;
    const disc = c.discountRate != null ? `%${c.discountRate}` : '-';
    const titleShort = c.title.substring(0, 80);
    const descShort = (c.description || '').substring(0, 100);

    console.log(`\n--- [${brand}] ${titleShort}`);
    console.log(`    Kategori: ${cat} | Kaynak: ${src}`);
    console.log(`    Tarih: ${startStr} → ${endStr} | Gorsel: ${imgs} | Indirim: ${disc}`);
    console.log(`    URL: ${c.sourceUrl || 'yok'}`);
    if (descShort) console.log(`    Aciklama: ${descShort}`);
  }

  // Suspicious patterns
  console.log('\n\n=== SUPHELI KAMPANYALAR ===');

  // 1. Very short titles
  const shortTitles = allCampaigns.filter((c) => c.title.length < 10);
  if (shortTitles.length > 0) {
    console.log('\n--- Cok kisa basliklar (<10 karakter):');
    for (const c of shortTitles) {
      console.log(`  [${c.brand?.name}] "${c.title}"`);
    }
  }

  // 2. Titles that look like navigation/menu items
  const navKeywords = [
    'anasayfa', 'hakkımızda', 'hakkimizda', 'iletişim', 'iletisim', 'giriş', 'giris',
    'kayıt', 'kayit', 'sepet', 'ödeme', 'odeme', 'çıkış', 'cikis', 'kvkk', 'gizlilik',
    'cookie', 'çerez', 'cerez', 'sss', 'faq', 'yardım', 'yardim', 'kargo',
    'iade', 'şikayet', 'sikayet', 'mağaza', 'magaza',
  ];
  const navItems = allCampaigns.filter((c) => {
    const lower = c.title.toLowerCase();
    return navKeywords.some((kw) => lower === kw || lower.includes('giriş yap') || lower.includes('giris yap'));
  });
  if (navItems.length > 0) {
    console.log('\n--- Navigasyon/menu item gibi gorunen:');
    for (const c of navItems) {
      console.log(`  [${c.brand?.name}] "${c.title}"`);
    }
  }

  // 3. Duplicate titles (same title, different brands)
  const titleCount = new Map<string, string[]>();
  for (const c of allCampaigns) {
    const t = c.title.toLowerCase().trim();
    if (!titleCount.has(t)) titleCount.set(t, []);
    titleCount.get(t)!.push(c.brand?.name || '?');
  }
  const dupes = [...titleCount.entries()].filter(([, brands]) => brands.length > 1);
  if (dupes.length > 0) {
    console.log('\n--- Tekrarlayan basliklar:');
    for (const [title, brands] of dupes) {
      console.log(`  "${title}" → ${brands.join(', ')}`);
    }
  }

  // 4. Campaigns with no useful data
  const useless = allCampaigns.filter(
    (c) =>
      !c.description &&
      (c.imageUrls?.length || 0) === 0 &&
      c.discountRate == null &&
      !c.endDate,
  );
  if (useless.length > 0) {
    console.log('\n--- Hicbir ek verisi olmayan (desc yok, gorsel yok, indirim yok, tarih yok):');
    for (const c of useless) {
      console.log(`  [${c.brand?.name}] "${c.title.substring(0, 60)}"`);
    }
  }

  // 5. Very old startDate (before 2024)
  const oldCampaigns = allCampaigns.filter(
    (c) => c.startDate && c.startDate < new Date('2024-01-01'),
  );
  if (oldCampaigns.length > 0) {
    console.log('\n--- Cok eski kampanyalar (2024 oncesi):');
    for (const c of oldCampaigns) {
      console.log(`  [${c.brand?.name}] "${c.title.substring(0, 50)}" start=${c.startDate?.toISOString().split('T')[0]}`);
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
