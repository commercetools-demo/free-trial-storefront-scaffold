'use client';

import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from '@/context/LocaleContext';
import { COUNTRY_CONFIG } from '@/lib/utils';
import { ChevronDown } from '@/components/ui/icons';

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocale();
  const [isPending, startTransition] = useTransition();

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    // Update server session (country + currency) then switch the URL locale.
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    });
    startTransition(() => {
      router.replace(pathname, { locale: next });
      router.refresh();
    });
  }

  const current = COUNTRY_CONFIG[locale] ?? COUNTRY_CONFIG['en-US'];

  return (
    <div className="relative inline-flex items-center">
      <span className="pointer-events-none absolute left-2.5 text-sm">{current.flag}</span>
      <select
        value={locale}
        onChange={onChange}
        disabled={isPending}
        aria-label="Select country"
        className="appearance-none rounded-full border border-border bg-white py-2 pl-8 pr-7 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet/40"
      >
        {Object.entries(COUNTRY_CONFIG).map(([key, cfg]) => (
          <option key={key} value={key}>
            {cfg.country} · {cfg.currency}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 opacity-50" />
    </div>
  );
}
