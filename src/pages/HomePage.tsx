import React, { useState } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryShortcuts } from '../components/CategoryShortcuts';
import { VoucherStrip } from '../components/VoucherStrip';
import { FlashSale } from '../components/FlashSale';
import { ProductCard } from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import { Eye, ChevronRight } from 'lucide-react';
import { formatMoney, generateSvgThumbnail } from '../utils/logic';

export const HomePage: React.FC = () => {
  const { products, recentViews } = useStore();
  const [visibleCount, setVisibleCount] = useState(8);

  const recentlyViewedProducts = recentViews
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  const justForYouList = products.slice(0, visibleCount);

  return (
    <div className="space-y-4 page-enter">
      {/* Hero Banner Carousel */}
      <HeroCarousel />

      {/* Category Shortcut Row */}
      <CategoryShortcuts />

      {/* Voucher Strip */}
      <VoucherStrip />

      {/* Flash Sale Block */}
      <FlashSale />

      {/* Recently Viewed Block */}
      {recentlyViewedProducts.length > 0 && (
        <div className="bg-white rounded-lg p-3.5 border border-[#e0e0e0] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 font-bold text-[15px] text-[#212121]">
              <Eye className="w-4 h-4 text-[#f85606]" />
              <span>Recently Viewed</span>
            </div>
            <a
              href="#/explore"
              className="text-xs font-semibold text-[#f85606] flex items-center hover:underline"
            >
              See All <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </a>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {recentlyViewedProducts.slice(0, 8).map((p) => {
              if (!p) return null;
              const imgSrc = p.image || generateSvgThumbnail(p.emoji, p.color);
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    window.location.hash = `#/product/${p.id}`;
                  }}
                  className="w-[100px] shrink-0 cursor-pointer group flex flex-col"
                >
                  <div className="w-[100px] h-[100px] bg-gray-50 rounded border border-[#e0e0e0] overflow-hidden">
                    <img
                      src={imgSrc}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = generateSvgThumbnail(p.emoji, p.color);
                      }}
                    />
                  </div>
                  <div className="mt-1 text-center">
                    <div className="font-bold text-[12px] text-[#f85606] truncate">
                      {formatMoney(p.price)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Just For You Grid */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h2 className="text-base font-bold text-[#212121]">Just For You</h2>
          <span className="text-xs text-[#757575]">{products.length} Products</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {justForYouList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < products.length && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="bg-white border border-[#f85606] text-[#f85606] hover:bg-[#fff7f2] font-semibold text-sm px-6 py-2.5 rounded shadow-xs active:scale-95 transition-all"
            >
              Load More ({products.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
