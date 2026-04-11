'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface HeaderProps {
  shopTitle?: string;
  logoUrl?: string | null;
  taxonomy?: { besetzung: string; genres: string[] }[];
}

export default function Header({ shopTitle = "DONAUTON.", logoUrl, taxonomy }: HeaderProps) {
  const { toggleCart, cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [customerLink, setCustomerLink] = useState("/login-customer");

  useEffect(() => {
    // Wenn Kundendaten vorhanden sind, navigiere ins Konto anstatt zum Login
    if (localStorage.getItem('donauton_customer')) {
      setCustomerLink("/konto");
    }
  }, []);

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
                        {tax.genres.length > 0 && (
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                        )}
                      </Link>
                      
                      {tax.genres && tax.genres.length > 0 && (
                        <div className="dropdown-level-2">
                          {tax.genres.map(genre => (
                            <Link key={genre} href={`/noten?besetzung=${encodeURIComponent(tax.besetzung)}&genre=${encodeURIComponent(genre)}`} className="dropdown-link-sub">
                              {genre}
                            </Link>
                          ))}
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
        </nav>

        <div className="header-actions">
          <Link href="/noten" className="icon-btn" aria-label="Suchen" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </Link>
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
