const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.product.upsert({
        where: { slug: "lemonlight-serenade" },
        update: {
          title: "Lemonlight Serenade",
          sku: "DTN-0127",
          category: "Noten",
          price: "59,90 €",
          description: "Ein stiller Garten in südlicher Sonne...",
          imageUrl: "https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/Cover_01_Lemonlight_Serenade.png",
          stockStatus: "instock",
          composer: "Lukas Bruckmeyer",
          author: "",
          grade: "3",
          genre: "Slow",
          duration: "5:28",
          artist: "",
          sizes: null,
          colors: null,
          audioPreview: "https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/works/c51a1f7d-2510-4815-996f-099d007b0bb0/1775310113726-Lemonlight%20Serenade_Demo.mp3",
          youtubeUrl: null,
          pdfPreview: "https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/works/c51a1f7d-2510-4815-996f-099d007b0bb0/17753110948111-Probepartitur_01_Partitur_Lemonlight%20Serenade.pdf",
          galleryImages: "[\"https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/gallery/1775312738104-02_A3_Lemonlight%20Serenade_Stimmen_Seite_01.jpg\",\"https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/gallery/1775312741196-02_A3_Lemonlight%20Serenade_Stimmen_Seite_02.jpg\"]",
          detailsJson: "[]"
        },
        create: {
          slug: "lemonlight-serenade",
          title: "Lemonlight Serenade",
          sku: "DTN-0127",
          category: "Noten",
          price: "59,90 €",
          description: "Ein stiller Garten in südlicher Sonne...",
          imageUrl: "https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/Cover_01_Lemonlight_Serenade.png",
          stockStatus: "instock",
          composer: "Lukas Bruckmeyer",
          author: "",
          grade: "3",
          genre: "Slow",
          duration: "5:28",
          artist: "",
          sizes: null,
          colors: null,
          audioPreview: "https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/works/c51a1f7d-2510-4815-996f-099d007b0bb0/1775310113726-Lemonlight%20Serenade_Demo.mp3",
          youtubeUrl: null,
          pdfPreview: "https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/works/c51a1f7d-2510-4815-996f-099d007b0bb0/17753110948111-Probepartitur_01_Partitur_Lemonlight%20Serenade.pdf",
          galleryImages: "[\"https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/gallery/1775312738104-02_A3_Lemonlight%20Serenade_Stimmen_Seite_01.jpg\",\"https://k5wy8rzyg58utq3y.public.blob.vercel-storage.com/gallery/1775312741196-02_A3_Lemonlight%20Serenade_Stimmen_Seite_02.jpg\"]",
          detailsJson: "[]"
        }
    });

  } catch (e) {
    console.error(e.message);
  }
}

test();
