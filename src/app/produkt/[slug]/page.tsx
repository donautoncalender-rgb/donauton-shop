import { prisma } from '../../../lib/prisma';
import { permanentRedirect, notFound } from 'next/navigation';

export default async function LegacyProductRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  let product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!product) {
    // Old WooCommerce slugs often appended "-von-composer" or "-donauton-verlag".
    // We try to match the first 2-3 significant words of the slug.
    const words = resolvedParams.slug.split('-').filter(w => w !== 'von' && w !== 'der' && w.length > 2).slice(0, 3);
    if (words.length > 0) {
      product = await prisma.product.findFirst({
        where: {
          AND: words.map(w => ({
            slug: { contains: w }
          }))
        }
      });
    }
  }

  if (!product) {
    notFound();
  }

  let catPath = 'noten';
  const c = product.category?.toLowerCase() || '';
  if (c.includes('cd')) catPath = 'cds';
  else if (c.includes('buch') || c.includes('bücher')) catPath = 'buecher';
  else if (c.includes('merch')) catPath = 'merch';
  else if (c.includes('ticket')) catPath = 'tickets';

  permanentRedirect(`/${catPath}/${product.id}`);
}
