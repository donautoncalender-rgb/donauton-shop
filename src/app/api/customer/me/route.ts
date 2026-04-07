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

    const erpRes = await fetch(`${erpUrlBase}/api/v1/shop/customer-profile?secret=${erpKey}&email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!erpRes.ok) {
      throw new Error('Fehler bei der Kommunikation mit der DONAUTON Suite. HTTP: ' + erpRes.status);
    }

    const data = await erpRes.json();
    
    return NextResponse.json({
        success: true,
        customer: data.customer
    });

  } catch (error: any) {
    console.error("Profile Proxy Error:", error);
    
    return NextResponse.json(
      { error: "Stammdaten konnten nicht geladen werden. Error: " + error.message },
      { status: 500 }
    );
  }
}
