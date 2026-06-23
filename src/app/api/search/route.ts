import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query || query.trim() === '') {
      return NextResponse.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { composer: { contains: query, mode: 'insensitive' } },
          { artist: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        price: true,
        imageUrl: true,
        description: true,
        composer: true,
        artist: true,
        detailsJson: true
      }
    });

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Fehler bei der Produktsuche", details: error.message },
      { status: 500 }
    );
  }
}
