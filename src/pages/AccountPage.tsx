import React from 'react';
import { useStore } from '../context/StoreContext';
import {
  Package,
  Heart,
  UserCheck,
  KeyRound,
  HelpCircle,
  LogOut,
  ChevronRight,
  MapPin,
  Phone,
  FileCode,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { currentUser, orders, wishlist, logoutUser, openSheet } = useStore();

  if (!currentUser) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-[#e0e0e0] my-6 page-enter shadow-xs">
        <div className="w-14 h-14 bg-[#fff7f2] rounded-full flex items-center justify-center mx-auto mb-3 text-[#f85606] font-bold text-2xl">
          👤
        </div>
        <h2 className="text-base font-bold text-[#212121] mb-1">Welcome to Smart Bazar</h2>
        <p className="text-xs text-[#757575] max-w-xs mx-auto mb-5">
          Sign in to access your order history, saved addresses, and personal wishlist.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/login';
          }}
          className="bg-[#f85606] hover:bg-[#d94a04] text-white font-bold text-xs px-6 py-2.5 rounded shadow-xs"
        >
          Login / Register
        </button>
      </div>
    );
  }

  const myOrdersCount = orders.filter((o) => o.uid === currentUser.id).length;
  const initial = (currentUser.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="space-y-4 page-enter pb-16">
      {/* Orange Hero Profile Header */}
      <div className="bg-gradient-to-r from-[#f85606] to-[#ff7a2d] rounded-lg p-5 text-white shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-full bg-white text-[#f85606] font-bold text-2xl flex items-center justify-center shadow-md shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate drop-shadow-xs">{currentUser.name}</h2>
            <p className="text-xs opacity-90 truncate">{currentUser.phone || currentUser.login}</p>
            {currentUser.district && (
              <div className="flex items-center gap-1 text-[11px] opacity-80 mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{currentUser.district}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#/orders';
            }}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <div className="text-lg font-bold leading-tight">{myOrdersCount}</div>
            <div className="text-[11px] opacity-90">My Orders</div>
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#/wishlist';
            }}
            className="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <div className="text-lg font-bold leading-tight">{wishlist.length}</div>
            <div className="text-[11px] opacity-90">Wishlist</div>
          </button>
        </div>
      </div>

      {/* Account Menu */}
      <div className="bg-white rounded-lg border border-[#e0e0e0] divide-y divide-[#e0e0e0] shadow-xs">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/orders';
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm text-[#212121]">
            <Package className="w-4 h-4 text-[#f85606]" />
            <span className="font-medium">My Orders</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.hash = '#/wishlist';
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm text-[#212121]">
            <Heart className="w-4 h-4 text-[#e91e63]" />
            <span className="font-medium">My Wishlist</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => openSheet('editProfile')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm text-[#212121]">
            <UserCheck className="w-4 h-4 text-[#2e7d32]" />
            <span className="font-medium">Edit Profile & Address</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => openSheet('changePassword')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm text-[#212121]">
            <KeyRound className="w-4 h-4 text-[#7e57c2]" />
            <span className="font-medium">Change Password</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={() => openSheet('help')}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm text-[#212121]">
            <HelpCircle className="w-4 h-4 text-[#1a535c]" />
            <span className="font-medium">Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <a
          href="/DinStore.html"
          target="_blank"
          rel="noreferrer"
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm text-[#212121]">
            <FileCode className="w-4 h-4 text-amber-600" />
            <div>
              <span className="font-medium block">Standalone File (DinStore.html)</span>
              <span className="text-[11px] text-[#757575]">Single-file offline / Firestore deliverable</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </a>

        <button
          type="button"
          onClick={logoutUser}
          className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-red-50 text-[#d32f2f] transition-colors"
        >
          <LogOut className="w-4 h-4 text-[#d32f2f]" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};
