import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { syncOrderDetails } from '../sync';

export const maxDuration = 60; // Erlaubt bis zu 60 Sekunden Laufzeit auf Vercel (Pro Plan)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, formData } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Bestellungs-ID fehlt' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Bestellung nicht gefunden' }, { status: 404 });
    }

    // If order is already PAID, return success immediately
    if (order.status === 'PAID') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
      });
    }

    // Update the order status to PAID
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
    });

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Sync order to ERP Suite & newsletter
    try {
      await syncOrderDetails(
        orderId,
        {
          password: formData?.password,
          createAccount: formData?.createAccount,
          newsletter: formData?.newsletter,
          finalPaymentStatus: 'paid',
        },
        baseUrl
      );
    } catch (syncError) {
      console.error("Failed to sync order on confirmation:", syncError);
      // We still return success as the transaction is completed on PayPal and updated in shop DB
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
    });

  } catch (error: any) {
    console.error("PayPal Confirmation Route Error:", error);
    return NextResponse.json(
      { error: "Fehler bei der Bestellungsbestätigung", details: error.message },
      { status: 500 }
    );
  }
}
