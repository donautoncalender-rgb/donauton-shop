import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';

// Server Action: Create
async function createCategory(formData: FormData) {
  'use server';
  
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;

  if (!name || !slug) return;

  await prisma.shopCategory.create({
    data: { name, slug, description }
  });

  revalidatePath('/admin/categories');
  revalidatePath('/noten'); // Update shop frontend
}

// Server Action: Delete
async function deleteCategory(formData: FormData) {
  'use server';
  
  const id = formData.get('id') as string;
  if (!id) return;

  await prisma.shopCategory.delete({
    where: { id }
  });

  revalidatePath('/admin/categories');
  revalidatePath('/noten');
}

export default async function CategoriesPage() {
  const categories = await prisma.shopCategory.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <>
      <h1 style={{ marginBottom: '2rem' }}>Shop Kategorien verwalten</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        
        {/* Category List */}
        <div className="admin-card">
          <h3 className="admin-card-title">Alle Kategorien</h3>
          
          {categories.length === 0 ? (
            <p style={{ color: '#718096' }}>Noch keine Kategorien angelegt.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug / URL</th>
                  <th>Sichtbar</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: '#718096' }}>/{c.slug}</td>
                    <td>{c.isVisible ? 'Ja' : 'Nein'}</td>
                    <td>
                      <form action={deleteCategory} style={{ display: 'inline' }}>
                        <input type="hidden" name="id" value={c.id} />
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#cd1719', cursor: 'pointer', fontWeight: 600 }}>
                          Löschen
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Category Form */}
        <div className="admin-card">
          <h3 className="admin-card-title">Neue Kategorie</h3>
          <form action={createCategory}>
            <div className="admin-form-group">
              <label className="admin-label">Name (z.B. Polkas)</label>
              <input name="name" type="text" className="admin-input" required />
            </div>
            
            <div className="admin-form-group">
              <label className="admin-label">Slug (URL, z.B. polkas)</label>
              <input name="slug" type="text" className="admin-input" required />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Kurze Beschreibung (Optional)</label>
              <textarea name="description" className="admin-input" rows={3} style={{ resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" className="admin-btn" style={{ width: '100%' }}>Kategorie anlegen</button>
          </form>
        </div>

      </div>
    </>
  );
}
