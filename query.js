const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const url = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
  console.log("ERP URL SETTING:", url);
}
main().catch(console.error).finally(() => prisma.$disconnect());
