'use client';
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useCartSWR, useCartMutations } from '@/hooks/useCart';
import type { Cart } from '@/lib/types';

interface CartContextValue {
  cart: Cart | null | undefined;
  isLoading: boolean;
  showMiniCart: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  addToCart: (productId: string, variantId: number, quantity?: number) => Promise<void>;
  mutateCart: ReturnType<typeof useCartMutations>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart?: Cart | null;
  children: ReactNode;
}) {
  const { data: cart, isLoading } = useCartSWR(initialCart);
  const mutateCart = useCartMutations();
  const [showMiniCart, setShowMiniCart] = useState(false);

  const openMiniCart = useCallback(() => setShowMiniCart(true), []);
  const closeMiniCart = useCallback(() => setShowMiniCart(false), []);

  const addToCart = useCallback(
    async (productId: string, variantId: number, quantity = 1) => {
      await mutateCart.addItem(productId, variantId, quantity);
      setShowMiniCart(true);
    },
    [mutateCart]
  );

  return (
    <CartContext.Provider
      value={{ cart, isLoading, showMiniCart, openMiniCart, closeMiniCart, addToCart, mutateCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used within CartProvider');
  return ctx;
}
