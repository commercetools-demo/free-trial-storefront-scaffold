'use client';

import { Link } from '@/i18n/routing';
import { useAccount } from '@/hooks/useAccount';

export default function AccountOverviewPage() {
  const { user } = useAccount();
  if (!user) return null;

  const defaultShipping = user.addresses.find((a) => a.id === user.defaultShippingAddressId);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold">Profile</h2>
        <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink/50">Name</dt>
            <dd className="font-medium">{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</dd>
          </div>
          <div>
            <dt className="text-ink/50">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-border p-6">
        <h2 className="text-lg font-bold">Default shipping address</h2>
        {defaultShipping ? (
          <address className="mt-3 not-italic text-sm text-ink-soft">
            {[defaultShipping.streetName, defaultShipping.streetNumber].filter(Boolean).join(' ')}
            <br />
            {[defaultShipping.postalCode, defaultShipping.city].filter(Boolean).join(' ')}
            <br />
            {defaultShipping.country}
          </address>
        ) : (
          <p className="mt-3 text-sm text-ink/50">No default address saved.</p>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          href="/account/orders"
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-ink-soft"
        >
          View orders
        </Link>
        <Link
          href="/wishlists"
          className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:border-violet"
        >
          My wishlist
        </Link>
      </div>
    </div>
  );
}
