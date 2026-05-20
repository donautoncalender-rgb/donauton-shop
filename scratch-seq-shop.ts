import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const nextOrderNumber = await prisma.$transaction(async (tx) => {
        let setting = await tx.shopSetting.findUnique({ where: { key: 'seq_order' } });
        let nextVal = 1;
        if (setting) {
            nextVal = parseInt(setting.value) + 1;
            await tx.shopSetting.update({ where: { key: 'seq_order' }, data: { value: nextVal.toString() } });
        } else {
            await tx.shopSetting.create({ data: { key: 'seq_order', value: '2' } }); // value is next after 1
        }
        return nextVal;
    });
    console.log(`Next order number: B-${nextOrderNumber.toString().padStart(4, '0')}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
