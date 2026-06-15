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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
           top: calc(100% + 8px);
           left: -10px;
           background-color: rgba(255, 255, 255, 0.98);
           backdrop-filter: blur(20px);
           min-width: 260px;
           box-shadow: 0 15px 35px rgba(5, 38, 53, 0.12);
           z-index: 100;
           padding: 0.6rem 0;
           border-radius: 16px;
           border: 1px solid rgba(5, 38, 53, 0.08);
           transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
           transform: translateY(10px) scale(0.95);
           transform-origin: top left;
        }
        .nav-item-dropdown:hover .dropdown-level-1 {
           visibility: visible;
           opacity: 1;
           transform: translateY(0) scale(1);
        }
        .dropdown-item-has-flyout {
           position: relative;
        }
        .dropdown-link {
           color: var(--primary) !important;
           padding: 10px 20px;
           text-decoration: none;
           display: flex;
           justify-content: space-between;
           align-items: center;
           font-weight: 600;
           font-size: 0.85rem;
           transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
           border-radius: 8px;
           margin: 2px 8px;
        }
        .dropdown-link:hover, .dropdown-item-has-flyout:hover > .dropdown-link {
           background-color: rgba(205, 23, 25, 0.05);
           color: var(--accent) !important;
           padding-left: 24px;
        }
        
        .dropdown-level-2 {
           visibility: hidden;
           opacity: 0;
           position: absolute;
           top: -0.6rem;
           left: calc(100% + 6px);
           background-color: rgba(255, 255, 255, 0.98);
           backdrop-filter: blur(20px);
           min-width: 220px;
           box-shadow: 0 15px 35px rgba(5, 38, 53, 0.12);
           z-index: 101;
           padding: 0.6rem 0;
           border-radius: 16px;
           border: 1px solid rgba(5, 38, 53, 0.08);
           transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
           transform: translateX(-10px) scale(0.95);
           transform-origin: top left;
        }
        .dropdown-item-has-flyout:hover .dropdown-level-2 {
           visibility: visible;
           opacity: 1;
           transform: translateX(0) scale(1);
        }
        .dropdown-link-sub {
           color: var(--primary) !important;
           padding: 8px 18px;
           text-decoration: none;
           display: block;
           font-size: 0.85rem;
           font-weight: 500;
           transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
           border-radius: 8px;
           margin: 2px 8px;
        }
        .dropdown-link-sub:hover {
           background-color: rgba(205, 23, 25, 0.05);
           color: var(--accent) !important;
           padding-left: 22px;
        }
        
        /* Global Search & Autocomplete Styles */
        .global-search-container {
           position: relative;
           display: flex;
           align-items: center;
           margin-right: 0.5rem;
        }
        .global-search-input {
           width: 150px;
           padding: 0.5rem 2.2rem 0.5rem 1rem;
           border: 1.5px solid rgba(5, 38, 53, 0.1);
           border-radius: 30px;
           font-size: 0.85rem;
           outline: none;
           transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
           font-family: inherit;
           background: #f8fafc;
           color: var(--primary);
           font-weight: 500;
        }
        .global-search-input:focus {
           width: 260px;
           border-color: var(--accent);
           background: white;
           box-shadow: 0 4px 20px rgba(205, 23, 25, 0.08);
        }
        .global-search-btn {
           position: absolute;
           right: 8px;
           background: transparent;
           border: none;
           cursor: pointer;
           color: #718096;
           padding: 0.2rem;
           display: flex;
           align-items: center;
           justify-content: center;
           transition: all 0.2s ease;
        }
        .global-search-btn:hover {
           color: var(--accent);
           transform: scale(1.1);
        }
        .global-search-dropdown {
           position: absolute;
           top: calc(100% + 10px);
           right: 0;
           width: 440px;
           background: rgba(255, 255, 255, 0.98);
           backdrop-filter: blur(20px);
           border-radius: 16px;
           box-shadow: 0 20px 40px rgba(5, 38, 53, 0.12);
           border: 1px solid rgba(5, 38, 53, 0.08);
           z-index: 1000;
           overflow: hidden;
           transform-origin: top right;
           animation: searchSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes searchSlideDown {
           from { opacity: 0; transform: translateY(8px) scale(0.95); }
           to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .search-dropdown-header {
           padding: 0.8rem 1.2rem;
           background: #fdfcf9;
           border-bottom: 1px solid rgba(5, 38, 53, 0.05);
           display: flex;
           justify-content: space-between;
           align-items: center;
           font-size: 0.8rem;
           color: var(--text-light);
           font-weight: 600;
        }
        .search-dropdown-results {
           max-height: 360px;
           overflow-y: auto;
        }
        .search-result-item {
           display: flex;
           gap: 1rem;
           padding: 0.9rem 1.2rem;
           border-bottom: 1px solid rgba(5, 38, 53, 0.04);
           transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
           text-decoration: none;
           color: inherit !important;
           text-align: left;
        }
        .search-result-item:last-child {
           border-bottom: none;
        }
        .search-result-item:hover {
           background-color: rgba(205, 23, 25, 0.03);
           padding-left: 1.5rem;
        }
        .search-result-image {
           width: 44px;
           height: 62px;
           object-fit: cover;
           border-radius: 6px;
           border: 1px solid rgba(5, 38, 53, 0.08);
           flex-shrink: 0;
           box-shadow: 0 4px 10px rgba(0,0,0,0.05);
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
           color: var(--primary);
           margin-bottom: 0.15rem;
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
        }
        .search-result-meta {
           font-size: 0.75rem;
           color: var(--text-light);
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
           margin-bottom: 0.15rem;
        }
        .search-result-price {
           font-size: 0.85rem;
           font-weight: 700;
           color: var(--primary);
        }
        .search-dropdown-footer {
           padding: 0.8rem 1.2rem;
           border-top: 1px solid rgba(5, 38, 53, 0.05);
           text-align: center;
           background: #fdfcf9;
        }
        .search-dropdown-footer-link {
           font-size: 0.8rem;
           font-weight: 700;
           color: var(--accent) !important;
           text-decoration: none;
           transition: opacity 0.15s;
        }
        .search-dropdown-footer-link:hover {
           opacity: 0.85;
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
        .musikwelt-btn {
           display: inline-flex;
           align-items: center;
           gap: 6px;
           background-color: transparent;
           color: var(--primary);
           border: 1.5px solid var(--accent);
           padding: 0.4rem 1rem;
           border-radius: 30px;
           font-size: 0.8rem;
           font-weight: 700;
           text-decoration: none;
           transition: all 0.3s ease;
           white-space: nowrap;
           margin-right: 0.5rem;
        }
        .musikwelt-btn:hover {
           background-color: var(--accent);
           color: white !important;
           box-shadow: 0 4px 15px rgba(205, 23, 25, 0.2);
           transform: translateY(-1px);
        }
        @media (max-width: 900px) {
           .musikwelt-btn {
              display: none;
           }
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
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
          <a 
            href="https://www.donauton.de" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="musikwelt-btn"
          >
            DONAUTON Musikwelt
          </a>
          <Link href="/merkliste" className="icon-btn" aria-label="Merkliste" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
          </Link>
          <Link href={customerLink} className="icon-btn" aria-label="Mein Konto" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </Link>
          <button className="icon-btn" aria-label="Warenkorb" onClick={toggleCart}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          
          <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)} aria-label="Menü öffnen">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="mobile-menu-overlay animate-fade-in">
        <div className="mobile-menu-header">
          <div className="logo" style={{ fontSize: '1.8rem', letterSpacing: '1px' }}>
            {shopTitle.replace('.', '')}<span>.</span>
          </div>
          <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)} aria-label="Menü schließen">
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <input 
            type="text" 
            className="global-search-input" 
            placeholder="Suchen..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%' }}
          />
          <button type="submit" className="global-search-btn" aria-label="Suchen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </form>

        <nav className="mobile-nav-links">
          <Link href="/noten?reset=true" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Noten</Link>
          <Link href="/cds" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>CDs & Audio</Link>
          <Link href="/merch" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Merchandise</Link>
          <Link href="/buecher" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Bücher</Link>
          <Link href="/tickets" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Tickets</Link>
          <a 
            href="https://www.donauton.de" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mobile-nav-link" 
            style={{ color: 'var(--accent)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            DONAUTON Musikwelt ↗
          </a>
        </nav>
      </div>
    )}
  </>
  );
}
