const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key'} }).then(s => console.log(s.value)).catch(console.error).finally(() => prisma.$disconnect());
