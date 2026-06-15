'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useCartSWR, useCartMutations } from '@/hooks/useCartSWR';
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
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart?: Cart | null;
}) {
  const [showMiniCart, setShowMiniCart] = useState(false);
  const { data: cart, isLoading } = useCartSWR(initialCart);
  const mutations = useCartMutations();

  const addToCart = useCallback(
    async (productId: string, variantId: number, quantity = 1) => {
      await mutations.addItem(productId, variantId, quantity);
      setShowMiniCart(true);
    },
    [mutations],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        showMiniCart,
        openMiniCart: () => setShowMiniCart(true),
        closeMiniCart: () => setShowMiniCart(false),
        addToCart,
        mutateCart: mutations,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be inside CartProvider');
  return ctx;
}
