import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  CheckCircle2,
  Printer,
  RotateCcw,
  Ban,
  Clock,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { formatMoney, formatDate, generateSvgThumbnail } from '../utils/logic';
import { OrderHistoryStep } from '../types/store';

interface OrderDetailPageProps {
  orderId: string;
  isNew?: boolean;
}

const TIMELINE_STEPS = [
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
] as const;

export const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId, isNew }) => {
  const { orders, currentUser, cancelOrder, reorder, showToast } = useStore();

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="bg-white rounded-lg p-10 text-center border border-[#e0e0e0] my-8 page-enter shadow-xs">
        <h3 className="font-bold text-base text-[#212121] mb-1">Order Not Found</h3>
        <p className="text-xs text-[#757575] mb-4">We could not locate this order.</p>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/orders';
          }}
          className="bg-[#f85606] text-white font-semibold text-xs px-5 py-2.5 rounded shadow-xs"
        >
          View All Orders
        </button>
      </div>
    );
  }

  const isCancelled = order.status === 'Cancelled';
  const canCancel = (order.status === 'Pending' || order.status === 'Confirmed') && !isCancelled;

  // Find index in timeline
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status as any);

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(order.id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 page-enter pb-16">
      {/* Success banner if new order */}
      {isNew && (
        <div className="bg-[#e8f5e9] border border-[#2e7d32]/30 rounded-lg p-4 text-center noprint animate-fade-in shadow-xs">
          <div className="w-12 h-12 bg-[#2e7d32] text-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#2e7d32]">Order Placed Successfully!</h2>
          <p className="text-xs text-[#2e7d32] mt-0.5">
            Thank you for shopping with Smart Bazar. We will verify and process your delivery shortly.
          </p>
        </div>
      )}

      {/* Printable Invoice Header (shown when printing) */}
      <div className="hidden print:block mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold text-[#f85606]">Smart Bazar</h1>
        <p className="text-sm text-gray-600">Official Customer Invoice</p>
        <p className="text-xs text-gray-500">Order ID: {order.id} | Date: {formatDate(order.t)}</p>
      </div>

      {/* Order Status & Header Card */}
      <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e0e0]">
          <div>
            <span className="text-xs text-[#757575]">Order ID: </span>
            <span className="font-mono font-bold text-sm text-[#212121]">#{order.id}</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isCancelled
                  ? 'bg-[#ffebee] text-[#d32f2f]'
                  : order.status === 'Delivered'
                  ? 'bg-[#e8f5e9] text-[#2e7d32]'
                  : 'bg-[#fff3e0] text-[#e65100]'
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="text-xs text-[#757575]">
          Placed on: <span className="font-medium text-[#212121]">{formatDate(order.t)}</span>
        </div>

        {/* Cancelled Alert or Timeline */}
        {isCancelled ? (
          <div className="bg-[#ffebee] border border-[#d32f2f]/30 rounded-lg p-3 flex items-center gap-2.5 text-xs text-[#d32f2f]">
            <Ban className="w-5 h-5 shrink-0" />
            <div>
              <span className="font-bold">This order was cancelled.</span>
              <p className="text-[11px] text-[#757575] mt-0.5">
                The items were restored to stock. If you need assistance, please contact support.
              </p>
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <h4 className="text-[11px] font-bold text-[#757575] uppercase tracking-wider mb-3">
              Delivery Timeline
            </h4>
            <div className="relative flex justify-between items-center text-center">
              {/* Timeline bar */}
              <div className="absolute top-3 left-4 right-4 h-0.5 bg-gray-200 -z-0" />

              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                const label = step === 'Out for Delivery' ? 'On the way' : step;

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center flex-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isPassed
                          ? 'bg-[#2e7d32] text-white ring-2 ring-[#e8f5e9]'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] mt-1.5 leading-tight ${
                        isCurrent
                          ? 'font-bold text-[#f85606]'
                          : isPassed
                          ? 'font-semibold text-[#212121]'
                          : 'text-[#757575]'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Items Card */}
      <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#757575] pb-1 border-b border-[#e0e0e0]">
          Ordered Items ({order.items.length})
        </h3>

        <div className="divide-y divide-[#e0e0e0]">
          {order.items.map((item, idx) => {
            const imgSrc = generateSvgThumbnail(item.emoji, item.color);

            return (
              <div key={idx} className="py-2.5 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 rounded border border-[#e0e0e0] overflow-hidden shrink-0">
                  <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={`#/product/${item.id}`}
                    className="text-xs font-medium text-[#212121] hover:text-[#f85606] transition-colors truncate block"
                  >
                    {item.name}
                  </a>
                  {item.opt && (
                    <div className="text-[11px] text-[#757575]">Option: {item.opt}</div>
                  )}
                  <div className="text-[11px] text-[#757575]">
                    {formatMoney(item.price)} × {item.qty}
                  </div>
                </div>
                <div className="text-xs font-bold text-[#212121] shrink-0">
                  {formatMoney(item.price * item.qty)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery & Payment Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Delivery Address */}
        <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#757575] pb-1 border-b border-[#e0e0e0]">
            <MapPin className="w-3.5 h-3.5 text-[#f85606]" />
            <span>Delivery Address</span>
          </div>
          <div className="font-bold text-sm text-[#212121]">{order.ship.name}</div>
          <div className="text-[#757575]">Mobile: {order.ship.phone}</div>
          <div className="text-[#212121]">District: {order.ship.district}</div>
          <div className="text-[#757575]">{order.ship.address}</div>
          {order.ship.note && (
            <div className="text-[#757575] italic pt-1">Note: "{order.ship.note}"</div>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#757575] pb-1 border-b border-[#e0e0e0]">
            <CreditCard className="w-3.5 h-3.5 text-[#f85606]" />
            <span>Payment Information</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-[#212121]">{order.pay.method}</span>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                order.pay.status.includes('Paid')
                  ? 'bg-[#e8f5e9] text-[#2e7d32]'
                  : 'bg-[#fff3e0] text-[#e65100]'
              }`}
            >
              {order.pay.status}
            </span>
          </div>
          {order.pay.sender && (
            <div className="text-[#757575]">From Number: {order.pay.sender}</div>
          )}
          {order.pay.trx && (
            <div className="font-mono text-[#757575]">TrxID: {order.pay.trx}</div>
          )}
        </div>
      </div>

      {/* Totals Breakdown */}
      <div className="bg-white rounded-lg p-4 border border-[#e0e0e0] shadow-xs space-y-2 text-xs">
        <h3 className="font-bold uppercase tracking-wider text-[#757575] pb-1 border-b border-[#e0e0e0]">
          Cost Breakdown
        </h3>
        <div className="flex justify-between text-[#212121]">
          <span>Subtotal</span>
          <span>{formatMoney(order.sub)}</span>
        </div>
        {order.disc > 0 && (
          <div className="flex justify-between text-[#2e7d32]">
            <span>Discount {order.coupon ? `(${order.coupon})` : ''}</span>
            <span>-{formatMoney(order.disc)}</span>
          </div>
        )}
        <div className="flex justify-between text-[#212121]">
          <span>Delivery Fee</span>
          <span>
            {order.ship_fee === 0 ? (
              <span className="text-[#2e7d32] font-semibold uppercase">Free</span>
            ) : (
              formatMoney(order.ship_fee)
            )}
          </span>
        </div>
        <div className="pt-2 border-t border-[#e0e0e0] flex justify-between items-baseline font-bold text-sm text-[#212121]">
          <span>Total Paid / Payable</span>
          <span className="text-base text-[#f85606]">{formatMoney(order.total)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 noprint">
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 bg-white border border-[#e0e0e0] hover:bg-gray-50 text-[#212121] font-semibold py-2.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4 text-[#757575]" />
          <span>Print Invoice</span>
        </button>

        <button
          type="button"
          onClick={() => reorder(order.id)}
          className="flex-1 bg-[#fff7f2] border border-[#f85606] text-[#f85606] hover:bg-[#ffebd8] font-semibold py-2.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <RotateCcw className="w-4 h-4 text-[#f85606]" />
          <span>Reorder Items</span>
        </button>

        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            className="w-full bg-white border border-[#d32f2f] text-[#d32f2f] hover:bg-red-50 font-semibold py-2.5 rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Ban className="w-4 h-4" />
            <span>Cancel Order</span>
          </button>
        )}
      </div>
    </div>
  );
};
