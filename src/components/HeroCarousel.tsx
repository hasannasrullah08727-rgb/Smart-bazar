import React, { useState, useEffect } from 'react';

const SLIDES = [
  {
    bg: 'linear-gradient(120deg,#f85606,#ff9a3c)',
    title: 'Mega Sale',
    subtitle: 'Up to 60% off on top brands',
    emoji: '🛍️',
    link: '#/list?cat=Offers',
  },
  {
    bg: 'linear-gradient(120deg,#1a535c,#4ecdc4)',
    title: 'New Gadgets',
    subtitle: 'Smart watches, headphones & more',
    emoji: '⌚',
    link: '#/list?cat=Gadgets',
  },
  {
    bg: 'linear-gradient(120deg,#7e57c2,#f48fb1)',
    title: 'Fashion Week',
    subtitle: 'Fresh styles for everyone',
    emoji: '👗',
    link: '#/list?cat=Fashion',
  },
  {
    bg: 'linear-gradient(120deg,#2e7d32,#a5d6a7)',
    title: 'Daily Mart',
    subtitle: 'Groceries delivered to your door',
    emoji: '🛒',
    link: '#/list?cat=Mart',
  },
];

export const HeroCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[160px] rounded-lg overflow-hidden shadow-xs cursor-pointer select-none">
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, idx) => (
          <div
            key={idx}
            onClick={() => {
              window.location.hash = slide.link;
            }}
            className="w-full h-full shrink-0 flex items-center justify-between px-6 text-white relative overflow-hidden"
            style={{ background: slide.bg }}
          >
            <div className="max-w-[65%] z-10">
              <h2 className="text-[22px] font-bold tracking-tight drop-shadow-xs mb-1">
                {slide.title}
              </h2>
              <p className="text-xs opacity-90 mb-3 drop-shadow-xs line-clamp-1">
                {slide.subtitle}
              </p>
              <button
                type="button"
                className="bg-white text-[#212121] hover:bg-gray-100 font-semibold text-xs px-4 py-1.5 rounded-full shadow-xs active:scale-95 transition-all"
              >
                Shop Now
              </button>
            </div>
            <div className="text-[70px] leading-none shrink-0 drop-shadow-md select-none transform hover:scale-110 transition-transform">
              {slide.emoji}
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-20">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(idx);
            }}
            className={`h-2 rounded-full transition-all ${
              current === idx ? 'w-5 bg-white' : 'w-2 bg-white/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
