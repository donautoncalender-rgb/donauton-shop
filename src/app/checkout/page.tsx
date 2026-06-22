import { prisma } from '../../lib/prisma';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
  const settingsRecords = await prisma.shopSetting.findMany({
    where: {
      key: { in: ['paypal_client_id', 'turnstile_site_key', 'shipping_zones', 'logo_url', 'newsletter_signet_url'] }
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

  return <CheckoutClient paypalClientId={paypalClientId} turnstileSiteKey={turnstileSiteKey} shippingZones={shippingZones} logoUrl={logoUrl} />;
}
