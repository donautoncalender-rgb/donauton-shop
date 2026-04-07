'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { loginAction } from './actions';

export default function LoginClient({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (turnstileSiteKey && !turnstileToken) {
      setError('Bitte warte kurz auf die Spam-Prüfung oder lade die Seite neu.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
      
      <div className="login-wrapper animate-fade-in" style={{
        display: 'flex',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '1000px',
        width: '100%',
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)'
      }}>
        
        {/* Left Side: Image / Branding */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', backgroundColor: '#cd1719', color: 'white', padding: '4rem', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2, backgroundImage: 'url("https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800&q=80")', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>Willkommen zurück bei DONAUTON.</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>Melden Sie sich an, um auf Ihre digitalen Einkäufe, Rechnungen und den Adminbereich zuzugreifen.</p>
          </div>
          <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.8 }}>
              <div style={{ width: '40px', height: '1px', backgroundColor: 'white' }}></div>
              <span style={{ fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Premium Hub</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div style={{ flex: 1, padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>Anmelden</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Noch kein Konto? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Registrieren</Link></p>

          {error && (
            <div style={{ backgroundColor: '#fff5f5', color: '#c53030', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #feb2b2' }}>
              {error}
            </div>
          )}

          <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#4a5568' }}>E-Mail Adresse</label>
              <input type="email" name="email" required style={{ width: '100%', padding: '1rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem' }} placeholder="admin@donauton.de" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: 600, color: '#4a5568' }}>Passwort</label>
                <Link href="/forgot-password" style={{ color: 'var(--text-light)', fontSize: '0.9rem', textDecoration: 'none' }}>Vergessen?</Link>
              </div>
              <input type="password" name="password" required style={{ width: '100%', padding: '1rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem' }} placeholder="••••••••" />
            </div>

            {turnstileSiteKey && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                <Turnstile 
                  siteKey={turnstileSiteKey} 
                  onSuccess={(token) => setTurnstileToken(token)} 
                  onError={() => setError('Spam-Prüfung konnte nicht geladen werden. Bitte Adblocker prüfen.')}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading || !!(turnstileSiteKey && !turnstileToken)} style={{ marginTop: '0.5rem', padding: '1.2rem', fontSize: '1.1rem', width: '100%', opacity: (loading || (turnstileSiteKey && !turnstileToken)) ? 0.7 : 1 }}>
              {loading ? 'Prüfung...' : 'Einloggen'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
