import React from 'react';
import { useStore } from '../context/StoreContext';
import { Store, Shirt, Sparkles, Gamepad2, Armchair, Trophy, Percent, LayoutGrid } from 'lucide-react';
import { calcDiscount } from '../utils/logic';

const CATEGORY_MAP = [
  { name: 'All Products', query: 'All', icon: LayoutGrid, color: '#f85606', iconColor: '#ffffff' },
  { name: 'Mart', query: 'Mart', icon: Store, color: '#ff6b6b', iconColor: '#ffffff' },
  { name: 'Fashion', query: 'Fashion', icon: Shirt, color: '#4ecdc4', iconColor: '#ffffff' },
  { name: 'Beauty', query: 'Beauty', icon: Sparkles, color: '#ffe66d', iconColor: '#212121' },
  { name: 'Gadgets', query: 'Gadgets', icon: Gamepad2, color: '#1a535c', iconColor: '#ffffff' },
  { name: 'Home', query: 'Home', icon: Armchair, color: '#7e57c2', iconColor: '#ffffff' },
  { name: 'Sports', query: 'Sports', icon: Trophy, color: '#42a5f5', iconColor: '#ffffff' },
  { name: 'Offers', query: 'Offers', icon: Percent, color: '#f85606', iconColor: '#ffffff' },
];

export const ExplorePage: React.FC = () => {
  const { products } = useStore();

  const getCount = (catQuery: string) => {
    if (catQuery === 'All') return products.length;
    if (catQuery === 'Offers') {
      return products.filter((p) => calcDiscount(p.price, p.oldPrice) >= 30).length;
    }
    return products.filter((p) => p.category.toLowerCase() === catQuery.toLowerCase()).length;
  };

  return (
    <div className="space-y-4 page-enter">
      <div className="bg-white p-3.5 rounded-lg border border-[#e0e0e0] shadow-xs">
        <h1 className="text-lg font-bold text-[#212121]">Categories</h1>
        <p className="text-xs text-[#757575] mt-0.5">Explore by department and discover curated deals</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CATEGORY_MAP.map((item) => {
          const IconComp = item.icon;
          const count = getCount(item.query);

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                window.location.hash = item.query === 'All' ? '#/list' : `#/list?cat=${encodeURIComponent(item.query)}`;
              }}
              className="bg-white rounded-lg p-4 border border-[#e0e0e0] hover:border-[#f85606] shadow-xs hover:shadow-md transition-all flex flex-col items-center text-center group active:scale-95"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xs mb-3 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: item.color }}
              >
                <IconComp className="w-6 h-6" style={{ color: item.iconColor }} />
              </div>
              <h3 className="font-bold text-sm text-[#212121] group-hover:text-[#f85606] transition-colors mb-0.5">
                {item.name}
              </h3>
              <span className="text-xs text-[#757575]">{count} items</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
