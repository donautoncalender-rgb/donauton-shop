import { prisma } from '../../lib/prisma';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';

export default async function CustomerLoginPage() {
  const turnstileRecord = await prisma.shopSetting.findUnique({
    where: { key: 'turnstile_site_key' }
  });

  return <LoginClient turnstileSiteKey={turnstileRecord?.value || null} />;
}
