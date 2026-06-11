const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.iugkanczmpqilpfnojxl:fmJq%23AViRp7yWJarrd9@db.iugkanczmpqilpfnojxl.supabase.co:5432/postgres"
    }
  }
});

async function main() {
  const product = await prisma.product.findFirst({
    where: {
      title: {
        contains: 'Schürze'
      }
    }
  });
  console.log("Product Title:", product?.title);
  console.log("Product Sku:", product?.sku);
  console.log("Product Sizes:", product?.sizes);
  console.log("Product Colors:", product?.colors);
  console.log("Product detailsJson:", product?.detailsJson);
  console.log("Product variantsJson:", product?.variantsJson);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
