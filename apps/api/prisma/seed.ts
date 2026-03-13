import { PrismaClient, UserRole, CrawlMethod, CampaignStatus } from '@prisma/client';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Elektronik', nameEn: 'Electronics', slug: 'elektronik', iconName: 'devices', sortOrder: 1 },
  { name: 'Giyim & Moda', nameEn: 'Fashion & Clothing', slug: 'giyim-moda', iconName: 'checkroom', sortOrder: 2 },
  { name: 'Gıda & Market', nameEn: 'Groceries & Supermarket', slug: 'gida-market', iconName: 'shopping_cart', sortOrder: 3 },
  { name: 'Ev & Yaşam', nameEn: 'Home & Living', slug: 'ev-yasam', iconName: 'home', sortOrder: 4 },
  { name: 'Kozmetik & Kişisel Bakım', nameEn: 'Beauty & Personal Care', slug: 'kozmetik-kisisel-bakim', iconName: 'spa', sortOrder: 5 },
  { name: 'Spor & Outdoor', nameEn: 'Sports & Outdoor', slug: 'spor-outdoor', iconName: 'fitness_center', sortOrder: 6 },
  { name: 'Kitap & Hobi', nameEn: 'Books & Hobbies', slug: 'kitap-hobi', iconName: 'menu_book', sortOrder: 7 },
  { name: 'Seyahat & Ulaşım', nameEn: 'Travel & Transport', slug: 'seyahat-ulasim', iconName: 'flight', sortOrder: 8 },
  { name: 'Yeme & İçme', nameEn: 'Food & Drink', slug: 'yeme-icme', iconName: 'restaurant', sortOrder: 9 },
  { name: 'Telekomunikasyon', nameEn: 'Telecommunications', slug: 'telekomunikasyon', iconName: 'cell_tower', sortOrder: 145 },
  { name: 'Teknoloji & Yazılım', nameEn: 'Technology & Software', slug: 'teknoloji-yazilim', iconName: 'code', sortOrder: 146 },
  { name: 'Sigorta', nameEn: 'Insurance', slug: 'sigorta', iconName: 'shield', sortOrder: 12 },
  { name: 'Diğer', nameEn: 'Others', slug: 'diger', iconName: 'category', sortOrder: 99 },
];

async function main() {
  console.log('Seeding database...');

  // Categories
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { nameEn: cat.nameEn },
      create: cat,
    });
  }
  console.log(`  ✓ ${DEFAULT_CATEGORIES.length} categories`);

  // Free plan
  await prisma.subscriptionPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ücretsiz',
      maxBrandFollows: 1,
      maxCampaignFollows: 1,
      dailyNotifLimit: 1,
      hasAdvancedFilter: false,
      adFree: false,
    },
  });

  // Premium plan
  await prisma.subscriptionPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Premium',
      priceMonthly: 49.99,
      priceYearly: 399.99,
      maxBrandFollows: -1,
      maxCampaignFollows: -1,
      dailyNotifLimit: -1,
      hasAdvancedFilter: true,
      adFree: true,
    },
  });
  console.log('  ✓ 2 subscription plans (Free + Premium)');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@kampanya-sepeti.app' },
    update: {},
    create: {
      email: 'admin@kampanya-sepeti.app',
      passwordHash: adminPassword,
      displayName: 'Admin',
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log('  ✓ Admin user (admin@kampanya-sepeti.app / admin123456)');

  // Brands
  const brands = [
    { name: 'Trendyol', slug: 'trendyol', websiteUrl: 'https://www.trendyol.com' },
    { name: 'Hepsiburada', slug: 'hepsiburada', websiteUrl: 'https://www.hepsiburada.com' },
    { name: 'A101', slug: 'a101', websiteUrl: 'https://www.a101.com.tr' },
    { name: 'BİM', slug: 'bim', websiteUrl: 'https://www.bim.com.tr' },
    { name: 'Migros', slug: 'migros', websiteUrl: 'https://www.migros.com.tr' },
  ];

  const brandRecords: any[] = [];
  for (const b of brands) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
    brandRecords.push(brand);
  }
  console.log(`  ✓ ${brands.length} brands`);

  // Crawl Sources — her marka için genel kampanya kaynağı
  for (const brand of brandRecords) {
    await prisma.crawlSource.upsert({
      where: { id: brand.id },
      update: {},
      create: {
        id: brand.id,
        brandId: brand.id,
        name: `${brand.name} Kampanyalar`,
        crawlMethod: CrawlMethod.CAMPAIGN,
        seedUrls: [`${brand.websiteUrl}/kampanyalar`],
        schedule: '0 3 * * *',
        agingDays: 7,
      },
    });
  }
  console.log(`  ✓ ${brandRecords.length} crawl sources`);

  // Sample Campaigns
  const categories = await prisma.category.findMany();
  const sampleCampaigns = [
    { title: 'Elektronik Ürünlerde %30 İndirim', brand: 'trendyol', cat: 'elektronik', discount: 30 },
    { title: 'Kış Modası Büyük Kampanya', brand: 'trendyol', cat: 'giyim-moda', discount: 50 },
    { title: 'Süpermarket Haftası - Tüm Ürünlerde Fırsat', brand: 'migros', cat: 'gida-market', discount: 20 },
    { title: 'Ev & Dekorasyon Fırsatları', brand: 'hepsiburada', cat: 'ev-yasam', discount: 40 },
    { title: 'A101 Aktüel Ürünler Bu Hafta', brand: 'a101', cat: 'gida-market', discount: null },
    { title: 'BİM Cuma Fırsatları', brand: 'bim', cat: 'gida-market', discount: 15 },
    { title: 'Spor Giyim ve Ekipman İndirimleri', brand: 'trendyol', cat: 'spor-outdoor', discount: 35 },
    { title: 'Kozmetik Festivali - Seçili Ürünlerde %25', brand: 'hepsiburada', cat: 'kozmetik-kisisel-bakim', discount: 25 },
    { title: 'Kitap Fuarı İndirimleri', brand: 'hepsiburada', cat: 'kitap-hobi', discount: 40 },
    { title: 'Migros Sanal Market Fırsatları', brand: 'migros', cat: 'gida-market', discount: 10 },
  ];

  let campaignCount = 0;
  for (const c of sampleCampaigns) {
    const brand = brandRecords.find((b) => b.slug === c.brand)!;
    const category = categories.find((cat) => cat.slug === c.cat);
    const sourceUrl = `${brand.websiteUrl}/kampanya/${Date.now()}-${campaignCount}`;
    const fingerprint = createHash('sha256').update(`${brand.id}:${sourceUrl}`).digest('hex');

    await prisma.campaign.upsert({
      where: { fingerprint },
      update: {},
      create: {
        title: c.title,
        description: `${c.title} - Bu kampanyayı kaçırmayın!`,
        brandId: brand.id,
        categoryId: category?.id ?? null,
        sourceId: brand.id,
        sourceUrl,
        fingerprint,
        discountRate: c.discount,
        imageUrls: [],
        status: CampaignStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    campaignCount++;
  }
  console.log(`  ✓ ${campaignCount} sample campaigns`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
