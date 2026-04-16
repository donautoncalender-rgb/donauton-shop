'use client';

import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

interface AddToCartButtonProps {
  product: {
    id: string | number;
    title: string;
    price: string;
    image: string;
    publisher?: string | null;
  };
  size?: 'small' | 'large';
  selectedVariant?: string;
}

export default function AddToCartButton({ product, size = 'small', selectedVariant }: AddToCartButtonProps) {
  const { addToCart, toggleCart } = useCart();
  const isLarge = size === 'large';

  return (
    <button 
      style={{ 
        background: 'var(--accent)', color: 'white', border: 'none', 
        padding: isLarge ? '0.8rem 1.5rem' : '0.4rem 0.8rem', 
        borderRadius: isLarge ? '6px' : '30px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        gap: isLarge ? '0.5rem' : '0.4rem', 
        fontWeight: isLarge ? 700 : 600, 
        fontSize: isLarge ? '1rem' : '0.75rem', 
        cursor: 'pointer', transition: 'all 0.3s', 
        textTransform: 'uppercase',
        width: isLarge ? '100%' : 'auto',
        boxShadow: isLarge ? '0 4px 10px rgba(167, 25, 48, 0.15)' : 'none',
        letterSpacing: isLarge ? '0.5px' : 'normal'
      }}
      onMouseEnter={(e) => { 
        e.currentTarget.style.background = 'var(--accent-hover)';
        if(isLarge) e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => { 
        e.currentTarget.style.background = 'var(--accent)';
        if(isLarge) e.currentTarget.style.transform = 'translateY(0)';
      }}
      aria-label="In den Warenkorb"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart({
          id: product.id.toString(),
          title: product.title,
          price: parseFloat(product.price.replace(',', '.')),
          quantity: 1,
          variant: selectedVariant || 'Standard',
          image: product.image,
          publisher: product.publisher || null
        });
        
        toast.success(
          (t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ fontWeight: 600 }}>Im Warenkorb!</div>
              <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                {product.title} {selectedVariant === 'Digital' ? '(PDF)' : ''} wurde hinzugefügt.
              </div>
            </div>
          ),
          {
            duration: 3000,
          }
        );
      }}
    >
      <svg width={isLarge ? "18" : "14"} height={isLarge ? "18" : "14"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
      In den Warenkorb
    </button>
  );
}
