import { prisma } from '../../lib/prisma';
import SyncButton from './SyncButton';

export default async function AdminDashboard() {
  const categoryCount = await prisma.shopCategory.count();
  const titleSetting = await prisma.shopSetting.findUnique({ where: { key: 'shop_title' } });
  const logoSetting = await prisma.shopSetting.findUnique({ where: { key: 'logo_url' } });
  const productCount = await prisma.product.count();

  return (
    <>
      <h1 style={{ marginBottom: '2rem' }}>Willkommen in der Shop-Verwaltung</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
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
        </div>
        <div className="admin-card" style={{ marginBottom: 0, backgroundColor: 'rgba(205, 23, 25, 0.05)', border: '1px solid rgba(205, 23, 25, 0.2)' }}>
          <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Shop-Synchronisation</div>
          <div style={{ fontSize: '0.9rem', color: '#2d3748', marginTop: '0.5rem' }}>
            Lädt alle relevanten "Work"-Einträge (die für den Shop markiert wurden) aus der DONAUTON-Suite in diese SQLite Datenbank.
          </div>
          <SyncButton />
        </div>
      </div>
    </>
  );
}
