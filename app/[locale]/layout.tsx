import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getSession, getLocale } from '@/lib/session';
import { getCategoryTree } from '@/lib/ct/categories';
import { getCart } from '@/lib/ct/cart';
import { mapCart } from '@/lib/mappers/cart';
import type { Cart, Customer } from '@/lib/types';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MiniCart } from '@/components/cart/MiniCart';

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
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);

  const [session, messages, { locale: ctLocale }, categoryTree] = await Promise.all([
    getSession(),
    getMessages(),
    getLocale(),
    getCategoryTree(locale),
  ]);

  let initialCart: Cart | null = null;
  if (session.cartId) {
    try {
      const ct = await getCart(session.cartId);
      if (ct.cartState === 'Active') initialCart = mapCart(ct, ctLocale);
    } catch {
      /* stale cartId — SWR will clear it */
    }
  }

  const initialUser: Customer | null = session.customerId
    ? {
        id: session.customerId,
        email: session.customerEmail ?? '',
        firstName: session.customerFirstName,
        lastName: session.customerLastName,
      }
    : null;

  return (
    <html lang={locale} className="h-full">
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers initialCart={initialCart} initialUser={initialUser}>
            <Header categoryTree={categoryTree} />
            <main className="flex-1">{children}</main>
            <Footer />
            <MiniCart />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
