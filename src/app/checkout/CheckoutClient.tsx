'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Turnstile } from '@marsidev/react-turnstile';

export default function CheckoutClient({ paypalClientId, turnstileSiteKey }: { paypalClientId: string | null, turnstileSiteKey: string | null }) {
  const { items, cartTotal, clearCart } = useCart();
  
  // Dynamic Shipping Logic
  const hasOnlyDigitalItems = items.length > 0 && items.every(item => item.variant === 'Digital');
  const hasDigitalItems = items.some(item => item.variant === 'Digital');
  const shippingCost = hasOnlyDigitalItems ? 0.00 : 4.90;
  
  const grandTotal = cartTotal + shippingCost;

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '',
    address: '', zip: '', city: '', email: '', payment: 'PayPal'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // MOCK: Check if "Session" exists and autofill
  useEffect(() => {
    const savedCustomer = localStorage.getItem('donauton_customer');
    if (savedCustomer) {
      const data = JSON.parse(savedCustomer);
      setFormData(prev => ({ 
        ...prev, 
        firstName: data.first_name || prev.firstName,
        lastName: data.last_name || prev.lastName,
        email: data.email || prev.email,
        companyName: data.billing_company || data.shipping_company || prev.companyName,
        address: data.billing_street || data.shipping_street || prev.address,
        zip: data.billing_zip || data.shipping_zip || prev.zip,
        city: data.billing_city || data.shipping_city || prev.city,
        // Override saved payment if set to Rechnung but cart has digital items
        payment: (prev.payment === 'Rechnung' && items.some((i: any) => i.variant === 'Digital')) ? 'PayPal' : prev.payment
      }));
      setIsLoggedIn(true);
    } else {
      if (items.some((i: any) => i.variant === 'Digital')) {
        setFormData(prev => ({ ...prev, payment: 'PayPal' }));
      }
    }
  }, [items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e?: React.FormEvent, paymentStatus: string = 'pending') => {
    if (e) e.preventDefault();
    if (turnstileSiteKey && !turnstileToken) {
      alert('Bitte bestätigen Sie, dass Sie kein Roboter sind.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          items,
          totals: { subtotal: cartTotal, shipping: shippingCost, total: grandTotal },
          paymentStatus: paymentStatus,
          turnstileToken
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setOrderDetails(data);
        clearCart();
      } else {
        alert(data.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (error) {
      alert('Fehler bei der Verbindung zum Server');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container page-container animate-fade-in" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <div style={{ width: '80px', height: '80px', background: '#00a651', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Vielen Dank für Ihre Bestellung!</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', marginBottom: '1rem' }}>Ihre Bestellnummer lautet: <strong>{orderDetails?.orderNumber}</strong></p>
        <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>Wir haben eine Bestätigung an {formData.email} gesendet.</p>
        <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>Zurück zum Shop</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1" style={{ opacity: 0.5, marginBottom: '2rem' }}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 0 1-8 0"></path>
        </svg>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ihr Warenkorb ist leer</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Entdecken Sie unsere große Auswahl an Noten.</p>
        <Link href="/noten" className="btn btn-primary" style={{ textDecoration: 'none' }}>Zum Shop zurückkehren</Link>
      </div>
    );
  }

  return (
    <div className="container page-container animate-fade-in" style={{ padding: '4rem 2rem' }}>
      <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Kasse</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 400px', gap: '4rem', alignItems: 'start' }}>
        
        {/* Left Side: Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* HEADER -> GUEST / LOGIN WARNING */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {!isLoggedIn ? (
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Du bestellst aktuell als <strong>Gast</strong>. Deine Daten werden nicht gespeichert.</span>
                <Link href="/login-customer" onClick={() => localStorage.setItem('redirect_after_login', '/checkout')} style={{ backgroundColor: 'white', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', color: 'var(--text)' }}>
                  Anmelden
                </Link>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#831843', fontSize: '0.9rem' }}>Angemeldet als <strong>{formData.firstName} {formData.lastName}</strong>. Daten automatisch eingefügt!</span>
                <button type="button" onClick={() => { localStorage.removeItem('donauton_customer'); window.location.reload(); }} style={{ backgroundColor: 'transparent', border: 'none', color: '#831843', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                  Abmelden
                </button>
              </div>
            )}
          </div>

          {/* Step 1 */}
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>1. Rechnungsdetails</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div><label style={labelStyle}>Vorname</label><input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div><label style={labelStyle}>Nachname</label><input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Firma (optional)</label><input name="companyName" value={formData.companyName} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Straße & Hausnummer</label><input required name="address" value={formData.address} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div><label style={labelStyle}>PLZ</label><input required name="zip" value={formData.zip} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div><label style={labelStyle}>Ort</label><input required name="city" value={formData.city} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>E-Mail Adresse (für Bestellbestätigung & Rechnungen)</label><input required name="email" value={formData.email} onChange={handleInputChange} type="email" style={inputStyle} /></div>
            </div>
          </section>

          {/* Step 2 */}
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>2. Zahlungsmethode</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={paymentBoxStyle}>
                <input type="radio" name="payment" value="PayPal" checked={formData.payment === 'PayPal'} onChange={handleInputChange} style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                <span style={{ fontWeight: 600, flexGrow: 1 }}>PayPal</span>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '24px' }} />
              </label>
              <label style={paymentBoxStyle}>
                <input type="radio" name="payment" value="Kreditkarte" checked={formData.payment === 'Kreditkarte'} onChange={handleInputChange} style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                <span style={{ fontWeight: 600, flexGrow: 1 }}>Kreditkarte</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MC" style={{ height: '24px' }} />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" style={{ height: '24px' }} />
                </div>
              </label>
              {!hasDigitalItems && (
                <label style={paymentBoxStyle}>
                  <input type="radio" name="payment" value="Rechnung" checked={formData.payment === 'Rechnung'} onChange={handleInputChange} style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }} />
                  <span style={{ fontWeight: 600, flexGrow: 1 }}>Kauf auf Rechnung</span>
                </label>
              )}
            </div>
          </section>

        </div>

        {/* Right Side: Order Summary */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>Ihre Bestellung</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            {items.map((item: any) => (
              <div key={`${item.id}-${item.variant}`} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                   <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--primary)', color: 'white', width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{item.quantity}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.1rem' }}>{item.title}</div>
                  {item.publisher && item.publisher !== 'Donauton' && (
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>Verlag: {item.publisher}</div>
                  )}
                  <div style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{item.variant}</div>
                  <div style={{ fontWeight: 600, marginTop: '4px' }}>{(item.price * item.quantity).toFixed(2).replace('.', ',')} €</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
              <span>Zwischensumme</span>
              <span>{cartTotal.toFixed(2).replace('.', ',')} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-light)' }}>
              <span>Versandkosten</span>
              <span>{shippingCost === 0 ? 'Kostenlos (Digital)' : `${shippingCost.toFixed(2).replace('.', ',')} €`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text)' }}>
              <span>Gesamtsumme</span>
              <span>{grandTotal.toFixed(2).replace('.', ',')} €</span>
            </div>
          </div>

          {(formData.payment === 'PayPal' && paypalClientId) ? (
            <div style={{ marginTop: '1.5rem', zIndex: 0, position: 'relative' }}>
              <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "EUR", intent: "capture" }}>
                <PayPalButtons
                  style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      intent: "CAPTURE",
                      purchase_units: [{ amount: { currency_code: "EUR", value: grandTotal.toFixed(2) } }]
                    });
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      const details = await actions.order.capture();
                      await handleSubmit(undefined, 'paid');
                    }
                  }}
                  onError={(err) => {
                    console.error("PayPal Error:", err);
                    alert("Zahlung fehlgeschlagen. Bitte versuche es erneut.");
                  }}
                />
              </PayPalScriptProvider>
            </div>
          ) : (
            <>
              {turnstileSiteKey && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <Turnstile siteKey={turnstileSiteKey} onSuccess={(token) => setTurnstileToken(token)} />
                </div>
              )}
              <button type="submit" disabled={loading || !!(turnstileSiteKey && !turnstileToken)} className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', opacity: (loading || (turnstileSiteKey && !turnstileToken)) ? 0.7 : 1 }}>
                {loading ? 'Verarbeite...' : 'Zahlungspflichtig bestellen'}
              </button>
            </>
          )}

          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '1rem' }}>
            Mit der Bestellung stimmen Sie unseren AGB und Datenschutzbestimmungen zu.
          </div>
        </div>

      </form>
    </div>
  );
}

// Inline styles for fast beautiful inputs
const labelStyle = { display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#4a5568', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '1rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem', backgroundColor: '#f8fafc' };
const paymentBoxStyle = { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', border: '1px solid #cbd5e0', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white' };
