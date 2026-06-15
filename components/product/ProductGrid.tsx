import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border py-24 text-center">
        <p className="text-lg font-semibold text-ink">Nothing here yet</p>
        <p className="mt-1 text-sm text-ink/50">Try adjusting your filters or search.</p>
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
