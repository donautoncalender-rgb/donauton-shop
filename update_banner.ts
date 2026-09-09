import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const text = 'WICHTIG: Von Di. 04. August bis Di. 18. August 2026 befinden wir uns im Betriebsurlaub. Bestellungen werden danach wieder bearbeitet!';
  
  await prisma.shopSetting.upsert({
    where: { key: 'announcement_text' },
    update: { value: text },
    create: { key: 'announcement_text', value: text }
  });
  
  console.log('Announcement banner updated successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
