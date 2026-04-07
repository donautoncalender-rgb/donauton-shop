'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  // Hardcoded Admin Credentials
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@donauton.de';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'donauton2026!';

  if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
    // Set a simple auth cookie
    (await cookies()).set('auth_session', 'admin_authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    redirect('/admin');
  }

  return { error: 'Ungültige Zugangsdaten. Bitte versuchen Sie es erneut.' };
}

export async function logoutAction() {
  (await cookies()).delete('auth_session');
  redirect('/login');
}
