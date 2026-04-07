import TicketsShopClient from '../../components/TicketsShopClient';
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
    image: p.imageUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=565&fit=crop&q=80',
    slug: p.slug
  }));

  return (
    <div className="container page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Live Konzerte & Tickets</h1>
        <p className="page-subtitle">
          Besuchen Sie uns live. Sichern Sie sich Tickets für unsere kommenden Touren und Konzerte in Ihrer Nähe.
        </p>
      </div>

      <TicketsShopClient initialProducts={products} />
    </div>
  );
}
