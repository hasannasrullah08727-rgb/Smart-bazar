import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatMoney, calcDiscount, generateSvgThumbnail } from '../utils/logic';

export const FlashSale: React.FC = () => {
  const { products } = useStore();
  const [timeLeft, setTimeLeft] = useState<{ h: string; m: string; s: string }>({
    h: '00',
    m: '00',
    s: '00',
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const eightHours = 8 * 60 * 60 * 1000;
      const target = Math.ceil(now / eightHours) * eightHours;
      const diff = Math.max(0, target - now);

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const flashProducts = products.filter((p) => p.flash && p.stock > 0);

  if (flashProducts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-3.5 border border-[#e0e0e0] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-bold text-[15px] text-[#f85606]">
            <Zap className="w-4 h-4 fill-[#f85606]" />
            <span>Flash Sale</span>
          </div>
          {/* Countdown Boxes */}
          <div className="flex items-center gap-1 text-xs font-mono font-bold">
            <span className="bg-[#f85606] text-white px-1.5 py-0.5 rounded-xs">
              {timeLeft.h}
            </span>
            <span className="text-[#f85606]">:</span>
            <span className="bg-[#f85606] text-white px-1.5 py-0.5 rounded-xs">
              {timeLeft.m}
            </span>
            <span className="text-[#f85606]">:</span>
            <span className="bg-[#f85606] text-white px-1.5 py-0.5 rounded-xs">
              {timeLeft.s}
            </span>
          </div>
        </div>

        <a
          href="#/list?cat=Offers"
          className="text-xs font-semibold text-[#f85606] border border-[#f85606] px-2 py-0.5 rounded hover:bg-[#fff7f2] flex items-center transition-colors"
        >
          Shop More <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </a>
      </div>

      {/* Horizontal List */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
        {flashProducts.map((p) => {
          const discount = calcDiscount(p.price, p.oldPrice);
          const imgSrc = p.image || generateSvgThumbnail(p.emoji, p.color);

          return (
            <div
              key={p.id}
              onClick={() => {
                window.location.hash = `#/product/${p.id}`;
              }}
              className="w-[108px] shrink-0 cursor-pointer group flex flex-col"
            >
              <div className="relative w-[108px] h-[108px] bg-gray-50 rounded border border-[#e0e0e0] overflow-hidden">
                <img
                  src={imgSrc}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = generateSvgThumbnail(p.emoji, p.color);
                  }}
                />
                {discount > 0 && (
                  <span className="absolute top-0 left-0 bg-[#f85606] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br">
                    -{discount}%
                  </span>
                )}
              </div>
              <div className="mt-1 text-center">
                <div className="font-bold text-[13px] text-[#f85606] truncate">
                  {formatMoney(p.price)}
                </div>
                {p.oldPrice > p.price && (
                  <div className="text-[10px] text-[#757575] line-through truncate">
                    {formatMoney(p.oldPrice)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
