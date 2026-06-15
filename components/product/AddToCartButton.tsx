'use client';

import { useState } from 'react';
import { useCartContext } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import { BagIcon, CheckIcon } from '@/components/ui/icons';

export default function AddToCartButton({
  productId,
  variantId,
  disabled,
  outOfStock,
}: {
  productId: string;
  variantId: number;
  disabled?: boolean;
  outOfStock?: boolean;
}) {
  const { addToCart } = useCartContext();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onClick() {
    setLoading(true);
    try {
      await addToCart(productId, variantId, 1);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } finally {
      setLoading(false);
    }
  }

  if (outOfStock) {
    return (
      <Button variant="secondary" size="lg" disabled className="w-full">
        Sold out
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      size="lg"
      className="w-full"
      onClick={onClick}
      isLoading={loading}
      disabled={disabled || loading}
    >
      {done ? <CheckIcon width={18} height={18} /> : <BagIcon width={18} height={18} />}
      {done ? 'Added!' : 'Add to bag'}
    </Button>
  );
}
