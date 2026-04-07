import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  const WOO_URL = process.env.WOOCOMMERCE_URL;
  const WOO_KEY = process.env.WOOCOMMERCE_KEY;
  const WOO_SECRET = process.env.WOOCOMMERCE_SECRET;

  if (!WOO_URL || !WOO_KEY || !WOO_SECRET) {
    return NextResponse.json(
      { error: "Fehlende WooCommerce Zugangsdaten in .env.local!" },
      { status: 500 }
    );
  }

  // Für saubere URLs (falls ein Slash am Ende mitgegeben wurde)
  const baseUrl = WOO_URL.replace(/\/$/, "");

  // Wir nutzen Basic Auth, was beim WooCommerce REST API Standard für HTTPS ist
  const token = Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString('base64');

  try {
    let page = 1;
    let products: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const fetchUrl = `${baseUrl}/wp-json/wc/v3/products?per_page=100&page=${page}`;
      
      const response = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
          // Fallback falls BasicAuth vom Server blockiert wird
          const fallbackUrl = `${baseUrl}/wp-json/wc/v3/products?consumer_key=${WOO_KEY}&consumer_secret=${WOO_SECRET}&per_page=100&page=${page}`;
          const res2 = await fetch(fallbackUrl);
          if (!res2.ok) {
              throw new Error(`API Fehler: ${res2.status} ${res2.statusText}`);
          }
          const batch: any[] = await res2.json();
          if (batch.length === 0) hasMore = false;
          else products = products.concat(batch);
      } else {
          const batch: any[] = await response.json();
          if (batch.length === 0) hasMore = false;
          else products = products.concat(batch);
      }
      
      page++;
    }

    let syncedCount = 0;

    for (const p of products) {
      // Kategorie Mapping
      let category = "Noten";
      const wooCategories = p.categories?.map((c: any) => c.name.toLowerCase()) || [];
      if (wooCategories.some((c: string) => c.includes('cd') || c.includes('audio'))) category = "CDs";
      else if (wooCategories.some((c: string) => c.includes('buch') || c.includes('bücher'))) category = "Bücher";
      else if (wooCategories.some((c: string) => c.includes('merch') || c.includes('shirt'))) category = "Merch";
      else if (wooCategories.some((c: string) => c.includes('ticket'))) category = "Tickets";

      // Preis Format
      const priceVal = parseFloat(p.price || '0').toFixed(2).replace('.', ',');
      const priceStr = priceVal !== '0,00' ? `${priceVal} €` : 'Auf Anfrage';

      // Attribute Helfer für Meta-Daten (Kunden-Spezialfall)
      const getMeta = (key: string) => p.meta_data?.find((m: any) => m.key === key)?.value || null;

      // Extras für Merch
      const sizeAttr = p.attributes?.find((a: any) => a.name && (a.name.includes('Größe') || a.name.includes('Size') || a.name.includes('Grö')));
      const sizesStr = sizeAttr?.options ? JSON.stringify(sizeAttr.options) : null;

      const colorAttr = p.attributes?.find((a: any) => a.name && (a.name.includes('Farbe') || a.name.includes('Color') || a.name.includes('Colour')));
      const colorsStr = colorAttr?.options ? JSON.stringify(colorAttr.options) : null;

      const imageUrl = p.images?.[0]?.src || null;
      const safeSlug = p.slug || `woo-${p.id}`;

      await prisma.product.upsert({
        where: { wooId: p.id },
        update: {
          title: p.name,
          slug: safeSlug,
          sku: p.sku || getMeta('isbn-10') || null,
          category,
          price: priceStr,
          description: p.short_description || p.description || null,
          imageUrl,
          stockStatus: p.stock_status || 'instock',
          sizes: sizesStr,
          colors: colorsStr,
          composer: getMeta('narrator') || null, 
          genre: getMeta('format') || null,
          grade: getMeta('listening-length') || null,
          duration: getMeta('spielzeit') || null,
          audioPreview: getMeta('url-music') || null,
          pdfPreview: getMeta('item-weight') || null,
          hasDigitalDownload: Boolean(getMeta('has_digital_download')),
          digitalPrice: getMeta('digital_price_gross') ? parseFloat(getMeta('digital_price_gross')) : null,
        },
        create: {
          wooId: p.id,
          title: p.name,
          slug: safeSlug,
          sku: p.sku || getMeta('isbn-10') || null,
          category,
          price: priceStr,
          description: p.short_description || p.description || null,
          imageUrl,
          stockStatus: p.stock_status || 'instock',
          sizes: sizesStr,
          colors: colorsStr,
          composer: getMeta('narrator') || null,
          genre: getMeta('format') || null,
          grade: getMeta('listening-length') || null,
          duration: getMeta('spielzeit') || null,
          audioPreview: getMeta('url-music') || null,
          pdfPreview: getMeta('item-weight') || null,
          hasDigitalDownload: Boolean(getMeta('has_digital_download')),
          digitalPrice: getMeta('digital_price_gross') ? parseFloat(getMeta('digital_price_gross')) : null,
        }
      });
      syncedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${syncedCount} Produkte erfolgreich aus WooCommerce synchronisiert!`,
      productsImported: syncedCount
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Fehler beim WooCommerce-Import", details: error.message },
      { status: 500 }
    );
  }
}
