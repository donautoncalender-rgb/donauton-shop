'use client';

import React, { useState, useEffect, useRef } from 'react';

interface DailyHighlightProps {
  product: any;
}

export default function DailyHighlight({ product }: DailyHighlightProps) {
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!product?.imageUrl) return;

    const img = new Image();
    img.src = product.imageUrl;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspectRatio(img.naturalWidth / img.naturalHeight);
        setIsReady(true);
      }
    };
  }, [product?.imageUrl]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  if (!product) return null;

  const mockupWidth = 320;
  const mockupHeight = mockupWidth / aspectRatio;

  return (
    <section 
      style={{ 
        padding: '4rem 0', 
        backgroundColor: '#ffffff', 
        position: 'relative',
        overflow: 'hidden' 
      }}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        .highlight-btn:hover {
          filter: brightness(1.1);
          transform: translateY(-5px) scale(1.02);
        }
        .highlight-btn:active {
          transform: translateY(0) scale(0.98);
        }
      `}} />

      {/* Background Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '5%',
        right: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(205, 23, 25, 0.08) 0%, transparent 70%)',
        zIndex: 0,
        animation: 'pulse-glow 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-5%',
        left: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(5, 38, 53, 0.08) 0%, transparent 70%)',
        zIndex: 0,
        animation: 'pulse-glow 10s ease-in-out infinite reverse'
      }} />

      <div className="container" style={{ opacity: isReady ? 1 : 0, transition: 'opacity 1s ease', zIndex: 1, position: 'relative' }}>
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '48px', 
            border: '1px solid rgba(255, 255, 255, 1)',
            boxShadow: `
              0 30px 60px -20px rgba(0, 0, 0, 0.08),
              ${mousePos.x * -20}px ${mousePos.y * -20}px 60px rgba(0, 0, 0, 0.02)
            `,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0',
            minHeight: '480px',
            position: 'relative',
            transition: 'box-shadow 0.2s ease-out'
          }}
        >
          {/* Subtle noise/texture overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3ExternalGradient id='g'%3E%3Cstop offset='0%25' stop-color='%23000' stop-opacity='0.03'/%3E%3Cstop offset='100%25' stop-color='%23000' stop-opacity='0'/%3E%3C/linearGradient%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.4
          }} />

          {/* LEFT SIDE: Dramatic 3D Mockup */}
          <div style={{ 
            flex: '0 0 45%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            perspective: '2500px',
            padding: '3rem',
            position: 'relative',
            zIndex: 2
          }}>
            <div style={{
              width: `${mockupWidth}px`,
              height: `${mockupHeight}px`,
              position: 'relative',
              transition: 'transform 0.1s ease-out',
              transform: `rotateY(${mousePos.x * 20}deg) rotateX(${mousePos.y * -20}deg) scale(1.05)`,
              transformStyle: 'preserve-3d',
            }}>
              {/* Luxury Stacked Pages */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: '#fff',
                  borderRadius: '2px 10px 10px 2px',
                  boxShadow: '0 0 30px rgba(0,0,0,0.03)',
                  transform: `translateZ(${-i * 3}px) translateX(${i * 0.8}px)`,
                  border: '1px solid #f1f5f9',
                  zIndex: -i
                }} />
              ))}

              {/* Main Cover */}
              <div style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${product.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '2px 10px 10px 2px',
                boxShadow: `
                  ${20 + mousePos.x * 30}px ${30 + mousePos.y * 30}px 80px -10px rgba(0,0,0,0.35),
                  inset 0 0 1px rgba(255,255,255,0.5)
                `,
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                border: '1px solid rgba(0,0,0,0.08)'
              }}>
                {/* Spotlight Shine */}
                <div style={{
                  position: 'absolute',
                  top: '-50%', left: '-50%', width: '200%', height: '200%',
                  background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%)',
                  transform: `translate(${mousePos.x * 30}%, ${mousePos.y * 30}%)`,
                  pointerEvents: 'none',
                  zIndex: 3
                }} />
                
                {/* Premium spine details */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, width: '15px', height: '100%',
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(255,255,255,0.1) 60%, transparent 100%)',
                  zIndex: 4
                }} />
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Content Area */}
          <div style={{ 
            flex: '1', 
            padding: '3rem 5rem 3rem 1rem', 
            position: 'relative', 
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <span style={{ 
                backgroundColor: 'var(--accent)', 
                color: 'white', 
                fontSize: '0.65rem', 
                fontWeight: 900, 
                padding: '0.4rem 1rem', 
                borderRadius: '50px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                boxShadow: '0 5px 15px rgba(205, 23, 25, 0.15)'
              }}>
                Highlight des Tages
              </span>
              <div style={{ height: '1px', flex: 1, background: 'linear-gradient(to right, #e2e8f0, transparent)' }} />
            </div>
            
            <h2 style={{ 
              fontSize: '2.4rem', 
              fontWeight: 800, 
              color: '#0f172a', 
              marginBottom: '1rem', 
              lineHeight: 1.1,
              letterSpacing: '-1px'
            }}>
              {product.title}
            </h2>
            
            <div 
              style={{ 
                fontSize: '1rem', 
                color: '#64748b', 
                lineHeight: 1.6, 
                marginBottom: '2.2rem', 
                fontWeight: 400,
                maxWidth: '95%',
                position: 'relative'
              }} 
              dangerouslySetInnerHTML={{ __html: product.description || '' }} 
            />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
              <a 
                href={`/${product.category.toLowerCase().replace('ü', 'ue')}/${product.slug}`} 
                className="btn btn-primary highlight-btn" 
                style={{ 
                   padding: '1rem 2.8rem', 
                   fontSize: '1rem', 
                   fontWeight: 700, 
                   borderRadius: '16px', 
                   boxShadow: '0 12px 25px rgba(205, 23, 25, 0.2)',
                   display: 'inline-flex',
                   alignItems: 'center',
                   gap: '0.8rem',
                   transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                Jetzt entdecken
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              
              <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '2px solid #f1f5f9', paddingLeft: '1.2rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Kategorie</span>
                <span style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 800 }}>{product.category}</span>
              </div>
            </div>
          </div>
          
          {/* Background Branding (Musical Notes) */}
          <div style={{ position: 'absolute', top: '5%', left: '45%', opacity: 0.03, pointerEvents: 'none' }}>
            <svg width="200" height="200" viewBox="0 0 24 24" fill="var(--primary)">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
