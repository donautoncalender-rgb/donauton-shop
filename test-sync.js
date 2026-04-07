const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SUITE_API_URL = process.env.SUITE_API_URL || 'http://localhost:3001/api/shop-sync?secret=DONAUTON_SHOP_SECRET_123';

async function sync() {
  try {
    const res = await fetch(SUITE_API_URL);
    if (!res.ok) throw new Error("Fetch failed");
    const works = await res.json();
    
    for (const work of works) {
      if (work.slug === 'lemonlight-serenade' || work.title === 'Lemonlight Serenade') {
        const slug = work.slug || "lemonlight-serenade";
        let shopCategory = "Noten";
        const priceString = "59,90 €";
        let sizesList = null;
        let colorsList = null;
        let audioPreview = null;
        let pdfPreview = null;
        let detailsJsonStr = null;
        let sortedGalleryImagesJsonStr = null;
        let finalComposer = "";
        let finalAuthor = "";
        let finalArtist = "";

        const payload = {
          title: work.title,
          sku: work.sku || "",
          category: shopCategory,
          price: priceString,
          description: work.description_long || work.description_short || "",
          imageUrl: work.cover_image_path || "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
          stockStatus: work.availability === "OUT_OF_STOCK" ? "outofstock" : "instock",
          composer: finalComposer,
          author: finalAuthor,
          grade: work.difficulty_min ? work.difficulty_min.toString() : null,
          genre: work.genre || "",
          duration: work.duration_seconds ? `${Math.floor(work.duration_seconds / 60)}:${String(work.duration_seconds % 60).padStart(2, '0')}` : null,
          artist: finalArtist,
          sizes: sizesList,
          colors: colorsList,
          audioPreview: audioPreview,
          youtubeUrl: work.youtube_link || null,
          pdfPreview: pdfPreview,
          galleryImages: sortedGalleryImagesJsonStr,
          detailsJson: detailsJsonStr,
        };

        console.log("PAYLOAD:", payload);

        await prisma.product.upsert({
          where: { slug: slug },
          update: payload,
          create: { slug: slug, ...payload }
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
}

sync();
