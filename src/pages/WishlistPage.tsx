import React from 'react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { Heart } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, products } = useStore();

  const wishedProducts = wishlist
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <div className="space-y-4 page-enter pb-16">
      <div className="bg-white p-3.5 rounded-lg border border-[#e0e0e0] flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-base font-bold text-[#212121]">My Wishlist</h1>
          <p className="text-xs text-[#757575]">Items you have saved for later</p>
        </div>
        <span className="text-xs font-semibold text-[#f85606] bg-[#fff4ee] px-2.5 py-1 rounded-full border border-[#f85606]/30">
          {wishedProducts.length} items
        </span>
      </div>

      {wishedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {wishedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-10 text-center border border-[#e0e0e0] my-6 shadow-xs">
          <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#e91e63]">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-[#212121] mb-1">Your wishlist is empty</h2>
          <p className="text-xs text-[#757575] max-w-xs mx-auto mb-4">
            Tap the heart icon on any product to save it here for future shopping.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#/';
            }}
            className="bg-[#f85606] hover:bg-[#d94a04] text-white font-bold text-xs px-6 py-2.5 rounded shadow-xs"
          >
            Browse Products
          </button>
        </div>
      )}
    </div>
  );
};
