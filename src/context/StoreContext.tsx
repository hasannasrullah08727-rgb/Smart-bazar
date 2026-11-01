import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, User, Settings, Coupon, Review, Message } from '../types/store';
import { SEED_PRODUCTS, DEFAULT_SETTINGS, DEFAULT_COUPONS } from '../data/seedProducts';
import { calcCoupon } from '../utils/logic';

export interface ToastMessage {
  id: number;
  text: string;
}

export type SheetType = 'help' | 'filter' | 'review' | 'editProfile' | 'changePassword' | null;

interface StoreContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  currentUser: User | null;
  users: User[];
  reviews: Record<string, Review[]>;
  recentViews: string[];
  recentSearches: string[];
  coupon: string;
  settings: Settings;
  coupons: Coupon[];
  activeSheet: SheetType;
  sheetData: any;
  toasts: ToastMessage[];
  showToast: (text: string) => void;
  openSheet: (type: SheetType, data?: any) => void;
  closeSheet: () => void;
  addToCart: (productId: string, qty?: number, opt?: string) => boolean;
  updateCartQty: (productId: string, opt: string | undefined, newQty: number) => void;
  removeFromCart: (productId: string, opt?: string) => void;
  moveToWishlist: (productId: string, opt?: string) => void;
  toggleWishlist: (productId: string) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  trackRecentView: (productId: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  placeOrder: (orderData: Omit<Order, 'id' | 't' | 'hist'>) => Order;
  cancelOrder: (orderId: string) => boolean;
  reorder: (orderId: string) => void;
  loginUser: (user: User) => void;
  logoutUser: () => void;
  updateUserProfile: (name: string, phone: string, district: string, address: string) => void;
  changeUserPassword: (currentPass: string, newPass: string) => Promise<boolean>;
  registerUser: (name: string, login: string, pass: string, phone: string) => Promise<boolean>;
  addReview: (productId: string, rating: number, text: string) => boolean;
  sendMessage: (name: string, phone: string, message: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LS_PREFIX = 'as_';

function safeGetStorage<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(LS_PREFIX + key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage key ${key}:`, e);
    return fallback;
  }
}

function safeSetStorage(key: string, value: any) {
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving to localStorage key ${key}:`, e);
  }
}

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => safeGetStorage('products', SEED_PRODUCTS));
  const [cart, setCart] = useState<CartItem[]>(() => safeGetStorage('cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => safeGetStorage('wish', []));
  const [orders, setOrders] = useState<Order[]>(() => safeGetStorage('orders', []));
  const [users, setUsers] = useState<User[]>(() => safeGetStorage('users', []));
  const [sessionUid, setSessionUid] = useState<string | null>(() => safeGetStorage('session', null));
  const [reviews, setReviews] = useState<Record<string, Review[]>>(() => safeGetStorage('reviews', {}));
  const [recentViews, setRecentViews] = useState<string[]>(() => safeGetStorage('recent', []));
  const [recentSearches, setRecentSearches] = useState<string[]>(() => safeGetStorage('searches', []));
  const [coupon, setCoupon] = useState<string>(() => safeGetStorage('coupon', ''));
  const [settings, setSettings] = useState<Settings>(() => safeGetStorage('settings', DEFAULT_SETTINGS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => safeGetStorage('coupons', DEFAULT_COUPONS));
  const [messages, setMessages] = useState<Message[]>(() => safeGetStorage('msgs', []));

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [sheetData, setSheetData] = useState<any>(null);

  // Sync state to localStorage
  useEffect(() => { safeSetStorage('products', products); }, [products]);
  useEffect(() => { safeSetStorage('cart', cart); }, [cart]);
  useEffect(() => { safeSetStorage('wish', wishlist); }, [wishlist]);
  useEffect(() => { safeSetStorage('orders', orders); }, [orders]);
  useEffect(() => { safeSetStorage('users', users); }, [users]);
  useEffect(() => { safeSetStorage('session', sessionUid); }, [sessionUid]);
  useEffect(() => { safeSetStorage('reviews', reviews); }, [reviews]);
  useEffect(() => { safeSetStorage('recent', recentViews); }, [recentViews]);
  useEffect(() => { safeSetStorage('searches', recentSearches); }, [recentSearches]);
  useEffect(() => { safeSetStorage('coupon', coupon); }, [coupon]);
  useEffect(() => { safeSetStorage('settings', settings); }, [settings]);
  useEffect(() => { safeSetStorage('coupons', coupons); }, [coupons]);
  useEffect(() => { safeSetStorage('msgs', messages); }, [messages]);

  const currentUser = users.find((u) => u.id === sessionUid) || null;

  const showToast = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2200);
  };

  const openSheet = (type: SheetType, data?: any) => {
    setActiveSheet(type);
    setSheetData(data || null);
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setSheetData(null);
  };

  const addToCart = (productId: string, qty = 1, opt?: string): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;
    if (product.stock <= 0) {
      showToast('Out of stock');
      return false;
    }
    if (product.options && product.options.length > 0 && !opt) {
      showToast('Please select an option');
      return false;
    }

    const existingIndex = cart.findIndex((item) => item.id === productId && (item.opt || '') === (opt || ''));
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].qty;
      if (currentQty + qty > product.stock) {
        showToast(`Only ${product.stock} in stock`);
        return false;
      }
      const updated = [...cart];
      updated[existingIndex].qty += qty;
      setCart(updated);
      showToast('Added to cart');
      return true;
    } else {
      if (qty > product.stock) {
        showToast(`Only ${product.stock} in stock`);
        return false;
      }
      setCart([...cart, { id: productId, qty, opt }]);
      showToast('Added to cart');
      return true;
    }
  };

  const updateCartQty = (productId: string, opt: string | undefined, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (newQty < 1) return;
    if (newQty > product.stock) {
      showToast(`Only ${product.stock} in stock`);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId && (item.opt || '') === (opt || '')) {
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, opt?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && (item.opt || '') === (opt || ''))));
    showToast('Removed from cart');
  };

  const moveToWishlist = (productId: string, opt?: string) => {
    if (!wishlist.includes(productId)) {
      setWishlist((prev) => [...prev, productId]);
    }
    removeFromCart(productId, opt);
    showToast('Moved to wishlist');
  };

  const toggleWishlist = (productId: string) => {
    if (wishlist.includes(productId)) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast('Removed from wishlist');
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast('Added to wishlist');
    }
  };

  const applyCoupon = (code: string): boolean => {
    const res = calcCoupon(code, 1000, coupons);
    if (!res.valid) {
      showToast(res.error || 'Invalid coupon code');
      return false;
    }
    setCoupon(code.toUpperCase().trim());
    showToast(`Coupon ${code.toUpperCase()} applied to your cart`);
    return true;
  };

  const removeCoupon = () => {
    setCoupon('');
    showToast('Coupon removed');
  };

  const trackRecentView = (productId: string) => {
    setRecentViews((prev) => {
      const filtered = prev.filter((id) => id !== productId);
      return [productId, ...filtered].slice(0, 12);
    });
  };

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 6);
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const placeOrder = (orderData: Omit<Order, 'id' | 't' | 'hist'>): Order => {
    const timeSlice = Date.now().toString(36).toUpperCase().slice(-6);
    const rand = Math.floor(10 + Math.random() * 90);
    const orderId = `AS${timeSlice}${rand}`;
    const t = Date.now();

    const newOrder: Order = {
      ...orderData,
      id: orderId,
      t,
      status: 'Pending',
      hist: [{ s: 'Pending', t, note: 'Order placed by customer' }],
    };

    // Decrement product stocks
    setProducts((prev) =>
      prev.map((p) => {
        const orderedItem = orderData.items.find((item) => item.id === p.id);
        if (orderedItem) {
          return { ...p, stock: Math.max(0, p.stock - orderedItem.qty) };
        }
        return p;
      })
    );

    // Save defaults to user profile if logged in
    if (currentUser) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === currentUser.id) {
            return {
              ...u,
              name: orderData.ship.name || u.name,
              phone: orderData.ship.phone || u.phone,
              district: orderData.ship.district || u.district,
              address: orderData.ship.address || u.address,
            };
          }
          return u;
        })
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setCoupon('');
    return newOrder;
  };

  const cancelOrder = (orderId: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;
    if (order.status !== 'Pending' && order.status !== 'Confirmed') {
      showToast('Order cannot be cancelled at this stage');
      return false;
    }

    // Restore stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = order.items.find((i) => i.id === p.id);
        if (item) {
          return { ...p, stock: p.stock + item.qty };
        }
        return p;
      })
    );

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'Cancelled',
            hist: [...o.hist, { s: 'Cancelled', t: Date.now(), note: 'Cancelled by customer' }],
          };
        }
        return o;
      })
    );

    showToast('Order cancelled');
    return true;
  };

  const reorder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    let addedCount = 0;
    order.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.id);
      if (p && p.stock > 0) {
        addToCart(p.id, Math.min(item.qty, p.stock), item.opt);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      showToast('Items added to cart');
      window.location.hash = '#/cart';
    } else {
      showToast('Items are currently out of stock');
    }
  };

  const loginUser = (user: User) => {
    setSessionUid(user.id);
    showToast(`Welcome back, ${user.name}`);
  };

  const logoutUser = () => {
    setSessionUid(null);
    showToast('Logged out');
    window.location.hash = '#/';
  };

  const updateUserProfile = (name: string, phone: string, district: string, address: string) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, name, phone, district, address };
        }
        return u;
      })
    );
    showToast('Profile updated');
    closeSheet();
  };

  const hashPassword = async (pass: string): Promise<string> => {
    try {
      const msgBuffer = new TextEncoder().encode(pass);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      return btoa(pass);
    }
  };

  const changeUserPassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser) return false;
    const currentHash = await hashPassword(currentPass);
    if (currentUser.pass !== currentHash) {
      showToast('Current password is wrong');
      return false;
    }
    const newHash = await hashPassword(newPass);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, pass: newHash };
        }
        return u;
      })
    );
    showToast('Password changed');
    closeSheet();
    return true;
  };

  const registerUser = async (name: string, login: string, pass: string, phone: string): Promise<boolean> => {
    const normLogin = login.trim().toLowerCase();
    if (users.some((u) => u.login.toLowerCase() === normLogin || u.phone === phone)) {
      showToast('This account already exists');
      return false;
    }
    const hashedPass = await hashPassword(pass);
    const newUser: User = {
      id: 'u' + Date.now(),
      name,
      login: normLogin,
      pass: hashedPass,
      role: 'user',
      phone,
      address: '',
      district: 'Dhaka',
      joined: Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
    setSessionUid(newUser.id);
    showToast('Account created');
    return true;
  };

  const addReview = (productId: string, rating: number, text: string): boolean => {
    if (!currentUser) {
      showToast('Please login to write a review');
      return false;
    }
    const productReviews = reviews[productId] || [];
    if (productReviews.some((r) => r.userId === currentUser.id)) {
      showToast('You have already reviewed this product');
      return false;
    }

    // Check if user has a Delivered order containing this product
    const verified = orders.some(
      (o) => o.uid === currentUser.id && o.status === 'Delivered' && o.items.some((i) => i.id === productId)
    );

    const newRev: Review = {
      id: 'rev' + Date.now(),
      productId,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      text,
      verified,
      date: Date.now(),
    };

    const updatedReviews = [newRev, ...productReviews];
    setReviews((prev) => ({ ...prev, [productId]: updatedReviews }));

    // Update product rating and review count
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const allRatings = [rating, ...productReviews.map((r) => r.rating)];
          const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
          return {
            ...p,
            rating: Math.round(avg * 10) / 10,
            reviewCount: p.reviewCount + 1,
          };
        }
        return p;
      })
    );

    showToast('Thanks for your review!');
    closeSheet();
    return true;
  };

  const sendMessage = (name: string, phone: string, message: string) => {
    const newMsg: Message = {
      id: 'msg' + Date.now(),
      name,
      phone,
      message,
      date: Date.now(),
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast('Message sent. We will contact you soon.');
    closeSheet();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        cart,
        wishlist,
        orders,
        currentUser,
        users,
        reviews,
        recentViews,
        recentSearches,
        coupon,
        settings,
        coupons,
        activeSheet,
        sheetData,
        toasts,
        showToast,
        openSheet,
        closeSheet,
        addToCart,
        updateCartQty,
        removeFromCart,
        moveToWishlist,
        toggleWishlist,
        applyCoupon,
        removeCoupon,
        trackRecentView,
        addRecentSearch,
        clearRecentSearches,
        placeOrder,
        cancelOrder,
        reorder,
        loginUser,
        logoutUser,
        updateUserProfile,
        changeUserPassword,
        registerUser,
        addReview,
        sendMessage,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
