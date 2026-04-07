import { prisma } from '../../lib/prisma';
import RegisterClient from './RegisterClient';

export const dynamic = 'force-dynamic';

export default async function RegisterPage() {
  const turnstileRecord = await prisma.shopSetting.findUnique({
    where: { key: 'turnstile_site_key' }
  });

  return <RegisterClient turnstileSiteKey={turnstileRecord?.value || null} />;
}
