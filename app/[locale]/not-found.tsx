import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-32 text-center">
      <h1 className="text-3xl font-semibold text-charcoal">{t('title')}</h1>
      <p className="text-charcoal-light">{t('text')}</p>
      <Link href="/" className="rounded-sm bg-charcoal px-6 py-3 text-sm font-medium text-cream hover:bg-charcoal-light">
        {t('back')}
      </Link>
    </div>
  );
}
