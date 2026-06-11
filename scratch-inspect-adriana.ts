import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== COMPOSERS ===");
  const composers = await prisma.composer.findMany();
  console.log(JSON.stringify(composers, null, 2));

  console.log("=== PRODUCTS FOR ADRIANA ===");
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: 'Bärnd' } },
        { composer: { contains: 'Adriana' } },
        { artist: { contains: 'Adriana' } },
        { author: { contains: 'Adriana' } }
      ]
    }
  });
  console.log(JSON.stringify(products.map(p => ({
    id: p.id,
    title: p.title,
    composer: p.composer,
    artist: p.artist,
    author: p.author
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
