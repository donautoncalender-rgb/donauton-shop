import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h1 style={{ fontSize: '8rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, marginBottom: '0.5rem', opacity: 0.1 }}>404</h1>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem', marginTop: '-4rem', position: 'relative' }}>Ton verfehlt!</h2>
        
        <p style={{ color: 'var(--text-light)', maxWidth: '400px', margin: '0 auto 2.5rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Die gesuchte Seite konnte auf unserer Bühne nicht gefunden werden. Eventuell haben wir sie umgestellt oder sie existiert nicht.
        </p>

        <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>
          Zurück zur Startseite
        </Link>
      </div>

    </div>
  );
}
