import Link from 'next/link';
import AudioPreviewModal from '../../../components/AudioPreviewModal';
import ScorePreviewModal from '../../../components/ScorePreviewModal';
import AddToCartButton from '../../../components/AddToCartButton';
import ActionButtons from '../../../components/ActionButtons';
import ProductGallery from '../../../components/ProductGallery';
import ProductDetailsList from '../../../components/ProductDetailsList';
import { prisma } from '../../../lib/prisma';
import { notFound } from 'next/navigation';

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!product) {
    notFound();
  }

  const title = product.title;
  const image = product.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?fit=crop&w=400&h=565&q=80';

  return (
    <div className="container page-container">
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

      <div className="product-detail-layout animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '4rem', alignItems: 'start' }}>
        
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

          {(product.audioPreview || product.pdfPreview || product.category === 'Noten') && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '0.6rem', marginTop: '-1rem' }}>
               {product.audioPreview && <AudioPreviewModal title={title} audioUrl={product.audioPreview} />}
               {product.pdfPreview && <ScorePreviewModal title={title} pdfUrl={product.pdfPreview} />}
               <ActionButtons 
                 youtubeUrl={product.youtubeUrl} 
                 product={{ id: product.id.toString(), title: product.title, price: product.price, image: product.imageUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?fit=crop&w=400&h=565&q=80', slug: product.slug, composer: product.composer || product.artist || product.author, category: product.category }} 
               />
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', fontWeight: 800 }}>Informationen zum Produkt</h3>
            <div style={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#333' }} dangerouslySetInnerHTML={{ __html: product.description || 'Keine Beschreibung verfügbar.' }} />
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
          <div style={{ background: '#f5f5f5', border: '1px solid #e1e1e1', borderRadius: '4px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#111', lineHeight: 1 }}>
                {product.price.replace(' €', '')} <span style={{ fontSize: '1.8rem', verticalAlign: 'top' }}>€</span>
              </div>
            </div>
            
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>
              inkl. MwSt. <a href="/versand" style={{ color: '#0066cc', textDecoration: 'none' }}>zzgl. Versandkosten</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '0.5rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: product.stockStatus === 'instock' ? '#00a651' : '#eab308', flexShrink: 0, marginTop: '3px', position: 'relative' }}>
                {product.stockStatus === 'instock' ? (
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                   <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                )}
              </div>
              <div>
                <strong style={{ color: product.stockStatus === 'instock' ? '#00a651' : '#eab308', fontSize: '1rem', display: 'block', marginBottom: '2px' }}>
                  {product.stockStatus === 'instock' ? 'Sofort lieferbar' : 'Auf Anfrage'}
                </strong>
              </div>
            </div>

            {/* Huge Cart Button */}
            <div style={{ marginTop: '2rem', width: '100%' }}>
               <AddToCartButton size="large" product={{ id: product.id, title: product.title, price: product.price, image: image }} />
            </div>

            {/* Guarantees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e1e1e1', fontSize: '0.9rem', color: '#333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                <strong>30 Tage Money-Back Garantie</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <strong>3 Jahre DONAUTON Garantie</strong>
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>
    </div>
  );
}
