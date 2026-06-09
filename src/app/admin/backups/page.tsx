'use client';

import { useState } from 'react';

export default function BackupsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Export JSON Backup
  const handleExport = async () => {
    setIsExporting(true);
    setStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/admin/backup', {
        method: 'GET'
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Fehler beim Abrufen des Backups.');
      }

      // Read file content
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Determine file name from headers or default
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = `donauton-shop-backup-${new Date().toISOString().split('T')[0]}.json`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      }

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatus({
        type: 'success',
        message: 'Backup-Datei wurde erfolgreich generiert und heruntergeladen!'
      });
    } catch (error: any) {
      console.error(error);
      setStatus({
        type: 'error',
        message: `Export fehlgeschlagen: ${error.message}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Import JSON Backup (Restore)
  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!confirm('Bist du absolut sicher? Durch das Wiederherstellen des Backups werden alle aktuellen Kategorien, Homepage-Slider und allgemeinen Einstellungen UNWIDERRUFLICH überschrieben!')) {
      return;
    }

    setIsImporting(true);
    setStatus({ type: null, message: '' });

    try {
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          const jsonText = event.target?.result as string;
          // Parse first to validate it's valid JSON
          const backupData = JSON.parse(jsonText);

          // POST to backup restore API
          const response = await fetch('/api/admin/backup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(backupData)
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Wiederherstellung fehlgeschlagen.');
          }

          setStatus({
            type: 'success',
            message: 'Das Backup wurde erfolgreich eingespielt! Alle Einstellungen, Slider und Kategorien wurden wiederhergestellt. Der Shop wird in Kürze neu geladen...'
          });
          
          setSelectedFile(null);

          // Force reload page to apply settings after 2.5 seconds
          setTimeout(() => {
            window.location.reload();
          }, 2500);

        } catch (err: any) {
          setStatus({
            type: 'error',
            message: `Wiederherstellung fehlgeschlagen: ${err.message}`
          });
          setIsImporting(false);
        }
      };

      fileReader.readAsText(selectedFile);
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: `Fehler beim Lesen der Datei: ${error.message}`
      });
      setIsImporting(false);
    }
  };

  return (
    <>
      <h1 style={{ marginBottom: '1rem' }}>Datenbank-Backups</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Sichere und restauriere die shop-spezifischen Konfigurationen wie API-Schlüssel, Layout-Slider und Navigationskategorien.
      </p>

      {status.type && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
          borderColor: status.type === 'success' ? '#10b981' : '#f87171',
          color: status.type === 'success' ? '#047857' : '#b91c1c'
        }}>
          {status.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          <div>
            {status.message}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* EXPORT CARD */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0 }}>
          <h3 className="admin-card-title">Backup erstellen</h3>
          <p style={{ fontSize: '0.9rem', color: '#4a5568', lineHeight: 1.6, flexGrow: 1, marginBottom: '2rem' }}>
            Erstellt ein vollständiges JSON-Backup des Shops. Darin enthalten sind:
          </p>
          <ul style={{ fontSize: '0.85rem', color: '#4a5568', paddingLeft: '1.2rem', marginBottom: '2rem', lineHeight: 1.8 }}>
            <li><strong>Shop-Einstellungen:</strong> Stripe &amp; PayPal Schlüssel, Turnstile Spam-Schutz, ERP-Verbindung</li>
            <li><strong>Layout:</strong> Startseiten-Slider und Konfigurationen</li>
            <li><strong>Kategorien:</strong> Eingerichtete Shop-Produktkategorien</li>
          </ul>
          
          <button 
            onClick={handleExport}
            disabled={isExporting || isImporting}
            className="admin-btn"
            style={{ 
              backgroundColor: '#059669', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '0.5rem',
              opacity: (isExporting || isImporting) ? 0.6 : 1,
              cursor: (isExporting || isImporting) ? 'not-allowed' : 'pointer'
            }}
          >
            {isExporting ? (
              <>
                <span className="spinner" style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Erstelle Backup...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Backup (JSON) herunterladen
              </>
            )}
          </button>
        </div>

        {/* IMPORT CARD */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0 }}>
          <h3 className="admin-card-title">Backup einspielen</h3>
          
          <div style={{ 
            backgroundColor: '#fffbeb', 
            border: '1px solid #fef3c7', 
            color: '#92400e', 
            padding: '1rem', 
            borderRadius: '6px', 
            fontSize: '0.85rem', 
            marginBottom: '1.5rem',
            lineHeight: 1.5,
            display: 'flex',
            gap: '0.5rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <div>
              <strong>Achtung:</strong> Die Wiederherstellung löscht alle aktuellen Einstellungen und Slider und ersetzt sie durch die Daten aus der Backup-Datei!
            </div>
          </div>

          <form onSubmit={handleImport} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
            <div className="admin-form-group">
              <label className="admin-label">Backup-Datei auswählen (.json)</label>
              <input 
                type="file" 
                accept=".json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="admin-input"
                style={{ padding: '0.5rem', cursor: 'pointer' }}
                required
                disabled={isImporting || isExporting}
              />
            </div>

            <button 
              type="submit"
              disabled={isImporting || isExporting || !selectedFile}
              className="admin-btn"
              style={{ 
                backgroundColor: '#dc2626', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: (isImporting || isExporting || !selectedFile) ? 0.6 : 1,
                cursor: (isImporting || isExporting || !selectedFile) ? 'not-allowed' : 'pointer'
              }}
            >
              {isImporting ? (
                <>
                  <span className="spinner" style={{ display: 'inline-block', width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Spiele Backup ein...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  Backup wiederherstellen
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
