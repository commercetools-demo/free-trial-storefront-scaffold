'use client';

import { Link, useRouter } from '@/i18n/routing';
import { useCartContext } from '@/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useAccount } from '@/hooks/useAccount';
import { BagIcon, HeartIcon, UserIcon } from '@/components/ui/icons';
import LocaleSwitcher from './LocaleSwitcher';

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-aurora px-1 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function HeaderActions() {
  const { cart, openMiniCart } = useCartContext();
  const { totalItems } = useWishlist();
  const { user } = useAccount();
  const router = useRouter();

  const cartCount = cart?.totalLineItemQuantity ?? 0;

  return (
    <div className="ml-auto md:ml-2 flex items-center gap-1">
      <div className="hidden lg:block">
        <LocaleSwitcher />
      </div>

      <Link
        href={user ? '/account' : '/login'}
        aria-label="Account"
        className="rounded-full p-2.5 hover:bg-mist"
      >
        <UserIcon />
      </Link>

      <Link
        href={user ? '/wishlists' : '/login?redirect=/wishlists'}
        aria-label="Wishlist"
        className="relative rounded-full p-2.5 hover:bg-mist"
      >
        <HeartIcon />
        <Badge count={totalItems} />
      </Link>

      <button
        onClick={() => (cartCount > 0 ? openMiniCart() : router.push('/cart'))}
        aria-label="Cart"
        className="relative rounded-full p-2.5 hover:bg-mist"
      >
        <BagIcon />
        <Badge count={cartCount} />
      </button>
    </div>
  );
}
