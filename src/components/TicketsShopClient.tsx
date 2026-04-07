'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function TicketsShopClient({ initialProducts }: { initialProducts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const { addToCart, toggleCart } = useCart();

  const availableLocations = useMemo(() => {
    const locations = new Set<string>();
    initialProducts.forEach(p => {
      if (p.location && p.location.trim() !== '') {
        locations.add(p.location.trim());
      }
    });
    return Array.from(locations).sort();
  }, [initialProducts]);

  const toggleLocation = (loc: string) => {
    setSelectedLocations(prev => prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]);
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(product.location);

      return matchesSearch && matchesLocation;
    });
  }, [searchQuery, selectedLocations, initialProducts]);

  return (
    <div className="shop-layout">
      {/* Sidebar */}
      <aside className="sidebar animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {availableLocations.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Ort / Region</h3>
            <div className="filter-list">
              {availableLocations.map(loc => (
                <label className="filter-label" key={loc}>
                  <input type="checkbox" className="filter-checkbox" checked={selectedLocations.includes(loc)} onChange={() => toggleLocation(loc)} /> {loc}
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
            placeholder="Nach Ort oder Tour suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ color: 'var(--text-light)' }}>
            Zeige {filteredProducts.length} Events
          </div>
          <div className="toolbar-sort">
            <select defaultValue="date-asc">
              <option value="date-asc">Datum aufsteigend</option>
              <option value="title-asc">Ort (A-Z)</option>
              <option value="price-asc">Preis aufsteigend</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
             <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M7 5L7 19"></path>
              <path d="M17 5L17 19"></path>
              <path d="M2.5 12h.01"></path>
              <path d="M21.5 12h.01"></path>
            </svg>
            <h3>Keine Konzerte gefunden</h3>
            <p>Leider gibt es für diese Filter aktuell keine Tickets.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setSearchQuery(''); setSelectedLocations([]); }}>
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="product-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href={`/tickets/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                  <div className="product-image-container">
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <img src={product.image} alt={product.title} className="product-image" />
                  </div>
                  <div className="product-info">
                    <div className="product-genre">{product.genre}</div>
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-composer">{product.location}</div>
                    
                    <div className="product-meta">
                      <span title="Datum & Zeit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        {product.date} • {product.time}
                      </span>
                    </div>
                  </div>
                </Link>
                
                <div className="product-bottom" style={{ padding: '0 1.5rem 1.5rem', marginTop: 'auto' }}>
                  <div className="product-price">ab {product.price}</div>
                  <button 
                    style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s', textTransform: 'uppercase' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                    aria-label="In den Warenkorb"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        id: 'ticket-' + product.id,
                        title: product.title + ' (' + product.location + ')',
                        price: parseFloat(product.price.replace(',', '.')),
                        quantity: 1,
                        variant: 'Standard Ticket',
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
                    Tickets
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
