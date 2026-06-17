'use client';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('error');
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="text-3xl font-semibold text-charcoal">{t('title')}</h1>
      <p className="text-charcoal-light">{t('text')}</p>
      <Button onClick={reset}>{t('retry')}</Button>
    </div>
  );
}
