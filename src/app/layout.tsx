export const dynamic = "force-dynamic";
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
import { Analytics } from '@vercel/analytics/react';

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = '/favicon.ico';
  try {
    const setting = await prisma.shopSetting.findUnique({ where: { key: 'favicon_url' } });
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
  let faviconUrl = '/favicon.ico';
  let notenTaxonomy: { besetzung: string; items: string[]; type: 'genre' | 'solist' }[] = [];
  let publicComposers: { name: string; slug: string }[] = [];

  try {
    const settings = await prisma.shopSetting.findMany();
    const settingsMap = settings.reduce((acc, current) => {
      acc[current.key] = current.value;
      return acc;
    }, {} as Record<string, string>);
    
    if (settingsMap['shop_title']) shopTitle = settingsMap['shop_title'];
    if (settingsMap['logo_url']) logoUrl = settingsMap['logo_url'];
    if (settingsMap['favicon_url']) faviconUrl = settingsMap['favicon_url'];
    if (settingsMap['announcement_text']) topBanner = settingsMap['announcement_text'];

    // Fetch taxonomy for dropdown
    const notenProducts = await prisma.product.findMany({
      where: { category: 'Noten' },
      select: { genre: true, detailsJson: true }
    });

    const taxonomyMap = new Map<string, { type: 'genre' | 'solist', items: Set<string> }>();
    notenProducts.forEach((p: any) => {
      let besetzung = 'Sonstige Noten';
      if (p.detailsJson) {
        try {
          const details = JSON.parse(p.detailsJson);
          const bMatch = details.find((d: any) => d.label === 'Besetzung');
          if (bMatch && bMatch.value) besetzung = bMatch.value.trim();
        } catch(e) {}
      }
      
      let mainBesetzung = besetzung;
      let subBesetzung: string | null = null;

      // Extract Soloinstrument if present (e.g. "Blasorchester, Solist, Flügelhorn")
      if (besetzung.includes(',') && besetzung.toLowerCase().includes('solist')) {
        const parts = besetzung.split(',');
        if (parts.length >= 2) {
          subBesetzung = parts[parts.length - 1].trim();
          mainBesetzung = parts.slice(0, parts.length - 1).join(',').trim();
        }
      }

      if (!taxonomyMap.has(mainBesetzung)) {
        taxonomyMap.set(mainBesetzung, { type: subBesetzung ? 'solist' : 'genre', items: new Set() });
      }

      if (subBesetzung) {
        taxonomyMap.get(mainBesetzung)!.items.add(subBesetzung);
        taxonomyMap.get(mainBesetzung)!.type = 'solist';
      } else {
        const genre = p.genre ? p.genre.trim() : 'Ohne Genre';
        if (genre !== 'Ohne Genre') {
          genre.split(';').forEach((g: string) => {
            if (g.trim()) taxonomyMap.get(mainBesetzung)!.items.add(g.trim());
          });
        }
      }
    });

    notenTaxonomy = Array.from(taxonomyMap.entries()).map(([besetzung, data]) => ({
      besetzung,
      type: data.type,
      items: Array.from(data.items).sort()
    })).sort((a,b) => a.besetzung.localeCompare(b.besetzung));

    publicComposers = await prisma.composer.findMany({
      select: { name: true, slug: true },
      orderBy: { name: 'asc' }
    });

  } catch (e) {
    console.log("Database not initialized yet", e);
  }

  return (
    <html lang="de">
      <head>
        <link rel="icon" href={`${faviconUrl}?v=${Date.now()}`} sizes="any" />
      </head>
      <body>
        <WishlistProvider>
          <CartProvider>
            {topBanner && (
              <div className="announcement-banner">
                {topBanner}
              </div>
            )}
            <Header shopTitle={shopTitle} logoUrl={logoUrl} taxonomy={notenTaxonomy} composers={publicComposers} />
            <CartDrawer />
            <div style={{ overflowX: 'hidden' }}>
              <main style={{ minHeight: '100vh' }}>
                {children}
              </main>
              <Footer />
            </div>
            <CookieBanner />
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
            <Analytics />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
