import React from 'react';
import { Heart, Plus, Star } from 'lucide-react';
import { Product } from '../types/store';
import { useStore } from '../context/StoreContext';
import { formatMoney, calcDiscount, generateSvgThumbnail } from '../utils/logic';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { wishlist, toggleWishlist, addToCart, showToast, settings } = useStore();
  const isWished = wishlist.includes(product.id);
  const discountPct = calcDiscount(product.price, product.oldPrice);
  const isSoldOut = product.stock <= 0;
  const isFreeDelivery = product.price >= settings.freeShip;

  const imgSrc = product.image || generateSvgThumbnail(product.emoji, product.color);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    if (product.options && product.options.length > 0) {
      showToast('Select an option');
      window.location.hash = `#/product/${product.id}`;
      return;
    }
    addToCart(product.id, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => {
        window.location.hash = `#/product/${product.id}`;
      }}
      className="group relative bg-white rounded-[4px] border border-[#e0e0e0] overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
    >
      {/* Thumbnail area */}
      <div className="relative w-full h-[170px] bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback to SVG if image url fails
            (e.target as HTMLImageElement).src = generateSvgThumbnail(product.emoji, product.color);
          }}
        />

        {/* Discount Badge */}
        {discountPct > 0 && (
          <div className="absolute top-0 left-0 bg-[#f85606] text-white text-[11px] font-bold px-2 py-0.5 rounded-br-lg shadow-xs z-10">
            -{discountPct}%
          </div>
        )}

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs text-gray-500 hover:scale-110 active:scale-95 transition-all z-10"
          aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${
              isWished ? 'fill-[#e91e63] text-[#e91e63]' : 'text-gray-600'
            }`}
          />
        </button>

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-black/75 text-white font-bold text-xs uppercase px-2.5 py-1 rounded">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title 2-line clamp */}
          <h3 className="text-[13px] leading-[18px] h-[36px] line-clamp-2 text-[#212121] font-normal group-hover:text-[#f85606] transition-colors mb-1">
            {product.name}
          </h3>

          {/* Pricing */}
          <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
            <span className="text-[16px] font-bold text-[#f85606]">
              {formatMoney(product.price)}
            </span>
            {product.oldPrice > product.price && (
              <span className="text-[11px] text-[#757575] line-through">
                {formatMoney(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Rating & reviews */}
          <div className="flex items-center gap-1 text-[11px] text-[#757575] mb-1.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              <span className="ml-0.5 font-medium text-[#212121]">{product.rating}</span>
            </div>
            <span>({product.reviewCount})</span>
          </div>

          {/* Free delivery tag */}
          {isFreeDelivery && (
            <div className="inline-block border border-[#f85606] text-[#f85606] text-[10px] font-medium px-1 rounded-xs">
              Free Delivery
            </div>
          )}
        </div>

        {/* Quick Add Button */}
        {!isSoldOut && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-[30px] h-[30px] rounded-full bg-[#f85606] hover:bg-[#d94a04] active:scale-90 text-white flex items-center justify-center shadow-xs transition-transform"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
