'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useRouter } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';

export function HeartButton({
  productId,
  variantId,
  className = '',
  size = 20,
}: {
  productId: string;
  variantId: number;
  className?: string;
  size?: number;
}) {
  const t = useTranslations('product');
  const { isSaved, toggle, isLoggedIn } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  const saved = optimistic ?? isSaved(productId, variantId);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setBusy(true);
    setOptimistic(!saved);
    try {
      await toggle(productId, variantId);
    } catch {
      setOptimistic(saved); // revert
    } finally {
      setBusy(false);
      setOptimistic(null);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? t('removeFromWishlist') : t('addToWishlist')}
      className={`inline-flex items-center justify-center rounded-full transition-colors ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        className={saved ? 'text-terra' : 'text-charcoal'}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
