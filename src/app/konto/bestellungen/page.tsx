'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const dataStr = localStorage.getItem('donauton_customer');
    if (!dataStr) {
      window.location.href = '/login-customer';
      return;
    }
    const localCustomer = JSON.parse(dataStr);

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(localCustomer.email)}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          setOrders(data.orders);
        } else {
          setError(data.error || 'Fehler beim Laden der Bestellungen');
        }
      } catch (err: any) {
        setError('Verbindungsfehler beim Laden der Bestellungen: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
  };

  const formatCurrency = (amount: number | string) => {
    const nr = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(nr || 0);
  };

  const getStatusColor = (status: string) => {
    if (status === 'SHIPPED') return { bg: '#e0f2fe', text: '#0369a1', label: 'Versendet' };
    if (status === 'PAID') return { bg: '#ecfdf5', text: '#047857', label: 'Bezahlt' };
    if (status === 'PROCESSING') return { bg: '#fef3c7', text: '#b45309', label: 'In Bearbeitung' };
    if (status === 'PENDING') return { bg: '#ffedd5', text: '#c2410c', label: 'Offen' };
    if (status === 'CANCELLED') return { bg: '#fef2f2', text: '#be123c', label: 'Storniert' };
    return { bg: '#f1f5f9', text: '#475569', label: status };
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Meine Bestellungen</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>Hier findest du eine Übersicht all deiner getätigten Bestellungen und Rechnungen.</p>

      {loading && <p style={{ color: '#64748b' }}>Bestellungen werden geladen...</p>}
      
      {!loading && error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecdd3', color: '#be123c', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
         <p style={{ color: '#64748b' }}>Du hast bisher noch keine Bestellungen getätigt.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map(order => {
            const statusConfig = getStatusColor(order.status);
            return (
              <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
                
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{order.id}</h3>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '20px', backgroundColor: statusConfig.bg, color: statusConfig.text }}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Bestellt am: {formatDate(order.date)} • {formatCurrency(order.total)}</p>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{order.items.join(', ')}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#fff', border: '1px solid #cbd5e0', color: '#4a5568' }} disabled>
                    (PDF später)
                  </button>
                  <Link href={`/konto/bestellungen/${order.real_id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'var(--accent)', color: 'white', textDecoration: 'none', textAlign: 'center', borderRadius: '4px' }}>
                    Details
                  </Link>
                </div>
                
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
