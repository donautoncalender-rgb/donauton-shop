const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const s1 = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' } });
  const s2 = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' } });
  console.log({ erpUrl: s1?.value, erpKey: s2?.value ? "Set" : "Not set" });
}
main().catch(console.error).finally(() => prisma.$disconnect());
