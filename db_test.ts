import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const shopSettings = await prisma.shopSetting.findMany();
  console.log("Shop settings:", shopSettings);
  
  // Since we also have access to the suite database, maybe we can query SystemSetting if the schema is synced
  try {
     const sys = await (prisma as any).systemSetting.findMany();
     console.log("System settings:", sys);
  } catch (e) {
     console.log("SystemSetting not available in this Prisma client.");
  }
}
run().finally(() => prisma.$disconnect());
