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

  return (
    <div 
      className={`product-card ${isList ? 'product-card-list' : ''}`} 
      style={{ 
        display: 'flex', 
        flexDirection: isList ? 'row' : 'column',
        alignItems: isList ? 'stretch' : 'normal',
        gap: isList ? '2rem' : '0'
      }}
    >
      {/* Absolute Wishlist Button - Adjusted for List View if necessary */}
      <button 
        aria-label="Zur Merkliste"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist({
            id: product.id.toString(),
            title: product.title,
            price: product.price,
            image: product.image,
            slug: product.slug,
            composer: product.composer,
            category: 'Noten'
          });
        }}
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
          color: isInWishlist(product.id.toString()) ? 'var(--accent)' : 'var(--text-light)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 3,
          transition: 'all 0.2s ease'
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist(product.id.toString()) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <Link href={`/${product.category === 'Bücher' ? 'buecher' : product.category === 'CDs' ? 'cds' : 'noten'}/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: isList ? 'row' : 'column', flexGrow: 1, gap: isList ? '2rem' : '0' }}>
        
        {/* IMAGE */}
        <div className="product-image-container" style={{ 
          position: 'relative', 
          width: isList ? '200px' : '100%', 
          flexShrink: 0
        }}>
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <img src={product.image} alt={product.title} className="product-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        {/* INFO */}
        <div className="product-info" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1
        }}>
          <div className="product-genre">{product.genre}</div>
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
          
          {/* THE NEW SHORT DESCRIPTION FOR LIST VIEW */}
          {isList && product.description && (
            <div style={{
              marginTop: '1.2rem',
              color: 'var(--text-light)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {/* Strip HTML tags if description is stored as HTML */}
              {product.description.replace(/<[^>]*>?/gm, '')}
            </div>
          )}
        </div>
      </Link>
      
      {/* BOTTOM / ACTION ITEMS */}
      <div className="product-bottom" style={{ 
        padding: isList ? '2rem' : '0 1.5rem 1.5rem', 
        marginTop: isList ? '0' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isList ? 'flex-end' : 'flex-start',
        justifyContent: isList ? 'center' : 'flex-start',
        borderLeft: isList ? '1px solid var(--border)' : 'none',
        minWidth: isList ? '250px' : 'auto'
      }}>
        <div className="product-price">{product.price}</div>
        <button 
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart({
              id: product.id.toString(),
              title: product.title,
              price: parseFloat(product.price.replace(',', '.')),
              quantity: 1,
              variant: 'Gedruckte Ausgabe', // Default variant
              image: product.image
            });
            toggleCart();
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          In den Warenkorb
        </button>
      </div>
    </div>
  );
}
