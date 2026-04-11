import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const orderId = url.searchParams.get("orderId");

    if (!email || !orderId) {
      return NextResponse.json({ error: 'E-Mail und Bestell-ID erforderlich' }, { status: 400 });
    }

    const erpUrlBase = 'https://donauton-suite.de';
    const erpKey = process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    // Call the dedicated Suite invoice download route
    const pdfRes = await fetch(`${erpUrlBase}/api/v1/shop/invoice?secret=${erpKey}&email=${encodeURIComponent(email)}&orderId=${encodeURIComponent(orderId)}`);

    if (!pdfRes.ok) {
        return NextResponse.json({ error: 'Rechnung konnte in der ERP Suite nicht autorisiert oder generiert werden.' }, { status: pdfRes.status });
    }

    // Proxy PDF exactly as received
    const pdfBuffer = await pdfRes.arrayBuffer();

    return new NextResponse(pdfBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': pdfRes.headers.get('Content-Disposition') || `attachment; filename="Rechnung_${orderId}.pdf"`
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
