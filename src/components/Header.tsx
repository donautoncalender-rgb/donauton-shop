'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface HeaderProps {
  shopTitle?: string;
  logoUrl?: string | null;
  taxonomy?: { besetzung: string; items: string[]; type: 'genre' | 'solist' }[];
  composers?: { name: string; slug: string }[];
}

export default function Header({ shopTitle = "DONAUTON.", logoUrl, taxonomy, composers }: HeaderProps) {
  const { toggleCart, cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [customerLink, setCustomerLink] = useState("/login-customer");
  const router = useRouter();

  // Search autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wenn Kundendaten vorhanden sind, navigiere ins Konto anstatt zum Login
    if (localStorage.getItem('donauton_customer')) {
      setCustomerLink("/konto");
    }
  }, []);

  // Debounced search logic for live suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search suggestions fetch failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Click outside listener to close search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim() !== '') {
      router.push(`/suche?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsOpen(false);
    }
  };

  const getProductRoute = (category?: string) => {
    const cat = category?.toLowerCase();
    if (cat === 'bücher' || cat === 'buecher') return 'buecher';
    if (cat === 'cds') return 'cds';
    if (cat === 'tickets') return 'tickets';
    if (cat === 'merchandise' || cat === 'merch') return 'merch';
    return 'noten';
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .nav-item-dropdown {
           position: relative;
           display: inline-block;
        }
        .dropdown-level-1 {
           visibility: hidden;
           opacity: 0;
           position: absolute;
           top: 100%;
           left: -15px;
           background-color: var(--accent);
           min-width: 260px;
           box-shadow: 0 10px 25px rgba(0,0,0,0.15);
           z-index: 100;
           padding: 0.5rem 0;
           border-radius: 4px;
           transition: all 0.2s ease;
           transform: translateY(10px);
        }
        .nav-item-dropdown:hover .dropdown-level-1 {
           visibility: visible;
           opacity: 1;
           transform: translateY(0);
        }
        .dropdown-item-has-flyout {
           position: relative;
        }
        .dropdown-link {
           color: white !important;
           padding: 12px 20px;
           text-decoration: none;
           display: flex;
           justify-content: space-between;
           align-items: center;
           font-weight: 500;
           font-size: 0.95rem;
           transition: background-color 0.2s;
        }
        .dropdown-item-has-flyout:hover > .dropdown-link {
           background-color: rgba(0,0,0,0.15);
        }
        
        .dropdown-level-2 {
           visibility: hidden;
           opacity: 0;
           position: absolute;
           top: -0.5rem;
           left: 100%;
           background-color: var(--accent);
           min-width: 220px;
           box-shadow: 0 10px 25px rgba(0,0,0,0.15);
           z-index: 101;
           padding: 0.5rem 0;
           border-radius: 4px;
           transition: all 0.2s ease;
           transform: translateX(-10px);
        }
        .dropdown-item-has-flyout:hover .dropdown-level-2 {
           visibility: visible;
           opacity: 1;
           transform: translateX(0);
        }
        .dropdown-link-sub {
           color: white !important;
           padding: 10px 20px;
           text-decoration: none;
           display: block;
           font-size: 0.9rem;
           transition: background-color 0.2s;
        }
        .dropdown-link-sub:hover {
           background-color: rgba(0,0,0,0.15);
        }
        
        /* Global Search & Autocomplete Styles */
        .global-search-container {
           position: relative;
           display: flex;
           align-items: center;
           margin-right: 0.5rem;
        }
        .global-search-input {
           width: 160px;
           padding: 0.45rem 2.2rem 0.45rem 0.8rem;
           border: 1.5px solid #e2e8f0;
           border-radius: 20px;
           font-size: 0.85rem;
           outline: none;
           transition: all 0.2s ease;
           font-family: inherit;
           background: #f8fafc;
        }
        .global-search-input:focus {
           width: 240px;
           border-color: var(--accent);
           background: white;
           box-shadow: 0 0 0 3px rgba(197, 48, 48, 0.15);
        }
        .global-search-btn {
           position: absolute;
           right: 6px;
           background: transparent;
           border: none;
           cursor: pointer;
           color: #718096;
           padding: 0.2rem;
           display: flex;
           align-items: center;
           justify-content: center;
           transition: color 0.2s;
        }
        .global-search-btn:hover {
           color: var(--accent);
        }
        .global-search-dropdown {
           position: absolute;
           top: calc(100% + 8px);
           right: 0;
           width: 440px;
           background: white;
           border-radius: 8px;
           box-shadow: 0 10px 25px rgba(0,0,0,0.15);
           border: 1px solid #e2e8f0;
           z-index: 1000;
           overflow: hidden;
           animation: searchSlideDown 0.15s ease-out;
        }
        @keyframes searchSlideDown {
           from { opacity: 0; transform: translateY(-5px); }
           to { opacity: 1; transform: translateY(0); }
        }
        .search-dropdown-header {
           padding: 0.6rem 1rem;
           background: #f7fafc;
           border-bottom: 1px solid #edf2f7;
           display: flex;
           justify-content: space-between;
           align-items: center;
           font-size: 0.8rem;
           color: #718096;
           font-weight: 600;
        }
        .search-dropdown-results {
           max-height: 360px;
           overflow-y: auto;
        }
        .search-result-item {
           display: flex;
           gap: 0.8rem;
           padding: 0.8rem 1rem;
           border-bottom: 1px solid #edf2f7;
           transition: background-color 0.15s;
           text-decoration: none;
           color: inherit !important;
           text-align: left;
        }
        .search-result-item:last-child {
           border-bottom: none;
        }
        .search-result-item:hover {
           background-color: #f7fafc;
        }
        .search-result-image {
           width: 48px;
           height: 68px;
           object-fit: cover;
           border-radius: 4px;
           border: 1px solid #e2e8f0;
           flex-shrink: 0;
        }
        .search-result-info {
           display: flex;
           flex-direction: column;
           justify-content: center;
           flex-grow: 1;
           min-width: 0;
        }
        .search-result-category {
           font-size: 0.7rem;
           text-transform: uppercase;
           letter-spacing: 0.5px;
           color: var(--accent);
           font-weight: 700;
           margin-bottom: 0.15rem;
        }
        .search-result-title {
           font-size: 0.9rem;
           font-weight: 600;
           color: #2d3748;
           margin-bottom: 0.15rem;
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
        }
        .search-result-meta {
           font-size: 0.75rem;
           color: #718096;
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
           margin-bottom: 0.15rem;
        }
        .search-result-price {
           font-size: 0.85rem;
           font-weight: 700;
           color: #1a202c;
        }
        .search-dropdown-footer {
           padding: 0.6rem 1rem;
           border-top: 1px solid #edf2f7;
           text-align: center;
           background: #f7fafc;
        }
        .search-dropdown-footer-link {
           font-size: 0.8rem;
           font-weight: 600;
           color: var(--accent) !important;
           text-decoration: none;
           transition: opacity 0.15s;
        }
        .search-dropdown-footer-link:hover {
           opacity: 0.8;
        }
        .search-loading-spinner {
           width: 14px;
           height: 14px;
           border: 2px solid #e2e8f0;
           border-top-color: var(--accent);
           border-radius: 50%;
           animation: searchSpin 0.6s linear infinite;
        }
        @keyframes searchSpin {
           to { transform: rotate(360deg); }
        }
      `}} />
      <header className="header">
        <div className="container header-content">
          <Link href="/" className="logo-container">
            {logoUrl ? (
              <img src={logoUrl} alt={shopTitle} style={{ height: '90px', width: 'auto', maxWidth: '300px', objectFit: 'contain' }} />
            ) : (
              <div className="logo" style={{ fontSize: '2.4rem', letterSpacing: '1px' }}>
                {shopTitle.replace('.', '')}<span>.</span>
              </div>
            )}
          </Link>
          
          <nav className="nav-links">
            <div className="nav-item-dropdown">
              <Link href="/noten?reset=true" className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Noten
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </Link>
              
              {taxonomy && taxonomy.length > 0 && (
                <div className="dropdown-level-1">
                  {taxonomy.map((tax) => (
                    <div key={tax.besetzung} className="dropdown-item-has-flyout">
                      <Link href={`/noten?besetzung=${encodeURIComponent(tax.besetzung)}`} className="dropdown-link">
                        {tax.besetzung} 
                        {tax.items && tax.items.length > 0 && (
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        )}
                      </Link>
                      
                      {tax.items && tax.items.length > 0 && (
                        <div className="dropdown-level-2">
                          {tax.items.map(item => {
                            const linkHref = tax.type === 'solist' 
                              ? `/noten?besetzung=${encodeURIComponent(tax.besetzung)}&soloinstrument=${encodeURIComponent(item)}`
                              : `/noten?besetzung=${encodeURIComponent(tax.besetzung)}&genre=${encodeURIComponent(item)}`;
                            return (
                              <Link key={item} href={linkHref} className="dropdown-link-sub">
                                {item}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link href="/cds" className="nav-link">CDs & Audio</Link>
          <Link href="/merch" className="nav-link">Merchandise</Link>
          <Link href="/buecher" className="nav-link">Bücher</Link>
          <Link href="/tickets" className="nav-link">Tickets</Link>

          {composers && composers.length > 0 && (
            <div className="nav-item-dropdown">
              <span className="nav-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                Unsere Autor*innen
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </span>
              
              <div className="dropdown-level-1" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {composers.map((c) => (
                  <Link key={c.slug} href={`/komponisten/${c.slug}`} className="dropdown-link">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="header-actions">
          <div ref={searchContainerRef} className="global-search-container">
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
              <input 
                type="text" 
                className="global-search-input" 
                placeholder="Suchen..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
              />
              <button type="submit" className="global-search-btn" aria-label="Suchen">
                {isLoading ? (
                  <div className="search-loading-spinner" />
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                )}
              </button>
            </form>

            {isOpen && searchQuery.trim().length >= 2 && (
              <div className="global-search-dropdown animate-fade-in">
                <div className="search-dropdown-header">
                  <span>
                    {suggestions.length === 0 ? "Keine Ergebnisse" : 
                     suggestions.length === 1 ? "1 Suchvorschlag" : 
                     `${suggestions.length} Suchvorschläge`}
                  </span>
                  <button 
                    onClick={() => setIsOpen(false)} 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#a0aec0', fontSize: '1.1rem', padding: 0 }}
                  >
                    &times;
                  </button>
                </div>
                
                <div className="search-dropdown-results">
                  {suggestions.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: '#718096', fontSize: '0.85rem' }}>
                      Keine passenden Produkte gefunden
                    </div>
                  ) : (
                    suggestions.map((p) => {
                      const imageSrc = p.imageUrl || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=80&q=80';
                      const linkHref = `/${getProductRoute(p.category)}/${p.id}`;
                      const artistOrComposer = p.composer || p.artist;
                      
                      return (
                        <Link 
                          key={p.id} 
                          href={linkHref} 
                          className="search-result-item"
                          onClick={() => setIsOpen(false)}
                        >
                          <img src={imageSrc} alt={p.title} className="search-result-image" />
                          <div className="search-result-info">
                            <span className="search-result-category">{p.category || 'Noten'}</span>
                            <h4 className="search-result-title">{p.title}</h4>
                            {artistOrComposer && (
                              <span className="search-result-meta">{artistOrComposer}</span>
                            )}
                            <span className="search-result-price">{p.price}</span>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>

                {suggestions.length > 0 && (
                  <div className="search-dropdown-footer">
                    <Link 
                      href={`/suche?q=${encodeURIComponent(searchQuery)}`} 
                      className="search-dropdown-footer-link"
                      onClick={() => setIsOpen(false)}
                    >
                      Alle Ergebnisse anzeigen &rarr;
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
          <Link href="/merkliste" className="icon-btn" aria-label="Merkliste" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
          </Link>
          <Link href={customerLink} className="icon-btn" aria-label="Mein Konto" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </Link>
          <button className="icon-btn" aria-label="Warenkorb" onClick={toggleCart}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  </>
  );
}
