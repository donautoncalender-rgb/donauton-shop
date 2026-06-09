import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../lib/prisma';
import ProductCard from '../../../components/ProductCard';

interface ComposerPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ComposerPageProps): Promise<Metadata> {
  const { slug } = params;
  const composer = await prisma.composer.findUnique({
    where: { slug }
  });

  if (!composer) {
    return {
      title: 'Komponist nicht gefunden | DONAUTON Shop'
    };
  }

  return {
    title: `${composer.name} - Komponisten-Portrait | DONAUTON Shop`,
    description: composer.biography 
      ? composer.biography.substring(0, 160) + '...' 
      : `Entdecken Sie das Profil und die Werke von ${composer.name} im DONAUTON Shop.`,
    openGraph: {
      title: `${composer.name} - Komponisten-Portrait`,
      description: composer.biography ? composer.biography.substring(0, 160) + '...' : undefined,
      type: 'profile',
      images: composer.portraitUrl ? [{ url: composer.portraitUrl }] : undefined
    }
  };
}

export default async function ComposerPage({ params }: ComposerPageProps) {
  const { slug } = params;
  const composer = await prisma.composer.findUnique({
    where: { slug }
  });

  if (!composer) {
    notFound();
  }

  // Fetch all products by this composer
  const dbProducts = await prisma.product.findMany({
    where: {
      composer: composer.name
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Map products for ProductCard
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

  // Format dates helper
  const formatDateGerman = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const hasDates = composer.birthDate || composer.deathDate;

  return (
    <div className="container page-container">
      {/* Breadcrumbs */}
      <nav style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '2rem' }}>
        <Link href="/" className="hover:text-accent">Startseite</Link>
        <span style={{ margin: '0 0.5rem' }}>&gt;</span>
        <span style={{ color: 'var(--text-light)' }}>Unsere Komponisten</span>
        <span style={{ margin: '0 0.5rem' }}>&gt;</span>
        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{composer.name}</span>
      </nav>

      {/* Profile Header */}
      <div 
        style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
          padding: '2.5rem',
          marginBottom: '3rem',
          display: 'flex',
          gap: '2.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        {/* Profile Image */}
        <div 
          style={{ 
            width: '180px', 
            height: '180px', 
            borderRadius: '50%', 
            overflow: 'hidden',
            flexShrink: 0,
            border: '3px solid var(--border)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
          }}
        >
          {composer.portraitUrl ? (
            <img 
              src={composer.portraitUrl} 
              alt={composer.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            <span style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-light)', opacity: 0.6 }}>
              {composer.name.split(' ').map(n => n[0]).join('')}
            </span>
          )}
        </div>

        {/* Profile Details */}
        <div style={{ flex: '1 1 300px' }}>
          <span 
            style={{ 
              display: 'inline-block',
              padding: '0.3rem 0.8rem',
              backgroundColor: 'rgba(205, 23, 25, 0.1)',
              border: '1px solid rgba(205, 23, 25, 0.2)',
              borderRadius: '20px',
              color: 'var(--accent)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '0.8rem'
            }}
          >
            Komponisten-Portrait
          </span>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--primary)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            {composer.name}
          </h1>
          {hasDates && (
            <div style={{ fontSize: '1.05rem', color: 'var(--text-light)', fontWeight: 500, display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {composer.birthDate && (
                <span>
                  <strong>Geboren:</strong> {formatDateGerman(composer.birthDate)}
                </span>
              )}
              {composer.deathDate && (
                <span>
                  <strong>Gestorben:</strong> {formatDateGerman(composer.deathDate)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Biography Content */}
      {composer.biography && (
        <div style={{ marginBottom: '4rem' }}>
          <h2 
            style={{ 
              fontSize: '1.6rem', 
              fontWeight: 800, 
              color: 'var(--primary)', 
              marginBottom: '1.2rem',
              borderBottom: '2px solid var(--border)',
              paddingBottom: '0.5rem'
            }}
          >
            Biografie
          </h2>
          <div 
            style={{ 
              fontSize: '1.1rem', 
              lineHeight: '1.8', 
              color: 'var(--text-light)', 
              whiteSpace: 'pre-line',
              textAlign: 'justify'
            }}
          >
            {composer.biography}
          </div>
        </div>
      )}

      {/* Compositions List */}
      <div>
        <h2 
          style={{ 
            fontSize: '1.6rem', 
            fontWeight: 800, 
            color: 'var(--primary)', 
            marginBottom: '1.8rem',
            borderBottom: '2px solid var(--border)',
            paddingBottom: '0.5rem'
          }}
        >
          Werke im Shop von {composer.name}
        </h2>

        {products.length === 0 ? (
          <div 
            style={{ 
              textAlign: 'center', 
              padding: '3rem', 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '12px',
              color: 'var(--text-light)' 
            }}
          >
            <p style={{ margin: 0, fontWeight: 500 }}>
              Aktuell sind keine separaten Notenausgaben für diesen Komponisten im Shop gelistet.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} viewMode="grid" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
