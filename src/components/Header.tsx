import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, Mic, ShoppingCart, MessageCircleQuestion, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPath }) => {
  const { cart, openSheet, showToast, recentSearches, products, addRecentSearch } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [badgeAnimated, setBadgeAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHome = currentPath === '#/' || currentPath === '' || currentPath === '#';
  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Animate badge when total items change
  useEffect(() => {
    if (totalCartCount > 0) {
      setBadgeAnimated(true);
      const timer = setTimeout(() => setBadgeAnimated(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalCartCount]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice search is not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      showToast('Listening...');
      recognition.start();

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          executeSearch(transcript);
        } else {
          showToast('Could not hear you');
        }
      };

      recognition.onerror = () => {
        showToast('Could not hear you');
      };
    } catch (err) {
      showToast('Could not hear you');
    }
  };

  const executeSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      addRecentSearch(trimmed);
      setShowDropdown(false);
      window.location.hash = `#/list?q=${encodeURIComponent(trimmed)}`;
    }
  };

  const matchingProducts = searchQuery.trim()
    ? products
        .filter((p) =>
          `${p.name} ${p.brand}`.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
        .slice(0, 6)
    : [];

  return (
    <header className="top-header sticky top-0 z-50 bg-white border-b border-[#e0e0e0] shadow-xs px-3 py-2.5">
      <div className="max-w-[900px] mx-auto flex items-center gap-2" ref={containerRef}>
        {!isHome && (
          <button
            onClick={() => window.history.back()}
            className="p-1.5 -ml-1 text-[#212121] hover:text-[#f85606] transition-colors rounded-full active:bg-gray-100"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="relative flex-1">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeSearch(searchQuery);
            }}
            className="flex items-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg px-2.5 py-1.5 focus-within:border-[#f85606] focus-within:bg-white transition-all"
          >
            <Search className="w-4 h-4 text-[#757575] mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search in Smart Bazar"
              className="w-full bg-transparent text-sm text-[#212121] placeholder-[#757575] focus:outline-none"
              aria-label="Search in Smart Bazar"
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className="p-1 text-[#757575] hover:text-[#f85606] transition-colors shrink-0 ml-1 rounded-full"
              aria-label="Voice search"
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>

          {/* Search Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 overflow-hidden divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {!searchQuery.trim() ? (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-[#757575] uppercase tracking-wider bg-gray-50 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Recent Searches
                  </div>
                  {recentSearches.length > 0 ? (
                    recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          executeSearch(term);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-[#212121] hover:bg-[#fff7f2] hover:text-[#f85606] flex items-center justify-between transition-colors"
                      >
                        <span className="truncate">{term}</span>
                        <Search className="w-3.5 h-3.5 text-[#757575]" />
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-xs text-[#757575] text-center">
                      No recent searches yet
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {matchingProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        window.location.hash = `#/product/${p.id}`;
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm text-[#212121] hover:bg-[#fff7f2] flex items-center gap-2.5 transition-colors"
                    >
                      <span className="text-lg shrink-0">{p.emoji}</span>
                      <div className="truncate flex-1">
                        <span className="font-medium text-[#212121]">{p.name}</span>
                        <span className="text-xs text-[#757575] ml-1.5">in {p.category}</span>
                      </div>
                      <span className="text-xs font-semibold text-[#f85606] shrink-0">
                        ৳{p.price}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => executeSearch(searchQuery)}
                    className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[#f85606] bg-[#fff7f2] hover:bg-[#ffebd8] flex items-center gap-2 transition-colors"
                  >
                    <Search className="w-4 h-4 text-[#f85606]" />
                    <span>Search "{searchQuery}"</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            window.location.hash = '#/cart';
          }}
          className="relative p-2 text-[#212121] hover:text-[#f85606] transition-colors rounded-full active:bg-gray-100"
          aria-label="View Shopping Cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalCartCount > 0 && (
            <span
              className={`absolute top-0 right-0 bg-[#f85606] text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-xs ${
                badgeAnimated ? 'badge-pop' : ''
              }`}
            >
              {totalCartCount > 99 ? '99+' : totalCartCount}
            </span>
          )}
        </button>

        <button
          onClick={() => openSheet('help')}
          className="p-2 text-[#212121] hover:text-[#f85606] transition-colors rounded-full active:bg-gray-100"
          aria-label="Help and Support"
        >
          <MessageCircleQuestion className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
