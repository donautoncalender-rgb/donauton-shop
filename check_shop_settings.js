const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const settings = await prisma.shopSetting.findMany();
    console.log(settings);
}

run().finally(() => prisma.$disconnect());
