import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import NotenfinderClient from '../../components/NotenfinderClient';

export default async function Notenfinder() {
  const categories = await prisma.shopCategory.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: 'asc' }
  });
  const dbProducts = await prisma.product.findMany({
    where: { category: 'Noten' }
  });
  
  const products = dbProducts.map(p => ({
    id: p.id,
    wooId: p.wooId,
    genre: p.genre || 'Ohne Genre',
    title: p.title,
    composer: p.composer || '',
    grade: p.grade || '',
    duration: p.duration || '',
    price: p.price,
    badge: p.badge || '',
    description: p.description || '',
    image: p.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=565&fit=crop&q=80',
    slug: p.slug
  }));

  return (
    <div className="container page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Notenfinder</h1>
        <p className="page-subtitle">
          Entdecke unser Repertoire. Filtere ganz einfach nach Genre, Schwierigkeitsgrad oder Komponist, um genau das richtige Stück für dein Orchester zu finden.
        </p>
      </div>

      <NotenfinderClient categories={categories} initialProducts={products} />
    </div>
  );
}
