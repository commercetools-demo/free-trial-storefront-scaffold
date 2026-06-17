'use client';
import { useTranslations } from 'next-intl';
import { useAccount, useAuthActions } from '@/hooks/useAccount';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

export default function AccountProfilePage() {
  const t = useTranslations('account');
  const { user } = useAccount();
  const { logout } = useAuthActions();
  const router = useRouter();
  if (!user) return null;

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-sm border border-border p-6">
        <h2 className="mb-4 text-lg font-medium text-charcoal">{t('profile')}</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 text-charcoal-light">{t('name')}</dt>
            <dd className="text-charcoal">{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 text-charcoal-light">{t('email')}</dt>
            <dd className="text-charcoal">{user.email}</dd>
          </div>
        </dl>
      </section>

      {user.addresses && user.addresses.length > 0 && (
        <section className="rounded-sm border border-border p-6">
          <h2 className="mb-4 text-lg font-medium text-charcoal">{t('savedAddresses')}</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {user.addresses.map((a) => (
              <li key={a.id} className="rounded-sm bg-cream-dark p-4 text-sm text-charcoal">
                <p>{[a.firstName, a.lastName].filter(Boolean).join(' ')}</p>
                <p className="text-charcoal-light">
                  {[a.streetNumber, a.streetName].filter(Boolean).join(' ')}
                </p>
                <p className="text-charcoal-light">
                  {[a.city, a.region, a.postalCode].filter(Boolean).join(', ')}
                </p>
                <p className="text-charcoal-light">{a.country}</p>
                <div className="mt-1 flex gap-2 text-xs text-sage">
                  {a.id === user.defaultShippingAddressId && <span>{t('defaultShipping')}</span>}
                  {a.id === user.defaultBillingAddressId && <span>{t('defaultBilling')}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div>
        <Button variant="secondary" onClick={async () => { await logout(); router.push('/'); }}>
          {t('signOut')}
        </Button>
      </div>
    </div>
  );
}
