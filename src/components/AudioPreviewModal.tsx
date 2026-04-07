'use client';

import React from 'react';

interface AudioPreviewModalProps {
  audioUrl: string;
  title: string;
}

export default function AudioPreviewModal({ audioUrl, title }: AudioPreviewModalProps) {
  const openPlayerWindow = () => {
    const url = `/player?url=${encodeURIComponent(audioUrl)}&title=${encodeURIComponent(title)}`;
    window.open(url, 'AudioPlayerWindow', 'width=450,height=300,resizable=yes,scrollbars=no,status=no,menubar=no');
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(2px)';
    e.currentTarget.style.borderBottomWidth = '1px';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.borderBottomWidth = '3px';
  };

  return (
    <button 
      onClick={openPlayerWindow}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        width: '100%',
        background: 'linear-gradient(to bottom, #f9f9f9, #e5e5e5)', 
        color: '#333',
        border: '1px solid #d1d1d1',
        borderBottom: '3px solid #bcbcbc',
        padding: '0.6rem 0.5rem',
        borderRadius: '6px',
        fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase',
        cursor: 'pointer', transition: 'all 0.1s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        textShadow: '0 1px 0 rgba(255,255,255,0.7)'
      }}
      onMouseOver={(e) => { 
        e.currentTarget.style.background = 'linear-gradient(to bottom, #eaeaea, #d1d1d1)';
        e.currentTarget.style.color = 'var(--accent)';
        e.currentTarget.style.borderColor = '#bbb';
        e.currentTarget.style.borderBottomColor = '#a1a1a1';
      }}
      onMouseOut={(e) => { 
        e.currentTarget.style.background = 'linear-gradient(to bottom, #f9f9f9, #e5e5e5)';
        e.currentTarget.style.color = '#333';
        e.currentTarget.style.borderColor = '#d1d1d1';
        e.currentTarget.style.borderBottomColor = '#bcbcbc';
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="10 8 16 12 10 16 10 8"></polygon>
      </svg>
      Anhören
    </button>
  );
}
