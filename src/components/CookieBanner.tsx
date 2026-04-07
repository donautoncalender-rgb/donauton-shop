'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('donauton_cookie_consent');
    if (!consent) {
      // Small delay so it slides in nicely after load
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('donauton_cookie_consent', 'all');
    setShowBanner(false);
    // Erlöse Tracking-Skripte (Google Analytics, Meta) hier, falls vorhanden
    window.location.reload(); // Zum sauberen Neustart der Skripte
  };

  const declineOptional = () => {
    localStorage.setItem('donauton_cookie_consent', 'essential_only');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '0', left: '0', width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(0,0,0,0.05)',
      padding: '1.5rem',
      boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.08)',
      zIndex: 999999,
      display: 'flex', justifyContent: 'center',
      animation: 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
      
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', width: '100%', maxWidth: '1200px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 500px', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M7 14v.01"></path></svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
              Ihre Privatsphäre ist uns wichtig
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Um Ihnen das beste DONAUTON Einkaufserlebnis zu bieten – von der Kasse bis zum sicheren Download – verwenden wir unbedingt notwendige Cookies. Wenn Sie uns erlauben, auch Marketing-Cookies zu nutzen, helfen Sie uns, unseren Shop stetig zu verbessern. Sie können Ihre Wahl jederzeit unter <a href="/datenschutz" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>Datenschutz</a> überdenken.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0, flexWrap: 'wrap' }}>
          <button onClick={declineOptional} style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem', fontWeight: 600, color: '#475569', backgroundColor: '#f1f5f9', border: '1px solid transparent', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Nur Essenzielle
          </button>
          <button onClick={acceptAll} className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 600, border: 'none', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--primary)', color: 'white', boxShadow: '0 4px 14px rgba(205, 23, 25, 0.4)' }}>
            Alle Akzeptieren
          </button>
        </div>

      </div>
    </div>
  );
}
