import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth_session');
  return session && session.value === 'admin_authenticated';
}

/**
 * GET: Export settings, categories, and homepage sliders as JSON
 */
export async function GET() {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const [settings, categories, sliders] = await Promise.all([
      prisma.shopSetting.findMany(),
      prisma.shopCategory.findMany(),
      prisma.frontpageSlider.findMany(),
    ]);

    const backupData = {
      source: "donauton-shop",
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        settings,
        categories,
        sliders,
      }
    };

    const fileName = `donauton-shop-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;

    return new Response(JSON.stringify(backupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (error: any) {
    console.error("Backup export failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Import settings, categories, and homepage sliders from JSON
 */
export async function POST(request: NextRequest) {
  if (!await isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body || body.source !== 'donauton-shop' || !body.data) {
      return NextResponse.json({ error: 'Ungültiges Backup-Format. Vergewissere dich, dass die Datei vom Donauton-Shop stammt.' }, { status: 400 });
    }

    const { settings, categories, sliders } = body.data;

    // Validation check
    if (!Array.isArray(settings) || !Array.isArray(categories) || !Array.isArray(sliders)) {
      return NextResponse.json({ error: 'Ungültige Datenstruktur im Backup.' }, { status: 400 });
    }

    // Perform transaction
    await prisma.$transaction(async (tx) => {
      // Truncate tables first
      await tx.shopSetting.deleteMany();
      await tx.shopCategory.deleteMany();
      await tx.frontpageSlider.deleteMany();

      // Insert settings
      if (settings.length > 0) {
        await tx.shopSetting.createMany({
          data: settings.map((s: any) => ({
            id: s.id,
            key: s.key,
            value: s.value,
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
          }))
        });
      }

      // Insert categories
      if (categories.length > 0) {
        await tx.shopCategory.createMany({
          data: categories.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || null,
            imageUrl: c.imageUrl || null,
            sortOrder: c.sortOrder ?? 0,
            isVisible: c.isVisible ?? true,
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          }))
        });
      }

      // Insert sliders
      if (sliders.length > 0) {
        await tx.frontpageSlider.createMany({
          data: sliders.map((s: any) => ({
            id: s.id,
            title: s.title,
            linkUrl: s.linkUrl || null,
            sortOrder: s.sortOrder ?? 0,
            isVisible: s.isVisible ?? true,
            filterType: s.filterType ?? "LATEST",
            filterValue: s.filterValue || null,
            limit: s.limit ?? 15,
            createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
            updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date(),
          }))
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Backup import failed:", error);
    return NextResponse.json({ error: error.message || 'Wiederherstellung fehlgeschlagen.' }, { status: 500 });
  }
}
