import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '../../lib/prisma';
import NotenfinderClient from '../../components/NotenfinderClient';
import CategoryBanner from '../../components/CategoryBanner';

export const metadata: Metadata = {
  title: 'Noten kaufen & Notenfinder | DONAUTON Shop',
  description: 'Durchstöbern Sie unseren Notenfinder nach Blasmusik-Noten, Solostücken und vielem mehr. DONAUTON Shop - Premium Noten & Musik.',
  openGraph: {
    title: 'Noten kaufen & Notenfinder | DONAUTON Shop',
    description: 'Durchstöbern Sie unseren Notenfinder nach Blasmusik-Noten, Solostücken und vielem mehr.',
    type: 'website',
  }
};

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

    let mainBesetzung = besetzung;
    let soloinstrument: string | null = null;
    if (besetzung.includes(',') && besetzung.toLowerCase().includes('solist')) {
      const parts = besetzung.split(',');
      if (parts.length >= 2) {
        soloinstrument = parts[parts.length - 1].trim();
        mainBesetzung = parts.slice(0, parts.length - 1).join(',').trim();
      }
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
    discountPercent: p.discountPercent || 0,
    badge: p.badge || '',
    description: p.description || '',
    sku: p.sku || '',
    audioPreview: p.audioPreview || null,
    pdfPreview: p.pdfPreview || null,
    youtubeUrl: p.youtubeUrl || null,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=565&fit=crop&q=80',
    slug: p.slug,
    category: p.category || 'Noten',
    besetzung: mainBesetzung,
    soloinstrument,
    publisher: p.publisher || 'Donauton'
  };
});

  const bannerSetting = await prisma.shopSetting.findUnique({ where: { key: 'banner_url_noten' } });
  const customBannerUrl = bannerSetting?.value;

  return (
    <div className="container page-container">
      <CategoryBanner 
        title="Notenfinder"
        subtitle="Entdecke unser Repertoire. Filtere ganz einfach nach Genre, Schwierigkeitsgrad oder Autor*in, um genau das richtige Stück für dein Orchester zu finden."
        imageUrl={customBannerUrl || "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200&q=80"}
        gradient="linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
      />
      <Suspense fallback={<div className="animate-pulse" style={{ padding: '2rem', textAlign: 'center' }}>Lädt Katalog...</div>}>
        <NotenfinderClient 
          categories={categories} 
          initialProducts={products} 
        />
      </Suspense>
    </div>
  );
}
