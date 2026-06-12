import TicketsShopClient from '../../components/TicketsShopClient';
import CategoryBanner from '../../components/CategoryBanner';
import { prisma } from '../../lib/prisma';

export default async function TicketsPage() {
  const dbProducts = await prisma.product.findMany({
    where: { category: 'Tickets' }
  });
  
  const products = dbProducts.map((p: any) => ({
    id: p.id,
    wooId: p.wooId,
    genre: p.genre || 'Event',
    title: p.title,
    location: p.author || 'Shop', // fallback location
    date: 'Demnächst',
    price: p.price,
    badge: p.badge || '',
    description: p.description || '',
    sku: p.sku || '',
    audioPreview: p.audioPreview || null,
    pdfPreview: p.pdfPreview || null,
    youtubeUrl: p.youtubeUrl || null,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=565&fit=crop&q=80',
    slug: p.slug,
    category: p.category || 'Tickets',
    composer: p.composer || p.artist || 'Event'
  }));

  const bannerSetting = await prisma.shopSetting.findUnique({ where: { key: 'banner_url_tickets' } });
  const customBannerUrl = bannerSetting?.value;

  return (
    <div className="container page-container">
      <CategoryBanner 
        title="Live Konzerte & Tickets"
        subtitle="Besuchen Sie uns live. Sichern Sie sich Tickets für unsere kommenden Touren und Konzerte in Ihrer Nähe."
        imageUrl={customBannerUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80"}
        gradient="linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)"
      />

      <TicketsShopClient initialProducts={products} />
    </div>
  );
}
