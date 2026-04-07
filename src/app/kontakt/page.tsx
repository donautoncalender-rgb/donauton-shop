export default function KontaktPage() {
  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Sprechen Sie mit uns</h1>
        <p className="page-subtitle">Haben Sie Fragen zu unseren Noten, Arrangements oder Ihrer Bestellung? Wir helfen gerne weiter.</p>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '0.2s', backgroundColor: 'var(--surface)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Vorname</label>
              <input type="text" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nachname</label>
              <input type="text" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>E-Mail Adresse</label>
            <input type="email" style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ihre Nachricht</label>
            <textarea rows={6} style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', resize: 'vertical' }}></textarea>
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}>Nachricht absenden</button>
        </form>
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '0.4s', textAlign: 'center', marginTop: '4rem', color: 'var(--text-light)' }}>
        <p>DONAUTON Verlag &bull; Musterstraße 1 &bull; 12345 Musterstadt</p>
        <p>info@donauton.de &bull; +49 123 456789</p>
      </div>
    </div>
  );
}
