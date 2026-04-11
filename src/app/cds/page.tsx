import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import CDsShopClient from '../../components/CDsShopClient';

export default async function CDsShop() {
  const categories = await prisma.shopCategory.findMany({
    where: { isVisible: true },
    orderBy: { sortOrder: 'asc' }
  });

  const dbProducts = await prisma.product.findMany({
    where: { category: 'CDs' }
  });
  
  const products = dbProducts.map((p: any) => ({
    id: p.id,
    wooId: p.wooId,
    genre: p.genre || 'Audio CD',
    title: p.title,
    artist: p.artist || p.composer || '',
    price: p.price,
    badge: p.badge || '',
    description: p.description || '',
    sku: p.sku || '',
    audioPreview: p.audioPreview || null,
    pdfPreview: p.pdfPreview || null,
    youtubeUrl: p.youtubeUrl || null,
    image: p.imageUrl || 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=400&h=565&fit=crop&q=80',
    slug: p.slug,
    category: p.category || 'CDs',
    composer: p.artist || p.composer || ''
  }));

  return (
    <div className="container page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">CDs & Tonträger</h1>
        <p className="page-subtitle">
          Lauschen Sie unseren Meisterwerken in bester Qualität – auf CD, edler Schallplatte oder direkt als digitaler USB-Stick.
        </p>
      </div>

      <CDsShopClient initialProducts={products} />
    </div>
  );
}
