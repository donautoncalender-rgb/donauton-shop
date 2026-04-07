import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: 'E-Mail erforderlich' }, { status: 400 });
    }

    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrlBase = erpUrlSetting?.value ? new URL(erpUrlSetting.value).origin : process.env.ERP_SUITE_URL || 'http://127.0.0.1:3001';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    const erpRes = await fetch(`${erpUrlBase}/api/v1/shop/customer-downloads?secret=${erpKey}&email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!erpRes.ok) {
      throw new Error('Fehler bei der Kommunikation mit der DONAUTON Suite');
    }

    const data = await erpRes.json();
    
    return NextResponse.json({
        success: true,
        downloads: data.downloads || []
    });

  } catch (error: any) {
    console.error("Downloads Proxy Error:", error);
    
    if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
            success: true,
            downloads: [
                {
                    id: 'mock-dl-1',
                    order_number: 'DTN-429188',
                    title: 'Brauhauspolka - Mock Download',
                    download_count: 0,
                    download_limit: 5,
                    date: '2026-04-02T10:00:00Z',
                    download_url: '#'
                }
            ]
        });
    }

    return NextResponse.json(
      { error: "Downloads konnten nicht geladen werden" },
      { status: 500 }
    );
  }
}
