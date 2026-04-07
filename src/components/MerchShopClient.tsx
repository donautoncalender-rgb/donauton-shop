'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function MerchShopClient({ initialProducts }: { initialProducts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const { addToCart, toggleCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    initialProducts.forEach(p => {
      if (p.type && p.type.trim() !== '') {
        types.add(p.type.trim());
      }
    });
    return Array.from(types).sort();
  }, [initialProducts]);

  const availableSizes = useMemo(() => {
    const sizes = new Set<string>();
    initialProducts.forEach(p => {
      if (p.sizes && Array.isArray(p.sizes)) {
        p.sizes.forEach((s: string) => sizes.add(s.trim()));
      }
    });
    // Optional: Sort sizes logically, but simple sort is fine for now
    return Array.from(sizes).sort();
  }, [initialProducts]);

  const toggleType = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const matchesSize = selectedSizes.length === 0 || selectedSizes.some(s => (product.sizes || []).includes(s));

      return matchesSearch && matchesType && matchesSize;
    });
  }, [searchQuery, selectedTypes, selectedSizes, initialProducts]);

  return (
    <div className="shop-layout">
      {/* Sidebar */}
      <aside className="sidebar animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {availableTypes.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Kategorie</h3>
            <div className="filter-list">
              {availableTypes.map(type => (
                <label className="filter-label" key={type}>
                  <input type="checkbox" className="filter-checkbox" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} /> {type}
                </label>
              ))}
            </div>
          </div>
        )}

        {availableSizes.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Verfügbare Größen</h3>
            <div className="filter-list">
              {availableSizes.map(size => (
                <label className="filter-label" key={size}>
                  <input type="checkbox" className="filter-checkbox" checked={selectedSizes.includes(size)} onChange={() => toggleSize(size)} /> {size}
                </label>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="shop-main">
        <div className="search-box animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Nach Merch Kollektionen suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ color: 'var(--text-light)' }}>
            Zeige {filteredProducts.length} von {initialProducts.length} Artikeln
          </div>
          <div className="toolbar-sort">
            <select defaultValue="newest">
              <option value="newest">Neueste Kollektionen</option>
              <option value="title-asc">Bezeichnung (A-Z)</option>
              <option value="price-asc">Preis aufsteigend</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <path d="M20.38 3.46L16 2a8 8 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
            </svg>
            <h3>Keine Artikel gefunden</h3>
            <p>Leider gibt es keinen Artikel in dieser Konfiguration.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setSearchQuery(''); setSelectedTypes([]); setSelectedSizes([]); }}>
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="product-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
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
                      composer: 'DONAUTON Kollektion',
                      category: 'Merch'
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
                <Link href={`/merch/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                  <div className="product-image-container" style={{ position: 'relative' }}>
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <img src={product.image} alt={product.title} className="product-image" />
                  </div>
                  <div className="product-info">
                    <div className="product-genre">{product.type}</div>
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-composer">DONAUTON Kollektion</div>
                    
                    <div className="product-meta">
                      {(product.sizes && product.sizes.length > 0) && (
                        <span title="Verfügbare Größen">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a8 8 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path></svg>
                          {product.sizes.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                
                <div className="product-bottom" style={{ padding: '0 1.5rem 1.5rem', marginTop: 'auto' }}>
                  <div className="product-price">{product.price}</div>
                  <button 
                    style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s', textTransform: 'uppercase' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                    aria-label="In den Warenkorb"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        id: 'merch-' + product.id,
                        title: product.title,
                        price: parseFloat(product.price.replace(',', '.')),
                        quantity: 1,
                        variant: (product.sizes && product.sizes[0]) || 'Standard',
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
