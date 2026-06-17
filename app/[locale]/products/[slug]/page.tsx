import { notFound } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getProductBySlug } from '@/lib/ct/products';
import { ProductDetail } from '@/components/product/ProductDetail';
import { Link } from '@/i18n/routing';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const session = await getSession();
  const product = await getProductBySlug(slug, session);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-sm text-charcoal-light">
        <Link href="/products" className="hover:text-charcoal">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>
      <ProductDetail product={product} locale={locale} />
    </div>
  );
}
