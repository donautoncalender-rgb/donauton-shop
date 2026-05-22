import Link from 'next/link';
import { AlertTriangle, Mail, ArrowLeft, HelpCircle } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
}

export default async function DownloadErrorPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const orderNumber = resolvedParams.orderNumber || 'Unbekannt';

  // Mailto link details
  const emailAddress = 'vertrieb@donauton.de';
  const emailSubject = encodeURIComponent(`Ticket-Download zurücksetzen - Bestellung ${orderNumber}`);
  const emailBody = encodeURIComponent(
    `Hallo DONAUTON-Support,\n\n` +
    `ich wollte mein personalisiertes Ticket herunterladen, jedoch ist der Download abgelaufen oder fehlgeschlagen.\n\n` +
    `Bitte setzen Sie den Download-Zähler für mich zurück.\n\n` +
    `Bestellnummer: ${orderNumber}\n\n` +
    `Vielen Dank!`
  );
  const mailtoUrl = `mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div 
        className="animate-fade-in" 
        style={{ 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)', 
          borderRadius: '24px', 
          boxShadow: 'var(--glass-shadow)', 
          padding: '3rem 2.5rem', 
          maxWidth: '620px', 
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative glowing accent block */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          borderRadius: '0 0 4px 4px'
        }} />

        {/* Warning Icon Container with Premium Styling */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '72px', 
          height: '72px', 
          borderRadius: '50%', 
          background: 'rgba(205, 23, 25, 0.08)', 
          border: '1px solid rgba(205, 23, 25, 0.2)',
          color: 'var(--accent)', 
          marginBottom: '2rem' 
        }}>
          <AlertTriangle size={36} />
        </div>

        {/* Main Content */}
        <h1 style={{ 
          fontSize: '2.2rem', 
          fontWeight: 800, 
          color: 'var(--text)', 
          marginBottom: '1rem', 
          letterSpacing: '-0.5px',
          lineHeight: 1.2
        }}>
          Ticket-Download gesperrt
        </h1>

        <h2 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 600, 
          color: 'var(--primary)', 
          marginBottom: '1.5rem',
          opacity: 0.95
        }}>
          Sicherheitslimit für personalisierte Eintrittskarten erreicht.
        </h2>

        <p style={{ 
          color: 'var(--text-light)', 
          fontSize: '1rem', 
          lineHeight: 1.6, 
          marginBottom: '2rem',
          textAlign: 'left',
          background: 'rgba(0,0,0,0.02)',
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border)'
        }}>
          Aus Sicherheitsgründen und zum Schutz vor unberechtigter Vervielfältigung können personalisierte Eintrittskarten (PDF) <strong>nur genau einmal</strong> heruntergeladen werden. Ihr Download-Ticket wurde bereits einmal aufgerufen oder der Download-Versuch wurde aufgrund einer Netzwerkunterbrechung abgebrochen.
        </p>

        {/* Dynamic Ticket details block */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '0.8rem',
          background: 'rgba(5, 38, 53, 0.03)',
          border: '1px dashed var(--border)',
          borderRadius: '16px',
          padding: '1.2rem',
          marginBottom: '2.5rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>Bestellnummer:</span>
            <span style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.5px' }}>{orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: 500 }}>Sicherheitsstatus:</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'inline-block' }}></span>
              ABGELAUFEN (1/1)
            </span>
          </div>
        </div>

        {/* Actions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
          
          <a 
            href={mailtoUrl} 
            className="btn btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.8rem',
              padding: '1.2rem 2rem',
              fontSize: '1rem',
              textDecoration: 'none'
            }}
          >
            <Mail size={18} />
            Support kontaktieren & freischalten
          </a>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
            <Link 
              href="/konto" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.95rem', 
                color: 'var(--primary)', 
                fontWeight: 600,
                transition: 'color 0.2s'
              }}
              className="nav-link"
            >
              <ArrowLeft size={16} />
              Zurück zum Kundenportal
            </Link>

            <span style={{ color: 'var(--border)' }}>|</span>

            <a 
              href="mailto:vertrieb@donauton.de"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.95rem', 
                color: 'var(--text-light)', 
                fontWeight: 500
              }}
            >
              <HelpCircle size={16} />
              vertrieb@donauton.de
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
