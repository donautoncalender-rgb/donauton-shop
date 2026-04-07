'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  title: string;
  price: string;
  image: string;
  slug: string;
  composer?: string;
  category?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Load from local storage initially
  useEffect(() => {
    try {
      const stored = localStorage.getItem('donauton_wishlist');
      if (stored) setItems(JSON.parse(stored));
    } catch (e) {
      console.warn('Failed to load wishlist', e);
    }
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('donauton_wishlist', JSON.stringify(items));
  }, [items]);

  const toggleWishlist = (newItem: WishlistItem) => {
    setItems((prevItems) => {
      const existing = prevItems.find((i) => i.id === newItem.id);
      if (existing) {
        // Remove it
        return prevItems.filter((i) => i.id !== newItem.id);
      } else {
        // Add it
        return [...prevItems, newItem];
      }
    });
  };

  const isInWishlist = (id: string) => {
    return items.some((i) => i.id === id);
  };

  const wishlistCount = items.length;

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
