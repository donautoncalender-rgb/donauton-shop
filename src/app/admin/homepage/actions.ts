'use server';

import { prisma } from '../../../lib/prisma';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';

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

    // --- NEW: DYNAMIC HERO SLIDES ---
    const slideCount = parseInt((formData.get('slide_count') as string) || '0', 10);
    const dynamicSlides = [];
    
    for (let i = 0; i < slideCount; i++) {
      let imageUrl = formData.get(`slide_${i}_img_url`) as string || formData.get(`slide_${i}_image_existing`) as string;
      const file = formData.get(`slide_${i}_img_file`) as File | null;
      
      if (file && file.size > 0) {
        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        const ext = extMatch ? extMatch[0] : '.jpg';
        const filename = `homepage/dynamic_slide_${i}_${Date.now()}${ext}`;
        try {
          const bytes = await file.arrayBuffer();
          const blob = await put(filename, Buffer.from(bytes), { 
            access: 'public', contentType: file.type || 'image/jpeg'
          });
          imageUrl = blob.url;
        } catch (e: any) {
          console.error("Blob Upload failed for dynamic slide", e);
        }
      }

      dynamicSlides.push({
        id: `slide_${Date.now()}_${i}`,
        image: imageUrl || '',
        tagline: formData.get(`slide_${i}_tagline`) as string || '',
        title: formData.get(`slide_${i}_title`) as string || '',
        subtitle: formData.get(`slide_${i}_subtitle`) as string || '',
        text: formData.get(`slide_${i}_text`) as string || '',
        btnText: formData.get(`slide_${i}_btnText`) as string || '',
        link: formData.get(`slide_${i}_link`) as string || '',
        isPromotion: formData.get(`slide_${i}_isPromotion`) === 'on',
        validFrom: formData.get(`slide_${i}_validFrom`) as string || '',
        validUntil: formData.get(`slide_${i}_validUntil`) as string || '',
      });
    }

    await prisma.shopSetting.upsert({
      where: { key: 'hero_slides_data' },
      update: { value: JSON.stringify(dynamicSlides) },
      create: { key: 'hero_slides_data', value: JSON.stringify(dynamicSlides) }
    });

    // 2. Image Uploads (Other settings)
    const imageKeys = [
      'home_cat1_img',
      'home_cat2_img',
      'home_cat3_img',
      'home_cat4_img',
      'home_cat5_img',
      'home_featured_img',
    ];

    for (const baseKey of imageKeys) {
      const file = formData.get(`${baseKey}_file`) as File | null;
      let url = formData.get(`${baseKey}_url`) as string;

      if (file && file.size > 0) {
        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        const ext = extMatch ? extMatch[0] : '.jpg';
        const filename = `homepage/${baseKey}-${Date.now()}${ext}`;
        
        try {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const blob = await put(filename, buffer, { 
            access: 'public',
            contentType: file.type || 'image/jpeg'
          });
          url = blob.url;
        } catch (e: any) {
          console.error("Blob Upload failed", e);
        }
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
