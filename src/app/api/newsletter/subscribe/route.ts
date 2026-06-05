import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // In production, this forwards the subscription to the DONAUTON Suite
    const SUITE_URL = process.env.NODE_ENV === 'production' 
      ? 'https://donauton-suite.de'
      : 'http://localhost:3000'; // Default local suite port

    const response = await fetch(`${SUITE_URL}/api/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Suite API Error:', response.statusText);
      return NextResponse.json({ error: 'Suite Fehler' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Newsletter Proxy Error:', error);
    return NextResponse.json({ error: 'Server Fehler' }, { status: 500 });
  }
}
