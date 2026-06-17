import { AccountGuard } from '@/components/auth/AccountGuard';

export default function WishlistsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountGuard>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </AccountGuard>
  );
}
