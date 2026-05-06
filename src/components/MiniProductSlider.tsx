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
          style={{ display: 'flex', overflowX: 'auto', gap: '1.2rem', padding: '1rem 3%', scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style dangerouslySetInnerHTML={{__html: `
            .product-slider::-webkit-scrollbar { display: none; }
          `}} />
          {products.map((product) => {
            const pType = product.type || 'noten';
            return (
              <Link href={`/${pType.toLowerCase()}/${product.id}`} key={product.id} className="product-card" style={{ flex: '0 0 auto', width: '190px', textDecoration: 'none', color: 'inherit' }}>
                <div className="product-image-container" style={{ 
                  aspectRatio: '1/1.4', 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.04)'
                }}>
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                {/* Rundel-like quick action row */}
                <div style={{ display: 'flex', gap: '0.8rem', padding: '0.5rem 0.2rem', borderBottom: '1px solid #f1f5f9', color: '#94a3b8', justifyContent: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
                </div>

                <div className="product-info" style={{ padding: '0.6rem 0.2rem 0', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>{product.genre || pType}</div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'auto', lineHeight: 1.2 }}>{product.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{product.price}</span>
                    <span style={{ background: 'var(--border)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
