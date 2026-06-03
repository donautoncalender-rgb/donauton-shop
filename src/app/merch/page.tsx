import type { Metadata } from 'next';
import MerchShopClient from '../../components/MerchShopClient';
import { prisma } from '../../lib/prisma';

export const metadata: Metadata = {
  title: 'Fanartikel & Merch | DONAUTON Shop',
  description: 'Entdecken Sie Fanartikel, Kleidung und Merchandise im DONAUTON Shop.',
  openGraph: {
    title: 'Fanartikel & Merch | DONAUTON Shop',
    description: 'Entdecken Sie Fanartikel, Kleidung und Merchandise im DONAUTON Shop.',
    type: 'website',
  }
};

export default async function MerchPage() {
  const dbProducts = await prisma.product.findMany({
    where: { category: 'Merch' }
  });
  
  const merchItems = dbProducts.map((p: any) => ({
    id: p.id,
    wooId: p.wooId,
    genre: p.genre || 'Accessoires',
    type: p.genre || 'Accessoires',
    title: p.title,
    price: p.price,
    badge: p.badge || '',
    description: p.description || '',
    sku: p.sku || '',
    audioPreview: p.audioPreview || null,
    pdfPreview: p.pdfPreview || null,
    youtubeUrl: p.youtubeUrl || null,
    sizes: p.sizes ? JSON.parse(p.sizes) : [],
    image: p.imageUrl || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=565&fit=crop&q=80',
    slug: p.slug,
    category: p.category || 'Merch'
  }));

  return (
    <div className="container page-container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Merchandise</h1>
        <p className="page-subtitle">
          Zeige deine Liebe zur Blasmusik. Hochwertige Kleidung und Accessoires im Donauton-Design.
        </p>
      </div>

      <MerchShopClient initialProducts={merchItems} />
    </div>
  );
}
