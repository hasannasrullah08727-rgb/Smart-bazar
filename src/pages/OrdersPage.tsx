import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, PackageCheck, Package, Clock, ChevronRight } from 'lucide-react';
import { formatMoney, formatDate, generateSvgThumbnail } from '../utils/logic';

export const OrdersPage: React.FC = () => {
  const { orders, currentUser, showToast } = useStore();
  const [filter, setFilter] = useState<'All' | 'Active' | 'Delivered' | 'Cancelled'>('All');
  const [searchId, setSearchId] = useState('');

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-[#e0e0e0] my-6 page-enter shadow-xs">
        <PackageCheck className="w-12 h-12 text-[#f85606] mx-auto mb-3" />
        <h2 className="text-base font-bold text-[#212121] mb-1">Login to view orders</h2>
        <p className="text-xs text-[#757575] mb-4">
          Please login or register to track your shipments and purchase history.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/login?next=%23%2Forders';
          }}
          className="bg-[#f85606] hover:bg-[#d94a04] text-white font-bold text-xs px-6 py-2.5 rounded shadow-xs"
        >
          Login / Register
        </button>
      </div>
    );
  }

  // Filter orders by owner
  const myOrders = orders.filter((o) => o.uid === currentUser.id);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchId.trim().toUpperCase();
    if (!trimmed) return;
    const found = orders.find((o) => o.id.toUpperCase() === trimmed);
    if (found) {
      window.location.hash = `#/order/${found.id}`;
    } else {
      showToast('Order not found. Check the ID and try again.');
    }
  };

  const filteredOrders = myOrders.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Delivered') return o.status === 'Delivered';
    if (filter === 'Cancelled') return o.status === 'Cancelled';
    if (filter === 'Active') return o.status !== 'Delivered' && o.status !== 'Cancelled';
    return true;
  });

  return (
    <div className="space-y-3 page-enter pb-16">
      <div className="bg-white p-3.5 rounded-lg border border-[#e0e0e0] shadow-xs">
        <h1 className="text-base font-bold text-[#212121]">My Orders</h1>
        <p className="text-xs text-[#757575]">Track past purchases and live shipment statuses</p>
      </div>

      {/* Track by order ID search bar */}
      <form
        onSubmit={handleTrackSubmit}
        className="bg-white p-3 rounded-lg border border-[#e0e0e0] flex gap-2 shadow-xs"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#757575] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Track by Order ID (e.g. AS1A2B3C99)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            className="w-full text-xs font-mono pl-9 pr-3 py-2 border border-[#e0e0e0] rounded focus:border-[#f85606] outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-[#f85606] hover:bg-[#d94a04] text-white font-bold text-xs px-4 rounded shadow-xs"
        >
          Track
        </button>
      </form>

      {/* Filter Chips */}
      <div className="bg-white p-2 rounded-lg border border-[#e0e0e0] flex gap-2 shadow-xs">
        {(['All', 'Active', 'Delivered', 'Cancelled'] as const).map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setFilter(chip)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
              filter === chip
                ? 'bg-[#fff4ee] text-[#f85606] border border-[#f85606]'
                : 'bg-gray-50 text-[#757575] hover:bg-gray-100'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => {
                window.location.hash = `#/order/${order.id}`;
              }}
              className="bg-white rounded-lg p-3.5 border border-[#e0e0e0] hover:border-[#f85606] shadow-xs cursor-pointer transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-[#212121]">#{order.id}</span>
                  <div className="text-[11px] text-[#757575]">
                    {formatDate(order.t)} · {order.items.length} items
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    order.status === 'Cancelled'
                      ? 'bg-[#ffebee] text-[#d32f2f]'
                      : order.status === 'Delivered'
                      ? 'bg-[#e8f5e9] text-[#2e7d32]'
                      : 'bg-[#fff3e0] text-[#e65100]'
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Thumbnails */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {order.items.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded border border-[#e0e0e0] bg-gray-50 overflow-hidden shrink-0"
                  >
                    <img
                      src={generateSvgThumbnail(item.emoji, item.color)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {order.items.length > 4 && (
                  <div className="w-12 h-12 rounded border border-[#e0e0e0] bg-gray-100 flex items-center justify-center text-xs text-[#757575] font-bold shrink-0">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#e0e0e0] flex items-center justify-between text-xs">
                <span className="text-[#757575]">{order.pay.method}</span>
                <div className="flex items-center gap-1 font-bold text-sm text-[#f85606]">
                  <span>{formatMoney(order.total)}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-10 text-center border border-[#e0e0e0] my-4 shadow-xs">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-[#212121]">No orders found</h3>
          <p className="text-xs text-[#757575] mt-1 mb-4">
            You don't have any orders matching "{filter}".
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#/';
            }}
            className="bg-[#f85606] text-white font-semibold text-xs px-4 py-2 rounded shadow-xs"
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};
