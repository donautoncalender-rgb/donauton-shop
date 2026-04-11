import BuecherShopClient from '../../components/BuecherShopClient';
import { prisma } from '../../lib/prisma';

export default async function BuecherPage() {
  const dbProducts = await prisma.product.findMany({
    where: { category: 'Bücher' }
  });
  
  const products = dbProducts.map((p: any) => ({
    id: p.id,
    wooId: p.wooId,
    genre: p.genre || 'Fachbuch',
    title: p.title,
    author: p.author || p.composer || '',
    price: p.price,
    badge: p.badge || '',
    description: p.description || '',
    sku: p.sku || '',
    audioPreview: p.audioPreview || null,
    pdfPreview: p.pdfPreview || null,
    youtubeUrl: p.youtubeUrl || null,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=565&fit=crop&q=80',
    slug: p.slug,
    category: p.category || 'Bücher'
  }));

  return (
    <div className="container page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Bücher & Literatur</h1>
        <p className="page-subtitle">
          Fachliteratur, Lehrwerke, und humorvolle Geschichten für jeden Blasmusiker.
        </p>
      </div>

      <BuecherShopClient initialProducts={products} />
    </div>
  );
}
