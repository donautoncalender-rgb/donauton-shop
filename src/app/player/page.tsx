import AudioPlayer from '../../components/AudioPlayer';

export const dynamic = 'force-dynamic';

export default async function PlayerPage({ searchParams }: { searchParams: Promise<{ url?: string; title?: string }> }) {
  const params = await searchParams;
  const url = params?.url || '';
  const title = params?.title || 'DONAUTON Audio';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 999999 }}>
      <style dangerouslySetInnerHTML={{ __html: `
        header, footer, .header, .footer, nav, .site-header, .top-bar { display: none !important; }
        body { padding: 0 !important; margin: 0 !important; background: '#f5f5f5'; overflow: hidden; }
        .page-container { padding: 0 !important; margin: 0 !important; max-width: none !important; }
      `}} />
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', width: '100%', maxWidth: '100%' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 800, color: '#111', fontSize: '1rem' }}>{title}</h3>
        {url ? <AudioPlayer src={url} /> : <p style={{ textAlign: 'center' }}>Keine Audiodatei gefunden.</p>}
      </div>
    </div>
  );
}
