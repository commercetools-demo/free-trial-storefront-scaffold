import { Link } from '@/i18n/routing';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-32 text-center">
      <p className="text-7xl font-black text-gradient">404</p>
      <h1 className="mt-4 text-3xl font-black tracking-tight">This page took a different path</h1>
      <p className="mt-2 text-ink/50">We couldn’t find what you were looking for.</p>
      <Link href="/" className="mt-8 inline-block">
        <Button variant="primary" size="lg">Back to home</Button>
      </Link>
    </div>
  );
}
