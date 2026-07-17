'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Turnstile } from '@marsidev/react-turnstile';

export default function GewinnspielClient({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const [formData, setFormData] = useState({
    band: '',
    firstName: '',
    lastName: '',
    address: '',
    zip: '',
    city: '',
    email: '',
    phone: '',
    birthdate: '',
    keyword: '',
    message: ''
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.zip || !formData.city || !formData.email || !formData.phone || !formData.birthdate || !formData.keyword) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (turnstileSiteKey && !turnstileToken) {
      toast.error('Bitte bestätigen Sie, dass Sie ein Mensch sind.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/gewinnspiel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, turnstileToken }),
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Fehler bei der Anmeldung.');
      }
    } catch (err) {
      console.error('Gewinnspiel submit failed', err);
      toast.error('Netzwerkfehler. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(205, 23, 25, 0.08)', color: 'var(--accent)', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 'bold' }}>✓</div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.8rem' }}>Du bist dabei!</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto' }}>
          Vielen Dank für deine Teilnahme. Deine Daten wurden erfolgreich übermittelt. Wir drücken dir die Daumen!
        </p>
      </div>
    );
  }

  const labelStyle = { display: 'block', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' };
  const inputStyle = { width: '100%', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', outline: 'none' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={labelStyle}>Vorname *</label>
          <input type="text" name="firstName" required disabled={isSubmitting} value={formData.firstName} onChange={handleInputChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Nachname *</label>
          <input type="text" name="lastName" required disabled={isSubmitting} value={formData.lastName} onChange={handleInputChange} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Band / Gruppe (optional)</label>
        <input type="text" name="band" disabled={isSubmitting} value={formData.band} onChange={handleInputChange} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Straße & Hausnummer *</label>
        <input type="text" name="address" required disabled={isSubmitting} value={formData.address} onChange={handleInputChange} style={inputStyle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div>
          <label style={labelStyle}>PLZ *</label>
          <input type="text" name="zip" required disabled={isSubmitting} value={formData.zip} onChange={handleInputChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Ort *</label>
          <input type="text" name="city" required disabled={isSubmitting} value={formData.city} onChange={handleInputChange} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={labelStyle}>E-Mail Adresse *</label>
          <input type="email" name="email" required disabled={isSubmitting} value={formData.email} onChange={handleInputChange} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Handynummer *</label>
          <input type="tel" name="phone" required disabled={isSubmitting} value={formData.phone} onChange={handleInputChange} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Geburtstag *</label>
        <input type="date" name="birthdate" required disabled={isSubmitting} value={formData.birthdate} onChange={handleInputChange} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Stichwort *</label>
        <input type="text" name="keyword" required disabled={isSubmitting} value={formData.keyword} onChange={handleInputChange} style={inputStyle} />
      </div>

      <div>
        <label style={labelStyle}>Nachricht (optional)</label>
        <textarea name="message" rows={4} disabled={isSubmitting} value={formData.message} onChange={handleInputChange} style={{ ...inputStyle, resize: 'vertical' }}></textarea>
      </div>

      {turnstileSiteKey && (
        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'center' }}>
          <Turnstile siteKey={turnstileSiteKey} onSuccess={(token) => setTurnstileToken(token)} />
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting || !!(turnstileSiteKey && !turnstileToken)} style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem', opacity: (isSubmitting || (turnstileSiteKey && !turnstileToken)) ? 0.7 : 1 }}>
        {isSubmitting ? 'Wird gesendet...' : 'Am Gewinnspiel teilnehmen'}
      </button>

      <p style={{ fontSize: '0.75rem', color: '#888', textAlign: 'center', marginTop: '1rem' }}>
        Mit der Teilnahme meldest du dich automatisch für unseren Newsletter an und stimmst unseren <a href="/datenschutz" target="_blank" style={{ color: 'var(--accent)' }}>Datenschutzbestimmungen</a> zu.
      </p>
    </form>
  );
}
