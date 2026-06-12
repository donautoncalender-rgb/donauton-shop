import type { Metadata } from 'next';
import BuecherShopClient from '../../components/BuecherShopClient';
import CategoryBanner from '../../components/CategoryBanner';
import { prisma } from '../../lib/prisma';

export const metadata: Metadata = {
  title: 'Bücher & Literatur | DONAUTON Shop',
  description: 'Entdecken Sie Bücher und Literatur rund um die Musik im DONAUTON Shop.',
  openGraph: {
    title: 'Bücher & Literatur | DONAUTON Shop',
    description: 'Entdecken Sie Bücher und Literatur rund um die Musik im DONAUTON Shop.',
    type: 'website',
  }
};

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

  const bannerSetting = await prisma.shopSetting.findUnique({ where: { key: 'banner_url_buecher' } });
  const customBannerUrl = bannerSetting?.value;

  return (
    <div className="container page-container">
      <CategoryBanner 
        title="Bücher & Literatur"
        subtitle="Fachliteratur, Lehrwerke, und humorvolle Geschichten für jeden Blasmusiker."
        imageUrl={customBannerUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200&q=80"}
        gradient="linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
      />

      <BuecherShopClient initialProducts={products} />
    </div>
  );
}
