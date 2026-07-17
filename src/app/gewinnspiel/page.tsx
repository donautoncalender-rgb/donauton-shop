import { prisma } from '../../lib/prisma';
import GewinnspielClient from './GewinnspielClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DONAUTON Gewinnspiel',
  description: 'Melde dich für das DONAUTON Gewinnspiel an.',
  robots: {
    index: false,
    follow: false
  }
};

export default async function GewinnspielPage() {
  const turnstileRecord = await prisma.shopSetting.findUnique({
    where: { key: 'turnstile_site_key' }
  });
  
  const turnstileSiteKey = turnstileRecord?.value || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || null;

  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>DONAUTON Gewinnspiel</h1>
        <p className="page-subtitle">Trage hier deine Daten ein, um am Gewinnspiel teilzunehmen!</p>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '0.2s', backgroundColor: 'var(--surface)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <GewinnspielClient turnstileSiteKey={turnstileSiteKey} />
      </div>
    </div>
  );
}
