import { prisma } from '../../../lib/prisma';
import { permanentRedirect, notFound } from 'next/navigation';

export default async function LegacyProductRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug }
  });

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
