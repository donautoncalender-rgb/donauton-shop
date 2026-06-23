import type { Metadata } from 'next';
import Link from 'next/link';
import AudioPreviewModal from '../../../components/AudioPreviewModal';
import ScorePreviewModal from '../../../components/ScorePreviewModal';
import AddToCartButton from '../../../components/AddToCartButton';
import ActionButtons from '../../../components/ActionButtons';
import ProductGallery from '../../../components/ProductGallery';
import ProductDetailsList from '../../../components/ProductDetailsList';
import MiniProductSlider from '../../../components/MiniProductSlider';
import SimpleBuyBox from '../../../components/SimpleBuyBox';
import GpsrSection from '../../../components/GpsrSection';
import TracklistPlayer from '../../../components/TracklistPlayer';
import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await prisma.product.findFirst({
    where: { 
      OR: [
        { slug: resolvedParams.slug },
        { id: resolvedParams.slug }
      ]
    }
  });

  if (!product) {
    return { title: 'Produkt nicht gefunden | DONAUTON' };
  }

  const title = `${product.title} - ${product.category} kaufen | DONAUTON`;
  const description = product.description 
    ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...'
    : `Entdecken Sie ${product.title} im DONAUTON Shop.`;
    
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    }
  };
}

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findFirst({
    where: { 
      OR: [
        { slug: resolvedParams.slug },
        { id: resolvedParams.slug }
      ]
    }
  });

  if (!product) {
    notFound();
  }

  const title = product.title;
  const image = product.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?fit=crop&w=400&h=565&q=80';

  let relatedProductsRaw = await prisma.product.findMany({
    where: {
      category: product.category,
      id: { not: product.id },
      ...(product.genre && product.genre !== 'Ohne Genre' ? { genre: product.genre } : {})
    },
    take: 10
  });

  if (relatedProductsRaw.length < 4) {
    const moreProducts = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id, notIn: relatedProductsRaw.map(p => p.id) }
      },
      take: 10 - relatedProductsRaw.length
    });
    relatedProductsRaw = [...relatedProductsRaw, ...moreProducts];
  }

  const sliderProducts = relatedProductsRaw.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?fit=crop&w=400&h=565&q=80',
    price: p.price,
    genre: p.genre,
    type: p.category,
    badge: p.badge || undefined
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": image,
    "description": product.description?.replace(/<[^>]*>?/gm, '') || `DONAUTON ${product.category} - ${product.title}`,
    "offers": {
      "@type": "Offer",
      "url": `https://donauton-shop.vercel.app/${product.category.toLowerCase()}/${product.slug}`,
      "priceCurrency": "EUR",
      "price": product.price.replace(' €', '').replace('.', '').replace(',', '.'),
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stockStatus === 'instock' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "DONAUTON"
      }
    }
  };

  return (
    <div className="container page-container">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* -----------------------------
          PRINT-ONLY, DEDICATED LAYOUT 
         ----------------------------- */}
      <div className="print-only">
        <div style={{ padding: '0', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
          <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '15px' }}>
            <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: '0 0 5px 0' }}>{title}</h1>
            {(product.composer || product.artist || product.author) && (
              <div style={{ fontSize: '12pt', color: '#444' }}>von <strong>{product.composer || product.artist || product.author}</strong></div>
            )}
            <div style={{ fontSize: '16pt', fontWeight: 'bold', marginTop: '10px' }}>Preis: {product.price}</div>
          </div>
          <div style={{ marginBottom: '20px' }}>
             <ProductDetailsList detailsJson={product.detailsJson} category={product.category} genre={product.genre} sku={product.sku} />
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ width: '250px', flexShrink: 0 }}>
              <img src={image} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} alt={title} />
            </div>
            <div style={{ flexGrow: 1 }}>
              <h3 style={{ fontSize: '14pt', margin: '0 0 10px 0', fontWeight: 'bold' }}>Informationen zum Produkt</h3>
              <div style={{ fontSize: '10pt', lineHeight: '1.4' }} dangerouslySetInnerHTML={{ __html: product.description || 'Keine Beschreibung verfügbar.' }} />
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------------
          SCREEN-ONLY LAYOUT 
         ----------------------------- */}
      <div className="screen-only">
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
        <Link href="/">Startseite</Link> &rsaquo; <Link href={`/${product.category.toLowerCase()}`}>{product.category}</Link> &rsaquo; <span style={{ color: 'var(--text)', fontWeight: 600 }}>{title}</span>
      </div>

      <div className="product-detail-layout animate-fade-in">
        
        {/* Left Column - Gallery, Audio/PDF, Action Buttons, Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <div className="product-gallery" style={{ border: 'none', background: 'transparent', padding: 0, position: 'relative' }}>
            <ProductGallery 
              altTitle={title}
              badge={product.badge || undefined}
              images={
                [
                  image,
                  ...(product.galleryImages ? JSON.parse(product.galleryImages) : [])
                ]
              }
            />
          </div>

          <div className="action-buttons-container no-print" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '0.6rem', marginTop: '-1rem' }}>
             {product.audioPreview && <AudioPreviewModal title={title} audioUrl={product.audioPreview} />}
             {product.pdfPreview && <ScorePreviewModal title={title} pdfUrl={product.pdfPreview} />}
             <ActionButtons 
               youtubeUrl={product.youtubeUrl} 
               product={{ id: product.id.toString(), title: product.title, price: product.price, image: product.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?fit=crop&w=400&h=565&q=80', slug: product.slug, composer: product.composer || product.artist || product.author, category: product.category }} 
             />
          </div>

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', fontWeight: 800 }}>Informationen zum Produkt</h3>
            <div style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#333' }} dangerouslySetInnerHTML={{ __html: product.description || 'Keine Beschreibung verfügbar.' }} />
            <TracklistPlayer tracksJson={product.trackListJson} />
            <GpsrSection publisher={product.publisher} />
          </div>
        </div>

        {/* Right Column - Thomann Style Buy Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
          
          <div className="product-header" style={{ containerType: 'inline-size', width: '100%' }}>
            {/* Title & Brand */}
            {(() => {
              return (
                <h1 style={{ 
                  fontSize: `clamp(1.2rem, calc(100cqi / (${title.length > 20 ? 20 : title.length} * 0.65)), 2.5rem)`, 
                  fontWeight: 900, 
                  lineHeight: 1.2, 
                  marginBottom: '1.2rem',
                  color: '#111',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <span style={{ position: 'relative', display: 'inline-block', zIndex: 1 }}>
                    {title}
                    <svg width="100%" height="16" viewBox="0 0 300 16" preserveAspectRatio="none" style={{ position: 'absolute', bottom: '-6px', left: 0, width: '100%', zIndex: -1, overflow: 'visible' }}>
                       <path d="M 2 8 Q 150 12 295 6 M 5 11 Q 120 4 292 9" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </h1>
              );
            })()}
            
            {(product.composer || product.artist || product.author) && (
              <div style={{ fontSize: '1.1rem', color: '#555', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>von <strong>{product.composer || product.artist || product.author}</strong></span>
              </div>
            )}
            
            {/* Dynamic Product Details */}
            <ProductDetailsList 
              detailsJson={product.detailsJson} 
              category={product.category} 
              genre={product.genre} 
              sku={product.sku} 
            />
          </div>

          {/* BUY BOX */}
          <SimpleBuyBox 
            product={{
              id: product.id,
              title: product.title,
              price: product.price,
              image: image,
              stockStatus: product.stockStatus,
              category: product.category,
              discountPercent: product.discountPercent || 0
            }}
            selectedVariant="CD"/>

        </div>
      </div>
      
      {/* RELATED PRODUCTS */}
      {sliderProducts.length > 0 && (
        <div className="no-print" style={{ marginTop: '5rem' }}>
          <MiniProductSlider 
            title="Ähnliche Artikel" 
            linkAll={`/${product.category.toLowerCase()}`} 
            products={sliderProducts} 
          />
        </div>
      )}

      </div>
    </div>
  );
}
