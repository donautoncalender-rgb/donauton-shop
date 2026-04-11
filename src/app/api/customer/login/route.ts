import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Hole ggf. die Suite URL aus den Shop-Settings (gleiche Logik wie beim ERP Sync)
    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrlBase = erpUrlSetting?.value ? new URL(erpUrlSetting.value).origin : process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    // Wir fragen die Suite API an, ob der Kunde existiert und das Passwort stimmt
    const erpRes = await fetch(`${erpUrlBase}/api/v1/shop/customer-auth?secret=${erpKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!erpRes.ok) {
      if (erpRes.status === 401) {
         return NextResponse.json({ error: 'Ungültige Zugangsdaten' }, { status: 401 });
      }
      throw new Error('Fehler bei der Kommunikation mit der DONAUTON Suite');
    }

    const customerData = await erpRes.json();

    // Wir geben die Kundendaten an den Client (localStorage) zurück, 
    // OHNE sie lokal im Prisma des Shops zu speichern!
    return NextResponse.json({
        success: true,
        customer: customerData.customer
    });

  } catch (error: any) {
    console.error("Login Proxy Error:", error);
    // FALLBACK für die Entwicklung entfernt, damit echte Fehler geworfen werden
    return NextResponse.json(
      { error: "Login fehlgeschlagen. Bitte später erneut versuchen (" + error.message + ")" },
      { status: 500 }
    );
  }
}
