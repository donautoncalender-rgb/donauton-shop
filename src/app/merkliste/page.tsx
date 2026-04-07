'use client';

import Link from 'next/link';
import { useWishlist } from '../../context/WishlistContext';

export default function MerklistePage() {
  const { items, toggleWishlist } = useWishlist();

  return (
    <div className="page-container container animate-fade-in" style={{ paddingTop: '160px', minHeight: '60vh', paddingBottom: '6rem' }}>
      <div className="page-header" style={{ borderBottom: 'none', marginBottom: '2rem', textAlign: 'center' }}>
        <h1 className="page-title">Deine <span style={{ color: 'var(--accent)' }}>Merkliste</span></h1>
        <p className="page-subtitle" style={{ margin: '0 auto' }}>
          {items.length === 0 
            ? 'Speichere deine Lieblingsstücke und finde sie hier jederzeit wieder.'
            : `${items.length} Artikel gespeichert`
          }
        </p>
      </div>

      {items.length === 0 ? (
        <div style={{ padding: '4rem 2rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1.5rem', opacity: 0.5 }}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Noch keine Favoriten gespeichert</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2.5rem' }}>Stöbere durch unser Sortiment und markiere Werke mit dem Herz-Icon, um sie auf deiner Merkliste zu speichern.</p>
          
          <Link href="/noten" className="btn btn-primary">
            Jetzt Noten entdecken
          </Link>
        </div>
      ) : (
        <div className="product-grid" style={{ marginTop: '2rem' }}>
          {items.map((product) => (
            <div className="product-card" key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <Link href={`/${product.category === 'Merch' ? 'merch' : 'noten'}/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                <div className="product-image-container" style={{ position: 'relative' }}>
                  <img src={product.image} alt={product.title} className="product-image" />
                  
                  <button 
                    aria-label="Von Merkliste entfernen"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product);
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
                      color: 'var(--accent)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      zIndex: 3,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <div className="product-info">
                  {product.category && <div className="product-genre">{product.category}</div>}
                  <h3 className="product-title">{product.title}</h3>
                  <div className="product-composer">{product.composer}</div>
                </div>
              </Link>
              
              <div className="product-bottom" style={{ padding: '0 1.5rem 1.5rem', marginTop: 'auto' }}>
                <div className="product-price">{product.price}</div>
                <Link 
                  href={`/${product.category === 'Merch' ? 'merch' : 'noten'}/${product.id}`}
                  style={{ background: 'var(--primary-light)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s', textTransform: 'uppercase', textDecoration: 'none' }}
                >
                  Zum Artikel
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
