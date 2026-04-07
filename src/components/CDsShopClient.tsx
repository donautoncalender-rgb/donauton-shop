'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CDsShopClient({ initialProducts }: { initialProducts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
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
          <div className="toolbar-sort">
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
          <div className="product-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href={`/cds/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                  <div className="product-image-container">
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <img src={product.image} alt={product.title} className="product-image" />
                  </div>
                  <div className="product-info">
                    <div className="product-genre">{product.genre} Album</div>
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-composer">{product.artist}</div>
                    
                    <div className="product-meta">
                      <span title="Album Info">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                        Physischer Tonträger
                      </span>
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
                        id: 'cd-' + product.id,
                        title: product.title,
                        price: parseFloat(product.price.replace(',', '.')),
                        quantity: 1,
                        variant: product.genre,
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
