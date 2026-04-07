'use client';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff', fontSize: '1rem', fontWeight: 600 } }} />;
}
