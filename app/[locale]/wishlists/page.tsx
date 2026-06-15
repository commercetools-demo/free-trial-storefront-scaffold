'use client';

import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { HeartIcon } from '@/components/ui/icons';

export default function WishlistsPage() {
  const { wishlists, isLoading } = useWishlist();

  if (isLoading) {
    return (
      <div className="grid place-items-center py-32">
        <Spinner size={32} />
      </div>
    );
  }

  const lists = wishlists ?? [];
  const allEmpty = lists.every((w) => w.lineItems.length === 0);

  if (lists.length === 0 || allEmpty) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mist text-magenta">
          <HeartIcon width={28} height={28} />
        </div>
        <h1 className="mt-5 text-3xl font-black">Your wishlist is empty</h1>
        <p className="mt-2 text-ink/50">Tap the heart on any product to save it for later.</p>
        <Link href="/" className="mt-6 inline-block">
          <Button variant="primary" size="lg">
            Discover products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
      <h1 className="mb-8 text-4xl font-black tracking-tight">My wishlists</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((w) => (
          <Link
            key={w.id}
            href={`/wishlists/${w.id}`}
            className="group rounded-3xl border border-border p-4 hover:border-violet"
          >
            <div className="grid grid-cols-3 gap-2">
              {w.lineItems.slice(0, 3).map((li) => (
                <div key={li.lineItemId} className="relative aspect-square overflow-hidden rounded-xl bg-mist">
                  {li.image && (
                    <Image src={li.image} alt={li.name} fill sizes="120px" className="object-cover" />
                  )}
                </div>
              ))}
              {w.lineItems.length === 0 &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl bg-mist" />
                ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold group-hover:text-violet">{w.name}</span>
              <span className="text-sm text-ink/50">{w.lineItems.length} items</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
