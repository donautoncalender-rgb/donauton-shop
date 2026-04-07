import { prisma } from '../../lib/prisma';

export default async function VersandPage() {
  const contentSetting = await prisma.shopSetting.findUnique({ where: { key: 'page_versand' } });
  const titleSetting = await prisma.shopSetting.findUnique({ where: { key: 'page_versand_title' } });

  const title = titleSetting?.value || 'Versand & Zahlung';
  const htmlContent = contentSetting?.value || `
        <h3 style="color: var(--text); font-size: 1.2rem; margin-top: 2rem; margin-bottom: 0.5rem">Digitale Artikel (PDF, Audio)</h3>
        <p>Ein Platzhalter für Versand und Zahlung.</p>
  `;

  return (
    <div className="container page-container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '8rem', paddingBottom: '4rem' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .strict-wrap-container * {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
          max-width: 100% !important;
        }
      `}} />
      <h1 className="page-title animate-fade-in" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>{title}</h1>
      <div 
        className="animate-fade-in text-content-dynamic strict-wrap-container" 
        style={{ 
          animationDelay: '0.1s', 
          lineHeight: 1.8, 
          color: 'var(--text-light)',
          backgroundColor: 'var(--surface)',
          padding: '3rem',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }} 
        dangerouslySetInnerHTML={{ __html: htmlContent }} 
      />
    </div>
  );
}
