import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <section className="rounded-2xl border border-border bg-white px-8 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-charcoal sm:text-4xl">
          B2B Storefront
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-charcoal-light">
          Browse your catalog with business-unit pricing, manage carts and quotes, run approval
          workflows, and place orders — all backed by commercetools.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/products">
            <Button size="lg">Browse products</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              Go to dashboard
            </Button>
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Business unit pricing', body: 'Negotiated, store-scoped prices for every associate.' },
          { title: 'Quotes & approvals', body: 'Request quotes and route orders through approval rules.' },
          { title: 'Purchase lists', body: 'Save frequent orders and add them to the cart in one click.' },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-base font-medium text-charcoal">{f.title}</h2>
            <p className="mt-1 text-sm text-charcoal-light">{f.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
