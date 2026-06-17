'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/hooks/useWishlist';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function WishlistsPage() {
  const t = useTranslations('wishlist');
  const { wishlists, isLoading, createList, deleteList } = useWishlist();
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      await createList(name.trim());
      setName('');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-charcoal">{t('title')}</h1>
        <form onSubmit={onCreate} className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('newName')}
            className="border border-border bg-cream px-3 py-2 text-sm rounded-sm focus:outline-none focus:ring-1 focus:ring-charcoal"
          />
          <Button type="submit" variant="secondary" disabled={!name.trim() || creating}>
            {creating && <Spinner />} {t('create')}
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="flex py-12"><Spinner className="h-6 w-6 text-charcoal" /></div>
      ) : wishlists.length === 0 ? (
        <div className="rounded-sm border border-border p-8 text-center text-charcoal-light">
          {t('none')}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlists.map((w) => (
            <li key={w.id} className="rounded-sm border border-border p-4">
              <div className="mb-3 flex items-start justify-between">
                <Link href={`/wishlists/${w.id}`} className="text-lg font-medium text-charcoal hover:text-terra">
                  {w.name}
                </Link>
                <button
                  onClick={() => deleteList(w.id)}
                  className="text-xs text-charcoal-light hover:text-terra"
                  aria-label={t('deleteWishlist')}
                >
                  {t('delete')}
                </button>
              </div>
              <p className="mb-3 text-sm text-charcoal-light">{t('itemCount', { count: w.lineItems.length })}</p>
              <div className="flex gap-2">
                {w.lineItems.slice(0, 4).map((li) => (
                  <div key={li.lineItemId} className="relative h-16 w-14 overflow-hidden rounded-sm bg-cream-dark">
                    {li.image && <Image src={li.image} alt={li.name} fill sizes="56px" className="object-cover" />}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
