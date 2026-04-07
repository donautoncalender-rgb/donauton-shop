import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, items, totals, paymentStatus } = body;
    
    // Safely fallback to pending if not provided
    const finalPaymentStatus = paymentStatus === 'paid' ? 'paid' : 'pending';

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Warenkorb ist leer' }, { status: 400 });
    }

    // Generate simple order number
    const orderNumber = `DTN-${Date.now().toString().slice(-6)}`;

    // Calculate subtotal from items to prevent tampering
    let calculatedSubtotal = 0;
    const orderItems = items.map((item: any) => {
      const price = parseFloat(item.price);
      calculatedSubtotal += price * parseInt(item.quantity);
      
      return {
        productId: item.id || null,
        title: item.title,
        variant: item.variant || null,
        price: price,
        quantity: parseInt(item.quantity)
      };
    });

    const shipping = 4.90; // Default shipping
    const calculatedTotal = calculatedSubtotal + shipping;

    // Create the order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: finalPaymentStatus === 'paid' ? 'PAID' : 'PENDING',
        
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName || null,
        address: formData.address,
        zipCode: formData.zip,
        city: formData.city,
        email: formData.email,
        
        paymentMethod: formData.payment,
        subtotal: calculatedSubtotal,
        shippingCost: shipping,
        total: calculatedTotal,
        
        items: {
          create: orderItems
        }
      }
    });

    // --- ERP SYNC START ---
    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const erpKeySetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_key' }});

    const erpUrl = erpUrlSetting?.value || process.env.ERP_SUITE_URL || 'http://localhost:3001/api/v1/shop/orders';
    const erpKey = erpKeySetting?.value || process.env.ERP_SUITE_TOKEN;
    
    if (erpKey) {
        try {
            // Fetch real SKUs from the database instead of falling back to the Prisma CUID
            const productIds = orderItems.map((oi: any) => oi.productId).filter(Boolean);
            const dbProducts = await prisma.product.findMany({
              where: { id: { in: productIds } },
              select: { id: true, sku: true, wooId: true }
            });
            const skuMap: Record<string, string> = {};
            dbProducts.forEach(p => {
              skuMap[p.id] = p.sku || (p.wooId ? p.wooId.toString() : p.id);
            });

            const erpPayload = {
                order_number: order.orderNumber,
                customer: {
                    email: order.email,
                    first_name: order.firstName,
                    last_name: order.lastName,
                    billing: {
                        company: order.companyName,
                        street: order.address,
                        zip: order.zipCode,
                        city: order.city,
                        country: "DE"
                    },
                    shipping: {
                        company: order.companyName,
                        street: order.address,
                        zip: order.zipCode,
                        city: order.city,
                        country: "DE"
                    }
                },
                items: orderItems.map((oi: any) => ({
                    sku: (oi.productId && skuMap[oi.productId]) ? skuMap[oi.productId] : oi.productId, // Use REAL fetched SKU

                    title: oi.title,
                    quantity: oi.quantity,
                    unit_price_gross: oi.price,
                    unit_price_net: oi.price / 1.07, // roughly ~7% tax assumption
                    tax_rate_percent: 7
                })),
                totals: {
                    total_gross: order.total,
                    total_net: order.total / 1.07,
                    shipping_cost_gross: order.shippingCost
                },
                payment: {
                    method: order.paymentMethod,
                    status: finalPaymentStatus
                }
            };

            const erpRes = await fetch(erpUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${erpKey}`
                },
                body: JSON.stringify(erpPayload)
            });

            if (!erpRes.ok) {
                console.error("ERP Sync responded with status:", erpRes.status);
            }
        } catch (erpError) {
            console.error("Failed to sync with ERP:", erpError);
        }
    }
    // --- ERP SYNC END ---

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.orderNumber 
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return NextResponse.json(
      { error: "Fehler bei der Bestellabwicklung", details: error.message },
      { status: 500 }
    );
  }
}
