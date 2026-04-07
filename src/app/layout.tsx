import type { Metadata } from 'next';
import './donauton.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import CartDrawer from '../components/CartDrawer';
import CookieBanner from '../components/CookieBanner';
import { prisma } from '../lib/prisma';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'DONAUTON Shop - Premium Noten & Musik',
  description: 'Entdecken Sie hochwertige Noten für Blasmusik, CDs, Merchandise und mehr – direkt vom DONAUTON Verlag.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch global shop settings
  let shopTitle = "DONAUTON.";
  let logoUrl = null;
  let topBanner = null;

  try {
    const settings = await prisma.shopSetting.findMany();
    const settingsMap = settings.reduce((acc, current) => {
      acc[current.key] = current.value;
      return acc;
    }, {} as Record<string, string>);
    
    if (settingsMap['shop_title']) shopTitle = settingsMap['shop_title'];
    if (settingsMap['logo_url']) logoUrl = settingsMap['logo_url'];
    if (settingsMap['announcement_text']) topBanner = settingsMap['announcement_text'];
  } catch (e) {
    console.log("Database not initialized yet", e);
  }

  return (
    <html lang="de">
      <body>
        <WishlistProvider>
          <CartProvider>
            {topBanner && (
              <div style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center', padding: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                {topBanner}
              </div>
            )}
            <Header shopTitle={shopTitle} logoUrl={logoUrl} />
            <CartDrawer />
            <main style={{ minHeight: '100vh' }}>
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
