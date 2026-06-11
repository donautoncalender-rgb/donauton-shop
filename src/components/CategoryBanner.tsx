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
    <div className="category-banner animate-fade-in" style={{ background: gradient }}>
      
      {/* Content */}
      <div className="category-banner-content">
        <h1 className="category-banner-title">
          {title}
        </h1>
        <p className="category-banner-subtitle">
          {subtitle}
        </p>
      </div>
      
      {/* Banner Graphic right side */}
      <div className="category-banner-graphic">
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundImage: `url(${imageUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          opacity: 0.9
        }} className="category-banner-image" />
      </div>
    </div>
  );
}
