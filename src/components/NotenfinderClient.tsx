'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function NotenfinderClient({ categories, initialProducts }: { categories: any[], initialProducts: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const { addToCart, toggleCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Dynamically extract unique genres and grades from the synced products
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    initialProducts.forEach(p => {
      if (p.genre && p.genre.trim() !== '' && p.genre !== 'Ohne Genre') {
        genres.add(p.genre.trim());
      }
    });
    return Array.from(genres).sort();
  }, [initialProducts]);

  const availableGrades = useMemo(() => {
    const grades = new Set<string>();
    initialProducts.forEach(p => {
      if (p.grade && p.grade.trim() !== '') {
        grades.add(p.grade.trim());
      }
    });
    return Array.from(grades).sort((a, b) => {
      // Basic numerical sort if they are numbers like "3" or "3.5"
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return numA - numB || a.localeCompare(b);
    });
  }, [initialProducts]);

  // Handle genre toggle
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  // Handle grade toggle
  const toggleGrade = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  // Filter products dynamically
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      // 1. Search filter
      const matchesSearch = 
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.composer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.genre.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Genre filter (Exact mapping from Suite)
      const matchesGenre = selectedGenres.length === 0 || 
        selectedGenres.includes(product.genre.trim());

      // 3. Grade filter (Exact mapping from Suite)
      const matchesGrade = selectedGrades.length === 0 || 
        selectedGrades.includes(product.grade.trim());

      return matchesSearch && matchesGenre && matchesGrade;
    });
  }, [searchQuery, selectedGenres, selectedGrades, initialProducts]);

  return (
    <div className="shop-layout">
      {/* Sidebar */}
      <aside className="sidebar animate-fade-in" style={{ animationDelay: '0.1s' }}>
        
        {availableGenres.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Genre</h3>
            <div className="filter-list">
              {availableGenres.map((genre) => (
                <label className="filter-label" key={genre}>
                  <input 
                    type="checkbox" 
                    className="filter-checkbox" 
                    checked={selectedGenres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                  /> 
                  {genre}
                </label>
              ))}
            </div>
          </div>
        )}

        {availableGrades.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Stufe / Grad</h3>
            <div className="filter-list">
              {availableGrades.map((grade) => (
                <label className="filter-label" key={grade}>
                  <input 
                    type="checkbox" 
                    className="filter-checkbox"
                    checked={selectedGrades.includes(grade)}
                    onChange={() => toggleGrade(grade)} 
                  /> 
                  Stufe {grade}
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
            placeholder="Nach Titel, Komponist oder Genre suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ color: 'var(--text-light)' }}>
            Zeige {filteredProducts.length} von {initialProducts.length} Ergebnissen
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
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>Keine Noten gefunden</h3>
            <p>Versuche es mit einem anderen Suchbegriff oder ändere deine Filter.</p>
            <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setSearchQuery(''); setSelectedGenres([]); setSelectedGrades([]); }}>
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
                <Link href={`/noten/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
                  <div className="product-image-container" style={{ position: 'relative' }}>
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <img src={product.image} alt={product.title} className="product-image" />
                  </div>
                  <div className="product-info">
                    <div className="product-genre">{product.genre}</div>
                    <h3 className="product-title">{product.title}</h3>
                    <div className="product-composer">{product.composer}</div>
                    
                    <div className="product-meta">
                      <span title="Schwierigkeitsgrad">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        Stufe {product.grade}
                      </span>
                      <span title="Dauer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {product.duration}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
