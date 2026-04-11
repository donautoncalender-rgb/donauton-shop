import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const orderId = url.searchParams.get("orderId");

    if (!email) {
      return NextResponse.json({ error: 'E-Mail erforderlich' }, { status: 400 });
    }

    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrlBase = erpUrlSetting?.value ? new URL(erpUrlSetting.value).origin : process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    let fetchUrl = `${erpUrlBase}/api/v1/shop/customer-orders?secret=${erpKey}&email=${encodeURIComponent(email)}`;
    if (orderId) fetchUrl += `&orderId=${encodeURIComponent(orderId)}`;

    const erpRes = await fetch(fetchUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!erpRes.ok) {
        throw new Error(`Fehler bei der Kommunikation mit der DONAUTON Suite. HTTP: ${erpRes.status}`);
    }

    const data = await erpRes.json();
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Orders Proxy Error:", error);
    
    return NextResponse.json(
      { error: "Bestellungen konnten nicht geladen werden. " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, orderId, action } = body;

    if (!email || !orderId || action !== 'cancel') {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
    }

    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrlBase = erpUrlSetting?.value ? new URL(erpUrlSetting.value).origin : process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    const fetchUrl = `${erpUrlBase}/api/v1/shop/customer-orders?secret=${erpKey}`;
    
    const erpRes = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, orderId, action })
    });

    const data = await erpRes.json();
    
    if (!erpRes.ok) {
        throw new Error(data.error || `HTTP ${erpRes.status}`);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Order Cancel Proxy Error:", error);
    return NextResponse.json(
      { error: "Stornierung fehlgeschlagen. " + error.message },
      { status: 500 }
    );
  }
}
