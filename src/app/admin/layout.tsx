import Link from 'next/link';
import './admin.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logoutAction } from '../login/actions';
import ToastProvider from '../../components/ToastProvider';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = (await cookies()).get('auth_session');
  
  if (!session || session.value !== 'admin_authenticated') {
    redirect('/login');
  }

  return (
    <div className="admin-layout">
      <ToastProvider />
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          DONAUTON<span>Admin</span>
        </div>
        <nav className="admin-nav">
          <Link href="/admin" className="admin-link">Dashboard</Link>
          <Link href="/admin/homepage" className="admin-link">Startseite gestalten</Link>
          <Link href="/admin/sliders" className="admin-link">Produkt-Slider verwalten</Link>
          <Link href="/admin/pages" className="admin-link">Rechtstexte / Seiten</Link>
          <Link href="/admin/categories" className="admin-link">Kategorien</Link>
          <Link href="/admin/settings" className="admin-link">Einstellungen</Link>
          <hr style={{ margin: '1rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />
          <Link href="/" className="admin-link" style={{ color: '#f87171', fontWeight: 'bold' }}>← Zurück zum Shop</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h2>Shop-Verwaltung</h2>
          <div className="admin-user" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Admin</span>
            <form action={logoutAction}>
              <button type="submit" style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
            </form>
          </div>
        </header>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}
