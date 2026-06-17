'use client';
import { use, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartContext } from '@/context/CartProvider';
import { PriceDisplay } from '@/components/ui/Price';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function WishlistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('wishlist');
  const tc = useTranslations('common');
  const { wishlists, isLoading, removeItem } = useWishlist();
  const { addToCart } = useCartContext();
  const [busy, setBusy] = useState<string | null>(null);

  const wishlist = wishlists.find((w) => w.id === id);

  if (isLoading && !wishlist) {
    return <div className="flex py-12"><Spinner className="h-6 w-6 text-charcoal" /></div>;
  }

  if (!wishlist) {
    return (
      <div className="py-12 text-center text-charcoal-light">
        <p>{t('notFound')}</p>
        <Link href="/wishlists" className="mt-2 inline-block text-terra hover:underline">{t('backToWishlists')}</Link>
      </div>
    );
  }

  async function add(productId: string, variantId: number, key: string) {
    setBusy(key);
    try {
      await addToCart(productId, variantId, 1);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <nav className="mb-4 text-sm text-charcoal-light">
        <Link href="/wishlists" className="hover:text-terra">{t('title')}</Link>
        <span aria-hidden> / </span>
        <span className="text-charcoal">{wishlist.name}</span>
      </nav>
      <h1 className="mb-8 text-3xl font-semibold text-charcoal">{wishlist.name}</h1>

      {wishlist.lineItems.length === 0 ? (
        <div className="rounded-sm border border-border p-8 text-center text-charcoal-light">
          {t('emptyList')}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {wishlist.lineItems.map((li) => (
            <li key={li.lineItemId} className="flex gap-4 rounded-sm border border-border p-4">
              <Link href={li.slug ? `/product/${li.slug}` : '#'} className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-sm bg-cream-dark">
                {li.image && <Image src={li.image} alt={li.name} fill sizes="96px" className="object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-charcoal line-clamp-2">{li.name}</span>
                <PriceDisplay price={li.price} className="mt-1 text-sm" />
                <div className="mt-auto flex items-center gap-3 pt-3">
                  <Button onClick={() => add(li.productId, li.variantId, li.lineItemId)} disabled={busy === li.lineItemId}>
                    {busy === li.lineItemId && <Spinner />} {t('addToCart')}
                  </Button>
                  <button
                    onClick={() => removeItem(wishlist.id, li.lineItemId)}
                    className="text-xs text-charcoal-light hover:text-terra"
                  >
                    {tc('remove')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
