import { config } from 'dotenv'; config();
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
(async () => {
  const plans = await p.subscriptionPlan.findMany({
    where: { market: 'TR' },
    include: { subscriptions: { select: { id: true, userId: true, status: true } } },
    orderBy: { createdAt: 'asc' },
  });
  for (const plan of plans) {
    console.log(`${plan.name} | ${plan.priceMonthly}/${plan.priceYearly} | active=${plan.isActive} | subs=${plan.subscriptions.length} | id=${plan.id}`);
    plan.subscriptions.forEach(s => console.log(`  sub: ${s.userId} (${s.status})`));
  }
  await p.$disconnect();
})();
