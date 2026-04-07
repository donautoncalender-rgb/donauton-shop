'use client';

import React from 'react';

interface ScorePreviewModalProps {
  pdfUrl: string;
  title: string;
}

export default function ScorePreviewModal({ pdfUrl, title }: ScorePreviewModalProps) {
  const openPdfWindow = () => {
    window.open(pdfUrl, 'PdfPreviewWindow', 'width=1000,height=800,resizable=yes,scrollbars=yes');
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
      onClick={openPdfWindow}
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
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
      Lesen
    </button>
  );
}
