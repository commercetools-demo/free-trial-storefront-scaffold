'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';
import { useAccount } from '@/hooks/useAccount';
import { HeartIcon } from '@/components/ui/icons';

export default function WishlistHeart({
  productId,
  variantId,
  size = 'md',
  className = '',
}: {
  productId: string;
  variantId: number;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const { user } = useAccount();
  const { isSaved, toggle } = useWishlist();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const saved = isSaved(productId);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent('/wishlists')}`);
      return;
    }
    setBusy(true);
    try {
      await toggle(productId, variantId);
    } finally {
      setBusy(false);
    }
  }

  const dim = size === 'lg' ? 26 : 20;

  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={saved}
      className={`grid place-items-center rounded-full bg-white/90 p-2 shadow-md backdrop-blur transition hover:scale-110 ${
        saved ? 'text-magenta' : 'text-ink/70 hover:text-magenta'
      } ${className}`}
    >
      <HeartIcon filled={saved} width={dim} height={dim} />
    </button>
  );
}
