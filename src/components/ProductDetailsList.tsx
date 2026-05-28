'use client';

import React from 'react';

interface ProductDetailsListProps {
  detailsJson: string | null;
  // Fallbacks falls detailsJson leer ist (z.B. alte Artikel)
  category?: string | null;
  genre?: string | null;
  sku?: string | null;
  partsListJson?: string | null;
}

export default function ProductDetailsList({ detailsJson, category, genre, sku, partsListJson }: ProductDetailsListProps) {
  let details: { label: string; value: string }[] = [];
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  if (detailsJson) {
    try {
      details = JSON.parse(detailsJson);
    } catch (e) {
      console.error("Fehler beim Parsen der detailsJson", e);
    }
  }

  // Fallback, falls gar nichts da ist (sollte nach Sync nicht passieren)
  if (details.length === 0) {
    if (category) details.push({ label: "Kategorie", value: category + (genre ? ` - ${genre}` : '') });
    if (sku) details.push({ label: "Artikelnummer", value: sku });
  }

  // Parse Stimmenliste
  let partsList: { id?: string; instrument: string; count: number }[] = [];
  if (partsListJson) {
    try {
      const parsed = JSON.parse(partsListJson);
      if (Array.isArray(parsed)) {
        partsList = parsed.filter(item => item && item.instrument);
      }
    } catch (e) {
      console.error("Fehler beim Parsen der partsListJson", e);
    }
  }

  const hasVoices = partsList.length > 0;
  const totalStimmen = partsList.reduce((sum, item) => sum + (Number(item.count) || 1), 0);

  // Esc-Taste und Scroll-Sperre
  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsModalOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isModalOpen]);

  return (
    <div style={{ margin: '0 0 1.5rem 0' }}>
      <style>{`
        .besetzung-link:hover {
          color: #111 !important;
          border-bottom-style: solid !important;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', color: '#333' }}>
        <tbody>
          {details.map((detail, index) => {
            const isBesetzungRow = detail.label === 'Besetzung' && hasVoices;

            return (
              <tr key={index} style={{ borderBottom: index === details.length - 1 ? 'none' : '1px solid #eaeaea' }}>
                <td style={{ padding: '0.6rem 0', fontWeight: 600, color: '#111', width: '35%', verticalAlign: 'top' }}>
                  {detail.label}
                </td>
                <td style={{ padding: '0.6rem 0', verticalAlign: 'top' }}>
                  {isBesetzungRow ? (
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        margin: 0,
                        font: 'inherit',
                        textAlign: 'left',
                        color: 'var(--accent, #e53e3e)',
                        borderBottom: '1.5px dotted var(--accent, #e53e3e)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      className="besetzung-link"
                    >
                      {detail.value}
                      <span style={{ 
                        fontSize: '0.75rem', 
                        backgroundColor: 'rgba(229, 62, 62, 0.08)', 
                        padding: '2px 6px', 
                        borderRadius: '12px',
                        display: 'inline-block'
                      }}>
                        Stimmenliste anzeigen ⓘ
                      </span>
                    </button>
                  ) : (
                    detail.value
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Elegant Voices Modal popup */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1.5rem',
            animation: 'modalFadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              animation: 'modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', margin: 0 }}>
                  Stimmenliste
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '2px 0 0 0' }}>
                  Gesamtbesetzung: {totalStimmen} Stimmen
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: '#f3f4f6',
                  border: 'none',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  color: '#4b5563',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Voices List */}
            <div style={{
              padding: '1rem 1.5rem 1.5rem 1.5rem',
              overflowY: 'auto',
              flexGrow: 1
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {partsList.map((part, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 0',
                      borderBottom: index === partsList.length - 1 ? 'none' : '1px solid #f3f4f6'
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 550, color: '#1f2937' }}>
                      {part.instrument}
                    </span>
                    <span style={{
                      backgroundColor: 'rgba(229, 62, 62, 0.06)',
                      color: 'var(--accent, #e53e3e)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      {part.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  backgroundColor: '#111827',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

