'use server';

import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function saveHomepageSettings(formData: FormData) {
  try {
    // 1. Text Fields
    const textFields = [
      'home_marquee_text',
      'home_newsletter_title',
      'home_newsletter_text',
      'home_featured_tagline',
      'home_featured_title',
      'home_featured_text',
      'home_featured_btn_text',
      'home_featured_btn_link',
      'home_usp1_title', 'home_usp1_text', 'home_usp1_icon',
      'home_usp2_title', 'home_usp2_text', 'home_usp2_icon',
      'home_usp3_title', 'home_usp3_text', 'home_usp3_icon',
      'home_usp4_title', 'home_usp4_text', 'home_usp4_icon',
      'home_slider_1_tagline', 'home_slider_1_title', 'home_slider_1_subtitle', 'home_slider_1_text', 'home_slider_1_btn', 'home_slider_1_link',
      'home_slider_2_tagline', 'home_slider_2_title', 'home_slider_2_subtitle', 'home_slider_2_text', 'home_slider_2_btn', 'home_slider_2_link',
      'home_slider_3_tagline', 'home_slider_3_title', 'home_slider_3_subtitle', 'home_slider_3_text', 'home_slider_3_btn', 'home_slider_3_link',
    ];

    for (const field of textFields) {
      const val = formData.get(field) as string;
      if (val !== undefined && val !== null) {
        await prisma.shopSetting.upsert({
          where: { key: field },
          update: { value: val },
          create: { key: field, value: val }
        });
      }
    }

    // 2. Image Uploads
    const imageKeys = [
      'home_slider_1_img',
      'home_slider_2_img',
      'home_slider_3_img',
      'home_cat1_img',
      'home_cat2_img',
      'home_cat3_img',
      'home_cat4_img',
      'home_cat5_img',
      'home_featured_img',
    ];

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    let dirCreated = false;

    for (const baseKey of imageKeys) {
      const file = formData.get(`${baseKey}_file`) as File | null;
      let url = formData.get(`${baseKey}_url`) as string;

      if (file && file.size > 0 && typeof file.arrayBuffer === 'function') {
        if (!dirCreated) {
          try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}
          dirCreated = true;
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        const ext = extMatch ? extMatch[0] : '.jpg';
        const filename = `${baseKey}-${Date.now()}${ext}`;
        const path = join(uploadDir, filename);
        
        await writeFile(path, buffer);
        url = `/uploads/${filename}`;
      }

      if (url !== null && url !== undefined && url !== '') {
        await prisma.shopSetting.upsert({
          where: { key: baseKey },
          update: { value: url },
          create: { key: baseKey, value: url }
        });
      }
    }

    revalidatePath('/admin/homepage');
    revalidatePath('/');
  } catch (err: any) {
    console.error('CRASH IN HOMEPAGE ACTIONS:', err);
    throw new Error('Failed to save settings: ' + err.message);
  }
}
