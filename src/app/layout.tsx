import type { Metadata } from 'next';
import './donauton.css';
import './print.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import CartDrawer from '../components/CartDrawer';
import CookieBanner from '../components/CookieBanner';
import { prisma } from '../lib/prisma';
import { Toaster } from 'react-hot-toast';

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.ico';
  try {
    const setting = await prisma.shopSetting.findUnique({ where: { key: 'logo_url' } });
    if (setting && setting.value) {
      faviconUrl = setting.value;
    }
  } catch (e) {
    // Falls Datenbank noch nicht läuft
  }

  return {
    title: 'DONAUTON Shop - Premium Noten & Musik',
    description: 'Entdecken Sie hochwertige Noten für Blasmusik, CDs, Merchandise und mehr – direkt vom DONAUTON Verlag.',
    icons: {
      icon: `${faviconUrl}?v=${new Date().getTime()}`,
    }
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let shopTitle = "DONAUTON.";
  let logoUrl = null;
  let topBanner = null;
  let notenTaxonomy: { besetzung: string; genres: string[] }[] = [];

  try {
    const settings = await prisma.shopSetting.findMany();
    const settingsMap = settings.reduce((acc, current) => {
      acc[current.key] = current.value;
      return acc;
    }, {} as Record<string, string>);
    
    if (settingsMap['shop_title']) shopTitle = settingsMap['shop_title'];
    if (settingsMap['logo_url']) logoUrl = settingsMap['logo_url'];
    if (settingsMap['announcement_text']) topBanner = settingsMap['announcement_text'];

    // Fetch taxonomy for dropdown
    const notenProducts = await prisma.product.findMany({
      where: { category: 'Noten' },
      select: { genre: true, detailsJson: true }
    });

    const taxonomyMap = new Map<string, Set<string>>();
    notenProducts.forEach((p: any) => {
      let besetzung = 'Sonstige Noten';
      if (p.detailsJson) {
        try {
          const details = JSON.parse(p.detailsJson);
          const bMatch = details.find((d: any) => d.label === 'Besetzung');
          if (bMatch && bMatch.value) besetzung = bMatch.value.trim();
        } catch(e) {}
      }
      
      const genre = p.genre ? p.genre.trim() : 'Ohne Genre';
      if (genre !== 'Ohne Genre') {
        if (!taxonomyMap.has(besetzung)) taxonomyMap.set(besetzung, new Set());
        taxonomyMap.get(besetzung)!.add(genre);
      }
    });

    notenTaxonomy = Array.from(taxonomyMap.entries()).map(([besetzung, genres]) => ({
      besetzung,
      genres: Array.from(genres).sort()
    })).sort((a,b) => a.besetzung.localeCompare(b.besetzung));

  } catch (e) {
    console.log("Database not initialized yet", e);
  }

  return (
    <html lang="de">
      <body>
        <WishlistProvider>
          <CartProvider>
            {topBanner && (
              <div className="announcement-banner">
                {topBanner}
              </div>
            )}
            <Header shopTitle={shopTitle} logoUrl={logoUrl} taxonomy={notenTaxonomy} />
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
