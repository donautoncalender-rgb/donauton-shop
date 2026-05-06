'use client';

import Link from 'next/link';
import { useRef } from 'react';

export default function MiniProductSlider({ title, linkAll, products }: { title: string, linkAll: string, products: any[] }) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const slideLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const slideRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ marginBottom: '4rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 5%' }}>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{title}</h3>
        {linkAll && (
          <Link href={linkAll} style={{ color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Alle anzeigen
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </Link>
        )}
      </div>

      <div style={{ position: 'relative', padding: '0 2%' }}>
        <button 
          onClick={slideLeft} 
          style={{ position: 'absolute', left: '1%', top: '40%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <div 
          ref={sliderRef}
          className="product-slider" 
          style={{ display: 'flex', overflowX: 'auto', gap: '2rem', padding: '1rem 3%', scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .product-slider::-webkit-scrollbar { display: none; }
          `}} />
          {products.map((product) => {
            const pType = product.type || 'noten';
            return (
              <Link href={`/${pType.toLowerCase()}/${product.id}`} key={product.id} className="product-card" style={{ flex: '0 0 auto', width: '230px', textDecoration: 'none', color: 'inherit' }}>
                <div className="product-image-container" style={{ 
                  aspectRatio: '1/1', 
                  padding: '1.2rem',
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <img src={product.image} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div className="product-info" style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{product.genre || pType}</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'auto', lineHeight: 1.2 }}>{product.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{product.price}</span>
                    <span style={{ background: 'var(--border)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <button 
          onClick={slideRight} 
          style={{ position: 'absolute', right: '1%', top: '40%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  );
}
