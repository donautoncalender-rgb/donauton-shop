import { prisma } from '../../../lib/prisma';

export async function syncOrderDetails(
  orderId: string,
  metadata: {
    password?: string;
    createAccount?: boolean;
    newsletter?: boolean;
    finalPaymentStatus?: string;
  },
  baseUrl: string
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found for sync.`);
    }

    const finalPaymentStatus = metadata.finalPaymentStatus === 'paid' ? 'paid' : 'pending';

    // 1. ERP SYNC
    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' } });
    const rawUrl = erpUrlSetting?.value || process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    let erpUrlBase = new URL(rawUrl).origin;
    if (process.env.NODE_ENV === 'production' && (erpUrlBase.includes('localhost') || erpUrlBase.includes('127.0.0.1'))) {
      erpUrlBase = 'https://donauton-suite.de';
    }
    const erpKey = 'DONAUTON_SHOP_SECRET_123';

    if (erpKey) {
      // Fetch real SKUs from the database instead of falling back to the Prisma CUID
      const productIds = order.items.map((oi) => oi.productId).filter(Boolean) as string[];
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, sku: true, wooId: true },
      });
      const skuMap: Record<string, string> = {};
      dbProducts.forEach((p) => {
        skuMap[p.id] = p.sku || (p.wooId ? p.wooId.toString() : p.id);
      });

      const erpPayload = {
        order_number: order.orderNumber,
        customer: {
          email: order.email,
          first_name: order.firstName,
          last_name: order.lastName,
          password: metadata.password || undefined,
          create_account: metadata.createAccount ?? false,
          billing: {
            company: order.companyName,
            street: order.address,
            zip: order.zipCode,
            city: order.city,
            country: 'DE',
          },
          shipping: {
            company: order.companyName,
            street: order.address,
            zip: order.zipCode,
            city: order.city,
            country: 'DE',
          },
        },
        items: order.items.map((oi) => ({
          sku: (oi.productId && skuMap[oi.productId]) ? skuMap[oi.productId] : (oi.productId || ''),
          title: (oi.variant && oi.variant !== 'Digital') ? `${oi.title} - ${oi.variant.replace(/,\s*/g, ' - ')}` : oi.title,
          quantity: oi.quantity,
          unit_price_gross: oi.price,
          unit_price_net: oi.price / 1.07, // roughly ~7% tax assumption
          tax_rate_percent: 7,
          attendee_names: oi.attendeeNames ? JSON.parse(oi.attendeeNames) : [],
        })),
        totals: {
          total_gross: order.total,
          total_net: order.total / 1.07,
          shipping_cost_gross: order.shippingCost,
        },
        customer_notes: metadata.newsletter ? 'Kunde möchte den Newsletter abonnieren.' : 'Kunde hat Newsletter-Anmeldung abgelehnt.',
        payment: {
          method: order.paymentMethod,
          status: finalPaymentStatus,
        },
      };

      const erpUrl = `${erpUrlBase}/api/v1/shop/orders`;
      const erpRes = await fetch(erpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${erpKey}`,
        },
        body: JSON.stringify(erpPayload),
      });

      if (!erpRes.ok) {
        const text = await erpRes.text();
        throw new Error(`ERP Suite rejected the order (${erpRes.status}): ${text}`);
      }
    }

    // 2. NEWSLETTER SYNC
    if (metadata.newsletter) {
      try {
        await fetch(`${baseUrl}/api/newsletter/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: order.email,
            firstName: order.firstName,
            lastName: order.lastName,
            source: 'CHECKOUT',
          }),
        });
      } catch (newsletterErr) {
        console.error('Failed to sync newsletter subscription:', newsletterErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to sync order details:', error);
    throw error;
  }
}
