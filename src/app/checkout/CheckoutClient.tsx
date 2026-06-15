'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Turnstile } from '@marsidev/react-turnstile';

export default function CheckoutClient({ paypalClientId, turnstileSiteKey, shippingZones = [] }: { paypalClientId: string | null, turnstileSiteKey: string | null, shippingZones?: any[] }) {
  const { items, cartTotal, clearCart } = useCart();
  const paypalOrderIdRef = useRef<string | null>(null);
  
  // Dynamic Shipping Logic
  const hasOnlyDigitalItems = items.length > 0 && items.every(item => item.variant === 'Digital');
  const hasDigitalItems = items.some(item => item.variant === 'Digital');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', companyName: '',
    address: '', zip: '', city: '', country: 'DE', email: '', payment: 'PayPal',
    newsletter: true, createAccount: true, password: ''
  });

  // Calculate dynamic shipping based on zones
  let shippingCost = hasOnlyDigitalItems ? 0.00 : 4.90; // Fallback
  if (!hasOnlyDigitalItems && shippingZones.length > 0) {
    const matchedZone = shippingZones.find((z: any) => 
      z.countries.split(',').map((c: string) => c.trim().toUpperCase()).includes(formData.country.toUpperCase())
    );
    if (matchedZone) {
      if (matchedZone.freeShippingThreshold > 0 && cartTotal >= matchedZone.freeShippingThreshold) {
        shippingCost = 0.00;
      } else {
        shippingCost = matchedZone.price;
      }
    }
  }

  const grandTotal = cartTotal + shippingCost;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [existingAccountWarning, setExistingAccountWarning] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [attendeeNames, setAttendeeNames] = useState<Record<string, string[]>>({});
  const ticketItems = items.filter((item: any) => 
    item.category === 'Tickets' || 
    item.category === 'TICKET' || 
    item.title.toLowerCase().includes('ticket')
  );
  const hasTickets = ticketItems.length > 0;

  useEffect(() => {
    const initialNames: Record<string, string[]> = {};
    items.forEach((item: any) => {
      const isTicket = item.category === 'Tickets' || item.category === 'TICKET' || item.title.toLowerCase().includes('ticket');
      if (isTicket) {
        initialNames[item.id] = Array(item.quantity).fill('');
      }
    });
    setAttendeeNames(prev => {
      const next = { ...initialNames };
      Object.keys(next).forEach(id => {
        if (prev[id]) {
          for (let i = 0; i < Math.min(prev[id].length, next[id].length); i++) {
            next[id][i] = prev[id][i];
          }
        }
      });
      return next;
    });
  }, [items]);

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
    setFormData({ ...formData, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  const handleEmailBlur = async () => {
    if (!formData.email || isLoggedIn) return;
    try {
      const res = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      setExistingAccountWarning(!!data.exists);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, paymentStatus: string = 'pending') => {
    if (e) e.preventDefault();
    
    if (formData.payment !== 'PayPal' && formData.createAccount && !isLoggedIn && !formData.password) {
      alert('Bitte lege ein Passwort für dein neues Kundenkonto fest.');
      return;
    }

    if (formData.payment !== 'PayPal' && turnstileSiteKey && !turnstileToken) {
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
          items: items.map((item: any) => ({
            ...item,
            attendeeNames: attendeeNames[item.id] || []
          })),
          totals: { subtotal: cartTotal, shipping: shippingCost, total: grandTotal },
          paymentStatus: paymentStatus,
          turnstileToken
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
          return;
        }
        setSuccess(true);
        setOrderDetails(data);
        clearCart();
      } else {
        alert((data.error || 'Ein Fehler ist aufgetreten') + (data.details ? '\nDetails: ' + data.details : ''));
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

      <form className="checkout-layout" onSubmit={handleSubmit}>
        
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
            {existingAccountWarning && !isLoggedIn && (
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#92400e', fontSize: '0.9rem' }}>Wir haben ein bestehendes Kundenkonto für <strong>{formData.email}</strong> gefunden!</span>
                <Link href="/login-customer" onClick={() => localStorage.setItem('redirect_after_login', '/checkout')} style={{ backgroundColor: '#f59e0b', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', color: 'white' }}>
                  Jetzt Einloggen
                </Link>
              </div>
            )}
          </div>

          {/* Step 1 */}
          <section>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '2rem' }}>1. Rechnungsdetails</h2>
            <div className="checkout-form-grid">
              <div><label style={labelStyle}>Vorname</label><input required name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div><label style={labelStyle}>Nachname</label><input required name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Firma (optional)</label><input name="companyName" value={formData.companyName} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Straße & Hausnummer</label><input required name="address" value={formData.address} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div><label style={labelStyle}>PLZ</label><input required name="zip" value={formData.zip} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div><label style={labelStyle}>Ort</label><input required name="city" value={formData.city} onChange={handleInputChange} type="text" style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Land</label>
                <select name="country" value={formData.country} onChange={handleInputChange as any} style={inputStyle} required>
                  <option value="DE">Deutschland</option>
                  <option value="AT">Österreich</option>
                  <option value="CH">Schweiz</option>
                  <option value="NL">Niederlande</option>
                  <option value="BE">Belgien</option>
                  <option value="LU">Luxemburg</option>
                  <option value="FR">Frankreich</option>
                  <option value="IT">Italien</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>E-Mail Adresse (für Bestellbestätigung & Rechnungen)</label>
                <input required name="email" value={formData.email} onChange={handleInputChange} onBlur={handleEmailBlur} type="email" style={inputStyle} />
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#4a5568' }}>
                  <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleInputChange} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }} />
                  Ich möchte über Neuigkeiten (DONAUTON Newsletter) informiert werden.
                </label>

                {!isLoggedIn && (
                  <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                      <input type="checkbox" name="createAccount" checked={formData.createAccount} onChange={handleInputChange} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)' }} />
                      Ein Kundenkonto für zukünftige Bestellungen erstellen
                    </label>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', marginLeft: '1.7rem' }}>Erhalte Zugriff auf deine Bestellhistorie, digitale Downloads und Rechnungen.</p>
                    
                    {formData.createAccount && (
                      <div style={{ marginTop: '1rem', marginLeft: '1.7rem' }}>
                        <label style={{ ...labelStyle, fontSize: '0.85rem' }}>Passwort festlegen *</label>
                        <input required name="password" value={formData.password} onChange={handleInputChange} type="password" style={{ ...inputStyle, padding: '0.8rem' }} placeholder="Dein sicheres Passwort" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Step 1.5: Ticket Personalisierung */}
          {hasTickets && (
            <section style={{ backgroundColor: '#fff5f5', border: '1px solid #feb2b2', padding: '2rem', borderRadius: '12px', marginTop: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c53030', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '24px', height: '24px' }}>
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
                  <path d="M13 5v14" />
                </svg>
                Ticket-Personalisierung
              </h2>
              <p style={{ color: '#742a2a', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                Um Ticket-Missbrauch zu verhindern, sind Eintrittskarten personengebunden. Bitte tragen Sie hier die Namen der Konzertbesucher ein. 
                <strong> Falls ein Feld leer gelassen wird, wird das Ticket automatisch auf den Besteller ({formData.firstName} {formData.lastName || 'Besteller'}) ausgestellt.</strong>
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {ticketItems.map((item: any) => (
                  <div key={item.id} style={{ borderLeft: '4px solid #f56565', paddingLeft: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#2d3748', marginBottom: '0.8rem', fontSize: '1rem' }}>
                      {item.title} ({item.quantity} {item.quantity === 1 ? 'Ticket' : 'Tickets'})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {Array.from({ length: item.quantity }).map((_, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4a5568' }}>
                            Ticket #{idx + 1} - Name des Besuchers
                          </label>
                          <input 
                            type="text"
                            placeholder={`${formData.firstName} ${formData.lastName || 'Besteller'} (Standard)`}
                            value={attendeeNames[item.id]?.[idx] || ''}
                            onChange={(e) => {
                              const newNames = [...(attendeeNames[item.id] || [])];
                              newNames[idx] = e.target.value;
                              setAttendeeNames(prev => ({
                                ...prev,
                                [item.id]: newNames
                              }));
                            }}
                            style={{ 
                              width: '100%', 
                              padding: '0.8rem', 
                              border: '1px solid #cbd5e0', 
                              borderRadius: '6px', 
                              fontSize: '0.95rem',
                              backgroundColor: 'white'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

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
                  onClick={(data, actions) => {
                    const isValid = formData.firstName && formData.lastName && formData.address && formData.zip && formData.city && formData.email;
                    if (!isValid) {
                      alert("Bitte füllen Sie alle erforderlichen Rechnungsdetails aus.");
                      return actions.reject();
                    }
                    if (formData.createAccount && !isLoggedIn && !formData.password) {
                      alert("Bitte legen Sie ein Passwort für Ihr neues Kundenkonto fest.");
                      return actions.reject();
                    }
                    return actions.resolve();
                  }}
                  createOrder={async (data, actions) => {
                    try {
                      // 1. Create a pending order on the backend first to get the sequential order number
                      const response = await fetch('/api/checkout', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          formData,
                          items: items.map((item: any) => ({
                            ...item,
                            attendeeNames: attendeeNames[item.id] || []
                          })),
                          totals: { subtotal: cartTotal, shipping: shippingCost, total: grandTotal },
                          paymentStatus: 'pending'
                        })
                      });

                      const resData = await response.json();
                      if (!resData.success) {
                        alert(resData.error || 'Fehler beim Vorbereiten der PayPal-Zahlung');
                        throw new Error(resData.error || 'Failed to create order');
                      }

                      // Save order ID for the onApprove callback
                      paypalOrderIdRef.current = resData.orderId;

                      // 2. Map items for PayPal payload
                      const paypalItems = items.map((item: any) => {
                        const cleanPrice = parseFloat(item.price).toFixed(2);
                        const cleanQuantity = parseInt(item.quantity).toString();
                        return {
                          name: item.title + (item.variant && item.variant !== 'Digital' ? ` (${item.variant})` : ''),
                          unit_amount: {
                            currency_code: 'EUR',
                            value: cleanPrice
                          },
                          quantity: cleanQuantity,
                          category: (item.variant === 'Digital' ? 'DIGITAL_GOODS' : 'PHYSICAL_GOODS') as 'DIGITAL_GOODS' | 'PHYSICAL_GOODS'
                        };
                      });

                      // 3. Create the PayPal order with detailed breakdown and items
                      return actions.order.create({
                        intent: 'CAPTURE',
                        purchase_units: [{
                          invoice_id: resData.orderNumber,
                          custom_id: resData.orderId,
                          amount: {
                            currency_code: 'EUR',
                            value: grandTotal.toFixed(2),
                            breakdown: {
                              item_total: {
                                currency_code: 'EUR',
                                value: cartTotal.toFixed(2)
                              },
                              shipping: {
                                currency_code: 'EUR',
                                value: shippingCost.toFixed(2)
                              }
                            }
                          },
                          items: paypalItems
                        }]
                      });
                    } catch (error) {
                      console.error('PayPal createOrder error:', error);
                      throw error;
                    }
                  }}
                  onApprove={async (data, actions) => {
                    if (actions.order) {
                      setLoading(true);
                      try {
                        const details = await actions.order.capture();
                        const orderId = paypalOrderIdRef.current;
                        
                        if (!orderId) {
                          alert('Fehler: Keine zugehörige Bestellungs-ID gefunden.');
                          setLoading(false);
                          return;
                        }

                        // Call the confirm API to finalize the order and trigger ERP sync
                        const confirmRes = await fetch('/api/checkout/confirm', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderId,
                            formData
                          })
                        });

                        const confirmData = await confirmRes.json();
                        if (confirmData.success) {
                          setSuccess(true);
                          setOrderDetails(confirmData);
                          clearCart();
                        } else {
                          alert((confirmData.error || 'Fehler bei der Bestellungsbestätigung') + (confirmData.details ? '\nDetails: ' + confirmData.details : ''));
                        }
                      } catch (captureError: any) {
                        console.error('PayPal capture error:', captureError);
                        alert('Zahlung konnte nicht erfasst werden: ' + captureError.message);
                      } finally {
                        setLoading(false);
                      }
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
            Mit der Bestellung stimmen Sie unseren <Link href="/agb" target="_blank" style={{ textDecoration: 'underline', color: 'inherit' }}>AGB</Link> und <Link href="/datenschutz" target="_blank" style={{ textDecoration: 'underline', color: 'inherit' }}>Datenschutzbestimmungen</Link> zu.
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
