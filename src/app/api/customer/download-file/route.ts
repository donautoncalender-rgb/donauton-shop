import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const orderItemId = url.searchParams.get("orderItemId");
    const assetId = url.searchParams.get("assetId");

    if (!email || !orderItemId) {
      return NextResponse.json({ error: 'E-Mail und OrderItemId erforderlich' }, { status: 400 });
    }

    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrlBase = erpUrlSetting?.value ? new URL(erpUrlSetting.value).origin : process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    let fetchUrl = `${erpUrlBase}/api/v1/shop/download-file?secret=${erpKey}&email=${encodeURIComponent(email)}&orderItemId=${encodeURIComponent(orderItemId)}`;
    if (assetId) fetchUrl += `&assetId=${encodeURIComponent(assetId)}`;
    
    const erpRes = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!erpRes.ok) {
        let errorText = '';
        try { errorText = await erpRes.text(); } catch(e) {}
        throw new Error(`Fehler bei der Kommunikation mit der DONAUTON Suite. HTTP: ${erpRes.status} ${errorText}`);
    }

    // Stream the response back to the client directly
    const contentType = erpRes.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = erpRes.headers.get('content-disposition') || `attachment; filename="download.pdf"`;

    return new NextResponse(erpRes.body, {
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': contentDisposition
        }
    });

  } catch (error: any) {
    console.error("Download Proxy Error:", error);
    
    return NextResponse.json(
      { error: "Download fehlgeschlagen. " + error.message },
      { status: 500 }
    );
  }
}
