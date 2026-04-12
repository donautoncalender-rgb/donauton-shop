import { prisma } from '../../lib/prisma';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
  const settingsRecords = await prisma.shopSetting.findMany({
    where: {
      key: { in: ['paypal_client_id', 'turnstile_site_key'] }
    }
  });

  const settings = settingsRecords.reduce((acc, current) => {
    acc[current.key] = current.value;
    return acc;
  }, {} as Record<string, string>);

  const paypalClientId = settings['paypal_client_id'] || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID || null;
  const turnstileSiteKey = settings['turnstile_site_key'] || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || process.env.TURNSTILE_SITE_KEY || null;

  return <CheckoutClient paypalClientId={paypalClientId} turnstileSiteKey={turnstileSiteKey} />;
}
