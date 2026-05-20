import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const s = await prisma.shopSetting.findUnique({ where: { key: 'seq_order' } });
    console.log("seq_order is:", s);
}
main().catch(console.error).finally(() => prisma.$disconnect());
