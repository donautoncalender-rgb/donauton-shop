
export const dynamic = 'force-dynamic';

export default async function PdfPreviewPage({ searchParams }: { searchParams: Promise<{ url?: string; title?: string }> }) {
  const params = await searchParams;
  const url = params?.url || '';
  const title = params?.title || 'DONAUTON Noten';
  const fullTitle = `${title} - Lesen`;

  return (
    <>
      <title>{fullTitle}</title>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#333', overflow: 'hidden' }}>
        <style dangerouslySetInnerHTML={{ __html: `
          header, footer, .header, .footer, nav, .site-header, .top-bar { display: none !important; }
          body { padding: 0 !important; margin: 0 !important; background: '#333'; overflow: hidden; }
        `}} />
        {url ? (
          <iframe 
            src={url} 
            style={{ width: '100%', height: '100%', border: 'none' }} 
            title={fullTitle}
          />
        ) : (
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            Keine PDF-Datei gefunden.
          </div>
        )}
      </div>
    </>
  );
}
