'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCartContext } from '@/context/CartProvider';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { QuantityStepper } from '@/components/ui/QuantityStepper';

export function AddToCartButton({
  productId,
  variantId,
  inStock,
  hasPrice,
}: {
  productId: string;
  variantId: number;
  inStock: boolean;
  hasPrice: boolean;
}) {
  const t = useTranslations('pdp');
  const { addToCart } = useCartContext();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = !inStock || !hasPrice || busy;

  async function onClick() {
    setBusy(true);
    setError(null);
    try {
      await addToCart(productId, variantId, qty);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('addError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} disabled={busy} />
        <Button onClick={onClick} disabled={disabled} className="flex-1">
          {busy && <Spinner />}
          {!inStock ? t('outOfStock') : !hasPrice ? t('unavailable') : t('addToCart')}
        </Button>
      </div>
      {error && <p className="text-sm text-terra">{error}</p>}
    </div>
  );
}
