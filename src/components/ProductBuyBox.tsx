'use client';

import { useState } from 'react';
import AddToCartButton from './AddToCartButton';

interface ProductBuyBoxProps {
  product: {
    id: string;
    title: string;
    price: string;
    image: string;
    stockStatus: string;
    hasDigitalDownload: boolean;
    digitalPrice: number | null;
    publisher?: string | null;
    variantsJson?: string | null;
    sku?: string | null;
    category?: string | null;
  };
}

export default function ProductBuyBox({ product }: ProductBuyBoxProps) {
  const [variant, setVariant] = useState<'Physisch' | 'Digital'>('Physisch');
  const [quantity, setQuantity] = useState<number>(1);

  // Parse variants if category === 'Noten' and variantsJson exists
  const variants = product.variantsJson ? JSON.parse(product.variantsJson) : [];
  
  // Define options
  const options = variants.length > 0 ? variants : [
    {
      id: 'parent',
      title: 'Komplette Ausgabe (Partitur & Stimmen)',
      sku: product.sku || '',
      price: product.price,
      stockStatus: product.stockStatus
    }
  ];

  const [selectedOptionId, setSelectedOptionId] = useState<string>(options[0].id);

  const selectedOption = options.find((opt: any) => opt.id === selectedOptionId) || options[0];

  // Convert string price to number for physical
  const physicalPriceStr = selectedOption.price.replace(' €', '').replace(',', '.');
  const physicalPrice = parseFloat(physicalPriceStr);
  
  const digitalPrice = product.digitalPrice || parseFloat(product.price.replace(' €', '').replace(',', '.'));

  const currentPrice = variant === 'Physisch' ? physicalPrice : digitalPrice;
  const currentPriceStr = currentPrice.toFixed(2).replace('.', ',');

  const stockStatus = variant === 'Digital' ? 'instock' : selectedOption.stockStatus;

  // Build cart item properties
  const cartTitle = variant === 'Digital' 
    ? `${product.title} (PDF Download)` 
    : (selectedOption.id === 'parent' ? product.title : `${product.title} - ${selectedOption.title}`);

  const cartSku = variant === 'Digital' ? null : selectedOption.sku;

  return (
    <div style={{ background: '#f5f5f5', border: '1px solid #e1e1e1', borderRadius: '4px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      
      {/* Variant Selector */}
      {product.hasDigitalDownload && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setVariant('Physisch')}
            style={{ 
              flex: 1, padding: '0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem',
              background: variant === 'Physisch' ? 'white' : 'transparent', 
              color: variant === 'Physisch' ? '#000' : '#4a5568',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: variant === 'Physisch' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Gedruckte Ausgabe
          </button>
          <button 
            onClick={() => setVariant('Digital')}
            style={{ 
              flex: 1, padding: '0.8rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem',
              background: variant === 'Digital' ? 'white' : 'transparent', 
              color: variant === 'Digital' ? '#000' : '#4a5568',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: variant === 'Digital' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Digitaler Download (PDF)
          </button>
        </div>
      )}

      {/* Voice Selection Dropdown */}
      {variants.length > 0 && variant === 'Physisch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ausführung / Stimme</label>
          <select 
            value={selectedOptionId}
            onChange={(e) => setSelectedOptionId(e.target.value)}
            style={{ 
              fontFamily: 'inherit',
              width: '100%', height: '42px', padding: '0 0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', 
              background: 'white', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', outline: 'none', 
              cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' 
            }}
          >
            {options.map((opt: any) => (
              <option key={opt.id} value={opt.id} style={{ fontFamily: 'inherit' }}>
                {opt.title} ({opt.price})
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#111', lineHeight: 1 }}>
          {currentPriceStr} <span style={{ fontSize: '1.8rem', verticalAlign: 'top' }}>€</span>
        </div>
      </div>
      
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>
        inkl. MwSt. <a href="/versand" style={{ color: '#0066cc', textDecoration: 'none' }}>{variant === 'Digital' ? 'Keine Versandkosten' : 'zzgl. Versandkosten'}</a>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: (variant === 'Digital' || stockStatus === 'instock') ? '#00a651' : '#eab308', flexShrink: 0, marginTop: '3px', position: 'relative' }}>
          {(variant === 'Digital' || stockStatus === 'instock') ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
        </div>
        <div>
          <strong style={{ color: (variant === 'Digital' || stockStatus === 'instock') ? '#00a651' : '#eab308', fontSize: '1rem', display: 'block', marginBottom: '2px' }}>
            {variant === 'Digital' ? 'Sofort nach Kauf als Download verfügbar' : (stockStatus === 'instock' ? 'Sofort lieferbar' : 'Auf Anfrage')}
          </strong>
        </div>
      </div>

      {/* Quantity Selector - Show only for Physical sheets */}
      {variant === 'Physisch' && (
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
      )}

      {/* Huge Cart Button */}
      <div style={{ marginTop: '0.5rem', width: '100%' }}>
          <AddToCartButton size="large" product={{ id: product.id, title: cartTitle, price: currentPriceStr, image: product.image, publisher: product.publisher || null, sku: cartSku, category: product.category }} selectedVariant={variant} quantity={variant === 'Digital' ? 1 : quantity} />
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
