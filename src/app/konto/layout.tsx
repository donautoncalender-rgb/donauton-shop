'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function KontoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoggedIn = true;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '10rem', paddingBottom: '6rem' }}>
      <h1 className="page-title" style={{ fontSize: '2.8rem', marginBottom: '3rem', fontWeight: 800 }}>Mein Konto</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '5rem', alignItems: 'start' }}>
        
        {/* Sidebar Navigation */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', position: 'sticky', top: '120px', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          
          <Link href="/konto" style={pathname === '/konto' ? activeNavStyle : navStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Übersicht
          </Link>
          
          <Link href="/konto/bestellungen" style={pathname === '/konto/bestellungen' ? activeNavStyle : navStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Meine Bestellungen
          </Link>
          
          <Link href="/konto/downloads" style={pathname === '/konto/downloads' ? activeNavStyle : navStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Digitale Noten (PDFs)
          </Link>
          
          <Link href="/konto/einstellungen" style={pathname === '/konto/einstellungen' ? activeNavStyle : navStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Stammdaten
          </Link>

          <hr style={{ margin: '1.5rem 0', borderColor: '#cbd5e0' }} />
          
          <button style={{ ...navStyle, color: '#64748b', textAlign: 'left' }} onClick={() => { localStorage.removeItem('donauton_customer'); window.location.href = '/login-customer'; }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Abmelden
          </button>

        </aside>

        {/* Main Content Area */}
        <main style={{ minHeight: '50vh' }}>
          {children}
        </main>

      </div>
    </div>
  );
}

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '1.2rem 1rem',
  color: '#475569',
  textDecoration: 'none',
  fontWeight: 600,
  borderRadius: '12px',
  transition: 'all 0.2s ease-in-out',
  border: '1px solid transparent',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '1.05rem',
  fontFamily: 'inherit'
} as React.CSSProperties;

const activeNavStyle = {
  ...navStyle,
  color: 'var(--accent)',
  backgroundColor: '#fff',
  borderColor: 'rgba(167, 25, 48, 0.15)',
  boxShadow: '0 4px 10px rgba(167, 25, 48, 0.05)',
  fontWeight: 700
} as React.CSSProperties;
