import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const SUITE_URL = 'https://donauton-suite.de';
    
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

      // Assets - Specifically look for the new shop_usage categories
      const workAssets = work.assets || [];
      const pdfPreview = workAssets.find((a: any) => a.shop_usage === 'PREVIEW')?.file_path || null;
      const audioPreview = workAssets.find((a: any) => a.shop_usage === 'AUDIO')?.file_path || null;

      // duration formatting (from seconds to mm:ss)
      let formattedDuration = null;
      if (work.duration_seconds) {
        const mins = Math.floor(work.duration_seconds / 60);
        const secs = String(work.duration_seconds % 60).padStart(2, '0');
        formattedDuration = `${mins}:${secs}`;
      }

      // Build detailed technical specs for the frontend
      const detailsList = [];
      if (category) detailsList.push({ label: 'Kategorie', value: category + (work.genre ? ` - ${work.genre}` : '') });
      if (work.sku) detailsList.push({ label: 'Artikelnummer', value: work.sku });
      if (work.instrumentation) detailsList.push({ label: 'Besetzung', value: work.instrumentation });
      
      const parsedGrade = work.difficulty_min 
        ? `${work.difficulty_min}${work.difficulty_max && work.difficulty_max != work.difficulty_min ? ' - ' + work.difficulty_max : ''}` 
        : null;
        
      if (parsedGrade) detailsList.push({ label: 'Schwierigkeit', value: `Grad ${parsedGrade}` });
      if (formattedDuration) detailsList.push({ label: 'Dauer', value: formattedDuration });
      if (work.page_count_score || work.page_count) detailsList.push({ label: 'Seiten', value: (work.page_count_score || work.page_count).toString() });
      if (work.key_signature) detailsList.push({ label: 'Tonart', value: work.key_signature });
      if (work.meter_time_signature) detailsList.push({ label: 'Taktart', value: work.meter_time_signature });

      const detailsJson = JSON.stringify(detailsList);

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
          grade: parsedGrade,
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
          grade: parsedGrade,
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

    // Flush the global Next.js cache so the Storefront updates instantly
    revalidatePath('/', 'layout');

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
