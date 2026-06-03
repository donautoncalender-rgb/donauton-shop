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
    variantsJson?: string | null;
  };
}

export default function MerchBuyBox({ product }: MerchBuyBoxProps) {
  // Parse variants if they exist
  const variants = product.variantsJson ? JSON.parse(product.variantsJson) : [];
  
  // Try to split variants if all of them contain ' - ' (e.g., "S - Blächbläser" or "M - Schwarz - Male")
  const canSplitVariants = variants.length > 0 && variants.every((v: any) => v.title.includes(' - '));
  const splitCount = canSplitVariants ? variants[0].title.split(' - ').length : 0;
  
  const parsedVariants = canSplitVariants 
    ? variants.map((v: any) => {
        const parts = v.title.split(' - ').map((p: string) => p.trim());
        return {
          ...v,
          parts // string[]
        };
      })
    : [];

  // Local state for dynamically split values
  const [selectedValues, setSelectedValues] = useState<string[]>(() => {
    if (!canSplitVariants) return [];
    const initial: string[] = [];
    for (let i = 0; i < splitCount; i++) {
      const unique: string[] = Array.from(new Set(parsedVariants.map((v: any) => v.parts[i] as string)));
      initial.push(unique.length > 0 ? unique[0] : '');
    }
    return initial;
  });

  // Local state for flat parent attributes fallback
  const [selectedSize, setSelectedSize] = useState<string>(
    (!canSplitVariants && product.sizes.length > 0) ? product.sizes[0] : ''
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    (!canSplitVariants && product.colors.length > 0) ? product.colors[0] : ''
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    (variants.length > 0 && !canSplitVariants) ? variants[0].id : ''
  );

  const [quantity, setQuantity] = useState<number>(1);

  // Determine current active variant based on selection mode
  let selectedVariantOpt: any = null;
  if (canSplitVariants) {
    selectedVariantOpt = parsedVariants.find((v: any) => 
      v.parts.every((partVal: string, idx: number) => partVal === selectedValues[idx])
    );
    if (!selectedVariantOpt) {
      selectedVariantOpt = parsedVariants[0];
    }
  } else if (variants.length > 0) {
    selectedVariantOpt = variants.find((v: any) => v.id === selectedVariantId) || variants[0];
  }

  // Active price, stock and SKU
  const currentPrice = selectedVariantOpt ? selectedVariantOpt.price : product.price;
  const currentStockStatus = selectedVariantOpt ? selectedVariantOpt.stockStatus : product.stockStatus;
  const cartSku = selectedVariantOpt ? selectedVariantOpt.sku : undefined;

  // Helper functions for type detection
  const isSizeOption = (val: string) => {
    const v = val.toLowerCase().trim();
    return ['s', 'm', 'l', 'xl', 'xxl', 'xxxl', 'uni', 'one size', 'onesize'].includes(v) || 
           v.includes('/') || 
           /^\d+$/.test(v);
  };

  const isColorOption = (val: string) => {
    const v = val.toLowerCase().trim();
    return ['schwarz', 'weiß', 'weiss', 'blau', 'rot', 'grün', 'gruen', 'gelb', 'grau', 'navy', 'anthrazit', 'khaki', 'oliv', 'rosa', 'pink', 'türkis', 'bunt', 'gold', 'silber', 'bronze', 'graphit'].includes(v);
  };

  const isGenderOption = (val: string) => {
    const v = val.toLowerCase().trim();
    return ['male', 'female', 'herren', 'damen', 'unisex', 'men', 'women', 'boys', 'girls'].includes(v);
  };

  const getLabelForIndex = (index: number, uniqueValues: string[]) => {
    if (uniqueValues.some((v: string) => isSizeOption(v))) return "Größe";
    if (uniqueValues.some((v: string) => isColorOption(v))) return "Farbe";
    if (uniqueValues.some((v: string) => isGenderOption(v))) return "Schnitt";
    
    // Fallbacks
    if (index === 0) return "Größe";
    if (index === 1) return "Aufdruck";
    return "Ausführung";
  };

  // Actions for split variant selections
  const handlePartClick = (index: number, value: string) => {
    setSelectedValues(prev => {
      const next = [...prev];
      next[index] = value;
      
      // Auto-correct other selections if the exact combination does not exist
      let match = parsedVariants.find((v: any) => v.parts.every((partVal: string, idx: number) => {
        if (idx === index) return partVal === value;
        return partVal === prev[idx];
      }));
      
      if (!match) {
        // Fallback: find any variant that matches the new value at index i
        match = parsedVariants.find((v: any) => v.parts[index] === value) || parsedVariants[0];
      }
      
      if (match) {
        return match.parts;
      }
      return next;
    });
  };

  // Determine the variant label to pass to cart
  let combinedVariant: string | undefined = undefined;
  if (canSplitVariants) {
    const selectedVariantParts: string[] = [];
    selectedValues.forEach((val, idx) => {
      const uniqueVals: string[] = Array.from(new Set(parsedVariants.map((v: any) => v.parts[idx] as string)));
      const label = getLabelForIndex(idx, uniqueVals);
      selectedVariantParts.push(`${label}: ${val}`);
    });
    combinedVariant = selectedVariantParts.length > 0 ? selectedVariantParts.join(', ') : undefined;
  } else if (variants.length > 0 && selectedVariantOpt) {
    combinedVariant = selectedVariantOpt.title;
  } else {
    const selectedVariantParts = [];
    const sizeLabel = product.sizes.some((v: string) => isSizeOption(v)) ? "Größe" : "Ausführung";
    const colorLabel = product.colors.some((v: string) => isColorOption(v)) ? "Farbe" : "Aufdruck";
    if (selectedSize) selectedVariantParts.push(`${sizeLabel}: ${selectedSize}`);
    if (selectedColor) selectedVariantParts.push(`${colorLabel}: ${selectedColor}`);
    combinedVariant = selectedVariantParts.length > 0 ? selectedVariantParts.join(', ') : undefined;
  }

  const dropdownSelectStyle: React.CSSProperties = {
    fontFamily: 'inherit',
    width: '100%',
    height: '42px',
    padding: '0 0.8rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    background: 'white',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1e293b',
    outline: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#4a5568',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <div style={{ background: '#f5f5f5', border: '1px solid #e1e1e1', borderRadius: '4px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      
      {/* Product Price Display */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#111', lineHeight: 1 }}>
          {currentPrice.replace(' €', '')} <span style={{ fontSize: '1.8rem', verticalAlign: 'top' }}>€</span>
        </div>
      </div>
      
      <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1.5rem' }}>
        inkl. MwSt. <a href="/versand" style={{ color: '#0066cc', textDecoration: 'none' }}>zzgl. Versandkosten</a>
      </div>

      {/* Stock Status Indicator */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: currentStockStatus === 'instock' ? '#00a651' : '#eab308', flexShrink: 0, marginTop: '3px', position: 'relative' }}>
          {currentStockStatus === 'instock' ? (
             <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
             <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', top: '2px', left: '2px', width: '12px', height: '12px' }}><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
        </div>
        <div>
          <strong style={{ color: currentStockStatus === 'instock' ? '#00a651' : '#eab308', fontSize: '1rem', display: 'block', marginBottom: '2px' }}>
            {currentStockStatus === 'instock' ? 'Sofort lieferbar' : 'Auf Anfrage'}
          </strong>
        </div>
      </div>

      {/* Dropdown selectors grid container */}
      {(canSplitVariants || (variants && variants.length > 0) || (product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
          {/* Case 1: Split-able variants (e.g. "M - Schwarz - Male") */}
          {canSplitVariants ? (
            <>
              {Array.from({ length: splitCount }).map((_, idx) => {
                const uniqueVals: string[] = Array.from(new Set(parsedVariants.map((v: any) => v.parts[idx] as string)));
                const label = getLabelForIndex(idx, uniqueVals);
                const selectedVal = selectedValues[idx];
                const isLastOdd = (splitCount % 2 !== 0) && (idx === splitCount - 1);
                const gridColumnSpan = isLastOdd ? 'span 2' : 'span 1';

                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: gridColumnSpan }}>
                    <label style={labelStyle}>{label} wählen</label>
                    <select
                      value={selectedVal}
                      onChange={(e) => handlePartClick(idx, e.target.value)}
                      style={dropdownSelectStyle}
                    >
                      {uniqueVals.map((val: string) => (
                        <option key={val} value={val} style={{ fontFamily: 'inherit' }}>
                          {val}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </>
          ) : variants.length > 0 ? (
            /* Case 2: Non-splitable child variants (e.g. "Blächbläserin", "Blächbläser") */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', gridColumn: 'span 2' }}>
              <label style={labelStyle}>Ausführung wählen</label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                style={dropdownSelectStyle}
              >
                {variants.map((v: any) => (
                  <option key={v.id} value={v.id} style={{ fontFamily: 'inherit' }}>
                    {v.title} ({v.price})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Case 3: Flat parent sizes and colors attributes */
            <>
              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.4rem',
                  gridColumn: (product.colors && product.colors.length > 0) ? 'span 1' : 'span 2'
                }}>
                  <label style={labelStyle}>
                    {product.sizes.some((v: string) => isSizeOption(v)) ? "Größe" : "Ausführung"} wählen
                  </label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    style={dropdownSelectStyle}
                  >
                    {product.sizes.map(size => (
                      <option key={size} value={size} style={{ fontFamily: 'inherit' }}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.4rem',
                  gridColumn: (product.sizes && product.sizes.length > 0) ? 'span 1' : 'span 2'
                }}>
                  <label style={labelStyle}>
                    {product.colors.some((v: string) => isColorOption(v)) ? "Farbe" : "Aufdruck"} wählen
                  </label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    style={dropdownSelectStyle}
                  >
                    {product.colors.map(color => (
                      <option key={color} value={color} style={{ fontFamily: 'inherit' }}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}
        </div>
      )}

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
         <AddToCartButton 
           size="large" 
           product={{ 
             id: product.id, 
             title: product.title, 
             price: currentPrice, 
             image: product.image,
             sku: cartSku
           }} 
           selectedVariant={combinedVariant} 
           quantity={quantity} 
         />
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
