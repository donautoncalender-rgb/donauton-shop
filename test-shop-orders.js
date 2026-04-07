const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const latest = await prisma.order.findFirst({ orderBy: { createdAt: 'desc' } });
  console.log(JSON.stringify(latest, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
