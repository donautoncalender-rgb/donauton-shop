'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function KontoDashboard() {
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('donauton_customer');
    if (!data) {
      window.location.href = '/login-customer';
    } else {
      setCustomer(JSON.parse(data));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('donauton_customer');
    window.location.href = '/login-customer';
  };

  if (!customer) return <div style={{ padding: '2rem 0', opacity: 0.6 }}>Lade Kontodaten...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Willkommen zurück, {customer.first_name || 'Kunde'}!</h2>
        <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>Abmelden</button>
      </div>
      <p style={{ color: 'var(--text-light)', marginBottom: '3rem', fontSize: '1.1rem' }}>
        In deinem Kundenkonto kannst du deine letzten Bestellungen einsehen, deine digitalen Noten (PDFs) herunterladen und deine Rechnungsadressen verwalten.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        
        <div style={cardStyle}>
           <div style={iconWrapperStyle}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
           </div>
           <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Digitale Downloads</h3>
           <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Lade deine gekauften PDFs und MP3s herunter.</p>
           <Link href="/konto/downloads" className="btn btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}>Zum Download-Archiv</Link>
        </div>

        <div style={cardStyle}>
           <div style={{ ...iconWrapperStyle, backgroundColor: '#f1f5f9', color: '#475569' }}>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
           </div>
           <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Stammdaten</h3>
           <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Verwalte deine Adressen und Einstellungen.</p>
           <Link href="/konto/einstellungen" className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}>Stammdaten</Link>
        </div>

      </div>

      <div style={{ marginTop: '4rem', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0f172a' }}>Gibt es ein Problem mit deiner Bestellung?</h3>
        <p style={{ color: '#475569', marginBottom: '1rem' }}>
          Melde dich jederzeit bei unserem Kundenservice, falls Noten fehlen sollten oder physische Pakete beschädigt ankamen. Wir kümmern uns direkt darum.
        </p>
        <a href="mailto:support@donauton.de" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}>support@donauton.de kontaktieren</a>
      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#fff',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '2rem',
  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start'
} as React.CSSProperties;

const iconWrapperStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  backgroundColor: 'rgba(167, 25, 48, 0.1)',
  color: 'var(--accent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '1.5rem'
};
