import type { Metadata } from 'next';
import MerchShopClient from '../../components/MerchShopClient';
import CategoryBanner from '../../components/CategoryBanner';
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

  const bannerSetting = await prisma.shopSetting.findUnique({ where: { key: 'banner_url_merch' } });
  const customBannerUrl = bannerSetting?.value;

  return (
    <div className="container page-container">
      <CategoryBanner 
        title="Merchandise"
        subtitle="Zeige deine Liebe zur Blasmusik. Hochwertige Kleidung und Accessoires im Donauton-Design."
        imageUrl={customBannerUrl || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80"}
        gradient="linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 100%)"
      />

      <MerchShopClient initialProducts={merchItems} />
    </div>
  );
}
