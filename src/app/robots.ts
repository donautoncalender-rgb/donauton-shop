import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/', '/merkliste/', '/login/', '/register/'],
    },
    sitemap: 'https://donauton-shop.vercel.app/sitemap.xml',
  };
}
