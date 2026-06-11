const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      title: {
        contains: 'Zweisame'
      }
    }
  });
  console.log("PRODUCTS FOUND:", JSON.stringify(products, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
