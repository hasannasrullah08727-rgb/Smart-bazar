import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Trash2, Heart, Plus, Minus, ShoppingBag, Tag, X } from 'lucide-react';
import { formatMoney, calcCoupon, generateSvgThumbnail } from '../utils/logic';

export const CartPage: React.FC = () => {
  const {
    cart,
    products,
    updateCartQty,
    removeFromCart,
    moveToWishlist,
    coupon,
    applyCoupon,
    removeCoupon,
    coupons,
    showToast,
  } = useStore();

  const [inputCoupon, setInputCoupon] = useState('');

  // Hydrate cart items with product info
  const itemsWithProduct = cart
    .map((item) => {
      const p = products.find((prod) => prod.id === item.id);
      return p ? { ...item, product: p } : null;
    })
    .filter(Boolean) as Array<typeof cart[0] & { product: typeof products[0] }>;

  const subtotal = itemsWithProduct.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const totalItemCount = itemsWithProduct.reduce((sum, item) => sum + item.qty, 0);

  const couponRes = calcCoupon(coupon, subtotal, coupons);
  const discountAmount = couponRes.valid ? couponRes.discount : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) {
      removeCoupon();
      return;
    }
    const ok = applyCoupon(inputCoupon.trim());
    if (ok) {
      setInputCoupon('');
    }
  };

  if (itemsWithProduct.length === 0) {
    return (
      <div className="bg-white rounded-lg p-10 text-center border border-[#e0e0e0] my-6 page-enter shadow-xs">
        <div className="w-16 h-16 bg-[#fff7f2] rounded-full flex items-center justify-center mx-auto mb-3 text-[#f85606]">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-[#212121] mb-1">Your cart is empty</h2>
        <p className="text-xs text-[#757575] max-w-xs mx-auto mb-5">
          Looks like you haven't added anything to your cart yet. Discover great bargains today!
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/';
          }}
          className="bg-[#f85606] hover:bg-[#d94a04] text-white font-bold text-xs px-6 py-2.5 rounded shadow-xs active:scale-95 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 page-enter pb-10">
      <div className="bg-white p-3.5 rounded-lg border border-[#e0e0e0] flex items-center justify-between shadow-xs">
        <h1 className="text-base font-bold text-[#212121]">Shopping Cart</h1>
        <span className="text-xs text-[#757575]">{totalItemCount} items</span>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-lg border border-[#e0e0e0] divide-y divide-[#e0e0e0] shadow-xs">
        {itemsWithProduct.map(({ id, qty, opt, product }) => {
          const imgSrc = product.image || generateSvgThumbnail(product.emoji, product.color);
          const lineTotal = product.price * qty;

          return (
            <div key={`${id}-${opt || ''}`} className="p-3.5 flex gap-3">
              {/* Thumbnail */}
              <div
                onClick={() => {
                  window.location.hash = `#/product/${product.id}`;
                }}
                className="w-20 h-20 bg-gray-50 rounded border border-[#e0e0e0] overflow-hidden shrink-0 cursor-pointer"
              >
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = generateSvgThumbnail(
                      product.emoji,
                      product.color
                    );
                  }}
                />
              </div>

              {/* Item info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => {
                      window.location.hash = `#/product/${product.id}`;
                    }}
                    className="text-xs font-medium text-[#212121] line-clamp-2 cursor-pointer hover:text-[#f85606] transition-colors"
                  >
                    {product.name}
                  </h3>

                  {opt && (
                    <div className="text-[11px] text-[#757575] mt-0.5">
                      Option: <span className="font-semibold text-[#212121]">{opt}</span>
                    </div>
                  )}

                  <div className="text-sm font-bold text-[#f85606] mt-1">
                    {formatMoney(product.price)}
                  </div>
                </div>

                {/* Actions & Stepper */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => moveToWishlist(product.id, opt)}
                      className="text-gray-500 hover:text-[#e91e63] transition-colors p-1"
                      aria-label="Move to wishlist"
                      title="Move to wishlist"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id, opt)}
                      className="text-gray-500 hover:text-[#d32f2f] transition-colors p-1"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center border border-[#e0e0e0] rounded overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateCartQty(product.id, opt, qty - 1)}
                      disabled={qty <= 1}
                      className="p-1 px-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 text-gray-700"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center font-bold text-xs text-[#212121]">{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(product.id, opt, qty + 1)}
                      disabled={qty >= product.stock}
                      className="p-1 px-2 bg-gray-50 hover:bg-gray-100 disabled:opacity-40 text-gray-700"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Block */}
      <div className="bg-white rounded-lg p-3.5 border border-[#e0e0e0] shadow-xs">
        <form onSubmit={handleApplyCoupon} className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-[#757575] absolute left-2.5 top-3" />
            <input
              type="text"
              placeholder="Enter coupon code"
              value={inputCoupon}
              onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
              className="w-full text-xs font-semibold pl-8 pr-2.5 py-2.5 border border-[#e0e0e0] rounded uppercase tracking-wider focus:border-[#f85606] outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-white border border-[#f85606] text-[#f85606] hover:bg-[#fff7f2] font-bold text-xs px-4 rounded transition-colors"
          >
            Apply
          </button>
        </form>

        {coupon && (
          <div className="mt-2.5 flex items-center justify-between text-xs bg-[#e8f5e9] text-[#2e7d32] px-3 py-1.5 rounded font-semibold">
            <span>Coupon {coupon} applied</span>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-gray-500 hover:text-black p-0.5"
              aria-label="Remove coupon"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-2.5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#757575] pb-1 border-b border-[#e0e0e0]">
          Order Summary
        </h3>

        <div className="flex justify-between text-xs text-[#212121]">
          <span>Subtotal ({totalItemCount} items)</span>
          <span className="font-semibold">{formatMoney(subtotal)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-xs text-[#2e7d32]">
            <span>Discount ({coupon})</span>
            <span className="font-semibold">-{formatMoney(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs text-[#757575]">
          <span>Delivery</span>
          <span className="italic">Calculated at checkout</span>
        </div>

        <div className="pt-2 border-t border-[#e0e0e0] flex justify-between items-baseline">
          <span className="font-bold text-sm text-[#212121]">Estimated Total</span>
          <span className="font-bold text-lg text-[#f85606]">
            {formatMoney(estimatedTotal)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/checkout';
          }}
          className="w-full bg-[#f85606] hover:bg-[#d94a04] active:scale-[0.99] text-white font-bold py-3 rounded text-sm transition-all shadow-xs mt-2"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};
