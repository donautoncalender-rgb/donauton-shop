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
    
    const works = Array.isArray(data) ? data : (data.works || []);
    const parentWorks = works.filter((w: any) => !w.parent_id);
    const childVariants = works.filter((w: any) => !!w.parent_id);
    let syncedCount = 0;

    // ----- SYNC SETTINGS (e.g. Shipping Zones) -----
    if (!Array.isArray(data) && data.settings) {
      if (data.settings.shippingZones) {
        await prisma.shopSetting.upsert({
          where: { key: 'shipping_zones' },
          update: { value: data.settings.shippingZones },
          create: { key: 'shipping_zones', value: data.settings.shippingZones }
        });
      }
      if (data.settings.companySettings) {
        const comp = data.settings.companySettings;
        const companyMapping: Record<string, any> = {
          'company_name': comp.name,
          'company_street': comp.street,
          'company_zip': comp.postal_code,
          'company_city': comp.city,
          'company_country': comp.country,
          'company_email': comp.contact_email,
          'company_website': comp.website
        };
        for (const [key, value] of Object.entries(companyMapping)) {
          if (value !== undefined && value !== null) {
            await prisma.shopSetting.upsert({
              where: { key },
              update: { value: String(value) },
              create: { key, value: String(value) }
            });
          }
        }
      }
    }
    // ------------------------------------------------

    const getWorkDetails = (w: any) => {
      const title = w.title || `work-${w.id}`;
      let slugTitle = title;
      if (w.instrumentation) {
        const normTitle = title.toLowerCase();
        const normInst = w.instrumentation.toLowerCase();
        if (!normTitle.includes(normInst)) {
          slugTitle = `${title} - ${w.instrumentation}`;
        }
      }
      const slug = slugTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return { title, slug };
    };

    // ----- BEREINIGUNG VON GEISTER-ARTIKELN (GHOST PRODUCTS) -----
    // Generiere alle gültigen Slugs der Suite
    const validSlugs = parentWorks.map((w: any) => getWorkDetails(w).slug);
    
    // Lösche alle Shop-Produkte, die nicht mehr in der Suite existieren oder deren Titel/Slug sich geändert hat.
    // OrderItems behalten ihre Daten (productId wird null), da onDelete: SetNull in Schema definiert ist.
    if (validSlugs.length > 0) {
      await prisma.product.deleteMany({
        where: {
          slug: { notIn: validSlugs }
        }
      });
    }
    // -------------------------------------------------------------

    const upsertPromises = parentWorks.map((work: any) => {
      const { title: finalTitle, slug: safeSlug } = getWorkDetails(work);

      // Category Mapping based on CatalogCategory name and product_type
      const catName = (work.catalog_category?.name || '').toLowerCase();
      const type = (work.product_type || '').toLowerCase();
      let category = "Noten";
      if (catName.includes('cd') || catName.includes('audio') || type === 'cd' || type === 'dvd') category = "CDs";
      else if (catName.includes('buch') || catName.includes('bücher') || type === 'buch') category = "Bücher";
      else if (catName.includes('merch') || catName.includes('shirt') || type === 'merchandise') category = "Merch";
      else if (catName.includes('ticket') || type === 'ticket') category = "Tickets";

      // Price Formatting
      const rawPrice = parseFloat(work.end_customer_price_gross || work.base_list_price_gross || 0);
      const priceVal = rawPrice.toFixed(2).replace('.', ',');
      const priceStr = priceVal !== '0,00' ? `${priceVal} €` : 'Auf Anfrage';

      // Composer Name
      const composerName = work.composer_person?.vorname && work.composer_person?.nachname 
         ? `${work.composer_person.vorname} ${work.composer_person.nachname}` 
         : (work.artist || null);

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

      // Group and serialize variants (child products / Stimmen)
      const variantsForParent = childVariants
        .filter((v: any) => v.parent_id === work.id)
        .sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
      const variantsList = variantsForParent.map((v: any) => {
        const vRawPrice = parseFloat(v.end_customer_price_gross || v.base_list_price_gross || 0);
        const vPriceVal = vRawPrice.toFixed(2).replace('.', ',');
        const vPriceStr = vPriceVal !== '0,00' ? `${vPriceVal} €` : 'Auf Anfrage';

        const totalStock = (v.warehouse_stocks || []).reduce((acc: number, cur: any) => acc + cur.quantity, 0);

        return {
          id: v.id,
          title: v.title.replace(`${work.title} - `, '').trim(),
          sku: v.sku || "",
          price: vPriceStr,
          stock: totalStock,
          stockStatus: totalStock > 0 ? 'instock' : 'outofstock',
          hasDigitalDownload: Boolean(v.has_digital_download),
          digitalPrice: v.digital_price_gross ? parseFloat(v.digital_price_gross) : null,
        };
      });

      const variantsJson = variantsForParent.length > 0 ? JSON.stringify(variantsList) : null;

      // For merchandise products, genre is mapped from category_description, else work.genre
      const productGenre = category === 'Merch' ? (work.category_description || 'Accessoires') : (work.genre || null);

      // Extract sizes and colors for merchandise attributes
      let sizesJson = null;
      let colorsJson = null;
      if (work.attributes_json) {
        try {
          const attributes = JSON.parse(work.attributes_json);
          if (Array.isArray(attributes)) {
            const sizeAttr = attributes.find((a: any) => a.key && (a.key.toLowerCase() === 'größe' || a.key.toLowerCase() === 'groesse' || a.key.toLowerCase() === 'size'));
            const colorAttr = attributes.find((a: any) => a.key && (a.key.toLowerCase() === 'farbe' || a.key.toLowerCase() === 'color'));
            
            if (sizeAttr && Array.isArray(sizeAttr.values)) {
              sizesJson = JSON.stringify(sizeAttr.values);
            }
            if (colorAttr && Array.isArray(colorAttr.values)) {
              colorsJson = JSON.stringify(colorAttr.values);
            }

            // Fallback for custom attributes like 'Aufdruck' if no explicit color is set
            if (!colorsJson && sizeAttr) {
              const otherAttr = attributes.find((a: any) => a !== sizeAttr);
              if (otherAttr && Array.isArray(otherAttr.values)) {
                colorsJson = JSON.stringify(otherAttr.values);
              }
            }

            // Generic fallback if sizesJson is still null but attributes exist
            if (!sizesJson && attributes.length > 0) {
              const firstAttr = attributes[0];
              if (firstAttr && Array.isArray(firstAttr.values)) {
                sizesJson = JSON.stringify(firstAttr.values);
              }
              if (!colorsJson && attributes.length > 1) {
                const secondAttr = attributes[1];
                if (secondAttr && Array.isArray(secondAttr.values)) {
                  colorsJson = JSON.stringify(secondAttr.values);
                }
              }
            }
          }
        } catch (e) {
          console.error("Failed to parse attributes_json for work " + work.id, e);
        }
      }

      // Build detailed technical specs for the frontend
      const detailsList = [];
      if (category) detailsList.push({ label: 'Kategorie', value: category + (productGenre ? ` - ${productGenre}` : '') });
      if (work.sku) detailsList.push({ label: 'Artikelnummer', value: work.sku });
      if (work.instrumentation) detailsList.push({ label: 'Besetzung', value: work.instrumentation });
      if (work.is_external && work.partner_name) detailsList.push({ label: 'Originalverlag', value: work.partner_name });
      
      const parsedGrade = work.difficulty_min 
        ? `${work.difficulty_min}${work.difficulty_max && work.difficulty_max != work.difficulty_min ? ' - ' + work.difficulty_max : ''}` 
        : null;
        
      if (parsedGrade) detailsList.push({ label: 'Schwierigkeit', value: `Grad ${parsedGrade}` });
      if (formattedDuration) detailsList.push({ label: 'Dauer', value: formattedDuration });
      if (work.page_count_score || work.page_count) detailsList.push({ label: 'Seiten', value: (work.page_count_score || work.page_count).toString() });
      if (work.key_signature) detailsList.push({ label: 'Tonart', value: work.key_signature });
      if (work.meter_time_signature) detailsList.push({ label: 'Taktart', value: work.meter_time_signature });

      const detailsJson = JSON.stringify(detailsList);

      return prisma.product.upsert({
        where: { slug: safeSlug }, // Using slug as unique key
        update: {
          title: finalTitle,
          sku: work.sku || null,
          category,
          price: priceStr,
          description: work.description_long || work.description_short || null,
          imageUrl: work.cover_image_path || null,
          galleryImages: work.gallery_images_json || null,
          stockStatus: work.availability === 'IN_STOCK' ? 'instock' : 'outofstock',
          composer: composerName,
          artist: work.artist || null,
          author: work.event_location || null,
          genre: productGenre,
          sizes: sizesJson,
          colors: colorsJson,
          grade: parsedGrade,
          duration: formattedDuration,
          youtubeUrl: work.youtube_link || null,
          audioPreview: audioPreview,
          pdfPreview: pdfPreview,
          hasDigitalDownload: Boolean(work.has_digital_download),
          digitalPrice: work.digital_price_gross ? parseFloat(work.digital_price_gross) : null,
          detailsJson: detailsJson,
          publisher: work.partner_name || "Donauton",
          instrumentation: work.instrumentation || null,
          isExternal: Boolean(work.is_external),
          variantsJson,
          partsListJson: work.parts_list_json || null,
          trackListJson: work.track_list_json || null
        },
        create: {
          title: finalTitle,
          slug: safeSlug,
          sku: work.sku || null,
          category,
          price: priceStr,
          description: work.description_long || work.description_short || null,
          imageUrl: work.cover_image_path || null,
          galleryImages: work.gallery_images_json || null,
          stockStatus: work.availability === 'IN_STOCK' ? 'instock' : 'outofstock',
          composer: composerName,
          artist: work.artist || null,
          author: work.event_location || null,
          genre: productGenre,
          sizes: sizesJson,
          colors: colorsJson,
          grade: parsedGrade,
          duration: formattedDuration,
          youtubeUrl: work.youtube_link || null,
          audioPreview: audioPreview,
          pdfPreview: pdfPreview,
          hasDigitalDownload: Boolean(work.has_digital_download),
          digitalPrice: work.digital_price_gross ? parseFloat(work.digital_price_gross) : null,
          detailsJson: detailsJson,
          publisher: work.partner_name || "Donauton",
          instrumentation: work.instrumentation || null,
          isExternal: Boolean(work.is_external),
          variantsJson,
          partsListJson: work.parts_list_json || null,
          trackListJson: work.track_list_json || null
        }
      });
    });

    await Promise.all(upsertPromises);
    syncedCount = parentWorks.length;

    // ----- SYNC COMPOSERS -----
    const composers = Array.isArray(data) ? [] : (data.composers || []);
    const validComposerIds = composers.map((c: any) => c.id);

    // Clean up old composers
    if (validComposerIds.length > 0) {
      await prisma.composer.deleteMany({
        where: {
          id: { notIn: validComposerIds }
        }
      });
    } else {
      await prisma.composer.deleteMany({});
    }

    const getSlug = (name: string) => {
      return name.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };

    const composerUpserts = composers.map((c: any) => {
      const name = c.name_anzeigen || `${c.vorname} ${c.nachname}`;
      const slug = getSlug(name);
      return prisma.composer.upsert({
        where: { id: c.id },
        update: {
          name,
          slug,
          biography: c.biography || null,
          birthDate: c.geburtsdatum ? new Date(c.geburtsdatum) : null,
          deathDate: c.sterbedatum ? new Date(c.sterbedatum) : null,
          portraitUrl: c.portrait_image_path || null,
        },
        create: {
          id: c.id,
          name,
          slug,
          biography: c.biography || null,
          birthDate: c.geburtsdatum ? new Date(c.geburtsdatum) : null,
          deathDate: c.sterbedatum ? new Date(c.sterbedatum) : null,
          portraitUrl: c.portrait_image_path || null,
        }
      });
    });

    await Promise.all(composerUpserts);
    // ---------------------------

    // Flush the global Next.js cache so the Storefront updates instantly
    revalidatePath('/', 'layout');

    return NextResponse.json({
      success: true,
      message: `${syncedCount} Produkte und ${composers.length} Komponisten erfolgreich direkt aus der Suite synchronisiert!`,
      productsImported: syncedCount,
      composersImported: composers.length
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Fehler beim Suite-Import", details: error.message },
      { status: 500 }
    );
  }
}
