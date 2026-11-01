import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { filterProducts, FilterOptions } from '../utils/logic';
import { Filter, SlidersHorizontal, SearchX, ArrowUpDown } from 'lucide-react';
import { CATEGORIES } from '../data/seedProducts';

interface ListPageProps {
  queryString: string;
}

export const ListPage: React.FC<ListPageProps> = ({ queryString }) => {
  const { products, openSheet } = useStore();
  const [visibleCount, setVisibleCount] = useState(8);

  // Parse query string parameters
  const params = useMemo(() => {
    return new URLSearchParams(queryString || '');
  }, [queryString]);

  const catParam = params.get('cat') || 'All';
  const queryParam = params.get('q') || '';
  const sortParam = (params.get('sort') || 'relevance') as any;
  const minPriceParam = params.get('min') ? Number(params.get('min')) : undefined;
  const maxPriceParam = params.get('max') ? Number(params.get('max')) : undefined;
  const ratingParam = params.get('rating') ? Number(params.get('rating')) : 0;
  const stockParam = params.get('stock') === '1';

  const [activeSort, setActiveSort] = useState(sortParam);
  const [minPrice, setMinPrice] = useState<number | undefined>(minPriceParam);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(maxPriceParam);
  const [minRating, setMinRating] = useState<number>(ratingParam);
  const [inStockOnly, setInStockOnly] = useState<boolean>(stockParam);

  const filterOpts: FilterOptions = {
    category: catParam,
    query: queryParam,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy: activeSort,
  };

  const filtered = useMemo(() => {
    return filterProducts(products, filterOpts);
  }, [products, catParam, queryParam, minPrice, maxPrice, minRating, inStockOnly, activeSort]);

  const displayedList = filtered.slice(0, visibleCount);

  const setCategory = (cat: string) => {
    params.set('cat', cat);
    window.location.hash = `#/list?${params.toString()}`;
  };

  const clearFilters = () => {
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setMinRating(0);
    setInStockOnly(false);
    setActiveSort('relevance');
    window.location.hash = '#/list';
  };

  const allCategoryPills = ['All', ...CATEGORIES];

  return (
    <div className="space-y-3 page-enter">
      {/* Category Chips Bar */}
      <div className="bg-white p-2.5 rounded-lg border border-[#e0e0e0] overflow-x-auto no-scrollbar shadow-xs">
        <div className="flex gap-2">
          {allCategoryPills.map((c) => {
            const isSelected = catParam.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[#fff4ee] text-[#f85606] border border-[#f85606]'
                    : 'bg-gray-100 text-[#757575] hover:bg-gray-200'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Bar with Sort and Filter */}
      <div className="bg-white p-3 rounded-lg border border-[#e0e0e0] flex items-center justify-between gap-2 shadow-xs text-xs">
        <div className="text-[#757575] truncate">
          <span className="font-bold text-[#212121]">{filtered.length}</span> results
          {queryParam && <span> for "{queryParam}"</span>}
          {catParam !== 'All' && <span> in {catParam}</span>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Select */}
          <div className="relative flex items-center">
            <select
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value as any)}
              className="bg-gray-50 border border-[#e0e0e0] rounded px-2 py-1 text-xs text-[#212121] font-medium focus:outline-none focus:border-[#f85606]"
            >
              <option value="relevance">Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>

          {/* Filter Sheet Trigger */}
          <button
            type="button"
            onClick={() => {
              openSheet('filter', {
                minPrice,
                maxPrice,
                minRating,
                inStockOnly,
                onApply: (res: any) => {
                  setMinPrice(res.minPrice);
                  setMaxPrice(res.maxPrice);
                  setMinRating(res.minRating);
                  setInStockOnly(res.inStockOnly);
                },
              });
            }}
            className={`border rounded px-2.5 py-1 text-xs font-semibold flex items-center gap-1 transition-colors ${
              minPrice || maxPrice || minRating > 0 || inStockOnly
                ? 'bg-[#fff4ee] border-[#f85606] text-[#f85606]'
                : 'border-[#e0e0e0] text-[#212121] hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {displayedList.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="mt-4 flex justify-center pb-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="bg-white border border-[#f85606] text-[#f85606] hover:bg-[#fff7f2] font-semibold text-sm px-6 py-2.5 rounded shadow-xs active:scale-95 transition-all"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg p-10 text-center border border-[#e0e0e0] my-4">
          <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-base text-[#212121] mb-1">No products found</h3>
          <p className="text-xs text-[#757575] max-w-sm mx-auto mb-4">
            We couldn't find any items matching your current filters or query. Try refining your keywords.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="bg-[#f85606] text-white text-xs font-semibold px-4 py-2 rounded shadow-xs hover:bg-[#d94a04] transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
