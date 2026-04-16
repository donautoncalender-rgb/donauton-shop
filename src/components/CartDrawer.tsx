'use client';

import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CartDrawer() {
  const { isCartOpen, closeCart, items, cartTotal, removeFromCart, updateQuantity } = useCart();

  // Prevent background scrolling when cart is open (optional, sometimes desired)
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={closeCart}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          animation: 'fadeIn 0.3s ease-out'
        }}
        aria-label="Close cart backdrop"
      />

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '450px',
          backgroundColor: 'var(--bg)',
          zIndex: 10001,
          boxShadow: '-10px 0 40px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Dein Warenkorb</h2>
          <button 
            onClick={closeCart}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text)',
              cursor: 'pointer', padding: '0.5rem'
            }}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '3rem' }}>
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', opacity: 0.5 }}>
                <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p>Dein Warenkorb ist noch leer.</p>
              <button 
                onClick={closeCart}
                className="btn btn-secondary"
                style={{ marginTop: '1.5rem' }}
              >
                Weiter shoppen
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {items.map((item) => (
                <div key={`${item.id}-${item.variant}`} style={{ display: 'flex', gap: '1rem' }}>
                  <img src={item.image} alt={item.title} style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem' }}>{item.title}</h4>
                      <button 
                        onClick={() => removeFromCart(item.id, item.variant)}
                        aria-label="Entfernen"
                        style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '2px' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                    {item.publisher && item.publisher !== 'Donauton' && (
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '-0.1rem', marginBottom: '0.2rem' }}>Verlag: {item.publisher}</div>
                    )}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.8rem' }}>{item.variant}</span>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Quantity Control */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '4px' }}>
                        <button 
                          onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                          style={{ background: 'none', border: 'none', padding: '0.3rem 0.6rem', color: 'var(--text)', cursor: 'pointer' }}
                        >-</button>
                        <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                          style={{ background: 'none', border: 'none', padding: '0.3rem 0.6rem', color: 'var(--text)', cursor: 'pointer' }}
                        >+</button>
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{(item.price * item.quantity).toFixed(2).replace('.', ',')} €</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 700 }}>
              <span>Zwischensumme</span>
              <span>{cartTotal.toFixed(2).replace('.', ',')} €</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
              Steuern und Versandkosten werden an der Kasse berechnet.
            </p>
            <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', display: 'flex', justifyContent: 'center', textDecoration: 'none' }} onClick={closeCart}>
              ZUR KASSE
            </Link>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}} />
    </>
  );
}
