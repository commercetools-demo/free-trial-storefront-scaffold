'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartContext } from '@/context/CartContext';
import { useLocale } from '@/context/LocaleContext';
import { formatMoney } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function WishlistDetailPage() {
  const params = useParams<{ id: string }>();
  const { wishlists, isLoading, removeItem } = useWishlist();
  const { addToCart } = useCartContext();
  const { locale } = useLocale();

  if (isLoading) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner size={32} />
      </div>
    );
  }

  const wishlist = (wishlists ?? []).find((w) => w.id === params.id);

  if (!wishlist) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-black">Wishlist not found</h1>
        <Link href="/wishlists" className="mt-6 inline-block">
          <Button variant="primary" size="lg">Back to wishlists</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 lg:px-8 py-10">
      <nav className="mb-4 text-sm text-ink/50">
        <Link href="/wishlists" className="hover:text-violet">Wishlists</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink/70">{wishlist.name}</span>
      </nav>
      <h1 className="mb-8 text-4xl font-black tracking-tight">{wishlist.name}</h1>

      {wishlist.lineItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center">
          <p className="font-semibold">This list is empty</p>
          <Link href="/" className="mt-4 inline-block">
            <Button variant="outline" size="md">Find something to save</Button>
          </Link>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2">
          {wishlist.lineItems.map((li) => (
            <li key={li.lineItemId} className="flex gap-4 rounded-2xl border border-border p-4">
              <Link
                href={li.sku ? `/p/${li.sku}` : '#'}
                className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-mist"
              >
                {li.image && (
                  <Image src={li.image} alt={li.name} fill sizes="80px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <Link href={li.sku ? `/p/${li.sku}` : '#'} className="font-semibold hover:text-violet">
                  {li.name}
                </Link>
                {li.price && (
                  <span className="mt-1 text-sm font-bold">{formatMoney(li.price, locale)}</span>
                )}
                <div className="mt-auto flex items-center gap-2 pt-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addToCart(li.productId, li.variantId, 1)}
                  >
                    Add to bag
                  </Button>
                  <button
                    onClick={() => removeItem(wishlist.id, li.lineItemId)}
                    className="text-sm text-ink/40 hover:text-magenta"
                  >
                    Remove
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
