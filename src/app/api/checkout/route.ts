import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { syncOrderDetails } from './sync';

export const maxDuration = 60; // Erlaubt bis zu 60 Sekunden Laufzeit auf Vercel (Pro Plan)

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formData, items, totals, paymentStatus } = body;
    
    // Safely fallback to pending if not provided
    const finalPaymentStatus = paymentStatus === 'paid' ? 'paid' : 'pending';

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Warenkorb ist leer' }, { status: 400 });
    }

    // Fetch next sequential order number from the ERP Suite
    const erpUrlSetting = await prisma.shopSetting.findUnique({ where: { key: 'erp_suite_url' }});
    const rawUrl = erpUrlSetting?.value || process.env.ERP_SUITE_URL || 'https://donauton-suite.de';
    let erpUrlBase = new URL(rawUrl).origin;
    if (process.env.NODE_ENV === 'production' && (erpUrlBase.includes('localhost') || erpUrlBase.includes('127.0.0.1'))) {
        erpUrlBase = 'https://donauton-suite.de';
    }
    const erpKey = 'DONAUTON_SHOP_SECRET_123';
    
    let orderNumber = `DTN-${Date.now().toString().slice(-6)}`;
    try {
        const seqRes = await fetch(`${erpUrlBase}/api/v1/shop/next-order-number`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${erpKey}`
            }
        });
        if (seqRes.ok) {
            const seqData = await seqRes.json();
            if (seqData.success && seqData.orderNumber) {
                orderNumber = seqData.orderNumber;
            }
        } else {
            console.warn("ERP Sequence Fetch Failed, falling back to DTN format", await seqRes.text());
        }
    } catch (seqError) {
        console.error("Failed to fetch order sequence from ERP:", seqError);
    }

    // Fetch all products from DB to perform secure total recalculation and prevent price tampering
    const productIds = items.map((item: any) => item.id).filter(Boolean) as string[];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    const dbProductsMap = new Map(dbProducts.map(p => [p.id, p]));

    // Calculate subtotal from items to prevent tampering
    let calculatedSubtotal = 0;
    const orderItems = items.map((item: any) => {
      const dbProduct = item.id ? dbProductsMap.get(item.id) : null;
      let finalPrice = parseFloat(item.price); // default fallback

      if (dbProduct) {
        if (item.variant === 'Digital') {
          let basePriceFloat = dbProduct.digitalPrice !== null 
            ? dbProduct.digitalPrice 
            : parseFloat((dbProduct.price || '0').replace(' €', '').replace(',', '.').replace(/[^0-9.-]/g, ''));
          if (isNaN(basePriceFloat)) basePriceFloat = 0;
          const discountPercent = dbProduct.discountPercent || 0;
          finalPrice = discountPercent > 0 ? basePriceFloat * (1 - discountPercent / 100) : basePriceFloat;
        } else if (dbProduct.variantsJson) {
          try {
            const variantsList = JSON.parse(dbProduct.variantsJson);
            const matchedVariant = variantsList.find((v: any) => 
              v.title === item.variant || 
              (v.sku && v.sku === item.sku) ||
              v.id === item.variant
            );
            if (matchedVariant) {
              const vBasePriceFloat = parseFloat((matchedVariant.price || '0').replace(' €', '').replace(',', '.').replace(/[^0-9.-]/g, ''));
              const vDiscountPercent = matchedVariant.discountPercent !== undefined ? matchedVariant.discountPercent : dbProduct.discountPercent;
              finalPrice = vDiscountPercent > 0 && !isNaN(vBasePriceFloat) ? vBasePriceFloat * (1 - vDiscountPercent / 100) : vBasePriceFloat;
            } else {
              const parentBase = parseFloat((dbProduct.price || '0').replace(' €', '').replace(',', '.').replace(/[^0-9.-]/g, ''));
              const parentDiscount = dbProduct.discountPercent || 0;
              finalPrice = parentDiscount > 0 && !isNaN(parentBase) ? parentBase * (1 - parentDiscount / 100) : parentBase;
            }
          } catch (e) {
            console.error("Error parsing variantsJson in checkout for product " + dbProduct.id, e);
          }
        } else {
          const basePriceFloat = parseFloat((dbProduct.price || '0').replace(' €', '').replace(',', '.').replace(/[^0-9.-]/g, ''));
          const discountPercent = dbProduct.discountPercent || 0;
          finalPrice = discountPercent > 0 && !isNaN(basePriceFloat) ? basePriceFloat * (1 - discountPercent / 100) : basePriceFloat;
        }
      }

      const itemPrice = isNaN(finalPrice) ? 0 : finalPrice;
      calculatedSubtotal += itemPrice * parseInt(item.quantity);
      
      return {
        productId: item.id || null,
        title: item.title,
        variant: item.variant || null,
        price: itemPrice,
        quantity: parseInt(item.quantity),
        attendeeNames: item.attendeeNames ? JSON.stringify(item.attendeeNames) : null,
        sku: item.sku || null
      };
    });

    const orderItemsDb = orderItems.map(({ sku, ...rest }: any) => rest);

    const hasOnlyDigitalItems = orderItems.length > 0 && orderItems.every((item: any) => item.variant === 'Digital');
    // Fetch shipping zones from shop settings
    let shippingZones = [];
    try {
      const shippingZonesSetting = await prisma.shopSetting.findUnique({ where: { key: 'shipping_zones' } });
      if (shippingZonesSetting?.value) {
        shippingZones = JSON.parse(shippingZonesSetting.value);
      }
    } catch (e) {
      console.error("Failed to parse shipping zones in checkout", e);
    }

    let shipping = hasOnlyDigitalItems ? 0.00 : 4.90;
    if (!hasOnlyDigitalItems && shippingZones.length > 0) {
      const country = formData.country || 'DE';
      const matchedZone = shippingZones.find((z: any) => 
        z.countries.split(',').map((c: string) => c.trim().toUpperCase()).includes(country.toUpperCase())
      );
      if (matchedZone) {
        if (matchedZone.freeShippingThreshold > 0 && calculatedSubtotal >= matchedZone.freeShippingThreshold) {
          shipping = 0.00;
        } else {
          shipping = matchedZone.price;
        }
      }
    }
    const calculatedTotal = calculatedSubtotal + shipping;

    const isPaid = calculatedTotal === 0 || (formData.payment === 'PayPal' && paymentStatus === 'paid');

    // Create the order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: isPaid ? 'PAID' : 'PENDING',
        
        firstName: formData.firstName,
        lastName: formData.lastName,
        companyName: formData.companyName || null,
        address: formData.address,
        zipCode: formData.zip,
        city: formData.city,
        country: formData.country || 'DE',
        email: formData.email,
        
        paymentMethod: formData.payment,
        subtotal: calculatedSubtotal,
        shippingCost: shipping,
        total: calculatedTotal,
        
        items: {
          create: orderItemsDb
        }
      }
    });

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    if (formData.payment === 'Kreditkarte') {
      const stripeSecretKeySetting = await prisma.shopSetting.findUnique({
        where: { key: 'stripe_secret_key' }
      });
      const stripeSecretKey = stripeSecretKeySetting?.value || process.env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        throw new Error('Stripe-Zugangsdaten (Secret Key) sind nicht in der Datenbank konfiguriert.');
      }

      // Initialize stripe
      const Stripe = require('stripe');
      const stripe = new Stripe(stripeSecretKey);

      // Create Stripe checkout session
      const lineItems = items.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.title + (item.variant && item.variant !== 'Digital' ? ` (${item.variant})` : ''),
            images: (item.image && typeof item.image === 'string' && item.image.startsWith('http')) ? [item.image] : [],
          },
          unit_amount: Math.round(parseFloat(item.price) * 100),
        },
        quantity: parseInt(item.quantity),
      }));

      // If shipping cost exists, add it as a separate line item
      if (shipping > 0) {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Versandkosten',
            },
            unit_amount: Math.round(shipping * 100),
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancel_url: `${baseUrl}/checkout?payment_error=true`,
        customer_email: order.email,
        metadata: {
          orderId: order.id,
          password: formData.password || '',
          createAccount: formData.createAccount ? 'true' : 'false',
          newsletter: formData.newsletter ? 'true' : 'false',
        },
      });

      return NextResponse.json({ 
        success: true, 
        orderId: order.id,
        orderNumber: order.orderNumber,
        redirectUrl: session.url
      });
    }

    // Sync to ERP & Newsletter for PayPal / invoice / bank transfer
    // Skip immediate sync for PayPal if it's pending (we sync it after payment capture)
    const skipSync = (formData.payment === 'PayPal' && !isPaid);
    if (!skipSync) {
      try {
        await syncOrderDetails(
          order.id,
          {
            password: formData.password,
            createAccount: formData.createAccount,
            newsletter: formData.newsletter,
            finalPaymentStatus: isPaid ? 'paid' : 'pending'
          },
          baseUrl
        );
      } catch (syncError) {
        console.error("Failed to sync checkout immediately:", syncError);
        // We still return success since the order was successfully created in the shop DB
      }
    }

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
