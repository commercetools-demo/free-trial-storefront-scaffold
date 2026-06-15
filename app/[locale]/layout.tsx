import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import { routing } from '@/i18n/routing';
import { getSession, getLocale } from '@/lib/session';
import { getCart } from '@/lib/ct/cart';
import { getCategoryTree } from '@/lib/ct/categories';
import { mapCart } from '@/lib/mappers/cart';
import Providers from '@/context/Providers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MiniCart from '@/components/cart/MiniCart';
import type { Cart, Category } from '@/lib/types';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'LUMINA — Fashion that glows', template: '%s · LUMINA' },
  description: 'Bold, vibrant fashion. Discover the LUMINA collection.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const session = await getSession();
  const localeInfo = await getLocale();

  const [messages, categoryTree, initialCart] = await Promise.all([
    getMessages(),
    getCategoryTree(localeInfo.locale).catch(() => [] as Category[]),
    session.cartId
      ? getCart(session.cartId)
          .then((c) => (c.cartState === 'Active' ? mapCart(c, localeInfo.locale) : null))
          .catch(() => null)
      : Promise.resolve<Cart | null>(null),
  ]);

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-full flex flex-col bg-white text-ink">
        <Providers
          localeValue={localeInfo}
          messages={messages as Record<string, unknown>}
          initialCart={initialCart}
        >
          <Header categoryTree={categoryTree} />
          <main className="flex-1">{children}</main>
          <Footer categoryTree={categoryTree} />
          <MiniCart />
        </Providers>
      </body>
    </html>
  );
}
