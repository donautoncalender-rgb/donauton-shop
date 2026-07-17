import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrlBase = erpUrlSetting?.value ? new URL(erpUrlSetting.value).origin : process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN || 'DONAUTON_SHOP_SECRET_123';

    // We proxy the request to the new endpoint in the DONAUTON Suite
    const response = await fetch(`${erpUrlBase}/api/v1/shop/gewinnspiel?secret=${erpKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gewinnspiel API Error:', response.status, errText);
      return NextResponse.json({ error: 'Suite Fehler' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Gewinnspiel Proxy Error:', error);
    return NextResponse.json({ error: 'Server Fehler' }, { status: 500 });
  }
}
