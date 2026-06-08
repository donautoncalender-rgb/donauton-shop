import { prisma } from '../../../lib/prisma';
import { syncOrderDetails } from '../../api/checkout/sync';
import ClearCartHelper from './ClearCartHelper';
import Link from 'next/link';
import { headers } from 'next/headers';

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
    order_id?: string;
  }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const sessionId = resolvedParams.session_id;
  const orderId = resolvedParams.order_id;

  if (!sessionId || !orderId) {
    return (
      <div className="container page-container" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#c53030' }}>Ungültige Bestellung</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>Bestelldaten oder Zahlungssitzung konnten nicht gefunden werden.</p>
        <Link href="/checkout" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>Zurück zur Kasse</Link>
      </div>
    );
  }

  try {
    // Fetch order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return (
        <div className="container page-container" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#c53030' }}>Bestellung nicht gefunden</h1>
          <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>Die Bestellung existiert nicht in unserer Datenbank.</p>
          <Link href="/checkout" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>Zurück zur Kasse</Link>
        </div>
      );
    }

    // Fetch Stripe key and session
    const stripeSecretKeySetting = await prisma.shopSetting.findUnique({
      where: { key: 'stripe_secret_key' }
    });
    const stripeSecretKey = stripeSecretKeySetting?.value || process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('Stripe-Zugangsdaten (Secret Key) sind nicht in der Datenbank konfiguriert.');
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return (
        <div className="container page-container" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
          <div style={{ width: '80px', height: '80px', background: '#c53030', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Zahlung ausstehend</h1>
          <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>Ihre Zahlung mit der Kreditkarte konnte nicht abgeschlossen werden.</p>
          <Link href="/checkout" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>Zurück zur Kasse</Link>
        </div>
      );
    }

    // If paid, update order status and trigger sync
    if (order.status !== 'PAID') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' }
      });

      const headersList = await headers();
      const protocol = headersList.get('x-forwarded-proto') || 'http';
      const host = headersList.get('host') || 'localhost:3000';
      const baseUrl = `${protocol}://${host}`;

      await syncOrderDetails(
        orderId,
        {
          password: session.metadata?.password || undefined,
          createAccount: session.metadata?.createAccount === 'true',
          newsletter: session.metadata?.newsletter === 'true',
          finalPaymentStatus: 'paid'
        },
        baseUrl
      );
    }

    return (
      <div className="container page-container animate-fade-in" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <ClearCartHelper />
        <div style={{ width: '80px', height: '80px', background: '#00a651', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Vielen Dank für Ihre Bestellung!</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.2rem', marginBottom: '1rem' }}>Ihre Bestellnummer lautet: <strong>{order.orderNumber}</strong></p>
        <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>Wir haben eine Bestätigung an {order.email} gesendet.</p>
        <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>Zurück zum Shop</Link>
      </div>
    );

  } catch (error: any) {
    console.error("Error processing successful Stripe session:", error);
    return (
      <div className="container page-container" style={{ padding: '6rem 2rem', textAlign: 'center', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#c53030' }}>Fehler bei der Bestellungsbestätigung</h1>
        <p style={{ color: 'var(--text-light)', marginBottom: '3rem' }}>Es gab ein Problem beim Abrufen Ihrer Zahlungsdetails: {error.message}</p>
        <Link href="/checkout" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', textDecoration: 'none' }}>Zurück zur Kasse</Link>
      </div>
    );
  }
}
