import React from 'react';

interface GpsrSectionProps {
  publisher: string | null;
}

export default function GpsrSection({ publisher }: GpsrSectionProps) {
  const isDonauton = !publisher || publisher.trim() === '' || publisher.toLowerCase().includes('donauton');

  return (
    <details style={{
      marginTop: '1.5rem',
      border: '1px solid #eaeaea',
      borderRadius: '8px',
      backgroundColor: '#fcfcfc',
      padding: '0.8rem 1rem',
      fontSize: '0.9rem',
      fontFamily: 'inherit'
    }} className="no-print">
      <summary style={{
        fontWeight: 650,
        color: '#111',
        cursor: 'pointer',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        outline: 'none',
        userSelect: 'none'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🛡️ Produktsicherheit (GPSR)
        </span>
        <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 500 }}>
          Anzeigen
        </span>
      </summary>
      <div style={{ 
        marginTop: '0.8rem', 
        paddingTop: '0.8rem', 
        borderTop: '1px solid #f1f5f9', 
        color: '#475569', 
        lineHeight: 1.5 
      }}>
        {isDonauton ? (
          <div>
            <strong style={{ color: '#1e293b' }}>Hersteller:</strong><br />
            DONAUTON Music Publishing<br />
            Lukas Bruckmeyer<br />
            Dorfstr. 24a<br />
            86735 Forheim<br />
            Deutschland<br />
            E-Mail: l.bruckmeyer@donauton.de<br />
            Web: www.donauton.de
          </div>
        ) : (
          <div>
            <strong style={{ color: '#1e293b' }}>Hersteller / Lizenzgeber:</strong><br />
            {publisher}<br />
            (Vertrieb durch DONAUTON)<br /><br />
            Für Sicherheits- und Konformitätsfragen kontaktieren Sie bitte den Vertriebspartner:<br />
            DONAUTON, Dorfstr. 24a, 86735 Forheim, Deutschland<br />
            E-Mail: l.bruckmeyer@donauton.de
          </div>
        )}
      </div>
    </details>
  );
}
