import { prisma } from '../../lib/prisma';
import SyncButton from './SyncButton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboard() {
  const categoryCount = await prisma.shopCategory.count();
  const titleSetting = await prisma.shopSetting.findUnique({ where: { key: 'shop_title' } });
  const logoSetting = await prisma.shopSetting.findUnique({ where: { key: 'logo_url' } });
  const productCount = await prisma.product.count();
  
  const categoryBreakdown = await prisma.product.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { category: 'asc' }
  });

  return (
    <>
      <h1 style={{ marginBottom: '2rem' }}>Willkommen in der Shop-Verwaltung</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div style={{ color: '#718096', fontWeight: 600, marginBottom: '0.5rem' }}>Eingestelltes Logo / Titel</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--primary)', marginTop: '0.5rem' }}>
            {logoSetting?.value ? (
              <img src={logoSetting.value} alt="Logo" style={{ maxHeight: '30px', objectFit: 'contain' }} />
            ) : (
              titleSetting?.value || "DONAUTON."
            )}
          </div>
        </div>
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div style={{ color: '#718096', fontWeight: 600, marginBottom: '0.5rem' }}>Verbundene Suite Datenbank</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2d3748' }}>{productCount} Produkte</div>
          <div style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem' }}>sind aktuell synchronisiert.</div>
          
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {categoryBreakdown.map(cat => (
              <div key={cat.category} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4a5568' }}>
                <span>{cat._count.id} in {cat.category}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-card" style={{ marginBottom: 0, backgroundColor: 'rgba(205, 23, 25, 0.05)', border: '1px solid rgba(205, 23, 25, 0.2)' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Shop-Synchronisation</div>
          <div style={{ fontSize: '0.9rem', color: '#2d3748', marginTop: '0.5rem' }}>
            Lädt alle relevanten "Work"-Einträge (die für den Shop markiert wurden) aus der DONAUTON-Suite in diese SQLite Datenbank.
          </div>
          <SyncButton />
        </div>
        <div className="admin-card" style={{ marginBottom: 0, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <div style={{ color: '#166534', fontWeight: 600, marginBottom: '0.5rem' }}>Shop-Backup</div>
          <div style={{ fontSize: '0.9rem', color: '#14532d', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Sichere oder stelle Einstellungen, Slider und Kategorien deines Shops wieder her.
          </div>
          <Link href="/admin/backups" className="btn btn-primary" style={{ display: 'inline-block', backgroundColor: '#16a34a', border: 'none', padding: '0.6rem 1rem', fontSize: '0.9rem', color: 'white', textDecoration: 'none', borderRadius: '4px', textAlign: 'center' }}>
            Backup-Verwaltung öffnen
          </Link>
        </div>
        <div className="admin-card" style={{ marginBottom: 0, backgroundColor: '#fdf4ff', border: '1px solid #fbcfe8' }}>
          <div style={{ color: '#86198f', fontWeight: 600, marginBottom: '0.5rem' }}>Besucher-Statistik (Traffic)</div>
          <div style={{ fontSize: '0.9rem', color: '#701a75', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Die grafische Auswertung deiner Shop-Besucher (Seitenaufrufe, beliebte Seiten, Herkunft) findest du in deinem Vercel Web Analytics Dashboard (100% DSGVO-konform ohne Cookies).
          </div>
          <a href="https://vercel.com/lukas-bruckmeyers-projects/donauton-shop/analytics" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-block', backgroundColor: '#a21caf', border: 'none', padding: '0.6rem 1rem', fontSize: '0.9rem', color: 'white', textDecoration: 'none', borderRadius: '4px', textAlign: 'center' }}>
            Traffic & Analytics öffnen
          </a>
        </div>
      </div>
    </>
  );
}
