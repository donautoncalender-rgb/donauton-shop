'use client';
import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{ padding: '1rem', background: '#00a651', color: 'white', borderRadius: '4px', textAlign: 'center', fontSize: '0.95rem', fontWeight: 600 }}>
        ✓ Vielen Dank für deine Anmeldung!
      </div>
    );
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <input 
        type="email" 
        placeholder="Deine E-Mail-Adresse" 
        className="newsletter-input" 
        required 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === 'loading'}
      />
      <button type="submit" className="newsletter-btn" disabled={status === 'loading'}>
        {status === 'loading' ? '...' : 'Abonnieren'}
      </button>
      {status === 'error' && (
        <div style={{ color: '#ff4d4f', fontSize: '0.8rem', marginTop: '0.5rem', gridColumn: '1 / -1' }}>
          Ein Fehler ist aufgetreten. Bitte versuche es später noch einmal.
        </div>
      )}
    </form>
  );
}
