'use client';

import { useState } from 'react';

export default function NewsletterFormClient({
  title,
  text,
}: {
  title: React.ReactNode;
  text: string;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already_subscribed' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setStatus('loading');
    
    // Parse name roughly
    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          firstName, 
          lastName,
          source: 'SHOP_HOMEPAGE'
        })
      });

      if (!res.ok) throw new Error('API Error');

      const data = await res.json();
      
      if (data.message === 'ALREADY_SUBSCRIBED') {
        setStatus('already_subscribed');
      } else {
        setStatus('success');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="container" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'white' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{title}</h2>
      <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', marginBottom: '2.5rem' }}>{text}</p>
      
      {status === 'success' && (
        <div style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)', marginBottom: '1rem' }}>
          <strong>Erfolgreich eingetragen!</strong> Willkommen in der DONAUTON Community.
        </div>
      )}
      
      {status === 'already_subscribed' && (
        <div style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '1rem' }}>
          Diese E-Mail Adresse ist bereits für unseren Newsletter eingetragen.
        </div>
      )}

      {status === 'error' && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '1rem' }}>
          Es gab leider einen Fehler bei der Anmeldung. Bitte versuche es später noch einmal.
        </div>
      )}

      {status !== 'success' && status !== 'already_subscribed' && (
        <form onSubmit={handleSubmit} className="vip-newsletter-form">
          <input 
            type="text" 
            placeholder="Dein Name *" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={status === 'loading'}
            className="vip-newsletter-input"
          />
          <div className="vip-newsletter-divider"></div>
          <input 
            type="email" 
            placeholder="Deine E-Mail Adresse *" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="vip-newsletter-input"
          />
          <button type="submit" disabled={status === 'loading'} className="btn btn-primary vip-newsletter-btn" style={{ opacity: status === 'loading' ? 0.7 : 1 }}>
            {status === 'loading' ? 'Wird eingetragen...' : 'VIP werden'}
          </button>
        </form>
      )}
      
      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '1.5rem' }}>100% Musik, 0% Spam. Abmeldung jederzeit möglich.</p>
    </div>
  );
}
