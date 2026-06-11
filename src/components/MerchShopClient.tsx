'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from './ProductCard';

export default function MerchShopClient({ initialProducts }: { initialProducts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
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
    const filtered = initialProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const matchesSize = selectedSizes.length === 0 || selectedSizes.some(s => (product.sizes || []).includes(s));

      return matchesSearch && matchesType && matchesSize;
    });

    const parsePrice = (pStr: string) => {
      if (pStr.toLowerCase().includes('anfrage')) return Infinity;
      const parsed = parseFloat(pStr.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
      return parsed;
    };

    return [...filtered].sort((a, b) => {
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title, 'de', { sensitivity: 'base' });
      }
      if (sortBy === 'price-asc') {
        return parsePrice(a.price) - parsePrice(b.price);
      }
      return 0; // 'newest' uses default database order (creation order)
    });
  }, [searchQuery, selectedTypes, selectedSizes, sortBy, initialProducts]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  return (
    <div className="shop-layout">
      {/* Sidebar - Desktop Only */}
      <div className="desktop-only">
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
      </div>

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

        {/* Mobile Filters */}
        <div className="mobile-only animate-fade-in" style={{ animationDelay: '0.2s', marginBottom: '1.5rem' }}>
          {availableTypes.length > 0 && (
            <div className="filter-chip-group">
              {availableTypes.map(type => (
                <label className={`filter-chip ${selectedTypes.includes(type) ? 'active' : ''}`} key={type}>
                  <input type="checkbox" className="filter-chip-input" checked={selectedTypes.includes(type)} onChange={() => toggleType(type)} /> 
                  {type}
                </label>
              ))}
            </div>
          )}
          {availableSizes.length > 0 && (
            <div className="filter-chip-group">
              {availableSizes.map(size => (
                <label className={`filter-chip ${selectedSizes.includes(size) ? 'active' : ''}`} key={size}>
                  <input type="checkbox" className="filter-chip-input" checked={selectedSizes.includes(size)} onChange={() => toggleSize(size)} /> 
                  {size}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ color: 'var(--text-light)' }}>
            {filteredProducts.length === 0 ? "Keine Ergebnisse gefunden" : 
             filteredProducts.length === 1 ? "1 Ergebnis gefunden" : 
             `${filteredProducts.length} Ergebnisse gefunden`}
          </div>
          <div className="toolbar-sort" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', background: '#f5f7fa', borderRadius: '4px', padding: '0.2rem' }}>
              <button 
                onClick={() => setViewMode('grid')}
                className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                style={{ 
                  background: viewMode === 'grid' ? 'white' : 'transparent', 
                  border: viewMode === 'grid' ? '1px solid #e2e8f0' : '1px solid transparent', 
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  color: viewMode === 'grid' ? 'var(--accent)' : '#a0aec0',
                  padding: '0.3rem', 
                  borderRadius: '3px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                aria-label="Rasteransicht"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
                style={{ 
                  background: viewMode === 'list' ? 'white' : 'transparent', 
                  border: viewMode === 'list' ? '1px solid #e2e8f0' : '1px solid transparent', 
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  color: viewMode === 'list' ? 'var(--accent)' : '#a0aec0',
                  padding: '0.3rem', 
                  borderRadius: '3px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                aria-label="Listenansicht"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
              </button>
            </div>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              className="sleek-select"
            >
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
          <div 
            className={viewMode === 'grid' ? "product-grid animate-fade-in" : "animate-fade-in"} 
            style={{ 
              animationDelay: '0.4s',
              ...(viewMode === 'list' && {
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
              })
            }}
          >
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Pagination UI */}
        {filteredProducts.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
              Zeige {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} von {filteredProducts.length} Ergebnissen
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                disabled={currentPage === 1}
                onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ padding: '0.5rem 1rem', background: currentPage === 1 ? '#f1f5f9' : 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', color: currentPage === 1 ? '#94a3b8' : 'var(--text)', transition: 'all 0.2s' }}
              >
                Zurück
              </button>
              <div style={{ padding: '0.5rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontWeight: 600 }}>
                {currentPage} / {Math.ceil(filteredProducts.length / itemsPerPage)}
              </div>
              <button 
                disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage) || filteredProducts.length === 0}
                onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ padding: '0.5rem 1rem', background: currentPage === Math.ceil(filteredProducts.length / itemsPerPage) || filteredProducts.length === 0 ? '#f1f5f9' : 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: currentPage === Math.ceil(filteredProducts.length / itemsPerPage) || filteredProducts.length === 0 ? 'not-allowed' : 'pointer', color: currentPage === Math.ceil(filteredProducts.length / itemsPerPage) || filteredProducts.length === 0 ? '#94a3b8' : 'var(--text)', transition: 'all 0.2s' }}
              >
                Weiter
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-light)' }}>Artikel pro Seite:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
