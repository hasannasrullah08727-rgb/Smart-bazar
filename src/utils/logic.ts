import { Product, Coupon, Settings } from '../types/store';
import { NEAR_DISTRICTS } from '../data/seedProducts';

export function formatMoney(amount: number): string {
  return '৳ ' + Math.round(amount || 0).toLocaleString('en-US');
}

export function calcDiscount(price: number, oldPrice?: number): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function formatDate(timestamp: number | string | Date): string {
  return new Date(timestamp).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function isValidBdMobile(mobile: string): boolean {
  if (!mobile) return false;
  const cleaned = mobile.replace(/[\s-]/g, '');
  return /^(?:\+?88)?01[3-9]\d{8}$/.test(cleaned);
}

export function normalizeLogin(login: string): string {
  if (!login) return '';
  const trimmed = login.trim().toLowerCase();
  // If it's a mobile number, strip spaces, dashes and leading +88
  if (/^(?:\+?88)?01[3-9]\d{8}$/.test(trimmed.replace(/[\s-]/g, ''))) {
    return trimmed.replace(/[\s-]/g, '').replace(/^\+?88/, '');
  }
  return trimmed;
}

export function generateSvgThumbnail(emoji: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color || '#f85606'}" />
        <stop offset="100%" stop-color="#ffffff" />
      </linearGradient>
    </defs>
    <rect width="200" height="200" rx="16" fill="url(#g)" />
    <text x="50%" y="54%" font-size="90" text-anchor="middle" dominant-baseline="central">${emoji || '🛍️'}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateOrderId(): string {
  const timeSlice = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.floor(10 + Math.random() * 90);
  return `AS${timeSlice}${rand}`;
}

export function calcCoupon(
  code: string,
  subtotal: number,
  customCoupons: Coupon[] = []
): { discount: number; type: 'pct' | 'flat' | 'ship'; error?: string; valid: boolean; coupon?: Coupon } {
  if (!code) return { discount: 0, type: 'flat', valid: false };
  const trimmed = code.trim().toUpperCase();
  const found = customCoupons.find((c) => c.code.toUpperCase() === trimmed);
  if (!found) {
    return { discount: 0, type: 'flat', error: 'Invalid coupon code', valid: false };
  }

  if (found.min && subtotal < found.min) {
    return {
      discount: 0,
      type: found.type,
      error: `Minimum order ৳${found.min} required`,
      valid: false,
      coupon: found,
    };
  }

  let discount = 0;
  if (found.type === 'pct') {
    discount = Math.round((subtotal * (found.value || 0)) / 100);
    if (found.max && discount > found.max) {
      discount = found.max;
    }
  } else if (found.type === 'flat') {
    discount = found.value || 0;
  } else if (found.type === 'ship') {
    discount = 0; // Handled in shipping fee calc
  }

  if (discount > subtotal) {
    discount = subtotal;
  }

  return { discount, type: found.type, valid: true, coupon: found };
}

export function calcShipping(
  subtotal: number,
  discount: number,
  district: string,
  couponType?: string,
  settings: Settings = { payNumber: '', phone: '', freeShip: 1500, nearFee: 60, farFee: 110 }
): number {
  if (!subtotal || subtotal <= 0 || !district) return 0;
  if (couponType === 'ship') return 0;
  if (subtotal - discount >= settings.freeShip) return 0;

  if (NEAR_DISTRICTS.includes(district)) {
    return settings.nearFee;
  }
  return settings.farFee;
}

export interface FilterOptions {
  category?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'discount';
}

export function filterProducts(products: Product[], opts: FilterOptions): Product[] {
  let list = [...products];

  // Category filter: Offers means discount >= 30%
  if (opts.category && opts.category !== 'All') {
    if (opts.category.toLowerCase() === 'offers') {
      list = list.filter((p) => calcDiscount(p.price, p.oldPrice) >= 30);
    } else {
      list = list.filter((p) => p.category.toLowerCase() === opts.category?.toLowerCase());
    }
  }

  // Search tokens: all tokens must appear in (name + brand + category)
  if (opts.query && opts.query.trim()) {
    const tokens = opts.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    list = list.filter((p) => {
      const haystack = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }

  // Price bounds
  if (opts.minPrice !== undefined && opts.minPrice !== null && !isNaN(opts.minPrice)) {
    list = list.filter((p) => p.price >= opts.minPrice!);
  }
  if (opts.maxPrice !== undefined && opts.maxPrice !== null && !isNaN(opts.maxPrice)) {
    list = list.filter((p) => p.price <= opts.maxPrice!);
  }

  // Minimum rating
  if (opts.minRating !== undefined && opts.minRating > 0) {
    list = list.filter((p) => p.rating >= opts.minRating!);
  }

  // In-stock only
  if (opts.inStockOnly) {
    list = list.filter((p) => p.stock > 0);
  }

  // Sorting
  switch (opts.sortBy) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      list.sort((a, b) => b.added - a.added);
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
    case 'discount':
      list.sort((a, b) => calcDiscount(b.price, b.oldPrice) - calcDiscount(a.price, a.oldPrice));
      break;
    case 'relevance':
    default:
      // Preserve default ranking / flash ranking
      break;
  }

  return list;
}
