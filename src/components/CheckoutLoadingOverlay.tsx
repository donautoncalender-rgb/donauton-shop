'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const MESSAGES = [
  "Kleinen Moment...",
  "Ihre Komposition wird fertiggestellt...",
  "Noten werden gesetzt...",
  "Dynamik wird erprobt...",
  "Instrumente werden gestimmt...",
  "Taktstock wird gehoben...",
  "Applaus wird vorbereitet..."
];

export default function CheckoutLoadingOverlay({ isVisible, logoUrl }: { isVisible: boolean, logoUrl?: string | null }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible || !isMounted) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulseMessage {
          0% { opacity: 0.5; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0.5; transform: scale(0.98); }
        }
        @keyframes pulseLogo { 
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes spinNoteFast { 
          100% { transform: rotate(360deg); } 
        }
      `}} />
      
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        {logoUrl ? (
          <img src={logoUrl} alt="Shop Logo" style={{ height: '90px', maxWidth: '300px', objectFit: 'contain', animation: 'pulseLogo 2s ease-in-out infinite' }} />
        ) : (
          <div style={{ color: 'var(--primary)', animation: 'spinNoteFast 1.5s linear infinite' }}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
      </div>
      
      <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text)' }}>
        Bitte warten
      </h2>
      <p style={{ 
        fontSize: '1.4rem', 
        color: 'var(--primary)', 
        fontWeight: 600,
        minHeight: '3rem',
        animation: 'pulseMessage 2s ease-in-out infinite',
        fontFamily: 'serif',
        fontStyle: 'italic'
      }}>
        {MESSAGES[messageIndex]}
      </p>
    </div>,
    document.body
  );
}
