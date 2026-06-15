import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const redirectUrl = body.redirectUrl;

    if (!email || !password) {
      return NextResponse.json({ error: "E-Mail und Passwort erforderlich" }, { status: 400 });
    }

    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrlBase = erpUrlSetting?.value ? new URL(erpUrlSetting.value).origin : process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    // Call the suite's migration-request endpoint
    const erpRes = await fetch(`${erpUrlBase}/api/v1/shop/customer-auth/migration-request?secret=${erpKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, redirect_url: redirectUrl })
    });

    const data = await erpRes.json();

    if (!erpRes.ok) {
      return NextResponse.json({ error: data.error || 'Fehler beim Anfordern der Migration' }, { status: erpRes.status });
    }

    return NextResponse.json({
      success: true,
      message: data.message
    });

  } catch (error: any) {
    console.error("Migration Request Proxy Error:", error);
    return NextResponse.json(
      { error: "Fehler beim Anfordern der Passwortänderung. Bitte kontaktieren Sie uns. (" + error.message + ")" },
      { status: 500 }
    );
  }
}
