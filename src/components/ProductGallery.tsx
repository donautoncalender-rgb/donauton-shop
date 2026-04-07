'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ProductGalleryProps {
  images: string[];
  altTitle: string;
  badge?: string;
}

export default function ProductGallery({ images, altTitle, badge }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [lightboxOpen]);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="product-gallery-wrapper" style={{ display: 'flex', gap: '2rem', height: '460px' }}>
        {/* Thumbnails (Left Column) */}
        <div className="thumbnails-sidebar" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          width: '75px', 
          overflowY: 'auto',
          overflowX: 'hidden',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
          {images.map((img, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveIndex(idx)}
              style={{ 
                width: '75px', 
                height: '106px', // A4 Portrait Ratio, 4 items perfectly fill 460px
                border: activeIndex === idx ? '2px solid var(--accent)' : '1px solid #ddd', 
                borderRadius: '4px', 
                cursor: 'pointer', 
                overflow: 'hidden',
                flexShrink: 0,
                opacity: activeIndex === idx ? 1 : 0.6,
                transition: 'all 0.2s ease-in-out',
                boxSizing: 'border-box',
                background: '#fff'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.opacity = '1'; 
                e.currentTarget.style.borderColor = activeIndex === idx ? 'var(--accent)' : '#aaa'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.opacity = activeIndex === idx ? '1' : '0.6';
                e.currentTarget.style.borderColor = activeIndex === idx ? 'var(--accent)' : '#ddd';
              }}
            >
              <img src={img} alt={`${altTitle} Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* Main Image (Right Area - No Box, Amazon Style) */}
        <div className="main-image-container" style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative',
          cursor: 'zoom-in'
        }} onClick={() => setLightboxOpen(true)}>
          {badge && (
            <span style={{ position: 'absolute', top: '0', left: '0', zIndex: 10, background: '#ff9900', color: '#fff', padding: '0.4rem 1.2rem', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', boxShadow: '2px 2px 5px rgba(0,0,0,0.2)' }}>
              {badge}
            </span>
          )}
          <img 
            src={images[activeIndex]} 
            alt={altTitle} 
            style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity 0.2s ease-in-out', filter: 'drop-shadow(10px 10px 20px rgba(0,0,0,0.15))' }} 
          />
          {/* Zoom hint icon */}
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
               <circle cx="11" cy="11" r="8"></circle>
               <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
               <line x1="11" y1="8" x2="11" y2="14"></line>
               <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && mounted && createPortal(
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: '#ffffff', 
            zIndex: 999999, 
            display: 'flex', 
            flexDirection: 'column',
            cursor: 'default',
          }} 
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button 
            style={{ position: 'absolute', top: '2%', right: '2%', background: '#fff', border: '2px solid #000', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }} 
            onClick={() => setLightboxOpen(false)}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          {/* Main Content Area */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, width: '100%', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev === 0 ? images.length - 1 : prev - 1) }}
                style={{ position: 'absolute', left: '3%', background: '#000', border: 'none', borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
            )}

            <img 
              src={images[activeIndex]} 
              alt={altTitle} 
              style={{ maxWidth: '80%', maxHeight: '90%', objectFit: 'contain' }} 
            />

            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev === images.length - 1 ? 0 : prev + 1) }}
                style={{ position: 'absolute', right: '3%', background: '#000', border: 'none', borderRadius: '50%', width: '50px', height: '50px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#000'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnails Strip */}
          {images.length > 1 && (
            <div style={{ background: '#f8f8f8', borderTop: '1px solid #e5e5e5', padding: '15px 0', width: '100%', display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', gap: '8px', maxWidth: '90%', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none', padding: '0 10px' }}>
                {images.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    style={{ 
                      width: '60px', 
                      height: '60px', 
                      background: '#fff',
                      border: '1px solid #e5e5e5',
                      borderBottom: activeIndex === idx ? '3px solid #6b21a8' : '1px solid #e5e5e5', 
                      cursor: 'pointer', 
                      transition: 'all 0.1s ease-in-out',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px'
                    }}
                    onMouseEnter={(e) => { if (activeIndex !== idx) e.currentTarget.style.borderColor = '#ccc' }}
                    onMouseLeave={(e) => { if (activeIndex !== idx) e.currentTarget.style.borderColor = '#e5e5e5' }}
                  >
                    <img src={img} alt={`Thumb ${idx}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
