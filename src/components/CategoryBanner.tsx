import React from 'react';

interface CategoryBannerProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  gradient?: string;
}

export default function CategoryBanner({ 
  title, 
  subtitle, 
  imageUrl, 
  gradient = 'linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%)' 
}: CategoryBannerProps) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: gradient,
      borderRadius: '16px',
      padding: '3rem 4rem',
      marginBottom: '3rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      position: 'relative'
    }} className="animate-fade-in">
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '55%' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 900, 
          marginBottom: '1rem', 
          color: '#111827', 
          letterSpacing: '-1.5px',
          lineHeight: 1.1
        }}>
          {title}
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#4b5563', 
          lineHeight: 1.6,
          fontWeight: 500
        }}>
          {subtitle}
        </p>
      </div>
      
      {/* Banner Graphic right side */}
      <div style={{ 
        position: 'absolute', 
        right: 0, 
        top: 0, 
        bottom: 0, 
        width: '60%', 
        pointerEvents: 'none' 
      }}>
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundImage: `url(${imageUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to right, transparent, black 60%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 60%)',
          opacity: 0.9
        }} />
      </div>
    </div>
  );
}
