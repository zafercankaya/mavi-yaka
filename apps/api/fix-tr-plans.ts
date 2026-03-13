import { config } from 'dotenv'; config();
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
(async () => {
  // Deactivate old TR Premium plan (49.99, no subscriptions)
  const result = await p.subscriptionPlan.update({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    data: { isActive: false },
  });
  console.log(`Deactivated: ${result.name} (${result.market}) — ${result.priceMonthly}/${result.priceYearly}`);

  // Verify: count active TR plans
  const activePlans = await p.subscriptionPlan.findMany({
    where: { market: 'TR', isActive: true },
    select: { name: true, priceMonthly: true, priceYearly: true },
  });
  console.log(`\nActive TR plans: ${activePlans.length}`);
  activePlans.forEach(p => console.log(`  ${p.name} — ${p.priceMonthly}/${p.priceYearly}`));

  await p.$disconnect();
})();
