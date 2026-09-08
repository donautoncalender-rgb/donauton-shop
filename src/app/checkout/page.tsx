import { prisma } from '../../lib/prisma';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
  const settingsRecords = await prisma.shopSetting.findMany({
    where: {
      key: { in: ['paypal_client_id', 'turnstile_site_key', 'shipping_zones', 'logo_url', 'newsletter_signet_url', 'checkout_upsell_active', 'checkout_upsell_product_id', 'checkout_upsell_text'] }
    }
  });

  const settings = settingsRecords.reduce((acc, current) => {
    acc[current.key] = current.value;
    return acc;
  }, {} as Record<string, string>);

  const paypalClientId = settings['paypal_client_id'] || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || null;
  const turnstileSiteKey = settings['turnstile_site_key'] || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || null;
  let shippingZones = [];
  try {
    if (settings['shipping_zones']) {
      shippingZones = JSON.parse(settings['shipping_zones']);
    }
  } catch (e) {
    console.error("Failed to parse shipping zones", e);
  }

  // Use the signet if available, otherwise fallback to the main logo
  const logoUrl = settings['newsletter_signet_url'] || settings['logo_url'] || null;

  let upsellData = null;
  if (settings['checkout_upsell_active'] === 'true' && settings['checkout_upsell_product_id']) {
    const product = await prisma.product.findUnique({
      where: { id: settings['checkout_upsell_product_id'] },
      select: { id: true, title: true, price: true, image: true, sku: true, category: true, digitalPrice: true, variantsJson: true, discountPercent: true }
    });
    if (product) {
      upsellData = {
        product,
        text: settings['checkout_upsell_text'] || 'Sonderangebot hinzufügen!'
      };
    }
  }

  return <CheckoutClient paypalClientId={paypalClientId} turnstileSiteKey={turnstileSiteKey} shippingZones={shippingZones} logoUrl={logoUrl} upsellData={upsellData} />;
}
