import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'B2B Storefront',
  description: 'A commercetools B2B storefront',
};

// Root layout is a pass-through — the html/body tags and providers live in
// app/[locale]/layout.tsx so the lang attribute reflects the active locale.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
