'use client';

import { useState } from 'react';
import AddToCartButton from './AddToCartButton';

interface MerchBuyBoxProps {
  product: {
    id: string | number;
    title: string;
    price: string;
    image: string;
    stockStatus: string;
    sizes: string[];
    colors: string[];
  };
}

export default function MerchBuyBox({ product }: MerchBuyBoxProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes.length > 0 ? product.sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors.length > 0 ? product.colors[0] : '');

  // Helper object to override the AddToCart default logic slightly by passing selectedSize/selectedColor
  const selectedVariantParts = [];
  if (selectedSize) selectedVariantParts.push(`Größe: ${selectedSize}`);
  if (selectedColor) selectedVariantParts.push(`Farbe: ${selectedColor}`);
  const combinedVariant = selectedVariantParts.length > 0 ? selectedVariantParts.join(', ') : undefined;

  return (
    <div style={{ background: '#f5f5f5', border: '1px solid #e1e1e1', borderRadius: '4px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#111', lineHeight: 1 }}>
          {product.price.replace(' €', '')} <span style={{ fontSize: '1.8rem', verticalAlign: 'top' }}>€</span>
        </div>
      </div>
      
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>
        inkl. MwSt. <a href="/versand" style={{ color: '#0066cc', textDecoration: 'none' }}>zzgl. Versandkosten</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: product.stockStatus === 'instock' ? '#00a651' : '#eab308', flexShrink: 0, marginTop: '3px', position: 'relative' }}>
          {product.stockStatus === 'instock' ? (
             <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
             <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
        </div>
        <div>
          <strong style={{ color: product.stockStatus === 'instock' ? '#00a651' : '#eab308', fontSize: '1rem', display: 'block', marginBottom: '2px' }}>
            {product.stockStatus === 'instock' ? 'Sofort lieferbar' : 'Auf Anfrage'}
          </strong>
        </div>
      </div>

      {/* Size Selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: '0.6rem' }}>Größe wählen:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: selectedSize === size ? '2px solid var(--accent)' : '1px solid #ccc',
                  background: selectedSize === size ? 'white' : '#fff',
                  color: selectedSize === size ? 'var(--accent)' : '#333',
                  fontWeight: selectedSize === size ? 700 : 500,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedSize === size ? '0 2px 5px rgba(167, 25, 48, 0.1)' : 'none'
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {product.colors && product.colors.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: '0.6rem' }}>Farbe wählen:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {product.colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: selectedColor === color ? '2px solid var(--accent)' : '1px solid #ccc',
                  background: selectedColor === color ? 'white' : '#fff',
                  color: selectedColor === color ? 'var(--accent)' : '#333',
                  fontWeight: selectedColor === color ? 700 : 500,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedColor === color ? '0 2px 5px rgba(167, 25, 48, 0.1)' : 'none'
                }}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Huge Cart Button */}
      <div style={{ marginTop: '0.5rem', width: '100%' }}>
         <AddToCartButton size="large" product={{ id: product.id, title: product.title, price: product.price, image: product.image }} selectedVariant={combinedVariant} />
      </div>

      {/* Guarantees */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e1e1e1', fontSize: '0.9rem', color: '#333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <strong>30 Tage Money-Back Garantie</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <strong>3 Jahre DONAUTON Garantie</strong>
        </div>
      </div>
    </div>
  );
}
