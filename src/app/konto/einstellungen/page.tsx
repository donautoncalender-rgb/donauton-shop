'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    street: '',
    zip: '',
    city: '',
    password: ''
  });

  useEffect(() => {
    const dataStr = localStorage.getItem('donauton_customer');
    if (!dataStr) {
      window.location.href = '/login-customer';
      return;
    }

    const localCustomer = JSON.parse(dataStr);
    
    // Zuerst lokale Daten setzen (für schnelles UI)
    setFormData(prev => ({
      ...prev,
      first_name: localCustomer.first_name || '',
      last_name: localCustomer.last_name || '',
      email: localCustomer.email || '',
      company: localCustomer.billing_company || localCustomer.shipping_company || '',
      street: localCustomer.billing_street || localCustomer.shipping_street || '',
      zip: localCustomer.billing_zip || localCustomer.shipping_zip || '',
      city: localCustomer.billing_city || localCustomer.shipping_city || '',
    }));

    // Im Hintergrund frische Daten aus der Suite abfragen
    const fetchFreshData = async () => {
      try {
        const res = await fetch(`/api/customer/me?email=${encodeURIComponent(localCustomer.email)}`);
        const data = await res.json();
        if (res.ok && data.success) {
          const freshCustomer = data.customer;
          // LocalStorage aktualisieren
          localStorage.setItem('donauton_customer', JSON.stringify(freshCustomer));
          // Formular updaten
          setFormData(prev => ({
            ...prev,
            first_name: freshCustomer.first_name || '',
            last_name: freshCustomer.last_name || '',
            company: freshCustomer.billing_company || freshCustomer.shipping_company || '',
            street: freshCustomer.billing_street || freshCustomer.shipping_street || '',
            zip: freshCustomer.billing_zip || freshCustomer.shipping_zip || '',
            city: freshCustomer.billing_city || freshCustomer.shipping_city || '',
          }));
        }
      } catch (e) {
        console.error("Konnte frische Daten nicht laden");
      }
    };
    
    fetchFreshData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/customer/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Fehler beim Speichern.');
      }

      // Update localStorage with the new data from Suite
      localStorage.setItem('donauton_customer', JSON.stringify(result.customer));
      
      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: '' }));
      setSuccessMsg('Deine Daten wurden erfolgreich gespeichert!');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Adressen & Details</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Verwalte deine Standard-Rechnungsadresse und deine Zugangsdaten.</p>

      {successMsg && <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{successMsg}</div>}
      {errorMsg && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{errorMsg}</div>}

      <form style={{ display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '600px' }} onSubmit={(e) => e.preventDefault()}>
        
        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Persönliche Daten</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div><label style={labelStyle}>Vorname</label><input type="text" name="first_name" style={inputStyle} value={formData.first_name} onChange={handleChange} /></div>
            <div><label style={labelStyle}>Nachname</label><input type="text" name="last_name" style={inputStyle} value={formData.last_name} onChange={handleChange} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>E-Mail Adresse (Login)</label><input type="email" name="email" style={inputStyle} value={formData.email} disabled title="E-Mail kann nur vom Support geändert werden" /></div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Standard-Adresse (Für den Checkout)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Firma / Verein (optional)</label><input type="text" name="company" style={inputStyle} value={formData.company} onChange={handleChange} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Straße & Hausnummer</label><input type="text" name="street" style={inputStyle} value={formData.street} onChange={handleChange} /></div>
            <div><label style={labelStyle}>PLZ</label><input type="text" name="zip" style={inputStyle} value={formData.zip} onChange={handleChange} /></div>
            <div><label style={labelStyle}>Ort</label><input type="text" name="city" style={inputStyle} value={formData.city} onChange={handleChange} /></div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Passwort ändern</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div><label style={labelStyle}>Neues Passwort (optional)</label><input type="password" name="password" style={inputStyle} value={formData.password} onChange={handleChange} placeholder="Leer lassen, falls keine Änderung gewünscht" /></div>
          </div>
        </section>

        <button type="button" className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }} onClick={handleSave} disabled={loading}>
          {loading ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </button>

      </form>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#4a5568', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '1rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#f8fafc' };
