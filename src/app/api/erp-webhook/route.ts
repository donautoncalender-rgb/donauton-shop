import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
    try {
        const payload = await request.json();
        
        // Log webhook payload for debugging
        console.log("[ERP Webhook Received]", payload);

        if (payload.event !== 'order.status_changed' || !payload.order_number) {
            return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
        }

        // Map ERP Status to Shop Status
        // Shop uses: PENDING, PROCESSING, COMPLETED, CANCELLED
        let newShopStatus = payload.status;
        if (payload.status === 'PAID') newShopStatus = 'PROCESSING';
        if (payload.status === 'SHIPPED') newShopStatus = 'COMPLETED';

        const updatedOrder = await prisma.order.update({
            where: { orderNumber: payload.order_number },
            data: { 
                status: newShopStatus,
                // In future, you could also add fields for tracking links if the DB schema gets expanded:
                // trackingProvider: payload.tracking_provider,
                // trackingNumber: payload.tracking_number,
            }
        });

        // If the new status is COMPLETED (shipped), usually the Shop would now send out the customer email!
        if (newShopStatus === 'COMPLETED') {
            console.log(`[Shop] Order ${updatedOrder.orderNumber} is now COMPLETED (shipped). Sending customer notification... (stub)`);
            // await sendShippingEmailToCustomer(updatedOrder.email, payload.tracking_provider, payload.tracking_number);
        }

        return NextResponse.json({ success: true, message: `Order ${updatedOrder.orderNumber} status synced` });
    } catch (e: any) {
        if (e.code === 'P2025') {
            return NextResponse.json({ error: "Order not found in Shop DB" }, { status: 404 });
        }
        console.error("Webhook processing error:", e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
