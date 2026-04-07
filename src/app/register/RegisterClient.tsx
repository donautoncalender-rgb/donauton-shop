'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';

export default function RegisterClient({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    if (turnstileSiteKey && !turnstileToken) {
      setError('Bitte warte kurz auf die Spam-Prüfung oder lade die Seite neu.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      setLoading(false);
      return;
    }

    // Simulate API registration against donauton Suite
    setTimeout(() => {
      // Mock successful registration: save mock user profile
      const newProfile = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        companyName: formData.get('companyName') as string,
        address: formData.get('address') as string,
        zip: formData.get('zip') as string,
        city: formData.get('city') as string,
        email: formData.get('email') as string
      };
      
      localStorage.setItem('donauton_customer', JSON.stringify(newProfile));
      
      const checkRedirect = localStorage.getItem('redirect_after_login') || '/konto';
      window.location.href = checkRedirect;
      
    }, 1200);
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 2rem', display: 'flex', justifyContent: 'center' }}>
      
      <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem', width: '100%', maxWidth: '800px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>Neues Kundenkonto</h2>
        <p style={{ color: 'var(--text-light)', textAlign: 'center', marginBottom: '3rem' }}>Erstelle dein DONAUTON Konto für schnellere Bestellungen und digitale Downloads.</p>

        {error && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Kontodaten</h3>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>E-Mail Adresse *</label>
            <input type="email" name="email" required style={inputStyle} placeholder="max@mustermann.de" />
          </div>
          <div>
            <label style={labelStyle}>Passwort (mind. 8 Zeichen) *</label>
            <input type="password" name="password" required style={inputStyle} placeholder="••••••••" minLength={8} />
          </div>
          <div>
            <label style={labelStyle}>Passwort bestätigen *</label>
            <input type="password" name="confirmPassword" required style={inputStyle} placeholder="••••••••" minLength={8} />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Rechnungs- & Lieferadresse</h3>
          </div>
          <div>
            <label style={labelStyle}>Vorname *</label>
            <input type="text" name="firstName" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nachname *</label>
            <input type="text" name="lastName" required style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Verein / Firma / Ensemble (optional)</label>
            <input type="text" name="companyName" style={inputStyle} placeholder="Musikverein Donautal" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Straße & Hausnummer *</label>
            <input type="text" name="address" required style={inputStyle} placeholder="Notengasse 1" />
          </div>
          <div>
            <label style={labelStyle}>Postleitzahl *</label>
            <input type="text" name="zip" required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Ort *</label>
            <input type="text" name="city" required style={inputStyle} />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e0' }}>
            <input type="checkbox" id="newsletter_optout" name="newsletter_optout" style={{ width: '20px', height: '20px', accentColor: '#475569', marginTop: '2px', cursor: 'pointer' }} />
            <label htmlFor="newsletter_optout" style={{ fontSize: '0.95rem', color: '#475569', cursor: 'pointer', lineHeight: 1.5 }}>
              Nein, ich möchte <strong>keine</strong> exklusiven Angebote und Neuigkeiten über den DONAUTON Newsletter erhalten (Abmelden).
            </label>
          </div>

          {turnstileSiteKey && (
            <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
              <Turnstile 
                siteKey={turnstileSiteKey} 
                onSuccess={(token) => setTurnstileToken(token)} 
                onError={() => setError('Spam-Prüfung konnte nicht geladen werden. Bitte Adblocker prüfen.')}
              />
            </div>
          )}

          <div style={{ gridColumn: '1 / -1', marginTop: '1.5rem' }}>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}>
              {loading ? 'Konto wird erstellt...' : 'Kostenlos Registrieren'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>Du hast bereite ein Konto? <Link href="/login-customer" style={{ color: 'var(--primary)', fontWeight: 600 }}>Hier Anmelden</Link></p>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 600, marginBottom: '0.4rem', color: '#475569', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e0', fontSize: '1rem', backgroundColor: '#f8fafc' };
