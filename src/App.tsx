import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Footer } from './components/Footer';
import { Sheets } from './components/Sheets';

import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ListPage } from './pages/ListPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { AccountPage } from './pages/AccountPage';
import { LoginPage } from './pages/LoginPage';

function MainRouter() {
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || '#/');
  const [isReady, setIsReady] = useState(false);
  const { toasts } = useStore();

  useEffect(() => {
    // Initial simulated hydration
    const timer = setTimeout(() => setIsReady(true), 150);

    const onHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };

    window.addEventListener('hashchange', onHashChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  // Parse path and query
  const cleanHash = currentHash.startsWith('#') ? currentHash.slice(1) : currentHash;
  const [path, queryString] = cleanHash.split('?');

  const renderContent = () => {
    if (!isReady) {
      return (
        <div className="space-y-4 py-4 max-w-[900px] mx-auto">
          {/* Skeleton Banner */}
          <div className="w-full h-[160px] sk rounded-lg" />
          {/* Skeleton Category Row */}
          <div className="w-full h-[65px] sk rounded-lg" />
          {/* Skeleton Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[250px] sk rounded-[4px]" />
            ))}
          </div>
        </div>
      );
    }

    if (path === '/' || path === '') {
      return <HomePage />;
    }
    if (path === '/explore') {
      return <ExplorePage />;
    }
    if (path === '/list') {
      return <ListPage queryString={queryString} />;
    }
    if (path.startsWith('/product/')) {
      const id = path.replace('/product/', '');
      return <ProductPage productId={id} />;
    }
    if (path === '/cart') {
      return <CartPage />;
    }
    if (path === '/checkout') {
      return <CheckoutPage />;
    }
    if (path === '/orders') {
      return <OrdersPage />;
    }
    if (path.startsWith('/order/')) {
      const id = path.replace('/order/', '');
      const isNew = new URLSearchParams(queryString || '').get('new') === '1';
      return <OrderDetailPage orderId={id} isNew={isNew} />;
    }
    if (path === '/wishlist') {
      return <WishlistPage />;
    }
    if (path === '/account') {
      return <AccountPage />;
    }
    if (path === '/login') {
      return <LoginPage queryString={queryString} />;
    }

    // Default fallback to Home
    return <HomePage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] text-[#212121]">
      {/* Sticky Header */}
      <Header currentPath={currentHash} />

      {/* Main Content Area */}
      <main id="app" className="max-w-[900px] w-full min-h-[70vh] pb-[80px] mx-auto px-2 sm:px-4 pt-3 flex-1">
        {renderContent()}
      </main>

      {/* Footer */}
      {isReady && <Footer />}

      {/* Fixed Bottom Navigation */}
      <BottomNav currentPath={currentHash} />

      {/* Bottom Sheets (Modal) */}
      <Sheets />

      {/* Floating Toasts */}
      <div id="toast" className="fixed bottom-16 left-0 right-0 z-50 pointer-events-none flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-[#212121]/90 backdrop-blur-xs text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg border border-white/10 animate-fade-in pointer-events-auto max-w-sm text-center"
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
