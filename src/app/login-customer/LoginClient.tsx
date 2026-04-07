'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';

export default function LoginClient({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Neu: Falls man auf "/login-customer" geht, aber schon eingeloggt ist, direkt zum Konto.
  useEffect(() => {
    if (localStorage.getItem('donauton_customer')) {
      window.location.href = '/konto';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (turnstileSiteKey && !turnstileToken) {
      setError('Bitte warte kurz auf die Spam-Prüfung.');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login fehlgeschlagen');
      }

      // Speichere die gesendeten Suite Kunden-Daten
      localStorage.setItem('donauton_customer', JSON.stringify(data.customer));
      
      const checkRedirect = localStorage.getItem('redirect_after_login') || '/konto';
      window.location.href = checkRedirect;

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem' }}>
      <div className="animate-fade-in" style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem', width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
        
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>Shop Login</h2>
        <p style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: '2rem' }}>Greife auf deine Noten und Rechnungen zu.</p>

        {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>E-Mail Adresse</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e0' }} placeholder="Max@mustermann.de" />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Passwort</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e0' }} placeholder="••••••••" />
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

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', marginTop: '0.5rem' }}>
            {loading ? 'Prüfe Daten...' : 'Anmelden'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>Noch kein Konto? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Jetzt Registrieren</Link></p>
        </div>

      </div>
    </div>
  );
}
