import { getTranslations } from 'next-intl/server';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

export async function ProductGrid({ products }: { products: Product[] }) {
  const t = await getTranslations('plp');
  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-charcoal-light">
        <p>{t('noProducts')}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
