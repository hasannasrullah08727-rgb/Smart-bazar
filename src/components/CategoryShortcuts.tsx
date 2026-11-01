import React from 'react';
import { Store, Shirt, Sparkles, Gamepad2, Armchair, Trophy, Percent } from 'lucide-react';

const CATEGORY_ITEMS = [
  { name: 'Mart', icon: Store, color: '#ff6b6b', iconColor: '#ffffff' },
  { name: 'Fashion', icon: Shirt, color: '#4ecdc4', iconColor: '#ffffff' },
  { name: 'Beauty', icon: Sparkles, color: '#ffe66d', iconColor: '#212121' },
  { name: 'Gadgets', icon: Gamepad2, color: '#1a535c', iconColor: '#ffffff' },
  { name: 'Home', icon: Armchair, color: '#7e57c2', iconColor: '#ffffff' },
  { name: 'Sports', icon: Trophy, color: '#42a5f5', iconColor: '#ffffff' },
  { name: 'Offers', icon: Percent, color: '#f85606', iconColor: '#ffffff' },
];

export const CategoryShortcuts: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-3 shadow-xs border border-[#e0e0e0]">
      <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
        {CATEGORY_ITEMS.map((cat) => {
          const IconComp = cat.icon;
          return (
            <button
              key={cat.name}
              type="button"
              onClick={() => {
                window.location.hash = `#/list?cat=${encodeURIComponent(cat.name)}`;
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div
                className="w-[45px] h-[45px] rounded-full flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundColor: cat.color }}
              >
                <IconComp className="w-5 h-5" style={{ color: cat.iconColor }} />
              </div>
              <span className="text-[12px] font-medium text-[#212121] group-hover:text-[#f85606] transition-colors">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
