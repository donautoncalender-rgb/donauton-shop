import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email } = body;

        const erpUrl = `${process.env.DONAUTON_SUITE_URL}/api/v1/shop/customer-auth`;
        const erpKey = process.env.DONAUTON_SHOP_SECRET_123 || 'DONAUTON_SHOP_SECRET_123';

        // We can use the customer-auth endpoint by sending a dummy password to see if the user exists
        // Wait, customer-auth returns "Kunde hat bereits ein Konto" if register=true and email exists
        const erpRes = await fetch(erpUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${erpKey}`
            },
            body: JSON.stringify({
                email,
                password: "DUMMY",
                firstName: "D",
                lastName: "D",
                register: true,
                check_only: true
            })
        });

        const data = await erpRes.json();
        if (erpRes.status === 400 && data.error === "Kunde hat bereits ein Konto") {
            return NextResponse.json({ exists: true });
        }

        return NextResponse.json({ exists: false });

    } catch (e) {
        return NextResponse.json({ exists: false });
    }
}
