'use client';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { COUNTRY_CONFIG } from '@/lib/utils';

export function CountrySwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('common');

  async function onChange(next: string) {
    // Update the session country/currency (drives pricing), then switch the URL locale prefix.
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    }).catch(() => {});
    router.replace(pathname, { locale: next });
    router.refresh();
  }

  return (
    <label className="flex items-center gap-1 text-xs text-charcoal-light">
      <span className="sr-only">{t('countryCurrency')}</span>
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-charcoal focus:outline-none cursor-pointer"
      >
        {Object.entries(COUNTRY_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>
            {cfg.label} ({cfg.currency})
          </option>
        ))}
      </select>
    </label>
  );
}
