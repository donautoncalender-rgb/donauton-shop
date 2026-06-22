import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import ProductCard from '../../components/ProductCard';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }> | { q?: string };
}

export default async function SuchePage({ searchParams }: SearchPageProps) {
  const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
  const q = (resolvedParams?.q || '').trim();

  let dbProducts: any[] = [];
  
  if (q !== '') {
    dbProducts = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { composer: { contains: q, mode: 'insensitive' } },
          { artist: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } }
        ]
      }
    });
  }

  const products = dbProducts.map((p: any) => ({
    id: p.id,
    wooId: p.wooId,
    title: p.title,
    slug: p.slug,
    category: p.category || 'Noten',
    price: p.price,
    discountPercent: p.discountPercent || 0,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    composer: p.composer || p.artist || '',
    artist: p.artist || p.composer || '',
    description: p.description || '',
    badge: p.badge || '',
    stockStatus: p.stockStatus || 'instock',
    audioPreview: p.audioPreview || null,
    pdfPreview: p.pdfPreview || null,
    youtubeUrl: p.youtubeUrl || null,
    genre: p.genre || '',
    grade: p.grade || null,
    duration: p.duration || null,
    instrumentation: p.instrumentation || null
  }));

  return (
    <div className="container page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Suchergebnisse</h1>
        <p className="page-subtitle">
          {q === '' ? (
            'Bitte geben Sie einen Suchbegriff ein.'
          ) : products.length === 0 ? (
            `Für „${q}“ konnten leider keine passenden Artikel gefunden werden.`
          ) : products.length === 1 ? (
            `Es wurde 1 passender Artikel für „${q}“ gefunden.`
          ) : (
            `Es wurden ${products.length} passende Artikel für „${q}“ gefunden.`
          )}
        </p>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#718096', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginTop: '2rem' }}>
          <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ margin: '0 auto 1.5rem', opacity: 0.5, color: 'var(--accent)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2d3748', marginBottom: '0.5rem' }}>Keine Ergebnisse</h3>
          <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem' }}>Probieren Sie es mit einem anderen Suchbegriff oder stöbern Sie in unseren Kategorien.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/noten" className="btn btn-primary">Noten ansehen</Link>
            <Link href="/" className="btn btn-secondary">Zur Startseite</Link>
          </div>
        </div>
      ) : (
        <div className="product-grid animate-fade-in" style={{ marginTop: '2rem' }}>
          {products.map((product) => (
            <div key={product.id} style={{ position: 'relative' }}>
              <span 
                style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  left: '12px', 
                  background: 'rgba(0,0,0,0.75)', 
                  color: 'white', 
                  fontSize: '0.65rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  zIndex: 20,
                  letterSpacing: '0.5px'
                }}
              >
                {product.category}
              </span>
              <ProductCard product={product} viewMode="grid" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
