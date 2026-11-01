import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import {
  Heart,
  Share2,
  Star,
  Truck,
  Gift,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { formatMoney, calcDiscount, formatDate, generateSvgThumbnail } from '../utils/logic';

interface ProductPageProps {
  productId: string;
}

export const ProductPage: React.FC<ProductPageProps> = ({ productId }) => {
  const {
    products,
    wishlist,
    toggleWishlist,
    addToCart,
    showToast,
    settings,
    currentUser,
    openSheet,
    reviews,
    trackRecentView,
  } = useStore();

  const product = products.find((p) => p.id === productId);

  // Track recent view
  useEffect(() => {
    if (productId) {
      trackRecentView(productId);
    }
  }, [productId]);

  const [selectedOpt, setSelectedOpt] = useState<string>('');
  const [qty, setQty] = useState(1);

  // Auto-select first option if options exist
  useEffect(() => {
    if (product && product.options && product.options.length > 0) {
      setSelectedOpt(product.options[0]);
    } else {
      setSelectedOpt('');
    }
    setQty(1);
  }, [product]);

  if (!product) {
    return (
      <div className="bg-white rounded-lg p-10 text-center border border-[#e0e0e0] my-8 page-enter">
        <h3 className="font-bold text-lg text-[#212121] mb-2">Product Not Found</h3>
        <p className="text-xs text-[#757575] mb-4">The item you are looking for is unavailable.</p>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/';
          }}
          className="bg-[#f85606] text-white font-semibold text-xs px-5 py-2.5 rounded shadow-xs"
        >
          Go Home
        </button>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const discount = calcDiscount(product.price, product.oldPrice);
  const isSoldOut = product.stock <= 0;
  const productReviews = reviews[product.id] || [];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on Smart Bazar!`,
          url,
        });
      } catch (err) {
        // User cancelled or fallback
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      showToast('Link copied');
    } else {
      showToast(url);
    }
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    if (product.options && product.options.length > 0 && !selectedOpt) {
      showToast('Please select an option');
      return;
    }
    addToCart(product.id, qty, selectedOpt);
  };

  const handleBuyNow = () => {
    if (isSoldOut) return;
    if (product.options && product.options.length > 0 && !selectedOpt) {
      showToast('Please select an option');
      return;
    }
    const success = addToCart(product.id, qty, selectedOpt);
    if (success) {
      window.location.hash = '#/checkout';
    }
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const imgSrc = product.image || generateSvgThumbnail(product.emoji, product.color);

  return (
    <div className="space-y-3 pb-24 page-enter">
      {/* Product Image & Main Details */}
      <div className="bg-white rounded-lg border border-[#e0e0e0] overflow-hidden shadow-xs">
        {/* Full image */}
        <div className="relative w-full max-w-[420px] mx-auto aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={imgSrc}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generateSvgThumbnail(product.emoji, product.color);
            }}
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-[#f85606] text-white text-xs font-bold px-2 py-0.5 rounded shadow-xs">
              -{discount}%
            </div>
          )}
        </div>

        {/* Pricing and Action row */}
        <div className="p-4 border-t border-[#e0e0e0]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-[#f85606]">
                {formatMoney(product.price)}
              </span>
              {product.oldPrice > product.price && (
                <span className="text-sm text-[#757575] line-through">
                  {formatMoney(product.oldPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-[#f85606] rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Share product"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className="p-2 text-gray-600 hover:text-[#e91e63] rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Wishlist"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWished ? 'fill-[#e91e63] text-[#e91e63]' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          <h1 className="text-base font-medium text-[#212121] leading-snug mb-2">
            {product.name}
          </h1>

          {/* Rating, Brand, Stock */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#757575] pb-2">
            <div className="flex items-center gap-1">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                <span className="font-semibold text-[#212121] ml-1">{product.rating.toFixed(1)}</span>
              </div>
              <span>({product.reviewCount} ratings)</span>
            </div>

            <div>
              <span>Brand: </span>
              <span className="font-medium text-[#212121]">{product.brand}</span>
              <span className="mx-1.5">·</span>
              <span>Category: </span>
              <span className="font-medium text-[#212121]">{product.category}</span>
            </div>
          </div>

          {/* Stock Tag */}
          <div className="mt-2">
            {product.stock > 5 ? (
              <span className="inline-block bg-[#e8f5e9] text-[#2e7d32] text-xs font-semibold px-2.5 py-0.5 rounded">
                In stock ({product.stock} available)
              </span>
            ) : product.stock > 0 ? (
              <span className="inline-block bg-[#fff3e0] text-[#e65100] text-xs font-semibold px-2.5 py-0.5 rounded">
                Only {product.stock} left in stock - order soon
              </span>
            ) : (
              <span className="inline-block bg-[#ffebee] text-[#d32f2f] text-xs font-semibold px-2.5 py-0.5 rounded">
                Out of stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Select Option Card */}
      {product.options && product.options.length > 0 && (
        <div className="bg-white rounded-lg p-3.5 border border-[#e0e0e0] shadow-xs">
          <label className="text-xs font-semibold text-[#757575] uppercase tracking-wider block mb-2">
            Select Option / Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {product.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedOpt(opt)}
                className={`px-3 py-1.5 text-xs font-semibold rounded border transition-all ${
                  selectedOpt === opt
                    ? 'bg-[#fff4ee] border-[#f85606] text-[#f85606]'
                    : 'border-[#e0e0e0] text-[#212121] hover:bg-gray-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Stepper */}
      {!isSoldOut && (
        <div className="bg-white rounded-lg p-3.5 border border-[#e0e0e0] shadow-xs flex items-center justify-between">
          <span className="text-xs font-semibold text-[#757575] uppercase tracking-wider">
            Quantity
          </span>
          <div className="flex items-center border border-[#e0e0e0] rounded overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              disabled={qty <= 1}
              className="p-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 text-gray-700"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-bold text-sm text-[#212121]">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((prev) => Math.min(product.stock, prev + 1))}
              disabled={qty >= product.stock}
              className="p-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 text-gray-700"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Delivery Info Card */}
      <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#757575]">
          Delivery & Services
        </h3>
        <div className="flex items-start gap-2.5 text-xs text-[#212121]">
          <Truck className="w-4 h-4 text-[#f85606] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Dhaka area ৳{settings.nearFee}</span> ·{' '}
            <span className="font-semibold">Other districts ৳{settings.farFee}</span>
            <p className="text-[11px] text-[#757575]">Delivery within 24 to 72 hours</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#212121]">
          <Gift className="w-4 h-4 text-[#2e7d32] shrink-0" />
          <span>
            Free delivery on orders over <span className="font-bold">৳{settings.freeShip}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#212121]">
          <ShieldCheck className="w-4 h-4 text-[#1a535c] shrink-0" />
          <span>Cash on delivery available nationwide</span>
        </div>

        <div className="flex items-center gap-2.5 text-xs text-[#212121]">
          <RotateCcw className="w-4 h-4 text-[#7e57c2] shrink-0" />
          <span>7 days easy return for unused items</span>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#757575] mb-2">
          Product Description
        </h3>
        <p className="text-sm text-[#212121] leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Reviews Card */}
      <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[#212121]">
              Customer Reviews ({productReviews.length})
            </h3>
            <div className="flex items-center gap-1 text-xs text-amber-500 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span className="font-bold text-[#212121]">{product.rating.toFixed(1)}</span>
              <span className="text-[#757575]">out of 5</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                showToast('Please login to write a review');
                window.location.hash = `#/login?next=${encodeURIComponent(
                  `#/product/${product.id}`
                )}`;
                return;
              }
              openSheet('review', { productId: product.id });
            }}
            className="border border-[#f85606] text-[#f85606] hover:bg-[#fff7f2] font-semibold text-xs px-3 py-1.5 rounded transition-colors"
          >
            Write Review
          </button>
        </div>

        {productReviews.length > 0 ? (
          <div className="divide-y divide-[#e0e0e0]">
            {productReviews.map((rev) => (
              <div key={rev.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-[#212121]">{rev.userName}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.2 rounded font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#757575]">{formatDate(rev.date)}</span>
                </div>
                <div className="flex items-center text-amber-500 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#212121] leading-normal">{rev.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#757575] py-2">
            No reviews yet. Be the first to share your thoughts on this item!
          </p>
        )}
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="pt-2">
          <h2 className="text-sm font-bold text-[#212121] mb-2 px-1">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e0e0e0] shadow-lg p-2.5 bottom-bar noprint">
        <div className="max-w-[900px] mx-auto flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isSoldOut}
            className="flex-1 border-2 border-[#f85606] text-[#f85606] hover:bg-[#fff7f2] disabled:opacity-50 font-bold py-2.5 rounded text-sm flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isSoldOut}
            className="flex-1 bg-[#f85606] hover:bg-[#d94a04] text-white disabled:opacity-50 font-bold py-2.5 rounded text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
