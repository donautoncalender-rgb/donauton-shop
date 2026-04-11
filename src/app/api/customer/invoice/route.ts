import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const orderId = url.searchParams.get("orderId");

    if (!email || !orderId) {
      return NextResponse.json({ error: 'E-Mail und Bestell-ID erforderlich' }, { status: 400 });
    }

    // 1. Validate ownership via Suite API
    const erpUrlBase = 'https://donauton-suite.de';
    const erpKey = process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    const authRes = await fetch(`${erpUrlBase}/api/v1/shop/customer-orders?secret=${erpKey}&email=${encodeURIComponent(email)}&orderId=${encodeURIComponent(orderId)}`);
    
    if (!authRes.ok) {
      return NextResponse.json({ error: 'Nicht autorisiert oder Rechnung nicht gefunden' }, { status: 403 });
    }

    const authData = await authRes.json();
    if (!authData.success) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    // 2. Fetch PDF from Suite
    const pdfRes = await fetch(`${erpUrlBase}/api/pdf/ecommerce/${orderId}/invoice`);

    if (!pdfRes.ok) {
        return NextResponse.json({ error: 'Rechnung noch nicht generiert oder Fehler beim Erstellen' }, { status: 404 });
    }

    // 3. Proxy PDF to client
    const pdfBuffer = await pdfRes.arrayBuffer();

    // Use actual invoice number if available from the order details
    const orderNumber = authData.order?.order_number || orderId;

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Rechnung_${orderNumber}.pdf"`
        }
    });

  } catch (error: any) {
    console.error("Invoice Proxy Error:", error);
    return NextResponse.json(
      { error: "Rechnung konnte nicht geladen werden. Error: " + error.message },
      { status: 500 }
    );
  }
}
