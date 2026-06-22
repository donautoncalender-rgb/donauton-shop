import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import CDsShopClient from '../../components/CDsShopClient';
import CategoryBanner from '../../components/CategoryBanner';

export const metadata: Metadata = {
  title: 'CDs kaufen | DONAUTON Shop',
  description: 'Entdecken Sie CDs und Alben im DONAUTON Shop. Premium Noten & Musik.',
  openGraph: {
    title: 'CDs kaufen | DONAUTON Shop',
    description: 'Entdecken Sie CDs und Alben im DONAUTON Shop. Premium Noten & Musik.',
    type: 'website',
  }
};

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
    discountPercent: p.discountPercent || 0,
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

  const bannerSetting = await prisma.shopSetting.findUnique({ where: { key: 'banner_url_cds' } });
  const customBannerUrl = bannerSetting?.value;

  return (
    <div className="container page-container">
      <CategoryBanner 
        title="CDs & Tonträger"
        subtitle="Lauschen Sie unseren Meisterwerken in bester Qualität – auf CD, edler Schallplatte oder direkt als digitaler USB-Stick."
        imageUrl={customBannerUrl || "https://images.unsplash.com/photo-1619983081563-430f63602796?w=1200&q=80"}
        gradient="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
      />

      <CDsShopClient initialProducts={products} />
    </div>
  );
}
