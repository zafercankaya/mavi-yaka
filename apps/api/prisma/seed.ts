import {
  PrismaClient,
  UserRole,
  CrawlMethod,
  JobStatus,
  Sector,
  JobType,
  WorkMode,
  Market,
  SourceType,
} from '@prisma/client';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  console.log('Seeding database...');

  // --- Subscription Plans ---

  await prisma.subscriptionPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ücretsiz',
      market: Market.TR,
      currency: 'TRY',
      priceMonthly: 0,
      priceYearly: 0,
      maxCompanyFollows: 3,
      maxSavedJobs: 5,
      maxAlerts: 1,
      dailyViewLimit: 20,
      hasAdvancedFilter: false,
      adFree: false,
      weeklyDigest: false,
    },
  });

  await prisma.subscriptionPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Premium',
      market: Market.TR,
      currency: 'TRY',
      priceMonthly: 49.99,
      priceYearly: 399.99,
      maxCompanyFollows: -1,
      maxSavedJobs: -1,
      maxAlerts: -1,
      dailyViewLimit: -1,
      hasAdvancedFilter: true,
      adFree: true,
      weeklyDigest: true,
    },
  });
  console.log('  ✓ 2 subscription plans (Free + Premium)');

  // --- Admin User ---

  const adminPassword = await bcrypt.hash('admin123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@maviyaka.app' },
    update: {},
    create: {
      email: 'admin@maviyaka.app',
      passwordHash: adminPassword,
      displayName: 'Admin',
      role: UserRole.SUPER_ADMIN,
    },
  });
  console.log('  ✓ Admin user (admin@maviyaka.app / admin123456)');

  // --- Companies ---

  const companies = [
    {
      name: 'İŞKUR',
      slug: 'iskur',
      sector: Sector.OTHER,
      websiteUrl: 'https://www.iskur.gov.tr',
      market: Market.TR,
      description: 'Türkiye İş Kurumu - Resmi iş ilanları platformu',
      sourceType: SourceType.GOVERNMENT,
      seedUrl: 'https://esube.iskur.gov.tr/Ilan/IlanListesi.aspx',
    },
    {
      name: 'Kariyer.net',
      slug: 'kariyernet',
      sector: Sector.OTHER,
      websiteUrl: 'https://www.kariyer.net',
      market: Market.TR,
      description: 'Türkiye\'nin en büyük iş ilanı platformu',
      sourceType: SourceType.JOB_PLATFORM,
      seedUrl: 'https://www.kariyer.net/is-ilanlari',
    },
    {
      name: 'Indeed TR',
      slug: 'indeed-tr',
      sector: Sector.OTHER,
      websiteUrl: 'https://tr.indeed.com',
      market: Market.TR,
      description: 'Küresel iş arama motoru - Türkiye',
      sourceType: SourceType.JOB_PLATFORM,
      seedUrl: 'https://tr.indeed.com/jobs',
    },
    {
      name: 'Migros',
      slug: 'migros',
      sector: Sector.RETAIL,
      websiteUrl: 'https://www.migros.com.tr',
      market: Market.TR,
      description: 'Migros Ticaret A.Ş. - Perakende zinciri',
      sourceType: SourceType.COMPANY_CAREER,
      seedUrl: 'https://www.migros.com.tr/kariyer',
    },
    {
      name: 'Trendyol',
      slug: 'trendyol',
      sector: Sector.ECOMMERCE_CARGO,
      websiteUrl: 'https://www.trendyol.com',
      market: Market.TR,
      description: 'Trendyol - E-ticaret ve kargo hizmetleri',
      sourceType: SourceType.COMPANY_CAREER,
      seedUrl: 'https://www.trendyol.com/kariyer',
    },
  ];

  const companyRecords: any[] = [];
  for (const c of companies) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        sector: c.sector,
        websiteUrl: c.websiteUrl,
        market: c.market,
        description: c.description,
        isActive: true,
      },
    });
    companyRecords.push({ ...company, sourceType: c.sourceType, seedUrl: c.seedUrl });
  }
  console.log(`  ✓ ${companies.length} companies`);

  // --- Crawl Sources ---

  const sourceRecords: any[] = [];
  for (const company of companyRecords) {
    const source = await prisma.crawlSource.upsert({
      where: { id: company.id },
      update: {},
      create: {
        id: company.id,
        companyId: company.id,
        name: `${company.name} İş İlanları`,
        type: company.sourceType,
        crawlMethod: CrawlMethod.HTML,
        seedUrls: [company.seedUrl],
        schedule: '0 3 * * *',
        agingDays: 14,
        market: Market.TR,
        isActive: true,
      },
    });
    sourceRecords.push(source);
  }
  console.log(`  ✓ ${sourceRecords.length} crawl sources`);

  // --- Sample Job Listings ---

  const sampleJobs = [
    {
      title: 'Forklift Operatörü',
      companySlug: 'iskur',
      sector: Sector.LOGISTICS_TRANSPORTATION,
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'İstanbul',
      salaryMin: 22000,
      salaryMax: 28000,
    },
    {
      title: 'Kargo Dağıtıcı',
      companySlug: 'trendyol',
      sector: Sector.ECOMMERCE_CARGO,
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'Ankara',
      salaryMin: 20000,
      salaryMax: 25000,
    },
    {
      title: 'Kasiyer',
      companySlug: 'migros',
      sector: Sector.RETAIL,
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'İzmir',
      salaryMin: 18000,
      salaryMax: 22000,
    },
    {
      title: 'Depo Görevlisi',
      companySlug: 'kariyernet',
      sector: Sector.LOGISTICS_TRANSPORTATION,
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'Bursa',
      salaryMin: 19000,
      salaryMax: 24000,
    },
    {
      title: 'Aşçıbaşı',
      companySlug: 'indeed-tr',
      sector: Sector.FOOD_BEVERAGE,
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'Antalya',
      salaryMin: 25000,
      salaryMax: 35000,
    },
    {
      title: 'CNC Torna Operatörü',
      companySlug: 'iskur',
      sector: Sector.MANUFACTURING,
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'Kocaeli',
      salaryMin: 24000,
      salaryMax: 32000,
    },
    {
      title: 'Güvenlik Görevlisi',
      companySlug: 'kariyernet',
      sector: Sector.SECURITY_SERVICES,
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'İstanbul',
      salaryMin: 18000,
      salaryMax: 22000,
    },
    {
      title: 'Kat Hizmetleri Elemanı',
      companySlug: 'indeed-tr',
      sector: Sector.HOSPITALITY_TOURISM,
      jobType: JobType.SEASONAL,
      workMode: WorkMode.ON_SITE,
      city: 'Muğla',
      salaryMin: 17000,
      salaryMax: 21000,
    },
    {
      title: 'Elektrik Teknisyeni',
      companySlug: 'iskur',
      sector: Sector.CONSTRUCTION,
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'Gaziantep',
      salaryMin: 22000,
      salaryMax: 30000,
    },
    {
      title: 'Reyon Görevlisi',
      companySlug: 'migros',
      sector: Sector.RETAIL,
      jobType: JobType.PART_TIME,
      workMode: WorkMode.ON_SITE,
      city: 'Adana',
      salaryMin: 12000,
      salaryMax: 15000,
    },
  ];

  let jobCount = 0;
  for (const j of sampleJobs) {
    const company = companyRecords.find((c) => c.slug === j.companySlug)!;
    const source = sourceRecords.find((s) => s.companyId === company.id)!;
    const sourceUrl = `${company.websiteUrl}/ilan/${slugify(j.title)}-${jobCount}`;
    const fingerprint = createHash('sha256').update(`${company.id}:${sourceUrl}`).digest('hex');
    const now = new Date();
    const deadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.jobListing.upsert({
      where: { fingerprint },
      update: {},
      create: {
        title: j.title,
        slug: slugify(j.title),
        description: `${j.title} pozisyonu için deneyimli adaylar aranmaktadır. ${j.city} lokasyonunda tam zamanlı çalışma imkanı.`,
        companyId: company.id,
        sourceId: source.id,
        sourceUrl,
        fingerprint,
        status: JobStatus.ACTIVE,
        country: Market.TR,
        city: j.city,
        sector: j.sector,
        jobType: j.jobType,
        workMode: j.workMode,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryCurrency: 'TRY',
        salaryPeriod: 'monthly',
        deadline,
        postedDate: now,
        lastSeenAt: now,
      },
    });
    jobCount++;
  }
  console.log(`  ✓ ${jobCount} sample job listings`);

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
