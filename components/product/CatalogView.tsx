'use client';

import { useState } from 'react';
import Drawer from '@/components/ui/Drawer';
import ProductGrid from './ProductGrid';
import FacetPanel from './FacetPanel';
import SortSelect from './SortSelect';
import Pagination from './Pagination';
import type { ProductSearchResponse } from '@/lib/types';

export default function CatalogView({ result }: { result: ProductSearchResponse }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { products, facets, total, limit, offset } = result;

  return (
    <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <FacetPanel facets={facets} />
      </aside>

      <div>
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-sm text-ink/60">
            <span className="font-bold text-ink">{total}</span> {total === 1 ? 'item' : 'items'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold lg:hidden hover:border-violet"
            >
              Filters
            </button>
            <SortSelect />
          </div>
        </div>

        <ProductGrid products={products} />
        <Pagination total={total} limit={limit} offset={offset} />
      </div>

      {/* Mobile filter drawer */}
      <Drawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        position="left"
        footer={
          <button
            onClick={() => setFiltersOpen(false)}
            className="w-full rounded-full bg-aurora py-3 text-sm font-semibold text-white"
          >
            Show {total} results
          </button>
        }
      >
        <FacetPanel facets={facets} />
      </Drawer>
    </div>
  );
}
