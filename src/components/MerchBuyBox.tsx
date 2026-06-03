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
  
  // Try to split variants if all of them contain ' - ' (e.g., "S - Blächbläser")
  const canSplitVariants = variants.length > 0 && variants.every((v: any) => v.title.includes(' - '));
  
  const parsedVariants = canSplitVariants 
    ? variants.map((v: any) => {
        const parts = v.title.split(' - ').map((p: string) => p.trim());
        return {
          ...v,
          size: parts[0],
          print: parts[1]
        };
      })
    : [];

  const uniqueSizes: string[] = canSplitVariants ? Array.from(new Set(parsedVariants.map((pv: any) => pv.size as string))) : [];
  const uniquePrints: string[] = canSplitVariants ? Array.from(new Set(parsedVariants.map((pv: any) => pv.print as string))) : [];

  // Local state for selected attributes (direct initialization to satisfy TS)
  const [selectedSize, setSelectedSize] = useState<string>(
    (canSplitVariants && uniqueSizes.length > 0) ? uniqueSizes[0] : (product.sizes.length > 0 ? product.sizes[0] : '')
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    (canSplitVariants && uniquePrints.length > 0) ? uniquePrints[0] : (product.colors.length > 0 ? product.colors[0] : '')
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    (variants.length > 0 && !canSplitVariants) ? variants[0].id : ''
  );

  const [quantity, setQuantity] = useState<number>(1);

  // Determine current active variant based on selection mode
  let selectedVariantOpt: any = null;
  if (canSplitVariants) {
    selectedVariantOpt = parsedVariants.find((pv: any) => pv.size === selectedSize && pv.print === selectedColor);
    if (!selectedVariantOpt) {
      selectedVariantOpt = parsedVariants.find((pv: any) => pv.size === selectedSize) || parsedVariants[0];
    }
  } else if (variants.length > 0) {
    selectedVariantOpt = variants.find((v: any) => v.id === selectedVariantId) || variants[0];
  }

  // Active price, stock and SKU
  const currentPrice = selectedVariantOpt ? selectedVariantOpt.price : product.price;
  const currentStockStatus = selectedVariantOpt ? selectedVariantOpt.stockStatus : product.stockStatus;
  const cartSku = selectedVariantOpt ? selectedVariantOpt.sku : undefined;

  // Bestimme, ob es sich um Kleidergrößen oder sonstige Varianten (z.B. Ausführungen) handelt
  const isSizeOption = (val: string) => {
    const v = val.toLowerCase().trim();
    return ['s', 'm', 'l', 'xl', 'xxl', 'xxxl', 'uni', 'one size', 'onesize'].includes(v) || 
           v.includes('/') || 
           /^\d+$/.test(v);
  };
  const hasActualSizes = canSplitVariants 
    ? uniqueSizes.some((v: string) => isSizeOption(v))
    : product.sizes.some((v: string) => isSizeOption(v));
  const sizeLabel = hasActualSizes ? "Größe" : "Ausführung";

  // Bestimme, ob es sich um tatsächliche Farben oder sonstige Varianten (z.B. Aufdrucke) handelt
  const isColorOption = (val: string) => {
    const v = val.toLowerCase().trim();
    return ['schwarz', 'weiß', 'weiss', 'blau', 'rot', 'grün', 'gruen', 'gelb', 'grau', 'navy', 'anthrazit', 'khaki', 'oliv', 'rosa', 'pink', 'türkis', 'bunt', 'gold', 'silber', 'bronze', 'graphit'].includes(v);
  };
  const hasActualColors = canSplitVariants
    ? uniquePrints.some((v: string) => isColorOption(v))
    : product.colors.some((v: string) => isColorOption(v));
  const colorLabel = hasActualColors ? "Farbe" : "Aufdruck";

  // Actions for split variant selections
  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    const availableForSize = parsedVariants.filter((pv: any) => pv.size === size);
    const hasCurrentPrint = availableForSize.some((pv: any) => pv.print === selectedColor);
    if (!hasCurrentPrint && availableForSize.length > 0) {
      setSelectedColor(availableForSize[0].print);
    }
  };

  const handlePrintClick = (print: string) => {
    setSelectedColor(print);
    const availableForPrint = parsedVariants.filter((pv: any) => pv.print === print);
    const hasCurrentSize = availableForPrint.some((pv: any) => pv.size === selectedSize);
    if (!hasCurrentSize && availableForPrint.length > 0) {
      setSelectedSize(availableForPrint[0].size);
    }
  };

  // Determine the variant label to pass to cart
  let combinedVariant: string | undefined = undefined;
  if (canSplitVariants) {
    const selectedVariantParts = [];
    if (selectedSize) selectedVariantParts.push(`${sizeLabel}: ${selectedSize}`);
    if (selectedColor) selectedVariantParts.push(`${colorLabel}: ${selectedColor}`);
    combinedVariant = selectedVariantParts.length > 0 ? selectedVariantParts.join(', ') : undefined;
  } else if (variants.length > 0 && selectedVariantOpt) {
    combinedVariant = selectedVariantOpt.title;
  } else {
    const selectedVariantParts = [];
    if (selectedSize) selectedVariantParts.push(`${sizeLabel}: ${selectedSize}`);
    if (selectedColor) selectedVariantParts.push(`${colorLabel}: ${selectedColor}`);
    combinedVariant = selectedVariantParts.length > 0 ? selectedVariantParts.join(', ') : undefined;
  }

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

      {/* Case 1: Split-able variants (e.g. "S - Blächbläser") */}
      {canSplitVariants ? (
        <>
          {/* Size Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: '0.6rem' }}>{sizeLabel} wählen:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {uniqueSizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => handleSizeClick(size)}
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

          {/* Print/Color Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: '0.6rem' }}>{colorLabel} wählen:</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {uniquePrints.map((print: string) => (
                <button
                  key={print}
                  onClick={() => handlePrintClick(print)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: selectedColor === print ? '2px solid var(--accent)' : '1px solid #ccc',
                    background: selectedColor === print ? 'white' : '#fff',
                    color: selectedColor === print ? 'var(--accent)' : '#333',
                    fontWeight: selectedColor === print ? 700 : 500,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: selectedColor === print ? '0 2px 5px rgba(167, 25, 48, 0.1)' : 'none'
                  }}
                >
                  {print}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : variants.length > 0 ? (
        /* Case 2: Non-splitable child variants (e.g. "Blächbläserin", "Blächbläser") */
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: '0.6rem' }}>Ausführung wählen:</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {variants.map((v: any) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariantId(v.id)}
                style={{
                  padding: '0.6rem 1.2rem',
                  border: selectedVariantId === v.id ? '2px solid var(--accent)' : '1px solid #ccc',
                  background: selectedVariantId === v.id ? 'white' : '#fff',
                  color: selectedVariantId === v.id ? 'var(--accent)' : '#333',
                  fontWeight: selectedVariantId === v.id ? 700 : 500,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedVariantId === v.id ? '0 2px 5px rgba(167, 25, 48, 0.1)' : 'none'
                }}
              >
                {v.title}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Case 3: Flat parent sizes and colors attributes */
        <>
          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: '0.6rem' }}>{sizeLabel} wählen:</label>
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
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#111', marginBottom: '0.6rem' }}>{colorLabel} wählen:</label>
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
        </>
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
