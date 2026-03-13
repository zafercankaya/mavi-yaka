require('dotenv').config({ path: require('path').resolve(__dirname, '../../api/.env') });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.crawlSource.findMany({
  include: { brand: { select: { name: true } } },
  where: { brand: { name: { in: ['Toyota', 'Volvo', 'Volkswagen', 'Boyner', 'Kia'] } } },
}).then((ss) => {
  ss.forEach((s) => console.log(s.id, '|', s.brand.name, '|', s.crawlMethod));
  p.$disconnect();
});
