import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
    
    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrlBase = erpUrlSetting?.value ? new URL(erpUrlSetting.value).origin : process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    // Wir rufen die Suite auf, um die Daten zentral im ERP zu aktualisieren
    const erpRes = await fetch(`${erpUrlBase}/api/v1/shop/customer-update?secret=${erpKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!erpRes.ok) {
      throw new Error('Fehler bei der Kommunikation mit der DONAUTON Suite');
    }

    const data = await erpRes.json();
    
    return NextResponse.json({
        success: true,
        customer: data.customer
    });

  } catch (error: any) {
    console.error("Update Proxy Error:", error);
    


    return NextResponse.json(
      { error: "Stammdaten konnten nicht aktualisiert werden. Bitte später erneut versuchen." },
      { status: 500 }
    );
  }
}
