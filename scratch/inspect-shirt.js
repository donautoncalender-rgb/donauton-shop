const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findFirst({
    where: {
      sku: 'DTM-0003'
    }
  });

  if (!product) {
    console.log("No product found in Shop database for DTM-0003");
    return;
  }

  console.log("Product:", {
    id: product.id,
    title: product.title,
    sku: product.sku,
    sizes: product.sizes,
    colors: product.colors,
    detailsJson: product.detailsJson,
    variantsJson: product.variantsJson ? JSON.parse(product.variantsJson) : null
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
