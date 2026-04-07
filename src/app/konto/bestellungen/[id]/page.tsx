'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dataStr = localStorage.getItem('donauton_customer');
    if (!dataStr) {
      window.location.href = '/login-customer';
      return;
    }
    const localCustomer = JSON.parse(dataStr);

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(localCustomer.email)}&orderId=${encodeURIComponent(id as string)}`);
        const data = await res.json();
        
        if (res.ok && data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Fehler beim Laden der Bestellung');
        }
      } catch (err: any) {
        setError('Verbindungsfehler beim Laden: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Möchtest du diese Bestellung wirklich verbindlich stornieren?')) return;
    
    setCancelling(true);
    try {
      const dataStr = localStorage.getItem('donauton_customer');
      if (!dataStr) return;
      const localCustomer = JSON.parse(dataStr);

      const res = await fetch(`/api/customer/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: localCustomer.email, orderId: id, action: 'cancel' })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOrder({ ...order, status: 'CANCELLED' });
        alert('Bestellung erfolgreich storniert.');
      } else {
        alert(data.error || 'Stornierung fehlgeschlagen');
      }
    } catch (err: any) {
        alert('Fehler: ' + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(isoString));
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

  if (loading) return <div className="animate-fade-in"><p style={{ color: '#64748b' }}>Bestelldetails werden geladen...</p></div>;
  if (error) return <div className="animate-fade-in"><div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecdd3', color: '#be123c', borderRadius: '8px' }}>{error}</div></div>;
  if (!order) return <div className="animate-fade-in"><p>Bestellung nicht gefunden.</p></div>;

  const statusConfig = getStatusColor(order.status);
  const canCancel = order.status === 'PENDING' || order.status === 'PROCESSING';

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => router.push('/konto/bestellungen')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', fontSize: '1rem', fontWeight: 600 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Zurück
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Bestellung {order.order_number}</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Eingegangen am {formatDate(order.created_at)}</p>
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: statusConfig.bg, color: statusConfig.text }}>
          {statusConfig.label}
        </span>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Artikel</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {order.items?.map((item: any) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1rem' }}>{item.quantity}x {item.title_snapshot || item.work?.title}</p>
                {item.item_type && <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Typ: {item.item_type}</p>}
              </div>
              <p style={{ fontWeight: 600 }}>{formatCurrency(item.unit_price_gross)}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px dashed #e2e8f0', fontSize: '1.1rem', fontWeight: 700 }}>
          <span>Gesamtbetrag</span>
          <span>{formatCurrency(order.total_gross)}</span>
        </div>
      </div>

      {canCancel && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecdd3', borderRadius: '12px', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9f1239', marginBottom: '0.3rem' }}>Bestellung stornieren</h3>
            <p style={{ fontSize: '0.9rem', color: '#be123c' }}>Du kannst diese Bestellung noch stornieren, da sie noch nicht versendet oder digital abgerufen wurde.</p>
          </div>
          <button 
            onClick={handleCancel}
            disabled={cancelling}
            style={{ padding: '0.6rem 1.2rem', backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.7 : 1 }}
          >
            {cancelling ? 'Wird storniert...' : 'Jetzt Stornieren'}
          </button>
        </div>
      )}
    </div>
  );
}
