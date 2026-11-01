import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, openSheet } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-[#e0e0e0] mt-8 pt-8 pb-16 text-[#757575] text-xs noprint">
      <div className="max-w-[900px] mx-auto px-4">
        {/* Value props */}
        <div className="grid grid-cols-3 gap-2 pb-6 border-b border-[#e0e0e0] text-center">
          <div className="flex flex-col items-center">
            <Truck className="w-5 h-5 text-[#f85606] mb-1" />
            <span className="font-semibold text-[#212121]">Fast Delivery</span>
            <span className="text-[11px] text-[#757575]">Nationwide shipping</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="w-5 h-5 text-[#f85606] mb-1" />
            <span className="font-semibold text-[#212121]">100% Genuine</span>
            <span className="text-[11px] text-[#757575]">Quality guaranteed</span>
          </div>
          <div className="flex flex-col items-center">
            <RefreshCw className="w-5 h-5 text-[#f85606] mb-1" />
            <span className="font-semibold text-[#212121]">7 Days Return</span>
            <span className="text-[11px] text-[#757575]">Easy refund policy</span>
          </div>
        </div>

        {/* Brand and columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-[#e0e0e0]">
          <div>
            <div className="flex items-center gap-1.5 text-base font-bold text-[#f85606] mb-2">
              <span>🛍️</span>
              <span>Smart Bazar</span>
            </div>
            <p className="text-[12px] leading-relaxed text-[#757575]">
              Quality products, honest prices and fast delivery across Bangladesh.
            </p>
            <div className="mt-3 text-[12px]">
              <span className="font-medium text-[#212121]">Hotline: </span>
              <a href={`tel:${settings.phone}`} className="text-[#f85606] hover:underline">
                {settings.phone}
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#212121] uppercase text-[11px] tracking-wider mb-2.5">
              Shop
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a href="#/" className="hover:text-[#f85606] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#/explore" className="hover:text-[#f85606] transition-colors">
                  All Categories
                </a>
              </li>
              <li>
                <a href="#/list?cat=Offers" className="hover:text-[#f85606] transition-colors">
                  Mega Offers & Discounts
                </a>
              </li>
              <li>
                <a href="#/list?cat=Gadgets" className="hover:text-[#f85606] transition-colors">
                  Gadgets & Electronics
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#212121] uppercase text-[11px] tracking-wider mb-2.5">
              Support
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a href="#/orders" className="hover:text-[#f85606] transition-colors">
                  Track Order
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openSheet('help')}
                  className="hover:text-[#f85606] transition-colors text-left"
                >
                  Help & Contact Us
                </button>
              </li>
              <li>
                <a href="#/account" className="hover:text-[#f85606] transition-colors">
                  My Account
                </a>
              </li>
              <li>
                <a href="/DinStore.html" target="_blank" rel="noreferrer" className="text-[#f85606] hover:underline">
                  Standalone Offline File (DinStore.html)
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-[11px] font-medium text-[#212121] mr-1">Payment:</span>
            <span className="px-2 py-0.5 bg-[#f5f5f5] border border-[#e0e0e0] rounded text-[11px] font-medium text-[#212121]">
              Cash on Delivery
            </span>
            <span className="px-2 py-0.5 bg-[#f5f5f5] border border-[#e0e0e0] rounded text-[11px] font-semibold text-[#e2136e]">
              bKash
            </span>
            <span className="px-2 py-0.5 bg-[#f5f5f5] border border-[#e0e0e0] rounded text-[11px] font-semibold text-[#f7941d]">
              Nagad
            </span>
            <span className="px-2 py-0.5 bg-[#f5f5f5] border border-[#e0e0e0] rounded text-[11px] font-semibold text-[#8c3494]">
              Rocket
            </span>
          </div>
          <div className="text-[11px] text-[#757575]">
            © {year} Smart Bazar. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
