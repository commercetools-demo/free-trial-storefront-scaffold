import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui';

export function ProductGrid({ products, locale }: { products: Product[]; locale: string }) {
  if (products.length === 0) {
    return <EmptyState title="No products found" description="Try adjusting your filters or search terms." />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} locale={locale} />
      ))}
    </div>
  );
}
