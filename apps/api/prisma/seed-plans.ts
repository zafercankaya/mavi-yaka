import { config } from 'dotenv';
config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Google Play / App Store product IDs (aynı ürün, bölgesel fiyatlandırma) */
const GOOGLE_PRODUCT_MONTHLY = 'premium_monthly';
const GOOGLE_PRODUCT_YEARLY = 'premium_yearly';
const APPLE_PRODUCT_MONTHLY = 'premium_monthly';
const APPLE_PRODUCT_YEARLY = 'premium_yearly';

// Fiyatlar Google Play Console'dan alındı (vergi dahil, Mart 2026)
// Referans: apps/mobile/google-play-prices.json
const PREMIUM_PLANS = [
  // Tier 1 — Gelişmiş Marketler
  { market: 'TR', currency: 'TRY', priceMonthly: 35.99, priceYearly: 214.99 },
  { market: 'US', currency: 'USD', priceMonthly: 2.99, priceYearly: 19.99 },
  { market: 'CA', currency: 'CAD', priceMonthly: 3.99, priceYearly: 27.99 },
  { market: 'AU', currency: 'AUD', priceMonthly: 4.89, priceYearly: 32.99 },
  { market: 'UK', currency: 'GBP', priceMonthly: 2.99, priceYearly: 20.49 },
  { market: 'JP', currency: 'JPY', priceMonthly: 440, priceYearly: 3080 },
  { market: 'KR', currency: 'KRW', priceMonthly: 4300, priceYearly: 27000 },

  // Tier 2 — Avrupa
  { market: 'DE', currency: 'EUR', priceMonthly: 3.59, priceYearly: 19.99 },
  { market: 'FR', currency: 'EUR', priceMonthly: 3.59, priceYearly: 23.99 },
  { market: 'IT', currency: 'EUR', priceMonthly: 2.99, priceYearly: 20.99 },
  { market: 'ES', currency: 'EUR', priceMonthly: 3.09, priceYearly: 20.99 },

  // Tier 3 — Orta
  { market: 'BR', currency: 'BRL', priceMonthly: 12.99, priceYearly: 69.99 },
  { market: 'MX', currency: 'MXN', priceMonthly: 46, priceYearly: 289 },
  { market: 'AR', currency: 'USD', priceMonthly: 2.99, priceYearly: 19.99 },
  { market: 'RU', currency: 'RUB', priceMonthly: 199, priceYearly: 1290 },
  { market: 'EG', currency: 'EGP', priceMonthly: 169.99, priceYearly: 1149.99 },
  { market: 'SA', currency: 'SAR', priceMonthly: 12.99, priceYearly: 85.99 },

  // Tier 4 — Fiyat Hassas
  { market: 'IN', currency: 'INR', priceMonthly: 95, priceYearly: 590 },
  { market: 'ID', currency: 'IDR', priceMonthly: 20000, priceYearly: 119000 },
  { market: 'PH', currency: 'PHP', priceMonthly: 88, priceYearly: 559 },
  { market: 'TH', currency: 'THB', priceMonthly: 74, priceYearly: 475 },

  // --- Batch 3 — Yeni 10 Market ---

  // Tier 1 — Gelişmiş
  { market: 'SE', currency: 'SEK', priceMonthly: 34, priceYearly: 229 },

  // Tier 2 — Avrupa
  { market: 'PT', currency: 'EUR', priceMonthly: 3.19, priceYearly: 20.99 },
  { market: 'NL', currency: 'EUR', priceMonthly: 3.09, priceYearly: 20.99 },
  { market: 'PL', currency: 'PLN', priceMonthly: 13.99, priceYearly: 89.99 },

  // Tier 3 — Orta
  { market: 'AE', currency: 'AED', priceMonthly: 11.99, priceYearly: 76.99 },
  { market: 'CO', currency: 'COP', priceMonthly: 11500, priceYearly: 76000 },
  { market: 'ZA', currency: 'ZAR', priceMonthly: 56.99, priceYearly: 379.99 },

  // Tier 4 — Fiyat Hassas
  { market: 'VN', currency: 'VND', priceMonthly: 78000, priceYearly: 524000 },
  { market: 'MY', currency: 'MYR', priceMonthly: 12.99, priceYearly: 84.99 },
  { market: 'PK', currency: 'PKR', priceMonthly: 850, priceYearly: 5600 },
] as const;

