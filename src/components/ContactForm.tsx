'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ContactForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !message) {
      toast.error('Bitte füllen Sie alle Felder aus.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/kontakt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, message }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        toast.success('Nachricht erfolgreich gesendet!');
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Fehler beim Senden der Nachricht.');
      }
    } catch (err) {
      console.error('Submit contact failed', err);
      toast.error('Netzwerkfehler. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '64px', 
          height: '64px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(205, 23, 25, 0.08)', 
          color: 'var(--accent)',
          marginBottom: '1.5rem',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          ✓
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.8rem' }}>
          Vielen Dank für Ihre Nachricht!
        </h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto' }}>
          Wir haben Ihre Anfrage erhalten und werden uns so schnell wie möglich bei Ihnen unter <strong>{email}</strong> melden.
        </p>
        <button 
          onClick={() => {
            setIsSubmitted(false);
            setFirstName('');
            setLastName('');
            setEmail('');
            setMessage('');
          }}
          className="btn btn-secondary" 
          style={{ marginTop: '2rem', padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}
        >
          Weitere Nachricht senden
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Vorname</label>
          <input 
            type="text" 
            required 
            disabled={isSubmitting}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', outline: 'none' }} 
          />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nachname</label>
          <input 
            type="text" 
            required 
            disabled={isSubmitting}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', outline: 'none' }} 
          />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>E-Mail Adresse</label>
        <input 
          type="email" 
          required 
          disabled={isSubmitting}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', outline: 'none' }} 
        />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Ihre Nachricht</label>
        <textarea 
          rows={6} 
          required 
          disabled={isSubmitting}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', resize: 'vertical', outline: 'none' }}
        ></textarea>
      </div>
      <button 
        type="submit" 
        className="btn btn-primary" 
        disabled={isSubmitting}
        style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
      >
        {isSubmitting ? 'Wird gesendet...' : 'Nachricht absenden'}
      </button>
    </form>
  );
}
