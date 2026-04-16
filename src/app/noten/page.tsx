import Link from 'next/link';
import { Suspense } from 'react';
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
  
  const products = dbProducts.map(p => {
    let besetzung = 'Sonstige Noten';
    if (p.detailsJson) {
      try {
        const details = JSON.parse(p.detailsJson);
        const bMatch = details.find((d: any) => d.label === 'Besetzung');
        if (bMatch && bMatch.value) besetzung = bMatch.value.trim();
      } catch (e) {}
    }

    return {
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
    sku: p.sku || '',
    audioPreview: p.audioPreview || null,
    pdfPreview: p.pdfPreview || null,
    youtubeUrl: p.youtubeUrl || null,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=565&fit=crop&q=80',
    slug: p.slug,
    category: p.category || 'Noten',
    besetzung,
    publisher: p.publisher || 'Donauton'
  };
});

  return (
    <div className="container page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Notenfinder</h1>
        <p className="page-subtitle">
          Entdecke unser Repertoire. Filtere ganz einfach nach Genre, Schwierigkeitsgrad oder Komponist, um genau das richtige Stück für dein Orchester zu finden.
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse" style={{ padding: '2rem', textAlign: 'center' }}>Lädt Katalog...</div>}>
        <NotenfinderClient categories={categories} initialProducts={products} />
      </Suspense>
    </div>
  );
}
