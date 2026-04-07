import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import RichTextEditor from '../../../components/RichTextEditor';

async function updatePage(formData: FormData) {
  'use server';
  
  const key = formData.get('key') as string;
  const content = formData.get('content') as string;
  const title = formData.get('title') as string;

  if (!key) return;

  // wir verwenden upsert
  await prisma.shopSetting.upsert({
    where: { key: key },
    update: { value: content },
    create: { key: key, value: content }
  });

  // also upsert title if provided
  if (title) {
    await prisma.shopSetting.upsert({
      where: { key: `${key}_title` },
      update: { value: title },
      create: { key: `${key}_title`, value: title }
    });
  }

  revalidatePath('/admin/pages');
  revalidatePath(`/${key.replace('page_', '')}`);
}

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
              Dein Text wird genauso im Shop dargestellt, wie du ihn hier formatiest.
            </p>

            <form action={updatePage}>
              <input type="hidden" name="key" value={page.key} />
              
              <div className="admin-form-group">
                <label className="admin-label">Seitenüberschrift</label>
                <input 
                  name="title" 
                  type="text" 
                  className="admin-input" 
                  defaultValue={getVal(`${page.key}_title`) || page.name} 
                  required 
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Inhalt</label>
                <RichTextEditor name="content" initialValue={getVal(page.key)} />
              </div>
              
              <button type="submit" className="admin-btn">Speichern & Veröffentlichen</button>
            </form>
          </div>
        ))}
        
      </div>
    </>
  );
}