async function upsertPlan(
  market: string,
  currency: string,
  name: string,
  data: Record<string, any>,
) {
  const result = await prisma.subscriptionPlan.upsert({
    where: { name_market: { name, market: market as any } },
    update: { currency, ...data },
    create: { name, market: market as any, currency, ...data },
  });
  return result.createdAt.getTime() > Date.now() - 5000 ? 'Created' : 'Updated';
}

async function cleanupDuplicates() {
  console.log('--- Cleanup: removing duplicate plans ---');
  const allPlans = await prisma.subscriptionPlan.findMany({
    include: { subscriptions: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  });

  // Group by market+name, keep newest, delete older duplicates
  const groups: Record<string, typeof allPlans> = {};
  for (const plan of allPlans) {
    const key = `${plan.market}:${plan.name}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(plan);
  }

  // Also delete legacy Turkish-named plans ("Ücretsiz" → replaced by "Free")
  const LEGACY_NAMES = ['Ücretsiz'];

  let deleted = 0;
  for (const [key, plans] of Object.entries(groups)) {
    // Delete legacy-named plans
    for (const plan of plans) {
      if (LEGACY_NAMES.includes(plan.name)) {
        if (plan.subscriptions.length === 0) {
          await prisma.subscriptionPlan.delete({ where: { id: plan.id } });
          console.log(`  Deleted legacy: ${plan.name} (${plan.market})`);
          deleted++;
        } else {
          console.warn(`  SKIP legacy: ${plan.name} (${plan.market}) — ${plan.subscriptions.length} subscriptions attached`);
        }
      }
    }

    // If duplicates exist (same name+market), keep newest, delete older
    const nonLegacy = plans.filter((p) => !LEGACY_NAMES.includes(p.name));
    if (nonLegacy.length > 1) {
      // Keep the last one (newest by createdAt), delete older
      const toDelete = nonLegacy.slice(0, -1);
      for (const plan of toDelete) {
        if (plan.subscriptions.length === 0) {
          await prisma.subscriptionPlan.delete({ where: { id: plan.id } });
          console.log(`  Deleted duplicate: ${plan.name} (${plan.market}) — price: ${plan.priceMonthly}`);
          deleted++;
        } else {
          console.warn(`  SKIP duplicate: ${plan.name} (${plan.market}) — ${plan.subscriptions.length} subscriptions attached`);
        }
      }
    }
  }
  console.log(`  Cleanup done: ${deleted} plans removed\n`);
}

async function main() {
  // Step 0: Clean up legacy/duplicate plans before seeding
  await cleanupDuplicates();

  console.log(`Seeding subscription plans for ${PREMIUM_PLANS.length} markets...\n`);

  // Free plans — her market için
  console.log('--- Free Plans ---');
  for (const plan of PREMIUM_PLANS) {
    const action = await upsertPlan(plan.market, plan.currency, 'Free', {
      priceMonthly: null,
      priceYearly: null,
      googleProductId: null,
      appleProductId: null,
      maxCompanyFollows: 1,
      maxSavedJobs: 5,
      maxAlerts: 1,
      dailyViewLimit: 20,
      hasAdvancedFilter: false,
      adFree: false,
      weeklyDigest: false,
      isActive: true,
    });
    console.log(`  [${plan.market}] ${action}: Free`);
  }

  // Premium plans — her market için fiyatlı + store product ID'leri
  console.log('\n--- Premium Plans ---');
  for (const plan of PREMIUM_PLANS) {
    const action = await upsertPlan(plan.market, plan.currency, 'Premium', {
      priceMonthly: plan.priceMonthly,
      priceYearly: plan.priceYearly,
      googleProductId: GOOGLE_PRODUCT_MONTHLY,
      appleProductId: APPLE_PRODUCT_MONTHLY,
      maxCompanyFollows: -1,
      maxSavedJobs: -1,
      maxAlerts: -1,
      dailyViewLimit: -1,
      hasAdvancedFilter: true,
      adFree: true,
      weeklyDigest: true,
      isActive: true,
    });
    console.log(`  [${plan.market}] ${action}: Premium — ${plan.currency} ${plan.priceMonthly}/ay, ${plan.priceYearly}/yıl`);
  }

  console.log(`\nDone! ${PREMIUM_PLANS.length * 2} plans seeded (Free + Premium per market).`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
