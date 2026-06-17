import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { getSession } from '@/lib/session';
import { getCart } from '@/lib/ct/cart';
import { Providers } from '@/context/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import type { Cart } from '@/lib/types';
import type { AccountUser } from '@/hooks/useAccount';

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
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [messages, session] = await Promise.all([getMessages(), getSession()]);

  let initialCart: Cart | null = null;
  if (session.cartId && session.customerId && session.businessUnitKey) {
    try {
      initialCart = await getCart(session.cartId, session.customerId, session.businessUnitKey, session.locale);
    } catch {
      initialCart = null;
    }
  }
  const initialUser: AccountUser | null = session.customerId
    ? {
        id: session.customerId,
        email: session.customerEmail,
        firstName: session.customerFirstName,
        lastName: session.customerLastName,
      }
    : null;

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-full flex flex-col bg-cream text-charcoal">
        <NextIntlClientProvider messages={messages}>
          <Providers initialCart={initialCart} initialUser={initialUser}>
            <Header />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
