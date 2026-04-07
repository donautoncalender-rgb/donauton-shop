'use server';

import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSlider(formData: FormData) {
  await prisma.frontpageSlider.create({
    data: {
      title: 'Neuer Produktslider',
      linkUrl: '/noten',
      sortOrder: 10,
      isVisible: true,
      filterType: 'LATEST',
      limit: 15
    }
  });
  revalidatePath('/admin/sliders');
  revalidatePath('/');
}

export async function updateSlider(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.frontpageSlider.update({
    where: { id },
    data: {
      title: formData.get('title') as string,
      linkUrl: formData.get('linkUrl') as string,
      sortOrder: parseInt(formData.get('sortOrder') as string) || 0,
      filterType: formData.get('filterType') as string,
      filterValue: formData.get('filterValue') as string || null,
      isVisible: formData.get('isVisible') === 'on'
    }
  });
  revalidatePath('/admin/sliders');
  revalidatePath('/');
}

export async function deleteSlider(formData: FormData) {
  const id = formData.get('id') as string;
  await prisma.frontpageSlider.delete({ where: { id } });
  revalidatePath('/admin/sliders');
  revalidatePath('/');
}
