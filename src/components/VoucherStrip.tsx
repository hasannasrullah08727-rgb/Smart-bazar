import React from 'react';
import { Tag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const VoucherStrip: React.FC = () => {
  const { coupons, applyCoupon, coupon: activeCoupon } = useStore();

  return (
    <div className="overflow-x-auto no-scrollbar py-1">
      <div className="flex gap-2.5">
        {coupons.map((c) => {
          const isApplied = activeCoupon === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => applyCoupon(c.code)}
              className={`min-w-[150px] shrink-0 border border-dashed rounded-lg p-2.5 text-left transition-all ${
                isApplied
                  ? 'bg-[#ffeedd] border-[#f85606] shadow-xs'
                  : 'bg-[#fff7f2] border-[#f85606]/60 hover:border-[#f85606]'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-[#f85606]" />
                <span className="font-bold text-[13px] text-[#f85606] tracking-wide">
                  {c.code}
                </span>
              </div>
              <p className="text-[11px] text-[#212121] line-clamp-1 mb-1 font-medium">
                {c.desc}
              </p>
              <div className="text-[10px] font-semibold text-[#f85606]">
                {isApplied ? '✓ Applied' : 'Tap to apply →'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
