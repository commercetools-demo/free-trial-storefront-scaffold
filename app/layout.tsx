import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'My Brand', template: '%s · My Brand' },
  description: 'My Brand — a commercetools demo storefront.',
};

// Passthrough root layout; <html>/<body> live in app/[locale]/layout.tsx (next-intl pattern).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
