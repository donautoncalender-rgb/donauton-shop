import { prisma } from '../../../lib/prisma';
import { permanentRedirect, notFound } from 'next/navigation';

export default async function LegacyProductRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  let product = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug }
  });

  if (!product) {
    const parts = resolvedParams.slug.split('-');
    
    // Try matching the first 4 words
    if (!product && parts.length >= 4) {
      product = await prisma.product.findFirst({ where: { slug: { startsWith: parts.slice(0, 4).join('-') } } });
    }
    
    // Try matching the first 3 words
    if (!product && parts.length >= 3) {
      product = await prisma.product.findFirst({ where: { slug: { startsWith: parts.slice(0, 3).join('-') } } });
    }
    
    // Try matching the first 2 words
    if (!product && parts.length >= 2) {
      product = await prisma.product.findFirst({ where: { slug: { startsWith: parts.slice(0, 2).join('-') } } });
    }
    
    // Try matching just the first word (if it's long enough to avoid false positives)
    if (!product && parts.length >= 1 && parts[0].length > 3) {
      product = await prisma.product.findFirst({ where: { slug: { startsWith: parts[0] } } });
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

  permanentRedirect(`/${catPath}/${product.slug}`);
}
