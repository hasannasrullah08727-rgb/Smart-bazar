import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { DISTRICTS } from '../data/seedProducts';
import {
  formatMoney,
  calcCoupon,
  calcShipping,
  isValidBdMobile,
  generateSvgThumbnail,
} from '../utils/logic';
import { Banknote, Smartphone, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { OrderItem } from '../types/store';

export const CheckoutPage: React.FC = () => {
  const {
    currentUser,
    cart,
    products,
    coupon,
    coupons,
    settings,
    placeOrder,
    orders,
    showToast,
  } = useStore();

  // If not logged in, redirect
  useEffect(() => {
    if (!currentUser) {
      showToast('Please login to checkout');
      window.location.hash = `#/login?next=${encodeURIComponent('#/checkout')}`;
    }
  }, [currentUser]);

  // Delivery form state (prefilled from profile)
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [district, setDistrict] = useState(currentUser?.district || 'Dhaka');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [note, setNote] = useState('');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'bKash' | 'Nagad' | 'Rocket'>(
    'Cash on Delivery'
  );
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user changed or loaded
  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name || '');
      if (!phone) setPhone(currentUser.phone || '');
      if (!district) setDistrict(currentUser.district || 'Dhaka');
      if (!address) setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  // Hydrate items
  const itemsWithProduct = cart
    .map((item) => {
      const p = products.find((prod) => prod.id === item.id);
      return p ? { ...item, product: p } : null;
    })
    .filter(Boolean) as Array<typeof cart[0] & { product: typeof products[0] }>;

  if (itemsWithProduct.length === 0) {
    return (
      <div className="bg-white rounded-lg p-10 text-center border border-[#e0e0e0] my-6 page-enter shadow-xs">
        <h2 className="text-base font-bold text-[#212121] mb-2">No items to checkout</h2>
        <p className="text-xs text-[#757575] mb-4">Please add items to your cart before proceeding.</p>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/';
          }}
          className="bg-[#f85606] text-white font-bold text-xs px-6 py-2 rounded shadow-xs"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const subtotal = itemsWithProduct.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );

  const couponRes = calcCoupon(coupon, subtotal, coupons);
  const discountAmount = couponRes.valid ? couponRes.discount : 0;
  const shippingFee = calcShipping(
    subtotal,
    discountAmount,
    district,
    couponRes.valid ? couponRes.type : undefined,
    settings
  );
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Enter your full name');
      return;
    }
    if (!isValidBdMobile(phone)) {
      showToast('Enter a valid Bangladeshi mobile number');
      return;
    }
    if (!address.trim()) {
      showToast('Enter your complete delivery address');
      return;
    }

    // Verify stock availability
    for (const item of itemsWithProduct) {
      if (item.qty > item.product.stock) {
        showToast(`${item.product.name}: only ${item.product.stock} left`);
        return;
      }
    }

    // Non-COD payment validation
    if (paymentMethod !== 'Cash on Delivery') {
      if (!isValidBdMobile(senderNumber)) {
        showToast(`Enter your ${paymentMethod} number`);
        return;
      }
      const upperTrx = trxId.trim().toUpperCase();
      if (!upperTrx || upperTrx.length < 6) {
        showToast('Transaction ID must be at least 6 characters');
        return;
      }

      // Check if trxId was already used
      const isUsed = orders.some(
        (o) => o.pay.trx && o.pay.trx.toUpperCase() === upperTrx
      );
      if (isUsed) {
        showToast('This transaction ID was already used');
        return;
      }
    }

    setIsSubmitting(true);

    const orderItems: OrderItem[] = itemsWithProduct.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      qty: item.qty,
      opt: item.opt,
      emoji: item.product.emoji,
      color: item.product.color,
    }));

    setTimeout(() => {
      const order = placeOrder({
        uid: currentUser?.id || 'guest',
        items: orderItems,
        ship: {
          name: name.trim(),
          phone: phone.trim(),
          district,
          address: address.trim(),
          note: note.trim() || undefined,
        },
        pay: {
          method: paymentMethod,
          trx: paymentMethod !== 'Cash on Delivery' ? trxId.trim().toUpperCase() : undefined,
          sender: paymentMethod !== 'Cash on Delivery' ? senderNumber.trim() : undefined,
          status:
            paymentMethod === 'Cash on Delivery'
              ? 'Unpaid (COD)'
              : 'Verification pending',
        },
        sub: subtotal,
        disc: discountAmount,
        coupon: coupon || undefined,
        ship_fee: shippingFee,
        total: totalAmount,
      });

      setIsSubmitting(false);
      window.location.hash = `#/order/${order.id}?new=1`;
    }, 400);
  };

  return (
    <div className="space-y-4 page-enter pb-16">
      <div className="bg-white p-3.5 rounded-lg border border-[#e0e0e0] shadow-xs">
        <h1 className="text-base font-bold text-[#212121]">Checkout</h1>
        <p className="text-xs text-[#757575]">Complete your delivery & payment details</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        {/* Delivery Details Card */}
        <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#757575] pb-1 border-b border-[#e0e0e0]">
            <MapPin className="w-4 h-4 text-[#f85606]" />
            <span>Delivery Information</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#212121] block mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hasan Nasrullah"
              className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#212121] block mb-1">
              Mobile Number (11 digits) *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#212121] block mb-1">
              District *
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none bg-white font-medium"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} {d === 'Dhaka' || d === 'Gazipur' || d === 'Narayanganj' ? '(৳60 delivery)' : '(৳110 delivery)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#212121] block mb-1">
              Full Address *
            </label>
            <textarea
              required
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House, road, area, thana"
              className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2.5 focus:border-[#f85606] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#757575] block mb-1">
              Order Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Call before delivery"
              className="w-full text-sm border border-[#e0e0e0] rounded-lg p-2 focus:border-[#f85606] outline-none"
            />
          </div>
        </div>

        {/* Payment Methods Card */}
        <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#757575] pb-1 border-b border-[#e0e0e0]">
            <Banknote className="w-4 h-4 text-[#f85606]" />
            <span>Select Payment Method</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Cash on delivery */}
            <label
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'Cash on Delivery'
                  ? 'border-[#f85606] bg-[#fff7f2]'
                  : 'border-[#e0e0e0] hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === 'Cash on Delivery'}
                onChange={() => setPaymentMethod('Cash on Delivery')}
                className="text-[#f85606] focus:ring-[#f85606]"
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-[#212121]">Cash on Delivery</div>
                <div className="text-[11px] text-[#757575]">Pay cash when product arrives</div>
              </div>
            </label>

            {/* bKash */}
            <label
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'bKash'
                  ? 'border-[#f85606] bg-[#fff7f2]'
                  : 'border-[#e0e0e0] hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === 'bKash'}
                onChange={() => setPaymentMethod('bKash')}
                className="text-[#f85606] focus:ring-[#f85606]"
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-[#e2136e]">bKash</div>
                <div className="text-[11px] text-[#757575]">Personal Send Money</div>
              </div>
            </label>

            {/* Nagad */}
            <label
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'Nagad'
                  ? 'border-[#f85606] bg-[#fff7f2]'
                  : 'border-[#e0e0e0] hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === 'Nagad'}
                onChange={() => setPaymentMethod('Nagad')}
                className="text-[#f85606] focus:ring-[#f85606]"
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-[#f7941d]">Nagad</div>
                <div className="text-[11px] text-[#757575]">Personal Send Money</div>
              </div>
            </label>

            {/* Rocket */}
            <label
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'Rocket'
                  ? 'border-[#f85606] bg-[#fff7f2]'
                  : 'border-[#e0e0e0] hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === 'Rocket'}
                onChange={() => setPaymentMethod('Rocket')}
                className="text-[#f85606] focus:ring-[#f85606]"
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-[#8c3494]">Rocket</div>
                <div className="text-[11px] text-[#757575]">Personal Send Money</div>
              </div>
            </label>
          </div>

          {/* Non-COD Instructions and Inputs */}
          {paymentMethod !== 'Cash on Delivery' && (
            <div className="mt-3 p-3.5 bg-[#fff7f2] border border-[#f85606]/30 rounded-lg space-y-3">
              <div className="text-xs text-[#212121] leading-relaxed">
                Send <span className="font-bold text-[#f85606]">{formatMoney(totalAmount)}</span>{' '}
                via <span className="font-bold">{paymentMethod}</span> (Send Money) to{' '}
                <span className="font-bold text-[#212121] bg-white px-1.5 py-0.5 rounded border border-[#e0e0e0]">
                  {settings.payNumber}
                </span>
                , then enter your details below:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#757575] block mb-1">
                    Your {paymentMethod} Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    className="w-full text-xs font-semibold border border-[#e0e0e0] rounded p-2 focus:border-[#f85606] outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#757575] block mb-1">
                    Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9J47AB81KL"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                    className="w-full text-xs font-mono font-bold uppercase border border-[#e0e0e0] rounded p-2 focus:border-[#f85606] outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-2.5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#757575] pb-1 border-b border-[#e0e0e0]">
            Review Order
          </h3>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {itemsWithProduct.map(({ id, qty, opt, product }) => (
              <div key={`${id}-${opt || ''}`} className="py-1.5 flex justify-between text-xs">
                <div className="truncate pr-2">
                  <span className="font-medium text-[#212121]">{product.name}</span>
                  {opt && <span className="text-[#757575] ml-1">({opt})</span>}
                  <span className="text-[#757575] ml-1">× {qty}</span>
                </div>
                <span className="font-semibold text-[#212121] shrink-0">
                  {formatMoney(product.price * qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#e0e0e0] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#212121]">
              <span>Subtotal</span>
              <span className="font-semibold">{formatMoney(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-[#2e7d32]">
                <span>Discount ({coupon})</span>
                <span className="font-semibold">-{formatMoney(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-[#212121]">
              <span>Delivery Fee ({district})</span>
              <span className="font-semibold">
                {shippingFee === 0 ? (
                  <span className="text-[#2e7d32] uppercase font-bold">Free</span>
                ) : (
                  formatMoney(shippingFee)
                )}
              </span>
            </div>

            <div className="pt-2 border-t border-[#e0e0e0] flex justify-between items-baseline">
              <span className="font-bold text-sm text-[#212121]">Total Amount</span>
              <span className="font-bold text-lg text-[#f85606]">
                {formatMoney(totalAmount)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#f85606] hover:bg-[#d94a04] active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3 rounded text-sm transition-all shadow-xs mt-3 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Placing Order...' : 'Place Order'}
          </button>

          <p className="text-[11px] text-[#757575] text-center pt-1">
            By placing order, you agree to Smart Bazar's terms and refund policy.
          </p>
        </div>
      </form>
    </div>
  );
};
