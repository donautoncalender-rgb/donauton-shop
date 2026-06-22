'use client';

import { useState } from 'react';
import AddToCartButton from './AddToCartButton';

interface SimpleBuyBoxProps {
  product: {
    id: string | number;
    title: string;
    price: string;
    image: string;
    stockStatus: string;
    isTicket?: boolean;
    category?: string | null;
    discountPercent?: number;
  };
  selectedVariant?: string;
}

export default function SimpleBuyBox({ product, selectedVariant }: SimpleBuyBoxProps) {
  const [quantity, setQuantity] = useState<number>(1);

  const cleanPrice = product.price.replace(' €', '').replace(',', '.').replace(/[^0-9.-]/g, '');
  let originalPrice = parseFloat(cleanPrice);
  if (isNaN(originalPrice)) originalPrice = 0;
  
  const discountPercent = product.discountPercent || 0;
  const discountedPrice = discountPercent > 0 
    ? originalPrice * (1 - discountPercent / 100) 
    : originalPrice;
    
  const discountedPriceStr = discountedPrice.toFixed(2).replace('.', ',');

  return (
    <div style={{ background: '#f5f5f5', border: '1px solid #e1e1e1', borderRadius: '4px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '1rem' }}>
        {discountPercent > 0 && originalPrice > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '1.2rem' }}>
              {originalPrice.toFixed(2).replace('.', ',')} €
            </span>
            <span style={{ background: 'var(--accent)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
              -{discountPercent}%
            </span>
          </div>
        )}
        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: discountPercent > 0 ? 'var(--accent)' : '#111', lineHeight: 1 }}>
          {discountedPriceStr} <span style={{ fontSize: '1.8rem', verticalAlign: 'top' }}>€</span>
        </div>
      </div>
      
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>
        inkl. MwSt. {product.isTicket ? (
          <span style={{ color: '#00a651', fontWeight: 600 }}>Keine Versandkosten (Digitaler Download)</span>
        ) : (
          <a href="/versand" style={{ color: '#0066cc', textDecoration: 'none' }}>zzgl. Versandkosten</a>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: product.isTicket ? '#00a651' : (product.stockStatus === 'instock' ? '#00a651' : '#eab308'), flexShrink: 0, marginTop: '3px', position: 'relative' }}>
          {(product.isTicket || product.stockStatus === 'instock') ? (
             <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
             <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
        </div>
        <div>
          <strong style={{ color: product.isTicket ? '#00a651' : (product.stockStatus === 'instock' ? '#00a651' : '#eab308'), fontSize: '1rem', display: 'block', marginBottom: '2px' }}>
            {product.isTicket ? 'Sofort nach Kauf als E-Ticket downloadbar' : (product.stockStatus === 'instock' ? 'Sofort lieferbar' : 'Auf Anfrage')}
          </strong>
        </div>
      </div>

      {/* Quantity Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Menge</label>
        <div style={{ display: 'flex', alignItems: 'center', width: '120px', height: '40px', border: '1px solid #cbd5e1', borderRadius: '6px', background: 'white', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <button 
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            type="button"
            style={{ width: '35px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600, color: '#4a5568', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            -
          </button>
          <input 
            type="number" 
            min="1" 
            value={quantity} 
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setQuantity(isNaN(val) || val < 1 ? 1 : val);
            }}
            style={{ flex: 1, width: '100%', height: '100%', border: 'none', textAlign: 'center', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', outline: 'none', background: 'transparent' }}
          />
          <button 
            onClick={() => setQuantity(q => q + 1)}
            type="button"
            style={{ width: '35px', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600, color: '#4a5568', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            +
          </button>
        </div>
      </div>

      {/* Huge Cart Button */}
      <div style={{ marginTop: '0.5rem', width: '100%' }}>
         <AddToCartButton size="large" product={{ id: product.id, title: product.title, price: discountedPrice.toFixed(2).replace('.', ',') + " €", image: product.image, category: product.isTicket ? 'Tickets' : product.category }} selectedVariant={selectedVariant} quantity={quantity} />
      </div>

      {/* Guarantees */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e1e1e1', fontSize: '0.9rem', color: '#333' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <strong>3 Jahre DONAUTON Garantie</strong>
        </div>
      </div>
    </div>
  );
}
