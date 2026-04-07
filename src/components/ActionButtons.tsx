'use client';

import React from 'react';
import { useWishlist } from '../context/WishlistContext';

interface ActionButtonsProps {
  youtubeUrl?: string | null;
  product?: any;
}

export default function ActionButtons({ youtubeUrl, product }: ActionButtonsProps = {}) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  
  const btnStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%',
    background: 'linear-gradient(to bottom, #f9f9f9, #e5e5e5)', 
    color: '#333',
    border: '1px solid #d1d1d1',
    borderBottom: '3px solid #bcbcbc',
    padding: '0.6rem 0.5rem',
    borderRadius: '6px',
    fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase' as const,
    cursor: 'pointer', transition: 'all 0.1s',
    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    textShadow: '0 1px 0 rgba(255,255,255,0.7)'
  };

  const handleHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'linear-gradient(to bottom, #eaeaea, #d1d1d1)';
    e.currentTarget.style.color = 'var(--accent)';
    e.currentTarget.style.borderColor = '#bbb';
    e.currentTarget.style.borderBottomColor = '#a1a1a1';
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = 'linear-gradient(to bottom, #f9f9f9, #e5e5e5)';
    e.currentTarget.style.color = '#333';
    e.currentTarget.style.borderColor = '#d1d1d1';
    e.currentTarget.style.borderBottomColor = '#bcbcbc';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(2px)';
    e.currentTarget.style.borderBottomWidth = '1px';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.borderBottomWidth = '3px';
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    if (product?.title) {
      document.title = `${product.title} - DONAUTON Verlag Datenblatt`;
    }
    window.print();
    if (product?.title) {
      setTimeout(() => {
        document.title = originalTitle;
      }, 500);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product ? `DONAUTON - ${product.title}` : 'DONAUTON',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Teilen wird in diesem Browser nicht unterstützt. Kopiere einfach die URL!');
    }
  };

  const handleWatchlist = () => {
    if (product) {
      toggleWishlist(product);
    } else {
      alert('Produktinformationen fehlen für die Merkliste.');
    }
  };
  
  const isMerked = product && isInWishlist(product.id.toString());

  return (
    <>
      {/* YouTube Button */}
      {youtubeUrl && (
        <button 
          onClick={() => window.open(youtubeUrl, '_blank')}
          style={btnStyle}
          onMouseOver={handleHover}
          onMouseOut={handleMouseOut}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
          </svg>
          YouTube
        </button>
      )}

      {/* Merken Button */}
      <button 
        onClick={handleWatchlist}
        style={{ ...btnStyle, color: isMerked ? 'var(--accent)' : '#333' }}
        onMouseOver={handleHover}
        onMouseOut={(e) => {
          handleMouseOut(e);
          if (isMerked) e.currentTarget.style.color = 'var(--accent)';
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isMerked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        {isMerked ? 'Gemerkt' : 'Merken'}
      </button>

      {/* Drucken Button */}
      <button 
        onClick={handlePrint}
        style={btnStyle}
        onMouseOver={handleHover}
        onMouseOut={handleMouseOut}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"></polyline>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <rect x="6" y="14" width="12" height="8"></rect>
        </svg>
        Drucken
      </button>

      {/* Teilen Button */}
      <button 
        onClick={handleShare}
        style={btnStyle}
        onMouseOver={handleHover}
        onMouseOut={handleMouseOut}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Teilen
      </button>
    </>
  );
}
