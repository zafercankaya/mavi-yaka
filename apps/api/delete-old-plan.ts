import { config } from 'dotenv'; config();
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
(async () => {
  // Delete the old deactivated TR Premium plan
  const subs = await p.subscription.count({ where: { planId: '00000000-0000-0000-0000-000000000002' } });
  console.log(`Subscriptions on old plan: ${subs}`);
  if (subs === 0) {
    await p.subscriptionPlan.delete({ where: { id: '00000000-0000-0000-0000-000000000002' } });
    console.log('Deleted old TR Premium plan');
  } else {
    console.log('Cannot delete — subscriptions exist');
  }

  // Verify
  const plans = await p.subscriptionPlan.findMany({
    where: { market: 'TR' },
    select: { name: true, priceMonthly: true, isActive: true },
  });
  console.log(`\nTR plans remaining: ${plans.length}`);
  plans.forEach(p => console.log(`  ${p.name} — ${p.priceMonthly} (active=${p.isActive})`));
  await p.$disconnect();
})();
