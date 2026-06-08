'use client';

import { useEffect } from 'react';
import { useCart } from '../../../context/CartContext';

export default function ClearCartHelper() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
