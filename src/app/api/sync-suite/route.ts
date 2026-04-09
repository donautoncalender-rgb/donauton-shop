import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const SUITE_URL = 'http://localhost:3001';
    
    // Wir nutzen die offizielle, freigegebene Schnittstelle der Suite (api/shop-sync)
    const response = await fetch(`${SUITE_URL}/api/shop-sync?secret=DONAUTON_SHOP_SECRET_123`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Suite API Fehler: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Die Schnittstelle gibt direkt ein Array zurück
    const works = Array.isArray(data) ? data : (data.works || []);
    let syncedCount = 0;

    for (const work of works) {
      // Category Mapping based on CatalogCategory name
      const catName = (work.catalog_category?.name || '').toLowerCase();
      let category = "Noten";
      if (catName.includes('cd') || catName.includes('audio')) category = "CDs";
      else if (catName.includes('buch') || catName.includes('bücher')) category = "Bücher";
      else if (catName.includes('merch') || catName.includes('shirt')) category = "Merch";
      else if (catName.includes('ticket')) category = "Tickets";

      // Price Formatting
      const priceVal = parseFloat(work.base_list_price_gross || 0).toFixed(2).replace('.', ',');
      const priceStr = priceVal !== '0,00' ? `${priceVal} €` : 'Auf Anfrage';

      // Composer Name
      const composerName = work.composer_person?.vorname && work.composer_person?.nachname 
        ? `${work.composer_person.vorname} ${work.composer_person.nachname}` 
        : (work.artist || null);

      const safeSlug = (work.title || `work-${work.id}`).toLowerCase().replace(/[^a-z0-9]+/g, '-');

      // Assets
      const workAssets = work.assets || [];
      const pdfPreview = workAssets.find((a: any) => a.file_type?.toLowerCase().includes('pdf') || a.filename?.toLowerCase().includes('.pdf'))?.file_path || null;
      const audioPreview = workAssets.find((a: any) => a.file_type?.toLowerCase().includes('audio') || a.filename?.toLowerCase().includes('.mp3'))?.file_path || null;

      // duration formatting (from seconds to mm:ss)
      let formattedDuration = null;
      if (work.duration_seconds) {
        const mins = Math.floor(work.duration_seconds / 60);
        const secs = String(work.duration_seconds % 60).padStart(2, '0');
        formattedDuration = `${mins}:${secs}`;
      }

      // Metadata details for ProductDetailsList
      const details = [];
      details.push({ label: "Kategorie", value: category + (work.genre ? ` - ${work.genre}` : '') });
      if (work.sku) details.push({ label: "Artikelnummer", value: work.sku });
      if (work.instrumentation) details.push({ label: "Besetzung", value: work.instrumentation });
      if (formattedDuration) details.push({ label: "Dauer", value: `${formattedDuration} min` });
      
      // Difficulty mapping
      if (work.difficulty_min) {
        let diffLabel = String(work.difficulty_min);
        if (work.difficulty_max && work.difficulty_max !== work.difficulty_min) {
          diffLabel += ` - ${work.difficulty_max}`;
        }
        details.push({ label: "Schwierigkeit", value: `Grad ${diffLabel}` });
      }

      const detailsJson = JSON.stringify(details);

      await prisma.product.upsert({
        where: { slug: safeSlug }, // Using slug as unique key
        update: {
          title: work.title,
          sku: work.sku || null,
          category,
          price: priceStr,
          description: work.description_long || work.description_short || null,
          imageUrl: work.cover_image_path || null,
          galleryImages: work.gallery_images_json || null,
          stockStatus: work.availability === 'IN_STOCK' ? 'instock' : 'outofstock',
          composer: composerName,
          genre: work.genre || null,
          duration: formattedDuration,
          youtubeUrl: work.youtube_link || null,
          audioPreview: audioPreview,
          pdfPreview: pdfPreview,
          hasDigitalDownload: Boolean(work.has_digital_download),
          digitalPrice: work.digital_price_gross ? parseFloat(work.digital_price_gross) : null,
          detailsJson: detailsJson
        },
        create: {
          title: work.title,
          slug: safeSlug,
          sku: work.sku || null,
          category,
          price: priceStr,
          description: work.description_long || work.description_short || null,
          imageUrl: work.cover_image_path || null,
          galleryImages: work.gallery_images_json || null,
          stockStatus: work.availability === 'IN_STOCK' ? 'instock' : 'outofstock',
          composer: composerName,
          genre: work.genre || null,
          duration: formattedDuration,
          youtubeUrl: work.youtube_link || null,
          audioPreview: audioPreview,
          pdfPreview: pdfPreview,
          hasDigitalDownload: Boolean(work.has_digital_download),
          digitalPrice: work.digital_price_gross ? parseFloat(work.digital_price_gross) : null,
          detailsJson: detailsJson
        }
      });
      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${syncedCount} Produkte erfolgreich direkt aus der Suite synchronisiert!`,
      productsImported: syncedCount
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Fehler beim Suite-Import", details: error.message },
      { status: 500 }
    );
  }
}
