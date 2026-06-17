import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-charcoal">Page not found</h1>
      <p className="mt-2 text-charcoal-light">The page you are looking for does not exist.</p>
      <Link href="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
