import React from 'react';
import { Home, Compass, ShoppingCart, User as UserIcon } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface BottomNavProps {
  currentPath: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath }) => {
  const { cart } = useStore();
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const navItems = [
    { label: 'Home', path: '#/', icon: Home, match: (p: string) => p === '#/' || p === '' || p === '#' },
    { label: 'Explore', path: '#/explore', icon: Compass, match: (p: string) => p.startsWith('#/explore') },
    { label: 'Cart', path: '#/cart', icon: ShoppingCart, match: (p: string) => p.startsWith('#/cart'), badge: totalCartCount },
    { label: 'Account', path: '#/account', icon: UserIcon, match: (p: string) => p.startsWith('#/account') || p.startsWith('#/login') || p.startsWith('#/orders') || p.startsWith('#/wishlist') },
  ];

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e0e0e0] shadow-md noprint"
    >
      <div className="max-w-[900px] mx-auto flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = item.match(currentPath);
          const IconComponent = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => {
                window.location.hash = item.path;
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                isActive ? 'text-[#f85606]' : 'text-[#757575] hover:text-[#212121]'
              }`}
              aria-label={item.label}
            >
              <div className="relative">
                <IconComponent className="w-5 h-5 mb-0.5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#f85606] text-white text-[9px] font-bold h-3.5 min-w-[14px] px-0.5 rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
