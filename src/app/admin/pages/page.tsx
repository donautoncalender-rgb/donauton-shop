import { prisma } from '../../../lib/prisma';
import PageForm from './PageForm';

export default async function AdminPages() {
  const settings = await prisma.shopSetting.findMany({
    where: { key: { startsWith: 'page_' } }
  });

  const getVal = (key: string) => settings.find(s => s.key === key)?.value || '';

  const pagesToEdit = [
    { key: 'page_impressum', name: 'Impressum' },
    { key: 'page_agb', name: 'AGB' },
    { key: 'page_datenschutz', name: 'Datenschutz' },
    { key: 'page_versand', name: 'Versand & Zahlung' },
  ];

  return (
    <>
      <h1 style={{ marginBottom: '2rem' }}>Rechtstexte & Seiten bearbeiten</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '2rem' }}>
        
        {pagesToEdit.map((page) => (
          <div className="admin-card" key={page.key}>
            <h3 className="admin-card-title">{page.name} bearbeiten</h3>
            <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Dein Text wird genauso im Shop dargestellt, wie du ihn hier formatierst.
            </p>

            <PageForm 
              pageKey={page.key}
              pageName={page.name}
              initialTitle={getVal(`${page.key}_title`) || page.name}
              initialContent={getVal(page.key)}
            />
          </div>
        ))}
        
      </div>
    </>
  );
}
