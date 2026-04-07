'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function BuecherShopClient({ initialProducts }: { initialProducts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const { addToCart, toggleCart } = useCart();

  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    initialProducts.forEach(p => {
      // product.genre maps to what was historically called topic
      if (p.genre && p.genre.trim() !== '' && p.genre !== 'Ohne Genre') {
        genres.add(p.genre.trim());
      }
    });
    return Array.from(genres).sort();
  }, [initialProducts]);

  const availableAuthors = useMemo(() => {
    const authors = new Set<string>();
    initialProducts.forEach(p => {
      if (p.author && p.author.trim() !== '') {
        authors.add(p.author.trim());
      }
    });
    return Array.from(authors).sort();
  }, [initialProducts]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => prev.includes(genre) ? prev.filter(t => t !== genre) : [...prev, genre]);
  };

  const toggleAuthor = (author: string) => {
    setSelectedAuthors(prev => prev.includes(author) ? prev.filter(a => a !== author) : [...prev, author]);
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(product.genre);
      const matchesAuthor = selectedAuthors.length === 0 || selectedAuthors.some(a => product.author.includes(a));

      return matchesSearch && matchesGenre && matchesAuthor;
    });
  }, [searchQuery, selectedGenres, selectedAuthors, initialProducts]);

  return (
    <div className="shop-layout">
      {/* Sidebar */}
      <aside className="sidebar animate-fade-in" style={{ animationDelay: '0.1s' }}>
        {availableGenres.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Thema / Genre</h3>
            <div className="filter-list">
              {availableGenres.map(genre => (
                <label className="filter-label" key={genre}>
                  <input type="checkbox" className="filter-checkbox" checked={selectedGenres.includes(genre)} onChange={() => toggleGenre(genre)} /> {genre}
                </label>
              ))}
            </div>
          </div>
        )}

        {availableAuthors.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Autor</h3>
            <div className="filter-list">
              {availableAuthors.map(author => (
                <label className="filter-label" key={author}>
                  <input type="checkbox" className="filter-checkbox" checked={selectedAuthors.includes(author)} onChange={() => toggleAuthor(author)} /> {author}
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
            placeholder="Nach Buch oder Autor suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ color: 'var(--text-light)' }}>
            Zeige {filteredProducts.length} von {initialProducts.length} Büchern
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
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
             </svg>
            <h3>Keine Bücher gefunden</h3>
            <p>Versuche es mit anderen Filtereinstellungen.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setSearchQuery(''); setSelectedGenres([]); setSelectedAuthors([]); }}>
              Filter zurücksetzen
            </button>
          </div>
        ) : (
          <div className="product-grid animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <Link href={`/buecher/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                  <div className="product-image-container">
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <img src={product.image} alt={product.title} className="product-image" />
                  </div>
                  <div className="product-info">
                    <div className="product-genre">{product.genre}</div>
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-composer">Von {product.author}</div>
                    
                    <div className="product-meta">
                      <span title="Format">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        Gebunden
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
                        id: 'buch-' + product.id,
                        title: product.title,
                        price: parseFloat(product.price.replace(',', '.')),
                        quantity: 1,
                        variant: 'Hardcover',
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
