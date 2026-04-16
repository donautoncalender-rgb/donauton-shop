'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  variant: string;
  image: string;
  publisher?: string | null;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variant: string) => void;
  updateQuantity: (id: string, variant: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load from localeStorage initially
  useEffect(() => {
    try {
      const stored = localStorage.getItem('donauton_cart');
      if (stored) setItems(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to load cart', e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('donauton_cart', JSON.stringify(items));
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item exactly matches ID and Variant
      const existing = prevItems.find((i) => i.id === newItem.id && i.variant === newItem.variant);
      if (existing) {
        return prevItems.map((i) => 
          i.id === newItem.id && i.variant === newItem.variant 
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prevItems, newItem];
    });
    // Removed auto-open cart: let components handle notifications
  };

  const removeFromCart = (id: string, variant: string) => {
    setItems((prevItems) => prevItems.filter((i) => !(i.id === id && i.variant === variant)));
  };

  const updateQuantity = (id: string, variant: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prevItems) => 
      prevItems.map((i) => 
        i.id === id && i.variant === variant ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, isCartOpen, openCart, closeCart, toggleCart,
      addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
