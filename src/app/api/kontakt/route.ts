import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const SUITE_URL = process.env.ERP_SUITE_URL || 'https://donauton-suite.de';

    const response = await fetch(`${SUITE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Suite API Error:', response.status, errText);
      return NextResponse.json({ error: 'Suite Fehler' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Contact Form Proxy Error:', error);
    return NextResponse.json({ error: 'Server Fehler' }, { status: 500 });
  }
}
