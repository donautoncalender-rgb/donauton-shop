'use client';

import { useEffect, useState } from 'react';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const customerDataStr = localStorage.getItem('donauton_customer');
        if (!customerDataStr) {
          window.location.href = '/login-customer';
          return;
        }

        const customer = JSON.parse(customerDataStr);
        if (!customer.email) throw new Error("Keine E-Mail gefunden.");

        const res = await fetch(`/api/customer/downloads?email=${encodeURIComponent(customer.email)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setDownloads(data.downloads);
        } else {
          throw new Error(data.error || "Fehler beim Laden.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDownloads();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem 0', opacity: 0.6 }}>Lade digitale Downloads aus der Suite...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem 0', color: '#c53030' }}>Ein Fehler ist aufgetreten: {error}</div>;
  }

  if (downloads.length === 0) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
         <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Digitale Downloads</h2>
         <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>Dein digitales Download-Archiv ist noch leer. Sobald du digitale Artikel kaufst, erscheinen diese hier.</p>
      </div>
    );
  }

  const hasTickets = downloads.some((dl: any) => dl.is_ticket);
  const hasNotes = downloads.some((dl: any) => !dl.is_ticket);

  let pageTitle = 'Digitale Downloads';
  let pageDesc = 'Dein digitales Download-Archiv. Lade gekaufte Medien und Tickets sicher herunter.';

  if (hasTickets && !hasNotes) {
    pageTitle = 'Digitale Eintrittskarten';
    pageDesc = 'Deine Tickets. Lade deine Eintrittskarten hier sicher herunter.';
  } else if (hasNotes && !hasTickets) {
    pageTitle = 'Digitale Noten (PDFs & Audio)';
    pageDesc = 'Dein digitales Noten-Archiv. Lade gekaufte Partituren und Stimmen sicher herunter.';
  } else if (hasNotes && hasTickets) {
    pageTitle = 'Digitale Downloads (Noten & Tickets)';
    pageDesc = 'Dein persönliches Archiv. Lade gekaufte Partituren, MP3s und Eintrittskarten sicher herunter.';
  }

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{pageTitle}</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>{pageDesc}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {downloads.map((dl, idx) => {
          const isAudio = dl.title.toLowerCase().includes('audio') || dl.title.toLowerCase().includes('playalong') || dl.title.toLowerCase().includes('mp3');
          
          let typeLabel = 'Digitale Noten';
          let themeColor = '#dc2626';
          let themeBg = '#fee2e2';
          
          if (dl.is_ticket) {
            typeLabel = 'Eintrittskarte';
            themeColor = '#d97706';
            themeBg = '#fef3c7';
          } else if (isAudio) {
            typeLabel = 'MP3 Audio';
            themeColor = '#4f46e5';
            themeBg = '#e0e7ff';
          }

          // Card Icon (Large)
          const cardIcon = dl.is_ticket ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          );

          // Button Icon
          const buttonIcon = dl.is_ticket ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path><path d="M13 5v2"></path><path d="M13 17v2"></path><path d="M13 11v2"></path></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          );

          return (
            <div key={dl.id || idx} style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: themeBg, color: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cardIcon}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: themeColor, textTransform: 'uppercase', padding: '0.2rem 0.5rem', backgroundColor: themeBg, borderRadius: '4px' }}>
                  {typeLabel}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>{dl.title}</h3>
              <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '1rem' }}>Gekauft am {new Date(dl.date).toLocaleDateString('de-DE')} (Bestellung: {dl.order_number})</p>
              
              <div style={{ padding: '0.5rem 0', marginBottom: '1.5rem', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Downloads genutzt:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: dl.download_count >= dl.download_limit ? '#dc2626' : '#10b981' }}>
                  {dl.download_count} / {dl.download_limit}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: 'auto' }}>
                {dl.assets && dl.assets.length > 0 ? (
                  dl.assets.map((asset: any) => (
                    <button 
                      key={asset.id}
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--accent)', opacity: dl.download_count >= dl.download_limit ? 0.5 : 1, cursor: dl.download_count >= dl.download_limit ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
                      disabled={dl.download_count >= dl.download_limit}
                      onClick={dl.download_count < dl.download_limit ? () => window.location.href = asset.download_url : undefined}
                    >
                      {buttonIcon}
                      {dl.download_count >= dl.download_limit ? 'Limit erreicht' : `${asset.title} laden`}
                    </button>
                  ))
                ) : (
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--accent)', opacity: dl.download_count >= dl.download_limit ? 0.5 : 1, cursor: dl.download_count >= dl.download_limit ? 'not-allowed' : 'pointer' }}
                    disabled={dl.download_count >= dl.download_limit}
                    onClick={dl.download_count < dl.download_limit ? () => window.location.href = dl.download_url : undefined}
                  >
                    {dl.download_count >= dl.download_limit ? 'Limit erreicht' : 'Herunterladen'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
