'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: any;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const { addToCart, toggleCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const isList = viewMode === 'list';
  const isMerked = isInWishlist(product.id.toString());

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id.toString(),
      title: product.title,
      price: parseFloat(product.price.replace(',', '.')),
      quantity: 1,
      variant: 'Gedruckte Ausgabe',
      image: product.image
    });
    toggleCart();
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id.toString(),
      title: product.title,
      price: product.price,
      image: product.image,
      slug: product.slug,
      composer: product.composer,
      category: product.category || 'Noten'
    });
  };

  // Helper functions for action buttons (bypassing modals for direct native windows)
  const openAudioPlayer = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.audioPreview) return;
    const url = `/player?url=${encodeURIComponent(product.audioPreview)}&title=${encodeURIComponent(product.title)}`;
    window.open(url, 'AudioPlayerWindow', 'width=450,height=300,resizable=yes,scrollbars=no,status=no,menubar=no');
  };

  const openPdfViewer = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!product.pdfPreview) return;
    const url = `/pdf-preview?url=${encodeURIComponent(product.pdfPreview)}&title=${encodeURIComponent(product.title)}`;
    window.open(url, 'PdfPreviewWindow', 'width=1000,height=800,resizable=yes,scrollbars=yes');
  };

  const openYoutube = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (product.youtubeUrl) window.open(product.youtubeUrl, '_blank');
  };

  const shareProduct = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `DONAUTON - ${product.title}`,
        url: `${window.location.origin}/${product.category?.toLowerCase() || 'noten'}/${product.id}`,
      }).catch(console.error);
    } else {
      alert('Teilen wird in diesem Browser nicht unterstützt. Kopiere einfach die URL!');
    }
  };

  const printSheet = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    window.print();
  };


  // --------------------------------------------------------------------------------
  // LIST VIEW LAYOUT (RUNDEL STYLE)
  // --------------------------------------------------------------------------------
  if (isList) {
    const RundelButton = ({ icon, label, onClick }: any) => (
      <button 
        onClick={onClick}
        className="rundel-btn"
        style={{
          width: '100%',
          backgroundColor: '#eaeaea',
          color: 'var(--accent)',
          border: 'none',
          padding: '0.8rem 1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.95rem',
          transition: 'background-color 0.2s',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d8d8d8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eaeaea'}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
          {icon}
        </div>
        <span>{label}</span>
      </button>
    );

    return (
      <Link href={`/${product.category?.toLowerCase() === 'bücher' ? 'buecher' : product.category?.toLowerCase() === 'cds' ? 'cds' : 'noten'}/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div 
          className="product-card-list RundelLayout"
          style={{ 
            display: 'flex', 
            flexDirection: 'row',
            alignItems: 'stretch',
            gap: '2rem',
            padding: '1.5rem',
            backgroundColor: 'white',
            border: '1px solid #eee',
            borderTop: '3px solid transparent',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            transition: 'border-color 0.3s, box-shadow 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderTopColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderTopColor = 'transparent';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
          }}
        >
          {/* LEFT: IMAGE */}
          <div style={{ width: '180px', flexShrink: 0, position: 'relative', minHeight: '220px', display: 'flex', alignItems: 'flex-start' }}>
            {product.badge && <span className="product-badge" style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>{product.badge}</span>}
            <img src={product.image} alt={product.title} style={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
          </div>

          {/* MIDDLE: INFO */}
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            {product.besetzung && (
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                {product.besetzung}
              </div>
            )}
            <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>
              {product.composer || product.author}
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#111', margin: '0 0 1rem 0' }}>
              {product.title}
            </h3>
            
            {product.description && (
              <div style={{ 
                fontSize: '0.95rem', 
                color: '#555', 
                lineHeight: '1.6', 
                display: '-webkit-box', 
                WebkitLineClamp: 3, 
                WebkitBoxOrient: 'vertical', 
                overflow: 'hidden', 
                marginBottom: '1.5rem' 
              }}>
                {product.description.replace(/<[^>]*>?/gm, '')}
              </div>
            )}

            <div style={{ fontSize: '0.9rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto' }}>
              <div style={{ fontWeight: 600 }}>{product.genre || product.category || 'Blasorchester'}</div>
              {product.grade && <div>Stufe {product.grade}</div>}
              {product.sku && <div style={{ color: '#888' }}>{product.sku}</div>}
              {product.publisher && product.publisher !== 'Donauton' && (
                <div style={{ color: '#888', marginTop: '0.2rem', paddingtop: '0.2rem', borderTop: '1px solid #eee' }}>
                  Verlag: {product.publisher}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: BUTTONS */}
          <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* Main Buy Button */}
            <button 
              onClick={handleAddToCart}
              style={{
                width: '100%',
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '1rem 1.2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1.5"></circle><circle cx="20" cy="21" r="1.5"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>{product.price}</span>
            </button>

            {/* Secondary Buttons stacked tight */}
            <RundelButton 
              label={isMerked ? 'Gemerkt' : 'Merken'} 
              onClick={handleWatchlist} 
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill={isMerked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>} 
            />
            {product.audioPreview && (
              <RundelButton 
                label="Hören" 
                onClick={openAudioPlayer} 
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>} 
              />
            )}
            {product.pdfPreview && (
              <RundelButton 
                label="Lesen" 
                onClick={openPdfViewer} 
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>} 
              />
            )}
            {product.youtubeUrl && (
              <RundelButton 
                label="YouTube" 
                onClick={openYoutube} 
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>} 
              />
            )}
            <RundelButton 
              label="Teilen" 
              onClick={shareProduct} 
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>} 
            />
          </div>
        </div>
      </Link>
    );
  }


  // --------------------------------------------------------------------------------
  // GRID VIEW LAYOUT (STANDARD)
  // --------------------------------------------------------------------------------
  return (
    <div className="product-card" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Absolute Wishlist Button */}
      <button 
        aria-label="Zur Merkliste"
        onClick={handleWatchlist}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          border: '1px solid var(--border)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isMerked ? 'var(--accent)' : 'var(--text-light)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 3,
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isMerked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <Link href={`/${product.category?.toLowerCase() === 'bücher' ? 'buecher' : product.category?.toLowerCase() === 'cds' ? 'cds' : 'noten'}/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="product-image-container">
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <img src={product.image} alt={product.title} className="product-image" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        
        <div className="product-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {product.besetzung && (
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              {product.besetzung.substring(0, 25)}{product.besetzung.length > 25 ? '...' : ''}
            </div>
          )}
          <div className="product-genre">{product.genre || 'Ohne Genre'}</div>
          <h3 className="product-title">{product.title}</h3>
          <div className="product-composer">{product.composer || product.author}</div>
          
          <div className="product-meta">
            {product.grade && (
              <span title="Schwierigkeitsgrad">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                Stufe {product.grade}
              </span>
            )}
            {product.duration && (
              <span title="Dauer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {product.duration}
              </span>
            )}
          </div>
          
          {product.publisher && product.publisher !== 'Donauton' && (
            <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.3rem', fontWeight: 500 }}>
              Verlag: {product.publisher}
            </div>
          )}
        </div>
      </Link>
      
      <div className="product-bottom" style={{ padding: '0 1.5rem 1.5rem', marginTop: 'auto' }}>
        <div className="product-price">{product.price}</div>
        <button 
          onClick={handleAddToCart}
          style={{ 
            background: 'var(--accent)', 
            color: 'white', 
            border: 'none', 
            padding: '0.4rem 0.8rem', 
            borderRadius: '30px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.4rem', 
            fontWeight: 600, 
            fontSize: '0.75rem', 
            cursor: 'pointer', 
            transition: 'all 0.3s', 
            textTransform: 'uppercase' 
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
          aria-label="In den Warenkorb"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          In den Warenkorb
        </button>
      </div>
    </div>
  );
}
