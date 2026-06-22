import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});
    return NextResponse.json({
      erpUrlSetting,
      erpKeySetting
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
