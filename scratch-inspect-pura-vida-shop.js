const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: {
      title: { contains: 'Pura Vida' }
    }
  });

  if (!product) {
    console.log("No product found in Shop database");
    return;
  }

  console.log("Product:", {
    id: product.id,
    title: product.title,
    sku: product.sku,
    hasDigitalDownload: product.hasDigitalDownload,
    variantsJson: product.variantsJson ? JSON.parse(product.variantsJson) : null
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
