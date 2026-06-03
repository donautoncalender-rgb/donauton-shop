'use server';

import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updatePage(formData: FormData) {
  const key = formData.get('key') as string;
  const content = formData.get('content') as string;
  const title = formData.get('title') as string;

  if (!key) throw new Error('Key ist erforderlich');

  // wir verwenden upsert
  await prisma.shopSetting.upsert({
    where: { key: key },
    update: { value: content },
    create: { key: key, value: content }
  });

  // also upsert title if provided
  if (title) {
    await prisma.shopSetting.upsert({
      where: { key: `${key}_title` },
      update: { value: title },
      create: { key: `${key}_title`, value: title }
    });
  }

  revalidatePath('/admin/pages');
  revalidatePath(`/${key.replace('page_', '')}`);
}
