'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';

export default function CDsShopClient({ initialProducts }: { initialProducts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { addToCart, toggleCart } = useCart();

  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    initialProducts.forEach(p => {
      if (p.genre && p.genre.trim() !== '' && p.genre !== 'Ohne Genre' && p.genre !== 'Audio CD') {
        genres.add(p.genre.trim());
      }
    });
    // Add default if needed, or just let it naturally discover what was imported
    return Array.from(genres).sort();
  }, [initialProducts]);

  const availableArtists = useMemo(() => {
    const artists = new Set<string>();
    initialProducts.forEach(p => {
      if (p.artist && p.artist.trim() !== '') {
        artists.add(p.artist.trim());
      }
    });
    return Array.from(artists).sort();
  }, [initialProducts]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => prev.includes(genre) ? prev.filter(t => t !== genre) : [...prev, genre]);
  };

  const toggleArtist = (artist: string) => {
    setSelectedArtists(prev => prev.includes(artist) ? prev.filter(a => a !== artist) : [...prev, artist]);
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.artist.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(product.genre);
      const matchesArtist = selectedArtists.length === 0 || selectedArtists.some(a => product.artist.includes(a));

      return matchesSearch && matchesGenre && matchesArtist;
    });
  }, [searchQuery, selectedGenres, selectedArtists, initialProducts]);

  return (
    <div className="shop-layout">
      {/* Sidebar */}
      <aside className="sidebar animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {availableGenres.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Genre / Medium</h3>
            <div className="filter-list">
              {availableGenres.map(genre => (
                <label className="filter-label" key={genre}>
                  <input type="checkbox" className="filter-checkbox" checked={selectedGenres.includes(genre)} onChange={() => toggleGenre(genre)} /> {genre}
                </label>
              ))}
            </div>
          </div>
        )}

        {availableArtists.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Interpret / Künstler</h3>
            <div className="filter-list">
              {availableArtists.map(artist => (
                <label className="filter-label" key={artist}>
                  <input type="checkbox" className="filter-checkbox" checked={selectedArtists.includes(artist)} onChange={() => toggleArtist(artist)} /> {artist}
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
            placeholder="Nach Album oder Interpret suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ color: 'var(--text-light)' }}>
            Zeige {filteredProducts.length} von {initialProducts.length} Alben
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
            <select defaultValue="newest">
              <option value="newest">Neueste zuerst</option>
              <option value="title-asc">Titel (A-Z)</option>
              <option value="price-asc">Preis aufsteigend</option>
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem', opacity: 0.5 }}>
              <circle cx="12" cy="12" r="10"></circle><path d="M12 2v20"></path><path d="M12 12a1 1 0 100-2 1 1 0 000 2z"></path>
            </svg>
            <h3>Keine Tonträger gefunden</h3>
            <p>Versuche es mit anderen Filtereinstellungen.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setSearchQuery(''); setSelectedGenres([]); setSelectedArtists([]); }}>
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
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
